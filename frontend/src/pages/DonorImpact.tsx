import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getMyImpact, type DonorImpactData } from "../services/impact.service";
import { getMyBadges, type UserBadge } from "../services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { exportDonationsCSV } from "../services/export.service";

const COLORS = ["#059669", "#0891b2", "#7c3aed", "#e11d48", "#f59e0b", "#6366f1", "#14b8a6"];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <Card>
    <CardContent className="p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </CardContent>
  </Card>
);

const SkeletonCard = () => (
  <Card>
    <CardContent className="p-5">
      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-7 w-28 bg-gray-200 rounded animate-pulse mt-2" />
    </CardContent>
  </Card>
);

const SkeletonChart = () => (
  <Card>
    <CardContent className="p-6">
      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="h-64 bg-gray-100 rounded animate-pulse" />
    </CardContent>
  </Card>
);

const DonorImpact = () => {
  const [data, setData] = useState<DonorImpactData | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "My Impact | Nepal360";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [impactData, badgesData] = await Promise.all([
          getMyImpact(),
          getMyBadges(),
        ]);
        setData(impactData);
        setBadges(badgesData);
      } catch {
        toast.error("Failed to load impact data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const monthlyChartData = data.monthlyBreakdown.map((m) => ({
    name: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
    amount: m.amount,
  }));

  const categoryChartData = data.categoryBreakdown.map((c) => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.amount,
    count: c.count,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">My Donor Impact</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            exportDonationsCSV()
              .then(() => toast.success('Donations exported!'))
              .catch(() => toast.error('Failed to export'));
          }}
          className="gap-2 border-gray-300 dark:border-gray-600 dark:text-gray-300"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Donated"
          value={`Rs. ${data.totalMoneyDonated.toLocaleString()}`}
          sub="All time"
        />
        <StatCard label="Campaigns Supported" value={data.campaignsSupported} />
        <StatCard label="Items Pledged" value={data.totalItemsPledged} />
        <StatCard label="Donor Rank" value={`#${data.donorRank}`} sub="All-time leaderboard" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Donation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.every((d) => d.amount === 0) ? (
              <p className="text-center text-gray-400 py-16">No donation data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Amount"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ fill: "#059669", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length === 0 ? (
              <p className="text-center text-gray-400 py-16">No donation data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _: any, entry: any) => [
                      `Rs. ${value.toLocaleString()} (${entry.payload.count} donations)`,
                      entry.payload.name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Campaigns Supported</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCampaigns.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No campaigns yet</p>
            ) : (
              <div className="space-y-3">
                {data.topCampaigns.map((c, i) => (
                  <Link
                    key={c.campaignId}
                    to={`/campaigns/${c.campaignId}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800 line-clamp-1">
                        {c.title}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 whitespace-nowrap ml-2">
                      Rs. {c.totalDonated.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Badges Earned ({data.badgesEarned})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No badges earned yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.map((ub) => (
                  <div
                    key={ub.id}
                    className="flex flex-col items-center text-center p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors"
                  >
                    {ub.badge.iconUrl ? (
                      <img src={ub.badge.iconUrl} alt={ub.badge.name} className="h-10 w-10 mb-1.5" />
                    ) : (
                      <div className="h-10 w-10 mb-1.5 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-bold">
                        {ub.badge.name.charAt(0)}
                      </div>
                    )}
                    <p className="text-xs font-medium">{ub.badge.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorImpact;
