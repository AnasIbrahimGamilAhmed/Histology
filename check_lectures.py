import fitz
import os

downloads_dir = r"C:\Users\anasi\Downloads"
files = [
    "Epithelial tissue.pdf",
    "Connective tissue.pdf",
    "Muscular.pdf",
    "Nervous.pdf",
    "Organs samples.pdf"
]

results = {}

for filename in files:
    path = os.path.join(downloads_dir, filename)
    if os.path.exists(path):
        doc = fitz.open(path)
        text = ""
        # Extract first 3 pages of each to get the gist
        for i in range(min(3, len(doc))):
            text += doc[i].get_text()
        results[filename] = text[:2000] # Keep first 2000 chars
        doc.close()

for filename, text in results.items():
    print(f"--- {filename} ---")
    print(text)
    print("\n")
