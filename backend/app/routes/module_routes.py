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
)
from app.utils.roles import role_required

from datetime import datetime
import requests
import uuid

# ================== BLUEPRINTS ==================
module_bp = Blueprint('module', __name__, url_prefix='/modules')
chapter_bp = Blueprint('chapter', __name__, url_prefix='/chapters')


# ================== HELPERS (no external side effects) ==================
def validate_payload(data, required):
    missing = [k for k in required if k not in data or data[k] in (None, '')]
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
    # In production: server-side demux or pass video URL to ASR service.
    return video_url

def generate_transcript(_audio_source: str) -> str:
    # TODO: integrate Whisper/OpenAI
    return ("Welcome to this module. We cover key concepts, definitions, and a quick walkthrough. "
            "By the end, you should understand the core ideas and how to apply them.")

def generate_captions_vtt(transcript: str) -> str:
    return "WEBVTT\n\n00:00.000 --> 00:05.000\n" + transcript[:80] + "..."

def upload_text_to_cloudinary(_text: str, public_id_prefix: str) -> str:
    # TODO: replace with real Cloudinary/raw upload
    return f"https://res.cloudinary.com/demo/raw/upload/{public_id_prefix}.vtt"

def generate_quiz(_transcript: str):
    return [
        {
            "question_text": "What is the main goal of this module?",
            "choices": [
                "Introduce key concepts and applications",
                "Discuss unrelated topics",
                "Practice only formatting",
                "Explain company policies"
            ],
            "correct_answer": "Introduce key concepts and applications"
        },
        {
            "question_text": "By the end, you should be able to…",
            "choices": [
                "Apply core ideas",
                "Ignore best practices",
                "Avoid learning outcomes",
                "Delete your progress"
            ],
            "correct_answer": "Apply core ideas"
        }
    ]


# ================== MODULE CRUD ==================
@module_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Modules'],
    'summary': 'Create a new module (direct create; usually use /process + /publish).',
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'example': {
                    'title': 'Module 1',
                    'description': 'Intro to Algebra',
                    'video_url': 'https://cdn.example.com/vid.mp4',
                    'transcript': 'Full text...',
                    'caption_url': 'https://cdn.example.com/captions.vtt',
                    'order': 1,
                    'course_id': 2,
                    'chapter_id': 1,
                    'quiz_id': 4
                }
            }
        }
    },
    'responses': {
        '201': {'description': 'Module created successfully'},
        '400': {'description': 'Missing required fields'}
    },
    'security': [{'Bearer': []}]
})
def create_module():
    data = request.get_json()
    user_id = get_jwt_identity()

    required = ['title', 'video_url', 'order', 'course_id']
    validate_payload(data, required)

    module = Module(
        title=data['title'],
        description=data.get('description'),
        video_url=data['video_url'],
        transcript=data.get('transcript'),
        caption_url=data.get('caption_url'),
        order=data['order'],
        course_id=data['course_id'],
        chapter_id=data.get('chapter_id'),
        quiz_id=data.get('quiz_id'),
        creator_id=user_id
    )
    db.session.add(module)
    db.session.commit()
    return jsonify({'msg': 'Module created', 'module_id': module.id}), 201


@module_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Modules'],
    'summary': 'Get all modules for a course',
    'parameters': [{'name': 'course_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'responses': {'200': {'description': 'List of modules'}},
    'security': [{'Bearer': []}]
})
def get_modules_by_course(course_id):
    modules = Module.query.filter_by(course_id=course_id).order_by(Module.order).all()
    return jsonify([m.to_dict() for m in modules]), 200


@module_bp.route('/<int:module_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Modules'],
    'summary': 'Get a single module by ID',
    'parameters': [{'name': 'module_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'responses': {'200': {'description': 'Module data'}, '404': {'description': 'Module not found'}},
    'security': [{'Bearer': []}]
})
def get_module_by_id(module_id):
    module = Module.query.get_or_404(module_id)
    return jsonify(module.to_dict(include_nested=True)), 200


@module_bp.route('/<int:module_id>', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Modules'],
    'summary': 'Update a module',
    'parameters': [{'name': 'module_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'example': {
                    'title': 'Updated Module Title',
                    'description': 'New description',
                    'video_url': 'https://cdn.example.com/updated.mp4',
                    'caption_url': '',
                    'transcript': '',
                    'order': 2
                }
            }
        }
    },
    'responses': {'200': {'description': 'Module updated'}},
    'security': [{'Bearer': []}]
})
def update_module(module_id):
    module = Module.query.get_or_404(module_id)
    data = request.get_json()

    module.title = data.get('title', module.title)
    module.description = data.get('description', module.description)
    module.video_url = data.get('video_url', module.video_url)
    module.caption_url = data.get('caption_url', module.caption_url)
    module.transcript = data.get('transcript', module.transcript)
    module.order = data.get('order', module.order)

    db.session.commit()
    return jsonify({'msg': 'Module updated'}), 200


@module_bp.route('/<int:module_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Modules'],
    'summary': 'Delete a module by ID',
    'parameters': [{'name': 'module_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'responses': {'200': {'description': 'Module deleted'}},
    'security': [{'Bearer': []}]
})
def delete_module(module_id):
    module = Module.query.get_or_404(module_id)
    db.session.delete(module)
    db.session.commit()
    return jsonify({'msg': 'Module deleted'}), 200


