import { Response, NextFunction } from 'express';
import { extractToken, verifyToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types/auth.types';
import { prisma } from '../lib/prisma';
import { KYCStatus } from '../../generated/prisma/enums';



export function authMiddleware(req: any): AuthenticatedRequest['user'] | null {
    const authHeader = req.headers?.authorization;
    const token = extractToken(authHeader);
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded || null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user = authMiddleware(req);
    if (!user) {
        console.warn('requireAuth: User not authenticated. Token might be missing or invalid.');
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    req.user = user;
    next();
}

export function requireVerifiedEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user = authMiddleware(req);
    if (!user || !user.emailVerified) {
        return res.status(401).json({ success: false, message: 'Email verification required.' });
    }
    req.user = user;
    next();
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user = authMiddleware(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    try {
        const adminRole = await prisma.adminRole.findUnique({ where: { userId: user.userId } });
        if (!adminRole) {
            return res.status(403).json({ success: false, message: 'Admin access required.' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred' });
    }
}

export async function requireApprovedKYC(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user = authMiddleware(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    try {
        const kycProfile = await prisma.kYCProfile.findUnique({ where: { userId: user.userId } });
        if (!kycProfile || kycProfile.status !== KYCStatus.APPROVED) {
            return res.status(403).json({ success: false, message: 'KYC approval required.' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred' });
    }
}
