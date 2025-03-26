from flasgger import Swagger
from dotenv import load_dotenv
from flask import Flask
import os
from app.extensions import db, migrate, bcrypt, jwt

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    Swagger(app, template={
        "swagger": "2.0",
        "info": {
            "title": "Haiti EduPlatform API",
            "description": "Interactive docs with JWT Auth",
            "version": "1.0"
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT token, format: **Bearer &lt;your-token&gt;**"
            }
        },
        "security": [{"Bearer": []}]
    })  # <-- Initialize Flasgger

    # Register routes
    from app.routes.auth_routes import auth_bp
    from app.routes.course_routes import course_bp
    from app.routes.lecture_routes import lecture_bp
    from app.routes.book_routes import book_bp
    from app.routes.exercise_routes import exercise_bp
    from app.routes.message_routes import message_bp
    from app.routes.offline_routes import offline_bp


    app.register_blueprint(auth_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(lecture_bp)
    app.register_blueprint(book_bp)
    app.register_blueprint(exercise_bp)
    app.register_blueprint(message_bp)
    app.register_blueprint(offline_bp)


    return app
