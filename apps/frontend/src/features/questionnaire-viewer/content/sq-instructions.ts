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
    description:
      "Überprüfen Sie mit dem Patienten die Angaben zu Schmerzpräsenz, Lokalisation, Dauer und beeinflussenden Faktoren.",
    flow: [
      {
        id: "pain-1",
        label: "Schmerzpräsenz bestätigen (SF1)",
        patientScript:
          "Sie haben angegeben, dass Sie Schmerzen im Kiefer, Schläfenbereich oder vor dem Ohr hatten. Stimmt das so?",
        examinerInstruction:
          "Bei Unklarheit: Klären Sie, ob es sich um Schmerzen oder Druckgefühl handelt.",
      },
      {
        id: "pain-2",
        label: "Lokalisation klären",
        patientScript: "Können Sie mir genau zeigen, wo der Schmerz auftritt?",
        examinerInstruction:
          "Lassen Sie den Patienten die Schmerzregion(en) mit dem Finger zeigen. Achten Sie auf Kiefergelenk, Schläfe, Ohr und präaurikulär.",
      },
      {
        id: "pain-3",
        label: "Dauer und Häufigkeit bestätigen (SF2, SF3)",
        patientScript:
          "Seit wann haben Sie diese Schmerzen und wie oft treten sie in den letzten 30 Tagen auf?",
        examinerInstruction:
          "Vergleichen Sie die Antwort mit den Angaben in SF2 (Dauer) und SF3 (Häufigkeit). Korrigieren Sie bei Abweichungen.",
        appAction: "SF2 und SF3 bei Bedarf anpassen",
      },
      {
        id: "pain-4",
        label: "Beeinflussende Faktoren prüfen (SF4a–d)",
        patientScript:
          "Wird Ihr Schmerz durch bestimmte Aktivitäten wie Kauen, Mundöffnung, Knirschen oder Reden beeinflusst?",
        examinerInstruction:
          "Gehen Sie jeden der vier Faktoren (SF4a–d) einzeln durch und bestätigen oder korrigieren Sie die Patientenantworten.",
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
      "Überprüfen Sie mit dem Patienten die Angaben zu Kopfschmerzen im Schläfenbereich, deren Dauer und kieferbezogenen Einflussfaktoren.",
    flow: [
      {
        id: "headache-1",
        label: "Schläfenkopfschmerz bestätigen (SF5)",
        patientScript:
          "Sie haben angegeben, dass Sie Kopfschmerzen im Schläfenbereich hatten. Stimmt das so?",
        examinerInstruction:
          "Klären Sie, ob der Kopfschmerz tatsächlich temporal lokalisiert ist und nicht z.\u00A0B. frontal oder okzipital.",
      },
      {
        id: "headache-2",
        label: "Lokalisation zeigen lassen",
        patientScript: "Können Sie mir zeigen, wo genau der Kopfschmerz auftritt?",
        examinerInstruction:
          "Der Patient soll die Schläfenregion zeigen. Nur Kopfschmerzen im Schläfenbereich sind für die DC/TMD-Diagnose relevant.",
      },
      {
        id: "headache-3",
        label: "Dauer bestätigen (SF6)",
        patientScript: "Seit wann haben Sie diesen Schläfenkopfschmerz?",
        examinerInstruction:
          "Vergleichen Sie mit SF6. Korrigieren Sie bei Abweichungen.",
        appAction: "SF6 bei Bedarf anpassen",
      },
      {
        id: "headache-4",
        label: "Kieferbezogene Faktoren prüfen (SF7a–d)",
        patientScript:
          "Wird Ihr Schläfenkopfschmerz durch Aktivitäten wie Kauen, Mundöffnung, Knirschen oder Reden verändert?",
        examinerInstruction:
          "Gehen Sie jeden der vier Faktoren (SF7a–d) einzeln durch. Achten Sie darauf, ob der Kopfschmerz kieferbezogen modifiziert wird — das ist diagnostisch entscheidend.",
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
      "Klären Sie Art und Seitenbezug der Gelenkgeräusche. Laut Scoring-Manual ist ein Interview erforderlich, um festzustellen, ob rechts, links oder beidseitig betroffen ist.",
    flow: [
      {
        id: "noise-1",
        label: "Gelenkgeräusche bestätigen (SF8)",
        patientScript:
          "Sie haben angegeben, dass Sie Gelenkgeräusche beim Bewegen des Kiefers bemerkt haben. Stimmt das so?",
        examinerInstruction:
          "Klären Sie, ob es sich um ein hörbares Geräusch handelt (Knacken, Reiben, Knirschen) oder ein anderes Empfinden.",
      },
      {
        id: "noise-2",
        label: "Art des Geräuschs klären",
        patientScript:
          "Können Sie das Geräusch beschreiben? Ist es eher ein Knacken, ein Reiben oder ein Knirschen?",
        examinerInstruction:
          "Unterscheiden Sie zwischen Klicken/Knacken (kurzes Geräusch) und Krepitation/Reiben (anhaltendes Geräusch).",
      },
      {
        id: "noise-3",
        label: "Seitenbezug durch Interview bestimmen",
        patientScript:
          "Auf welcher Seite bemerken Sie das Geräusch — rechts, links oder auf beiden Seiten?",
        examinerInstruction:
          "Der Fragebogen fragt absichtlich nicht nach der Seite (geringe Reliabilität bei Selbsteinschätzung). Die Seitenzuordnung muss durch das Interview erfolgen.",
        appAction: "Seitenzuordnung im Office-Use-Feld eintragen (R/L/beides)",
      },
      {
        id: "noise-4",
        label: "Umstände klären",
        patientScript: "Bei welchen Bewegungen tritt das Geräusch auf — beim Öffnen, beim Schließen oder bei beidem?",
        examinerInstruction:
          "Notieren Sie, ob das Geräusch bei Öffnung, bei Schließung oder bei beiden Bewegungen auftritt.",
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
      "Überprüfen Sie die Angaben zu Öffnungsblockaden. Der Seitenbezug muss durch das Interview festgestellt werden.",
    flow: [
      {
        id: "lock-c-1",
        label: "Öffnungsblockade bestätigen (SF9)",
        patientScript:
          "Sie haben angegeben, dass Ihr Kiefer manchmal blockiert und sich nicht vollständig öffnen lässt. Können Sie das beschreiben?",
        examinerInstruction:
          "Lassen Sie den Patienten mit eigenen Worten die Blockade beschreiben. Unterscheiden Sie zwischen echtem Locking (mechanische Blockade) und Bewegungseinschränkung durch Schmerz.",
      },
      {
        id: "lock-c-2",
        label: "Schweregrad und Auswirkung prüfen (SF10)",
        patientScript: "Hat die Blockade Ihre Mundöffnung so stark eingeschränkt, dass Sie nicht richtig essen konnten?",
        examinerInstruction:
          "Bestätigen Sie SF10. Klären Sie, ob die funktionelle Einschränkung tatsächlich auf eine mechanische Blockade zurückgeht.",
        appAction: "SF10 bei Bedarf anpassen",
      },
      {
        id: "lock-c-3",
        label: "Zeitlichen Verlauf klären (SF11, SF12)",
        patientScript:
          "Hatten Sie in den letzten 30 Tagen eine solche Blockade? Und hat sich diese wieder gelöst?",
        examinerInstruction:
          "Bestätigen Sie SF11 (Blockade in letzten 30 Tagen mit Lösung) und SF12 (gegenwärtig blockiert). Bei Abweichungen korrigieren.",
        appAction: "SF11 und SF12 bei Bedarf anpassen",
      },
      {
        id: "lock-c-4",
        label: "Seitenbezug durch Interview bestimmen",
        patientScript: "Auf welcher Seite spüren Sie die Blockade — rechts, links oder auf beiden Seiten?",
        examinerInstruction:
          "Die Seitenzuordnung muss durch das Interview erfolgen (nicht im Fragebogen enthalten).",
        appAction: "Seitenzuordnung in den Office-Use-Feldern eintragen (R/L/beides)",
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
      "Überprüfen Sie die Angaben zum offenen Locking. Der Seitenbezug muss durch das Interview festgestellt werden.",
    flow: [
      {
        id: "lock-o-1",
        label: "Kiefersperre bestätigen (SF13)",
        patientScript:
          "Sie haben angegeben, dass Ihr Kiefer bei weiter Mundöffnung blockiert ist und Sie den Mund nicht mehr schließen konnten. Können Sie diese Situation beschreiben?",
        examinerInstruction:
          "Lassen Sie den Patienten die Episode beschreiben. Unterscheiden Sie zwischen echtem Open Lock (Kiefer bleibt in maximaler Öffnung fixiert) und Unsicherheit/Angst vor weiter Öffnung.",
      },
      {
        id: "lock-o-2",
        label: "Lösungsmaßnahmen klären (SF14)",
        patientScript:
          "Mussten Sie etwas unternehmen, um den Kiefer wieder schließen zu können — z.\u00A0B. entspannen, bewegen oder drücken?",
        examinerInstruction:
          "Bestätigen Sie SF14. Typische Maßnahmen bei echtem Open Lock: aktive Manipulation, Relaxation oder Hilfe durch Dritte.",
        appAction: "SF14 bei Bedarf anpassen",
      },
      {
        id: "lock-o-3",
        label: "Seitenbezug durch Interview bestimmen",
        patientScript: "Auf welcher Seite tritt die Blockade auf — rechts, links oder auf beiden Seiten?",
        examinerInstruction:
          "Die Seitenzuordnung muss durch das Interview erfolgen (nicht im Fragebogen enthalten).",
        appAction: "Seitenzuordnung in den Office-Use-Feldern eintragen (R/L/beides)",
      },
    ],
  },
};
