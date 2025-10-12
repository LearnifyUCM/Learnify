from utils.pdf_utils import extract_text_from_file
from ai.generator import generate_learning_material_from_chunk
import os
import re
import json
import google.generativeai as genai

CHUNK_SIZE = 8000 

def analyze_pdf(file_path: str) -> dict:
    try:
        print(f"Analyzing file: {file_path}")
        extracted_text = extract_text_from_file(file_path)
        
        if not extracted_text or len(extracted_text) < 50:
            return {"error": "Failed to extract usable text. The file may be a scan or unsupported."}
        
        print(f"Text extracted successfully ({len(extracted_text)} chars). Splitting into chunks...")

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

        return {
            "flashcards": all_flashcards,
            "quiz": all_quizzes
        }

    except Exception as e:
        return {"error": f"An unexpected error occurred in the analysis pipeline: {str(e)}"}

def generate_study_plan(text: str, date: str, topic: str, days_to_study: int, today_date: str) -> dict:
    prompt = f"""
    You are an expert academic planner. Your task is to create a study plan based on the provided text.
    Today's date is {today_date}. The user's test is on {date}. This gives them {days_to_study} days to study.

    Create a {days_to_study}-day study plan starting from today's date. **Do not include any dates before {today_date}.**
    
    The plan must be a valid JSON object with three keys: "timeline", "flashcards", and "quiz".

    - "timeline": An array of {days_to_study} objects. Each object must have these keys:
        - "day": The sequential day number (e.g., 1, 2, 3...).
        - "date": The specific date for that study day, starting from {today_date}.
        - "topics_to_cover": A concise title for the topics for that day.
        - "daily_details": An array of strings, where each string is a bullet point summarizing a key concept or task for the day. This should be a detailed breakdown.
        - "estimated_time": A string estimating the study time (e.g., "45 minutes", "1.5 hours").
        - "youtube_search_query": A relevant search query for finding helpful videos on YouTube for that day's topics.
    
    - "flashcards": A comprehensive array of flashcard objects based on the entire text.
    - "quiz": A comprehensive array of multiple-choice question objects based on the entire text.

    Pace the plan appropriately for the number of days available.

    Raw text to analyze:
    ---
    {text}
    ---

    Return ONLY the valid JSON object and nothing else.
    """

    model = genai.GenerativeModel('gemini-pro-latest')
    response = model.generate_content(prompt)

    try:
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        else:
            return {"error": "No valid JSON found in the AI response."}
    except (json.JSONDecodeError, IndexError, AttributeError):
        return {"error": "Failed to parse the study plan from the AI response."}

def get_error_explanation(question: str, user_answer: str, correct_answer: str) -> dict:
    prompt = f"""
    You are a helpful and encouraging tutor. A student answered a multiple-choice question incorrectly.
    Your task is to provide a concise and easy-to-understand explanation in a friendly tone.

    Question: "{question}"
    The student's incorrect answer: "{user_answer}"
    The correct answer: "{correct_answer}"

    Please explain why the student's answer is incorrect and why the correct answer is the right choice.
    Keep the explanation focused and clear. Start directly with the explanation.

    Return the explanation as a JSON object with a single key: "explanation". For example:
    {{"explanation": "Your explanation here..."}}
    """

    try:
        model = genai.GenerativeModel('gemini-pro-latest')
        response = model.generate_content(prompt)

        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        else:
            return {"explanation": "The AI could not generate a structured explanation, but here is the raw response: " + response.text}

    except Exception as e:
        print(f"Error getting explanation from AI: {e}")
        return {"error": str(e)}