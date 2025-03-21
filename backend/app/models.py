from . import db
from datetime import datetime

class School(db.Model):
    __tablename__ = 'schools'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('User', backref='school', lazy=True)

    def __repr__(self):
        return f"<School {self.name}>"

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'professor', 'student'
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.full_name} ({self.role})>"
