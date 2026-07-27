import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import BrandMark from "@/components/BrandMark";

export default function Login() {
  const { login, pendingEmail } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);

    const success = await login(email.trim(), password.trim());
    setLoading(false);

    if (success) {
      navigate("/dashboard");
    } else {
      // If the context set a pendingEmail it means verification is required
      // We surface a local banner here too for clarity
      const stored = localStorage.getItem("pata_pending_email");
      if (stored) {
        setUnverifiedEmail(stored);
      }
    }
  };

  return (
    <div className="page-enter container flex items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <BrandMark className="mx-auto mb-3 h-12 w-12 rounded-2xl" />
            <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Login to your PataNyumba account
            </p>
          </div>

          {/* Unverified email banner */}
          {(unverifiedEmail || pendingEmail) && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Email not verified
                </p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                  Please verify your email address before logging in.
                </p>
                <Link href="/verify-email">
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1 h-auto p-0 text-amber-700 underline dark:text-amber-400"
                  >
                    Go to verification page →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
