import { ArrowRight, Heart, Medal, Shield, Sparkles, TrendingUp, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CampaignCard from "../components/campaign/CampaignCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { getAllCampaigns } from "../services/campaign.service";
import { getCurrentMonthLeaderboard, type LeaderboardEntry } from "../services/leaderboard.service";
import type { Campaign } from "../types/campaign.types";

const Home = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    document.title = "Nepal360 - Crowdfunding for Nepal";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsData, leaderboardData] = await Promise.all([
          getAllCampaigns(),
          getCurrentMonthLeaderboard().catch(() => ({ entries: [] }))
        ]);
        setCampaigns(campaignsData);
        setLeaderboard(leaderboardData.entries.slice(0, 5));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data.");
        toast.error("Error", { description: "Could not load content." });
      } finally {
        setIsLoading(false);
        setLeaderboardLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-20 animate-pulse">
          <div className="h-12 bg-gray-100 rounded-xl w-2/3 mx-auto mb-6" />
          <div className="h-6 bg-gray-100 rounded-lg w-1/2 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t('common.error')}</h2>
          <Button onClick={() => window.location.reload()} variant="outline">{t('common.tryAgain')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#ecfdf5_0%,#ffffff_100%)]" />
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-6">
            <Sparkles size={14} />
            {t('home.tagline')}
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            {t('home.title1')} <br />
            <span className="text-emerald-600">{t('home.title2')}</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/campaigns">
              <Button size="lg" className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-200 transition-all active:scale-95">
                {t('home.exploreCampaigns')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/campaigns/create">
              <Button size="lg" variant="outline" className="h-14 px-8 border-gray-200 text-gray-700 rounded-2xl font-bold text-base hover:bg-gray-50 active:scale-95">
                {t('home.startFundraising')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="flex items-center justify-center gap-4 py-4 md:py-0">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Shield size={24} /></div>
              <div className="text-left">
                <p className="font-bold text-gray-900">{t('home.verified')}</p>
                <p className="text-xs text-gray-500">{t('home.verifiedDesc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 py-4 md:py-0">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={24} /></div>
              <div className="text-left">
                <p className="font-bold text-gray-900">{t('home.transparent')}</p>
                <p className="text-xs text-gray-500">{t('home.transparentDesc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 py-4 md:py-0">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Users size={24} /></div>
              <div className="text-left">
                <p className="font-bold text-gray-900">{t('home.community')}</p>
                <p className="text-xs text-gray-500">{t('home.communityDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('home.featuredCampaigns')}</h2>
              <p className="text-gray-500 mt-1">{t('home.featuredDesc')}</p>
            </div>
            <Link to="/campaigns" className="hidden md:block">
              <Button variant="ghost" className="text-emerald-600 font-bold hover:bg-emerald-50">
                {t('common.viewAll')} <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold">{t('home.noCampaigns')}</h3>
              <p className="text-gray-500 mb-6">{t('home.noCampaignsDesc')}</p>
              <Link to="/campaigns/create">
                <Button className="bg-emerald-600">{t('home.createFirstCampaign')}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.slice(0, 6).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link to="/campaigns">
              <Button variant="outline" className="w-full h-12 rounded-xl">{t('home.viewAllCampaigns')}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('home.topDonors')}</h2>
              <p className="text-gray-500 mt-1">{t('home.topDonorsDesc')}</p>
            </div>
            <Link to="/leaderboard" className="hidden md:block">
              <Button variant="ghost" className="text-emerald-600 font-bold hover:bg-emerald-50">
                {t('home.viewFullRankings')} <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>

          {leaderboardLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-600">{t('home.noRankings')}</h3>
                <p className="text-gray-500">{t('home.noRankingsDesc')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {leaderboard.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`bg-white hover:shadow-lg transition-shadow cursor-pointer ${
                    index === 0 ? 'border-2 border-yellow-400' : ''
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {index === 0 ? (
                        <Trophy className="w-8 h-8 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="w-8 h-8 text-gray-400" />
                      ) : index === 2 ? (
                        <Medal className="w-8 h-8 text-amber-600" />
                      ) : (
                        <span className="w-8 h-8 flex items-center justify-center text-lg font-bold text-emerald-600">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 truncate">
                      {entry.isAnonymous ? 'Anonymous' : entry.user.name}
                    </p>
                    <p className="text-sm text-emerald-600 font-semibold">
                      NPR {Number(entry.totalAmount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.totalItems} {t('home.itemsDonated')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link to="/leaderboard">
              <Button variant="outline" className="w-full h-12 rounded-xl">{t('home.viewFullRankings')}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 mb-20">
        <div className="bg-emerald-600 rounded-[2.5rem] p-10 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-200">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500 rounded-full opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-emerald-700 rounded-full opacity-50" />

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
              {t('home.readyToImpact')}
            </h2>
            <p className="text-emerald-50 text-lg mb-10 max-w-xl mx-auto opacity-90">
              {t('home.readyToImpactDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="h-14 px-10 bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl font-bold transition-all active:scale-95">
                  {t('home.startNow')}
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="h-14 px-10 border-emerald-400 text-white hover:bg-emerald-700 rounded-2xl font-bold">
                  {t('home.learnMore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
