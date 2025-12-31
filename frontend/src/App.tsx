import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "./store/auth.store";
import { useEffect } from "react";

function App() {
  const { fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading user data...</p> {/* You can replace this with a spinner */}
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;