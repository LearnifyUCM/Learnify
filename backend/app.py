import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from ai.ai_services import analyze_pdf, generate_study_plan, get_error_explanation

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'learnify.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

class StudySession(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    material_json = db.Column(db.Text, nullable=False)
    flashcard_learned_count = db.Column(db.Integer, default=0)
    quiz_attempts = db.Column(db.Integer, default=0)
    quiz_best_score = db.Column(db.Integer, default=0)
    total_study_seconds = db.Column(db.Integer, default=0)
    quiz_history_json = db.Column(db.Text, default='[]')

with app.app_context():
    db.create_all()

UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/")
def home():
    return jsonify({"message": "Learnify.AI backend is running! ✅"})

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400
    file = request.files["file"]
    session_name_from_form = request.form.get('custom_session_name')

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        result_dict = analyze_pdf(filepath)
        if "error" in result_dict:
            return jsonify(result_dict), 500

        session_id = os.urandom(8).hex() 
        session_name = session_name_from_form if session_name_from_form else os.path.splitext(filename)[0]
        
        new_session = StudySession(id=session_id, name=session_name, material_json=json.dumps(result_dict))
        db.session.add(new_session)
        db.session.commit()
        return jsonify({"session_id": session_id, "session_name": session_name}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route("/generate_plan", methods=["POST"])
def generate_plan_route():
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    topic = request.form.get("topic")
    midterm_date_str = request.form.get("midterm_date")

    if not all([file, topic, midterm_date_str]):
        return jsonify({"error": "Missing file, topic, or midterm date"}), 400

    try:
        today = datetime.now()
        midterm_date = datetime.strptime(midterm_date_str, '%Y-%m-%d')
        days_to_study = (midterm_date - today).days + 1
        if days_to_study < 1:
            return jsonify({"error": "The selected date must be in the future."}), 400
        today_str = today.strftime('%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        from utils.pdf_utils import extract_text_from_file
        extracted_text = extract_text_from_file(filepath)
        if not extracted_text:
            return jsonify({"error": "Failed to extract text from the PDF."}), 500
        
        plan_data = generate_study_plan(extracted_text, midterm_date_str, topic, days_to_study, today_str)
        if "error" in plan_data:
            return jsonify(plan_data), 500

        session_id = os.urandom(8).hex()
        new_session = StudySession(id=session_id, name=f"{topic} Plan ({midterm_date_str})", material_json=json.dumps(plan_data))
        db.session.add(new_session)
        db.session.commit()
        return jsonify({"session_id": session_id, "session_name": new_session.name}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route("/session/progress/<session_id>", methods=['POST'])
def update_session_progress(session_id):
    session = db.session.get(StudySession, session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    data = request.json
    session.total_study_seconds = (session.total_study_seconds or 0) + int(data.get('time_spent_seconds', 0))
    if 'flashcard_learned_count' in data:
        session.flashcard_learned_count = data['flashcard_learned_count']
    if 'new_quiz_score' in data:
        score = data['new_quiz_score'].get('score', 0)
        session.quiz_attempts = (session.quiz_attempts or 0) + 1
        session.quiz_best_score = max(session.quiz_best_score or 0, score)
        history = json.loads(session.quiz_history_json or '[]')
        history.append({"timestamp": datetime.now().isoformat(), "score": score, "total": data['new_quiz_score'].get('total', 0)})
        session.quiz_history_json = json.dumps(history)

    db.session.commit()
    return jsonify({"message": "Progress updated successfully"}), 200

@app.route("/session/<session_id>", methods=["GET", "DELETE"])
def handle_session(session_id):
    session = db.session.get(StudySession, session_id)
    if session is None:
        return jsonify({"error": "Session not found"}), 404

    if request.method == 'DELETE':
        db.session.delete(session)
        db.session.commit()
        return jsonify({"message": "Session deleted successfully"}), 200

    material = json.loads(session.material_json)
    material['progress'] = {
        "total_studied_seconds": session.total_study_seconds,
        "flashcard_learned_count": session.flashcard_learned_count,
        "quiz_history": json.loads(session.quiz_history_json or '[]'),
        "quiz_attempts": session.quiz_attempts
    }
    return jsonify(material), 200

@app.route("/sessions", methods=["GET"])
def list_sessions():
    sessions = StudySession.query.order_by(StudySession.created_on.desc()).all()
    metadata = []
    for session in sessions:
        material = json.loads(session.material_json)
        flashcard_total = len(material.get('flashcards', []))
        quiz_total = len(material.get('quiz', []))

        flashcard_progress = (session.flashcard_learned_count or 0) / flashcard_total if flashcard_total > 0 else 0
        quiz_progress = (session.quiz_best_score or 0) / quiz_total if quiz_total > 0 else 0
        
        total_progress = 0
        if flashcard_total > 0 and quiz_total > 0:
            total_progress = round(((flashcard_progress + quiz_progress) / 2) * 100)
        elif flashcard_total > 0 or quiz_total > 0:
            total_progress = round((flashcard_progress + quiz_progress) * 100)
        
        metadata.append({
            "id": session.id, "name": session.name, "created": session.created_on.strftime("%m/%d/%Y"),
            "flashcardCount": flashcard_total, "quizCount": quiz_total,
            "progress_percent": total_progress, "quiz_attempts": session.quiz_attempts or 0
        })
    return jsonify(metadata), 200

@app.route("/explain_error", methods=['POST'])
def explain_error():
    data = request.json
    if not all(k in data for k in ['question', 'user_answer', 'correct_answer']):
        return jsonify({"error": "Missing required fields for explanation"}), 400
    
    result = get_error_explanation(data['question'], data['user_answer'], data['correct_answer'])
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)