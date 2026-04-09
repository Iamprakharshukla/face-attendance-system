# AI Attendance System

A modern, web-based facial recognition attendance system built with Flask and advanced face recognition technology.

## Features

✨ **Core Features**
- 🎥 **Live Webcam Stream** - Real-time face detection and recognition
- 📱 **IP Camera Support** - Connect phone cameras and surveillance systems
- 📤 **Media Upload** - Analyze photos and videos in batch
- 👤 **Person Registration** - Register known individuals for automatic recognition
- 📊 **Attendance Reporting** - Generate comprehensive attendance reports
- 📧 **Email Integration** - Send reports to organization email
- 🗄️ **CSV Export** - Export attendance and face detection records
- 💾 **Face Embeddings** - Store and manage face encodings

## System Architecture

```
ai_attendance_system/
├── app/
│   ├── templates/               # HTML templates
│   │   ├── index.html          # Home page
│   │   ├── dashboard.html      # Attendance dashboard
│   │   ├── register.html       # Person registration
│   │   ├── upload.html         # Media upload
│   │   └── camera/
│   │       ├── webcam.html     # Webcam streaming
│   │       └── ipcam.html      # IP camera streaming
│   ├── static/
│   │   └── css/
│   │       └── styles.css      # Modern styling
│   ├── __init__.py            # Flask app factory
│   └── routes.py              # API routes and logic
├── utils/
│   ├── face_recognition_engine.py  # Face recognition logic
│   ├── csv_handler.py             # CSV operations
│   ├── email_handler.py           # Email operations
│   └── file_utils.py              # File utilities
├── data/
│   ├── embeddings/            # Face encodings (pickle files)
│   ├── uploads/               # Temporary uploads
│   └── attendance_records/    # CSV reports
├── config.py                  # Configuration
├── run.py                     # Entry point
├── requirements.txt           # Python dependencies
└── .env.example              # Environment variables template
```

## Installation

### Prerequisites
- Python 3.8+
- pip
- Virtual Environment (recommended)

### Setup

1. **Clone and navigate**
   ```bash
   cd ai_attendance_system
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or
   source venv/bin/activate      # macOS/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your email and settings
   ```

5. **Run application**
   ```bash
   python run.py
   ```

6. **Access web interface**
   - Open browser: `http://localhost:5000`

## Usage Guide

### 1. Home Page
- Overview of system features
- Quick statistics
- Navigation to different modules

### 2. Register People
- Add known individuals to the system
- Upload photos or videos
- System extracts face encodings automatically
- View all registered people

### 3. Live Webcam
- Start real-time webcam streaming
- Automatic face detection and recognition
- View live statistics
- See recent detections

### 4. IP Camera
- Connect to surveillance cameras
- Support for RTSP, HTTP streams
- Phone camera integration via IP Webcam app
- Real-time monitoring

### 5. Upload Media
- Upload photos for analysis
- Upload videos for batch processing
- System detects and recognizes faces
- Results saved to CSV

### 6. Dashboard
- View all attendance records
- Filter by date range
- Statistics on attendance
- Export reports as CSV
- Send reports via email

## API Endpoints

### Main Routes
- `GET /` - Home page
- `GET /dashboard` - Attendance dashboard
- `GET /register` - Registration page

### Camera Routes
- `GET /camera/webcam` - Webcam page
- `GET /camera/ipcam` - IP camera page
- `GET /camera/stream` - Video stream endpoint
- `POST /camera/stop-stream` - Stop streaming

### Upload Routes
- `POST /upload/photo` - Upload and process photo
- `POST /upload/video` - Upload and process video

### Admin Routes
- `GET /admin/known-people` - Get registered people
- `GET /admin/today-attendance` - Get today's records
- `GET /admin/attendance-report` - Report by date range
- `GET /admin/export-attendance` - Export attendance CSV
- `GET /admin/export-unknown-faces` - Export unknown faces CSV

### Email Routes
- `POST /email/send-report` - Send report via email
- `POST /email/send-unknown-alert` - Send unknown faces alert

## Configuration

Edit `config.py` to customize:

```python
# Face Recognition
FACE_DISTANCE_THRESHOLD = 0.6    # Lower = stricter matching
FACE_RECOGNITION_MODEL = 'hog'   # 'hog' or 'cnn'

# Email
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
ORGANIZATION_EMAIL = 'admin@org.com'

# Upload
MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB
```

## CSV Files

### attendance.csv
Records every face detection with details:
- Date, Time, Person Name, Confidence, Status, Source

### unknown_faces.csv
Tracks unrecognized faces:
- Date, Time, Confidence, Image Path, Source

### known_faces.csv
Registered people information:
- Person Name, Registration Date, Total Attendance, Last Seen

## Face Recognition Engine

Uses `face_recognition` library with dlib:
- Extract face encodings from images/videos
- Compare encodings with known faces
- Confidence scoring (0-1 scale)
- Adjustable matching threshold

## Email Integration

Send reports via EmailHandler:
- SMTP configuration
- HTML formatted emails
- CSV attachments
- Unknown faces alerts

## Troubleshooting

### No faces detected
- Ensure good lighting
- Face should be clearly visible
- Try adjusting `FACE_DISTANCE_THRESHOLD`

### High false positives
- Increase distance threshold
- Add more diverse registration images
- Use 'cnn' model for better accuracy (slower)

### Email not sending
- Verify SMTP credentials in .env
- Enable less secure apps (Gmail)
- Check firewall settings

### Performance issues
- Reduce video resolution
- Process every nth frame
- Run on GPU for faster processing

## Privacy & Security

- Face encodings stored locally (no cloud)
- Temporary uploads auto-deleted
- Secure session handling
- Admin-only export access

## Future Enhancements

- 🔐 Multi-user authentication
- 🎯 Face matching accuracy improvements
- ☁️ Cloud storage integration
- 📊 Advanced analytics dashboard
- 🔔 Real-time notifications
- 🌐 Mobile app
- 🔄 Database integration (PostgreSQL/MongoDB)

## License

MIT License - See LICENSE file

## Support

For issues or questions, please create an issue in the repository.

## Technologies

- **Backend**: Flask, Python
- **Frontend**: HTML5, CSS3, JavaScript
- **Face Recognition**: face_recognition, dlib
- **Computer Vision**: OpenCV
- **Email**: SMTP
- **Storage**: CSV, Pickle

---

Built with ❤️ for attendance management at scale.
