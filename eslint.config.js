import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "apps/hasura/**", // Hasura doesn't need linting
      "**/components/ui/**", // shadcn/ui components - generated code
    ],
  },

  // Base JavaScript/TypeScript configuration
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        Buffer: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,

      // TypeScript specific rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // General rules
      "no-console": "off", // Allow console in all projects
      "no-debugger": "warn",
      "no-unused-vars": "off", // Use TypeScript's rule instead
      "prefer-const": "warn",
      "no-var": "error",
    },
  },

  // React-specific configuration for frontend packages
  {
    files: ["apps/frontend/**/*.{ts,tsx}", "apps/patient-frontend/**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        JSX: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        crypto: "readonly",
        // Browser encoding/decoding APIs
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        atob: "readonly",
        btoa: "readonly",
        // Browser types and APIs
        HTMLFormElement: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        Element: "readonly",
        SVGElement: "readonly",
        SVGSVGElement: "readonly",
        BufferSource: "readonly",
        Blob: "readonly",
        File: "readonly",
        FileReader: "readonly",
        IDBDatabase: "readonly",
        IDBOpenDBRequest: "readonly",
        indexedDB: "readonly",
        KeyboardEvent: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,

      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/no-unescaped-entities": "warn", // Warn instead of error for quotes in JSX
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-useless-catch": "warn", // Warn instead of error for useless catch blocks
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Node.js/Backend specific configuration
  {
    files: ["apps/auth-server/**/*.{js,ts}", "packages/**/*.{js,ts}", "tests/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        Buffer: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        // Node.js 18+ fetch API globals
        fetch: "readonly",
        Headers: "readonly",
        HeadersInit: "readonly",
        Request: "readonly",
        Response: "readonly",
        FormData: "readonly",
      },
    },
  },

  // Test files
  {
    files: [
      "**/*.test.{js,ts,tsx}",
      "**/*.spec.{js,ts,tsx}",
      "tests/**/*.{js,ts}",
      "**/test/**/*.{js,ts}",
      "**/*-setup.ts",
      "**/test-*.ts",
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        global: "readonly",
        vi: "readonly",
        vitest: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
      "@typescript-eslint/no-require-imports": "off", // Allow require in test setup
      "no-useless-catch": "off", // Allow useless catch in tests
    },
  },
];
