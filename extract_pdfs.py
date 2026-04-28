import fitz
import os
from PIL import Image
import io

DOWNLOADS_DIR = r"C:\Users\anasi\Downloads"
OUTPUT_DIR = r"c:\Users\anasi\OneDrive\Desktop\website\public\images\tissues"

files_to_process = {
    "Epithelial samples.pdf": "epithelial",
    "Connective samples.pdf": "connective",
    "Muscular samples.pdf": "muscular",
    "Nervous samples.pdf": "nervous",
    "Organs samples.pdf": "organ"
}

def extract_images(pdf_path, prefix):
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return

    doc = fitz.open(pdf_path)
    count = 1
    
    for page_index in range(len(doc)):
        page = doc[page_index]
        image_list = page.get_images(full=True)
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            
            try:
                # Open with PIL to check dimensions and save
                image = Image.open(io.BytesIO(image_bytes))
                
                # Filter out small icons/logos
                if image.width < 200 or image.height < 200:
                    continue
                
                # Convert to RGB to avoid issues with saving as JPEG
                if image.mode != "RGB":
                    image = image.convert("RGB")
                
                filename = f"{prefix}_{count}.jpeg"
                filepath = os.path.join(OUTPUT_DIR, filename)
                
                # Handle filename collisions
                while os.path.exists(filepath):
                    count += 1
                    filename = f"{prefix}_{count}.jpeg"
                    filepath = os.path.join(OUTPUT_DIR, filename)
                
                image.save(filepath, "JPEG")
                print(f"Saved {filepath}")
                count += 1
            except Exception as e:
                print(f"Error processing image {img_index} on page {page_index}: {e}")

if __name__ == "__main__":
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    for filename, prefix in files_to_process.items():
        pdf_path = os.path.join(DOWNLOADS_DIR, filename)
        print(f"Processing {pdf_path}...")
        extract_images(pdf_path, prefix)
    print("Done!")
