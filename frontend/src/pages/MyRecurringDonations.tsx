import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  getMyRecurringDonations,
  pauseRecurringDonation,
  resumeRecurringDonation,
  cancelRecurringDonation,
  type RecurringDonation,
} from "../services/recurringDonation.service";
import { RefreshCw, Pause, Play, XCircle, Calendar, CircleDollarSign } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Active" },
  PAUSED: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Paused" },
  CANCELLED: { color: "bg-red-100 text-red-700 border-red-200", label: "Cancelled" },
};

const MyRecurringDonations = () => {
  const [donations, setDonations] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDonations = async () => {
    try {
      const data = await getMyRecurringDonations();
      setDonations(data);
    } catch {
      toast.error("Failed to load your recurring donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleAction = async (id: string, action: "pause" | "resume" | "cancel") => {
    setActionLoading(id);
    try {
      if (action === "pause") await pauseRecurringDonation(id);
      else if (action === "resume") await resumeRecurringDonation(id);
      else await cancelRecurringDonation(id);

      toast.success(`Recurring donation ${action}d successfully.`);
      fetchDonations();
    } catch (err: any) {
      toast.error("Action Failed", {
        description: err.response?.data?.message || `Failed to ${action} donation.`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your recurring donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Recurring Donations</h1>
        </div>

        {donations.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">You don't have any recurring donations yet.</p>
              <Link to="/campaigns">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Campaigns</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => {
              const config = statusConfig[donation.status] || statusConfig.ACTIVE;
              const isActionLoading = actionLoading === donation.id;

              return (
                <Card key={donation.id} className="border-gray-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {donation.campaign.title}
                          </h3>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CircleDollarSign className="w-4 h-4" />
                            <span>
                              रू {parseFloat(donation.amount).toLocaleString()}{" "}
                              / {donation.frequency === "MONTHLY" ? "month" : "week"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Next: {format(new Date(donation.nextDueDate), "PP")}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            Total paid: रू {parseFloat(donation.totalPaid).toLocaleString()}
                          </div>
                          <div className="text-gray-500">
                            Payments: {donation.paymentCount}
                          </div>
                        </div>

                        <Link
                          to={`/campaigns/${donation.campaign.id}`}
                          className="text-sm text-emerald-600 hover:underline mt-2 inline-block"
                        >
                          View Campaign
                        </Link>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        {donation.status === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionLoading}
                            onClick={() => handleAction(donation.id, "pause")}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {donation.status === "PAUSED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionLoading}
                            onClick={() => handleAction(donation.id, "resume")}
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        {donation.status !== "CANCELLED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionLoading}
                            onClick={() => {
                              if (window.confirm("Are you sure you want to cancel this recurring donation?")) {
                                handleAction(donation.id, "cancel");
                              }
                            }}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecurringDonations;
