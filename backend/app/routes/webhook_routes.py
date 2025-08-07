from flask import Blueprint, request, jsonify
from app.models import User, Course, Enrollment, db
import stripe
import os

webhook_bp = Blueprint('webhook', __name__, url_prefix='/webhook')

@webhook_bp.route('/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('stripe-signature')
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata'].get('user_id')
        course_id = session['metadata'].get('course_id')

        if user_id and course_id:
            # Check if already enrolled
            existing = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
            if not existing:
                enrollment = Enrollment(user_id=user_id, course_id=course_id)
                db.session.add(enrollment)
                db.session.commit()

    return jsonify({'status': 'success'}), 200
