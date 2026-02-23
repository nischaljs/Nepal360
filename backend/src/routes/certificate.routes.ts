import { Router } from 'express';
import { generateCertificate } from '../controllers/certificate.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';

const router = Router();

router.get('/:donationId', requireAuth, catchAsync(generateCertificate));

export default router;
