"use client";

import { Command, useCommandState } from "cmdk";
import { useRef, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";

import { formatCount } from "../format";
import { Dialog } from "../primitives/Dialog";
import { Kbd } from "../primitives/Kbd";
import { Link } from "../primitives/Link";
import { TextButton } from "../primitives/TextButton";
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
  /** Invisible search words — „Kreditor" finds „Geschäftspartner". Builtin filter only. */
  keywords?: string[];
  /**
   * The second way (0216): Shift+Enter, Shift+click, or a click on the hint the
   * selected line shows on the right. Closes the palette.
   */
  secondary?: { label: string; onSelect: () => void };
  /** `onSelect` runs and the palette stays open — to put a prefix into the field. Ignored with `href`. */
  keepOpen?: boolean;
}

export interface CommandGroup {
  title: string;
  items: CommandItem[];
}

/** The modifiers of the event that selected — cmdk passes none to `onSelect`. */
type Mods = { shift: boolean; newTab: boolean; onLink: boolean };

/**
 * @when    Every screen of an app frame: all pages and actions in one field,
 *          opened with ⌘K, next to the search of the top bar — the hits from
 *          the palette itself or, with `filter="none"`, from the server.
 * @instead One value for one form field → Combobox. The actions of a single
 *          object → OverflowMenu. The standing navigation → NavList.
 */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Befehl oder Seite …",
  emptyText = "Kein Treffer — kürzer suchen.",
  query,
  onQueryChange,
  filter = "builtin",
  loading = false,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  emptyText?: string;
  /** Controlled input (0216); without it the palette keeps the query itself. */
  query?: string;
  onQueryChange?: (query: string) => void;
  /**
   * `none`: no matching of its own — groups and items stand as delivered, and
   * an item is known by `id`, not `label` (two hits may share a name).
   */
  filter?: "builtin" | "none";
  /** A line „Suche läuft …" below the hits that stand; the empty text keeps quiet. */
  loading?: boolean;
  /** A line over the list, like DataTable's; the empty text keeps quiet. */
  error?: { message: string; retry?: ReactNode };
}) {
  const mods = useRef<Mods>({ shift: false, newTab: false, onLink: false });
  // cmdk selects the first line when the query changes — but server hits
  // arrive after that, and the stale line it chose is gone. An empty value
  // makes cmdk select the first of the new lines itself.
  const [picked, setPicked] = useState("");
  const ids = filter === "none" ? groups.flatMap((g) => g.items.map((i) => i.id)) : [];
  const selection =
    filter === "none" ? { value: ids.includes(picked) ? picked : "", onValueChange: setPicked } : {};
  const note = (e: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }, onLink: boolean) => {
    mods.current = { shift: e.shiftKey, newTab: e.metaKey || e.ctrlKey, onLink };
  };

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
      <Command
        className="v2cmd"
        label="Befehl oder Seite"
        shouldFilter={filter === "builtin"}
        {...selection}
        // Capture runs before cmdk's own handlers dispatch the selection.
        onKeyDownCapture={(e) => {
          if (e.key === "Enter") note(e, false);
        }}
        onClickCapture={(e) => note(e, (e.target as Element).closest("a") !== null)}
      >
        <Command.Input
          className="v2in v2cmd__in"
          placeholder={placeholder}
          autoFocus
          {...(query !== undefined ? { value: query } : {})}
          onValueChange={onQueryChange}
        />
        <Command.List className="v2cmd__list">
          {error ? (
            <div className="v2tbl__error" role="alert">
              <span>{error.message}</span>
              {error.retry}
            </div>
          ) : null}
          {loading || error ? null : <Command.Empty className="v2cmd__empty">{emptyText}</Command.Empty>}
          {groups.map((group) => (
            <Command.Group key={group.title} heading={group.title} className="v2cmd__grp">
              {group.items.map((item) => (
                <Entry
                  key={item.id}
                  item={item}
                  value={filter === "none" ? item.id : item.label}
                  mods={mods}
                  onDone={() => onOpenChange(false)}
                />
              ))}
            </Command.Group>
          ))}
          {loading ? (
            <Command.Loading className="v2cmd__empty" label="Suche läuft">
              Suche läuft …
            </Command.Loading>
          ) : null}
        </Command.List>
        <Announce loading={loading} quiet={Boolean(error)} />
      </Command>
    </Dialog>
  );
}

/** The hit count for screen readers — a status change nobody sees otherwise. */
function Announce({ loading, quiet }: { loading: boolean; quiet: boolean }) {
  const count = useCommandState((state) => state.filtered.count);
  return (
    <span className="v2vh" aria-live="polite">
      {quiet ? "" : loading ? "Suche läuft …" : formatCount(count, ["Treffer", "Treffer"])}
    </span>
  );
}

/**
 * One line of the list. A jump is a real `<a>`; Enter clicks it instead of
 * pushing a route — the design system knows no router, and a link that the
 * browser follows also works with the middle mouse button.
 */
function Entry({
  item,
  value,
  mods,
  onDone,
}: {
  item: CommandItem;
  value: string;
  mods: MutableRefObject<Mods>;
  onDone: () => void;
}) {
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
  const select = () => {
    const { shift, newTab, onLink } = mods.current;
    mods.current = { shift: false, newTab: false, onLink: false };
    if (shift && item.secondary) {
      item.secondary.onSelect();
      onDone();
    } else if (item.href) {
      // A click on the link itself is the browser's: it navigates, or opens
      // the tab on ⌘/Ctrl — clicking again would do it twice.
      if (newTab) {
        if (!onLink) window.open(item.href, "_blank", "noopener");
        return; // stays open: several hits can go to tabs one after another
      }
      if (!onLink) link.current?.click();
      onDone();
    } else {
      item.onSelect?.();
      if (!item.keepOpen) onDone();
    }
  };
  return (
    <Command.Item className="v2cmd__item" value={value} keywords={item.keywords} onSelect={select}>
      {item.href ? (
        <Link
          className="v2cmd__jump"
          href={item.href}
          ref={link}
          // Shift+click would open a browser window; here it is the second way.
          onClick={(e) => {
            if (e.shiftKey && item.secondary) e.preventDefault();
          }}
        >
          {body}
        </Link>
      ) : (
        body
      )}
      {item.secondary ? (
        // A button beside the link, not in it — a button inside an anchor is
        // not valid markup. Out of the tab order: the focus stays in the field.
        <TextButton
          tone="quiet"
          className="v2cmd__alt"
          tabIndex={-1}
          icon={<Kbd>Shift ↵</Kbd>}
          onClick={(e) => {
            e.stopPropagation();
            item.secondary?.onSelect();
            onDone();
          }}
        >
          {item.secondary.label}
        </TextButton>
      ) : null}
    </Command.Item>
  );
}
