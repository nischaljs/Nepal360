import { Router } from 'express';
import { getAnalytics } from '../controllers/admin.analytics.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', catchAsync(getAnalytics));

export default router;
