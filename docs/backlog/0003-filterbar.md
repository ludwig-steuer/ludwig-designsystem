# 0003 · FilterBar

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Liste wird eingegrenzt |
| Quelle | `docs/v3-backlog.md` — Blocker #4 (12 Eigenbauten in 12 Dateien) |
| Ersetzt | `AccountFilterForm`, `InvoiceFilterForm`, `CaseListFilters` und 9 Inline-`<form className="section__filters">` |
| Blockiert | `[year]/entries`, `opos`, `datev`, `partners`, `accounts` — die Listenseiten der Welle 1 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Über jeder langen Liste steht eine Zeile, mit der man sie eingrenzt. Heute ist
sie zwölfmal verschieden gebaut: andere Abstände, andere Reihenfolge, mal mit
Zurücksetzen, mal ohne, mal sieht man dass gefiltert ist, mal nicht. Die
Sachbearbeiterin muss auf jeder Seite neu suchen, wo sie einschränkt — und ob
sie es schon getan hat.

## Einordnung

- **Wiederverwenden:** `FilterChips` („Narrowing down by dimension, above the
  card") deckt die Chip-Zeile, `SearchInput` die Volltextsuche. Beide sind
  Teile der Filterzeile, nicht die Zeile selbst: die zwölf Eigenbauten
  kombinieren Selects, Datumsfelder und Textfelder in einem `<form>`.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort nötig, zwölf
  belegte Verwendungen. An der Aufrufstelle wäre es zwar Markup, aber genau
  dieses Markup ist zwölfmal auseinandergelaufen; die Abstände, der
  Umbruch und der Zurücksetzen-Weg sind die Designentscheidung, die hier
  einmal getroffen wird.
- **Zuschnitt:** eine Datei, ein Export. Kein Familien-Fall.
- **Setzt auf:** nichts direkt — die Felder kommen als `children` (in der
  Praxis `Field`/`Input`/`Select`, `SearchInput`, `FilterChips`).

**Die Abgrenzung, die diese Spec macht:** `FilterBar` ist die **Hülle, nicht
der Motor**. Sie hält weder den Filterzustand noch die URL-Synchronisierung —
beides bleibt beim Aufrufer, weil es fachlich ist (`AccountFilter`,
`useSearchParams`, Server Actions). Sie trägt: Anordnung, Umbruch, den
sichtbaren Hinweis *dass* gefiltert ist, und den einen Weg zurück auf „alles".

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `ReactNode` | ja | Die Filterfelder, in Lesereihenfolge | `Filled` |
| `activeCount` | `number` | nein | Wie viele Filter gesetzt sind; `0`/undefined = alles sichtbar | `Active` |
| `onReset` | `() => void` | nein | Setzt alle Filter zurück; ohne die Prop erscheint kein Zurücksetzen | `Active` |
| `resetHref` | `string` | nein | Alternative zu `onReset` für Server-Formulare (Link auf die ungefilterte Seite) | `ServerForm` |
| `submitLabel` | `string` | nein | Beschriftung des Anwenden-Knopfs; ohne die Prop kein Knopf (Felder wirken sofort) | `ServerForm` |

Typen: keine aus `src/ludwig/` — die Filterwerte kennt nur der Aufrufer.
`onReset` und `resetHref` schließen sich aus: gesetzt wird eins von beiden.

**Kann bewusst nicht:** Filterzustand halten, URL lesen oder schreiben, Werte
validieren, sich merken was zuletzt gewählt war. Alles das ist fachlich und
bleibt an der Aufrufstelle — sonst zöge die Hülle `useSearchParams` und damit
den Router ins Design-System.

## Verhalten

Server-Component, solange nur `resetHref` benutzt wird; mit `onReset` braucht
der Aufrufer einen Client-Wrapper (wie bei `Button`).

- **Position:** über der Karte, nie im Kartenkopf (Baukasten §6, wie `FilterChips`).
- **Umbruch:** die Felder fließen in eine Zeile und brechen um, wenn es eng
  wird; das Zurücksetzen bleibt am Ende, nicht am Anfang.
- **Gefiltert-Hinweis:** ist `activeCount > 0`, steht es als Wort da
  („3 Filter gesetzt") — nicht nur als Farbe (V7). Das ist zugleich der
  Anker für den Leerzustand: „leer nach Filter" braucht einen anderen Text
  als „noch nichts da" (V9, T6, siehe `EmptyState`).
- **Tastatur:** normale Formular-Reihenfolge, kein eigener Weg. Enter im Feld
  löst das Formular aus, wenn `submitLabel` gesetzt ist.
- **Text links** (V3), Beschriftungen sichtbar über den Feldern, nie nur
  Placeholder (I8).

## Stories

Titel `v3/Primitives/Navigation/FilterBar`. Abgeleitet nach §6: 2 Zustände
(gefüllt, aktiv) + 0 Enum-Props + 0 Layout-Booleans + 1 Callback (`onReset`)
+ 1 „im Einsatz" + 1 Rand (viele Felder, Umbruch) = 5.

| Story | Beweist |
|---|---|
| `Filled` | drei Felder in einer Zeile, nichts gesetzt — der Ruhezustand |
| `Active` | `activeCount={3}` mit Zurücksetzen, Rundlauf über `onReset` |
| `ServerForm` | `resetHref` + `submitLabel` — der Weg ohne Client-Zustand |
| `ManyFields` | sieben Felder, Umbruch in die zweite Zeile |
| `InUse` | über einer `Card` mit Tabelle, darunter der passende `EmptyState` „leer nach Filter" |

Nicht anwendbar: `Laedt` (die Hülle lädt nicht — die Liste darunter tut es),
`Fehler` (Feldfehler stehen am Feld, I8).

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `activeCount > 0` zeigt ein Wort, nicht nur Farbe (V7) | `v3-primitives-navigation-filterbar--active`: `.v2fbar__count` steht als „3 Filter gesetzt" im DOM; Klick auf „Zurücksetzen" räumt Zähler und Knopf weg, der Text darunter wechselt auf „Alles sichtbar." | ✓ |
| Ohne `onReset` und `resetHref` erscheint kein Zurücksetzen | `--filled`: `.v2fbar__end` ist im DOM leer — kein `button`, kein `a` | ✓ |
| Ohne `submitLabel` erscheint kein Anwenden-Knopf | `--filled`: kein `button[type=submit]`; in `--server-form` steht er als „Filtern" da | ✓ |
| Sieben Felder brechen um, das Zurücksetzen bleibt am Ende | `--many-fields` (Browser, 1092 px breit): vier Felder in Zeile 1, drei in Zeile 2, am Ende „5 Filter gesetzt · Zurücksetzen" | ✓ |
| Weder `next/navigation` noch etwas aus `@/ludwig` importiert | `grep "^import" src/ui/v3/primitives/FilterBar.tsx` → nur `react`, `./Button`, `./Link`, `./TextButton` | ✓ |
| Ersetzt die Formularzeile von `AccountFilterForm` ohne Funktionsverlust | Vergleich mit `app/apps/web/src/modules/accounts/ui/AccountFilterForm.tsx`: Anordnung, Umbruch, Anwenden-Knopf, Zähler und Zurücksetzen sind gedeckt; URL-Push, 300-ms-Entprellung, gekoppelte Parameter und die bedingte Sichtbarkeit einzelner Felder bleiben laut Spec („Hülle, nicht Motor") beim Aufrufer | ✓ |
| `pnpm typecheck` / `pnpm build` | beide grün (Storybook-Build abgeschlossen) | ✓ |

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: keine.
Anmerkung ohne Folgen für die Abnahme: `AccountFilterForm` hat in seiner zweiten
Zeile eine eigene rechtsbündige Gruppe (flach/gruppiert); `.v2fbar__end` gibt es
einmal, diese Gruppe liefe beim Umbau als gewöhnliches `children` mit.
