const SAMPLE_BELEGE = [
  { id: 1, name: "Telekom Deutschland GmbH", sub: "Mobilfunk April 2026", date: "23.04.2026", konto: "4925", kontoBez: "Telefon", betrag: "79,90", ust: "19 %", status: "review", kind: "Eingangsrechnung" },
  { id: 2, name: "Berger GmbH", sub: "Ausgangsrechnung 2026/118", date: "22.04.2026", konto: "8400", kontoBez: "Erlöse 19 %", betrag: "12.480,00", ust: "19 %", status: "review", kind: "Ausgangsrechnung" },
  { id: 3, name: "Office Mayer e.K.", sub: "Bürobedarf Bestellung 04/118", date: "20.04.2026", konto: "4980", kontoBez: "Bürobedarf", betrag: "348,90", ust: "19 %", status: "question", kind: "Eingangsrechnung" },
  { id: 4, name: "Stadtwerke München", sub: "Strom Q1/2026", date: "18.04.2026", konto: "4240", kontoBez: "Gas, Strom, Wasser", betrag: "1.247,50", ust: "19 %", status: "approved", kind: "Eingangsrechnung" },
  { id: 5, name: "Anwaltskanzlei Schmidt", sub: "Beratung Vertragsprüfung", date: "16.04.2026", konto: "4950", kontoBez: "Rechts- und Beratungskosten", betrag: "890,00", ust: "19 %", status: "approved", kind: "Eingangsrechnung" },
  { id: 6, name: "DHL Paket", sub: "Versandkosten Sammelrechnung", date: "15.04.2026", konto: "4730", kontoBez: "Verpackungsmaterial", betrag: "127,45", ust: "19 %", status: "review", kind: "Eingangsrechnung" },
];

function statusBadge(s) {
  if (s === "review") return <Badge kind="info">In Prüfung</Badge>;
  if (s === "question") return <Badge kind="warning">Rückfrage</Badge>;
  if (s === "approved") return <Badge kind="success">Geprüft</Badge>;
  return <Badge>Entwurf</Badge>;
}

