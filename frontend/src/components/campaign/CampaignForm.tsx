
import { useEffect, useState } from "react";
import type{ CreateCampaignData, UpdateCampaignData, Campaign, CampaignStatus } from "../../types/campaign.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea"; 
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"; 

interface CampaignFormProps {
  initialData?: Campaign;
  onSubmit: (data: CreateCampaignData | UpdateCampaignData) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
}

const CampaignForm = ({ initialData, onSubmit, isLoading, isEditMode = false }: CampaignFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount ? parseFloat(initialData.targetAmount).toString() : "");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [proofs, setProofs] = useState<File[]>([]);
  const [status, setStatus] = useState<CampaignStatus>(initialData?.status || "DRAFT");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setTargetAmount(parseFloat(initialData.targetAmount).toString());
      setStatus(initialData.status);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !targetAmount) {
      toast.error("Validation Error", { description: "Title, Description, and Target Amount are required." });
      return;
    }
    const parsedTargetAmount = parseFloat(targetAmount);
    if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      toast.error("Validation Error", { description: "Target Amount must be a positive number." });
      return;
    }

    if (isEditMode) {
      const updateData: UpdateCampaignData = { title, description, targetAmount: parsedTargetAmount, status };
      await onSubmit(updateData);
    } else {
      if (!coverImage) {
        toast.error("Validation Error", { description: "Cover Image is required for new campaigns." });
        return;
      }
      const createData: CreateCampaignData = { title, description, targetAmount: parsedTargetAmount, coverImage, proofs };
      await onSubmit(createData);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Emergency Medical Fund"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your campaign..."
                value={description}
                onChange={(e:any) => setDescription(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="targetAmount">Target Amount ($)</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="e.g., 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                disabled={isLoading}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            {!isEditMode && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="coverImage">Cover Image</Label>
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                  disabled={isLoading}
                  required={!isEditMode}
                />
              </div>
            )}
            {!isEditMode && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="proofs">Proof Files (Optional)</Label>
                <Input
                  id="proofs"
                  type="file"
                  accept="image/*,video/*,application/pdf"
                  multiple
                  onChange={(e) => setProofs(Array.from(e.target.files || []))}
                  disabled={isLoading}
                />
              </div>
            )}
            {isEditMode && (initialData?.status === "DRAFT" || initialData?.status === "PENDING_VERIFICATION") && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: CampaignStatus) => setStatus(value)} disabled={isLoading}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="PENDING_VERIFICATION">PENDING_VERIFICATION</SelectItem>
                    {/* Only allow setting to LIVE if it's currently PENDING_VERIFICATION and admin approves, not directly by user */}
                    {/* <SelectItem value="LIVE">LIVE</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Campaign" : "Create Campaign")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
