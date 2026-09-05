# 0093 · Wo das Set seine eigenen Regeln nicht hält

| | |
|---|---|
| Status | offen |
| Stufe | quer durch `src/ui/v3` und `src/styles/` |
| Quelle | Abnahme Paket 0002/0005/0008/0009/0013 (2026-09-05), Befunde 3–6; dazu Paket 0032/0033/0037/0041/0051 (`format.ts` ohne `@when`) |
| Auftrag | Vier Verstöße gegen Regeln, die das Set selbst aufstellt. Einzeln sind sie klein, zusammen sind sie der Grund, warum eine Abnahme sie jedes Mal wieder findet. |

**(a) `@instead` fehlt an 22 Exporten**, vier haben gar kein JSDoc (`CardHead`,
`CardFoot`, `Input`, `Textarea`). Betroffen unter anderem `KeyButton`,
`StateIcon`, `SearchInput`, `TableLoading`, `ErrorRow`, `useSelection`,
`SelectCell`, `MenuItem` und die vier Exporte aus `format.ts`. Die feste Regel
verlangt beide Zeilen an jedem Export — greppbar ist „was nehme ich?" heute zu
85 %. Gerade `format.ts` ist die Stelle, an der die Frage real wird: nehme ich
`Amount`, `AmountCell`, `AmountInput` oder `formatAmount`?

**(b) `prefers-reduced-motion` ist nur an drei Stellen bedacht.** In `v3.css`
sind `.v2skel`, `.v2spin` und `.v2toast` abgesichert; die Transitions von
`.v2disc__chev`, `.v2chev`, `.v2drawer` und `.v2drawer__scrim` laufen
ungebremst. §2 verlangt es für **jede** Transition — und der Drawer ist die
größte Bewegung im Set.

**(c) T9 gegen die eigene Spec in `StepRail`.** Die Schritt-Navigation setzt
Pfeile als Textzeichen („← Zurück", „Weiter zu Schritt 4 →"). T9 lässt Pfeile
als Bedeutungsträger nur als Lucide-Zeichen zu, seit 0087 über die Registry
(`back`, `forward`). Die Spec 0002 §A6 schreibt die Schreibweise allerdings
selbst so vor — beides gehört zusammengeführt, nicht einseitig geändert.

**(d) Die Icon-Registry lässt sich am Aufrufer umgehen.** `MenuItem icon` ist
`ReactNode`; wer will, reicht ein beliebiges Lucide-Zeichen durch. Für Stories
erlaubt 0087 das ausdrücklich, für echte Aufrufer gibt es keine Schranke. Zu
entscheiden: bleibt `ReactNode` (und der Wächter deckt es, weil der Aufrufer
importieren müsste), oder nimmt `MenuItem` eine `ActionKey`?

| | |
|---|---|
| Warum eine Aufgabe für vier Dinge | Jedes einzeln wäre ein Nachtrag an einer fremden, längst abgenommenen Spec. Zusammen sind sie ein Durchgang durch das Set mit einer Abnahme. |
| Angelegt von / am | Claude, 2026-09-05 (aus zwei Abnahmen) |
