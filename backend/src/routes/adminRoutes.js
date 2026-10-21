import express from 'express';
import { getDashboardStats, getAllPatients } from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/patients', getAllPatients);

export default router;