function Posteingang({ onSelectBeleg }) {
  const [tab, setTab] = React.useState("alle");
  const filtered = tab === "alle" ? SAMPLE_BELEGE
    : tab === "review" ? SAMPLE_BELEGE.filter(b => b.status === "review")
    : tab === "question" ? SAMPLE_BELEGE.filter(b => b.status === "question")
    : SAMPLE_BELEGE.filter(b => b.status === "approved");

  return (
    <>
      <PageHeader
        title="Posteingang"
        sub="Ludwig hat 47 neue Belege vorkontiert. Bitte prüfen und freigeben."
        actions={<>
          <Button kind="secondary" icon={Icons.Plus}>Beleg hochladen</Button>
          <Button kind="primary" icon={Icons.Export}>Geprüfte exportieren</Button>
        </>}
      />
      <div className="stats">
        <Stat label="Heute eingegangen" num="47" delta="+12 gegenüber Vortag" />
        <Stat label="In Prüfung" num="34" delta="durchschnittlich 2 Min/Beleg" />
        <Stat label="Rückfragen" num="3" delta="warten auf Mandant" />
        <Stat label="Bereit zum Export" num="156" delta="Periode April 2026" />
      </div>
      <div className="section">
        <div className="section__h">
          <h3>Belege · April 2026</h3>
          <span className="count">{filtered.length} von {SAMPLE_BELEGE.length}</span>
        </div>
        <div className="section__filters">
          {[["alle","Alle"],["review","In Prüfung"],["question","Rückfragen"],["approved","Geprüft"]].map(([k,l]) => (
            <span key={k} className={"tab" + (tab===k?" active":"")} onClick={() => setTab(k)}>{l}</span>
          ))}
          <span style={{ flex: 1 }}></span>
          <span className="tab"><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>{Icons.Filter} Filter</span></span>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Beleg</th><th>Datum</th><th>Art</th><th>Konto</th><th style={{ textAlign: "right" }}>Betrag</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} onClick={() => onSelectBeleg(b)}>
                <td>
                  <div className="doc">
                    <div className="doc-thumb">{Icons.Paper}</div>
                    <div>
                      <div className="doc-name">{b.name}</div>
                      <div className="doc-sub">{b.sub}</div>
                    </div>
                  </div>
                </td>
                <td className="lw-numeric">{b.date}</td>
                <td><Badge kind="neutral" dot={false}>{b.kind}</Badge></td>
                <td><span className="acct">{b.konto}</span> <span style={{ color: "#5C5C5C", fontSize: 12 }}>· {b.kontoBez}</span></td>
                <td className="num">{b.betrag} €</td>
                <td>{statusBadge(b.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BelegDetail({ beleg, onBack, onApprove }) {
  return (
    <>
      <PageHeader
        title={beleg.name}
        sub={`${beleg.kind} · Eingegangen ${beleg.date} · 1,2 MB · PDF`}
        actions={<Button kind="tertiary" onClick={onBack}>← Zurück zum Posteingang</Button>}
      />
      <div className="split">
        <div className="viewer">
          <div className="doc-page">
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #DDE2E8", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1A3A5C" }}>{beleg.name}</div>
                <div style={{ color: "#5C5C5C" }}>Musterstraße 12 · 80331 München</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 10, color: "#5C5C5C" }}>
                <div>Rechnung Nr. 2026-04-{beleg.id.toString().padStart(4, "0")}</div>
                <div>Datum: {beleg.date}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16, color: "#5C5C5C" }}>An:<br />Steuerkanzlei Hofmann · Maximilianstr. 8 · 80539 München</div>
            <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid #DDE2E8" }}><th style={{ textAlign: "left", padding: 4 }}>Pos</th><th style={{ textAlign: "left", padding: 4 }}>Beschreibung</th><th style={{ textAlign: "right", padding: 4 }}>Betrag</th></tr></thead>
              <tbody>
                <tr><td style={{ padding: 4 }}>1</td><td style={{ padding: 4 }}>{beleg.sub}</td><td style={{ padding: 4, textAlign: "right" }}>{beleg.betrag} €</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #DDE2E8", display: "flex", justifyContent: "flex-end", gap: 24, fontSize: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#5C5C5C" }}>Netto</div>
                <div style={{ color: "#5C5C5C", marginTop: 2 }}>USt {beleg.ust}</div>
                <div style={{ marginTop: 6, fontWeight: 600 }}>Gesamt</div>
              </div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                <div>{beleg.betrag} €</div>
                <div style={{ marginTop: 2 }}>—</div>
                <div style={{ marginTop: 6, fontWeight: 600 }}>{beleg.betrag} €</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="detail-card">
            <div className="detail-h">
              <div className="small">Vorkontierung</div>
              <h2>Vorgeschlagene Buchung</h2>
            </div>
            <div className="detail-body">
              <div className="row"><span className="k">Konto</span><span className="v lw-mono" style={{ fontFamily: "var(--font-mono)" }}>{beleg.konto} · {beleg.kontoBez}</span></div>
              <div className="row"><span className="k">Gegenkonto</span><span className="v lw-mono" style={{ fontFamily: "var(--font-mono)" }}>1200 · Bank</span></div>
              <div className="row"><span className="k">USt-Schlüssel</span><span className="v">9 · {beleg.ust} Vorsteuer</span></div>
              <div className="row"><span className="k">Buchungstext</span><span className="v">{beleg.sub}</span></div>
              <div className="row"><span className="k">Betrag</span><span className="v lw-numeric" style={{ fontVariantNumeric: "tabular-nums" }}>{beleg.betrag} €</span></div>
              <div className="row"><span className="k">Belegdatum</span><span className="v lw-numeric">{beleg.date}</span></div>
              <div className="row"><span className="k">Periode</span><span className="v">04 / 2026</span></div>
            </div>
            <div className="detail-actions">
              <Button kind="secondary" size="sm">Bearbeiten</Button>
              <Button kind="primary" size="sm" icon={Icons.Check} onClick={onApprove}>Freigeben</Button>
            </div>
          </div>

          <LudwigNote>
            Konto <strong>{beleg.konto} · {beleg.kontoBez}</strong> aufgrund Lieferant und Buchungstext gewählt. Bei den letzten 8 Buchungen dieses Lieferanten wurde dasselbe Konto verwendet.
          </LudwigNote>

          <div className="detail-card">
            <div className="detail-h">
              <div className="small">Verlauf</div>
            </div>
            <div className="detail-body" style={{ fontSize: 13 }}>
              <div style={{ display: "flex", gap: 10, padding: "6px 0" }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: "#3B8FC4", marginTop: 8, flexShrink: 0 }}></div>
                <div><strong>Ludwig</strong> hat den Beleg vorkontiert.<div style={{ color: "#8A8A8A", fontSize: 12 }}>{beleg.date} · 09:14</div></div>
              </div>
              <div style={{ display: "flex", gap: 10, padding: "6px 0" }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: "#8A8A8A", marginTop: 8, flexShrink: 0 }}></div>
                <div>Beleg per E-Mail eingegangen.<div style={{ color: "#8A8A8A", fontSize: 12 }}>{beleg.date} · 09:12</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Mandanten() {
  const list = [
    { num: "10024", name: "Berger GmbH", offen: 23, last: "31.03.2026", status: "ok" },
    { num: "10031", name: "Architekturbüro Lindner", offen: 8, last: "31.03.2026", status: "ok" },
    { num: "10047", name: "Hofmeier & Söhne KG", offen: 47, last: "28.02.2026", status: "warn" },
    { num: "10052", name: "Praxis Dr. Köhler", offen: 4, last: "31.03.2026", status: "ok" },
    { num: "10068", name: "Schreinerei Weiß", offen: 19, last: "31.03.2026", status: "ok" },
    { num: "10074", name: "Café Mariposa GbR", offen: 31, last: "31.03.2026", status: "ok" },
  ];
  return (
    <>
      <PageHeader
        title="Mandanten"
        sub="24 aktive Mandanten in Ihrer Kanzlei"
        actions={<Button kind="primary" icon={Icons.Plus}>Mandant hinzufügen</Button>}
      />
      <div className="section">
        <div className="section__h"><h3>Alle Mandanten</h3><span className="count">24 Mandanten</span></div>
        <table className="tbl">
          <thead><tr><th>Mandant</th><th>Nummer</th><th style={{ textAlign: "right" }}>Offene Vorgänge</th><th>Letzter Export</th><th>USt-Voranmeldung</th></tr></thead>
          <tbody>
            {list.map(m => (
              <tr key={m.num}>
                <td>
                  <div className="doc">
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: "#1A3A5C", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{m.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
                    <div className="doc-name">{m.name}</div>
                  </div>
                </td>
                <td className="acct">{m.num}</td>
                <td className="num">{m.offen}</td>
                <td className="lw-numeric">{m.last}</td>
                <td>{m.status === "ok" ? <Badge kind="success">Bereit</Badge> : <Badge kind="warning">Überfällig</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Export_() {
  return (
    <>
      <PageHeader
        title="DATEV-Export"
        sub="Periode April 2026 · Mandant Berger GmbH (10024)"
      />
      <div className="stats">
        <Stat label="Geprüft" num="156" delta="bereit zum Export" />
        <Stat label="Offen" num="34" delta="noch in Prüfung" />
        <Stat label="Summe Soll" num="48.420,15 €" />
        <Stat label="Summe Haben" num="48.420,15 €" delta="ausgeglichen" />
      </div>
      <div className="section">
        <div className="section__h">
          <h3>Export-Pakete</h3>
        </div>
        <div style={{ padding: 24, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 56, height: 72, background: "#F4F6F8", border: "1px solid #DDE2E8", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#5C5C5C", fontFamily: "var(--font-mono)", fontSize: 11 }}>CSV</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "#1A3A5C" }}>Berger_GmbH_2026-04_DATEV.csv</div>
            <div style={{ fontSize: 13, color: "#5C5C5C", marginTop: 2 }}>156 Buchungen · DATEV-Format SKR03 · 24 KB</div>
          </div>
          <Button kind="secondary" size="sm">Vorschau</Button>
          <Button kind="primary" icon={Icons.Export}>Export herunterladen</Button>
        </div>
      </div>
    </>
  );
}

window.Posteingang = Posteingang;
window.BelegDetail = BelegDetail;
window.Mandanten = Mandanten;
window.ExportView = Export_;
