# 0086 · BankTransactionWorklist — offene Zahlungen zuordnen

| | |
|---|---|
| Status | offen |
| Stufe | `entities/bank-transaction/` |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Zeile `BankTransactionWorklist`) |
| Auftrag | Die kontoübergreifende Arbeitsliste jeder Zahlung ohne Sachverhalt — nach Konto gruppiert, mit Mehrfachauswahl und zwei Sammelaktionen: neuen Sachverhalt anlegen oder einem bestehenden zuordnen. Ersetzt `modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx` (658 Z.). |
| Job | Wenn **Zahlungen ohne Vorgang liegen**, will **die Sachbearbeiterin** **sie in einem Zug einem neuen oder bestehenden Sachverhalt zuordnen**, damit **sie nicht Konto für Konto durchgeht**. |
| Warum eigene Komponente | Sie unterscheidet sich von der Auszugsliste (0085) in **drei** der fünf Merkmale aus `entitaet-analysieren` §8: Grundgesamtheit (kontoübergreifend statt ein Konto), Massenaktion (ja statt keine) und Spaltensatz (mit Konto, ohne Zuordnung). Zwei genügen. |
| Umfang | 65 % aller Positionen haben kein Ereignis (Staging 2026-09-05, 1281 Zeilen) |
| Vertagt, weil | sie an `CasePicker` (0084) hängt — heute ist die Auswahl des Ziel-Sachverhalts ein `<select>` über alle Fälle — und an einer Sammelaktion, die es serverseitig nur je Zeile gibt (Befund L-16). |
| Setzt voraus | `BankTransactionRow` (erste Welle) · `CasePicker` (0084) · `DataTable` mit `SelectionBar` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |
