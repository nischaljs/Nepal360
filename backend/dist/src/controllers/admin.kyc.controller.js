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
exports.rejectKyc = exports.approveKyc = exports.getKycDetail = exports.listKycProfiles = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const admin_kyc_schema_1 = require("../schemas/admin.kyc.schema");
const listKycProfiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter.' });
    }
    try {
        const kycProfiles = yield prisma_1.prisma.kYCProfile.findMany({
            where: {
                status: status ? status : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.status(200).json(kycProfiles);
    }
    catch (error) {
        next(error);
    }
});
exports.listKycProfiles = listKycProfiles;
const getKycDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const kycProfile = yield prisma_1.prisma.kYCProfile.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });
        if (!kycProfile) {
            return res.status(404).json({ message: 'KYC profile not found.' });
        }
        const auditLogs = yield prisma_1.prisma.auditLog.findMany({
            where: {
                targetType: 'KYC_PROFILE',
                targetId: kycProfile.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(Object.assign(Object.assign({}, kycProfile), { auditLogs }));
    }
    catch (error) {
        next(error);
    }
});
exports.getKycDetail = getKycDetail;
const approveKyc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { userId: adminId } = req.user;
    try {
        const kycProfile = yield prisma_1.prisma.kYCProfile.update({
            where: { userId },
            data: {
                status: 'APPROVED',
                reviewedAt: new Date(),
            },
        });
        yield prisma_1.prisma.auditLog.create({
            data: {
                actorType: 'ADMIN',
                actorId: adminId,
                actionType: 'KYC_REVIEW',
                targetType: 'KYC_PROFILE',
                targetId: kycProfile.id,
                note: 'KYC Approved',
            },
        });
        res.status(200).json({ message: 'KYC profile approved.', kycProfile });
    }
    catch (error) {
        next(error);
    }
});
exports.approveKyc = approveKyc;
const rejectKyc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { userId: adminId } = req.user;
    try {
        const { reason } = admin_kyc_schema_1.rejectKycSchema.parse(req.body);
        const kycProfile = yield prisma_1.prisma.kYCProfile.update({
            where: { userId },
            data: {
                status: 'REJECTED',
                rejectionReason: reason,
                reviewedAt: new Date(),
            },
        });
        yield prisma_1.prisma.auditLog.create({
            data: {
                actorType: 'ADMIN',
                actorId: adminId,
                actionType: 'KYC_REVIEW',
                targetType: 'KYC_PROFILE',
                targetId: kycProfile.id,
                note: `KYC Rejected: ${reason}`,
            },
        });
        res.status(200).json({ message: 'KYC profile rejected.', kycProfile });
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
exports.rejectKyc = rejectKyc;
