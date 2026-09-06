# Sachverhalte — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/cases/page.tsx` (559 Z.) |
| Heute gebaut in | `modules/accounting-cases/ui/` — `CasesTable`, `CaseListTabsBar`, `CaseListFilters`, `CloseCasesPanel` (941 Z.) |
| Entitäten | Sachverhalt (`accounting-case`), am Rand Beleg und Kontoauszugsposition |
| Baustein in v3 | `entities/accounting-case/case-columns.tsx` (0096) — die Liste selbst ist 0082 |
| Fachliche Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Listen" (Status `geprüft`, 2026-09-05) |
| Profil von / am | Claude, 2026-09-07 — angelegt, weil 0082 ohne Seitenprofil nicht gebaut werden darf (Profil §Listen) |

## Job

> Wenn **der Vorrat eines Wirtschaftsjahres offen ist**, will **die
> Sachbearbeiterin der Kanzlei** **den nächsten Fall finden, den sie selbst
> zur Buchung bringen kann**, damit **sie nicht 117 Fälle einzeln öffnet, um
> zu sehen, wer am Zug ist**.

- **Fertig ist sie, wenn** kein Fall mehr auf sie wartet — nicht, wenn die
  Liste leer ist. „Nichts offen" ist ein Erfolg, „keine Treffer" ein
  Filterproblem, und die Seite muss beides auseinanderhalten.
- **Misslungen ist die Seite, wenn** sie den Vorrat zeigt, ohne zu sagen, wer
  am Zug ist. Bei p90 **190 offenen Fällen** je Mandant und Jahr ist eine
  Liste ohne Zuständigkeit eine Liste zum Durchklicken.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Wie viel liegt an, und wovon?" | Reiter mit Vorratszähler je Grundgesamtheit | `Tabs` mit `count` |
| 2 | „Worum geht es in diesem Fall?" | Anzeigename, Gegenpart, Betrag — die ersten fünf Ränge | `caseColumns()` in `DataTable` |
| 3 | „Bin **ich** dran?" | Spalte Zuständigkeit, Achse `disposition` | `StatusBadge` |
| 4 | „Was hängt daran?" | Stand, offene Klärungen, Export | `StatusBadge` × 3 |
| 5 | „Wie finde ich einen bestimmten?" | Suche und die drei Filter über der Tabelle | `FilterBar` |
| 6 | „Und jetzt?" | Zeile führt in den Sachverhalt; nichts wird von hier aus entschieden | Zeilenlink |

Rang 1 und 3 sind der Kern. Die Reiter sind **nicht** vier Listen, sondern
vier Grundgesamtheiten derselben Liste — das Profil hat nachgemessen, dass
Sortierung, Spaltensatz, Filter und Massenaktion in allen vier gleich sind.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Einen Fall über den Geschäftspartner suchen | selten (der Partner-Reiter ist der Ort dafür) | einen Klick mehr — kein eigener Filter hier |
| Den Vorrat über Jahre hinweg sehen | selten | die Seite verlässt ihr Jahr nicht; das ist der Partner-Reiter |
| Mehrere Fälle auf einmal schließen | am Ende eines Buchungslaufs | einen **eigenen Reiter** („Zum Schließen") mit eigener Form — Karten statt Zeilen, gruppiert nach `triage` |

## Was hier nicht hingehört

- **Der Reiter „Offene Zahlungen".** Er zeigt Bankzeilen, keine Sachverhalte
  — eine andere Entität in derselben Reiterleiste. Er gehört zur Bank-Seite;
  bis dahin bleibt er, aber er ist **keine** Ausprägung dieser Liste.
- **Die Massenübernahme.** „Zum Schließen" ist der einzige Ort mit einer
  Massenaktion auf Sachverhalten, und er zeigt Karten. Sie in die Zeilenliste
  zu holen hieße, zwei Formen in einer Tabelle zu haben.
- **Buchen.** Hier wird gefunden, nicht entschieden. Wer bucht, ist im
  Sachverhalt.
- **Der Zuständigkeits-Filter, wie er heute dasteht.** Er steht in
  `CaseListFilters` und **wirkt nicht** — `caseFilterForListTab()` liest
  `dispo` nicht, und `CaseFilter` hat kein Feld dafür (Profil, geprüft
  2026-09-05). Ein Filter, der nichts tut, ist schlimmer als keiner.

## Zweifel am heutigen Format

1. **Sechs Reiter, zwei Entitäten.** „Offene Zahlungen" steht zwischen fünf
   Sachverhalts-Reitern. Wer ihn anklickt, bekommt eine andere Tabelle mit
   anderen Spalten und weiß nicht, warum.
2. **Vier Leerfall-Texte, aber nicht die eine Unterscheidung, auf die es
   ankommt.** Die Seite hat je Reiter einen eigenen Satz, aber keiner trennt
   „nichts offen" (Erfolg) von „keine Treffer" (Filter). Genau das ist der
   Unterschied, der der Sachbearbeiterin sagt, ob sie fertig ist.
3. **Pagination ohne Sortierung.** Bei p90 190 Zeilen blättert die Seite, aber
   man kann nur nach „Eröffnet" sortieren, weil es die einzige Sortierung gibt
   (Befund L-15). Wer nach Betrag sucht, blättert.
4. **Ein Filter, der nichts tut** (siehe oben). Er verspricht eine Antwort auf
   Rang 3 und liefert sie nicht.

## Vorbedingungen für den Bau

- `caseColumns()` steht (0096) und trägt die zehn Punkte samt Auswahl.
- `DataTable` (0057) trägt Sortierung, Auswahl, Pager und die vier Zustände.
- `FilterBar` (0003) trägt Suche und Filter.
- **Offen:** `CaseCard` (0081) für den Reiter „Zum Schließen" — er ist
  deshalb **nicht** Teil von 0082.
