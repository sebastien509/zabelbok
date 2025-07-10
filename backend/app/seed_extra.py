from datetime import datetime, timedelta
from backend.wsgi import create_app
from app.extensions import db
from app.models import Course, Exercise, ExerciseQuestion, Quiz, QuizQuestion

app = create_app()

def seed_additional_exercises_and_quizzes():
    with app.app_context():
        course_ids = [1, 2, 3]
        for course_id in course_ids:
            course = Course.query.get(course_id)
            if not course:
                print(f"⚠️ Course with ID {course_id} not found. Skipping...")
                continue

            # Add a new Exercise
            exercise = Exercise(
                title=f"Nouvel Exercice pour {course.title}",
                description="Deuxième exercice ajouté sans soumission.",
                course_id=course.id,
                deadline=datetime.utcnow() + timedelta(days=10)
            )
            db.session.add(exercise)
            db.session.commit()

            for i in range(1, 4):
                question = ExerciseQuestion(
                    exercise_id=exercise.id,
                    question_text=f"Nouvelle Question {i} pour {course.title}."
                )
                db.session.add(question)

            # Add a new Quiz
            quiz = Quiz(
                title=f"Nouveau Quiz de {course.title}",
                description="Deuxième quiz ajouté sans soumission.",
                course_id=course.id,
                deadline=datetime.utcnow() + timedelta(days=10)
            )
            db.session.add(quiz)
            db.session.commit()

            for i in range(1, 6):
                question = QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=f"Nouvelle Question {i} pour le quiz sur {course.title}.",
                    choices={"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
                    correct_answer="B"
                )
                db.session.add(question)

        db.session.commit()
        print("✅ Nouveaux exercices et quizzes ajoutés aux cours 1, 2 et 3.")

if __name__ == '__main__':
    seed_additional_exercises_and_quizzes()
