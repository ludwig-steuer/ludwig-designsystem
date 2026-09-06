import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DOCUMENT_LIST_COLUMNS,
  INBOX_COLUMNS,
  SUBMIT_COLUMNS,
  sourceDocumentColumns,
  sourceDocumentTracks,
  type SourceDocumentColumn,
} from "./source-document-columns";
import type { SourceDocumentVM } from "./SourceDocument";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";

const meta: Meta = {
  title: "v3/Entitäten/Beleg/SourceDocumentColumns",
};
export default meta;
type Story = StoryObj;

const href = (d: SourceDocumentVM) => `#beleg-${d.id}`;
const caseHref = (id: string) => `#fall-${id}`;

const DOCS: SourceDocumentVM[] = [
  {
    id: "d1",
    fileName: "RE-4471-Bürobedarf-Meier.pdf",
    sourceDocType: "invoice",
    classDocumentForm: "commercial_invoice",
    counterparty: "Bürobedarf Meier GmbH",
    detail: { kind: "invoice", number: "RE-4471", gross: 1249.9, currency: "EUR" },
    documentDate: "2026-08-26",
    receivedDate: "2026-08-27",
    completedAt: "2026-08-30T09:12:00Z",
    completedVia: "booking",
    docCategory: "performance",
    docDirection: "inbound",
    caseNumber: "2026-0412",
    processingStatus: "booked",
    inboxStatus: "classified",
    classConfidence: "green",
    sizeBytes: 412_000,
  },
  {
    id: "d2",
    fileName: "Kontoauszug-2026-08-Commerzbank.pdf",
    sourceDocType: "bank_statement_pdf",
    classDocumentForm: "bank_statement",
    counterparty: "Commerzbank",
    documentDate: "2026-08-31",
    receivedDate: "2026-09-01",
    completedAt: null,
    docCategory: "payment",
    processingStatus: "extracted",
    inboxStatus: "classified",
    classConfidence: "yellow",
    sizeBytes: 2_400_000,
  },
  {
    id: "d3",
    fileName: "Mietvertrag-Bueroflaeche-2026.pdf",
    sourceDocType: "contract",
    classDocumentForm: "contract",
    counterparty: "Immobilien Musterstadt KG",
    detail: { kind: "contract", subject: "Büroflächen Erdgeschoss" },
    documentDate: "2026-01-15",
    receivedDate: "2026-08-20",
    completedAt: null,
    docCategory: "foundation",
    processingStatus: null,
    inboxStatus: "classified",
    classConfidence: "green",
    sizeBytes: 8_100_000,
  },
  {
    id: "d4",
    fileName: "Scan-2026-09-01-14-32-08.pdf",
    sourceDocType: null,
    classDocumentForm: "other",
    counterparty: null,
    documentDate: null,
    receivedDate: "2026-09-01",
    completedAt: null,
    processingStatus: null,
    inboxStatus: "pending_classification",
    classConfidence: null,
    sizeBytes: 19_800_000,
  },
];

function Frame({
  title,
  sub,
  columns,
  children,
  minWidth,
}: {
  title: string;
  sub: string;
  columns: ReturnType<typeof sourceDocumentColumns>;
  children?: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div style={{ maxWidth: 1500 }}>
      <Card>
        <CardHead title={title} sub={sub} />
        <Table cols={sourceDocumentTracks(columns)} minWidth={minWidth}>
          <HeadRow>
            {columns.map((c) => (
              <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                {c.header}
                {c.key === "processing" ? <StatusInfoButton axis="beleg" /> : null}
                {c.key === "completed" ? <StatusInfoButton axis="beleg_erledigung" /> : null}
                {c.key === "inboxState" ? <StatusInfoButton axis="beleg_inbox" /> : null}
                {c.key === "confidence" ? <StatusInfoButton axis="konfidenz" /> : null}
              </span>
            ))}
          </HeadRow>
          {children ??
            DOCS.map((d) => (
              <Row key={d.id}>
                {columns.map((c) => (
                  <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                    {c.cell(d)}
                  </span>
                ))}
              </Row>
            ))}
        </Table>
      </Card>
    </div>
  );
}

