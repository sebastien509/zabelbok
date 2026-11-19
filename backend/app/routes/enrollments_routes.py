# app/routes/enrollments_routes.py
import os
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Enrollment, Course, User, CourseCompletion, Module, ModuleProgress

# Stripe (optional)
import stripe

enrollment_bp = Blueprint("enrollment", __name__, url_prefix="/enrollments")


# ---------------- Helpers ----------------
def as_bool(v, default=False):
    if v is None:
        return default
    if isinstance(v, bool):
        return v
    return str(v).lower() in {"1", "true", "yes", "y", "on"}


def current_user():
    uid = int(get_jwt_identity())
    return User.query.get_or_404(uid)


def course_progress_for_user(course_id: int, user_id: int) -> dict:
    """
    Computes progress at module-level using ModuleProgress table.
    Safe even if no progress rows exist.
    """
    total = db.session.query(db.func.count(Module.id)).filter(Module.course_id == course_id).scalar() or 0
    completed = (
        db.session.query(db.func.count(ModuleProgress.id))
        .join(Module, ModuleProgress.module_id == Module.id)
        .filter(Module.course_id == course_id, ModuleProgress.user_id == user_id, ModuleProgress.is_completed.is_(True))
        .scalar()
        or 0
    )
    pct = int(round((completed / total) * 100)) if total > 0 else 0
    return {"pct": pct, "completed_modules": int(completed), "total_modules": int(total)}


# ---------------- Routes ----------------
@enrollment_bp.route("/me", methods=["GET"])
@jwt_required()
def my_enrollments():
    """
    GET /enrollments/me?school_id=&include_progress=1

    Returns stable shape:
    {
      "items": [
        {
          "enrollment_id": 123,
          "enrolled_at": "...",
          "completed_at": "...|null",
          "progress": { pct, completed_modules, total_modules } | null,
          "course": { course_dict ... }
        }
      ],
      "meta": { total }
    }
    """
    user = current_user()

    school_id = request.args.get("school_id", type=int)
    include_progress = as_bool(request.args.get("include_progress", "1"), True)

    q = (
        Enrollment.query
        .options(joinedload(Enrollment.course).joinedload(Course.professor))
        .filter(Enrollment.user_id == user.id)
        .order_by(Enrollment.enrolled_at.desc())
    )

    if school_id:
        q = q.join(Course, Enrollment.course_id == Course.id).filter(Course.school_id == int(school_id))

    enrollments = q.all()

    completions = {
        int(c.course_id): c.completed_at
        for c in CourseCompletion.query.filter_by(user_id=user.id).all()
    }

    items = []
    for e in enrollments:
        c = e.course
        if not c:
            continue

        course_dict = c.to_dict(include_nested=False)
        course_dict["professor_name"] = c.professor.full_name if c.professor else None

        payload = {
            "enrollment_id": int(e.id),
            "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
            "completed_at": completions.get(int(c.id)).isoformat() if completions.get(int(c.id)) else None,
            "course": course_dict,
        }

        if include_progress:
            try:
                payload["progress"] = course_progress_for_user(int(c.id), int(user.id))
            except Exception:
                payload["progress"] = {"pct": 0, "completed_modules": 0, "total_modules": len(getattr(c, "modules", []) or [])}

        items.append(payload)

    return jsonify({"items": items, "meta": {"total": len(items)}}), 200


@enrollment_bp.route("/me/rows", methods=["GET"])
@jwt_required()
def my_enrollment_rows():
    """
    Raw enrollment rows if you ever need them.
    """
    user = current_user()
    return jsonify([
        {
            "id": int(e.id),
            "course_id": int(e.course_id),
            "user_id": int(e.user_id),
            "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
        } for e in (user.enrollments or [])
    ]), 200


@enrollment_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def users_in_course(course_id):
    """
    Returns list of user IDs enrolled in a course.
    (Keep for internal admin/prof checks if needed)
    """
    # NOTE: you may want to restrict this to professor/admin
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    return jsonify([int(e.user_id) for e in enrollments]), 200


