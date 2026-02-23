// frontend/src/pages/campaign/CampaignDetail.tsx
import { format } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import CampaignForm from "../../components/campaign/CampaignForm";
import MilestoneForm from "../../components/campaign/MilestoneForm";
import ItemPledgeForm from "../../components/campaign/ItemPledgeForm";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { addMilestone, deleteMilestone, getBeneficiaryCampaignById, updateCampaign, getCampaignById, getCampaignStats, incrementShareCount, claimMilestone } from "../../services/campaign.service";
import { getCampaignItemDonations } from "../../services/itemDonation.service";
import { useAuthStore } from "../../store/auth.store";
import type { AddMilestoneData, Campaign, UpdateCampaignData } from "../../types/campaign.types";
import type { ItemDonation } from "../../types/itemDonation.types";
import { CircleDollarSign, Users, Gift, Handshake, Eye, Share2, Edit, X, Calendar, CheckCircle, AlertCircle, XCircle, Package, Link, Copy, Check, MessageCircle } from "lucide-react";
import { incrementVisitCount } from "../../services/campaign.visit.service";
import QRCode from "react-qr-code";
import DonationForm from "../../components/campaign/DonationForm";
import RecurringDonationForm from "../../components/campaign/RecurringDonationForm";
import { verifyKhaltiPayment } from "../../services/donation.service";
import DonorList from "@/components/campaign/DonorList";
import CommentSection from "../../components/campaign/CommentSection";
import BookmarkButton from "../../components/campaign/BookmarkButton";
import FundraisingPrediction from "../../components/campaign/FundraisingPrediction";

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
  const [itemDonations, setItemDonations] = useState<ItemDonation[]>([]);
  const [copied, setCopied] = useState(false);

  const query = useQuery();
  const pidxVerifiedRef = useRef(false);

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

      const itemDonationsData = await getCampaignItemDonations(id).catch(() => []);

      setCampaign(data);
      setStats(fetchedStats);
      setVisits(data.visits || data.viewCount || 0);
      setShares(data.shareCount);
      setItemDonations(itemDonationsData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load campaign details.");
      toast.error("Error", { description: err.response?.data?.message || "Failed to load campaign." });
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, user?.id]);

  useEffect(() => {
    const pidx = query.get("pidx");
    const paymentSuccess = query.get("payment_success");

    if (pidx && paymentSuccess === "true" && !pidxVerifiedRef.current) {
      pidxVerifiedRef.current = true;
      verifyKhaltiPayment({ pidx }).then(() => {
        toast.success("Payment verified successfully!");
        fetchCampaign();
      }).catch((err) => {
        toast.error("Payment verification failed.", { description: err.message || "Please try again." });
      }).finally(() => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("pidx");
        newUrl.searchParams.delete("payment_success");
        window.history.replaceState({}, document.title, newUrl.toString());
      });
    }
  }, [id, query, fetchCampaign]);

  useEffect(() => {
    if (!id) return;
    const pidx = query.get("pidx");
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
  }, [id, query]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  useEffect(() => {
    if (campaign) {
      document.title = `${campaign.title} | Nepal360`;
    }
  }, [campaign]);

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
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Campaign not found.</p>
        </div>
      </div>
    );
  }

  const isBeneficiary = user?.id === campaign.beneficiaryId;
  const canEditCampaign = isBeneficiary && (campaign.status === "DRAFT" || campaign.status === "PENDING_VERIFICATION");
  const campaignUrl = window.location.href;
  const progressPercentage = (parseFloat(stats?.totalMoneyRaised || '0') / parseFloat(campaign.targetAmount)) * 100;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; bg: string; icon: any }> = {
      DRAFT: { color: "text-gray-700", bg: "bg-gray-100", icon: Edit },
      PENDING_VERIFICATION: { color: "text-yellow-700", bg: "bg-yellow-100", icon: AlertCircle },
      ACTIVE: { color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle },
      COMPLETED: { color: "text-blue-700", bg: "bg-blue-100", icon: CheckCircle },
      SUSPENDED: { color: "text-orange-700", bg: "bg-orange-100", icon: XCircle },
      REJECTED: { color: "text-red-700", bg: "bg-red-100", icon: XCircle },
    };

    const badge = badges[status] || badges.DRAFT;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-6">
        {/* Campaign Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="relative h-96">
            <img 
              src={campaign.coverImage} 
              alt={campaign.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              {getStatusBadge(campaign.status)}
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{campaign.title}</h1>
              <BookmarkButton campaignId={id!} size="default" />
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl font-bold text-emerald-600">
                  रू {stats?.totalMoneyRaised ? parseFloat(stats.totalMoneyRaised).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                </span>
                <span className="text-gray-600">
                  raised of <span className="font-semibold">रू {parseFloat(campaign.targetAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span> goal
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{progressPercentage.toFixed(1)}% funded</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Handshake className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.totalDonationCount || 0}</p>
                <p className="text-sm text-gray-600">Donations</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.uniqueDonorCount || 0}</p>
                <p className="text-sm text-gray-600">Donors</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Eye className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{visits}</p>
                <p className="text-sm text-gray-600">Views</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Share2 className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{shares}</p>
                <p className="text-sm text-gray-600">Shares</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl">Campaign Story</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{campaign.description}</p>
              </CardContent>
            </Card>

            {/* Campaign Information */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl">Campaign Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Beneficiary</p>
                    <p className="font-semibold text-gray-900">{campaign.beneficiary.name}</p>
                    {isBeneficiary && (
                      <p className="text-sm text-gray-600">{campaign.beneficiary.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target Amount</p>
                    <p className="font-semibold text-gray-900">रू {parseFloat(campaign.targetAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created On</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {format(new Date(campaign.createdAt), "PPP")}
                    </p>
                  </div>
                  {campaign.verifiedAt && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Verified On</p>
                      <p className="font-semibold text-emerald-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {format(new Date(campaign.verifiedAt), "PPP")}
                      </p>
                    </div>
                  )}
                </div>

                {campaign.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason</p>
                    <p className="text-red-700">{campaign.rejectionReason}</p>
                  </div>
                )}

                {campaign.suspensionReason && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-orange-800 mb-1">Suspension Reason</p>
                    <p className="text-orange-700">{campaign.suspensionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Stats */}
            {stats && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">Detailed Statistics</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <CircleDollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-emerald-700">
                        रू {stats.totalMoneyRaised ? parseFloat(stats.totalMoneyRaised).toLocaleString() : '0.00'}
                      </p>
                      <p className="text-sm text-emerald-600 mt-1">Total Raised</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Handshake className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-700">{stats.totalDonationCount}</p>
                      <p className="text-sm text-blue-600 mt-1">Total Donations</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-700">{stats.uniqueDonorCount}</p>
                      <p className="text-sm text-purple-600 mt-1">Unique Donors</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <Gift className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-700">{stats.itemDonationCount}</p>
                      <p className="text-sm text-amber-600 mt-1">Item Donations</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Eye className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-700">{visits}</p>
                      <p className="text-sm text-gray-600 mt-1">Views</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Share2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-700">{shares}</p>
                      <p className="text-sm text-gray-600 mt-1">Shares</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fundraising Prediction */}
            {campaign.status === "LIVE" && (
              <FundraisingPrediction campaignId={id!} />
            )}

            {/* Share Campaign */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl">Share This Campaign</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-blue-300 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`, '_blank', 'width=600,height=400');
                        handleShare();
                      }}
                      title="Share on Facebook"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-gray-400 text-gray-800 hover:bg-gray-100"
                      onClick={() => {
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent(campaign.title)}`, '_blank', 'width=600,height=400');
                        handleShare();
                      }}
                      title="Share on X"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-green-400 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        window.open(`https://wa.me/?text=${encodeURIComponent(campaign.title + ' ' + campaignUrl)}`, '_blank');
                        handleShare();
                      }}
                      title="Share on WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-gray-300 text-gray-600 hover:bg-gray-100"
                      onClick={() => {
                        navigator.clipboard.writeText(campaignUrl);
                        setCopied(true);
                        toast.success("Link copied to clipboard!");
                        setTimeout(() => setCopied(false), 2000);
                        handleShare();
                      }}
                      title="Copy link"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <QRCode
                      size={128}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      value={campaignUrl}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proof Files */}
            {campaign.proofLinks && campaign.proofLinks.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">Supporting Documents</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {campaign.proofLinks.map((link, index) => (
                      <a 
                        key={index} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-gray-700 font-medium">Document {index + 1}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments / Discussion */}
            <CommentSection campaignId={id!} />

            {/* Edit Campaign Section */}
            {isBeneficiary && canEditCampaign && (
              <div className="space-y-6">
                {!isEditingCampaign ? (
                  <Button 
                    onClick={() => setIsEditingCampaign(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Campaign
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Edit Campaign</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditingCampaign(false)}
                        className="border-gray-300"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                    <Card className="border-gray-200 shadow-sm">
                      <CardContent className="pt-6">
                        <CampaignForm
                          initialData={campaign}
                          onSubmit={handleUpdateCampaign}
                          isLoading={isUpdating}
                          isEditMode={true}
                        />
                      </CardContent>
                    </Card>
                    <Separator className="my-8" />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Actions & Milestones */}
          <div className="space-y-6">
            {/* Donation Form */}
            <DonationForm campaignId={id!} />

            {/* Recurring Donation */}
            {campaign.status === "LIVE" && (
              <RecurringDonationForm campaignId={id!} />
            )}

            {/* Milestones */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl">Campaign Milestones</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {campaign.milestones.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No milestones set yet</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {campaign.milestones.map((milestone) => {
                      const claimStatus = milestone.claimStatus || 'UNCLAIMED';
                      const statusLabel = milestone.fundsReleased
                        ? 'Released'
                        : claimStatus === 'CLAIMED'
                        ? 'Claimed'
                        : claimStatus === 'REJECTED'
                        ? 'Rejected'
                        : 'Pending';
                      const statusColor = milestone.fundsReleased
                        ? 'bg-emerald-100 text-emerald-700'
                        : claimStatus === 'CLAIMED'
                        ? 'bg-blue-100 text-blue-700'
                        : claimStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600';

                      return (
                        <li
                          key={milestone.id}
                          className={`p-4 rounded-lg border transition-all ${
                            milestone.completed
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {milestone.completed && (
                                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                )}
                                <p className={`font-semibold ${
                                  milestone.completed ? 'text-emerald-700' : 'text-gray-900'
                                }`}>
                                  {milestone.title}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <p className={`text-sm ${
                                milestone.completed ? 'text-emerald-600' : 'text-gray-600'
                              }`}>
                                रू {parseFloat(milestone.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </p>
                              {milestone.fundsReleased && milestone.releasedAmount && (
                                <p className="text-xs text-emerald-600 mt-1">
                                  Released: रू {parseFloat(milestone.releasedAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {isBeneficiary && (claimStatus === 'UNCLAIMED' || claimStatus === 'REJECTED') && !milestone.fundsReleased && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await claimMilestone(milestone.id);
                                      toast.success("Milestone Claimed", { description: "Your claim has been submitted for review." });
                                      fetchCampaign();
                                    } catch (err: any) {
                                      toast.error("Claim Failed", { description: err.response?.data?.message || "Failed to claim milestone." });
                                    }
                                  }}
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                >
                                  Claim
                                </Button>
                              )}
                              {isBeneficiary && canEditCampaign && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteMilestone(milestone.id)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Add Milestone Form */}
            {isBeneficiary && canEditCampaign && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">Add New Milestone</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <MilestoneForm onSubmit={handleAddMilestone} isLoading={isAddingMilestone} />
                </CardContent>
              </Card>
            )}

            {/* Item Pledges */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Package className="w-5 h-5 text-amber-600" />
                    Item Pledges
                  </CardTitle>
                  {campaign.status === "LIVE" && (
                    <ItemPledgeForm campaignId={id!} onSuccess={fetchCampaign} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {itemDonations.length === 0 ? (
                  <div className="text-center py-6">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No item pledges yet</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {itemDonations.map((donation) => (
                      <li key={donation.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{donation.itemName}</p>
                            <p className="text-sm text-gray-600">Qty: {donation.quantity}</p>
                            {donation.donor?.name && (
                              <p className="text-xs text-gray-500 mt-1">by {donation.donor.name}</p>
                            )}
                          </div>
                          <Badge
                            className={
                              donation.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : donation.status === 'DELIVERED'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : donation.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }
                            variant="outline"
                          >
                            {donation.status}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Donor List */}
            <DonorList campaignId={id!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;