/**
 * Der volle Satz der Belegliste des Jahres: zehn Punkte, der Gegenpart führt
 * und trägt den Zeilenlink, Eingang ist der Sortierschlüssel.
 */
export const DocumentList: Story = {
  render: () => (
    <Frame
      title="Belege 2026"
      sub="Musterbau GmbH · nach Eingang"
      columns={sourceDocumentColumns({ href, caseHref })}
      minWidth={1840}
    />
  ),
};

/**
 * Upload & Inbox: **die Datei führt.** Der Eingang kennt weder Jahr noch
 * Sachverhalt, und der Gegenpart ist das *Ergebnis* der Einordnung — ihn
 * voranzustellen verspräche eine Antwort, die die Zeile noch nicht hat.
 *
 * Die Auswahl ist **verdreht übergeben**: `columns` wählt aus, es ordnet
 * nicht um.
 */
export const Inbox: Story = {
  render: () => {
    const picked: SourceDocumentColumn[] = ["inboxState", "confidence", "classification", "fileName"];
    return (
      <Frame
        title="Upload & Inbox"
        sub="Musterbau GmbH · jahresunabhängig"
        columns={sourceDocumentColumns({ href, columns: picked })}
      />
    );
  },
};

/** Beleg einreichen: die Größe steht **nur** hier — 25 MB ist die Grenze. */
export const Submit: Story = {
  render: () => (
    <Frame
      title="Beleg einreichen"
      sub="Eingeordnet, noch nicht übergeben"
      columns={sourceDocumentColumns({ href, columns: SUBMIT_COLUMNS })}
    />
  ),
};

/**
 * Rand: ein Beleg ohne Gegenpart führt mit dem **Dateinamen**, ein Vertrag hat
 * keinen Betrag (die Zelle bleibt leer, kein Gedankenstrich — er hätte keinen),
 * ein Scan ohne Belegdatum zeigt „—", und ein 96-Zeichen-Name kürzt in der
 * Mitte, damit die Endung lesbar bleibt.
 */
export const Edges: Story = {
  render: () => (
    <Frame
      title="Belege 2026"
      sub="Randfälle"
      columns={sourceDocumentColumns({ href, caseHref })}
      minWidth={1840}
    >
      {[
        DOCS[3]!,
        DOCS[2]!,
        {
          ...DOCS[0]!,
          id: "d9",
          fileName:
            "Sammelrechnung-Bürobedarf-Meier-GmbH-August-2026-Positionen-1-bis-47-Nachtrag.pdf",
          counterparty: null,
          detail: null,
          documentDate: null,
        },
      ].map((d) => {
        const cols = sourceDocumentColumns({ href, caseHref });
        return (
          <Row key={d.id}>
            {cols.map((c) => (
              <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                {c.cell(d)}
              </span>
            ))}
          </Row>
        );
      })}
    </Frame>
  ),
};

/** Die drei Sätze nebeneinander — dieselben Zellen, drei Fragen. */
export const AllThree: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <Frame
        title="Belegliste des Jahres"
        sub={`${DOCUMENT_LIST_COLUMNS.length} Punkte`}
        columns={sourceDocumentColumns({ href, caseHref })}
        minWidth={1840}
      />
      <Frame
        title="Upload & Inbox"
        sub={`${INBOX_COLUMNS.length} Punkte`}
        columns={sourceDocumentColumns({ href, columns: INBOX_COLUMNS })}
      />
      <Frame
        title="Beleg einreichen"
        sub={`${SUBMIT_COLUMNS.length} Punkte`}
        columns={sourceDocumentColumns({ href, columns: SUBMIT_COLUMNS })}
      />
    </div>
  ),
};
