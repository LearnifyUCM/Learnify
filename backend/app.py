import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from ai.google_ai import analyze_pdf

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

# --- Database Model ---
class StudySession(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    created_on = db.Column(db.DateTime, default=db.func.now())
    # Store the large JSON string of flashcards/quizzes
    material_json = db.Column(db.Text, nullable=False) 

# Create database file (if it doesn't exist)
with app.app_context():
    db.create_all()
# ------------------------------

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
        # Generate material (returns the result dictionary)
        result_dict = analyze_pdf(filepath) 
        
        # 🚨 NEW: Handle AI-generated errors before saving
        if "error" in result_dict:
            return jsonify(result_dict), 500

        # Generate a unique ID and session name
        session_id = os.urandom(8).hex() 
        session_name = filename.replace('.pdf', '')
        
        # Save the full session material to the database
        new_session = StudySession(
            id=session_id,
            name=session_name,
            material_json=json.dumps(result_dict) 
        )
        db.session.add(new_session)
        db.session.commit()
        
        # Clean up the uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

        # CRITICAL: Return ONLY the session ID and Name to the frontend
        return jsonify({"session_id": session_id, "session_name": session_name}), 200

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500


@app.route("/session/<session_id>", methods=["GET"])
def get_session_material(session_id):
    """Retrieves the full study material JSON using the session ID."""
    session = StudySession.query.get(session_id)
    if session is None:
        return jsonify({"error": "Session not found"}), 404
    
    # CRITICAL: Return the material JSON directly
    return jsonify(json.loads(session.material_json)), 200


@app.route("/sessions", methods=["GET"])
def list_sessions():
    """Lists all saved session metadata for the Dashboard."""
    # Order by creation date descending
    sessions = StudySession.query.order_by(StudySession.created_on.desc()).all()
    
    metadata = []
    for session in sessions:
        # Load the material to get flashcard/quiz counts (expensive, but necessary without dedicated columns)
        material = json.loads(session.material_json)
        
        metadata.append({
            "id": session.id,
            "name": session.name,
            "created": session.created_on.strftime("%m/%d/%Y"),
            "flashcardCount": len(material.get('flashcards', [])),
            "quizCount": len(material.get('quiz', [])),
        })
        
    return jsonify(metadata), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)