from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Module, ModuleProgress, OfflineModuleLog, CourseChapter, User
from app.utils.roles import role_required
from datetime import datetime
from flasgger import swag_from

module_bp = Blueprint('module', __name__, url_prefix='/modules')

# ================== CREATE MODULE ==================
@module_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Modules'],
    'summary': 'Create a new module (video + optional quiz)',
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

# ================== GET MODULES BY COURSE ==================
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

# ================== LOG PROGRESS ==================
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

# ================== LOG OFFLINE MODULE AVAILABILITY ==================
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

# ================== CHAPTER ROUTES ==================
chapter_bp = Blueprint('chapter', __name__, url_prefix='/chapters')

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

# ================== GET SINGLE MODULE ==================
@module_bp.route('/<int:module_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Modules'],
    'summary': 'Get a single module by ID',
    'parameters': [{'name': 'module_id', 'in': 'path', 'schema': {'type': 'integer'}}],
    'responses': {
        '200': {'description': 'Module data'},
        '404': {'description': 'Module not found'}
    },
    'security': [{'Bearer': []}]
})
def get_module_by_id(module_id):
    module = Module.query.get_or_404(module_id)
    return jsonify(module.to_dict(include_nested=True))


# ================== UPDATE MODULE ==================
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


# ================== DELETE MODULE ==================
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
