# Nepal360 Project Documentation

## Project Overview

Nepal360 is a crowdfunding platform for Nepal that allows users to create campaigns, make donations (money and items), and track their contributions. The platform includes features for KYC verification, admin management, leaderboards, and gamification through badges.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Validation**: Zod
- **Payment Integration**: Khalti API

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod resolvers
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios

---

## Project Structure

```
Nepal360/
├── backend/
│   ├── apis/                    # REST API documentation files
│   ├── generated/               # Auto-generated Prisma client
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   ├── src/
│   │   ├── app.ts               # Express app setup
│   │   ├── server.ts            # Server entry point
│   │   ├── config/
│   │   │   └── multer.ts        # File upload configuration
│   │   ├── controllers/         # Request handlers
│   │   ├── middlewares/         # Express middlewares
│   │   ├── routes/              # API route definitions
│   │   ├── schemas/             # Zod validation schemas
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   └── lib/
│   │       └── prisma.ts        # Prisma client instance
│   └── uploads/                 # Uploaded files
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/              # Base UI components
│   │   │   ├── layout/          # Layout components
│   │   │   └── campaign/        # Campaign-specific components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin pages
│   │   │   ├── auth/            # Authentication pages
│   │   │   ├── campaign/        # Campaign pages
│   │   │   └── kyc/             # KYC pages
│   │   ├── services/            # API service functions
│   │   ├── store/               # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   ├── router.tsx           # Route definitions
│   │   └── App.tsx              # Root component
│   └── public/                  # Static assets
└── docs/                        # Project documentation
```

---

## Database Schema

### Core Models

#### User
- `id`: UUID
- `name`: String
- `email`: String (unique)
- `passwordHash`: String
- `emailStatus`: ENUM (PENDING, VERIFIED)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relations**: Has one AdminRole, one KYCProfile, one DonorStats, many Campaigns, many MoneyDonations, many ItemDonations, many UserBadges, many AuditLogs, many LeaderboardEntries

#### KYCProfile
- `id`: UUID
- `userId`: String (unique, FK to User)
- `documentType`: String
- `documentNumber`: String
- `documentImage`: String
- `profilePhoto`: String
- `bankAccountName`: String
- `bankAccountNo`: String
- `walletProvider`: String?
- `status`: ENUM (NOT_SUBMITTED, PENDING, APPROVED, REJECTED)
- `rejectionReason`: String?
- `submittedAt`: DateTime
- `reviewedAt`: DateTime?

#### Campaign
- `id`: UUID
- `beneficiaryId`: String (FK to User)
- `title`: String
- `description`: String
- `coverImage`: String
- `proofLinks`: String? (JSON array)
- `targetAmount`: Decimal(12, 2)
- `status`: ENUM (DRAFT, PENDING_VERIFICATION, LIVE, SUSPENDED, COMPLETED)
- `rejectionReason`: String?
- `suspensionReason`: String?
- `verifiedBy`: String?
- `rejectedBy`: String?
- `suspendedBy`: String?
- `donationCount`: Int (default: 0)
- `shareCount`: Int (default: 0)
- `visits`: Int (default: 0)
- `isActive`: Boolean (default: true)
- `createdAt`: DateTime
- `verifiedAt`: DateTime?
- `rejectedAt`: DateTime?
- `suspendedAt`: DateTime?
- `deletedAt`: DateTime?

**Relations**: Has many Milestones, many MoneyDonations, many ItemDonations

#### Milestone
- `id`: UUID
- `campaignId`: String (FK to Campaign)
- `title`: String
- `amount`: Decimal(12, 2)
- `completed`: Boolean (default: false)
- `createdAt`: DateTime

#### MoneyDonation
- `id`: UUID
- `donorId`: String (FK to User)
- `campaignId`: String (FK to Campaign)
- `amount`: Decimal(12, 2)
- `visibility`: ENUM (PUBLIC, ANONYMOUS)
- `status`: ENUM (PENDING, COMPLETED, FAILED)
- `paymentRef`: String? (unique)
- `pidx`: String? (unique)
- `createdAt`: DateTime

