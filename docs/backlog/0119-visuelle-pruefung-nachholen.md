# 0119 · Die visuelle Prüfung der v3-Familie nachholen

| | |
|---|---|
| Status | offen |
| Stufe | alle drei — `primitives/`, `patterns/`, `entities/` |
| Quelle | Owner-Entscheid 2026-09-08: die Abnahmen prüfen ab jetzt **die Schnittstelle**, die Darstellung wird vertagt |
| Auftrag | Für jede Aufgabe, die nach dem 2026-09-08 mit der schlanken Abnahme durchgegangen ist, die **gemessene** Prüfung nachholen: Spurbreiten und Wertebereiche, Zeilenhöhen, Überläufe bei 700 · 1100 · 1400 · 1920 px, Kontraste, Trefferflächen, Hover- und Fokus-Antworten, Tastaturwege. |
| Angelegt von / am | Claude, 2026-09-08 |

## Warum vertagt

Die App zieht in **einem** Zug nach, wenn das Set steht (Owner 2026-09-07).
Was bis dahin zählt, ist die **Schnittstelle**: welche Props eine Komponente
hat, welche Typen sie aus `src/ludwig/` liest, welche Stories sie belegen.
Ändert sich die Darstellung später, kostet das eine CSS-Zeile; ändert sich
eine Prop, kostet es jede Aufrufstelle in der App.

Die gemessene Prüfung ist deshalb nicht falsch geworden, nur nachrangig — sie
hat in den Wellen 1 bis 3 **zwei Wurzelfehler** gefunden, die das ganze Set
betrafen (das (i) mit 12 statt 24 px an jedem Chip, der fehlende Abstand am
Spaltenkopf in fünf Spaltensätzen). Solche Funde kommen wieder; sie kommen nur
später.

## Was die schlanke Abnahme weiter prüft

Damit klar ist, was **nicht** hierher vertagt wird:

- jede Prop gegen die Schnittstelle der Spec — Typ, Pflicht, Vorgabe
- Typen aus `src/ludwig/`, keine lokale Neudefinition, kein `as`-Zusicherung
- `@when`/`@instead` an jedem Export, Datei nach der Familie benannt
- Story-Deckung: jede Prop ihre Story, jeder ausgeschlossene Zustand begründet
- Status nur über die Registry, keine lokale Label-Map, kein Hex, kein px
- die sechs Wächter über den **Exit-Code**, dazu ihre Selbstprüfungen
- dass keine Story im Browser leer bleibt oder in die Konsole schreibt

## Was hierher wandert

- **Maße**: Spurbreiten gegen den breitesten Wert, Zeilenhöhen, Überläufe,
  Kürzung mit Weg zum ganzen Wert (`title`)
- **Farbe**: Kontrastzahlen nachrechnen, Rand-oder-Schatten, Vorzeichen ohne
  Farbe
- **Treffer und Zustand**: 24 × 24 px, Hover-Antwort, Fokusring
- **Tastatur**: Fokusfallen, Reihenfolge, Escape und Enter
- je an vier Breiten (700 · 1100 · 1400 · 1920) und in der Story „im Einsatz"

**Namentlich vorgemerkt aus den Nacharbeiten vom 2026-09-08** — jeweils eine
Behauptung, die nur eine Messung stützt:

| Woher | Was zu messen ist |
|---|---|
| 0135 | Eine Regel mit `taxRatePercent: 0` **ohne** Steuerschlüssel: die Klappe „Buchung im Detail" muss offen aufgehen. Vorher faltete sie zu, weil `Boolean(0)` falsch ist — der Fix ist gebaut, aber unbewiesen |
| 0134 | `Edges` mit `currency="CHF"`: schlägt die Währung bis in `AmountCell` und `JournalEntryCard` durch, oder steht irgendwo noch ein Euro-Zeichen |
| 0132 · 0133 | Ein Spaltensatz, der **nicht** schon in `ORDER`-Reihenfolge steht: Kopfzeile, Spuren und Zellen müssen sich trotzdem decken. Das ist der Fall, den `recurringRuleColumnOrder()` abfangen soll |
| 0126 | Die Kachel mit `href` **und** einem Link im Untertitel — sie darf so nicht gebaut werden, und die Messung sagt, ob man es sieht, wenn doch |

## Wie das später läuft

`scripts/cdp.mjs` steht im Repo und räumt seinen Browser selbst ab; die
Messrezepte stehen in den Abnahme-Abschnitten der einzelnen Aufgaben — dort
ist auch nachzulesen, was schon einmal gemessen wurde und mit welchem
Ergebnis. Diese Aufgabe sammelt nur, sie misst nicht selbst.

**Betroffen sind alle Aufgaben, deren Abnahme ab dem 2026-09-08 den Vermerk
„schlanke Abnahme (Schnittstelle)" trägt.**

## Messhinweis, der hierher gehört (2026-09-08)

**`element.disabled` ist die falsche Messung.** Ein Feld innerhalb eines
`fieldset[disabled]` ist tatsächlich gesperrt — aber `element.disabled` bleibt
`false`; nur der Selektor `:disabled` trifft. Wer prüft „`pending` sperrt jede
Eingabe" und dabei `element.disabled` liest, misst falsch und meldet grün.

Gefunden beim Bau von 0135: dort umschließt der Editor die zwei Kontofelder
mit einem `fieldset[disabled]`, weil `AccountField` keine eigene
`disabled`-Prop hat (das ist der Befund darin). Die erste Messung sagte „2 von
23 bedienbar", die richtige sagt 0.

Richtig ist `document.querySelectorAll("… :disabled").length` gegen die Zahl
der Felder, oder `el.matches(":disabled")` je Feld.
