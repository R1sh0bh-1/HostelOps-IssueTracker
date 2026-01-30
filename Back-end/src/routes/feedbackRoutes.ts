import { Router } from 'express';
import { submitFeedback, getMyFeedback, getAnalytics, getFeedbackByCategory } from '../controllers/feedbackController';
import { requireAuth, requireRole } from '../middleware/auth';

export const feedbackRouter = Router();

// Student routes
feedbackRouter.post('/', requireAuth, submitFeedback);
feedbackRouter.get('/my', requireAuth, getMyFeedback);

// Admin routes
feedbackRouter.get('/analytics', requireAuth, requireRole('management', 'warden'), getAnalytics);
feedbackRouter.get('/category/:category', requireAuth, requireRole('management', 'warden'), getFeedbackByCategory);
