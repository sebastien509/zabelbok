from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Notification, User
from datetime import datetime, timedelta


notification_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

# 🔐 Helper: get current user from JWT
def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)

# 📥 Get all notifications for the current user
@notification_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()

    # ✅ Auto-delete old read notifications
    five_days_ago = datetime.utcnow() - timedelta(days=5)
    Notification.query.filter(
        Notification.user_id == user_id,
        Notification.is_read == True,
        Notification.read_at <= five_days_ago
    ).delete(synchronize_session=False)
    db.session.commit()

    # ✅ Return current notifications
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200

# 🔔 Get unread notification count
@notification_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    user = get_current_user()
    count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify({'unread_count': count}), 200



# 🛠 Create a structured notification
@notification_bp.route('/', methods=['POST'])
@jwt_required()
def create_notification():
    user = get_current_user()
    if user.role not in ['admin', 'professor']:
        return jsonify({'error': 'Not authorized'}), 403

    data = request.get_json()
    required_fields = ['user_id', 'message']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    notification = Notification(
        user_id=data['user_id'],
        title=data.get('title'),
        message=data['message'],
        type=data.get('type'),
        related_id=data.get('related_id'),
        has_cta=data.get('has_cta', False)
    )

    db.session.add(notification)
    db.session.commit()
    return jsonify({'message': 'Notification created'}), 201

@notification_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_notification(id):
    user_id = get_jwt_identity()
    notification = Notification.query.get_or_404(id)
    if notification.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    db.session.delete(notification)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200

@notification_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def mark_notification_as_read(id):
    user_id = get_jwt_identity()
    notification = Notification.query.get_or_404(id)

    if notification.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200
