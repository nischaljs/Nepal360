# Nepal360 - Authentication System Documentation

## Overview

The authentication system implements a **role-based access control** model where roles are **emergent behaviors** rather than declared flags. Users don't select a role; they earn roles through their actions.

## Role System

### Three Core Roles:

1. **Donor** - Anyone who donates
   - Automatically activated after email verification
   - No additional requirements
   - Can browse campaigns, donate money, pledge items

2. **Beneficiary** - Anyone with approved KYC
   - Requires email verification
   - Requires successful KYC submission and admin approval
   - Can create campaigns and receive donations

3. **Admin** - Explicitly assigned internal role
   - Only assigned by system/existing admins
   - Reviews KYC submissions
   - Verifies campaigns
   - Confirms item deliveries

## User Journey

### 1. Entry Point: Signup (All Users)

**Endpoint:** `POST /auth/signup`

Everyone starts the same way with:
- Name
- Email
- Password

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup successful. OTP sent to email.",
  "userId": "uuid"
}
```

**What happens:**
- User created with `emailStatus: PENDING`
- 6-digit OTP generated and sent to email
- OTP expires in 10 minutes
- No special privileges yet

---

### 2. Email Verification (All Users)

**Endpoint:** `POST /auth/verify-email`

User verifies their email by submitting the OTP.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

**What happens:**
- User's `emailStatus` changed to `VERIFIED`
- JWT token generated (7 days expiry)
- `DonorStats` created for the user
- User can now access donor features

---

### 3. Login (All Users)

**Endpoint:** `POST /auth/login`

User can log in after email verification.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

**What happens:**
- Password verified using PBKDF2 (100k iterations)
- Email must be verified before login
- JWT token generated for authenticated requests

---

## Access Control Middleware

### 1. `authMiddleware`
**Usage:** Extract and verify JWT token

```typescript
const auth = authMiddleware(req);
if (!auth) {
  // Not authenticated
}
```

### 2. `requireVerifiedEmail`
**Usage:** Protect donor routes
**Requirements:** User must have verified email

```typescript
app.post('/donor/donate', requireVerifiedEmail, async (req, res) => {
  // req.user.userId is available
  // User can donate
});
```

### 3. `requireApprovedKYC`
**Usage:** Protect beneficiary routes
**Requirements:** User must have approved KYC

```typescript
app.post('/beneficiary/create-campaign', requireApprovedKYC, async (req, res) => {
  // req.user.userId is available
  // User can create campaigns
});
```

### 4. `requireAdmin`
**Usage:** Protect admin routes
**Requirements:** User must have AdminRole entry

```typescript
app.post('/admin/review-kyc', requireAdmin, async (req, res) => {
  // req.user.userId is available
  // User can perform admin actions
});
```

---

## Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "emailStatus": "VERIFIED",
  "createdAt": "2024-12-27T00:00:00Z",
  "roles": {
    "isAdmin": false,
    "isVerifiedBeneficiary": false,
    "isDonor": true
  }
}
```

---

## Data Flow Diagram

```
USER SIGNUP
    ↓
Create User (emailStatus: PENDING)
Generate & Send OTP
    ↓
USER VERIFIES EMAIL
    ↓
Update emailStatus: VERIFIED
Create DonorStats
Generate JWT
    ↓
USER CAN NOW:
├─ LOGIN
├─ BROWSE CAMPAIGNS (Donor)
├─ DONATE MONEY (Donor)
├─ PLEDGE ITEMS (Donor)
└─ ACCESS /auth/me
    ↓
DONOR ROLE UNLOCKED (Emergent)
    ↓
IF USER NEEDS KYC (Wants to be Beneficiary):
    ├─ Submit KYC
    ├─ Admin Reviews
    ├─ Approved → CREATE CAMPAIGNS
    └─ Rejected → Resubmit
    ↓
BENEFICIARY ROLE UNLOCKED (Emergent)
    ↓
IF ASSIGNED BY ADMIN:
    ├─ Get AdminRole entry
    ├─ Review other KYCs
    ├─ Verify Campaigns
    └─ Confirm Item Deliveries
    ↓
ADMIN ROLE UNLOCKED (Explicit)
```

