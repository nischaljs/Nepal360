import { useEffect, useState } from "react";
import type { CreateCampaignData, UpdateCampaignData, Campaign, CampaignStatus } from "../../types/campaign.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea"; 
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Upload, FileText, Image as ImageIcon, DollarSign, AlertCircle } from "lucide-react";

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
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialData?.coverImage || null
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setTargetAmount(parseFloat(initialData.targetAmount).toString());
      setStatus(initialData.status);
      setCoverImagePreview(initialData.coverImage);
    }
  }, [initialData]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !targetAmount) {
      toast.error("Missing Information", { 
        description: "Please fill in all required fields." 
      });
      return;
    }

    const parsedTargetAmount = parseFloat(targetAmount);
    if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      toast.error("Invalid Amount", { 
        description: "Target amount must be greater than zero." 
      });
      return;
    }

    if (isEditMode) {
      const updateData: UpdateCampaignData = { 
        title, 
        description, 
        targetAmount: parsedTargetAmount, 
        status 
      };
      await onSubmit(updateData);
    } else {
      if (!coverImage) {
        toast.error("Cover Image Required", { 
          description: "Please upload a cover image for your campaign." 
        });
        return;
      }
      const createData: CreateCampaignData = { 
        title, 
        description, 
        targetAmount: parsedTargetAmount, 
        coverImage, 
        proofs 
      };
      await onSubmit(createData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
          Campaign Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Help Build a School in Rural Nepal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          required
          className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
        />
        <p className="text-xs text-gray-600">
          Choose a clear, descriptive title that explains your campaign goal
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
          Campaign Story <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Share your story... Why is this campaign important? How will the funds be used? What impact will it have?"
          value={description}
          onChange={(e: any) => setDescription(e.target.value)}
          disabled={isLoading}
          required
          rows={8}
          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
        />
        <p className="text-xs text-gray-600">
          {description.length} characters • Be detailed and honest about your needs
        </p>
      </div>

      {/* Target Amount */}
      <div className="space-y-2">
        <Label htmlFor="targetAmount" className="text-sm font-semibold text-gray-900">
          Funding Goal <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="targetAmount"
            type="number"
            placeholder="10000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            disabled={isLoading}
            required
            min="0.01"
            step="0.01"
            className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <p className="text-xs text-gray-600">
          Set a realistic goal that covers your needs
        </p>
      </div>

      {/* Cover Image */}
      {!isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="coverImage" className="text-sm font-semibold text-gray-900">
            Cover Image <span className="text-red-500">*</span>
          </Label>
          
          {coverImagePreview ? (
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <img 
                src={coverImagePreview} 
                alt="Cover preview" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <label htmlFor="coverImage" className="cursor-pointer">
                  <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Change Image</span>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <label 
              htmlFor="coverImage"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center py-6">
                <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload cover image
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            </label>
          )}
          
          <Input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            disabled={isLoading}
            required={!isEditMode}
            className="hidden"
          />
          <p className="text-xs text-gray-600">
            Upload a high-quality image that represents your campaign
          </p>
        </div>
      )}

      {/* Proof Files */}
      {!isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="proofs" className="text-sm font-semibold text-gray-900">
            Supporting Documents <span className="text-gray-500">(Optional)</span>
          </Label>
          
          <label 
            htmlFor="proofs"
            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center">
              <FileText className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Upload supporting documents
              </p>
              <p className="text-xs text-gray-500">
                Medical bills, receipts, certificates, etc.
              </p>
              {proofs.length > 0 && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  {proofs.length} file{proofs.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </label>
          
          <Input
            id="proofs"
            type="file"
            accept="image/*,video/*,application/pdf"
            multiple
            onChange={(e) => setProofs(Array.from(e.target.files || []))}
            disabled={isLoading}
            className="hidden"
          />
          <p className="text-xs text-gray-600">
            Upload proof documents to increase trust and credibility
          </p>
        </div>
      )}

      {/* Status Selection (Edit Mode) */}
      {isEditMode && (initialData?.status === "DRAFT" || initialData?.status === "PENDING_VERIFICATION") && (
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-semibold text-gray-900">
            Campaign Status
          </Label>
          <Select 
            value={status} 
            onValueChange={(value: CampaignStatus) => setStatus(value)} 
            disabled={isLoading}
          >
            <SelectTrigger id="status" className="h-11 border-gray-300">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">Submit for Verification</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              <strong>Draft:</strong> Keep working on your campaign. <br />
              <strong>Pending Verification:</strong> Submit for admin review.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isEditMode ? "Updating Campaign..." : "Creating Campaign..."}
            </span>
          ) : (
            isEditMode ? "Update Campaign" : "Create Campaign"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CampaignForm;