import { Router } from 'express';
import { addAdminRemark, assignIssue, createIssue, deleteIssue, findSimilar, getIssue, getIssues, mergeIssues, reopenIssue, setResolutionProof, unmergeIssue, updateIssueStatus } from '../controllers/issueController';
import { requireAuth, requireRole } from '../middleware/auth';

export const issueRouter = Router();

issueRouter.get('/', requireAuth, getIssues);
issueRouter.get('/:id', requireAuth, getIssue);
issueRouter.post('/', requireAuth, createIssue);
issueRouter.patch('/:id/status', requireAuth, updateIssueStatus);
issueRouter.patch('/:id/assign', requireAuth, requireRole('management', 'warden'), assignIssue);
issueRouter.patch('/:id/admin-remark', requireAuth, requireRole('management', 'warden'), addAdminRemark);
issueRouter.patch('/:id/resolution-proof', requireAuth, requireRole('management', 'warden'), setResolutionProof);
issueRouter.delete('/:id', requireAuth, requireRole('management', 'warden'), deleteIssue);

// Duplicate detection and merging routes
issueRouter.get('/:id/similar', requireAuth, requireRole('management', 'warden'), findSimilar);
issueRouter.post('/:id/merge', requireAuth, requireRole('management', 'warden'), mergeIssues);
issueRouter.post('/:id/unmerge', requireAuth, requireRole('management', 'warden'), unmergeIssue);

// Reopen issue route (student only)
issueRouter.post('/:id/reopen', requireAuth, reopenIssue);

