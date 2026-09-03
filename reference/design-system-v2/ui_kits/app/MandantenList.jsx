// Mandanten-Liste — gemäß Brief
// Spalten: Mandant, Mandanten-Nr, Branche, Letzte Aktivität, Offene Vorgänge, Status

const MANDANTEN_DATA = [
  { id: "10024", num: "10024", name: "Berger GmbH",            initials: "BG", color: "#1A3A5C", branche: "Handel", rechtsform: "GmbH", offen: 23, review: 5, klaer: 1, last: "heute, 09:14",   status: "active",   ust: "ready" },
  { id: "10031", num: "10031", name: "Architekturbüro Lindner", initials: "AL", color: "#2E78A8", branche: "Dienstleistung", rechtsform: "PartG", offen: 8,  review: 2, klaer: 0, last: "heute, 08:42",   status: "active",   ust: "ready" },
  { id: "10047", num: "10047", name: "Hofmeier & Söhne KG",     initials: "HS", color: "#3F7A5A", branche: "Bau",    rechtsform: "KG",   offen: 47, review: 12, klaer: 3, last: "gestern, 17:30", status: "attention", ust: "overdue" },
  { id: "10052", num: "10052", name: "Praxis Dr. Köhler",       initials: "PK", color: "#B07B2C", branche: "Heilberuf", rechtsform: "Einzelunternehmen", offen: 4,  review: 1, klaer: 0, last: "heute, 11:08",   status: "active",   ust: "ready" },
  { id: "10068", num: "10068", name: "Schreinerei Weiß",       initials: "SW", color: "#5BA4D1", branche: "Handwerk", rechtsform: "e.K.", offen: 19, review: 6, klaer: 2, last: "heute, 07:55",   status: "active",   ust: "ready" },
  { id: "10074", num: "10074", name: "Café Mariposa GbR",       initials: "CM", color: "#A8403C", branche: "Gastronomie", rechtsform: "GbR", offen: 31, review: 8, klaer: 1, last: "heute, 06:12",   status: "active",   ust: "ready" },
  { id: "10089", num: "10089", name: "Yildiz Logistik UG",      initials: "YL", color: "#2E78A8", branche: "Logistik", rechtsform: "UG", offen: 12, review: 3, klaer: 0, last: "21.04.2026",      status: "active",   ust: "ready" },
  { id: "10095", num: "10095", name: "Pension Sonnental",       initials: "PS", color: "#3F7A5A", branche: "Beherbergung", rechtsform: "GmbH", offen: 0,  review: 0, klaer: 0, last: "18.04.2026",      status: "onboarding", ust: "n/a" },
  { id: "10102", num: "10102", name: "Köhler Consulting",       initials: "KC", color: "#1A3A5C", branche: "Beratung", rechtsform: "GmbH", offen: 6,  review: 0, klaer: 0, last: "17.04.2026",      status: "active",   ust: "ready" },
  { id: "10108", num: "10108", name: "Bäckerei Reiser",         initials: "BR", color: "#B07B2C", branche: "Lebensmittel", rechtsform: "e.K.", offen: 0,  review: 0, klaer: 0, last: "10.03.2026",      status: "inactive", ust: "n/a" },
];

function mandantStatusBadge(s) {
  if (s === "active")     return <Badge kind="success">Aktiv</Badge>;
  if (s === "attention")  return <Badge kind="warning">Achtung</Badge>;
  if (s === "onboarding") return <Badge kind="info">Onboarding</Badge>;
  if (s === "inactive")   return <Badge kind="neutral">Inaktiv</Badge>;
  return <Badge>?</Badge>;
}

function ustBadge(s) {
  if (s === "ready")   return <Badge kind="success">Bereit</Badge>;
  if (s === "overdue") return <Badge kind="warning">Überfällig</Badge>;
  return <span style={{ fontSize: 12, color: "#8A8A8A" }}>—</span>;
}

