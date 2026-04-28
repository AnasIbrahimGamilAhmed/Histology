import re

def fix_everything_precise():
    path = r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Exact mappings for each section ID
    mappings = {
        "adipose-ct": "/images/tissues/samples/connective_s4.jpeg",
        "dense-regular": "/images/tissues/samples/connective_s2.jpeg",
        "elastic-ct": "/images/tissues/samples/connective_s1.jpeg",
        "hyaline-cartilage": "/images/tissues/samples/connective_s6.jpeg",
        "cardiac-muscle": "/images/tissues/samples/muscular_s1.jpeg",
        "smooth-muscle": "/images/tissues/samples/muscular_s3.jpeg",
        "skeletal-muscle": "/images/tissues/samples/muscular_s2.jpeg",
        "spinal-cord": "/images/tissues/spinal_cord_full.jpeg",
        "sciatic-nerve": "/images/tissues/sciatic_nerve_full.jpeg",
        "motor-neuron": "/images/tissues/motor_neuron_full.jpeg",
        "compact-bone": "/images/tissues/samples/connective_s8.jpeg",
        "oesophagus": "/images/tissues/samples/organs_s1.jpeg",
        "liver": "/images/tissues/samples/organs_s2.jpeg",
        "kidney": "/images/tissues/samples/organs_s3.jpeg",
        "skin": "/images/tissues/samples/organs_s4.jpeg",
        "stomach": "/images/tissues/samples/organs_s5.jpeg",
        "trachea": "/images/tissues/samples/organs_s6.jpeg",
        "testis": "/images/tissues/samples/organs_s7.jpeg",
        "pancreas": "/images/tissues/samples/organs_s8.jpeg",
        "ileum": "/images/tissues/samples/organs_s9.jpeg",
    }

    # Split into sections by the "id:" pattern to avoid overlapping replacements
    # We use a state machine to track the current section being edited
    lines = content.split("\n")
    new_lines = []
    current_section_id = None
    
    for line in lines:
        # Detect ID
        id_match = re.search(r'id:\s*"([^"]+)"', line)
        if id_match:
            current_section_id = id_match.group(1)
            
        # If we are inside a section that needs mapping
        if current_section_id in mappings:
            # Replace ONLY the main imageUrl for this specific ID
            if "imageUrl:" in line and "proxyUrl" not in line and "imageUrls" not in line:
                line = re.sub(r'imageUrl:\s*"[^"]+"', f'imageUrl: "{mappings[current_section_id]}"', line)
        
        new_lines.append(line)

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))
    print("SUCCESS: Precision fix applied to histologyData.ts")

if __name__ == "__main__":
    fix_everything_precise()
