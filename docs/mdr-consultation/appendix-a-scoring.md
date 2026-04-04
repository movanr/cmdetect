# Appendix A: Scoring Specification per Questionnaire

This appendix documents the exact computations performed by CMDetect for each Axis 2 questionnaire instrument, what is displayed in the user interface, and what the software explicitly does not apply.

---

## A.1 PHQ-4 (Patient Health Questionnaire-4)

**Reference:** Lowe B, Wahl I, Rose M, et al. A 4-item measure of depression and anxiety: validation and standardization of the Patient Health Questionnaire-4 (PHQ-4) in the general population. *J Affect Disord.* 2010;122(1-2):86-95.

**Input:** 4 items, each scored 0-3 (Likert scale: "uberhaupt nicht" to "beinahe jeden Tag").
- Items A, B: PHQ-2 (depression subscale)
- Items C, D: GAD-2 (anxiety subscale)

**Computed by software:**
- Total score = PHQ4_A + PHQ4_B + PHQ4_C + PHQ4_D (range: 0-12)
- Depression subscale (PHQ-2) = PHQ4_A + PHQ4_B (range: 0-6)
- Anxiety subscale (GAD-2) = PHQ4_C + PHQ4_D (range: 0-6)

**Displayed in UI:** `Gesamt: X/12, GAD-2: X/6, PHQ-2: X/6`

**Clinician determines:** Severity classification via dropdown (Normal / Leicht / Moderat / Schwer). Dropdown is empty by default.

**NOT applied by software:**
- Severity classification (0-2 Normal, 3-5 Mild, 6-8 Moderate, 9-12 Severe)
- Subscale screening interpretation (>= 3 = positive screening)
- The function `getPHQ4Interpretation()` and `getSubscaleInterpretation()` exist in the scoring library but are not called by the UI

---

## A.2 GCPS-1M (Graded Chronic Pain Scale -- 1 Month)

**Reference:** Von Korff M, et al. Grading the severity of chronic pain. *Pain.* 1992;50(2):133-149. Scoring per DC/TMD v2.0 German manual.

**Input:** 8 items.
- Items 2-4: pain intensity (0-10 scale)
- Item 5: disability days (numeric count)
- Items 6-8: interference with daily/social/work activities (0-10 scale)

**Computed by software:**

1. **CPI (Characteristic Pain Intensity):**
   - Formula: `(Item2 + Item3 + Item4) / 3 * 10`, rounded to integer
   - Range: 0-100

2. **Interference Score:**
   - Formula: `(Item6 + Item7 + Item8) / 3 * 10`, rounded to integer
   - Range: 0-100

3. **Interference Points** (from interference score via published lookup table):
   - 0-29 -> 0 points
   - 30-49 -> 1 point
   - 50-69 -> 2 points
   - 70+ -> 3 points

4. **Disability Days Points** (from Item 5 via published lookup table):
   - 0-1 days -> 0 points
   - 2 days -> 1 point
   - 3-5 days -> 2 points
   - 6+ days -> 3 points

5. **Total Disability Points** = Interference Points + Disability Days Points (range: 0-6)

**Displayed in UI:** `CSI X/100, BP X/6` with formula explanation in popover on hover.

**Clinician determines:** GCPS Grade via dropdown (Grad 0 / Grad I / Grad II / Grad III / Grad IV). Dropdown is empty by default.

**NOT applied by software (in UI):**
- Grade determination algorithm (Grade 0-IV based on CPI and total disability points)
- CPI level interpretation (none / low / high)
- Grade interpretation labels (e.g., "Hochgradige Einschrankung")

**Technical note:** The function `determineGrade()` IS called internally by `calculateGCPS1MScore()`, and the returned score object contains `.grade` and `.gradeInterpretation` fields. However, the `GCPSScoreCard` UI component only destructures and displays `.cpi` and `.totalDisabilityPoints` -- the grade fields are present in the data object but never rendered.

**Regulatory sensitivity:** The conversion from interference score to "interference points" via the lookup table is arguably a classification step (mapping continuous to discrete). The counter-argument: this is a published, standardized transformation that appears in the paper scoring manual, and the same table is applied by hand when scoring on paper.

---

## A.3 JFLS-8 (Jaw Functional Limitation Scale -- 8 items)

**Reference:** Ohrbach R, et al. JFLS scoring. DC/TMD Scoring Manual. "Norms have not yet been established for this instrument."

