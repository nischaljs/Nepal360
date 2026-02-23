import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createRecurringDonation } from "../../services/recurringDonation.service";
import { useAuthStore } from "../../store/auth.store";

interface RecurringDonationFormProps {
  campaignId: string;
}

const RecurringDonationForm = ({ campaignId }: RecurringDonationFormProps) => {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"MONTHLY" | "WEEKLY">("MONTHLY");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to set up recurring donations.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount < 10) {
      toast.error("Please enter a valid amount (minimum NPR 10).");
      return;
    }

    setIsLoading(true);
    try {
      await createRecurringDonation({
        campaignId,
        amount: parsedAmount,
        frequency,
      });
      toast.success("Recurring Donation Created", {
        description: `You've pledged NPR ${parsedAmount.toLocaleString()} ${frequency.toLowerCase()}.`,
      });
      setOpen(false);
      setAmount("");
      setFrequency("MONTHLY");
    } catch (err: any) {
      toast.error("Failed", {
        description: err.response?.data?.message || "Failed to create recurring donation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const frequencyLabel = frequency === "MONTHLY" ? "month" : "week";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-lg font-semibold"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Donate Monthly
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up Recurring Donation</DialogTitle>
          <DialogDescription>
            Support this campaign with a regular contribution.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="recurring-amount">Amount (NPR)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                रू
              </span>
              <Input
                id="recurring-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10 h-12"
                min={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as "MONTHLY" | "WEEKLY")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <p className="text-emerald-700 font-medium">
                You will donate रू {parseFloat(amount).toLocaleString()} every {frequencyLabel}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !amount || parseFloat(amount) < 10}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Creating..." : "Confirm Recurring Donation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringDonationForm;
