# DC-TMD Instruction Strings

Jede Anweisung hat eine eindeutige ID. Text hier ändern, dann ins TypeScript übertragen.

- `>` = Wörtliche Patientenanweisung (verbatim, in Anführungszeichen gesprochen)
- Ohne `>` = Untersucher-Handlungsanweisung (nicht zum Patienten gesprochen)
- `{{duration}}` = Platzhalter: basic=2, standard=5

---

## Patientenanweisungen

### P01 · e1-intro-preamble
> „Bevor ich mit der Untersuchung beginne, möchte ich noch einige Punkte mit Ihnen besprechen."

### P02 · e1-intro-pain-format
> „Ich werde Sie zu Schmerzen befragen, wobei nur Sie selbst wissen ob Sie Schmerzen haben. Wenn ich Sie nach Schmerzen frage, möchte ich, dass Sie mit „Ja" oder „Nein" antworten. Falls Sie unsicher sind, geben Sie bitte Ihre bestmögliche Antwort."

### P03 · e1-intro-familiar-pain
> „Falls Sie Schmerzen fühlen, werde ich Sie auch fragen, ob Ihnen der Schmerz bekannt ist. Die Bezeichnung „bekannter Schmerz" bezieht sich auf Schmerzen, die sich ähnlich oder genauso anfühlen wie die Schmerzen, die Sie in den letzten 30 Tagen in dem gleichen Bereich ihres Körpers gespürt haben."

### P04 · e1-intro-familiar-headache
> „Falls Sie Schmerzen im Bereich der Schläfen fühlen, werde ich Sie fragen, ob diese Schmerzen sich wie irgendwelche Kopfschmerzen anfühlen, die Sie während der letzten 30 Tage im Schläfenbereich gehabt haben."

### P05 · e1-intro-scope
> „Zum Zweck dieser Untersuchung interessieren mich Schmerzen, die Sie in den folgenden Bereichen… und auch innerhalb des Mundes haben könnten."

### P06 · e1a-pain-question
> „Hatten Sie während der letzten 30 Tage in diesen Bereichen Schmerzen?"

### P07 · e1a-locate
> „Bitte zeigen Sie mit Ihrem Finger auf die jeweiligen Bereiche, in denen Sie Schmerzen hatten."

### P08 · e1a-more
> „Gibt es noch weitere Bereiche, in denen Sie Schmerzen hatten?"

### P09 · e1b-headache-question
> „Hatten Sie während der letzten 30 Tage Kopfschmerzen?"

### P10 · e1b-locate
> „Bitte zeigen Sie mit Ihrem Finger auf die jeweiligen Bereiche, in denen Sie Kopfschmerzen gefühlt haben."

### P11 · e1b-more
> „Gibt es noch weitere Bereiche, in denen Sie Kopfschmerzen hatten?"

### P12 · e2-marking
> „Ich werde einige Bleistiftmarkierungen auf Ihren Zähnen anbringen; ich werde sie am Ende der Untersuchung entfernen."

### P13 · shared-close-teeth
> „Bitte legen Sie Ihre Backenzähne vollständig aufeinander."

### P14 · e3-opening-instruction
> „Ich möchte, dass Sie Ihren Mund langsam so weit wie möglich öffnen, auch wenn es schmerzhaft ist, und dann schließen, bis Ihre Backenzähne wieder vollständig aufeinander liegen."

### P15 · e3-repeat
> „Noch zweimal wiederholen."

### P16 · e4a-pain-free-opening
> „Ich möchte, dass Sie Ihren Mund so weit wie möglich öffnen, ohne dadurch Schmerzen auszulösen oder bestehende Schmerzen zu verstärken."

### P17 · e4b-max-opening
> „Ich möchte, dass Sie den Mund so weit wie möglich öffnen, auch wenn es schmerzhaft ist."

### P18 · e4c-announce
> „Gleich werde ich versuchen, Ihren Mund mit meinen Fingern noch weiter zu öffnen. Wenn Sie möchten, dass ich aufhöre, heben Sie bitte Ihre Hand. Dann werde ich sofort aufhören."

### P19 · e4c-ruler
> „Ich werde mein Lineal platzieren."

### P20 · e4c-open
> „Bitte öffnen Sie jetzt so weit wie möglich, auch wenn es schmerzhaft ist, so wie Sie es eben schon gemacht haben."

### P21 · e4c-tactile
> „Sie spüren jetzt gleich meine Finger."

### P22 · e4c-relax
> „Bitte entspannen Sie Ihren Kiefer, so dass ich Ihnen helfen kann, noch weiter zu öffnen, wenn möglich."

### P23 · pain-movement-question
> „Hatten Sie bei dieser Bewegung irgendwelche Schmerzen?"

