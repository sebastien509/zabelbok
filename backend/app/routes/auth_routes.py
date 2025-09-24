# app/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.extensions import db
from app.models import User, StudentSubmission, Course, course_students
from flasgger import swag_from
from datetime import timedelta
from sqlalchemy.exc import IntegrityError
from app.utils.roles import role_required
from app.utils.logger import log_event
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# ---------- utils ----------
def slugify(s: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9\s-]', '', s or '')
    s = re.sub(r'\s+', '-', s.strip().lower())
    s = re.sub(r'-{2,}', '-', s)
    return s or 'user'

def to_public(user: User) -> dict:
    return {
        'id': user.id,
        'full_name': user.full_name,
        'bio': user.bio,
        'profile_image_url': user.profile_image_url,
        'banner_url': user.banner_url,
        'theme': user.theme,
        'color': user.color,
        'role': user.role,
        'slug': getattr(user, 'slug', None),
    }

# ---------- auth ----------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    try:
        raw_slug = data.get('slug') or slugify(data.get('full_name'))
        new_user = User(
            full_name=data['full_name'],
            email=data['email'],
            password=(data['password']),
            role=data['role'],
            school_id=data.get('school_id'),
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
        return jsonify({'error': str(e)}), 500

@auth_bp.route("/slug-available/<slug>", methods=["GET"])
def slug_available(slug):
    exists = User.query.filter_by(slug=slug).first() is not None
    return jsonify({"slug": slug, "available": (not exists)}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        if 'email' not in data or 'password' not in data:
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

# ---------- me ----------
@auth_bp.route('/me', methods=['GET'], endpoint='get_current_user_view')
@jwt_required()
@swag_from({
    'tags': ['Auth'],
    'summary': 'Get current user info',
    'description': 'Returns the current logged-in user based on the JWT token.',
    'responses': {200: {'description': 'User info retrieved successfully'}, 401: {'description': 'Missing or invalid token'}},
    'security': [{'Bearer': []}]
})
def get_current_user_view():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@auth_bp.route('/me/profile', methods=['PUT'])
@jwt_required()
def update_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    for field in ['bio', 'language', 'profile_image_url']:
        if field in data:
            setattr(user, field, data[field])

    try:
        db.session.commit()
        return jsonify({"message": "Profile updated", "user": user.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Update failed", "details": str(e)}), 500

@auth_bp.route('/me/style', methods=['PUT'], endpoint='update_style_me')
@jwt_required()
def update_style_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    if "theme" in data:   user.theme = data["theme"]
    if "color" in data:   user.color = bool(data["color"])
    if "banner_url" in data: user.banner_url = data["banner_url"]
    if "slug" in data and data["slug"]: user.slug = data["slug"]

    try:
        db.session.commit()
        return jsonify({"msg": "Style updated", "user": user.to_dict()})
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Slug already taken"}), 409

@auth_bp.route('/me/courses', methods=['GET'])
@jwt_required()
def get_user_courses():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if user.role == 'professor':
        courses = Course.query.filter_by(professor_id=user.id).all()
        if user.school_id == 1:
            courses = Course.query.filter_by(professor_id=user.id, school_id=1).all()
    elif user.role == 'student':
        courses = user.enrolled_courses if user.school_id != 1 else Course.query.filter_by(school_id=1).all()
    else:
        courses = []

    return jsonify([{
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "modules": [m.to_dict() for m in c.modules],
        "students": [s.to_dict() for s in c.students],
        "module_count": len(c.modules),
        "student_count": len(c.students)
    } for c in courses])

@auth_bp.route('/me/submissions', methods=['GET'])
@jwt_required()
def get_user_submissions():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    if user.role != 'student':
        return jsonify(message="Only students can view submissions."), 403
    submissions = StudentSubmission.query.filter_by(student_id=user.id).all()
    return jsonify([{
        "exercise_id": s.exercise_id,
        "answer_text": s.answer_text,
        "submitted_at": s.submitted_at.isoformat()
    } for s in submissions]), 200

# ---------- staff utilities ----------
@auth_bp.route('/role/<string:role>', methods=['GET'])
@jwt_required()
@role_required('admin', 'professor')
def get_users_by_role(role):
    valid_roles = ['student', 'professor', 'admin']
    if role not in valid_roles:
        return jsonify({"msg": "Invalid role."}), 400
    users = User.query.filter_by(role=role).all()
    return jsonify([u.to_dict() for u in users]), 200

@auth_bp.route('/my-students', methods=['GET'])
@jwt_required()
@role_required('professor')
def get_my_students():
    professor_id = get_jwt_identity()
    courses = Course.query.filter_by(professor_id=professor_id).all()
    course_ids = [c.id for c in courses]
    if not course_ids:
        return jsonify([]), 200
    students = db.session.query(User).join(
        course_students, User.id == course_students.c.student_id
    ).filter(
        course_students.c.course_id.in_(course_ids),
        User.role == 'student'
    ).distinct().all()
    return jsonify([s.to_dict() for s in students]), 200

# ---------- public ----------
@auth_bp.route('/creators/<int:user_id>', methods=['GET'])
@jwt_required()
def get_creator_by_id_private(user_id):
    user = User.query.get(user_id)
    if not user or user.role not in ('professor', 'creator'):
        return jsonify({'error': 'Creator not found'}), 404
    return jsonify(user.to_dict()), 200

@auth_bp.route('/public/<int:user_id>', methods=['GET'], endpoint='public_creator_by_id')
def public_creator_by_id(user_id):
    user = User.query.get(user_id)
    if not user or user.role not in ('professor', 'creator'):
        return jsonify({'error': 'Creator not found'}), 404
    return jsonify(to_public(user)), 200

@auth_bp.route('/public/slug/<slug>', methods=['GET'], endpoint='public_creator_by_slug')
def public_creator_by_slug(slug):
    user = User.query.filter_by(slug=slug).first()
    if not user or user.role not in ('professor', 'creator'):
        return jsonify({'error': 'Creator not found'}), 404
    return jsonify(to_public(user)), 200
