"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("../controllers/campaign/campaign.controller");
const visit_controller_1 = require("../controllers/campaign/visit.controller");
const share_controller_1 = require("../controllers/campaign/share.controller");
const donation_controller_1 = require("../controllers/donation.controller");
const analytics_controller_1 = require("../controllers/campaign/analytics.controller");
const admin_milestone_controller_1 = require("../controllers/admin.milestone.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// Public routes
router.get('/', campaign_controller_1.getAllCampaigns);
router.get('/public/:id', campaign_controller_1.getCampaignPublic);
router.post('/public/:id/visit', visit_controller_1.incrementVisitCount);
router.post('/public/:id/share', share_controller_1.incrementShareCount);
router.get('/:id/stats', campaign_controller_1.getCampaignStats);
router.get('/:id/donors', donation_controller_1.getCampaignDonors);
router.get('/:id/analytics', auth_middleware_1.requireAuth, (0, errohandler_middleware_1.catchAsync)(analytics_controller_1.getCampaignAnalytics));
// Apply authentication middlewares to all routes
router.use(auth_middleware_1.requireAuth, auth_middleware_1.requireVerifiedEmail, auth_middleware_1.requireApprovedKYC);
/**
 * Middleware to dynamically create upload handler based on campaign ID
 * For create endpoint, we don't have campaignId yet, so we use a temporary directory
 */
const createUploadMiddleware = (req, res, next) => {
    // For creation, use a temporary ID that will be replaced after campaign is created
    const uploadHandler = (0, multer_1.createCampaignUpload)('temp');
    uploadHandler(req, res, next);
};
// Campaign endpoints
router.post('/', createUploadMiddleware, campaign_controller_1.createCampaign);
router.get('/me', campaign_controller_1.getMyCampaigns);
router.get('/me/:id', campaign_controller_1.getCampaignById);
router.put('/:id', campaign_controller_1.updateCampaign);
// Milestone endpoints
router.post('/:id/milestones', campaign_controller_1.addMilestone);
router.delete('/:id/milestones/:milestoneId', campaign_controller_1.deleteMilestone);
router.post('/milestones/:id/claim', (0, errohandler_middleware_1.catchAsync)(admin_milestone_controller_1.claimMilestone));
exports.default = router;
