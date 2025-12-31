// frontend/src/pages/campaign/MyCampaigns.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCampaigns } from "../../services/campaign.service";
import type{ Campaign } from "../../types/campaign.types";
import CampaignCard from "../../components/campaign/CampaignCard";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";

const MyCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getMyCampaigns();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load campaigns.");
        toast.error("Error", { description: err.response?.data?.message || "Failed to load campaigns." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading your campaigns...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
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
