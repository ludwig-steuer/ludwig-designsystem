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
  patterns/           Arbeitsflächen-Muster (MasterDetail, StepRail …)
  entities/<name>/    Darstellungsfamilie genau einer Entität
src/styles/           Tokens und Komponenten-CSS, index.css ist die Kette
src/ludwig/           KOPIE der Ludwig-Interfaces — siehe unten
docs/                 Designsprache (SSOT hier) + gespiegelte App-Doku
```

Importiert wird nur abwärts: Primitives kennen keine Patterns, Patterns keine
Entitäten. Was hier liegt, kennt kein Fachmodul — Daten kommen als Props.

## Ordnung im Set

Die Ordner tragen die **Stufe** (daran hängt die Import-Regel), die
Storybook-Titel tragen den **Inhalt**. Fünf Regeln, sonst nichts:

| | Regel |
|---|---|
| **Datei** | Eine Datei je Komponentenfamilie, PascalCase, benannt wie die Familie: `Button.tsx` (Button, KeyButton), `Table.tsx` (Card, Table, Row …). Kein Sammelbecken. |
| **Story** | `<Name>.stories.tsx` daneben, Titel `v3/<Stufe>/<Gruppe>/<Name>`. Die Gruppen sind dieselben Wörter wie die Kommentare in `src/ui/v3/index.ts`: Aktion, Navigation, Formular, Dialog, Fläche, Tabelle · Arbeitsfläche, Rahmen, Prüfen, Prozess · je Entität ihr Name. |
| **Wann** | Jeder Export trägt im JSDoc, auf Englisch, `@when` (der Fall, für den er da ist) und `@instead` (der Nachbarfall und wohin der gehört: `… → MasterDetail`). Das ist die Antwort auf „was nehme ich?" — greppbar und im Editor-Hover. |
| **Entitäten** | Name = Entität + Form: `AccountField`, `KontoZeile`, `JournalEntryEditor`. Die Formen stehen in `docs/ui-repraesentationen.md`; ihre Größe ist ableitbar, nicht gespeichert — XS Inline, Badge · S Zeile, Auswahl, Kopf · M Karte, Vorschau · L Detail, Drawer, Liste · XL Editor. |
| **Sprache** | Code nur Englisch: Bezeichner, Kommentare, JSDoc, `@when`/`@instead`, Story-Exportnamen. Deutsch nur in Nutzer-Strings und Storybook-Titeln. Fachbegriffe: englischer GLOSSARY-Name im Code, deutscher im UI. |
| **Wachstum** | `primitives/` bleibt flach. `patterns/` bekommt Themen-Unterordner, sobald es mehr als etwa 15 Dateien sind. `entities/` ist per Definition nach Inhalt sortiert. |

## Doku — wer führt was

Hier gepflegt, maßgeblich für jede Gestaltungsfrage:

| Datei | Inhalt |
|---|---|
| `docs/backlog/` | Aufgaben: eine Datei je Komponente mit Spec und Abnahme (`README.md` dort erklärt den Ablauf). `docs/v3-backlog.md` ist die Erhebung, aus der Aufgaben entstehen. |
| `docs/design-guidelines.md` | Die Designsprache: Prinzipien, Layout, Text, Zustand, Interaktion. |
| `docs/ton-und-sprache.md` | Schneller Index: immer „Sie", Tokens, verbotene Wörter. |
| `docs/ui-repraesentationen.md` | Das Inventar: welche Entität welche UI-Repräsentation hat, wo doppelt gebaut wurde, welche Form noch fehlt. Bis 2026-09-03 in `ludwig/app`, jetzt hier. |
| `reference/` | Die Lieferungen, wie geliefert — Artboards, Design-Briefs und das v2-Bundle. Wird zitiert, nicht gepflegt (`reference/README.md`). |

`docs/ludwig/` ist dagegen eine **Kopie** dessen, was drüben SSOT bleibt, und
kommt über dasselbe `pnpm sync:ludwig`:

| Datei | Inhalt |
|---|---|
| `GLOSSARY.md` | Namens-SSOT, DE/EN je Begriff. **Bei jedem neuen Prop- oder Typnamen hier nachschlagen**, statt zu erfinden — Kanzlei statt Tenant, Mandant statt Client. |
| `web-ui.md` | Code-Regeln R1–R21 der Web-App. |

Die Fassungen der beiden Design-Dokumente, die noch in `ludwig/app` liegen,
sind die alten. Sie werden beim Einbinden als Submodule durch einen Zeiger
hierher ersetzt — bis dahin nur hier ändern.

Falls dort doch jemand ergänzt: `pnpm sync:ludwig` merkt es und sagt, welche
Datei betroffen ist und wie sich der Unterschied ansehen lässt. Übernommen
wird nichts automatisch — die Design-Doku gehört diesem Repo. Der Abgleich
läuft über `.design-doc-stamps`; nach dem Übernehmen den Stand quittieren
(das Script zeigt den passenden Befehl).

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

## Skills

Drei Repo-Skills tragen die Hausregeln zusammen, statt sie über vier
Dokumente verstreut zu lassen:

| Skill | Wofür |
|---|---|
| `spec-schreiben` | Eine Komponente spezifizieren, bevor sie gebaut wird — Klasse, wiederverwenden/erweitern/neu, zerlegen/zusammenlassen, Stories aus den Props abgeleitet, Abnahmekriterien. Schreibt `docs/backlog/NNNN-<slug>.md`. |
| `v3-komponente` | Eine Komponente bauen, ändern oder abnehmen — Dreiteilung, Tokens, GLOSSARY-Namen, Ton, Story-Pflicht, Prüfliste. |
| `aus-app-holen` | Einen weiteren Baustein aus `ludwig/app` übernehmen — Closure rechnen, Barrel-Importe entkoppeln, verifizieren. |
