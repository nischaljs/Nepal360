"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitKycSchema = void 0;
const zod_1 = require("zod");
exports.submitKycSchema = zod_1.z.object({
    documentType: zod_1.z.string().min(1, 'Document type is required'),
    documentNumber: zod_1.z.string().min(1, 'Document number is required'),
    documentImage: zod_1.z.string().min(1, 'Document image is required'),
    profilePhoto: zod_1.z.string().min(1, 'Profile photo is required'),
    bankAccountName: zod_1.z.string().min(1, 'Bank account name is required'),
    bankAccountNo: zod_1.z.string().min(1, 'Bank account number is required'),
    walletProvider: zod_1.z.string().optional(),
});
