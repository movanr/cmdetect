import type { TypedDocumentString } from "./graphql";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

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
