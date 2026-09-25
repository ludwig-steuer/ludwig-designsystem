"use client";

import { Fragment, useState, type ReactNode } from "react";

import { formatAmount, formatCount, formatTime, formatTimeRange } from "@/ui/v3/format";
import { ActionIcon } from "@/ui/v3/Icons";
import { StateIcon, stateLabel, type StateKind } from "@/ui/v3/patterns/Review";
import { AmountInput } from "@/ui/v3/primitives/AmountInput";
import { Banner, type BannerTone } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { AmountCell, CountCell, ValueHint, type CellHint, type CellTone } from "@/ui/v3/primitives/Cells";
import { DateField } from "@/ui/v3/primitives/DateField";
import { Dialog } from "@/ui/v3/primitives/Dialog";
import { ExpandableRow } from "@/ui/v3/primitives/ExpandableRow";
import { Checkbox, Field, Input, Select } from "@/ui/v3/primitives/Form";
import { IconButton } from "@/ui/v3/primitives/IconButton";
import { Popover, Tooltip } from "@/ui/v3/primitives/Popover";
import { Card, CardHead, HeadRow, Row, Table } from "@/ui/v3/primitives/Table";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import { useHash } from "../hash";
import { cents, comparable, cutOff, movementComparable, releasedDifferenceNew, type Side } from "./calc";
import { TODAY } from "./fixtures";
import type {
  BankBalanceComparison,
  DormantAccount,
  FindingLevel,
  ManualAmount,
  ManualBalanceSource,
  ReconciliationVerdict,
  SourcedAmount,
} from "./types";

/**
 * Step 4 of the batch review, card „Bankkonten" (0202, F298). A page
 * composition for the stories, not a building block: the verdict on top,
 * one expandable row per account with the matrix source × (old · movement ·
 * new), the explanation of the difference, and the form for a balance of
 * one's own.
 */

type Mode = "released" | "withProposals";

/** Step of the scale (A7) per verdict, and the order the rows stand in. */
const VERDICT: Record<ReconciliationVerdict, { state: StateKind; banner: BannerTone; tone: CellTone; rank: number }> = {
  differs: { state: "error", banner: "danger", tone: "danger", rank: 0 },
  fits_with_proposals: { state: "warning", banner: "warning", tone: "warning", rank: 1 },
  explained: { state: "warning", banner: "warning", tone: "warning", rank: 1 },
  not_checkable: { state: "info", banner: "info", tone: "neutral", rank: 2 },
  fits: { state: "done", banner: "success", tone: "neutral", rank: 3 },
  optional: { state: "info", banner: "info", tone: "neutral", rank: 4 },
};

const LEVEL_STATE: Record<FindingLevel | "done", StateKind> = {
  error: "error",
  warning: "warning",
  notice: "info",
  done: "done",
};

// ponytail: a local word list for a column the app does not have yet (F298 §8,
// `source`); it moves to the registry with the follow-up spec.
const MANUAL_SOURCE: Record<ManualBalanceSource, string> = {
  paper_statement: "Papierauszug",
  online_banking: "Online-Banking",
  bank_confirmation: "Bankbestätigung",
  other: "Sonstiges",
};

const CURRENT_USER = "M. Muster";

const day = (iso: string) => formatTime(iso, "date");

/** „1800 · Musterbank Giro" → the number in mono, the name as text. */
function AccountLabel({ label }: { label: string }) {
  const [number, ...rest] = label.split(" · ");
  return (
    <span>
      <span className="v2mono">{number}</span>
      {rest.length ? ` · ${rest.join(" · ")}` : null}
    </span>
  );
}

function Verdict({ state, title, children }: { state: StateKind; title?: string; children: ReactNode }) {
  return (
    <span style={{ display: "flex", gap: "var(--space-2)", alignItems: "baseline" }}>
      <span style={{ alignSelf: "center", display: "inline-flex" }}>
        <StateIcon state={state} title={title} />
      </span>
      <span>{children}</span>
    </span>
  );
}

/* ── Banner ─────────────────────────────────────────────────────────── */

