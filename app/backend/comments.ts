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

// Middleware for authenticating and authorizing
const authenticateMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    authenticateToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    });
};

// Middleware for role-based authorization
const authorizeMiddleware = (allowedRoles: string[]) => (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Route handler for adding a comment to a task
export const addComment = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req, res, async () => {
        const { taskId, projectId, content } = req.body;

        // Validate input
        if (!taskId || !projectId || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            // Check if the task exists
            const task = await prisma.tasks.findUnique({
                where: { id: taskId },
            });

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            // Create the comment
            const comment = await prisma.comments.create({
                data: {
                    content,
                    task_id: taskId,
                    project_id: projectId,
                    user_id: req.user?.userId || 0, // Provide fallback value if needed
                },
            });

            res.status(201).json({ message: 'Comment added', comment });
        } catch (error) {
            res.status(500).json({ message: 'Error adding comment', error });
        }
    });
};


// Route handler for updating a comment
export const updateComment = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req, res, async () => {
        const { commentId, content } = req.body;

        try {
            const comment = await prisma.comments.findUnique({
                where: { id: commentId },
            });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Only allow the user who created the comment to update it
            if (comment.user_id !== req.user?.userId) {
                return res.status(403).json({ message: 'Not allowed to update this comment' });
            }

            const updatedComment = await prisma.comments.update({
                where: { id: commentId },
                data: { content },
            });

            res.status(200).json({ message: 'Comment updated', updatedComment });
        } catch (error) {
            res.status(500).json({ message: 'Error updating comment', error });
        }
    });
};

// Route handler for deleting a comment
export const deleteComment = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req, res, async () => {
        const { commentId } = req.body;

        try {
            const comment = await prisma.comments.findUnique({
                where: { id: commentId },
            });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Only allow the user who created the comment or an admin to delete it
            if (comment.user_id !== req.user?.userId && req.user?.role !== 'admin') {
                return res.status(403).json({ message: 'Not allowed to delete this comment' });
            }

            await prisma.comments.delete({
                where: { id: commentId },
            });

            res.status(200).json({ message: 'Comment deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting comment', error });
        }
    });
};

// Route handler for fetching comments for a task
export const getComments = async (req: CustomRequest, res: Response) => {
    authenticateMiddleware(req, res, async () => {
        const { taskId } = req.params;

        try {
            const task = await prisma.tasks.findUnique({
                where: { id: parseInt(taskId) },
            });

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            const comments = await prisma.comments.findMany({
                where: { task_id: task.id },
                include: {
                    users: true,  // Include the user details who created the comment
                },
            });

            res.status(200).json({ comments });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching comments', error });
        }
    });
};
