/**
 * Nepal360 Seed Data - Badges & Leaderboards
 */

export const badges = [
  {
    id: '990e8400-e29b-41d4-a716-446655440001',
    code: 'FIRST_DONATION',
    name: 'First Donation',
    description: 'Made your first donation to a campaign',
    iconUrl: '',
    badgeType: 'FIRST_DONATION' as const,
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440002',
    code: 'LIFETIME_AMOUNT',
    name: 'Generous Heart',
    description: 'Donated NPR 50,000 or more in total',
    iconUrl: '',
    badgeType: 'LIFETIME_AMOUNT' as const,
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440003',
    code: 'CAMPAIGN_SUPPORTER',
    name: 'Campaign Champion',
    description: 'Supported 5 or more different campaigns',
    iconUrl: '',
    badgeType: 'CAMPAIGN_SUPPORTER' as const,
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440004',
    code: 'ITEM_DONOR',
    name: 'Item Hero',
    description: 'Donated 10 or more items to campaigns',
    iconUrl: '',
    badgeType: 'ITEM_DONOR' as const,
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440005',
    code: 'LEADERBOARD_WINNER',
    name: 'Top Donor - January 2026',
    description: 'Ranked #1 in donations for January 2026',
    iconUrl: '',
    badgeType: 'LEADERBOARD_WINNER' as const,
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440006',
    code: 'TOP_5_DONOR',
    name: 'Top 5 Donor',
    description: 'Ranked in top 5 donors this month',
    iconUrl: '',
    badgeType: 'LEADERBOARD_WINNER' as const,
  },
];

export const userBadges = [
  { userId: '770e8400-e29b-41d4-a716-446655440006', badgeId: '990e8400-e29b-41d4-a716-446655440001' },
  { userId: '770e8400-e29b-41d4-a716-446655440006', badgeId: '990e8400-e29b-41d4-a716-446655440002' },
  { userId: '770e8400-e29b-41d4-a716-446655440006', badgeId: '990e8400-e29b-41d4-a716-446655440003' },
  { userId: '770e8400-e29b-41d4-a716-446655440001', badgeId: '990e8400-e29b-41d4-a716-446655440001' },
  { userId: '770e8400-e29b-41d4-a716-446655440001', badgeId: '990e8400-e29b-41d4-a716-446655440002' },
  { userId: '770e8400-e29b-41d4-a716-446655440002', badgeId: '990e8400-e29b-41d4-a716-446655440001' },
  { userId: '770e8400-e29b-41d4-a716-446655440002', badgeId: '990e8400-e29b-41d4-a716-446655440004' },
];

export const leaderboards = [
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440001',
    period: 'MONTHLY' as const,
    periodKey: '2026-01',
  },
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440002',
    period: 'MONTHLY' as const,
    periodKey: '2025-12',
  },
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440003',
    period: 'YEARLY' as const,
    periodKey: '2025',
  },
];

export const leaderboardEntries = [
  // January 2026 Leaderboard
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440006', rank: 1, totalAmount: 150000, totalItems: 1, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440001', rank: 2, totalAmount: 125000, totalItems: 2, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440007', rank: 3, totalAmount: 85000, totalItems: 0, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440002', rank: 4, totalAmount: 95000, totalItems: 3, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440008', rank: 5, totalAmount: 70000, totalItems: 2, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440003', rank: 6, totalAmount: 75000, totalItems: 1, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440004', rank: 7, totalAmount: 60000, totalItems: 4, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440005', rank: 8, totalAmount: 55000, totalItems: 2, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440009', rank: 9, totalAmount: 45000, totalItems: 1, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440001', userId: '770e8400-e29b-41d4-a716-446655440010', rank: 10, totalAmount: 40000, totalItems: 0, isAnonymous: false },
  
  // December 2025 Leaderboard
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440002', userId: '770e8400-e29b-41d4-a716-446655440001', rank: 1, totalAmount: 200000, totalItems: 5, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440002', userId: '770e8400-e29b-41d4-a716-446655440006', rank: 2, totalAmount: 180000, totalItems: 3, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440002', userId: '770e8400-e29b-41d4-a716-446655440002', rank: 3, totalAmount: 120000, totalItems: 4, isAnonymous: false },
  
  // 2025 Yearly Leaderboard
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440003', userId: '770e8400-e29b-41d4-a716-446655440006', rank: 1, totalAmount: 500000, totalItems: 10, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440003', userId: '770e8400-e29b-41d4-a716-446655440001', rank: 2, totalAmount: 450000, totalItems: 12, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440003', userId: '770e8400-e29b-41d4-a716-446655440002', rank: 3, totalAmount: 380000, totalItems: 15, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440003', userId: '770e8400-e29b-41d4-a716-446655440007', rank: 4, totalAmount: 320000, totalItems: 8, isAnonymous: false },
  { leaderboardId: 'aa0e8400-e29b-41d4-a716-446655440003', userId: '770e8400-e29b-41d4-a716-446655440008', rank: 5, totalAmount: 280000, totalItems: 10, isAnonymous: false },
];
