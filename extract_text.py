
import fitz # PyMuPDF

pdf_path = r'c:\Users\anasi\Downloads\Revison samples.pdf'
doc = fitz.open(pdf_path)
for i in range(min(5, len(doc))):
    page = doc[i]
    print(f'--- PAGE {i+1} ---')
    print(page.get_text())

