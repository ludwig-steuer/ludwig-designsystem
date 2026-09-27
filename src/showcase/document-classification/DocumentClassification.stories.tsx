import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { EntityIcon } from "@/ui/v3/Icons";
import { ClassificationDialog, ClassificationTrigger } from "@/ui/v3/entities/source-document/Classification";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { ProcessPictureTrigger } from "@/ui/v3/patterns/ProcessPicture";
import { StatusInfoButton } from "@/ui/v3/patterns/StatusInfoButton";
import { DataTable } from "@/ui/v3/patterns/DataTable";
import {
  DOCUMENT_LIST_COLUMNS,
  sourceDocumentColumns,
  sourceDocumentMinWidth,
} from "@/ui/v3/entities/source-document/source-document-columns";
import type { SourceDocumentVM } from "@/ui/v3/entities/source-document/SourceDocument";
import { documentFixture } from "../document/fixtures";
import { Button } from "@/ui/v3/primitives/Button";
import { Card, CardHead, HeadRow, Row, Table } from "@/ui/v3/primitives/Table";
import { byId as processById } from "../document-process/fixtures";
import { byNumber, CLASSIFICATION_SCENARIOS, type ClassificationScenario } from "./fixtures";

/**
 * The classification of a document in three sizes (0205, brief F308): all 20
 * scenarios of §7 as cell, box and dialog. The cell is variant A (owner
 * 2026-09-27, chosen from four compared variants): form, then effect and bundle.
 */
const meta: Meta = { title: "Seiten/Beleg-Einordnung", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

function List({ scenarios, density }: { scenarios: ClassificationScenario[]; density?: "regular" | "narrow" }) {
  return (
    <Card>
      <CardHead title="Belege" sub={`${scenarios.length} Fälle`} />
      <Table cols="3rem minmax(16rem, 1fr) 16rem">
        <HeadRow>
          <span>Nr.</span>
          <span>Beleg</span>
          <span>
            Einordnung <StatusInfoButton axis="document_category" />
          </span>
        </HeadRow>
        {scenarios.map((s) => (
          <Row key={s.id}>
            <span className="v2sub">{s.id}</span>
            <span>{s.title}</span>
            <ClassificationTrigger picture={s.picture} detail={s.detail} size="cell" density={density} />
          </Row>
        ))}
      </Table>
    </Card>
  );
}

/**
 * Every scenario as the cell — in the real list: `DataTable` with
 * `DOCUMENT_LIST_COLUMNS` and `sourceDocumentColumns({ classificationPicture })`,
 * one column „Einordnung" with one (i), no „Belegart" any more. Each cell opens
 * its dialog. Every row is as high as the others (two lines kept).
 */
export const AllCells: Story = {
  render: () => {
    const rows = CLASSIFICATION_SCENARIOS.map((s) =>
      documentFixture({ id: `c-${s.id}`, counterparty: s.title.split(" · ")[1] ?? s.title, fileName: `${s.title}.pdf` }),
    );
    const byRow = new Map(rows.map((d, i) => [d.id, CLASSIFICATION_SCENARIOS[i]!]));
    const cols = sourceDocumentColumns({
      columns: DOCUMENT_LIST_COLUMNS,
      classificationPicture: (d) => {
        const s = byRow.get(d.id);
        return s ? { picture: s.picture, detail: s.detail } : null;
      },
    });
    return (
      <DataTable<SourceDocumentVM>
        rows={rows}
        columns={cols}
        rowKey={(d) => d.id}
        head={{ title: "Belege 2026", sub: "20 Fälle aus F308 §7" }}
        minWidth={sourceDocumentMinWidth(cols)}
      />
    );
  },
};

/** The cells alone, as a plain list — for comparing the words side by side. */
export const CellList: Story = { render: () => <List scenarios={CLASSIFICATION_SCENARIOS} /> };

/** Dense lists: line 1 only; the rest is in the accessible name and the dialog. */
export const CellNarrow: Story = { render: () => <List scenarios={CLASSIFICATION_SCENARIOS} density="narrow" /> };

/** Every scenario as the box, at the width it has in the head. */
export const AllBoxes: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(24rem, 1fr))", gap: "var(--space-5)" }}>
      {CLASSIFICATION_SCENARIOS.map((s) => (
        <div key={s.id}>
          <div className="v2sub">
            {s.id} · {s.name}
          </div>
          <ClassificationTrigger picture={s.picture} detail={s.detail} size="box" />
        </div>
      ))}
    </div>
  ),
};

