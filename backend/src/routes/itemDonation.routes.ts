import { Router } from 'express';
import {
  pledgeItemDonation,
  getMyItemDonations,
  getItemDonationById,
  getCampaignItemDonations,
  updateItemDonation,
} from '../controllers/itemDonation.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.get('/campaign/:campaignId', catchAsync(getCampaignItemDonations));
router.get('/me', requireAuth, catchAsync(getMyItemDonations));
router.get('/:id', catchAsync(getItemDonationById));
router.post('/', requireAuth, catchAsync(pledgeItemDonation));
router.put('/:id', requireAuth, catchAsync(updateItemDonation));

export default router;
