import { Router } from 'express';
import {
  toggleBookmark,
  getMyBookmarks,
  checkBookmark,
} from '../controllers/bookmark.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/toggle', requireAuth, toggleBookmark);
router.get('/me', requireAuth, getMyBookmarks);
router.get('/check/:campaignId', requireAuth, checkBookmark);

export default router;
