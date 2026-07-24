import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, UserRole } from "@/lib/types";
import {
  getSession,
  setSession,
  clearSession,
} from "@/lib/store";
import { loginUser, registerUser, type UserData } from "@/lib/api";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
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

      const userData = result.data;
      const session: Session = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role as UserRole,
        status: userData.status as "active" | "suspended",
        createdAt: userData.createdAt,
      };

      setSession(session);
      setUser(session);
      toast.success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

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

        // Validation
        if (data.password.length < 6) {
          toast.error("Password must be at least 6 characters");
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

        const userData = result.data;
        const session: Session = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role as UserRole,
          status: userData.status as "active" | "suspended",
          createdAt: userData.createdAt,
        };

        setSession(session);
        setUser(session);
        toast.success(`Account created! Welcome ${userData.name}.`);
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

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}
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
