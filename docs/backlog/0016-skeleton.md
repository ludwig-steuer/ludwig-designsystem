# 0016 · Skeleton — die Ladefläche außerhalb der Tabelle

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, „lädt noch" ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 1 „Ladefläche für Karte/Detail (Skeleton)" · `v3-backlog.md` „Ladeanzeige außerhalb der Tabelle" (3) |
| Ersetzt | 3 Dateien mit eigenem Lade-Platzhalter; gibt den 11 `Suspense`-Fallbacks eine Form |
| Blockiert | jede Detail-, Drawer- und Kartenmigration, die serverseitig lädt |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Beim Öffnen eines Sachverhalts steht die Sachbearbeiterin vor einer leeren
Fläche und weiß nicht, ob Ludwig lädt oder nichts da ist. `TableLoading` löst
das für Tabellenzeilen; für Karte, Detail und Drawer gibt es nichts — die elf
`Suspense`-Fallbacks der App zeigen entweder gar nichts oder einen Satz Text,
der beim Eintreffen der Daten wegspringt.

## Einordnung

- **Wiederverwenden:** `TableLoading` (`@when Loading state inside the card,
  header rows stay in place`) rendert `.v2tbl__row`-Zeilen — außerhalb einer
  Tabelle ist das falsches Markup. `EmptyState` ist der vierte Zustand, nicht
  der fünfte.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, und die
  Ladeform ist eine Designentscheidung (Höhe, Rhythmus, Bewegung), die nicht
  an elf Aufrufstellen neu getroffen werden darf.
- **Zuschnitt:** eine Datei, ein Export mit `variant`. Kein Familien-Fall.
- **Setzt auf:** die vorhandene Klasse `.v2skel` (heute nur in
  `TableLoading` benutzt) — kein zweites Aussehen für dieselbe Sache.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `variant` | `"lines" \| "card" \| "field"` | nein | Was Platz hält: Textzeilen (Default), eine Kartenfläche, ein Formularfeld | `Variants` |
| `lines` | `number` | nein | Zahl der Zeilen bei `variant="lines"`, Default 3 | `Lines` |
| `label` | `string` | nein | Was geladen wird — nur für Screenreader, Default „Wird geladen …" | `InCard` |

