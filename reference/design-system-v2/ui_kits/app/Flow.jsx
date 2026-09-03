// Ludwig — Wizard, Drawer, Pagination, Skeleton

function Wizard({ steps, current, children, onPrev, onNext, prevLabel = "Zurück", nextLabel = "Weiter" }) {
  return (
    <div className="wz">
      <div className="wz__steps" style={{ gridTemplateColumns: "repeat(" + steps.length + ",1fr)" }}>
        {steps.map((s, i) => {
          const cls = i < current ? "done" : i === current ? "active" : "";
          return (
            <div key={i} className={"wz__step " + cls}>
              <span className="wz__num">{i < current
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4 4 10-10"/></svg>
                : i + 1}</span>
              <div className="wz__lbl">
                <span className="small">Schritt {i + 1}</span>
                <span className="name">{s}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="wz__body">{children}</div>
      <div className="wz__foot">
        <span className="wz__progress">Schritt {current + 1} von {steps.length}</span>
        <Button kind="ghost" onClick={onPrev} disabled={current === 0}>{prevLabel}</Button>
        <Button kind="primary" onClick={onNext}>{current === steps.length - 1 ? "Abschließen" : nextLabel}</Button>
      </div>
    </div>
  );
}

function Drawer({ title, sub, onClose, footer, children, width = 460 }) {
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <div className="drawer" style={{ width }}>
        <div className="dr__h">
          <div className="title">
            {sub && <div className="small">{sub}</div>}
            <h2>{title}</h2>
          </div>
          <button className="dr__close" onClick={onClose} aria-label="Schließen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div className="dr__body">{children}</div>
        {footer && <div className="dr__foot">{footer}</div>}
      </div>
    </>
  );
}

function Pagination({ page, pageCount, total, pageSize, onPage }) {
  // Build compact page list: 1 … current-1 current current+1 … last
  const pages = [];
  const add = (p) => pages.push(p);
  if (pageCount <= 7) {
    for (let p = 1; p <= pageCount; p++) add(p);
  } else {
    add(1);
    if (page > 3) add("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p++) add(p);
    if (page < pageCount - 2) add("…");
    add(pageCount);
  }
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pag">
      <span className="info">{from.toLocaleString("de-DE")}–{to.toLocaleString("de-DE")} von {total.toLocaleString("de-DE")}</span>
      <button className="page" onClick={() => onPage && onPage(page - 1)} disabled={page === 1}>‹</button>
      {pages.map((p, i) => p === "…"
        ? <span key={"e" + i} className="ellipsis">…</span>
        : <button key={p} className={"page" + (p === page ? " active" : "")} onClick={() => onPage && onPage(p)}>{p}</button>
      )}
      <button className="page" onClick={() => onPage && onPage(page + 1)} disabled={page === pageCount}>›</button>
    </div>
  );
}

function Skeleton({ width = "100%", height = 10, style }) {
  return <span className="skel" style={{ width, height, ...style }} />;
}

Object.assign(window, { Wizard, Drawer, Pagination, Skeleton });
