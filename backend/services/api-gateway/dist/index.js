"use strict";
// ============================================================================
// AI Meta Factory – API Gateway (Express)
// Routes requests to microservices, handles authentication, logging, and health checks.
// Includes direct database access for project endpoints using Prisma.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const winston_1 = __importDefault(require("winston"));
const auth_1 = require("./middleware/auth");
const prisma_1 = __importDefault(require("./lib/prisma"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Logger configuration
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple(),
    }));
}
// Global middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'https://ai-meta-factory.onrender.com',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'api-gateway',
        version: process.env.npm_package_version || '1.0.0',
    });
});
// Public routes (no authentication)
app.use('/api/auth', http_proxy_middleware_1.createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/' },
}));
// Protected routes – Direct database access for projects
app.use('/api/projects', auth_1.authMiddleware);
// GET /api/projects – list projects
app.get('/api/projects', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const projects = await prisma_1.default.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        });
        res.json(projects);
    }
    catch (error) {
        logger.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// GET /api/projects/:id – get a single project
app.get('/api/projects/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const project = await prisma_1.default.project.findFirst({
            where: { id, userId },
        });
        if (!project)
            return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    }
    catch (error) {
        logger.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
// POST /api/projects – create a new project
app.post('/api/projects', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, content } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Project name is required' });
        const project = await prisma_1.default.project.create({
            data: { name, content: content || {}, userId },
        });
        res.status(201).json(project);
    }
    catch (error) {
        logger.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
// PUT /api/projects/:id – update a project
app.put('/api/projects/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const { name, content } = req.body;
        const existing = await prisma_1.default.project.findFirst({ where: { id, userId } });
        if (!existing)
            return res.status(404).json({ error: 'Project not found' });
        const updated = await prisma_1.default.project.update({
            where: { id },
            data: { name, content },
        });
        res.json(updated);
    }
    catch (error) {
        logger.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
// DELETE /api/projects/:id – delete a project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const existing = await prisma_1.default.project.findFirst({ where: { id, userId } });
        if (!existing)
            return res.status(404).json({ error: 'Project not found' });
        await prisma_1.default.project.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        logger.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
// Other service proxies
app.use('/api/builds', auth_1.authMiddleware, http_proxy_middleware_1.createProxyMiddleware({
    target: process.env.BUILD_SERVICE_URL || 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: { '^/api/builds': '/' },
}));
app.use('/api/ai', auth_1.authMiddleware, http_proxy_middleware_1.createProxyMiddleware({
    target: process.env.AI_SERVICE_URL || 'http://ai-meta-factory.onrender.com',
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '/' },
}));
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
});
// Start server
app.listen(PORT, () => {
    logger.info(`🚀 API Gateway running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'https://ai-meta-factory.onrender.com'}`);
});
exports.default = app;
