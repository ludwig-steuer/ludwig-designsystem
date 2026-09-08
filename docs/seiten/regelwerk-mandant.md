# Regelwerk des Mandanten — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/configuration/recurring-rules/page.tsx` — **existiert nicht**, neu zu bauen |
| Heute gebaut in | nichts. `rule-overview-queries.ts` liefert die Daten und hat seit seiner Entstehung keinen Aufrufer |
| Entitäten | Wiederkehr-Regel (`docs/entitaeten/recurring-rule.md`) |
| Baustein in v3 | `RecurringRuleList` — Backlog **0131**, noch nicht gebaut |
| Job | **J-54** — „Wenn **ein Mandant übernommen ist**, will **die Sachbearbeiterin** **alle Dauerbuchungs-Regeln nebeneinander sehen**, damit **sie erkennt, welche stillsteht, welche kein Personenkonto hat und welche doppelt greift**." (`docs/jobs.md`, Stand `unbedient`) |
| Layout | **entfällt** — der Detailseiten-Standard gilt ausdrücklich nicht für Listenseiten. Form ist die der Belegliste: Kopf, Filterzeile, `DataTable` in einer Karte |
| Reiter | **keine.** Eine Liste ist eine Sicht; was sich hier unterscheiden ließe (aktiv/inaktiv), ist ein Filter, kein Reiter (R9, D10) |
| Zonendeckung | entfällt (Listenseite) |
| Abweichungen vom Standard | keine — der Standard betrifft diese Seite nicht |
| Profil von / am | Claude, 2026-09-08 · gemessen: Staging |

## Der Bestand

Gezählt am 2026-09-08 über alle sechs Mandanten.

| | |
|---|---|
| Wiederkehr-Regeln | **30** |
| Dauersachverhalte | **104** |
| davon **ohne Regel** | **75 = 72 %** |
| Regeln je Mandant | **30 bei einem**, 0 bei den übrigen fünf |
| `is_active = false` | **1** von 30 |
| ohne Personenkonto | **1** von 30 |
| Sachverhalte mit **mehr als einer** Regel | **1** |

Drei dieser Zahlen sind der ganze Job: **eine** stillstehende Regel, **eine**
ohne Personenkonto, **ein** Doppelgriff. Sie sind der Grund, warum es die
Seite geben soll — und zugleich die Warnung, sie nicht zu groß zu bauen.

**Die vierte Zahl ist die wichtigste: 72 % der Dauersachverhalte tragen gar
keine Regel.** Wer die Regeln nebeneinander sieht, sieht damit ein knappes
Drittel dessen, was eigentlich laufen sollte. Eine Liste, die nur die 30
gebauten zeigt, beantwortet die Frage „was steht" — nicht die Frage „was
fehlt".

## Job

> Wenn **ein Mandant übernommen ist**, will **die Sachbearbeiterin** **alle
> Dauerbuchungs-Regeln nebeneinander sehen**, damit **sie erkennt, welche
> stillsteht, welche kein Personenkonto hat und welche doppelt greift**.

- **Fertig ist die Rolle, wenn** sie die Ausreißer gefunden hat — oder weiß,
  dass es keine gibt. Bei 30 Zeilen ist das ein Durchgang, keine Suche.
- **Misslungen ist die Seite, wenn** sie 30 Zeilen zeigt und die drei
  Auffälligkeiten darin genauso aussehen wie die 27 gesunden.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Welche Regel stimmt nicht?" | Die Auffälligkeiten zuerst: stillstehend, ohne Personenkonto, doppelt am selben Sachverhalt — je als Zustand in der Zeile, nicht als Nebensatz | `RecurringRuleList` (0131), Spaltensatz aus 0132 |
| 2 | „Was steht überhaupt?" | Die 30 Zeilen: Sachverhalt, Auslöser, Wirkung, Rhythmus | dieselbe Liste |
| 3 | „Wo fehlt eine?" | Die 75 Dauersachverhalte **ohne** Regel — eine Zahl mit Weg, nicht als zweite Liste | `KpiTile href` (I11) auf die Sachverhaltsliste, gefiltert |
| 4 | „Was tut diese eine?" | Der Sprung in den Regelwerk-Reiter des Sachverhalts | Zeile führt dorthin |

Rang 1 und 2 sind **eine** Liste — der Unterschied ist die Sortierung, nicht
die Menge. Rang 3 ist eine Kachel. Rang 4 verlässt die Seite.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Nach einem Gegenpart suchen | wenn eine bestimmte Regel gesucht wird | ein Suchfeld |
| Nur die stillstehenden sehen | bei der Übernahme, danach selten | ein Filter-Häkchen |

## Was hier nicht hingehört

- **Das Ändern einer Regel.** Das ist der Regelwerk-Reiter am Sachverhalt
  (`RecurringRuleEditor`, 0135) — dort steht die Regel im Zusammenhang mit
  dem Fall, für den sie gilt. Eine Liste, aus der heraus man 30 Regeln
  einzeln aufklappt und ändert, ist ein Editor mit Umweg.
- **Das Anlegen einer neuen Regel.** Eine Regel entsteht am Sachverhalt, nicht
  am Mandanten — sie braucht den Fall, an dem sie hängt.
- **Die Übernahme beim Onboarding.** Das ist J-55 und liegt in der
  Admin-Ansicht (Backlog 0130).

## Offene Fragen

1. **Zeigt die Seite auch, was fehlt?** *Ohne Antwort: als Zahl, ja* (Rang 3).
   Die 72 % sind die größere Aussage als die 30 gebauten Regeln, aber sie sind
   eine andere Entität — Dauersachverhalte, nicht Regeln. Eine Kachel mit Weg
   in die gefilterte Sachverhaltsliste sagt es, ohne die Liste zu spalten.
2. **Gehört sie in die Konfiguration?** *Beantwortet, Owner 2026-09-08:* ja —
   Einrichtung, nicht Tagesarbeit. Route englisch (`recurring-rules`), auch
   wenn die Nachbarn dort noch deutsch heißen; sie werden nicht umbenannt,
   aber auch nicht nachgeahmt.
3. **Was macht die Seite bei einem Mandanten ohne Regeln?** Das sind heute
   **fünf von sechs**. *Ohne Antwort:* der Leerfall nennt die Zahl der
   Dauersachverhalte und führt dorthin — „104 Dauersachverhalte, keiner mit
   Regel" ist eine Aussage, „Keine Einträge" ist keine.
