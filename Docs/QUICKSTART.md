# Quick Start Guide

Get started with Cutout AI in 5 minutes!

## Prerequisites Check

Before starting, verify you have:
- ✅ Python 3.8 or higher
- ✅ Node.js 16 or higher
- ✅ 8GB+ RAM available
- ✅ 10GB+ free disk space
- ✅ (Optional) NVIDIA GPU with CUDA support

## Step 1: Clone and Navigate

```bash
git clone <your-repo-url>
cd cutout
```

## Step 2: Backend Setup (5 minutes)

```bash
# Navigate to API directory
cd api

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload
```

**What happens on first start:**
- API starts at `http://localhost:8000`
- AI models will download automatically when first used (~3GB total)
- Check status at `http://localhost:8000/docs`

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## Step 3: Test the API

Open a new terminal and test the basic endpoint:

```bash
# Health check
curl http://localhost:8000/health

# Expected: {"status":"ok"}
```

## Step 4: Frontend Setup (2 minutes)

Open another terminal:

```bash
# Navigate to frontend directory
cd cutout-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be available at:**
`http://localhost:5173`

## Step 5: Try Your First Request

### Option A: Using the Web Interface

1. Open `http://localhost:5173` in your browser
2. Drag and drop an image
3. Click "Remove Background"
4. Download the result!

### Option B: Using cURL

**Background Removal:**
```bash
curl -X POST http://localhost:8000/cutout \
  -F "file=@your-image.jpg" \
  --output result.png
```

**AI Upscaling (4x):**
```bash
curl -X POST http://localhost:8000/ai/upscale \
  -F "file=@your-image.jpg" \
  -F "scale=4" \
  --output upscaled.png
```

**Object Detection:**
```bash
curl -X POST http://localhost:8000/ai/detect \
  -F "file=@your-image.jpg" \
  -F "visualize=true" \
  --output detected.png
```

## Common First-Time Issues

### Issue: "CUDA not available" warning
**Solution:** This is normal if you don't have an NVIDIA GPU. The app will use CPU (slower but functional).

### Issue: Models downloading slowly
**Solution:** First-time model downloads can take 5-10 minutes depending on your internet speed. Be patient!

### Issue: Out of memory errors
**Solution:** 
- Close other applications
- Use smaller images (< 2048px)
- Use CPU instead of GPU for large images

### Issue: Port 8000 already in use
**Solution:** 
```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

## Next Steps

### Explore AI Features

1. **Visit Interactive Docs:**
   - Go to `http://localhost:8000/docs`
   - Try each endpoint with the built-in test interface

2. **Read Full Documentation:**
   - [AI Features Guide](./AI_Features.md) - Complete feature reference
   - [API Reference](http://localhost:8000/docs) - Interactive API docs

3. **Check Model Status:**
```bash
curl http://localhost:8000/ai/models/info
```

### Try Advanced Features

**Face Enhancement:**
```bash
curl -X POST http://localhost:8000/ai/enhance-face \
  -F "file=@portrait.jpg" \
  -F "weight=0.7" \
  --output enhanced.png
```

**Remove Objects:**
```bash
curl -X POST http://localhost:8000/ai/remove-objects \
  -F "file=@photo.jpg" \
  -F "classes=person,car" \
  --output cleaned.png
```

**All-in-One Processing:**
```bash
curl -X POST http://localhost:8000/ai/process-all \
  -F "file=@image.jpg" \
  -F "remove_bg=true" \
  -F "upscale=true" \
  -F "enhance_face=true" \
  --output final.png
```

## Performance Tips

### For Fast Processing:
- Use GPU (CUDA) if available
- Process images < 2048px for real-time results
- Use smaller models (set in config)

### For Best Quality:
- Use larger models (vit_h for SAM, yolov8x for YOLO)
- Enable `alpha_matting` for background removal
- Use `scale=4` for maximum upscaling

## Configuration

### Environment Variables

Create a `.env` file in the `api` directory:

```bash
# Use CPU instead of GPU
AI_DEVICE=cpu

# Use smaller, faster models
AI_SAM_MODEL_TYPE=vit_b
AI_YOLO_MODEL=yolov8n.pt

# Custom model cache location
AI_MODELS_CACHE_DIR=/path/to/models
```

## Testing Your Setup

Run this comprehensive test:

```bash
# Test basic endpoint
curl http://localhost:8000/health

# Test AI model info
curl http://localhost:8000/ai/models/info

# Test background removal (use any image)
curl -X POST http://localhost:8000/cutout \
  -F "file=@test.jpg" \
  --output test_result.png

# Verify output
ls -lh test_result.png
```

## Development Workflow

### Backend Development
```bash
cd api
source venv/bin/activate
uvicorn main:app --reload  # Auto-reloads on code changes
```

### Frontend Development
```bash
cd cutout-frontend
npm run dev  # Hot reload enabled
```

### View Logs
```bash
# Backend logs show in terminal where uvicorn is running
# Frontend logs show in browser console (F12)
```

## Getting Help

### Check These First:
1. API Documentation: `http://localhost:8000/docs`
2. Model Info: `http://localhost:8000/ai/models/info`
3. Backend logs in terminal
4. Browser console (F12) for frontend issues

### Still Stuck?

- Check [AI Features Guide](./AI_Features.md) for detailed docs
- Review [Troubleshooting](./AI_Features.md#troubleshooting) section
- Open an issue on GitHub with:
  - Error message
  - Python version
  - GPU info (if applicable)
  - Steps to reproduce

## What's Next?

Now that you're set up:

1. **Explore the Web UI** - Try all features in the browser
2. **Read Full Docs** - Learn about all AI capabilities
3. **Build Your App** - Integrate the API into your project
4. **Customize** - Adjust models and settings for your needs

---

**Quick Links:**
- 📖 [Full AI Features Documentation](./AI_Features.md)
- 🔧 [API Reference](http://localhost:8000/docs)
- 🐛 [Report Issues](https://github.com/your-repo/issues)

**Happy Image Processing! 🎨**
