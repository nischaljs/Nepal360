import { Router } from 'express';
import adminCampaignRoutes from './admin.campaign.routes';
import adminKycRoutes from './admin.kyc.routes';
import adminItemDonationRoutes from './admin.itemDonation.routes';
import adminBadgeRoutes from './admin.badge.routes';
import adminAuditLogRoutes from './admin.auditLog.routes';
import adminAnalyticsRoutes from './admin.analytics.routes';
import { listUsers } from '../controllers/admin.user.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

/**
 * Admin routes
 * Base: /api/admin
 */
router.use('/campaigns', adminCampaignRoutes);
router.use('/kyc', adminKycRoutes);
router.use('/item-donations', adminItemDonationRoutes);
router.use('/badges', adminBadgeRoutes);
router.use('/audit-logs', adminAuditLogRoutes);
router.use('/analytics', adminAnalyticsRoutes);
router.get('/users', requireAuth, requireAdmin, catchAsync(listUsers));

export default router;
