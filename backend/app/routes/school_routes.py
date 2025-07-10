from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import School, User
from flask_jwt_extended import jwt_required
from app.utils.roles import role_required
from flasgger import swag_from
from datetime import datetime

school_bp = Blueprint('school', __name__, url_prefix='/schools')


# ==============================
# GET ALL SCHOOLS (with user count)
# ==============================
@school_bp.route('', methods=['GET'])
@jwt_required()
@role_required('admin')
@swag_from({
    'tags': ['Schools'],
    'summary': 'Get all schools',
    'responses': {
        200: {
            'description': 'List of schools with user count',
            'content': {
                'application/json': {
                    'example': [
                        {
                            "id": 1,
                            "name": "Port-au-Prince High",
                            "location": "Port-au-Prince",
                            "user_count": 42
                        }
                    ]
                }
            }
        }
    }
})
def get_all_schools():
    schools = School.query.all()
    school_list = []
    for school in schools:
        user_count = User.query.filter_by(school_id=school.id).count()
        school_dict = school.to_dict()
        school_dict['user_count'] = user_count
        school_list.append(school_dict)
    return jsonify(school_list), 200


# ==============================
# CREATE SCHOOL
# ==============================
@school_bp.route('', methods=['POST'])
@jwt_required()
@role_required('admin')
@swag_from({
    'tags': ['Schools'],
    'summary': 'Create a new school',
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'example': {
                    "name": "Jacmel Academy",
                    "location": "Jacmel"
                }
            }
        }
    },
    'responses': {
        201: {'description': 'School created successfully'},
        400: {'description': 'Missing required fields'}
    }
})
def create_school():
    data = request.get_json()
    name = data.get('name')
    location = data.get('location', '')

    if not name:
        return jsonify({'error': 'School name is required'}), 400

    school = School(name=name, location=location)
    db.session.add(school)
    db.session.commit()

    return jsonify({'message': 'School created', 'school': school.to_dict()}), 201


# ==============================
# DELETE SCHOOL
# ==============================
@school_bp.route('/<int:school_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
@swag_from({
    'tags': ['Schools'],
    'summary': 'Delete a school by ID',
    'parameters': [
        {
            'name': 'school_id',
            'in': 'path',
            'required': True,
            'schema': {'type': 'integer'}
        }
    ],
    'responses': {
        200: {'description': 'School deleted successfully'},
        404: {'description': 'School not found'}
    }
})
def delete_school(school_id):
    school = School.query.get_or_404(school_id)
    db.session.delete(school)
    db.session.commit()
    return jsonify({'message': f'School {school.name} deleted'}), 200
