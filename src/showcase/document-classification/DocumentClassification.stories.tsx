import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CategoryIcon, EntityIcon } from "@/ui/v3/Icons";
import {
  ClassificationDialog,
  ClassificationTrigger,
  type ClassificationPicture,
} from "@/ui/v3/entities/source-document/Classification";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { ProcessPictureTrigger } from "@/ui/v3/patterns/ProcessPicture";
import { StatusInfoButton } from "@/ui/v3/patterns/StatusInfoButton";
import { Button } from "@/ui/v3/primitives/Button";
import { Card, CardHead, HeadRow, Row, Table } from "@/ui/v3/primitives/Table";
import { byId as processById } from "../document-process/fixtures";
import { byNumber, CLASSIFICATION_SCENARIOS, type ClassificationScenario } from "./fixtures";

/**
 * The classification of a document in three sizes (0205, brief F308): all 20
 * scenarios of §7 as cell, box and dialog, and the three cell variants the
 * owner asked to try (F308 §8, decision 1), plus a fourth; the set chose D.
 */
const meta: Meta = { title: "Seiten/Beleg-Einordnung", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

/* ── The three variants, side by side ── composed in the story on purpose:
   only A became a building block; B and C are here to be compared. */

function VariantB({ p }: { p: ClassificationPicture }) {
  return (
    <span className="cl-cell">
      <span className="cl-cell__sign">
        <CategoryIcon category={p.identity.category} />
      </span>
      <span className="cl-cell__text">{[p.identity.word, p.effect?.word].filter(Boolean).join(" · ")}</span>
      {p.bundle ? <span className="cl-cell__second">{p.bundle.word}</span> : null}
    </span>
  );
}

function VariantA({ p }: { p: ClassificationPicture }) {
  const second = [p.effect?.word, p.bundle?.word].filter(Boolean).join(" · ");
  return (
    <span className="cl-cell">
      <span className="cl-cell__sign">
        <CategoryIcon category={p.identity.category} />
      </span>
      <span className="cl-cell__text">{p.identity.word}</span>
      {second ? <span className="cl-cell__second">{second}</span> : null}
    </span>
  );
}

function VariantC({ p }: { p: ClassificationPicture }) {
  const first = p.effect?.word ?? p.identity.word;
  const second = [p.effect ? p.identity.word : null, p.bundle?.word].filter(Boolean).join(" · ");
  return (
    <span className="cl-cell">
      <span className="cl-cell__sign">
        <CategoryIcon category={p.identity.category} />
      </span>
      <span className="cl-cell__text">{first}</span>
      {second ? <span className="cl-cell__second">{second}</span> : null}
    </span>
  );
}

/**
 * A: form first, effect and bundle below — „Rechnung" eight times in a row,
 *    the difference that matters (in or out) grey underneath.
 * B: form and effect in one line — „Rechnung · Eingangsrechnung" says it twice.
 * C: effect first — also demotes „Tankquittung", which matters for tax.
 * D (chosen, the building block): the most telling word first — the effect
 *    where the form is only the plain „Rechnung", otherwise the form.
 * All 20 fixtures of F308 §7 with their staging frequency.
 */
export const CellVariants: Story = {
  render: () => (
    <Card>
      <CardHead title="Vier Varianten für die Zelle" sub="20 Fälle aus F308 §7 · n = Häufigkeit auf Staging" />
      <Table cols="2.5rem 3.5rem minmax(10rem, 1fr) 13rem 13rem 13rem 13rem">
        <HeadRow>
          <span>Nr.</span>
          <span>n</span>
          <span>Fall</span>
          <span>D · gewählt</span>
          <span>A</span>
          <span>B</span>
          <span>C</span>
        </HeadRow>
        {CLASSIFICATION_SCENARIOS.map((s) => (
          <Row key={s.id}>
            <span className="v2sub">{s.id}</span>
            <span className="v2sub">{s.n}</span>
            <span>{s.name}</span>
            <ClassificationTrigger picture={s.picture} detail={s.detail} size="cell" />
            <VariantA p={s.picture} />
            <VariantB p={s.picture} />
            <VariantC p={s.picture} />
          </Row>
        ))}
      </Table>
    </Card>
  ),
};

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

/** Every scenario as the cell in a list with one column „Einordnung" and one (i). Each cell opens its dialog. */
export const AllCells: Story = { render: () => <List scenarios={CLASSIFICATION_SCENARIOS} /> };

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

/** Every scenario: a cell each, which opens its dialog with sections, correction and „Technisch". */
export const AllDialogs: Story = { render: () => <List scenarios={CLASSIFICATION_SCENARIOS} /> };

function Open({ id, saveFails = false }: { id: string; saveFails?: boolean }) {
  const s = byNumber(id);
  const [open, setOpen] = useState(true);
  const detail = saveFails && s.detail.correction
    ? { ...s.detail, correction: { ...s.detail.correction, onSave: () => Promise.reject(new Error("offline")) } }
    : s.detail;
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Dialog öffnen
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
