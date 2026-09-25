"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

import { formatAmount, formatCount, formatTime } from "@/ui/v3/format";
import { StateIcon, stateLabel, type StateKind } from "@/ui/v3/patterns/Review";
import { AmountInput } from "@/ui/v3/primitives/AmountInput";
import { Banner, type BannerTone } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { AmountCell, CountCell, type CellHint, type CellTone } from "@/ui/v3/primitives/Cells";
import { DateField } from "@/ui/v3/primitives/DateField";
import { ExpandableRow } from "@/ui/v3/primitives/ExpandableRow";
import { Checkbox, Field, Input, Select } from "@/ui/v3/primitives/Form";
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

/* ── Matrix ─────────────────────────────────────────────────────────── */

/** The balance holds for another day than the column's cut-off — it has to show (J4). */
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

function Source({ value }: { value: SourcedAmount }) {
  const label = value.href ? (
    <TextButton href={value.href} tone="quiet">
      {value.sourceLabel}
    </TextButton>
  ) : (
    value.sourceLabel
  );
  return (
    <div className="v2sub">
      {label}
      {value.sourceDetail ? <div>{value.sourceDetail}</div> : null}
    </div>
  );
}

function Figure({ value, hint }: { value: SourcedAmount; hint?: CellHint }) {
  return (
    <div className="v2num">
      <AmountCell value={value.amount} hint={hint} />
      <Source value={value} />
    </div>
  );
}

function Missing({ why, children }: { why: string; children?: ReactNode }) {
  return (
    <div className="v2num">
      {children ?? <span className="v2muted">—</span>}
      <div className="v2sub">{why}</div>
    </div>
  );
}

function Difference({ value, tone, why }: { value: number | null; tone: CellTone; why?: string }) {
  if (value === null) return <Missing why={why ?? "kein Vergleich"} />;
  const ok = value === 0;
  return (
    <div className="v2num">
      <span style={{ display: "inline-flex", gap: "var(--space-2)", alignItems: "center" }}>
        <StateIcon state={ok ? "done" : VERDICT_STATE_BY_TONE[tone]} title={ok ? "stimmt" : "weicht ab"} />
        <AmountCell value={value} tone={ok ? "neutral" : tone} />
      </span>
      <div className="v2sub">{ok ? "stimmt" : "weicht ab"}</div>
    </div>
  );
}

const VERDICT_STATE_BY_TONE: Record<CellTone, StateKind> = {
  neutral: "info",
  muted: "info",
  success: "done",
  warning: "warning",
  "warning-strong": "warning",
  danger: "error",
};

const MATRIX_COLS = "minmax(190px, 1.1fr) repeat(3, minmax(170px, 1fr))";

