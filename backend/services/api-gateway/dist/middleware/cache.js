"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheMiddleware = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const crypto_1 = __importDefault(require("crypto"));
// Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new ioredis_1.default(redisUrl);
// Default TTL in seconds (e.g., 5 minutes)
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '300', 10);
/**
 * Generate cache key from request (method + path + query + body)
 */
const generateCacheKey = (req) => {
    const data = {
        method: req.method,
        path: req.originalUrl || req.url,
        query: req.query,
        body: req.body, // careful with large bodies
    };
    const hash = crypto_1.default.createHash('md5').update(JSON.stringify(data)).digest('hex');
    return `cache:${hash}`;
};
/**
 * Middleware to cache responses for GET requests.
 * Only caches successful (2xx) responses.
 * Adds `X-Cache` header: HIT or MISS.
 */
const cacheMiddleware = (ttl = DEFAULT_TTL) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        const key = generateCacheKey(req);
        try {
            // Try to get cached response
            const cached = await redis.get(key);
            if (cached) {
                const parsed = JSON.parse(cached);
                // Set headers and send cached response
                res.setHeader('X-Cache', 'HIT');
                return res.status(parsed.status).set(parsed.headers).send(parsed.body);
            }
            // Override res.send to store response in cache
            const originalSend = res.send;
            res.send = function (body) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const responseData = {
                        status: res.statusCode,
                        headers: res.getHeaders(),
                        body: body,
                    };
                    // Store in Redis with TTL
                    redis.setex(key, ttl, JSON.stringify(responseData)).catch(err => {
                        console.error('Redis cache set error:', err);
                    });
                }
                // Set cache miss header
                res.setHeader('X-Cache', 'MISS');
                return originalSend.call(this, body);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            // If Redis fails, proceed without caching
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
/**
 * Function to clear cache for a specific pattern (e.g., after updates).
 * @param pattern - Redis key pattern (e.g., 'cache:*')
 */
const clearCache = async (pattern = 'cache:*') => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    catch (error) {
        console.error('Failed to clear cache:', error);
    }
};
exports.clearCache = clearCache;
exports.default = exports.cacheMiddleware;
