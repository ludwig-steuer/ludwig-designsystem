import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
import { Button } from "../primitives/Button";
import { CopyTextButton } from "../primitives/CopyTextButton";
import { Card, CardHead } from "../primitives/Table";
import { DetailPane, MasterDetail } from "./MasterDetail";
import { Checklist, ChecklistItems, Messages, CheckItems, CheckResult, StateIcon, checkSummary, type CheckItem, type ChecklistRow } from "./Review";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof Checklist> = { title: "v3/Patterns/Prüfen/Checklist", component: Checklist };
export default meta;
type Story = StoryObj<typeof Checklist>;

const ROWS: ChecklistRow[] = [
  { key: "1", state: "done", label: "Bank ist vollständig eingelesen", counter: "8 von 8", progress: 1 },
  { key: "2", state: "done", label: "Alle Belege des Zeitraums zugeordnet", counter: "94 von 94", progress: 1 },
  {
    key: "3",
    state: "warning",
    label: "Buchungsvorschläge geprüft",
    counter: "106 von 118",
    progress: 106 / 118,
    jump: "Schritt 3: Vorschläge",
  },
  {
    key: "4",
    state: "error",
    label: "Bank geht auf",
    counter: "1 offen",
    counterAlarm: true,
    jump: "Schritt 4: Zahlungen",
  },
  { key: "5", state: "question", label: "Fragen an den Mandanten beantwortet", counter: "0 von 2", progress: 0, jump: "Schritt 2: Rückfragen" },
  { key: "6", state: "open", label: "Konventionen entschieden", counter: "1 von 3", progress: 1 / 3, jump: "Schritt 7: Konventionen" },
];

/**
 * Die Prüfliste eines Gates: Prüfung · Stand · Fortschritt · Sprung. Der
 * Stand nennt die **echte** Menge — nie eine erfundene „0 von 1".
 */
export const Filled: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | undefined>("4");
    const row = ROWS.find((z) => z.key === sel);
    return (
      <MasterDetail
        list={<Checklist rows={ROWS} activeKey={sel} onPick={setSel} />}
        detail={
          <DetailPane title={row?.label} sub={row?.counter}>
            {row ? (
              <>
                <p style={{ fontSize: "var(--fs-ui)", lineHeight: 1.6, margin: "0 0 14px" }}>
                  Auszug 8 vom 29.08. weicht um 12,40 € vom gebuchten Saldo ab.
                </p>
                <Button variant="primary" size="sm" hotkey="A">
                  Quittieren
                </Button>
              </>
            ) : null}
          </DetailPane>
        }
      />
    );
  },
};

/** Alles passed — der Leerzustand ist hier ein Erfolg, kein Nichts. */
export const AllPassed: Story = {
  render: () => (
    <Checklist
      rows={ROWS.map((z) => ({ ...z, state: "done", counterAlarm: false, jump: undefined }))}
    />
  ),
};

/**
 * Noch nichts gerechnet: die Prüfungen stehen, aber keine ist gelaufen — die
 * Zähler bleiben leer statt zu raten. Das ist **nicht** der Ladezustand,
 * sondern ein Ergebnis; deshalb heißt die Story so und nicht `Loading`
 * (0109).
 */
export const NotCounted: Story = {
  render: () => (
    <Checklist
      rows={ROWS.map((z) => ({ ...z, state: "open", counter: undefined, progress: null }))}
    />
  ),
};

/**
 * Während die Prüfungen laufen: der Spaltenkopf steht, die Zeilen sind
 * Flächen in ihrer Zahl. Ohne das las sich die leere Tabelle wie „alles
 * offen, nichts getan" — das Gegenteil dessen, was gerade passiert (0109).
 */
export const Loading: Story = {
  render: () => <Checklist rows={ROWS} loading />,
};

/** Ohne bekannte Zeilen sind es vier Flächen — die Karte fällt nicht zusammen. */
export const LoadingEmpty: Story = {
  render: () => <Checklist rows={[]} loading />,
};

/**
 * Die Liste vor der Übergabe, für jemanden ohne Systemwissen: keine Prüfung
 * hat einen Anteil, also fehlt die Spalte „Fortschritt" — sie wäre auf jeder
 * Zeile leer —, und die letzte Spalte sagt, wohin es geht (0228).
 */
