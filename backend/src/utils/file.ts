import path from 'path';
import fs from 'fs';

/**
 * Get the base upload directory
 */
export const getUploadDir = (): string => {
    return path.join(process.cwd(), 'uploads');
};

/**
 * Get the campaigns upload directory
 */
export const getCampaignsUploadDir = (): string => {
    return path.join(getUploadDir(), 'campaigns');
};

/**
 * Get a specific campaign's upload directory
 */
export const getCampaignUploadDir = (campaignId: string): string => {
    return path.join(getCampaignsUploadDir(), campaignId);
};

/**
 * Ensure a directory exists, create if it doesn't
 */
export const ensureDir = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Generate complete URL for an asset
 * @param relativePath - Relative path stored in database (e.g., 'campaigns/uuid/cover.jpg')
 * @param baseUrl - Base URL of the server (e.g., 'http://localhost:3000')
 * @returns Complete URL for the asset
 */
export const generateAssetUrl = (relativePath: string, baseUrl: string): string => {
    if (!relativePath) return '';

    // Remove leading slashes if present
    const cleanPath = relativePath.replace(/^\/+/, '');
    return `${baseUrl}/uploads/${cleanPath}`;
};

/**
 * Get relative path from absolute file path
 * @param absolutePath - Absolute path to the file
 * @returns Relative path from uploads directory
 */
export const getRelativePath = (absolutePath: string): string => {
    const uploadsDir = getUploadDir();
    const relativePath = path.relative(uploadsDir, absolutePath);
    return relativePath.replace(/\\/g, '/'); // Normalize to forward slashes
};

/**
 * Parse proof files array from JSON string
 * @param proofLinksJson - JSON string containing array of proof file paths
 * @returns Array of proof file paths
 */
export const parseProofLinks = (proofLinksJson: string | null): string[] => {
    if (!proofLinksJson) return [];
    try {
        return JSON.parse(proofLinksJson);
    } catch {
        return [];
    }
};

/**
 * Convert proof file paths to complete URLs
 * @param proofLinks - Array of relative proof file paths
 * @param baseUrl - Base URL of the server
 * @returns Array of complete URLs
 */
export const convertProofLinksToUrls = (proofLinks: string[], baseUrl: string): string[] => {
    return proofLinks.map(link => generateAssetUrl(link, baseUrl));
};

/**
 * Delete a file from the upload directory
 * @param relativePath - Relative path of the file to delete
 */
export const deleteFile = (relativePath: string): void => {
    try {
        const absolutePath = path.join(getUploadDir(), relativePath);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

/**
 * Delete campaign directory and all its contents
 * @param campaignId - ID of the campaign
 */
export const deleteCampaignDirectory = (campaignId: string): void => {
    try {
        const campaignDir = getCampaignUploadDir(campaignId);
        if (fs.existsSync(campaignDir)) {
            fs.rmSync(campaignDir, { recursive: true, force: true });
        }
    } catch (error) {
        console.error('Error deleting campaign directory:', error);
    }
};

/**
 * Get the KYC upload directory
 */
export const getKycUploadDir = (): string => {
    return path.join(getUploadDir(), 'kyc');
};

/**
 * Get a specific user's KYC upload directory
 */
export const getKycUserUploadDir = (userId: string): string => {
    return path.join(getKycUploadDir(), userId);
};
