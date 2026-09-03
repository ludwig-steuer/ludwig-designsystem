import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  ActionBar,
  ActionButton,
  Amount,
  AmountCell,
  Badge,
  Button,
  Card,
  CardFoot,
  CardHead,
  Combobox,
  DateField,
  Dialog,
  Disclosure,
  EmptyState,
  Field,
  FieldList,
  FilterBar,
  HeadRow,
  Input,
  Markdown,
  MenuItem,
  OverflowMenu,
  PageHeader,
  Pagination,
  ReasonDialog,
  Row,
  RowActions,
  Select,
  StatusBadge,
  Table,
  Tabs,
  Textarea,
  TextButton,
  Time,
  Timeline,
  ToastHost,
  useToast,
  type TimelineItem,
} from "@/ui/v3";
import { CASE_KIND, CASE_KIND_LABEL, type CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";


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
 * **Stand 2026-09-03:** die zehn Marker dieser Seite sind bis auf einen durch
 * echte Bausteine ersetzt — PageHeader, FilterBar, OverflowMenu, ActionButton,
 * Combobox, DateField, Disclosure, Markdown, Timeline und Toast stehen. Was
 * bleibt, steht als Marker da und ist damit die ehrliche Antwort auf „was
 * fehlt dem Set noch".
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

function CasePage() {
  const [rows, setRows] = useState(CASES);
  const [tab, setTab] = useState("offen");
  const [selected, setSelected] = useState<string | null>("c1");
  const [partner, setPartner] = useState<string | null>("p1");
  const [openedOn, setOpenedOn] = useState<string | null>("2026-08-26");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CaseListItem | null>(null);
  const [deleting, setDeleting] = useState<CaseListItem | null>(null);

  const [filters, setFilters] = useState(0);
  const { show } = useToast();

  const visible = rows.filter((r) =>
    tab === "offen" ? !r.closedAt : tab === "geschlossen" ? !!r.closedAt : true,
  );
  const current = rows.find((r) => r.caseId === selected) ?? null;

  return (
    <div style={{ display: "grid", gap: "var(--space-4, 16px)", padding: "var(--space-4, 16px)" }}>
      <PageHeader
        back={{ href: "#", label: "Alle Mandanten" }}
        overline="Musterfirma GmbH · Wirtschaftsjahr 2026"
        title="Sachverhalte"
        description={`${rows.length} insgesamt, ${rows.filter((r) => !r.closedAt).length} davon offen.`}
        actions={<Button variant="primary" onClick={() => setCreating(true)}>Sachverhalt anlegen</Button>}
      />

      {/* Die Filterleiste steht über der Karte, nie im Kartenkopf (0003). */}
      <FilterBar activeCount={filters} onReset={() => setFilters(0)}>
        <Field label="Gegenpartei">
          <Select defaultValue="" onChange={() => setFilters(1)}>
            <option value="">Alle</option>
            <option value="musterfirma">Musterfirma GmbH</option>
            <option value="stadtwerke">Stadtwerke Musterstadt</option>
          </Select>
        </Field>
        <Field label="Eröffnet ab">
          <DateField value="2026-08-01" onChange={() => setFilters(1)} />
        </Field>
        <Field label="Suche">
          <Input type="search" placeholder="Nummer, Titel oder Gegenpartei" />
        </Field>
      </FilterBar>

      <Card>
        <CardHead title="Sachverhalte" sub={`${visible.length} von ${rows.length}`} />

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
                <TextButton onClick={() => setSelected(c.caseId)}>
                  {c.title ?? `${CASE_KIND_LABEL[c.kind]}: ${c.counterpartyName ?? "unbekannt"}`}
                </TextButton>
                <span>{c.counterpartyName}</span>
                <AmountCell value={c.totalAmount} />
                <StatusBadge axis="sachverhalt" status={c.lifecycleStatus} />
                <RowActions>
                  <TextButton onClick={() => setEditing(c)}>Bearbeiten</TextButton>
                  <OverflowMenu size="xs">
                    <MenuItem href="#">Belege ansehen</MenuItem>
                    <MenuItem href="#">In DATEV öffnen</MenuItem>
                    <MenuItem tone="danger" onClick={() => setDeleting(c)}>
                      Sachverhalt schließen
                    </MenuItem>
                  </OverflowMenu>
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
                ["Betrag", <Amount key="a" value={current.totalAmount} currency="EUR" />],
                ["Zuständig", current.disposition ?? "—"],
                ["Eröffnet", <Time key="t" value={current.openedAt} />],
                ["Export", current.exportStatus ?? "kein Bezug"],
              ]}
            />
            <Markdown text={current.summary ?? null} />
            <Timeline entries={historyOf(current)} kindLabels={EVENT_LABELS} />
            <div>
              <Disclosure summary="Regelwerk und Erwartungen" count={2}>
                <FieldList
                  tone="bare"
                  rows={[
                    ["Wiederkehr-Regel", "greift nicht — Betrag über 500,00 €"],
                    ["Offene Erwartung", "Beleg zur Zahlung vom 29.08.2026"],
                  ]}
                />
              </Disclosure>
              <Disclosure summary="Rohdaten des Classifiers" tone="quiet">
                <pre style={{ margin: 0, fontSize: 12, fontFamily: "var(--font-mono)" }}>
                  {JSON.stringify(
                    { kind: current.kind, counterparty: current.counterpartyName, total: current.totalAmount },
                    null,
                    2,
                  )}
                </pre>
              </Disclosure>
            </div>
          </div>
          <ActionBar
            primary={<Button variant="primary" onClick={() => setEditing(current)}>Bearbeiten</Button>}
            secondary={
              <Button variant="danger" onClick={() => setDeleting(current)}>
                Schließen
              </Button>
            }
            tertiary={
              <ActionButton
                variant="tertiary"
                size="sm"
                pendingLabel="Fordere an …"
                action={async () => {
                  await new Promise<void>((r) => setTimeout(r, 600));
                  show({ text: "Die Beleg-Nachforderung wurde an den Mandanten gesendet." });
                }}
              >
                Beleg nachfordern
              </ActionButton>
            }
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
              variant="primary"
              onClick={() => {
                show({
                  text: editing
                    ? `Sachverhalt ${editing.caseNumber} wurde gespeichert.`
                    : "Der Sachverhalt wurde angelegt.",
                });
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
          <Combobox
            label="Gegenpartei"
            name="partner"
            value={partner}
            onChange={setPartner}
            placeholder="Name oder Personenkonto"
            options={PARTNERS}
          />
          <Field label="Zusammenfassung">
            <Textarea defaultValue={editing?.summary ?? ""} rows={3} />
          </Field>
          <Field label="Eröffnet am">
            <DateField value={openedOn} onChange={setOpenedOn} />
          </Field>
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
          show({
            text: `Sachverhalt ${deleting?.caseNumber} wurde geschlossen.`,
            action: { label: "Rückgängig", onClick: () => setRows(CASES) },
          });
          setDeleting(null);
          void reason;
        }}
      >
        Der Sachverhalt verschwindet aus der offenen Arbeit. Buchungen bleiben.
      </ReasonDialog>

    </div>
  );
}

