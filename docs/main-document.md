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

The application consists of seven functional modules that follow the DC/TMD workflow sequence. The practitioner interface enforces a sequential workflow with gated progression:

**Anamnesis Review → Examination → Evaluation → Documentation**

Each step must be completed before the next becomes accessible. This mirrors the prescribed sequence of the DC/TMD protocol itself, which specifies: questionnaire review and screening verification first, then clinical examination, then diagnostic evaluation. The practitioner chooses between two examination modes: a step-by-step guided wizard (one section at a time with embedded protocol instructions) or a form sheet view (all sections accessible at once).

### 2.1 Patient Questionnaire App

A public-facing web application where patients complete questionnaires prior to their appointment. Questions are presented one at a time.

- **Input:** Patient enters personal data (name, date of birth) and completes the DC/TMD Symptom Questionnaire (SQ), an interactive pain drawing, and Axis 2 instruments (PHQ-4, GCPS-1M, JFLS-8, OBC).
- **Processing:** Personal identity data (name, date of birth) is encrypted client-side using ECIES (P-256) before transmission. Questionnaire answers are stored as-is in plaintext JSON. No scoring, transformation, or validation of clinical content occurs at this stage. The SQ uses the built-in skip logic from the published paper form -- directly translated from printed instructions such as "If you answered 'No', skip to question 5" into automatic navigation between questions. The skip rules are static and defined by the DC/TMD publication; the software does not introduce any additional branching logic.
- **Output:** Stored questionnaire responses and encrypted patient identity linked to the patient record.
- **Computation:** None.

*[Screenshot B.1: Patient questionnaire screen]*

### 2.2 Anamnesis Review (Practitioner Dashboard)

The practitioner reviews submitted questionnaire data and records clinical classifications.

- **Input:** Stored questionnaire responses.
- **Processing:**

  **SQ (Axis 1):**
  - Domain summary cards group SQ answers by the five clinical symptom categories (pain, headache, joint noises, jaw locking closed, jaw locking open). Cards with positive symptoms are visually highlighted (blue); negative categories appear muted. Each card displays the patient's raw answers with formatted text labels -- durations (e.g., "2 Jahre, 3 Monate"), frequency labels (e.g., "intermittierend"), and modification checklists (e.g., "Kauen harter Nahrung: ja"). No scoring or clinical logic is applied; this is data reformatting and visual grouping. *[Screenshot B.4]*
  - An SF verification wizard allows the practitioner to walk through SQ screening answers with the patient and annotate office-use fields (side assignments, confirmations).

  **Axis 2 Questionnaires:**
  - Scores are computed: arithmetic operations only -- sums, means, and scale transformations per the published scoring manuals. Specifically: PHQ-4 total and subscale sums; GCPS-1M Characteristic Pain Intensity (CPI) and total disability points (BP); JFLS-8 global mean; OBC total sum. For the multi-step instruments (GCPS), the exact formula is displayed inline next to the score via a tooltip popover (e.g., "CSI = (Frage 2 + 3 + 4) / 3 × 10"), so the practitioner sees exactly how the number was derived. See Appendix A for exact formulas. *[Screenshot B.3]*
  - A "Klinische Einordnung" (Clinical Classification) field is provided per instrument: a dropdown with published classification categories (PHQ-4 severity, GCPS grade) or free-text input (JFLS, OBC) for instruments without established norms. The field is always empty/unselected by default. The software never pre-selects, suggests, or highlights a classification. *[Screenshot B.2]*

- **Output:** Displayed scores and practitioner-recorded classifications.
- **Computation:** Arithmetic only (sums, means, scale transformations). No interpretation, severity classification, or risk assessment applied.

### 2.3 Embedded Scoring Manual

The published DC/TMD Self-Report Scoring Manual (Ohrbach & Knibbe, Version March 2021) is embedded in the application as a browsable reference page, accessible via links from the Axis 2 score cards.

