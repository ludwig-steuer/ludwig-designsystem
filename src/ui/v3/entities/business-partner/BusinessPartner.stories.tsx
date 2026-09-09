import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardHead, Table, HeadRow, Row } from "../../primitives/Table";
import { FieldList } from "../../primitives/FieldList";
import { BusinessPartnerCell } from "./BusinessPartner";

const meta: Meta<typeof BusinessPartnerCell> = {
  title: "v3/Entitäten/Geschäftspartner/BusinessPartnerCell",
  component: BusinessPartnerCell,
};
export default meta;
type Story = StoryObj<typeof BusinessPartnerCell>;

const href = (id: string) => `?partner=${id}`;

function Frame({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <Card>
        <CardHead title="Geschäftspartner" {...(sub ? { sub } : {})} />
        <div style={{ display: "grid", gap: 12, padding: 16 }}>{children}</div>
      </Card>
    </div>
  );
}

/**
 * Der Regelfall in beiden Ausprägungen: mit Weg und ohne. Ohne `href` ist die
 * Zelle Text — nicht jeder Ort, an dem ein Partner genannt wird, hat einen Weg
 * zu ihm.
 */
export const Filled: Story = {
  render: () => (
    <Frame sub="mit und ohne Weg">
      <BusinessPartnerCell name="Musterfirma Immobilien GmbH" href={href("p-1")} />
      <BusinessPartnerCell name="Musterfirma Immobilien GmbH" />
    </Frame>
  ),
};

/**
 * Der Kurzname steht **nur**, wenn er etwas sagt. Drei Fälle nebeneinander:
 * abweichend (steht), gleich (entfällt), Kürzung des Namens (entfällt).
 *
 * Der dritte ist der häufige: der DATEV-Kurzname ist auf 15 Zeichen begrenzt,
 * und 53 % der Sätze liegen exakt am Anschlag — dort ist er der Name mit
 * abgeschnittenem Ende und wiederholt ihn nur.
 */
export const WithShortName: Story = {
  render: () => (
    <Frame sub="abweichend · gleich · Kürzung">
      <BusinessPartnerCell name="Musterfirma Immobilien GmbH" shortName="MUSTERIMMO" />
      <BusinessPartnerCell name="Beispiel-Energie AG" shortName="Beispiel-Energie AG" />
      <BusinessPartnerCell name="Musterbau Handels GmbH" shortName="Musterbau Hande" />
    </Frame>
  ),
};

/**
 * Die Personenkonto-Nummer hinter dem Namen. Die **Rolle kommt mit der Prop**,
 * nicht aus dem Satz: `PartnerAccountRef` trägt nur `accountNumber` und
 * `isInternal`, und welche Rolle es ist, weiß der Aufrufer aus dem Schlüssel,
 * unter dem er sie geholt hat.
 *
 * Mit `href` umschließt der Anker **nur den Namen** — die Nummer hat in der
 * Liste ihren eigenen Weg, und zwei Ziele in einem Anker wären I11 verletzt.
 */
export const WithAccount: Story = {
  render: () => (
    <Frame sub="Kreditor · Debitor · ohne Konto">
      <BusinessPartnerCell
        name="Musterfirma Immobilien GmbH"
        href={href("p-1")}
        account={{ number: "70001", role: "creditor" }}
      />
      <BusinessPartnerCell
        name="Musterbau Handels GmbH"
        href={href("p-2")}
        account={{ number: "10042", role: "debtor" }}
      />
      <BusinessPartnerCell name="Beispiel-Energie AG" href={href("p-3")} />
    </Frame>
  ),
};

/**
 * Der Rand: 50 Zeichen (das Maximum im Bestand), genau 36 (die Grenze), ein
 * Name aus einer Ziffernfolge, eine Kontonummer mit führender Null — die bleibt
 * stehen, denn speichern heißt zeigen (GLOSSARY „Account number canon").
 */
export const Edges: Story = {
  render: () => (
    <Frame sub="50 Zeichen · genau 36 · Ziffernname · führende Null">
      <BusinessPartnerCell
        name="Musterfirma Immobilienverwaltung Nord GmbH & Co. KG"
        href={href("p-4")}
      />
      <BusinessPartnerCell name="Musterfirma Immobilienverwaltung Nor" href={href("p-5")} />
      <BusinessPartnerCell name="0815 Beteiligungs GmbH" account={{ number: "0700123", role: "creditor" }} />
      <BusinessPartnerCell name="Kurz AG" limit={4} href={href("p-6")} />
    </Frame>
  ),
};

/**
 * Im Einsatz an den beiden Orten, an denen die drei handgeschriebenen
 * Namensausgaben heute stehen: in einer Faktenzeile (so stellt `CaseFacts` sie)
 * und in einer Tabellenzelle (so `account-columns`).
 */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 860 }}>
      <Card>
        <CardHead title="Sachverhalt 2026-0413" sub="Fakten" />
        <div style={{ padding: 16 }}>
          <FieldList
            tone="bare"
            rows={[
              ["Gegenpart", <BusinessPartnerCell key="p" name="Musterfirma Immobilien GmbH" shortName="MUSTERIMMO" href={href("p-1")} />],
              ["Betrag", "1.800,00 €"],
            ]}
          />
        </div>
      </Card>
      <Card>
        <CardHead title="Konten" sub="Spalte „Geschäftspartner“" />
        <Table cols="120px 1fr 140px" minWidth={620}>
          <HeadRow>
            <span>Konto</span>
            <span>Geschäftspartner</span>
            <span>Art</span>
          </HeadRow>
          <Row>
            <span>70001</span>
            <BusinessPartnerCell name="Musterfirma Immobilien GmbH" href={href("p-1")} />
            <span>Kreditor</span>
          </Row>
          <Row>
            <span>10042</span>
            <BusinessPartnerCell name="Musterbau Handels GmbH" href={href("p-2")} />
            <span>Debitor</span>
          </Row>
        </Table>
      </Card>
    </div>
  ),
};
