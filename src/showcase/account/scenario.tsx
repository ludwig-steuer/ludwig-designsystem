import { useState, type ReactNode } from "react";

import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { AccountFacts, type AccountFactsVM } from "@/ui/v3/entities/account/Account";
import { AccountDrawer } from "@/ui/v3/entities/account/AccountDrawer";
import { accountEntryColumns, type AccountEntryOrigin } from "@/ui/v3/entities/account/AccountEntries";
import { BusinessPartnerDrawer } from "@/ui/v3/entities/business-partner/BusinessPartnerDrawer";
import { AiBookingNotes } from "@/ui/v3/entities/journal-entry/AiBookingNotes";
import { JournalEntryCard, type JournalLine } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import { JournalEntryGrid } from "@/ui/v3/entities/journal-entry/JournalEntryGrid";
import type { JournalRow, JournalStatus } from "@/ui/v3/entities/journal-entry/journal-entry";
import { formatAmount, formatCount } from "@/ui/v3/format";
import { Badge } from "@/ui/v3/primitives/Badge";
import { BarChart } from "@/ui/v3/primitives/BarChart";
import { Button } from "@/ui/v3/primitives/Button";
import { AmountCell } from "@/ui/v3/primitives/Cells";
import { Disclosure } from "@/ui/v3/primitives/Disclosure";
import { Drawer } from "@/ui/v3/primitives/Drawer";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { FilterBar } from "@/ui/v3/primitives/FilterBar";
import { Checkbox, Input, Select } from "@/ui/v3/primitives/Form";
import { InlineEdit } from "@/ui/v3/primitives/InlineEdit";
import { KpiGrid, KpiTile } from "@/ui/v3/primitives/KpiTile";
import { RawRecord } from "@/ui/v3/primitives/RawRecord";
import { ReasonDialog } from "@/ui/v3/primitives/ReasonDialog";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardHead, HeadRow, Row, Table } from "@/ui/v3/primitives/Table";
import { TextButton } from "@/ui/v3/primitives/TextButton";
import { Time } from "@/ui/v3/primitives/Time";
import { Columns } from "@/ui/v3/patterns/Columns";
import { DataTable } from "@/ui/v3/patterns/DataTable";
import { OpenPoints, type OpenPoint } from "@/ui/v3/patterns/OpenPoints";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";

import { useHash, type Hash, type Patch } from "../hash";

import { AccountPage } from "./AccountPage";
import {
  balanceWord,
  CLEARING_TYPES,
  contraFacts,
  LOCKED_FUNCTION,
  MONTH_LONG,
  MONTH_SHORT,
  partnerOf,
  r2,
  sideOf,
  YEAR,
  ZERO_TARGET,
  type AccountMaster,
  type AccountScenario,
  type MonthRow,
  type Movement,
} from "./fixtures";

/**
 * An account page as **data**: every scenario of 0157 is one `AccountScenario`,
 * and `ScenarioPage` draws the whole page from it (the 0144 rule, as in 0152).
 *
 * The list state lives in the hash — `#entry=`, `#account=`, `#origin=` — the
 * way the app keeps it in the query: a story iframe reloads on `?`, not on
 * `#`, and `DataTable` knows rows only as links.
 */

/** Everything that narrows the list — cleared together. */
const CLEAR_LIST: Patch = { q: null, origin: null, status: null, month: null, page: null };

const ORIGINS: { key: AccountEntryOrigin; label: string }[] = [
  { key: "datev", label: "Nur in DATEV" },
  { key: "mirrored", label: "Von Ludwig, bestätigt" },
  { key: "exported", label: "Exportiert, nicht wiedergefunden" },
  { key: "ludwig", label: "Nur in Ludwig" },
];

const movementCount = (n: number) => `${formatCount(n)} ${n === 1 ? "Bewegung" : "Bewegungen"}`;
const hasProfile = (m: AccountMaster) => Boolean(m.description && m.embeddingCreatedAt);

