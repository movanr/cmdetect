/**
 * Question labels for displaying questionnaire responses
 * German labels for practitioner view
 */

// DC/TMD Symptom Questionnaire (SQ) Labels
export const SQ_QUESTION_LABELS: Record<string, { text: string; section: string }> = {
  // Section: Pain
  SQ1: {
    text: "Hatten Sie jemals Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr auf einer Seite?",
    section: "Schmerzen",
  },
  SQ2: {
    text: "Vor wie vielen Jahren oder Monaten begannen Ihre Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr zum ersten Mal?",
    section: "Schmerzen",
  },
  SQ3: {
    text: "Welche der folgenden Aussagen beschreibt am besten Schmerzen in den letzten 30 Tagen?",
    section: "Schmerzen",
  },
  SQ4_A: {
    text: "Aktivität beeinflusst Schmerzen: Kauen harter oder zäher Nahrung",
    section: "Schmerzen",
  },
  SQ4_B: {
    text: "Aktivität beeinflusst Schmerzen: Mundöffnung oder Kieferbewegung",
    section: "Schmerzen",
  },
  SQ4_C: {
    text: "Aktivität beeinflusst Schmerzen: Kiefergewohnheiten (Zähne zusammenpressen, Knirschen, Kaugummi)",
    section: "Schmerzen",
  },
  SQ4_D: {
    text: "Aktivität beeinflusst Schmerzen: Andere Kieferaktivitäten (Sprechen, Küssen, Gähnen)",
    section: "Schmerzen",
  },

  // Section: Headache
  SQ5: {
    text: "Hatten Sie in den letzten 30 Tagen Kopfschmerzen, die die Schläfenbereiche einschlossen?",
    section: "Kopfschmerzen",
  },
  SQ6: {
    text: "Vor wie vielen Jahren oder Monaten begannen Ihre Schläfenkopfschmerzen zum ersten Mal?",
    section: "Kopfschmerzen",
  },
  SQ7_A: {
    text: "Aktivität beeinflusst Kopfschmerzen: Kauen harter oder zäher Nahrung",
    section: "Kopfschmerzen",
  },
  SQ7_B: {
    text: "Aktivität beeinflusst Kopfschmerzen: Mundöffnung oder Kieferbewegung",
    section: "Kopfschmerzen",
  },
  SQ7_C: {
    text: "Aktivität beeinflusst Kopfschmerzen: Kiefergewohnheiten",
    section: "Kopfschmerzen",
  },
  SQ7_D: {
    text: "Aktivität beeinflusst Kopfschmerzen: Andere Kieferaktivitäten",
    section: "Kopfschmerzen",
  },

  // Section: Jaw Joint Noises
  SQ8: {
    text: "Hatten Sie in den letzten 30 Tagen Kiefergelenkgeräusche bei Bewegung oder Benutzung des Kiefers?",
    section: "Kiefergelenkgeräusche",
  },

  // Section: Closed Locking
  SQ9: {
    text: "Ist Ihr Kiefer jemals blockiert oder eingerastet, sodass er sich nicht VOLLSTÄNDIG öffnen ließ?",
    section: "Kiefersperre (geschlossen)",
  },
  SQ10: {
    text: "War die Kiefersperre so stark, dass sie die Mundöffnung einschränkte und das Essen beeinträchtigte?",
    section: "Kiefersperre (geschlossen)",
  },
  SQ11: {
    text: "Hat sich Ihr Kiefer in den letzten 30 Tagen blockiert und dann wieder gelöst?",
    section: "Kiefersperre (geschlossen)",
  },
  SQ12: {
    text: "Ist Ihr Kiefer derzeit blockiert oder eingeschränkt, sodass er sich nicht VOLLSTÄNDIG öffnen lässt?",
    section: "Kiefersperre (geschlossen)",
  },

  // Section: Open Locking
  SQ13: {
    text: "Ist Ihr Kiefer in den letzten 30 Tagen bei weiter Mundöffnung blockiert oder eingerastet, sodass Sie ihn nicht schließen konnten?",
    section: "Kiefersperre (offen)",
  },
  SQ14: {
    text: "Mussten Sie in den letzten 30 Tagen etwas tun, um den Kiefer aus der weit geöffneten Position zu schließen?",
    section: "Kiefersperre (offen)",
  },
};

// PHQ-4 Labels
export const PHQ4_QUESTION_LABELS: Record<string, { text: string }> = {
  PHQ4_A: { text: "Wenig Interesse oder Freude an Ihren Tätigkeiten" },
  PHQ4_B: { text: "Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit" },
  PHQ4_C: { text: "Nervosität, Ängstlichkeit oder Anspannung" },
  PHQ4_D: { text: "Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren" },
};

// PHQ-4 Answer Labels
export const PHQ4_ANSWER_LABELS: Record<string, string> = {
  "0": "Überhaupt nicht",
  "1": "An einzelnen Tagen",
  "2": "An mehr als der Hälfte der Tage",
  "3": "Beinahe jeden Tag",
};

// SQ Answer Labels for Yes/No questions
export const SQ_YES_NO_LABELS: Record<string, string> = {
  yes: "Ja",
  no: "Nein",
};

// SQ3 specific labels
export const SQ3_LABELS: Record<string, string> = {
  no_pain: "Keine Schmerzen",
  intermittent: "Schmerzen kommen und gehen",
  continuous: "Schmerzen sind ständig vorhanden",
};

// Questionnaire titles
export const QUESTIONNAIRE_TITLES: Record<string, string> = {
  "dc-tmd-sq": "DC/TMD Symptom-Fragebogen",
  "phq-4": "PHQ-4 Gesundheitsfragebogen",
};

// Get ordered sections for SQ
export const SQ_SECTIONS_ORDER = [
  "Schmerzen",
  "Kopfschmerzen",
  "Kiefergelenkgeräusche",
  "Kiefersperre (geschlossen)",
  "Kiefersperre (offen)",
];

// Questions that have Office use fields (SQ8-SQ14)
// All have R / L / DNK options for side confirmation
export const SQ_OFFICE_USE_QUESTIONS = new Set([
  "SQ8", // Joint noises
  "SQ9", // Closed locking
  "SQ10",
  "SQ11",
  "SQ12",
  "SQ13", // Open locking
  "SQ14",
]);
