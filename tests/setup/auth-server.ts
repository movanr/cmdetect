import { GraphQLClient } from 'graphql-request';

// Auth server configuration
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://91.98.19.187:3001';

// Import centralized test data
import { TestUsers } from './test-data';



interface CachedToken {
  token: string;
  expiresAt: number;
}

// Token cache to avoid re-authenticating for each test
const tokenCache = new Map<string, CachedToken>();

/**
 * Authenticate with the auth server and return JWT token
 * Uses two-step process: session token -> JWT conversion
 */
export async function authenticateUser(email: string, password: string): Promise<string> {
  const cacheKey = email;
  
  // Check if we have a valid cached token
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }
  
  try {
    // Step 1: Get session token
    const signInResponse = await fetch(`${AUTH_SERVER_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    if (!signInResponse.ok) {
      throw new Error(`Auth failed: ${signInResponse.status} ${signInResponse.statusText}`);
    }
    
    // Extract session cookie from response
    const setCookieHeader = signInResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      throw new Error('No session cookie received from auth server');
    }
    
    // Parse session token from cookie header
    const sessionTokenMatch = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (!sessionTokenMatch) {
      throw new Error('Session token not found in cookie header');
    }
    
    const sessionToken = sessionTokenMatch[1];
    console.log('Session token received:', sessionToken.substring(0, 20) + '...');
    
    // Step 2: Convert session token to JWT
    const tokenResponse = await fetch(`${AUTH_SERVER_URL}/api/auth/token`, {
      method: 'GET',
      headers: {
        'Cookie': `better-auth.session_token=${sessionToken}`,
      },
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`JWT conversion failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.token) {
      throw new Error('No JWT token received from /api/auth/token endpoint');
    }
    
    console.log('JWT token received:', tokenData.token.substring(0, 30) + '...');
    
    // Cache the JWT token (typically expires in 1h, cache for 50min for safety)
    const expiresAt = Date.now() + (50 * 60 * 1000); // 50 minutes
    tokenCache.set(cacheKey, {
      token: tokenData.token,
      expiresAt,
    });
    
    return tokenData.token;
    
  } catch (error) {
    throw new Error(`Failed to authenticate user ${email}: ${error}`);
  }
}

/**
 * Create an authenticated GraphQL client for a test user
 */
export async function createAuthenticatedClient(userKey: keyof typeof TestUsers): Promise<GraphQLClient> {
  const user = TestUsers[userKey];
  if (!user) {
    throw new Error(`Unknown test user: ${userKey}`);
  }
  
  const token = await authenticateUser(user.email, user.password);
  const HASURA_ENDPOINT = process.env.HASURA_TEST_ENDPOINT || 'http://91.98.19.187:8080/v1/graphql';
  
  return new GraphQLClient(HASURA_ENDPOINT, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * Clear the token cache (useful for testing auth failures)
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}

/**
 * Check if auth server is available
 */
export async function isAuthServerAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${AUTH_SERVER_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}