import os
import json
from groq import Groq

try:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    MODEL_NAME = "llama-3.1-8b-instant"
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    client = None

def generate_learning_material_from_chunk(text_chunk: str) -> dict:
    if not client:
        return {"error": "Groq client not initialized. Check API key."}

    prompt = f"""
    You are an expert learning assistant. From the provided text chunk, generate a valid JSON object with "flashcards" and "quiz" as keys.
    Generate as many high-quality items as possible, aiming for at least 10 flashcards and 10 quiz questions if the text is substantial. Do not invent information.

    - "flashcards": An array of objects, each with a "term" and a "definition".
    - "quiz": An array of multiple-choice question objects, each with a "question", an "options" array of 4 strings, and an "answer" string. **Crucially, randomize the position of the correct answer in the 'options' array.**

    Raw text chunk:
    \"\"\"{text_chunk}\"\"\"

    Return ONLY the valid JSON object.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {"role": "user", "content": prompt},
            ],
            model=MODEL_NAME,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        return {"flashcards": [], "quiz": [], "error": str(e)}