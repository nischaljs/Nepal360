"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKycUserUploadDir = exports.getKycUploadDir = exports.deleteCampaignDirectory = exports.deleteFile = exports.convertProofLinksToUrls = exports.parseProofLinks = exports.getRelativePath = exports.generateAssetUrl = exports.ensureDir = exports.getCampaignUploadDir = exports.getCampaignsUploadDir = exports.getUploadDir = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Get the base upload directory
 */
const getUploadDir = () => {
    return path_1.default.join(process.cwd(), 'uploads');
};
exports.getUploadDir = getUploadDir;
/**
 * Get the campaigns upload directory
 */
const getCampaignsUploadDir = () => {
    return path_1.default.join((0, exports.getUploadDir)(), 'campaigns');
};
exports.getCampaignsUploadDir = getCampaignsUploadDir;
/**
 * Get a specific campaign's upload directory
 */
const getCampaignUploadDir = (campaignId) => {
    return path_1.default.join((0, exports.getCampaignsUploadDir)(), campaignId);
};
exports.getCampaignUploadDir = getCampaignUploadDir;
/**
 * Ensure a directory exists, create if it doesn't
 */
const ensureDir = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
exports.ensureDir = ensureDir;
/**
 * Generate complete URL for an asset
 * @param relativePath - Relative path stored in database (e.g., 'campaigns/uuid/cover.jpg')
 * @param baseUrl - Base URL of the server (e.g., 'http://localhost:3000')
 * @returns Complete URL for the asset
 */
const generateAssetUrl = (relativePath, baseUrl) => {
    if (!relativePath)
        return '';
    // Remove leading slashes if present
    const cleanPath = relativePath.replace(/^\/+/, '');
    return `${baseUrl}/uploads/${cleanPath}`;
};
exports.generateAssetUrl = generateAssetUrl;
/**
 * Get relative path from absolute file path
 * @param absolutePath - Absolute path to the file
 * @returns Relative path from uploads directory
 */
const getRelativePath = (absolutePath) => {
    const uploadsDir = (0, exports.getUploadDir)();
    const relativePath = path_1.default.relative(uploadsDir, absolutePath);
    return relativePath.replace(/\\/g, '/'); // Normalize to forward slashes
};
exports.getRelativePath = getRelativePath;
/**
 * Parse proof files array from JSON string
 * @param proofLinksJson - JSON string containing array of proof file paths
 * @returns Array of proof file paths
 */
const parseProofLinks = (proofLinksJson) => {
    if (!proofLinksJson)
        return [];
    try {
        return JSON.parse(proofLinksJson);
    }
    catch (_a) {
        return [];
    }
};
exports.parseProofLinks = parseProofLinks;
/**
 * Convert proof file paths to complete URLs
 * @param proofLinks - Array of relative proof file paths
 * @param baseUrl - Base URL of the server
 * @returns Array of complete URLs
 */
const convertProofLinksToUrls = (proofLinks, baseUrl) => {
    return proofLinks.map(link => (0, exports.generateAssetUrl)(link, baseUrl));
};
exports.convertProofLinksToUrls = convertProofLinksToUrls;
/**
 * Delete a file from the upload directory
 * @param relativePath - Relative path of the file to delete
 */
const deleteFile = (relativePath) => {
    try {
        const absolutePath = path_1.default.join((0, exports.getUploadDir)(), relativePath);
        if (fs_1.default.existsSync(absolutePath)) {
            fs_1.default.unlinkSync(absolutePath);
        }
    }
    catch (error) {
        console.error('Error deleting file:', error);
    }
};
exports.deleteFile = deleteFile;
/**
 * Delete campaign directory and all its contents
 * @param campaignId - ID of the campaign
 */
const deleteCampaignDirectory = (campaignId) => {
    try {
        const campaignDir = (0, exports.getCampaignUploadDir)(campaignId);
        if (fs_1.default.existsSync(campaignDir)) {
            fs_1.default.rmSync(campaignDir, { recursive: true, force: true });
        }
    }
    catch (error) {
        console.error('Error deleting campaign directory:', error);
    }
};
exports.deleteCampaignDirectory = deleteCampaignDirectory;
/**
 * Get the KYC upload directory
 */
const getKycUploadDir = () => {
    return path_1.default.join((0, exports.getUploadDir)(), 'kyc');
};
exports.getKycUploadDir = getKycUploadDir;
/**
 * Get a specific user's KYC upload directory
 */
const getKycUserUploadDir = (userId) => {
    return path_1.default.join((0, exports.getKycUploadDir)(), userId);
};
exports.getKycUserUploadDir = getKycUserUploadDir;
