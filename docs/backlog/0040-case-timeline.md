# 0040 · CaseTimeline — der Verlauf des Sachverhalts: Ereignisse, Klärungen, Erwartungen

| | |
|---|---|
| Status | fertig |
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
Betrag · Zustand — über Ereignisse, Klärungen (**Fragen**; Kommentare
überspringt der Strang, siehe unten) und
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
| Klärung — Kommentar | dieselbe, `type='comment'` | **nein** (Owner 2026-09-04) | — | — | Kontext am Sachverhalt, nichts, was geschehen ist. 13 von 166 Klärungszeilen sind Kommentare; im Strang würden sie die Geschichte zuschütten. Sie stehen in `ClarificationList` (0059). Die Komponente **nimmt sie entgegen und überspringt sie** — der Aufrufer muss nicht filtern |
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
| `clarifications` | `CaseTimelineClarification[]` | nein, Default `[]` | Fragen **und** Kommentare — die Kommentare werden entgegengenommen und **übersprungen**, damit der Aufrufer nicht filtern muss | `Filled` |
===SPLIT===
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
| ~~Kommentar~~ | `clarification.type = comment` | — | — | — | **erscheint nicht** (Owner 2026-09-04). Die Zeile bleibt stehen als Erinnerung, dass die Komponente Kommentare entgegennimmt und überspringt | 13 |
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
Primitive) = 7. **Gebaut sind acht**: `SameDay` kam mit dem ersten Mangel der
Abnahme dazu — die Tagesordnung war in keiner der sieben zu sehen. Die
Ableitung zählt Achsen, nicht Nachweise; wo eine Abnahme einen fehlenden
Nachweis findet, wächst die Zahl um ihn (nachgezogen 2026-09-05).

| Story | Beweist |
|---|---|
| `Filled` | Musterfirma-Sachverhalt über sechs Wochen: Beleg, Zahlung, Sollstellung, eine beantwortete und eine offene blockierende Frage, eine offene Belegerwartung — unsortiert übergeben, `today` fest. Die Daten enthalten einen Kommentar, damit sichtbar ist, dass er **nicht** erscheint |
| `SameDay` | Drei Einträge auf demselben Tag: Erwartung vor Klärung vor Ereignis — die Regel, die der Strang stabil sortiert |
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

Abnahme am 2026-09-05 (zweiter Agent, gegen Spec und Code). Alle sieben
Stories auf `localhost:6107` geöffnet, `--interactive` und `--in-use` mit Tab
und Enter bedient.

**Story-Deckung.** Sieben Stories in der Spec, sieben Exporte in
`CaseTimeline.stories.tsx`, sieben IDs in `index.json` (`--filled`,
`--empty`, `--loading`, `--entry-kinds`, `--interactive`, `--in-use`,
`--edge`) — die Ableitung (3 Zustände + 1 Callback + 1 „im Einsatz" + 1 Rand
+ 1 Ausprägungen) geht auf. Jede Prop hat ihre Story: `events`/
`clarifications`/`expectations` (`Filled`) · `selectedId`/`onSelect`
(`Interactive`, mit Gegenprobe ohne `onSelect` daneben) · `kindLabels`
(`EntryKinds`) · `today` (in allen Stories fest auf `2026-09-03`) · `loading`
(`Loading`). „leer nach Filter" und „Fehler" sind begründet ausgeschlossen.
Die drei Ergänzungen in `patterns/Timeline.stories.tsx` sind da
(`--selected`, `--day-only`, `--without-kind`), die bestehenden 0023-Stories
unverändert.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme). `pnpm build` **nicht** neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`; der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/accounting-case/CaseTimeline.tsx`, Story daneben; Titel `v3/Entitäten/Sachverhalt/CaseTimeline` deckt sich mit der Barrel-Gruppe (`src/ui/v3/index.ts:324` „Sachverhalt — der Verlauf über Ereignisse, Klärungen, Erwartungen (0040)", Export `:326–331`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Ein Export (`CaseTimeline`, `:147`), `@when`/`@instead` bei `:140–146`; die Abgrenzung schickt an `Timeline`, `TodoList`, `ComparisonTable` und den Tab „Historie" weiter. Datei-JSDoc, Typkommentare und Inline-Kommentare durchgehend englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}'` = 0, `grep -cE '[0-9]+px'` = 0. Einziges Objekt in der Datei ist `EVENT_ICON` (`:111–119`) — eine Icon-Zuordnung, keine Label-Map; die Wörter kommen aus `resolveStatus("erwartung_art"…)` (`:185`), `resolveStatus("klaerung_typ"…)` (`:211`) und der Übergangs-Prop `kindLabels` (`:232`), die die Spec ausdrücklich erlaubt (Befund 1) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Eine Zeile je Eintrag, Text links, Betrag rechts mit `tabular-nums`, nichts zentriert · jeder farbige Zustand trägt sein Wort (`bdg-success` „Gebucht", `bdg-danger` „Eskaliert", `bdg-neutral` „Läuft") · jedes Icon trägt sein Wort als `title` **und** `aria-label`, das `svg` ist `aria-hidden` · Icons Lucide `stroke-width="1.5"`, `width="14"` · `selectedId` markiert mit Fläche **und** `aria-current` · die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle sieben IDs am 2026-09-05 geöffnet; `--interactive` mit Tab und Enter durchgespielt (drei Auswahlen: `expectation · ex-1`, `event · ev-3`, `event · ev-2`), `--edge` auf 45 Einträge und vier Lückenzeilen gezählt. Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Drei Listen ergeben **einen** Strang, absteigend nach Tag; gleicher Tag: Erwartung, Klärung, Ereignis | Erste Hälfte ✓: `--filled` reiht die drei Listen in einen `.v2tl` und zählt absteigend 15.09. (Erwartung) → 31.08. → 25.08. → 12.08. → 04.08. → 28.07. **Zweite Hälfte nicht nachweisbar:** in keiner der sieben Stories fallen zwei Einträge auf denselben Tag — in `Filled` sind alle sechs Tage verschieden, in `Edge` ebenso. Die Ordnung ist im Code angelegt (Erwartungen `:177`, Klärungen `:203`, Ereignisse `:230`, dazu der stabile Sort in `Timeline.tsx:124`), aber die Story, die der Nachweis nennt, zeigt sie nicht. Ein Datum doppelt zu belegen kostet eine Zeile | ✗ |
| Genau eine Zeile je Eintrag: kein `.v2tl__who`, keine `Disclosure`, kein Dateiname, keine Zusammenfassung, kein Vorschau-Button im Strang | `--filled` und `--entry-kinds`, DOM-Probe je Eintrag: `.v2tl__who` 0×, `details`/`summary` 0×. Der Kopf einer Zeile trägt genau vier Teile: `span.v2tl__kind` (Icon), `span.v2tl__title`, `span.v2amount--sm`, `span.bdg` — Dateiname und Zusammenfassung stehen nur im Detail der Story `InUse` | ✓ |
| Zustände nur über `StatusBadge` mit den Achsen `ereignis`, `klaerung_status`, `klaerung`, `erwartung`; kein lokales Label-Objekt außer `kindLabels` | Alle vier Achsen im Code belegt: `erwartung` (`:197`), `klaerung_status` (`:220`), `klaerung` (`:223`), `ereignis` (`:249–252`). Im DOM von `--entry-kinds` erscheinen die Registry-Wörter mitsamt ihrer Erklärung im `title`: „Buchung (Ereignis): Gebucht · In DATEV festgeschrieben — nur noch stornierbar.", „Reife: Eskaliert · Mehrfach überfällig …". Kein zweites Label-Objekt in der Datei | ✓ |
| `clarificationState()` und `expectationMaturity()` aus `src/ludwig/` importiert, keine zweite Ableitung | Import `:17–23` aus `@/ludwig/modules/accounting-cases/domain/case`. `grep -n "answeredAt\|dueDate <" CaseTimeline.tsx` trifft nur die Deklaration `:82` und den Aufruf `:207` — kein Vergleich, kein Datumsrechnen in der Datei. Sichtbar wird es an `--filled`: dieselbe Frage ist am 04.08. „Beantwortet", die vom 25.08. „Offen" + „Blockierend" | ✓ |
| Erwartungen mit `resolvedAt` fehlen im DOM (`Edge`) | `--edge`: die Erwartung `x-done` trägt den Gegenpart „erledigt — steht nicht im Strang"; `document.body.innerText.includes(...)` = **false**. Von zwei Erwartungen steht nur `x-open` da (`:178`, `if (e.resolvedAt) continue`) | ✓ |
| `selectedId` → genau ein `[aria-current="true"]`; `onSelect` liefert `{ type, … }`; ohne `onSelect` kein `button` im Strang | `--interactive`: linker Strang 6 `button`, rechter (ohne `onSelect`) **0**. Tab auf den ersten Eintrag, Enter → „Gewählt: expectation · ex-1", `[aria-current="true"]` genau 1×; nach zwei weiteren Auswahlen „event · ev-3" und „event · ev-2", die Markierung wandert mit und bleibt einzeln | ✓ |
| Ersetztes Ereignis: gedimmt, Badge „Ersetzt", kein Buchungszustand (`Edge`) | `--edge`: `div.v2tl__item.v2muted` mit „Rechnung RE-4470 · ersetzt / 1.249,90 € / **Ersetzt**" — obwohl `state: "posted"` übergeben ist, steht „Ersetzt" statt „Gebucht" (`:251`). Genau ein Eintrag der Story ist gedimmt | ✓ |
| `payment_out` mit Minus; `amount` 0 oder `null` ohne Betragszelle (`Edge`) | `--edge`: „Zahlung an Stadtwerke Musterstadt / **-412,00 €** / Gebucht" (übergeben wird `412`, das Vorzeichen kommt aus der Art, `:241`); „Korrektur ohne Betrag" (`amount: 0`) hat **keine** Betragszelle, der Kopf trägt nur Titel und Badge | ✓ |
| Jedes Icon hat `title` und `aria-label` mit deutschem Wort (`EntryKinds`) | `--entry-kinds`, DOM-Probe über alle elf `span.v2tl__kind`: `role="img"`, `aria-label` = `title` = „Beleg fehlt", „Zahlung offen", „Beleg", „Zahlungseingang", „Zahlungsausgang", „Umbuchung", „Korrektur", „Sollstellung", „OP-Vortrag", „Beleg", „Frage"; das `svg` darin `aria-hidden="true"`, `stroke-width="1.5"`, `width="14"` | ✓ |
| Lückenzeile „n Tage ohne Ereignis" bei ≥ 7 Tagen (`Edge`) | `--edge`: vier `div.v2tl__gap` — „21", „121", „9", „12 Tage ohne Ereignis". In `--filled` viermal (15 / 13 / 8 / 7 Tage), die 7 zeigt die Schwelle genau an der Kante | ✓ |
| 0023 erweitert: `selectedId`, tagesgenaues `at` ohne Uhrzeit, `kind` optional — je eine Story; bestehende 0023-Stories unverändert | `Timeline --selected`: genau ein `.v2tl__item.is-current` mit `aria-current="true"` und Fläche `rgb(241,247,251)` · `--day-only`: `<time dateTime="2026-08-28">28.08.2026</time>` ohne Uhrzeit neben `<time dateTime="2026-08-26T14:12:00.000Z">26.08.2026 16:12</time>` · `--without-kind`: `.v2tl__who` 0×, beide Einträge einzeilig. Die acht Stories aus 0023 stehen unverändert im Baum | ✓ |
| Tut bewusst nicht: filtern, Detail inline, nach Konto hervorheben — `InUse` zeigt das Detail rechts | `--in-use`: `MasterDetail`, links die `Card` „Verlauf", rechts `DetailPane` mit dem gewählten Eintrag (Feldliste je Art: Ereignis mit Zustand/Betrag/Datei/Zusammenfassung, Frage mit Adressat/Schwere/Antwort, Erwartung mit Art/Betrag/Eskalationsstufe). Kein Filter, kein `Segmented`, keine `dimSet` im Code. Dass statt `JournalEntryEditor`/`ChoicePrompt`/`ExpectationRow` eine `FieldList` steht, ist unter „Befunde beim Bauen" begründet | ✓ |
| Ersetzt `Timeline`/`TimelineItem`/`EventIcon` in `SachverhaltScreen.tsx`/`parts.tsx` ohne Funktionsverlust | Betrifft `ludwig/app`; in diesem Repo nicht erfüllbar | offen (App) |

