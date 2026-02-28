import { Router } from 'express';
import {
  getOverviewReport,
  getCampaignReports,
  getUserAnalytics,
  getCollectionReport,
} from '../controllers/admin.reports.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/overview', catchAsync(getOverviewReport));
router.get('/campaigns', catchAsync(getCampaignReports));
router.get('/users', catchAsync(getUserAnalytics));
router.get('/collections', catchAsync(getCollectionReport));

export default router;
