import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggle from "../ThemeToggle";
import NotificationBell from "../NotificationBell";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bookmark, Menu, X, MapPin, Activity, ChevronDown, User, PlusCircle, FolderOpen, BarChart3, Shield, LogOut } from "lucide-react";
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
            className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex-shrink-0"
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
          <nav className="hidden lg:flex items-center gap-1">
            {/* Primary nav links */}
            <Link
              to="/campaigns"
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('nav.campaigns')}
            </Link>
            <Link
              to="/map"
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors flex items-center gap-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MapPin className="w-3.5 h-3.5" />
              Map
            </Link>
            <Link
              to="/activity"
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors flex items-center gap-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Activity className="w-3.5 h-3.5" />
              Live
            </Link>
            <Link
              to="/leaderboard"
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('nav.leaderboard')}
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

            {/* Utility icons */}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />

              {isAuthenticated && user && (
                <>
                  <Link to="/bookmarks">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="My Bookmarks"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </Link>
                  <NotificationBell />
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

            {/* Auth section */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                      {user.name || user.email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/campaigns/create" className="flex items-center gap-2 cursor-pointer">
                      <PlusCircle className="w-4 h-4" />
                      {t('campaign.createCampaign')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/campaigns/me" className="flex items-center gap-2 cursor-pointer">
                      <FolderOpen className="w-4 h-4" />
                      {t('campaign.myCampaigns')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/impact" className="flex items-center gap-2 cursor-pointer">
                      <BarChart3 className="w-4 h-4" />
                      My Impact
                    </Link>
                  </DropdownMenuItem>
                  {user.roles && user.roles.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/campaigns" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
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
          <nav className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <Link to="/campaigns" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.campaigns')}
            </Link>
            <Link to="/map" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
              Campaign Map
            </Link>
            <Link to="/activity" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
              Live Activity
            </Link>
            <Link to="/leaderboard" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.leaderboard')}
            </Link>
            {isAuthenticated && user && (
              <>
                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                <Link to="/profile" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/campaigns/create" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  {t('campaign.createCampaign')}
                </Link>
                <Link to="/campaigns/me" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  {t('campaign.myCampaigns')}
                </Link>
                <Link to="/impact" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  My Impact
                </Link>
                <Link to="/bookmarks" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  My Bookmarks
                </Link>
                {user.roles && user.roles.isAdmin && (
                  <Link to="/admin/campaigns" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-md" onClick={() => setMobileMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <ThemeToggle />
              <LanguageSwitcher />
              {isAuthenticated && <NotificationBell />}
            </div>
            {isAuthenticated && user ? (
              <div className="pt-3">
                <Button onClick={() => { logout(); setMobileMenuOpen(false); }} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
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
