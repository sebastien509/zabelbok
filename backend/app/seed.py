from datetime import datetime, timedelta
from backend.wsgi import create_app
from app.extensions import db, bcrypt
from app.models import School, User, Course, Exercise, ExerciseQuestion, Quiz, QuizQuestion

app = create_app()

def hash_password(password):
    return bcrypt.generate_password_hash(password).decode('utf-8')

def seed_data():
    with app.app_context():
        db.drop_all()
        # db.create_all()

        # 1. School
        school = School(
            name="Lycée National de Port-au-Prince",
            location="Port-au-Prince, Haïti"
        )
        db.session.add(school)
        db.session.commit()

        # 2. Professor
        professor = User(
            full_name="Jean Michel",
            email="jean@edu.ht",
            role="professor",
            school_id=school.id,
            password=hash_password("securepass")
        )
        db.session.add(professor)

        # 3. Students
        names = [
            "Marie Joseph", "Ricardo Pierre", "Nadine Etienne", "Samuel Jacques",
            "Kettia Charles", "Frantz Dorléans", "Ginette Jean", "Fabrice Desrosiers",
            "Eliane Toussaint", "Mickael Baptiste", "Geraldine Paul", "Marc Antoine"
        ]
        students = []
        for name in names:
            first_name = name.split()[0].lower()
            student = User(
                full_name=name,
                email=f"{first_name}@edu.ht",
                role="student",
                school_id=school.id,
                password=hash_password("securepass")
            )
            db.session.add(student)
            students.append(student)

        db.session.commit()

        # 4. Courses
        courses = [
            Course(
                title="Mathématiques",
                description="Cours complet de mathématiques: algèbre, géométrie, fonctions.",
                professor_id=professor.id,
                school_id=school.id
            ),
            Course(
                title="Sciences Naturelles",
                description="Biologie, physique et chimie pour le bac haïtien.",
                professor_id=professor.id,
                school_id=school.id
            ),
            Course(
                title="Histoire-Haïti",
                description="Histoire complète d'Haïti, depuis l'époque coloniale.",
                professor_id=professor.id,
                school_id=school.id
            )
        ]

        db.session.add_all(courses)
        db.session.commit()

        # 5. Enroll students in all courses
        for course in courses:
            course.students.extend(students)

        db.session.commit()

        # 6. Add Exercises (3 questions each)
        for course in courses:
            exercise = Exercise(
                title=f"Exercice pour {course.title}",
                description="Travail de réflexion basé sur le cours.",
                course_id=course.id,
                deadline=datetime.utcnow() + timedelta(days=7)
            )
            db.session.add(exercise)
            db.session.commit()

            for i in range(1, 4):
                db.session.add(ExerciseQuestion(
                    exercise_id=exercise.id,
                    question_text=f"Question {i} de l'exercice sur {course.title}."
                ))

        # 7. Add Quizzes (5 questions each)
        for course in courses:
            quiz = Quiz(
                title=f"Quiz de {course.title}",
                description="Évaluation formative.",
                course_id=course.id,
                deadline=datetime.utcnow() + timedelta(days=5)
            )
            db.session.add(quiz)
            db.session.commit()

            for i in range(1, 6):
                db.session.add(QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=f"Question {i} du quiz sur {course.title}.",
                    choices={"A": "Choix A", "B": "Choix B", "C": "Choix C", "D": "Choix D"},
                    correct_answer="A"
                ))

        db.session.commit()
        print("✅ Données de démonstration créées avec succès.")

if __name__ == '__main__':
    seed_data()
