import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User';

export class AuthController {
  // POST /auth/register
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = UserModel.create({
        email,
        password: hashedPassword,
        name,
      });

      const token = this.generateToken(user);
      res.status(201).json({ user: this.sanitizeUser(user), token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /auth/login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = this.generateToken(user);
      res.json({ user: this.sanitizeUser(user), token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /auth/profile
  static async getProfile(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      res.json(this.sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper: Generate JWT
  private static generateToken(user: IUser) {
    return jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Helper: Remove password from user object
  private static sanitizeUser(user: IUser) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
