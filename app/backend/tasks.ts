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

// Route handler for creating a task
export const createTask = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req, res, async () => {
        authorizeMiddleware(['project_manager', 'member'])(req, res, async () => {
            const { title, description, project_id, assignee_id, priority, due_date } = req.body;

            try {
                const task = await prisma.tasks.create({
                    data: {
                        title,
                        description,
                        status: 'PENDING', // Assuming default status is PENDING
                        project_id,
                        assignee_id,
                        priority: priority || 'MEDIUM', // Default priority if not provided
                        due_date
                    }
                });

                res.status(201).json({ message: 'Task created', task });
            } catch (error) {
                res.status(500).json({ message: 'Error creating task', error });
            }
        });
    });
};

// Route handler for updating a task
export const updateTask = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req, res, async () => {
        authorizeMiddleware(['project_manager', 'member'])(req, res, async () => {
            const { id, title, description, status, assignee_id, priority, due_date } = req.body;

            try {
                const task = await prisma.tasks.update({
                    where: { id },
                    data: {
                        title,
                        description,
                        status,
                        assignee_id,
                        priority,
                        due_date
                    }
                });

                res.status(200).json({ message: 'Task updated', task });
            } catch (error) {
                res.status(500).json({ message: 'Error updating task', error });
            }
        });
    });
};

// Route handler for deleting a task
export const deleteTask = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req, res, async () => {
        authorizeMiddleware(['project_manager'])(req, res, async () => {
            const { id } = req.body;

            try {
                await prisma.tasks.delete({
                    where: { id }
                });
                res.status(200).json({ message: 'Task deleted' });
            } catch (error) {
                res.status(500).json({ message: 'Error deleting task', error });
            }
        });
    });
};

// Route handler for fetching tasks
export const getTasks = async (req: CustomRequest, res: Response) => {
    authenticateToken(req, res, async () => {
        authorizeRoles('project_manager', 'member', 'viewer')(req, res, async () => {
            try {
                const tasks = await prisma.tasks.findMany({
                    where: {
                        // Fetch tasks where the user is either the assignee or belongs to the project
                        projects: {
                            project_members: {
                                some: {
                                    user_id: req.user?.userId
                                }
                            }
                        }
                    },
                    include: {
                        projects: true,  // Include project information
                        users: true      // Include user (assignee) information
                    }
                });

                res.status(200).json({ tasks });
            } catch (error) {
                res.status(500).json({ message: 'Error fetching tasks', error });
            }
        });
    });
};