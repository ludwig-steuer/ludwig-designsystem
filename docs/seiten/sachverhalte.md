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
| Überholt am | 2026-09-08 durch den Owner-Entscheid „Reiter sind keine Filter" — siehe den Abschnitt unten; die Ränge 1 und 5 und die Zweifel 1 und 2 sind entsprechend nachgezogen |

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
| 1 | „Wie viel liegt an, und wovon?" | **Der Vorratszähler der einen Liste**, nicht mehr eine Reiterleiste (Entscheid 2026-09-08). Die Aufteilung nach Zustand macht der Filter, und er sagt zugleich, wie viel er wegnimmt | Kopf der Karte (`head.sub`), `FilterBar` |
| 2 | „Worum geht es in diesem Fall?" | Anzeigename, Gegenpart, Betrag — die ersten fünf Ränge | `caseColumns()` in `DataTable` |
| 3 | „Bin **ich** dran?" | Spalte Zuständigkeit, Achse `disposition` | `StatusBadge` |
| 4 | „Was hängt daran?" | Stand, offene Klärungen, Export | `StatusBadge` × 3 |
| 5 | „Wie finde ich einen bestimmten?" | Suche und die drei Filter über der Tabelle | `FilterBar` |
| 6 | „Und jetzt?" | Zeile führt in den Sachverhalt; nichts wird von hier aus entschieden | Zeilenlink |

Rang 1 und 3 sind der Kern. Das Profil hat nachgemessen, dass Sortierung,
Spaltensatz, Filter und Massenaktion in allen vier Reitern gleich sind — sie
waren **nicht** vier Listen, sondern vier Grundgesamtheiten derselben. Genau
das ist der Befund, aus dem der Entscheid vom 2026-09-08 folgt: was sich nur
in der Grundgesamtheit unterscheidet, ist ein Filter und bekommt keinen
Reiter.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Einen Fall über den Geschäftspartner suchen | selten (der Partner-Reiter ist der Ort dafür) | einen Klick mehr — kein eigener Filter hier |
| Den Vorrat über Jahre hinweg sehen | selten | die Seite verlässt ihr Jahr nicht; das ist der Partner-Reiter |
| Mehrere Fälle auf einmal schließen | am Ende eines Buchungslaufs | eine **eigene Ansicht** („Zum Schließen") — Karten statt Zeilen, gruppiert nach `triage`, mit der einzigen Massenaktion. Sie ist der Fall, für den ein Reiter da ist: andere Form, andere Handlung |

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

1. **Sechs Reiter, zwei Entitäten — beantwortet 2026-09-08.** „Offene
   Zahlungen" stand zwischen fünf Sachverhalts-Reitern; wer ihn anklickte,
   bekam eine andere Tabelle und wusste nicht, warum. Der Owner-Entscheid
   löst beides auf einmal: vier der sechs waren Filter, und die zwei, die
   wirklich andere Ansichten sind („Offene Zahlungen", „Zum Schließen"),
   bleiben als solche kenntlich — sie kommen zurück, wenn sie gebaut sind.
2. **Vier Leerfall-Texte, aber nicht die eine Unterscheidung, auf die es
   ankommt.** Die Seite hat je Reiter einen eigenen Satz, aber keiner trennt
   „nichts offen" (Erfolg) von „keine Treffer" (Filter). Genau das ist der
   Unterschied, der der Sachbearbeiterin sagt, ob sie fertig ist.
3. **Pagination ohne Sortierung.** Bei p90 190 Zeilen blättert die Seite, aber
   man kann nur nach „Eröffnet" sortieren, weil es die einzige Sortierung gibt
   (Befund L-15). Wer nach Betrag sucht, blättert.
4. **Ein Filter, der nichts tut** (siehe oben). Er verspricht eine Antwort auf
   Rang 3 und liefert sie nicht.

## Owner-Entscheid 2026-09-08 — Reiter sind keine Filter

`[year]/cases` bekommt vorübergehend **einen** Reiter, „Alle Sachverhalte",
mit Liste, Suche und Filtern. Reiter kommen später zurück — ausschließlich
für besondere Sachverhaltsarten mit **eigener Ansicht**. Zielbild ist
**1 + n Sonderansichten**, nicht n Filter. Die Regel steht als Absatz unter
R9 in `docs/web-ui-regeln.md`.

Was das für diese Seite heißt:

| Heute | Künftig |
|---|---|
| Reiterleiste mit Vorratszählern beantwortet Rang 1 | Der Kopf der einen Liste trägt den Vorrat; die Aufteilung macht der Filter und sagt dabei, wie viel er wegnimmt |
| „Laufend", „Wartet auf Unterlagen", „Zur Bearbeitung", „Alle" | **ein** Reiter — die vier unterschieden sich nachweislich nur in der Grundgesamtheit |
| „Offene Zahlungen" und „Zum Schließen" in derselben Leiste | Sonderansichten mit eigener Form; sie kommen als Reiter zurück, sobald sie gebaut sind (0081 für „Zum Schließen", die Bank-Seite für „Offene Zahlungen") |

**Was der Entscheid für den Leerfall bedeutet — und das ist die eigentliche
Folge.** Die vier Reiter trugen vier Leerfall-Sätze, und drei davon waren
ein Erfolg („Kein Sachverhalt ist mehr offen."). Bei einer Liste gibt es
diesen Satz nicht mehr von selbst: „nichts offen" wird zu einem **Filter mit
leerem Ergebnis**, und ein leeres Filterergebnis ist normalerweise ein
Bedienfehler, kein Erfolg. Wer die eine Liste baut, muss also entscheiden,
woran sie einen erfolgreichen Filterstand von einem erfolglosen unterscheidet
— sonst geht genau die Aussage verloren, die dieser Seite ihren Job gibt
(„fertig ist sie, wenn kein Fall mehr auf sie wartet"). **Das ist eine offene
Frage an den Owner, kein Bauauftrag.**

**Kein Bauauftrag im Set** (Ansage `ludwig-manager`). `CaseList` (0082) bleibt
wie gebaut: sie nimmt einen Reiter als Prop und kennt vier — beim nächsten
Spiegel ist `CASE_LIST_TABS` gegen dieses Zielbild zu prüfen, und wenn die
App auf einen Reiter geht, schrumpft `CaseListTab` von selbst mit (der Typ
ist seit dem 2026-09-08 abgeleitet, nicht abgeschrieben).

## Vorbedingungen für den Bau

- `caseColumns()` steht (0096) und trägt die zehn Punkte samt Auswahl.
- `DataTable` (0057) trägt Sortierung, Auswahl, Pager und die vier Zustände.
- `FilterBar` (0003) trägt Suche und Filter.
- **Offen:** `CaseCard` (0081) für den Reiter „Zum Schließen" — er ist
  deshalb **nicht** Teil von 0082.
