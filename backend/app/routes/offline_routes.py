import os
import requests
import zipfile
from flask import Blueprint, send_file, jsonify, request
from io import BytesIO
from app.models import (
    Course, 
    Lecture, 
    Book, 
    BookChapter, 
    Quiz, 
    QuizQuestion, 
    Exercise, 
    ExerciseQuestion, 
    Message,
    StudentSubmission,
    QuizSubmission,
    User,
    Notification,
    Module
)
from app.utils.roles import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from flasgger import swag_from
from app.extensions import db
from jinja2 import Template
from app.models import OfflineModuleLog  # Make sure it's imported



offline_bp = Blueprint('offline', __name__, url_prefix='/offline')


@offline_bp.route('/download/professor/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('professor', 'admin')
def download_course_zip_professor(course_id):
    """Download full course ZIP including quizzes and exercises (professors only)"""
    course = Course.query.get_or_404(course_id)
    user_id = get_jwt_identity()
    claims = get_jwt()
    print("User ID:", user_id)
    print("Course Prof ID:", course.professor_id)
    print("Role from JWT:", get_jwt().get("role"))
    # Ensure the professor owns the course
    if int(course.professor_id) != int(user_id):
        print(f"Access denied - Type comparison: professor_id={type(course.professor_id)}, user_id={type(user_id)}")
        return jsonify({"error": "Access denied"}), 403

    # Fetch related items
    lectures = Lecture.query.filter_by(course_id=course_id).all()
    books = Book.query.filter_by(course_id=course_id).all()
    exercises = Exercise.query.filter_by(course_id=course_id).all()
    quizzes = Quiz.query.filter_by(course_id=course_id).all()

    QUIZ_TEMPLATE = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{{ quiz.title }}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2em; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                .question { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #3498db; }
                .choices { margin-left: 20px; }
                .choice { margin: 5px 0; }
                .deadline { color: #e74c3c; font-weight: bold; }
                .description { margin: 15px 0; }
            </style>
        </head>
        <body>
            <h1>{{ quiz.title }}</h1>
            {% if quiz.deadline %}
            <div class="deadline">Deadline: {{ quiz.deadline.strftime('%Y-%m-%d %H:%M') }}</div>
            {% endif %}
            {% if quiz.description %}
            <div class="description">{{ quiz.description }}</div>
            {% endif %}
            
            {% for question in questions %}
            <div class="question">
                <strong>Question {{ loop.index }}:</strong> {{ question.question_text }}
                {% if question.choices %}
                <div class="choices">
                    {% for choice in question.choices %}
                    <div class="choice">{{ loop.index|string + '. ' + choice }}</div>
                    {% endfor %}
                </div>
                {% endif %}
                <div style="margin-top: 10px; color: #27ae60;">
                    <strong>Correct Answer:</strong> {{ question.correct_answer }}
                </div>
            </div>
            {% endfor %}
        </body>
        </html>
        """)

    EXERCISE_TEMPLATE = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{{ exercise.title }}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2em; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                .question { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #3498db; }
                .deadline { color: #e74c3c; font-weight: bold; }
                .description { margin: 15px 0; }
                .resource { color: #2980b9; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>{{ exercise.title }}</h1>
            {% if exercise.deadline %}
            <div class="deadline">Deadline: {{ exercise.deadline.strftime('%Y-%m-%d %H:%M') }}</div>
            {% endif %}
            {% if exercise.description %}
            <div class="description">{{ exercise.description }}</div>
            {% endif %}
            
            {% for question in questions %}
            <div class="question">
                <strong>Question {{ loop.index }}:</strong> {{ question.question_text }}
                {% if question.question_url %}
                <div class="resource">
                    <strong>Resource:</strong> <a href="{{ question.question_url }}">{{ question.question_url }}</a>
                </div>
                {% endif %}
            </div>
            {% endfor %}
        </body>
        </html>
        """)

    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
       # Course Metadata
    # Add comprehensive course overview HTML
        zip_file.writestr(
            f'00_COURSE_OVERVIEW.html',
            course.get_overview_html()
        )



        # 🧠 Lectures (actual files)
        for i, lecture in enumerate(lectures, 1):
            if lecture.content_url:
                try:
                    r = requests.get(lecture.content_url, timeout=10)
                    ext = os.path.splitext(lecture.content_url)[-1] or '.bin'
                    zip_file.writestr(f'lectures/{i}_{lecture.title}{ext}', r.content)
                except Exception as e:
                    zip_file.writestr(f'lectures/{i}_{lecture.title}.txt', f"⚠️ Could not download: {e}")

        # 📚 Books (actual files)
        for i, book in enumerate(books, 1):
            if book.pdf_url:
                try:
                    r = requests.get(book.pdf_url, timeout=10)
                    ext = os.path.splitext(book.pdf_url)[-1] or '.pdf'
                    zip_file.writestr(f'books/{i}_{book.title}{ext}', r.content)
                except Exception as e:
                    zip_file.writestr(f'books/{i}_{book.title}_error.txt', f"⚠️ Could not download: {e}")
            
            # Chapters (as metadata for now)
        for i, book in enumerate(books, 1):
            if book.pdf_url:
                try:
                    r = requests.get(book.pdf_url, timeout=10)
                    ext = os.path.splitext(book.pdf_url)[-1] or '.pdf'
                    zip_file.writestr(f'books/{i}_{book.title}{ext}', r.content)
                except Exception as e:
                    zip_file.writestr(f'books/{i}_{book.title}_error.txt', f"⚠️ Could not download: {e}")
        
        # Enhanced chapter handling - download content like lectures
        for j, chapter in enumerate(sorted(book.chapters, key=lambda c: c.order), 1):
            if chapter.content_url:
                try:
                    r = requests.get(chapter.content_url, timeout=10)
                    ext = os.path.splitext(chapter.content_url)[-1] or '.bin'
                    zip_file.writestr(
                        f'books/{i}_{book.title}/chapters/{j}_{chapter.title}{ext}', 
                        r.content
                    )
                except Exception as e:
                    zip_file.writestr(
                        f'books/{i}_{book.title}/chapters/{j}_{chapter.title}.txt', 
                        f"⚠️ Could not download: {e}\nURL: {chapter.content_url}"
                    )
            else:
                zip_file.writestr(
                    f'books/{i}_{book.title}/chapters/{j}_{chapter.title}.txt', 
                    f"Title: {chapter.title}\nContent URL: None"
                )

        # 📝 Exercises
        for i, exercise in enumerate(exercises, 1):
            questions = sorted(exercise.questions, key=lambda q: q.id)
            html_content = EXERCISE_TEMPLATE.render(
                exercise=exercise,
                questions=questions
            )
            zip_file.writestr(
                f'exercises/{i}_{exercise.title.replace("/", "-")}.html',
                html_content
            )

        # Also keep the original text version in a subfolder
        zip_file.writestr(f'exercises/{i}_{exercise.title}/metadata.txt', f"""\
Title: {exercise.title}
Deadline: {exercise.deadline.isoformat() if exercise.deadline else 'None'}
Description: {exercise.description or 'No description'}
""")

        # ✅ Quizzes
        for i, quiz in enumerate(quizzes, 1):
            zip_file.writestr(f'quizzes/{i}_{quiz.title}.txt', f"""\
Title: {quiz.title}
Deadline: {quiz.deadline.isoformat() if quiz.deadline else 'None'}
Description: {quiz.description or 'No description'}
""")
            for j, question in enumerate(sorted(quiz.questions, key=lambda q: q.id), 1):
                zip_file.writestr(f'quizzes/{i}_{quiz.title}/questions/{j}.txt', f"""\
Question: {question.question_text}
Choices: {', '.join(question.choices)}
Correct Answer: {question.correct_answer}
""")


    zip_buffer.seek(0)
    filename = f'{course.title.replace(" ", "_")}_FULL_professor.zip'
    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name=filename,
        mimetype='application/zip'
    )


@offline_bp.route('/download/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
def download_course_zip(course_id):
    """Download course materials as a zip file for offline use"""
    course = Course.query.get_or_404(course_id)
    user_id = get_jwt_identity()

    # Verify access
    if not course.is_accessible_by(user_id):
        return jsonify({"error": "Unauthorized access to course"}), 403

    lectures = Lecture.query.filter_by(course_id=course_id).all()
    books = Book.query.filter_by(course_id=course_id).all()
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    exercises = Exercise.query.filter_by(course_id=course_id).all()

    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Course Metadata
        zip_file.writestr('course.txt', f"""\
Title: {course.title}
Description: {course.description}
Professor: {course.professor.full_name if course.professor else 'Not assigned'}
""")

        # 🧠 Lectures (actual files)
        for i, lecture in enumerate(lectures, 1):
            if lecture.content_url:
                try:
                    r = requests.get(lecture.content_url, timeout=10)
                    ext = os.path.splitext(lecture.content_url)[-1] or '.bin'
                    zip_file.writestr(f'lectures/{i}_{lecture.title}{ext}', r.content)
                except Exception as e:
                    zip_file.writestr(f'lectures/{i}_{lecture.title}.txt', f"⚠️ Could not download: {e}")

        # 📚 Books (actual files)
        for i, book in enumerate(books, 1):
            if book.pdf_url:
                try:
                    r = requests.get(book.pdf_url, timeout=10)
                    ext = os.path.splitext(book.pdf_url)[-1] or '.pdf'
                    zip_file.writestr(f'books/{i}_{book.title}{ext}', r.content)
                except Exception as e:
                    zip_file.writestr(f'books/{i}_{book.title}_error.txt', f"⚠️ Could not download: {e}")
            
            # Chapters (as metadata for now)
            for j, chapter in enumerate(sorted(book.chapters, key=lambda c: c.order), 1):
                zip_file.writestr(f'books/{i}_{book.title}/chapters/{j}_{chapter.title}.txt', f"""\
Title: {chapter.title}
Content URL: {chapter.content_url or 'None'}
""")

       

    zip_buffer.seek(0)
    filename = f'{course.title.replace(" ", "_")}_offline_materials.zip'
    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name=filename,
        mimetype='application/zip'
    )


@offline_bp.route('/sync', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'submissions': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'type': {'type': 'string', 'enum': ['exercise', 'quiz']},
                                    'id': {'type': 'integer'},
                                    'answers': {'type': 'array'}
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'responses': {
        201: {'description': 'Submissions synced successfully'},
        400: {'description': 'Invalid request format'}
    }
})
def sync_submissions():
    """Sync offline submissions with the server"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    print("[/offline/sync] Incoming data:", data)


    if not isinstance(data, dict) or 'submissions' not in data:
        return jsonify({"error": "Invalid request format"}), 400

    synced_items = []
    errors = []

    for submission in data['submissions']:
        try:
            if submission['type'] == 'exercise':
                exercise_id = submission['id']
                for answer in submission['answers']:
                    existing = StudentSubmission.query.filter_by(
                        student_id=user_id,
                        exercise_id=exercise_id,
                        question_id=answer['question_id']
                    ).first()

                    if not existing:
                        new_submission = StudentSubmission(
                            student_id=user_id,
                            exercise_id=exercise_id,
                            question_id=answer['question_id'],
                            answer_text=answer['answer_text'],
                            submitted_at=datetime.utcnow()
                        )
                        db.session.add(new_submission)
                        synced_items.append({
                            'type': 'exercise',
                            'id': exercise_id,
                            'question_id': answer['question_id']
                        })

            elif submission['type'] == 'quiz':
                quiz_id = submission['id']
                existing = QuizSubmission.query.filter_by(
                    student_id=user_id,
                    quiz_id=quiz_id
                ).first()

                if not existing:
                    new_submission = QuizSubmission(
                        student_id=user_id,
                        quiz_id=quiz_id,
                        answers=submission['answers'],
                        submitted_at=datetime.utcnow()
                    )
                    db.session.add(new_submission)
                    synced_items.append({
                        'type': 'quiz',
                        'id': quiz_id
                    })

        except Exception as e:
            errors.append({
                'submission': submission,
                'error': str(e)
            })

    # Commit all submissions
    db.session.commit()

    # ✅ Trigger notification after successful sync
    if synced_items:
        notif = Notification(
            user_id=user.id,
            message='✅ Your offline submissions were synced successfully!',
            type='sync'
        )
        db.session.add(notif)
        db.session.commit()

    response = {
        'message': f'Synced {len(synced_items)} items',
        'synced_items': synced_items
    }

    if errors:
        response['errors'] = errors

    return jsonify(response), 201


# ================== SYNC ENDPOINTS ==================

@offline_bp.route('/courses', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of courses',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/Course'
                        }
                    }
                }
            }
        }
    }
})
def sync_courses():
    """Get all courses available for offline sync"""
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'school_id': c.school_id,
        'professor_id': c.professor_id,
        'created_at': c.created_at.isoformat()
    } for c in courses]), 200

@offline_bp.route('/lectures', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of lectures',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/Lecture'
                        }
                    }
                }
            }
        }
    }
})
def sync_lectures():
    """Get all lectures available for offline sync"""
    lectures = Lecture.query.all()
    return jsonify([{
        'id': l.id,
        'title': l.title,
        'description': l.description,
        'content_url': l.content_url,
        'course_id': l.course_id,
        'created_at': l.created_at.isoformat()
    } for l in lectures]), 200

@offline_bp.route('/books', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of books',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/Book'
                        }
                    }
                }
            }
        }
    }
})
def sync_books():
    """Get all books available for offline sync"""
    books = Book.query.all()
    return jsonify([{
        'id': b.id,
        'title': b.title,
        'author': b.author,
        'description': b.description,
        'pdf_url': b.pdf_url,
        'course_id': b.course_id,
        'created_at': b.created_at.isoformat()
    } for b in books]), 200

@offline_bp.route('/book-chapters', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of book chapters',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/BookChapter'
                        }
                    }
                }
            }
        }
    }
})
def sync_book_chapters():
    """Get all book chapters available for offline sync"""
    chapters = BookChapter.query.all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'content': c.content,
        'content_url': c.content_url,
        'order': c.order,
        'book_id': c.book_id,
        'created_at': c.created_at.isoformat()
    } for c in chapters]), 200

@offline_bp.route('/quizzes', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of quizzes',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/Quiz'
                        }
                    }
                }
            }
        }
    }
})
def sync_quizzes():
    """Get all quizzes available for offline sync"""
    quizzes = Quiz.query.all()
    return jsonify([{
        'id': q.id,
        'title': q.title,
        'description': q.description,
        'course_id': q.course_id,
        'deadline': q.deadline.isoformat() if q.deadline else None,
        'created_at': q.created_at.isoformat()
    } for q in quizzes]), 200

@offline_bp.route('/quiz-questions', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of quiz questions',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/QuizQuestion'
                        }
                    }
                }
            }
        }
    }
})
def sync_quiz_questions():
    """Get all quiz questions available for offline sync"""
    questions = QuizQuestion.query.all()
    return jsonify([{
        'id': q.id,
        'question_text': q.question_text,
        'choices': q.choices,
        'correct_answer': q.correct_answer,
        'quiz_id': q.quiz_id,
        'created_at': q.created_at.isoformat()
    } for q in questions]), 200

@offline_bp.route('/exercises', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of exercises',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/Exercise'
                        }
                    }
                }
            }
        }
    }
})
def sync_exercises():
    """Get all exercises available for offline sync"""
    exercises = Exercise.query.all()
    return jsonify([{
        'id': e.id,
        'title': e.title,
        'description': e.description,
        'course_id': e.course_id,
        'deadline': e.deadline.isoformat() if e.deadline else None,
        'created_at': e.created_at.isoformat()
    } for e in exercises]), 200

@offline_bp.route('/exercise-questions', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of exercise questions',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/ExerciseQuestion'
                        }
                    }
                }
            }
        }
    }
})
def sync_exercise_questions():
    """Get all exercise questions available for offline sync"""
    questions = ExerciseQuestion.query.all()
    return jsonify([{
        'id': q.id,
        'question_text': q.question_text,
        'question_url': q.question_url,
        'exercise_id': q.exercise_id,
        'created_at': q.created_at.isoformat()
    } for q in questions]), 200

@offline_bp.route('/messages', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'List of user messages',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'array',
                        'items': {
                            '$ref': '#/components/schemas/Message'
                        }
                    }
                }
            }
        }
    }
})
def sync_messages():
    """Get all messages for the current user"""
    user_id = get_jwt_identity()
    messages = Message.query.filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.timestamp.desc()).all()

    return jsonify([{
        'id': m.id,
        'sender_id': m.sender_id,
        'receiver_id': m.receiver_id,
        'content': m.content,
        'timestamp': m.timestamp.isoformat(),
        'read': m.read,
        'thread_id': m.thread_id
    } for m in messages]), 200

@offline_bp.route('/full_sync', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Offline'],
    'responses': {
        200: {
            'description': 'Complete offline sync data',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'courses': {'type': 'array'},
                            'lectures': {'type': 'array'},
                            'books': {'type': 'array'},
                            'book_chapters': {'type': 'array'},
                            'quizzes': {'type': 'array'},
                            'quiz_questions': {'type': 'array'},
                            'exercises': {'type': 'array'},
                            'exercise_questions': {'type': 'array'},
                            'messages': {'type': 'array'}
                        }
                    }
                }
            }
        }
    }
})
def full_sync():
    """Get all data needed for offline sync in one request"""
    user_id = get_jwt_identity()
    
    # Get all courses the user has access to
    courses = Course.query.filter(
        (Course.professor_id == user_id) | 
        (Course.students.any(id=user_id))
    ).all()

    course_ids = [c.id for c in courses]

    # Fetch related data
    lectures = Lecture.query.filter(Lecture.course_id.in_(course_ids)).all()
    books = Book.query.filter(Book.course_id.in_(course_ids)).all()
    book_chapters = BookChapter.query.filter(BookChapter.book_id.in_([b.id for b in books])).all()
    quizzes = Quiz.query.filter(Quiz.course_id.in_(course_ids)).all()
    quiz_questions = QuizQuestion.query.filter(QuizQuestion.quiz_id.in_([q.id for q in quizzes])).all()
    exercises = Exercise.query.filter(Exercise.course_id.in_(course_ids)).all()
    exercise_questions = ExerciseQuestion.query.filter(ExerciseQuestion.exercise_id.in_([e.id for e in exercises])).all()
    messages = Message.query.filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).all()

    return jsonify({
        'courses': [{
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'school_id': c.school_id,
            'professor_id': c.professor_id,
            'created_at': c.created_at.isoformat()
        } for c in courses],
        'lectures': [{
            'id': l.id,
            'title': l.title,
            'description': l.description,
            'content_url': l.content_url,
            'course_id': l.course_id,
            'created_at': l.created_at.isoformat()
        } for l in lectures],
        'books': [{
            'id': b.id,
            'title': b.title,
            'author': b.author,
            'description': b.description,
            'pdf_url': b.pdf_url,
            'course_id': b.course_id,
            'created_at': b.created_at.isoformat()
        } for b in books],
        'book_chapters': [{
            'id': c.id,
            'title': c.title,
            'content': c.content,
            'content_url': c.content_url,
            'order': c.order,
            'book_id': c.book_id,
            'created_at': c.created_at.isoformat()
        } for c in book_chapters],
        'quizzes': [{
            'id': q.id,
            'title': q.title,
            'description': q.description,
            'course_id': q.course_id,
            'deadline': q.deadline.isoformat() if q.deadline else None,
            'created_at': q.created_at.isoformat()
        } for q in quizzes],
        'quiz_questions': [{
            'id': q.id,
            'question_text': q.question_text,
            'choices': q.choices,
            'correct_answer': q.correct_answer,
            'quiz_id': q.quiz_id,
            'created_at': q.created_at.isoformat()
        } for q in quiz_questions],
        'exercises': [{
            'id': e.id,
            'title': e.title,
            'description': e.description,
            'course_id': e.course_id,
            'deadline': e.deadline.isoformat() if e.deadline else None,
            'created_at': e.created_at.isoformat()
        } for e in exercises],
        'exercise_questions': [{
            'id': q.id,
            'question_text': q.question_text,
            'question_url': q.question_url,
            'exercise_id': q.exercise_id,
            'created_at': q.created_at.isoformat()
        } for q in exercise_questions],
        'messages': [{
            'id': m.id,
            'sender_id': m.sender_id,
            'receiver_id': m.receiver_id,
            'content': m.content,
            'timestamp': m.timestamp.isoformat(),
            'read': m.read,
            'thread_id': m.thread_id
        } for m in messages]
    }), 200



@offline_bp.route('/log/module-available', methods=['POST'])
@jwt_required()
def log_module_offline_access():
    """Log that a module is available for offline use"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    module_id = data.get('module_id')
    if not module_id:
        return jsonify({'error': 'Missing module_id'}), 400

    # Check if already logged
    existing_log = OfflineModuleLog.query.filter_by(user_id=user_id, module_id=module_id).first()

    if not existing_log:
        new_log = OfflineModuleLog(
            user_id=user_id,
            module_id=module_id,
            is_available_offline=True
        )
        db.session.add(new_log)
    else:
        existing_log.is_available_offline = True
        existing_log.logged_at = datetime.utcnow()

    db.session.commit()
    return jsonify({'message': f'Module {module_id} marked as available offline'}), 201


@offline_bp.route('/module-quizzes', methods=['GET'])
@jwt_required()
def sync_module_quizzes():
    """Get all quizzes linked to modules"""
    quizzes = Quiz.query.join(Module, Quiz.id == Module.quiz_id).all()
    return jsonify([{
        'id': q.id,
        'title': q.title,
        'description': q.description,
        'course_id': q.course_id,
        'deadline': q.deadline.isoformat() if q.deadline else None,
        'created_at': q.created_at.isoformat(),
        'updated_at': q.updated_at.isoformat() if q.updated_at else None
    } for q in quizzes]), 200

@offline_bp.route('/modules', methods=['GET'])
@jwt_required()
def sync_modules():
    """Get all modules available for offline sync"""
    modules = Module.query.all()
    return jsonify([m.to_dict() for m in modules]), 200