import fitz
doc = fitz.open(r"C:\Users\anasi\Downloads\Histology_Survival_Guide.pdf")
print(f"Total pages: {len(doc)}")
doc.close()
