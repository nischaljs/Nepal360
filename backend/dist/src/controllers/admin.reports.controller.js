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
exports.getCollectionReport = exports.getUserAnalytics = exports.getCampaignReports = exports.getOverviewReport = void 0;
const prisma_1 = require("../lib/prisma");
// ─── Overview Report ───────────────────────────────────────────────
const getOverviewReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // All-time monthly collections
        const allDonations = yield prisma_1.prisma.moneyDonation.findMany({
            where: { status: 'COMPLETED' },
            select: { amount: true, createdAt: true },
        });
        const monthlyMap = new Map();
        for (const d of allDonations) {
            const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(d.amount));
        }
        const monthlyCollections = Array.from(monthlyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, amount]) => {
            const [year, month] = key.split('-').map(Number);
            return { year, month, amount };
        });
        // Cumulative
        let cumulative = 0;
        const cumulativeCollections = monthlyCollections.map((m) => {
            cumulative += m.amount;
            return Object.assign(Object.assign({}, m), { cumulative });
        });
        // Category distribution
        const campaigns = yield prisma_1.prisma.campaign.findMany({
            where: { isActive: true },
            select: {
                category: true,
                moneyDonations: {
                    where: { status: 'COMPLETED' },
                    select: { amount: true },
                },
            },
        });
        const categoryMap = new Map();
        for (const c of campaigns) {
            const raised = c.moneyDonations.reduce((s, d) => s + Number(d.amount), 0);
            categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + raised);
        }
        const categoryDistribution = Array.from(categoryMap.entries()).map(([category, amount]) => ({ category, amount }));
        // Recurring donation summary
        const [activeRecurring, totalRecurringAgg] = yield Promise.all([
            prisma_1.prisma.recurringDonation.count({ where: { status: 'ACTIVE' } }),
            prisma_1.prisma.recurringDonation.aggregate({
                _sum: { totalPaid: true },
                _count: { id: true },
            }),
        ]);
        // Totals
        const totalAllTime = allDonations.reduce((s, d) => s + Number(d.amount), 0);
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = allDonations
            .filter((d) => d.createdAt >= thisMonthStart)
            .reduce((s, d) => s + Number(d.amount), 0);
        const avgDonation = allDonations.length > 0 ? totalAllTime / allDonations.length : 0;
        res.json({
            success: true,
            data: {
                totalAllTime,
                thisMonth,
                activeRecurring,
                avgDonation: Math.round(avgDonation),
                totalRecurringPaid: Number((_a = totalRecurringAgg._sum.totalPaid) !== null && _a !== void 0 ? _a : 0),
                totalRecurringCount: totalRecurringAgg._count.id,
                monthlyCollections: cumulativeCollections,
                categoryDistribution,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getOverviewReport = getOverviewReport;
// ─── Campaign Reports ──────────────────────────────────────────────
const getCampaignReports = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search || '';
        const status = req.query.status;
        const category = req.query.category;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const where = { isActive: true };
        if (search)
            where.title = { contains: search };
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        const [total, campaignList] = yield Promise.all([
            prisma_1.prisma.campaign.count({ where }),
            prisma_1.prisma.campaign.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    category: true,
                    targetAmount: true,
                    donationCount: true,
                    visits: true,
                    shareCount: true,
                    moneyDonations: {
                        where: { status: 'COMPLETED' },
                        select: { amount: true, createdAt: true },
                    },
                },
            }),
        ]);
        const campaigns = campaignList.map((c) => {
            const totalRaised = c.moneyDonations.reduce((s, d) => s + Number(d.amount), 0);
            const target = Number(c.targetAmount);
            const progressPercent = target > 0 ? Math.round((totalRaised / target) * 100) : 0;
            // Monthly breakdown
            const monthMap = new Map();
            for (const d of c.moneyDonations) {
                const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`;
                monthMap.set(key, (monthMap.get(key) || 0) + Number(d.amount));
            }
            const monthlyBreakdown = Array.from(monthMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, amount]) => {
                const [year, month] = key.split('-').map(Number);
                return { year, month, amount };
            });
            return {
                id: c.id,
                title: c.title,
                status: c.status,
                category: c.category,
                target,
                totalRaised,
                progressPercent,
                donations: c.donationCount,
                visits: c.visits,
                shares: c.shareCount,
                monthlyBreakdown,
            };
        });
        // Get distinct categories for filter
        const categories = yield prisma_1.prisma.campaign.findMany({
            where: { isActive: true },
            select: { category: true },
            distinct: ['category'],
        });
        res.json({
            success: true,
            data: {
                campaigns,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                categories: categories.map((c) => c.category),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCampaignReports = getCampaignReports;
// ─── User Analytics ────────────────────────────────────────────────
const getUserAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalUsers, totalDonors] = yield Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.donorStats.count({ where: { donationCount: { gt: 0 } } }),
        ]);
        // User growth by month
        const allUsers = yield prisma_1.prisma.user.findMany({
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const growthMap = new Map();
        for (const u of allUsers) {
            const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
            growthMap.set(key, (growthMap.get(key) || 0) + 1);
        }
        let cumulativeUsers = 0;
        const userGrowth = Array.from(growthMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, newUsers]) => {
            cumulativeUsers += newUsers;
            const [year, month] = key.split('-').map(Number);
            return { year, month, newUsers, cumulative: cumulativeUsers };
        });
        // Donor distribution by donation range
        const donorStats = yield prisma_1.prisma.donorStats.findMany({
            where: { donationCount: { gt: 0 } },
            select: { totalMoneyDonated: true },
        });
        const ranges = [
            { label: '< NPR 500', min: 0, max: 500 },
            { label: 'NPR 500-2K', min: 500, max: 2000 },
            { label: 'NPR 2K-5K', min: 2000, max: 5000 },
            { label: 'NPR 5K-10K', min: 5000, max: 10000 },
            { label: 'NPR 10K-50K', min: 10000, max: 50000 },
            { label: '> NPR 50K', min: 50000, max: Infinity },
        ];
        const donorDistribution = ranges.map((r) => ({
            range: r.label,
            count: donorStats.filter((d) => {
                const amt = Number(d.totalMoneyDonated);
                return amt >= r.min && amt < r.max;
            }).length,
        }));
        // Top 20 donors
        const topDonors = yield prisma_1.prisma.donorStats.findMany({
            where: { donationCount: { gt: 0 } },
            orderBy: { totalMoneyDonated: 'desc' },
            take: 20,
            select: {
                totalMoneyDonated: true,
                donationCount: true,
                totalItemCount: true,
                lastDonationAt: true,
                user: { select: { id: true, name: true, email: true, createdAt: true } },
            },
        });
        const topDonorsFormatted = topDonors.map((d, i) => ({
            rank: i + 1,
            id: d.user.id,
            name: d.user.name,
            email: d.user.email,
            totalDonated: Number(d.totalMoneyDonated),
            donationCount: d.donationCount,
            itemCount: d.totalItemCount,
            lastDonationAt: d.lastDonationAt,
            joinedAt: d.user.createdAt,
        }));
        res.json({
            success: true,
            data: {
                totalUsers,
                totalDonors,
                donorRatio: totalUsers > 0 ? Math.round((totalDonors / totalUsers) * 100) : 0,
                userGrowth,
                donorDistribution,
                topDonors: topDonorsFormatted,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserAnalytics = getUserAnalytics;
// ─── Collection Report ─────────────────────────────────────────────
const getCollectionReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const period = req.query.period === 'weekly' ? 'weekly' : 'monthly';
        const donations = yield prisma_1.prisma.moneyDonation.findMany({
            where: { status: 'COMPLETED' },
            select: { amount: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const periodMap = new Map();
        for (const d of donations) {
            let key;
            if (period === 'weekly') {
                // ISO week: get the Monday of the week
                const date = new Date(d.createdAt);
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(date.setDate(diff));
                key = `${monday.getFullYear()}-W${String(Math.ceil((monday.getMonth() * 30 + monday.getDate()) / 7)).padStart(2, '0')}`;
            }
            else {
                key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`;
            }
            const existing = periodMap.get(key) || { amount: 0, count: 0 };
            existing.amount += Number(d.amount);
            existing.count += 1;
            periodMap.set(key, existing);
        }
        const periodData = Array.from(periodMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, val], i, arr) => {
            const prev = i > 0 ? arr[i - 1][1].amount : 0;
            const changePct = prev > 0 ? Math.round(((val.amount - prev) / prev) * 100) : 0;
            return {
                period: key,
                amount: val.amount,
                count: val.count,
                changePct,
            };
        });
        const totalAllTime = donations.reduce((s, d) => s + Number(d.amount), 0);
        const periodCount = periodData.length;
        const avgPerPeriod = periodCount > 0 ? Math.round(totalAllTime / periodCount) : 0;
        const bestPeriod = periodData.reduce((best, p) => (p.amount > best.amount ? p : best), { period: '-', amount: 0, count: 0, changePct: 0 });
        res.json({
            success: true,
            data: {
                period,
                totalAllTime,
                avgPerPeriod,
                bestPeriod: { period: bestPeriod.period, amount: bestPeriod.amount },
                periodData,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCollectionReport = getCollectionReport;
