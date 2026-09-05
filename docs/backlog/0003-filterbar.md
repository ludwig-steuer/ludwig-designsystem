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

- [ ] `activeCount > 0` zeigt ein Wort, nicht nur Farbe (Story `Active`, Regel V7)
- [ ] Ohne `onReset` und `resetHref` erscheint kein Zurücksetzen (Story `Filled`)
- [ ] Ohne `submitLabel` erscheint kein Anwenden-Knopf (Story `Filled`)
- [ ] Sieben Felder brechen um, das Zurücksetzen bleibt am Ende (Story `ManyFields`)
- [ ] Die Komponente importiert weder `next/navigation` noch etwas aus `@/ludwig` — Filterzustand bleibt draußen
- [ ] Ersetzt die Formularzeile von `AccountFilterForm` ohne Funktionsverlust; die fachlichen Teile (Domänen-Typen, URL) bleiben dort


## Offene Fragen

1. Wirken Filter sofort oder erst auf Knopfdruck? *Ohne Antwort: beides
   möglich — `submitLabel` entscheidet es je Aufrufstelle. Die App macht
   heute beides.*
2. Gehört die Volltextsuche in die `FilterBar` oder bleibt sie im Kartenkopf?
   *Ohne Antwort: sie kann als `children` hinein, muss aber nicht — `SearchInput`
   hat sein eigenes `@when` („Full-text search across the rows of a card").*
3. Soll `activeCount` die Zahl selbst formatieren („3 Filter gesetzt")?
   *Ohne Antwort: ja, in der Komponente — sonst schreibt es jede Seite anders.*

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

### Dritte Abnahme am 2026-09-05 — gegen die wiederhergestellten Kriterien

Der Commit `64fbe27` hatte „Abnahmekriterien" und „Offene Fragen" gelöscht und
gleichzeitig die Abnahme-Tabelle eingetragen; die Abnahme vom 2026-09-03 lief
damit gegen eine Liste, die zu dem Zeitpunkt nicht mehr im Dokument stand.
`e6eae99` hat beide Abschnitte zurückgeholt. **Die Wiederherstellung ist
vollständig:** `diff <(git show 64fbe27^:docs/backlog/0003-filterbar.md) docs/backlog/0003-filterbar.md`
zeigt im Block von „## Abnahmekriterien" bis „## Abnahme" nur eine zusätzliche
Leerzeile, sonst kein Zeichen Unterschied. Nichts nachzuholen.

Diese Runde nimmt die frühere Abnahme nicht als gegeben, sondern prüft jedes
Kriterium noch einmal — fest **und** variabel, je eine Zeile. Die alte Tabelle
bleibt darüber stehen.

**Story-Deckung.** Fünf Stories in der Spec, fünf Exporte in
`FilterBar.stories.tsx` (`Filled`, `Active`, `ServerForm`, `ManyFields`,
`InUse`), fünf IDs in `/index.json` — die Ableitung „2 Zustände + 0 Enum-Props
+ 0 Layout-Booleans + 1 Callback + 1 im Einsatz + 1 Rand = 5" geht auf. Jede
Prop hat ihre Story: `children` in `Filled`, `activeCount` und `onReset` in
`Active`, `resetHref` und `submitLabel` in `ServerForm`. Ausgeschlossen und
begründet: `Laedt`, `Fehler`. `Leer` nennt die Spec nicht ausdrücklich unter
den Ausschlüssen — eine Filterzeile ohne Felder ist ein Programmierfehler, und
„leer nach Filter" zeigt `InUse` mit `EmptyState`.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** · `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0 — am Anfang und am Ende dieser Abnahme gelaufen | ✓ |
| **Fest** · `pnpm build` grün | nicht neu gelaufen: parallele Sitzungen schreiben nach `storybook-static`. Der Lauf für diesen Stand war grün — „Storybook build completed successfully" | ✓ |
| **Fest** · Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/FilterBar.tsx` mit einem Export, `FilterBar.stories.tsx` daneben; Titel `v3/Primitives/Navigation/FilterBar` (`FilterBar.stories.tsx:10`) deckt sich mit der Barrel-Gruppe „Navigation" (`src/ui/v3/index.ts:80` … `:91`) | ✓ |
| **Fest** · Code englisch; `@when`/`@instead` am Export | `FilterBar.tsx:16` und `:18`; Bezeichner (`activeCount`, `onReset`, `resetHref`, `submitLabel`, `active`), Kommentare und JSDoc englisch. Deutsch nur in den sichtbaren Strings „Filter gesetzt" (`:49`) und „Zurücksetzen" (`:54`, `:59`) | ✓ |
| **Fest** · Kein Hex, kein px, keine lokale Label-Map, Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}' FilterBar.tsx` = 0; `grep -cE '[0-9]+px\|fontSize' FilterBar.tsx` = 0; keine Map, kein Status-Text — Maße stehen in `v3.css:1878–1883` | ✓ |
| **Fest** · Alle Stories vorhanden; ausgeschlossene Zustände begründet | `/index.json`: `--filled`, `--active`, `--server-form`, `--many-fields`, `--in-use`; `Laedt` und `Fehler` in der Spec begründet (siehe Story-Deckung oben) | ✓ |
| **Fest** · Prüfliste `design-guidelines.md` §9 durchgegangen | siehe die Zeilen dieser Tabelle (Kontrast, Fokus, Hover, Text links, keine Versalien, Rand-oder-Schatten); die zwei App-Punkte („ersetzt ihr v1-Gegenstück", „in §11 auf v2 gesetzt") nach `backlog/README.md` übersprungen. Versalien: `FilterBar` selbst schreibt keine Beschriftung — `.v2field__label` kommt aus `Field`, der set-weite Befund läuft unter 0089 | ✓ |
| **Fest** · Im Browser angesehen, nicht nur gebaut | Alle fünf IDs am 2026-09-05 auf `localhost:6107` geöffnet, gemessen und bedient (Zurücksetzen geklickt) | ✓ |
| **Variabel** · `activeCount > 0` zeigt ein Wort, nicht nur Farbe (V7) | `--active`: `.v2fbar__count` = „3 Filter gesetzt", Farbe `rgb(92,92,92)` (Kontrast 6,17:1 gegen `rgb(244,246,248)`) — die Farbe trägt nichts, das Wort alles. Klick auf „Zurücksetzen" leert `.v2fbar__end` (0 Kinder), der Satz darunter wechselt von „3 Filter wirken." auf „Alles sichtbar." | ✓ |
| **Variabel** · Ohne `onReset` und `resetHref` erscheint kein Zurücksetzen | `--filled`: `.v2fbar__end.innerHTML` ist der leere String, 0 Kinder, kein `button`, kein `a`. Im Code sind beide Zweige doppelt bewacht (`FilterBar.tsx:52` und `:57`) — auch bei `activeCount > 0` ohne die Props erscheint nichts | ✓ |
| **Variabel** · Ohne `submitLabel` erscheint kein Anwenden-Knopf | `--filled`: `button[type=submit]` 0×. `--server-form`: genau einer, beschriftet „Filtern"; Reihenfolge in `.v2fbar__end` = Knopf · Zähler · `a.v2link--quiet` „Zurücksetzen" | ✓ |
| **Variabel** · Sieben Felder brechen um, das Zurücksetzen bleibt am Ende | `--many-fields` (Browser, 1200 px Fenster, Story-Rahmen 720 px): 7 `.v2field`; Umbruch in zwei Zeilen (Oberkanten ≈16–20 px: Kreditor, Belegdatum ab, Belegdatum bis, Konto — ≈85–87 px: Betrag ab, Status, Suche), `.v2fbar__end` steht darunter rechtsbündig (`right` = 736 px = rechte Kante des Rahmens) mit „5 Filter gesetzt · Zurücksetzen" | ✓ |
| **Variabel** · Weder `next/navigation` noch etwas aus `@/ludwig` importiert | `grep -n "^import" src/ui/v3/primitives/FilterBar.tsx` → vier Zeilen: `react` (nur `type ReactNode`), `./Button`, `./Link`, `./TextButton`. Kein Router, kein Domänen-Typ, kein Zustand | ✓ |
| **Variabel** · Ersetzt die Formularzeile von `AccountFilterForm` ohne Funktionsverlust | `AccountFilterForm.tsx` liegt in `ludwig/app` (`apps/web/src/modules/accounts/ui/`); dort gibt es kein `src/ui/v3`, `apps/web/src/ui/` führt `v2`, und kein `FilterBar`-Import. Nach `backlog/README.md` ein Kriterium der App — die Abnahme vom 2026-09-03 hatte es als ✓ geführt, was der Hausregel widerspricht | offen (App) |

**Zwei Anmerkungen ohne Folge für die Abnahme.**

1. `InUse` baut seine Beispieltabelle mit rohen `<th>`/`<td>` in `HeadRow`/`Row`
   (`FilterBar.stories.tsx:123–127`, `:141–150`); beide rendern `div`. React
   meldet dafür in der Konsole „In HTML, `<th>` cannot be a child of `<div>`".
   Die anderen vier Stories sind konsolenrein. Es trifft die Beispieldaten der
   Story, nicht die Komponente, und dieselbe Stelle steht so auch in
   `DateField.stories.tsx:166–168`; die Hausregeln kennen dazu kein Kriterium.
   Das Set schreibt sonst `<span>` (z. B. `patterns/StatusHeader.stories.tsx:36`).
2. Der Baustein hat inzwischen eine Aufrufstelle im Set:
   `patterns/LogBrowser.tsx:142`. Er steht nicht mehr allein neben seinen
   eigenen Stories.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · zweite Prüfung gegen
die wiederhergestellten Kriterien · Offene Punkte: nur „offen (App)" — die
Ablösung der Formularzeile von `AccountFilterForm` in `ludwig/app`.
