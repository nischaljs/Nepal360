import { Router } from 'express';
import {
  listBadges,
  getBadge,
  createBadge,
  updateBadge,
  deleteBadge,
  grantBadge,
} from '../controllers/admin.badge.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', catchAsync(listBadges));
router.get('/:id', catchAsync(getBadge));
router.post('/', catchAsync(createBadge));
router.put('/:id', catchAsync(updateBadge));
router.delete('/:id', catchAsync(deleteBadge));
router.post('/grant', catchAsync(grantBadge));

export default router;
