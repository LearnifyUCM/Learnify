import fitz  # PyMuPDF
import docx

def extract_text_from_file(file_path: str) -> str:
    """Extracts text from .pdf, .txt, or .docx files."""
    if file_path.endswith(".pdf"):
        text = ""
        with fitz.open(file_path) as pdf:
            for page in pdf:
                text += page.get_text("text")
        return text.strip()

    elif file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read().strip()

    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])

    else:
        raise ValueError("Unsupported file format")