from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from flask_cors import CORS
from backend.app.config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)
jwt = JWTManager(app)
swagger = Swagger(app)
CORS(app)

# Simple health check
@app.route("/")
def home():
    return "✅ Haiti EduPlatform is live on Railway!"

# Register routes (optional)
from app.routes import main as main_routes
app.register_blueprint(main_routes)
