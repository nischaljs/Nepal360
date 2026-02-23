# API Endpoints Reference

## Base URL
```
http://localhost:3000/api
```

---

## Authentication (`/auth`)

### POST `/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "name": "string (min 2 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signup successful. OTP sent to email.",
  "userId": "uuid"
}
```

### POST `/auth/verify-email`
Verify email with OTP.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "otp": "string (6 digits)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "emailVerified": true
  }
}
```

### POST `/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "emailVerified": true
  }
}
```

### GET `/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "emailStatus": "PENDING | VERIFIED",
  "createdAt": "datetime",
  "adminRole": { "id": "uuid" } | null,
  "kycProfile": { "status": "PENDING | APPROVED | REJECTED" } | null,
  "donorStats": {
    "totalMoneyDonated": 0,
    "totalItemCount": 0,
    "donationCount": 0
  },
  "roles": {
    "isAdmin": boolean,
    "isVerifiedBeneficiary": boolean,
    "isDonor": boolean
  }
}
```

---

## Campaigns (`/campaigns`)

### GET `/campaigns`
Get all live campaigns (public).

**Response (200):**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "coverImage": "http://localhost:3000/uploads/...",
      "targetAmount": "decimal",
      "status": "LIVE",
      "beneficiary": { "id": "uuid", "name": "string" },
      "moneyDonations": [{ "amount": "decimal" }],
      "totalMoneyRaised": 0,
      "proofLinks": ["http://..."],
      "createdAt": "datetime"
    }
  ]
}
```

### GET `/campaigns/public/:id`
Get single campaign by ID (public).

**Response (200):**
```json
{
  "success": true,
  "campaign": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "coverImage": "http://...",
    "proofLinks": ["http://..."],
    "targetAmount": "decimal",
    "status": "LIVE",
    "beneficiary": { "id": "uuid", "name": "string" },
    "milestones": [
      { "id": "uuid", "title": "string", "amount": "decimal", "completed": false }
    ],
    "visits": 0,
    "shareCount": 0
  }
}
```

### POST `/campaigns/public/:id/visit`
Increment campaign visit count.

**Response (200):**
```json
{ "success": true }
```

### POST `/campaigns/public/:id/share`
Increment campaign share count.

**Response (200):**
```json
{ "success": true }
```

### GET `/campaigns/:id/stats`
Get campaign statistics.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalMoneyRaised": 0,
    "moneyDonationCount": 0,
    "itemDonationCount": 0,
    "totalDonationCount": 0,
    "uniqueDonorCount": 0,
    "averageMoneyDonation": 0
  }
}
```

### GET `/campaigns/:id/donors`
Get campaign donors (paginated).

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response (200):**
```json
{
  "donors": [
    {
      "id": "uuid",
      "amount": "decimal",
      "createdAt": "datetime",
      "donorName": "Anonymous Donor" | "string"
    }
  ],
  "currentPage": 1,
  "totalPages": 1,
  "totalDonors": 10
}
```

### POST `/campaigns`
Create a new campaign.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `coverImage`: File (required)
- `proofs`: File[] (optional)
- `title`: string
- `description`: string
- `targetAmount`: number

**Response (201):**
```json
{
  "success": true,
  "campaign": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "coverImage": "http://...",
    "proofLinks": ["http://..."],
    "targetAmount": "decimal",
    "status": "PENDING_VERIFICATION",
    "milestones": []
  }
}
```

### GET `/campaigns/me`
Get authenticated user's campaigns.

**Response (200):**
```json
{
  "success": true,
  "campaigns": []
}
```

### GET `/campaigns/me/:id`
Get campaign detail (own campaigns only).

### PUT `/campaigns/:id`
Update campaign (cannot update live campaigns).

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "targetAmount": number
}
```

### POST `/campaigns/:id/milestones`
Add milestone to campaign.

**Request Body:**
```json
{
  "title": "string",
  "amount": number
}
```

### DELETE `/campaigns/:id/milestones/:milestoneId`
Delete milestone.

---

## KYC (`/kyc`)

### GET `/kyc/me`
Get authenticated user's KYC status.

**Response (200):**
```json
{
  "status": "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED",
  "rejectionReason": "string" | null,
  "submittedAt": "datetime" | null,
  "reviewedAt": "datetime" | null,
  "documentImage": "http://...",
  "profilePhoto": "http://..."
}
```

### POST `/kyc/submit`
Submit KYC application.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `documentImage`: File (required)
- `profilePhoto`: File (required)
- `documentType`: string
- `documentNumber`: string
- `bankAccountName`: string
- `bankAccountNo`: string
- `walletProvider`: string (optional)

**Response (201):**
```json
{
  "message": "KYC profile submitted successfully.",
  "kyc": { ... }
}
```

