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
exports.exportMyDonations = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../lib/prisma");
const escapeCsvField = (value) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
};
const exportMyDonations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId: donorId } = req.user;
        const donations = yield prisma_1.prisma.moneyDonation.findMany({
            where: { donorId },
            include: {
                campaign: {
                    select: { title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const header = 'Date,Campaign,Amount (NPR),Status,Visibility';
        const rows = donations.map((d) => {
            const date = escapeCsvField((0, date_fns_1.format)(d.createdAt, 'yyyy-MM-dd'));
            const campaign = escapeCsvField(d.campaign.title);
            const amount = escapeCsvField(d.amount.toString());
            const status = escapeCsvField(d.status);
            const visibility = escapeCsvField(d.visibility);
            return `${date},${campaign},${amount},${status},${visibility}`;
        });
        const csv = [header, ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=donations-export.csv');
        res.status(200).send(csv);
    }
    catch (error) {
        next(error);
    }
});
exports.exportMyDonations = exportMyDonations;
