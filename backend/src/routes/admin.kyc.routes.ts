import { Router } from 'express';
import {
  listKycProfiles,
  getKycDetail,
  approveKyc,
  rejectKyc,
} from '../controllers/admin.kyc.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', catchAsync(listKycProfiles));
router.get('/:userId', catchAsync(getKycDetail));
router.post('/:userId/approve', catchAsync(approveKyc));
router.post('/:userId/reject', catchAsync(rejectKyc));

export default router;
