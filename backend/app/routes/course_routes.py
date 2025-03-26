from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Course
from app.utils.roles import role_required
from flasgger import swag_from

course_bp = Blueprint('course', __name__, url_prefix='/courses')

@course_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Courses'],
    'summary': 'Create a new course',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'properties': {
                    'title': {'type': 'string'},
                    'description': {'type': 'string'},
                    'school_id': {'type': 'integer'}
                }
            }
        }
    ],
    'responses': {
        201: {
            'description': 'Course successfully created'
        }
    }
})
def create_course_view():
    from flask_jwt_extended import get_jwt_identity
    data = request.get_json()
    professor_id = int(get_jwt_identity())

    course = Course(
        title=data['title'],
        description=data.get('description'),
        school_id=data['school_id'],
        professor_id=professor_id
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({"message": "Course created", "id": course.id}), 201

@course_bp.route('/', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
@swag_from({
    'tags': ['Courses'],
    'summary': 'Get all courses',
    'responses': {
        200: {
            'description': 'A list of courses',
            'examples': {
                'application/json': [
                    {'id': 1, 'title': 'Math', 'description': 'Algebra I'}
                ]
            }
        }
    }
})
def get_all_courses_view():
    courses = Course.query.all()
    result = [{
        "id": c.id,
        "title": c.title,
        "description": c.description
    } for c in courses]
    return jsonify(result)

@course_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
@swag_from({
    'tags': ['Courses'],
    'summary': 'Get a single course by ID',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the course'
        }
    ],
    'responses': {
        200: {
            'description': 'Course object'
        },
        404: {
            'description': 'Course not found'
        }
    }
})
def get_single_course_view(id):
    course = Course.query.get_or_404(id)
    return jsonify({
        "id": course.id,
        "title": course.title,
        "description": course.description
    })

@course_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Courses'],
    'summary': 'Update a course',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the course to update'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'properties': {
                    'title': {'type': 'string'},
                    'description': {'type': 'string'}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Course successfully updated'
        }
    }
})
def update_course_view(id):
    data = request.get_json()
    course = Course.query.get_or_404(id)
    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)
    db.session.commit()
    return jsonify({"message": "Course updated"})

@course_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Courses'],
    'summary': 'Delete a course',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the course to delete'
        }
    ],
    'responses': {
        200: {
            'description': 'Course successfully deleted'
        },
        404: {
            'description': 'Course not found'
        }
    }
})
def delete_course_view(id):
    course = Course.query.get_or_404(id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"})
