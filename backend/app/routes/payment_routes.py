from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Course, User
import stripe
import os

payment_bp = Blueprint('payment', __name__, url_prefix='/payments')

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@payment_bp.route('/checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    course_id = data.get('course_id')

    course = Course.query.get_or_404(course_id)
    user = User.query.get_or_404(user_id)

    if not course.is_paid or (course.price_cents or 0) <= 0:
        return jsonify({"error": "This course is not paid"}), 400

    domain = os.getenv("DOMAIN_URL", "").rstrip("/")
    if not domain:
        return jsonify({"error": "DOMAIN_URL is not configured"}), 500

    try:
        checkout_session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            customer_email=user.email,
            line_items=[{
                "price_data": {
                    "currency": course.currency or "usd",
                    "product_data": {
                        "name": course.title,
                        "description": course.description or "",
                    },
                    "unit_amount": int(course.price_cents),
                },
                "quantity": 1,
            }],
            metadata={
                "user_id": str(user.id),
                "course_id": str(course.id),
            },
            success_url=f"{domain}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{domain}/dashboard?payment=cancel",
        )
        return jsonify({'url': checkout_session.url}), 200
    except Exception as e:
        return jsonify({"error": "Stripe error", "detail": str(e)}), 500