- **Content:** The full scoring manual text -- instrument descriptions, scoring rules, interpretation guidelines, normative data, reference tables with published cutpoints, and scoring worksheets. The content covers instruments beyond those currently implemented (e.g., PHQ-9, GAD-7, PHQ-15) as these are part of the original publication.
- **Source:** The manual text was extracted from the official publication and is hosted as markdown content within the application. It is not a link to an external source.
- **Presentation:** Read-only markdown rendering with section navigation. Accessible from Axis 2 score cards via "Scoring-Anleitung" link that deep-links to the relevant instrument section.
- **Computation:** None. Static reference content, not connected to patient data.

*See Section 5 (Open Questions) regarding regulatory implications of embedding published reference materials.*

### 2.4 Clinical Examination (E1--E10)

Guided form-based entry of DC/TMD examination findings.

- **Input:** Practitioner conducts the physical examination and enters findings.
- **Processing:** Structured form fields: measurements in millimeters, yes/no responses, checkbox selections, palpation findings. Data is stored as JSON. The software provides the same structured data entry fields as the DC/TMD paper examination form. In the step-by-step wizard mode, the software validates that all required fields in a section are filled before allowing progression to the next section (missing data validation only -- no plausibility checks or clinical validation of entered values). Fields that are conditionally disabled based on a prior answer in the same section (e.g., "familiar pain" is irrelevant when "pain" is marked as absent) are excluded from validation. The practitioner can skip validation at each individual step and proceed with incomplete data. The sequence of examination sections is entirely static -- it does not change based on the patient's clinical data or the practitioner's findings. Every practitioner always sees the same sections in the same order, regardless of input.
- **Output:** Examination data record.
- **Computation:** None. Pure data entry, missing data validation, and storage.

Each examination section includes **embedded protocol instructions** derived from the DC/TMD Examiner Protocol -- step-by-step procedure guidance, verbatim patient scripts (text to be read aloud to the patient), and protocol figure illustrations. These are displayed inline at the relevant examination items.

*[Screenshot B.5: Examination section with embedded protocol instructions]*

### 2.5 Embedded Examination Protocol

The DC/TMD Examiner Protocol is embedded in the application as a standalone browsable reference, in addition to the inline instructions within examination sections (2.4).

- **Content:** The full protocol text organized into 8 sections: introduction, general instructions, procedure descriptions, quick specifications, complete specifications for examination items U1--U9, pain interview procedures, illustrations/figures, and examination instructions with verbatim patient scripts. Protocol figures (anatomical illustrations, measurement technique photos) are embedded as images.
- **Source:** Section 5 (complete specifications, U1--U9) uses official German text extracted from the published DC/TMD protocol. Sections 1--4, 6--8 are unofficial German translations prepared by the development team. Protocol figures are reproduced from the official publication.
- **Presentation:** Read-only markdown rendering with section navigation and inline figure display.
- **Computation:** None. Static reference content, not connected to patient data.

### 2.6 Evaluation (Diagnosis Documentation)

The practitioner reviews reference materials and manually documents diagnoses. No patient data is used by any of the sub-components described below; they operate on static reference content and practitioner input only.

- **Diagnosis Selector:** Grouped dropdown where the practitioner manually selects a diagnosis, anatomical side, and region. No suggestions, filtering, or prioritization.
- **Documented Diagnoses List:** Shows only diagnoses the practitioner has explicitly selected and confirmed via the "Dokumentieren" button.
- **Diagnosis Reference List:** Static, read-only accordion list of all 12 DC/TMD diagnoses with their criteria text. When expanded, shows non-interactive source data badges (e.g., "SF1", "U4B") indicating which questionnaire/examination fields are relevant to each criterion -- identical to the source references in the published criteria table.
- **Decision Tree View:** Static rendering of the published DC/TMD diagnostic decision tree flowcharts. Not linked to patient data. No highlighting of nodes.

**Output:** `documented_diagnosis` records -- one row per practitioner-selected diagnosis, each containing: diagnosis ID, anatomical side, region, the user ID of the documenting practitioner, and a timestamp.

*[Screenshots B.6, B.7: Diagnosis selector + expanded criteria reference]*

### 2.7 Report Generation

Clinical findings report (Befundbericht) generated as DOCX or PDF.

