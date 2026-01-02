import { Router } from 'express';
import { grantBadge } from '../controllers/admin.badge.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.post('/grant', catchAsync(grantBadge));

export default router;
