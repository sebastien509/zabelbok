from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.extensions import db, bcrypt
from app.models import User, StudentSubmission, Course, Enrollment, Module  # ⬅️ removed course_students, added Enrollment
from flasgger import swag_from
from datetime import timedelta, datetime
from sqlalchemy.exc import IntegrityError
from app.utils.roles import role_required
from app.utils.logger import log_event
from sqlalchemy import func, case, distinct, and_
from decimal import Decimal

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# at top
import re
def slugify(s: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9\s-]', '', s or '')
    s = re.sub(r'\s+', '-', s.strip().lower())
    s = re.sub(r'-{2,}', '-', s)
    return s or 'user'


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    # Normalize & validate
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    role = (data.get('role') or 'creator').strip()
    school_id = data.get('school_id')

    if not full_name or not email or not password:
        return jsonify({'error': 'full_name, email, and password are required'}), 422

    # Slug: FE may provide, else derive a simple one
    raw_slug = data.get('slug') or (slugify(full_name) if full_name else None)

    try:
        new_user = User(
            full_name=full_name,
            email=email,
            password_hash=bcrypt.generate_password_hash(password).decode('utf-8'),
            role=role,
            school_id=school_id,
            language='en',
            theme='theme-1',
            color=False,
            slug=raw_slug
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Email or slug already exists'}), 409
    except Exception as e:
        db.session.rollback()
        # Log but don't leak internals to client
        try:
            from flask import current_app
            current_app.logger.exception("REGISTER failed")
        except Exception:
            pass
        return jsonify({'error': 'Internal error'}), 500


@auth_bp.route("/slug-available/<slug>", methods=["GET"])
def slug_available(slug):
    exists = User.query.filter_by(slug=slug).first() is not None
    return jsonify({"slug": slug, "available": (not exists)}), 200

@auth_bp.route('/me/style', methods=['PUT'])
@jwt_required()
def update_style():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    # theme: 'theme-1' | 'theme-2' | 'theme-3'
    if "theme" in data:
        user.theme = data["theme"]
    # color: boolean → palette (False=color-1, True=color-2)
    if "color" in data:
        user.color = bool(data["color"])
    if "banner_url" in data:
        user.banner_url = data["banner_url"]
    # optional slug setter on publish
    if "slug" in data and data["slug"]:
        user.slug = data["slug"]

    try:
        db.session.commit()
        return jsonify({"msg": "Style updated", "user": user.to_dict()})
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Slug already taken"}), 409

# public by slug (safe)
@auth_bp.route('/public/slug/<slug>', methods=['GET'])
def get_public_creator_by_slug(slug):
    user = User.query.filter_by(slug=slug).first()
    if not user or user.role not in ('professor', 'creator'):
        return jsonify({'error': 'Creator not found'}), 404
    return jsonify(user.to_public_dict()), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"message": "Email and password are required"}), 400

        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.authenticate(data['password']):
            return jsonify({"message": "Invalid credentials"}), 401

        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=1),
            additional_claims={"role": user.role}
        )
        log_event(user.id, "user_logged_in")

        return jsonify({
            "access_token": access_token,
            "user_id": user.id,
            "role": user.role,
            "full_name": user.full_name
        }), 200

    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"message": "An error occurred during login"}), 500


@auth_bp.route('/me', methods=['GET'], endpoint='get_current_user_view')
@jwt_required()
@swag_from({
    'tags': ['Auth'],
    'summary': 'Get current user info',
    'description': 'Returns the current logged-in user based on the JWT token.',
    'responses': {
        200: {
            'description': 'User info retrieved successfully',
            'examples': {
                'application/json': {
                    "id": 1,
                    "full_name": "Prof. Jean",
                    "email": "prof@example.com",
                    "role": "professor",
                    "school_id": 1
                }
            }
        },
        401: {
            'description': 'Missing or invalid token'
        }
    },
    'security': [{'Bearer': []}]
})
def get_current_user_view():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())  # returns full profile including theme, banner_url, etc.