- **Input:** Decrypted patient demographics, SQ answers, examination data, computed questionnaire scores, practitioner Axis 2 classifications, clinician-documented diagnoses.
- **Processing:**
  - Anamnesis text: template-based German prose generated from SQ yes/no answers using deterministic text substitution (e.g., if SQ1 = "yes" -> "Patient berichtet von Schmerzen im Kieferbereich").
  - Examination findings: formatted display of stored examination data, grouped by section.
  - Questionnaire scores: arithmetic recomputed from raw answers (same formulas as dashboard).
  - Axis 2 classifications: the practitioner's clinical classifications as recorded in the dashboard (severity, grade, or free-text assessment per instrument).
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
3. Practitioners record examination findings on structured paper forms, following the published examiner protocol
4. Practitioners consult printed diagnostic criteria tables and decision tree flowcharts
5. Practitioners write their diagnosis on the form

CMDetect digitizes exactly this workflow. Every piece of information the software presents to the practitioner is information they would derive from the paper forms using a calculator and the published scoring manuals. The full mapping is provided in Appendix C.

Capabilities that go beyond the paper workflow:
- **Automated report generation** from structured data -- a documentation convenience feature equivalent to a form letter or mail merge, not a clinical function.
- **SQ domain summary cards** that group and format questionnaire answers by clinical symptom category -- presents the same answers in a structured layout, but does not compute scores or apply clinical logic.
- **Template-based anamnesis text** in the report -- deterministic sentence generation from yes/no answers (see Section 5.3).

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

### Pillar 3: The Diagnosis Workflow

The evaluation module maintains a strict separation between reference information and diagnosis documentation:

1. **Reference materials** (criteria list, decision trees) are presented as static, read-only content -- equivalent to having the published DC/TMD criteria table and flowcharts open on the desk.

2. **Source data badges** (e.g., "SF1", "U4B") are displayed as non-interactive labels next to each criterion, indicating which questionnaire or examination fields relate to it. This is the same information printed in the published criteria table column headers.

3. **Diagnosis documentation** is a completely separate interaction: the practitioner opens a grouped dropdown, selects a diagnosis, selects the anatomical side and region, and clicks "Dokumentieren." There is no connection between the reference list and the diagnosis selector -- no suggestions, no pre-filling, no sorting by likelihood.

4. **The report** includes only diagnoses the practitioner has explicitly documented. No other diagnoses appear in the output, regardless of what the examination data might suggest.

### Deliberate Design Decisions for Regulatory De-escalation

- **No contextual linking:** Examination findings and diagnostic criteria are not cross-referenced in the UI. The practitioner must mentally connect the evidence to the criteria, as they would with paper forms.
- **Static reference tables:** Published cutpoints and reference values are presented as separate informational content, not as patient-specific interpretive overlays.
- **Decision trees as pure reference:** The flowchart visualizations render the published DC/TMD decision trees without any highlighting, path tracing, or node activation based on patient data.

---

## 5. Open Questions for the Consultant

We seek specific guidance on the following points, ranked by criticality:

### 5.1 Embedded Published Reference Materials

The application embeds two published DC/TMD reference documents as browsable content hosted on our own servers:

- **Self-Report Scoring Manual** (Ohrbach & Knibbe, 2021): The full manual text including instrument descriptions, scoring rules, interpretation guidelines, normative data, and reference tables with published cutpoints. Linked from each Axis 2 score card.
- **Examiner Protocol**: Step-by-step examination procedures, patient scripts, and anatomical illustrations. Section 5 (U1--U9) uses official German text; other sections are unofficial translations. Protocol instructions and figures are also embedded inline within the examination forms at the relevant items.

These are not links to external sources -- the content is extracted from the publications and hosted as part of the application.

**Questions:**
- Does embedding published clinical reference materials within the application change the regulatory classification of the software? Is there a difference between "practitioner has the book on their desk" and "the book is displayed within the software"?
- The scoring manual contains interpretation guidelines and severity cutpoints. When displayed on a page that is linked from a score card showing the patient's computed score, does this proximity constitute implicit decision support -- even though the classification is not applied automatically?
- Does embedding protocol instructions directly within the examination form (as step-by-step guidance for the practitioner) constitute the software "guiding" clinical procedure in a way that has regulatory implications?

