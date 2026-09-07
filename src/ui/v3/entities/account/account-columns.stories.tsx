import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Fragment } from "react";
import {
  ACCOUNT_CATALOG_COLUMNS,
  ACCOUNT_LIST_COLUMNS,
  accountColumns,
  accountMinWidth,
  accountTracks,
  type AccountColumn,
} from "./account-columns";
import { ACCOUNT_CLASS_LABEL, type AccountRow } from "@/ludwig/modules/accounts/domain/account";
import { DataTable } from "../../patterns/DataTable";
import { FilterBar } from "../../primitives/FilterBar";
import { Field, Input, Select } from "../../primitives/Form";
import { KpiGrid, KpiTile } from "../../primitives/KpiTile";
import { PageHeader } from "../../primitives/PageHeader";
import { Link } from "../../primitives/Link";
import { Pagination } from "../../primitives/Pagination";
import { Card, CardHead, GroupRow, HeadRow, Row, Table } from "../../primitives/Table";

const meta: Meta = {
  title: "v3/Entitäten/Konto/AccountColumns",
};
export default meta;
type Story = StoryObj;

const href = (a: AccountRow) => `#konto-${a.accountNumber}`;
const listHref = (p: { sort?: string; dir?: string; page?: number }) =>
  `#konten?sort=${p.sort ?? ""}&dir=${p.dir ?? ""}&page=${p.page ?? 1}`;

const A = (over: Partial<AccountRow>): AccountRow => ({
  key: "client_1",
  origin: "client",
  id: "a1",
  accountNumber: "4930",
  accountName: "Bürobedarf",
  accountingRole: "general_ledger",
  skrClass: "other_operating_expense",
  description: null,
  status: "active",
  source: "imported",
  usageBookingCount: 47,
  lastBookingDate: "2026-08-26",
  skrBaseCode: "4930",
  accountFrameworkCode: null,
  ...over,
});

const ACCOUNTS: AccountRow[] = [
  A({}),
  A({ key: "client_2", id: "a2", accountNumber: "4120", accountName: "Gehälter", skrClass: "personnel_expense", usageBookingCount: 12, lastBookingDate: "2026-08-31" }),
  A({ key: "client_3", id: "a3", accountNumber: "8400", accountName: "Erlöse 19 % USt", accountingRole: "revenue", skrClass: "revenue", usageBookingCount: 318, lastBookingDate: "2026-08-31" }),
  A({ key: "client_4", id: "a4", accountNumber: "70001", accountName: "Bürobedarf Meier GmbH", accountingRole: "creditor", skrClass: "creditor", usageBookingCount: 9, lastBookingDate: "2026-08-26" }),
  A({ key: "client_5", id: "a5", accountNumber: "10001", accountName: "Musterbau GmbH", accountingRole: "debtor", skrClass: "debtor", usageBookingCount: 3, lastBookingDate: "2026-07-14" }),
  A({ key: "client_6", id: "a6", accountNumber: "4650", accountName: "Bewirtungskosten", skrClass: "other_operating_expense", usageBookingCount: 0, lastBookingDate: null, status: "inactive" }),
];

const PARTNERS: Record<string, string> = {
  "70001": "Bürobedarf Meier GmbH",
  "10001": "Musterbau GmbH",
};

const PAGER = { page: 1, pageSize: 50, totalItems: 41_570, totalPages: 832 };

/**
 * Der Standardsatz: sechs Punkte, die Nummer trägt den Zeilenlink, sortiert
 * wird über die URL. Der Kopf sagt, was die Voreinstellung einschränkt —
 * **bebuchte Konten** (`usedOnly`), sonst stünden hier 41.570 Zeilen, von
 * denen 85 % nie eine Buchung gesehen haben.
 */
export const Filled: Story = {
  render: () => {
    const cols = accountColumns({ href });
    return (
      <div style={{ maxWidth: 1300 }}>
        <DataTable<AccountRow>
          rows={ACCOUNTS}
          columns={cols}
          rowKey={(a) => a.key}
          head={{ title: "Konten 2026", sub: "Musterbau GmbH · nur bebuchte · 6.212 von 41.570" }}
          minWidth={accountMinWidth(cols)}
          sort={{ key: "account_number", dir: "asc" }}
          href={listHref}
          pager={{ ...PAGER, totalItems: 6212, totalPages: 125 }}
          empty={{ title: "In diesem Wirtschaftsjahr gibt es keinen Kontenrahmen." }}
        />
      </div>
    );
  },
};

