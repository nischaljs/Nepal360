import express from 'express';
import authRoutes from './auth.routes';
import campaignRoutes from './campaign.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/admin', adminRoutes);

export default router;
