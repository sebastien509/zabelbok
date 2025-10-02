# app/routes/webhook.py
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import (
    User, Course, Enrollment,
    Order, OrderItem, TransferLog, RefundLog, WebhookEvent
)
import stripe, os

webhook_bp = Blueprint('webhook', __name__, url_prefix='/webhook')

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def _cents(v): return int(round(v or 0))

@webhook_bp.route('/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    # Stripe sends 'Stripe-Signature' (capital S)
    sig_header = request.headers.get('Stripe-Signature') or request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    # ---- Idempotency guard ----
    if WebhookEvent.query.filter_by(event_id=event['id']).first():
        return jsonify({'status': 'already_processed'}), 200
    db.session.add(WebhookEvent(event_id=event['id'], type=event['type'], payload=event['data']['object']))
    db.session.commit()

    etype = event['type']

    # ----------------------------------------------------------------
    # 1) CHECKOUT SUCCESS → ENROLL + (for carts) CREATE TRANSFERS
    # ----------------------------------------------------------------
    if etype == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session['id']
        payment_intent_id = session.get('payment_intent')

        # A) BACKWARD-COMPAT: single course via metadata
        meta = session.get('metadata') or {}
        user_id = meta.get('user_id')
        course_id = meta.get('course_id')

        if user_id and course_id:
            # older flow: enroll one course
            existing = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
            if not existing:
                db.session.add(Enrollment(user_id=user_id, course_id=course_id))
                db.session.commit()

            # Try to attach this to an Order if you pre-created one
            order = Order.query.filter_by(stripe_checkout_session_id=session_id).first()
            if order:
                order.status = 'paid'
                order.stripe_payment_intent_id = payment_intent_id
                db.session.commit()

            return jsonify({'status': 'ok-legacy-enrolled'}), 200

        # B) NEW CART / PLATFORM-LED FLOW
        # Find the pre-created Order by checkout session id
        order = Order.query.filter_by(stripe_checkout_session_id=session_id).first()

        if order:
            order.status = 'paid'
            order.stripe_payment_intent_id = payment_intent_id
            db.session.commit()

            # Enroll buyer into all courses in the order
            for oi in order.items:
                if not Enrollment.query.filter_by(user_id=order.buyer_id, course_id=oi.course_id).first():
                    db.session.add(Enrollment(user_id=order.buyer_id, course_id=oi.course_id))
            db.session.commit()

            # If this was a platform-charge (multi-creator or cart), send transfers now
            # Heuristic: when we created the session for multi, we did NOT set destination/fee on PI.
            # So we will transfer per item from the platform balance using the charge id (source_transaction).
            try:
                if payment_intent_id:
                    pi = stripe.PaymentIntent.retrieve(payment_intent_id, expand=['charges'])
                    charge_id = None
                    if pi and pi.get('charges', {}).get('data'):
                        charge_id = pi['charges']['data'][0]['id']

                    for oi in order.items:
                        creator = User.query.get(oi.creator_id)
                        acct_id = getattr(getattr(creator, 'payout_account', None), 'stripe_account_id', None)
                        if not acct_id:
                            # log failure to transfer (creator not onboarded)
                            db.session.add(TransferLog(
                                order_id=order.id,
                                order_item_id=oi.id,
                                creator_id=oi.creator_id,
                                amount=oi.creator_amount,
                                status='failed:no_connected_account'
                            ))
                            continue

                        try:
                            tr = stripe.Transfer.create(
                                amount=oi.creator_amount,
                                currency=order.currency or 'usd',
                                destination=acct_id,
                                **({'source_transaction': charge_id} if charge_id else {})
                            )
                            db.session.add(TransferLog(
                                order_id=order.id,
                                order_item_id=oi.id,
                                creator_id=oi.creator_id,
                                stripe_transfer_id=tr.id,
                                amount=oi.creator_amount,
                                status='created'
                            ))
                        except Exception as te:
                            db.session.add(TransferLog(
                                order_id=order.id,
                                order_item_id=oi.id,
                                creator_id=oi.creator_id,
                                amount=oi.creator_amount,
                                status=f'failed:{str(te)}'
                            ))
                    db.session.commit()
            except Exception as e:
                # We still consider checkout completed; transfers may be retried by a job.
                pass

            return jsonify({'status': 'ok-enrolled-and-transferred'}), 200

        # If we get here, we had no metadata and no pre-created order: nothing to do
        return jsonify({'status': 'ok-no-order'}), 200

    # ----------------------------------------------------------------
    # 2) REFUNDS (optional: revoke access on full refund)
    # ----------------------------------------------------------------
    elif etype in ('charge.refunded', 'charge.refund.updated'):
        charge = event['data']['object']
        pi_id = charge.get('payment_intent')
        order = Order.query.filter_by(stripe_payment_intent_id=pi_id).first()

        if order:
            refunded = _cents(charge.get('amount_refunded', 0))
            if refunded > 0:
                order.status = 'refunded' if refunded >= order.total_amount else 'partially_refunded'
                # Log each refund record if new
                for r in charge.get('refunds', {}).get('data', []):
                    if not RefundLog.query.filter_by(stripe_refund_id=r['id']).first():
                        db.session.add(RefundLog(
                            order_id=order.id,
                            stripe_charge_id=charge['id'],
                            stripe_refund_id=r['id'],
                            amount=r['amount'],
                            reason=r.get('reason')
                        ))
                # Optional: revoke enrollment on full refund
                if refunded >= order.total_amount:
                    for oi in order.items:
                        enr = Enrollment.query.filter_by(user_id=order.buyer_id, course_id=oi.course_id).first()
                        if enr: db.session.delete(enr)
                db.session.commit()

        return jsonify({'status': 'ok-refund-logged'}), 200

    # ----------------------------------------------------------------
    # 3) IGNORE/ACK OTHER EVENTS
    # ----------------------------------------------------------------
    return jsonify({'status': 'ignored', 'type': etype}), 200
