/**
 * Authentication module — signs in test users and extracts session cookies.
 * Mirrors the pattern from tests/setup/auth-server.ts.
 */

export interface AuthResult {
  sessionCookie: string;
  jwtToken: string;
}

export async function authenticate(
  email: string,
  password: string,
  authServerUrl: string
): Promise<AuthResult> {
  // Step 1: Sign in and get session cookie
  const signInResponse = await fetch(
    `${authServerUrl}/api/auth/sign-in/email`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!signInResponse.ok) {
    throw new Error(
      `Auth failed for ${email}: ${signInResponse.status} ${signInResponse.statusText}`
    );
  }

  const setCookieHeader = signInResponse.headers.get("set-cookie");
  if (!setCookieHeader) {
    throw new Error(`No session cookie received for ${email}`);
  }

  const sessionTokenMatch = setCookieHeader.match(
    /better-auth\.session_token=([^;]+)/
  );
  if (!sessionTokenMatch) {
    throw new Error(`Session token not found in cookie for ${email}`);
  }

  const sessionCookie = sessionTokenMatch[1];

  // Step 2: Convert session to JWT
  const tokenResponse = await fetch(`${authServerUrl}/api/auth/token`, {
    method: "GET",
    headers: {
      Cookie: `better-auth.session_token=${sessionCookie}`,
    },
  });

  if (!tokenResponse.ok) {
    throw new Error(
      `JWT conversion failed for ${email}: ${tokenResponse.status}`
    );
  }

  const tokenData = (await tokenResponse.json()) as { token?: string };
  if (!tokenData.token) {
    throw new Error(`No JWT token received for ${email}`);
  }

  return { sessionCookie, jwtToken: tokenData.token };
}

export async function checkAuthServer(authServerUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${authServerUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
