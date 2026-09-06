# Kontoauszug — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/banks/[accountId]/page.tsx` |
| Heute gebaut in | `modules/bank-transactions/ui/KontoauszugView.tsx` (631 Z.), `kontoauszug-presentation.tsx` |
| Entitäten | Kontoauszugsposition (`bank-transaction`), am Rand Sachverhalt und Konto |
| Baustein in v3 | `entities/bank-transaction/bank-transaction-columns.tsx` (0101) — die Liste selbst ist 0085 |
| Fachliche Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Status `geprüft`, 2026-09-05) |
| Profil von / am | Claude, 2026-09-07 — angelegt, weil 0085 ohne Seitenprofil nicht gebaut werden darf |

## Job

> Wenn **ein Kontoauszug importiert ist**, will **die Sachbearbeiterin der
> Kanzlei** **sehen, welche Zahlungen noch keinem Vorgang gehören**, damit
> **kein Geldfluss ungebucht durchrutscht**.

- **Fertig ist sie, wenn** jede Zeile des Zeitraums einem Sachverhalt gehört
  oder begründet keinem. Nicht: „der Auszug ist importiert".
- **Misslungen ist die Seite, wenn** sie den Auszug zeigt, ohne die 65 % ohne
  Vorgang hervorzuheben. Bei p90 **251 Zeilen** je Konto und Jahr ist eine
  Liste, in der offene und erledigte Zeilen gleich aussehen, eine Liste zum
  Durchscrollen.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Welches Konto, welcher Zeitraum?" | Kopf der Karte: Kontoname, Nummer, Zeitraum | `CardHead` |
| 2 | „Was ist auf dem Konto passiert?" | Zeile je Position: Datum, Gegenpartei, Zweck, Betrag | `bankTransactionColumns()` in `DataTable` |
| 3 | „Welche gehören noch keinem Vorgang?" | Spalte Sachverhalt: „offen" als Wort mit Weg | `CaseCell` mit `emptyHref` |
| 4 | „Kennt DATEV die schon?" | Spalte DATEV-Historie, Achse `bank_match_stage` | `StatusBadge` |
| 5 | „Wie finde ich eine bestimmte?" | Volltext über Zweck, Gegenpartei, Betrag, Sachverhalt **und SEPA-Referenzen** | `FilterBar` |
| 6 | „Geht der Saldo auf?" | **Unter** der Liste, nicht je Zeile | Fuß der Karte |

Rang 3 ist der Kern. Der Auszug ist keine Buchhaltungsansicht, sondern eine
**Suchliste nach dem, was noch offen ist**.

## Der Saldo steht unter der Liste, nicht in der Zeile

Die offene Frage 3 des Entitätsprofils, hier entschieden: **unter der Liste.**
Ein laufender Saldo je Zeile stimmt nur bei genau einer Sortierung und genau
keinem Filter — und diese Liste ist gefiltert und sortierbar. Ein Saldo, der
bei jedem Filterklick etwas anderes bedeutet, ist schlimmer als keiner.

Dass der Auszug heute **gar keinen** Saldo zeigt, ist Befund **L-58** und
bleibt es: die Zahlen dafür stehen am Import-Batch, nicht an der Zeile.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Eine Zahlung nachschlagen, ohne die Liste zu verlassen | oft | einen Klick — `BankTransactionDrawer` (0103) |
| Sehen, woraus eine Zeile aufgeteilt ist | bei 4 % der Zeilen (Z3) | einen Aufklapper je Zeile |
| Den Import beurteilen | nach jedem Lauf | eine eigene Route in der Konfiguration, **nicht** diese Seite |

## Was hier nicht hingehört

- **Zuordnen.** Die Seite zeigt, was offen ist; zugeordnet wird in der
  Arbeitsliste (0086) oder im Drawer. Ein Zuordnen-Knopf je Zeile hier hieße,
  zwei Orte für dieselbe Handlung zu haben.
- **Der Import.** Er hat seine eigene Seite. Wer hier einen Auszug hochlädt,
  sucht die Import-Seite.
- **Andere Konten.** Ein Auszug ist der eines Kontos. Kontoübergreifend ist
  die Arbeitsliste.
- **Der Rohdaten-Block.** Er beantwortet „woher kam die Zeile" — die Frage
  kommt im Auszug nicht auf, sondern beim Prüfen eines Imports.

## Zweifel am heutigen Format

1. **Der Zweck wird verschluckt.** `KontoauszugView` rendert
   `deriveSepa(row).text` als nacktes `<span>`, ohne Chips und ohne Zugang zum
   Originalblock — bei **90 %** Referenz-Anteil (Befund L-59). Der Umzug auf
   `BankTransactionPurpose` behebt es.
2. **Das Datum steht ohne Jahr** (`fmtDateShort` → „15.04."). In einer über
   Jahresgrenzen gefilterten Liste ist das mehrdeutig.
3. **Kein Saldo, keine Zeitraum-Angabe im Kopf.** Wer den Auszug gegen den
   Papierauszug hält, sucht beides.

## Vorbedingungen für den Bau

- `bankTransactionColumns()` steht (0101) samt Auswahl und Spurliste.
- `DataTable` (0057) trägt Sortierung, Pager, Aufklapper und die fünf Zustände.
- `BankTransactionDrawer` (0103) steht für den Nebenjob „nachschlagen".
- **Offen:** die Saldo-Zahlen (L-58) — bis dahin bleibt der Fuß leer.
