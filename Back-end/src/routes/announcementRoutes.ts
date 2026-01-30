import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController';

export const announcementRouter = Router();

announcementRouter.get('/', requireAuth, getAnnouncements);
announcementRouter.post('/', requireAuth, requireRole('management', 'warden'), createAnnouncement);

