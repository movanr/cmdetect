# Regelwerk: Befundbericht-Generierung aus DC/TMD-Untersuchung

Dieses Dokument beschreibt die Regeln, nach denen aus einem ausgefüllten DC/TMD-Untersuchungsbogen (Achse I) ein lesbarer klinischer Befundbericht generiert wird. Das Ziel ist eine Detailstufe _zwischen_ Rohdaten und Arztbrief: vollständiger und strukturierter als ein Arztbrief, aber gestraffter als die Rohdaten.

---

## 1. Meta-Regeln

Die Meta-Regeln gelten übergreifend und haben Vorrang vor den sektionsspezifischen Templates. Die Templates sind Instanziierungen dieser Meta-Regeln für konkrete Sektionen.

### 1.1 Satzstruktur (allgemeines Schema)

Jeder Befundsatz folgt dem Schema:

> **[Phänomen] + [Lokalisation] + [Bewegung] + [Quellen] + [Qualifikatoren]**

Nicht zutreffende Bausteine entfallen ersatzlos:

- _Bewegung_ entfällt bei Palpation und bei statischen Messungen.
- _Quellen_ (Untersucher/Patient) entfällt außerhalb der Geräuschbefunde (U6/U7).
- _Qualifikatoren_ umfassen Schmerzzusätze (Übertragung, Ausbreitung, Kopfschmerz), Lösbarkeit (U8) etc.

Diese Reihenfolge ist der Default für alle Sektionen. Abweichungen sollten begründet sein.

### 1.2 Satzgranularität (Zeile = Satz)

Die atomare Einheit ist eine Zeile der Untersuchungstabelle — typischerweise eine Kombination aus **Seite × Phänomen**.

Pro atomarer Einheit wird ein Satz gebildet. **Ausnahme — Zusammenführung:** Sind zwei atomare Einheiten strukturell _vollständig identisch_ mit Ausnahme der Seite, werden sie zu einem Satz mit "beidseits" zusammengeführt. Bei Asymmetrie in irgendeinem Feld (auch Qualifikatoren) bleiben sie als getrennte Sätze.

### 1.3 Reihenfolge im Bericht

Die Sektionsreihenfolge folgt der Untersuchung:
U1a → U1b → U2 → U3 → U4 → U5 → U6 → U7 → U8 → U9 → U10

Innerhalb einer Sektion: erst rechts, dann links, dann beidseits-Zusammenführungen (soweit anwendbar).

### 1.4 Formatierung

- Fließtext ohne Sektionsnummern und ohne Überschriften.
- Einheiten werden ausgeschrieben ("mm").
- Keine Aufzählungszeichen.

### 1.5 Relevanzfilter

**Auf Sektionsebene.** Eine Sektion erscheint im Bericht nur, wenn mindestens ein Hauptphänomen positiv ist oder ein Messwert vorliegt. Komplett leere oder durchweg negative Sektionen entfallen ersatzlos.

**Innerhalb einer Sektion — Dimensionen vs. Qualifikatoren.** Felder, die ein Hauptphänomen näher beschreiben, werden in zwei Kategorien unterteilt:

- **Dimensionen** sind Felder, die eine eigenständige atomare Einheit definieren (Seite, Bewegungsrichtung). Wenn eine Dimension negativ ist, _existiert die atomare Einheit nicht_ und wird folgerichtig auch nicht erwähnt — weder positiv noch verneint. Beispiel: Wenn Knacken nur beim Öffnen auftritt, lautet der Satz "Knacken beim Öffnen" — nicht "Knacken beim Öffnen, nicht beim Schließen". Die Abwesenheit des Schließ-Knackens ergibt sich implizit aus dem Weglassen.

- **Qualifikatoren** sind Felder, die ein positives Hauptphänomen näher beschreiben, ohne eine eigene atomare Einheit zu bilden (Schmerzart, Lösbarkeit, Quellen). Sobald das Hauptphänomen positiv ist, werden alle Qualifikatoren vollständig ausformuliert — auch verneinte (z.B. "ohne Übertragung", "vom Patient nicht bemerkt").

Nicht-untersuchte Felder (`null`) entfallen in beiden Fällen.

**Abgrenzung der beiden Kategorien:**

| Sektion | Dimensionen (nur positiv erwähnen)                  | Qualifikatoren (auch verneint ausformulieren) |
| ------- | --------------------------------------------------- | --------------------------------------------- |
| U6      | Seite, Bewegung (Öffnen/Schließen)                  | Quellen (Untersucher/Patient), Schmerz        |
| U7      | Seite                                               | Quellen, Schmerz                              |
| U8      | Seite, Situation (während Öffnung / weiter Öffnung) | Lösbarkeit                                    |
| U9      | Seite, Muskel/Gelenk                                | Übertragung, Ausbreitung, Kopfschmerz         |
| U10     | Seite, Muskel                                       | Übertragung                                   |

