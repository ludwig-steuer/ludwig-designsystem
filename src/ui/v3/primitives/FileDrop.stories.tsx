import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FileDrop, type DroppedFile } from "./FileDrop";
import { Card, CardHead } from "./Table";

const meta: Meta<typeof FileDrop> = {
  title: "v3/Primitives/Formular/FileDrop",
  component: FileDrop,
};
export default meta;
type Story = StoryObj<typeof FileDrop>;

/** Leere Zone mit Hinweis; der Knopf ist der Tastaturweg. */
export const Empty: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 460 }}>
      <FileDrop
        label="Belege hochladen"
        hint="PDF, JPG oder PNG, höchstens 20 MB je Datei"
        accept="application/pdf,image/*"
        maxSizeMb={20}
        onFiles={() => {}}
      />
      <FileDrop label="Gesperrt, solange der Stapel läuft" disabled onFiles={() => {}} />
    </div>
  ),
};

/** Drei Dateien mit Größe; entfernen geht, solange nichts läuft. */
export const WithFiles: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <FileDrop
        label="Belege hochladen"
        hint="PDF, JPG oder PNG"
        onFiles={() => {}}
        onRemove={() => {}}
        files={[
          { id: "1", name: "RE-4471-Buerobedarf.pdf", size: 284_112 },
          { id: "2", name: "Tankquittung-26-08.jpg", size: 1_842_000 },
          { id: "3", name: "Kassenbon.png", size: 96_400 },
        ]}
      />
    </div>
  ),
};

/** Zwei laden noch, eine ist fertig — der Fortschritt kommt von außen. */
export const Uploading: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <FileDrop
        label="Belege hochladen"
        onFiles={() => {}}
        onRemove={() => {}}
        files={[
          { id: "1", name: "RE-4471-Buerobedarf.pdf", size: 284_112, progress: 0.35 },
          { id: "2", name: "Tankquittung-26-08.jpg", size: 1_842_000, progress: 0.8 },
          { id: "3", name: "Kassenbon.png", size: 96_400 },
        ]}
      />
    </div>
  ),
};

/**
 * Abgelehnt wird mit Grund — und die übrigen Dateien kommen trotzdem an.
 *
 * Die Sätze stehen hier als `error` an den Dateien, weil eine statische Story
 * nichts fallen lassen kann; wörtlich dieselben erzeugt `rejectionReason` beim
 * echten Ablegen. Kein MIME-Ausdruck: die Zeile nennt die **Endung**, die
 * gerade versucht wurde, und den Hinweis mit den erlaubten (0021).
 */
export const Rejected: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <FileDrop
        label="Belege hochladen"
        hint="PDF, JPG oder PNG, höchstens 20 MB je Datei"
        accept=".pdf,image/*"
        maxSizeMb={20}
        onFiles={() => {}}
        onRemove={() => {}}
        files={[
          { id: "1", name: "RE-4471-Buerobedarf.pdf", size: 284_112 },
          {
            id: "2",
            name: "Scan-Ordner-2026.pdf",
            size: 48_000_000,
            error: "Zu groß — höchstens 20 MB.",
          },
          {
            id: "3",
            name: "buchungen.xlsx",
            size: 22_400,
            error:
              "XLSX-Dateien nehmen wir hier nicht — erlaubt ist: PDF, JPG oder PNG, höchstens 20 MB je Datei.",
          },
        ]}
      />
    </div>
  ),
};

/** Rundlauf: wählen, Liste wächst, entfernen. */
export const Interactive: Story = {
  render: function Render() {
    const [files, setFiles] = useState<DroppedFile[]>([]);
    return (
      <div style={{ maxWidth: 460 }}>
        <FileDrop
          label="Belege hochladen"
          hint="Alles erlaubt, höchstens 5 MB je Datei"
          maxSizeMb={5}
          files={files}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          onFiles={(picked) =>
            setFiles((prev) => [
              ...prev,
              ...picked.map((f) => ({ id: `${f.name}-${f.size}`, name: f.name, size: f.size })),
            ])
          }
        />
      </div>
    );
  },
};

/** In der Karte als Beleg-Nachforderung, wie im Portal. */
export const InCard: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Card>
        <CardHead title="Fehlende Belege" sub="3 Nachforderungen, fällig 12.09.2026" />
        <div style={{ padding: "var(--space-5)" }}>
          <p style={{ fontSize: 13.5, marginTop: 0 }}>
            Für diese Buchungen fehlt noch ein Beleg: Tankstelle Nord (84,50 €), o2 (23,80 €),
            Bürobedarf Meier (1.249,90 €).
          </p>
          <FileDrop
            label="Belege nachreichen"
            hint="PDF oder Foto, höchstens 20 MB je Datei"
            maxSizeMb={20}
            onFiles={() => {}}
            onRemove={() => {}}
            files={[{ id: "1", name: "Tankquittung-26-08.jpg", size: 1_842_000 }]}
          />
        </div>
      </Card>
    </div>
  ),
};
