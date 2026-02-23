import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/auth.service";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-emerald-600 mb-2">Nepal360</h1>
          </Link>
          <p className="text-gray-600">{t('auth.signupDesc')}</p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">{t('auth.signupTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.signupSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleLoginButton />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t('auth.name')}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.createStrongPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-gray-200"
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      {t('auth.passwordStrength')}: <span className="font-medium">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {t('auth.passwordMinLength')}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('auth.creatingAccount')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t('auth.createAccount')}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-6">
              {t('auth.termsAgree')}{" "}
              <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                {t('auth.termsOfService')}
              </Link>{" "}
              {t('auth.and')}{" "}
              <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                {t('auth.privacyPolicy')}
              </Link>
            </p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('auth.hasAccount')}</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                {t('auth.signInInstead')}
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{t('auth.benefit1')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{t('auth.benefit2')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{t('auth.benefit3')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
