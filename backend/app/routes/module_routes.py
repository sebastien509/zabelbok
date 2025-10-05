# routes/module_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
from werkzeug.exceptions import BadRequest

from app.extensions import db
from app.models import (
    Module,
    ModuleProgress,
    OfflineModuleLog,
    CourseChapter,
    User,
    Quiz,
    QuizQuestion,
    Course,  # ownership checks
)
from app.utils.roles import role_required

from datetime import datetime
from sqlalchemy.exc import IntegrityError, ProgrammingError, OperationalError, DataError
import requests
import uuid

# ================== BLUEPRINTS ==================
module_bp = Blueprint("module", __name__, url_prefix="/modules")
chapter_bp = Blueprint("chapter", __name__, url_prefix="/chapters")


# ================== HELPERS ==================
def json_error(message, code=400, **extra):
    payload = {"error": message}
    if extra:
        payload.update(extra)
    return jsonify(payload), code


def validate_payload(data, required):
    missing = [k for k in required if k not in data or data[k] in (None, "")]
    if missing:
        raise BadRequest(f"Missing fields: {', '.join(missing)}")
    return data


def head_ok(url: str) -> bool:
    try:
        r = requests.head(url, timeout=8, allow_redirects=True)
        return r.status_code < 400
    except Exception:
        return False


def extract_audio_url(video_url: str) -> str:
    return video_url


def generate_transcript(_audio_source: str) -> str:
    return (
        "Welcome to this module. We cover key concepts, definitions, and a quick "
        "walkthrough. By the end, you should understand the core ideas and how to apply them."
    )


def generate_captions_vtt(transcript: str) -> str:
    return "WEBVTT\n\n00:00.000 --> 00:05.000\n" + transcript[:80] + "..."


def upload_text_to_cloudinary(_text: str, public_id_prefix: str) -> str:
    # stub: replace with real raw upload if needed
    return f"https://res.cloudinary.com/demo/raw/upload/{public_id_prefix}.vtt"


def generate_quiz(_transcript: str):
    return [
        {
            "question_text": "What is the main goal of this module?",
            "choices": [
                "Introduce key concepts and applications",
                "Discuss unrelated topics",
                "Practice only formatting",
                "Explain company policies",
            ],
            "correct_answer": "Introduce key concepts and applications",
        },
        {
            "question_text": "By the end, you should be able to…",
            "choices": [
                "Apply core ideas",
                "Ignore best practices",
                "Avoid learning outcomes",
                "Delete your progress",
            ],
            "correct_answer": "Apply core ideas",
        },
    ]


def _int_or(value, default=None):
    try:
        return int(value)
    except Exception:
        return default


def _validate_quiz_list(quiz):
    if not isinstance(quiz, list):
        raise BadRequest("Field 'quiz' must be a list.")
    cleaned = []
    for i, q in enumerate(quiz, start=1):
        if not isinstance(q, dict):
            raise BadRequest(f"Quiz item #{i} must be an object.")
        qt = q.get("question_text")
        choices = q.get("choices")
        ca = q.get("correct_answer")
        if not qt or not isinstance(choices, list) or ca is None:
            raise BadRequest(
                f"Quiz item #{i} requires 'question_text' (str), 'choices' (list), and 'correct_answer'."
            )
        cleaned.append({"question_text": qt, "choices": choices, "correct_answer": ca})
    return cleaned


# ================== MODULE CRUD ==================
@module_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("professor")
@swag_from({
    "tags": ["Modules"],
    "summary": "Create a new module (direct create; usually use /process + /publish).",
})
def create_module():
    data = request.get_json() or {}
    user_id = _int_or(get_jwt_identity())
    if not user_id:
        return json_error("Invalid token identity", 401)

    try:
        validate_payload(data, ["title", "video_url", "order", "course_id"])
        course_id = _int_or(data["course_id"])
        order = _int_or(data["order"])
        if course_id is None or order is None:
            return json_error("'course_id' and 'order' must be integers.", 422)

        course = Course.query.get_or_404(course_id)
        if course.professor_id != user_id:
            return json_error("Unauthorized to modify this course", 403)

        module = Module(
            title=data["title"],
            description=data.get("description"),
            video_url=data["video_url"],
            transcript=data.get("transcript"),
            caption_url=data.get("caption_url"),
            order=order,
            course_id=course.id,
            chapter_id=data.get("chapter_id"),
            quiz_id=data.get("quiz_id"),
            creator_id=user_id,  # ensure NOT NULL
            created_at=datetime.utcnow(),
        )
        db.session.add(module)
        db.session.commit()
        return jsonify({"msg": "Module created", "module_id": module.id}), 201

    except BadRequest as e:
        return json_error(str(e), 422)
    except (IntegrityError, DataError) as e:
        db.session.rollback()
        return json_error("Invalid data for Module.", 422, detail=str(e.orig) if hasattr(e, "orig") else str(e))
    except Exception as e:
        db.session.rollback()
        return json_error("Unexpected error while creating module.", 500, detail=str(e))


