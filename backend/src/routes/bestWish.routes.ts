import { Router } from 'express';
import {
  getCampaignWishes,
  createBestWish,
  getDonationWish,
  updateBestWish,
  deleteBestWish,
} from '../controllers/bestWish.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', getCampaignWishes);
router.post('/donations/:id/wish', requireAuth, createBestWish);
router.get('/donations/:id/wish', getDonationWish);
router.put('/donations/:id/wish', requireAuth, updateBestWish);
router.delete('/donations/:id/wish', requireAuth, deleteBestWish);

export default router;
