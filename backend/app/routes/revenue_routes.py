# app/routes/revenue_analytics.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Course, Enrollment, Module
from sqlalchemy import func, case, literal
from decimal import Decimal, ROUND_HALF_UP

revenue_bp = Blueprint("revenue", __name__, url_prefix="/revenue")


def _has(model, name: str) -> bool:
    return hasattr(model, name) and getattr(model, name) is not None


def _safe_int(x, default=0):
    try:
        return int(x)
    except Exception:
        return default


def _decimal_pct(x):
    try:
        return Decimal(str(x))
    except Exception:
        return Decimal("0.8800")


def _paid_condition():
    """
    Works across schemas (is_paid OR payment_status OR paid_at OR amount_paid_cents OR price_cents)
    """
    if _has(Enrollment, "is_paid"):
        return Enrollment.is_paid.is_(True)

    if _has(Enrollment, "payment_status"):
        return Enrollment.payment_status.in_(["paid", "succeeded", "complete"])

    if _has(Enrollment, "paid_at"):
        return Enrollment.paid_at.isnot(None)

    if _has(Enrollment, "amount_paid_cents"):
        return Enrollment.amount_paid_cents > 0

    if _has(Enrollment, "price_cents"):
        return Enrollment.price_cents > 0

    return literal(False)


def _gross_cents_expr():
    """
    If you don't store payment amounts, gross will be 0.
    Prefer amount_paid_cents if you have it.
    """
    if _has(Enrollment, "amount_paid_cents"):
        return func.coalesce(func.sum(Enrollment.amount_paid_cents), 0)

    if _has(Enrollment, "price_cents"):
        return func.coalesce(func.sum(Enrollment.price_cents), 0)

    return literal(0)


