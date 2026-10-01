# 0219 · BookingReview — die Buchungsprüfung eines Falls, eine Ansicht für Liste und Fall (F355, Iteration 2)

| | |
|---|---|
| Status | Abnahme — gebaut 2026-10-01 |
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
  (Begründung bzw. Satz des Judge, je für sich), `StatusBadge` (Achsen
  `journal_entry`, `judge`), `CheckItems` (Prüfpunkte), `Badge` (Satzart).
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
| `lines` | `"compact" \| "full"` | nein | Standard `compact`: `JournalEntryCard` aus `entry.lines`. `full`: `entry.full` (Grid oder Editor des Aufrufers); fehlt er, die kompakte Form | `ListCompact`, `ListFull`, `CaseEditable` |
| `show` | `Partial<Record<"kind" \| "rationale" \| "checks" \| "judge" \| "evidence", boolean>>` | nein | Blöcke einzeln abschalten; Standard: alle an. Ein angeschalteter, aber leerer Block rendert trotzdem nicht | `ListCompact` (`evidence: false`) |
| `accountHref` | `(accountNumber: string) => string` | nein | an `JournalEntryCard` | `ListCompact` |
| `taxKeyHref` | `(taxKey: string) => string` | nein | an `JournalEntryCard` | `ListCompact` |

`BookingReviewEntry`:

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | `string` | Schlüssel |
| `lines` | `readonly JournalLine[]` | **alle** Zeilen des Satzes, Steuer, § 13b und Gegenkonto eingeschlossen — nie gefiltert (§3a) |
| `currency` | `Currency` | für `JournalEntryCard` |
| `full` | `ReactNode` | der volle Satz (`JournalEntryGrid` lesend oder `JournalEntryEditor` bearbeitend) für `lines="full"` |
| `kindLabel` | `string \| null` | Satzart als Wort der App-Registry („Aufwand", „Zahlung", „Aufwand mit Zahlung" …, P58) — neutrales Badge |
| `kindDescription` | `string \| null` | `title` des Badges |
| `status` | `string \| null` | Achse `journal_entry` |
| `rationale` | `string \| null` | Begründung des Agenten — bei Routine leer (F356) |
| `verdict` | `JudgeVerdict \| null` | Urteil des Judge |
| `judgeReasoning` | `string \| null` | Satz des Judge |
| `checks` | `readonly CheckItem[]` | Prüfpunkte dieses Satzes |
| `evidence` | `ReactNode` | Beleg & USt bzw. Zahlung, rechts neben dem Satz |
| `actions` | `ReactNode` | Handlungen an diesem Satz („Diesen Satz ablehnen") unter seinen Blöcken |

Typen: `JournalLine` (JournalEntryCompact), `JudgeVerdict` (AiBookingNotes),
`CheckItem` (Review), `Currency` aus `src/ludwig/shared/money`.

**Kann bewusst nicht:** den Satz bearbeiten (der Editor im Slot tut es),
Belegfelder darstellen (Slot), Aktionen des ganzen Falls („Freigeben") tragen —
die stehen beim Aufrufer unter dem Baustein, weil Freigeben den **Fall** freigibt.

## Verhalten

- **Reihenfolge je Satz** (Brief §3): Kopf → Buchungssatz → Begründung →
  Prüfpunkte → Judge → Handlungen. Rechts daneben, wenn vorhanden: Belege/Zahlung.
- **Kopf:** „Satz i von n" nur bei mehr als einem Satz; Satzart-Badge; Status —
  in `full` nicht, dort zeigt ihn die Form im Slot (Grid, Editor) selbst. Fehlt
  alles, kein Kopf.
- **Buchungssatz auf weißem Grund** — eigene weiße Fläche mit 1-px-Rand, auch im
  grauen Aufklapper einer Liste.
- **Begründung:** nur mit `rationale`, über `AiBookingNotesBody` — die Zeile trägt
  ihr Label „Begründung" selbst, eine Überschrift darüber entfällt. **Judge:** nur
  wenn relevant — Urteil ≠ `confirm` oder ein Satz des Judge vorhanden; Kopfzeile
  „Judge" mit dem Urteil als `StatusBadge` (`judge`), darunter der Satz über
  `AiBookingNotesBody`. **Prüfpunkte:** nur mit mindestens einem
  Punkt; `CheckItems` (y zählt nur prüfbare, nicht prüfbar als eigener Block).
- **Leer heißt unsichtbar:** ein Block ohne Inhalt rendert nicht, auch keine
  Überschrift.
- **Mehrere Sätze** (Zwei-Satz-Fall „Aufwand mit Zahlung", §3a): alle
  untereinander, jeder mit eigenen Prüfpunkten, durch eine Linie getrennt.
- Server-Component (kein Zustand); Tastatur und Fokus bringen die Bausteine mit.
- **Zustände:** gefüllt; leer (`entries` leer) → nichts (der Aufrufer zeigt „kein
  Vorschlag"); lädt/Fehler → beim Aufrufer (die Daten kommen mit dem Fall).

## Stories

Titel `v3/Entitäten/Buchungssatz/BookingReview`. Nach Brief §5 je Ausprägung:

| Story | Beweist |
|---|---|
| `ListCompact` | `lines="compact"`, wie im T3-Aufklapper: Satz kompakt auf weiß, Begründung, Prüfpunkte mit Befund, Judge mit Urteil „angepasst"; `evidence` aus |
| `ListFull` | `lines="full"` mit `JournalEntryGrid` lesend im Slot |
| `CaseEditable` | Fall-Ansicht: `lines="full"`, `JournalEntryEditor` bearbeitbar im Slot, Beleg & USt rechts, Handlung „Diesen Satz ablehnen" |
| `RoutineCase` | Routine: keine Begründung, Judge `confirm` ohne Satz → nur Kopf, Satz, Prüfpunkte |
| `ExpenseWithPayment` | zwei Sätze eines Falls (Rechnung + Zahlung), Satzart „Aufwand mit Zahlung"; dazu ein Einzelsatz Aufwand direkt an Bank mit § 13b-Zeilen — alle Zeilen sichtbar (§3a) |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Quellen der Begründung (heute im Editor über `aiReview`) | `entry.sources?: AiSource[]` an `AiBookingNotesBody` | die Liste soll Quellen zeigen |
| Vormonats-/Regelkontext („Regel & Periode") | `entry.context?` | ein Regel-Fall in der Liste braucht ihn |

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

- [ ] Reihenfolge je Satz: Kopf → Satz → Begründung → Prüfpunkte → Judge → Handlungen; Belege/Zahlung rechts (`CaseEditable`)
- [ ] Satz auf weißer Fläche, auch im grauen Aufklapper (`ListCompact`, gemessen: Hintergrund)
- [ ] Leere Blöcke rendern nicht, auch keine Überschrift (`RoutineCase`: keine „Begründung", kein „Judge")
- [ ] Judge nur bei Urteil ≠ confirm oder Satz vorhanden (`RoutineCase` vs. `ListCompact`)
- [ ] `show` schaltet jeden Block ab (`ListCompact` ohne Belege; Code)
- [ ] `lines`: compact = `JournalEntryCard` mit **allen** Zeilen inkl. Steuer/§ 13b/Gegenkonto; full = Slot (`ListFull`, `ExpenseWithPayment`)
- [ ] Mehrere Sätze untereinander, je „Satz i von n" mit eigenen Prüfpunkten (`ExpenseWithPayment`)
- [ ] Bei 1280 px kein Querscroll, Belege-Spalte rechts ohne Überlauf (`CaseEditable`, gemessen)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

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

