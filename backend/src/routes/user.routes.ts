import { Router } from 'express';
import {
  getMyStats,
  getUserStats,
  getMyBadges,
  getMyDonationHistory,
} from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.get('/me/stats', requireAuth, catchAsync(getMyStats));
router.get('/me/badges', requireAuth, catchAsync(getMyBadges));
router.get('/me/donations', requireAuth, catchAsync(getMyDonationHistory));
router.get('/:userId/stats', catchAsync(getUserStats));

export default router;
