import os
import json
import re
import google.generativeai as genai

# Configure the Google API client from the environment variable
# This will raise a clear error on startup if the key is missing.
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Use a stable, recent model name that supports a larger context window
MODEL_NAME = "models/gemini-pro-latest"

def generate_learning_material_from_chunk(text_chunk: str) -> dict:
    """
    Calls Gemini to generate study material from a single chunk of text.
    """
    # 🚨 MODIFIED PROMPT: Asks for comprehensive extraction, not a fixed number.
    prompt = f"""
    You are an expert learning assistant. From the provided text chunk, extract as many key concepts as possible and generate a valid JSON object with two keys: "flashcards" and "quiz".

    - "flashcards": An array of objects, where each object has a "term" and a "definition". Extract all significant terms.
    - "quiz": An array of multiple-choice question objects, where each object has a "question", an "options" array of 4 strings, and an "answer" string. Create questions for the most important concepts.

    Raw text chunk:
    \"\"\"{text_chunk}\"\"\"

    Return ONLY the valid JSON object and nothing else. If no relevant terms or questions can be generated from this chunk, return an empty JSON object: {{"flashcards": [], "quiz": []}}.
    """
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        # Use a slightly higher temperature for more creative/varied question generation
        generation_config = genai.types.GenerationConfig(temperature=0.4)
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        # Clean and parse the JSON from the AI's response
        # This regex is more robust and finds the first complete JSON object
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response.text, re.DOTALL)
        if json_match:
            json_text = json_match.group(1)
        else:
            # Fallback for raw JSON without markdown backticks
            json_text = re.search(r'\{.*\}', response.text, re.DOTALL).group(0)

        return json.loads(json_text)
        
    except (json.JSONDecodeError, AttributeError, IndexError):
        # If parsing fails or the response is empty, return a structured error
        print(f"Warning: Failed to parse JSON from AI response chunk. Raw text: {response.text[:200]}")
        return {"flashcards": [], "quiz": [], "error": "AI response was not valid JSON"}
    except Exception as e:
        print(f"An unexpected AI error occurred: {e}")
        return {"flashcards": [], "quiz": [], "error": str(e)}