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
exports.getMyDonationHistory = exports.getUserStats = exports.getMyBadges = exports.getMyStats = void 0;
const prisma_1 = require("../lib/prisma");
const findOrCreateDonorStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    let stats = yield prisma_1.prisma.donorStats.findUnique({
        where: { userId },
    });
    if (!stats) {
        stats = yield prisma_1.prisma.donorStats.create({
            data: { userId },
        });
    }
    return stats;
});
const getMyStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: userId } = req.user;
        const stats = yield findOrCreateDonorStats(userId);
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyStats = getMyStats;
const getMyBadges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: userId } = req.user;
        const userBadges = yield prisma_1.prisma.userBadge.findMany({
            where: { userId },
            include: {
                badge: true,
            },
            orderBy: {
                awardedAt: 'desc',
            },
        });
        res.status(200).json(userBadges);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyBadges = getMyBadges;
const getUserStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const stats = yield findOrCreateDonorStats(userId);
        // For public view, you might want to select a subset of fields
        // but for now, we return the whole object as the model itself is public-safe.
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserStats = getUserStats;
const getMyDonationHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const moneyDonations = yield prisma_1.prisma.moneyDonation.findMany({
            where: { donorId, status: 'COMPLETED' },
            include: { campaign: { select: { id: true, title: true } } },
        });
        const itemDonations = yield prisma_1.prisma.itemDonation.findMany({
            where: { donorId },
            include: { campaign: { select: { id: true, title: true } } },
        });
        const formattedMoneyDonations = moneyDonations.map((d) => (Object.assign({ type: 'Money' }, d)));
        const formattedItemDonations = itemDonations.map((d) => (Object.assign({ type: 'Item' }, d)));
        const allDonations = [...formattedMoneyDonations, ...formattedItemDonations];
        allDonations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        res.status(200).json(allDonations);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyDonationHistory = getMyDonationHistory;
