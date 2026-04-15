# 🎯 AI Face Recognition Attendance System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-2.0+-red.svg)](https://flask.palletsprojects.com/)

A cutting-edge, AI-powered attendance tracking system that leverages advanced face recognition technology to automate attendance marking and reporting. Built with modern web technologies, this system provides real-time face detection, multi-modal input support, and comprehensive analytics through an intuitive web interface.

## ✨ Features

### 🔍 Face Recognition
- **Real-time Detection**: Live webcam and IP camera integration for instant attendance marking
- **High Accuracy**: Advanced face encoding using dlib and face-recognition library
- **Multi-modal Support**: Webcam streams, IP cameras, photo uploads, and video processing
- **Confidence Scoring**: Adjustable distance thresholds for recognition accuracy

### � User Authentication
- **Secure Login/Logout**: User session management with Flask-Login
- **User Registration**: Create accounts with email verification
- **Profile Management**: View personal attendance statistics
- **Role-based Access**: Admin and user role differentiation

### 📊 Analytics & Reporting
- **Automated Attendance**: CSV-based logging with timestamp tracking
- **Interactive Dashboard**: Real-time attendance visualization and analytics
- **User Profiles**: Personal attendance history and statistics
- **Email Reports**: Automated daily/weekly reports via SMTP integration

### 🖥️ User Interface
- **Modern Web Design**: Responsive HTML5/CSS3 interface with intuitive navigation
- **Real-time Streaming**: Live video feed with face detection overlays
- **User Registration**: Easy enrollment process with face capture
- **Admin Panel**: Comprehensive management and configuration options

### 🔧 Technical Features
- **Modular Architecture**: Clean separation of concerns with Flask blueprints
- **Environment Configuration**: Secure credential management with python-dotenv
- **Logging System**: Structured logging for debugging and monitoring
- **Task Scheduling**: Automated report generation and email delivery

## 🛠️ Technology Stack

### Backend
- **Python 3.8+** - Core programming language
- **Flask 2.0+** - Lightweight web framework
- **face-recognition** - Face detection and recognition library
- **OpenCV** - Computer vision and image processing
- **dlib** - Machine learning algorithms for face encoding
- **NumPy** - Numerical computing for face vectors
- **Pandas** - Data manipulation and CSV handling

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with responsive design
- **JavaScript** - Interactive user interface elements
- **Font Awesome** - Icon library with emoji fallbacks

### Utilities & Libraries
- **python-dotenv** - Environment variable management
- **Pillow** - Image processing and manipulation
- **schedule** - Task automation and scheduling
- **Werkzeug** - WSGI utility for Flask

## 📋 Prerequisites

Before running this application, ensure you have:

- **Python 3.8 or higher** installed on your system
- **Webcam or IP camera** access for face recognition
- **Gmail account** (optional, for email reports)
- **Git** for cloning the repository

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Iamprakharshukla/face-attendance-system.git
cd face-attendance-system
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
```bash
# Copy the example environment file
cp ai_attendance_system/.env.example ai_attendance_system/.env

# Edit the .env file with your configuration
```

**Required Environment Variables:**
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secure_random_key_here

# Email Configuration (for automated reports)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
ORGANIZATION_EMAIL=admin@yourorganization.com

# Face Recognition Settings
FACE_DISTANCE_THRESHOLD=0.6
FACE_RECOGNITION_MODEL=hog
```

### 5. Gmail Setup (for Email Reports)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (custom name)"
   - Generate and copy the 16-character password
3. Use this App Password in the `MAIL_PASSWORD` field (not your regular password)

## 📖 Usage Guide

### Starting the Application
```bash
cd ai_attendance_system
python run.py
```

The application will start on `http://localhost:5000`

### User Authentication
1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials - redirects directly to dashboard
3. **Dashboard**: Access all attendance features and view your profile

### Core Workflows

#### 1. User Registration
- Navigate to the registration page
- Provide username, email, and password
- Account is created and you can log in

#### 2. Real-time Attendance
- **Webcam Mode**: Direct camera access for live recognition
- **IP Camera Mode**: Connect network cameras for automated monitoring
- **Upload Mode**: Process photos/videos in batch

#### 3. Dashboard & Reports
- View attendance analytics and statistics
- Access your personal profile with attendance history
- Export CSV reports
- Configure automated email delivery

#### 4. Email Integration
- Set up SMTP credentials in `.env`
- Configure report schedules
- Receive automated attendance summaries

