# 0002 · PageHeader

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Seite hat einen Kopf |
| Quelle | `docs/v3-backlog.md` — Blocker #2 (19 Dateien / 22 Stellen) |
| Ersetzt | `ui/components/primitives/PageHeader.tsx` in `ludwig/app` |
| Blockiert | jede Seitenmigration der Wellen 1–4 (`design-guidelines.md` §11.4) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Jede Seite beginnt oben mit derselben Frage: *Wo bin ich, worum geht es, was
kann ich hier tun?* Heute beantwortet das ein v1-Baustein, den 19 Dateien
importieren — mit v1-Optik. Ohne ein v3-Pendant kann keine Seite umziehen,
denn der Kopf ist das Erste, was man anfasst.

## Einordnung

- **Wiederverwenden:** Zwei `@when` kommen nahe, decken es aber nicht:
  `CardHead` („Every table and every bounded surface with a header") sitzt
  eine Ebene tiefer — in der Karte, nicht über ihr. `StepHeader` („Header of
  every step in the rail") gehört zum Prüf-Rahmen und trägt Weg-vor/zurück;
  es kennt Prozessbegriffe und ist damit ein Pattern.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort nötig, 19 belegte
  Verwendungen, und aus vorhandenen Primitives nicht in ~15 Zeilen an der
  Aufrufstelle zu bauen (Überzeile, Titel, Beschreibung, Aktionen, Meta-Zeile
  in einem festen Raster).
- **Zuschnitt:** eine Datei, ein Export. Kein Familien-Fall: die Teile treten
  nie einzeln auf.
- **Setzt auf:** nichts — reines Layout über Tokens. Die Aktionen kommen als
  `ReactNode` (in der Praxis `Button`/`ActionBar`), die Meta-Zeile ebenso
  (`Badge`, `StatusBadge`, `Timestamp`).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `overline` | `string` | nein | Einordnung über dem Titel: Bereich, Wirtschaftsjahr, Mandant | `Filled` |
| `title` | `ReactNode` | ja | Worum es geht — das Objekt, nicht die Tätigkeit | `Filled` |
| `description` | `ReactNode` | nein | Ein Satz, was die Seite leistet | `Filled` |
| `meta` | `ReactNode` | nein | Zustand und Kennzahlen neben dem Titel (Badge, Zeitstempel) | `WithMeta` |
| `actions` | `ReactNode` | nein | Handlungen der Seite, rechts; genau ein primärer Weg | `WithActions` |
| `back` | `{ href: string; label: string }` | nein | Weg zurück zur Liste; `label` nennt das Ziel, nie „Zurück" | `WithBack` |

Typen: keine aus `src/ludwig/` nötig — der Kopf trägt nur Darstellung.
GLOSSARY: `overline` enthält in Ludwig meist Bereich und Wirtschaftsjahr; die
Begriffe kommen vom Aufrufer, nicht aus einer Map hier.

**Kann bewusst nicht:** Tabs tragen (die stehen unter dem Kopf, `Tabs`),
filtern (`FilterBar`), Fortschritt zeigen (`ProgressBar` im Rahmen), oder
selbst laden. `back` ist ein Link, kein Verlauf-Zurück — die Zielseite steht
fest, damit der Text sie nennen kann (V14).

## Verhalten

Server-Component: der Kopf hat keinen Zustand. Die Aktionen bringen ihren
eigenen Client-Wrapper mit, wenn sie einen brauchen.

- **Tastatur:** nichts Eigenes. Fokusreihenfolge ist Lesereihenfolge: back →
  Titel-Link (falls vorhanden) → Aktionen.
- **Hover:** nur auf `back` und den Aktionen (§2 — was nicht klickt, bekommt
  keinen Hover).
- **Zustände:** kein Lade- oder Fehlerzustand. Der Kopf steht auch dann, wenn
  der Inhalt darunter lädt — er ist der Anker, der nicht springt.
- **Umbruch:** `title` und `actions` stehen in einer Zeile; wird es eng,
  rutschen die Aktionen unter den Titel, nicht in eine zweite Spalte.
- **Text links** (V3), keine Versalien (A2), Titel ohne Punkt (T3).

## Erweiterung A6 · ein Seitenkopf, eine Knopf-Ordnung

Aus `docs/backlog/0034-shadcn-abgleich.md` §A6 (Nachschub zum shadcn-Abgleich:
„ein Seitenkopf mit drei optionalen Blöcken um die Überschrift"). Der Wunsch
ist gebaut — `overline`, `title`, `description`, `meta`, `actions`, `back`
stehen alle hier. Was fehlt, ist die **Konsequenz**: `StepHeader`
(`patterns/StepRail.tsx`) rendert denselben Kopf mit eigenem Markup
(`abn__screenhead*`, ein anderes `h1`, eine eigene Knopfzeile). Zwei Köpfe,
zwei Optiken. Und die feste Knopf-Ordnung, die der Nachschub sich wünscht,
existiert als `ActionBar` („exactly one primary path"), wird aber weder von
der `PageHeader`-Story noch von `StepHeader` benutzt.

Regel §3.1 (der Fall ist gedeckt) plus §4 („Durchreich-Markup löschen"):
**keine neue Prop, keine neue Komponente.**

- `StepHeader` komponiert `PageHeader`: `overline` → `overline`, `title` →
  `title`, `lead` → `description`, und die Handlungen gehen als **eine**
  `ActionBar` in `actions` — die Schritt-Navigation (← Zurück · Weiter zu
  Schritt n →) steht hinter den übergebenen `actions`, die Reihenfolge
  primär → sekundär → tertiär kommt aus `ActionBar`, nicht aus jeder Seite
  neu. Die Klassen `abn__screenhead*` werden aus `v3.css` gelöscht.
- `PageHeader`: JSDoc und die Story `WithActions` zeigen `actions` als
  `<ActionBar>` mit genau einem `variant="primary"`. Die Prop bleibt
  `ReactNode` — ein Typ, der nur `ActionBar` zuließe, wäre in TypeScript
  Schein; die Story ist die Regel.
- `StepHeader` behält seine Props (`prevHref`/`nextHref`/`onPrev`/`onNext`/
  `nextLabel`/`actions`) und seine Stories unverändert; nur das Markup
  darunter wechselt.

**Kriterien (A6):**

- [ ] `grep -rc "abn__screenhead" src/styles/v3.css src/ui/v3` = 0
- [ ] `StepHeader` und `PageHeader` rendern dasselbe `h1` (`.v2phead__title`) —
      beide Stories nebeneinander angesehen
- [ ] Die Story `WithActions` benutzt `ActionBar` mit genau einem primären Knopf
- [ ] Die Tasten der Abnahme-Schritte (`useHotkeys`) sind unverändert (Story
      `v3/Patterns/Frame/StepRail`)

## Stories

Titel `v3/Primitives/Fläche/PageHeader`. Abgeleitet nach §6: 1 Zustand
(gefüllt) + 0 Enum-Props + 0 Layout-Booleans + 0 Callbacks + 1 „im Einsatz"
+ 1 Rand (langer Titel) + 3 optionale Bereiche = 6.

| Story | Beweist |
|---|---|
| `Filled` | Überzeile, Titel, Beschreibung — der Normalfall |
| `WithMeta` | Zustand neben dem Titel (`StatusBadge`, Zeitstempel) |
| `WithActions` | zwei Handlungen rechts, genau eine primär |
| `WithBack` | Weg zurück, `label` nennt das Ziel |
| `TitleOnly` | nur der Titel — die Untergrenze, alles andere optional |
| `InUse` | vollständiger Seitenkopf über einer `Card` mit Tabelle |

Nicht anwendbar: `Leer` (ein Kopf ohne Titel existiert nicht), `Laedt`
und `Fehler` (der Kopf lädt nicht — er steht, während der Inhalt lädt).

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

- [ ] Jede der sechs Props verhält sich wie in der Schnittstelle, jede mit ihrer Story belegt
- [ ] Ohne `actions`, `meta`, `back`, `description` und `overline` rendert der Kopf nur den Titel, ohne leere Kästen (Story `TitleOnly`)
- [ ] Ein Titel über 80 Zeichen bricht um, ohne die Aktionen zu verdrängen (Story `InUse`)
- [ ] `back.label` nennt das Ziel; die Story zeigt keinen Knopf mit „Zurück" (V14, T3)
- [ ] Server-Component: die Datei trägt kein `"use client"`
- [ ] Ersetzt `PageHeader` aus `ui/components/primitives/PageHeader.tsx` ohne Funktionsverlust — die dortigen Props sind abgedeckt oder in der Spec als bewusst entfallen benannt

## Offene Fragen

1. Trägt der Kopf eine Trennlinie nach unten? *Ohne Antwort: nein — die Karte
   darunter bringt ihren eigenen Rand mit (L2, „Rand oder Schatten, nicht beides").*
2. Soll `title` optional ein Link sein (Sprung zur Übersicht)? *Ohne Antwort:
   nein — dafür ist `back` da; zwei Wege nach oben verwirren.*

## Abnahme

Zweite Abnahme (fremder Prüfer, 2026-09-05) — die Tabelle ist neu geschrieben,
jedes Kriterium der Liste oben einzeln nachgewiesen. Storybook lief auf
Port 6107, Chromium 1440×900.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0, zu Beginn und am Ende der Abnahme. `pnpm build` bewusst nicht gestartet — er schreibt nach `storybook-static`, und parallel laufen weitere Abnahmen; zitiert wird der grüne Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/PageHeader.tsx` neben `PageHeader.stories.tsx`; `PageHeader.stories.tsx:11` = `v3/Primitives/Fläche/PageHeader`, „Fläche" ist die Gruppe aus `src/ui/v3/index.ts` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Einziger Export `PageHeader` (`PageHeader.tsx:19`), `@when`/`@instead` in `PageHeader.tsx:14–18`; Bezeichner, Props und JSDoc der Datei durchgängig englisch, Deutsch nur in den Nutzer-Strings der Story | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize" src/ui/v3/primitives/PageHeader.tsx` → keine Zeile; die Datei trägt nur Klassennamen (`v2phead*`), der Zustand kommt als `meta`-Knoten von außen (`StatusBadge` in `--with-meta`) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `http://localhost:6107/index.json`: `--filled`, `--with-meta`, `--with-actions`, `--with-back`, `--long-title`, `--title-only`, `--in-use` — die sechs der Ableitung plus `LongTitle` als eigener Rand-Fall. `Leer`/`Laedt`/`Fehler` sind im Abschnitt „Stories" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | V3: `getComputedStyle(h1).textAlign` = `start`, nichts zentriert. Fokus: Tab auf `--with-back` → `outline 2px solid rgb(59,143,196)` (`--color-focus`), `outline-offset 2px`. Hover nur auf `back` und den Aktionen — `.v2phead`, `.v2phead__over`, `.v2phead__title` haben keine Hover-Regel in `v3.css`. Keine Transition in `.v2phead*`, also nichts, was `prefers-reduced-motion` verletzen könnte. Icons: `back` liefert `svg.lucide-chevron-left`, `width 14`, `stroke-width 1.5` (A8-Leiter). Kein Emoji, kein Unicode-Zeichen im DOM. Die beiden App-Punkte (v1-`@deprecated`, §11 auf v2) sind laut Skill hier übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Stories in Chromium 1440×900 geöffnet, gemessen und bedient (Tab-Reihenfolge in `--with-back`) | ✓ |

**Variabel**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Jede der sechs Props verhält sich wie in der Schnittstelle, jede mit ihrer Story belegt | `--filled`: `.v2phead__over` = „Musterbau GmbH · Wirtschaftsjahr 2026", `.v2phead__title` = „Offene Posten", `.v2phead__desc` gesetzt, `__acts`/`__back` fehlen. `--with-meta`: `StatusBadge` + `Timestamp` stehen als 2. und 3. Kind der `.v2phead__titlerow`, auf derselben Zeile wie das `h1` (top 35 / 36 / 38 px). `--with-actions`: `.v2phead__acts` trägt eine `.v2actionbar`. `--with-back`: `.v2phead__back` mit `href`. `--title-only`: alle fünf optionalen Blöcke weg | ✓ |
| Ohne `actions`/`meta`/`back`/`description`/`overline` nur der Titel, keine leeren Kästen | `--title-only`, DOM-Baum vollständig: `HEADER.v2phead > DIV.v2phead__main > DIV > DIV.v2phead__titlerow > H1.v2phead__title` — kein weiteres Element | ✓ |
| Ein Titel über 80 Zeichen bricht um, ohne die Aktionen zu verdrängen | `--long-title`: Titel 90 Zeichen, `h1` 50 px hoch = zwei Zeilen (`line-height` 25 px), `.v2phead__main` hat `flex-wrap: wrap`, die Aktionen rutschen unter den Titel (`h1.bottom` 85, `acts.top` 125) und behalten ihre Breite (139 px). `documentElement.scrollWidth − clientWidth = 0`, `h1.scrollWidth − clientWidth = 0`; im Bild nichts abgeschnitten. Der 2026-09-03 offene Punkt ist damit belegt | ✓ |
| `back.label` nennt das Ziel; die Story zeigt keinen Knopf mit „Zurück" (V14, T3) | `--with-back`: `.v2phead__back` = „Alle Stapel"; `document.body.innerText.includes("Zurück")` → `false` | ✓ |
| Server-Component: die Datei trägt kein `"use client"` | `grep -n "use client" src/ui/v3/primitives/PageHeader.tsx` → keine Zeile | ✓ |
| Ersetzt `PageHeader` aus `ui/components/primitives/PageHeader.tsx` ohne Funktionsverlust | Der Umzug findet in `ludwig/app` statt und ist hier nicht ausführbar. Die Deckung ist unverändert wie 2026-09-03 protokolliert: die App-Props `title`, `sub`, `actions` sind durch `title`, `description`, `actions` gedeckt, `overline`/`meta`/`back` kommen hinzu | offen (App) |

**Erweiterung A6**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `grep -rc "abn__screenhead" src/styles/v3.css src/ui/v3` = 0 | `grep -rn "abn__screenhead" src/styles/v3.css src/ui/v3 \| wc -l` → `0`; `grep -rc` auf `v3.css` → `0` | ✓ |
| `StepHeader` und `PageHeader` rendern dasselbe `h1` (`.v2phead__title`) | `v3-patterns-frame-steprail--screen-header` und `v3-primitives-fläche-pageheader--filled` nebeneinander gemessen: beide `header.v2phead h1.v2phead__title`, `font-size 20px`, `font-weight 600`, `line-height 25px`, `color rgb(45,45,45)`, `font-family Inter` — Werte identisch. `StepRail.tsx:147` komponiert `PageHeader` | ✓ |
| Die Story `WithActions` benutzt `ActionBar` mit genau einem primären Knopf | `--with-actions`: erstes Kind von `.v2phead__acts` ist `.v2actionbar`; `querySelectorAll(".v2btn--primary").length` = 1 („Stapel abnehmen"), daneben ein `v2btn--secondary` („Als CSV laden") | ✓ |
| Die Tasten der Abnahme-Schritte (`useHotkeys`) sind unverändert | `git show f760c12 -- src/ui/v3/patterns/StepRail.tsx` fasst nur das Markup an: keine `+`/`-`-Zeile berührt `prevHref`/`nextHref`/`onPrev`/`onNext`/`nextLabel`. `useHotkeys` kommt in `StepRail.tsx` gar nicht vor; die eine Änderung an `Hotkeys.tsx` in diesem Commit betrifft `HotkeyLegend` und stammt aus 0035 (`Kbd`), nicht aus A6 | ✓ |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: der
Umzug der 19 Fundorte in `ludwig/app` (Kriterium „ersetzt `PageHeader` der
App") — hier nicht erfüllbar, hält die Aufgabe nicht auf.

**Beiläufig geprüft (0087).** Der Rückweg holt sein Zeichen jetzt über
`ActionIcon action="back"`; im DOM steht weiter `svg.lucide-chevron-left`,
`width 14`, `stroke-width 1.5` — dasselbe Zeichen, dieselbe Größe wie vor
`f58caa2`. Nichts verschwunden, nichts gesprungen.
