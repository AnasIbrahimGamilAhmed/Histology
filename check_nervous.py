import fitz
import sys

doc = fitz.open(r"C:\Users\anasi\Downloads\Nervous samples.pdf")
print(f"Pages in nervous: {len(doc)}")
for i in range(len(doc)):
    page = doc[i]
    images = page.get_images(full=True)
    print(f"Page {i}: {len(images)} images")
    for img in images:
        xref = img[0]
        base_image = doc.extract_image(xref)
        print(f"  - size: {base_image['width']}x{base_image['height']}")