function MandantenList({ onSelect }) {
  const [tab, setTab] = React.useState("alle");
  const [q, setQ]     = React.useState("");

  const filtered = MANDANTEN_DATA.filter((m) => {
    if (tab === "alle"        && true) {}
    if (tab === "active"      && m.status !== "active")     return false;
    if (tab === "attention"   && m.status !== "attention")  return false;
    if (tab === "onboarding"  && m.status !== "onboarding") return false;
    if (tab === "inactive"    && m.status !== "inactive")   return false;
    if (q && !(m.name.toLowerCase().includes(q.toLowerCase()) || m.num.includes(q))) return false;
    return true;
  });

  const counts = {
    alle:       MANDANTEN_DATA.length,
    active:     MANDANTEN_DATA.filter(m => m.status === "active").length,
    attention:  MANDANTEN_DATA.filter(m => m.status === "attention").length,
    onboarding: MANDANTEN_DATA.filter(m => m.status === "onboarding").length,
    inactive:   MANDANTEN_DATA.filter(m => m.status === "inactive").length,
  };

  return (
    <>
      <PageHeader
        title="Mandanten"
        sub={`${counts.alle} Mandanten · ${counts.active} aktiv · ${counts.attention} mit offenen Klärungen · ${counts.onboarding} im Onboarding`}
        actions={<>
          <Button kind="secondary" icon={Icons.Download}>Liste exportieren</Button>
          <Button kind="primary" icon={Icons.Plus}>Mandant hinzufügen</Button>
        </>}
      />

      <div className="section">
        <div className="section__filters">
          {[
            ["alle",       "Alle",       counts.alle],
            ["active",     "Aktiv",      counts.active],
            ["attention",  "Achtung",    counts.attention],
            ["onboarding", "Onboarding", counts.onboarding],
            ["inactive",   "Inaktiv",    counts.inactive],
          ].map(([k, l, c]) => (
            <span key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>
              {l} <span style={{ fontSize: 11, color: "#8A8A8A", marginLeft: 4, fontVariantNumeric: "tabular-nums" }}>{c}</span>
            </span>
          ))}
          <span style={{ flex: 1 }} />
          <div className="filter-search">
            <span className="ico">{Icons.Search}</span>
            <input placeholder="Name oder Mandanten-Nr." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Mandant</th>
              <th>Branche · Rechtsform</th>
              <th style={{ textAlign: "right" }}>Offen</th>
              <th style={{ textAlign: "right" }}>Review</th>
              <th style={{ textAlign: "right" }}>Klärung</th>
              <th>Letzte Aktivität</th>
              <th>USt-VA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} onClick={() => onSelect && onSelect(m)}>
                <td>
                  <div className="doc">
                    <div className="mand-avatar" style={{ background: m.color, width: 32, height: 32, borderRadius: 4 }}>{m.initials}</div>
                    <div>
                      <div className="doc-name">{m.name}</div>
                      <div className="doc-sub" style={{ fontFamily: "var(--font-mono)" }}>{m.num}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{m.branche}</div>
                  <div style={{ fontSize: 11.5, color: "#8A8A8A" }}>{m.rechtsform}</div>
                </td>
                <td className="num">{m.offen || "—"}</td>
                <td className="num">{m.review ? <span style={{ color: m.review > 5 ? "#B07B2C" : undefined }}>{m.review}</span> : "—"}</td>
                <td className="num">{m.klaer ? <span style={{ color: "#B07B2C" }}>{m.klaer}</span> : "—"}</td>
                <td className="lw-numeric" style={{ fontSize: 12.5, color: "#5C5C5C" }}>{m.last}</td>
                <td>{ustBadge(m.ust)}</td>
                <td>{mandantStatusBadge(m.status)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: 32, color: "#8A8A8A", fontSize: 13 }}>Keine Mandanten gefunden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

window.MandantenList = MandantenList;
window.MANDANTEN_DATA = MANDANTEN_DATA;
