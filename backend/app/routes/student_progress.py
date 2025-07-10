from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import QuizResult, StudentSubmission, Quiz, Exercise, Course
from app.utils.roles import role_required
from flasgger import swag_from
from app.models import QuizResult, StudentSubmission, ModuleProgress, Module, User, Course
from datetime import datetime
from sqlalchemy.orm import joinedload
from functools import wraps



progress_bp = Blueprint('progress', __name__, url_prefix='/progress')

# ================== STUDENT - PERSONAL DASHBOARD ==================
@progress_bp.route('/me', methods=['GET'])
@jwt_required()
@role_required('student')
@swag_from({"tags": ["Progress"]})
def student_dashboard():
    student_id = get_jwt_identity()

    quiz_results = QuizResult.query.filter_by(student_id=student_id, published=True).all()
    exercise_submissions = StudentSubmission.query.filter_by(student_id=student_id, published=True).all()

    return jsonify({
        "quizzes": [
            {
                "quiz_id": r.quiz_id,
                "score": r.score,
                "feedback": r.feedback,
                "submitted_at": r.submitted_at
            } for r in quiz_results
        ],
        "exercises": [
            {
                "exercise_id": s.exercise_id,
                # ❌ Do not expose answer_text to student
                "submitted_at": s.submitted_at
            } for s in exercise_submissions
        ]
    }), 200

