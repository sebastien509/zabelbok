from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.extensions import db, bcrypt
from app.models import User, StudentSubmission, Course, Enrollment  # ⬅️ removed course_students, added Enrollment
from flasgger import swag_from
from datetime import timedelta, datetime
from sqlalchemy.exc import IntegrityError
from app.utils.roles import role_required
from app.utils.logger import log_event

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
    data = request.get_json()
    try:
        # FE can send slug; if not, derive a tentative one (not guaranteeing uniqueness here)
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
            slug=raw_slug  # may be None/dup; FE should check first (see /auth/slug-available)
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

@auth_bp.route('/me/style', methods=['PUT'])
@jwt_required()
def update_style():
    user_id = get_jwt_identity()
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
    'responses': {
        200: {'description': 'List of related courses'}
    },
    'security': [{'Bearer': []}]
})
def get_user_courses():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if user.role == 'professor':
        if user.school_id == 1:  # Creator
            courses = Course.query.filter_by(professor_id=user.id, school_id=1).all()
        else:
            courses = Course.query.filter_by(professor_id=user.id).all()
    elif user.role == 'student':
        if user.school_id == 1:  # Learner
            # (optional) just learners at school 1; adjust if you only want enrolled:
            # courses = user.enrolled_courses
            courses = Course.query.filter_by(school_id=1).all()
        else:
            courses = user.enrolled_courses
    else:
        courses = []

    return jsonify([
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "modules": [m.to_dict() for m in c.modules],
            "students": [s.to_dict() for s in c.students],
            "module_count": len(c.modules),
            "student_count": len(c.students)
        }
        for c in courses
    ])

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

@auth_bp.route('/creators', methods=['GET'])
@jwt_required()
def get_all_creators():
    creators = User.query.filter_by(role='professor', school_id=1).all()
    return jsonify([{
        'id': u.id,
        'full_name': u.full_name,
        'bio': u.bio,
        'profile_image_url': u.profile_image_url
    } for u in creators]), 200

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