### 1.6 Schmerz-Trigger

Es gibt zwei unabhängige Schmerz-Trigger:

1. **Muskel-/Gelenkschmerz.** `bekannter_schmerz: ja` triggert den Befund. `uebertragener_schmerz` und `ausbreitender_schmerz` sind nachgelagerte Qualifikatoren und zählen nur, wenn `bekannter_schmerz: ja`.
2. **Kopfschmerz am Temporalis.** `bekannter_kopfschmerz: ja` triggert eigenständig einen Kopfschmerz-Befund. Dieses Feld existiert nur bei Temporalis-Punkten in U9. Es kann allein stehen oder in Kombination mit `bekannter_schmerz`. Die Schmerz-Qualifikatoren (Übertragung, Ausbreitung) sind an `bekannter_schmerz` gebunden und werden bei reinen Kopfschmerz-Befunden (ohne begleitenden `bekannter_schmerz`) nicht berichtet.

Reines `schmerz: ja` ohne Qualifier ist ein Untersuchungsartefakt und wird ignoriert.

### 1.7 Seitenaggregation

- Rechts UND links mit identischen Feldern → "beidseits".
- Nur eine Seite positiv → Seite nennen.
- Bei Asymmetrie → getrennte Sätze pro Seite.

### 1.8 Muskelebene

Aggregation auf Muskelgruppen-Ebene: **Temporalis, Masseter, Kiefergelenk** — nicht auf Einzelpunkt-Ebene (Temporalis anterior/media/posterior, Masseter Ursprung/Körper/Ansatz).

Aggregation der Unterpunkte per **OR-Logik**:

- Hauptphänomen ist positiv, sobald mindestens ein Unterpunkt positiv ist.
- Qualifikator gilt für die Gruppe, sobald er bei mindestens einem positiven Unterpunkt gilt.

### 1.9 Ausbreitender Schmerz

Das Feld `ausbreitender_schmerz` existiert nur bei U9-Muskelpunkten (Temporalis, Masseter). Der Qualifikator entfällt bei Kiefergelenk-Palpation und bei U10.

---

## 2. Sektionsregeln

### U1a — Schmerzlokalisation letzte 30 Tage

Template:

> "Schmerzlokalisation letzte 30 Tage bestätigt in [Struktur] [Seite], [Struktur] [Seite]."

- Nur positiv markierte Strukturen aufnehmen.
- `nicht_mastikatorische_muskeln` in Klammern am Ende: "(Andere Kaumuskeln, Nicht-Kaumuskeln beidseits)".

### U1b — Kopfschmerzlokalisation letzte 30 Tage

Template:

> "Kopfschmerzlokalisation letzte 30 Tage bestätigt in [Struktur] [Seite]."

### U2 — Schneidekantenverhältnisse

Template:

> "Horizontaler Überbiss X mm, vertikaler Überbiss Y mm, Mittellinienabweichung Z mm nach [Richtung]."

- Messwerte immer berichten, wenn vorhanden.
- Referenzzahn nur nennen, wenn nicht 11/21.

### U3 — Öffnungs-/Schließmuster

Nur berichten, wenn Wert _nicht_ "Gerade".

Template:

> "Öffnungs-/Schließmuster: [Wert]."

### U4 — Öffnungs-/Schließbewegungen

Template:

> "Schmerzfreie Mundöffnung X mm. Maximale Mundöffnung Y mm[, mit bekannten Schmerzen in Struktur1, Struktur2][, mit bekanntem Schläfenkopfschmerz]."

- Maximale Mundöffnung = Max(passive Öffnung, aktive Öffnung).
- Schmerzen = Union aus passiver und aktiver Öffnung.
- Kopfschmerz-Befund wird unabhängig angehängt, wenn ausgelöst.

### U5 — Laterotrusion/Protrusion

Template:

> "Laterotrusion rechts X mm, Laterotrusion links Y mm, Protrusion Z mm[, mit bekannten Schmerzen in Struktur1, Struktur2]."

- Messwerte einzeln, immer berichten wenn vorhanden.
- Schmerzen als Union über alle drei Bewegungen.

### U6 — Kiefergelenkgeräusche bei Öffnung/Schließung

Pro Seite und Geräuschtyp (Knacken / Reiben) ein Satz. Beidseits-Zusammenführung bei vollständiger Identität.

**Dimensionen** (nur positiv erwähnt): Seite, Bewegung (Öffnen/Schließen).
**Qualifikatoren** (auch verneint ausformuliert): Quellen, Schmerz.

Die Bewegungsangabe wird entsprechend der positiven Felder gebildet:

