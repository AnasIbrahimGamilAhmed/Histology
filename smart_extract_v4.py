import cv2
import numpy as np
import os
from pathlib import Path

def extract_stained_regions():
    # Target the raw folder and the main tissues folder
    tissues_dirs = [Path("public/images/tissues/raw"), Path("public/images/tissues")]
    
    output_dir = Path("public/images/tissues/clean_extracted")
    os.makedirs(output_dir, exist_ok=True)

    print(f"Analyzing images for stained tissue regions (v4 - high sensitivity)...")

    for tdir in tissues_dirs:
        if not tdir.exists(): continue
        images = list(tdir.glob("*.jpeg")) + list(tdir.glob("*.jpg"))
        
        for img_path in images:
            if "clean" in img_path.name or "extracted" in img_path.name:
                continue
                
            image = cv2.imread(str(img_path))
            if image is None: continue

            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # WIDER range for H&E (Pink/Purple/Red/Blue)
            # Hue: 0-20 (Red/Pink), 140-180 (Purple/Pink)
            lower_pink1 = np.array([0, 10, 10])
            upper_pink1 = np.array([25, 255, 255])
            lower_pink2 = np.array([130, 10, 10])
            upper_pink2 = np.array([180, 255, 255])
            
            mask1 = cv2.inRange(hsv, lower_pink1, upper_pink1)
            mask2 = cv2.inRange(hsv, lower_pink2, upper_pink2)
            mask = cv2.bitwise_or(mask1, mask2)
            
            # Clean up mask - smaller kernel to catch smaller circles
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.dilate(mask, kernel, iterations=1)

            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            count = 0
            for cnt in contours:
                x, y, w, h = cv2.boundingRect(cnt)
                
                # LOWER threshold (150x150) to catch the circular samples
                if w > 120 and h > 120 and w < 2500 and h < 2500:
                    count += 1
                    crop = image[y:y+h, x:x+w]
                    
                    output_name = f"{img_path.stem}_micro_{count}.jpeg"
                    output_path = output_dir / output_name
                    cv2.imwrite(str(output_path), crop)
                    print(f"  [SUCCESS] Extracted from {img_path.name} -> {output_name}")

if __name__ == "__main__":
    extract_stained_regions()
