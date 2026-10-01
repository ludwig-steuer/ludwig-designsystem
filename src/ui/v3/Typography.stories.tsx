import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { EmptyState } from "./primitives/EmptyState";
import { FieldList } from "./primitives/FieldList";
import { Field, Input } from "./primitives/Form";
import { Markdown } from "./primitives/Markdown";
import { PageHeader } from "./primitives/PageHeader";
import { ProseCard } from "./primitives/ProseCard";
import { Card, CardHead, HeadRow, Row as TableRow, Table } from "./primitives/Table";

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
 * **Die Klasse steht am Element**, auch an `h1`–`h4`: `tokens.css` führt seit
 * 2026-09-03 nur noch Klassen. Element-Selektoren waren entweder wirkungslos
 * (Tailwinds Preflight setzt `h1…h6 { font-size: inherit }` und lädt später)
 * oder trafen fremdes Markup (`p` im Markdown-Reader). Ohne Klasse erbt ein
 * Element die Größe seiner Fläche — was Komponenten brauchen.
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
        <h4 className="lw-h4">Buchungsvorschlag von Ludwig</h4>
      </Row>
      <Row name="Fließtext (lesend)" cls="p · .lw-body" note="nur lesendes Register, 16 px">
        <p className="lw-body">
          Der Kreditor wurde in den letzten sechs Monaten 14-mal auf 6815 gebucht. Die Rechnung
          nennt Schreibwaren und zwei Druckerpatronen.
        </p>
      </Row>
      <Row name="Fließtext klein (lesend)" cls=".lw-body-sm" note="nur lesendes Register, 14 px — produktiv: .lw-ui-text">
        <div className="lw-body-sm">
          142 Sätze, davon 38 ungeprüft. Zwei Sätze über 1.000,00 € tragen einen Befund.
        </div>
      </Row>
      <Row name="Beischrift (lesend)" cls=".lw-caption" note="nur lesendes Register, 13 px">
        <div className="lw-caption">zuletzt geprüft am 31.08.2026 um 09:12 Uhr</div>
      </Row>
      <Row name="Überzeile (lesend)" cls=".lw-overline" note="nur lesendes Register — produktiv: .lw-ui-overline">
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
 * Die Leiter des **produktiven Registers** — die sieben Größen, aus denen jede
 * v3-Komponente wählt (`--fs-ui-*` in `tokens.css`). Vorher stand jede Zahl
 * einzeln in `v3.css`; wer eine Komponente baute, riet.
 */
export const Interface: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <Row name="Seitentitel" cls="--fs-ui-xl · 20 px" note="PageHeader, einmal je Seite">
        <span style={{ fontSize: "var(--fs-ui-xl)", lineHeight: "var(--lh-ui-xl)", fontWeight: 600 }}>
          Stapel 2026-08 · Bürobedarf
        </span>
      </Row>
      <Row name="Flächentitel" cls="--fs-ui-lg · 16 px" note="Karte, Detail, Markdown-Überschrift">
        <span style={{ fontSize: "var(--fs-ui-lg)", lineHeight: "var(--lh-ui-lg)", fontWeight: 600 }}>
          Ungeprüfte Sätze
        </span>
      </Row>
      <Row name="Betont" cls="--fs-ui-md · 14 px" note="Knopf, hervorgehobene Zeile">
        <span style={{ fontSize: "var(--fs-ui-md)", lineHeight: "var(--lh-ui-md)" }}>
          Stapel abnehmen
        </span>
      </Row>
      <Row name="Standard" cls="--fs-ui · 13,5 px" note="Zeile, Feld, Fließtext der Arbeitsfläche">
        <span style={{ fontSize: "var(--fs-ui)", lineHeight: "var(--lh-ui)" }}>
          142 Sätze, davon 38 ungeprüft. Zwei über 1.000,00 € tragen einen Befund.
        </span>
      </Row>
      <Row name="Unterzeile" cls="--fs-ui-sm · 12,5 px" note="Hinweis, zweite Zeile einer Zelle">
        <span style={{ fontSize: "var(--fs-ui-sm)", lineHeight: "var(--lh-ui-sm)", color: "var(--color-text-muted)" }}>
          zuletzt geprüft am 31.08.2026
        </span>
      </Row>
      <Row name="Beischrift" cls="--fs-ui-xs · 11,5 px" note="Taste, Achsenbeschriftung">
        <span style={{ fontSize: "var(--fs-ui-xs)", lineHeight: "var(--lh-ui-xs)", color: "var(--color-text-subtle)" }}>
          Sep · Okt · Nov · Dez
        </span>
      </Row>
      <Row name="Feld-Label" cls="--fs-ui-sm · 12,5 px" note="Über dem Feld, ohne Versalien (0089)">
        <span
          style={{
            fontSize: "var(--fs-ui-sm)",
            lineHeight: "var(--lh-ui-sm)",
            fontWeight: 600,
            color: "var(--color-text-muted)",
          }}
        >
          Steuerschlüssel
        </span>
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

