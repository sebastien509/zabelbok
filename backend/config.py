import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('postgresql://postgres:uWnVZogsYTSpEhqjgpSeBmrmONjJxsfl@gondola.proxy.rlwy.net:58252/railway', 'sqlite:///eduplatform.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'supersecret')
    SWAGGER = {
        'title': 'Haiti EduPlatform API',
        'uiversion': 3
    }
