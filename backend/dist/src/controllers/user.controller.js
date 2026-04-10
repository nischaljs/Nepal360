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
exports.getMyDonationHistory = exports.getMyImpact = exports.getUserStats = exports.getMyBadges = exports.getMyStats = void 0;
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
        res.status(200).json({ success: true, data: stats });
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
        res.status(200).json({ success: true, data: userBadges });
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
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserStats = getUserStats;
const getMyImpact = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const [moneyDonations, itemDonations, badgeCount, allDonorStats,] = yield Promise.all([
            prisma_1.prisma.moneyDonation.findMany({
                where: { donorId: userId, status: 'COMPLETED' },
                include: { campaign: { select: { id: true, title: true, category: true } } },
            }),
            prisma_1.prisma.itemDonation.findMany({
                where: { donorId: userId },
            }),
            prisma_1.prisma.userBadge.count({ where: { userId } }),
            prisma_1.prisma.donorStats.findMany({
                orderBy: { totalMoneyDonated: 'desc' },
                select: { userId: true },
            }),
        ]);
        const totalMoneyDonated = moneyDonations.reduce((sum, d) => sum + Number(d.amount), 0);
        const totalItemsPledged = itemDonations.length;
        const campaignIds = [...new Set(moneyDonations.map((d) => d.campaignId))];
        const campaignsSupported = campaignIds.length;
        const rankIndex = allDonorStats.findIndex((s) => s.userId === userId);
        const donorRank = rankIndex >= 0 ? rankIndex + 1 : allDonorStats.length + 1;
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const monthlyMap = {};
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = 0;
        }
        for (const d of moneyDonations) {
            const created = new Date(d.createdAt);
            if (created >= twelveMonthsAgo) {
                const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
                if (key in monthlyMap)
                    monthlyMap[key] += Number(d.amount);
            }
        }
        const monthlyBreakdown = Object.entries(monthlyMap)
            .map(([key, amount]) => {
            const [year, month] = key.split('-');
            return { month: parseInt(month), year: parseInt(year), amount };
        })
            .sort((a, b) => a.year - b.year || a.month - b.month);
        const categoryMap = {};
        for (const d of moneyDonations) {
            const cat = d.campaign.category || 'general';
            if (!categoryMap[cat])
                categoryMap[cat] = { amount: 0, count: 0 };
            categoryMap[cat].amount += Number(d.amount);
            categoryMap[cat].count += 1;
        }
        const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
            category,
            amount: data.amount,
            count: data.count,
        }));
        const campaignTotals = {};
        for (const d of moneyDonations) {
            const cid = d.campaignId;
            if (!campaignTotals[cid]) {
                campaignTotals[cid] = { campaignId: cid, title: d.campaign.title, totalDonated: 0 };
            }
            campaignTotals[cid].totalDonated += Number(d.amount);
        }
        const topCampaigns = Object.values(campaignTotals)
            .sort((a, b) => b.totalDonated - a.totalDonated)
            .slice(0, 5);
        res.status(200).json({
            success: true,
            data: {
                totalMoneyDonated,
                totalItemsPledged,
                campaignsSupported,
                donorRank,
                badgesEarned: badgeCount,
                monthlyBreakdown,
                categoryBreakdown,
                topCampaigns,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyImpact = getMyImpact;
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
        res.status(200).json({ success: true, data: allDonations });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyDonationHistory = getMyDonationHistory;
