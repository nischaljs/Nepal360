


export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const OTP_EXPIRY_MINUTES = 10;

export function saveOTP(email: string): string {
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });
    return otp;
}


export function getOTPForTesting(email: string): string | null {
    if (process.env.NODE_ENV === 'production') return null;
    return otpStore.get(email)?.otp ?? null;
}

export function verifyOTP(email: string, otp: string): boolean {
    const stored = otpStore.get(email);
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return false;
    }
    if (stored.otp !== otp) return false;
    otpStore.delete(email);
    return true;
}
