// ============================================================================
// AI Meta Factory – API Gateway (Express)
// Routes requests to microservices, handles authentication, logging, and health checks.
// ============================================================================

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import winston from 'winston';
import { authMiddleware } from './middleware/auth';

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
  origin: process.env.NEXT_PUBLIC_APP_URL || 'https://ai-meta-factory.onrender.com',
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
// Service proxy configuration
// ----------------------------------------------------------------------------
const serviceProxy = {
  auth: createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/' },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying /api/auth -> ${proxyReq.path}`);
    },
  }),
  
  projects: createProxyMiddleware({
    target: process.env.PROJECT_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/api/projects': '/' },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying /api/projects -> ${proxyReq.path}`);
    },
  }),
  
  builds: createProxyMiddleware({
    target: process.env.BUILD_SERVICE_URL || 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: { '^/api/builds': '/' },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying /api/builds -> ${proxyReq.path}`);
    },
  }),
  
  ai: createProxyMiddleware({
    target: process.env.AI_SERVICE_URL || 'http://ai-meta-factory.onrender.com',
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '/' },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying /api/ai -> ${proxyReq.path}`);
    },
  }),
};

// ----------------------------------------------------------------------------
// Public routes (no authentication)
// ----------------------------------------------------------------------------
app.use('/api/auth', serviceProxy.auth);

// ----------------------------------------------------------------------------
// Protected routes (require JWT)
// ----------------------------------------------------------------------------
app.use('/api/projects', authMiddleware, serviceProxy.projects);
app.use('/api/builds', authMiddleware, serviceProxy.builds);
app.use('/api/ai', authMiddleware, serviceProxy.ai);

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
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'https://ai-meta-factory.onrender.com'}`);
});

export default app;
