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
exports.authMiddleware = authMiddleware;
exports.requireAuth = requireAuth;
exports.requireVerifiedEmail = requireVerifiedEmail;
exports.requireAdmin = requireAdmin;
exports.requireApprovedKYC = requireApprovedKYC;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../../generated/prisma/enums");
function authMiddleware(req) {
    var _a;
    const authHeader = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    const token = (0, jwt_1.extractToken)(authHeader);
    if (!token)
        return null;
    const decoded = (0, jwt_1.verifyToken)(token);
    return decoded || null;
}
function requireAuth(req, res, next) {
    const user = authMiddleware(req);
    if (!user) {
        console.warn('requireAuth: User not authenticated. Token might be missing or invalid.');
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    req.user = user;
    next();
}
function requireVerifiedEmail(req, res, next) {
    const user = authMiddleware(req);
    if (!user || !user.emailVerified) {
        return res.status(401).json({ success: false, message: 'Email verification required.' });
    }
    req.user = user;
    next();
}
function requireAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = authMiddleware(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
        }
        try {
            const adminRole = yield prisma_1.prisma.adminRole.findUnique({ where: { userId: user.userId } });
            if (!adminRole) {
                return res.status(403).json({ success: false, message: 'Admin access required.' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'An error occurred' });
        }
    });
}
function requireApprovedKYC(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = authMiddleware(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
        }
        try {
            const kycProfile = yield prisma_1.prisma.kYCProfile.findUnique({ where: { userId: user.userId } });
            if (!kycProfile || kycProfile.status !== enums_1.KYCStatus.APPROVED) {
                return res.status(403).json({ success: false, message: 'KYC approval required.' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'An error occurred' });
        }
    });
}