/**
 * What is open on the account, criticality descending (A7), each with a way.
 * It stands in for `accountDefects()`, which the domain does not have yet
 * (B6) — so zone and tiles count from the same place.
 */
function accountDefects(s: AccountScenario, href: Hash["href"]): OpenPoint[] {
  const { facts, master, entries } = s;
  const way = (label: string, patch: Patch) => (
    <TextButton href={href({ ...CLEAR_LIST, ...patch })}>{label}</TextButton>
  );
  const points: OpenPoint[] = [];

  const exported = entries.filter((e) => e.origin === "exported").length;
  if (exported > 0) {
    points.push({
      key: "exported",
      state: "warning",
      title: `${movementCount(exported)} exportiert, in DATEV nicht wiedergefunden.`,
      hint: "Der Export hat sie übergeben; der DATEV-Spiegel kennt sie nicht.",
      action: way("Nur diese zeigen", { origin: "exported" }),
    });
  }
  if (facts.ludwigOnlyCount > 0) {
    points.push({
      key: "ludwig",
      state: "info",
      title: `${movementCount(facts.ludwigOnlyCount)} über ${formatAmount(facts.ludwigOnlyAmount, facts.currency)} nur in Ludwig.`,
      hint: "Noch nicht an DATEV übergeben.",
      action: way("Nur diese zeigen", { origin: "ludwig" }),
    });
  }
  if (master.clearingAccountType && ZERO_TARGET.includes(master.clearingAccountType) && facts.datevBalance) {
    const last = entries.find((e) => sideOf(e.origin) === "datev");
    const month = last ? Number(last.postingDate.slice(5, 7)) : null;
    points.push({
      key: "rest",
      state: "info",
      title: `Rest ${formatAmount(facts.datevBalance, facts.currency)} nicht ausgeglichen.`,
      hint: `Ein Verrechnungskonto „${resolveStatus("verrechnungskonto", master.clearingAccountType).label}“ soll auf 0,00 € aufgehen; ein Monatsrest ist üblich.`,
      ...(month ? { action: way(`Bewegungen ${MONTH_LONG[month - 1]}`, { month: String(month) }) } : {}),
    });
  }
  if (facts.syncState === "local_only") {
    points.push({
      key: "local",
      state: "info",
      title: "DATEV kennt das Konto noch nicht.",
      hint: "Der nächste Export legt es an.",
      action: <TextButton href="#exports">Zum Export</TextButton>,
    });
  }
  if (!hasProfile(master)) {
    points.push({
      key: "profile",
      state: "info",
      title: "Kein LLM-Profil.",
      hint: "Der Agent findet dieses Konto nicht über Belegbegriffe.",
      action: way("Beschreibung schreiben", { tab: "details" }),
    });
  }
  return points;
}

/** Zone 3 — four tiles, none twice; the ones with a way count like the list they open (I12). */
function Figures({ scenario, href }: { scenario: AccountScenario; href: Hash["href"] }) {
  const { facts, master } = scenario;
  const word = balanceWord(facts, master);
  return (
    <KpiGrid columns={4}>
      <KpiTile
        label={`Saldo in DATEV ${YEAR}`}
        value={facts.datevBalance === null ? "noch keiner" : formatAmount(facts.datevBalance, facts.currency)}
        sub={
          facts.datevBalance === null
            ? "DATEV kennt das Konto noch nicht"
            : (word ?? `${movementCount(facts.datevEntryCount)} in DATEV`)
        }
      />
      <KpiTile
        label="Nur in Ludwig"
        value={formatAmount(facts.ludwigOnlyAmount ?? 0, facts.currency)}
        sub={movementCount(facts.ludwigOnlyCount)}
        {...(facts.ludwigOnlyCount > 0 ? { href: href({ ...CLEAR_LIST, origin: "ludwig" }) } : {})}
      />
      <KpiTile
        label="Offene Vorschläge"
        value={formatCount(facts.openProposalCount)}
        sub={facts.openProposalCount > 0 ? "warten auf Freigabe" : "keine"}
        {...(facts.openProposalCount > 0 ? { href: href({ ...CLEAR_LIST, status: "proposed" }) } : {})}
      />
      <KpiTile
        label="Letzte Buchung"
        value={<Time value={facts.lastBookingDate ?? null} format="date" />}
        sub={`${formatCount(facts.usageBookingCount)} Buchungen insgesamt`}
      />
    </KpiGrid>
  );
}

