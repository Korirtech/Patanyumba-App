import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import BrandMark from "@/components/BrandMark";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { verifyEmail, resendVerification, pendingEmail } = useAuth();
  const [, navigate] = useLocation();

  // 6 individual digit inputs
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // If there's no pending email (user navigated here directly), redirect
  useEffect(() => {
    if (!pendingEmail) {
      navigate("/register");
    }
  }, [pendingEmail, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const code = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    // Accept only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setDigits(next);
    // Focus the last filled input or the first empty one
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    const success = await verifyEmail(code);
    setLoading(false);
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !pendingEmail) return;
    setResending(true);
    const success = await resendVerification(pendingEmail);
    setResending(false);
    if (success) {
      setCountdown(60); // 60-second cooldown before resending again
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  if (!pendingEmail) return null;

  return (
    <div className="page-enter container flex items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Verify Your Email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit verification code to
            </p>
            <p className="mt-1 font-semibold text-foreground">{pendingEmail}</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-center block">Enter verification code</Label>
              <div className="flex justify-center gap-2">
                {digits.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="h-12 w-12 text-center text-xl font-bold tabular-nums"
                    disabled={loading}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                The code expires in 15 minutes
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading || code.length < 6}
            >
              <CheckCircle className="h-4 w-4" />
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          {/* Resend section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 gap-2"
              onClick={handleResend}
              disabled={resending || countdown > 0}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                ? "Sending..."
                : "Resend code"}
            </Button>
          </div>

          {/* Back link */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => navigate("/register")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
