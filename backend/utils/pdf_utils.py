# backend/utils/pdf_utils.py
import fitz  # PyMuPDF

# Note: We commented out the docx import for simplicity and because the
# original error was specifically in PDF extraction. If you need docx support,
# ensure 'python-docx' is installed via pip.

def extract_text_from_file(file_path: str) -> str:
    """
    Extracts text from a PDF file using PyMuPDF.
    Returns all text concatenated into a single string.
    """
    if file_path.lower().endswith(".pdf"):
        text = ""
        try:
            with fitz.open(file_path) as pdf:
                for page in pdf:
                    # Using get_text("text") is standard for raw text
                    text += page.get_text("text") + "\n\n" 
            return text.strip()
        except Exception as e:
            print(f"PyMuPDF error: {e}")
            # If PyMuPDF fails, return an empty string to trigger the error check
            return "" 

    elif file_path.lower().endswith(".txt"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read().strip()
        except Exception:
            return ""

    # elif file_path.lower().endswith(".docx"):
    #     try:
    #         import docx # Requires pip install python-docx
    #         doc = docx.Document(file_path)
    #         return "\n".join([p.text for p in doc.paragraphs])
    #     except Exception:
    #         return ""

    else:
        # If the file type is unsupported, return empty string
        return ""