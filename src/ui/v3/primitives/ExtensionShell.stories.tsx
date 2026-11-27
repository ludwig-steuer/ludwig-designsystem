import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import logoAsset from "../../../showcase/duo-connect/duo-connect-logo.svg?url";
import { DataTable, type ColumnDef } from "../patterns/DataTable";
import type { DuoSyncState } from "@/ludwig/modules/intake";
import { formatTime } from "../format";
import { StatusBadge } from "../patterns/StatusBadge";
import { Button } from "./Button";
import { Callout } from "./Callout";
import { ExtensionPopup, ExtensionShell } from "./ExtensionShell";
import { Progress } from "./Progress";
import { Spinner } from "./Spinner";
import { Card, CardHead, CardSection } from "./Table";
import { Tabs } from "./Nav";

const meta: Meta<typeof ExtensionShell> = {
  title: "v3/Primitives/Rahmen/ExtensionShell",
  component: ExtensionShell,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof ExtensionShell>;

const MARK = typeof logoAsset === "string" ? logoAsset : logoAsset.src;
const PRODUCT = "Ludwig DUO-Connect";
const VERSION = "0.10.2";
const LINKS = [{ label: "Datenschutz", href: "https://www.fakir.tech/de/datenschutz/duo-connect" }];

type Area = "sync" | "history" | "settings";

/** The three areas, as hash links (I1: reload and Back land in the right area). */
function AreaTabs({ active, running, onPick }: { active: Area; running?: boolean; onPick?: (a: Area) => void }) {
  return (
    <Tabs
      ariaLabel="Bereiche"
      active={active}
      onPick={onPick ? (k) => onPick(k as Area) : undefined}
      items={[
        { key: "sync", label: "Abgleich", dot: running, href: onPick ? undefined : "#abgleich" },
        { key: "history", label: "Verlauf", href: onPick ? undefined : "#verlauf" },
        { key: "settings", label: "Einstellungen", href: onPick ? undefined : "#einstellungen" },
      ]}
    />
  );
}

function SyncCard() {
  return (
    <Card>
      <CardHead title="Abgleichen" sub="Holt neue Belege und Kontoumsätze aus DATEV und sortiert gebuchte Belege ein." />
      <CardSection>
        <div style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
          <span>
            Mandant: <strong>Musterfirma GmbH</strong> · DATEV-Nummer <span className="lw-mono">10234</span>
          </span>
          <Button variant="primary">Mandant abgleichen</Button>
        </div>
      </CardSection>
    </Card>
  );
}

/** The page fills the story frame, as it fills the extension's tab. */
const fill = { height: "100vh" };

/**
 * Die Seite im Tab: Kopf mit Zeichen und Namen, drei Reiter, eine Karte im
 * Inhalt, am Ende die Fußzeile — „Datenschutz" verlässt die Erweiterung und
 * trägt deshalb das Zeichen dafür.
 */
export const Filled: Story = {
  render: () => (
    <div style={fill}>
      <ExtensionShell
        markSrc={MARK}
        productName={PRODUCT}
        nav={<AreaTabs active="sync" />}
        version={VERSION}
        links={LINKS}
      >
        <SyncCard />
      </ExtensionShell>
    </div>
  ),
};

/**
 * Mit Kennzeichen „Staging" (oben) und ohne (unten): Außerhalb der Produktion
 * sagt der Kopf, wogegen gearbeitet wird; in der Produktion steht nichts da,
 * auch kein „Produktion".
 */
export const WithEnvironment: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", padding: "var(--space-4)" }}>
      {(["Staging", undefined] as const).map((env) => (
        <div key={env ?? "prod"} style={{ border: "var(--border-1)" }}>
          <ExtensionShell
            markSrc={MARK}
            productName={PRODUCT}
            environment={env}
            nav={<AreaTabs active="sync" />}
            version={VERSION}
            links={LINKS}
          >
            <SyncCard />
          </ExtensionShell>
        </div>
      ))}
    </div>
  ),
};

