# 0204 · Prozessbild in drei Größen — `ProcessCell`, `ProcessBox`, `ProcessDialog`

| | |
|---|---|
| Status | fertig — fremde Abnahme 2026-09-27 bestanden nach Nacharbeit M1–M4 (`7dd5d35`) |
| Stufe | `patterns/` (Familie Process, `patterns/Process.tsx` + `patterns/ProcessPicture.tsx`) · Showcase `src/showcase/document-process/` für die Szenarien |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: ein Vorgang mit Phasen, einem Träger und einem nächsten Schritt; Phasen, Wörter und Wege kommen als Daten |
| Quelle | Design-Brief **F305** (`app/docs/backlog/F305-document-process-picture-design-brief.md`, Owner 2026-09-27 über ll-cto2) · Präzedenz 0137, 0203 |
| Ersetzt | App `DocProcessingProgress` (Inline-Styles, „läuft seit") · Status-Spalte der Belegliste (O3, Owner offen) — die App schließt in einer eigenen F-Spec an |
| Blockiert | die App-Ableitung `document-process.ts` und Spalte/Box/Dialog in der App (F305 §9) |
| Spec von / am | Claude, 2026-09-27 |

## Ziel

Die Sachbearbeiterin sieht an drei Stellen dieselbe Antwort auf die Frage:
**wie weit ist der Beleg, wer ist dran, was folgt**. In der Belegliste als
Zelle, im Kopf der Beleg-Detailseite als Box, auf Klick als Dialog mit dem Weg
der Belegart, den Schritten, dem Verlauf und — zugeklappt — der Technik. Heute
liest sie dafür bis zu sieben Achsen.

## Einordnung

- **Wiederverwenden:** `ProcessMini` (Segmente, feste Gesamtbreite 64 px —
  zwei bis fünf Segmente teilen sie sich schon), `ProcessStepper` (Phasen groß
  im Dialog), `Baton` (Träger mit Zeichen und Wort), `Dialog`, `LogList`,
  `Disclosure`, `StateIcon`, `ErrorRow`, `Link`.
- **Erweitert (Regel §3.2), je eine Designentscheidung, die wiederkommt:**
  1. `ProcessPhaseStatus` + **`held`** — die Phase steht und hängt (Stufe
     Warnung). Keine neue Kritikalitätsstufe: Warnung gibt es. Beim Stapel
     bleibt der Wert ungenutzt, bis ein Stapel hängen kann.
  2. `ProcessPhase.note?: string` — das Wort unter einer Phase, die hängt oder
     gescheitert ist („Werte fehlen"). Ohne `note` steht das Wort der Stufe
     („Warnung", „Fehler") wie seit 0203.
  3. `BatonKey` + **`processing`** (zuerst `ludwig`, umbenannt nach Owner-Entscheid 2026-09-27) — das System als Träger, Zeichen `job`
     (Verarbeitung). Wort „Ludwig": Ludwig spricht in der dritten Person
     (CLAUDE.md, Sprache), also ist Ludwig auch der, der arbeitet.
  4. `EntityHeader.processPlacement?: "row" | "start" | "end"` — die Box
     links unter dem Titelblock oder rechts neben Kennzahl und Aktionen; `row`
     (Vorgabe) ist die Zeile aus 0137.
- **Neu (Regel §3.4), weil eigener Zustand bzw. eigener Tastaturweg:**
  `ProcessCell` (ein Klickziel, öffnet den Dialog), `ProcessBox` (dito),
  `ProcessDialog` (Bereiche, Technik zugeklappt, Verlauf mit drei Fällen).
  Die drei Größen teilen **ein** View-Model `ProcessPicture`.
- **Zuschnitt:** Familie. Die Typen und `held`/`ludwig`/`note` in
  `Process.tsx`; die drei neuen Exporte in `ProcessPicture.tsx`, weil sie
  `"use client"` brauchen (Klick, Dialog) und `Process.tsx` serverfähig bleibt.
- **Nicht genommen:** `StatusInfoDialog` erklärt die **Achse**, nicht die Lage
  **dieses** Belegs; die Technik des Dialogs verweist dorthin.

### Die drei Form-Entscheide aus F305 §5

| Frage | Entscheid | Grund |
|---|---|---|
| Phasen-Status „hängt" neben `failed` | fünfter Wert `held` von `ProcessPhaseStatus`, Farbe `--color-warning`, Zeichen `StateIcon warning`, Wort aus `note` | eine Kette, ein Typ; ein zweiter Mechanismus („failed mit Stufe") hieße zwei Wahrheiten über dieselbe Frage |
| Träger „Ludwig" (System) | `BatonKey` `ludwig`, Zeichen `EntityIcon job` | das System arbeitet sichtbar (Auslesen, Import); „niemand" wäre falsch, „Agent" auch |
| Badge `document_status` neben der Box | **entfällt**, sobald die Box steht (D7, 0137) | Box und Badge beantworten dieselbe Frage; die Achse bleibt über den Dialog (Technik → Achse) erreichbar |

## Schnittstelle

### Typen (`Process.tsx`)

| Name | Typ | Bedeutung | Nachweis |
|---|---|---|---|
| `ProcessPhaseStatus` | `"done" \| "active" \| "held" \| "failed" \| "pending"` | `held` neu | `Process › Held`, Szenarien S03, S04 |
| `ProcessPhase.note` | `string?` | Wort unter einer Phase `held`/`failed` | `Process › Held` |
| `ProcessPhase.sub`, `.states` | wie bisher; `states` optional-leer erlaubt | die Belegphasen haben keine Rohzustände | — |
| `BatonKey` | + `"ludwig"` | Träger System | `Process › Holders` |

### `ProcessPicture` (View-Model, `ProcessPicture.tsx`)

| Feld | Typ | Pflicht | Zelle | Box | Dialog |
|---|---|---|---|---|---|
| `phases` | `ProcessPhase[]` (0–6; 0 = kein Bild, z. B. gelöscht) | ja | ✓ | ✓ | ✓ |
| `headline` | `string` — Stand-Wort aus der Registry | ja | ✓ | ✓ | ✓ |
| `level` | `"none" \| "info" \| "warning" \| "error"` | ja | Zeichen | Zeichen | Zeichen |
| `holder` | `BatonMeta` | ja | ✓ (nicht bei `narrow`) | ✓ | ✓ |
| `running` | `{ since: string; live?: boolean } \| null` — `since` formatiert („seit 40 s") | nein | — | ✓ | ✓ |
| `next` | `string \| null` — „Danach: …" ohne das Wort „Danach" | nein | — | ✓ | ✓ |

### `ProcessDialogDetail` (nur Dialog)

| Feld | Typ | Bedeutung |
|---|---|---|
| `title` | `string` | Belegname |
| `pathLabel` | `string` | „Weg einer Rechnung" — kommt fertig, das Set kennt keine Grammatik |
| `explanation` | `string` | Satz zum Stand (Registry-`description`) |
| `reason` | `string?` | Label des Grunds (held/failed) |
| `note` | `string?` | Freitext bis 300 Zeichen (Grund-Notiz oder Erledigt-Begründung) |
| `end` | `string?` | Ende in Worten (`done_via`), bei erledigt |
| `phaseSince` | `Record<string,string>?` | wie `ProcessStepper` |
| `steps` | `{ phase: string; label: string; status: ProcessPhaseStatus; at?: string; actor?: string; note?: string; sub?: {label; status}[] }[]` | alle Schritte des Wegs |
| `loops` | `{ reopened?: number; returned?: number }?` | gezählte Schleifen, eigene Wörter („wieder geöffnet", „zurückgegeben") — nicht die des Stapels |
| `history` | `LogEntry[] \| "error"` | gefüllt · leer · Ladefehler |
| `historyHref` | `string?` | „Zum Verlauf" |
| `technical` | `[string, string][]` | Rohwerte, nur hier (T4) |
| `axis` | `ReactNode?` | Verweis auf die Achse — der Aufrufer setzt `StatusInfoButton` ein |
| `links` | `{ label: string; href: string }[]?` | Wege hinaus; ohne sie kein Fuß |
| `onRetryHistory` | `() => void?` | Retry beim Ladefehler |

### Komponenten

| Export | Props | Nachweis |
|---|---|---|
| `ProcessCell` | `picture`, `density?: "regular" \| "narrow"`, `onOpen?` (fehlt = nicht klickbar), `loading?`, `error?: string` | `ProcessPicture › Cells`, `CellNarrow`, `CellStates`, `NotInteractive` |
| `ProcessBox` | `picture`, `onOpen?` | `ProcessPicture › Boxes`, Showcase `BoxStart`/`BoxEnd` |
| `ProcessDialog` | `open`, `onClose`, `picture`, `detail`, `technicalOpen?` (Technik von Beginn an offen, für den Support) | `ProcessPicture › Dialog*`, Showcase `AllDialogs` |
| `ProcessPictureTrigger` | `picture`, `detail`, `size: "cell" \| "box"`, `density?` — Zelle oder Box mit ihrem Dialog, hält den offenen Zustand | Showcase `AllCells`, `AllBoxes`, `Keyboard` |
| `EntityHeader.processPlacement` | `"row" \| "start" \| "end"` | Showcase `BoxStart`, `BoxEnd` |

**Nicht (bewusst):** rechnet keine Phase, keinen Weg, kein Wort (die App,
`document-process.ts`); lädt den Verlauf nicht (Retry ist ein Callback);
animiert nichts (ein laufender Job ist ein Wort mit Zeit, keine Bewegung —
`prefers-reduced-motion` ist damit gegenstandslos).

## Verhalten

- **Zelle:** eine Zeile, feste Breite: Segmente 64 px · Zeichen (nur bei
  Warnung/Fehler) · Stand-Wort · „·" · Träger. Wort und Träger kürzen mit
  Ellipse, der volle Text steht im zugänglichen Namen und im `title`. Ist
  `onOpen` gesetzt, ist die ganze Zelle ein `<button>` (≥ 24 px hoch), Hover
  wie `TextButton`, Enter/Space öffnet. Ohne `onOpen` kein Hover, kein Fokus.
  `narrow` lässt den Träger weg. Ohne Phasen (gelöscht) steht „—" statt der
  Segmente.
- **Box:** 3 Zeilen, Mindesthöhe immer 3 Zeilen (zweizeilig = dritte Zeile
  leer, der Kopf springt nicht). Zeile 1 Phasen mit Wort (kompakter Stepper,
  jede Phase gleich breit), Zeile 2 Zeichen · Stand-Wort · Träger · „seit …"
  (`aria-live="polite"`, wenn `running.live`), Zeile 3 „Danach: …" einzeilig
  gekürzt. Breite `--pz-box` = `24rem` (384 px, ≈ 30 % des Kopfs bei 1280 px); rechts schrumpft sie mit, bei zu wenig Platz rutscht sie unter den Titel. Klick
  wie Zelle.
- **Dialog:** `Dialog size="lg"`, Titel = Belegname, Kicker = `pathLabel`.
  Bereiche in dieser Reihenfolge: Phasen (`ProcessStepper`) · Jetzt (Stand,
  Träger, Erklärung; bei `reason` Grund fett + Notiz; bei `end` Ende +
  Begründung) · Danach · Schritte (Liste mit Zeichen, Zeit, Akteur;
  Unterschritte eingerückt) · Verlauf (gefüllt / leer mit Verweis /
  `ErrorRow` mit Retry) · Technik (`Disclosure`, zu) · Wege hinaus (Fuß).
  `Esc` schließt, Fokus zurück zum Auslöser (aus `Dialog`).
- Zeichen je Stufe: `level` warning → `StateIcon warning`, error →
  `StateIcon error`; Farbe nie allein.

## Stories

Pattern-Stories (`v3/Patterns/Prozess/ProcessPicture`, generische Daten):

| Story | Beweist |
|---|---|
| `Cells` | Zellen mit 1–5 Segmenten untereinander, gleiche Balkenbreite, alle fünf Phasenstatus |
| `CellNarrow` | ohne Träger, Stand-Wort bleibt |
| `CellStates` | lädt (Skelett in Zeilenhöhe) · Fehler mit Wort |
| `NotInteractive` | ohne `onOpen`: kein Hover, kein Fokus |
| `Boxes` | zwei- und dreizeilig, gleiche Höhe; läuft mit „seit" |
| `BoxZoom` | 200 % (Kopf in 40rem = 640 px) mit Box rechts: sie rutscht unter den Titel, nichts läuft über |
| `DialogFull` | längste Texte: Notiz 300 Zeichen, langer Name, fünf Phasen, Technik offen |
| `DialogHistory` | Verlauf gefüllt · leer · Ladefehler (drei Dialoge per Knopf) |

Dazu in `Process.stories.tsx`: `Held` (Stepper mit `held` und `note`),
`Holders` um `ludwig` ergänzt.

Showcase `Seiten/Beleg-Prozessbild` (Fixtures S01–S36 aus F305 §7):

| Story | Beweist |
|---|---|
| `AllCells` | jedes Szenario mit Z als Zelle in einer Tabelle unter `StatusHeader`-Kopf „Fortschritt" — die Spalte flattert nicht |
| `AllBoxes` | jedes Szenario mit B als Box |
| `AllDialogs` | jedes Szenario mit D: eine Liste von Zellen, jede öffnet ihren Dialog |
| `BoxStart` / `BoxEnd` | Beleg-Kopf bei 1280 px mit der Box links bzw. rechts, ohne `StatusBadge` |
| `Keyboard` | Zelle → Enter → Dialog → Esc → Fokus zurück |

Nicht anwendbar: „leer nach Filter" (kein Filter im Baustein). Leer = gelöscht
(„—" + Wort). Lädt und Fehler gibt es für die Zelle (in Listen) und für den
Verlauf im Dialog; die Box lädt mit dem Kopf.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Stapel kann hängen | `held` am Stapel (vorhanden) | ein Stapel-Zustand „hängt" in `batchPhaseProgress()` |
| Verlauf der Zustandswechsel | `history` (vorhanden) | P39 speichert die Übergänge |
| Beleg-Drawer | `ProcessBox` (vorhanden) | die Abnahme zeigt den Beleg im Drawer |

## Offene Fragen

1. ~~Box links oder rechts?~~ **Entschieden (Owner 2026-09-27): rechts** — links, was es ist; rechts Stand und Aktionen, für alle Entitäten (Standard §3). Die App nimmt `processPlacement="end"`.
2. ~~„Ludwig" als Träger-Wort?~~ **Entschieden (Owner 2026-09-27): Ludwig ist die KI.** Der Träger `agent` heißt „Ludwig"; die automatische Verarbeitung ist der Träger `processing` mit dem Wort „Verarbeitung" (Zeichen `job`). Der Schlüssel `ludwig` aus dem ersten Bau heißt jetzt `processing` (Guideline T1).

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] Balkenbreite 64 px bei 1–5 Segmenten (Story `Cells`, gemessen)
- [ ] `held` und `failed` unterscheiden sich von `active` durch Zeichen und Wort (Zelle, Box, Stepper)
- [ ] Zelle und Box: ein Klickziel ≥ 24 px hoch, Tab erreichbar, Enter öffnet, Esc schließt, Fokus zurück (Showcase `Keyboard`)
- [ ] Zugänglicher Name der Zelle nennt Stand und Träger
- [ ] Box zwei- und dreizeilig gleich hoch; Breite bei 1280 px im Kopf ≈ 30 %
- [ ] Box bei 640 px Rahmen ohne Überlauf
- [ ] Dialog: Technik zu, Rohwerte nur dort; Verlauf drei Fälle mit eigenen Texten
- [ ] `EntityHeader` `start`/`end`: Box links bzw. rechts, `row` unverändert (0137-Stories unverändert)
- [ ] Jedes Szenario aus F305 §7 steht in jeder seiner Größen (Showcase)

## Abnahme

Eigene Messung (Bauer, 2026-09-27, Storybook 6107, 1280 px) — zählt nicht als Abnahme:

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Balkenbreite bei 1–5 Segmenten | Showcase `AllCells`: 29 Zellen, `.pz-mini`/`—` je 64 px | ✓ |
| Zelle ein Ziel ≥ 24 px, Name mit Stand und Träger | 24 px hoch; `aria-label` „Warnung: Werte fehlen · Agent" | ✓ |
| Wort-Spalte fluchtet | Zeichenplatz 15 px immer reserviert (nachgebessert) | ✓ |
| Box gleich hoch zwei-/dreizeilig, Breite | `BoxStart`/`BoxEnd`: 384 × 96 px in allen drei Köpfen | ✓ |
| Tastatur | `Keyboard`: Tab → Zelle, Enter → Dialog mit Fokus darin, Esc → zu, Fokus zurück auf der Zelle | ✓ |
| Dialog fünf Phasen ohne Umbruch | `DialogFull`: Phasen teilen die Dialogbreite (nachgebessert) | ✓ |
| `typecheck`, `build`, `check:language` | grün | ✓ |

Offen für die fremde Abnahme: `BoxZoom`, Kontraste, `DialogHistory` (drei Fälle), `NotInteractive`, Vergleich jedes Szenarios mit F305 §7.
Abgenommen von / am: fremder Abnahme-Agent, 2026-09-27 · Offene Punkte: keine (M1–M4 nachgeprüft, siehe unten)

### Fremde Abnahme (2026-09-27)

Gemessen mit Playwright gegen Storybook 6107 bei 1280 px (BoxZoom/Kopf zusätzlich
640 px), Kontraste aus `getComputedStyle` gegen den ersten deckenden Hintergrund
gerechnet. Vergleich „unverändert" gegen einen Storybook-Build von `5928cc4`
(Vorgänger) und einen von `66cdb48`, beide in eigenen Worktrees gebaut.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` grün | typecheck Exit 0; `storybook build` im Worktree `66cdb48` Exit 0; dazu `check:icons`, `check:contrast`, `check:when`, `check:classes`, `check:language` je Exit 0 | ✓ |
| Datei nach der Familie, Story daneben, Titel richtig | `patterns/ProcessPicture.tsx` neben `Process.tsx`, Story daneben, Titel `v3/Patterns/Prozess/ProcessPicture`; Showcase `Seiten/Beleg-Prozessbild` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Bezeichner, Kommentare, Story-Namen, CSS-Klassen englisch; `ProcessCell`, `ProcessBox`, `ProcessDialog`, `ProcessPictureTrigger` je mit `@when`/`@instead`; `check:language` 0 | ✓ |
| Kein Hex, kein px in TSX, keine lokale Label-Map | grep über die neuen TSX: kein Hex; px nur als Story-Layout-Hilfe (`BoxZoom`: `1px dashed` am Rahmen); Maps `LEVEL_STATE`/`STEP_STATE` bilden auf `StateKind` ab, Wörter aus `stateLabel` | ✓ |
| Alle Stories vorhanden; Ausschlüsse begründet | alle 8 Pattern-Stories, `Held`, `Holders` + Ludwig, 7 Showcase-Stories (+ `AllCellsNarrow`) im Index; „leer nach Filter" begründet. Aber zwei Stories beweisen nicht, was die Spec sagt → **M3** | ✗ |
| Prüfliste `design-guidelines.md` §9 | Text links, nichts zentriert; Zelle 24 px ≤ Tabellenzeile; Farbe nur Stufe (held Warnung, failed Rot); jeder farbige Zustand mit Zeichen und Wort; Hover nur an Klickzielen; Fokusring; Trefferfläche; `min-width: 0` an Zelle/Box/Kopf gemessen; keine Konsolenfehler in 33 Dialogen. Fünf Zustände: gefüllt/leer(gelöscht)/lädt/Fehler an der Zelle, Verlauf mit drei Fällen — aber Box „gelöscht" springt → **M1** | ✗ |
| Im Browser angesehen | alle 22 Stories der Familie und des Showcase geladen und vermessen | ✓ |
| Balkenbreite 64 px bei 1–5 Segmenten | `Cells`: 9 Zellen mit 5/5/5/5/5/3/2/1/0 Segmenten, Balken bzw. „—" je 64 px; `AllCells`: 29 Zellen, Balken 64 px, x = 893 und Wortanfang x = 988 in jeder Zeile | ✓ |
| `held`/`failed` ≠ `active` durch Zeichen und Wort | Zelle: Zeichen „Warnung"/„Fehler" + Stand-Wort, Name „Warnung: Werte fehlen · Agent"; Box: Zeichen + unterstrichene Phase in Stufenfarbe; Stepper: Zeichen + `note` („Werte fehlen") bzw. „Warnung" ohne `note` (`Process › Held`) | ✓ |
| Zelle/Box ein Ziel ≥ 24 px, Tab, Enter, Esc, Fokus zurück | `Keyboard`: Tab → Zelle (24 px hoch, 320 px breit), Enter → Dialog, Fokus im Dialog; Esc → zu, Fokus auf der Zelle; Tab → Box (384 × 96), Leertaste → Dialog, Esc → Fokus auf der Box; die nicht klickbare Box wird übersprungen. Fokusring 2 px solid, 3,28:1; in `AllCells` bei 500 px Höhe verdeckt kein Sticky-Element den Ring | ✓ |
| Zugänglicher Name nennt Stand und Träger | `AllCells`: 29 Namen, z. B. „Fehler: Kontoauszug geht nicht auf · Kanzlei"; ohne Träger nur bei „niemand"; `narrow` ohne Träger | ✓ |
| Box zwei- und dreizeilig gleich hoch; Breite ≈ 30 % | `Boxes`: 96,3 px bei drei, zwei und laufend; `BoxStart`/`BoxEnd`: 384 px von 1248 px Kopf = 31 %, kein `StatusBadge`. Aber `AllBoxes` S16 (gelöscht) 91 px → **M1** | ✗ |
| Box bei 640 px ohne Überlauf | Viewport 640: `BoxEnd` Box 384 px bei x 37–421, `BoxStart` 213 px, `BoxZoom` 318 px; Dokument 640 px breit, keine Box mit `scrollWidth > clientWidth`, nur Zeile 3 kürzt mit Ellipse (gewollt) | ✓ |
| Dialog: Technik zu, Rohwerte nur dort; Verlauf drei Fälle | 33 Dialoge aus `AllDialogs`: `details` zu, kein Rohwert (`human_review`, `open_findings`, `extract`, …) außerhalb der Technik; offen in Mono. `DialogHistory`: gefüllt (LogList), leer („Für diesen Beleg sind noch keine Zustandswechsel aufgezeichnet." + „Zum Verlauf"), Fehler (`role="alert"`, Was · Ursache · „Verlauf erneut laden" 142 × 25 px); Fokus nach Esc je auf dem Knopf | ✓ |
| `EntityHeader` start/end; `row` unverändert | `BoxStart`: Box unter dem Titelblock (x 69); `BoxEnd`: rechts vor Kennzahl (x 538, Kennzahl x 938). Screenshots alt/neu gleich für `EntityHeader` Filled, Minimal, WithoutMetric, Editable, WithProcess, `Process` InHeader, Failed, InRow, InLog, Empty, `Seiten/Stapelabnahme` Bookings; OtherEntity und InUse mit gleichem DOM und gleicher Geometrie (OtherEntity rauscht auch alt gegen alt); `Holders` anders nur um „Ludwig" | ✓ |
| Jedes Szenario aus F305 §7 in jeder seiner Größen | Größen je Fixture gegen §7 verglichen: alle 33 (S33 als a/b) stimmen; 29 Zellen, 24 Boxen, 33 Dialoge. Abweichungen S31/S32 (invoice) und S33a/b in §6a begründet. Aber S03 folgt nicht §6a → **M4** | ✗ |
| Kontraste Text ≥ 4,5:1, Zeichen ≥ 3:1 | Zelle: Wort 13,77, Träger 6,69, Fehlerwort 5,6; Box: Phasen 11,64 (erledigt/aktiv) / 5,52 (held) / 4,88 (offen), Stand 13,77, „seit"/„Danach" 6,69; Dialog (33 + DialogFull): kleinster Text 4,71; Zeichen Warnung 5,09–5,52, Fehler 5,6–6,06, erledigt 5,07, offen 4,88, Baton 5,45–11,64 | ✓ |
| Spec stimmt mit dem Code (CLAUDE.md §4.5) | Abweichungen in der Schnittstelle → **M2** | ✗ |
| Hover / NotInteractive | Zelle: Wort unterstrichen, `cursor: pointer`; Box: Rand dunkler; `NotInteractive`: `<span>`, `tabIndex -1`, kein Hover (Unterstreichung und Rand bleiben), Tab erreicht nichts | ✓ |

**Mängel**

- **M1 · Box „gelöscht" springt.** `AllBoxes` S16: 91 px statt 96 px. Ohne
  Phasen rendert `ProcessBox` „—" als `.pz-box__line`; die erste Grid-Zeile
  (`grid-template-rows: auto …`) ist dann ohne den 3-px-Balken und das Polster
  der Phasenzeile. Verstößt gegen „Mindesthöhe immer 3 Zeilen … der Kopf springt
  nicht" (`ProcessPicture.tsx` `ProcessBox`, `v3.css` `.pz-box`).
- **M2 · Spec ≠ Code.** `ProcessDialogDetail`: die Spec nennt `axisHref` /
  `onAxis`, der Code hat `axis?: ReactNode`; `links` ist in der Spec Pflicht,
  im Code optional. Box-Breite: Spec „`--pz-box` (30 % des Kopfs, min 22rem,
  max 26rem)", `v3.css` setzt fest `--pz-box: 24rem`. Eine Seite angleichen.
- **M3 · Zwei Stories beweisen nicht, was die Spec sagt.** `DialogFull` soll
  „Technik offen" zeigen (auch F305 §7.3 „Dialog Technik aufgeklappt") — die
  Technik ist zu. `BoxZoom` soll den 640-px-Rahmen zeigen und sagt es im
  Kommentar — der Rahmen ist `20rem` = 320 px. (640 px selbst ist bestanden,
  gemessen über den Viewport.)
- **M4 · S03 widerspricht §6a.** §6a: „`stalled` rechnet die App: Phase `held`
  plus `headline` („Verarbeitung hängt")". Die Fixture S03 hat `headline`
  „Wird ausgelesen" mit Stufe Warnung — Box und Dialog sagen „Warnung: Wird
  ausgelesen". Die Fixtures sind das Vorbild für `document-process.ts`
  (`src/showcase/document-process/fixtures.ts`, S03).

**Nebenbefunde (kein Mangel von 0204)**

- S07 und S08 sind als Box gleich (Unterschied nur im Dialog: Schritt, Link);
  S14 zeigt in der Box nichts vom Wiederöffnen. Folgt aus dem Brief, der die
  Unterschiede dort in den Dialog legt.
- In der Schrittliste tragen aktiver und offener Schritt dasselbe Zeichen
  „offen" (`STEP_STATE active → open`); sichtbar trennt sie nur Füllung und
  Fettung, vorgelesen gar nicht.
- Nicht klickbare Zelle: das Stufen-Zeichen ist `aria-hidden`, einen Namen gibt
  es nur als `title` — „Warnung"/„Fehler" wird dann nicht vorgelesen.
- Zelle im Fehler hat `role="alert"`; in einer Liste mit vielen Fehlzeilen
  würde jede angesagt.
- Links im Dialogfuß 19 px, „Zum Verlauf" 14 px hoch (`Link`-Primitive,
  Inline- bzw. Abstands-Ausnahme von 2.5.8, aber unter dem Hausmaß §9).
- Box-Rand 1,5:1 (`--color-border`, set-weit); `ProcessMini` offenes Segment
  1,2:1 (seit 0137).
- `Process › Held` nutzt die alte Story-Konstante `AGENT` (`--color-accent`):
  Träger-Wort 3,28:1.
- S13: „Keine Buchung nötig" steht im Dialog dreimal (Stand, Ende, Headline).
- Story-Layout-Hilfen mit px: `ProcessPicture.stories.tsx` `BoxZoom`
  (`1px dashed`); `Process.stories.tsx` `InRow` `80px` (Bestand).

**Nacharbeit 2026-09-27 (Bauer), zur Nachprüfung:**
M1 — gelöschte Box hält die Höhe der Phasenzeile (`.is-empty` mit unsichtbarer Linie).
M2 — Spec an den Code angeglichen: `axis`, `links` optional, `--pz-box` 24rem, `technicalOpen`.
M3 — `DialogFull` mit `technicalOpen`; `BoxZoom` zeigt den Kopf in 40rem mit Box rechts.
M4 — S03 heißt „Verarbeitung hängt" (F305 §6a).
Nebenbefunde: aktiver Schritt heißt „aktuell"; Stufe wird auch in der nicht klickbaren Zelle vorgelesen; kein `role="alert"` in der Fehlerzelle; `Process › Held` mit `--color-accent-700`.
Nicht geändert: Höhe der `Link`-Primitive im Dialogfuß (19 px / 14 px, gilt set-weit — eigener Befund für `Link`); Box-Rand 1,5:1 wie jede Karte, die Box erkennt man an Text und Cursor, nicht am Rand.

**Nachprüfung (fremder Abnahme-Agent, 2026-09-27, Stand `7dd5d35`, Storybook 6107):**

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 Box S16 hält die Höhe | `AllBoxes`: alle 24 Boxen 96,3 px, S16 eingeschlossen; „—" 4,88:1; `BoxStart` 3 × 96 px | ✓ |
| M2 Spec = Code | `axis?: ReactNode`, `links?` optional, `--pz-box: 24rem` (`v3.css`), `technicalOpen?` am `ProcessDialog` → `Disclosure defaultOpen` — Spec-Tabellen und Verhaltenstext stimmen Zeichen für Zeichen | ✓ |
| M3 `DialogFull` Technik offen | `details.open = true`, Technik 83 px hoch, kein Text unter 4,5:1 | ✓ |
| M3 `BoxZoom` Kopf in 40rem | Viewport 640 und 1280: Kopf 640 px, Box 384 × 96 unter dem Titel (y 82 > Titelunterkante 66), kein Kind über den Kopfrand, keine Zeile gekürzt außer gewollt; Kopf `scrollWidth = clientWidth`. Das Dokument misst bei 640 px 656 px — das ist das 16-px-Polster des Story-Rahmens um die 40rem, nicht der Baustein | ✓ |
| M4 S03 | Box-Name „Fortschritt: Warnung: Verarbeitung hängt · Ludwig" | ✓ |
| Aktiver Schritt | S07-Dialog: Zeichen des aktiven Schritts heißt „aktuell", offene „offen", gehaltene „Warnung" | ✓ |
| Stufe vorgelesen | `LevelSign` trägt `.v2vh` „Warnung:"/„Fehler:" auch ohne Knopf; im Knopf überdeckt der `aria-label` (kein Doppel); im Dialog „Jetzt" vorhanden; Wortspalte fluchtet weiter (x 988 in allen 29 Zellen) | ✓ |
| Fehlerzelle ohne `role="alert"` | `CellStates`: `role` bei beiden Zellen `null` | ✓ |
| `Process › Held` ≥ 4,5:1 | kleinster Text 4,51:1 (vorher „Agent" 3,28), Träger-Zeichen 5,03:1 | ✓ |
| typecheck, `check:language` | Exit 0; keine Konsolenfehler in den geprüften Stories | ✓ |

Nicht geändert und mit Begründung angenommen: Höhe der `Link`-Primitive im Dialogfuß (set-weit, eigener Befund für `Link`), Box-Rand 1,5:1 wie jede Karte.

## Nachtrag 2026-09-27 — Box nur Phasen, Zelle mit Träger darunter (Owner)

Owner am Bild (`BoxEnd`, `AllCells`):
- **Box:** nur noch die Phasenzeile, **ohne Rahmen**. Stand-Wort, Träger und „Danach" stehen im Dialog (ein Klick). Nur **Warnung und Fehler** bleiben sichtbar: eine zweite Zeile mit Zeichen und Wort. Die Box ist damit eine oder zwei Zeilen hoch — sie wechselt nicht, während man hinsieht, nur von Beleg zu Beleg. Hover: Fläche `--color-bg-soft`.
- **Zelle:** Stand-Wort in Zeile 1, darunter der Träger **mit Zeichen** (`Baton`). `narrow` bleibt einzeilig ohne Träger.
- Die Abnahmekriterien „Box drei Zeilen gleich hoch" und „Danach in der Box" gelten nicht mehr.

## Nachtrag 2026-09-27 (2) — „Erledigung" nicht doppelt (Owner über ll-dev)

Der Stand steht im Kopf — auf der Seite als Prozess-Box, im Drawer als Status im Drawer-Kopf. Die Zeile „Erledigung" in „Belegdaten" wiederholte ihn (D7) und ist **ganz** entfallen (Owner, zweite Runde; die erste Fassung `completion={false}` aus 3f02af2 ist wieder zurückgenommen). Mit ihr fallen die Props `explainCompletion` und `batchHref` an `SourceDocumentFacts` und `SourceDocumentCard`; zum Stapel führen Kopf-Knopf „Zum Stapel" und die Stapel-Box.

**Nachtrag 2026-09-29 (Owner):** Ist ein Beleg ganz durchgelaufen, ist der Balken grün **und** eine durchgehende Linie statt vier Segmente (Zelle und Box) — am Ende ist nichts mehr zu zählen. Gemessen: Zelle 64 px ohne Lücke, laufende Balken behalten ihre 3-px-Lücken.
