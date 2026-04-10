"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donation_controller_1 = require("../controllers/donation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const itemDonation_routes_1 = __importDefault(require("./itemDonation.routes"));
const router = (0, express_1.Router)();
router.post('/money/khalti/initiate', auth_middleware_1.requireAuth, rateLimit_middleware_1.paymentLimiter, (0, errohandler_middleware_1.catchAsync)(donation_controller_1.initiateKhaltiPayment));
router.post('/money/khalti/verify', auth_middleware_1.requireAuth, rateLimit_middleware_1.paymentLimiter, (0, errohandler_middleware_1.catchAsync)(donation_controller_1.verifyKhaltiPayment));
router.get('/money/me', auth_middleware_1.requireAuth, (0, errohandler_middleware_1.catchAsync)(donation_controller_1.getMyMoneyDonations));
// This is the server-to-server callback from Khalti, so it does not have user authentication
router.post('/money/khalti/callback', (0, errohandler_middleware_1.catchAsync)(donation_controller_1.handleKhaltiCallback));
// Routes for item donations
router.use('/items', itemDonation_routes_1.default);
exports.default = router;
