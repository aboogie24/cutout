from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional
from io import BytesIO
from rembg import remove
from PIL import Image

from utils.utils import feather_alpha, resize_to_box

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}




@router.post("/cutout")
async def cutout(
    file: UploadFile = File(..., description="Input image file (jpg/png/webp)"),
    width: Optional[int] = Form(None, description="Target width in px (optional)"),
    height: Optional[int] = Form(None, description="Target height in px (optional)"),
    mode: str = Form("contain", description="contain or cover"),
    alpha_matting: bool = Form(False, description="Finer edges; slower"),
    feather: int = Form(2, description="Feather radius scale (~per 1000px)"),
    pad: int = Form(0, description="Transparent padding in px before fitting"),
    ):
    """Remove background and return a transparent PNG (image/png)."""
    try:
        contents = await file.read()
        src = Image.open(BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")


    # Background removal
    cut = remove(
        src,
        alpha_matting=alpha_matting,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10 if alpha_matting else None,
    ).convert("RGBA")


    # Edge feathering (scale by size heuristically)
    if feather and feather > 0:
        radius = max(1, int(round(min(cut.size) / 1000 * feather)))
        cut = feather_alpha(cut, radius=radius)


    # Resize/canvas
    out_img = resize_to_box(cut, width, height, mode=mode, pad=pad)


    # Encode PNG
    buf = BytesIO()
    out_img.save(buf, format="PNG")
    buf.seek(0)


    return StreamingResponse(buf, media_type="image/png", headers={
    "Content-Disposition": f"inline; filename=output.png"
    })
