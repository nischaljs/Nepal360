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
exports.checkBookmark = exports.getMyBookmarks = exports.toggleBookmark = void 0;
const prisma_1 = require("../lib/prisma");
const campaign_helpers_1 = require("../utils/campaign.helpers");
const toggleBookmark = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { campaignId } = req.body;
        if (!campaignId) {
            return res.status(400).json({ success: false, message: 'campaignId is required' });
        }
        const campaign = yield prisma_1.prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        const existing = yield prisma_1.prisma.bookmark.findUnique({
            where: { userId_campaignId: { userId, campaignId } },
        });
        if (existing) {
            yield prisma_1.prisma.bookmark.delete({
                where: { userId_campaignId: { userId, campaignId } },
            });
            return res.json({ success: true, bookmarked: false });
        }
        yield prisma_1.prisma.bookmark.create({
            data: { userId, campaignId },
        });
        res.status(201).json({ success: true, bookmarked: true });
    }
    catch (error) {
        next(error);
    }
});
exports.toggleBookmark = toggleBookmark;
const getMyBookmarks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const baseUrl = (0, campaign_helpers_1.getBaseUrl)(req);
        const bookmarks = yield prisma_1.prisma.bookmark.findMany({
            where: { userId },
            include: {
                campaign: {
                    include: {
                        beneficiary: { select: { id: true, name: true } },
                        moneyDonations: {
                            where: { status: 'COMPLETED' },
                            select: { amount: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const formatted = bookmarks.map((b) => (Object.assign(Object.assign({}, b), { campaign: Object.assign(Object.assign({}, b.campaign), { coverImage: `${baseUrl}/uploads/${b.campaign.coverImage}`, totalMoneyRaised: b.campaign.moneyDonations.reduce((sum, d) => sum + d.amount.toNumber(), 0), moneyDonations: undefined }) })));
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyBookmarks = getMyBookmarks;
const checkBookmark = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { campaignId } = req.params;
        const existing = yield prisma_1.prisma.bookmark.findUnique({
            where: { userId_campaignId: { userId, campaignId } },
        });
        res.json({ success: true, bookmarked: !!existing });
    }
    catch (error) {
        next(error);
    }
});
exports.checkBookmark = checkBookmark;
