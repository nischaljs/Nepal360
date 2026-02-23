import { Router } from 'express';
import {
  getCampaignUpdates,
  getCampaignUpdate,
  createCampaignUpdate,
  updateCampaignUpdate,
  deleteCampaignUpdate,
} from '../controllers/campaignUpdate.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', getCampaignUpdates);
router.get('/:updateId', getCampaignUpdate);
router.post('/', requireAuth, createCampaignUpdate);
router.put('/:updateId', requireAuth, updateCampaignUpdate);
router.delete('/:updateId', requireAuth, deleteCampaignUpdate);

export default router;
