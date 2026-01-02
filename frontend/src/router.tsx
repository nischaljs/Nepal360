import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import CreateCampaign from "./pages/campaign/CreateCampaign";
import MyCampaigns from "./pages/campaign/MyCampaigns";
import CampaignDetail from "./pages/campaign/CampaignDetail";
import AdminCampaignDetail from "./pages/admin/AdminCampaignDetail";
import AdminRoute from "./components/AdminRoute";
import KYCForm from "./pages/kyc/KYCForm";
import AdminLayout from "./pages/admin/layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import KYCManagement from "./pages/admin/KYCManagement";
import CampaignManagement from "./pages/admin/CampaignManagement";
import ItemDonationManagement from "./pages/admin/ItemDonationManagement";
import BadgeManagement from "./pages/admin/BadgeManagement";
import AuditLogView from "./pages/admin/AuditLogView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "/kyc/submit",
        element: <KYCForm />,
      },
      {
        path: "/campaigns/create",
        element: <CreateCampaign />,
      },
      {
        path: "/campaigns/me",
        element: <MyCampaigns />,
      },
      {
        path: "/campaigns/:id",
        element: <CampaignDetail />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "kyc",
        element: <KYCManagement />,
      },
      {
        path: "campaigns",
        element: <CampaignManagement />,
      },
      {
        path: "campaigns/:id",
        element: <AdminCampaignDetail />,
      },
      {
        path: "item-donations",
        element: <ItemDonationManagement />,
      },
      {
        path: "badges",
        element: <BadgeManagement />,
      },
      {
        path: "audit-logs",
        element: <AuditLogView />,
      },
    ],
  },
]);