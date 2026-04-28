import re
import os

def update_ts():
    ts_path = r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts"
    images_dir = r"c:\Users\anasi\OneDrive\Desktop\website\public\images\tissues"
    
    with open(ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all _micro_ files
    micro_files = [f for f in os.listdir(images_dir) if "_micro_" in f]
    
    # Map them back to the original tissue IDs or image paths
    # If we have organ_1_micro_1.jpeg, it should replace organ_1.jpeg references
    
    for mf in micro_files:
        base_name = mf.split("_micro_")[0] + ".jpeg"
        # Special case for organs (organ_1.jpeg -> organ_1_micro_1.jpeg)
        # Also handle pancreatic, skin, etc.
        
        target_str = f"/images/tissues/{base_name}"
        replacement_str = f"/images/tissues/{mf}"
        
        if target_str in content:
            print(f"Replacing {target_str} with {replacement_str}")
            content = content.replace(target_str, replacement_str)

    # Specific fixes for samples (e.g. samples_1 -> pancreas)
    sample_mappings = {
        "samples_1_micro_2.jpeg": "pancreas",
        "samples_2_micro_1.jpeg": "ileum",
        "samples_3_micro_1.jpeg": "oesophagus",
        "samples_4_micro_2.jpeg": "skin",
        "samples_5_micro_1.jpeg": "testis",
        "samples_6_micro_1.jpeg": "trachea",
        "samples_7_micro_1.jpeg": "stomach",
    }
    
    lines = content.split("\n")
    new_lines = []
    current_id = None
    
    for line in lines:
        id_match = re.search(r'id:\s*"([^"]+)"', line)
        if id_match:
            current_id = id_match.group(1)
            
        for mf, tid in sample_mappings.items():
            if current_id == tid and "imageUrls:" in line:
                if f"/images/tissues/{mf}" not in line:
                    line = line.replace("[", f'["/images/tissues/{mf}", ')
        
        new_lines.append(line)

    with open(ts_path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))

if __name__ == "__main__":
    update_ts()
