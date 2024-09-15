import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from './database';

const signup = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
        data: { name, email, password_hash: hashedPassword, role }
    });

    res.status(201).json({ message: 'User registered', user: newUser });
};

export default signup;
