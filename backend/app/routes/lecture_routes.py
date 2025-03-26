from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Lecture
from app.utils.roles import role_required
from flasgger import swag_from

lecture_bp = Blueprint('lecture', __name__, url_prefix='/lectures')

@lecture_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Create a new lecture',
    'parameters': [
        {
            'in': 'body',
            'name': 'body',
            'required': True,
            'schema': {
                'properties': {
                    'title': {'type': 'string'},
                    'content_url': {'type': 'string'},
                    'course_id': {'type': 'integer'}
                }
            }
        }
    ],
    'responses': {
        201: {'description': 'Lecture created'}
    }
})
def create_lecture_view():
    data = request.get_json()
    lecture = Lecture(
        title=data['title'],
        content_url=data.get('content_url'),
        course_id=data['course_id']
    )
    db.session.add(lecture)
    db.session.commit()
    return jsonify({"message": "Lecture created", "id": lecture.id}), 201

@lecture_bp.route('/', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Get all lectures',
    'responses': {
        200: {'description': 'List of lectures'}
    }
})
def get_all_lectures_view():
    lectures = Lecture.query.all()
    result = [{
        "id": l.id,
        "title": l.title,
        "content_url": l.content_url
    } for l in lectures]
    return jsonify(result)

@lecture_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Get a single lecture by ID',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Lecture found'},
        404: {'description': 'Not found'}
    }
})
def get_single_lecture_view(id):
    lecture = Lecture.query.get_or_404(id)
    return jsonify({
        "id": lecture.id,
        "title": lecture.title,
        "content_url": lecture.content_url
    })

@lecture_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Update a lecture',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {
            'properties': {
                'title': {'type': 'string'},
                'content_url': {'type': 'string'}
            }
        }}
    ],
    'responses': {
        200: {'description': 'Lecture updated'}
    }
})
def update_lecture_view(id):
    data = request.get_json()
    lecture = Lecture.query.get_or_404(id)
    lecture.title = data.get('title', lecture.title)
    lecture.content_url = data.get('content_url', lecture.content_url)
    db.session.commit()
    return jsonify({"message": "Lecture updated"})

@lecture_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Lectures'],
    'summary': 'Delete a lecture',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Lecture deleted'},
        404: {'description': 'Not found'}
    }
})
def delete_lecture_view(id):
    lecture = Lecture.query.get_or_404(id)
    db.session.delete(lecture)
    db.session.commit()
    return jsonify({"message": "Lecture deleted"})
