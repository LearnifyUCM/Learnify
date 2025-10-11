from utils.pdf_utils import extract_text_from_file
from ai.generator import generate_learning_material

def analyze_pdf(file_path: str) -> dict:
    """
    The main pipeline function: extracts text from a file, then generates learning material.
    """
    try:
        print(f"Analyzing file: {file_path}")
        extracted_text = extract_text_from_file(file_path)
        if not extracted_text:
            return {"error": "Failed to extract any text from the document."}
        
        print("Text extracted successfully, generating learning material...")
        learning_material = generate_learning_material(extracted_text)
        return learning_material

    except Exception as e:
        return {"error": f"An error occurred in the analysis pipeline: {str(e)}"}