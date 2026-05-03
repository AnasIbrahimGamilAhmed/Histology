import fitz
import os

downloads = r"C:\Users\anasi\Downloads"
scratch = r"C:\Users\anasi\OneDrive\Desktop\website\scratch"

files = [
    "lab 1 histo S🫶🏻.pdf",
    "lab 2 histology.pdf",
    "lap 3 histology .pdf",
    "Epithelial samples.pdf",
    "Connective samples.pdf",
    "Muscular samples.pdf",
    "Nervous samples.pdf",
    "Samples.pdf",
    "Revison samples.pdf"
]

for f in files:
    path = os.path.join(downloads, f)
    if os.path.exists(path):
        try:
            doc = fitz.open(path)
            # Extract first 5 pages of each to get oral tips
            for i in range(min(5, len(doc))):
                safe_name = f.replace(" ", "_").replace("🫶🏻", "")
                out_path = os.path.join(scratch, f"{safe_name}_page_{i}.png")
                doc[i].get_pixmap().save(out_path)
            doc.close()
        except Exception as e:
            pass
    else:
        pass
