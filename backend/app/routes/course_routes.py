from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models import Course, User, Enrollment
from app.utils.roles import role_required

course_bp = Blueprint("course", __name__, url_prefix="/courses")


# --------- Helpers ---------
def get_current_user():
    uid = get_jwt_identity()
    return User.query.get_or_404(uid)


def as_bool(v, default=False):
    if v is None:
        return default
    if isinstance(v, bool):
        return v
    return str(v).lower() in {"1", "true", "yes", "y", "on"}


def paginate_query(q):
    """Optional pagination via ?page=&per_page=; returns (items, meta)."""
    try:
        page = max(1, int(request.args.get("page", 1)))
    except Exception:
        page = 1
    try:
        per_page = min(100, max(1, int(request.args.get("per_page", 20))))
    except Exception:
        per_page = 20

    pagination = q.paginate(page=page, per_page=per_page, error_out=False)
    meta = {
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }
    return pagination.items, meta


# ================== CREATE COURSE ==================
@course_bp.route("", methods=["POST"])
@jwt_required()
@role_required("professor", "admin")
def create_course():
    user = get_current_user()
    data = request.get_json() or {}

    title = data.get("title")
    description = data.get("description")
    # Default to user's school unless provided
    school_id = data.get("school_id", user.school_id)

    if not title or not school_id:
        return jsonify({"error": "Missing required fields: title, school_id"}), 400

    # Pricing (optional on create)
    is_paid = as_bool(data.get("is_paid"), False)
    currency = (data.get("currency") or "usd").lower()
    price_cents = int(data.get("price_cents") or 0)
    revenue_share_pct = float(data.get("revenue_share_pct") or 0.88)

    course = Course(
        title=title,
        description=description,
        school_id=school_id,
        professor_id=user.id,
        created_at=datetime.utcnow(),
        is_paid=is_paid,
        currency=currency,
        price_cents=price_cents,
        revenue_share_pct=revenue_share_pct,
        # published defaults to False
    )
    db.session.add(course)
    db.session.commit()

    # Return the creator-safe view
    return jsonify({"msg": "Course created", "course": course.to_creator_dict()}), 201


# ================== UPDATE COURSE (metadata & pricing) ==================
@course_bp.route("/<int:course_id>", methods=["PUT"])
@jwt_required()
@role_required("professor", "admin")
def update_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    # Only owner or admin can update
    if course.professor_id != user.id and user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}

    # Core fields
    course.title = data.get("title", course.title)
    course.description = data.get("description", course.description)

    # You may allow moving course across schools only for admins:
    if user.role == "admin" and data.get("school_id"):
        course.school_id = int(data["school_id"])

    # Pricing block (optional)
    if "is_paid" in data:
        course.is_paid = as_bool(data["is_paid"], course.is_paid)
    if "currency" in data and data["currency"]:
        course.currency = str(data["currency"]).lower()
    if "price_cents" in data and data["price_cents"] is not None:
        course.price_cents = max(0, int(data["price_cents"]))
    if "revenue_share_pct" in data and data["revenue_share_pct"] is not None:
        course.revenue_share_pct = float(data["revenue_share_pct"])

    db.session.commit()
    return jsonify({"msg": "Course updated", "course": course.to_creator_dict()}), 200


