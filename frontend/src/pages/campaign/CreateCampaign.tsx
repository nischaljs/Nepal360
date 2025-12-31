// frontend/src/pages/campaign/CreateCampaign.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignForm from "../../components/campaign/CampaignForm";
import { createCampaign } from "../../services/campaign.service";
import type{ CreateCampaignData, UpdateCampaignData } from "../../types/campaign.types";
import { toast } from "sonner";


const CreateCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateCampaignData | UpdateCampaignData) => {
    setIsLoading(true);
    try {
      // Type guard to ensure we have CreateCampaignData, as this component only creates
      if ('coverImage' in data) {
        const newCampaign = await createCampaign(data);
        toast.success("Campaign Created", {
          description: `Campaign "${newCampaign.title}" has been created successfully.`,
        });
        navigate(`/campaigns/${newCampaign.id}`);
      } else {
        toast.error("Error", {
          description: "Invalid campaign data provided for creation.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to Create Campaign", {
        description: error.response?.data?.message || "An error occurred while creating the campaign.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Campaign</h1>
      <div className="flex justify-center">
        <CampaignForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CreateCampaign;
