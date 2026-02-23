import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.get('/', requireAuth, catchAsync(getNotifications));
router.get('/unread-count', requireAuth, catchAsync(getUnreadCount));
router.put('/read-all', requireAuth, catchAsync(markAllAsRead));
router.put('/:id/read', requireAuth, catchAsync(markAsRead));

export default router;
