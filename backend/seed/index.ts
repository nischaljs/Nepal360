/**
 * Nepal360 Comprehensive Database Seed Script
 *
 * Creates a realistic system that looks like it's been actively used for ~1 week.
 * 20+ users across various phases, real donations, comments, bookmarks, etc.
 *
 * Usage:
 *   npx tsx seed/index.ts
 */

import "dotenv/config";
import * as bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper to generate dates in the past week
function daysAgo(days: number, hours = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d;
}

function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function main() {
  console.log('🌱 Starting Nepal360 comprehensive database seed...\n');

  // ============================================================
  // CLEAN UP existing data (order matters for foreign keys)
  // ============================================================
  console.log('🧹 Cleaning existing data...');
  await prisma.leaderboardEntry.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.bestWish.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.campaignUpdate.deleteMany();
  await prisma.itemDonation.deleteMany();
  await prisma.moneyDonation.deleteMany();
  await prisma.recurringDonation.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.donorStats.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.kYCProfile.deleteMany();
  await prisma.adminRole.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✅ Database cleaned\n');

  // ============================================================
  // PASSWORD HASHES (real bcrypt, salt=10)
  // ============================================================
  console.log('🔐 Hashing passwords...');
  const adminHash = await hashPassword('admin@123');
  const beneficiaryHash = await hashPassword('nepal360');
  const donorHash = await hashPassword('donor@123');
  const newUserHash = await hashPassword('password123');
  console.log('  ✅ Passwords hashed\n');

  // ============================================================
  // 1. ADMIN USERS (2)
  // ============================================================
  console.log('👑 Creating admin users...');
  const admins = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Nischal Admin', email: 'admin@nepal360.com' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Sagar Shrestha', email: 'sagar@nepal360.com' },
  ];

  for (const admin of admins) {
    await prisma.user.create({
      data: {
        ...admin,
        passwordHash: adminHash,
        emailStatus: 'VERIFIED',
        createdAt: daysAgo(10),
      },
    });
    await prisma.adminRole.create({ data: { userId: admin.id } });
    console.log(`  ✅ Admin: ${admin.email}`);
  }

  // ============================================================
  // 2. VERIFIED BENEFICIARIES with APPROVED KYC (7)
  // ============================================================
  console.log('\n🏠 Creating verified beneficiaries...');
  const beneficiaries = [
    { id: '660e8400-e29b-41d4-a716-446655440001', name: 'Rajesh Kumar Thapa', email: 'rajesh@nepal360.com', docNum: 'CT-2076-12345', bank: 'Nepal Bank Ltd', bankNo: '0123456789012', days: 8 },
    { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Sita Devi Maharjan', email: 'sita@nepal360.com', docNum: 'CT-2077-67890', bank: 'Nabil Bank', bankNo: '9876543210012', days: 7 },
    { id: '660e8400-e29b-41d4-a716-446655440003', name: 'Prakash Sharma', email: 'prakash@nepal360.com', docNum: 'CT-2078-11223', bank: 'Himalayan Bank', bankNo: '1122334455012', days: 7 },
    { id: '660e8400-e29b-41d4-a716-446655440004', name: 'Kamala Tamang', email: 'kamala@nepal360.com', docNum: 'CT-2079-44556', bank: 'Sunrise Bank', bankNo: '4455667788012', days: 6 },
    { id: '660e8400-e29b-41d4-a716-446655440005', name: 'Binod Gurung', email: 'binod@nepal360.com', docNum: 'CT-2080-77889', bank: 'Everest Bank', bankNo: '7788990011012', days: 5 },
    { id: '660e8400-e29b-41d4-a716-446655440006', name: 'Sunita Rai', email: 'sunita@nepal360.com', docNum: 'CT-2081-99001', bank: 'NIC Asia', bankNo: '9900112233012', days: 5 },
    { id: '660e8400-e29b-41d4-a716-446655440007', name: 'Dipak Bhattarai', email: 'dipak@nepal360.com', docNum: 'CT-2082-22334', bank: 'Sanima Bank', bankNo: '2233445566012', days: 4 },
  ];

  for (const b of beneficiaries) {
    const idx = beneficiaries.indexOf(b) + 1;
    await prisma.user.create({
      data: {
        id: b.id,
        name: b.name,
        email: b.email,
        passwordHash: beneficiaryHash,
        emailStatus: 'VERIFIED',
        createdAt: daysAgo(b.days),
        kycProfile: {
          create: {
            documentType: 'Citizenship',
            documentNumber: b.docNum,
            documentImage: `kyc/${b.id}/document-170830${idx}000000.jpg`,
            profilePhoto: `kyc/${b.id}/profile-170830${idx}000000.jpg`,
            bankAccountName: b.name,
            bankAccountNo: b.bankNo,
            walletProvider: idx % 2 === 0 ? 'Khalti' : 'eSewa',
            status: 'APPROVED',
            submittedAt: daysAgo(b.days),
            reviewedAt: daysAgo(b.days - 1),
          },
        },
      },
    });
    console.log(`  ✅ Beneficiary: ${b.email}`);
  }

  // ============================================================
  // 3. ACTIVE DONORS (10) - verified, have been donating
  // ============================================================
  console.log('\n💰 Creating active donors...');
  const donors = [
    { id: '770e8400-e29b-41d4-a716-446655440001', name: 'Amit Patel', email: 'amit@nepal360.com', days: 7 },
    { id: '770e8400-e29b-41d4-a716-446655440002', name: 'Priya Adhikari', email: 'priya@nepal360.com', days: 7 },
    { id: '770e8400-e29b-41d4-a716-446655440003', name: 'Vikram Joshi', email: 'vikram@nepal360.com', days: 6 },
    { id: '770e8400-e29b-41d4-a716-446655440004', name: 'Anita Basnet', email: 'anita@nepal360.com', days: 6 },
    { id: '770e8400-e29b-41d4-a716-446655440005', name: 'Rahul Khadka', email: 'rahul@nepal360.com', days: 5 },
    { id: '770e8400-e29b-41d4-a716-446655440006', name: 'Neha Shrestha', email: 'neha@nepal360.com', days: 5 },
    { id: '770e8400-e29b-41d4-a716-446655440007', name: 'Arun Karki', email: 'arun@nepal360.com', days: 4 },
    { id: '770e8400-e29b-41d4-a716-446655440008', name: 'Pooja Pandey', email: 'pooja@nepal360.com', days: 4 },
    { id: '770e8400-e29b-41d4-a716-446655440009', name: 'Sanjay Lama', email: 'sanjay@nepal360.com', days: 3 },
    { id: '770e8400-e29b-41d4-a716-446655440010', name: 'Manisha Thapa', email: 'manisha@nepal360.com', days: 3 },
  ];

  for (const d of donors) {
    await prisma.user.create({
      data: {
        id: d.id,
        name: d.name,
        email: d.email,
        passwordHash: donorHash,
        emailStatus: 'VERIFIED',
        createdAt: daysAgo(d.days),
      },
    });
    console.log(`  ✅ Donor: ${d.email}`);
  }

  // ============================================================
  // 4. KYC PENDING USER (wants to be beneficiary, just submitted KYC)
  // ============================================================
  console.log('\n⏳ Creating KYC pending user...');
  await prisma.user.create({
    data: {
      id: '770e8400-e29b-41d4-a716-446655440011',
      name: 'Ravi Poudel',
      email: 'ravi@nepal360.com',
      passwordHash: newUserHash,
      emailStatus: 'VERIFIED',
      createdAt: daysAgo(2),
      kycProfile: {
        create: {
          documentType: 'Citizenship',
          documentNumber: 'CT-2083-55667',
          documentImage: 'kyc/770e8400-e29b-41d4-a716-446655440011/document-1708308000000.jpg',
          profilePhoto: 'kyc/770e8400-e29b-41d4-a716-446655440011/profile-1708308000000.jpg',
          bankAccountName: 'Ravi Poudel',
          bankAccountNo: '5566778899012',
          status: 'PENDING',
          submittedAt: daysAgo(1),
        },
      },
    },
  });
  console.log('  ✅ KYC Pending: ravi@nepal360.com');

  // ============================================================
  // 5. KYC REJECTED USER (submitted but rejected by admin)
  // ============================================================
  console.log('\n❌ Creating KYC rejected user...');
  await prisma.user.create({
    data: {
      id: '770e8400-e29b-41d4-a716-446655440012',
      name: 'Gita Subedi',
      email: 'gita@nepal360.com',
      passwordHash: newUserHash,
      emailStatus: 'VERIFIED',
      createdAt: daysAgo(4),
      kycProfile: {
        create: {
          documentType: 'Citizenship',
          documentNumber: 'CT-2084-88990',
          documentImage: 'kyc/770e8400-e29b-41d4-a716-446655440012/document-1708309000000.jpg',
          profilePhoto: 'kyc/770e8400-e29b-41d4-a716-446655440012/profile-1708309000000.jpg',
          bankAccountName: 'Gita Subedi',
          bankAccountNo: '8899001122012',
          status: 'REJECTED',
          rejectionReason: 'Document image is blurry and not readable. Please resubmit with a clear photo.',
          submittedAt: daysAgo(3),
          reviewedAt: daysAgo(2),
        },
      },
    },
  });
  console.log('  ✅ KYC Rejected: gita@nepal360.com');

  // ============================================================
  // 6. EMAIL UNVERIFIED USERS (just signed up, haven't verified)
  // ============================================================
  console.log('\n📧 Creating unverified email users...');
  const unverifiedUsers = [
    { id: '770e8400-e29b-41d4-a716-446655440013', name: 'Bibek Koirala', email: 'bibek@nepal360.com', days: 1 },
    { id: '770e8400-e29b-41d4-a716-446655440014', name: 'Sarita Magar', email: 'sarita@nepal360.com', days: 0 },
  ];

  for (const u of unverifiedUsers) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: newUserHash,
        emailStatus: 'PENDING',
        createdAt: daysAgo(u.days),
      },
    });
    console.log(`  ✅ Unverified: ${u.email}`);
  }

  // ============================================================
  // 7. BRAND NEW USER (verified email, but no activity yet)
  // ============================================================
  console.log('\n🆕 Creating brand new user...');
  await prisma.user.create({
    data: {
      id: '770e8400-e29b-41d4-a716-446655440015',
      name: 'Deepa Thakuri',
      email: 'deepa@nepal360.com',
      passwordHash: newUserHash,
      emailStatus: 'VERIFIED',
      createdAt: daysAgo(0, 3), // Signed up 3 hours ago
    },
  });
  console.log('  ✅ New user: deepa@nepal360.com');

  console.log(`\n📊 Total users created: ${2 + 7 + 10 + 1 + 1 + 2 + 1} = 24\n`);

  // ============================================================
  // 8. CAMPAIGNS (12 campaigns across various statuses)
  // ============================================================
  console.log('📢 Creating campaigns...');

  const campaignData = [
    {
      id: '880e8400-e29b-41d4-a716-446655440001',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Help Rebuild Our School in Rural Nepal',
      description: 'Our village school in Sindhupalchok was damaged in the recent earthquake. We need funds to rebuild 3 classrooms and provide basic amenities for 150+ students. The current building is unsafe and classes are being held under temporary shelters. Every contribution brings these children closer to a safe learning environment.',
      category: 'education',
      district: 'Sindhupalchok',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440001/cover-1708300000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440001/proof-1708301000000.jpg', 'campaigns/880e8400-e29b-41d4-a716-446655440001/proof-1708302000000.jpg']),
      targetAmount: 2500000,
      status: 'LIVE' as const,
      donationCount: 89,
      shareCount: 234,
      visits: 1520,
      createdAt: daysAgo(7),
      verifiedAt: daysAgo(6, 12),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440002',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440002',
      title: 'Medical Treatment for My Son - Heart Surgery',
      description: 'My 8-year-old son Rohan needs urgent heart surgery at Shahid Gangalal National Heart Centre. We have collected some funds but still need NPR 5 Lakhs for the operation. The doctors say the surgery cannot wait any longer. Please help us save our child\'s life.',
      category: 'medical',
      district: 'Kathmandu',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440002/cover-1708310000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440002/proof-1708311000000.jpg']),
      targetAmount: 500000,
      status: 'LIVE' as const,
      donationCount: 156,
      shareCount: 445,
      visits: 2340,
      createdAt: daysAgo(7),
      verifiedAt: daysAgo(6, 8),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440003',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440003',
      title: 'Clean Water for Mountain Village in Mustang',
      description: 'Our village in Mustang district has no access to clean drinking water. Families walk 5km daily to the nearest spring. We want to install a solar-powered water pump system that will serve 50+ families. This project will take 3 months to complete and transform lives.',
      category: 'community',
      district: 'Mustang',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440003/cover-1708320000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440003/proof-1708321000000.jpg', 'campaigns/880e8400-e29b-41d4-a716-446655440003/proof-1708322000000.jpg', 'campaigns/880e8400-e29b-41d4-a716-446655440003/proof-1708323000000.jpg']),
      targetAmount: 1800000,
      status: 'LIVE' as const,
      donationCount: 67,
      shareCount: 189,
      visits: 980,
      createdAt: daysAgo(6),
      verifiedAt: daysAgo(5, 10),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440002',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440004',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440004',
      title: 'Support Orphanage Food & Education Program',
      description: 'We run Bal Mandir orphanage with 45 children aged 3-16. Your donations will provide nutritious meals, school supplies, and medical care. Every NPR 1000 feeds a child for a month. These children deserve a chance at a bright future.',
      category: 'education',
      district: 'Lalitpur',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440004/cover-1708330000000.jpg',
      proofLinks: JSON.stringify([]),
      targetAmount: 600000,
      status: 'LIVE' as const,
      donationCount: 234,
      shareCount: 567,
      visits: 3200,
      createdAt: daysAgo(6),
      verifiedAt: daysAgo(5, 6),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440005',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440005',
      title: 'Women Empowerment - Sewing Training Center',
      description: 'Help us establish a sewing training center for 30 underprivileged women in Pokhara. They will learn skills to become financially independent and support their families.',
      category: 'community',
      district: 'Kaski',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440005/cover-1708340000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440005/proof-1708341000000.jpg']),
      targetAmount: 450000,
      status: 'LIVE' as const,
      donationCount: 78,
      shareCount: 201,
      visits: 1150,
      createdAt: daysAgo(5),
      verifiedAt: daysAgo(4, 14),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440002',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440006',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440006',
      title: 'Annapurna Trekking Trail Preservation',
      description: 'Help us maintain and improve the popular Annapurna trekking trail. Funds will be used for trail markers, safety barriers, waste management facilities, and emergency shelters.',
      category: 'environment',
      district: 'Myagdi',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440006/cover-1708350000000.jpg',
      proofLinks: JSON.stringify([]),
      targetAmount: 1200000,
      status: 'LIVE' as const,
      donationCount: 45,
      shareCount: 123,
      visits: 780,
      createdAt: daysAgo(5),
      verifiedAt: daysAgo(4, 8),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440007',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Community Library for Village Children',
      description: 'Build a community library with 2000+ books, 5 computers, and study spaces for village children in Gorkha. Currently, students travel 15km to access books.',
      category: 'education',
      district: 'Gorkha',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440007/cover-1708360000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440007/proof-1708361000000.jpg']),
      targetAmount: 800000,
      status: 'LIVE' as const,
      donationCount: 112,
      shareCount: 289,
      visits: 1670,
      createdAt: daysAgo(4),
      verifiedAt: daysAgo(3, 10),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440002',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440008',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440002',
      title: 'Emergency 4x4 Ambulance for Remote Villages',
      description: 'Our rural area in Dolpa has no ambulance service. During monsoon, roads become impassable. We need a 4x4 vehicle that can reach remote villages during emergencies.',
      category: 'medical',
      district: 'Dolpa',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440008/cover-1708370000000.jpg',
      proofLinks: JSON.stringify([]),
      targetAmount: 3500000,
      status: 'LIVE' as const,
      donationCount: 201,
      shareCount: 512,
      visits: 4100,
      createdAt: daysAgo(4),
      verifiedAt: daysAgo(3, 6),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440009',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440003',
      title: 'Organic Farming Initiative - Train 50 Farmers',
      description: 'Train 50 farmers in Chitwan in organic farming techniques and provide them with seeds, tools, and equipment to sell premium organic produce.',
      category: 'community',
      district: 'Chitwan',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440009/cover-1708380000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440009/proof-1708381000000.jpg', 'campaigns/880e8400-e29b-41d4-a716-446655440009/proof-1708382000000.jpg']),
      targetAmount: 950000,
      status: 'LIVE' as const,
      donationCount: 56,
      shareCount: 145,
      visits: 890,
      createdAt: daysAgo(3),
      verifiedAt: daysAgo(2, 12),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440002',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440010',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440007',
      title: 'Elderly Day-Care Center in Bhaktapur',
      description: 'Establish a day-care center for 25 elderly people in Bhaktapur. Provide meals, medical care, and companionship for senior citizens who live alone.',
      category: 'community',
      district: 'Bhaktapur',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440010/cover-1708390000000.jpg',
      proofLinks: JSON.stringify([]),
      targetAmount: 720000,
      status: 'LIVE' as const,
      donationCount: 89,
      shareCount: 234,
      visits: 1340,
      createdAt: daysAgo(3),
      verifiedAt: daysAgo(2, 8),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440011',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440006',
      title: 'Youth Football & Basketball Academy',
      description: 'Create a sports academy for 100+ youth in Butwal. Provide equipment, professional coaching, and a safe place to play and develop skills. Sports keep youth away from drugs and give them purpose.',
      category: 'community',
      district: 'Rupandehi',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440011/cover-1708400000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440011/proof-1708401000000.jpg']),
      targetAmount: 1100000,
      status: 'PENDING_VERIFICATION' as const,
      donationCount: 0,
      shareCount: 0,
      visits: 12,
      createdAt: daysAgo(1),
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440012',
      beneficiaryId: '660e8400-e29b-41d4-a716-446655440003',
      title: 'Solar Power for Remote Health Clinic',
      description: 'Install solar panels at our village health clinic in Humla that experiences 8+ hours of power cuts daily. This will ensure continuous medical services and vaccine storage for 2000+ villagers.',
      category: 'medical',
      district: 'Humla',
      coverImage: 'campaigns/880e8400-e29b-41d4-a716-446655440012/cover-1708410000000.jpg',
      proofLinks: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440012/proof-1708411000000.jpg']),
      targetAmount: 650000,
      status: 'COMPLETED' as const,
      donationCount: 134,
      shareCount: 345,
      visits: 1890,
      createdAt: daysAgo(8),
      verifiedAt: daysAgo(7, 10),
      verifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    },
  ];

  for (const c of campaignData) {
    await prisma.campaign.create({ data: c });
    console.log(`  ✅ Campaign: ${c.title.substring(0, 50)}... [${c.status}]`);
  }

  // ============================================================
  // 9. MILESTONES
  // ============================================================
  console.log('\n🎯 Creating milestones...');
  const milestones = [
    // Campaign 1 - School
    { campaignId: '880e8400-e29b-41d4-a716-446655440001', title: 'Foundation Work', amount: 500000, completed: true, fundsReleased: true, releasedAmount: 500000, releasedAt: daysAgo(3), verifiedBy: '550e8400-e29b-41d4-a716-446655440001', claimStatus: 'APPROVED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440001', title: 'Wall Construction', amount: 1000000, completed: false, claimStatus: 'CLAIMED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440001', title: 'Furniture & Equipment', amount: 1000000, completed: false },
    // Campaign 2 - Medical
    { campaignId: '880e8400-e29b-41d4-a716-446655440002', title: 'Hospital Admission & Tests', amount: 150000, completed: true, fundsReleased: true, releasedAmount: 150000, releasedAt: daysAgo(4), verifiedBy: '550e8400-e29b-41d4-a716-446655440001', claimStatus: 'APPROVED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440002', title: 'Heart Surgery', amount: 250000, completed: false, claimStatus: 'CLAIMED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440002', title: 'Post-Operative Care', amount: 100000, completed: false },
    // Campaign 3 - Water
    { campaignId: '880e8400-e29b-41d4-a716-446655440003', title: 'Equipment Purchase', amount: 600000, completed: true, fundsReleased: true, releasedAmount: 600000, releasedAt: daysAgo(2), verifiedBy: '550e8400-e29b-41d4-a716-446655440002', claimStatus: 'APPROVED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440003', title: 'Installation', amount: 800000, completed: false },
    { campaignId: '880e8400-e29b-41d4-a716-446655440003', title: 'Testing & Handover', amount: 400000, completed: false },
    // Campaign 4 - Orphanage
    { campaignId: '880e8400-e29b-41d4-a716-446655440004', title: 'First 3 Months Food Supply', amount: 200000, completed: true, fundsReleased: true, releasedAmount: 200000, releasedAt: daysAgo(2), verifiedBy: '550e8400-e29b-41d4-a716-446655440001', claimStatus: 'APPROVED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440004', title: 'School Supplies', amount: 200000, completed: false },
    { campaignId: '880e8400-e29b-41d4-a716-446655440004', title: 'Medical Checkups', amount: 200000, completed: false },
    // Campaign 12 - Solar (COMPLETED)
    { campaignId: '880e8400-e29b-41d4-a716-446655440012', title: 'Solar Panel Purchase', amount: 350000, completed: true, fundsReleased: true, releasedAmount: 350000, releasedAt: daysAgo(4), verifiedBy: '550e8400-e29b-41d4-a716-446655440001', claimStatus: 'APPROVED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440012', title: 'Installation & Wiring', amount: 200000, completed: true, fundsReleased: true, releasedAmount: 200000, releasedAt: daysAgo(2), verifiedBy: '550e8400-e29b-41d4-a716-446655440002', claimStatus: 'APPROVED' },
    { campaignId: '880e8400-e29b-41d4-a716-446655440012', title: 'Battery Storage', amount: 100000, completed: true, fundsReleased: true, releasedAmount: 100000, releasedAt: daysAgo(1), verifiedBy: '550e8400-e29b-41d4-a716-446655440001', claimStatus: 'APPROVED' },
  ];

  for (const m of milestones) {
    await prisma.milestone.create({ data: m });
  }
  console.log(`  ✅ ${milestones.length} milestones created`);

  // ============================================================
  // 10. MONEY DONATIONS (spread across campaigns, realistic amounts)
  // ============================================================
  console.log('\n💸 Creating money donations...');
  const donationIds: string[] = [];
  const moneyDonations = [
    // Campaign 1 - School (heavily funded)
    { donorId: donors[0].id, campaignId: campaignData[0].id, amount: 50000, visibility: 'PUBLIC', createdAt: daysAgo(6, 10) },
    { donorId: donors[1].id, campaignId: campaignData[0].id, amount: 25000, visibility: 'ANONYMOUS', createdAt: daysAgo(6, 8) },
    { donorId: donors[2].id, campaignId: campaignData[0].id, amount: 10000, visibility: 'PUBLIC', createdAt: daysAgo(5, 14) },
    { donorId: donors[3].id, campaignId: campaignData[0].id, amount: 5000, visibility: 'PUBLIC', createdAt: daysAgo(5, 6) },
    { donorId: donors[4].id, campaignId: campaignData[0].id, amount: 25000, visibility: 'PUBLIC', createdAt: daysAgo(4, 12) },
    { donorId: donors[5].id, campaignId: campaignData[0].id, amount: 75000, visibility: 'PUBLIC', createdAt: daysAgo(3, 8) },
    { donorId: donors[6].id, campaignId: campaignData[0].id, amount: 15000, visibility: 'ANONYMOUS', createdAt: daysAgo(2, 6) },
    { donorId: donors[7].id, campaignId: campaignData[0].id, amount: 30000, visibility: 'PUBLIC', createdAt: daysAgo(1, 14) },

    // Campaign 2 - Medical (urgently funded, many donors)
    { donorId: donors[5].id, campaignId: campaignData[1].id, amount: 100000, visibility: 'PUBLIC', createdAt: daysAgo(6, 6) },
    { donorId: donors[6].id, campaignId: campaignData[1].id, amount: 50000, visibility: 'PUBLIC', createdAt: daysAgo(5, 12) },
    { donorId: donors[7].id, campaignId: campaignData[1].id, amount: 25000, visibility: 'ANONYMOUS', createdAt: daysAgo(5, 4) },
    { donorId: donors[8].id, campaignId: campaignData[1].id, amount: 10000, visibility: 'PUBLIC', createdAt: daysAgo(4, 10) },
    { donorId: donors[9].id, campaignId: campaignData[1].id, amount: 5000, visibility: 'PUBLIC', createdAt: daysAgo(4, 2) },
    { donorId: donors[0].id, campaignId: campaignData[1].id, amount: 40000, visibility: 'PUBLIC', createdAt: daysAgo(3, 14) },
    { donorId: donors[1].id, campaignId: campaignData[1].id, amount: 20000, visibility: 'ANONYMOUS', createdAt: daysAgo(2, 8) },
    { donorId: donors[2].id, campaignId: campaignData[1].id, amount: 35000, visibility: 'PUBLIC', createdAt: daysAgo(1, 6) },

    // Campaign 3 - Water
    { donorId: donors[0].id, campaignId: campaignData[2].id, amount: 15000, visibility: 'PUBLIC', createdAt: daysAgo(5, 8) },
    { donorId: donors[3].id, campaignId: campaignData[2].id, amount: 20000, visibility: 'PUBLIC', createdAt: daysAgo(4, 6) },
    { donorId: donors[6].id, campaignId: campaignData[2].id, amount: 50000, visibility: 'PUBLIC', createdAt: daysAgo(3, 12) },
    { donorId: donors[8].id, campaignId: campaignData[2].id, amount: 8000, visibility: 'ANONYMOUS', createdAt: daysAgo(2, 4) },

    // Campaign 4 - Orphanage (most popular by donation count)
    { donorId: donors[1].id, campaignId: campaignData[3].id, amount: 20000, visibility: 'PUBLIC', createdAt: daysAgo(5, 10) },
    { donorId: donors[3].id, campaignId: campaignData[3].id, amount: 5000, visibility: 'PUBLIC', createdAt: daysAgo(5, 4) },
    { donorId: donors[5].id, campaignId: campaignData[3].id, amount: 10000, visibility: 'ANONYMOUS', createdAt: daysAgo(4, 8) },
    { donorId: donors[7].id, campaignId: campaignData[3].id, amount: 15000, visibility: 'PUBLIC', createdAt: daysAgo(3, 6) },
    { donorId: donors[9].id, campaignId: campaignData[3].id, amount: 3000, visibility: 'PUBLIC', createdAt: daysAgo(2, 2) },
    { donorId: donors[0].id, campaignId: campaignData[3].id, amount: 25000, visibility: 'PUBLIC', createdAt: daysAgo(1, 8) },

    // Campaign 5 - Women
    { donorId: donors[2].id, campaignId: campaignData[4].id, amount: 10000, visibility: 'PUBLIC', createdAt: daysAgo(4, 10) },
    { donorId: donors[4].id, campaignId: campaignData[4].id, amount: 15000, visibility: 'PUBLIC', createdAt: daysAgo(3, 8) },
    { donorId: donors[8].id, campaignId: campaignData[4].id, amount: 5000, visibility: 'ANONYMOUS', createdAt: daysAgo(2, 6) },

    // Campaign 6 - Trekking
    { donorId: donors[3].id, campaignId: campaignData[5].id, amount: 25000, visibility: 'PUBLIC', createdAt: daysAgo(4, 4) },
    { donorId: donors[6].id, campaignId: campaignData[5].id, amount: 30000, visibility: 'PUBLIC', createdAt: daysAgo(3, 2) },

    // Campaign 7 - Library
    { donorId: donors[4].id, campaignId: campaignData[6].id, amount: 5000, visibility: 'PUBLIC', createdAt: daysAgo(3, 6) },
    { donorId: donors[7].id, campaignId: campaignData[6].id, amount: 20000, visibility: 'PUBLIC', createdAt: daysAgo(2, 4) },
    { donorId: donors[9].id, campaignId: campaignData[6].id, amount: 10000, visibility: 'ANONYMOUS', createdAt: daysAgo(1, 10) },

    // Campaign 8 - Ambulance (high value donations)
    { donorId: donors[5].id, campaignId: campaignData[7].id, amount: 100000, visibility: 'PUBLIC', createdAt: daysAgo(3, 10) },
    { donorId: donors[0].id, campaignId: campaignData[7].id, amount: 50000, visibility: 'PUBLIC', createdAt: daysAgo(2, 8) },
    { donorId: donors[7].id, campaignId: campaignData[7].id, amount: 75000, visibility: 'PUBLIC', createdAt: daysAgo(1, 12) },
    { donorId: donors[2].id, campaignId: campaignData[7].id, amount: 30000, visibility: 'ANONYMOUS', createdAt: daysAgo(1, 4) },

    // Campaign 9 - Farming
    { donorId: donors[6].id, campaignId: campaignData[8].id, amount: 15000, visibility: 'PUBLIC', createdAt: daysAgo(2, 10) },
    { donorId: donors[8].id, campaignId: campaignData[8].id, amount: 20000, visibility: 'PUBLIC', createdAt: daysAgo(1, 8) },

    // Campaign 10 - Elderly
    { donorId: donors[1].id, campaignId: campaignData[9].id, amount: 10000, visibility: 'PUBLIC', createdAt: daysAgo(2, 6) },
    { donorId: donors[4].id, campaignId: campaignData[9].id, amount: 25000, visibility: 'ANONYMOUS', createdAt: daysAgo(1, 14) },
    { donorId: donors[9].id, campaignId: campaignData[9].id, amount: 8000, visibility: 'PUBLIC', createdAt: daysAgo(1, 2) },

    // Campaign 12 - Solar (COMPLETED - fully funded)
    { donorId: donors[5].id, campaignId: campaignData[11].id, amount: 150000, visibility: 'PUBLIC', createdAt: daysAgo(7, 8) },
    { donorId: donors[0].id, campaignId: campaignData[11].id, amount: 100000, visibility: 'PUBLIC', createdAt: daysAgo(6, 12) },
    { donorId: donors[2].id, campaignId: campaignData[11].id, amount: 75000, visibility: 'PUBLIC', createdAt: daysAgo(6, 4) },
    { donorId: donors[3].id, campaignId: campaignData[11].id, amount: 50000, visibility: 'ANONYMOUS', createdAt: daysAgo(5, 10) },
    { donorId: donors[7].id, campaignId: campaignData[11].id, amount: 100000, visibility: 'PUBLIC', createdAt: daysAgo(5, 6) },
    { donorId: donors[9].id, campaignId: campaignData[11].id, amount: 25000, visibility: 'PUBLIC', createdAt: daysAgo(4, 8) },
    { donorId: donors[1].id, campaignId: campaignData[11].id, amount: 80000, visibility: 'PUBLIC', createdAt: daysAgo(4, 2) },
    { donorId: donors[4].id, campaignId: campaignData[11].id, amount: 70000, visibility: 'PUBLIC', createdAt: daysAgo(3, 14) },
  ];

  for (const d of moneyDonations) {
    const id = randomUUID();
    donationIds.push(id);
    await prisma.moneyDonation.create({
      data: {
        id,
        donorId: d.donorId,
        campaignId: d.campaignId,
        amount: d.amount,
        visibility: d.visibility as any,
        status: 'COMPLETED',
        createdAt: d.createdAt,
      },
    });
  }
  console.log(`  ✅ ${moneyDonations.length} money donations created`);

  // ============================================================
  // 11. ITEM DONATIONS
  // ============================================================
  console.log('\n📦 Creating item donations...');
  const itemDonations = [
    { donorId: donors[0].id, campaignId: campaignData[3].id, itemName: 'School Bags', quantity: '25', status: 'CONFIRMED', deliveryPhoto: 'campaigns/880e8400-e29b-41d4-a716-446655440004/delivery-1708311000000.jpg', confirmedAt: daysAgo(3), createdAt: daysAgo(5, 8) },
    { donorId: donors[1].id, campaignId: campaignData[3].id, itemName: 'Notebooks & Pens', quantity: '100 notebooks, 200 pens', status: 'CONFIRMED', deliveryPhoto: 'campaigns/880e8400-e29b-41d4-a716-446655440004/delivery-1708312000000.jpg', confirmedAt: daysAgo(2), createdAt: daysAgo(4, 6) },
    { donorId: donors[2].id, campaignId: campaignData[3].id, itemName: 'School Uniforms', quantity: '30', status: 'DELIVERED', deliveryPhoto: 'campaigns/880e8400-e29b-41d4-a716-446655440004/delivery-1708313000000.jpg', createdAt: daysAgo(3, 4) },
    { donorId: donors[3].id, campaignId: campaignData[3].id, itemName: 'Shoes', quantity: '20 pairs', status: 'CONFIRMED', deliveryPhoto: 'campaigns/880e8400-e29b-41d4-a716-446655440004/delivery-1708314000000.jpg', confirmedAt: daysAgo(1), createdAt: daysAgo(3, 2) },
    { donorId: donors[4].id, campaignId: campaignData[3].id, itemName: 'Textbooks', quantity: '50', status: 'PLEDGED', createdAt: daysAgo(1, 8) },
    { donorId: donors[5].id, campaignId: campaignData[3].id, itemName: 'Rice (50kg bags)', quantity: '10 bags', status: 'DELIVERED', deliveryPhoto: 'campaigns/880e8400-e29b-41d4-a716-446655440004/delivery-1708315000000.jpg', createdAt: daysAgo(2, 10) },
    { donorId: donors[8].id, campaignId: campaignData[0].id, itemName: 'Bricks', quantity: '500', status: 'CONFIRMED', confirmedAt: daysAgo(2), createdAt: daysAgo(4, 8) },
    { donorId: donors[9].id, campaignId: campaignData[0].id, itemName: 'Cement bags', quantity: '20', status: 'PLEDGED', createdAt: daysAgo(1, 4) },
  ];

  for (const item of itemDonations) {
    await prisma.itemDonation.create({ data: item });
  }
  console.log(`  ✅ ${itemDonations.length} item donations created`);

  // ============================================================
  // 12. DONOR STATS (calculated from actual donations)
  // ============================================================
  console.log('\n📈 Creating donor stats...');
  const donorStatsData = [
    { userId: donors[0].id, totalMoneyDonated: 180000, totalItemCount: 1, donationCount: 6, lastDonationAt: daysAgo(1, 8) },
    { userId: donors[1].id, totalMoneyDonated: 155000, totalItemCount: 1, donationCount: 5, lastDonationAt: daysAgo(2, 8) },
    { userId: donors[2].id, totalMoneyDonated: 160000, totalItemCount: 1, donationCount: 5, lastDonationAt: daysAgo(1, 4) },
    { userId: donors[3].id, totalMoneyDonated: 105000, totalItemCount: 1, donationCount: 5, lastDonationAt: daysAgo(1, 14) },
    { userId: donors[4].id, totalMoneyDonated: 115000, totalItemCount: 0, donationCount: 4, lastDonationAt: daysAgo(1, 8) },
    { userId: donors[5].id, totalMoneyDonated: 435000, totalItemCount: 1, donationCount: 5, lastDonationAt: daysAgo(3, 8) },
    { userId: donors[6].id, totalMoneyDonated: 110000, totalItemCount: 0, donationCount: 4, lastDonationAt: daysAgo(2, 6) },
    { userId: donors[7].id, totalMoneyDonated: 240000, totalItemCount: 0, donationCount: 5, lastDonationAt: daysAgo(1, 12) },
    { userId: donors[8].id, totalMoneyDonated: 43000, totalItemCount: 1, donationCount: 4, lastDonationAt: daysAgo(1, 8) },
    { userId: donors[9].id, totalMoneyDonated: 43000, totalItemCount: 0, donationCount: 4, lastDonationAt: daysAgo(1, 2) },
  ];

  for (const ds of donorStatsData) {
    await prisma.donorStats.create({ data: ds });
  }
  console.log(`  ✅ ${donorStatsData.length} donor stats created`);

  // ============================================================
  // 13. CAMPAIGN UPDATES (Impact Stories)
  // ============================================================
  console.log('\n📝 Creating campaign updates...');
  const updates = [
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440001',
      campaignId: campaignData[0].id,
      userId: beneficiaries[0].id,
      title: 'Foundation Work Complete!',
      content: 'We are thrilled to announce that the foundation work for our new school building is now complete! The foundation has been laid with proper earthquake-resistant technology. Our team of engineers ensured that the building meets all safety standards. Next week, we begin the wall construction phase. Thanks to all our donors who made this possible!',
      images: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440001/proof-1708301000000.jpg', 'campaigns/880e8400-e29b-41d4-a716-446655440001/proof-1708302000000.jpg']),
      isMilestone: true,
      createdAt: daysAgo(4),
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440002',
      campaignId: campaignData[0].id,
      userId: beneficiaries[0].id,
      title: 'Thank You from Our Students',
      content: 'Dear donors, The students of our village wanted to share their gratitude with all of you. They wrote thank you letters and drew pictures expressing how excited they are about their new school. One student, Maya (age 10), said: "I can\'t wait to study in a real classroom with proper desks and books!" Your generosity is changing lives one brick at a time.',
      images: JSON.stringify([]),
      isMilestone: false,
      createdAt: daysAgo(2),
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440003',
      campaignId: campaignData[1].id,
      userId: beneficiaries[1].id,
      title: 'Surgery Scheduled!',
      content: 'Great news! Thanks to your generous donations, we have scheduled my son\'s heart surgery for next Monday at Shahid Gangalal National Heart Centre. The doctors are confident about the procedure. I cannot express in words how grateful I am to each and every one of you who contributed. You are giving my son a second chance at life.',
      images: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440002/proof-1708311000000.jpg']),
      isMilestone: true,
      createdAt: daysAgo(3),
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440004',
      campaignId: campaignData[2].id,
      userId: beneficiaries[2].id,
      title: 'Water Pump Equipment Arrived!',
      content: 'The solar-powered water pump equipment has arrived in our village! The installation team will begin work next week. Our 50+ families will finally have access to clean drinking water. No more walking 5 kilometers to the nearest spring! This is a life-changing moment for our entire community.',
      images: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440003/proof-1708321000000.jpg', 'campaigns/880e8400-e29b-41d4-a716-446655440003/proof-1708322000000.jpg']),
      isMilestone: true,
      createdAt: daysAgo(2),
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440005',
      campaignId: campaignData[7].id,
      userId: beneficiaries[1].id,
      title: 'Ambulance 90% Funded!',
      content: 'We are just NPR 350,000 away from our goal! The 4x4 ambulance has been selected and is ready for purchase. Once funded, it will serve 12 remote villages in our district. During monsoon season, this ambulance could be the difference between life and death. Please share this campaign!',
      images: JSON.stringify([]),
      isMilestone: false,
      createdAt: daysAgo(1),
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440006',
      campaignId: campaignData[11].id,
      userId: beneficiaries[2].id,
      title: 'Solar Panels Successfully Installed!',
      content: 'We are beyond grateful! The solar panel installation is complete. Our health clinic in Humla now has 24/7 electricity. Vaccines are stored safely, and we can operate medical equipment without interruption. This has transformed healthcare for 2000+ villagers. Thank you to every single donor!',
      images: JSON.stringify(['campaigns/880e8400-e29b-41d4-a716-446655440012/proof-1708411000000.jpg']),
      isMilestone: true,
      createdAt: daysAgo(1),
    },
  ];

  for (const u of updates) {
    await prisma.campaignUpdate.create({ data: u });
  }
  console.log(`  ✅ ${updates.length} campaign updates created`);

  // ============================================================
  // 14. BEST WISHES (tied to actual donation IDs)
  // ============================================================
  console.log('\n💌 Creating best wishes...');
  const wishes = [
    { donationId: donationIds[0], userId: donors[0].id, campaignId: campaignData[0].id, message: 'May this school become a beacon of hope for generations to come. Proud to support this cause!', cardStyle: 'festive', isAnonymous: false },
    { donationId: donationIds[2], userId: donors[2].id, campaignId: campaignData[0].id, message: 'Education is the foundation of a better tomorrow. Wishing you all the success!', cardStyle: 'heartfelt', isAnonymous: false },
    { donationId: donationIds[5], userId: donors[5].id, campaignId: campaignData[0].id, message: 'Building dreams one brick at a time. The children deserve this!', cardStyle: 'simple', isAnonymous: false },
    { donationId: donationIds[8], userId: donors[5].id, campaignId: campaignData[1].id, message: 'Praying for a successful surgery and quick recovery. Stay strong little one!', cardStyle: 'heartfelt', isAnonymous: false },
    { donationId: donationIds[9], userId: donors[6].id, campaignId: campaignData[1].id, message: 'May your son regain health and bring joy to your family. Our thoughts are with you!', cardStyle: 'heartfelt', isAnonymous: false },
    { donationId: donationIds[13], userId: donors[0].id, campaignId: campaignData[1].id, message: 'We believe in miracles. This surgery will be successful. God bless your family!', cardStyle: 'festive', isAnonymous: false },
    { donationId: donationIds[16], userId: donors[0].id, campaignId: campaignData[2].id, message: 'Clean water is a basic right. Proud to help bring this essential resource to your village!', cardStyle: 'simple', isAnonymous: false },
    { donationId: donationIds[20], userId: donors[1].id, campaignId: campaignData[3].id, message: 'May these children feel the love and support of our entire community. You are not alone!', cardStyle: 'heartfelt', isAnonymous: false },
    { donationId: donationIds[34], userId: donors[5].id, campaignId: campaignData[7].id, message: 'This ambulance will save countless lives. Heroes for making this happen!', cardStyle: 'festive', isAnonymous: false },
    { donorId: donors[7].id, donationId: donationIds[36], userId: donors[7].id, campaignId: campaignData[7].id, message: 'Emergency care should be accessible to all. Proud to support this life-saving project!', cardStyle: 'simple', isAnonymous: false },
  ];

  for (const w of wishes) {
    await prisma.bestWish.create({
      data: {
        donationId: w.donationId,
        userId: w.userId,
        campaignId: w.campaignId,
        message: w.message,
        cardStyle: w.cardStyle,
        isAnonymous: w.isAnonymous,
      },
    });
  }
  console.log(`  ✅ ${wishes.length} best wishes created`);

  // ============================================================
  // 15. COMMENTS (community discussion on campaigns)
  // ============================================================
  console.log('\n💬 Creating comments...');
  const comments = [
    // Campaign 1 - School
    { userId: donors[0].id, campaignId: campaignData[0].id, content: 'This is an amazing initiative! The children of Nepal deserve quality education. Proud to support this.', createdAt: daysAgo(5, 10) },
    { userId: donors[2].id, campaignId: campaignData[0].id, content: 'I visited this village last year. The school really needs rebuilding. Keep going Rajesh ji!', createdAt: daysAgo(4, 8) },
    { userId: donors[5].id, campaignId: campaignData[0].id, content: 'Just donated. Sharing this with all my friends too. Education changes everything!', createdAt: daysAgo(3, 6) },
    { userId: beneficiaries[0].id, campaignId: campaignData[0].id, content: 'Thank you everyone for your generous support! The construction is progressing well. Will post an update soon.', createdAt: daysAgo(2, 12) },

    // Campaign 2 - Medical
    { userId: donors[6].id, campaignId: campaignData[1].id, content: 'Praying for the little one. May the surgery be successful!', createdAt: daysAgo(5, 6) },
    { userId: donors[8].id, campaignId: campaignData[1].id, content: 'Please share this widely. Every rupee counts for this child\'s life!', createdAt: daysAgo(4, 4) },
    { userId: donors[0].id, campaignId: campaignData[1].id, content: 'Donated from our family. We are rooting for you Sita didi!', createdAt: daysAgo(3, 8) },
    { userId: beneficiaries[1].id, campaignId: campaignData[1].id, content: 'I cannot thank you all enough. My son smiled today knowing people care about him. Surgery is scheduled!', createdAt: daysAgo(2, 2) },
    { userId: donors[1].id, campaignId: campaignData[1].id, content: 'Such a wonderful community we have here. Glad to help!', createdAt: daysAgo(1, 10) },

    // Campaign 3 - Water
    { userId: donors[3].id, campaignId: campaignData[2].id, content: 'Clean water access is fundamental. Great project for Mustang!', createdAt: daysAgo(4, 10) },
    { userId: donors[6].id, campaignId: campaignData[2].id, content: 'Solar-powered water pump is a brilliant idea for a remote area like this.', createdAt: daysAgo(3, 4) },

    // Campaign 4 - Orphanage
    { userId: donors[1].id, campaignId: campaignData[3].id, content: 'These children are our future. Happy to donate food supplies!', createdAt: daysAgo(4, 8) },
    { userId: donors[4].id, campaignId: campaignData[3].id, content: 'Will visit the orphanage next month. Would love to teach the kids!', createdAt: daysAgo(3, 2) },
    { userId: donors[7].id, campaignId: campaignData[3].id, content: 'Monthly donations are the best way to ensure consistent support. Just set up mine!', createdAt: daysAgo(2, 6) },

    // Campaign 8 - Ambulance
    { userId: donors[5].id, campaignId: campaignData[7].id, content: 'Almost there! Just a bit more and Dolpa will have an ambulance. Let\'s do this!', createdAt: daysAgo(2, 8) },
    { userId: donors[0].id, campaignId: campaignData[7].id, content: 'The roads in Dolpa are terrible. A 4x4 ambulance will literally save lives.', createdAt: daysAgo(1, 6) },
    { userId: donors[2].id, campaignId: campaignData[7].id, content: 'Shared with 50+ people. This campaign needs to go viral!', createdAt: daysAgo(1, 2) },

    // Campaign 12 - Solar (completed)
    { userId: donors[5].id, campaignId: campaignData[11].id, content: 'So proud that this got fully funded! The clinic will serve thousands now.', createdAt: daysAgo(2, 4) },
    { userId: donors[0].id, campaignId: campaignData[11].id, content: 'This is what Nepal360 is all about - real impact, real results!', createdAt: daysAgo(1, 8) },
    { userId: beneficiaries[2].id, campaignId: campaignData[11].id, content: 'From the bottom of our hearts, THANK YOU! The solar panels are working perfectly. 24/7 electricity at the clinic!', createdAt: daysAgo(1, 2) },
  ];

  for (const c of comments) {
    await prisma.comment.create({ data: c });
  }
  console.log(`  ✅ ${comments.length} comments created`);

  // ============================================================
  // 16. BOOKMARKS
  // ============================================================
  console.log('\n🔖 Creating bookmarks...');
  const bookmarks = [
    { userId: donors[0].id, campaignId: campaignData[0].id },
    { userId: donors[0].id, campaignId: campaignData[1].id },
    { userId: donors[0].id, campaignId: campaignData[7].id },
    { userId: donors[1].id, campaignId: campaignData[0].id },
    { userId: donors[1].id, campaignId: campaignData[3].id },
    { userId: donors[2].id, campaignId: campaignData[1].id },
    { userId: donors[2].id, campaignId: campaignData[7].id },
    { userId: donors[3].id, campaignId: campaignData[2].id },
    { userId: donors[4].id, campaignId: campaignData[3].id },
    { userId: donors[4].id, campaignId: campaignData[6].id },
    { userId: donors[5].id, campaignId: campaignData[0].id },
    { userId: donors[5].id, campaignId: campaignData[1].id },
    { userId: donors[5].id, campaignId: campaignData[7].id },
    { userId: donors[5].id, campaignId: campaignData[11].id },
    { userId: donors[6].id, campaignId: campaignData[2].id },
    { userId: donors[7].id, campaignId: campaignData[3].id },
    { userId: donors[7].id, campaignId: campaignData[7].id },
    { userId: donors[8].id, campaignId: campaignData[0].id },
    { userId: donors[9].id, campaignId: campaignData[9].id },
    // New user bookmarked campaigns but hasn't donated yet
    { userId: '770e8400-e29b-41d4-a716-446655440015', campaignId: campaignData[0].id },
    { userId: '770e8400-e29b-41d4-a716-446655440015', campaignId: campaignData[1].id },
  ];

  for (const b of bookmarks) {
    await prisma.bookmark.create({ data: { userId: b.userId, campaignId: b.campaignId } });
  }
  console.log(`  ✅ ${bookmarks.length} bookmarks created`);

  // ============================================================
  // 17. NOTIFICATIONS (various types)
  // ============================================================
  console.log('\n🔔 Creating notifications...');
  const notifications = [
    // Donation received notifications for beneficiaries
    { userId: beneficiaries[0].id, type: 'DONATION_RECEIVED' as const, title: 'New Donation Received!', message: 'Amit Patel donated NPR 50,000 to your campaign "Help Rebuild Our School"', link: `/campaigns/${campaignData[0].id}`, isRead: true, createdAt: daysAgo(6, 10) },
    { userId: beneficiaries[0].id, type: 'DONATION_RECEIVED' as const, title: 'New Donation Received!', message: 'Anonymous donated NPR 25,000 to your campaign "Help Rebuild Our School"', link: `/campaigns/${campaignData[0].id}`, isRead: true, createdAt: daysAgo(6, 8) },
    { userId: beneficiaries[0].id, type: 'DONATION_RECEIVED' as const, title: 'New Donation Received!', message: 'Neha Shrestha donated NPR 75,000 to your campaign "Help Rebuild Our School"', link: `/campaigns/${campaignData[0].id}`, isRead: false, createdAt: daysAgo(3, 8) },
    { userId: beneficiaries[1].id, type: 'DONATION_RECEIVED' as const, title: 'New Donation Received!', message: 'Neha Shrestha donated NPR 100,000 to your campaign "Medical Treatment for My Son"', link: `/campaigns/${campaignData[1].id}`, isRead: true, createdAt: daysAgo(6, 6) },
    { userId: beneficiaries[1].id, type: 'DONATION_RECEIVED' as const, title: 'New Donation Received!', message: 'Vikram Joshi donated NPR 35,000 to your campaign "Medical Treatment for My Son"', link: `/campaigns/${campaignData[1].id}`, isRead: false, createdAt: daysAgo(1, 6) },

    // Campaign verified notifications
    { userId: beneficiaries[0].id, type: 'CAMPAIGN_VERIFIED' as const, title: 'Campaign Verified!', message: 'Your campaign "Help Rebuild Our School" has been verified and is now LIVE!', link: `/campaigns/${campaignData[0].id}`, isRead: true, createdAt: daysAgo(6, 12) },
    { userId: beneficiaries[1].id, type: 'CAMPAIGN_VERIFIED' as const, title: 'Campaign Verified!', message: 'Your campaign "Medical Treatment for My Son" has been verified and is now LIVE!', link: `/campaigns/${campaignData[1].id}`, isRead: true, createdAt: daysAgo(6, 8) },
    { userId: beneficiaries[2].id, type: 'CAMPAIGN_VERIFIED' as const, title: 'Campaign Verified!', message: 'Your campaign "Clean Water for Mountain Village" has been verified and is now LIVE!', link: `/campaigns/${campaignData[2].id}`, isRead: true, createdAt: daysAgo(5, 10) },

    // Milestone notifications
    { userId: beneficiaries[0].id, type: 'MILESTONE_COMPLETED' as const, title: 'Milestone Funds Released!', message: 'NPR 500,000 has been released for "Foundation Work" milestone.', link: `/campaigns/${campaignData[0].id}`, isRead: true, createdAt: daysAgo(3) },

    // Badge earned notifications
    { userId: donors[5].id, type: 'BADGE_EARNED' as const, title: 'Badge Earned!', message: 'You earned the "Generous Heart" badge for donating over NPR 50,000!', link: '/profile', isRead: false, createdAt: daysAgo(3, 8) },
    { userId: donors[0].id, type: 'BADGE_EARNED' as const, title: 'Badge Earned!', message: 'You earned the "First Donation" badge! Welcome to the Nepal360 community!', link: '/profile', isRead: true, createdAt: daysAgo(6, 10) },
    { userId: donors[0].id, type: 'BADGE_EARNED' as const, title: 'Badge Earned!', message: 'You earned the "Campaign Champion" badge for supporting 5+ campaigns!', link: '/profile', isRead: false, createdAt: daysAgo(1, 8) },

    // Comment received notifications
    { userId: beneficiaries[0].id, type: 'COMMENT_RECEIVED' as const, title: 'New Comment!', message: 'Amit Patel commented on your campaign "Help Rebuild Our School"', link: `/campaigns/${campaignData[0].id}`, isRead: false, createdAt: daysAgo(5, 10) },
    { userId: beneficiaries[1].id, type: 'COMMENT_RECEIVED' as const, title: 'New Comment!', message: 'Arun Karki commented on your campaign "Medical Treatment for My Son"', link: `/campaigns/${campaignData[1].id}`, isRead: false, createdAt: daysAgo(5, 6) },

    // Campaign update notifications for donors who bookmarked
    { userId: donors[0].id, type: 'CAMPAIGN_UPDATE' as const, title: 'Campaign Update!', message: 'Rajesh Kumar posted an update on "Help Rebuild Our School": Foundation Work Complete!', link: `/campaigns/${campaignData[0].id}`, isRead: true, createdAt: daysAgo(4) },
    { userId: donors[5].id, type: 'CAMPAIGN_UPDATE' as const, title: 'Campaign Update!', message: 'Sita Devi posted an update on "Emergency Ambulance": Ambulance 90% Funded!', link: `/campaigns/${campaignData[7].id}`, isRead: false, createdAt: daysAgo(1) },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
  console.log(`  ✅ ${notifications.length} notifications created`);

  // ============================================================
  // 18. BADGES
  // ============================================================
  console.log('\n🏅 Creating badges...');
  const badgeData = [
    { id: '990e8400-e29b-41d4-a716-446655440001', code: 'FIRST_DONATION', name: 'First Donation', description: 'Made your first donation to a campaign', iconUrl: '', badgeType: 'FIRST_DONATION' as const },
    { id: '990e8400-e29b-41d4-a716-446655440002', code: 'GENEROUS_HEART', name: 'Generous Heart', description: 'Donated NPR 50,000 or more in total', iconUrl: '', badgeType: 'LIFETIME_AMOUNT' as const },
    { id: '990e8400-e29b-41d4-a716-446655440003', code: 'CAMPAIGN_CHAMPION', name: 'Campaign Champion', description: 'Supported 5 or more different campaigns', iconUrl: '', badgeType: 'CAMPAIGN_SUPPORTER' as const },
    { id: '990e8400-e29b-41d4-a716-446655440004', code: 'ITEM_HERO', name: 'Item Hero', description: 'Donated items to campaigns', iconUrl: '', badgeType: 'ITEM_DONOR' as const },
    { id: '990e8400-e29b-41d4-a716-446655440005', code: 'TOP_DONOR_FEB_2026', name: 'Top Donor - February 2026', description: 'Ranked #1 in donations for February 2026', iconUrl: '', badgeType: 'LEADERBOARD_WINNER' as const },
    { id: '990e8400-e29b-41d4-a716-446655440006', code: 'TOP_5_DONOR', name: 'Top 5 Donor', description: 'Ranked in top 5 donors this month', iconUrl: '', badgeType: 'LEADERBOARD_WINNER' as const },
  ];

  for (const b of badgeData) {
    await prisma.badge.create({ data: b });
  }
  console.log(`  ✅ ${badgeData.length} badges created`);

  // ============================================================
  // 19. USER BADGES (awarded based on activity)
  // ============================================================
  console.log('\n🎖️ Awarding user badges...');
  const userBadges = [
    // Neha - top donor, has many badges
    { userId: donors[5].id, badgeId: badgeData[0].id, awardedAt: daysAgo(5) },
    { userId: donors[5].id, badgeId: badgeData[1].id, awardedAt: daysAgo(4) },
    { userId: donors[5].id, badgeId: badgeData[2].id, awardedAt: daysAgo(3) },
    { userId: donors[5].id, badgeId: badgeData[4].id, awardedAt: daysAgo(1) },
    // Amit - active donor
    { userId: donors[0].id, badgeId: badgeData[0].id, awardedAt: daysAgo(6) },
    { userId: donors[0].id, badgeId: badgeData[1].id, awardedAt: daysAgo(4) },
    { userId: donors[0].id, badgeId: badgeData[2].id, awardedAt: daysAgo(2) },
    // Priya
    { userId: donors[1].id, badgeId: badgeData[0].id, awardedAt: daysAgo(6) },
    { userId: donors[1].id, badgeId: badgeData[1].id, awardedAt: daysAgo(3) },
    // Vikram
    { userId: donors[2].id, badgeId: badgeData[0].id, awardedAt: daysAgo(5) },
    { userId: donors[2].id, badgeId: badgeData[1].id, awardedAt: daysAgo(3) },
    // Pooja - item donor
    { userId: donors[7].id, badgeId: badgeData[0].id, awardedAt: daysAgo(4) },
    { userId: donors[7].id, badgeId: badgeData[1].id, awardedAt: daysAgo(2) },
    // Others with first donation badge
    { userId: donors[3].id, badgeId: badgeData[0].id, awardedAt: daysAgo(5) },
    { userId: donors[4].id, badgeId: badgeData[0].id, awardedAt: daysAgo(4) },
    { userId: donors[6].id, badgeId: badgeData[0].id, awardedAt: daysAgo(4) },
    { userId: donors[8].id, badgeId: badgeData[0].id, awardedAt: daysAgo(3) },
    { userId: donors[9].id, badgeId: badgeData[0].id, awardedAt: daysAgo(3) },
    // Item donors
    { userId: donors[0].id, badgeId: badgeData[3].id, awardedAt: daysAgo(3) },
    { userId: donors[1].id, badgeId: badgeData[3].id, awardedAt: daysAgo(2) },
  ];

  for (const ub of userBadges) {
    await prisma.userBadge.create({ data: ub });
  }
  console.log(`  ✅ ${userBadges.length} user badges awarded`);

  // ============================================================
  // 20. LEADERBOARDS
  // ============================================================
  console.log('\n🏆 Creating leaderboards...');
  const leaderboards = [
    { id: 'aa0e8400-e29b-41d4-a716-446655440001', period: 'MONTHLY' as const, periodKey: '2026-02' },
    { id: 'aa0e8400-e29b-41d4-a716-446655440002', period: 'MONTHLY' as const, periodKey: '2026-01' },
    { id: 'aa0e8400-e29b-41d4-a716-446655440003', period: 'YEARLY' as const, periodKey: '2026' },
  ];

  for (const lb of leaderboards) {
    await prisma.leaderboard.create({ data: lb });
  }

  const leaderboardEntries = [
    // February 2026 (current month)
    { leaderboardId: leaderboards[0].id, userId: donors[5].id, rank: 1, totalAmount: 435000, totalItems: 1, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[7].id, rank: 2, totalAmount: 240000, totalItems: 0, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[0].id, rank: 3, totalAmount: 180000, totalItems: 1, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[2].id, rank: 4, totalAmount: 160000, totalItems: 1, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[1].id, rank: 5, totalAmount: 155000, totalItems: 1, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[4].id, rank: 6, totalAmount: 115000, totalItems: 0, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[6].id, rank: 7, totalAmount: 110000, totalItems: 0, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[3].id, rank: 8, totalAmount: 105000, totalItems: 1, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[8].id, rank: 9, totalAmount: 43000, totalItems: 1, isAnonymous: false },
    { leaderboardId: leaderboards[0].id, userId: donors[9].id, rank: 10, totalAmount: 43000, totalItems: 0, isAnonymous: false },

    // January 2026 (last month)
    { leaderboardId: leaderboards[1].id, userId: donors[0].id, rank: 1, totalAmount: 200000, totalItems: 5, isAnonymous: false },
    { leaderboardId: leaderboards[1].id, userId: donors[5].id, rank: 2, totalAmount: 180000, totalItems: 3, isAnonymous: false },
    { leaderboardId: leaderboards[1].id, userId: donors[1].id, rank: 3, totalAmount: 120000, totalItems: 4, isAnonymous: false },

    // 2026 Yearly
    { leaderboardId: leaderboards[2].id, userId: donors[5].id, rank: 1, totalAmount: 615000, totalItems: 4, isAnonymous: false },
    { leaderboardId: leaderboards[2].id, userId: donors[0].id, rank: 2, totalAmount: 380000, totalItems: 6, isAnonymous: false },
    { leaderboardId: leaderboards[2].id, userId: donors[7].id, rank: 3, totalAmount: 340000, totalItems: 2, isAnonymous: false },
    { leaderboardId: leaderboards[2].id, userId: donors[1].id, rank: 4, totalAmount: 275000, totalItems: 5, isAnonymous: false },
    { leaderboardId: leaderboards[2].id, userId: donors[2].id, rank: 5, totalAmount: 260000, totalItems: 3, isAnonymous: false },
  ];

  for (const le of leaderboardEntries) {
    await prisma.leaderboardEntry.create({ data: le });
  }
  console.log(`  ✅ ${leaderboards.length} leaderboards with ${leaderboardEntries.length} entries`);

  // ============================================================
  // 21. RECURRING DONATIONS
  // ============================================================
  console.log('\n🔄 Creating recurring donations...');
  const recurringDonations = [
    { donorId: donors[5].id, campaignId: campaignData[3].id, amount: 5000, frequency: 'MONTHLY', status: 'ACTIVE', nextDueDate: daysAgo(-25), lastPaidDate: daysAgo(5), totalPaid: 5000, paymentCount: 1, createdAt: daysAgo(5) },
    { donorId: donors[0].id, campaignId: campaignData[0].id, amount: 10000, frequency: 'MONTHLY', status: 'ACTIVE', nextDueDate: daysAgo(-20), lastPaidDate: daysAgo(6), totalPaid: 10000, paymentCount: 1, createdAt: daysAgo(6) },
    { donorId: donors[7].id, campaignId: campaignData[3].id, amount: 3000, frequency: 'MONTHLY', status: 'ACTIVE', nextDueDate: daysAgo(-22), lastPaidDate: daysAgo(3), totalPaid: 3000, paymentCount: 1, createdAt: daysAgo(3) },
    { donorId: donors[1].id, campaignId: campaignData[1].id, amount: 2000, frequency: 'MONTHLY', status: 'PAUSED', nextDueDate: daysAgo(-18), lastPaidDate: daysAgo(4), totalPaid: 2000, paymentCount: 1, createdAt: daysAgo(4) },
  ];

  for (const rd of recurringDonations) {
    await prisma.recurringDonation.create({ data: rd });
  }
  console.log(`  ✅ ${recurringDonations.length} recurring donations created`);

  // ============================================================
  // 22. AUDIT LOGS (admin actions)
  // ============================================================
  console.log('\n📋 Creating audit logs...');
  const auditLogs = [
    // KYC Reviews
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: beneficiaries[0].id, note: 'KYC approved - all documents verified', createdAt: daysAgo(7) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: beneficiaries[1].id, note: 'KYC approved - citizenship verified', createdAt: daysAgo(6, 12) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: beneficiaries[2].id, note: 'KYC approved', createdAt: daysAgo(6, 6) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: beneficiaries[3].id, note: 'KYC approved - documents clear', createdAt: daysAgo(5, 10) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: beneficiaries[4].id, note: 'KYC approved', createdAt: daysAgo(4, 8) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: beneficiaries[5].id, note: 'KYC approved', createdAt: daysAgo(4, 4) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: beneficiaries[6].id, note: 'KYC approved', createdAt: daysAgo(3, 6) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'KYC_REVIEW' as const, targetType: 'KYCProfile', targetId: '770e8400-e29b-41d4-a716-446655440012', note: 'KYC rejected - blurry document image', createdAt: daysAgo(2) },

    // Campaign Verifications
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[0].id, note: 'Campaign approved - legitimate cause with proof', createdAt: daysAgo(6, 12) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[1].id, note: 'Campaign approved - medical documents verified', createdAt: daysAgo(6, 8) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[2].id, note: 'Campaign approved', createdAt: daysAgo(5, 10) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[3].id, note: 'Campaign approved - orphanage verified', createdAt: daysAgo(5, 6) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[4].id, note: 'Campaign approved', createdAt: daysAgo(4, 14) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[5].id, note: 'Campaign approved', createdAt: daysAgo(4, 8) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[6].id, note: 'Campaign approved', createdAt: daysAgo(3, 10) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[7].id, note: 'Campaign approved - urgent need', createdAt: daysAgo(3, 6) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[8].id, note: 'Campaign approved', createdAt: daysAgo(2, 12) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[9].id, note: 'Campaign approved', createdAt: daysAgo(2, 8) },
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'CAMPAIGN_VERIFICATION' as const, targetType: 'Campaign', targetId: campaignData[11].id, note: 'Campaign approved', createdAt: daysAgo(7, 10) },

    // Item confirmations
    { actorType: 'ADMIN' as const, actorId: admins[0].id, actionType: 'ITEM_CONFIRMATION' as const, targetType: 'ItemDonation', targetId: 'items-batch-1', note: 'Confirmed delivery of school supplies to orphanage', createdAt: daysAgo(3) },
    { actorType: 'ADMIN' as const, actorId: admins[1].id, actionType: 'ITEM_CONFIRMATION' as const, targetType: 'ItemDonation', targetId: 'items-batch-2', note: 'Confirmed delivery of building materials', createdAt: daysAgo(2) },

    // Badge grants
    { actorType: 'SYSTEM' as const, actionType: 'BADGE_GRANTED' as const, targetType: 'User', targetId: donors[5].id, note: 'Awarded "Top Donor - February 2026" badge', createdAt: daysAgo(1) },
    { actorType: 'SYSTEM' as const, actionType: 'BADGE_GRANTED' as const, targetType: 'User', targetId: donors[0].id, note: 'Awarded "Campaign Champion" badge for supporting 5+ campaigns', createdAt: daysAgo(1) },

    // Leaderboard finalization
    { actorType: 'SYSTEM' as const, actionType: 'LEADERBOARD_FINALIZED' as const, targetType: 'Leaderboard', targetId: leaderboards[1].id, note: 'January 2026 monthly leaderboard finalized', createdAt: daysAgo(7) },
  ];

  for (const al of auditLogs) {
    await prisma.auditLog.create({ data: al });
  }
  console.log(`  ✅ ${auditLogs.length} audit logs created`);

  // ============================================================
  // DONE!
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('✨ Nepal360 seed completed successfully!');
  console.log('='.repeat(60));
  console.log('\n📊 Seeded Data Summary:');
  console.log('   👑 2 Admins');
  console.log('   🏠 7 Verified Beneficiaries (Approved KYC)');
  console.log('   💰 10 Active Donors');
  console.log('   ⏳ 1 KYC Pending User');
  console.log('   ❌ 1 KYC Rejected User');
  console.log('   📧 2 Email Unverified Users');
  console.log('   🆕 1 Brand New User');
  console.log('   📢 12 Campaigns (10 LIVE, 1 PENDING, 1 COMPLETED)');
  console.log('   💸 50+ Money Donations');
  console.log('   📦 8 Item Donations');
  console.log('   💬 20 Comments');
  console.log('   🔖 21 Bookmarks');
  console.log('   🔔 17 Notifications');
  console.log('   🏅 6 Badges, 20 User Awards');
  console.log('   🏆 3 Leaderboards, 18 Entries');
  console.log('   🔄 4 Recurring Donations');
  console.log('   📋 25 Audit Logs');
  console.log('   🎯 15 Milestones');
  console.log('   📝 6 Campaign Updates');
  console.log('   💌 10 Best Wishes');
  console.log('\n📝 See login.md in project root for all credentials');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
