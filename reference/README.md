# Referenz — die Design-Lieferungen, wie geliefert

Hier liegen die Artboards aus *claude design*, **unverändert**: eigenes
`support.js`, eigenes `_ds`-Bundle, eigene Uploads. Sie werden zitiert, nicht
gepflegt und nicht nachgebaut.

**Warum sie im Repo liegen:** eine Spec verlangt ihre Quelle
(`spec-schreiben` §8.3), und `JournalEntryEditor.tsx` verwies bis 2026-09-03
auf ein `.dc.html`, das nirgends lag. Ein Verweis ins Leere ist keine Quelle.

**Warum sie nicht nach React portiert werden:** ein Nachbau hier wäre eine
dritte Wahrheit neben dem Artboard und dem App-Screen — und die, die als
erste veraltet, ohne dass es jemand merkt. Ganze Screens werden in
`ludwig/app` gebaut. Aus dem Set kommen nur die Bausteine.

Angesehen wird alles im Storybook unter **Referenz/** (`staticDirs` in
`.storybook/main.ts` reicht `reference/` als `/reference` durch).

## F109 — Buchungsreview (`f109-buchungsreview/`, geliefert 2026-08-30)

Brief: `F109-design-brief.md` — Ablauf, Screens, Zustände, Datenkontrakt.

| Artboard | Zeilen | Daraus geworden | Offen |
|---|---:|---|---|
| `Buchungsreview.dc.html` | 7566 | Screens 0–10 des Abnahmeprozesses, alle LIST/DETAIL → `MasterDetail`, `StepRail`, `TodoList` | Screens gehören in die App. Zweispaltiges Journal (Z. 891, 3092) → Aufgabe 0004 |
| `BuchungssatzEditor.dc.html` | 761 | zweiter Entwurf desselben Editors (F109) — der gebaute stammt aus F123 | Gegenkonto bearbeitbar → 0004 · `flash`/`quickBanner` → 0005 |
| `Buchungseditor-Zustände.dc.html` | 276 | 20+ benannte Zustände (S1…S20+) — die Quelle für die Story-Liste des Editors | — |
| `Tabellen-Bausteine.dc.html` | 365 | `Table`, `Cells`, `ExpandableRow`, `FilterChips` (11 Sektionen) | Paginierung (Sektion 5) liegt noch in `legacy/` |
| `StapelSeite.dc.html` | 931 | — | ganz offen; nutzt mit 12 `x-import` den Bestand am stärksten, deshalb der billigste nächste Einstieg |
| `KIBuchungshinweise.dc.html` | 165 | `entities/journal-entry/AiBookingNotes.tsx` | Story fehlt (`docs/v3-backlog.md`) |
| `PruefChecklist.dc.html` | 82 | `patterns/Review.tsx` → `Checklist` | — |
| `AbgleichListe.dc.html` | 28 | Canvas-Hilfsmittel, kein DS-Stoff | — |
| `ScenarioPicker.dc.html` | 20 | Canvas-Hilfsmittel, kein DS-Stoff | — |

**Was die Lieferung über sich selbst verrät:** aus dem mitgegebenen
`_ds`-Bundle benutzt sie nur `Badge` (8×) und `Button` (7×) — alles andere ist
handgeschriebenes Inline-CSS auf Tokens. Eine Maß-für-Maß-Übernahme wäre
deshalb keine Designentscheidung, sondern Zufall des Zeichnens. Übernommen
wird, was der Brief als Prinzip begründet (§3), nicht jedes `padding`.
