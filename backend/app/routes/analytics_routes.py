from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import ActivityLog, User, Course, Quiz, Exercise, Message, QuizSubmission, QuizResult, Module, ModuleProgress
from app.utils.roles import role_required
from flasgger import swag_from
from sqlalchemy import func
from sqlalchemy.orm import joinedload


analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')

# ================== GENERAL PLATFORM STATS ==================
@analytics_bp.route('/general', methods=['GET'])
@jwt_required()
@role_required(['admin'])
@swag_from({
    'tags': ['Analytics'],
    'summary': 'Get general platform statistics',
    'responses': {
        '200': {'description': 'Returns overall counts of users, courses, quizzes, exercises, messages.'}
    }
})
def general_platform_stats():
    return jsonify({
        "total_users": User.query.count(),
        "total_professors": User.query.filter_by(role='professor').count(),
        "total_students": User.query.filter_by(role='student').count(),
        "total_courses": Course.query.count(),
        "total_quizzes": Quiz.query.count(),
        "total_exercises": Exercise.query.count(),
        "total_messages": Message.query.count(),
    }), 200

# ================== ACTIVITY LOG STATS ==================
@analytics_bp.route('/logs', methods=['GET'])
@jwt_required()
@role_required(['admin', 'professor'])
@swag_from({
    'tags': ['Analytics'],
    'summary': 'Get activity logs',
    'responses': {
        '200': {'description': 'List of recent platform activities'}
    }
})
def get_activity_logs():
    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(100).all()
    return jsonify([
        {
            "id": l.id,
            "user_id": l.user_id,
            "event": l.event,
            "timestamp": l.timestamp
        } for l in logs
    ]), 200

# ================== PER PROFESSOR ANALYTICS ==================
@analytics_bp.route('/my-courses/detailed', methods=['GET'])
@jwt_required()
@role_required(['professor'])
@swag_from({
    'tags': ['Analytics'],
    'summary': "Get stats for professor's own courses",
    'responses': {
        '200': {'description': 'Aggregated stats for professor courses'}
    }
})
def professor_course_analytics():
    professor_id = get_jwt_identity()

    courses = Course.query.filter_by(professor_id=professor_id).all()

    data = []

    for course in courses:
        quizzes_count = Quiz.query.filter_by(course_id=course.id).count()
        exercises_count = Exercise.query.filter_by(course_id=course.id).count()
        messages_count = Message.query.filter(Message.sender_id==professor_id, Message.receiver_id!=professor_id).count()

        data.append({
            "course_id": course.id,
            "course_title": course.title,
            "quizzes_count": quizzes_count,
            "exercises_count": exercises_count,
            "messages_sent": messages_count
        })

    return jsonify(data), 200

# ================== QUIZ ANALYTICS ==================
@analytics_bp.route('/quiz/<int:quiz_id>', methods=['GET'])
@jwt_required()
@role_required(['admin', 'professor'])
@swag_from({
    'tags': ['Analytics'],
    'summary': 'Get analytics for a specific quiz',
    'parameters': [
        {'name': 'quiz_id', 'in': 'path', 'required': True, 'schema': {'type': 'integer'}}
    ],
    'responses': {
        '200': {'description': 'Quiz analytics'}
    }
})
def quiz_analytics(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)

    total_submissions = db.session.query(func.count()).select_from(QuizSubmission).filter_by(quiz_id=quiz_id, published=True).scalar()
    avg_score = db.session.query(func.avg(QuizSubmission.score)).filter_by(quiz_id=quiz_id, published=True).scalar() or 0

    return jsonify({
        "quiz_id": quiz.id,
        "title": quiz.title,
        "total_submissions": total_submissions,
        "average_score": round(avg_score, 2)
    }), 200


@analytics_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required(['admin', 'professor'])
def course_analytics(course_id):
    course = Course.query.get_or_404(course_id)

    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    exercises = Exercise.query.filter_by(course_id=course_id).all()

    quiz_submissions = sum(
        db.session.query(func.count()).select_from(QuizSubmission).filter_by(quiz_id=q.id).scalar() or 0
        for q in quizzes
    )

    return jsonify({
        "course_id": course.id,
        "course_title": course.title,
        "num_quizzes": len(quizzes),
        "num_exercises": len(exercises),
        "total_quiz_submissions": quiz_submissions
    }), 200


