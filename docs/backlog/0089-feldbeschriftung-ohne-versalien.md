# 0089 · Versalien aus dem Set nehmen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `src/styles/v3.css` — eine Regel, aber jedes Formular im Set |
| Quelle | Vier unabhängige Abnahmen am 2026-09-05: 0017 (RadioGroup), 0079 (Wizard), Paket 0019/0020/0021/0028 und Paket 0016/0017/0031/0034/0038 — die letzte hat den Umfang nachgezählt |
| Auftrag | `.v2field__label` (`src/styles/v3.css`, Z. 842–845) setzt `text-transform: uppercase`. Damit steht **jede** Feldbeschriftung des Sets in Versalien: „BRUTTOBETRAG", „BELEGE HOCHLADEN", „TRENNZEICHEN", `<legend>ANTWORT</legend>`. T3 verbietet Versalien ausdrücklich und nennt `text-transform: uppercase` als Gegenbeispiel; A2 sagt dasselbe für den Spaltenkopf. |
| Warum eine eigene Aufgabe | Es ist eine Zeile CSS und trotzdem kein Handgriff: die Beschriftung ist heute Overline-Typografie (11 px, `letter-spacing: 0.04em`, `font-weight: 600`) — nimmt man die Versalien weg, muss die Stufe neu sitzen, sonst liest sich das Label wie ein Wert. Das ändert das Aussehen **jedes** Formulars im Set und gehört einmal entschieden, nicht nebenbei in einer Radiogruppe. |
| Zu entscheiden | Welche Schriftstufe trägt eine Feldbeschriftung, wenn sie keine Versalien mehr hat? Kandidaten: `--fs-ui-sm` in `--color-text-muted` mit `font-weight: 600` (wie `.v2fields__row` links), oder die Overline-Stufe ohne `text-transform`. Dazu: gilt dasselbe für `.lw-overline`, oder ist die Overline als **Kategorie-Zeile** eine benannte Ausnahme? |
| Umfang | **Nicht nur die Feldbeschriftung.** Nachgezählt am 2026-09-05: **18** `text-transform: uppercase` in `src/styles/v3.css` und **9** in `src/styles/app-chrome.css` — darunter Spaltenköpfe, `.sb__navlabel` in der Seitenleiste, `.v2kf__grp` und der `FieldList`-Titel („6815 · BÜROBEDARF" in der HoverCard-Story). A2 und T3 kennen keine Ausnahme, und die A5-Ausnahme für `app-chrome.css` deckt nur rohe Hex- und `rgba()`-Werte, keine Versalien. Wer nur `.v2field__label` anfasst, trifft dieselbe Entscheidung später noch zweimal |
| Betroffen | `Field`, `RadioGroup` (`<legend>`), `AmountInput`, `InlineEdit`, `FileDrop`, `ChoicePrompt`, `DateField`, `Combobox`, `FieldList`, `NavList`, jeder Spaltenkopf mit `.lw-overline` |
| Angelegt von / am | Claude, 2026-09-05 (aus drei Abnahmen) |

## Entschieden (2026-09-06): drei Rollen, drei Stufen, keine Ausnahme

Die Frage der Aufgabe war nicht, **ob** die Versalien weggehen — T3 nennt
`text-transform: uppercase` als Gegenbeispiel und kennt keine Ausnahme —,
sondern **welche Stufe** eine Beschriftung dann trägt, damit sie sich nicht
wie ein Wert liest.

Die 27 Stellen sind nicht dasselbe Ding. Sie sind drei:

| Rolle | Was sie tut | Stufe |
|---|---|---|
| **Beschriftung eines Wertes** | steht **neben oder über** einem Wert: Feld, Kennzahl, Chip-Reihe, linke Spalte einer Feldliste | `--fs-ui-sm` (12,5 px), 600 |
| **Überzeile** | steht **über einem Titel** und ordnet ihn ein: Kicker in Callout und Dialog, die Art im KI-Kasten, die Phase im Stepper | `--fs-ui-xs` (11,5 px), 600 |
| **Gruppen- und Abschnittskopf** | steht **über einer Gruppe von Zeilen**: Tabellen-Zwischenzeile, Gruppenkopf in Liste und Kontenauswahl, Titel einer Feldliste, „Belegdaten" | `--fs-ui-sm` (12,5 px), 700 |

Die **Farbe bleibt je Regel, wie sie war** — Kontrast ist Sache von 0090, und
zwei Dinge auf einmal zu ändern macht die Messung dort unlesbar.

Die **Sperrung fällt überall weg.** Sie war dafür da, Großbuchstaben lesbar
zu halten; unter Gemischtschreibung zieht sie die Wörter nur auseinander.

Warum die Beschriftung auf 12,5 px geht und nicht auf 11 px bleibt: das ist
die Stufe der **linken Spalte einer `FieldList`**. Damit liest sich ein Wort
gleich, ob das Feld beschreibbar ist oder nicht — und genau das war der
Grund, aus dem die Beschriftung überhaupt eine eigene Typografie hatte.

**Die Überzeile ist keine benannte Ausnahme.** Eine Regel, die Versalien
verbietet und dann eine ganze typografische Klasse davon ausnimmt, ist keine
Regel. `.lw-overline` bleibt, was sie ist — die kleinste Stufe über dem
Fließtext —, aber sie sagt es über Größe, Gewicht und Farbe.

## Umfang, wie er sich beim Anfassen zeigte

| Datei | Stellen | Erledigt |
|---|---|---|
| `src/styles/v3.css` | 17 | alle |
| `src/styles/app-chrome.css` | 9 | alle |
| `src/styles/tokens.css` | 1 (`.lw-overline`) | ja |
| `src/ui/v3/Typography.stories.tsx` | 1 (Inline-Stil, der die alte Stufe vorführte) | ja |
| `src/styles/components.css` · `booking.css` | **17** | **nein**, siehe unten |

Die Aufgabe zählte 18 in `v3.css`; es sind 17 — die achtzehnte Zeile war ein
zweites `text-transform` in derselben Regel.

**Nicht angefasst: `components.css` und `booking.css` (17 Stellen).** Beide
tragen die **v1-Schicht**, die v3 ablöst: keine einzige ihrer Klassen wird von
einer v3-Komponente benutzt (geprüft, sechzehn Klassennamen gegen
`src/ui/v3/**.tsx`), sie stehen nur in den Showcase-Stories. Dazu kommt, dass
`booking.css` die Familie stylt, die eine parallele Sitzung gerade umbaut.
Der Entscheid oben gilt für sie unverändert; er wird beim Ablösen angewandt,
nicht in einem Durchgang, der ihn nicht messen kann.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (ein Kriterium je Befundzeile der Aufgabe):

- [ ] **Keine sichtbaren Versalien mehr im Set** — über alle Stories gemessen, nicht über den Quelltext
- [ ] `.v2field__label` steht in 12,5 px, 600, ohne Sperrung und ohne `text-transform` (`Field --filled`)
- [ ] Die `<legend>` einer `RadioGroup` trägt dieselbe Stufe wie ein Feld-Label (`RadioGroup --filled`)
- [ ] Der Spaltenkopf einer Tabelle steht ohne Versalien (A2) und bleibt vom Inhalt unterscheidbar
- [ ] `.lw-overline` hat keine Versalien und keine Sperrung mehr — und ist als Klasse erhalten
- [ ] Kein `text-transform: uppercase` mehr in `v3.css`, `app-chrome.css`, `tokens.css` und in keinem Inline-Stil unter `src/ui/v3` (`grep`)
- [ ] Die Beschriftung liest sich nicht wie ihr Wert — im Browser angesehen, an Feld, Kennzahl und Feldliste
