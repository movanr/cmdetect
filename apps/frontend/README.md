# CMDetect Practitioner Frontend

Authenticated web application for healthcare practitioners (physicians, receptionists, org admins) to manage TMD diagnostic cases. Built with React 19, Vite 7, TanStack Router + Query, Tailwind CSS v4, and shadcn/ui.

## Development

```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Build for production (generates routes, type-checks, bundles)
pnpm type-check       # Type check without emitting
pnpm test             # Run unit tests (Vitest)
pnpm codegen          # Generate GraphQL types from Hasura schema (requires running Hasura)
pnpm lint             # Lint source files
```

**Prerequisites:** Shared packages must be built first (`pnpm build:deps` from root). GraphQL codegen requires a running Hasura instance on port 8080.

## Project Structure

```
src/
├── features/           # Feature modules (see below)
├── routes/             # TanStack Router file-based routes
├── graphql/            # Generated GraphQL types (codegen output, not tracked in git)
├── queries/            # Shared GraphQL query definitions
├── crypto/             # ECIES encryption — key generation, encrypt/decrypt, IndexedDB storage
├── components/         # Reusable components (includes shadcn/ui in components/ui/)
├── contexts/           # React contexts (auth, organization)
├── hooks/              # Custom React hooks
├── config/             # App configuration (i18n with EN/DE translations)
├── lib/                # Utilities
├── assets/             # Static assets
└── main.tsx            # App entry point
```

### Feature Modules

Each feature follows the convention: `index.ts`, `queries.ts`, `types.ts`, `hooks/`, `components/`, `utils/`.

| Module                     | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `case-workflow`            | Patient case management, navigation, and status tracking |
| `examination`              | DC/TMD clinical examination (sections E1–E11)            |
| `evaluation`               | Diagnostic evaluation with interactive decision trees    |
| `decision-tree`            | Visual decision tree rendering for DC/TMD criteria       |
| `pain-drawing-evaluation`  | Pain area scoring and anatomical region analysis         |
| `patient-records`          | Patient record CRUD, invite management, encrypted data   |
| `questionnaire-viewer`     | Anamnesis dashboard with questionnaire score display     |
| `protocol`                 | Examination protocol display                             |
| `team`                     | Team member management                                   |
| `key-setup`                | Organization encryption key generation and BIP39 backup  |

## Key Patterns

- **GraphQL**: Queries live in feature `queries.ts` files and `src/queries/`. Run `pnpm codegen` after changes. Types are generated into `src/graphql/`.
- **Authentication**: JWT via Better Auth. Organization isolation enforced by Hasura via `x-hasura-organization-id` claim.
- **Encryption**: Patient PII is encrypted client-side (ECIES with Noble Curves). See `src/crypto/` for implementation.
- **i18n**: German/English translations in `src/config/i18n.ts`. Primary UI language is German.
- **Path aliases**: `@` → `src/`, `@docs` → `docs/`

## Environment Variables

Create `apps/frontend/.env`:

```
VITE_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
VITE_AUTH_SERVER_URL=http://localhost:3001
```
