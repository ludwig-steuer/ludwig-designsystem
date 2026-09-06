import { resolveEventBookingState } from "./derive";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { FieldList } from "../../primitives/FieldList";
import { MonoCell } from "../../primitives/Cells";
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
            [
              "Rohdaten",
              // As `RawRecord`, not as field rows: the column comment calls
              // them „for audit and debugging", and that is a different kind
              // of reading than a fact.
              <RawRecord key="r" record={t.rawPayload} />,
            ],
          ]}
        />
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
          ["Sachverhalt", "Diese Zahlung ist noch keinem Sachverhalt zugeordnet."],
          ["DATEV-Historie", <MatchStage key="m" stage={t.matchStage} />],
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
          <CaseCell key="c" cases={t.cases} href={caseHref} showState={false} />,
        ],
        // Per case, not once: the booking state belongs to the **event**, and
        // with several cases there are several events. That is the sentence
        // the whole family rests on (decision 3 of the Freigabe).
        ...t.cases.map((c) => {
          const state = resolveEventBookingState({
            proposalStatus: c.eventBookingState,
            noBookingRequiredReason: c.noBookingRequiredReason,
          });
          return [
            `Buchung ${c.caseNumber ?? c.caseId.slice(0, 8)}`,
            <StatusBadge key={c.caseId} axis="ereignis" status={state.value} />,
          ] as [React.ReactNode, React.ReactNode];
        }),
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
  return stage ? (
    <StatusBadge axis="bank_match_stage" status={stage} />
  ) : (
    <span className="v2muted">Kaskade nicht gelaufen</span>
  );
}