@revenue_bp.route("/creator/summary", methods=["GET"])
@jwt_required()
def creator_revenue_summary():
    """
    Returns a summary object for the creator dashboard analytics.

    NOTE: start/end are accepted for future-proofing.
    If you do not have paid_at/created_at on Enrollment, date filtering is best-effort.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if user.role not in ("creator", "professor"):
        return jsonify({"error": "Not allowed"}), 403

    # Courses owned by this creator/professor
    courses = Course.query.filter_by(professor_id=user.id).all()
    if not courses:
        return jsonify({
            "currency": "usd",
            "totals": {
                "orders_count": 0,
                "gross_cents": 0,
                "platform_fee_cents": 0,
                "creator_earned_cents": 0,
                "refunds_cents": 0,
                "net_cents": 0
            },
            "enrollments": {"total": 0, "paid": 0, "free": 0},
            "courses": {"total": 0, "paid": 0, "free": 0, "published": 0, "drafts": 0},
        }), 200

    course_ids = [c.id for c in courses]

    # ----- module counts -----
    module_counts = {cid: 0 for cid in course_ids}
    try:
        module_rows = (
            db.session.query(
                Module.course_id.label("course_id"),
                func.count(Module.id).label("module_count")
            )
            .filter(Module.course_id.in_(course_ids))
            .group_by(Module.course_id)
            .all()
        )
        for r in module_rows:
            module_counts[r.course_id] = _safe_int(r.module_count)
    except Exception:
        pass

    # ----- enrollment aggregates (total, paid, free, gross) -----
    paid_cond = _paid_condition()
    gross_expr = _gross_cents_expr()

    total_enroll = 0
    paid_enroll = 0
    free_enroll = 0
    gross_cents_total = 0

    try:
        enroll_rows = (
            db.session.query(
                Enrollment.course_id.label("course_id"),
                func.count(func.distinct(Enrollment.student_id)).label("enrolled_count"),
                func.sum(case((paid_cond, 1), else_=0)).label("paid_students"),
                gross_expr.label("gross_cents"),
            )
            .filter(Enrollment.course_id.in_(course_ids))
            .group_by(Enrollment.course_id)
            .all()
        )

        for r in enroll_rows:
            ec = _safe_int(r.enrolled_count)
            pc = _safe_int(r.paid_students)
            gc = _safe_int(r.gross_cents)
            total_enroll += ec
            paid_enroll += pc
            free_enroll += max(0, ec - pc)
            gross_cents_total += gc

    except Exception:
        # Don't crash if Enrollment columns differ
        pass

    # ----- course stats -----
    total_courses = len(courses)
    paid_courses = sum(1 for c in courses if bool(getattr(c, "is_paid", False)))
    free_courses = total_courses - paid_courses
    published_courses = sum(1 for c in courses if bool(getattr(c, "published", False)))
    draft_courses = total_courses - published_courses

    # ----- revenue split -----
    # If you don't have money tracked, gross will be 0 and derived values will be 0.
    # Use course-level revenue_share_pct as best-effort.
    creator_earned_total = 0
    platform_fee_total = 0

    for c in courses:
        rev_share = _decimal_pct(getattr(c, "revenue_share_pct", Decimal("0.8800")))
        # course gross (if available) is in enrollment query only; for totals we already computed gross total.
        # We don't have per-course gross here without re-query; so compute totals on gross total with avg share.
        # Better: we compute per-course in /courses endpoint; summary uses sum of those per-course values.
        # We'll do that quickly here by reusing the per-course endpoint logic in-memory (minimal overhead):
        pass

    # Recompute totals by reusing per-course table computation to avoid share mismatch
    per_course_items = _creator_courses_revenue_items(course_ids, courses)
    for item in per_course_items:
        creator_earned_total += _safe_int(item.get("creator_earned_cents", 0))
        platform_fee_total += _safe_int(item.get("platform_fee_cents", 0))

    refunds_cents = 0
    net_cents = creator_earned_total - refunds_cents

    currency = "usd"
    try:
        currency = (getattr(courses[0], "currency", "usd") or "usd").lower()
    except Exception:
        pass

    return jsonify({
        "currency": currency,
        "totals": {
            "orders_count": paid_enroll,  # treat paid enrollments as orders_count
            "gross_cents": gross_cents_total,
            "platform_fee_cents": platform_fee_total,
            "creator_earned_cents": creator_earned_total,
            "refunds_cents": refunds_cents,
            "net_cents": net_cents
        },
        "enrollments": {"total": total_enroll, "paid": paid_enroll, "free": free_enroll},
        "courses": {
            "total": total_courses,
            "paid": paid_courses,
            "free": free_courses,
            "published": published_courses,
            "drafts": draft_courses
        }
    }), 200


def _creator_courses_revenue_items(course_ids, courses):
    """
    Shared logic used by both endpoints.
    Ensures course title, module_count, student_count are present.
    """
    # module counts
    module_counts = {cid: 0 for cid in course_ids}
    try:
        module_rows = (
            db.session.query(
                Module.course_id.label("course_id"),
                func.count(Module.id).label("module_count")
            )
            .filter(Module.course_id.in_(course_ids))
            .group_by(Module.course_id)
            .all()
        )
        for r in module_rows:
            module_counts[r.course_id] = _safe_int(r.module_count)
    except Exception:
        pass

    # enrollment stats
    paid_cond = _paid_condition()
    gross_expr = _gross_cents_expr()

    enrollment_stats = {cid: {"enrolled_count": 0, "paid_students": 0, "gross_cents": 0} for cid in course_ids}
    try:
        enroll_rows = (
            db.session.query(
                Enrollment.course_id.label("course_id"),
                func.count(func.distinct(Enrollment.student_id)).label("enrolled_count"),
                func.sum(case((paid_cond, 1), else_=0)).label("paid_students"),
                gross_expr.label("gross_cents"),
            )
            .filter(Enrollment.course_id.in_(course_ids))
            .group_by(Enrollment.course_id)
            .all()
        )
        for r in enroll_rows:
            enrollment_stats[r.course_id] = {
                "enrolled_count": _safe_int(r.enrolled_count),
                "paid_students": _safe_int(r.paid_students),
                "gross_cents": _safe_int(r.gross_cents),
            }
    except Exception:
        pass

    items = []
    for c in courses:
        is_paid = bool(getattr(c, "is_paid", False))
        price_cents = _safe_int(getattr(c, "price_cents", 0))
        currency = (getattr(c, "currency", "usd") or "usd").lower()

        rev_share = _decimal_pct(getattr(c, "revenue_share_pct", Decimal("0.8800")))
        stats = enrollment_stats.get(c.id, {"enrolled_count": 0, "paid_students": 0, "gross_cents": 0})
        gross_cents = _safe_int(stats.get("gross_cents", 0))

        creator_rev = (Decimal(gross_cents) * rev_share).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        creator_earned_cents = int(creator_rev)
        platform_fee_cents = max(0, gross_cents - creator_earned_cents)

        items.append({
            "course_id": c.id,
            "title": c.title,
            "is_paid": is_paid,
            "price_cents": price_cents,
            "currency": currency,

            # treat paid enrollments as "orders"
            "orders_count": _safe_int(stats.get("paid_students", 0)),

            "gross_cents": gross_cents,
            "platform_fee_cents": platform_fee_cents,
            "creator_earned_cents": creator_earned_cents,

            "student_count": _safe_int(stats.get("enrolled_count", 0)),
            "module_count": _safe_int(module_counts.get(c.id, 0)),
        })

    return items


@revenue_bp.route("/creator/courses", methods=["GET"])
@jwt_required()
def creator_courses_revenue_table():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if user.role not in ("creator", "professor"):
        return jsonify({"error": "Not allowed"}), 403

    courses = Course.query.filter_by(professor_id=user.id).all()
    if not courses:
        return jsonify({"items": []}), 200

    course_ids = [c.id for c in courses]
    items = _creator_courses_revenue_items(course_ids, courses)

    # sort by creator earned desc
    items.sort(key=lambda x: _safe_int(x.get("creator_earned_cents", 0)), reverse=True)

    return jsonify({"items": items}), 200
