import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App";
import GlobalLoader from "./components/ui/GlobalLoader";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const Login = lazy(() => import("./pages/auth/Login"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const CreateCampaign = lazy(() => import("./pages/campaign/CreateCampaign"));
const MyCampaigns = lazy(() => import("./pages/campaign/MyCampaigns"));
const CampaignDetail = lazy(() => import("./pages/campaign/CampaignDetail"));
const CampaignsPage = lazy(() => import("./pages/campaign/List"));
const AdminCampaignDetail = lazy(() => import("./pages/admin/AdminCampaignDetail"));
const KYCForm = lazy(() => import("./pages/kyc/KYCForm"));
const AdminLayout = lazy(() => import("./pages/admin/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const KYCManagement = lazy(() => import("./pages/admin/KYCManagement"));
const CampaignManagement = lazy(() => import("./pages/admin/CampaignManagement"));
const ItemDonationManagement = lazy(() => import("./pages/admin/ItemDonationManagement"));
const BadgeManagement = lazy(() => import("./pages/admin/BadgeManagement"));
const AuditLogView = lazy(() => import("./pages/admin/AuditLogView"));
const Leaderboard = lazy(() => import("./pages/leaderboard/Leaderboard"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));
const MyItemDonations = lazy(() => import("./pages/MyItemDonations"));

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex items-center justify-center py-20"><GlobalLoader message="Loading..." /></div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Lazy><Home /></Lazy>,
      },
      {
        path: "/signup",
        element: <Lazy><Signup /></Lazy>,
      },
      {
        path: "/login",
        element: <Lazy><Login /></Lazy>,
      },
      {
        path: "/verify-email",
        element: <Lazy><VerifyEmail /></Lazy>,
      },
      {
        path: "/forgot-password",
        element: <Lazy><ForgotPassword /></Lazy>,
      },
      {
        path: "/kyc/submit",
        element: (
          <ProtectedRoute>
            <Lazy><KYCForm /></Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: "/campaigns",
        element: <Lazy><CampaignsPage /></Lazy>,
      },
      {
        path: "/campaigns/create",
        element: (
          <ProtectedRoute>
            <Lazy><CreateCampaign /></Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: "/campaigns/me",
        element: (
          <ProtectedRoute>
            <Lazy><MyCampaigns /></Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: "/campaigns/:id",
        element: <Lazy><CampaignDetail /></Lazy>,
      },
      {
        path: "/leaderboard",
        element: <Lazy><Leaderboard /></Lazy>,
      },
      {
        path: "/about",
        element: <Lazy><About /></Lazy>,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Lazy><Profile /></Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-item-donations",
        element: (
          <ProtectedRoute>
            <Lazy><MyItemDonations /></Lazy>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Lazy><AdminLayout /></Lazy>
      </AdminRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Lazy><AdminDashboard /></Lazy>,
      },
      {
        path: "kyc",
        element: <Lazy><KYCManagement /></Lazy>,
      },
      {
        path: "campaigns",
        element: <Lazy><CampaignManagement /></Lazy>,
      },
      {
        path: "campaigns/:id",
        element: <Lazy><AdminCampaignDetail /></Lazy>,
      },
      {
        path: "item-donations",
        element: <Lazy><ItemDonationManagement /></Lazy>,
      },
      {
        path: "badges",
        element: <Lazy><BadgeManagement /></Lazy>,
      },
      {
        path: "audit-logs",
        element: <Lazy><AuditLogView /></Lazy>,
      },
    ],
  },
]);