# ================== QUICK PRICING PATCH ==================
@course_bp.route("/<int:course_id>/pricing", methods=["PATCH"])
@jwt_required()
@role_required("professor", "admin")
def update_pricing(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if course.professor_id != user.id and user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    changed = {}

    if "is_paid" in data:
        course.is_paid = as_bool(data["is_paid"], course.is_paid)
        changed["is_paid"] = course.is_paid
    if "currency" in data and data["currency"]:
        course.currency = str(data["currency"]).lower()
        changed["currency"] = course.currency
    if "price_cents" in data and data["price_cents"] is not None:
        course.price_cents = max(0, int(data["price_cents"]))
        changed["price_cents"] = course.price_cents
    if "revenue_share_pct" in data and data["revenue_share_pct"] is not None:
        course.revenue_share_pct = float(data["revenue_share_pct"])
        changed["revenue_share_pct"] = course.revenue_share_pct

    db.session.commit()
    return jsonify({"msg": "Pricing updated", "changed": changed, "course": course.to_creator_dict()}), 200


# ================== DELETE COURSE ==================
@course_bp.route("/<int:course_id>", methods=["DELETE"])
@jwt_required()
@role_required("professor", "admin")
def delete_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if course.professor_id != user.id and user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(course)
    db.session.commit()
    return jsonify({"msg": "Course deleted"}), 200


# ================== GET COURSES (role-aware) ==================
@course_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_courses():
    """
    Admin  -> all courses
    Professor -> authored courses (creator view)
    Student -> enrolled courses (internal/general view)
    Optional pagination: ?page=1&per_page=20
    """
    user = get_current_user()

    if user.role == "admin":
        q = Course.query.options(joinedload(Course.students)).order_by(Course.created_at.desc())
        items, meta = paginate_query(q)
        return jsonify({
            "items": [c.to_dict() for c in items],
            "meta": meta
        }), 200

    elif user.role in {"professor", "creator"}:
        q = (Course.query
             .filter_by(professor_id=user.id, school_id=user.school_id)
             .options(joinedload(Course.students))
             .order_by(Course.created_at.desc()))
        items, meta = paginate_query(q)
        return jsonify({
            "items": [c.to_creator_dict() for c in items],
            "meta": meta
        }), 200

    else:  # student
        # Courses the student is enrolled in (via Enrollment)
        q = (Course.query
             .join(Enrollment, Enrollment.course_id == Course.id)
             .filter(Enrollment.user_id == user.id)
             .options(joinedload(Course.students))
             .order_by(Course.created_at.desc()))
        items, meta = paginate_query(q)
        return jsonify({
            "items": [c.to_dict() for c in items],
            "meta": meta
        }), 200


# ================== GET SINGLE COURSE (role-aware) ==================
@course_bp.route("/<int:course_id>", methods=["GET"])
@jwt_required()
def get_course_details(course_id):
    user = get_current_user()
    course = (Course.query
              .options(joinedload(Course.students))
              .get_or_404(course_id))

    # Admin sees general; owner sees creator view; student sees general if enrolled
    if user.role == "admin":
        return jsonify(course.to_dict(include_nested=True)), 200

    if user.role in {"professor", "creator"} and course.professor_id == user.id:
        return jsonify(course.to_creator_dict(include_nested=True)), 200

    # Student access check (enrolled)
    if user.role == "student":
        # Using Course.is_accessible_by helper from your model
        if course.is_accessible_by(user.id):
            return jsonify(course.to_dict(include_nested=True)), 200
        return jsonify({"error": "Unauthorized"}), 403

    # Fallback
    return jsonify({"error": "Unauthorized"}), 403


# ================== ENROLL STUDENTS (owner only) ==================
@course_bp.route("/<int:course_id>/enroll", methods=["POST"])
@jwt_required()
@role_required("professor", "admin")
def enroll_students(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if course.professor_id != user.id and user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    student_ids = data.get("student_ids", [])
    if not isinstance(student_ids, list):
        return jsonify({"error": "student_ids must be a list"}), 400

    enrolled = []
    for sid in student_ids:
        student = User.query.get(sid)
        if not student or student.role != "student":
            continue
        # must be same school
        if student.school_id != course.school_id:
            continue
        if student not in course.students:
            course.students.append(student)
            enrolled.append(sid)

    db.session.commit()
    return jsonify({
        "msg": f"{len(enrolled)} students enrolled",
        "enrolled_student_ids": enrolled
    }), 200


# ================== STUDENTS GROUPED BY COURSE (owner only) ==================
@course_bp.route("/students-by-course", methods=["GET"])
@jwt_required()
@role_required("professor", "admin")
def get_students_grouped_by_course():
    user = get_current_user()

    q = (Course.query
         .filter_by(professor_id=user.id if user.role != "admin" else None)
         .options(joinedload(Course.students))
         .order_by(Course.created_at.desc()))

    # If admin, pull all courses (or restrict by school if desired)
    if user.role == "admin":
        q = Course.query.options(joinedload(Course.students))

    courses = q.all()
    grouped = {
        c.title: [
            {"id": s.id, "full_name": s.full_name, "email": s.email}
            for s in c.students
        ]
        for c in courses
    }
    return jsonify(grouped), 200


# ================== LIST BY SCHOOL (private) ==================
@course_bp.route("/school/<int:school_id>", methods=["GET"])
@jwt_required()
def get_courses_by_school(school_id):
    q = (Course.query
         .filter_by(school_id=school_id)
         .order_by(Course.created_at.desc()))
    items, meta = paginate_query(q)
    return jsonify({
        "items": [c.to_dict() for c in items],
        "meta": meta
    }), 200


# ================== PUBLIC LISTS ==================
@course_bp.route("/public/creator/<int:professor_id>", methods=["GET"])
def get_public_courses_by_professor(professor_id):
    q = (Course.query
         .filter_by(professor_id=professor_id, published=True)
         .order_by(Course.created_at.desc()))
    items, meta = paginate_query(q)
    return jsonify({
        "items": [c.to_public_dict() for c in items],
        "meta": meta
    }), 200


@course_bp.route("/public/school/<int:school_id>", methods=["GET"])
def get_public_courses_by_school(school_id):
    q = (Course.query
         .filter_by(school_id=school_id, published=True)
         .order_by(Course.created_at.desc()))
    items, meta = paginate_query(q)
    return jsonify({
        "items": [c.to_public_dict() for c in items],
        "meta": meta
    }), 200


# ================== PUBLISH / UNPUBLISH ==================
@course_bp.route("/<int:course_id>/publish", methods=["POST"])
@jwt_required()
@role_required("professor", "admin")
def publish_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if course.professor_id != user.id and user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    # Optional guardrails
    if not course.title or not (course.modules and len(course.modules) > 0):
        return jsonify({"error": "Course must have a title and at least one module"}), 400

    course.published = True
    db.session.commit()
    return jsonify({"msg": "Course published", "course": course.to_creator_dict()}), 200


@course_bp.route("/<int:course_id>/unpublish", methods=["POST"])
@jwt_required()
@role_required("professor", "admin")
def unpublish_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if course.professor_id != user.id and user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    course.published = False
    db.session.commit()
    return jsonify({"msg": "Course unpublished", "course": course.to_creator_dict()}), 200
