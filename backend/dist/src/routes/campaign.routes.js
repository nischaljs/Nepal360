"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("../controllers/campaign.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// Public routes
router.get('/:id/stats', campaign_controller_1.getCampaignStats);
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
router.get('/:id', campaign_controller_1.getCampaignById);
router.put('/:id', campaign_controller_1.updateCampaign);
// Milestone endpoints
router.post('/:id/milestones', campaign_controller_1.addMilestone);
router.delete('/:id/milestones/:milestoneId', campaign_controller_1.deleteMilestone);
exports.default = router;
