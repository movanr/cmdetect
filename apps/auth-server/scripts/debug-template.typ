
#let data = (metadata: (exportDate: "2026-01-20T20:55:20.417Z", caseId: "test-case-123", organizationName: "Test Praxis"), patient: (firstName: "Max", lastName: "Mustermann", dateOfBirth: "1990-05-15", clinicInternalId: "PAT-001"), questionnaires: (phq4: (score: (total: 6, maxTotal: 12, anxiety: 3, maxAnxiety: 6, depression: 3, maxDepression: 6), answers: (PHQ4_1: "2", PHQ4_2: "1", PHQ4_3: "2", PHQ4_4: "1")), gcps1m: (score: (cpi: 45, cpiLevel: "low", interferenceScore: 30, interferencePoints: 1, disabilityDays: 5, disabilityDaysPoints: 1, totalDisabilityPoints: 2, grade: 2, gradeInterpretation: (grade: 2, label: "Hohe Intensitaet")), answers: (GCPS_1: 5, GCPS_2: 6, GCPS_3: 4, GCPS_4: 3, GCPS_5: 2, GCPS_6: 4, GCPS_7: 5)), jfls8: (score: (globalScore: 1.2, maxScore: 10, answeredCount: 8, totalQuestions: 8, missingCount: 0, isValid: true, limitationLevel: "mild", limitationInterpretation: (label: "Leichte Einschraenkung")), answers: (JFLS8_1: "1", JFLS8_2: "2", JFLS8_3: "1", JFLS8_4: "1", JFLS8_5: "2", JFLS8_6: "1", JFLS8_7: "1", JFLS8_8: "0")), obc: (score: (totalScore: 20, maxScore: 84, answeredCount: 21, totalQuestions: 21, riskLevel: "elevated", riskInterpretation: (label: "Erhoehtes Risiko")), answers: (OBC_1: "1", OBC_2: "2", OBC_3: "1", OBC_4: "0", OBC_5: "1", OBC_6: "2", OBC_7: "1", OBC_8: "0", OBC_9: "1", OBC_10: "1", OBC_11: "2", OBC_12: "1", OBC_13: "0", OBC_14: "1", OBC_15: "2", OBC_16: "1", OBC_17: "0", OBC_18: "1", OBC_19: "1", OBC_20: "0", OBC_21: "1")), sq: (answers: (SQ1: "yes", SQ2: (years: 2, months: 3), SQ3: "intermittent", SQ4_A: "yes", SQ4_B: "no", SQ4_C: "yes", SQ4_D: "no", SQ5: "yes", SQ6: (years: 1, months: 0), SQ7_A: "yes", SQ7_B: "no", SQ7_C: "no", SQ7_D: "yes", SQ8: "yes", SQ9: "no", SQ13: "no"), screeningNegative: false, reviewedAt: "2026-01-20T20:55:20.418Z")), painDrawing: (score: (regionCount: 2, affectedRegions: ("head-right", "head-left",), elementCounts: ("head-right": (shadings: 3, points: 2, arrows: 1, total: 6), "head-left": (shadings: 2, points: 1, arrows: 0, total: 3)), totalElements: 9, patterns: (hasHeadPain: true, hasOralPain: false, hasBodyPain: false, hasWidespreadPain: false), riskLevel: "regional", interpretation: (label: "Regionaler Schmerz", description: "Schmerzen in mehreren zusammenhaengenden Regionen")), images: (:)), definitions: (phq4: (metadata: (id: "phq-4", title: "PHQ-4 Gesundheitsfragebogen", version: "1.0", instruction: "Wie oft fühlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeinträchtigt?"), questions: ((id: "PHQ4_C", text: "Nervosität, Ängstlichkeit oder Anspannung"), (id: "PHQ4_D", text: "Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren"), (id: "PHQ4_A", text: "Wenig Interesse oder Freude an Ihren Tätigkeiten"), (id: "PHQ4_B", text: "Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit"),), optionLabels: ("0": "Überhaupt nicht", "1": "An einzelnen Tagen", "2": "An mehr als der Hälfte der Tage", "3": "Beinahe jeden Tag")), gcps1m: (metadata: (id: "gcps-1m", title: "Graduierung chronischer Schmerzen", version: "12/2018", source: "Von Korff M. Deutsche Übersetzung: Asendorf A, Eberhard L, Universitätsklinikum Heidelberg & Schierz O, Universitätsmedizin Leipzig.", timeframe: "1-month"), questions: ((id: "GCPS1M_1", text: "An wie vielen Tagen in den letzten 6 Monaten hatten Sie Gesichtsschmerzen?"), (id: "GCPS1M_2", text: "Wie würden Sie Ihre Gesichtsschmerzen zum JETZIGEN Zeitpunkt einschätzen?"), (id: "GCPS1M_3", text: "Wie würden Sie Ihren STÄRKSTEN Gesichtsschmerz in den LETZTEN 30 TAGEN einschätzen?"), (id: "GCPS1M_4", text: "Wie würden Sie Ihre DURCHSCHNITTLICHEN Gesichtsschmerzen in den LETZTEN 30 TAGEN einschätzen?"), (id: "GCPS1M_5", text: "Wie viele Tage haben Ihre Gesichtsschmerzen Sie in den LETZTEN 30 TAGEN von Ihren ÜBLICHEN AKTIVITÄTEN wie Arbeit, Schule oder Hausarbeit abgehalten?"), (id: "GCPS1M_6", text: "Wie stark haben Ihre Gesichtsschmerzen Sie in den LETZTEN 30 TAGEN bei Ihren TÄGLICHEN AKTIVITÄTEN beeinträchtigt?"), (id: "GCPS1M_7", text: "Wie stark haben Ihre Gesichtsschmerzen Sie in den LETZTEN 30 TAGEN bei Ihren FREIZEIT-, GESELLSCHAFTS- UND FAMILIENAKTIVITÄTEN beeinträchtigt?"), (id: "GCPS1M_8", text: "Wie stark haben Ihre Gesichtsschmerzen in den LETZTEN 30 TAGEN Ihre ARBEITSFÄHIGKEIT, einschließlich Hausarbeit, beeinträchtigt?"),), optionLabels: ("0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10")), jfls8: (metadata: (id: "jfls-8", title: "JFLS-8 - Kieferfunktions-Einschränkungsskala", version: "12/2018", source: "Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org", timeframe: "1-month"), questions: ((id: "JFLS8_1", text: "Zähe Nahrung kauen"), (id: "JFLS8_2", text: "Hühnchen kauen (z.B. nach Zubereitung im Backofen)"), (id: "JFLS8_3", text: "Weiche Nahrung essen, die nicht gekaut werden muss (z.B. Kartoffelpüree, Apfelmus, Pudding, pürierte Nahrung)"), (id: "JFLS8_4", text: "Weit genug den Mund öffnen, um aus einer Tasse zu trinken"), (id: "JFLS8_5", text: "Schlucken"), (id: "JFLS8_6", text: "Gähnen"), (id: "JFLS8_7", text: "Sprechen"), (id: "JFLS8_8", text: "Lächeln"),), optionLabels: ("0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10")), jfls20: (metadata: (id: "jfls-20", title: "JFLS-20 - Kieferfunktions-Einschränkungsskala", version: "12/2018", source: "Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org", timeframe: "1-month"), questions: ((id: "JFLS20_1", text: "Zähe Nahrung kauen"), (id: "JFLS20_2", text: "Hartes Brot kauen"), (id: "JFLS20_3", text: "Hühnchen kauen (z.B. nach Zubereitung im Backofen)"), (id: "JFLS20_4", text: "Kräcker/ Kekse kauen"), (id: "JFLS20_5", text: "Weiche Speisen kauen (z.B. Nudeln, eingemachte oder weiche Früchte, gekochtes Gemüse, Fisch)"), (id: "JFLS20_6", text: "Weiche Nahrung essen, die nicht gekaut werden muss (z.B. Kartoffelpüree, Apfelmus, Pudding, pürierte Nahrung)"), (id: "JFLS20_7", text: "Weit genug den Mund öffnen, um von einem ganzen Apfel abzubeißen"), (id: "JFLS20_8", text: "Weit genug den Mund öffnen, um in ein belegtes Brot zu beißen"), (id: "JFLS20_9", text: "Weit genug den Mund öffnen, um zu reden"), (id: "JFLS20_10", text: "Weit genug den Mund öffnen, um aus einer Tasse zu trinken"), (id: "JFLS20_11", text: "Schlucken"), (id: "JFLS20_12", text: "Gähnen"), (id: "JFLS20_13", text: "Sprechen"), (id: "JFLS20_14", text: "Singen"), (id: "JFLS20_15", text: "Fröhliches Gesicht machen"), (id: "JFLS20_16", text: "Wütendes Gesicht machen"), (id: "JFLS20_17", text: "Stirnrunzeln"), (id: "JFLS20_18", text: "Küssen"), (id: "JFLS20_19", text: "Lächeln"), (id: "JFLS20_20", text: "Lachen"),), optionLabels: ("0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10")), obc: (metadata: (id: "obc", title: "OBC - Oral Behaviors Checklist", version: "12/2018", source: "Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org", timeframe: "1-month"), questions: ((id: "OBC_1", text: "Pressen oder Knirschen mit den Zähnen während des Schlafs, basierend auf jeglichen verfügbaren Informationen"), (id: "OBC_2", text: "Schlafen in einer Position, die Druck auf den Kiefer ausübt (z.B. auf dem Bauch oder auf der Seite)"), (id: "OBC_3", text: "Im Wachzustand mit den Zähnen knirschen"), (id: "OBC_4", text: "Im Wachzustand die Zähne zusammenpressen"), (id: "OBC_5", text: "Pressen, Berühren oder Zusammenhalten der Zähne außer beim Essen (gemeint ist der Kontakt zwischen Zähnen des Ober- und Unterkiefers)"), (id: "OBC_6", text: "Halten, Verspannen oder Anspannen der Muskulatur ohne Pressen oder Aufeinanderhalten der Zähne"), (id: "OBC_7", text: "Den Kiefer nach vorn oder zur Seite halten oder schieben"), (id: "OBC_8", text: "Die Zunge kraftvoll gegen die Zähne pressen"), (id: "OBC_9", text: "Die Zunge zwischen die Zahnreihen legen"), (id: "OBC_10", text: "Auf Ihre Zunge, Wange oder Lippen beißen, kauen oder mit ihnen spielen"), (id: "OBC_11", text: "Den Kiefer in einer starren oder angespannten Position halten, wie um den Kiefer zu stützen oder zu schützen"), (id: "OBC_12", text: "Objekte wie Haare, Pfeife, Bleistift, Stifte, Finger, Fingernägel usw. zwischen den Zähnen halten oder darauf beißen"), (id: "OBC_13", text: "Kaugummikauen"), (id: "OBC_14", text: "Spielen eines Musikinstruments, bei dem der Mund oder Kiefer beansprucht wird (z.B. Holz-, Blechblas-, Streichinstrumente)"), (id: "OBC_15", text: "Sich mit Ihrer Hand auf den Kiefer lehnen, wie beim Stützen oder Ausruhen des Kinns in der Hand"), (id: "OBC_16", text: "Kauen von Nahrung nur auf einer Seite"), (id: "OBC_17", text: "Essen zwischen den Mahlzeiten (gemeint ist Nahrung, die gekaut werden muss)"), (id: "OBC_18", text: "Anhaltendes Sprechen (z.B. Lehrtätigkeit, Verkauf, Kundenservice)"), (id: "OBC_19", text: "Singen"), (id: "OBC_20", text: "Gähnen"), (id: "OBC_21", text: "Halten des Telefons zwischen Ihrem Kopf und Ihren Schultern"),), sleepOptionLabels: ("0": "Nie", "1": "<1 Nacht/Monat", "2": "1-3 Nächte/Monat", "3": "1-3 Nächte/Woche", "4": "4-7 Nächte/Woche"), wakingOptionLabels: ("0": "Nie", "1": "Selten", "2": "Manchmal", "3": "Häufig", "4": "Immer")), sq: (metadata: (id: "dc-tmd-sq", title: "DC/TMD Symptom-Fragebogen", version: "1.0"), questions: ((id: "SQ1", displayId: "SF1", text: "Schmerzen im Kiefer/Schläfe/Ohr (jemals)"), (id: "SQ2", displayId: "SF2", text: "Schmerzbeginn (Dauer)"), (id: "SQ3", displayId: "SF3", text: "Schmerzhäufigkeit (letzte 30 Tage)"), (id: "SQ4_A", displayId: "SF4a", text: "Aktivität beeinflusst Schmerzen: Kauen harter Nahrung"), (id: "SQ4_B", displayId: "SF4b", text: "Aktivität beeinflusst Schmerzen: Mundöffnung/Kieferbewegung"), (id: "SQ4_C", displayId: "SF4c", text: "Aktivität beeinflusst Schmerzen: Pressen/Knirschen/Kaugummi"), (id: "SQ4_D", displayId: "SF4d", text: "Aktivität beeinflusst Schmerzen: Reden/Küssen/Gähnen"), (id: "SQ5", displayId: "SF5", text: "Schläfenkopfschmerzen (letzte 30 Tage)"), (id: "SQ6", displayId: "SF6", text: "Kopfschmerzbeginn (Dauer)"), (id: "SQ7_A", displayId: "SF7a", text: "Aktivität beeinflusst Kopfschmerzen: Kauen"), (id: "SQ7_B", displayId: "SF7b", text: "Aktivität beeinflusst Kopfschmerzen: Mundöffnung"), (id: "SQ7_C", displayId: "SF7c", text: "Aktivität beeinflusst Kopfschmerzen: Pressen/Knirschen"), (id: "SQ7_D", displayId: "SF7d", text: "Aktivität beeinflusst Kopfschmerzen: Reden/Küssen/Gähnen"), (id: "SQ8", displayId: "SF8", text: "Kiefergelenkgeräusche (letzte 30 Tage)"), (id: "SQ9", displayId: "SF9", text: "Kiefersperre geschlossen (jemals)"), (id: "SQ10", displayId: "SF10", text: "Kiefersperre: Einschränkung beim Essen"), (id: "SQ11", displayId: "SF11", text: "Kiefersperre mit Lösung (letzte 30 Tage)"), (id: "SQ12", displayId: "SF12", text: "Kiefersperre gegenwärtig"), (id: "SQ13", displayId: "SF13", text: "Kiefersperre offen (letzte 30 Tage)"), (id: "SQ14", displayId: "SF14", text: "Maßnahme zum Schließen nötig"),), yesNoLabels: (yes: "Ja", no: "Nein"), painFrequencyLabels: (no_pain: "Keine Schmerzen", intermittent: "Schmerzen kommen und gehen", continuous: "Schmerzen sind immer vorhanden"))))

