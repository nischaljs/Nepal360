import { Router } from 'express';
import {
  submitKyc,
  getMyKycStatus,
  resubmitKyc,
} from '../controllers/kyc.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth);

router.post('/submit', catchAsync(submitKyc));
router.get('/me', catchAsync(getMyKycStatus));
router.put('/resubmit', catchAsync(resubmitKyc));

export default router;
