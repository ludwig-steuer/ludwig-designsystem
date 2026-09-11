import { bankMatchStage } from "@/ludwig/modules/bank-transactions/domain/bank-transaction-vm";
import { resolveEventBookingState, restOf } from "./derive";
import { caseIdentifier } from "../accounting-case/case-title";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { FieldList } from "../../primitives/FieldList";
import { MonoCell } from "../../primitives/Cells";
import { Disclosure } from "../../primitives/Disclosure";
import { RawRecord } from "../../primitives/RawRecord";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import { BankTransactionPurpose } from "./BankTransactionPurpose";
import type { BankTransactionDetailData } from "./bank-transaction";

/**
 * Everything that stands on a payment (0102) — eighteen points in five blocks.
 *
 * There is one existing version of this in the app and it is good; this is
 * that version lifted, plus what was missing. The reason it is its own
 * component and not markup in the drawer is 0052: the drawer must show its
 * core facts from the **same** component a later detail view would use. Two
 * field lists for one entity are two truths.
 */

export type BankTransactionFactBlock =
  | "payment"
  | "purpose"
  | "counterparty"
  | "assignment"
  | "import";

const ALL_BLOCKS: BankTransactionFactBlock[] = [
  "payment",
  "purpose",
  "counterparty",
  "assignment",
  "import",
];

/**
 * @when    A payment is opened — the drawer, and later a detail view.
 * @instead One line of the statement → BankTransactionRow. A payment
 *          mentioned elsewhere → BankTransactionCell.
 */
export function BankTransactionFacts({
  transaction: t,
  caseHref,
  blocks = ALL_BLOCKS,
  tone = "surface",
}: {
  transaction: BankTransactionDetailData;
  caseHref: (caseId: string) => string;
  /** Which blocks. The drawer leaves out „Import" — that is origin, not a core question. */
  blocks?: BankTransactionFactBlock[];
  tone?: "surface" | "bare";
}) {
  const picked = new Set(blocks);
  return (
    <div className="v2btxf">
      {picked.has("payment") ? (
        <FieldList
          title="Zahlung"
          tone={tone}
          rows={[
            [
              "Betrag",
              <Amount key="a" value={t.amount} currency={t.currency} />,
            ],
            ["Buchungsdatum", <Time key="d" value={t.postingDate} format="date" />],
            ...(t.valueDate
              ? [["Valuta", <Time key="v" value={t.valueDate} format="date" />] as [
                  React.ReactNode,
                  React.ReactNode,
                ]]
              : []),
            // `amount_eur` is filled everywhere and today identical to
            // `amount` (phase 1 is EUR only, `fx_rate` is always 1). A row
            // „Betrag (EUR): 89,90 €" next to „Betrag: 89,90 €" says nothing,
            // so it appears only when the two part ways.
            ...(t.amountEur !== t.amount
              ? [[
                  "Betrag in EUR",
                  <Amount key="e" value={t.amountEur} currency="EUR" />,
                ] as [React.ReactNode, React.ReactNode]]
              : []),
          ]}
        />
      ) : null}

      {picked.has("purpose") ? (
        // **Not a `FieldList`.** A field list is a list of pairs and puts its
        // value flush right; the purpose is one long value with no label, and
        // right-aligned prose is unreadable. It borrows the frame and the
        // heading, not the row.
        <section className={`v2fields${tone === "bare" ? " v2fields--bare" : ""}`}>
          <div className="v2fields__h">Verwendungszweck</div>
          <div className="v2btxf__purpose">
            <BankTransactionPurpose purpose={t.purpose} tags={t.sepaTags} variant="block" />
          </div>
        </section>
      ) : null}

      {picked.has("counterparty") ? (
        <FieldList
          title="Gegenpartei"
          tone={tone}
          rows={[
            ["Name", t.counterpartyName ?? <span className="v2muted">ohne Namen</span>],
            ...(t.counterpartyIban
              ? [["IBAN", <MonoCell key="i" value={t.counterpartyIban} />] as [
                  React.ReactNode,
                  React.ReactNode,
                ]]
              : []),
            ...(t.counterpartyBic
              ? [["BIC", <MonoCell key="b" value={t.counterpartyBic} />] as [
                  React.ReactNode,
                  React.ReactNode,
                ]]
              : []),
          ]}
        />
      ) : null}

      {picked.has("assignment") ? <Assignment transaction={t} caseHref={caseHref} tone={tone} /> : null}

      {picked.has("import") ? (
        <FieldList
          title="Import"
          tone={tone}
          rows={[
            ["Quelle", SOURCE[t.source]],
            [
              "Import-Lauf",
              <span key="b">
                {t.importBatchLabel ?? "ohne Bezeichnung"} ·{" "}
                <Time value={t.importedAt} format="dateTime" />
              </span>,
            ],
            ...(t.externalId
              ? [["Externe ID", <MonoCell key="x" value={t.externalId} />] as [
                  React.ReactNode,
                  React.ReactNode,
                ]]
              : []),
          ]}
        />
      ) : null}

      {picked.has("import") ? (
        // **Not a field row.** A field list puts its value flush right and in
        // the right-hand column: measured, the raw table started at 257 px and
        // its mono keys stood right-aligned in 435 px — the opposite of what
        // 0051 was built for. And it is collapsed, because the column comment
        // calls the payload „for audit and debugging": that is a question one
        // asks, not one that has to be answered unasked.
        <Disclosure summary="Rohdaten der Quelle" tone="quiet">
          <RawRecord record={t.rawPayload} />
        </Disclosure>
      ) : null}
    </div>
  );
}

