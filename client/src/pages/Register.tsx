import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User, Mail, Phone, Lock, UserPlus, ArrowRight, Eye, EyeOff, Building2, UserCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";
import BrandMark from "@/components/BrandMark";
import { cn } from "@/lib/utils";

const roleOptions = [
  {
    value: "client",
    label: "House Hunter",
    description: "Browse and find properties to rent",
    icon: UserCheck,
  },
  {
    value: "landlord",
    label: "Landlord",
    description: "List and manage your properties",
    icon: Building2,
  },
];

const benefits = [
  "Access to 500+ verified listings",
  "Direct WhatsApp contact with landlords",
  "Save favourite properties",
  "Get notified of new listings",
  "Free to use — always",
];

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      role,
    });
    setLoading(false);
    if (success) {
      navigate("/verify-email");
    }
  };

  return (
    <div className="page-enter min-h-[calc(100vh-4rem)] flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-[42%] auth-panel-bg relative overflow-hidden flex-col justify-between p-12">
        {/* Pattern overlay */}
        <div className="absolute inset-0 hero-pattern opacity-30" />

        {/* Decoration */}
        <div className="absolute top-16 right-8 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-16 left-8 h-56 w-56 rounded-full bg-white/8 blur-2xl" />

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
            Join Kenya's<br />
            <span className="text-white/70">Property Marketplace</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8 max-w-xs">
            Create a free account and start your property journey today.
          </p>

          {/* Benefits list */}
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
                <span className="text-white/70 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <div className="relative">
          <p className="text-white/40 text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-white/70 hover:text-white underline transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <BrandMark className="h-8 w-8" />
            <span className="font-display text-xl font-extrabold">
              <span className="text-primary">Pata</span>Nyumba
            </span>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-3xl font-extrabold text-foreground mb-2">
              Create account
            </h1>
            <p className="text-muted-foreground">
              Join PataNyumba and find your perfect home.
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <Label className="text-sm font-semibold mb-3 block">I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value as UserRole)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                        : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-sm font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Kamau"
                  className="pl-10 h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone" className="text-sm font-semibold">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="pl-10 h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  minLength={8}
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
              className="w-full h-11 gap-2 rounded-xl font-semibold text-base shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Sign in <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By registering, you agree to our{" "}
            <button className="underline hover:text-primary transition-colors">Terms of Service</button>
            {" "}and{" "}
            <button className="underline hover:text-primary transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
}
