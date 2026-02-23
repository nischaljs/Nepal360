import { Router } from 'express';
import { exportMyDonations } from '../controllers/export.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.get('/donations', requireAuth, catchAsync(exportMyDonations));

export default router;
