// frontend/src/pages/admin/AdminCampaignDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAdminCampaignDetail,
  getAdminCampaignStats,
  approveCampaign,
  rejectCampaign,
  suspendCampaign,
  resumeCampaign,
  deleteCampaign,
} from "../../services/admin.campaign.service";
import type {
   AdminCampaignDetail as AdminCampaignDetailType,
   AdminCampaignStats,
   ApproveCampaignData, 
   RejectCampaignData,
   SuspendCampaignData,
   DeleteCampaignData,
} from "../../types/admin.campaign.types";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { format } from "date-fns";
import { Input } from "../../components/ui/input";


const AdminCampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<AdminCampaignDetailType | null>(
    null
  );
  const [stats, setStats] = useState<AdminCampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [suspensionNote, setSuspensionNote] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteNote, setDeleteNote] = useState("");

  const fetchCampaignData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const campaignData = await getAdminCampaignDetail(id);
      setCampaign(campaignData);
      const statsData = await getAdminCampaignStats(id);
      setStats(statsData);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load campaign details."
      );
      toast.error("Error", {
        description:
          err.response?.data?.message || "Failed to load campaign details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [id]);

  const handleAction = async (
    action: string,
    payload?: ApproveCampaignData | RejectCampaignData | SuspendCampaignData | DeleteCampaignData
  ) => {
    if (!id) return;
    try {
   
      switch (action) {
        case "approve":
           await approveCampaign(id, payload);
          break;
        case "reject":
           await rejectCampaign(id, payload as RejectCampaignData);
          setRejectionReason("");
          setRejectionNote("");
          break;
        case "suspend":
           await suspendCampaign(id, payload as SuspendCampaignData);
          setSuspensionReason("");
          setSuspensionNote("");
          break;
        case "resume":
           await resumeCampaign(id);
          break;
        case "delete":
           await deleteCampaign(id, payload as DeleteCampaignData);
          setDeleteReason("");
          setDeleteNote("");
          navigate("/admin/campaigns"); // Redirect after soft delete
          break;
        default:
          throw new Error("Unknown action");
      }
      toast.success("Success", {
        description: `Campaign ${action}d successfully!`,
      });
      fetchCampaignData(); // Re-fetch to update status
    } catch (err: any) {
      toast.error("Action Failed", {
        description: err.response?.data?.message || `Failed to ${action} campaign.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading campaign details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-4 text-center">
        Campaign not found.
      </div>
    );
  }

  const isPendingVerification = campaign.status === "PENDING_VERIFICATION";
  const isSuspended = campaign.status === "SUSPENDED";
  const isLive = campaign.status === "LIVE";
  const hasDonations = stats && parseFloat(stats.totalRaised) > 0;


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Admin View: {campaign.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>
                ID: {campaign.id} | Status: {campaign.status} |{" "}
                {campaign.isActive ? "Active" : "Inactive"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={campaign.coverImage}
                alt={campaign.title}
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              <p className="mb-4">{campaign.description}</p>
              <p>
                <strong>Beneficiary:</strong> {campaign.beneficiary.name} (
                {campaign.beneficiary.email})
              </p>
              <p>
                <strong>Target Amount:</strong> Rs.
                {parseFloat(campaign.targetAmount).toFixed(2)}
              </p>
              <p>
                <strong>Created On:</strong>{" "}
                {format(new Date(campaign.createdAt), "PPP")}
              </p>
              {campaign.verifiedAt && (
                <p>
                  <strong>Verified On:</strong>{" "}
                  {format(new Date(campaign.verifiedAt), "PPP")}
                </p>
              )}
              {campaign.rejectionReason && (
                <p className="text-red-500">
                  <strong>Rejection Reason:</strong>{" "}
                  {campaign.rejectionReason}
                </p>
              )}
              {campaign.suspensionReason && (
                <p className="text-orange-500">
                  <strong>Suspension Reason:</strong>{" "}
                  {campaign.suspensionReason}
                </p>
              )}

              {campaign.proofLinks && campaign.proofLinks.length > 0 && (
                <div className="mt-4">
                  <strong>Proof Files:</strong>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {campaign.proofLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Proof File {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              <h3 className="text-xl font-semibold mb-3">Milestones</h3>
              {campaign.milestones.length === 0 ? (
                <p>No milestones set for this campaign.</p>
              ) : (
                <ul className="space-y-2">
                  {campaign.milestones.map((milestone) => (
                    <li
                      key={milestone.id}
                      className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
                    >
                      <span>
                        {milestone.title} - Rs.
                        {parseFloat(milestone.amount).toFixed(2)}{" "}
                        {milestone.completed && "(Completed)"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {isPendingVerification && (
                <>
                  <Button
                    onClick={() => handleAction("approve", {})}
                    className="mr-2"
                  >
                    Approve Campaign
                  </Button>
                  <Button variant="outline" onClick={() => {}}>
                    Reject Campaign
                  </Button>
                  <div className="mt-4 space-y-2">
                    <Input
                      placeholder="Rejection Reason (min 10 chars)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <Input
                      placeholder="Admin Note (optional)"
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleAction("reject", {
                          reason: rejectionReason,
                          note: rejectionNote,
                        })
                      }
                      disabled={rejectionReason.length < 10}
                    >
                      Confirm Reject
                    </Button>
                  </div>
                  <Separator className="my-4" />
                </>
              )}

              {isLive && (
                <>
                  <Button variant="outline" onClick={() => {}}>
                    Suspend Campaign
                  </Button>
                  <div className="mt-4 space-y-2">
                    <Input
                      placeholder="Suspension Reason (min 10 chars)"
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                    />
                    <Input
                      placeholder="Admin Note (optional)"
                      value={suspensionNote}
                      onChange={(e) => setSuspensionNote(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleAction("suspend", {
                          reason: suspensionReason,
                          note: suspensionNote,
                        })
                      }
                      disabled={suspensionReason.length < 10}
                    >
                      Confirm Suspend
                    </Button>
                  </div>
                  <Separator className="my-4" />
                </>
              )}

              {isSuspended && (
                <Button onClick={() => handleAction("resume")}>
                  Resume Campaign
                </Button>
              )}

              {!hasDonations && (campaign.status === "DRAFT" || campaign.status === "PENDING_VERIFICATION") && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Soft Delete Campaign</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder="Deletion Reason (min 10 chars)"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                    <Input
                      placeholder="Admin Note (optional)"
                      value={deleteNote}
                      onChange={(e) => setDeleteNote(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleAction("delete", {
                          reason: deleteReason,
                          note: deleteNote,
                        })
                      }
                      disabled={deleteReason.length < 10}
                    >
                      Confirm Soft Delete
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Campaign Statistics */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-2">
                  <p>
                    <strong>Total Raised:</strong> Rs.
                    {parseFloat(stats.totalRaised).toFixed(2)}
                  </p>
                  <p>
                    <strong>Donation Count:</strong> {stats.donationCount}
                  </p>
                  <p>
                    <strong>Average Donation:</strong> Rs.
                    {parseFloat(stats.averageDonation).toFixed(2)}
                  </p>
                  <p>
                    <strong>Item Donations:</strong> {stats.itemDonationCount}
                  </p>
                  <p>
                    <strong>Share Count:</strong> {stats.shareCount}
                  </p>
                  <p>
                    <strong>View Count:</strong> {stats.viewCount}
                  </p>
                  <p>
                    <strong>Completion:</strong> {stats.completionPercentage}%
                  </p>
                  <p>
                    <strong>Milestones:</strong> {stats.milestonesCompleted} /{" "}
                    {stats.totalMilestones}
                  </p>
                </div>
              ) : (
                <p>No statistics available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignDetail;
