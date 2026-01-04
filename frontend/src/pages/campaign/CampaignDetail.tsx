// frontend/src/pages/campaign/CampaignDetail.tsx
import { format } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import CampaignForm from "../../components/campaign/CampaignForm";
import MilestoneForm from "../../components/campaign/MilestoneForm";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { addMilestone, deleteMilestone, getBeneficiaryCampaignById, updateCampaign, getCampaignById, getCampaignStats, incrementShareCount } from "../../services/campaign.service";
import { useAuthStore } from "../../store/auth.store";
import type { AddMilestoneData, Campaign, UpdateCampaignData } from "../../types/campaign.types";
import { CircleDollarSign, Users, Gift, Handshake, Eye, Share2 } from "lucide-react";
import { incrementVisitCount } from "../../services/campaign.visit.service";
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, FacebookIcon, TwitterIcon, LinkedinIcon } from "react-share";
import QRCode from "react-qr-code";
import DonationForm from "../../components/campaign/DonationForm";
import { verifyKhaltiPayment } from "../../services/donation.service";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [visits, setVisits] = useState(0);
  const [shares, setShares] = useState(0);

  const query = useQuery();
  const pidxVerifiedRef = useRef(false);

  // Define fetchCampaign using useCallback to memoize it
  const fetchCampaign = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      let data: Campaign;
      let fetchedStats: any;

      if (isAuthenticated && user?.id) {
        try {
          data = await getBeneficiaryCampaignById(id);
        } catch (authError: any) {
          if (authError.response?.status === 403 || authError.response?.status === 404) {
            data = await getCampaignById(id);
          } else {
            throw authError;
          }
        }
      } else {
        data = await getCampaignById(id);
      }

      fetchedStats = await getCampaignStats(id);

      setCampaign(data);
      setStats(fetchedStats);
      setVisits(data.viewCount);
      setShares(data.shareCount);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load campaign details.");
      toast.error("Error", { description: err.response?.data?.message || "Failed to load campaign." });
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, user?.id]); // Dependencies for useCallback

  // Effect for handling Khalti payment verification
  useEffect(() => {
    const pidx = query.get("pidx");
    const paymentSuccess = query.get("payment_success");

    if (pidx && paymentSuccess === "true" && !pidxVerifiedRef.current) {
      pidxVerifiedRef.current = true; // Mark as processed
      verifyKhaltiPayment({ pidx }).then(() => {
        toast.success("Payment verified successfully!");
        fetchCampaign(); // Re-fetch campaign data after successful payment
      }).catch((err) => {
        toast.error("Payment verification failed.", { description: err.message || "Please try again." });
      }).finally(() => {
        // Clear pidx and payment_success from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("pidx");
        newUrl.searchParams.delete("payment_success");
        window.history.replaceState({}, document.title, newUrl.toString());
        // Do NOT reset pidxVerifiedRef.current here, it should remain true for the current render cycle
      });
    }
  }, [id, query, fetchCampaign]); // Added fetchCampaign to dependencies

  // Effect for incrementing visit count
  useEffect(() => {
    if (!id) return;
    const pidx = query.get("pidx");
    // Only increment visit count if not returning from payment gateway
    // And only once per session per campaign
    if (!pidx) {
        const visitedKey = `campaign-${id}-visited`;
        if (!sessionStorage.getItem(visitedKey)) {
            incrementVisitCount(id)
                .then(data => {
                    setVisits(data.visits);
                    sessionStorage.setItem(visitedKey, 'true');
                })
                .catch(err => console.error("Failed to increment visit count:", err));
        }
    }
  }, [id, query]); // Depend on id and query to ensure it runs correctly on initial load and navigation

  // Effect for fetching campaign data
  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign, pidxVerifiedRef.current]); // fetchCampaign is already memoized

  const handleShare = () => {
    if (id) {
      incrementShareCount(id).then(data => setShares(data.shares));
    }
  }

  const handleUpdateCampaign = async (data: UpdateCampaignData) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const updatedCampaign = await updateCampaign(id, data);
      setCampaign(updatedCampaign);
      toast.success("Campaign Updated", { description: "Campaign details updated successfully." });
      setIsEditingCampaign(false);
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
      fetchCampaign();
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
      fetchCampaign();
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
  const campaignUrl = window.location.href;

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
              <p><strong>Beneficiary:</strong> {campaign.beneficiary.name}</p>
              {isBeneficiary && <p><strong>Beneficiary Email:</strong> {campaign.beneficiary.email}</p>}
              <p><strong>Target Amount:</strong> ${parseFloat(campaign.targetAmount).toFixed(2)}</p>
              <p><strong>Current Status:</strong> {campaign.status}</p>
              <p><strong>Created On:</strong> {format(new Date(campaign.createdAt), "PPP")}</p>)
              {campaign.verifiedAt && <p><strong>Verified On:</strong> {format(new Date(campaign.verifiedAt), "PPP")}</p>}
              {campaign.rejectionReason && <p className="text-red-500"><strong>Rejection Reason:</strong> {campaign.rejectionReason}</p>}
              {campaign.suspensionReason && <p className="text-orange-500"><strong>Suspension Reason:</strong> {campaign.suspensionReason}</p>}
            </CardContent>
          </Card>

          {stats && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Campaign Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CircleDollarSign className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Money Raised</p>
                      <p className="font-bold">${stats.totalMoneyRaised ? parseFloat(stats.totalMoneyRaised).toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Handshake className="text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Donations</p>
                      <p className="font-bold">{stats.totalDonationCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Unique Donors</p>
                      <p className="font-bold">{stats.uniqueDonorCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gift className="text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-500">Item Donations</p>
                      <p className="font-bold">{stats.itemDonationCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Views</p>
                      <p className="font-bold">{visits}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Share2 className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Shares</p>
                      <p className="font-bold">{shares}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Share Campaign</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex gap-2">
                <FacebookShareButton url={campaignUrl} onShareWindowClose={handleShare}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={campaignUrl} onShareWindowClose={handleShare}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <LinkedinShareButton url={campaignUrl} onShareWindowClose={handleShare}>
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
              </div>
              <div style={{ height: "auto", margin: "0 auto", maxWidth: 64, width: "100%" }}>
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={campaignUrl}
                  viewBox={`0 0 256 256`}
                />
              </div>
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

          <DonationForm campaignId={id!} />

          <Card className="mb-4 mt-8">
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
