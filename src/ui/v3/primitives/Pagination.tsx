import { Link } from "./Link";
import { PageSizeSelect } from "./Nav";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  buildHref: (page: number) => string;
  /** The sizes the page offers — „25 · 50 · 100". Without it no size chooser. */
  pageSizeOptions?: number[];
  /** The URL for one size. The caller resets `page` in it, the way a sort does. */
  buildSizeHref?: (size: number) => string;
}

/**
 * Page list with ellipsis plus „from–to of n" — links, not buttons, so a page
 * stays shareable and the back button works.
 *
 * The size chooser sits behind the numbers and is the one client island of
 * this component (`PageSizeSelect`) — a `<select>` has to jump on change.
 * Everything that crosses that border is a string.
 *
 * @when    A list longer than one page, paged over the URL; with
 *          `pageSizeOptions` also „50 je Seite" behind the numbers.
 * @instead Everything on one page, narrowed down → FilterBar. Loading while
 *          scrolling does not exist here — a page number is addressable.
 */
export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  buildHref,
  pageSizeOptions,
  buildSizeHref,
}: Props) {
  if (totalItems === 0) return null;

  const fromIdx = (page - 1) * pageSize + 1;
  const toIdx = Math.min(totalItems, page * pageSize);

  // Page list with ellipsis: 1 … current-1, current, current+1 … last
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="pag" aria-label="Pagination">
      <span className="info">
        {fromIdx}–{toIdx} von {totalItems}
      </span>
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="page" aria-label="Vorherige Seite">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>
      ) : (
        <span className="page" aria-disabled>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </span>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="ellipsis">
            …
          </span>
        ) : p === page ? (
          <span key={p} className="page active" aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={buildHref(p)} className="page">
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="page" aria-label="Nächste Seite">
          <ChevronRight size={16} strokeWidth={1.5} />
        </Link>
      ) : (
        <span className="page" aria-disabled>
          <ChevronRight size={16} strokeWidth={1.5} />
        </span>
      )}
      {pageSizeOptions && buildSizeHref ? (
        <PageSizeSelect
          value={pageSize}
          options={pageSizeOptions.map((size) => ({ size, href: buildSizeHref(size) }))}
        />
      ) : null}
    </nav>
  );
}
