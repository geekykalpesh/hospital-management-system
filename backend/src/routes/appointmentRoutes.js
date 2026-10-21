import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  submitPrescription,
} from '../controllers/appointmentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All appointment actions require an authenticated user
router.use(authenticateToken);

// Booking
router.post('/', createAppointment);

// Patient Panel: My Appointments (Upcoming vs History)
router.get('/my-appointments', authorizeRoles('patient', 'admin'), getMyAppointments);

// Doctor Panel: Queue and consultations
router.get('/doctor-appointments', authorizeRoles('doctor', 'admin'), getDoctorAppointments);

// Admin Panel: Master Ledger of all hospital appointments
router.get('/all', authorizeRoles('admin'), getAllAppointments);

// Status and cancellation
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/status', authorizeRoles('admin', 'doctor'), updateAppointmentStatus);

// Doctor submits prescription
router.post('/:id/prescription', authorizeRoles('doctor', 'admin'), submitPrescription);

export default router;
