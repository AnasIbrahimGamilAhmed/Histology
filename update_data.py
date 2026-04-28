import re

with open(r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Epithelial
epithelial_images = [f'"/images/tissues/epithelial_{i}.jpeg"' for i in range(1, 6)]
def ep_repl(m):
    ep_repl.i = getattr(ep_repl, 'i', 0)
    img = epithelial_images[ep_repl.i % len(epithelial_images)]
    ep_repl.i += 1
    return f'imageUrl: {img}'

# We only want to replace within epithelial section
# Actually, the simplest is to just use a custom replacer based on the id
subsections = {
    "simple-squamous": '"/images/tissues/epithelial_1.jpeg"',
    "simple-cuboidal": '"/images/tissues/epithelial_2.jpeg"',
    "simple-columnar": '"/images/tissues/epithelial_3.jpeg"',
    "pseudostratified": '"/images/tissues/epithelial_4.jpeg"',
    "stratified-squamous": '"/images/tissues/epithelial_5.jpeg"',
    "transitional": '"/images/tissues/epithelial_1.jpeg"',
    
    "mucous-ct": '"/images/tissues/connective_1.jpeg"',
    "loose-ct": '"/images/tissues/connective_2.jpeg"',
    "adipose-ct": '"/images/tissues/connective_3.jpeg"',
    "reticular-ct": '"/images/tissues/connective_4.jpeg"',
    "dense-regular": '"/images/tissues/connective_5.jpeg"',
    "elastic-ct": '"/images/tissues/connective_6.jpeg"',
    "hyaline-cartilage": '"/images/tissues/connective_7.jpeg"',
    "elastic-cartilage": '"/images/tissues/connective_8.jpeg"',
    "fibrocartilage": '"/images/tissues/connective_9.jpeg"',
    "compact-bone": '"/images/tissues/connective_10.jpeg"',
    "spongy-bone": '"/images/tissues/connective_11.jpeg"',
    
    "motor-neuron": '"/images/tissues/nervous_1.jpeg"',
    "spinal-cord": '"/images/tissues/nervous_2.jpeg"',
    "sciatic-nerve": '"/images/tissues/nervous_1.jpeg"',
    
    "skeletal-muscle": '"/images/tissues/muscular_1.jpeg"',
    "cardiac-muscle": '"/images/tissues/muscular_2.jpeg"',
    "smooth-muscle": '"/images/tissues/muscular_3.jpeg"',
    
    "pancreas": '"/images/tissues/pancreas.jpeg"',
    "ileum": '"/images/tissues/ileum.jpeg"',
    "kidney": '"/images/tissues/kidney.jpeg"',
    "oesophagus": '"/images/tissues/oesophagus.jpeg"',
    "skin": '"/images/tissues/skin.jpeg"',
    "testis": '"/images/tissues/testis.jpeg"',
    "liver": '"/images/tissues/liver.jpeg"',
    "trachea": '"/images/tissues/trachea.jpeg"',
    "stomach": '"/images/tissues/stomach.jpeg"',
}

new_content = ""
lines = content.split('\n')
current_id = None

for line in lines:
    id_match = re.search(r'id:\s*"([^"]+)"', line)
    if id_match:
        current_id = id_match.group(1)
        
    if "imageUrl: proxyUrl" in line and current_id in subsections:
        line = re.sub(r'imageUrl: proxyUrl\([^)]+\)', f'imageUrl: {subsections[current_id]}', line)
        
    new_content += line + '\n'

with open(r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts", "w", encoding="utf-8") as f:
    f.write(new_content)
