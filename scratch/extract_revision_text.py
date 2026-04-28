import fitz
import os

DOWNLOADS_DIR = r"C:\Users\anasi\Downloads"
FILENAME = "Revison samples.pdf"

pdf_path = os.path.join(DOWNLOADS_DIR, FILENAME)
if os.path.exists(pdf_path):
    doc = fitz.open(pdf_path)
    content = ""
    for page in doc:
        content += page.get_text()
    
    with open("revision_text.txt", "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Extracted text from {FILENAME}")
else:
    print(f"File not found: {pdf_path}")
