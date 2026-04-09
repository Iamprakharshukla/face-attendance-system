import os
import cv2
import numpy as np
from flask import Blueprint, render_template, request, jsonify, send_file, Response
from werkzeug.utils import secure_filename
from datetime import datetime
import logging
import threading
from functools import wraps

from config import *
from utils.face_recognition_engine import FaceRecognitionEngine, draw_boxes_on_frame
from utils.csv_handler import CSVHandler
from utils.email_handler import EmailHandler
from utils.file_utils import (
    allowed_file, save_uploaded_file, extract_frames_from_video,
    get_video_properties, cleanup_upload_folder
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprints
main_bp = Blueprint('main', __name__)
camera_bp = Blueprint('camera', __name__, url_prefix='/camera')
upload_bp = Blueprint('upload', __name__, url_prefix='/upload')
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
email_bp = Blueprint('email', __name__, url_prefix='/email')

# Initialize modules
face_engine = FaceRecognitionEngine(EMBEDDINGS_FOLDER, FACE_DISTANCE_THRESHOLD)
csv_handler = CSVHandler(ATTENDANCE_CSV, UNKNOWN_FACES_CSV, KNOWN_FACES_CSV)
email_handler = EmailHandler(MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD)

# Global variables for streaming
camera_running = False
current_frame = None
frame_lock = threading.Lock()


# ==================== MAIN ROUTES ====================

@main_bp.route('/')
def index():
    """Home page"""
    return render_template('index.html')


@main_bp.route('/dashboard')
def dashboard():
    """Dashboard page"""
    today_attendance = csv_handler.get_all_attendance_today()
    known_people = face_engine.get_all_known_people()
    
    return render_template('dashboard.html', 
                         attendance=today_attendance,
                         known_people=known_people)


@main_bp.route('/register')
def register():
    """Registration page"""
    return render_template('register.html')


# ==================== CAMERA ROUTES ====================

@camera_bp.route('/webcam')
def webcam_page():
    """Webcam page"""
    return render_template('camera/webcam.html')


@camera_bp.route('/ipcam')
def ipcam_page():
    """IP Camera page"""
    return render_template('camera/ipcam.html')


@camera_bp.route('/stream')
def stream():
    """Stream video from webcam"""
    return Response(generate_frames(), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')


def generate_frames():
    """Generate frames from webcam"""
    global camera_running, current_frame, frame_lock
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    camera_running = True
    
    try:
        while camera_running:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Resize for faster processing
            frame = cv2.resize(frame, (640, 480))
            
            # Process frame for face recognition
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_encodings, face_locations = face_engine.get_face_encodings_from_frame(frame)
            
            names = []
            confidences = []
            
            for face_encoding in face_encodings:
                name, confidence = face_engine.recognize_faces(face_encoding)
                names.append(name)
                confidences.append(confidence)
                
                # Log attendance
                if name != "Unknown" and confidence > 0.5:
                    csv_handler.log_attendance(name, confidence, 'webcam')
                    csv_handler.update_person_record(name)
                else:
                    csv_handler.log_unknown_face(confidence, 'webcam')
            
            # Draw boxes on frame
            frame = draw_boxes_on_frame(frame, face_locations, names, confidences)
            
            # Update global frame
            with frame_lock:
                current_frame = frame.copy()
            
            # Encode frame
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                   + frame_bytes + b'\r\n')
    finally:
        cap.release()
        camera_running = False


@camera_bp.route('/stop-stream', methods=['POST'])
def stop_stream():
    """Stop camera stream"""
    global camera_running
    camera_running = False
    return jsonify({'status': 'stopped'})


@camera_bp.route('/ip-stream', methods=['POST'])
def ip_stream():
    """Stream from IP Camera"""
    ip_url = request.json.get('ip_url')
    
    if not ip_url:
        return jsonify({'error': 'IP URL required'}), 400
    
    return Response(generate_ip_frames(ip_url),
                   mimetype='multipart/x-mixed-replace; boundary=frame')


def generate_ip_frames(ip_url):
    """Generate frames from IP camera"""
    global camera_running, current_frame, frame_lock
    
    cap = cv2.VideoCapture(ip_url)
    camera_running = True
    
    try:
        while camera_running:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame = cv2.resize(frame, (640, 480))
            
            # Process frame
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_encodings, face_locations = face_engine.get_face_encodings_from_frame(frame)
            
            names = []
            confidences = []
            
            for face_encoding in face_encodings:
                name, confidence = face_engine.recognize_faces(face_encoding)
                names.append(name)
                confidences.append(confidence)
                
                if name != "Unknown" and confidence > 0.5:
                    csv_handler.log_attendance(name, confidence, 'ip_camera')
            
            frame = draw_boxes_on_frame(frame, face_locations, names, confidences)
            
            with frame_lock:
                current_frame = frame.copy()
            
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                   + frame_bytes + b'\r\n')
    finally:
        cap.release()
        camera_running = False


# ==================== UPLOAD ROUTES ====================

@upload_bp.route('/')
def upload_page():
    """Upload page"""
    return render_template('upload.html')


