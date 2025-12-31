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
exports.signup = signup;
exports.verifyEmail = verifyEmail;
exports.login = login;
exports.getCurrentUser = getCurrentUser;
const client_1 = require("@prisma/client");
const password_1 = require("../utils/password");
const otp_1 = require("../utils/otp");
const jwt_1 = require("../utils/jwt");
const auth_schema_1 = require("../schemas/auth.schema");
const prisma = new client_1.PrismaClient();
/* ---------------------------------- SIGNUP ---------------------------------- */
function signup(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const validation = auth_schema_1.signupSchema.safeParse(data);
        if (!validation.success) {
            return { status: 400, body: { success: false, message: validation.error.message } };
        }
        const { name, email, password } = validation.data;
        const exists = yield prisma.user.findUnique({ where: { email } });
        if (exists) {
            return { status: 409, body: { success: false, message: 'Email already registered' } };
        }
        const passwordHash = yield (0, password_1.hashPassword)(password);
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                emailStatus: client_1.EmailStatus.PENDING,
            },
        });
        const otp = (0, otp_1.saveOTP)(email);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV OTP] ${email}: ${otp}`);
        }
        return {
            status: 201,
            body: {
                success: true,
                message: 'Signup successful. OTP sent to email.',
                userId: user.id,
            },
        };
    });
}
/* ------------------------------ VERIFY EMAIL -------------------------------- */
function verifyEmail(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const validation = auth_schema_1.verifyEmailSchema.safeParse(data);
        if (!validation.success) {
            return { status: 400, body: { success: false, message: validation.error.message } };
        }
        const { email, otp } = validation.data;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { status: 401, body: { success: false, message: 'User not found' } };
        }
        if (user.emailStatus === client_1.EmailStatus.VERIFIED) {
            return { status: 409, body: { success: false, message: 'Email already verified' } };
        }
        if (!(0, otp_1.verifyOTP)(email, otp)) {
            return { status: 401, body: { success: false, message: 'Invalid or expired OTP' } };
        }
        yield prisma.user.update({
            where: { id: user.id },
            data: { emailStatus: client_1.EmailStatus.VERIFIED },
        });
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            emailVerified: true,
        });
        return {
            status: 200,
            body: {
                success: true,
                message: 'Email verified successfully',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    emailVerified: true,
                },
            },
        };
    });
}
/* ---------------------------------- LOGIN ---------------------------------- */
function login(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const validation = auth_schema_1.loginSchema.safeParse(data);
        if (!validation.success) {
            return { status: 400, body: { success: false, message: validation.error.message } };
        }
        const { email, password } = validation.data;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user || !(yield (0, password_1.verifyPassword)(password, user.passwordHash))) {
            return { status: 401, body: { success: false, message: 'Invalid email or password' } };
        }
        if (user.emailStatus !== client_1.EmailStatus.VERIFIED) {
            return {
                status: 401,
                body: { success: false, message: 'Email not verified. Please verify your email first.' },
            };
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            emailVerified: true,
        });
        return {
            status: 200,
            body: {
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    emailVerified: true,
                },
            },
        };
    });
}
/* ----------------------------- CURRENT USER -------------------------------- */
function getCurrentUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                emailStatus: true,
                createdAt: true,
                adminRole: { select: { id: true } },
                kycProfile: { select: { status: true } },
                donorStats: {
                    select: {
                        totalMoneyDonated: true,
                        totalItemCount: true,
                        donationCount: true,
                    },
                },
            },
        });
        if (!user)
            return null;
        return Object.assign(Object.assign({}, user), { donorStats: (_a = user.donorStats) !== null && _a !== void 0 ? _a : {
                totalMoneyDonated: 0,
                totalItemCount: 0,
                donationCount: 0,
            }, roles: {
                isAdmin: !!user.adminRole,
                isVerifiedBeneficiary: ((_b = user.kycProfile) === null || _b === void 0 ? void 0 : _b.status) === client_1.KYCStatus.APPROVED,
                isDonor: !!user.donorStats,
            } });
    });
}
