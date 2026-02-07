# DC-TMD Instruction Strings

Jede Anweisung hat eine eindeutige ID. Text hier ändern, dann ins TypeScript übertragen.

- `>` = Wörtliche Patientenanweisung (verbatim, in Anführungszeichen gesprochen)
- Ohne `>` = Untersucher-Handlungsanweisung (nicht zum Patienten gesprochen)
- `{{duration}}` = Platzhalter: basic=2, standard=5

---

## Patientenanweisungen

### P01 · e1-intro-preamble
> „Bevor wir mit der eigentlichen Untersuchung starten, möchte ich Ihnen kurz erklären, wie sie abläuft."

### P02 · e1-intro-pain-format
> „Ich werde Ihnen gleich Fragen zu möglichen Schmerzen stellen. Ob Sie Schmerzen haben, können nur Sie selbst beurteilen. Bitte antworten Sie auf diese Fragen jeweils mit „Ja" oder „Nein". Wenn Sie sich nicht ganz sicher sind, geben Sie bitte die Antwort, die Ihrer Einschätzung am nächsten kommt."

### P03 · e1-intro-familiar-pain
> „Wenn Sie Schmerzen angeben, frage ich Sie außerdem, ob Ihnen diese Art von Schmerz bekannt vorkommt. Damit meine ich Schmerzen, die sich ähnlich oder gleich anfühlen wie Beschwerden, die Sie in den letzten 30 Tagen an derselben Körperstelle hatten."

### P04 · e1-intro-familiar-headache
> „Falls Sie Schmerzen im Bereich der Schläfen verspüren, werde ich Sie zusätzlich fragen, ob sich diese Schmerzen wie Kopfschmerzen anfühlen, die Sie in den letzten 30 Tagen dort erlebt haben."

### P05 · e1-intro-scope
> „Für diese Untersuchung interessieren uns Schmerzen im Bereich von Gesicht und Kiefer sowie mögliche Beschwerden im Mundraum."

### P06 · e1a-pain-question
> „Hatten Sie in den letzten 30 Tagen in einem dieser Bereiche Schmerzen?"

### P07 · e1a-locate
> „Bitte zeigen Sie mir mit dem Finger die Stellen, an denen Sie Schmerzen verspürt haben."

### P08 · e1a-more
> „Gab es noch weitere Stellen, an denen Sie Schmerzen hatten?"

### P09 · e1b-headache-question
> „Hatten Sie in den letzten 30 Tagen Kopfschmerzen?"

### P10 · e1b-locate
> „Bitte zeigen Sie mir die Bereiche, in denen Sie diese Kopfschmerzen gespürt haben."

### P11 · e1b-more
> „Gab es noch weitere Bereiche, in denen Sie Kopfschmerzen hatten?"

### P12 · e2-marking
> „Ich werde nun ein paar kleine Markierungen mit einem Bleistift auf Ihren Zähnen anbringen. Diese entferne ich am Ende der Untersuchung wieder."

### P13 · shared-close-teeth
> „Bitte beißen Sie jetzt locker mit den Backenzähnen zusammen."

### P14 · e3-opening-instruction
> „Bitte öffnen Sie Ihren Mund langsam so weit wie möglich, auch wenn dabei Schmerzen auftreten, und schließen Sie ihn anschließend wieder, bis die Backenzähne erneut aufeinanderliegen."

### P15 · e3-repeat
> „Bitte führen Sie diese Bewegung noch zweimal aus."

### P16 · e4a-pain-free-opening
> „Öffnen Sie nun den Mund so weit, wie es für Sie möglich ist, ohne dabei Schmerzen auszulösen oder zu verstärken."

### P17 · e4b-max-opening
> „Bitte öffnen Sie Ihren Mund jetzt so weit wie möglich, auch wenn dies mit Schmerzen verbunden ist."

### P18 · e4c-announce
> „Ich werde gleich vorsichtig mit meinen Fingern versuchen, Ihren Mund weiter zu öffnen. Wenn Sie möchten, dass ich aufhöre, heben Sie bitte Ihre Hand – ich stoppe dann sofort."

### P19 · e4c-ruler
> „Ich positioniere jetzt mein Messinstrument."

### P20 · e4c-open
> „Bitte öffnen Sie den Mund nun erneut so weit wie möglich, so wie eben zuvor, auch wenn dabei Schmerzen auftreten."

### P21 · e4c-tactile
> „Sie werden gleich meine Finger spüren."

### P22 · e4c-relax
> „Versuchen Sie bitte, Ihren Kiefer möglichst locker zu lassen, damit ich Sie beim weiteren Öffnen unterstützen kann."

### P23 · pain-movement-question
> „Sind bei dieser Bewegung Schmerzen aufgetreten?"

