import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading authentication...</div>;
  }

  if (!user) {
    toast.error("Access Denied", { description: "You need to be logged in to view this page." });
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
