"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
// Temporary auth middleware – sets a demo user ID on the request
const authMiddleware = (req, res, next) => {
    // For testing, attach a fixed user ID (you can pass it via header if needed)
    req.user = { id: req.headers['x-user-id'] || 'demo-user-id' };
    next();
};
exports.authMiddleware = authMiddleware;
