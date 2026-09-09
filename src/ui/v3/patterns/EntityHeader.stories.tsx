import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookOpen, Landmark, Layers } from "lucide-react";
import { useState } from "react";

import { Amount } from "../primitives/Amount";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { InlineEdit } from "../primitives/InlineEdit";
import { Link } from "../primitives/Link";
import { PageHeader } from "../primitives/PageHeader";
import { Popover } from "../primitives/Popover";
import { RecordPager } from "../primitives/RecordPager";
import { EntityHeader } from "./EntityHeader";
import { ProcessStepper } from "./Process";
import { StatusBadge } from "./StatusBadge";
import { axisLegend } from "@/ludwig/ui/status/status-registry";

const meta: Meta<typeof EntityHeader> = { title: "v3/Patterns/Rahmen/EntityHeader", component: EntityHeader };
export default meta;
type Story = StoryObj<typeof EntityHeader>;

const FACTS: [string, string][] = [
  ["Eröffnet", "26.08.2026"],
  ["Belegnummer", "RE-4471"],
  ["Personenkonto", "70044 · Bürobedarf Meier GmbH"],
  ["Belegdatum", "21.08.2026"],
];

/**
 * Alle Slots belegt. Der Gegenpart steht **einmal** — im Titel; die
 * Faktenzeile trägt, was der Titel nicht sagt (Seitenprofil, Zweifel 4).
 * Die Meta-Zeile setzt der Aufrufer zusammen: die Karte trennt die Teile nur
 * mit einem Punkt, deshalb muss jedes Kind ein echtes Element sein.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 940 }}>
      <EntityHeader
        icon={<Layers size={20} strokeWidth={1.5} />}
        overline="Sachverhalt · 2026-0815"
        title="Eingangsrechnung: DomainFactory GmbH"
        status={<StatusBadge axis="sachverhalt" status="needs_clarification" showIcon={false} />}
        meta={
          <>
            <Badge tone="neutral">Eingangsrechnung</Badge>
            <Link href="/partners/domainfactory">DomainFactory GmbH</Link>
            <span>Eine Belegnummer</span>
          </>
        }
        metric={{ label: "Gesamtbetrag", value: <Amount value={1475.6} currency="EUR" size="lg" /> }}
        summary="Wartung der Heizungsanlage, Rechnung 2026-0412 — Umwälzpumpe getauscht."
        facts={FACTS}
        actions={<Button variant="secondary" size="sm">Beleg anhängen</Button>}
      />
    </div>
  ),
};

/**
 * Nur ein Titel. Jede leere Zeile verschwindet **samt Abstand** — die Karte
 * ist nicht höher als ihr Inhalt, und es steht kein Platzhalter darin.
 */
export const Minimal: Story = {
  render: () => (
    <div style={{ maxWidth: 940 }}>
      <EntityHeader title="Sachverhalt ohne alles" />
    </div>
  ),
};

/**
 * Zweifel 1 aus dem Seitenprofil: die stärkste Stelle im Kopf war leer
 * („GESAMTBETRAG —"). Ohne `metric` steht dort jetzt **nichts**. Wer eine
 * Ersatzzahl hat — den Betrag des Belegs —, gibt sie mit ihrem eigenen Label.
 */
export const WithoutMetric: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 940 }}>
      <EntityHeader
        icon={<Layers size={20} strokeWidth={1.5} />}
        overline="Sachverhalt · 2026-0816"
        title="Kassenbericht August"
        status={<StatusBadge axis="sachverhalt" status="open" showIcon={false} />}
        facts={[
          ["Eröffnet", "29.08.2026"],
          ["Belegnummer", "—"],
        ]}
      />
      <EntityHeader
        icon={<Layers size={20} strokeWidth={1.5} />}
        overline="Sachverhalt · 2026-0816"
        title="Kassenbericht August"
        status={<StatusBadge axis="sachverhalt" status="open" showIcon={false} />}
        metric={{ label: "Betrag des Belegs", value: <Amount value={318.4} currency="EUR" size="lg" /> }}
        facts={[
          ["Eröffnet", "29.08.2026"],
          ["Belegnummer", "—"],
        ]}
      />
    </div>
  ),
};

