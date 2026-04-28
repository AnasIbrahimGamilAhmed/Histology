import fitz
import os
from PIL import Image
import io

DOWNLOADS_DIR = r"C:\Users\anasi\Downloads"
OUTPUT_DIR = r"c:\Users\anasi\OneDrive\Desktop\website\public\images\tissues\raw"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Clean existing raw folder
for f in os.listdir(OUTPUT_DIR):
    os.remove(os.path.join(OUTPUT_DIR, f))

files = {
    "Epithelial samples.pdf": "ep_sample",
    "Connective samples.pdf": "ct_sample",
    "Muscular samples.pdf": "musc_sample",
    "Nervous samples.pdf": "nerv_sample",
    "Organs samples.pdf": "org_sample",
    "Nervous.pdf": "nerv_major",
}

for filename, prefix in files.items():
    pdf_path = os.path.join(DOWNLOADS_DIR, filename)
    if not os.path.exists(pdf_path):
        continue
    
    doc = fitz.open(pdf_path)
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        images = page.get_images(full=True)
        
        for img_idx, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            w, h = base_image["width"], base_image["height"]
            
            if w < 200 or h < 200:
                continue
            
            try:
                image = Image.open(io.BytesIO(image_bytes))
                if image.mode != "RGB":
                    image = image.convert("RGB")
                
                out_name = f"{prefix}_p{page_idx+1}.jpeg"
                image.save(os.path.join(OUTPUT_DIR, out_name), "JPEG", quality=90)
                print(f"Saved {out_name} ({w}x{h})")
            except Exception as e:
                print(f"Error: {e}")
    
    doc.close()

print("\nDone! All raw images saved.")
print(f"Total: {len(os.listdir(OUTPUT_DIR))} images")
