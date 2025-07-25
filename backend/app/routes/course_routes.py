from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Course, Lecture, Book, Quiz, Exercise, User
from app.utils.roles import role_required
from flasgger import swag_from
from datetime import datetime

course_bp = Blueprint('course', __name__, url_prefix='/courses')

# ================== CREATE COURSE ==================
@course_bp.route('', methods=['POST'])
@jwt_required()
@role_required('professor', 'admin')
def create_course():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get('title')
    description = data.get('description')
    school_id = data.get('school_id')

    if not title or not school_id:
        return jsonify({"msg": "Missing required fields."}), 400

    course = Course(
        title=title,
        description=description,
        school_id=school_id,
        professor_id=user_id,
        created_at=datetime.utcnow()
    )
    db.session.add(course)
    db.session.commit()

    return jsonify({"msg": "Course created successfully", "course_id": course.id}), 201

# ================== UPDATE COURSE ==================
@course_bp.route('/<int:course_id>', methods=['PUT'])
@jwt_required()
@role_required('professor', 'admin')
def update_course(course_id):
    course = Course.query.get_or_404(course_id)
    data = request.get_json()

    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)

    db.session.commit()
    return jsonify({"msg": "Course updated successfully"}), 200

# ================== DELETE COURSE ==================
@course_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor', 'admin')
def delete_course(course_id):
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({"msg": "Course deleted successfully"}), 200

# ================== GET ALL COURSES ================
@course_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_courses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role == 'admin':
        courses = Course.query.all()
    elif user.role == 'professor':
        courses = Course.query.filter_by(professor_id=user_id).all()
    else:
        # student: get courses where student is enrolled
        courses = user.courses

    return jsonify([c.to_dict() for c in courses]), 200

# ================== GET SINGLE COURSE DETAILS ==================
@course_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_details(course_id):
    course = Course.query.get_or_404(course_id)

    return jsonify(course.to_dict(include_nested=True)), 200


@course_bp.route('/<int:course_id>/enroll', methods=['POST'])
@jwt_required()
@role_required('professor')
def enroll_students(course_id):
    user_id = get_jwt_identity()
    professor = User.query.get_or_404(user_id)
    
    data = request.get_json()
    student_ids = data.get('student_ids', [])

    course = Course.query.get_or_404(course_id)

    # Security: Prevent enrolling students from different schools
    if course.school_id != professor.school_id:
        return jsonify({"error": "Unauthorized to modify this course."}), 403

    enrolled = []
    for sid in student_ids:
        student = User.query.get(sid)
        if (
            student
            and student.role == 'student'
            and student.school_id == professor.school_id
            and student not in course.students
        ):
            course.students.append(student)
            enrolled.append(sid)

    db.session.commit()
    return jsonify({
        "msg": f"{len(enrolled)} students enrolled successfully.",
        "enrolled_student_ids": enrolled
    }), 200

@course_bp.route('/students-by-course', methods=['GET'])
@jwt_required()
@role_required('professor')
def get_students_grouped_by_course():
    from app.models import Course, User  # Ensure these imports exist
    professor_id = get_jwt_identity()

    courses = Course.query.filter_by(professor_id=professor_id).all()

    grouped = {}
    for course in courses:
        grouped[course.title] = [
            {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email
            } for student in course.students
        ]

    return jsonify(grouped), 200

@course_bp.route('/school/<int:school_id>', methods=['GET'])
@jwt_required()
def get_courses_by_school(school_id):
    courses = Course.query.filter_by(school_id=school_id).order_by(Course.created_at.desc()).all()
    
    if not courses:
        return jsonify({"message": "No courses found for this school."}), 404

    return jsonify([course.to_dict(include_nested=True) for course in courses]), 200

@course_bp.route('/public/creator/<int:professor_id>', methods=['GET'])
def get_public_courses_by_professor(professor_id):
    courses = Course.query.filter_by(professor_id=professor_id).order_by(Course.created_at.desc()).all()

    if not courses:
        return jsonify({"message": "No courses found for this creator."}), 404

    return jsonify([course.to_dict(include_nested=True) for course in courses]), 200

@course_bp.route('/public/school/<int:school_id>', methods=['GET'])
def get_public_courses_by_school(school_id):
    courses = Course.query.filter_by(school_id=school_id).order_by(Course.created_at.desc()).all()

    if not courses:
        return jsonify({"message": "No courses found for this school."}), 404

    return jsonify([course.to_dict(include_nested=True) for course in courses]), 200
