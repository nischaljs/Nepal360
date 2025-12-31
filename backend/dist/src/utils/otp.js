"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.saveOTP = saveOTP;
exports.verifyOTP = verifyOTP;
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const otpStore = new Map();
const OTP_EXPIRY_MINUTES = 10;
function saveOTP(email) {
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });
    return otp;
}
function verifyOTP(email, otp) {
    const stored = otpStore.get(email);
    if (!stored)
        return false;
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return false;
    }
    if (stored.otp !== otp)
        return false;
    otpStore.delete(email);
    return true;
}
