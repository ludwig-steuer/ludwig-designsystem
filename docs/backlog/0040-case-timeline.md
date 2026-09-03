# 0040 · CaseTimeline — der Verlauf des Sachverhalts: Ereignisse, Klärungen, Erwartungen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/accounting-case/` |
| Klassen-Test | nein — kennt drei Tabellen des Sachverhalts (Ereignis, Klärung, Erwartung); der Strang darunter ist das Pattern `Timeline` (0023) |
| Quelle | Anfrage Owner 2026-09-03 (Sachverhalts-Detail `/clients/<slug>/<jahr>/cases/<id>`, Tab „Übersicht", Karte „Timeline") · Staging-Aggregate 2026-09-03 (§ Datenpunkte) · Entitätsprofil `docs/entitaeten/accounting-case.md` **fehlt noch** — diese Spec trägt den Verlaufs-Ausschnitt selbst; entsteht das Profil, gilt es vor |
| Ersetzt | `Timeline`/`TimelineItem` in `modules/accounting-cases/ui/sachverhalt/SachverhaltScreen.tsx` (Z. 145–273) und `EventIcon` in `sachverhalt/parts.tsx`; `EventStack` (`modules/accounting-cases/ui`) |
| Blockiert | Sachverhalts-Detail (Welle 1); die Sachverhalts-Ansicht des Portals |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Sachbearbeiterin fragt am Sachverhalt „was ist passiert, was fehlt noch?"
— und bekommt heute drei Antworten an drei Orten: die Ereignisse als
Timeline-Karten (Beleg, Zahlung, Sollstellung), die Rückfragen in der Ansicht
„Rückfragen", die fehlenden Belege im Block „Fehlt". Jede Timeline-Karte hat
fünf Zeilen (Datum/Betrag, Titel, Dateiname, Klassifikator-Zusammenfassung,
Badges); die Zusammenfassung wird abgeschnitten
(`app/timeline-summary-truncated.png`), bei 38 Ereignissen scrollt man durch
zwei Bildschirme.

Neu: **ein** Strang mit **einer Zeile je Eintrag** — Datum · Art · Titel ·
Betrag · Zustand — über Ereignisse, Klärungen (Fragen und Kommentare) und
offene Erwartungen. Alles Weitere (Datei, Zusammenfassung, Buchungssatz,
Antwort) steht rechts im Detail des ausgewählten Eintrags, wie heute schon
beim Ereignis.

## Entitäten im Verlauf

Was hineingehört, entscheidet eine Frage: „Ist das ein Punkt in der Zeit
dieses Vorgangs?"

