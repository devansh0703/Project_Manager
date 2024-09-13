import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './backend/database';

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.status(200).json({ token });
};

export default login;
