import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Default to sqlite for local unless DATABASE_URL is provided
    DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
    USE_SQLITE = os.getenv("USE_SQLITE", "1") == "1" or not DATABASE_URL

    if USE_SQLITE:
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # backend/
        INSTANCE_DB = os.path.join(BASE_DIR, "instance", "eduplatform.db")
        os.makedirs(os.path.dirname(INSTANCE_DB), exist_ok=True)

        SQLALCHEMY_DATABASE_URI = f"sqlite:///{INSTANCE_DB}"
        SQLALCHEMY_ENGINE_OPTIONS = {"connect_args": {"check_same_thread": False}}
    else:
        uri = DATABASE_URL
        if uri.startswith("postgres://"):
            uri = uri.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = uri
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "connect_args": {"sslmode": "require"},
        }
