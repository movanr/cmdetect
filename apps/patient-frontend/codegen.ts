import type { CodegenConfig } from "@graphql-codegen/cli";

// Debug: Check what Node.js sees
console.log("[CODEGEN DEBUG] HASURA_GRAPHQL_ADMIN_SECRET:", process.env.HASURA_GRAPHQL_ADMIN_SECRET ? `set (length: ${process.env.HASURA_GRAPHQL_ADMIN_SECRET.length})` : "NOT SET");

const config: CodegenConfig = {
  schema: {
    [process.env.VITE_HASURA_GRAPHQL_URL || "http://localhost:8080/v1/graphql"]: {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET || "",
      },
    },
  },
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  ignoreNoDocuments: true,
  generates: {
    "./src/graphql/": {
      preset: "client",
      config: {
        documentMode: "string",
        useTypeImports: true,
      },
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
