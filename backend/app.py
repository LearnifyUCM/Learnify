import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from ai.google_ai import analyze_pdf

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure a folder to temporarily store uploads
UPLOAD_FOLDER = "uploads"
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

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        try:
            result = analyze_pdf(filepath)
            # Clean up the uploaded file after processing
            os.remove(filepath)
            return jsonify(result)
        except Exception as e:
            # Clean up even if there's an error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file"}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)