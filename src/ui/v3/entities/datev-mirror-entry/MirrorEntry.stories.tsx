import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardHead } from "../../primitives/Table";
import {
  MirrorEntryCell,
  MirrorEntryList,
  MirrorEntryRow,
  type MirrorEntryVM,
} from "./MirrorEntry";

/**
 * Die Spiegelbuchung: der Satz, **wie er in DATEV steht** — gelesen, nie
 * geschrieben (0191). Durchgehendes Beispiel ist der Export LW-7F3A2C91 zur
 * Rechnung RE-24-0815 über 1.190,00 €.
 */
const meta: Meta<typeof MirrorEntryRow> = {
  title: "v3/Entitäten/DATEV-Spiegel/MirrorEntry",
  component: MirrorEntryRow,
};
export default meta;
type Story = StoryObj<typeof MirrorEntryRow>;

const entry = (over: Partial<MirrorEntryVM> = {}): MirrorEntryVM => ({
  id: "mir-31",
  description: "Müller Bürotechnik Bürobedarf",
  amount: 1190,
  currency: "EUR",
  postingDate: "2026-03-04",
  matchState: "matched_ludwig",
  externalDocumentNumber: "RE-24-0815",
  sequenceId: "2026-03",
  sequenceCommitted: true,
  exportRef: "LW-7F3A2C91",
  lines: [
    { side: "debit", accountNumber: "6815", accountName: "Bürobedarf", amount: 1190, taxKey: "9", taxRatePercent: 19 },
    { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 1190 },
  ],
  ...over,
});

/** Der Normalfall: Konten, Betrag, Belegnummer im Tooltip, ein Weg zum Satz. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <MirrorEntryCell entry={entry()} href="#" />
    </div>
  ),
};

/**
 * 41 % der Sätze haben mehr als ein Bein je Seite. Die Zelle nennt **alle**
 * Konten einer Seite, Gegenkonten eingerechnet und ohne Dublette — sonst wäre
 * „6815 an 70112" eine halbe Wahrheit.
 */
export const Multileg: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <MirrorEntryCell
        entry={entry({
          id: "mir-multi",
          description: "Müller Bürotechnik – Büro und Einrichtung",
          lines: [
            { side: "debit", accountNumber: "6815", accountName: "Bürobedarf", amount: 714 },
            { side: "debit", accountNumber: "0650", accountName: "Büroeinrichtung", amount: 476 },
            { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 1190, contraAccountNumber: "6815" },
          ],
        })}
      />
    </div>
  ),
};

/**
 * Der Rand: ein Buchungstext an der 60-Zeichen-Grenze von DATEV, eine
 * Belegnummer mit 36 Zeichen — **nicht gekürzt**, denn eine gekürzte
 * Belegnummer ist eine andere. Ohne `href` ist die Zelle Text.
 */
export const Edge: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <MirrorEntryCell
        entry={entry({
          id: "mir-edge",
          description: "Sammelbuchung Büromaterial Filialen Nord Süd West Ost",
          externalDocumentNumber: "RE-24-0815-SAMMEL-2026-03-FILIALEN",
          amount: 18450.75,
          href: null,
        })}
      />
    </div>
  ),
};

/**
 * Alle Werte der Achse `mirror_match` nebeneinander: bestätigt, von der
 * Kanzlei geändert, aufgeteilt, unklar, nur in DATEV. Die Wörter kommen aus
 * der Registry — das Set führt keine eigene Liste (Befund L-303 gilt der App).
 */
