import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return; // wait for session restoration to finish
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (roles && user && !roles.includes(user.role)) {
      // Redirect to their own dashboard
      const path =
        user.role === "admin"
          ? "/admin/dashboard"
          : user.role === "landlord"
            ? "/landlord/dashboard"
            : "/client/dashboard";
      navigate(path);
    }
  }, [isAuthenticated, user, roles, navigate, isLoading]);

  // Show loading spinner while session is being restored
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
