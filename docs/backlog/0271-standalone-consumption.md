# 0271 · Einbindung ohne Next und ohne Netz

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (M1: `dist/ludwig.css` gegen den Commit-Stand gebaut, `check:css` 0; Anleitung H3 ergänzt; App-Build mit `sideEffects` bei der nächsten Zeigerhebung) |
| Stufe | keine Komponente. Infrastruktur: `src/styles/`, `src/compat/`, `scripts/`, `package.json`, `.storybook/`, Doku |
| Klassen-Test | gilt nicht, denn es entsteht kein Baustein. Die Aufgabe macht die vorhandenen Bausteine für einen zweiten Verbraucher nutzbar |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Simon), Fragen 2, 3, 7 und 9: `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Rahmen „Alles wird mit der Erweiterung ausgeliefert. Kein Nachladen …“; Entscheidung Simon 2026-11-27: React 19 gebündelt, das Set als Git-Submodul auf festem Commit (Plugin-Paket D1) |
| Ersetzt | den Google-Fonts-`@import` in `src/styles/index.css` und die `preconnect`-Hinweise in `.storybook/preview-head.html` |
| Blockiert | Plugin-Paket D1 „Designsystem einbauen“; jede Story und jeder Baustein, den das Plugin übernimmt (0263–0270) |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Die Erweiterung Ludwig DUO-Connect soll aussehen und sich bedienen lassen wie
Ludwig: dieselbe Schrift, dieselben Knöpfe, dieselben Tastaturwege. Sie darf
dafür aber nichts aus dem Netz laden, weder zur Laufzeit (Store-Regeln,
Host-Berechtigungen) noch beim Bauen etwas, das nicht fest versioniert ist.
Heute geht das nicht:

- Das Set holt seine Schriften von Google.
- `Link` hängt an `next/link`.
- Das CSS braucht einen Tailwind-Lauf beim Verbraucher.
- Es steht nirgends, welche Dateien und Pakete ein Verbraucher ohne Next
  braucht.

Danach bündelt das Plugin die Bausteine mit esbuild aus dem Submodul. Es
liefert genau die Dateien aus, die es nutzt, und die App merkt davon nichts.

## Einordnung

- **Wiederverwenden:**
  - Die Schriftdateien liegen schon in der App: `apps/web/src/app/fonts/`,
    je latin-woff2 mit OFL-Text, seit F370 (2026-10-01, `9e766db14`). Die
    App lädt sie mit `next/font/local` und setzt `--font-sans-loaded`,
    `--font-serif-loaded` und `--font-mono-loaded` auf `<html>`.
    `tokens.css` fällt ohne diese Variablen auf die Namen `'Inter'`,
    `'Source Serif 4'` und `'JetBrains Mono'` zurück. Genau diese Namen
    bekommen die neuen `@font-face`-Regeln.
  - Die Tailwind-CLI ist schon Entwicklungsabhängigkeit (`tailwindcss`
    3.4.16, `node_modules/.bin/tailwindcss`). Sie löst `@import` selbst auf.
    Probelauf 2026-11-27 auf `src/styles/index.css`: 3 s, ohne Netz.
    Ausgabe 242 KB verkleinert, 436 KB unverkleinert. In der Ausgabe steht
    noch der Google-`@import`, den Teil 1 entfernt.
  - `next/link` importiert in der ganzen Bausteinmenge nur
    `primitives/Link.tsx`, und zwar mit `import NextLink, { type LinkProps }`
    (geprüft am Import-Abschluss von `src/ui/v3/index.ts`, 234 Dateien).
- **Neu, weil:** Das Set hatte bisher genau einen Verbraucher, die App mit
  Next und eigenem Tailwind-Lauf. Ein zweiter Verbraucher ohne beides braucht
  einen Weg, der in der App nichts ändert.
- **Zuschnitt:** vier Teile in einer Aufgabe. Sie sind einzeln klein, und
  erst zusammen ergeben sie den Probelauf, an dem die Abnahme hängt.
- **Setzt auf:** nichts Neues an Paketen. Keine neue Abhängigkeit im Set.

## Lieferumfang

Diese Sektion steht an Stelle der Prop-Tabelle. Was das Set danach für einen
Verbraucher ohne Next anbietet:

| Datei | Inhalt | Wer lädt sie |
|---|---|---|
| `src/styles/fonts/inter-latin.woff2`, `jetbrains-mono-latin.woff2`, `source-serif-4-latin.woff2` | byteidentische Kopien aus `apps/web/src/app/fonts/` (48 KB, 31 KB, 51 KB) | über die beiden CSS-Dateien darunter |
| `src/styles/fonts/OFL-inter.txt`, `OFL-jetbrainsmono.txt`, `OFL-sourceserif4.txt` | Lizenztexte, ebenfalls Kopien | Der Verbraucher liefert sie mit aus (SIL OFL 1.1 verlangt den Text bei der Weitergabe) |
| `src/styles/fonts.css` | `@font-face` für Inter (400–700) und JetBrains Mono (400–500), `font-display: swap`, `url("./fonts/…")` | Storybook; Plugin |
| `src/styles/fonts-serif.css` | `@font-face` für Source Serif 4 (400–600) | Storybook. Das Plugin nicht: Die Serife gilt nur dem lesenden Register und dem Wordmark (§2), und das Plugin spart so 51 KB |
| `src/compat/next-link.tsx` | Ersatz für `next/link`: Default-Export rendert `<a>` mit allen Attributen und `ref` und verwirft `prefetch`; `export type LinkProps = { prefetch?: boolean \| "auto" \| null }`, derselbe Typ wie in Next 16.3 | nur der Verbraucher, über einen Alias; das Set selbst importiert sie nie |
| `dist/ludwig.css` | die verkleinerte, fertige Stilkette von `src/styles/index.css`: Preflight, Tokens, alle Bausteinklassen. Kein `@tailwind`, kein `@import`, keine Schrift | Plugin; im Repo eingecheckt |
| `scripts/check-css.mjs` + `pnpm build:css` / `pnpm check:css` | `build:css` schreibt `dist/ludwig.css` mit der lokalen Tailwind-CLI. `check:css` baut in eine Temp-Datei und vergleicht Byte für Byte; endet mit 1 und dem Satz „`dist/ludwig.css` ist veraltet. Bitte `pnpm build:css` ausführen.“, wenn die Datei nicht stimmt | wer CSS oder Klassennamen ändert |
| `package.json` `"sideEffects": ["*.css"]` | erlaubt dem Bündler, ungenutzte Module des Sets wegzulassen | jeder Bündler, auch Next |
| `docs/einbindung-ohne-next.md` | Anleitung für Verbraucher ohne Next (Inhalt unten); verlinkt aus `README.md` | Plugin-Entwicklung |

Was sich an bestehenden Dateien ändert:

- `src/styles/index.css`: Der Google-`@import` und sein Kommentar entfallen.
  Die Schriften gehören nicht mehr zur Stilkette, weil jeder Verbraucher sie
  anders lädt (App: `next/font`, Plugin: Datei, Storybook: Datei). Der
  Kommentar sagt das in einem Satz.
- `.storybook/preview.ts`: importiert `fonts.css` und `fonts-serif.css` vor
  `index.css`.
- `.storybook/preview-head.html`: Die beiden `preconnect`-Zeilen und der
  Kommentar über Google entfallen. `lang="de"` bleibt.
- `scripts/check-type.mjs`: `fonts.css` und `fonts-serif.css` kommen in
  `SKIP`, mit Kommentar. Sie **definieren** Familien und Gewichtsbereiche
  (`font-family: "Inter"`, `font-weight: 400 700`), wie `tokens.css` die
  Skala definiert.
- `package.json` `exports`: unverändert. `"./styles/*"` deckt
  `@ludwig/designsystem/styles/fonts.css` schon ab.
- Die App: **keine** Änderung. Sie importiert weder `index.css` noch
  `fonts.css`, also lädt sie nichts doppelt. `Link.tsx` bleibt bei
  `next/link`, Prefetch und Client-Navigation bleiben.

Warum ein Ersatz-Modul und kein `Link` ohne Next: Ein `Link` ohne Next
bräuchte für die App einen eingespritzten Router (Context-Provider). Jeder
Verbraucher müsste ihn setzen, und die App liefe ein Risiko für Prefetch und
Client-Navigation (llcto 2026-10-27: „Sekunden pro Klick auf Staging“). Das
Ersatz-Modul ändert in der App nichts. Im Plugin ist ein Pfad-`href` ohnehin
ein Seitenwechsel innerhalb der Erweiterung. Ein `#`-Anker geht in `Link`
schon heute am Ersatz vorbei.

