import os
import zipfile
from flask import Blueprint, send_file, jsonify
from flask_jwt_extended import jwt_required
from app.models import Course, Book, Lecture, Exercise,StudentSubmission
from app.utils.roles import role_required
from io import BytesIO
from flask import request
from app.extensions import db

offline_bp = Blueprint('offline', __name__, url_prefix='/offline')

@offline_bp.route('/download/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
def download_course_zip(course_id):
    course = Course.query.get_or_404(course_id)
    books = Book.query.filter_by(course_id=course_id).all()
    lectures = Lecture.query.filter_by(course_id=course_id).all()
    exercises = Exercise.query.filter_by(course_id=course_id).all()

    zip_stream = BytesIO()

    with zipfile.ZipFile(zip_stream, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add Books
        for book in books:
            zf.writestr(f'books/{book.title}.txt', f'Title: {book.title}\nAuthor: {book.author}\nURL: {book.pdf_url}')

        # Add Lectures
        for lecture in lectures:
            zf.writestr(f'lectures/{lecture.title}.txt', f'Title: {lecture.title}\nContent URL: {lecture.content_url}')

        # Add Exercises
        for exercise in exercises:
            zf.writestr(f'exercises/{exercise.title}.txt', f'Title: {exercise.title}\nQuestion: {exercise.question_text}')

    zip_stream.seek(0)
    filename = f'{course.title.replace(" ", "_")}_offline_content.zip'
    return send_file(zip_stream, as_attachment=True, download_name=filename, mimetype='application/zip')



@offline_bp.route('/sync', methods=['POST'])
@jwt_required()
@role_required('student')
def sync_submissions_view():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify(message="Expected a list of submissions"), 400

    synced = []
    for submission_data in data:
        exercise_id = submission_data.get('exercise_id')
        answer_text = submission_data.get('answer_text')

        if not exercise_id or not answer_text:
            continue

        # Optional: Prevent duplicates if needed
        existing = StudentSubmission.query.filter_by(
            student_id=user_id, exercise_id=exercise_id
        ).first()
        if existing:
            continue

        submission = StudentSubmission(
            student_id=user_id,
            exercise_id=exercise_id,
            answer_text=answer_text
        )
        db.session.add(submission)
        synced.append(exercise_id)

    db.session.commit()
    return jsonify(message=f"Synced {len(synced)} submissions", synced=submission_data), 201
