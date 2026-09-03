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

## Design-System v2 (`design-system-v2/`, gerettet 2026-09-03)

Das v2-Bundle, wie es in `ludwig/app/design/Ludwig Design System v2/` lag —
dort am 2026-09-03 gelöscht, hier die vollständige Kopie. `apps/web/DESIGN.md`
nannte es die „Source of truth" der v2-Optik; für v3 ist es **Referenz, nicht
Regel** — die Regel steht in `docs/design-guidelines.md`.

| Was | Wofür |
|---|---|
| `preview/*.html` (30) | Die visuellen Referenzblätter: Farben, Typo, Abstände, Radius/Schatten, Buttons, Inputs, Tabellen, Badges, Karten, Drawer, Wizard, Toast, Leerzustand, Charts, Ikonografie, Konfidenz, Klärung, Prüfzeile, Upload, Logo, Stimme. Der schnellste Weg zu „wie sah das gedacht aus?". |
| `ui_kits/{app,auth,marketing}/` | Die JSX-Kits der drei Tracks samt CSS — Herkunft vieler `.v2*`-Klassen. |
| `assets/`, `fonts/README.md` | Logo, Wortmarke, Mark; die Schriftwahl mit Begründung. |
| `README.md`, `SKILL.md`, `PROGRESS.md` | Wie das Bundle gedacht war und wie weit es kam. |
| `colors_and_type.css` | Die Palette vor `tokens.css`. Bei Abweichung gilt `src/styles/tokens.css`. |
| `brief.md` | Der ursprüngliche UX-Brief (Rollen, Tracks, Screens, Login zuerst). |

Ansehen im Storybook unter **Referenz/Design-System v2**. Die 30
`preview/`-Blätter sind reines HTML/CSS und laufen offline; die drei
`ui_kits/` holen React und Babel von unpkg und bleiben **ohne Netz leer** —
das ist kein Fehler.

Eine **Teilkopie** desselben Bundles liegt unter
`f109-buchungsreview/_ds/` — die gehört zur F109-Lieferung und wird von deren
Artboards geladen; nicht zusammenlegen.

## Design-Briefs aus `ludwig/app` (`briefe/`)

Die Briefe, aus denen Aufgaben im Backlog entstanden sind. Adressat war
*claude design*, die Abgabe waren Artboards; im Backlog steht dieselbe Sache
als v3-Entwicklungsaufgabe. Bei Widerspruch gilt die Aufgabe.

| Brief | Daraus geworden |
|---|---|
| `F143-entitaets-drawer-design-brief.md` | Aufgabe `0052-entity-drawer.md` (dort steht Punkt für Punkt, was sich ändert) |
| `F116-feldlisten-je-entitaet.md` | Grundlage der Entitäts-Profile (`docs/entitaeten/`, Skill `entitaet-analysieren`) |
| `F89-beleg-galerie-ui-neubewertung.md` | Szenarien-Katalog der Beleg-Familie; noch keine Aufgabe |

## F109 — Buchungsreview (`f109-buchungsreview/`, geliefert 2026-08-30)

Brief: `F109-design-brief.md` — Ablauf, Screens, Zustände, Datenkontrakt.

| Artboard | Zeilen | Daraus geworden | Offen |
|---|---:|---|---|
| `Buchungsreview.dc.html` | 7566 | Screens 0–10 des Abnahmeprozesses, alle LIST/DETAIL → `MasterDetail`, `StepRail`, `TodoList` | Screens gehören in die App. Zweispaltiges Journal (Z. 891, 3092) → Aufgabe 0015 |
| `BuchungssatzEditor.dc.html` | 761 | zweiter Entwurf desselben Editors (F109) — der gebaute stammt aus F123 | Gegenkonto bearbeitbar → 0015 · `flash`/`quickBanner` → 0007 |
| `Buchungseditor-Zustände.dc.html` | 276 | 20+ benannte Zustände (S1…S20+) — die Quelle für die Story-Liste des Editors | — |
| `Tabellen-Bausteine.dc.html` | 365 | `Table`, `Cells`, `ExpandableRow`, `FilterChips` (11 Sektionen) | Paginierung (Sektion 5) liegt noch in `legacy/` |
| `StapelSeite.dc.html` | 931 | — | ganz offen; nutzt mit 12 `x-import` den Bestand am stärksten, deshalb der billigste nächste Einstieg |
| `KIBuchungshinweise.dc.html` | 165 | `entities/journal-entry/AiBookingNotes.tsx` | Story fehlt (`docs/v3-backlog.md`) |
| `PruefChecklist.dc.html` | 82 | `patterns/Review.tsx` → `Checklist` | — |
| `AbgleichListe.dc.html` | 28 | Canvas-Hilfsmittel, kein DS-Stoff | — |
| `ScenarioPicker.dc.html` | 20 | Canvas-Hilfsmittel, kein DS-Stoff | — |

**Zwei Arten von Artboard** (geprüft 2026-09-03): die Screens bringen ihre
Daten mit und laufen vollständig — `Buchungsreview` rendert alle elf Schritte,
`BuchungssatzEditor` einen ausgerechneten Satz samt Steuerzeile. Die
Komponenten-Artboards (`PruefChecklist`, `KIBuchungshinweise`,
`AbgleichListe`, `ScenarioPicker`) erwarten Props vom Canvas-Host und zeigen
nur ihr Gerüst: Raster, Spalten, Wortlaut, keine Zeilen. Das ist kein Fehler.

**Was die Lieferung über sich selbst verrät:** aus dem mitgegebenen
`_ds`-Bundle benutzt sie nur `Badge` (8×) und `Button` (7×) — alles andere ist
handgeschriebenes Inline-CSS auf Tokens. Eine Maß-für-Maß-Übernahme wäre
deshalb keine Designentscheidung, sondern Zufall des Zeichnens. Übernommen
wird, was der Brief als Prinzip begründet (§3), nicht jedes `padding`.
