# 0153 · Die Mängel-Zone gehört den Patterns, nicht dem Beleg

| | |
|---|---|
| Status | offen — vorgemerkt, nicht spec'd |
| Stufe | `patterns/` (heute `entities/source-document/SourceDocumentAside.tsx`) |
| Quelle | `ludwig-cto` beim Sichten des Sachverhalts-Briefs (F196 §9, Verweis auf R21), 2026-09-10 · gebaut wurde die Zone mit 0150 |
| Blockiert von | 0152 (Sachverhalts-Szenarien) — erst dort zeigt sich, ob die zweite Entität dieselbe Zone braucht |
| Angelegt | Claude, 2026-09-10 |

## Auftrag

`SourceDocumentDefects` (0150) zeichnet „was ist an diesem Datensatz offen" —
Mängel mit je einem Weg hinaus, dazu die Rückfragen in derselben Box. Sie
steht heute in der **Belegfamilie**, weil es dort den ersten Fall gab.

Der Sachverhalt braucht dieselbe Zone: F196 §9 führt Guard-Warnung, Mängel und
Erwartung mit Eskalation als eigene Befunde. Eine zweite Kopie in
`entities/accounting-case/` wäre die Sorte Doppelung, die R21 verbietet — und
die 0150 gerade an drei handgebauten „Zu klären"-Karten abgeräumt hat.

## Warum noch nicht jetzt

**Eine Entität ist kein Muster.** Nach `spec-schreiben` §3 wird ein Pattern
gebaut, wenn eine Komposition auf **mindestens zwei** Screens vorkommt — heute
ist es einer. Der zweite entsteht mit 0152; erst dann steht fest, was die
beiden wirklich teilen und was nur der Beleg braucht.

Absehbar gemeinsam: die Reihenfolge (was aufhält, zuerst), der Weg je Mangel,
die leere Aussage („nichts offen" als Erfolg, nicht als leere Box), und dass
Klärungen und Mängel **eine** Box sind.

Absehbar belegspezifisch: die Wörter je `DocDefectKind` und die Karte der
Finding-Codes — die kommen aus `source-docs/domain/doc-defects.ts` und gehören
dem Beleg. Ein Pattern nimmt sie als Daten entgegen, es kennt sie nicht.

## Was beim Schnitt zu klären ist

1. Nimmt das Pattern eine **fertige Liste** von Zeilen (Titel, Satz, Weg)
   entgegen, oder eine Entitätsableitung je Aufrufer? Ersteres hält es frei
   von Fachwissen, letzteres spart dem Aufrufer die Übersetzung.
2. Wie heißt es? „Mangel" ist Ludwig-Wort; ein Pattern darf kein Fachwort
   tragen. `OpenPoints`, `ToDoZone`, `IssueList` — der Name entscheidet sich
   am GLOSSARY, nicht am Gefühl.
3. Verhältnis zu `TodoList` (0054) und `Checklist` (`patterns/Review.tsx`):
   drei Bausteine für „was ist noch zu tun" sind zwei zu viel. Der Schnitt
   muss sagen, was jeder von ihnen **nicht** ist.