export const WithoutProgress: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | undefined>("4");
    return (
      <Checklist
        rows={ROWS.map((z) => ({ ...z, progress: undefined }))}
        activeKey={sel}
        onPick={setSel}
        without={["progress"]}
        jumpHeader="Weiter zu"
      />
    );
  },
};

/** Dieselbe Liste, während sie rechnet: vier Spalten auch im Ladezustand, nichts springt (0228). */
export const WithoutProgressLoading: Story = {
  render: () => <Checklist rows={ROWS} loading without={["progress"]} jumpHeader="Weiter zu" />,
};

/**
 * Übergeben (0230, owner 2026-10-27): every row folds its items open right
 * under itself, several at once; a row without items has no chevron. Row and
 * „Weiter zu" stay as they were; the content is `ChecklistItems`.
 */
const HANDOVER: ChecklistRow[] = [
  {
    key: "taken-over",
    state: "error",
    label: "Nichts übernommen",
    counter: "0 von 42",
    counterAlarm: true,
    jump: "Buchungen",
    detail: (
      <ChecklistItems
        items={[
          { text: "Musterfirma GmbH · Bewirtung · 240,40 €", href: "#buchung-1", note: "Ludwig hat den Lauf am 26.10.2026 abgebrochen." },
          { text: "Serverhaus Nord GmbH · Gutschrift · −4,76 €", href: "#buchung-2" },
          { text: "Stadtwerke Musterstadt · Strom Oktober · 86,20 €", href: "#buchung-3" },
        ]}
        more={39}
        actions={
          <Button variant="secondary" size="sm">
            Zurück an Ludwig
          </Button>
        }
      />
    ),
  },
  {
    key: "documents",
    state: "warning",
    label: "1 Beleg ohne Entscheidung",
    jump: "Belege",
    detail: (
      <ChecklistItems
        items={[{ text: "Gutschrift G0012345 · Serverhaus Nord GmbH · 12.01.2026", href: "#beleg", note: "Ludwig hat nicht gebucht: Werte fehlen." }]}
        actions={
          <Button variant="secondary" size="sm" href="#belege">
            Zu Belege
          </Button>
        }
      />
    ),
  },
  {
    key: "questions",
    state: "warning",
    label: "1 Rückfrage offen",
    jump: "Rückfragen",
    detail: <ChecklistItems items={[{ text: "Bewirtung oder Reisekosten? Beleg nennt beides", href: "#frage" }]} />,
  },
  {
    key: "waiting",
    state: "info",
    label: "1 Buchung wartet auf eine Rückfrage oder den Mandanten",
    jump: "Für den Mandanten",
    detail: <ChecklistItems items={[]} />,
  },
  {
    key: "client",
    state: "done",
    label: "Fragen an den Mandanten verschickt",
    counter: "2 von 2",
  },
  {
    key: "done",
    state: "open",
    label: "7 von 12 Prüfungen in Ordnung",
    counter: "7 von 12",
    detail: (
      <ChecklistItems
        items={[
          { text: "Summe der Buchungen gleich Summe der Belege" },
          { text: "Jeder Beleg hat eine Buchung" },
          { text: "Bank geht auf", note: "Auszug 8 vom 29.08.2026 weicht um 12,40 € ab." },
          { text: "Steuerschlüssel passt zum Beleg" },
          { text: "Keine Dublette im Stapel" },
        ]}
      />
    ),
  },
];

export const Expandable: Story = {
  render: () => <Checklist without={["progress"]} jumpHeader="Weiter zu" rows={HANDOVER} />,
};

/** While the checks run: the chevron track stands in the loading rows too, so „Prüfung" does not move when they arrive (0230). */
export const ExpandableLoading: Story = {
  render: () => <Checklist without={["progress"]} jumpHeader="Weiter zu" rows={HANDOVER} loading />,
};

/** Die neun Zustands-Icons — Lucide statt Sonderzeichen (V7). */
export const StateIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: "var(--fs-ui-sm)" }}>
      {(["open", "done", "edited", "returned", "question", "skipped", "warning", "error", "info"] as const).map(
        (s) => (
          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <StateIcon state={s} />
            {s}
          </span>
        ),
      )}
    </div>
  ),
};

