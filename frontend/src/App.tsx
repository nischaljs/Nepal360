import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "./store/auth.store";
import { useEffect } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

function App() {
  const { fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    console.log("App.tsx useEffect triggered. typeof fetchUser:", typeof fetchUser);
    if (typeof fetchUser === 'function') {
      fetchUser();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;