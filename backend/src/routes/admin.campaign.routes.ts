import { Router } from 'express';
import {
    listCampaigns,
    getCampaignDetail,
    getVerificationQueue,
    approveCampaign,
    rejectCampaign,
    suspendCampaign,
    resumeCampaign,
    deleteCampaign,
    getCampaignStats,
    completeCampaign,
} from '../controllers/admin.campaign.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAuth, requireAdmin);

/**
 * ==================== LIST & READ ====================
 */

/**
 * GET /api/admin/campaigns
 * List all campaigns with optional filters
 * Query params: status, beneficiaryId, isActive, sortBy, order
 */
router.get('/', listCampaigns);

/**
 * GET /api/admin/campaigns/verification-queue
 * Get campaigns awaiting verification (convenience endpoint)
 */
router.get('/verification-queue', getVerificationQueue);

/**
 * GET /api/admin/campaigns/:campaignId
 * Get single campaign detail
 */
router.get('/:campaignId', getCampaignDetail);

/**
 * GET /api/admin/campaigns/:campaignId/stats
 * Get campaign statistics and metrics
 */
router.get('/:campaignId/stats', getCampaignStats);

/**
 * ==================== VERIFICATION ====================
 */

/**
 * POST /api/admin/campaigns/:campaignId/approve
 * Approve campaign (PENDING_VERIFICATION → LIVE)
 */
router.post('/:campaignId/approve', approveCampaign);

/**
 * POST /api/admin/campaigns/:campaignId/reject
 * Reject campaign (PENDING_VERIFICATION stays as is with reason)
 */
router.post('/:campaignId/reject', rejectCampaign);

/**
 * ==================== MODERATION ====================
 */

/**
 * POST /api/admin/campaigns/:campaignId/suspend
 * Suspend campaign (any status → SUSPENDED)
 */
router.post('/:campaignId/suspend', suspendCampaign);

/**
 * POST /api/admin/campaigns/:campaignId/resume
 * Resume campaign (SUSPENDED → LIVE)
 */
router.post('/:campaignId/resume', resumeCampaign);

/**
 * POST /api/admin/campaigns/:campaignId/complete
 * Mark campaign as COMPLETED
 */
router.post('/:campaignId/complete', completeCampaign);

/**
 * ==================== DELETION (SOFT DELETE) ====================
 */

/**
 * DELETE /api/admin/campaigns/:campaignId
 * Soft delete campaign (mark isActive = false, deletedAt = now)
 * Only allowed if status != LIVE and donationCount = 0
 */
router.delete('/:campaignId', deleteCampaign);

export default router;
