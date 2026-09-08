# 0137 · `EntityHeader`: Platz für das Prozessbild

| | |
|---|---|
| Status | offen |
| Stufe | `patterns/` (`EntityHeader`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: ein Vorgang mit Phasen, dessen Kopf zeigt, wo er steht |
| Quelle | `docs/detailseiten-standard.md` D6 · Designsprache Z7 |
| Ersetzt | die Notlösung, das Prozessbild in den Signal-Slot zu setzen |
| Blockiert | jede Detailseite einer Entität mit Kette: Beleg, Sachverhalt, Stapel, Onboarding |
| Spec von / am | noch keine — Befund von Claude, 2026-09-08 |

## Ziel

Z7 verlangt für **jede mehrstufige Kette** dieselbe Familie, und `ProcessStepper`
trägt dafür ausdrücklich die Zusage `@when Process state in the detail header
with raw states and loops` — den **Kopf der Detailseite**. Genau dort gibt es
für ihn keinen Platz.

`EntityHeader` hat acht Slots: `icon`, `overline`, `title`, `status`, `meta`,
`metric`, `summary`, `facts`, `actions`. `meta` verlangt Inline-Elemente (die
Karte trennt die Kinder mit einem Punkt), `summary` ist „one line, only when
there is text". Ein Stepper ist ein Block und passt in keinen von beiden. Die
drei gebauten Rahmen helfen auch nicht: `CaseDetailView` hat `nextAction`,
`SourceDocumentView` hat `banner`, `LedgerAccountView` hat `summary`/`chart` —
keiner davon ist für ein Prozessbild gedacht.

Solange das so ist, sagt der Standard: das Prozessbild steht im Signal-Slot.
Das ist eine Notlösung — der Slot gehört der **Meldung**, und ein Prozessbild
neben einem `StatusCallout` beantwortet zwei Fragen an einer Stelle.

## Einordnung

- **Wiederverwenden:** `EntityHeader` (0048) und `ProcessStepper` stehen beide;
  es fehlt die Fuge zwischen ihnen.
- **Erweitert, weil:** `spec-schreiben` §3.2 — die Platzierung des Prozessbilds
  ist eine Designentscheidung, die auf jeder Ketten-Entität wiederkommt.
- **Setzt auf:** `EntityHeader`, `Process` (`ProcessMini`/`ProcessStepper`).

## Was die Spec entscheiden muss

1. **Slot oder Zeile?** Eine Prop `process?: ReactNode` am `EntityHeader`
   (unter der Titelzeile, über `summary`) — oder ein eigener Slot im
   Detailrahmen zwischen Kopf und Signal. Für die Prop spricht, dass das
   Prozessbild zum Datensatz gehört und nicht zur Seite; gegen sie, dass der
   Kopf damit neun Slots hat.
2. **Verhältnis zum führenden Zustand** (D6): Badge **und** Stepper zeigen
   dieselbe Achse. Der Standard erlaubt beides nebeneinander, weil sie zwei
   Fragen beantworten („welcher Zustand" / „wo in der Kette") — die Spec muss
   sagen, wie das aussieht, ohne wie zwei Statusanzeigen zu wirken (D7: kein
   zweiter Zustand derselben Frage).
3. **Leer heißt weg**, wie bei jedem Slot des Kopfs (0048).

## Abnahmekriterien

Fest: die sieben Punkte aus `TEMPLATE.md`.

Variabel:

- [ ] Ohne `process` ist das Markup unverändert — kein Abstand, keine leere Zeile
- [ ] Mit `process` und `status` zugleich: eine Story zeigt, dass die beiden
      nicht als zwei Statusanzeigen gelesen werden (D7)
- [ ] `ProcessStepper` im Kopf bricht bei 1280 px nicht um (L1, gemessen)
