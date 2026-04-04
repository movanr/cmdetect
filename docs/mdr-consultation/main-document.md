# CMDetect -- Product Overview and Regulatory Positioning

**Document version:** April 2026  
**Purpose:** Briefing document for EU MDR regulatory consultation  
**Appendices:** A (Scoring Specification), B (UI Walkthrough), C (Paper-Form Mapping), D (Data Processing Overview)

---

## 1. Intended Purpose

CMDetect is a software application for the digital collection, organization, and management of information in healthcare environments, such as dental or ENT practices.

The application enables users to document and display patient-related information, as well as data collected during treatment, in a structured and organized manner. In addition, questionnaires can be completed digitally, and the entered information can be stored and displayed.

The software provides functionalities to capture and manage information in standardized formats within the application. It also offers access to general professional content and scientific information, which is presented independently of individual patient data.

The application does not perform any analysis, evaluation, prioritization, or interpretation of the entered data. In particular, it does not provide support for diagnostic or therapeutic decision-making.

The software does not modify, filter, or reorganize data in a way that reflects clinical reasoning or diagnostic structures.

The use of the software is limited to the organizational and documentation-related support of workflows. Responsibility for the professional assessment, interpretation, and use of the recorded information lies entirely with the user.

### Clinical Context

The software digitizes the workflow defined by the **Diagnostic Criteria for Temporomandibular Disorders (DC/TMD)** -- a published, internationally standardized clinical protocol for TMD diagnostics (Schiffman et al., 2014). The DC/TMD protocol exists as a complete paper-based instrument comprising printed questionnaires, structured examination forms, scoring manuals with arithmetic formulas, diagnostic criteria tables, and decision tree flowcharts. CMDetect translates this paper workflow into a digital format without adding clinical interpretation or decision-making capabilities.

---

## 2. Module Overview with Data Flows

The application consists of five functional modules that follow the DC/TMD workflow sequence.

### 2.1 Patient Questionnaire App

A public-facing web application where patients complete questionnaires prior to their appointment.

- **Input:** Patient completes the DC/TMD Symptom Questionnaire (SQ), an interactive pain drawing, and Axis 2 instruments (PHQ-4, GCPS-1M, JFLS-8, OBC).
- **Processing:** Personal identity data (name, date of birth) is encrypted client-side using ECIES (P-256) before transmission. Questionnaire answers are stored as-is in plaintext JSON. No scoring, transformation, or validation of clinical content occurs at this stage.
- **Output:** Stored questionnaire responses and encrypted patient identity linked to the patient record.
- **Computation:** None.

*[Screenshot B.1: Patient questionnaire screen]*

### 2.2 Anamnesis Review (Practitioner Dashboard)

The practitioner reviews submitted questionnaire data and records clinical classifications.

- **Input:** Stored questionnaire responses.
- **Processing:**
  - SQ answers are displayed in a structured questionnaire viewer. An SF verification wizard allows the practitioner to walk through screening answers with the patient and annotate office-use fields.
  - Axis 2 scores are computed: arithmetic operations only -- sums, means, and scale transformations per the published scoring manuals. Specifically: PHQ-4 total and subscale sums; GCPS-1M Characteristic Pain Intensity (CPI) and total disability points (BP); JFLS-8 global mean; OBC total sum. See Appendix A for exact formulas.
  - A static reference table (published cutpoints from literature) is available via a link to the scoring manual page. Numeric scores and reference tables are presented side-by-side but without any pre-applied classification.
  - A "Klinische Einordnung" (Clinical Classification) field is provided per instrument: a dropdown with published classification categories (PHQ-4 severity, GCPS grade) or free-text input (JFLS, OBC) for instruments without established norms. The field is always empty/unselected by default. The software never pre-selects, suggests, or highlights a classification.
- **Output:** Displayed scores and practitioner-recorded classifications.
- **Computation:** Arithmetic only (sums, means, scale transformations). No interpretation, severity classification, or risk assessment applied.

