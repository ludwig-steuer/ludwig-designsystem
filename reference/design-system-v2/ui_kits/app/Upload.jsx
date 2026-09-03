// Ludwig — Upload Zone (idle / dragover / files+pipeline)

function UploadZone({ active, onPick, hint = "PDF, JPG, PNG, EML — bis 25 MB" }) {
  return (
    <div className={"uz" + (active ? " uz--active" : "")}>
      <div className="uz__ico">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4"/>
          <path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>
        </svg>
      </div>
      <h3 className="uz__title">{active ? "Hier loslassen" : "Belege hierher ziehen"}</h3>
      <p className="uz__sub">
        oder <a onClick={onPick}>aus Dateien wählen</a>
      </p>
      <div className="uz__hint">{hint}</div>
    </div>
  );
}

function UploadFile({ name, size, status }) {
  // status: { hash, ocr, extract, interpret } each: 'pending' | 'run' | 'ok' | 'err'
  const steps = [
    { key: "hash",      label: "Hash" },
    { key: "ocr",       label: "OCR" },
    { key: "extract",   label: "Extraktion" },
    { key: "interpret", label: "Interpretation" },
  ];
  return (
    <div className="uz-file">
      <span className="uz-file__ico">
        <svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/>
          <path d="M14 3v6h6"/>
        </svg>
      </span>
      <div>
        <div className="uz-file__name">{name}</div>
        <div className="uz-file__size">{size}</div>
      </div>
      <div className="uz-pipe">
        {steps.map((st) => {
          const s = status[st.key] || "pending";
          return (
            <span key={st.key} className={"uz-step " + (s === "pending" ? "" : s)}>
              <span className="dot" />
              {st.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function UploadFileList({ children }) {
  return <div className="uz-files">{children}</div>;
}

Object.assign(window, { UploadZone, UploadFile, UploadFileList });
