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
export const createProject = async (req: CustomRequest, res: Response) => {
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

export const updateProject = async (req: CustomRequest, res: Response)=>{
    authenticateMiddleware(req, res, async ()=>{
        authorizeMiddleware(['project manager'])(req, res, async ()=>{
            const { id, name, description } = req.body;

        try {
            const project = await prisma.projects.update({
                where: { id },
                data: { name, description }
            });
            res.status(200).json({ message: 'Project updated', project });
        } catch (error) {
            res.status(500).json({ message: 'Error updating project', error });
        }
        });
    });
};


export const deleteProject = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req,res,async()=>{
        authorizeMiddleware(['project_manager'])(req, res, async () => {
            const { id } = req.body;

        try {
            await prisma.projects.delete({
                where: { id }
            });
            res.status(200).json({ message: 'Project deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting project', error });
        }
    });
    });
};

// Fetch Projects
export const getProjects = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req,res,async()=>{
    authorizeMiddleware(['project_manager', 'member', 'viewer'])(req, res, async () => {

        try {
            const projects = await prisma.projects.findMany({
                where: {
                    OR: [
                        { owner_id: req.user?.userId },
                        { project_members: { some: { user_id: req.user?.userId } } }
                    ]
                }
            });
            res.status(200).json({ projects });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching projects', error });
        }
    });
    });
};
