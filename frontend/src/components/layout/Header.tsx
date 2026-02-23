import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggle from "../ThemeToggle";
import NotificationBell from "../NotificationBell";
import { Button } from "../ui/button";
import { Bookmark, Menu, X, MapPin, Activity } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Nepal360
          </Link>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/campaigns"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
            >
              {t('nav.campaigns')}
            </Link>
            <Link
              to="/map"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Map
            </Link>
            <Link
              to="/activity"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors flex items-center gap-1"
            >
              <Activity className="w-4 h-4" />
              Live
            </Link>
            <Link
              to="/leaderboard"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
            >
              {t('nav.leaderboard')}
            </Link>

            {isAuthenticated && user && (
              <>
                <Link
                  to="/campaigns/create"
                  className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  {t('campaign.createCampaign')}
                </Link>
                <Link
                  to="/campaigns/me"
                  className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  {t('campaign.myCampaigns')}
                </Link>
                <Link
                  to="/impact"
                  className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  My Impact
                </Link>
                {user.roles && user.roles.isAdmin && (
                  <Link
                    to="/admin/campaigns"
                    className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
              <ThemeToggle />
              <LanguageSwitcher />

              {isAuthenticated && user && (
                <>
                  <Link to="/bookmarks">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      title="My Bookmarks"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </Link>
                  <NotificationBell />
                </>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {user.name || user.email}
                </Link>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
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

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <Link to="/campaigns" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.campaigns')}
            </Link>
            <Link to="/map" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Campaign Map
            </Link>
            <Link to="/activity" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Live Activity
            </Link>
            <Link to="/leaderboard" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.leaderboard')}
            </Link>
            {isAuthenticated && user && (
              <>
                <Link to="/campaigns/create" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {t('campaign.createCampaign')}
                </Link>
                <Link to="/campaigns/me" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {t('campaign.myCampaigns')}
                </Link>
                <Link to="/impact" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  My Impact
                </Link>
                <Link to="/bookmarks" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  My Bookmarks
                </Link>
              </>
            )}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <ThemeToggle />
              <LanguageSwitcher />
              {isAuthenticated && <NotificationBell />}
            </div>
            {!isAuthenticated && (
              <div className="flex gap-2 pt-3">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">{t('nav.signup')}</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
