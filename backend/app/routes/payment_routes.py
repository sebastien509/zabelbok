from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Course, User
import stripe
import os

payment_bp = Blueprint('payment', __name__, url_prefix='/payments')

@payment_bp.route('/checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    user_id = get_jwt_identity()
    data = request.get_json()
    course_id = data.get('course_id')

    course = Course.query.get_or_404(course_id)
    user = User.query.get_or_404(user_id)

    # Pricing logic – can be enhanced to pull from DB
    price_usd = data.get('price', 10)  # Default price if not dynamic

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=user.email,
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f"{course.title}",
                        'description': course.description or '',
                    },
                    'unit_amount': int(price_usd * 100),  # in cents
                },
                'quantity': 1,
            }],
            metadata={
                "user_id": user_id,
                "course_id": course_id
            },
            mode='payment',
            success_url=os.getenv("DOMAIN_URL") + f"/dashboard?success=true",
            cancel_url=os.getenv("DOMAIN_URL") + f"/dashboard?canceled=true",
        )

        return jsonify({'url': checkout_session.url}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
