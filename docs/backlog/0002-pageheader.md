# 0002 · PageHeader

| | |
|---|---|
| Status | Abnahme |
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

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Jede der sechs Props verhält sich wie beschrieben, jede mit ihrer Story | `v3-primitives-fläche-pageheader--filled` (overline, title, description), `--with-meta`, `--with-actions`, `--with-back`, `--title-only` | ✓ |
| Ohne `actions`/`meta`/`back`/`description`/`overline` nur der Titel, keine leeren Kästen | `--title-only`, DOM im Browser: `header.v2phead > div.v2phead__main > div > div.v2phead__titlerow > h1` — kein weiteres Element | ✓ |
| Titel über 80 Zeichen bricht um, ohne die Aktionen zu verdrängen | `--in-use` trägt „Stapel 2026-08 · Bürobedarf" (27 Zeichen) — der Randfall aus der Ableitung ist in keiner Story belegt. Das Verhalten selbst stimmt: im Browser auf 107 Zeichen gesetzt → `h1` 25 → 50 px, `.v2phead__acts` unverändert an Ort und Breite, `scrollWidth == clientWidth` | ✗ |
| `back.label` nennt das Ziel, keine Story zeigt „Zurück" | `--with-back`: „Alle Stapel"; Tabben zeigt den Fokusring (2 px, `--color-focus`) | ✓ |
| Server-Component: kein `"use client"` | `grep -n "use client" src/ui/v3/primitives/PageHeader.tsx` → keine Zeile | ✓ |
| Ersetzt `PageHeader` der App ohne Funktionsverlust | App-Datei gelesen: Props `title`, `sub`, `actions` — gedeckt durch `title`, `description`, `actions`; der Rest kommt hinzu. Der Umzug in `ludwig/app` selbst steht noch aus | ✓ |

**Nachprüfung der Behebung** (fremder Prüfer, 2026-09-03): Story `LongTitle` rendert den umbrechenden Titel ohne horizontalen Überlauf (`scrollWidth <= clientWidth`).

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: Der in §6
abgeleitete Randfall „langer Titel" hat keinen Nachweis — `InUse` braucht
einen Titel über 80 Zeichen oder es fehlt eine eigene Story dafür.