/**
 * Derselbe Kopf für ein Konto — der Klassen-Test: kein Sachverhalts-Wissen
 * steckt in der Karte. Das Symbol kommt vom Aufrufer, nicht aus einer
 * Status-Achse; ein Konto hat keine mit Icon.
 */
export const OtherEntity: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 940 }}>
      <EntityHeader
        icon={<Landmark size={20} strokeWidth={1.5} />}
        overline="Sachkonto · SKR04"
        title="6815 · Bürobedarf"
        status={<StatusBadge axis="konto" status="active" showIcon={false} />}
        meta={
          <>
            <Badge tone="info">Aufwand</Badge>
            <span>Steuerschlüssel 9</span>
          </>
        }
        metric={{ label: "Saldo 2026", value: <Amount value={18402.55} currency="EUR" size="lg" /> }}
        facts={[
          ["Klasse", "Aufwand"],
          ["Buchungen", "214"],
          ["Zuletzt bebucht", "29.08.2026"],
        ]}
      />
      <EntityHeader
        icon={<BookOpen size={20} strokeWidth={1.5} />}
        overline="Buchung · sv-2026-0140"
        title="6815 an 70044 · Bürobedarf August"
        status={<StatusBadge axis="buchung" status="proposed" showIcon={false} />}
        metric={{ label: "Betrag", value: <Amount value={1475.6} currency="EUR" size="lg" /> }}
      />
    </div>
  ),
};

/**
 * Der Kopf als Arbeitsfläche: die Zusammenfassung ist ein `InlineEdit` im
 * `summary`-Slot, der Status ein Menü über den Chevron aus 0049. Beides sind
 * Client-Inseln des Aufrufers; die Karte selbst bleibt server-tauglich.
 *
 * `InlineEdit` gehört **nicht** in die Meta-Zeile: es bringt sein eigenes
 * Label mit und ist damit zweizeilig, die Meta-Zeile erwartet Inline-Teile —
 * sonst hängt ihr Trennpunkt neben einem Block in der Luft.
 */
export const Editable: Story = {
  render: function Render() {
    const [status, setStatus] = useState("needs_clarification");
    const [open, setOpen] = useState(false);
    const [summary, setSummary] = useState("");
    const next = axisLegend("sachverhalt", [
      "needs_clarification",
      "waiting_for_documents",
      "closed_accepted",
      "closed_rejected",
    ]);
    return (
      <div style={{ maxWidth: 940 }}>
        <EntityHeader
          icon={<Layers size={20} strokeWidth={1.5} />}
          overline="Sachverhalt · 2026-0815"
          title="Eingangsrechnung: DomainFactory GmbH"
          status={
            <Popover
              open={open}
              onOpenChange={setOpen}
              trigger={
                <button type="button" className="v2btn v2btn--tertiary v2btn--sm">
                  <StatusBadge axis="sachverhalt" status={status} info={false} showIcon={false} chevron />
                </button>
              }
            >
              <div style={{ display: "grid", gap: 2, minWidth: 260 }}>
                {next.map((it) => (
                  <button
                    key={it.value}
                    type="button"
                    className="v2menu__item"
                    onClick={() => {
                      setStatus(it.value);
                      setOpen(false);
                    }}
                  >
                    <StatusBadge axis="sachverhalt" status={it.value} info={false} showIcon={false} />
                  </button>
                ))}
              </div>
            </Popover>
          }
          meta={
            <>
              <Badge tone="neutral">Eingangsrechnung</Badge>
              <Link href="/partners/domainfactory">DomainFactory GmbH</Link>
            </>
          }
          metric={{ label: "Gesamtbetrag", value: <Amount value={1475.6} currency="EUR" size="lg" /> }}
          summary={
            <InlineEdit
              label="Zusammenfassung"
              value={summary}
              onSave={setSummary}
              renderValue={(v) => (v ? v : <span className="v2muted">Zusammenfassung schreiben</span>)}
            />
          }
          facts={FACTS}
        />
      </div>
    );
  },
};

