import os
import json
import re
import google.generativeai as genai  # 🚨 CRITICAL FIX: Add this import
from utils.pdf_utils import extract_text_from_file
from ai.generator import generate_learning_material_from_chunk # Assumed structure

# Set the model name for generation/explanation
MODEL_NAME = "models/gemini-pro-latest"

# --- Function for New Feature: Explain My Error ---
def generate_error_explanation(source_text: str, question: str, user_answer: str, correct_answer: str) -> str:
    """
    Constructs a prompt for Gemini to generate a solid, context-grounded explanation.
    """
    # Use the question itself as the source context for justification (Hackathon Fix)
    prompt = f"""
    You are an expert educational tutor. Your goal is to provide a solid explanation structured into three key points. Use the following "Source Context" (the question text) to justify your answer.

    **Source Context:** {source_text}
    **Student's Mistake:** The student incorrectly chose: "{user_answer}"
    **Correct Answer:** The correct answer is: "{correct_answer}"

    Generate your response as a single piece of text with strong formatting, following this structure precisely:

    **1. Correction & Analysis:** Briefly explain why the student's specific answer choice was incorrect based on the core concept.
    **2. Source Proof:** Quote or closely paraphrase the exact relevant sentence or phrase from the "Source Context" that proves the correct answer. (Use quotation marks).
    **3. Key Takeaway:** Provide a final, concise summary of the concept to prevent the error from happening again.
    """

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        generation_config = genai.types.GenerationConfig(temperature=0.3)
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        return response.text
        
    except Exception as e:
        return f"Error generating explanation: {str(e)}"


# --- Function for Core Feature: Content Generation ---

# Define a chunk size (in characters) to split the document.
CHUNK_SIZE = 8000 

def analyze_pdf(file_path: str) -> dict:
    """
    The main pipeline function: extracts text, splits it into chunks, 
    generates learning material for each chunk, and aggregates the results.
    """
    try:
        extracted_text = extract_text_from_file(file_path)
        
        if not extracted_text or len(extracted_text) < 50:
            return {"error": "Failed to extract usable text. The file may be a scan or unsupported."}
        
        # Chunking logic
        text_chunks = [extracted_text[i:i + CHUNK_SIZE] for i in range(0, len(extracted_text), CHUNK_SIZE)]

        all_flashcards = []
        all_quizzes = []

        for i, chunk in enumerate(text_chunks):
            # This function is imported from generator.py
            material_chunk = generate_learning_material_from_chunk(chunk) 
            
            if "flashcards" in material_chunk:
                all_flashcards.extend(material_chunk["flashcards"])
            if "quiz" in material_chunk:
                all_quizzes.extend(material_chunk["quiz"])

        # Return the combined results
        return {
            "flashcards": all_flashcards,
            "quiz": all_quizzes
        }

    except Exception as e:
        return {"error": f"An unexpected error occurred in the analysis pipeline: {str(e)}"}