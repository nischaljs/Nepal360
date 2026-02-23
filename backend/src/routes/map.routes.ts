import { Router } from 'express';
import { getCampaignMapData, getDistrictList } from '../controllers/map.controller';

const router = Router();

router.get('/campaigns', getCampaignMapData);
router.get('/districts', getDistrictList);

export default router;
