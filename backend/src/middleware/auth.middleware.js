import { clerkMiddleware, requireAuth as clerkRequireAuth } from '@clerk/express';

// Export the Clerk middleware for use in server.js
export const clerkAuth = clerkMiddleware();

// Middleware to require authentication
export const requireAuth = (req, res, next) => {
    // TEMPORARY: Mock user for testing (remove when Clerk is properly configured)
    if (process.env.NODE_ENV === 'development') {
        req.userId = 'test-user-123';
        return next();
    }

    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ message: 'Unauthorized - No valid session' });
    }
    req.userId = req.auth.userId;
    next();
};