import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyEmail } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react"; // Icons add a nice touch

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Verification Failed", { description: "Email is missing." });
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyEmail({ email, otp });
      localStorage.setItem('token', response.token);
      await fetchUser();
      toast.success("Welcome aboard!", { description: "Email verified successfully." });
      navigate("/");
    } catch (error: any) {
      toast.error("Invalid Code", {
        description: error.response?.data?.message || "Please check your code and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to <br/>
            <span className="font-medium text-foreground">{email || "your email"}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="sr-only">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Only numbers
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                maxLength={6}
                required
              />
            </div>
            <Button className="w-full h-11" type="submit" disabled={isLoading || otp.length < 6}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 text-center text-sm">
          <p className="text-muted-foreground">
            Didn't receive a code?{" "}
            <button className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
              Resend code
            </button>
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;