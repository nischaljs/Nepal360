import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../ui/button";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Nepal360
        </Link>
        <nav className="space-x-4 flex items-center">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          {isAuthenticated && user && (
            <>
              <Link to="/campaigns/create" className="hover:underline">
                Create Campaign
              </Link>
              <Link to="/campaigns/me" className="hover:underline">
                My Campaigns
              </Link>
              {user.roles && user.roles.isAdmin && (
                <Link to="/admin/campaigns" className="hover:underline">
                  Admin
                </Link>
              )}
              <Button onClick={logout} variant="secondary" size="sm">
                Logout
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary" size="sm">
                  Signup
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
