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
  type UserData,
} from "@/lib/api";
import { toast } from "sonner";

interface AuthContextValue {
  user: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

  // ---------------------------------------------------------------------------
  // On mount – verify the stored JWT with the server and restore the session.
  // This replaces the old "trust localStorage blindly" approach.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();

      if (!token) {
        // No token stored – user is not logged in
        setIsLoading(false);
        return;
      }

      // Verify the token server-side and get fresh user data
      const result = await getCurrentUser();

      if (result.error || !result.data) {
        // Token is expired or invalid – clear everything
        logoutUser();
        clearSession();
        setUser(null);
      } else {
        const session = toSession(result.data);
        setSession(session);
        setUser(session);
      }

      setIsLoading(false);
    }

    restoreSession();
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
          toast.error(result.error);
          return false;
        }

        if (!result.data) {
          toast.error("Login failed");
          return false;
        }

        const session = toSession(result.data);
        setSession(session);
        setUser(session);
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

        const session = toSession(result.data);
        setSession(session);
        setUser(session);
        toast.success(`Account created! Welcome, ${result.data.name}.`);
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
  // Logout
  // ---------------------------------------------------------------------------
  const logout = useCallback(() => {
    logoutUser();   // clears the JWT from localStorage
    clearSession(); // clears the session object from localStorage
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
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
