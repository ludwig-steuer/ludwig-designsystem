# 0089 · Feldbeschriftungen ohne Versalien

| | |
|---|---|
| Status | offen |
| Stufe | `src/styles/v3.css` — eine Regel, aber jedes Formular im Set |
| Quelle | Drei unabhängige Abnahmen am 2026-09-05: 0017 (RadioGroup), 0079 (Wizard, Beobachtung außerhalb der Aufgabe) und Paket 0019/0020/0021/0028 |
| Auftrag | `.v2field__label` (`src/styles/v3.css`, Z. 842–845) setzt `text-transform: uppercase`. Damit steht **jede** Feldbeschriftung des Sets in Versalien: „BRUTTOBETRAG", „BELEGE HOCHLADEN", „TRENNZEICHEN", `<legend>ANTWORT</legend>`. T3 verbietet Versalien ausdrücklich und nennt `text-transform: uppercase` als Gegenbeispiel; A2 sagt dasselbe für den Spaltenkopf. |
| Warum eine eigene Aufgabe | Es ist eine Zeile CSS und trotzdem kein Handgriff: die Beschriftung ist heute Overline-Typografie (11 px, `letter-spacing: 0.04em`, `font-weight: 600`) — nimmt man die Versalien weg, muss die Stufe neu sitzen, sonst liest sich das Label wie ein Wert. Das ändert das Aussehen **jedes** Formulars im Set und gehört einmal entschieden, nicht nebenbei in einer Radiogruppe. |
| Zu entscheiden | Welche Schriftstufe trägt eine Feldbeschriftung, wenn sie keine Versalien mehr hat? Kandidaten: `--fs-ui-sm` in `--color-text-muted` mit `font-weight: 600` (wie `.v2fields__row` links), oder die Overline-Stufe ohne `text-transform`. Dazu: gilt dasselbe für `.lw-overline`, oder ist die Overline als **Kategorie-Zeile** eine benannte Ausnahme? |
| Betroffen | `Field`, `RadioGroup` (`<legend>`), `AmountInput`, `InlineEdit`, `FileDrop`, `ChoicePrompt`, `DateField`, `Combobox` — alles, was `.v2field__label` trägt |
| Angelegt von / am | Claude, 2026-09-05 (aus drei Abnahmen) |
