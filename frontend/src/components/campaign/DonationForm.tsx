
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuthStore } from "../../store/auth.store";
import { initiateKhaltiPayment } from "../../services/donation.service";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface DonationFormProps {
  campaignId: string;
}

const DonationForm = ({ campaignId }: DonationFormProps) => {
  const { isAuthenticated } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to donate.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsLoading(true);
    try {
      const returnUrl = `${window.location.origin}/campaigns/${campaignId}?payment_success=true`;
      const data = await initiateKhaltiPayment({
        campaignId,
        amount: parseFloat(amount),
        currency: "NPR",
        returnUrl,
        visibility,
      });
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      toast.error("Donation Failed", {
        description: err.response?.data?.message || "Failed to initiate donation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Make a Donation</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="amount">Amount (NPR)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 500"
          />
        </div>
        <RadioGroup defaultValue="PUBLIC" onValueChange={setVisibility}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="PUBLIC" id="r1" />
            <Label htmlFor="r1">Public</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ANONYMOUS" id="r2" />
            <Label htmlFor="r2">Anonymous</Label>
          </div>
        </RadioGroup>
        <Button onClick={handleDonate} disabled={isLoading}>
          {isLoading ? "Processing..." : "Donate with Khalti"}
        </Button>
      </div>
    </div>
  );
};

export default DonationForm;
