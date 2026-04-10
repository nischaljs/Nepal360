"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.saveOTP = saveOTP;
exports.getOTPForTesting = getOTPForTesting;
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
function getOTPForTesting(email) {
    var _a, _b;
    if (process.env.NODE_ENV === 'production')
        return null;
    return (_b = (_a = otpStore.get(email)) === null || _a === void 0 ? void 0 : _a.otp) !== null && _b !== void 0 ? _b : null;
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
