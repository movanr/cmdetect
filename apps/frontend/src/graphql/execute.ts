import type { TypedDocumentString } from "./graphql";
import { getJWTToken } from "../lib/auth";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Try to get JWT token for authenticated requests
  const jwtToken = await getJWTToken();

  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  // Extract invite token from current URL query parameters if present
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('invite_token');
  
  console.log("Current URL search params:", window.location.search);
  console.log("Extracted invite token:", inviteToken);
  
  if (inviteToken) {
    headers["X-Hasura-Invite-Token"] = inviteToken;
    console.log("Added X-Hasura-Invite-Token header:", inviteToken);
  } else {
    console.log("No invite token found in URL");
  }
  
  console.log("GraphQL request headers:", headers);

  const response = await fetch(
    import.meta.env.VITE_HASURA_GRAPHQL_URL ||
      "http://localhost:8080/v1/graphql",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL Error");
  }

  return result.data as TResult;
}
