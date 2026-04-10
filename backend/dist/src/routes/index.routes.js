"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dev_routes_1 = __importDefault(require("./dev.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const campaign_routes_1 = __importDefault(require("./campaign.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const kyc_routes_1 = __importDefault(require("./kyc.routes"));
const donation_routes_1 = __importDefault(require("./donation.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const leaderboard_routes_1 = __importDefault(require("./leaderboard.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const campaignUpdate_routes_1 = __importDefault(require("./campaignUpdate.routes"));
const bestWish_routes_1 = __importDefault(require("./bestWish.routes"));
const recurringDonation_routes_1 = __importDefault(require("./recurringDonation.routes"));
const admin_milestone_routes_1 = __importDefault(require("./admin.milestone.routes"));
const bookmark_routes_1 = __importDefault(require("./bookmark.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const export_routes_1 = __importDefault(require("./export.routes"));
const sse_routes_1 = __importDefault(require("./sse.routes"));
const map_routes_1 = __importDefault(require("./map.routes"));
const certificate_routes_1 = __importDefault(require("./certificate.routes"));
const activity_routes_1 = __importDefault(require("./activity.routes"));
const prediction_routes_1 = __importDefault(require("./prediction.routes"));
const router = express_1.default.Router();
router.use('/auth', auth_routes_1.default);
router.use('/campaigns', campaign_routes_1.default);
router.use('/campaigns', campaignUpdate_routes_1.default); // Nested under campaigns
router.use('/campaigns', bestWish_routes_1.default); // Nested under campaigns (wishes endpoint)
router.use('/admin', admin_routes_1.default);
router.use('/kyc', kyc_routes_1.default);
router.use('/donations', donation_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/leaderboards', leaderboard_routes_1.default);
router.use('/ai', ai_routes_1.default);
router.use('/recurring-donations', recurringDonation_routes_1.default);
router.use('/admin', admin_milestone_routes_1.default);
router.use('/bookmarks', bookmark_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/comments', comment_routes_1.default);
router.use('/export', export_routes_1.default);
router.use('/sse', sse_routes_1.default);
router.use('/map', map_routes_1.default);
router.use('/certificates', certificate_routes_1.default);
router.use('/activity', activity_routes_1.default);
router.use('/predictions', prediction_routes_1.default);
if (process.env.NODE_ENV !== 'production') {
    router.use('/dev', dev_routes_1.default);
}
exports.default = router;
