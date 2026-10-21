import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', authenticateToken, authorizeRoles('admin'), createDepartment);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateDepartment);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteDepartment);

export default router;
