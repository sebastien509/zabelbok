# app/routes/message_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
from datetime import datetime
from sqlalchemy import and_

from app.extensions import db
from app.utils.roles import role_required
from app.utils.logger import log_event

from app.models import (
    Thread,
    ThreadParticipant,
    Message,
    User,
    Course,
    Notification,
    Enrollment,  # ✅ use Enrollment instead of course_students association table
)

message_bp = Blueprint('messages', __name__, url_prefix='/messages')

# ========== THREAD-BASED MESSAGING ==========

@message_bp.route('/threads', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Messages'],
    'summary': 'Get all message threads',
    'responses': {
        '200': {'description': 'List of message threads'}
    }
})
def get_threads():
    current_user_id = int(get_jwt_identity())

    threads = (
        Thread.query
        .join(ThreadParticipant)
        .filter(ThreadParticipant.user_id == current_user_id)
        .order_by(Thread.updated_at.desc())
        .all()
    )

    result = []
    for thread in threads:
        # the “other side” participant in this 1:1 thread
        participant = (
            ThreadParticipant.query
            .filter(
                ThreadParticipant.thread_id == thread.id,
                ThreadParticipant.user_id != current_user_id
            )
            .first()
        )

        last_message = (
            Message.query
            .filter_by(thread_id=thread.id)
            .order_by(Message.created_at.desc())
            .first()
        )

        result.append({
            'thread_id': thread.id,
            'contact_id': participant.user_id if participant else None,
            'contact_name': participant.user.full_name if participant else None,
            'last_message': last_message.content if last_message else None,
            'timestamp': thread.updated_at.isoformat() if thread.updated_at else None
        })

    return jsonify(result), 200


@message_bp.route('/thread/<int:thread_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Messages'],
    'summary': 'Get messages in a thread',
    'parameters': [{
        'name': 'thread_id',
        'in': 'path',
        'required': True,
        'schema': {'type': 'integer'}
    }],
    'responses': {
        '200': {'description': 'List of messages'},
        '403': {'description': 'Unauthorized'}
    }
})
def get_thread_messages(thread_id):
    current_user_id = int(get_jwt_identity())

    participant = ThreadParticipant.query.filter_by(
        thread_id=thread_id,
        user_id=current_user_id
    ).first()

    if not participant:
        return jsonify({"error": "Unauthorized"}), 403

    messages = (
        Message.query
        .filter_by(thread_id=thread_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return jsonify([{
        'id': m.id,
        'sender_id': m.sender_id,
        'content': m.content,
        'created_at': m.created_at.isoformat() if m.created_at else None,
        'is_me': (m.sender_id == current_user_id)
    } for m in messages]), 200


@message_bp.route('/send', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Messages'],
    'summary': 'Send a message',
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'recipient_id': {'type': 'integer'},
                        'content': {'type': 'string'}
                    },
                    'required': ['recipient_id', 'content']
                }
            }
        },
    },
    'responses': {
        '201': {'description': 'Message sent'},
        '400': {'description': 'Invalid input'}
    }
})
def send_message():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    recipient_id = data.get('recipient_id')
    content = data.get('content')

    if not recipient_id or not content:
        return jsonify({"error": "Missing required fields"}), 400

    # Find existing 1:1 thread between the two users
    thread = (
        db.session.query(Thread)
        .join(ThreadParticipant)
        .filter(
            ThreadParticipant.user_id == current_user_id,
            Thread.id.in_(
                db.session.query(ThreadParticipant.thread_id)
                .filter(ThreadParticipant.user_id == recipient_id)
            )
        )
        .first()
    )

    # Create if not found
    if not thread:
        thread = Thread()
        db.session.add(thread)
        db.session.flush()

        db.session.add_all([
            ThreadParticipant(thread_id=thread.id, user_id=current_user_id),
            ThreadParticipant(thread_id=thread.id, user_id=recipient_id)
        ])

    # Add message
    message = Message(
        thread_id=thread.id,
        sender_id=current_user_id,
        content=content
    )
    db.session.add(message)
    thread.updated_at = datetime.utcnow()

    # 🔔 Notification
    sender = User.query.get(current_user_id)
    notif = Notification(
        user_id=recipient_id,
        title="New Message",
        message=f'New message from {sender.full_name}: "{content[:30]}..."',
        type='message',
        related_id=message.id,
        has_cta=False
    )
    db.session.add(notif)

    db.session.commit()
    log_event(current_user_id, f"message_sent:to:{recipient_id}")

    return jsonify({"message": "Message sent", "thread_id": thread.id}), 201


