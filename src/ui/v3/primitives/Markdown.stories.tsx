import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Markdown } from "./Markdown";
import { ProseCard } from "./ProseCard";

const meta: Meta<typeof Markdown> = { title: "v3/Primitives/Fläche/Markdown", component: Markdown };
export default meta;
type Story = StoryObj<typeof Markdown>;

const REPORT = `## Warum 6815 und nicht 6820

Der Kreditor **Bürobedarf Meier GmbH** wurde in den letzten sechs Monaten
14-mal auf 6815 gebucht. Die Rechnung nennt *Schreibwaren*.

- Wiederkehr-Regel \`bueromaterial-meier\` greift nicht: Betrag über 500,00 €
- Kein Bewirtungsbeleg, also kein 6640
- Steuerschlüssel 9 folgt aus dem ausgewiesenen Satz von 19 %

| Konto | Bezeichnung | Anteil |
|---|---|---|
| 6815 | Bürobedarf | 14 von 16 |
| 6820 | Fachliteratur | 2 von 16 |

> Bei Beträgen über 1.000,00 € prüft die Kanzlei den Beleg selbst.

Mehr dazu im [Kontenblatt](#) oder in der Regel:

\`\`\`
regel: bueromaterial-meier
grenze: 500,00
konto: 6815
\`\`\`
`;

/** Ein echter Agentenbericht: Überschrift, Liste, Tabelle, Zitat, Code, Link. */
export const Gefuellt: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Markdown text={REPORT} />
    </div>
  ),
};

/** `null` und Leerraum rendern **nichts** — kein leerer Kasten, kein „—". */
export const Leer: Story = {
  render: () => (
    <div style={{ maxWidth: 560, display: "grid", gap: "var(--space-3)" }}>
      <div style={{ border: "1px dashed var(--color-border)", padding: 10 }}>
        <Markdown text={null} />
      </div>
      <div style={{ border: "1px dashed var(--color-border)", padding: 10 }}>
        <Markdown text="   " />
      </div>
      <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
        Beide Kästen sind leer — die Komponente rendert nichts.
      </p>
    </div>
  ),
};

/** `inline` lässt nur Betonung, Code und Links — für Zelle und Zeile. */
export const Varianten: Story = {
  render: () => {
    const t = "Konto **6815** laut Regel `bueromaterial-meier`, siehe [Kontenblatt](#).";
    return (
      <div style={{ maxWidth: 560, display: "grid", gap: "var(--space-4)" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>full</div>
          <Markdown text={t} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>inline, in einer Zeile</div>
          <span style={{ fontSize: 13.5 }}>
            RE-4471 · <Markdown text={t} variant="inline" />
          </span>
        </div>
      </div>
    );
  },
};

/**
 * `flow` ignoriert die harten Zeilenumbrüche der Quelle. Für Texte, die im
 * Repo auf 80 Zeichen umbrochen liegen — ohne die Prop bliebe jeder Umbruch
 * stehen, und das brauchen Klärungstexte, die jemand von Hand gesetzt hat.
 */
export const Flow: Story = {
  render: () => {
    const wrapped = `Der Kreditor wurde in den letzten sechs Monaten
14-mal auf 6815 gebucht. Die Rechnung nennt
Schreibwaren und zwei Druckerpatronen.`;
    return (
      <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 460 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>ohne flow</div>
          <Markdown text={wrapped} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>mit flow</div>
          <Markdown text={wrapped} flow />
        </div>
      </div>
    );
  },
};

/** `maxHeight` blendet aus und bietet „Ganz lesen" — ohne eine Zeile Zustand. */
export const Lang: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Markdown text={REPORT + "\n" + REPORT} maxHeight={220} />
    </div>
  ),
};

/**
 * Nichts davon wirkt: Roh-HTML bleibt Text, `javascript:` verliert den Link,
 * ein Bild wird nicht geladen. Ohne rote Meldung — ein Agent, der so etwas
 * schreibt, ist kein Anlass für eine Warnung an die Buchhalterin.
 */
export const Unsicher: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Markdown
        text={`<script>alert(1)</script> bleibt Text.

<b>Roh-HTML</b> wird nicht ausgeführt.

[Bitte hier klicken](javascript:alert(1)) — der Link ist weg, das Wort bleibt.

![Bild](https://example.com/bild.png) wird nicht geladen.

[Echter Link](https://example.com) funktioniert.`}
      />
    </div>
  ),
};

/** Im Einsatz: als Begründung am Sachverhalt, in der `ProseCard`. */
export const ImEinsatz: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ProseCard title="Begründung des Agenten">
        <Markdown text={REPORT} />
      </ProseCard>
    </div>
  ),
};
