from flasgger import Swagger
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask
import os
from app.extensions import db, migrate, bcrypt, jwt
import yaml
import logging



def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object('config.Config')
    app.config["ENV"] = "production"
    app.config["DEBUG"] = False
    app.config["TESTING"] = False


    # ✅ Logging setup
    if not app.debug:
        gunicorn_logger = logging.getLogger("gunicorn.error")
        if gunicorn_logger.handlers:
            app.logger.handlers = gunicorn_logger.handlers
            app.logger.setLevel(gunicorn_logger.level)
        else:
            app.logger.setLevel(logging.INFO)

    app.logger.info("✅ Logging system initialized")


    # ✅ Load origins from .env
    raw_origins = os.getenv("FRONTEND_CORS_ORIGINS", "http://localhost:5173")
    origins_list = [o.strip() for o in raw_origins.split(",") if o.strip()]
    exact_origins = [o for o in origins_list if "*" not in o]
    wildcard_patterns = [o.replace(".", r"\.").replace("*", r"[a-z0-9]+") for o in origins_list if "*" in o]
    origins_regex = "|".join(wildcard_patterns) if wildcard_patterns else None

    # ✅ Apply CORS

# Allow credentials + Vercel previews using regex
    CORS(
    app,
    supports_credentials=True,
    origins_regex=f"^({origins_regex})$" if origins_regex else None
)


    # ✅ Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # ✅ Swagger config
    with open('app/docs/swagger.yaml', 'r') as f:
        swagger_template = yaml.safe_load(f)

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec_1',
                "route": '/apispec_1.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs"
    }

    Swagger(app, template=swagger_template, config=swagger_config)

    # ✅ Logging CORS setup
    app.logger.info(f"🚀 Starting app in {app.config.get('ENV', 'production')} mode")
    app.logger.info(f"🌐 Exact CORS Origins: {exact_origins}")
    if origins_regex:
        app.logger.info(f"🌐 Wildcard CORS Regex: {origins_regex}")



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

    blueprints = [
        auth_bp, course_bp, lecture_bp, book_bp, exercise_bp,
        message_bp, offline_bp, quiz_bp, result_bp, school_bp,
        notification_bp, analytics_bp, progress_bp, module_bp,
        upload_bp, enrollment_bp
    ]

    for bp in blueprints:
        app.register_blueprint(bp)
        app.logger.info(f"📦 Registered blueprint: {bp.name}")

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.exception(f"❗️Unhandled Exception: {str(e)}")
        return {"error": "Internal server error"}, 500

    return app
