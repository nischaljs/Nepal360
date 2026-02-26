
import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isLoading) {
      fetchUser();
    }
  }, []);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading authentication...</div>;
  }

  if (!user || !user.roles?.isAdmin) {
    toast.error("Access Denied", { description: "You do not have administrative privileges to view this page." });
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
