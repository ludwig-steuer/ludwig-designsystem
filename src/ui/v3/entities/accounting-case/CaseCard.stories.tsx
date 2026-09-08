import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Row, Table } from "../../primitives/Table";
import { CaseCard, type CaseCardData } from "./CaseCard";

const meta: Meta<typeof CaseCard> = {
  title: "v3/Entitäten/Sachverhalt/CaseCard",
  component: CaseCard,
};
export default meta;
type Story = StoryObj<typeof CaseCard>;

const CASE = (over: Partial<CaseCardData> = {}): CaseCardData => ({
  caseId: "c-4412",
  caseNumber: "2026-0412",
  fiscalYear: 2026,
  title: "Wartung der Klimaanlage",
  kind: "incoming_invoice",
  counterpartyName: "Bürobedarf Meier GmbH",
  lifecycleStatus: "open",
  // `totalAmount` ist der Betrag des Sachverhalts (Rang 4); `CaseLink.amount`
  // gehört dem Bankauszug und wird hier nicht gesetzt (Abnahme M1).
  totalAmount: 1249.9,
  currency: "EUR",
  summary:
    "Halbjährliche Wartung der Anlage im Obergeschoss. Die Rechnung liegt vor, " +
    "der Beleg ist zugeordnet, die Buchung steht als Vorschlag zur Abnahme.",
  disposition: "accounting",
  ...over,
});

const Belege = () => (
  <Table cols="120px 1fr 130px">
    <Row>
      <span>26.08.2026</span>
      <span>Rechnung RE-4471</span>
      <span className="v2num">1.249,90 €</span>
    </Row>
    <Row>
      <span>27.08.2026</span>
      <span>Lieferschein LS-8842</span>
      <span className="v2num">—</span>
    </Row>
  </Table>
);

const Rahmen = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 720, padding: "var(--space-6)", display: "grid", gap: "var(--space-5)" }}>
    {children}
  </div>
);

/**
 * Der volle Fall: Kopf mit Anzeigename, Zustand und Kennung; darunter eine
 * Zeile Fakten — Art, Betrag, Gegenpart, Zuständigkeit — und die
 * Zusammenfassung. Was unter dem Fall hängt, steht in der Fläche darunter.
 *
 * Bearbeitungsstand und Zuständigkeit stehen hier, weil das Profil genau diese
 * zwei als Lücke der heutigen Abnahmeliste nennt; beide kommen aus der
 * Registry, nicht aus einer Map in dieser Datei.
 */
export const Filled: Story = {
  render: () => (
    <Rahmen>
      <CaseCard case={CASE()} href="#c-4412">
        <Belege />
      </CaseCard>
    </Rahmen>
  ),
};

/**
 * Ohne Kinder fällt die Fläche darunter **samt Abstand** weg. Eine Karte ohne
 * Unterlisten darf nicht aussehen, als fehlte dort etwas.
 */
export const WithoutSubLists: Story = {
  render: () => (
    <Rahmen>
      <CaseCard case={CASE()} href="#c-4412" />
    </Rahmen>
  ),
};

/**
 * **Der Rand.** Vier Fälle nebeneinander:
 *
 * 1. eine Zusammenfassung von 720 Zeichen (Maximum aus Staging) — gekürzt auf
 *    160, der ganze Text im `title`;
 * 2. ein Fall **ohne `title`**: der Anzeigename entsteht aus der
 *    Rückfallkette, und deshalb steht der Gegenpart nicht noch einmal in der
 *    Faktenzeile;
 * 3. ein Fall **ohne Nummer**: die Kennung fällt auf die ersten acht Zeichen
 *    der id zurück, wie überall in der Familie;
 * 4. ein Fall **ohne Gegenpart und ohne Betrag** — dann steht dort nichts,
 *    kein Gedankenstrich;
 * 5. ein Fall **weder mit Titel noch mit Gegenpart**: die Rückfallkette hat
 *    nichts, woraus sie einen Anzeigenamen baut, und die Art steht dann
 *    **einmal** — im Namen, nicht noch einmal in der Faktenzeile. Dazu
 *    `summaryLimit={40}`, die einzige Stelle, an der die Kürzung wirklich
 *    greift: nur eine gekürzte Zusammenfassung trägt den vollen Text im
 *    `title` (Abnahme 2026-09-08, M2/M3/M6).
 */
export const Edges: Story = {
  render: () => (
    <Rahmen>
      <CaseCard
        case={CASE({
          summary:
            "Die Sanierung des Serverraums umfasst Klimatechnik, Brandschutz und Zugangskontrolle. " +
            "Der zweite Bauabschnitt betrifft die Nordseite des Gebäudes und wurde im August begonnen. " +
            "Die Abschlagsrechnung deckt die bereits erbrachten Leistungen ab; die Schlussrechnung folgt " +
            "nach der Abnahme durch den Sachverständigen. Die Kanzlei hat die Aufteilung auf die Konten " +
            "geprüft und die Vorsteuer entsprechend aufgeteilt. Der Vorgang bleibt offen, bis die " +
            "Schlussrechnung vorliegt und der Restbetrag gebucht ist.",
          totalAmount: 1284900.55,
        })}
      />
      <CaseCard case={CASE({ title: null, kind: "recurring_charge", counterpartyName: "Telekom Deutschland GmbH", totalAmount: -89.9 })} />
      <CaseCard case={CASE({ caseId: "c-9002abcdef01", caseNumber: null, fiscalYear: null, title: "Vortrag ohne Jahr" })} />
      <CaseCard
        case={CASE({
          title: "Umbuchung Verrechnungskonto",
          kind: "internal_transfer",
          counterpartyName: null,
          totalAmount: null,
          summary: null,
          disposition: null,
        })}
      />
      <CaseCard
        case={CASE({ title: null, counterpartyName: null, kind: "internal_transfer" })}
        summaryLimit={40}
      />
    </Rahmen>
  ),
};

/**
 * Im Einsatz: die Abnahmeliste. Der **Gruppenkopf** gehört der Liste, nicht
 * der Karte — der Abnahme-Bucket ist eine Aussage über die Gruppe, nicht über
 * den einzelnen Fall. Was die Liste je Karte sagen will, steht in `aside`;
 * hier ist es ihre Auswahl.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 900, padding: "var(--space-6)" }}>
      <div className="v2grpbtn" style={{ marginBottom: "var(--space-3)" }}>
        <span>Prüfen · 3</span>
        <span className="v2grpbtn__n">Buchungsvorschläge dieses Laufs</span>
      </div>
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {[CASE(), CASE({ caseId: "c-4413", caseNumber: "2026-0413", title: "Abschlag Strom 08/2026", kind: "recurring_charge", counterpartyName: "Stadtwerke Musterstadt", amount: -412, lifecycleStatus: "needs_clarification", disposition: "agent", summary: "Monatlicher Abschlag laut Vertrag." }), CASE({ caseId: "c-4414", caseNumber: "2026-0414", title: "Ausgangsrechnung Musterbau", kind: "outgoing_invoice", counterpartyName: "Musterbau GmbH", amount: 1800, summary: "Leistung im August erbracht, Zahlung eingegangen." })].map((c) => (
          <CaseCard
            key={c.caseId}
            case={c}
            href={`#${c.caseId}`}
            aside={
              <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
                <input type="checkbox" defaultChecked={c.caseId === "c-4412"} />
                <span className="lw-caption">übernehmen</span>
              </label>
            }
          >
            <Belege />
          </CaseCard>
        ))}
      </div>
    </div>
  ),
};