# ========== CONTACT MANAGEMENT ==========

@message_bp.route('/contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user:
        return jsonify([]), 200

    # Treat school_id == 1 as the “creator/learner” program,
    # but use real roles: professor (creator), student (learner).
    if current_user.school_id == 1:
        if current_user.role == 'professor':
            # Professors at school 1: can contact students enrolled in their authored courses.
            my_course_ids = [c.id for c in Course.query.filter_by(professor_id=current_user.id).all()]
            if not my_course_ids:
                contacts = []
            else:
                contacts = (
                    db.session.query(User)
                    .join(Enrollment, Enrollment.user_id == User.id)
                    .filter(
                        Enrollment.course_id.in_(my_course_ids),
                        User.role == 'student',
                        User.id != current_user.id
                    )
                    .distinct()
                    .all()
                )

        elif current_user.role == 'student':
            # Students at school 1: can contact the professors of their enrolled courses.
            my_course_ids = (
                db.session.query(Enrollment.course_id)
                .filter(Enrollment.user_id == current_user.id)
                .subquery()
            )
            contacts = (
                User.query
                .filter(
                    User.id.in_(db.session.query(Course.professor_id).filter(Course.id.in_(my_course_ids))),
                    User.id != current_user.id
                )
                .distinct()
                .all()
            )
        else:
            contacts = []  # no contacts for other roles at school 1
    else:
        # Other schools: same school, exclude self.
        contacts = (
            User.query
            .filter(
                User.school_id == current_user.school_id,
                User.id != current_user.id
            )
            .all()
        )

    return jsonify([{
        "id": u.id,
        "name": u.full_name,
        "role": u.role,
        "email": u.email
    } for u in contacts]), 200


@message_bp.route('/student-contacts', methods=['GET'])
@jwt_required()
@role_required('student')
def get_student_contacts():
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user:
        return jsonify([]), 200

    if current_user.school_id == 1:
        # Learners at school 1 → only creators (professors) of their courses
        my_course_ids = (
            db.session.query(Enrollment.course_id)
            .filter(Enrollment.user_id == current_user.id)
            .subquery()
        )
        contacts = (
            User.query
            .filter(
                User.id.in_(db.session.query(Course.professor_id).filter(Course.id.in_(my_course_ids))),
                User.id != current_user.id
            )
            .distinct()
            .all()
        )
        return jsonify([{
            "id": u.id,
            "name": u.full_name,
            "role": u.role,
            "email": u.email
        } for u in contacts]), 200

    # Other schools: professors that teach your courses + classmates
    # Professors
    my_course_ids = (
        db.session.query(Enrollment.course_id)
        .filter(Enrollment.user_id == current_user.id)
        .subquery()
    )

    professors = (
        db.session.query(User)
        .join(Course, User.id == Course.professor_id)
        .filter(Course.id.in_(my_course_ids))
        .distinct()
        .all()
    )

    # Classmates
    classmates = (
        db.session.query(User)
        .join(Enrollment, Enrollment.user_id == User.id)
        .filter(
            Enrollment.course_id.in_(my_course_ids),
            User.id != current_user.id
        )
        .distinct()
        .all()
    )

    contacts = [{
        "id": u.id,
        "name": u.full_name,
        "role": u.role,
        "email": u.email
    } for u in professors + classmates]

    return jsonify(contacts), 200


@message_bp.route('/recent-threads', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
def get_recent_threads():
    user_id = int(get_jwt_identity())

    threads = (
        Thread.query
        .join(ThreadParticipant)
        .filter(ThreadParticipant.user_id == user_id)
        .order_by(Thread.updated_at.desc())
        .limit(5)
        .all()
    )

    result = []
    for t in threads:
        others = [p.user.full_name for p in t.participants if p.user_id != user_id]
        title = ", ".join(others) or "Private Thread"
        last_message = t.messages[-1].content if t.messages else "(No messages yet)"

        result.append({
            "id": t.id,
            "title": title,
            "last_message": last_message,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        })

    return jsonify(result), 200