## 📁 Project Structure

```
face-attendance-system/
│
├── ai_attendance_system/          # Main application directory
│   ├── app/                       # Flask application package
│   │   ├── __init__.py           # Application factory with Flask-Login
│   │   ├── routes.py             # URL routing with auth routes
│   │   ├── templates/            # HTML templates
│   │   │   ├── dashboard.html    # Main dashboard with user profile
│   │   │   ├── auth/             # Authentication templates
│   │   │   │   ├── login.html
│   │   │   │   └── register.html
│   │   │   └── ...
│   │   └── static/               # Static assets
│   │       ├── css/
│   │       │   └── styles.css    # Updated with auth styles
│   │       └── images/
│   │
│   ├── utils/                    # Utility modules
│   │   ├── face_recognition_engine.py
│   │   ├── csv_handler.py
│   │   ├── email_handler.py
│   │   ├── file_utils.py
│   │   ├── user_manager.py       # NEW: User authentication
│   │   └── generic_utilities.py
│   │
│   ├── data/                     # Generated data and user files
│   │   └── users.json            # User accounts storage
│   ├── logs/                     # Application logs
│   ├── run.py                    # Application entry point
│   └── .env                      # Environment configuration
│
├── dataset/                      # Training images directory
│   ├── person_name_1/
│   │   ├── photo1.jpg
│   │   └── photo2.jpg
│   └── person_name_2/
│       └── ...
│
├── requirements.txt              # Python dependencies
├── README.md                     # Project documentation
├── LICENSE                       # MIT License
└── .gitignore                    # Git ignore rules
```

## 🔧 Configuration Options

### Face Recognition Tuning
- **FACE_DISTANCE_THRESHOLD**: Controls recognition sensitivity (0.0-1.0)
  - Lower values = More strict matching
  - Higher values = More lenient matching
- **FACE_RECOGNITION_MODEL**: Choose between 'hog' (fast) or 'cnn' (accurate)

### Email Settings
- **MAIL_SERVER**: SMTP server address
- **MAIL_PORT**: SMTP port (587 for TLS)
- **MAIL_USE_TLS**: Enable TLS encryption
- **MAIL_USERNAME**: Sender email address
- **MAIL_PASSWORD**: App password (not regular password)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 style guidelines
- Add docstrings to new functions
- Update tests for new features
- Ensure all dependencies are properly listed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

**Prakhar Shukla**
- 📧 Email: prakharshukla297@gmail.com
- 💼 LinkedIn: [Your LinkedIn Profile]
- 🐙 GitHub: [@Iamprakharshukla](https://github.com/Iamprakharshukla)

### Support
- 🐛 **Bug Reports**: [Open an Issue](https://github.com/Iamprakharshukla/face-attendance-system/issues)
- 💡 **Feature Requests**: [Open an Issue](https://github.com/Iamprakharshukla/face-attendance-system/issues)
- 📖 **Documentation**: Check this README and inline code comments

## 🙏 Acknowledgments

- **face-recognition** library by [Adam Geitgey](https://github.com/ageitgey/face_recognition)
- **Flask** web framework by the Pallets team
- **OpenCV** for computer vision capabilities
- **Font Awesome** for beautiful icons
- **dlib** library for machine learning algorithms

---

⭐ **Star this repository** if you find it helpful! Your support motivates us to improve and maintain this project.

---

## 🔐 Security Notes

⚠️ Do NOT upload these files to GitHub:

```
src/client_secrets.json
src/token.json
```

Add them in `.gitignore`

---

## 🧠 How It Works

1. Face images → converted into embeddings
2. Camera captures real-time faces
3. Match with stored encodings
4. Mark attendance in DataFrame
5. Save CSV report
6. Send email using Gmail API

---

## 🐞 Common Issues & Fixes

| Issue               | Solution                       |
| ------------------- | ------------------------------ |
| No faces detected   | Check lighting / image quality |
| `[]` encodings      | Dataset path incorrect         |
| Gmail access denied | Add email in Test Users        |
| File not found      | Check paths in `parameters.py` |

---

## 📈 Future Improvements

* Web dashboard (Flask/React)
* Cloud deployment
* Database integration (MongoDB/PostgreSQL)
* Multi-user login system
* Live notifications

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Prakhar Shukla**
GitHub: https://github.com/Iamprakharshukla

---

⭐ If you found this project useful, please give it a star!
