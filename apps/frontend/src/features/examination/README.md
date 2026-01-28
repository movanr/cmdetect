# Examination-v2 Architecture

## Design Pattern Cheatsheet

| Principle                              | Description                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| **Model is source of truth**           | Don't duplicate structure in UI. Derive everything from model.                  |
| **Project on demand**                  | Call `instancesFromModel()` / `schemaFromModel()` where needed.                 |
| **Components are dumb**                | Renderers receive `name` (path), render input. No business logic.               |
| **Context for layout, path for RHF**   | Use `instance.context` for grouping. Use `instance.path` for form registration. |
| **Single form, step validation**       | One `useForm()` at top. Steps validate via `form.trigger(paths)`.               |
| **FormProvider at wizard level**       | Wrap wizard in `FormProvider`, children use `useFormContext()`.                 |
| **Conditional visibility is a filter** | Filter instances based on watched values, don't hardcode show/hide.             |

## Two Complementary Patterns

### Model Subtrees vs Path Helpers

| Use Case                           | Approach                        |
| ---------------------------------- | ------------------------------- |
| Step component owns a section      | Pass model subtree + `rootPath` |
| Grouping by side/region for layout | Path helpers on instances       |
| Conditional visibility             | Path helpers + `form.watch()`   |
| Cross-form queries                 | Path helpers at top level       |

**Combined usage:**

```typescript
function PainInterviewStep({ model, rootPath }) {
  // Subtree: component owns this section
  const instances = instancesFromModel(rootPath, model);

  // Path helpers: filter within that section
  const helpers = createPathHelpers(instances);
  const left = helpers.bySide("left");
  const right = helpers.bySide("right");
}

// Usage
<PainInterviewStep
  model={E4_MODEL.__children.maxUnassisted}
  rootPath="e4.maxUnassisted"
/>
```

## Current State

| Status | Item                                                       |
| ------ | ---------------------------------------------------------- |
| ✓      | Model primitives (`Q.yesNo`, `Q.measurement`, `Q.boolean`) |
| ✓      | Model nodes (`M.question`, `M.group`)                      |
| ✓      | Projections (`schemaFromModel`, `instancesFromModel`)      |
| ✓      | Path helpers (`createPathHelpers`)                         |
| ✓      | Form hook (`useExaminationForm`, `validateStep`)           |
| ✓      | Input components (`YesNoField`, `MeasurementField`)        |
| ✓      | Step wizard with navigation                                |
| ✓      | Conditional visibility                                     |
| ✓      | Dynamic rendering from `renderType`                        |

## Add new section

To add a new section (e.g., E5):

1. Create sections/e5.model.ts with E5_MODEL and E5_STEPS
2. Add to registry:  
   { id: "e5", label: "E5: Lateralbewegungen", model: E5_MODEL, steps: E5_STEPS }
3. Create components/E5Section.tsx
4. Add to SECTION_COMPONENTS map in ExaminationForm.tsx
5. Update SectionId type: "e4" | "e5" | "e9"

## Issues

Critical Gaps  
 ┌──────────────────────────┬──────────┬───────────────────────────────────────────────────────┐  
 │ Issue │ Priority │ Location │  
 ├──────────────────────────┼──────────┼───────────────────────────────────────────────────────┤  
 │ No tests │ HIGH │ Entire feature lacks unit/integration tests │ (✓)
├──────────────────────────┼──────────┼───────────────────────────────────────────────────────┤  
 │ No data persistence │ HIGH │ Form doesn't connect to GraphQL backend │  
 ├──────────────────────────┼──────────┼───────────────────────────────────────────────────────┤  
 │ Debug code in production │ MEDIUM │ ExaminationForm.tsx:70-76 - visible form values panel │  
 ├──────────────────────────┼──────────┼───────────────────────────────────────────────────────┤  
 │ Path type casting │ LOW │ Multiple files use as FieldPath<FormValues> casts │  
 └──────────────────────────┴──────────┴───────────────────────────────────────────────────────┘
