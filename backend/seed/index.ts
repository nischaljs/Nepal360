/**
 * Nepal360 Database Seed Script
 * 
 * Run this script to populate the database with sample data.
 * 
 * Usage:
 *   npx ts-node seed/index.ts
 * 
 * Requirements:
 *   - Database must be running
 *   - Prisma client must be generated
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

async function main() {
  console.log('🌱 Starting Nepal360 database seed...\n');

  // Create Admin Users
  console.log('Creating admin users...');
  const adminPasswordHash = await hashPassword('admin123');
  
  for (const admin of [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Admin User', email: 'admin@nepal360.com' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Super Admin', email: 'superadmin@nepal360.com' },
  ]) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          ...admin,
          passwordHash: adminPasswordHash,
          emailStatus: 'VERIFIED',
        },
      });
      await prisma.adminRole.create({ data: { userId: user.id } });
      console.log(`  ✅ Created admin: ${admin.email}`);
    } else {
      console.log(`  ⏭️  Skipped admin (exists): ${admin.email}`);
    }
  }

  // Create Beneficiaries
  console.log('\nCreating beneficiaries...');
  const beneficiaryPasswordHash = await hashPassword('beneficiary123');
  
  for (const beneficiary of [
    { id: '660e8400-e29b-41d4-a716-446655440001', name: 'Rajesh Kumar', email: 'beneficiary1@nepal360.com', profileImage: 'profile-1.jpg' },
    { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Sita Devi', email: 'beneficiary2@nepal360.com', profileImage: 'profile-2.jpg' },
    { id: '660e8400-e29b-41d4-a716-446655440003', name: 'Prakash Sharma', email: 'beneficiary3@nepal360.com', profileImage: 'profile-3.jpg' },
  ]) {
    const existing = await prisma.user.findUnique({ where: { email: beneficiary.email } });
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          name: beneficiary.name,
          email: beneficiary.email,
          passwordHash: beneficiaryPasswordHash,
          emailStatus: 'VERIFIED',
          kycProfile: {
            create: {
              documentType: 'Citizenship',
              documentNumber: '12345' + beneficiary.id.slice(-4),
              documentImage: `campaigns/${beneficiary.profileImage}`,
              profilePhoto: `kyc/${beneficiary.profileImage}`,
              bankAccountName: beneficiary.name,
              bankAccountNo: '1234567890' + beneficiary.id.slice(-2),
              status: 'APPROVED',
            },
          },
        },
      });
      console.log(`  ✅ Created beneficiary: ${beneficiary.email}`);
    } else {
      console.log(`  ⏭️  Skipped beneficiary (exists): ${beneficiary.email}`);
    }
  }

  // Create Donors
  console.log('\nCreating donors...');
  const donorPasswordHash = await hashPassword('donor123');
  
  for (let i = 1; i <= 10; i++) {
    const donor = { 
      id: `770e8400-e29b-41d4-a716-44665544000${i}`.slice(0, -1) + (i < 10 ? '0' + i : i), 
      name: `Donor ${i}`, 
      email: `donor${i}@nepal360.com` 
    };
    
    const existing = await prisma.user.findUnique({ where: { email: donor.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: donor.id,
          name: donor.name,
          email: donor.email,
          passwordHash: donorPasswordHash,
          emailStatus: 'VERIFIED',
        },
      });
      await prisma.donorStats.create({
        data: {
          userId: donor.id,
          totalMoneyDonated: Math.floor(Math.random() * 150000) + 10000,
          totalItemCount: Math.floor(Math.random() * 5),
          donationCount: Math.floor(Math.random() * 15) + 1,
        },
      });
      console.log(`  ✅ Created donor: ${donor.email}`);
    } else {
      console.log(`  ⏭️  Skipped donor (exists): ${donor.email}`);
    }
  }

  // Create Campaign Updates (Impact Stories)
  console.log('\nCreating campaign updates...');
  const updates = [
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440001',
      campaignId: '880e8400-e29b-41d4-a716-446655440001',
      userId: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Foundation Work Complete!',
      content: 'We are thrilled to announce that the foundation work for our new school building is now complete! The foundation has been laid with proper earthquake-resistant technology. Our team of engineers ensured that the building meets all safety standards. Next week, we begin the wall construction phase.',
      images: JSON.stringify(['campaigns/proof-1.jpg', 'campaigns/proof-2.jpg']),
      isMilestone: true,
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440002',
      campaignId: '880e8400-e29b-41d4-a716-446655440001',
      userId: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Thank You from Our Students',
      content: 'Dear donors, The students of our village wanted to share their gratitude with all of you. They wrote thank you letters and drew pictures expressing how excited they are about their new school. Your generosity is changing lives one brick at a time.',
      images: JSON.stringify([]),
      isMilestone: false,
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440003',
      campaignId: '880e8400-e29b-41d4-a716-446655440002',
      userId: '660e8400-e29b-41d4-a716-446655440002',
      title: 'Surgery Scheduled!',
      content: 'Great news! Thanks to your generous donations, we have scheduled my sons heart surgery for next Monday. The doctors are confident about the procedure. I cannot express in words how grateful I am to each and every one of you who contributed.',
      images: JSON.stringify(['campaigns/proof-3.jpg']),
      isMilestone: true,
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440004',
      campaignId: '880e8400-e29b-41d4-a716-446655440003',
      userId: '660e8400-e29b-41d4-a716-446655440003',
      title: 'Water Pump Equipment Arrived!',
      content: 'The solar-powered water pump equipment has arrived in our village! The installation team will begin work next week. Our 50+ families will finally have access to clean drinking water.',
      images: JSON.stringify(['campaigns/proof-4.jpg']),
      isMilestone: true,
    },
    {
      id: 'aa1e8400-e29b-41d4-a716-446655440005',
      campaignId: '880e8400-e29b-41d4-a716-446655440008',
      userId: '660e8400-e29b-41d4-a716-446655440002',
      title: 'Ambulance 90% Funded!',
      content: 'We are just NPR 350,000 away from our goal! The 4x4 ambulance has been selected and is ready for purchase. Once funded, it will serve 12 remote villages in our district.',
      images: JSON.stringify([]),
      isMilestone: false,
    },
  ];

  for (const update of updates) {
    const existing = await prisma.campaignUpdate.findUnique({ where: { id: update.id } });
    if (!existing) {
      await prisma.campaignUpdate.create({ data: update });
      console.log(`  ✅ Created update: ${update.title}`);
    }
  }

  // Create Best Wishes
  console.log('\nCreating best wishes...');
  const wishes = [
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440001',
      donationId: '770e8400-e29b-41d4-a716-446655440001',
      userId: '770e8400-e29b-41d4-a716-446655440001',
      campaignId: '880e8400-e29b-41d4-a716-446655440001',
      message: 'May this school become a beacon of hope for generations to come. Proud to support this cause!',
      cardStyle: 'festive',
      isAnonymous: false,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440002',
      donationId: '770e8400-e29b-41d4-a716-446655440002',
      userId: '770e8400-e29b-41d4-a716-446655440002',
      campaignId: '880e8400-e29b-41d4-a716-446655440001',
      message: 'Education is the foundation of a better tomorrow. Wishing you all the success!',
      cardStyle: 'heartfelt',
      isAnonymous: false,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440003',
      donationId: '770e8400-e29b-41d4-a716-446655440003',
      userId: '770e8400-e29b-41d4-a716-446655440003',
      campaignId: '880e8400-e29b-41d4-a716-446655440001',
      message: 'Building dreams one brick at a time. You got this!',
      cardStyle: 'simple',
      isAnonymous: true,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440004',
      donationId: '770e8400-e29b-41d4-a716-446655440006',
      userId: '770e8400-e29b-41d4-a716-446655440006',
      campaignId: '880e8400-e29b-41d4-a716-446655440002',
      message: 'Praying for a successful surgery and quick recovery. Stay strong little one!',
      cardStyle: 'heartfelt',
      isAnonymous: false,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440005',
      donationId: '770e8400-e29b-41d4-a716-446655440007',
      userId: '770e8400-e29b-41d4-a716-446655440007',
      campaignId: '880e8400-e29b-41d4-a716-446655440002',
      message: 'May your son regain health and bring joy to your family. Our thoughts are with you!',
      cardStyle: 'heartfelt',
      isAnonymous: false,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440006',
      donationId: '770e8400-e29b-41d4-a716-446655440001',
      userId: '770e8400-e29b-41d4-a716-446655440001',
      campaignId: '880e8400-e29b-41d4-a716-446655440003',
      message: 'Clean water is a basic right. Proud to help bring this essential resource to your village!',
      cardStyle: 'simple',
      isAnonymous: false,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440007',
      donationId: '770e8400-e29b-41d4-a716-446655440002',
      userId: '770e8400-e29b-41d4-a716-446655440002',
      campaignId: '880e8400-e29b-41d4-a716-446655440004',
      message: 'May these children feel the love and support of our entire community. You are not alone!',
      cardStyle: 'heartfelt',
      isAnonymous: false,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440008',
      donationId: '770e8400-e29b-41d4-a716-446655440004',
      userId: '770e8400-e29b-41d4-a716-446655440004',
      campaignId: '880e8400-e29b-41d4-a716-446655440004',
      message: 'Every child deserves love, food and education. Bless this orphanage!',
      cardStyle: 'festive',
      isAnonymous: true,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440009',
      donationId: '770e8400-e29b-41d4-a716-446655440006',
      userId: '770e8400-e29b-41d4-a716-446655440006',
      campaignId: '880e8400-e29b-41d4-a716-446655440008',
      message: 'This ambulance will save countless lives. You are heroes for making this happen!',
      cardStyle: 'festive',
      isAnonymous: false,
    },
    {
      id: 'bb1e8400-e29b-41d4-a716-446655440010',
      donationId: '770e8400-e29b-41d4-a716-446655440008',
      userId: '770e8400-e29b-41d4-a716-446655440008',
      campaignId: '880e8400-e29b-41d4-a716-446655440008',
      message: 'Emergency care should be accessible to all. Proud to support this life-saving project!',
      cardStyle: 'simple',
      isAnonymous: false,
    },
  ];

  for (const wish of wishes) {
    const existing = await prisma.bestWish.findUnique({ where: { id: wish.id } });
    if (!existing) {
      await prisma.bestWish.create({ data: wish });
      console.log(`  ✅ Created wish from donor ${wish.userId.slice(-4)}`);
    }
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('   Admin: admin@nepal360.com / admin123');
  console.log('   Super Admin: superadmin@nepal360.com / superadmin123');
  console.log('   Beneficiaries: beneficiary1@nepal360.com / beneficiary123');
  console.log('   Donors: donor1@nepal360.com / donor123');
  console.log('\n📊 Seeded Data:');
  console.log('   - 5 Campaign Updates (Impact Stories)');
  console.log('   - 10 Best Wishes from Donors');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
