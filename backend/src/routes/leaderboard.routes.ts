import { Router } from 'express';
import {
  listLeaderboards,
  getLeaderboard,
} from '../controllers/leaderboard.controller';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.get('/', catchAsync(listLeaderboards));
router.get('/:period/:key', catchAsync(getLeaderboard));

export default router;
