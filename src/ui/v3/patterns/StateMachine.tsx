import { Badge } from "../primitives/Badge";
import { Popover } from "../primitives/Popover";
import { AXIS_SOURCE } from "./entity-icons";
import {
  STATE_MACHINES,
  STATUS_REGISTRY,
  resolveStatus,
  type StateTransition,
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
 * **The transitions come from the registry.** Since 2026-09-07 (`ba5da563`,
 * finding L-74) `STATE_MACHINES` carries them as data, for four axes so far;
 * the component reads them itself, and a caller only passes `transitions` for
 * an axis that has none yet.
 *
 * **The picture does not lie where the data is missing.** Without transitions
 * the states stand in a row with a dotted connector and a line saying so —
 * some fifty axes are still open (L-75), and inventing them from the registry
 * order would be a claim.
 */

export type { StateTransition };

/**
 * A transition between two boxes. `from: null` is the **entry** into the axis
 * — it has no source box, so it is no edge; it is drawn as a line in the
 * explanation of its target instead of an arrow out of nowhere.
 */
type Edge = StateTransition & { from: string };

const isEdge = (t: StateTransition): t is Edge => t.from !== null;

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

/* ── Layout ─────────────────────────────────────────────────────────────
   Pure functions, no measuring: boxes sit in a CSS grid, edges in an SVG on
   the same grid unit. */

/**
 * The grid, in one place. The numbers live **here** and not in `v3.css`,
 * because the SVG needs them as numbers — a `var()` cannot be added up. They
 * reach the DOM as inline values on the card; CSS never repeats them, so
 * there is nothing that can drift apart (a first attempt also handed them
 * over as `--v2fsm-*`, which no rule ever read — dead weight, removed in the
 * second acceptance of 0069).
 */
const COL = 150;
// **72** is the box height, measured across all 44 boxes of the six stories —
// not computed, so a new type step cannot silently break it. The row leaves
// another 20 px above the box for the arcs below.
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
  transitions: readonly Edge[],
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
function ranks(values: string[], transitions: readonly Edge[]): Map<string, number> {
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
  transitions: readonly Edge[],
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
  // An arc runs **around** the picture, not through it: vertical pieces in the
  // column gaps, the long piece above or below everything (acceptance 0069).
  const above = forward;
  const y = above ? -24 : height + 24;
  const lane = 12;
  const ax = above ? a.column * COL + BOX_W : a.column * COL;
  const bx = b.column * COL;
  const ay = a.row * ROW + BOX_H / 2;
  const by = b.row * ROW + BOX_H / 2;
  const aLane = above ? ax + lane : ax - lane;
  const bLane = bx - lane;
  // Right-angled, not curved: a curve clips the corner of the box it passes.
  // With vertical pieces in the gaps and the horizontal one outside, the path
  // cannot touch another box.
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
  transitions,
  states,
  current,
  description,
}: {
  axis: StatusAxis;
  /** Only for an axis the registry has no machine for yet (L-75). */
  transitions?: readonly StateTransition[];
  states?: readonly string[];
  current?: string | null;
  description?: string;
}) {
  // **Searched, not indexed.** The key in `STATE_MACHINES` is the **process**
  // (`export_batch`, `document_processing`), not the axis — the registry says
  // so explicitly since the mirror pull of 2026-09-07. Before that the four
  // machines were named after their axes and the direct lookup hit; after it
  // hit nothing, silently. A process may write several axes, so the machine's
  // default axis is what counts.
  const machine =
    STATE_MACHINES[axis] ?? Object.values(STATE_MACHINES).find((m) => m.axis === axis);

  const all = transitions ?? machine?.transitions ?? [];
  const lead = description ?? machine?.description;
  // The entry into the axis has no source box; it is not an edge.
  const edges = all.filter(isEdge);
  const entries = all.filter((t) => !isEdge(t));
  const values = order(axis, states, edges, current);
  // DOM order is reading order — column, then row — so Tab walks the map the
  // way the eye reads it, not in registry order (0069).
  const boxes = layout(axis, values, edges).sort(
    (a, b) => a.column - b.column || a.row - b.row,
  );
  const byValue = new Map(boxes.map((b) => [b.value, b]));
  const columns = Math.max(...boxes.map((b) => b.column)) + 1;
  const rows = Math.max(...boxes.map((b) => b.row)) + 1;
  const width = columns * COL - (COL - BOX_W);
  const height = rows * ROW - (ROW - BOX_H);
  const hasEdges = edges.length > 0;

  return (
    <div className="v2fsm">
      {lead ? <p className="v2fsm__lead">{lead}</p> : null}
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
            // A connector, not an edge: dotted and **without** an arrowhead — it
            // says "order", not "transition" (0069).
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
              {edges.map((t) => {
                const a = byValue.get(t.from);
                const b = byValue.get(t.to);
                // A self-transition is not drawn — the popover lists it.
                if (!a || !b || a === b) return null;
                return (
                  <path
                    key={`${t.from}-${t.to}-${t.trigger}`}
                    d={edgePath(a, b, height)}
                    markerEnd="url(#v2fsm-arrow)"
                  >
                    <title>{wayText(t)}</title>
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
              transitions={edges}
              entries={entries}
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

/**
 * A transition in words: **the label**, and who pulls it.
 *
 * The label, not the trigger: since the mirror pull of 2026-09-07 the two are
 * separate — `trigger` is the technical name the later state-machine log
 * writes (English, `snake_case`), `label` is what a person reads (German).
 * Showing the trigger would put `agent_run_started` in front of a bookkeeper.
 *
 * The actor is a value of the axis `actor_kind` and comes from the registry
 * (L-74); where it is missing, the sentence simply ends after the label.
 */
function wayText(t: StateTransition): string {
  return t.by ? `${t.label} · ${t.by}` : t.label;
}

/** One box plus its explanation — the trigger carries its word (T8). */
function StateBox({
  axis,
  box,
  current,
  transitions,
  entries,
  byValue,
  hasEdges,
}: {
  axis: StatusAxis;
  box: Box;
  current: boolean;
  transitions: readonly Edge[];
  entries: readonly StateTransition[];
  byValue: Map<string, Box>;
  hasEdges: boolean;
}) {
  const label = (v: string) => byValue.get(v)?.label ?? v;
  const incoming = transitions.filter((t) => t.to === box.value && t.from !== box.value);
  const outgoing = transitions.filter((t) => t.from === box.value);
  // How a thing enters the axis at all — the registry says it since L-74, and
  // it is the one way that has no arrow, because it comes from outside.
  const entering = entries.filter((t) => t.to === box.value);

  return (
    // The **cell** sits in the grid, not the button: `Popover` wraps its trigger
    // in `span.v2pop__anchor`, so the button is no grid child and
    // `grid-column` on it would do nothing (0069).
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
            {/* For a raw value the key already stands above — no need to repeat it. */}
            {box.raw ? null : <code className="v2fsm__value">{box.value}</code>}
            {/* Colour never alone (V7): the word stands **next to** the value, not in
                a third line, which squeezed the current box's label to nothing. */}
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
        <Ways title="Eintritt durch" items={entering.map(wayText)} />
        {hasEdges ? (
          <>
            <Ways title="Hinein durch" items={incoming.map((t) => `${label(t.from)} · ${wayText(t)}`)} />
            <Ways
              title="Hinaus durch"
              items={outgoing.map((t) =>
                t.to === box.value
                  ? `${wayText(t)} · zurück auf sich selbst`
                  : `${wayText(t)} · ${label(t.to)}`,
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
