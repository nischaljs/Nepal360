import { AlertCircle, ArrowRight, CheckCircle, Clock, Target, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Campaign } from "../../types/campaign.types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  // Calculate progress percentage
  const totalRaised = campaign.totalMoneyRaised || 0;
  const targetAmount = parseFloat(campaign.targetAmount);
  const progressPercentage = Math.min((totalRaised / targetAmount) * 100, 100);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; bg: string; icon: any; text: string }> = {
      DRAFT: { color: "text-gray-700", bg: "bg-gray-100", icon: Clock, text: "Draft" },
      PENDING_VERIFICATION: { color: "text-yellow-700", bg: "bg-yellow-100", icon: AlertCircle, text: "Pending" },
      ACTIVE: { color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle, text: "Active" },
      COMPLETED: { color: "text-blue-700", bg: "bg-blue-100", icon: CheckCircle, text: "Completed" },
      SUSPENDED: { color: "text-orange-700", bg: "bg-orange-100", icon: XCircle, text: "Suspended" },
      REJECTED: { color: "text-red-700", bg: "bg-red-100", icon: XCircle, text: "Rejected" },
    };

    const badge = badges[status] || badges.DRAFT;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <Card className="group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-emerald-300">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={campaign.coverImage} 
          alt={campaign.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge(campaign.status)}
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-xl line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {campaign.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-gray-600">
          {campaign.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-emerald-600">
              ${totalRaised.toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">
              of ${targetAmount.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1.5">{progressPercentage.toFixed(0)}% funded</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{campaign.donationCount || 0}</p>
              <p className="text-xs text-gray-600">Donors</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{campaign.milestones?.length || 0}</p>
              <p className="text-xs text-gray-600">Milestones</p>
            </div>
          </div>
        </div>

        {/* Beneficiary Info */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600">Campaign by</p>
          <p className="text-sm font-semibold text-gray-900">{campaign.beneficiary?.name || 'Anonymous'}</p>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100">
        <Link to={`/campaigns/${campaign.id}`} className="w-full">
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white group-hover:shadow-md transition-all"
          >
            View Campaign
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;