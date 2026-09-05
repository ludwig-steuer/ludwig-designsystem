# 0085 · BankTransactionList + BankTransactionColumns — der Kontoauszug

| | |
|---|---|
| Status | offen |
| Stufe | `entities/bank-transaction/` |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Zeile `BankTransactionList`) |
| Auftrag | Der Kontoauszug eines Zahlungskontos als Liste: Zeile (`BankTransactionRow`), Zeitraum- und Zustands-Filter, Volltextsuche über Zweck, Gegenpartei, Betrag, Sachverhalt und SEPA-Referenzen, Aufklapper je Zeile für die zugeordneten Sachverhalte mit Teilbeträgen. Ersetzt `modules/bank-transactions/ui/KontoauszugView.tsx` (631 Z.). |
| Job | Wenn **ein Kontoauszug importiert ist**, will **die Sachbearbeiterin** **sehen, welche Zahlungen noch keinem Vorgang gehören**, damit **kein Geldfluss ungebucht durchrutscht**. |
| Umfang | je Konto und Jahr p50 36 · **p90 251** · max 952 (Staging 2026-09-05) → `Pagination`, Serverfilter, Lade- und Fehlerfall gehören in die Spec |
| Vertagt, weil | für die Route `[clientSlug]/[year]/banks/[accountId]` **kein Seitenprofil** unter `docs/seiten/` existiert. Ohne es sind Kopfzeile, Zeitraum, Saldo und die beiden Leerfälle geraten. |
| Zu entscheiden | Offene Frage 3 des Profils: gehört der laufende Saldo in die Zeile oder unter die Liste? *Default: unter die Liste* — eine Saldo-Spalte je Zeile stimmt nur bei genau einer Sortierung, und die Liste ist filterbar. Dass der Auszug heute gar keinen Saldo zeigt, ist Befund L-58. |
| Setzt voraus | `BankTransactionRow` (erste Welle) · `DataTable` (0057) · Seitenprofil `docs/seiten/kontoauszug.md` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |
