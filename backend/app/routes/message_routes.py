from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Message
from app.extensions import db
from flasgger import swag_from

message_bp = Blueprint('message', __name__, url_prefix='/messages')

@message_bp.route('/send', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Messages'],
    'summary': 'Send a message to another user',
    'description': 'Students can only message their professors. Professors can message students, professors, or admins. Admins can message anyone.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'properties': {
                    'receiver_id': {'type': 'integer'},
                    'content': {'type': 'string'}
                },
                'required': ['receiver_id', 'content']
            }
        }
    ],
    'responses': {
        201: {'description': 'Message sent successfully'},
        403: {'description': 'Not allowed'}
    }
})
def send_message_view():
    data = request.get_json()
    sender_id = get_jwt_identity()
    receiver_id = data['receiver_id']
    content = data['content']

    sender = User.query.get(sender_id)
    receiver = User.query.get(receiver_id)

    # Role-based restrictions
    if sender.role == 'student' and receiver.role != 'professor':
        return jsonify(message="Students can only message professors"), 403
    if sender.role == 'professor' and receiver.role in ['student', 'admin', 'professor']:
        pass
    if sender.role == 'admin':
        pass
    elif sender.role not in ['student', 'professor', 'admin']:
        return jsonify(message="Invalid sender role"), 403

    message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )

    db.session.add(message)
    db.session.commit()
    return jsonify(message="Message sent"), 201

@message_bp.route('/inbox', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Messages'],
    'summary': 'View inbox messages',
    'description': 'Returns all messages received by the authenticated user.',
    'responses': {
        200: {
            'description': 'List of received messages',
            'examples': {
                'application/json': [
                    {
                        "from": "Professor Smith",
                        "content": "Reminder about your quiz.",
                        "timestamp": "2025-03-25T15:30:00"
                    }
                ]
            }
        }
    }
})
def get_inbox_view():
    user_id = get_jwt_identity()
    messages = Message.query.filter_by(receiver_id=user_id).order_by(Message.timestamp.desc()).all()
    return jsonify([
        {
            "from": m.sender.full_name,
            "content": m.content,
            "timestamp": m.timestamp.isoformat()
        } for m in messages
    ])
