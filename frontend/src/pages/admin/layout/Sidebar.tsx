import { NavLink, useNavigate } from "react-router-dom";
import { Home, ShieldCheck, CheckSquare, Gift, Badge, History, FileBarChart, LogOut } from 'lucide-react';
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/admin/dashboard", icon: Home, text: "Dashboard" },
  { to: "/admin/reports", icon: FileBarChart, text: "Reports" },
  { to: "/admin/kyc", icon: ShieldCheck, text: "KYC Management" },
  { to: "/admin/campaigns", icon: CheckSquare, text: "Campaigns" },
  { to: "/admin/item-donations", icon: Gift, text: "Item Donations" },
  { to: "/admin/badges", icon: Badge, text: "Badges" },
  { to: "/admin/audit-logs", icon: History, text: "Audit Logs" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <link.icon className="mr-3 h-6 w-6" />
            {link.text}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Button onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
