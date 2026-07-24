/**
 * API client for backend communication
 * Handles authentication and user management
 */

const API_BASE = "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

/**
 * Register a new user
 */
export async function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}): Promise<ApiResponse<UserData>> {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Registration failed" };
    }

    const userData = await response.json();
    return { data: userData };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Network error during registration" };
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<ApiResponse<UserData>> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Login failed" };
    }

    const userData = await response.json();
    return { data: userData };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Network error during login" };
  }
}

/**
 * Get user by ID
 */
export async function getUser(id: string): Promise<ApiResponse<UserData>> {
  try {
    const response = await fetch(`${API_BASE}/auth/user/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Failed to fetch user" };
    }

    const userData = await response.json();
    return { data: userData };
  } catch (error) {
    console.error("Get user error:", error);
    return { error: "Network error fetching user" };
  }
}
