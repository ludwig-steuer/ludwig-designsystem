# 0157 · Die Kontoseite als Szenarien

| | |
|---|---|
| Status | offen — vorgemerkt 2026-09-10, Bau nach den offenen 0152-Wellen |
| Stufe | `src/showcase/konto/` (Seiten-Stories), dazu ein Ausbau an `accountEntryColumns` (0067) |
| Quelle | Design-Brief **F198** (`ludwig/app`, `docs/backlog/F198-account-detail-scenarios-design-brief.md`), überbracht von `ludwig-manager`, Owner-Freigabe 2026-09-10 |
| Präzedenz | `src/showcase/beleg/` (0144), `src/showcase/sachverhalt/` (0152) |
| Angelegt | Claude, 2026-09-10 |

## Auftrag (Kurzfassung des Briefs)

Die komplette Kontoseite als Seiten-Stories, **19 Exporte** (K1–K12 samt K4b,
P1–P6), aus vorhandenen Bausteinen: `LedgerAccountView`/`DetailView`,
`AccountFacts`, `accountEntryColumns`, `AccountDrawer`, die Mängelzone
(0153), das Spaltenmuster `master | sidebar` (0154) und `BarChart` (0110).

**Drei Reiter:** Übersicht · Details · Rohdaten. Buchungen und Monate gehen in
die Übersicht auf; die Monatstabelle wird eine Klappe unter dem
Zwölf-Monats-Diagramm.

Alle sechs Owner-Fragen O1–O6 sind mit ihrem Default entschieden. Die
App-Befunde B1–B8 aus §10 gehören der App — hier wird nur festgehalten, was
ein Baustein **nicht** trägt.

## Was daran neu ist (und deshalb zuerst gelesen wird)

Zwei Dinge unterscheiden diese Seite von Beleg und Sachverhalt:

1. **DATEV führt, Ludwig ist das Delta.** Die Bewegungsliste trägt die
   Herkunft als **Zeileneigenschaft**, nicht als zwei Listen. Dazu ein
   Herkunftsfilter und eine Saldospalte, die nur bei **genau einer** Quelle
   erscheint — beides ist der Ausbau von 0067, den der Brief jetzt anfordert.
2. **Der Buchungssatz wird nicht neu gezeichnet.** Der Bewegungs-Drawer
   komponiert, was es gibt: `JournalEntryCompact`/`Card` (0044, 0155),
   `JournalEntryGrid` (0113), `AiBookingNotes` (0151). **Ein** Parameter
   `?entry=` für beide Quellen, `?account=` fürs Gegenkonto, `?partner=` für
   den Partner.

## Reihenfolge

Nach den offenen Wellen von 0152 (Welle 2: E2–E9, Welle 3: S1–S5 und die
Seitenzustände). Der Grund ist nicht Höflichkeit, sondern Erfahrung aus heute:
`Columns`, `OpenPoints` und `DetailView` sind an der Sachverhaltsseite
entstanden, und jede weitere Seite, die sie benutzt, prüft sie noch einmal.
Wer zwei Seiten gleichzeitig baut, merkt nicht, welche von beiden den Baustein
biegt.

## Rückfragen

An `ludwig-manager`, nicht an `ludwig-worker` (Ansage des Auftrags).
