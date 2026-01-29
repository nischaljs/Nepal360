
import { Eye, EyeOff, Heart, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { initiateKhaltiPayment } from "../../services/donation.service";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface DonationFormProps {
  campaignId: string;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

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

  const handlePresetAmount = (preset: number) => {
    setAmount(preset.toString());
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Heart className="w-6 h-6 text-emerald-600" />
          Make a Donation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Amounts */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900">
            Select Amount
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetAmount(preset)}
                className={`h-10 rounded-lg font-medium transition-all duration-200 ${
                  amount === preset.toString()
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                रू {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-3">
          <Label htmlFor="amount" className="text-sm font-semibold text-gray-900">
            Or Enter Custom Amount
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">रू</span>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="pl-10 h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-lg"
            />
          </div>
        </div>

        {/* Visibility Options */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900">
            Donation Visibility
          </Label>
          <RadioGroup
            defaultValue="PUBLIC"
            value={visibility}
            onValueChange={setVisibility}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition-colors flex-1">
              <RadioGroupItem value="PUBLIC" id="r1" />
              <Label htmlFor="r1" className="flex items-center gap-2 cursor-pointer flex-1">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">Public</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition-colors flex-1">
              <RadioGroupItem value="ANONYMOUS" id="r2" />
              <Label htmlFor="r2" className="flex items-center gap-2 cursor-pointer flex-1">
                <EyeOff className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Anonymous</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Donate Button */}
        <Button
          onClick={handleDonate}
          disabled={isLoading || !amount}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-lg font-semibold"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Donate with Khalti
            </span>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by Khalti
        </p>
      </CardContent>
    </Card>
  );
};

export default DonationForm;
