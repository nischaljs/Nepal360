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
exports.getActivityFeed = void 0;
const prisma_1 = require("../lib/prisma");
const getActivityFeed = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [recentDonations, recentCampaigns, recentItemDonations] = yield Promise.all([
            prisma_1.prisma.moneyDonation.findMany({
                where: { status: 'COMPLETED' },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    donor: { select: { name: true } },
                    campaign: { select: { id: true, title: true } },
                },
            }),
            prisma_1.prisma.campaign.findMany({
                where: { status: 'LIVE', isActive: true },
                orderBy: { verifiedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    coverImage: true,
                    verifiedAt: true,
                    beneficiary: { select: { name: true } },
                },
            }),
            prisma_1.prisma.itemDonation.findMany({
                where: { status: { in: ['DELIVERED', 'CONFIRMED'] } },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    donor: { select: { name: true } },
                    campaign: { select: { id: true, title: true } },
                },
            }),
        ]);
        const activities = [
            ...recentDonations.map((d) => ({
                type: 'donation',
                id: d.id,
                message: `${d.visibility === 'ANONYMOUS' ? 'Anonymous' : d.donor.name} donated NPR ${d.amount.toString()} to`,
                campaignId: d.campaign.id,
                campaignTitle: d.campaign.title,
                timestamp: d.createdAt,
            })),
            ...recentCampaigns.map((c) => ({
                type: 'campaign',
                id: c.id,
                message: `New campaign "${c.title}" launched by ${c.beneficiary.name}`,
                campaignId: c.id,
                campaignTitle: c.title,
                timestamp: c.verifiedAt || new Date(),
            })),
            ...recentItemDonations.map((d) => ({
                type: 'item',
                id: d.id,
                message: `${d.donor.name} pledged ${d.itemName} (${d.quantity}) to`,
                campaignId: d.campaign.id,
                campaignTitle: d.campaign.title,
                timestamp: d.createdAt,
            })),
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20);
        res.json({ success: true, data: activities });
    }
    catch (error) {
        next(error);
    }
});
exports.getActivityFeed = getActivityFeed;
