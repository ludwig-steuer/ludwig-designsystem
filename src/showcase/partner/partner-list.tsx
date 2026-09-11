import { useState } from "react";

import {
  ONBOARDING_STATE,
  PARTNER_ROLE_LABEL,
  PARTNER_ROLES,
} from "@/ludwig/modules/business-partners/domain/business-partner";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { MASTER_FIELDS } from "@/ui/v3/entities/account/fixtures";
import type { AccountFactsVM } from "@/ui/v3/entities/account/Account";
import { AccountDrawer } from "@/ui/v3/entities/account/AccountDrawer";
import type { AccountEntry } from "@/ui/v3/entities/account/AccountEntries";
import { businessPartnerColumns } from "@/ui/v3/entities/business-partner/business-partner-columns";
import { formatCount } from "@/ui/v3/format";
import { ActionButton } from "@/ui/v3/primitives/ActionButton";
import { Button } from "@/ui/v3/primitives/Button";
import { FilterBar } from "@/ui/v3/primitives/FilterBar";
import { Field, Input, Select } from "@/ui/v3/primitives/Form";
import { Tabs } from "@/ui/v3/primitives/Nav";
import { ToastHost, useToast } from "@/ui/v3/primitives/Toast";
import { DataTable, type ColumnDef } from "@/ui/v3/patterns/DataTable";

import { useHash, type Hash, type Patch } from "../hash";
import type { PartnerListRow } from "./fixtures";

/**
 * The partner list as a page (0128, page profile `partner-liste.md`): one
 * list and one special view, no stat bar. List, filters, tab and drawer live
 * in the hash, like 0157; accepted proposals live in component state.
 */

const CLEAR_LIST: Patch = { q: null, role: null, state: null, page: null };
const DEFAULT_SORT = { key: "usage_booking_count", dir: "desc" as const };
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const accountsOf = (p: PartnerListRow) =>
  [p.creditorAccount, p.debtorAccount, ...p.clearingAccounts].filter((a) => a !== null);

function matches(p: PartnerListRow, needle: string): boolean {
  return [p.legalName, p.shortName, ...p.ustIds, ...accountsOf(p).map((a) => a.accountNumber)].some((v) =>
    v?.toLowerCase().includes(needle),
  );
}

function compare(key: string, a: PartnerListRow, b: PartnerListRow): number {
  switch (key) {
    case "legal_name":
      return a.legalName.localeCompare(b.legalName, "de");
    case "onboarding_state":
      return a.onboardingState.localeCompare(b.onboardingState);
    case "last_booking_date":
      return (a.lastBookingDate ?? "").localeCompare(b.lastBookingDate ?? "");
    default:
      return a.usageBookingCount - b.usageBookingCount;
  }
}

/** The facts of a personal account for its drawer — derived from the partner that holds it. */
function accountFacts(p: PartnerListRow, number: string): { facts: AccountFactsVM; entries: AccountEntry[] } {
  const role = p.debtorAccount?.accountNumber === number ? "debtor" : p.creditorAccount?.accountNumber === number ? "creditor" : "general_ledger";
  const shown = Math.min(p.usageBookingCount, 5);
  const entries = Array.from({ length: shown }, (_, i): AccountEntry => ({
    id: `${number}-${i}`,
    postingDate: `2026-0${7 - i}-15`,
    documentNumber: `RE-${number}-${i + 1}`,
    text: role === "debtor" ? "Ausgangsrechnung" : "Eingangsrechnung",
    contraAccounts: [{ number: role === "debtor" ? "4400" : "5400", name: role === "debtor" ? "Erlöse 19 % USt" : "Wareneingang 19 % Vorsteuer" }],
    debit: role === "debtor" ? 1_190 : null,
    credit: role === "debtor" ? null : 1_190,
    origin: "datev",
  }));
  return {
    facts: {
      ...MASTER_FIELDS,
      accountNumber: number,
      accountName: p.legalName,
      accountingRole: role,
      fiscalYear: 2026,
      currency: "EUR",
      datevBalance: 0,
      datevEntryCount: p.usageBookingCount,
      ludwigEntryCount: 0,
      ludwigOnlyCount: 0,
      ludwigOnlyAmount: null,
      openProposalCount: 0,
      usageBookingCount: p.usageBookingCount,
      lastBookingDate: p.lastBookingDate,
      totalDebit: 0,
      totalCredit: 0,
      partnerName: p.legalName,
      syncState: "synced",
    },
    entries,
  };
}

/**
 * The accept way, built from `ActionButton` with `ask` (0121) — the template
 * for the app's `AcceptCreditorForm` (finding L-292). The explanation stands
 * in the dialog as text, not in a tooltip.
 */