Warum `dist/` eingecheckt: Das Submodul soll ohne `pnpm install` im Set
nutzbar sein. Sonst bräuchte der Plugin-Build die Entwicklungsabhängigkeiten
des Sets, also Tailwind, PostCSS und Autoprefixer, und damit beim ersten Bau
das Netz. `check:css` verhindert, dass die Datei still veraltet (Offene Frage
1).

Was **nicht** geliefert wird (bewusst):
- Kein npm-Paket, keine Registry, kein Build-Schritt für die TSX-Quellen. Der
  Verbraucher bündelt die Quellen selbst, wie die App.
- Keine CSS-Datei je Baustein. Das CSS ist ein Block von etwa 242 KB. Den
  Grund nennt der Ausbau.
- Kein Einsatz in Content-Skripten auf fremden Seiten: Preflight und
  `html, body`-Regeln wirken global und würden DATEV-Seiten umgestalten. Das
  Plugin nutzt das Set nur auf Hauptseite und Popup (Plugin-Paket C0).

## Ablauf beim Verbraucher (Inhalt von `docs/einbindung-ohne-next.md`)

1. **Submodul** auf festem Commit, z. B. `vendor/designsystem`. Gebündelt
   wird aus den Quellen, kein Install im Submodul.
2. **Einstieg** ist das Barrel `src/ui/v3/index.ts`, dieselbe öffentliche
   Schnittstelle mit `@when`/`@instead` wie für die App (Offene Frage 2).
