import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
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