/**
 * Mit dem SKR-Katalog (`scope=all`): **Angelegt** kommt dazu, Buchungen und
 * letzte Buchung gehen — eine Katalogzeile hat beides nicht. Die Auswahl ist
 * **verwürfelt übergeben**: `columns` wählt aus, es ordnet nicht um.
 */
export const Catalog: Story = {
  render: () => {
    const picked: AccountColumn[] = ["origin", "role", "name", "number", "skrClass"];
    // `originLabels` übergeben, weil die App dieselbe Sache heute „SKR-Katalog"
    // nennt (`ACCOUNT_SOURCE_LABEL.reference`) — die Wörter stehen in der
    // Domäne nicht (Befund L-96), also entscheidet sie der Aufrufer.
    const cols = accountColumns({
      href,
      columns: picked,
      originLabels: { client: "im Mandanten", catalog: "SKR-Katalog" },
    });
    return (
      <div style={{ maxWidth: 1300 }}>
        <DataTable<AccountRow>
          rows={[
            ...ACCOUNTS.slice(0, 3),
            A({ key: "skr_skr03_4940", origin: "skr_catalog", id: null, accountNumber: "4940", accountName: "Zeitschriften und Fachliteratur", status: null, source: null, usageBookingCount: null, lastBookingDate: null, accountFrameworkCode: "skr03" }),
            A({ key: "skr_skr03_4980", origin: "skr_catalog", id: null, accountNumber: "4980", accountName: "Sonstiger Betriebsbedarf", status: null, source: null, usageBookingCount: null, lastBookingDate: null, accountFrameworkCode: "skr03" }),
          ]}
          columns={cols}
          rowKey={(a) => a.key}
          head={{ title: "Alle Konten", sub: "Mandant + SKR-Katalog (SKR03)" }}
          minWidth={accountMinWidth(cols)}
          empty={{ title: "Kein Konto." }}
        />
      </div>
    );
  },
};

/**
 * Nach Klasse gruppiert — **die Vorlage für die Seite.** `DataTable` gruppiert
 * nicht, deshalb baut der Aufrufer den Rahmen selbst: `Table` mit
 * `accountTracks()`, eine `GroupRow` je Klasse, und der **Pager bleibt**. Er
 * ist der Grund, warum die heutige gruppierte Ansicht falsch liegt: sie
 * gruppiert den Bestand statt der Seite (Befund L-87).
 *
 * Die SKR-Klasse fällt als Spalte weg — die Gruppenzeile sagt sie schon.
 */
export const Grouped: Story = {
  render: () => {
    const cols = accountColumns({
      href,
      columns: ACCOUNT_LIST_COLUMNS.filter((c) => c !== "skrClass"),
    });
    const groups = new Map<string, AccountRow[]>();
    for (const a of ACCOUNTS) {
      const label = a.skrClass ? ACCOUNT_CLASS_LABEL[a.skrClass] : "Ohne Klasse";
      groups.set(label, [...(groups.get(label) ?? []), a]);
    }
    return (
      <div style={{ maxWidth: 1300 }}>
        <Card>
          <CardHead title="Konten 2026" sub="nach Klasse · nur bebuchte" />
          <Table cols={accountTracks(cols)} minWidth={accountMinWidth(cols)}>
            <HeadRow>
              {cols.map((c) => (
                // `aria-sort` und der ausgeschriebene Name gehören dazu, nicht
                // nur der Link: `DataTable` schreibt beides, und diese Story
                // ist die **Vorlage**, die in die App kopiert wird. Ein
                // Sortierkopf, der seinen Zustand nur mit einem Pfeil sagt,
                // sagt ihn nicht (Z4, Abnahme 0062).
                <th key={c.key} scope="col" aria-sort="none" className={c.align === "end" ? "v2num" : undefined}>
                  {c.sortable ? (
                    <Link
                      className="v2sortlink"
                      href={listHref({ sort: c.key, dir: "asc" })}
                      aria-label={`Nach ${String(c.header)} sortieren — derzeit nicht sortiert`}
                    >
                      {c.header}
                    </Link>
                  ) : (
                    c.header
                  )}
                  {c.headerAside}
                </th>
              ))}
            </HeadRow>
            {[...groups.entries()].map(([label, rows]) => (
              <Fragment key={label}>
                <GroupRow>
                  {label} · {rows.length} {rows.length === 1 ? "Konto" : "Konten"}
                </GroupRow>
                {rows.map((a) => (
                  <Row key={a.key}>
                    {cols.map((c) => (
                      <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                        {c.cell(a)}
                      </span>
                    ))}
                  </Row>
                ))}
              </Fragment>
            ))}
          </Table>
          <Pagination
            page={1}
            totalPages={125}
            totalItems={6212}
            pageSize={50}
            buildHref={(n) => listHref({ page: n })}
          />
        </Card>
      </div>
    );
  },
};

