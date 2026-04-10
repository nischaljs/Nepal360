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
exports.getCampaignDonors = exports.getMyMoneyDonations = exports.handleKhaltiCallback = exports.verifyKhaltiPayment = exports.initiateKhaltiPayment = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const env_1 = require("../config/env");
const donation_schema_1 = require("../schemas/donation.schema");
const KHALTI_API_URL = env_1.env.KHALTI_API_URL;
const KHALTI_SECRET_KEY = env_1.env.KHALTI_SECRET_KEY;
const verifyPayment = (pidx) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
        method: 'POST',
        headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
    });
    if (!response.ok) {
        const errorText = yield response.text();
        console.error('Khalti lookup failed. Status:', response.status, 'Response:', errorText);
        throw new Error(`Khalti lookup failed with status ${response.status}. See server logs for details.`);
    }
    const data = yield response.json();
    if (data.status !== 'Completed') {
        throw new Error(`Payment status is not 'Completed'. Status: ${data.status}`);
    }
    const donation = yield prisma_1.prisma.moneyDonation.findFirst({
        where: { pidx: pidx, status: 'PENDING' },
    });
    if (!donation) {
        throw new Error('Donation not found or already processed.');
    }
    const updatedDonation = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updated = yield tx.moneyDonation.update({
            where: { id: donation.id },
            data: {
                status: 'COMPLETED',
                paymentRef: data.transaction_id,
            },
        });
        yield tx.campaign.update({
            where: { id: donation.campaignId },
            data: { donationCount: { increment: 1 } },
        });
        yield tx.donorStats.upsert({
            where: { userId: donation.donorId },
            create: {
                userId: donation.donorId,
                totalMoneyDonated: donation.amount,
                donationCount: 1,
                lastDonationAt: new Date(),
            },
            update: {
                totalMoneyDonated: { increment: donation.amount },
                donationCount: { increment: 1 },
                lastDonationAt: new Date(),
            },
        });
        return updated;
    }));
    return updatedDonation;
});
const initiateKhaltiPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId, name: userName, email } = req.user;
        const customerName = userName || 'Guest Donor';
        const { campaignId, amount, returnUrl, visibility } = donation_schema_1.initiateKhaltiPaymentSchema.parse(req.body);
        const campaign = yield prisma_1.prisma.campaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found.' });
        }
        const donation = yield prisma_1.prisma.moneyDonation.create({
            data: {
                donorId,
                campaignId,
                amount,
                visibility,
                status: 'PENDING',
            },
        });
        const purchase_order_id = donation.id;
        const amountInPaisa = amount * 100;
        const khaltiRequestBody = JSON.stringify({
            return_url: returnUrl,
            website_url: env_1.env.WEBSITE_URL,
            amount: amountInPaisa,
            purchase_order_id: purchase_order_id,
            purchase_order_name: `Donation for ${campaign.title}`,
            customer_info: {
                name: customerName,
                email: email,
                phone: "9800000001"
            },
        });
        const khaltiResponse = yield fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
            method: 'POST',
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: khaltiRequestBody,
        });
        if (!khaltiResponse.ok) {
            const errorText = yield khaltiResponse.text();
            console.error('Khalti initiation failed:', khaltiResponse.status, errorText);
            return res.status(500).json({ success: false, message: 'Failed to initiate Khalti payment. Check server logs for details.' });
        }
        const khaltiData = yield khaltiResponse.json();
        yield prisma_1.prisma.moneyDonation.update({
            where: { id: donation.id },
            data: { pidx: khaltiData.pidx },
        });
        res.status(200).json({ success: true, data: { paymentUrl: khaltiData.payment_url } });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.initiateKhaltiPayment = initiateKhaltiPayment;
const verifyKhaltiPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pidx } = donation_schema_1.verifyKhaltiPaymentSchema.parse(req.body);
        const { userId: donorId } = req.user;
        const donation = yield prisma_1.prisma.moneyDonation.findFirst({
            where: { pidx, donorId }
        });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found or you are not authorized to verify it.' });
        }
        if (donation.status === 'COMPLETED') {
            return res.status(200).json({ success: true, message: 'Donation already verified.', donation });
        }
        const updatedDonation = yield verifyPayment(pidx);
        res.status(200).json({ success: true, data: updatedDonation });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.verifyKhaltiPayment = verifyKhaltiPayment;
const handleKhaltiCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { pidx } = req.body;
    if (!pidx) {
        return res.status(400).json({ success: false, message: 'pidx is required.' });
    }
    try {
        yield verifyPayment(pidx);
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Khalti callback verification failed:', error);
        res.status(200).json({ success: false });
    }
});
exports.handleKhaltiCallback = handleKhaltiCallback;
const getMyMoneyDonations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const donations = yield prisma_1.prisma.moneyDonation.findMany({
            where: {
                donorId,
                status: 'COMPLETED'
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ success: true, data: donations });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyMoneyDonations = getMyMoneyDonations;
const getCampaignDonors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: campaignId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const donations = yield prisma_1.prisma.moneyDonation.findMany({
            where: {
                campaignId,
                status: 'COMPLETED',
            },
            orderBy: { amount: 'desc' },
            take: limit,
            skip: skip,
            include: {
                donor: {
                    select: { id: true, name: true },
                },
            },
        });
        const totalDonations = yield prisma_1.prisma.moneyDonation.count({
            where: {
                campaignId,
                status: 'COMPLETED',
            },
        });
        const formattedDonations = donations.map(d => ({
            id: d.id,
            amount: d.amount,
            createdAt: d.createdAt,
            donorName: d.visibility === 'PUBLIC' ? d.donor.name : 'Anonymous Donor',
        }));
        res.status(200).json({
            success: true,
            data: {
                donors: formattedDonations,
                currentPage: page,
                totalPages: Math.ceil(totalDonations / limit),
                totalDonors: totalDonations,
            },
        });
    }
    catch (error) {
        console.error('Error fetching campaign donors:', error);
        next(error);
    }
});
exports.getCampaignDonors = getCampaignDonors;
