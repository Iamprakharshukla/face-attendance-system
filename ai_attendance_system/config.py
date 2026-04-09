import os
from datetime import timedelta

# Base directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Flask Configuration
DEBUG = True
TESTING = False
SECRET_KEY = 'your-secret-key-change-this-in-production'

# Upload Settings
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'data/uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'mkv'}
MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max file size

# Face Recognition Settings
FACE_RECOGNITION_MODEL = 'hog'  # 'hog' or 'cnn'
FACE_DISTANCE_THRESHOLD = 0.6
EMBEDDINGS_FOLDER = os.path.join(BASE_DIR, 'data/embeddings')
UPLOADS_FOLDER = os.path.join(BASE_DIR, 'data/uploads')

# CSV Settings
ATTENDANCE_CSV = os.path.join(BASE_DIR, 'data/attendance_records/attendance.csv')
UNKNOWN_FACES_CSV = os.path.join(BASE_DIR, 'data/attendance_records/unknown_faces.csv')
KNOWN_FACES_CSV = os.path.join(BASE_DIR, 'data/attendance_records/known_faces.csv')

# Email Configuration
MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', True)
MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'your-email@gmail.com')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'your-password')
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@attendance.com')

# Organization Email (where reports will be sent)
ORGANIZATION_EMAIL = os.getenv('ORGANIZATION_EMAIL', 'admin@organization.com')

# Session Configuration
PERMANENT_SESSION_LIFETIME = timedelta(days=7)
SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# Logging Configuration
LOG_FILE = os.path.join(BASE_DIR, 'attendance_system.log')
LOG_LEVEL = 'INFO'

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EMBEDDINGS_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(ATTENDANCE_CSV), exist_ok=True)
