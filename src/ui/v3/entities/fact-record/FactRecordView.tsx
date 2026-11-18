"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { FACT_GROUPS } from "@/ludwig/modules/fact-records/domain/fact-record";
import type {
  FactView,
  FactViewPartyOnTurn,
  FactViewSource,
} from "@/ludwig/modules/fact-records/domain/fact-view";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { FactTable, type FactTableRow } from "../../patterns/FactTable";
import { OpenPoints, type OpenPoint } from "../../patterns/OpenPoints";
import { FactSourceKindMark, type ProvenanceSource } from "../../patterns/Provenance";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Disclosure } from "../../primitives/Disclosure";
import { FieldList } from "../../primitives/FieldList";
import { Skeleton } from "../../primitives/Skeleton";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";

/**
 * What an entry rests on, in the side panel of the review (0247, app F678).
 *
 * From top to bottom, always in this order: the entry and how it was decided ·
 * what is open · the result, each line with „aus: …" · the facts that decided
 * it, one card per group · all other facts, folded. What is empty does not
 * stand there, not even its head.
 *
 * Everything arrives formatted from the app (`FactView`, F678a): values,
 * amounts, dates and places are German strings, the words of certainty,
 * group, reason, kind of source and origin come from the registry. This view
 * computes nothing and translates nothing.
 */

/** Who is on turn, on the axis `disposition`: program and agent are both Ludwig. */
const TURN: Record<FactViewPartyOnTurn, string> = {
  ludwig: "agent",
  accounting: "accounting",
  client: "client",
};

type Fact = FactView["groups"][number]["facts"][number];

function sourceOf(
  s: FactViewSource,
  key: string,
  openSource?: (s: FactViewSource) => (() => void) | undefined,
): ProvenanceSource {
  const onOpen = openSource?.(s);
  return {
    key,
    kind: <FactSourceKindMark kind={s.kind} />,
    label: s.label,
    locator: s.locator ?? null,
    quote: s.quote ?? null,
    href: s.href ?? null,
    ...(onOpen ? { onOpen } : {}),
  };
}

function rowOf(
  f: Fact,
  openSource?: (s: FactViewSource) => (() => void) | undefined,
): FactTableRow {
  return {
    key: f.key,
    label: f.label,
    value: f.value,
    certainty: f.certainty,
    sources: f.sources.map((s, i) => sourceOf(s, `${f.key}-${i}`, openSource)),
    validFrom: f.validFrom ?? null,
    validTo: f.validTo ?? null,
  };
}

/** The entry as the app formatted it: account, debit, credit, tax key — DATEV's order. */
function EntryLines({
  lines,
}: {
  lines: NonNullable<FactView["entry"]>["lines"];
}) {
  return (
    <Table cols="minmax(0, 1fr) 7rem 7rem 3rem" density="compact">
      <HeadRow>
        <span>Konto</span>
        <span className="v2num">Soll</span>
        <span className="v2num">Haben</span>
        <span>BU</span>
      </HeadRow>
      {lines.map((l, i) => (
        <Row key={i}>
          <span className="v3fact__cell">
            {l.account}
            {l.text ? (
              <span className="v2sub v3frv__text">{l.text}</span>
            ) : null}
          </span>
          <span className="v2num lw-numeric">
            {l.side === "debit" ? l.amount : null}
          </span>
          <span className="v2num lw-numeric">
            {l.side === "credit" ? l.amount : null}
          </span>
          <span className="v2mono">{l.taxKey ?? null}</span>
        </Row>
      ))}
    </Table>
  );
}

function Entry({ entry }: { entry: NonNullable<FactView["entry"]> }) {
  return (
    <Card>
      <CardHead
        title="Buchungssatz"
        headingLevel={3}
        actions={
          <StatusBadge
            axis="journal_entry_origin_method"
            status={entry.originMethod}
            info={false}
          />
        }
      />
      <EntryLines lines={entry.lines} />
      {entry.provisional ? (
        <div className="v3boxbody">
          <Callout>
            <strong>Vorläufig gebucht.</strong> Der Satz ruht auf einem offenen
            Punkt oder auf einer Annahme.
          </Callout>
        </div>
      ) : null}
    </Card>
  );
}

