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
const env_1 = require("../config/env");
const kyc_schema_1 = require("../schemas/kyc.schema");
const file_1 = require("../utils/file");
const BASE_URL = env_1.env.BACKEND_URL;
const submitKyc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const files = req.files;
        // Validate file uploads
        if (!files || !files.documentImage || files.documentImage.length === 0) {
            return res.status(400).json({ success: false, message: 'Document image is required.' });
        }
        if (!files || !files.profilePhoto || files.profilePhoto.length === 0) {
            return res.status(400).json({ success: false, message: 'Profile photo is required.' });
        }
        const documentImageRelativePath = (0, file_1.getRelativePath)(files.documentImage[0].path);
        const profilePhotoRelativePath = (0, file_1.getRelativePath)(files.profilePhoto[0].path);
        const kycDataWithFiles = Object.assign(Object.assign({}, req.body), { documentImage: documentImageRelativePath, profilePhoto: profilePhotoRelativePath });
        const parsedKycData = kyc_schema_1.submitKycSchema.parse(kycDataWithFiles);
        const existingKyc = yield prisma_1.prisma.kYCProfile.findUnique({
            where: { userId },
        });
        if (existingKyc) {
            return res
                .status(409)
                .json({ success: false, message: 'KYC profile already exists.' });
        }
        const newKyc = yield prisma_1.prisma.kYCProfile.create({
            data: Object.assign(Object.assign({}, parsedKycData), { userId, status: 'PENDING' }),
        });
        const responseKyc = Object.assign(Object.assign({}, newKyc), { documentImage: (0, file_1.generateAssetUrl)(newKyc.documentImage, BASE_URL), profilePhoto: (0, file_1.generateAssetUrl)(newKyc.profilePhoto, BASE_URL) });
        res
            .status(201)
            .json({ success: true, message: 'KYC profile submitted successfully.', data: responseKyc });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
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
    const { userId } = req.user;
    try {
        const kyc = yield prisma_1.prisma.kYCProfile.findUnique({
            where: { userId },
            select: {
                status: true,
                rejectionReason: true,
                submittedAt: true,
                reviewedAt: true,
                documentImage: true, // Include documentImage
                profilePhoto: true, // Include profilePhoto
            },
        });
        if (!kyc) {
            return res.status(200).json({ success: true, data: { status: 'NOT_SUBMITTED' } });
        }
        const responseKyc = Object.assign(Object.assign({}, kyc), { documentImage: kyc.documentImage ? (0, file_1.generateAssetUrl)(kyc.documentImage, BASE_URL) : undefined, profilePhoto: kyc.profilePhoto ? (0, file_1.generateAssetUrl)(kyc.profilePhoto, BASE_URL) : undefined });
        res.status(200).json({ success: true, data: responseKyc });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyKycStatus = getMyKycStatus;
const resubmitKyc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const files = req.files;
        // Validate file uploads
        if (!files || !files.documentImage || files.documentImage.length === 0) {
            return res.status(400).json({ success: false, message: 'Document image is required.' });
        }
        if (!files || !files.profilePhoto || files.profilePhoto.length === 0) {
            return res.status(400).json({ success: false, message: 'Profile photo is required.' });
        }
        const documentImageRelativePath = (0, file_1.getRelativePath)(files.documentImage[0].path);
        const profilePhotoRelativePath = (0, file_1.getRelativePath)(files.profilePhoto[0].path);
        const kycDataWithFiles = Object.assign(Object.assign({}, req.body), { documentImage: documentImageRelativePath, profilePhoto: profilePhotoRelativePath });
        const parsedKycData = kyc_schema_1.submitKycSchema.parse(kycDataWithFiles);
        const existingKyc = yield prisma_1.prisma.kYCProfile.findUnique({
            where: { userId },
        });
        if (!existingKyc) {
            return res.status(404).json({ success: false, message: 'KYC profile not found.' });
        }
        if (existingKyc.status !== 'REJECTED') {
            return res.status(403).json({
                success: false,
                message: 'You can only resubmit a rejected KYC profile.',
            });
        }
        const updatedKyc = yield prisma_1.prisma.kYCProfile.update({
            where: { userId },
            data: Object.assign(Object.assign({}, parsedKycData), { status: 'PENDING', rejectionReason: null }),
        });
        const responseKyc = Object.assign(Object.assign({}, updatedKyc), { documentImage: (0, file_1.generateAssetUrl)(updatedKyc.documentImage, BASE_URL), profilePhoto: (0, file_1.generateAssetUrl)(updatedKyc.profilePhoto, BASE_URL) });
        res.status(200).json({
            success: true,
            message: 'KYC profile resubmitted successfully.',
            data: responseKyc,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
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
