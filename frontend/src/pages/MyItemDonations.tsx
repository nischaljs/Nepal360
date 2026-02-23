import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { getMyItemDonations, updateItemDonation } from "../services/itemDonation.service";
import type { ItemDonation } from "../types/itemDonation.types";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  PLEDGED: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  DELIVERED: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Truck },
  CONFIRMED: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  REJECTED: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

const MyItemDonations = () => {
  const [donations, setDonations] = useState<ItemDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDonations = async () => {
    try {
      const data = await getMyItemDonations();
      setDonations(data);
    } catch {
      toast.error("Failed to load your item donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleMarkDelivered = async () => {
    if (!selectedId) return;
    setIsUpdating(true);
    try {
      await updateItemDonation(selectedId, {
        status: "DELIVERED",
        deliveryNote: deliveryNote || undefined,
      });
      toast.success("Marked as Delivered", { description: "The campaign admin will confirm receipt." });
      setDeliverDialogOpen(false);
      setSelectedId(null);
      setDeliveryNote("");
      fetchDonations();
    } catch (err: any) {
      toast.error("Update Failed", {
        description: err.response?.data?.message || "Failed to update donation.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your item donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Item Pledges</h1>
        </div>

        {donations.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">You haven't pledged any items yet.</p>
              <Link to="/campaigns">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Campaigns</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => {
              const config = statusConfig[donation.status] || statusConfig.PLEDGED;
              const StatusIcon = config.icon;

              return (
                <Card key={donation.id} className="border-gray-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{donation.itemName}</h3>
                          <Badge variant="outline" className={config.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {donation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Quantity: {donation.quantity}</p>
                        {donation.campaign && (
                          <Link
                            to={`/campaigns/${donation.campaign.id}`}
                            className="text-sm text-emerald-600 hover:underline"
                          >
                            {donation.campaign.title}
                          </Link>
                        )}
                        {donation.deliveryNote && (
                          <p className="text-sm text-gray-500 mt-1">Note: {donation.deliveryNote}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Pledged on {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {donation.status === "PLEDGED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 shrink-0"
                          onClick={() => {
                            setSelectedId(donation.id);
                            setDeliverDialogOpen(true);
                          }}
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={deliverDialogOpen} onOpenChange={setDeliverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Delivered</DialogTitle>
            <DialogDescription>
              Confirm that you have delivered this item. The campaign admin will verify the delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryNote">Delivery Note (optional)</Label>
              <Textarea
                id="deliveryNote"
                placeholder="e.g., Delivered to office at 2pm"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeliverDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkDelivered}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "Updating..." : "Confirm Delivery"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyItemDonations;
