import { Router } from 'express';
import {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  handleKhaltiCallback,
  getMyMoneyDonations,
} from '../controllers/donation.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';
import { paymentLimiter } from '../middlewares/rateLimit.middleware';
import itemDonationRoutes from './itemDonation.routes';

const router = Router();

router.post(
  '/money/khalti/initiate',
  requireAuth,
  paymentLimiter,
  catchAsync(initiateKhaltiPayment)
);
router.post(
  '/money/khalti/verify',
  requireAuth,
  paymentLimiter,
  catchAsync(verifyKhaltiPayment)
);
router.get('/money/me', requireAuth, catchAsync(getMyMoneyDonations));

// This is the server-to-server callback from Khalti, so it does not have user authentication
router.post('/money/khalti/callback', catchAsync(handleKhaltiCallback));

// Routes for item donations
router.use('/items', itemDonationRoutes);

export default router;
