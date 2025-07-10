from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Enrollment, Course, User
from datetime import datetime

enrollment_bp = Blueprint('enrollment', __name__, url_prefix='/enrollments')

@enrollment_bp.route('', methods=['POST'])
@jwt_required()
def enroll():
    user_id = get_jwt_identity()
    course_id = request.json.get('course_id')
    
    if not course_id:
        return jsonify({"error": "course_id required"}), 400

    existing = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
    if existing:
        return jsonify({"message": "Already enrolled"}), 200

    enrollment = Enrollment(user_id=user_id, course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"message": "Enrolled successfully"}), 201

@enrollment_bp.route('/me', methods=['GET'])
@jwt_required()
def my_enrollments():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    school_id = request.args.get('school_id')

    courses = user.enrolled_courses  # Assuming this is a relationship

    if school_id:
        courses = [c for c in courses if str(c.school_id) == school_id]

    return jsonify([c.to_dict() for c in courses]), 200


@enrollment_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required()
def users_in_course(course_id):
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    user_ids = [e.user_id for e in enrollments]
    return jsonify(user_ids), 200

@enrollment_bp.route('/me/e', methods=['GET'])
@jwt_required()
def my_full_enrollments():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Use user.enrollments to access the enrollment records
    return jsonify([
        {
            "id": e.id,
            "course_id": e.course_id,
            "user_id": e.user_id,
            "created_at": e.enrolled_at.isoformat()
        } for e in user.enrollments
    ])

