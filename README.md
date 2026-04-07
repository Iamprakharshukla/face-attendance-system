# 🎯 Face Recognition Attendance System

An AI-powered attendance system that uses **face recognition** to automatically mark attendance and generate **email reports** using the Gmail API.

---

## 🚀 Features

* 🎥 Real-time face detection & recognition using **dlib**
* 🧠 Face embeddings generation for accurate identification
* 🗂️ Automatic attendance recording (CSV-based)
* 📧 Daily email reports using **Gmail API (OAuth 2.0)**
* 🕒 Scheduled report generation & email delivery
* 📊 Structured logging system for debugging
* 🛡️ Secure authentication (no password-based email)

---

## 🧱 Tech Stack

* **Python 3.10+**
* **OpenCV**
* **dlib**
* **face_recognition**
* **Pandas**
* **Gmail API (Google Cloud)**
* **Schedule (task automation)**

---

## 📂 Project Structure

```
attendance_system/
│
├── dataset/                  # Training images (organized by person)
├── data/                     # Generated encodings & reports
├── logs/                     # Log files
│
├── src/
│   ├── app.py
│   ├── dlib_face_embeddings.py
│   ├── dlib_face_recognition.py
│   ├── send_mail.py
│   ├── schedule_send_mail.py
│   ├── database_pandas.py
│   ├── parameters.py
│   └── custom_logging.py
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/yourusername/face-attendance-system.git
cd face-attendance-system
```

---

### 2️⃣ Install Dependencies

```
pip install -r requirements.txt
```

---

### 3️⃣ Prepare Dataset

Organize images like:

```
dataset/
   Person1/
      img1.jpg
      img2.jpg
   Person2/
      img1.jpg
```

---

### 4️⃣ Generate Face Embeddings

```
python src/dlib_face_embeddings.py
```

---

### 5️⃣ Setup Gmail API

1. Go to: https://console.cloud.google.com/
2. Enable **Gmail API**
3. Create **OAuth Client ID (Desktop App)**
4. Download JSON → rename to:

```
client_secrets.json
```

5. Place inside:

```
src/client_secrets.json
```

6. Add your Gmail in **Test Users**

---

### 6️⃣ Run Email Test

```
python src/send_mail.py
```

* First run will open browser → login & allow access
* `token.json` will be generated automatically

---

### 7️⃣ Run Full System

```
python src/app.py
```

---

## 📧 Email Automation

* Reports are automatically generated and sent daily
* Configurable via `parameters.py`

Example:

```
EMAIL_SEND_TIME = "21:00"
EMAIL_SEND_WAIT_DURATION = 10
```

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
