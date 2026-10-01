# 0218 · Prüfgrund in der Zeile — ein Wert statt drei (F355, Iteration 1)

| | |
|---|---|
| Status | Abnahme — gebaut 2026-10-01 |
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
Prüfgrund (· Satzart flach). `compact`: Datum · Gegenpartei · Konten · Betrag ·
Prüfgrund. Optional: Nr. · Beleg · Prüfung durch Ludwig.

**Kann bewusst nicht:** den Prüfbedarf rechnen, Gründe ordnen oder Wörter
wählen (die App, F232/F357), den Reiter zeigen.

## Verhalten

- **Wort:** `Badge` im Ton der Registry. **A7 in der Liste:** Warnung ist die
  höchste Farbe — ein `danger` aus der Registry wird hier `warning`; Rot bleibt dem,
  was die Freigabe sperrt (roter Prüfpunkt im Fall). Zu langes Wort wird gekürzt,
  nie umgebrochen; `title` und (i) tragen es ganz.
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
