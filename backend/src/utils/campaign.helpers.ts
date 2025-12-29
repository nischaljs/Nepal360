import { Request } from 'express';
import {
    convertProofLinksToUrls,
    parseProofLinks,
} from './file';

/**
 * Get base URL for asset generation
 */
export const getBaseUrl = (req: Request): string => {
    return `${req.protocol}://${req.get('host')}`;
};

export { convertProofLinksToUrls, parseProofLinks };
