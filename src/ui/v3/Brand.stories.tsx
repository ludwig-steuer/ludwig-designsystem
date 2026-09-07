import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";

/**
 * Brand (0056) — no component, no new file. The three marks live in
 * `reference/design-system-v2/assets/`, which Storybook serves as a static
 * directory; this story loads them from there as images and writes down the
 * rule nobody had: which variant on which ground, how small, and what one
 * does not do with the sign.
 *
 * Nothing here is copied, moved or changed — `reference/` stays the template.
 */
const meta: Meta = { title: "v3/Grundlagen/Marke" };
export default meta;
type Story = StoryObj;

const ASSETS = "/reference/design-system-v2/assets";
const WORDMARK = `${ASSETS}/ludwig-logo.svg`;
/**
 * Die **Dateien**, die den Namen als Text schreiben — **gerechnet**, nicht
 * abgeschrieben: die erste Fassung nannte drei Dateien, es waren vier, und mit
 * `CaseDetailView` sind es fünf. Eine Liste, die von Hand gepflegt wird,
 * veraltet mit dem nächsten Commit.
 */
const LOGO_TEXT_SOURCES = import.meta.glob("./**/*.stories.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const LOGO_TEXT_STORIES = Object.keys(LOGO_TEXT_SOURCES)
  .filter((path) => {
    const src = LOGO_TEXT_SOURCES[path];
    return (
      typeof src === "string" &&
      src.includes("sb__logo") &&
      !path.endsWith("Brand.stories.tsx")
    );
  })
  .map((path) => path.split("/").pop() as string)
  .sort();

const WORDMARK_LIGHT = `${ASSETS}/ludwig-logo-light.svg`;
const MARK = `${ASSETS}/ludwig-mark.svg`;

/* ── Shared bits ──────────────────────────────────────────────────────── */

const page: CSSProperties = { maxWidth: "var(--container-base)" };
const note: CSSProperties = {
  fontSize: "var(--fs-ui-xs)",
  color: "var(--color-text-subtle)",
};

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: "var(--space-10)" }}>
      <h3 className="lw-h4" style={{ margin: 0 }}>
        {title}
      </h3>
      <p
        className="lw-caption"
        style={{
          margin: "var(--space-1) 0 var(--space-5)",
          maxWidth: "var(--content-measure)",
        }}
      >
        {lead}
      </p>
      {children}
    </section>
  );
}

function Mark({
  tone,
  children,
}: {
  tone: "danger" | "success";
  children: ReactNode;
}) {
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

/** A ground to stand a mark on: page white, brand dark, or the sidebar. */
function Ground({
  kind,
  children,
}: {
  kind: "bg" | "primary" | "sidebar";
  children: ReactNode;
}) {
  const common: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--space-6)",
    borderRadius: "var(--radius-md)",
    minHeight: "var(--space-20)",
  };
  if (kind === "sidebar") {
    return (
      <div className="app__sidebar" style={{ ...common, overflow: "hidden" }}>
        {children}
      </div>
    );
  }
  return (
    <div
      style={{
        ...common,
        background: kind === "bg" ? "var(--color-bg)" : "var(--color-primary)",
        border: kind === "bg" ? "var(--border-1)" : "none",
      }}
    >
      {children}
    </div>
  );
}

const GROUND_LABEL: Record<string, string> = {
  bg: "--color-bg",
  primary: "--color-primary",
  sidebar: "Sidebar-Verlauf (app-chrome.css)",
};

function Plate({
  src,
  alt,
  height,
  ground,
  verdict,
  why,
}: {
  src: string;
  alt: string;
  height: number;
  ground: "bg" | "primary" | "sidebar";
  verdict: "richtig" | "falsch";
  why: string;
}) {
  return (
    <div>
      <Ground kind={ground}>
        {/* Die Höhe als **Stil**, nicht als Attribut: Tailwinds Preflight setzt
            `img { height: auto }`, und eine Autorenregel schlägt jedes
            Präsentations-Attribut — egal, in welcher Reihenfolge die Blätter
            laden. Gemessen stand ein `height={56}` sonst mit 205 px im Bild. */}
        <img src={src} alt={alt} style={{ height, width: "auto" }} />
      </Ground>
      <div
        style={{
          marginTop: "var(--space-2)",
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "center",
        }}
      >
        <Mark tone={verdict === "richtig" ? "success" : "danger"}>
          {verdict}
        </Mark>
        <code className="lw-mono" style={note}>
          {GROUND_LABEL[ground]}
        </code>
      </div>
      <div style={{ ...note, marginTop: "var(--space-1)" }}>{why}</div>
    </div>
  );
}

