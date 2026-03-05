/**
 * Get value at dot-separated path from a nested data object.
 * Returns `undefined` if any segment is missing or non-object.
 */
export function getValueAtPath(data: unknown, path: string): unknown {
  const parts = path.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