### 5.2 Arithmetic Scoring Alongside Published Cutpoint Tables

The software computes arithmetic scores and provides a link to the embedded scoring manual page showing the published reference tables (cutpoints). The clinician must manually select the classification. **Is this architecture sufficient to remain outside Rule 11, or does the proximity of computed scores to published cutpoints effectively constitute implicit interpretation?**

### 5.3 Template-Based Text Generation from Questionnaire Answers

Two features generate formatted text from SQ answers:

- **SQ domain summary cards** on the anamnesis dashboard: group and format SQ answers by clinical symptom category (pain, headache, joint noises, jaw locking closed, jaw locking open), displaying durations, frequency labels, and modification checklists. This is data reformatting, not computation -- but the grouping mirrors diagnostic categories.
- **Report anamnesis text**: generates German clinical prose from SQ yes/no answers using deterministic text substitution (each answer maps to a fixed sentence template).

**Is deterministic text generation / data reformatting considered "analysis" under MDR, or is it equivalent to a form letter?** Does grouping answers by clinical symptom categories constitute organizing data in a way that "reflects clinical reasoning or diagnostic structures" (which the intended purpose explicitly excludes)?

### 5.4 GCPS Multi-Step Scoring Algorithm

The GCPS scoring bins the interference score (an integer in the range 0--100) into one of four "point" categories via a published lookup table (e.g., 0-29 -> 0 points, 30-49 -> 1 point). While published and standardized, this many-to-one mapping is arguably a form of classification. **Does applying published lookup tables cross the boundary from arithmetic to interpretation?**

### 5.5 Sequential Workflow with Gated Progression

The application enforces a fixed sequential workflow: anamnesis review must be completed before the examination unlocks, and the examination must be completed before the evaluation becomes accessible. This mirrors the DC/TMD protocol's own prescribed order, but the software actively prevents the practitioner from proceeding out of sequence. **Does enforcing a clinical workflow sequence constitute "guiding" clinical procedure in a regulatory sense, or is it equivalent to a structured paper form where pages are meant to be completed in order?**

### 5.6 Automated Skip Logic in the Patient Questionnaire

The SQ questionnaire is presented to the patient one question at a time. The next question shown depends on the patient's previous answer, following the skip instructions printed on the official DC/TMD paper form (e.g., "If you answered 'No', skip to question 5"). The software translates these static printed instructions into automatic navigation between questions -- no additional branching logic is introduced beyond what is specified in the publication. **Does automating the skip logic from a published paper form constitute "filtering" or "reorganizing" data, or is it equivalent to following the printed navigation instructions the patient would otherwise follow manually?**

### 5.7 Features Under Consideration -- Regulatory Boundaries

Several features exist in the codebase but are not active in the current product. Before activation, we seek guidance on which would change the regulatory classification:

1. **Practitioner Criteria Assessment:** A workflow where practitioners explicitly evaluate each diagnostic criterion as positive/negative/pending. The software would display a mismatch warning when the practitioner's assessment differs from the collected examination/questionnaire data. **Does comparing practitioner input to collected data constitute decision support?**

2. **Findings Summary:** A structured overview that organizes examination findings and questionnaire answers by the five SQ symptom categories (pain, headache, joint noises, jaw locking closed, jaw locking open) and functional assessments (maximum opening, lateral/protrusive movements). This regroups raw data from multiple sources into a clinically oriented summary. **Does restructuring collected data into diagnostic categories cross the line from documentation into decision support?**

3. **Source Data Drill-Down:** Making the source data badges in the criteria reference interactive, so that clicking a badge (e.g., "U4B") reveals the stored examination data value for that field. **Does providing convenient data lookup within the criteria context constitute decision support?**

---

*Appendices: [A -- Scoring Specification](appendix-a-scoring.md) | [B -- UI Walkthrough](appendix-b-screenshots.md) | [C -- Paper-Form Mapping](appendix-c-paper-mapping.md) | [D -- Data Processing Overview](appendix-d-data-processing.md)*
