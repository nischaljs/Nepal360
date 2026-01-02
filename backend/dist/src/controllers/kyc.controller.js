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
exports.resubmitKyc = exports.getMyKycStatus = exports.submitKyc = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const kyc_schema_1 = require("../schemas/kyc.schema");
const submitKyc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const kycData = kyc_schema_1.submitKycSchema.parse(req.body);
        const { userId: userId } = req.user;
        const existingKyc = yield prisma_1.prisma.kYCProfile.findUnique({
            where: { userId },
        });
        if (existingKyc) {
            return res
                .status(409)
                .json({ message: 'KYC profile already exists.' });
        }
        const newKyc = yield prisma_1.prisma.kYCProfile.create({
            data: Object.assign(Object.assign({}, kycData), { userId, status: 'PENDING' }),
        });
        res
            .status(201)
            .json({ message: 'KYC profile submitted successfully.', kyc: newKyc });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues.map((e) => ({
                    path: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.submitKyc = submitKyc;
const getMyKycStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: userId } = req.user;
    try {
        const kyc = yield prisma_1.prisma.kYCProfile.findUnique({
            where: { userId },
            select: {
                status: true,
                rejectionReason: true,
                submittedAt: true,
                reviewedAt: true,
            },
        });
        if (!kyc) {
            return res.status(200).json({ status: 'NOT_SUBMITTED' });
        }
        res.status(200).json(kyc);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyKycStatus = getMyKycStatus;
const resubmitKyc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const kycData = kyc_schema_1.submitKycSchema.parse(req.body);
        const { userId: userId } = req.user;
        const existingKyc = yield prisma_1.prisma.kYCProfile.findUnique({
            where: { userId },
        });
        if (!existingKyc) {
            return res.status(404).json({ message: 'KYC profile not found.' });
        }
        if (existingKyc.status !== 'REJECTED') {
            return res.status(403).json({
                message: 'You can only resubmit a rejected KYC profile.',
            });
        }
        const updatedKyc = yield prisma_1.prisma.kYCProfile.update({
            where: { userId },
            data: Object.assign(Object.assign({}, kycData), { status: 'PENDING', rejectionReason: null }),
        });
        res.status(200).json({
            message: 'KYC profile resubmitted successfully.',
            kyc: updatedKyc,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues.map((e) => ({
                    path: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.resubmitKyc = resubmitKyc;
