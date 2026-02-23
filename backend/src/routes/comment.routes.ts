import { Router } from 'express';
import {
  getComments,
  addComment,
  deleteComment,
} from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:campaignId', getComments);
router.post('/:campaignId', requireAuth, addComment);
router.delete('/:id', requireAuth, deleteComment);

export default router;