/** The text alternative of the chart (V7), and its replacement under four booked months (D16). */
function MonthTable({ months }: { months: MonthRow[] }) {
  const sum = (pick: (m: MonthRow) => number) => months.reduce((n, m) => n + pick(m), 0);
  return (
    <Table cols="minmax(0, 1fr) 140px 140px 110px" density="compact">
      <HeadRow>
        <span>Monat</span>
        <span className="v2num">Soll</span>
        <span className="v2num">Haben</span>
        <span className="v2num">Bewegungen</span>
      </HeadRow>
      {months.map((m) => (
        <Row key={m.month}>
          <span>{MONTH_LONG[m.month - 1]}</span>
          <span className="v2num">
            <AmountCell value={m.debit} currency="EUR" />
          </span>
          <span className="v2num">
            <AmountCell value={m.credit} currency="EUR" />
          </span>
          <span className="v2num">{formatCount(m.count)}</span>
        </Row>
      ))}
      <Row>
        <span className="v2main">Jahr {YEAR}</span>
        <span className="v2num">
          <AmountCell value={r2(sum((m) => m.debit))} currency="EUR" />
        </span>
        <span className="v2num">
          <AmountCell value={r2(sum((m) => m.credit))} currency="EUR" />
        </span>
        <span className="v2num">{formatCount(sum((m) => m.count))}</span>
      </Row>
    </Table>
  );
}

/** Zone 4, first half — twelve months always, empty ones as empty bars. */
function History({ months }: { months: MonthRow[] }) {
  const booked = months.filter((m) => m.count > 0).length;
  const count = months.reduce((n, m) => n + m.count, 0);
  return (
    <Card>
      <CardHead title={`Verlauf ${YEAR}`} sub="Soll und Haben je Monat" />
      <div className="v3boxbody v2stack">
        {booked >= 4 ? (
          <>
            <BarChart
              bars={months.map((m) => ({ label: MONTH_SHORT[m.month - 1]!, value: m.debit, secondary: m.credit }))}
              layout="grouped"
              format={(v) => formatAmount(v, "EUR")}
              primaryLabel="Soll"
              secondaryLabel="Haben"
              ariaLabel={`Soll und Haben je Monat ${YEAR}`}
            />
            <Disclosure summary="Als Tabelle">
              <MonthTable months={months} />
            </Disclosure>
          </>
        ) : (
          <>
            <p className="v2sub">
              {movementCount(count)} in {booked} {booked === 1 ? "Monat" : "Monaten"} — zu wenig für einen Verlauf.
            </p>
            <MonthTable months={months} />
          </>
        )}
      </div>
    </Card>
  );
}

/** Rank 6 in the margin: the master-data set, without the figures the tiles already carry (D7). */
function MasterData({ scenario }: { scenario: AccountScenario }) {
  const { facts, master } = scenario;
  // Not in `AccountFactsVM` yet — finding B5, spec F209 in the app.
  const rows: [ReactNode, ReactNode][] = [
    [
      "Kontenrahmen",
      master.skrBaseCode ? `${master.accountFrameworkCode} · Basis ${master.skrBaseCode}` : master.accountFrameworkCode,
    ],
  ];
  if (master.accountFunction === LOCKED_FUNCTION) {
    rows.push(["Kontenfunktion", `${master.accountFunction} · für Buchungen gesperrt`]);
  }
  if (master.automaticTaxRate !== null) rows.push(["Automatik", `${master.automaticTaxRate} %`]);
  if (master.clearingAccountType) {
    rows.push(["Verrechnungskonto", resolveStatus("verrechnungskonto", master.clearingAccountType).label]);
  }
  return (
    <Card>
      <CardHead title="Stammdaten" sub={`Wirtschaftsjahr ${YEAR}`} />
      <div className="v3boxbody">
        <AccountFacts facts={facts} figures={false} />
        <FieldList tone="bare" rows={rows} />
      </div>
    </Card>
  );
}

