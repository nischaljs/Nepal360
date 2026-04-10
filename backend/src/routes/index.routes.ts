import express from 'express';
import devRoutes from './dev.routes';
import authRoutes from './auth.routes';
import campaignRoutes from './campaign.routes';
import adminRoutes from './admin.routes';
import kycRoutes from './kyc.routes';
import donationRoutes from './donation.routes';
import userRoutes from './user.routes';
import leaderboardRoutes from './leaderboard.routes';
import aiRoutes from './ai.routes';
import campaignUpdateRoutes from './campaignUpdate.routes';
import bestWishRoutes from './bestWish.routes';
import recurringDonationRoutes from './recurringDonation.routes';
import adminMilestoneRoutes from './admin.milestone.routes';
import bookmarkRoutes from './bookmark.routes';
import notificationRoutes from './notification.routes';
import commentRoutes from './comment.routes';
import exportRoutes from './export.routes';
import sseRoutes from './sse.routes';
import mapRoutes from './map.routes';
import certificateRoutes from './certificate.routes';
import activityRoutes from './activity.routes';
import predictionRoutes from './prediction.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/campaigns', campaignUpdateRoutes); // Nested under campaigns
router.use('/campaigns', bestWishRoutes); // Nested under campaigns (wishes endpoint)
router.use('/admin', adminRoutes);
router.use('/kyc', kycRoutes);
router.use('/donations', donationRoutes);
router.use('/users', userRoutes);
router.use('/leaderboards', leaderboardRoutes);
router.use('/ai', aiRoutes);
router.use('/recurring-donations', recurringDonationRoutes);
router.use('/admin', adminMilestoneRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/notifications', notificationRoutes);
router.use('/comments', commentRoutes);
router.use('/export', exportRoutes);
router.use('/sse', sseRoutes);
router.use('/map', mapRoutes);
router.use('/certificates', certificateRoutes);
router.use('/activity', activityRoutes);
router.use('/predictions', predictionRoutes);
if (process.env.NODE_ENV !== 'production') {
    router.use('/dev', devRoutes);
}

export default router;
