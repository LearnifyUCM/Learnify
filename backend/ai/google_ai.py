from utils.pdf_utils import extract_text_from_file
from ai.generator import generate_learning_material_from_chunk
import os

# Define a chunk size (in characters) to split the document.
# This helps avoid API token limits for large PDFs.
CHUNK_SIZE = 8000 

def analyze_pdf(file_path: str) -> dict:
    """
    The main pipeline function: extracts text, splits it into chunks, 
    generates learning material for each chunk, and aggregates the results.
    """
    try:
        print(f"Analyzing file: {file_path}")
        extracted_text = extract_text_from_file(file_path)
        
        if not extracted_text or len(extracted_text) < 50:
            return {"error": "Failed to extract usable text. The file may be a scan or unsupported."}
        
        print(f"Text extracted successfully ({len(extracted_text)} chars). Splitting into chunks...")

        # 🚨 NEW: Chunking logic
        text_chunks = [extracted_text[i:i + CHUNK_SIZE] for i in range(0, len(extracted_text), CHUNK_SIZE)]
        print(f"Processing {len(text_chunks)} chunk(s)...")

        all_flashcards = []
        all_quizzes = []

        for i, chunk in enumerate(text_chunks):
            print(f"  - Generating material for chunk {i+1}/{len(text_chunks)}")
            material_chunk = generate_learning_material_from_chunk(chunk)
            
            if "flashcards" in material_chunk:
                all_flashcards.extend(material_chunk["flashcards"])
            if "quiz" in material_chunk:
                all_quizzes.extend(material_chunk["quiz"])

        print(f"Aggregation complete. Found {len(all_flashcards)} flashcards and {len(all_quizzes)} quiz questions.")

        # Return the combined results
        return {
            "flashcards": all_flashcards,
            "quiz": all_quizzes
        }

    except Exception as e:
        return {"error": f"An unexpected error occurred in the analysis pipeline: {str(e)}"}