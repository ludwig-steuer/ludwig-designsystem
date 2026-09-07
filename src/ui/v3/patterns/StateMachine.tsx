import { Badge } from "../primitives/Badge";
import { Popover } from "../primitives/Popover";
import { AXIS_SOURCE } from "./entity-icons";
import {
  STATUS_REGISTRY,
  resolveStatus,
  type StatusAxis,
} from "@/ludwig/ui/status/status-registry";

/**
 * The map of a status axis (0069).
 *
 * The reviewer sees „Kanzlei prüft" on a batch and asks: what came before,
 * what comes after, and where can I send it back to? Today she gets the list
 * in `StatusInfoDialog` — eleven rows in registry order, without an arrow.
 * Whether `failed` goes back to `ready` or to `review` stands in a markdown
 * table that only developers read.
 *
 * This is the fourth step of Z3 (label → hover → list → **picture**): boxes
 * with the words of the registry, arrows for the transitions, the current
 * state highlighted, and a click on every box explains it.
 *
 * **The picture does not lie where the data is missing.** Without
 * `transitions` the states stand in a row with a dotted connector and a line
 * saying so — the transitions exist as data for almost none of the 70 axes
 * (L-74), and inventing them from the registry order would be a claim.
 *
 */

export interface StateTransition {
  /** Registry key of the source state. */
  from: string;
  /** Registry key of the target state. */
  to: string;
  /**
   * What triggers it — „Freigabe", „Retry", `start_agent_run`. On the arrow as
   * a `<title>`, and readable in the explanation of both states.
   */
  label?: string;
}

/** One box, once the order and the ranks are known. */
interface Box {
  value: string;
  label: string;
  kind: string;
  meaning: string;
  /** `true` when the registry does not know the value — shown raw. */
  raw: boolean;
  column: number;
  row: number;
}

/* ── Layout ──────────────────────────────────────────────────────────────
   Reine Funktionen, kein Messen: die Boxen liegen im CSS-Grid, die Kanten in
   einem SVG mit derselben Rastereinheit. Kein ResizeObserver, keine
   Bibliothek — die Karte ist so groß, wie das Raster sie macht. */

/**
 * The grid, in one place. The numbers live **here** and not in `v3.css`,
 * because the SVG needs them as numbers — a `var()` cannot be added up. They
 * reach the DOM as inline values on the card; CSS never repeats them, so
 * there is nothing that can drift apart (a first attempt also handed them
 * over as `--v2fsm-*`, which no rule ever read — dead weight, removed in the
 * second acceptance of 0069).
 */
const COL = 150;
// Zwei Zeilen Beschriftung (2 × 19) plus die Wertzeile (15) plus Innenabstand
// (2 × 8) und die Ränder = **72**, die Höhe der Box; die Zeile lässt darüber
// hinaus 20 für die Bögen darunter. (Die Rechnung stand bis 2026-09-07 mit
// „= 60" hier und passte damit zu keiner gemessenen Box.)
const ROW = 92;
const BOX_W = 126;
const BOX_H = 72;

/**
 * The order of the states: what the caller says, else the registry, and
 * everything a transition or `current` mentions but neither knows — appended,
 * so that a new DB value stands out instead of vanishing (like `resolveStatus`).
 */
