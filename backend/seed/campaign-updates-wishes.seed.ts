/**
 * Nepal360 Seed Data - Campaign Updates & Best Wishes
 * 
 * Seed data for impact stories and donor wishes.
 * Run after main seed (users, campaigns, donations).
 */

export const campaignUpdates = [
  // Updates for Campaign 1 (School Rebuild)
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440001',
    campaignId: '880e8400-e29b-41d4-a716-446655440001', // School Rebuild
    userId: '660e8400-e29b-41d4-a716-446655440001', // Rajesh Kumar
    title: 'Foundation Work Complete!',
    content: `We are thrilled to announce that the foundation work for our new school building is now complete! 

The foundation has been laid with proper earthquake-resistant technology. Our team of engineers ensured that the building meets all safety standards.

Next week, we begin the wall construction phase. Thanks to all our donors who made this possible. Together, we're building a safer future for 150+ students.

📸 Photos of the completed foundation are attached below.`,
    images: JSON.stringify(['campaigns/proof-1.jpg', 'campaigns/proof-2.jpg']),
    isMilestone: true,
  },
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440002',
    campaignId: '880e8400-e29b-41d4-a716-446655440001',
    userId: '660e8400-e29b-41d4-a716-446655440001',
    title: 'Thank You from Our Students',
    content: `Dear donors,

The students of our village wanted to share their gratitude with all of you. They wrote thank you letters and drew pictures expressing how excited they are about their new school.

One student, Maya (age 10), said: "I can't wait to study in a real classroom with proper desks and books!"

Your generosity is changing lives one brick at a time.`,
    images: JSON.stringify([]),
    isMilestone: false,
  },

  // Updates for Campaign 2 (Medical Treatment)
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440003',
    campaignId: '880e8400-e29b-41d4-a716-446655440002', // Medical
    userId: '660e8400-e29b-41d4-a716-446655440002', // Sita Devi
    title: 'Surgery Scheduled!',
    content: `Great news! Thanks to your generous donations, we have scheduled my son's heart surgery for next Monday at Narayana Health Hospital.

The doctors are confident about the procedure. We have raised enough to cover the surgery and post-operative care.

I cannot express in words how grateful I am to each and every one of you who contributed. You are giving my son a second chance at life.`,
    images: JSON.stringify(['campaigns/proof-3.jpg']),
    isMilestone: true,
  },

  // Updates for Campaign 3 (Clean Water)
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440004',
    campaignId: '880e8400-e29b-41d4-a716-446655440003', // Clean Water
    userId: '660e8400-e29b-41d4-a716-446655440003', // Prakash Sharma
    title: 'Water Pump Equipment Arrived!',
    content: `The solar-powered water pump equipment has arrived in our village! The installation team will begin work next week.

Our 50+ families will finally have access to clean drinking water. No more walking 5 kilometers to the nearest spring!

This is a life-changing moment for our entire community. Thank you to everyone who made this happen.`,
    images: JSON.stringify(['campaigns/proof-4.jpg', 'campaigns/proof-5.jpg']),
    isMilestone: true,
  },

  // Update for Campaign 8 (Ambulance)
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440005',
    campaignId: '880e8400-e29b-41d4-a716-446655440008', // Ambulance
    userId: '660e8400-e29b-41d4-a716-446655440002',
    title: 'Ambulance 90% Funded!',
    content: `We are just NPR 350,000 away from our goal! The 4x4 ambulance has been selected and is ready for purchase.

Once funded, it will serve 12 remote villages in our district. During monsoon season, this ambulance could be the difference between life and death for many families.

Please share this campaign with your networks. Every NPR counts!`,
    images: JSON.stringify([]),
    isMilestone: false,
  },
];

export const bestWishes = [
  // Wishes for Campaign 1
  {
    id: 'bb1e8400-e29b-41d4-a716-446655440001',
    donationId: '770e8400-e29b-41d4-a716-446655440001', // Donor 1's donation
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

  // Wishes for Campaign 2 (Medical)
  {
    id: 'bb1e8400-e29b-41d4-a716-446655440004',
    donationId: '770e8400-e29b-41d4-a716-446655440006',
    userId: '770e8400-e29b-41d4-a716-446655440006',
    campaignId: '880e8400-e29b-41d4-a716-446655440002',
    message: 'Praying for a successful surgery and quick recovery. Stay strong little one! 💙',
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

  // Wishes for Campaign 3 (Water)
  {
    id: 'bb1e8400-e29b-41d4-a716-446655440006',
    donationId: '770e8400-e29b-41d4-a716-446655440001',
    userId: '770e8400-e29b-41d4-a716-446655440001',
    campaignId: '880e8400-e29b-41d4-a716-446655440003',
    message: 'Clean water is a basic right. Proud to help bring this essential resource to your village!',
    cardStyle: 'simple',
    isAnonymous: false,
  },

  // More wishes for Campaign 4 (Orphanage)
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
    message: 'Every child deserves love, food, and education. Bless this orphanage!',
    cardStyle: 'festive',
    isAnonymous: true,
  },

  // Wishes for Campaign 8 (Ambulance)
  {
    id: 'bb1e8400-e29b-41d4-a716-446655440009',
    donationId: '770e8400-e29b-41d4-a716-446655440006',
    userId: '770e8400-e29b-41d4-a716-446655440006',
    campaignId: '880e8400-e29b-41d4-a716-446655440008',
    message: 'This ambulance will save countless lives. You are heroes for making this happen! 🚑',
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