#### ItemDonation
- `id`: UUID
- `donorId`: String (FK to User)
- `campaignId`: String (FK to Campaign)
- `itemName`: String
- `quantity`: String
- `deliveryNote`: String?
- `deliveryPhoto`: String?
- `status`: ENUM (PLEDGED, DELIVERED, CONFIRMED, REJECTED)
- `confirmedAt`: DateTime?
- `createdAt`: DateTime

### Gamification Models

#### Badge
- `id`: UUID
- `code`: String (unique)
- `name`: String
- `description`: String
- `iconUrl`: String
- `badgeType`: ENUM (FIRST_DONATION, LIFETIME_AMOUNT, CAMPAIGN_SUPPORTER, ITEM_DONOR, LEADERBOARD_WINNER)
- `createdAt`: DateTime

#### UserBadge
- `id`: UUID
- `userId`: String (FK to User)
- `badgeId`: String (FK to Badge)
- `awardedAt`: DateTime

**Unique constraint**: (userId, badgeId)

#### DonorStats
- `userId`: String (FK to User, unique)
- `totalMoneyDonated`: Decimal(14, 2) (default: 0)
- `totalItemCount`: Int (default: 0)
- `donationCount`: Int (default: 0)
- `lastDonationAt`: DateTime?
- `updatedAt`: DateTime

#### Leaderboard
- `id`: UUID
- `period`: ENUM (MONTHLY, CAMPAIGN, YEARLY)
- `periodKey`: String (e.g., "2026-01" for monthly)
- `createdAt`: DateTime

**Unique constraint**: (period, periodKey)

#### LeaderboardEntry
- `id`: UUID
- `leaderboardId`: String (FK to Leaderboard)
- `userId`: String (FK to User)
- `rank`: Int
- `totalAmount`: Decimal(12, 2)
- `totalItems`: Int
- `isAnonymous`: Boolean (default: false)

**Unique constraint**: (leaderboardId, userId)

### Audit Models

#### AuditLog
- `id`: UUID
- `actorType`: ENUM (ADMIN, SYSTEM)
- `actorId`: String? (FK to User)
- `actionType`: ENUM (KYC_REVIEW, CAMPAIGN_VERIFICATION, ITEM_CONFIRMATION, USER_SUSPENSION, BADGE_GRANTED, LEADERBOARD_FINALIZED)
- `targetType`: String
- `targetId`: String
- `note`: String?
- `createdAt`: DateTime

#### AdminRole
- `id`: UUID
- `userId`: String (FK to User, unique)
- `createdAt`: DateTime

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/verify-email` | Verify email with OTP | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

### Campaigns (`/api/campaigns`)

| Method | Endpoint | Description | Auth Required | Notes |
|--------|----------|-------------|---------------|-------|
| GET | `/campaigns` | Get all live campaigns | No | Public |
| GET | `/campaigns/public/:id` | Get campaign by ID | No | Public |
| POST | `/campaigns/public/:id/visit` | Increment visit count | No | Public |
| POST | `/campaigns/public/:id/share` | Increment share count | No | Public |
| GET | `/campaigns/:id/stats` | Get campaign statistics | No | Public |
| GET | `/campaigns/:id/donors` | Get campaign donors | No | Public, paginated |
| POST | `/campaigns` | Create campaign | Yes | Requires verified email + approved KYC |
| GET | `/campaigns/me` | Get my campaigns | Yes | |
| GET | `/campaigns/me/:id` | Get campaign detail | Yes | Own campaigns only |
| PUT | `/campaigns/:id` | Update campaign | Yes | Cannot update live campaigns |
| POST | `/campaigns/:id/milestones` | Add milestone | Yes | |
| DELETE | `/campaigns/:id/milestones/:milestoneId` | Delete milestone | Yes | |

### KYC (`/api/kyc`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/kyc/me` | Get my KYC status | Yes |
| POST | `/kyc/submit` | Submit KYC application | Yes |
| PUT | `/kyc/resubmit` | Resubmit rejected KYC | Yes |

