import type { TypedDocumentString } from "./graphql";
import { getJWTToken } from "../lib/auth";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/graphql-response+json",
  };

  // Try to get JWT token for authenticated requests
  const jwtToken = await getJWTToken();

  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

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
    throw new Error("Network response was not ok");
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL Error");
  }

  return result.data as TResult;
}
