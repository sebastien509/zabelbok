from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Lecture, User
from app.utils.roles import role_required
from flasgger import swag_from
from datetime import datetime

lecture_bp = Blueprint('lecture', __name__, url_prefix='/lectures')

# ================== CREATE LECTURE ==================
@lecture_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Create a lecture',
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'title': {'type': 'string'},
                        'content_url': {'type': 'string'},
                        'course_id': {'type': 'integer'}
                    },
                    'required': ['title', 'content_url', 'course_id']
                }
            }
        }
    },
    'responses': {
        '201': {'description': 'Lecture created successfully'},
        '400': {'description': 'Missing required fields'}
    }
})
def create_lecture():
    data = request.get_json()

    title = data.get('title')
    content_url = data.get('content_url')
    course_id = data.get('course_id')

    if not title or not content_url or not course_id:
        return jsonify({"msg": "Missing required fields."}), 400

    lecture = Lecture(
        title=title,
        content_url=content_url,
        course_id=course_id,
        created_at=datetime.utcnow()
    )

    db.session.add(lecture)
    db.session.commit()

    return jsonify({"msg": "Lecture created successfully.", "lecture_id": lecture.id}), 201

# ================== GET ALL LECTURES ==================
@lecture_bp.route('/', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Get all lectures',
    'responses': {
        '200': {'description': 'List of all lectures'}
    }
})
def get_all_lectures():
    lectures = Lecture.query.all()
    return jsonify([
        {
            "id": l.id,
            "title": l.title,
            "content_url": l.content_url,
            "course_id": l.course_id,
            "created_at": l.created_at
        } for l in lectures
    ]), 200

@lecture_bp.route('/me', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Get lectures for the current student based on enrolled courses',
    'responses': {
        '200': {'description': 'List of lectures'}
    }
})
def get_student_lectures():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if user.role != 'student':
        return jsonify({'msg': 'Only students can access this endpoint'}), 403

    # Get IDs of enrolled courses
    enrolled_course_ids = [course.id for course in user.enrolled_courses]

    # Fetch all lectures linked to those courses
    lectures = Lecture.query.filter(Lecture.course_id.in_(enrolled_course_ids)).all()

    return jsonify([
        {
            "id": lecture.id,
            "title": lecture.title,
            "content_url": lecture.content_url,
            "created_at": lecture.created_at.isoformat() if lecture.created_at else None,
            "course": {
                "id": lecture.course.id,
                "title": lecture.course.title
            }
        } for lecture in lectures
    ]), 200


# ================== DELETE LECTURE ==================
@lecture_bp.route('/<int:lecture_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Delete a lecture',
    'parameters': [
        {'name': 'lecture_id', 'in': 'path', 'required': True, 'schema': {'type': 'integer'}},
        {'name': 'Authorization', 'in': 'header', 'required': True, 'schema': {'type': 'string'}}
    ],
    'responses': {
        '200': {'description': 'Lecture deleted successfully'},
        '404': {'description': 'Lecture not found'}
    }
})
def delete_lecture(lecture_id):
    lecture = Lecture.query.get_or_404(lecture_id)

    db.session.delete(lecture)
    db.session.commit()

    return jsonify({"msg": "Lecture deleted successfully."}), 200
