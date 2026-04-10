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
exports.listUsers = void 0;
const prisma_1 = require("../lib/prisma");
const listUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search || '';
        const users = yield prisma_1.prisma.user.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                    ],
                }
                : undefined,
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: { name: 'asc' },
            take: 50,
        });
        res.json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
});
exports.listUsers = listUsers;
