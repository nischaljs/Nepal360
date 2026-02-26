import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/auth.service";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

const Signup = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up | Nepal360";
  }, []);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: "", color: "" };
    if (pwd.length < 6) return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (pwd.length < 10) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
    if (pwd.length < 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd))
      return { strength: 3, label: "Good", color: "bg-emerald-500" };
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd))
      return { strength: 4, label: "Strong", color: "bg-green-600" };
    return { strength: 2, label: "Fair", color: "bg-yellow-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signup({ name, email, password });
      toast.success("Account Created!", {
        description: "Please check your email to verify your account.",
      });
      navigate("/verify-email", { state: { email } });
    } catch (error: any) {
      toast.error("Signup Failed", {
        description: error.response?.data?.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:mb-10">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-emerald-600">Nepal360</h1>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t('auth.signupDesc')}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.signupTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('auth.signupSubtitle')}</p>
          </div>

          <GoogleLoginButton />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-3 bg-gray-50 dark:bg-gray-950 text-gray-400">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.name')}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.createStrongPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-gray-200 dark:bg-gray-800"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('auth.passwordStrength')}: <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}

              {!password && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('auth.passwordMinLength')}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg mt-2 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('auth.creatingAccount')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t('auth.createAccount')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-5 leading-relaxed">
            {t('auth.termsAgree')}{" "}
            <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline">
              {t('auth.termsOfService')}
            </Link>{" "}
            {t('auth.and')}{" "}
            <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline">
              {t('auth.privacyPolicy')}
            </Link>
          </p>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.hasAccount')}{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {t('auth.signInInstead')}
              </Link>
            </p>
          </div>
        </div>
    </div>
  );
};

export default Signup;