### Donations (`/api/donations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/donations/money/khalti/initiate` | Initiate Khalti payment | Yes |
| POST | `/donations/money/khalti/verify` | Verify Khalti payment | Yes |
| POST | `/donations/money/khalti/callback` | Khalti webhook callback | No |
| GET | `/donations/money/me` | Get my money donations | Yes |
| POST | `/donations/items/pledge` | Pledge item donation | Yes |
| GET | `/donations/items/me` | Get my item donations | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me/stats` | Get my stats | Yes |
| GET | `/users/me/badges` | Get my badges | Yes |
| GET | `/users/me/donations` | Get my donation history | Yes |
| GET | `/users/:userId/stats` | Get public user stats | No |

### Leaderboards (`/api/leaderboards`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leaderboards` | List all leaderboards | No |
| GET | `/leaderboards/:period/:key` | Get specific leaderboard | No |

### Admin (`/api/admin`)

#### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/campaigns` | List all campaigns |
| GET | `/admin/campaigns/:id` | Get campaign detail |
| PUT | `/admin/campaigns/:id/verify` | Verify campaign |
| PUT | `/admin/campaigns/:id/reject` | Reject campaign |
| PUT | `/admin/campaigns/:id/suspend` | Suspend campaign |
| PUT | `/admin/campaigns/:id/resume` | Resume campaign |

#### KYC
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/kyc` | List all KYC applications |
| GET | `/admin/kyc/:id` | Get KYC detail |
| PUT | `/admin/kyc/:id/approve` | Approve KYC |
| PUT | `/admin/kyc/:id/reject` | Reject KYC |

#### Item Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/item-donations` | List all item donations |
| PUT | `/admin/item-donations/:id/confirm` | Confirm item donation |
| PUT | `/admin/item-donations/:id/reject` | Reject item donation |

#### Badges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/badges` | List all badges |
| POST | `/admin/badges` | Create badge |
| PUT | `/admin/badges/:id` | Update badge |
| DELETE | `/admin/badges/:id` | Delete badge |
| POST | `/admin/badges/award` | Award badge to user |

#### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/audit-logs` | List audit logs |

---

## Authentication & Authorization

### JWT Token
- Tokens are generated with a 7-day expiry
- Stored in localStorage on frontend
- Sent via Authorization header: `Bearer <token>`

### Middleware Chain

1. **authMiddleware**: Extracts and verifies JWT token
2. **requireAuth**: Requires authentication
3. **requireVerifiedEmail**: Requires email to be verified
4. **requireApprovedKYC**: Requires KYC to be approved (for campaign creation)
5. **requireAdmin**: Requires admin role

### User Roles
- **Regular User**: Can browse campaigns, donate, view own data
- **Verified User**: Email verified, can donate, submit KYC
- **Approved Beneficiary**: KYC approved, can create campaigns
- **Admin**: Full access to admin panel

---

## File Upload

### Upload Configuration
- Location: `backend/uploads/`
- Folders:
  - `campaigns/`: Campaign cover images and proof files
  - `kyc/`: KYC document and profile photos

### File Handling
- Uses Multer for file uploads
- Files are stored with relative paths in database
- Full URLs are generated in responses using base URL

---

## Payment Integration

### Khalti
- **Initiate**: Creates a pending donation and returns payment URL
- **Verify**: Verifies payment with Khalti API
- **Callback**: Handles server-to-server webhook

Environment variables:
- `KHALTI_SECRET_KEY`: Khalti secret key
- `KHALTI_API_URL`: Khalti API endpoint

---

## Frontend State Management

### Auth Store (`useAuthStore`)
```typescript
interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<CurrentUser | null>;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
}
```

### API Service
- Axios instance with automatic token attachment
- Base URL: `http://localhost:3000/api`

---

## Environment Variables

### Backend
```
JWT_SECRET=your-secret-key
KHALTI_SECRET_KEY=your-khalti-secret
KHALTI_API_URL=https://dev.khalti.com/api/v2
WEBSITE_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
```

### Frontend
```
VITE_API_URL=http://localhost:3000/api
```

---

## Running the Project

### Backend
```bash
cd backend
pnpm install
pnpm dev  # Runs with tsx watch on src/server.ts
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev  # Vite dev server on port 5173
```

---

## Common Tasks

### Creating a New API Endpoint
1. Add validation schema in `backend/src/schemas/`
2. Create controller function in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Add to main router in `backend/src/routes/index.routes.ts`

### Creating a New Frontend Page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/router.tsx`
3. Create any needed components in `frontend/src/components/`

