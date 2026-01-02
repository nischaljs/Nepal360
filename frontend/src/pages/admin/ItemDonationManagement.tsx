import { useState, useEffect } from "react";
import {
  getItemDonations,
  confirmItemDonation,
  rejectItemDonation,
} from "@/services/admin.itemDonation.service";
import type { ItemDonation, ItemDonationStatus } from "@/types/itemDonation.types";
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

const ItemDonationManagement = () => {
  const [donations, setDonations] = useState<ItemDonation[]>([]);
  const [status, setStatus] = useState<ItemDonationStatus>("PLEDGED");
  const [loading, setLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<ItemDonation | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchDonations(status);
  }, [status]);

  const fetchDonations = async (fetchStatus: ItemDonationStatus) => {
    setLoading(true);
    try {
      const data = await getItemDonations(fetchStatus);
      setDonations(data);
    } catch (error) {
      toast.error("Failed to fetch item donations");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (donationId: string) => {
    try {
      await confirmItemDonation(donationId);
      toast.success("Item donation confirmed");
      fetchDonations(status);
      setSelectedDonation(null);
    } catch (error) {
      toast.error("Failed to confirm item donation");
    }
  };

  const handleReject = async (donationId: string) => {
    if (!rejectionReason) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await rejectItemDonation(donationId, rejectionReason);
      toast.success("Item donation rejected");
      fetchDonations(status);
      setSelectedDonation(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject item donation");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Item Donation Management</h1>
      <Tabs value={status} onValueChange={(value) => setStatus(value as ItemDonationStatus)}>
        <TabsList>
          <TabsTrigger value="PLEDGED">Pledged</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={status}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Pledged At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.itemName}</TableCell>
                    <TableCell>{donation.quantity}</TableCell>
                    <TableCell>{donation.donor?.name}</TableCell>
                    <TableCell>{donation.campaign?.title}</TableCell>
                    <TableCell>{new Date(donation.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedDonation(donation)}>
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
      {selectedDonation && (
        <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Item Donation Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p><strong>Item:</strong> {selectedDonation.itemName} ({selectedDonation.quantity})</p>
              <p><strong>Donor:</strong> {selectedDonation.donor?.name}</p>
              <p><strong>Campaign:</strong> {selectedDonation.campaign?.title}</p>
              {selectedDonation.deliveryNote && <p><strong>Note:</strong> {selectedDonation.deliveryNote}</p>}
              {selectedDonation.deliveryPhoto && (
                <div>
                  <p><strong>Photo:</strong></p>
                  <img src={selectedDonation.deliveryPhoto} alt="Delivery" className="max-w-full h-auto" />
                </div>
              )}
              {status === "DELIVERED" || status === "PLEDGED" && (
                <div className="flex flex-col space-y-4">
                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                    <Input id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => handleReject(selectedDonation.id)}>Reject</Button>
                    <Button onClick={() => handleConfirm(selectedDonation.id)}>Confirm</Button>
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

export default ItemDonationManagement;

