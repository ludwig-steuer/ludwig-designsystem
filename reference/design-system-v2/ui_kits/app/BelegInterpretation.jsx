// Positionen-Tabelle + Interpretation-Panel — geteilt zwischen allen Varianten

const SOURCE_LABEL = {
  extracted: "extrahiert",
  virtual_fallback: "virtual_fallback",
  virtual_aggregate: "virtual_aggregate",
};

function BD_PositionsTable({ beleg }) {
  return (
    <div className="bdv-card">
      <div className="bdv-card__h">
        <div className="small" style={{ flex: "none" }}>Positionen</div>
        <h3 style={{ flex: 1 }}>{beleg.positions.length} Posten</h3>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Summe Brutto <strong style={{ color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>{beleg.total_value} €</strong>
        </span>
      </div>
      <div className="bdv-card__body--flush" style={{ padding: 0 }}>
        <table className="bdv-tbl">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Beschreibung</th>
              <th className="num">Menge</th>
              <th className="num">Einzelpreis</th>
              <th className="num">USt</th>
              <th className="num">Gesamt</th>
              <th>Quelle</th>
            </tr>
          </thead>
          <tbody>
            {beleg.positions.map(p => (
              <tr key={p.pos}>
                <td className="pos">{p.pos}</td>
                <td><span className="desc">{p.beschreibung}</span></td>
                <td className="num">{p.quantity}</td>
                <td className="num">{p.unit_price} €</td>
                <td className="tax num">{p.tax_rate_percent} %</td>
                <td className="num"><strong>{p.total_price} €</strong></td>
                <td>
                  <span className={"bdv-src src-" + p.source}>
                    <span className="dot"></span>
                    {SOURCE_LABEL[p.source]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BD_InterpretationPanel({ beleg, compact = false }) {
  const [reasoningOpen, setReasoningOpen] = React.useState(false);
  const i = beleg.interpretation;
  const pct = Math.round(i.confidence * 100);
  return (
    <div className="bdv-interp">
      <div className="bdv-interp__h">
        <div className="bdv-interp__mark"></div>
        <div className="bdv-interp__title">
          <div className="small">Ludwig schlägt vor</div>
          <h3>Buchungsvorschlag</h3>
        </div>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>v2.4 · 09:14</span>
      </div>

      <div className="bdv-conf">
        <div className="bdv-conf__lbl">Konfidenz (gesamt)</div>
        <div className="bdv-conf__pct">{pct} %</div>
        <div className="bdv-conf__bar"><div className="bdv-conf__fill" style={{ width: pct + "%" }}></div></div>
        <div className="bdv-conf__hint">Ludwig ist sich bei diesem Beleg überwiegend sicher. Bitte prüfen Sie die Klärungsfrage unten.</div>
      </div>

      <div className="bdv-account">
        <div className="bdv-account__col">
          <span className="lbl">Soll-Konto</span>
          <span className="konto">{i.soll.konto}</span>
          <span className="name">{i.soll.bezeichnung}</span>
        </div>
        <div className="bdv-account__col">
          <span className="lbl">Haben-Konto</span>
          <span className="konto">{i.haben.konto}</span>
          <span className="name">{i.haben.bezeichnung}</span>
        </div>
        <div className="bdv-account__cat">
          <span className="lbl">Service-Kategorie</span>
          <span className="val">{i.kategorie}</span>
        </div>
      </div>

      <div className="bdv-buchungstext">
        <span className="lbl">Vorgeschlagener Buchungstext</span>
        <span className="val">{i.buchungstext}</span>
      </div>

      <div className="bdv-list bdv-list--klaerung">
        <div className="bdv-list__lbl">
          Klärungsfragen <span className="pill">{i.klaerung.length}</span>
        </div>
        <ul>
          {i.klaerung.map((q, idx) => <li key={idx}>{q}</li>)}
        </ul>
      </div>

      <div className="bdv-list bdv-list--review">
        <div className="bdv-list__lbl">
          Review-Items <span className="pill">{i.review.length}</span>
        </div>
        <ul>
          {i.review.map((r, idx) => <li key={idx}>{r}</li>)}
        </ul>
      </div>

      <div style={{ padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: reasoningOpen ? "1px solid var(--color-border-subtle)" : "none" }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>Ludwig-Begründung</div>
        <BD_Toggle open={reasoningOpen} onClick={() => setReasoningOpen(!reasoningOpen)}>
          {reasoningOpen ? "Einklappen" : "Ausklappen"}
        </BD_Toggle>
      </div>
      {reasoningOpen && (
        <div className="bdv-reasoning">
          {i.reasoning}
          <div className="src">Modell: ludwig-buchung-v2.4 · gestützt auf 12 Vorbuchungen dieses Kreditors</div>
        </div>
      )}
    </div>
  );
}

function BD_Actions({ onApprove, onReject }) {
  return (
    <div className="bdv-actions">
      <button className="btn btn-secondary btn-sm">Bearbeiten</button>
      <button className="btn btn-danger btn-sm" onClick={onReject}>Ablehnen</button>
      <span className="spacer"></span>
      <button className="btn btn-secondary btn-sm">Klärung an Mandanten senden</button>
      <button className="btn btn-primary btn-sm" onClick={onApprove}>Akzeptieren</button>
    </div>
  );
}

window.BD_PositionsTable = BD_PositionsTable;
window.BD_InterpretationPanel = BD_InterpretationPanel;
window.BD_Actions = BD_Actions;
