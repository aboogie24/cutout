"""
AI Routes - Enhanced AI processing endpoints
"""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, List
from io import BytesIO
from PIL import Image
import json
import logging

from services.enhancement_service import enhancement_service
from services.detection_service import detection_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Features"])

# ============= Enhancement Endpoints =============

@router.post("/upscale")
async def upscale_image(
    file: UploadFile = File(..., description="Input image file"),
    scale: int = Form(4, description="Upscale factor (2 or 4)"),
):
    """Upscale image using AI (RealESRGAN)"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Upscale
        result = enhancement_service.upscale_image(image, scale=scale)
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Upscale error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/enhance-face")
async def enhance_face(
    file: UploadFile = File(..., description="Input image file"),
    upscale: int = Form(2, description="Upscale factor"),
    weight: float = Form(0.5, description="Enhancement weight (0-1)"),
):
    """Enhance faces in image using AI (GFPGAN)"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Enhance faces
        result = enhancement_service.enhance_face(image, upscale=upscale, weight=weight)
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Face enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/denoise")
async def denoise_image(
    file: UploadFile = File(..., description="Input image file"),
    strength: int = Form(10, description="Denoising strength (3-20)"),
):
    """Denoise image"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        
        # Denoise
        result = enhancement_service.denoise_image(image, strength=strength)
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Denoise error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auto-enhance")
async def auto_enhance(
    file: UploadFile = File(..., description="Input image file"),
):
    """Auto-enhance image (brightness, contrast, color)"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        
        # Auto enhance
        result = enhancement_service.auto_enhance(image)
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Auto enhance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sharpen")
async def sharpen_image(
    file: UploadFile = File(..., description="Input image file"),
    amount: float = Form(1.0, description="Sharpening amount (0.5-3.0)"),
):
    """Sharpen image"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        
        # Sharpen
        result = enhancement_service.sharpen_image(image, amount=amount)
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Sharpen error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= Detection Endpoints =============

@router.post("/detect")
async def detect_objects(
    file: UploadFile = File(..., description="Input image file"),
    confidence: float = Form(0.25, description="Confidence threshold (0.0-1.0)"),
    classes: Optional[str] = Form(None, description="Comma-separated class names to detect"),
    visualize: bool = Form(False, description="Return image with drawn boxes"),
):
    """Detect objects in image using YOLO"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Parse classes if provided
        class_list = None
        if classes:
            class_list = [c.strip() for c in classes.split(",")]
        
        # Detect objects
        detections = detection_service.detect_objects(
            image, 
            confidence=confidence, 
            classes=class_list
        )
        
        if visualize:
            # Return image with drawn boxes
            result_img = detection_service.visualize_detections(image, detections)
            
            buf = BytesIO()
            result_img.save(buf, format="PNG")
            buf.seek(0)
            
            return StreamingResponse(buf, media_type="image/png")
        else:
            # Return JSON with detections
            return JSONResponse(content={
                "detections": detections,
                "count": len(detections)
            })
        
    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-people")
