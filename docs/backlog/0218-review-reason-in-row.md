# 0218 · Prüfgrund in der Zeile — ein Wert statt drei (F355, Iteration 1)

| | |
|---|---|
| Status | in Arbeit — fremde Abnahme 2026-10-01: nicht abgenommen (M1 blockierend, M2–M7) |
| Stufe | `entities/journal-entry/` (`ReviewReasonCell`, T3 `JournalEntryReviewList`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Prüfbedarf eines Buchungsvorschlags (F232), Judge, Präzedenz |
| Quelle | Anfrage llcto 2026-10-01, Owner-Wunsch; Brief `ludwig/app` `docs/backlog/F355-booking-review-unified-design-brief.md` (6999e08f, Nachtrag f301c10b „Prüfgrund statt Stufe", cc28c51f), §1, §2, §5 Punkte 1–2 |
| Ersetzt | in T3 die Spalten „Prüfung durch Ludwig" (Konfidenz + Judge) und „Prüfbedarf" (Gründe + „x von y bestanden", 0217) |
| Blockiert | App F357 (Einbau); Iteration 2 „Buchungsprüfung" (0219) |
| Spec von / am | Claude (designsystem), 2026-10-01 |

## Ziel

In der Übersicht von Schritt 3 standen drei Werte nebeneinander: Ludwigs
Konfidenz, das Judge-Urteil und „x von y bestanden". Entschieden wird über
einen: den Prüfbedarf (`review-score.ts`). Die Zeile zeigt künftig den
**stärksten Prüfgrund** als kurzes Wort („Steuerschlüssel", „Beanstandet",
„§13b"), dahinter „+n", beim Überfahren die Einzelheit dieses Falls, im (i)
alle Gründe und die Rechnung. Routine bleibt leer. Daneben „So gebucht"
(Präzedenz).

## Einordnung

- **Wiederverwenden:** `Badge` (Ton aus der Registry, wie `StatusBadge`
  aussieht), `Popover` mit (i)-Knopf wie `BankTransactionPurpose`, `formatCount`.
- **Neu, weil:** keine Form zeigt einen Grund mit Einzelheit und aufschlüsselbarer
  Rechnung. `AiBookingNotesCell` zeigt Judge + Konfidenz — zwei der Teilwerte.
  Entitätsform „Zelle" (XS).
- **Wörter:** aus der App-Registry, Achse `review_reason` (Code → Wort, Ton,
  Beschreibung; Brief §1). Die App löst sie auf und reicht Wort, Ton und
  Einzelheit herein — das Set hat **keine** Wortliste. Grund: viele Codes sind
  parametrisch (`check_red:P-UST` → Kurzwort des Prüfpunkts), ein Registry-Schlüssel
  je Prüfpunkt wäre eine zweite Liste.
- **Zuschnitt:** `ReviewReasonCell` in eigener Datei; T3 ändert Spaltenkatalog und
  `ProposalRow`.

## Schnittstelle

### `ReviewReasonCell`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `reasons` | `readonly ReviewReasonView[]` | ja | Die Prüfgründe, stärkster zuerst (die App ordnet). Leer: Routine, die Zelle bleibt leer | T3 `Grouped` |
| `score` | `{ score: number; reasons: readonly ReviewReason[]; hard?: boolean }` | ja | Die Teile des Prüfbedarfs mit Punkten (`review-score.ts`) — fürs (i) | T3 `Grouped` |

`ReviewReasonView = { code: string; label: string; kind: StatusKind; detail?: string | null }`
(`StatusKind` aus der Registry, `ReviewReason` aus `review-score.ts`).

### T3 (`JournalEntryReviewList`, 0164)

| Feld / Spalte | Bedeutung | Nachweis |
|---|---|---|
| `ProposalRow.reviewReasons?: readonly ReviewReasonView[]` | → Spalte „Prüfgrund" (200 px): `ReviewReasonCell`; entschieden → „entschieden"; ohne Gründe leer | `Grouped`, `Flat`, `Compact` |
| `ProposalRow.reviewScore?: { score; reasons; hard? } \| null` | die Teile fürs (i); ohne sie keine Zelle | `Grouped` |
| `ProposalRow.priorSameBookings?: number \| null` | → Spalte „So gebucht" (72 px): `0` „erstmals", `n` „n×"; ohne Wert gilt `firstTime` („erstmals"), sonst leer | `Grouped`, `Flat` |
| `ProposalRow.reasons` | jetzt optional und `@deprecated` — nicht mehr gezeigt; die App lässt es weg | Code |
| `firstTime` | nur noch Rückfall für „So gebucht"; „erstmals" steht nicht mehr unter der Gegenpartei | `Grouped` |
| Spalte „Prüfung durch Ludwig" | raus aus `full` und `compact`; über `include: ["verdict"]` zuschaltbar (Schlüssel `review` → `verdict`) | Code |
| „x von y bestanden" in der Zeile | raus; die Prüfpunkte stehen im Aufklapper (`CheckItems`) | `Grouped` |

`full`: Datum · Gegenpartei · Soll · Name · Haben · Name · Betrag · BU · So gebucht ·
(Satzart, nur flach) · Prüfgrund. `compact`: Datum · Gegenpartei · Konten · Betrag ·
Prüfgrund. Optional: Nr. · Beleg · Prüfung durch Ludwig. „So gebucht" rechtsbündig
(eine Zahl, V3).

**Kann bewusst nicht:** den Prüfbedarf rechnen, Gründe ordnen oder Wörter
wählen (die App, F232/F357), den Reiter zeigen.

## Verhalten

- **Wort:** `Badge` im Ton der Registry. **A7 in der Liste:** Warnung ist die
  höchste Farbe — ein `danger` aus der Registry wird hier `warning`; Rot bleibt dem,
  was die Freigabe sperrt (roter Prüfpunkt im Fall). Zu langes Wort wird gekürzt,
  nie umgebrochen; ganz steht es im (i) (der `title` am Wort ist die Einzelheit).
- **Hover:** `title` am Wort = Einzelheit dieses Falls („Beleg weist 7 % aus,
  gebucht wurde BU 9 (19 %).", „Ludwig: 38 %", „BU 94 · Sachverhalt 7: …"); `title`
  an „+n" = die weiteren Wörter.
- **(i):** Knopf 24 × 24 px, `aria-label`/`title` „Prüfgründe und Berechnung". Im
  Feld alle Prüfgründe mit Wort und Einzelheit (der Weg für Tastatur und Touch),
  darunter „Prüfbedarf": je Teil Label und Punkte (echtes Minus, `tnum`), „Summe",
  „Schwelle ‚Bitte anschauen‘ 50" (`REVIEW_SCORING.threshold` aus dem Spiegel).
  Mit `hard` unter der Schwelle: „Ein Grund reicht allein für ‚Bitte anschauen‘."
- **Leer** (Routine): keine Gründe → leere Zelle, kein (i).
- **Lädt/Fehler/leer nach Filter:** nicht anwendbar — die Zelle kommt mit der Zeile.

## Stories

T3: `Grouped` (gruppiert), `Flat` (flach, ohne Namensspalten), `Compact`,
`ChecksWithoutExpand`, `States`. Die Fixture rechnet den Prüfbedarf mit der
Spiegel-Funktion `reviewScore()` und leitet die Prüfgründe nach der Tabelle des
Briefs ab (Wörter, Töne, Einzelheiten als Testdaten). Eine eigene Story für die
Zelle entfällt: sie hat keinen Zustand außerhalb einer Zeile, und `Grouped` zeigt
alle Töne, „+n", leer und „entschieden".

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Sortieren nach Prüfbedarf | `DataTable.sort` auf `reviewScore.score` | der Owner will die Liste danach ordnen |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Prüfgrund: stärkstes Wort als Badge im Registry-Ton, `danger` → `warning`; „+n" mit den weiteren Wörtern im `title`; Einzelheit im `title` des Worts (`Grouped`)
- [ ] (i) 24 × 24 px, per Tastatur; alle Gründe mit Einzelheit, Teile mit Vorzeichen (echtes Minus), Summe, Schwelle 50; Tabelle in Spalten (`Grouped`)
- [ ] Routine ohne Gründe → leere Zelle ohne (i); entschieden → „entschieden" (`Grouped`)
- [ ] „So gebucht": `0` → „erstmals", `n` → „n×", Rückfall `firstTime`; nicht mehr unter der Gegenpartei (`Grouped`, `Flat`)
- [ ] Keine Konfidenz, kein Judge, kein „x von y" in der Zeile; „Prüfung durch Ludwig" über `include: ["verdict"]` (Code, `Grouped`)
- [ ] T3 bei 1280 px ohne Querscroll, kein Gegenparteiname gekürzt, Zeilen ≤ 106 px (`Grouped`, `Flat`, gemessen); `Compact` mit Prüfgrund
- [ ] Keine Wortliste im Set (`grep` nach den Wörtern in `ReviewReasonCell.tsx` leer); Befund `review_reason` in `docs/befunde-app.md`

## Abnahme

Fremde Abnahme, Stand `1da1af0`. Gemessen mit Playwright, 1280 × 900, eigener
Browser-Kontext (danach geschlossen); Story-IDs ohne Präfix
`v3-entitäten-buchungssatz-journalentryreviewlist--`. Erwartungswerte aus der
Fixture selbst: die Zeilen 15–150 der Story mit esbuild gebündelt und mit der
echten `reviewScore()` ausgeführt, dann Zeile für Zeile gegen das DOM verglichen.
Typecheck und Wächter zusätzlich in einem eigenen Worktree von `1da1af0` (der
Arbeitsbaum trug während der Abnahme fremde WIP zu 0219), danach entfernt.
Screenshots `.playwright-mcp/abn0218-*.png`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` Exit 0 im Worktree `1da1af0` und im Arbeitsbaum. `pnpm build` nicht selbst gelaufen (Auftrag); der Erbauer meldet ihn für `1da1af0` grün | ✓ (build übernommen) |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/journal-entry/ReviewReasonCell.tsx` (Form Zelle, XS); keine eigene Story, in der Spec begründet (§ Stories); T3-Stories `v3/Entitäten/Buchungssatz/JournalEntryReviewList`. Aber: `ReviewReasonCell` und `ReviewReasonView` stehen in `1da1af0` nicht im Barrel → M2 | ✗ M2 |
| Code englisch; `@when`/`@instead` an jedem Export | `check:language` Exit 0 („0 German comment lines"), `check:when` Exit 0, beide `--test` grün; `ReviewReasonCell.tsx:45–49` trägt beide, der Nachbar `AiBookingNotesCell` ist im `@instead` genannt | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `.v3rrc*` (`v3.css:4784–4801`) nur Tokens, Ränder 1 px, Panel in `rem` wie `.v2purp__panel`; `check:type` Exit 0. Keine Wortliste: Wörter, Ton und Einzelheit kommen herein; `TONE` (`:31`) bildet nur `StatusKind` → `BadgeTone` (A7) ab; „Bitte anschauen" über `resolveStatus("review_tab", "needs_review")` (`:63`). Spurbreiten `"72px"`/`"200px"` folgen der `ColumnDef`-API wie alle Spalten der Datei | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `grouped`, `flat`, `compact`, `checks-without-expand`, `states` vorhanden; Lädt/Fehler/leer nach Filter für die Zelle begründet (§ Verhalten), `states` zeigt die vier Listenzustände mit den Köpfen „So gebucht" und „Prüfgrund". Fixture-Mängel → M5 | ✓ (M5) |
| Prüfliste `design-guidelines.md` §9 | Farbe nur Warnung/Hinweis, kein Rot; jedes farbige Badge trägt sein Wort; Lucide 14 px, Strich 1,5; (i) 24 × 24; Hover am (i) `rgb(113,113,113)` → `rgb(26,58,92)`, das Badge selbst ohne eigenes Hover; Schrift „+n" und Einzelheit `--fs-ui-sm` (12,5 px), Zellwerte 13,5 px wie die Nachbarn; Kontraste unten. Export über den Barrel fehlt (M2); „So gebucht" zeigt Zahlen linksbündig (H1) | ✓ (bis M2, H1) |
| Im Browser angesehen | alle fünf Stories gerendert, je 0 Konsolenfehler und 0 Warnungen im eigenen Kontext. `abn0218-grouped.png`, `abn0218-grouped-info-open.png` | ✓ |
| Prüfgrund: stärkstes Wort als Badge im Registry-Ton, `danger` → `warning`; „+n" mit den weiteren Wörtern im `title`; Einzelheit im `title` des Worts | `grouped` 40 Zeilen gegen die Fixture: Wort, Badge-Klasse, `title` des Worts, „+n" und dessen `title` — **0 Abweichungen** (30 Zellen: 16 × `bdg-warning`, 14 × `bdg-info`; z. B. Fall 27 „Steuerschlüssel" „+3", `title` „§13b · Ludwig nicht ganz sicher · Hinweis vom Judge"). Kontrast Warnung `rgb(140,96,30)` auf `rgb(245,238,224)` **4,78:1**, Hinweis `rgb(43,111,156)` auf `rgb(227,240,248)` **4,69:1**, „+n" 6,69:1. `danger` → `warning` nur im Code (`:31–37`): die Fixture reicht nie `danger` herein (M5). **Wirkung des `title`:** in `grouped`, `flat`, `checks-without-expand` liegt über Wort und „+n" die Fläche des Zeilen-Aufklappers — `elementFromPoint` in der Wortmitte trifft `BUTTON.v2rowbtn`, `:hover` am Wort `false`, kein Vorfahr mit `title`. Die Einzelheit erscheint beim Überfahren nicht. Nur `compact` (ohne Aufklapper) trifft das Wort | ✗ M1 |
| (i) 24 × 24 px, per Tastatur; alle Gründe mit Einzelheit, Teile mit Vorzeichen (echtes Minus), Summe, Schwelle 50; Tabelle in Spalten | 30 von 30 Knöpfen 24,0 × 24,0, `aria-label` = `title` = „Prüfgründe und Berechnung", `aria-expanded`/`aria-controls` gesetzt. Tab von der Aufklapp-Taste der Zeile: 4930 → 70021 → 94 → (i); Fokusring 2 px `rgb(59,143,196)`, 3,55:1, `:focus-visible`. Enter öffnet (Fall 27), die Zeile klappt nicht mit auf; Esc schließt, Fokus zurück am (i). Feld: vier Gründe je Badge + Einzelheit; „Prüfbedarf": „Prüfpunkt P-UST rot +100 · §13b / Sonderschlüssel +60 · 5× so gebucht −40 (U+2212) · Konfidenz orange +30 · Judge: mit Hinweis +15 · Summe 165 · Schwelle „Bitte anschauen" 50" — Wert je Zeile auf derselben Höhe rechts neben dem Label, rechtsbündig, `tabular-nums`. Fall 30 (hart, 35): „Ein Grund reicht allein für „Bitte anschauen"."; Fall 17 (20, nicht hart) ohne den Satz. Feld 464 px hoch, ragt bei 900 px Höhe 7 px unter den Rand (H3) | ✓ |
| Routine ohne Gründe → leere Zelle ohne (i); entschieden → „entschieden" | `grouped`: 7 Routinezeilen (Fälle 5, 8, 20, 26, 29, 36 und Fall 11 ohne Satz) leer, ohne Knopf; Fälle 0–2 „entschieden" (13,5 px, `rgb(45,45,45)`), keine `.v3rrc` darin | ✓ |
| „So gebucht": `0` → „erstmals", `n` → „n×", Rückfall `firstTime`; nicht mehr unter der Gegenpartei | `grouped` 40/40 und `flat` 12/12 gegen `priorSameBookings` der Fixture (z. B. Fall 4 „erstmals", Fall 0 „12×"); Spur 72 px. Rückfall `firstTime` nur im Code (`JournalEntryReviewList.tsx:325–327`), die Fixture setzt es nicht mehr. Unter der Gegenpartei steht nur `.v3prop__name` | ✓ |
| Keine Konfidenz, kein Judge, kein „x von y" in der Zeile; „Prüfung durch Ludwig" über `include: ["verdict"]` | Sichtbarer Zeilentext (`innerText`) aller 40 Zeilen: kein „Sicher/Plausibel/Unsicher", „Konfidenz", „bestanden", „x von y", kein Prozentwert; „Judge" nur im Prüfgrund-Wort „Hinweis vom Judge" (Wort des Briefs). Kopf „Prüfung durch Ludwig" in keiner Story. Code: `verdict` in `OPTIONAL` (`:129`), Filter `:361`; keine Story schaltet es zu (H4) | ✓ |
| T3 bei 1280 px ohne Querscroll, kein Gegenparteiname gekürzt, Zeilen ≤ 106 px; `Compact` mit Prüfgrund | `.v2tbl__scroll` `grouped` 1246 = 1246, `flat` 1246 = 1246. Zeilen `grouped` 63,7–105,6 px (40), `flat` 47,1–87,8 px (12). `.v3prop__name` mit `scrollWidth > clientWidth`: 0 in beiden; Text = Fixture. Spuren „So gebucht" 72, „Prüfgrund" 200. Kein Badge gekürzt. `compact` (680 px): Datum · Gegenpartei · Konten · Betrag · Prüfgrund, Fälle 5–10 = Fixture (2 leer, 4 mit Wort und (i)) | ✓ |
| Keine Wortliste im Set (`grep` nach den Wörtern in `ReviewReasonCell.tsx` leer); Befund `review_reason` in `docs/befunde-app.md` | `grep -nE "Beanstandet\|Steuerschl\|§ ?13b\|Sonderschl\|Korrigiert\|unsicher\|Hinweis vom\|gegengepr" ReviewReasonCell.tsx` → **ein Treffer**, Z. 20: JSDoc-Beispiel „Steuerschlüssel", „Beanstandet", „§13b". In der Sache keine Wortliste (kein Literal im Rendering, keine Abbildung Code → Wort); der Nachweis, wie die Spec ihn formuliert, schlägt fehl. Befund: `befunde-app.md:377` | ✗ M6 (in der Sache ✓) |
| Spec Zeichen für Zeichen gegen den Code | Prop-Tabelle = `ReviewReasonCell.tsx:51–59`, `ReviewReasonView` = `:17–25`; T3-Felder = `JournalEntryReviewList.tsx:49–63`, `:80–85`; Spuren `:323`, `:349`; `compact` und Optional stimmen. Abweichungen: Reihenfolge `full` (M3), Satz zu `title` (M4), veraltete Sätze am Rand (M7) | ✗ |

**Mängel**

| Nr. | Fundort | Befund · Messwert |
|---|---|---|
| M1 (blockierend) | `src/ui/v3/entities/journal-entry/ReviewReasonCell.tsx:68`, `:72`; `src/styles/v3.css:3874`, `:3875–3878` | Der Owner-Wunsch „Hover mit Einzelheit" kommt nicht an, sobald die Zeile aufklappt — und in der App klappt T3 immer auf. `.v2rowbtn::after` (`inset: 0; z-index: 1`) liegt über der ganzen Zeile; gehoben werden nur `a`, `input`, `summary`, `button`. Wort und „+n" sind `span`s: `elementFromPoint` trifft in `grouped`, `flat` und `checks-without-expand` in 30 + 6 + 3 Zellen `BUTTON.v2rowbtn`, `:hover` am Wort bleibt `false`, kein `title` erscheint. In `compact` (kein Aufklapper) trifft er das Wort. Weg: `.v3rrc__word` und `.v3rrc__more` wie die Links heben (`position: relative; z-index: 2`) und in einer Story mit Aufklapper nachmessen |
| M2 | `src/ui/v3/index.ts:611–616` (Stand `1da1af0`) | `ReviewReasonCell` und `ReviewReasonView` fehlen im Barrel (`package.json` exportiert nur `index.ts`). F357 braucht mindestens den Typ, um `reviewReasons` zu bauen. **Nachgezogen in `a3ed1dd`** (0219, während dieser Abnahme committet: `index.ts` exportiert jetzt `ReviewReasonCell, type ReviewReasonView`) — bei der Nachprüfung nur noch abhaken |
| M3 | Spec Z. 62–63 ↔ `JournalEntryReviewList.tsx:121` | Spec: „… BU · So gebucht · Prüfgrund (· Satzart flach)". Code und `flat`: „… BU · So gebucht · **Satzart** · Prüfgrund" (`"precedent", "verdict", "kind", "reviewReason"`). Was nachgibt, entscheidet die Nacharbeit |
| M4 | Spec Z. 73–74 ↔ `ReviewReasonCell.tsx:68` | „Zu langes Wort wird gekürzt … `title` und (i) tragen es ganz." Der `title` trägt die Einzelheit, nicht das Wort; ohne `detail` gibt es keinen `title`. Ein gekürztes Wort steht also nur im (i) ganz (in der Fixture wird keins gekürzt) |
| M5 | `JournalEntryReviewList.stories.tsx:88`; Spec Z. 92–93 | (a) Fall 32 (Dauerbuchung, Konfidenz rot) zeigt „Ludwig unsicher", das (i) daneben aber nur „1× so gebucht −10 · Summe −10" — die Regel-Herkunft erwartet keinen Judge, `reviewScore()` zählt keine Konfidenz, `reasonsFor` prüft `kind !== "recurring"` nur bei `confidence_low`, nicht bei `confidence_red`. Ein Grund ohne seinen Teil widerspricht „leitet die Prüfgründe nach der Tabelle des Briefs ab". (b) Kein Fall reicht `kind: "danger"` herein; „`Grouped` zeigt alle Töne" stimmt nur für Warnung und Hinweis, die A7-Abbildung `danger` → `warning` ist in keiner Story sichtbar |
| M6 | `ReviewReasonCell.tsx:20`; Spec Z. 121 | Der `grep`-Nachweis ist nicht leer (JSDoc-Beispiele). Entweder die Beispiele ohne Brief-Wörter schreiben oder das Kriterium auf Code ohne Kommentare fassen |
| M7 | `JournalEntryReviewList.tsx:31`, `:135`, `:211–212`, `:370`, `:426`; `JournalEntryReviewList.stories.tsx:102`, `:228` | Sätze am Rand, die 0218 überholt hat: Dateikopf „the row carries the judge's verdict"; `include` „— `number` and `document`" (jetzt auch `verdict`); beide `@when` „verdict, reasons" bzw. „verdict and reasons per row"; „the row already says how many passed"; Story-Kommentar „the „Sonderfall" column" (die Spalte gibt es nach Brief §1 nicht, und Schlüssel 91/94 stehen auch an Dauerbuchungen); `Compact` „no kind, no reasons" — `compact` zeigt jetzt den Prüfgrund |

**Hinweise** (kein Mangel, für Owner und App)

- H1: „So gebucht" ist linksbündig (`text-align: left`), obwohl „12×" eine Zahl ist
  (V3, §9 „Zahlen rechts mit `tnum`"). Die Spalte mischt Wort und Anzahl; die Spec
  legt nichts fest. Vorschlag: rechtsbündig mit `tnum`, dann steht „erstmals" mit.
- H2: Die Teile im (i) sprechen eine andere Sprache als die Gründe darüber: „Konfidenz
  rot" neben „Ludwig unsicher", „Judge: beanstandet" neben „Beanstandet", „Prüfpunkt
  P-UST rot" neben „Steuerschlüssel" — Farbwörter als Wert und ein Prüfpunkt-Code im
  Klartext („Technik hinter Klartext", Owner 2026-09-27). Die Labels kommen aus
  `review-score.ts` (App-Datenmodell) — ein Befund für die App, in `befunde-app.md` §E
  nachzutragen.
- H3: Das Feld ist bei vier Gründen 464 px hoch; `Popover` klappt nur nach oben, wenn
  dort Platz ist, und ragt sonst unter den Fensterrand (Fall 27 bei 900 px: 7 px).
  Verhalten des Primitivs, nicht von 0218.
- H4: `include: ["verdict"]` hat keine Story; die Spec nennt „Code" als Nachweis.
- H5: Nach Brief §1 kann ein Satz ohne Prüfgrund in „Bitte anschauen" stehen: „Aufwand
  oder Ertrag" +25 und „noch nie so gebucht" +25 erreichen die Schwelle 50, beide sind
  „kein Prüfgrund"; ebenso `no_proposal` (+100) aus `caseReviewScore`. Die Zelle bleibt
  dann im Reiter „Bitte anschauen" leer — eine Lücke im Brief, nicht im Set.
- H6: Der weggefallene Spaltenkopf `StatusHeader axis="review_tab"` nahm sein (i) mit.
  Sobald `review_reason` im Spiegel steht, erklärte ein `StatusHeader` am Kopf
  „Prüfgrund" alle Wörter an einem Ort (Vier-Wochen-Test).
- H7: Dieselbe Überdeckung wie M1 trifft den `title` der Gegenpartei (`.v3prop__name`)
  — älter als 0218 und folgenlos, solange kein Name gekürzt wird.

**Vier Linsen.** *Sprache:* kurze Kanzleiwörter aus dem Brief, „Prüfgründe und
Berechnung", „Summe", „Schwelle „Bitte anschauen"" mit dem Registry-Wort, echtes
Minus; die Teile im (i) bringen Farbwörter und Codes mit (H2). *Bedienung:* (i)
24 × 24, per Tab erreichbar, Enter öffnet, Esc schließt und gibt den Fokus zurück,
Ring 3,55:1, der Klick klappt die Zeile nicht mit auf; die Einzelheit beim
Überfahren ist mit der Maus nicht erreichbar, sobald die Zeile aufklappt (M1).
*Logik:* eine Spalte, ein Wert; Routine leer, entschieden benannt; die Wörter kommen
von der App, die Rechnung aus dem Spiegel; die Fixture zeigt einmal einen Grund ohne
seinen Teil (M5). *Darstellung:* Warnung höchste Farbe, kein Rot, jedes Badge mit
Wort, Kontraste 4,78 / 4,69:1, 1280 px ohne Querscroll, Zeilen ≤ 105,6 px; „So
gebucht" linksbündig (H1).

Abgenommen von / am: nicht abgenommen — Claude (Abnahme-Agent), 2026-10-01 ·
Offene Punkte: M1–M7 (M1 blockierend)

## Nacharbeit 2026-10-01 (nach der fremden Abnahme)

| Punkt | Änderung | Stand |
|---|---|---|
| M1 Hover kommt in aufklappbaren Zeilen nicht an | `.v3rrc__word`, `.v3rrc__more` über die Zeilenfläche gehoben (`position: relative; z-index: 2`, wie Links in der Zeile). Gemessen `grouped`: `elementFromPoint` trifft in sechs Zeilen das Wort, auch „+n" | behoben |
| M2 Barrel ohne `ReviewReasonCell` | seit a3ed1dd im Barrel (`ReviewReasonCell`, `ReviewReasonView`) | behoben |
| M3 Spaltenreihenfolge | Spec nach dem Code: „So gebucht · (Satzart, nur flach) · Prüfgrund" | behoben |
| M4 Satz zum gekürzten Wort | „ganz steht es im (i); der `title` ist die Einzelheit" | behoben |
| M5 Fixture | `confidence_red` nur bei Vorschlägen mit Judge (nicht bei Dauerbuchung); `check_red` kommt als `danger` herein und zeigt sich als Warnung — die A7-Abbildung ist in `grouped` zu sehen | behoben |
| M6 `grep` nicht leer | Beispielwörter aus dem JSDoc von `ReviewReasonView.label` genommen | behoben |
| M7 veraltete Sätze | Kopfkommentar, `include`-JSDoc (nennt `verdict`), beide `@when`, Kommentar am Aufklapper, `Compact`-Story | behoben |
| H1 „So gebucht" linksbündig | `align: "end"`, Kopf folgt | behoben |
| H2 Teile im (i) heißen anders als die Gründe | Befund an die App (`befunde-app.md` §E): die Labels der Teile in `review-score.ts` an die Wörter der Achse `review_reason` angleichen | an die App |
| H3 Popover 7 px unter dem Fensterrand bei vier Gründen | bleibt: der Rand gehört `Popover` (Ausrichtung nach unten), nicht diesem Feld | offen |
| H4 keine Story für `include: ["verdict"]` | bleibt (Option, kein Standard) | offen |
| H5 50 Punkte ohne Prüfgrund möglich (25 + 25) | Befund an die App: dann leert die Zelle — entweder ein Grund „Mehrere kleine Gründe" oder die Grundlast in die Achse | an die App |
| H6 (i) des alten Spaltenkopfs (`review_tab`) weg | bleibt: der Kopf „Prüfgrund" erklärt sich über das (i) je Zeile | — |

