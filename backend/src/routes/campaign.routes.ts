import { Router, Request, Response, NextFunction } from 'express';
import {
    createCampaign,
    getMyCampaigns,
    getCampaignById,
    updateCampaign,
    addMilestone,
    deleteMilestone,
    getCampaignStats,
    getAllCampaigns,
    getCampaignPublic,
} from '../controllers/campaign/campaign.controller';
import { incrementVisitCount } from '../controllers/campaign/visit.controller';
import { incrementShareCount } from '../controllers/campaign/share.controller';
import { getCampaignDonors } from '../controllers/donation.controller';

import {
    requireAuth,
    requireVerifiedEmail,
    requireApprovedKYC,
} from '../middlewares/auth.middleware';
import { createCampaignUpload } from '../config/multer';
import { AuthenticatedRequest } from '../types/auth.types';

const router = Router();

// Public routes
router.get('/', getAllCampaigns);
router.get('/public/:id', getCampaignPublic);
router.post('/public/:id/visit', incrementVisitCount);
router.post('/public/:id/share', incrementShareCount);
router.get('/:id/stats', getCampaignStats);
router.get('/:id/donors', getCampaignDonors); // New route for campaign donors

// Apply authentication middlewares to all routes
router.use(requireAuth, requireVerifiedEmail, requireApprovedKYC);



/**
 * Middleware to dynamically create upload handler based on campaign ID
 * For create endpoint, we don't have campaignId yet, so we use a temporary directory
 */
const createUploadMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // For creation, use a temporary ID that will be replaced after campaign is created
    const uploadHandler = createCampaignUpload('temp');
    uploadHandler(req, res, next);
};

// Campaign endpoints
router.post('/', createUploadMiddleware, createCampaign);
router.get('/me', getMyCampaigns);
router.get('/me/:id', getCampaignById);
router.put('/:id', updateCampaign);

// Milestone endpoints
router.post('/:id/milestones', addMilestone);
router.delete('/:id/milestones/:milestoneId', deleteMilestone);

export default router;
