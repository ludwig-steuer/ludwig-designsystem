import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../primitives/Button";
import { DetailPane, MasterDetail } from "./MasterDetail";
import { Checklist, Messages, CheckItems, StateIcon, type ChecklistRow } from "./Review";

const meta: Meta<typeof Checklist> = { title: "v3/Patterns/Prüfen/Checklist", component: Checklist };
export default meta;
type Story = StoryObj<typeof Checklist>;

const ZEILEN: ChecklistRow[] = [
  { key: "1", state: "done", label: "Bank ist vollständig eingelesen", counter: "8 von 8", progress: 1 },
  { key: "2", state: "done", label: "Alle Belege des Zeitraums zugeordnet", counter: "94 von 94", progress: 1 },
  {
    key: "3",
    state: "warning",
    label: "Buchungsvorschläge geprüft",
    counter: "106 von 118",
    progress: 106 / 118,
    jump: "Schritt 3: Vorschläge",
  },
  {
    key: "4",
    state: "error",
    label: "Bank geht auf",
    counter: "1 offen",
    counterAlarm: true,
    jump: "Schritt 4: Zahlungen",
  },
  { key: "5", state: "question", label: "Fragen an den Mandanten beantwortet", counter: "0 von 2", progress: 0, jump: "Schritt 2: Rückfragen" },
  { key: "6", state: "open", label: "Konventionen entschieden", counter: "1 von 3", progress: 1 / 3, jump: "Schritt 7: Konventionen" },
];

/**
 * Die Prüfliste eines Gates: Prüfung · Stand · Fortschritt · Sprung. Der
 * Stand nennt die **echte** Menge — nie eine erfundene „0 von 1".
 */
export const Filled: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | undefined>("4");
    const zeile = ZEILEN.find((z) => z.key === sel);
    return (
      <MasterDetail
        list={<Checklist rows={ZEILEN} activeKey={sel} onPick={setSel} />}
        detail={
          <DetailPane title={zeile?.label} sub={zeile?.counter}>
            {zeile ? (
              <>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>
                  Auszug 8 vom 29.08. weicht um 12,40 € vom gebuchten Saldo ab.
                </p>
                <Button variant="primary" size="sm" hotkey="A">
                  Quittieren
                </Button>
              </>
            ) : null}
          </DetailPane>
        }
      />
    );
  },
};

/** Alles passed — der Leerzustand ist hier ein Erfolg, kein Nichts. */
export const AllPassed: Story = {
  render: () => (
    <Checklist
      rows={ZEILEN.map((z) => ({ ...z, state: "done", counterAlarm: false, jump: undefined }))}
    />
  ),
};

/** Noch nichts gerechnet: die Zähler bleiben leer statt zu raten. */
export const Loading: Story = {
  render: () => (
    <Checklist
      rows={ZEILEN.map((z) => ({ ...z, state: "open", counter: undefined, progress: null }))}
    />
  ),
};

/** Die neun Zustands-Icons — Lucide statt Sonderzeichen (V7). */
export const StateIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12 }}>
      {(["open", "done", "edited", "returned", "question", "skipped", "warning", "error", "info"] as const).map(
        (s) => (
          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <StateIcon state={s} />
            {s}
          </span>
        ),
      )}
    </div>
  ),
};

/**
 * Prüfpunkte: bestandene in **einer** Zeile, offene einzeln mit Begründung
 * und Weg zur Klärung (L7).
 */
export const CheckItemsMixed: Story = {
  render: () => (
    <div className="v2card">
      <CheckItems
        items={[
          { code: "P01", question: "Ist der Beleg lesbar?", reason: "OCR ohne Fehlstellen.", state: "green" },
          { code: "P02", question: "Stimmt das Datum zum Zeitraum?", reason: "21.08.2026 liegt in 08/2026.", state: "green" },
          { code: "P03", question: "Ist die Gegenpartei bekannt?", reason: "Bürobedarf GmbH, 14 Vorbelege.", state: "green" },
          {
            code: "P07",
            question: "Passt der Steuerschlüssel zum Beleg?",
            reason: "Beleg weist 7 % aus, gebucht wurde BU 9 (19 %).",
            state: "red",
            jump: <button type="button" className="v2link">Zum Satz</button>,
          },
          {
            code: "P12",
            question: "Weicht der Betrag von der Regel ab?",
            reason: "1.800,00 € gegen Ø 1.700,00 € aus 3 Vormonaten = +6 %.",
            state: "yellow",
            gate: <input type="checkbox" className="v2check" aria-label="P12 quittieren" />,
          },
          {
            code: "P19",
            question: "Ist ein Zahlungsnachweis vorhanden?",
            reason: "Noch keine Auszugszeile zugeordnet.",
            state: "open",
            jump: <button type="button" className="v2link">Zu Schritt 4</button>,
          },
        ]}
      />
    </div>
  ),
};

/** Alle passed: eine Zeile, kein Scrollen durch zwanzig grüne Haken. */
export const CheckItemsAllGreen: Story = {
  render: () => (
    <div className="v2card">
      <CheckItems
        items={Array.from({ length: 12 }, (_, i) => ({
          code: `P${String(i + 1).padStart(2, "0")}`,
          question: "Beispielprüfung",
          reason: "In Ordnung.",
          state: "green" as const,
        }))}
      />
    </div>
  ),
};

/** Keine Prüfpunkte — auch das ist eine Aussage, kein leerer Kasten. */
export const CheckItemsEmpty: Story = {
  render: () => (
    <div className="v2card">
      <CheckItems items={[]} />
    </div>
  ),
};

/** Fehler blockieren, Warnungen brauchen eine Quittung, Hinweise stehen nur da. */
export const MessagesThreeLevels: Story = {
  render: () => (
    <Messages
      items={[
        {
          key: "e1",
          level: "error",
          text: "Soll und Haben gehen um 12,40 € auseinander. Der Satz lässt sich nicht speichern.",
        },
        {
          key: "w1",
          level: "warning",
          text: "Konto 6600 wurde in diesem Zeitraum erstmals bebucht.",
          actions: (
            <>
              <button type="button" className="v2link">Kontenblatt</button>
              <button type="button" className="v2link">Quittieren</button>
            </>
          ),
        },
        {
          key: "h1",
          level: "hint",
          text: "Der Vorschlag stammt aus der Konvention „Bewirtung 70 %“ vom 12.08.2026.",
        },
      ]}
    />
  ),
};