@module_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
@swag_from({
    "tags": ["Modules"],
    "summary": "Get all modules for a course",
})
def get_modules_by_course(course_id):
    modules = Module.query.filter_by(course_id=course_id).order_by(Module.order).all()
    return jsonify([m.to_dict() for m in modules]), 200


@module_bp.route("/<int:module_id>", methods=["GET"])
@jwt_required()
@swag_from({
    "tags": ["Modules"],
    "summary": "Get a single module by ID",
})
def get_module_by_id(module_id):
    module = Module.query.get_or_404(module_id)
    return jsonify(module.to_dict(include_nested=True)), 200


@module_bp.route("/<int:module_id>", methods=["PUT"])
@jwt_required()
@role_required("professor")
@swag_from({
    "tags": ["Modules"],
    "summary": "Update a module",
})
def update_module(module_id):
    data = request.get_json() or {}
    try:
        module = Module.query.get_or_404(module_id)

        module.title = data.get("title", module.title)
        module.description = data.get("description", module.description)
        module.video_url = data.get("video_url", module.video_url)
        module.caption_url = data.get("caption_url", module.caption_url)
        module.transcript = data.get("transcript", module.transcript)
        if "order" in data:
            new_order = _int_or(data["order"], module.order)
            module.order = new_order

        db.session.commit()
        return jsonify({"msg": "Module updated"}), 200

    except (IntegrityError, DataError) as e:
        db.session.rollback()
        return json_error("Invalid data for Module update.", 422, detail=str(e.orig) if hasattr(e, "orig") else str(e))
    except Exception as e:
        db.session.rollback()
        return json_error("Unexpected error while updating module.", 500, detail=str(e))


@module_bp.route("/<int:module_id>", methods=["DELETE"])
@jwt_required()
@role_required("professor")
@swag_from({
    "tags": ["Modules"],
    "summary": "Delete a module by ID",
})
def delete_module(module_id):
    try:
        module = Module.query.get_or_404(module_id)
        db.session.delete(module)
        db.session.commit()
        return jsonify({"msg": "Module deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return json_error("Unexpected error while deleting module.", 500, detail=str(e))


# ================== MODULE PROGRESS & OFFLINE LOGGING ==================
@module_bp.route("/<int:module_id>/progress", methods=["POST"])
@jwt_required()
@swag_from({
    "tags": ["Modules"],
    "summary": "Mark module as completed",
})
def mark_module_complete(module_id):
    user_id = _int_or(get_jwt_identity())
    if not user_id:
        return json_error("Invalid token identity", 401)

    try:
        progress = ModuleProgress.query.filter_by(user_id=user_id, module_id=module_id).first()
        if not progress:
            progress = ModuleProgress(user_id=user_id, module_id=module_id)
            db.session.add(progress)

        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"msg": "Progress updated"}), 200
    except Exception as e:
        db.session.rollback()
        return json_error("Unexpected error while updating progress.", 500, detail=str(e))


@module_bp.route("/<int:module_id>/offline", methods=["POST"])
@jwt_required()
@swag_from({
    "tags": ["Modules"],
    "summary": "Log module offline availability for user",
})
def log_offline_module(module_id):
    user_id = _int_or(get_jwt_identity())
    if not user_id:
        return json_error("Invalid token identity", 401)

    try:
        log = OfflineModuleLog(user_id=user_id, module_id=module_id, is_available_offline=True)
        db.session.add(log)
        db.session.commit()
        return jsonify({"msg": "Offline log saved"}), 200
    except Exception as e:
        db.session.rollback()
        return json_error("Unexpected error while logging offline availability.", 500, detail=str(e))


# ================== MODULE PIPELINE (PROCESS → PUBLISH) ==================
@module_bp.route("/process", methods=["POST"])
@jwt_required()
@role_required("professor")
@swag_from({
    "tags": ["Modules"],
    "summary": "Process uploaded video into transcript + quiz (pre-publish review)",
})
def process_module():
    data = request.get_json(force=True) or {}
    try:
        validate_payload(data, ["title", "description", "course_id", "order", "created_at", "video_url"])

        # Optional reachability check (skip failures to avoid false negatives with CDNs)
        if not isinstance(data["video_url"], str) or not data["video_url"].startswith(("http://", "https://")):
            return json_error("Invalid 'video_url'.", 422)
        _ = head_ok(data["video_url"])  # don't fail if False; frontend can still proceed

        # Lightweight metadata (stub)
        duration_sec = 60 * 3
        language = "en"

        # Transcription pipeline
        audio_source = extract_audio_url(data["video_url"])
        transcript = generate_transcript(audio_source)

        # Captions upload (stubbed URL)
        public_id_prefix = f"modules/{uuid.uuid4().hex}_captions"
        vtt_text = generate_captions_vtt(transcript)
        caption_url = upload_text_to_cloudinary(vtt_text, public_id_prefix)

        # Quiz generation
        quiz_questions = generate_quiz(transcript)

        return jsonify({
            "transcript": transcript,
            "quiz_questions": quiz_questions,
            "caption_url": caption_url,
            "duration_sec": duration_sec,
            "language": language,
        }), 200

    except BadRequest as e:
        return json_error(str(e), 422)
    except Exception as e:
        return json_error("Unexpected error while processing module.", 500, detail=str(e))


