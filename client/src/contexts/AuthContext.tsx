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
  getUsers,
  saveUsers,
  generateId,
  initStore,
} from "@/lib/store";
import { toast } from "sonner";

interface AuthContextValue {
  user: Session | null;
  login: (email: string, password: string) => boolean;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);

  useEffect(() => {
    initStore();
    const session = getSession();
    if (session) setUser(session);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      toast.error("Invalid email or password");
      return false;
    }
    if (found.status === "suspended") {
      toast.error("Your account has been suspended");
      return false;
    }
    setSession(found);
    setUser({
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      role: found.role,
      status: found.status,
      createdAt: found.createdAt,
    });
    toast.success(`Welcome back, ${found.name}!`);
    return true;
  }, []);

  const register = useCallback(
    (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role: UserRole;
    }): boolean => {
      if (data.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      const users = getUsers();
      if (users.find((u) => u.email === data.email)) {
        toast.error("Email already registered. Please login.");
        return false;
      }
      const newUser = {
        id: generateId(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        status: "active" as const,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveUsers(users);
      setSession(newUser);
      setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      });
      toast.success(`Account created! Welcome ${newUser.name}.`);
      return true;
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
      value={{ user, login, register, logout, isAuthenticated: !!user }}
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
