# Appendix D: Data Processing Overview

This appendix describes the functional data flow through CMDetect -- what happens to data at each stage, where computation occurs, and where data is only stored or displayed. This is a functional view, not a technical architecture diagram.

---

## Stage 1: Data Collection (Patient Input)

```
Patient Device                    Server (via HTTPS)               Database
─────────────────                 ──────────────────               ────────
Personal data form        ──►     Validate structure       ──►     patient_record
(name, DOB)                       (no content validation)          .first_name_encrypted
  ↓ ECIES encrypt                                                  .last_name_encrypted
  (client-side, org                                                .date_of_birth_encrypted
   public key)

SQ answers               ──►     Validate structure       ──►     questionnaire_response
(yes/no, multiple-choice)         (no content validation)          .response_data (JSON)

Pain drawing              ──►     Store as-is              ──►     questionnaire_response
(vector coordinates)                                               .response_data (JSON)

Axis 2 answers            ──►     Store as-is              ──►     questionnaire_response
(PHQ-4, GCPS, JFLS, OBC)                                          .response_data (JSON)
```

**Processing at this stage:**
- Client-side ECIES encryption of personal data only (name, DOB)
- Server-side validation of data structure (is it valid JSON with expected fields?)
- No content validation, scoring, or interpretation
- Questionnaire answers stored as plaintext JSON

**Key property:** The server never examines, transforms, or interprets questionnaire content. It validates structural integrity only.

---

## Stage 2: Score Computation (On-Demand, Client-Side)

When the practitioner opens the Anamnesis Dashboard, scores are computed in the browser from stored questionnaire answers.

```
questionnaire_response            Browser (client-side)             UI Display
.response_data (JSON)    ──►     Scoring functions          ──►    Score card
                                                                    
                                  PHQ-4:                            "Gesamt: 7/12"
                                    sum(4 items)                    "GAD-2: 4/6, PHQ-2: 3/6"
                                                                    
                                  GCPS-1M:                          "CSI 47/100"
                                    mean(items 2-4) × 10            "BP 3/6"
                                    mean(items 6-8) × 10 → points
                                    days → points
                                    sum(points)
                                                                    
                                  JFLS-8:                           "⌀ 2.35/10"
                                    mean(answered items)
                                                                    
                                  OBC:                              "42/84"
                                    sum(21 items)
                                                                    
                                  Pain Drawing:                     "3 von 5 Regionen"
                                    count(regions with elements)
```

**Processing at this stage:**
- Arithmetic operations: addition, division, multiplication by constant, rounding
- Lookup table application: interference score -> points, disability days -> points (GCPS only)
- Counting: affected pain drawing regions

**Not processed at this stage:**
- No severity classification applied
- No grade determination applied
- No risk level determination applied
- No cutpoint comparison or threshold evaluation

**Key property:** Scores are NOT persisted separately. They are recomputed each time from raw answers. The scoring functions internally compute classification fields (grade, limitation level, risk level), but the UI layer extracts and renders only the arithmetic fields.

---

## Stage 3: Criteria Data Resolution (On-Demand, Client-Side)

When the practitioner opens the Evaluation view, the application resolves which data fields correspond to which diagnostic criteria.

```
SQ answers (JSON)         ──►     mapToCriteriaData()      ──►    Flat lookup structure
Examination data (JSON)            (data transformation)           (key-value map)
                                                                    
                                   ↓                                
                                                                    
                                  evaluateDiagnosis()               
                                  (criteria evaluation              
                                   engine)                          
                                   ↓                                
                                                                    
                                  Results:                          
                                  - Field references      ──►     Source data badges
                                    (SF1, U4B, etc.)               (displayed in UI)
                                                                    
                                  - Criterion status      ──►     NOT DISPLAYED
                                    (positive/negative/             (readOnly mode,
                                     pending)                       empty assessment map)
```

**Processing at this stage:**
- Data transformation: SQ answers + examination data mapped to a normalized lookup structure
- Criteria evaluation: rule engine processes criteria definitions against data
- Field reference resolution: determines which source fields relate to each criterion

**Surfaced in UI:** Source data badges only (e.g., "SF1" indicates that SQ question 1 is relevant to this criterion)

