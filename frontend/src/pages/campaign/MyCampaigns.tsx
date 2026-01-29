// frontend/src/pages/campaign/MyCampaigns.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyCampaigns } from "../../services/campaign.service";
import type{ Campaign } from "../../types/campaign.types";
import CampaignCard from "../../components/campaign/CampaignCard";
import { Button } from "../../components/ui/button";
import GlobalLoader from "../../components/ui/GlobalLoader";
import { useKycCheck } from "../../hooks/useKycCheck";

const MyCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isLoading: isKycLoading, hasApprovedKyc, user } = useKycCheck();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getMyCampaigns();
        setCampaigns(data);
      } catch (err: any) {
        // If 403 and no KYC, redirect to KYC page
        if (err.response?.status === 403 && err.response?.data?.message?.includes('KYC')) {
          navigate('/kyc/submit');
          return;
        }
        toast.error("Error", { description: err.response?.data?.message || "Failed to load campaigns." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, [navigate]);

  useEffect(() => {
    if (!isKycLoading && user && !hasApprovedKyc) {
      navigate('/kyc/submit');
    }
  }, [user, hasApprovedKyc, isKycLoading, navigate]);

  if (isKycLoading || isLoading) {
    return <GlobalLoader fullScreen message="Loading..." />;
  }

  if (!user || !hasApprovedKyc) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <Link to="/campaigns/create">
          <Button>Create New Campaign</Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>You haven't created any campaigns yet.</p>
          <p>
            <Link to="/campaigns/create">
              <Button variant="link">Start one now!</Button>
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;
