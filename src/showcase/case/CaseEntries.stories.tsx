import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import type { JournalEntryVM } from "@/ludwig/modules/entries/domain/journal-entry-vm";
import {
  CaseTimeline,
  type CaseTimelineClarification,
  type CaseTimelineEvent,
  type CaseTimelineExpectation,
} from "@/ui/v3/entities/accounting-case/CaseTimeline";
import { BankTransactionCell } from "@/ui/v3/entities/bank-transaction/BankTransactionCell";
import type { BankTransactionCellData } from "@/ui/v3/entities/bank-transaction/bank-transaction";
import type { ClarificationVM } from "@/ui/v3/entities/clarification/Clarification";
import {
  ClarificationCard,
  type ClarificationDetailVM,
} from "@/ui/v3/entities/clarification/ClarificationCard";
import { CaseFacts } from "@/ui/v3/entities/accounting-case/CaseFacts";
import {
  MirrorEntryList,
  type MirrorEntryVM,
} from "@/ui/v3/entities/datev-mirror-entry/MirrorEntry";
import { ExpectationRow } from "@/ui/v3/entities/expectation/Expectation";
import { AiBookingNotes } from "@/ui/v3/entities/journal-entry/AiBookingNotes";
import { JournalEntryCard, type JournalLine } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import { JournalEntryFacts } from "@/ui/v3/entities/journal-entry/JournalEntryFacts";
import { SourceDocumentCell } from "@/ui/v3/entities/source-document/SourceDocument";
import { Columns } from "@/ui/v3/patterns/Columns";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { Card, CardHead } from "@/ui/v3/primitives/Table";

import { documentFixture } from "../document/fixtures";
import { accountHref, caseFixture } from "./fixtures";

/**
 * Der Katalog der 35 typischen Einträge am Sachverhalt (0190).
 *
 * Eine Story je Eintrag, links der Strang, rechts die Fläche — so, wie die
 * Seite ihn zeigt. Der Katalog beantwortet zwei Fragen: „wie sieht dieser
 * Fall bei uns aus?" und „welcher Fall hat heute noch kein Gesicht?". Wo ein
 * Befund den Fall beschneidet, sagt die Story es im Text; erfunden wird
 * nichts.
 *
 * Durchgehendes Beispiel ist Sachverhalt 2026-0142: Eingangsrechnung der
 * Müller Bürotechnik GmbH, RE-24-0815, 1.190,00 € (1.000 netto + 190 USt),
 * Kreditor 70112. Die Datensätze kommen aus dem Auftrag des Owners
 * (2026-09-18, überbracht von ludwig-worker3).
 */