function Matrix({
  c,
  mode,
  manual,
  onRecord,
}: {
  c: BankBalanceComparison;
  mode: Mode;
  manual: BankBalanceComparison["manual"];
  onRecord: (side: Side) => void;
}) {
  const t = c.ledger[mode];
  const { statement } = c;
  const tone = VERDICT[c.verdict[mode]].tone;
  const hasStatement = statement.movement !== null || statement.old !== null || statement.new !== null;
  const withoutBalances = statement.movement !== null ? "Datei ohne Salden" : "kein Auszug";
  const cashLike = c.kind === "cash" || c.kind === "money_transit";

  const statementDiff = (side: Side): number | null => {
    const value = statement[side];
    if (!value || !comparable(c, side, value, statement.coveredFrom)) return null;
    return cents(t[side].amount - value.amount);
  };
  const manualDiff = (side: Side): number | null => {
    const value = manual[side];
    if (!value || !comparable(c, side, value)) return null;
    return cents(t[side].amount - value.amount);
  };
  const moveOk = movementComparable(c);

  const ownCell = (side: Side) => {
    const value = manual[side];
    if (!value)
      return (
        <div className="v2num">
          <TextButton onClick={() => onRecord(side)}>Kontostand hinterlegen</TextButton>
        </div>
      );
    return (
      <div className="v2num">
        {/* a7: the amount itself opens the same form, filled in. */}
        <TextButton onClick={() => onRecord(side)} aria-label={`Kontostand ${formatAmount(value.amount, "EUR")} ändern`}>
          <AmountCell value={value.amount} hint={dateHint(c, side, value)} />
        </TextButton>
        <Source value={value} />
      </div>
    );
  };

  return (
    <Table cols={MATRIX_COLS}>
      <HeadRow>
        <span>Quelle</span>
        <span className="v2num">Alt {day(cutOff(c, "old"))}</span>
        <span className="v2num">Bewegung {formatTime(c.period.from, "month")}</span>
        <span className="v2num">Neu {day(cutOff(c, "new"))}</span>
      </HeadRow>

      <Row>
        <span>{mode === "withProposals" ? "Buchungen inkl. Vorschläge" : "Buchungen"}</span>
        <Figure value={t.old} />
        <div className="v2num">
          <AmountCell value={t.movement} />
          <div className="v2sub">{formatCount(t.movementCount, ["Buchung", "Buchungen"])}</div>
        </div>
        <Figure value={t.new} />
      </Row>

      {cashLike ? null : (
        <>
          <Row>
            <span>Kontoauszug</span>
            {statement.old ? (
              <Figure value={statement.old} hint={dateHint(c, "old", statement.old, statement.coveredFrom)} />
            ) : (
              <Missing why={withoutBalances} />
            )}
            {statement.movement ? (
              <div className="v2num">
                <AmountCell
                  value={statement.movement.amount}
                  hint={
                    moveOk || !statement.coveredTo
                      ? undefined
                      : { level: "warning", text: `Umsätze nur bis ${day(statement.coveredTo)}.` }
                  }
                />
                <div className="v2sub">{formatCount(statement.movement.count, ["Umsatz", "Umsätze"])}</div>
              </div>
            ) : (
              <Missing why="kein Auszug" />
            )}
            {statement.new ? (
              <Figure value={statement.new} hint={dateHint(c, "new", statement.new)} />
            ) : (
              <Missing why={withoutBalances} />
            )}
          </Row>

          <Row>
            <span>Eigene Angabe</span>
            {ownCell("old")}
            <span />
            {ownCell("new")}
          </Row>

          {hasStatement ? (
            <Row>
              <strong>Differenz Buchungen − Auszug</strong>
              <Difference value={statementDiff("old")} tone={tone} why={statement.old ? "anderer Stichtag" : withoutBalances} />
              <Difference
                value={moveOk && statement.movement ? cents(t.movement - statement.movement.amount) : null}
                tone={tone}
                why={statement.movement ? "Auszug unvollständig" : "kein Auszug"}
              />
              <Difference value={statementDiff("new")} tone={tone} why={statement.new ? "anderer Stichtag" : withoutBalances} />
            </Row>
          ) : null}
          {manual.old || manual.new ? (
            <Row>
              <strong>Differenz Buchungen − eigene Angabe</strong>
              <Difference value={manualDiff("old")} tone={tone} why={manual.old ? "anderer Stichtag" : "keine Angabe"} />
              <span />
              <Difference value={manualDiff("new")} tone={tone} why={manual.new ? "anderer Stichtag" : "keine Angabe"} />
            </Row>
          ) : null}
        </>
      )}
    </Table>
  );
}

/* ── Explanation ────────────────────────────────────────────────────── */

const EXPLAIN_COLS = "20px minmax(260px, 1fr) minmax(200px, auto) 150px";
// Notes without a calculation carry no amount: the column would stay empty.
const NOTE_COLS = "20px minmax(260px, 1fr) minmax(200px, auto)";

