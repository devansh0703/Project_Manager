import { Request, Response, NextFunction } from 'express';
import prisma from './database';
import { authenticateToken, authorizeRoles } from './authMiddleware';

// Define a custom type to extend Express Request
interface CustomRequest extends Request {
    user?: {
        userId: number;
        role: string;
    };
}

// Middleware to handle token authentication
const authenticateMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    authenticateToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    });
};

// Middleware to handle role authorization
const authorizeMiddleware = (allowedRoles: string[]) => (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Route handler for creating a project
const createProject = async (req: CustomRequest, res: Response) => {
    // Authentication Middleware
    authenticateMiddleware(req, res, async () => {
        // Authorization Middleware
        authorizeMiddleware(['project_manager'])(req, res, async () => {
            const { name, description } = req.body;

            try {
                const project = await prisma.projects.create({
                    data: {
                        name,
                        description,
                        owner_id: req.user?.userId || 0 // Fallback to 0 if userId is not available
                    }
                });

                res.status(201).json({ message: 'Project created', project });
            } catch (error) {
                res.status(500).json({ message: 'Error creating project', error });
            }
        });
    });
};

export default createProject;
