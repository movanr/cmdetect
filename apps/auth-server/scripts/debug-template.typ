
#let data = (metadata: (exportDate: "2026-01-20T19:24:32.883Z", caseId: "test-case-123", organizationName: "Test Praxis"), patient: (firstName: "Max", lastName: "Mustermann", dateOfBirth: "1990-05-15", clinicInternalId: "PAT-001"), questionnaires: (phq4: (total: 6, maxTotal: 12, anxiety: 3, maxAnxiety: 6, depression: 3, maxDepression: 6), gcps1m: (cpi: 45, cpiLevel: "low", interferenceScore: 30, interferencePoints: 1, disabilityDays: 5, disabilityDaysPoints: 1, totalDisabilityPoints: 2, grade: 2, gradeInterpretation: (grade: 2, label: "High Intensity", labelDe: "Hohe Intensitaet")), jfls8: (globalScore: 1.2, maxScore: 10, answeredCount: 8, totalQuestions: 8, missingCount: 0, isValid: true, limitationLevel: "mild", limitationInterpretation: (label: "Mild Limitation", labelDe: "Leichte Einschraenkung")), obc: (totalScore: 20, maxScore: 84, answeredCount: 21, totalQuestions: 21, riskLevel: "elevated", riskInterpretation: (label: "Elevated Risk", labelDe: "Erhoehtes Risiko")), sq: (answers: (SQ1: "yes", SQ5: "no"), screeningNegative: false, reviewedAt: "2026-01-20T19:24:32.884Z")), painDrawing: (score: (regionCount: 2, affectedRegions: ("head-right", "head-left",), elementCounts: ("head-right": (shadings: 3, points: 2, arrows: 1, total: 6), "head-left": (shadings: 2, points: 1, arrows: 0, total: 3)), totalElements: 9, patterns: (hasHeadPain: true, hasOralPain: false, hasBodyPain: false, hasWidespreadPain: false), riskLevel: "regional", interpretation: (labelDe: "Regionaler Schmerz", descriptionDe: "Schmerzen in mehreren zusammenhaengenden Regionen")), images: (:)))

// CMDetect Anamnesis Report Template
// Simple, clean clinical layout with tables
// All text in German

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

// ============================================================================
// Title and Patient Info
// ============================================================================

#align(center)[
  #text(size: 16pt, weight: "bold")[Anamnese-Bericht]
  #v(0.3em)
  #text(size: 10pt, fill: gray)[DC/TMD Symptom-Fragebogen Auswertung]
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

// ============================================================================
// Score Summary
// ============================================================================

#section-heading("Zusammenfassung der Auswertungen")

#let phq4-data = data.questionnaires.at("phq4", default: none)
#let gcps1m-data = data.questionnaires.at("gcps1m", default: none)
#let jfls8-data = data.questionnaires.at("jfls8", default: none)
#let jfls20-data = data.questionnaires.at("jfls20", default: none)
#let obc-data = data.questionnaires.at("obc", default: none)
#let sq-data = data.questionnaires.at("sq", default: none)
#let painDrawing-data = data.at("painDrawing", default: none)

// Build summary rows dynamically
#let summary-rows = ()

