"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsHandler = exports.metricsMiddleware = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
// Create a Registry to register the metrics
const register = new prom_client_1.default.Registry();
// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'ai-meta-factory-api-gateway',
});
// Enable the collection of default metrics
prom_client_1.default.collectDefaultMetrics({ register });
// Custom metrics
const httpRequestDurationMicroseconds = new prom_client_1.default.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000], // buckets in ms
});
const httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code'],
});
// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
// Middleware to track metrics
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    // Record end of request
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, route } = req;
        const { statusCode } = res;
        // Normalize route path (remove ids to avoid high cardinality)
        let routePath = route?.path || req.path;
        if (routePath.startsWith('/api/projects/') && routePath.split('/').length === 4) {
            routePath = '/api/projects/:id';
        }
        else if (routePath.startsWith('/api/users/') && routePath.split('/').length === 4) {
            routePath = '/api/users/:id';
        }
        // Add more route normalizations as needed
        httpRequestDurationMicroseconds
            .labels(method, routePath, statusCode.toString())
            .observe(duration);
        httpRequestsTotal
            .labels(method, routePath, statusCode.toString())
            .inc();
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
// Endpoint to expose metrics for Prometheus scraping
const metricsHandler = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};
exports.metricsHandler = metricsHandler;
