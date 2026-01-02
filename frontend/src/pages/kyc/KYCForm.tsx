import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getKycStatus, submitKyc, resubmitKyc } from '../../services/kyc.service';
import type { KYCStatus, SubmitKYCData } from '../../types/kyc.types';
import { Spinner } from '../../components/ui/spinner';

const kycSchema = z.object({
  documentType: z.string().min(1, 'Document Type is required'),
  documentNumber: z.string().min(1, 'Document Number is required'),
  bankAccountName: z.string().min(1, 'Bank Account Name is required'),
  bankAccountNo: z.string().min(1, 'Bank Account Number is required'),
  walletProvider: z.string().optional(),
});

type KYCFormInputs = z.infer<typeof kycSchema>;

const KYCForm = () => {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<KYCFormInputs>({
    resolver: zodResolver(kycSchema),
  });

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await getKycStatus();
      setKycStatus(response.status);
      setRejectionReason(response.rejectionReason || null);
      if (response.status === 'REJECTED') {
        toast.info("KYC Rejected", { description: `Reason: ${response.rejectionReason}. Please resubmit.` });
      }
    } catch (error: any) {
      toast.error("Failed to fetch KYC status", { description: error.response?.data?.message || "An error occurred." });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const onSubmit = async (data: KYCFormInputs) => {
    if (!documentImage) {
      toast.error("Validation Error", { description: "Document Image is required." });
      return;
    }
    if (!profilePhoto) {
      toast.error("Validation Error", { description: "Profile Photo is required." });
      return;
    }

    const kycData: SubmitKYCData = {
      ...data,
      documentImage,
      profilePhoto,
    };

    setIsSubmitting(true);
    try {
      let response;
      if (kycStatus === 'REJECTED') {
        response = await resubmitKyc(kycData);
      } else {
        response = await submitKyc(kycData);
      }
      toast.success("KYC Submission", { description: response.message });
      reset(); // Clear form
      setDocumentImage(null);
      setProfilePhoto(null);
      fetchKycStatus(); // Re-fetch status to update UI
    } catch (error: any) {
      toast.error("KYC Submission Failed", { description: error.response?.data?.message || "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            {kycStatus === 'APPROVED' && "Your KYC has been approved! You can now create campaigns."}
            {kycStatus === 'PENDING' && "Your KYC is pending review. We will notify you once it's processed."}
            {kycStatus === 'REJECTED' && `Your KYC was rejected. Reason: ${rejectionReason || 'No reason provided.'} Please resubmit.`}
            {kycStatus === 'NOT_SUBMITTED' && "Please submit your Know Your Customer (KYC) details to become a verified beneficiary."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED') && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select onValueChange={(value) => setValue('documentType', value)} defaultValue={""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="National ID">National ID</SelectItem>
                    <SelectItem value="Driving License">Driving License</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentType && <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>}
              </div>

              <div>
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  {...register('documentNumber')}
                  placeholder="e.g., 123456789"
                  disabled={isSubmitting}
                />
                {errors.documentNumber && <p className="text-red-500 text-sm mt-1">{errors.documentNumber.message}</p>}
              </div>

              <div>
                <Label htmlFor="documentImage">Document Image (e.g., Passport, ID Card photo)</Label>
                <Input
                  id="documentImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDocumentImage(e.target.files ? e.target.files[0] : null)}
                  disabled={isSubmitting}
                />
                {!documentImage && <p className="text-red-500 text-sm mt-1">Document Image is required.</p>}
              </div>

              <div>
                <Label htmlFor="profilePhoto">Profile Photo (Selfie holding document)</Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhoto(e.target.files ? e.target.files[0] : null)}
                  disabled={isSubmitting}
                />
                {!profilePhoto && <p className="text-red-500 text-sm mt-1">Profile Photo is required.</p>}
              </div>

              <div>
                <Label htmlFor="bankAccountName">Bank Account Name</Label>
                <Input
                  id="bankAccountName"
                  {...register('bankAccountName')}
                  placeholder="e.g., John Doe"
                  disabled={isSubmitting}
                />
                {errors.bankAccountName && <p className="text-red-500 text-sm mt-1">{errors.bankAccountName.message}</p>}
              </div>

              <div>
                <Label htmlFor="bankAccountNo">Bank Account Number</Label>
                <Input
                  id="bankAccountNo"
                  {...register('bankAccountNo')}
                  placeholder="e.g., 1234567890"
                  disabled={isSubmitting}
                />
                {errors.bankAccountNo && <p className="text-red-500 text-sm mt-1">{errors.bankAccountNo.message}</p>}
              </div>

              <div>
                <Label htmlFor="walletProvider">Mobile Wallet Provider (Optional)</Label>
                <Input
                  id="walletProvider"
                  {...register('walletProvider')}
                  placeholder="e.g., Esewa, Khalti"
                  disabled={isSubmitting}
                />
                {errors.walletProvider && <p className="text-red-500 text-sm mt-1">{errors.walletProvider.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {kycStatus === 'REJECTED' ? "Resubmit KYC" : "Submit KYC"}
              </Button>
            </form>
          )}
          {kycStatus === 'APPROVED' && (
            <div className="text-center text-green-600 font-semibold text-lg">
              <p>Your KYC is approved! You can now create campaigns.</p>
              <Button onClick={() => navigate('/campaigns/create')} className="mt-4">
                Create New Campaign
              </Button>
            </div>
          )}
          {kycStatus === 'PENDING' && (
            <div className="text-center text-blue-600 font-semibold text-lg">
              <p>Your KYC submission is currently pending review.</p>
              <p>We will notify you once it has been processed by an administrator.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCForm;