/**
 * Im Einsatz, wie 0050 es zusammensetzt: oben der `PageHeader` mit dem
 * `RecordPager` (Bereich, Rückweg, Vorrat), darunter die Karte mit der Akte.
 * Der Seitenkopf trägt kein `back` — das tut der Pager, und zwei Rückwege
 * nebeneinander sind einer zu viel.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 940 }}>
      <PageHeader
        overline="Musterbau GmbH · 2026"
        title="Sachverhalt prüfen"
        actions={
          <RecordPager
            position={3}
            total={117}
            label="Sachverhalt"
            back={{ href: "/cases", label: "Sachverhalte" }}
            prevHref="/cases/2"
            nextHref="/cases/4"
          />
        }
      />
      <EntityHeader
        icon={<Layers size={20} strokeWidth={1.5} />}
        overline="Sachverhalt · 2026-0815"
        title="Eingangsrechnung: DomainFactory GmbH"
        status={<StatusBadge axis="sachverhalt" status="needs_clarification" showIcon={false} />}
        meta={
          <>
            <Badge tone="neutral">Eingangsrechnung</Badge>
            <Link href="/partners/domainfactory">DomainFactory GmbH</Link>
          </>
        }
        metric={{ label: "Gesamtbetrag", value: <Amount value={1475.6} currency="EUR" size="lg" /> }}
        facts={FACTS}
      />
    </div>
  ),
};

/**
 * `process` (0137): das Prozessbild einer Kette, als **eigene Zeile** zwischen
 * Titelblock und Zusammenfassung.
 *
 * Z7 verlangt für jede mehrstufige Kette dieselbe Familie, und `ProcessStepper`
 * trägt dafür die Zusage „im Detail-Header" — nur gab es dort bis heute keinen
 * Platz. `meta` verlangt Inline-Elemente, `summary` ist eine Zeile Text; ein
 * Stepper ist ein Block und passt in keins von beidem.
 *
 * **Badge und Stepper sind kein D7-Verstoß, solange sie nicht nebeneinander
 * stehen.** Der Badge sitzt in der Titelzeile und antwortet „in welchem
 * Zustand", das Bild eine Zeile darunter und antwortet „wo in der Kette". Der
 * Verstoß wäre ein `StatusBadge` **im** `process`-Slot.
 *
 * Die zweite Karte zeigt denselben Kopf ohne die Prop: **leer heißt weg**, samt
 * Abstand — dieselbe Regel wie bei `metric`, `summary` und `facts`, und der
 * Grund, warum der Kopf mit zehn Slots nicht auseinanderfällt.
 */
export const WithProcess: Story = {
  render: () => {
    const phases = [
      { key: "buchen", label: "Buchen", sub: "Agent", states: ["queued", "running", "proposed"], status: "done" as const },
      { key: "pruefen", label: "Prüfen", sub: "Kanzlei", states: ["review", "returned", "approved"], status: "active" as const },
      { key: "uebergeben", label: "Übergeben", sub: "Übertragung", states: ["exporting", "exported"], status: "pending" as const },
      { key: "nachlesen", label: "Nachlesen", sub: "DATEV", states: ["mirrored", "reconciled"], status: "pending" as const },
    ];
    const head = (withPicture: boolean) => (
      <EntityHeader
        icon={<Layers size={20} strokeWidth={1.5} />}
        overline="Stapel · 2026-08-A"
        title="Buchungsstapel August 2026"
        status={<StatusBadge axis="sachverhalt" status="needs_clarification" showIcon={false} />}
        {...(withPicture
          ? {
              process: (
                <ProcessStepper
                  phases={phases}
                  owner={{ key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" }}
                  loops={{ returned: 2, reopened: 1 }}
                  phaseSince={{ buchen: "26.08." }}
                />
              ),
            }
          : {})}
        metric={{ label: "Gesamtbetrag", value: <Amount value={18450.2} currency="EUR" size="lg" /> }}
        summary="41 Buchungen, zwei davon mit offener Rückfrage."
      />
    );
    return (
      <div style={{ maxWidth: 940, display: "grid", gap: 32 }}>
        {head(true)}
        {head(false)}
      </div>
    );
  },
};
