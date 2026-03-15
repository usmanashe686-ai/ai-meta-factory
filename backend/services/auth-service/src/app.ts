import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './utils/logger.util';
import { AuthController } from './controllers/auth.controller';
import { authenticate } from './middleware/auth.middleware';

const app = express();

app.use(helmet());

// Production-ready CORS for Vercel and Mobile APK
app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['https://ai-meta-factory.vercel.app'],
  credentials: true,
}));

app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Auth Routes - Keeping your original logic intact
app.post('/auth/register', AuthController.register);
app.post('/auth/login', AuthController.login);
app.post('/auth/refresh', AuthController.refresh);
app.post('/auth/logout', authenticate, AuthController.logout);
app.get('/auth/profile', authenticate, AuthController.getProfile);
app.put('/auth/profile', authenticate, AuthController.updateProfile);

app.use((req, res) => { res.status(404).json({ error: 'Not found' }); });

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
