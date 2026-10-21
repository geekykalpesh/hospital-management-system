# 🏥 AuraCare - Enterprise Hospital Management System (HMS)

> A full-stack Hospital Management Platform built for technical coding round evaluation. Features three dedicated, role-protected portals (**Patient**, **Doctor**, and **Hospital Administrator**) with stateless JWT authentication, relational PostgreSQL persistence on Neon DB, healthcare-grade UI/UX, wave shimmer skeleton loaders, and tactile micro-interactions.

---

## 🔗 Live Application & Infrastructure Links

| Service | Description | Live URL |
| :--- | :--- | :--- |
| 🌐 **Frontend Application** | React 18 + Tailwind SPA deployed on Render | [https://hospital-management-system-1-g2e3.onrender.com](https://hospital-management-system-1-g2e3.onrender.com) |
| 📡 **Backend REST API** | Express.js + Node.js API deployed on Render | [https://hospital-management-system-uwn3.onrender.com](https://hospital-management-system-uwn3.onrender.com) |
| 📦 **Source Code Archive** | Google Drive downloadable ZIP archive | [Download ZIP](https://drive.google.com/file/d/1Flrgic64IXIVgE92JC9iYHgAsPxqSpk4/view?usp=sharing) |
| 🩺 **API Health Check** | Live uptime and health verification endpoint | [https://hospital-management-system-uwn3.onrender.com/api/health](https://hospital-management-system-uwn3.onrender.com/api/health) |
| 🐙 **GitHub Repository** | Source code repository with version control | [https://github.com/geekykalpesh/hospital-management-system](https://github.com/geekykalpesh/hospital-management-system) |
| 🗄️ **Database Console** | Neon Serverless PostgreSQL Cloud Database | [https://console.neon.tech](https://console.neon.tech) |

---

## 🗄️ Neon Cloud PostgreSQL Database Credentials

Reviewers can connect directly via pgAdmin, DBeaver, or psql:

| Parameter | Value |
| :--- | :--- |
| **Neon Console** | [https://console.neon.tech](https://console.neon.tech) |
| **Database Host** | `ep-blue-moon-b5qxwgaf-pooler.c-7.us-east-2.aws.neon.tech` |
| **Database Name** | `neondb` |
| **Database User** | `neondb_owner` |
| **Database Password** | `npg_0bkJoms4RIWY` |
| **Port** | `5432` |
| **SSL Mode** | `require` |
| **Full Connection URI** | `postgresql://neondb_owner:npg_0bkJoms4RIWY@ep-blue-moon-b5qxwgaf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require` |

---

## 🔑 Authentication & Live Demo Credentials

Use the **1-click evaluation demo quick-fill switcher** on the [`/login`](https://hospital-management-system-1-g2e3.onrender.com/login) screen, or sign in manually using any of the verified credentials below:

### 👑 Lead Administrator Account
- **Email**: `geekykalpesh@gmail.com`
- **Password**: `Kalpesh1234@`
- **Role**: `admin` (Full Master Operations & Audit Access)

### 👥 Pre-Configured Specialist & Patient Accounts

| Role | Email Address | Password | Profile Details & Pre-seeded State |
| :--- | :--- | :--- | :--- |
| **👑 System Admin** | `admin@hospital.com` | `Admin@123` | Hospital Master Command, Ledger & KPIs |
| **🩺 Doctor (Cardiology)** | `doctor.sarah@hospital.com` | `Doctor@123` | Dr. Sarah Jenkins, MD (Interventional Cardiology, Room 302-A) |
| **🩺 Doctor (Neurology)** | `doctor.james@hospital.com` | `Doctor@123` | Dr. James Wilson, MD (Cognitive Neurology, Room 405-B) |
| **🩺 Doctor (Pediatrics)** | `doctor.elena@hospital.com` | `Doctor@123` | Dr. Elena Rostova, MD (Pediatrics & Neonatal, Room 104-C) |
| **🩺 Doctor (Orthopedics)** | `doctor.marcus@hospital.com` | `Doctor@123` | Dr. Marcus Sterling, MD (Joint & Sports Medicine, Room 210-D) |
| **👤 Patient 1** | `john.doe@example.com` | `Patient@123` | Pre-seeded with **Upcoming Confirmed** & **Past Completed** visits with Prescriptions |
| **👤 Patient 2** | `emily.smith@example.com` | `Patient@123` | Pre-seeded with **Upcoming Pending** & **Past Cancelled** bookings |

> 💡 **Self-Registration**: New patients can also register a fresh account with DOB, blood group, emergency contact, and medical history directly via [`/register`](https://hospital-management-system-1-g2e3.onrender.com/register).

---

## 🛠️ Complete Technology Stack

### Frontend Architecture
- **Framework**: React.js 18 (bootstrapped with Vite)
- **Styling**: Tailwind CSS (Custom healthcare palette: Deep Slate `#0F172A`, Medical Teal `#0D9488`, Cyan `#0891B2` — strictly avoiding raw/neon RGB)
- **Routing**: React Router v6 with Role-Guarded Protected Routes (`ProtectedRoute.jsx`)
- **State & Context**: Context API for global `AuthContext` (JWT session management) and `ToastContext` (micro-interaction notifications)
- **HTTP Client**: Axios with request/response interceptors (auto JWT attachment & global 401 session expiration handling)
- **Icons**: Lucide React
- **Animations**: Custom `@keyframes shimmer`, `popIn`, `slideInRight`, and `shake`

### Backend Architecture
- **Runtime**: Node.js v22 (Modern ES Modules: `"type": "module"`)
- **Server Framework**: Express.js with dual-route mounting (`/api/...` and `/...`)
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) with `Bearer` Authorization headers
- **Password Security**: Cryptographic hashing via `bcryptjs` (10 salt rounds)
- **CORS**: Cross-Origin Resource Sharing configured for dev and production Render URLs
- **Networking**: Custom IPv6/IPv4 dual-stack DNS resolution (`--dns-result-order=verbatim`) optimized for AWS & Neon cloud endpoints

### Database & Persistence
- **Engine**: PostgreSQL hosted on [Neon Serverless Cloud](https://console.neon.tech)
- **Client**: `pg` (node-postgres) with connection pooling, SSL encryption (`rejectUnauthorized: false`), and parameterized SQL queries to prevent SQL injections
- **Relational Schema**: 6 normalized entities (`users`, `departments`, `doctors`, `patients`, `appointments`, `prescriptions`) with foreign key constraints, cascading deletes, and performance indexes

---

## 🌟 Comprehensive Feature Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                      AuraCare HMS Feature Matrix                       │
├──────────────────────────┬──────────────┬──────────────┬───────────────┤
│ Feature                  │ Patient      │ Doctor       │ Admin         │
├──────────────────────────┼──────────────┼──────────────┼───────────────┤
│ JWT Register & Login     │      ✅      │      ✅      │      ✅       │
│ Interactive Slot Wizard  │      ✅      │      ❌      │      ✅       │
│ View Upcoming Bookings   │      ✅      │      ✅      │      ✅       │
│ View Past History        │      ✅      │      ✅      │      ✅       │
│ Digital Prescriptions    │ View & Print │ Create/Edit  │     Audit     │
│ Cancel Bookings          │      ✅      │      ✅      │      ✅       │
│ Daily Outpatient Queue   │      ❌      │      ✅      │      ❌       │
│ Doctor Practice Schedule │      ❌      │      ✅      │     Audit     │
│ Master Hospital Ledger   │      ❌      │      ❌      │      ✅       │
│ Hospital KPIs & Revenue  │      ❌      │      ❌      │      ✅       │
│ Doctor Management (CRUD) │      ❌      │      ❌      │      ✅       │
│ Patient Directory Audit  │      ❌      │ Patient Hist │  All Patients │
└──────────────────────────┴──────────────┴──────────────┴───────────────┘
```

---

## 🎨 UI/UX Excellence, Shimmer Effect & Micro-Interactions

### 1. Zero-Flicker Wave Shimmer Skeleton Loaders
- Built with custom `@keyframes shimmer` moving gradients.
- Replaces raw spinners with structured skeleton layouts:
  - `<ShimmerStats count={4} />`: Analytics KPI skeleton cards
  - `<ShimmerTable rows={6} columns={6} />`: Table row skeletons
  - `<ShimmerAppointmentCard count={3} />`: Structured appointment card skeletons
  - `<ShimmerCard />`: Profile and department card skeletons

### 2. Tactile Micro-Interactions
- **Interactive Toasts (`useToast`)**: Floating top-right notifications for booking confirmations, doctor prescriptions, cancellations, and status updates.
- **Copy-to-Clipboard Pills (`<CopyPill />`)**: Clickable booking IDs, phone numbers, and emails with instantaneous checkmark bounce feedback.
- **Live Activity Radar Ping**: Pulsing beacon dot on pending appointments for real-time status awareness.
- **Smooth Elevations & Scale**: Buttons feature tactile active press effects (`active:scale-[0.97]`), and cards smoothly elevate on hover (`hover:-translate-y-1 hover:shadow-md`).
- **Input Focus Glow & Error Shake**: Smooth clinical teal ring focus glows (`focus:ring-2 focus:ring-teal-500/20`) and validation shake animations (`animate-shake`).

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/geekykalpesh/hospital-management-system.git
cd hospital-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install

# Initialize PostgreSQL Schema & Seed Demo Data
npm run db:init

# Start Backend Server (Runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite Development Server (Runs on http://localhost:5173)
npm run dev
```

---

## 🚀 Render Cloud Deployment Reference

Both services are live on Render:

### Backend Service Settings (Render Web Service)
- **Repository**: `geekykalpesh/hospital-management-system`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm run start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `5000`
  - `DATABASE_URL`: `postgresql://neondb_owner:npg_0bkJoms4RIWY@ep-blue-moon-b5qxwgaf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require`
  - `JWT_SECRET`: `hospital_mgmt_super_secret_jwt_key_2026_secure`
  - `JWT_EXPIRES_IN`: `7d`
  - `FRONTEND_URL`: `https://hospital-management-system-1-g2e3.onrender.com`

### Frontend Service Settings (Render Static Site)
- **Repository**: `geekykalpesh/hospital-management-system`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://hospital-management-system-uwn3.onrender.com/api`
- **SPA Rewrites**:
  - `/*` $\rightarrow$ `/index.html` (Status: `200`)

---

## 👨‍💻 Developer & Contact Details

- **Candidate**: Kalpesh Mahajan
- **Email**: [geekykalpesh@gmail.com](mailto:geekykalpesh@gmail.com)
- **GitHub**: [@geekykalpesh](https://github.com/geekykalpesh)
- **Project Repository**: [hospital-management-system](https://github.com/geekykalpesh/hospital-management-system)
