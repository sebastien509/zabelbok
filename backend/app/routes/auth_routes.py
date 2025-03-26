from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.extensions import db, bcrypt
from app.models import User, Course, StudentSubmission
from flasgger import swag_from
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    user = User(
        full_name=data['full_name'],
        email=data['email'],
        password=hashed_pw,
        role=data['role'],
        school_id=data['school_id']
    )

    db.session.add(user)
    db.session.commit()
    return jsonify(message="User registered successfully"), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=1))
        return jsonify(access_token=access_token, user_id=user.id, role=user.role), 200
    else:
        return jsonify(message="Invalid credentials"), 401

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

    return jsonify({
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "school_id": user.school_id
    }), 200

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
        courses = Course.query.filter_by(professor_id=user.id).all()
    elif user.role == 'student':
        courses = user.enrolled_courses  # assuming a relationship is defined
    else:
        courses = Course.query.all()

    return jsonify([{ "id": c.id, "title": c.title } for c in courses]), 200

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
