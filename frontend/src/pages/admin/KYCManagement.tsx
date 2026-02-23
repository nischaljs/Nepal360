import { useState, useEffect } from "react";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { getKycProfiles, approveKyc, rejectKyc } from "@/services/admin.kyc.service";
import type { KYCProfile, KYCStatus } from "@/types/kyc.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KYCManagement = () => {
  const [kycProfiles, setKycProfiles] = useState<KYCProfile[]>([]);
  const [status, setStatus] = useState<KYCStatus>("PENDING");
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<KYCProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchProfiles(status);
  }, [status]);

  const fetchProfiles = async (fetchStatus: KYCStatus) => {
    setLoading(true);
    try {
      const data = await getKycProfiles(fetchStatus);
      setKycProfiles(data);
    } catch (error) {
      toast.error("Failed to fetch KYC profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveKyc(userId);
      toast.success("KYC profile approved");
      fetchProfiles(status);
      setSelectedProfile(null);
    } catch (error) {
      toast.error("Failed to approve KYC profile");
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await rejectKyc(userId, rejectionReason);
      toast.success("KYC profile rejected");
      fetchProfiles(status);
      setSelectedProfile(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject KYC profile");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">KYC Management</h1>
      <Tabs value={status} onValueChange={(value) => setStatus(value as KYCStatus)}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={status}>
          {loading ? (
            <div className="py-8"><GlobalLoader message="Loading profiles..." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.user?.name}</TableCell>
                    <TableCell>{profile.documentType}</TableCell>
                    <TableCell>{new Date(profile.submittedAt!).toLocaleString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedProfile(profile)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
      {selectedProfile && (
        <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>KYC Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p><strong>User:</strong> {selectedProfile.user?.name} ({selectedProfile.user?.email})</p>
              <p><strong>Document Type:</strong> {selectedProfile.documentType}</p>
              <p><strong>Document Number:</strong> {selectedProfile.documentNumber}</p>
              <p><strong>Bank Account:</strong> {selectedProfile.bankAccountName} - {selectedProfile.bankAccountNo}</p>
              {selectedProfile.walletProvider && <p><strong>Wallet:</strong> {selectedProfile.walletProvider}</p>}
              <div>
                <p><strong>Document Image:</strong></p>
                <img src={selectedProfile.documentImage} alt="Document" className="max-w-full h-auto" />
              </div>
              <div>
                <p><strong>Profile Photo:</strong></p>
                <img src={selectedProfile.profilePhoto} alt="Profile" className="max-w-full h-auto" />
              </div>

              {status === "PENDING" && (
                <div className="flex flex-col space-y-4">
                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                    <Input id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => handleReject(selectedProfile.userId)}>Reject</Button>
                    <Button onClick={() => handleApprove(selectedProfile.userId)}>Approve</Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KYCManagement;