| Entität | Tabelle | im Verlauf | Zeitpunkt | Zustand (Achse) | Grund |
|---|---|---|---|---|---|
| Ereignis | `client_accounting_event` | **ja** | `event_date` (Kalendertag) | `ereignis` (Buchungszustand) | der Verlauf heute; sieben Arten, siehe Ausprägungen |
| Klärung — Frage | `client_accounting_case_clarification`, `type='question'` | **ja, neu** | `created_at` | `klaerung_status` (Offen · Zurückgestellt · Beantwortet); dazu `klaerung` („Blockierend"), solange offen und `severity='required'` | Tabellenkommentar: „Die Historie eines Sachverhalts"; Anfrage Owner |
| Klärung — Kommentar | dieselbe, `type='comment'` | **ja, neu** | `created_at` | kein Zustand (`klaerung_typ`: „Kontext ohne Aktion") | gehört laut Tabellenkommentar zur selben Historie |
| Erwartung, offen | `client_accounting_case_expectation`, `resolved_at IS NULL` | **ja, neu** | `due_date` | `erwartung` (Reife); Art `erwartung_art` als Wort im Titel | der einzige Eintrag in der Zukunft — „was fehlt bis wann". Erledigte erscheinen nicht: das auflösende Ereignis steht schon im Strang (`resolved_by_event_id`) |
| Buchungssatz | `client_journal_entry` | nein — **als Zustand** des Ereignisses | — | `ereignis` | ein Satz je Ereignis (die App verdichtet vorher, `mergeBookings`); der Satz selbst steht im Detail (`JournalEntryEditor`, Anzeige) |
| Beleg · Bank-Transaktion · DATEV-Spiegelzeile | Quellen des Ereignisses (XOR) | nein — **im Ereignis** | — | — | Dateiname, Verwendungszweck, Zusammenfassung ins Detail |
| Audit-Ereignis | `platform_audit_events`, `resource_kind='accounting_case'` | nein — Tab „Historie" | — | — | p50 4 · p90 9 · max 84 je Sachverhalt (Staging); technisch (Actor, Action, Outcome), würde den Verlauf verdreifachen. Offene Frage 3 |
| DATEV-Spiegel als Karte | `listCaseDatevTruth` | nein — eigene Karte (heute `DatevHistoryCard`, künftig `SnapshotCard` 0027) | — | — | OPOS-Vorträge kommen ohnehin als Ereignis `open_item_carryover` |
| Sachverhalt selbst (geöffnet, geschlossen, Lifecycle) | `client_accounting_case` | nein — Kopf (`openedAt`, `closedAt`, `StatusBadge` Achse `sachverhalt`) | — | — | Lifecycle-Wechsel stehen nur im Audit |
| Wiederkehr-Regel | `client_accounting_case_rule` | nein | — | — | die Sollstellung erscheint als Ereignis `accrual` |

## Einordnung

- **Wiederverwenden:** `Timeline` (0023, `patterns/Timeline.tsx`) trägt
  Sortierung, Lückenzeile, Leer- und Ladezustand und `onOpen` — vier Fünftel.
  Es fehlen: die Markierung des ausgewählten Eintrags (MasterDetail), ein
  tagesgenaues `at` (Ereignis und Erwartung sind `date`-Spalten; „26.08.2026
  00:00" wäre eine Lüge) und eine Zeile **ohne** zweite Zeile (`kind ·
  actor`). `BatonBar` (`Process.tsx`) ist Besitz über Zeit, keine Einträge.
  `MasterDetail` rahmt die Seite. `StatusBadge` trägt jeden Zustand.
  `ExpectationRow` (0025) und `ChoicePrompt` (0028) sind Detail rechts, nicht
  Strang.
- **Erweitert (§3.2) `Timeline` 0023** um drei kleine Dinge, jedes eine
  wiederkehrende Designentscheidung (der Lauf-Log wählt Schritte aus, das
  Audit ist tagesgenau, Systemeinträge haben keinen Akteur):
  1. `selectedId?: string` — der Eintrag bekommt `aria-current="true"` und die Markierung.
  2. `at` darf ein Kalendertag sein (`YYYY-MM-DD`); dann steht keine Uhrzeit, `<time dateTime>` trägt den Tag.
  3. `kind` optional; ohne `kind` und `actor` entfällt die zweite Zeile.
- **Neu, weil §3.5:** Entitäts-Form. `ui-repraesentationen.md` führt den
  Verlauf heute als `EventStack` (Liste) und in `SachverhaltScreen` (Detail) —
  die Form existiert, unrein. Das Fachwissen der Form (welche Tabellen, welches
  Feld die Zeile trägt, welche Achse den Zustand) gehört nicht an die
  Aufrufstelle; die Sachverhalts-Ansicht des Portals braucht dieselbe Abbildung.
- **Zuschnitt:** eine Datei `entities/accounting-case/CaseTimeline.tsx`, ein
  Export `CaseTimeline`, dazu die vier Typen. Keine eigene Zeilenkomponente:
  die Zeilen sind `TimelineItem`s des Patterns; die Datei besitzt nur die
  Abbildung (drei Mapper, ein Sortierschlüssel). §4: kein Teil wird allein
  gebraucht, Trennen ergäbe Durchreich-Props.
- **Setzt auf:** `Timeline` (0023), `StatusBadge` (Achsen `ereignis`,
  `klaerung_status`, `klaerung`, `erwartung`), `Amount`, `Time` (im Pattern),
  Icons aus `lucide-react`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `events` | `CaseTimelineEvent[]` | ja | Ereignisse, unsortiert, ein Eintrag je Ereignis (Buchungen vorher verdichtet) | `Filled` |
| `clarifications` | `CaseTimelineClarification[]` | nein, Default `[]` | Fragen und Kommentare | `Filled` |
| `expectations` | `CaseTimelineExpectation[]` | nein, Default `[]` | Erwartungen; erledigte werden ignoriert | `Filled`, `Edge` |
| `selectedId` | `string \| null` | nein | markierter Eintrag (Id aus einer der drei Listen) | `Interactive` |
| `onSelect` | `(entry: CaseTimelineEntry) => void` | nein | Auswahl; ohne die Prop ist der Verlauf Text, kein Bedienelement | `Interactive` |
| `kindLabels` | `Record<string, string>` | nein | deutsches Wort je Ereignisart (Tooltip und `aria-label` des Icons) — **Übergang**, bis die Registry die Achse `ereignis_art` führt (Befund 1) | `EntryKinds` |
| `today` | `string` | nein | Bezugstag `YYYY-MM-DD` für Reife und Klärungszustand; Default heute — Stories setzen ihn fest | `Filled` |
| `loading` | `boolean` | nein | durchgereicht an das Pattern | `Loading` |

Die Komponente definiert **Sichten**, keine Wahrheit: je Feld die Spalte, aus
der die App es füllt. Was `src/ludwig/` schon hat, wird importiert
(`ClarificationType`, `ExpectationKind`, `CaseDisposition`,
`clarificationState`, `expectationMaturity`); was fehlt, ist Befund, nicht
Erfindung.

```ts
import type { CaseDisposition, ClarificationType, ExpectationKind } from "@/ludwig/modules/accounting-cases";

/** One row of `ludwig.client_accounting_event`; the app merges bookings first (`dedupeEvents`). */
export interface CaseTimelineEvent {
  id: string;
  /**
   * `kind` — CHECK: document_received · payment_in · payment_out ·
   * internal_transfer · adjustment · accrual · open_item_carryover.
   * Stays `string` until the mirror carries the type (finding 1).
   */
  kind: string;
  /** `event_date`, calendar day `YYYY-MM-DD`. */
  date: string;
  /** `title` (41 % filled) or the app's default (`deriveTitle`) — the component derives nothing. */
  title: string;
  /** `amount`; 0 means „not set" (27 %) — then no amount cell. */
  amount: number | null;
  currency: string;
  /**
   * Value of axis `ereignis`: open · proposed · accepted · posted ·
   * no_booking_required · blocked · planned — today `TimelineState` in `overview-vm.ts`.
   */
  state: string;
  /** `superseded_by_event_id` is set (F36). */
  superseded: boolean;
  /** `no_booking_required_reason` — the badge's tooltip instead of the registry text. */
  stateNote?: string | null;
}

/** One row of `ludwig.client_accounting_case_clarification`. */
export interface CaseTimelineClarification {
  id: string;
  /** `type`: question · comment */
  type: ClarificationType;
  /** `title` (99 % filled, p90 85 chars); without one the app shortens `professional_text`. */
  title: string;
  /** `created_at`, timestamp — the strand shows the day, the detail the time. */
  raisedAt: string;
  /** `answered_at` */
  answeredAt: string | null;
  /** `deferred_until` */
  deferredUntil: string | null;
  /** `severity` */
  severity: "required" | "optional";
  /** `audience` — detail only */
  audience: CaseDisposition;
}

/** One row of `ludwig.client_accounting_case_expectation`. */
export interface CaseTimelineExpectation {
  id: string;
  /** `kind`: document · payment */
  kind: ExpectationKind;
  /** `due_date`, calendar day */
  dueDate: string;
  /** `escalation_level` */
  escalationLevel: number;
  /** `resolved_at` — set → not rendered */
  resolvedAt: string | null;
  /** `expected_counterparty_name` */
  counterpartyName: string | null;
  /** `expected_amount` */
  amount: number | null;
  /** The table has no currency column — the caller passes the case's (finding 4). */
  currency: string;
}

/** What `onSelect` returns and what `selectedId` matches. */
export type CaseTimelineEntry =
  | { type: "event"; event: CaseTimelineEvent }
  | { type: "clarification"; clarification: CaseTimelineClarification }
  | { type: "expectation"; expectation: CaseTimelineExpectation };
```

Zustände werden **geholt, nicht gerechnet**: `clarificationState({ answeredAt,
deferredUntil, today })` und `expectationMaturity({ dueDate, escalationLevel,
resolvedAt, today })` aus `src/ludwig/modules/accounting-cases/domain/case.ts`;
der Ereigniszustand kommt fertig aus der App (Achse `ereignis`).

GLOSSARY: `accounting case` / Sachverhalt · Ereignis (Tabelle
`client_accounting_event`, kein eigener Eintrag — Befund 2) · `clarification
question` / Klärungsfrage, im UI „Rückfrage" · `expectation` / Erwartung,
mandantengerichtet „Nachforderung".

**Was die Komponente nicht kann (bewusst):**

- **Filtern nach Art.** Wer nur Ereignisse sehen will, gibt nur `events`; ein
  `Segmented` (`Nav.tsx`) über dem Strang gehört der Seite. Deshalb gibt es
  keinen Zustand „leer nach Filter".
- **Detail in der Zeile.** Kein Dateiname, keine Zusammenfassung, keine
  Disclosure — das Detail steht rechts (`MasterDetail`). Wer den Strang ohne
  Detailfläche zeigt (Portal), zeigt ihn als Text.
- **Hervorheben nach Konto** (heute `dimSet` der Saldo-Ansicht) — die
  Saldo-Ansicht gibt die zugehörigen `events`.
- **Laden, Buchen, Antworten, Vorschau öffnen.** Aktionen sind Sache des
  Details; das Auge in der Zeile entfällt.
- **Ordnung wählen.** Am Sachverhalt zählt das Letzte; `order` bleibt dem
  Pattern vorbehalten, bis eine zweite Seite „älteste zuerst" braucht.

## Ausprägungen

Eine Zeile ist immer `Datum · Icon · Titel · Betrag · Zustand`. Was je Art hineinkommt:

| Eintrag | Schlüssel | Icon (`lucide-react` 1.14, Vorschlag) | Titel (Quelle) | Betrag | Zustand | Staging |
|---|---|---|---|---|---|---|
| Beleg | `document_received` | `FileText` | `title` bzw. App-Default „Rechnung RE-4471 · Telekom", „Vertrag hochgeladen" | `amount` | `ereignis` | 338 |
| Zahlung Eingang | `payment_in` | `ArrowDownLeft` | „Zahlung von …" | `amount` | `ereignis` | 168 |
| Zahlung Ausgang | `payment_out` | `ArrowUpRight` | „Zahlung an …" | `−amount` — Vorzeichen aus der Art, wie heute (`neg`) | `ereignis` | 288 |
| Umbuchung | `internal_transfer` | `ArrowLeftRight` | Buchungstext | `amount` | `ereignis` | 0 |
| Korrektur | `adjustment` | `SlidersHorizontal` | Buchungstext bzw. „Korrekturbuchung" | `amount` | `ereignis` | 0 |
| Sollstellung | `accrual` | `Repeat` | Buchungstext bzw. „Abgrenzung" | `amount` | `ereignis` (`planned`, wenn vorausgeplant) | 26 |
| OP-Vortrag | `open_item_carryover` | `History` | „Offener Posten (DATEV)" | `amount` | `ereignis` | 426 |
| Ersetztes Ereignis | jede Art, `superseded` | wie die Art, gedimmt | — | — | `ereignis: superseded` **statt** des Buchungszustands — ein ersetztes Ereignis wird nicht mehr bearbeitet; der Satz steht im Detail | 0 % |
| Frage | `clarification.type = question` | `MessageCircleQuestionMark` | `title` | — | `klaerung_status`; dazu `klaerung: required` („Blockierend") nur solange offen | 153, davon 60 offen |
| Kommentar | `clarification.type = comment` | `MessageSquare` | `title` | — | kein Badge; Wort „Kommentar" im Tooltip (`klaerung_typ`) | 13 |
| Beleg fehlt | `expectation.kind = document` | `FileQuestionMark` | „Beleg fehlt: <Gegenpart>" — Wort aus `erwartung_art` | `expected_amount` | `erwartung` (Läuft · Fällig · Eskaliert) | 26 offen |
| Zahlung offen | `expectation.kind = payment` | `BanknoteArrowDown` | „Zahlung offen: <Gegenpart>" | `expected_amount` | `erwartung` | 6 offen, 13 erledigt |

Jedes Icon trägt sein Wort als `title` und `aria-label` (T8, V7) — für
Ereignisse aus `kindLabels`, für Klärung und Erwartung aus der Registry
(`klaerung_typ`, `erwartung_art`). Farbe kommt nur vom `StatusBadge`; das Icon
ist einfarbig.

### Kompakter: was aus der Zeile wandert

| heute in der Karte (`.tl-item`) | neu |
|---|---|
| Datum links, Betrag rechts (Zeile 1) | Datum · Betrag in **der** einen Zeile |
| Titel (Zeile 2) | Titel, darf umbrechen |
| Dateiname `docLabel` (Zeile 3) | Detail rechts |
| Klassifikator-Zusammenfassung `doc.summary`, kursiv, abgeschnitten (Zeile 4) | Detail rechts |
| `StateBadge` + `SupersededBadge` + Auge „Belegvorschau" (Zeile 5) | ein `StatusBadge`; Vorschau als Aktion im Detail |
| Icon links am Strang | bleibt, mit Wort im Tooltip |
| Kartenkopf „Timeline · n Ereignisse" | `CardHead` der Seite: „Verlauf · n Einträge" |

## Datenpunkte

Aus Staging (2026-09-03, nur Aggregate): 915 Sachverhalte · 1 246 Ereignisse ·
166 Klärungen · 45 Erwartungen. Je Sachverhalt: Ereignisse p50 1 · p90 2 ·
max 38; Klärungen 87 % ohne · max 6; Erwartungen 95 % ohne · max 2; **alle
Einträge zusammen p50 1 · p90 3 · max 44**. 58 % der Sachverhalte mit mehr als
einem Ereignis haben eine Lücke ≥ 7 Tage (Spanne p50 7 · p90 192 Tage) — die
Lückenzeile aus 0023 ist hier keine Theorie.

| Datenpunkt | Quelle | Rolle | Füllgrad | Zeile | Detail | Beleg |
|---|---|---|---|---|---|---|
| **Ereignis** | | | | | | |
| Tag (`event_date`) | Spalte | Zeit | 100 % | ✓ | | Sortierschlüssel |
| Art (`kind`) | Spalte | Identität | 100 % | Icon, Wort im Titel | | heute `EventIcon` |
| Titel (`title` / `deriveTitle`) | Spalte + App | Identität | 41 % / 100 % | ✓ | | p90 63 Zeichen |
| Betrag (`amount`, `currency`) | Spalte | Maß | 73 % (27 % = 0) | ✓ | | heute `tl-item__amt` |
| Buchungszustand | App, Achse `ereignis` | Zustand | 100 % | ✓ Badge | Satz | heute `StateBadge` |
| Ersetzt (`superseded_by_event_id`) | Spalte | Zustand | 0 % | Badge, gedimmt | | heute `SupersededBadge` |
| Begründung „keine Buchung" (`no_booking_required_reason`) | Spalte | Erklärung | 49 % | Tooltip des Badges | ✓ | heute `infoNote` |
| Dateiname (`original_file_name`) | Beleg | Erklärung | — | | ✓ | heute Zeile 3 |
| Zusammenfassung (`class_summary`) | Beleg | Erklärung | — | | ✓ | heute Zeile 4, abgeschnitten |
| Notizen (`notes`) | Spalte | Erklärung | 35 % | | ✓ | Annahme |
| Buchungssatz, Beleg-, Bankfakten | Relationen | — | | | ✓ (`JournalEntryEditor`, Beleg-/Bank-Pane) | heute `EventDetail` |
| **Klärung** | | | | | | |
| Gestellt am (`created_at`) | Spalte | Zeit | 100 % | ✓ | Uhrzeit | Sortierschlüssel |
| Titel (`title`) | Spalte | Identität | 99 % | ✓ | | p90 85 Zeichen |
| Art (`type`) | Spalte | Identität | 100 % | Icon | | Registry `klaerung_typ` |
| Zustand (`clarificationState`) | abgeleitet | Zustand | 100 % | ✓ Badge | | Registry `klaerung_status` |
| Schwere (`severity`) | Spalte | Zustand | 100 % | Badge, nur offen + `required` | | Registry `klaerung` |
| Adressat (`audience`) | Spalte | Verantwortung | 100 % | | ✓ | heute `audienceLabel` |
| Frage, Kontext, Fakten, Empfehlung, Quellen | Spalten | Erklärung | | | ✓ (`ChoicePrompt` 0028 zum Antworten) | heute `RueckfragenView` |
| Antwort (`answer_payload`, `answered_at`, `authorName`) | Spalten | Erklärung | 56 % | | ✓ | heute `answerText` |
| Wiedervorlage (`deferred_until`, `deferred_reason`) | Spalten | Zustand | 0 % | Zustand „Zurückgestellt" | Grund | Registry |
| **Erwartung** | | | | | | |
| Fällig (`due_date`) | Spalte | Zeit | 100 % | ✓, Prefix „bis" | | Sortierschlüssel; offene Frage 1 |
| Art (`kind`) | Spalte | Identität | 100 % | Wort im Titel | | Registry `erwartung_art` |
| Gegenpart (`expected_counterparty_name`) | Spalte | Identität | — | ✓ im Titel | | heute `FehltPanel` |
| Betrag (`expected_amount`) | Spalte | Maß | — | ✓ | | heute `FehltPanel` |
| Reife (`expectationMaturity`) | abgeleitet | Zustand | 100 % | ✓ Badge | | Registry `erwartung` |
| Adressat, Referenz, Belegdatum, Notiz | Spalten | Erklärung | | | ✓ (`ExpectationRow` 0025) | heute `FehltPanel` |

Ausgelassen (Technik): `id`, `tenant_id`, `client_id`, `fiscal_year_id`,
`agent_run_id`, `export_batch_id`, `workflow_run_id`, `updated_at`.

## Verhalten

- **Ein Strang.** Die drei Listen werden zu `TimelineItem`s (0023) mit
  tagesgenauem `at`: Ereignis `date`, Klärung `raisedAt` (auf den Tag gekürzt;
  die Uhrzeit steht im Detail), Erwartung `dueDate`. Neuestes zuoberst — damit
  stehen offene Erwartungen (Zukunft) über allem. Gleicher Tag: Erwartung vor
  Klärung vor Ereignis; die Komponente reiht in dieser Ordnung ein, das
  Pattern sortiert stabil.
- **Lückenzeile** ab sieben Tagen kommt aus dem Pattern.
- **Genau eine Zeile je Eintrag**: `Datum · Icon · Titel · Betrag · Badge` —
  kein `kind`/`actor` (zweite Zeile entfällt, Erweiterung 3), kein `detail`.
  Der Titel darf umbrechen; Betrag und Badge nicht. Betrag über
  `Amount size="sm"`; `null` oder 0 → leere Zelle, die Spalte bleibt
  ausgerichtet.
- **Auswahl:** mit `onSelect` sind Einträge Buttons (Pattern), `selectedId`
  markiert genau einen (`aria-current`). Tastatur: Tab von Eintrag zu Eintrag,
  Enter oder Leertaste wählt. Ohne `onSelect` ist der Verlauf Text.
- **Ersetzt:** gedimmt (`v2muted`), Badge `ereignis: superseded`, bleibt wählbar.
- **Erledigte Erwartung** (`resolvedAt`) wird nicht gerendert. Überfällige
  sinken mit ihrem Fälligkeitstag in die Vergangenheit; ihr Badge sagt „Fällig"
  oder „Eskaliert", die Seite hebt sie über `nextAction` ohnehin heraus.
- **Zustände:** gefüllt · leer („Noch nichts geschehen.", Pattern-Default) ·
  lädt (Skeleton). Kein „leer nach Filter" (kein Filter), kein Fehler (die
  Seite lädt).
- **Client-Component** — wie das Pattern (Auswahl).

## Stories

`v3/Entitäten/Sachverhalt/CaseTimeline`. Nach §6: 3 Zustände + 0 Enum-Props +
1 Callback + 1 „im Einsatz" + 1 Rand + 1 Ausprägungen (der Schlüssel
`kind`/`type` ist die Achse der Komponente, wie `variant` bei einem
Primitive) = 7.

| Story | Beweist |
|---|---|
| `Filled` | Musterfirma-Sachverhalt über sechs Wochen: Beleg, Zahlung, Sollstellung, eine beantwortete und eine offene blockierende Frage, ein Kommentar, eine offene Belegerwartung — unsortiert übergeben, `today` fest |
| `Empty` | drei leere Listen |
| `Loading` | `loading` |
| `EntryKinds` | alle Zeilen aus „Ausprägungen" untereinander, je einmal, mit `kindLabels` |
| `Interactive` | `selectedId`/`onSelect` im Rundlauf mit `useState`; die Ausgabe zeigt `entry.type` und Id; Gegenprobe ohne `onSelect` |
| `InUse` | in `MasterDetail`: Strang links in `Card` („Verlauf · 9 Einträge"), rechts das Detail des gewählten Eintrags (Ereignis: `FieldList` + `JournalEntryEditor` Anzeige; Frage: `ChoicePrompt`; Erwartung: `ExpectationRow`) |
| `Edge` | 44 Einträge über 190 Tage mit Lückenzeilen, Titel mit 85 Zeichen, Betrag 0, ersetztes Ereignis, erledigte Erwartung (fehlt), `payment_out` mit Vorzeichen |

Dazu in `patterns/Timeline.stories.tsx` (0023) je eine Ergänzung: `Selected`,
tagesgenaues `at`, Eintrag ohne `kind`.

Nicht anwendbar: „leer nach Filter" (kein Filter), „Fehler" (lädt nicht).

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

- [ ] Drei Listen ergeben **einen** Strang, absteigend nach Tag; gleicher Tag: Erwartung, Klärung, Ereignis (Story `Filled`, Reihenfolge der Ids im DOM)
- [ ] Genau eine Zeile je Eintrag: kein `.v2tl__who`, keine `Disclosure`, kein Dateiname, keine Zusammenfassung, kein Vorschau-Button im Strang (Story `Filled`, DOM)
- [ ] Zustände nur über `StatusBadge` mit den Achsen `ereignis`, `klaerung_status`, `klaerung`, `erwartung`; kein lokales Label-Objekt außer der Übergangs-Prop `kindLabels` (`grep`)
- [ ] `clarificationState()` und `expectationMaturity()` aus `src/ludwig/` importiert, keine zweite Ableitung (`grep -n "answeredAt\|dueDate <" CaseTimeline.tsx` trifft nur die Aufrufe)
- [ ] Erwartungen mit `resolvedAt` fehlen im DOM (Story `Edge`)
- [ ] `selectedId` → genau ein `[aria-current="true"]`; `onSelect` liefert `{ type, … }` (Story `Interactive`); ohne `onSelect` kein `button` im Strang
- [ ] Ersetztes Ereignis: gedimmt, Badge „Ersetzt", kein Buchungszustand (Story `Edge`)
- [ ] `payment_out` mit Minus; `amount` 0 oder `null` ohne Betragszelle (Story `Edge`)
- [ ] Jedes Icon hat `title` und `aria-label` mit deutschem Wort (Story `EntryKinds`, DOM)
- [ ] Lückenzeile „n Tage ohne Ereignis" bei ≥ 7 Tagen (Story `Edge`)
- [ ] 0023 erweitert: `selectedId`, tagesgenaues `at` ohne Uhrzeit, `kind` optional — je eine Story in `Timeline.stories.tsx`; bestehende 0023-Stories unverändert
- [ ] Tut bewusst nicht: filtern, Detail inline, nach Konto hervorheben — die Story `InUse` zeigt das Detail rechts
- [ ] Ersetzt `Timeline`/`TimelineItem`/`EventIcon` in `SachverhaltScreen.tsx`/`parts.tsx` ohne Funktionsverlust, bis auf die bewusst ins Detail verschobenen Punkte — **offen (App)**

## Befunde für `ludwig/app`

1. **Kein Ereignis-Typ im Spiegel.** `src/ludwig/` führt weder
   `EVENT_KINDS`/`EventKind` noch ein Label je Art; die Arten stehen nur im
   DB-CHECK und im `switch` von `EventIcon` (der zudem `contract_received` und
   `recurring` kennt, die es im CHECK nicht gibt, und `open_item_carryover`
   nicht). Gewünscht: `EVENT_KINDS` + `EVENT_KIND_LABEL` in `domain/case.ts`
   und die Registry-Achse `ereignis_art`. Bis dahin `kindLabels` (wie 0023).
2. **Kein GLOSSARY-Eintrag für das Ereignis** — `client_accounting_event`
   kommt nur in der Schichten-Tabelle und im Sachverhalts-Eintrag vor.
3. **`TimelineEventVM` lebt in `domain/overview-vm.ts` der App**, `CaseEvent`
   in `infrastructure/` — beides nicht gespiegelt. Die drei Sichten dieser
   Spec sind der Vorschlag, was der Spiegel tragen sollte.
4. **Erwartung ohne Währung**: `client_accounting_case_expectation` hat
   `expected_amount`, aber keine `currency`-Spalte; der Aufrufer nimmt die des
   Sachverhalts.
5. **Tag gegen Zeitstempel**: `event_date` und `due_date` sind `date`,
   `created_at` der Klärung ist `timestamptz` — der Verlauf ist tagesgenau;
   0023 zeigt Uhrzeiten und braucht Erweiterung 2.

## Offene Fragen

1. **Zeitpunkt der Erwartung**: Fälligkeit (`due_date`) oder Anlage
   (`created_at`)? — ohne Antwort: Fälligkeit; sie ist der einzige Eintrag in
   der Zukunft und steht damit oben, wo „was fehlt" hingehört.
2. **Beantwortete Frage**: ein Eintrag am Stelldatum mit Zustand
   „Beantwortet", oder zusätzlich ein zweiter am Antwortdatum? — ohne Antwort:
   einer; Antwortdatum und Antwort im Detail. Zwei Einträge verdoppeln die
   Klärungen im Strang.
3. **Audit-Ereignisse** (Routing an die Kanzlei, Zusammenführung, Belegnummer
   entschieden) im Verlauf? — ohne Antwort: nein, Tab „Historie"; p90 9 je
   Sachverhalt würden den Strang verdreifachen. Falls doch: eine vierte Liste
   `audit`, dieselbe Zeile, Icon `History`, kein Zustand.

## Befunde beim Bauen (2026-09-03)

**Aus drei Erweiterungen des Patterns wurden fünf.** Die Spec nennt
`selectedId`, tagesgenaues `at` und optionales `kind`; beim Bauen kamen zwei
kleine dazu, beide generisch und ohne Bruch an bestehenden Stories:

- `icon?: ReactNode` — die Ausprägungen-Tabelle verlangt ein Icon je Zeile.
  `state`/`StateIcon` trägt Prüfzustände, keine Arten; `title` ist ein String.
- `dim?: boolean` — „ersetzt: gedimmt" ist ohne Zugriff auf die Zeile nicht zu
  erreichen (`v2muted` gehört an den Container, nicht an den Titel).

**Betrag und Badge stehen jetzt neben dem Klickziel, nicht darin.** Das
Pattern packte `right` mit in den `TextButton`; mit Betrag *und* Badge klebte
der Betrag ohne Abstand am Titel, und ein Betrag war Teil des Weges. Beides
behoben — der Knopf trägt nur noch den Titel.

**`currency` ist `Currency`, nicht `string`** (Schnittstelle der Spec):
`Amount` nimmt den Typ aus `src/ludwig/shared/money`; ein `string` wäre eine
zweite Wahrheit über die Währungen.

**Nicht gebaut, weil die Bausteine fehlen:** `ExpectationRow` (0025) und
`JournalEntryEditor` im Detail der Story `InUse` — 0025 ist nicht gebaut, der
Editor braucht Kontodaten, die die Story nicht trägt. Das Detail zeigt
stattdessen eine `FieldList` je Art; die Aussage der Story („das Detail steht
rechts, nicht in der Zeile") bleibt.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