3. **Laufzeit-Abhängigkeiten** im eigenen Lockfile fest versioniert, in den
   Bereichen aus `package.json` des Sets:
   - `react` und `react-dom` 19 (dieselbe Hauptversion, Simon 2026-11-27)
   - `lucide-react` und `decimal.js`, von den Bausteinen gebraucht
   - `cmdk` und `zod`, nur damit der Bündler das Barrel auflösen kann; im
     Bündel landen sie nicht (siehe Probelauf)
   - `clsx`, `date-fns` und `tailwind-merge` stehen im `package.json` des
     Sets, das Barrel erreicht sie aber nicht und braucht sie nicht.
4. **esbuild** (Beispiel steht vollständig in der Anleitung):
   - `alias: { "next/link": "<submodul>/src/compat/next-link.tsx" }`
   - `jsx: "automatic"`
   - `loader: { ".woff2": "file" }`
   - `bundle: true`, `platform: "browser"`
   - **kein globales `tsconfig`**: esbuild findet für die Dateien des Sets
     dessen `tsconfig.json` und löst damit `@/…` selbst auf. Ein globales
     `--tsconfig` des Verbrauchers bricht diese Auflösung.
5. **CSS:** `dist/ludwig.css` und `src/styles/fonts.css` importieren. esbuild
   kopiert die beiden woff2 neben das Bündel. Den Serifen-Schnitt bindet nur
   ein, wer `fonts-serif.css` importiert. `src/styles/index.css` nie direkt:
   Es enthält `@tailwind`.
6. **Typprüfung (`tsc`):** Die `paths` des Verbrauchers gelten für alle
   Dateien, auch für die des Sets. Deshalb braucht seine `tsconfig.json`:
   - `"@/*": ["<submodul>/src/*"]`
   - `"@ludwig/designsystem": ["<submodul>/src/ui/v3/index.ts"]`
     (Spiegeldateien in `src/ludwig/` importieren Typen von dort)
   - `"next/link": ["<submodul>/src/compat/next-link.tsx"]`
   - dazu `jsx: "react-jsx"` und `@types/react` 19.
   Belegt der Verbraucher `@/` selbst, siehe Ausbau.
7. **Lizenz:** die OFL-Texte der ausgelieferten Schriften mit in die
   Erweiterung legen (z. B. `licenses/`). Die Lucide-Zeichen stehen unter ISC,
   ihr Text gehört ebenfalls dazu.
8. **Neuer Stand:** Submodul-Zeiger heben. Der DS-Commit nennt, was sich an
   Bausteinnamen oder Props geändert hat.

Probelauf am 2026-11-27 (Kopie des Sets im Scratchpad, esbuild 0.28.2, fünf
Bausteine aus dem Barrel: `Button`, `Tabs`, `Badge`, `Callout`, `Progress`):

| Fall | Bündel | darin |
|---|---|---|
| Barrel, heute (ohne `sideEffects`) | 436 KB | `zod` 60 KB, Set 129 KB, `decimal.js` 32 KB, `lucide-react` 16 KB |
| Barrel mit `"sideEffects": ["*.css"]` | 199 KB | `react-dom` 180 KB, `react` 8 KB, Set 5 KB, kein `zod`, kein `cmdk` |
| Direkte Dateipfade (Vergleich) | 199 KB | wie die Zeile darüber |

Ohne installiertes `cmdk` und `zod` bricht esbuild ab mit „Could not resolve
"cmdk"“ und „… "zod"“, auch mit `sideEffects`. Daher stehen beide unter
Punkt 3. Zu `"use client"` gab es keine Warnung.

## Verhalten

