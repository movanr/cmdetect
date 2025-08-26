import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3001",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [anonymousClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;

// Helper to get JWT token (automatically includes active role)
export async function getJWTToken(): Promise<string | null> {
  try {
    const response = await fetch(`${import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3001"}/api/auth/token`, {
      method: "GET",
      credentials: "include",
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    return null;
  } catch (error) {
    console.error("Failed to get JWT token:", error);
    return null;
  }
}

// Helper to switch user role
export async function switchUserRole(role: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3001"}/api/auth/switch-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: data.success };
    } else {
      const error = await response.json();
      return { success: false, error: error.error };
    }
  } catch (error) {
    console.error("Failed to switch role:", error);
    return { success: false, error: "Network error" };
  }
}