async def detect_people(
    file: UploadFile = File(..., description="Input image file"),
    confidence: float = Form(0.25, description="Confidence threshold"),
    visualize: bool = Form(False, description="Return image with drawn boxes"),
):
    """Detect people in image"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Detect people
        detections = detection_service.detect_people(image, confidence=confidence)
        
        if visualize:
            result_img = detection_service.visualize_detections(image, detections)
            
            buf = BytesIO()
            result_img.save(buf, format="PNG")
            buf.seek(0)
            
            return StreamingResponse(buf, media_type="image/png")
        else:
            return JSONResponse(content={
                "people": detections,
                "count": len(detections)
            })
        
    except Exception as e:
        logger.error(f"People detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/segment-object")
async def segment_object(
    file: UploadFile = File(..., description="Input image file"),
    bbox: str = Form(..., description="Bounding box as 'x1,y1,x2,y2'"),
    expand_ratio: float = Form(0.1, description="Expansion ratio for bbox"),
):
    """Segment object based on bounding box using SAM"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Parse bbox
        bbox_coords = [int(x) for x in bbox.split(",")]
        if len(bbox_coords) != 4:
            raise ValueError("Bbox must be 'x1,y1,x2,y2'")
        
        detection = {
            "bbox": bbox_coords,
            "class": "object",
            "confidence": 1.0
        }
        
        # Segment
        result = detection_service.segment_by_detection(
            image, 
            detection, 
            expand_ratio=expand_ratio
        )
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Segmentation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/segment-by-points")
async def segment_by_points(
    file: UploadFile = File(..., description="Input image file"),
    points: str = Form(..., description="Points as 'x1,y1;x2,y2;...'"),
    labels: str = Form(..., description="Labels as '1,0,1,...' (1=fg, 0=bg)"),
):
    """Segment object using point prompts with SAM"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Parse points
        point_list = []
        for pt in points.split(";"):
            x, y = pt.split(",")
            point_list.append((int(x), int(y)))
        
        # Parse labels
        label_list = [int(x) for x in labels.split(",")]
        
        if len(point_list) != len(label_list):
            raise ValueError("Points and labels must have same length")
        
        # Segment
        result = detection_service.segment_by_points(
            image, 
            point_list, 
            label_list
        )
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Point segmentation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/remove-objects")
async def remove_objects(
    file: UploadFile = File(..., description="Input image file"),
    classes: str = Form(..., description="Comma-separated class names to remove"),
    confidence: float = Form(0.25, description="Detection confidence threshold"),
):
    """Detect and remove specific objects from image"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Parse classes
        class_list = [c.strip() for c in classes.split(",")]
        
        # Remove objects
        result = detection_service.remove_objects_by_class(
            image, 
            class_list, 
            confidence=confidence
        )
        
        # Return as PNG
        buf = BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Object removal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= Combined Processing Endpoints =============

@router.post("/process-all")
async def process_all(
    file: UploadFile = File(..., description="Input image file"),
    remove_bg: bool = Form(True, description="Remove background"),
    upscale: bool = Form(False, description="Upscale image"),
    enhance_face: bool = Form(False, description="Enhance faces"),
    denoise: bool = Form(False, description="Denoise image"),
    auto_enhance: bool = Form(False, description="Auto enhance colors"),
    upscale_factor: int = Form(2, description="Upscale factor"),
):
    """Process image with multiple AI enhancements in sequence"""
    try:
        from rembg import remove as remove_bg_func
        
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        
        # Step 1: Remove background if requested
        if remove_bg:
            logger.info("Step 1: Removing background")
            image = remove_bg_func(image).convert("RGBA")
        else:
            if image.mode != "RGBA":
                image = image.convert("RGBA")
        
        # Step 2: Denoise if requested
        if denoise:
            logger.info("Step 2: Denoising")
            image = enhancement_service.denoise_image(image, strength=10)
        
        # Step 3: Auto enhance if requested
        if auto_enhance:
            logger.info("Step 3: Auto enhancing")
            image = enhancement_service.auto_enhance(image)
        
        # Step 4: Enhance faces if requested
        if enhance_face:
            logger.info("Step 4: Enhancing faces")
            # Convert RGBA to RGB for face enhancement
            if image.mode == "RGBA":
                bg = Image.new("RGB", image.size, (255, 255, 255))
                bg.paste(image, mask=image.split()[3])
                image = enhancement_service.enhance_face(bg, upscale=1, weight=0.5)
                image = image.convert("RGBA")
            else:
                image = enhancement_service.enhance_face(image, upscale=1, weight=0.5)
                image = image.convert("RGBA")
        
        # Step 5: Upscale if requested
        if upscale:
            logger.info(f"Step 5: Upscaling {upscale_factor}x")
            image = enhancement_service.upscale_image(image, scale=upscale_factor)
        
        # Return result
        buf = BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Combined processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/info")
async def get_model_info():
    """Get information about loaded AI models and device"""
    from services.model_manager import model_manager
    
    try:
        device_info = model_manager.get_device_info()
        
        loaded_models = list(model_manager._models.keys())
        
        return JSONResponse(content={
            "device": device_info,
            "loaded_models": loaded_models,
            "available_features": [
                "upscale",
                "face_enhancement",
                "denoising",
                "auto_enhance",
                "sharpen",
                "object_detection",
                "segmentation",
                "object_removal"
            ]
        })
        
    except Exception as e:
        logger.error(f"Model info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
