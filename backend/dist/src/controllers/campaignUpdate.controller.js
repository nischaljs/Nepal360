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
exports.deleteCampaignUpdate = exports.updateCampaignUpdate = exports.createCampaignUpdate = exports.getCampaignUpdate = exports.getCampaignUpdates = void 0;
const errohandler_middleware_js_1 = require("../middlewares/errohandler.middleware.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const prisma_js_1 = require("../lib/prisma.js");
exports.getCampaignUpdates = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: campaignId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const [updates, total] = yield Promise.all([
        prisma_js_1.prisma.campaignUpdate.findMany({
            where: { campaignId },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma_js_1.prisma.campaignUpdate.count({ where: { campaignId } }),
    ]);
    res.json({
        success: true,
        data: {
            updates,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
    });
}));
exports.getCampaignUpdate = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { updateId } = req.params;
    const update = yield prisma_js_1.prisma.campaignUpdate.findUnique({
        where: { id: updateId },
        include: {
            user: { select: { id: true, name: true } },
            campaign: { select: { id: true, title: true, beneficiaryId: true } },
        },
    });
    if (!update) {
        return res.status(404).json({ success: false, message: 'Update not found' });
    }
    res.json({ success: true, data: update });
}));
exports.createCampaignUpdate = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: campaignId } = req.params;
    const { title, content, images, isMilestone } = req.body;
    const user = (0, auth_middleware_js_1.authMiddleware)(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Please login to create updates' });
    }
    const campaign = yield prisma_js_1.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { beneficiaryId: true },
    });
    if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (campaign.beneficiaryId !== user.userId) {
        return res.status(403).json({ success: false, message: 'Only the campaign owner can create updates' });
    }
    const update = yield prisma_js_1.prisma.campaignUpdate.create({
        data: {
            campaignId,
            userId: user.userId,
            title,
            content,
            images: JSON.stringify(images || []),
            isMilestone: isMilestone || false,
        },
        include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: update });
}));
exports.updateCampaignUpdate = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { updateId } = req.params;
    const { title, content, images, isMilestone } = req.body;
    const user = (0, auth_middleware_js_1.authMiddleware)(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Please login' });
    }
    const existingUpdate = yield prisma_js_1.prisma.campaignUpdate.findUnique({
        where: { id: updateId },
        include: { campaign: true },
    });
    if (!existingUpdate) {
        return res.status(404).json({ success: false, message: 'Update not found' });
    }
    if (existingUpdate.userId !== user.userId) {
        return res.status(403).json({ success: false, message: 'You can only edit your own updates' });
    }
    const update = yield prisma_js_1.prisma.campaignUpdate.update({
        where: { id: updateId },
        data: {
            title: title || existingUpdate.title,
            content: content || existingUpdate.content,
            images: images ? JSON.stringify(images) : existingUpdate.images,
            isMilestone: isMilestone !== undefined ? isMilestone : existingUpdate.isMilestone,
        },
        include: { user: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: update });
}));
exports.deleteCampaignUpdate = (0, errohandler_middleware_js_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { updateId } = req.params;
    const user = (0, auth_middleware_js_1.authMiddleware)(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Please login' });
    }
    const existingUpdate = yield prisma_js_1.prisma.campaignUpdate.findUnique({
        where: { id: updateId },
    });
    if (!existingUpdate) {
        return res.status(404).json({ success: false, message: 'Update not found' });
    }
    if (existingUpdate.userId !== user.userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own updates' });
    }
    yield prisma_js_1.prisma.campaignUpdate.delete({ where: { id: updateId } });
    res.json({ success: true, message: 'Update deleted successfully' });
}));