/**
 * The real sidebar head, cut out of the shell: `.app` gives the 240 px (64 px
 * collapsed) column, `.sb__logo` the 56 px row. No measure is written here —
 * the frame brings its own.
 */
function SidebarHead({
  collapsed,
  children,
}: {
  collapsed?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`app${collapsed ? " app--collapsed" : ""}`}
      style={{ height: "auto", minHeight: 0, width: "fit-content" }}
    >
      <aside className={`app__sidebar${collapsed ? " is-collapsed" : ""}`}>
        <div className="sb__logo">{children}</div>
      </aside>
    </div>
  );
}

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(calc(var(--container-narrow) / 3), 1fr))",
  gap: "var(--space-5)",
};

/* ── Marks ────────────────────────────────────────────────────────────── */

const FILES: { file: string; size: string; use: string }[] = [
  {
    file: "ludwig-logo.svg",
    size: "220 × 56",
    use: "Sidebar-Kopf, Login, Marketing — überall auf hellem Grund",
  },
  {
    file: "ludwig-logo-light.svg",
    size: "220 × 56",
    use: "dieselbe Stelle auf dunklem Grund: Hero, dunkle Sidebar",
  },
  {
    file: "ludwig-mark.svg",
    size: "56 × 56",
    use: "Favicon, App-Icon, Avatar, eingeklappte Sidebar",
  },
];

/** Die drei Zeichen, je auf dem Grund, für den sie gemacht sind. */
export const Marks: Story = {
  render: () => (
    <div style={page}>
      <p
        className="lw-body-sm"
        style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}
      >
        Drei Dateien sind die Marke. Sie liegen unter{" "}
        <code className="lw-mono">reference/design-system-v2/assets/</code> und
        werden von dort geladen — nicht kopiert, nicht nachgebaut. Die Regel
        darunter ist die eigentliche Aussage:{" "}
        <strong>
          das dunkle Wordmark steht nie auf dunklem Grund, die helle Variante
          nie auf hellem.
        </strong>
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "var(--space-8)",
        }}
      >
        <thead>
          <tr>
            {["Datei", "viewBox", "Einsatzort"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "var(--space-2) var(--space-3)",
                  borderBottom: "var(--border-1-strong)",
                  fontSize: "var(--fs-ui-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FILES.map((f) => (
            <tr key={f.file}>
              <td
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  borderBottom: "var(--border-1-subtle)",
                }}
              >
                <code className="lw-mono" style={{ fontSize: "var(--fs-ui)" }}>
                  {f.file}
                </code>
              </td>
              <td
                className="lw-numeric"
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  borderBottom: "var(--border-1-subtle)",
                  fontSize: "var(--fs-ui)",
                }}
              >
                {f.size}
              </td>
              <td
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  borderBottom: "var(--border-1-subtle)",
                  fontSize: "var(--fs-ui)",
                  color: "var(--color-text-muted)",
                }}
              >
                {f.use}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Section
        title="Wordmark"
        lead="Die volle Marke — Zeichen und Wort. Sie steht dort, wo Platz für den Namen ist."
      >
        <div style={grid}>
          <Plate
            src={WORDMARK}
            alt="Ludwig"
            height={40}
            ground="bg"
            verdict="richtig"
            why="der Normalfall"
          />
          <Plate
            src={WORDMARK_LIGHT}
            alt="Ludwig"
            height={40}
            ground="primary"
            verdict="richtig"
            why="die helle Variante trägt einen halbtransparenten Rahmen — sie braucht den dunklen Grund"
          />
          <Plate
            src={WORDMARK_LIGHT}
            alt="Ludwig"
            height={40}
            ground="sidebar"
            verdict="richtig"
            why="derselbe Fall auf dem Verlauf der Sidebar"
          />
        </div>
      </Section>

      <Section
        title="Mark"
        lead="Das quadratische Zeichen ohne Wort — für alles, was klein und quadratisch ist."
      >
        <div style={grid}>
          <Plate
            src={MARK}
            alt="Ludwig"
            height={56}
            ground="bg"
            verdict="richtig"
            why="Favicon, Avatar, App-Icon"
          />
          <Plate
            src={MARK}
            alt="Ludwig"
            height={56}
            ground="primary"
            verdict="richtig"
            why="das Mark bringt seinen eigenen Grund mit und steht auf beiden"
          />
          <Plate
            src={MARK}
            alt="Ludwig"
            height={56}
            ground="sidebar"
            verdict="richtig"
            why="die eingeklappte Sidebar"
          />
        </div>
      </Section>

      <p className="lw-caption" style={{ maxWidth: "var(--content-measure)" }}>
        Die Zeichen tragen zwei Farbwerte, die{" "}
        <code className="lw-mono">tokens.css</code> nicht führt. Das ist Absicht
        und keine Nachlässigkeit: die Marke steht — wie{" "}
        <code className="lw-mono">app-chrome.css</code> — bewusst außerhalb der
        Palette (A5-Ausnahme). Wer sie sucht, findet sie in den SVG-Dateien; ein
        Token dafür wird <strong>nicht</strong> erfunden.
      </p>
    </div>
  ),
};

