import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/available-slots', getAvailableSlots);

router.post('/', authenticateToken, authorizeRoles('admin'), createDoctor);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'doctor'), updateDoctor);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteDoctor);

export default router;
