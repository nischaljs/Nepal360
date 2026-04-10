"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarCampaignsHandler = exports.getRecommendationsHandler = exports.predictSuccess = void 0;
const index_js_1 = require("../ai/prediction/index.js");
const index_js_2 = require("../ai/recommendations/index.js");
const errohandler_middleware_js_1 = require("../middlewares/errohandler.middleware.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const prisma_js_1 = require("../lib/prisma.js");
exports.predictSuccess = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, targetAmount, category, hasCoverImage, campaignId } = req.body;
    let result;
    if (campaignId) {
        result = yield (0, index_js_1.predictExistingCampaign)(campaignId, prisma_js_1.prisma);
    }
    else {
        result = yield (0, index_js_1.predictCampaignSuccess)({
            title,
            description,
            targetAmount: targetAmount ? Number(targetAmount) : undefined,
            category,
            hasCoverImage,
        }, prisma_js_1.prisma);
    }
    if (!result) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, data: result });
}));
exports.getRecommendationsHandler = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, auth_middleware_js_1.authMiddleware)(req);
    const userId = user === null || user === void 0 ? void 0 : user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const excludeDonated = req.query.excludeDonated !== 'false';
    const recommendations = yield (0, index_js_2.getRecommendations)({ userId, limit, excludeDonated }, prisma_js_1.prisma);
    res.json({ success: true, data: recommendations });
}));
exports.getSimilarCampaignsHandler = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const similarCampaigns = yield (0, index_js_2.getSimilarCampaigns)(campaignId, limit, prisma_js_1.prisma);
    res.json({ success: true, data: similarCampaigns });
}));