- **Storybook** sieht danach aus wie vorher. Die Schrift kommt aus
  `src/styles/fonts/`, nicht mehr von Google. Kein Request an
  `fonts.googleapis.com` oder `fonts.gstatic.com`.
- **App:** Kein Byte in ihrem Bündel ändert sich durch die Schriften oder
  durch das Ersatz-Modul. `sideEffects` darf ihr Bündel verkleinern, aber
  nicht ändern, was gerendert wird. Kein Modul in `src/ui/v3` oder
  `src/ludwig` hat eine Import-Nebenwirkung (geprüft 2026-11-27: kein
  `import "…";` ohne Bindung, keine Zuweisung an `window`, `document` oder
  `globalThis` auf Modulebene).
- **Plugin:** Das Bündel enthält nur, was die genutzten Bausteine brauchen.
  Die Seite lädt nur Dateien aus der Erweiterung.
- **Glyphen:** Die latin-Teilmenge enthält `„“`, `–`, `€` und das echte
  Minus `−` (U+2212, 0261). Ein Betrag „−1.234,56 €“ setzt sich ganz in
  Inter, ohne Rückfall auf eine Systemschrift.

## Stories

Keine neue Story. Den Nachweis tragen die vorhandenen
`v3/Grundlagen/Typografie` (`Roles`, `Headings`) und `v3/Grundlagen/Marke`.
Sie müssen mit lokalen Schriften genauso aussehen wie vorher. Gezeigt wird
das im Netzwerk-Log und im Bildvergleich (Abnahme).

## Ausbau

| Was fehlt | Was es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| CSS je Familie statt eines Blocks | mehrere Dateien unter `dist/` mit eigenem Einstieg je Familie | Das Plugin oder ein dritter Verbraucher braucht nachweislich weniger als ein Zehntel der Klassen, oder die Store-Prüfung beanstandet die Größe |
| Relative Importe statt `@/` im Set | Umstellung der `@/…`-Importe in `src/ui/v3` | Ein Verbraucher belegt `@/` selbst und kann `paths` nicht teilen |
| Ein npm-Paket mit Build-Schritt | `exports` auf gebaute Dateien | Ein dritter Verbraucher kommt dazu, oder das Submodul wird zur Last (66 MB `.git`) |
| Preflight nur unter einer Wurzelklasse statt global | eigene Stilkette mit Präfix | Ein Verbraucher bettet Bausteine in eine fremde Seite ein; heute ausgeschlossen |

## Offene Fragen

1. Wird `dist/ludwig.css` eingecheckt? **Ohne Antwort:** ja, mit
   `pnpm check:css` als Wächter. Die Alternative, das Plugin baut das CSS
   selbst, braucht Tailwind im Plugin-Build und eine zweite Stelle, die
   wissen muss, wie die Stilkette aussieht.
2. Barrel oder Dateipfade als Einstieg? **Ohne Antwort:** Barrel mit
   `"sideEffects": ["*.css"]`. Es ist die öffentliche Schnittstelle, und
   Dateipfade sind Innenleben, das sich mit jedem Umzug ändert. Der Preis ist
   der Punkt aus dem Probelauf: `cmdk` und `zod` müssen im Plugin installiert
   sein, landen aber nicht im Bündel.
3. Gehört `pnpm check:css` in die feste Liste „Bevor du abgibst“
   (`CLAUDE.md` §4 Punkt 6, Skill `v3-komponente`)? **Ohne Antwort:** ja,
   sonst veraltet `dist/ludwig.css` mit der ersten CSS-Änderung einer anderen
   Sitzung. Das ist eine Änderung an der Prüfliste und braucht das Okay des
   Owners. Bis dahin steht die Zeile nur in `docs/einbindung-ohne-next.md`
   und im Skill.

## Abnahmekriterien

