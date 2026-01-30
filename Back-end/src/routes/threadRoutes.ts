import { Router } from 'express';
import {
  addComment,
  blockComment,
  blockThread,
  createThread,
  getAllThreads,
  getThreadByIssueId,
  resolveThread,
  unblockComment,
  unblockThread,
} from '../controllers/threadController';
import { requireAuth, requireRole } from '../middleware/auth';

export const threadRouter = Router();

threadRouter.get('/', requireAuth, getAllThreads);
threadRouter.get('/issue/:issueId', requireAuth, getThreadByIssueId);
threadRouter.post('/', requireAuth, createThread);
threadRouter.post('/:threadId/comments', requireAuth, addComment);

threadRouter.patch('/:threadId/resolve', requireAuth, requireRole('management', 'warden'), resolveThread);
threadRouter.patch('/:threadId/block', requireAuth, requireRole('management', 'warden'), blockThread);
threadRouter.patch('/:threadId/unblock', requireAuth, requireRole('management', 'warden'), unblockThread);

threadRouter.patch(
  '/:threadId/comments/:commentId/block',
  requireAuth,
  requireRole('management', 'warden'),
  blockComment
);
threadRouter.patch(
  '/:threadId/comments/:commentId/unblock',
  requireAuth,
  requireRole('management', 'warden'),
  unblockComment
);

