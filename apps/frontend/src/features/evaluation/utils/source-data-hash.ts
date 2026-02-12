/**
 * Computes a deterministic SHA-256 hash of criteria input data.
 * Used to detect when SQ/examination data has changed and
 * diagnosis results need recomputation.
 */
export async function computeSourceDataHash(
  data: Record<string, unknown>
): Promise<string> {
  const json = JSON.stringify(data, Object.keys(data).sort());
  const buffer = new TextEncoder().encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
