"""
Object Detection Service - AI-powered object detection and segmentation
"""
import numpy as np
from PIL import Image, ImageDraw
import cv2
from typing import List, Dict, Any, Tuple, Optional
import logging

from services.model_manager import model_manager
from config.ai_config import ai_settings

logger = logging.getLogger(__name__)

class DetectionService:
    """Service for AI-powered object detection"""
    
    @staticmethod
    def detect_objects(image: Image.Image, 
                      confidence: float = 0.25,
                      classes: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Detect objects in image using YOLO
        
        Args:
            image: Input PIL Image
            confidence: Confidence threshold (0.0-1.0)
            classes: List of class names to detect (None = all classes)
            
        Returns:
            List of detection dictionaries with bbox, class, confidence
        """
        try:
            logger.info(f"Detecting objects with confidence threshold {confidence}")
            
            # Get YOLO model
            model = model_manager.get_yolo_model()
            
            # Run detection
            results = model(image, conf=confidence, verbose=False)
            
            # Process results
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    
                    # Get class and confidence
                    cls_id = int(box.cls[0])
                    cls_name = model.names[cls_id]
                    conf = float(box.conf[0])
                    
                    # Filter by class if specified
                    if classes and cls_name not in classes:
                        continue
                    
                    detection = {
                        "bbox": [int(x1), int(y1), int(x2), int(y2)],
                        "class": cls_name,
                        "confidence": round(conf, 3),
                        "class_id": cls_id
                    }
                    detections.append(detection)
            
            logger.info(f"Detected {len(detections)} objects")
            return detections
            
        except Exception as e:
            logger.error(f"Error during object detection: {e}")
            raise
    
    @staticmethod
    def detect_people(image: Image.Image, 
                     confidence: float = 0.25) -> List[Dict[str, Any]]:
        """
        Detect people in image
        
        Args:
            image: Input PIL Image
            confidence: Confidence threshold
            
        Returns:
            List of person detections
        """
        return DetectionService.detect_objects(
            image, 
            confidence=confidence, 
            classes=["person"]
        )
    
    @staticmethod
    def visualize_detections(image: Image.Image, 
                           detections: List[Dict[str, Any]],
                           show_labels: bool = True) -> Image.Image:
        """
        Draw detection boxes on image
        
        Args:
            image: Input PIL Image
            detections: List of detection dictionaries
            show_labels: Whether to show class labels
            
        Returns:
            Image with drawn boxes
        """
        try:
            # Create a copy to draw on
            img_copy = image.copy()
            draw = ImageDraw.Draw(img_copy)
            
            # Define colors for different classes
            colors = [
                "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
                "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
            ]
            
            for i, det in enumerate(detections):
                x1, y1, x2, y2 = det["bbox"]
                cls_name = det["class"]
                conf = det["confidence"]
                
                # Pick color based on class
                color = colors[det["class_id"] % len(colors)]
                
                # Draw bounding box
                draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
                
                # Draw label
                if show_labels:
                    label = f"{cls_name} {conf:.2f}"
                    
                    # Draw label background
                    bbox = draw.textbbox((x1, y1 - 20), label)
                    draw.rectangle(bbox, fill=color)
                    draw.text((x1, y1 - 20), label, fill="white")
            
            return img_copy
            
        except Exception as e:
            logger.error(f"Error visualizing detections: {e}")
            raise
    
    @staticmethod
    def segment_by_detection(image: Image.Image,
                           detection: Dict[str, Any],
                           expand_ratio: float = 0.1) -> Image.Image:
        """
        Segment object based on detection bbox
        
        Args:
            image: Input PIL Image
            detection: Detection dictionary with bbox
            expand_ratio: How much to expand bbox for better segmentation
            
        Returns:
            Masked image (RGBA)
        """
        try:
            logger.info(f"Segmenting detected {detection['class']}")
            
            # Get SAM predictor
            predictor = model_manager.get_sam_predictor()
            
            # Convert PIL to numpy
            img_array = np.array(image.convert("RGB"))
            
            # Set image for SAM
            predictor.set_image(img_array)
            
            # Get bbox and expand it
            x1, y1, x2, y2 = detection["bbox"]
            w = x2 - x1
            h = y2 - y1
            
            expand_w = int(w * expand_ratio)
            expand_h = int(h * expand_ratio)
            
            x1 = max(0, x1 - expand_w)
            y1 = max(0, y1 - expand_h)
            x2 = min(image.width, x2 + expand_w)
            y2 = min(image.height, y2 + expand_h)
            
            # Convert to SAM format [x, y, x, y]
            input_box = np.array([x1, y1, x2, y2])
            
            # Generate mask
            masks, scores, _ = predictor.predict(
                point_coords=None,
                point_labels=None,
                box=input_box[None, :],
                multimask_output=False,
            )
            
            # Get the best mask
            mask = masks[0]
            
            # Convert to PIL and apply mask
            if image.mode != "RGBA":
                image = image.convert("RGBA")
            
            # Create alpha channel from mask
            alpha = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
            
            # Apply mask to image
            result = image.copy()
            result.putalpha(alpha)
            
            logger.info("Segmentation complete")
            return result
            
        except Exception as e:
            logger.error(f"Error during segmentation: {e}")
            raise
    
    @staticmethod
    def segment_by_points(image: Image.Image,
                        points: List[Tuple[int, int]],
                        labels: List[int]) -> Image.Image:
        """
        Segment object based on point prompts
        
        Args:
            image: Input PIL Image
            points: List of (x, y) coordinates
            labels: List of labels (1=foreground, 0=background)
            
        Returns:
            Masked image (RGBA)
        """
        try:
            logger.info(f"Segmenting with {len(points)} point prompts")
            
            # Get SAM predictor
            predictor = model_manager.get_sam_predictor()
            
            # Convert PIL to numpy
            img_array = np.array(image.convert("RGB"))
            
            # Set image for SAM
            predictor.set_image(img_array)
            
            # Convert points to numpy array
            point_coords = np.array(points)
            point_labels = np.array(labels)
            
            # Generate mask
            masks, scores, _ = predictor.predict(
                point_coords=point_coords,
                point_labels=point_labels,
                multimask_output=False,
            )
            
            # Get the best mask
            mask = masks[0]
            
            # Convert to PIL and apply mask
            if image.mode != "RGBA":
                image = image.convert("RGBA")
            
            # Create alpha channel from mask
            alpha = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
            
            # Apply mask to image
            result = image.copy()
            result.putalpha(alpha)
            
            logger.info("Point-based segmentation complete")
            return result
            
        except Exception as e:
            logger.error(f"Error during point-based segmentation: {e}")
            raise
    
    @staticmethod
    def remove_objects_by_class(image: Image.Image,
                              classes_to_remove: List[str],
                              confidence: float = 0.25) -> Image.Image:
        """
        Detect and remove specific objects from image
        
        Args:
            image: Input PIL Image
            classes_to_remove: List of class names to remove
            confidence: Detection confidence threshold
            
        Returns:
            Image with objects removed (inpainted)
        """
        try:
            logger.info(f"Removing objects: {classes_to_remove}")
            
            # Detect objects
            detections = DetectionService.detect_objects(
                image,
                confidence=confidence,
                classes=classes_to_remove
            )
            
            if not detections:
                logger.info("No objects found to remove")
                return image
            
            # Convert to numpy
            img_array = np.array(image.convert("RGB"))
            
            # Create mask for inpainting
            mask = np.zeros((image.height, image.width), dtype=np.uint8)
            
            # Fill mask with detected object regions
            for det in detections:
                x1, y1, x2, y2 = det["bbox"]
                mask[y1:y2, x1:x2] = 255
            
            # Dilate mask slightly to ensure complete coverage
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.dilate(mask, kernel, iterations=2)
            
            # Inpaint using OpenCV
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            inpainted_bgr = cv2.inpaint(img_bgr, mask, 3, cv2.INPAINT_TELEA)
            inpainted_rgb = cv2.cvtColor(inpainted_bgr, cv2.COLOR_BGR2RGB)
            
            result = Image.fromarray(inpainted_rgb)
            logger.info(f"Removed {len(detections)} objects")
            return result
            
        except Exception as e:
            logger.error(f"Error removing objects: {e}")
            raise

# Global service instance
detection_service = DetectionService()
