import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import CreateCampaign from "./pages/campaign/CreateCampaign";
import MyCampaigns from "./pages/campaign/MyCampaigns";
import CampaignDetail from "./pages/campaign/CampaignDetail";
import AdminCampaignList from "./pages/admin/AdminCampaignList";
import AdminCampaignDetail from "./pages/admin/AdminCampaignDetail";
import AdminRoute from "./components/AdminRoute";
import KYCForm from "./pages/kyc/KYCForm"; // Import KYCForm

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
        path: "/kyc/submit", // New KYC submission route
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
      {
        path: "/admin/campaigns",
        element: (
          <AdminRoute>
            <AdminCampaignList />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/campaigns/:id",
        element: (
          <AdminRoute>
            <AdminCampaignDetail />
          </AdminRoute>
        ),
      },
    ],
  },
]);
