import cv2
import numpy as np
import os
from pathlib import Path

def process_and_sync():
    samples_dir = Path("public/images/tissues/samples")
    output_dir = Path("public/images/tissues")
    
    # 1. Slice Nervous Page (nervous_s1.jpeg)
    nervous_path = samples_dir / "nervous_s1.jpeg"
    if nervous_path.exists():
        img = cv2.imread(str(nervous_path))
        h, w = img.shape[:2]
        # Top: Sciatic Nerve
        sciatic = img[0:int(h*0.35), :]
        cv2.imwrite(str(output_dir / "sciatic_nerve_full.jpeg"), sciatic)
        # Middle Left: Motor Neuron
        motor = img[int(h*0.35):int(h*0.60), 0:int(w*0.4)]
        cv2.imwrite(str(output_dir / "motor_neuron_full.jpeg"), motor)
        # Bottom: Spinal Cord
        spinal = img[int(h*0.60):h, :]
        cv2.imwrite(str(output_dir / "spinal_cord_full.jpeg"), spinal)
        print("Nervous tissues sliced and saved.")

    # 2. Map all samples to the Data structure
    ts_path = r"c:\Users\anasi\OneDrive\Desktop\website\lib\data\histologyData.ts"
    with open(ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Apply wide-scale mapping
    mappings = {
        "id: \"adipose-ct\"": "imageUrl: \"/images/tissues/samples/connective_s4.jpeg\"",
        "id: \"dense-regular\"": "imageUrl: \"/images/tissues/samples/connective_s2.jpeg\"",
        "id: \"elastic-ct\"": "imageUrl: \"/images/tissues/samples/connective_s1.jpeg\"",
        "id: \"hyaline-cartilage\"": "imageUrl: \"/images/tissues/samples/connective_s6.jpeg\"",
        "id: \"cardiac-muscle\"": "imageUrl: \"/images/tissues/samples/muscular_s1.jpeg\"",
        "id: \"smooth-muscle\"": "imageUrl: \"/images/tissues/samples/muscular_s3.jpeg\"",
        "id: \"skeletal-muscle\"": "imageUrl: \"/images/tissues/samples/muscular_s2.jpeg\"",
        "id: \"spinal-cord\"": "imageUrl: \"/images/tissues/spinal_cord_full.jpeg\"",
        "id: \"sciatic-nerve\"": "imageUrl: \"/images/tissues/sciatic_nerve_full.jpeg\"",
        "id: \"motor-neuron\"": "imageUrl: \"/images/tissues/motor_neuron_full.jpeg\"",
        "id: \"compact-bone\"": "imageUrl: \"/images/tissues/samples/connective_s8.jpeg\"",
    }

    # Update content line by line for precision
    lines = content.split("\n")
    new_lines = []
    current_id = None
    
    for line in lines:
        for mid, mimg in mappings.items():
            if mid in line:
                current_id = mid
            if current_id and "imageUrl:" in line:
                # Replace the next imageUrl after the ID
                line = "        " + mimg + ","
                current_id = None
                break
        new_lines.append(line)

    with open(ts_path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))
    print("histologyData.ts updated with full samples.")

if __name__ == "__main__":
    process_and_sync()
