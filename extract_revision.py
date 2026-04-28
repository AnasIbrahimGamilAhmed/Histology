import fitz
import os

DOWNLOADS_DIR = r"C:\Users\anasi\Downloads"
REVISION_PDF = os.path.join(DOWNLOADS_DIR, "Revision samples.pdf")

def extract_text():
    if not os.path.exists(REVISION_PDF):
        print("Revision samples.pdf not found in Downloads.")
        return
    
    doc = fitz.open(REVISION_PDF)
    text_content = ""
    for page in doc:
        text_content += page.get_text()
    
    with open("revision_text_full.txt", "w", encoding="utf-8") as f:
        f.write(text_content)
    print("Extracted text from Revision samples.pdf")

if __name__ == "__main__":
    extract_text()