/**
 * Twelve checks of a thin entry — questions and reasons verbatim from the
 * reported case. No number or name is real; what is real is the
 * **distribution**: nothing was checkable.
 */
const NOT_CHECKABLE: CheckItem[] = [
  ["P-BETRAG", "Stimmt der gebuchte Betrag mit dem Beleg überein?", "Kein Belegbetrag hinterlegt — nicht vergleichbar."],
  ["P-BELEG", "Stimmt die Belegnummer mit dem Beleg überein?", "Auf dem Beleg ist keine Nummer erkannt."],
  ["P-BELEGFELD-PERIODE", "Folgt das Belegfeld der Schreibweise dieses Mandanten?", "Für diesen Mandanten ist keine Schreibweise hinterlegt."],
  ["P-KONTO", "Passt das Sachkonto zur Leistung?", "Für diese Gegenpartei gibt es keine Vorbuchung."],
  ["P-KONTO-NEU", "Wird dieses Konto erstmals bebucht?", "Konto wird bei dieser Gegenpartei erstmals bebucht."],
  ["P-UST", "Passt der Steuerschlüssel zum ausgewiesenen Steuersatz?", "Auf dem Beleg ist kein Steuersatz erkannt — nicht vergleichbar."],
  ["P-13B", "Ist die Umkehr der Steuerschuld richtig behandelt?", "Ob § 13b greift, ist am Beleg nicht vermerkt."],
  ["P-EMPFAENGER", "Ist der Mandant der Rechnungsempfänger?", "Der Rechnungsempfänger ist nicht ausgelesen."],
  ["P-LEISTUNG", "Liegt der Leistungszeitraum in dieser Periode?", "Kein Leistungszeitraum am Beleg."],
  ["P-REGEL-BETRAG", "Entspricht der Betrag der hinterlegten Regel?", "Für diesen Sachverhalt greift keine Regel."],
  ["P-VORMONAT", "Wurde im Vormonat gleich gebucht?", "Im Vormonat gab es hier keine Buchung."],
  ["P-JUDGE", "Was sagt der Judge zu diesem Satz?", "Kein Judge-Verdikt — ungeprüft ist nicht dasselbe wie unauffällig."],
].map(([code, question, reason]) => ({ code: code!, question: question!, reason: reason!, state: "open" as const }));

/**
 * Drei Gruppen nebeneinander: rot und gelb **einzeln**, bestandene in einer
 * Zeile, nicht prüfbare in einer zweiten. Was zu tun ist, steht oben.
 */
export const CheckItemsMixed: Story = {
  render: () => (
    <div className="v2card">
      <CheckItems
        items={[
          { code: "P01", question: "Ist der Beleg lesbar?", reason: "OCR ohne Fehlstellen.", state: "green" },
          { code: "P02", question: "Stimmt das Datum zum Zeitraum?", reason: "21.08.2026 liegt in 08/2026.", state: "green" },
          { code: "P03", question: "Ist die Gegenpartei bekannt?", reason: "Bürobedarf GmbH, 14 Vorbelege.", state: "green" },
          {
            code: "P07",
            question: "Passt der Steuerschlüssel zum Beleg?",
            reason: "Beleg weist 7 % aus, gebucht wurde BU 9 (19 %).",
            state: "red",
            jump: <button type="button" className="v2link">Zum Satz</button>,
          },
          {
            code: "P12",
            question: "Weicht der Betrag von der Regel ab?",
            reason: "1.800,00 € gegen Ø 1.700,00 € aus 3 Vormonaten = +6 %.",
            state: "yellow",
            gate: <input type="checkbox" className="v2check" aria-label="P12 quittieren" />,
          },
          {
            code: "P19",
            question: "Ist ein Zahlungsnachweis vorhanden?",
            reason: "Noch keine Auszugszeile zugeordnet.",
            state: "open",
            jump: <button type="button" className="v2link">Zu Schritt 4</button>,
          },
          {
            code: "P21",
            question: "Ist der Mandant der Rechnungsempfänger?",
            reason: "Der Rechnungsempfänger ist nicht ausgelesen.",
            state: "open",
          },
        ]}
      />
    </div>
  ),
};