@enrollment_bp.route("/complete/<int:course_id>", methods=["POST"])
@jwt_required()
def complete_course(course_id):
    user = current_user()

    # must be accessible/enrolled
    course = Course.query.get_or_404(course_id)
    if user.role == "student" and not course.is_accessible_by(user.id):
        return jsonify({"error": "Unauthorized"}), 403

    existing = CourseCompletion.query.filter_by(user_id=user.id, course_id=course_id).first()
    if existing:
        return jsonify({"message": "Already marked as completed", "completed_at": existing.completed_at.isoformat()}), 200

    completion = CourseCompletion(user_id=user.id, course_id=course_id)
    db.session.add(completion)
    db.session.commit()

    return jsonify({"message": "Course marked as completed", "completed_at": completion.completed_at.isoformat()}), 201


@enrollment_bp.route("", methods=["POST"])
@jwt_required()
def enroll():
    """
    POST /enrollments
    Body: { course_id, session_id? }

    - Free course -> enroll immediately
    - Paid course w/o session_id -> 402 + checkout_url
    - Paid course w/ session_id -> verify paid then enroll
    """
    user = current_user()
    data = request.get_json(silent=True) or {}

    course_id = data.get("course_id")
    session_id = data.get("session_id")

    if not course_id:
        return jsonify({"error": "course_id required"}), 400

    course = Course.query.get_or_404(int(course_id))

    if user.role not in {"student", "admin"}:
        return jsonify({"error": "Only learners can enroll themselves"}), 403

    # strict same-school for students
    if user.role == "student" and user.school_id != course.school_id:
        return jsonify({"error": "Course not available for your school"}), 403

    existing = Enrollment.query.filter_by(user_id=user.id, course_id=course.id).first()
    if existing:
        return jsonify({"message": "Already enrolled", "enrollment_id": int(existing.id)}), 200

    is_paid = bool(course.is_paid) and int(course.price_cents or 0) > 0

    # ---- paid flow ----
    if is_paid:
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

        if session_id:
            # verify session
            try:
                sess = stripe.checkout.Session.retrieve(str(session_id))
            except Exception as e:
                return jsonify({"error": "Invalid session_id", "detail": str(e)}), 400

            if sess.get("payment_status") != "paid":
                return jsonify({"error": "Payment not completed"}), 402

            meta = sess.get("metadata") or {}
            if str(meta.get("user_id")) != str(user.id) or str(meta.get("course_id")) != str(course.id):
                return jsonify({"error": "Session metadata mismatch"}), 400

            # proceed to enroll

        else:
            domain = (os.getenv("DOMAIN_URL") or "").rstrip("/")
            if not domain:
                return jsonify({"error": "DOMAIN_URL is not configured"}), 500

            try:
                checkout_session = stripe.checkout.Session.create(
                    mode="payment",
                    payment_method_types=["card"],
                    customer_email=user.email,
                    line_items=[{
                        "price_data": {
                            "currency": course.currency or "usd",
                            "product_data": {
                                "name": course.title,
                                "description": course.description or "",
                            },
                            "unit_amount": int(course.price_cents),
                        },
                        "quantity": 1,
                    }],
                    metadata={
                        "user_id": str(user.id),
                        "course_id": str(course.id),
                    },
                    success_url=f"{domain}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}&course_id={course.id}",
                    cancel_url=f"{domain}/dashboard?payment=cancel&course_id={course.id}",
                )

                return jsonify({
                    "payment_required": True,
                    "checkout_url": checkout_session.url,
                    "course_id": int(course.id)
                }), 402

            except Exception as e:
                return jsonify({"error": "Stripe error", "detail": str(e)}), 500

    # ---- enroll (free or verified paid) ----
    try:
        enrollment = Enrollment(user_id=user.id, course_id=course.id)
        db.session.add(enrollment)
        db.session.commit()

        return jsonify({
            "message": "Enrolled successfully",
            "enrollment_id": int(enrollment.id),
            "course": course.to_dict(include_nested=False)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Already enrolled"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Enrollment failed", "detail": str(e)}), 500
