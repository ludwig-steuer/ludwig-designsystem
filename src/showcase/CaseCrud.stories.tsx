import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  ActionBar,
  Badge,
  Button,
  Card,
  CardFoot,
  CardHead,
  Dialog,
  EmptyState,
  Field,
  FieldList,
  HeadRow,
  Input,
  Pagination,
  ReasonDialog,
  Row,
  RowActions,
  Select,
  StatusBadge,
  Table,
  Tabs,
  Textarea,
  AmountCell,
  Timestamp,
} from "@/ui/v3";
import { CASE_KIND, CASE_KIND_LABEL, type CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";

import { Todo, TodoInline } from "./Todo";

/**
 * **Sachverhalt — list, detail, create, edit, delete on one page.**
 *
 * The hardest completeness test in the set: a full CRUD screen needs list,
 * detail, form, dialog, confirmation, feedback and every empty state at once.
 * A gap that never shows in a per-component story shows here.
 *
 * A showcase page, not a component — nothing is exported from `@/ui/v3`, and
 * the app builds this screen itself. Where the set falls short, a `Todo`
 * marker names the backlog entry rather than local markup papering over it.
 *
 * Types come from `@/ludwig/modules/accounting-cases/domain/case` — the app's
 * data model is the given, per `spec-schreiben` §5.
 */

const CASES: CaseListItem[] = [
  {
    caseId: "c1",
    caseNumber: "2026-0140",
    clientId: "m1",
    fiscalYear: 2026,
    kind: "incoming_invoice",
    title: "Eingangsrechnung: Musterfirma GmbH",
    summary: "Bürobedarf für das dritte Quartal, geliefert am 24.08.2026.",
    counterpartyName: "Musterfirma GmbH",
    currency: "EUR",
    totalAmount: 1475.6,
    lifecycleStatus: "open",
    disposition: "accounting",
    documentEventsCount: 1,
    bankEventsCount: 1,
    openClarificationsCount: 0,
    hasOpenDocumentRequest: false,
    openedAt: "2026-08-26T09:12:00Z",
    closedAt: null,
    exportStatus: "offen",
  },
  {
    caseId: "c2",
    caseNumber: "2026-0141",
    clientId: "m1",
    fiscalYear: 2026,
    kind: "recurring_charge",
    title: "Dauersachverhalt: M-net",
    summary: "Telefon Juli — Betrag weicht vom Vormonat um +119,00 € ab.",
    counterpartyName: "M-net Telekommunikations GmbH",
    currency: "EUR",
    totalAmount: 498.49,
    lifecycleStatus: "needs_clarification",
    disposition: "client",
    documentEventsCount: 0,
    bankEventsCount: 1,
    openClarificationsCount: 2,
    hasOpenDocumentRequest: true,
    openedAt: "2026-07-29T06:40:00Z",
    closedAt: null,
    exportStatus: null,
  },
  {
    caseId: "c3",
    caseNumber: "2026-0138",
    clientId: "m1",
    fiscalYear: 2026,
    kind: "outgoing_invoice",
    title: "Ausgangsrechnung: Deutsche Telekom AG",
    summary: null,
    counterpartyName: "Deutsche Telekom AG",
    currency: "EUR",
    totalAmount: 212.4,
    lifecycleStatus: "closed_accepted",
    disposition: "agent",
    documentEventsCount: 1,
    bankEventsCount: 1,
    openClarificationsCount: 0,
    hasOpenDocumentRequest: false,
    openedAt: "2026-08-12T14:05:00Z",
    closedAt: "2026-08-30T11:00:00Z",
    exportStatus: "exportiert",
  },
];

const COLS = "104px minmax(190px, 1fr) 180px 110px 200px 210px";

function Page() {
  const [rows, setRows] = useState(CASES);
  const [tab, setTab] = useState("offen");
  const [selected, setSelected] = useState<string | null>("c1");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CaseListItem | null>(null);
  const [deleting, setDeleting] = useState<CaseListItem | null>(null);

  const visible = rows.filter((r) =>
    tab === "offen" ? !r.closedAt : tab === "geschlossen" ? !!r.closedAt : true,
  );
  const current = rows.find((r) => r.caseId === selected) ?? null;

  return (
    <div style={{ display: "grid", gap: "var(--space-4, 16px)", padding: "var(--space-4, 16px)" }}>
      <Todo spec="0002" name="PageHeader">
        „Sachverhalte · Musterfirma GmbH · Wirtschaftsjahr 2026" mit Zurück-Weg
        und Seitenaktionen. Steht am Anfang jeder Seite und fehlt in 19 Dateien.
      </Todo>

      <Card>
        <CardHead
          title="Sachverhalte"
          sub={`${visible.length} von ${rows.length}`}
          actions={
            <>
              <TodoInline spec="0003" name="FilterBar" />
              <Button onClick={() => setCreating(true)}>Sachverhalt anlegen</Button>
            </>
          }
        />

        <Tabs
          items={[
            { key: "offen", label: "Offen", count: rows.filter((r) => !r.closedAt).length },
            { key: "geschlossen", label: "Geschlossen", count: rows.filter((r) => !!r.closedAt).length },
            { key: "alle", label: "Alle", count: rows.length },
          ]}
          active={tab}
          ariaLabel="Sachverhalte filtern"
          onPick={setTab}
        />

        {visible.length === 0 ? (
          <EmptyState
            title="Kein Sachverhalt in dieser Ansicht"
            description="Wechseln Sie den Reiter oder legen Sie einen an."
            action={<Button onClick={() => setCreating(true)}>Sachverhalt anlegen</Button>}
          />
        ) : (
          <Table cols={COLS} minWidth={1000}>
            <HeadRow>
              <span>Nummer</span>
              <span>Titel</span>
              <span>Gegenpartei</span>
              <span>Betrag</span>
              <span>Status</span>
              <span>Aktion</span>
            </HeadRow>
            {visible.map((c) => (
              <Row key={c.caseId} active={c.caseId === selected}>
                <span>{c.caseNumber}</span>
                <button
                  type="button"
                  onClick={() => setSelected(c.caseId)}
                  style={{ background: "none", border: 0, padding: 0, textAlign: "left", cursor: "pointer" }}
                >
                  {c.title ?? `${CASE_KIND_LABEL[c.kind]}: ${c.counterpartyName ?? "unbekannt"}`}
                </button>
                <span>{c.counterpartyName}</span>
                <AmountCell value={c.totalAmount} />
                <StatusBadge axis="sachverhalt" status={c.lifecycleStatus} />
                <RowActions>
                  <Button size="xs" variant="tertiary" onClick={() => setEditing(c)}>
                    Bearbeiten
                  </Button>
                  <TodoInline spec="0008" name="OverflowMenu" />
                </RowActions>
              </Row>
            ))}
          </Table>
        )}

        <CardFoot>
          <Pagination page={1} totalPages={4} totalItems={87} pageSize={25} buildHref={(p) => `?page=${p}`} />
        </CardFoot>
      </Card>

      {current ? (
        <Card>
          <CardHead
            title={current.title ?? CASE_KIND_LABEL[current.kind]}
            sub={`Sachverhalt ${current.caseNumber}`}
            actions={
              <Badge tone={current.openClarificationsCount > 0 ? "warning" : "neutral"} dot>
                {current.openClarificationsCount} Rückfragen
              </Badge>
            }
          />
          <div style={{ display: "grid", gap: "var(--space-3)", padding: "var(--space-4, 16px)" }}>
            <FieldList
              title="Kennzahlen"
              rows={[
                ["Art", CASE_KIND_LABEL[current.kind]],
                ["Gegenpartei", current.counterpartyName ?? "—"],
                ["Betrag", <AmountCell key="a" value={current.totalAmount} />],
                ["Zuständig", current.disposition ?? "—"],
                ["Eröffnet", <Timestamp key="t" iso={current.openedAt} />],
                ["Export", current.exportStatus ?? "kein Bezug"],
              ]}
            />
            {current.summary ? (
              <Todo spec="0022" name="Markdown">
                Die Zusammenfassung kommt als Markdown vom Classifier. Ohne
                Renderer steht sie hier als roher Text: „{current.summary}"
              </Todo>
            ) : null}
            <Todo spec="0023" name="Timeline">
              Belegeingang, Bank-Ereignisse, Klärungen und Buchungen als ein
              Strang — heute siebenmal verschieden gebaut, im v3-Backlog unter
              „Später" geführt.
            </Todo>
            <Todo spec="0005" name="Disclosure">
              Regelwerk, Erwartungen und Rohdaten hängen als aufklappbare
              Abschnitte darunter; heute steht dafür natives `details`.
            </Todo>
          </div>
          <ActionBar
            primary={<Button onClick={() => setEditing(current)}>Bearbeiten</Button>}
            secondary={
              <Button variant="danger" onClick={() => setDeleting(current)}>
                Schließen
              </Button>
            }
            tertiary={<TodoInline spec="0004" name="ActionButton" />}
          />
        </Card>
      ) : (
        <EmptyState
          inline
          title="Kein Sachverhalt gewählt"
          description="Wählen Sie links einen aus, um Kennzahlen und Verlauf zu sehen."
        />
      )}

      <Dialog
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? `Sachverhalt ${editing.caseNumber} bearbeiten` : "Sachverhalt anlegen"}
        footer={
          <>
            <Button
              variant="tertiary"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Speichern
            </Button>
          </>
        }
      >
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <Field label="Titel">
            <Input defaultValue={editing?.title ?? ""} placeholder="Eingangsrechnung: …" />
          </Field>
          <Field label="Art">
            <Select defaultValue={editing?.kind ?? "incoming_invoice"}>
              {CASE_KIND.map((k) => (
                <option key={k} value={k}>
                  {CASE_KIND_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Gegenpartei">
            <Todo spec="0009" name="Combobox">
              Aus tausenden Geschäftspartnern einen suchen — heute drei
              Eigenbauten (`CreditorCombobox`, `KontoCombobox`, `TaxKeySelect`).
            </Todo>
          </Field>
          <Field label="Zusammenfassung">
            <Textarea defaultValue={editing?.summary ?? ""} rows={3} />
          </Field>
          <Todo spec="0024" name="DateField">
            Eröffnungsdatum und Frist brauchen ein Datumsfeld; 14 Dateien bauen
            es heute selbst.
          </Todo>
        </div>
      </Dialog>

      <ReasonDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Sachverhalt ${deleting?.caseNumber} schließen?`}
        confirmLabel="Schließen"
        onConfirm={(reason) => {
          if (deleting) {
            setRows((rs) =>
              rs.map((r) =>
                r.caseId === deleting.caseId
                  ? { ...r, closedAt: new Date().toISOString(), lifecycleStatus: "closed_rejected" as const }
                  : r,
              ),
            );
          }
          setDeleting(null);
          void reason;
        }}
      >
        Der Sachverhalt verschwindet aus der offenen Arbeit. Buchungen bleiben.
      </ReasonDialog>

      <Todo spec="0007" name="Toast">
        Anlegen, Speichern und Schließen quittieren heute nichts — die Handlung
        gelingt stumm. Das ist die auffälligste Lücke dieser Seite.
      </Todo>
    </div>
  );
}

const meta = {
  title: "Seiten/Sachverhalt CRUD",
  component: Page,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

/** List, detail, create, edit and close — the whole cycle on one page. */
export const FullCycle: Story = {};
