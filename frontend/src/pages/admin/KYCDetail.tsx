import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getKycProfileDetails, approveKyc, rejectKyc } from "@/services/admin.kyc.service";
import type { KYCProfile } from "@/types/kyc.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GlobalLoader from "@/components/ui/GlobalLoader";
import {
  ArrowLeft,
  User,
  FileText,
  Landmark,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Image,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
};

const KYCDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<KYCProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getKycProfileDetails(userId)
      .then(setProfile)
      .catch(() => toast.error("Failed to load KYC details"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleApprove = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await approveKyc(userId);
      toast.success("KYC profile approved");
      navigate("/admin/kyc");
    } catch {
      toast.error("Failed to approve KYC profile");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!userId) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    setActionLoading(true);
    try {
      await rejectKyc(userId, rejectionReason);
      toast.success("KYC profile rejected");
      navigate("/admin/kyc");
    } catch {
      toast.error("Failed to reject KYC profile");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <GlobalLoader message="Loading KYC details..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">KYC profile not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/kyc")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to KYC Management
        </Button>
      </div>
    );
  }

  const status = statusConfig[profile.status] || statusConfig.PENDING;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/kyc")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-sm text-muted-foreground">
            Review submitted documents for {profile.user?.name}
          </p>
        </div>
        <Badge className={`${status.color} border-0 text-sm px-3 py-1`}>
          {status.label}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-gray-500" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile.user?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="font-medium">
                  {profile.submittedAt
                    ? new Date(profile.submittedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              {profile.reviewedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed At</p>
                  <p className="font-medium">
                    {new Date(profile.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-gray-500" />
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="font-medium">{profile.documentType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document Number</p>
                <p className="font-medium">{profile.documentNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5 text-gray-500" />
              Bank & Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bank Account Name</p>
                <p className="font-medium">{profile.bankAccountName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Account Number</p>
                <p className="font-medium">{profile.bankAccountNo}</p>
              </div>
              {profile.walletProvider && (
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Provider</p>
                  <p className="font-medium flex items-center gap-1">
                    <Wallet className="h-4 w-4" /> {profile.walletProvider}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-5 w-5 text-gray-500" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Document Image</p>
                <div className="rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <img
                    src={profile.documentImage}
                    alt="Document"
                    className="w-full h-auto object-contain max-h-80"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Profile Photo</p>
                <div className="rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="w-full h-auto object-contain max-h-80"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejection reason (if rejected) */}
        {profile.status === "REJECTED" && profile.rejectionReason && (
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">Rejection Reason</p>
                  <p className="text-sm text-muted-foreground mt-1">{profile.rejectionReason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions for pending */}
        {profile.status === "PENDING" && (
          <Card className="border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason" className="text-sm font-medium">
                  Rejection Reason (required to reject)
                </Label>
                <Input
                  id="rejectionReason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KYCDetail;
