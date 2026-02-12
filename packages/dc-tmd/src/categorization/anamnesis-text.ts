/**
 * DC/TMD Anamnesis Text Generator
 *
 * Generates readable German paragraphs from SQ questionnaire data
 * for the clinical findings report (Befundbericht).
 *
 * Takes the same criteria data format as extractClinicalFindings
 * (output of mapToCriteriaData) and produces human-readable sentences.
 */

// ============================================================================
// DATA ACCESS HELPER
// ============================================================================

/**
 * Get value at dot-separated path from a nested data object.
 * Same pattern as extract.ts.
 */
function get(data: unknown, path: string): unknown {
  const parts = path.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ============================================================================
// VALUE FORMATTERS
// ============================================================================

/** Format SQ2/SQ6 onset value to German text */
function formatOnset(value: unknown): string | null {
  if (value == null || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const years = typeof obj.years === "number" ? obj.years : 0;
  const months = typeof obj.months === "number" ? obj.months : 0;
  if (years === 0 && months === 0) return null;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Jahr" : "Jahren"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Monat" : "Monaten"}`);
  return `seit ${parts.join(" und ")}`;
}

/** Format SQ3 frequency value */
function formatFrequency(value: unknown): string | null {
  if (value === "intermittent") return "die Schmerzen kommen und gehen";
  if (value === "continuous") return "die Schmerzen sind ständig vorhanden";
  return null;
}

/** Format side data from office-use marking */
function formatSide(data: unknown, sqId: string): string | null {
  const sideData = get(data, `sq.${sqId}_side`);
  if (sideData == null || typeof sideData !== "object") return null;
  const obj = sideData as { left?: boolean; right?: boolean };
  const left = obj.left === true;
  const right = obj.right === true;
  if (left && right) return "beidseits";
  if (right) return "rechts";
  if (left) return "links";
  return null;
}

// ============================================================================
// SECTION GENERATORS
// ============================================================================

/** Pain section (SQ1–SQ4) */
function generatePainText(data: unknown): string | null {
  if (get(data, "sq.SQ1") !== "yes") return null;

  const parts: string[] = [];
  parts.push("Es werden Schmerzen im Bereich des Kiefers, der Schläfen oder vor dem Ohr angegeben");

  const onset = formatOnset(get(data, "sq.SQ2"));
  if (onset) parts.push(onset);

  const freq = formatFrequency(get(data, "sq.SQ3"));
  if (freq) {
    parts[parts.length - 1] += ";";
    parts.push(freq);
  }

  // Functional modifications (SQ4_A–D)
  const modifications: string[] = [];
  if (get(data, "sq.SQ4_A") === "yes") modifications.push("Kauen harter Nahrung");
  if (get(data, "sq.SQ4_B") === "yes") modifications.push("Mundöffnung oder Kieferbewegungen");
  if (get(data, "sq.SQ4_C") === "yes") modifications.push("Pressen, Knirschen oder Kaugummikauen");
  if (get(data, "sq.SQ4_D") === "yes") modifications.push("Reden, Küssen oder Gähnen");

  if (modifications.length > 0) {
    parts[parts.length - 1] += ".";
    parts.push(`Die Schmerzen werden beeinflusst durch: ${modifications.join(", ")}`);
  }

  return parts.join(" ") + ".";
}

/** Headache section (SQ5–SQ7) */
function generateHeadacheText(data: unknown): string | null {
  if (get(data, "sq.SQ5") !== "yes") return null;

  const parts: string[] = [];
  parts.push("Es bestehen Kopfschmerzen im Bereich der Schläfen");

  const onset = formatOnset(get(data, "sq.SQ6"));
  if (onset) parts.push(onset);

  // Functional modifications (SQ7_A–D)
  const modifications: string[] = [];
  if (get(data, "sq.SQ7_A") === "yes") modifications.push("Kauen harter Nahrung");
  if (get(data, "sq.SQ7_B") === "yes") modifications.push("Mundöffnung oder Kieferbewegungen");
  if (get(data, "sq.SQ7_C") === "yes") modifications.push("Pressen, Knirschen oder Kaugummikauen");
  if (get(data, "sq.SQ7_D") === "yes") modifications.push("Reden, Küssen oder Gähnen");

  if (modifications.length > 0) {
    parts[parts.length - 1] += ".";
    parts.push(`Die Kopfschmerzen werden beeinflusst durch: ${modifications.join(", ")}`);
  }

  return parts.join(" ") + ".";
}

/** TMJ sounds section (SQ8) */
function generateTmjSoundsText(data: unknown): string | null {
  if (get(data, "sq.SQ8") !== "yes") return null;

  const side = formatSide(data, "SQ8");
  const sideText = side ? ` (${side})` : "";
  return `Es werden Kiefergelenkgeräusche${sideText} in den letzten 30 Tagen angegeben.`;
}

/** Closed locking section (SQ9–SQ12) */
function generateClosedLockingText(data: unknown): string | null {
  if (get(data, "sq.SQ9") !== "yes") return null;

  const parts: string[] = [];
  const side = formatSide(data, "SQ9");
  const sideText = side ? ` (${side})` : "";
  parts.push(`Es wird eine Kieferklemme${sideText} angegeben`);

  if (get(data, "sq.SQ10") === "yes") {
    parts.push("mit Einschränkung beim Essen");
  }

  if (get(data, "sq.SQ11") === "yes") {
    parts[parts.length - 1] += ".";
    if (get(data, "sq.SQ12") === "yes") {
      parts.push("Die Kieferklemme besteht zum aktuellen Zeitpunkt");
    } else {
      parts.push("In den letzten 30 Tagen trat eine intermittierende Kieferklemme auf, die sich von selbst wieder löste");
    }
  }

  return parts.join(", ") + ".";
}

/** Open locking / subluxation section (SQ13–SQ14) */
function generateOpenLockingText(data: unknown): string | null {
  if (get(data, "sq.SQ13") !== "yes") return null;

  const side = formatSide(data, "SQ13");
  const sideText = side ? ` (${side})` : "";
  const parts: string[] = [];
  parts.push(`Es wird eine Kiefersperre (offene Blockade)${sideText} in den letzten 30 Tagen angegeben`);

  if (get(data, "sq.SQ14") === "yes") {
    parts[parts.length - 1] += ",";
    parts.push("wobei ein Manöver zum Mundschluss erforderlich war");
  }

  return parts.join(" ") + ".";
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generate readable German anamnesis paragraphs from SQ questionnaire data.
 *
 * Takes the same criteria data format as `extractClinicalFindings`
 * (output of `mapToCriteriaData`).
 *
 * Returns an array of German sentences/paragraphs. Items where the
 * patient answered "no" are skipped.
 *
 * @param data - Criteria data object with `sq.*` paths
 * @returns Array of German text paragraphs (empty if no positive findings)
 */
export function generateAnamnesisText(data: unknown): string[] {
  const paragraphs: string[] = [];

  const generators = [
    generatePainText,
    generateHeadacheText,
    generateTmjSoundsText,
    generateClosedLockingText,
    generateOpenLockingText,
  ];

  for (const gen of generators) {
    const text = gen(data);
    if (text) paragraphs.push(text);
  }

  return paragraphs;
}
