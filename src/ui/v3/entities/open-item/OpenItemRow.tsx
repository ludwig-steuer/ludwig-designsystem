import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { ClickRow } from "../../primitives/ExpandableRow";
import { GroupRow, Row } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import {
  OPEN_ITEM_AGE_LABEL,
  type OpenItem,
  type OpenItemAgeGroupVM,
} from "./open-item";
import { formatAmount, formatTime } from "../../format";
import type { Currency } from "@/ludwig/shared/money";

/**
 * What is open on the reference date — and **how long already** (0029).
 *
 * The page renders this table itself today, with local formatters and a local
 * label map for the kind; the age grouping that makes the view useful does not
 * exist at all. Whoever wants to know what is more than 90 days overdue counts
 * by hand.
 *
 * „Open" is always a statement **about a date**. That is why `asOf` is
 * required — it names the reference date in the settlement column, where the
 * badge carries it in its `title`: an item that is settled today can have
 * been open on the reference date, and the row must not collapse the two.
 * (It does **not** appear in a group heading or an empty state: the row has
 * no empty state, and the group heading carries count and sum. The comment
 * claimed all three until the acceptance of 2026-09-07 measured them.)
 */

const KIND_AXIS = "konto_typ" as const;

interface OpenItemRowCommon {
  item: OpenItem;
  currency?: Currency;
  /** The reference date — „open" is never true in the abstract. */
  asOf: string;
}

/**
 * The two ways out of the row, and they exclude each other in the type.
 *
 * **`href` is the normal one.** The target is the personal account, and that
 * is a URL — so the row gets an anchor, and with it the middle click, „open in
 * new tab" and the status bar (`Row` §instead: „Click without a URL →
 * ClickRow"). The row offered only `onOpen` until 2026-09-08, which forced the
 * app into a client wrapper with `router.push` and cost exactly those three.
 *
 * `onOpen` stays for the caller who really has no URL — a selection inside a
 * dialog, the duplicate check.
 *
 * **Not** to the case in either form: an open item carries no case id, and the
 * app's view model has none either.
 */
type OpenItemRowWays =
  | { href?: (personalAccount: string) => string; onOpen?: never }
  | { onOpen?: (personalAccount: string) => void; href?: never };

/**
 * @when    One line of the DATEV open-item list, on the OPOS page or in the
 *          duplicate check.
 * @instead The age class as a heading over a group → OpenItemAgeGroup. A case
 *          behind the item → CaseCell.
 */
export function OpenItemRow({
  item,
  currency = "EUR",
  asOf,
  ...ways
}: OpenItemRowCommon & OpenItemRowWays) {
  // `Cells(...)` **as a function**, not as `<Cells />`: a component element is
  // one child to React, and `Row` would wrap it in a single `<td>` — the whole
  // row would collapse into one cell. Measured exactly that before this line
  // was changed (0106 wraps cells, and it cannot look inside a component).
  const parts = Cells({ item, currency, asOf });
  if (ways.href) return <Row href={ways.href(item.personalAccount)}>{parts}</Row>;
  const onOpen = ways.onOpen;
  return onOpen ? (
    <ClickRow
      onClick={() => onOpen(item.personalAccount)}
      label={`Personenkonto ${item.personalAccount} öffnen`}
    >
      {parts}
    </ClickRow>
  ) : (
    <Row>{parts}</Row>
  );
}

function Cells({
  item,
  currency,
  asOf,
}: {
  item: OpenItem;
  currency: Currency;
  asOf: string;
}) {
  return (
    <>
      {/* Kreditor / Debitor over the registry, not over a local map — the
          axis `konto_typ` already carries both words (R1). */}
      <span>{resolveStatus(KIND_AXIS, item.kind).label}</span>
      <MonoCell value={item.personalAccount} />
      {/* Document number 1 holds up to 36 characters (DATEV), the fixtures
          reach 12 — the track was measured against them (M2). It truncates
          like every other cell whose length nobody bounds. */}
      <span className="v2trunc">
        <MonoCell value={item.externalDocumentNumber} title={item.externalDocumentNumber ?? undefined} />
      </span>
      <Time value={item.invoiceDate} format="date" length="short" size="sm" />
      <Time value={item.dueDate} format="date" length="short" size="sm" />
      <span className="v2trunc" title={item.description ?? undefined}>
        {item.description ?? <span className="v2muted">—</span>}
      </span>
      <span>
        {/* The dunning level as a **word**, and only above zero. `null` (an old
            snapshot) and `0` (not dunned yet) look the same here, and that is
            deliberate: the row has no place for the difference, and neither
            reading changes what to do. Whoever needs it reads the snapshot
            (acceptance of 0029, M8 — the comment claimed a distinction the
            cell does not make). */}
        {item.dunningLevel ? `${item.dunningLevel}. Mahnung` : <span className="v2muted">—</span>}
      </span>
      <span>
        {/* The (i) belongs to the column head, not to every row — that is
            what `case-columns`, `source-document-columns` and `DataTable` do
            (acceptance of 0029, M3). Twenty rows would otherwise carry twenty
            buttons to the same legend. */}
        <StatusBadge
          axis="opos_ausgleich"
          status={item.clearedAfterStichtag ? "spaeter_ausgeglichen" : "offen"}
          note={`Stichtag ${formatTime(asOf, "date")}`}
          info={false}
        />
      </span>
      <AmountCell value={item.grossAmount} currency={currency} />
      {/* An approximated amount says so with „≈" and gives the reason in the
          title — a number that pretends to be exact is worse than none. */}
      <span className="v2num">
        {item.amountApprox && item.openAtStichtag !== null ? (
          <span
            className="v2amount"
            title="Genähert: Alt-Snapshot mit Teilzahlung oder Sammel-OP."
          >
            ≈ {formatAmount(item.openAtStichtag, currency)}
          </span>
        ) : (
          <AmountCell value={item.openAtStichtag} currency={currency} />
        )}
      </span>
    </>
  );
}

/**
 * The age class as a heading over its items — count **and** sum, because a
 * class without its sum answers „how many" and not „how much".
 *
 * @when    Grouped open items: one heading per class above its rows.
 * @instead One item → OpenItemRow.
 */
export function OpenItemAgeGroup({
  group,
  currency = "EUR",
}: {
  group: OpenItemAgeGroupVM;
  currency?: Currency;
}) {
  return (
    <GroupRow>
      <span className="v2oi__group">
        {/* The words are the domain's; the reference is this row's. „31–60
            Tage" alone would not say what the number counts — and „überfällig"
            on the class that is not yet due would be wrong. */}
        <span>
          {group.bucket === "notDue"
            ? OPEN_ITEM_AGE_LABEL[group.bucket]
            : `${OPEN_ITEM_AGE_LABEL[group.bucket]} überfällig`}
        </span>
        <span className="v2oi__groupnum">
          {group.count} Posten ·{" "}
          {formatAmount(group.sum, group.currency ?? currency)}
        </span>
      </span>
    </GroupRow>
  );
}
