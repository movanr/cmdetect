# Examination Feature

DC-TMD examination engine for temporomandibular disorder assessment.

## Architecture

```
examination/
├── model/           # Semantic types (no UI concerns)
├── content/         # German labels, keyed by semanticId
├── definition/      # Section & question definitions
├── form/            # React Hook Form + Zod integration
├── render/          # UI components
│   ├── adapters/    # Model → display props bridge
│   ├── form-fields/ # Reusable form inputs
│   └── sections/    # Section components (E4, E9)
└── pages/           # Page-level components
```

## Key Concepts

- **semanticId**: Stable identifier for content lookup and diagnosis logic
- **instanceId**: Unique per rendered question (`{questionnaire}.{semantic}:{context}`)
- **QuestionContext**: Clinical context (side, region, movement)
- **EnableWhen**: Conditional visibility (e.g., familiar pain depends on pain=yes)

## Adding a New Section

1. Create definition in `definition/sections/` using question factories
2. Create component in `render/sections/` using form fields
3. Add labels to `content/labels.ts`
4. Register in `ExaminationFormPage.tsx`

## Form Fields

- `YesNoField` - Radio group for yes/no
- `MeasurementField` - Numeric input with unit (mm)
- `TerminatedCheckbox` - Boolean checkbox

## Test Route

`/examination` - Renders the full form for testing