/**
 * Der Verlauf eines Sachverhalts, wie ihn die App aus Ereignissen baut. Die
 * Schlüssel sind die der Domäne, die deutschen Wörter kommen als
 * `kindLabels` — die Komponente erfindet keine Vokabeln (0023).
 */
function historyOf(c: CaseListItem): TimelineItem[] {
  return [
    {
      id: `${c.caseId}-open`,
      at: c.openedAt,
      kind: "case_opened",
      actor: "System",
      title: `Sachverhalt ${c.caseNumber} eröffnet`,
      state: "info",
    },
    {
      id: `${c.caseId}-doc`,
      at: "2026-08-26T07:40:00Z",
      kind: "document_received",
      actor: "Mandant",
      title: "Beleg im Posteingang angekommen",
      state: "done",
    },
    {
      id: `${c.caseId}-proposal`,
      at: "2026-08-30T09:12:00Z",
      kind: "booking_proposed",
      actor: "Agent",
      title: "Buchungsvorschlag erstellt",
      state: "edited",
      right: <Amount value={c.totalAmount} currency="EUR" size="sm" />,
      detail: "14 gleichartige Buchungen in sechs Monaten; die Rechnung nennt Bürobedarf.",
    },
  ];
}

/**
 * Das deutsche Wort je Ereignis-Art. Es steht hier, nicht in der Komponente:
 * `src/ludwig/` führt keinen Ereignistyp, und `Timeline` erfindet keine
 * Vokabeln (Befund in Spec 0023).
 */
const EVENT_LABELS = {
  case_opened: "Sachverhalt",
  document_received: "Beleg",
  booking_proposed: "Buchungsvorschlag",
};

/** Ein Ausschnitt der Partner, wie ihn die Suche liefern würde. */
const PARTNERS = [
  { value: "p1", label: "Musterfirma GmbH", hint: "70021", group: "Zuletzt gebucht" },
  { value: "p2", label: "Stadtwerke Musterstadt", hint: "70044", group: "Zuletzt gebucht" },
  { value: "p3", label: "Bürobedarf Meier GmbH", hint: "70058", group: "Alle Partner" },
  { value: "p4", label: "Restaurant Adler", hint: "70103", group: "Alle Partner" },
];

/** Die Seite lebt im `ToastHost` — sonst hätte die Quittung keinen Ort (0007). */
function Page() {
  return (
    <ToastHost>
      <CasePage />
    </ToastHost>
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
