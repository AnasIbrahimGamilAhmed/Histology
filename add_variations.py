import re

with open(r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts", "r", encoding="utf-8") as f:
    content = f.read()

extras = {
    "spinal-cord": ['"/images/tissues/nervous_3.jpeg"', '"/images/tissues/nervous_4.jpeg"', '"/images/tissues/nervous_5.jpeg"', '"/images/tissues/nervous_6.jpeg"', '"/images/tissues/nervous_7.jpeg"', '"/images/tissues/nervous_8.jpeg"'],
    "sciatic-nerve": ['"/images/tissues/nervous_9.jpeg"', '"/images/tissues/nervous_10.jpeg"', '"/images/tissues/nervous_11.jpeg"', '"/images/tissues/nervous_12.jpeg"', '"/images/tissues/nervous_13.jpeg"'],
    "kidney": ['"/images/tissues/organ_1.jpeg"', '"/images/tissues/organ_2.jpeg"', '"/images/tissues/organ_3.jpeg"'],
    "liver": ['"/images/tissues/organ_4.jpeg"', '"/images/tissues/organ_5.jpeg"', '"/images/tissues/organ_6.jpeg"'],
    "stomach": ['"/images/tissues/organ_7.jpeg"', '"/images/tissues/organ_8.jpeg"', '"/images/tissues/organ_9.jpeg"'],
    "loose-ct": ['"/images/tissues/connective_12.jpeg"', '"/images/tissues/connective_13.jpeg"', '"/images/tissues/connective_14.jpeg"'],
    "dense-regular": ['"/images/tissues/connective_15.jpeg"', '"/images/tissues/connective_16.jpeg"', '"/images/tissues/connective_17.jpeg"'],
    "skeletal-muscle": ['"/images/tissues/muscular_4.jpeg"', '"/images/tissues/muscular_5.jpeg"', '"/images/tissues/muscular_6.jpeg"'],
    "cardiac-muscle": ['"/images/tissues/muscular_7.jpeg"', '"/images/tissues/muscular_8.jpeg"'],
}

new_content = ""
lines = content.split('\n')
current_id = None

for line in lines:
    id_match = re.search(r'id:\s*"([^"]+)"', line)
    if id_match:
        current_id = id_match.group(1)
        
    new_content += line + '\n'
    
    if "imageUrl:" in line and current_id in extras:
        # insert imageUrls right after
        images_str = ", ".join(extras[current_id])
        indent = line[:len(line) - len(line.lstrip())]
        new_content += f'{indent}imageUrls: [{images_str}],\n'

with open(r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts", "w", encoding="utf-8") as f:
    f.write(new_content)
