# Offene Posten — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/opos/page.tsx` (278 Z.) |
| Heute gebaut in | der Seite selbst — zwei Handtabellen, keine eigene Komponente |
| Entitäten | Offener Posten (`open-item`), am Rand Personenkonto |
| Baustein in v3 | `entities/open-item/OpenItemRow.tsx` (0029, abgenommen) — eine Listen-Komponente gibt es nicht |
| Kein Entitätsprofil | Es gibt keins für den offenen Posten (`docs/entitaeten/` führt account, accounting-case, bank-transaction, clarification, invoice-line, source-document). Dieses Profil steht deshalb allein auf 0029 und der Seite — beim nächsten Anfassen der Familie ist das die Lücke, die zuerst zu schließen ist |
| Fachliche Quelle | `docs/topics/datev.md` (OPOS-Rekonstruktion), F85-T85.2b für den Abgleich |
| Profil von / am | Claude (ludwig-worker), 2026-09-08 |

## Job

> Wenn **eine Zahlung eingeht oder eine Mahnung ansteht**, will **die
> Kanzlei** **wissen, welche Rechnungen zu einem Stichtag offen waren**,
> damit **sie den Posten findet, zu dem die Zahlung gehört — und keinen
> mahnt, der längst bezahlt hat**.

- **Fertig ist sie, wenn** sie den Posten gefunden hat oder sicher weiß, dass
  es ihn nicht gibt. Nicht: „die Liste ist geladen".
- **Misslungen ist die Seite, wenn** sie eine Zahl zeigt, die nach dem letzten
  DATEV-Abzug nicht mehr stimmt, ohne das zu sagen. Ein Stichtag nach dem Abzug
  ist keine Sicht in die Zukunft, sondern eine Lücke.

**Diese Liste ist rekonstruiert, nicht gemessen.** Sie entsteht aus dem
jüngsten OPOS-Snapshot des Spiegels: offen zum Stichtag = bis dahin entstanden
und erst danach ausgeglichen. Jede Angabe hier ist so alt wie der Abzug — das
macht die Herkunft zu einem Datenpunkt und nicht zu einer Fußnote.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Zu welchem Tag sehe ich das?" | Stichtag im Kopf, änderbar; daneben der Stand des DATEV-Abzugs | `PageHeader`, Filterzeile |
| 2 | „Wie viel steht insgesamt aus?" | Debitoren und Kreditoren getrennt, Zahl und Summe | `KpiTile` × 3 |
| 3 | „Welcher Posten ist das?" | Zeile: Art, Personenkonto, Belegnummer, Datum, Fälligkeit, Text | `OpenItemRow` (0029) |
| 4 | „Wie viel ist davon offen?" | Brutto und Restbetrag zum Stichtag, genäherte Werte mit „≈" | `OpenItemRow` |
| 5 | „Ist der inzwischen bezahlt?" | Achse `opos_ausgleich` — offen oder nach dem Stichtag ausgeglichen | `StatusBadge` |
| 6 | „Kann ich der Liste trauen?" | Abgleich mit der Buchungshistorie: dieselbe Rechnung über zwei Wege | zweite Tabelle |

Rang 1 ist der Kern und wird oft unterschätzt: „offen" ist ohne Stichtag keine
Aussage. Rang 6 ist kein Debug-Werkzeug, sondern die Antwort auf „warum weicht
das von DATEV ab" — er gehört auf die Seite, nicht in ein Protokoll.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Zum Replay-Cutoff springen (Experiment-Mandant) | selten, aber dann sofort | einen Knopf neben dem Stichtag |
| Ein Personenkonto öffnen | beim Nachfassen | einen Klick auf die Zeile (`OpenItemRow onOpen`) |
| Nach Alter gruppieren (Mahnstufen) | im Mahnlauf | eine Gruppierung, die es heute nicht gibt (`OpenItemAgeGroup` steht bereit) |

## Was hier nicht hingehört

- **Buchen.** Die Liste ist eine Sicht auf DATEV, kein Arbeitsvorrat. Wer
  ausziffert, tut das in DATEV oder am Sachverhalt.
- **Mahnen.** Die Mahnstufe wird gezeigt, nicht gesetzt — sie kommt aus dem
  Snapshot.
- **Der Sachverhalt.** Ein offener Posten trägt keine Sachverhalts-Id; die
  Brücke ist das Personenkonto plus die Belegnummer. Eine erfundene Kante wäre
  schlimmer als keine.

## Zweifel am heutigen Format

1. **Die Mahnstufe fehlt.** Der Snapshot trägt sie, `OpenItemRow` zeigt sie
   (Rang 7 der Zeile), die Seite hat die Spalte nicht. Wer den Mahnlauf
   vorbereitet, sieht nicht, wer schon gemahnt ist. **Folgerung:** mit dem
   Umzug auf `OpenItemRow` kommt sie mit.
2. **Zwei Überschriften in einer Karte.** Der Abgleich hängt als zweiter
   `SectionHead` unter der Liste, im selben Rahmen. Zwei Themen, ein Kasten.
   **Folgerung:** zwei Karten.
3. **Die Zeile führt nirgendwohin.** Das Personenkonto steht als Text da,
   obwohl es die einzige Brücke zum Rest der Buchhaltung ist. **Folgerung:**
   `onOpen` auf die Kontoseite.
4. **Der Leerfall unterscheidet nicht.** „Keine offenen Posten" steht auch
   dann da, wenn der Stichtag vor dem ersten Beleg liegt — Erfolg und
   Datenlücke sehen gleich aus. **Offen, der Owner entscheidet.** Die Antwort
   für die Sachverhaltsliste vom 2026-09-08 („der Filterstand unterscheidet
   sie") trägt hier **nicht**: der Stichtag ist kein Filter, sondern die
   Definition der Grundgesamtheit — er hat keinen Standardstand, von dem er
   abweichen könnte. Was die beiden trennt, ist eher der Stand des
   DATEV-Abzugs: liegt der Stichtag davor, ist leer ein Ergebnis; liegt er
   danach, ist leer eine Lücke — und das ist genau der Fall, den der
   Job-Abschnitt schon als „misslungen" benennt.
5. **Die Genäherten stehen als Fußnote unter der Tabelle**, der Grund („alter
   Snapshot, Teilzahlung oder Sammel-OP") aber nur dort. `OpenItemRow` trägt
   ihn je Zeile im `title` — dann kann die Fußnote kürzer werden.

## Vorbedingungen für den Bau

- `OpenItemRow` steht (0029, abgenommen) samt Spurliste aus seiner Story.
- `OpenItemAgeGroup` steht — wird für die Gruppierung gebraucht, sobald sie
  bestellt ist.
- **Es gibt keine Listen-Komponente.** Die Seite baut `Card` + `Table` +
  `OpenItemRow` × n selbst; das ist bei p90 unbekannt, aber wenigen Zeilen
  richtig, und `DataTable` bringt hier nichts, was die Seite nicht hat
  (sortiert wird nicht, gefiltert nur über den Stichtag).
