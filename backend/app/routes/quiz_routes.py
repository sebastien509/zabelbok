from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Quiz, QuizQuestion, Course, User, QuizSubmission, Notification
from app.utils.roles import role_required
from flasgger import swag_from
from datetime import datetime
from dateutil.parser import parse
from app.utils.logger import log_event


quiz_bp = Blueprint('quiz', __name__, url_prefix='/quizzes')

# ================== CREATE QUIZ + QUESTIONS (Batch) ==================
@quiz_bp.route('/full', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Quizzes"]})
def create_quiz_with_questions():
    data = request.get_json()

    title = data.get('title')
    description = data.get('description')
    course_id = data.get('course_id')
    deadline = data.get('deadline')
    questions_data = data.get('questions', [])

    if not title or not course_id or not questions_data:
        return jsonify({"msg": "Missing required fields or empty questions."}), 400

    quiz = Quiz(
        title=title,
        description=description,
        course_id=course_id,
        deadline=parse(deadline) if deadline else None,
        created_at=datetime.utcnow()
    )

    db.session.add(quiz)
    db.session.flush()  # Get quiz.id

    for q in questions_data:
        question_text = q.get('question_text')
        choices = q.get('choices')
        correct_answer = q.get('correct_answer')

        if not question_text or not choices or not correct_answer:
            return jsonify({"msg": "Each question must have question_text, choices, and correct_answer."}), 400

        question = QuizQuestion(
            quiz_id=quiz.id,
            question_text=question_text,
            choices=choices,
            correct_answer=correct_answer
        )
        db.session.add(question)

    db.session.commit()

    return jsonify({"msg": "Quiz and questions created successfully.", "quiz_id": quiz.id}), 201

# ================== GET ALL QUIZZES ==================
@quiz_bp.route('/', methods=['GET'])
@jwt_required()
@swag_from({"tags": ["Quizzes"]})
def get_all_quizzes():
    quizzes = Quiz.query.all()
    return jsonify([
        {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "course_id": q.course_id,
            "deadline": q.deadline,
            "created_at": q.created_at,
            "questions": [
                {
                    "id": question.id,
                    "question_text": question.question_text,
                    "choices": question.choices,
                    "correct_answer": question.correct_answer
                } for question in q.questions
            ]
        } for q in quizzes
    ]), 200


# ================== GET SINGLE QUIZ ==================
@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
@swag_from({"tags": ["Quizzes"]})
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = QuizQuestion.query.filter_by(quiz_id=quiz.id).all()

    return jsonify({
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "course_id": quiz.course_id,
        "deadline": quiz.deadline,
        "created_at": quiz.created_at,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "choices": q.choices,
                "correct_answer": q.correct_answer
            } for q in questions
        ]
    }), 200

# ================== UPDATE QUIZ ==================

@quiz_bp.route('/<int:quiz_id>', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Quizzes"]})
def update_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    data = request.get_json()

    # === Update quiz metadata ===
    quiz.title = data.get('title', quiz.title)
    quiz.description = data.get('description', quiz.description)
    quiz.deadline = parse(data.get('deadline')) if data.get('deadline') else quiz.deadline

    # === Update questions (optional override) ===
    new_questions = data.get('questions')
    if new_questions is not None:
        # Clear existing questions
        QuizQuestion.query.filter_by(quiz_id=quiz.id).delete()

        # Add new questions
        for q in new_questions:
            question_text = q.get('question_text')
            choices = q.get('choices')
            correct_answer = q.get('correct_answer')

            if not question_text or not choices or not correct_answer:
                return jsonify({"msg": "Each question must have question_text, choices, and correct_answer."}), 400

            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=question_text,
                choices=choices,
                correct_answer=correct_answer
            )
            db.session.add(question)

    db.session.commit()

    return jsonify({"msg": "Quiz and questions updated successfully."}), 200

# ================== DELETE QUIZ ==================
@quiz_bp.route('/<int:quiz_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Quizzes"]})
def delete_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)

    db.session.delete(quiz)
    db.session.commit()

    return jsonify({"msg": "Quiz deleted successfully."}), 200

# ================== DELETE QUESTION ==================
@quiz_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Quizzes"]})
def delete_question(question_id):
    question = QuizQuestion.query.get_or_404(question_id)

    db.session.delete(question)
    db.session.commit()

    return jsonify({"msg": "Question deleted successfully."}), 200

@quiz_bp.route('/<int:quiz_id>/verify', methods=['GET'])
@jwt_required()
@role_required('student')
def verify_quiz_attempt(quiz_id):
    # Check if student already submitted
    submission = QuizSubmission.query.filter_by(
        student_id=get_jwt_identity(),
        quiz_id=quiz_id
    ).first()
    
    if submission:
        return jsonify({
            "allowed": False,
            "reason": "Already submitted",
            "submitted_at": submission.submitted_at
        }), 403
    
    # Check if deadline passed
    quiz = Quiz.query.get_or_404(quiz_id)
    if quiz.deadline and datetime.utcnow() > quiz.deadline:
        return jsonify({
            "allowed": False,
            "reason": "Deadline passed"
        }), 403
    
    return jsonify({"allowed": True}), 200



@quiz_bp.route('/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
@role_required('student')
def submit_quiz(quiz_id):
    student_id = get_jwt_identity()
    data = request.get_json()

    # Validate input
    if not data or 'score' not in data:
        return jsonify({"msg": "Score is required"}), 400

    # Check if quiz exists
    quiz = Quiz.query.get_or_404(quiz_id)

    # Prevent duplicate submissions
    if QuizSubmission.query.filter_by(student_id=student_id, quiz_id=quiz_id).first():
        return jsonify({"msg": "You have already submitted this quiz"}), 400

    try:
        submission = QuizSubmission(
            student_id=student_id,
            quiz_id=quiz_id,
            score=data['score']
        )
        
        db.session.add(submission)
        db.session.commit()

        # ✅ Trigger notification
        notif = Notification(
            user_id=submission.student_id,
            message=f'Your quiz "{quiz.title}" was submitted successfully.',
            type='submission',
            related_id=submission.id
        )
        db.session.add(notif)
        db.session.commit()

        # ✅ Now we can safely log the event
        log_event(student_id, f"quiz_submitted:quiz:{quiz_id}")

        return jsonify({
            "msg": "Quiz submitted successfully",
            "submission_id": submission.id,
            "score": submission.score
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Submission failed: {str(e)}"}), 500


@quiz_bp.route('/my-submissions', methods=['GET'])
@jwt_required()
@role_required('student')
def get_my_quiz_submissions():
    student_id = get_jwt_identity()
    submissions = QuizSubmission.query.filter_by(student_id=student_id).all()
    
    results = []
    for sub in submissions:
        quiz = Quiz.query.get(sub.quiz_id)
        results.append({
            "quiz_id": sub.quiz_id,
            "quiz_title": quiz.title if quiz else "Unknown Quiz",
            "submitted_at": sub.submitted_at,
            "score": sub.score
        })
    
    return jsonify(results), 200


@quiz_bp.route('/submitted', methods=['GET'])
@jwt_required()
@role_required('student')
def get_my_submitted_quizzes():
    student_id = get_jwt_identity()
    submissions = QuizSubmission.query.filter_by(student_id=student_id).all()
    return jsonify([{
        "quiz_id": sub.quiz_id,
        "submitted_at": sub.submitted_at,
        "published": sub.published
    } for sub in submissions]), 200