---

## Database Schema (Auth-Related)

### User
```prisma
model User {
  id           String      @id @default(uuid())
  name         String
  email        String      @unique
  passwordHash String      // PBKDF2 hashed
  emailStatus  EmailStatus @default(PENDING) // PENDING | VERIFIED
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  adminRole          AdminRole?      // Admin role (if assigned)
  kycProfile         KYCProfile?     // KYC info (if submitted)
  donorStats         DonorStats?     // Auto-created after email verification
  // ... other relations
}
```

### EmailStatus Enum
```
PENDING   - Email not yet verified
VERIFIED  - Email verified, user can access donor features
```

### AdminRole
```prisma
model AdminRole {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

### KYCProfile
```prisma
model KYCProfile {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])

  documentType    String
  documentNumber  String
  documentImage   String
  profilePhoto    String
  bankAccountName String
  bankAccountNo   String
  walletProvider  String?

  status          KYCStatus @default(PENDING)
  rejectionReason String?

  submittedAt DateTime?
  reviewedAt  DateTime?
}
```

---

## Security Considerations

### Password Hashing
- Algorithm: PBKDF2
- Iterations: 100,000
- Hash: SHA-512
- Salt: 32 bytes, random per user

### JWT Token
- Algorithm: HS256
- Secret: Environment variable `JWT_SECRET`
- Expiry: 7 days
- Payload: `{ userId, email, emailVerified }`

### OTP
- Length: 6 digits
- Expiry: 10 minutes
- Storage: In-memory (for dev); use Redis in production
- Single use: Deleted after verification

---

## Error Codes

### Signup
- `400` - Missing fields or password too short
- `400` - Email already registered
- `500` - Server error

### Verify Email
- `400` - Missing email or OTP
- `400` - User not found
- `400` - Email already verified
- `400` - Invalid or expired OTP
- `500` - Server error

### Login
- `400` - Missing email or password
- `401` - Invalid email or password
- `401` - Email not verified
- `500` - Server error

### Protected Routes
- `401` - Missing or invalid token
- `401` - Email not verified (for donor routes)
- `403` - KYC not approved (for beneficiary routes)
- `403` - Not an admin (for admin routes)

---

## Environment Variables

```env
# JWT Secret Key (change in production!)
JWT_SECRET=your-secret-key-change-in-production

# Email Service (TODO: implement)
SENDGRID_API_KEY=your-sendgrid-key
SENDER_EMAIL=noreply@nepal360.com

# Node Environment
NODE_ENV=development
PORT=3000
```

---

## Testing the Auth Flow

### 1. Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### 2. Verify Email
```bash
# Use OTP from console logs (in dev mode)
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### 4. Get Current User
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token_from_verify_or_login>"
```

---

## Next Steps

1. **Email Service Integration**: Connect to SendGrid or similar to send OTP emails
2. **KYC Controller**: Create controller for beneficiary KYC submission and admin review
3. **Campaign Controller**: Create controller for campaign creation and management
4. **Donation Controller**: Create controller for money and item donations
5. **Admin Controller**: Create controller for admin actions (KYC review, campaign verification)
6. **Frontend Integration**: Build signup, login, and email verification UI

---

## Key Principles

✅ **No declared roles** - Roles emerge from user behavior
✅ **Email verification** - Prevents spam and proves reachability
✅ **Low friction for donors** - Anyone can donate immediately after email verification
✅ **High trust for beneficiaries** - Requires KYC and admin approval
✅ **Admin control** - Only admins can verify and confirm
✅ **Audit trail** - All actions logged for compliance
✅ **Security first** - PBKDF2 hashing, JWT tokens, OTP verification


Day 1: Sarah signs up → Verifies email → Becomes a Donor

She can donate money to disaster relief campaigns
She can pledge items to help others
Day 15: Sarah needs medical funds for her family

She submits KYC with her documents
Admin reviews and approves
Now she's a Donor + Beneficiary
She creates a campaign to raise funds
Day 30: Sarah's campaign is successful

She received donations from other donors
BUT she can still donate to other campaigns if she wants
She's both helping herself AND helping others
