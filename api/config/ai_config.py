from pydantic_settings import BaseSettings
from typing import Optional
import torch

class AISettings(BaseSettings):
    """AI Model Configuration Settings"""
    
    # Device Configuration
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    use_fp16: bool = torch.cuda.is_available()  # Use half precision on GPU
    
    # Model Paths (will be downloaded on first use)
    models_cache_dir: str = "./models_cache"
    
    # SAM (Segment Anything) Configuration
    sam_model_type: str = "vit_h"  # vit_h, vit_l, or vit_b
    sam_checkpoint: Optional[str] = None
    
    # YOLO Configuration
    yolo_model: str = "yolov8n.pt"  # n=nano, s=small, m=medium, l=large, x=xlarge
    yolo_conf_threshold: float = 0.25
    
    # RealESRGAN Configuration
    esrgan_model: str = "RealESRGAN_x4plus"  # x2, x4, anime models available
    esrgan_tile: int = 400  # Tile size for processing large images
    esrgan_tile_pad: int = 10
    
    # GFPGAN Configuration (Face Enhancement)
    gfpgan_version: str = "1.4"
    gfpgan_upscale: int = 2
    
    # Stable Diffusion Configuration (for future background generation)
    sd_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    sd_steps: int = 30
    sd_guidance_scale: float = 7.5
    
    # Performance Settings
    max_image_size: int = 4096  # Maximum dimension for processing
    enable_model_caching: bool = True
    lazy_load_models: bool = True  # Load models only when needed
    
    class Config:
        env_prefix = "AI_"
        case_sensitive = False

# Global settings instance
ai_settings = AISettings()
