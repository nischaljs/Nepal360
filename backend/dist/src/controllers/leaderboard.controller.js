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
exports.getLeaderboard = exports.listLeaderboards = void 0;
const prisma_1 = require("../lib/prisma");
const listLeaderboards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaderboards = yield prisma_1.prisma.leaderboard.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({ success: true, data: leaderboards });
    }
    catch (error) {
        next(error);
    }
});
exports.listLeaderboards = listLeaderboards;
const getLeaderboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { period, key } = req.params;
        if (!['MONTHLY', 'CAMPAIGN', 'YEARLY'].includes(period.toUpperCase())) {
            return res.status(400).json({ success: false, message: 'Invalid leaderboard period.' });
        }
        const leaderboard = yield prisma_1.prisma.leaderboard.findUnique({
            where: {
                period_periodKey: {
                    period: period.toUpperCase(),
                    periodKey: key,
                },
            },
            include: {
                entries: {
                    orderBy: {
                        rank: 'asc',
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!leaderboard) {
            return res.status(404).json({ success: false, message: 'Leaderboard not found.' });
        }
        res.status(200).json({ success: true, data: leaderboard });
    }
    catch (error) {
        next(error);
    }
});
exports.getLeaderboard = getLeaderboard;
