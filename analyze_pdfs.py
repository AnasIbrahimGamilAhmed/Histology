import fitz
import os
from PIL import Image
import io

DOWNLOADS_DIR = r"C:\Users\anasi\Downloads"

files = [
    "Epithelial samples.pdf",
    "Connective samples.pdf", 
    "Muscular samples.pdf",
    "Nervous samples.pdf",
    "Organs samples.pdf",
    "Nervous.pdf",  # The major one
]

for filename in files:
    pdf_path = os.path.join(DOWNLOADS_DIR, filename)
    if not os.path.exists(pdf_path):
        print(f"=== NOT FOUND: {filename} ===")
        continue
    
    doc = fitz.open(pdf_path)
    print(f"\n{'='*80}")
    print(f"=== {filename} === ({len(doc)} pages)")
    print(f"{'='*80}")
    
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text("text")
        images = page.get_images(full=True)
        
        print(f"\n--- Page {page_idx + 1} ---")
        print(f"  Text (first 500 chars):")
        for line in text.strip().split('\n')[:30]:
            line = line.strip()
            if line:
                print(f"    {line}")
        
        print(f"\n  Images on this page: {len(images)}")
        for img_idx, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            w, h = base_image["width"], base_image["height"]
            print(f"    Image {img_idx+1}: {w}x{h} px, format: {base_image.get('ext', '?')}")
    
    doc.close()