/* ── Sizes ────────────────────────────────────────────────────────────── */

const MARK_SIZES: { px: number; use: string }[] = [
  { px: 16, use: "Favicon im Browser-Tab" },
  { px: 24, use: "Avatar in der Zeile, kleines App-Icon" },
  { px: 32, use: "eingeklappte Sidebar, großes App-Icon" },
];

/** Wie groß, und ab wann das Mark das Wordmark ersetzt. */
export const Sizes: Story = {
  render: () => (
    <div style={page}>
      <Section
        title="Wordmark im Sidebar-Kopf"
        lead="Die Zeile ist 56 px hoch (.sb__logo). Das Zeichen steht mit Luft darin, es füllt sie nicht aus — links das echte Markup mit dem echten Verlauf."
      >
        <div
          style={{
            display: "flex",
            gap: "var(--space-8)",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <SidebarHead>
              <img
                src={WORDMARK_LIGHT}
                alt="Ludwig"
                style={{ height: 32, width: "auto" }}
              />
            </SidebarHead>
            <div style={{ ...note, marginTop: "var(--space-2)" }}>
              ausgeklappt · 240 px Spalte, 56 px Zeile
            </div>
          </div>
          <div>
            <SidebarHead collapsed>
              <img
                src={MARK}
                alt="Ludwig"
                style={{ height: 32, width: "auto" }}
              />
            </SidebarHead>
            <div style={{ ...note, marginTop: "var(--space-2)" }}>
              eingeklappt · 64 px Spalte
            </div>
          </div>
        </div>
        <p
          className="lw-body-sm"
          style={{
            maxWidth: "var(--content-measure)",
            marginTop: "var(--space-5)",
          }}
        >
          <strong>
            Das Mark ersetzt das Wordmark, sobald der Name nicht mehr passt
          </strong>{" "}
          — heute genau ein Fall: die eingeklappte Sidebar (
          <code className="lw-mono">.is-collapsed</code>). Dort steht bisher der
          Buchstabe „L". Der Buchstabe ist kein Zeichen, sondern ein Platzhalter
          dafür.
        </p>
      </Section>

      <Section
        title="Mark in den Maßen, die es wirklich gibt"
        lead="Favicon und App-Icon geben die Maße vor, nicht das Design. Bei 16 px muss der Bogen noch zu erkennen sein — hier nachsehen, nicht schätzen."
      >
        <div
          style={{
            display: "flex",
            gap: "var(--space-10)",
            alignItems: "flex-end",
          }}
        >
          {MARK_SIZES.map((s) => (
            <div key={s.px}>
              <div
                style={{
                  height: "var(--space-8)",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <img
                  src={MARK}
                  alt="Ludwig"
                  style={{ width: s.px, height: s.px }}
                />
              </div>
              <div
                className="lw-numeric"
                style={{
                  fontWeight: 600,
                  fontSize: "var(--fs-ui)",
                  marginTop: "var(--space-2)",
                }}
              >
                {s.px} px
              </div>
              <div style={note}>{s.use}</div>
            </div>
          ))}
        </div>
        <p
          className="lw-caption"
          style={{
            marginTop: "var(--space-4)",
            maxWidth: "var(--content-measure)",
          }}
        >
          Unter 16 px wird das Mark nicht verkleinert — dort steht kein Zeichen,
          sondern nichts.
        </p>
      </Section>
    </div>
  ),
};

/* ── Misuse ───────────────────────────────────────────────────────────── */

function Pair({
  title,
  why,
  right,
  wrong,
}: {
  title: string;
  why: ReactNode;
  right: ReactNode;
  wrong: ReactNode;
}) {
  return (
    <div style={{ marginBottom: "var(--space-8)" }}>
      {/* Eine echte Überschrift, kein fettes `div`: `Marks` und `Sizes` geben
          ihren Abschnitten über `Section` ein `h3`, und zwei Gliederungen in
          einer Datei sind für eine Vorlesehilfe keine (Abnahme 0056). */}
      <h3
        style={{
          fontSize: "var(--fs-ui-md)",
          fontWeight: 600,
          margin: "0 0 var(--space-1)",
        }}
      >
        {title}
      </h3>
      <div
        className="lw-caption"
        style={{
          marginBottom: "var(--space-3)",
          maxWidth: "var(--content-measure)",
        }}
      >
        {why}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-5)",
          maxWidth: "var(--container-narrow)",
        }}
      >
        <div>
          <Mark tone="success">richtig</Mark>
          <div style={{ marginTop: "var(--space-2)" }}>{right}</div>
        </div>
        <div>
          <Mark tone="danger">falsch</Mark>
          <div style={{ marginTop: "var(--space-2)" }}>{wrong}</div>
        </div>
      </div>
    </div>
  );
}

const plate: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-5)",
  border: "var(--border-1)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-bg)",
  minHeight: "var(--space-20)",
};