@auth_bp.route('/me/courses', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Dashboard'],
    'summary': "Get user's related courses",
    'description': 'Students see enrolled courses, professors see authored courses.',
    'responses': {200: {'description': 'List of related courses'}},
    'security': [{'Bearer': []}]
})
def get_user_courses():
    """
    Returns creator/professor-authored courses OR student-related courses.
    Adds creator-dashboard fields:
      - published (draft vs published)
      - pricing: is_paid, price_cents, currency, revenue_share_pct
      - enrolled_count, paid_students
      - gross_cents, creator_revenue_cents, platform_revenue_cents (best-effort, based on Enrollment fields)
      - module_count
    """
    from sqlalchemy import func, case, literal
    from decimal import Decimal, ROUND_HALF_UP

    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    # -----------------------------
    # Helpers (safe across schemas)
    # -----------------------------
    def _has(model, name: str) -> bool:
        return hasattr(model, name) and getattr(model, name) is not None

    def _paid_condition():
        """
        Build a SQLAlchemy boolean expression that represents 'this enrollment is paid'
        using whichever field(s) your Enrollment model actually has.
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
        Build a SQLAlchemy expression for total gross revenue (cents) from enrollments
        using whichever money column exists on Enrollment.
        """
        if _has(Enrollment, "amount_paid_cents"):
            return func.coalesce(func.sum(Enrollment.amount_paid_cents), 0)

        if _has(Enrollment, "price_cents"):
            return func.coalesce(func.sum(Enrollment.price_cents), 0)

        return literal(0)

    def _safe_int(x, default=0):
        try:
            return int(x)
        except Exception:
            return default

    def _decimal_pct(x):
        try:
            return Decimal(str(x))
        except Exception:
            return Decimal("0.8800")  # fallback default if your column is missing/None

    # -----------------------------
    # Course selection logic
    # -----------------------------
    if user.role == 'professor':
        if user.school_id == 1:  # Creator
            courses = Course.query.filter_by(professor_id=user.id, school_id=1).all()
        else:
            courses = Course.query.filter_by(professor_id=user.id).all()

    elif user.role == 'student':
        if user.school_id == 1:  # Learner (your current behavior returns all courses at school 1)
            courses = Course.query.filter_by(school_id=1).all()
        else:
            # enrolled courses
            courses = user.enrolled_courses

    else:
        courses = []

    if not courses:
        return jsonify([]), 200

    course_ids = [c.id for c in courses]

    # -----------------------------
    # Aggregates (modules + enrollments)
    # -----------------------------
    # Module counts (avoid len(c.modules) N+1)
    module_counts = {}
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
        module_counts = {r.course_id: _safe_int(r.module_count) for r in module_rows}
    except Exception:
        # If Module model name differs in your codebase, this prevents crashing.
        module_counts = {c.id: len(getattr(c, "modules", []) or []) for c in courses}

    # Enrollment aggregates (enrolled_count + paid_students + gross_cents)
    enrollment_stats = {cid: {"enrolled_count": 0, "paid_students": 0, "gross_cents": 0} for cid in course_ids}
    try:
        paid_cond = _paid_condition()
        gross_expr = _gross_cents_expr()

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
        # If Enrollment table/fields differ, don't crash endpoint
        pass

    # -----------------------------
    # Response shaping
    # -----------------------------
    result = []
    for c in courses:
        # pricing fields (best effort—works whether your Course has these or not)
        is_paid = bool(getattr(c, "is_paid", False))
        price_cents = _safe_int(getattr(c, "price_cents", 0))
        currency = (getattr(c, "currency", "usd") or "usd").lower()
        published = bool(getattr(c, "published", False))

        # revenue share
        revenue_share_pct = _decimal_pct(getattr(c, "revenue_share_pct", Decimal("0.8800")))

        stats = enrollment_stats.get(c.id, {"enrolled_count": 0, "paid_students": 0, "gross_cents": 0})
        gross_cents = _safe_int(stats.get("gross_cents", 0))

        # creator/platform split (in cents) — safe decimal math
        creator_rev = (Decimal(gross_cents) * revenue_share_pct).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        creator_revenue_cents = int(creator_rev)
        platform_revenue_cents = max(0, gross_cents - creator_revenue_cents)

        # modules list (keep for your current UI; if too heavy, remove or return only minimal fields)
        modules_list = []
        try:
            modules_list = [m.to_dict() for m in (getattr(c, "modules", []) or [])]
        except Exception:
            modules_list = []

        # students list (can be heavy; keep if you really need it)
        students_list = []
        try:
            students_list = [s.to_dict() for s in (getattr(c, "students", []) or [])]
        except Exception:
            students_list = []

        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,

            # status flags for dashboard
            "published": published,
            "status": "Published" if published else "Draft",

            # pricing block
            "is_paid": is_paid,
            "price_cents": price_cents,
            "currency": currency,
            "revenue_share_pct": str(revenue_share_pct),  # keep as string to avoid float issues

            # enrollment + revenue stats
            "student_count": _safe_int(stats.get("enrolled_count", 0)),
            "paid_students": _safe_int(stats.get("paid_students", 0)),
            "gross_cents": gross_cents,
            "creator_revenue_cents": creator_revenue_cents,
            "platform_revenue_cents": platform_revenue_cents,

            # modules info
            "module_count": module_counts.get(c.id, 0),
            "modules": modules_list,

            # optional (remove if payload too large)
            "students": students_list,
        })

    # sort newest first if you have created_at
    try:
        result.sort(key=lambda x: (x.get("published", False), x.get("id", 0)), reverse=True)
    except Exception:
        pass

    return jsonify(result), 200


