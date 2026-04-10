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
exports.deleteComment = exports.addComment = exports.getComments = void 0;
const prisma_1 = require("../lib/prisma");
const getComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { campaignId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;
        const [comments, total] = yield Promise.all([
            prisma_1.prisma.comment.findMany({
                where: { campaignId },
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            prisma_1.prisma.comment.count({ where: { campaignId } }),
        ]);
        res.json({ comments, total });
    }
    catch (error) {
        next(error);
    }
});
exports.getComments = getComments;
const addComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { campaignId } = req.params;
        const { content } = req.body;
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Comment content is required' });
        }
        if (content.length > 1000) {
            return res.status(400).json({ success: false, message: 'Comment must be 1000 characters or less' });
        }
        const campaign = yield prisma_1.prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        const comment = yield prisma_1.prisma.comment.create({
            data: {
                userId,
                campaignId,
                content: content.trim(),
            },
            include: { user: { select: { id: true, name: true } } },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
});
exports.addComment = addComment;
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const comment = yield prisma_1.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        if (comment.userId !== userId) {
            return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
        }
        yield prisma_1.prisma.comment.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteComment = deleteComment;
