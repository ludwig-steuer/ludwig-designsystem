// Sticky-Header (oben über den ganzen Beleg-Detail-Screen) + die 3 Layout-Varianten

function BD_Header({ beleg, variant, onBack }) {
  return (
    <div className="bdv-head">
      <button className="bdv-head__back" onClick={onBack} aria-label="Zurück">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div className="bdv-head__title">
        <h1>{beleg.kreditor.name} · {beleg.belegnummer}</h1>
        <div className="bdv-head__meta">
          <span className="mono">{beleg.id}</span>
          <span className="sep">·</span>
          <span>Eingangsrechnung</span>
          <span className="sep">·</span>
          <span>Belegdatum {beleg.invoice_date}</span>
          <span className="sep">·</span>
          <span>Brutto <strong style={{ color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>{beleg.total_value} €</strong></span>
        </div>
      </div>
      <div className="bdv-head__actions">
        <span className="bdv-flag is-on" title="Variante">
          <span className="dot"></span>
          Layout {variant}
        </span>
        <button className="btn btn-secondary btn-sm">PDF herunterladen</button>
      </div>
    </div>
  );
}

/* === Variante A — Klassisch gestapelt =================================== */
function BelegDetail_A({ beleg, onBack }) {
  return (
    <div className="bdv bdv-a">
      <BD_Header beleg={beleg} variant="A" onBack={onBack} />
      <BD_PdfViewer beleg={beleg} />
      <div className="bdv-side">
        <BD_HeaderBlock beleg={beleg} />
        <BD_PositionsTable beleg={beleg} />
        <BD_InterpretationPanel beleg={beleg} />
      </div>
      <BD_Actions onApprove={onBack} onReject={onBack} />
    </div>
  );
}

/* === Variante B — Tabs ================================================== */
function BelegDetail_B({ beleg, onBack }) {
  const [tab, setTab] = React.useState("uebersicht");
  const tabs = [
    { id: "uebersicht", label: "Übersicht" },
    { id: "positionen", label: "Positionen", pill: beleg.positions.length },
    { id: "analyse", label: "Ludwig-Analyse", pill: Math.round(beleg.interpretation.confidence * 100) + "%" },
    { id: "ocr", label: "OCR-Text" },
  ];
  return (
    <div className="bdv bdv-b">
      <BD_Header beleg={beleg} variant="B" onBack={onBack} />
      <BD_PdfViewer beleg={beleg} />
      <div className="bdv-tabwrap">
        <div className="bdv-b__tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={"bdv-b__tab " + (tab === t.id ? "is-active" : "")}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.pill !== undefined && <span className="pill">{t.pill}</span>}
            </button>
          ))}
        </div>
        <div className="bdv-b__panel">
          {tab === "uebersicht" && (
            <>
              <BD_HeaderBlock beleg={beleg} withOcr={false} />
              <div className="bdv-card">
                <div className="bdv-card__h">
                  <div className="small" style={{ flex: "none" }}>Kurzfassung</div>
                  <h3 style={{ flex: 1 }}>Ludwig-Vorschlag</h3>
                  <span className="bdv-flag is-on">
                    <span className="dot"></span>
                    Konfidenz {Math.round(beleg.interpretation.confidence * 100)} %
                  </span>
                </div>
                <div className="bdv-account">
                  <div className="bdv-account__col">
                    <span className="lbl">Soll</span>
                    <span className="konto">{beleg.interpretation.soll.konto}</span>
                    <span className="name">{beleg.interpretation.soll.bezeichnung}</span>
                  </div>
                  <div className="bdv-account__col">
                    <span className="lbl">Haben</span>
                    <span className="konto">{beleg.interpretation.haben.konto}</span>
                    <span className="name">{beleg.interpretation.haben.bezeichnung}</span>
                  </div>
                </div>
                <div className="bdv-buchungstext">
                  <span className="lbl">Buchungstext</span>
                  <span className="val">{beleg.interpretation.buchungstext}</span>
                </div>
              </div>
            </>
          )}
          {tab === "positionen" && <BD_PositionsTable beleg={beleg} />}
          {tab === "analyse" && <BD_InterpretationPanel beleg={beleg} />}
          {tab === "ocr" && (
            <div className="bdv-card">
              <div className="bdv-card__h">
                <div className="small" style={{ flex: "none" }}>OCR</div>
                <h3 style={{ flex: 1 }}>Extrahierter Text (Markdown)</h3>
              </div>
              <pre className="bdv-ocr" style={{ maxHeight: "none", border: "none" }}>{beleg.ocr_markdown}</pre>
            </div>
          )}
        </div>
      </div>
      <BD_Actions onApprove={onBack} onReject={onBack} />
    </div>
  );
}