@auth_bp.route('/me/submissions', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Dashboard'],
    'summary': "Get user's exercise submissions",
    'description': 'Only students can view their own submissions.',
    'responses': {
        200: {'description': 'List of submissions'}
    },
    'security': [{'Bearer': []}]
})
def get_user_submissions():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if user.role != 'student':
        return jsonify(message="Only students can view submissions."), 403

    submissions = StudentSubmission.query.filter_by(student_id=user.id).all()
    return jsonify([
        {
            "exercise_id": s.exercise_id,
            "answer_text": s.answer_text,
            "submitted_at": s.submitted_at.isoformat()
        } for s in submissions
    ]), 200

# ================== GET ALL USERS BY ROLE ==================
@auth_bp.route('/role/<string:role>', methods=['GET'])
@jwt_required()
@role_required('admin', 'professor')  # Only admin and professors can list users
@swag_from({
    'tags': ['Users'],
    'summary': 'Get all users by role',
    'parameters': [
        {
            'name': 'role',
            'in': 'path',
            'required': True,
            'schema': {'type': 'string', 'enum': ['student', 'professor', 'admin']}
        }
    ],
    'responses': {
        '200': {'description': 'List of users by role'},
        '400': {'description': 'Invalid role'}
    }
})
def get_users_by_role(role):
    valid_roles = ['student', 'professor', 'admin']
    if role not in valid_roles:
        return jsonify({"msg": "Invalid role."}), 400

    users = User.query.filter_by(role=role).all()
    return jsonify([u.to_dict() for u in users]), 200

@auth_bp.route('/my-students', methods=['GET'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Users'],
    'summary': 'Get all students enrolled in professor’s courses',
    'responses': {
        '200': {'description': 'List of enrolled students'},
        '403': {'description': 'Forbidden'}
    }
})
def get_my_students():
    professor_id = int(get_jwt_identity())

    # Step 1: Get all course IDs taught by the professor
    courses = Course.query.filter_by(professor_id=professor_id).all()
    course_ids = [c.id for c in courses]

    if not course_ids:
        return jsonify([]), 200

    # Step 2: Query all students enrolled in those courses using Enrollment model
    students = (
        db.session.query(User)
        .join(Enrollment, Enrollment.user_id == User.id)
        .filter(Enrollment.course_id.in_(course_ids), User.role == 'student')
        .distinct()
        .all()
    )

    return jsonify([s.to_dict() for s in students]), 200

