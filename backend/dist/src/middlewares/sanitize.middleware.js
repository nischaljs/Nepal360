"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
function sanitizeValue(value) {
    if (typeof value === 'string') {
        return isomorphic_dompurify_1.default.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === 'object') {
        return sanitizeObject(value);
    }
    return value;
}
function sanitizeObject(obj) {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
        sanitized[key] = sanitizeValue(obj[key]);
    }
    return sanitized;
}
const sanitizeInput = (req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