#if phq4-data != none {
  let assessment = if phq4-data.total <= 2 { "Normal" } else if phq4-data.total <= 5 { "Leicht" } else if phq4-data.total <= 8 { "Moderat" } else { "Schwer" }
  summary-rows.push(([PHQ-4 (Psychische Belastung)], [#phq4-data.total / #phq4-data.maxTotal], [0-12], [#assessment]))
}

#if gcps1m-data != none {
  summary-rows.push(([GCPS (Chronische Schmerzen)], [Grad #gcps1m-data.grade], [0-IV], [#gcps1m-data.gradeInterpretation.labelDe]))
}

#if jfls8-data != none and jfls8-data.isValid and jfls8-data.globalScore != none {
  let interp = if jfls8-data.limitationInterpretation != none { jfls8-data.limitationInterpretation.labelDe } else { "-" }
  summary-rows.push(([JFLS-8 (Kieferfunktion)], [#str(calc.round(jfls8-data.globalScore, digits: 1))], [0-10], [#interp]))
}

#if jfls20-data != none and jfls20-data.isValid and jfls20-data.globalScore != none {
  let interp = if jfls20-data.limitationInterpretation != none { jfls20-data.limitationInterpretation.labelDe } else { "-" }
  summary-rows.push(([JFLS-20 (Kieferfunktion erweitert)], [#str(calc.round(jfls20-data.globalScore, digits: 1))], [0-10], [#interp]))
}

#if obc-data != none {
  summary-rows.push(([OBC (Orale Verhaltensweisen)], [#obc-data.totalScore / #obc-data.maxScore], [0-84], [#obc-data.riskInterpretation.labelDe]))
}

#if painDrawing-data != none {
  summary-rows.push(([Schmerzzeichnung], [#painDrawing-data.score.regionCount / 5 Regionen], [0-5], [#painDrawing-data.score.interpretation.labelDe]))
}

#if sq-data != none {
  let result = if sq-data.screeningNegative { "Negativ" } else { "Positiv" }
  let assessment = if sq-data.screeningNegative { "Keine Symptome" } else { "Weitere Untersuchung" }
  summary-rows.push(([DC/TMD Symptom-Fragebogen], [#result], [-], [#assessment]))
}

#table(
  columns: (1fr, auto, auto, auto),
  stroke: 0.5pt,
  inset: 6pt,
  table.header([*Fragebogen*], [*Ergebnis*], [*Bereich*], [*Bewertung*]),
  ..summary-rows.flatten()
)

// ============================================================================
// PHQ-4 Details
// ============================================================================

#if phq4-data != none {
  section-heading("PHQ-4 - Gesundheitsfragebogen fuer Patienten")

  text(size: 9pt, fill: gray)[
    Wie oft fuehlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeintraechtigt?
  ]

  v(0.5em)

  table(
    columns: (auto, 1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    table.header([*Nr.*], [*Frage*], [*Antwort*]),
    [1], [Nervositaet, Aengstlichkeit oder Anspannung],
    [#if phq4-data.at("answers", default: none) != none { phq4-data.answers.at("PHQ4_C", default: "-") } else { "-" }],
    [2], [Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren],
    [#if phq4-data.at("answers", default: none) != none { phq4-data.answers.at("PHQ4_D", default: "-") } else { "-" }],
    [3], [Wenig Interesse oder Freude an Ihren Taetigkeiten],
    [#if phq4-data.at("answers", default: none) != none { phq4-data.answers.at("PHQ4_A", default: "-") } else { "-" }],
    [4], [Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit],
    [#if phq4-data.at("answers", default: none) != none { phq4-data.answers.at("PHQ4_B", default: "-") } else { "-" }],
  )

  v(0.3em)
  text(size: 9pt)[
    *Auswertung:* Gesamt #phq4-data.total / #phq4-data.maxTotal |
    Angst (GAD-2): #phq4-data.anxiety / #phq4-data.maxAnxiety |
    Depression (PHQ-2): #phq4-data.depression / #phq4-data.maxDepression
  ]

  if phq4-data.total >= 6 {
    v(0.3em)
    text(weight: "bold", size: 9pt)[Hinweis: Klinisch auffaellig (>= 6 Punkte) - Weitere Abklaerung empfohlen]
  }
}

// ============================================================================
// GCPS-1M Details
// ============================================================================

#if gcps1m-data != none {
  section-heading("GCPS - Stufenskala fuer chronische Schmerzen (1-Monats-Version)")

  table(
    columns: (1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    [Chronifizierungsgrad], [*Grad #gcps1m-data.grade* - #gcps1m-data.gradeInterpretation.labelDe],
    [Charakteristische Schmerzintensitaet (CPI)], [#gcps1m-data.cpi / 100 (#gcps1m-data.cpiLevel)],
    [Beeintraechtigungswert], [#gcps1m-data.interferenceScore / 100],
    [Beeintraechtigungspunkte], [#gcps1m-data.interferencePoints BP],
    [Beeintraechtigungstage], [#gcps1m-data.disabilityDays #if gcps1m-data.disabilityDays == 1 { "Tag" } else { "Tage" }],
    [Tage-Punkte], [#gcps1m-data.disabilityDaysPoints BP],
    [Gesamt-Beeintraechtigungspunkte], [#gcps1m-data.totalDisabilityPoints / 6 BP],
  )

  if gcps1m-data.grade >= 3 {
    v(0.3em)
    text(weight: "bold", size: 9pt)[Hinweis: Dysfunktionaler chronischer Schmerz]
  }
}

// ============================================================================
// JFLS-8 Details
// ============================================================================

#if jfls8-data != none {
  section-heading("JFLS-8 - Kieferfunktions-Einschraenkungsskala (Kurzform)")

  if jfls8-data.isValid and jfls8-data.globalScore != none {
    table(
      columns: (1fr, auto),
      stroke: 0.5pt,
      inset: 6pt,
      [Globaler Score], [*#str(calc.round(jfls8-data.globalScore, digits: 2))* / #jfls8-data.maxScore],
      [Einschraenkungsniveau], [#if jfls8-data.limitationInterpretation != none { jfls8-data.limitationInterpretation.labelDe } else { "-" }],
      [Beantwortete Fragen], [#jfls8-data.answeredCount / #jfls8-data.totalQuestions],
    )

    v(0.3em)
    text(size: 9pt, fill: gray)[
      Referenzwerte: Gesund = 0.16 | TMD-Patienten = 1.74
    ]
  } else {
    text(fill: gray)[Zu viele fehlende Antworten (#jfls8-data.missingCount / #jfls8-data.totalQuestions)]
  }
}

// ============================================================================
// JFLS-20 Details
// ============================================================================

#if jfls20-data != none {
  section-heading("JFLS-20 - Kieferfunktions-Einschraenkungsskala (Erweitert)")

  if jfls20-data.isValid and jfls20-data.globalScore != none {
    table(
      columns: (1fr, auto),
      stroke: 0.5pt,
      inset: 6pt,
      [Globaler Score], [*#str(calc.round(jfls20-data.globalScore, digits: 2))* / #jfls20-data.maxScore],
      [Einschraenkungsniveau], [#if jfls20-data.limitationInterpretation != none { jfls20-data.limitationInterpretation.labelDe } else { "-" }],
      [Beantwortete Fragen], [#jfls20-data.answeredCount / #jfls20-data.totalQuestions],
    )

    v(0.5em)
    text(weight: "bold", size: 10pt)[Subskalen:]
    v(0.3em)

    let subs = jfls20-data.subscales
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
    text(fill: gray)[Zu viele fehlende Antworten (#jfls20-data.missingCount / #jfls20-data.totalQuestions)]
  }
}

// ============================================================================
// OBC Details
// ============================================================================

#if obc-data != none {
  section-heading("OBC - Oral Behaviors Checklist")

  table(
    columns: (1fr, auto),
    stroke: 0.5pt,
    inset: 6pt,
    [Gesamtpunktzahl], [*#obc-data.totalScore* / #obc-data.maxScore],
    [Risikoniveau], [#obc-data.riskInterpretation.labelDe],
    [Beantwortete Fragen], [#obc-data.answeredCount / #obc-data.totalQuestions],
  )

  v(0.3em)
  text(size: 9pt, fill: gray)[
    Schwellenwerte: Normal (0-16) | Erhoeht (17-24) | Hoch (25+)
  ]

  if obc-data.riskLevel == "high" {
    v(0.3em)
    text(weight: "bold", size: 9pt)[Hinweis: Risikofaktor zur Entstehung von CMD (17x haeufiger bei Score >= 25)]
  }
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
    [Schmerzausbreitung], [#score.interpretation.labelDe],
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
// SQ Details
// ============================================================================

#if sq-data != none {
  section-heading("DC/TMD Symptom-Fragebogen (SQ)")

  if sq-data.screeningNegative {
    text(weight: "bold")[Screening-Ergebnis: Negativ]
    v(0.3em)
    text[Keine CMD-Symptome angegeben. Keine weitere klinische Untersuchung erforderlich.]
  } else {
    text(weight: "bold")[Screening-Ergebnis: Positiv]
    v(0.3em)
    text[CMD-Symptome angegeben. Weitere klinische Untersuchung empfohlen.]
  }

  if sq-data.at("reviewedAt", default: none) != none {
    v(0.3em)
    text(size: 9pt, fill: gray)[Geprueft am: #sq-data.reviewedAt.slice(0, 10)]
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