function Explanation({ c, mode }: { c: BankBalanceComparison; mode: Mode }) {
  if (!c.explanation.length) return null;
  const calculation = c.remainder !== null;
  const difference = releasedDifferenceNew(c);
  const rest = c.explanation.find((line) => line.key === "remainder");
  const against = c.statement.new && comparable(c, "new", c.statement.new) ? "Auszug" : "eigene Angabe";

  return (
    <section className="v2stack" style={{ gap: "var(--space-2)" }}>
      <div className="lw-overline">{calculation ? "Wie sich die Differenz erklärt" : "Hinweise"}</div>
      <Table cols={calculation ? EXPLAIN_COLS : NOTE_COLS}>
        <HeadRow>
          <span />
          <span>{calculation ? "Posten" : "Hinweis"}</span>
          <span>Nächster Schritt</span>
          {calculation ? <span className="v2num">Beitrag</span> : null}
        </HeadRow>
        {calculation ? (
          <Row>
            <span />
            <span>
              <strong>Differenz Neu</strong>
              <div className="v2sub">
                freigegebene Buchungen − {against} {day(c.period.to)}
                {mode === "withProposals" ? " · gerechnet ohne Vorschläge" : ""}
              </div>
            </span>
            <span />
            <AmountCell value={difference} />
          </Row>
        ) : null}
        {c.explanation
          .filter((line) => line.key !== "remainder")
          .map((line) => (
            <Row key={line.key}>
              <StateIcon state={LEVEL_STATE[line.level]} />
              <span>
                {line.text}.
                {calculation && line.amount === null ? <div className="v2sub">nicht Teil der Rechnung</div> : null}
              </span>
              {line.action ? <TextButton href={line.action.href}>{line.action.label}</TextButton> : <span />}
              {calculation ? <AmountCell value={line.amount} /> : null}
            </Row>
          ))}
        {calculation ? (
          <Row>
            <StateIcon state={c.remainder === 0 ? "done" : "error"} />
            <span>
              <strong>Rest</strong>
              <div>{rest ? `${rest.text}.` : "Vollständig erklärt."}</div>
            </span>
            {rest?.action ? <TextButton href={rest.action.href}>{rest.action.label}</TextButton> : <span />}
            <AmountCell value={c.remainder} tone={c.remainder === 0 ? "neutral" : "danger"} />
          </Row>
        ) : null}
      </Table>
    </section>
  );
}

/* ── Form: a balance of one's own (J6, a6/a7) ───────────────────────── */

export interface FormStart {
  accountId: string;
  side: Side;
  amount?: number | null;
  date?: string;
  /** Opens as if „Speichern" had been pressed — the error state of S14. */
  submitted?: boolean;
}

interface Draft {
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

function BalanceForm({
  c,
  start,
  existing,
  onSave,
  onCancel,
}: {
  c: BankBalanceComparison;
  start: FormStart;
  existing: ManualAmount | null;
  onSave: (value: ManualAmount) => void;
  onCancel: () => void;
}) {
  const { side } = start;
  const [draft, setDraft] = useState<Draft>({
    amount: start.amount ?? existing?.amount ?? null,
    date: start.date ?? existing?.asOf ?? cutOff(c, side),
    source: existing?.source ?? "paper_statement",
    note: existing?.note ?? "",
  });
  const [errors, setErrors] = useState(() => (start.submitted ? check(draft) : {}));
  const id = `${c.paymentAccountId}-${side}`;
  const formRef = useRef<HTMLFormElement>(null);
  // Focus into the first field, and back to where it came from when the form
  // goes — otherwise a keyboard user starts over at the top of the page.
  useEffect(() => {
    const from = document.activeElement as HTMLElement | null;
    formRef.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      if (from?.isConnected) from.focus();
    };
  }, []);

