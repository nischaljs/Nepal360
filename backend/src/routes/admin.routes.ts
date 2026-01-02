import { Router } from 'express';
import adminCampaignRoutes from './admin.campaign.routes';
import adminKycRoutes from './admin.kyc.routes';
import adminItemDonationRoutes from './admin.itemDonation.routes';
import adminBadgeRoutes from './admin.badge.routes';
import adminAuditLogRoutes from './admin.auditLog.routes';

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

export default router;
