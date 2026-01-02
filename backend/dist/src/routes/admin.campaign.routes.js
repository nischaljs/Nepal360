"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_campaign_controller_1 = require("../controllers/admin.campaign.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply admin middleware to all routes
router.use(auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin);
/**
 * ==================== LIST & READ ====================
 */
/**
 * GET /api/admin/campaigns
 * List all campaigns with optional filters
 * Query params: status, beneficiaryId, isActive, sortBy, order
 */
router.get('/', admin_campaign_controller_1.listCampaigns);
/**
 * GET /api/admin/campaigns/verification-queue
 * Get campaigns awaiting verification (convenience endpoint)
 */
router.get('/verification-queue', admin_campaign_controller_1.getVerificationQueue);
/**
 * GET /api/admin/campaigns/:campaignId
 * Get single campaign detail
 */
router.get('/:campaignId', admin_campaign_controller_1.getCampaignDetail);
/**
 * GET /api/admin/campaigns/:campaignId/stats
 * Get campaign statistics and metrics
 */
router.get('/:campaignId/stats', admin_campaign_controller_1.getCampaignStats);
/**
 * ==================== VERIFICATION ====================
 */
/**
 * POST /api/admin/campaigns/:campaignId/approve
 * Approve campaign (PENDING_VERIFICATION → LIVE)
 */
router.post('/:campaignId/approve', admin_campaign_controller_1.approveCampaign);
/**
 * POST /api/admin/campaigns/:campaignId/reject
 * Reject campaign (PENDING_VERIFICATION stays as is with reason)
 */
router.post('/:campaignId/reject', admin_campaign_controller_1.rejectCampaign);
/**
 * ==================== MODERATION ====================
 */
/**
 * POST /api/admin/campaigns/:campaignId/suspend
 * Suspend campaign (any status → SUSPENDED)
 */
router.post('/:campaignId/suspend', admin_campaign_controller_1.suspendCampaign);
/**
 * POST /api/admin/campaigns/:campaignId/resume
 * Resume campaign (SUSPENDED → LIVE)
 */
router.post('/:campaignId/resume', admin_campaign_controller_1.resumeCampaign);
/**
 * POST /api/admin/campaigns/:campaignId/complete
 * Mark campaign as COMPLETED
 */
router.post('/:campaignId/complete', admin_campaign_controller_1.completeCampaign);
/**
 * ==================== DELETION (SOFT DELETE) ====================
 */
/**
 * DELETE /api/admin/campaigns/:campaignId
 * Soft delete campaign (mark isActive = false, deletedAt = now)
 * Only allowed if status != LIVE and donationCount = 0
 */
router.delete('/:campaignId', admin_campaign_controller_1.deleteCampaign);
exports.default = router;
