import rateLimit from 'express-rate-limit';
import { rateLimiterLog } from '../utils/logger.js';
export const authenticationApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    handler: async(req, res, next, options) => {

        await rateLimiterLog(req);
        
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: options.windowMs / 1000,
            message: 'Too many requests, please try again after 5 minutes.',
        });
    },
});
