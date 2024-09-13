import { NextApiRequest } from 'next';

// Custom NextApiRequest
export interface AuthenticatedNextApiRequest extends NextApiRequest {
    user?: {
        userId: number;
        role: string;
    };
}
