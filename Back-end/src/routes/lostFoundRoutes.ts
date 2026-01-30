import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  approveClaim,
  createLostFoundItem,
  deleteLostFoundItem,
  getLostFoundItems,
  markAsFound,
  requestClaim,
  resolveLostFoundItem,
  updateLostFoundStatus,
} from '../controllers/lostFoundController';

export const lostFoundRouter = Router();

lostFoundRouter.get('/', requireAuth, getLostFoundItems);
lostFoundRouter.post('/', requireAuth, createLostFoundItem);
lostFoundRouter.patch('/:id/claim', requireAuth, requestClaim);
lostFoundRouter.patch('/:id/mark-found', requireAuth, markAsFound);
lostFoundRouter.patch('/:id/approve-claim', requireAuth, requireRole('management', 'warden'), approveClaim);
lostFoundRouter.patch('/:id/status', requireAuth, requireRole('management', 'warden'), updateLostFoundStatus);
lostFoundRouter.patch('/:id/resolve', requireAuth, resolveLostFoundItem);
lostFoundRouter.delete('/:id', requireAuth, requireRole('management', 'warden'), deleteLostFoundItem);

