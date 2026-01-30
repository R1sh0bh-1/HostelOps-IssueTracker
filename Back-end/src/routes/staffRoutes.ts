import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as staffController from '../controllers/staffController';

const router = Router();

// All routes require authentication and management/warden role
router.use(requireAuth);
router.use(requireRole('management', 'warden'));

router.get('/', staffController.getAllStaff);
router.get('/by-category/:category', staffController.getStaffByCategory);
router.post('/', staffController.createStaff);
router.delete('/:id', staffController.deleteStaff);

export default router;

