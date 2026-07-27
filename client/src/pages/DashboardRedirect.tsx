import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { user, isAuthenticated, pendingEmail } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // If there's a pending verification, send to verify page
    if (!isAuthenticated && pendingEmail) {
      navigate("/verify-email");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const path =
      user?.role === "admin"
        ? "/admin/dashboard"
        : user?.role === "landlord"
          ? "/landlord/dashboard"
          : "/client/dashboard";
    navigate(path);
  }, [user, isAuthenticated, navigate, pendingEmail]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
