---
name: aus-app-holen
description: Einen weiteren Baustein aus ludwig/app nach src/ui/v3 holen. Use when asked "hol X aus der App", "migriere Komponente Y nach v3", "übernimm den Baustein", or when something existing in apps/web/src/ui should become part of the design system. Rechnet die Import-Closure, entkoppelt Barrel-Importe und verifiziert das Ergebnis.
---

# Baustein aus ludwig/app nach v3 holen

Quelle: `../app/apps/web/src` (bzw. `$LUDWIG_SRC`). Das app-Repo wird dabei
**nicht verändert** — nur gelesen.

## 1. Closure rechnen, bevor irgendetwas kopiert wird

Der teure Fehler ist, eine Komponente zu kopieren und erst danach zu merken,
was sie nachzieht. Also erst messen:

```bash
grep -rhoE 'from "@/[^"]+"' <quelldatei-oder-ordner> | sort -u
```

Dann jeden `@/`-Treffer weiterverfolgen, bis nichts Neues mehr dazukommt.
Bei mehr als einer Handvoll Dateien lohnt ein kleines Script im Scratchpad,
das Imports rekursiv auflöst (`@/x` → `src/x`, plus `.ts`/`.tsx`/`index.ts`).

**Wonach zu suchen ist — Barrel-Importe.** Ein einziger Import auf
`@/ui/components` oder `@/modules/<fach>` zieht über die `index.ts` die
komplette Layout-, Auth- und DB-Kette nach. Bei der Erstbestückung war das
der Unterschied zwischen **641 und ~70 Dateien**. Sie sind leicht zu
übersehen, weil auch ein reiner *Typ*-Import genügt:

```ts
import type { BadgeKind } from "@/ui/components";   // zieht alles nach
import type { BadgeKind } from "@/ui/components/primitives/Badge";  // richtig
```

Jeder Barrel-Import wird beim Kopieren auf die **echte Quelldatei** umgebogen.

## 2. Grenze ziehen

- **Fachtypen** (`domain/`, DATEV-Regeln, geteilte Helfer) gehören nicht
  mitkopiert — sie kommen über `pnpm sync:ludwig` nach `src/ludwig/`.
  Fehlt etwas dort, die Pfadliste im Script erweitern statt von Hand kopieren.
- **Infrastruktur** (DB, Auth, Server Actions, `server-only`) kommt nie mit.
  Hängt die Komponente daran, ist sie nicht storybook-tauglich — dann gehört
  sie nicht ins Design-System, oder sie muss drüben erst entkoppelt werden.
- **Direkt einordnen.** Es gibt keinen Wartebereich mehr (`src/ui/legacy/`
  ist mit 0043 aufgelöst): jeder mitgenommene Baustein landet sofort in der
  Dreiteilung — kein Fachwort → `primitives/`, Arbeitsflächen-Muster →
  `patterns/`, Darstellung einer Entität → `entities/<name>/`.

## 3. Mitnehmen

Stories (`<Name>.stories.tsx`) kommen mit — ohne Story existiert der Baustein
für das Design-System nicht. Story-Titel auf `v3/…` ziehen; Bausteine, auf
denen v3 nur aufsetzt, landen unter `v3/Bausteine/…`.

Braucht die Komponente CSS, das noch fehlt: die Datei aus `app/apps/web/src/styles/`
holen und in `src/styles/index.css` in die Kette hängen. Seitenspezifische
Styles bleiben draußen.

Story, die eine App-Komponente braucht, welche nicht mitkommt (etwa den
v1-Button): Story weglassen, nicht die Abhängigkeit nachziehen.

## 4. Verifizieren — beides, nicht nur das Erste

```bash
pnpm typecheck
pnpm build
pnpm storybook     # Port 6107
```

Dann die neue Story **im Browser ansehen**. Typecheck und Build sind grün,
auch wenn eine Komponente völlig ungestylt rendert — fehlendes CSS fällt
ausschließlich visuell auf. Zum Vergleich lässt sich das Storybook der App
danebenlegen (`pnpm --filter @ludwig/web storybook`, Port 6106).

## 5. Nachtragen

Kam ein Baustein dazu, der im README-Baum genannt gehört, oder eine neue
CSS-Datei in die Kette: `README.md` mitziehen. Fiel bei der Migration ein
Befund an (Komponente hängt an Infrastruktur, Begriff fehlt im GLOSSARY),
gehört er in die Commit-Nachricht — er betrifft die App, nicht nur uns.
