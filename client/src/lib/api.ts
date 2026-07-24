/**
 * API client for backend communication.
 * Handles JWT token storage, injection, and refresh on every request.
 */

const API_BASE = "/api";

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

const TOKEN_KEY = "pata_auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Generic response shape
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// User data shape returned by the API (password is never included)
// ---------------------------------------------------------------------------

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper – automatically attaches Bearer token when available
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid – clear local state so the app redirects to login
      clearToken();
      return { error: "Session expired. Please log in again." };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || `Request failed (${response.status})` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API error [${path}]:`, error);
    return { error: "Network error. Please check your connection." };
  }
}

// ---------------------------------------------------------------------------
// Auth responses include both a token and the user object
// ---------------------------------------------------------------------------

interface AuthResponse {
  token: string;
  user: UserData;
}

// ---------------------------------------------------------------------------
// Register a new user
// ---------------------------------------------------------------------------

export async function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}): Promise<ApiResponse<UserData>> {
  const result = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.error) return { error: result.error };

  // Persist the token so subsequent requests are authenticated
  if (result.data?.token) {
    setToken(result.data.token);
  }

  return { data: result.data?.user };
}

// ---------------------------------------------------------------------------
// Login with email and password
// ---------------------------------------------------------------------------

export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<UserData>> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (result.error) return { error: result.error };

  // Persist the token
  if (result.data?.token) {
    setToken(result.data.token);
  }

  return { data: result.data?.user };
}

// ---------------------------------------------------------------------------
// Fetch the currently authenticated user (token-based)
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<ApiResponse<UserData>> {
  const result = await apiFetch<{ user: UserData }>("/auth/me");

  if (result.error) return { error: result.error };
  return { data: result.data?.user };
}

// ---------------------------------------------------------------------------
// Get a user by ID (admin or self only)
// ---------------------------------------------------------------------------

export async function getUser(id: string): Promise<ApiResponse<UserData>> {
  const result = await apiFetch<{ user: UserData }>(`/auth/user/${id}`);

  if (result.error) return { error: result.error };
  return { data: result.data?.user };
}

// ---------------------------------------------------------------------------
// Logout – clear the local token
// ---------------------------------------------------------------------------

export function logoutUser(): void {
  clearToken();
}