interface PastSync {
  id: string;
  client: string;
  at: string;
  /** A value of the registry axis `duo_sync` — word and tone come from there. */
  state: DuoSyncState;
  documents: number;
}

const CLIENTS = [
  "Musterfirma GmbH",
  "Bäckerei Schneider e.K.",
  "Elektro Wagner GmbH & Co. KG",
  "Praxis Dr. Hoffmann",
  "Autohaus Becker GmbH",
  "Gartenbau Krüger",
  "Weinhandlung Lehmann OHG",
  "Hotel Seeblick Betriebs-GmbH",
];

/** 300 past syncs, newest first — enough for `main` to scroll. */
const HISTORY: PastSync[] = Array.from({ length: 300 }, (_, i) => {
  const at = new Date(Date.UTC(2026, 10, 27, 8, 14) - i * 7 * 3600_000);
  return {
    id: `s${i}`,
    client: CLIENTS[i % CLIENTS.length] ?? "Musterfirma GmbH",
    at: at.toISOString(),
    state: i % 23 === 5 ? "cancelled" : i % 11 === 3 ? "succeeded_with_issues" : "succeeded",
    documents: (i * 7) % 41,
  };
});

const HISTORY_COLUMNS: ColumnDef<PastSync>[] = [
  { key: "client", header: "Mandant", cell: (r) => <span className="v2main">{r.client}</span> },
  { key: "at", header: "Abgleich", width: "150px", priority: "meta", cell: (r) => formatTime(r.at) },
  { key: "state", header: "Stand", width: "170px", cell: (r) => <StatusBadge axis="duo_sync" status={r.state} /> },
  {
    key: "documents",
    header: "Belege",
    width: "80px",
    align: "end",
    priority: "meta",
    cell: (r) => <span className="v2num">{r.documents}</span>,
  },
];

/**
 * Rundlauf: Reiter wechseln über `onPick`. „Abgleich" trägt den Punkt,
 * solange ein Abgleich läuft. „Verlauf" hat 300 Zeilen — `main` scrollt, Kopf
 * und Reiter bleiben stehen; die Tabelle bleibt neben DATEV (960 px Fenster)
 * eine Tabelle und wird erst schmaler als 640 px zu Zeilenkarten.
 */
export const Interactive: Story = {
  render: function Render() {
    const [area, setArea] = useState<Area>("history");
    const [running, setRunning] = useState(true);
    return (
      <div style={fill}>
        <ExtensionShell
          markSrc={MARK}
          productName={PRODUCT}
          nav={<AreaTabs active={area} running={running} onPick={setArea} />}
          version={VERSION}
          links={LINKS}
        >
          {area === "sync" ? (
            <Card>
              <CardHead title="Abgleichen" sub={running ? "Musterfirma GmbH wird abgeglichen" : "Bereit"} />
              <CardSection>
                <Button onClick={() => setRunning((r) => !r)}>{running ? "Abgleich abbrechen" : "Mandant abgleichen"}</Button>
              </CardSection>
            </Card>
          ) : area === "history" ? (
            <DataTable<PastSync>
              rows={HISTORY}
              columns={HISTORY_COLUMNS}
              rowKey={(r) => r.id}
              rowHref={(r) => `#abgleich-${r.id}`}
              head={{ title: "Verlauf", sub: `${HISTORY.length} Abgleiche` }}
            />
          ) : (
            <Card>
              <CardHead title="Verbindung" sub="Mit Ludwig verbunden" />
              <CardSection>Nutzer Anna Schmidt · Gerät Laptop Büro · gültig bis 26.11.2027</CardSection>
            </Card>
          )}
        </ExtensionShell>
      </div>
    );
  },
};

/**
 * Die Hauptseite im echten Zustand: Bereich Abgleich, darüber der Hinweis,
 * die Seite offen zu lassen, darunter die Karte mit dem gemerkten Mandanten.
 */
