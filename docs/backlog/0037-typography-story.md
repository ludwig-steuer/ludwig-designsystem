# 0037 · Typografie-Story — was es an Schrift schon gibt

| | |
|---|---|
| Status | Abnahme |
| Stufe | keine Komponente — eine Story zu `src/styles/tokens.css`, neue Storybook-Gruppe `v3/Grundlagen` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Schriftstufen sind fachfrei |
| Quelle | `docs/backlog/0034-shadcn-abgleich.md` §A4 (shadcn-Abgleich, Registry-Eintrag `typography`) |
| Ersetzt | nichts — die Klassen stehen, nur ohne Nachweis |
| Blockiert | jede Seitenmigration, die „welche Stufe nehme ich?" beantworten muss; später Farbe und Raum in derselben Gruppe (§11.7 Stufe 0) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Abgleich mit shadcn (0034) fand für „Typography" alles vor: `h1`–`h4` mit
`.lw-h1`–`.lw-h4`, `.lw-body`, `.lw-body-sm`, `.lw-caption`, `.lw-overline`,
`.lw-mono`, dazu `ProseCard` und `Markdown`. Was fehlt, ist der Nachweis:
Storybook ist die Antwort auf „wovon gibt es v3?", und **was keine Story hat,
gilt nicht als vorhanden**. Wer heute eine Seite baut, sieht die Stufen
nirgends nebeneinander und greift zur nächstbesten — oder schreibt eine
Größe in TSX (V13).

## Einordnung

- **Wiederverwenden:** die Klassen selbst; kein Code wird angefasst, kein CSS
  ergänzt. §3 Regel 1 in Reinform — ein `@when` (hier: die Klasse) deckt den
  Fall, die Aufgabe ist damit keine Komponenten-Spec, sondern der fehlende
  Nachweis.
- **Neu, weil:** nichts wird neu. Neu ist allein die Storybook-Gruppe
  `v3/Grundlagen`, die später Farbe und Raum aufnimmt.
- **Zuschnitt:** eine Datei `src/ui/v3/Typography.stories.tsx` — auf der
  Ebene des Barrels, weil sie zu keiner Stufe gehört.
- **Setzt auf:** `tokens.css`. Für den Einsatz-Fall zusätzlich `ProseCard`.

## Schnittstelle

Keine — die Aufgabe liefert keine Komponente und damit keine Props. Der
Abschnitt entfällt aus diesem Grund.

## Verhalten

Keins: reine Anzeige. Die Story ist eine Server-Component ohne Zustand.

Inhalt, festgelegt:

- **Die Stufen einmal je Klasse mit echtem Text**, nicht mit „Lorem": eine
  Überschrift eines Sachverhalts, ein Absatz aus einem Bericht, eine
  Kontonummer in `.lw-mono`, eine Overline „Zusatzweg" — die Daten sehen aus
  wie Ludwig-Daten (§6).
- **Die zwei Register** (A1) nebeneinander: produktiv 13,5–14 px, lesend
  16 px, jeweils mit dem Ort, an dem sie gelten (`/clients/**` gegen
  `/hilfe/**`).
- Kein neues CSS, kein neues Token, keine Größe in TSX außer den beiden
  Register-Beispielen, die genau das zeigen sollen.

## Stories

Titel `v3/Grundlagen/Typografie`. Abgeleitet nach §6: eine Anzeige ohne Props
hat keine Zustände und keine Enums; es bleiben 1 Übersicht + 1 „im Einsatz"
+ 1 Rand = 3, dazu die Leiter des produktiven Registers = 4.

| Story | Beweist |
|---|---|
| `Scale` | jede Klasse einmal, mit Name, Klasse und echtem Text |
| `Interface` | die Leiter des produktiven Registers (`--fs-ui-*`) mit ihren Einsatzorten |
| `Registers` | produktiv gegen lesend am selben Absatz (A1) |
| `InUse` | ein Ausschnitt einer Seite: Overline, `h3`, Absatz, `.lw-caption`, Mono-Kontonummer in einer `ProseCard` |

Nicht anwendbar: `Empty`, `EmptyAfterFilter`, `Loading`, `Error` — eine
Schriftprobe hat keine Daten und lädt nicht.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export *(entfällt: kein Export — die Datei enthält nur Stories)*
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `h1`, `h2`, `h3`, `h4`, `.lw-body`, `.lw-body-sm`, `.lw-caption`,
      `.lw-overline`, `.lw-mono` sind je einmal sichtbar (Story `Scale`)
- [ ] `grep -c "lw-" src/ui/v3/Typography.stories.tsx` ≥ 8
- [ ] Kein neues CSS: `git diff --stat src/styles/` zeigt für dieses Paket
      keine Änderung an `tokens.css`
- [ ] Beide Register stehen mit ihrem Geltungsbereich da (Story `Registers`)
- [ ] Die Story steht unter `v3/Grundlagen/…`, nicht unter `Primitives`

## Befund beim Bauen (2026-09-03) — und seine Behebung

**`h1`–`h4` als Element-Selektor waren wirkungslos.** `src/styles/index.css`
lädt `@tailwind base` **nach** `tokens.css`; Preflight setzt
`h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }` und
schlug bei gleicher Spezifität die Regel `h1, .lw-h1 { … }`. Gemessen in
`v3-grundlagen-typografie--scale`: `h1` rendert 14 px statt 40 px, `h2`–`h4`
je 16 px statt 30/22/18 px.

**`p` traf fremdes Markup.** Owner-Befund am Markdown-Reader: der Absatz stand
auf 16 px (lesendes Register), die Aufzählung daneben auf 13,5 px — denn `li`
erbt die Größe des Containers, `p` hatte eine eigene Regel. Derselbe
Element-Selektor, dasselbe Muster.

**Behoben (2026-09-03):** `tokens.css` führt in den semantischen Typ-Regeln
**nur noch Klassen** (`.lw-h1`–`.lw-h4`, `.lw-body`). Wer eine Stufe will,
schreibt sie an; ohne Klasse erbt ein Element die Größe seiner Fläche — genau
das, was eine Komponente braucht. Dazu kommt die **Leiter des produktiven
Registers** (`--fs-ui-xl` … `--fs-ui-2xs`, mit Zeilenhöhen), aus der jede
v3-Komponente ihre Größe nimmt, statt sie in `v3.css` einzeln zu setzen; die
Story `Interface` zeigt sie. Nachgezogen sind bisher `Markdown` und `Button` —
der Rest von `v3.css` folgt, sobald eine Komponente ohnehin angefasst wird.

## Offene Fragen

1. Gehört `.lw-display` und `.lw-lede` (serif, editorial) mit in die Probe?
   *Ohne Antwort: ja, aber sichtbar als „lesendes Register" markiert — sie
   existieren in `tokens.css` und würden sonst weiter unbelegt bleiben.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
