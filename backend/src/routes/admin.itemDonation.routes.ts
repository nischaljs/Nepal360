import { Router } from 'express';
import {
  listItemDonations,
  confirmItemDonation,
  rejectItemDonation,
} from '../controllers/admin.itemDonation.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', catchAsync(listItemDonations));
router.post('/:id/confirm', catchAsync(confirmItemDonation));
router.post('/:id/reject', catchAsync(rejectItemDonation));

export default router;
