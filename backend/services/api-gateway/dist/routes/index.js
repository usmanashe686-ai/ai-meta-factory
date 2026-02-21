"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
// Environment variables for service URLs (with defaults for development)
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    project: process.env.PROJECT_SERVICE_URL || 'http://localhost:3003',
    build: process.env.BUILD_SERVICE_URL || 'http://localhost:8080',
    ai: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    realtime: process.env.REALTIME_SERVICE_URL || 'http://localhost:3004', // if needed
};
// Common proxy options
const createServiceProxy = (target, pathRewrite) => {
    // Use 'as any' to bypass strict type checking for the options object
    const options = {
        target,
        changeOrigin: true,
        pathRewrite,
        onProxyReq: (proxyReq, req, res) => {
            // Forward authentication header
            if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
            }
            // Log proxied requests in development
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[API Gateway] Proxying ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
            }
        },
        onError: (err, req, res) => {
            console.error(`Proxy error for ${req.url}:`, err.message);
            res.status(502).json({ error: 'Service unavailable' });
        },
    };
    return (0, http_proxy_middleware_1.createProxyMiddleware)(options);
};
const router = (0, express_1.Router)();
// Health check endpoint (no proxy)
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            auth: SERVICES.auth,
            project: SERVICES.project,
            build: SERVICES.build,
            ai: SERVICES.ai,
        }
    });
});
// Auth service routes
router.use('/auth', createServiceProxy(SERVICES.auth));
// Project service routes (including files)
// All project routes are prefixed with /projects
router.use('/projects', createServiceProxy(SERVICES.project, {
// Optional: rewrite if needed (e.g., remove /api prefix)
// '^/projects': '/projects'
}));
// Build service routes
router.use('/builds', createServiceProxy(SERVICES.build));
// AI service routes
router.use('/ai', createServiceProxy(SERVICES.ai));
// WebSocket upgrade handling for realtime service (if needed)
// This is usually handled separately in the main server, not in the router.
// But we can export a function to handle upgrade.
exports.default = router;
