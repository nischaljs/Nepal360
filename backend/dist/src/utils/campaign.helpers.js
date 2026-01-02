"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProofLinks = exports.convertProofLinksToUrls = exports.getBaseUrl = void 0;
const file_1 = require("./file");
Object.defineProperty(exports, "convertProofLinksToUrls", { enumerable: true, get: function () { return file_1.convertProofLinksToUrls; } });
Object.defineProperty(exports, "parseProofLinks", { enumerable: true, get: function () { return file_1.parseProofLinks; } });
/**
 * Get base URL for asset generation
 */
const getBaseUrl = (req) => {
    return `${req.protocol}://${req.get('host')}`;
};
exports.getBaseUrl = getBaseUrl;
