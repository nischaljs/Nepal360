/**
 * Nepal360 Seed Data - Campaigns
 * 
 * Seed data for campaigns with realistic Nepal-related causes.
 * Images are stored in: backend/uploads/campaigns/
 * Available files: campaign-1.jpg through campaign-12.jpg
 */

export const campaigns = [
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440001', // Rajesh Kumar
    title: 'Help Rebuild Our School in Rural Nepal',
    description: 'Our village school was damaged in the recent earthquake. We need funds to rebuild 3 classrooms and provide basic amenities for 150+ students. The current building is unsafe and classes are being held under temporary shelters.',
    coverImage: 'campaigns/campaign-1.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-1.jpg', 'campaigns/proof-2.jpg']),
    targetAmount: 2500000, // NPR 25 Lakhs
    status: 'LIVE' as const,
    donationCount: 89,
    shareCount: 234,
    visits: 1520,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440002',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440002', // Sita Devi
    title: 'Medical Treatment for My Son',
    description: 'My 8-year-old son needs heart surgery. We have collected some funds but still need NPR 5 Lakhs for the operation at Narayana Health. Please help us save our child.',
    coverImage: 'campaigns/campaign-2.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-3.jpg']),
    targetAmount: 500000, // NPR 5 Lakhs
    status: 'LIVE' as const,
    donationCount: 156,
    shareCount: 445,
    visits: 2340,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440003', // Prakash Sharma
    title: 'Clean Water for Mountain Village',
    description: 'Our village in Mustang district has no access to clean drinking water. We want to install a solar-powered water pump system that will serve 50+ families. This project will take 3 months to complete.',
    coverImage: 'campaigns/campaign-3.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-4.jpg', 'campaigns/proof-5.jpg', 'campaigns/proof-6.jpg']),
    targetAmount: 1800000, // NPR 18 Lakhs
    status: 'LIVE' as const,
    donationCount: 67,
    shareCount: 189,
    visits: 980,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440004',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440001', // Rajesh Kumar
    title: 'Support Orphanage Food & Education',
    description: 'We run an orphanage with 45 children. Your donations will provide nutritious meals, school supplies, and medical care. Every NPR 1000 feeds a child for a month.',
    coverImage: 'campaigns/campaign-4.jpg',
    proofLinks: JSON.stringify([]),
    targetAmount: 600000, // NPR 6 Lakhs
    status: 'LIVE' as const,
    donationCount: 234,
    shareCount: 567,
    visits: 3200,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440005',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440002', // Sita Devi
    title: 'Women Empowerment - Sewing Center',
    description: 'Help us establish a sewing training center for 30 underprivileged women in our community. They will learn skills to become financially independent and support their families.',
    coverImage: 'campaigns/campaign-5.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-7.jpg']),
    targetAmount: 450000, // NPR 4.5 Lakhs
    status: 'LIVE' as const,
    donationCount: 78,
    shareCount: 201,
    visits: 1150,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440006',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440003', // Prakash Sharma
    title: 'Trekking Trail Preservation',
    description: 'Help us maintain and improve the popular Annapurna trekking trail. Funds will be used for trail markers, safety barriers, and waste management facilities.',
    coverImage: 'campaigns/campaign-6.jpg',
    proofLinks: JSON.stringify([]),
    targetAmount: 1200000, // NPR 12 Lakhs
    status: 'LIVE' as const,
    donationCount: 45,
    shareCount: 123,
    visits: 780,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440007',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440001', // Rajesh Kumar
    title: 'Library for Village Children',
    description: 'Build a community library with 2000+ books, computers, and study spaces for village children. Currently, students travel 15km to access books.',
    coverImage: 'campaigns/campaign-7.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-8.jpg']),
    targetAmount: 800000, // NPR 8 Lakhs
    status: 'LIVE' as const,
    donationCount: 112,
    shareCount: 289,
    visits: 1670,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440008',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440002', // Sita Devi
    title: 'Emergency Ambulance Service',
    description: 'Our rural area has no ambulance service. We need funds to buy a 4x4 vehicle that can reach remote villages during emergencies and monsoon season.',
    coverImage: 'campaigns/campaign-8.jpg',
    proofLinks: JSON.stringify([]),
    targetAmount: 3500000, // NPR 35 Lakhs
    status: 'LIVE' as const,
    donationCount: 201,
    shareCount: 512,
    visits: 4100,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440009',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440003', // Prakash Sharma
    title: 'Organic Farming Initiative',
    description: 'Train 50 farmers in organic farming techniques and provide them with seeds and equipment. This will help them sell premium organic produce and increase their income.',
    coverImage: 'campaigns/campaign-9.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-9.jpg', 'campaigns/proof-10.jpg']),
    targetAmount: 950000, // NPR 9.5 Lakhs
    status: 'LIVE' as const,
    donationCount: 56,
    shareCount: 145,
    visits: 890,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440010',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440001', // Rajesh Kumar
    title: 'Elderly Care Center',
    description: 'Establish a day-care center for 25 elderly people in our community. Provide meals, medical care, and companionship for senior citizens who live alone.',
    coverImage: 'campaigns/campaign-10.jpg',
    proofLinks: JSON.stringify([]),
    targetAmount: 720000, // NPR 7.2 Lakhs
    status: 'LIVE' as const,
    donationCount: 89,
    shareCount: 234,
    visits: 1340,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440011',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440002', // Sita Devi
    title: 'Youth Sports Academy',
    description: 'Create a football and basketball academy for 100+ youth in our area. Provide equipment, coaching, and a safe place to play and develop skills.',
    coverImage: 'campaigns/campaign-11.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-11.jpg']),
    targetAmount: 1100000, // NPR 11 Lakhs
    status: 'LIVE' as const,
    donationCount: 67,
    shareCount: 178,
    visits: 980,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440012',
    beneficiaryId: '660e8400-e29b-41d4-a716-446655440003', // Prakash Sharma
    title: 'Solar Power for Remote Clinic',
    description: 'Install solar panels at our village health clinic that experiences 8+ hours of power cuts daily. This will ensure continuous medical services and vaccine storage.',
    coverImage: 'campaigns/campaign-12.jpg',
    proofLinks: JSON.stringify(['campaigns/proof-12.jpg']),
    targetAmount: 650000, // NPR 6.5 Lakhs
    status: 'COMPLETED' as const,
    donationCount: 134,
    shareCount: 345,
    visits: 1890,
  },
];

export const milestones = [
  // Campaign 1 milestones
  { campaignId: '880e8400-e29b-41d4-a716-446655440001', title: 'Foundation Work', amount: 500000, completed: true },
  { campaignId: '880e8400-e29b-41d4-a716-446655440001', title: 'Wall Construction', amount: 1000000, completed: false },
  { campaignId: '880e8400-e29b-41d4-a716-446655440001', title: 'Furniture & Equipment', amount: 1000000, completed: false },
  // Campaign 2 milestones
  { campaignId: '880e8400-e29b-41d4-a716-446655440002', title: 'Hospital Admission', amount: 150000, completed: true },
  { campaignId: '880e8400-e29b-41d4-a716-446655440002', title: 'Surgery Cost', amount: 250000, completed: false },
  { campaignId: '880e8400-e29b-41d4-a716-446655440002', title: 'Post-Operative Care', amount: 100000, completed: false },
];
