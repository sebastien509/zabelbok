from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Book
from app.utils.roles import role_required
from flasgger import swag_from

book_bp = Blueprint('book', __name__, url_prefix='/books')

@book_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Books'],
    'summary': 'Create a new book',
    'parameters': [
        {
            'in': 'body',
            'name': 'body',
            'required': True,
            'schema': {
                'properties': {
                    'title': {'type': 'string'},
                    'author': {'type': 'string'},
                    'pdf_url': {'type': 'string'},
                    'course_id': {'type': 'integer'}
                }
            }
        }
    ],
    'responses': {
        201: {'description': 'Book created'}
    }
})
def create_book_view():
    data = request.get_json()
    book = Book(
        title=data['title'],
        author=data.get('author'),
        pdf_url=data.get('pdf_url'),
        course_id=data['course_id']
    )
    db.session.add(book)
    db.session.commit()
    return jsonify({"message": "Book created", "id": book.id}), 201

@book_bp.route('/', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
@swag_from({
    'tags': ['Books'],
    'summary': 'Get all books',
    'responses': {
        200: {
            'description': 'List of books'
        }
    }
})
def get_all_books_view():
    books = Book.query.all()
    result = [{
        "id": b.id,
        "title": b.title,
        "author": b.author,
        "pdf_url": b.pdf_url
    } for b in books]
    return jsonify(result)

@book_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@role_required('student', 'professor', 'admin')
@swag_from({
    'tags': ['Books'],
    'summary': 'Get a single book by ID',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Book found'},
        404: {'description': 'Not found'}
    }
})
def get_single_book_view(id):
    book = Book.query.get_or_404(id)
    return jsonify({
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "pdf_url": book.pdf_url
    })

@book_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Books'],
    'summary': 'Update a book',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {
            'properties': {
                'title': {'type': 'string'},
                'author': {'type': 'string'},
                'pdf_url': {'type': 'string'}
            }
        }}
    ],
    'responses': {
        200: {'description': 'Book updated'}
    }
})
def update_book_view(id):
    data = request.get_json()
    book = Book.query.get_or_404(id)
    book.title = data.get('title', book.title)
    book.author = data.get('author', book.author)
    book.pdf_url = data.get('pdf_url', book.pdf_url)
    db.session.commit()
    return jsonify({"message": "Book updated"})

@book_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('professor')
@swag_from({
    'tags': ['Books'],
    'summary': 'Delete a book',
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Book deleted'},
        404: {'description': 'Not found'}
    }
})
def delete_book_view(id):
    book = Book.query.get_or_404(id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book deleted"})