@auth_bp.route('/me/profile', methods=['PUT'])
@jwt_required()
def update_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    allowed_fields = ['bio', 'language', 'profile_image_url']
    
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    try:
        db.session.commit()
        return jsonify({"message": "Profile updated", "user": user.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Update failed", "details": str(e)}), 500

# @auth_bp.route('/creators', methods=['GET'])
# @jwt_required()
# def get_all_creators():
#     creators = User.query.filter_by(role='professor', school_id=1).all()
#     return jsonify([{
#         'id': u.id,
#         'full_name': u.full_name,
#         'bio': u.bio,
#         'profile_image_url': u.profile_image_url,
#         'banner_url':u.banner_url,
#         'slug': u.slug
#     } for u in creators]), 200


def as_bool(v, default=False):
    if v is None:
        return default
    if isinstance(v, bool):
        return v
    return str(v).lower() in {"1", "true", "yes", "y", "on"}

from flask import jsonify, request
from flask_jwt_extended import jwt_required



@auth_bp.route("/creators", methods=["GET"])
@jwt_required()
def get_creators():
    """
    GET /auth/creators?school_id=1&page=1&per_page=20&include_top_courses=1&top_n=3

    Returns:
    - creator-safe profile fields
    - published_courses_count
    - unique_learners_count (distinct enrolled students across their published courses)
    - optional: top published courses (public dict)
    """

    school_id = request.args.get("school_id", type=int)  # optional
    page = request.args.get("page", default=1, type=int)
    per_page = min(100, max(1, request.args.get("per_page", default=20, type=int)))

    include_top = as_bool(request.args.get("include_top_courses", "1"), True)
    top_n = min(10, max(0, request.args.get("top_n", default=3, type=int)))

    # -------------------------
    # Aggregated creators query
    # -------------------------
    q = (
        db.session.query(
            User.id.label("id"),
            User.full_name.label("full_name"),
            User.bio.label("bio"),
            User.profile_image_url.label("profile_image_url"),
            User.banner_url.label("banner_url"),
            User.slug.label("slug"),
            User.school_id.label("school_id"),
            func.count(distinct(Course.id)).label("published_courses_count"),
            func.count(distinct(Enrollment.user_id)).label("unique_learners_count"),
        )
        .select_from(User)
        .outerjoin(
            Course,
            and_(
                Course.professor_id == User.id,
                Course.published.is_(True),  # only published courses count
            ),
        )
        .outerjoin(
            Enrollment,
            Enrollment.course_id == Course.id,  # enrollments for those published courses
        )
        .filter(User.role.in_(["professor", "creator"]))  # adjust to your roles
    )

    if school_id:
        q = q.filter(User.school_id == school_id)

    q = q.group_by(User.id).order_by(
        func.count(distinct(Course.id)).desc(),
        User.full_name.asc(),
    )

    # -------------------------
    # Total count (pagination)
    # -------------------------
    total = int(db.session.query(func.count()).select_from(q.subquery()).scalar() or 0)
    pages = (total + per_page - 1) // per_page if per_page else 1

    rows = (
        q.limit(per_page)
        .offset((page - 1) * per_page)
        .all()
    )

    creator_ids = [int(r.id) for r in rows]

    # -------------------------
    # Optional: top courses map
    # -------------------------
    top_courses_map = {cid: [] for cid in creator_ids}

    if include_top and top_n > 0 and creator_ids:
        # fetch a pool then slice per creator
        pool = per_page * top_n * 3

        courses = (
            Course.query
            .filter(
                Course.professor_id.in_(creator_ids),
                Course.published.is_(True),
            )
            .order_by(Course.professor_id.asc(), Course.created_at.desc())
            .limit(pool)
            .all()
        )

        for c in courses:
            pid = int(c.professor_id)
            if pid in top_courses_map and len(top_courses_map[pid]) < top_n:
                top_courses_map[pid].append(c.to_public_dict())

    # -------------------------
    # Build response
    # -------------------------
    items = []
    for r in rows:
        payload = {
            "id": int(r.id),
            "full_name": r.full_name,
            "bio": r.bio,
            "profile_image_url": r.profile_image_url,
            "banner_url": r.banner_url,
            "slug": r.slug,
            "school_id": int(r.school_id) if r.school_id is not None else None,
            "published_courses_count": int(r.published_courses_count or 0),
            "unique_learners_count": int(r.unique_learners_count or 0),
        }

        if include_top:
            payload["top_courses"] = top_courses_map.get(int(r.id), [])

        items.append(payload)

    return jsonify({
        "items": items,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
        }
    }), 200


@auth_bp.route('/creators/<int:user_id>', methods=['GET'])
@jwt_required()
def get_creator_by_id(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'professor':
        return jsonify({'error': 'Creator not found'}), 404
    return jsonify(user.to_dict()), 200

def public_creator_dict(user):
    return {
        'id': user.id,
        'full_name': user.full_name,
        'bio': user.bio,
        'profile_image_url': user.profile_image_url,
        'banner_url': user.banner_url,
        'theme': user.theme,
        'role': user.role,
    }

@auth_bp.route('/public/<int:user_id>', methods=['GET'])
def get_public_creator(user_id):
    try:
        user = User.query.get(user_id)
        if not user or user.role != 'professor':
            return jsonify({'error': 'Creator not found'}), 404
        return jsonify(public_creator_dict(user)), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