# ================== MODULE PROGRESS & OFFLINE LOGGING ==================
@module_bp.route('/<int:module_id>/progress', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Modules'],
    'summary': 'Mark module as completed',
    'parameters': [{'name': 'module_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'responses': {'200': {'description': 'Progress updated'}},
    'security': [{'Bearer': []}]
})
def mark_module_complete(module_id):
    user_id = get_jwt_identity()
    progress = ModuleProgress.query.filter_by(user_id=user_id, module_id=module_id).first()
    if not progress:
        progress = ModuleProgress(user_id=user_id, module_id=module_id)
        db.session.add(progress)

    progress.is_completed = True
    progress.completed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'msg': 'Progress updated'}), 200


@module_bp.route('/<int:module_id>/offline', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Modules'],
    'summary': 'Log module offline availability for user',
    'parameters': [{'name': 'module_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'responses': {'200': {'description': 'Offline log saved'}},
    'security': [{'Bearer': []}]
})
def log_offline_module(module_id):
    user_id = get_jwt_identity()
    log = OfflineModuleLog(user_id=user_id, module_id=module_id, is_available_offline=True)
    db.session.add(log)
    db.session.commit()
    return jsonify({'msg': 'Offline log saved'}), 200


# ================== MODULE PIPELINE (PROCESS → PUBLISH) ==================
@module_bp.route('/process', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Modules'],
    'summary': 'Process uploaded video into transcript + quiz (pre-publish review)',
    'responses': {'200': {'description': 'Transcript, quiz, captions generated'}},
    'security': [{'Bearer': []}]
})
def process_module():
    """
    INPUT (JSON):
    {
      "title": str, "description": str, "course_id": int,
      "order": int, "created_at": ISO str, "video_url": str
    }
    OUTPUT (200):
    {
      "transcript": str,
      "quiz_questions": [ {question_text, choices[], correct_answer}, ... ],
      "caption_url": str,
      "duration_sec": int,
      "language": "en"
    }
    """
    data = request.get_json(force=True)
    validate_payload(data, ["title", "description", "course_id", "order", "created_at", "video_url"])

    # Basic URL validation
    if not head_ok(data["video_url"]):
        raise BadRequest("Video URL not reachable. Please re-upload.")

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
        "language": language
    }), 200


@module_bp.route('/publish', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Modules'],
    'summary': 'Publish module after review (persists Module + Quiz)',
    'responses': {'200': {'description': 'Module persisted and returned'}},
    'security': [{'Bearer': []}]
})
def publish_module():
    """
    INPUT (JSON):
    {
      "title","description","course_id","order","created_at",
      "video_url","transcript","quiz":[{question_text,choices[],correct_answer}],
      "caption_url" (optional)
    }
    OUTPUT (200): Module dict (include_nested=True)
    """
    data = request.get_json(force=True)
    validate_payload(data, [
        "title", "description", "course_id", "order", "created_at",
        "video_url", "transcript", "quiz"
    ])

    # Create Quiz
    quiz = Quiz(title=f"Auto – {data['title']}", course_id=data["course_id"])
    db.session.add(quiz)
    db.session.flush()  # obtain quiz.id

    for q in data["quiz"]:
        qq = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            choices=q["choices"],
            correct_answer=q["correct_answer"]
        )
        db.session.add(qq)

    # Create Module
    module = Module(
        title=data["title"],
        description=data["description"],
        video_url=data["video_url"],
        transcript=data["transcript"],
        caption_url=data.get("caption_url"),
        order=data["order"],
        course_id=data["course_id"],
        quiz_id=quiz.id,
        # creator_id can be set here if your model tracks it and you want to enforce ownership:
        # creator_id=get_jwt_identity()
    )
    db.session.add(module)
    db.session.commit()

    return jsonify(module.to_dict(include_nested=True)), 200


# ================== CHAPTER ROUTES ==================
@chapter_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Chapters'],
    'summary': 'Create a new chapter',
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'example': {
                    'title': 'Chapter 1',
                    'description': 'Intro topics',
                    'course_id': 1,
                    'order': 1
                }
            }
        }
    },
    'responses': {'201': {'description': 'Chapter created'}},
    'security': [{'Bearer': []}]
})
def create_chapter():
    data = request.get_json()
    validate_payload(data, ['title', 'course_id', 'order'])
    chapter = CourseChapter(
        title=data['title'],
        description=data.get('description'),
        course_id=data['course_id'],
        order=data['order']
    )
    db.session.add(chapter)
    db.session.commit()
    return jsonify({'msg': 'Chapter created', 'chapter_id': chapter.id}), 201


@chapter_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Chapters'],
    'summary': 'Get all chapters for a course',
    'parameters': [{'name': 'course_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'responses': {'200': {'description': 'List of chapters'}},
    'security': [{'Bearer': []}]
})
def get_chapters_by_course(course_id):
    chapters = CourseChapter.query.filter_by(course_id=course_id).order_by(CourseChapter.order).all()
    return jsonify([c.to_dict() for c in chapters]), 200
