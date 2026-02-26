import { useEffect, useRef, useState } from "react";
import {
  grantBadge,
  listBadges,
  listUsersForAdmin,
  type BadgeOption,
  type UserOption,
} from "@/services/admin.badge.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronsUpDown, Search, Award } from "lucide-react";

const BadgeManagement = () => {
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeOption | null>(null);

  const [users, setUsers] = useState<UserOption[]>([]);
  const [badges, setBadges] = useState<BadgeOption[]>([]);

  const [userSearch, setUserSearch] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [badgeDropdownOpen, setBadgeDropdownOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const badgeDropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Load badges on mount
  useEffect(() => {
    listBadges()
      .then(setBadges)
      .catch(() => toast.error("Failed to load badges"));
  }, []);

  // Load users on mount and when search changes (debounced)
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      listUsersForAdmin(userSearch)
        .then(setUsers)
        .catch(() => toast.error("Failed to load users"));
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [userSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (badgeDropdownRef.current && !badgeDropdownRef.current.contains(e.target as Node)) {
        setBadgeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedBadge) {
      toast.error("Please select both a user and a badge.");
      return;
    }
    setSubmitting(true);
    try {
      await grantBadge({ userId: selectedUser.id, badgeCode: selectedBadge.code });
      toast.success(`Badge "${selectedBadge.name}" granted to ${selectedUser.name}`);
      setSelectedUser(null);
      setSelectedBadge(null);
    } catch (error: any) {
      toast.error("Failed to grant badge", {
        description: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Badge Management</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Grant a Badge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {/* User Dropdown */}
              <div className="flex flex-col space-y-1.5">
                <Label>Select User</Label>
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setBadgeDropdownOpen(false);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                  >
                    {selectedUser ? (
                      <span className="truncate">
                        {selectedUser.name}{" "}
                        <span className="text-muted-foreground">({selectedUser.email})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Choose a user...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto p-1">
                        {users.length === 0 ? (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            No users found
                          </p>
                        ) : (
                          users.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserDropdownOpen(false);
                                setUserSearch("");
                              }}
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Check
                                className={`h-4 w-4 shrink-0 ${
                                  selectedUser?.id === user.id ? "opacity-100 text-emerald-600" : "opacity-0"
                                }`}
                              />
                              <div className="text-left min-w-0">
                                <p className="font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge Dropdown */}
              <div className="flex flex-col space-y-1.5">
                <Label>Select Badge</Label>
                <div className="relative" ref={badgeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setBadgeDropdownOpen(!badgeDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                  >
                    {selectedBadge ? (
                      <span className="truncate">
                        {selectedBadge.name}{" "}
                        <span className="text-muted-foreground">({selectedBadge.code})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Choose a badge...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>

                  {badgeDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700">
                      <div className="max-h-56 overflow-y-auto p-1">
                        {badges.length === 0 ? (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            No badges available
                          </p>
                        ) : (
                          badges.map((badge) => (
                            <button
                              key={badge.id}
                              type="button"
                              onClick={() => {
                                setSelectedBadge(badge);
                                setBadgeDropdownOpen(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Check
                                className={`h-4 w-4 shrink-0 ${
                                  selectedBadge?.id === badge.id ? "opacity-100 text-emerald-600" : "opacity-0"
                                }`}
                              />
                              <div className="text-left min-w-0">
                                <p className="font-medium truncate">{badge.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {badge.code} — {badge.description}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={submitting || !selectedUser || !selectedBadge}>
                {submitting ? "Granting..." : "Grant Badge"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeManagement;
