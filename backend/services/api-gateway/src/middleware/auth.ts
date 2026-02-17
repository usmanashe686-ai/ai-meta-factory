import { Request, Response, NextFunction } from 'express';

// Temporary auth middleware – sets a demo user ID on the request
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // For testing, attach a fixed user ID (you can pass it via header if needed)
  (req as any).user = { id: req.headers['x-user-id'] as string || 'demo-user-id' };
  next();
};