### Database Changes
1. Edit `backend/prisma/schema.prisma`
2. Run `cd backend && ppx prisma migrate dev --name <name>`
3. Regenerate Prisma client: `pnpm prisma generate`

---

## Notes for Future Development

1. **KYC Approval Required**: Users must have approved KYC to create campaigns
2. **Campaign Status Flow**: DRAFT → PENDING_VERIFICATION → LIVE (or REJECTED)
3. **Donation Visibility**: Can be PUBLIC or ANONYMOUS
4. **File Paths**: Always use relative paths in database, generate full URLs in API responses
5. **Error Handling**: All controllers use `catchAsync` wrapper for error handling
6. **Validation**: All inputs validated with Zod schemas before processing

---

## Seed Data & Demo Credentials

The project includes a comprehensive seed script to populate the database with demo data for testing and development.

### Seed Location
- **Main Script**: [`backend/seed/index.ts`](backend/seed/index.ts)
- **Seed Data Files**:
  - [`backend/seed/users.seed.ts`](backend/seed/users.seed.ts) - User definitions
  - [`backend/seed/campaigns.seed.ts`](backend/seed/campaigns.seed.ts) - Campaign & milestone data
  - [`backend/seed/donations.seed.ts`](backend/seed/donations.seed.ts) - Money & item donations
  - [`backend/seed/badges-leaderboards.seed.ts`](backend/seed/badges-leaderboards.seed.ts) - Badges & leaderboard data

### Running the Seed
```bash
cd backend
npx ts-node seed/index.ts
```

> **Note**: The seed script automatically generates bcrypt password hashes using the same hashing logic as the production codebase (`backend/src/utils/password.ts`). Passwords are NOT stored in plain text.

### Login Credentials

After running the seed, use these credentials to test the application:

#### Admin Users
| Email | Password | Role |
|-------|----------|------|
| admin@nepal360.com | admin123 | Admin |
| superadmin@nepal360.com | superadmin123 | Super Admin |

#### Beneficiaries (Verified KYC - Can Create Campaigns)
| Email | Password | Notes |
|-------|----------|-------|
| beneficiary1@nepal360.com | beneficiary123 | Rajesh Kumar |
| beneficiary2@nepal360.com | beneficiary123 | Sita Devi |
| beneficiary3@nepal360.com | beneficiary123 | Prakash Sharma |

#### Donors (Can Donate to Campaigns)
| Email | Password | Notes |
|-------|----------|-------|
| donor1@nepal360.com | donor123 | Amit Patel |
| donor2@nepal360.com | donor123 | Priya Singh |
| donor3@nepal360.com | donor123 | Vikram Joshi |
| donor4@nepal360.com | donor123 | Anita Gupta |
| donor5@nepal360.com | donor123 | Rahul Verma |
| donor6@nepal360.com | donor123 | Neha Sharma |
| donor7@nepal360.com | donor123 | Arun Mehta |
| donor8@nepal360.com | donor123 | Pooja Reddy |
| donor9@nepal360.com | donor123 | Sanjay Kumar |
| donor10@nepal360.com | donor123 | Manisha Agarwal |

### Seed Data Included

- **Users**: 2 admins, 3 beneficiaries with approved KYC, 10 donors (15 total)
- **Campaigns**: 12 Nepal-related causes (11 LIVE, 1 COMPLETED)
- **Milestones**: Various milestones for campaigns
- **Money Donations**: 32 donations across campaigns
- **Item Donations**: 6 item donations (bags, notebooks, uniforms, etc.)
- **Donor Stats**: Stats for all donors
- **Badges**: 6 badge types
- **User Badges**: Badges assigned to donors
- **Leaderboards**: Monthly (Jan 2026, Dec 2025) and Yearly (2025)
- **Leaderboard Entries**: Top 10 entries per leaderboard

### Image Assets

The seed data references images stored in:
- **Campaign Images**: [`backend/uploads/campaigns/`](backend/uploads/campaigns/) (campaign-1.jpg through campaign-12.jpg)
- **Profile Images**: [`backend/uploads/kyc/`](backend/uploads/kyc/) (profile-1.jpg through profile-20.jpg)

These images are automatically used when the seed script runs and creates users/campaigns.