function order(
  axis: StatusAxis,
  states: readonly string[] | undefined,
  transitions: readonly StateTransition[],
  current: string | null | undefined,
): string[] {
  const known = Object.keys(STATUS_REGISTRY[axis]);
  const out = [...(states ?? known)];
  const seen = new Set(out);
  for (const t of transitions) {
    for (const v of [t.from, t.to]) {
      if (!seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    }
  }
  if (current && !seen.has(current)) out.push(current);
  return out;
}

/**
 * The column of each state: `0` when no forward transition ends in it, else
 * one more than the deepest source. Computed in order — every `from` stands
 * before its `to`, so one pass is enough. Backward transitions change nothing.
 */
function ranks(values: string[], transitions: readonly StateTransition[]): Map<string, number> {
  const index = new Map(values.map((v, i) => [v, i]));
  const rank = new Map(values.map((v) => [v, 0]));
  for (const v of values) {
    for (const t of transitions) {
      if (t.to !== v) continue;
      const from = index.get(t.from);
      const to = index.get(t.to);
      if (from === undefined || to === undefined || from >= to) continue;
      rank.set(v, Math.max(rank.get(v) ?? 0, (rank.get(t.from) ?? 0) + 1));
    }
  }
  return rank;
}

/**
 * Position every state: column from the rank, row from the order within it.
 *
 * **Without transitions every rank is 0** — and then the states must stand
 * side by side, not in one tall column: the row is the picture of „an order,
 * no ways" (0069, Verhalten). So the index becomes the column.
 */
function layout(
  axis: StatusAxis,
  values: string[],
  transitions: readonly StateTransition[],
): Box[] {
  const rank = transitions.length === 0
    ? new Map(values.map((v, i) => [v, i]))
    : ranks(values, transitions);
  const used = new Map<number, number>();
  return values.map((value) => {
    const column = rank.get(value) ?? 0;
    const row = used.get(column) ?? 0;
    used.set(column, row + 1);
    const known = STATUS_REGISTRY[axis][value];
    const d = resolveStatus(axis, value);
    return {
      value,
      label: known ? d.label : value,
      kind: known ? d.kind : "neutral",
      meaning: known ? (d.description ?? "") : "",
      raw: !known,
      column,
      row,
    };
  });
}

/** Centre of a box in grid coordinates. */
function centre(b: Box) {
  return { x: b.column * COL + BOX_W / 2, y: b.row * ROW + BOX_H / 2 };
}

/**
 * The path of one transition. Neighbouring columns run straight through the
 * middle; a jump over a column arcs **above**, a way back arcs **below** — so
 * a pair `a ⇄ b` never draws itself twice on the same line.
 */
function edgePath(a: Box, b: Box, height: number): string {
  const from = centre(a);
  const to = centre(b);
  const forward = b.column > a.column;
  const jump = Math.abs(b.column - a.column) > 1;
  if (forward && !jump) {
    const x1 = a.column * COL + BOX_W;
    const x2 = b.column * COL;
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${from.y} C ${mid} ${from.y}, ${mid} ${to.y}, ${x2} ${to.y}`;
  }
  // Ein Bogen läuft **um** das Bild herum, nicht hindurch: die senkrechten
  // Stücke liegen in den Spaltenlücken, das lange Stück über oder unter allem.
  // Vorher stieg er bei der Zielbox senkrecht auf und durchquerte dabei, was
  // in derselben Spalte darunter stand — der Pfeil schien dann aus der
  // falschen Box zu kommen (Abnahme 0069).
  const above = forward;
  const y = above ? -24 : height + 24;
  const lane = 12;
  const ax = above ? a.column * COL + BOX_W : a.column * COL;
  const bx = b.column * COL;
  const ay = a.row * ROW + BOX_H / 2;
  const by = b.row * ROW + BOX_H / 2;
  const aLane = above ? ax + lane : ax - lane;
  const bLane = bx - lane;
  // Rechtwinklig statt geschwungen: eine Kurve schneidet auf dem Weg nach oben
  // die Ecke der Box, an der sie vorbeiwill — gemessen hat „Quittung" so die
  // obere linke Ecke von `inspection` gestreift. Die senkrechten Stücke liegen
  // in den Lücken, das waagerechte über oder unter allem; damit kann der Weg
  // keine fremde Box berühren.
  const r = 8;
  const vDir = y < ay ? -1 : 1;
  return (
    `M ${ax} ${ay} L ${aLane - Math.sign(aLane - ax) * r} ${ay} ` +
    `Q ${aLane} ${ay}, ${aLane} ${ay + vDir * r} ` +
    `L ${aLane} ${y - vDir * r} Q ${aLane} ${y}, ${aLane + Math.sign(bLane - aLane) * r} ${y} ` +
    `L ${bLane - Math.sign(bLane - aLane) * r} ${y} Q ${bLane} ${y}, ${bLane} ${y - vDir * r} ` +
    `L ${bLane} ${by + vDir * r} Q ${bLane} ${by}, ${bLane + r} ${by} ` +
    `L ${bx} ${by}`
  );
}

/**
 * @when    „What are the ways out of this state?" — the map of one axis, in
 *          the status explanation or beside a detail.
 * @instead Where **this** object stands → ProcessStepper (Z7). What happened
 *          to it → Timeline. All values as a list → StatusInfoDialog.
 */
export function StateMachine({
  axis,
  transitions = [],
  states,
  current,
  description,
}: {
  axis: StatusAxis;
  transitions?: readonly StateTransition[];
  states?: readonly string[];
  current?: string | null;
  description?: string;
}) {
  const values = order(axis, states, transitions, current);
  // Die DOM-Reihenfolge ist die Leserichtung: Spalte, dann Zeile. Damit läuft
  // Tab die Karte ab, wie das Auge sie liest — und nicht in der Reihenfolge,
  // in der die Zustände zufällig in der Registry stehen (0069, Tastatur).
  const boxes = layout(axis, values, transitions).sort(
    (a, b) => a.column - b.column || a.row - b.row,
  );
  const byValue = new Map(boxes.map((b) => [b.value, b]));
  const columns = Math.max(...boxes.map((b) => b.column)) + 1;
  const rows = Math.max(...boxes.map((b) => b.row)) + 1;
  const width = columns * COL - (COL - BOX_W);
  const height = rows * ROW - (ROW - BOX_H);
  const hasEdges = transitions.length > 0;

  return (
    <div className="v2fsm">
      {description ? <p className="v2fsm__lead">{description}</p> : null}
      <div className="v2fsm__scroll">
        <div
          className="v2fsm__grid"
          style={{
            width,
            minHeight: height,
            gridTemplateColumns: `repeat(${columns}, ${BOX_W}px)`,
            gridAutoRows: `${BOX_H}px`,
            columnGap: COL - BOX_W,
            rowGap: ROW - BOX_H,
          }}
        >
          {hasEdges ? null : (
            // Ein Verbinder, keine Kante: gepunktet und **ohne** Spitze — er
            // sagt „Reihenfolge", nicht „Übergang" (0069).
            <svg
              className="v2fsm__edges v2fsm__edges--dotted"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              aria-hidden="true"
            >
              {boxes.slice(0, -1).map((b, i) => (
                <path
                  key={b.value}
                  d={`M ${b.column * COL + BOX_W} ${BOX_H / 2} L ${boxes[i + 1]!.column * COL} ${BOX_H / 2}`}
                />
              ))}
            </svg>
          )}
          {hasEdges ? (
            <svg
              className="v2fsm__edges"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="v2fsm-arrow"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 8 4 L 0 8 z" />
                </marker>
              </defs>
              {transitions.map((t) => {
                const a = byValue.get(t.from);
                const b = byValue.get(t.to);
                // Ein Selbst-Übergang wird nicht gezeichnet — er steht im
                // Popover unter „Hinaus durch" (Ausbau: die Schleife).
                if (!a || !b || a === b) return null;
                return (
                  <path
                    key={`${t.from}-${t.to}-${t.label ?? ""}`}
                    d={edgePath(a, b, height)}
                    markerEnd="url(#v2fsm-arrow)"
                  >
                    {t.label ? <title>{t.label}</title> : null}
                  </path>
                );
              })}
            </svg>
          ) : null}

          {boxes.map((b) => (
            <StateBox
              key={b.value}
              axis={axis}
              box={b}
              current={current === b.value}
              transitions={transitions}
              byValue={byValue}
              hasEdges={hasEdges}
            />
          ))}
        </div>
      </div>
      {hasEdges ? null : (
        <p className="v2fsm__note">
          Reihenfolge nach Registry, Übergänge nicht hinterlegt.
        </p>
      )}
    </div>
  );
}

/** One box plus its explanation — the trigger carries its word (T8). */
function StateBox({
  axis,
  box,
  current,
  transitions,
  byValue,
  hasEdges,
}: {
  axis: StatusAxis;
  box: Box;
  current: boolean;
  transitions: readonly StateTransition[];
  byValue: Map<string, Box>;
  hasEdges: boolean;
}) {
  const label = (v: string) => byValue.get(v)?.label ?? v;
  const incoming = transitions.filter((t) => t.to === box.value && t.from !== box.value);
  const outgoing = transitions.filter((t) => t.from === box.value);

  return (
    // Die **Zelle** liegt im Raster, nicht der Knopf: `Popover` hängt seinen
    // Auslöser in ein `span.v2pop__anchor`, und damit wäre der Knopf kein
    // Grid-Kind mehr — `grid-column` an ihm bliebe wirkungslos, die Boxen
    // stünden im Auto-Flow und die Kanten zeigten ins Leere (Abnahme 0069).
    <div
      className="v2fsm__cell"
      style={{ gridColumn: box.column + 1, gridRow: box.row + 1 }}
    >
    <Popover
      align="start"
      trigger={
        <button
          type="button"
          className={`v2fsm__state${current ? ` is-current is-current--${box.kind}` : ""}${box.raw ? " v2fsm__state--raw" : ""}`}
          aria-current={current ? "step" : undefined}
        >
          <span className="v2fsm__label" title={box.label}>
            {box.label}
          </span>
          <span className="v2fsm__meta">
            {/* Bei einem Rohwert steht der Schlüssel schon oben — ihn zweimal
                zu schreiben, sagt nichts zweimal (Abnahme 0069). */}
            {box.raw ? null : <code className="v2fsm__value">{box.value}</code>}
            {/* Farbe steht nie allein (V7) — das Wort steht **neben** dem
                Wert, nicht in einer dritten Zeile: drei Zeilen quetschten die
                Beschriftung der aktuellen Box auf null (Abnahme 0069). */}
            {current ? <span className="v2fsm__now">aktuell</span> : null}
          </span>
        </button>
      }
    >
      <div className="v2fsm__pop">
        <div className="v2fsm__pophead">
          <Badge tone={box.raw ? "neutral" : (box.kind as never)}>{box.label}</Badge>
          <code>{box.value}</code>
        </div>
        <p className="v2fsm__meaning">
          {box.meaning || (box.raw ? "Diesen Wert kennt die Registry nicht." : "—")}
        </p>
        {hasEdges ? (
          <>
            <Ways title="Hinein durch" items={incoming.map((t) => `${label(t.from)} · ${t.label ?? "—"}`)} />
            <Ways
              title="Hinaus durch"
              items={outgoing.map((t) =>
                t.to === box.value
                  ? `${t.label ?? "—"} · zurück auf sich selbst`
                  : `${t.label ?? "—"} · ${label(t.to)}`,
              )}
            />
          </>
        ) : null}
        <code className="v2fsm__src">{AXIS_SOURCE[axis]}</code>
      </div>
    </Popover>
    </div>
  );
}

function Ways({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="v2fsm__ways">
      <div className="v2fsm__waystitle">{title}</div>
      <ul>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
