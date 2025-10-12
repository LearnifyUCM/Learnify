import os
import json
import uuid # For generating unique IDs
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Text
from ai.google_ai import analyze_pdf, generate_error_explanation
from datetime import datetime, timezone 

# Load environment variables
load_dotenv()

# --- Database Configuration ---
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Use a local SQLite file
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'learnify.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# --- Database Model (Progress Tracking Schema) ---
class StudySession(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    created_on = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # Stores the generated flashcards/quizzes
    material_json = db.Column(db.Text, nullable=False) 
    # Stores user progress (e.g., total studied time, quiz attempts)
    progress_json = db.Column(db.Text, default='{}') 
    
# Create database file (if it doesn't exist)
with app.app_context():
    db.create_all()

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/")
def home():
    return jsonify({"message": "Learnify.AI backend is running! ✅"})

@app.route("/upload", methods=["POST"])
def upload_file():
    # --- File Upload & Extraction Logic ---
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        result_dict = analyze_pdf(filepath) 
        
        if "error" in result_dict:
            return jsonify(result_dict), 500

        session_id = str(uuid.uuid4())
        
        # Retrieve the custom name from the form data
        custom_name = request.form.get('custom_session_name', filename.replace('.pdf', ''))
        
        # Save the session to the database
        new_session = StudySession(
            id=session_id,
            name=custom_name, # Use the custom name provided by the user
            material_json=json.dumps(result_dict) 
        )
        db.session.add(new_session)
        db.session.commit()
        
        # Clean up the uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

        # Return the session ID and the CORRECT custom name to the frontend
        return jsonify({"session_id": session_id, "session_name": custom_name}), 200

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500


@app.route("/session/<session_id>", methods=["GET"])
def get_session_material(session_id):
    """Retrieves the full study material JSON and progress JSON using the session ID."""
    session = db.session.get(StudySession, session_id)
    if session is None:
        return jsonify({"error": "Session not found"}), 404
    
    material = json.loads(session.material_json)
    progress = json.loads(session.progress_json)
    
    return jsonify({**material, "progress": progress}), 200


# 🚨 NEW: DELETE Endpoint for Session Management
@app.route("/session/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    """Deletes a study session by its ID."""
    session = db.session.get(StudySession, session_id)
    if session is None:
        return jsonify({"error": "Session not found"}), 404

    # Perform the deletion
    db.session.delete(session)
    db.session.commit()
    
    return jsonify({"message": f"Session {session_id} deleted successfully"}), 200


@app.route("/sessions", methods=["GET"])
def list_sessions():
    """Lists all saved session metadata and current progress for the Dashboard."""
    sessions = db.session.execute(db.select(StudySession).order_by(StudySession.created_on.desc())).scalars().all()
    
    metadata = []
    for session in sessions:
        material = json.loads(session.material_json)
        progress = json.loads(session.progress_json)
        
        # Calculate derived fields for dashboard display
        flashcard_total = len(material.get('flashcards', []))
        quiz_total = len(material.get('quiz', []))
        flashcard_learned = progress.get('flashcard_learned_count', 0)
        
        # --- MASTERY LOGIC ---
        flashcard_mastery = round((flashcard_learned / flashcard_total) * 100) if flashcard_total > 0 else 0
        
        quiz_history = progress.get('quiz_history', [])
        highest_quiz_score_percent = 0
        if quiz_history:
            for attempt in quiz_history:
                score = attempt.get('score', 0)
                total = attempt.get('total', 0)
                if total > 0:
                    current_percent = round((score / total) * 100)
                    if current_percent > highest_quiz_score_percent:
                        highest_quiz_score_percent = current_percent

        overall_mastery = 0
        if flashcard_total > 0 and quiz_total > 0:
            overall_mastery = round((flashcard_mastery * 0.5) + (highest_quiz_score_percent * 0.5))
        elif flashcard_total > 0:
             overall_mastery = flashcard_mastery
        # ---------------------------

        metadata.append({
            "id": session.id,
            "name": session.name,
            "created": session.created_on.strftime("%m/%d/%Y"),
            "flashcardCount": flashcard_total,
            "quizCount": quiz_total,
            
            "progress_percent": overall_mastery,
            "quiz_attempts": progress.get('quiz_attempts', 0)
        })
        
    return jsonify(metadata), 200


@app.route("/session/progress/<session_id>", methods=["POST"])
def update_progress(session_id):
    """
    Updates the progress_json field in the database.
    """
    session = db.session.get(StudySession, session_id)
    if session is None:
        return jsonify({"error": "Session not found"}), 404

    data = request.json
    current_progress = json.loads(session.progress_json)
    
    # Initialize fields if they don't exist
    current_progress['total_studied_seconds'] = current_progress.get('total_studied_seconds', 0)
    current_progress['quiz_history'] = current_progress.get('quiz_history', [])
    current_progress['quiz_attempts'] = current_progress.get('quiz_attempts', 0)
    
    # 1. Update general progress (time spent, flashcard status)
    if 'time_spent_seconds' in data:
        current_progress['total_studied_seconds'] += data['time_spent_seconds']
    if 'flashcard_learned_count' in data:
        # We only take the HIGHEST count achieved
        current_progress['flashcard_learned_count'] = max(current_progress.get('flashcard_learned_count', 0), data['flashcard_learned_count'])
        
    # 2. Update quiz history
    if 'new_quiz_score' in data:
        score = data['new_quiz_score'].get('score')
        total = data['new_quiz_score'].get('total')
        
        if score is not None and total is not None:
            current_progress['quiz_history'].append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "score": score,
                "total": total
            })
            current_progress['quiz_attempts'] += 1

    # Save changes back to the database
    session.progress_json = json.dumps(current_progress)
    db.session.commit()
    
    return jsonify({"message": "Progress updated successfully"}), 200


@app.route("/explain_error", methods=["POST"])
def explain_error_route():
    """
    Generates a contextual explanation for an incorrect quiz answer.
    """
    data = request.json
    if not all(k in data for k in ["question", "user_answer", "correct_answer"]):
        return jsonify({"error": "Missing quiz data (question, user_answer, correct_answer) in request"}), 400

    # Note: We rely on the question text itself to provide justification (the hackathon fix).
    explanation_text = generate_error_explanation(
        source_text=data['question'], 
        question=data['question'],
        user_answer=data['user_answer'],
        correct_answer=data['correct_answer']
    )

    # Check for AI generation error
    if explanation_text.startswith("Error generating explanation"):
         return jsonify({"error": explanation_text}), 500

    return jsonify({"explanation": explanation_text}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)