### P24 · pain-manipulation-question
> „Hatten Sie irgendwelche Schmerzen, als ich versucht habe, Ihren Mund mit meinen Fingern weiter zu öffnen?"

### P25 · pain-locate
> „Können Sie mit Ihrem Finger auf alle Bereiche zeigen, in denen Sie Schmerzen gespürt haben?"

### P26 · pain-familiar
> „Ist dieser Schmerz Ihnen bekannt von Schmerzen, die Sie in diesem Bereich in den letzten 30 Tagen erfahren haben?"

### P27 · pain-done-movement
> „Gibt es noch weitere Bereiche, in denen Sie bei dieser Bewegung Schmerzen gespürt haben? Zeigen Sie auf diese Bereiche."

### P28 · pain-done-manipulation
> „Gibt es noch weitere Bereiche, in denen Sie Schmerzen gespürt haben, als ich Ihren Mund weiter geöffnet habe?"

### P29 · e5a-lateral-right
> „Bitte öffnen Sie leicht und bewegen Sie Ihren Kiefer so weit wie möglich nach rechts, auch wenn es schmerzhaft ist."

### P30 · e5b-lateral-left
> „Bitte öffnen Sie leicht und bewegen Sie Ihren Kiefer so weit wie möglich nach links, auch wenn es schmerzhaft ist."

### P31 · e5c-protrusion
> „Bitte öffnen Sie leicht und bewegen Sie Ihren Kiefer so weit wie möglich nach vorn, auch wenn es schmerzhaft ist."

### P32 · e5-hold
> „Halten Sie Ihren Kiefer in dieser Position, bis ich eine Messung vorgenommen habe."

### P33 · e9-intro
> „Nun werde ich in verschiedenen Bereichen Ihres Kopfes, Ihres Gesichtes und Ihres Kiefers Druck ausüben und Sie nach Schmerzen fragen. Ich werde Sie nach Schmerzen, bekannten Schmerzen und bekannten Kopfschmerzen fragen."

### P34 · e9-intro-referred
> „Zusätzlich werde ich Sie fragen, ob der Schmerz nur unter meinem Finger bleibt oder Sie ihn auch noch in anderen Bereichen als unter meinem Finger spüren."

### P35 · e9-intro-prompts-basic
> „Ich werde Sie mit den Worten „Schmerz", „bekannter Schmerz" und „bekannter Kopfschmerz" abfragen."

### P36 · e9-intro-prompts-standard
> „Ich werde Sie mit den Worten „Schmerz", „bekannter Schmerz", „bekannter Kopfschmerz" und „nur unter meinem Finger?" abfragen."

### P37 · e9-intro-duration
> „Ich werde den Druck jedes Mal für {{duration}} Sekunden aufrechterhalten."

### P38 · e9-temporalis-clench
> „Bitte beißen Sie kurz zusammen."

### P39 · e9-relax-jaw
> „Bitte entspannen Sie Ihren Kiefer."

### P40 · e9-tmj-protrude-return
> „Bitte öffnen Sie leicht, schieben Sie Ihren Unterkiefer nach vorn und bewegen Sie dann Ihren Kiefer wieder zurück in seine normale Position ohne, dass Ihre Zähne sich berühren."

### P41 · e9-tmj-protrude-hold
> „Bitte öffnen Sie den Mund leicht, schieben Sie den Unterkiefer ein wenig nach vorn und halten Sie ihn dort."

### P42 · e9-referred-localize
> „Zeigen Sie mit Ihrem Finger auf alle Bereiche, in denen Sie gerade Schmerzen gespürt haben."

### P43 · e9-pain-short
> „Hatten Sie Schmerzen?"

---

## Untersucheranweisungen

### X01 · e1-intro-scope-touch
Beidseits gleichzeitig berühren: Temporalis, Präauriculärbereich, Masseter, retro-/submandibulärer Bereich

### X02 · e1-intro-efficient
Nach mehreren positiven Schmerzantworten kann der Patient zu abgekürzten Antworten angeleitet werden: „ja, bekannt" oder „ja, nicht bekannt".

### X03 · e1-confirm
Betroffene Bereiche berühren zur Bestätigung, „hier?" fragen

### X04 · e2-ref-select
Referenzzähne im OK und UK auswählen (typisch 11/21)

### X05 · e2-mark-line
Horizontale Linie auf UK-Schneidezahn markieren, wo OK-Kante den UK überlappt

### X06 · e2-midline-assess
Dentale Mittellinien OK/UK vergleichen. < 1mm = keine Abweichung (0 mm)

### X07 · e2-midline-measure
Bei >= 1mm: Richtung und Betrag notieren

