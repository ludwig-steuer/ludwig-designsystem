import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DOCUMENT_LIST_COLUMNS,
  INBOX_COLUMNS,
  STUCK_COLUMNS,
  SUBMIT_COLUMNS,
  sourceDocumentColumns,
  sourceDocumentMinWidth,
  type SourceDocumentColumn,
} from "./source-document-columns";
import { formQualifiesForInvoiceFlow } from "@/ludwig/modules/source-docs/domain/document-form-mapping";
import type { SourceDocumentVM } from "./SourceDocument";
import { DataTable } from "../../patterns/DataTable";

const meta: Meta = {
  title: "v3/Entitäten/Beleg/SourceDocumentColumns",
};
export default meta;
type Story = StoryObj;

const href = (d: SourceDocumentVM) => `#beleg-${d.id}`;
const caseHref = (id: string) => `#fall-${id}`;
const listHref = (p: { sort?: string; dir?: string; page?: number }) =>
  `#liste?sort=${p.sort ?? ""}&dir=${p.dir ?? ""}&page=${p.page ?? 1}`;

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
    processingStatus: "processed",
    inboxStatus: "classified",
    classConfidence: 0.94,
    byteSize: 412_000,
    hasInvoiceRow: true,
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
    processingStatus: "in_progress",
    inboxStatus: "classified",
    classConfidence: 0.71,
    byteSize: 2_400_000,
    hasInvoiceRow: true,
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
    processingStatus: "review_needed",
    inboxStatus: "classified",
    classConfidence: 0.88,
    byteSize: 8_100_000,
    hasInvoiceRow: false,
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
    processingStatus: "failed",
    inboxStatus: "pending_classification",
    classConfidence: null,
    byteSize: 19_800_000,
    hasInvoiceRow: false,
  },
];

/**
 * Everything the submit list may hold: classified **and** a qualifying
 * document form. The second half is the point of the list — a bank statement
 * is classified and will never be submitted (`invoiceFlow: false`), and with
 * the form in its own column one could read the contradiction word by word.
 */
const SUBMITTABLE: SourceDocumentVM[] = [
  ...DOCS.filter(
    (d) => d.inboxStatus === "classified" && formQualifiesForInvoiceFlow(d.classDocumentForm),
  ),
  {
    ...DOCS[0]!,
    id: "d5",
    fileName: "Bewirtung-2026-08-14-Gasthaus-Adler.pdf",
    classDocumentForm: "hospitality_receipt",
    counterparty: "Gasthaus Adler",
    detail: { kind: "invoice", number: "B-2026-0814", gross: 128.4, currency: "EUR" },
    byteSize: 1_100_000,
  },
  {
    ...DOCS[0]!,
    id: "d6",
    fileName: "Tankbeleg-2026-08-22.pdf",
    classDocumentForm: "fuel_receipt",
    counterparty: "Tankstelle Musterstadt",
    detail: { kind: "invoice", number: "T-88213", gross: 96.5, currency: "EUR" },
    byteSize: 240_000,
  },
];

const PAGER = { page: 1, pageSize: 25, totalItems: 102, totalPages: 5 };

/** Einer mit Rechnungszeile, einer ohne — die zwei Eingaben der Achse. */
const STUCK_PAIR: SourceDocumentVM[] = [DOCS[3]!, { ...DOCS[2]!, hasInvoiceRow: true }];

/**
 * Der volle Satz der Belegliste des Jahres: zehn Punkte, der Gegenpart führt
 * und trägt den Zeilenlink, Eingang ist der Sortierschlüssel. Über `DataTable`,
 * damit die Sortierung, die der Katalog anbietet, auch stattfindet.
 */
export const DocumentList: Story = {
  render: () => {
    const cols = sourceDocumentColumns({ href, caseHref });
    return (
      <div style={{ maxWidth: 1900 }}>
        <DataTable<SourceDocumentVM>
          rows={DOCS}
          columns={cols}
          rowKey={(d) => d.id}
          head={{ title: "Belege 2026", sub: "Musterbau GmbH · nach Eingang" }}
          minWidth={sourceDocumentMinWidth(cols)}
          sort={{ key: "receivedDate", dir: "desc" }}
          href={listHref}
          pager={PAGER}
          empty={{ title: "In dieser Periode ist kein Beleg eingegangen." }}
        />
      </div>
    );
  },
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
    const cols = sourceDocumentColumns({ href, columns: picked });
    return (
      <div style={{ maxWidth: 1100 }}>
        <DataTable<SourceDocumentVM>
          rows={DOCS}
          columns={cols}
          rowKey={(d) => d.id}
          head={{ title: "Upload & Inbox", sub: "Musterbau GmbH · jahresunabhängig" }}
          minWidth={sourceDocumentMinWidth(cols)}
          empty={{ title: "Es ist nichts hochgeladen." }}
        />
      </div>
    );
  },
};

/**
 * Beleg einreichen: die Größe steht **nur** hier — 25 MB ist die Grenze — und
 * die zweite Spalte ist die **Belegform**, nicht die Belegart. Die
 * Grundgesamtheit ist „eingeordnet **und** qualifizierende Belegform"; die
 * Form ist also das Kriterium, das hier geprüft wird.
 */
export const Submit: Story = {
  render: () => {
    const cols = sourceDocumentColumns({ href, columns: SUBMIT_COLUMNS });
    return (
      <div style={{ maxWidth: 1100 }}>
        <DataTable<SourceDocumentVM>
          rows={SUBMITTABLE}
          columns={cols}
          rowKey={(d) => d.id}
          head={{ title: "Beleg einreichen", sub: "Eingeordnet, noch nicht übergeben" }}
          minWidth={sourceDocumentMinWidth(cols)}
          empty={{ title: "Es ist nichts einzureichen.", done: true }}
        />
      </div>
    );
  },
};