@analytics_bp.route('/user/<int:user_id>/timeline', methods=['GET'])
@jwt_required()
@role_required(['admin', 'professor'])
def user_activity_timeline(user_id):
    logs = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).limit(50).all()
    return jsonify([
        {"event": l.event, "timestamp": l.timestamp.isoformat()} for l in logs
    ]), 200


@analytics_bp.route('/activity/daily', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def daily_activity_counts():
    result = db.session.query(
        func.date(ActivityLog.timestamp),
        func.count()
    ).group_by(func.date(ActivityLog.timestamp)).order_by(func.date(ActivityLog.timestamp)).all()

    return jsonify([
        {"date": str(date), "count": count} for date, count in result
    ]), 200

@analytics_bp.route('/activity/top-users', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def top_active_users():
    result = db.session.query(
        User.full_name,
        ActivityLog.user_id,
        func.count(ActivityLog.id).label('activity_count')
    ).join(User, User.id == ActivityLog.user_id).group_by(ActivityLog.user_id).order_by(func.count(ActivityLog.id).desc()).limit(10).all()

    return jsonify([
        {"user_id": user_id, "name": name, "count": count} for name, user_id, count in result
    ]), 200


@analytics_bp.route('/activity/by-event', methods=['GET'])
@jwt_required()
@role_required(['admin', 'professor'])
def activity_by_event():
    result = db.session.query(
        ActivityLog.event,
        func.count()
    ).group_by(ActivityLog.event).all()

    return jsonify([
        {"event": event, "count": count} for event, count in result
    ]), 200


@analytics_bp.route('/course/<int:course_id>/engagement', methods=['GET'])
@jwt_required()
@role_required(['professor'])
def course_engagement(course_id):
    events = db.session.query(ActivityLog.event, func.count()).join(User).filter(
        User.role == 'student',
        User.id == ActivityLog.user_id
    ).filter(
        ActivityLog.event.ilike(f'%course:{course_id}%')
    ).group_by(ActivityLog.event).all()

    return jsonify([
        {"event": e, "count": c} for e, c in events
    ]), 200

@analytics_bp.route('/my-courses', methods=['GET'])
@jwt_required()
@role_required('professor')
def get_course_analytics():
    user_id = get_jwt_identity()
    courses = Course.query.filter_by(professor_id=user_id).all()

    data = []
    for c in courses:
        submissions = QuizSubmission.query.filter(QuizSubmission.quiz.has(course_id=c.id)).count()
        avg_score = db.session.query(db.func.avg(QuizResult.score)).join(Quiz).filter(Quiz.course_id == c.id).scalar()
        data.append({
            "course_id": c.id,
            "course_name": c.title,
            "student_count": len(c.students),
            "submission_count": submissions,
            "average_grade": round(avg_score or 0, 2),
            "completion_rate": 80  # You can adjust this later
        })

    return jsonify(data), 200




# ==================================================
# 📊 1. Creator View – Analytics on Their Own Modules
# ==================================================
@analytics_bp.route('/creator/modules', methods=['GET'])
@jwt_required()
@role_required('professor')  # or 'creator' if you define it
def get_creator_module_analytics():
    creator_id = get_jwt_identity()

    modules = Module.query.filter_by(creator_id=creator_id).all()
    data = []

    for module in modules:
        total_views = ModuleProgress.query.filter_by(module_id=module.id).count()
        total_completions = ModuleProgress.query.filter_by(module_id=module.id, is_completed=True).count()
        percent_complete = round((total_completions / total_views) * 100, 2) if total_views else 0

        data.append({
            "module_id": module.id,
            "title": module.title,
            "course_id": module.course_id,
            "total_views": total_views,
            "total_completions": total_completions,
            "percent_complete": percent_complete
        })

    return jsonify(data), 200

# ==================================================
# 👤 2. Learner View – Their Own Progress on Modules
# ==================================================
@analytics_bp.route('/me/modules', methods=['GET'])
@jwt_required()
@role_required('student')  # or 'learner'
def get_my_module_progress():
    user_id = get_jwt_identity()

    progress = ModuleProgress.query.options(joinedload(ModuleProgress.module)).filter_by(
        user_id=user_id
    ).all()

    modules = []
    for p in progress:
        module = p.module
        modules.append({
            "module_id": module.id,
            "title": module.title,
            "course_id": module.course_id,
            "completed": p.is_completed,
            "completed_at": p.completed_at.isoformat() if p.completed_at else None
        })

    return jsonify(modules), 200
