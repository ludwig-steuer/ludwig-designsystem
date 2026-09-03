// Ludwig — Dashboard view (Kanzlei-Übersicht)
// Rich first-screen: KPI tiles, today's queue, USt-Deadlines, recent activity,
// mini revenue chart, top mandants, todo for Steuerberater.

function MiniBars({ data }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(v / max) * 100}%`,
          background: i === data.length - 1 ? "#1A3A5C" : "#C7DFEC",
          borderRadius: "2px 2px 0 0",
          minHeight: 4,
        }} />
      ))}
    </div>
  );
}

function Sparkline({ data, color = "#3B8FC4" }) {
  const w = 120, h = 32, pad = 2;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Dashboard({ onNavigate }) {
  const heute = new Date(2026, 3, 24).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  return (
    <>
      <div className="page-h" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="lw-overline" style={{ color: "#5C5C5C", marginBottom: 4 }}>Kanzlei Hofmann · {heute}</div>
          <h1>Guten Morgen, Herr Hofmann.</h1>
          <div className="sub">Ludwig hat über Nacht <strong style={{ color: "#1A3A5C", fontWeight: 600 }}>47 Belege</strong> für 6 Mandanten vorkontiert.</div>
        </div>
        <div className="actions">
          <Button kind="secondary" icon={Icons.Plus}>Beleg hochladen</Button>
          <Button kind="primary" icon={Icons.Export}>Geprüfte exportieren</Button>
        </div>
      </div>

      {/* KPI tiles with sparklines */}
      <div className="stats">
        <div className="stat">
          <div className="label">Posteingang heute</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div className="num">47</div>
            <Sparkline data={[18, 22, 19, 28, 24, 31, 47]} />
          </div>
          <div className="delta">+12 gegenüber Vortag</div>
        </div>
        <div className="stat">
          <div className="label">Durchsatz April</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div className="num">1.284</div>
            <Sparkline data={[820, 940, 1010, 1120, 1180, 1240, 1284]} color="#3F7A5A" />
          </div>
          <div className="delta">Belege seit Periodenbeginn</div>
        </div>
        <div className="stat">
          <div className="label">Rückfragen offen</div>
          <div className="num">3</div>
          <div className="delta" style={{ color: "#B07B2C" }}>1 Mandant wartet seit 2 Tagen</div>
        </div>
        <div className="stat">
          <div className="label">Bereit zum Export</div>
          <div className="num">156</div>
          <div className="delta">Periode 04 / 2026 · ausgeglichen</div>
        </div>
      </div>

      {/* Two-column: queue + side rail */}
      <div className="dash-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* Heute zu prüfen */}
          <div className="section">
            <div className="section__h">
              <h3>Heute zu prüfen</h3>
              <span className="count"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("posteingang"); }} style={{ color: "#2E78A8", textDecoration: "none", fontWeight: 500 }}>Posteingang öffnen →</a></span>
            </div>
            <table className="tbl">
              <thead>
                <tr><th>Mandant</th><th>Beleg</th><th>Konto</th><th style={{ textAlign: "right" }}>Betrag</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="mand-avatar" style={{ background: "#1A3A5C" }}>BG</span><div><div className="doc-name">Berger GmbH</div><div className="doc-sub">10024</div></div></div></td>
                  <td>Telekom 04/2026</td>
                  <td><span className="acct">4925</span> <span style={{ color: "#5C5C5C", fontSize: 12 }}>· Telefon</span></td>
                  <td className="num">79,90 €</td>
                  <td><Badge kind="info">In Prüfung</Badge></td>
                </tr>
                <tr>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="mand-avatar" style={{ background: "#2E78A8" }}>AL</span><div><div className="doc-name">Architekturbüro Lindner</div><div className="doc-sub">10031</div></div></div></td>
                  <td>Honorarrechnung 04/02</td>
                  <td><span className="acct">8400</span> <span style={{ color: "#5C5C5C", fontSize: 12 }}>· Erlöse 19 %</span></td>
                  <td className="num">8.450,00 €</td>
                  <td><Badge kind="info">In Prüfung</Badge></td>
                </tr>
                <tr>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="mand-avatar" style={{ background: "#3F7A5A" }}>HS</span><div><div className="doc-name">Hofmeier &amp; Söhne KG</div><div className="doc-sub">10047</div></div></div></td>
                  <td>Office Mayer 04/118</td>
                  <td><span className="acct">4980</span> <span style={{ color: "#5C5C5C", fontSize: 12 }}>· Bürobedarf</span></td>
                  <td className="num">348,90 €</td>
                  <td><Badge kind="warning">Rückfrage</Badge></td>
                </tr>
                <tr>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="mand-avatar" style={{ background: "#B07B2C" }}>PK</span><div><div className="doc-name">Praxis Dr. Köhler</div><div className="doc-sub">10052</div></div></div></td>
                  <td>Stadtwerke München</td>
                  <td><span className="acct">4240</span> <span style={{ color: "#5C5C5C", fontSize: 12 }}>· Strom</span></td>
                  <td className="num">1.247,50 €</td>
                  <td><Badge kind="success">Geprüft</Badge></td>
                </tr>
                <tr>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="mand-avatar" style={{ background: "#5BA4D1" }}>SW</span><div><div className="doc-name">Schreinerei Weiß</div><div className="doc-sub">10068</div></div></div></td>
                  <td>DHL Sammelrechnung</td>
                  <td><span className="acct">4730</span> <span style={{ color: "#5C5C5C", fontSize: 12 }}>· Verpackung</span></td>
                  <td className="num">127,45 €</td>
                  <td><Badge kind="info">In Prüfung</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mandanten-Auslastung + chart */}
          <div className="dash-twocol">
            <div className="section">
              <div className="section__h"><h3>Belege je Werktag · April</h3><span className="count">Ø 64 / Tag</span></div>
              <div style={{ padding: "20px 20px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                  {[42,58,71,53,68,74,61,49,55,82,71,65,58,77,92,68,71,84,79,66,58,73].map((v, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: `${(v / 95) * 100}%`,
                      background: i === 21 ? "#1A3A5C" : "#C7DFEC",
                      borderRadius: "2px 2px 0 0",
                    }} title={`${v} Belege`} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#8A8A8A", fontFamily: "var(--font-mono)" }}>
                  <span>01.04.</span><span>10.04.</span><span>20.04.</span><span>heute</span>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section__h"><h3>Top Mandanten</h3><span className="count">nach Volumen</span></div>
              <div style={{ padding: "8px 0" }}>
                {[
                  { name: "Berger GmbH", num: "10024", count: 312, avatar: "#1A3A5C" },
                  { name: "Hofmeier & Söhne KG", num: "10047", count: 287, avatar: "#3F7A5A" },
                  { name: "Architekturbüro Lindner", num: "10031", count: 184, avatar: "#2E78A8" },
                  { name: "Café Mariposa GbR", num: "10074", count: 156, avatar: "#B07B2C" },
                ].map((m) => (
                  <div key={m.num} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: "1px solid #ECEFF3" }}>
                    <span className="mand-avatar" style={{ background: m.avatar }}>{m.name.split(" ").map(w => w[0]).slice(0,2).join("")}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "#2D2D2D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                      <div style={{ fontSize: 11.5, color: "#8A8A8A", fontFamily: "var(--font-mono)" }}>{m.num}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#1A3A5C", fontVariantNumeric: "tabular-nums" }}>{m.count}</div>
                      <div style={{ fontSize: 11, color: "#8A8A8A" }}>Belege</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* USt-Voranmeldung deadline */}
          <div className="section deadline">
            <div className="section__h">
              <h3>USt-Voranmeldung</h3>
              <span className="count">10. Mai 2026</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 500, color: "#1A3A5C", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>16 <span style={{ fontSize: 18, color: "#5C5C5C", fontWeight: 400 }}>Tage</span></div>
              <div style={{ fontSize: 13, color: "#5C5C5C", marginTop: 8, lineHeight: 1.5 }}>
                <strong style={{ color: "#2D2D2D", fontWeight: 600 }}>21 von 24 Mandanten</strong> bereit zum Export.
              </div>
              <div style={{ marginTop: 14, height: 6, background: "#ECEFF3", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: "87.5%", height: "100%", background: "#3F7A5A" }} />
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <Button kind="primary" size="sm" icon={Icons.Export}>USt vorbereiten</Button>
              </div>
            </div>
          </div>

          {/* Aufgaben Steuerberater */}
          <div className="section">
            <div className="section__h">
              <h3>Ihre Aufgaben</h3>
              <span className="count">3 offen</span>
            </div>
            <div style={{ padding: "4px 0" }}>
              {[
                { t: "Rückfrage Hofmeier prüfen", s: "Beleg Office Mayer 04/118 — fehlende USt-ID", urgent: true },
                { t: "Mandant Café Mariposa freigeben", s: "Onboarding abgeschlossen, wartet auf Aktivierung" },
                { t: "Quartalsbesprechung Berger", s: "Termin 28.04. · Unterlagen vorbereiten" },
              ].map((task, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 20px", borderBottom: "1px solid #ECEFF3", alignItems: "flex-start" }}>
                  <span style={{ width: 14, height: 14, border: "1.5px solid #C4CCD5", borderRadius: 3, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "#2D2D2D" }}>{task.t}</div>
                    <div style={{ fontSize: 12, color: "#5C5C5C", marginTop: 2, lineHeight: 1.45 }}>{task.s}</div>
                  </div>
                  {task.urgent && <Badge kind="warning">Dringend</Badge>}
                </div>
              ))}
            </div>
          </div>

          {/* Ludwig Activity */}
          <div className="section">
            <div className="section__h">
              <h3>Ludwig — Verlauf</h3>
              <span className="count">letzte 24 h</span>
            </div>
            <div style={{ padding: "12px 20px 16px" }}>
              {[
                { t: "08:42", a: "Ludwig", b: "47 Belege vorkontiert", c: "Berger GmbH, Lindner u.a." },
                { t: "07:18", a: "Ludwig", b: "USt-Voranmeldung vorbereitet", c: "Praxis Dr. Köhler" },
                { t: "Gestern", a: "S. Hofmann", b: "Export DATEV freigegeben", c: "Berger GmbH · 03/2026" },
                { t: "Gestern", a: "Ludwig", b: "Rückfrage gestellt", c: "Hofmeier & Söhne · USt-ID" },
              ].map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", fontSize: 13 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#8A8A8A", minWidth: 56, paddingTop: 2 }}>{e.t}</div>
                  <div style={{ width: 6, height: 6, borderRadius: 999, background: e.a === "Ludwig" ? "#3B8FC4" : "#8A8A8A", marginTop: 7, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#2D2D2D" }}><strong style={{ fontWeight: 600 }}>{e.a}</strong> {e.b}</div>
                    <div style={{ fontSize: 12, color: "#8A8A8A", marginTop: 1 }}>{e.c}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

window.Dashboard = Dashboard;
