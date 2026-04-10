"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_campaign_routes_1 = __importDefault(require("./admin.campaign.routes"));
const admin_kyc_routes_1 = __importDefault(require("./admin.kyc.routes"));
const admin_itemDonation_routes_1 = __importDefault(require("./admin.itemDonation.routes"));
const admin_badge_routes_1 = __importDefault(require("./admin.badge.routes"));
const admin_auditLog_routes_1 = __importDefault(require("./admin.auditLog.routes"));
const admin_analytics_routes_1 = __importDefault(require("./admin.analytics.routes"));
const admin_reports_routes_1 = __importDefault(require("./admin.reports.routes"));
const admin_user_controller_1 = require("../controllers/admin.user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const router = (0, express_1.Router)();
/**
 * Admin routes
 * Base: /api/admin
 */
router.use('/campaigns', admin_campaign_routes_1.default);
router.use('/kyc', admin_kyc_routes_1.default);
router.use('/item-donations', admin_itemDonation_routes_1.default);
router.use('/badges', admin_badge_routes_1.default);
router.use('/audit-logs', admin_auditLog_routes_1.default);
router.use('/analytics', admin_analytics_routes_1.default);
router.use('/reports', admin_reports_routes_1.default);
router.get('/users', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, errohandler_middleware_1.catchAsync)(admin_user_controller_1.listUsers));
exports.default = router;
