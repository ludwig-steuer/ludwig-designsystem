/// <reference types="vite/client" />
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { RowActions } from "./primitives/ActionBar";
import { Button } from "./primitives/Button";
import { IconButton } from "./primitives/IconButton";
import { TextButton } from "./primitives/TextButton";
import { EntityHeader } from "./patterns/EntityHeader";
import { StatusBadge } from "./patterns/StatusBadge";
import { AXIS_LABEL } from "./patterns/entity-icons";
import {
  ACTION_ICON,
  ActionIcon,
  ENTITY_ICON,
  EntityIcon,
  type ActionKey,
  type EntityKey,
  type IconEntry,
} from "./Icons";

/**
 * Icons (0055) — no component, no new CSS. The rule lives in
 * `design-guidelines.md` §2 and T8/T9; what the set actually does is read out
 * of the sources here, so the gap between rule and practice is visible
 * instead of argued about.
 */
const meta: Meta = { title: "v3/Grundlagen/Icons" };
export default meta;
type Story = StoryObj;

/* ── Measurement ──────────────────────────────────────────────────────── */

const PRODUCT_SOURCES = import.meta.glob<string>(["./**/*.ts", "./**/*.tsx", "!./**/*.stories.tsx"], {
  query: "?raw",
  import: "default",
  eager: true,
});
const STORY_SOURCES = import.meta.glob<string>("./**/*.stories.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Icon name → the files that import it. `LucideIcon` is a type, not an icon. */
function imported(sources: Record<string, string>): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const [path, text] of Object.entries(sources)) {
    for (const match of text.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"lucide-react"/g)) {
      for (const name of match[1].match(/[A-Za-z0-9_]+/g) ?? []) {
        if (name === "type" || name === "LucideIcon") continue;
        found.set(name, [...new Set([...(found.get(name) ?? []), path.split("/").pop() ?? path])]);
      }
    }
  }
  return found;
}

const IN_PRODUCT = imported(PRODUCT_SOURCES);
const ONLY_IN_STORIES = [...imported(STORY_SOURCES).keys()].filter((n) => !IN_PRODUCT.has(n)).sort();

/** Every numeric value one attribute takes in the product code, with its count. */
function tally(attribute: RegExp): { value: number; times: number }[] {
  const counted = new Map<number, number>();
  for (const text of Object.values(PRODUCT_SOURCES)) {
    for (const match of text.matchAll(attribute)) {
      const value = Number(match[1]);
      counted.set(value, (counted.get(value) ?? 0) + 1);
    }
  }
  return [...counted.entries()].map(([value, times]) => ({ value, times })).sort((a, b) => a.value - b.value);
}

const SIZES_IN_USE = tally(/\bsize=\{([\d.]+)\}/g);
const STROKES_IN_USE = tally(/\bstrokeWidth=\{([\d.]+)\}/g);

/* ── Shared bits ──────────────────────────────────────────────────────── */

function Section({ title, lead, children }: { title: string; lead: ReactNode; children: ReactNode }) {
  return (
    <section style={{ marginBottom: "var(--space-10)" }}>
      <h3 className="lw-h4" style={{ margin: 0 }}>{title}</h3>
      <p className="lw-caption" style={{ margin: "var(--space-1) 0 var(--space-5)", maxWidth: "var(--content-measure)" }}>
        {lead}
      </p>
      {children}
    </section>
  );
}

