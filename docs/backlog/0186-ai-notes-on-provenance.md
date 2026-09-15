# 0186 · Die KI-Hinweise auf `ProvenanceNote`

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` (Erweiterung von `Provenance`, 0163) und `entities/journal-entry/` (0151) |
| Klassen-Test | die Erweiterung: „auch in einer Versicherungs-App?" → ja, eine Herleitung mit Platz für das, was der Aufrufer anfügt |
| Quelle | `docs/detailseiten-pattern.md` Spec **S8**; Ausbau-Zeile in `docs/backlog/0163-provenance.md` |
| Ersetzt | die Blöcke „Begründung des Vorschlags" und „Quellen" in `AiBookingNotesBody` (0151) |
| Blockiert | nichts |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Seit 0176 stehen in den Fakten eines Buchungssatzes **zwei** Formen derselben
Herleitung untereinander: die `ProvenanceNote` mit Herkunft, Regel und
Konfidenz, und darunter die KI-Hinweise mit Begründung, Judge-Satz und Quellen
in eigenem Markup. Zwei Darstellungen für eine Sache — genau das, was 0163
verhindern sollte.

## Einordnung

- **Erweitert, weil:** Regel 2 aus `spec-schreiben` §3 — `ProvenanceNote`
  deckt Begründung und Quellen bereits ab; es fehlt nur der Platz für das, was
  **nur** am Buchungssatz existiert: das Urteil des Judge und seine Befunde.
- **Zuschnitt:** kein neuer Export außer dem, der ohnehin zweimal gebraucht
  wird — die Zeilen der Herleitung ohne den Aufklapper.

## Schnittstelle

| Export / Prop | Typ | Bedeutung | Nachweis (Story) |
|---|---|---|---|
| neu: `ProvenanceRows` | `({ provenance }) => ReactNode` | die Zeilen der Herleitung **ohne** Aufklapper — für einen Rahmen, der seinen Kopf schon hat | `Rows` |
| neu: `ProvenanceNote.extra` | `ReactNode` | was der Aufrufer unter die Zeilen hängt: am Buchungssatz das Urteil des Judge und seine Befunde. Das Pattern kennt keinen Judge — es hält den Platz | `WithVerdict` |
| geändert: `Provenance.origin` | jetzt optional | **fehlt nur dort, wo der Rahmen sie schon nennt** — im Kasten „KI-Buchungshinweise" steht die Herkunft im Titel. Überall sonst gehört sie hin, und die Zeile fehlt dann ganz statt leer zu stehen | `Rows` |
| neu: `ProvenanceSource.onOpen` | `() => void` | eine Quelle, die **neben** der Arbeit aufgeht (Drawer) statt wegzuführen — das konnte bisher nur `AiSource` | `Rows` |

**Kann bewusst nicht:** das Urteil des Judge selbst darstellen — `extra` ist
ein Platz, kein Vokabular. Agent und Judge gibt es nur am Buchungssatz (0163).

## Verhalten

`AiBookingNotesBody` rendert künftig: die Befunde (unverändert), dann
`ProvenanceRows` mit Begründung und Quellen, dann den Judge-Satz. Der Kasten
`AiBookingNotes` behält seinen Kopf mit Titel, Konfidenz und Urteil — er ist
der Rahmen, den die Liste und die Abnahme brauchen.

`JournalEntryFacts` rendert danach **eine** `ProvenanceNote`: Herkunft, Regel,
Konfidenz, Begründung und Quellen in einer Liste, und der Judge-Teil hängt als
`extra` darunter. Die zweite Überschrift entfällt.

## Stories

| Story | Beweist |
|---|---|
| `Rows` (in `Provenance.stories`) | die Zeilen ohne Aufklapper, einmal mit Herkunft und einmal ohne |
| `WithVerdict` (in `Provenance.stories`) | `extra` mit einem Judge-Satz darunter |
| `AiBookingNotes` (bestehend) | unverändert im Kopf, die Blöcke darunter jetzt als Zeilen |
| `JournalEntryFacts · Filled` (bestehend) | **eine** Herleitung statt zwei Blöcken |

## Abnahmekriterien

Fest: wie in 0184.

Variabel (aus dieser Spec):

- [ ] „Begründung" und „Quellen" werden an genau einer Stelle gerendert (`grep` über `ki__block`)
- [ ] `JournalEntryFacts` zeigt eine Herleitung, keine zwei Überschriften (Story `Filled`, DOM)
- [ ] Ohne `origin` fehlt die Zeile „Herkunft", sie steht nicht leer (Story `Rows`)
- [ ] Eine Quelle mit `onOpen` ist ein Knopf, eine mit `href` ein Link, eine ohne beides Text (Story `Rows`)
- [ ] Der Kasten der KI-Hinweise sieht im Kopf aus wie bisher (Story `AiBookingNotes`, Screenshot)

## Offene Fragen

Keine.

## Gebaut (2026-09-15)

`ProvenanceRows` ist ein eigener Export; `ProvenanceNote` setzt ihn und hängt
`extra` darunter. `Provenance.origin` ist optional — fehlt sie, fehlt die Zeile
„Herkunft" ganz. `ProvenanceSource` kennt `onOpen`, damit eine Quelle neben der
Arbeit aufgehen kann; `aiSourcesToProvenance()` bringt die Quellen des
Buchungssatzes in die Form des Patterns, mit Zeichen und Wort der Entität.

`AiBookingNotesBody` rendert Begründung und Quellen nicht mehr selbst,
`JournalEntryFacts` zeigt **eine** Herleitung: Herkunft · Regel · Konfidenz ·
Begründung · Quellen, darunter die Einschätzung des Judge. Angesehen bei
1000 px.

`pnpm typecheck`, `check:classes`, `check:language`, `check:when` und
`pnpm build` grün. Abnahme durch einen anderen Agenten steht aus.
