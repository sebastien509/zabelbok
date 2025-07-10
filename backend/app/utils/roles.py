from functools import wraps
from flask import jsonify
from app.models import User
from flask_jwt_extended import get_jwt_identity

# Modified role_required decorator to accept multiple roles
def role_required(*allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role not in allowed_roles:
                return jsonify({"msg": "Forbidden – Insufficient permissions"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
