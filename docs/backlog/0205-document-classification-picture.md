# 0205 · Einordnung des Belegs — `ClassificationCell`, `ClassificationBox`, `ClassificationDialog`

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-27; fremde Abnahme steht aus |
| Stufe | `entities/source-document/` (`Classification.tsx`) · Zeichen-Vokabular `CATEGORY_ICON` in `Icons.tsx` · Showcase `src/showcase/document-classification/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Belegkategorie, Richtung × Charakter, Sammel-PDF — Entitäts-Form des Belegs |
| Quelle | Design-Brief **F308** (`app/docs/backlog/F308-document-classification-picture-design-brief.md`, Owner 2026-09-27 über ll-senior) · Bauart 0204 |
| Ersetzt | `SourceDocumentClass` (Badge-Kette) in der Spalte „Einordnung" und im Kopf der Belegseite · Spalten `kind`, `form` in den Spaltensets · `ClassificationEditor` im Eingang (App) |
| Blockiert | App F309 (Ableitung `ClassificationPicture`, Spaltensets, Belegseite, `overrideInboxClassification`) |
| Spec von / am | Claude, 2026-09-27 |

## Ziel

Die Sachbearbeiterin liest an einer Stelle, **was** der Beleg ist, **wie** er
wirkt und **wozu** er gehört — statt aus drei Spalten mit vier Badges und drei
(i). Ein Klick erklärt, warum Ludwig so entschieden hat, was es sonst hätte
sein können, und lässt sie korrigieren.

## Einordnung

- **Wiederverwenden:** die Bauart von 0204 (ein View-Model, Zelle · Box ·
  Dialog · Trigger), `Dialog`, `Disclosure`, `Select`, `Button`, `Banner`,
  `StateIcon`, `ActionIcon edit`, `StatusInfoButton`.
- **Neu (Regel §3.5 Entitäts-Form):** die Familie `Classification*` — keine
  Verallgemeinerung von `ProcessPicture`: die Einordnung hat keine Phasen,
  keinen Träger, keinen Stand; gemeinsam ist nur die Bauart.
- **Neues Vokabular:** `CATEGORY_ICON` — fünf Kategorien + „ohne", je
  Zeichen, Wort, Bedeutung; kein Zeichen, das schon etwas anderes meint
  (`Receipt` ist der Beleg selbst). **Owner-Frage** (F308 §8), gebaut mit
  Vorschlag: Leistungsbeleg `FileText` · Zahlungsbeleg `Banknote` ·
  Nachweisbeleg `ScrollText` · Interner Beleg `FileUser` · Auswertung
  `ChartColumn` · ohne Kategorie `File`.
- **Spaltensets:** `kind` und `form` fallen aus allen Sets; die eine Spalte
  „Einordnung" zeigt die Zelle, sobald der Aufrufer `classificationPicture`
  übergibt (App F309); bis dahin die alte Badge-Kette.

## Die Form der Zelle (F308 Owner-Entscheid 1: „das Set probiert und entscheidet")

Vier Varianten mit allen 20 Fixtures nebeneinander — Showcase
`Seiten/Beleg-Einordnung › CellVariants`:

| Variante | Aufbau | Befund am Bild |
|---|---|---|
| A | Form in Zeile 1, Wirkung · Verbund darunter | bei Rechnungen (rund 80 %) steht achtmal „Rechnung" vorn; der Unterschied, der zählt (Eingang/Ausgang), steht grau darunter |
| B | „Form · Wirkung" in einer Zeile | „Rechnung · Eingangsrechnung" sagt es zweimal; lange Paare kürzen die Wirkung weg |
| C | Wirkung vorn, Form darunter | stuft auch „Tankquittung", „Bewirtungsbeleg" zurück — die Formen, die steuerlich zählen |
| **D** | **das aussagekräftigste Wort vorn**: die Wirkung, wo die Form nur die schlichte „Rechnung" ist, sonst die Form; darunter der Rest (Wirkung, Verbund) | Rechnungen einzeilig („Eingangsrechnung"), Sonderformen behalten ihr Wort („Tankquittung / Eingangsrechnung"), kein Wort doppelt |

**Entschieden: D.** Die App setzt dafür `identity.generic` (heute: Form
`invoice`); die Zelle liest es nur. Höchstens zwei Zeilen; `narrow`: nur Zeile 1,
der Rest im zugänglichen Namen. Box und Dialog zeigen immer alle drei Fragen.

## Schnittstelle

### `ClassificationPicture`

| Feld | Typ | Bedeutung |
|---|---|---|
| `identity` | `{ category: DocCategoryKey; word: string; warning?: string; generic?: boolean }` — `generic`: die Form sagt nicht mehr als ihre Wirkung, die Zelle führt mit der Wirkung (D) | Wort der Belegform (unbekannter Schlüssel als Rohwort, von der App); `warning` = Satz, wenn Ludwig nicht einordnen konnte oder die Werte sich widersprechen |
| `effect` | `{ word: string }?` | fehlt = nicht anwendbar |
| `bundle` | `{ role: "part" \| "cover" \| "bundle" \| "superseded" \| "attachment"; word: string; href?: string }?` | fehlt = kein Verbund |
| `corrected` | `{ at: string; by: string \| null }?` | ein Mensch hat entschieden — Stift nach dem Wort |

### `ClassificationDialogDetail`

| Feld | Typ | Bedeutung |
|---|---|---|
| `title` | `string` | Belegname |
| `sections` | `{ key: "identity" \| "effect" \| "bundle"; why: string; quote?: string; alternatives: { value; label }[] }[]` | je Frage: warum, Zitat des Klassifikators, was es sonst hätte sein können |
| `correction` | `{ forms: { value; label; category }[]; directions: { value; label }[]; current: { form; direction }; blockedReason?: string; onSave(next): Promise<void> }?` | fehlt = keine Korrektur |
| `technical` | `{ label; value }[]` | nur unter „Technisch" |

### Komponenten

| Export | Props | Nachweis |
|---|---|---|
| `ClassificationCell` | `picture`, `density?`, `onOpen?` | Showcase `AllCells`, `CellVariants`, `CellNarrow` |
| `ClassificationBox` | `picture`, `onOpen?` | Showcase `AllBoxes`, `HeadWithBoth` |
| `ClassificationDialog` | `open`, `onClose`, `picture`, `detail` | Showcase `AllDialogs`, `DialogCorrection`, `DialogBlocked`, `DialogSaveError`, `DialogWarning` |
| `ClassificationTrigger` | `picture`, `detail`, `size`, `density?` | Showcase `AllCells`, `AllBoxes` |
| `CategoryIcon` / `CATEGORY_ICON` | `category` | `Grundlagen/Icons › Categories` |
| `sourceDocumentColumns({ classificationPicture })` | `(d) => { picture; detail } \| null` | Showcase `AllCells` (Tabelle) |

**Nicht (bewusst):** leitet nichts ab (Wörter, Rolle, Warnung kommen von der
App); korrigiert Charakter und Verbund nicht (kein Kern); die Box verlinkt den
Verbund nicht selbst — sie ist ein Knopf, der Link steht im Dialog.

## Verhalten

- Farbe kodiert nichts (A7); nur `identity.warning` setzt das Zeichen der Stufe
  Warnung vor das Wort, mit dem Satz im Dialog.
- Zelle und Box sind ein Klickziel (≥ 24 px), Enter öffnet, Esc schließt, Fokus
  zurück (aus `Dialog`).
- Box: Beschriftete Zeilen „Beleg", „Wirkung", „Verbund", ohne Rahmen wie die
  Prozess-Box; steht **unter** der Prozess-Box in derselben rechten Spalte
  (Kopf-Regel: rechts, wo es steht — Einordnung gehört zum „was", aber ist
  wie der Stand ein abgeleitetes Bild und öffnet einen Dialog).
- Dialog: je Frage Abschnitt mit Zeichen, Wort, „Warum", Zitat, „Sonst
  möglich"; „Einordnung korrigieren" klappt das Formular auf (Form gruppiert
  nach Kategorie, Richtung); Speichern läuft → Knopf gesperrt; Erfolg → Satz
  „Ludwig liest den Beleg mit der neuen Einordnung noch einmal." (`role=status`);
  Fehler → `Banner` „Nicht gespeichert", Eingabe bleibt. Gesperrt → Grund
  statt Formular. „Technisch" zu.

## Stories

Showcase `Seiten/Beleg-Einordnung`: `CellVariants` (D/A/B/C), `AllCells`, `CellNarrow`, `AllBoxes`, `HeadWithBoth` (Kopf mit Prozess- und Einordnungs-Box), `AllDialogs`, `DialogCorrection` (Speichern läuft ~1 s, dann Satz), `DialogBlocked`, `DialogSaveError`, `DialogWarning`. `Grundlagen/Icons › Categories`.

## Offene Fragen (Owner)

1. **Zeichen der fünf Kategorien** — Vorschlag oben. Ohne Antwort: so.
2. **Box neben oder unter der Prozess-Box?** Ohne Antwort: darunter.
3. **Zeile 2 bei `narrow`?** Ohne Antwort: entfällt, steht im zugänglichen Namen.

## Abnahmekriterien

Fest: typecheck, build, englischer Code, `@when`/`@instead`, kein Hex/px in TSX, Stories, §9, im Browser angesehen.

Variabel:
- [ ] Jedes Fixture aus F308 §7 in Zelle, Box und Dialog
- [ ] Unbekannter Form-Schlüssel steht als Rohwort (Fixture 19)
- [ ] Keine Farbe außer Warnung; Stift bei korrigiert (Fixture 18)
- [ ] Zelle höchstens zwei Zeilen; Zeilenhöhe der Liste einheitlich
- [ ] Korrektur: offen · gesperrt · speichert · Fehler · Erfolg
- [ ] Technik nur im Aufklapper
- [ ] Spaltensets ohne `kind`/`form`, eine Spalte „Einordnung" mit einem (i)

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |
