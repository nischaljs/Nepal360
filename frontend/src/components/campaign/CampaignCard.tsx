import { AlertCircle, ArrowRight, CheckCircle, Clock, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Campaign } from "../../types/campaign.types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import BookmarkButton from "./BookmarkButton";

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const totalRaised = campaign.totalMoneyRaised || 0;
  const targetAmount = parseFloat(campaign.targetAmount);
  const progressPercentage = Math.min((totalRaised / targetAmount) * 100, 100);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; bg: string; icon: any; text: string }> = {
      DRAFT: { color: "text-gray-600", bg: "bg-gray-100", icon: Clock, text: "Draft" },
      PENDING_VERIFICATION: { color: "text-amber-700", bg: "bg-amber-50", icon: AlertCircle, text: "Pending" },
      LIVE: { color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle, text: "Active" },
      COMPLETED: { color: "text-blue-700", bg: "bg-blue-50", icon: CheckCircle, text: "Completed" },
      SUSPENDED: { color: "text-orange-700", bg: "bg-orange-50", icon: XCircle, text: "Suspended" },
      REJECTED: { color: "text-red-700", bg: "bg-red-50", icon: XCircle, text: "Rejected" },
    };

    const badge = badges[status] || badges.DRAFT;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${badge.bg} ${badge.color} border border-current opacity-90`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <Card className="group flex flex-col overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white dark:bg-gray-800 max-w-sm">
      {/* Image Section - Reduced Height */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <BookmarkButton campaignId={campaign.id} size="icon" variant="ghost" />
          {getStatusBadge(campaign.status)}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <CardHeader className="p-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider">Verified</span>
            <span className="text-gray-400 text-[11px] flex items-center gap-1">
              <Users size={10} /> {campaign.beneficiary?.name || 'Anonymous'}
            </span>
          </div>
          <CardTitle className="text-lg font-bold line-clamp-1 text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
            {campaign.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-gray-500 dark:text-gray-400 text-xs leading-snug">
            {campaign.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 mt-3">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                   रू {totalRaised.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                  of रू {targetAmount.toLocaleString()}
                </span>
              </div>
              <span className="text-emerald-700 font-bold text-xs">{progressPercentage.toFixed(0)}%</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-0 mt-4">
          <Link to={`/campaigns/${campaign.id}`} className="w-full">
            <Button 
              className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all gap-2"
            >
              View Campaign
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};

export default CampaignCard;