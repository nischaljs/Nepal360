import multer from 'multer';
import path from 'path';
import { getCampaignUploadDir, ensureDir } from '../utils/file';

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
export const createCampaignStorage = (campaignId: string) => {
    const uploadDir = getCampaignUploadDir(campaignId);
    ensureDir(uploadDir);

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext);
            const filename = `${name}-${timestamp}${ext}`;
            cb(null, filename);
        },
    });
};

/**
 * File filter function for campaign uploads
 */
const campaignFileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
};

/**
 * Create multer upload middleware for campaign cover image
 */
export const createCoverImageUpload = (campaignId: string) => {
    const storage = createCampaignStorage(campaignId);
    return multer({
        storage,
        fileFilter: campaignFileFilter,
        limits: {
            fileSize: MAX_FILE_SIZES.coverImage,
        },
    }).single('coverImage');
};

/**
 * Create multer upload middleware for campaign proofs (multiple files)
 */
export const createProofFilesUpload = (campaignId: string) => {
    const storage = createCampaignStorage(campaignId);
    return multer({
        storage,
        fileFilter: campaignFileFilter,
        limits: {
            fileSize: MAX_FILE_SIZES.proof,
        },
    }).array('proofs', 10); // Max 10 proof files
};

/**
 * Create multer upload middleware for both cover and proofs
 */
export const createCampaignUpload = (campaignId: string) => {
    const storage = createCampaignStorage(campaignId);
    return multer({
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

/**
 * Default campaign multer instance
 */
export const campaignUpload = multer({
    fileFilter: campaignFileFilter,
    limits: {
        fileSize: Math.max(MAX_FILE_SIZES.coverImage, MAX_FILE_SIZES.proof),
    },
});