/* === Variante C — Drei Spalten ========================================= */
function BelegDetail_C({ beleg, onBack }) {
  const i = beleg.interpretation;
  const pct = Math.round(i.confidence * 100);
  return (
    <div className="bdv bdv-c">
      <BD_Header beleg={beleg} variant="C" onBack={onBack} />
      <BD_PdfViewer beleg={beleg} />

      {/* Mittlere Spalte — Belegdaten + Positionen */}
      <div className="bdv-col-mid">
        <div className="bdv-c__sec">
          <div className="bdv-c__sec-h">
            <span className="small">Belegdaten</span>
          </div>
          <div className="bdv-facts">
            <div className="bdv-fact">
              <span className="lbl">Kreditor</span>
              <span className="val"><a href="#">{beleg.kreditor.name}</a></span>
              <span className="val mono" style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>{beleg.kreditor.id}</span>
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
              <span className="lbl">Fällig</span>
              <span className="val mono">{beleg.due_date}</span>
            </div>
            <div className="bdv-fact">
              <span className="lbl">Buchungsdatum</span>
              <span className="val mono">{beleg.booking_date}</span>
            </div>
            <div className="bdv-fact">
              <span className="lbl">Reverse-Charge</span>
              <span className={"bdv-flag " + (beleg.reverse_charge ? "is-on" : "")} style={{ alignSelf: "flex-start" }}>
                <span className="dot"></span>
                {beleg.reverse_charge ? "ja" : "nein"}
              </span>
            </div>
          </div>
          <div className="bdv-totals">
            <div><div className="lbl">Netto</div><div className="val">{beleg.subtotal_value} €</div></div>
            <div><div className="lbl">Steuer</div><div className="val">{beleg.tax_total_value} €</div></div>
            <div><div className="lbl">Brutto</div><div className="val is-grand">{beleg.total_value} €</div></div>
          </div>
        </div>

        <div className="bdv-c__sec">
          <div className="bdv-c__sec-h">
            <span className="small">Positionen · {beleg.positions.length}</span>
          </div>
          <div className="bdv-c__sec-body">
            <table className="bdv-tbl">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Beschreibung</th>
                  <th className="num">Menge</th>
                  <th className="num">EP</th>
                  <th className="num">USt</th>
                  <th className="num">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                {beleg.positions.map(p => (
                  <tr key={p.pos}>
                    <td className="pos">{p.pos}</td>
                    <td>
                      <div className="desc">{p.beschreibung}</div>
                      <span className={"bdv-src src-" + p.source} style={{ marginTop: 4 }}>
                        <span className="dot"></span>
                        {SOURCE_LABEL[p.source]}
                      </span>
                    </td>
                    <td className="num">{p.quantity}</td>
                    <td className="num">{p.unit_price} €</td>
                    <td className="tax num">{p.tax_rate_percent} %</td>
                    <td className="num"><strong>{p.total_price} €</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bdv-c__sec">
          <div className="bdv-c__sec-h">
            <span className="small">OCR-Markdown</span>
          </div>
          <pre className="bdv-ocr" style={{ borderTop: "none" }}>{beleg.ocr_markdown}</pre>
        </div>
      </div>

      {/* Rechte Spalte — Ludwig-Interpretation, immer sichtbar */}
      <div className="bdv-col-right">
        <div className="bdv-c__sec">
          <div className="bdv-c__sec-h">
            <span className="small">Ludwig-Analyse</span>
          </div>
          <div className="bdv-conf">
            <div className="bdv-conf__lbl">Konfidenz (gesamt)</div>
            <div className="bdv-conf__pct">{pct} %</div>
            <div className="bdv-conf__bar"><div className="bdv-conf__fill" style={{ width: pct + "%" }}></div></div>
            <div className="bdv-conf__hint">Überwiegend sicher. Eine Klärungsfrage offen.</div>
          </div>
          <div className="bdv-account">
            <div className="bdv-account__col">
              <span className="lbl">Soll</span>
              <span className="konto">{i.soll.konto}</span>
              <span className="name">{i.soll.bezeichnung}</span>
            </div>
            <div className="bdv-account__col">
              <span className="lbl">Haben</span>
              <span className="konto">{i.haben.konto}</span>
              <span className="name">{i.haben.bezeichnung}</span>
            </div>
            <div className="bdv-account__cat">
              <span className="lbl">Kategorie</span>
              <span className="val">{i.kategorie}</span>
            </div>
          </div>
          <div className="bdv-buchungstext">
            <span className="lbl">Buchungstext</span>
            <span className="val">{i.buchungstext}</span>
          </div>
        </div>

        <div className="bdv-c__sec">
          <div className="bdv-c__sec-h">
            <span className="small">Klärungsfragen · {i.klaerung.length}</span>
          </div>
          <div className="bdv-list bdv-list--klaerung" style={{ borderBottom: "none", padding: "12px 18px" }}>
            <ul>
              {i.klaerung.map((q, idx) => <li key={idx}>{q}</li>)}
            </ul>
          </div>
        </div>

        <div className="bdv-c__sec">
          <div className="bdv-c__sec-h">
            <span className="small">Review-Items · {i.review.length}</span>
          </div>
          <div className="bdv-list bdv-list--review" style={{ borderBottom: "none", padding: "12px 18px" }}>
            <ul>
              {i.review.map((r, idx) => <li key={idx}>{r}</li>)}
            </ul>
          </div>
        </div>

        <div className="bdv-c__sec">
          <div className="bdv-c__sec-h">
            <span className="small">Ludwig-Begründung</span>
          </div>
          <div className="bdv-reasoning">
            {i.reasoning}
            <div className="src">Modell: ludwig-buchung-v2.4 · 12 Vorbuchungen dieses Kreditors</div>
          </div>
        </div>
      </div>

      <BD_Actions onApprove={onBack} onReject={onBack} />
    </div>
  );
}

window.BelegDetail_A = BelegDetail_A;
window.BelegDetail_B = BelegDetail_B;
window.BelegDetail_C = BelegDetail_C;
