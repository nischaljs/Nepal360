# Frontend Structure Reference

## File Organization

```
frontend/src/
├── components/
│   ├── AdminRoute.tsx          # HOC for admin-only routes
│   ├── ProtectedRoute.tsx       # HOC for authenticated routes
│   ├── campaign/
│   │   ├── CampaignCard.tsx     # Campaign display card
│   │   ├── CampaignForm.tsx     # Create/edit campaign form
│   │   ├── DonationForm.tsx     # Donation input form
│   │   ├── DonorList.tsx        # List of donors
│   │   └── MilestoneForm.tsx    # Milestone creation form
│   ├── layout/
│   │   ├── Header.tsx           # Main navigation header
│   │   └── Footer.tsx           # Site footer
│   └── ui/                      # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── GlobalLoader.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── pagination.tsx
│       ├── radio-group.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sonner.tsx           # Toast notifications
│       ├── spinner.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── pages/
│   ├── Home.tsx                 # Landing page
│   ├── admin/
│   │   ├── AdminCampaignDetail.tsx
│   │   ├── AdminCampaignList.tsx
│   │   ├── AuditLogView.tsx
│   │   ├── BadgeManagement.tsx
│   │   ├── CampaignManagement.tsx
│   │   ├── Dashboard.tsx        # Admin dashboard
│   │   ├── ItemDonationManagement.tsx
│   │   ├── KYCManagement.tsx
│   │   └── layout/
│   │       ├── AdminLayout.tsx  # Admin page wrapper
│   │       └── Sidebar.tsx      # Admin sidebar navigation
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── VerifyEmail.tsx
│   ├── campaign/
│   │   ├── CampaignDetail.tsx   # Public campaign page
│   │   ├── CreateCampaign.tsx
│   │   ├── List.tsx             # Campaign listing
│   │   └── MyCampaigns.tsx      # User's campaigns
│   └── kyc/
│       └── KYCForm.tsx          # KYC submission form
├── services/
│   ├── api.ts                   # Axios instance with interceptors
│   ├── auth.service.ts          # Auth API calls
│   └── ...                      # Other service files
├── store/
│   └── auth.store.ts            # Zustand auth store
├── types/
│   └── auth.types.ts            # Auth-related TypeScript types
├── hooks/
│   └── useKycCheck.ts           # Custom hook for KYC status
├── lib/
│   └── utils.ts                 # Utility functions (cn, etc.)
├── router.tsx                   # Route definitions
├── App.tsx                      # Root component
├── main.tsx                     # Entry point
└── index.css                    # Global styles (Tailwind)
```

## Routing (`router.tsx`)

### Public Routes
| Path | Component |
|------|-----------|
| `/` | `Home` |
| `/signup` | `Signup` |
| `/login` | `Login` |
| `/verify-email` | `VerifyEmail` |
| `/campaigns` | `CampaignsPage` |
| `/campaigns/:id` | `CampaignDetail` |

### Protected Routes (Authentication Required)
| Path | Component | Notes |
|------|-----------|-------|
| `/kyc/submit` | `KYCForm` | |
| `/campaigns/create` | `CreateCampaign` | Requires verified email + approved KYC |
| `/campaigns/me` | `MyCampaigns` | |
| `/campaigns/me/:id` | `CampaignDetail` | Own campaigns |

### Admin Routes (Admin Role Required)
| Path | Component |
|------|-----------|
| `/admin/dashboard` | `AdminDashboard` |
| `/admin/kyc` | `KYCManagement` |
| `/admin/campaigns` | `CampaignManagement` |
| `/admin/campaigns/:id` | `AdminCampaignDetail` |
| `/admin/item-donations` | `ItemDonationManagement` |
| `/admin/badges` | `BadgeManagement` |
| `/admin/audit-logs` | `AuditLogView` |

## State Management

### Auth Store (`useAuthStore`)

```typescript
// frontend/src/store/auth.store.ts

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<CurrentUser | null>;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
}
```

**Usage:**
```typescript
import { useAuthStore } from './store/auth.store';

const { user, isAuthenticated, logout } = useAuthStore();
```

### CurrentUser Type

```typescript
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  emailStatus: "PENDING" | "VERIFIED";
  createdAt: string;
  kycProfile: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
    rejectionReason?: string;
  } | null;
  roles: {
    isAdmin: boolean;
    isVerifiedBeneficiary: boolean;
    isDonor: boolean;
  };
}
```

## API Service (`api.ts`)

```typescript
// frontend/src/services/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Request interceptor - adds auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## UI Components (Radix + Tailwind)

### Common Pattern

Components use `class-variance-authority` (cva) for variant styling:

```typescript
// Example: button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground...',
        // ...
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        // ...
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### Toast Notifications

Uses `sonner` for toast notifications:

```typescript
import { toast } from 'sonner';

toast.success('Campaign created successfully!');
toast.error('Failed to create campaign');
toast.info('Please verify your email');
```

## Custom Hooks

### useKycCheck

```typescript
import { useKycCheck } from './hooks/useKycCheck';

const { isKycApproved, isKycPending, isKycRejected } = useKycCheck();
```

## Form Handling

Uses `react-hook-form` with Zod resolvers:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## Environment Variables

```env
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

## Adding New Pages

1. Create component in `frontend/src/pages/<module>/`
2. Add route in `frontend/src/router.tsx`
3. Import and use in route definition
4. Add navigation link if needed (in Header or Sidebar)

## Adding New Components

1. Create in `frontend/src/components/<module>/`
2. Export from index if using barrel exports
3. Import in pages as needed

## Styling

- Tailwind CSS v4 for styling
- `cn()` utility for class merging (clsx + tailwind-merge)
- CSS variables in `index.css` for theming