**NOT surfaced in UI:** Criterion evaluation result (positive/negative/pending). The criteria checklist is rendered in `readOnly` mode with an empty state map. No visual indicator of the automated evaluation result is shown to the user.

**Key property:** The evaluation engine runs, but its output is gated. Only field references (which are equivalent to the column headers in the published criteria table) are used for display purposes.

---

## Stage 4: Clinical Determinations (Practitioner Input)

All clinical judgments are recorded via explicit practitioner actions.

```
Practitioner Action               Storage
───────────────────               ───────

Selects PHQ-4 severity    ──►    Local component state (useState)
  from dropdown                   [Not yet persisted to database]

Selects GCPS grade        ──►    Local component state (useState)
  from dropdown                   [Not yet persisted to database]

Enters JFLS/OBC           ──►    Local component state (useState)
  free-text classification        [Not yet persisted to database]

Selects diagnosis +        ──►    documented_diagnosis table
  side + region from              .diagnosis_id
  dropdown, clicks                .side
  "Dokumentieren"                 .region
                                  .site
                                  .documented_by (user ID)
                                  .documented_at (timestamp)
```

**Processing at this stage:** None. Pure data recording of practitioner decisions.

**Note on persistence:** Axis 2 clinician determinations (dropdown selections, free-text classifications, notes) are currently managed in local component state and reset on page navigation. The database table for persisting these is planned but not yet deployed. Documented diagnoses are persisted immediately to the database.

---

## Stage 5: Report Generation (On-Demand, Client-Side)

When the practitioner generates a Befundbericht (clinical findings report), data is aggregated and formatted.

```
Data Sources                      Processing                        Report Output (DOCX/PDF)
────────────                      ──────────                        ───────────────────────

patient_record             ──►    Decrypt PII              ──►     Patient header
.first_name_encrypted             (client-side,                     (name, DOB, clinic ID,
.last_name_encrypted               org private key)                  exam date)
.date_of_birth_encrypted

SQ answers                 ──►    generateAnamnesisText()  ──►     Anamnesis section
(questionnaire_response)          (template-based text              (German prose)
                                   substitution:
                                   if SQ1="yes" → fixed sentence)

examination_response       ──►    formatExaminationData()  ──►     Examination findings
.response_data                    (structured formatting            (section-by-section)
                                   of stored values)

questionnaire_response     ──►    Scoring functions        ──►     Axis 2 scores
(Axis 2 answers)                  (same arithmetic as               (numeric only)
                                   Stage 2)

documented_diagnosis       ──►    ICD-10 code lookup       ──►     Diagnoses section
(clinician selections)            (static definition table)         (diagnosis name +
                                                                     ICD-10 + location)
```

**Processing at this stage:**
- PII decryption (client-side, using organization private key)
- Template-based text generation (deterministic substitution: yes/no -> fixed German sentence)
- Data formatting (JSON -> readable text)
- Arithmetic scoring (same as Stage 2, recomputed)
- Static code lookup (diagnosis ID -> ICD-10 code from definition table)

**Key properties:**
- Report generation happens entirely client-side in the browser
- No server-side processing or analysis pipeline
- Report content = stored data + arithmetic scores + template text + clinician-documented diagnoses
- No content is added that the practitioner did not explicitly provide or confirm
- Report includes ONLY clinician-documented diagnoses, not all possible diagnoses

---

## Data Processing Summary

| Stage | Where | Computation Type | Persisted? |
|-------|-------|-----------------|------------|
| 1. Collection | Server | Structure validation only | Yes (database) |
| 2. Scoring | Browser | Arithmetic (sum, mean, lookup) | No (recomputed) |
| 3. Criteria Resolution | Browser | Rule evaluation + field mapping | No (recomputed) |
| 4. Determinations | Browser | None (recording only) | Diagnoses: yes; Axis 2 classifications: not yet |
| 5. Report | Browser | Formatting + arithmetic + templates | No (generated on demand) |

**Architectural principle:** All computation beyond data storage happens client-side in the practitioner's browser. There is no server-side analysis, scoring, or interpretation pipeline. The server stores and retrieves data; the browser renders and formats it.
