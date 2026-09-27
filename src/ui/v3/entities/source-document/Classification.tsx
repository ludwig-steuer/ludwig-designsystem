"use client";

import { useId, useState, type ReactNode } from "react";
import { ActionIcon, CATEGORY_ICON, CategoryIcon, type DocCategoryKey } from "../../Icons";
import { StateIcon } from "../../patterns/Review";
import { Banner } from "../../primitives/Banner";
import { Button } from "../../primitives/Button";
import { Dialog } from "../../primitives/Dialog";
import { Disclosure } from "../../primitives/Disclosure";
import { Field, Select } from "../../primitives/Form";
import { Link } from "../../primitives/Link";
import { TextButton } from "../../primitives/TextButton";

/**
 * The classification of a document in three sizes (0205, F308): what it is,
 * how it takes effect, what it belongs to. One view model for cell, box and
 * dialog, the way the process picture works (0204). The app derives every word
 * — the form's label (an unknown key as its raw word), the effect from
 * direction × character, the role in a bundle, the warning. Nothing here
 * calculates.
 */

export type BundleRole = "part" | "cover" | "bundle" | "superseded" | "attachment";

export interface ClassificationPicture {
  identity: {
    category: DocCategoryKey;
    /** The document form in words („Tankquittung"); an unknown key as the raw word. */
    word: string;
    /** Ludwig could not classify it, or the values contradict each other. */
    warning?: string;
  };
  /** Direction × character in one word („Eingangsrechnung"). Missing = not applicable. */
  effect?: { word: string };
  /** Missing = the document stands alone (the usual case). */
  bundle?: { role: BundleRole; word: string; href?: string };
  /** A person decided — a quiet pencil after the word. */
  corrected?: { at: string; by: string | null };
}

export interface ClassificationSection {
  key: "identity" | "effect" | "bundle";
  /** Why Ludwig decided so — the registry's sentence for the axis value. */
  why: string;
  /** The classifier's own sentence (`class_summary`), quoted. */
  quote?: string;
  /** What else it could have been — the sibling values, quiet. */
  alternatives: readonly { value: string; label: string }[];
}

export interface ClassificationCorrection {
  forms: readonly { value: string; label: string; category: DocCategoryKey }[];
  directions: readonly { value: string; label: string }[];
  current: { form: string | null; direction: string | null };
  /** Why it cannot be corrected here (a statement with imported transactions). */
  blockedReason?: string;
  onSave: (next: { form: string | null; direction: string | null }) => Promise<void>;
}

export interface ClassificationDialogDetail {
  title: string;
  sections: readonly ClassificationSection[];
  correction?: ClassificationCorrection;
  /** Raw values — only under „Technisch" (T4). */
  technical: readonly { label: string; value: string }[];
}

const SECTION_TITLE: Record<ClassificationSection["key"], string> = {
  identity: "Was ist es",
  effect: "Wie wirkt es",
  bundle: "Wozu gehört es",
};

function Pencil({ corrected }: { corrected: ClassificationPicture["corrected"] }) {
  if (!corrected) return null;
  const who = corrected.by ? `von ${corrected.by} ` : "";
  return (
    <span className="cl-pencil" title={`Korrigiert ${who}am ${corrected.at}`}>
      <ActionIcon action="edit" size={12} />
      <span className="v2vh">korrigiert</span>
    </span>
  );
}

function Warn({ warning }: { warning?: string }) {
  return warning ? (
    <span className="cl-warn">
      <span aria-hidden="true">
        <StateIcon state="warning" />
      </span>
      <span className="v2vh">Warnung:</span>
    </span>
  ) : null;
}

/** The second line of the cell: effect and bundle, joined — so the row keeps two lines. */
function secondLine(p: ClassificationPicture): string {
  return [p.effect?.word, p.bundle?.word].filter(Boolean).join(" · ");
}

