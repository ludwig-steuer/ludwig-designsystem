/**
 * „Hilfe vom Support" (docs/seiten/duo-connect.md, Nachtrag 2): a page
 * composition of the plugin from existing parts, not a building block of the set.
 */
import { Button, Card, CardHead, CardSection, CopyTextButton } from "@/ui/v3";

/** Technical facts without client data: error code, step, version, browser, run id. */
export function supportFacts(code: string, step: string): string {
  return `Fehler-Code ${code} · Schritt ${step} · Ludwig DUO-Connect 0.11.0 · Chrome 131 · Abgleich 2026-11-27-0911-a3f2`;
}

/**
 * End of a result and the log (owner 2026-11-27): what goes to the support, and
 * the two ways there. „E-Mail an den Support" opens the mail program with the
 * facts and downloads the log; nothing is sent until the person sends it.
 */
export function SupportHelp({ facts }: { facts: string }) {
  return (
    <Card>
      <CardHead title="Hilfe vom Support" headingLevel={3} />
      <CardSection>
        <div style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
          <p className="lw-ui-text">Das Protokoll enthält Mandantendaten. Geben Sie es nur an den Ludwig-Support weiter.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <CopyTextButton text={facts} label="Angaben kopieren" />
            <Button size="sm">E-Mail an den Support</Button>
          </div>
          <p className="lw-ui-hint">
            Ihr E-Mail-Programm öffnet sich mit allen Angaben. Das Protokoll wird dabei heruntergeladen — hängen Sie die
            Datei an. Gesendet wird erst, wenn Sie selbst senden.
          </p>
        </div>
      </CardSection>
    </Card>
  );
}
