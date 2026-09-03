# 0016 · Skeleton — die Ladefläche außerhalb der Tabelle

| | |
|---|---|
| Status | in Arbeit |
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

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Nutzt `.v2skel`, definiert keine zweite Ladefläche | `v3.css` 741 (`.v2skel`, Puls) und 1327–1329 — dort nur die Gruppe und zwei Höhen-Modifier, kein zweiter Ladestil | ✓ |
| `variant="card"` hält die Kartenhöhe, ohne die Seite springen zu lassen | `v3-primitives-fläche-skeleton--in-card` im Browser: der Kartenkopf steht, die Fläche hält feste 96 px | ✓ |
| Genau ein `sr-only`-Satz je Skeleton, Flächen `aria-hidden` | `v3-primitives-fläche-skeleton--lines`, DOM-Probe: ein `.sr-only` („Sachverhalt wird geladen …"), alle vier Balken `aria-hidden="true"` | ✓ |
| Die `@when`-Zeile grenzt gegen `TableLoading` ab | `Skeleton.tsx`: `@when` nennt Karte, Detailfläche, Formularfeld; die Abgrenzung selbst steht in `@instead` („Rows inside a table → TableLoading") | ✓ |
| Ersetzt den handgebauten Platzhalter in mindestens einem der drei Fundorte | Keine Aufrufstelle außer den eigenen Stories; in `ludwig/app` kein `Skeleton`-Import (`grep`) | ✗ |

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: die Ablösung der handgebauten Platzhalter steht noch aus — sie liegt in `ludwig/app`, nicht in diesem Repo.
