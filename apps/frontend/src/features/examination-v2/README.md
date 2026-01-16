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
