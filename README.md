# 🏥 AuraCare - Hospital Management System (HMS)

> An enterprise-grade, full-stack Hospital Management System developed for technical coding round evaluation. Features three dedicated role-based portals (**Patient**, **Doctor**, and **Hospital Administrator**) with JWT authentication, relational PostgreSQL persistence, and healthcare-grade UI/UX with smooth shimmer wave skeletons and micro-interactions.

---

## 🚀 Live Demo Test Credentials

You can use the built-in 1-click quick demo switcher on the `/login` screen or manually sign in with these pre-seeded accounts:

| Role | Email | Password | Assigned Department / Specialization |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@hospital.com` | `Admin@123` | Master Administrative Access & Audit Ledger |
| **🩺 Doctor** | `doctor.sarah@hospital.com` | `Doctor@123` | Cardiology (Interventional Cardiology) |
| **🩺 Doctor** | `doctor.james@hospital.com` | `Doctor@123` | Neurology (Cognitive Neurology) |
| **🩺 Doctor** | `doctor.elena@hospital.com` | `Doctor@123` | Pediatrics (Pediatric & Neonatal Care) |
| **🩺 Doctor** | `doctor.marcus@hospital.com` | `Doctor@123` | Orthopedics (Joint & Sports Surgery) |
| **👤 Patient** | `john.doe@example.com` | `Patient@123` | Blood Group O+, Mild Asthma (Pre-seeded with upcoming & past bookings) |
| **👤 Patient** | `emily.smith@example.com` | `Patient@123` | Blood Group A+ (Pre-seeded with upcoming & cancelled bookings) |

*Note: New patients can also register fresh accounts with their complete medical profile directly via **Patient Registration** (`/register`).*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS (Custom Medical Palette), Lucide Icons, Axios.
- **Backend**: Node.js 22, Express.js (ES Modules), JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Request Logger (`morgan`).
- **Database**: PostgreSQL (Cloud Neon / Local pgAdmin compatible), `pg` connection pool with SSL.
- **Authentication**: Stateless Bearer JWT with Role-Based Route Guards (`admin`, `doctor`, `patient`).

---

## 📁 Project Architecture

```
hospital-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── bootstrap.js       # Verbatim dual-stack DNS resolution
│   │   │   └── db.js              # PostgreSQL Pool with custom DNS lookup & SSL
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, Login, /me profile
│   │   │   ├── appointmentController.js # Slot booking, patient history, doctor queue, prescriptions
│   │   │   ├── doctorController.js      # Doctor directory, 30-min slot calculator, CRUD
│   │   │   ├── departmentController.js  # Medical departments
│   │   │   └── adminController.js       # Hospital KPIs, revenue calc, patient directory
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # authenticateToken & authorizeRoles
│   │   │   └── errorMiddleware.js       # 404 & centralized error handler
│   │   ├── routes/                      # Modular Express routers
│   │   ├── db/
│   │   │   ├── schema.sql               # PostgreSQL DDL table definitions
│   │   │   └── initDb.js                # Auto-migration & seed data generator
│   │   └── server.js                    # Server entry point
│   ├── .env                             # Environment configuration (ignored in git)
│   ├── .env.example                     # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js                 # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # User authentication state (login, register, logout)
│   │   │   └── ToastContext.jsx         # Micro-interaction Toast notification provider
│   │   ├── components/
│   │   │   ├── common/Shimmer.jsx       # Custom shimmer wave loading skeletons
│   │   │   ├── common/StatusBadge.jsx   # Semantic medical status pills with live ping
│   │   │   ├── common/Modal.jsx         # Accessible backdrop modal dialogs
│   │   │   ├── common/CopyPill.jsx      # Micro-interaction copy-to-clipboard button
│   │   │   ├── common/Navbar.jsx        # Public and user navigation
│   │   │   └── layout/DashboardLayout.jsx# Role-tailored responsive sidebar layout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx          # Public hospital landing portal
│   │   │   ├── auth/Login.jsx           # Sign in with 1-click test selector & error shake
│   │   │   ├── auth/Register.jsx        # Patient self-registration
│   │   │   ├── patient/                 # Patient Dashboard, Book Slot, History, Prescriptions
│   │   │   ├── doctor/                  # Doctor Queue, Consult & Prescribe, Schedule
│   │   │   └── admin/                   # Master Ledger, Analytics, Doctor & Patient CRUD
│   │   ├── routes/ProtectedRoute.jsx    # Role-based route guards
│   │   ├── App.jsx                      # Client router setup
│   │   ├── main.jsx
│   │   └── index.css                    # Tailwind + @keyframes shimmer & micro-interactions
│   ├── tailwind.config.js
│   └── package.json
├── .gitignore                           # Git ignore rules
└── README.md
```

---

## 🌟 Key Functionality Walkthrough

### 1. 👤 Patient Panel
- **Interactive 4-Step Booking Wizard**:
  1. Department & Doctor selection (view experience, fee, qualification, rating).
  2. Live date picker with dynamic **30-minute time-slot chips** (booked slots automatically disabled).
  3. Symptoms and visit reason description.
  4. Real-time booking summary & instant confirmation. Double-booking prevention enforced at DB query level.
- **My Appointments Ledger**: Tabbed view of **Upcoming Visits** vs. **Past Bookings & History**.
- **Digital Prescriptions**: View and print doctor diagnoses, prescribed medications tables (drug name, dosage, duration), clinical instructions, and follow-up schedules.
- **Cancellation**: One-click cancellation with reason recording.

### 2. 🩺 Doctor Panel
- **Outpatient Daily Queue**: Real-time counter of today's schedule and pending consultations.
- **Consultation & Prescription Modal**:
  - Record clinical medical diagnosis.
  - Dynamic medicine prescription builder (add/remove drug rows with dosage and duration).
  - Clinical instructions and follow-up appointment date.
  - Submitting marks the appointment as completed and archives the prescription.
- **Schedule & Availability Manager**: Configure active clinic days, shift hours, consultation tariffs, and toggle online availability.

### 3. 👑 Admin Panel
- **Master Appointments Ledger (`/admin/appointments`)**: Full hospital audit ledger showing all bookings across all doctors and departments with live search and multi-filtering (Status, Department, Doctor, Date Range).
- **Executive KPIs**: Real-time counters for Total Doctors, Total Patients, Total Bookings, and Estimated Consultation Revenue.
- **Doctor Directory Management (CRUD)**: Register specialist physicians with credentials and clinic rooms; remove doctor accounts.
- **Patient Directory**: Audit patient demographics, blood groups, emergency contacts, and booking visit frequencies.

---

## ⚡ Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Run migration & populate demo seed data
npm run db:init
# Start development server (http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Start Vite development server (http://localhost:5173)
npm run dev
```