@upload_bp.route('/photo', methods=['POST'])
def upload_photo():
    """Upload and process photo"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    person_name = request.form.get('person_name', 'Unknown')
    
    success, filepath = save_uploaded_file(file, UPLOAD_FOLDER)
    
    if not success:
        return jsonify({'error': filepath}), 400
    
    try:
        # Extract encodings
        face_encodings, face_locations, image = face_engine.get_face_encodings_from_image(filepath)
        
        if not face_encodings:
            return jsonify({'error': 'No faces detected'}), 400
        
        if person_name != 'Unknown':
            # Save encodings for registration
            face_engine.save_encoding(person_name, face_encodings)
            csv_handler.register_known_face(person_name)
            return jsonify({
                'status': 'success',
                'message': f'{person_name} registered successfully',
                'faces_detected': len(face_encodings)
            })
        else:
            # Just log unknown face
            for encoding in face_encodings:
                name, confidence = face_engine.recognize_faces(encoding)
                csv_handler.log_unknown_face(confidence, filepath, 'upload')
            
            return jsonify({
                'status': 'success',
                'message': 'Photo processed',
                'faces_detected': len(face_encodings)
            })
    except Exception as e:
        logger.error(f"Error processing photo: {str(e)}")
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/video', methods=['POST'])
def upload_video():
    """Upload and process video"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    person_name = request.form.get('person_name', 'Unknown')
    
    success, filepath = save_uploaded_file(file, UPLOAD_FOLDER)
    
    if not success:
        return jsonify({'error': filepath}), 400
    
    try:
        # Get video properties
        props = get_video_properties(filepath)
        
        # Extract frames
        frames_folder = os.path.join(UPLOAD_FOLDER, f"frames_{datetime.now().timestamp()}")
        extracted_frames = extract_frames_from_video(filepath, frames_folder)
        
        total_faces = 0
        face_encodings_list = []
        
        # Process frames
        for frame_path in extracted_frames:
            face_encodings, face_locations, _ = face_engine.get_face_encodings_from_image(frame_path)
            total_faces += len(face_encodings)
            face_encodings_list.extend(face_encodings)
        
        if not face_encodings_list:
            return jsonify({'error': 'No faces detected in video'}), 400
        
        if person_name != 'Unknown':
            face_engine.save_encoding(person_name, face_encodings_list)
            csv_handler.register_known_face(person_name)
        
        return jsonify({
            'status': 'success',
            'message': f'{len(extracted_frames)} frames processed',
            'total_faces': total_faces,
            'video_duration': props['duration']
        })
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== ADMIN ROUTES ====================

@admin_bp.route('/known-people')
def get_known_people():
    """Get list of all known people"""
    known_people = face_engine.get_all_known_people()
    return jsonify({'people': known_people})


@admin_bp.route('/today-attendance')
def get_today_attendance():
    """Get today's attendance records"""
    records = csv_handler.get_all_attendance_today()
    return jsonify({'records': records})


@admin_bp.route('/attendance-report')
def get_attendance_report():
    """Get attendance report for date range"""
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    try:
        from datetime import datetime
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        records = csv_handler.get_attendance_report(start_date, end_date)
        return jsonify({'records': records})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@admin_bp.route('/export-attendance')
def export_attendance():
    """Export attendance CSV"""
    try:
        return send_file(ATTENDANCE_CSV, 
                        as_attachment=True,
                        download_name='attendance.csv')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/export-unknown-faces')
def export_unknown_faces():
    """Export unknown faces CSV"""
    try:
        return send_file(UNKNOWN_FACES_CSV,
                        as_attachment=True,
                        download_name='unknown_faces.csv')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== EMAIL ROUTES ====================

@email_bp.route('/send-report', methods=['POST'])
def send_report():
    """Send attendance report via email"""
    recipient_email = request.json.get('email')
    include_csv = request.json.get('include_csv', False)
    
    if not recipient_email:
        return jsonify({'error': 'Email required'}), 400
    
    try:
        today_records = csv_handler.get_all_attendance_today()
        report_data = {
            'total_present': len([r for r in today_records if r['Person_Name'] != 'Unknown']),
            'total_unknown': len([r for r in today_records if r['Person_Name'] == 'Unknown'])
        }
        
        csv_file = ATTENDANCE_CSV if include_csv else None
        
        success = email_handler.send_attendance_report(recipient_email, report_data, csv_file)
        
        if success:
            return jsonify({'status': 'success', 'message': 'Report sent successfully'})
        else:
            return jsonify({'error': 'Failed to send email'}), 500
    except Exception as e:
        logger.error(f"Error sending report: {str(e)}")
        return jsonify({'error': str(e)}), 500


@email_bp.route('/send-unknown-alert', methods=['POST'])
def send_unknown_alert():
    """Send alert about unknown faces"""
    recipient_email = request.json.get('email')
    
    if not recipient_email:
        return jsonify({'error': 'Email required'}), 400
    
    try:
        unknown_records = len(csv_handler.get_all_attendance_today())
        success = email_handler.send_unknown_faces_alert(recipient_email, unknown_records)
        
        if success:
            return jsonify({'status': 'success', 'message': 'Alert sent successfully'})
        else:
            return jsonify({'error': 'Failed to send alert'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