/** The overview: `main-aside` (0154) — defects, tiles, history and the movements beside the master data. */
function Overview({ scenario, hash }: { scenario: AccountScenario; hash: Hash }) {
  const { facts, entries } = scenario;
  const { params, href, go } = hash;

  const q = params.get("q") ?? "";
  const needle = q.trim().toLowerCase();
  const origins = (params.get("origin") ?? "").split(",").filter(Boolean) as AccountEntryOrigin[];
  const status = params.get("status");
  const month = params.get("month");
  const pageSize = Number(params.get("size") ?? scenario.pageSize);

  const rows = entries.filter(
    (e) =>
      (origins.length === 0 || origins.includes(e.origin)) &&
      (!status || e.status === status) &&
      (!month || Number(e.postingDate.slice(5, 7)) === Number(month)) &&
      (!needle ||
        [e.documentNumber, e.text, e.caseNumber, ...e.contraAccounts.map((a) => `${a.number} ${a.name ?? ""}`)].some(
          (v) => v?.toLowerCase().includes(needle),
        )),
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Number(params.get("page") ?? 1), totalPages);
  // The running balance only over **one** source (owner 2026-09-04).
  const oneSource =
    origins.length > 0 &&
    (origins.every((o) => sideOf(o) === "datev") || origins.every((o) => sideOf(o) === "ludwig"));
  const active = [needle, origins.length, status, month].filter(Boolean).length;
  const summary = [
    origins.length ? `Herkunft: ${origins.map((o) => ORIGINS.find((x) => x.key === o)?.label).join(", ")}` : null,
    status ? `Zustand: ${resolveStatus("buchung", status).label}` : null,
    month ? `Monat: ${MONTH_LONG[Number(month) - 1]}` : null,
    needle ? `Suche „${q}“` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const toggle = (origin: AccountEntryOrigin) => {
    const next = origins.includes(origin) ? origins.filter((o) => o !== origin) : [...origins, origin];
    go({ origin: next.length ? next.join(",") : null, page: null });
  };

  return (
    <Columns
      pattern="main-aside"
      width="table"
      main={
        <div className="v2stack">
          {/* Defects beside the chart (`split`, 0154), the tiles in one row
              below. Stacked, the list began at y = 1100 at 1440 × 900; with the
              tiles two by two beside the chart the left half grew to 453 px
              against the chart's 266 — P1 wants the list above the fold. */}
          <Columns
            pattern="split"
            main={
              <OpenPoints
                points={accountDefects(scenario, href)}
                emptyText={`Ludwig und DATEV stimmen überein — ${movementCount(entries.length)}, keine offen.`}
              />
            }
            {...(entries.length > 0 ? { aside: <History months={scenario.months} /> } : {})}
          />
          <Figures scenario={scenario} href={href} />
          {/* One line: a label above the search cost a second one. */}
          <FilterBar activeCount={active} onReset={() => go(CLEAR_LIST)}>
            <Input
              type="search"
              aria-label="Bewegungen durchsuchen"
              placeholder="Beleg, Text, Gegenkonto, Sachverhalt"
              style={{ width: "min(100%, 18rem)" }}
              value={q}
              onChange={(e) => go({ q: e.target.value || null, page: null })}
            />
            <div
              role="group"
              aria-label="Herkunft"
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)" }}
            >
              <span className="v2sub">Herkunft</span>
              {ORIGINS.map((o) => (
                <Checkbox key={o.key} label={o.label} checked={origins.includes(o.key)} onChange={() => toggle(o.key)} />
              ))}
            </div>
          </FilterBar>
          <DataTable<Movement>
            rows={rows.slice((page - 1) * pageSize, page * pageSize)}
            columns={accountEntryColumns({
              currency: facts.currency,
              variant: "compact",
              accountHref: (n) => href({ account: n }),
              balance: oneSource,
            })}
            rowKey={(e) => e.id}
            rowHref={(e) => href({ entry: e.id })}
            // Only in Ludwig is dimmed: it has not reached DATEV (owner 2026-09-04).
            rowClassName={(e) => (e.origin === "ludwig" ? "v2ae__row--draft" : undefined)}
            head={{ title: `Bewegungen ${YEAR} · ${formatCount(entries.length)}`, sub: "beide Quellen, neueste zuerst" }}
            href={(p) => href({ page: p.page ? String(p.page) : null, size: p.pageSize ? String(p.pageSize) : null })}
            {...(rows.length > pageSize
              ? { pager: { page, pageSize, totalItems: rows.length, totalPages, pageSizeOptions: [25, 50] } }
              : {})}
            {...(active > 0 ? { filtered: { summary, resetHref: href(CLEAR_LIST) } } : {})}
            empty={{ title: `Auf diesem Konto liegt für ${YEAR} nichts — im Rahmen, aber unbenutzt.` }}
          />
        </div>
      }
      aside={<MasterData scenario={scenario} />}
    />
  );
}

