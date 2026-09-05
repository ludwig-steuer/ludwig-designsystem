# 0008 · OverflowMenu

| | |
|---|---|
| Status | in Arbeit |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Zeilen mit vielen Aktionen gibt es überall |
| Quelle | `docs/v3-backlog.md` — „Danach" (8 Eigenbauten) |
| Ersetzt | `DocActionsMenu`, `StapelZeilenmenue`, `ExportBatchRowActions`, `FeedbackRowActions`, `UserMenu`, `MandantSwitcher`, `YearSwitcher`, `DocCompletionControl` |
| Blockiert | Listenseiten mit mehr als drei Zeilenaktionen |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Eine Tabellenzeile trägt zwei, drei Aktionen nebeneinander — mehr sprengt sie.
Die weiteren gehören unter einen Auslöser. Heute ist der achtmal gebaut, jedes
Mal als `<details>` mit eigenem Styling, und in mehreren Fällen als reines
Icon mit `aria-label="Weitere Aktionen"` — ohne sichtbares Wort.

## Einordnung

- **Wiederverwenden:** `RowActions` („One to three actions at the right of a
  table row") deckt die sichtbaren Aktionen ab und sagt selbst, wo die Grenze
  liegt: bei drei. Darüber hinaus gibt es nichts.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, acht belegte
  Verwendungen.
- **Zuschnitt:** eine Datei, zwei Exporte als Familie: `OverflowMenu` (der
  Auslöser samt Klappe) und `MenuItem` (ein Eintrag). Sie ergeben nur
  miteinander Sinn (§4 „Familie").
- **Setzt auf:** natives `<details>/<summary>` wie `Disclosure` (0005) — es
  trägt Öffnen, Schließen und Tastatur ohne JavaScript; und `Button` für die
  Optik des Auslösers.

**Die Regelfrage, die diese Spec entscheidet:** T8 verlangt „jedes Icon hat
ein Wort" und nennt „Icon-Only-Button ohne sichtbares Wort" ausdrücklich als
Verstoß. Der Auslöser trägt deshalb **immer ein Wort** — voreingestellt
„Mehr", mit Chevron daneben. Die heutigen `aria-label`-Lösungen sind kein
Vorbild, sondern der Grund für diese Aufgabe.

## Schnittstelle

`OverflowMenu`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | nein | Beschriftung des Auslösers, Standard „Mehr" | `Filled` |
| `size` | `ButtonSize` | nein | wie `Button`; in Zeilen `sm` | `InRow` |
| `align` | `"start" \| "end"` | nein | Wohin die Klappe ausrichtet; Standard `end` (rechtsbündig in der Zeile) | `AlignStart` |
| `children` | `ReactNode` | ja | Die `MenuItem`-Einträge | `Filled` |

`MenuItem`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `ReactNode` | ja | Die Aktion, Imperativ mit Objekt (T3) | `Filled` |
| `href` | `string` | nein | Sprung statt Handlung; rendert einen `Link` | `Filled` |
| `onClick` | `() => void` | nein | Handlung; braucht einen Client-Aufrufer | `Interactive` |
| `icon` | `ReactNode` | nein | Lucide-Icon links, nie allein (T8) | `Filled` |
| `tone` | `"default" \| "danger"` | nein | `danger` für Löschen und Stornieren | `Variants` |
| `disabled` | `boolean` | nein | Nicht wählbar, mit Grund im `title` | `Variants` |

**Kann bewusst nicht:** verschachtelte Untermenüs, Mehrfachauswahl,
Tastenkürzel je Eintrag (dafür gibt es `KeyButton` an sichtbaren Aktionen),
oder sich selbst schließen nach einer Handlung, die den Aufrufer betrifft —
das entscheidet der Aufrufer.

## Verhalten

Server-Component, solange nur `href`-Einträge benutzt werden; mit `onClick`
braucht der Aufrufer einen Client-Wrapper.

- **Auslöser:** sieht aus wie ein `secondary`-Button, trägt `label` und einen
  Chevron. **Nie nur ein Icon** (T8).
- **Tastatur:** Enter und Leertaste öffnen und schließen — natives
  `<details>`. Tab wandert durch die Einträge. Escape schließt.
- **Hover:** Auslöser und jeder Eintrag bekommen eine Tonstufe (§2).
- **Ort:** die Klappe legt sich über den Inhalt, richtet sich nach `align`
  aus und bleibt im sichtbaren Bereich.
- **Zustände:** kein Lade- oder Fehlerzustand. Ein Eintrag, dessen Handlung
  dauert, ist ein `ActionButton` (0004) im Eintrag.

## Stories

Titel `v3/Primitives/Aktion/OverflowMenu`. Abgeleitet nach §6: 1 Zustand
+ 2 Enums (`tone`, `align`) + 0 Layout-Booleans + 1 Callback (`onClick`)
+ 1 „im Einsatz" + 1 Rand (viele Einträge) = 6.

| Story | Beweist |
|---|---|
| `Filled` | vier Einträge mit Icons, Auslöser mit Wort |
| `Variants` | `danger` und `disabled` nebeneinander |
| `AlignStart` | linksbündige Klappe |
| `Interactive` | Rundlauf über `onClick` mit `useState` |
| `InRow` | `sm` in einer Tabellenzeile, neben zwei sichtbaren `RowActions` |
| `ManyItems` | acht Einträge — die Klappe scrollt, statt aus dem Bild zu laufen |

Nicht anwendbar: `Leer` (ein Menü ohne Einträge wird nicht gerendert),
`Laedt`, `Fehler` (tragen die Einträge selbst).

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Der Auslöser trägt in **jeder** Story ein sichtbares Wort (Regel T8) — keine Story zeigt ein nacktes Icon
- [ ] Enter, Leertaste und Escape bedienen das Menü ohne eigenen Tastatur-Code (Story `Filled`)
- [ ] Acht Einträge laufen nicht aus dem Bild (Story `ManyItems`)
- [ ] `align="start"` richtet die Klappe links aus (Story `AlignStart`)
- [ ] `danger`-Einträge sind zusätzlich am Wort erkennbar, nicht nur an der Farbe (Story `Variants`, Regel V7)
- [ ] Ersetzt `DocActionsMenu` ohne Funktionsverlust — inklusive des dortigen `aria-label`, das durch ein sichtbares Wort ersetzt wird

## Offene Fragen

1. Heißt der Auslöser „Mehr" oder „Weitere Aktionen"? *Ohne Antwort: „Mehr" —
   kurz genug für eine Tabellenzeile, und der Chevron sagt den Rest.*
2. Soll die Klappe bei einem Klick auf einen Eintrag schließen? *Ohne Antwort:
   ja bei `href`, nein bei `onClick` — dort entscheidet der Aufrufer, weil die
   Handlung noch läuft.*

## Abnahme

Zweite Abnahme (fremder Prüfer, 2026-09-05), Tabelle neu geschrieben.
Storybook Port 6107, Chromium 1440×900; jede der sechs Stories geöffnet, das
Menü aufgeklappt, mit Escape geschlossen.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0, zu Beginn und am Ende. `pnpm build` bewusst nicht gestartet (schreibt nach `storybook-static`, parallele Abnahmen); zitiert wird der grüne Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/OverflowMenu.tsx` neben `OverflowMenu.stories.tsx`; `OverflowMenu.stories.tsx:10` = `v3/Primitives/Aktion/OverflowMenu` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Englisch: ja, durchgängig. **`@instead` fehlt an `MenuItem`** (`OverflowMenu.tsx:100–104`): der Block trägt nur `@when`. `OverflowMenu` selbst hat beides (`:33–37`). Damit fehlt die Antwort auf „was nehme ich statt `MenuItem`?" genau dort, wo sie greppbar sein soll | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize" src/ui/v3/primitives/OverflowMenu.tsx` → keine Zeile. Übrig ist `const EDGE = 8` (`:30`) — kein Gestaltungsmaß, sondern der Abstand, mit dem `place()` die Klappe im Fenster hält; das rechnet JavaScript, CSS kann es nicht. Das 4-px-Maß unter dem Auslöser steht in `v3.css:1793` (`margin-top: 4px`). Kein Status im Baustein | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--variants`, `--align-start`, `--interactive`, `--in-row`, `--many-items` — alle sechs. `Leer`/`Laedt`/`Fehler` im Abschnitt „Stories" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Erfüllt bis auf **V1 („Zeilenhöhe ≤ `.v2tbl__row`")** — siehe die Zeile darunter. Der Rest stimmt: Hover auf Auslöser (`rgb(255,255,255)` → `rgb(244,246,248)`) und auf jedem Eintrag (`rgba(0,0,0,0)` → `rgb(244,246,248)`); Fokusring `2px solid var(--color-focus)` auf `.v2menu__item` (`v3.css:1811`); Farbe nie allein (siehe `danger`-Zeile); Icon `width 14`, `stroke-width 1.5`; kein Emoji, kein Unicode-Zeichen; Text links; keine Transition, also nichts, was `prefers-reduced-motion` verletzt | ✗ |
| V1 im Einzelnen: der Auslöser treibt die Zeilenhöhe | `--in-row`, gemessen: die Zeile **mit** Menü ist 52 px hoch, die Referenzzeile daneben („Ohne Menü — die Referenzhöhe") 46 px. Ursache ist der Auslöser: `.v2menu__sum.v2btn--xs` ist 25 px hoch, die Aktionszelle dadurch 27 px, während die übrigen Zellen 20–22 px messen (`.v2tbl__row` hat `padding: 12px 18px`). Zum Vergleich: `v3-primitives-tabelle-selection--with-selection` bleibt mit seinen Zellen bei 44–45 px. V1 sagt „der Chip wird kleiner, nicht die Zeile größer" — der Wechsel von `sm` auf `xs` hat die Differenz seit dem 2026-09-03 nur von 7 auf 6 px gedrückt | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories geöffnet, Klappe geöffnet, mit Escape geschlossen, Einträge getabbt und geklickt | ✓ |

**Variabel**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Der Auslöser trägt in **jeder** Story ein sichtbares Wort (T8) | `--filled`, `--variants`, `--interactive`, `--in-row`, `--many-items`: `.v2menu__sum` = „Mehr" + `svg.lucide-chevron-down`; `--align-start`: „Weitere Wege". In allen sechs steht das Wort als eigenes `<span>` im DOM, kein nacktes Icon | ✓ |
| Enter, Leertaste und Escape bedienen das Menü ohne eigenen Tastatur-Code | `--filled`, echte Tastatur: Fokus auf `<summary>`, Enter → `details.open = true`; Leertaste → `true`; Escape → `false` (die drei Zeilen `onKeyDown`, `OverflowMenu.tsx:73–75` — `<details>` kennt Escape nicht, deshalb die eine Ausnahme). Danach wandert Tab durch die Einträge in Reihenfolge: „Beleg öffnen" → „In DATEV ansehen" → „Als PDF laden" | ✓ |
| Acht Einträge laufen nicht aus dem Bild | `--many-items`: acht Einträge, Klappe 208×268 px bei `max-height: 320px` und `overflow-y: auto`, `scrollHeight == clientHeight` (266), also gar kein Abschneiden. Waagerecht `left 8 / right 216` bei `innerWidth 1440` — vollständig im Fenster; kein Eintrag mit `scrollWidth > clientWidth`. Dasselbe geprüft für `--filled` und `--variants` (beide `left 8`) sowie für `--interactive`/`--in-row` am rechten Rand (`right 1424` bzw. `1423`) | ✓ |
| `align="start"` richtet die Klappe links aus | `--align-start`: Auslöser `left 16`, Klappe `left 16`, `right 224`; nichts angeschnitten | ✓ |
| `danger`-Einträge sind zusätzlich am Wort erkennbar, nicht nur an der Farbe (V7) | `--variants`: „Vorschlag verwerfen" trägt `.v2menu__item--danger`, `color rgb(168,64,60)` (`--color-danger`) **und** das Papierkorb-Icon **und** das Verb im Text. Der gesperrte Eintrag „Buchung stornieren" ist `disabled` mit dem Grund im `title` („Erst nach dem DATEV-Export möglich"), nicht bloß ausgegraut | ✓ |
| Ersetzt `DocActionsMenu` ohne Funktionsverlust — inklusive des dortigen `aria-label` | Der Umzug findet in `ludwig/app` statt und ist hier nicht ausführbar. Die Deckung ist unverändert wie 2026-09-03 protokolliert: das App-Menü trägt „⋯" mit `aria-label="Weitere Aktionen"`, hier steht das sichtbare Wort „Mehr" | offen (App) |

Abgenommen von / am: — · Status zurück auf **in Arbeit**. Zwei Mängel:

1. **Der Auslöser treibt die Zeile auf (V1).** In `--in-row` ist die Zeile mit
   Menü 52 px hoch, die Referenzzeile 46 px — sichtbar auch im Bild. Der
   Auslöser (`.v2btn--xs`, 25 px) ist höher als der Zeileninhalt (20–22 px).
   Entweder braucht der Auslöser in der Zeile eine flachere Ausprägung (das
   Vorbild ist `SelectCell`, dessen Zeilen bei 44–45 px bleiben), oder die
   Story `InRow` zeigt nicht den Fall, für den die Prop `size` da ist. Die
   Spec sagt zu `size`: „in Zeilen `sm`" — gebaut ist `xs`; auch das gehört
   zusammengeführt, Spec oder Story.
2. **`@instead` fehlt an `MenuItem`** (`OverflowMenu.tsx:100–104`). Die feste
   Regel verlangt beide Zeilen an jedem Export. Eine Zeile genügt, etwa:
   sichtbare Handlung neben der Zeile → `RowActions`/`TextButton`; Handlung,
   die läuft und scheitern kann → `ActionButton` im Eintrag.

Offen und **kein** Mangel: der Umzug von `DocActionsMenu` in `ludwig/app`.

**Beiläufig geprüft (0087).** Der Chevron kommt jetzt über
`ActionIcon action="expand"`; im DOM steht weiter `lucide-chevron-down`,
`width 14`, `stroke-width 1.5` — dasselbe Zeichen wie vor `f58caa2`. Nichts
verschwunden, nichts gesprungen. Nebenbefund fürs Set, nicht für diese Spec:
`OverflowMenu.stories.tsx:2` holt `FileText`, `Pencil`, `Trash2` … weiter
direkt aus `lucide-react` und reicht sie als `MenuItem icon={…}` herein. Für
Stories ist das mit 0087 ausdrücklich erlaubt; die Prop `icon: ReactNode`
lässt es aber auch jedem echten Aufrufer offen, an der Registry vorbei ein
Zeichen zu setzen.
