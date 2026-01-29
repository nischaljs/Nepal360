import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalLoaderProps {
  className?: string;
  message?: string;
  fullScreen?: boolean;
}

const GlobalLoader = ({ className, message = "Loading...", fullScreen = false }: GlobalLoaderProps) => {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {/* Animated emerald ring loader */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse" />
        <div className="relative rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin" style={{ animationDuration: '0.8s' }}>
          <Loader2Icon className="w-12 h-12 text-emerald-600" />
        </div>
        {/* Inner dot */}
        <div className="absolute inset-2 flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Loading text with subtle animation */}
      {message && (
        <div className="flex items-center gap-2">
          <span className="text-emerald-700 font-medium animate-pulse">{message}</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default GlobalLoader;
