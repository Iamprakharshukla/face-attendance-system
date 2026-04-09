import os
import cv2
import numpy as np
from werkzeug.utils import secure_filename
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'mkv'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_file(file, upload_folder):
    """Save uploaded file securely"""
    try:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)
            return True, filepath
        return False, "Invalid file type"
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        return False, str(e)


def extract_frames_from_video(video_path, output_folder, sample_rate=5):
    """
    Extract frames from video file
    
    Args:
        video_path: Path to video file
        output_folder: Folder to save extracted frames
        sample_rate: Extract every nth frame (default: every 5th frame)
    
    Returns:
        List of extracted frame paths
    """
    try:
        cap = cv2.VideoCapture(video_path)
        frame_count = 0
        saved_frames = []
        os.makedirs(output_folder, exist_ok=True)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % sample_rate == 0:
                frame_path = os.path.join(output_folder, f"frame_{frame_count}.jpg")
                cv2.imwrite(frame_path, frame)
                saved_frames.append(frame_path)
            
            frame_count += 1
        
        cap.release()
        logger.info(f"Extracted {len(saved_frames)} frames from video")
        return saved_frames
    except Exception as e:
        logger.error(f"Error extracting frames: {str(e)}")
        return []


def resize_image(image_path, max_width=1280, max_height=720):
    """Resize image to max dimensions while maintaining aspect ratio"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            return None
        
        height, width = image.shape[:2]
        
        # Calculate scaling factor
        scale = min(max_width / width, max_height / height)
        
        if scale < 1:
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height))
        
        return image
    except Exception as e:
        logger.error(f"Error resizing image: {str(e)}")
        return None


def get_video_properties(video_path):
    """Get video properties like FPS, frame count, resolution"""
    try:
        cap = cv2.VideoCapture(video_path)
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        cap.release()
        
        return {
            'fps': fps,
            'frame_count': frame_count,
            'width': width,
            'height': height,
            'duration': frame_count / fps if fps > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error getting video properties: {str(e)}")
        return None


def cleanup_upload_folder(upload_folder, max_age_hours=24):
    """
    Clean up old uploaded files
    
    Args:
        upload_folder: Folder to clean
        max_age_hours: Remove files older than this many hours
    """
    try:
        import time
        current_time = time.time()
        
        for filename in os.listdir(upload_folder):
            filepath = os.path.join(upload_folder, filename)
            if os.path.isfile(filepath):
                file_age_hours = (current_time - os.path.getmtime(filepath)) / 3600
                if file_age_hours > max_age_hours:
                    os.remove(filepath)
                    logger.info(f"Deleted old file: {filename}")
    except Exception as e:
        logger.error(f"Error cleaning up folder: {str(e)}")
