# 0123 · CopyTextButton

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, Endstand c2a2761) |
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

## Gebaut 2026-09-08

Gemessen (`scripts/cdp.mjs`): der Klick schreibt genau den übergebenen Text in
die Zwischenablage (über einen Stub abgefangen), die Aufschrift wechselt auf
„Kopiert" mit dem Haken, und nach zwei Sekunden steht wieder das Wort da.
Verweigert die Zwischenablage, bleibt die Aufschrift im Ruhezustand und der
Satz steht daneben — ein Fehlschlag sieht nicht mehr aus wie ein Erfolg, der
nicht kam.

Ein Detail, das die Vorlage nicht hatte: der Zeitgeber wird beim Abbau
abgeräumt. Ein Knopf, der vor seinen zwei Sekunden verschwindet, ruft sonst in
einen Zustand zurück, den es nicht mehr gibt.

`pnpm typecheck` und die fünf Wächter auf Exit 0.

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761; statische Checks (typecheck, check:language, check:when, check:contrast, check:icons, check:jobs, check:mirror, build) auf 6d58b58 und bca4b7d alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Klick schreibt genau `text` | `copytextbutton--filled` mit Stub auf `navigator.clipboard.writeText`: `["26.08.2026\t1.249,90\tS\t51\t6815\t1200\tRE-4471\tWartung Klimaanlage 08/2026"]` | ok |
| „Kopiert", nach zwei Sekunden wieder `label` | nach Klick „Kopiert" + `lucide-check`; nach 2,2 s „Buchungssatz kopieren" + `lucide-copy` | ok |
| Wirft die Zwischenablage: Satz am Knopf, Aufschrift bleibt | `--failed` (Stub rejected): Label „Buchungssatz kopieren", `.v2act__err` „Die Zwischenablage ist nicht erreichbar. Text von Hand markieren und kopieren." | ok |
| Kein Icon ohne Wort (V11) | beide Zustände: 1 SVG + Text; `--sizes` 3 Knöpfe mit Icon+„Kopieren"; `--in-use` mit `title` | ok |
| Ersetzt drei Kopierstellen | — | offen (App) |
| Spec beschreibt das Gebaute | Props `text/label/title/size/variant` wie Tabelle | ok |

**Urteil: fertig.**
