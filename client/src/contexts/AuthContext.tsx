import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, UserRole } from "@/lib/types";
import { setSession, clearSession } from "@/lib/store";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  getToken,
  verifyEmailCode,
  resendVerificationCode,
  type UserData,
} from "@/lib/api";
import { toast } from "sonner";

interface AuthContextValue {
  user: Session | null;
  /** Email waiting for verification (set after registration, cleared after verify) */
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Persistence keys
// ---------------------------------------------------------------------------

const PENDING_EMAIL_KEY = "pata_pending_email";

// ---------------------------------------------------------------------------
// Helper – map API UserData to the local Session shape
// ---------------------------------------------------------------------------

function toSession(userData: UserData): Session {
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: userData.role as UserRole,
    status: userData.status as "active" | "suspended",
    createdAt: userData.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(
    () => localStorage.getItem(PENDING_EMAIL_KEY)
  );

  // ---------------------------------------------------------------------------
  // On mount – verify the stored JWT with the server and restore the session.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      const result = await getCurrentUser();

      if (result.error || !result.data) {
        logoutUser();
        clearSession();
        setUser(null);
      } else {
        // Only restore session if the user is verified
        if (result.data.emailVerified) {
          const session = toSession(result.data);
          setSession(session);
          setUser(session);
          // Clear any stale pending email
          localStorage.removeItem(PENDING_EMAIL_KEY);
          setPendingEmail(null);
        } else {
          // Token is valid but email not yet verified – keep pendingEmail set
          // so the user can be redirected to /verify-email
          if (!pendingEmail) {
            setPendingEmail(result.data.email);
            localStorage.setItem(PENDING_EMAIL_KEY, result.data.email);
          }
        }
      }

      setIsLoading(false);
    }

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const result = await loginUser(email, password);

        if (result.error) {
          // Special case: unverified email
          if (result.meta?.requiresVerification) {
            const unverifiedEmail = result.meta.email || email;
            setPendingEmail(unverifiedEmail);
            localStorage.setItem(PENDING_EMAIL_KEY, unverifiedEmail);
            toast.error("Please verify your email before logging in.", {
              description: "Check your inbox or request a new code.",
              action: {
                label: "Verify now",
                onClick: () => {
                  window.location.href = "/verify-email";
                },
              },
            });
          } else {
            toast.error(result.error);
          }
          return false;
        }

        if (!result.data) {
          toast.error("Login failed");
          return false;
        }

        const session = toSession(result.data);
        setSession(session);
        setUser(session);
        localStorage.removeItem(PENDING_EMAIL_KEY);
        setPendingEmail(null);
        toast.success(`Welcome back, ${result.data.name}!`);
        return true;
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Login failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Register
  // ---------------------------------------------------------------------------
  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role: UserRole;
    }): Promise<boolean> => {
      try {
        setIsLoading(true);

        if (data.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return false;
        }

        const result = await registerUser(data);

        if (result.error) {
          toast.error(result.error);
          return false;
        }

        if (!result.data) {
          toast.error("Registration failed");
          return false;
        }

        // Store pending email so the verify page knows who to verify
        const email = data.email.toLowerCase().trim();
        setPendingEmail(email);
        localStorage.setItem(PENDING_EMAIL_KEY, email);

        if (result.data.requiresVerification) {
          // Show the dev code in a toast so it's easy to copy during testing
          if (result.data.devCode) {
            toast.success(`Account created! Your verification code is: ${result.data.devCode}`, {
              description: "This code is shown here because email delivery is not yet configured.",
              duration: 30_000,
            });
          } else {
            toast.success(`Account created! Check your email for a verification code.`);
          }
          // Return true so the Register page can navigate to /verify-email
          return true;
        }

        // Fallback: if server skips verification (shouldn't happen), log in directly
        const session = toSession(result.data.user);
        setSession(session);
        setUser(session);
        toast.success(`Welcome, ${result.data.user.name}!`);
        return true;
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Verify Email
  // ---------------------------------------------------------------------------
  const verifyEmail = useCallback(
    async (code: string): Promise<boolean> => {
      const email = pendingEmail || localStorage.getItem(PENDING_EMAIL_KEY);
      if (!email) {
        toast.error("No pending verification. Please register again.");
        return false;
      }

      try {
        setIsLoading(true);
        const result = await verifyEmailCode(email, code);

        if (result.error) {
          toast.error(result.error);
          return false;
        }

        if (!result.data) {
          toast.error("Verification failed");
          return false;
        }

        const session = toSession(result.data.user);
        setSession(session);
        setUser(session);
        localStorage.removeItem(PENDING_EMAIL_KEY);
        setPendingEmail(null);
        toast.success("Email verified! Welcome to PataNyumba.");
        return true;
      } catch (error) {
        console.error("Verify email error:", error);
        toast.error("Verification failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [pendingEmail]
  );

  // ---------------------------------------------------------------------------
  // Resend Verification Code
  // ---------------------------------------------------------------------------
  const resendVerification = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const result = await resendVerificationCode(email);

        if (result.error) {
          toast.error(result.error);
          return false;
        }

        if (result.data?.devCode) {
          toast.success(`New code sent! Your verification code is: ${result.data.devCode}`, {
            description: "This code is shown here because email delivery is not yet configured.",
            duration: 30_000,
          });
        } else {
          toast.success("A new verification code has been sent to your email.");
        }
        return true;
      } catch (error) {
        console.error("Resend verification error:", error);
        toast.error("Failed to resend verification code");
        return false;
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  const logout = useCallback(() => {
    logoutUser();
    clearSession();
    localStorage.removeItem(PENDING_EMAIL_KEY);
    setUser(null);
    setPendingEmail(null);
    toast.success("Logged out successfully");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingEmail,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
