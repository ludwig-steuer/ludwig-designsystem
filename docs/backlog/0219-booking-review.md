# 0219 · BookingReview — die Buchungsprüfung eines Falls, eine Ansicht für Liste und Fall (F355, Iteration 2)

| | |
|---|---|
| Status | **fertig — abgenommen 2026-10-01** (H1 Owner-Bestätigung, H2 Editor-Befund offen); Nachprüfung 2, Stand e6b6e53 |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungssatz, Satzart, Judge, Prüfpunkte eines Vorschlags |
| Quelle | Anfrage llcto 2026-10-01, Owner-Wunsch; Brief `ludwig/app` `docs/backlog/F355-booking-review-unified-design-brief.md` §3, §3a, §4, §5 Punkte 4–5 (6999e08f, cc28c51f) |
| Ersetzt | in `ludwig/app`: `ProposalFoldout` (T3-Aufklapper) und die Satz-Karten der Fall-Ansicht (`Step3Single`, `view=case`) — zwei Darstellungen desselben Satzes |
| Blockiert | App F357 (Einbau) |
| Spec von / am | Claude (designsystem), 2026-10-01 |

## Ziel

Heute zeigt Schritt 3 denselben Satz zweimal verschieden: als Aufklapper der
Liste und als große Fall-Ansicht. Ein Baustein soll beides sein — Vorlage ist die
Fall-Ansicht. Die Sachbearbeiterin liest immer in derselben Reihenfolge: den
Buchungssatz (ganz, auf weißem Grund), warum Ludwig so gebucht hat, was die
Prüfpunkte sagen, was der Judge sagt. Was leer ist, steht nicht da.

## Einordnung

