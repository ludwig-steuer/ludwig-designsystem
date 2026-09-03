import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { ProseCard } from "./primitives/ProseCard";

/**
 * Typography (0037) — no component, no new CSS. The scale lives in
 * `tokens.css`; this story is its proof, because Storybook is the answer to
 * „what does v3 have?" and what has no story does not count as existing.
 *
 * „Grundlagen" is the new group that later takes colour and space (§11.7).
 */
const meta: Meta = { title: "v3/Grundlagen/Typografie" };
export default meta;
type Story = StoryObj;

/** Ein Muster je Stufe: Name, Klasse, echter Text. */
function Row({ name, cls, note, children }: { name: string; cls: string; note: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px minmax(0, 1fr)",
        gap: "var(--space-5)",
        alignItems: "baseline",
        padding: "var(--space-3) 0",
        borderTop: "1px solid var(--color-border-subtle)",
      }}
    >
      <div>
        <div className="lw-caption" style={{ color: "var(--color-text)" }}>
          {name}
        </div>
        <code className="lw-mono" style={{ color: "var(--color-text-subtle)" }}>
          {cls}
        </code>
        <div className="lw-caption" style={{ color: "var(--color-text-subtle)" }}>
          {note}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

/**
 * Die ganze Leiter, mit Text aus der Kanzlei statt mit „Lorem". Überschriften
 * tragen `--color-primary` (h1/h2) und `--color-text` (h3/h4) — eine Stufe
 * heller, je tiefer sie sitzt.
 *
 * **Die Klasse steht am Element**, auch an `h1`–`h4`: Tailwinds Preflight
 * (`@tailwind base` lädt in `index.css` nach `tokens.css`) setzt
 * `h1…h6 { font-size: inherit }` und schlägt damit den Element-Selektor.
 * Wirksam ist nur `.lw-h1`–`.lw-h4` — siehe Befund in 0037.
 */
export const Scale: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <Row name="Überschrift 1" cls="h1 · .lw-h1" note="Seitentitel, einmal je Seite">
        <h1 className="lw-h1">Offene Posten 2026</h1>
      </Row>
      <Row name="Überschrift 2" cls="h2 · .lw-h2" note="Abschnitt einer Seite">
        <h2 className="lw-h2">Fällig in den nächsten 30 Tagen</h2>
      </Row>
      <Row name="Überschrift 3" cls="h3 · .lw-h3" note="Karte, Detail, Block">
        <h3 className="lw-h3">Sachverhalt RE-4471 · Bürobedarf Meier GmbH</h3>
      </Row>
      <Row name="Überschrift 4" cls="h4 · .lw-h4" note="Unterabschnitt, Feldgruppe">
        <h4 className="lw-h4">Buchungsvorschlag des Agenten</h4>
      </Row>
      <Row name="Fließtext" cls="p · .lw-body" note="lesendes Register, 16 px">
        <p className="lw-body">
          Der Kreditor wurde in den letzten sechs Monaten 14-mal auf 6815 gebucht. Die Rechnung
          nennt Schreibwaren und zwei Druckerpatronen.
        </p>
      </Row>
      <Row name="Fließtext klein" cls=".lw-body-sm" note="produktives Register, 14 px">
        <div className="lw-body-sm">
          142 Sätze, davon 38 ungeprüft. Zwei Sätze über 1.000,00 € tragen einen Befund.
        </div>
      </Row>
      <Row name="Beischrift" cls=".lw-caption" note="Unterzeile, Spaltenkopf, Hinweis">
        <div className="lw-caption">zuletzt geprüft am 31.08.2026 um 09:12 Uhr</div>
      </Row>
      <Row name="Überzeile" cls=".lw-overline" note="Einordnung über dem Titel">
        <div className="lw-overline">Zusatzweg</div>
      </Row>
      <Row name="Mono" cls=".lw-mono" note="Konto, BU-Schlüssel, DATEV-Code">
        <div className="lw-mono">6815 · 70000 · BU 9 · RE-4471</div>
      </Row>
      <Row name="Zahlen" cls=".lw-numeric" note="Beträge, tabellarisch untereinander">
        <div className="lw-numeric" style={{ textAlign: "right", width: "12ch" }}>
          <div>1.249,90 €</div>
          <div>312,40 €</div>
          <div>88,10 €</div>
        </div>
      </Row>
      <Row name="Anriss (lesend)" cls=".lw-lede" note="nur lesendes Register — Serif">
        <div className="lw-lede">
          Ludwig prüft den Stapel, bevor die Kanzlei ihn freigibt.
        </div>
      </Row>
      <Row name="Display (lesend)" cls=".lw-display" note="nur lesendes Register — Serif, Hero">
        <div className="lw-display">Ludwig</div>
      </Row>
    </div>
  ),
};

/**
 * Zwei Register, ein Token-Satz (A1): produktiv 13,5–14 px in `/clients/**`,
 * `/admin/**` und `/dashboard` — lesend 16 px in Login, Hilfe und Onboarding.
 * Derselbe Absatz, zweimal.
 */
export const Registers: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)", maxWidth: 900 }}>
      <div>
        <div className="lw-overline">Produktiv · 13,5–14 px</div>
        <div className="lw-caption" style={{ marginBottom: "var(--space-3)" }}>
          /clients/** · /admin/** · /dashboard — knapp in der Zeile, großzügig zwischen Blöcken
        </div>
        <div className="lw-body-sm">
          Der Stapel 2026-08 enthält 142 Sätze. 38 sind ungeprüft, zwei davon über 1.000,00 €.
          Die Freigabe bleibt gesperrt, solange ein Befund offen ist.
        </div>
      </div>
      <div>
        <div className="lw-overline">Lesend · 16 px</div>
        <div className="lw-caption" style={{ marginBottom: "var(--space-3)" }}>
          (auth)/login · /hilfe/** · Onboarding — großzügiger Weißraum
        </div>
        <p style={{ margin: 0 }}>
          Der Stapel 2026-08 enthält 142 Sätze. 38 sind ungeprüft, zwei davon über 1.000,00 €.
          Die Freigabe bleibt gesperrt, solange ein Befund offen ist.
        </p>
      </div>
    </div>
  ),
};

/** Im Einsatz: die Stufen an einem Ausschnitt, wie er auf der Seite steht. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ProseCard title="Begründung des Agenten">
        <div className="lw-overline">Sachverhalt · Wirtschaftsjahr 2026</div>
        <h3 className="lw-h3" style={{ margin: "var(--space-2) 0" }}>RE-4471 · Bürobedarf Meier GmbH</h3>
        <div className="lw-body-sm">
          Der Kreditor wurde in den letzten sechs Monaten 14-mal auf{" "}
          <span className="lw-mono">6815</span> gebucht, gegen{" "}
          <span className="lw-mono">70000</span> mit{" "}
          <span className="lw-mono">BU 9</span>. Die Rechnung nennt Schreibwaren.
        </div>
        <div className="lw-caption" style={{ marginTop: "var(--space-3)" }}>
          vorgeschlagen am 30.08.2026 um 22:41 Uhr
        </div>
      </ProseCard>
    </div>
  ),
};
