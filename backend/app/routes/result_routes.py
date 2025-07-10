from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import (
    QuizResult, StudentSubmission, Quiz, Exercise, QuizSubmission, Notification,
    Course
)
from app.utils.roles import role_required
from flasgger import swag_from
from datetime import datetime

result_bp = Blueprint('result', __name__, url_prefix='/results')

# ================== PROFESSOR - GET QUIZ SUBMISSIONS BY STUDENT ==================
@result_bp.route('/quiz/submissions/<int:student_id>', methods=['GET'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Results"]})
def get_quiz_submissions_by_student(student_id):
    submissions = QuizSubmission.query.filter_by(student_id=student_id).all()
    
    results = []
    for sub in submissions:
        quiz = Quiz.query.get(sub.quiz_id)
        result = QuizResult.query.filter_by(student_id=student_id, quiz_id=sub.quiz_id).first()
        
        results.append({
            "submission_id": sub.id,
            "quiz_id": sub.quiz_id,
            "quiz_title": quiz.title if quiz else "Unknown Quiz",
            "answers": sub.answers,
            "score": result.score if result else None,
            "feedback": result.feedback if result else None,
            "published": result.published if result else False,
            "submitted_at": sub.submitted_at
        })
    
    return jsonify(results), 200

# ================== PROFESSOR - GRADE & PUBLISH QUIZ RESULT ==================
@result_bp.route('/quiz/<int:quiz_id>/grade', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Results"]})
def grade_quiz(quiz_id):
    data = request.get_json()
    student_id = data.get('student_id')
    score = data.get('score')
    feedback = data.get('feedback')
    publish = data.get('publish', False)

    if not student_id or score is None:
        return jsonify({"msg": "Missing student_id or score."}), 400

    quiz = Quiz.query.get_or_404(quiz_id)
    submission = QuizSubmission.query.filter_by(student_id=student_id, quiz_id=quiz_id).first()
    if not submission:
        return jsonify({"msg": "No submission found for this student and quiz."}), 404

    result = QuizResult.query.filter_by(student_id=student_id, quiz_id=quiz_id).first()
    if result:
        result.score = score
        result.feedback = feedback
        result.published = publish
    else:
        result = QuizResult(
            student_id=student_id,
            quiz_id=quiz_id,
            score=score,
            feedback=feedback,
            published=publish,
            graded_at=datetime.utcnow()
        )
        db.session.add(result)

    notif = Notification(
        user_id=student_id,
        message=f'Your quiz "{quiz.title}" has been graded. Score: {score}%',
        type='grade',
        related_id=result.id
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"msg": "Quiz result saved.", "result_id": result.id}), 201

# ================== PROFESSOR - PUBLISH QUIZ RESULT ==================
@result_bp.route('/quiz/<int:result_id>/publish', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Results"]})
def publish_quiz_result(result_id):
    result = QuizResult.query.get_or_404(result_id)
    if not result.published:
        result.published = True
        result.published_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"msg": "Quiz result published."}), 200
    return jsonify({"msg": "Quiz result was already published."}), 200

# ================== STUDENT - VIEW OWN PUBLISHED QUIZ RESULTS ==================
@result_bp.route('/quiz', methods=['GET'])
@jwt_required()
@role_required('student')
@swag_from({"tags": ["Results"]})
def get_my_quiz_results():
    student_id = get_jwt_identity()
    results = QuizResult.query.filter_by(student_id=student_id, published=True).join(Quiz).add_entity(Quiz).all()

    return jsonify([
        {
            "quiz_id": r.QuizResult.quiz_id,
            "quiz_title": r.Quiz.title,
            "score": r.QuizResult.score,
            "feedback": r.QuizResult.feedback,
            "graded_at": r.QuizResult.graded_at,
            "published_at": r.QuizResult.published_at
        } for r in results
    ]), 200

# ================== PROFESSOR - GET QUIZ SUBMISSIONS BY QUIZ ID ==================
@result_bp.route('/quiz-submissions/<int:quiz_id>', methods=['GET'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Results"]})
def get_quiz_submissions_by_quiz(quiz_id):
    submissions = QuizSubmission.query.filter_by(quiz_id=quiz_id).all()
    results = []

    for sub in submissions:
        result = QuizResult.query.filter_by(student_id=sub.student_id, quiz_id=sub.quiz_id).first()
        results.append({
            "submission_id": sub.id,
            "quiz_id": sub.quiz_id,
            "student_id": sub.student_id,
            "score": result.score if result else None,
            "published": result.published if result else False,
            "submitted_at": sub.submitted_at
        })

    return jsonify(results), 200

# ================== PROFESSOR - GET EXERCISE SUBMISSIONS BY STUDENT ==================
@result_bp.route('/exercise/submissions/student/<int:student_id>', methods=['GET'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Results"]})
def get_exercise_submissions_by_student(student_id):
    submissions = StudentSubmission.query.filter_by(student_id=student_id).all()
    results = []
    for sub in submissions:
        exercise = Exercise.query.get(sub.exercise_id)
        results.append({
            "submission_id": sub.id,
            "exercise_id": sub.exercise_id,
            "exercise_title": exercise.title if exercise else "Unknown Exercise",
            "question_id": sub.question_id,
            "answer_text": sub.answer_text,
            "grade": sub.grade,
            "published": sub.published,
            "submitted_at": sub.submitted_at,
            "graded_at": sub.graded_at
        })
    return jsonify(results), 200

# ================== PROFESSOR - PUBLISH EXERCISE SUBMISSION ==================
@result_bp.route('/exercise/<int:submission_id>/publish', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Results"]})
def publish_exercise_submission(submission_id):
    submission = StudentSubmission.query.get_or_404(submission_id)
    if not submission.published:
        submission.published = True
        submission.published_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"msg": "Exercise submission published."}), 200
    return jsonify({"msg": "Exercise submission was already published."}), 200

# ================== STUDENT - VIEW OWN PUBLISHED EXERCISE SUBMISSIONS ==================
@result_bp.route('/exercise', methods=['GET'])
@jwt_required()
@role_required('student')
@swag_from({"tags": ["Results"]})
def get_my_exercise_submissions():
    student_id = get_jwt_identity()
    submissions = StudentSubmission.query.filter_by(student_id=student_id).join(Exercise).add_entity(Exercise).all()

    return jsonify([
        {
            "exercise_id": s.StudentSubmission.exercise_id,
            "exercise_title": s.Exercise.title,

            "grade": s.StudentSubmission.grade,
            "submitted_at": s.StudentSubmission.submitted_at,
            "published_at": s.StudentSubmission.published_at
        } for s in submissions
    ]), 200

# ================== PROFESSOR - GET SUBMISSIONS BY EXERCISE ==================
@result_bp.route('/submissions/exercise/<int:exercise_id>', methods=['GET'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Results"]})
def get_exercise_submissions_by_exercise(exercise_id):
    submissions = StudentSubmission.query.filter_by(exercise_id=exercise_id).all()
    return jsonify([
        {
            "submission_id": sub.id,
            "student_id": sub.student_id,
            "exercise_id": sub.exercise_id,
            "question_id": sub.question_id,
            "answer_text": sub.answer_text,
            "grade": sub.grade,
            "published": sub.published,
            "submitted_at": sub.submitted_at
        } for sub in submissions
    ]), 200

# ================== PROFESSOR - GET LATEST SUBMISSIONS ==================
@result_bp.route('/professor/latest-submissions', methods=['GET'])
@jwt_required()
@role_required('professor')
def get_latest_submissions():
    professor_id = get_jwt_identity()

    # Get professor's course IDs
    professor_course_ids = [c.id for c in Course.query.filter_by(professor_id=professor_id).all()]
    quiz_ids = [q.id for q in Quiz.query.filter(Quiz.course_id.in_(professor_course_ids)).all()]
    exercise_ids = [e.id for e in Exercise.query.filter(Exercise.course_id.in_(professor_course_ids)).all()]

    quiz_subs = (
        QuizSubmission.query
        .filter(QuizSubmission.quiz_id.in_(quiz_ids))
        .order_by(QuizSubmission.submitted_at.desc())
        .limit(5)
        .all()
    )
    ex_subs = (
        StudentSubmission.query
        .filter(StudentSubmission.exercise_id.in_(exercise_ids))
        .order_by(StudentSubmission.submitted_at.desc())
        .limit(5)
        .all()
    )

    results = []

    for sub in quiz_subs:
        quiz = Quiz.query.get(sub.quiz_id)
        result = QuizResult.query.filter_by(student_id=sub.student_id, quiz_id=sub.quiz_id).first()
        results.append({
            "type": "quiz",
            "id": sub.id,
            "quiz_title": quiz.title if quiz else "Unknown",
            "student_id": sub.student_id,
            "student_name": sub.student.full_name,
            "graded": bool(result and result.score is not None),
            "score": result.score if result else None,
            "submitted_at": sub.submitted_at,
        })

    for sub in ex_subs:
        exercise = Exercise.query.get(sub.exercise_id)
        results.append({
            "type": "exercise",
            "id": sub.id,
            "assignment_title": exercise.title if exercise else "Unknown",
            "student_id": sub.student_id,
            "student_name": sub.student.full_name,
            "graded": bool(sub.grade is not None),
            "score": sub.grade,
            "submitted_at": sub.submitted_at,
        })

    results = sorted(results, key=lambda r: r["submitted_at"], reverse=True)[:5]

    return jsonify(results), 200
