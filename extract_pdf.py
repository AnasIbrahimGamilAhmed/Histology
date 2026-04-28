
import fitz # PyMuPDF
import os

pdf_path = r'c:\Users\anasi\Downloads\Revison samples.pdf'
out_dir = r'c:\Users\anasi\OneDrive\Desktop\website\public\images\revision samples'
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
count = 1
for i in range(len(doc)):
    page = doc[i]
    image_list = page.get_images()
    for img in image_list:
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image['image']
        ext = base_image['ext']
        
        # Save as micro.png since it's an exam sample
        with open(os.path.join(out_dir, f'revision_{count} micro.{ext}'), 'wb') as f:
            f.write(image_bytes)
        count += 1
print(f'Extracted {count-1} images')

