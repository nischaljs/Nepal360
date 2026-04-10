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
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = require("../lib/prisma");
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const [notifications, unreadCount] = yield Promise.all([
            prisma_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma_1.prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);
        res.status(200).json({ success: true, data: { notifications, unreadCount } });
    }
    catch (error) {
        next(error);
    }
});
exports.getNotifications = getNotifications;
const markAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        const notification = yield prisma_1.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }
        yield prisma_1.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.markAsRead = markAsRead;
const markAllAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        yield prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const count = yield prisma_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        res.status(200).json({ success: true, data: { count } });
    }
    catch (error) {
        next(error);
    }
});
exports.getUnreadCount = getUnreadCount;
