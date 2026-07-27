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
  emailVerified: boolean;
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
// Registration response – may include a verification code (dev/demo mode)
// ---------------------------------------------------------------------------

export interface RegisterResponse {
  user: UserData;
  requiresVerification: boolean;
  /** Dev/demo only – the 6-digit code that would be emailed in production */
  devCode?: string;
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
}): Promise<ApiResponse<RegisterResponse>> {
  const result = await apiFetch<AuthResponse & { requiresVerification?: boolean; devCode?: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (result.error) return { error: result.error };

  // Persist the token so subsequent requests (like resend) are authenticated
  if (result.data?.token) {
    setToken(result.data.token);
  }

  return {
    data: {
      user: result.data!.user,
      requiresVerification: result.data?.requiresVerification ?? false,
      devCode: result.data?.devCode,
    },
  };
}

// ---------------------------------------------------------------------------
// Login with email and password
// ---------------------------------------------------------------------------

export interface LoginErrorData {
  requiresVerification?: boolean;
  email?: string;
}

export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<UserData> & { meta?: LoginErrorData }> {
  // Use a raw fetch here so we can inspect the body on 403
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: body.error || `Request failed (${response.status})`,
        meta: {
          requiresVerification: body.requiresVerification,
          email: body.email,
        },
      };
    }

    if (body.token) {
      setToken(body.token);
    }

    return { data: body.user };
  } catch (error) {
    console.error("API error [/auth/login]:", error);
    return { error: "Network error. Please check your connection." };
  }
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

// ---------------------------------------------------------------------------
// File Upload
// ---------------------------------------------------------------------------

export async function uploadImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || `Upload failed (${response.status})` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Upload API error:", error);
    return { error: "Network error during upload" };
  }
}

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export interface VerifyEmailResponse {
  user: UserData;
  message: string;
}

export async function verifyEmailCode(
  email: string,
  code: string
): Promise<ApiResponse<VerifyEmailResponse>> {
  const result = await apiFetch<{ token: string; user: UserData; message: string }>(
    "/auth/verify-email",
    {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }
  );

  if (result.error) return { error: result.error };

  // Upgrade the stored token to the full post-verification JWT
  if (result.data?.token) {
    setToken(result.data.token);
  }

  return { data: { user: result.data!.user, message: result.data!.message } };
}

export async function resendVerificationCode(
  email: string
): Promise<ApiResponse<{ devCode?: string; message: string }>> {
  const result = await apiFetch<{ devCode?: string; message: string }>(
    "/auth/send-verification",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );

  if (result.error) return { error: result.error };
  return { data: result.data };
}

// ---------------------------------------------------------------------------
// Admin API – users
// ---------------------------------------------------------------------------

export async function adminGetUsers(): Promise<ApiResponse<UserData[]>> {
  const result = await apiFetch<{ users: UserData[] }>("/admin/users");

  if (result.error) return { error: result.error };
  return { data: result.data?.users };
}

export async function adminUpdateUser(
  id: string,
  status: "active" | "suspended"
): Promise<ApiResponse<UserData>> {
  const result = await apiFetch<{ user: UserData }>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (result.error) return { error: result.error };
  return { data: result.data?.user };
}

export async function adminDeleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
  const result = await apiFetch<{ message: string }>(`/admin/users/${id}`, {
    method: "DELETE",
  });

  if (result.error) return { error: result.error };
  return { data: result.data };
}

// ---------------------------------------------------------------------------
// Admin API – properties
// ---------------------------------------------------------------------------

