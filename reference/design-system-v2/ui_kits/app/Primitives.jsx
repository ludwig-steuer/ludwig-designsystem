function Badge({ kind = "neutral", children, dot }) {
  const dotColor = { info: "#3B8FC4", success: "#3F7A5A", warning: "#B07B2C", neutral: "#8A8A8A" }[kind];
  return (
    <span className={"bdg bdg-" + kind}>
      {dot !== false && <span className="dot" style={{ background: dotColor }} />}
      {children}
    </span>
  );
}

function Button({ kind = "primary", size, icon, children, onClick, disabled }) {
  const cls = ["btn", "btn-" + kind, size === "sm" ? "btn-sm" : ""].join(" ").trim();
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {icon && <span className="icon">{icon}</span>}
      {children}
    </button>
  );
}

function PageHeader({ title, sub, actions }) {
  return (
    <div className="page-h">
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

function Stat({ label, num, delta }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="num">{num}</div>
      {delta && <div className="delta">{delta}</div>}
    </div>
  );
}

function LudwigNote({ label = "Ludwig schlägt vor", children }) {
  return (
    <div className="lw-note">
      <span className="mark"></span>
      <div>
        <div className="label">{label}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

window.Badge = Badge;
window.Button = Button;
window.PageHeader = PageHeader;
window.Stat = Stat;
window.LudwigNote = LudwigNote;
