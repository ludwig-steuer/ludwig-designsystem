function Sidebar({ activeRoute, setRoute, mandant, collapsed, onToggle }) {
  const items = [
    { id: "dashboard", label: "Übersicht", icon: Icons.Home || Icons.Chart },
    { id: "posteingang", label: "Posteingang", icon: Icons.Inbox, count: 47 },
    { id: "mandanten", label: "Mandanten", icon: Icons.Users, count: 24 },
    { id: "klaerungen", label: "Klärungen", icon: Icons.MessageCircle || Icons.Help, count: 8 },
    { id: "export", label: "DATEV-Export", icon: Icons.Export },
    { id: "berichte", label: "Berichte", icon: Icons.Chart },
  ];
  return (
    <aside className={"app__sidebar" + (collapsed ? " is-collapsed" : "")}>
      <div className="sb__logo">
        {collapsed ? (
          <img src="../../assets/ludwig-mark.svg" width="28" height="28" alt="Ludwig" />
        ) : (
          <img src="../../assets/ludwig-logo-light.svg" height="28" alt="Ludwig" />
        )}
        <button className="sb__toggle" onClick={onToggle} title={collapsed ? "Ausklappen" : "Einklappen"} aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}>
          {collapsed ? Icons.ChevRight : Icons.ChevLeft}
        </button>
      </div>
      <nav className="sb__nav">
        {!collapsed && <div className="sb__navlabel">Arbeit</div>}
        {items.map((it) => (
          <button
            key={it.id}
            className={"sb__navitem" + (activeRoute === it.id ? " active" : "")}
            onClick={() => setRoute(it.id)}
            title={collapsed ? it.label : undefined}
          >
            <span className="icon">{it.icon}</span>
            {!collapsed && <span className="label">{it.label}</span>}
            {!collapsed && it.count != null && <span className="count">{it.count}</span>}
            {collapsed && it.count != null && <span className="dot-badge" aria-hidden="true"></span>}
          </button>
        ))}
        {!collapsed && <div className="sb__navlabel" style={{ marginTop: 16 }}>Kanzlei</div>}
        <button className="sb__navitem" onClick={() => setRoute("einstellungen")} title={collapsed ? "Einstellungen" : undefined}>
          <span className="icon">{Icons.Settings}</span>
          {!collapsed && <span className="label">Einstellungen</span>}
        </button>
      </nav>
      <div className="sb__user">
        <div className="avatar">SH</div>
        {!collapsed && (
          <div className="sb__user-text">
            <div className="name">Stefan Hofmann</div>
            <div className="role">Steuerberater</div>
          </div>
        )}
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
