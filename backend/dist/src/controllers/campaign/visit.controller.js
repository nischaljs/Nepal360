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
exports.incrementVisitCount = void 0;
const prisma_1 = require("../../lib/prisma");
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;
const incrementVisitCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const campaign = yield prisma_1.prisma.campaign.update({
                where: { id },
                data: {
                    visits: {
                        increment: 1,
                    },
                },
            });
            return res.status(200).json({
                message: "Visit count incremented successfully",
                visits: campaign.visits,
            });
        }
        catch (error) {
            if (error.code === 'P2025' || (error.cause && error.cause.originalCode === '1020')) { // P2025 for not found, 1020 for concurrency in MariaDB
                console.warn(`Concurrency error on visit count for campaign ${id}. Retrying... (${i + 1}/${MAX_RETRIES})`);
                yield new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (i + 1)));
            }
            else {
                console.error("Error incrementing visit count:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        }
    }
    // If all retries fail
    console.error(`Failed to increment visit count for campaign ${id} after ${MAX_RETRIES} retries.`);
    res.status(500).json({ message: "Failed to increment visit count due to persistent concurrency issues." });
});
exports.incrementVisitCount = incrementVisitCount;
