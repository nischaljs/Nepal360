"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Dev-only routes — never mounted in production
 */
const express_1 = require("express");
const otp_1 = require("../utils/otp");
const router = (0, express_1.Router)();
router.get('/otp/:email', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    const otp = (0, otp_1.getOTPForTesting)(req.params.email);
    res.json({ otp });
});
exports.default = router;
