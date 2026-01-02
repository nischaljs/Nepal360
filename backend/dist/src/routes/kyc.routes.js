"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Import NextFunction and Response
const kyc_controller_1 = require("../controllers/kyc.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth); // This runs first and populates req.user
// Helper middleware to dynamically create and run multer
const kycUploadMiddleware = (req, res, next) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'User not authenticated for file upload.' });
    }
    const upload = (0, multer_1.createKycUpload)(req.user.userId);
    upload(req, res, (err) => {
        if (err) {
            console.error("Multer error:", err); // Log the Multer error
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
router.post('/submit', kycUploadMiddleware, (0, errohandler_middleware_1.catchAsync)(kyc_controller_1.submitKyc));
router.get('/me', (0, errohandler_middleware_1.catchAsync)(kyc_controller_1.getMyKycStatus));
router.put('/resubmit', kycUploadMiddleware, (0, errohandler_middleware_1.catchAsync)(kyc_controller_1.resubmitKyc)); // Apply to resubmit as well
exports.default = router;