const GROUP_PHRASE: [ReconciliationVerdict, string, string][] = [
  ["differs", "weicht ab", "weichen ab"],
  ["fits_with_proposals", "passt erst mit Vorschlägen", "passen erst mit Vorschlägen"],
  ["explained", "weicht ab, erklärt", "weichen ab, erklärt"],
  ["not_checkable", "ist nicht prüfbar", "sind nicht prüfbar"],
];

function accountNumber(c: BankBalanceComparison) {
  return c.label.split(" · ")[0];
}

/** Worst step wins, one sentence counts (E6). */
export function summarize(
  accounts: readonly BankBalanceComparison[],
  dormant: readonly DormantAccount[],
  mode: Mode,
): { tone: BannerTone; text: string } {
  const checked = accounts.filter((c) => c.verdict[mode] !== "optional");
  const fits = checked.filter((c) => c.verdict[mode] === "fits").length;
  const parts: string[] = [];
  if (checked.length === 0) parts.push("Keine Bankkonten zu prüfen");
  else if (fits === checked.length)
    parts.push(checked.length === 1 ? "Das Bankkonto passt" : `Alle ${checked.length} Bankkonten passen`);
  // With none fitting, the groups below say everything — „0 von 1" says nothing.
  else if (fits) parts.push(`${fits} von ${checked.length} Bankkonten ${fits === 1 ? "passt" : "passen"}`);
  for (const [verdict, one, many] of GROUP_PHRASE) {
    const group = checked.filter((c) => c.verdict[mode] === verdict);
    if (group.length)
      parts.push(`${group.length} ${group.length === 1 ? one : many} (${group.map(accountNumber).join(", ")})`);
  }
  const optional = accounts.length - checked.length;
  if (optional) parts.push(`${optional} ${optional === 1 ? "Konto wird" : "Konten werden"} nicht monatlich geprüft`);
  if (dormant.length) parts.push(formatCount(dormant.length, ["ruhendes Konto", "ruhende Konten"]));

  const worst = Math.min(4, ...checked.map((c) => VERDICT[c.verdict[mode]].rank));
  const tone = checked.length === 0 ? "info" : (Object.values(VERDICT).find((v) => v.rank === worst)?.banner ?? "info");
  return { tone, text: `${parts.join(" · ")}.` };
}

/* ── Matrix: sources side by side, time downward ────────────────────── */
/* Owner 2026-09-25: before the period on top, period end below — a short history per source; the
   difference is its own column; every figure is a figure only, the source in
   the tooltip; exactly one line under each. */

const BLANK = " ";

/** The balance holds for another day than the row's cut-off — it has to show (J4). */
function dateHint(c: BankBalanceComparison, side: Side, value: SourcedAmount, coveredFrom: string | null = null): CellHint | undefined {
  const expected = cutOff(c, side);
  if (value.asOf === expected) return undefined;
  return comparable(c, side, value, coveredFrom)
    ? {
        level: "info",
        text: `Stand vom ${day(value.asOf)} — der Auszug beginnt am ${day(coveredFrom ?? value.asOf)}, dazwischen gab es keine Umsätze.`,
      }
    : { level: "warning", text: `Stand vom ${day(value.asOf)}, nicht vom ${day(expected)} — kein Vergleich möglich.` };
}

function sourceTip(value: SourcedAmount, extra?: string): string {
  return [value.sourceLabel, value.sourceDetail, `Stand ${day(value.asOf)}`, extra].filter(Boolean).join(" · ");
}

function proposalTip(count: number): string | undefined {
  return count ? `enthält ${formatCount(count, ["Buchungsvorschlag", "Buchungsvorschläge"])}, noch nicht freigegeben` : undefined;
}

type ValTone = "proposed" | "warning" | "danger";

/**
 * The bookings or transactions of the account in the period open in a drawer
 * (owner 2026-09-25). The drawer is the app's — list, filter, row drawer
 * (a4) — so the story only writes where it would open.
 */
function drawerHref(c: BankBalanceComparison, list: "bookings" | "transactions"): string {
  return `#drawer=${list}&account=${c.paymentAccountId}&from=${c.period.from}&to=${c.period.to}`;
}

