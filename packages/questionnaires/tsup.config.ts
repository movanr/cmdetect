import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  /**
   * ESM/CJS BRIDGE: Dual format output
   *
   * We build both ESM and CJS because:
   * - apps/frontend (ESM) uses "import" → gets dist/index.js
   * - apps/auth-server (CommonJS) uses "require" → gets dist/index.cjs
   *
   * If auth-server switches to ESM (e.g., Hono/Elysia with "type": "module"),
   * you can simplify to: format: ["esm"]
   */
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  bundle: true,
  /**
   * DOCKER COMPATIBILITY: Bundle all dependencies
   *
   * We bundle zod into the output because Docker only copies dist/ files,
   * not node_modules. This makes the package self-contained.
   *
   * This is good practice regardless of ESM/CJS - keeps the package portable.
   */
  noExternal: ["zod"],
});