/**
 * Im Einsatz: die Rollen an einem Ausschnitt, wie er in der Oberfläche steht —
 * Overline, Gruppenkopf, Fließtext, Hinweis, alle aus `lw-ui-*` (0220).
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ProseCard title="Begründung von Ludwig">
        <div className="lw-ui-overline">Sachverhalt · Wirtschaftsjahr 2026</div>
        <h3 className="lw-ui-group" style={{ margin: "var(--space-1) 0 var(--space-2)" }}>
          RE-4471 · Bürobedarf Meier GmbH
        </h3>
        <p className="lw-ui-text">
          Der Kreditor wurde in den letzten sechs Monaten 14-mal auf{" "}
          <span className="lw-mono">6815</span> gebucht, gegen{" "}
          <span className="lw-mono">70000</span> mit{" "}
          <span className="lw-mono">BU 9</span>. Die Rechnung nennt Schreibwaren.
        </p>
        <p className="lw-ui-hint" style={{ marginTop: "var(--space-3)" }}>
          vorgeschlagen am 30.08.2026 um 22:41 Uhr
        </p>
      </ProseCard>
    </div>
  ),
};

/**
 * **Die Rollen des produktiven Registers (0220, A14)** — eine Gestalt je
 * Rolle, gerendert mit dem Baustein oder der Klasse, die sie trägt. Was ein
 * Baustein trägt (Seitentitel, Kartenkopf, Feldlabel …), bleibt im Baustein;
 * die sechs `lw-ui-*`-Klassen sind für Text, den Aufrufer frei setzen.
 * `sub`/`.v2sub` ist Beischrift: eine Zeile, nie ein Absatz.
 */
export const Roles: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <Row name="1 Seitentitel" cls="PageHeader · h1" note="ui-xl 20 · 600 · text — genau eins je Seite">
        <PageHeader title="Stapel 2026-08 · Bürobedarf" />
      </Row>
      <Row name="2 Abschnittstitel" cls=".lw-ui-section · h2" note="ui-lg 16 · 600 · text — über ≥ 2 Karten">
        <h2 className="lw-ui-section">Weitere Zahlungswege</h2>
      </Row>
      <Row name="3 Flächentitel" cls="Drawer · Dialog · DetailPane · Wizard" note="ui-lg 16 · 600 · text — h2, Wurzel der Fläche">
        <h2 className="v2dlg__title">Beleg RE-4471</h2>
      </Row>
      <Row name="4 Kartenkopf" cls="CardHead · h2/h3" note="ui-md 14 · 600 · text — Ebene nach Lage">
        <Card>
          <CardHead title="Offene Belege" />
        </Card>
      </Row>
      <Row name="5 Gruppenkopf" cls=".lw-ui-group · FieldList · h3/h4" note="ui-sm 12,5 · 700 · muted — ≥ 2 Gruppen">
        <h3 className="lw-ui-group">Zahlung</h3>
      </Row>
      <Row name="6 Overline" cls=".lw-ui-overline · nie h" note="ui-xs 11,5 · 600 · subtle — ordnet einen Titel ein">
        <div className="lw-ui-overline">Mandant · Musterfirma GmbH</div>
      </Row>
      <Row name="7 Zeilentitel · 9 Beischrift" cls=".v2main · .v2sub" note="Zeilenmaß · 600 · text — darunter ui-xs 11,5 · subtle, eine Zeile">
        <Table cols="minmax(0, 1fr) 130px">
          <TableRow>
            <span>
              <span className="v2main">Bürobedarf Meier GmbH</span>
              <br />
              <span className="v2sub">DE12 5001 0517 0648 4898 90</span>
            </span>
            <span className="v2num">−1.800,00 €</span>
          </TableRow>
        </Table>
      </Row>
      <Row name="8 Unterzeile" cls="CardHead sub · Drawer meta" note="ui-sm 12,5 · muted — eine Zeile unter einem Kopf">
        <Card>
          <CardHead title="Offene Belege" sub="38 von 142 · Stand 26.08.2026" />
        </Card>
      </Row>
      <Row name="10 Fließtext" cls=".lw-ui-text · p" note="ui 13,5 · 400 · text — DER Fließtext der Oberfläche, ≤ 68ch">
        <p className="lw-ui-text">
          Zwei Sätze über 1.000,00 € tragen einen Befund. Die Freigabe bleibt gesperrt, solange einer offen ist.
        </p>
      </Row>
      <Row name="11 Einleitung" cls=".lw-ui-lead · p" note="ui 13,5 · muted — direkt unter einem Titel, ≤ 2 Sätze">
        <p className="lw-ui-lead">
          Anzeigename und Kontenrahmen. Buchungsdaten kommen in den nächsten Schritten dazu.
        </p>
      </Row>
      <Row name="12 Hinweis" cls=".lw-ui-hint · Field hint" note="ui-sm 12,5 · subtle — unter Feld, Option, Block">
        <p className="lw-ui-hint">Aus der ersten Zeile geraten. Prüfen Sie das Trennzeichen, bevor Sie fortfahren.</p>
      </Row>
      <Row name="13 Lesetext" cls="Markdown · ProseCard" note="ui 13,5 · lh-ui · text — Überschriften h3/h4">
        <Markdown text={"## Begründung\n\nDer Kreditor wurde 14-mal auf **6815** gebucht. Die Rechnung nennt Schreibwaren."} />
      </Row>
      <Row name="14 Feldlabel" cls="Field · label/legend" note="ui-sm 12,5 · 600 · muted (0089)">
        <Field label="Steuerschlüssel" htmlFor="typo-roles-bu">
          <Input id="typo-roles-bu" defaultValue="9" />
        </Field>
      </Row>
      <Row name="15 Tabellenkopf" cls="HeadRow · th" note="ui-sm 12,5 · 600 · subtle">
        <Table cols="110px minmax(0, 1fr) 130px">
          <HeadRow>
            <span>Datum</span>
            <span>Verwendungszweck</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
        </Table>
      </Row>
      <Row name="16 Zahl, Mono" cls=".lw-numeric · .lw-mono" note="erbt Größe — tnum für Beträge, Mono für Konto und BU">
        <span className="lw-numeric">1.249,90 €</span> · <span className="lw-mono">6815 · BU 9</span>
      </Row>
      <Row name="17 Zustandstitel" cls="EmptyState · p, kein h" note="ui-md 14 · 600 · text — eine Meldung, keine Überschrift">
        <EmptyState
          inline
          title="Noch keine Belege für 2026"
          description="Belege erscheinen hier, sobald die Kanzlei oder der Mandant sie hochlädt."
        />
      </Row>
    </div>
  ),
};