/** Fünf Fälle, je neben dem richtigen. Die Marke ist kein Gestaltungselement. */
export const Misuse: Story = {
  render: () => (
    <div style={page}>
      <p
        className="lw-body-sm"
        style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}
      >
        Die Marke ist ein Zeichen, kein Gestaltungselement. Sie wird geladen,
        platziert und in Ruhe gelassen — alles, was man mit ihr „macht", ist ein
        Fehler.
      </p>

      <Pair
        title="Nicht umfärben"
        why={
          "Das Zeichen trägt seine eigenen Farben. Es nimmt keine Semantikfarbe an — schon deshalb, weil Farbe im Set Kritikalität kodiert und eine rote Marke „Fehler“ hieße."
        }
        right={
          <div style={plate}>
            <img
              src={WORDMARK}
              alt="Ludwig-Wortmarke, unverändert"
              style={{ height: 40, width: "auto" }}
            />
          </div>
        }
        wrong={
          <div style={plate}>
            <img
              src={WORDMARK}
              alt="Ludwig-Wortmarke, rot umgefärbt"
              style={{
                height: 40,
                width: "auto",
                filter: "sepia(1) saturate(6) hue-rotate(310deg)",
              }}
            />
          </div>
        }
      />

      <Pair
        title="Nicht verzerren"
        why="Höhe setzen, Breite folgen lassen. Das Seitenverhältnis steht in der viewBox und ist nicht verhandelbar."
        right={
          <div style={plate}>
            <img
              src={WORDMARK}
              alt="Ludwig-Wortmarke, unverzerrt"
              style={{ height: 40, width: "auto" }}
            />
          </div>
        }
        wrong={
          <div style={plate}>
            <img
              src={WORDMARK}
              /* Das Bild **ist** die Aussage: ohne Namen bleibt die
                   wichtigste Tafel der Seite für eine Vorlesehilfe stumm, und
                   „richtig" wie „falsch" hießen beide „Ludwig" (Abnahme
                   0056, M5). */
              alt="Ludwig-Wortmarke, auf 64 % der Breite gestaucht"
              /* **`scaleX`, nicht zwei Maße.** Beide Maße im Stil stauchen
                 nichts: `ludwig-logo.svg` trägt kein `preserveAspectRatio`,
                 also gilt `xMidYMid meet`, und das Bild skaliert in den Kasten
                 **hinein**, statt sich zu strecken — gemessen 100 × 25,5 in
                 einem 100 × 40er Kasten, Verhältnis 2,989 gegen 3,010 im
                 Original. Auch `object-fit: fill` ändert daran nichts. Die
                 Abnahme vom 2026-09-06 hatte den **Kasten** gemessen (2,500)
                 und daraus „staucht" geschlossen; der Kasten ist nicht das
                 Bild. Erst die Transformation staucht wirklich: gemessen
                 1,906, und die Bildmarke wird zum Hochrechteck (Abnahme
                 0056, zweite Runde). */
              style={{
                height: 40,
                width: "auto",
                transform: "scaleX(0.64)",
              }}
            />
          </div>
        }
      />

      <Pair
        title="Nur drei Gründe"
        why={
          <>
            <code className="lw-mono">--color-bg</code>,{" "}
            <code className="lw-mono">--color-primary</code> und der
            Sidebar-Verlauf. Jeder andere Grund — auch eine Semantikfläche — ist
            keiner.
          </>
        }
        right={
          <div style={plate}>
            <img
              src={WORDMARK}
              alt="Ludwig-Wortmarke auf der Grundfläche"
              style={{ height: 40, width: "auto" }}
            />
          </div>
        }
        wrong={
          <div style={{ ...plate, background: "var(--color-warning-bg)" }}>
            <img
              src={WORDMARK}
              alt="Ludwig-Wortmarke auf einer Warnfläche"
              style={{ height: 40, width: "auto" }}
            />
          </div>
        }
      />

      <Pair
        title="Kein Schatten, kein Glow"
        why="Das Zeichen liegt in der Fläche, nicht darüber. Schatten sind für Menü, Popover und Dialog reserviert."
        right={
          <div style={plate}>
            <img
              src={MARK}
              alt="Ludwig-Bildmarke, ohne Schatten"
              style={{ height: 56, width: "auto" }}
            />
          </div>
        }
        wrong={
          <div style={plate}>
            <img
              src={MARK}
              alt="Ludwig-Bildmarke mit Schein darunter"
              style={{
                height: 56,
                width: "auto",
                boxShadow: "var(--glow-accent)",
                borderRadius: "var(--radius-xl)",
              }}
            />
          </div>
        }
      />

      <Pair
        title="Kein Text an Stelle des Zeichens"
        why={
          <>
            Der häufigste Fall, und er steht heute im eigenen Set:{" "}
            {/* „Dateien", nicht „Stories": gezählt wird über die Quelldateien,
                und `AppShell` trägt den Fall zweimal (Abnahme 0056). */}
            <strong>{LOGO_TEXT_STORIES.length} Dateien</strong> schreiben
            „Ludwig" beziehungsweise „L" als Text in den Sidebar-Kopf —{" "}
            {LOGO_TEXT_STORIES.map((f, i) => (
              <span key={f}>
                {i > 0 ? ", " : ""}
                <code className="lw-mono">{f}</code>
              </span>
            ))}
            . Sie bleiben unangetastet, bis die Top-Bar-Füllung gehoben wird;
            hier steht, was dann hingehört.
          </>
        }
        right={
          <SidebarHead>
            <img
              src={WORDMARK_LIGHT}
              alt="Ludwig"
              style={{ height: 32, width: "auto" }}
            />
          </SidebarHead>
        }
        wrong={<SidebarHead>Ludwig</SidebarHead>}
      />
    </div>
  ),
};
