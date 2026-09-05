# 0084 · CasePicker — einen bestehenden Sachverhalt auswählen

| | |
|---|---|
| Status | offen |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CasePicker`) und „Heutige Darstellung" (letzte Zeile) |
| Auftrag | Die Auswahl eines bestehenden Sachverhalts, wenn eine Bankzeile ihm zugeordnet wird. Ersetzt den `<select>` in `modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx` (Z. 376–388), der heute „Nummer · Art · 40 Zeichen Zusammenfassung" in eine Optionszeile presst. |
| Warum nicht so lassen | Bei p90 **190 offenen Sachverhalten** je Mandant und Jahr (Staging 2026-09-05) ist ein `<select>` keine Auswahl, sondern eine Liste. Und man wählt blind: Zustand, Betrag und Gegenpart stehen nicht in der Option. |
| Vertagt, weil | die Suchachse offen ist — Offene Frage 3 des Profils. *Ohne Antwort gilt der Default:* `Combobox` mit Suche über Nummer, Gegenpart und Zusammenfassung; die Trefferzeile trägt Rang 1–4. Entschieden wird das hier, nicht im Profil. |
| Setzt voraus | `CaseRow` bzw. `CaseCell` (erste Welle) · `Combobox` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |
