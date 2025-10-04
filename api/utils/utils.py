from PIL import Image, ImageOps
import numpy as np
import cv2
from rembg import remove
from typing import Optional
from PIL import Image, ImageOps




def feather_alpha(img_rgba: Image.Image, radius: int = 2) -> Image.Image:
    """Slightly soften the cutout edges by blurring the alpha channel."""
    if img_rgba.mode != "RGBA":
        img_rgba = img_rgba.convert("RGBA")
    r, g, b, a = img_rgba.split()
    a_np = np.array(a)
    if radius > 0:
        a_np = cv2.GaussianBlur(a_np, (0, 0), sigmaX=radius, sigmaY=radius, borderType=cv2.BORDER_DEFAULT)
    a = Image.fromarray(a_np)
    return Image.merge("RGBA", (r, g, b, a))




def resize_to_box(img_rgba: Image.Image, target_w: Optional[int], target_h: Optional[int], mode: str = "contain", pad: int = 0) -> Image.Image:
    """Resize and center subject to a given box with transparent padding."""
    if not target_w or not target_h:
        return img_rgba


    if pad > 0:
        img_rgba = ImageOps.expand(img_rgba, border=pad, fill=(0, 0, 0, 0))


    src_w, src_h = img_rgba.size
    if mode == "cover":
        scale = max(target_w / src_w, target_h / src_h)
    else: # contain
        scale = min(target_w / src_w, target_h / src_h)

    new_w, new_h = max(1, int(round(src_w * scale))), max(1, int(round(src_h * scale)))
    img_resized = img_rgba.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    if mode == "cover":
        x0 = (new_w - target_w) // 2 if new_w > target_w else 0
        y0 = (new_h - target_h) // 2 if new_h > target_h else 0
        img_cropped = img_resized.crop((x0, y0, x0 + min(target_w, new_w), y0 + min(target_h, new_h)))
        cx = (target_w - img_cropped.width) // 2
        cy = (target_h - img_cropped.height) // 2
        canvas.paste(img_cropped, (cx, cy), img_cropped)
    else:
        cx = (target_w - new_w) // 2
        cy = (target_h - new_h) // 2
        canvas.paste(img_resized, (cx, cy), img_resized)

    return canvas