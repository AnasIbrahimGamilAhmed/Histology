import fitz
import os
from pathlib import Path

def extract_all():
    downloads = Path(r"C:\Users\anasi\Downloads")
    output_dir = Path("public/images/tissues/samples")
    os.makedirs(output_dir, exist_ok=True)
    
    sample_files = [
        "Connective samples.pdf",
        "Epithelial samples.pdf",
        "Muscular samples.pdf",
        "Nervous samples.pdf",
        "Organs samples.pdf"
    ]
    
    for filename in sample_files:
        pdf_path = downloads / filename
        if not pdf_path.exists():
            print(f"Skipping {filename} (not found)")
            continue
            
        print(f"Extracting {filename}...")
        doc = fitz.open(str(pdf_path))
        prefix = filename.split(" ")[0].lower()
        
        for i, page in enumerate(doc):
            # Render page - 2x zoom for clarity
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            output_path = output_dir / f"{prefix}_s{i+1}.jpeg"
            pix.save(str(output_path))
            print(f"  [SAVED] {output_path.name}")

if __name__ == "__main__":
    extract_all()