*[Screenshot B.2: Axis 2 score card with clinician determination]*

### 2.3 Clinical Examination (E1--E10)

Guided form-based entry of DC/TMD examination findings.

- **Input:** Practitioner conducts the physical examination and enters findings.
- **Processing:** Structured form fields: measurements in millimeters, yes/no responses, checkbox selections, palpation findings. Data is stored as JSON. The software provides the same structured data entry fields as the DC/TMD paper examination form.
- **Output:** Examination data record.
- **Computation:** None. Pure data entry and storage.

*[Screenshot B.5: Examination section (e.g., palpation)]*

### 2.4 Evaluation (Diagnosis Documentation)

The practitioner reviews reference materials and manually documents diagnoses.

This module contains four sub-components:

| Sub-Component | Function | Patient Data Used? |
|---------------|----------|-------------------|
| **Diagnosis Selector** | Grouped dropdown where the practitioner manually selects a diagnosis, anatomical side, and region. No suggestions, filtering, or prioritization. | No |
| **Documented Diagnoses List** | Shows only diagnoses the practitioner has explicitly selected and confirmed via the "Dokumentieren" button. | No (displays practitioner choices) |
| **Diagnosis Reference List** | Static, read-only accordion list of all 12 DC/TMD diagnoses with their criteria text. When expanded, shows source data badges (e.g., "SF1", "U4B") indicating which questionnaire/examination fields are relevant to each criterion -- identical to the source references in the published criteria table. | Source field references only |
| **Decision Tree View** | Static rendering of the published DC/TMD diagnostic decision tree flowcharts. Not linked to patient data. No highlighting of nodes. | No |

**Critical regulatory detail:** The codebase contains a criteria evaluation engine that can automatically determine whether diagnostic criteria are met based on collected data. In the live application, this engine is used exclusively for resolving source data field references (the badges). The engine's computed result (positive/negative/pending per criterion) is **not displayed** in the user interface. The criteria checklist is rendered in `readOnly` mode with an empty assessment state. No visual indicator (checkmark, color, icon) reveals any automated evaluation result.

**Not active in the current UI:** A "Findings Summary" component and a "Criteria Assessment" workflow (where practitioners would explicitly evaluate each criterion) exist in the codebase but are disabled -- the Findings Summary is commented out, and the Criteria Assessment database table is deployed but not connected to any UI component. These were intentionally deferred pending regulatory guidance.

- **Output:** `documented_diagnosis` records -- one row per practitioner-selected diagnosis, each containing: diagnosis ID, anatomical side, region, the user ID of the documenting practitioner, and a timestamp.
- **Computation:** None applied to output. Source data resolution runs internally but results are not surfaced.

*[Screenshots B.6, B.7: Diagnosis selector + expanded criteria reference]*

### 2.5 Report Generation

Clinical findings report (Befundbericht) generated as DOCX or PDF.

- **Input:** Decrypted patient demographics, SQ answers, examination data, computed questionnaire scores, clinician-documented diagnoses.
- **Processing:**
  - Anamnesis text: template-based German prose generated from SQ yes/no answers using deterministic text substitution (e.g., if SQ1 = "yes" -> "Patient berichtet von Schmerzen im Kieferbereich").
  - Examination findings: formatted display of stored examination data, grouped by section.
  - Questionnaire scores: arithmetic recomputed from raw answers (same formulas as dashboard).
  - Diagnoses: only clinician-documented entries, with ICD-10 code lookup from a static definition table.
- **Output:** Downloadable DOCX or printable PDF document.
- **Computation:** Arithmetic scoring (same as module 2.2) and template-based text generation. No additional interpretation.

*[Screenshot B.8: Report output]*

---

## 3. User Roles and Information Flows

