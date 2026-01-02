"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignUpload = exports.createCampaignUpload = exports.createProofFilesUpload = exports.createCoverImageUpload = exports.createCampaignStorage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const file_1 = require("../utils/file");
/**
 * Allowed file types for campaign uploads
 */
const ALLOWED_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
/**
 * Maximum file sizes (in bytes)
 */
const MAX_FILE_SIZES = {
    coverImage: 5 * 1024 * 1024, // 5MB
    proof: 20 * 1024 * 1024, // 20MB
};
/**
 * Create multer storage configuration for campaign files
 * Files are organized by campaign ID
 */
const createCampaignStorage = (campaignId) => {
    const uploadDir = (0, file_1.getCampaignUploadDir)(campaignId);
    (0, file_1.ensureDir)(uploadDir);
    return multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const ext = path_1.default.extname(file.originalname);
            const name = path_1.default.basename(file.originalname, ext);
            const filename = `${name}-${timestamp}${ext}`;
            cb(null, filename);
        },
    });
};
exports.createCampaignStorage = createCampaignStorage;
/**
 * File filter function for campaign uploads
 */
const campaignFileFilter = (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
};
/**
 * Create multer upload middleware for campaign cover image
 */
const createCoverImageUpload = (campaignId) => {
    const storage = (0, exports.createCampaignStorage)(campaignId);
    return (0, multer_1.default)({
        storage,
        fileFilter: campaignFileFilter,
        limits: {
            fileSize: MAX_FILE_SIZES.coverImage,
        },
    }).single('coverImage');
};
exports.createCoverImageUpload = createCoverImageUpload;
/**
 * Create multer upload middleware for campaign proofs (multiple files)
 */
const createProofFilesUpload = (campaignId) => {
    const storage = (0, exports.createCampaignStorage)(campaignId);
    return (0, multer_1.default)({
        storage,
        fileFilter: campaignFileFilter,
        limits: {
            fileSize: MAX_FILE_SIZES.proof,
        },
    }).array('proofs', 10); // Max 10 proof files
};
exports.createProofFilesUpload = createProofFilesUpload;
/**
 * Create multer upload middleware for both cover and proofs
 */
const createCampaignUpload = (campaignId) => {
    const storage = (0, exports.createCampaignStorage)(campaignId);
    return (0, multer_1.default)({
        storage,
        fileFilter: campaignFileFilter,
        limits: {
            fileSize: Math.max(MAX_FILE_SIZES.coverImage, MAX_FILE_SIZES.proof),
        },
    }).fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'proofs', maxCount: 10 },
    ]);
};
exports.createCampaignUpload = createCampaignUpload;
/**
 * Default campaign multer instance
 */
exports.campaignUpload = (0, multer_1.default)({
    fileFilter: campaignFileFilter,
    limits: {
        fileSize: Math.max(MAX_FILE_SIZES.coverImage, MAX_FILE_SIZES.proof),
    },
});
