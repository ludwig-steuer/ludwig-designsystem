import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ReactNode } from "react";
import {
  ActionButton,
  ActionIcon,
  Badge,
  Button,
  Card,
  CardHead,
  CardSection,
  CopyTextButton,
  EmptyState,
  ExpandableRow,
  HeadRow,
  LogList,
  Row,
  SearchInput,
  Table,
  TextButton,
  Time,
} from "@/ui/v3";
import { CLIENTS, LOG, LOG_TEXT, SYNC_STATE, type Client, type SyncState } from "./fixtures";
import { DraftsVisible, SupportHelp, supportFacts } from "./drafts";
import { Board as StateBoard, ExtensionShell, Single, type StateSpec } from "./Frame";

const stack = { display: "grid", gap: "var(--space-4)" } as const;
const row = { display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" } as const;

/* ── Data of the history ─────────────────────────────────────────────── */

interface Past {
  at: string;
  state: SyncState;
  summary: string;
}

/** The last syncs per client — invented, newest first. */
function pastRuns(c: Client, i: number): Past[] {
  if (!c.lastSync) return [];
  const issue: Past = { at: "2026-11-20T16:02:00+01:00", state: "succeeded_with_issues", summary: "3 Belege nicht übertragen" };
  const ok = (at: string, n: number): Past => ({ at, state: "succeeded", summary: `${n} Belege übertragen` });
  if (i === 1) return [issue, ok("2026-11-13T15:40:00+01:00", 22), ok("2026-10-30T10:12:00+01:00", 17)];
  if (i === 3) return [{ at: "2026-11-27T08:55:00+01:00", state: "cancelled", summary: "Seite geschlossen" }, ok(c.lastSync, 9)];
  return [ok(c.lastSync, 12 + i), ok("2026-11-06T09:20:00+01:00", 8 + i)];
}

const HISTORY = CLIENTS.filter((c) => c.lastSync).map((c, i) => ({ client: c, runs: pastRuns(c, i) }));

function StateBadge({ state }: { state: SyncState }) {
  return <Badge tone={SYNC_STATE[state].tone}>{SYNC_STATE[state].label}</Badge>;
}

function SearchHead({ query, onQuery }: { query: string; onQuery: (q: string) => void }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-1)" }}>
      <SearchInput
        placeholder="Beleg-Nummer oder Eingangsdatum suchen"
        ariaLabel="Beleg im Verlauf suchen"
        value={query}
        onChange={onQuery}
      />
      <p className="lw-ui-hint">Gespeichert sind die Abgleiche der letzten 90 Tage.</p>
    </div>
  );
}

/* ── B1 empty ────────────────────────────────────────────────────────── */

const B1 = () => (
  <ExtensionShell area="history">
    <Card>
      <EmptyState
        title="Noch kein Abgleich"
        description="Nach dem ersten Abgleich stehen hier je Mandant der letzte erfolgreiche Abgleich und das Protokoll."
        action={<Button variant="primary">Zum Abgleich</Button>}
      />
    </Card>
  </ExtensionShell>
);

/* ── B2 per client ───────────────────────────────────────────────────── */

function RunsList({ runs }: { runs: Past[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-2)" }}>
      {runs.map((r) => (
        <li key={r.at} className="lw-ui-text" style={row}>
          <Time value={r.at} size="sm" />
          <StateBadge state={r.state} />
          <span>{r.summary}</span>
          <TextButton>Ergebnis ansehen</TextButton>
          <TextButton>Protokoll ansehen</TextButton>
        </li>
      ))}
    </ul>
  );
}

function B2Body({ query = "" }: { query?: string }) {
  const [q, setQ] = useState(query);
  return (
    <ExtensionShell area="history">
      <Card>
        <CardHead title="Verlauf" sub="Je Mandant der letzte erfolgreiche Abgleich" />
        <CardSection>
          <SearchHead query={q} onQuery={setQ} />
        </CardSection>
        <Table
          cols="var(--space-6) minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1.2fr)"
          priority={["primary", "primary", "meta", "primary"]}
        >
          <HeadRow>
            <span />
            <span>Mandant</span>
            <span>Zuletzt erfolgreich</span>
            <span>Letzter Abgleich</span>
          </HeadRow>
          {HISTORY.map(({ client, runs }, i) => {
            const lastOk = runs.find((r) => r.state === "succeeded");
            return (
              <ExpandableRow
                key={client.id}
                defaultOpen={i === 1}
                summary={
                  <>
                    <span>{client.name}</span>
                    <span>{lastOk ? <Time value={lastOk.at} /> : "noch nie"}</span>
                    <span>{runs[0] ? <StateBadge state={runs[0].state} /> : null}</span>
                  </>
                }
              >
                <RunsList runs={runs} />
              </ExpandableRow>
            );
          })}
        </Table>
      </Card>
    </ExtensionShell>
  );
}

