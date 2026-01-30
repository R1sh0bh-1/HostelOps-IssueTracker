import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { authRouter } from './routes/authRoutes';
import { issueRouter } from './routes/issueRoutes';
import { threadRouter } from './routes/threadRoutes';
import { uploadRouter } from './routes/uploadRoutes';
import { announcementRouter } from './routes/announcementRoutes';
import { lostFoundRouter } from './routes/lostFoundRoutes';
import staffRouter from './routes/staffRoutes';
import { feedbackRouter } from './routes/feedbackRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  // Serve uploaded files
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/issues', issueRouter);
  app.use('/api/threads', threadRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/announcements', announcementRouter);
  app.use('/api/lostfound', lostFoundRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/feedback', feedbackRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

