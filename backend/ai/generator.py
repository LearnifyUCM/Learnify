import os
import json
import re
import google.generativeai as genai

# Configure the Google API client from the environment variable
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Use a stable, recent model name
MODEL_NAME = "models/gemini-pro-latest"

def generate_learning_material(extracted_text: str) -> dict:
    """
    Calls Gemini to generate study material and ensures the output is a parsed JSON object.
    """
    # A detailed prompt that instructs the AI to return a specific JSON structure
    prompt = f"""
    You are an expert learning assistant. From the raw text provided, generate a valid JSON object with two keys: "flashcards" and "quiz".

    - "flashcards": An array of 5 objects, where each object has a "term" and a "definition".
    - "quiz": An array of 3 multiple-choice question objects, where each object has a "question", an "options" array of 4 strings, and a "answer" string indicating the correct option.

    Raw text:
    \"\"\"{extracted_text}\"\"\"

    Return ONLY the valid JSON object and nothing else.
    """
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        
        # A robust way to clean and parse the JSON from the AI's response
        json_text = re.search(r'\{.*\}', response.text, re.DOTALL).group(0)
        
        return json.loads(json_text)
        
    except json.JSONDecodeError:
        return {"error": "AI response was not valid JSON", "raw_response": response.text}
    except Exception as e:
        return {"error": str(e)}