/** Tab 2 — every data point, with the two values a person changes here (F198 §4). */
export function DetailsTab({ scenario, partnerHref = null }: { scenario: AccountScenario; partnerHref?: string | null }) {
  const { facts, master } = scenario;
  const [description, setDescription] = useState(master.description ?? "");
  const [clearing, setClearing] = useState(master.clearingAccountType ?? "");
  const [pending, setPending] = useState<string | null>(null);
  const profiled = hasProfile(master);

  const rows: [ReactNode, ReactNode][] = [
    ["Kontonummer", <span key="n" className="v2mono">{facts.accountNumber}</span>],
    ["Bezeichnung", facts.accountName ?? "—"],
    ["Kontoart", <StatusBadge key="t" axis="konto_typ" status={facts.accountingRole ?? ""} info={false} />],
    ["Zustand", <StatusBadge key="s" axis="konto" status={master.status} info={false} />],
    ["SKR-Klasse", facts.skrClassLabel ?? "—"],
    ["Kontenrahmen", master.skrBaseCode ? `${master.accountFrameworkCode} · Basis ${master.skrBaseCode}` : master.accountFrameworkCode],
    ["Kontenfunktion", master.accountFunction === null ? "—" : String(master.accountFunction)],
    ["Automatik-Steuersatz", master.automaticTaxRate === null ? "keiner" : `${master.automaticTaxRate} %`],
    [
      "Geschäftspartner",
      facts.partnerName ? (
        partnerHref ? <TextButton href={partnerHref}>{facts.partnerName}</TextButton> : facts.partnerName
      ) : (
        "keiner"
      ),
    ],
    ["DATEV-Abgleich", <StatusBadge key="d" axis="konto_datev_sync" status={facts.syncState ?? "synced"} info={false} />],
    ["Buchungen insgesamt", formatCount(facts.usageBookingCount)],
    ["Letzte Buchung", <Time key="l" value={facts.lastBookingDate ?? null} format="date" />],
  ];

  return (
    <Columns
      pattern="split"
      main={
        <Card>
          <CardHead title="Konto" sub="alle Datenpunkte" />
          <div className="v3boxbody v2stack">
            <FieldList tone="bare" rows={rows} />
            <InlineEdit
              label="Verrechnungskonto"
              value={clearing}
              renderValue={(v) => (v ? resolveStatus("verrechnungskonto", v).label : "keins")}
              renderInput={(p) => (
                <Select
                  id={p.id}
                  value={p.value}
                  autoFocus={p.autoFocus}
                  onKeyDown={p.onKeyDown}
                  onChange={(e) => p.onChange(e.target.value)}
                >
                  <option value="">keins</option>
                  {CLEARING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {resolveStatus("verrechnungskonto", t).label}
                    </option>
                  ))}
                </Select>
              )}
              onSave={(next) => setPending(next)}
            />
            <ReasonDialog
              open={pending !== null}
              onClose={() => setPending(null)}
              onConfirm={() => {
                setClearing(pending ?? "");
                setPending(null);
              }}
              title="Verrechnungskonto bestätigen"
              kicker={`Konto ${facts.accountNumber}`}
            >
              <p>
                Die Kategorie entscheidet, ob der Buchungslauf einen Rest auf diesem Konto als Mangel meldet
                (Gate 4d).
              </p>
            </ReasonDialog>
          </div>
        </Card>
      }
      aside={
        <Card>
          <CardHead title="LLM-Profil" sub={profiled ? "wofür das Konto gedacht ist" : "fehlt"} />
          <div className="v3boxbody v2stack">
            <InlineEdit
              label="Beschreibung"
              value={description}
              multiline
              renderValue={(v) =>
                v || <span className="v2muted">Noch keine Beschreibung — schreiben Sie, wofür das Konto gedacht ist.</span>
              }
              onSave={(next) => setDescription(next)}
            />
            <div>
              <div className="v2sub">Belegbegriffe</div>
              {master.documentTerms.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  {master.documentTerms.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              ) : (
                <span className="v2muted">Entstehen mit dem Profil.</span>
              )}
            </div>
            <FieldList
              tone="bare"
              rows={[
                [
                  "Embedding",
                  master.embeddingCreatedAt ? (
                    <span key="e">
                      vorhanden, erzeugt am <Time value={master.embeddingCreatedAt} format="date" />
                    </span>
                  ) : (
                    "fehlt"
                  ),
                ],
              ]}
            />
          </div>
        </Card>
      }
    />
  );
}

