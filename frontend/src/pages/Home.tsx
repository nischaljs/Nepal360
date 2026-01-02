import { useEffect, useState } from "react";
import type { Campaign } from "../types/campaign.types";
import { getAllCampaigns } from "../services/campaign.service";
import CampaignCard from "../components/campaign/CampaignCard";
import { toast } from "sonner";
import { Spinner } from "../components/ui/spinner"; // Assuming you have a Spinner component

const Home = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getAllCampaigns();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch campaigns.");
        toast.error("Failed to fetch campaigns", {
          description: err.response?.data?.message || "An unexpected error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Spinner size="lg" /> {/* Use your spinner component */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Featured Campaigns</h1>
      {campaigns.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No campaigns available at the moment. Check back later!</p>
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

export default Home;