function AcceptCell({
  row,
  taken,
  onAccepted,
}: {
  row: PartnerListRow;
  taken: ReadonlySet<string>;
  onAccepted: (partnerId: string, accountNumber: string) => void;
}) {
  const toast = useToast();
  const id = `accept-${row.businessPartnerId}`;
  return (
    <ActionButton<string>
      size="xs"
      variant="secondary"
      ask={{
        title: `${row.legalName} annehmen`,
        confirmLabel: "Konto anlegen",
        initial: row.creditorAccount?.accountNumber ?? "",
        // A number the page already knows as taken is caught before sending;
        // one taken in the meantime comes back from the action and stays in
        // the dialog too (0159).
        valid: (v) => /^\d{4,20}$/.test(v) && !taken.has(v),
        render: ({ value, set }) => (
          <div className="v2stack">
            <p className="v2sub">
              Vorgeschlagen ist die reservierte Nummer aus dem System-Bereich (89xxxx). Übernehmen Sie sie oder
              tragen Sie die Nummer nach Ihrer DATEV-Konvention ein. Offene Buchungen ziehen auf das neue Konto um.
            </p>
            <Field label="DATEV-Kontonummer (4–20 Ziffern)" htmlFor={id}>
              <Input id={id} inputMode="numeric" value={value} onChange={(e) => set(e.target.value.trim())} />
            </Field>
            {taken.has(value) ? (
              <p className="v2sub" role="alert">
                Die Nummer {value} ist schon vergeben. Wählen Sie eine andere.
              </p>
            ) : null}
          </div>
        ),
      }}
      action={async (number) => {
        await wait(400);
        if (taken.has(number)) return { error: `Die Nummer ${number} ist schon vergeben.` };
        onAccepted(row.businessPartnerId, number);
        toast.show({
          text:
            row.usageBookingCount > 0
              ? `Konto ${number} angelegt — ${row.usageBookingCount} ${row.usageBookingCount === 1 ? "Buchung" : "Buchungen"} umgezogen.`
              : `Konto ${number} angelegt.`,
        });
      }}
    >
      Annehmen
    </ActionButton>
  );
}

