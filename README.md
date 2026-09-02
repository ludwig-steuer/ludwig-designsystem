# Ludwig Design System v3

Die wiederverwendbaren UI-Bausteine von Ludwig — unabhängig von der App
entwickelbar, mit Storybook als Werkbank.

Das Repo wird später als Git-Submodule in `ludwig/` eingebunden. Bis dahin
ist es die Quelle, aus der v3 wächst; die App fährt weiter auf ihrem `ui/v2`.

## Loslegen

```bash
pnpm install
pnpm storybook     # http://localhost:6107
```

## Struktur

```
src/ui/v3/          Das Design-System — hier wird entwickelt.
  primitives/         kein Fachwort (Button, Table, Field, Dialog …)
  patterns/           Arbeitsflächen-Muster (MasterDetail, SchrittRail …)
  entities/<name>/    Darstellungsfamilie genau einer Entität
src/ui/               Bausteine, auf denen v3 aufsetzt (Badge, Banner,
                      Pagination, StatusBadge, Buchungs-Formatierung)
src/styles/           Tokens und Komponenten-CSS, index.css ist die Kette
src/ludwig/           KOPIE der Ludwig-Interfaces — siehe unten
```

Importiert wird nur abwärts: Primitives kennen keine Patterns, Patterns keine
Entitäten. Was hier liegt, kennt kein Fachmodul — Daten kommen als Props.

## Die Ludwig-Interfaces

`src/ludwig/` ist eine **Kopie** des Datenmodells aus `ludwig/app/apps/web`:
DATEV-Regeln, geteilte Helfer und die Fachtypen je Modul. Sie liegt hier,
damit Stories mit den echten Typen arbeiten und realistische Ausprägungen
zeigen — ohne die App als Abhängigkeit.

**Nie direkt bearbeiten.** Änderungen gehören nach `ludwig/app/apps/web/src`,
danach:

```bash
pnpm sync:ludwig
```

Das Script spiegelt neu, biegt die Import-Pfade auf `@/ludwig/…` um, erzeugt
die Modul-Barrels und lässt alles weg, was an Infrastruktur hängt (DB, Auth,
Server Actions) — die gehört nicht ins Design-System. Liegt Ludwig woanders:
`LUDWIG_SRC=/pfad/zu/app/apps/web/src pnpm sync:ludwig`.

## Prüfen

```bash
pnpm typecheck
pnpm build         # statisches Storybook nach storybook-static/
```
