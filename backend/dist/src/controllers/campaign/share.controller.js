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
exports.incrementShareCount = void 0;
const prisma_1 = require("../../lib/prisma");
const incrementShareCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const campaign = yield prisma_1.prisma.campaign.update({
            where: { id },
            data: {
                shareCount: {
                    increment: 1,
                },
            },
        });
        res.status(200).json({
            message: "Share count incremented successfully",
            shares: campaign.shareCount,
        });
    }
    catch (error) {
        console.error("Error incrementing share count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.incrementShareCount = incrementShareCount;
