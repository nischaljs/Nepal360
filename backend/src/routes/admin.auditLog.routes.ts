import { Router } from 'express';
import {
  listAuditLogs,
  getAuditLogsForTarget,
} from '../controllers/admin.auditLog.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', catchAsync(listAuditLogs));
router.get('/:targetType/:targetId', catchAsync(getAuditLogsForTarget));

export default router;