| Role | Access Scope | Key Permissions |
|------|-------------|-----------------|
| **Patient** | Patient questionnaire app only (public URL, session-scoped) | Completes questionnaires. Cannot access scores, practitioner interface, or other patients' data. |
| **Practitioner** (physician, assistant) | Full practitioner interface | Reviews questionnaire answers, enters examination findings, views reference materials, records clinical classifications, selects and documents diagnoses, generates reports. |
| **Receptionist** | Case management only | Creates patient invitations, tracks case status (new/viewed). Cannot access clinical data, questionnaire answers, or decrypt patient identity. |
| **Organization Admin** | Team + key management | Manages user accounts, generates and distributes encryption keys. Clinical access matches practitioner role. |

### Information Flow Principle

No automated data flow crosses the boundary between stored data and clinical meaning. Every transition requires an explicit practitioner action:

- Questionnaire answers -> clinical classification: practitioner manually selects from dropdown
- Examination data -> diagnosis: practitioner manually selects from diagnosis dropdown
- Data + reference materials -> report: only practitioner-documented diagnoses are included

The software acts as the recording medium. The practitioner is the decision-maker at every step.

---

## 4. Regulatory Demarcation Argument

### Pillar 1: Paper-and-Pen Equivalence

The DC/TMD protocol is a published paper-based instrument. In standard clinical practice without software:

1. Patients fill out printed questionnaires (SQ, PHQ-4, GCPS, JFLS, OBC)
2. Practitioners score questionnaires by hand using a calculator and the published scoring manual
3. Practitioners record examination findings on structured paper forms
4. Practitioners consult printed diagnostic criteria tables and decision tree flowcharts
5. Practitioners write their diagnosis on the form

CMDetect digitizes exactly this workflow. Every piece of information the software presents to the practitioner is information they would derive from the paper forms using a calculator and the published scoring manuals. The full mapping is provided in Appendix C.

The only capability that goes beyond the paper workflow is automated report generation from structured data -- a documentation convenience feature equivalent to a form letter or mail merge, not a clinical function.

### Pillar 2: The Scoring Boundary

The software performs the following computations:

| Instrument | Computation | Displayed | NOT Applied |
|-----------|-------------|-----------|-------------|
| PHQ-4 | Sum of 4 items; subscale sums | "Gesamt: 7/12, GAD-2: 4/6, PHQ-2: 3/6" | Severity classification (Normal/Mild/Moderate/Severe) |
| GCPS-1M | CPI = mean x 10; interference + disability day points | "CSI 47/100, BP 3/6" | Grade determination (0-IV) |
| JFLS-8 | Mean of answered items | "⌀ 2.35/10" | Limitation level |
| JFLS-20 | Global mean + subscale means | "⌀ 1.84/10 (Kauen 2.2, ...)" | Limitation level |
| OBC | Sum of 21 items | "42/84" | Risk level |
| Pain Drawing | Count of affected regions | "3 von 5 Regionen" | Risk level / pattern classification |

What the software explicitly does **not** do:

- No severity labels applied to scores (no "Moderate" label next to the number)
- No grade determination applied (no "Grade III" shown)
- No visual indicators of clinical significance (no color coding, traffic lights, or threshold markers)
- No pre-selection of clinician determination dropdowns
- No comparison of patient score against cutpoints (no "above threshold" indicators)

The practitioner sees raw arithmetic results alongside an empty classification field. The classification is always a deliberate, manual clinician action.

**Technical note:** The scoring library functions internally compute classification fields (e.g., `determineGrade()` is called within `calculateGCPS1MScore()`), but the UI components extract and display only the arithmetic fields from the returned objects. The classification values exist in the data objects but are never rendered. See Appendix A for details per instrument.

### Pillar 3: The Diagnosis Workflow

The evaluation module maintains a strict separation between reference information and diagnosis documentation:

1. **Reference materials** (criteria list, decision trees) are presented as static, read-only content -- equivalent to having the published DC/TMD criteria table and flowcharts open on the desk.

