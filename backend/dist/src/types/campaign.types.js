"use strict";
/**
 * Campaign Types
 *
 * This file contains TypeScript interfaces and types related to campaign operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAMPAIGN_STATUS_DESCRIPTIONS = exports.CAMPAIGN_STATUSES = void 0;
/**
 * Campaign Status Constants
 * Available campaign statuses
 */
exports.CAMPAIGN_STATUSES = {
    DRAFT: 'DRAFT',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    LIVE: 'LIVE',
    SUSPENDED: 'SUSPENDED',
    COMPLETED: 'COMPLETED',
};
/**
 * Campaign Status Descriptions
 * Human-readable descriptions for each status
 */
exports.CAMPAIGN_STATUS_DESCRIPTIONS = {
    DRAFT: 'Campaign is in draft state - not yet submitted for verification',
    PENDING_VERIFICATION: 'Campaign is awaiting admin verification',
    LIVE: 'Campaign is active and accepting donations',
    SUSPENDED: 'Campaign has been suspended and is not accepting donations',
    COMPLETED: 'Campaign has been completed',
};