// CMDetect Anamnesis Report Template
// Simple, clean clinical layout with tables
// All text in German
// Structure: Axis 1 (SQ Symptom Questionnaire) + Axis 2 (Psychosocial Questionnaires)

// Data is injected as Typst dictionary at compile time
// Data injected above

// ============================================================================
// Document Setup
// ============================================================================

#set document(title: "Anamnese-Bericht", author: "CMDetect")

#set page(
  paper: "a4",
  margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm),
  footer: context {
    set text(size: 9pt, fill: gray)
    grid(
      columns: (1fr, 1fr),
      align: (left, right),
      [Erstellt: #data.metadata.exportDate.slice(0, 10)],
      [Seite #counter(page).display("1 / 1", both: true)]
    )
  }
)

#set text(size: 10pt, lang: "de")
#set par(justify: true)

// Simple section heading
#let section-heading(title) = {
  v(1em)
  text(weight: "bold", size: 12pt, title)
  v(0.3em)
  line(length: 100%, stroke: 0.5pt)
  v(0.5em)
}

// Axis heading (larger, with background)
#let axis-heading(title) = {
  v(1.5em)
  block(
    fill: luma(240),
    inset: 8pt,
    width: 100%,
    text(weight: "bold", size: 14pt, title)
  )
  v(0.5em)
}