/* ── B3 search ───────────────────────────────────────────────────────── */

interface Finding {
  at: string;
  client: string;
  title: string;
  outcome: string;
  tone: "success" | "neutral" | "warning";
  /** Why, when it did not go through — a sentence next to the badge, never inside it. */
  reason?: string;
}

const BY_NUMBER: Finding[] = [
  {
    at: "2026-11-27T09:13:00+01:00",
    client: "Musterfirma GmbH",
    title: "Druckerei Hansen · Rechnung 2026-0419",
    outcome: "nicht übertragen",
    tone: "warning",
    reason: "DATEV hat keine PDF-Datei geliefert.",
  },
];

const BY_DATE: Finding[] = [
  { at: "2026-11-27T09:12:00+01:00", client: "Musterfirma GmbH", title: "Büromarkt Weber · Rechnung 2026-1187", outcome: "übertragen", tone: "success" },
  { at: "2026-11-27T09:12:00+01:00", client: "Musterfirma GmbH", title: "Kanzleibedarf Schulz · Rechnung 88412", outcome: "schon in Ludwig", tone: "neutral" },
  { at: "2026-11-20T16:05:00+01:00", client: "Bäckerei Schneider e.K.", title: "Mühle Oberland · Lieferung 4471", outcome: "übertragen", tone: "success" },
];

function Findings({ query, findings }: { query: string; findings: Finding[] }) {
  const [q, setQ] = useState(query);
  return (
    <ExtensionShell area="history">
      <Card>
        <CardHead title="Verlauf" sub={findings.length ? `${findings.length} Treffer für „${query}“` : `Kein Treffer für „${query}“`} />
        <CardSection>
          <SearchHead query={q} onQuery={setQ} />
        </CardSection>
        {findings.length ? (
          <Table cols="minmax(0, 0.9fr) minmax(0, 1.8fr) minmax(0, 1.3fr)" priority={["meta", "primary", "primary"]}>
            <HeadRow>
              <span>Gesehen</span>
              <span>Beleg und Mandant</span>
              <span>Ergebnis</span>
            </HeadRow>
            {findings.map((f) => (
              <Row key={f.title}>
                <span>
                  <Time value={f.at} size="sm" />
                </span>
                <span>
                  {f.title}
                  <br />
                  <span className="lw-ui-hint">{f.client}</span>
                </span>
                <span>
                  <Badge tone={f.tone}>{f.outcome}</Badge>
                  {f.reason ? (
                    <>
                      <br />
                      <span className="lw-ui-hint">{f.reason}</span>
                    </>
                  ) : null}
                </span>
              </Row>
            ))}
          </Table>
        ) : (
          <EmptyState
            inline
            title="Kein Abgleich hat diesen Beleg gesehen"
            description="Gespeichert sind die Abgleiche der letzten 90 Tage. Prüfen Sie die Beleg-Nummer oder suchen Sie nach dem Eingangsdatum."
            action={<TextButton>Suche zurücksetzen</TextButton>}
          />
        )}
      </Card>
    </ExtensionShell>
  );
}

/* ── B4 log ──────────────────────────────────────────────────────────── */