export interface PropertyData {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  county: string;
  town: string;
  estate: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  deposit: number;
  amenities: string[];
  images: string[];
  availability: string;
  status: string;
  verified: boolean;
  featured: boolean;
  views: number;
  inquiries: number;
  whatsappClicks: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Public API – featured properties (no auth required)
// ---------------------------------------------------------------------------

export async function getFeaturedProperties(): Promise<ApiResponse<PropertyData[]>> {
  const result = await apiFetch<{ properties: PropertyData[] }>("/admin/properties/featured");

  if (result.error) return { error: result.error };
  return { data: result.data?.properties };
}

// ---------------------------------------------------------------------------
// Public API – all approved properties (no auth required)
// ---------------------------------------------------------------------------

export async function getAllProperties(): Promise<ApiResponse<PropertyData[]>> {
  const result = await apiFetch<{ properties: PropertyData[] }>("/admin/properties/all");

  if (result.error) return { error: result.error };
  return { data: result.data?.properties };
}

export async function getPropertyDetail(id: string): Promise<ApiResponse<PropertyData>> {
  const result = await apiFetch<{ property: PropertyData }>(`/admin/properties/detail/${id}`);

  if (result.error) return { error: result.error };
  return { data: result.data?.property };
}

// ---------------------------------------------------------------------------
// Protected API – add property (landlord/admin)
// ---------------------------------------------------------------------------

export async function addProperty(data: {
  title: string;
  description: string;
  county: string;
  town: string;
  estate: string;
  address: string;
  lat?: number;
  lng?: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  deposit?: number;
  amenities?: string[];
  images?: string[];
}): Promise<ApiResponse<PropertyData>> {
  const result = await apiFetch<{ property: PropertyData }>("/admin/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.error) return { error: result.error };
  return { data: result.data?.property };
}

// ---------------------------------------------------------------------------
// Admin API – all properties (admin only)
// ---------------------------------------------------------------------------

export async function adminGetProperties(): Promise<ApiResponse<PropertyData[]>> {
  const result = await apiFetch<{ properties: PropertyData[] }>("/admin/properties");

  if (result.error) return { error: result.error };
  return { data: result.data?.properties };
}

export async function adminUpdateProperty(
  id: string,
  updates: { status?: string; verified?: boolean; featured?: boolean; availability?: string }
): Promise<ApiResponse<PropertyData>> {
  const result = await apiFetch<{ property: PropertyData }>(`/admin/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  if (result.error) return { error: result.error };
  return { data: result.data?.property };
}

export async function adminDeleteProperty(id: string): Promise<ApiResponse<{ message: string }>> {
  const result = await apiFetch<{ message: string }>(`/admin/properties/${id}`, {
    method: "DELETE",
  });

  if (result.error) return { error: result.error };
  return { data: result.data };
}

// ---------------------------------------------------------------------------
// Admin API – settings (read-only from server; fallback to client defaults)
// ---------------------------------------------------------------------------

export interface SettingsData {
  currency: string;
  appName: string;
  logoUrl: string;
}

export async function adminGetSettings(): Promise<ApiResponse<SettingsData>> {
  const result = await apiFetch<{ settings: SettingsData }>("/admin/settings");

  if (result.error) return { error: result.error };
  return { data: result.data?.settings };
}

// ---------------------------------------------------------------------------
// Landlord API – manage own properties
// ---------------------------------------------------------------------------

export async function getMyProperties(): Promise<ApiResponse<PropertyData[]>> {
  const result = await apiFetch<{ properties: PropertyData[] }>("/admin/properties/landlord");

  if (result.error) return { error: result.error };
  return { data: result.data?.properties };
}

export async function updateMyProperty(
  id: string,
  updates: {
    status?: string;
    availability?: string;
    title?: string;
    description?: string;
    price?: number;
    deposit?: number;
    bedrooms?: number;
    bathrooms?: number;
  }
): Promise<ApiResponse<PropertyData>> {
  const result = await apiFetch<{ property: PropertyData }>(`/admin/properties/landlord/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  if (result.error) return { error: result.error };
  return { data: result.data?.property };
}

export async function deleteMyProperty(id: string): Promise<ApiResponse<{ message: string }>> {
  const result = await apiFetch<{ message: string }>(`/admin/properties/landlord/${id}`, {
    method: "DELETE",
  });

  if (result.error) return { error: result.error };
  return { data: result.data };
}
