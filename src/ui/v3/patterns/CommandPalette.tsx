"use client";

import { Command } from "cmdk";
import { useRef } from "react";
import type { ReactNode } from "react";

import { Dialog } from "../primitives/Dialog";
import { Kbd } from "../primitives/Kbd";
import { Link } from "../primitives/Link";
import { useHotkeys } from "./Hotkeys";

/**
 * Command or page, in one field (0039).
 *
 * An **additional path**: every page stays in the navigation, every action on
 * its own button (V14). What this adds is the short way for the session in
 * which somebody works fast.
 *
 * `cmdk` is the one new dependency of the shadcn comparison (0034): matching,
 * sorting, ARIA and the arrow keys are ~300 lines nobody should write twice.
 * Its transitive `@radix-ui/react-dialog` stays unused — the shell is our
 * `Dialog`.
 */

export interface CommandItem {
  id: string;
  /** What it is called — the line the user reads and searches. */
  label: string;
  /** Where it leads or what it does, in half a sentence. */
  hint?: string;
  icon?: ReactNode;
  /** The key as printed on the button; stands on the right as a `Kbd`. */
  key?: string;
  /** A jump: renders a link, so middle-click and „open in new tab" work. */
  href?: string;
  /** An action. Ignored when `href` is set. */
  onSelect?: () => void;
  /** Invisible search words — „Kreditor" finds „Geschäftspartner". */
  keywords?: string[];
}

export interface CommandGroup {
  title: string;
  items: CommandItem[];
}

/**
 * @when    Every screen of an app frame: all pages and actions in one field,
 *          opened with ⌘K, next to the search of the top bar.
 * @instead One value for one form field → Combobox. The actions of a single
 *          object → OverflowMenu. The standing navigation → NavList.
 */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Befehl oder Seite …",
  emptyText = "Kein Treffer — kürzer suchen.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  emptyText?: string;
}) {
  // ⌘K works from inside a field too — a meta combination is no typing
  // (`useHotkeys`, changed for this pattern).
  useHotkeys([
    { key: "k", meta: true, label: "Befehl oder Seite suchen", handler: () => onOpenChange(!open) },
  ]);

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      title="Befehl oder Seite"
      kicker="Zusatzweg"
      size="md"
    >
      <Command className="v2cmd" label="Befehl oder Seite">
        <Command.Input className="v2in v2cmd__in" placeholder={placeholder} autoFocus />
        <Command.List className="v2cmd__list">
          <Command.Empty className="v2cmd__empty">{emptyText}</Command.Empty>
          {groups.map((group) => (
            <Command.Group key={group.title} heading={group.title} className="v2cmd__grp">
              {group.items.map((item) => (
                <Entry key={item.id} item={item} onDone={() => onOpenChange(false)} />
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </Dialog>
  );
}

/**
 * One line of the list. A jump is a real `<a>`; Enter clicks it instead of
 * pushing a route — the design system knows no router, and a link that the
 * browser follows also works with the middle mouse button.
 */
function Entry({ item, onDone }: { item: CommandItem; onDone: () => void }) {
  const link = useRef<HTMLAnchorElement>(null);
  const body = (
    <>
      {item.icon}
      <span className="v2cmd__label">
        {item.label}
        {item.hint ? <span className="v2cmd__hint">{item.hint}</span> : null}
      </span>
      {item.key ? <Kbd>{item.key}</Kbd> : null}
    </>
  );
  return (
    <Command.Item
      className="v2cmd__item"
      value={item.label}
      keywords={item.keywords}
      onSelect={() => {
        if (item.href) link.current?.click();
        else item.onSelect?.();
        onDone();
      }}
    >
      {item.href ? (
        <Link className="v2cmd__jump" href={item.href} ref={link}>
          {body}
        </Link>
      ) : (
        body
      )}
    </Command.Item>
  );
}
