# 🎯 AI Face Recognition Attendance System

Welcome to my **AI Face Recognition Attendance System**! I have completely overhauled this platform, upgrading it from a legacy multipage interface to a modern, high-performance Single Page Application (SPA) utilizing a React + Vite frontend backed by an optimized Flask API.

This system delivers real-time facial recognition, secure administrator sessions, interactive analytics, and robust SMTP email reports.

---

## 🚀 What I Have Built & Improved

Here is a summary of the upgrades I implemented in this project:

### 1. Unified React + Vite + TypeScript SPA
- **Modern Architecture**: Moved the entire frontend into a Single Page Application (SPA) located in `ai_attendance_system/client/`, built with **React 19, TypeScript, and Vite**.
- **Aesthetic Visual Design**: Developed a premium dark/light space-nebula interface featuring modern glassmorphism panels (`backdrop-filter`), hover glow states, and interactive claymorphic 3D icons.
- **Tactile 3D Buttons & Inputs**: Integrated skeuomorphic button states that deboss smoothly when clicked (`active:translate-y-[3px]`) and premium 3D inputs with custom focused outlines.
- **Fluid Layout Transitions**: Used **Framer Motion** to drive beautiful page transitions, navigation switches, and notification alerts.
- **Legible Recharts Analytics**: Added an interactive check-in distribution chart using **Recharts**, customized to adjust tooltips and label colors dynamically between dark and light themes for perfect readability.

### 2. Single Daily Present Deduplication Logic
- **Startup Attendance Cache**: Implemented a caching mechanism in `csv_handler.py` that scans `attendance.csv` on server startup and loads today's logged members in memory.
- **Frame-by-Frame Optimization**: Prevented redundant database/disk read-writes by using this in-memory cache to verify check-ins, keeping camera stream performance high (30+ FPS).
- **Daily Attendance Cap**: Ensured each registered user is logged as "Present" **exactly once per calendar day** in both `attendance.csv` and the known faces register (`known_faces.csv`).

### 3. Repaired SMTP Email Reporting
- **SSL and TLS Auto-Negotiation**: Patched the email handler to support both secure **SMTP over SSL (Port 465)** and **SMTP over TLS (Port 587)** configurations.
- **Config Shadow Fix**: Corrected environment variables inside `run.py` to prevent local configurations from shadowing the primary `.env` settings, ensuring credentials load consistently.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **Backend**: Python 3.8+, Flask, OpenCV (computer vision stream capture), dlib & face-recognition (face encoding comparison), python-dotenv (environment configurations)
- **Database/Storage**: CSV-based log files (`attendance.csv`, `known_faces.csv`, `unknown_faces.csv`)

---

## 📁 Cleaned Project Structure

I have removed all unnecessary legacy HTML templates and duplicate guide files, leaving a clean workspace layout:

```
face-attendance-system/
│
├── .gitignore                    # Comprehensive root ignore rules
├── LICENSE                       # MIT License
├── README.md                     # This document (Project documentation)
│
└── ai_attendance_system/          # Core server package
    ├── run.py                    # Server entry point (Port 5001)
    ├── config.py                 # Backend configurations
    ├── .env.example              # Template configuration credentials
    │
    ├── app/                       # Flask application blueprints
    │   ├── __init__.py           # App factory & Auth configuration
    │   ├── routes.py             # REST API endpoints & catch-all routes
    │   ├── templates/            # Auth templates
    │   │   ├── auth/
    │   │   │   ├── login.html    # Redesigned Space-nebula Login page
    │   │   │   └── register.html # Redesigned Space-nebula Registration page
    │   │   └── dashboard.html    # Compiled React entrypoint
    │   └── static/               # Bundled static distribution files
    │
    ├── utils/                    # Utility scripts
    │   ├── csv_handler.py        # Log management, caching, and deduplication
    │   ├── email_handler.py      # Repaired SMTP over SSL/TLS agent
    │   ├── face_recognition_engine.py
    │   ├── file_utils.py
    │   └── user_manager.py
    │
    ├── data/                     # Local data storage (ignored by git)
    │   ├── uploads/              # Temporary upload files
    │   ├── embeddings/           # Registered face vector encodings
    │   └── attendance_records/   # CSV databases
    │
    └── client/                   # React SPA Frontend Package
        ├── package.json          # Node scripts & dependencies
        ├── tailwind.config.js    # Tailwind layout settings
        ├── vite.config.ts        # Vite output configurations
        ├── index.html            # SPA mount page
        └── src/
            ├── main.tsx          # Client app entrypoint
            ├── App.tsx           # React UI pages, routes, and modal overlays
            └── index.css         # Styling system & 3D button animations
```

---

## 🔧 Installation & Setup

### Prerequisites
- **Python 3.8+**
- **Node.js 18+ & npm**
- **CMake** (required to build the `dlib` dependency on Python)
- A **Webcam** (for live webcam recognition)

### 1. Set Up the Python Backend
1. Clone the repository and navigate to the project root:
   ```bash
   git clone https://github.com/Iamprakharshukla/face-attendance-system.git
   cd face-attendance-system
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r ai_attendance_system/requirements.txt
   ```

### 2. Configure Environment Variables
1. Copy the example configurations to a local `.env` file at the root:
   ```bash
   cp ai_attendance_system/.env.example .env
   ```
2. Edit the `.env` file at the root directory with your secret key and SMTP settings. Make sure to use a secure **Gmail App Password** if you use Gmail SMTP.

### 3. Build the Frontend
1. Navigate to the client directory and install dependencies:
   ```bash
   cd ai_attendance_system/client
   npm install
   ```
2. Compile and package the React assets. The build command will bundle all assets and copy the main output file into Flask's template folder automatically:
   ```bash
   npm run build
   ```

---

## 🚀 Running the Application

1. Activate your virtual environment and start the Flask server from the main application folder:
   ```bash
   cd ai_attendance_system
   python run.py
   ```
2. Open your browser and navigate to `http://localhost:5001`.
3. If you do not have an admin account, go to the **Sign Up** portal (`http://localhost:5001/auth/register`), create an administrator profile, and sign in to view the interactive dashboard.
