import type { ReactNode } from "react";

import { Card, CardHead } from "../primitives/Table";
import { TextButton } from "../primitives/TextButton";
import { StateIcon, type StateKind } from "./Review";

/**
 * What is open on **one** record, each line with a way out (0153).
 *
 * Built for the document overview (0150), needed a second time by the case
 * overview (0152) — and that second use is what makes it a pattern. Until
 * then it lived in the document family, where it was one screen and therefore
 * one entity's business (`spec-schreiben` §3: a pattern from two screens on).
 *
 * **It knows no entity.** The lines arrive ready-made: title, sentence, way
 * out. Which defects exist and what they are called is the domain's business —
 * `docDefects()` for a document, the case's own derivation for a case. This
 * one decides what a defect **looks** like and what „nothing open" means.
 *
 * Three neighbours, and the difference is worth naming:
 *
 * | | shows | when it is empty |
 * |---|---|---|
 * | `OpenPoints` | only what is **wrong** on this one record | „nothing open" — the good case, said in one line |
 * | `Checklist` | **every** check with its verdict, green ones included | it is never empty; a gate that checked nothing is a gate that did not run |
 * | `TodoList` | a **supply of work** across many records, to be worked through | „nothing to do", a working state |
 *
 */

export interface OpenPoint {
  /** Stable key — usually the kind of defect. */
  key: string;
  /** What is wrong, as a sentence with a full stop. */
  title: string;
  /** What follows from it — one sentence, never an imperative without a way. */
  hint?: string;
  /**
   * The way out. Without one the point is **named but not actionable**, and
   * that is still better than hiding it — a defect nobody sees is worse than
   * one nobody can fix yet.
   */
  action?: ReactNode;
  /**
   * How bad it is. Sorted by the caller (A7: criticality descending) — this
   * component does not reorder, it only draws.
   */
  state?: StateKind;
  /** Raw text of the source where it says more than the sentence — set as such. */
  raw?: string | null;
}

/**
 * @when    What is open on one record — defects, questions, missing values — each with a way out.
 * @instead Every check with its verdict, passed ones included → Checklist. A
 *          supply of work across records → TodoList. One missing value at the
 *          field it belongs to → the entity's own facts with `missing`. An
 *          error that blocks saving → Messages.
 */
export function OpenPoints({
  title = "Offen",
  points,
  extra,
  extraCount = 0,
  moreHref,
  emptyText = "An diesem Vorgang ist nichts offen.",
}: {
  /** The heading. „Offen" on a case, „Befunde und Klärungen" on a document. */
  title?: string;
  points: readonly OpenPoint[];
  /**
   * What the caller adds below the points, drawn by its own family — the
   * clarifications of a case, the questions of a document.
   *
   * They stand in the **same** box on purpose: for the person reading, „a
   * question is open" and „a value is missing" are one and the same
   * interruption, and two boxes would make them look like two topics.
   */
  extra?: ReactNode;
  /** How many `extra` items there are — the head counts them in. */
  extraCount?: number;
  /** Where all of them stand, when there are more than the box shows. */
  moreHref?: string;
  /** „Nothing open" is a **result**, not an empty box (L6). */
  emptyText?: string;
}) {
  const count = points.length + extraCount;
  return (
    <Card>
      <CardHead
        title={title}
        sub={count === 0 ? "nichts offen" : `${count} offen`}
        {...(moreHref ? { actions: <TextButton href={moreHref}>Alle ansehen</TextButton> } : {})}
      />
      <div className="v3boxbody">
        {points.length === 0 && !extra ? (
          <p className="v3open__none">
            <StateIcon state="done" title="erledigt" /> {emptyText}
          </p>
        ) : null}
        {points.map((point) => (
          <div className="v3open__row" key={point.key}>
            <StateIcon state={point.state ?? "warning"} title="offen" />
            <div className="v3open__body">
              <span className="v2main">{point.title}</span>
              {point.hint ? <span className="v2sub">{point.hint}</span> : null}
              {/* The source's own words, where they say more than the sentence:
                  visibly raw. Dressing them up as German would claim a
                  translation nobody made. */}
              {point.raw ? <span className="v3open__raw">{point.raw}</span> : null}
            </div>
            {point.action ? <div className="v3open__way">{point.action}</div> : null}
          </div>
        ))}
        {extra}
      </div>
    </Card>
  );
}
