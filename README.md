# Cutout - AI-Powered Image Processing Suite

Transform images with comprehensive AI capabilities: background removal, upscaling, enhancement, object detection, and more.

## 🚀 Features

### Core Features
- **Background Removal** - AI-powered background removal using Rembg
- **Image Resizing** - Smart canvas and resize with multiple modes
- **Alpha Matting** - Fine-tuned edge detection for smoother results

### 🆕 AI Enhancement Suite
- **Super Resolution (4x Upscaling)** - Enhance image quality with RealESRGAN
- **Face Enhancement** - Restore and enhance faces with GFPGAN
- **Smart Denoising** - Remove noise while preserving details
- **Auto Enhancement** - Automatic color, brightness, and contrast optimization
- **Image Sharpening** - Professional sharpening with unsharp mask

### 🆕 AI Detection & Segmentation
- **Object Detection** - Detect 80+ object classes with YOLO v8
- **People Detection** - Specialized people detection and tracking
- **Precise Segmentation** - Segment Anything Model (SAM) integration
- **Point-Based Segmentation** - Interactive object selection
- **Smart Object Removal** - Detect and remove unwanted objects with AI inpainting

### 🆕 Combined Processing
- **All-in-One Pipeline** - Process images with multiple AI enhancements in one request
- **Batch Operations** - Process multiple transformations sequentially

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- CUDA GPU (optional, but recommended for AI features)
- 8GB+ RAM (16GB+ recommended)
- 10GB+ disk space for AI model downloads

### Backend Setup

```bash
# Navigate to API directory
cd api

# Install dependencies
pip install -r requirements.txt

# Run the API (models will download automatically on first use)
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- AI Features docs: See `Docs/AI_Features.md`

### Frontend Setup

```bash
# Navigate to frontend directory
cd cutout-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎯 Quick Start

### Basic Background Removal
```bash
curl -X POST http://localhost:8000/cutout \
  -F "file=@image.jpg" \
  --output result.png
```

### AI Upscaling (4x)
```bash
curl -X POST http://localhost:8000/ai/upscale \
  -F "file=@image.jpg" \
  -F "scale=4" \
  --output upscaled.png
```

### Object Detection
```bash
curl -X POST http://localhost:8000/ai/detect \
  -F "file=@image.jpg" \
  -F "visualize=true" \
  --output detected.png
```

### All-in-One Processing
```bash
curl -X POST http://localhost:8000/ai/process-all \
  -F "file=@portrait.jpg" \
  -F "remove_bg=true" \
  -F "enhance_face=true" \
  -F "upscale=true" \
  --output enhanced.png
```

## 📚 Documentation

- **[AI Features Guide](Docs/AI_Features.md)** - Comprehensive AI features documentation
- **[API Reference](http://localhost:8000/docs)** - Interactive API documentation (when server is running)
- **[Upgrade Guide](Docs/Upgrade.md)** - Migration guide for existing users

## 🛠️ API Endpoints

### Original Cutout API
- `GET /health` - Health check
- `POST /cutout` - Background removal with resizing

### AI Enhancement API
- `POST /ai/upscale` - AI upscaling (2x/4x)
- `POST /ai/enhance-face` - Face enhancement with GFPGAN
- `POST /ai/denoise` - Image denoising
- `POST /ai/auto-enhance` - Auto color/contrast enhancement
- `POST /ai/sharpen` - Image sharpening

### AI Detection & Segmentation API
- `POST /ai/detect` - Object detection with YOLO v8
- `POST /ai/detect-people` - People detection
- `POST /ai/segment-object` - SAM-based segmentation
- `POST /ai/segment-by-points` - Interactive segmentation
- `POST /ai/remove-objects` - Smart object removal

### Combined Processing
- `POST /ai/process-all` - Multi-step AI processing pipeline
- `GET /ai/models/info` - Model and device information

## 🎨 Frontend Features

- Modern, responsive UI with Tailwind CSS
- Drag & drop file upload
- Real-time preview
- Advanced settings panel
- Side-by-side before/after comparison
- Image download and URL copy
- Multiple output format support

## ⚙️ Configuration

### AI Model Configuration

Configure AI models via environment variables:

```bash
# Device selection
AI_DEVICE=cuda              # or 'cpu'
AI_USE_FP16=true           # Half precision for GPU

# Model selection
AI_SAM_MODEL_TYPE=vit_h    # vit_h, vit_l, or vit_b
AI_YOLO_MODEL=yolov8n.pt  # n, s, m, l, x
AI_ESRGAN_MODEL=RealESRGAN_x4plus

# Performance
AI_MAX_IMAGE_SIZE=4096
AI_MODELS_CACHE_DIR=./models_cache
```

### Model Downloads

On first use, AI models are automatically downloaded:
- **SAM vit_h**: ~2.4GB
- **YOLO v8n**: ~6MB
- **RealESRGAN**: ~64MB
- **GFPGAN v1.4**: ~332MB

Models are cached in `./models_cache/` for subsequent uses.

## 🚀 Performance

### GPU vs CPU
- **GPU**: 5-10x faster for AI operations
- **CPU**: Functional but significantly slower
- Automatic device detection and selection

### Speed Benchmarks (RTX 3080)
- Background removal: ~1-2 seconds
- 4x Upscaling: ~3-5 seconds
- Face enhancement: ~2-4 seconds
- Object detection: ~0.5-1 second
- Combined processing: ~5-10 seconds

## 🐳 Docker Support

```bash
# Build the image
docker build -t cutout-api ./api

# Run the container
docker run -p 8000:8000 cutout-api
```

For GPU support, use `nvidia-docker` and ensure CUDA drivers are installed.

## 📊 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PyTorch** - Deep learning framework
- **Rembg** - Background removal
- **RealESRGAN** - Super resolution
- **GFPGAN** - Face enhancement
- **Segment Anything (SAM)** - Advanced segmentation
- **YOLO v8** - Object detection
- **OpenCV** - Image processing
- **Pillow** - Image manipulation

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Build tool

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project uses multiple AI models, each with their own licenses:
- **Segment Anything (SAM)**: Apache 2.0 (Meta AI)
- **YOLO v8**: AGPL-3.0 (Ultralytics)
- **RealESRGAN**: BSD 3-Clause (Tencent ARC Lab)
- **GFPGAN**: Custom License (Tencent ARC Lab)
- **Rembg**: MIT License

## 🙏 Credits

Built with amazing open-source AI models:
- Meta AI Research - Segment Anything
- Ultralytics - YOLO v8
- Tencent ARC Lab - RealESRGAN & GFPGAN
- Daniel Gatis - Rembg

## 📮 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Note**: AI features require significant computational resources. GPU is highly recommended for production use.
