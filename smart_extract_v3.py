import cv2
import numpy as np
import os
from pathlib import Path

def extract_stained_regions():
    tissues_dir = Path("public/images/tissues")
    # All potential full-page images
    images = list(tissues_dir.glob("*.jpeg")) + list(tissues_dir.glob("*.jpg"))
    
    output_dir = tissues_dir / "clean_extracted"
    os.makedirs(output_dir, exist_ok=True)

    print(f"Analyzing {len(images)} images for stained tissue regions...")

    for img_path in images:
        if "clean" in img_path.name or "extracted" in img_path.name:
            continue
            
        image = cv2.imread(str(img_path))
        if image is None:
            continue

        # Convert to HSV for better color segmentation
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Define range for H&E stain (Pink/Purple/Violet)
        # Typically H: 140-170 (Purple/Pink)
        lower_pink = np.array([130, 20, 20])
        upper_pink = np.array([175, 255, 255])
        
        # Also include some reddish/magenta tones
        lower_red = np.array([0, 20, 20])
        upper_red = np.array([20, 255, 255])
        
        mask1 = cv2.inRange(hsv, lower_pink, upper_pink)
        mask2 = cv2.inRange(hsv, lower_red, upper_red)
        mask = cv2.bitwise_or(mask1, mask2)
        
        # Clean up mask
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 25))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.dilate(mask, kernel, iterations=2)

        # Find contours of the stained regions
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        count = 0
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            
            # Only keep significant regions (at least 300x300)
            if w > 300 and h > 300:
                count += 1
                # Crop with a tiny margin
                crop = image[y:y+h, x:x+w]
                
                # Further refine: check if the crop actually contains enough color
                crop_hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
                color_pixels = cv2.countNonZero(cv2.inRange(crop_hsv, lower_pink, upper_pink))
                if color_pixels < (w * h * 0.1): # Less than 10% stained? skip.
                    continue

                output_name = f"{img_path.stem}_micro_{count}.jpeg"
                output_path = output_dir / output_name
                cv2.imwrite(str(output_path), crop)
                print(f"  [SUCCESS] Extracted tissue from {img_path.name} -> {output_name}")

if __name__ == "__main__":
    extract_stained_regions()