/** How the payment got here. Three values, and the set has no axis for them. */
const SOURCE: Record<BankTransactionDetailData["source"], string> = {
  csv: "Datei-Import",
  qonto: "Qonto-Schnittstelle",
  manual: "von Hand erfasst",
};

/**
 * The one block where a missing value **means** something.
 *
 * 65 % of the lines belong to no case. That is not a gap to be left blank —
 * it is the answer to the question the statement is read for, and it stands
 * as a sentence.
 */
function Assignment({
  transaction: t,
  caseHref,
  tone,
}: {
  transaction: BankTransactionDetailData;
  caseHref: (caseId: string) => string;
  tone: "surface" | "bare";
}) {
  if (t.cases.length === 0) {
    return (
      <FieldList
        title="Zuordnung"
        tone={tone}
        rows={[
          // Rank 5 before rank 6 — the same order as in the filled branch. The
          // empty case is the one 65 % of the lines show; it must not turn the
          // block around.
          ["DATEV-Historie", <MatchStage key="m" stage={t.matchStage} />],
          [
            "Sachverhalt",
            <span key="n" className="v2btxf__note">
              Diese Zahlung ist noch keinem Sachverhalt zugeordnet.
            </span>,
          ],
        ]}
      />
    );
  }
  return (
    <FieldList
      title="Zuordnung"
      tone={tone}
      rows={[
        ["DATEV-Historie", <MatchStage key="m" stage={t.matchStage} />],
        [
          "Sachverhalte",
          // `stacked`: a facts panel has room, and here the case **is** the
          // point — the name keeps its place (owner decision 2026-09-07; a
          // list is the other case and gets `inline`).
          <CaseCell key="c" cases={t.cases} href={caseHref} showState={false} layout="stacked" />,
        ],
        // Per case, not once: the booking state belongs to the **event**, and
        // with several cases there are several events. That is the sentence
        // the whole family rests on (decision 3 of the Freigabe).
        ...t.cases.map((c, i) => {
          const state = resolveEventBookingState({
            proposalStatus: c.eventBookingState,
            noBookingRequiredReason: c.noBookingRequiredReason,
          });
          return [
            `Buchung ${caseIdentifier(c)}`,
            // The (i) **once**, on the first one: the axis explains itself
            // once, and with three cases three word-identical marks stood
            // under each other (acceptance 0102). Same rule the column of
            // this family follows — there it sits in the head.
            <StatusBadge key={c.caseId} axis="event_booking" status={state.value} info={i === 0} />,
          ] as [React.ReactNode, React.ReactNode];
        }),
        // The rest, from the same source as the row: both forms have to say
        // the same number, and „adds up?" is the question a split raises.
        ...(restOf(t) > 0.005
          ? [[
              "Nicht zugeordnet",
              <Amount key="r" value={restOf(t)} currency={t.currency} />,
            ] as [React.ReactNode, React.ReactNode]]
          : []),
        ...(t.openClarificationsCount > 0
          ? [[
              "Offene Klärungen",
              `${t.openClarificationsCount} ${t.openClarificationsCount === 1 ? "Rückfrage" : "Rückfragen"} am Sachverhalt`,
            ] as [React.ReactNode, React.ReactNode]]
          : []),
      ]}
    />
  );
}

/** Rank 5/13 — the axis exists since `cc141f7b`; before that this was a tick. */
function MatchStage({ stage }: { stage: string | null }) {
  // `bankMatchStage` turns NULL into `not_run`; the axis carries the word
  // since `c1e8e752` (L-218). Two files wrote it by hand before that.
  return <StatusBadge axis="bank_match_stage" status={bankMatchStage(stage)} />;
}
