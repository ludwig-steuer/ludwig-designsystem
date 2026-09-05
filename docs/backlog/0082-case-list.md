# 0082 · CaseList + CaseColumns — der Vorrat eines Wirtschaftsjahres

| | |
|---|---|
| Status | offen |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Listen" |
| Auftrag | **Ein** Listen-Baustein für alle vier Reiter der Sachverhaltsliste (`laufend` · `belege` · `klaerung` · `alle`) — sie unterscheiden sich nur in der Grundgesamtheit, nicht in Sortierung, Spaltensatz oder Massenaktion, und sind deshalb nach §8 ein Prop, keine vier Komponenten. Ersetzt die Tabelle in `app/(app)/clients/[clientSlug]/[year]/cases/page.tsx` (571 Z.) samt `CaseListFilters` und `CaseListTabsBar`. |
| Job | Wenn **der Vorrat eines Wirtschaftsjahres offen ist**, will **die Sachbearbeiterin** **den nächsten Fall finden, den sie selbst zur Buchung bringen kann**, damit **sie nicht 117 Fälle einzeln öffnet, um zu sehen, wer am Zug ist**. |
| Umfang | offen je Mandant + Jahr p50 86 · p90 190 · max 259 (Staging 2026-09-05) → `Pagination`, Serverfilter, Lade- und Fehlerfall gehören in die Spec |
| Vertagt, weil | für die Route `[clientSlug]/[year]/cases` **kein Seitenprofil** unter `docs/seiten/` existiert. Ohne es sind Kopfzeile, Vorratszähler, Reiterlogik und die beiden Leerfälle geraten — das Entitätsprofil hält nur Job und Tabellenschnitt fest. |
| Setzt voraus | `CaseRow` (erste Welle) · `DataTable` (0057) · Seitenprofil `docs/seiten/sachverhalt-liste.md` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

Zwei Befunde hängen an dieser Liste und sind drüben zu bauen: sie sortiert
heute nicht (L-15) und kennt keine Sammelaktion (L-16).