function Head({ id, processId }: { id: string; processId: string }) {
  const s = byNumber(id);
  const p = processById(processId);
  return (
    <EntityHeader
      icon={<EntityIcon entity="source-document" />}
      overline={`Beleg · ${s.title.split(" · ")[0]}`}
      title={s.title.split(" · ")[1] ?? s.title}
      meta={
        <>
          <span>Belegdatum 28.08.2026</span>
          <span>Eingang 12.09.2026</span>
        </>
      }
      metric={{ label: "Gesamtbetrag", value: "18.450,20 €" }}
      actions={
        <Button variant="secondary" size="sm">
          Beleg herunterladen
        </Button>
      }
      process={
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <ProcessPictureTrigger picture={p.picture} detail={p.detail} size="box" />
          <ClassificationTrigger picture={s.picture} detail={s.detail} size="box" />
        </div>
      }
      processPlacement="end"
    />
  );
}

/**
 * The head of the document page with both pictures at the right: where it
 * stands (0204) above, what it is (0205) below. The overline no longer carries
 * the kind, and no badge chain stands in `meta`.
 */
export const HeadWithBoth: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <Head id="1" processId="S07" />
      <Head id="8" processId="S09" />
      <Head id="15" processId="S29" />
    </div>
  ),
};

/**
 * Every scenario's dialog, one button each — sections, correction, „Technisch".
 * Unlike the list, the button names the case, so any of the 20 is one click away.
 */
export const AllDialogs: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      {CLASSIFICATION_SCENARIOS.map((s) => (
        <Open key={s.id} id={s.id} startClosed label={`${s.id} · ${s.name}`} />
      ))}
    </div>
  ),
};

function Open({
  id,
  saveFails = false,
  withoutCorrection = false,
  startClosed = false,
  label = "Dialog öffnen",
}: {
  id: string;
  saveFails?: boolean;
  withoutCorrection?: boolean;
  startClosed?: boolean;
  label?: string;
}) {
  const s = byNumber(id);
  const [open, setOpen] = useState(!startClosed);
  const detail = withoutCorrection
    ? { title: s.detail.title, sections: s.detail.sections, technical: s.detail.technical }
    : saveFails && s.detail.correction
      ? { ...s.detail, correction: { ...s.detail.correction, onSave: () => Promise.reject(new Error("offline")) } }
      : s.detail;
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ClassificationDialog open={open} onClose={() => setOpen(false)} picture={s.picture} detail={detail} />
    </>
  );
}

/** Correction open to try: „Einordnung korrigieren" → form grouped by category, direction; saving takes a moment, then the sentence. */
export const DialogCorrection: Story = { render: () => <Open id="18" /> };

/** A statement with imported transactions: the reason instead of the form. */
export const DialogBlocked: Story = { render: () => <Open id="10" /> };

/** Saving fails: „Nicht gespeichert", the choice stays. */
export const DialogSaveError: Story = { render: () => <Open id="1" saveFails /> };

/** The warning case: the banner on top, the sign before the word. */
export const DialogWarning: Story = { render: () => <Open id="20" /> };

/** Without the correction (a reader without the right to classify): no section „Korrigieren". */
export const DialogWithoutCorrection: Story = { render: () => <Open id="8" withoutCorrection /> };

/** An unknown form key (case 19): the form field starts empty and asks — nothing is preselected silently. */
export const DialogUnknownForm: Story = { render: () => <Open id="19" /> };
