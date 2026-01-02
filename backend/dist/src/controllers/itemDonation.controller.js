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
exports.getMyItemDonations = exports.pledgeItemDonation = void 0;
const prisma_1 = require("../lib/prisma");
const itemDonation_schema_1 = require("../schemas/itemDonation.schema");
const zod_1 = require("zod");
const pledgeItemDonation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const donationData = itemDonation_schema_1.pledgeItemDonationSchema.parse(req.body);
        const donation = yield prisma_1.prisma.itemDonation.create({
            data: Object.assign(Object.assign({}, donationData), { donorId, status: 'PLEDGED' }),
        });
        res.status(201).json(donation);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.issues.map(e => ({ path: e.path, message: e.message })) });
        }
        next(error);
    }
});
exports.pledgeItemDonation = pledgeItemDonation;
const getMyItemDonations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const donations = yield prisma_1.prisma.itemDonation.findMany({
            where: {
                donorId,
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(donations);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyItemDonations = getMyItemDonations;
