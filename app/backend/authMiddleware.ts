import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Define a custom type to extend Express Request
interface CustomRequest extends Request {
    user?: {
        userId: number;
        role: string;
    };
}

// JWT Authentication Middleware
export function authenticateToken(req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Role-based Access Control Middleware
export function authorizeRoles(...allowedRoles: string[]) {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
}
