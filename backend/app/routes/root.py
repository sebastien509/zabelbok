from flask import Blueprint, jsonify

root_bp = Blueprint('root', __name__)

@root_bp.route('/')
def home():
    return jsonify(message="Welcome to the Haiti Educational Platform API 🚀")