/**
 * **Der gemeldete Fall** (Owner, 2026-09-09, an einem echten Journal-Satz):
 * zwölf Prüfungen, und **keiner** konnte laufen. Kein Belegbetrag, keine
 * Belegnummer, kein Steuersatz, kein Judge-Verdikt.
 *
 * Bis 0148 standen dafür zwölf Zeilen da. Jetzt ist es **eine** — und
 * aufgeklappt stehen die zwölf mit ihrer Begründung.
 *
 * Das Zeichen ist bewusst **nicht** der Haken der bestandenen Punkte: „nicht
 * prüfbar" ist keine Aussage über den Satz, sondern über die Datenlage. Einer
 * der Punkte sagt das selbst — „ungeprüft ist nicht dasselbe wie unauffällig".
 */
export const CheckItemsAllOpen: Story = {
  render: () => (
    <div className="v2card">
      <CheckItems items={NOT_CHECKABLE} />
    </div>
  ),
};

/** Alle passed: eine Zeile, kein Scrollen durch zwanzig grüne Haken. */
export const CheckItemsAllGreen: Story = {
  render: () => (
    <div className="v2card">
      <CheckItems
        items={Array.from({ length: 12 }, (_, i) => ({
          code: `P${String(i + 1).padStart(2, "0")}`,
          question: "Beispielprüfung",
          reason: "In Ordnung.",
          state: "green" as const,
        }))}
      />
    </div>
  ),
};

/** Keine Prüfungen — auch das ist eine Aussage, kein leerer Kasten. */
export const CheckItemsEmpty: Story = {
  render: () => (
    <div className="v2card">
      <CheckItems items={[]} />
    </div>
  ),
};

const FACTS: CheckItem[] = [
  {
    code: "business_use",
    question: "Leistung für das Unternehmen",
    reason: "Lieferadresse privat, Leistungsbeschreibung betrieblich — Ludwig ist unsicher.",
    state: "yellow",
    result: <StatusBadge axis="input_tax_fact" status="uncertain" info={false} />,
    origin: { actor: "Ludwig", fields: ["client_invoices.delivery_address"] },
  },
  {
    code: "service_date",
    question: "Leistungsdatum",
    reason: "Kein Datum auf der Rechnung gefunden.",
    state: "yellow",
    result: <StatusBadge axis="input_tax_fact" status="unknown" info={false} />,
    origin: { actor: "abgeleitet", fields: ["client_invoices.service_date"] },
  },
  {
    code: "reverse_charge",
    question: "Steuerschuldnerschaft des Empfängers (§ 13b)",
    reason: "Kein Hinweis auf § 13b, Lieferant im Inland.",
    state: "green",
    result: <StatusBadge axis="input_tax_fact" status="no" info={false} />,
    origin: { actor: "abgeleitet", fields: ["client_invoices.reverse_charge"] },
  },
  {
    code: "hospitality",
    question: "Bewirtung",
    reason: "Bauleistung, keine Bewirtung.",
    state: "green",
    result: <StatusBadge axis="input_tax_fact" status="not_applicable" info={false} />,
    origin: { actor: "Kanzlei" },
  },
];

/**
 * Size M — the shape „fact" (0206): each item answers with a word and says who
 * set it; its key and source fields stand under „Technisch" (T4). Settled facts
 * fold into one line, open ones stand alone.
 */
export const CheckItemsFacts: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <CheckItems items={FACTS} kind="fact" />
    </div>
  ),
};

/**
 * Size XS — `checkSummary`: the counts in one line, worst first, per kind. For
 * the head of a report (the verdict's title) or an overview.
 */
export const CheckSummaryLine: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-2)" }}>
      <span>{checkSummary(FACTS, "fact")}</span>
      <span>
        {checkSummary([
          { code: "VST-06", question: "", reason: "", state: "red" },
          { code: "VST-03", question: "", reason: "", state: "yellow" },
          { code: "VST-01", question: "", reason: "", state: "green" },
          { code: "VST-02", question: "", reason: "", state: "green" },
        ])}
      </span>
      <span>{checkSummary([...rule("red", 1), ...rule("running", 3), ...rule("green", 6)])}</span>
    </div>
  ),
};

const rule = (state: CheckItem["state"], n: number): CheckItem[] =>
  Array.from({ length: n }, (_, i) => ({ code: `P${state}${i}`, question: "Beispielprüfung", reason: "In Ordnung.", state }));

