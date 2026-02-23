import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  getCampaignAnalytics,
  type CampaignAnalyticsData,
} from "../../services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

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

const formatHour = (hour: number) => {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
};

const CampaignAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CampaignAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Campaign Analytics | Nepal360";
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const result = await getCampaignAnalytics(id);
        setData(result);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to load analytics";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Could not load analytics data.</p>
        <Link to="/campaigns/me" className="text-emerald-600 hover:underline text-sm mt-2 inline-block">
          Back to My Campaigns
        </Link>
      </div>
    );
  }

  const trendData = data.donationTrend.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    amount: d.amount,
    count: d.count,
  }));

  const hourlyData = data.donationsByHour.map((d) => ({
    hour: formatHour(d.hour),
    amount: d.amount,
    count: d.count,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Campaign Analytics</h1>
        <Link
          to="/campaigns/me"
          className="text-sm text-emerald-600 hover:underline"
        >
          Back to My Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total Raised"
          value={`Rs. ${data.totalMoneyRaised.toLocaleString()}`}
        />
        <StatCard label="Donors" value={data.totalDonors} />
        <StatCard label="Visitors" value={data.visitors.toLocaleString()} />
        <StatCard
          label="Conversion"
          value={`${data.conversionRate}%`}
          sub="Visitors to donors"
        />
        <StatCard label="Shares" value={data.shares} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Donation Trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.every((d) => d.amount === 0) ? (
              <p className="text-center text-gray-400 py-16">No donations in the last 30 days</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "amount" ? `Rs. ${value.toLocaleString()}` : value,
                      name === "amount" ? "Amount" : "Count",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Donations by Hour of Day</CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyData.every((d) => d.count === 0) ? (
              <p className="text-center text-gray-400 py-16">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "count" ? value : `Rs. ${value.toLocaleString()}`,
                      name === "count" ? "Donations" : "Amount",
                    ]}
                  />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Donors</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topDonors.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No donors yet</p>
            ) : (
              <div className="space-y-3">
                {data.topDonors.map((d, i) => (
                  <div
                    key={d.donorId}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{d.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">
                      Rs. {d.totalDonated.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No activity yet</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.recentActivity.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          a.type === "money"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {a.type === "money" ? "Rs" : "IT"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{a.donorName}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(a.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {a.type === "money" ? (
                        <span className="text-sm font-semibold text-emerald-700">
                          Rs. {a.amount?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-blue-700">
                          {a.itemName} x{a.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Avg. Donation</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              Rs. {data.averageDonation.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Item Donations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalItemDonations}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
