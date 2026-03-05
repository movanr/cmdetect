# CMDetect Patient Frontend

Public-facing questionnaire application for patients. No authentication — patients access the app via invite links with time-limited tokens. Patient PII is encrypted client-side (ECIES) before submission; questionnaire answers are submitted via anonymous Hasura actions.

Built with React 19, Vite 7, TanStack Router + Query, Tailwind CSS v4, and Framer Motion.

## Development

```bash
pnpm dev              # Start dev server (port 3002)
pnpm build            # Build for production (generates routes, type-checks, bundles)
pnpm test             # Run unit tests (Vitest)
pnpm codegen          # Generate GraphQL types from Hasura schema (requires running Hasura)
pnpm type-check       # Type check without emitting
pnpm lint             # Lint source files
```

**Prerequisites:** Shared packages must be built first (`pnpm build:deps` from root). GraphQL codegen requires a running Hasura instance on port 8080.

## Project Structure

```
src/
├── features/
│   ├── questionnaire-engine/   # Generic wizard, progress header, question renderers
│   ├── sq/                     # Screening Questionnaire (custom wizard with conditional logic)
│   ├── pain-drawing/           # Konva canvas-based pain drawing wizard
│   └── questionnaire-core/     # Shared questionnaire types
├── routes/
│   ├── __root.tsx              # Root layout (minimal — just an Outlet)
│   ├── index.tsx               # Main patient flow (single-page, step-based)
│   └── -components/            # Route-local components (PersonalDataForm)
├── crypto/                     # ECIES encryption for patient PII
├── queries/                    # GraphQL mutations and queries (Hasura actions)
├── graphql/                    # Generated GraphQL types (codegen output, not tracked in git)
├── components/                 # Shared components (CMDetectLogo, shadcn/ui)
├── lib/                        # Utilities
├── index.css                   # Global styles
└── main.tsx                    # App entry point
```

## Patient Flow

The entire app is a single-page step flow at `/?token=<invite_token>`:

1. **Token validation** — validates invite token via `validateInviteToken` action, receives organization public key and name. Checks `getPatientProgress` to resume where the patient left off.
2. **Consent** — GDPR consent with version tracking. Declining shows a blocked screen with option to return.
3. **Personal data** — name and date of birth, encrypted client-side with the organization's public key before submission.
4. **Questionnaires** — stepped through in order with animated transitions:
   - SQ (Screening Questionnaire) — custom wizard with `enableWhen` conditional question logic
   - Pain Drawing — full-viewport Konva canvas for marking pain areas
   - GCPS-1M, JFLS-8, PHQ-4, JFLS-20, OBC — generic wizard with progress tracking
5. **Completion** — summary screen. Patient can close the tab.

**Early exit:** If all SQ screening questions (SQ1, SQ5, SQ8, SQ9, SQ13) are answered "no", remaining questionnaires are submitted as empty and the flow completes early.

## Feature Modules

| Module                 | Description                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `questionnaire-engine` | Generic wizard with linear navigation, progress header, and question renderers (choice, numeric, scale) |
| `sq`                   | Screening Questionnaire wizard with `enableWhen` conditional logic and section-based navigation  |
| `pain-drawing`         | Konva canvas drawing with undo/redo, toolbar, instruction/image/review steps                    |
| `questionnaire-core`   | Shared submission types                                                                         |

## Key Patterns

- **Anonymous access**: No authentication. All GraphQL operations go through Hasura actions (handled by auth-server) using the `public` role. The invite token is the only credential.
- **Client-side encryption**: Patient PII (name, date of birth) is encrypted using ECIES (Noble Curves) with the organization's public key before leaving the browser. See `src/crypto/`.
- **Resumable flow**: `getPatientProgress` returns which steps are complete (consent, personal data, submitted questionnaire IDs), so patients can resume after closing the browser.
- **Questionnaire flow config**: Order and enablement controlled by `features/questionnaire-engine/config/flowConfig.ts`, sourcing from `@cmdetect/questionnaires`.

## Environment Variables

Create `apps/patient-frontend/.env`:

```
VITE_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
```
