import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, LogIn, ShieldAlert, Home, MapPin, ShieldCheck, Users, ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
      const stored = localStorage.getItem("pata_pending_email");
      if (stored) {
        setUnverifiedEmail(stored);
      }
    }
  };

  return (
    <div className="page-enter min-h-[calc(100vh-4rem)] flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-[45%] auth-panel-bg relative overflow-hidden flex-col justify-between p-12">
        {/* Pattern overlay */}
        <div className="absolute inset-0 hero-pattern opacity-30" />

        {/* Floating decoration circles */}
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-white/8 blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <BrandMark className="h-10 w-10 rounded-2xl bg-white/20" />
          <span className="font-display text-2xl font-extrabold text-white">
            PataNyumba
          </span>
        </div>

        {/* Center content */}
        <div className="relative">
          <h2 className="font-display text-3xl font-extrabold text-white leading-tight mb-4">
            Find Your Perfect<br />
            <span className="text-white/70">Home in Kenya</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8 max-w-xs">
            Join thousands of Kenyans discovering verified properties across all 47 counties.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Home, label: "Properties", value: "500+" },
              { icon: MapPin, label: "Counties", value: "47" },
              { icon: ShieldCheck, label: "Verified", value: "100%" },
              { icon: Users, label: "Users", value: "1,000+" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
                <stat.icon className="h-5 w-5 text-white/70 mb-2" />
                <p className="font-display text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <blockquote className="text-white/60 text-sm italic border-l-2 border-white/20 pl-4">
            "PataNyumba made finding my apartment in Nairobi so easy. Highly recommended!"
          </blockquote>
          <p className="text-white/40 text-xs mt-2 pl-4">— Satisfied Tenant, Westlands</p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <BrandMark className="h-8 w-8" />
            <span className="font-display text-xl font-extrabold">
              <span className="text-primary">Pata</span>Nyumba
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-extrabold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your PataNyumba account to continue.
            </p>
          </div>

          {/* Unverified email banner */}
          {(unverifiedEmail || pendingEmail) && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gap-2 rounded-xl font-semibold text-base shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Create one <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Secure login</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Protected by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