/** Tab 3 — always there, always last, quiet (D12). */
export function RawTab({ scenario }: { scenario: AccountScenario }) {
  const { facts, master } = scenario;
  return (
    <div className="v2stack">
      <Card>
        <CardHead title="client_ledger_accounts" sub="1 Datensatz" />
        <div className="v3boxbody">
          <RawRecord
            record={{
              account_number: facts.accountNumber,
              account_name: facts.accountName,
              accounting_role: facts.accountingRole,
              status: master.status,
              fiscal_year: facts.fiscalYear,
              skr_base_code: master.skrBaseCode,
              account_function: master.accountFunction,
              automatic_tax_rate: master.automaticTaxRate,
              clearing_account_type: master.clearingAccountType,
              business_partner_id: master.businessPartnerId,
              datev_sync_state: facts.syncState,
              usage_booking_count: facts.usageBookingCount,
              last_booking_date: facts.lastBookingDate,
            }}
          />
        </div>
      </Card>
      <Card>
        <CardHead title="client_account_enrichment" sub={master.description ? "1 Datensatz" : "kein Datensatz"} />
        <div className="v3boxbody">
          <RawRecord
            record={
              master.description
                ? {
                    account_number: facts.accountNumber,
                    description: master.description,
                    document_terms: master.documentTerms,
                    embedding_created_at: master.embeddingCreatedAt,
                  }
                : {}
            }
            empty="Kein Datensatz — für dieses Konto gibt es kein LLM-Profil."
          />
        </div>
      </Card>
      <Card>
        <CardHead title="Kontenrahmen" sub={master.accountFrameworkCode} />
        <div className="v3boxbody">
          <RawRecord
            record={{
              account_framework_code: master.accountFrameworkCode,
              account_number: master.skrBaseCode ?? facts.accountNumber,
              account_class: facts.skrClassLabel,
            }}
          />
        </div>
      </Card>
    </div>
  );
}

