# app/models.py
from datetime import datetime
from app.extensions import db, bcrypt
import os
from sqlalchemy import func, inspect
from sqlalchemy.exc import ProgrammingError, OperationalError
from sqlalchemy.ext.associationproxy import association_proxy
from decimal import Decimal


# ============================================================
# SCHOOL
# ============================================================

class School(db.Model):
    __tablename__ = 'schools'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('User', backref='school', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ============================================================
# USER
# ============================================================

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin | professor | student | creator | Learner
    profile_image_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    language = db.Column(db.String(5), default='en')  # en, ht, fr
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Style / public profile
    theme = db.Column(db.String(20), default="theme-1")  # 'theme-1' | 'theme-2' | 'theme-3'
    color = db.Column(db.Boolean, default=False)         # palette flag: False -> color-1, True -> color-2
    banner_url = db.Column(db.String(255), nullable=True)

    # Public slug
    slug = db.Column(db.String(120), unique=True, index=True)

    # Enrollments (through Enrollment model)
    enrollments = db.relationship(
        "Enrollment",
        back_populates="user",
        cascade="all, delete-orphan",
    )



    # Courses authored (for professors/creators)
    courses_authored = db.relationship(
        'Course',
        backref=db.backref('author', lazy=True),
        foreign_keys='Course.professor_id',
        lazy=True
    )

    # Password helpers
    @property
    def password(self):
        raise Exception("Passwords cannot be accessed directly.")

    @password.setter
    def password(self, value):
        self.password_hash = bcrypt.generate_password_hash(value).decode('utf-8')

    def authenticate(self, user_password):
        return bcrypt.check_password_hash(self.password_hash, user_password)

    @property
    def courses(self):
        # For backward compatibility; enrolled courses for students
        return self.enrolled_courses

    # Serializers
    def to_dict(self, include_courses=False, include_enrollments=False):
        data = {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'role': self.role,
            'school_id': self.school_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profile_image_url': self.profile_image_url,
            'bio': self.bio,
            'language': self.language,
            'theme': self.theme,
            'color': self.color,
            'banner_url': self.banner_url,
            'slug': self.slug,
        }

        if include_courses:
            if self.role in ("professor", "creator"):
                data["courses"] = [
                    course.to_creator_dict()  # includes payments snapshot
                    for course in (self.courses_authored or [])
                ]
            elif self.role == "student":
                data["courses"] = [course.to_dict(include_nested=True) for course in self.enrolled_courses]

        if include_enrollments:
            data["enrollments"] = [
                {"course_id": e.course_id, "enrolled_at": e.enrolled_at.isoformat()}
                for e in self.enrollments
            ]

        return data

    def to_public_dict(self, include_courses=False):
        data = {
            "id": self.id,
            "slug": self.slug,
            "full_name": self.full_name,
            "bio": self.bio,
            "language": self.language,
            "profile_image_url": self.profile_image_url,
            "banner_url": self.banner_url,
            "theme": self.theme,
            "color": self.color,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_courses and self.role in ("professor", "creator"):
            data["courses"] = [c.to_public_dict() for c in (self.courses_authored or [])]
        return data


# ============================================================
# COURSE
# ============================================================

class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"), nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Monetization (platform-led)
    is_paid = db.Column(db.Boolean, nullable=False, default=False)
    currency = db.Column(db.String(10), nullable=False, default="usd")
    price_cents = db.Column(db.Integer, nullable=False, default=0)
    revenue_share_pct = db.Column(db.Numeric(5, 4), nullable=False, default=Decimal("0.8800"))
    stripe_product_id = db.Column(db.String(120))
    stripe_price_id = db.Column(db.String(120))

    # Content relationships
    modules = db.relationship("Module", backref="course", lazy=True)
    lectures = db.relationship("Lecture", backref="course", lazy=True)
    books = db.relationship("Book", backref="course", lazy=True)
    exercises = db.relationship("Exercise", backref="course", lazy=True)
    quizzes = db.relationship("Quiz", backref="course", lazy=True)

    # Professor relationship (ONLY ONCE)
    professor = db.relationship(
        "User",
        foreign_keys=[professor_id],
        overlaps="author,courses_authored,professor,courses",
    )

    # Enrollment relationships (Enrollment is a model)
    enrollments = db.relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan",
    )

    # ✅ Students relationship via Enrollment table (read-only list of User)
    students = db.relationship(
        "User",
        secondary="enrollments",
        primaryjoin="Course.id == Enrollment.course_id",
        secondaryjoin="User.id == Enrollment.user_id",
        viewonly=True,
        lazy="select",
    )


    # ---- Access helpers (uses Enrollment) ----
    def is_accessible_by(self, user_id):
        if user_id == self.professor_id:
            return True
        from app.models import Enrollment
        return db.session.query(
            db.exists()
            .where(Enrollment.course_id == self.id)
            .where(Enrollment.user_id == user_id)
        ).scalar()

    # ---- Payments snapshot (safe) ----
    def _payments_snapshot(self):
        if os.getenv("ESTRATEJI_PAYMENTS_ENABLED", "1").lower() in {"0", "false", "off", "no"}:
            return {
                "orders_count": 0,
                "gross_cents": 0,
                "platform_fee_cents": 0,
                "creator_earned_cents": 0,
                "currency": self.currency or "usd",
            }

        insp = inspect(db.engine)
        if not (insp.has_table("orders") and insp.has_table("order_items")):
            return {
                "orders_count": 0,
                "gross_cents": 0,
                "platform_fee_cents": 0,
                "creator_earned_cents": 0,
                "currency": self.currency or "usd",
            }

        try:
            # Order / OrderItem must exist in models
            q = (
                db.session.query(
                    func.coalesce(func.sum(OrderItem.gross_amount), 0),
                    func.coalesce(func.sum(OrderItem.platform_fee_amount), 0),
                    func.coalesce(func.sum(OrderItem.creator_amount), 0),
                    func.count(OrderItem.id),
                )
                .join(Order, OrderItem.order_id == Order.id)
                .filter(OrderItem.course_id == self.id, Order.status == "paid")
            )
            gross_sum, fee_sum, creator_sum, count_items = q.first()
            return {
                "orders_count": int(count_items or 0),
                "gross_cents": int(gross_sum or 0),
                "platform_fee_cents": int(fee_sum or 0),
                "creator_earned_cents": int(creator_sum or 0),
                "currency": self.currency or "usd",
            }
        except (ProgrammingError, OperationalError):
            db.session.rollback()
            return {
                "orders_count": 0,
                "gross_cents": 0,
                "platform_fee_cents": 0,
                "creator_earned_cents": 0,
                "currency": self.currency or "usd",
            }

    # ---- Serializers ----
    def to_public_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "school_id": self.school_id,
            "professor_id": self.professor_id,
            "professor_name": self.professor.full_name if self.professor else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "student_count": len(self.students),
            "is_paid": self.is_paid,
            "currency": self.currency,
            "price_cents": self.price_cents if self.is_paid else 0,
        }

    def to_creator_dict(self, include_nested=False):
        base = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "school_id": self.school_id,
            "professor_id": self.professor_id,
            "professor_name": self.professor.full_name if self.professor else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "student_count": len(self.students),
            "payments": {
                "is_paid": self.is_paid,
                "currency": self.currency,
                "price_cents": self.price_cents,
                "revenue_share_pct": float(self.revenue_share_pct) if self.revenue_share_pct is not None else None,
                "snapshot": self._payments_snapshot(),
            },
        }
        if include_nested:
            base.update({
                "lectures": [l.to_dict() for l in self.lectures],
                "books": [b.to_dict() for b in self.books],
                "quizzes": [q.to_dict() for q in self.quizzes],
                "exercises": [e.to_dict() for e in self.exercises],
                "students": [s.to_dict() for s in self.students],
                "modules": [m.to_dict() for m in self.modules],
            })
        return base

    def to_dict(self, include_nested=False):
        """
        General internal view (used widely). Includes a minimal safe payments block.
        """
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "school_id": self.school_id,
            "professor_id": self.professor_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "student_count": len(self.students),
            "professor_name": self.professor.full_name if self.professor else None,
            "payments": {
                "is_paid": self.is_paid,
                "currency": self.currency,
                "price_cents": self.price_cents,
                "revenue_share_pct": float(self.revenue_share_pct) if self.revenue_share_pct is not None else None,
            },
        }
        if include_nested:
            data.update({
                "lectures": [l.to_dict() for l in self.lectures],
                "books": [b.to_dict() for b in self.books],
                "quizzes": [q.to_dict() for q in self.quizzes],
                "exercises": [e.to_dict() for e in self.exercises],
                "students": [s.to_dict() for s in self.students],
                "modules": [m.to_dict() for m in self.modules],
            })
        return data

    # ---- Course stats / overview ----
    def get_stats(self):
        return {
            "lectures": {
                "count": len(self.lectures),
                "with_content": sum(1 for l in self.lectures if l.content_url),
                "total_size": sum(len(l.content_url or "") for l in self.lectures)
            },
            "books": {
                "count": len(self.books),
                "chapters": sum(len(b.chapters) for b in self.books),
                "with_pdf": sum(1 for b in self.books if b.pdf_url)
            },
            "quizzes": {
                "count": len(self.quizzes),
                "questions": sum(len(q.questions) for q in self.quizzes),
                "active": sum(1 for q in self.quizzes if q.deadline and q.deadline > datetime.utcnow())
            },
            "exercises": {
                "count": len(self.exercises),
                "questions": sum(len(e.questions) for e in self.exercises),
                "active": sum(1 for e in self.exercises if e.deadline and e.deadline > datetime.utcnow())
            },
            "students": {"count": len(self.students)}
        }

    def get_overview_html(self):
        stats = self.get_stats()
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{self.title} - Course Overview</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 2em; }}
                h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; }}
                .stats-container {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }}
                .stat-card {{ background: #f8f9fa; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
                .stat-card h3 {{ margin-top: 0; color: #3498db; }}
                .stat-item {{ margin: 10px 0; }}
                .stat-label {{ font-weight: bold; }}
                .stat-value {{ color: #2c3e50; }}
                .description {{ margin: 20px 0; line-height: 1.6; }}
            </style>
        </head>
        <body>
            <h1>{self.title}</h1>
            <div class="description">{self.description or "No description available"}</div>
            <div class="course-meta">
                <p><strong>Professor:</strong> {self.professor.full_name if self.professor else "Not assigned"}</p>
                <p><strong>Created:</strong> {self.created_at.strftime('%Y-%m-%d') if self.created_at else "Unknown"}</p>
                <p><strong>Students enrolled:</strong> {stats['students']['count']}</p>
            </div>
            <h2>Course Statistics</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3>Lectures</h3>
                    <div class="stat-item"><span class="stat-label">Total:</span> <span class="stat-value">{stats['lectures']['count']}</span></div>
                    <div class="stat-item"><span class="stat-label">With content:</span> <span class="stat-value">{stats['lectures']['with_content']}</span></div>
                </div>
                <div class="stat-card">
                    <h3>Books</h3>
                    <div class="stat-item"><span class="stat-label">Total:</span> <span class="stat-value">{stats['books']['count']}</span></div>
                    <div class="stat-item"><span class="stat-label">Chapters:</span> <span class="stat-value">{stats['books']['chapters']}</span></div>
                    <div class="stat-item"><span class="stat-label">With PDFs:</span> <span class="stat-value">{stats['books']['with_pdf']}</span></div>
                </div>
                <div class="stat-card">
                    <h3>Quizzes</h3>
                    <div class="stat-item"><span class="stat-label">Total:</span> <span class="stat-value">{stats['quizzes']['count']}</span></div>
                    <div class="stat-item"><span class="stat-label">Questions:</span> <span class="stat-value">{stats['quizzes']['questions']}</span></div>
                    <div class="stat-item"><span class="stat-label">Active:</span> <span class="stat-value">{stats['quizzes']['active']}</span></div>
                </div>
                <div class="stat-card">
                    <h3>Exercises</h3>
                    <div class="stat-item"><span class="stat-label">Total:</span> <span class="stat-value">{stats['exercises']['count']}</span></div>
                    <div class="stat-item"><span class="stat-label">Questions:</span> <span class="stat-value">{stats['exercises']['questions']}</span></div>
                    <div class="stat-item"><span class="stat-label">Active:</span> <span class="stat-value">{stats['exercises']['active']}</span></div>
                </div>
            </div>
        </body>
        </html>
        """
        return html


# ============================================================
# BOOKS & CHAPTERS
# ============================================================

class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    author = db.Column(db.String(100))
    pdf_url = db.Column(db.String(300))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    chapters = db.relationship('BookChapter', backref='book', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'pdf_url': self.pdf_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'chapters': [ch.to_dict() for ch in self.chapters]
        }


class BookChapter(db.Model):
    __tablename__ = 'book_chapters'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content_url = db.Column(db.String(300))
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content_url': self.content_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# LECTURE
# ============================================================

class Lecture(db.Model):
    __tablename__ = 'lectures'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content_url = db.Column(db.String(300))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content_url': self.content_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# EXERCISE
# ============================================================

class Exercise(db.Model):
    __tablename__ = 'exercises'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    deadline = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    questions = db.relationship('ExerciseQuestion', backref='exercise', lazy=True)
    submissions = db.relationship('StudentSubmission', backref='exercise', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'course_id': self.course_id,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'questions': [q.to_dict() for q in self.questions]
        }


class ExerciseQuestion(db.Model):
    __tablename__ = 'exercise_questions'

    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_url = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'question_text': self.question_text,
            'question_url': self.question_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class StudentSubmission(db.Model):
    __tablename__ = 'student_submissions'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'))
    question_id = db.Column(db.Integer, db.ForeignKey('exercise_questions.id'))
    answer_text = db.Column(db.Text, nullable=False)
    grade = db.Column(db.Float)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime)

    student = db.relationship('User', backref='exercise_submissions', foreign_keys=[student_id])


# ============================================================
# QUIZ
# ============================================================

class Quiz(db.Model):
    __tablename__ = 'quizzes'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    deadline = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    questions = db.relationship('QuizQuestion', backref='quiz', lazy=True)
    submissions = db.relationship('QuizSubmission', backref='quiz', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'course_id': self.course_id,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'questions': [q.to_dict() for q in self.questions]
        }


class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    choices = db.Column(db.JSON)
    correct_answer = db.Column(db.String(5))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'question_text': self.question_text,
            'choices': self.choices,
            'correct_answer': self.correct_answer,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class QuizSubmission(db.Model):
    __tablename__ = 'quiz_submissions'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'))
    score = db.Column(db.Float)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    published = db.Column(db.Boolean, default=False)

    student = db.relationship('User', backref='quiz_submissions', foreign_keys=[student_id])


class QuizAnswer(db.Model):
    __tablename__ = 'quiz_answers'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('quiz_submissions.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('quiz_questions.id'), nullable=False)
    selected_answer = db.Column(db.String(5), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)

    question = db.relationship('QuizQuestion')


class QuizResult(db.Model):
    __tablename__ = 'quiz_results'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    feedback = db.Column(db.Text)
    graded_at = db.Column(db.DateTime, default=datetime.utcnow)
    published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime)

    student = db.relationship('User', backref='quiz_results')
    quiz = db.relationship('Quiz', backref='quiz_results')


# ============================================================
# MESSAGES / THREADS
# ============================================================

class Thread(db.Model):
    __tablename__ = 'threads'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    participants = db.relationship('ThreadParticipant', backref='thread', lazy=True)
    messages = db.relationship('Message', backref='thread', lazy=True)


class ThreadParticipant(db.Model):
    __tablename__ = 'thread_participants'

    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.Integer, db.ForeignKey('threads.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    user = db.relationship('User')


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.Integer, db.ForeignKey('threads.id'))
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User')


# ============================================================
# ACTIVITY LOG
# ============================================================

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    event = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


# ============================================================
# NOTIFICATIONS
# ============================================================

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    title = db.Column(db.String(120))
    message = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50))        # 'quiz' | 'message' | 'sync' | 'platform'
    related_id = db.Column(db.Integer)

    has_cta = db.Column(db.Boolean, default=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "related_id": self.related_id,
            "has_cta": self.has_cta,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None
        }


# ============================================================
# MODULES / CHAPTERS / PROGRESS
# ============================================================

class Module(db.Model):
    __tablename__ = 'modules'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    video_url = db.Column(db.String(300), nullable=False)
    transcript = db.Column(db.Text)
    caption_url = db.Column(db.String(300))
    order = db.Column(db.Integer, nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('course_chapters.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    quiz = db.relationship('Quiz', backref='module', lazy='joined')

    def to_dict(self, include_nested=False):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'video_url': self.video_url,
            'transcript': self.transcript,
            'caption_url': self.caption_url,
            'order': self.order,
            'course_id': self.course_id,
            'quiz_id': self.quiz_id,
            'creator_id': self.creator_id,
            'chapter_id': self.chapter_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_nested and self.quiz:
            data['quiz'] = self.quiz.to_dict()
        return data


class CourseChapter(db.Model):
    __tablename__ = 'course_chapters'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    modules = db.relationship('Module', backref='chapter', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'course_id': self.course_id,
            'order': self.order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'modules': [m.to_dict() for m in self.modules]
        }


class ModuleProgress(db.Model):
    __tablename__ = 'module_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module_id': self.module_id,
            'is_completed': self.is_completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class OfflineModuleLog(db.Model):
    __tablename__ = 'offline_module_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    is_available_offline = db.Column(db.Boolean, default=False)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module_id': self.module_id,
            'is_available_offline': self.is_available_offline,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None
        }


# ============================================================
# ENROLLMENTS / COMPLETIONS
# ============================================================

class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="enrollments")
    course = db.relationship("Course", back_populates="enrollments")

    __table_args__ = (
        db.UniqueConstraint("user_id", "course_id", name="_user_course_uc"),
    )


class CourseCompletion(db.Model):
    __tablename__ = "course_completions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False, index=True)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "course_id", name="uq_user_course_completion"),
    )

    user = db.relationship("User", backref=db.backref("course_completions", cascade="all, delete-orphan"))
    course = db.relationship("Course", backref=db.backref("completions", cascade="all, delete-orphan"))


# ============================================================
# STRIPE / PAYMENTS
# ============================================================

class CreatorPayoutAccount(db.Model):
    __tablename__ = 'creator_payout_accounts'

    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    stripe_account_id = db.Column(db.String(120), nullable=False, unique=True, index=True)
    onboarding_completed = db.Column(db.Boolean, default=False)
    details_submitted = db.Column(db.Boolean, default=False)
    charges_enabled = db.Column(db.Boolean, default=False)
    payouts_enabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    creator = db.relationship('User', backref=db.backref('payout_account', uselist=False))


class PlatformCustomer(db.Model):
    __tablename__ = 'platform_customers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    stripe_customer_id = db.Column(db.String(120), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('stripe_customer', uselist=False))


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    total_amount = db.Column(db.Integer, nullable=False)  # cents
    currency = db.Column(db.String(10), default="usd")
    status = db.Column(db.String(30), default="pending")  # pending | paid | refunded | failed | partially_refunded
    stripe_checkout_session_id = db.Column(db.String(120), index=True)
    stripe_payment_intent_id = db.Column(db.String(120), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    buyer = db.relationship('User')
    items = db.relationship('OrderItem', back_populates='order', cascade="all, delete-orphan")


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    gross_amount = db.Column(db.Integer, nullable=False)          # cents
    platform_fee_amount = db.Column(db.Integer, nullable=False)   # cents
    creator_amount = db.Column(db.Integer, nullable=False)        # cents (planned transfer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    order = db.relationship('Order', back_populates='items')
    course = db.relationship('Course')
    creator = db.relationship('User')


class TransferLog(db.Model):
    __tablename__ = 'transfer_logs'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    order_item_id = db.Column(db.Integer, db.ForeignKey('order_items.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stripe_transfer_id = db.Column(db.String(120))
    amount = db.Column(db.Integer, nullable=False)  # cents
    status = db.Column(db.String(30), default="created")  # created | failed | reversed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class RefundLog(db.Model):
    __tablename__ = 'refund_logs'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    stripe_charge_id = db.Column(db.String(120), index=True)
    stripe_refund_id = db.Column(db.String(120), unique=True)
    amount = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class WebhookEvent(db.Model):
    __tablename__ = 'webhook_events'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.String(120), unique=True, nullable=False)
    type = db.Column(db.String(120))
    payload = db.Column(db.JSON)
    received_at = db.Column(db.DateTime, default=datetime.utcnow)
