# 0043 · `src/ui/legacy/` auflösen

| | |
|---|---|
| Status | Abnahme |
| Stufe | Aufräum-Aufgabe: vier Bausteine werden einsortiert (`patterns/` ×1 Familie, `primitives/` ×3), die Buchungslogik zieht zur Entität, der Rest wird gelöscht. Kein neuer Baustein. |
| Klassen-Test | je Baustein unten; alles bereits vorhanden, nur falsch abgelegt |
| Quelle | Anfrage vom 2026-09-03 („was machen wir mit den restlichen Legacy-Einträgen?") · `docs/v3-backlog.md` „Aufräumen im eigenen Haus", Punkt „`legacy/` leeren" · `src/ui/legacy/README.md` |
| Ersetzt | hier: den Ordner `src/ui/legacy/` (13 Quelldateien, 5 Stories, 1 README) und den Block „Legacy" in `src/ui/v3/index.ts` |
| Blockiert | die Aussage „v3 ist vollständig" (`v3-backlog.md`: „Erst wenn der Ordner leer ist, ist v3 vollständig") · die Auflösung von `Cells.tsx`/`Table.tsx` will denselben Zustand: eine Datei je Komponente, Story daneben |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

`src/ui/legacy/` war der Wartebereich für Bausteine aus `ludwig/app`, die v3
schon braucht, aber noch nicht in `primitives/patterns/entities` eingeordnet
hat. Heute liegen dort fünf Dinge: die Status-Familie (Registry, Icons,
Info-Knopf, Info-Dialog), `Banner`, `LongText`, `Pagination` und die
Buchungs-Helfer (`format`, `tax-assist`, `types`). Dazu drei Dateien, die
nur intern gebraucht werden (`Badge`, `Dialog`, `cn`) — Kopien von Dingen,
die v3 längst hat. Nach dieser Aufgabe existiert der Ordner nicht mehr,
jede Datei liegt an dem Ort, den die Import-Regel (Primitives kennen keine
Patterns, Patterns keine Entitäten) vorschreibt, und nichts im Repo
importiert mehr aus `@/ui/legacy/`.

## Einordnung — Entscheidungen je Baustein

Alle Entscheidungen sind getroffen; der Entwicklungsagent fragt nicht nach.

### 1. Status-Familie → `src/ui/v3/patterns/` (flach)

| Datei heute | Datei danach | Änderung |
|---|---|---|
| `status/status-registry.ts` | `patterns/status-registry.ts` | `import type { BadgeKind } from "@/ui/legacy/components/primitives/Badge"` → `import type { BadgeTone } from "../primitives/Badge"`; das Feld `kind: BadgeKind` in `StatusDescriptor` und in `axisLegend()` wird `kind: BadgeTone`. Werte sind identisch (`neutral · info · success · warning · danger`), sonst nichts anfassen — 1857 Zeilen Fachwissen bleiben Fachwissen. |
| `status/entity-icons.ts` | `patterns/entity-icons.ts` | nur der relative Import auf die Registry |
| `status/StatusInfoButton.tsx` | `patterns/StatusInfoButton.tsx` | Importe; `@when`/`@instead` ergänzen (fehlt heute) |
| `status/StatusInfoDialog.tsx` | `patterns/StatusInfoDialog.tsx` | `Dialog` aus `../primitives/Dialog` statt Legacy: `maxWidth={560}` wird `size="md"` (das ist in `v3.css` dieselbe Breite, 560 px). `Badge` aus `../primitives/Badge`: `kind={it.kind}` wird `tone={it.kind}`. `@when`/`@instead` ergänzen. |
| die beiden Stories | daneben | Titel `v3/Patterns/Prüfen/StatusInfoButton` und `v3/Patterns/Prüfen/StatusInfoDialog` — dieselbe Gruppe wie `StatusBadge` |

Warum `patterns/`, nicht `src/ludwig/`: `src/ludwig/` ist laut README die
**Kopie** der App-Interfaces; die Registry ist unsere Darstellungsquelle
(Label, Farbe, Bedeutung) und wird von `StatusBadge` importiert, das schon
in `patterns/` liegt. Warum flach und kein Unterordner: `patterns/` ist
flach, und die Familie bleibt am Namen auffindbar (`Status*`).
`StatusBadge.tsx` und seine Story wechseln ihre drei Importe auf `./…`.

### 2. `Banner` → `src/ui/v3/primitives/Banner.tsx`