Was die Komponente **nicht** kann: einen Fortschritt zeigen (das ist
`ProgressCell`), nach n Sekunden auf einen Fehler umschalten (der Aufrufer
entscheidet, wann aus „lädt" ein `ErrorRow` wird), und sie hat keine
Mindestanzeigedauer — Flackern verhindert der Aufrufer, nicht der Platzhalter.

## Verhalten

Server-Component; sie hat keinen Zustand. Kein Fokus, kein Hover — sie ist
nicht klickbar und bekommt deshalb bewusst keine Hover-Antwort (§2).
`aria-hidden` auf den Flächen, dazu ein `sr-only`-Satz mit `label`, damit ein
Screenreader eine Aussage bekommt statt drei leere Kästen. Bewegung: der
vorhandene Puls von `.v2skel`, kein neuer Effekt (V12).

## Stories

Titel `v3/Primitives/Fläche/Skeleton`. Abgeleitet nach §6: 1 Zustand (lädt)
+ 1 Enum (`variant`) + 0 Callbacks + 1 „im Einsatz" = 3.

| Story | Beweist |
|---|---|
| `Lines` | drei Zeilen, unterschiedliche Breiten — kein Streifenmuster |
| `Variants` | `lines`, `card`, `field` nebeneinander |
| `InCard` | in einer `Card` mit `CardHead`: der Kopf steht, der Inhalt lädt |

Nicht anwendbar: `Gefuellt`, `Leer`, `LeerNachFilter`, `Fehler` — die
Komponente **ist** der Ladezustand; die anderen vier zeigt der Aufrufer mit
`EmptyState` und `ErrorRow`.

## Abnahme

Zweite Abnahme am 2026-09-05 (fremder Agent, gegen Spec und Code, nicht gegen
die Erzählung). Fest gilt immer, darunter die Kriterien dieser Spec.

**Story-Deckung.** Drei Stories in der Spec, drei Exporte in
`Skeleton.stories.tsx` (`Lines`, `Variants`, `InCard`), drei IDs in
`index.json` — die Ableitung „1 Zustand + 1 Enum + 0 Callbacks + 1 im Einsatz
= 3" geht auf. Jede Prop hat ihre Story: `variant` in `Variants`, `lines` in
`Lines` (`lines={4}`), `label` in `Lines` und `InCard`. Die vier
ausgeschlossenen Zustände sind begründet — die Komponente **ist** der
Ladezustand.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme) | ✓ |
| `pnpm build` grün | nicht neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`. Der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Skeleton.tsx` mit einem Export, `Skeleton.stories.tsx` daneben; Titel `v3/Primitives/Fläche/Skeleton`, deckt sich mit der Barrel-Gruppe „Fläche" (`src/ui/v3/index.ts:117` … `:129`) | ✓ |
| Code englisch; `@when`/`@instead` am Export | `Skeleton.tsx:15–17`; Bezeichner (`SkeletonVariant`, `LINE_WIDTHS`, `variant`, `lines`, `label`), Kommentare und JSDoc englisch. Deutsch nur im Default-String „Wird geladen …", der sichtbar ist | ✓ |
| Kein Hex, kein px in der Komponente, keine lokale Label-Map, kein eigener Status-Text | `grep -cE '#[0-9a-fA-F]{3,8}' Skeleton.tsx` = 0; kein Zahlenmaß im `style` (nur `width` aus `LINE_WIDTHS`, in Prozent); keine Map, kein Status | ✓ |
| Nutzt `.v2skel`, definiert keine zweite Ladefläche | `v3.css:980–986` (`.v2skel`, Puls `v2pulse`, `prefers-reduced-motion: reduce → animation: none`) und `v3.css:1660–1662` — dort nur die Gruppe `.v2skelgroup` und zwei Höhen-Modifier, kein zweiter Ladestil. Zeilennummern gegenüber der ersten Abnahme verschoben, Inhalt gleich | ✓ |
| Bewegung respektiert `prefers-reduced-motion` (§2) | `v3.css:986` schaltet die Animation ab; im Browser `animation-name: v2pulse` an `.v2skel` (`--lines`) | ✓ |
| `variant="card"` hält die Kartenhöhe, ohne die Seite springen zu lassen | `v3-primitives-fläche-skeleton--in-card` im Browser (6107): `getComputedStyle(.v2skel--card).height` = **96px**, `border-radius` 4px; der Kartenkopf „Kennzahlen" steht, darunter die Fläche | ✓ |
| Genau ein `sr-only`-Satz je Skeleton, Flächen `aria-hidden` | `--lines`, DOM-Probe: `.sr-only` genau 1× („Sachverhalt wird geladen …"), alle vier `.v2skel` mit `aria-hidden="true"`. `--in-card`: zwei Skeletons, zwei Sätze („Offene Posten werden geladen …", „Wird geladen …") | ✓ |
| Zeilen ungleich breit — kein Streifenmuster | `--lines`: gemessene Breiten 420 / 352,8 / 260,4 / 382,2 px aus `100% / 84% / 62% / 91%`; die Reihenfolge ist fest, nicht zufällig (`LINE_WIDTHS`, Server-Component) | ✓ |
| Karte: Rand **oder** Schatten (§2) | `--in-card`: `.v2card` hat `border: 1px solid rgb(221,226,232)` und `box-shadow: none` | ✓ |
| Kein Hover, kein Fokus — die Fläche ist nicht klickbar (§2) | `Skeleton.tsx` rendert nur `div`/`span`, kein `tabindex`, kein Handler; in `v3.css` keine `:hover`-Regel auf `.v2skel*` | ✓ |
| Die `@when`-Zeile grenzt gegen `TableLoading` ab | `Skeleton.tsx:15–17`: `@when` nennt Karte, Detailfläche, Formularfeld; `@instead` „Rows inside a table → TableLoading. Nothing there at all → EmptyState. Loading failed → ErrorRow." | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle drei IDs am 2026-09-05 auf `localhost:6107` geöffnet und gemessen: `--lines`, `--variants` (alle drei Ausprägungen nebeneinander), `--in-card` | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | siehe die Zeilen dieser Tabelle; die zwei App-Punkte („ersetzt ihr v1-Gegenstück", „in §11 auf v2 gesetzt") nach `backlog/README.md` übersprungen | ✓ |
| Ersetzt den handgebauten Platzhalter in mindestens einem der drei Fundorte | Die drei Fundorte liegen in `ludwig/app`; dort gibt es `src/ui/v3` nicht (`apps/web/src/ui/` führt `v2`), und kein `Skeleton`-Import aus dem Set. Nach `backlog/README.md` ein Kriterium der App | offen (App) |

**Zur Einordnung vom 2026-09-05: sie trägt.** Der einzige ✗ der ersten
Abnahme war tatsächlich ein App-Kriterium und ist hier nicht erfüllbar; es
steht jetzt als **offen (App)**. Ergänzend, was die erste Abnahme noch nicht
sehen konnte: der Baustein hat inzwischen **vier Aufrufstellen im Set** —
`patterns/Timeline.tsx:119`, `patterns/Log.tsx:139`,
`entities/source-document/SourceDocumentDrawer.tsx:161`,
`entities/account/AccountDrawer.tsx:144`. Er steht also nicht mehr allein
neben seinen eigenen Stories.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: nur „offen (App)" — die Ablösung der drei handgebauten Platzhalter passiert in `ludwig/app`.
