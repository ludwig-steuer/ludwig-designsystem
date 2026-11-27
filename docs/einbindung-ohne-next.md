# Einbindung ohne Next und ohne Netz

Für einen Verbraucher, der weder Next noch einen eigenen Tailwind-Lauf hat —
heute die Browser-Erweiterung Ludwig DUO-Connect (Hauptseite und Popup).
Spec: `docs/backlog/0271-standalone-consumption.md`. Die App ist davon nicht
berührt; sie bindet das Set wie bisher ein.

## 1 Submodul

Das Set kommt als Git-Submodul auf festem Commit, zum Beispiel unter
`vendor/designsystem`:

```bash
git submodule add https://github.com/ludwig-steuer/ludwig-designsystem.git vendor/designsystem
git -C vendor/designsystem checkout <commit>
```

Im Submodul wird nichts installiert und nichts gebaut. Gebündelt wird aus den
Quellen; das fertige CSS liegt eingecheckt in `dist/ludwig.css`.

Nur für einen Probelauf aus einem lokalen Klon statt von GitHub braucht
`git submodule add` den Schalter `-c protocol.file.allow=always`.

## 2 Einstieg

Der Einstieg ist das Barrel `src/ui/v3/index.ts` — dieselbe öffentliche
Schnittstelle wie für die App, jeder Export mit `@when`/`@instead`. Was das
Barrel nicht exportiert, gibt es für einen Verbraucher nicht. Dateipfade
darunter sind Innenleben und ändern sich mit jedem Umzug.

```tsx
import { Badge, Button, Callout, Link, Progress, Tabs } from "@ludwig/designsystem";
```

`package.json` des Sets trägt `"sideEffects": ["*.css"]`. Damit lässt der
Bündler alles weg, was die genutzten Bausteine nicht brauchen.

## 3 Laufzeit-Abhängigkeiten

Im eigenen Lockfile fest versioniert, in den Bereichen aus `package.json` des
Sets (Stand des Probelaufs in Klammern):

- `react` und `react-dom` 19 (19.2.8) — dieselbe Hauptversion wie das Set
- `lucide-react` (1.39.0) und `decimal.js` (10.6.0) — von Bausteinen gebraucht
- `cmdk` (1.1.1) und `zod` (3.25.76) — nur damit der Bündler das Barrel
  auflösen kann; im Bündel landen sie nicht
- `date-fns` (4.4.0) — nur für `tsc` (Punkt 6): `src/ludwig/shared/index.ts`
  reicht `dates.ts` weiter; im Bündel landet es nicht
- `clsx` und `tailwind-merge` stehen im `package.json` des Sets, das Barrel
  braucht sie nicht

## 4 esbuild

Das Beispiel, das im Probelauf lief (2026-11-27, esbuild 0.28.2), Zeichen für
Zeichen:

```js
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const DS = "./vendor/designsystem";

const result = await build({
  entryPoints: ["src/main.tsx"],
  outdir: "out",
  bundle: true,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  minify: true,
  metafile: true,
  loader: { ".woff2": "file" },
  alias: {
    "next/link": `${DS}/src/compat/next-link.tsx`,
    "@ludwig/designsystem": `${DS}/src/ui/v3/index.ts`,
  },
  define: { "process.env.NODE_ENV": '"production"' },
});
writeFileSync("out/meta.json", JSON.stringify(result.metafile));
```

- `alias`-Pfade löst esbuild gegen das Arbeitsverzeichnis auf, nicht gegen die
  importierende Datei.
- **Kein globales `tsconfig`** an esbuild übergeben: Für die Dateien des Sets
  findet esbuild dessen `tsconfig.json` und löst damit `@/…` selbst auf. Ein
  globales `--tsconfig` des Verbrauchers bricht diese Auflösung.
- `src/compat/next-link.tsx` ersetzt `next/link`: ein `<a>` mit allen
  Attributen und `ref`, `prefetch` wird verworfen. Das Set selbst importiert
  die Datei nie.
- `format: "iife"` mit `<script defer>` läuft in einer Erweiterungsseite und
  unter `file://` gleich; ein Modul-Skript (`type="module"`) blockt Chrome
  unter `file://`.

Die Seite dazu:

Die Einstiegsdatei `src/main.tsx` hängt React in die Seite:

```tsx
import "../vendor/designsystem/dist/ludwig.css";
import "../vendor/designsystem/src/styles/fonts.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

```html
<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><title>Probe</title><link rel="stylesheet" href="out/main.css"></head>
<body><div id="root"></div><script defer src="out/main.js"></script></body>
</html>
```

## 5 CSS und Schriften

In der Einstiegsdatei:

```tsx
import "../vendor/designsystem/dist/ludwig.css";
import "../vendor/designsystem/src/styles/fonts.css";
```

- `dist/ludwig.css` ist die fertige Stilkette (Preflight, Tokens, alle
  Bausteinklassen), verkleinert, ohne `@tailwind`, `@import` und Schrift.
- `fonts.css` bringt Inter und JetBrains Mono; esbuild kopiert die beiden
  woff2 neben das Bündel. Source Serif 4 (`fonts-serif.css`) bindet nur ein,
  wer das lesende Register oder das Wordmark als Text braucht.
- `src/styles/index.css` nie direkt: Es enthält `@tailwind`.

## 6 Typprüfung

Die `paths` des Verbrauchers gelten für alle Dateien, auch für die des Sets.
Die `tsconfig.json` des Probelaufs, Zeichen für Zeichen:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2023"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./vendor/designsystem/src/*"],
      "@ludwig/designsystem": ["./vendor/designsystem/src/ui/v3/index.ts"],
      "next/link": ["./vendor/designsystem/src/compat/next-link.tsx"]
    }
  },
  "include": ["src"]
}
```

Dazu `typescript` (5.x) sowie `@types/react` und `@types/react-dom` 19. `@ludwig/designsystem` steht
in `paths`, weil Spiegeldateien in `src/ludwig/` Typen von dort holen. Belegt
der Verbraucher `@/` selbst, siehe Ausbau in der Spec (relative Importe im
Set).

## 7 Lizenzen

Mit in die Erweiterung legen (zum Beispiel unter `licenses/`):

- `src/styles/fonts/OFL-inter.txt` und `OFL-jetbrainsmono.txt` — SIL OFL 1.1
  verlangt den Text bei der Weitergabe; `OFL-sourceserif4.txt` nur, wenn
  `fonts-serif.css` mitkommt
- den ISC-Text von Lucide (`node_modules/lucide-react/LICENSE`)

## 8 Neuer Stand

Den Submodul-Zeiger heben. Der Commit im Set nennt, was sich an Bausteinnamen
oder Props geändert hat.

## Für das Set selbst

Wer CSS oder Klassennamen ändert, baut die Datei neu und prüft sie:

```bash
pnpm build:css   # schreibt dist/ludwig.css (Tailwind-CLI, ohne Netz)
pnpm check:css   # endet mit 1, wenn dist/ludwig.css nicht zu src/styles passt
```

Ob `pnpm check:css` in die feste Prüfliste („Bevor du abgibst“, `CLAUDE.md`
§4) gehört, entscheidet der Owner (Spec 0271, Offene Frage 3). Bis dahin gilt
die Regel hier.
