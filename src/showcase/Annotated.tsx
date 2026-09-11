"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/ui/v3/primitives/Button";

/**
 * A page with its building blocks named on top — the detail-page guideline
 * (owner order 2026-09-11) in pictures. Every pin finds its element by
 * selector, so the page underneath stays exactly the story it is; the labels
 * are an overlay that can be switched off, and the legend below says which
 * rule of the standard asks for each block.
 */
export interface Pin {
  /** CSS selector inside the page; the first match unless `match` narrows it. */
  selector: string;
  /** Only an element whose text contains this — to pick one card of several. */
  match?: string;
  /** The building block: „EntityHeader", „Columns · list-detail-aside". */
  label: string;
  /** The rule of the standard that asks for it: „D6 · der Kopf". */
  rule: string;
}

interface Box {
  n: number;
  /** How many earlier boxes start at the same corner — their tags stack. */
  stack: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

export function Annotated({ pins, children }: { pins: readonly Pin[]; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  const [boxes, setBoxes] = useState<Box[]>([]);

  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    const measure = () => {
      const base = root.getBoundingClientRect();
      const next: Box[] = [];
      pins.forEach((pin, i) => {
        const element = [...root.querySelectorAll<HTMLElement>(pin.selector)].find(
          (e) => !e.closest(".v3annot__layer") && (!pin.match || (e.textContent ?? "").includes(pin.match)),
        );
        if (!element) return;
        const r = element.getBoundingClientRect();
        const top = r.top - base.top;
        const left = r.left - base.left;
        // Two blocks that begin at the same corner (a column pattern and its
        // first column) would print one tag over the other.
        const stack = next.filter((b) => Math.abs(b.top - top) < 6 && Math.abs(b.left - left) < 6).length;
        next.push({ n: i + 1, stack, top, left, width: r.width, height: r.height });
      });
      setBoxes(next);
    };
    measure();
    // ponytail: the page settles after fonts and late effects; one late
    // measurement plus the observer covers the stories, no polling.
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    const late = window.setTimeout(measure, 400);
    return () => {
      observer.disconnect();
      window.clearTimeout(late);
    };
  }, [pins]);

  const found = new Set(boxes.map((b) => b.n));
  return (
    <div className="v3annot">
      <div className="v3annot__bar">
        <Button variant="secondary" size="sm" onClick={() => setShown((s) => !s)}>
          {shown ? "Beschriftung ausblenden" : "Beschriftung einblenden"}
        </Button>
        <span className="v2sub">
          Jede Nummer ist ein Baustein; die Legende nennt die Regel des Detailseiten-Standards, die ihn verlangt.
        </span>
      </div>
      <div ref={stage} className="v3annot__stage">
        {children}
        {shown ? (
          <div className="v3annot__layer" aria-hidden="true">
            {boxes.map((b) => (
              <div
                key={b.n}
                className="v3annot__box"
                style={{ top: b.top, left: b.left, width: b.width, height: b.height }}
              >
                <span className="v3annot__tag" style={b.stack ? { top: `calc(${b.stack} * 1.4rem - 2px)` } : undefined}>
                  {b.n} · {pins[b.n - 1]!.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <ol className="v3annot__legend" aria-label="Legende">
        {pins.map((p, i) => (
          <li key={p.label + i} className={found.has(i + 1) ? undefined : "is-missing"}>
            <span className="v3annot__n">{i + 1}</span>
            <strong>{p.label}</strong>
            <span className="v2sub">
              {p.rule}
              {found.has(i + 1) ? "" : " · in dieser Szene nicht zu sehen"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
