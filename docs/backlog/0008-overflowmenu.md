# 0008 · OverflowMenu

| | |
|---|---|
| Status | Abnahme |
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

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Der Auslöser trägt in jeder Story ein sichtbares Wort (T8) | `v3-primitives-aktion-overflowmenu--filled` / `--variants` / `--interactive` / `--in-row` / `--many-items`: „Mehr" plus Chevron; `--align-start`: „Weitere Wege". Kein nacktes Icon | ✓ |
| Enter, Leertaste und Escape bedienen das Menü | `--filled`: `<summary>` — Enter und Leertaste sind nativ; Escape schließt (`d.open` von `true` auf `false`) über die drei Zeilen `onKeyDown` in `OverflowMenu.tsx:70`. Ganz „ohne eigenen Tastatur-Code" geht Escape nicht, `<details>` kennt es nicht | ✓ |
| Acht Einträge laufen nicht aus dem Bild | `--many-items`: senkrecht in Ordnung (Klappe 268 px, `max-height 320px`, `overflow-y auto`). **Waagerecht nicht:** die Klappe liegt bei `left −111 px`, ihr linker Rand steht außerhalb des Fensters, die Einträge sind angeschnitten („n" statt „Beleg öffnen"). Dasselbe in `--filled` und `--variants`: `place()` rechnet `right = innerWidth − r.right` und begrenzt nicht auf den sichtbaren Bereich, obwohl das Verhalten es verlangt | ✗ |
| `align="start"` richtet die Klappe links aus | `--align-start`: Auslöser bei `left 16`, Klappe bei `left 16`, nichts angeschnitten | ✓ |
| `danger`-Einträge am Wort erkennbar (V7) | `--variants`: „Vorschlag verwerfen" mit Papierkorb-Icon, „Buchung stornieren" gesperrt mit Grund im `title` — die Farbe kommt zum Wort dazu, nicht statt seiner | ✓ |
| Ersetzt `DocActionsMenu` inklusive `aria-label` | App-Datei gelesen: `children`-only, Auslöser „⋯" mit `aria-label="Weitere Aktionen"` → hier sichtbares Wort „Mehr". Unterschied fürs Umziehen: das App-Panel wächst nach Inhalt (`min-width 260`, `max-width min(620px,90vw)`), weil der Klassifikations-Editor darin aufklappt; hier sind es feste 208 px und 320 px Höhe mit Scrollen. Der Umzug selbst steht aus | ✓ |

**Nachprüfung der Behebung** (fremder Prüfer, 2026-09-03): Klappe bleibt im Fenster (gemessen `left 8 / right 216` bei 1440 px, ebenso bei 700 und 360 px); ein gewählter Eintrag — auch ein `href` — schließt sie; das 4-px-Maß steht im CSS, in der Komponente nur `EDGE`.

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:

1. **Die Klappe bleibt nicht im sichtbaren Bereich** — bei `align="end"` und
   einem Auslöser nahe dem linken Rand steht sie außerhalb des Fensters
   (`Filled`, `Variants`, `ManyItems`). `place()` braucht eine Begrenzung.
2. Ein Klick auf einen `href`-Eintrag schließt die Klappe nicht
   (`d.open` bleibt `true`) — die Spec hatte „ja bei `href`" entschieden.
3. `place()` setzt den Abstand `r.bottom + 4` als Zahl in der Komponente;
   Maße gehören nach `v3.css` (§9).
4. `InRow`: die Zeile mit dem Menü ist 53 px hoch, die Referenzzeile daneben
   46 px — der Auslöser (26 px) treibt die Zeilenhöhe (V1).
