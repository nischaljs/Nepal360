import { Router } from 'express';
import adminCampaignRoutes from './admin.campaign.routes';

const router = Router();

/**
 * Admin routes
 * Base: /api/admin
 */
router.use('/campaigns', adminCampaignRoutes);

export default router;