Fest (gilt immer; was ohne neue Komponente nicht greift, steht mit Grund da):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe — gilt nicht: keine Komponente, keine Story (siehe Stories)
- [ ] Code englisch; `@when`/`@instead` an jedem Export — Ersatz-Modul, Skript und Kommentare englisch, Deutsch nur in der Meldung von `check:css` und in der Doku; `next-link.tsx` liegt außerhalb von `src/ui/v3` und ist kein Baustein, daher ohne `@when`
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry — gilt für `fonts*.css` sinngemäß: keine Farbe, keine Größe, nur `@font-face`
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet — keine neue Story, Begründung unter Stories
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen — gilt nicht (keine Komponente); dafür `pnpm check:type`, `check:language` und `check:when` grün ohne neue Altfunde
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Die drei woff2 und drei OFL-Texte in `src/styles/fonts/` sind byteidentisch mit `apps/web/src/app/fonts/` (`cmp`, alle sechs Exit 0)
- [ ] `fonts.css` und `fonts-serif.css` tragen Familiennamen, Gewichtsbereiche und `font-display` wie die `localFont`-Aufrufe der App (`apps/web/src/app/layout.tsx`)
- [ ] `grep -rn "googleapis\|gstatic" src .storybook dist` findet nichts
- [ ] Storybook: Netzwerk-Log beim Laden von `v3/Grundlagen/Typografie` zeigt die woff2 von `localhost`, keinen Request nach außen; `document.fonts.check('13.5px Inter')`, `…'13.5px "JetBrains Mono"'` und `…'16px "Source Serif 4"'` sind `true`; Bildvergleich `Roles` vor/nach ≤ 0,5 % (`scripts/png-diff.mjs`)
- [ ] `pnpm build:css` schreibt `dist/ludwig.css` ohne Netz; die Datei enthält kein `@tailwind`, kein `@import` und kein `@font-face`; `pnpm check:css` endet mit 0, nach einer geänderten Klasse in `v3.css` ohne Neubau mit 1 und dem Satz aus der Tabelle
- [ ] `src/compat/next-link.tsx` exportiert den Default-Link und `LinkProps`; `prefetch` landet nicht im DOM; `ref` kommt am `<a>` an; das Set importiert die Datei nirgends (`grep`)
- [ ] `package.json` trägt `"sideEffects": ["*.css"]`; die App baut damit unverändert (Hinweis an die App-Seite bei der nächsten Zeigerhebung, Kriterium offen (App))
- [ ] **Probelauf aus einem leeren Ordner außerhalb des Repos ohne Netz:**
  - Das Set wird per `git clone` aus dem lokalen Pfad auf den Commit geholt.
  - `node_modules` kommt nur mit `react`, `react-dom`, `lucide-react`, `decimal.js`, `cmdk`, `zod` und `esbuild` aus einem lokalen Spiegel.
  - Eine Einstiegsdatei rendert `Button`, `Tabs`, `Badge`, `Callout`, `Progress` und `Link` (Pfad-`href`) aus dem Barrel, mit `dist/ludwig.css` und `fonts.css`, gebündelt nach dem Beispiel der Anleitung.
  - Ergebnis: Exit 0.
  - Die Ausgabe enthält genau zwei woff2 (Inter, JetBrains Mono).
  - Das Metafile zeigt kein `zod`, `cmdk` und `next`.
  - Die Seite, per `file://` geöffnet, lädt nur lokale Dateien (Netzwerk-Log) und setzt Inter.
  - `Link` rendert ein `<a href>` ohne `prefetch`-Attribut.
  - Screenshot neben derselben Story in Storybook.
- [ ] `tsc --noEmit` im Probe-Ordner mit der `tsconfig.json` aus der Anleitung (Punkt 6) endet mit 0
- [ ] `docs/einbindung-ohne-next.md` enthält Punkte 1–8 und das esbuild-Beispiel, das im Probelauf lief, Zeichen für Zeichen; `README.md` verlinkt sie
- [ ] Die App ist unverändert (`git -C ../app status` zeigt nichts aus dieser Aufgabe)

## Nachtrag 2026-11-27 — aus der Abnahme (S1–S4)

- **S3:** `date-fns` braucht der Verbraucher für `tsc` (`src/ludwig/shared/index.ts` reicht `dates.ts` weiter), nicht für das Bündel — die Anleitung sagt es richtig; der Satz im Ablauf, es werde nicht gebraucht, gilt nur fürs Bündel.
- **S1:** „Schrift geladen“ wird über `document.fonts` mit `status === "loaded"` des Faces bzw. das Netzwerk-Log belegt, nicht über `document.fonts.check()` (liefert auch für ein ungeladenes Face `true`).
- **S2:** „kein zod/cmdk im Bündel“ meint die `outputs` des Metafiles; in den `inputs` stehen beide, weil esbuild sie auflösen muss.
- **S4:** Der Barrel-Export `Link` ist neu (öffentliche Schnittstelle) und steht in der Commit-Nachricht.
- **M1:** `dist/ludwig.css` wird unmittelbar vor dem Commit gegen genau den Commit-Stand gebaut; `pnpm check:css` endet auf diesem Stand mit 0.

## Abnahme

Schlanke Abnahme (Schnittstelle) plus Probelauf. Der Prüfer hat nicht gebaut. Grundlage: Spec, Arbeitsbaum am
2026-11-27 ab 20:20 (DS `HEAD` `a29883b` + uncommittete 0271-Dateien; im selben Baum arbeitet 0263),
App `staging` `4e5fc3657`. Probe, Spiegel und Bilder liegen unter
`/private/tmp/claude-501/-Users-simonfakir-dev-ludwig-designsystem/4d48fa12-621c-46ef-bacc-7e19c29ac4dd/scratchpad/abn0271/`
(unten `abn0271/`).

