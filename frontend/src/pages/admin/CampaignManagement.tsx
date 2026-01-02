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
import {
  getAdminCampaigns,
  getAdminVerificationQueue
} from "@/services/admin.campaign.service";
import type { AdminCampaignListItem, AdminCampaignVerificationQueueItem } from "@/types/admin.campaign.types";
import type { CampaignStatus } from "@/types/campaign.types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";


const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<AdminCampaignListItem[]>([]);
  const [queue, setQueue] = useState<AdminCampaignVerificationQueueItem[]>([]);
  const [status, setStatus] = useState<CampaignStatus | "QUEUE">("QUEUE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "QUEUE") {
      fetchVerificationQueue();
    } else {
      fetchCampaigns(status);
    }
  }, [status]);

  const fetchCampaigns = async (fetchStatus: CampaignStatus) => {
    setLoading(true);
    try {
      const data = await getAdminCampaigns({ status: fetchStatus });
      setCampaigns(data);
    } catch (error) {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationQueue = async () => {
    setLoading(true);
    try {
      const data = await getAdminVerificationQueue();
      setQueue(data);
    } catch (error) {
      toast.error("Failed to fetch verification queue");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data: (AdminCampaignListItem | AdminCampaignVerificationQueueItem)[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Beneficiary</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.title}</TableCell>
            <TableCell>{item.beneficiary.name}</TableCell>
            <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <Link to={`/admin/campaigns/${item.id}`}>
                <Button>View Details</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Campaign Management</h1>
      <Tabs value={status} onValueChange={(value) => setStatus(value as CampaignStatus | "QUEUE")}>
        <TabsList>
          <TabsTrigger value="QUEUE">Verification Queue</TabsTrigger>
          <TabsTrigger value="PENDING_VERIFICATION">Pending</TabsTrigger>
          <TabsTrigger value="LIVE">Live</TabsTrigger>
          <TabsTrigger value="SUSPENDED">Suspended</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={status}>
          {loading ? (
            <p>Loading...</p>
          ) : status === "QUEUE" ? (
            renderTable(queue)
          ) : (
            renderTable(campaigns)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignManagement;