/**
 * Stockende Belege, beide Ausprägungen: **derselbe** Spaltensatz, dieselbe
 * Reihenfolge — was sich unterscheidet, ist die Grundgesamtheit und das, was
 * die Achse `beleg_haenger` über denselben Beleg sagt. Und: hier führt die
 * **Datei**, obwohl der Gegenpart im Satz steht — ein Beleg, der stockt, hat
 * meist noch keinen, denn der ist das Ergebnis der ausgebliebenen Extraktion.
 */
export const Stuck: Story = {
  render: () => {
    const stuck = sourceDocumentColumns({
      href,
      caseHref,
      columns: STUCK_COLUMNS,
      lead: "fileName",
      stuckVariant: "stuck",
    });
    const inflight = sourceDocumentColumns({
      href,
      caseHref,
      columns: STUCK_COLUMNS,
      lead: "fileName",
      stuckVariant: "inflight",
    });
    return (
      <div style={{ maxWidth: 1400, display: "grid", gap: "var(--space-6)" }}>
        {/* **Dieselben zwei Belege** in beiden Tabellen — einer mit
            Rechnungszeile, einer ohne. Nur so fallen alle vier Werte der
            Achse: „nicht extrahiert" und „Datum fehlt" hier, „wird
            klassifiziert" und „wird extrahiert" darunter. */}
        <DataTable<SourceDocumentVM>
          rows={STUCK_PAIR}
          columns={stuck}
          rowKey={(d) => d.id}
          head={{ title: "Problematische Belege", sub: "Ohne Extraktion oder ohne Belegdatum" }}
          minWidth={sourceDocumentMinWidth(stuck)}
          empty={{ title: "Kein Beleg steckt fest.", done: true }}
        />
        <DataTable<SourceDocumentVM>
          rows={STUCK_PAIR}
          columns={inflight}
          rowKey={(d) => d.id}
          head={{ title: "In Verarbeitung", sub: "Die Pipeline läuft noch" }}
          minWidth={sourceDocumentMinWidth(inflight)}
          empty={{ title: "Nichts ist mehr in Arbeit.", done: true }}
        />
      </div>
    );
  },
};

/**
 * Rand: ein Beleg ohne Gegenpart führt mit dem **Dateinamen**, ein Vertrag hat
 * keinen Betrag (die Zelle bleibt leer, kein Gedankenstrich — er hätte keinen),
 * ein Scan ohne Belegdatum zeigt „—", und ein 96-Zeichen-Name kürzt in der
 * Mitte, damit die Endung lesbar bleibt.
 */
export const Edges: Story = {
  render: () => {
    const cols = sourceDocumentColumns({ href, caseHref });
    return (
      <div style={{ maxWidth: 1900 }}>
        <DataTable<SourceDocumentVM>
          rows={[
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
            {
              // Ein Betrag **ohne Währung**: er steht als blanke Zahl da. Ein
              // stilles „€" wäre eine erfundene Tatsache — bei einer Rechnung
              // aus der Schweiz die falsche.
              ...DOCS[0]!,
              id: "d10",
              fileName: "Invoice-CH-8841.pdf",
              counterparty: "Alpine Systems AG",
              detail: { kind: "invoice", number: "8841", gross: 2480, currency: null },
            },
          ]}
          columns={cols}
          rowKey={(d) => d.id}
          head={{ title: "Belege 2026", sub: "Randfälle" }}
          minWidth={sourceDocumentMinWidth(cols)}
          empty={{ title: "Kein Beleg." }}
        />
      </div>
    );
  },
};

/** Die vier Sätze nebeneinander — dieselben Zellen, vier Fragen. */
export const AllFour: Story = {
  render: () => {
    const list = sourceDocumentColumns({ href, caseHref });
    const inbox = sourceDocumentColumns({ href, columns: INBOX_COLUMNS });
    const submit = sourceDocumentColumns({ href, columns: SUBMIT_COLUMNS });
    const stuck = sourceDocumentColumns({
      href,
      caseHref,
      columns: STUCK_COLUMNS,
      lead: "fileName",
    });
    return (
      <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 1900 }}>
        <DataTable<SourceDocumentVM>
          rows={DOCS}
          columns={list}
          rowKey={(d) => d.id}
          head={{ title: "Belegliste des Jahres", sub: `${DOCUMENT_LIST_COLUMNS.length} Punkte` }}
          minWidth={sourceDocumentMinWidth(list)}
          empty={{ title: "Kein Beleg." }}
        />
        <DataTable<SourceDocumentVM>
          rows={DOCS}
          columns={inbox}
          rowKey={(d) => d.id}
          head={{ title: "Upload & Inbox", sub: `${INBOX_COLUMNS.length} Punkte` }}
          minWidth={sourceDocumentMinWidth(inbox)}
          empty={{ title: "Nichts hochgeladen." }}
        />
        <DataTable<SourceDocumentVM>
          rows={SUBMITTABLE}
          columns={submit}
          rowKey={(d) => d.id}
          head={{ title: "Beleg einreichen", sub: `${SUBMIT_COLUMNS.length} Punkte` }}
          minWidth={sourceDocumentMinWidth(submit)}
          empty={{ title: "Nichts einzureichen.", done: true }}
        />
        <DataTable<SourceDocumentVM>
          rows={[DOCS[3]!, DOCS[2]!]}
          columns={stuck}
          rowKey={(d) => d.id}
          head={{ title: "Stockende Belege", sub: `${STUCK_COLUMNS.length} Punkte` }}
          minWidth={sourceDocumentMinWidth(stuck)}
          empty={{ title: "Kein Beleg steckt fest.", done: true }}
        />
      </div>
    );
  },
};
