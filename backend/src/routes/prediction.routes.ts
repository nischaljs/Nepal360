import { Router } from 'express';
import { getFundraisingPrediction } from '../controllers/prediction.controller';

const router = Router();
router.get('/:campaignId', getFundraisingPrediction);
export default router;
