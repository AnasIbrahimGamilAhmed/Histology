import re

def final_ts_update():
    path = r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Define the final clean mappings
    mappings = {
        "simple-squamous": "/images/tissues/clean_simple_squamous.jpeg",
        "simple-cuboidal": "/images/tissues/clean_simple_cuboidal.jpeg",
        "simple-columnar": "/images/tissues/clean_simple_columnar.jpeg",
        "pseudostratified": "/images/tissues/clean_pseudostratified.jpeg",
        "transitional": "/images/tissues/clean_transitional.jpeg",
        "pancreas": "/images/tissues/clean_pancreas.jpeg",
        "stomach": "/images/tissues/clean_stomach.jpeg",
        "skin": "/images/tissues/clean_skin.jpeg",
        "testis": "/images/tissues/clean_testis.jpeg",
        "trachea": "/images/tissues/clean_trachea.jpeg",
        "ileum": "/images/tissues/clean_ileum.jpeg",
        "liver": "/images/tissues/clean_liver.jpeg",
        "oesophagus": "/images/tissues/clean_oesophagus.jpeg",
        "kidney": "/images/tissues/clean_kidney.jpeg",
    }

    lines = content.split("\n")
    new_lines = []
    current_id = None

    for line in lines:
        id_match = re.search(r'id:\s*"([^"]+)"', line)
        if id_match:
            current_id = id_match.group(1)
        
        if current_id in mappings:
            # Replace main imageUrl
            if "imageUrl:" in line and "proxyUrl" not in line:
                line = re.sub(r'imageUrl:\s*"[^"]+"', f'imageUrl: "{mappings[current_id]}"', line)
            
            # Replace or Add to imageUrls
            if "imageUrls:" in line:
                # We want to make the clean one the FIRST one
                line = re.sub(r'imageUrls:\s*\[', f'imageUrls: ["{mappings[current_id]}", ', line)
                # Remove duplicates if any
                line = line.replace(f'"{mappings[current_id]}", "{mappings[current_id]}",', f'"{mappings[current_id]}",')
        
        new_lines.append(line)

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))

if __name__ == "__main__":
    final_ts_update()
