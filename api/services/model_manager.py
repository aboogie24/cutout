"""
AI Model Manager - Handles loading, caching, and lifecycle of AI models
"""
import os
import torch
from typing import Optional, Dict, Any
from functools import lru_cache
import logging

from config.ai_config import ai_settings

logger = logging.getLogger(__name__)

class ModelManager:
    """Singleton class to manage AI model loading and caching"""
    
    _instance = None
    _models: Dict[str, Any] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.device = ai_settings.device
        self.models_cache_dir = ai_settings.models_cache_dir
        os.makedirs(self.models_cache_dir, exist_ok=True)
        
        logger.info(f"ModelManager initialized on device: {self.device}")
        self._initialized = True
    
    def get_sam_predictor(self):
        """Load and return SAM (Segment Anything Model) predictor"""
        if "sam" not in self._models:
            try:
                from segment_anything import sam_model_registry, SamPredictor
                
                logger.info(f"Loading SAM model: {ai_settings.sam_model_type}")
                
                # Download checkpoint if not exists
                checkpoint_path = self._get_sam_checkpoint()
                
                sam = sam_model_registry[ai_settings.sam_model_type](checkpoint=checkpoint_path)
                sam.to(device=self.device)
                
                predictor = SamPredictor(sam)
                self._models["sam"] = predictor
                logger.info("SAM model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load SAM model: {e}")
                raise
        
        return self._models["sam"]
    
    def get_yolo_model(self):
        """Load and return YOLO model for object detection"""
        if "yolo" not in self._models:
            try:
                from ultralytics import YOLO
                
                logger.info(f"Loading YOLO model: {ai_settings.yolo_model}")
                model = YOLO(ai_settings.yolo_model)
                
                if self.device == "cuda":
                    model.to(self.device)
                
                self._models["yolo"] = model
                logger.info("YOLO model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load YOLO model: {e}")
                raise
        
        return self._models["yolo"]
    
    def get_esrgan_upsampler(self):
        """Load and return RealESRGAN upsampler"""
        if "esrgan" not in self._models:
            try:
                from realesrgan import RealESRGANer
                from basicsr.archs.rrdbnet_arch import RRDBNet
                
                logger.info(f"Loading RealESRGAN model: {ai_settings.esrgan_model}")
                
                # Configure model architecture
                if "anime" in ai_settings.esrgan_model.lower():
                    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4)
                else:
                    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
                
                # Get model path
                model_path = self._get_esrgan_model_path()
                
                upsampler = RealESRGANer(
                    scale=4,
                    model_path=model_path,
                    model=model,
                    tile=ai_settings.esrgan_tile,
                    tile_pad=ai_settings.esrgan_tile_pad,
                    pre_pad=0,
                    half=ai_settings.use_fp16 and self.device == "cuda",
                    device=self.device
                )
                
                self._models["esrgan"] = upsampler
                logger.info("RealESRGAN model loaded successfully")
            except ImportError as e:
                logger.error(f"RealESRGAN not installed. Install with: pip install realesrgan basicsr")
                raise ImportError("RealESRGAN not available. Install with: pip install realesrgan basicsr")
            except Exception as e:
                logger.error(f"Failed to load RealESRGAN model: {e}")
                raise
        
        return self._models["esrgan"]
    
    def get_gfpgan_enhancer(self):
        """Load and return GFPGAN face enhancer"""
        if "gfpgan" not in self._models:
            try:
                from gfpgan import GFPGANer
                
                logger.info(f"Loading GFPGAN v{ai_settings.gfpgan_version}")
                
                model_path = self._get_gfpgan_model_path()
                
                enhancer = GFPGANer(
                    model_path=model_path,
                    upscale=ai_settings.gfpgan_upscale,
                    arch='clean',
                    channel_multiplier=2,
                    bg_upsampler=None,  # Can use esrgan for background
                    device=self.device
                )
                
                self._models["gfpgan"] = enhancer
                logger.info("GFPGAN model loaded successfully")
            except ImportError as e:
                logger.error(f"GFPGAN not installed. Install with: pip install gfpgan")
                raise ImportError("GFPGAN not available. Install with: pip install gfpgan")
            except Exception as e:
                logger.error(f"Failed to load GFPGAN model: {e}")
                raise
        
        return self._models["gfpgan"]
    
    def _get_sam_checkpoint(self) -> str:
        """Get or download SAM checkpoint"""
        model_urls = {
            "vit_h": "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth",
            "vit_l": "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_l_0b3195.pth",
            "vit_b": "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth"
        }
        
        if ai_settings.sam_checkpoint and os.path.exists(ai_settings.sam_checkpoint):
            return ai_settings.sam_checkpoint
        
        # Default checkpoint path
        checkpoint_name = f"sam_{ai_settings.sam_model_type}.pth"
        checkpoint_path = os.path.join(self.models_cache_dir, checkpoint_name)
        
        if not os.path.exists(checkpoint_path):
            logger.info(f"Downloading SAM checkpoint from {model_urls[ai_settings.sam_model_type]}")
            self._download_file(model_urls[ai_settings.sam_model_type], checkpoint_path)
        
        return checkpoint_path
    
    def _get_esrgan_model_path(self) -> str:
        """Get RealESRGAN model path"""
        model_urls = {
            "RealESRGAN_x4plus": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
            "RealESRGAN_x2plus": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth",
            "RealESRGAN_x4plus_anime_6B": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth"
        }
        
        model_path = os.path.join(self.models_cache_dir, f"{ai_settings.esrgan_model}.pth")
        
        if not os.path.exists(model_path):
            if ai_settings.esrgan_model in model_urls:
                logger.info(f"Downloading RealESRGAN model: {ai_settings.esrgan_model}")
                self._download_file(model_urls[ai_settings.esrgan_model], model_path)
            else:
                raise ValueError(f"Unknown ESRGAN model: {ai_settings.esrgan_model}")
        
        return model_path
    
    def _get_gfpgan_model_path(self) -> str:
        """Get GFPGAN model path"""
        model_urls = {
            "1.3": "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth",
            "1.4": "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth"
        }
        
        model_path = os.path.join(self.models_cache_dir, f"GFPGANv{ai_settings.gfpgan_version}.pth")
        
        if not os.path.exists(model_path):
            if ai_settings.gfpgan_version in model_urls:
                logger.info(f"Downloading GFPGAN v{ai_settings.gfpgan_version}")
                self._download_file(model_urls[ai_settings.gfpgan_version], model_path)
            else:
                raise ValueError(f"Unknown GFPGAN version: {ai_settings.gfpgan_version}")
        
        return model_path
    
    def _download_file(self, url: str, destination: str):
        """Download a file with progress indication"""
        import urllib.request
        
        def _progress_hook(count, block_size, total_size):
            percent = int(count * block_size * 100 / total_size)
            if count % 50 == 0:  # Log every ~5%
                logger.info(f"Download progress: {percent}%")
        
        try:
            urllib.request.urlretrieve(url, destination, reporthook=_progress_hook)
            logger.info(f"Download completed: {destination}")
        except Exception as e:
            logger.error(f"Failed to download from {url}: {e}")
            raise
    
    def unload_model(self, model_name: str):
        """Unload a specific model to free memory"""
        if model_name in self._models:
            del self._models[model_name]
            if self.device == "cuda":
                torch.cuda.empty_cache()
            logger.info(f"Model unloaded: {model_name}")
    
    def unload_all(self):
        """Unload all models to free memory"""
        self._models.clear()
        if self.device == "cuda":
            torch.cuda.empty_cache()
        logger.info("All models unloaded")
    
    def get_device_info(self) -> Dict[str, Any]:
        """Get information about the device being used"""
        info = {
            "device": self.device,
            "device_name": "CPU"
        }
        
        if self.device == "cuda" and torch.cuda.is_available():
            info["device_name"] = torch.cuda.get_device_name(0)
            info["cuda_version"] = torch.version.cuda
            info["total_memory_gb"] = round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 2)
            info["allocated_memory_gb"] = round(torch.cuda.memory_allocated(0) / 1024**3, 2)
        
        return info

# Global model manager instance
model_manager = ModelManager()
