import type { TypedDocumentString } from "./graphql";
import { getJWTToken, refreshJWTToken } from "../lib/auth";

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

  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

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

  if (!response.ok) {
    // If the JWT is expired, refresh it and try again
    // TODO: Check mal ab mit den variables, ich glaube das ist so immer noch korrekt vom Type
    let isExpiredError = false; // Hasura response hier checken

    if (response.status === 401 && isExpiredError && !refreshed) {
      await refreshJWTToken();
      return execute(query, variables, true);
    }
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL Error");
  }

  return result.data as TResult;
}
