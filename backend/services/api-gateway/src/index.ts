// ============================================================================
// AI Meta Factory – API Gateway (Express)
// Routes requests to microservices, handles authentication, logging, and health checks.
// Includes direct database access for project endpoints using Prisma.
// ============================================================================

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
// @ts-ignore
const createProxyMiddleware = require('http-proxy-middleware');
import winston from 'winston';
import { authMiddleware } from './middleware/auth';
import prisma from './lib/prisma'; // Import Prisma client

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ----------------------------------------------------------------------------
// Logger configuration
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Global middleware
// ----------------------------------------------------------------------------
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// ----------------------------------------------------------------------------
// Health check
// ----------------------------------------------------------------------------
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ----------------------------------------------------------------------------
// Public routes (no authentication)
// ----------------------------------------------------------------------------
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/' },
}));

// ----------------------------------------------------------------------------
// Protected routes – Direct database access for projects
// ----------------------------------------------------------------------------
// All project routes require authentication
app.use('/api/projects', authMiddleware);

// GET /api/projects – list projects for the authenticated user
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware (adjust based on your auth implementation)
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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

// GET /api/projects/:id – get a single project
app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects – create a new project
app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { name, content } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    const project = await prisma.project.create({
      data: {
        name,
        content: content || {},
        userId,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id – update a project
app.put('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name, content } = req.body;
    // Check ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const updated = await prisma.project.update({
      where: { id },
      data: { name, content },
    });
    res.json(updated);
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id – delete a project
app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ----------------------------------------------------------------------------
// Other service proxies (keep as proxies)
// ----------------------------------------------------------------------------
app.use('/api/builds', authMiddleware, createProxyMiddleware({
  target: process.env.BUILD_SERVICE_URL || 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: { '^/api/builds': '/' },
}));

app.use('/api/ai', authMiddleware, createProxyMiddleware({
  target: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/' },
}));

// ----------------------------------------------------------------------------
// 404 handler
// ----------------------------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// ----------------------------------------------------------------------------
// Error handling middleware
// ----------------------------------------------------------------------------
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// ----------------------------------------------------------------------------
// Start server
// ----------------------------------------------------------------------------
app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