const B4 = () => (
  <ExtensionShell area="history">
    {/* Before the download, not after it: the hint on client data comes first (C4). */}
    <SupportHelp facts={supportFacts("beleg_kein_pdf", "belege")} />
    <Card>
      <CardHead
        title="Protokoll · Musterfirma GmbH"
        sub={<Time value="2026-11-27T09:14:00+01:00" size="sm" />}
        actions={
          <>
            <Button size="sm" icon={<ActionIcon action="download" />}>
              Protokoll herunterladen
            </Button>
            <CopyTextButton text={LOG_TEXT} label="Protokoll kopieren" />
          </>
        }
      />
      {/* The log is wider than the narrow column; it scrolls inside, the page does not. */}
      <div style={{ overflowX: "auto" }}>
        <LogList entries={LOG} order="oldest" />
      </div>
    </Card>
    <Card>
      <CardHead title="Protokolle auf diesem Gerät" sub="25 Abgleiche, 1,2 MB" />
      <CardSection>
        <div style={stack}>
          <p className="lw-ui-text">Gelöschte Protokolle lassen sich nicht wiederherstellen.</p>
          <div>
            <ActionButton
              variant="danger"
              action={async () => {}}
              confirm={{
                title: "Alle Protokolle löschen?",
                body: "Die Protokolle aller Abgleiche auf diesem Gerät werden gelöscht. Was nach Ludwig übertragen wurde, bleibt dort.",
                confirmLabel: "Protokolle löschen",
                tone: "danger",
              }}
            >
              Alle Protokolle löschen
            </ActionButton>
          </div>
        </div>
      </CardSection>
    </Card>
  </ExtensionShell>
);

/* ── The states ──────────────────────────────────────────────────────── */

const page = "page" as const;

const HISTORY_STATES: StateSpec[] = [
  { id: "B1", title: "Verlauf · leer", uses: "Card, EmptyState, Button", missing: "0263", surface: page, render: () => <B1 /> },
  { id: "B2", title: "Verlauf · je Mandant", uses: "Card, SearchInput, Table, ExpandableRow, Badge, Time, TextButton", missing: "0263", surface: page, render: () => <B2Body /> },
  { id: "B3", title: "Suche nach Beleg-Nummer", uses: "SearchInput, Table, Badge, Time", missing: "0263", surface: page, render: () => <Findings query="7c1e4b20-5d3a-4f6e-9a21-0b8e3f4d1c77" findings={BY_NUMBER} /> },
  { id: "B3b", title: "Suche nach Eingangsdatum", uses: "SearchInput, Table, Badge, Time", missing: "0263", surface: page, render: () => <Findings query="24.11.2026" findings={BY_DATE} /> },
  { id: "B3c", title: "Suche ohne Treffer", uses: "SearchInput, EmptyState (leer nach Filter), TextButton", missing: "0263", surface: page, render: () => <Findings query="3f9a0d11-77c2-4b8e-a1f0-5c2d9e6b4a10" findings={[]} /> },
  { id: "B4", title: "Protokoll", uses: "Card, Button, CopyTextButton, LogList, ActionButton (Rückfrage); Hilfe vom Support aus Card, CopyTextButton, Button", missing: "0263", surface: page, render: () => <B4 /> },
];

interface Args {
  showDrafts: boolean;
}

const meta: Meta<Args> = {
  title: "Seiten/DUO-Connect/Verlauf",
  parameters: { layout: "fullscreen" },
  args: { showDrafts: true },
  argTypes: { showDrafts: { name: "Entwürfe kennzeichnen", control: "boolean" } },
};
export default meta;
type Story = StoryObj<Args>;

function wrap(args: Args, children: ReactNode) {
  return <DraftsVisible value={args.showDrafts}>{children}</DraftsVisible>;
}

function one(id: string): Story {
  const spec = HISTORY_STATES.find((s) => s.id === id);
  if (!spec) throw new Error(`unknown state ${id}`);
  return { name: `${spec.id} · ${spec.title}`, render: (args) => wrap(args, <Single spec={spec} />) };
}

/** Every state of the tab „Verlauf", side by side. */
export const Board: Story = {
  render: (args) =>
    wrap(
      args,
      <StateBoard
        title="Verlauf — alle Zustände"
        lead="Ein Abgleich im Verlauf öffnet dieselbe Ergebnisansicht wie im Reiter Abgleich (U9)."
        states={HISTORY_STATES}
      />,
    ),
};

export const B01Empty = one("B1");
export const B02PerClient = one("B2");
export const B03SearchNumber = one("B3");
export const B03bSearchDate = one("B3b");
export const B03cSearchNoHit = one("B3c");
export const B04Log = one("B4");
