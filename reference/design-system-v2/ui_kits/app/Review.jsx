// Ludwig — Review & Audit components
// ReviewItemCard · AuditTrail · ConfidenceIndicator (re-usable)

function ConfidencePill({ level }) {
  const cls = level >= 0.85 ? "ri__pill--high" : level >= 0.6 ? "ri__pill--med" : "ri__pill--low";
  const label = level >= 0.85 ? "Hoch" : level >= 0.6 ? "Mittel" : "Niedrig";
  return <span className={"ri__pill " + cls}>{label} · {Math.round(level * 100)} %</span>;
}

function ReviewItemCard({ num, title, confidence, before, ludwig, fieldLabel, children, actions }) {
  return (
    <div className="ri">
      <div className="ri__head">
        {num && <span className="ri__num">{num}</span>}
        <span className="ri__title">{title}</span>
        {confidence != null && <ConfidencePill level={confidence} />}
      </div>
      <div className="ri__body">
        {children}
        {(before || ludwig) && (
          <div className="ri__compare">
            <div className="ri__col">
              <div className="lbl">{fieldLabel || "Bisher"}</div>
              <div className="val">{before}</div>
            </div>
            <div className="ri__col ri__col--ludwig">
              <div className="lbl">Ludwig schlägt vor</div>
              <div className="val">{ludwig}</div>
            </div>
          </div>
        )}
      </div>
      {actions && <div className="ri__actions">{actions}</div>}
    </div>
  );
}

function AuditTrail({ heading = "Verlauf", items }) {
  return (
    <div className="at">
      <div className="at__h">{heading}</div>
      <div className="at__list">
        {items.map((it, i) => (
          <div className="at__item" key={i}>
            <span className={"at__dot at__dot--" + (it.actor || "system")} />
            <div className="at__row">
              <strong>{it.who}</strong> {it.what}
              {it.field && <> <span className="field">{it.field}</span></>}
              {it.from != null && <> von <span className="field">{it.from}</span> auf <span className="field">{it.to}</span></>}
            </div>
            <div className="at__meta">{it.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ReviewItemCard, AuditTrail, ConfidencePill });
