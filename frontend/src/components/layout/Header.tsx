import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import LanguageSwitcher from "../LanguageSwitcher";
import { Button } from "../ui/button";

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Nepal360
          </Link>

          <nav className="flex items-center gap-8">

            {isAuthenticated && user && (
              <>
                <Link
                  to="/campaigns/create"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  {t('campaign.createCampaign')}
                </Link>
                <Link
                  to="/campaigns/me"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  {t('campaign.myCampaigns')}
                </Link>
                <Link
                  to="/impact"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  My Impact
                </Link>
                {user.roles && user.roles.isAdmin && (
                  <Link
                    to="/admin/campaigns"
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <LanguageSwitcher />
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <Link
                    to="/profile"
                    className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    {user.name || user.email}
                  </Link>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {t('nav.logout')}
                  </Button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-3 ml-4">
                <LanguageSwitcher />
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
