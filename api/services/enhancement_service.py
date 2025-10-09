"""
Image Enhancement Service - AI-powered upscaling and enhancement
"""
import numpy as np
from PIL import Image
import cv2
from typing import Tuple, Optional
import logging

from services.model_manager import model_manager

logger = logging.getLogger(__name__)

# Check for optional packages
try:
    from realesrgan import RealESRGANer
    REALESRGAN_AVAILABLE = True
except ImportError:
    REALESRGAN_AVAILABLE = False
    logger.warning("RealESRGAN not available. Install with: pip install realesrgan basicsr")

try:
    from gfpgan import GFPGANer
    GFPGAN_AVAILABLE = True
except ImportError:
    GFPGAN_AVAILABLE = False
    logger.warning("GFPGAN not available. Install with: pip install gfpgan")

class EnhancementService:
    """Service for AI-powered image enhancement"""
    
    @staticmethod
    def upscale_image(image: Image.Image, scale: int = 4) -> Image.Image:
        """
        Upscale image using RealESRGAN or fallback to bicubic
        
        Args:
            image: Input PIL Image
            scale: Upscale factor (2 or 4)
            
        Returns:
            Upscaled PIL Image
        """
        try:
            logger.info(f"Upscaling image with factor {scale}x")
            
            if REALESRGAN_AVAILABLE:
                # Use RealESRGAN if available
                img_array = np.array(image)
                
                if len(img_array.shape) == 3 and img_array.shape[2] == 3:
                    img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
                
                upsampler = model_manager.get_esrgan_upsampler()
                output, _ = upsampler.enhance(img_array, outscale=scale)
                
                if len(output.shape) == 3 and output.shape[2] == 3:
                    output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
                
                result = Image.fromarray(output)
            else:
                # Fallback to high-quality bicubic interpolation
                logger.warning("Using fallback bicubic upscaling (install realesrgan for AI upscaling)")
                new_size = (image.width * scale, image.height * scale)
                result = image.resize(new_size, Image.Resampling.BICUBIC)
            
            logger.info(f"Upscaling complete: {image.size} -> {result.size}")
            return result
            
        except Exception as e:
            logger.error(f"Error during upscaling: {e}")
            raise
    
    @staticmethod
    def enhance_face(image: Image.Image, 
                     upscale: int = 2,
                     weight: float = 0.5) -> Image.Image:
        """
        Enhance faces in image using GFPGAN or fallback enhancement
        
        Args:
            image: Input PIL Image
            upscale: Upscale factor
            weight: Blend weight (0=original, 1=fully enhanced)
            
        Returns:
            Enhanced PIL Image
        """
        try:
            logger.info(f"Enhancing faces (upscale={upscale}, weight={weight})")
            
            if GFPGAN_AVAILABLE:
                # Use GFPGAN if available
                img_array = np.array(image)
                
                if len(img_array.shape) == 3 and img_array.shape[2] == 3:
                    img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
                
                enhancer = model_manager.get_gfpgan_enhancer()
                _, _, output = enhancer.enhance(
                    img_array,
                    has_aligned=False,
                    only_center_face=False,
                    paste_back=True,
                    weight=weight
                )
                
                if len(output.shape) == 3 and output.shape[2] == 3:
                    output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
                
                result = Image.fromarray(output)
            else:
                # Fallback to basic enhancement
                logger.warning("Using fallback enhancement (install gfpgan for AI face enhancement)")
                result = EnhancementService.auto_enhance(image)
                if upscale > 1:
                    new_size = (image.width * upscale, image.height * upscale)
                    result = result.resize(new_size, Image.Resampling.LANCZOS)
            
            logger.info("Face enhancement complete")
            return result
            
        except Exception as e:
            logger.error(f"Error during face enhancement: {e}")
            raise
    
    @staticmethod
    def denoise_image(image: Image.Image, strength: int = 10) -> Image.Image:
        """
        Denoise image using Non-local Means Denoising
        
        Args:
            image: Input PIL Image
            strength: Denoising strength (3-20, higher = more denoising)
            
        Returns:
            Denoised PIL Image
        """
        try:
            logger.info(f"Denoising image with strength {strength}")
            
            # Convert to numpy
            img_array = np.array(image)
            
            # Apply denoising
            if len(img_array.shape) == 3:
                # Color image
                if img_array.shape[2] == 4:
                    # RGBA - process RGB channels only
                    rgb = img_array[:, :, :3]
                    alpha = img_array[:, :, 3]
                    
                    denoised_rgb = cv2.fastNlMeansDenoisingColored(
                        rgb, None, strength, strength, 7, 21
                    )
                    
                    # Recombine with alpha
                    denoised = np.dstack([denoised_rgb, alpha])
                else:
                    # RGB
                    denoised = cv2.fastNlMeansDenoisingColored(
                        img_array, None, strength, strength, 7, 21
                    )
            else:
                # Grayscale
                denoised = cv2.fastNlMeansDenoising(
                    img_array, None, strength, 7, 21
                )
            
            result = Image.fromarray(denoised)
            logger.info("Denoising complete")
            return result
            
        except Exception as e:
            logger.error(f"Error during denoising: {e}")
            raise
    
    @staticmethod
    def auto_enhance(image: Image.Image) -> Image.Image:
        """
        Auto-enhance image (brightness, contrast, color)
        
        Args:
            image: Input PIL Image
            
        Returns:
            Enhanced PIL Image
        """
        try:
            logger.info("Auto-enhancing image")
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Convert to LAB color space for better enhancement
            if len(img_array.shape) == 3 and img_array.shape[2] == 3:
                lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
                l, a, b = cv2.split(lab)
                
                # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to L channel
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                l_enhanced = clahe.apply(l)
                
                # Merge channels
                enhanced_lab = cv2.merge([l_enhanced, a, b])
                
                # Convert back to RGB
                enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
            else:
                # Grayscale or RGBA
                if len(img_array.shape) == 2:
                    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                    enhanced = clahe.apply(img_array)
                else:
                    # RGBA - process RGB only
                    rgb = img_array[:, :, :3]
                    alpha = img_array[:, :, 3]
                    
                    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
                    l, a, b = cv2.split(lab)
                    
                    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                    l_enhanced = clahe.apply(l)
                    
                    enhanced_lab = cv2.merge([l_enhanced, a, b])
                    enhanced_rgb = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
                    
                    enhanced = np.dstack([enhanced_rgb, alpha])
            
            result = Image.fromarray(enhanced)
            logger.info("Auto-enhancement complete")
            return result
            
        except Exception as e:
            logger.error(f"Error during auto-enhancement: {e}")
            raise
    
    @staticmethod
    def sharpen_image(image: Image.Image, amount: float = 1.0) -> Image.Image:
        """
        Sharpen image using unsharp mask
        
        Args:
            image: Input PIL Image
            amount: Sharpening amount (0.5-3.0)
            
        Returns:
            Sharpened PIL Image
        """
        try:
            logger.info(f"Sharpening image with amount {amount}")
            
            # Convert to numpy
            img_array = np.array(image)
            
            # Create Gaussian blur
            if len(img_array.shape) == 3 and img_array.shape[2] in [3, 4]:
                blurred = cv2.GaussianBlur(img_array, (0, 0), 2.0)
            else:
                blurred = cv2.GaussianBlur(img_array, (0, 0), 2.0)
            
            # Unsharp mask
            sharpened = cv2.addWeighted(img_array, 1.0 + amount, blurred, -amount, 0)
            
            result = Image.fromarray(sharpened)
            logger.info("Sharpening complete")
            return result
            
        except Exception as e:
            logger.error(f"Error during sharpening: {e}")
            raise

# Global service instance
enhancement_service = EnhancementService()
