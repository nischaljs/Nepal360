/**
 * Dev-only routes — never mounted in production
 */
import { Router, Request, Response } from 'express';
import { getOTPForTesting } from '../utils/otp';

const router = Router();

router.get('/otp/:email', (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    const otp = getOTPForTesting(req.params.email);
    res.json({ otp });
});

export default router;
