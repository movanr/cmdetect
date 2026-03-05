# @cmdetect/dc-tmd

DC/TMD diagnostic criteria engine. Encodes the Diagnostic Criteria for Temporomandibular Disorders (Schiffman et al. 2014) as a composable criteria DSL, evaluates patient data against those criteria, and categorizes clinical findings.

Used by the practitioner frontend's examination, evaluation, and decision-tree features.

## Development

```bash
pnpm build          # Build with tsup (dual ESM + CJS output)
pnpm dev            # Build in watch mode
pnpm type-check     # Type check without emitting
pnpm test           # Run unit tests (Vitest)
pnpm test:watch     # Run tests in watch mode
```

**Dependency:** `@cmdetect/questionnaires` (for SQ field types used in anamnesis criteria).

## Package Structure

```
src/
├── ids/                    # Constant identifiers
│   ├── anatomy.ts          # Sides, regions, palpation sites, pain types
│   ├── diagnosis.ts        # 12 diagnosis IDs, categories, parent hierarchy
│   └── examination.ts      # E1–E10 field definitions
├── criteria/
│   ├── diagnoses/          # 12 diagnosis definitions (7 files)
│   ├── builders.ts         # Criterion builder functions (DSL)
│   ├── evaluate.ts         # Core criterion evaluator (3-value logic)
│   ├── evaluate-diagnosis.ts  # Orchestrates per-location evaluation
│   ├── field-refs.ts       # Template field reference system
│   ├── clinical-context.ts # ICD-10 codes, validity, clinical comments
│   ├── location.ts         # Per-location evaluation types
│   └── types.ts            # Criterion type definitions
├── categorization/
│   ├── extract.ts          # Categorize data into symptoms/history/signs
│   └── anamnesis-text.ts   # Generate German anamnesis paragraphs from SQ data
├── types/
│   └── results.ts          # Evaluation result types
└── utils.ts                # getValueAtPath utility
```

## Core Concepts

### Criteria DSL

Diagnoses are expressed as composable criterion trees using builder functions:

```typescript
import { field, and, or, any, sq } from "@cmdetect/dc-tmd";

// Leaf: check a single field value
field(sq("SQ1"), { equals: "yes" })

// Composite: combine criteria
and([
  field(sq("SQ1"), { equals: "yes" }),
  or([
    field(sq("SQ3"), { includes: "chewing" }),
    field(sq("SQ3"), { includes: "yawning" }),
  ]),
])

// Quantifier: at least N of a set of fields match
any(siteRefs, { equals: true }, { minCount: 1 })
```

**Criterion types:** `field`, `threshold` (numeric comparison), `computed` (aggregate + compare), `match` (context gating), `and`, `or`, `not`, `any`, `all`.

### Three-Value Evaluation

The evaluator returns one of three statuses:

- **positive** — criterion satisfied
- **negative** — criterion failed
- **pending** — data missing, cannot determine yet

Pending propagates through composites: an `and` with one pending child and no negative children stays pending. This lets the UI show incomplete examinations without premature false negatives.

The `pendingAs` metadata override forces pending results to a default (used for optional criteria like E8 locking that default to positive when unanswered).

### Field Reference Templates

Diagnosis criteria are defined once but evaluated across multiple anatomical locations. Template variables enable this:

```
e9.${side}.${site}.familiarPain
    ↓ resolve with { side: "left", site: "temporalisPosterior" }
e9.left.temporalisPosterior.familiarPain
```

**Variables:**
- `${side}` — `"left"` | `"right"`
- `${region}` — anatomical region (temporalis, masseter, tmj, otherMast, nonMast)
- `${site}` — palpation site for E9/E10 examination sections

The evaluator resolves templates at evaluation time using the current location context. Unresolved templates produce `pending` status.

### Evaluation Pipeline

Diagnosis evaluation is two-level:

1. **Anamnesis** (screening questionnaire) — evaluated once, globally. If negative, the entire diagnosis is negative (gate condition).

2. **Examination** — evaluated per side × region combination. Each location gets its own context (`{ side, region }`), and templates resolve to location-specific field paths.

A diagnosis is positive when anamnesis is positive AND at least one location is positive.

**Cross-diagnosis dependencies:** Some diagnoses require others. Headache Attributed to TMD requires myalgia or arthralgia to also be positive. These constraints are enforced after individual evaluation.

### Diagnoses

**Pain disorders (6):** Myalgia, Local Myalgia, Myofascial Pain with Spreading, Myofascial Pain with Referral, Arthralgia, Headache Attributed to TMD

**Joint disorders (6):** Disc Displacement with Reduction, DD with Reduction + Intermittent Locking, DD without Reduction with Limited Opening, DD without Reduction without Limited Opening, Degenerative Joint Disease, Subluxation

Each diagnosis definition specifies: anamnesis criteria, examination criteria (with template variables), applicable regions, optional sided anamnesis gates, and metadata (labels, source references like "SF1", "U4") for UI traceability.

## API Overview

```typescript
// Evaluate all 12 diagnoses against patient data
import { evaluateAllDiagnoses, ALL_DIAGNOSES } from "@cmdetect/dc-tmd";
const results = evaluateAllDiagnoses(ALL_DIAGNOSES, examinationData, questionnaireData);

// Evaluate a single diagnosis
import { evaluateDiagnosis } from "@cmdetect/dc-tmd";
const result = evaluateDiagnosis(myalgia, examData, sqData);

// IDs and constants
import { SIDE_KEYS, REGIONS, PALPATION_SITES, DIAGNOSES } from "@cmdetect/dc-tmd";

// Clinical metadata (ICD-10, validity, comments)
import { getDiagnosisClinicalContext } from "@cmdetect/dc-tmd";

// Categorize findings into symptoms, history, signs
import { extractClinicalFindings } from "@cmdetect/dc-tmd";

// Generate German anamnesis text from SQ data
import { generateAnamnesisText } from "@cmdetect/dc-tmd";
```
