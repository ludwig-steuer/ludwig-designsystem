# 0136 · `Tabs`: ein leiser Reiter für die Technik-Sicht

| | |
|---|---|
| Status | offen |
| Stufe | `primitives/` (`Nav.tsx`, `Tabs`/`TabItem`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede Anwendung mit einer Debug-Ansicht neben fachlichen Sichten |
| Quelle | `docs/detailseiten-standard.md` D12 (Owner-Entscheid 2026-09-08) |
| Ersetzt | nichts — fehlende Prop an einem gebauten Baustein |
| Blockiert | jede Detailseite: der Reiter „Rohdaten" steht heute optisch gleichrangig neben den fachlichen Reitern |
| Spec von / am | noch keine — Befund von Claude, 2026-09-08 |

## Ziel

Der Detailseiten-Standard verlangt auf **jeder** Entitäts-Detailseite einen
letzten Reiter „Rohdaten" (D12): für alle sichtbar, ohne Zähler, ohne Alarm —
und **optisch zurückgenommen**, weil er auf der Debug-Stufe der
Kritikalitätsskala steht (A7 `neutral`) und nichts fordert. Sichtbarkeit ist
nicht Prominenz: ein Reiter, der aussieht wie „Positionen", behauptet, er sei
so wichtig wie „Positionen".

`TabItem` kann das heute nicht. Es kennt `key`, `label`, `count`, `dot`,
`alarm`, `href` — jede dieser Eigenschaften macht einen Reiter **lauter**, keine
leiser. Wer den Rohdaten-Reiter dämpfen will, hat heute nur den Weg über eine
eigene CSS-Klasse an der Aufrufstelle, und damit hätte jede Detailseite ihre
eigene Antwort auf dieselbe Frage.

## Einordnung

- **Wiederverwenden:** `Tabs` (`@when Views with their own content, one
  active; counter and alarm on the tab`) ist richtig — es fehlt eine
  Ausprägung, kein Baustein.
- **Erweitert, weil:** `spec-schreiben` §3.2 — eine Designentscheidung, die auf
  jeder Detailseite wiederkommt. Zwei Konsumenten gibt es sofort (Beleg- und
  Sachverhaltsseite haben den Reiter heute schon), ein dritter folgt mit L-258.
- **Setzt auf:** `Tabs`, `v3.css` (`.v2tab`).

## Was die Spec entscheiden muss

1. **Name der Prop.** `quiet?: boolean` am `TabItem` — oder `tone?: "default" |
   "quiet"`, falls eine zweite gedämpfte Stufe absehbar ist. A12 spricht für
   das Boolean, solange es einen Fall gibt.
2. **Was „leise" heißt** — Textfarbe eine Stufe zurück (`--color-text-muted`),
   sonst identisch: gleiche Höhe, gleiche Trefferfläche, gleicher Fokusring,
   gleicher aktiver Rand. Ein gedämpfter Reiter ist **nicht** deaktiviert und
   nicht kleiner (V1: nichts drückt die Zeile, und die Trefferfläche bleibt
   24 × 24 px, §9 der Prüfliste).
3. **Ausschluss:** `quiet` und `alarm`/`count` schließen einander aus — ein
   leiser Reiter mit einem roten Zähler ist ein Widerspruch. Der Standard
   verbietet den Zähler an „Rohdaten" ohnehin.

## Abnahmekriterien

Fest: die sieben Punkte aus `TEMPLATE.md`.

Variabel:

- [ ] `quiet` dämpft nur die Ruhefarbe; aktiver Reiter, Hover und Fokus sind
      unverändert (Story `Varianten`, Screenshot hell/dunkel)
- [ ] Trefferfläche und Zeilenhöhe messbar gleich wie beim normalen Reiter
- [ ] `quiet` zusammen mit `count`/`alarm` ist ausgeschlossen (Typ oder
      dokumentierter Vorrang, Story beweist es)
