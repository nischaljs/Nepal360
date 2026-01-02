import { NextFunction, Router, Response } from 'express'; // Import NextFunction and Response
import {
  submitKyc,
  getMyKycStatus,
  resubmitKyc,
} from '../controllers/kyc.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { catchAsync } from '../middlewares/errohandler.middleware';
import { createKycUpload } from '../config/multer';
import { AuthenticatedRequest } from '../types/auth.types'; // Import AuthenticatedRequest

const router = Router();

router.use(requireAuth); // This runs first and populates req.user

// Helper middleware to dynamically create and run multer
const kycUploadMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'User not authenticated for file upload.' });
    }
    const upload = createKycUpload(req.user.userId);
    upload(req, res, (err: any) => { // Multer's own error handling
        if (err) {
            console.error("Multer error:", err); // Log the Multer error
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.post('/submit', kycUploadMiddleware, catchAsync(submitKyc));
router.get('/me', catchAsync(getMyKycStatus));
router.put('/resubmit', kycUploadMiddleware, catchAsync(resubmitKyc)); // Apply to resubmit as well

export default router;