**Input:** 8 items, each scored 0-10 (limitation scale).

**Computed by software:**
- Global score = mean of available items (max 2 missing items tolerated)
- Formula: `sum(answered items) / count(answered items)`, rounded to 2 decimals
- Range: 0-10

**Displayed in UI:** `⌀ X.XX/10`

**Clinician determines:** Free-text classification (no dropdown -- norms not established per DC/TMD manual).

**NOT applied by software (in UI):**
- Limitation level (Normal / Mild / Significant)
- Reference value comparison (Healthy mean: 0.16, Chronic TMD mean: 1.74)
- The function `getJFLS8LimitationLevel()` is called internally by `calculateJFLS8Score()` but the result (`.limitationLevel`, `.limitationInterpretation`) is not rendered by the UI

---

## A.4 JFLS-20 (Jaw Functional Limitation Scale -- 20 items)

**Reference:** Ohrbach R, et al. JFLS-20 scoring. DC/TMD Scoring Manual.

**Input:** 20 items, each scored 0-10. Three subscales:
- Mastication (items 1-6, max 2 missing)
- Mobility (items 7-10, max 1 missing)
- Communication (items 13-20, max 2 missing)
- Items 11-12 (swallowing, yawning) are not part of any subscale

**Computed by software:**
- Global score = mean of all answered items (max 4 missing tolerated), rounded to 2 decimals
- Subscale scores = mean of answered items per subscale, rounded to 1 decimal

**Displayed in UI:** `⌀ X.XX/10` with subscale breakdown: `Kauen X.X, Mobilitat X.X, Kommunikation X.X`

**Clinician determines:** Free-text classification (norms not established).

**NOT applied by software (in UI):**
- Limitation level per subscale
- Reference value comparisons (Healthy vs. Chronic TMD means)

**Note:** JFLS-20 is currently disabled in the patient questionnaire app (only JFLS-8 is active). The scoring and display components exist and are functional.

---

## A.5 OBC (Oral Behaviors Checklist)

**Reference:** Markiewicz MR, et al. OBC scoring. DC/TMD specification.

**Input:** 21 items, each scored 0-4 (frequency scale: "nie" to "immer").

**Computed by software:**
- Total score = sum of all 21 items
- Range: 0-84

**Displayed in UI:** `X/84`

**Clinician determines:** Free-text classification (norms not established).

**NOT applied by software (in UI):**
- Risk level (Normal 0-16 / Elevated 17-24 / High 25+)
- Risk interpretation labels
- The function `getOBCRiskLevel()` is called internally by `calculateOBCScore()` but the result (`.riskLevel`, `.riskInterpretation`) is not rendered by the UI

---

## A.6 Pain Drawing

**Reference:** DC/TMD specification. "There is no single method for assessing and interpreting pain drawings."

**Input:** Patient-drawn markings on 5 body region canvases (mouth, head-left, head-right, body-front, body-back). Stored as vector data (coordinates of shading strokes, point markers, and arrows).

**Computed by software:**
- Region count = number of regions with at least one drawn element (range: 0-5)
- Element count = total number of drawn elements across all regions

**Displayed in UI:** `X von 5 Regionen betroffen`

**Clinician determines:** Free-text classification.

**NOT applied by software (in UI):**
- Risk level (None / Localized / Regional / Widespread)
- Pain pattern detection (head pain, oral pain, body pain, widespread pain)
- The functions `getRiskLevel()` and `detectPatterns()` are called internally by `calculatePainDrawingScore()` but the results are not rendered by the score card UI -- only `regionCount` is displayed

---

## Summary: Computation Boundary

| Instrument | What Software Computes | What Software Displays | What Clinician Records |
|-----------|----------------------|----------------------|----------------------|
| PHQ-4 | Sum, subscale sums | Numeric totals | Severity (dropdown) |
| GCPS-1M | CPI, interference/disability points, total BP | CSI + BP numbers | Grade (dropdown) |
| JFLS-8 | Mean | Global mean | Free text |
| JFLS-20 | Global + subscale means | Global + subscale means | Free text |
| OBC | Sum | Total | Free text |
| Pain Drawing | Region count, element count | Region count | Free text |

In all cases: the scoring library internally computes classification/interpretation fields, but the UI layer extracts and renders only the arithmetic results. Classification is always a manual clinician action via a separate input field.
