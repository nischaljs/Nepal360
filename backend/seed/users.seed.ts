/**
 * Nepal360 Seed Data - Users
 * 
 * This file contains seed data for testing the application.
 * Copy to backend/seed/users.ts and run with ts-node or import in Prisma seed.
 * 
 * Admin Users (can manage platform)
 * - email: admin@nepal360.com | password: admin123
 * - email: superadmin@nepal360.com | password: superadmin123
 * 
 * Verified Beneficiaries (can create campaigns)
 * - email: beneficiary1@nepal360.com | password: beneficiary123
 * - email: beneficiary2@nepal360.com | password: beneficiary123
 * - email: beneficiary3@nepal360.com | password: beneficiary123
 * 
 * Donors (can donate to campaigns)
 * - email: donor1@nepal360.com | password: donor123
 * - email: donor2@nepal360.com | password: donor123
 * - email: donor3@nepal360.com | password: donor123
 * ... and many more
 */

export const adminUsers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Admin User',
    email: 'admin@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me', // Use bcrypt hash of 'admin123'
    emailStatus: 'VERIFIED' as const,
    isAdmin: true,
    kycStatus: 'APPROVED',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Super Admin',
    email: 'superadmin@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me', // Use bcrypt hash of 'superadmin123'
    emailStatus: 'VERIFIED' as const,
    isAdmin: true,
    kycStatus: 'APPROVED',
  },
];

export const beneficiaries = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Rajesh Kumar',
    email: 'beneficiary1@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me', // Use bcrypt hash of 'beneficiary123'
    emailStatus: 'VERIFIED' as const,
    kycStatus: 'APPROVED',
    profileImage: 'uploads/kyc/profile-1.jpg',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    name: 'Sita Devi',
    email: 'beneficiary2@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
    kycStatus: 'APPROVED',
    profileImage: 'uploads/kyc/profile-2.jpg',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    name: 'Prakash Sharma',
    email: 'beneficiary3@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
    kycStatus: 'APPROVED',
    profileImage: 'uploads/kyc/profile-3.jpg',
  },
];

export const donors = [
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    name: 'Amit Patel',
    email: 'donor1@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me', // Use bcrypt hash of 'donor123'
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    name: 'Priya Singh',
    email: 'donor2@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    name: 'Vikram Joshi',
    email: 'donor3@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440004',
    name: 'Anita Gupta',
    email: 'donor4@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440005',
    name: 'Rahul Verma',
    email: 'donor5@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440006',
    name: 'Neha Sharma',
    email: 'donor6@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440007',
    name: 'Arun Mehta',
    email: 'donor7@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440008',
    name: 'Pooja Reddy',
    email: 'donor8@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440009',
    name: 'Sanjay Kumar',
    email: 'donor9@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440010',
    name: 'Manisha Agarwal',
    email: 'donor10@nepal360.com',
    passwordHash: '$2a$10$placeholder_hash_replace_me',
    emailStatus: 'VERIFIED' as const,
  },
];

export const allUsers = [...adminUsers, ...beneficiaries, ...donors];

// Profile images are stored in: backend/uploads/kyc/
// Available files: profile-1.jpg through profile-20.jpg