# ================== PROFESSOR - CLASS PROGRESS ==================
@progress_bp.route('/class/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Progress"]})
def class_progress(course_id):
    course = Course.query.get_or_404(course_id)

    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    exercises = Exercise.query.filter_by(course_id=course_id).all()

    quiz_stats = []
    for quiz in quizzes:
        results = QuizResult.query.filter_by(quiz_id=quiz.id, published=True).all()
        quiz_stats.append({
            "quiz_id": quiz.id,
            "title": quiz.title,
            "total_submissions": len(results),
            "average_score": round(sum([r.score for r in results]) / len(results), 2) if results else 0
        })

    exercise_stats = []
    for ex in exercises:
        submissions = StudentSubmission.query.filter_by(exercise_id=ex.id, published=True).all()
        exercise_stats.append({
            "exercise_id": ex.id,
            "title": ex.title,
            "total_submissions": len(submissions)
        })

    return jsonify({
        "quizzes": quiz_stats,
        "exercises": exercise_stats
    }), 200

# ================== PROFESSOR - INDIVIDUAL STUDENT PERFORMANCE ==================
@progress_bp.route('/student/<int:student_id>overview', methods=['GET'])
@jwt_required()
@role_required('professor')
@swag_from({"tags": ["Progress"]})
def student_performance(student_id):
    quiz_results = QuizResult.query.filter_by(student_id=student_id, published=True).all()
    exercise_submissions = StudentSubmission.query.filter_by(student_id=student_id, published=True).all()

    return jsonify({
        "quizzes": [
            {
                "quiz_id": r.quiz_id,
                "score": r.score,
                "feedback": r.feedback,
                "submitted_at": r.submitted_at
            } for r in quiz_results
        ],
        "exercises": [
            {
                "exercise_id": s.exercise_id,
                "answer_text": s.answer_text,  # ✅ Professors can view answers
                "submitted_at": s.submitted_at
            } for s in exercise_submissions
        ]
    }), 200

# ================== STUDENT - UPCOMING DEADLINES ==================
@progress_bp.route('/upcoming', methods=['GET'])
@jwt_required()
@role_required('student')
@swag_from({"tags": ["Progress"]})
def get_upcoming_deadlines():
    from app.models import QuizSubmission
    from datetime import datetime

    student_id = get_jwt_identity()
    now = datetime.utcnow()

    # Get unsubmitted quizzes
    assigned_quizzes = (
        db.session.query(Quiz)
        .join(Course)
        .join(Course.students)
        .filter(
            Quiz.deadline > now,
            QuizResult.student_id != student_id
        )
        .all()
    )

    # Get unsubmitted exercises
    assigned_exercises = (
        db.session.query(Exercise)
        .join(Course)
        .join(Course.students)
        .filter(
            Exercise.deadline > now,
            ~StudentSubmission.query.filter_by(student_id=student_id, exercise_id=Exercise.id).exists()
        )
        .all()
    )

    upcoming = []

    for quiz in assigned_quizzes:
        upcoming.append({
            "id": quiz.id,
            "type": "quiz",
            "title": quiz.title,
            "course_name": quiz.course.title,
            "deadline": quiz.deadline.isoformat(),
            "submitted": False,
        })

    for ex in assigned_exercises:
        upcoming.append({
            "id": ex.id,
            "type": "exercise",
            "title": ex.title,
            "course_name": ex.course.title,
            "deadline": ex.deadline.isoformat(),
            "submitted": False,
        })

    upcoming.sort(key=lambda x: x['deadline'])

    return jsonify(upcoming), 200

# ================== STUDENT - PERFORMANCE SUMMARY ==================
@progress_bp.route('/summary', methods=['GET'])
@jwt_required()
@role_required('student')
def get_student_summary():
    student_id = get_jwt_identity()

    quiz_results = QuizResult.query.filter_by(student_id=student_id, published=True).all()
    exercise_submissions = StudentSubmission.query.filter_by(student_id=student_id, published=True).all()

    average_score = (
        sum(r.score for r in quiz_results if r.score is not None) / len(quiz_results)
        if quiz_results else 0
    )
    total = len(quiz_results) + len(exercise_submissions)

    return jsonify({
        "quiz_count": len(quiz_results),
        "exercise_count": len(exercise_submissions),
        "average_score": round(average_score, 2),
        "total_submitted": total
    }), 200




# ========== PROFESSOR - CUSTOMIZED PROGRESS BY SCHOOL ==========
def viewable_by_student_or_professor(fn):
    @wraps(fn)
    @jwt_required()  # ✅ this goes inside the wrapper
    def wrapper(student_id, *args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.role == 'professor':
            return fn(student_id, *args, **kwargs)
        if user.role in ['student', 'learner'] and user.id == student_id:
            return fn(student_id, *args, **kwargs)

        return jsonify({'msg': 'Forbidden'}), 403

    return wrapper

@progress_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
@viewable_by_student_or_professor
def student_progress_school_aware(student_id):
    student = User.query.get_or_404(student_id)

    # 🏫 Special logic for School ID 1: use ModuleProgress instead of quizzes/exercises
    if student.school_id == 1:
        progress = ModuleProgress.query.filter_by(user_id=student_id, is_completed=True).all()
        module_data = []
        for p in progress:
            module = Module.query.get(p.module_id)
            if module:
                module_data.append({
                    "module_id": module.id,
                    "title": module.title,
                    "course_id": module.course_id,
                    "completed_at": p.completed_at.isoformat() if p.completed_at else None
                })

        return jsonify({
            "school_id": 1,
            "type": "module-only",
            "completed_modules": module_data,
            "total_modules_completed": len(module_data)
        }), 200

    # 🎓 Default fallback for all other schools
    quiz_results = QuizResult.query.filter_by(student_id=student_id, published=True).all()
    exercise_submissions = StudentSubmission.query.filter_by(student_id=student_id, published=True).all()

    return jsonify({
        "school_id": student.school_id,
        "type": "quizzes-exercises",
        "quizzes": [
            {
                "quiz_id": r.quiz_id,
                "score": r.score,
                "feedback": r.feedback,
                "submitted_at": r.submitted_at
            } for r in quiz_results
        ],
        "exercises": [
            {
                "exercise_id": s.exercise_id,
                "submitted_at": s.submitted_at
            } for s in exercise_submissions
        ],
        "quiz_count": len(quiz_results),
        "exercise_count": len(exercise_submissions)
    }), 200


def viewable_by_student_or_professor(fn):
    @wraps(fn)
    def wrapper(student_id, *args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.role == 'professor':
            return fn(student_id, *args, **kwargs)
        if user.role in ['student', 'learner'] and user.id == student_id:
            return fn(student_id, *args, **kwargs)
        return jsonify({'msg': 'Forbidden'}), 403
    return wrapper


@progress_bp.route('/learner/<int:student_id>', methods=['GET'])
@jwt_required()
@viewable_by_student_or_professor
def student_progress_overview(student_id):
    student = User.query.get_or_404(student_id)

    if student.school_id == 1:
        # 🧠 School-specific logic: use ModuleProgress
        progress = ModuleProgress.query.options(joinedload(ModuleProgress.module)).filter_by(
            user_id=student_id,
            is_completed=True
        ).all()

        completed_modules = []
        for p in progress:
            module = p.module
            if module:
                completed_modules.append({
                    "module_id": module.id,
                    "title": module.title,
                    "course_id": module.course_id,
                    "course_title": module.course.title if module.course else None,
                    "completed_at": p.completed_at.isoformat() if p.completed_at else None
                })

        total_modules = Module.query.count()
        percent_complete = round((len(completed_modules) / total_modules) * 100, 2) if total_modules else 0.0

        return jsonify({
            "school_id": 1,
            "type": "module-only",
            "completed_modules": completed_modules,
            "total_modules_completed": len(completed_modules),
            "total_modules": total_modules,
            "percent_complete": percent_complete
        }), 200

    # 🎓 General logic
    quiz_results = QuizResult.query.filter_by(student_id=student_id, published=True).all()
    exercise_submissions = StudentSubmission.query.filter_by(student_id=student_id, published=True).all()

    return jsonify({
        "school_id": student.school_id,
        "type": "quizzes-exercises",
        "quizzes": [
            {
                "quiz_id": r.quiz_id,
                "score": r.score,
                "feedback": r.feedback,
                "submitted_at": r.submitted_at
            } for r in quiz_results
        ],
        "exercises": [
            {
                "exercise_id": s.exercise_id,
                "submitted_at": s.submitted_at
            } for s in exercise_submissions
        ],
        "quiz_count": len(quiz_results),
        "exercise_count": len(exercise_submissions)
    }), 200
