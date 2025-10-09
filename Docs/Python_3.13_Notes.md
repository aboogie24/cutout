# Python 3.13 Compatibility Notes

## Overview

This project has been tested with Python 3.13. Some AI enhancement features require additional packages that are not yet fully compatible with Python 3.13.

## What Works Out of the Box

✅ **Core Features (Full Support)**
- Background removal (Rembg)
- Image resizing and canvas operations
- Object detection (YOLO v8)
- SAM segmentation
- Image denoising
- Auto enhancement
- Image sharpening
- All detection and segmentation features

## Optional Features (Require Python 3.11 or earlier)

⚠️ **Advanced AI Upscaling & Face Enhancement**

The following features require packages that are not yet compatible with Python 3.13:
- **RealESRGAN** (AI-powered 4x upscaling)
- **GFPGAN** (AI face enhancement)

### Fallback Behavior

If these packages are not installed:
- **Upscaling**: Falls back to high-quality bicubic interpolation
- **Face Enhancement**: Falls back to auto-enhancement + resize

The API will continue to work, but will log warnings about using fallback methods.

## Installation Options

### Option 1: Use Python 3.13 (Recommended for Most Users)

```bash
# Install core dependencies (works out of the box)
pip install -r requirements.txt
```

**What you get:**
- ✅ All object detection & segmentation features
- ✅ Background removal
- ✅ Image denoising, enhancement, sharpening
- ⚠️ Fallback upscaling (good quality, but not AI-powered)
- ⚠️ Fallback face enhancement

### Option 2: Use Python 3.11 for Full Features

If you need the advanced AI upscaling and face enhancement:

```bash
# Create Python 3.11 environment
conda create -n cutout python=3.11
conda activate cutout

# Install all dependencies
pip install -r requirements.txt

# Manually install the advanced features
pip install basicsr realesrgan gfpgan
```

**What you get:**
- ✅ Everything from Option 1
- ✅ AI-powered 4x upscaling (RealESRGAN)
- ✅ AI face enhancement (GFPGAN)

## Checking Your Installation

After installation, check which features are available:

```bash
curl http://localhost:8000/ai/models/info
```

The response will show which models are loaded and available.

## Feature Comparison

| Feature | Python 3.13 | Python 3.11 |
|---------|-------------|-------------|
| Background Removal | ✅ Full | ✅ Full |
| Object Detection | ✅ Full | ✅ Full |
| SAM Segmentation | ✅ Full | ✅ Full |
| Object Removal | ✅ Full | ✅ Full |
| Denoising | ✅ Full | ✅ Full |
| Auto Enhancement | ✅ Full | ✅ Full |
| Sharpening | ✅ Full | ✅ Full |
| AI Upscaling | ⚠️ Fallback (Bicubic) | ✅ Full (RealESRGAN) |
| Face Enhancement | ⚠️ Fallback (Auto-enhance) | ✅ Full (GFPGAN) |

## API Behavior

### With Full Installation (Python 3.11)
- All endpoints work with AI models
- Best quality results
- Slower processing (AI inference)

### With Core Installation (Python 3.13)
- All endpoints respond successfully
- Upscaling/face enhancement use fallback methods
- Faster processing for fallback features
- Warning messages in logs

## Error Messages

If you try to use advanced features without the packages:

```
WARNING: RealESRGAN not available. Install with: pip install realesrgan basicsr
WARNING: Using fallback bicubic upscaling (install realesrgan for AI upscaling)
```

These are warnings, not errors. The API will continue to function.

## Recommendations

**For Development & Testing:** Python 3.13 is fine. You get all the important features.

**For Production (Best Quality):** Use Python 3.11 to enable all AI features.

**For Production (Performance Focus):** Python 3.13 works great if you don't need the advanced upscaling.

## Future Compatibility

As `basicsr`, `realesrgan`, and `gfpgan` update to support Python 3.13, you'll be able to install them without downgrading Python. Check for updates periodically:

```bash
pip install --upgrade basicsr realesrgan gfpgan
```

## Quick Reference

### Check Python Version
```bash
python --version
```

### Install Core Features (Python 3.13)
```bash
pip install -r requirements.txt
```

### Install All Features (Python 3.11)
```bash
pip install -r requirements.txt
pip install basicsr realesrgan gfpgan
```

### Verify Installation
```bash
# Start server
uvicorn main:app --reload

# Check in another terminal
curl http://localhost:8000/ai/models/info
```

## Questions?

- Check which features you need from the [AI Features Guide](./AI_Features.md)
- Most users will be satisfied with Python 3.13 + core features
- Only switch to Python 3.11 if you specifically need AI upscaling/face enhancement
