
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import type{ AddMilestoneData } from "../../types/campaign.types";

interface MilestoneFormProps {
  onSubmit: (data: AddMilestoneData) => Promise<void>;
  isLoading: boolean;
}

const MilestoneForm = ({ onSubmit, isLoading }: MilestoneFormProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error("Validation Error", { description: "Title and Amount are required." });
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Validation Error", { description: "Amount must be a positive number." });
      return;
    }

    await onSubmit({ title, amount: parsedAmount });
    setTitle("");
    setAmount("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Milestone</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="milestoneTitle">Title</Label>
              <Input
                id="milestoneTitle"
                placeholder="e.g., Reach 25% of target"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="milestoneAmount">Amount ($)</Label>
              <Input
                id="milestoneAmount"
                type="number"
                placeholder="e.g., 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Milestone"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MilestoneForm;
