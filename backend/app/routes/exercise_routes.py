from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Exercise, StudentSubmission
from app.extensions import db
from app.utils.roles import role_required
from flasgger import swag_from

exercise_bp = Blueprint('exercise', __name__, url_prefix='/exercises')

@exercise_bp.route('/<int:id>/submit', methods=['POST'])
@jwt_required()
@role_required('student')
@swag_from({
    'tags': ['Exercises'],
    'summary': 'Submit an answer to an exercise',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {
            'properties': {
                'answer_text': {'type': 'string'}
            }
        }}
    ],
    'responses': {
        201: {'description': 'Submission received'}
    }
})
def submit_exercise_view(id):
    data = request.get_json()
    user_id = get_jwt_identity()
    exercise = Exercise.query.get_or_404(id)

    submission = StudentSubmission(
        student_id=user_id,
        exercise_id=exercise.id,
        answer_text=data['answer_text']
    )
    db.session.add(submission)
    db.session.commit()

    return jsonify(message="Submission received. Good luck!"), 201

@exercise_bp.route('/<int:id>/submissions', methods=['GET'])
@jwt_required()
@role_required('professor', 'admin')
@swag_from({
    'tags': ['Exercises'],
    'summary': 'View student submissions for an exercise',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'List of submissions'}
    }
})
def view_submissions_view(id):
    submissions = StudentSubmission.query.filter_by(exercise_id=id).all()
    return jsonify([
        {
            "student_id": s.student_id,
            "answer_text": s.answer_text,
            "submitted_at": s.submitted_at.isoformat()
        } for s in submissions
    ])
