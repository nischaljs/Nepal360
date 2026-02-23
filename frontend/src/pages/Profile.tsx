import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth.store";
import {
  getMyStats,
  getMyBadges,
  getMyDonationHistory,
  type UserStats,
  type UserBadge,
  type DonationHistoryItem,
} from "../services/user.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import GlobalLoader from "../components/ui/GlobalLoader";

const kycStatusConfig: Record<string, { label: string; color: string }> = {
  APPROVED: { label: "Verified", color: "bg-emerald-100 text-emerald-800" },
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  NOT_SUBMITTED: { label: "Not Submitted", color: "bg-gray-100 text-gray-600" },
};

const Profile = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [donations, setDonations] = useState<DonationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "My Profile | Nepal360";
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [statsData, badgesData, donationsData] = await Promise.all([
          getMyStats(),
          getMyBadges(),
          getMyDonationHistory(),
        ]);
        setStats(statsData);
        setBadges(badgesData);
        setDonations(donationsData);
      } catch (err: any) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (isLoading) {
    return <GlobalLoader fullScreen message="Loading profile..." />;
  }

  if (!user) return null;

  const kycStatus = user.kycProfile?.status ?? "NOT_SUBMITTED";
  const kycConfig = kycStatusConfig[kycStatus] ?? kycStatusConfig.NOT_SUBMITTED;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email Status</p>
                  <Badge
                    className={
                      user.emailStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800 mt-1"
                        : "bg-yellow-100 text-yellow-800 mt-1"
                    }
                  >
                    {user.emailStatus === "VERIFIED" ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">KYC Status</p>
                  <Badge className={`${kycConfig.color} mt-1`}>
                    {kycConfig.label}
                  </Badge>
                  {kycStatus === "NOT_SUBMITTED" && (
                    <Link to="/kyc/submit" className="block mt-1">
                      <span className="text-xs text-emerald-600 hover:underline">
                        Submit KYC
                      </span>
                    </Link>
                  )}
                  {kycStatus === "REJECTED" && user.kycProfile?.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">
                      Reason: {user.kycProfile.rejectionReason}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                  <p className="text-sm font-medium mt-1">{joinedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Roles</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.isDonor && (
                      <Badge className="bg-blue-100 text-blue-800">Donor</Badge>
                    )}
                    {user.roles.isVerifiedBeneficiary && (
                      <Badge className="bg-purple-100 text-purple-800">Beneficiary</Badge>
                    )}
                    {user.roles.isAdmin && (
                      <Badge className="bg-red-100 text-red-800">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-700">
                  Rs. {stats ? Number(stats.totalMoneyDonated).toLocaleString() : "0"}
                </p>
                <p className="text-xs text-gray-500">Total Donated</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">
                    {stats?.donationCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Donations</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">
                    {stats?.totalItemCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Items Pledged</p>
                </div>
              </div>
              <Link to="/impact">
                <Button
                  variant="outline"
                  className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  View My Impact
                </Button>
              </Link>
              <Link to="/campaigns/me">
                <Button
                  variant="outline"
                  className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  My Campaigns
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((ub) => (
                <div
                  key={ub.id}
                  className="flex flex-col items-center text-center p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors"
                >
                  {ub.badge.iconUrl ? (
                    <img
                      src={ub.badge.iconUrl}
                      alt={ub.badge.name}
                      className="h-12 w-12 mb-2"
                    />
                  ) : (
                    <div className="h-12 w-12 mb-2 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-lg font-bold">
                      {ub.badge.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-sm font-medium">{ub.badge.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {ub.badge.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Donations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No donations yet.</p>
              <Link to="/campaigns">
                <Button
                  variant="link"
                  className="text-emerald-600 mt-1"
                >
                  Browse campaigns to get started
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 10).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        d.type === "Money"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {d.type === "Money" ? "Rs" : "IT"}
                    </div>
                    <div>
                      <Link
                        to={`/campaigns/${d.campaign.id}`}
                        className="text-sm font-medium hover:text-emerald-600 transition-colors"
                      >
                        {d.campaign.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {new Date(d.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {d.type === "Money" ? (
                      <p className="text-sm font-semibold text-emerald-700">
                        Rs. {Number(d.amount).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-blue-700">
                        {d.itemName} x{d.quantity}
                      </p>
                    )}
                    <Badge
                      className={`text-[10px] ${
                        d.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : d.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {donations.length > 10 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  Showing 10 of {donations.length} donations
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
