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
exports.getMyMoneyDonations = exports.handleKhaltiCallback = exports.verifyKhaltiPayment = exports.initiateKhaltiPayment = void 0;
const prisma_1 = require("../lib/prisma");
const donation_schema_1 = require("../schemas/donation.schema");
const zod_1 = require("zod");
const KHALTI_API_URL = 'https://khalti.com/api/v2';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
// ============== Helper function to verify payment ==============
const verifyPayment = (pidx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!KHALTI_SECRET_KEY) {
        throw new Error('Khalti secret key is not configured.');
    }
    const response = yield fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
        method: 'POST',
        headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
    });
    if (!response.ok) {
        throw new Error(`Khalti lookup failed with status ${response.status}`);
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
    const updatedDonation = yield prisma_1.prisma.moneyDonation.update({
        where: { id: donation.id },
        data: {
            status: 'COMPLETED',
            paymentRef: data.transaction_id,
        },
    });
    // TODO: Update DonorStats and Campaign donationCount
    // This can be done via a separate service or a background job
    return updatedDonation;
});
// ============== Controller Functions ==============
const initiateKhaltiPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!KHALTI_SECRET_KEY) {
            throw new Error('Khalti secret key is not configured.');
        }
        const { userId: donorId, name, email } = req.user;
        const { campaignId, amount, returnUrl, visibility } = donation_schema_1.initiateKhaltiPaymentSchema.parse(req.body);
        const campaign = yield prisma_1.prisma.campaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found.' });
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
        const khaltiResponse = yield fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
            method: 'POST',
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                return_url: returnUrl,
                website_url: process.env.WEBSITE_URL || 'http://localhost:3000',
                amount: amountInPaisa,
                purchase_order_id: purchase_order_id,
                purchase_order_name: `Donation for ${campaign.title}`,
                customer_info: {
                    name: name,
                    email: email,
                },
            }),
        });
        if (!khaltiResponse.ok) {
            const errorBody = yield khaltiResponse.json();
            console.error('Khalti initiation failed:', errorBody);
            return res.status(500).json({ message: 'Failed to initiate Khalti payment.' });
        }
        const khaltiData = yield khaltiResponse.json();
        yield prisma_1.prisma.moneyDonation.update({
            where: { id: donation.id },
            data: { pidx: khaltiData.pidx },
        });
        res.status(200).json({ paymentUrl: khaltiData.payment_url });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
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
            return res.status(404).json({ message: 'Donation not found or you are not authorized to verify it.' });
        }
        if (donation.status === 'COMPLETED') {
            return res.status(200).json({ success: true, message: 'Donation already verified.', donation });
        }
        const updatedDonation = yield verifyPayment(pidx);
        res.status(200).json({ success: true, donation: updatedDonation });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.verifyKhaltiPayment = verifyKhaltiPayment;
const handleKhaltiCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { pidx } = req.body;
    if (!pidx) {
        return res.status(400).json({ message: 'pidx is required.' });
    }
    try {
        yield verifyPayment(pidx);
        res.status(200).json({ success: true });
    }
    catch (error) {
        // Log the error, but don't send detailed error back to Khalti
        console.error('Khalti callback verification failed:', error);
        res.status(200).json({ success: false }); // Still send 200 to acknowledge receipt
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
        res.status(200).json(donations);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyMoneyDonations = getMyMoneyDonations;
