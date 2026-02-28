import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Repeat,
  Search,
  TrendingUp,
  Users,
  Heart,
  Trophy,
} from "lucide-react";
import {
  getOverviewReport,
  getCampaignReports,
  getUserAnalytics,
  getCollectionReport,
  type OverviewReportData,
  type CampaignReportsData,
  type CampaignReportItem,
  type UserAnalyticsData,
  type CollectionReportData,
} from "@/services/admin.reports.service";

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"];

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

function TabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
      <Card>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState<OverviewReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverviewReport()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load overview"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TabSkeleton />;
  if (error || !data) return <p className="text-red-500 text-center py-8">{error || "Failed to load"}</p>;

  const chartData = data.monthlyCollections.map((m) => ({
    ...m,
    label: `${MONTH_NAMES[m.month]} ${m.year}`,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Collected (All Time)" value={formatNPR(data.totalAllTime)} icon={Banknote} accent />
        <StatCard title="This Month" value={formatNPR(data.thisMonth)} icon={CalendarDays} />
        <StatCard title="Active Recurring" value={data.activeRecurring} icon={Repeat} />
        <StatCard title="Avg Donation" value={formatNPR(data.avgDonation)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatNPR(value), "Amount"]} />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatNPR(value), "Cumulative"]} />
                <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="amount"
                nameKey="category"
                label={({ category, amount }) => `${category}: ${formatNPR(amount)}`}
              >
                {data.categoryDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatNPR(value), "Raised"]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Campaign Reports Tab ──────────────────────────────────────────

function CampaignReportsTab() {
  const [data, setData] = useState<CampaignReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    getCampaignReports({
      search: search || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      page,
    })
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error && !data) return <p className="text-red-500 text-center py-8">{error}</p>;

  const statusOptions = ["", "DRAFT", "PENDING_VERIFICATION", "LIVE", "SUSPENDED", "COMPLETED"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {statusOptions.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {data?.categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading && !data ? (
            <div className="p-6"><TabSkeleton /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-3 font-medium w-8"></th>
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium text-center">Status</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium text-right">Target</th>
                    <th className="p-3 font-medium text-right">Raised</th>
                    <th className="p-3 font-medium text-right">Progress</th>
                    <th className="p-3 font-medium text-right">Donations</th>
                    <th className="p-3 font-medium text-right">Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    data?.campaigns.map((c) => (
                      <CampaignRow
                        key={c.id}
                        campaign={c}
                        expanded={expandedId === c.id}
                        onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.total} campaigns)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignRow({
  campaign,
  expanded,
  onToggle,
}: {
  campaign: CampaignReportItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusVariant = campaign.status === "LIVE" ? "default" : "secondary";

  const chartData = campaign.monthlyBreakdown.map((m) => ({
    ...m,
    label: `${MONTH_NAMES[m.month]} ${m.year}`,
  }));

  return (
    <>
      <tr className="border-b hover:bg-muted/50 cursor-pointer" onClick={onToggle}>
        <td className="p-3">
          {campaign.monthlyBreakdown.length > 0 && (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </td>
        <td className="p-3 max-w-[200px] truncate font-medium">{campaign.title}</td>
        <td className="p-3 text-center">
          <Badge variant={statusVariant} className="text-xs">{campaign.status.replace(/_/g, " ")}</Badge>
        </td>
        <td className="p-3">{campaign.category}</td>
        <td className="p-3 text-right text-muted-foreground">{formatNPR(campaign.target)}</td>
        <td className="p-3 text-right text-emerald-600 font-semibold">{formatNPR(campaign.totalRaised)}</td>
        <td className="p-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(campaign.progressPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{campaign.progressPercent}%</span>
          </div>
        </td>
        <td className="p-3 text-right">{campaign.donations}</td>
        <td className="p-3 text-right">{campaign.visits}</td>
      </tr>
      {expanded && chartData.length > 0 && (
        <tr className="border-b">
          <td colSpan={9} className="p-4 bg-muted/30">
            <p className="text-sm font-medium mb-2">Monthly Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatNPR(value), "Amount"]} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── User Analytics Tab ────────────────────────────────────────────

function UserAnalyticsTab() {
  const [data, setData] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserAnalytics()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TabSkeleton />;
  if (error || !data) return <p className="text-red-500 text-center py-8">{error || "Failed to load"}</p>;

  const growthData = data.userGrowth.map((g) => ({
    ...g,
    label: `${MONTH_NAMES[g.month]} ${g.year}`,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Users" value={data.totalUsers.toLocaleString()} icon={Users} />
        <StatCard title="Total Donors" value={data.totalDonors.toLocaleString()} icon={Heart} accent />
        <StatCard title="Donor-to-User Ratio" value={`${data.donorRatio}%`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="newUsers" name="New Users" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Area type="monotone" dataKey="cumulative" name="Total Users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donor Distribution by Range</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.donorDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 20 Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-3 font-medium">#</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium text-right">Total Donated</th>
                  <th className="p-3 font-medium text-right">Donations</th>
                  <th className="p-3 font-medium text-right">Items</th>
                  <th className="p-3 font-medium">Last Donation</th>
                </tr>
              </thead>
              <tbody>
                {data.topDonors.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {d.rank}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{d.name}</td>
                    <td className="p-3 text-muted-foreground">{d.email}</td>
                    <td className="p-3 text-right text-emerald-600 font-semibold">{formatNPR(d.totalDonated)}</td>
                    <td className="p-3 text-right">{d.donationCount}</td>
                    <td className="p-3 text-right">{d.itemCount}</td>
                    <td className="p-3 text-muted-foreground">
                      {d.lastDonationAt
                        ? new Date(d.lastDonationAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Collections Tab ───────────────────────────────────────────────

function CollectionsTab() {
  const [data, setData] = useState<CollectionReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");

  useEffect(() => {
    setLoading(true);
    getCollectionReport(period)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <TabSkeleton />;
  if (error || !data) return <p className="text-red-500 text-center py-8">{error || "Failed to load"}</p>;

  return (
    <div className="space-y-6">
      {/* Period Toggle */}
      <div className="flex gap-2">
        <Button
          variant={period === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={period === "weekly" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("weekly")}
        >
          Weekly
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total All Time" value={formatNPR(data.totalAllTime)} icon={Banknote} accent />
        <StatCard title={`Avg per ${period === "monthly" ? "Month" : "Week"}`} value={formatNPR(data.avgPerPeriod)} icon={TrendingUp} />
        <StatCard title="Best Period" value={`${data.bestPeriod.period} (${formatNPR(data.bestPeriod.amount)})`} icon={Trophy} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection by {period === "monthly" ? "Month" : "Week"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.periodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [formatNPR(value), "Amount"]} />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Period Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-3 font-medium">Period</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                  <th className="p-3 font-medium text-right">Donations</th>
                  <th className="p-3 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {data.periodData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No data available
                    </td>
                  </tr>
                ) : (
                  [...data.periodData].reverse().map((p) => (
                    <tr key={p.period} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{p.period}</td>
                      <td className="p-3 text-right font-semibold">{formatNPR(p.amount)}</td>
                      <td className="p-3 text-right">{p.count}</td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-medium ${
                            p.changePct > 0
                              ? "text-emerald-600"
                              : p.changePct < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {p.changePct > 0 ? "+" : ""}
                          {p.changePct}%
                        </span>
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
  );
}

// ─── Main Reports Page ─────────────────────────────────────────────

const Reports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Reports</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignReportsTab />
        </TabsContent>

        <TabsContent value="users">
          <UserAnalyticsTab />
        </TabsContent>

        <TabsContent value="collections">
          <CollectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