### PUT `/kyc/resubmit`
Resubmit rejected KYC.

---

## Donations (`/donations`)

### POST `/donations/money/khalti/initiate`
Initiate Khalti payment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "campaignId": "uuid",
  "amount": number,
  "returnUrl": "string",
  "visibility": "PUBLIC" | "ANONYMOUS"
}
```

**Response (200):**
```json
{
  "paymentUrl": "https://khalti.com/payment/..."
}
```

### POST `/donations/money/khalti/verify`
Verify Khalti payment.

**Request Body:**
```json
{
  "pidx": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "donation": { ... }
}
```

### POST `/donations/money/khalti/callback`
Khalti webhook callback (no auth).

**Request Body:**
```json
{
  "pidx": "string"
}
```

**Response (200):**
```json
{
  "success": true | false
}
```

### GET `/donations/money/me`
Get my money donations.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "amount": "decimal",
    "visibility": "PUBLIC",
    "status": "COMPLETED",
    "createdAt": "datetime",
    "campaign": { "id": "uuid", "title": "string" }
  }
]
```

### POST `/donations/items`
Pledge item donation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "campaignId": "uuid",
  "itemName": "string",
  "quantity": "string",
  "deliveryNote": "string" (optional)
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item donation pledged successfully",
  "donation": {
    "id": "uuid",
    "itemName": "string",
    "quantity": "string",
    "status": "PLEDGED",
    "campaign": { "id": "uuid", "title": "string" }
  }
}
```

### GET `/donations/items/me`
Get my item donations.

**Response (200):**
```json
{
  "success": true,
  "donations": [
    {
      "id": "uuid",
      "itemName": "string",
      "quantity": "string",
      "status": "PLEDGED | DELIVERED | CONFIRMED | REJECTED",
      "campaign": { "id": "uuid", "title": "string" }
    }
  ]
}
```

---

## Users (`/users`)

### GET `/users/me/stats`
Get authenticated user's stats.

**Response (200):**
```json
{
  "userId": "uuid",
  "totalMoneyDonated": "decimal",
  "totalItemCount": 0,
  "donationCount": 0,
  "lastDonationAt": "datetime" | null
}
```

### GET `/users/:userId/stats`
Get public user stats.

**Response (200):**
```json
{
  "userId": "uuid",
  "totalMoneyDonated": "decimal",
  "totalItemCount": 0,
  "donationCount": 0,
  "lastDonationAt": "datetime" | null
}
```

### GET `/users/me/badges`
Get user's badges.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "badgeId": "uuid",
    "awardedAt": "datetime",
    "badge": {
      "id": "uuid",
      "code": "FIRST_DONATION",
      "name": "First Donation",
      "description": "...",
      "iconUrl": "http://...",
      "badgeType": "FIRST_DONATION"
    }
  }
]
```

### GET `/users/me/donations`
Get user's donation history.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "type": "Money" | "Item",
    "amount": "decimal" (Money only),
    "itemName": "string" (Item only),
    "quantity": "string" (Item only),
    "status": "string",
    "campaign": { "id": "uuid", "title": "string" },
    "createdAt": "datetime"
  }
]
```

---

## Leaderboards (`/leaderboards`)

### GET `/leaderboards`
List all leaderboards.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "period": "MONTHLY | YEARLY | CAMPAIGN",
    "periodKey": "2026-01",
    "createdAt": "datetime"
  }
]
```

### GET `/leaderboards/:period/:key`
Get specific leaderboard.

**Path Parameters:**
- `period`: MONTHLY, YEARLY, or CAMPAIGN
- `key`: Period identifier (e.g., "2026-01" for monthly, "2026" for yearly)

**Response (200):**
```json
{
  "id": "uuid",
  "period": "MONTHLY",
  "periodKey": "2026-01",
  "createdAt": "datetime",
  "entries": [
    {
      "id": "uuid",
      "rank": 1,
      "totalAmount": "decimal",
      "totalItems": 0,
      "isAnonymous": false,
      "user": { "id": "uuid", "name": "string" }
    }
  ]
}
```

---

## Admin (`/admin`)

### Campaigns

#### GET `/admin/campaigns`
List all campaigns with optional filters.

**Query Parameters:**
- `status`: CampaignStatus
- `beneficiaryId`: uuid
- `isActive`: boolean
- `sortBy`: string (default: 'createdAt')
- `order`: 'asc' | 'desc' (default: 'desc')

**Response (200):**
```json
{
  "success": true,
  "campaigns": [...]
}
```

#### GET `/admin/campaigns/verification-queue`
Get campaigns awaiting verification.

**Response (200):**
```json
{
  "success": true,
  "queue": [
    {
      "id": "uuid",
      "title": "string",
      "beneficiary": { "id": "uuid", "name": "string" },
      "targetAmount": "decimal",
      "createdAt": "datetime",
      "daysWaiting": 0
    }
  ]
}
```

