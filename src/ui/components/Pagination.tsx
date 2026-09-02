import { Link } from "../v3/primitives/Link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, totalItems, pageSize, buildHref }: Props) {
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
    </nav>
  );
}