Bleibt eine eigene Komponente: `StatusCallout` verweist per `@instead`
ausdrücklich auf sie („Page-wide message → Banner"), und `Callout`
(„one sentence of context right where it is needed") ist die Notiz im
Fluss, kein seitenweiter Hinweis. Klassen-Test: ja, jede App hat eine
seitenweite Meldung.

- Prop `kind` wird `tone` (`BannerTone`), wie bei `Badge` und `Callout`.
  Werte unverändert.
- `cn()` raus: `className={["banner", \`banner--${tone}\`, className].filter(Boolean).join(" ")}`
  oder das Muster, das die Nachbarn in `primitives/` benutzen. Kein `clsx`
  neu einführen, wenn kein Nachbar es hat.
- `@when`: seitenweite, dauerhafte Meldung über dem Inhalt (Kontenrahmen
  unvollständig, Periode gesperrt). `@instead`: Notiz im Fluss → Callout ·
  Zustand eines Dings → StatusCallout · flüchtige Quittung → Toast.
- Story-Titel `v3/Primitives/Fläche/Banner`, Args `kind` → `tone`.

### 3. `LongText` → `src/ui/v3/primitives/LongText.tsx`

Kein Ersatz durch `Markdown maxHeight`: LongText kürzt **Klartext** in
einer Tabellenzelle nach Zeichen, ohne Parser, ohne Client-Bundle
(`<details>`). Markdown ist für fremden, formatierten Text. Klassen-Test:
ja. Datei unverändert übernehmen, `@when`/`@instead` ergänzen
(`@instead`: formatierter Fremdtext → Markdown · aufklappbarer Abschnitt →
Disclosure). Story-Titel `v3/Primitives/Werte/LongText`.

### 4. `Pagination` → `src/ui/v3/primitives/Pagination.tsx`

0034 hat sie bewusst in `legacy/` gelassen („Pagination → legacy"), weil
shadcn nichts Besseres hat. Sie importiert bereits `../../v3/primitives/Link`
— das wird `./Link`. Sonst unverändert; `@when`/`@instead` ergänzen
(`@instead`: alles auf einer Seite mit Filter → FilterBar · Laden beim
Scrollen gibt es nicht). Story-Titel `v3/Primitives/Navigation/Pagination`.

### 5. Buchungs-Helfer → `src/ui/v3/entities/journal-entry/`

Einziger Nutzer im Repo ist `JournalEntryEditor.tsx` (Zeilen 6–7).

| Datei | Entscheidung |
|---|---|
| `booking/tax-assist.ts` | → `entities/journal-entry/tax-assist.ts`. Der Import `BookingSide` aus `./types` wird eine Zeile in der Datei selbst: `type BookingSide = "debit" | "credit";` |
| `booking/types.ts` | **löschen.** 143 Zeilen View-Models, von denen hier nur `BookingSide` gebraucht wird (siehe oben). |
| `booking/format.ts` | **löschen.** `fmtEuro` → `formatAmount(n, "EUR")` aus `src/ui/v3/format.ts` (gleiche Ausgabe `1.249,90 €`; die bestehenden `.replace(/\s?€/, "")` im Editor funktionieren weiter, `\s` deckt das geschützte Leerzeichen ab). `parseEuro` → `parseAmount` aus `primitives/AmountInput`; da `parseAmount` `null`/`"invalid"` liefern kann und der Editor eine Zahl braucht, ein lokaler Helfer im Editor: `const toNumber = (s: string | number | null | undefined) => { const n = parseAmount(String(s ?? "").replace("€", "")); return typeof n === "number" ? n : 0; };` — an allen Aufrufstellen (`grep -n "fmtEuro\|parseEuro"` zeigt heute 15 Zeilen, 137 bis 768). `fmtMoney`, `confPercent`, `confLevel`, `entryConfLevel`, `clientScopeFromPath` haben **keinen** Nutzer im Repo. |

Warum nicht `src/ludwig/`: Kopie der App, dort entsteht nichts Eigenes.
Warum nicht `primitives/`: `deriveTax` ist Buchungswissen, das fällt beim
Klassen-Test durch.

### 6. Löschen ohne Ersatz

`components/primitives/Badge.tsx`, `components/primitives/Dialog.tsx`,
`utils/cn.ts`, `README.md` — danach `rmdir` bis `src/ui/legacy/` weg ist.
`clsx` und `tailwind-merge` bleiben in `package.json`, das ist nicht Teil
dieser Aufgabe.

### 7. CSS wird nicht angefasst

`.banner*` und `.pag*` (`components.css`) sowie `.more*`
(`app-chrome.css`) bleiben, wo sie sind. Die Dateien sind der Spiegel der
App-Kette (`index.css`), die Optik ist „CSS-identisch mit dem Design"
(`index.ts`, heutiger Legacy-Kommentar), und `.banner--*` benutzt exakt die
Hex-Werte der Tokens. Die Komponenten-Dateien selbst enthalten weder Hex
noch px — das feste Kriterium gilt für sie. Befund für später: wenn
`components.css`/`app-chrome.css` einmal aufgelöst werden, ziehen diese drei
Blöcke als `v2*`-Klassen mit Tokens nach `v3.css` (vorher greppen, die
kurzen Kürzel sind vergeben).

## Arbeitsschritte (Reihenfolge)

1. `git mv` je Datei nach der Tabelle oben; Stories mit.
2. Importe: `grep -rn "ui/legacy" src` muss leer werden — Reihenfolge Registry
   → entity-icons → StatusInfoButton/Dialog → StatusBadge(+Story) → Banner →
   LongText → Pagination → tax-assist → JournalEntryEditor.
3. `src/ui/v3/index.ts`: Block „Legacy" (Zeilen 252–264, Kommentar bis `export { Pagination …`) auflösen.
   `StatusInfoButton`/`StatusInfoDialog` bleiben im Abschnitt „Status" neben
   `StatusBadge`; `Banner` in den Abschnitt der Flächen (bei `Callout`),
   `LongText` zu den Werten (bei `Amount`/`Time`), `Pagination` zur
   Navigation (bei `FilterBar`). Exportnamen unverändert — die App importiert
   `@ludwig/designsystem` nur über diese Datei.
4. Dokumente, die den Ordner nennen:
   - `README.md` Zeilen 26–28: die Zeile `src/ui/legacy/` aus dem Strukturblock streichen.
   - `.claude/skills/v3-komponente/SKILL.md` Zeilen 39–40 streichen; Zeile 93: Pfad `src/ui/v3/patterns/status-registry.ts`.
   - `docs/v3-backlog.md` Zeilen 115–117: durchstreichen wie die Zeile `.v2tbl__empty` darunter, mit Datum und „0043".
   - `.design-sync/config.json` Zeile 36: Story-ID `v3-legacy-longtext--kurz` auf die neue ID (aus `storybook-static/index.json` ablesen).
   - `.design-sync/NOTES.md` „Storybook-Dev-Indexer scheitert an drei Legacy-Stories": nach dem Umzug `pnpm storybook` einmal starten. Löst der Umzug es, Abschnitt auf einen Satz kürzen; sonst Pfade aktualisieren.
   - Alte Specs (0007, 0022, 0034), die „(legacy)" sagen, bleiben — sie beschreiben ihren Stand.
5. `pnpm typecheck`, `pnpm build`, dann `npx serve -s storybook-static -l 6109`
   und die fünf Stories plus `StatusBadge` und `JournalEntryEditor` im
   Iframe ansehen (`/iframe.html?id=<id>&viewMode=story`).
6. Nur eigene Dateien stagen (hier laufen parallele Sitzungen); ein Commit.

## Stories

Keine neue Story; die fünf vorhandenen ziehen um und bekommen v3-Titel:

| Story-Datei | Titel danach | Beweist |
|---|---|---|
| `patterns/StatusInfoButton.stories.tsx` | `v3/Patterns/Prüfen/StatusInfoButton` | öffnet die Legende der Achse |
| `patterns/StatusInfoDialog.stories.tsx` | `v3/Patterns/Prüfen/StatusInfoDialog` | Legende auf dem v3-Dialog, Badges in v3-Tönen |
| `primitives/Banner.stories.tsx` | `v3/Primitives/Fläche/Banner` | `tone`-Varianten, mit und ohne `title` |
| `primitives/LongText.stories.tsx` | `v3/Primitives/Werte/LongText` | kurz (kein Teaser), lang (Teaser, aufklappbar) |
| `primitives/Pagination.stories.tsx` | `v3/Primitives/Navigation/Pagination` | Ellipsen-Liste, erste/letzte Seite |

Export-Namen der Stories englisch (0001, so wie `AllTones`, `WithoutValue`
in den Nachbarn): alle fünf Dateien tragen heute deutsche — beim Umzug
umbenennen, z. B. `Kurz` → `Short`, `Gekappt` → `Clamped`, `EigeneGrenze` →
`CustomLimit`, `ErsteSeite` → `FirstPage`, `Mittendrin` → `MiddlePage`,
`LetzteSeite` → `LastPage`, `EineSeite` → `SinglePage`, `MitTitel` →
`WithTitle`, `OhneAktuellenWert` → `WithoutCurrentValue`, `NurLegende` →
`LegendOnly`, `Beleg`/`Buchung`/`Sachverhalt` → `Document`/`Entry`/`Case`.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem der fünf bewegten Exporte
- [ ] Kein Hex, kein px in den bewegten `.tsx`/`.ts`; Status nur über Registry
- [ ] Im Browser angesehen (Storybook-Build), nicht nur gebaut

Variabel (aus dieser Aufgabe):

- [ ] `test ! -d src/ui/legacy` — der Ordner existiert nicht mehr
- [ ] `grep -rn "ui/legacy" src .storybook .design-sync README.md .claude` liefert nichts (Ausnahme: `docs/backlog/00*.md` und `docs/v3-backlog.md` als Historie)
- [ ] `grep -rn "BadgeKind" src` leer; `grep -c "BadgeTone" src/ui/v3/patterns/status-registry.ts` ≥ 1
- [ ] `grep -rn "fmtEuro\|parseEuro\|booking/" src` leer; `JournalEntryEditor` nutzt `formatAmount` und `parseAmount`
- [ ] `src/ui/v3/index.ts` exportiert weiterhin `StatusInfoButton`, `StatusInfoDialog`, `Banner`, `LongText`, `Pagination` (Namen unverändert), ohne Block „Legacy"
- [ ] Story `JournalEntryEditor` (Standardfall): Summe unten und Rest-Anzeige zeigen dieselben Beträge wie vor dem Umbau (Screenshot vorher/nachher)
- [ ] Story `StatusInfoDialog`: Dialog 560 px breit, Badges tragen `.bdg bdg-<tone>` aus `primitives/Badge.tsx`, Schließen mit Escape
- [ ] `storybook-static/index.json` enthält keine ID mit `legacy`; die fünf neuen IDs stehen in der Abnahme-Tabelle
- [ ] `.design-sync/NOTES.md`: Abschnitt zum Dev-Indexer aktualisiert (gelöst oder Pfade neu)

## Befund beim Bauen (2026-09-03)

- **Der Dev-Indexer ist damit repariert.** Der Punkt aus `.design-sync/NOTES.md`
  („Could not parse import/exports with acorn" für die drei Legacy-Stories)
  ist mit dem Umzug verschwunden: `pnpm storybook` liefert wieder einen
  vollständigen Index (346 Stories). Am Code lag es nie — Abschnitt in
  `NOTES.md` entsprechend auf einen Absatz gekürzt.
- **Drei Fundstellen mehr als die Spec listet**, alle mitgezogen:
  `entities/accounting-case/CaseTimeline.tsx:26` (Registry-Import),
  `.design-sync/previews/StatusInfoDialog.tsx:2` (Story-Pfad) und die Skills
  `aus-app-holen` §2, `spec-schreiben` §1, `entitaet-analysieren` §Quellen.
  In `aus-app-holen` stand die Regel „Baustein behält seinen App-Pfad unter
  `src/ui/legacy/`" — sie ist durch „direkt einordnen" ersetzt, sonst
  entstünde der Wartebereich beim nächsten Baustein neu.
- **`euro`/`toNumber` statt 15 Umschreibungen.** Der Editor bekommt zwei
  lokale Einzeiler auf `formatAmount`/`parseAmount` statt an jeder der 15
  Stellen `formatAmount(x, "EUR")` zu schreiben; der Diff bleibt eine
  Import-Zeile plus zwei Definitionen.
- **Befund, nicht Teil dieser Aufgabe:** der v3-`Dialog` fokussiert beim
  Öffnen sein Panel (`Dialog.tsx:47`, `tabIndex={-1}`) und bekommt dadurch
  den Browser-Fokusring um die ganze Fläche — im `StatusInfoDialog` gut zu
  sehen. Betrifft jeden v3-Dialog, nicht den Umzug.

## Neue Story-IDs

| Story | ID |
|---|---|
| StatusInfoButton | `v3-patterns-prüfen-statusinfobutton--entry` · `--document` · `--without-current-value` |
| StatusInfoDialog | `v3-patterns-prüfen-statusinfodialog--entry` · `--case` · `--document` · `--legend-only` |
| Banner | `v3-primitives-fläche-banner--info` · `--warning` · `--danger` · `--success` · `--with-title` |
| LongText | `v3-primitives-werte-longtext--short` · `--clamped` · `--custom-limit` |
| Pagination | `v3-primitives-navigation-pagination--first-page` · `--middle-page` · `--last-page` · `--single-page` |

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …

## Für den Entwicklungsagenten

> Führe `docs/backlog/0043-legacy-aufloesen.md` mit dem Skill `v3-komponente`
> aus. Alle Entscheidungen stehen in „Einordnung", die Reihenfolge in
> „Arbeitsschritte". Nichts Neues bauen, nichts rückfragen; am Ende Status
> auf `Abnahme`, Story-IDs in die Abnahme-Tabelle, nur eigene Dateien
> stagen, ein Commit.
