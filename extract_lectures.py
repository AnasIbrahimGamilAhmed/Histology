import fitz
import os

downloads_dir = r"C:\Users\anasi\Downloads"
out_dir = r"C:\Users\anasi\OneDrive\Desktop\website\scratch"

files = [
    "Epithelial tissue.pdf",
    "Connective tissue.pdf",
    "Muscular.pdf",
    "Nervous.pdf",
    "Organs samples.pdf"
]

for filename in files:
    path = os.path.join(downloads_dir, filename)
    if os.path.exists(path):
        doc = fitz.open(path)
        page = doc[0]
        pix = page.get_pixmap()
        pix.save(os.path.join(out_dir, f"lecture_{filename.split('.')[0]}.png"))
        doc.close()
