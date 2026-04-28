import fitz  # PyMuPDF
import os
from pathlib import Path

def extract_nervous_samples():
    pdf_path = r"C:\Users\anasi\Downloads\Nervous samples.pdf"
    output_dir = Path("public/images/tissues")
    os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    print(f"Extracting {len(doc)} pages from Nervous samples.pdf...")

    for i, page in enumerate(doc):
        # Render page to image with high resolution
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        output_path = output_dir / f"nervous_sample_{i+1}.jpeg"
        pix.save(str(output_path))
        print(f"  [SAVED] Page {i+1} -> {output_path.name}")

if __name__ == "__main__":
    extract_nervous_samples()
