import { Router } from 'express';
import {
  getMilestones,
  releaseFunds,
  rejectMilestone,
} from '../controllers/admin.milestone.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/campaigns/:campaignId/milestones', catchAsync(getMilestones));
router.post('/milestones/:id/release', catchAsync(releaseFunds));
router.post('/milestones/:id/reject', catchAsync(rejectMilestone));

export default router;
