import { z } from 'zod';
import mongoose from 'mongoose';
import { ThreadModel } from '../models/Thread';
import { HttpError } from '../utils/httpError';

const createThreadSchema = z.object({
  issueId: z.string().min(1),
});

const addCommentSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  userRole: z.enum(['student', 'warden', 'management', 'maintenance']),
  content: z.string().min(1),
  parentCommentId: z.string().optional(),
});

export async function getAllThreads(_req: any, res: any) {
  const threads = await ThreadModel.find().sort({ updatedAt: -1 });
  res.json(threads.map(t => t.toJSON()));
}

export async function getThreadByIssueId(req: any, res: any) {
  const thread = await ThreadModel.findOne({ issueId: req.params.issueId });
  res.json(thread ? thread.toJSON() : null);
}

export async function createThread(req: any, res: any) {
  const { issueId } = createThreadSchema.parse(req.body);
  const existing = await ThreadModel.findOne({ issueId });
  if (existing) return res.status(200).json(existing.toJSON());

  const thread = await ThreadModel.create({
    issueId,
    isResolved: false,
    isBlocked: false,
    comments: [],
  });
  res.status(201).json(thread.toJSON());
}

export async function addComment(req: any, res: any) {
  const { threadId } = req.params;
  const data = addCommentSchema.parse(req.body);

  const thread = await ThreadModel.findById(threadId);
  if (!thread) throw new HttpError(404, 'Thread not found');
  if (thread.isResolved) throw new HttpError(400, 'Cannot comment on resolved thread');
  if (thread.isBlocked) throw new HttpError(400, 'Thread is blocked');

  const now = new Date();
  const commentId = new mongoose.Types.ObjectId();

  // Mongoose subdoc expects an _id; our TS interface is simplified, so cast here.
  (thread.comments as any).push({
    _id: commentId,
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole,
    content: data.content,
    parentCommentId: data.parentCommentId,
    isBlocked: false,
    createdAt: now,
    updatedAt: now,
  });

  await thread.save();

  const saved = thread.toJSON();
  const created = saved.comments.find((c: any) => c.id === String(commentId));
  res.status(201).json(created);
}

export async function resolveThread(req: any, res: any) {
  const thread = await ThreadModel.findById(req.params.threadId);
  if (!thread) throw new HttpError(404, 'Thread not found');
  if (thread.isBlocked) throw new HttpError(400, 'Cannot resolve a blocked thread');

  thread.isResolved = true;
  thread.resolvedBy = req.user.id;
  thread.resolvedAt = new Date();
  await thread.save();
  res.json(thread.toJSON());
}

export async function blockThread(req: any, res: any) {
  const thread = await ThreadModel.findById(req.params.threadId);
  if (!thread) throw new HttpError(404, 'Thread not found');

  thread.isBlocked = true;
  thread.blockedBy = req.user.id;
  thread.blockedAt = new Date();
  await thread.save();
  res.json(thread.toJSON());
}

export async function unblockThread(req: any, res: any) {
  const thread = await ThreadModel.findById(req.params.threadId);
  if (!thread) throw new HttpError(404, 'Thread not found');

  thread.isBlocked = false;
  thread.blockedBy = undefined;
  thread.blockedAt = undefined;
  await thread.save();
  res.json(thread.toJSON());
}

export async function blockComment(req: any, res: any) {
  const { threadId, commentId } = req.params;
  const thread = await ThreadModel.findById(threadId);
  if (!thread) throw new HttpError(404, 'Thread not found');

  const comment = (thread.comments as any).id(commentId);
  if (!comment) throw new HttpError(404, 'Comment not found');

  comment.isBlocked = true;
  comment.blockedBy = req.user.id;
  comment.blockedAt = new Date();
  comment.updatedAt = new Date();
  await thread.save();

  res.json(thread.toJSON().comments.find((c: any) => c.id === commentId));
}

export async function unblockComment(req: any, res: any) {
  const { threadId, commentId } = req.params;
  const thread = await ThreadModel.findById(threadId);
  if (!thread) throw new HttpError(404, 'Thread not found');

  const comment = (thread.comments as any).id(commentId);
  if (!comment) throw new HttpError(404, 'Comment not found');

  comment.isBlocked = false;
  comment.blockedBy = undefined;
  comment.blockedAt = undefined;
  comment.updatedAt = new Date();
  await thread.save();

  res.json(thread.toJSON().comments.find((c: any) => c.id === commentId));
}

