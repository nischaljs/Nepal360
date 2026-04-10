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
exports.getRecommendations = getRecommendations;
exports.getSimilarCampaigns = getSimilarCampaigns;
function calculateCampaignSimilarity(campaign1, campaign2) {
    let score = 0;
    const weights = { category: 0.4, targetAmount: 0.3, status: 0.3 };
    if (campaign1.category && campaign2.category) {
        if (campaign1.category === campaign2.category) {
            score += weights.category;
        }
        else {
            const relatedCategories = {
                'education': ['community', 'health'],
                'health': ['emergency', 'community'],
                'community': ['education', 'disaster'],
                'disaster': ['emergency', 'community'],
                'emergency': ['health', 'disaster'],
            };
            const related = relatedCategories[campaign1.category] || [];
            if (related.includes(campaign2.category)) {
                score += weights.category * 0.5;
            }
        }
    }
    if (campaign1.targetAmount && campaign2.targetAmount) {
        const ratio = Math.min(campaign1.targetAmount, campaign2.targetAmount) /
            Math.max(campaign1.targetAmount, campaign2.targetAmount);
        score += weights.targetAmount * ratio;
    }
    return score;
}
function getUserCategoryPreferences(userId, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        const donations = yield prisma.moneyDonation.findMany({
            where: { donorId: userId },
            include: { campaign: true },
        });
        const categoryScores = new Map();
        for (const donation of donations) {
            const category = donation.campaign.category || 'general';
            const currentScore = categoryScores.get(category) || 0;
            categoryScores.set(category, currentScore + Number(donation.amount));
        }
        return categoryScores;
    });
}
function getUserDonatedCampaigns(userId, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        const donations = yield prisma.moneyDonation.findMany({
            where: { donorId: userId },
            select: { campaignId: true },
        });
        return new Set(donations.map(d => d.campaignId));
    });
}
function getSimilarToPopularCampaigns(userId, prisma, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const userDonations = yield prisma.moneyDonation.findMany({
            where: { donorId: userId },
            include: { campaign: true },
            take: 10,
        });
        if (userDonations.length === 0)
            return [];
        const userCampaignIds = new Set(userDonations.map(d => d.campaignId));
        const similarUserDonations = yield prisma.moneyDonation.findMany({
            where: {
                campaignId: { notIn: Array.from(userCampaignIds) },
                donor: {
                    moneyDonations: {
                        some: {
                            campaignId: { in: Array.from(userCampaignIds) },
                        },
                    },
                },
            },
            include: { campaign: true },
            take: 100,
        });
        const campaignScores = new Map();
        for (const donation of similarUserDonations) {
            const campaign = donation.campaign;
            if (!campaign)
                continue;
            const existing = campaignScores.get(campaign.id);
            const score = existing ? existing.recommendationScore + 1 : 1;
            if (!existing) {
                campaignScores.set(campaign.id, Object.assign(Object.assign({}, campaign), { recommendationScore: score, matchReasons: ['Popular among similar donors'] }));
            }
            else {
                existing.recommendationScore = score;
            }
        }
        return Array.from(campaignScores.values())
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, limit);
    });
}
function getRecommendations(options, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, limit = 10, excludeDonated = true } = options;
        const results = [];
        const addedIds = new Set();
        const liveCampaigns = yield prisma.campaign.findMany({
            where: { status: 'LIVE', isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        if (!userId) {
            return liveCampaigns
                .slice(0, limit)
                .map(c => (Object.assign(Object.assign({}, c), { recommendationScore: 100, matchReasons: ['Trending campaign'] })));
        }
        const donatedCampaigns = yield getUserDonatedCampaigns(userId, prisma);
        const userCategories = yield getUserCategoryPreferences(userId, prisma);
        for (const campaign of liveCampaigns) {
            if (excludeDonated && donatedCampaigns.has(campaign.id))
                continue;
            let score = 0;
            const reasons = [];
            const category = campaign.category || 'general';
            const userCategoryScore = userCategories.get(category) || 0;
            if (userCategoryScore > 0) {
                score += 40;
                reasons.push('Matches your interests');
            }
            for (const [donatedId, donated] of userCategories.entries()) {
                const similarity = calculateCampaignSimilarity({ category, targetAmount: Number(campaign.targetAmount) }, { category: donatedId });
                if (similarity > 0.5) {
                    score += similarity * 30;
                    reasons.push('Similar to campaigns you supported');
                    break;
                }
            }
            score += 20;
            const daysSinceCreated = (Date.now() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceCreated < 7) {
                score += 10;
                reasons.push('Recently launched');
            }
            if (score > 0) {
                results.push(Object.assign(Object.assign({}, campaign), { recommendationScore: score, matchReasons: reasons }));
            }
            addedIds.add(campaign.id);
        }
        const similarCampaigns = yield getSimilarToPopularCampaigns(userId, prisma, limit - results.length);
        for (const campaign of similarCampaigns) {
            if (!addedIds.has(campaign.id)) {
                results.push(campaign);
                addedIds.add(campaign.id);
            }
        }
        return results
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, limit);
    });
}
function getSimilarCampaigns(campaignId_1) {
    return __awaiter(this, arguments, void 0, function* (campaignId, limit = 5, prisma) {
        const sourceCampaign = yield prisma.campaign.findUnique({
            where: { id: campaignId },
        });
        if (!sourceCampaign)
            return [];
        const liveCampaigns = yield prisma.campaign.findMany({
            where: { status: 'LIVE', isActive: true, id: { not: campaignId } },
            take: 50,
        });
        const scoredCampaigns = liveCampaigns.map(campaign => ({
            campaign,
            similarity: calculateCampaignSimilarity({ category: sourceCampaign.category || 'general', targetAmount: Number(sourceCampaign.targetAmount) }, { category: campaign.category || 'general', targetAmount: Number(campaign.targetAmount) }),
        }));
        return scoredCampaigns
            .filter(s => s.similarity > 0)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(s => (Object.assign(Object.assign({}, s.campaign), { recommendationScore: Math.round(s.similarity * 100), matchReasons: ['Similar to campaign you\'re viewing'] })));
    });
}
