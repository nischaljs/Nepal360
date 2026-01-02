import { useState } from "react";
import { grantBadge } from "@/services/admin.badge.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BadgeManagement = () => {
  const [userId, setUserId] = useState("");
  const [badgeCode, setBadgeCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !badgeCode) {
      toast.error("User ID and Badge Code are required.");
      return;
    }
    try {
      await grantBadge({ userId, badgeCode });
      toast.success("Badge granted successfully");
      setUserId("");
      setBadgeCode("");
    } catch (error: any) {
      toast.error("Failed to grant badge", {
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Badge Management</h1>
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Grant a Badge</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="badgeCode">Badge Code</Label>
                <Input
                  id="badgeCode"
                  placeholder="e.g., LIFETIME_AMOUNT"
                  value={badgeCode}
                  onChange={(e) => setBadgeCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Grant Badge</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeManagement;

