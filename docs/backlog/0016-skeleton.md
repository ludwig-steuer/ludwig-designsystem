# 0016 · Skeleton — die Ladefläche außerhalb der Tabelle

| | |
|---|---|
| Status | Abnahme |
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

- [ ] Nutzt `.v2skel`, definiert keine zweite Ladefläche (Blick ins CSS)
- [ ] `variant="card"` hält die Höhe einer echten Karte, ohne die Seite springen zu lassen (Story `InCard`, Regel V12)
- [ ] Genau ein `sr-only`-Satz je Skeleton, die Flächen sind `aria-hidden` (Story `Lines`, Blick ins DOM)
- [ ] Die `@when`-Zeile grenzt gegen `TableLoading` ab
- [ ] Ersetzt den handgebauten Platzhalter in mindestens einem der drei Fundorte ohne Funktionsverlust

## Offene Fragen

1. Braucht `variant="field"` eine eigene Höhe je Feldgröße? *Ohne Antwort:
   nein — eine Höhe, die zum `Input` passt.*
2. Soll `lines` auch bei `card` gelten? *Ohne Antwort: nein — `card` ist eine
   Fläche, keine Zeilenfolge.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
