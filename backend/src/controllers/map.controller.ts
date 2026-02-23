import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Nepal district coordinates (major districts)
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'Kathmandu': { lat: 27.7172, lng: 85.3240 },
  'Pokhara': { lat: 28.2096, lng: 83.9856 },
  'Lalitpur': { lat: 27.6588, lng: 85.3247 },
  'Bhaktapur': { lat: 27.6710, lng: 85.4298 },
  'Chitwan': { lat: 27.5291, lng: 84.3542 },
  'Lumbini': { lat: 27.4833, lng: 83.2767 },
  'Biratnagar': { lat: 26.4525, lng: 87.2718 },
  'Birgunj': { lat: 27.0104, lng: 84.8821 },
  'Dharan': { lat: 26.8065, lng: 87.2846 },
  'Butwal': { lat: 27.7006, lng: 83.4483 },
  'Hetauda': { lat: 27.4264, lng: 85.0322 },
  'Janakpur': { lat: 26.7288, lng: 85.9261 },
  'Nepalgunj': { lat: 28.0500, lng: 81.6167 },
  'Dhangadhi': { lat: 28.6833, lng: 80.6000 },
  'Ilam': { lat: 26.9132, lng: 87.9273 },
  'Gorkha': { lat: 28.0000, lng: 84.6333 },
  'Solukhumbu': { lat: 27.7900, lng: 86.7400 },
  'Mustang': { lat: 28.9985, lng: 83.8473 },
  'Dolpa': { lat: 29.0500, lng: 82.8667 },
  'Humla': { lat: 29.9667, lng: 81.8833 },
  'Kaski': { lat: 28.2180, lng: 83.9879 },
  'Rupandehi': { lat: 27.5000, lng: 83.3333 },
  'Morang': { lat: 26.6667, lng: 87.4667 },
  'Sunsari': { lat: 26.6333, lng: 87.1667 },
  'Jhapa': { lat: 26.5333, lng: 87.8833 },
  'Parsa': { lat: 27.1333, lng: 84.6833 },
  'Bara': { lat: 27.0667, lng: 85.0500 },
  'Makwanpur': { lat: 27.4167, lng: 85.0167 },
  'Kavrepalanchok': { lat: 27.5333, lng: 85.5667 },
  'Sindhupalchok': { lat: 27.9500, lng: 85.6833 },
  'Dolakha': { lat: 27.7833, lng: 86.0667 },
  'Ramechhap': { lat: 27.5500, lng: 86.0833 },
  'Sindhuli': { lat: 27.2333, lng: 85.9667 },
  'Dang': { lat: 28.0500, lng: 82.3000 },
  'Banke': { lat: 28.0167, lng: 81.6167 },
  'Bardiya': { lat: 28.3500, lng: 81.3333 },
  'Kailali': { lat: 28.7833, lng: 80.5667 },
  'Kanchanpur': { lat: 28.8500, lng: 80.3167 },
  'Dadeldhura': { lat: 29.3000, lng: 80.5833 },
  'Baglung': { lat: 28.2667, lng: 83.5833 },
  'Myagdi': { lat: 28.4833, lng: 83.4833 },
  'Parbat': { lat: 28.2333, lng: 83.6833 },
  'Syangja': { lat: 28.1000, lng: 83.8667 },
  'Tanahu': { lat: 27.9333, lng: 84.2333 },
  'Lamjung': { lat: 28.2833, lng: 84.3500 },
  'Manang': { lat: 28.6667, lng: 84.0167 },
  'Nawalparasi': { lat: 27.6333, lng: 83.7167 },
  'Palpa': { lat: 27.8667, lng: 83.5333 },
  'Gulmi': { lat: 28.0833, lng: 83.2833 },
  'Arghakhanchi': { lat: 27.9333, lng: 83.1500 },
  'Kapilvastu': { lat: 27.5667, lng: 83.0500 },
  'Nuwakot': { lat: 27.9167, lng: 85.1667 },
  'Rasuwa': { lat: 28.1333, lng: 85.4333 },
  'Dhading': { lat: 27.8667, lng: 84.9167 },
  'Sarlahi': { lat: 26.8667, lng: 85.5667 },
  'Mahottari': { lat: 26.7833, lng: 85.7500 },
  'Dhanusha': { lat: 26.7667, lng: 85.9333 },
  'Siraha': { lat: 26.6500, lng: 86.2000 },
  'Saptari': { lat: 26.5833, lng: 86.7000 },
  'Udayapur': { lat: 26.9333, lng: 86.5000 },
  'Khotang': { lat: 27.0333, lng: 86.8500 },
  'Okhaldhunga': { lat: 27.3167, lng: 86.5167 },
  'Bhojpur': { lat: 27.1833, lng: 87.0500 },
  'Sankhuwasabha': { lat: 27.3667, lng: 87.2000 },
  'Tehrathum': { lat: 27.1333, lng: 87.5500 },
  'Panchthar': { lat: 27.1333, lng: 87.7500 },
  'Taplejung': { lat: 27.3500, lng: 87.6667 },
  'Dailekh': { lat: 28.8500, lng: 81.7167 },
  'Surkhet': { lat: 28.6000, lng: 81.6167 },
  'Jajarkot': { lat: 28.7000, lng: 82.2000 },
  'Rukum': { lat: 28.6333, lng: 82.5667 },
  'Rolpa': { lat: 28.5000, lng: 82.6500 },
  'Pyuthan': { lat: 28.0833, lng: 82.8500 },
  'Salyan': { lat: 28.3667, lng: 82.1833 },
  'Kalikot': { lat: 29.1333, lng: 81.6167 },
  'Jumla': { lat: 29.2833, lng: 82.1667 },
  'Mugu': { lat: 29.4833, lng: 82.0833 },
  'Bajhang': { lat: 29.5333, lng: 81.1833 },
  'Bajura': { lat: 29.3667, lng: 81.3333 },
  'Achham': { lat: 29.0500, lng: 81.2500 },
  'Doti': { lat: 29.2667, lng: 80.9500 },
  'Baitadi': { lat: 29.5167, lng: 80.4167 },
  'Darchula': { lat: 29.8500, lng: 80.5500 },
};

export const getDistrictList = async (_req: any, res: Response) => {
  res.json({ success: true, data: Object.keys(DISTRICT_COORDS).sort() });
};

export const getCampaignMapData = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'LIVE',
        isActive: true,
        district: { not: null },
      },
      select: {
        id: true,
        title: true,
        district: true,
        category: true,
        targetAmount: true,
        coverImage: true,
        donationCount: true,
        beneficiary: { select: { name: true } },
        _count: {
          select: {
            moneyDonations: { where: { status: 'COMPLETED' } },
          },
        },
      },
    });

    const mapData = campaigns
      .filter((c) => c.district && DISTRICT_COORDS[c.district])
      .map((c) => ({
        id: c.id,
        title: c.title,
        district: c.district,
        category: c.category,
        targetAmount: c.targetAmount.toString(),
        coverImage: c.coverImage,
        donationCount: c.donationCount,
        beneficiary: c.beneficiary.name,
        lat: DISTRICT_COORDS[c.district!].lat,
        lng: DISTRICT_COORDS[c.district!].lng,
      }));

    res.json({ success: true, data: mapData });
  } catch (error) {
    next(error);
  }
};
