import { Router } from 'express';
import {
  pledgeItemDonation,
  getMyItemDonations,
} from '../controllers/itemDonation.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', catchAsync(pledgeItemDonation));
router.get('/me', catchAsync(getMyItemDonations));

export default router;
