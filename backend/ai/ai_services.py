from utils.pdf_utils import extract_text_from_file
from ai.generator import generate_learning_material_from_chunk
import os
import re
import json
from groq import Groq

try:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    MODEL_NAME = "llama-3.1-8b-instant"
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    client = None

CHUNK_SIZE = 8000 

def analyze_pdf(file_path: str) -> dict:
    try:
        extracted_text = extract_text_from_file(file_path)
        if not extracted_text or len(extracted_text) < 50:
            return {"error": "Failed to extract usable text from the file."}
        
        text_chunks = [extracted_text[i:i + CHUNK_SIZE] for i in range(0, len(extracted_text), CHUNK_SIZE)]
        
        all_flashcards, all_quizzes = [], []
        for chunk in text_chunks:
            material_chunk = generate_learning_material_from_chunk(chunk)
            if "flashcards" in material_chunk and isinstance(material_chunk["flashcards"], list):
                all_flashcards.extend(material_chunk["flashcards"])
            if "quiz" in material_chunk and isinstance(material_chunk["quiz"], list):
                all_quizzes.extend(material_chunk["quiz"])

        if not all_flashcards and not all_quizzes:
            return {"error": "The AI was unable to generate any study materials from this document."}
        return {"flashcards": all_flashcards, "quiz": all_quizzes}
    except Exception as e:
        return {"error": f"An error occurred in the analysis pipeline: {str(e)}"}

def generate_study_plan(text: str, date: str, topic: str, days_to_study: int, today_date: str) -> dict:
    if not client: return {"error": "Groq client not initialized"}

    prompt = f"""
    You are an expert academic planner. Today's date is {today_date}. The user's test is on {date}.
    Your task is to create a study plan that distributes all key topics from the provided text over the available {days_to_study} days.
    If the timeline is short, you must cram more related topics into each day. If the timeline is long, spread the topics out for lighter study sessions.
    
    The plan must be a valid JSON object with "timeline", "flashcards", and "quiz" as the top-level keys.

    - "timeline": An array of {days_to_study} objects. Each object must have these keys:
        - "day" (number)
        - "date" (string: YYYY-MM-DD, starting from {today_date})
        - "topics_to_cover" (string: a concise title for the day's topics)
        - "daily_details" (array of strings: a detailed bullet-point breakdown of concepts for the day)
        - "estimated_time" (string: a realistic, descriptive time like "90 minutes" or "2.5 hours")
        - "youtube_search_queries" (array of strings: 2-3 specific, high-quality YouTube search queries for that day's topics)
    
    - "flashcards": A comprehensive array of at least 10 flashcard objects if the text is sufficient.
    - "quiz": A comprehensive array of at least 10 multiple-choice question objects. **Crucially, randomize the position of the correct answer in each 'options' array.**

    Raw text to analyze: --- {text} ---
    Return ONLY the valid JSON object.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant designed to output valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME, response_format={"type": "json_object"}, temperature=0.2,
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        return {"error": f"Failed to generate study plan via Groq API: {str(e)}"}

def get_error_explanation(question: str, user_answer: str, correct_answer: str) -> dict:
    if not client: 
        return {"error": "Groq client not initialized"}
        
    prompt = f"""
    You are a helpful tutor. A user has selected an incorrect answer for a multiple-choice question.
    Your task is to explain why the selected answer is incorrect and why the correct answer is right.

    - Start your explanation with a phrase like: "The selected answer is incorrect because..."
    - Keep the tone encouraging and focused on the concepts. 
    - **Do not use JSON formatting. Return only the raw text of your explanation.**

    Question: "{question}"
    User's selected incorrect answer: "{user_answer}"
    The correct answer: "{correct_answer}"
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.3,
        )
        
        explanation_text = chat_completion.choices[0].message.content
        
        # This is the crash-proof part: we create the JSON ourselves, not the AI.
        return {"explanation": explanation_text}

    except Exception as e:
        # This will now catch any API errors (like auth, rate limits, etc.)
        print(f"An error occurred while getting the explanation from the AI: {str(e)}")
        return {"error": f"An error occurred while getting the explanation from the AI: {str(e)}"}