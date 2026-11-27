import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { LEVEL_ICON } from "../Icons";
import { Button } from "./Button";
import { Link } from "./Link";
import { ProblemCard } from "./ProblemCard";
import { StatusCallout } from "./StatusCallout";
import { Card, CardHead, CardSection } from "./Table";

const meta: Meta<typeof ProblemCard> = { title: "v3/Primitives/Fläche/ProblemCard", component: ProblemCard };
export default meta;
type Story = StoryObj<typeof ProblemCard>;

/* Data from the result view of the DUO-Connect extension (sync of 27.11.2026). */

const GATEWAY = [
  "ludwig_nicht_erreichbar · POST /api/intake/v2/documents · 504 Gateway Timeout",
  "Versuche: 1 s · 3 s · 9 s, danach aufgegeben",
  "Abgleich 2026-11-27T09:14:05+01:00 · Beleg 37 von 120 · Plugin 0.11.0",
].join("\n");

const column = { display: "grid", gap: "var(--space-3)", maxWidth: "var(--container-narrow)" } as const;

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-1)" }}>
      <span className="lw-ui-hint">{label}</span>
      {children}
    </div>
  );
}

/** Der Normalfall: Ludwig nicht erreichbar — was, warum, was jetzt, ein Knopf, die Technik eingeklappt. */
export const Filled: Story = {
  render: () => (
    <div style={column}>
      <ProblemCard
        title="Ludwig war nicht erreichbar."
        context="Belegabruf"
        resolution="retry"
        cause="Drei Versuche sind an einer Zeitüberschreitung gescheitert."
        step="Starten Sie den Abgleich in einigen Minuten erneut. Bereits übertragene Belege werden nicht doppelt übertragen."
        action={<Button>Erneut versuchen</Button>}
        technical={GATEWAY}
      />
    </div>
  ),
};

/** Wer löst es: `user` ohne festen Satz, `retry` „meist vorübergehend“, `support` „liegt nicht an Ihnen“. */
export const Resolutions: Story = {
  render: () => (
    <div style={column}>
      <Labelled label="user — der nächste Schritt sagt, was zu tun ist">
        <ProblemCard
          title="Bei DATEV nicht angemeldet."
          context="Belegabruf"
          resolution="user"
          cause="Die Anmeldung bei DATEV Unternehmen Online ist abgelaufen."
          step="Öffnen Sie DATEV, melden Sie sich an und starten Sie den Abgleich erneut."
          action={<Button>DATEV öffnen</Button>}
        />
      </Labelled>
      <Labelled label="retry — „Das ist meist vorübergehend.“">
        <ProblemCard
          title="Ludwig war nicht erreichbar."
          context="Kontoabruf · Konto 2 von 3"
          resolution="retry"
          cause="Die Verbindung zu Ludwig ist nach 30 Sekunden abgebrochen."
          step="Starten Sie den Abgleich in einigen Minuten erneut."
          action={<Button>Erneut versuchen</Button>}
          technical="ludwig_nicht_erreichbar · GET /api/intake/v2/accounts · net::ERR_TIMED_OUT"
        />
      </Labelled>
      <Labelled label="support — „Das liegt nicht an Ihnen.“">
        <ProblemCard
          title="DATEV hat die Belegübersicht anders angezeigt als erwartet."
          context="Belegabruf"
          resolution="support"
          cause="Eine Spalte der Belegübersicht fehlte."
          step="Laden Sie das Protokoll herunter und senden Sie es an den Ludwig-Support."
          action={<Button>Protokoll herunterladen</Button>}
          technical={"duo_element_fehlt · Spalte „Eingangsdatum“ nicht gefunden\nSeite: Belegübersicht · Posteingang"}
        />
      </Labelled>
    </div>
  ),
};

/** Fehler und Warnung nebeneinander: Rahmen, Zeichen und Wort im Kopf; die Fläche bleibt weiß. */
export const Levels: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))", alignItems: "start" }}>
      <ProblemCard
        level="error"
        title="Ludwig war nicht erreichbar."
        context="Belegabruf"
        resolution="retry"
        cause="Drei Versuche sind an einer Zeitüberschreitung gescheitert."
        step="Starten Sie den Abgleich in einigen Minuten erneut."
        action={<Button>Erneut versuchen</Button>}
      />
      <ProblemCard
        level="warning"
        title="Keine DATEV-Mandantennummer hinterlegt."
        context="Musterfirma GmbH"
        resolution="user"
        cause="Ohne Mandantennummer findet das Plugin den Mandanten in DATEV nicht. Er wurde übersprungen."
        step="Tragen Sie die DATEV-Mandantennummer in Ludwig ein und gleichen Sie erneut ab."
        action={<Button href="#mandant">Mandant in Ludwig öffnen</Button>}
      />
    </div>
  ),
};

