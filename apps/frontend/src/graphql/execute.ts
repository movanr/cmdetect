import type { TypedDocumentString } from "./graphql";
import { getJWTToken, refreshJWTToken, handleSessionExpired } from "../lib/auth";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
  refreshed: boolean = false
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Try to get JWT token for authenticated requests
  const jwtToken = await getJWTToken();

  if (!jwtToken) {
    handleSessionExpired();
    throw new Error("Session expired");
  }

  headers["Authorization"] = `Bearer ${jwtToken}`;

  // Extract operation name for network tab visibility
  const operationName = String(query).match(/(?:query|mutation|subscription)\s+(\w+)/)?.[1];

  const baseUrl = import.meta.env.VITE_HASURA_GRAPHQL_URL || "http://localhost:8080/v1/graphql";
  const url = operationName ? `${baseUrl}?op=${operationName}` : baseUrl;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (response.status === 401 && !refreshed) {
    const errorBody = await response.json().catch(() => ({}));
    if (typeof errorBody?.message === "string" && errorBody.message.includes("JWTExpired")) {
      const newToken = await refreshJWTToken();
      if (!newToken) {
        handleSessionExpired();
        throw new Error("Session expired");
      }
      return execute(query, variables, true);
    }
    throw new Error(errorBody?.message || "Unauthorized");
  }

  const result = await response.json();

  if (result.errors) {
    const firstError = result.errors[0];
    // Hasura returns JWT errors as HTTP 200 with a GraphQL error body (not HTTP 401)
    const isJwtError =
      firstError?.extensions?.code === "invalid-jwt" ||
      firstError?.message?.includes("JWTExpired");
    if (isJwtError && !refreshed) {
      const newToken = await refreshJWTToken();
      if (!newToken) {
        handleSessionExpired();
        throw new Error("Session expired");
      }
      return execute(query, variables, true);
    }
    throw new Error(firstError?.message || "GraphQL Error");
  }

  return result.data as TResult;
}