/** A figure with its source behind it: dashed underline, the source in the tooltip. */
function Val({
  amount,
  tip,
  href,
  hint,
  tone,
}: {
  amount: number;
  tip: string;
  href?: string | null;
  hint?: CellHint;
  tone?: ValTone;
}) {
  const cls = `v3bbr__val${tone ? ` v3bbr__val--${tone}` : ""}`;
  const text = formatAmount(amount, "EUR");
  return (
    <>
      {hint ? <ValueHint hint={hint} /> : null}
      <Tooltip label={tip}>
        {href ? (
          <a className={cls} href={href}>
            {text}
          </a>
        ) : (
          <span className={cls} tabIndex={0}>
            {text}
          </span>
        )}
      </Tooltip>
    </>
  );
}

function Sub({ children }: { children?: ReactNode }) {
  return <span className="v3bbr__sub">{children || BLANK}</span>;
}

function Empty({ why }: { why?: string }) {
  return (
    <>
      <span className="v2muted">—</span>
      <Sub>{why}</Sub>
    </>
  );
}

type Line = "old" | "movement" | "new";

const ROWS: { key: Line; label: string }[] = [
  { key: "old", label: "Vor Periode" },
  { key: "movement", label: "Bewegung" },
  { key: "new", label: "Periodenende" },
];

function rowDate(c: BankBalanceComparison, row: Line): string {
  if (row === "old") return day(c.period.from);
  if (row === "new") return day(c.period.to);
  return formatTimeRange(c.period.from, c.period.to);
}

