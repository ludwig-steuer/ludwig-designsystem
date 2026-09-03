// TopBar with Role-Badge + Tenant-Switcher
// Role-Badge color-coded: Stb = primary navy, Mandant = accent blue, Admin = warning amber

function RoleBadge({ role = "stb" }) {
  const config = {
    stb:     { label: "Steuerberater", short: "Stb",   bg: "#E3EAF1", color: "#1A3A5C", border: "#C7D3E0" },
    mandant: { label: "Mandant",       short: "Mand.", bg: "#E3F0F8", color: "#2E78A8", border: "#C7DFEC" },
    admin:   { label: "Plattform-Admin", short: "Admin", bg: "#F5EEE0", color: "#B07B2C", border: "#E8DCBE" },
  }[role] || { label: role, short: role, bg: "#ECEFF3", color: "#5C5C5C", border: "#DDE2E8" };
  return (
    <span className="role-badge" style={{ background: config.bg, color: config.color, borderColor: config.border }}>
      <span className="dot" style={{ background: config.color }} />
      {config.label}
    </span>
  );
}

function TenantSwitcher({ tenants, active, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const current = tenants.find(t => t.id === active) || tenants[0];
  return (
    <div className="tenant" ref={ref}>
      <button className="tenant__btn" onClick={() => setOpen(o => !o)} title="Mandant wechseln">
        <span className="tenant__avatar" style={{ background: current.color }}>{current.initials}</span>
        <div className="tenant__text">
          <div className="num">{current.num}</div>
          <div className="name">{current.name}</div>
        </div>
        <span className="chev">{Icons.ChevDown}</span>
      </button>
      {open && (
        <div className="tenant__menu" role="menu">
          <div className="tenant__menu-search">
            <span className="ico">{Icons.Search}</span>
            <input placeholder="Mandant suchen…" autoFocus />
          </div>
          <div className="tenant__menu-list">
            {tenants.map(t => (
              <button
                key={t.id}
                className={"tenant__menu-item" + (t.id === active ? " is-active" : "")}
                onClick={() => { onChange && onChange(t.id); setOpen(false); }}
              >
                <span className="tenant__avatar" style={{ background: t.color }}>{t.initials}</span>
                <div className="tenant__text">
                  <div className="num">{t.num}</div>
                  <div className="name">{t.name}</div>
                </div>
                {t.open != null && <span className="tenant__pill">{t.open} offen</span>}
                {t.id === active && <span className="tenant__check">{Icons.Check}</span>}
              </button>
            ))}
          </div>
          <div className="tenant__menu-foot">
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "#2E78A8", fontSize: 13 }}>
              {Icons.Plus} Mandant hinzufügen
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar({ crumb, role = "stb", tenants, activeTenant, onTenantChange }) {
  return (
    <header className="app__topbar">
      {tenants && (
        <TenantSwitcher tenants={tenants} active={activeTenant} onChange={onTenantChange} />
      )}
      <div className="tb__crumb">{crumb}</div>
      <div className="tb__search">
        <span className="icon">{Icons.Search}</span>
        <input placeholder="Belege, Mandanten, Konten suchen…" />
      </div>
      <div className="tb__actions">
        <RoleBadge role={role} />
        <button className="tb__icon-btn" title="Hilfe">{Icons.Help}</button>
        <button className="tb__icon-btn" title="Benachrichtigungen">{Icons.Bell}</button>
      </div>
    </header>
  );
}

window.RoleBadge = RoleBadge;
window.TenantSwitcher = TenantSwitcher;
window.TopBar = TopBar;
