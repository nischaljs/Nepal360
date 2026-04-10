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
exports.createNotification = createNotification;
const prisma_1 = require("../lib/prisma");
function createNotification(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, type, title, message, link, }) {
        const notification = yield prisma_1.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
            },
        });
        return notification;
    });
}
