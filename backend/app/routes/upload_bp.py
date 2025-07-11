import openai
import requests
import re
import tempfile
import os
import json
import traceback
import subprocess
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Module, Quiz, QuizQuestion, User, ActivityLog
from app.utils.roles import role_required


upload_bp = Blueprint('upload', __name__, url_prefix='/upload')

@upload_bp.route('/module', methods=['POST'])
@jwt_required()
@role_required('professor')
def upload_module_instant():
    data = request.get_json()
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.school_id != 1:
        return jsonify({"msg": "Unauthorized"}), 403

    title = data.get("title")
    description = data.get("description", "")
    video_url = data.get("video_url")
    course_id = data.get("course_id")
    order = data.get("order", 1)

    temp_video_path = None
    temp_audio_path = None

    try:
        print("📥 Downloading video...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            r = requests.get(video_url, stream=True)
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                temp_video.write(chunk)
            temp_video_path = temp_video.name

        if not os.path.exists(temp_video_path) or os.path.getsize(temp_video_path) == 0:
            raise ValueError("Downloaded video is empty or invalid.")

        print("🎧 Extracting audio...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            temp_audio_path = temp_audio.name

        subprocess.run([
            "ffmpeg", "-y", "-i", temp_video_path,
            "-vn", "-ac", "1", "-ar", "16000", "-acodec", "libmp3lame",
            temp_audio_path
        ], check=True)

        print("🧠 Transcribing with OpenAI Whisper...")
        with open(temp_audio_path, "rb") as f:
            whisper_response = openai.Audio.transcribe("whisper-1", f)
        transcript = whisper_response.get("text", "")

        print("📚 Generating quiz from transcript...")
        prompt = f"""
You are an expert education assistant.

Based on the following transcript, generate exactly 3 multiple-choice questions as a valid JSON array to assess the learner's understanding.

Transcript:
\"\"\"{transcript}\"\"\"

Instructions:
- Return only a valid JSON array. No extra explanation.
- Each question must include:
  - "question_text": string
  - "choices": 4 distinct options ["A", "B", "C", "D"]
  - "correct_answer": one of "A", "B", "C", "D"

Format:
[
  {{
    "question_text": "...",
    "choices": ["A", "B", "C", "D"],
    "correct_answer": "A"
  }}
]
"""
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )

        content = response.choices[0].message.content.strip()
        quiz_data = []

        json_match = re.search(r"\[.*\]", content, re.DOTALL)
        if json_match:
            try:
                quiz_data = json.loads(json_match.group(0))
            except json.JSONDecodeError:
                try:
                    quiz_data = eval(json_match.group(0))
                except Exception as e:
                    print("❌ Quiz parse failed:", e)

        quiz = None
        if isinstance(quiz_data, list) and all("question_text" in q for q in quiz_data):
            print("✅ Saving quiz to DB...")
            quiz = Quiz(
                title=f"{title} - AI Quiz",
                description="Auto-generated quiz",
                course_id=course_id,
                created_at=datetime.utcnow()
            )
            db.session.add(quiz)
            db.session.flush()

            for q in quiz_data:
                db.session.add(QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=q["question_text"],
                    choices=q["choices"],
                    correct_answer=q["correct_answer"]
                ))

        print("📦 Saving module to DB...")
        module = Module(
            title=title,
            description=description,
            video_url=video_url,
            transcript=transcript,
            caption_url=video_url + "?captions=1",
            course_id=course_id,
            creator_id=user_id,
            quiz_id=quiz.id if quiz else None,
            order=order
        )


        return jsonify({
            "msg": "Module published",
            "module_id": module.id,
            "transcript": transcript,
            "quiz_included": bool(quiz),
            "quiz_questions": quiz_data
        }), 201

    except Exception as e:
        print("❌ Error during module upload:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        for temp_file in [temp_video_path, temp_audio_path]:
            if temp_file and os.path.exists(temp_file):
                os.remove(temp_file)
                print(f"🧹 Cleaned up: {temp_file}")



@upload_bp.route('/publish', methods=['POST'])
@jwt_required()
@role_required('professor')
def publish_reviewed_module():
    data = request.get_json()
    user_id = get_jwt_identity()

    title = data.get("title")
    description = data.get("description", "")
    video_url = data.get("video_url")
    transcript = data.get("transcript")
    course_id = data.get("course_id")
    order = data.get("order", 1)
    quiz_data = data.get("quiz", [])

    quiz = Quiz(
        title=f"{title} - Quiz",
        description="Reviewed AI-generated quiz",
        course_id=course_id,
        created_at=datetime.utcnow()
    )
    db.session.add(quiz)
    db.session.flush()

    for q in quiz_data:
        db.session.add(QuizQuestion(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            choices=q["choices"],
            correct_answer=q["correct_answer"]
        ))

    module = Module(
        title=title,
        description=description,
        video_url=video_url,
        transcript=transcript,
        caption_url=video_url + "?captions=1",
        course_id=course_id,
        creator_id=user_id,
        quiz_id=quiz.id,
        order=order
    )
    db.session.add(module)

    db.session.add(ActivityLog(
        user_id=user_id,
        event=f"Published reviewed module '{title}'"
    ))

    db.session.commit()
    return jsonify({"msg": "Module published", "module_id": module.id}), 201


@upload_bp.route('/quiz-builder', methods=['POST'])
@jwt_required()
@role_required('professor')
def ai_generate_quiz():
    data = request.get_json()
    transcript = data.get("transcript")
    num_questions = data.get("num_questions", 3)

    if not transcript:
        return jsonify({"msg": "Transcript required"}), 400

    prompt = f"""
Create {num_questions} multiple choice questions (JSON) based on this transcript:

{transcript}

Format:
[
  {{
    "question_text": "...",
    "choices": ["A", "B", "C", "D"],
    "correct_answer": "A"
  }}
]
    """
    try:
        chat = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        quiz_data = eval(chat.choices[0].message["content"])
        return jsonify({"quiz": quiz_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
