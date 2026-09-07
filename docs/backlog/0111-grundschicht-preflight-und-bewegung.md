# 0111 · Die globale Schicht: Preflight überschreibt die Tokens, und die Bewegung fragt nicht

| | |
|---|---|
| Status | fertig |
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

## Prüfung 2026-09-07 — fremd, Claude (nicht gebaut, kein Chatverlauf gelesen)

Gemessen mit Chromium headless über CDP gegen den Dev-Server
(`localhost:6107`, also die Quelle), 1440×900. Nichts unten ist aus dem Text
übernommen.

### Befund 1 — Preflight steht vorn, und die Tokens gewinnen

**Reihenfolge, wie der Browser sie geladen hat** (nicht aus `index.css`
gelesen): alle `document.styleSheets` flach durchgezählt, 1736 Regeln.

| Regel | Position |
|---|---|
| Preflight `a { color: inherit; text-decoration: inherit }` | **76** |
| Preflight `blockquote,dl,dd,h1…h6 { margin: 0 }` | 93 |
| Preflight `img, video { max-width: 100%; height: auto }` | 103 |
| eigen: `a { color: var(--color-accent-700); text-decoration-thickness: 1px; … }` | **120** |
| eigen: `a:hover { color: var(--color-primary) }` | 121 |

Preflight liegt also vor den eigenen Blättern und verliert bei gleicher
Spezifität — genau die Ordnung, die das Abnahmekriterium verlangt. Der
Notbehelf aus 0098 (die `a`-Regel am Dateiende) ist weg; `index.css` endet mit
`@tailwind components; @tailwind utilities;`.

**Gerendert:** ein frisch eingehängtes `<a href>` **ohne eigene Klasse** misst
`rgb(43, 111, 156)` = `#2B6F9C` = `--color-accent-700` — in **60 von 60**
zufällig gezogenen Stories, kein Ausreißer.

**Gegenprobe auf den Fehler des ersten Anlaufs** (die eigenen Blätter fielen
aus, Stories standen in Systemschrift): über dieselben 60 Stories 60×
`font-family: Inter`, 60× `color: rgb(45, 45, 45)`, 60× `box-sizing:
border-box`, 60× `--color-accent-700 = #2B6F9C`. Keine Story steht in
Systemschrift, keine hat ihre Tokens verloren.

**Der Nachsatz zu `img` stimmt:** ein `<img width="40" height="40">` mit einer
100×20-Quelle misst gerendert **8 px** hoch — `height: auto` schlägt das
Attribut, unabhängig von der Reihenfolge.

### Befund 2 — die Bewegung fragt

Im Blatt: vier `@media (prefers-reduced-motion: reduce)`-Blöcke (`v3.css`
Z. 1076, 1752, 1898, 3363). Der vierte ist die eine Regel für alles:
`*, ::before, ::after { transition-duration: 0.01ms !important; transition-delay: 0s !important }`.

**Gerendert**, `Emulation.setEmulatedMedia` auf `prefers-reduced-motion:
reduce` (`matchMedia(…).matches` = true gegengeprüft), Overlay je per Klick
geöffnet:

| Story · Element | normal | reduce |
|---|---|---|
| `Drawer --open` · `.v2drawer` | 0,28 s (transform) | **1e-05 s** |
| `Drawer --open` · `.v2drawer__scrim` | 0,18 s (opacity) | **1e-05 s** |
| `Dialog --confirmation` · `.v2dlg`, `.v2scrim` | 0 s | 1e-05 s |
| `Popover --interactive` · `.v2pop` | 0 s | 1e-05 s |
| `OverflowMenu --interactive` · `.v2menu__panel` | 0 s | 1e-05 s |
| jede Story · `.v2btn` | 0,12/0,12/0,18/0,12 s | 1e-05 s |

Dialog, Popover und Menü hatten nie eine Transition — dort war nichts
abzuschalten; der Drawer hatte eine, und sie fällt weg. Der Haken in den
Abnahmekriterien nennt „gemessen `transition-duration: 0s`"; heute misst man
**0,01 ms** (die globale Regel aus 0093 b). Wirkung gleich, Zahl überholt.

