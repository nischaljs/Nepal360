import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Campaign } from "../types/campaign.types";
import { getAllCampaigns } from "../services/campaign.service";
import CampaignCard from "../components/campaign/CampaignCard";
import { toast } from "sonner";
import { Heart, Shield, TrendingUp, Users, ArrowRight, Search } from "lucide-react";
import { Button } from "../components/ui/button";

const Home = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getAllCampaigns();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch campaigns.");
        toast.error("Failed to fetch campaigns", {
          description: err.response?.data?.message || "An unexpected error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-3xl mx-auto">
              <div className="h-12 bg-gray-200 rounded-lg mb-6 skeleton"></div>
              <div className="h-6 bg-gray-200 rounded-lg mb-4 skeleton"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-3/4 skeleton"></div>
            </div>
          </div>
        </div>
        
        {/* Campaign Cards Skeleton */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 skeleton"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded skeleton"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 skeleton"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Campaigns</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Make a Difference with
              <span className="text-emerald-600"> Nepal360</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join our trusted crowdfunding platform where transparency meets impact. 
              Support verified campaigns and help communities thrive across Nepal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/campaigns">
                <Button 
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
                >
                  Explore Campaigns
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/campaigns/create">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg"
                >
                  Start a Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-emerald-50 border-b border-emerald-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Campaigns</h3>
              <p className="text-gray-600">
                Every campaign is thoroughly verified to ensure authenticity and trust
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Tracking</h3>
              <p className="text-gray-600">
                Track every donation and milestone with complete transparency
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Join thousands of donors making real impact in communities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured Campaigns</h2>
              <p className="text-lg text-gray-600">
                Support these verified campaigns and make an impact today
              </p>
            </div>
            <Link to="/campaigns" className="mt-4 md:mt-0">
              <Button 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View All Campaigns
                <Search className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Campaigns Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Be the first to create a campaign and start making a difference in your community!
              </p>
              <Link to="/campaigns/create">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Create First Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.slice(0, 6).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}

          {campaigns.length > 6 && (
            <div className="text-center mt-12">
              <Link to="/campaigns">
                <Button 
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  See All {campaigns.length} Campaigns
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-emerald-600 py-16 lg:py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Whether you're looking to support a cause or start your own campaign, 
            Nepal360 makes it easy and transparent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-6 text-lg"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-emerald-700 px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;