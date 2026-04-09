import cv2
import numpy as np
import face_recognition
import pickle
import os
from pathlib import Path
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FaceRecognitionEngine:
    """
    Face Recognition Engine for encoding, comparing, and recognizing faces
    """
    
    def __init__(self, embeddings_folder, distance_threshold=0.6):
        self.embeddings_folder = embeddings_folder
        self.distance_threshold = distance_threshold
        self.known_encodings = {}
        self.load_known_encodings()
    
    def load_known_encodings(self):
        """Load all known face encodings from pickle files"""
        try:
            if not os.path.exists(self.embeddings_folder):
                os.makedirs(self.embeddings_folder, exist_ok=True)
                return
            
            for encoding_file in os.listdir(self.embeddings_folder):
                if encoding_file.endswith('.pkl'):
                    person_name = encoding_file.replace('.pkl', '')
                    file_path = os.path.join(self.embeddings_folder, encoding_file)
                    with open(file_path, 'rb') as f:
                        self.known_encodings[person_name] = pickle.load(f)
                    logger.info(f"Loaded encodings for {person_name}")
        except Exception as e:
            logger.error(f"Error loading encodings: {str(e)}")
    
    def get_face_encodings_from_image(self, image_path):
        """
        Extract face encodings from an image
        Returns: list of encodings and face locations
        """
        try:
            image = face_recognition.load_image_file(image_path)
            face_locations = face_recognition.face_locations(image, model='hog')
            face_encodings = face_recognition.face_encodings(image, face_locations)
            return face_encodings, face_locations, image
        except Exception as e:
            logger.error(f"Error extracting encodings: {str(e)}")
            return [], [], None
    
    def get_face_encodings_from_video(self, video_path):
        """
        Extract face encodings from video frames
        Returns: list of encodings with frame numbers
        """
        encodings_list = []
        try:
            cap = cv2.VideoCapture(video_path)
            frame_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process every 5th frame to speed up
                if frame_count % 5 == 0:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    face_locations = face_recognition.face_locations(rgb_frame, model='hog')
                    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    
                    for encoding in face_encodings:
                        encodings_list.append({
                            'encoding': encoding,
                            'frame': frame_count
                        })
                
                frame_count += 1
            
            cap.release()
            return encodings_list
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            return []
    
    def get_face_encodings_from_frame(self, frame):
        """
        Extract face encodings from a video frame
        """
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame, model='hog')
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            return face_encodings, face_locations
        except Exception as e:
            logger.error(f"Error extracting frame encodings: {str(e)}")
            return [], []
    
    def recognize_faces(self, face_encoding):
        """
        Recognize a face by comparing with known encodings
        Returns: (name, confidence)
        """
        matches = {}
        
        for person_name, known_encodings in self.known_encodings.items():
            for known_encoding in known_encodings:
                distance = face_recognition.face_distance([known_encoding], face_encoding)[0]
                matches[person_name] = min(matches.get(person_name, float('inf')), distance)
        
        if not matches:
            return "Unknown", 0.0
        
        best_match = min(matches, key=matches.get)
        confidence = 1 - matches[best_match]
        
        if matches[best_match] > self.distance_threshold:
            return "Unknown", 0.0
        
        return best_match, confidence
    
    def save_encoding(self, person_name, encodings):
        """Save face encodings for a person"""
        try:
            file_path = os.path.join(self.embeddings_folder, f"{person_name}.pkl")
            with open(file_path, 'wb') as f:
                pickle.dump(encodings, f)
            self.known_encodings[person_name] = encodings
            logger.info(f"Saved encodings for {person_name}")
            return True
        except Exception as e:
            logger.error(f"Error saving encodings: {str(e)}")
            return False
    
    def get_all_known_people(self):
        """Get list of all known people"""
        return list(self.known_encodings.keys())
    
    def reload_encodings(self):
        """Reload all encodings from disk"""
        self.known_encodings = {}
        self.load_known_encodings()


# Utility function for frame processing
def draw_boxes_on_frame(frame, face_locations, names, confidences):
    """
    Draw boxes around detected faces
    """
    for (top, right, bottom, left), name, confidence in zip(face_locations, names, confidences):
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        label = f"{name} ({confidence:.2f})" if name != "Unknown" else name
        cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    return frame
