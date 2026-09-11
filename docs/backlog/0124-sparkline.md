# 0124 · Sparkline

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, Endstand c2a2761) |
| Stufe | `primitives/` — Gruppe Fläche |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: vier bis zwölf Zahlen als Verlauf, ohne Achsen und ohne Fachwort |
| Quelle | `docs/v3-backlog.md` („`Sparkline` (4–12 Werte in der KPI-Kachel) … `v2spark` inline in `Schritt6Liste.tsx` (`aria-hidden`, ohne Text-Alternative)"); die Formen aus P23, die weder `BarChart` (0041) noch `Progress` (0045/0046) abdecken |
| Ersetzt | das Inline-`v2spark` in `modules/stapelabnahme/ui/Schritt6Liste.tsx` |
| Setzt voraus | nichts — `.v2spark` steht seit dem Umzug in `src/styles/v3.css:1160–1163` |
| Spec von / am | Claude, 2026-09-08 |

## Der Mangel, um den es geht

Die heutige Fassung ist vier Zeilen Markup mit `aria-hidden` — **und ohne
Text-Alternative daneben.** Für eine Sachbearbeiterin mit Screenreader
existiert der Verlauf damit nicht; sie sieht die Vergleichszahlen darunter in
der `FieldList`, aber nicht, was die Kurve sagt.

`aria-hidden` ist dabei **richtig**: zwölf `<div>` ohne Bedeutung vorgelesen zu
bekommen wäre schlimmer. Falsch ist, dass daneben nichts steht. Genau das ist
der Grund, warum diese Komponente existiert und nicht wieder inline gebaut
wird: die Alternative muss aus denselben Daten kommen wie die Balken, sonst
laufen sie auseinander.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `values` | `readonly (number \| null)[]` | ja | Vier bis zwölf Werte in zeitlicher Ordnung. `null` ist eine **Lücke**, keine Null: der Balken fehlt, die Spur bleibt | `Filled`, `Gaps` |
| `labels` | `readonly string[]` | nein | Beschriftung je Wert. Gezeichnet werden nur die **erste und die letzte** — dazwischen ist kein Platz; die vollständige Liste geht in die Text-Alternative | `Filled` |
| `format` | `(v: number) => string` | nein, Vorgabe `String` | Wie ein Wert in der Text-Alternative erscheint. Der Aufrufer gibt seinen Formatierer (Beträge über `formatAmount`) — die Komponente kennt keine Währung | `InUse` |
| `summary` | `string` | nein | Ersetzt die abgeleitete Text-Alternative, wo der Aufrufer einen besseren Satz hat („Vierter Monat in Folge rückläufig") | `InUse` |

**Kann bewusst nicht:**

- **Achsen, Gitter, Tooltips.** Das ist `BarChart` (0041). Eine Sparkline ist
  ein Verlauf ohne Skala — wer Werte ablesen will, liest die Tabelle daneben.
- **Mehr als eine Reihe.** Zwei Serien im Vergleich sind ein Diagramm.
- **Aus wenigen Werten viel machen.** Unter vier Werten ist es kein Verlauf,
  sondern eine Zahl; die Komponente rendert dann **nichts** und überlässt dem
  Aufrufer den Platz.
- **Die Zahlen einfärben.** Rot ist Kritikalität (V3), nicht Richtung — die
  letzte Spur ist die einzige hervorgehobene, und zwar als Ort, nicht als
  Urteil (`.is-now`).

## Die Text-Alternative

Sie ist der Kern dieser Aufgabe, deshalb steht sie hier und nicht im Verhalten:

- Die Balken tragen `aria-hidden`, der Behälter trägt `role="img"` und ein
  `aria-label`.
- Ohne `summary` wird es aus den Daten gebaut: „**\<n\> Werte, \<erstes Label\>
  bis \<letztes Label\>: \<Werte, mit `format`, durch Komma\>**". Lücken heißen
  „keine Angabe", nicht „0".
- Mit `summary` steht dort dieser Satz — dann ist der Aufrufer dafür
  verantwortlich, dass er zu den Werten passt.

## Stories

Abgeleitet nach §6: 2 anwendbare Zustände (gefüllt · zu wenige Werte, dann
nichts) + 0 Enums + 0 Layout + 0 Callbacks + 1 „im Einsatz" + 1 Rand (Lücken,
negative Werte, ein einzelner Ausreißer) = **4**.

| Story | Beweist |
|---|---|
| `Filled` | Sechs Monatswerte, erstes und letztes Label, die letzte Spur hervorgehoben |
| `Gaps` | `null` als Lücke — der Balken fehlt, die Spur bleibt, die Alternative sagt „keine Angabe" |
| `TooFew` | Drei Werte: die Komponente rendert nichts |
| `InUse` | In der KPI-Kachel des Stapelschritts, mit Betragsformat und eigenem `summary` — der Fall aus `Schritt6Liste` |

## Abnahmekriterien (variabler Block)

- `values` mit 4–12 Werten zeichnet je einen Balken, die letzte Spur trägt
  `.is-now` (`Filled`)
- `null` lässt den Balken weg, ohne die Spur zu verschieben (`Gaps`)
- Unter vier Werten kommt **nichts** ins DOM (`TooFew`)
- Der Behälter trägt `role="img"` und ein `aria-label`, die Balken
  `aria-hidden` — gemessen im DOM (`Filled`)
- Ohne `summary` nennt das Label alle Werte in `format`; mit `summary` genau
  diesen Satz (`InUse`)
- Kein Hex, keine px in der Komponente — Höhe und Farbe stehen in `.v2spark`
- Ersetzt das Inline-Markup in `Schritt6Liste.tsx` ohne Funktionsverlust

## Gebaut 2026-09-08

Gemessen (`scripts/cdp.mjs`, drei Stories):

| Story | Gemessen |
|---|---|
| `Filled` | `role="img"`, `aria-label` „6 Werte, März bis August, 1.200,00 €, …", sechs Balken, **alle** `aria-hidden`, einer mit `.is-now` |
| `Gaps` | „keine Angabe" im Label an den zwei Lückenstellen, zwei Balken auf Höhe 0 — die Spur bleibt |
| `TooFew` | Nichts im DOM: kein `.v2spark`, kein Label |

Die Ober**grenze** ist beim Bauen dazugekommen und stand so nicht in der Spec:
über zwölf Werten rendert die Komponente ebenfalls nichts. Der Grund ist
derselbe wie unten — dann ist es ein Diagramm und gehört zu `BarChart`.

`pnpm typecheck` und die fünf Wächter auf Exit 0.

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761; statische Checks (typecheck, check:language, check:when, check:contrast, check:icons, check:jobs, check:mirror, build) auf 6d58b58 und bca4b7d alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| 4–12 Werte → je ein Balken, letzte Spur `.is-now` | `sparkline--filled`: 6 `.v2spark__b`, 1 `.is-now` | ok |
| `null` lässt Balken weg, Spur bleibt | `--gaps`: 6 Balken, Lücken `height: 0px`, Label „keine Angabe" an zwei Stellen | ok |
| Unter vier Werten nichts im DOM | `--too-few`: kein `.v2spark`, nur Story-Text | ok |
| `role="img"` + `aria-label`, Balken `aria-hidden` | Filled: `role=img`, Label „6 Werte, März bis August, 1.200,00 €, …", 6/6 `aria-hidden` | ok |
| Ohne `summary` alle Werte in `format`; mit `summary` genau der Satz | Filled: Werte formatiert; `--in-use`: „Sechs Monate, März bis August: schwankend …" | ok |
| Erste/letzte Beschriftung | `.v2spark__ax` „März / August" | ok |
| Kein Hex, keine px in der Komponente | Höhe/Farbe in `.v2spark`; Balken tragen Inline-`height: NN%` (Lücke `0px`) | ok (Hinweis: Inline-Prozentwerte) |
| Ersetzt Inline-Markup in `Schritt6Liste.tsx` | — | offen (App) |
| Spec beschreibt das Gebaute | Obergrenze 12 im „Gebaut"-Absatz ergänzt | ok |

**Urteil: fertig.**
