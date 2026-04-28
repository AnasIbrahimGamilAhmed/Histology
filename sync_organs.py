def update_organs_final():
    ts_path = r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts"
    with open(ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Mapping based on visual confirmation
    organ_mappings = {
        "id: \"oesophagus\"": "imageUrl: \"/images/tissues/samples/organs_s1.jpeg\"",
        "id: \"liver\"": "imageUrl: \"/images/tissues/samples/organs_s2.jpeg\"",
        "id: \"kidney\"": "imageUrl: \"/images/tissues/samples/organs_s3.jpeg\"",
        "id: \"skin\"": "imageUrl: \"/images/tissues/samples/organs_s4.jpeg\"",
        "id: \"stomach\"": "imageUrl: \"/images/tissues/samples/organs_s5.jpeg\"",
        "id: \"trachea\"": "imageUrl: \"/images/tissues/samples/organs_s6.jpeg\"",
        "id: \"testis\"": "imageUrl: \"/images/tissues/samples/organs_s7.jpeg\"",
        "id: \"pancreas\"": "imageUrl: \"/images/tissues/samples/organs_s8.jpeg\"",
        "id: \"ileum\"": "imageUrl: \"/images/tissues/samples/organs_s9.jpeg\"",
    }

    lines = content.split("\n")
    new_lines = []
    current_id = None
    
    for line in lines:
        for mid, mimg in organ_mappings.items():
            if mid in line:
                current_id = mid
            if current_id and "imageUrl:" in line:
                line = "        " + mimg + ","
                current_id = None
                break
        new_lines.append(line)

    with open(ts_path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))

if __name__ == "__main__":
    update_organs_final()
