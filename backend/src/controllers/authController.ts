

import { hashPassword, verifyPassword } from '../utils/password';
import { saveOTP, verifyOTP } from '../utils/otp';
import { generateToken } from '../utils/jwt';
import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
    SignupInput,
    LoginInput,
    VerifyEmailInput,
} from '../schemas/auth.schema';
import { prisma } from '../lib/prisma';
import { EmailStatus, KYCStatus } from '../../generated/prisma/enums';





type ControllerResult = {
    status: number;
    body: any;
};

/* ---------------------------------- SIGNUP ---------------------------------- */

export async function signup(data: SignupInput): Promise<ControllerResult> {
    const validation = signupSchema.safeParse(data);
    if (!validation.success) {
        return { status: 400, body: { success: false, message: validation.error.message } };
    }

    const { name, email, password } = validation.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
        return { status: 409, body: { success: false, message: 'Email already registered' } };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            emailStatus: EmailStatus.PENDING,
        },
    });

    const otp = saveOTP(email);
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
}

/* ------------------------------ VERIFY EMAIL -------------------------------- */

export async function verifyEmail(data: VerifyEmailInput): Promise<ControllerResult> {
    const validation = verifyEmailSchema.safeParse(data);
    if (!validation.success) {
        return { status: 400, body: { success: false, message: validation.error.message } };
    }

    const { email, otp } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { status: 401, body: { success: false, message: 'User not found' } };
    }

    if (user.emailStatus === EmailStatus.VERIFIED) {
        return { status: 409, body: { success: false, message: 'Email already verified' } };
    }

    if (!verifyOTP(email, otp)) {
        return { status: 401, body: { success: false, message: 'Invalid or expired OTP' } };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { emailStatus: EmailStatus.VERIFIED },
    });

    const token = generateToken({
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
}

/* ---------------------------------- LOGIN ---------------------------------- */

export async function login(data: LoginInput): Promise<ControllerResult> {
    const validation = loginSchema.safeParse(data);
    if (!validation.success) {
        return { status: 400, body: { success: false, message: validation.error.message } };
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return { status: 401, body: { success: false, message: 'Invalid email or password' } };
    }

    if (user.emailStatus !== EmailStatus.VERIFIED) {
        return {
            status: 401,
            body: { success: false, message: 'Email not verified. Please verify your email first.' },
        };
    }

    const token = generateToken({
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
}

/* ----------------------------- CURRENT USER -------------------------------- */

export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
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

    if (!user) return null;

    return {
        ...user,
        donorStats: user.donorStats ?? {
            totalMoneyDonated: 0,
            totalItemCount: 0,
            donationCount: 0,
        },
        roles: {
            isAdmin: !!user.adminRole,
            isVerifiedBeneficiary: user.kycProfile?.status === KYCStatus.APPROVED,
            isDonor: !!user.donorStats,
        },
    };
}