2. **Source data badges** (e.g., "SF1", "U4B") indicate which questionnaire or examination fields relate to each criterion. This is the same information printed in the published criteria table column headers. Clicking a badge shows the stored data value -- equivalent to flipping to the relevant page of the paper form.

3. **Diagnosis documentation** is a completely separate interaction: the practitioner opens a grouped dropdown, selects a diagnosis, selects the anatomical side and region, and clicks "Dokumentieren." There is no connection between the reference list and the diagnosis selector -- no suggestions, no pre-filling, no sorting by likelihood.

4. **The report** includes only diagnoses the practitioner has explicitly documented. No other diagnoses appear in the output, regardless of what the examination data might suggest.

### Deliberate Design Decisions for Regulatory De-escalation

- **No contextual linking:** Examination findings and diagnostic criteria are not cross-referenced in the UI. The practitioner must mentally connect the evidence to the criteria, as they would with paper forms.
- **Static reference tables:** Published cutpoints and reference values are presented as separate informational content, not as patient-specific interpretive overlays.
- **Decision trees as pure reference:** The flowchart visualizations render the published DC/TMD decision trees without any highlighting, path tracing, or node activation based on patient data.
- **Disabled features:** A findings summary view and a criteria assessment workflow were built but are intentionally kept out of the live product pending regulatory guidance. The database schema is deployed but not connected to the UI.

---

## 5. Open Questions for the Consultant

We seek specific guidance on the following points, ranked by criticality:

### 5.1 Source Data Badges as Indirect Decision Support?

The evaluation module shows which examination/questionnaire fields are relevant to each diagnostic criterion via source data badges (e.g., "SF1", "U4B"). This is equivalent to the source references printed in the published DC/TMD criteria table. However, clicking a badge reveals the actual stored data value, which is more convenient than flipping between paper forms. **Does providing more convenient access to evidence data constitute decision support under MDCG 2019-11?** If so, what would a compliant alternative look like?

### 5.2 Arithmetic Scoring Alongside Published Reference Tables

The software computes arithmetic scores and provides a link to a page showing the published reference tables (cutpoints) from the scoring manual. The clinician must manually select the classification. **Is this architecture sufficient to remain outside Rule 11, or does the proximity of computed scores to published cutpoints effectively constitute implicit interpretation?**

### 5.3 Criteria Evaluation Engine in the Codebase

The criteria evaluation engine runs client-side for source data resolution. Its diagnostic results (positive/negative/pending) are computed internally but not surfaced in the UI. **Is "capability exists in code but is not user-facing" sufficient for regulatory purposes?** Or does the presence of the code create compliance obligations (e.g., demonstrating it cannot be activated through configuration)?

### 5.4 Template-Based Anamnesis Text Generation

The report module generates German clinical prose from SQ answers using deterministic text substitution: each yes/no answer maps to a fixed sentence template. **Is this considered "analysis" under MDR, or is it equivalent to a form letter / mail merge?**

### 5.5 GCPS Multi-Step Scoring Algorithm

The GCPS scoring converts continuous interference scores to discrete "points" via a published lookup table (e.g., 0-29 -> 0 points, 30-49 -> 1 point). While published and standardized, this is arguably a form of classification. **Does applying published lookup tables cross the boundary from arithmetic to interpretation?**

### 5.6 Disabled Features: Practitioner Criteria Assessment

Database schema and UI components exist for a workflow where practitioners explicitly evaluate each criterion (positive/negative/pending). This workflow would include a mismatch warning when practitioner assessment differs from collected data. Before activating this feature: **What regulatory implications should we consider? Does comparing practitioner input to collected data constitute decision support?**

---

*Appendices: [A -- Scoring Specification](appendix-a-scoring.md) | [B -- UI Walkthrough](appendix-b-screenshots.md) | [C -- Paper-Form Mapping](appendix-c-paper-mapping.md) | [D -- Data Processing Overview](appendix-d-data-processing.md)*
