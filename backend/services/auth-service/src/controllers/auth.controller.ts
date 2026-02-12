import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger.util';
import { registerSchema, loginSchema } from '../validators/auth.validator';
export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const result = await AuthService.register(value);
      res.status(201).json(result);
    } catch (err: any) {
      logger.error(`Register error: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  }
  static async login(req: Request, res: Response) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const result = await AuthService.login(value);
      res.json(result);
    } catch (err: any) {
      logger.error(`Login error: ${err.message}`);
      res.status(401).json({ error: err.message });
    }
  }
  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
      const result = await AuthService.refresh(refreshToken);
      res.json(result);
    } catch (err: any) {
      logger.error(`Refresh error: ${err.message}`);
      res.status(401).json({ error: err.message });
    }
  }
  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(req.user, refreshToken);
      res.json({ message: 'Logged out successfully' });
    } catch (err: any) {
      logger.error(`Logout error: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }
  static async getProfile(req: Request, res: Response) {
    try {
      const profile = await AuthService.getProfile(req.user.sub);
      res.json(profile);
    } catch (err: any) {
      logger.error(`Get profile error: ${err.message}`);
      res.status(404).json({ error: err.message });
    }
  }
  static async updateProfile(req: Request, res: Response) {
    try {
      const { name, username, avatar } = req.body;
      const profile = await AuthService.updateProfile(req.user.sub, { name, username, avatar });
      res.json(profile);
    } catch (err: any) {
      logger.error(`Update profile error: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  }
}
