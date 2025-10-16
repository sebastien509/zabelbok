from flasgger import Swagger
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask
import os
from app.extensions import db, migrate, bcrypt, jwt
import yaml
import logging
import re

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    # ✅ Initialize extensions FIRST
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # ✅ THEN setup CORS
    CORS(app, 
         resources={r"/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["*"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    

    # ✅ Logging setup
    if not app.debug:
        gunicorn_logger = logging.getLogger("gunicorn.error")
        if gunicorn_logger.handlers:
            app.logger.handlers = gunicorn_logger.handlers
            app.logger.setLevel(gunicorn_logger.level)
        else:
            app.logger.setLevel(logging.INFO)
    app.logger.info("✅ Logging system initialized")

    # # ✅ Load allowed frontend origins (comma-separated)
    raw_origins = os.getenv("FRONTEND_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://www.estrateji.com,http://www.estrateji.com")
    origins_list = [o.strip() for o in raw_origins.split(",") if o.strip()]
    exact_origins = [o for o in origins_list if "*" not in o]
    wildcard_patterns = [o for o in origins_list if "*" in o]  # e.g. https://*.vercel.app
    wildcard_regex = "|".join(
        p.replace(".", r"\.").replace("*", r"[a-z0-9-]+") for p in wildcard_patterns
    ) if wildcard_patterns else None

    # # Sensible defaults for local dev
    # exact = exact_origins or [
    #     "http://localhost:5173",
    #     "http://127.0.0.1:5173",
    #     "http://www.estrateji.com",
    #     "http://estrateji.com",
    #     "https://www.estrateji.com"
    # ]

    cors_kwargs = dict(
        resources={r"/*": {"origins": exact}},   # exact allow-list
        supports_credentials=True,               # send/receive cookies if you use them
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        max_age=86400,                           # cache preflight ~1 day
    )

    # If you also want to allow preview subdomains (e.g., Vercel),
    # add a strict regex. Flask-CORS will echo the *matched* origin.
    # if wildcard_regex:
    #     cors_kwargs["origins_regex"] = f"^({wildcard_regex})$"

    # CORS(app, **cors_kwargs)
    # # ✅ Init extensions
    # db.init_app(app)
    # migrate.init_app(app, db)
    # bcrypt.init_app(app)
    # jwt.init_app(app)

    # ✅ Swagger config
    with open('app/docs/swagger.yaml', 'r') as f:
        swagger_template = yaml.safe_load(f)
    Swagger(app, template=swagger_template, config={
        "headers": [],
        "specs": [{"endpoint": 'apispec_1', "route": '/apispec_1.json',
                   "rule_filter": lambda rule: True, "model_filter": lambda tag: True}],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs"
    })

    # Logs for visibility
    app.logger.info(f"🚀 Starting app in {app.config.get('ENV', 'production')} mode")
    app.logger.info(f"🌐 Exact CORS Origins: {exact_origins}")
    if wildcard_regex:
        app.logger.info(f"🌐 Wildcard CORS Regex: {wildcard_regex}")

    # ✅ Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.course_routes import course_bp
    from app.routes.lecture_routes import lecture_bp
    from app.routes.book_routes import book_bp
    from app.routes.exercise_routes import exercise_bp
    from app.routes.message_routes import message_bp
    from app.routes.offline_routes import offline_bp
    from app.routes.quiz_routes import quiz_bp
    from app.routes.result_routes import result_bp
    from app.routes.school_routes import school_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.analytics_routes import analytics_bp
    from app.routes.student_progress import progress_bp
    from app.routes.module_routes import module_bp
    from app.routes.upload_bp import upload_bp
    from app.routes.enrollments_routes import enrollment_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.webhook_routes import webhook_bp

    for bp in [auth_bp, course_bp, lecture_bp, book_bp, exercise_bp,
               message_bp, offline_bp, quiz_bp, result_bp, school_bp,
               notification_bp, analytics_bp, progress_bp, module_bp,
               upload_bp, enrollment_bp, payment_bp, webhook_bp]:
        app.register_blueprint(bp)
        app.logger.info(f"📦 Registered blueprint: {bp.name}")

    # (Optional) health route for Render and local checks
    @app.get("/health")
    def health():
        return {"ok": True, "service": "api"}, 200

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.exception(f"❗️Unhandled Exception: {str(e)}")
        return {"error": "Internal server error"}, 500

    return app
