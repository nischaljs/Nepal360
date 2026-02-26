import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { getKycProfiles } from "@/services/admin.kyc.service";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from "lucide-react";

const KYCManagement = () => {
  const navigate = useNavigate();
  const [kycProfiles, setKycProfiles] = useState<KYCProfile[]>([]);
  const [status, setStatus] = useState<KYCStatus>("PENDING");
  const [loading, setLoading] = useState(false);

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
          ) : kycProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No {status.toLowerCase()} KYC profiles</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.user?.name}</TableCell>
                    <TableCell className="text-muted-foreground">{profile.user?.email}</TableCell>
                    <TableCell>{profile.documentType}</TableCell>
                    <TableCell>{new Date(profile.submittedAt!).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin/kyc/${profile.userId}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KYCManagement;