/**
 * `CheckResult` (0217) in every tone, side by side — the line of a list row.
 * Red and yellow colour the words, green only the sign; nothing checkable says
 * so instead of „0 von 12"; the title carries every count. First the rules
 * (red · yellow · green · not checkable · none), then the facts in the same
 * order of tones („widersprüchlich", „zu klären", „geklärt", „nicht erhoben",
 * „Keine Fakten").
 */
export const CheckResultTones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: 360 }}>
      <CheckResult items={[...rule("red", 1), ...rule("yellow", 2), ...rule("green", 9)]} />
      <CheckResult items={[...rule("yellow", 1), ...rule("green", 6), ...rule("open", 1)]} />
      <CheckResult items={[...rule("green", 7), ...rule("open", 1)]} />
      <CheckResult items={NOT_CHECKABLE} />
      <CheckResult items={[]} />
      <CheckResult items={[...rule("red", 1), ...rule("green", 3)]} kind="fact" />
      <CheckResult items={FACTS} kind="fact" />
      <CheckResult items={rule("green", 4)} kind="fact" />
      <CheckResult items={rule("open", 3)} kind="fact" />
      <CheckResult items={[]} kind="fact" />
      <CheckResult items={[...rule("red", 1), ...rule("running", 3), ...rule("green", 6)]} />
    </div>
  ),
};

/* ── 0270: while the checks run, a button per item ─────────────────────
 * The readiness check of the extension „Ludwig DUO-Connect" (plugin spec C6),
 * ten items with citable short codes BP-01 … BP-10 (open question 3). */

type Readiness = Omit<CheckItem, "state" | "reason"> & { done: Pick<CheckItem, "state" | "reason" | "action" | "jump"> };

const reconnect = <Button size="xs" variant="secondary">Neu verbinden</Button>;
const openDatev = <Button size="xs" variant="secondary">DATEV öffnen</Button>;
const guide = <Button size="xs" variant="tertiary">Anleitung</Button>;
const confirmDone = <Button size="xs" variant="secondary">Erledigt</Button>;

const READINESS: Readiness[] = [
  { code: "BP-01", question: "Ist die Erweiterung aktuell?", done: { state: "green", reason: "Version 0.11.0 ist die aktuelle." } },
  { code: "BP-02", question: "Ist Ludwig erreichbar?", done: { state: "green", reason: "Ludwig hat in 180 ms geantwortet." } },
  { code: "BP-03", question: "Ist die Erweiterung mit Ludwig verbunden?", done: { state: "red", reason: "Die Verbindung ist am 26.11.2026 abgelaufen.", action: reconnect } },
  { code: "BP-04", question: "Haben die Mandanten eine DATEV-Mandantennummer?", done: { state: "green", reason: "Alle 12 Mandanten sind vollständig." } },
  { code: "BP-05", question: "Ist DATEV erreichbar?", done: { state: "open", reason: "Lässt sich ohne geöffnetes DATEV-Fenster nicht prüfen.", action: openDatev } },
  { code: "BP-06", question: "Sind Sie bei DATEV angemeldet?", done: { state: "open", reason: "Lässt sich ohne geöffnetes DATEV-Fenster nicht prüfen.", action: openDatev } },
  { code: "BP-07", question: "Ist der Mandant in DATEV zugänglich?", done: { state: "open", reason: "Nur bei „Gründlich prüfen“: öffnet einen DATEV-Tab." } },
  { code: "BP-08", question: "Ist das Pop-up für DATEV erlaubt?", done: { state: "open", reason: "Edge fragt die Freigabe nicht ab; bitte einmal bestätigen.", jump: guide, action: confirmDone } },
  { code: "BP-09", question: "Sind die Einstellungen von Ludwig geladen?", done: { state: "green", reason: "Vom Server geladen um 09:12.", jump: <Button size="xs" variant="tertiary">Einstellungen ansehen</Button> } },
  { code: "BP-10", question: "Läuft kein anderer Abgleich?", done: { state: "green", reason: "Keine zweite Seite offen." } },
];

const RUNNING_REASON: Record<string, string> = {
  "BP-05": "DATEV wird angefragt.",
  "BP-06": "DATEV wird angefragt.",
  "BP-07": "DATEV wird angefragt.",
  "BP-08": "Die Freigabe des Browsers wird gelesen.",
};

