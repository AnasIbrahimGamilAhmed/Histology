import fitz
import sys

def extract_pdf_text(pdf_path, txt_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
    
    print(f"Extracted {len(text)} characters.")

if __name__ == "__main__":
    extract_pdf_text(r"C:\Users\anasi\Downloads\Histology_Survival_Guide.pdf", r"C:\Users\anasi\OneDrive\Desktop\website\survival_guide_text.txt")