@module_bp.route("/publish", methods=["POST"])
@jwt_required()
@role_required("professor")
@swag_from({
    "tags": ["Modules"],
    "summary": "Publish module after review (persists Module + Quiz)",
})
def publish_module():
    """
    INPUT JSON:
    {
      "title","description","course_id","order","created_at",
      "video_url","transcript","quiz":[{question_text,choices[],correct_answer}],
      "caption_url" (optional), "chapter_id" (optional)
    }
    OUTPUT 201: Module dict (include_nested=True)
    """
    data = request.get_json(force=True) or {}
    user_id = _int_or(get_jwt_identity())
    if not user_id:
        return json_error("Invalid token identity", 401)

    try:
        # Required + normalize
        validate_payload(data, [
            "title", "description", "course_id", "order", "created_at",
            "video_url", "transcript", "quiz"
        ])
        course_id = _int_or(data["course_id"])
        order = _int_or(data["order"])
        if course_id is None or order is None:
            return json_error("'course_id' and 'order' must be integers.", 422)

        # Ownership: ensure we're publishing a MODULE inside an existing course we own
        course = Course.query.get_or_404(course_id)
        if course.professor_id != user_id:
            return json_error("Unauthorized to publish to this course", 403)

        # Validate quiz
        quiz_items = _validate_quiz_list(data["quiz"])

        # Create Quiz
        quiz = Quiz(
            title=f"Auto – {data['title']}",
            description="Auto-generated quiz",
            course_id=course.id,
            created_at=datetime.utcnow(),
        )
        db.session.add(quiz)
        db.session.flush()  # quiz.id

        # Insert questions
        for q in quiz_items:
            db.session.add(QuizQuestion(
                quiz_id=quiz.id,
                question_text=q["question_text"],
                choices=q["choices"],
                correct_answer=q["correct_answer"],
                created_at=datetime.utcnow(),
            ))

        # Create Module (creator_id MUST be set)
        module = Module(
            title=data["title"],
            description=data["description"],
            video_url=data["video_url"],
            transcript=data["transcript"],
            caption_url=data.get("caption_url"),
            order=order,
            course_id=course.id,
            quiz_id=quiz.id,
            creator_id=user_id,  # <- NEVER NULL
            chapter_id=data.get("chapter_id"),
            created_at=datetime.utcnow(),
        )
        db.session.add(module)
        db.session.commit()

        return jsonify(module.to_dict(include_nested=True)), 201

    except BadRequest as e:
        db.session.rollback()
        return json_error(str(e), 422)
    except (IntegrityError, DataError) as e:
        db.session.rollback()
        # This is where a NOT NULL on creator_id would land if it were missing.
        return json_error("Invalid data while publishing module.", 422, detail=str(e.orig) if hasattr(e, "orig") else str(e))
    except (ProgrammingError, OperationalError) as e:
        db.session.rollback()
        # DB structure/runtime issues
        return json_error("Database error while publishing module.", 500, detail=str(e))
    except Exception as e:
        db.session.rollback()
        return json_error("Unexpected error while publishing module.", 500, detail=str(e))


# ================== CHAPTER ROUTES ==================
@chapter_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("professor")
@swag_from({
    "tags": ["Chapters"],
    "summary": "Create a new chapter",
})
def create_chapter():
    data = request.get_json() or {}
    try:
        validate_payload(data, ["title", "course_id", "order"])
        chapter = CourseChapter(
            title=data["title"],
            description=data.get("description"),
            course_id=_int_or(data["course_id"]),
            order=_int_or(data["order"]),
        )
        db.session.add(chapter)
        db.session.commit()
        return jsonify({"msg": "Chapter created", "chapter_id": chapter.id}), 201
    except BadRequest as e:
        return json_error(str(e), 422)
    except (IntegrityError, DataError) as e:
        db.session.rollback()
        return json_error("Invalid data for Chapter.", 422, detail=str(e.orig) if hasattr(e, "orig") else str(e))
    except Exception as e:
        db.session.rollback()
        return json_error("Unexpected error while creating chapter.", 500, detail=str(e))


@chapter_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
@swag_from({
    "tags": ["Chapters"],
    "summary": "Get all chapters for a course",
})
def get_chapters_by_course(course_id):
    chapters = CourseChapter.query.filter_by(course_id=course_id).order_by(CourseChapter.order).all()
    return jsonify([c.to_dict() for c in chapters]), 200
