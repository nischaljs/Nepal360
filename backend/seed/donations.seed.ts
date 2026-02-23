/**
 * Nepal360 Seed Data - Donations
 * 
 * Realistic donation data to make the site look heavily used.
 */

export const moneyDonations = [
  // Donations for Campaign 1 (School Rebuild)
  { donorId: '770e8400-e29b-41d4-a716-446655440001', campaignId: '880e8400-e29b-41d4-a716-446655440001', amount: 50000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440002', campaignId: '880e8400-e29b-41d4-a716-446655440001', amount: 25000, visibility: 'ANONYMOUS', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440003', campaignId: '880e8400-e29b-41d4-a716-446655440001', amount: 10000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440004', campaignId: '880e8400-e29b-41d4-a716-446655440001', amount: 5000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440005', campaignId: '880e8400-e29b-41d4-a716-446655440001', amount: 25000, visibility: 'ANONYMOUS', status: 'COMPLETED' },
  
  // Donations for Campaign 2 (Medical)
  { donorId: '770e8400-e29b-41d4-a716-446655440006', campaignId: '880e8400-e29b-41d4-a716-446655440002', amount: 100000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440007', campaignId: '880e8400-e29b-41d4-a716-446655440002', amount: 50000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440008', campaignId: '880e8400-e29b-41d4-a716-446655440002', amount: 25000, visibility: 'ANONYMOUS', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440009', campaignId: '880e8400-e29b-41d4-a716-446655440002', amount: 10000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440010', campaignId: '880e8400-e29b-41d4-a716-446655440002', amount: 5000, visibility: 'ANONYMOUS', status: 'COMPLETED' },
  
  // More donations spread across campaigns
  { donorId: '770e8400-e29b-41d4-a716-446655440001', campaignId: '880e8400-e29b-41d4-a716-446655440003', amount: 15000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440002', campaignId: '880e8400-e29b-41d4-a716-446655440004', amount: 20000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440003', campaignId: '880e8400-e29b-41d4-a716-446655440005', amount: 10000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440004', campaignId: '880e8400-e29b-41d4-a716-446655440006', amount: 25000, visibility: 'ANONYMOUS', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440005', campaignId: '880e8400-e29b-41d4-a716-446655440007', amount: 5000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440006', campaignId: '880e8400-e29b-41d4-a716-446655440008', amount: 100000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440007', campaignId: '880e8400-e29b-41d4-a716-446655440009', amount: 15000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440008', campaignId: '880e8400-e29b-41d4-a716-446655440010', amount: 20000, visibility: 'ANONYMOUS', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440009', campaignId: '880e8400-e29b-41d4-a716-446655440011', amount: 10000, visibility: 'PUBLIC', status: 'COMPLETED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440010', campaignId: '880e8400-e29b-41d4-a716-446655440012', amount: 25000, visibility: 'PUBLIC', status: 'COMPLETED' },
];

export const itemDonations = [
  { donorId: '770e8400-e29b-41d4-a716-446655440001', campaignId: '880e8400-e29b-41d4-a716-446655440004', itemName: 'School Bags', quantity: '25', status: 'CONFIRMED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440002', campaignId: '880e8400-e29b-41d4-a716-446655440004', itemName: 'Notebooks', quantity: '100', status: 'CONFIRMED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440003', campaignId: '880e8400-e29b-41d4-a716-446655440004', itemName: 'Pens', quantity: '50', status: 'CONFIRMED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440004', campaignId: '880e8400-e29b-41d4-a716-446655440004', itemName: 'Uniforms', quantity: '15', status: 'CONFIRMED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440005', campaignId: '880e8400-e29b-41d4-a716-446655440004', itemName: 'Shoes', quantity: '10', status: 'DELIVERED' },
  { donorId: '770e8400-e29b-41d4-a716-446655440006', campaignId: '880e8400-e29b-41d4-a716-446655440004', itemName: 'Textbooks', quantity: '30', status: 'CONFIRMED' },
];

export const donorStats = [
  { userId: '770e8400-e29b-41d4-a716-446655440001', totalMoneyDonated: 125000, totalItemCount: 2, donationCount: 15 },
  { userId: '770e8400-e29b-41d4-a716-446655440002', totalMoneyDonated: 95000, totalItemCount: 3, donationCount: 12 },
  { userId: '770e8400-e29b-41d4-a716-446655440003', totalMoneyDonated: 75000, totalItemCount: 1, donationCount: 10 },
  { userId: '770e8400-e29b-41d4-a716-446655440004', totalMoneyDonated: 60000, totalItemCount: 4, donationCount: 8 },
  { userId: '770e8400-e29b-41d4-a716-446655440005', totalMoneyDonated: 55000, totalItemCount: 2, donationCount: 7 },
  { userId: '770e8400-e29b-41d4-a716-446655440006', totalMoneyDonated: 150000, totalItemCount: 1, donationCount: 18 },
  { userId: '770e8400-e29b-41d4-a716-446655440007', totalMoneyDonated: 85000, totalItemCount: 0, donationCount: 11 },
  { userId: '770e8400-e29b-41d4-a716-446655440008', totalMoneyDonated: 70000, totalItemCount: 2, donationCount: 9 },
  { userId: '770e8400-e29b-41d4-a716-446655440009', totalMoneyDonated: 45000, totalItemCount: 1, donationCount: 6 },
  { userId: '770e8400-e29b-41d4-a716-446655440010', totalMoneyDonated: 40000, totalItemCount: 0, donationCount: 5 },
];
