# 0190 · Die 35 typischen Einträge am Sachverhalt

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-21, fremde Abnahme steht aus |
| Stufe | `src/showcase/case/` (Seiten-Stories) — dazu Befunde an `entities/` |
| Klassen-Test | keiner nötig: es entsteht **keine** neue Komponente. Was hier gebaut wird, sind Stories auf vorhandenen Bausteinen; was dabei fehlt, steht als Befund unten |
| Quelle | Owner-Auftrag, überbracht von `ludwig-worker3` am 2026-09-18 (35 Datensätze aus `apps/web/src/core/db/schema/_generated/schema.ts`, Beispiel-Sachverhalt 2026-0142: Eingangsrechnung Müller Bürotechnik GmbH, RE-24-0815, 1.190,00 €, Kreditor 70112) |
| Setzt voraus | 0040 `CaseTimeline` · 0152 Sachverhaltsseite · 0059/0060 Klärung · 0025 Erwartung · 0113 `JournalEntryFacts` · 0100 `BankTransactionCell` — alle gebaut |
| Spec von / am | Claude, 2026-09-18 |

## Ziel

Ein Katalog: **je typischem Eintrag am Sachverhalt eine Story.** Er beantwortet
zwei Fragen auf einen Blick — „wie sieht dieser Fall bei uns aus?" und „welcher
Fall hat heute noch kein Gesicht?". Er ist zugleich die Antwort an
`ludwig-worker3`: an welchen Komponenten die Einträge hängen und wo eine fehlt.

Teil A sind 21 echte Ereignisse (`client_accounting_event`), Teil B 14 Dinge,
die am Sachverhalt hängen, ohne eine Ereigniszeile zu sein.

## Einordnung

