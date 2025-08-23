import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3001",
  fetchOptions: {
    credentials: "include",
  },
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;

// Helper to get JWT token
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