### X08 · e2-overjet-measure
Horizontalen Abstand von labial OK zu labial UK messen

### X09 · e2-overlap-open
Patient auffordern, ausreichend zu öffnen für Messung

### X10 · e2-overlap-measure
Vertikalen Überbiss an der Markierung messen

### X11 · e3-observe
Öffnungsbewegung beobachten: Gerade (< 2mm), korrigiert (>= 2mm mit Rückkehr), unkorrigiert (>= 2mm ohne Rückkehr)

### X12 · e3-repeat-count
Insgesamt 3x beobachten

### X13 · e4-intro-overview
Drei Öffnungstests: (A) schmerzfrei, (B) maximal aktiv, (C) maximal passiv. Nach U4B und U4C folgt die strukturierte Schmerzbefragung.

### X14 · shared-interview-flow
Befragungsablauf bei Bewegungsschmerz: Schmerz? → Lokalisation zeigen → Anatomische Struktur bestätigen → Bekannter Schmerz? → [Bekannter Kopfschmerz?] → Weitere Bereiche?

### X15 · shared-anatomy-identification
Patient zeigt Schmerzbereich, Untersucher berührt zur Bestätigung und identifiziert anatomische Struktur (Muskel, Gelenk, andere). Bei unklarer Zuordnung im Präauriculärbereich: Kondylus durch Protrusion lokalisieren, Masseter-Grenze durch Zubeißen identifizieren.

### X16 · e4-intro-efficient
Nach mehreren positiven Befunden: Abgekürzte Antworten „ja, bekannt" / „ja, nicht bekannt".

### X17 · shared-ruler-placement
0-Marke an Inzisalkante des unteren Referenzzahns anlegen.

### X18 · shared-interincisal-read
Interinzisale Distanz ablesen.

### X19 · e4c-scissor-technique
Daumen auf obere, Zeigefinger auf untere Schneidezähne. Mäßigen Druck anwenden bis Gewebswiderstand.

### X20 · pain-confirm-structure
Bereich berühren und anatomische Struktur identifizieren

### X21 · pain-familiar-headache-additional
Bei Temporalis-Lokalisation zusätzlich: „Ist dieser Schmerz Ihnen bekannt von Kopfschmerzen, die Sie in diesem Bereich in den letzten 30 Tagen hatten?"

### X22 · e5-intro-overview
Drei Bewegungstests: (A) Laterotrusion rechts, (B) Laterotrusion links, (C) Protrusion. Nach jeder Bewegung folgt die strukturierte Schmerzbefragung.

### X23 · e5-lateral-midline-measure
Lineal an UK-Mittellinie anlegen und Distanz zur OK-Mittellinie messen.

### X24 · e5c-protrusion-measure
Labialfläche OK-Referenzzahn zu Labialfläche UK-Referenzzahn messen.

### X25 · e9-intro-calibrate
Mit Finger-Algometer auf 1,0 kg kalibrieren

### X26 · e9-temporalis-identify-muscles
Muskelgrenzen durch Anspannung identifizieren

### X27 · e9-temporalis-palpate
3 vertikale Zonen (anterior, Mitte, posterior). 1 kg, {{duration}} Sek/Zone

### X28 · e9-masseter-palpate
3 horizontale Bänder (Ursprung, Körper, Ansatz). 1 kg, {{duration}} Sek/Band

### X29 · e9-tmj-lat-calibrate
Auf 0,5 kg kalibrieren

### X30 · e9-tmj-lat-palpate
Zeigefinger anterior des Tragus auf lateralem Pol. 0,5 kg, {{duration}} Sek.

### X31 · e9-tmj-around-calibrate
Auf 1,0 kg kalibrieren

### X32 · e9-tmj-around-palpate
Finger um lateralen Kondylenpol rollen. 1 kg, zirkuläre Bewegung, ~{{duration}} Sek.

### X33 · e9-referred-muscle
Jenseits der Muskelgrenze = übertragener Schmerz. Innerhalb des Muskels = ausbreitender Schmerz.

### X34 · e9-referred-joint
Jenseits des Gelenks = übertragener Schmerz.

---

## Warnungen

### W01 · e4c-safety
Bei Handheben des Patienten sofort stoppen

---

## Duplikat-Übersicht

Folgende Strings sind im TypeScript mehrfach inline kopiert.
Bei Textänderung müssen alle Stellen aktualisiert werden:

| ID | Kopien |
|----|--------|
| P13 | 3x |
| P25 | 2x |
| P26 | 2x |
| P32 | 3x |
| P43 | 2x |
| X03 | 2x |
| X14 | 2x |
| X15 | 2x |
| X17 | 3x |
| X18 | 3x |
| X20 | 2x |
| X21 | 2x |
| X23 | 2x |