function Mark({ tone, children }: { tone: "danger" | "success" | "warning"; children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: "var(--fs-ui-xs)",
        color: `var(--color-${tone})`,
        border: `1px solid var(--color-${tone})`,
        borderRadius: "var(--radius-sm)",
        padding: "0 var(--space-1)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const page: CSSProperties = { maxWidth: "var(--container-base)" };
const note: CSSProperties = { fontSize: "var(--fs-ui-xs)", color: "var(--color-text-subtle)" };

/* ── Sizes ────────────────────────────────────────────────────────────── */

const LADDERS: { register: string; lead: string; steps: { px: number; follows: string; sample: string }[] }[] = [
  {
    register: "Produktiv · /clients, /admin, /dashboard",
    lead: "Das Icon folgt der Schriftstufe seines Registers, nie umgekehrt.",
    steps: [
      { px: 12, follows: "--fs-ui-sm · --fs-ui-xs", sample: "Unterzeile, Hinweis, Taste" },
      { px: 14, follows: "--fs-ui · --fs-ui-md", sample: "Zeile, Feld, Knopf" },
      { px: 16, follows: "--fs-ui-lg · --fs-ui-xl", sample: "Karten- und Seitentitel" },
    ],
  },
  {
    register: "Lesend · Login, Hilfe, Onboarding",
    lead: "Die Leiter aus dem Marken-Brief — sie galt immer diesem Register mit 16-px-Text.",
    steps: [
      { px: 16, follows: ".lw-body", sample: "Fließtext" },
      { px: 20, follows: "Knopf, Liste", sample: "Handlung im lesenden Register" },
      { px: 24, follows: "Kopf, Leerzustand", sample: "das größte Maß, das es gibt" },
    ],
  },
];

const ON_LADDER = [12, 14, 16, 20, 24];

/** Die Leiter je Register (A8) — und daneben, was der Code heute wirklich tut. */
export const Sizes: Story = {
  render: () => (
    <div style={page}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        Lucide, Strich <span className="lw-numeric">1,5</span>, immer{" "}
        <code className="lw-mono">currentColor</code> — nie farbig, nie gefüllt, nie animiert (einzige Ausnahme:
        die Füllung in der Status-Plakette). Zwei Register, zwei Leitern (A8).
      </p>
      {LADDERS.map((ladder) => (
        <Section key={ladder.register} title={ladder.register} lead={ladder.lead}>
          <div style={{ display: "flex", gap: "var(--space-10)", alignItems: "flex-end" }}>
            {ladder.steps.map((step) => (
              <div key={`${ladder.register}-${step.px}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", height: "var(--space-8)" }}>
                  <FileText size={step.px} strokeWidth={1.5} />
                  <Check size={step.px} strokeWidth={1.5} />
                  <X size={step.px} strokeWidth={1.5} />
                </div>
                <div className="lw-numeric" style={{ fontWeight: 600, fontSize: "var(--fs-ui)" }}>{step.px} px</div>
                <div className="lw-mono" style={note}>{step.follows}</div>
                <div style={note}>{step.sample}</div>
              </div>
            ))}
          </div>
        </Section>
      ))}

      <Section
        title="Was der Code heute tut"
        lead="Gemessen in src/ui/v3 ohne Stories. Was auf einer Leiter steht, ist grün; was daneben liegt, wird beim nächsten Anfassen der Komponente gezogen — nicht in Masse (Befund 1)."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
          <div>
            <div className="lw-overline">Größen</div>
            {SIZES_IN_USE.map((s) => (
              <div key={s.value} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) 0", borderBottom: "var(--border-1-subtle)" }}>
                <FileText size={s.value} strokeWidth={1.5} />
                <span className="lw-numeric" style={{ fontSize: "var(--fs-ui)", minWidth: "var(--space-12)" }}>
                  {String(s.value).replace(".", ",")} px
                </span>
                <span className="lw-numeric" style={note}>{s.times}×</span>
                {ON_LADDER.includes(s.value) ? (
                  <Mark tone="success">auf der Leiter</Mark>
                ) : (
                  <Mark tone="warning">daneben</Mark>
                )}
              </div>
            ))}
          </div>
          <div>
            <div className="lw-overline">Strichstärken</div>
            {STROKES_IN_USE.map((s) => (
              <div key={s.value} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) 0", borderBottom: "var(--border-1-subtle)" }}>
                <FileText size={16} strokeWidth={s.value} />
                <span className="lw-numeric" style={{ fontSize: "var(--fs-ui)", minWidth: "var(--space-12)" }}>
                  {String(s.value).replace(".", ",")}
                </span>
                <span className="lw-numeric" style={note}>{s.times}×</span>
                {s.value === 1.5 ? <Mark tone="success">Regel</Mark> : <Mark tone="warning">daneben</Mark>}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  ),
};


/* ── Vocabulary: gelesen aus der Registry (0087) ──────────────────────── */

/**
 * Eine Zeile je Eintrag. Sie kommt aus `Icons.tsx` — diese Story
 * pflegt keine eigene Liste mehr; was die Registry nicht führt, steht hier
 * nicht, und was hier fehlt, meldet `pnpm check:icons`.
 */
function Entry({ id, entry }: { id: string; entry: IconEntry; }) {
  const Icon = entry.icon;
  return (
    <tr>
      <td style={{ padding: "var(--space-2) var(--space-3)", width: 32 }}>
        <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
      </td>
      <td className="lw-mono" style={{ padding: "var(--space-2) var(--space-3)", fontSize: "var(--fs-ui-sm)", whiteSpace: "nowrap" }}>
        {id}
      </td>
      <td style={{ padding: "var(--space-2) var(--space-3)", fontSize: "var(--fs-ui-sm)", whiteSpace: "nowrap" }}>
        {entry.label}
      </td>
      <td style={{ padding: "var(--space-2) var(--space-3)", fontSize: "var(--fs-ui-sm)" }}>
        {entry.meaning}
        {entry.instead ? <div style={note}>{entry.instead}</div> : null}
      </td>
    </tr>
  );
}

function Table({ entries }: { entries: [string, IconEntry][] }) {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "var(--container-wide)" }}>
      <tbody>
        {entries.map(([id, entry]) => (
          <Entry key={id} id={id} entry={entry} />
        ))}
      </tbody>
    </table>
  );
}

/**
 * Welches Zeichen welches Ding meint. Schlüssel ist der englische
 * GLOSSARY-Name — dasselbe Wort, das der Ordner unter `entities/` trägt.
 */
export const Entities: Story = {
  render: () => (
    <div style={page}>
      <Section
        title="Entität"
        lead={
          <>
            <span className="lw-numeric">{Object.keys(ENTITY_ICON).length}</span> Dinge, je ein Zeichen.
            Aus <code className="lw-mono">ENTITY_ICON</code> gerendert, nicht abgeschrieben: die Sidebar der
            App ist die Vorgabe, wo sie eine hat. Die Achsen der Status-Registry finden ihr Zeichen über die
            Abbildung Achse → Entität; die übrigen{" "}
            <span className="lw-numeric">{Object.keys(AXIS_LABEL).length - 3}</span> Achsen haben bewusst
            keins — sie stehen in einem Kontext, der die Entität schon nennt.
          </>
        }
      >
        <Table entries={Object.entries(ENTITY_ICON) as [string, IconEntry][]} />
      </Section>
    </div>
  ),
};

/**
 * Welches Zeichen welche Handlung meint. Der Schlüssel sagt, was passiert —
 * nicht, wie es aussieht: `remove` und `close` sind dasselbe Zeichen und
 * trotzdem zwei Namen, weil eine Liste kürzen und ein Fenster zumachen zwei
 * Dinge sind.
 */
export const Actions: Story = {
  render: () => (
    <div style={page}>
      <Section
        title="Handlung und Hinweis"
        lead={
          <>
            <span className="lw-numeric">{Object.keys(ACTION_ICON).length}</span> Bedeutungen, je ein Zeichen.
            Ein Zustand steht nicht dabei: ein Prüfergebnis ist <code className="lw-mono">StateIcon</code>{" "}
            (<code className="lw-mono">Review.tsx</code>), ein Status ist{" "}
            <code className="lw-mono">StatusBadge</code> mit der Farbe aus der Status-Registry.
          </>
        }
      >
        <Table entries={Object.entries(ACTION_ICON) as [string, IconEntry][]} />
      </Section>

      <Section
        title="Ein Zeichen, zwei Namen"
        lead="Warum die Registry nach Bedeutung schlüsselt und nicht nach Aussehen."
      >
        <div style={{ display: "flex", gap: "var(--space-8)" }}>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <ActionIcon action="remove" size={16} />
            <div>
              <div className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)" }}>remove</div>
              <div style={note}>nimmt eine Zeile aus einer Auswahl — nichts wird gelöscht</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <ActionIcon action="close" size={16} />
            <div>
              <div className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)" }}>close</div>
              <div style={note}>macht Dialog oder Drawer zu</div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Die Leiter"
        lead="Größe nur aus A8: produktiv 12/14/16, lesend 16/20/24. Strich immer 1.5 — beides setzt die Komponente, nicht der Aufrufer."
      >
        <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-end" }}>
          {([12, 14, 16, 20, 24] as const).map((size) => (
            <div key={size} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", alignItems: "center" }}>
              <EntityIcon entity="accounting-case" size={size} />
              <span className="lw-mono lw-numeric" style={{ fontSize: "var(--fs-ui-xs)" }}>{size}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Nur in Stories"
        lead="Diese Zeichen importieren ausschließlich Stories — sie zeigen etwas, sie liefern es nicht aus. Wer eins davon in eine Komponente holt, gibt ihm vorher in der Registry einen Namen; `pnpm check:icons` besteht darauf."
      >
        <div className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)" }}>
          <span className="lw-numeric">{ONLY_IN_STORIES.length}</span> · {ONLY_IN_STORIES.join(", ")}
        </div>
      </Section>
    </div>
  ),
};

/* ── WithWord ─────────────────────────────────────────────────────────── */

const T8_CONDITIONS = [
  "die Handlung ist konventionell und ohne Vorwissen erkennbar (schließen, blättern, auf-/zuklappen)",
  "sie ist umkehrbar und folgenlos",
  "sie ist nicht der einzige Weg: ein beschrifteter zweiter existiert",
];

function Case({ verdict, title, children, why }: { verdict: "richtig" | "Ausnahme" | "falsch"; title: string; children: ReactNode; why: ReactNode }) {
  const tone = verdict === "falsch" ? "danger" : verdict === "Ausnahme" ? "warning" : "success";
  return (
    <div style={{ border: "var(--border-1)", borderRadius: "var(--radius-md)", padding: "var(--space-5)", flex: 1, minWidth: 0 }}>
      <Mark tone={tone}>{verdict}</Mark>
      <div style={{ fontSize: "var(--fs-ui-md)", fontWeight: 600, margin: "var(--space-3) 0" }}>{title}</div>
      <div style={{ marginBottom: "var(--space-4)" }}>{children}</div>
      <div style={{ fontSize: "var(--fs-ui-sm)", color: "var(--color-text-muted)" }}>{why}</div>
    </div>
  );
}

/** Kein Icon ohne Wort — mit der einen benannten Ausnahme, wörtlich. */
export const WithWord: Story = {
  render: () => (
    <div style={page}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        Die Zielgruppe öffnet Ludwig alle zwei bis vier Wochen. Was sie sich zwischen den Sitzungen merken müsste,
        merkt sie sich nicht — deshalb trägt <strong>jedes Icon ein Wort</strong> (T8, V7, V14).
      </p>
      <div style={{ display: "flex", gap: "var(--space-5)", alignItems: "stretch", marginBottom: "var(--space-8)" }}>
        <Case
          verdict="richtig"
          title="Icon und Wort"
          why="Das Wort trägt die Bedeutung, das Icon beschleunigt das Wiederfinden. So sieht der Normalfall aus."
        >
          <Button variant="primary" icon={<Check size={14} strokeWidth={1.5} />}>Beleg prüfen</Button>
        </Case>
        <Case
          verdict="Ausnahme"
          title="IconButton — nur wenn alle drei gelten"
          why={
            <>
              <ol style={{ margin: 0, paddingLeft: "var(--space-5)" }}>
                {T8_CONDITIONS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
              <p style={{ margin: "var(--space-3) 0 0" }}>
                <code className="lw-mono">label</code> bleibt Pflicht und wird <code className="lw-mono">aria-label</code>{" "}
                <strong>und</strong> <code className="lw-mono">title</code> — das Wort ist nicht weg, es ist
                umgezogen.
              </p>
            </>
          }
        >
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <IconButton label="Schließen" icon={<X size={16} strokeWidth={1.5} />} />
            <IconButton label="Vorheriger Beleg" icon={<ChevronLeft size={16} strokeWidth={1.5} />} />
            <IconButton label="Nächster Beleg" icon={<ChevronRight size={16} strokeWidth={1.5} />} />
          </div>
        </Case>
        <Case
          verdict="falsch"
          title="Icon allein"
          why={
            <>
              Löschen ist schreibend und nicht umkehrbar — Bedingung 2 reißt. Ebenso das Kebab-Menü: es fällt
              nicht unter die Ausnahme, mehrere Zeilenhandlungen gehen an{" "}
              <code className="lw-mono">OverflowMenu</code> mit sichtbarem Wort.
            </>
          }
        >
          <IconButton label="Löschen" icon={<Trash2 size={16} strokeWidth={1.5} />} />
        </Case>
      </div>

      <Section
        title="Keine Emoji, keine Unicode-Zeichen"
        lead={"Erlaubt als Text sind · – — … „“ %. Alles, was Bedeutung trägt — Haken, Kreuz, Pfeil, Warnzeichen, Punkt —, ist ein Lucide-Icon (T9)."}
      >
        <div style={{ display: "flex", gap: "var(--space-10)" }}>
          <div>
            <Mark tone="danger">verboten</Mark>
            <div style={{ fontSize: "var(--fs-ui-lg)", marginTop: "var(--space-3)", letterSpacing: "0.2em" }}>
              <span aria-hidden>&#10003; &#10007; &#9888; &#9679;</span>
            </div>
            <div style={note}>als Bedeutungsträger in Knopf, Plakette, Leerzustand, Zelle</div>
          </div>
          <div>
            <Mark tone="success">stattdessen</Mark>
            <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-3)", alignItems: "center", height: "var(--space-8)" }}>
              <Check size={16} strokeWidth={1.5} />
              <X size={16} strokeWidth={1.5} />
              <AlertTriangle size={16} strokeWidth={1.5} />
              <Circle size={16} strokeWidth={1.5} />
            </div>
            <div style={note}>immer mit dem Wort daneben</div>
          </div>
        </div>
      </Section>
    </div>
  ),
};

/* ── InUse ────────────────────────────────────────────────────────────── */

/**
 * Vier Aufrufer, eine Quelle. Keiner dieser Bausteine importiert ein Zeichen
 * selbst: die Zeilenaktionen fragen die Registry nach `open`, `peek` und
 * `more`, der Aktenkopf nach dem Zeichen des Sachverhalts, der Status-Chip
 * holt seins über die Achse, und der Schließen-Knopf nimmt `close`. Ändert
 * sich ein Zeichen, ändert es sich hier an allen vier Stellen zugleich.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ ...page, display: "grid", gap: "var(--space-8)", maxWidth: "var(--container-wide)" }}>
      <Section
        title="Zeilenaktionen"
        lead="Drei Wege aus einer Tabellenzeile: zum Objekt, im Drawer nachschlagen, der Rest im Menü. Jedes Zeichen mit Wort (T8)."
      >
        <RowActions>
          <TextButton icon={<ActionIcon action="open" size={12} />}>Öffnen</TextButton>
          <TextButton icon={<ActionIcon action="peek" size={12} />}>Nachschlagen</TextButton>
          <TextButton icon={<ActionIcon action="more" size={12} />}>Mehr</TextButton>
        </RowActions>
      </Section>

      <Section
        title="Aktenkopf"
        lead="Das Zeichen der Entität als Kachel — dasselbe, das die Sidebar und jede Zelle tragen."
      >
        <EntityHeader
          icon={<EntityIcon entity="accounting-case" size={20} />}
          overline="Sachverhalt · 2026-0815"
          title="Eingangsrechnung: Musterfirma GmbH"
          status={<StatusBadge axis="sachverhalt" status="open" info={false} />}
        />
      </Section>

      <Section
        title="Status-Chip und Schließen"
        lead="Der Chip holt sein Entitäts-Zeichen über die Achse aus derselben Registry; der Knopf nimmt `close` — nicht `remove`, denn hier geht ein Fenster zu."
      >
        <div style={{ display: "flex", gap: "var(--space-5)", alignItems: "center" }}>
          <StatusBadge axis="beleg" status="in_progress" info={false} />
          <StatusBadge axis="sachverhalt" status="needs_clarification" info={false} />
          <IconButton label="Schließen" icon={<ActionIcon action="close" size={14} />} />
        </div>
      </Section>
    </div>
  ),
};