**Regel 1 aus §3 greift** („ein `@when` deckt den Fall"): `CaseTimeline` trägt
Ereignisse, Klärungen und Erwartungen; `ClarificationCard`, `ExpectationRow`,
`JournalEntryCard`, `JournalEntryFacts`, `AiBookingNotes` und
`BankTransactionCell` tragen die Teile daneben. Damit ist das hier **keine
Komponenten-Spec, sondern eine Seiten-Aufgabe** — genau der Fall, für den §3
Regel 1 den Satz „meist keine Komponenten-Spec mehr" vorsieht.

Die Obergrenze von zehn Stories (§6) gilt der Komponente, nicht dem Katalog:
die Zahl 35 kommt aus dem Auftrag, nicht aus einem Zuschnitt. Der Katalog liegt
deshalb in `showcase/`, wo schon die Szenarien der Seite liegen (0152), und
nicht in der Story-Datei einer Komponente.

## Wo die Stories hängen

Eine neue Datei `src/showcase/case/CaseEntries.stories.tsx`, Titel
**`Seiten/Sachverhalt/Einträge`**, Export-Namen englisch. Jede Story zeigt den
Eintrag so, wie die Seite ihn zeigt:

- **links der Strang** (`CaseTimeline`) mit genau diesem Eintrag im
  Zusammenhang seiner Nachbarn, wo er ohne sie nichts sagt (Paare: 3, 7, 12, 30, 33),
- **rechts die Fläche** des gewählten Eintrags (`EntryPane` aus 0152 bzw. der
  Baustein, der ihn trägt — Karte, Zeile, Facts).

Die Daten sind die Datensätze aus dem Auftrag, auf die gespiegelten Formen
abgebildet: `CaseTimelineEvent` (0040) für Teil A, `ClarificationVM` +
`ClarificationDetailVM`, `ExpectationVM`, `JournalLine`/`JournalEntryVM`,
`BankTransactionCellData` für Teil B.

## Zuordnung der 35 Einträge

Spalte „trägt" nennt den Baustein, Spalte „Story" den Export, Spalte „fehlt"
den Befund, wo etwas fehlt.

### Teil A — Ereignisse (`client_accounting_event`)

| Nr | Eintrag | trägt | Story | fehlt |
|---|---|---|---|---|
| 1 | Eingangsrechnung eingegangen | `CaseTimeline` (`document_received`) + `SourceDocumentCell` in der Fläche | `IncomingInvoice` | — |
| 2 | Ausgangsrechnung geschrieben | wie 1, Richtung im Titel | `OutgoingInvoice` | — |
| 3 | Korrekturbeleg ersetzt den Erstbeleg | `CaseTimeline` `superseded` (Zeile tritt zurück, Wort „Ersetzt") | `SupersededByCorrection` | — |
| 4 | Zweitschrift, keine Buchung nötig | `event_booking = no_booking_required` + `stateNote` | `DuplicateNoBooking` | — |
| 5 | Vertrag hinterlegt | wie 4, Beleg vom Typ `contract` | `ContractFiled` | — |
| 6 | Zahlung raus, voller Betrag, mit Bankzeile | `CaseTimeline` + `BankTransactionCell` in der Fläche | `PaymentOutFull` | — |
| 7 | Teilzahlung in zwei Raten | zwei Ereignisse; Rest aus dem offenen Posten | `PaymentInTwoRates` | **B-01** Restbetrag steht nur im offenen Posten, nicht am Ereignis |
| 8 | Anteil an einer Sammelzahlung | `CaseTimeline` | `PaymentShareOfBatch` | **B-02** `allocated_amount` fehlt an `CaseTimelineEvent` — der Strang zeigt 3.570 € statt der 1.190 € dieses Falls |
| 9 | Zahlung mit Skonto | `CaseTimeline` + Satz in der Fläche | `PaymentWithDiscount` | **B-03** `notes` fehlt an `CaseTimelineEvent` |
| 10 | Zahlungseingang vom Kunden | `CaseTimeline` (`payment_in`) | `PaymentIn` | — |
| 11 | Erstattung vom Lieferanten | `CaseTimeline` (`payment_in` an einer Eingangsrechnung) | `SupplierRefund` | — |
| 12 | Lastschrift und Rücklastschrift | zwei Ereignisse, Paar im Strang | `DirectDebitReturned` | — |
| 13 | Zahlung in Fremdwährung | `CaseTimeline` (EUR) + `BankTransactionFacts` (Kurs, Fremdbetrag) | `PaymentForeignCurrency` | — (`amountEur`/Kurs trägt die Bankzeile, 0100) |
| 14 | Geldtransit / interne Umbuchung | `CaseTimeline` (`internal_transfer`) | `InternalTransfer` | — |
| 15 | PayPal-Zwilling (Verrechnung, ohne Bankzeile) | `CaseTimeline` (`adjustment`) | `PassThroughTwin` | **B-04** `pass_through_of_bank_transaction_id` hat kein Feld — die Zeile kann nicht sagen, woraus sie entstand |
| 16 | Korrektur von Hand | `CaseTimeline` (`adjustment`) | `ManualCorrection` | — (Grund via **B-03**) |
| 17 | Sollstellung einer Dauerbuchung | `CaseTimeline` (`accrual`) + `RecurringRuleFacts` in der Fläche | `RecurringAccrual` | **B-05** `recurringRuleId` und `accrual_period` fehlen an `CaseTimelineEvent`; die Periode steht heute nur im Titel |
| 18 | Zahlung zur Dauerbuchung | `CaseTimeline` (`payment_out`, ohne Periode) | `RecurringPayment` | siehe B-05 |
| 19 | Offener Posten aus dem DATEV-Spiegel | `CaseTimeline` (`open_item_carryover`, `source: "datev"`, `no_booking_required`) | `OpenItemCarryover` | — |
| 20 | Zahlung auf einen offenen Posten aus DATEV | `CaseTimeline` (`payment_out`) | `OpenItemPaid` | — |
| 21 | Zahlung, die die Kanzlei selbst gebucht hat | `no_booking_required` mit Grund | `BookedByFirm` | — |

**Randfall zum Vorzeichen (Auftrag, ausdrücklich).** `payment_out` kommt mit
negativem Betrag (Bank-Zuordnung, `agent-ingest-core.ts:890`) **und** mit
positivem (Wiederkehr, `assignment-writes.ts`). `CaseTimeline` dreht das
Vorzeichen heute selbst (`amountCell(..., ev.kind === "payment_out")` mit
`-Math.abs`), ist also gegen beides dicht. Die Story `PaymentSignBothWays`
zeigt dieselbe Zahlung einmal mit `-1190` und einmal mit `1190` — beide Zeilen
lesen „−1.190,00 €". Das ist die 36. Story und der Beweis, dass der Randfall
geprüft ist.

### Teil B — am Sachverhalt, ohne Ereigniszeile

| Nr | Eintrag | trägt | Story | fehlt |
|---|---|---|---|---|
| 22 | Kommentar (Notiz) | `ClarificationRow` + `ClarificationCard` (`type: "comment"`) | `NoteOnCase` | — (seit e047f0a in einer Liste mit den Fragen) |
| 23 | Offene Rückfrage an den Mandanten | `ClarificationCard` (`mode="read"` für die Kanzlei, Antwort im Portal) | `QuestionOpenClient` | — |
| 24 | Rückfrage beantwortet | `ClarificationCard` mit Antwort und Verlauf | `QuestionAnswered` | — |
| 25 | Rückfrage auf Wiedervorlage | `ClarificationCard` (`deferredUntil`, Grund, Zähler) | `QuestionDeferred` | — |
| 26 | Beleg fehlt (Erwartung) | `ExpectationRow` + Eintrag im Strang | `DocumentExpected` | — |
| 27 | Zahlung erwartet und erfüllt | `ExpectationRow` (`resolvedAt`) — verschwindet aus dem Strang, das lösende Ereignis bleibt | `PaymentExpectationMet` | **B-06** `resolution`/`resolvedByEventId` fehlen an `ExpectationVM`: „wodurch erledigt" ist nicht zeigbar |
| 28 | Buchungsvorschlag des Agenten | `JournalEntryCard` + `AiBookingNotes` | `BookingProposed` | — |
| 29 | Freigegeben und exportiert | `JournalEntryFacts` (`exportRef`, `exportBatchId`, gesperrt) | `BookingExported` | — |
| 30 | Storno | zwei Sätze: der stornierte und der Storno | `BookingReversed` | **B-07** `reverses_entry_id` hat kein Feld — der Storno nennt seinen Ursprung nicht |
| 31 | DATEV-Spiegel: bestätigt | — | `MirrorMatched` | **B-08** keine Form für die Spiegelbuchung am Fall (Profil `datev-mirror-entry` analysiert, nichts gebaut) |
| 32 | DATEV-Spiegel: von der Kanzlei geändert | — | `MirrorCorrected` | siehe B-08 |
| 33 | DATEV-Spiegel: aufgeteilt (N Teile) | — | `MirrorSplit` | siehe B-08 |
| 34 | DATEV-Spiegel: Fremdbuchung zum Fall | `CaseTimeline` kann sie als `source: "datev"` zeigen; der Satz selbst hat kein Gesicht | `MirrorForeignEntry` | siehe B-08 |
| 35 | Freigabe „Vorsteuer ohne Beleg" | — | `VatWithoutDocumentApproved` | **B-09** `CaseFacts` kennt `vatWithoutDocumentApproval` nicht (Typ liegt in `src/ludwig/.../case-detail.ts`) |

## Befunde

Lücken im **Set** (hier zu schließen, jede als eigene Aufgabe — dieser Katalog
baut sie nicht):

- **B-02** `CaseTimelineEvent.allocatedAmount` — Anteil dieses Falls an einer
  Sammelzahlung. Ohne das Feld zeigt der Strang den Betrag der ganzen
  Überweisung, und das ist an diesem Fall schlicht falsch.
- **B-03** `CaseTimelineEvent.note` — der eine Satz am Ereignis („Differenz
  23,80 € = Skonto", „Hinweis Kanzlei"). Heute gibt es nur `stateNote`, und die
  hängt am Zustands-Badge.
- **B-04** `CaseTimelineEvent.passThroughOf` — woraus ein Verrechnungs-Zwilling
  entstand.
- **B-05** `CaseTimelineEvent.recurringRuleId` / `accrualPeriod` — die Regel
  hinter der Sollstellung und ihre Periode.
- **B-06** `ExpectationVM.resolution` / `resolvedByEventId`.
- **B-07** Storno-Bezug am Buchungssatz (`reversesEntryId`).
- **B-08** **eine Form für die DATEV-Spiegelbuchung am Fall.** Vier der 35
  Einträge (31–34) haben im Set kein Gesicht; die App zeigt sie in
  `DatevHistoryCard`. Das Profil `docs/entitaeten/datev-mirror-entry.md` liegt
  vor. Das ist die größte Lücke dieses Katalogs und gehört als eigene Spec
  angelegt, bevor die Seite die Karte nachbaut.
- **B-09** `CaseFacts.vatWithoutDocumentApproval` — wer wann mit welchem Grund
  Vorsteuer ohne Beleg freigegeben hat.

Befunde für **`ludwig/app`** gehen zusätzlich als Zeile in
`docs/befunde-app.md`; hier entsteht keiner neu — die Felder aus dem Auftrag
stehen alle im Schema, sie fehlen nur im Spiegel bzw. in den Props.

## Stories

36 Exporte in `CaseEntries.stories.tsx`, einer je Zeile der zwei Tabellen plus
`PaymentSignBothWays`. Ableitung nach §6 gilt hier nicht — der Katalog ist
kein Baustein; die Zahl kommt aus dem Auftrag. Regeln trotzdem:

- Daten aus dem Auftrag, Beträge und Namen unverändert übernommen.
- Jede Story trägt zwei bis vier Sätze JSDoc: was der Fall ist, woran man ihn
  erkennt, und — wo einer existiert — welcher Befund ihn heute beschneidet.
- Wo ein Befund greift (B-02 … B-09), zeigt die Story den Fall **so gut es
  heute geht** und sagt im JSDoc, was fehlt. Keine erfundene Prop, kein
  Platzhalter im Code (A12).
- Die vier Spiegel-Stories (31–34) zeigen den Satz als das, was heute da ist:
  die Zeile im Strang mit `source: "datev"` und, für 31/32/33, eine
  `FieldList` mit den Soll/Haben-Zeilen — daneben der Befund B-08. Sie sind
  damit **bewusst die schwächsten** Stories des Katalogs; das ist die Aussage.

## Abnahmekriterien

1. `Seiten/Sachverhalt/Einträge` hat 36 Stories; jede der 35 Zeilen der beiden
   Tabellen hat genau eine, dazu `PaymentSignBothWays`.
2. Jede Story rendert ohne Konsolenmeldung und zeigt den Eintrag im Strang,
   wo er eine Zeile hat, sonst in dem Baustein, der ihn trägt.
3. Kein Eintrag erfindet eine Prop: `grep` findet in der Datei keine Felder,
   die die Typen nicht führen (Typecheck ist der Nachweis).
4. Die Paare (3, 7, 12, 30, 33) stehen zusammen in einer Story — ein Storno
   ohne seinen Ursprung ist keine Aussage.
5. `PaymentSignBothWays` zeigt −1.190,00 € in beiden Zeilen, bei `amount:
   -1190` und bei `amount: 1190`.
6. Jede Story, deren Fall heute beschnitten ist, nennt im JSDoc ihren Befund
   (B-02 … B-09); die Befundliste dieser Spec nennt jede dieser Stories.
7. `pnpm typecheck`, `check:when`, `check:classes`, `check:language`,
   `check:icons` grün.

## Offene Fragen

1. **Sollen die vier Spiegel-Einträge (31–34) sofort eine eigene Form
   bekommen?** Ohne Antwort: nein — der Katalog zeigt sie beschnitten und
   B-08 wird als eigene Spec angelegt, sobald der Owner sie zieht.
2. **Gehört der Katalog in die Abnahme der Seite (0152) oder steht er
   daneben?** Ohne Antwort: daneben — er ist Dokumentation des Bestands, nicht
   die Seite selbst.
3. **Sollen die Befunde B-02 … B-07 und B-09 in einem Zug geschlossen
   werden?** Ohne Antwort: nein — erst der Katalog, damit man sieht, was die
   Lücken kosten; dann eine Aufgabe je Befund.

## Ausbau

- Bekommt `CaseTimelineEvent` die Felder aus B-02 … B-05, ziehen die Stories
  8, 9, 15, 17 und 18 nach; sie sind dafür einzeln geschnitten.
- Kommt eine Form für die Spiegelbuchung (B-08), ersetzt sie in 31–34 die
  behelfsmäßige `FieldList`.
- Der Katalog ist die natürliche Stelle für weitere Fälle: jeder neue
  Ereignistyp der App bekommt hier seine Story, bevor die Seite ihn zeigt.

## Stand des Baus (2026-09-21)

`src/showcase/case/CaseEntries.stories.tsx`, Titel `Seiten/Sachverhalt/Einträge`,
**36 Stories** — 35 Einträge plus `PaymentSignBothWays`. Typecheck und die vier
Wächter (`when`, `classes`, `language`, `icons`) grün, Stichproben im Browser
ohne Konsolenmeldung:

- `--payment-share-of-batch`: die Zeile zeigt −3.570,00 €, der Anteil von
  1.190,00 € steht daneben — Befund B-02 sichtbar gemacht statt versteckt.
- `--booking-exported`: `JournalEntryFacts` mit Stapel, LudwigAI-Referenz und
  „Festgeschrieben".
- `--mirror-split`: Behelfs-Liste mit Badge „aufgeteilt (Kanzlei)" und dem
  Hinweis auf B-08.
- `--question-answered`: Verlauf mit „Gefragt von Buchungsagent" und
  „Beantwortet von Mandant".
- `--payment-sign-both-ways`: beide Zeilen lesen −1.190,00 €, bei `amount:
  -1190` **und** bei `amount: 1190`.

Nicht gebaut, wie in der Spec vorgesehen: die neun Lücken B-01 … B-09. Sie
stehen in den Stories als Satz, nicht als Platzhalter im Code.

## Stand der Befunde (2026-09-21, nach App `c478af21` und 0191)

| Befund | Stand |
|---|---|
| B-01 Restbetrag | **erledigt** — Spiegel-Lauf `c478af21`, der Kopf zeigt „offen …" oder „gedeckt" unter dem Betrag (Nachtrag 0152) |
| B-02 Anteil | **erledigt** — `CaseTimelineEvent.allocatedAmount` (Nachtrag 0040), Story 8 zeigt den Anteil |
| B-03 Satz am Ereignis | **erledigt** — `note`, Stories 8, 9, 16 |
| B-04 Verrechnungs-Zwilling | Feld drüben als Id; **offen** — das Etikett (Bankzeile als `BankTransactionCellData`) kommt mit **F250** |
| B-05 Periode | **erledigt** — `accrualPeriod`, Stories 17, 18; der Name der Regel neben `recurringRuleId` kommt mit **F250** |
| B-06 Auflösung der Erwartung | Felder drüben (`resolution`, `resolvedByEventId`); **offen** — Wortliste (L-332) und Etikett des lösenden Ereignisses kommen mit **F250** |
| B-07 Storno-Bezug | **erledigt** — Spiegel-Lauf `c478af21`, `JournalEntryFacts` nennt den aufgehobenen Satz als Weg (Nachtrag 0176) |
| B-08 Spiegelbuchung | **erledigt** — 0191, Stories 31–34 |
| B-09 Vorsteuer ohne Beleg | **erledigt** — `CaseFacts` (0191), Story 35 |
