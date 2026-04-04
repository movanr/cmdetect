# Appendix C: Mapping Paper Form <-> Software

This appendix provides a systematic comparison between the published DC/TMD paper-based instruments and their digital implementation in CMDetect.

---

## Questionnaire Data Collection

| Paper Form Element | Software Equivalent | Transformation |
|---|---|---|
| Printed SQ questionnaire (22 screening questions with yes/no and multiple-choice responses) | Patient Questionnaire App -- SQ section with identical questions and answer options | Digital data entry. Same questions, same response options, same conditional logic (e.g., SQ3 only shown if SQ1 = yes). |
| Pain drawing on printed body outline diagrams (5 views) | Interactive SVG canvas with drawing tools (shade, point, arrow) on 5 identical body region images | Digital representation of same task. Stored as vector coordinates instead of ink marks. |
| Printed PHQ-4 form (4 Likert items) | Digital PHQ-4 with same 4 items and 0-3 response scale | Digital data entry. Identical items and response options. |
| Printed GCPS-1M form (8 items: NRS pain scales + interference scales + disability days) | Digital GCPS-1M with same items, NRS sliders for pain/interference, numeric input for days | Digital data entry. Same items, same scales. |
| Printed JFLS-8 form (8 items, 0-10 limitation scale) | Digital JFLS-8 with same items and 0-10 response scale | Digital data entry. Same items, same scale. |
| Printed OBC form (21 items, 0-4 frequency scale) | Digital OBC with same 21 items and 0-4 response scale | Digital data entry. Same items, same scale. |

## Questionnaire Scoring

| Paper Form Element | Software Equivalent | Transformation |
|---|---|---|
| Hand-calculated PHQ-4 total (sum 4 items) using calculator | Automated sum: "Gesamt: X/12" | Arithmetic automation. Same formula, digital display. |
| Hand-calculated PHQ-4 subscales (PHQ-2, GAD-2) | Automated subscale sums: "GAD-2: X/6, PHQ-2: X/6" | Arithmetic automation. Same formula. |
| Hand-calculated GCPS CPI using published formula (mean x 10) | Automated CPI: "CSI X/100" with formula in popover | Arithmetic automation. Same formula from scoring manual. |
| Hand-calculated GCPS interference/disability points using published lookup table | Automated total: "BP X/6" with lookup table in popover | Arithmetic automation. Same lookup tables from scoring manual. |
| Hand-calculated JFLS-8 mean | Automated mean: "⌀ X.XX/10" | Arithmetic automation. Same formula. |
| Hand-calculated OBC total (sum 21 items) | Automated sum: "X/84" | Arithmetic automation. Same formula. |
| Pain drawing: practitioner counts affected regions by visual inspection | Automated count: "X von 5 Regionen" | Counting automation. Same assessment (region count), automated. |

## Clinical Classification

| Paper Form Element | Software Equivalent | Transformation |
|---|---|---|
| Practitioner writes PHQ-4 severity on paper form after consulting cutpoint table | Dropdown: Normal / Leicht / Moderat / Schwer (empty by default) | **Identical clinical action.** Software provides empty field; practitioner selects. Published cutpoint reference available via separate scoring manual page. |
| Practitioner writes GCPS grade on paper form after applying grade algorithm | Dropdown: Grad 0 / Grad I / Grad II / Grad III / Grad IV (empty by default) | **Identical clinical action.** Software provides empty field; practitioner selects. Grade algorithm is in the scoring manual, not applied by software. |
| Practitioner writes JFLS/OBC assessment on paper form | Free-text input field (empty by default) | **Identical clinical action.** Both paper and software: open-ended clinical note. |

## Clinical Examination

| Paper Form Element | Software Equivalent | Transformation |
|---|---|---|
| DC/TMD paper examination form sections E1-E10 (checkboxes, mm measurements, yes/no fields) | Digital E1-E10 sections with structured form fields (checkboxes, numeric inputs, toggle switches) | Digital data entry. Same sections, same fields, same data points. |
| Practitioner writes measurements in mm on paper form | Numeric input fields validated for mm range | Same data, digital input. |
| Practitioner checks yes/no boxes on paper form | Toggle switches / radio buttons | Same data, digital input. |
| E11: free-text examiner comments on paper form | Text area for examiner comments | Same data, digital input. |

## Diagnostic Reference Materials

| Paper Form Element | Software Equivalent | Transformation |
|---|---|---|
| Printed DC/TMD Diagnostic Criteria Table (Version 23 October 2015) listing 12 diagnoses with criteria and source references | DiagnosisReference: expandable accordion list of same 12 diagnoses with criteria text and source data badges (SF#, U#) | **Digital presentation of same content.** Same criteria text, same source references. Digital format allows expanding/collapsing. Clicking source badge shows stored data value (convenience feature beyond paper). |
| Printed DC/TMD Diagnostic Decision Trees (Version 24 January 2014) -- flowchart diagrams | DiagnosisTreeView: SVG rendering of same decision tree flowcharts | **Digital rendering of same flowcharts.** Static visualization, no patient data linked, no node highlighting. |

## Diagnosis Documentation

| Paper Form Element | Software Equivalent | Transformation |
|---|---|---|
| Practitioner writes diagnosis name on paper form | DiagnosisSelector: grouped dropdown where practitioner selects diagnosis + side + region | **Identical clinical action.** Practitioner makes same selection, just via dropdown instead of handwriting. |
| Diagnosis written on form = documented | "Dokumentieren" button click = documented | **Identical clinical action.** Explicit practitioner confirmation. |

## Report Generation

| Paper Form Element | Software Equivalent | Transformation |
|---|---|---|
| Practitioner dictates or writes clinical findings report (Befundbericht) | Software generates structured DOCX/PDF from recorded data | **New capability beyond paper workflow.** Template-based text generation from stored structured data. Content: patient header, anamnesis (generated from SQ answers), formatted exam findings, arithmetic scores, clinician-documented diagnoses with ICD-10. |

---

## Summary of Deviations from Paper

Only three aspects go beyond what the paper workflow provides:

1. **Automated arithmetic:** The software computes sums, means, and scale transformations that would otherwise be done by hand with a calculator. No interpretation is applied.

2. **Convenient source data access:** Clicking a source data badge in the criteria reference shows the stored data value. On paper, the practitioner would flip to the relevant form page. The information is the same; the access is more convenient.

3. **Report generation:** The software generates a structured clinical report from recorded data. On paper, the practitioner would dictate or write this manually. The generated report contains only stored data, arithmetic scores, and clinician-documented diagnoses -- no content is added by the software that the practitioner did not explicitly provide or confirm.

None of these deviations involve clinical interpretation, diagnostic reasoning, or decision support.
