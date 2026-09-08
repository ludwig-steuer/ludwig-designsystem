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

## Wie das später läuft

`scripts/cdp.mjs` steht im Repo und räumt seinen Browser selbst ab; die
Messrezepte stehen in den Abnahme-Abschnitten der einzelnen Aufgaben — dort
ist auch nachzulesen, was schon einmal gemessen wurde und mit welchem
Ergebnis. Diese Aufgabe sammelt nur, sie misst nicht selbst.

**Betroffen sind alle Aufgaben, deren Abnahme ab dem 2026-09-08 den Vermerk
„schlanke Abnahme (Schnittstelle)" trägt.**
