import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CopyTextButton } from "./CopyTextButton";
import { Card, CardHead } from "./Table";
import { FieldList } from "./FieldList";

const meta: Meta<typeof CopyTextButton> = {
  title: "v3/Primitives/Aktion/CopyTextButton",
  component: CopyTextButton,
};
export default meta;
type Story = StoryObj<typeof CopyTextButton>;

const SATZ =
  "26.08.2026\t1.249,90\tS\t51\t6815\t1200\tRE-4471\tWartung Klimaanlage 08/2026";

const Rahmen = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "var(--space-6)", display: "grid", gap: "var(--space-4)", justifyItems: "start" }}>
    {children}
  </div>
);

/**
 * Der Klick legt den Text ab und sagt es — **zwei Sekunden lang**, dann steht
 * wieder die Aufschrift da. Das ist die einzige Rückmeldung, die es gibt: was
 * die Zwischenablage danach hält, kann keine Seite lesen.
 */
export const Filled: Story = {
  render: () => (
    <Rahmen>
      <CopyTextButton text={SATZ} label="Buchungssatz kopieren" />
    </Rahmen>
  ),
};

/**
 * Die Zwischenablage verweigert — kein sicherer Kontext, keine Berechtigung.
 * Der Satz steht am Knopf, die Aufschrift bleibt im Ruhezustand: ein
 * Fehlschlag darf nicht aussehen wie ein Erfolg, der nicht kam.
 *
 * Die Vorlage in der App hatte diesen Fall nicht — sie `await`ete ohne
 * `catch`, und der Klick verpuffte stumm.
 */
export const Failed: Story = {
  render: function Render() {
    // Der Stub steht in der Story, nicht in der Komponente: das Set kennt
    // keine Testumgebung, und die Zwischenablage lässt sich nicht anders
    // zum Scheitern bringen.
    if (typeof navigator !== "undefined") {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new Error("Not allowed")),
        },
      });
    }
    return (
      <Rahmen>
        <CopyTextButton text={SATZ} label="Buchungssatz kopieren" />
      </Rahmen>
    );
  },
};

/** Größen und Varianten — der Knopf reicht beides an `Button` durch. */
export const Sizes: Story = {
  render: () => (
    <Rahmen>
      <CopyTextButton text={SATZ} label="Kopieren" size="xs" variant="tertiary" />
      <CopyTextButton text={SATZ} label="Kopieren" size="sm" />
      <CopyTextButton text={SATZ} label="Kopieren" size="md" variant="primary" />
    </Rahmen>
  ),
};

/**
 * Im Einsatz: neben dem Buchungssatz, den er kopiert. Der `title` trägt den
 * vollen Text, weil die Aufschrift ihn nicht fassen kann.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <Card>
        <CardHead
          title="DATEV-Wahrheit"
          sub="Buchung 2026-0412"
          actions={
            <CopyTextButton
              text={SATZ}
              label="Buchungssatz kopieren"
              title={SATZ}
              size="xs"
              variant="tertiary"
            />
          }
        />
        <div style={{ padding: "var(--space-5)" }}>
          <FieldList
            rows={[
              ["Datum", "26.08.2026"],
              ["Betrag", "1.249,90 €"],
              ["Konto", "6815"],
              ["Gegenkonto", "1200"],
            ]}
          />
        </div>
      </Card>
    </div>
  ),
};
