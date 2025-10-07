import type { CodegenConfig } from "@graphql-codegen/cli";
import { config as dotenvConfig } from "dotenv";
import path from "path";

// Load .env from repository root
dotenvConfig({ path: path.resolve(__dirname, "../../.env") });

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
