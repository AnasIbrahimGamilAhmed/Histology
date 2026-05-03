import fitz
import os

pdf_path = r"C:\Users\anasi\Downloads\Histology_Survival_Guide.pdf"
out_dir = r"C:\Users\anasi\OneDrive\Desktop\website\scratch"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

doc = fitz.open(pdf_path)
for i in range(5, len(doc)):
    page = doc[i]
    pix = page.get_pixmap()
    pix.save(os.path.join(out_dir, f"survival_page_{i}.png"))
    print(f"Saved page {i}")
doc.close()