| Kriterium | Nachweis (Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0, im Arbeitsbaum und im Baum „`HEAD` + nur die 0271-Dateien“ (`abn0271/only0271`). `pnpm build --output-dir abn0271/sb-static` Exit 0. Der Build ging in den Scratchpad statt nach `storybook-static/`, damit er anderen Sitzungen nichts leert | ✓ |
| Datei nach Familie, Story daneben, Titel | gilt nicht: keine Komponente, keine Story | – |
| Code englisch; `@when`/`@instead` | Gelesen: `src/compat/next-link.tsx`, `scripts/check-css.mjs`, `fonts.css`, `fonts-serif.css` und die neuen Kommentare in `index.css`, `.storybook/preview.ts` und `scripts/check-type.mjs` sind englisch. Deutsch steht nur in der Meldung von `check:css` und in der Doku. `next-link.tsx` hat begründet kein `@when`. Der neue Barrel-Export `Link` trägt `@when`/`@instead` | ✓ |
| Kein Hex, kein px, keine Label-Map | `fonts.css` und `fonts-serif.css` enthalten nur `@font-face`: Familie, `src`, Gewicht, Stil, `font-display`. Keine Farbe, keine Größe | ✓ |
| Stories vorhanden, Ausschlüsse begründet | keine neue Story, Begründung unter „Stories“ | ✓ |
| `check:type`, `check:language`, `check:when` ohne neue Altfunde | Im Arbeitsbaum: `check:type` 0, `check:when` 0, `check:language` 1. Die einzige Meldung ist `v3.css:832` (Kommentar „Rahmen einer Browser-Erweiterung (0263)“) und gehört nicht zu 0271. In `abn0271/only0271` enden alle drei mit 0. Nebenbei `check:classes`: Exit 1 mit 4 Funden (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`). Dieselben 4 meldet `HEAD`, sie sind Altbestand und nicht aus 0271 | ✓ |
| Im Browser angesehen | Storybook :6107: `v3/Grundlagen/Typografie` (Roles, Headings, Registers) und `v3/Grundlagen/Marke` (Marks). Keine Konsolenfehler | ✓ |
| woff2 und OFL byteidentisch mit `apps/web/src/app/fonts/` | `cmp`: alle sechs Exit 0. SHA-256 paarweise gleich | ✓ |
| `fonts*.css` wie `localFont` der App | `layout.tsx` Z. 7–31: Inter `400 700`, Source Serif 4 `400 600`, JetBrains Mono `400 500`, jeweils `normal` und `swap`. `fonts.css` und `fonts-serif.css` tragen genau diese Werte. Die Familiennamen sind die Rückfallnamen aus `tokens.css` | ✓ |
| `grep -rn "googleapis\|gstatic" src .storybook dist` leer | Exit 1, kein Treffer | ✓ |
| Storybook: Netzwerk-Log, `fonts.check`, Bildvergleich `Roles` ≤ 0,5 % | **Netz:** Manager-Seite plus iframe `…typografie--roles`: 118 Requests, keiner nach außen. Die woff2 kommen nur von `localhost:6107/src/styles/fonts/` (Inter, JetBrains Mono). Bei Headings und Marke ebenso, kein `preconnect`. Source Serif 4 lädt erst, wenn Text sie nutzt. Ein eingefügtes Element mit `var(--font-serif)` holt `source-serif-4-latin.woff2` von localhost, Status `loaded 400 600`. **`fonts.check`:** alle drei `true` (siehe Spec-Mangel S1). **Bild:** Vorher ist ein statischer Build von `HEAD` (Google-Fonts), nachher einer des Arbeitsbaums, beide bei 1280 px nach `document.fonts.ready`. `scripts/png-diff.mjs`: Roles 0,000 %, Headings 0,000 %, Registers 0,000 %, Marke 0,000 %. Alle Textknoten haben dieselbe Breite, Höhe, Lage und Zeilenzahl, ohne jede Abweichung. **Grund:** Google liefert für Inter und JetBrains Mono (latin) dieselbe Datei wie `src/styles/fonts/` (SHA-256 gleich, `inter/v20`, `jetbrainsmono/v24`). Nur Source Serif 4 weicht ab: Google `v15` hat 50.952 B, die Kopie der App 50.924 B. Die vom Bauer gemeldeten 0,88 % und 2,28 % lassen sich deshalb nicht mit einer anderen Binärdatei erklären. Bei Marke stammt die Abweichung zwischen Dev-Server und statischem Build (1,45 %) von den Logo-SVGs, die im statischen Build fehlen, nicht von der Schrift. Das Kriterium gilt wie geschrieben und muss nicht neu gefasst werden | ✓ |
| `build:css` ohne Netz; kein `@tailwind`/`@import`/`@font-face`; `check:css` 0, nach Klassenänderung 1 mit Satz | `pnpm build:css` lief in einem Klon unter `sandbox-exec` mit gesperrtem Netz: Exit 0, 3,3 s, Ausgabe byte-gleich mit `dist/ludwig.css`. `@tailwind`, `@import` und `@font-face` kommen je 0-mal vor, `url(` gar nicht. `check:css` Exit 0. Nach `.v2tabs` `gap: 4px → 6px` in `v3.css`: Exit 1 mit „`dist/ludwig.css` ist veraltet. Bitte `pnpm build:css` ausführen.“ Ebenso nach einer neuen Klasse und bei fehlender Datei. **Aber:** Um 20:27 hat die 0263-Sitzung `v3.css` geändert, seitdem endet `pnpm check:css` im Arbeitsbaum mit 1. Auch `abn0271/only0271` endet mit 1, weil `dist/ludwig.css` Klassen von 0263/0268 enthält (`.v3ext…`). Der Wächter wirkt, aber die Datei passt weder zum heutigen Arbeitsbaum noch zu einem Commit, der nur 0271 enthält | ✗ M1 |
| `next-link.tsx`: Default + `LinkProps`; kein `prefetch` im DOM; `ref` am `<a>`; Set importiert sie nie | Beide Exporte vorhanden. Der `prefetch`-Typ gleicht Next 16.3.4 (`next/dist/client/link.d.ts` Z. 59). In der Probe hat `<Link href="/belege" ref={…} prefetch="auto">` gerendert `<a href="/belege" id="probe-link-ref">`, ohne `prefetch`. `ref.current` ist `A#probe-link-ref`. `grep -rn compat src` außerhalb von `src/compat/` findet nichts | ✓ |
| `"sideEffects": ["*.css"]`; App baut unverändert | `package.json` trägt den Eintrag, `exports` ist unverändert. Ob die App damit baut, ist laut Spec offen (App) | ✓ · offen (App) |
| **Probelauf** leerer Ordner, ohne Netz | Der Ordner `abn0271/probe` war leer. Jeder Schritt lief unter `sandbox-exec '(deny network-outbound (remote ip))'`. Gegenprobe: `curl registry.npmjs.org` endet darin mit 7, außerhalb mit 200. **Set:** Einen DS-Commit gibt es noch nicht. Deshalb wurde der Arbeitsbaum in einem Klon `abn0271/ds-origin` als Commit `4456299` festgehalten (nur dort). Darauf folgten `git submodule add` aus dem lokalen Pfad und `checkout`. **node_modules:** Der Spiegel `abn0271/mirror` sind Tarballs aus dem installierten `node_modules` des Sets. `npm install --offline` holte die 7 Pakete, mit Abhängigkeiten 34. **Bau:** `node build.mjs` (das Beispiel der Anleitung, wörtlich) Exit 0. In `out/` liegen `main.js` (200.794 B), `main.css` (243.274 B) und genau zwei woff2 (Inter, JetBrains Mono). **Metafile, `outputs`:** kein `zod`, `cmdk` oder `next`. Das Bündel besteht aus react-dom 180,1 kB, react 8,1 kB, Set 5,4 kB und scheduler 3,7 kB. Gegenprobe ohne `sideEffects`: 438.269 B, darin zod 59,7 kB, Set 130,6 kB, decimal.js 32,3 kB und lucide 16,0 kB. Das bestätigt die Tabelle der Spec. **`file://`:** 5 Requests (HTML, CSS, JS, 2 woff2), alle `file://`, keine Konsolenmeldung. Inter hat Status `loaded`. Nach `CSS.getPlatformFontsForNode` setzen Callout, Button, Link und „−„“–€“ nur Inter (web), Mono nur JetBrains Mono (web). **Link:** `<a href="/sync" id="probe-link">` ohne `prefetch`. **Bild:** `abn0271/probe-vs-storybook.png` zeigt links die Probe, rechts die Stories Tabs, Button, Badge und Callout. Primärbutton, aktiver Reiter, Badge und Callout haben in Probe und Story dieselben berechneten Stile (Höhe, Schrift, Farben, Innenabstand, Radius) | ✓ (H2) |
| `tsc --noEmit` mit der `tsconfig.json` der Anleitung | Dazu kamen aus dem Spiegel typescript 5.9.3, @types/react 19.2.18 und @types/react-dom 19.2.5. Ohne `date-fns` meldet tsc 2× TS2307 in `src/ludwig/shared/dates.ts`, wie Punkt 3 der Anleitung sagt. Mit `date-fns` 4.4.0: Exit 0, 314 Dateien des Sets geprüft. Der Bau gelingt auch mit dieser `tsconfig.json` im Probe-Ordner | ✓ |
| Anleitung: Punkte 1–8, esbuild-Beispiel zeichengleich; README verlinkt | Punkte 1–8 und „Für das Set selbst“ sind vorhanden. `build.mjs`, `tsconfig.json` und `index.html` der Anleitung gleichen der Probe des Bauers (`diff` leer) und liefen in dieser Probe wörtlich. `README.md` verlinkt die Anleitung. Mit der Anleitung allein kam die Probe durch. Es fehlt nur, siehe H3: `typescript` als Paket, ein Mount-Beispiel (`createRoot`) und `protocol.file.allow` für ein Submodul aus lokalem Pfad | ✓ |
| App unverändert | `git -C ../app status` zeigt keinen Pfad aus 0271. `packages/designsystem` zeigt auf `e4c0181`, ältere DS-Arbeit und nicht 0271. Die Schriftdateien der App stammen vom 1. Okt. und sind unverändert | ✓ |
| Spec-Mangel S1: `document.fonts.check()` als Ladebeweis | `check('16px "Source Serif 4"')` ist `true`, obwohl das Face in Storybook `unloaded` ist. In der Probe ist es ebenfalls `true`, wo gar kein Serif-Face existiert. Einen Beweis liefern nur der Status in `[...document.fonts]` und das Netzwerk-Log, beide stehen oben | H |
| Spec-Mangel S2: „Metafile zeigt kein zod, cmdk“ | Gemeint sind die `outputs`. In den `inputs` stehen zod (10 Dateien) und cmdk (2) zwangsläufig, denn esbuild löst sie auf und wirft sie dann weg | H |
| Spec-Mangel S3: Ablauf Punkt 3 „date-fns … braucht sie nicht“ | Das gilt nur fürs Bündel, `tsc` braucht es. Die Anleitung ist richtig, die Spec nicht | H |
| Spec-Mangel S4: Lieferumfang ohne Barrel-Export `Link` | `src/ui/v3/index.ts` Z. 71 `export { Link }` ist neu und erweitert die öffentliche Schnittstelle. Das Kriterium braucht den Export, aber er steht nicht in „Was sich an bestehenden Dateien ändert“. Er gehört in die Commit-Nachricht | H |

Abgenommen von / am: fremder Prüfer, 2026-11-27 · **Ergebnis: Mängel** · Offene Punkte:

- **M1** `dist/ludwig.css` stimmt nicht mit dem Stand, der committet wird. Die Datei ist aus dem
  geteilten Arbeitsbaum gebaut und enthält 0263/0268-CSS. Seit der 0263-Änderung um 20:27 endet
  `check:css` mit 1. Vor dem Commit muss die Datei genau gegen den Commit-Stand gebaut werden
  (`git stash -k` oder gemeinsam mit 0263/0268), und `pnpm check:css` muss auf diesem Stand mit 0
  enden. Den Hash nennen.
- **H2** Der Probelauf lief gegen einen synthetischen Commit (Arbeitsbaum in einer Kopie), nicht
  gegen einen DS-Commit. Nach M1 kostet eine Wiederholung gegen den echten Hash eine Minute
  (`abn0271/probe`, Submodul-Zeiger heben, `node build.mjs`).
- **H3** Anleitung: In Punkt 6 `typescript` als Paket nennen. In Punkt 5 ein Mount-Beispiel für
  `src/main.tsx` mit `createRoot` geben.
- **H4** Außerhalb von 0271: Im statischen Storybook-Build zeigen die Logo-SVGs in `Marke` ein
  defektes Bild, vorher wie nachher. Im Dev-Server sind sie da.
- S1–S4 sind Spec-Mängel (Messvorschrift und Text). Die Kriterien bleiben unverändert und können
  per datiertem Nachtrag geschärft werden.

## Befund an die App

- Die drei Schriftdateien liegen danach zweimal, in `apps/web/src/app/fonts/` und in `src/styles/fonts/` des Sets. Vorschlag: `localFont` in `apps/web/src/app/layout.tsx` zeigt auf die Dateien im Submodul (`packages/designsystem/src/styles/fonts/…`), und die eigene Kopie entfällt. Bis dahin hält das Abnahmekriterium „byteidentisch“ die beiden Kopien gleich.
