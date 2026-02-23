import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Users,
  Megaphone,
  Banknote,
  TrendingUp,
  ShieldCheck,
  Package,
} from "lucide-react";
import {
  getAdminAnalytics,
  type AnalyticsData,
} from "@/services/admin.analytics.service";

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const STATUS_COLORS: Record<string, string> = {
  LIVE: "#10b981",
  COMPLETED: "#3b82f6",
  PENDING_VERIFICATION: "#f59e0b",
  SUSPENDED: "#ef4444",
  DRAFT: "#6b7280",
};

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"];

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString()}`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-0">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
            accent
              ? "bg-emerald-100 text-emerald-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 pt-0">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminAnalytics()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || "Failed to load analytics"}</p>
      </div>
    );
  }

  const { overview, monthlyTrends, campaignStats, topCampaigns, topDonors, kycStats, recentActivity } = data;

  const trendData = monthlyTrends.map((t) => ({
    ...t,
    label: `${MONTH_NAMES[t.month]} ${t.year}`,
  }));

  const statusData = Object.entries(campaignStats.byStatus).map(([status, count]) => ({
    name: status.replace(/_/g, " "),
    value: count,
    fill: STATUS_COLORS[status] || "#6b7280",
  }));

  const pendingKyc = kycStats["PENDING"] || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Users"
          value={overview.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Total Campaigns"
          value={overview.totalCampaigns.toLocaleString()}
          icon={Megaphone}
        />
        <StatCard
          title="Total Raised"
          value={formatNPR(overview.totalFundsRaised)}
          icon={Banknote}
          accent
        />
        <StatCard
          title="Total Donations"
          value={(overview.totalMoneyDonations + overview.totalItemDonations).toLocaleString()}
          icon={Package}
        />
        <StatCard
          title="Pending KYC"
          value={pendingKyc.toLocaleString()}
          icon={ShieldCheck}
        />
      </div>

      {/* Row 2: Line Chart + Pie Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Monthly Donation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "totalDonated") return [formatNPR(value), "Amount"];
                    if (name === "donationCount") return [value, "Donations"];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalDonated"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Amount (NPR)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="donationCount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Donation Count"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Bar Chart (KYC) + Top Campaigns Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>KYC Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(kycStats).map(([status, count]) => ({
                  status: status.replace(/_/g, " "),
                  count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Campaigns by Funds Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Campaign</th>
                    <th className="pb-2 font-medium text-right">Raised</th>
                    <th className="pb-2 font-medium text-right">Target</th>
                    <th className="pb-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No campaigns yet
                      </td>
                    </tr>
                  ) : (
                    topCampaigns.map((c) => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-3 pr-2 max-w-[200px] truncate font-medium">
                          {c.title}
                        </td>
                        <td className="py-3 text-right text-emerald-600 font-semibold">
                          {formatNPR(c.totalRaised)}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {formatNPR(c.targetAmount)}
                        </td>
                        <td className="py-3 text-center">
                          <Badge
                            variant={c.status === "LIVE" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Top Donors + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDonors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No donors yet</p>
              ) : (
                topDonors.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.donationCount} donation{d.donationCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      {formatNPR(d.totalDonated)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              ) : (
                recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <ShieldCheck className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log.actionType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {log.note && (
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {log.note}
                        </p>
                      )}
                      {log.actor && (
                        <p className="text-xs text-muted-foreground">
                          by {log.actor.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