/** Reads the outline the way a screen reader does: every `h1`–`h6`, in order. */
function Outline({ of }: { of: RefObject<HTMLDivElement | null> }) {
  const [items, setItems] = useState<[string, string][]>([]);
  useEffect(() => {
    const hs = of.current?.querySelectorAll("h1, h2, h3, h4, h5, h6") ?? [];
    setItems(Array.from(hs, (h) => [h.tagName.toLowerCase(), h.textContent ?? ""]));
  }, [of]);
  return (
    <div style={{ marginTop: "var(--space-6)" }}>
      <h2 className="lw-ui-section">Gliederung, aus dem DOM gelesen</h2>
      <ol className="lw-ui-text" style={{ listStyle: "none", padding: 0, margin: "var(--space-2) 0 0" }}>
        {items.map(([tag, text], i) => (
          <li key={i} style={{ paddingLeft: `calc(${Number(tag[1]) - 1} * var(--space-5))` }}>
            <span className="lw-mono" style={{ color: "var(--color-text-subtle)" }}>
              {tag}
            </span>{" "}
            {text}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * **Überschriften-Ordnung (0220 §2):** Seite → Abschnitt → Karte → Gruppe,
 * höchstens `h1`–`h4`, genau ein `h1`, keine Sprünge. Das Element folgt der
 * Lage, die Gestalt der Rolle: der Kartenkopf „Girokonto" ist `h3` (unter
 * einem Abschnitt), sieht aber aus wie jeder Kartenkopf. Drawer und Dialog
 * beginnen mit eigenem `h2`. Die Gliederung darunter liest das DOM aus — sie
 * zeigt, was ein Screenreader hört.
 */
export const Headings: Story = {
  render: function Render() {
    const page = useRef<HTMLDivElement>(null);
    return (
      <div style={{ maxWidth: 900 }}>
        <div ref={page} style={{ display: "grid", gap: "var(--space-5)" }}>
          <PageHeader
            overline="Mandant · Musterfirma GmbH"
            title="Zahlungswege"
            description="Konten und Karten, über die der Mandant zahlt. Ludwig gleicht jeden Weg monatlich mit dem Auszug ab."
          />
          <section style={{ display: "grid", gap: "var(--space-3)" }}>
            <h2 className="lw-ui-section">Bankkonten</h2>
            <Card>
              <CardHead headingLevel={3} title="Girokonto Sparkasse" sub="DE12 5001 0517 0648 4898 90" />
              <div className="v3boxbody" style={{ display: "grid", gap: "var(--space-4)" }}>
                <FieldList headingLevel={4} tone="bare" title="Zahlung" rows={[["Konto", "1200"], ["Saldo", "12.480,00 €"]]} />
                <FieldList headingLevel={4} tone="bare" title="Abgleich" rows={[["Letzter Auszug", "31.08.2026"]]} />
              </div>
            </Card>
            <Card>
              <CardHead headingLevel={3} title="Tagesgeld Volksbank" sub="DE89 3704 0044 0532 0130 00" />
            </Card>
          </section>
          <section style={{ display: "grid", gap: "var(--space-3)" }}>
            <h2 className="lw-ui-section">Weitere Zahlungswege</h2>
            <Card>
              <CardHead headingLevel={3} title="Kasse" />
            </Card>
            <Card>
              <CardHead headingLevel={3} title="Kreditkarte" />
            </Card>
          </section>
        </div>
        <Outline of={page} />
      </div>
    );
  },
};
