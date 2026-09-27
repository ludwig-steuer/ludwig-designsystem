# 0205 · Einordnung des Belegs — `ClassificationCell`, `ClassificationBox`, `ClassificationDialog`

| | |
|---|---|
| Status | fertig — gebaut 2026-09-27; fremde Abnahme 2026-09-27 bestanden nach Nacharbeit `a465ca1` (M1–M4 nachgeprüft) |
| Stufe | `entities/source-document/` (`Classification.tsx`) · Zeichen-Vokabular `CATEGORY_ICON` in `Icons.tsx` · Showcase `src/showcase/document-classification/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Belegkategorie, Richtung × Charakter, Sammel-PDF — Entitäts-Form des Belegs |
| Quelle | Design-Brief **F308** (`app/docs/backlog/F308-document-classification-picture-design-brief.md`, Owner 2026-09-27 über ll-senior) · Bauart 0204 |
| Ersetzt | `SourceDocumentClass` (Badge-Kette) in der Spalte „Einordnung" und im Kopf der Belegseite · Spalten `kind`, `form` in den Spaltensets · `ClassificationEditor` im Eingang (App) |
| Blockiert | App F309 (Ableitung `ClassificationPicture`, Spaltensets, Belegseite, `overrideInboxClassification`) |
| Spec von / am | Claude, 2026-09-27 |
| Abgenommen von / am | fremder Abnahme-Agent, 2026-09-27 |

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

~~Entschieden vom Set: D.~~ **Entschieden vom Owner (2026-09-27): A** — Form in Zeile 1, Wirkung · Verbund in Zeile 2. Der Vergleich (Story `CellVariants`) ist danach entfernt, `identity.generic` entfällt. Höchstens zwei Zeilen; `narrow`: nur Zeile 1, der Rest im zugänglichen Namen. Box und Dialog zeigen jede **zutreffende** Frage; eine fehlende Zeile heißt „nicht anwendbar" (F308 §3).

## Schnittstelle

### `ClassificationPicture`

| Feld | Typ | Bedeutung |
|---|---|---|
| `identity` | `{ category: DocCategoryKey; word: string; warning?: string }` | Wort der Belegform (unbekannter Schlüssel als Rohwort, von der App); `warning` = Satz, wenn Ludwig nicht einordnen konnte oder die Werte sich widersprechen |
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
| `ClassificationCell` | `picture`, `density?`, `onOpen?` | Showcase `AllCells`, `CellNarrow` |
| `ClassificationBox` | `picture`, `onOpen?` | Showcase `AllBoxes`, `HeadWithBoth` |
| `ClassificationDialog` | `open`, `onClose`, `picture`, `detail` | Showcase `AllDialogs`, `DialogCorrection`, `DialogBlocked`, `DialogSaveError`, `DialogWarning` |
| `ClassificationTrigger` | `picture`, `detail`, `size`, `density?` | Showcase `AllCells`, `AllBoxes` |
| `CategoryIcon` / `CATEGORY_ICON` | `category`, `size?` (Icon-Leiter, Vorgabe 16) | `Grundlagen/Icons › Categories` |
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

Showcase `Seiten/Beleg-Einordnung`: `AllCells` (echte Liste: `DataTable` + `sourceDocumentColumns({ classificationPicture })`), `CellList`, `DialogWithoutCorrection`, `DialogUnknownForm`,, `CellNarrow`, `AllBoxes`, `HeadWithBoth` (Kopf mit Prozess- und Einordnungs-Box), `AllDialogs`, `DialogCorrection` (Speichern läuft ~1 s, dann Satz), `DialogBlocked`, `DialogSaveError`, `DialogWarning`. `Grundlagen/Icons › Categories`.

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

Gemessene Abnahme am Stand `0e33672` (Variante A), Playwright bei 1280 px,
Storybook :6107. Punkte zu Variante D und `CellVariants` sind mit dem
Owner-Entscheid A gegenstandslos.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| typecheck | `pnpm typecheck` Exit 0 | ✓ |
| build | `pnpm build` (Storybook, Ausgabe außerhalb des Repos) Exit 0 | ✓ |
| Englischer Code | `pnpm check:language` „0 German comment lines"; Bezeichner, CSS-Klassen `cl-*`, Story-Exporte englisch; Deutsch nur in Strings und Story-Beschreibungen | ✓ |
| `@when`/`@instead` | an `ClassificationCell`, `ClassificationBox`, `ClassificationDialog`, `ClassificationTrigger`, `CategoryIcon`; `pnpm check:when` Exit 0 | ✓ |
| Kein Hex/px in TSX | `Classification.tsx`, Showcase: kein Hex, kein px; Maße über `var(--space-*)`; Icon-Größen 12/14/16 aus der Leiter; `pnpm check:icons`, `check:classes`, `check:contrast` Exit 0 | ✓ |
| Stories | 9 Stories `seiten-beleg-einordnung--*` + `v3-grundlagen-icons--categories` rendern, keine Konsolenfehler aus den Bausteinen; **aber** Story-Deckung lückenhaft, siehe M3 | ✗ |
| §9 Prüfliste | Text links ✓, Farbe nur Stufe ✓, Icon nie ohne Wort ✓, Hover (Unterstreichung Zelle, Fläche Box) ✓, Karte ✓, `min-width: 0` ✓; **Zeilenhöhe (V1) ✗** (M1); fünf Zustände weder gezeigt noch begründet (M3) | ✗ |
| Im Browser angesehen | alle Stories bei 1280 px; Screenshot Kopf mit Prozess- und Einordnungs-Box: Box unter der Prozess-Box, rechts | ✓ |
| Jedes Fixture aus F308 §7 in Zelle, Box und Dialog | `all-cells`: 20 Zellen; `all-boxes`: 20 Boxen; alle 20 Dialoge per Klick geöffnet und gelesen | ✓ |
| Unbekannter Form-Schlüssel als Rohwort (Fixture 19) | Zelle, Box, Dialog zeigen `psp_settlement`; einziges Rohwort außerhalb „Technisch" | ✓ |
| Keine Farbe außer Warnung; Stift bei korrigiert (18) | Text 45/45/45, Zeile 2 und Zeichen 92/92/92, Warnzeichen nur in 15 und 20 (Stroke 140/96/30); Stift in 18 grau mit Wort „korrigiert" (v2vh) und `title`; Blau nur an Link/TextButton (Interaktion), Rot nur im Fehlerbanner (Stufe Fehler) | ✓ |
| Kontraste | Text 13,77:1; Zeile 2 6,69:1; Kategoriezeichen 6,69:1; Warnzeichen 5,52:1; Box-Beschriftung 4,51:1 (knapp, auf `--color-bg-soft`); Fokusring 3,28:1 | ✓ |
| Trefferflächen | Zelle 24 px hoch (68–192 px breit); Box ≥ 27 px hoch, 403 px breit; Selects 32,5 px; „Einordnung speichern" 30,2 px | ✓ |
| Tastatur | Tab erreicht die Zelle, Fokusring 2 px sichtbar (`:focus-visible`); Enter öffnet den Dialog, Fokus im Dialog; Esc schließt, Fokus zurück auf der Zelle | ✓ |
| Zelle höchstens zwei Zeilen | Zelle 24,0 px (eine Zeile) oder 38,2 px (zwei Zeilen), nie mehr; `cell-narrow` alle 24,0 px, Rest im zugänglichen Namen | ✓ |
| Zeilenhöhe der Liste einheitlich | `all-cells`: Zeilen **50,9 px** (Fälle 10–16, 19) neben **63,2 px** (1–9, 17, 18, 20) — zwei Höhen in einer Liste | ✗ M1 |
| Korrektur: offen | `dialog-correction`: „Einordnung korrigieren" klappt auf; Belegform in 6 Gruppen nach Kategorie, Richtung mit „nicht anwendbar" | ✓ |
| Korrektur: gesperrt (Fall 10) | `dialog-blocked`: „**Korrektur hier nicht möglich.** Die Umsätze …", kein Formular, kein Knopf | ✓ |
| Korrektur: speichert (Fall 18) | Knopf „Wird gespeichert …" gesperrt, beide Selects gesperrt, „Abbrechen" weg; Dauer gemessen 916 ms | ✓ |
| Korrektur: Fehler | `dialog-save-error`: Banner „Nicht gespeichert" mit Satz, Auswahl (`fuel_receipt`) erhalten, Speichern wieder frei, „Abbrechen" da | ✓ |
| Korrektur: Erfolg | `role=status`: „Gespeichert. Ludwig liest den Beleg mit der neuen Einordnung noch einmal." | ✓ |
| Korrektur: Vorbelegung | Fall 15 (`unknown`) und 19 (`psp_settlement`): Belegform zeigt still „Rechnung" als gewählt, der Zustand hält den Rohschlüssel | ✗ M2 |
| Technik nur im Aufklapper | alle 20 Dialoge: `<details>` zu; außerhalb kein Rohwert (`snake_case`) außer dem gewollten Rohwort in 19; aufgeklappt stehen die neun Rohwerte | ✓ |
| Spaltensets ohne `kind`/`form`, eine Spalte „Einordnung" mit einem (i) | Code: `DOCUMENT_LIST_COLUMNS`, `INBOX_COLUMNS`, `SUBMIT_COLUMNS`, `STUCK_COLUMNS` ohne `kind`/`form`; `headerAside` nur `document_category`. **Keine Story** zeigt `sourceDocumentColumns({ classificationPicture })` — `AllCells` baut eine eigene `Table` | ✗ M3 |
| Aufrufer der Spaltensets | Repo: nur `source-document-columns.stories.tsx` (bricht nicht). App: `documents/page.tsx`, `StapelDetailScreen.tsx` nutzen `DOCUMENT_LIST_COLUMNS` — kompiliert weiter, verliert die Spalte „Belegart" | ✓ |
| Spec = Code | Schnittstellen `ClassificationPicture`, `ClassificationDialogDetail`, Komponenten-Props stimmen; Abweichungen siehe M4 | ✗ M4 |

### Mängel

- **M1 · Zeilenhöhe** — `src/styles/v3.css` `.cl-cell` (kein Mindestmaß für
  zwei Zeilen). In einer Liste stehen Zeilen mit 50,9 und 63,2 px (V1, 0070
  M1); mit Variante A haben 12 der 20 Fälle zwei Zeilen, der Rest eine.
  Die Zelle muss im `regular`-Modus zwei Zeilen reservieren (oder die Spec
  benennt die Ausnahme mit Owner und Datum).
- **M2 · Stille Vorbelegung in der Korrektur** — `Classification.tsx`,
  `Correction`: `<Select value={form}>` ohne Option für einen Schlüssel, den
  `forms` nicht kennt. Bei „Unbekannt" (15) und einer kommenden Form (19)
  zeigt das Feld „Rechnung", obwohl nichts gewählt ist — gerade dort, wo
  korrigiert werden soll. Es braucht eine leere Wahl („Bitte wählen") oder
  den Rohschlüssel als eigene Option; Speichern erst nach einer Wahl.
- **M3 · Story-Deckung** — `DocumentClassification.stories.tsx`: keine Story
  für `sourceDocumentColumns({ classificationPicture })` (die Spec nennt
  `AllCells` als Nachweis, die nutzt die Spaltenoption nicht); keine Story
  für den Dialog **ohne** `correction` (F308 §7 „mit/ohne Korrektur");
  `AllDialogs` ist dieselbe Darstellung wie `AllCells`; die fünf Zustände
  (leer, lädt, Fehler der Zelle) sind weder gezeigt noch als ausgeschlossen
  begründet.
- **M4 · Spec ≠ Code** — Spec-Tabelle „Komponenten": `CategoryIcon` hat im
  Code zusätzlich `size?`. Satz „Box und Dialog zeigen immer alle drei
  Fragen" widerspricht Code und F308 §3 (fehlende Zeile = nicht anwendbar;
  die Box lässt „Wirkung"/„Verbund" weg, der Dialog zeigt nur Abschnitte aus
  `sections`).

### Nebenbefunde (kein Abnahmegrund)

- `source-document-columns.tsx`: veraltete Kommentare — „Four axes stand in
  this cell; one (i) would explain one of them" und die 232-px-Begründung mit
  zwei Badges; JSDoc über `SUBMIT_COLUMNS` und die Story `Submit` sagen noch
  „die zweite Spalte ist die Belegform", jetzt ist es „Einordnung" (ohne
  `classificationPicture` die alte Badge-Kette).
- Das eine (i) im Spaltenkopf erklärt nur die Achse `document_category`,
  nicht den Aufbau des Bildes (F308 §4.1).
- `TextButton` „Einordnung korrigieren" misst 724 × 21 px — unter 24 px hoch
  (Primitive, Abstandsausnahme WCAG 2.5.8 greift); und er spannt die ganze
  Dialogbreite.
- Box-Beschriftung 4,51:1 liegt auf der Kante; eine dunklere Stufe gäbe
  Reserve.

**Nacharbeit 2026-09-27 (Bauer), zur Nachprüfung:**
M1 — Zeile 2 hält in `regular` immer ihre Höhe (leer = geschütztes Leerzeichen, `aria-hidden`); alle Zeilen der Liste gleich hoch.
M2 — keine stille Vorbelegung: ist die aktuelle Form nicht in der Liste (unbekannt, neuer Schlüssel), startet das Feld leer mit „Belegform wählen", Speichern erst nach einer Wahl (Story `DialogUnknownForm`).
M3 — `AllCells` ist jetzt die echte Liste (`DataTable`, `DOCUMENT_LIST_COLUMNS`, `classificationPicture`); `CellList` die einfache; `AllDialogs` je Fall ein Knopf; neu `DialogWithoutCorrection`. **Zustände:** gefüllt = alle Stories; lädt und Fehler gehören der Liste (`DataTable` zeigt Skelett bzw. Fehlerzeile) und dem Kopf der Seite — das Bild wird mit der Zeile abgeleitet, es lädt nicht selbst; leer gibt es nicht (jeder Beleg hat eine Identität, notfalls „Unbekannt"); leer nach Filter gehört der Liste.
M4 — Spec = Code: `CategoryIcon size?`; „jede zutreffende Frage".
Nebenbefunde: JSDoc `SUBMIT_COLUMNS` nachgezogen. Offen und benannt: das (i) im Spaltenkopf erklärt die Kategorie-Achse, nicht den Aufbau des Bildes (Ausbau: eigener Erklär-Popover, wenn die Kanzlei danach fragt); `TextButton` 21 px (Primitive, set-weit).

### Nachprüfung 2026-09-27 (fremder Abnahme-Agent, Stand `a465ca1`, 1280 px)

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M1 Zeilenhöhe | `seiten-beleg-einordnung--all-cells` (echte `DataTable`, `DOCUMENT_LIST_COLUMNS`): 19 Zeilen 62,0 px, letzte 61,0 px (ohne untere Linie); jede Zelle 37,0 px; `cell-list` ebenso 62,0/61,0 | ✓ |
| M2 Stille Vorbelegung | `dialog-unknown-form` (Fall 19) und Fall 15 aus `all-cells`: Feld zeigt „Belegform wählen" (Option gesperrt, Wert leer), „Einordnung speichern" gesperrt; nach Wahl (`other`) frei | ✓ |
| M3 Story-Deckung | `all-cells` mit `classificationPicture`: Köpfe Gegenpart · Betrag · Belegdatum · Sachverhalt · Ludwig-Eingang · Einordnung · Status, kein „Belegart"/„Belegform", ein (i); Klick auf die Zelle öffnet den Dialog, URL bleibt; `cell-list` 20 Zellen; `all-dialogs` 20 Knöpfe („1 · Normale Eingangsrechnung" …), ≥ 30 px, öffnen den Dialog; `dialog-without-correction` (Fall 8): drei Abschnitte, kein „Korrigieren", „Technisch" da; Zustände in der Spec begründet | ✓ |
| M4 Spec = Code | Spec: `CategoryIcon` `category`, `size?`; „jede **zutreffende** Frage" (F308 §3); Code stimmt | ✓ |
| Wächter | `pnpm typecheck` Exit 0, `check:language` ok, `check:icons` in Ordnung | ✓ |

Ergebnis: alle Kriterien bestanden — Status `fertig`. Offen und benannt
bleiben die Nebenbefunde (i) im Spaltenkopf und `TextButton` 21 px.
