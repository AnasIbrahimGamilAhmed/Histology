import re

with open(r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Find lines with imageUrl that don't end with a comma, followed by imageUrls
content = re.sub(r'(imageUrl:\s*"[^"]+")(\n\s*imageUrls:)', r'\1,\2', content)

with open(r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts", "w", encoding="utf-8") as f:
    f.write(content)
