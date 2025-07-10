# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_jwt_extended import JWTManager
# from flasgger import Swagger
# from flask_cors import CORS
# from config import Config
from backend.wsgi import create_app


app = create_app()

# Simple health check
@app.route("/")
def home():
    return "✅ E-strateji is live on Render!"