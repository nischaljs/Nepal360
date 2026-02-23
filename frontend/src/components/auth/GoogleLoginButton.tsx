import { useEffect, useRef, useState } from "react";
import { googleLogin } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
}

const GoogleLoginButton = ({ onSuccess }: GoogleLoginButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: buttonRef.current.offsetWidth,
        text: "signin_with",
        shape: "rectangular",
      });
    };

    document.head.appendChild(script);

    return () => {
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existing) existing.remove();
    };
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true);
    try {
      const result = await googleLogin(response.credential);
      localStorage.setItem("token", result.token);
      const user = await fetchUser();

      toast.success("Welcome!", {
        description: `Signed in as ${result.user.name}`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          if (user?.roles.isAdmin) {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 500);
      }
    } catch (error: any) {
      toast.error("Google Sign-In Failed", {
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className={`flex justify-center ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      />
      {isLoading && (
        <p className="text-center text-sm text-gray-500 mt-2">Signing in...</p>
      )}
    </div>
  );
};

export default GoogleLoginButton;
