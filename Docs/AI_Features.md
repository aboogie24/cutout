# AI Features Documentation

## Overview

The Cutout API now includes a comprehensive suite of AI-powered image processing capabilities. This document describes all available AI features, their endpoints, and usage examples.

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Model Information](#model-information)
3. [Image Enhancement](#image-enhancement)
4. [Object Detection & Segmentation](#object-detection--segmentation)
5. [Combined Processing](#combined-processing)
6. [Configuration](#configuration)
7. [API Reference](#api-reference)

---

## Setup & Installation

### Prerequisites

- Python 3.8+
- CUDA-compatible GPU (optional, but highly recommended for better performance)
- At least 8GB RAM (16GB+ recommended)
- 10GB+ free disk space for model downloads

### Installation Steps

1. **Install dependencies:**
```bash
cd api
pip install -r requirements.txt
```

2. **First Run - Model Downloads:**

On first use, AI models will be automatically downloaded to `./models_cache/`:
- SAM (Segment Anything): ~2.4GB (vit_h model)
- YOLO v8: ~6MB (nano model)
- RealESRGAN: ~64MB
- GFPGAN: ~332MB

This is a one-time download. Subsequent runs will use cached models.

3. **Start the API:**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

4. **Check API Documentation:**
Visit `http://localhost:8000/docs` for interactive API documentation

---

## Model Information

### Get Model Info

Check which models are loaded and device information:

```bash
curl http://localhost:8000/ai/models/info
```

Response:
```json
{
  "device": {
    "device": "cuda",
    "device_name": "NVIDIA GeForce RTX 3080",
    "cuda_version": "11.8",
    "total_memory_gb": 10.0,
    "allocated_memory_gb": 2.3
  },
  "loaded_models": ["yolo", "esrgan"],
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
}
```

---

## Image Enhancement

### 1. AI Upscaling (Super Resolution)

Upscale images 2x or 4x using RealESRGAN.

**Endpoint:** `POST /ai/upscale`

**Parameters:**
- `file`: Image file (required)
- `scale`: Upscale factor - 2 or 4 (default: 4)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/upscale \
  -F "file=@image.jpg" \
  -F "scale=4" \
  --output upscaled.png
```

**Use Cases:**
- Increase resolution for printing
- Enhance low-quality images
- Prepare images for large displays

---

### 2. Face Enhancement

Enhance and restore faces using GFPGAN AI model.

**Endpoint:** `POST /ai/enhance-face`

**Parameters:**
- `file`: Image file (required)
- `upscale`: Upscale factor (default: 2)
- `weight`: Enhancement strength 0.0-1.0 (default: 0.5)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/enhance-face \
  -F "file=@portrait.jpg" \
  -F "upscale=2" \
  -F "weight=0.7" \
  --output enhanced_face.png
```

**Features:**
- Face restoration and enhancement
- Skin smoothing
- Detail preservation
- Works on multiple faces

---

### 3. Image Denoising

Remove noise from images using advanced denoising algorithms.

**Endpoint:** `POST /ai/denoise`

**Parameters:**
- `file`: Image file (required)
- `strength`: Denoising strength 3-20 (default: 10)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/denoise \
  -F "file=@noisy_image.jpg" \
  -F "strength=15" \
  --output denoised.png
```

---

### 4. Auto Enhancement

Automatically enhance brightness, contrast, and colors.

**Endpoint:** `POST /ai/auto-enhance`

**Parameters:**
- `file`: Image file (required)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/auto-enhance \
  -F "file=@image.jpg" \
  --output enhanced.png
```

**Features:**
- Adaptive histogram equalization (CLAHE)
- Color balance optimization
- Contrast enhancement

---

### 5. Image Sharpening

Sharpen images using unsharp mask.

**Endpoint:** `POST /ai/sharpen`

**Parameters:**
- `file`: Image file (required)
- `amount`: Sharpening amount 0.5-3.0 (default: 1.0)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/sharpen \
  -F "file=@image.jpg" \
  -F "amount=1.5" \
  --output sharpened.png
```

---

## Object Detection & Segmentation

### 1. Object Detection

Detect objects using YOLO v8.

**Endpoint:** `POST /ai/detect`

**Parameters:**
- `file`: Image file (required)
- `confidence`: Confidence threshold 0.0-1.0 (default: 0.25)
- `classes`: Comma-separated class names (optional)
- `visualize`: Return image with boxes (default: false)

**Example - JSON Response:**
```bash
curl -X POST http://localhost:8000/ai/detect \
  -F "file=@image.jpg" \
  -F "confidence=0.5"
```

Response:
```json
{
  "detections": [
    {
      "bbox": [100, 150, 300, 450],
      "class": "person",
      "confidence": 0.89,
      "class_id": 0
    },
    {
      "bbox": [350, 200, 500, 400],
      "class": "dog",
      "confidence": 0.76,
      "class_id": 16
    }
  ],
  "count": 2
}
```

**Example - Visualized:**
```bash
curl -X POST http://localhost:8000/ai/detect \
  -F "file=@image.jpg" \
  -F "visualize=true" \
  --output detected.png
```

**Supported Classes:** 80 COCO classes including person, car, dog, cat, bicycle, etc.

---

### 2. People Detection

Specialized endpoint for detecting people only.

**Endpoint:** `POST /ai/detect-people`

**Parameters:**
- `file`: Image file (required)
- `confidence`: Confidence threshold (default: 0.25)
- `visualize`: Return image with boxes (default: false)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/detect-people \
  -F "file=@crowd.jpg" \
  -F "confidence=0.5" \
  -F "visualize=true" \
  --output people_detected.png
```

---

### 3. Precise Object Segmentation (SAM)

Segment objects using Segment Anything Model with bounding box.

**Endpoint:** `POST /ai/segment-object`

**Parameters:**
- `file`: Image file (required)
- `bbox`: Bounding box as 'x1,y1,x2,y2' (required)
- `expand_ratio`: Box expansion for better segmentation (default: 0.1)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/segment-object \
  -F "file=@image.jpg" \
  -F "bbox=100,100,400,500" \
  -F "expand_ratio=0.15" \
  --output segmented.png
```

---

### 4. Point-Based Segmentation

Segment objects using point prompts with SAM.

**Endpoint:** `POST /ai/segment-by-points`

**Parameters:**
- `file`: Image file (required)
- `points`: Points as 'x1,y1;x2,y2;...' (required)
- `labels`: Labels as '1,0,1,...' where 1=foreground, 0=background (required)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/segment-by-points \
  -F "file=@image.jpg" \
  -F "points=200,300;150,250;400,350" \
  -F "labels=1,1,0" \
  --output segmented.png
```

**Use Case:** Interactive segmentation where user clicks to define object boundaries.

---

### 5. Object Removal

Detect and remove specific objects from images.

**Endpoint:** `POST /ai/remove-objects`

**Parameters:**
- `file`: Image file (required)
- `classes`: Comma-separated class names to remove (required)
- `confidence`: Detection confidence (default: 0.25)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/remove-objects \
  -F "file=@image.jpg" \
  -F "classes=person,car" \
  -F "confidence=0.3" \
  --output cleaned.png
```

**How it works:**
1. Detects specified objects using YOLO
2. Creates inpainting mask
3. Fills removed areas with AI inpainting

---

## Combined Processing

### All-in-One Processing Pipeline

Process images with multiple AI enhancements in a single request.

**Endpoint:** `POST /ai/process-all`

**Parameters:**
- `file`: Image file (required)
- `remove_bg`: Remove background (default: true)
- `upscale`: Upscale image (default: false)
- `enhance_face`: Enhance faces (default: false)
- `denoise`: Denoise image (default: false)
- `auto_enhance`: Auto enhance colors (default: false)
- `upscale_factor`: Upscale factor 2 or 4 (default: 2)

**Example:**
```bash
curl -X POST http://localhost:8000/ai/process-all \
  -F "file=@portrait.jpg" \
  -F "remove_bg=true" \
  -F "denoise=true" \
  -F "enhance_face=true" \
  -F "upscale=true" \
  -F "upscale_factor=2" \
  --output final.png
```

**Processing Order:**
1. Background removal (if enabled)
2. Denoising (if enabled)
3. Auto enhancement (if enabled)
4. Face enhancement (if enabled)
5. Upscaling (if enabled)

---

## Configuration

### Environment Variables

Configure AI behavior using environment variables:

```bash
# Device Configuration
AI_DEVICE=cuda                    # or 'cpu'
AI_USE_FP16=true                 # Half precision on GPU

# Model Selection
AI_SAM_MODEL_TYPE=vit_h          # vit_h, vit_l, or vit_b
AI_YOLO_MODEL=yolov8n.pt        # n, s, m, l, x
AI_ESRGAN_MODEL=RealESRGAN_x4plus

# Performance
AI_MAX_IMAGE_SIZE=4096
AI_ENABLE_MODEL_CACHING=true
AI_LAZY_LOAD_MODELS=true
```

### Model Cache Directory

Models are cached in `./models_cache/` by default. Change with:

```bash
AI_MODELS_CACHE_DIR=/path/to/cache
```

---

## API Reference

### Base URL
```
http://localhost:8000
```

### Common Response Types

**Image Response:**
- Content-Type: `image/png`
- Binary PNG data

**JSON Response:**
```json
{
  "detections": [...],
  "count": 2
}
```

**Error Response:**
```json
{
  "detail": "Error message"
}
```

### Rate Limiting

- No rate limiting by default
- Consider implementing rate limiting for production

### File Size Limits

- Default: 10MB per request
- Configurable in FastAPI settings

---

## Performance Tips

### GPU vs CPU

- **GPU**: 5-10x faster for most operations
- **CPU**: Works but significantly slower
- Automatic detection and selection

### Model Selection

**Speed vs Quality Trade-offs:**

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| SAM vit_b | Fast | Good | Real-time applications |
| SAM vit_h | Slow | Excellent | Best quality segmentation |
| YOLO v8n | Very Fast | Good | Real-time detection |
| YOLO v8x | Slow | Excellent | Accurate detection |

### Memory Management

Models are loaded on-demand and cached. If running low on memory:

1. Use smaller models (vit_b, yolov8n)
2. Disable model caching
3. Process images in smaller batches

---

## Examples

### Python Client Example

```python
import requests

def upscale_image(image_path, scale=4):
    with open(image_path, 'rb') as f:
        response = requests.post(
            'http://localhost:8000/ai/upscale',
            files={'file': f},
            data={'scale': scale}
        )
    
    with open('upscaled.png', 'wb') as f:
        f.write(response.content)

def detect_objects(image_path):
    with open(image_path, 'rb') as f:
        response = requests.post(
            'http://localhost:8000/ai/detect',
            files={'file': f},
            data={'confidence': 0.5}
        )
    
    return response.json()
```

### JavaScript/TypeScript Example

```typescript
async function upscaleImage(file: File, scale: number = 4): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('scale', scale.toString());
  
  const response = await fetch('http://localhost:8000/ai/upscale', {
    method: 'POST',
    body: formData
  });
  
  return await response.blob();
}

async function detectObjects(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confidence', '0.5');
  
  const response = await fetch('http://localhost:8000/ai/detect', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

---

## Troubleshooting

### Common Issues

**1. Models not downloading:**
- Check internet connection
- Verify disk space
- Check firewall settings

**2. CUDA out of memory:**
- Reduce image size
- Use smaller models
- Process images sequentially
- Enable `AI_USE_FP16=true`

**3. Slow processing on CPU:**
- Expected behavior, GPU recommended
- Consider cloud GPU instances
- Use smaller models

**4. Import errors:**
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check Python version (3.8+)

### Getting Help

- Check logs for detailed error messages
- Visit API docs: `http://localhost:8000/docs`
- Review configuration in `config/ai_config.py`

---

## Future Features (Roadmap)

- [ ] Stable Diffusion background generation
- [ ] Style transfer
- [ ] Batch processing API
- [ ] Real-time video processing
- [ ] Custom model fine-tuning support
- [ ] WebSocket streaming for progress
- [ ] Background job queue (Celery)

---

## License & Credits

**AI Models Used:**
- **Segment Anything (SAM)**: Meta AI
- **YOLO v8**: Ultralytics
- **RealESRGAN**: Tencent ARC Lab
- **GFPGAN**: Tencent ARC Lab
- **Rembg**: Daniel Gatis

All models are used under their respective licenses.