// ============================================================================
// Title and Patient Info
// ============================================================================

#align(center)[
  #text(size: 16pt, weight: "bold")[Anamnese-Bericht]
  #v(0.3em)
  #text(size: 10pt, fill: gray)[DC/TMD Auswertung]
]

#v(1em)

// Patient information table
#let orgName = data.metadata.at("organizationName", default: none)
#table(
  columns: (auto, 1fr, auto, 1fr),
  stroke: 0.5pt,
  inset: 6pt,
  [*Patient:*], [#data.patient.firstName #data.patient.lastName],
  [*Geburtsdatum:*], [#data.patient.dateOfBirth],
  [*Interne ID:*], [#data.patient.clinicInternalId],
  [*Fall-ID:*], [#data.metadata.caseId],
  if orgName != none { [*Praxis:*] } else { [] },
  if orgName != none { orgName } else { [] },
  [*Export:*], [#data.metadata.exportDate.slice(0, 10)],
)

// Extract questionnaire data
#let phq4-data = data.questionnaires.at("phq4", default: none)
#let gcps1m-data = data.questionnaires.at("gcps1m", default: none)
#let jfls8-data = data.questionnaires.at("jfls8", default: none)
#let jfls20-data = data.questionnaires.at("jfls20", default: none)
#let obc-data = data.questionnaires.at("obc", default: none)
#let sq-data = data.questionnaires.at("sq", default: none)
#let painDrawing-data = data.at("painDrawing", default: none)

// ============================================================================
// AXIS 1: DC/TMD Symptom-Fragebogen
// ============================================================================

#axis-heading("Achse I: DC/TMD Symptom-Fragebogen")

#if sq-data != none {
  let sq-def = data.definitions.sq
  let sq-answers = sq-data.at("answers", default: (:))

  // Screening result summary
  table(
    columns: (1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    [*Screening-Ergebnis*], [#if sq-data.screeningNegative { text(fill: green.darken(20%))[Negativ] } else { text(fill: red.darken(20%), weight: "bold")[Positiv] }],
    [*Bewertung*], [#if sq-data.screeningNegative { "Keine CMD-Symptome" } else { "Weitere Untersuchung empfohlen" }],
  )

  if sq-data.at("reviewedAt", default: none) != none {
    v(0.3em)
    text(size: 9pt, fill: gray)[Geprueft am: #sq-data.reviewedAt.slice(0, 10)]
  }

  // Questions and answers table
  v(0.5em)
  text(weight: "bold", size: 10pt)[Antworten:]
  v(0.3em)

  // Helper to format SQ answer values
  let format-sq-answer(q-id, answer-value) = {
    if answer-value == none { return "-" }

    // Handle composite number answers (duration fields)
    if type(answer-value) == dictionary {
      let years = answer-value.at("years", default: 0)
      let months = answer-value.at("months", default: 0)
      if years > 0 and months > 0 {
        return str(years) + " Jahre, " + str(months) + " Monate"
      } else if years > 0 {
        return str(years) + " Jahre"
      } else if months > 0 {
        return str(months) + " Monate"
      } else {
        return "0"
      }
    }

    // Handle SQ3 pain frequency
    if q-id == "SQ3" {
      return sq-def.painFrequencyLabels.at(str(answer-value), default: str(answer-value))
    }

    // Handle yes/no answers
    return sq-def.yesNoLabels.at(str(answer-value), default: str(answer-value))
  }

  let question-rows = ()
  for (i, q) in sq-def.questions.enumerate() {
    let answer-value = sq-answers.at(q.id, default: none)
    let answer-display = format-sq-answer(q.id, answer-value)
    question-rows.push(([#q.displayId], [#q.text], [#answer-display]))
  }

  table(
    columns: (auto, 1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*ID*], [*Frage*], [*Antwort*]),
    ..question-rows.flatten()
  )
} else {
  text(fill: gray)[Keine Daten vorhanden]
}

// ============================================================================
// AXIS 2: Psychosoziale Fragebögen
// ============================================================================

#axis-heading("Achse II: Psychosoziale Fragebögen")

// Build summary rows for Axis 2 questionnaires
#let summary-rows = ()

#if phq4-data != none {
  let phq4-score = phq4-data.score
  let assessment = if phq4-score.total <= 2 { "Normal" } else if phq4-score.total <= 5 { "Leicht" } else if phq4-score.total <= 8 { "Moderat" } else { "Schwer" }
  summary-rows.push(([PHQ-4 (Psychische Belastung)], [#phq4-score.total / #phq4-score.maxTotal], [0-12], [#assessment]))
}

#if gcps1m-data != none {
  let gcps-score = gcps1m-data.score
  summary-rows.push(([GCPS (Chronische Schmerzen)], [Grad #gcps-score.grade], [0-IV], [#gcps-score.gradeInterpretation.label]))
}

#if jfls8-data != none and jfls8-data.score.isValid and jfls8-data.score.globalScore != none {
  let jfls8-score = jfls8-data.score
  let interp = if jfls8-score.limitationInterpretation != none { jfls8-score.limitationInterpretation.label } else { "-" }
  summary-rows.push(([JFLS-8 (Kieferfunktion)], [#str(calc.round(jfls8-score.globalScore, digits: 1))], [0-10], [#interp]))
}

#if jfls20-data != none and jfls20-data.score.isValid and jfls20-data.score.globalScore != none {
  let jfls20-score = jfls20-data.score
  let interp = if jfls20-score.limitationInterpretation != none { jfls20-score.limitationInterpretation.label } else { "-" }
  summary-rows.push(([JFLS-20 (Kieferfunktion erweitert)], [#str(calc.round(jfls20-score.globalScore, digits: 1))], [0-10], [#interp]))
}

#if obc-data != none {
  let obc-score = obc-data.score
  summary-rows.push(([OBC (Orale Verhaltensweisen)], [#obc-score.totalScore / #obc-score.maxScore], [0-84], [#obc-score.riskInterpretation.label]))
}

#if painDrawing-data != none {
  summary-rows.push(([Schmerzzeichnung], [#painDrawing-data.score.regionCount / 5 Regionen], [0-5], [#painDrawing-data.score.interpretation.label]))
}

#if summary-rows.len() > 0 {
  section-heading("Zusammenfassung")

  table(
    columns: (1fr, auto, auto, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*Fragebogen*], [*Ergebnis*], [*Bereich*], [*Bewertung*]),
    ..summary-rows.flatten()
  )
}

// ============================================================================
// PHQ-4 Details
// ============================================================================

#if phq4-data != none {
  let phq4-def = data.definitions.phq4
  let phq4-score = phq4-data.score
  let phq4-answers = phq4-data.at("answers", default: (:))

  section-heading(phq4-def.metadata.title)

  text(size: 9pt, fill: gray)[
    #phq4-def.metadata.instruction
  ]

  v(0.5em)

  // Build question rows dynamically from definitions
  let question-rows = ()
  for (i, q) in phq4-def.questions.enumerate() {
    let answer-value = phq4-answers.at(q.id, default: none)
    let answer-label = if answer-value != none {
      // Convert to string for dictionary lookup (answers may be integers)
      phq4-def.optionLabels.at(str(answer-value), default: str(answer-value))
    } else { "-" }
    question-rows.push(([#(i + 1)], [#q.text], [#answer-label]))
  }

  table(
    columns: (auto, 1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*Nr.*], [*Frage*], [*Antwort*]),
    ..question-rows.flatten()
  )

  v(0.3em)
  text(size: 9pt)[
    *Auswertung:* Gesamt #phq4-score.total / #phq4-score.maxTotal |
    Angst (GAD-2): #phq4-score.anxiety / #phq4-score.maxAnxiety |
    Depression (PHQ-2): #phq4-score.depression / #phq4-score.maxDepression
  ]

  if phq4-score.total >= 6 {
    v(0.3em)
    text(weight: "bold", size: 9pt)[Hinweis: Klinisch auffaellig (>= 6 Punkte) - Weitere Abklaerung empfohlen]
  }
}

// ============================================================================
// GCPS-1M Details
// ============================================================================

#if gcps1m-data != none {
  let gcps-def = data.definitions.gcps1m
  let gcps-score = gcps1m-data.score
  let gcps-answers = gcps1m-data.at("answers", default: (:))

  section-heading(gcps-def.metadata.title)

  // Score summary table
  table(
    columns: (1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    [Chronifizierungsgrad], [*Grad #gcps-score.grade* - #gcps-score.gradeInterpretation.label],
    [Charakteristische Schmerzintensitaet (CPI)], [#gcps-score.cpi / 100 (#gcps-score.cpiLevel)],
    [Beeintraechtigungswert], [#gcps-score.interferenceScore / 100],
    [Beeintraechtigungspunkte], [#gcps-score.interferencePoints BP],
    [Beeintraechtigungstage], [#gcps-score.disabilityDays #if gcps-score.disabilityDays == 1 { "Tag" } else { "Tage" }],
    [Tage-Punkte], [#gcps-score.disabilityDaysPoints BP],
    [Gesamt-Beeintraechtigungspunkte], [#gcps-score.totalDisabilityPoints / 6 BP],
  )

  if gcps-score.grade >= 3 {
    v(0.3em)
    text(weight: "bold", size: 9pt)[Hinweis: Dysfunktionaler chronischer Schmerz]
  }

  // Questions and answers
  v(0.5em)
  text(weight: "bold", size: 10pt)[Antworten:]
  v(0.3em)

  let question-rows = ()
  for (i, q) in gcps-def.questions.enumerate() {
    let answer-value = gcps-answers.at(q.id, default: none)
    let answer-display = if answer-value != none { str(answer-value) } else { "-" }
    question-rows.push(([#(i + 1)], [#q.text], [#answer-display]))
  }

  table(
    columns: (auto, 1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*Nr.*], [*Frage*], [*Antwort*]),
    ..question-rows.flatten()
  )
}

// ============================================================================
// JFLS-8 Details
// ============================================================================

#if jfls8-data != none {
  let jfls8-def = data.definitions.jfls8
  let jfls8-score = jfls8-data.score
  let jfls8-answers = jfls8-data.at("answers", default: (:))

  section-heading(jfls8-def.metadata.title)

  if jfls8-score.isValid and jfls8-score.globalScore != none {
    table(
      columns: (1fr, auto),
      stroke: 0.5pt,
      inset: 6pt,
      [Globaler Score], [*#str(calc.round(jfls8-score.globalScore, digits: 2))* / #jfls8-score.maxScore],
      [Einschraenkungsniveau], [#if jfls8-score.limitationInterpretation != none { jfls8-score.limitationInterpretation.label } else { "-" }],
      [Beantwortete Fragen], [#jfls8-score.answeredCount / #jfls8-score.totalQuestions],
    )

    v(0.3em)
    text(size: 9pt, fill: gray)[
      Referenzwerte: Gesund = 0.16 | TMD-Patienten = 1.74
    ]
  } else {
    text(fill: gray)[Zu viele fehlende Antworten (#jfls8-score.missingCount / #jfls8-score.totalQuestions)]
  }

  // Questions and answers
  v(0.5em)
  text(weight: "bold", size: 10pt)[Antworten:]
  v(0.3em)

  let question-rows = ()
  for (i, q) in jfls8-def.questions.enumerate() {
    let answer-value = jfls8-answers.at(q.id, default: none)
    let answer-label = if answer-value != none {
      // Convert to string for dictionary lookup (answers may be integers)
      jfls8-def.optionLabels.at(str(answer-value), default: str(answer-value))
    } else { "-" }
    question-rows.push(([#(i + 1)], [#q.text], [#answer-label]))
  }

  table(
    columns: (auto, 1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*Nr.*], [*Frage*], [*Antwort*]),
    ..question-rows.flatten()
  )
}

// ============================================================================
// JFLS-20 Details
// ============================================================================

#if jfls20-data != none {
  let jfls20-def = data.definitions.jfls20
  let jfls20-score = jfls20-data.score
  let jfls20-answers = jfls20-data.at("answers", default: (:))

  section-heading(jfls20-def.metadata.title)

  if jfls20-score.isValid and jfls20-score.globalScore != none {
    table(
      columns: (1fr, auto),
      stroke: 0.5pt,
      inset: 6pt,
      [Globaler Score], [*#str(calc.round(jfls20-score.globalScore, digits: 2))* / #jfls20-score.maxScore],
      [Einschraenkungsniveau], [#if jfls20-score.limitationInterpretation != none { jfls20-score.limitationInterpretation.label } else { "-" }],
      [Beantwortete Fragen], [#jfls20-score.answeredCount / #jfls20-score.totalQuestions],
    )

    v(0.5em)
    text(weight: "bold", size: 10pt)[Subskalen:]
    v(0.3em)

    let subs = jfls20-score.subscales
    table(
      columns: (1fr, auto, auto),
      stroke: 0.5pt,
      inset: 6pt,
      table.header([*Subskala*], [*Score*], [*Beantwortet*]),
      [Mastikation (Kauen)],
      [#if subs.mastication.isValid and subs.mastication.score != none { str(calc.round(subs.mastication.score, digits: 1)) } else { "n/a" }],
      [#subs.mastication.answeredCount / #subs.mastication.totalQuestions],
      [Mobilitaet],
      [#if subs.mobility.isValid and subs.mobility.score != none { str(calc.round(subs.mobility.score, digits: 1)) } else { "n/a" }],
      [#subs.mobility.answeredCount / #subs.mobility.totalQuestions],
      [Kommunikation],
      [#if subs.communication.isValid and subs.communication.score != none { str(calc.round(subs.communication.score, digits: 1)) } else { "n/a" }],
      [#subs.communication.answeredCount / #subs.communication.totalQuestions],
    )
  } else {
    text(fill: gray)[Zu viele fehlende Antworten (#jfls20-score.missingCount / #jfls20-score.totalQuestions)]
  }

  // Questions and answers
  v(0.5em)
  text(weight: "bold", size: 10pt)[Antworten:]
  v(0.3em)

  let question-rows = ()
  for (i, q) in jfls20-def.questions.enumerate() {
    let answer-value = jfls20-answers.at(q.id, default: none)
    let answer-label = if answer-value != none {
      // Convert to string for dictionary lookup (answers may be integers)
      jfls20-def.optionLabels.at(str(answer-value), default: str(answer-value))
    } else { "-" }
    question-rows.push(([#(i + 1)], [#q.text], [#answer-label]))
  }

  table(
    columns: (auto, 1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*Nr.*], [*Frage*], [*Antwort*]),
    ..question-rows.flatten()
  )
}

// ============================================================================
// OBC Details
// ============================================================================

#if obc-data != none {
  let obc-def = data.definitions.obc
  let obc-score = obc-data.score
  let obc-answers = obc-data.at("answers", default: (:))

  section-heading(obc-def.metadata.title)

  table(
    columns: (1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    [Gesamtpunktzahl], [*#obc-score.totalScore* / #obc-score.maxScore],
    [Risikoniveau], [#obc-score.riskInterpretation.label],
    [Beantwortete Fragen], [#obc-score.answeredCount / #obc-score.totalQuestions],
  )

  v(0.3em)
  text(size: 9pt, fill: gray)[
    Schwellenwerte: Normal (0-16) | Erhoeht (17-24) | Hoch (25+)
  ]

  if obc-score.riskLevel == "high" {
    v(0.3em)
    text(weight: "bold", size: 9pt)[Hinweis: Risikofaktor zur Entstehung von CMD (17x haeufiger bei Score >= 25)]
  }

  // Questions and answers
  v(0.5em)
  text(weight: "bold", size: 10pt)[Antworten:]
  v(0.3em)

  let question-rows = ()
  for (i, q) in obc-def.questions.enumerate() {
    let answer-value = obc-answers.at(q.id, default: none)
    // OBC_1 uses sleep option labels, all others use waking option labels
    let option-labels = if q.id == "OBC_1" { obc-def.sleepOptionLabels } else { obc-def.wakingOptionLabels }
    let answer-label = if answer-value != none {
      // Convert to string for dictionary lookup (answers may be integers)
      option-labels.at(str(answer-value), default: str(answer-value))
    } else { "-" }
    question-rows.push(([#(i + 1)], [#q.text], [#answer-label]))
  }

  table(
    columns: (auto, 1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*Nr.*], [*Frage*], [*Antwort*]),
    ..question-rows.flatten()
  )
}

// ============================================================================
// Pain Drawing Details
// ============================================================================

#if painDrawing-data != none {
  section-heading("Schmerzzeichnung")

  let score = painDrawing-data.score

  table(
    columns: (1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    [Betroffene Regionen], [*#score.regionCount* / 5],
    [Schmerzausbreitung], [#score.interpretation.label],
    [Gesamtanzahl Markierungen], [#score.totalElements],
  )

  if score.regionCount > 0 {
    v(0.5em)
    text(weight: "bold", size: 10pt)[Betroffene Bereiche:]
    v(0.3em)

    let patterns = score.patterns
    let areas = ()
    if patterns.hasHeadPain { areas.push("Kopfbereich") }
    if patterns.hasOralPain { areas.push("Orale Region") }
    if patterns.hasBodyPain { areas.push("Koerperbereich") }

    if areas.len() > 0 {
      text[#areas.join(", ")]
    }

    v(0.3em)
    text(size: 9pt, fill: gray)[
      Regionen: #score.affectedRegions.join(", ")
    ]
  }

  if score.patterns.hasWidespreadPain {
    v(0.3em)
    text(weight: "bold", size: 9pt)[Hinweis: Verbreiteter Schmerz - Kann auf Fibromyalgie hinweisen]
  }
}

// ============================================================================
// Footer Note
// ============================================================================

#v(2em)
#line(length: 100%, stroke: 0.5pt)
#v(0.5em)
#text(size: 8pt, fill: gray)[
  Dieser Bericht wurde automatisch von CMDetect generiert.
  Die klinische Interpretation obliegt dem behandelnden Arzt.
  Alle Fragebogen basieren auf den DC/TMD Protokollen.
]