export const InUse: Story = {
  render: (args) => (
    <div style={fill}>
      <ExtensionShell
        markSrc={MARK}
        productName={PRODUCT}
        environment={args.environment}
        nav={<AreaTabs active="sync" running />}
        version={VERSION}
        links={LINKS}
      >
        <Callout>Lassen Sie diese Seite und das DATEV-Fenster geöffnet, bis der Abgleich fertig ist.</Callout>
        <SyncCard />
      </ExtensionShell>
    </div>
  ),
};

/**
 * `InUse` mit Kennzeichen „Staging" in zwei Fenstern, 820 px und 390 px — als
 * `iframe`, weil die Regel für schmale Breiten das Fenster fragt. Bei 390 px:
 * eine Spalte, Rand 16 px, Name und Kennzeichen sichtbar, die drei Reiter in
 * einer Zeile.
 */
export const Narrow: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "start" }}>
      <iframe
        title="Hauptseite bei 820 px"
        src="/iframe.html?id=v3-primitives-rahmen-extensionshell--in-use&viewMode=story&args=environment:Staging"
        style={{ width: 820, height: 560, border: "var(--border-1)" }}
      />
      <iframe
        title="Hauptseite bei 390 px"
        src="/iframe.html?id=v3-primitives-rahmen-extensionshell--in-use&viewMode=story&args=environment:Staging"
        style={{ width: 390, height: 720, border: "var(--border-1)" }}
      />
    </div>
  ),
};

/** Chrome frames the popup itself; in the story a line stands in for that frame. */
function PopupFrame({ children }: { children: React.ReactNode }) {
  return <div style={{ border: "var(--border-1)", boxShadow: "var(--shadow-md)", width: "fit-content" }}>{children}</div>;
}

/**
 * Drei Popups: verbunden (mit letztem Abgleich als `detail`), nicht verbunden,
 * Abgleich läuft (mit `Spinner sm`, dem Zähler als `detail` außerhalb der
 * Live-Region und Kennzeichen „Staging"). Je eine Zeile Zustand und genau ein
 * Knopf.
 */
export const Popup: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", alignItems: "start" }}>
      <PopupFrame>
        <ExtensionPopup
          markSrc={MARK}
          productName={PRODUCT}
          status="Verbunden als Anna Schmidt"
          detail="Zuletzt abgeglichen: Musterfirma GmbH, 27.11.2026, 09:14"
          action={{ label: "Abgleich öffnen", onClick: () => {} }}
        />
      </PopupFrame>
      <PopupFrame>
        <ExtensionPopup
          markSrc={MARK}
          productName={PRODUCT}
          status="Nicht verbunden"
          action={{ label: "Einrichten", onClick: () => {} }}
        />
      </PopupFrame>
      <PopupFrame>
        <ExtensionPopup
          markSrc={MARK}
          productName={PRODUCT}
          environment="Staging"
          status={<Spinner size="sm" label="Abgleich läuft · Musterfirma GmbH" />}
          detail={<Progress done={37} total={120} size="sm" label="Beleg 37 von 120" />}
          action={{ label: "Abgleich öffnen", onClick: () => {} }}
        />
      </PopupFrame>
    </div>
  ),
};

/**
 * Rundlauf über `action.onClick`: Klick oder `Enter` zählen „Seite geöffnet"
 * hoch. Der Knopf hat beim Laden den Fokus — `Enter` direkt nach dem Klick auf
 * das Symbol ist der schnellste Weg.
 */
export const PopupInteractive: Story = {
  parameters: { layout: "padded" },
  render: function Render() {
    const [opened, setOpened] = useState(0);
    const [connected, setConnected] = useState(false);
    return (
      <div style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
        <PopupFrame>
          <ExtensionPopup
            markSrc={MARK}
            productName={PRODUCT}
            status={connected ? "Verbunden als Anna Schmidt" : "Nicht verbunden"}
            action={{
              label: connected ? "Abgleich öffnen" : "Einrichten",
              onClick: () => {
                setOpened((n) => n + 1);
                setConnected(true);
              },
            }}
          />
        </PopupFrame>
        <span className="lw-ui-hint">Seite geöffnet: {opened}</span>
      </div>
    );
  },
};
