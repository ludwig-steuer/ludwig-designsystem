// Wiederverwendbare Komponenten-Bausteine für die Ludwig-App
// Ergänzt Primitives.jsx um Empty/Toast/Banner/Wizard/AuditTrail/Pagination/Drawer/Skeleton

function EmptyState({ icon, title, sub, actions }) {
  return (
    <div className="empty">
      {icon && <div className="empty__ico">{icon}</div>}
      <h3 className="empty__title">{title}</h3>
      {sub && <p className="empty__sub">{sub}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  );
}

function Banner({ kind = "info", title, children, action, onAction }) {
  return (
    <div className={"banner banner--" + kind}>
      <div className="banner__body">
        {title && <span className="banner__title">{title} </span>}
        {children}
      </div>
      {action && <button className="banner__action" onClick={onAction}>{action}</button>}
    </div>
  );
}

function Toast({ kind = "success", title, sub, action, onAction }) {
  return (
    <div className="toast">
      <div className={"toast__ico toast__ico--" + kind}>
        {kind === "success" ? Icons.Check : Icons.X}
      </div>
      <div className="toast__body">
        <div className="toast__title">{title}</div>
        {sub && <div className="toast__sub">{sub}</div>}
      </div>
      {action && <button className="toast__action" onClick={onAction}>{action}</button>}
    </div>
  );
}

function Pagination({ page = 1, total = 1, perPage = 20, onChange }) {
  const last = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);
  const pages = [];
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="pag">
      <span className="info">{start}–{end} von {total}</span>
      <button className="page" disabled={page === 1} onClick={() => onChange && onChange(page - 1)}>{Icons.ChevLeft}</button>
      {pages.map((p, i) => p === "…"
        ? <span key={"e"+i} className="ellipsis">…</span>
        : <button key={p} className={"page" + (p === page ? " active" : "")} onClick={() => onChange && onChange(p)}>{p}</button>)}
      <button className="page" disabled={page === last} onClick={() => onChange && onChange(page + 1)}>{Icons.ChevRight}</button>
    </div>
  );
}

function Skeleton({ width = "60%", height = 10 }) {
  return <span className="skel" style={{ width, height }} />;
}

function Wizard({ steps, current, children, onPrev, onNext, onCancel, nextLabel = "Weiter" }) {
  return (
    <div className="wz">
      <div className="wz__steps" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((s, i) => {
          const state = i < current ? "done" : i === current ? "active" : "";
          return (
            <div key={i} className={"wz__step " + state}>
              <span className="wz__num">{state === "done" ? Icons.Check : i + 1}</span>
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
        {current > 0 && <Button kind="tertiary" onClick={onPrev}>← Zurück</Button>}
        {onCancel && <Button kind="secondary" onClick={onCancel}>Speichern und schließen</Button>}
        <Button kind="primary" onClick={onNext}>{nextLabel} →</Button>
      </div>
    </div>
  );
}

function AuditTrail({ entries }) {
  return (
    <div className="at__list">
      {entries.map((e, i) => (
        <div key={i} className="at__item">
          <span className={"at__dot at__dot--" + (e.actor || "system")}></span>
          <div className="at__row">{e.text}</div>
          <div className="at__meta">{e.time}</div>
        </div>
      ))}
    </div>
  );
}

function UploadZone({ active, onPick, onDrop, hint = "PDF · max. 20 MB pro Datei" }) {
  return (
    <div className={"uz" + (active ? " uz--active" : "")}>
      <div className="uz__ico">{Icons.Export}</div>
      <h3 className="uz__title">{active ? "Loslassen zum Hochladen" : "Belege hierhin ziehen"}</h3>
      <p className="uz__sub">{!active && <>oder <a style={{color:"#2E78A8", textDecoration:"underline", cursor:"pointer"}} onClick={onPick}>Dateien auswählen</a></>}</p>
      <div className="uz__hint">{hint}</div>
    </div>
  );
}

function Drawer({ open, onClose, eyebrow, title, children, actions }) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="dr__h">
          <div className="title">
            {eyebrow && <div className="small">{eyebrow}</div>}
            <h2>{title}</h2>
          </div>
          <button className="dr__close" onClick={onClose} aria-label="Schließen">{Icons.X}</button>
        </div>
        <div className="dr__body">{children}</div>
        {actions && <div className="dr__foot">{actions}</div>}
      </aside>
    </>
  );
}

Object.assign(window, { EmptyState, Banner, Toast, Pagination, Skeleton, Wizard, AuditTrail, UploadZone, Drawer });