---

## 🌐 Deploying Frontend & Backend on Render (Step-by-Step Guide)

You can easily deploy both services on **Render** (free tier compatible).

### Step 1: Push Your Code to GitHub
Ensure all your files and commits are pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: complete hospital management system with admin, doctor, patient panels"
git branch -M main
git remote add origin https://github.com/geekykalpesh/hospital-management-system.git
git push -u origin main
```

---

### Step 2: Deploy the Backend (Render Web Service)

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your repository: `geekykalpesh/hospital-management-system`.
4. Configure the Web Service settings:
   - **Name**: `aura-care-backend` (or your preferred name)
   - **Region**: Oregon (US West) or Ohio (US East)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(Important! Set this to `backend`)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. Click **Advanced** and add the following **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Render port (or standard 10000) |
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_0bkJoms4RIWY@ep-blue-moon-b5qxwgaf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require` | Your Neon PostgreSQL connection string |
   | `JWT_SECRET` | `hospital_mgmt_super_secret_jwt_key_2026_secure` | Secure JWT secret |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `FRONTEND_URL` | `https://your-frontend-subdomain.onrender.com` | (Update after deploying frontend) |
6. Click **Create Web Service**.
7. Once deployed, note down your Backend URL (e.g., `https://aura-care-backend.onrender.com`).
8. *(Optional)* Run Database Seed: Go to the **Shell** tab on Render and run `npm run db:init` if you want to re-seed demo accounts.

---

### Step 3: Deploy the Frontend (Render Static Site)

1. In the Render Dashboard, click **New +** and select **Static Site**.
2. Connect the same repository: `geekykalpesh/hospital-management-system`.
3. Configure the Static Site settings:
   - **Name**: `aura-care-hospital` (or your preferred name)
   - **Branch**: `main`
   - **Root Directory**: `frontend` *(Important! Set this to `frontend`)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click **Advanced** and add the following **Environment Variable**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://aura-care-backend.onrender.com/api` *(Your Render backend URL followed by `/api`)* |
5. **Crucial for Single Page Applications (React Router)**:
   - In your Render Static Site settings, go to the **Redirects / Rewrites** tab.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: Save
   *(This ensures refreshing `/patient/book` or `/doctor/appointments` doesn't return a 404 error).*
6. Click **Create Static Site**.
7. Once finished, update your Backend Web Service's `FRONTEND_URL` environment variable to match your new frontend Render URL.

---

## 🔒 Security & Best Practices Implemented
- Passwords salted and hashed with **bcrypt** (10 rounds).
- Stateless JWT verification with automatic expiration and `/login` re-routing.
- Role-based access control guards on both backend middleware and frontend React Router.
- SQL injection prevention via parameterized queries.
- `.env` files and credentials excluded from Git version control.
