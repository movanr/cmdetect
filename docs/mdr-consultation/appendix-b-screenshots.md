# Appendix B: Screenshots / UI Walkthrough

This appendix describes annotated screenshots of the regulatory-critical screens. Screenshots are to be captured from the live application and inserted at the placeholder positions below.

---

## B.1 Patient Questionnaire -- SQ Question Screen

**What to capture:** The patient-facing questionnaire interface showing a sample SQ question (e.g., the pain location question SQ3 or SQ4 with its matrix response options).

**Annotations:**
- "Patient's own device. Public URL, no authentication required."
- "Answers recorded verbatim -- no scoring, no validation of clinical content."
- "Patient cannot see any computed scores or practitioner interface."

**Regulatory relevance:** Establishes that the patient-facing module is pure data collection.

---

## B.2 Axis 2 Score Card -- Numeric Scores + Clinician Determination

**What to capture:** The Anamnesis dashboard showing at least two Axis 2 score cards (ideally PHQ-4 and GCPS-1M side by side), with the "Klinische Einordnung" (Clinical Classification) section visible. The dropdown should be in its default empty/unselected state.

**Annotations:**
- On the numeric score: "Arithmetic result only. No severity label, no color coding."
- On the CSI/BP display: "CPI and total disability points shown as numbers. Grade (0-IV) is NOT computed or displayed."
- On the empty dropdown: "Clinician Determination -- always empty by default. Practitioner must manually select classification."
- On the note field: "Optional free-text note for clinician's reasoning."
- Point to the `(i)` popover icon: "Formula explanation on hover -- shows arithmetic, not interpretation."

**Regulatory relevance:** This is the most critical screenshot. It demonstrates the boundary between software computation (arithmetic) and clinician judgment (classification).

---

## B.3 Score Card Expanded -- Raw Answers with Pips

**What to capture:** One score card (e.g., PHQ-4) expanded to show the individual question answers in the detail table. The "pip" visualization (small dots representing the response on the scale) should be visible.

**Annotations:**
- "Expandable detail shows each question and the patient's raw answer."
- "Pips visualize the numeric response value on the item's scale -- visual representation of the number, not a clinical judgment."
- "No highlighted answers, no flagged responses, no threshold indicators."

**Regulatory relevance:** Shows that the detail view presents raw data without interpretation.

---

## B.4 SF Verification Wizard

**What to capture:** The SF verification wizard showing the practitioner reviewing SQ screening answers with the patient. Should show the wizard step interface with the question text and response.

**Annotations:**
- "Practitioner walks through screening questionnaire with patient."
- "Office-use annotations added here (examiner markings per DC/TMD protocol)."
- "Same workflow as paper-based SF verification -- digital equivalent of the published form."

**Regulatory relevance:** Demonstrates paper-equivalence of the screening verification step.

---

## B.5 Clinical Examination -- Palpation Section (E9 or E10)

**What to capture:** An examination section showing structured data entry fields -- ideally E9 (muscle palpation) or E10 (TMJ palpation) with their yes/no pain responses and measurement fields.

**Annotations:**
- "Structured data entry form -- digital equivalent of DC/TMD paper examination form."
- "Measurements in mm, yes/no responses for pain findings."
- "No automated findings, no calculated results, no alerts."
- "Data stored exactly as entered."

**Regulatory relevance:** Establishes that the examination module is pure data capture.

---

## B.6 Evaluation -- Diagnosis Selector + Documented List

**What to capture:** The top section of the Evaluation view showing:
- The diagnosis selector (grouped dropdown) with a diagnosis selected but NOT yet documented
- The "Dokumentierte Diagnosen" list showing 1-2 previously documented diagnoses
- The "Dokumentieren" button

**Annotations:**
- On the selector: "Manual grouped dropdown. No suggestions, no sorting by probability, no highlighting of 'likely' diagnoses."
- On the documented list: "Only diagnoses explicitly selected and confirmed by the practitioner appear here."
- On the button: "Explicit practitioner action required -- nothing is auto-documented."
- Show that the selector and the reference list below are visually and functionally separate.

**Regulatory relevance:** Demonstrates that diagnosis documentation is entirely clinician-driven.

---

## B.7 Evaluation -- Expanded Diagnosis Reference with Read-Only Criteria

**What to capture:** The "Diagnosekriterien" card with one diagnosis expanded (e.g., Myalgia), showing:
- The criteria checklist items with their source data badges (SF1, U4B, etc.)
- The read-only state (no toggle buttons, no state indicators)
- A clicked badge showing the source data value

**Annotations:**
- "Read-only reference list. Same content as the published DC/TMD diagnostic criteria table."
- On source badges: "Source data badges indicate which questionnaire/exam fields relate to each criterion -- same references as printed in the published criteria table."
- On the absence of state indicators: "No positive/negative/pending indicators shown. No checkmarks, no colors."
- On the clicked badge expansion: "Clicking a badge shows the stored data value -- equivalent to flipping to the relevant form page."
- If the list/tree toggle is visible: "Toggle between list view and decision tree view. Both are static reference materials."

**Regulatory relevance:** This is the second most critical screenshot. It shows that the criteria reference presents information without diagnostic conclusions, and that the auto-evaluation results are not surfaced.

---

## B.8 Report Output -- First Page of Befundbericht

**What to capture:** The first page of a generated Befundbericht (clinical findings report), showing:
- Patient header (name, DOB, clinic ID, examination date)
- Beginning of the anamnesis section (auto-generated text)
- If possible, also show the diagnosis section

**Annotations:**
- On the header: "Patient identity decrypted for report only."
- On the anamnesis text: "Template-generated prose from SQ answers. Deterministic text substitution -- each yes/no answer maps to a fixed sentence."
- On the diagnosis section (if visible): "Only clinician-documented diagnoses appear. ICD-10 codes from static lookup table."
- "Report contains: patient demographics, generated anamnesis, formatted exam findings, arithmetic scores, clinician-selected diagnoses. No interpretations or recommendations."

**Regulatory relevance:** Shows the complete output of the system -- only documented data and arithmetic results, no clinical conclusions generated by the software.

---

## Screenshot Capture Notes

- All screenshots should use realistic test data (demo case or test patient)
- Blur or redact any real patient data if present
- Use the application's default theme (no dark mode) for consistency
- Capture at standard desktop resolution (1440px width recommended)
- Annotations should be added as overlays with numbered callouts referencing the descriptions above
