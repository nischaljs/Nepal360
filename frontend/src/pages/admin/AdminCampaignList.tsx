// frontend/src/pages/admin/AdminCampaignList.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminCampaigns, getAdminVerificationQueue } from "../../services/admin.campaign.service";
import type { AdminCampaignListItem,  AdminCampaignVerificationQueueItem } from "../../types/admin.campaign.types";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"; // Assuming table components exist
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import type { CampaignStatus } from "@/types/campaign.types";

const AdminCampaignList = () => {
  const [campaigns, setCampaigns] = useState<AdminCampaignListItem[] | AdminCampaignVerificationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | "ALL" | "VERIFICATION_QUEUE">("ALL");
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: AdminCampaignListItem[] | AdminCampaignVerificationQueueItem[];
      if (filterStatus === "VERIFICATION_QUEUE") {
        data = await getAdminVerificationQueue();
      } else {
        const filters: { status?: CampaignStatus; beneficiaryId?: string } = {};
        if (filterStatus !== "ALL") {
          filters.status = filterStatus;
        }
        // NOTE: Backend API has filter by beneficiaryId, not email.
        // For simplicity, we'll assume a way to get beneficiaryId from email or omit this filter for now.
        // For this example, we will just fetch all for "ALL" and filter locally if beneficiaryEmail is provided.
        // A more robust solution would involve a backend endpoint to search users by email and return ID.
        data = await getAdminCampaigns(filterStatus !== "ALL" ? { status: filterStatus } : undefined);
        if (beneficiaryEmail) {
            // This is a client-side filter and might not be efficient for large datasets.
            // A proper solution would require a backend endpoint supporting email filtering.
            data = (data as AdminCampaignListItem[]).filter(c => c.beneficiary.email.toLowerCase().includes(beneficiaryEmail.toLowerCase()));
        }
      }
      setCampaigns(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load campaigns.");
      toast.error("Error", { description: err.response?.data?.message || "Failed to load campaigns." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filterStatus]); // Refetch when filterStatus changes

  const handleApplyFilter = () => {
    fetchCampaigns(); // Manually trigger fetch when beneficiary email is applied
  }

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading campaigns...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Campaign Management</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
              <Select value={filterStatus} onValueChange={(value: CampaignStatus | "ALL" | "VERIFICATION_QUEUE") => setFilterStatus(value)}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="VERIFICATION_QUEUE">Verification Queue</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="beneficiary-email-filter" className="block text-sm font-medium text-gray-700">Beneficiary Email</label>
              <div className="flex space-x-2">
                <Input
                  id="beneficiary-email-filter"
                  type="email"
                  placeholder="Filter by beneficiary email"
                  value={beneficiaryEmail}
                  onChange={(e) => setBeneficiaryEmail(e.target.value)}
                />
                <Button onClick={handleApplyFilter}>Apply</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {campaigns.length === 0 ? (
        <div className="text-center text-gray-500">No campaigns found for the selected filters.</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Campaigns List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Beneficiary</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    {filterStatus === "VERIFICATION_QUEUE" && <TableHead>Days Waiting</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.title}</TableCell>
                      <TableCell>{campaign.beneficiary.name} ({campaign.beneficiary.email})</TableCell>
                      <TableCell>Rs.${"targetAmount" in campaign ? parseFloat(campaign.targetAmount).toFixed(2) : 'N/A'}</TableCell>
                      <TableCell>{"status" in campaign ? campaign.status : 'N/A'}</TableCell>
                      <TableCell>{"createdAt" in campaign ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      {filterStatus === "VERIFICATION_QUEUE" && (
                        <TableCell>{(campaign as AdminCampaignVerificationQueueItem).daysWaiting}</TableCell>
                      )}
                      <TableCell>
                        <Link to={`/admin/campaigns/${campaign.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCampaignList;