export const States: Story = {
  render: () => (
    <div style={{ maxWidth: 720, display: "grid", gap: "var(--space-4)" }}>
      <MirrorEntryRow entry={entry()} />
      <MirrorEntryRow
        entry={entry({
          id: "mir-32",
          matchState: "matched_corrected",
          description: "Müller Bürotechnik – auf 6845 umgebucht",
          lines: [
            { side: "debit", accountNumber: "6845", accountName: "Werbekosten", amount: 1190 },
            { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 1190 },
          ],
        })}
      />
      <MirrorEntryRow
        entry={entry({ id: "mir-33a", matchState: "matched_split", description: "Müller Bürotechnik Bürobedarf", amount: 714 })}
      />
      <MirrorEntryRow
        entry={entry({
          id: "mir-unclear",
          matchState: "unclear",
          description: "Sammelzahlung Bürobedarf",
          externalDocumentNumber: null,
          sequenceId: null,
        })}
      />
      <MirrorEntryRow
        entry={entry({
          id: "mir-34",
          matchState: "new_unprocessed",
          description: "Skontoertrag Müller",
          amount: 23.8,
          exportRef: null,
          markOfOrigin: "RE",
          lines: [
            { side: "debit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 23.8 },
            { side: "credit", accountNumber: "3736", accountName: "Erhaltene Skonti", amount: 23.8 },
          ],
        })}
      />
    </div>
  ),
};

/**
 * Außerhalb eines Falls steht die Sachverhaltsnummer voran — sie ist dort
 * Kontext, im Fall selbst wäre sie die Zeile, die man schon kennt.
 */
export const WithCase: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <MirrorEntryRow entry={entry({ caseNumber: "2026-0142" })} showCase />
    </div>
  ),
};

/** Mit `href` wird die Zeile ein Weg; ohne ihn enthält sie keinen Link. */
export const Interactive: Story = {
  render: () => (
    <div style={{ maxWidth: 720, display: "grid", gap: "var(--space-4)" }}>
      <MirrorEntryRow entry={entry()} href="#satz" />
      <MirrorEntryRow entry={entry({ id: "mir-plain", href: null })} />
    </div>
  ),
};

/** Die Sätze eines Sachverhalts, in der Reihenfolge des Aufrufers. */
export const AtCase: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <MirrorEntryList
        entries={[
          entry(),
          entry({
            id: "mir-34",
            matchState: "new_unprocessed",
            description: "Skontoertrag Müller",
            postingDate: "2026-03-31",
            amount: 23.8,
            exportRef: null,
            externalDocumentNumber: "RE-24-0815",
            markOfOrigin: "RE",
            lines: [
              { side: "debit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 23.8 },
              { side: "credit", accountNumber: "3736", accountName: "Erhaltene Skonti", amount: 23.8 },
            ],
          }),
        ]}
        href={(e) => `#${e.id}`}
      />
    </div>
  ),
};

/** Leer ist eine Aussage: drüben steht zu diesem Fall noch nichts. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <MirrorEntryList entries={[]} />
    </div>
  ),
};

/**
 * Aufgeteilt: die Kanzlei hat unseren Satz in zwei Teile zerlegt. Beide Teile
 * gehören zusammen gezeigt — 714,00 € allein sähen aus wie ein falscher
 * Betrag, erst zusammen ergeben sie die 1.190,00 € unseres Exports. Die
 * Gruppe selbst ist die Aussage der Nachlese (0165), nicht dieser Liste.
 */
export const Split: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <MirrorEntryList
        entries={[
          entry({ id: "mir-33a", matchState: "matched_split", amount: 714, description: "Müller Bürotechnik Bürobedarf", lines: [
            { side: "debit", accountNumber: "6815", accountName: "Bürobedarf", amount: 714 },
            { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 714 },
          ] }),
          entry({ id: "mir-33b", matchState: "matched_split", amount: 476, description: "Müller Bürotechnik Büroeinrichtung", lines: [
            { side: "debit", accountNumber: "0650", accountName: "Büroeinrichtung", amount: 476 },
            { side: "credit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 476 },
          ] }),
        ]}
      />
    </div>
  ),
};

/** Im Einsatz: die Karte am Sachverhalt, die `DatevHistoryCard` ablöst. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Card>
        <CardHead title="In DATEV gebucht" sub="zwei Sätze · zuletzt am 31.03.2026" />
        <div className="v3boxbody">
          <MirrorEntryList
            entries={[
              entry(),
              entry({
                id: "mir-34",
                matchState: "new_unprocessed",
                description: "Skontoertrag Müller",
                postingDate: "2026-03-31",
                amount: 23.8,
                exportRef: null,
                markOfOrigin: "RE",
                lines: [
                  { side: "debit", accountNumber: "70112", accountName: "Müller Bürotechnik GmbH", amount: 23.8 },
                  { side: "credit", accountNumber: "3736", accountName: "Erhaltene Skonti", amount: 23.8 },
                ],
              }),
            ]}
          />
        </div>
      </Card>
    </div>
  ),
};
