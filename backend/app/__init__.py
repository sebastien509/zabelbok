from flasgger import Swagger
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask
import os
from app.extensions import db, migrate, bcrypt, jwt
import yaml

def create_app():
    load_dotenv()
    app = Flask(__name__)
    # CORS(app, origins=["http://localhost:5173"])  # Allow requests only from your frontend    
    app.config.from_object('config.Config')

    CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "https://e-strateji.vercel.app"
    ])
    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with open('app/docs/swagger.yaml', 'r') as f:
        swagger_template = yaml.safe_load(f)

    swagger_config = {
        "headers": [],  # ✅ Add this line
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


    # Log environment
    app.logger.info(f"🚀 Starting app in {app.config.get('ENV', 'production')} mode")
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173').strip()
    cors_origins = [frontend_url, 'https://e-strateji.vercel.app']
    app.logger.info(f"🌐 All CORS Origins: {cors_origins}")

    # Register routes
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




    # app.register_blueprint(auth_bp)
    # app.register_blueprint(course_bp)
    # app.register_blueprint(lecture_bp)
    # app.register_blueprint(book_bp)
    # app.register_blueprint(exercise_bp)
    # app.register_blueprint(message_bp)
    # app.register_blueprint(offline_bp)
    # app.register_blueprint(quiz_bp)
    # app.register_blueprint(result_bp)
    # app.register_blueprint(school_bp)
    # app.register_blueprint(notification_bp)
    # app.register_blueprint(analytics_bp)
    # app.register_blueprint(progress_bp)
    # app.register_blueprint(module_bp)
    # app.register_blueprint(upload_bp)


    blueprints = [
        auth_bp, course_bp, lecture_bp, book_bp, exercise_bp,
        message_bp, offline_bp, quiz_bp, result_bp, school_bp,
        notification_bp, analytics_bp, progress_bp, module_bp, upload_bp, enrollment_bp
    ]

    for bp in blueprints:
        app.register_blueprint(bp)
        app.logger.info(f"📦 Registered blueprint: {bp.name}")
        

    return app

