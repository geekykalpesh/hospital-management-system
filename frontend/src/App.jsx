import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorSchedule from './pages/doctor/DoctorSchedule';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MasterAppointments from './pages/admin/MasterAppointments';
import DoctorManagement from './pages/admin/DoctorManagement';
import PatientManagement from './pages/admin/PatientManagement';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Role-Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<MyAppointments />} />
              <Route path="/patient/prescriptions" element={<MyPrescriptions />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
            </Route>

            {/* Doctor Role-Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            </Route>

            {/* Admin Role-Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/appointments" element={<MasterAppointments />} />
              <Route path="/admin/doctors" element={<DoctorManagement />} />
              <Route path="/admin/patients" element={<PatientManagement />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