function Matrix({
  c,
  mode,
  manual,
  onEdit,
}: {
  c: BankBalanceComparison;
  mode: Mode;
  manual: BankBalanceComparison["manual"];
  onEdit: (side: Side) => void;
}) {
  const t = c.ledger[mode];
  const { statement } = c;
  const verdictTone = VERDICT[c.verdict[mode]].tone;
  const rowTone: "warning" | "danger" = verdictTone === "danger" ? "danger" : "warning";
  const cashLike = c.kind === "cash" || c.kind === "money_transit";
  const hasStatement = !cashLike && (statement.movement !== null || statement.old !== null || statement.new !== null);
  const hasManual = manual.old !== null || manual.new !== null;
  const withoutBalances = statement.movement !== null ? "Datei ohne Salden" : "kein Auszug";
  const moveOk = movementComparable(c);
  const explains = c.explanation.length > 0 && c.remainder !== null;

  // How many proposals stand in a ledger figure — only with the switch on.
  const earlier = c.proposalsOutsidePeriod.filter((p) => p.bookingDate < c.period.from).length;
  const proposals: Record<Line, number> =
    mode === "withProposals"
      ? { old: earlier, movement: c.coverage.proposedOnly, new: earlier + c.coverage.proposedOnly }
      : { old: 0, movement: 0, new: 0 };

  const ledgerCell = (row: Line) => {
    const n = proposals[row];
    const tone = n ? "proposed" : undefined;
    if (row === "movement")
      return (
        <>
          <Val
            amount={t.movement}
            tone={tone}
            tip={[`Summe der Buchungen ${rowDate(c, row)}`, proposalTip(n)].filter(Boolean).join(" · ")}
          />
          <Sub>
            <TextButton href={drawerHref(c, "bookings")}>
              {formatCount(t.movementCount, ["Buchung", "Buchungen"])}
              {n ? `, davon ${formatCount(n)} Vorschläge` : ""}
            </TextButton>
          </Sub>
        </>
      );
    const value = t[row];
    return (
      <>
        <Val amount={value.amount} tone={tone} tip={sourceTip(value, proposalTip(n))} />
        <Sub>
          {n
            ? `inkl. ${formatCount(n, ["Vorschlag", "Vorschläge"])}`
            : row === "old" && t.oldParts
              ? `Summe aus ${formatCount(t.oldParts.length)} Teilen`
              : value.sourceLabel}
        </Sub>
      </>
    );
  };

  const statementCell = (row: Line) => {
    if (row === "movement") {
      if (!statement.movement) return <Empty why="kein Auszug" />;
      return (
        <>
          <Val
            amount={statement.movement.amount}
            tip={`Summe der Umsätze${statement.coveredFrom ? ` ${formatTimeRange(statement.coveredFrom, statement.coveredTo)}` : ""}`}
            hint={moveOk || !statement.coveredTo ? undefined : { level: "warning", text: `Umsätze nur bis ${day(statement.coveredTo)}.` }}
          />
          <Sub>
            <TextButton href={drawerHref(c, "transactions")}>
              {formatCount(statement.movement.count, ["Umsatz", "Umsätze"])}
            </TextButton>
          </Sub>
        </>
      );
    }
    const value = statement[row];
    if (!value) return <Empty why={withoutBalances} />;
    return (
      <>
        <Val
          amount={value.amount}
          href={value.href}
          tip={sourceTip(value, value.href ? "öffnet den Auszug" : undefined)}
          hint={dateHint(c, row, value, row === "old" ? statement.coveredFrom : null)}
        />
        <Sub>{value.sourceLabel}</Sub>
      </>
    );
  };

  const manualCell = (row: Line) => {
    if (row === "movement") return <Sub />;
    const value = manual[row];
    if (!value) return <Empty why="keine Angabe" />;
    return (
      <>
        <Val amount={value.amount} tip={sourceTip(value, value.note ?? undefined)} hint={dateHint(c, row, value)} />
        <IconButton
          className="v3bbr__edit"
          size="sm"
          label="Kontostand bearbeiten"
          icon={<ActionIcon action="edit" size={14} />}
          onClick={() => onEdit(row)}
        />
        <Sub>{value.sourceLabel}</Sub>
      </>
    );
  };

  /** Ledger minus the other source; `null` with the reason when they cannot stand side by side. */
  const difference = (against: "statement" | "manual", row: Line): { value: number | null; why: string } => {
    if (row === "movement") {
      if (against === "manual") return { value: null, why: "" };
      if (!statement.movement) return { value: null, why: "kein Auszug" };
      if (!moveOk) return { value: null, why: "Auszug unvollständig" };
      return { value: cents(t.movement - statement.movement.amount), why: "" };
    }
    const value = against === "statement" ? statement[row] : manual[row];
    if (!value) return { value: null, why: against === "statement" ? withoutBalances : "keine Angabe" };
    if (!comparable(c, row, value, against === "statement" && row === "old" ? statement.coveredFrom : null))
      return { value: null, why: "anderer Stichtag" };
    return { value: cents(t[row].amount - value.amount), why: "" };
  };

  const diffCell = (against: "statement" | "manual", row: Line) => {
    const { value, why } = difference(against, row);
    if (value === null) return row === "movement" && against === "manual" ? <Sub /> : <Empty why={why} />;
    if (value === 0)
      return (
        <>
          <span className="v3bbr__val" style={{ textDecoration: "none", cursor: "default" }}>
            <StateIcon state="done" title="stimmt" />
            {formatAmount(0, "EUR")}
          </span>
          <Sub>stimmt</Sub>
        </>
      );
    const shown = (
      <>
        <span className={`v3bbr__val v3bbr__val--${rowTone}`}>
          <StateIcon state={rowTone === "danger" ? "error" : "warning"} title="weicht ab" />
          {formatAmount(value, "EUR")}
        </span>
        <Sub>{explains ? "weicht ab · Erklärung" : "weicht ab"}</Sub>
      </>
    );
    if (!explains) return shown;
    // The explanation hangs at the figure it explains (owner 2026-09-25) —
    // not under the table, where it is hard to see what it belongs to.
    return (
      <Popover
        align="end"
        trigger={
          <button type="button" className="v3bbr__explain" aria-label={`Differenz ${formatAmount(value, "EUR")} — Erklärung öffnen`}>
            {shown}
          </button>
        }
      >
        <Explanation c={c} mode={mode} />
      </Popover>
    );
  };

  const sources: { key: string; head: string; cell: (row: Line) => ReactNode }[] = [
    { key: "ledger", head: mode === "withProposals" ? "Buchungen inkl. Vorschläge" : "Buchungen", cell: ledgerCell },
    ...(hasStatement ? [{ key: "statement", head: "Kontoauszug", cell: statementCell }] : []),
    ...(hasManual ? [{ key: "manual", head: "Eigene Angabe", cell: manualCell }] : []),
  ];
  const diffs: { key: "statement" | "manual"; head: string }[] = [
    ...(hasStatement ? [{ key: "statement" as const, head: "Differenz zum Auszug" }] : []),
    ...(hasManual ? [{ key: "manual" as const, head: "Differenz zur eigenen Angabe" }] : []),
  ];
  const tinted = (row: Line) => diffs.some((d) => (difference(d.key, row).value ?? 0) !== 0);

  return (
    <table className="v3bbr">
      <thead>
        <tr>
          <th scope="col">Zeitpunkt</th>
          {sources.map((s) => (
            <th scope="col" key={s.key}>
              {s.head}
            </th>
          ))}
          {diffs.map((d) => (
            <th scope="col" key={d.key} className="v3bbr__diff">
              {d.head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map(({ key, label }) => (
          <Fragment key={key}>
            <tr className={tinted(key) ? `v3bbr__row--${rowTone}` : undefined}>
              <th scope="row">
                {label}
                <Sub>{rowDate(c, key)}</Sub>
              </th>
              {sources.map((s) => (
                <td key={s.key}>{s.cell(key)}</td>
              ))}
              {diffs.map((d) => (
                <td key={d.key} className="v3bbr__diff">
                  {diffCell(d.key, key)}
                </td>
              ))}
            </tr>
            {/* Owner 2026-09-25: other batches in the old balance get a line of their own. */}
            {key === "old"
              ? t.oldParts?.map((part) => (
                  <tr key={part.label}>
                    <th scope="row" className="v3bbr__part">
                      davon {part.label}
                      <Sub>{part.detail}</Sub>
                    </th>
                    {sources.map((s) => (
                      <td key={s.key}>
                        {s.key === "ledger" ? (
                          <>
                            <Val
                              amount={part.amount}
                              tone={part.label.startsWith("Vorschlag") ? "proposed" : undefined}
                              tip={[part.label, part.detail].filter(Boolean).join(" · ")}
                            />
                            <Sub />
                          </>
                        ) : (
                          <Sub />
                        )}
                      </td>
                    ))}
                    {diffs.map((d) => (
                      <td key={d.key} className="v3bbr__diff">
                        <Sub />
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

/* ── Explanation, in the popover at the difference ──────────────────── */

const EXPLAIN_COLS = "20px minmax(240px, 1fr) minmax(180px, auto) 130px";

function Explanation({ c, mode }: { c: BankBalanceComparison; mode: Mode }) {
  const difference = releasedDifferenceNew(c);
  const rest = c.explanation.find((line) => line.key === "remainder");
  const against = c.statement.new && comparable(c, "new", c.statement.new) ? "Auszug" : "eigene Angabe";

  return (
    <div className="v3bbr-explain">
      <div className="lw-overline">Wie sich die Differenz erklärt</div>
      <Table cols={EXPLAIN_COLS} density="compact">
        <HeadRow>
          <span />
          <span>Posten</span>
          <span>Nächster Schritt</span>
          <span className="v2num">Beitrag</span>
        </HeadRow>
        <Row>
          <span />
          <span>
            <strong>Differenz Periodenende</strong>
            <div className="v2sub">
              freigegebene Buchungen − {against} {day(c.period.to)}
              {mode === "withProposals" ? " · gerechnet ohne Vorschläge" : ""}
            </div>
          </span>
          <span />
          <AmountCell value={difference} />
        </Row>
        {c.explanation
          .filter((line) => line.key !== "remainder")
          .map((line) => (
            <Row key={line.key}>
              <StateIcon state={LEVEL_STATE[line.level]} />
              <span>
                {line.text}.
                {line.amount === null ? <div className="v2sub">nicht Teil der Rechnung</div> : null}
              </span>
              {line.action ? <TextButton href={line.action.href}>{line.action.label}</TextButton> : <span />}
              <AmountCell value={line.amount} />
            </Row>
          ))}
        <Row>
          <StateIcon state={c.remainder === 0 ? "done" : "error"} />
          <span>
            <strong>Rest</strong>
            <div>{rest ? `${rest.text}.` : "Vollständig erklärt."}</div>
          </span>
          {rest?.action ? <TextButton href={rest.action.href}>{rest.action.label}</TextButton> : <span />}
          <AmountCell value={c.remainder} tone={c.remainder === 0 ? "neutral" : "danger"} />
        </Row>
      </Table>
    </div>
  );
}

/** Notes without a calculation (no statement, statement ends early): one line each, under the table. */
function Notes({ c }: { c: BankBalanceComparison }) {
  if (c.remainder !== null || !c.explanation.length) return null;
  return (
    <div className="v2stack" style={{ gap: "var(--space-1)" }}>
      {c.explanation.map((line) => (
        <Verdict key={line.key} state={LEVEL_STATE[line.level]}>
          {line.text}.{" "}
          {line.action ? <TextButton href={line.action.href}>{line.action.label}</TextButton> : null}
        </Verdict>
      ))}
    </div>
  );
}

/* ── Dialog: a balance of one's own (J6, a6/a7) ─────────────────────── */
/* Owner 2026-09-25: its own button, a dialog to enter it, then a pencil to
   change it — the column „Eigene Angabe" only exists once there is one. */

export interface FormStart {
  accountId: string;
  side: Side;
  amount?: number | null;
  date?: string;
  /** Opens as if „Speichern" had been pressed — the error state of S14. */
  submitted?: boolean;
}

interface Draft {
  side: Side;
  amount: number | null;
  date: string | null;
  source: ManualBalanceSource;
  note: string;
}

function check(draft: Draft): { amount?: string; date?: string; banner?: string } {
  const errors: { amount?: string; date?: string; banner?: string } = {};
  if (draft.amount === null) errors.amount = "Betrag fehlt — tragen Sie den Stand laut Quelle ein.";
  if (!draft.date) errors.date = "Stichtag fehlt.";
  else if (draft.date > TODAY)
    errors.banner = `Der Stichtag ${day(draft.date)} liegt in der Zukunft. Wählen Sie einen Tag bis heute (${day(TODAY)}).`;
  return errors;
}

function BalanceDialog({
  c,
  start,
  manual,
  onSave,
  onClose,
}: {
  c: BankBalanceComparison;
  start: FormStart;
  manual: BankBalanceComparison["manual"];
  onSave: (side: Side, value: ManualAmount) => void;
  onClose: () => void;
}) {
  const fill = (side: Side, from?: Partial<Draft>): Draft => {
    const existing = manual[side];
    return {
      side,
      amount: existing?.amount ?? null,
      date: existing?.asOf ?? cutOff(c, side),
      source: existing?.source ?? "paper_statement",
      note: existing?.note ?? "",
      ...from,
    };
  };
  const [draft, setDraft] = useState<Draft>(() =>
    fill(start.side, {
      ...(start.amount !== undefined ? { amount: start.amount } : {}),
      ...(start.date ? { date: start.date } : {}),
    }),
  );
  const [errors, setErrors] = useState(() => (start.submitted ? check(draft) : {}));
  const id = `${c.paymentAccountId}-balance`;
  const ledger = c.ledger.released[draft.side];

  const save = (next: Draft) => {
    const found = check(next);
    setErrors(found);
    if (Object.keys(found).length || next.amount === null || !next.date) return;
    onSave(next.side, {
      amount: next.amount,
      asOf: next.date,
      sourceLabel: MANUAL_SOURCE[next.source],
      sourceDetail: `${CURRENT_USER}, ${day(TODAY)}`,
      href: null,
      source: next.source,
      by: CURRENT_USER,
      at: new Date().toISOString(),
      note: next.note || null,
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      onConfirm={() => save(draft)}
      title="Kontostand hinterlegen"
      kicker={c.label}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button variant="primary" size="sm" onClick={() => save(draft)}>
            Kontostand speichern
          </Button>
        </>
      }
    >
      <div className="v2stack">
        {errors.banner ? (
          <Banner tone="danger" title="Nicht gespeichert">
            {errors.banner}
          </Banner>
        ) : null}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-3)" }}>
          <Field label="Zeitpunkt" htmlFor={`${id}-side`}>
            <Select
              id={`${id}-side`}
              value={draft.side}
              onChange={(e) => setDraft(fill(e.target.value as Side))}
            >
              <option value="old">Vor Periode · {day(c.period.from)}</option>
              <option value="new">Periodenende · {day(c.period.to)}</option>
            </Select>
          </Field>
          <div>
            <AmountInput
              label="Kontostand"
              value={draft.amount}
              onChange={(amount) => setDraft({ ...draft, amount })}
              allowNegative
              error={errors.amount}
            />
            {/* The brief's „Stimmt": fills in, does not save — the person still presses „Speichern". */}
            <TextButton onClick={() => setDraft({ ...draft, amount: ledger.amount, date: cutOff(c, draft.side) })}>
              Stand der Buchungen einsetzen ({formatAmount(ledger.amount, "EUR")})
            </TextButton>
          </div>
          <Field
            label="Stichtag"
            htmlFor={`${id}-date`}
            error={errors.date}
            hint={draft.side === "old" ? `Tagesende ${day(cutOff(c, "old"))} = Stand zu Beginn des ${day(c.period.from)}` : undefined}
          >
            <DateField
              id={`${id}-date`}
              value={draft.date}
              onChange={(date) => setDraft({ ...draft, date })}
              invalid={Boolean(errors.date || errors.banner)}
            />
          </Field>
          <Field label="Quelle" htmlFor={`${id}-source`}>
            <Select
              id={`${id}-source`}
              value={draft.source}
              onChange={(e) => setDraft({ ...draft, source: e.target.value as ManualBalanceSource })}
            >
              {Object.entries(MANUAL_SOURCE).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notiz" htmlFor={`${id}-note`} hint="z. B. Auszugsnummer">
          <Input id={`${id}-note`} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
        </Field>
      </div>
    </Dialog>
  );
}

/* ── Account row ────────────────────────────────────────────────────── */

function coverageLine(c: BankBalanceComparison): string {
  const { coverage: k } = c;
  const span = formatTimeRange(c.period.from, c.period.to);
  const parts = [
    k.transactionCount ? `${formatCount(k.transactionCount, ["Umsatz", "Umsätze"])} ${span}` : `Keine Umsätze ${span}`,
  ];
  if (k.booked) parts.push(`${formatCount(k.booked)} gebucht`);
  if (k.proposedOnly) parts.push(`${formatCount(k.proposedOnly)} nur vorgeschlagen`);
  if (k.noProposal) parts.push(`${formatCount(k.noProposal)} ohne Vorschlag`);
  if (k.noCase) parts.push(`${formatCount(k.noCase)} ohne Sachverhalt`);
  if (k.bookingsWithoutTransactionCount)
    parts.push(formatCount(k.bookingsWithoutTransactionCount, ["Buchung ohne Umsatz", "Buchungen ohne Umsatz"]));
  return parts.join(" · ");
}

function AccountRow({
  c,
  mode,
  formStart,
  open,
}: {
  c: BankBalanceComparison;
  mode: Mode;
  formStart: FormStart | null;
  open: boolean;
}) {
  const verdict = c.verdict[mode];
  const [manual, setManual] = useState(c.manual);
  const [dialog, setDialog] = useState<FormStart | null>(formStart);
  const [saved, setSaved] = useState<string | null>(null);
  const cashLike = c.kind === "cash" || c.kind === "money_transit";
  const openDialog = (side: Side) => {
    setSaved(null);
    setDialog({ accountId: c.paymentAccountId, side });
  };

  return (
    <ExpandableRow
      defaultOpen={open || VERDICT[verdict].rank < 3 || formStart !== null}
      summary={
        <>
          <AccountLabel label={c.label} />
          <Verdict state={VERDICT[verdict].state} title={stateLabel(VERDICT[verdict].state)}>
            {c.headline[mode]}
          </Verdict>
          {/* Cash and transit have no bank transactions — „0" would claim there were none. */}
          <CountCell value={cashLike ? null : c.coverage.transactionCount} />
        </>
      }
    >
      <div className="v2stack">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <span className="v2sub">{cashLike ? `Stand ${formatTimeRange(c.period.from, c.period.to)}` : coverageLine(c)}</span>
          {cashLike ? null : (
            <Button variant="secondary" size="sm" onClick={() => openDialog("new")}>
              Kontostand hinterlegen
            </Button>
          )}
        </div>
        <Matrix c={c} mode={mode} manual={manual} onEdit={openDialog} />
        <Notes c={c} />
        {dialog ? (
          <BalanceDialog
            c={c}
            start={dialog}
            manual={manual}
            onClose={() => setDialog(null)}
            onSave={(side, value) => {
              setManual({ ...manual, [side]: value });
              setDialog(null);
              setSaved(`Kontostand zum ${day(value.asOf)} gespeichert.`);
            }}
          />
        ) : null}
        <p role="status" className="v2sub">
          {saved}
        </p>
      </div>
    </ExpandableRow>
  );
}

function DormantRow({ accounts, span }: { accounts: readonly DormantAccount[]; span: string }) {
  const quiet = accounts.filter((a) => a.wentQuiet);
  return (
    <ExpandableRow
      summary={
        <>
          <span>{formatCount(accounts.length, ["ruhendes Konto", "ruhende Konten"])}</span>
          <Verdict state={quiet.length ? "warning" : "skipped"} title={quiet.length ? "Warnung" : "ruhend"}>
            Keine Umsätze {span}.
            {quiet.length
              ? ` ${quiet.map((a) => a.label).join(", ")} ${quiet.length === 1 ? "hatte" : "hatten"} im Vormonat noch Umsätze — fehlt ein Auszug?`
              : null}
          </Verdict>
          <CountCell value={0} />
        </>
      }
    >
      <Table cols="minmax(320px, 1fr) 180px">
        <HeadRow>
          <span>Konto</span>
          <span>Letzter Umsatz</span>
        </HeadRow>
        {accounts.map((a) => (
          <Row key={a.paymentAccountId}>
            <AccountLabel label={a.label} />
            <span>
              {a.lastTransactionDate ? day(a.lastTransactionDate) : <span className="v2muted">noch nie</span>}
              {a.wentQuiet ? <div className="v2sub">im Vormonat noch aktiv</div> : null}
            </span>
          </Row>
        ))}
      </Table>
    </ExpandableRow>
  );
}

/* ── The card ───────────────────────────────────────────────────────── */

const COLS = "20px minmax(240px, 1.1fr) minmax(360px, 2.6fr) 110px";

export function BankAccountsCard({
  accounts,
  dormant = [],
  withProposals = false,
  form = null,
  openAll = false,
}: {
  accounts: readonly BankBalanceComparison[];
  dormant?: readonly DormantAccount[];
  /** Where the switch starts; it lives in the hash (`with_proposals=1`, a2). */
  withProposals?: boolean;
  form?: FormStart | null;
  /** Every row open — for a story that has to show what a fitting row holds. */
  openAll?: boolean;
}) {
  const { params, go } = useHash(withProposals ? "with_proposals=1" : "", true);
  const mode: Mode = params.get("with_proposals") === "1" ? "withProposals" : "released";
  const summary = summarize(accounts, dormant, mode);
  const sorted = [...accounts].sort((a, b) => VERDICT[a.verdict[mode]].rank - VERDICT[b.verdict[mode]].rank);
  const period = accounts[0]?.period ?? { from: "2026-08-01", to: "2026-08-31" };

  return (
    <div className="v2stack">
      <Banner tone={summary.tone}>{summary.text}</Banner>
      <Card>
        <CardHead
          title="Bankkonten"
          sub={`${formatTimeRange(period.from, period.to)} · Stichtag ${day(period.to)}`}
          actions={
            <>
              <Checkbox
                label="Buchungsvorschläge mitzählen"
                checked={mode === "withProposals"}
                onChange={(e) => go({ with_proposals: e.target.checked ? "1" : null })}
              />
              <TextButton href={`#tab=report&as_of=${period.to}`}>Anderer Stichtag</TextButton>
            </>
          }
        />
        <Table cols={COLS}>
          <HeadRow>
            <span />
            <span>Konto</span>
            <span>Ergebnis</span>
            <span className="v2num">Umsätze</span>
          </HeadRow>
          {sorted.map((c) => (
            <AccountRow
              key={c.paymentAccountId}
              c={c}
              mode={mode}
              formStart={form?.accountId === c.paymentAccountId ? form : null}
              open={openAll}
            />
          ))}
          {dormant.length ? <DormantRow accounts={dormant} span={formatTimeRange(period.from, period.to)} /> : null}
        </Table>
      </Card>
    </div>
  );
}
