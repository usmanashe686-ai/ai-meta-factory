// ============================================================================
// AI Meta Factory – API Gateway (Production Optimized)
// ============================================================================
import express, { Express, Request, Response } from 'express';
import path from "path";
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import winston from 'winston';

import { authMiddleware } from './middleware/auth';
import prisma from './lib/prisma';
import adminRouter from './routes/admin';
import templatesRouter from './routes/templates';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Global middleware
app.use(helmet());
app.use(cors({
  // Priority: CORS_ORIGIN -> FRONTEND_URL -> Production Vercel
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'https://ai-meta-factory.vercel.app',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../../public/uploads")));

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/templates', templatesRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0',
  });
});

// Proxy to Auth Service
app.use('/api/auth', (createProxyMiddleware as any)({
  target: process.env.AUTH_SERVICE_URL || 'https://ai-meta-factory-auth.onrender.com',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/' },
}));

// Protected routes – Direct database access for projects
app.use('/api/projects', authMiddleware);

app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    res.json(projects);
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { name, content } = req.body;
    const project = await prisma.project.create({
      data: { name, content: content || {}, userId },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Other service proxies
app.use('/api/builds', authMiddleware, (createProxyMiddleware as any)({
  target: process.env.BUILD_SERVICE_URL || 'https://ai-meta-factory-build.onrender.com',
  changeOrigin: true,
  pathRewrite: { '^/api/builds': '/' },
}));

app.use('/api/ai', authMiddleware, (createProxyMiddleware as any)({
  target: process.env.AI_SERVICE_URL || 'https://ai-meta-factory-ai.onrender.com',
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/' },
}));

app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'https://ai-meta-factory.vercel.app'}`);
});

export default app;
