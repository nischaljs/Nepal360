// frontend/src/types/donation.types.ts

export interface InitiateKhaltiPaymentData {
    campaignId: string;
    amount: number;
    currency: "NPR";
    returnUrl: string;
    visibility: string;
  }
  
  export interface InitiateKhaltiPaymentResponse {
    paymentUrl: string;
  }
  
  export interface VerifyKhaltiPaymentData {
    pidx: string;
  }
  
  export interface VerifyKhaltiPaymentResponse {
    success: boolean;
    message?: string;
    donation?: any;
  }
  
  export interface Donor {
    id: string;
    amount: number;
    createdAt: string;
    donorName: string;
  }
  
  export interface CampaignDonorsResponse {
    donors: Donor[];
    currentPage: number;
    totalPages: number;
    totalDonors: number;
  }