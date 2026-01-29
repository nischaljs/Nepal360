import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  User,
  Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import GlobalLoader from '../../components/ui/GlobalLoader';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { cn } from '../../lib/utils';
import { getKycStatus, resubmitKyc, submitKyc } from '../../services/kyc.service';
import type { KYCStatus, SubmitKYCData } from '../../types/kyc.types';

const kycSchema = z.object({
  documentType: z.string().min(1, 'Document Type is required'),
  documentNumber: z.string().min(1, 'Document Number is required'),
  bankAccountName: z.string().min(1, 'Bank Account Name is required'),
  bankAccountNo: z.string().min(1, 'Bank Account Number is required'),
  walletProvider: z.string().optional(),
});

type KYCFormInputs = z.infer<typeof kycSchema>;

const STEPS = [
  { id: 'identity', title: 'Identity', icon: User, description: 'Document details' },
  { id: 'documents', title: 'Documents', icon: FileText, description: 'Upload photos' },
  { id: 'bank', title: 'Bank', icon: Building, description: 'Payment info' },
];

const KYCForm = () => {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, trigger, watch } = useForm<KYCFormInputs>({
    resolver: zodResolver(kycSchema),
    mode: 'onChange',
  });

  const formData = watch();

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

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof KYCFormInputs)[] = [];
    
    switch (step) {
      case 0:
        fieldsToValidate = ['documentType', 'documentNumber'];
        break;
      case 1:
        if (!documentImage) {
          toast.error("Document Image is required");
          return false;
        }
        if (!profilePhoto) {
          toast.error("Profile Photo is required");
          return false;
        }
        return true;
      case 2:
        fieldsToValidate = ['bankAccountName', 'bankAccountNo', 'walletProvider'];
        break;
    }
    
    return await trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: KYCFormInputs) => {
    if (!documentImage) {
      toast.error("Document Image is required");
      return;
    }
    if (!profilePhoto) {
      toast.error("Profile Photo is required");
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
      toast.success("KYC Submitted Successfully!", { description: response.message });
      reset();
      setDocumentImage(null);
      setProfilePhoto(null);
      fetchKycStatus();
      setCurrentStep(0);
    } catch (error: any) {
      toast.error("Submission Failed", { description: error.response?.data?.message || "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return <GlobalLoader fullScreen message="Loading KYC status..." />;
  }



  // Approved State
  if (kycStatus === 'APPROVED') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <div className="max-w-2xl mx-auto">
            <Card className="border-emerald-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">KYC Verified!</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your identity has been verified. You can now create campaigns and start accepting donations from generous supporters.
                </p>
                <Button
                  onClick={() => navigate('/campaigns/create')}
                  className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 text-lg"
                >
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Pending State
  if (kycStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <div className="max-w-2xl mx-auto">
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Under Review</h1>
                <p className="text-gray-600 mb-4">
                  Your KYC submission is currently being reviewed by our team.
                </p>
                <p className="text-sm text-gray-500">
                  This typically takes 1-3 business days. We'll send you a notification once the review is complete.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        {/* Page Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">KYC Verification</h1>
          <p className="text-lg text-gray-600">
            Complete your identity verification to start accepting donations.
          </p>
        </div>

        {/* Status Banner */}
        {kycStatus === 'REJECTED' && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700">KYC Rejected</p>
                <p className="text-sm text-red-600">Reason: {rejectionReason || 'No reason provided'}. Please resubmit.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        isActive && "bg-emerald-600 text-white shadow-lg scale-110",
                        isCompleted && "bg-emerald-600 text-white",
                        !isActive && !isCompleted && "bg-gray-200 text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-emerald-600" : "text-gray-400"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-1 mx-4 rounded transition-colors duration-300",
                      index < currentStep ? "bg-emerald-500" : "bg-gray-200"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Identity */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Identity Information</h2>
                        <p className="text-sm text-gray-500">Enter your document details</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="documentType" className="text-sm font-semibold text-gray-900">
                          Document Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            setValue('documentType', value);
                            trigger('documentType');
                          }}
                          defaultValue={formData.documentType || ""}
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                            <SelectValue placeholder="Select Document Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="National ID">National ID</SelectItem>
                            <SelectItem value="Driving License">Driving License</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.documentType && <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="documentNumber" className="text-sm font-semibold text-gray-900">
                          Document Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="documentNumber"
                          {...register('documentNumber')}
                          placeholder="Enter your document number"
                          className="h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {errors.documentNumber && <p className="text-red-500 text-sm mt-1">{errors.documentNumber.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Documents */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Document Upload</h2>
                        <p className="text-sm text-gray-500">Upload clear photos of your documents</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Document Image */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-900">
                          Document Photo <span className="text-red-500">*</span>
                        </Label>
                        <div className={cn(
                          "border-2 border-dashed rounded-xl p-6 transition-all duration-300",
                          documentImage ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
                        )}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setDocumentImage(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                            id="documentImage"
                          />
                          <label htmlFor="documentImage" className="cursor-pointer flex flex-col items-center">
                            {documentImage ? (
                              <div className="flex items-center gap-4">
                                <img
                                  src={URL.createObjectURL(documentImage)}
                                  alt="Document"
                                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{documentImage.name}</p>
                                  <p className="text-sm text-emerald-600">Click to change</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-700">Upload document image</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Profile Photo */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-900">
                          Profile Photo (Selfie) <span className="text-red-500">*</span>
                        </Label>
                        <div className={cn(
                          "border-2 border-dashed rounded-xl p-6 transition-all duration-300",
                          profilePhoto ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
                        )}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePhoto(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                            id="profilePhoto"
                          />
                          <label htmlFor="profilePhoto" className="cursor-pointer flex flex-col items-center">
                            {profilePhoto ? (
                              <div className="flex items-center gap-4">
                                <img
                                  src={URL.createObjectURL(profilePhoto)}
                                  alt="Profile"
                                  className="w-24 h-24 object-cover rounded-full shadow-md"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{profilePhoto.name}</p>
                                  <p className="text-sm text-emerald-600">Click to change</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <User className="w-12 h-12 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-700">Upload selfie holding document</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Bank Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Bank Details</h2>
                        <p className="text-sm text-gray-500">Where donations will be sent</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountName" className="text-sm font-semibold text-gray-900">
                          Account Holder Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bankAccountName"
                          {...register('bankAccountName')}
                          placeholder="Enter account holder name"
                          className="h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {errors.bankAccountName && <p className="text-red-500 text-sm mt-1">{errors.bankAccountName.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNo" className="text-sm font-semibold text-gray-900">
                          Account Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bankAccountNo"
                          {...register('bankAccountNo')}
                          placeholder="Enter account number"
                          className="h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {errors.bankAccountNo && <p className="text-red-500 text-sm mt-1">{errors.bankAccountNo.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="walletProvider" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-gray-400" />
                          Mobile Wallet (Optional)
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            setValue('walletProvider', value);
                            trigger('walletProvider');
                          }}
                          defaultValue={formData.walletProvider || ""}
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                            <SelectValue placeholder="Select wallet provider (if any)" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="esewa">eSewa</SelectItem>
                            <SelectItem value="khalti">Khalti</SelectItem>
                            <SelectItem value="imepay">IME Pay</SelectItem>
                            <SelectItem value="connectips">ConnectIPS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || isSubmitting}
                    className={cn(
                      "h-12 px-6 border-gray-300 hover:bg-gray-50",
                      currentStep === 0 && "invisible"
                    )}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>

                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Next
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <>
                          Submit KYC
                          <CheckCircle className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;