function journalLines(entry: Movement, facts: AccountFactsVM, master: AccountMaster): JournalLine[] {
  const amount = entry.debit ?? entry.credit ?? 0;
  const own: JournalLine["side"] = entry.debit !== null ? "debit" : "credit";
  const other: JournalLine["side"] = own === "debit" ? "credit" : "debit";
  const n = Math.max(1, entry.contraAccounts.length);
  const part = r2(amount / n);
  return [
    { side: own, accountNumber: facts.accountNumber, accountName: facts.accountName, amount, text: entry.text, automaticRate: master.automaticTaxRate },
    ...entry.contraAccounts.map((a, i) => ({
      side: other,
      accountNumber: a.number,
      accountName: a.name ?? null,
      amount: i === n - 1 ? r2(amount - part * (n - 1)) : part,
      text: entry.text,
    })),
  ];
}

const journalStatus = (s: string | null | undefined): JournalStatus =>
  s === "accepted" || s === "posted" || s === "reversed" ? s : "proposed";

/**
 * One movement, drawn with the views the batch acceptance already has (owner
 * 2026-09-10): the entry as card, its state, for Ludwig the reasoning and the
 * large grid. One parameter for both sources — the source decides the content.
 */
function EntryDrawer({ scenario, entry, hash }: { scenario: AccountScenario; entry: Movement; hash: Hash }) {
  const { facts, master } = scenario;
  const ludwigSide = sideOf(entry.origin) === "ludwig";
  const amount = entry.debit ?? entry.credit ?? 0;
  const contra = entry.contraAccounts[0];
  const d = entry.postingDate;
  const grid: JournalRow[] = [
    {
      id: entry.id,
      datum: `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}`,
      amount: formatAmount(amount, null),
      side: entry.debit !== null ? "S" : "H",
      bu: "",
      account: facts.accountNumber,
      accountName: facts.accountName ?? "",
      externalDocumentNumber: entry.documentNumber ?? "",
      text: entry.text ?? "",
    },
  ];

  const rows: [ReactNode, ReactNode][] = [
    ["Herkunft", ORIGINS.find((o) => o.key === entry.origin)?.label ?? entry.origin],
    [
      "Zustand",
      entry.origin === "exported" ? (
        <StatusBadge key="z" axis="buchung_datev" status="exported" info={false} />
      ) : ludwigSide ? (
        <StatusBadge key="z" axis="buchung" status={entry.status ?? "proposed"} info={false} />
      ) : (
        <StatusBadge key="z" axis="mirror_match" status={entry.matchState ?? "new_unprocessed"} info={false} />
      ),
    ],
  ];
  if (entry.exportedAt) {
    rows.push([
      "Exportiert",
      <span key="x">
        am <Time value={entry.exportedAt} format="date" />, im DATEV-Spiegel nicht gefunden
      </span>,
    ]);
  }
  if (entry.batchId) rows.push(["Stapel", <span key="b" className="v2mono">{entry.batchId}</span>]);
  if (entry.markOfOrigin) rows.push(["DATEV-Kennzeichen", entry.markOfOrigin]);

  return (
    <Drawer
      open
      onClose={() => hash.go({ entry: null })}
      title={entry.documentNumber ? `Bewegung ${entry.documentNumber}` : "Bewegung"}
      meta={
        <span>
          <Time value={entry.postingDate} format="date" /> · Konto {facts.accountNumber}
        </span>
      }
      ariaLabel={`Bewegung ${entry.documentNumber ?? entry.id}`}
      size="lg"
      {...(entry.caseNumber
        ? {
            footer: (
              <Button variant="secondary" size="sm" href="#case">
                Zum Sachverhalt {entry.caseNumber}
              </Button>
            ),
          }
        : {})}
    >
      <div className="v2stack">
        <JournalEntryCard
          lines={journalLines(entry, facts, master)}
          currency={facts.currency}
          accountHref={(n) => hash.href({ entry: null, account: n })}
          {...(entry.text ? { caption: entry.text } : {})}
        />
        <FieldList rows={rows} />
        {ludwigSide && entry.rationale ? (
          <AiBookingNotes
            verdict="confirm"
            confidence="green"
            rationale={entry.rationale}
            sources={[{ key: "history", art: "history", label: "DATEV-Sätze der Vormonate" }]}
          />
        ) : null}
        {ludwigSide ? (
          <Disclosure summary="Große Ansicht">
            <JournalEntryGrid
              rows={grid}
              status={journalStatus(entry.status)}
              {...(contra ? { contraAccount: { account: contra.number, name: contra.name ?? "" } } : {})}
            />
          </Disclosure>
        ) : null}
      </div>
    </Drawer>
  );
}