**Abweichung, die in die Spec gehört: der Kommentar steht nicht im Strang**

`CaseTimeline.tsx:203–205` überspringt jede Klärung mit `type === "comment"`
und begründet das im Datei-JSDoc mit einem Owner-Entscheid vom 2026-09-04
(„13 von 166 Zeilen sind Kommentare; im Strang würden sie die Geschichte
überschwemmen", sie bleiben in `ClarificationList` 0059). Der Entscheid ist
jünger als die Spec und geht ihr vor — **aber die Spec sagt weiter das
Gegenteil**: die Tabelle „Entitäten im Verlauf" führt „Klärung — Kommentar …
**ja, neu**", und „Ausprägungen" gibt ihm eine eigene Zeile mit dem Icon
`MessageSquare`. Beides ist nachzuziehen; eine Abnahme ändert diese
Abschnitte nicht.

Im Bestand hinterlässt das drei Stellen, die etwas anderes behaupten, als sie
zeigen — und die gehören dem Code, nicht der Spec:

- `CaseTimeline.stories.tsx:107–109` (`Filled`) verspricht „eine beantwortete
  und eine offene blockierende Frage, **ein Kommentar** und die offene
  Belegerwartung"; gerendert werden sechs Einträge ohne den Kommentar.
- `:144–145` (`EntryKinds`) verspricht „Frage **und Kommentar**"; `k10`
  („Neuer Vertrag seit Juli.") steht nicht im DOM.
- `:243` (`InUse`) schreibt in den `CardHead` „**7 Einträge**"; gezählt werden
  im Browser **sechs** `.v2tl__item`. Die Zahl war vor dem Entscheid richtig.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Die Erwartung steht oben, wo „was fehlt" hingehört.** `--filled` beginnt
  mit dem 15.09. (Fälligkeit, Zukunft) — Offene Frage 1 ist so gebaut, wie
  sie ohne Antwort vorgesehen war.
- **`stateNote` hängt am Badge, nicht in der Zeile.** `--entry-kinds`, Eintrag
  „Offener Posten (DATEV)": der `title` des umschließenden `span` trägt
  „Vortrag aus dem Vorjahr, in DATEV bereits gebucht." — die Zeile bleibt
  vierteilig.
- **Der Rand hält.** `--edge` rendert 45 Einträge (44 Ereignisse + 1 offene
  Erwartung) ohne Konsolenfehler; der 89-Zeichen-Titel bricht um, Betrag und
  Badge bleiben einzeilig.
- **Der lange Titel der Story `Edge` ist kürzer als angekündigt.** Die Spec
  nennt 85 Zeichen als p90 der Klärungen; der lange Titel in `Edge` hängt am
  Ereignis und hat 89 Zeichen — passt, ist aber an einer anderen Entität
  gezeigt, als die Datenpunkte-Tabelle meint.

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`.

**Offene Punkte**

1. **Kein Nachweis für die Tagesordnung.** `Filled` (oder `Edge`) braucht zwei
   Einträge am selben Tag, damit „Erwartung vor Klärung vor Ereignis"
   überhaupt sichtbar wird.
2. **Spec und Code widersprechen sich beim Kommentar.** Die Abschnitte
   „Entitäten im Verlauf" und „Ausprägungen" müssen dem Owner-Entscheid vom
   2026-09-04 folgen (Kommentar → `ClarificationList` 0059) — durch den
   Spec-Autor, nicht durch die Abnahme.
3. **Drei Story-Texte behaupten den Kommentar weiter**
   (`CaseTimeline.stories.tsx:107`, `:144`) und `InUse` zählt „7 Einträge"
   statt sechs (`:243`).

## Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — die Sortierregel war in keiner Story sichtbar.** „Gleicher Tag →
Erwartung vor Klärung vor Ereignis" steht im Code (`CaseTimeline.tsx`,
Kommentar über der Sortierung), aber keine der sechs Stories belegte ein
Datum doppelt — die Regel war unbewiesen. Neue Story **`SameDay`**: drei
Einträge auf dem 26.08. Im Browser nachgemessen, Reihenfolge im DOM: „Beleg
fehlt: Bürobedarf Meier GmbH · Fällig" → „Gehört der Laptop ins
Anlagevermögen? · Offen · Blockierend" → „Rechnung RE-4471 · 1.249,90 € ·
Vorschlag". Ohne die Regel stünde die offene Belegerwartung unter dem
Ereignis, das sie erwartet.

**M2 — die Spec behauptete an vier Stellen Kommentare im Strang.** Der
Owner-Entscheid vom 2026-09-04 nimmt sie heraus, der Code hält sich daran,
und nur die Spec hinkte nach: die Tabelle „Entitäten im Verlauf" führte sie
als „ja, neu", die Ausprägungs-Tabelle gab ihnen ein Icon, das Ziel-Kapitel
zählte sie auf, und der Story-Text versprach sie — `InUse` zählte „7
Einträge", gerendert werden sechs.

Alle vier stehen jetzt richtig, und zwar **ohne die Zeilen zu löschen**: sie
sind durchgestrichen oder auf „nein" gesetzt, jeweils mit dem Grund. Wer die
Frage in einem halben Jahr neu stellt, findet die Antwort statt einer Lücke.
Der Satz, der dabei fehlte, steht jetzt in der Schnittstelle: die Komponente
**nimmt Kommentare entgegen und überspringt sie** — der Aufrufer muss nicht
filtern.

## Fremde Änderung an dieser Datei — der Verweis, den 0059 zugesagt hat

`CaseTimeline.tsx` überspringt seit 0059 Klärungen mit `type === "comment"`
(`:204–205`). Das ist **eine Regel des Strangs, keine Prop des Aufrufers**: 13
von 166 Klärungen im Bestand sind Kommentare, und sie sind Kontext, kein
Ereignis — der Owner hat am 2026-09-04 ausgeschlossen, sie als Sprechblase in
den Verlauf zu setzen. Sichtbar bleiben sie, wo sie hingehören: in
`ClarificationList` am Fall. `MessageSquare` als Import ist damit entfallen.

Die Begründung steht in `docs/backlog/0059-clarification-row.md`, Abschnitt
„Mitbringsel: `CaseTimeline` zeigt keine Kommentare mehr"; hier steht sie,
damit wer 0040 abnimmt, die fremde Zeile nicht für einen Fehler hält.

**Status-Nachtrag 2026-09-05.** Das Feld sagte
„Abnahme — zweiter Durchgang; beide Mängel behoben" — ein Satz statt eines Status.
`docs/backlog/README.md` sucht die offenen Aufgaben über
`grep -l "| Status | <wert> |"`, und damit war diese hier unsichtbar. Jetzt
`Abnahme`; die Sache dahinter ist unverändert: beide Mängel des zweiten
Durchgangs sind behoben, die Abnahme steht aus.

## Abnahme — zweiter Durchgang (2026-09-05)

Abgenommen gegen Spec und Code, nicht gegen den Chat. Alle **acht** Stories auf
`localhost:6107` geöffnet und im Blatt gemessen (`measure.mjs`, Ausdrücke über
`#storybook-root`), `--interactive` mit echten Tastendrücken über CDP bedient
(Tab · Enter · Leertaste), `--filled`, `--same-day` und `--entry-kinds`
zusätzlich als Bild angesehen. Der Nachtrag „Fremde Änderung an dieser Datei"
ist berücksichtigt: dass der Strang Klärungen mit `type === "comment"`
überspringt, ist der Owner-Entscheid vom 2026-09-04 und zählt hier nicht als
Fehler, sondern als Kriterium (der Aufrufer muss nicht filtern).

**Story-Deckung.** Acht Stories im Kapitel „Stories", acht Exporte in
`CaseTimeline.stories.tsx`, acht IDs in `index.json`: `--filled`, `--same-day`,
`--empty`, `--loading`, `--entry-kinds`, `--interactive`, `--in-use`, `--edge`.
Jede Prop hat ihre Story: `events`/`clarifications`/`expectations` (`Filled`) ·
`selectedId`/`onSelect` (`Interactive`, mit der Gegenprobe ohne `onSelect`
daneben) · `kindLabels` (`EntryKinds`) · `today` (in allen acht fest auf
`2026-09-03`) · `loading` (`Loading`). „leer nach Filter" und „Fehler" sind
begründet ausgeschlossen. Die Ableitung im Kapitel „Stories" rechnet noch mit
sieben; `SameDay` kam mit M1 dazu und trägt den Nachweis der Tagesordnung —
die Zeile „= 7" ist nachzuziehen, sie ist kein Mangel am Code. Die drei
Ergänzungen in `patterns/Timeline.stories.tsx` stehen (`--selected`,
`--day-only`, `--without-kind`).

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` **nicht** gelaufen (mehrere Sitzungen parallel, laut Auftrag untersagt); ersatzweise übersetzt und rendert der laufende Storybook alle acht Stories, `console-check.mjs` über alle acht: **0 Meldungen** — keine Warnung, kein Fehler | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/accounting-case/CaseTimeline.tsx`, `CaseTimeline.stories.tsx` daneben; Titel `v3/Entitäten/Sachverhalt/CaseTimeline` deckt sich mit dem Gruppen-Kommentar im Barrel (`src/ui/v3/index.ts:324`, Export `:325–331`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Ein Komponenten-Export (`CaseTimeline`, `:147`) mit `@when`/`@instead` (`:140–146`), dazu vier Typen mit englischem JSDoc. Bezeichner, Kommentare und Story-Exportnamen (`Filled`, `SameDay`, `EntryKinds`, `InUse`, `Edge` …) englisch; deutsch nur in sichtbaren Strings und in den Story-Beschreibungen, wie im übrigen v3 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}'` = 0, `grep -cE '[0-9]+px'` = 0, `grep -nE 'Intl\.|toLocale'` leer. Einziges Objekt ist `EVENT_ICON` (`:111–119`), eine Icon-Zuordnung; die Wörter kommen aus `resolveStatus("erwartung_art"…)` (`:185`), `resolveStatus("klaerung_typ"…)` (`:211`) und der von der Spec erlaubten Übergangs-Prop `kindLabels` (`:231`) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Vieles hält: eine Zeile je Eintrag, Zeilenhöhe 34 px, nichts zentriert · `.v2amount` trägt `font-variant-numeric: lining-nums tabular-nums` · jeder farbige Zustand trägt sein Wort (`bdg-success` „Gebucht", `bdg-danger` „Eskaliert", `bdg-warning` „Offen"/„Blockierend") · jedes Icon trägt sein Wort als `title` **und** `aria-label`, das `svg` ist `aria-hidden`, Lucide `stroke-width="1.5"`, `width="14"` · Fokusring sichtbar (`.v2link:focus-visible`, 2 px `--color-focus`, Offset 2) · Hauptweg per Tastatur belegt · gedämpfter Text `rgb(92,92,92)` auf `rgb(244,246,248)` = 6,1:1 · drei `prefers-reduced-motion`-Blöcke im Blatt · die zwei App-Punkte übersprungen. **Zwei Punkte reißen:** V3 „Zahlen rechts" (Mangel 1) und V13/T7 „Zeiten Europe/Berlin, kein String-Slicing" (Mangel 2) | ✗ |
| Im Browser angesehen, nicht nur gebaut | Alle acht IDs am 2026-09-05 geöffnet und gemessen; `--interactive` mit echten Tastendrücken bedient (Tab → erster Eintrag, Enter → „Gewählt: expectation · ex-1", zweimal Tab + Leertaste → „clarification · cl-3", Tab + Enter → „event · ev-2"); `--edge` auf 45 Einträge und vier Lückenzeilen gezählt; Bilder von `--filled`, `--same-day`, `--entry-kinds` angesehen | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Drei Listen ergeben **einen** Strang, absteigend nach Tag; gleicher Tag: Erwartung, Klärung, Ereignis | `--filled`: **ein** `.v2tl` mit sechs `.v2tl__item`, absteigend 15.09. (Erwartung) → 31.08. → 25.08. → 12.08. → 04.08. → 28.07. Die Tagesordnung zeigt jetzt `--same-day` (M1): drei Einträge auf dem 26.08., Reihenfolge im DOM „Beleg fehlt: Bürobedarf Meier GmbH · Fällig" → „Gehört der Laptop ins Anlagevermögen? · Offen · Blockierend" → „Rechnung RE-4471 · 1.249,90 € · Vorschlag" — Erwartung vor Klärung vor Ereignis, wie die Spec sie einreiht (`:177`, `:203`, `:230`) und das Pattern stabil sortiert (`Timeline.tsx:107–109`). Der Nachweis steht damit in `SameDay` statt in `Filled` | ✓ |
| Genau eine Zeile je Eintrag: kein `.v2tl__who`, keine `Disclosure`, kein Dateiname, keine Zusammenfassung, kein Vorschau-Button im Strang | `--filled` und `--entry-kinds`: `.v2tl__who` **0×**, `details`/`summary` **0×**. Der Kopf trägt drei bis vier Teile — `span.v2tl__kind`, `span.v2tl__title`, ggf. `span.v2amount--sm`, `span` mit dem Badge. Kein `.pdf` in einer Zeile (`--in-use`: `items.some(text.includes(".pdf"))` = false), Dateiname und Zusammenfassung stehen rechts im Detail | ✓ |
| Zustände nur über `StatusBadge` mit den Achsen `ereignis`, `klaerung_status`, `klaerung`, `erwartung`; kein lokales Label-Objekt außer `kindLabels` | Alle vier Achsen belegt: `erwartung` (`:197`), `klaerung_status` (`:220`), `klaerung` (`:223`), `ereignis` (`:249–252`); alle vier in der Registry geführt (`status-registry.ts:1923–1929`). Im DOM von `--entry-kinds` erscheinen die Registry-Wörter mit ihrer Erklärung im `title` des umschließenden `span`: „Reife: Läuft · Die Frist läuft noch …", „Stand: Offen · Wartet auf eine Antwort …", „Rückfrage: Blockierend · Muss beantwortet werden, bevor gebucht werden kann." Kein zweites Label-Objekt in der Datei | ✓ |
| `clarificationState()` und `expectationMaturity()` aus `src/ludwig/` importiert, keine zweite Ableitung | Import `:17–23` aus `@/ludwig/modules/accounting-cases/domain/case`. `grep -n "answeredAt\|dueDate <" CaseTimeline.tsx` trifft nur die Deklaration `:82` und den Aufruf `:207` — kein Vergleich, kein Datumsrechnen. Sichtbar in `--filled`: dieselbe Frage ist am 04.08. „Beantwortet", die vom 25.08. „Offen" + „Blockierend" | ✓ |
| Erwartungen mit `resolvedAt` fehlen im DOM (`Edge`) | `--edge`: `document.body.innerText.includes("erledigt — steht nicht im Strang")` = **false**; von den zwei Erwartungen steht nur `x-open` im Strang (`:178`, `if (e.resolvedAt) continue`) | ✓ |
| `selectedId` → genau ein `[aria-current="true"]`; `onSelect` liefert `{ type, … }`; ohne `onSelect` kein `button` im Strang | `--interactive`: linker Strang **6** `button`, rechter (ohne `onSelect`) **0**. Über echte Tastendrücke: Tab setzt den Fokus auf `button.v2link` „Beleg fehlt …", Enter → „Gewählt: expectation · ex-1", `[aria-current="true"]` genau **1×**; Leertaste auf der Klärung → „clarification · cl-3"; Enter auf dem Ereignis → „event · ev-2". Die Markierung wandert mit und bleibt einzeln; `--in-use` startet mit genau einer Markierung | ✓ |
| Ersetztes Ereignis: gedimmt, Badge „Ersetzt", kein Buchungszustand (`Edge`) | `--edge`: genau ein `div.v2tl__item.v2muted` — „Rechnung RE-4470 · ersetzt / 1.249,90 € / **Ersetzt**", obwohl `state: "posted"` übergeben wird (`:251`). Der Eintrag bleibt wählbar. Wie weit „gedimmt" trägt, steht unter „Zusätzlich gesehen" | ✓ |
| `payment_out` mit Minus; `amount` 0 oder `null` ohne Betragszelle (`Edge`) | `--edge`: „Zahlung an Stadtwerke Musterstadt / **-412,00 €**" bei übergebenen `412` — das Vorzeichen kommt aus der Art (`:241`); „Korrektur ohne Betrag" (`amount: 0`) hat **keine** `.v2amount` im Kopf. Der Nachweis dieser Zeile hält; was daneben reißt — „die Spalte bleibt ausgerichtet" aus „Verhalten" — steht in Mangel 1 | ✓ |
| Jedes Icon hat `title` und `aria-label` mit deutschem Wort (`EntryKinds`) | `--entry-kinds`, Probe über alle **elf** `span.v2tl__kind`: `role="img"`, `aria-label` = `title` = „Beleg fehlt", „Zahlung offen", „Beleg", „Zahlungseingang", „Zahlungsausgang", „Umbuchung", „Korrektur", „Sollstellung", „OP-Vortrag", „Beleg", „Frage"; das `svg` darin `aria-hidden="true"`, `stroke-width="1.5"`, `width="14"`, Lucide-Klassen `file-text`, `arrow-down-left`, `arrow-up-right`, `arrow-left-right`, `sliders-horizontal`, `repeat`, `rotate-ccw-clock` (= `History`), `file-question-mark`, `banknote-arrow-down`, `message-circle-question-mark` | ✓ |
| Lückenzeile „n Tage ohne Ereignis" bei ≥ 7 Tagen (`Edge`) | `--edge`: vier `div.v2tl__gap` — „21", „121", „9", „12 Tage ohne Ereignis". `--filled` viermal (15 / 13 / 8 / 7 Tage); die 7 zeigt die Schwelle genau an der Kante | ✓ |
| 0023 erweitert: `selectedId`, tagesgenaues `at` ohne Uhrzeit, `kind` optional — je eine Story; bestehende 0023-Stories unverändert | `Timeline --selected`: genau ein `.v2tl__item.is-current` mit `aria-current="true"` und Fläche `rgb(241,247,251)` · `--day-only`: `<time dateTime="2026-08-28">28.08.2026</time>` ohne Uhrzeit neben `<time dateTime="2026-08-26T14:12:00.000Z">26.08.2026 16:12</time>` · `--without-kind`: `.v2tl__who` 0×, beide Einträge einzeilig. Am Bestand hat 0040 nur `WithLabels` angefasst, und dort nur die Typanpassung an das jetzt optionale `kind` (`git show 396416d -- Timeline.stories.tsx`) — keine Aussage der Story ändert sich | ✓ |
| Tut bewusst nicht: filtern, Detail inline, nach Konto hervorheben — `InUse` zeigt das Detail rechts | `--in-use`: `div.v2md` mit `div.v2md__detail`, links die `Card` „Verlauf · 6 Einträge · Musterbau GmbH 2026" (die Zahl deckt sich jetzt mit den gezählten sechs `.v2tl__item`, M2 behoben), rechts die `FieldList` des gewählten Eintrags — Zustand, Betrag, Datei „RE-4471.pdf", Zusammenfassung. Kein `Segmented`, kein Filter, keine `dimSet` im Code | ✓ |
| Ersetzt `Timeline`/`TimelineItem`/`EventIcon` in `SachverhaltScreen.tsx`/`parts.tsx` ohne Funktionsverlust | Betrifft `ludwig/app`; in diesem Repo nicht erfüllbar. Steht als Ablösung in `docs/befunde-app.md` Abschnitt E | offen (App) |

**Mängel**

1. **Der Betrag steht in keiner Spalte, und ohne Betrag rutscht der Zustand an
   den Titel.** `src/styles/v3.css:1941` gibt allein dem Betrag
   `margin-left: auto`; `.v2tl__head` (`:1956`) ist eine Flex-Zeile, also
   hängt die Lage des Betrags an der Breite des Badges dahinter. Gemessen in
   `--entry-kinds` (rechte Kante der Zeile durchweg x = 636): die rechten
   Kanten der zehn Beträge liegen bei 582 · 571 · 567 · 563 (fünfmal) · 555 ·
   541 · 496 — 86 px Spanne, keine Spalte. Der eine Eintrag ohne Betrag
   („Gehört die Rechnung auf 6815?") setzt seine beiden Badges bei x = 349 ab,
   direkt hinter dem Titel (der bei 341 endet), statt rechts bei 636; in
   `--filled` dasselbe: die vier Beträge enden bei 582 · 563 · 555 · 541, die
   beiden Klärungszeilen ohne Betrag setzen ihr Badge bei x = 444 ab, während
   die Zeilen mit Betrag es bei 549 bis 590 tragen; in `--edge` steht das
   Badge von „Korrektur ohne Betrag" bei x = 290. Die Spec sagt
   unter „Verhalten": „`null` oder 0 → leere Zelle, **die Spalte bleibt
   ausgerichtet**", `design-guidelines.md` §9 sagt „Zahlen rechts" (V3).
   `amountCell` (`CaseTimeline.tsx:135–138`) gibt `null` zurück — es entsteht
   keine leere Zelle. Ob die Zelle leer gerendert wird oder das Badge-Paar
   sein eigenes `margin-left: auto` bekommt, entscheidet, wer baut.

2. **Der Tag der Klärung wird aus dem ISO-String geschnitten.**
   `CaseTimeline.tsx:130–133` — `day(iso) { return iso.slice(0, 10); }`,
   benutzt in `:215` als `at` der Klärung. `docs/web-ui-regeln.md:35–41` (R3)
   verbietet genau das: Zeit-Darstellung „nie über Regex/String-Slicing auf
   dem ISO-String", und V13/T7 verlangen Europe/Berlin. `created_at` ist
   `timestamptz` und kommt als UTC; nachgerechnet mit
   `node -e '…Intl…"Europe/Berlin"…'`: `2026-08-25T22:30:00Z` ist in Berlin
   der **26.08. um 00:30**, der Schnitt macht daraus den **25.08.** Eine
   nachts angelegte Rückfrage stünde damit einen Tag zu früh im Strang, unter
   der falschen Tagesüberschrift, mit einer falschen Lückenzeile — und das
   Detail, das laut Datenpunkte-Tabelle die Uhrzeit zeigt, widerspräche dem
   Strang. Keine Story trifft das Fenster (00:00–02:00 Berlin im Sommer,
   00:00–01:00 im Winter), deshalb ist im Browser nichts zu sehen; der Fehler
   steht im Code, nicht im Bild. `src/ui/v3/format.ts` hat heute keinen
   Tages-Schnitt zum Importieren — bei der Abnahme von 0023 ist `daysBetween`
   aus demselben Grund dorthin gezogen (`format.ts:130–146`). Dieselbe
   Abkürzung steht in `CaseTimeline.stories.tsx:293`
   (`c.raisedAt.slice(0, 10)`).

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **„Gedimmt" erreicht den Titel nicht.** `.v2muted` setzt nur die Farbe des
  Containers (`v3.css:174`), `.v2tl__title` setzt seine eigene (`:1932`) und
  gewinnt. Gemessen in `--edge`: die ersetzte Zeile hat Container
  `rgb(92,92,92)`, Titel aber `rgb(45,45,45)` — genau wie jede andere Zeile;
  sichtbar zurück tritt nur der Betrag. Im Bild trägt die Aussage der Badge
  „Ersetzt", nicht die Dämpfung. Das gehört dem Pattern 0023 (Prop `dim`,
  Klasse `v2muted`), nicht dieser Datei; die Abnahme von 0023 hat die
  Container-Farbe gemessen und den Titel nicht.
- **Das Klickziel ist nur der Titel.** In `--interactive` (Kopfbreite 375 px)
  sind die sechs Knöpfe 218 bis 279 px breit, also 58 bis 74 % der Zeile;
  rechts daneben — Betrag und Badge — reagiert nichts. Das ist unter „Befunde
  beim Bauen" bewusst so entschieden (Betrag und Badge aus dem Weg), steht
  aber gegen §9/I11 „Listenzeile mit Detail ist
  ganz klickbar" und gegen den Satz der Spec „mit `onSelect` sind **Einträge**
  Buttons". Eine Frage an den Owner, kein Mangel gegen ein Kriterium.
- **Ohne `kindLabels` steht der englische Schlüssel im `aria-label`.**
  `:231` fällt auf `ev.kind` zurück, also „document_received" statt „Beleg".
  Alle Stories reichen `kindLabels`, die App muss es auch — bis die Registry
  die Achse `ereignis_art` führt (Befund 1, `befunde-app.md` L-02).
- **Ein Story-Kommentar sitzt an der falschen Stelle.**
  `CaseTimeline.stories.tsx:318–322` beschreibt `Edge` („Der Rand: 44
  Einträge …"), steht aber über dem Kommentar von `SameDay` (`:323–328`);
  `Edge` (`:370`) hat damit keine eigene Beschreibung. Ohne Wirkung im
  Browser — dieser Storybook führt keine Docs-Seiten (`index.json` kennt nur
  `type: "story"`) —, aber wer die Datei liest, liest es falsch herum.
- **Das Detail zeigt die Uhrzeit nicht.** `--in-use`, Frage gewählt:
  „Rückfrage · gestellt am 2026-08-25". Die Datenpunkte-Tabelle sieht die
  Uhrzeit im Detail vor; die Story schneidet stattdessen den ISO-String
  (`:293`, siehe Mangel 2). Das Detail stellt die Story, nicht die
  Komponente — trotzdem ist es die Stelle, die den Satz „die Uhrzeit steht im
  Detail" belegen soll.
- **Der Rand hält.** `--edge` rendert 45 Einträge (44 Ereignisse + eine offene
  Erwartung) mit vier Lückenzeilen, ohne eine einzige Konsolenmeldung; der
  89-Zeichen-Titel bricht um, Betrag und Badge bleiben einzeilig. `--empty`
  zeigt einen Satz („Noch nichts geschehen."), `--loading` vier
  Skeleton-Zeilen mit `sr-only`-Text „Verlauf wird geladen …".

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`. Zwei Mängel, beide klein: die Ausrichtung der
Zeile (Mangel 1, sichtbar) und der Tagesschnitt (Mangel 2, nur im Code). Alles
andere steht.

## Die zwei Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — der Betrag stand in keiner Spalte.** `margin-left: auto` trug nur der
`Amount`; das Badge lief hinterher, und eine Zeile ohne Betrag setzte ihres
direkt hinter den Titel. Gemessen: zehn rechte Kanten über 86 px verteilt, ein
Badge bei x = 349 statt 636.

Zwei Änderungen, in zwei Schichten:

- **Der Strang** (`Timeline`, 0023) gibt dem rechten Ende **einen** Slot:
  `.v2tl__right` schiebt die ganze Gruppe an den Rand, statt nur einen Betrag
  darin. Was für Spalten in dem Slot stecken, weiß das Muster nicht — es
  garantiert die Kante.
- **Die Entität** (hier) setzt die Spalten: `rightEnd(amount, badges)` legt den
  Betrag in eine rechtsbündige Spalte von 96 px und die Badges in eine von
  140 px. Beide werden **auch dann belegt, wenn sie leer sind** — sonst
  begännen die Badges der Zeilen ohne Betrag dort, wo bei den anderen die Zahl
  endet. Die 140 px sind der breiteste Fall des Bestands: „Keine Buchung
  nötig" misst 132 px, das Paar „Offen · Blockierend" 140 mit seinem Abstand.

Nachgemessen (`--entry-kinds`, elf Einträge über alle drei Quellen): Betrag
rechts bei **484**, Badge links bei **496** — in jeder einzelnen Zeile
dieselben zwei Werte. `--filled` und `--edge` haben ihre rechte Kante bei 636,
über alle Zeilen gleich.

**M2 — der Tag der Klärung kam aus einem String-Schnitt.** `iso.slice(0, 10)`
verstößt gegen R3, und zwar folgenreich: `2026-08-25T22:30:00Z` ist in Berlin
der 26.08. um 00:30, der Schnitt macht den 25.08. daraus. Eine nachts
angelegte Rückfrage stünde einen Tag zu früh im Strang, und an Silvester im
falschen Jahr.

Behoben mit `calendarDay()` in `format.ts` — dort, wo `toDate` und die
Zeitzone schon wohnen. Gegengerechnet: die vier Fälle geben in Berlin
`2026-08-26`, `2026-08-26`, `2027-01-01` und `2026-08-26`, unabhängig davon,
in welcher Zeitzone der Prozess läuft; der Schnitt hätte zweimal den Vortag
geliefert.

`calendarDay` und `daysBetween` stehen beide im Barrel — die App bekommt ihre
Bausteine über `@/ui/v3`.

## Abnahmekriterien (Nachtrag)

- [ ] Betrag und Badge stehen in jeder Zeile auf derselben Kante (Story `EntryKinds`, gemessen)
- [ ] Eine Zeile ohne Betrag verschiebt ihr Badge nicht (dieselbe Story, der Klärungs-Eintrag)
- [ ] Kein String-Schnitt auf einem ISO-Datum mehr (`grep -n "slice(0, 10)"` findet nichts)
- [ ] `calendarDay` gibt den Berliner Tag, auch für 22:30 UTC und Silvester
## Abnahme — dritter Durchgang (2026-09-05)

Abgenommen gegen Spec und Code, nicht gegen den Chat. Stand `17be1ab`. Alle
acht Stories auf `localhost:6107` geöffnet und im Blatt gemessen
(`measure.mjs`, Ausdrücke über `#storybook-root`), `--interactive` mit echten
Tastendrücken über CDP bedient (Tab · Enter · Leertaste), `calendarDay` zur
Laufzeit aus dem Barrel geholt und in **fünf** Zeitzonen des Prozesses
gerechnet. Die Kriterien der beiden Vorrunden sind mitgeprüft; die Behebung
hat davon nichts umgeworfen.

**Nachtrag (die zwei Mängel der zweiten Abnahme)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Betrag und Badge stehen in jeder Zeile auf derselben Kante | in **jeder** Zeile von **fünf** Stories gemessen, rechte Kante des Betrags und linke des Badge-Feldes: `--entry-kinds` (11 Zeilen) 484 / 496 · `--filled` (6) 484 / 496 · `--edge` (45) 484 / 496 · `--same-day` (3) 484 / 496 · `--in-use` (6) 811 / 823 — in jeder Story ein einziges Wertepaar, und die rechte Kante der Zeile liegt durchweg auf 636 bzw. 963. Vorher: zehn Kanten über 86 px verteilt | ✓ |
| Eine Zeile ohne Betrag verschiebt ihr Badge nicht | dieselbe Messung, die Zeilen ohne `.v2amount`: `--entry-kinds` „Gehört die Rechnung auf 6815?" (Badge-Paar „Offen · Blockierend") 496 · `--filled` zwei Klärungszeilen 496 · `--edge` „Korrektur ohne Betrag" 496 · `--same-day` zwei Einträge 496. Die leere Betragsspalte wird belegt (`.v2ct__amt`, 96 px), das Badge beginnt, wo es bei den anderen beginnt | ✓ |
| Kein String-Schnitt auf einem ISO-Datum mehr | `grep -rn "slice(0, 10)" src/ui/v3/` findet **zwei** Stellen: `format.ts:151` (der Kommentar, der davor warnt — richtig so) und **`CaseTimeline.stories.tsx:293`**, wo der Schnitt weiter im Code steht. Genau diese Zeile hatte die zweite Abnahme unter Mangel 2 benannt — siehe Mangel 1 | ✗ |
| `calendarDay` gibt den Berliner Tag, auch für 22:30 UTC und Silvester | zur Laufzeit im Blatt: `await import('/src/ui/v3/index.ts')` und dann gerechnet, den Prozess des headless Chromium jeweils mit gesetztem `TZ` gestartet (Europe/Berlin · Asia/Tokyo · Pacific/Kiritimati (+14) · Pacific/Midway (−11) · America/Los_Angeles). In **allen fünf** dieselben Werte: `2026-08-25T22:30:00Z` → **2026-08-26**, `2026-08-25T21:30:00Z` → 2026-08-25 (die Kante der Sommerzeit), `2026-12-31T23:30:00Z` → **2027-01-01**, `2026-12-31T22:00:00Z` → 2026-12-31 (die Kante der Winterzeit), `2027-01-01T00:30:00Z` → 2027-01-01, die Tagesstrings `2026-08-26` und `2027-01-01` unverändert, Unsinn → `""`. Der Schnitt hätte zweimal den Vortag geliefert (`2026-08-25`, `2026-12-31`). In `CaseTimeline.tsx:233` wird die Funktion für `raisedAt` benutzt | ✓ |

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` **nicht** gelaufen (mehrere Sitzungen parallel, laut Auftrag untersagt); ersatzweise übersetzt und rendert der laufende Storybook alle acht Stories, `console-check.mjs` über alle acht: **0 Meldungen** | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/accounting-case/CaseTimeline.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Sachverhalt/CaseTimeline` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `CaseTimeline` trägt beide Zeilen (`:160–166`), die vier Typen englischen JSDoc; die neue Hilfe `rightEnd` (`:137–158`) ist modulintern und erklärt sich. **In `format.ts` hat der Fix einen Doc-Block von seiner Funktion getrennt** — siehe Mangel 2 | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}'` = 0, `grep -cE '[0-9]+px'` = 0 in `CaseTimeline.tsx`; die neuen Maße stehen als `.v2ct__amt` / `.v2ct__state` im Blatt (`v3.css:1947–1948`), nicht in der Komponente. Einziges Objekt bleibt `EVENT_ICON`; Wörter aus `resolveStatus(…)` und der erlaubten Übergangs-Prop `kindLabels` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | acht Exporte, acht IDs (`--filled`, `--same-day`, `--empty`, `--loading`, `--entry-kinds`, `--interactive`, `--in-use`, `--edge`); „leer nach Filter" und „Fehler" begründet ausgeschlossen. Die Ableitung im Kapitel „Stories" rechnet weiter mit sieben — unverändert nachzuziehen, kein Mangel am Code | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | V3 hält jetzt: Zahlen rechts, in einer Spalte, `tabular-nums`; nichts zentriert; Zeilenhöhe 34 px bei einzeiligem Titel. V13/T7 hält in der Komponente (`calendarDay` statt Schnitt), reißt aber noch in der Story (Mangel 1). Farbe nur als Stufe, jeder farbige Zustand mit Wort; jedes Icon mit `title` **und** `aria-label`, `svg` `aria-hidden`, Lucide `stroke-width="1.5"`, `width="14"`; Fokusring nach echten Tab-Anschlägen sichtbar; kein waagerechter Überlauf in einer der acht Stories; die zwei App-Punkte übersprungen | ✗ |
| Im Browser angesehen, nicht nur gebaut | alle acht IDs geöffnet und gemessen; `--interactive` mit echten Tastendrücken bedient; `--filled` zusätzlich mit einer zur Laufzeit verbreiterten Badge-Gruppe gemessen (siehe „Zusätzlich gesehen") | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Drei Listen ergeben **einen** Strang, absteigend nach Tag; gleicher Tag: Erwartung, Klärung, Ereignis | `--filled`: **ein** `.v2tl` mit sechs `.v2tl__item`, `datetime` absteigend 2026-09-15 → 08-31 → 08-25 → 08-12 → 08-04 → 07-28. `--same-day`: drei Einträge, alle mit `datetime="2026-08-26"`, DOM-Reihenfolge „Beleg fehlt: Bürobedarf Meier GmbH · Fällig" → „Gehört der Laptop ins Anlagevermögen? · Offen · Blockierend" → „Rechnung RE-4471 · 1.249,90 € · Vorschlag" | ✓ |
| Genau eine Zeile je Eintrag | `--filled`, `--same-day`, `--edge`, `--entry-kinds`, `--interactive`: `.v2tl__who` **0×**, `details`/`summary` **0×**; `--in-use`: keine Zeile enthält „.pdf" (der Dateiname steht rechts im Detail) | ✓ |
| Zustände nur über `StatusBadge` mit den vier Achsen; kein lokales Label-Objekt außer `kindLabels` | `erwartung` (`:216`), `klaerung_status` (`:239`), `klaerung` (`:242`), `ereignis` (`:267–271`); im DOM von `--entry-kinds` die Registry-Wörter samt Erklärung im `title` | ✓ |
| `clarificationState()` und `expectationMaturity()` aus `src/ludwig/` importiert, keine zweite Ableitung | Import `:18–24`; kein Datumsvergleich in der Datei. Sichtbar in `--filled`: dieselbe Frage am 04.08. „Beantwortet", die vom 25.08. „Offen" + „Blockierend" | ✓ |
| Erwartungen mit `resolvedAt` fehlen im DOM (`Edge`) | `--edge`: `innerText.includes("erledigt — steht nicht im Strang")` = **false**; 45 Einträge, davon eine Erwartung | ✓ |
| `selectedId` → genau ein `[aria-current="true"]`; `onSelect` liefert `{ type, … }`; ohne `onSelect` kein `button` | `--interactive`: **6** `button` links, **0** rechts. Echte Tastendrücke: Tab → Fokus auf `button.v2link` „Beleg fehlt …", Enter → „Gewählt: expectation · ex-1", `[aria-current="true"]` genau **1×**; zweimal Tab + Leertaste → „clarification · cl-3"; Tab + Enter → „event · ev-2"; die Markierung wandert mit und bleibt einzeln | ✓ |
| Ersetztes Ereignis: gedimmt, Badge „Ersetzt", kein Buchungszustand (`Edge`) | `--edge`: genau ein `.v2tl__item.v2muted` — „Rechnung RE-4470 · ersetzt / 1.249,90 € / **Ersetzt**", obwohl `state: "posted"` übergeben wird | ✓ |
| `payment_out` mit Minus; `amount` 0 oder `null` ohne Betragszelle (`Edge`) | `--edge`: „Zahlung an Stadtwerke Musterstadt / **-412,00 €**" bei übergebenen `412`; „Korrektur ohne Betrag" (`amount: 0`) hat keine `.v2amount` — die Spalte bleibt aber belegt und ausgerichtet (Nachtrag 1) | ✓ |
| Jedes Icon hat `title` und `aria-label` mit deutschem Wort (`EntryKinds`) | `--entry-kinds`, alle elf `span.v2tl__kind`: `role="img"`, `aria-label` = `title` = „Beleg fehlt", „Zahlung offen", „Beleg", „Zahlungseingang", „Zahlungsausgang", „Umbuchung", „Korrektur", „Sollstellung", „OP-Vortrag", „Beleg", „Frage"; `svg` je `aria-hidden="true"`, `stroke-width="1.5"`, `width="14"` | ✓ |
| Lückenzeile „n Tage ohne Ereignis" bei ≥ 7 Tagen (`Edge`) | `--edge`: vier `.v2tl__gap` (21 · 121 · 9 · 12); `--filled` vier (15 · 13 · 8 · 7) — die 7 zeigt die Schwelle genau an der Kante | ✓ |
| 0023 erweitert: `selectedId`, tagesgenaues `at`, `kind` optional; bestehende 0023-Stories unverändert | `Timeline --selected`: genau ein `.v2tl__item.is-current`, `aria-current="true"`, Fläche `rgb(241,247,251)` · `--day-only`: `datetime="2026-08-28"` → „28.08.2026" ohne Uhrzeit neben `datetime="2026-08-26T14:12:00.000Z"` → „26.08.2026 16:12" · `--without-kind`: `.v2tl__who` 0×. Der Fix hat `Timeline.tsx` angefasst (der Slot `.v2tl__right`), nicht die Stories: `--filled`, `--with-labels`, `--order`, `--grouping`, `--interactive`, `--with-gap`, `--in-use`, `--icons-and-dimmed` nachgemessen — dieselbe Zahl Einträge, dieselben Zeiten, die rechte Gruppe bündig an der Strangkante (636 bzw. 615), kein Überlauf | ✓ |
| Tut bewusst nicht: filtern, Detail inline, nach Konto hervorheben | `--in-use`: `MasterDetail`, links die Karte „Verlauf · 6 Einträge · Musterbau GmbH 2026" (die Zahl deckt sich mit sechs `.v2tl__item`), rechts die `FieldList` des gewählten Eintrags mit Zustand, Betrag, Datei „RE-4471.pdf", Zusammenfassung. Kein Filter, kein `Segmented` | ✓ |
| Ersetzt `Timeline`/`TimelineItem`/`EventIcon` in `SachverhaltScreen.tsx`/`parts.tsx` | betrifft `ludwig/app`; in diesem Repo nicht erfüllbar (`docs/befunde-app.md`, Abschnitt E) | offen (App) |

**Mängel**

1. **Der String-Schnitt steht noch in der Story.**
   `src/ui/v3/entities/accounting-case/CaseTimeline.stories.tsx:293`:
   `` sub={`Rückfrage · gestellt am ${c.raisedAt.slice(0, 10)}`} ``. Das
   Nachtrags-Kriterium sagt wörtlich „`grep -n "slice(0, 10)"` findet nichts",
   und Mangel 2 der zweiten Abnahme hatte diese Zeile ausdrücklich benannt
   („Dieselbe Abkürzung steht in `CaseTimeline.stories.tsx:293`"). Behoben ist
   nur die Komponente. Im Bild fällt es nicht auf — `cl-3` steht auf
   `2026-08-25T16:20:00Z`, in Berlin 18:20, also derselbe Tag —, aber die
   Story ist genau die Stelle, die den Satz „die Uhrzeit steht im Detail"
   belegen soll, und sie zeigt „gestellt am 2026-08-25" statt einer Uhrzeit.
   Zwei Wege: `calendarDay(c.raisedAt)` aus dem Barrel, oder — besser für die
   Aussage der Story — `formatTime(c.raisedAt, "dateTime")`.

2. **`daysBetween` hat sein `@when`/`@instead` verloren.**
   `src/ui/v3/format.ts`: der Doc-Block von `daysBetween` steht bei `:137–147`,
   direkt darunter folgt bei `:148–160` der Block von `calendarDay` und bei
   `:161` dessen Funktion; `daysBetween` selbst beginnt bei `:170` **ohne
   eigenen Kommentar**. Der Fix hat die neue Funktion zwischen Block und
   Funktion geschoben (`git show 17be1ab -- src/ui/v3/format.ts`). Damit trägt
   `daysBetween` im Editor keine Erklärung mehr, und die Antwort auf „was
   nehme ich?" steht über der falschen Funktion — die feste Prüfliste verlangt
   die zwei Zeilen an **jedem** Export. Ein Verschieben des Blocks um neun
   Zeilen.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Eine breitere Badge-Gruppe als 140 px wird sauber behandelt.** Zur
  Laufzeit in `--filled` geprüft, indem einer Zeile ein zusätzliches Badge
  angehängt wurde: bei 278 px Gruppenbreite bricht der rechte Slot **innerhalb
  derselben Zeile** in eine zweite Zeile um und bleibt bündig an 636; bei
  402 px bleibt er einzeilig und schiebt nur den Betrag dieser Zeile nach
  links (484 → 222). **Alle anderen Zeilen bleiben unberührt** (484 / 496), die
  rechte Kante hält, kein waagerechter Überlauf. Erst jenseits der Zeilenbreite
  (zwei Badges über 830 px, im Bestand unerreichbar) läuft die Gruppe über die
  Kante hinaus. Der Satz aus `rightEnd` — „a wider one pushes its own row and
  nothing else" — stimmt.
- **„Gedimmt" erreicht den Titel weiterhin nicht.** `--edge`, die ersetzte
  Zeile: Container `rgb(92,92,92)`, Titel `rgb(45,45,45)` — genau wie jede
  andere Zeile; zurück tritt nur der Betrag. Unverändert gegenüber der zweiten
  Abnahme, gehört dem Pattern 0023.
- **Das Klickziel ist weiterhin nur der Titel.** `--interactive`: die sechs
  Knöpfe messen 218 bis 279 px bei 375 px Kopfbreite (58–74 %); rechts daneben
  reagiert nichts. Bewusst so gebaut, steht aber gegen §9/I11 — eine Frage an
  den Owner, kein Mangel gegen ein Kriterium.
- **Ohne `kindLabels` steht der englische Schlüssel im `aria-label`**
  (`:250`), unverändert; bis die Registry `ereignis_art` führt (L-02).

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`. Zwei Mängel, beide klein und beide
Nacharbeit am Fix selbst: die Story schneidet weiter am ISO-String, und
`calendarDay` hat sich zwischen `daysBetween` und dessen Doc-Block gesetzt.
Die Sache, um die es ging — die Spalte und der Berliner Tag —, ist gemessen
in Ordnung.

## Die zwei Mängel der zweiten Abnahme (2026-09-05) — behoben

**M1 — der String-Schnitt stand noch in der Story.** Behoben war er in der
Komponente, nicht in `CaseTimeline.stories.tsx:293`
(`c.raisedAt.slice(0, 10)`) — dort schrieb er das ISO-Datum in eine Zeile für
den Leser. Jetzt `formatTime(c.raisedAt, "date")`: derselbe Weg, und
nebenbei liest die Zeile sich jetzt deutsch („gestellt am 26.08.2026") statt
amerikanisch.

**M2 — `daysBetween` hatte sein JSDoc verloren.** `calendarDay` war beim
Einfügen zwischen den Doc-Block und die Funktion geraten; damit trug
`calendarDay` die Abgrenzung von `daysBetween` und `daysBetween` gar keine.
Dieselbe Panne wie bei `FileDrop` in 0021, zwei Runden davor. Jetzt steht
jeder Block über seiner Funktion.

## Abnahmekriterien (Nachtrag der zweiten Runde)

- [ ] `grep -rn "slice(0, 10)" src/ui/v3` findet nichts — auch nicht in Stories
- [ ] `daysBetween` und `calendarDay` tragen je ihr eigenes `@when`/`@instead`

## Abnahme — dritter Durchgang (2026-09-05)

Abgenommen gegen Spec und Code, nicht gegen den Chat. Stand `70a8e74`. Alle
acht Stories auf `localhost:6107` geöffnet und im Blatt gemessen
(`measure.mjs`, Ausdrücke über `#storybook-root`), `--interactive` mit echten
Tastendrücken über CDP bedient (Tab · Enter · Leertaste), `--laedt`-fremde
Nachbarn mitgeprüft, `calendarDay` und `daysBetween` zur Laufzeit aus dem
Barrel geholt und in **fünf** Zeitzonen des Prozesses gerechnet. Die
Kriterien beider Vorrunden sind mitgeprüft — die Behebung hat davon nichts
umgeworfen; genau das war in der letzten Runde dreimal schiefgegangen.

**Story-Deckung.** Acht Stories im Kapitel „Stories", acht Exporte in
`CaseTimeline.stories.tsx`, acht IDs in `index.json` (`--filled`, `--same-day`,
`--empty`, `--loading`, `--entry-kinds`, `--interactive`, `--in-use`,
`--edge`). Jede Prop hat ihre Story: `events`/`clarifications`/`expectations`
(`Filled`) · `selectedId`/`onSelect` (`Interactive`, mit der Gegenprobe ohne
`onSelect` daneben) · `kindLabels` (`EntryKinds`) · `today` (in allen acht auf
`2026-09-03`) · `loading` (`Loading`). „leer nach Filter" und „Fehler" bleiben
begründet ausgeschlossen. Die Ableitung im Kapitel „Stories" rechnet weiter
mit sieben — `SameDay` kam mit M1 der ersten Abnahme dazu; die Zeile „= 7" ist
nachzuziehen, sie ist kein Mangel am Code. Die drei Ergänzungen in
`patterns/Timeline.stories.tsx` stehen (`--selected`, `--day-only`,
`--without-kind`).

**Nachtrag der zweiten Runde**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `grep -rn "slice(0, 10)" src/ui/v3` findet nichts — auch nicht in Stories | genau **ein** Treffer, `format.ts:158`: der Satz im Doc-Block von `calendarDay`, der vor eben diesem Schnitt warnt („The tempting one-liner is `iso.slice(0, 10)`, and it is wrong for the two hours every night …"). Er ist die Begründung, nicht der Fehler — wie in der zweiten Runde gewertet. Im Code steht kein Schnitt mehr: `CaseTimeline.stories.tsx:294` liest `formatTime(c.raisedAt, "date")`, und `--in-use` zeigt bei gewählter Frage „Rückfrage · gestellt am **25.08.2026**" statt „2026-08-25" | ✓ |
| `daysBetween` und `calendarDay` tragen je ihr eigenes `@when`/`@instead` | `format.ts:137–147` der Block, `:148` die Funktion `daysBetween`; `:155–167` der Block, `:168` die Funktion `calendarDay`. Jeder Block trägt beide Zeilen und steht über seiner eigenen Funktion — der Fix hat die Funktion vor den fremden Block gezogen, statt den Block zu verschieben (`git show 70a8e74 -- src/ui/v3/format.ts`). Beide stehen im Barrel und sind zur Laufzeit erreichbar (siehe die Zeitzonen-Probe unten) | ✓ |

**Nachtrag der ersten Runde (mitgeprüft)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Betrag und Badge stehen in jeder Zeile auf derselben Kante | in **jeder** Zeile gemessen, rechte Kante des Betrags und linke des Badge-Feldes: `--entry-kinds` (11 Zeilen) 484 / 496 · `--filled` (6) 484 / 496 · `--edge` (45) 484 / 496 · `--same-day` (3) 484 / 496 · `--in-use` (6) 811 / 823 · `--interactive` je Strang 342 / 354 (links, mit `onSelect`) und 844 / 856 (rechts, ohne). In jeder Story ein einziges Wertepaar; die rechte Kante der Zeile liegt durchweg auf 636 bzw. 963 | ✓ |
| Eine Zeile ohne Betrag verschiebt ihr Badge nicht | dieselbe Messung, die Zeilen ohne `.v2amount`: `--filled` zwei Klärungszeilen, `--same-day` zwei Einträge, `--edge` „Korrektur ohne Betrag", `--entry-kinds` „Gehört die Rechnung auf 6815?" — alle mit `.v2ct__amt` bei 484 und Badge-Feld bei 496, wie die Zeilen mit Betrag | ✓ |
| Kein String-Schnitt auf einem ISO-Datum mehr | siehe Nachtrag der zweiten Runde | ✓ |
| `calendarDay` gibt den Berliner Tag, auch für 22:30 UTC und Silvester | zur Laufzeit im Blatt (`await import('/src/ui/v3/index.ts')`), den Prozess des headless Chromium jeweils mit gesetztem `TZ` gestartet — Europe/Berlin · Asia/Tokyo · Pacific/Kiritimati (+14) · Pacific/Midway (−11) · America/Los_Angeles. In **allen fünf** dieselben Werte: `2026-08-25T22:30:00Z` → **2026-08-26**, `2026-08-25T21:30:00Z` → 2026-08-25 (Kante der Sommerzeit), `2026-12-31T23:30:00Z` → **2027-01-01**, `2026-12-31T22:00:00Z` → 2026-12-31 (Kante der Winterzeit), der Tagesstring `2026-08-26` unverändert, Unsinn → `""`. `daysBetween` gleich mitgeprüft: 01.08./08.08. = 7, Tag gegen Zeitstempel = 5 | ✓ |

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` **nicht** gelaufen (mehrere Sitzungen parallel, laut Auftrag untersagt); ersatzweise übersetzt und rendert der laufende Storybook alle acht Stories, `console-check.mjs` über alle acht: **0 Meldungen** | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/accounting-case/CaseTimeline.tsx` + `CaseTimeline.stories.tsx`; Titel `v3/Entitäten/Sachverhalt/CaseTimeline` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `CaseTimeline` (`:167`) trägt beide Zeilen (`:161–166`), die vier Typen englischen JSDoc. In `format.ts` steht der Doc-Block jetzt wieder über seiner Funktion — der Mangel der zweiten Runde ist behoben, ohne einen neuen zu setzen. Bezeichner, Kommentare und Story-Exportnamen englisch, deutsch nur in sichtbaren Strings | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | in `CaseTimeline.tsx`: `grep -cE '#[0-9a-fA-F]{3,8}'` = 0, `grep -cE '[0-9]+px'` = 0, `grep -nE 'Intl\.\|toLocale'` leer. Die Maße stehen als `.v2ct__amt` (96 px) und `.v2ct__state` (140 px) im Blatt (`v3.css:1952–1953`). Einziges Objekt bleibt `EVENT_ICON`; Wörter aus `resolveStatus(…)` und der von der Spec erlaubten Übergangs-Prop `kindLabels` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | V3 hält: Zahlen rechts in einer Spalte, `lining-nums tabular-nums`, Text links, **kein** Element mit `text-align: center` (0 gezählt) · Zeilenhöhe 34 px bei einzeiligem Titel · Farbe nur als Stufe, jeder farbige Zustand mit Wort („Gebucht", „Eskaliert", „Offen", „Blockierend", „Ersetzt") · jedes Icon mit `title` **und** `aria-label`, `svg` `aria-hidden="true"`, Lucide `stroke-width="1.5"`, `width="14"` · Fokusring nach echtem Tab-Anschlag sichtbar und gemessen: `outline 2px solid rgb(59,143,196)`, Offset 2 px, `:focus-visible` trifft · kein waagerechter Überlauf in einer der acht Stories · V13/T7 hält jetzt in Komponente **und** Story (`calendarDay`, `formatTime`) · die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen, nicht nur gebaut | alle acht IDs geöffnet und gemessen; `--interactive` mit echten Tastendrücken bedient; `--geoeffnet`/`--laedt` der Nachbaraufgabe 0076 mit angesehen, weil derselbe Commit das Blatt anfasst | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Drei Listen ergeben **einen** Strang, absteigend nach Tag; gleicher Tag: Erwartung, Klärung, Ereignis | `--filled`: ein `.v2tl` mit sechs `.v2tl__item`, `datetime` absteigend 2026-09-15 → 08-31 → 08-25 → 08-12 → 08-04 → 07-28. `--same-day`: drei Einträge, alle `datetime="2026-08-26"`, DOM-Reihenfolge „Beleg fehlt: Bürobedarf Meier GmbH · Fällig" → „Gehört der Laptop ins Anlagevermögen? · Offen · Blockierend" → „Rechnung RE-4471 · 1.249,90 € · Vorschlag" | ✓ |
| Genau eine Zeile je Eintrag | `--filled`, `--same-day`, `--edge`, `--entry-kinds`, `--interactive`: `.v2tl__who` **0×**, `details`/`summary` **0×**; `--in-use`: keine Zeile enthält „.pdf" (`items.some(text.includes('.pdf'))` = false), Dateiname und Zusammenfassung stehen rechts im Detail | ✓ |
| Zustände nur über `StatusBadge` mit den Achsen `ereignis`, `klaerung_status`, `klaerung`, `erwartung`; kein lokales Label-Objekt außer `kindLabels` | `grep -n 'axis=' CaseTimeline.tsx`: `erwartung` (`:216`), `klaerung_status` (`:239`), `klaerung` (`:242`), `ereignis` (`:268`) — mehr nicht. Im DOM von `--entry-kinds` die Registry-Wörter samt Erklärung im `title` des umschließenden `span` | ✓ |
| `clarificationState()` und `expectationMaturity()` aus `src/ludwig/` importiert, keine zweite Ableitung | Import `:18–24` aus `@/ludwig/modules/accounting-cases/domain/case`; kein Datumsvergleich und kein `Intl` in der Datei. Sichtbar in `--filled`: dieselbe Frage am 04.08. „Beantwortet", die vom 25.08. „Offen" + „Blockierend" | ✓ |
| Erwartungen mit `resolvedAt` fehlen im DOM (`Edge`) | `--edge`: `innerText.includes("erledigt — steht nicht im Strang")` = **false**; 45 Einträge, davon genau eine Erwartung | ✓ |
| `selectedId` → genau ein `[aria-current="true"]`; `onSelect` liefert `{ type, … }`; ohne `onSelect` kein `button` | `--interactive`: **6** `button` im linken Strang, **0** im rechten. Echte Tastendrücke über CDP: Tab → Fokus auf `button.v2link` „Beleg fehlt: Bürobedarf Meier GmbH", Enter → „Gewählt: expectation · ex-1", `[aria-current="true"]` genau **1×**; zweimal Tab + Leertaste → „clarification · cl-3" (1×); Tab + Enter → „event · ev-2" (1×). Die Markierung wandert mit und bleibt einzeln | ✓ |
| Ersetztes Ereignis: gedimmt, Badge „Ersetzt", kein Buchungszustand (`Edge`) | `--edge`: genau ein `.v2tl__item.v2muted` — „Rechnung RE-4470 · ersetzt / 1.249,90 € / **Ersetzt**", obwohl `state: "posted"` übergeben wird; der Eintrag bleibt wählbar | ✓ |
| `payment_out` mit Minus; `amount` 0 oder `null` ohne Betragszelle (`Edge`) | `--edge`: „Zahlung an Stadtwerke Musterstadt / **-412,00 €**" bei übergebenen `412`; „Korrektur ohne Betrag" (`amount: 0`) ohne `.v2amount` — die Spalte bleibt belegt und ausgerichtet (Nachtrag) | ✓ |
| Jedes Icon hat `title` und `aria-label` mit deutschem Wort (`EntryKinds`) | `--entry-kinds`, Probe über alle **elf** `span.v2tl__kind`: `role="img"`, `aria-label` = `title` = „Beleg fehlt", „Zahlung offen", „Beleg", „Zahlungseingang", „Zahlungsausgang", „Umbuchung", „Korrektur", „Sollstellung", „OP-Vortrag", „Beleg", „Frage"; `svg` je `aria-hidden="true"`, `stroke-width="1.5"`, `width="14"`, Lucide-Klassen `file-question-mark`, `banknote-arrow-down`, `file-text`, `arrow-down-left`, `arrow-up-right`, `arrow-left-right`, `sliders-horizontal`, `repeat`, `rotate-ccw-clock`, `message-circle-question-mark` | ✓ |
| Lückenzeile „n Tage ohne Ereignis" bei ≥ 7 Tagen (`Edge`) | `--edge`: vier `.v2tl__gap` (21 · 121 · 9 · 12); `--filled` und `--in-use` je vier (15 · 13 · 8 · 7) — die 7 zeigt die Schwelle genau an der Kante; `--entry-kinds` eine (16) | ✓ |
| 0023 erweitert: `selectedId`, tagesgenaues `at`, `kind` optional; bestehende 0023-Stories unverändert | `Timeline --selected`: genau ein `.v2tl__item.is-current` mit `aria-current="true"` · `--day-only`: `datetime="2026-08-28"` → „28.08.2026" ohne Uhrzeit neben `datetime="2026-08-26T14:12:00.000Z"` → „26.08.2026 16:12" · `--without-kind`: `.v2tl__who` 0×, beide Einträge einzeilig. Alle **dreizehn** Timeline-Stories nachgemessen: dieselbe Zahl Einträge (4 · 4 · 0 · 0 · 8 · 10 · 4 · 10 · 4 · 4 · 2 · 2 · 3), dieselben Zeiten, die rechte Gruppe bündig an der Strangkante (636 · 708/1424 · 615), kein waagerechter Überlauf | ✓ |
| Tut bewusst nicht: filtern, Detail inline, nach Konto hervorheben | `--in-use`: `div.v2md` mit `div.v2md__detail`, links die Karte „Verlauf · 6 Einträge · Musterbau GmbH 2026" (die Zahl deckt sich mit sechs `.v2tl__item`), rechts die `FieldList` des gewählten Eintrags. Kein Filter, kein `Segmented` (`.v2seg` 0×) | ✓ |
| Ersetzt `Timeline`/`TimelineItem`/`EventIcon` in `SachverhaltScreen.tsx`/`parts.tsx` | betrifft `ludwig/app`; in diesem Repo nicht erfüllbar (`docs/befunde-app.md`, Abschnitt E) | offen (App) |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Der Tagesschnitt ist auch in der Story weg, aber die Uhrzeit steht weiter
  nicht im Detail.** `--in-use` zeigt bei gewählter Frage „Rückfrage · gestellt
  am 25.08.2026". Das ist richtig gerechnet (`cl-3` steht auf
  `2026-08-25T16:20:00Z`, in Berlin 18:20) und liest sich deutsch statt
  amerikanisch — die Datenpunkte-Tabelle sieht an dieser Stelle aber die
  **Uhrzeit** vor („die Uhrzeit steht im Detail"). `formatTime(…, "dateTime")`
  wäre der Halbsatz. Kein Kriterium, und das Detail stellt die Story, nicht die
  Komponente.
- **„Gedimmt" erreicht den Titel weiterhin nicht.** `--edge`, die ersetzte
  Zeile: Container `rgb(92,92,92)`, Titel `rgb(45,45,45)` — genau wie jede
  andere Zeile; zurück tritt nur der Betrag. Unverändert seit der zweiten
  Abnahme, gehört dem Pattern 0023.
- **Das Klickziel ist weiterhin nur der Titel.** `--interactive`: die sechs
  Knöpfe messen 218 bis 279 px bei 375 px Kopfbreite (58–74 %); rechts daneben
  reagiert nichts. Bewusst so gebaut, steht aber gegen §9/I11 — eine Frage an
  den Owner, kein Mangel gegen ein Kriterium.
- **Wo der Strang nach Tagen gruppiert, ist das `<time>` der Zeile leer.**
  `Timeline --without-kind`: `<time class="v2tl__when" datetime="2026-08-28"
  title="28.08.2026"></time>` ohne Text — der Tag steht in der Überschrift
  `.v2tl__day` darüber, und einen Uhrzeit-Teil hat ein Kalendertag nicht.
  Dasselbe in `--filled` von 0040. Im Bild richtig; ein `title` an einem leeren
  Element ist trotzdem für niemanden erreichbar. Gehört 0023.
- **Ohne `kindLabels` steht der englische Schlüssel im `aria-label`**
  (`:250`), unverändert; bis die Registry `ereignis_art` führt (L-02).
- **Der Rand hält.** `--edge` rendert 45 Einträge mit vier Lückenzeilen ohne
  eine Konsolenmeldung; `--empty` zeigt einen Satz („Noch nichts geschehen."),
  `--loading` die Skeleton-Fläche mit „Verlauf wird geladen …".

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05
