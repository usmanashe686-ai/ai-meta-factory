import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
declare global { namespace Express { interface Request { user?: any; } } }
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.substring(7);
  try {
    req.user = await TokenService.verifyAccessToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
