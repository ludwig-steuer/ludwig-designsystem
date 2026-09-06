# 0104 · Das Feld-Label ist nicht an sein Feld gebunden

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/Form.tsx` |
| Quelle | Abnahme 0019 AmountInput, zweiter Durchgang (2026-09-05), Befund B4 |
| Auftrag | `Field` rendert `<label htmlFor>` als **Geschwister** des Feldes (`Form.tsx:35`). Ohne ein `name` oder eine `id` am Feld zeigt `htmlFor` ins Leere: gemessen in der Story `AmountInput --filled` ist `input.labels` **leer**. Damit hat das Feld für eine Vorlesehilfe keine Beschriftung, und ein Klick auf das Wort setzt den Fokus nicht ins Feld. |
| Warum das zählt | Es trifft **jedes** Feld des Sets, nicht `AmountInput` — `Field` ist die geteilte Hülle für `Input`, `Textarea`, `Select`, `Checkbox`, `AmountInput`, `DateField`, `Combobox`. Die Regel T8 („jedes Icon hat ein Wort, Placeholder ist kein Label") setzt voraus, dass das Wort ankommt. |
| Zu entscheiden | (a) `useId()` in `Field`, die id nach unten reichen und am Kind setzen — dann muss `Field` sein Kind kennen oder klonen. (b) Das Label das Feld **umschließen** lassen (`<label>…<input></label>`) — dann entfällt `htmlFor` ganz, aber das Markup ändert sich für jeden Aufrufer. (c) `htmlFor` zur Pflicht machen und den Aufrufer die id setzen lassen — ehrlich, aber 40 Aufrufstellen. |
| Betroffen | `Field` und alles, was darin steht; die Stories aller Formular-Bausteine sind der Nachweis |
| Verwandt | 0089 (Versalien an denselben Labels) — beide betreffen `.v2field__label`, und wer eines anfasst, sollte das andere mitnehmen |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von 0019) |

## Entschieden (2026-09-06): keiner der drei Wege allein, sondern zwei nach Zuständigkeit

Die drei angebotenen Wege scheitern je an einem Teil des Bestands:

- **(b) Das Label umschließt das Feld.** Fällt aus, sobald mehr als ein
  Bedienelement darin steht: `DateRangeField` hat **zwei** Eingaben, und ein
  `<label>` um beide bindet an die erste und macht die zweite namenlos.
  Dasselbe bei `AccountField` (Eingabe plus Kontenblatt-Knopf).
- **(a) `useId()` in `Field` und die id ans Kind klonen.** `Field` kennt sein
  Kind nicht: bei `AccountField`, `FileDrop` und `DateRangeField` ist das
  äußere Element ein `div`, die id landete auf dem Träger statt auf der
  Eingabe — `htmlFor` zeigte dann auf einen Kasten. Über einen Context ginge
  es, aber der macht `Form.tsx` zur Client-Komponente, und damit jede Eingabe
  des Sets; der Skill sagt „Server-Component, wenn irgend möglich".
- **(c) `htmlFor` zur Pflicht.** Trägt — aber nur dort, wo der Aufrufer die
  Hülle setzt. Wo ein Baustein seine Hülle **selbst** mitbringt
  (`AmountInput`, `Combobox`), hat der Aufrufer nichts zu binden, und genau
  dort ist der Mangel gemessen worden.

Also nach Zuständigkeit geteilt:

**1. Wer sein Label selbst mitbringt, bindet es auch selbst.** `AmountInput`
und `Combobox` rendern ihr eigenes `Field` und haben die id bisher aus `name`
gezogen — einer **optionalen** Prop. Ohne `name` war beides leer, und das ist
der gemessene Fall (`AmountInput --filled`). Sie fallen jetzt auf `useId()`
zurück. Kein Aufrufer ändert sich, und die Bindung kann nicht mehr fehlen.

Nebenbei entkoppelt: `id` ist die Bindung, `name` der Feldname im Formular.
Beides in eine Prop zu legen hieß, dass ein Feld ohne Formular auch kein Label
haben durfte.

**2. Wo der Aufrufer die Hülle setzt, muss er die Bindung nennen.**
`Field.htmlFor` ist **Pflicht**. Ein `<Field>` ohne Bindung übersetzt nicht
mehr — die Regel steht damit im Typ und nicht in einer Prüfliste, und der
nächste Baustein kann sie nicht vergessen.

Damit das geht, nehmen die drei zusammengesetzten Felder eine `id`
entgegen und geben sie an **ihre** Eingabe weiter: `DateField`,
`DateRangeField` (an das „von"-Feld — der Klick aufs Wort setzt den Fokus an
den Anfang des Zeitraums) und `AccountField`.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (ein Kriterium je Befundzeile der Aufgabe):

- [ ] **`input.labels` ist in keiner Formular-Story mehr leer** — gemessen über alle Stories, die ein `input`, `textarea` oder `select` in einem `.v2field` zeigen
- [ ] Ein Klick auf das Wort setzt den Fokus ins Feld (`AmountInput --filled`, `Field --filled`, im Browser)
- [ ] `AmountInput` und `Combobox` binden **ohne** `name` (Story ohne `name`, `labels.length === 1`)
- [ ] `Field` ohne `htmlFor` übersetzt nicht (`tsc` gegen eine Probezeile)
- [ ] `DateField`, `DateRangeField` und `AccountField` reichen eine `id` an ihre Eingabe durch; beim Zeitraum an das „von"-Feld
- [ ] `id` und `name` sind getrennt: ein Feld ohne `name` hat trotzdem eine Bindung
- [ ] Kein Aufrufer verliert seinen `name` (Server-Action-Formulare, `grep`)

## Gebaut (2026-09-06)

**Die beiden Bausteine, die ihr Label selbst mitbringen**, binden es jetzt
selbst: `AmountInput` und `Combobox` zogen die id aus `name` — einer
optionalen Prop. `const fieldId = name ?? useId()`; `name` gewinnt weiter,
damit bestehende Formulare ihre ids behalten.

**`Field.htmlFor` ist Pflicht.** 41 Aufrufstellen in elf Dateien übersetzten
danach nicht mehr; alle tragen jetzt eine Bindung, und das erste
Bedienendement im Block trägt dieselbe id. Der Slug kommt aus dem Label
(„Belegdatum" → `belegdatum`), je Datei eindeutig.

**Die drei zusammengesetzten Felder** nehmen eine `id` entgegen und geben sie
an ihre Eingabe: `DateField`, `DateRangeField` (an das „von"-Feld) und
`AccountField`.

## Abnahme (Messung des Bauenden, die fremde Abnahme steht aus)

Ein Skript ist über **106 Stories** gelaufen, die zusammen **212**
Bedienelemente in einem `.v2field` zeigen, und hat je Element gefragt, ob es
eine Beschriftung hat (`labels`, `aria-label` oder `aria-labelledby`):
**keins ohne**. Vorher war `input.labels` bei jedem Feld leer, dessen Hülle
kein `htmlFor` trug.

| Gemessen | Ergebnis |
|---|---|
| `AmountInput --filled` (ohne `name`) | `id="_r_0_"` aus `useId`, `labels` 1, Klick aufs Wort setzt den Fokus ins Feld |
| `Combobox --filled` (mit `name`) | `id="konto"` — der Name gewinnt, `labels` 1, Klick trägt |
| `DateField --filled`, Feld „Zeitraum" | zwei Eingaben, das Wort bindet an „von", „bis" behält sein `ariaLabel` |

## Was bewusst offen bleibt

Das „bis"-Feld eines Zeitraums hat kein `<label>`, sondern ein `aria-label`.
Ein `<label>` kann nur auf **ein** Bedienelement zeigen; die saubere Form wäre
eine Gruppe (`role="group"` mit `aria-labelledby`), und die gehört zu 0106,
wo die Frage nach Gruppen und Rollen ohnehin ansteht.
