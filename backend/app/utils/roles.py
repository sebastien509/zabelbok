from flask_jwt_extended import get_jwt_identity
from functools import wraps
from flask import jsonify
from app.models import User

def role_required(*allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorated_view(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user or user.role not in allowed_roles:
                return jsonify(message="Access denied: insufficient permissions"), 403

            return fn(*args, **kwargs)
        return decorated_view
    return wrapper
