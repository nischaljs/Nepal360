import express, { Request, Response } from 'express';
import { signup, verifyEmail, login, getCurrentUser } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';
import { AuthenticatedRequest } from '../types/auth.types';

const router = express.Router();

router.post(
    '/signup',
    catchAsync(async (req: Request, res: Response) => {
        const result = await signup(req.body);
        res.status(result.status).json(result.body);
    })
);

router.post(
    '/verify-email',
    catchAsync(async (req: Request, res: Response) => {
        const result = await verifyEmail(req.body);
        res.status(result.status).json(result.body);
    })
);

router.post(
    '/login',
    catchAsync(async (req: Request, res: Response) => {
        const result = await login(req.body);
        res.status(result.status).json(result.body);
    })
);

router.get(
    '/me',
    requireAuth,
    catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const user = await getCurrentUser(req.user!.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, user });
    })
);

export default router;
