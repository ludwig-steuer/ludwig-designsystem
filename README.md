# Ludwig Design System v3

Die wiederverwendbaren UI-Bausteine von Ludwig — unabhängig von der App
entwickelbar, mit Storybook als Werkbank.

Das Repo wird später als Git-Submodule in `ludwig/` eingebunden. Bis dahin
ist es die Quelle, aus der v3 wächst; die App fährt weiter auf ihrem `ui/v2`.

**Dieses Repo ist das Design-SSOT.** Designsprache, Ton und die Bausteine
werden hier entschieden — nicht mehr in `ludwig/app/docs/`.

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
docs/                 Designsprache (SSOT hier) + gespiegelte App-Doku
```

Importiert wird nur abwärts: Primitives kennen keine Patterns, Patterns keine
Entitäten. Was hier liegt, kennt kein Fachmodul — Daten kommen als Props.

## Doku — wer führt was

Hier gepflegt, maßgeblich für jede Gestaltungsfrage:

| Datei | Inhalt |
|---|---|
| `docs/design-guidelines.md` | Die Designsprache: Prinzipien, Layout, Text, Zustand, Interaktion. |
| `docs/ton-und-sprache.md` | Schneller Index: immer „Sie", Tokens, verbotene Wörter. |

`docs/ludwig/` ist dagegen eine **Kopie** dessen, was drüben SSOT bleibt, und
kommt über dasselbe `pnpm sync:ludwig`:

| Datei | Inhalt |
|---|---|
| `GLOSSARY.md` | Namens-SSOT, DE/EN je Begriff. **Bei jedem neuen Prop- oder Typnamen hier nachschlagen**, statt zu erfinden — Kanzlei statt Tenant, Mandant statt Client. |
| `web-ui.md` | Code-Regeln R1–R21 der Web-App. |
| `ui-repraesentationen.md` | Welche Entität welche UI-Repräsentation hat. |

Die Fassungen der beiden Design-Dokumente, die noch in `ludwig/app` liegen,
sind die alten. Sie werden beim Einbinden als Submodule durch einen Zeiger
hierher ersetzt — bis dahin nur hier ändern.

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

Das Script spiegelt Interfaces **und** die App-Doku neu, biegt die Import-Pfade
auf `@/ludwig/…` um, erzeugt die Modul-Barrels und lässt alles weg, was an
Infrastruktur hängt (DB, Auth, Server Actions) — die gehört nicht ins
Design-System. Welche Dokumente mitkommen, steht als `DOCS_TO_MIRROR` oben im
Script. Liegt Ludwig woanders:
`LUDWIG_SRC=/pfad/zu/app/apps/web/src pnpm sync:ludwig`.

## Prüfen

```bash
pnpm typecheck
pnpm build         # statisches Storybook nach storybook-static/
```
