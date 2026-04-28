import cv2
import numpy as np
import os
from pathlib import Path

def ultimate_cleanup():
    tissues_dir = Path("public/images/tissues")
    raw_dir = tissues_dir / "raw"
    final_dir = tissues_dir / "final_clean"
    os.makedirs(final_dir, exist_ok=True)

    print("Starting Ultimate Surgical Cleanup of Histology Images...")

    # 1. Process Organs (Bottom Crop for real micrographs)
    organ_files = ["pancreas.jpeg", "stomach.jpeg", "skin.jpeg", "testis.jpeg", "trachea.jpeg", "ileum.jpeg", "liver.jpeg", "oesophagus.jpeg", "kidney.jpeg"]
    for f in organ_files:
        img_path = tissues_dir / f
        if not img_path.exists(): continue
        img = cv2.imread(str(img_path))
        h, w = img.shape[:2]
        # Crop the bottom 55% to get only the micrograph
        crop = img[int(h*0.42):int(h*0.95), int(w*0.05):int(w*0.95)]
        cv2.imwrite(str(final_dir / f"clean_{f}"), crop)
        print(f"  [FIXED] Organ: {f} -> clean_{f}")

    # 2. Process Epithelial (Circular samples from ep_sample_p1.jpeg)
    ep_path = raw_dir / "ep_sample_p1.jpeg"
    if ep_path.exists():
        img = cv2.imread(str(ep_path))
        # Known coordinates for the 4 circles on the left
        h, w = img.shape[:2]
        circles = [
            ("simple_squamous", 0.1, 0.25),
            ("simple_cuboidal", 0.35, 0.50),
            ("simple_columnar", 0.55, 0.70),
            ("pseudostratified", 0.75, 0.90)
        ]
        for name, start_y, end_y in circles:
            crop = img[int(h*start_y):int(h*end_y), 0:int(w*0.35)]
            cv2.imwrite(str(final_dir / f"clean_{name}.jpeg"), crop)
            print(f"  [FIXED] Epithelial: {name}")

    # 3. Process Transitional (from ep_sample_p2.jpeg)
    ep2_path = raw_dir / "ep_sample_p2.jpeg"
    if ep2_path.exists():
        img = cv2.imread(str(ep2_path))
        h, w = img.shape[:2]
        # Transitional is at the bottom
        trans_crop = img[int(h*0.65):int(h*0.95), int(w*0.05):int(w*0.5)]
        cv2.imwrite(str(final_dir / "clean_transitional.jpeg"), trans_crop)
        print("  [FIXED] Transitional Epithelium")

if __name__ == "__main__":
    ultimate_cleanup()