- nur Öffnen positiv → "beim Öffnen"
- nur Schließen positiv → "beim Schließen"
- beides positiv → "beim Öffnen und Schließen"

Template (Knacken):

> "Knacken im [rechten | linken | beidseitigen] Kiefergelenk [beim Öffnen | beim Schließen | beim Öffnen und Schließen], vom [Untersucher | Patient | Untersucher und Patient] festgestellt, [mit | ohne] bekanntem Schmerz."

Template (Reiben):

> "Reiben im [rechten | linken | beidseitigen] Kiefergelenk [beim Öffnen | beim Schließen | beim Öffnen und Schließen], vom [Untersucher | Patient | Untersucher und Patient] festgestellt."

- Quellen werden auch verneint ausformuliert (z.B. "vom Untersucher festgestellt, vom Patient nicht bemerkt"), da klinisch informativ.
- `schmerzhaftes_knacken` allein (ohne `bekannter_schmerz`) wird nicht eigens erwähnt (konsistent mit globalem Schmerz-Filter).
- Reiben hat keine eigenen Schmerz-Felder.

### U7 — Kiefergelenkgeräusche bei Laterotrusion/Protrusion

Wie U6, aber Bewegung = "bei Laterotrusion und Protrusion".

Hinweis: Das Datenmodell (JSON) hat in U7 drei separate Bewegungen (Laterotrusion rechts, Laterotrusion links, Protrusion); die Anwendung behandelt sie als einen einzigen Punkt. Die Aggregationsregel folgt der App-Logik.

Template (Knacken):

> "Knacken im [rechten | linken | beidseitigen] Kiefergelenk bei Laterotrusion und Protrusion, vom [Untersucher | Patient | Untersucher und Patient] festgestellt, [mit | ohne] bekanntem Schmerz."

Template (Reiben) analog.

### U8 — Kieferklemme/Sperre

Pro Situation (_während der Öffnung_ / _bei weiter Mundöffnung_) und pro Seite ein Satz. Beide Situationen werden getrennt berichtet.

Trigger: `blockade: ja`.

Template:

> "Kieferblockade [während der Öffnung | bei weiter Mundöffnung] im [rechten | linken | beidseitigen] Kiefergelenk, [lösbar durch Patient | lösbar durch Untersucher | nicht lösbar]."

### U9/U10 — Palpation

Pro Muskel/Gelenk und Seite ein Satz. OR-Aggregation über Unterpunkte auf Muskelgruppen-Ebene.

Trigger: `bekannter_schmerz: ja` ODER (nur U9-Temporalis) `bekannter_kopfschmerz: ja`.

Template (Muskel):

> "Bekannter Schmerz bei Palpation in [Muskel] [Seite], [mit | ohne] Übertragung, [mit | ohne] Ausbreitung."

Template (Kiefergelenk):

> "Bekannter Schmerz bei Palpation im Kiefergelenk [Seite], [mit | ohne] Übertragung."

Template (reiner Kopfschmerz-Befund am Temporalis, ohne `bekannter_schmerz`):

> "Bekannter Kopfschmerz bei Palpation des Temporalis [Seite]."

Template (kombiniert, wenn `bekannter_schmerz` UND `bekannter_kopfschmerz` am Temporalis):

> "Bekannter Schmerz und bekannter Kopfschmerz bei Palpation des Temporalis [Seite], [mit | ohne] Übertragung, [mit | ohne] Ausbreitung."

Für U10 (Andere Kaumuskeln, Nicht-Kaumuskeln, z.B. Regio submandibularis, Pterygoideus lateralis, Temporalis-Sehne):

- Template analog zum Muskel-Template, aber **ohne** Qualifikator "Ausbreitung" (Feld existiert nicht).

---

## 3. Beispiel-Mapping

Zur Illustration, wie die Meta-Regel 1.1 die Templates konsistent macht:

| Sektion | Phänomen                        | Lokalisation            | Bewegung                  | Quellen                                  | Qualifikatoren                        |
| ------- | ------------------------------- | ----------------------- | ------------------------- | ---------------------------------------- | ------------------------------------- |
| U4      | Maximale Mundöffnung 54 mm      | —                       | (implizit Öffnung)        | —                                        | mit bekannten Schmerzen in Temporalis |
| U6      | Knacken                         | im rechten Kiefergelenk | beim Öffnen und Schließen | vom Untersucher und Patient festgestellt | mit bekanntem Schmerz                 |
| U8      | Kieferblockade                  | im rechten Kiefergelenk | während der Öffnung       | —                                        | lösbar durch Patient                  |
| U9      | Bekannter Schmerz bei Palpation | in Temporalis rechts    | —                         | —                                        | mit Übertragung, ohne Ausbreitung     |
