import os
import stripe 
from dotenv import load_dotenv
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///eduplatform.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'supersecret')
    SWAGGER = {
        'title': 'Haiti EduPlatform API',
        'uiversion': 3
    }
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

