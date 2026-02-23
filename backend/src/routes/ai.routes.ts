import { Router } from 'express';
import {
  predictSuccess,
  getRecommendationsHandler,
  getSimilarCampaignsHandler,
} from '../controllers/ai.controller.js';

const router = Router();

router.post('/predict-success', predictSuccess);
router.get('/recommendations', getRecommendationsHandler);
router.get('/recommendations/similar/:campaignId', getSimilarCampaignsHandler);

export default router;