  const save = (next: Draft) => {
    const found = check(next);
    setErrors(found);
    if (Object.keys(found).length || next.amount === null || !next.date) return;
    const saved = formatTime(TODAY, "date");
    onSave({
      amount: next.amount,
      asOf: next.date,
      sourceLabel: MANUAL_SOURCE[next.source],
      sourceDetail: `${CURRENT_USER}, ${saved}`,
      href: null,
      source: next.source,
      by: CURRENT_USER,
      at: new Date().toISOString(),
      note: next.note || null,
    });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    save(draft);
  };
  const escape = (e: KeyboardEvent) => {
    if (e.key === "Escape") onCancel();
  };
  const ledger = c.ledger.released[side];

  return (
    <form ref={formRef} className="v2stack" onSubmit={submit} onKeyDown={escape} aria-label="Kontostand hinterlegen">
      <div className="lw-overline">
        Kontostand {side === "old" ? "Alt" : "Neu"} zum {day(cutOff(c, side))} hinterlegen
      </div>
      {errors.banner ? (
        <Banner tone="danger" title="Nicht gespeichert">
          {errors.banner}
        </Banner>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "var(--space-3)",
          alignItems: "start",
        }}
      >
        <AmountInput
          label="Kontostand"
          value={draft.amount}
          onChange={(amount) => setDraft({ ...draft, amount })}
          allowNegative
          error={errors.amount}
        />
        <Field label="Stichtag" htmlFor={`${id}-date`} error={errors.date}>
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
        <Field label="Notiz" htmlFor={`${id}-note`} hint="z. B. Auszugsnummer">
          <Input id={`${id}-note`} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
        </Field>
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Button type="submit" variant="primary" size="sm">
          Kontostand speichern
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => save({ ...draft, amount: ledger.amount, date: cutOff(c, side) })}
        >
          Stand der Buchungen übernehmen ({formatAmount(ledger.amount, "EUR")})
        </Button>
        <Button type="button" variant="tertiary" size="sm" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

/* ── Account row ────────────────────────────────────────────────────── */

function coverageLine(c: BankBalanceComparison): string {
  const month = formatTime(c.period.from, "month");
  const { coverage: k } = c;
  const parts = [
    k.transactionCount
      ? `${formatCount(k.transactionCount, ["Umsatz", "Umsätze"])} im ${month}`
      : `Keine Umsätze im ${month}`,
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
  const [form, setForm] = useState<FormStart | null>(formStart);
  const [saved, setSaved] = useState<string | null>(null);

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
          <CountCell value={c.kind === "cash" || c.kind === "money_transit" ? null : c.coverage.transactionCount} />
        </>
      }
    >
      <div className="v2stack">
        <div className="v2sub">{coverageLine(c)}</div>
        <Matrix
          c={c}
          mode={mode}
          manual={manual}
          onRecord={(side) => {
            setSaved(null);
            setForm({ accountId: c.paymentAccountId, side });
          }}
        />
        <Explanation c={c} mode={mode} />
        {form ? (
          <BalanceForm
            key={form.side}
            c={c}
            start={form}
            existing={manual[form.side]}
            onCancel={() => setForm(null)}
            onSave={(value) => {
              setManual({ ...manual, [form.side]: value });
              setForm(null);
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

function DormantRow({ accounts, month }: { accounts: readonly DormantAccount[]; month: string }) {
  const quiet = accounts.filter((a) => a.wentQuiet);
  return (
    <ExpandableRow
      summary={
        <>
          <span>{formatCount(accounts.length, ["ruhendes Konto", "ruhende Konten"])}</span>
          <Verdict state={quiet.length ? "warning" : "skipped"} title={quiet.length ? "Warnung" : "ruhend"}>
            Keine Umsätze im {month}.
            {quiet.length
              ? ` ${quiet.map((a) => a.label).join(", ")} ${quiet.length === 1 ? "hatte" : "hatten"} im Vormonat noch Umsätze.`
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
          sub={`${formatTime(period.from, "month")} · Stichtag ${day(period.to)}`}
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
          {dormant.length ? <DormantRow accounts={dormant} month={formatTime(period.from, "month")} /> : null}
        </Table>
      </Card>
    </div>
  );
}