### P24 · pain-manipulation-question
> „Hatten Sie Schmerzen, als ich Ihren Mund mit den Fingern weiter geöffnet habe?"

### P25 · pain-locate
> „Bitte zeigen Sie mir alle Stellen, an denen Sie dabei Schmerzen gespürt haben."

### P26 · pain-familiar
> „Kommt Ihnen dieser Schmerz bekannt vor im Vergleich zu Schmerzen, die Sie in den letzten 30 Tagen an dieser Stelle hatten?"

### P27 · pain-done-movement
> „Gab es bei dieser Bewegung noch weitere schmerzhafte Bereiche? Bitte zeigen Sie diese ebenfalls."

### P28 · pain-done-manipulation
> „Gab es weitere Stellen, an denen Sie Schmerzen gespürt haben, während ich Ihren Mund weiter geöffnet habe?"

### P29 · e5a-lateral-right
> „Bitte öffnen Sie den Mund leicht und bewegen Sie den Unterkiefer so weit wie möglich nach rechts, auch wenn dabei Schmerzen auftreten."

### P30 · e5b-lateral-left
> „Bitte öffnen Sie den Mund leicht und bewegen Sie den Unterkiefer so weit wie möglich nach links, auch wenn dabei Schmerzen auftreten."

### P31 · e5c-protrusion
> „Bitte öffnen Sie den Mund leicht und schieben Sie den Unterkiefer so weit wie möglich nach vorne, auch wenn dies schmerzhaft ist."

### P32 · e5-hold
> „Halten Sie diese Position bitte so lange, bis ich die Messung abgeschlossen habe."

### P33 · e9-intro
> „Im nächsten Schritt werde ich an verschiedenen Stellen Ihres Kopfes, Gesichts und Kiefers Druck ausüben und Sie jeweils nach möglichen Schmerzen befragen."

### P34 · e9-intro-referred
> „Ich werde Sie außerdem fragen, ob der Schmerz nur an der berührten Stelle auftritt oder auch in andere Bereiche ausstrahlt."

### P35 · e9-intro-prompts-basic
> „Dabei werde ich gezielt nach „Schmerz", „bekanntem Schmerz" und „bekanntem Kopfschmerz" fragen."

### P36 · e9-intro-prompts-standard
> „Zusätzlich frage ich, ob der Schmerz ausschließlich unter meinem Finger zu spüren ist."

### P37 · e9-intro-duration
> „Ich werde den Druck jeweils für {{duration}} Sekunden aufrechterhalten."

### P38 · e9-temporalis-clench
> „Bitte beißen Sie jetzt kurz zusammen."

### P39 · e9-relax-jaw
> „Bitte lassen Sie den Kiefer wieder locker."

### P40 · e9-tmj-protrude-return
> „Öffnen Sie den Mund leicht, schieben Sie den Unterkiefer nach vorne und führen Sie ihn anschließend wieder in die normale Position zurück, ohne dass die Zähne Kontakt haben."

### P41 · e9-tmj-protrude-hold
> „Bitte öffnen Sie den Mund leicht, schieben Sie den Unterkiefer etwas nach vorne und halten Sie diese Position."

### P42 · e9-referred-localize
> „Zeigen Sie bitte auf alle Stellen, an denen Sie gerade Schmerzen gespürt haben."

### P43 · e9-pain-short
> „Sind Schmerzen aufgetreten?"

---

## Untersucheranweisungen

### X01 · e1-intro-scope-touch
Beidseits gleichzeitig palpieren: Temporalisregion, präaurikulärer Bereich, Masseterregion sowie retro- und submandibulärer Bereich

### X02 · e1-intro-efficient
Bei wiederholten positiven Angaben kann der Patient zu verkürzten Antworten angeleitet werden (z. B. „ja, bekannt" / „ja, nicht bekannt").