/** Im Einsatz: Ergebnis eines Abgleichs, Satz oben (0269), darunter drei Karten mit `--space-3` Abstand. */
export const InUse: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ padding: "var(--space-6)", maxWidth: "var(--container-wide)" }}>
      <Card>
        <CardHead title="Ergebnis · Musterfirma GmbH" sub="27.11.2026, 09:14 · Abrufzeitraum 13.11.2026 bis 27.11.2026" />
        <CardSection>
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            <StatusCallout
              layout="sentence"
              tone="warning"
              icon={<LevelSign level="warning" />}
              kicker={`${resolveStatus("duo_sync", "succeeded_with_issues").label}.`}
              title="12 Belege übertragen, 3 Belege nicht übertragen."
            />
            <ProblemCard
              level="warning"
              title="3 Belege nicht übertragen."
              context="Belegabruf"
              resolution="support"
              cause="DATEV hat zu diesen Belegen keine PDF-Datei geliefert."
              step="Die Belege bleiben in DATEV; ein neuer Versuch holt sie, sobald DATEV die Datei liefert."
              action={<Button>Erneut versuchen</Button>}
              technical={"beleg_kein_pdf · 3 Belege\nBEDI 7f3a…c21e · 9b10…44d0 · 0c5e…a913"}
            />
            <ProblemCard
              title="Ludwig war nicht erreichbar."
              context="Kontoabruf · Konto 2 von 3"
              resolution="retry"
              cause="Die Verbindung zu Ludwig ist nach 30 Sekunden abgebrochen."
              step="Starten Sie den Abgleich in einigen Minuten erneut. Bereits übertragene Kontoumsätze werden nicht doppelt übertragen."
              action={<Button>Erneut versuchen</Button>}
              technical={GATEWAY}
            />
            <ProblemCard
              level="warning"
              title="Ein Ablageort fehlt in DATEV."
              context="Belegablage"
              resolution="user"
              cause="Den Ordner „Gebuchte Belege 2026“ gibt es in der DATEV-Ablage nicht mehr."
              step={
                <>
                  Legen Sie den Ordner in DATEV wieder an oder passen Sie die Ablage in Ludwig an.{" "}
                  <Link href="#ablage">Ablage in Ludwig</Link>
                </>
              }
            />
          </div>
        </CardSection>
      </Card>
    </div>
  ),
};

/** One JSON line of 900 characters — at 320 px it scrolls, so it must be a tab stop. */
const JSON_LINE = JSON.stringify({
  code: "export_nicht_lesbar",
  step: "belege",
  rows: Array.from({ length: 14 }, (_, i) => ({ bedi: `7f3a${i}c21e-9b10-44d0-0c5e-a913${i}`, status: "unreadable" })),
}).slice(0, 900);

const LONG_STACK = [
  "intern · TypeError: Cannot read properties of undefined (reading 'rows')",
  ...Array.from({ length: 38 }, (_, i) => `    at parseExport (chrome-extension://abc/sync/belege.js:${120 + i}:${17 + (i % 9)})`),
  `token=${"x".repeat(300)}`,
].join("\n");

function EdgeCards() {
  return (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <Labelled label="ohne cause — der feste Satz steht allein">
        <ProblemCard
          title="DATEV hat den Export abgelehnt."
          context="Kontoabruf"
          resolution="support"
          step="Laden Sie das Protokoll herunter und senden Sie es an den Ludwig-Support."
          action={<Button>Protokoll herunterladen</Button>}
        />
      </Labelled>
      <Labelled label="ohne action — kein leerer Platz">
        <ProblemCard
          title="Die Seite wurde während des Abgleichs geschlossen."
          resolution="user"
          cause="Bisher Übertragenes bleibt in Ludwig."
          step="Gleichen Sie erneut ab; nichts wird doppelt übertragen."
          level="warning"
        />
      </Labelled>
      <Labelled label="ohne technical — kein Aufklapper · langer Mandantenname im Kopf">
        <ProblemCard
          title="Keine DATEV-Mandantennummer hinterlegt."
          context="Bäckerei Schulze & Söhne Gebäudereinigung und Hausmeisterservice GmbH"
          resolution="user"
          level="warning"
          cause="Der Mandant wurde übersprungen."
          step="Tragen Sie die Mandantennummer in Ludwig ein."
          action={<Button href="#mandant">Mandant in Ludwig öffnen</Button>}
        />
      </Labelled>
      <Labelled label="technical: eine JSON-Zeile mit 900 Zeichen">
        <ProblemCard
          title="DATEV hat eine Exportdatei geliefert, die sich nicht lesen ließ."
          context="Belegabruf"
          resolution="support"
          step="Laden Sie das Protokoll herunter und senden Sie es an den Ludwig-Support."
          technical={JSON_LINE}
        />
      </Labelled>
      <Labelled label="technical mit 40 Zeilen und einer 300 Zeichen langen Zeile">
        <ProblemCard
          title="Im Plugin ist ein Fehler aufgetreten."
          context="Belegabruf"
          resolution="support"
          step="Laden Sie das Protokoll herunter und senden Sie es an den Ludwig-Support."
          action={<Button>Protokoll herunterladen</Button>}
          technical={LONG_STACK}
        />
      </Labelled>
    </div>
  );
}

/** Ränder: ohne cause, ohne action, ohne technical, langer Kontext, langer Stack — bei 720 und 320 px. */
export const Edge: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "start", flexWrap: "wrap" }}>
      <div style={{ width: "var(--container-narrow)", maxWidth: "100%" }}>
        <EdgeCards />
      </div>
      <div style={{ width: "20rem", maxWidth: "100%" }} data-frame="320">
        <EdgeCards />
      </div>
    </div>
  ),
};

/** The level's sign for the sentence above the cards — sign of the tone, from the registry. */
function LevelSign({ level }: { level: "error" | "warning" }) {
  const { icon: Icon } = LEVEL_ICON[level];
  return <Icon size={16} strokeWidth={1.5} aria-hidden="true" />;
}
