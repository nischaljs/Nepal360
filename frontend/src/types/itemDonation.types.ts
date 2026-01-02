import type { Campaign } from "./campaign.types";
import type { CurrentUser } from "./auth.types";

export type ItemDonationStatus = "PLEDGED" | "DELIVERED" | "CONFIRMED" | "REJECTED";

export interface ItemDonation {
  id: string;
  donorId: string;
  campaignId: string;
  itemName: string;
  quantity: string;
  deliveryNote?: string;
  deliveryPhoto?: string;
  status: ItemDonationStatus;
  confirmedAt?: string | null;
  createdAt: string;
  donor?: Partial<CurrentUser>;
  campaign?: Partial<Campaign>;
}
