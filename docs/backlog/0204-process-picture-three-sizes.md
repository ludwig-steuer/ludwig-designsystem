# 0204 · Prozessbild in drei Größen — `ProcessCell`, `ProcessBox`, `ProcessDialog`

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-27, eigene Messung unten; fremde Abnahme steht aus |
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
  3. `BatonKey` + **`ludwig`** — das System als Träger, Zeichen `job`
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
| `axisHref` / `onAxis` | `ReactNode?` | Verweis auf die Achse (`StatusInfoButton`) |
| `links` | `{ label: string; href: string }[]` | Wege hinaus |
| `onRetryHistory` | `() => void?` | Retry beim Ladefehler |

### Komponenten

| Export | Props | Nachweis |
|---|---|---|
| `ProcessCell` | `picture`, `density?: "regular" \| "narrow"`, `onOpen?` (fehlt = nicht klickbar), `loading?`, `error?: string` | `ProcessPicture › Cells`, `CellNarrow`, `CellStates`, `NotInteractive` |
| `ProcessBox` | `picture`, `onOpen?` | `ProcessPicture › Boxes`, Showcase `BoxStart`/`BoxEnd` |
| `ProcessDialog` | `open`, `onClose`, `picture`, `detail` | `ProcessPicture › Dialog*`, Showcase `AllDialogs` |
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
  gekürzt. Breite `--pz-box` (30 % des Kopfs, min 22rem, max 26rem). Klick
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
| `BoxZoom` | 200 % (Rahmen 640 px): bricht um, nichts läuft über |
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

1. **Box links oder rechts?** (Owner O4) Ohne Antwort: beide als Story, die
   App nimmt `end` (Empfehlung des Briefs).
2. **„Ludwig" als Träger-Wort?** Ohne Antwort: ja (Sprachregel: Ludwig in der
   dritten Person).

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
Abgenommen von / am: … · Offene Punkte: …
