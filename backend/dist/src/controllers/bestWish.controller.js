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
exports.deleteBestWish = exports.updateBestWish = exports.getDonationWish = exports.createBestWish = exports.getCampaignWishes = void 0;
const errohandler_middleware_js_1 = require("../middlewares/errohandler.middleware.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const prisma_js_1 = require("../lib/prisma.js");
exports.getCampaignWishes = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: campaignId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const [wishes, total] = yield Promise.all([
        prisma_js_1.prisma.bestWish.findMany({
            where: { campaignId },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma_js_1.prisma.bestWish.count({ where: { campaignId } }),
    ]);
    res.json({
        success: true,
        data: {
            wishes,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
    });
}));
exports.createBestWish = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: donationId } = req.params;
    const { message, cardStyle, isAnonymous } = req.body;
    const user = (0, auth_middleware_js_1.authMiddleware)(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Please login to send best wishes' });
    }
    const donation = yield prisma_js_1.prisma.moneyDonation.findUnique({
        where: { id: donationId },
        include: { campaign: true },
    });
    if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    if (donation.donorId !== user.userId) {
        return res.status(403).json({ success: false, message: 'You can only send wishes for your own donations' });
    }
    const existingWish = yield prisma_js_1.prisma.bestWish.findUnique({ where: { donationId } });
    if (existingWish) {
        return res.status(400).json({ success: false, message: 'A wish has already been sent for this donation' });
    }
    const wish = yield prisma_js_1.prisma.bestWish.create({
        data: {
            donationId,
            userId: user.userId,
            campaignId: donation.campaignId,
            message,
            cardStyle: cardStyle || 'simple',
            isAnonymous: isAnonymous || false,
        },
        include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: wish });
}));
exports.getDonationWish = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: donationId } = req.params;
    const wish = yield prisma_js_1.prisma.bestWish.findUnique({
        where: { donationId },
        include: { user: { select: { id: true, name: true } } },
    });
    if (!wish) {
        return res.status(404).json({ success: false, message: 'Wish not found' });
    }
    res.json({ success: true, data: wish });
}));
exports.updateBestWish = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: donationId } = req.params;
    const { message, cardStyle, isAnonymous } = req.body;
    const user = (0, auth_middleware_js_1.authMiddleware)(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Please login' });
    }
    const existingWish = yield prisma_js_1.prisma.bestWish.findUnique({ where: { donationId } });
    if (!existingWish) {
        return res.status(404).json({ success: false, message: 'Wish not found' });
    }
    if (existingWish.userId !== user.userId) {
        return res.status(403).json({ success: false, message: 'You can only edit your own wishes' });
    }
    const wish = yield prisma_js_1.prisma.bestWish.update({
        where: { donationId },
        data: {
            message: message || existingWish.message,
            cardStyle: cardStyle || existingWish.cardStyle,
            isAnonymous: isAnonymous !== undefined ? isAnonymous : existingWish.isAnonymous,
        },
        include: { user: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: wish });
}));
exports.deleteBestWish = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: donationId } = req.params;
    const user = (0, auth_middleware_js_1.authMiddleware)(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Please login' });
    }
    const existingWish = yield prisma_js_1.prisma.bestWish.findUnique({ where: { donationId } });
    if (!existingWish) {
        return res.status(404).json({ success: false, message: 'Wish not found' });
    }
    if (existingWish.userId !== user.userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own wishes' });
    }
    yield prisma_js_1.prisma.bestWish.delete({ where: { donationId } });
    res.json({ success: true, message: 'Wish deleted successfully' });
}));