function PartnerList({
  stock,
  hash,
  loading,
  error,
}: {
  stock: PartnerListRow[];
  hash: Hash;
  loading: boolean;
  error: string | null;
}) {
  const { params, href, go } = hash;
  const [accepted, setAccepted] = useState<Record<string, string>>({});

  // The stock as it stands after the acceptances of this session.
  const partners = stock.map((p) =>
    accepted[p.businessPartnerId]
      ? {
          ...p,
          onboardingState: "confirmed" as const,
          creditorAccount: { accountNumber: accepted[p.businessPartnerId]!, isInternal: false },
        }
      : p,
  );
  const proposals = partners.filter((p) => p.onboardingState === "proposed");
  const taken = new Set(partners.flatMap((p) => accountsOf(p).map((a) => a.accountNumber)));

  const view = params.get("view") === "proposals" ? "proposals" : "all";
  const q = params.get("q") ?? "";
  const needle = q.trim().toLowerCase();
  const role = params.get("role");
  const state = params.get("state");
  const sort = {
    key: params.get("sort") ?? DEFAULT_SORT.key,
    dir: params.get("dir") === "asc" ? ("asc" as const) : params.get("sort") ? ("desc" as const) : DEFAULT_SORT.dir,
  };
  const pageSize = Number(params.get("size") ?? 25);

  const base = view === "proposals" ? proposals : partners;
  const rows = base
    .filter(
      (p) =>
        (!needle || matches(p, needle)) &&
        (view === "proposals" ||
          ((!role ||
            (role === "creditor" && p.creditorAccount) ||
            (role === "debtor" && p.debtorAccount) ||
            (role === "none" && !p.creditorAccount && !p.debtorAccount)) &&
            (!state || p.onboardingState === state))),
    )
    .sort((a, b) => {
      const primary = compare(sort.key, a, b) * (sort.dir === "asc" ? 1 : -1);
      return primary || a.legalName.localeCompare(b.legalName, "de");
    });
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Number(params.get("page") ?? 1), totalPages);
  const active = [needle, view === "all" ? role : null, view === "all" ? state : null].filter(Boolean).length;
  const summary = [
    needle ? `Suche „${q}“` : null,
    view === "all" && role && role in PARTNER_ROLE_LABEL ? PARTNER_ROLE_LABEL[role as keyof typeof PARTNER_ROLE_LABEL] : null,
    view === "all" && state ? resolveStatus("partner", state).label : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const accountHref = (n: string) => href({ account: n });
  const listHref = (p: { page?: number; pageSize?: number; sort?: string; dir?: "asc" | "desc" }) =>
    href({
      page: p.page ? String(p.page) : null,
      size: p.pageSize ? String(p.pageSize) : null,
      ...(p.sort ? { sort: p.sort, dir: p.dir ?? "asc", page: null } : {}),
    });

  const acceptColumn: ColumnDef<PartnerListRow> = {
    key: "accept",
    header: "Annehmen",
    width: "140px",
    cell: (p) => (
      <AcceptCell
        row={p}
        taken={taken}
        onAccepted={(id, number) => setAccepted((prev) => ({ ...prev, [id]: number }))}
      />
    ),
  };

  const open = params.get("account");
  const holder = open ? partners.find((p) => accountsOf(p).some((a) => a.accountNumber === open)) : undefined;
  const drawer = holder && open ? accountFacts(holder, open) : null;

  return (
    <div className="v2stack" style={{ padding: "var(--space-5)" }}>
      {/* One list and one special view (R9): the view has a form of its own —
          the accept column — and an end. */}
      <Tabs
        ariaLabel="Geschäftspartner"
        active={view}
        items={[
          { key: "all", label: "Geschäftspartner", href: "#" },
          { key: "proposals", label: "Vorschläge", count: proposals.length, href: "#view=proposals" },
        ]}
      />
      <FilterBar activeCount={active} onReset={() => go(CLEAR_LIST)}>
        <Input
          type="search"
          aria-label="Geschäftspartner durchsuchen"
          placeholder="Name, USt-IdNr. oder Kontonummer"
          style={{ width: "min(100%, 20rem)" }}
          value={q}
          onChange={(e) => go({ q: e.target.value || null, page: null })}
        />
        {view === "all" ? (
          <>
            <Select
              aria-label="Rolle"
              value={role ?? ""}
              onChange={(e) => go({ role: e.target.value || null, page: null })}
            >
              <option value="">Alle Rollen</option>
              {PARTNER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {PARTNER_ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Reifegrad"
              value={state ?? ""}
              onChange={(e) => go({ state: e.target.value || null, page: null })}
            >
              <option value="">Alle Reifegrade</option>
              {ONBOARDING_STATE.map((s) => (
                <option key={s} value={s}>
                  {resolveStatus("partner", s).label}
                </option>
              ))}
            </Select>
          </>
        ) : null}
      </FilterBar>
      {view === "proposals" ? (
        <DataTable<PartnerListRow>
          rows={rows.slice((page - 1) * pageSize, page * pageSize)}
          columns={[
            ...businessPartnerColumns({ accountHref, columns: ["partner", "creditorAccount", "onboarding", "city"] }),
            acceptColumn,
          ]}
          rowKey={(p) => p.businessPartnerId}
          head={{
            title: "Vorschläge",
            sub: "Kreditoren, die Ludwig aus Belegen angelegt hat — jeder braucht seine DATEV-Nummer",
          }}
          loading={loading}
          {...(error ? { error: { message: error, retry: <Button variant="secondary" size="sm">Erneut laden</Button> } } : {})}
          {...(active > 0 ? { filtered: { summary, resetHref: href(CLEAR_LIST) } } : {})}
          empty={{ title: "Keine Vorschläge offen.", description: "Jeder Kreditor hat seine DATEV-Nummer.", done: true }}
        />
      ) : (
        <DataTable<PartnerListRow>
          rows={rows.slice((page - 1) * pageSize, page * pageSize)}
          columns={businessPartnerColumns({ partnerHref: (id) => `#partner-page=${id}`, accountHref })}
          rowKey={(p) => p.businessPartnerId}
          head={{
            title: "Geschäftspartner",
            sub:
              active > 0
                ? `${formatCount(rows.length)} von ${formatCount(partners.length)}`
                : sort.key === DEFAULT_SORT.key && sort.dir === DEFAULT_SORT.dir
                  ? `${formatCount(partners.length)} · meistgenutzte zuerst`
                  : formatCount(partners.length),
          }}
          sort={sort}
          href={listHref}
          loading={loading}
          {...(error ? { error: { message: error, retry: <Button variant="secondary" size="sm">Erneut laden</Button> } } : {})}
          {...(rows.length > pageSize
            ? { pager: { page, pageSize, totalItems: rows.length, totalPages, pageSizeOptions: [25, 50] } }
            : {})}
          {...(active > 0 ? { filtered: { summary, resetHref: href(CLEAR_LIST) } } : {})}
          empty={{
            title: "Für diesen Mandanten sind keine Geschäftspartner importiert.",
            description: "Stammsätze entstehen beim DATEV-Import des Onboardings und beim Beleg-Ingest, sobald ein Lieferant erkannt wird.",
            action: (
              <Button variant="secondary" size="sm" href="#onboarding">
                Zum Onboarding
              </Button>
            ),
          }}
        />
      )}
      {drawer && open ? (
        <AccountDrawer
          open
          onClose={() => go({ account: null })}
          accountNumber={open}
          facts={drawer.facts}
          entries={drawer.entries}
          total={drawer.facts.datevEntryCount}
          year={2026}
          years={[2025, 2026]}
          onYearChange={() => {}}
          onOpenFull={() => {}}
          accountHref={accountHref}
        />
      ) : null}
    </div>
  );
}

/** The whole page from one stock. `live={false}` for several pages in one story. */
export function PartnerListPage({
  stock,
  initial = "",
  live = true,
  loading = false,
  error = null,
}: {
  stock: PartnerListRow[];
  initial?: string;
  live?: boolean;
  loading?: boolean;
  error?: string | null;
}) {
  const hash = useHash(initial, live);
  return (
    <ToastHost>
      <PartnerList stock={stock} hash={hash} loading={loading} error={error} />
    </ToastHost>
  );
}
