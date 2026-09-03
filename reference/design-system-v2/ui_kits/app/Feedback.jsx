// Ludwig — Feedback components
// EmptyState · Banner · Toast · ToastStack

const Icons = {
  inbox: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 13l2-7h14l2 7M3 13v6a1 1 0 001 1h16a1 1 0 001-1v-6M3 13h5l1 2h6l1-2h5"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4l9 16H3z"/><path d="M12 11v4M12 18v.01"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12l4 4 10-10"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>,
};

function EmptyState({ icon, title, sub, actions, inline }) {
  return (
    <div className={"empty" + (inline ? " empty--inline" : "")}>
      <div className="empty__ico">{icon || Icons.inbox}</div>
      <h3 className="empty__title">{title}</h3>
      {sub && <p className="empty__sub">{sub}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  );
}

function Banner({ kind = "info", title, children, action }) {
  const ico = kind === "danger" || kind === "warning" ? Icons.warn
            : kind === "success" ? Icons.check : Icons.info;
  return (
    <div className={"banner banner--" + kind}>
      <span className="banner__ico">{ico}</span>
      <div className="banner__body">
        {title && <div className="banner__title">{title}</div>}
        <div>{children}</div>
      </div>
      {action && <button className="banner__action" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}

function Toast({ kind = "success", title, sub, action, onClose }) {
  return (
    <div className="toast">
      <span className={"toast__ico toast__ico--" + kind}>
        {kind === "success" ? Icons.check : Icons.warn}
      </span>
      <div className="toast__body">
        <div className="toast__title">{title}</div>
        {sub && <div className="toast__sub">{sub}</div>}
      </div>
      {action && <button className="toast__action" onClick={action.onClick}>{action.label}</button>}
      {onClose && <button className="toast__action" onClick={onClose} aria-label="Schließen" style={{ color: "#8A8A8A" }}>{Icons.close}</button>}
    </div>
  );
}

function ToastStack({ children }) {
  return <div className="toast-stack">{children}</div>;
}

Object.assign(window, { EmptyState, Banner, Toast, ToastStack, FeedbackIcons: Icons });