#### GET `/admin/campaigns/:campaignId`
Get campaign detail.

#### GET `/admin/campaigns/:campaignId/stats`
Get campaign statistics.

#### POST `/admin/campaigns/:campaignId/approve`
Approve campaign.

**Request Body (optional):**
```json
{
  "note": "string"
}
```

#### POST `/admin/campaigns/:campaignId/reject`
Reject campaign.

**Request Body:**
```json
{
  "reason": "string",
  "note": "string" (optional)
}
```

#### POST `/admin/campaigns/:campaignId/suspend`
Suspend campaign.

**Request Body:**
```json
{
  "reason": "string",
  "note": "string" (optional)
}
```

#### POST `/admin/campaigns/:campaignId/resume`
Resume suspended campaign.

#### POST `/admin/campaigns/:campaignId/complete`
Mark campaign as completed.

#### DELETE `/admin/campaigns/:campaignId`
Soft delete campaign.

### KYC

#### GET `/admin/kyc`
List all KYC applications (with optional status filter).

**Query Parameters:**
- `status`: KYCStatus

**Response (200):**
```json
{
  "kycProfiles": [
    {
      "id": "uuid",
      "user": { "id": "uuid", "name": "string", "email": "string" },
      "status": "PENDING",
      "documentType": "string",
      "submittedAt": "datetime"
    }
  ]
}
```

#### GET `/admin/kyc/:userId`
Get KYC detail.

#### POST `/admin/kyc/:userId/approve`
Approve KYC.

#### POST `/admin/kyc/:userId/reject`
Reject KYC.

**Request Body:**
```json
{
  "reason": "string"
}
```

### Item Donations

#### GET `/admin/item-donations`
List all item donations (with optional status filter).

**Query Parameters:**
- `status`: ItemDonationStatus

**Response (200):**
```json
{
  "itemDonations": [
    {
      "id": "uuid",
      "itemName": "string",
      "quantity": "string",
      "status": "PLEDGED",
      "donor": { "id": "uuid", "name": "string" },
      "campaign": { "id": "uuid", "title": "string" }
    }
  ]
}
```

#### POST `/admin/item-donations/:donationId/confirm`
Confirm item donation.

#### POST `/admin/item-donations/:donationId/reject`
Reject item donation.

**Request Body:**
```json
{
  "reason": "string"
}
```

### Badges

#### GET `/admin/badges`
List all badges.

**Response (200):**
```json
{
  "success": true,
  "badges": [
    {
      "id": "uuid",
      "code": "FIRST_DONATION",
      "name": "First Donation",
      "description": "Awarded for first donation",
      "iconUrl": "http://...",
      "badgeType": "FIRST_DONATION",
      "createdAt": "datetime",
      "_count": { "userBadges": 0 }
    }
  ]
}
```

#### GET `/admin/badges/:id`
Get badge detail.

**Response (200):**
```json
{
  "success": true,
  "badge": { ... }
}
```

#### POST `/admin/badges`
Create a new badge.

**Request Body:**
```json
{
  "code": "FIRST_DONATION",
  "name": "First Donation",
  "description": "Awarded for first donation",
  "iconUrl": "http://...",
  "badgeType": "FIRST_DONATION"
}
```

**Response (201):**
```json
{
  "success": true,
  "badge": { ... }
}
```

#### PUT `/admin/badges/:id`
Update badge.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "iconUrl": "http://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "badge": { ... }
}
```

#### DELETE `/admin/badges/:id`
Delete badge.

**Response (200):**
```json
{
  "success": true,
  "message": "Badge deleted successfully"
}
```

#### POST `/admin/badges/grant`
Grant badge to user.

**Request Body:**
```json
{
  "userId": "uuid",
  "badgeCode": "FIRST_DONATION"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "badgeId": "uuid",
  "awardedAt": "datetime"
}
```

### Audit Logs

#### GET `/admin/audit-logs`
List audit logs.

**Query Parameters:**
- `actorId`: uuid
- `actionType`: AdminActionType
- `targetType`: string

**Response (200):**
```json
[
  {
    "id": "uuid",
    "actorType": "ADMIN",
    "actorId": "uuid",
    "actor": { "id": "uuid", "name": "string", "email": "string" },
    "actionType": "KYC_REVIEW",
    "targetType": "KYCProfile",
    "targetId": "uuid",
    "note": "string",
    "createdAt": "datetime"
  }
]
```

#### GET `/admin/audit-logs/:targetType/:targetId`
Get audit logs for specific target.

---

## Error Responses

All endpoints return error responses in this format:

**Response (400/401/403/404/500):**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... } // Validation errors
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error