### X03 · e1-confirm
Zur Bestätigung betroffene Region erneut berühren und verbal rückfragen („hier?").

### X04 · e2-ref-select
Referenzzähne im Ober- und Unterkiefer festlegen (typischerweise 11/21).

### X05 · e2-mark-line
Am unteren Schneidezahn eine horizontale Markierung anbringen, an der die Kante des oberen Schneidezahns überlappt.

### X06 · e2-midline-assess
Dentale Mittellinien von Ober- und Unterkiefer vergleichen. Abweichung < 1 mm als 0 mm werten.

### X07 · e2-midline-measure
Bei Abweichungen ≥ 1 mm Richtung und Ausmaß dokumentieren.

### X08 · e2-overjet-measure
Horizontalen Abstand zwischen labialer Fläche des oberen und unteren Schneidezahns messen.

### X09 · e2-overlap-open
Patienten auffordern, den Mund ausreichend zu öffnen, um die Messung durchführen zu können.

### X10 · e2-overlap-measure
Vertikalen Überbiss an der zuvor angebrachten Markierung bestimmen.

### X11 · e3-observe
Öffnungsbewegung beurteilen: gerade (< 2 mm), korrigiert (≥ 2 mm mit Rückkehr zur Mittellinie), unkorrigiert (≥ 2 mm ohne Rückkehr).

### X12 · e3-repeat-count
Bewegung insgesamt dreimal beobachten.

### X13 · e4-intro-overview
Drei Öffnungstests durchführen: (A) schmerzfreie aktive Öffnung, (B) maximale aktive Öffnung, (C) maximale passive Öffnung. Nach B und C folgt jeweils die strukturierte Schmerzabfrage.

### X14 · shared-interview-flow
Ablauf bei bewegungsabhängigem Schmerz: Schmerz vorhanden? → Lokalisation zeigen lassen → anatomische Struktur bestätigen → bekannter Schmerz? → ggf. bekannter Kopfschmerz? → weitere Bereiche?

### X15 · shared-anatomy-identification
Vom Patienten gezeigten Bereich palpieren und zugehörige Struktur identifizieren (Muskel, Gelenk oder andere). Bei unklarer Zuordnung im präaurikulären Bereich: Kondylus durch Protrusion lokalisieren, Massetergrenze durch Zubeißen bestimmen.

### X16 · e4-intro-efficient
Bei mehreren positiven Befunden verkürzte Antworten zulassen („ja, bekannt" / „ja, nicht bekannt").

### X17 · shared-ruler-placement
Nullmarke des Lineals an der Inzisalkante des unteren Referenzzahns ansetzen.

### X18 · shared-interincisal-read
Interinzisalen Abstand ablesen und dokumentieren.

### X19 · e4c-scissor-technique
Daumen an oberen, Zeigefinger an unteren Schneidezähnen platzieren. Gleichmäßigen moderaten Druck bis zum Gewebswiderstand ausüben.

### X20 · pain-confirm-structure
Schmerzhaften Bereich palpieren und die anatomische Struktur benennen.

### X21 · pain-familiar-headache-additional
Bei Schmerzangabe im Temporalisbereich zusätzlich nach bekannter Kopfschmerzsymptomatik der letzten 30 Tage fragen.

### X22 · e5-intro-overview
Drei Bewegungsprüfungen durchführen: (A) Laterotrusion rechts, (B) Laterotrusion links, (C) Protrusion. Nach jeder Bewegung strukturierte Schmerzabfrage.

### X23 · e5-lateral-midline-measure
Lineal an der Mittellinie des Unterkiefers anlegen und Distanz zur Oberkiefermittellinie messen.

### X24 · e5c-protrusion-measure
Abstand zwischen labialer Fläche des oberen und unteren Referenzzahns bestimmen.

### X25 · e9-intro-calibrate
Finger-Algometer vor Beginn auf 1,0 kg kalibrieren.

### X26 · e9-temporalis-identify-muscles
Muskelgrenzen durch kurzes Anspannen lassen sichtbar machen.

### X27 · e9-temporalis-palpate
Temporalis in drei vertikalen Abschnitten palpieren (anterior, mittel, posterior). Druck: 1 kg, Dauer: {{duration}} Sekunden pro Abschnitt.

### X28 · e9-masseter-palpate
Masseter in drei horizontalen Abschnitten palpieren (Ursprung, Muskelbauch, Ansatz). Druck: 1 kg, Dauer: {{duration}} Sekunden pro Abschnitt.

### X29 · e9-tmj-lat-calibrate
Palpationsdruck auf 0,5 kg einstellen.

### X30 · e9-tmj-lat-palpate
Zeigefinger unmittelbar anterior des Tragus am lateralen Kondylenpol platzieren. Druck: 0,5 kg für {{duration}} Sekunden.

### X31 · e9-tmj-around-calibrate
Druck auf 1,0 kg einstellen.

### X32 · e9-tmj-around-palpate
Finger mit zirkulärer Bewegung um den lateralen Kondylenpol führen. Druck: 1 kg, Dauer: ca. {{duration}} Sekunden.

### X33 · e9-referred-muscle
Schmerz außerhalb der Muskelgrenze als übertragen werten, Schmerz innerhalb des Muskels als ausbreitend.

### X34 · e9-referred-joint
Schmerzempfindung jenseits des Gelenkbereichs als übertragenen Schmerz werten.

---

## Warnungen

### W01 · e4c-safety
Bei Handzeichen des Patienten die Untersuchung sofort abbrechen.

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
