# 0089 · Versalien aus dem Set nehmen

| | |
|---|---|
| Status | offen |
| Stufe | `src/styles/v3.css` — eine Regel, aber jedes Formular im Set |
| Quelle | Vier unabhängige Abnahmen am 2026-09-05: 0017 (RadioGroup), 0079 (Wizard), Paket 0019/0020/0021/0028 und Paket 0016/0017/0031/0034/0038 — die letzte hat den Umfang nachgezählt |
| Auftrag | `.v2field__label` (`src/styles/v3.css`, Z. 842–845) setzt `text-transform: uppercase`. Damit steht **jede** Feldbeschriftung des Sets in Versalien: „BRUTTOBETRAG", „BELEGE HOCHLADEN", „TRENNZEICHEN", `<legend>ANTWORT</legend>`. T3 verbietet Versalien ausdrücklich und nennt `text-transform: uppercase` als Gegenbeispiel; A2 sagt dasselbe für den Spaltenkopf. |
| Warum eine eigene Aufgabe | Es ist eine Zeile CSS und trotzdem kein Handgriff: die Beschriftung ist heute Overline-Typografie (11 px, `letter-spacing: 0.04em`, `font-weight: 600`) — nimmt man die Versalien weg, muss die Stufe neu sitzen, sonst liest sich das Label wie ein Wert. Das ändert das Aussehen **jedes** Formulars im Set und gehört einmal entschieden, nicht nebenbei in einer Radiogruppe. |
| Zu entscheiden | Welche Schriftstufe trägt eine Feldbeschriftung, wenn sie keine Versalien mehr hat? Kandidaten: `--fs-ui-sm` in `--color-text-muted` mit `font-weight: 600` (wie `.v2fields__row` links), oder die Overline-Stufe ohne `text-transform`. Dazu: gilt dasselbe für `.lw-overline`, oder ist die Overline als **Kategorie-Zeile** eine benannte Ausnahme? |
| Umfang | **Nicht nur die Feldbeschriftung.** Nachgezählt am 2026-09-05: **18** `text-transform: uppercase` in `src/styles/v3.css` und **9** in `src/styles/app-chrome.css` — darunter Spaltenköpfe, `.sb__navlabel` in der Seitenleiste, `.v2kf__grp` und der `FieldList`-Titel („6815 · BÜROBEDARF" in der HoverCard-Story). A2 und T3 kennen keine Ausnahme, und die A5-Ausnahme für `app-chrome.css` deckt nur rohe Hex- und `rgba()`-Werte, keine Versalien. Wer nur `.v2field__label` anfasst, trifft dieselbe Entscheidung später noch zweimal |
| Betroffen | `Field`, `RadioGroup` (`<legend>`), `AmountInput`, `InlineEdit`, `FileDrop`, `ChoicePrompt`, `DateField`, `Combobox`, `FieldList`, `NavList`, jeder Spaltenkopf mit `.lw-overline` |
| Angelegt von / am | Claude, 2026-09-05 (aus drei Abnahmen) |
