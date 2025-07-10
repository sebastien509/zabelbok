from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Book, BookChapter
from app.utils.roles import role_required
from flasgger import swag_from
from datetime import datetime
from app.utils.logger import log_event


book_bp = Blueprint('book', __name__, url_prefix='/books')

# ================== CREATE BOOK ==================
@book_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Books'],
    'summary': 'Create a book',
    'parameters': [
        {'name': 'Authorization', 'in': 'header', 'required': True, 'schema': {'type': 'string'}}
    ],
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'title': {'type': 'string'},
                        'author': {'type': 'string'},
                        'pdf_url': {'type': 'string'},
                        'course_id': {'type': 'integer'}
                    },
                    'required': ['title', 'course_id']
                }
            }
        }
    },
    'responses': {
        '201': {'description': 'Book created successfully'},
        '400': {'description': 'Missing required fields'}
    }
})
def create_book():
    data = request.get_json()

    title = data.get('title')
    author = data.get('author')
    pdf_url = data.get('pdf_url')
    course_id = data.get('course_id')

    if not title or not course_id:
        return jsonify({"msg": "Missing required fields."}), 400

    book = Book(
        title=title,
        author=author,
        pdf_url=pdf_url,
        course_id=course_id,
        created_at=datetime.utcnow()
    )

    db.session.add(book)
    db.session.commit()

    return jsonify({"msg": "Book created successfully.", "book_id": book.id}), 201

# ================== ADD CHAPTER ==================
@book_bp.route('/<int:book_id>/chapters', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Books'],
    'summary': 'Add chapter to a book',
    'parameters': [
        {'name': 'book_id', 'in': 'path', 'required': True, 'schema': {'type': 'integer'}},
        {'name': 'Authorization', 'in': 'header', 'required': True, 'schema': {'type': 'string'}}
    ],
    'requestBody': {
        'required': True,
        'content': {
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'title': {'type': 'string'},
                        'content_url': {'type': 'string'}
                    },
                    'required': ['title', 'content_url']
                }
            }
        }
    },
    'responses': {
        '201': {'description': 'Chapter added successfully'},
        '400': {'description': 'Missing required fields'}
    }
})
def add_chapter(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    title = data.get('title')
    content_url = data.get('content_url')

    if not title or not content_url:
        return jsonify({"msg": "Missing required fields."}), 400

    chapter = BookChapter(
        title=title,
        content_url=content_url,
        book_id=book.id,
        created_at=datetime.utcnow()
    )

    db.session.add(chapter)
    db.session.commit()

    return jsonify({"msg": "Chapter added successfully.", "chapter_id": chapter.id}), 201

# ================== GET ALL BOOKS ==================
@book_bp.route('/', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Books'],
    'summary': 'Get all books',
    'parameters': [
        {'name': 'Authorization', 'in': 'header', 'required': True, 'schema': {'type': 'string'}}
    ],
    'responses': {'200': {'description': 'List of all books'}}
})
def get_all_books():
    books = Book.query.all()
    return jsonify([
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "pdf_url": b.pdf_url,
            "course_id": b.course_id,
            "created_at": b.created_at
        } for b in books
    ]), 200

# ================== GET BOOK + CHAPTERS ==================
@book_bp.route('/<int:book_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Books'],
    'summary': 'Get a specific book with its chapters',
    'parameters': [
        {'name': 'book_id', 'in': 'path', 'required': True, 'schema': {'type': 'integer'}},
        {'name': 'Authorization', 'in': 'header', 'required': True, 'schema': {'type': 'string'}}
    ],
    'responses': {
        '200': {'description': 'Book with chapters'},
        '404': {'description': 'Book not found'}
    }
})
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    chapters = BookChapter.query.filter_by(book_id=book.id).all()

    user_id = get_jwt_identity()
    log_event(user_id, f"book_viewed:book:{book_id}")


    return jsonify({
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "pdf_url": book.pdf_url,
        "course_id": book.course_id,
        "created_at": book.created_at,
        "chapters": [
            {
                "id": c.id,
                "title": c.title,
                "content_url": c.content_url
            } for c in chapters
        ]
    }), 200

# ================== DELETE BOOK ==================
@book_bp.route('/<int:book_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Books'],
    'summary': 'Delete a book',
    'parameters': [
        {'name': 'book_id', 'in': 'path', 'required': True, 'schema': {'type': 'integer'}},
        {'name': 'Authorization', 'in': 'header', 'required': True, 'schema': {'type': 'string'}}
    ],
    'responses': {
        '200': {'description': 'Book deleted successfully'},
        '404': {'description': 'Book not found'}
    }
})
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"msg": "Book deleted successfully."}), 200

# ================== DELETE CHAPTER ==================
@book_bp.route('/chapters/<int:chapter_id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Books'],
    'summary': 'Delete a chapter',
    'parameters': [
        {'name': 'chapter_id', 'in': 'path', 'required': True, 'schema': {'type': 'integer'}},
        {'name': 'Authorization', 'in': 'header', 'required': True, 'schema': {'type': 'string'}}
    ],
    'responses': {
        '200': {'description': 'Chapter deleted successfully'},
        '404': {'description': 'Chapter not found'}
    }
})
def delete_chapter(chapter_id):
    chapter = BookChapter.query.get_or_404(chapter_id)
    db.session.delete(chapter)
    db.session.commit()
    return jsonify({"msg": "Chapter deleted successfully."}), 200
