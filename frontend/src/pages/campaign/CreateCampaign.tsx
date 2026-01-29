import { ArrowLeft, CheckCircle, Lightbulb, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CampaignForm from "../../components/campaign/CampaignForm";
import { Card, CardContent } from "../../components/ui/card";
import GlobalLoader from "../../components/ui/GlobalLoader";
import { useKycCheck } from "../../hooks/useKycCheck";
import { createCampaign } from "../../services/campaign.service";
import type { CreateCampaignData, UpdateCampaignData } from "../../types/campaign.types";

const CreateCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isLoading: isKycLoading, hasApprovedKyc, user } = useKycCheck();

  useEffect(() => {
    if (!isKycLoading && user && !hasApprovedKyc) {
      toast.error("KYC Verification Required", {
        description: "You must complete KYC verification before creating a campaign.",
      });
      navigate('/kyc/submit');
    }
  }, [user, hasApprovedKyc, isKycLoading, navigate]);

  // Show global loader while checking KYC
  if (isKycLoading) {
    return <GlobalLoader fullScreen message="Verifying KYC status..." />;
  }

  // Redirect if no approved KYC
  if (!user || !hasApprovedKyc) {
    return null;
  }

  const handleSubmit = async (data: CreateCampaignData | UpdateCampaignData) => {
    setIsLoading(true);
    try {
      if ('coverImage' in data) {
        const newCampaign = await createCampaign(data);
        toast.success("Campaign Created Successfully!", {
          description: `"${newCampaign.title}" is now pending verification.`,
        });
        navigate(`/campaigns/${newCampaign.id}`);
      } else {
        toast.error("Invalid Data", {
          description: "Please provide all required campaign information.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to Create Campaign", {
        description: error.response?.data?.message || "Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <Link 
          to="/campaigns/me" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Campaigns</span>
        </Link>

        {/* Page Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Your Campaign</h1>
          <p className="text-lg text-gray-600">
            Share your story and start making a difference. Fill out the form below to launch your campaign.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <CampaignForm onSubmit={handleSubmit} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Tips & Guidelines Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Campaign Tips</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Be Specific</p>
                      <p className="text-sm text-gray-700">Clearly explain what the funds will be used for and why it matters.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Use Quality Images</p>
                      <p className="text-sm text-gray-700">A compelling cover image helps build trust and attracts donors.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Set Realistic Goals</p>
                      <p className="text-sm text-gray-700">Choose a target amount that's achievable and well-justified.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Add Milestones</p>
                      <p className="text-sm text-gray-700">Break down your goal into milestones to track progress.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Provide Proof</p>
                      <p className="text-sm text-gray-700">Upload supporting documents to increase credibility and trust.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Process Card */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">What Happens Next?</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Submit for Review</p>
                      <p className="text-sm text-gray-600">Your campaign will be reviewed by our team.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Verification</p>
                      <p className="text-sm text-gray-600">We verify all information and documents provided.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Go Live</p>
                      <p className="text-sm text-gray-600">Once approved, your campaign goes live and starts accepting donations.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    ⏱️ Verification typically takes 1-3 business days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is here to assist you with any questions about creating your campaign.
                </p>
                <Link 
                  to="/help" 
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Visit Help Center →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;