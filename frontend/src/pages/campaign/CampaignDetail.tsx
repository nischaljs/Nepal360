// frontend/src/pages/campaign/CampaignDetail.tsx
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import CampaignForm from "../../components/campaign/CampaignForm";
import MilestoneForm from "../../components/campaign/MilestoneForm";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { addMilestone, deleteMilestone, getCampaignById, updateCampaign } from "../../services/campaign.service";
import { useAuthStore } from "../../store/auth.store";
import type { AddMilestoneData, Campaign, UpdateCampaignData } from "../../types/campaign.types";

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getCampaignById(id);
      setCampaign(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load campaign details.");
      toast.error("Error", { description: err.response?.data?.message || "Failed to load campaign." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleUpdateCampaign = async (data: UpdateCampaignData) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const updatedCampaign = await updateCampaign(id, data);
      setCampaign(updatedCampaign);
      toast.success("Campaign Updated", { description: "Campaign details updated successfully." });
      setIsEditingCampaign(false); // Exit edit mode
    } catch (err: any) {
      toast.error("Update Failed", { description: err.response?.data?.message || "Failed to update campaign." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMilestone = async (data: AddMilestoneData) => {
    if (!id) return;
    setIsAddingMilestone(true);
    try {
      await addMilestone(id, data);
      toast.success("Milestone Added", { description: "New milestone added successfully." });
      fetchCampaign(); // Re-fetch campaign to update milestones list
    } catch (err: any) {
      toast.error("Milestone Failed", { description: err.response?.data?.message || "Failed to add milestone." });
    } finally {
      setIsAddingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this milestone?")) {
      return;
    }
    try {
      await deleteMilestone(id, milestoneId);
      toast.success("Milestone Deleted", { description: "Milestone removed successfully." });
      fetchCampaign(); // Re-fetch campaign to update milestones list
    } catch (err: any) {
      toast.error("Deletion Failed", { description: err.response?.data?.message || "Failed to delete milestone." });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading campaign details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  if (!campaign) {
    return <div className="container mx-auto p-4 text-center">Campaign not found.</div>;
  }

  const isBeneficiary = user?.id === campaign.beneficiaryId;
  const canEditCampaign = isBeneficiary && (campaign.status === "DRAFT" || campaign.status === "PENDING_VERIFICATION");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{campaign.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={campaign.coverImage} alt={campaign.title} className="w-full h-80 object-cover rounded-md mb-4" />
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{campaign.description}</p>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Beneficiary:</strong> {campaign.beneficiary.name} ({campaign.beneficiary.email})</p>
              <p><strong>Target Amount:</strong> ${parseFloat(campaign.targetAmount).toFixed(2)}</p>
              <p><strong>Current Status:</strong> {campaign.status}</p>
              <p><strong>Donations Received:</strong> {campaign.donationCount}</p>
              <p><strong>Created On:</strong> {format(new Date(campaign.createdAt), "PPP")}</p>
              {campaign.verifiedAt && <p><strong>Verified On:</strong> {format(new Date(campaign.verifiedAt), "PPP")}</p>}
              {campaign.rejectionReason && <p className="text-red-500"><strong>Rejection Reason:</strong> {campaign.rejectionReason}</p>}
              {campaign.suspensionReason && <p className="text-orange-500"><strong>Suspension Reason:</strong> {campaign.suspensionReason}</p>}
            </CardContent>
          </Card>

          {campaign.proofLinks && campaign.proofLinks.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Proof Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {campaign.proofLinks.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Proof File {index + 1}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isBeneficiary && canEditCampaign && (
            <div className="mt-6">
              {!isEditingCampaign ? (
                <Button onClick={() => setIsEditingCampaign(true)}>Edit Campaign</Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditingCampaign(false)}>Cancel Edit</Button>
              )}
            </div>
          )}
        </div>

        <div>
          {isEditingCampaign && isBeneficiary && canEditCampaign && (
            <div className="mb-8">
              <CampaignForm
                initialData={campaign}
                onSubmit={handleUpdateCampaign}
                isLoading={isUpdating}
                isEditMode={true}
              />
              <Separator className="my-8" />
            </div>
          )}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.milestones.length === 0 ? (
                <p>No milestones set for this campaign.</p>
              ) : (
                <ul className="space-y-2">
                  {campaign.milestones.map((milestone) => (
                    <li key={milestone.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                      <span>{milestone.title} - ${parseFloat(milestone.amount).toFixed(2)} {milestone.completed && "(Completed)"}</span>
                      {isBeneficiary && canEditCampaign && (
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteMilestone(milestone.id)}>
                          Delete
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {isBeneficiary && canEditCampaign && (
            <MilestoneForm onSubmit={handleAddMilestone} isLoading={isAddingMilestone} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
