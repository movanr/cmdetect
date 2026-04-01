/**
 * SQ Interview Instructions — German
 *
 * The DC/TMD Symptom Questionnaire "was designed to be followed by an interview
 * for clarification and confirmation of the responses to all items; it is not
 * intended to be a self-complete instrument."
 *
 * Source: DC/TMD Scoring Manual for Self-Report Instruments, Section "DC/TMD
 * Symptom Questionnaire", Description.
 */

import type { SQSectionId } from "@cmdetect/questionnaires";
import type { SQSectionInstruction } from "./types";

export const SQ_SECTION_INSTRUCTIONS: Record<SQSectionId, SQSectionInstruction> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PAIN (SQ1–SQ4)
  // ═══════════════════════════════════════════════════════════════════════════
  pain: {
    sectionId: "pain",
    title: "Interview: Schmerzen",
    description: "Bestätigen Sie Schmerzpräsenz, Dauer, Häufigkeit und beeinflussende Faktoren.",
    flow: [
      {
        id: "pain-1",
        label: "Schmerzpräsenz bestätigen (SF1)",
        patientScript:
          "Sie haben angegeben, dass Sie Schmerzen im Kiefer, Schläfenbereich oder vor dem Ohr hatten. Stimmt das so?",
        examinerInstruction: "Schmerzen vs. Druckgefühl unterscheiden.",
      },
      {
        id: "pain-2",
        label: "Dauer und Häufigkeit bestätigen (SF2, SF3)",
        patientScript:
          "Seit wann haben Sie diese Schmerzen und wie oft treten sie in den letzten 30 Tagen auf?",
        appAction: "SF2 und SF3 bei Bedarf anpassen",
      },
      {
        id: "pain-3",
        label: "Beeinflussende Faktoren prüfen (SF4a–d)",
        patientScript:
          "Wird Ihr Schmerz durch Kauen, Mundöffnung, Knirschen oder Reden beeinflusst?",
        examinerInstruction: "Jeden Faktor (SF4a–d) einzeln durchgehen.",
        appAction: "SF4a–d bei Bedarf anpassen",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADACHE (SQ5–SQ7)
  // ═══════════════════════════════════════════════════════════════════════════
  headache: {
    sectionId: "headache",
    title: "Interview: Kopfschmerzen",
    description:
      "Bestätigen Sie Kopfschmerzen im Schläfenbereich, Dauer und kieferbezogene Einflussfaktoren.",
    flow: [
      {
        id: "headache-1",
        label: "Schläfenkopfschmerz bestätigen (SF5)",
        patientScript:
          "Sie haben angegeben, dass Sie Kopfschmerzen im Schläfenbereich hatten. Stimmt das so?",
        examinerInstruction:
          "SF5 bezieht sich auf den Schläfenbereich — bestätigen Sie, dass der Kopfschmerz dort lokalisiert ist.",
      },
      {
        id: "headache-2",
        label: "Dauer bestätigen (SF6)",
        patientScript: "Seit wann haben Sie diesen Schläfenkopfschmerz?",
        appAction: "SF6 bei Bedarf anpassen",
      },
      {
        id: "headache-3",
        label: "Kieferbezogene Faktoren prüfen (SF7a–d)",
        patientScript:
          "Wird Ihr Schläfenkopfschmerz durch Kauen, Mundöffnung, Knirschen oder Reden verändert?",
        examinerInstruction:
          "Jeden Faktor (SF7a–d) einzeln durchgehen. Kieferbezogene Modifikation ist diagnostisch entscheidend.",
        appAction: "SF7a–d bei Bedarf anpassen",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JOINT NOISES (SQ8)
  // ═══════════════════════════════════════════════════════════════════════════
  joint_noises: {
    sectionId: "joint_noises",
    title: "Interview: Gelenkgeräusche",
    description:
      "Bestätigen Sie Gelenkgeräusche und bestimmen Sie Art und Seitenbezug durch das Interview.",
    flow: [
      {
        id: "noise-1",
        label: "Geräusch bestätigen und Art klären (SF8)",
        patientScript:
          "Sie haben angegeben, dass Sie Gelenkgeräusche bemerkt haben. Können Sie das Geräusch beschreiben — ist es eher ein Knacken oder ein Reiben/Knirschen?",
        examinerInstruction:
          "Klicken/Knacken (kurzes Geräusch) vs. Reiben (anhaltendes Geräusch) unterscheiden.",
      },
      {
        id: "noise-2",
        label: "Seitenbezug bestimmen",
        patientScript:
          "Auf welcher Seite bemerken Sie das Geräusch — rechts, links oder auf beiden Seiten?",
        examinerInstruction:
          "Der Fragebogen fragt absichtlich nicht nach der Seite (geringe Reliabilität bei Selbsteinschätzung). Die Seitenzuordnung muss durch das Interview erfolgen.",
        appAction: "Seitenzuordnung im Office-Use-Feld eintragen (R/L/beides)",
      },
      {
        id: "noise-3",
        label: "Umstände klären",
        patientScript:
          "Bei welchen Bewegungen tritt das Geräusch auf — beim Öffnen, beim Schließen oder bei beidem?",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOSED LOCKING (SQ9–SQ12)
  // ═══════════════════════════════════════════════════════════════════════════
  closed_locking: {
    sectionId: "closed_locking",
    title: "Interview: Kieferklemme",
    description:
      "Bestätigen Sie Öffnungsblockaden und bestimmen Sie den Seitenbezug durch das Interview.",
    flow: [
      {
        id: "lock-c-1",
        label: "Öffnungsblockade bestätigen (SF9, SF10)",
        patientScript:
          "Sie haben angegeben, dass Ihr Kiefer manchmal blockiert und sich nicht vollständig öffnen lässt. Können Sie das beschreiben?",
        examinerInstruction:
          "Echtes Locking (mechanische Blockade) vs. Bewegungseinschränkung durch Schmerz unterscheiden.",
        appAction: "SF10 bei Bedarf anpassen",
      },
      {
        id: "lock-c-2",
        label: "Zeitlichen Verlauf klären (SF11, SF12)",
        patientScript:
          "Hatten Sie in den letzten 30 Tagen eine solche Blockade? Und hat sich diese wieder gelöst?",
        appAction: "SF11 und SF12 bei Bedarf anpassen",
      },
      {
        id: "lock-c-3",
        label: "Seitenbezug bestimmen",
        patientScript:
          "Auf welcher Seite spüren Sie die Blockade — rechts, links oder auf beiden Seiten?",
        appAction: "Seitenzuordnung im Office-Use-Feld eintragen (R/L/beides)",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPEN LOCKING (SQ13–SQ14)
  // ═══════════════════════════════════════════════════════════════════════════
  open_locking: {
    sectionId: "open_locking",
    title: "Interview: Kiefersperre",
    description:
      "Bestätigen Sie offenes Locking und bestimmen Sie den Seitenbezug durch das Interview.",
    flow: [
      {
        id: "lock-o-1",
        label: "Kiefersperre bestätigen (SF13)",
        patientScript:
          "Sie haben angegeben, dass Ihr Kiefer bei weiter Mundöffnung blockiert war und Sie den Mund nicht mehr schließen konnten. Können Sie das beschreiben?",
        examinerInstruction:
          "Echtes Open Lock (Kiefer in maximaler Öffnung fixiert) vs. Unsicherheit/Angst vor weiter Öffnung unterscheiden.",
      },
      {
        id: "lock-o-2",
        label: "Lösungsmaßnahmen klären (SF14)",
        patientScript:
          "Mussten Sie etwas unternehmen, um den Kiefer wieder schließen zu können — z.\u00A0B. entspannen, bewegen oder drücken?",
        appAction: "SF14 bei Bedarf anpassen",
      },
      {
        id: "lock-o-3",
        label: "Seitenbezug bestimmen",
        patientScript:
          "Auf welcher Seite tritt die Blockade auf — rechts, links oder auf beiden Seiten?",
        appAction: "Seitenzuordnung im Office-Use-Feld eintragen (R/L/beides)",
      },
    ],
  },
};
