import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  ActionBar,
  ActionButton,
  Amount,
  Button,
  Card,
  CardHead,
  Checklist,
  Field,
  FilterBar,
  Input,
  KpiGrid,
  KpiTile,
  MasterDetail,
  MenuItem,
  OverflowMenu,
  PageHeader,
  ProgressBar,
  Select,
  StepHeader,
  StepRail,
  ToastHost,
  TodoList,
  isOpen,
  nextOpen,
  useToast,
  type ChecklistRow,
  type RailItem,
  type TodoItem,
} from "@/ui/v3";

import { Todo } from "./Todo";

/**
 * **Stapelabnahme — the eleven-step review, assembled from the set.**
 *
 * A showcase page, not a component: nothing here is exported from `@/ui/v3`,
 * and the app builds this screen itself. Its only job is the completeness
 * test that per-component stories cannot do — can the set carry a whole page?
 *
 * Where it cannot, a `Todo` marker names the backlog entry instead of local
 * markup filling in. Read the markers as the result of the test.
 *
 * **Stand 2026-09-03:** von acht Markern sind sechs durch echte Bausteine
 * ersetzt. Übrig bleiben zwei, und beide sind ehrlich: 0015 (der Editor
 * braucht sein zweispaltiges Journal) und die sieben Schritte, die dieser
 * Test bewusst nicht nachbaut.
 *
 * Reference: `reference/f109-buchungsreview/Buchungsreview.dc.html`
 * (screens 0–10), design brief §3 and §7.
 */

const STEPS: { label: string; sub: string; open: number; total: number }[] = [
  { label: "Ergebnis des Stapels", sub: "Was der Agent geschafft hat", open: 0, total: 0 },
  { label: "Vollständigkeit", sub: "Belege, Bank, Salden", open: 0, total: 4 },
  { label: "Rückfragen", sub: "Fragen, Overrides", open: 6, total: 7 },
  { label: "Buchungen", sub: "Sachverhalt für Sachverhalt", open: 6, total: 6 },
  { label: "Bank", sub: "Verrechnung, Ausgleich", open: 2, total: 2 },
  { label: "Offene Posten", sub: "OPOS je Gegenpartei", open: 2, total: 2 },
  { label: "Plausibilität", sub: "Konten-Vergleich", open: 7, total: 7 },
  { label: "Konventionen", sub: "Was der Agent gelernt hat", open: 1, total: 3 },
  { label: "Prüfprotokoll", sub: "Was geprüft wurde", open: 0, total: 0 },
  { label: "Übergabe an DATEV", sub: "Stapel anlegen", open: 1, total: 1 },
  { label: "Nachlese", sub: "Was zurückkam", open: 0, total: 0 },
];

function railItems(activeIndex: number): RailItem[] {
  return STEPS.map((s, i) => ({
    key: String(i),
    index: i,
    label: s.label,
    sub: s.sub,
    tone: i === activeIndex ? "open" : s.open > 0 ? "open" : "done",
    counterText: s.total === 0 ? null : `${s.open} / ${s.total} offen`,
    href: null,
    current: i === activeIndex,
  }));
}

const BOOKINGS: TodoItem[] = [
  {
    id: "sv-2026-0140",
    state: "open",
    title: "Musterfirma GmbH · Bürobedarf",
    sub: "RE-2026-0140 · 26.08.2026",
    right: "1.475,60 €",
  },
  {
    id: "sv-2026-0141",
    state: "open",
    title: "M-net · Telefon Juli",
    sub: "Lastschrift 29.07.2026",
    right: "498,49 €",
    blocking: true,
  },
  {
    id: "sv-2026-0142",
    state: "done",
    title: "Deutsche Telekom AG · Mobilfunk",
    sub: "RE-8842 · 12.08.2026",
    right: "212,40 €",
  },
];

const COMPLETENESS: ChecklistRow[] = [
  { key: "1a", state: "done", label: "Auszüge vorhanden, Saldenanschluss stimmt", counter: "4 / 4" },
  { key: "3f", state: "done", label: "Jeder Beleg im Zeitraum ist erledigt", counter: "96 / 96" },
  { key: "4d", state: "open", label: "Bank vollständig erklärt", counter: "2 offen", counterAlarm: true, progress: 0.86 },
  { key: "vk", state: "done", label: "Verrechnungskonten auf Null", counter: "0,00 €" },
];