/** A contra account, looked up without leaving the page (0068). */
function ContraDrawer({ scenario, number, hash }: { scenario: AccountScenario; number: string; hash: Hash }) {
  const { facts } = scenario;
  const other = contraFacts(number);
  // Seen from the other side: the same movements, mirrored.
  const entries = scenario.entries
    .filter((e) => e.contraAccounts.some((a) => a.number === number))
    .slice(0, 25)
    .map((e) => ({
      ...e,
      id: `c-${e.id}`,
      debit: e.credit,
      credit: e.debit,
      contraAccounts: [{ number: facts.accountNumber, name: facts.accountName }],
      runningBalance: null,
    }));
  return (
    <AccountDrawer
      open
      onClose={() => hash.go({ account: null })}
      accountNumber={number}
      facts={other}
      entries={entries}
      total={other?.datevEntryCount ?? entries.length}
      year={YEAR}
      years={[YEAR - 1, YEAR]}
      onYearChange={() => {}}
      onOpenFull={() => {}}
      accountHref={(n) => hash.href({ account: n })}
    />
  );
}

function PartnerDrawer({ scenario, hash }: { scenario: AccountScenario; hash: Hash }) {
  const found = partnerOf(scenario);
  if (!found) return null;
  return (
    <BusinessPartnerDrawer
      open
      onClose={() => hash.go({ partner: null })}
      partner={found.partner}
      accounts={[found.account]}
      caseCount={3}
      tabHref={(t) => hash.href({ partnerTab: t })}
      href="#partner-page"
      accountHref={(n) => hash.href({ partner: null, account: n })}
    />
  );
}

/**
 * The whole page from one scenario. `initial` is the hash it opens with;
 * `live={false}` keeps several pages in one story apart — they share one
 * window hash, so only a live page may follow it.
 */
export function ScenarioPage({
  scenario,
  initial = "",
  live = true,
}: {
  scenario: AccountScenario;
  initial?: string;
  live?: boolean;
}) {
  const hash = useHash(initial, live);
  const { params, href } = hash;
  const { facts, master, signal } = scenario;
  const tab = params.get("tab") ?? "overview";
  const entry = scenario.entries.find((e) => e.id === params.get("entry"));
  const contra = params.get("account");
  const partnerHref = master.businessPartnerId ? href({ partner: master.businessPartnerId }) : null;

  return (
    <>
      <AccountPage
        facts={facts}
        master={master}
        tab={tab}
        // The first tab carries no parameter (I1).
        tabHref={(key) => (key === "overview" ? "#" : `#tab=${key}`)}
        partnerHref={partnerHref}
        signal={
          signal ? (
            <StatusCallout
              tone={signal.tone}
              kicker={signal.kicker}
              title={signal.title}
              {...(signal.sub ? { sub: signal.sub } : {})}
            />
          ) : null
        }
        // The one action of the page, so no menu (D8).
        actions={
          <Button variant="secondary" size="sm">
            {hasProfile(master) ? "LLM-Profil neu erzeugen" : "LLM-Profil erzeugen"}
          </Button>
        }
      >
        {tab === "details" ? (
          <DetailsTab scenario={scenario} partnerHref={partnerHref} />
        ) : tab === "raw" ? (
          <RawTab scenario={scenario} />
        ) : (
          <Overview scenario={scenario} hash={hash} />
        )}
      </AccountPage>
      {entry ? <EntryDrawer scenario={scenario} entry={entry} hash={hash} /> : null}
      {contra ? <ContraDrawer scenario={scenario} number={contra} hash={hash} /> : null}
      {params.get("partner") ? <PartnerDrawer scenario={scenario} hash={hash} /> : null}
    </>
  );
}
