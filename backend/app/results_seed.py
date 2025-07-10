from datetime import datetime
from backend.app.wsgi import create_app
from app.extensions import db
from app.models import User, Quiz, QuizSubmission, QuizResult, Exercise, ExerciseQuestion, StudentSubmission

app = create_app()

def grade_some_students():
    with app.app_context():
        students = User.query.filter_by(role="student").limit(3).all()
        quizzes = Quiz.query.all()
        exercises = Exercise.query.all()

        for student in students:
            for quiz in quizzes:
                # Simulate submission
                submission = QuizSubmission(
                    student_id=student.id,
                    quiz_id=quiz.id,
                    score=80.0,
                    submitted_at=datetime.utcnow(),
                    published=True
                )
                db.session.add(submission)

                # Simulate grading
                result = QuizResult(
                    student_id=student.id,
                    quiz_id=quiz.id,
                    score=80.0,
                    feedback="Bon travail! Continue comme ça.",
                    graded_at=datetime.utcnow(),
                    published=True,
                    published_at=datetime.utcnow()
                )
                db.session.add(result)

            for exercise in exercises:
                questions = ExerciseQuestion.query.filter_by(exercise_id=exercise.id).all()
                for q in questions:
                    submission = StudentSubmission(
                        student_id=student.id,
                        exercise_id=exercise.id,
                        question_id=q.id,
                        answer_text="Réponse exemple.",
                        grade=9.5,
                        submitted_at=datetime.utcnow(),
                        published=True,
                        published_at=datetime.utcnow()
                    )
                    db.session.add(submission)

        db.session.commit()
        print("✅ Résultats de quiz et exercices ajoutés pour quelques étudiants.")

if __name__ == "__main__":
    grade_some_students()