/** Personenkonten mit ihrem Geschäftspartner — 52 % Füllgrad, dort ~100 %. */
export const Personal: Story = {
  render: () => {
    const cols = accountColumns({
      href,
      columns: ["skrClass", "number", "name", "role", "partner", "bookings"],
      partnerName: (a) => PARTNERS[a.accountNumber] ?? null,
      partnerHref: (a) => (PARTNERS[a.accountNumber] ? `#partner-${a.accountNumber}` : undefined),
    });
    return (
      <div style={{ maxWidth: 1300 }}>
        <DataTable<AccountRow>
          rows={[ACCOUNTS[3]!, ACCOUNTS[4]!, ACCOUNTS[0]!]}
          columns={cols}
          rowKey={(a) => a.key}
          head={{ title: "Personenkonten", sub: "Debitoren und Kreditoren" }}
          minWidth={accountMinWidth(cols)}
          empty={{ title: "Kein Personenkonto." }}
        />
      </div>
    );
  },
};

/**
 * Die zwei Leerfälle **als Vorlage für die Seite**: der Bestandsfall und der
 * Filterfall sagen Verschiedenes. Die App kennt heute nur einen Satz („Keine
 * Konten gefunden — passe die Filter an") und schickt damit auch den in den
 * Filter, dessen Mandant im Jahr gar keinen Rahmen hat (Befund L-86).
 */
export const EmptyCases: Story = {
  render: () => {
    const cols = accountColumns({ href });
    return (
      <div style={{ maxWidth: 1300, display: "grid", gap: "var(--space-6)" }}>
        <DataTable<AccountRow>
          rows={[]}
          columns={cols}
          rowKey={(a) => a.key}
          head={{ title: "Konten 2026", sub: "Bestand" }}
          minWidth={accountMinWidth(cols)}
          empty={{
            title: "In diesem Wirtschaftsjahr gibt es keinen Kontenrahmen.",
            description: "Sobald der erste DATEV-Import läuft, stehen die Konten hier.",
          }}
        />
        <DataTable<AccountRow>
          rows={[]}
          columns={cols}
          rowKey={(a) => a.key}
          head={{ title: "Konten 2026", sub: "gefiltert" }}
          minWidth={accountMinWidth(cols)}
          filtered={{ summary: "Erlöse · nur bebuchte", resetHref: "#alle" }}
        />
      </div>
    );
  },
};

/** Im Einsatz: Kennzahlen und Filter über der Karte — die ganze Seite. */
export const InUse: Story = {
  render: () => {
    const cols = accountColumns({ href });
    return (
      <div style={{ maxWidth: 1300, display: "grid", gap: "var(--space-4)" }}>
        <PageHeader
          overline="Musterbau GmbH · Wirtschaftsjahr 2026"
          title="Konten"
          description="6.212 der 41.570 Konten sind im Jahr bebucht worden."
        />
        <KpiGrid>
          <KpiTile label="Konten" value="41.570" sub="im Rahmen" />
          <KpiTile label="bebucht" value="6.212" sub="mindestens eine Buchung" />
          <KpiTile label="ungenutzt" value="35.358" sub="nie bebucht" />
          <KpiTile label="letzte Buchung" value="31.08.2026" />
        </KpiGrid>
        <FilterBar resetHref="#alle">
          <Field label="Suche" htmlFor="q">
            <Input id="q" type="search" placeholder="Nummer oder Name" />
          </Field>
          <Field label="Klasse" htmlFor="k">
            <Select id="k" defaultValue="alle">
              <option value="alle">alle Klassen</option>
              <option value="revenue">Erlöse</option>
              <option value="creditor">Kreditoren</option>
            </Select>
          </Field>
          <Field label="Bestand" htmlFor="b">
            <Select id="b" defaultValue="used">
              <option value="used">nur bebuchte</option>
              <option value="all">alle</option>
            </Select>
          </Field>
        </FilterBar>
        <DataTable<AccountRow>
          rows={ACCOUNTS}
          columns={cols}
          rowKey={(a) => a.key}
          head={{ title: "Konten 2026", sub: "nur bebuchte · 6.212 von 41.570" }}
          minWidth={accountMinWidth(cols)}
          sort={{ key: "usage_booking_count", dir: "desc" }}
          href={listHref}
          pager={{ ...PAGER, totalItems: 6212, totalPages: 125 }}
          empty={{ title: "Kein Konto." }}
        />
      </div>
    );
  },
};