- **Wiederverwenden:** `JournalEntryCard` (Satz kompakt), `AiBookingNotesBody`
  (Begründung mit Quellen), `ProvenanceRows` (Satz des Judge als „Einschätzung"),
  `StatusBadge` (Achsen `journal_entry`, `judge`, `confidence`), `CheckItems`
  (Prüfpunkte), `Badge` (Satzart).
- **Neu, weil:** §3 Regel 5 — eine Entitätsform „Prüfung" (Größe L) für die
  Sätze eines Falls, die die App heute zweimal zusammensetzt. Keine vorhandene
  Form trägt Reihenfolge, Blöcke und mehrere Sätze.
- **Zuschnitt:** eine Datei. Der **volle** Buchungssatz ist ein Slot: Lesen mit
  `JournalEntryGrid`, Bearbeiten mit `JournalEntryEditor` — beide setzt der
  Aufrufer, weil ihre Schnittstellen (Zeilen, Gegenkonto, Belegbetrag, Speichern)
  nicht ein zweites Mal durch diese Form gereicht werden sollen. „`editable` nur
  mit `full`" ist damit Struktur: die kompakte Form hat keinen Bearbeitungsweg.
- **Belege/Zahlung:** Slot je Satz (die App setzt Beleg & USt bzw. die Bankzeile
  zusammen, wie heute in der Fall-Ansicht); er steht rechts neben dem Satz (22 rem),
  bis der Baustein schmaler als 64 rem wird — dann darunter. Container-Query, nicht
  Fensterbreite: Drawer und Aufklapper verhalten sich gleich.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entries` | `readonly BookingReviewEntry[]` | ja | Die Sätze des Falls, untereinander, jeder vollständig (§3a) | alle |
| `caseKind` | `{ label: string; description?: string \| null } \| null` | nein | Satzart des **Falls**, wo sie von den Sätzen abweicht („Aufwand mit Zahlung" über „Aufwand" + „Zahlung", P58) — einmal über den Sätzen; abschaltbar mit `kind` | `ExpenseWithPayment` |
| `lines` | `"compact" \| "full"` | nein | Standard `compact`: `JournalEntryCard` aus `entry.lines`. `full`: `entry.full` (Grid oder Editor des Aufrufers); fehlt er, die kompakte Form | `ListCompact`, `ListFull`, `CaseEditable`, `InUse` |
| `show` | `Partial<Record<BookingReviewBlock, boolean>>` | nein | Blöcke einzeln abschalten; Standard: alle an. Ein angeschalteter, aber leerer Block rendert trotzdem nicht | `ListCompact` (Satz mit Belegen, `evidence: false`) |
| `accountHref` | `(accountNumber: string) => string` | nein | an `JournalEntryCard` | `ListCompact` |
| `taxKeyHref` | `(taxKey: string) => string` | nein | an `JournalEntryCard` | `ListCompact` |

`BookingReviewBlock = "kind" | "confidence" | "rationale" | "checks" | "judge" | "evidence"`.

`BookingReviewEntry` (alle Felder außer `id`, `lines`, `currency` optional):

| Feld | Typ | Pflicht | Bedeutung |
|---|---|---|---|
| `id` | `string` | ja | Schlüssel |
| `lines` | `readonly JournalLine[]` | ja | **alle** Zeilen des Satzes, Steuer, § 13b und Gegenkonto eingeschlossen — nie gefiltert (§3a) |
| `currency` | `Currency` | ja | für `JournalEntryCard` |
| `full` | `ReactNode` | nein | der volle Satz (`JournalEntryGrid` lesend oder `JournalEntryEditor` bearbeitend) für `lines="full"` |
| `kindLabel` | `string \| null` | nein | Satzart dieses Satzes als Wort der App-Registry („Aufwand", „Zahlung" …) — neutrales Badge |
| `kindDescription` | `string \| null` | nein | `title` des Badges |
| `status` | `string \| null` | nein | Achse `journal_entry` |
| `confidence` | `ConfidenceLevel \| null` | nein | Ludwigs Einschätzung, Achse `confidence` — im Kopf „Ludwig [Plausibel]" (die Fall-Ansicht zeigte sie, M2) |
| `rationale` | `string \| null` | nein | Begründung des Agenten — bei Routine leer (F356) |
| `sources` | `readonly AiSource[]` | nein | Quellen der Begründung (die Fall-Ansicht zeigte sie, M2) |
| `verdict` | `JudgeVerdict \| null` | nein | Urteil des Judge |
| `judgeReasoning` | `string \| null` | nein | Satz des Judge |
| `checks` | `readonly CheckItem[]` | nein | Prüfpunkte dieses Satzes |
| `evidence` | `ReactNode` | nein | Beleg & USt bzw. Zahlung, rechts neben dem Satz |
| `actions` | `ReactNode` | nein | Handlungen an diesem Satz („Diesen Satz ablehnen") — immer zuletzt |

Typen: `JournalLine` (JournalEntryCompact), `JudgeVerdict`, `AiSource` (AiBookingNotes),
`ConfidenceLevel` (Confidence), `CheckItem` (Review), `Currency` aus `src/ludwig/shared/money`.

**Kann bewusst nicht:** den Satz bearbeiten (der Editor im Slot tut es),
Belegfelder darstellen (Slot), Aktionen des ganzen Falls („Freigeben") tragen —
die stehen beim Aufrufer unter dem Baustein, weil Freigeben den **Fall** freigibt.

## Verhalten

- **Reihenfolge je Satz** (Brief §3): Kopf → Buchungssatz → Begründung →
  Prüfpunkte → Judge → Handlungen. Belege/Zahlung rechts daneben; unter 64 rem
  Breite darunter, **vor** den Handlungen (Grid-Bereiche, M1).
- **Kopf:** „Satz i von n" nur bei mehr als einem Satz; Satzart-Badge; „Ludwig
  [Konfidenz]"; Status — in `full` mit `entry.full` nicht, dort zeigt ihn die Form
  im Slot selbst; `full` ohne `entry.full` zeigt ihn im Kopf. Fehlt alles, kein
  Kopf. Die Satzart des Falls (`caseKind`) steht einmal über allen Sätzen.
- **Buchungssatz auf weißem Grund** — eigene weiße Fläche mit 1-px-Rand, auch im
  grauen Aufklapper einer Liste; ein breiter Editor scrollt in dieser Fläche.
- **Begründung:** mit `rationale` oder `sources`, über `AiBookingNotesBody` — die
  Zeile trägt ihr Label „Begründung" selbst, Quellen darunter. **Prüfpunkte:** nur
  mit mindestens einem Punkt; Überschrift „Prüfpunkte", `CheckItems`. **Judge:**
  nur wenn relevant — Urteil ≠ `confirm` oder ein Satz vorhanden; Zeile „Judge
  [Urteil]" (`StatusBadge`, Achse `judge`), darunter „Einschätzung" mit dem Satz
  (`ProvenanceRows`) — „Judge" steht einmal (M5).
- **Leer heißt unsichtbar:** ein Block ohne Inhalt rendert nicht, auch keine
  Überschrift.
- **Mehrere Sätze** (Zwei-Satz-Fall, §3a): alle untereinander, jeder mit eigener
  Satzart und eigenen Prüfpunkten, durch eine Linie getrennt.
- **Der Editor im Slot bekommt kein `aiReview`:** Konfidenz, Urteil, Begründung,
  Satz des Judge und Quellen zeigt dieser Baustein; gibt der Aufrufer sie dem
  Editor zusätzlich, stehen sie zweimal.
- Server-Component (kein Zustand); Tastatur und Fokus bringen die Bausteine mit.
- **Zustände:** gefüllt; leer (`entries` leer) → nichts (der Aufrufer zeigt „kein
  Vorschlag"); lädt/Fehler → beim Aufrufer (die Daten kommen mit dem Fall).

## Stories

Titel `v3/Entitäten/Buchungssatz/BookingReview`. Nach Brief §5 je Ausprägung,
dazu „im Einsatz":

| Story | Beweist |
|---|---|
| `ListCompact` | `lines="compact"`, wie im T3-Aufklapper: Satz kompakt auf weiß, Konfidenz, Begründung, Prüfpunkte mit Befund, Judge „angepasst"; der Satz hat Belege, `show.evidence: false` blendet sie aus |
| `ListFull` | `lines="full"` mit `JournalEntryGrid` lesend im Slot |
| `CaseEditable` | Fall-Ansicht bei 1246 px: `lines="full"`, `JournalEntryEditor` bearbeitbar im Slot, Quellen, Beleg & USt rechts, Handlung darunter links |
| `RoutineCase` | Routine: keine Begründung, Judge `confirm` ohne Satz → nur Kopf, Satz, Prüfpunkte |
| `ExpenseWithPayment` | zwei Sätze eines Falls („Aufwand", „Zahlung") unter `caseKind` „Aufwand mit Zahlung"; dazu ein Einzelsatz Aufwand direkt an Bank mit § 13b-Zeilen — alle Zeilen sichtbar (§3a) |
| `InUse` | in App-Breite (728 px, Seitenleiste + Schritt-Leiste bei 1280 px): Belege unter dem Satz, vor der Handlung; der volle Satz in seiner Fläche |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Vormonats-/Regelkontext („Regel & Periode") | `entry.context?` | ein Regel-Fall in der Liste braucht ihn |

## Abnahmekriterien

Fest (gilt immer):

- [x] `pnpm typecheck` und `pnpm build` grün
- [x] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [x] Code englisch; `@when`/`@instead` an jedem Export
- [x] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [x] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [x] Prüfliste `design-guidelines.md` §9 durchgegangen
- [x] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [x] Reihenfolge je Satz: Kopf → Satz → Begründung → Prüfpunkte → Judge → Handlungen; Belege/Zahlung rechts (`CaseEditable`)
- [x] Satz auf weißer Fläche, auch im grauen Aufklapper (`ListCompact`, gemessen: Hintergrund)
- [x] Leere Blöcke rendern nicht, auch keine Überschrift (`RoutineCase`: keine „Begründung", kein „Judge")
- [x] Judge nur bei Urteil ≠ confirm oder Satz vorhanden (`RoutineCase` vs. `ListCompact`)
- [x] `show` schaltet jeden Block ab (`ListCompact` ohne Belege; Code)
- [x] `lines`: compact = `JournalEntryCard` mit **allen** Zeilen inkl. Steuer/§ 13b/Gegenkonto; full = Slot (`ListFull`, `ExpenseWithPayment`)
- [x] Mehrere Sätze untereinander, je „Satz i von n" mit eigenen Prüfpunkten (`ExpenseWithPayment`)
- [x] Bei 1280 px kein Querscroll, Belege-Spalte rechts ohne Überlauf (`CaseEditable`, gemessen)

## Abnahme

Fremde Abnahme, Stand `a3ed1dd` (Arbeitsbaum sauber). Gemessen mit Playwright im
eigenen Browser-Kontext, 1280 × 900, dazu 700 / 1000 / 1100 / 1400 / 1920 px und
der Container per JS auf 1040 / 1024 / 1008 / 728 px gesetzt. Story-IDs ohne Präfix
`v3-entitäten-buchungssatz-bookingreview--`. Screenshots `.playwright-mcp/0219-*.png`.
Gegengelesen: Brief F355 §3, §3a, §4, §5 und die heutige Fall-Ansicht
(`ludwig/app` `Step3Single.tsx:917–1000`, Stand `cfec65e2`).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` nicht selbst gelaufen (Auftrag, parallele Sitzungen); der Erbauer meldet ihn für `a3ed1dd` grün | ✓ (build übernommen) |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/journal-entry/BookingReview.tsx` neben Card/Grid/Editor; `BookingReview.stories.tsx` daneben; Titel `v3/Entitäten/Buchungssatz/BookingReview`; Barrel `index.ts:617–622` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 (deutsche JSDoc nur als Story-Beschreibung, 0098 M10), `pnpm check:when` Exit 0, beide `--test` grün; `BookingReview` trägt beide (`BookingReview.tsx:60–66`) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | TSX ohne Hex/px; `.v3bkr*` (`v3.css:4784–4802`) nur Tokens, 1-px-Rand, `22rem`/`64rem`; Status über `StatusBadge` (`journal_entry`, `judge`), Satzart als fertiges Wort des Aufrufers; `pnpm check:type` Exit 0 (`--test` grün); `pnpm check:classes` Exit 1 nur mit vier fremden Klassen (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), keine `v3bkr*` | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | Fünf Stories wie die Tabelle; leer → nichts, lädt/Fehler beim Aufrufer begründet (Z. 94–95). Aber „im Einsatz" fehlt (`spec-schreiben` §6, fester Summand) — M3; `show` ohne wirksamen Nachweis — M4 | ✗ M3, M4 |
| Prüfliste `design-guidelines.md` §9 | Text links, Zahlen rechts (Karte, Editor); Farbe nur in Registry-Badges, jedes mit Wort; Fläche mit Rand, ohne Schatten; Overline 12 px `rgb(92, 92, 92)` auf `rgb(244, 246, 248)` 6,17:1; „Diesen Satz ablehnen" 30 px hoch; `.v3bkr__entry` ist Scroll-Container ohne `position: relative` mit einem absoluten Kind (`v2kf__shown`) — gemessen kein Entkommen, Seite bei allen Breiten ohne Querlauf, die Kontoliste öffnet in der Fläche (237–379 in 57–644) | ✓ |
| Im Browser angesehen | Alle fünf Stories gerendert, 0 Konsolenfehler, 0 Warnungen; `0219-{list-compact,list-full,case-editable,routine-case,expense-with-payment}-1280.png` | ✓ |
| Reihenfolge je Satz: Kopf → Satz → Begründung → Prüfpunkte → Judge → Handlungen; Belege rechts (`CaseEditable`) | `case-editable` 1280: Kopf „Aufwand" → Satz → Begründung → Prüfpunkte → Judge → Handlungen, Belege rechts (Hauptspalte 16–890, Belege 910–1262). Unter 64 rem (Viewport 1000; Container 1024 / 1008 / 728): Satz 57–644, Begründung 660–711, Judge 915–937, **Handlungen 992–1022, Belege 1042–1281** — die Handlung steht nicht zuletzt, der Beleg unter dem ersten Bildschirm. `0219-case-editable-1000.png`, `0219-case-editable-container-728.png` | ✗ M1 |
| Satz auf weißer Fläche, auch im grauen Aufklapper (`ListCompact`, Hintergrund) | `list-compact`: `.v3bkr__entry` `rgb(255, 255, 255)`, Rand `1px solid rgb(236, 239, 243)`, `elementFromPoint` 4 px innen → weiß; Umgebung `rgb(244, 246, 248)`. Ebenso `list-full`, `routine-case`, alle drei Sätze in `expense-with-payment` | ✓ |
| Leere Blöcke rendern nicht, auch keine Überschrift (`RoutineCase`) | `routine-case`: Kopf → Satz → Prüfpunkte; einzige Überschrift „Prüfpunkte"; „Begründung" 0×, „Judge" 0× | ✓ |
| Judge nur bei Urteil ≠ confirm oder Satz vorhanden | `routine-case` (confirm, kein Satz): kein Judge-Block. `list-compact` (adjust + Satz): „Judge · Angepasst", darunter der Satz. `judgeRelevant` (`:47–49`) deckt auch confirm mit Satz und flag ohne Satz | ✓ |
| `show` schaltet jeden Block ab (`ListCompact` ohne Belege; Code) | Code: `on()` an allen fünf Blöcken (`:86`, `:91`, `:130`, `:131`, `:136`). Story: `list-compact` ohne Belege — aber kein Eintrag trägt `evidence`, der Schalter hat nichts abzuschalten (M4) | ✓ Code · ✗ Story M4 |
| `lines`: compact = alle Zeilen inkl. Steuer/§ 13b/Gegenkonto; full = Slot | Gezählt gegen die Fixture: `list-compact`, `routine-case` 3/3 (4930 · 1576 · 70044); `expense-with-payment` 3/3, 2/2 (70044 · 1800), 4/4 (6837 · 1407 · 3837 · 1802); Code reicht `e.lines` ungefiltert (`:119–125`). full: `list-full` 0 Kartenzeilen, Grid im Slot; `case-editable` Editor im Slot | ✓ |
| Mehrere Sätze untereinander, je „Satz i von n" mit eigenen Prüfpunkten (`ExpenseWithPayment`) | „Satz 1 von 2" (3 von 4 bestanden, 1 nicht prüfbar) und „Satz 2 von 2" (2 von 2 bestanden); zweiter Satz mit `1px solid rgb(236, 239, 243)` oben und 20 px Abstand; der Einzelsatz darunter ohne „Satz i von n" | ✓ |
| Bei 1280 px kein Querscroll, Belege rechts ohne Überlauf (`CaseEditable`) | `case-editable` 1280: `scrollWidth` 1280 = 1280, Hauptspalte 874, Belege 352, kein überlaufendes Kind in den Belegen; 1400 / 1920 gleich; 700 / 1000 / 1100 ohne Seiten-Querlauf. Gemessen im Story-Rahmen (1246 px) — im App-Rahmen hat der Baustein bei 1280 px ≈ 728 px, dort stehen die Belege darunter (M3) | ✓ Story · im Einsatz M3 |
| Status nicht doppelt in `full` | `list-full`: Kopf nur „Aufwand", „Vorschlag" 1× (im Grid); `case-editable` 1× (im Editor); `list-compact` 1× im Kopf | ✓ |
| Doppelungen von Wörtern und Sätzen (Owner: nie derselbe Satz an zwei Orten) | Judge-Block „Judge · Angepasst" + „Einschätzung des Judge" (M5); Fixture: „die Rechnung weist 19 % aus" in Begründung und Judge-Satz (M6); `expense-with-payment`: Badge „Aufwand mit Zahlung" mit gleichem `title` an beiden Sätzen (H1). Sonst doppelt nur die Buchungstexte der Fixture | ✗ M5, M6 |
| Kein Feature weglassen (Owner 2026-09-29); Vorlage Fall-Ansicht (Brief §4) | Heute zeigt der Editor der Fall-Ansicht über `aiReview` Konfidenz, Urteil, Begründung, Judge-Satz und Quellen (`Step3Single.tsx:967–981`, `JournalEntryEditor.tsx:455–464`). `BookingReview` trägt Konfidenz und Quellen nicht; `CaseEditable` gibt dem Editor kein `aiReview` → beides fällt weg | ✗ M2 |
| Spec Zeichen für Zeichen gegen den Code | Prop-Tabelle = `BookingReview.tsx:67–81` (Namen, Typen, Pflicht, Vorgabe `compact`/`{}`). Tabelle `BookingReviewEntry` ohne Optionalität, `BookingReviewBlock` fehlt (M7). „Gebaut" nachgemessen: 1280 = 1280, 874 / 352, Reihenfolge, `rgb(255, 255, 255)` auf `rgb(244, 246, 248)`, „Satz 1/2 von 2", vier Zeilen — stimmt; „doppelte Überschriften behoben" stimmt für den Judge nur halb (M5) | ✗ M7 |
| Vorbestehender Editor-Befund (nicht Teil dieser Abnahme) | `journalentryeditor--s-2-split-full`: Kopf „Text" 773–773 bei 900 **und** bei 1280 px — vorbestehend. Im Slot (`case-editable`): 771–771 bei 1100 bis 1920, 72 px bei Viewport 1000, 128 px bei Container 1024; „Text"/„KOST" überlagert (`0219-case-editable-1280.png`) | bestätigt, H2 |

**Mängel**

| Nr. | Fundort | Befund · Messwert |
|---|---|---|
| M1 (blockierend) | `BookingReview.tsx:145–152`, `v3.css:4787`, `:4802`; Spec Z. 36, 65, 76–77 | Unter 64 rem fällt `.v3bkr__aside` hinter `.v3bkr__main` — also hinter die Handlungen. Gemessen (Viewport 1000, Container 728): Handlungen 992–1022, Belege 1042–1281. „Diesen Satz ablehnen" steht damit zwischen Judge und Beleg, und der Beleg, gegen den der Satz geprüft wird, 400 px unter dem Satz und unter dem ersten Bildschirm (900). Widerspricht „… → Handlungen" (Z. 76–77) und „Handlungen … unter seinen Blöcken" (Z. 65); „dann darunter" (Z. 36) lässt offen, wo. Im App-Rahmen ist das bei 1280 px der Normalfall (M3). Weg: im gestapelten Raster die Belege direkt unter den Satz oder wenigstens vor die Handlungen; Z. 36 genau fassen |
| M2 (blockierend) | Spec „Einordnung", „Ausbau" Z. 113; App `Step3Single.tsx:967–981` | Die Fall-Ansicht, die der Baustein ersetzt (Spec „Ersetzt"), zeigt heute Konfidenz und Quellen. `BookingReview` kann beides nicht tragen; ohne `aiReview` am Editor (so die Story) fallen sie weg, mit `aiReview` stehen Begründung und Judge-Satz zweimal (Editor und Blöcke) — die Spec sagt nicht, welcher Weg gilt. Quellen stehen als „Ausbau" mit dem Anlass „die Liste soll Quellen zeigen" — die Fall-Ansicht zeigt sie schon; Konfidenz ist nirgends genannt. Owner-Regel 2026-09-29: Heutiges bleibt zuschaltbar, „ein DS-Entscheid ist kein Nachweis". Weg: `entry.sources?`/`entry.confidence?`, schaltbar über `show`, plus Spec-Satz „Editor im Slot ohne `aiReview`" — oder ein Owner-Entscheid, dass beides in der Fall-Ansicht entfällt |
| M3 | Spec „Stories" Z. 101–107, Kriterium Z. 137; `BookingReview.stories.tsx:147` (`maxWidth: 1246`) | „Im Einsatz" fehlt. Der Story-Rahmen hat 1246 px; im App-Rahmen (Seitenleiste 240 + Innenabstand 2 × 32 + Schritt-Rail 224 + Abstand 24, `app-chrome.css:15`, `:161`; `v3.css:282`) hat der Baustein bei 1280 px ≈ 728 px, mit eingeklappter Leiste ≈ 904 px — beide unter 64 rem. Belege rechts gibt es in der App erst ab ≈ 1576 px Fensterbreite (eingeklappt ≈ 1400). Zwischen 1025 und ≈ 1230 px Containerbreite steht der volle Editor neben den Belegen und scrollt in sich (`bse__tbl` 824 > 634 bei Container 1040, 824 > 662 bei Viewport 1100). Die Spec soll sagen, was die Fall-Ansicht bei 1280 px zeigt, und die Schwelle für `full` am Editor messen |
| M4 | `BookingReview.stories.tsx:60`, `:98`; Spec Z. 45 | `show={{ evidence: false }}` in `ListCompact` und `ListFull`, aber kein Eintrag trägt `evidence` — die genannte Story beweist den Schalter nicht. Nötig: ein Eintrag mit `evidence` und `show.evidence: false` (oder ein gefüllter Block, der abgeschaltet ist) |
| M5 | `BookingReview.tsx:137–142`; `AiBookingNotes.tsx:269`; Spec Z. 156–158 | Der Judge-Block sagt „Judge" zweimal: Kopfzeile „Judge · Angepasst", darunter das Zeilenlabel „Einschätzung des Judge" (`list-compact`, `case-editable`). „Gebaut" meldet die doppelte Überschrift als behoben |
| M6 | `BookingReview.stories.tsx:40`, `:51–52`, `:71`, `:133`, `:159` | Die Fixture widerspricht sich in einer Story: P-UST rot „Beleg weist 7 % aus, gebucht wurde BU 9 (19 %)" gegen Begründung und Judge „… weist 19 % aus" und Beleg & USt „1.240,00 € · 235,60 € · 1.475,60 €" (19 %). Und „die Rechnung weist 19 % aus" steht wortgleich in Begründung und Judge-Satz — die Story zeigt, was „nie derselbe Satz an zwei Orten" verbietet |
| M7 | Spec Z. 45, Z. 50–65, Z. 78–80 | Tabelle `BookingReviewEntry`: Typen ohne Optionalität (`string \| null`, `ReactNode`, `readonly CheckItem[]`); im Code sind `full`, `kindLabel`, `kindDescription`, `status`, `rationale`, `verdict`, `judgeReasoning`, `checks`, `evidence`, `actions` optional (`BookingReview.tsx:27–41`). `show` steht inline, der Code exportiert `BookingReviewBlock` über den Barrel — gehört in die Schnittstelle. Z. 78–80 („Status — in `full` nicht") deckt nicht, dass `full` ohne `entry.full` den Status im Kopf zeigt (`:89`) |

**Hinweise** (kein Mangel, für den Owner)

- H1: `expense-with-payment` trägt an Rechnung **und** Zahlung das Badge „Aufwand mit
  Zahlung" mit gleichem `title`. In der App ist die Satzart eine Eigenschaft je Satz
  (`entry-kind.ts`: Rechnung = Aufwand, Zahlung = Zahlung); „Aufwand mit Zahlung" ist
  im Fall (b) eine des Falls, und P58 ist offen („Entscheidung und Spec folgen nach der
  Demo", `web-ui-offen.md`). Ob die Fall-Satzart in einen Kopf des Falls gehört oder an
  jeden Satz, klärt der Owner.
- H2: Der Editor-Befund ist vorbestehend (Zeile oben), trifft aber die Hauptstory
  `CaseEditable` bei 1280 px sichtbar.
- H3: Begründung und Judge-Satz sind zwei `AiBookingNotesBody` mit eigener
  Labelspalte; der Text beginnt bei x 130 bzw. 209 (`list-compact`). In der heutigen
  Fall-Ansicht stehen beide in einem Raster bündig.
- H4: „Prüfpunkte" und „Judge" sind `h4`, „Satz i von n" ist ein `span`; bei mehreren
  Sätzen stehen die `h4` ohne Überschrift ihres Satzes.
- H5: Die Erklärung der Satzart erreicht nur die Maus (`title` am `span`, wie heute in
  der Fall-Ansicht).
- H6: Kontonummern-Links der Karte 15 px, BU-Link 19 px hoch — vorbestehend
  (`JournalEntryCard`/`AccountCell`), nicht dieser Baustein.

**Vier Linsen.** *Sprache:* „Satz 1 von 2", „Prüfpunkte", „Begründung", „Diesen Satz
ablehnen" sind Kanzleiwörter, der Button Imperativ mit Objekt; „Judge" steht im Block
zweimal (M5), die Fixture widerspricht sich und wiederholt einen Satz (M6).
*Bedienung:* der Baustein bringt keine eigenen Bedienelemente, der Tab-Weg folgt dem
DOM (Editor, Handlungen; die Belege haben keine Fokusziele), der Knopf misst 30 px;
gestapelt liegt die Handlung vor dem Beleg (M1). *Logik:* eine Reihenfolge je Satz,
leere Blöcke ohne Überschrift, Status einmal, Judge nur wenn relevant, alle Zeilen
ungefiltert — aber Konfidenz und Quellen der Vorlage fehlen (M2), und was die
Fall-Ansicht bei 1280 px zeigt, misst keine Story (M3). *Darstellung:* Satz weiß
`rgb(255, 255, 255)` mit 1-px-Rand auf `rgb(244, 246, 248)`, Farbe nur in
Registry-Badges, Overline 6,17:1, eine Trennlinie `--color-border-subtle` zwischen den
Sätzen; Begründung und Judge-Satz nicht bündig (H3).

Abgenommen von / am: nicht abgenommen — Claude (Abnahme-Agent), 2026-10-01 ·
Offene Punkte: M1–M7 (M1, M2 blockierend)

## Gebaut 2026-10-01

`entities/journal-entry/BookingReview.tsx` (Export `BookingReview`, Typen
`BookingReviewEntry`, `BookingReviewBlock`), CSS `.v3bkr*`, Stories
`BookingReview.stories.tsx` (fünf). Barrel: dazu `ReviewReasonCell` und
`ReviewReasonView` (0218), damit die App den Typ der Prüfgründe importieren kann.

**Befunde beim Bauen**

- **Doppelte Überschriften.** „Begründung" und „Judge" standen zweimal — als
  Blocküberschrift und als Zeilenlabel von `AiBookingNotesBody`. Die Begründung hat
  keine eigene Überschrift mehr; der Judge eine Kopfzeile mit dem Urteil.
- **Doppelter Status.** In `full` zeigte der Kopf den Status und der Editor im
  Slot noch einmal. Jetzt nur noch der Slot.
- **Editor im Slot bei ~870 px** (Belege rechts): die Spalte „Text" des vollen
  Editors ist 0 px breit, die Köpfe „Text"/„KOST" überlagern sich. **Vorbestehend**
  — dieselbe Messung in `JournalEntryEditor --s-2-split-full` bei 900 px: „Text"
  773–773. Eigener Auftrag für den Editor (Spurbreiten im Modus `full`), nicht Teil
  dieser Abnahme.

**Gemessen** (Playwright, 1280 × 900): `CaseEditable` 1280 = 1280 ohne Querscroll,
Satz-Spalte 874 px, Belege 352 px, Reihenfolge Kopf → Satz → Begründung →
Prüfpunkte → Judge → Handlungen; `RoutineCase` ohne „Begründung" und „Judge",
Satzfläche `rgb(255, 255, 255)` auf `rgb(244, 246, 248)`; `ListFull` Kopf nur mit
Satzart, Status im Grid; `ExpenseWithPayment` „Satz 1 von 2"/„Satz 2 von 2" mit je
eigenen Prüfpunkten, der Einzelsatz mit allen vier Zeilen (6837 · 1407 · 3837 · 1802).

## Nacharbeit 2026-10-01 (nach der fremden Abnahme)

| Punkt | Änderung | Stand |
|---|---|---|
| M1 Belege hinter den Handlungen unter 64 rem | Handlungen sind ein eigener Grid-Bereich: breit „main aside / actions aside", schmal „main / aside / actions". Gemessen `InUse` (728 px): Satz-Spalte 16–705, Belege 721–960, Handlung 976–1006; `CaseEditable` (1246 px): Belege rechts 910–1262, Handlung links unter dem Satz | behoben |
| M2 Konfidenz und Quellen fehlten | `entry.confidence` (Kopf „Ludwig [Plausibel]", Achse `confidence`, Schalter `confidence`), `entry.sources` (über `AiBookingNotesBody` unter der Begründung) | behoben |
| M3 keine Story im Einsatz | `InUse` in App-Breite 728 px | behoben |
| M4 `show.evidence` unbewiesen | `ListCompact` gibt dem Satz Belege und schaltet sie ab | behoben |
| M5 „Judge" doppelt | Zeile „Judge [Urteil]", darunter „Einschätzung" (`ProvenanceRows`), nicht mehr „Einschätzung des Judge" | behoben |
| M6 Fixture widersprüchlich | Befund ist jetzt die Belegnummer („RE-4417" ↔ „RE-4471"); 19 % steht nur noch im Satz des Judge und im Beleg, die Begründung wiederholt ihn nicht | behoben |
| M7 Schnittstelle unvollständig | Tabellen mit Spalte „Pflicht", `BookingReviewBlock`, `caseKind`, Status-Satz für `full` ohne `entry.full` | behoben |
| H1 Satzart im Zwei-Satz-Fall | Default (llcto trägt ihn, liegt beim Owner): jeder Satz seine Satzart, die des Falls einmal über `caseKind` | gebaut, Owner bestätigt noch |
| H2 Editor-Spalte „Text" 0 px | vorbestehend (`JournalEntryEditor --s-2-split-full`), eigener Auftrag | offen |

## Nachprüfung 2026-10-01 (Stand 65c25e2)

Fremder Nachprüfer, Arbeitsbaum sauber. Playwright im eigenen Kontext 1280 × 900,
Story-IDs ohne Präfix `v3-entitäten-buchungssatz-bookingreview--`; Container von
`case-editable` per JS auf 1246 / 1040 / 1025 / 1024 / 1008 / 904 / 728 px gesetzt.
0 Konsolenfehler.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 Reihenfolge gestapelt / breit | `in-use` (728): Satz-Spalte 16–705, Belege 721–960, Handlung 976–1006 (eine Spalte `728px`). `case-editable` (1246): Spalten `874px 352px`, Satz-Spalte 16–890 bis 1015, Belege rechts 910–1262 ab 16, Handlung links 16–890 bei 1031–1062. Grenze: 1025 → `653px 352px` nebeneinander, 1024 / 1008 / 904 / 728 → gestapelt Satz → Belege → Handlung (Wurzel 16 px, 64 rem = 1024) | ✓ |
| M2 Konfidenz und Quellen | `case-editable` und `in-use`: Kopf „Aufwand · Ludwig Plausibel"; unter „Begründung" die Zeile „Quellen" (Rechnung RE-4471, Vorbuchungen). Code: `on("confidence")` `BookingReview.tsx:97`, Quellen `:103`, `:148`. Der in M2 verlangte Satz „Editor im Slot ohne `aiReview`" fehlt — N2 | ✓ Code · ✗ Spec N2 |
| M3 Story `InUse` | vorhanden, 728 px, beweist M1 gestapelt. Beschreibung sagt „der volle Editor scrollt in seiner weißen Fläche" — gerendert ist `JournalEntryGrid`, die Fläche scrollt nicht (726 = 726) — N3 | ✓ Story · ✗ Text N3 |
| M4 `show.evidence` | `list-compact`: Eintrag trägt `evidence: DOCUMENT` (`stories.tsx:94`), `.v3bkr__aside` fehlt im DOM | ✓ |
| M5 „Judge" einmal | `list-compact`, `case-editable`, `in-use`: „Judge" 1×, „Einschätzung" 1× („Judge Angepasst · Einschätzung …") | ✓ |
| M6 Fixture widerspruchsfrei | 19 % sichtbar nur im Judge-Satz, im Beleg, in Quelle und Kontoname; Begründung ohne 19 %. **Aber:** P-BELEG rot „Belegfeld 1 „RE-4417" weicht … „RE-4471" ab", während der Satz im Slot Belegfeld 1 = „RE-4471" trägt (`case-editable`: Eingabe `aria-label` „Belegfeld 1", Wert „RE-4471"; `in-use`: Grid-Zeile „… 4930 Bürobedarf RE-4471 …") — N1 | ✗ N1 |
| M7 Schnittstelle | Prop-Tabelle = `BookingReview.tsx:71–84` (Namen, Typen, Pflicht, Vorgaben `compact`/`{}`, `caseKind` abschaltbar über `kind` `:88`); `BookingReviewBlock` = `:50`; `BookingReviewEntry` 15 Felder, Typen und Optionalität = `:23–48`; Typen-Herkunft stimmt; Status-Satz für `full` ohne `entry.full` = `:100`. Barrel `index.ts:618–620`. Daneben veraltet: N2 | ✓ Tabellen · ✗ N2 |
| H1 `caseKind` | `expense-with-payment`: „Aufwand mit Zahlung" einmal über „Satz 1 von 2 · Aufwand · Vorschlag" und „Satz 2 von 2 · Zahlung · Vorschlag"; das zweite Vorkommen ist die Satzart des Einzelsatzes im zweiten Fall | ✓ (Owner bestätigt) |
| Kein Querscroll bei 1280 | alle sechs Stories `scrollWidth` 1280 = 1280; `case-editable` auch bei Container 728–1246 | ✓ |
| Leere Blöcke unsichtbar | `routine-case`: Kopf → Satz → „Prüfpunkte"; „Begründung", „Judge", „Einschätzung" 0× | ✓ |
| Keine doppelten Wörter/Sätze | außer N1 nur Buchungstexte und Namen der Fixture doppelt; „Aufwand mit Zahlung" je Fall einmal | ✓ |
| `typecheck`, `check:type`, `check:when`, `check:language` | alle Exit 0. `build` nicht gelaufen (Auftrag), Erbauer meldet ihn grün | ✓ |

**Mängel**

| Nr. | Fundort | Befund · Weg |
|---|---|---|
| N1 | `BookingReview.stories.tsx:40` gegen `:109` (`GRID_ROW.externalDocumentNumber`) | Die Nacharbeit zu M6 macht die Belegnummer zum Befund, der gezeigte Satz trägt aber die richtige Nummer: in `case-editable` und `in-use` steht Belegfeld 1 „RE-4471" neben dem roten Prüfpunkt „Belegfeld 1 „RE-4417"". Weg: `externalDocumentNumber: "RE-4417"` im Slot-Satz (Beleg bleibt RE-4471) |
| N2 | Spec Z. 122 („Ausbau"), Z. 23–25 („Einordnung"); `befunde-app.md:378` | „Ausbau" führt „Quellen der Begründung" noch als künftig — `entry.sources` ist gebaut. „Einordnung" nennt `AiBookingNotesBody` für den Satz des Judge (jetzt `ProvenanceRows`) und `StatusBadge` ohne Achse `confidence`. Der in M2 verlangte Satz fehlt in Spec und Befund: der Editor im Slot bekommt kein `aiReview` — heute gibt `Step3Single` es ihm, sonst stehen Konfidenz, Urteil, Begründung, Judge-Satz und Quellen zweimal. Weg: Zeile streichen, Einordnung nachziehen, Satz in „Verhalten" und in `befunde-app.md` |
| N3 | `BookingReview.stories.tsx:272–276` | Beschreibung von `InUse`: „der volle Editor scrollt in seiner weißen Fläche" — die Story setzt `JournalEntryGrid`, und nichts scrollt (726 = 726). Weg: Text auf das Grid fassen (oder den Editor einsetzen, wie die Fall-Ansicht es tut — dann trifft H2 die Story, s. Hinweis) |

**Hinweise** (blockieren nicht)

- H2 erweitert: der Editor im Slot hat auch bei 728 px (die Fall-Ansicht bei 1280 px
  in der App) Spalte „Text" 771–771 (0 px), ebenso nebeneinander bei 1025–1246; bei
  904 px 8 px, erst bei 1008–1024 (gestapelt) 112–128 px. `InUse` zeigt das nicht, weil es das
  Grid setzt. Der Editor-Auftrag soll 728 px als Messpunkt aufnehmen.
- Nach Aufklappen von „3 von 4 Prüfpunkten bestanden" steht P-UST „Beleg weist 19 % aus,
  gebucht mit BU 9." unter dem Judge-Satz „… die Rechnung weist 19 % aus" — nicht
  wortgleich, aber dieselbe Aussage; die Nacharbeit nennt 19 % „nur im Satz des Judge
  und im Beleg".
- Fixture: `CHECKS_PASSED` trägt P-AUSGLEICH „RE-4471 ist mit dieser Zahlung
  ausgeglichen" auch am Rechnungssatz (`routine-case`) und am § 13b-Satz (FTC) —
  hinter dem Aufklappen, vorbestehend. `kindDescription` mit „(P58)" im `title` ist
  eine interne Nummer im Klartext (Fixture, vorbestehend).

**Urteil:** nicht abgenommen. Bau, Layout, Container-Grenze, Konfidenz/Quellen,
Judge-Zeile, `caseKind` und Schnittstellen-Tabellen sind grün; offen sind N1–N3
(Fixture und Texte, ohne Änderung am Baustein). H1 Owner-Bestätigung und H2
Editor-Befund bleiben offen.

Nachgeprüft von / am: Claude (fremder Nachprüfer), 2026-10-01

## Nacharbeit 2 (2026-10-01, nach der Nachprüfung)

| Punkt | Änderung | Stand |
|---|---|---|
| N1 Belegfeld im Satz widerspricht dem Befund | Der Satz im Slot trägt jetzt Belegfeld 1 „RE-4417" — genau das, was P-BELEG beanstandet | behoben |
| N2 Spec | „Einordnung" nennt `ProvenanceRows` und die Achse `confidence`; Zeile „Quellen" aus „Ausbau" gestrichen (gebaut); „Verhalten": der Editor im Slot bekommt kein `aiReview`; derselbe Satz in `befunde-app.md` §E | behoben |
| N3 Beschreibung `InUse` | sagt jetzt, was gerendert wird (`JournalEntryGrid`), und verweist auf den Editor-Befund | behoben |
| Hinweis P-UST wiederholt den Judge-Satz (19 %) | P-UST-Begründung ohne 19 % | behoben |
| Hinweis P-AUSGLEICH am falschen Satz | eigene Prüfpunkte für die Zahlung (`CHECKS_PAYMENT`); Rechnung und § 13b-Satz ohne Ausgleich | behoben |
| Hinweis „(P58)" im sichtbaren `title` | gestrichen (Technik hinter Klartext, T4) | behoben |
| H2 Editor-Spalte „Text" 0 px auch bei 728 px | vorbestehend, eigener Auftrag am Editor; betrifft die Fall-Ansicht der App bei 1280 px | offen, an llcto gemeldet |


## Nachprüfung 2 2026-10-01 (Stand e6b6e53)

Fremder Nachprüfer. Playwright im eigenen Kontext 1280 × 900, Story-IDs ohne Präfix
`v3-entitäten-buchungssatz-bookingreview--`, Prüfpunkte per `summary` aufgeklappt.
`BookingReview.tsx` seit 65c25e2 unverändert. Im Arbeitsbaum lag eine fremde,
nicht committete Änderung an `JournalEntryEditor.tsx` (Spalten, H2) — sie berührt
N1–N3 nicht; der Querscroll ist mit ihr gemessen.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| N1 Belegfeld im Satz = Befund | `case-editable`: Eingabe „Belegfeld 1" = „RE-4417"; `in-use` und `list-full`: Grid-Zeile trägt „RE-4417". P-BELEG rot „Belegfeld 1 „RE-4417" weicht von der Nummer auf dem Beleg „RE-4471" ab"; Beleg („RE-4471 · 21.08.2026", Kopf „Beleg RE-4471 · 1.475,60 €") und Quelle „Rechnung RE-4471" tragen die Belegnummer. Fixture `stories.tsx:113–114` | ✓ |
| N2 Spec | „Einordnung" Z. 22–25: `AiBookingNotesBody` (Begründung mit Quellen), `ProvenanceRows` (Satz des Judge als „Einschätzung"), `StatusBadge` mit Achse `confidence`. „Ausbau": nur noch Regelkontext. „Verhalten" Z. 101–103: Editor im Slot ohne `aiReview`; derselbe Satz in `befunde-app.md:378` (§E, 0219). Schnittstelle: Abschnitt seit 65c25e2 unverändert, `BookingReview.tsx` ebenso — Abgleich der Nachprüfung (M7) gilt weiter | ✓ |
| N3 Beschreibung `InUse` | `stories.tsx:276–281`: „der volle Satz steht als `JournalEntryGrid` in seiner weißen Fläche", Editor-Befund benannt — die Story setzt `JournalEntryGrid` | ✓ |
| Hinweis P-UST | aufgeklappt: „Steuerschlüssel und Satz auf dem Beleg passen zusammen." — 19 % nur noch in Judge-Satz, Beleg, Quelle und Kontonamen | ✓ |
| Hinweis P-AUSGLEICH | `expense-with-payment`: nur an „Satz 2 von 2 · Zahlung" (P-BETRAG, P-AUSGLEICH); § 13b-Satz und `routine-case` P-BETRAG, P-KONTO, „ausgeglichen" 0× | ✓ |
| Hinweis „(P58)" | alle sechs Stories: „P58" im Text 0×, in `title` 0× („Rechnung und Zahlung in einem Fall.", „Sachkonto und Geldkonto im selben Satz.") | ✓ |
| Gegenprobe | `list-compact`, `list-full`, `case-editable`, `routine-case`, `expense-with-payment`, `in-use`: 0 Konsolenfehler, `scrollWidth` 1280 = 1280 | ✓ |
| `typecheck`, `check:language` | beide Exit 0 („0 German comment lines"). `build` nicht gelaufen (Auftrag), Erbauer meldet ihn für e6b6e53 grün | ✓ |

**Urteil:** abgenommen. N1–N3 und die drei Hinweise sind behoben; Abnahmekriterien
abgehakt. Offen bleiben H1 (Owner-Bestätigung `caseKind`) und H2 (Editor-Spalte
„Text" bei 728 px, eigener Auftrag am Editor).

Nachgeprüft von / am: Claude (fremder Nachprüfer), 2026-10-01