### Werkzeuge

`pnpm typecheck` → exit 0 · `pnpm build` → exit 0 (Storybook gebaut, nur die
bekannte Chunk-Größen-Warnung von Rolldown) · `pnpm check:icons` → exit 0.
Kein Fehler, auch keiner aus einer fremden Sitzung — im Arbeitsbaum lagen
parallel Änderungen an `src/styles/v3.css` und `entities/invoice-line/*`; der
`v3.css`-Diff berührt keinen `prefers-reduced-motion`-Block.

### Zwei Anmerkungen, die den Entscheid nicht drehen

1. **Die Begründung für den Höhenzuwachs trägt nicht.** Der Abschnitt
   „Erledigt" erklärt die +1 bis +29 px damit, dass „Überschriften und Listen
   ihre eigenen Abstände zurückbekommen". Gemessen hat ein `<h1>` weiter
   `margin: 0px`, `font-weight: 400` und die geerbte Größe, eine `<ul>` weiter
   `list-style: none` und `padding-inline-start: 0px`. Preflight räumt
   Überschriften und Listen also **unverändert** ab — das darf es auch, weil es
   ein Autorenblatt ist und kein eigenes Blatt diese Eigenschaften erneut
   setzt; an ihnen ändert die Reihenfolge nichts. Der gemessene Zuwachs mag
   stimmen, die genannte Ursache stimmt nicht. Wer die Zeile später als Beleg
   zitiert, zitiert eine falsche Erklärung.
2. **Der Vorher/Nachher-Durchgang ist von außen nicht nachvollziehbar**, ohne
   die Umstellung zurückzubauen — das habe ich nicht getan. Geprüft ist nur der
   Nachher-Zustand (60 Stories, s. o.), und der ist unauffällig. Außerdem: die
   Haken in „Abnahmekriterien" stehen noch leer, obwohl „Erledigt" die Aufgabe
   abschließt — bitte nachziehen, sonst liest die nächste Sitzung sie als offen.

### Ergebnis: **bestätigt**

Beide Befunde halten heute: Preflight lädt vorn, die eigenen Blätter gewinnen,
ein Link ohne Klasse trägt `--color-accent-700` (60/60), und wer weniger
Bewegung bestellt hat, bekommt den Drawer ohne Einfahrt.

## Nach der Prüfung (2026-09-07): bestätigt, mit einer berichtigten Begründung

Die Prüfung hat die Reihenfolge nicht im Quelltext, sondern **wie der Browser
sie geladen hat** gezählt (1.736 Regeln flach): Preflight `a{color:inherit}`
an Stelle **76**, die eigene `a`-Regel an **120**, `a:hover` an 121. Ein frisch
eingefügter, klassenloser `<a href>` misst in **60 von 60** Stories
`rgb(43,111,156)` — das ist `--color-accent-700`. Der Notnagel aus 0098 am
Ende von `index.css` ist weg.

Die Bewegung ebenfalls gemessen, mit `prefers-reduced-motion: reduce` und
wirklich geöffneten Überlagerungen: `.v2drawer` 0,28 s → **1e-05 s**, das
Scrim 0,18 s → 1e-05 s, `.v2btn` 0,12–0,18 s → 1e-05 s. Eine einzige globale
Regel tut das.

**Berichtigt:** die Aufgabe nannte als Ursache des Höhenwachstums (+1 bis
+29 px) den Überschriften- und Listen-Reset des Preflights. Das stimmt nicht —
`<h1>` hat weiterhin `margin: 0` und `font-weight: 400`, `<ul>` weiterhin
`list-style: none` und `padding-inline-start: 0`. Der Reset ist von der
Umsortierung gar nicht betroffen, weil nichts diese Eigenschaften neu
deklariert. Die **Wirkung** der Aufgabe ist gemessen und richtig; nur die
Erklärung dafür war es nicht.

Die Prüfung nennt noch einen zweiten Punkt, und der ist berechtigt: der
Vorher-Nachher-Vergleich ist ohne Zurückrollen nicht unabhängig
nachvollziehbar. Belegt ist der **Nachher**-Zustand, und zwar vollständig.