/** The items after the check, or with `running` for the codes given. */
function readiness(running: ReadonlySet<string> = new Set()): CheckItem[] {
  return READINESS.map(({ done, ...rest }) =>
    running.has(rest.code) ? { ...rest, state: "running", reason: RUNNING_REASON[rest.code] ?? "Wird geprüft." } : { ...rest, ...done },
  );
}

/**
 * 0270 rule 1 and 2 — mid-check: four items run, nothing is folded, every
 * item stands in the order given; BP-03 has its result already, with its
 * button.
 */
export const CheckItemsRunning: Story = {
  render: () => (
    <div className="v2card" style={{ maxWidth: "var(--container-narrow)" }}>
      <CheckItems items={readiness(new Set(["BP-05", "BP-06", "BP-07", "BP-08"]))} />
    </div>
  ),
};

/**
 * 0270 rule 3 — after the check: the finding first, then every item with a
 * button (also the not checkable ones: a button in a closed fold-out is
 * none), then „5 von 6 Prüfungen bestanden" and „1 Prüfung nicht prüfbar".
 * BP-08 carries both: the jump „Anleitung" and the button „Erledigt".
 */
export const CheckItemsWithAction: Story = {
  render: () => (
    <div className="v2card" style={{ maxWidth: "var(--container-narrow)" }}>
      <CheckItems items={readiness()} />
    </div>
  ),
};

function ReadinessDemo() {
  const [running, setRunning] = useState<ReadonlySet<string>>(new Set());
  const [said, setSaid] = useState<string[]>([]);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (running.size === 0) return;
    const next = [...running][0]!;
    const t = window.setTimeout(() => setRunning((r) => new Set([...r].filter((c) => c !== next))), 600);
    return () => window.clearTimeout(t);
  }, [running]);
  useEffect(() => {
    const region = host.current?.querySelector('[role="status"]');
    if (!region) return;
    const mo = new MutationObserver(() => setSaid((l) => [...l, region.textContent ?? ""]));
    mo.observe(region, { childList: true, characterData: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  const items = readiness(running);
  return (
    <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: "var(--container-narrow)" }}>
      <Card>
        <CardHead
          title="Alles bereit?"
          sub={running.size > 0 ? "Prüfung läuft" : checkSummary(items)}
          actions={
            <>
              <Button size="sm" variant="secondary" onClick={() => setRunning(new Set(READINESS.map((r) => r.code)))}>
                Erneut prüfen
              </Button>
              <CopyTextButton
                size="sm"
                label="Bericht kopieren"
                text={items.map((i) => `${i.code} ${i.question} — ${i.state}`).join("\n")}
              />
            </>
          }
        />
        <div ref={host}>
          <CheckItems items={items} live />
        </div>
      </Card>
      <div className="lw-ui-hint" data-testid="region-log">
        Live-Region jetzt: „{running.size > 0 ? "Prüfung läuft." : checkSummary(items)}“ · Änderungen seit Laden: {said.length}
        {said.length ? ` (${said.join(" → ")})` : ""}
      </div>
    </div>
  );
}

/**
 * 0270 rule 2 and 5 in use: „Erneut prüfen" sets every item to `running`, the
 * results arrive one by one in place, and only when the last is done the list
 * folds once. The live region speaks twice — „Prüfung läuft." and the summary.
 */
export const ReadinessCheckInUse: Story = { render: () => <ReadinessDemo /> };

/** Fehler blockieren, Warnungen brauchen eine Quittung, Hinweise stehen nur da. */
export const MessagesThreeLevels: Story = {
  render: () => (
    <Messages
      items={[
        {
          key: "e1",
          level: "error",
          text: "Soll und Haben gehen um 12,40 € auseinander. Der Satz lässt sich nicht speichern.",
        },
        {
          key: "w1",
          level: "warning",
          text: "Konto 6600 wurde in diesem Zeitraum erstmals bebucht.",
          actions: (
            <>
              <button type="button" className="v2link">Kontenblatt</button>
              <button type="button" className="v2link">Quittieren</button>
            </>
          ),
        },
        {
          key: "h1",
          level: "hint",
          text: "Der Vorschlag stammt aus der Konvention „Bewirtung 70 %“ vom 12.08.2026.",
        },
      ]}
    />
  ),
};
