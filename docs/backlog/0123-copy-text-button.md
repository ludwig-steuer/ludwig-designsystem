# 0123 · CopyTextButton

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` — Gruppe Aktion |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, unverändert: „diesen Text in die Zwischenablage" kennt kein Fachwort |
| Quelle | `docs/v3-backlog.md` („KopierenKnopf", 3 Verwendungen); Vorlage `modules/datev-truth/ui/CopyTextButton.tsx` |
| Ersetzt | `CopyTextButton` (datev-truth), die Kopierstellen in `AgentTokenManager` und `DocumentRequestMailPanel` |
| Spec von / am | Claude, 2026-09-08 |

## Warum nicht `ActionButton`

`ActionButton` (0004) kann fast alles davon — laufen, sperren, scheitern — und
sagt in seinem eigenen JSDoc, was er **nicht** tut: „It deliberately does not
report success — a completed action shows in the result (the row is gone, the
status changed), not in a text that has to disappear again."

Genau daran scheitert das Kopieren: **sein Ergebnis ist unsichtbar.** Die
Zwischenablage zeigt nichts, die Seite ändert sich nicht, und ohne eine
Rückmeldung weiß niemand, ob der Klick angekommen ist. Das ist die eine
Ausnahme von der Regel, und sie rechtfertigt einen eigenen Knopf statt einer
Prop an `ActionButton` — sonst müsste dort ein `successLabel` stehen, das für
jede andere Handlung falsch wäre (`spec-schreiben` §3 Regel 3: kein `@when`
passt, kein Fachwort nötig, drei Verwendungen).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `text` | `string` | ja | Was in die Zwischenablage geht. Fertig gebaut vom Aufrufer — der Knopf weiß nichts über den Inhalt | `Filled` |
| `label` | `string` | ja | Die Aufschrift im Ruhezustand, Imperativ (T3): „Buchungssatz kopieren", nie „Kopieren" allein, wenn mehrere Knöpfe nebeneinander stehen | `Filled` |
| `title` | `string` | nein | Der Tooltip, wo der Text selbst zu lang für die Aufschrift ist | `InUse` |
| `size` | `ButtonSize` | nein, Vorgabe `sm` | Wie `Button` | `Sizes` |
| `variant` | `ButtonVariant` | nein, Vorgabe `secondary` | Wie `Button` | `Sizes` |

**Kann bewusst nicht:**

- **Den Text bauen.** Formatieren, zusammensetzen, kürzen — alles beim
  Aufrufer. Der Knopf ist ein Transportmittel.
- **Bestätigen, dass der Text angekommen ist.** Was die Zwischenablage danach
  hält, kann keine Webseite lesen (und soll es nicht).
- **Ohne `navigator.clipboard` arbeiten.** Ohne sicheren Kontext gibt es keinen
  Ersatzweg — siehe „Fehl geht offen aus".

## Verhalten

1. **Ruhezustand:** Icon `copy` plus `label`.
2. **Nach dem Klick:** Icon `check`, Aufschrift „Kopiert" — **zwei Sekunden**,
   dann zurück. Der Zustand ist die einzige Rückmeldung, die es gibt.
3. **Fehl geht offen aus.** `navigator.clipboard.writeText` wirft, wenn die
   Seite nicht in einem sicheren Kontext läuft oder die Berechtigung fehlt.
   Dann steht der Satz neben dem Knopf — wie bei `ActionButton`, und **nicht**
   als stiller Fehlschlag, der aussieht wie ein Erfolg, der nicht kam. Die
   Vorlage in der App hat diesen Fall nicht: sie `await`et ohne `catch`.

## Stories

Abgeleitet nach §6: 2 anwendbare Zustände (Ruhe · kopiert — „lädt" gibt es
nicht, der Vorgang ist sofort; „leer" hat ein Knopf nicht) + 1 Fehler +
0 Enums (Größe und Variante in **einer** Story) + 1 „im Einsatz" = **4**.

| Story | Beweist |
|---|---|
| `Filled` | Ruhezustand und der Wechsel nach dem Klick, mit Rückfall nach zwei Sekunden |
| `Failed` | Die Zwischenablage verweigert: der Satz steht am Knopf |
| `Sizes` | Größen und Varianten nebeneinander |
| `InUse` | Neben einem Buchungssatz, mit `title` — der Fall aus `datev-truth` |

## Abnahmekriterien (variabler Block)

- Der Klick schreibt genau `text`, unverändert (`Filled`, gemessen über einen
  Stub auf `navigator.clipboard`)
- Nach dem Klick steht „Kopiert" und nach zwei Sekunden wieder `label`
- Wirft die Zwischenablage, steht der Satz am Knopf und die Aufschrift bleibt
  im Ruhezustand (`Failed`)
- Kein Icon ohne Wort (V11): beide Zustände tragen Aufschrift **und** Zeichen
- Ersetzt die drei Kopierstellen der App ohne Funktionsverlust
