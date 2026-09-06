# 0111 · Die globale Schicht: Preflight überschreibt die Tokens, und die Bewegung fragt nicht

| | |
|---|---|
| Status | offen |
| Stufe | `src/styles/` — keine Komponente, die Schicht unter allen |
| Quelle | Abnahme 0098 (2026-09-06), Mängel M7 und M9; die Wurzel von M7 stand schon in der ersten Runde von 0097 als Hinweis H1 |
| Auftrag | Zwei Befunde derselben Schicht: die Reihenfolge der CSS-Kette und die fehlende Rücksicht auf `prefers-reduced-motion` |
| Spec von / am | Claude, 2026-09-06 |

## Befund 1 — Preflight lädt nach den Tokens, und damit sah **jeder** Link aus wie Text

`src/styles/index.css` importiert erst `tokens.css` … `v3.css` und **danach**
`@tailwind base`. Preflight setzt dort `a { color: inherit; text-decoration:
inherit }`. Bei gleicher Spezifität gewinnt die spätere Regel — die
Link-Farbe aus `tokens.css` kam nie an.

Gemessen (2026-09-06, `CaseFacts --filled`, headless 1440): beide Links
`rgb(45, 45, 45)`, identisch mit der Wertfarbe daneben; unterscheidbar erst
beim Zeigen, weil `a:hover` eine eigene Regel ist. Das trifft **jeden**
Konsumenten von v3, nicht eine Komponente.

**Sofortmaßnahme (erledigt, Commit dieser Aufgabe):** die `a`-Regel steht am
Ende von `index.css` noch einmal, nach den Direktiven. Der Messwert danach:
`rgb(46, 120, 168)` = `--color-accent-700`.

**Was offen bleibt:** die Reihenfolge selbst. Preflight gehört nach oben, vor
die eigenen Stylesheets — das ist die Ordnung, die Tailwind vorsieht. Sie zu
drehen ändert aber in einem Zug auch Überschriften (`font-size: inherit`),
Listen (`list-style: none`) und Knöpfe (`background: transparent`), und das
ist ein Durchgang durch das ganze Storybook, kein Einzeiler. Deshalb eine
eigene Aufgabe.

Die App hat dieselbe Kette (`index.css` sagt es im Kopf: „Dieselbe Kette wie
das App-Layout") — der Befund gilt drüben genauso und geht als Zeile ins
Register.

## Befund 2 — ~~Die Einfahrt des Drawers fragt nicht nach `prefers-reduced-motion`~~ **erledigt 2026-09-06 mit 0093 (b)**

`.v2drawer { transition: transform var(--duration-slow) … }` (`v3.css`) läuft
ohne Schutz. Im ganzen Blatt gibt es drei `@media (prefers-reduced-motion)`-Blöcke
(`.v2skel`, `.v2spin`, `.v2toast`) — die Bewegungen, die von selbst laufen.
Die Bewegungen, die auf eine Handlung folgen (Drawer, Dialog, Popover,
Aufklapper), haben keinen.

Wer die Einstellung gesetzt hat, hat einen Grund. Eine Fläche, die von rechts
einfährt, ist genau der Fall, den die Einstellung meint.

## Zuschnitt

Eine Aufgabe, weil beides dieselbe Datei-Ebene betrifft und in einem
Durchgang geprüft wird: ein Blick durch das Storybook nach der Änderung.

## Abnahmekriterien

- [ ] `@tailwind base` steht **vor** den eigenen Stylesheets; die doppelte
      `a`-Regel am Ende von `index.css` ist dann überflüssig und entfällt
- [ ] Ein Durchgang durch das Storybook nach der Umstellung: Überschriften,
      Listen und Knöpfe sehen aus wie vorher (Stichprobe mit Screenshots über
      mindestens zehn Stories aus allen drei Stufen, vorher/nachher)
- [ ] Ein Link ohne eigene Klasse trägt `--color-accent-700` (gemessen)
- [x] `@media (prefers-reduced-motion: reduce)` schaltet die Einfahrt von
      Drawer, Dialog und Popover ab — **erledigt mit 0093 (b)**, gemessen
      `transition-duration: 0s` an `.v2drawer` und `.v2drawer__scrim`
- [ ] `pnpm typecheck` und `pnpm build` grün

## Befunde für `ludwig/app`

- **B1 (L-78)** — Die App lädt Preflight in derselben Reihenfolge; dort sehen
  die Links genauso aus. Nach der Umstellung hier lohnt derselbe Griff drüben.
  Im Register eingetragen am 2026-09-06.

## Erledigt 2026-09-07 — Preflight steht jetzt vorn

`@tailwind base` lud zuletzt und gewann damit gegen die eigenen Blätter: `a`
verlor seine Farbe, `img` sein Maß. Jetzt steht die Grundschicht **vor**
`tokens.css`, und der Notbehelf aus 0098 (die `a`-Regel am Dateiende) ist
weg.

**Als `@import "tailwindcss/base"`, nicht als `@tailwind base`.** Der erste
Anlauf setzte die Direktive an den Anfang — und machte damit **alle folgenden
`@import`s ungültig**: eine `@import`-Regel muss vor jeder anderen Regel
stehen, sonst verwirft der Browser sie. Gemessen fielen sämtliche eigenen
Blätter aus; 21 von 64 Stichproben-Stories standen in Systemschrift und
schwarzem Text, eine schrumpfte von 1731 auf 1080 px. Der Fehler war in einer
Minute sichtbar, weil vorher gemessen worden war — ohne die Vorher-Messung
wäre er als „sieht doch aus wie immer" durchgegangen.

**Gemessen nach der Korrektur, 64 Stories, acht Merkmale je Story**
(Überschriften, Listen, Knöpfe, Links, Absätze, Felder, Tabellen, Wurzelmaß):
**14 Abweichungen, alle in einem einzigen Merkmal** — der Höhe der
Story-Wurzel, zwischen **+1 und +29 px**. Keine Farbe, keine Schrift, kein
Knopf, kein Feld, keine Tabelle hat sich geändert. Der Zuwachs kommt daher,
dass Überschriften und Listen ihre eigenen Abstände zurückbekommen, die
Preflight vorher abgeräumt hat.

**Was die Umstellung nicht behebt:** `img { height: auto }` schlägt weiterhin
jedes `height`-Attribut — eine Autorenregel gewinnt gegen ein
Präsentations-Attribut, unabhängig von der Reihenfolge. Wer eine Bildhöhe
setzen will, setzt sie als Stil. In `Brand.stories.tsx` ist das nachgezogen
(0056).

Damit ist 0111 abgeschlossen: Befund 1 hier, Befund 2 mit 0093 (b).
