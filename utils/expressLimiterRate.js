import rateLimit from 'express-rate-limit';
import { rateLimiterLog } from '../utils/logger.js';
export const authenticationApiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10000, // limit each IP to 1000 requests per windowMs, will be change after deploy to 450 - 500
    keyGenerator: (req) => {
        return req.ip;
    },
    handler: async(req, res, next, options) => {

        await rateLimiterLog(req);

        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: options.windowMs / 1000,
            message: 'Too many requests, please try again after 5 minutes.',
        });
    },
});
