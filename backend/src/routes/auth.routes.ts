import express, { Request, Response } from 'express';
import { signup, verifyEmail, login, forgotPassword, resetPassword, getCurrentUser, googleLogin } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { AuthenticatedRequest } from '../types/auth.types';

const router = express.Router();

router.post(
    '/signup',
    authLimiter,
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
    authLimiter,
    catchAsync(async (req: Request, res: Response) => {
        const result = await login(req.body);
        res.status(result.status).json(result.body);
    })
);

router.post(
    '/google',
    authLimiter,
    catchAsync(async (req: Request, res: Response) => {
        const result = await googleLogin(req.body);
        res.status(result.status).json(result.body);
    })
);

router.post(
    '/forgot-password',
    authLimiter,
    catchAsync(async (req: Request, res: Response) => {
        const result = await forgotPassword(req.body);
        res.status(result.status).json(result.body);
    })
);

router.post(
    '/reset-password',
    catchAsync(async (req: Request, res: Response) => {
        const result = await resetPassword(req.body);
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