const meta: Meta = { title: "Seiten/Sachverhalt/Einträge", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

const TODAY = "2026-04-20";

const ev = (
  id: string,
  kind: CaseTimelineEvent["kind"],
  date: string,
  title: string,
  amount: number | null,
  state: string,
  extra: Partial<CaseTimelineEvent> = {},
): CaseTimelineEvent => ({ id, kind, date, title, amount, currency: "EUR", state, ...extra });

const line = (
  side: JournalLine["side"],
  accountNumber: string,
  accountName: string,
  amount: number,
  text: string,
  extra: Partial<JournalLine> = {},
): JournalLine => ({ side, accountNumber, accountName, amount, text, ...extra });

const bank = (
  postingDate: string,
  amount: number,
  counterpartyName: string | null,
  purpose: string,
  currency: BankTransactionCellData["currency"] = "EUR",
): BankTransactionCellData => ({ postingDate, amount, counterpartyName, purpose, currency });

/** The frame of every story: the strand on the left, the entry's surface on the right. */
function Entry({
  sub,
  events,
  clarifications,
  expectations,
  selected,
  children,
}: {
  sub: string;
  events?: CaseTimelineEvent[];
  clarifications?: CaseTimelineClarification[];
  expectations?: CaseTimelineExpectation[];
  selected?: string;
  children: ReactNode;
}) {
  return (
    <Columns
      pattern="list-detail"
      list={
        <Card>
          <CardHead title="Ereignisse" sub={sub} />
          <div className="v3boxbody">
            <CaseTimeline
              events={events ?? []}
              clarifications={clarifications ?? []}
              expectations={expectations ?? []}
              today={TODAY}
              selectedId={selected ?? null}
              onSelect={() => {}}
            />
          </div>
        </Card>
      }
      main={children}
    />
  );
}

/** A surface with a heading — the same shell the page uses in column 2. */
function Pane({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHead title={title} {...(sub ? { sub } : {})} />
      <div className="v3boxbody">{children}</div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   A · Ereignisse (client_accounting_event)
   ══════════════════════════════════════════════════════════════════════ */

/**
 * **1 · Eingangsrechnung eingegangen.** Der Normalfall: ein Beleg kommt an,
 * der Agent schlägt die Buchung vor. Die Zeile nennt Tag, Art, Titel und
 * Betrag; der Beleg selbst steht in der Fläche.
 */
export const IncomingInvoice: Story = {
  render: () => (
    <Entry
      sub="ein Beleg"
      selected="evt-01"
      events={[
        ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "proposed", {
          bookingState: "proposed",
        }),
      ]}
    >
      <Pane title="Rechnung RE-24-0815" sub="04.03.2026 · Beleg mit Vorschlag">
        <SourceDocumentCell
          document={documentFixture({
            id: "doc-re-0815",
            fileName: "RE-24-0815.pdf",
            counterparty: "Müller Bürotechnik GmbH",
            documentDate: "2026-03-04",
            receivedDate: "2026-03-04",
            caseNumber: "2026-0142",
            detail: { kind: "invoice", number: "RE-24-0815", gross: 1190, currency: "EUR", net: 1000, vat: 190 },
          })}
        />
        <FieldList
          tone="bare"
          rows={[
            ["Kreditor", "70112 · Müller Bürotechnik GmbH"],
            ["Netto", "1.000,00 €"],
            ["Umsatzsteuer", "190,00 € (19 %)"],
          ]}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **2 · Ausgangsrechnung geschrieben.** Dieselbe Ereignisart
 * (`document_received`) — die Richtung steckt im Beleg und im Titel, nicht in
 * einer zweiten Art. Deshalb sieht die Zeile gleich aus und liest sich doch
 * anders.
 */
export const OutgoingInvoice: Story = {
  render: () => (
    <Entry
      sub="ein Beleg"
      selected="evt-02"
      events={[
        ev(
          "evt-02",
          "document_received",
          "2026-03-10",
          "Ausgangsrechnung AR-2026-031 an Hofmann Logistik KG",
          4760,
          "posted",
          { bookingState: "posted" },
        ),
      ]}
    >
      <Pane title="Ausgangsrechnung AR-2026-031" sub="10.03.2026 · gebucht">
        <JournalEntryCard
          lines={[
            line("debit", "10231", "Hofmann Logistik KG", 4760, "AR-2026-031"),
            line("credit", "8400", "Erlöse 19 % USt", 4000, "AR-2026-031", { taxKey: "3", taxRatePercent: 19 }),
            line("credit", "1776", "Umsatzsteuer 19 %", 760, "AR-2026-031"),
          ]}
          currency="EUR"
          accountHref={accountHref}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **3 · Korrekturbeleg ersetzt den Erstbeleg.** Das Paar gehört zusammen: der
 * ersetzte Beleg tritt zurück (blass, Wort „Ersetzt"), bleibt aber lesbar —
 * eine Zeile, die verschwindet, hinterlässt eine Lücke in der Geschichte.
 */
export const SupersededByCorrection: Story = {
  render: () => (
    <Entry
      sub="zwei Belege, einer ersetzt"
      selected="evt-03"
      events={[
        ev("evt-03", "document_received", "2026-03-12", "Korrigierte Rechnung RE-24-0815 (10 % Rabatt)", 1071, "proposed", {
          bookingState: "proposed",
        }),
        ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted", {
          superseded: true,
        }),
      ]}
    >
      <Pane title="Korrigierte Rechnung RE-24-0815" sub="12.03.2026 · ersetzt den Beleg vom 04.03.">
        <FieldList
          tone="bare"
          rows={[
            ["Ersetzt", "Rechnung RE-24-0815 vom 04.03.2026 · 1.190,00 €"],
            ["Neu", "1.071,00 € — 10 % Rabatt, telefonisch zugesagt"],
            ["Differenz", "119,00 €"],
          ]}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **4 · Zweitschrift, keine Buchung nötig.** Dieselbe Rechnung noch einmal per
 * Mail. Sie bleibt im Strang — weggelassen wäre sie eine Lücke —, trägt aber
 * den Grund, warum hier nichts gebucht wird. Der Grund hängt am Badge.
 */
export const DuplicateNoBooking: Story = {
  render: () => (
    <Entry
      sub="zwei Belege, einer doppelt"
      selected="evt-04"
      events={[
        ev("evt-04", "document_received", "2026-03-06", "Zweitschrift RE-24-0815 (Mail)", 1190, "no_booking_required", {
          stateNote: "Zweitschrift derselben Rechnung per Mail, bereits über das Ereignis vom 04.03. erfasst.",
        }),
        ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted", {
          bookingState: "posted",
        }),
      ]}
    >
      <Pane title="Zweitschrift RE-24-0815" sub="06.03.2026 · keine Buchung nötig">
        <p className="v2muted" style={{ margin: 0 }}>
          Zweitschrift derselben Rechnung per Mail, bereits über das Ereignis vom 04.03. erfasst.
          Von Hand erledigt — es entsteht kein zweiter Buchungssatz.
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **5 · Vertrag hinterlegt.** Der Vertrag selbst wird nicht gebucht; gebucht
 * wird die monatliche Sollstellung daraus (siehe `RecurringAccrual`). Er steht
 * trotzdem im Strang, denn er ist der Grund für alles, was danach kommt.
 */
export const ContractFiled: Story = {
  render: () => (
    <Entry
      sub="ein Vertrag"
      selected="evt-05"
      events={[
        ev("evt-05", "document_received", "2026-01-02", "Mietvertrag Büro Leopoldstr. 12 ab 01/2026", 2380, "no_booking_required", {
          stateNote: "Vertrag selbst wird nicht gebucht; gebucht wird die monatliche Sollstellung.",
        }),
      ]}
    >
      <Pane title="Mietvertrag Büro Leopoldstr. 12" sub="02.01.2026 · Dauerschuldverhältnis">
        <SourceDocumentCell
          document={documentFixture({
            id: "doc-mietvertrag-2026",
            fileName: "Mietvertrag-Leopoldstr-12.pdf",
            sourceDocType: "contract",
            counterparty: "Leopold Immobilien GmbH",
            documentDate: "2026-01-02",
            receivedDate: "2026-01-02",
            caseNumber: "2026-0077",
            detail: null,
          })}
        />
        <FieldList tone="bare" rows={[["Monatlich", "2.380,00 €"], ["Ab", "01/2026"]]} />
      </Pane>
    </Entry>
  ),
};

/**
 * **6 · Zahlung raus, voller Betrag.** Das Ereignis nennt die Zahlung, die
 * Bankzeile beweist sie: Gegenseite, Tag, Betrag, Verwendungszweck. Das
 * Vorzeichen ist die Richtung — in der Zelle steht es negativ, ohne Farbe und
 * ohne das Wort „Ausgang" daneben.
 */
export const PaymentOutFull: Story = {
  render: () => (
    <Entry
      sub="Beleg und Zahlung"
      selected="evt-06"
      events={[
        ev("evt-06", "payment_out", "2026-03-18", "Überweisung an Müller Bürotechnik", 1190, "posted", {
          bookingState: "posted",
        }),
        ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted"),
      ]}
    >
      <Pane title="Überweisung an Müller Bürotechnik" sub="18.03.2026 · Rechnung ausgeglichen">
        <BankTransactionCell
          transaction={bank("2026-03-18", -1190, "MUELLER BUEROTECHNIK GMBH", "RE-24-0815 KD 4711")}
          account={{ label: "Girokonto 1200" }}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **7 · Teilzahlung in zwei Raten.** Zwei Ereignisse auf eine Rechnung. Nach
 * der ersten Rate sind 690,00 € offen — **das steht heute nur am offenen
 * Posten, nicht am Ereignis** (Befund B-01 in 0190): der Strang zeigt zwei
 * Zahlungen, nicht den Rest dazwischen.
 */
export const PaymentInTwoRates: Story = {
  render: () => (
    <Entry
      sub="eine Rechnung, zwei Raten"
      selected="evt-07a"
      events={[
        ev("evt-07b", "payment_out", "2026-04-15", "2. Rate (Rest) RE-24-0815", 690, "posted", { bookingState: "posted" }),
        ev("evt-07a", "payment_out", "2026-03-18", "1. Rate RE-24-0815", 500, "posted", { bookingState: "posted" }),
        ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted"),
      ]}
    >
      <Pane title="1. Rate RE-24-0815" sub="18.03.2026 · 500,00 € von 1.190,00 €">
        <BankTransactionCell
          transaction={bank("2026-03-18", -500, "MUELLER BUEROTECHNIK GMBH", "RE-24-0815 Teilzahlung 1/2")}
        />
        <FieldList tone="bare" rows={[["Offen nach dieser Rate", "690,00 €"]]} />
        <p className="v2muted" style={{ margin: 0 }}>
          Der Rest steht am offenen Posten, nicht am Ereignis (Befund B-01).
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **8 · Anteil an einer Sammelzahlung.** Eine Überweisung über 3.570,00 €
 * begleicht drei Rechnungen; auf diesen Fall entfallen 1.190,00 €. Seit
 * `allocatedAmount` (B-02, App `c478af21`) zeigt die Zeile **den Anteil**, und
 * der volle Betrag der Bankzeile steht im Tooltip der Zahl — er gehört zur
 * Zahlung, aber nicht zu diesem Fall.
 */
export const PaymentShareOfBatch: Story = {
  render: () => (
    <Entry
      sub="Anteil einer Sammelzahlung"
      selected="evt-08"
      events={[
        ev("evt-08", "payment_out", "2026-03-20", "Anteil Sammelüberweisung", 3570, "posted", {
          bookingState: "posted",
          allocatedAmount: -1190,
          note: "Split: RE-24-0815 / RE-24-0822 / RE-24-0840",
        }),
      ]}
    >
      <Pane title="Sammelüberweisung vom 20.03.2026" sub="drei Rechnungen in einem Auftrag">
        <BankTransactionCell
          transaction={bank("2026-03-20", -3570, "MUELLER BUEROTECHNIK GMBH", "RE-24-0815 RE-24-0822 RE-24-0840")}
        />
        <FieldList
          tone="bare"
          rows={[
            ["Auf diesen Fall", "1.190,00 € (RE-24-0815)"],
            ["Übrige", "RE-24-0822 · RE-24-0840"],
          ]}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          Die Strangzeile zeigt den Anteil dieses Falls; die ganze Bankzeile steht im Tooltip
          der Zahl.
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **9 · Zahlung mit Skonto.** Gezahlt sind 1.166,20 €, die Differenz von
 * 23,80 € ist Skonto. Der Satz dazu steht seit `note` (B-03) in der zweiten
 * Zeile des Eintrags — dort, wo die Art stünde, wenn sie nicht schon im
 * Zeichen steckte.
 */
export const PaymentWithDiscount: Story = {
  render: () => (
    <Entry
      sub="Zahlung mit Skonto"
      selected="evt-09"
      events={[
        ev("evt-09", "payment_out", "2026-03-11", "Zahlung RE-24-0815 abzgl. 2 % Skonto", 1166.2, "posted", {
          bookingState: "posted",
          note: "Differenz 23,80 € = Skonto",
        }),
      ]}
    >
      <Pane title="Zahlung abzüglich Skonto" sub="11.03.2026">
        <BankTransactionCell
          transaction={bank("2026-03-11", -1166.2, "MUELLER BUEROTECHNIK GMBH", "RE-24-0815 abzgl. Skonto")}
        />
        <FieldList
          tone="bare"
          rows={[
            ["Rechnung", "1.190,00 €"],
            ["Gezahlt", "1.166,20 €"],
            ["Skonto", "23,80 € (2 %)"],
          ]}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **10 · Zahlungseingang vom Kunden.** Die Gegenrichtung: positiv, und die
 * Erwartung dazu erledigt sich damit von selbst (siehe
 * `PaymentExpectationMet`).
 */
export const PaymentIn: Story = {
  render: () => (
    <Entry
      sub="Ausgangsrechnung und Eingang"
      selected="evt-10"
      events={[
        ev("evt-10", "payment_in", "2026-04-02", "Zahlung Hofmann Logistik AR-2026-031", 4760, "posted", {
          bookingState: "posted",
        }),
        ev("evt-02", "document_received", "2026-03-10", "Ausgangsrechnung AR-2026-031", 4760, "posted"),
      ]}
    >
      <Pane title="Zahlung Hofmann Logistik" sub="02.04.2026 · Rechnung ausgeglichen">
        <BankTransactionCell
          transaction={bank("2026-04-02", 4760, "HOFMANN LOGISTIK KG", "AR-2026-031")}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **11 · Erstattung vom Lieferanten.** Geld zurück auf eine Eingangsrechnung:
 * `payment_in` an einem Fall, der sonst nur Abgänge kennt. Die Richtung kommt
 * aus der Art, nicht aus dem Vorzeichen des gespeicherten Betrags.
 */
export const SupplierRefund: Story = {
  render: () => (
    <Entry
      sub="Rechnung und Erstattung"
      selected="evt-11"
      events={[
        ev("evt-11", "payment_in", "2026-03-25", "Gutschrift Rücksendung Toner", 119, "posted", { bookingState: "posted" }),
        ev("evt-06", "payment_out", "2026-03-18", "Überweisung an Müller Bürotechnik", 1190, "posted"),
      ]}
    >
      <Pane title="Gutschrift Rücksendung Toner" sub="25.03.2026">
        <BankTransactionCell
          transaction={bank("2026-03-25", 119, "MUELLER BUEROTECHNIK GMBH", "GUTSCHRIFT RUECKSENDUNG TONER")}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **12 · Lastschrift und Rücklastschrift.** Zwei Tage später ist das Geld
 * zurück. Beide Zeilen stehen im Strang, sonst wäre der Fall eine Zahlung, die
 * es nicht gab — und die offene Frage dazu (siehe `QuestionOpenClient`) hinge
 * in der Luft.
 */
export const DirectDebitReturned: Story = {
  render: () => (
    <Entry
      sub="Lastschrift und Rückläufer"
      selected="evt-12b"
      events={[
        ev("evt-12b", "payment_in", "2026-04-03", "Rücklastschrift", 312.4, "open"),
        ev("evt-12a", "payment_out", "2026-04-01", "Lastschrift Allianz Beitrag 04/2026", 312.4, "posted", {
          bookingState: "posted",
        }),
      ]}
    >
      <Pane title="Rücklastschrift" sub="03.04.2026 · Beitrag ging zurück">
        <BankTransactionCell
          transaction={bank("2026-04-03", 312.4, "ALLIANZ VERSICHERUNGS-AG", "RUECKLASTSCHRIFT BEITRAG 04/2026")}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          Wie es weitergeht, entscheidet der Mandant — die Rückfrage dazu steht offen.
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **13 · Zahlung in Fremdwährung.** Das Ereignis rechnet in EUR (221,35 €),
 * der Kurs hängt an der Bankzeile: 240,00 USD zu 1,0842. Die Zelle zeigt die
 * Bankzeile in ihrer Währung; der Gegenwert steht daneben.
 */
export const PaymentForeignCurrency: Story = {
  render: () => (
    <Entry
      sub="Zahlung in USD"
      selected="evt-13"
      events={[
        ev("evt-13", "payment_out", "2026-03-02", "GitHub Team 03/2026", 221.35, "posted", { bookingState: "posted" }),
      ]}
    >
      <Pane title="GitHub Team 03/2026" sub="02.03.2026 · Fremdwährung">
        <BankTransactionCell transaction={bank("2026-03-02", -240, "GITHUB INC", "GITHUB TEAM 03/2026", "USD")} />
        <FieldList
          tone="bare"
          rows={[
            ["Kurs", "1,0842"],
            ["Gegenwert", "221,35 €"],
          ]}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **14 · Geldtransit.** Eigenes Geld von einem Konto aufs andere: keine
 * Gegenseite, kein Aufwand, kein Ertrag. Die Art `internal_transfer` sagt es,
 * damit niemand nach einem Beleg sucht.
 */
export const InternalTransfer: Story = {
  render: () => (
    <Entry
      sub="Umbuchung zwischen eigenen Konten"
      selected="evt-14"
      events={[ev("evt-14", "internal_transfer", "2026-03-05", "Umbuchung Giro → Tagesgeld", 5000, "posted", { bookingState: "posted" })]}
    >
      <Pane title="Umbuchung Giro → Tagesgeld" sub="05.03.2026">
        <JournalEntryCard
          lines={[
            line("debit", "1360", "Geldtransit", 5000, "Umbuchung Tagesgeld"),
            line("credit", "1200", "Bank", 5000, "Umbuchung Tagesgeld"),
          ]}
          currency="EUR"
          accountHref={accountHref}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **15 · Verrechnungs-Zwilling (PayPal).** Der Server legt ihn an, wenn Geld
 * über ein Verrechnungskonto läuft; er hat **keine** Bankzeile als Quelle,
 * sondern hängt an einer fremden. Drüben gibt es das Feld seit `c478af21`
 * (`passThroughOfBankTransactionId`), im Strang steht es trotzdem nicht: eine
 * rohe Id ist keine Aussage. Die Zeile braucht die Bankzeile mit Wort und Weg
 * — Befund B-04 bleibt offen, jetzt als Frage nach dem Etikett.
 */
export const PassThroughTwin: Story = {
  render: () => (
    <Entry
      sub="Verrechnung Bank/PayPal"
      selected="evt-15"
      events={[ev("evt-15", "adjustment", "2026-03-09", "Umbuchung Bank/PayPal", 89.9, "posted", { bookingState: "posted" })]}
    >
      <Pane title="Umbuchung Bank/PayPal" sub="09.03.2026 · vom Server angelegt">
        <JournalEntryCard
          lines={[
            line("debit", "1210", "PayPal", 89.9, "Umbuchung Bank/PayPal"),
            line("credit", "1200", "Bank", 89.9, "Umbuchung Bank/PayPal"),
          ]}
          currency="EUR"
          accountHref={accountHref}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          Entstanden aus der PayPal-Zeile vom 09.03.; die Id dazu trägt das Ereignis, ein Wort
          dafür noch nicht (Befund B-04).
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **16 · Korrektur von Hand.** Kein Beleg, keine Zahlung: ein Mensch bucht um.
 * Der Grund („Hinweis Kanzlei, Abnahme 03/2026") steht seit B-03 in der Zeile
 * selbst und nicht nur in der Fläche.
 */
export const ManualCorrection: Story = {
  render: () => (
    <Entry
      sub="Korrektur von Hand"
      selected="evt-16"
      events={[
        ev("evt-16", "adjustment", "2026-03-31", "Skonto auf Erhaltene Skonti umbuchen", 23.8, "posted", {
          bookingState: "posted",
          note: "Hinweis Kanzlei, Abnahme 03/2026",
        }),
      ]}
    >
      <Pane title="Skonto umbuchen" sub="31.03.2026 · von Hand">
        <JournalEntryCard
          lines={[
            line("debit", "70112", "Müller Bürotechnik GmbH", 23.8, "Skonto RE-24-0815"),
            line("credit", "3736", "Erhaltene Skonti 19 % VSt", 23.8, "Skonto RE-24-0815", { taxKey: "9", taxRatePercent: 19 }),
          ]}
          currency="EUR"
          accountHref={accountHref}
        />
        <FieldList tone="bare" rows={[["Grund", "Hinweis der Kanzlei, Abnahme 03/2026"]]} />
      </Pane>
    </Entry>
  ),
};

/**
 * **17 · Sollstellung einer Dauerbuchung.** Je Regel und Periode genau eine.
 * Die Periode steht seit `accrualPeriod` (B-05) in der Zeile. Die **Regel**
 * bleibt draußen: `recurringRuleId` ist eine Id, und eine rohe Id sagt
 * niemandem, welche Regel gemeint ist — sie braucht ihr Wort vom Aufrufer.
 */
export const RecurringAccrual: Story = {
  render: () => (
    <Entry
      sub="Sollstellung März"
      selected="evt-17"
      events={[
        ev("evt-17", "accrual", "2026-03-01", "Miete März 2026", 2380, "posted", {
          bookingState: "posted",
          accrualPeriod: "2026-03",
        }),
      ]}
    >
      <Pane title="Miete März 2026" sub="01.03.2026 · aus der Dauerbuchung">
        <FieldList
          tone="bare"
          rows={[
            ["Regel", "Miete Büro Leopoldstr. 12, monatlich zum 1."],
            ["Periode", "2026-03"],
            ["Vertrag", "Mietvertrag vom 02.01.2026"],
          ]}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          Die Regel selbst nennt die Zeile nicht — dafür bräuchte sie deren Wort, nicht die Id.
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **18 · Zahlung zur Dauerbuchung.** Der Ausgleich trägt **keine** Periode: er
 * gehört zum Dauerauftrag, nicht zum Monat. Sonst stünde die Miete zweimal in
 * der Periode 2026-03.
 */
export const RecurringPayment: Story = {
  render: () => (
    <Entry
      sub="Sollstellung und Zahlung"
      selected="evt-18"
      events={[
        ev("evt-18", "payment_out", "2026-03-03", "Dauerauftrag Miete 03/2026", 2380, "posted", { bookingState: "posted" }),
        ev("evt-17", "accrual", "2026-03-01", "Miete März 2026", 2380, "posted", { accrualPeriod: "2026-03" }),
      ]}
    >
      <Pane title="Dauerauftrag Miete 03/2026" sub="03.03.2026">
        <BankTransactionCell
          transaction={bank("2026-03-03", -2380, "LEOPOLD IMMOBILIEN GMBH", "MIETE 03/2026 LEOPOLDSTR 12")}
        />
        <FieldList tone="bare" rows={[["Periode", "keine — der Ausgleich gehört zur Regel, nicht zum Monat"]]} />
      </Pane>
    </Entry>
  ),
};

/**
 * **19 · Offener Posten aus dem DATEV-Spiegel.** Der Fall beginnt im Vorjahr
 * und stammt nicht aus Ludwig: das Wort **DATEV** steht in der Zeile, und
 * gebucht wird hier nichts — die Sollstellung steht schon drüben.
 */
export const OpenItemCarryover: Story = {
  render: () => (
    <Entry
      sub="Vortrag aus 2025"
      selected="evt-19"
      events={[
        ev("evt-19", "open_item_carryover", "2025-12-15", "Offener Posten aus DATEV: RE 2025-117 Schreinerei Huber", 2975, "no_booking_required", {
          source: "datev",
          stateNote: "Sollstellung ist bereits in DATEV gebucht (OPOS-Vortrag).",
        }),
      ]}
    >
      <Pane title="Offener Posten RE 2025-117" sub="15.12.2025 · aus dem DATEV-Spiegel">
        <FieldList
          tone="bare"
          rows={[
            ["Herkunft", "DATEV-Spiegel · mirror-opos:70230-2025-117"],
            ["Kreditor", "70230 · Schreinerei Huber"],
            ["Offen", "2.975,00 €"],
          ]}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **20 · Zahlung auf einen offenen Posten aus DATEV.** Ludwig bucht die
 * Zahlung, nicht die Rechnung: die stand schon drüben. Zugeordnet hat sie der
 * Agent selbst — über die Belegnummer im Verwendungszweck.
 */
export const OpenItemPaid: Story = {
  render: () => (
    <Entry
      sub="Vortrag und Zahlung"
      selected="evt-20"
      events={[
        ev("evt-20", "payment_out", "2026-01-12", "Zahlung Schreinerei Huber RE 2025-117", 2975, "posted", { bookingState: "posted" }),
        ev("evt-19", "open_item_carryover", "2025-12-15", "Offener Posten aus DATEV: RE 2025-117", 2975, "no_booking_required", {
          source: "datev",
        }),
      ]}
    >
      <Pane title="Zahlung RE 2025-117" sub="12.01.2026 · offener Posten ausgeglichen">
        <BankTransactionCell
          transaction={bank("2026-01-12", -2975, "SCHREINEREI HUBER", "RE 2025-117")}
        />
        <FieldList tone="bare" rows={[["Zuordnung", "automatisch — Belegnummer im Verwendungszweck"]]} />
      </Pane>
    </Entry>
  ),
};

/**
 * **21 · Zahlung, die die Kanzlei selbst gebucht hat.** Ludwig kennt die
 * Zahlung, bucht sie aber nicht: die Kanzlei war schneller. Der Grund steht am
 * Zustand, damit niemand nach dem fehlenden Satz sucht.
 */
export const BookedByFirm: Story = {
  render: () => (
    <Entry
      sub="Zahlung, drüben gebucht"
      selected="evt-21"
      events={[
        ev("evt-21", "payment_out", "2026-02-27", "USt-Vorauszahlung 01/2026", 1840, "no_booking_required", {
          stateNote: "Kanzlei hat die Zahlung direkt in DATEV gebucht.",
        }),
      ]}
    >
      <Pane title="USt-Vorauszahlung 01/2026" sub="27.02.2026 · keine Buchung nötig">
        <BankTransactionCell
          transaction={bank("2026-02-27", -1840, "FINANZAMT MUENCHEN", "UST-VORANMELDUNG 01/2026")}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          Die Kanzlei hat die Zahlung direkt in DATEV gebucht.
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **Randfall: das Vorzeichen.** `payment_out` kommt aus zwei Quellen mit zwei
 * Vorzeichen — die Bank-Zuordnung speichert negativ, die Wiederkehr-Zuordnung
 * positiv. Beide Zeilen zeigen **−1.190,00 €**: der Strang dreht das Vorzeichen
 * an der Art, nicht am gespeicherten Wert.
 */
export const PaymentSignBothWays: Story = {
  render: () => (
    <Entry
      sub="derselbe Betrag, zwei Vorzeichen"
      events={[
        ev("evt-sign-neg", "payment_out", "2026-03-19", "Zahlung, negativ gespeichert (Bank-Zuordnung)", -1190, "posted"),
        ev("evt-sign-pos", "payment_out", "2026-03-18", "Zahlung, positiv gespeichert (Wiederkehr)", 1190, "posted"),
      ]}
    >
      <Pane title="Vorzeichen" sub="zwei Quellen, eine Anzeige">
        <FieldList
          tone="bare"
          rows={[
            ["Bank-Zuordnung", "amount −1190 → zeigt −1.190,00 €"],
            ["Wiederkehr-Zuordnung", "amount 1190 → zeigt −1.190,00 €"],
          ]}
        />
      </Pane>
    </Entry>
  ),
};

/* ══════════════════════════════════════════════════════════════════════
   B · Am Sachverhalt, ohne Ereigniszeile
   ══════════════════════════════════════════════════════════════════════ */

const NOTE: ClarificationVM & ClarificationDetailVM = {
  id: "cl-22",
  type: "comment",
  title: "Rabatt telefonisch zugesagt",
  state: "open",
  severity: "optional",
  audience: "accounting",
  raisedAt: "2026-03-11T15:20:00Z",
  sourceModule: "web",
  answerKind: "free_text",
  text: "Laut Mandant (Tel. 11.03.) gibt Müller 10 % Rabatt, Korrekturrechnung kommt.",
};

const QUESTION: ClarificationVM & ClarificationDetailVM = {
  id: "cl-23",
  type: "question",
  title: "Rücklastschrift Allianz",
  state: "open",
  severity: "required",
  audience: "client",
  raisedAt: "2026-04-03T08:00:00Z",
  sourceModule: "agent",
  answerKind: "single_choice",
  allowFreeText: true,
  text: "Die Allianz-Lastschrift über 312,40 € ging zurück. Wie geht es weiter?",
  answerOptions: [
    "Beitrag wird nachgezahlt – Rücklastschrift ausgleichen",
    "Vertrag ist gekündigt – keine Beiträge mehr erwarten",
  ],
};

/**
 * **22 · Notiz am Sachverhalt.** `type = 'comment'`: Kontext ohne Aktion, wird
 * nie beantwortet und zählt nie als offen. Sie steht in derselben Liste wie
 * die Rückfragen — eine Tabelle, eine Zeitachse (Owner 2026-09-18).
 */
export const NoteOnCase: Story = {
  render: () => (
    <Entry
      sub="ein Beleg"
      events={[ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "proposed")]}
    >
      <Pane title="Notiz" sub="11.03.2026">
        <ClarificationCard clarification={NOTE} />
      </Pane>
    </Entry>
  ),
};

/**
 * **23 · Offene Rückfrage an den Mandanten.** Sie steht im Strang — eine
 * offene Frage ist Teil der Geschichte — und blockiert die Buchung
 * (`severity: required`). Antworten tut der Mandant im Portal; die Kanzlei
 * liest sie nur, deshalb keine Antwortfläche.
 */
export const QuestionOpenClient: Story = {
  render: () => (
    <Entry
      sub="Rückläufer und Frage"
      selected="cl-23"
      events={[ev("evt-12b", "payment_in", "2026-04-03", "Rücklastschrift", 312.4, "open")]}
      clarifications={[
        { id: "cl-23", type: "question", title: "Rücklastschrift Allianz", raisedAt: "2026-04-03T08:00:00Z", severity: "required", audience: "client" },
      ]}
    >
      <Pane title="Rückfrage" sub="offen · Mandant">
        <ClarificationCard clarification={QUESTION} />
      </Pane>
    </Entry>
  ),
};

/**
 * **24 · Rückfrage beantwortet.** Dieselbe Zeile, später: die gewählte Option
 * **ist** der gespeicherte Wert, der Freitext steht daneben. Ab jetzt zählt
 * das Antwortdatum, nicht mehr das Alter der Frage.
 */
export const QuestionAnswered: Story = {
  render: () => (
    <Entry
      sub="Frage beantwortet"
      selected="cl-23"
      events={[ev("evt-12b", "payment_in", "2026-04-03", "Rücklastschrift", 312.4, "open")]}
      clarifications={[
        {
          id: "cl-23",
          type: "question",
          title: "Rücklastschrift Allianz",
          raisedAt: "2026-04-03T08:00:00Z",
          answeredAt: "2026-04-08T07:12:00Z",
          severity: "required",
          audience: "client",
        },
      ]}
    >
      <Pane title="Rückfrage" sub="beantwortet am 08.04.2026">
        <ClarificationCard
          clarification={{
            ...QUESTION,
            state: "answered",
            answeredAt: "2026-04-08T07:12:00Z",
            history: [
              { kind: "raised", at: "2026-04-03T08:00:00Z", by: "Buchungsagent" },
              {
                kind: "answered",
                at: "2026-04-08T07:12:00Z",
                by: "Mandant",
                text: "Beitrag wird nachgezahlt – Rücklastschrift ausgleichen · „Überweisen wir am 15.04.“",
              },
            ],
          }}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **25 · Rückfrage auf Wiedervorlage.** Zurückgestellt ist nicht beantwortet:
 * Datum **und** Pflichtgrund stehen dabei, und ab dem zweiten Mal sagt die
 * Karte, zum wievielten Mal verschoben wurde.
 */
export const QuestionDeferred: Story = {
  render: () => (
    <Entry
      sub="Frage zurückgestellt"
      selected="cl-25"
      events={[ev("evt-06", "payment_out", "2026-03-18", "Überweisung an Müller Bürotechnik", 1190, "posted")]}
      clarifications={[
        {
          id: "cl-25",
          type: "question",
          title: "Zu welcher Rechnung gehört die Zahlung?",
          raisedAt: "2026-03-20T09:00:00Z",
          deferredUntil: "2026-04-20",
          severity: "required",
          audience: "accounting",
        },
      ]}
    >
      <Pane title="Rückfrage" sub="zurückgestellt bis 20.04.2026">
        <ClarificationCard
          clarification={{
            id: "cl-25",
            type: "question",
            title: "Zu welcher Rechnung gehört die Zahlung?",
            state: "deferred",
            severity: "required",
            audience: "accounting",
            raisedAt: "2026-03-20T09:00:00Z",
            deferredUntil: "2026-04-20",
            deferredReason: "Zahlungsavis vom Kunden angekündigt",
            deferredCount: 1,
            answerKind: "free_text",
            text: "Die Überweisung nennt keine Belegnummer; zwei Rechnungen kommen in Frage.",
          }}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **26 · Beleg fehlt.** Eine Erwartung ist das Einzige am Fall, das in der
 * **Zukunft** liegt: sie steht mit ihrem Fälligkeitstag im Strang und
 * verschwindet, sobald der Beleg eingeht. Eskalationsstufe 1 heißt: einmal
 * nachgefasst.
 */
export const DocumentExpected: Story = {
  render: () => (
    <Entry
      sub="Zahlung ohne Beleg"
      selected="exp-26"
      events={[ev("evt-13", "payment_out", "2026-03-02", "GitHub Team 03/2026", 221.35, "blocked")]}
      expectations={[
        {
          id: "exp-26",
          kind: "document",
          dueDate: "2026-03-16",
          escalationLevel: 1,
          counterpartyName: "GitHub, Inc.",
          amount: 221.35,
          currency: "EUR",
        },
      ]}
    >
      <Pane title="Erwarteter Beleg" sub="fällig am 16.03.2026">
        <ExpectationRow
          expectation={{
            id: "exp-26",
            kind: "document",
            dueDate: "2026-03-16",
            escalationLevel: 1,
            audience: "client",
            expectedCounterpartyName: "GitHub, Inc.",
            expectedAmount: 221.35,
            resolvedAt: null,
          }}
          today={TODAY}
          currency="EUR"
        />
        <p className="v2muted" style={{ margin: 0 }}>
          Erledigt sich, sobald die Rechnung eingeht — nicht durch eine Antwort.
        </p>
      </Pane>
    </Entry>
  ),
};

/**
 * **27 · Zahlung erwartet und erfüllt.** Die Erwartung ist aufgelöst und
 * verschwindet damit aus dem Strang; im Strang steht das Ereignis, das sie
 * erfüllt hat. **Wodurch** sie erledigt wurde, kann die Zeile heute nicht
 * sagen (Befund B-06).
 */
export const PaymentExpectationMet: Story = {
  render: () => (
    <Entry
      sub="Rechnung, Erwartung, Eingang"
      selected="evt-10"
      events={[
        ev("evt-10", "payment_in", "2026-04-02", "Zahlung Hofmann Logistik AR-2026-031", 4760, "posted"),
        ev("evt-02", "document_received", "2026-03-10", "Ausgangsrechnung AR-2026-031", 4760, "posted"),
      ]}
      expectations={[
        {
          id: "exp-27",
          kind: "payment",
          dueDate: "2026-04-09",
          escalationLevel: 0,
          resolvedAt: "2026-04-02T08:40:00Z",
          counterpartyName: "Hofmann Logistik KG",
          amount: 4760,
          currency: "EUR",
        },
      ]}
    >
      <Pane title="Erwartete Zahlung" sub="erledigt am 02.04.2026">
        <ExpectationRow
          expectation={{
            id: "exp-27",
            kind: "payment",
            dueDate: "2026-04-09",
            escalationLevel: 0,
            audience: "accounting",
            expectedCounterpartyName: "Hofmann Logistik KG",
            expectedAmount: 4760,
            resolvedAt: "2026-04-02T08:40:00Z",
          }}
          today={TODAY}
          currency="EUR"
        />
        <FieldList tone="bare" rows={[["Erledigt durch", "Zahlungseingang vom 02.04.2026 (AR-2026-031)"]]} />
        <p className="v2muted" style={{ margin: 0 }}>
          Den Verweis auf das lösende Ereignis trägt die Erwartung im Set noch nicht (Befund B-06).
        </p>
      </Pane>
    </Entry>
  ),
};

const PROPOSAL: JournalLine[] = [
  line("debit", "6815", "Bürobedarf", 1000, "RE-24-0815", { taxKey: "9", taxRatePercent: 19 }),
  line("credit", "70112", "Müller Bürotechnik GmbH", 1190, "RE-24-0815"),
];

/**
 * **28 · Buchungsvorschlag des Agenten.** Der Satz und der Grund dafür: die
 * Präzedenz („sechs Buchungen auf 6815") steht nicht in der Buchung, sondern
 * daneben — ein Vorschlag ohne Begründung ist eine Behauptung.
 */
export const BookingProposed: Story = {
  render: () => (
    <Entry
      sub="Beleg mit Vorschlag"
      selected="evt-01"
      events={[ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "proposed", { bookingState: "proposed" })]}
    >
      <Pane title="Buchungsvorschlag" sub="04.03.2026 · wartet auf Freigabe">
        <JournalEntryCard lines={PROPOSAL} currency="EUR" accountHref={accountHref} />
        <AiBookingNotes
          verdict="confirm"
          confidence="green"
          rationale="Büromaterial des Lieferanten Müller; in sechs Monaten sechsmal auf 6815 gebucht."
          judgeReasoning="Büromaterial, Präzedenz 6 Buchungen auf 6815"
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **29 · Freigegeben und exportiert.** Derselbe Satz, später: mit Stapel,
 * LudwigAI-Referenz und Sperre. Ab hier ist er nur noch stornierbar, nicht
 * mehr änderbar.
 */
export const BookingExported: Story = {
  render: () => {
    const entry: JournalEntryVM = {
      journalEntryId: "je-28",
      status: "accepted",
      origin: "ai_proposed",
      acceptanceQuality: "ai_unmodified",
      confidence: 0.93,
      bookingDate: "2026-03-04",
      rationale: "Büromaterial des Lieferanten Müller; in sechs Monaten sechsmal auf 6815 gebucht.",
      isLocked: true,
      blocked: false,
      currency: "EUR",
      exportedAt: "2026-04-05T14:02:00Z",
      exportRef: "LW-7F3A2C91",
      exportBatchId: "batch-2026-03",
      exportStapelnummer: "2026-03",
      lines: [
        {
          side: "debit",
          accountNumber: "6815",
          accountName: "Bürobedarf",
          amount: 1000,
          taxKey: "9",
          taxRatePercent: 19,
          lineText: "Müller Bürotechnik 03/2026",
          externalDocumentNumber: "RE-24-0815",
        },
        {
          side: "credit",
          accountNumber: "70112",
          accountName: "Müller Bürotechnik GmbH",
          amount: 1190,
          taxKey: null,
          taxRatePercent: null,
          lineText: "Müller Bürotechnik 03/2026",
          externalDocumentNumber: "RE-24-0815",
        },
      ],
    };
    return (
      <Entry
        sub="Beleg, gebucht und exportiert"
        selected="evt-01"
        events={[ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "accepted", { bookingState: "accepted" })]}
      >
        <JournalEntryFacts entry={entry} accountHref={accountHref} />
      </Entry>
    );
  },
};

/**
 * **30 · Storno.** Zwei Sätze, nicht einer: der stornierte bleibt stehen, der
 * Storno kommt dazu. Der Strang zeigt beides am selben Ereignis — „Gebucht ·
 * Zurückgezogen". **Woher** der Storno kommt, sagt der Satz heute nicht
 * (Befund B-07).
 */
export const BookingReversed: Story = {
  render: () => (
    <Entry
      sub="Buchung storniert"
      selected="evt-01"
      events={[ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted", { bookingState: "reversed" })]}
    >
      <Pane title="Storno" sub="12.03.2026 · der Vorschlag gilt nicht mehr">
        <JournalEntryCard
          lines={[
            line("debit", "70112", "Müller Bürotechnik GmbH", 1190, "Storno RE-24-0815"),
            line("credit", "6815", "Bürobedarf", 1000, "Storno RE-24-0815", { taxKey: "9", taxRatePercent: 19 }),
          ]}
          currency="EUR"
          caption="Storno-Satz je-30"
          accountHref={accountHref}
        />
        <FieldList
          tone="bare"
          rows={[
            ["Storniert", "je-28 vom 04.03.2026"],
            ["Grund", "Korrekturrechnung mit 10 % Rabatt"],
          ]}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          Den Verweis auf den stornierten Satz trägt das Set noch nicht (Befund B-07).
        </p>
      </Pane>
    </Entry>
  ),
};

/** The mirror records of the reference case, as the new family shows them (0191). */
const mirror = (over: Partial<MirrorEntryVM> = {}): MirrorEntryVM => ({
  id: "mir-31",
  description: "Müller Bürotechnik Bürobedarf",
  amount: 1190,
  currency: "EUR",
  postingDate: "2026-03-04",
  matchState: "matched_ludwig",
  externalDocumentNumber: "RE-24-0815",
  sequenceId: "2026-03",
  sequenceCommitted: true,
  exportRef: "LW-7F3A2C91",
  caseNumber: "2026-0142",
  lines: [
    { side: "debit", accountNumber: "6815", accountName: "Bürobedarf", amount: 1190 },
    { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 1190 },
  ],
  ...over,
});

/**
 * **31 · DATEV-Spiegel: bestätigt.** Der Export ist drüben angekommen und
 * wiedergefunden — über die LudwigAI-Referenz. Das ist der Endzustand einer
 * Buchung: nicht „exportiert", sondern **bestätigt**. Seit 0191 zeigt das die
 * Familie `MirrorEntry` statt einer Behelfs-Liste.
 */
export const MirrorMatched: Story = {
  render: () => (
    <Entry
      sub="Buchung in DATEV bestätigt"
      selected="evt-01"
      events={[ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted", { bookingState: "posted" })]}
    >
      <Pane title="In DATEV gebucht" sub="ein Satz · bestätigt">
        <MirrorEntryList entries={[mirror()]} />
      </Pane>
    </Entry>
  ),
};

/**
 * **32 · DATEV-Spiegel: von der Kanzlei geändert.** Drüben steht 6845 statt
 * 6815. DATEV gewinnt — Ludwig zeigt die Abweichung, ändert sie nicht.
 */
export const MirrorCorrected: Story = {
  render: () => (
    <Entry
      sub="Buchung drüben geändert"
      selected="evt-01"
      events={[ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted", { bookingState: "posted" })]}
    >
      <Pane title="In DATEV gebucht" sub="ein Satz · von der Kanzlei geändert">
        <MirrorEntryList
          entries={[
            mirror({
              id: "mir-32",
              matchState: "matched_corrected",
              description: "Müller Bürotechnik – auf 6845 umgebucht",
              lines: [
                { side: "debit", accountNumber: "6845", accountName: "Werbekosten", amount: 1190 },
                { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 1190 },
              ],
            }),
          ]}
        />
        <FieldList tone="bare" rows={[["Bei uns", "6815 an 70112 · 1.190,00 €"]]} />
      </Pane>
    </Entry>
  ),
};

/**
 * **33 · DATEV-Spiegel: aufgeteilt.** Die Kanzlei hat den Satz in zwei Teile
 * zerlegt, die zusammen den Ludwig-Betrag ergeben. Beide Teile gehören
 * zusammen gezeigt — ein Teil allein sähe aus wie ein falscher Betrag.
 */
export const MirrorSplit: Story = {
  render: () => (
    <Entry
      sub="Buchung drüben geteilt"
      selected="evt-01"
      events={[ev("evt-01", "document_received", "2026-03-04", "Rechnung RE-24-0815", 1190, "posted", { bookingState: "posted" })]}
    >
      <Pane title="In DATEV gebucht" sub="ein Satz · in zwei Teile zerlegt">
        <MirrorEntryList
          entries={[
            mirror({
              id: "mir-33a",
              matchState: "matched_split",
              amount: 714,
              lines: [
                { side: "debit", accountNumber: "6815", accountName: "Bürobedarf", amount: 714 },
                { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 714 },
              ],
            }),
            mirror({
              id: "mir-33b",
              matchState: "matched_split",
              amount: 476,
              description: "Müller Bürotechnik Büroeinrichtung",
              lines: [
                { side: "debit", accountNumber: "0650", accountName: "Büroeinrichtung", amount: 476 },
                { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 476 },
              ],
            }),
          ]}
        />
        <FieldList tone="bare" rows={[["Zusammen", "1.190,00 € — entspricht unserem Satz"]]} />
      </Pane>
    </Entry>
  ),
};

/**
 * **34 · DATEV-Spiegel: Fremdbuchung zum Fall.** Die Kanzlei hat drüben selbst
 * gebucht, ohne Ludwig: ein Skontoertrag zu diesem Sachverhalt. Er wird **nicht**
 * ins Journal übernommen, steht aber am Fall — im Strang als Zeile mit dem Wort
 * DATEV.
 */
export const MirrorForeignEntry: Story = {
  render: () => (
    <Entry
      sub="Fremdbuchung der Kanzlei"
      selected="evt-34"
      events={[
        ev("evt-34", "adjustment", "2026-03-31", "Skontoertrag Müller (in DATEV gebucht)", 23.8, "no_booking_required", {
          source: "datev",
          stateNote: "Von der Kanzlei direkt in DATEV gebucht — Ludwig übernimmt den Satz nicht.",
        }),
      ]}
    >
      <Pane title="In DATEV gebucht" sub="ein Satz · ohne uns">
        <MirrorEntryList
          entries={[
            mirror({
              id: "mir-34",
              matchState: "new_unprocessed",
              description: "Skontoertrag Müller",
              postingDate: "2026-03-31",
              amount: 23.8,
              exportRef: null,
              markOfOrigin: "RE",
              lines: [
                { side: "debit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 23.8 },
                { side: "credit", accountNumber: "3736", accountName: "Erhaltene Skonti", amount: 23.8 },
              ],
            }),
          ]}
        />
      </Pane>
    </Entry>
  ),
};

/**
 * **35 · Freigabe „Vorsteuer ohne Beleg".** Ein Mensch hat entschieden, dass
 * die Vorsteuer ohne Rechnung gezogen wird — mit Tag und Grund. Das hängt am
 * Sachverhalt selbst, nicht an einem Ereignis, und steht deshalb in den
 * Stammdaten (`CaseFacts`, seit 0191). Ohne Freigabe steht die Zeile nicht da.
 */
export const VatWithoutDocumentApproved: Story = {
  render: () => (
    <Entry
      sub="Zahlung ohne Beleg, freigegeben"
      selected="evt-13"
      events={[ev("evt-13", "payment_out", "2026-03-02", "GitHub Team 03/2026", 221.35, "posted", { bookingState: "posted" })]}
      expectations={[
        {
          id: "exp-26",
          kind: "document",
          dueDate: "2026-03-16",
          escalationLevel: 1,
          counterpartyName: "GitHub, Inc.",
          amount: 221.35,
          currency: "EUR",
        },
      ]}
    >
      <Pane title="Stammdaten" sub="Sachverhalt 2026-0171">
        <CaseFacts
          case={caseFixture({
            caseNumber: "2026-0171",
            kind: "incoming_invoice",
            summary: "Abo GitHub Team; gezahlt, Rechnung liegt noch nicht vor.",
            counterpartyName: "GitHub, Inc.",
            personalAccountNumber: "70455",
            vatWithoutDocumentApproval: {
              approvedAt: "2026-03-20T10:00:00Z",
              approvedBy: "usr-sb-02",
              reason: "Abo-Rechnung liegt im GitHub-Konto, Mandant reicht nach",
              clarificationId: "cl-35",
            },
          })}
          accountHref={accountHref}
        />
      </Pane>
    </Entry>
  ),
};
