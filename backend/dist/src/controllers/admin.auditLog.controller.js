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
exports.getAuditLogsForTarget = exports.listAuditLogs = void 0;
const prisma_1 = require("../lib/prisma");
const listAuditLogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { actorId, actionType, targetType } = req.query;
        const logs = yield prisma_1.prisma.auditLog.findMany({
            where: {
                actorId: actorId ? actorId : undefined,
                actionType: actionType ? actionType : undefined, // Consider adding validation
                targetType: targetType ? targetType : undefined,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100, // Add pagination limit
        });
        res.status(200).json({ success: true, data: logs });
    }
    catch (error) {
        next(error);
    }
});
exports.listAuditLogs = listAuditLogs;
const getAuditLogsForTarget = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { targetType, targetId } = req.params;
        const logs = yield prisma_1.prisma.auditLog.findMany({
            where: {
                targetType,
                targetId,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({ success: true, data: logs });
    }
    catch (error) {
        next(error);
    }
});
exports.getAuditLogsForTarget = getAuditLogsForTarget;