/**
 * @when    Showing what one entry rests on — entry, open points, result with
 *          „aus: …", the facts by group — in the side panel of the review.
 * @instead The facts alone, without entry and result → FactTable. The reasons
 *          of an entry booked without facts → BookingReview („Begründung").
 *          Changing a fact → FactRecordEditor (0247 part B, not built yet).
 */
export function FactRecordView({
  view,
  legacy,
  load,
  onRetry,
  openSource,
}: {
  view: FactView;
  /** Under „no fact record": the reasoning of today (`BookingReview`'s „Begründung") — nothing gets lost. */
  legacy?: ReactNode;
  /** Absent: loaded. The frame (drawer) loads; this view only shows the state. */
  load?: "loading" | "error";
  /** The way out of an error; without it no button stands there. */
  onRetry?: () => void;
  /** Opens a source beside the work (document, bank drawer); without it `href` links. */
  openSource?: (source: FactViewSource) => (() => void) | undefined;
}) {
  const [marked, setMarked] = useState<readonly string[]>([]);
  const [said, setSaid] = useState("");
  const root = useRef<HTMLDivElement>(null);

  if (load === "loading") {
    return (
      <div className="v3frv">
        <Skeleton variant="card" />
        <Skeleton variant="lines" lines={4} />
      </div>
    );
  }
  if (load === "error") {
    return (
      <div className="v3frv">
        <Callout tone="danger">
          {/* No cause: the view does not know it, and a guessed one misleads (acceptance 0247, H3). */}
          <strong>Die Fakten zu dieser Buchung ließen sich nicht laden.</strong>{" "}
          {onRetry
            ? "Laden Sie die Ansicht erneut; bleibt der Fehler, schließen Sie die Leiste und öffnen Sie die Buchung neu."
            : "Schließen Sie die Leiste und öffnen Sie die Buchung neu."}
        </Callout>
        {onRetry ? (
          <div>
            <Button variant="secondary" onClick={onRetry}>
              Erneut laden
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if (view.state === "no_fact_record") {
    return (
      <div className="v3frv">
        {view.entry ? <Entry entry={view.entry} /> : null}
        <Callout tone="soft">
          Diese Buchung hat keinen Faktensatz: Sie stammt aus der Zeit vor der
          Buchung aus Fakten.
        </Callout>
        {legacy}
      </div>
    );
  }

  const labelOf = new Map(
    view.groups.flatMap((g) => g.facts.map((f) => [f.key, f.label] as const)),
  );
  const order = (g: FactView["groups"][number]) => FACT_GROUPS.indexOf(g.group);
  const groups = [...view.groups].sort((a, b) => order(a) - order(b));
  const used = groups
    .map((g) => ({
      group: g.group,
      facts: g.facts.filter((f) => f.usedForResult),
    }))
    .filter((g) => g.facts.length > 0);
  const rest = groups
    .map((g) => ({
      group: g.group,
      facts: g.facts.filter((f) => !f.usedForResult),
    }))
    .filter((g) => g.facts.length > 0);
  const restCount = rest.reduce((n, g) => n + g.facts.length, 0);

  const mark = (keys: readonly string[]) => {
    const same =
      keys.length === marked.length && keys.every((k) => marked.includes(k));
    if (same || keys.length === 0) {
      setMarked([]);
      setSaid("Markierung aufgehoben");
      return;
    }
    setMarked(keys);
    setSaid(
      keys.length === 1 ? "1 Fakt markiert" : `${keys.length} Fakten markiert`,
    );
    // `basedOn` names only facts used for the result (F678a, schema rule), so
    // the first one stands in a card above and never under the fold.
    requestAnimationFrame(() => {
      root.current
        ?.querySelector<HTMLElement>(
          `[data-fact-key="${CSS.escape(keys[0] ?? "")}"]`,
        )
        ?.focus();
    });
  };

  // Esc first lifts the marking; only a second Esc reaches the drawer and closes it.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && marked.length > 0) {
      e.stopPropagation();
      mark([]);
    }
  };

  // Most critical first (A7): what blocks the hand-over stands on top.
  const openPoints = [...view.openPoints].sort(
    (a, b) => Number(b.blocksHandover) - Number(a.blocksHandover),
  );
  const points: OpenPoint[] = openPoints.map((op) => ({
    key: op.id,
    title: `${op.label}: ${resolveStatus("fact_open_point_reason", op.reason).label}.`,
    hint: op.blocksHandover
      ? `${op.detail} Sperrt die Übergabe an DATEV.`
      : op.detail,
    // Red only where the hand-over is blocked; an open point is otherwise a state, not a warning (owner 2026-09-30).
    state: op.blocksHandover ? "error" : "info",
    action: (
      <StatusBadge axis="disposition" status={TURN[op.onTurn]} info={false} />
    ),
    // A contradiction shows its sources right under its own point, one row
    // each with its own value (acceptance 0247, M2).
    ...(op.reason === "contradictory" && op.evidence.length > 0
      ? {
          more: (
            <FactTable
              facts={op.evidence.map((e, i) => ({
                key: `${op.id}-${i}`,
                label: op.label,
                value: e.value ?? null,
                sources: [sourceOf(e, `${op.id}-s${i}`, openSource)],
              }))}
            />
          ),
        }
      : {}),
  }));

  return (
    <div className="v3frv" ref={root} onKeyDown={onKeyDown}>
      {view.entry ? <Entry entry={view.entry} /> : null}

      {points.length > 0 ? (
        <OpenPoints title="Offen" headingLevel={3} points={points} />
      ) : null}

      {view.result.length > 0 ? (
        <Card>
          <CardHead title="Ergebnis" headingLevel={3} />
          <div className="v3boxbody">
            <FieldList
              tone="bare"
              values="prose"
              rows={view.result.map((r) => {
                const on =
                  r.basedOn.length > 0 &&
                  r.basedOn.every((k) => marked.includes(k)) &&
                  marked.length === r.basedOn.length;
                return [
                  r.label,
                  <span key={r.key}>
                    {r.value}
                    {r.basedOn.length > 0 ? (
                      <span className="v2sub v3frv__from">
                        aus:{" "}
                        {r.basedOn.map((k, i) => (
                          <span key={k}>
                            <button
                              type="button"
                              className="v2link v3frv__ref"
                              aria-pressed={on}
                              onClick={() => mark(r.basedOn)}
                            >
                              {labelOf.get(k) ?? k}
                            </button>
                            {i < r.basedOn.length - 1 ? ", " : null}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </span>,
                ];
              })}
            />
          </div>
        </Card>
      ) : null}

      {used.map((g) => (
        <Card key={g.group}>
          <CardHead
            title={resolveStatus("fact_group", g.group).label}
            headingLevel={3}
          />
          <FactTable
            facts={g.facts.map((f) => rowOf(f, openSource))}
            marked={marked}
          />
        </Card>
      ))}

      {restCount > 0 ? (
        <Disclosure summary="Weitere Angaben" count={restCount}>
          <div className="v3frv">
            {rest.map((g) => (
              <Card key={g.group}>
                <CardHead
                  title={resolveStatus("fact_group", g.group).label}
                  headingLevel={3}
                />
                <FactTable facts={g.facts.map((f) => rowOf(f, openSource))} />
              </Card>
            ))}
          </div>
        </Disclosure>
      ) : null}

      <p className="v2vh" role="status" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
