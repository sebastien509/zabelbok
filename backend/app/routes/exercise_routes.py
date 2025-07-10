from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Exercise, ExerciseQuestion, StudentSubmission
from app.utils.roles import role_required
from flasgger import swag_from
from datetime import datetime
from app.utils.logger import log_event


exercise_bp = Blueprint('exercise', __name__, url_prefix='/exercises')

# ================== CREATE EXERCISE + QUESTIONS ==================
@exercise_bp.route('/full', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Exercises"]})
def create_exercise_with_questions():
    data = request.get_json()

    title = data.get('title')
    description = data.get('description')
    course_id = data.get('course_id')
    deadline = data.get('deadline')
    questions_data = data.get('questions', [])

    if not title or not course_id or not questions_data:
        return jsonify({"msg": "Missing required fields or empty questions."}), 400

    exercise = Exercise(
        title=title,
        description=description,
        course_id=course_id,
        deadline=datetime.strptime(deadline, "%Y-%m-%d") if deadline else None
    )

    db.session.add(exercise)
    db.session.flush()

    for q in questions_data:
        question_text = q.get('question_text')
        question_url = q.get('question_url')

        if not question_text:
            return jsonify({"msg": "Each question must have question_text."}), 400

        question = ExerciseQuestion(
            exercise_id=exercise.id,
            question_text=question_text,
            question_url=question_url
        )
        db.session.add(question)

    db.session.commit()

    return jsonify({"msg": "Exercise and questions created successfully.", "exercise_id": exercise.id}), 201

# ================== GET ALL EXERCISES ==================
@exercise_bp.route('/', methods=['GET'])
@jwt_required()
@swag_from({"tags": ["Exercises"]})
def get_all_exercises():
    exercises = Exercise.query.all()

    return jsonify([
        {
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "course_id": e.course_id,
            "deadline": e.deadline,
            "created_at": e.created_at
        } for e in exercises
    ]), 200

# ================== GET SINGLE EXERCISE WITH QUESTIONS ==================
@exercise_bp.route('/<int:exercise_id>', methods=['GET'])
@jwt_required()
@swag_from({"tags": ["Exercises"]})
def get_exercise(exercise_id):
    exercise = Exercise.query.get_or_404(exercise_id)
    questions = ExerciseQuestion.query.filter_by(exercise_id=exercise.id).all()

    return jsonify({
        "id": exercise.id,
        "title": exercise.title,
        "description": exercise.description,
        "course_id": exercise.course_id,
        "deadline": exercise.deadline,
        "created_at": exercise.created_at,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "question_url": q.question_url
            } for q in questions
        ]
    }), 200

# ================== UPDATE EXERCISE ==================
@exercise_bp.route('/<int:exercise_id>', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Exercises"]})
def update_exercise(exercise_id):
    exercise = Exercise.query.get_or_404(exercise_id)

    data = request.get_json()

    exercise.title = data.get('title', exercise.title)
    exercise.description = data.get('description', exercise.description)
    exercise.deadline = datetime.strptime(data.get('deadline'), "%Y-%m-%d") if data.get('deadline') else exercise.deadline

    db.session.commit()

    return jsonify({"msg": "Exercise updated successfully."}), 200

# ================== DELETE EXERCISE ==================
@exercise_bp.route('/<int:exercise_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Exercises"]})
def delete_exercise(exercise_id):
    exercise = Exercise.query.get_or_404(exercise_id)

    db.session.delete(exercise)
    db.session.commit()

    return jsonify({"msg": "Exercise deleted successfully."}), 200

# ================== DELETE EXERCISE QUESTION ==================
@exercise_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Exercises"]})
def delete_exercise_question(question_id):
    question = ExerciseQuestion.query.get_or_404(question_id)

    db.session.delete(question)
    db.session.commit()

    return jsonify({"msg": "Question deleted successfully."}), 200

# ================== STUDENT SUBMIT EXERCISE ==================
@exercise_bp.route('/<int:exercise_id>/submit', methods=['POST'])
@jwt_required()
@role_required('student')
@swag_from({"tags": ["Exercises"]})
def submit_exercise(exercise_id):
    exercise = Exercise.query.get_or_404(exercise_id)
    data = request.get_json()
    student_id = get_jwt_identity()  # ✅ Define this first


    answers = data.get('answers')
    if not answers or not isinstance(answers, list):
        return jsonify({"msg": "Answers must be a list of question_id and answer_text."}), 400

    for ans in answers:
        submission = StudentSubmission(
            student_id=get_jwt_identity(),
            exercise_id=exercise.id,
            question_id=ans.get('question_id'),
            answer_text=ans.get('answer_text')
        )
        db.session.add(submission)

    db.session.commit()
    log_event(student_id, f"exercise_submitted:exercise:{exercise_id}")


    return jsonify({"msg": "Exercise submitted successfully."}), 201

# ================== PROFESSOR GRADING ==================
@exercise_bp.route('/submission/<int:submission_id>/grade', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Exercises"]})
def grade_submission(submission_id):
    submission = StudentSubmission.query.get_or_404(submission_id)

    data = request.get_json()
    grade = data.get('grade')

    if grade is None:
        return jsonify({"msg": "Grade is required."}), 400

    submission.grade = float(grade)
    db.session.commit()

    return jsonify({"msg": "Submission graded successfully."}), 200