import express from 'express';
import authRoutes from './auth.routes';
import campaignRoutes from './campaign.routes';
import adminRoutes from './admin.routes';
import kycRoutes from './kyc.routes';
import donationRoutes from './donation.routes';
import userRoutes from './user.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/admin', adminRoutes);
router.use('/kyc', kycRoutes);
router.use('/donations', donationRoutes);
router.use('/users', userRoutes);
router.use('/leaderboards', leaderboardRoutes);

export default router;
