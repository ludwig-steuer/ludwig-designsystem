// Geteilte Bausteine für alle drei Beleg-Detail-Varianten.
// Werden als window.BD_* exportiert.

const Chev = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function Toggle({ open, onClick, children }) {
  return (
    <button className={"bdv-toggle " + (open ? "is-open" : "")} onClick={onClick}>
      <span className="chev"><Chev /></span>
      {children}
    </button>
  );
}

/* PDF-Renderer (Original-Beleg) */
function BD_PdfViewer({ beleg }) {
  return (
    <div className="bdv-pdf">
      <div className="bdv-pdf__page">
        <div className="bdv-pdf__toolbar">
          <button className="bdv-pdf__tool">Original</button>
          <button className="bdv-pdf__tool">OCR-Layer</button>
          <span style={{ flex: 1 }}></span>
          <button className="bdv-pdf__tool mono">−</button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "0 4px" }}>100 %</span>
          <button className="bdv-pdf__tool mono">+</button>
          <button className="bdv-pdf__tool">Seite 1 / 1</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h4>{beleg.kreditor.name}</h4>
            <small>{beleg.kreditor.anschrift}</small>
          </div>
          <div style={{ textAlign: "right", fontSize: 9.5, color: "#5C5C5C" }}>
            <div>Rechnung Nr. {beleg.belegnummer}</div>
            <div>Rechnungsdatum: {beleg.invoice_date}</div>
            <div>Fällig: {beleg.due_date}</div>
          </div>
        </div>
        <div style={{ marginBottom: 14, color: "#5C5C5C", fontSize: 9.5 }}>
          An:<br />Steuerkanzlei Hofmann · Maximilianstr. 8 · 80539 München
        </div>
        <table className="invoice">
          <thead>
            <tr><th>Pos</th><th>Leistung</th><th>Zeitraum</th><th className="num">Betrag</th></tr>
          </thead>
          <tbody>
            {beleg.positions.filter(p => p.source !== "virtual_fallback" && p.source !== "virtual_aggregate").map(p => (
              <tr key={p.pos}>
                <td>{p.pos}</td>
                <td>{p.beschreibung}</td>
                <td>04 / 2026</td>
                <td className="num">{p.total_price} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bdv-pdf__totals">
          <dl>
            <dt>Nettobetrag</dt>
            <dt style={{ marginTop: 4 }}>USt 19 %</dt>
          </dl>
          <dl>
            <dd>{beleg.subtotal_value} €</dd>
            <dd style={{ marginTop: 4 }}>{beleg.tax_total_value} €</dd>
          </dl>
        </div>
        <div className="bdv-pdf__totals" style={{ marginTop: -1 }}>
          <dl className="is-grand"><dt>Gesamtbetrag</dt></dl>
          <dl className="is-grand"><dd>{beleg.total_value} €</dd></dl>
        </div>
        <div style={{ marginTop: 18, fontSize: 9.5, color: "#5C5C5C" }}>
          Zahlbar bis {beleg.due_date}. Bei Rückfragen wenden Sie sich an unsere Geschäftskunden-Hotline.
        </div>
      </div>
    </div>
  );
}

/* Header-Block (Kreditor + Belegfakten + Beträge) */
function BD_HeaderBlock({ beleg, withOcr = true }) {
  const [ocrOpen, setOcrOpen] = React.useState(false);
  return (
    <div className="bdv-card">
      <div className="bdv-card__h">
        <div className="small" style={{ flex: "none" }}>Belegdaten</div>
        <h3 style={{ flex: 1 }}>{beleg.kreditor.name}</h3>
        <span className={"bdv-flag " + (beleg.reverse_charge ? "is-on" : "")}>
          <span className="dot"></span>
          {beleg.reverse_charge ? "Reverse-Charge" : "Kein Reverse-Charge"}
        </span>
      </div>
      <div className="bdv-facts">
        <div className="bdv-fact">
          <span className="lbl">Kreditor</span>
          <span className="val"><a href="#">{beleg.kreditor.name}</a> <span className="mono" style={{ color: "var(--color-text-muted)", marginLeft: 4 }}>· {beleg.kreditor.id}</span></span>
        </div>
        <div className="bdv-fact">
          <span className="lbl">Belegnummer</span>
          <span className="val mono">{beleg.belegnummer}</span>
        </div>
        <div className="bdv-fact">
          <span className="lbl">Belegdatum</span>
          <span className="val mono">{beleg.invoice_date}</span>
        </div>
        <div className="bdv-fact">
          <span className="lbl">Fälligkeitsdatum</span>
          <span className="val mono">{beleg.due_date}</span>
        </div>
        <div className="bdv-fact">
          <span className="lbl">Buchungsdatum</span>
          <span className="val mono">{beleg.booking_date}</span>
        </div>
        <div className="bdv-fact">
          <span className="lbl">Währung</span>
          <span className="val mono">{beleg.currency}</span>
        </div>
      </div>
      <div className="bdv-totals">
        <div>
          <div className="lbl">Netto</div>
          <div className="val">{beleg.subtotal_value} €</div>
        </div>
        <div>
          <div className="lbl">Steuer</div>
          <div className="val">{beleg.tax_total_value} €</div>
        </div>
        <div>
          <div className="lbl">Brutto</div>
          <div className="val is-grand">{beleg.total_value} €</div>
        </div>
      </div>
      {withOcr && (
        <>
          <div style={{ padding: "10px 18px", borderTop: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="lbl" style={{ fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>OCR-Markdown</div>
            <Toggle open={ocrOpen} onClick={() => setOcrOpen(!ocrOpen)}>
              {ocrOpen ? "Einklappen" : "Ausklappen"}
            </Toggle>
          </div>
          {ocrOpen && <pre className="bdv-ocr">{beleg.ocr_markdown}</pre>}
        </>
      )}
    </div>
  );
}

window.BD_Toggle = Toggle;
window.BD_PdfViewer = BD_PdfViewer;
window.BD_HeaderBlock = BD_HeaderBlock;
