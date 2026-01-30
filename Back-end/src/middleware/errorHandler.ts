import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: 'Not found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      details: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code });
  }

  if (err instanceof Error) {
    // Common mongoose errors
    if ((err as any).name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
    if ((err as any).code === 11000) return res.status(409).json({ message: 'Duplicate key' });
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

