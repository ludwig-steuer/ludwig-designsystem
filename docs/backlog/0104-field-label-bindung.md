# 0104 · Das Feld-Label ist nicht an sein Feld gebunden

| | |
|---|---|
| Status | offen |
| Stufe | `primitives/Form.tsx` |
| Quelle | Abnahme 0019 AmountInput, zweiter Durchgang (2026-09-05), Befund B4 |
| Auftrag | `Field` rendert `<label htmlFor>` als **Geschwister** des Feldes (`Form.tsx:35`). Ohne ein `name` oder eine `id` am Feld zeigt `htmlFor` ins Leere: gemessen in der Story `AmountInput --filled` ist `input.labels` **leer**. Damit hat das Feld für eine Vorlesehilfe keine Beschriftung, und ein Klick auf das Wort setzt den Fokus nicht ins Feld. |
| Warum das zählt | Es trifft **jedes** Feld des Sets, nicht `AmountInput` — `Field` ist die geteilte Hülle für `Input`, `Textarea`, `Select`, `Checkbox`, `AmountInput`, `DateField`, `Combobox`. Die Regel T8 („jedes Icon hat ein Wort, Placeholder ist kein Label") setzt voraus, dass das Wort ankommt. |
| Zu entscheiden | (a) `useId()` in `Field`, die id nach unten reichen und am Kind setzen — dann muss `Field` sein Kind kennen oder klonen. (b) Das Label das Feld **umschließen** lassen (`<label>…<input></label>`) — dann entfällt `htmlFor` ganz, aber das Markup ändert sich für jeden Aufrufer. (c) `htmlFor` zur Pflicht machen und den Aufrufer die id setzen lassen — ehrlich, aber 40 Aufrufstellen. |
| Betroffen | `Field` und alles, was darin steht; die Stories aller Formular-Bausteine sind der Nachweis |
| Verwandt | 0089 (Versalien an denselben Labels) — beide betreffen `.v2field__label`, und wer eines anfasst, sollte das andere mitnehmen |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von 0019) |