function accessibleName(p: ClassificationPicture): string {
  return [
    p.identity.warning ? "Warnung:" : null,
    p.identity.word,
    p.corrected ? "(korrigiert)" : null,
    secondLine(p) ? `· ${secondLine(p)}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function Target({
  onOpen,
  label,
  className,
  children,
}: {
  onOpen?: () => void;
  label: string;
  className: string;
  children: ReactNode;
}) {
  return onOpen ? (
    <button type="button" className={`${className} is-interactive`} onClick={onOpen} aria-label={label} title={label}>
      {children}
    </button>
  ) : (
    <span className={className} title={label}>
      {children}
    </span>
  );
}

/**
 * The classification in a table cell: the category's sign, the document form
 * in line 1, effect and bundle in line 2 (variant A, owner 2026-09-27). At most
 * two lines; `narrow` keeps one. The whole cell is one target.
 *
 * @when    What a document is, in a list row, with the way to the explanation.
 * @instead The head of the document page → ClassificationBox. Where the
 *          document stands in its process → ProcessCell.
 */
export function ClassificationCell({
  picture,
  density = "regular",
  onOpen,
}: {
  picture: ClassificationPicture;
  density?: "regular" | "narrow";
  onOpen?: () => void;
}) {
  const second = density === "regular" ? secondLine(picture) : "";
  return (
    <Target onOpen={onOpen} label={accessibleName(picture)} className="cl-cell">
      <span className="cl-cell__sign" title={CATEGORY_ICON[picture.identity.category].label}>
        <CategoryIcon category={picture.identity.category} />
      </span>
      <span className="cl-cell__word">
        <Warn warning={picture.identity.warning} />
        <span className="cl-cell__text">{picture.identity.word}</span>
        <Pencil corrected={picture.corrected} />
      </span>
      {second ? <span className="cl-cell__second">{second}</span> : null}
    </Target>
  );
}

/**
 * The classification in the head of the document page: labelled lines —
 * „Beleg", „Wirkung", „Verbund" — without a frame, like the process box above
 * it. A line that does not apply is missing, never a dash.
 *
 * @when    What the document is, in its detail head under the process box.
 * @instead A list row → ClassificationCell.
 */
export function ClassificationBox({ picture, onOpen }: { picture: ClassificationPicture; onOpen?: () => void }) {
  return (
    <Target onOpen={onOpen} label={`Einordnung: ${accessibleName(picture)}`} className="cl-box">
      <span className="cl-box__label">Beleg</span>
      <span className="cl-box__value">
        <CategoryIcon category={picture.identity.category} size={14} />
        <Warn warning={picture.identity.warning} />
        <span className="cl-cell__text">{picture.identity.word}</span>
        <Pencil corrected={picture.corrected} />
      </span>
      {picture.effect ? (
        <>
          <span className="cl-box__label">Wirkung</span>
          <span className="cl-box__value">{picture.effect.word}</span>
        </>
      ) : null}
      {picture.bundle ? (
        <>
          <span className="cl-box__label">Verbund</span>
          <span className="cl-box__value">{picture.bundle.word}</span>
        </>
      ) : null}
    </Target>
  );
}

function Correction({ c }: { c: ClassificationCorrection }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(c.current.form ?? "");
  const [direction, setDirection] = useState(c.current.direction ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (c.blockedReason) {
    return (
      <p className="v2sub">
        <strong>Korrektur hier nicht möglich.</strong> {c.blockedReason}
      </p>
    );
  }
  if (!open) {
    return (
      <TextButton icon={<ActionIcon action="edit" />} onClick={() => setOpen(true)}>
        Einordnung korrigieren
      </TextButton>
    );
  }
  const categories = [...new Set(c.forms.map((f) => f.category))];
  const save = async () => {
    setState("saving");
    try {
      await c.onSave({ form: form || null, direction: direction || null });
      setState("saved");
    } catch {
      setState("error");
    }
  };
  return (
    <div className="cl-fix">
      {state === "error" ? (
        <Banner tone="danger" title="Nicht gespeichert">
          Die Einordnung ließ sich gerade nicht speichern. Ihre Auswahl ist erhalten — bitte noch einmal versuchen.
        </Banner>
      ) : null}
      <div className="cl-fix__fields">
        <Field label="Belegform" htmlFor={`${id}-form`}>
          <Select id={`${id}-form`} value={form} onChange={(e) => setForm(e.target.value)} disabled={state === "saving" || state === "saved"}>
            {categories.map((cat) => (
              <optgroup key={cat} label={CATEGORY_ICON[cat].label}>
                {c.forms
                  .filter((f) => f.category === cat)
                  .map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
        </Field>
        <Field label="Richtung" htmlFor={`${id}-dir`}>
          <Select id={`${id}-dir`} value={direction} onChange={(e) => setDirection(e.target.value)} disabled={state === "saving" || state === "saved"}>
            <option value="">nicht anwendbar</option>
            {c.directions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="cl-fix__actions">
        <Button variant="primary" size="sm" onClick={save} disabled={state === "saving" || state === "saved"}>
          {state === "saving" ? "Wird gespeichert …" : "Einordnung speichern"}
        </Button>
        {state === "idle" || state === "error" ? (
          <TextButton onClick={() => setOpen(false)}>Abbrechen</TextButton>
        ) : null}
      </div>
      <p role="status" className="v2sub">
        {state === "saved" ? "Gespeichert. Ludwig liest den Beleg mit der neuen Einordnung noch einmal." : ""}
      </p>
    </div>
  );
}

/**
 * The explanation of a document's classification: per question the word, why
 * Ludwig decided so, the classifier's sentence, what else it could have been;
 * the correction of form and direction; the raw values folded under
 * „Technisch".
 *
 * @when    Opened from ClassificationCell or ClassificationBox.
 * @instead All values of one axis → StatusInfoDialog.
 */
export function ClassificationDialog({
  open,
  onClose,
  picture,
  detail,
}: {
  open: boolean;
  onClose: () => void;
  picture: ClassificationPicture;
  detail: ClassificationDialogDetail;
}) {
  const word: Record<ClassificationSection["key"], ReactNode> = {
    identity: (
      <span className="cl-dlg__word">
        <CategoryIcon category={picture.identity.category} />
        {picture.identity.word}
        <Pencil corrected={picture.corrected} />
        <span className="v2sub">{CATEGORY_ICON[picture.identity.category].label}</span>
      </span>
    ),
    effect: <span className="cl-dlg__word">{picture.effect?.word}</span>,
    bundle: (
      <span className="cl-dlg__word">
        {picture.bundle?.href ? <Link href={picture.bundle.href}>{picture.bundle.word}</Link> : picture.bundle?.word}
      </span>
    ),
  };
  return (
    <Dialog open={open} onClose={onClose} title={detail.title} kicker="Einordnung" size="lg">
      <div className="cl-dlg">
        {picture.identity.warning ? (
          <Banner tone="warning" title="Ludwig ist sich nicht sicher">
            {picture.identity.warning}
          </Banner>
        ) : null}
        {detail.sections.map((s) => (
          <section key={s.key} className="cl-dlg__section">
            <h3 className="cl-dlg__head">{SECTION_TITLE[s.key]}</h3>
            {word[s.key]}
            <p className="cl-dlg__why">{s.why}</p>
            {s.quote ? <blockquote className="cl-dlg__quote">{s.quote}</blockquote> : null}
            {s.alternatives.length ? (
              <p className="cl-dlg__alt">Sonst möglich: {s.alternatives.map((a) => a.label).join(" · ")}</p>
            ) : null}
          </section>
        ))}
        {detail.correction ? (
          <section className="cl-dlg__section">
            <h3 className="cl-dlg__head">Korrigieren</h3>
            <Correction c={detail.correction} />
          </section>
        ) : null}
        <Disclosure summary="Technisch">
          <dl className="pz-dlg__tech">
            {detail.technical.map((t) => (
              <div key={t.label}>
                <dt>{t.label}</dt>
                <dd>{t.value}</dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      </div>
    </Dialog>
  );
}

/**
 * A cell or box together with its dialog.
 *
 * @when    A list or a head shows the classification and opens the explanation.
 * @instead The dialog opened from elsewhere → ClassificationDialog.
 */
export function ClassificationTrigger({
  picture,
  detail,
  size,
  density,
}: {
  picture: ClassificationPicture;
  detail: ClassificationDialogDetail;
  size: "cell" | "box";
  density?: "regular" | "narrow";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {size === "cell" ? (
        <ClassificationCell picture={picture} density={density} onOpen={() => setOpen(true)} />
      ) : (
        <ClassificationBox picture={picture} onOpen={() => setOpen(true)} />
      )}
      <ClassificationDialog open={open} onClose={() => setOpen(false)} picture={picture} detail={detail} />
    </>
  );
}
