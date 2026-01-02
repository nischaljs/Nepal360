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
exports.default = router;
