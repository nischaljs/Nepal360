import { Router } from 'express';
import {
  createRecurring,
  getMyRecurring,
  pauseRecurring,
  resumeRecurring,
  cancelRecurring,
  getDueRecurring,
} from '../controllers/recurringDonation.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.post('/', requireAuth, catchAsync(createRecurring));
router.get('/me', requireAuth, catchAsync(getMyRecurring));
router.patch('/:id/pause', requireAuth, catchAsync(pauseRecurring));
router.patch('/:id/resume', requireAuth, catchAsync(resumeRecurring));
router.patch('/:id/cancel', requireAuth, catchAsync(cancelRecurring));
router.get('/due', requireAuth, requireAdmin, catchAsync(getDueRecurring));

export default router;
