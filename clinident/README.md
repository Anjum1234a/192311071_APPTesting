# 🦷 Clinident – Smart Dental Clinic Management System

A full-stack AI-powered dental clinic management web application built with React, Node.js, and Firebase.

## 🚀 Quick Start

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| Patient | patient@clinident.com | patient123 |
| Doctor | doctor@clinident.com | doctor123 |

---

## 📁 Project Structure
```
clinident/
├── frontend/          # React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/     # All page components
│       ├── components/# Reusable UI components
│       ├── contexts/  # React context (Auth)
│       └── utils/     # API client, helpers
└── backend/           # Node.js + Express REST API
    ├── routes/        # API route handlers
    ├── middleware/     # Auth, upload middleware
    └── config/        # Firebase admin config
```

---

## ⚙️ Setup & Running

### 1. Start Backend
```bash
cd clinident/backend
# Copy env file and configure
cp .env.example .env
npm install
npm run dev
# Runs on http://localhost:5000
```

### 2. Start Frontend
```bash
cd clinident/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🧠 Features

### Patient Portal
- 📅 Book & manage appointments
- 🖼️ Upload dental X-rays (before/after treatment)
- 📦 Upload STL 3D dental scans
- 🤖 View AI-powered X-ray comparison analysis
- 📊 Track treatment progress
- 📄 Download PDF treatment reports

### Doctor Portal
- 👥 Manage registered patients
- 📅 View & update appointment schedules
- 🖼️ Access and compare patient X-rays
- 🤖 Run AI analysis on patient X-rays
- 📝 Add treatment notes
- 📊 Generate & download treatment reports

### AI Module
- Before/After X-ray visual comparison
- Confidence score (0-100%)
- Area-specific findings with severity levels
- Treatment effectiveness percentage
- Auto-generated recommendations

### 3D STL Viewer
- Three.js powered 3D model viewer
- Orbit controls (rotate, zoom, pan)
- Before/After STL comparison

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Authentication | JWT + bcrypt |
| Database | In-memory (Firebase Firestore ready) |
| Storage | Local uploads (Firebase Storage ready) |
| 3D Viewer | Three.js + @react-three/fiber |
| Charts | Recharts |
| PDF Generation | jsPDF |

---

## 🔧 Firebase Setup (Production)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Generate Admin SDK service account key
6. Fill in `.env` with your Firebase credentials

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/forgot-password | Password reset |
| GET | /api/patients | List patients (Doctor) |
| GET | /api/appointments | List appointments |
| POST | /api/appointments | Book appointment |
| POST | /api/files/upload | Upload X-ray/STL |
| GET | /api/files/:patientId | Get patient files |
| POST | /api/ai/compare | Run AI analysis |
| GET | /api/ai/reports | Get AI reports |
| POST | /api/reports/generate | Generate report |

---

*Built with ❤️ for modern dental healthcare*