function AcceptancePage() {
  const { show } = useToast();
  const [filters, setFilters] = useState(0);
  const [step, setStep] = useState(3);
  const [selected, setSelected] = useState<string | null>(BOOKINGS[0]!.id);
  const [done, setDone] = useState<Set<string>>(new Set(["sv-2026-0142"]));

  const items = BOOKINGS.map((b) => (done.has(b.id) ? { ...b, state: "done" as const } : b));
  const openCount = items.filter((i) => isOpen(i.state)).length;

  const accept = () => {
    if (!selected) return;
    setDone((prev) => new Set(prev).add(selected));
    setSelected(nextOpen(items, selected));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "var(--space-5, 20px)" }}>
      <StepRail
        items={railItems(step)}
        ariaLabel="Schritte der Stapelabnahme"
        head={
          <PageHeader
            overline="Musterbau GmbH · 2026"
            title="Stapelabnahme"
            description="Lauf 2026-08-31, elf Schritte."
          />
        }
        foot={<ProgressBar done={STEPS.filter((s) => s.open === 0).length} total={STEPS.length} label="Schritte" />}
      />

      <div style={{ display: "grid", gap: "var(--space-4, 16px)", minWidth: 0 }}>
        <StepHeader
          overline={`Schritt ${step} von 10`}
          title={STEPS[step]!.label}
          lead={STEPS[step]!.sub}
          onPrev={step > 0 ? () => setStep((v) => v - 1) : null}
          onNext={step < 10 ? () => setStep((v) => v + 1) : null}
          nextLabel={step < 10 ? STEPS[step + 1]!.label : undefined}
          actions={
            <OverflowMenu size="sm">
              <MenuItem href="#">Lauf-Protokoll ansehen</MenuItem>
              <MenuItem href="#">Stapel als CSV laden</MenuItem>
              <MenuItem tone="danger">Stapel zurück an den Agenten</MenuItem>
            </OverflowMenu>
          }
        />

        {step === 0 ? (
          <KpiGrid columns={4}>
            <KpiTile label="Sachverhalte" value="52" sub="alle bearbeitet" />
            <KpiTile label="Buchungsvorschläge" value="87" sub="6 warten auf Sie" />
            <KpiTile label="Belege erledigt" value="96 / 96" sub="keine Nachforderung" />
            <KpiTile
              label="Σ Soll / Haben"
              value={<Amount value={34210.55} currency="EUR" size="lg" />}
              sub="ausgeglichen"
            />
          </KpiGrid>
        ) : null}

        {step === 1 ? (
          <Card>
            <CardHead title="Vollständigkeit" sub="Serverseitig geprüft — Sie quittieren, Sie rechnen nicht nach." />
            <Checklist rows={COMPLETENESS} />
          </Card>
        ) : null}

        {step === 3 ? (
          <>
            {/* Der Filter steht über der Arbeitsfläche, nicht in einer ihrer
                Spalten — sonst wird er zum Grid-Item und schiebt das Detail
                in die falsche Spalte (im Browser gesehen, 2026-09-03). */}
            <FilterBar activeCount={filters} onReset={() => setFilters(0)}>
              <Field label="Zustand">
                <Select defaultValue="offen" onChange={() => setFilters(1)}>
                  <option value="offen">Nur offene</option>
                  <option value="alle">Alle</option>
                </Select>
              </Field>
              <Field label="Suche">
                <Input type="search" placeholder="Sachverhalt oder Kreditor" />
              </Field>
            </FilterBar>
            <MasterDetail
              list={
                <Card>
                  <CardHead title="Buchungen" sub={`${openCount} von ${items.length} offen`} />
                  <TodoList
                    groups={[{ label: "Sachverhalt für Sachverhalt", items }]}
                    selectedId={selected}
                    onSelect={setSelected}
                  />
                </Card>
              }
              detail={
                <Card>
                <CardHead title="Buchungssatz" sub={selected ?? "nichts gewählt"} />
                <div style={{ display: "grid", gap: "var(--space-3)", padding: "var(--space-4, 16px)" }}>
                  <Todo spec="0015" name="JournalEntryEditor (zweispaltiges Journal)">
                    Der Editor steht bereits; Soll und Haben stehen darin noch in
                    einer Spalte statt in zweien. Der letzte offene Punkt dieser
                    Seite.
                  </Todo>
                </div>
                <ActionBar
                  primary={
                    <ActionButton
                      variant="primary"
                      disabled={!selected}
                      pendingLabel="Gebe frei …"
                      action={async () => {
                        await new Promise<void>((r) => setTimeout(r, 400));
                        accept();
                        show({ text: "Die Buchung wurde freigegeben." });
                      }}
                    >
                      Freigeben
                    </ActionButton>
                  }
                  secondary={<Button variant="tertiary">Korrigieren</Button>}
                  tertiary={
                    <ActionButton
                      variant="tertiary"
                      action={async () => {
                        await new Promise<void>((r) => setTimeout(r, 400));
                        return { error: "Der Satz hängt an einer offenen Rückfrage." };
                      }}
                    >
                      Zurückstellen
                    </ActionButton>
                  }
                  info={`${openCount} offen`}
                />
              </Card>
            }
            />
          </>
        ) : null}

        {step !== 0 && step !== 1 && step !== 3 ? (
          <Card>
            <CardHead title={STEPS[step]!.label} sub={STEPS[step]!.sub} />
            <div style={{ padding: "var(--space-4, 16px)" }}>
              <Todo spec="—" name={`Schritt ${step}`}>
                Nicht Teil dieses Vollständigkeitstests. Die Schritte 0, 1 und 3
                decken die drei Muster ab, aus denen alle elf gebaut sind:
                Kennzahlen, Prüfliste, Todo mit Detail.
              </Todo>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

/** Die Seite lebt im `ToastHost` — sonst hätte die Quittung keinen Ort (0007). */
function Page() {
  return (
    <ToastHost>
      <AcceptancePage />
    </ToastHost>
  );
}

const meta = {
  title: "Seiten/Stapelabnahme",
  component: Page,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Step 3 — the working screen: rail, todo list, detail, action bar. */
export const Bookings: Story = {};
