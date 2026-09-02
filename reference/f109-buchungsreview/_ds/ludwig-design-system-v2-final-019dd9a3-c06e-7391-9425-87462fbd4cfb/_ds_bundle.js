/* @ds-bundle: {"format":4,"namespace":"LudwigDesignSystemV2Final_019dd9","components":[{"name":"Badge","sourcePath":"components/Badge.jsx"},{"name":"Button","sourcePath":"components/Button.jsx"},{"name":"ConfidenceDot","sourcePath":"components/ConfidenceDot.jsx"}],"sourceHashes":{"booking-overview/bo-app.jsx":"e019892e0c01","booking-overview/bo-core.jsx":"20d9f584d195","booking-overview/bo-icons.jsx":"dda3fcb08bae","components/Badge.jsx":"87a1e37fa482","components/Button.jsx":"abb7449f416d","components/ConfidenceDot.jsx":"33926c202d63","contract-review/app.jsx":"bc2f3745cbf3","contract-review/cards.jsx":"7e5c4b88ba44","contract-review/data.jsx":"6314344e6958","contract-review/fields.jsx":"c42b5ff192d6","contract-review/icons.jsx":"e199aeb2e0f2","contract-review/pdf.jsx":"039d5a36afcb","contract-review/tech.jsx":"9c3a178cda67","kontoauszug/ka-app.jsx":"7d349f18b567","kontoauszug/ka-data.jsx":"c9346499d1c3","kontoauszug/ka-icons.jsx":"dc1428295325","manual-booking/mb-app.jsx":"7b5f141ebe8b","manual-booking/mb-app4.jsx":"11cfe8857cff","manual-booking/mb-data.jsx":"63386f10693a","manual-booking/mb-data2.jsx":"01a6507c4259","manual-booking/mb-data3.jsx":"153107608f7b","manual-booking/mb-data4.jsx":"0d7fada799fd","manual-booking/mb-datev-edit.jsx":"b408013ad82f","manual-booking/mb-datev.jsx":"117c3c2128db","manual-booking/mb-editor.jsx":"6f521ed9ffa6","manual-booking/mb-editor3.jsx":"89d571bc65de","manual-booking/mb-editorC.jsx":"e4e9db72d300","manual-booking/mb-icons.jsx":"08a191458ef9","manual-booking/mb-money.jsx":"64712254e9ec","manual-booking/mb-position.jsx":"06b374f18df5","manual-booking/mb-proj4.jsx":"641e3d6e6e7a","manual-booking/mb2-app.jsx":"463beac053f7","manual-booking/mb3-app.jsx":"5b76f25f7aaf","sachverhalt-screen/app.jsx":"54153bf9b368","sachverhalt-screen/belegansicht.jsx":"f87ef697f1ee","sachverhalt-screen/clarifications.jsx":"6452280485ea","sachverhalt-screen/data.jsx":"9c97398a6c19","sachverhalt-screen/detail.jsx":"5a781a156092","sachverhalt-screen/editors.jsx":"7ae2b1e300a7","sachverhalt-screen/icons.jsx":"87ac7fd16224","sachverhalt-screen/layouts.jsx":"0c7c0f100cec","sachverhalt-screen/shared.jsx":"3afd02de8c98","sachverhalt-screen/vergleich.jsx":"b630cd2ed9cb","ui_kits/app/BelegInterpretation.jsx":"2743149573a5","ui_kits/app/BelegSample.jsx":"df045928dc92","ui_kits/app/BelegShared.jsx":"b095326007f7","ui_kits/app/BelegVariants.jsx":"4cc939ae92ee","ui_kits/app/Components.jsx":"05a3b878b0e1","ui_kits/app/Dashboard.jsx":"26b2687a53b6","ui_kits/app/Feedback.jsx":"dce338c39628","ui_kits/app/Flow.jsx":"063abf3e35b3","ui_kits/app/Icons.jsx":"5d814052c1b7","ui_kits/app/MandantenDetail.jsx":"8c0d183aaab3","ui_kits/app/MandantenDetailTabs.jsx":"0c65846fd4ef","ui_kits/app/MandantenDetailTabs2.jsx":"18847fe00ff0","ui_kits/app/MandantenList.jsx":"71eded7d49de","ui_kits/app/Primitives.jsx":"41c068c23de2","ui_kits/app/Review.jsx":"7738545350ae","ui_kits/app/Screens.jsx":"ad058eb9d432","ui_kits/app/Sidebar.jsx":"b0c50721dae8","ui_kits/app/Tenants.jsx":"c8e8a0396469","ui_kits/app/TopBar.jsx":"16e9e17cc3db","ui_kits/app/Upload.jsx":"505906b959cb","ui_kits/app/design-canvas.jsx":"5d0e39003628","ui_kits/auth/design-canvas.jsx":"5d0e39003628","ui_kits/auth/login-canvas.jsx":"ca02df1e9436","ui_kits/marketing/Sections.jsx":"af9fa25461af"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LudwigDesignSystemV2Final_019dd9 = window.LudwigDesignSystemV2Final_019dd9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// booking-overview/bo-app.jsx
try { (() => {
// ============================================================================
// Buchungssatz-Übersicht im Sachverhalt — Kompakt-Zeile ↔ vollständige
// Tabelle. Read-only. Umschalter je Satz + Sammel-Schalter am Listenkopf.
// Depends on bo-icons.jsx, bo-core.jsx.
// ============================================================================
const {
  useState: useStateB
} = React;
const {
  fmt,
  parseCents,
  vatSplit,
  VAT,
  ENTRIES,
  isFoldable,
  entrySum,
  entryTax,
  entryTaxKind,
  expand
} = BO;

// ---- Ampel -----------------------------------------------------------------
function Dot({
  level
}) {
  const cls = level === "review" ? "bdot bdot--review" : level === "high" ? "bdot bdot--high" : "bdot bdot--none";
  const title = level === "review" ? "Ludwig unsicher — bitte prüfen" : "Ludwig sicher";
  return /*#__PURE__*/React.createElement("span", {
    className: cls,
    title: title
  });
}
function UstBadge({
  vat
}) {
  const v = VAT[vat];
  if (!v || !v.badge) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: "ubadge"
  }, v.badge);
}

// ---- Kompakt-Zeile ---------------------------------------------------------
function CompactView({
  e
}) {
  const single = e.positions.length === 1;
  const tax = entryTax(e),
    kind = entryTaxKind(e);
  const meta = /*#__PURE__*/React.createElement("div", {
    className: "cmeta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cmeta__txt"
  }, e.text), tax > 0 && /*#__PURE__*/React.createElement("span", {
    className: "cmeta__darin"
  }, "\xB7 darin ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, fmt(tax), " \u20AC"), " ", kind), e.belegfeld && /*#__PURE__*/React.createElement("span", {
    className: "cmeta__beleg"
  }, "\xB7 Beleg ", /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, e.belegfeld)));
  if (single) {
    const p = e.positions[0];
    return /*#__PURE__*/React.createElement("div", {
      className: "compact"
    }, /*#__PURE__*/React.createElement("div", {
      className: "crow"
    }, /*#__PURE__*/React.createElement("span", {
      className: "crow__dot"
    }, /*#__PURE__*/React.createElement(Dot, {
      level: e.confidence
    })), /*#__PURE__*/React.createElement("span", {
      className: "crow__acc"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, p.acc), " ", p.name), /*#__PURE__*/React.createElement(UstBadge, {
      vat: p.vat
    }), /*#__PURE__*/React.createElement("span", {
      className: "crow__an"
    }, "an"), /*#__PURE__*/React.createElement("span", {
      className: "crow__acc crow__acc--ctr"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, e.counter.acc), " ", e.counter.name), /*#__PURE__*/React.createElement("span", {
      className: "crow__amt num"
    }, fmt(parseCents(p.gross)), " \u20AC")), meta);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "compact"
  }, e.positions.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "crow crow--pos",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "crow__dot"
  }, i === 0 ? /*#__PURE__*/React.createElement(Dot, {
    level: e.confidence
  }) : null), /*#__PURE__*/React.createElement("span", {
    className: "crow__acc"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, p.acc), " ", p.name), /*#__PURE__*/React.createElement(UstBadge, {
    vat: p.vat
  }), /*#__PURE__*/React.createElement("span", {
    className: "crow__spacer"
  }), /*#__PURE__*/React.createElement("span", {
    className: "crow__amt num"
  }, fmt(parseCents(p.gross)), " \u20AC"))), /*#__PURE__*/React.createElement("div", {
    className: "crow crow--ctr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "crow__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "crow__an"
  }, "an"), /*#__PURE__*/React.createElement("span", {
    className: "crow__acc crow__acc--ctr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, e.counter.acc), " ", e.counter.name), /*#__PURE__*/React.createElement("span", {
    className: "crow__spacer"
  }), /*#__PURE__*/React.createElement("span", {
    className: "crow__amt num"
  }, fmt(entrySum(e)), " \u20AC")), meta);
}

// ---- Vollständige Tabelle --------------------------------------------------
function TableView({
  e
}) {
  const lines = expand(e);
  let soll = 0,
    haben = 0;
  lines.forEach(l => {
    soll += l.soll || 0;
    haben += l.haben || 0;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "ftab"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Konto"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Soll"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Haben"), /*#__PURE__*/React.createElement("th", {
    className: "c"
  }, "BU"), /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Buchungstext"))), /*#__PURE__*/React.createElement("tbody", null, lines.map((l, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: (l.derived ? "is-derived " : "") + (l.counter ? "is-counter" : "")
  }, /*#__PURE__*/React.createElement("td", {
    className: "l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, l.acc), " ", /*#__PURE__*/React.createElement("span", {
    className: "ftab__nm"
  }, l.name)), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, l.soll != null ? fmt(l.soll) : ""), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, l.haben != null ? fmt(l.haben) : ""), /*#__PURE__*/React.createElement("td", {
    className: "c mono"
  }, l.bu), /*#__PURE__*/React.createElement("td", {
    className: "l mono"
  }, e.belegfeld), /*#__PURE__*/React.createElement("td", {
    className: "l ftab__txt"
  }, l.text)))), /*#__PURE__*/React.createElement("tfoot", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "l"
  }, "Summe"), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, fmt(soll)), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, fmt(haben)), /*#__PURE__*/React.createElement("td", {
    colSpan: "3"
  })))));
}

// ---- Satz-Karte ------------------------------------------------------------
function EntryCard({
  e,
  mode,
  onToggle
}) {
  const foldable = isFoldable(e);
  const compact = foldable && mode === "compact";
  return /*#__PURE__*/React.createElement("div", {
    className: "entry" + (compact ? " is-compact" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "entry__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat stat--" + e.status
  }, e.status === "posted" ? "Gebucht" : "Buchungsvorschlag"), e.origin === "ai" && /*#__PURE__*/React.createElement("span", {
    className: "kibadge"
  }, "KI-Vorschlag"), /*#__PURE__*/React.createElement("span", {
    className: "entry__date mono"
  }, e.date), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), !foldable ? /*#__PURE__*/React.createElement("span", {
    className: "entry__reason",
    title: e.reason
  }, BI.info({
    size: 13
  }), " nur Tabelle") : /*#__PURE__*/React.createElement("div", {
    className: "vtoggle",
    role: "group",
    "aria-label": "Darstellung umschalten"
  }, /*#__PURE__*/React.createElement("button", {
    className: compact ? "active" : "",
    onClick: () => onToggle(e.id, "compact"),
    title: "Kompakt-Zeile"
  }, BI.rows({
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    className: !compact ? "active" : "",
    onClick: () => onToggle(e.id, "table"),
    title: "Vollst\xE4ndige Tabelle"
  }, BI.table({
    size: 15
  })))), /*#__PURE__*/React.createElement("div", {
    className: "entry__b"
  }, compact ? /*#__PURE__*/React.createElement(CompactView, {
    e: e
  }) : /*#__PURE__*/React.createElement(TableView, {
    e: e
  })), !foldable && /*#__PURE__*/React.createElement("div", {
    className: "entry__note"
  }, e.reason));
}

// ---- Shell + Liste ---------------------------------------------------------
const TABS = ["Übersicht", "Saldo & Konten", "Buchungen", "Rückfragen", "Belege"];
function App() {
  const [modes, setModes] = useStateB(() => {
    try {
      return JSON.parse(localStorage.getItem("ludwig.bo.modes")) || {};
    } catch (x) {
      return {};
    }
  });
  const save = m => {
    setModes(m);
    localStorage.setItem("ludwig.bo.modes", JSON.stringify(m));
  };
  const setOne = (id, mode) => save({
    ...modes,
    [id]: mode
  });
  const setAll = mode => {
    const m = {};
    ENTRIES.forEach(e => {
      if (isFoldable(e)) m[e.id] = mode;
    });
    save(m);
  };
  const modeOf = e => modes[e.id] || "compact";
  const foldables = ENTRIES.filter(isFoldable);
  const allCompact = foldables.every(e => modeOf(e) === "compact");
  const allTable = foldables.every(e => modeOf(e) === "table");
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tb-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/ludwig-mark.svg",
    alt: ""
  }), " Ludwig"), /*#__PURE__*/React.createElement("span", {
    className: "tb-crumb"
  }, "Berger GmbH", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Sachverhalt 2026-0051"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "tb-search"
  }, BI.search({
    size: 15
  }), " Suchen\u2026")), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svhead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svhead__ic"
  }, BI.repeat({
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    className: "svhead__main"
  }, /*#__PURE__*/React.createElement("h1", null, "Mietverh\xE4ltnis: B\xFCro Lindenstra\xDFe"), /*#__PURE__*/React.createElement("div", {
    className: "svhead__sub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "2026-0051"), /*#__PURE__*/React.createElement("span", {
    className: "svopen"
  }, "Offen"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Immobilien Vogt KG", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Wiederkehrend", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Miete"))), /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, TABS.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "tab" + (i === 2 ? " is-active" : "")
  }, t))), /*#__PURE__*/React.createElement("div", {
    className: "listhead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listhead__t"
  }, "Buchungss\xE4tze", /*#__PURE__*/React.createElement("span", {
    className: "listhead__n"
  }, ENTRIES.length)), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "listhead__lbl"
  }, "Alle S\xE4tze"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, /*#__PURE__*/React.createElement("button", {
    className: allCompact ? "active" : "",
    onClick: () => setAll("compact")
  }, BI.rows({
    size: 14
  }), " Kompakt"), /*#__PURE__*/React.createElement("button", {
    className: allTable ? "active" : "",
    onClick: () => setAll("table")
  }, BI.table({
    size: 14
  }), " Vollst\xE4ndig"))), /*#__PURE__*/React.createElement("div", {
    className: "elist"
  }, ENTRIES.map(e => /*#__PURE__*/React.createElement(EntryCard, {
    key: e.id,
    e: e,
    mode: modeOf(e),
    onToggle: setOne
  })))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "booking-overview/bo-app.jsx", error: String((e && e.message) || e) }); }

// booking-overview/bo-core.jsx
try { (() => {
// ============================================================================
// Read-only Kern — Geld-Mathematik, USt-Sätze, Buchungssätze eines
// Sachverhalts, Rollen-Klassifikation + Expansion in DATEV-Rohzeilen.
// Dieselbe Brutto-Mathematik wie der Editor (expandGrossToExplicit).
// ============================================================================
function parseCents(s) {
  if (typeof s === "number") return Math.round(s * 100);
  if (!s) return 0;
  const n = parseFloat(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : Math.round(n * 100);
}
function fmt(cents) {
  const neg = cents < 0,
    abs = Math.abs(Math.round(cents));
  const grp = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-" : "") + grp + "," + String(abs % 100).padStart(2, "0");
}
function vatSplit(brutto, rate) {
  if (!rate) return {
    netto: brutto,
    steuer: 0
  };
  const netto = Math.round(brutto / (1 + rate / 100));
  return {
    netto,
    steuer: brutto - netto
  };
}

// USt-Sätze — Klartext + BU-Schlüssel (nie ein nacktes „9")
const VAT = {
  vst19: {
    badge: "BU 9 (19 %)",
    kind: "VSt",
    rate: 19,
    bu: "9",
    taxAcc: "1576"
  },
  vst7: {
    badge: "BU 8 (7 %)",
    kind: "VSt",
    rate: 7,
    bu: "8",
    taxAcc: "1571"
  },
  ust19: {
    badge: "BU 3 (19 %)",
    kind: "USt",
    rate: 19,
    bu: "3",
    taxAcc: "1776"
  },
  none: {
    badge: null,
    kind: null,
    rate: 0,
    bu: "",
    taxAcc: null
  }
};

// ---- Buchungssätze im Sachverhalt ------------------------------------------
// pos: { acc, name, gross, vat, text }  counter: { acc, name }
const ENTRIES = [{
  id: "b1",
  date: "11.07.2026",
  belegfeld: "202605034299",
  status: "proposal",
  origin: "ai",
  confidence: "high",
  text: "M-net Telekommunikation Juni 2026",
  positions: [{
    acc: "4920",
    name: "Telefon",
    gross: "379,49",
    vat: "vst19",
    text: "M-net Telekommunikation Juni 2026"
  }],
  counter: {
    acc: "82050",
    name: "M-net Telekommunikations GmbH"
  }
}, {
  id: "b2",
  date: "11.07.2026",
  belegfeld: "202605034300",
  status: "proposal",
  origin: "ai",
  confidence: "review",
  text: "M-net Anschluss + Internet Juni 2026",
  positions: [{
    acc: "4920",
    name: "Telefon",
    gross: "119,00",
    vat: "vst19",
    text: "Telefonanschluss"
  }, {
    acc: "4925",
    name: "Internetkosten",
    gross: "178,50",
    vat: "vst19",
    text: "Internet-Flat"
  }],
  counter: {
    acc: "82050",
    name: "M-net Telekommunikations GmbH"
  }
}, {
  id: "b3",
  date: "12.07.2026",
  belegfeld: "202605034299",
  status: "posted",
  origin: "manual",
  confidence: "high",
  text: "Zahlung M-net per Bank",
  positions: [{
    acc: "1200",
    name: "Bank (Geschäftskonto)",
    gross: "379,49",
    vat: "none",
    text: "Überweisung M-net"
  }],
  counter: {
    acc: "82050",
    name: "M-net Telekommunikations GmbH"
  }
}, {
  id: "b4",
  date: "28.02.2026",
  belegfeld: "MV-2026-02",
  status: "posted",
  origin: "ai",
  confidence: "high",
  text: "Miete Büro Lindenstraße Februar 2026",
  positions: [{
    acc: "4210",
    name: "Miete unbewegliche WG",
    gross: "2.142,00",
    vat: "vst19",
    text: "Grundmiete Februar 2026"
  }],
  counter: {
    acc: "70050",
    name: "Immobilien Vogt KG"
  }
}, {
  id: "b5",
  date: "07.07.2026",
  belegfeld: "ENG0090",
  status: "proposal",
  origin: "ai",
  confidence: "review",
  text: "Planungsleistung Umbau §13b UStG",
  foldable: false,
  reason: "§13b-Steuerzeilen (Reverse-Charge) — als vollständige Tabelle dargestellt.",
  rawLines: [{
    acc: "4909",
    name: "Fremdleistungen §13b",
    soll: "2.500,00",
    haben: "",
    bu: "94",
    text: "Planungsleistung §13b"
  }, {
    acc: "1577",
    name: "Abziehbare Vorsteuer §13b 19 %",
    soll: "475,00",
    haben: "",
    bu: "",
    text: "§13b Vorsteuer"
  }, {
    acc: "1787",
    name: "Umsatzsteuer §13b 19 %",
    soll: "",
    haben: "475,00",
    bu: "",
    text: "§13b Umsatzsteuer"
  }, {
    acc: "70090",
    name: "Northbound Studios Ltd.",
    soll: "",
    haben: "2.500,00",
    bu: "",
    text: "Planungsleistung §13b"
  }]
}];
const isFoldable = e => e.foldable !== false;
const entrySum = e => isFoldable(e) ? e.positions.reduce((s, p) => s + parseCents(p.gross), 0) : 0;
const entryTax = e => isFoldable(e) ? e.positions.reduce((s, p) => s + vatSplit(parseCents(p.gross), VAT[p.vat].rate).steuer, 0) : 0;
// „darin"-Kind: welche Steuerart (VSt/USt) dominiert (Anzeige)
function entryTaxKind(e) {
  const p = e.positions.find(p => VAT[p.vat].rate > 0);
  return p ? VAT[p.vat].kind : null;
}

// Expansion in DATEV-Rohzeilen (für die vollständige Tabelle)
function expand(e) {
  if (!isFoldable(e)) return e.rawLines.map(l => ({
    acc: l.acc,
    name: l.name,
    soll: parseCents(l.soll),
    haben: parseCents(l.haben) || null,
    bu: l.bu,
    text: l.text
  }));
  const lines = [];
  let sum = 0;
  e.positions.forEach(p => {
    const v = VAT[p.vat];
    const g = parseCents(p.gross);
    sum += g;
    const {
      netto,
      steuer
    } = vatSplit(g, v.rate);
    lines.push({
      acc: p.acc,
      name: p.name,
      soll: netto,
      haben: null,
      bu: v.rate ? v.bu : "",
      text: p.text
    });
    if (v.rate > 0) lines.push({
      acc: v.taxAcc,
      name: v.kind + " " + v.rate + " %",
      soll: steuer,
      haben: null,
      bu: "",
      text: v.kind + " " + v.rate + " %",
      derived: true
    });
  });
  lines.push({
    acc: e.counter.acc,
    name: e.counter.name,
    soll: null,
    haben: sum,
    bu: "",
    text: e.text,
    counter: true
  });
  return lines;
}
window.BO = {
  parseCents,
  fmt,
  vatSplit,
  VAT,
  ENTRIES,
  isFoldable,
  entrySum,
  entryTax,
  entryTaxKind,
  expand
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "booking-overview/bo-core.jsx", error: String((e && e.message) || e) }); }

// booking-overview/bo-icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-style Icons, 1.5 stroke — Ludwig house style.
const BoIcon = ({
  d,
  size = 18,
  sw = 1.5,
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style,
  "aria-hidden": "true"
}, d);
const BI = {
  rows: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "7",
      x2: "21",
      y2: "7"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "12",
      x2: "21",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "17",
      x2: "21",
      y2: "17"
    }))
  })),
  table: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "9",
      x2: "21",
      y2: "9"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "15",
      x2: "21",
      y2: "15"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "21"
    }))
  })),
  chevDown: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    })
  })),
  lock: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "11",
      width: "18",
      height: "11",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11V7a5 5 0 0 1 10 0v4"
    }))
  })),
  alert: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  })),
  info: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12.01",
      y2: "8"
    }))
  })),
  search: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    }))
  })),
  repeat: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "17 1 21 5 17 9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 11V9a4 4 0 0 1 4-4h14"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 23 3 19 7 15"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 13v2a4 4 0 0 1-4 4H3"
    }))
  })),
  edit: p => /*#__PURE__*/React.createElement(BoIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
    }))
  }))
};
window.BI = BI;
})(); } catch (e) { __ds_ns.__errors.push({ path: "booking-overview/bo-icons.jsx", error: String((e && e.message) || e) }); }

// components/Badge.jsx
try { (() => {
const TONE = {
  info: {
    bg: "var(--color-accent-100)",
    fg: "var(--color-accent-700)",
    bd: "#C7DFEC"
  },
  success: {
    bg: "var(--color-success-bg)",
    fg: "var(--color-success)",
    bd: "#D5E3DB"
  },
  warning: {
    bg: "var(--color-warning-bg)",
    fg: "var(--color-warning)",
    bd: "#E8DCBE"
  },
  danger: {
    bg: "var(--color-danger-bg)",
    fg: "var(--color-danger)",
    bd: "#E7CFCE"
  },
  neutral: {
    bg: "var(--color-bg-sunken)",
    fg: "var(--color-text-muted)",
    bd: "var(--color-border)"
  }
};

/** Small status pill. Tone maps to the semantic palette. */
function Badge({
  tone = "neutral",
  children,
  style,
  ...rest
}) {
  const t = TONE[tone] || TONE.neutral;
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-sans)",
      fontSize: 11.5,
      fontWeight: 500,
      lineHeight: 1.4,
      padding: "3px 9px",
      borderRadius: "var(--radius-pill)",
      background: t.bg,
      color: t.fg,
      border: "1px solid " + t.bd,
      ...style
    },
    ...rest
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Badge.jsx", error: String((e && e.message) || e) }); }

// components/Button.jsx
try { (() => {
const T = {
  primary: {
    bg: "var(--color-primary)",
    fg: "#fff",
    bd: "transparent"
  },
  secondary: {
    bg: "#fff",
    fg: "var(--color-primary)",
    bd: "var(--color-border-strong)"
  },
  tertiary: {
    bg: "transparent",
    fg: "var(--color-accent-700)",
    bd: "transparent"
  }
};

/** Ludwig primary action button. Flat at rest, subtle shadow on hover (primary). */
function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  ...rest
}) {
  const t = T[variant] || T.primary;
  const pad = size === "sm" ? "8px 15px" : "9px 16px";
  const fs = size === "sm" ? 13 : 14;
  return React.createElement("button", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      fontSize: fs,
      padding: pad,
      lineHeight: 1,
      whiteSpace: "nowrap",
      borderRadius: "var(--radius-lg)",
      border: "1px solid " + t.bd,
      background: t.bg,
      color: t.fg,
      cursor: "pointer",
      boxShadow: variant === "primary" ? "var(--shadow-xs)" : "none",
      transition: "background .12s, box-shadow .18s, border-color .12s",
      ...style
    },
    ...rest
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button.jsx", error: String((e && e.message) || e) }); }

// components/ConfidenceDot.jsx
try { (() => {
const LEVELS = {
  high: {
    color: "var(--color-success)",
    ring: "var(--color-success-bg)",
    title: "Ludwig sicher"
  },
  review: {
    color: "var(--color-warning)",
    ring: "var(--color-warning-bg)",
    title: "Ludwig unsicher — bitte prüfen"
  },
  none: {
    color: "var(--color-border-strong)",
    ring: "transparent",
    title: "Neu / ohne Bewertung"
  }
};

/** Confidence traffic-light dot — the per-item „Ampel" used across review UIs. */
function ConfidenceDot({
  level = "none",
  size = 9,
  style,
  ...rest
}) {
  const l = LEVELS[level] || LEVELS.none;
  return React.createElement("span", {
    title: l.title,
    style: {
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: 999,
      background: l.color,
      boxShadow: "0 0 0 3px " + l.ring,
      ...style
    },
    ...rest
  });
}
Object.assign(__ds_scope, { ConfidenceDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ConfidenceDot.jsx", error: String((e && e.message) || e) }); }

// contract-review/app.jsx
try { (() => {
// ============================================================================
// Vertragsreview — Seiten-Shell, Zustands-Schalter, State-Wiring.
// Depends on icons.jsx + data.jsx + fields.jsx + pdf.jsx + cards.jsx.
// ============================================================================
const {
  useState: useStateA,
  useEffect: useEffectA
} = React;

// ---- Varianten-Daten -------------------------------------------------------
function lowConfFields() {
  // „Niedrige Confidence überall" — alles unsicher, aber ruhig dargestellt
  const conf = {
    typ: 61,
    gegenstand: 55,
    start: 68,
    laufzeit: 49,
    ende: 44,
    unbefristet: 58,
    betrag: 64,
    summary: 52
  };
  return normalFields().map(f => ({
    ...f,
    source: "ai",
    confidence: conf[f.key] != null ? conf[f.key] : 55
  }));
}
function lowConfFacts() {
  return normalFacts().map(f => ({
    ...f,
    source: "ai",
    confidence: Math.min(f.confidence || 60, 62)
  }));
}
function approvedFields() {
  return normalFields().map(f => ({
    ...f,
    source: "manual",
    confidence: null
  }));
}
function approvedFacts() {
  return normalFacts().map(f => ({
    ...f,
    source: "manual",
    confidence: null
  }));
}
function answeredClars() {
  return normalClarifications().map(c => ({
    ...c,
    answered: true,
    answer: c.severity === "required" ? "Ja" : "im PDF geprüft"
  }));
}
const VARIANTS = [{
  id: "normal",
  label: "Normal"
}, {
  id: "niedrig",
  label: "Niedrige Confidence"
}, {
  id: "nurPdf",
  label: "Nur PDF"
}, {
  id: "failed",
  label: "Extraktion fehlgeschlagen"
}, {
  id: "freigegeben",
  label: "Freigegeben"
}];

// ---- Review-Spalte (hält den editierbaren Zustand) -------------------------
function ReviewColumn({
  variant,
  setVariant,
  onOpenTech
}) {
  const init = () => {
    if (variant === "niedrig") return {
      fields: lowConfFields(),
      facts: lowConfFacts(),
      clars: normalClarifications()
    };
    if (variant === "freigegeben") return {
      fields: approvedFields(),
      facts: approvedFacts(),
      clars: answeredClars()
    };
    return {
      fields: normalFields(),
      facts: normalFacts(),
      clars: normalClarifications()
    };
  };
  const seed = init();
  const [fields, setFields] = useStateA(seed.fields);
  const [facts, setFacts] = useStateA(seed.facts);
  const [clars, setClars] = useStateA(seed.clars);
  const [editingKey, setEditingKey] = useStateA(null);
  const [savedKey, setSavedKey] = useStateA(null);
  const [editingFact, setEditingFact] = useStateA(null);
  const [savedFact, setSavedFact] = useStateA(null);
  const flash = (setter, key, clearer) => {
    setter(key);
    setTimeout(() => clearer(null), 900);
  };

  // Felder
  const onEdit = k => setEditingKey(k);
  const onCancel = () => setEditingKey(null);
  const onSave = (k, patch) => {
    setFields(fs => fs.map(f => f.key === k ? {
      ...f,
      value: f.type === "bool" ? !!patch.value : patch.value,
      currency: patch.currency || f.currency,
      source: "manual",
      confidence: null
    } : f));
    setEditingKey(null);
    flash(setSavedKey, k, setSavedKey);
  };
  const onConfirm = k => {
    setFields(fs => fs.map(f => f.key === k ? {
      ...f,
      source: "manual",
      confidence: null
    } : f));
    flash(setSavedKey, k, setSavedKey);
  };
  const onConfirmAll = () => setFields(fs => fs.map(f => f.source === "ai" || f.source === "missing" ? {
    ...f,
    source: "manual",
    confidence: null
  } : f));

  // Fakten
  const onEditFact = id => setEditingFact(id);
  const onCancelFact = () => setEditingFact(null);
  const onSaveFact = (id, patch) => {
    setFacts(fs => fs.map(f => f.id === id ? {
      ...f,
      k: patch.k,
      v: patch.v,
      source: "manual",
      confidence: null
    } : f));
    setEditingFact(null);
    flash(setSavedFact, id, setSavedFact);
  };
  const onDeleteFact = id => setFacts(fs => fs.filter(f => f.id !== id));
  const onAddFact = (k, v) => {
    const id = "m" + Date.now();
    setFacts(fs => [...fs, {
      id,
      k,
      v,
      source: "manual"
    }]);
    flash(setSavedFact, id, setSavedFact);
  };

  // Klärungen
  const onAnswer = (id, answer) => setClars(cs => cs.map(c => c.id === id ? {
    ...c,
    answered: true,
    answer
  } : c));
  const techBar = /*#__PURE__*/React.createElement("div", {
    className: "ractions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm techbtn",
    onClick: onOpenTech
  }, I.code({
    size: 15
  }), " Technische Details"));

  // ---- alternative Spalten-Zustände ----
  if (variant === "nurPdf") {
    return /*#__PURE__*/React.createElement("div", {
      className: "review"
    }, /*#__PURE__*/React.createElement(Xref, null), /*#__PURE__*/React.createElement(NurPdfPanel, {
      onExtract: () => setVariant("extracting")
    }), techBar);
  }
  if (variant === "extracting") {
    return /*#__PURE__*/React.createElement("div", {
      className: "review"
    }, /*#__PURE__*/React.createElement(Xref, null), /*#__PURE__*/React.createElement(ExtractingPanel, null), techBar);
  }
  if (variant === "failed") {
    return /*#__PURE__*/React.createElement("div", {
      className: "review"
    }, /*#__PURE__*/React.createElement(Xref, null), /*#__PURE__*/React.createElement(FailedPanel, {
      onRetry: () => setVariant("extracting")
    }), techBar);
  }
  const freigegeben = variant === "freigegeben";
  const fieldsTodo = fields.filter(f => !isReviewed(f)).length;
  const clarsTodo = clars.filter(c => !c.answered && c.severity === "required").length;
  const allClear = fieldsTodo === 0 && clarsTodo === 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "review"
  }, /*#__PURE__*/React.createElement(Xref, null), variant === "niedrig" && !allClear && /*#__PURE__*/React.createElement("div", {
    className: "lead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.alert({
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lead__t"
  }, "Ludwig war bei diesem Vertrag durchgehend unsicher"), /*#__PURE__*/React.createElement("div", {
    className: "lead__s"
  }, "Bitte gleichen Sie die markierten Felder mit dem PDF ab. Jede Best\xE4tigung oder Korrektur markiert das Feld als gepr\xFCft."))), freigegeben && /*#__PURE__*/React.createElement(DoneCard, null), /*#__PURE__*/React.createElement(VertragsdatenCard, {
    fields: fields,
    editingKey: editingKey,
    justSavedKey: savedKey,
    onEdit: onEdit,
    onSave: onSave,
    onCancel: onCancel,
    onConfirm: onConfirm,
    onConfirmAll: onConfirmAll
  }), /*#__PURE__*/React.createElement(FaktenCard, {
    facts: facts,
    editingId: editingFact,
    justSavedId: savedFact,
    onEdit: onEditFact,
    onSave: onSaveFact,
    onCancel: onCancelFact,
    onDelete: onDeleteFact,
    onAdd: onAddFact
  }), clars.length > 0 && /*#__PURE__*/React.createElement(KlaerungenCard, {
    clars: clars,
    onAnswer: onAnswer
  }), !freigegeben && /*#__PURE__*/React.createElement("div", {
    className: "ractions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm techbtn",
    onClick: onOpenTech
  }, I.code({
    size: 15
  }), " Technische Details"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ractions__hint"
  }, allClear ? "Alles geprüft — bereit zur Freigabe." : fieldsTodo + clarsTodo + " offene Punkt" + (fieldsTodo + clarsTodo === 1 ? "" : "e")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm"
  }, I.x({
    size: 15
  }), " Ablehnen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    disabled: !allClear,
    title: allClear ? "" : "Erst offene Punkte prüfen",
    onClick: () => setVariant("freigegeben")
  }, I.check({
    size: 16
  }), " Freigeben")), freigegeben && /*#__PURE__*/React.createElement("div", {
    className: "ractions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm techbtn",
    onClick: onOpenTech
  }, I.code({
    size: 15
  }), " Technische Details"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => setVariant("normal")
  }, I.edit({
    size: 14
  }), " Erneut pr\xFCfen")));
}
function Xref() {
  return /*#__PURE__*/React.createElement("div", {
    className: "xref"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.link({
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "xref__t"
  }, "Geh\xF6rt zu Sachverhalt ", /*#__PURE__*/React.createElement("b", null, "2026-0051 \xB7 Mietverh\xE4ltnis Lindenstra\xDFe")), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Zum Sachverhalt ", I.arrowRight({
    size: 14
  })));
}

// ---- Kopfzeilen-Status -----------------------------------------------------
function HeadStatus({
  variant
}) {
  if (variant === "freigegeben") return /*#__PURE__*/React.createElement("span", {
    className: "status-chip status-chip--done"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tick"
  }, I.check({
    size: 14
  })), "Gepr\xFCft & freigegeben");
  if (variant === "failed") return /*#__PURE__*/React.createElement("span", {
    className: "status-chip status-chip--failed"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tick"
  }, I.alert({
    size: 13
  })), "Extraktion fehlgeschlagen");
  if (variant === "nurPdf" || variant === "extracting") return /*#__PURE__*/React.createElement("span", {
    className: "status-chip status-chip--open"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tick"
  }, I.clock({
    size: 13
  })), "Noch nicht ausgelesen");
  return /*#__PURE__*/React.createElement("span", {
    className: "status-chip status-chip--open"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tick"
  }, I.clock({
    size: 13
  })), "Pr\xFCfung offen");
}

// ---- App-Schiene -----------------------------------------------------------
function Rail() {
  return /*#__PURE__*/React.createElement("div", {
    className: "rail"
  }, /*#__PURE__*/React.createElement("img", {
    className: "rail__mark",
    src: "assets/ludwig-mark.svg",
    alt: "Ludwig"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rail__nav"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rail__ic",
    title: "Posteingang"
  }, I.bell({
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    className: "rail__ic",
    title: "Belege"
  }, I.receipt({
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    className: "rail__ic active",
    title: "Vertr\xE4ge"
  }, I.contract({
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    className: "rail__ic",
    title: "Sachverhalte"
  }, I.layers({
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    className: "rail__ic",
    title: "Kl\xE4rungen"
  }, I.help({
    size: 19
  }))), /*#__PURE__*/React.createElement("span", {
    className: "rail__sp"
  }), /*#__PURE__*/React.createElement("span", {
    className: "rail__ic",
    title: "Suche"
  }, I.search({
    size: 19
  })));
}

// ---- App -------------------------------------------------------------------
function App() {
  const [variant, setVariantRaw] = useStateA(() => localStorage.getItem("ludwig.cr.variant") || "normal");
  const [techOpen, setTechOpen] = useStateA(false);
  const setVariant = v => {
    setVariantRaw(v);
    if (v !== "extracting") localStorage.setItem("ludwig.cr.variant", v);
  };

  // Auto-Übergang: extracting → normal
  useEffectA(() => {
    if (variant === "extracting") {
      const t = setTimeout(() => setVariant("normal"), 2100);
      return () => clearTimeout(t);
    }
  }, [variant]);
  const switchVariant = variant === "extracting" ? "nurPdf" : variant;
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(Rail, null), /*#__PURE__*/React.createElement("div", {
    className: "work"
  }, /*#__PURE__*/React.createElement("header", {
    className: "phead",
    "data-screen-label": "Vertragsreview"
  }, /*#__PURE__*/React.createElement("a", {
    className: "phead__back",
    href: "#"
  }, I.chevLeft({
    size: 16
  }), " Zur\xFCck"), /*#__PURE__*/React.createElement("div", {
    className: "phead__titl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "phead__eyebrow"
  }, "Vertrag"), /*#__PURE__*/React.createElement("span", {
    className: "phead__h"
  }, "B\xFCromiete Burgauerstra\xDFe 12")), /*#__PURE__*/React.createElement("span", {
    className: "phead__sp"
  }), /*#__PURE__*/React.createElement("div", {
    className: "phead__status"
  }, /*#__PURE__*/React.createElement(HeadStatus, {
    variant: variant
  }))), /*#__PURE__*/React.createElement("div", {
    className: "demobar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "demobar__lbl"
  }, "Zustand (Demo)"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, VARIANTS.map(v => /*#__PURE__*/React.createElement("button", {
    key: v.id,
    className: switchVariant === v.id ? "active" : "",
    onClick: () => setVariant(v.id)
  }, v.label)))), /*#__PURE__*/React.createElement("div", {
    className: "ws"
  }, /*#__PURE__*/React.createElement(PdfColumn, {
    doc: CONTRACT_DOC
  }), /*#__PURE__*/React.createElement(ReviewColumn, {
    key: variant,
    variant: variant,
    setVariant: setVariant,
    onOpenTech: () => setTechOpen(true)
  }))), /*#__PURE__*/React.createElement(TechDrawer, {
    open: techOpen,
    variant: variant,
    onClose: () => setTechOpen(false)
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "contract-review/app.jsx", error: String((e && e.message) || e) }); }

// contract-review/cards.jsx
try { (() => {
// ============================================================================
// Review-Karten: Vertragsdaten · Buchungsrelevante Fakten · Klärungsfragen
// + alternative Spalten-Zustände (Nur-PDF, Fehlgeschlagen, Freigegeben).
// Depends on icons.jsx + fields.jsx (VField, ProvMark, fieldState, isReviewed).
// ============================================================================
const {
  useState: useStateC
} = React;

// ---- Kartenkopf-Fortschritt ------------------------------------------------
function CardProgress({
  fields
}) {
  const total = fields.length;
  const reviewed = fields.filter(isReviewed).length;
  const todo = total - reviewed;
  const pct = total ? Math.round(reviewed / total * 100) : 100;
  return /*#__PURE__*/React.createElement("div", {
    className: "rprog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rprog__meter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rprog__fill",
    style: {
      width: pct + "%"
    }
  })), todo > 0 ? /*#__PURE__*/React.createElement("span", {
    className: "rprog__txt warn"
  }, todo, " ", todo === 1 ? "Feld" : "Felder", " zu pr\xFCfen") : /*#__PURE__*/React.createElement("span", {
    className: "rprog__txt ok"
  }, I.check({
    size: 14
  }), " alle gepr\xFCft"));
}

// ---- Karte: Vertragsdaten --------------------------------------------------
function VertragsdatenCard({
  fields,
  editingKey,
  justSavedKey,
  onEdit,
  onSave,
  onCancel,
  onConfirm,
  onConfirmAll
}) {
  const remaining = fields.filter(f => !isReviewed(f)).length;
  let laufzeitDone = false;
  return /*#__PURE__*/React.createElement("div", {
    className: "rcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rcard__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.contract({
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, "Vertragsdaten"), /*#__PURE__*/React.createElement("span", {
    className: "rcard__sp"
  }), remaining > 0 && /*#__PURE__*/React.createElement("button", {
    className: "rcard__edit",
    onClick: onConfirmAll,
    title: "\xDCbrige KI-Felder als gepr\xFCft best\xE4tigen"
  }, I.check({
    size: 13
  }), " \xDCbrige best\xE4tigen")), /*#__PURE__*/React.createElement(CardProgress, {
    fields: fields
  }), /*#__PURE__*/React.createElement("div", null, fields.map(f => {
    const head = f.group === "laufzeit" && !laufzeitDone ? (laufzeitDone = true, true) : false;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: f.key
    }, head && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "9px 18px 3px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        color: "var(--color-text-subtle)",
        fontWeight: 600
      }
    }, "Laufzeit"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: "var(--color-border-subtle)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        color: "var(--color-text-subtle)"
      },
      title: "Start, Laufzeit und Ende h\xE4ngen zusammen \u2014 zwei gen\xFCgen."
    }, "Start \xB7 Dauer \xB7 Ende h\xE4ngen zusammen")), /*#__PURE__*/React.createElement(VField, {
      f: f,
      editing: editingKey === f.key,
      justSaved: justSavedKey === f.key,
      onEdit: onEdit,
      onSave: onSave,
      onCancel: onCancel,
      onConfirm: onConfirm
    }));
  })), /*#__PURE__*/React.createElement("div", {
    className: "legend"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend__sw",
    style: {
      background: "var(--color-warning)"
    }
  }), "KI unsicher \u2014 pr\xFCfen"), /*#__PURE__*/React.createElement("span", {
    className: "legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend__sw",
    style: {
      background: "var(--color-accent)"
    }
  }), "vom Menschen gepr\xFCft"), /*#__PURE__*/React.createElement("span", {
    className: "legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend__sw",
    style: {
      background: "repeating-linear-gradient(180deg,var(--color-border-strong) 0 3px,transparent 3px 6px)"
    }
  }), "fehlt")));
}

// ---- Fakten-Zeile ----------------------------------------------------------
function FactRow({
  f,
  editing,
  justSaved,
  onEdit,
  onSave,
  onCancel,
  onDelete
}) {
  const s = fieldState({
    source: f.source,
    confidence: f.confidence,
    value: f.v
  });
  const [k, setK] = useStateC(f.k);
  const [v, setV] = useStateC(f.v);
  if (editing) {
    return /*#__PURE__*/React.createElement("div", {
      className: "fact is-editing",
      style: {
        display: "block",
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "fact-add__form"
    }, /*#__PURE__*/React.createElement("input", {
      className: "vinp mono",
      value: k,
      onChange: e => setK(e.target.value),
      placeholder: "schl\xFCssel"
    }), /*#__PURE__*/React.createElement("input", {
      className: "vinp",
      value: v,
      onChange: e => setV(e.target.value),
      placeholder: "Wert",
      onKeyDown: e => {
        if (e.key === "Enter") onSave(f.id, {
          k,
          v
        });
        if (e.key === "Escape") onCancel();
      },
      autoFocus: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "vedit__act"
    }, /*#__PURE__*/React.createElement("span", {
      className: "vedit__note"
    }, f.source === "ai" ? "Korrektur markiert den Fakt als geprüft" : "Enter speichern · Esc abbrechen"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-tertiary btn-sm",
      onClick: onCancel
    }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => onSave(f.id, {
        k,
        v
      })
    }, I.check({
      size: 14
    }), " Speichern"))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "fact is-" + s + (justSaved ? " just-saved" : ""),
    onClick: () => onEdit(f.id),
    style: {
      cursor: "text"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fact__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fact__k"
  }, f.k), /*#__PURE__*/React.createElement("span", {
    className: "fact__v"
  }, f.v)), /*#__PURE__*/React.createElement("div", {
    className: "fact__right"
  }, /*#__PURE__*/React.createElement(ProvMark, {
    f: {
      source: f.source,
      confidence: f.confidence,
      value: f.v
    }
  }), f.source === "manual" && /*#__PURE__*/React.createElement("button", {
    className: "fact__del",
    title: "Fakt entfernen",
    onClick: e => {
      e.stopPropagation();
      onDelete(f.id);
    }
  }, I.x({
    size: 14
  }))));
}

// ---- Karte: Buchungsrelevante Fakten ---------------------------------------
function FaktenCard({
  facts,
  editingId,
  justSavedId,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAdd
}) {
  const [adding, setAdding] = useStateC(false);
  const [nk, setNk] = useStateC("");
  const [nv, setNv] = useStateC("");
  const aiCount = facts.filter(f => f.source === "ai").length;
  const submit = () => {
    if (nk.trim() && nv.trim()) {
      onAdd(nk.trim(), nv.trim());
      setNk("");
      setNv("");
      setAdding(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "rcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rcard__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.layers({
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, "Buchungsrelevante Fakten"), /*#__PURE__*/React.createElement("span", {
    className: "rcard__sp"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--color-text-subtle)"
    }
  }, aiCount, " von KI \xB7 ", facts.length - aiCount, " manuell")), /*#__PURE__*/React.createElement("div", null, facts.map(f => /*#__PURE__*/React.createElement(FactRow, {
    key: f.id,
    f: f,
    editing: editingId === f.id,
    justSaved: justSavedId === f.id,
    onEdit: onEdit,
    onSave: onSave,
    onCancel: onCancel,
    onDelete: onDelete
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fact-add"
  }, adding ? /*#__PURE__*/React.createElement("div", {
    className: "fact-add__form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("input", {
    className: "vinp mono",
    style: {
      flex: 1
    },
    value: nk,
    onChange: e => setNk(e.target.value),
    placeholder: "schl\xFCssel (z. B. stellplatzmiete)",
    autoFocus: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "vinp",
    style: {
      flex: 1
    },
    value: nv,
    onChange: e => setNv(e.target.value),
    placeholder: "Wert (z. B. 80,00 EUR)",
    onKeyDown: e => {
      if (e.key === "Enter") submit();
      if (e.key === "Escape") setAdding(false);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "vedit__act"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    onClick: () => setAdding(false)
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: submit
  }, "Hinzuf\xFCgen"))) : /*#__PURE__*/React.createElement("button", {
    className: "fact-add__btn",
    onClick: () => setAdding(true)
  }, "+ Fakt manuell erg\xE4nzen")));
}

// ---- Karte: Klärungsfragen -------------------------------------------------
function KlaerungenCard({
  clars,
  onAnswer
}) {
  const open = clars.filter(c => !c.answered);
  const req = open.filter(c => c.severity === "required").length;
  return /*#__PURE__*/React.createElement("div", {
    className: "rcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rcard__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic",
    style: {
      color: req ? "var(--color-warning)" : "var(--color-text-subtle)"
    }
  }, I.help({
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, "Kl\xE4rungsfragen"), /*#__PURE__*/React.createElement("span", {
    className: "rcard__sp"
  }), req > 0 ? /*#__PURE__*/React.createElement("span", {
    className: "bdg bdg-warning"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--color-warning)"
    }
  }), req, " erforderlich") : /*#__PURE__*/React.createElement("span", {
    className: "bdg bdg-success"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--color-success)"
    }
  }), "gekl\xE4rt")), /*#__PURE__*/React.createElement("div", null, clars.map(c => /*#__PURE__*/React.createElement("div", {
    className: "clar" + (c.answered ? " answered" : ""),
    key: c.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "clar__sev"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sev-pill sev-pill--" + c.severity
  }, c.severity === "required" ? "erforderlich" : "optional")), /*#__PURE__*/React.createElement("div", {
    className: "clar__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "clar__q"
  }, c.q), c.answered ? /*#__PURE__*/React.createElement("div", {
    className: "clar__answered"
  }, I.check({
    size: 14
  }), " beantwortet: ", c.answer) : /*#__PURE__*/React.createElement("div", {
    className: "clar__act"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-xs",
    onClick: () => onAnswer(c.id, "Ja")
  }, "Ja, best\xE4tigt"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-xs",
    onClick: () => onAnswer(c.id, "Nein")
  }, "Nein"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-xs",
    onClick: () => onAnswer(c.id, "im PDF geprüft")
  }, "Im PDF gepr\xFCft")))))));
}

// ---- Alternative Zustände der Review-Spalte --------------------------------
function NurPdfPanel({
  onExtract
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rstate"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rstate__ic rstate__ic--neutral"
  }, I.layers({
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    className: "rstate__t"
  }, "Noch nicht ausgelesen"), /*#__PURE__*/React.createElement("div", {
    className: "rstate__s"
  }, "Der Vertrag ist erkannt und liegt als PDF vor. Ludwig hat die strukturierten Daten noch nicht extrahiert."), /*#__PURE__*/React.createElement("div", {
    className: "rstate__act"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: onExtract
  }, I.layers({
    size: 15
  }), " Daten jetzt auslesen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, "Manuell erfassen")));
}
function ExtractingPanel() {
  return /*#__PURE__*/React.createElement("div", {
    className: "rstate"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rstate__ic rstate__ic--neutral"
  }, I.clock({
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    className: "rstate__t"
  }, "Ludwig liest den Vertrag aus \u2026"), /*#__PURE__*/React.createElement("div", {
    className: "rstate__skel",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
    className: "rstate__s"
  }, "Vertragsdaten und buchungsrelevante Fakten werden extrahiert. Das dauert nur einen Moment."));
}
function FailedPanel({
  onRetry
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rstate"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rstate__ic rstate__ic--fail"
  }, I.alert({
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    className: "rstate__t"
  }, "Extraktion nicht m\xF6glich"), /*#__PURE__*/React.createElement("div", {
    className: "rstate__s"
  }, "Ludwig konnte aus diesem PDF keine Vertragsdaten auslesen \u2014 die Vorlage ist vermutlich gescannt oder unvollst\xE4ndig. Sie k\xF6nnen die Extraktion erneut ansto\xDFen oder die Daten manuell erfassen."), /*#__PURE__*/React.createElement("div", {
    className: "rstate__act"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: onRetry
  }, I.repeat({
    size: 15
  }), " Erneut versuchen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, "Manuell erfassen")));
}
function DoneCard() {
  return /*#__PURE__*/React.createElement("div", {
    className: "donecard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "donecard__ic"
  }, I.check({
    size: 22
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "donecard__t"
  }, "Vertrag gepr\xFCft und freigegeben"), /*#__PURE__*/React.createElement("div", {
    className: "donecard__s"
  }, "Alle Vertragsdaten und buchungsrelevanten Fakten sind best\xE4tigt. Die gepr\xFCften Daten stehen f\xFCr Buchung und Sachverhalt bereit."), /*#__PURE__*/React.createElement("div", {
    className: "donecard__meta"
  }, "Freigegeben von Frau Berger \xB7 17.06.2026, 10:42")));
}
Object.assign(window, {
  CardProgress,
  VertragsdatenCard,
  FactRow,
  FaktenCard,
  KlaerungenCard,
  NurPdfPanel,
  ExtractingPanel,
  FailedPanel,
  DoneCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "contract-review/cards.jsx", error: String((e && e.message) || e) }); }

// contract-review/data.jsx
try { (() => {
// ============================================================================
// Vertragsreview — Datenmodell.
// Ein Vertrag (Büromiete) mit Vertragsdaten-Feldern, buchungsrelevanten
// Fakten und Klärungsfragen. Jedes ausgelesene Feld trägt eine Herkunft
// (Provenance): "ai" mit Confidence 0–100, "manual" (vom Menschen) oder
// "missing" (Lücke).
// ============================================================================

// Feste Auswahl für den buchhalterischen Typ
const VERTRAGSTYPEN = ["Darlehen", "Miete", "Leasing", "Dauerrechnung", "Dienstleistung", "Sonstiges"];

// ---- Vertragsdaten-Felder (Normalfall) -------------------------------------
// type: select | text | date | months | bool | amount | textarea
function normalFields() {
  return [{
    key: "typ",
    label: "Typ (buchhalterisch)",
    type: "select",
    options: VERTRAGSTYPEN,
    value: "Miete",
    source: "ai",
    confidence: 94
  }, {
    key: "gegenstand",
    label: "Vertragsgegenstand",
    type: "text",
    value: "Büromiete Burgauerstraße 12",
    source: "ai",
    confidence: 88
  }, {
    key: "start",
    label: "Startdatum",
    type: "date",
    group: "laufzeit",
    value: "01.02.2025",
    source: "ai",
    confidence: 96
  }, {
    key: "laufzeit",
    label: "Laufzeit",
    type: "months",
    group: "laufzeit",
    value: "24",
    source: "ai",
    confidence: 71
  }, {
    key: "ende",
    label: "Enddatum",
    type: "date",
    group: "laufzeit",
    derived: true,
    value: "31.01.2027",
    source: "ai",
    confidence: 58
  }, {
    key: "unbefristet",
    label: "Unbefristet",
    type: "bool",
    value: false,
    source: "ai",
    confidence: 90
  }, {
    key: "betrag",
    label: "Primärbetrag",
    type: "amount",
    currency: "EUR",
    hint: "Monatsrate",
    value: "1.800,00",
    source: "ai",
    confidence: 92
  }, {
    key: "summary",
    label: "Zusammenfassung",
    type: "textarea",
    value: "Gewerblicher Mietvertrag über Büroräume in der Burgauerstraße 12. Feste Laufzeit von 24 Monaten ab Februar 2025, monatliche Bruttomiete 1.800,00 EUR inkl. Nebenkostenvorauszahlung. Kündigungsfrist drei Monate zum Quartalsende.",
    source: "ai",
    confidence: 83
  }];
}

// ---- Buchungsrelevante Fakten ----------------------------------------------
// kind: "ai" (read-only bis editiert) | "manual"
function normalFacts() {
  return [{
    id: "f1",
    k: "monatliche_grundmiete",
    v: "1.450,00 EUR",
    source: "ai",
    confidence: 89
  }, {
    id: "f2",
    k: "nebenkostenvorauszahlung",
    v: "350,00 EUR",
    source: "ai",
    confidence: 76
  }, {
    id: "f3",
    k: "kaution",
    v: "3.600,00 EUR",
    source: "ai",
    confidence: 64
  }, {
    id: "f4",
    k: "kuendigungsfrist",
    v: "3 Monate zum Quartalsende",
    source: "ai",
    confidence: 81
  }, {
    id: "f5",
    k: "umsatzsteuer_option",
    v: "ja (§ 9 UStG)",
    source: "manual"
  }];
}

// ---- Klärungsfragen --------------------------------------------------------
function normalClarifications() {
  return [{
    id: "c1",
    severity: "required",
    q: "Ist die Option zur Umsatzsteuerpflicht (§ 9 UStG) im Vertrag tatsächlich vereinbart? Im PDF nicht eindeutig auffindbar.",
    answered: false
  }, {
    id: "c2",
    severity: "optional",
    q: "Enthält die Grundmiete bereits die Stellplatzmiete oder wird diese separat berechnet?",
    answered: false
  }];
}

// ---- Vertrags-PDF (Dokument-Vorschau) --------------------------------------
const CONTRACT_DOC = {
  vendor: "Burgauer Immobilienverwaltung GmbH",
  vendorRole: "Vermieterin",
  vendorAddr: "Burgauerstraße 12 · 81369 München",
  vendorUst: "DE 287 990 145",
  tenant: "Mandant Muster GmbH · Sendlinger Straße 4 · 80331 München",
  title: "Gewerbemietvertrag",
  subject: "Büroräume Burgauerstraße 12, 1. OG",
  signedAt: "München, 24.01.2025",
  sections: [{
    n: "§ 1",
    t: "Mietgegenstand",
    body: "Vermietet werden die im 1. Obergeschoss gelegenen Büroräume des Anwesens Burgauerstraße 12, 81369 München, bestehend aus vier Büroräumen, einer Teeküche sowie anteiligen Sanitärräumen mit einer Gesamtfläche von rund 142 m². Mitvermietet ist ein Tiefgaragenstellplatz Nr. 14."
  }, {
    n: "§ 2",
    t: "Mietzeit",
    body: "Das Mietverhältnis beginnt am 01.02.2025 und wird auf bestimmte Zeit von 24 Monaten geschlossen. Es endet, ohne dass es einer Kündigung bedarf, am 31.01.2027. Eine Verlängerung um jeweils zwölf Monate ist möglich, sofern nicht drei Monate vor Ablauf schriftlich widersprochen wird."
  }, {
    n: "§ 3",
    t: "Miete und Nebenkosten",
    body: "Die monatliche Grundmiete beträgt 1.450,00 EUR. Daneben ist eine Nebenkostenvorauszahlung von 350,00 EUR monatlich zu entrichten. Die Gesamtmiete von 1.800,00 EUR ist monatlich im Voraus, spätestens zum dritten Werktag eines Monats, kostenfrei auf das Konto der Vermieterin zu zahlen."
  }, {
    n: "§ 4",
    t: "Umsatzsteuer",
    body: "Die Vermieterin verzichtet gemäß § 9 UStG auf die Steuerbefreiung und optiert zur Umsatzsteuerpflicht, soweit der Mieter die Räume ausschließlich für vorsteuerabzugsberechtigte Umsätze nutzt. Die jeweils gültige Umsatzsteuer wird gesondert ausgewiesen."
  }, {
    n: "§ 5",
    t: "Kaution",
    body: "Der Mieter leistet vor Übergabe eine Barkaution in Höhe von 3.600,00 EUR (zwei Bruttomonatsmieten). Die Kaution wird von der Vermieterin getrennt vom übrigen Vermögen angelegt und nach Beendigung des Mietverhältnisses abgerechnet."
  }, {
    n: "§ 6",
    t: "Kündigung",
    body: "Die ordentliche Kündigung ist unter Einhaltung einer Frist von drei Monaten zum Quartalsende zulässig. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt."
  }, {
    n: "§ 7",
    t: "Schönheitsreparaturen",
    body: "Schönheitsreparaturen werden vom Mieter in angemessenen Zeitabständen fachgerecht ausgeführt. Bei Auszug ist der Mietgegenstand in besenreinem Zustand zu übergeben."
  }]
};
window.VERTRAGSTYPEN = VERTRAGSTYPEN;
window.normalFields = normalFields;
window.normalFacts = normalFacts;
window.normalClarifications = normalClarifications;
window.CONTRACT_DOC = CONTRACT_DOC;
})(); } catch (e) { __ds_ns.__errors.push({ path: "contract-review/data.jsx", error: String((e && e.message) || e) }); }

// contract-review/fields.jsx
try { (() => {
// ============================================================================
// Felder + Provenance-Marker + Inline-Editor.
// Vier Herkunfts-Zustände: ai-high (≥85 %), ai-low (<85 %), manual, missing.
// Bearbeiten = Bestätigen: jede Korrektur kippt das Feld auf „manuell".
// Depends on icons.jsx.
// ============================================================================
const {
  useState: useStateF,
  useRef: useRefF,
  useEffect: useEffectF
} = React;
function fieldState(f) {
  if (f.source === "manual") return "manual";
  if (f.source === "missing" || f.value == null || f.value === "") return "missing";
  return f.confidence != null && f.confidence >= 85 ? "ai-high" : "ai-low";
}
function isReviewed(f) {
  const s = fieldState(f);
  return s === "manual" || s === "ai-high"; // hohe Confidence gilt als ruhig/geprüft-genug
}

// ---- Provenance-Marker ------------------------------------------------------
function ProvMark({
  f
}) {
  const s = fieldState(f);
  if (s === "ai-high") {
    return /*#__PURE__*/React.createElement("span", {
      className: "pmark pmark--high",
      title: "KI-Extraktion · " + f.confidence + " % Konfidenz"
    }, /*#__PURE__*/React.createElement("span", {
      className: "pmark__bars"
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", {
      className: "lbl-soft"
    }, "KI"), /*#__PURE__*/React.createElement("span", {
      className: "pct"
    }, "\xB7 ", f.confidence, " %"));
  }
  if (s === "ai-low") {
    return /*#__PURE__*/React.createElement("span", {
      className: "pmark pmark--low",
      title: "KI unsicher · " + f.confidence + " % — bitte prüfen"
    }, /*#__PURE__*/React.createElement("span", {
      className: "pmark__bars"
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), f.confidence, " %");
  }
  if (s === "manual") {
    return /*#__PURE__*/React.createElement("span", {
      className: "pmark pmark--manual",
      title: "Vom Menschen gepr\xFCft / gesetzt"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ic"
    }, I.check({
      size: 13
    })), " gepr\xFCft");
  }
  return /*#__PURE__*/React.createElement("span", {
    className: "pmark pmark--missing",
    title: "Wert fehlt \u2014 bitte erg\xE4nzen"
  }, "fehlt");
}

// ---- Anzeige eines Feldwerts ------------------------------------------------
function FieldValue({
  f
}) {
  const s = fieldState(f);
  if (s === "missing") return /*#__PURE__*/React.createElement("div", {
    className: "vfield__val placeholder"
  }, /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "\u2014 nicht erkannt \u2014"));
  if (f.type === "bool") {
    const on = f.value === true || f.value === "true";
    return /*#__PURE__*/React.createElement("div", {
      className: "vfield__val"
    }, /*#__PURE__*/React.createElement("span", {
      className: "vbool" + (on ? " on" : "")
    }, /*#__PURE__*/React.createElement("span", {
      className: "vbool__sw"
    }), /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, on ? "Ja" : "Nein")), /*#__PURE__*/React.createElement("span", {
      className: "pen"
    }, I.edit({
      size: 14
    })));
  }
  if (f.type === "amount") {
    return /*#__PURE__*/React.createElement("div", {
      className: "vfield__val amount"
    }, /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, f.value), /*#__PURE__*/React.createElement("span", {
      className: "cur"
    }, f.currency), /*#__PURE__*/React.createElement("span", {
      className: "pen"
    }, I.edit({
      size: 14
    })));
  }
  if (f.type === "months") {
    return /*#__PURE__*/React.createElement("div", {
      className: "vfield__val"
    }, /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, f.value), /*#__PURE__*/React.createElement("span", {
      className: "cur"
    }, "Monate"), /*#__PURE__*/React.createElement("span", {
      className: "pen"
    }, I.edit({
      size: 14
    })));
  }
  if (f.type === "textarea") {
    return /*#__PURE__*/React.createElement("div", {
      className: "vsummary"
    }, f.value);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "vfield__val"
  }, /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, f.value), /*#__PURE__*/React.createElement("span", {
    className: "pen"
  }, I.edit({
    size: 14
  })));
}

// ---- Inline-Editor ----------------------------------------------------------
function FieldEditor({
  f,
  onSave,
  onCancel
}) {
  const [val, setVal] = useStateF(f.value == null ? "" : f.value);
  const [cur, setCur] = useStateF(f.currency || "EUR");
  const ref = useRefF(null);
  useEffectF(() => {
    if (ref.current) {
      ref.current.focus();
      if (ref.current.select) ref.current.select();
    }
  }, []);
  const commit = () => onSave({
    value: f.type === "bool" ? val : val,
    currency: cur
  });
  const onKey = e => {
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter" && f.type !== "textarea") {
      e.preventDefault();
      commit();
    }
  };
  let control;
  if (f.type === "select") {
    control = /*#__PURE__*/React.createElement("select", {
      className: "vinp",
      ref: ref,
      value: val,
      onChange: e => setVal(e.target.value),
      onKeyDown: onKey
    }, f.options.map(o => /*#__PURE__*/React.createElement("option", {
      key: o,
      value: o
    }, o)));
  } else if (f.type === "bool") {
    control = /*#__PURE__*/React.createElement("div", {
      className: "vedit__row"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-sm " + (val === true || val === "true" ? "btn-primary" : "btn-secondary"),
      onClick: () => setVal(true)
    }, "Ja"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-sm " + (!(val === true || val === "true") ? "btn-primary" : "btn-secondary"),
      onClick: () => setVal(false)
    }, "Nein"));
  } else if (f.type === "textarea") {
    control = /*#__PURE__*/React.createElement("textarea", {
      className: "vinp",
      ref: ref,
      value: val,
      onChange: e => setVal(e.target.value),
      onKeyDown: onKey
    });
  } else if (f.type === "amount") {
    control = /*#__PURE__*/React.createElement("div", {
      className: "vedit__row"
    }, /*#__PURE__*/React.createElement("input", {
      className: "vinp amount mono",
      ref: ref,
      value: val,
      onChange: e => setVal(e.target.value),
      onKeyDown: onKey,
      placeholder: "0,00"
    }), /*#__PURE__*/React.createElement("input", {
      className: "vinp cur",
      value: cur,
      onChange: e => setCur(e.target.value),
      onKeyDown: onKey
    }));
  } else if (f.type === "months") {
    control = /*#__PURE__*/React.createElement("div", {
      className: "vedit__row"
    }, /*#__PURE__*/React.createElement("input", {
      className: "vinp months mono",
      ref: ref,
      value: val,
      onChange: e => setVal(e.target.value),
      onKeyDown: onKey,
      inputMode: "numeric"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        alignSelf: "center",
        fontSize: 13,
        color: "var(--color-text-muted)"
      }
    }, "Monate"));
  } else {
    control = /*#__PURE__*/React.createElement("input", {
      className: "vinp" + (f.type === "date" ? " mono" : ""),
      ref: ref,
      value: val,
      onChange: e => setVal(e.target.value),
      onKeyDown: onKey,
      placeholder: f.type === "date" ? "TT.MM.JJJJ" : ""
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "vedit",
    onClick: e => e.stopPropagation()
  }, control, /*#__PURE__*/React.createElement("div", {
    className: "vedit__act"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vedit__note"
  }, f.source === "ai" ? "Korrektur markiert das Feld als geprüft" : "Mit Enter speichern, Esc abbrechen"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    onClick: onCancel
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: commit
  }, I.check({
    size: 14
  }), " Speichern")));
}

// ---- Feld-Zeile -------------------------------------------------------------
function VField({
  f,
  editing,
  justSaved,
  onEdit,
  onSave,
  onCancel,
  onConfirm
}) {
  const s = fieldState(f);
  const cls = "vfield is-" + s + (editing ? " is-editing" : "") + (justSaved ? " just-saved" : "") + (!editing ? " vfield--clickable" : "");
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    onClick: () => !editing && onEdit(f.key)
  }, /*#__PURE__*/React.createElement("div", {
    className: "vfield__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vfield__label"
  }, f.label, f.hint ? /*#__PURE__*/React.createElement("span", {
    className: "vfield__hint"
  }, " \xB7 ", f.hint) : null, f.derived ? /*#__PURE__*/React.createElement("span", {
    className: "vfield__hint"
  }, " \xB7 abgeleitet") : null), /*#__PURE__*/React.createElement("span", {
    className: "vfield__sp"
  }), !editing && /*#__PURE__*/React.createElement(ProvMark, {
    f: f
  }), !editing && s === "ai-high" && /*#__PURE__*/React.createElement("button", {
    className: "vconfirm",
    onClick: e => {
      e.stopPropagation();
      onConfirm(f.key);
    },
    title: "Als gepr\xFCft best\xE4tigen"
  }, I.check({
    size: 13
  }), " best\xE4tigen")), editing ? /*#__PURE__*/React.createElement(FieldEditor, {
    f: f,
    onSave: patch => onSave(f.key, patch),
    onCancel: onCancel
  }) : /*#__PURE__*/React.createElement(FieldValue, {
    f: f
  }));
}
window.fieldState = fieldState;
window.isReviewed = isReviewed;
window.ProvMark = ProvMark;
window.VField = VField;
})(); } catch (e) { __ds_ns.__errors.push({ path: "contract-review/fields.jsx", error: String((e && e.message) || e) }); }

// contract-review/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-style icons, 1.5 stroke — Ludwig house style
const Icon = ({
  d,
  size = 18,
  sw = 1.5,
  fill = "none",
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style,
  "aria-hidden": "true"
}, d);
const I = {
  // event types
  doc: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "13",
      x2: "15",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "17",
      x2: "13",
      y2: "17"
    }))
  })),
  payOut: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "19",
      x2: "12",
      y2: "5"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "5 12 12 5 19 12"
    }))
  })),
  payIn: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "19 12 12 19 5 12"
    }))
  })),
  accrual: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7v5l3 2"
    }))
  })),
  adjust: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 6h18M7 12h10M10 18h4"
    }))
  })),
  contract: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 15l2 2 4-4"
    }))
  })),
  repeat: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "17 1 21 5 17 9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 11V9a4 4 0 0 1 4-4h14"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 23 3 19 7 15"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 13v2a4 4 0 0 1-4 4H3"
    }))
  })),
  // status / ui
  check: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })
  })),
  checkSmall: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    sw: 2.5,
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })
  })),
  x: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    }))
  })),
  alert: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  })),
  help: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  })),
  clock: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    }))
  })),
  chevRight: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })
  })),
  chevLeft: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "15 18 9 12 15 6"
    })
  })),
  chevDown: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    })
  })),
  arrowRight: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    }))
  })),
  edit: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
    }))
  })),
  eye: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }))
  })),
  bank: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "22",
      x2: "21",
      y2: "22"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "18",
      x2: "6",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "10",
      y1: "18",
      x2: "10",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "14",
      y1: "18",
      x2: "14",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "18",
      x2: "18",
      y2: "11"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 20 7 4 7"
    }))
  })),
  scale: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3v18M3 7h18M7 7l-3 6a3 3 0 0 0 6 0zM17 7l-3 6a3 3 0 0 0 6 0z"
    }))
  })),
  layers: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 2 7 12 12 22 7 12 2"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "2 17 12 22 22 17"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "2 12 12 17 22 12"
    }))
  })),
  receipt: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 8h-8M16 12h-8M13 16h-5"
    }))
  })),
  calendar: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    }))
  })),
  download: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    }))
  })),
  more: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "19",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5",
      cy: "12",
      r: "1"
    }))
  })),
  expand: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "15 3 21 3 21 9"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "9 21 3 21 3 15"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "3",
      x2: "14",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "21",
      x2: "10",
      y2: "14"
    }))
  })),
  link: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
    }))
  })),
  search: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    }))
  })),
  bell: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 0 1-3.46 0"
    }))
  })),
  code: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "16 18 22 12 16 6"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "8 6 2 12 8 18"
    }))
  })),
  database: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ellipse", {
      cx: "12",
      cy: "5",
      rx: "9",
      ry: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 5v14a9 3 0 0 0 18 0V5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 12a9 3 0 0 0 18 0"
    }))
  })),
  copy: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "9",
      y: "9",
      width: "13",
      height: "13",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
    }))
  }))
};

// event-kind -> icon component
const EVENT_ICON = {
  document_received: I.doc,
  contract_received: I.contract,
  payment_in: I.payIn,
  payment_out: I.payOut,
  accrual: I.accrual,
  adjustment: I.adjust,
  recurring: I.repeat
};
window.Icon = Icon;
window.I = I;
window.EVENT_ICON = EVENT_ICON;
})(); } catch (e) { __ds_ns.__errors.push({ path: "contract-review/icons.jsx", error: String((e && e.message) || e) }); }

// contract-review/pdf.jsx
try { (() => {
// ============================================================================
// Vertrags-PDF — Dokument-Vorschau (linke Spalte, scrollbar, volle Höhe).
// Depends on icons.jsx + data.jsx (CONTRACT_DOC).
// ============================================================================

function ContractPaper({
  doc
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "paper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "paper__top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "paper__vendor"
  }, doc.vendor), /*#__PURE__*/React.createElement("div", {
    className: "paper__role"
  }, doc.vendorRole), /*#__PURE__*/React.createElement("div", {
    className: "paper__small",
    style: {
      marginTop: 8
    }
  }, doc.vendorAddr, /*#__PURE__*/React.createElement("br", null), "USt-IdNr. ", doc.vendorUst)), /*#__PURE__*/React.createElement("div", {
    className: "paper__doctype"
  }, doc.title)), /*#__PURE__*/React.createElement("div", {
    className: "paper__rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "paper__h"
  }, doc.subject), /*#__PURE__*/React.createElement("div", {
    className: "paper__sub"
  }, "zwischen ", doc.vendor, " (Vermieterin) und ", doc.tenant, " (Mieter)"), doc.sections.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "paper__sec",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "paper__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, s.n), s.t), /*#__PURE__*/React.createElement("div", {
    className: "paper__sec-b"
  }, s.body))), /*#__PURE__*/React.createElement("div", {
    className: "paper__sign"
  }, /*#__PURE__*/React.createElement("div", {
    className: "line"
  }, doc.vendor), /*#__PURE__*/React.createElement("div", {
    className: "line",
    style: {
      textAlign: "right"
    }
  }, "Mieter")), /*#__PURE__*/React.createElement("div", {
    className: "paper__small",
    style: {
      marginTop: 14
    }
  }, doc.signedAt));
}
function PdfColumn({
  doc
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "pdfcol"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pdfcol__bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pdfcol__name"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.doc({
    size: 16
  })), "Mietvertrag_Burgauerstr_12.pdf"), /*#__PURE__*/React.createElement("span", {
    className: "pdfcol__sp"
  }), /*#__PURE__*/React.createElement("span", {
    className: "pdfcol__meta"
  }, "Seite 1 / 1"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, I.download({
    size: 14
  }), " \xD6ffnen")), /*#__PURE__*/React.createElement("div", {
    className: "pdfcol__body"
  }, /*#__PURE__*/React.createElement(ContractPaper, {
    doc: doc
  }), /*#__PURE__*/React.createElement("div", {
    className: "paper__pagenum"
  }, "\u2014 Originaldokument \xB7 Quelle der Pr\xFCfung \u2014")));
}
window.ContractPaper = ContractPaper;
window.PdfColumn = PdfColumn;
})(); } catch (e) { __ds_ns.__errors.push({ path: "contract-review/pdf.jsx", error: String((e && e.message) || e) }); }

// contract-review/tech.jsx
try { (() => {
// ============================================================================
// Technische Details — Slide-over mit Extraktions-Metadaten.
// Inhalt passt sich dem Zustand an (Normal/Niedrig = Extraktion vorhanden,
// Nur-PDF = ausstehend, Fehlgeschlagen = Fehlerprotokoll).
// Depends on icons.jsx + data.jsx + fields.jsx (fieldState).
// ============================================================================
const {
  useState: useStateT
} = React;
function avgConf(fields) {
  const cs = fields.filter(f => f.confidence != null).map(f => f.confidence);
  return cs.length ? Math.round(cs.reduce((a, b) => a + b, 0) / cs.length) : null;
}
function techData(variant) {
  const base = {
    doc: {
      file: "Mietvertrag_Burgauerstr_12.pdf",
      mime: "application/pdf",
      size: "248 KB",
      pages: "1 (7 §§)",
      hash: "sha256:9f2a…c1d4",
      uploaded: "17.06.2026, 09:58:14",
      source: "E-Mail-Postfach · belege@kanzlei.de"
    },
    classification: {
      type: "Vertrag › Miete",
      conf: 96,
      engine: "ludwig-classify-v2.1"
    }
  };
  if (variant === "nurPdf" || variant === "extracting") {
    return {
      ...base,
      extraction: {
        status: "pending"
      }
    };
  }
  if (variant === "failed") {
    return {
      ...base,
      classification: {
        type: "Vertrag › unbestimmt",
        conf: 71,
        engine: "ludwig-classify-v2.1"
      },
      extraction: {
        status: "failed",
        model: "ludwig-extract-v3.2",
        startedAt: "17.06.2026, 09:58:31",
        durationMs: 4120,
        ocr: "Tesseract 5 · 41 % Textdeckung (gescannt)",
        error: "EXTRACT_LOW_TEXT_COVERAGE",
        errorMsg: "Zu geringe Textdeckung — Dokument vermutlich gescannt. Strukturierte Felder konnten nicht zuverlässig extrahiert werden."
      }
    };
  }
  const low = variant === "niedrig";
  const conf = low ? {
    typ: 61,
    gegenstand: 55,
    start: 68,
    laufzeit: 49,
    ende: 44,
    unbefristet: 58,
    betrag: 64,
    summary: 52
  } : {
    typ: 94,
    gegenstand: 88,
    start: 96,
    laufzeit: 71,
    ende: 58,
    unbefristet: 90,
    betrag: 92,
    summary: 83
  };
  const labels = {
    typ: "Typ",
    gegenstand: "Vertragsgegenstand",
    start: "Startdatum",
    laufzeit: "Laufzeit",
    ende: "Enddatum",
    unbefristet: "Unbefristet",
    betrag: "Primärbetrag",
    summary: "Zusammenfassung"
  };
  const fields = Object.keys(conf).map(k => ({
    key: k,
    label: labels[k],
    conf: conf[k]
  }));
  return {
    ...base,
    extraction: {
      status: "ok",
      model: "ludwig-extract-v3.2",
      finishedAt: "17.06.2026, 09:58:39",
      durationMs: low ? 9240 : 7180,
      ocr: "nativer PDF-Text · 100 % Textdeckung",
      tokensIn: 5840,
      tokensOut: 612,
      avg: avgConf(fields.map(f => ({
        confidence: f.conf
      }))),
      fields,
      factCount: 5
    }
  };
}
function ConfRow({
  label,
  conf
}) {
  const lvl = conf >= 85 ? "high" : conf >= 55 ? "mid" : "low";
  const color = lvl === "high" ? "var(--color-success)" : lvl === "mid" ? "var(--color-warning)" : "var(--color-danger)";
  return /*#__PURE__*/React.createElement("div", {
    className: "techconf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "techconf__k"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "techconf__bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: conf + "%",
      background: color
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "techconf__v num",
    style: {
      color
    }
  }, conf, " %"));
}
function Row({
  k,
  v,
  mono = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "techrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "v" + (mono ? " mono" : "")
  }, v));
}
function TechDrawer({
  open,
  variant,
  onClose
}) {
  const [showJson, setShowJson] = useStateT(false);
  const d = techData(variant);
  const ex = d.extraction;
  const json = `{
  "document_id": "doc_8c1f…",
  "type": "rental_contract",
  "fields": {
    "typ": "Miete",
    "gegenstand": "Büromiete Burgauerstraße 12",
    "start": "2025-02-01",
    "laufzeit_monate": 24,
    "ende": "2027-01-31",
    "unbefristet": false,
    "betrag": { "value": 1800.00, "currency": "EUR" }
  },
  "model": "ludwig-extract-v3.2"
}`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "techdrawer-scrim" + (open ? " open" : ""),
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "techdrawer" + (open ? " open" : ""),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Technische Details"
  }, /*#__PURE__*/React.createElement("div", {
    className: "techdrawer__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "techdrawer__ic"
  }, I.code({
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    className: "techdrawer__titl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Technische Details"), /*#__PURE__*/React.createElement("h3", null, "Extraktion & Herkunft")), /*#__PURE__*/React.createElement("button", {
    className: "techdrawer__close",
    onClick: onClose,
    "aria-label": "Schlie\xDFen"
  }, I.x({
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "techdrawer__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "techsec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "techsec__h"
  }, I.doc({
    size: 13
  }), " Dokument"), /*#__PURE__*/React.createElement(Row, {
    k: "Datei",
    v: d.doc.file
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Format \xB7 Gr\xF6\xDFe",
    v: d.doc.mime + " · " + d.doc.size
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Seiten",
    v: d.doc.pages
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Pr\xFCfsumme",
    v: d.doc.hash
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Hochgeladen",
    v: d.doc.uploaded
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Quelle",
    v: d.doc.source,
    mono: false
  })), /*#__PURE__*/React.createElement("div", {
    className: "techsec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "techsec__h"
  }, I.layers({
    size: 13
  }), " Klassifikation"), /*#__PURE__*/React.createElement(Row, {
    k: "Erkannter Typ",
    v: d.classification.type,
    mono: false
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Modell",
    v: d.classification.engine
  }), /*#__PURE__*/React.createElement(ConfRow, {
    label: "Klassifikations-Konfidenz",
    conf: d.classification.conf
  })), /*#__PURE__*/React.createElement("div", {
    className: "techsec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "techsec__h"
  }, I.database({
    size: 13
  }), " Extraktion"), ex.status === "pending" && /*#__PURE__*/React.createElement("div", {
    className: "technote"
  }, "Noch keine Extraktion. Die strukturierten Felder werden erst nach dem Auslesen erzeugt."), ex.status === "failed" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "technote technote--fail"
  }, /*#__PURE__*/React.createElement("b", null, "Fehlgeschlagen"), " \xB7 ", ex.error, /*#__PURE__*/React.createElement("br", null), ex.errorMsg), /*#__PURE__*/React.createElement(Row, {
    k: "Modell",
    v: ex.model
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Gestartet",
    v: ex.startedAt
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Dauer",
    v: (ex.durationMs / 1000).toFixed(1) + " s"
  }), /*#__PURE__*/React.createElement(Row, {
    k: "OCR",
    v: ex.ocr,
    mono: false
  })), ex.status === "ok" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Row, {
    k: "Modell",
    v: ex.model
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Abgeschlossen",
    v: ex.finishedAt
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Dauer",
    v: (ex.durationMs / 1000).toFixed(1) + " s"
  }), /*#__PURE__*/React.createElement(Row, {
    k: "OCR / Text",
    v: ex.ocr,
    mono: false
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Tokens (ein / aus)",
    v: ex.tokensIn + " / " + ex.tokensOut
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Felder \xB7 Fakten",
    v: ex.fields.length + " · " + ex.factCount
  }))), ex.status === "ok" && /*#__PURE__*/React.createElement("div", {
    className: "techsec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "techsec__h"
  }, I.layers({
    size: 13
  }), " Konfidenz je Feld ", /*#__PURE__*/React.createElement("span", {
    className: "techsec__avg"
  }, "\xD8 ", ex.avg, " %")), ex.fields.map(f => /*#__PURE__*/React.createElement(ConfRow, {
    key: f.key,
    label: f.label,
    conf: f.conf
  }))), ex.status === "ok" && /*#__PURE__*/React.createElement("div", {
    className: "techsec"
  }, /*#__PURE__*/React.createElement("button", {
    className: "techjson__toggle",
    onClick: () => setShowJson(s => !s)
  }, /*#__PURE__*/React.createElement("span", {
    className: "chev",
    style: {
      transform: showJson ? "rotate(90deg)" : "none"
    }
  }, I.chevRight({
    size: 14
  })), "Roh-Ausgabe (JSON)", /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "techjson__copy"
  }, I.copy({
    size: 13
  }), " kopieren")), showJson && /*#__PURE__*/React.createElement("pre", {
    className: "techjson"
  }, json)), /*#__PURE__*/React.createElement("div", {
    className: "techfoot"
  }, "Maschinell erzeugte Metadaten \xB7 nur zur Nachvollziehbarkeit. Ma\xDFgeblich ist das gepr\xFCfte Ergebnis."))));
}
Object.assign(window, {
  techData,
  TechDrawer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "contract-review/tech.jsx", error: String((e && e.message) || e) }); }

// kontoauszug/ka-app.jsx
try { (() => {
const {
  useState,
  useMemo,
  useRef,
  useEffect
} = React;
const {
  ACCOUNTS,
  ROWS,
  BOOKING,
  PURP,
  worstBooking,
  deriveZ,
  restOf,
  fmtEUR
} = window.KA;

// ---------- kleine Bausteine ----------------------------------------------
function Badge({
  tone,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `badge badge--${tone}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), children);
}
function Bubble({
  n,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "bubble tt",
    "data-tt": `${n} Rückfrage${n > 1 ? 'n' : ''} offen — zum Klärungs-Abschnitt`,
    onClick: onClick
  }, n);
}

// Status-Zelle: Buchungs-Badge (aus Registry) + Rückfragen-Bubble
function StatusCell({
  row,
  onClar
}) {
  const z = deriveZ(row);
  if (z === 'Z0') return /*#__PURE__*/React.createElement("span", {
    className: "nostatus"
  }, "\u2014");
  const wb = worstBooking(row.events);
  const clar = row.events.reduce((a, e) => a + (e.clar || 0), 0);
  const meta = BOOKING[wb];
  return /*#__PURE__*/React.createElement("div", {
    className: "statuscell"
  }, meta ? /*#__PURE__*/React.createElement(Badge, {
    tone: meta.tone
  }, meta.label) : /*#__PURE__*/React.createElement("span", {
    className: "nostatus tt",
    "data-tt": "Zugeordnet, aber noch keine Buchung angelegt"
  }, "ohne Buchung"), clar > 0 && /*#__PURE__*/React.createElement(Bubble, {
    n: clar,
    onClick: onClar
  }));
}

// Gegenpartei: Kreditor-Link (sicher) vs. reiner Text + Lupe „Gegenpartei finden"
function PartyCell({
  row,
  forceUnlinked,
  onNav,
  onToast
}) {
  const p = row.party;
  const linked = p.creditorId && !forceUnlinked;
  return /*#__PURE__*/React.createElement("div", {
    className: "party"
  }, linked ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(`Kreditor ${p.name}`);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, p.name), /*#__PURE__*/React.createElement(KI.ext, {
    size: 12
  })) : /*#__PURE__*/React.createElement("span", {
    className: "party__un"
  }, /*#__PURE__*/React.createElement("span", {
    className: "plain"
  }, p.name), /*#__PURE__*/React.createElement("button", {
    className: "lupe tt",
    "data-tt": "Gegenpartei finden",
    onClick: () => onToast('Kreditor-Suche geöffnet')
  }, /*#__PURE__*/React.createElement(KI.search, {
    size: 13
  }))));
}

// Sachverhalt-Zelle: Case-Link(s) oder „offen"-Pille
function CaseCell({
  row,
  onNav
}) {
  const z = deriveZ(row);
  if (z === 'Z0') return /*#__PURE__*/React.createElement("a", {
    className: "openpill",
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav('Worklist „Offen"');
    }
  }, "offen");
  if (z === 'Z1') return /*#__PURE__*/React.createElement("a", {
    className: "caselink",
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(row.events[0].caseNo);
    }
  }, row.events[0].caseNo);
  // Z2/Z3: Sachverhalte untereinander, Teilbetrag ausgegraut daneben (expandable via Chevron im Zweck)
  return /*#__PURE__*/React.createElement("div", {
    className: "casestack"
  }, row.events.map((e, i) => /*#__PURE__*/React.createElement("div", {
    className: "caseitem",
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    className: "caselink",
    href: "#",
    onClick: ev => {
      ev.preventDefault();
      onNav(e.caseNo);
    }
  }, e.caseNo), /*#__PURE__*/React.createElement("span", {
    className: "caseamt num"
  }, fmtEUR(e.amount)))));
}

// ---------- eine Transaktionszeile ----------------------------------------
function Row({
  row,
  modus,
  selected,
  onSelect,
  expanded,
  onToggle,
  forceUnlinked,
  onInfo,
  onNav,
  onToast
}) {
  const z = deriveZ(row);
  const split = z === 'Z2' || z === 'Z3';
  const rest = split ? restOf(row) : 0;
  const isOpen = expanded.has(row.id);
  const worklist = modus === 'worklist';
  const hasHints = z === 'Z0' && row.hints && (row.hints.autoconnect || row.hints.creditor);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", {
    className: `trow${isOpen ? ' open-hi' : ''}`
  }, worklist && /*#__PURE__*/React.createElement("td", {
    className: "col-chk c"
  }, /*#__PURE__*/React.createElement("span", {
    className: `chk${selected ? ' on' : ''}`,
    onClick: () => onSelect(row.id)
  }, /*#__PURE__*/React.createElement(KI.check, {
    size: 11,
    sw: 2.5
  }))), /*#__PURE__*/React.createElement("td", {
    className: "col-date"
  }, /*#__PURE__*/React.createElement("span", {
    className: "c-date num"
  }, row.date)), /*#__PURE__*/React.createElement("td", {
    className: "col-party"
  }, /*#__PURE__*/React.createElement(PartyCell, {
    row: row,
    forceUnlinked: forceUnlinked,
    onNav: onNav,
    onToast: onToast
  })), /*#__PURE__*/React.createElement("td", {
    className: "c-svwz"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svwz-in"
  }, split ? /*#__PURE__*/React.createElement("button", {
    className: `chev${isOpen ? ' spin' : ''}`,
    onClick: () => onToggle(row.id)
  }, /*#__PURE__*/React.createElement(KI.chevRight, {
    size: 14
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "svwz-txt tt",
    "data-tt": row.svwz
  }, row.svwz), split && (rest !== 0 ? /*#__PURE__*/React.createElement("span", {
    className: "splitbadge rest"
  }, "Rest ", fmtEUR(rest)) : /*#__PURE__*/React.createElement("span", {
    className: "splitbadge full"
  }, /*#__PURE__*/React.createElement(KI.check, {
    size: 11,
    sw: 2.5
  }), " ", row.events.length, " SV"))), hasHints && /*#__PURE__*/React.createElement("div", {
    className: "hints"
  }, row.hints.autoconnect && /*#__PURE__*/React.createElement("button", {
    className: "chip",
    onClick: () => onToast(`zugeordnet zu ${row.hints.autoconnect.caseNo} · 1 Vorschlag erzeugt`)
  }, /*#__PURE__*/React.createElement(KI.link, {
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, row.hints.autoconnect.label))), row.hints.creditor && /*#__PURE__*/React.createElement("button", {
    className: "chip chip--cred",
    onClick: () => onToast(`Anlege-Maske vorbefüllt: ${row.hints.creditor.name}`)
  }, /*#__PURE__*/React.createElement(KI.wand, {
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, "vermutlich: ", /*#__PURE__*/React.createElement("b", null, row.hints.creditor.name), " (", row.hints.creditor.via, ")")), worklist && /*#__PURE__*/React.createElement("button", {
    className: "classifybtn",
    onClick: () => onToast('Sachverhalt + Buchungsvorschlag erzeugt (KI)')
  }, /*#__PURE__*/React.createElement(KI.wand, {
    size: 12
  }), " Einzeln klassifizieren"))), /*#__PURE__*/React.createElement("td", {
    className: "col-amt r"
  }, /*#__PURE__*/React.createElement("span", {
    className: `c-amt num${row.amount < 0 ? ' neg' : ''}`
  }, fmtEUR(row.amount)), " ", /*#__PURE__*/React.createElement("span", {
    className: "c-cur"
  }, row.currency)), /*#__PURE__*/React.createElement("td", {
    className: "col-case"
  }, /*#__PURE__*/React.createElement(CaseCell, {
    row: row,
    onNav: onNav
  })), /*#__PURE__*/React.createElement("td", {
    className: "col-status"
  }, /*#__PURE__*/React.createElement(StatusCell, {
    row: row,
    onClar: () => onNav(`Klärung zu ${row.events[0]?.caseNo}`)
  })), /*#__PURE__*/React.createElement("td", {
    className: "col-info c"
  }, /*#__PURE__*/React.createElement("button", {
    className: "iconbtn tt",
    "data-tt": "Detail-Ansicht",
    onClick: () => onInfo(row.id)
  }, /*#__PURE__*/React.createElement(KI.info, {
    size: 17
  })))), split && isOpen && /*#__PURE__*/React.createElement("tr", {
    className: "subrow"
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: worklist ? 8 : 7
  }, /*#__PURE__*/React.createElement("div", {
    className: "subwrap"
  }, row.events.map((e, i) => {
    const meta = BOOKING[e.booking];
    return /*#__PURE__*/React.createElement("div", {
      className: "subline",
      key: i
    }, /*#__PURE__*/React.createElement(KI.subrow, {
      className: "subline__ic",
      size: 14
    }), /*#__PURE__*/React.createElement("div", {
      className: "subline__case"
    }, /*#__PURE__*/React.createElement("a", {
      className: "caselink",
      href: "#",
      onClick: ev => {
        ev.preventDefault();
        onNav(e.caseNo);
      }
    }, e.caseNo)), /*#__PURE__*/React.createElement("div", {
      className: "subline__title"
    }, e.title, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, e.kind)), /*#__PURE__*/React.createElement("div", {
      className: `subline__amt num${e.amount < 0 ? ' neg' : ''}`
    }, fmtEUR(e.amount)), /*#__PURE__*/React.createElement("div", {
      className: "subline__st"
    }, meta ? /*#__PURE__*/React.createElement(Badge, {
      tone: meta.tone
    }, meta.label) : /*#__PURE__*/React.createElement("span", {
      className: "nostatus"
    }, "ohne Buchung"), e.clar > 0 && /*#__PURE__*/React.createElement(Bubble, {
      n: e.clar,
      onClick: () => onNav(`Klärung zu ${e.caseNo}`)
    })));
  }), /*#__PURE__*/React.createElement("div", {
    className: "subtotal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Summe zugeordnet \xB7 von ", fmtEUR(row.amount)), /*#__PURE__*/React.createElement("span", {
    className: "val num"
  }, fmtEUR(row.events.reduce((a, e) => a + e.amount, 0))), rest !== 0 && /*#__PURE__*/React.createElement("span", {
    className: "val rest num"
  }, "Rest ", fmtEUR(rest)))))));
}

// ---------- Konto-Dropdown -------------------------------------------------
function KontoDrop({
  open,
  setOpen,
  konto,
  setKonto
}) {
  const cur = ACCOUNTS.find(a => a.id === konto);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const banks = ACCOUNTS.filter(a => a.kind === 'Bank'),
    kassen = ACCOUNTS.filter(a => a.kind === 'Kasse');
  return /*#__PURE__*/React.createElement("div", {
    className: "kdrop",
    ref: ref
  }, /*#__PURE__*/React.createElement("button", {
    className: "kbtn",
    onClick: () => setOpen(!open)
  }, cur.name, /*#__PURE__*/React.createElement("span", {
    className: "cnt"
  }, cur.open, " offen"), /*#__PURE__*/React.createElement(KI.chevDown, {
    className: "ic",
    size: 15
  })), open && /*#__PURE__*/React.createElement("div", {
    className: "kmenu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kmenu__sec"
  }, "Bankkonten"), banks.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    className: `kitem${a.id === konto ? ' on' : ''}`,
    onClick: () => {
      setKonto(a.id);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "kitem__nm"
  }, a.name), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "kitem__ib"
  }, a.iban)), /*#__PURE__*/React.createElement("span", {
    className: `cnt${a.open ? '' : ' zero'}`
  }, a.open, " offen"))), /*#__PURE__*/React.createElement("div", {
    className: "kmenu__sec"
  }, "Kasse"), kassen.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    className: `kitem${a.id === konto ? ' on' : ''}`,
    onClick: () => {
      setKonto(a.id);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "kitem__nm"
  }, a.name)), /*#__PURE__*/React.createElement("span", {
    className: `cnt${a.open ? '' : ' zero'}`
  }, a.open, " offen")))));
}

// ---------- Detail-Drawer (§7b) -------------------------------------------
function Drawer({
  row,
  onClose,
  onNav,
  onToast
}) {
  if (!row) return null;
  const s = row.sepa || {};
  const refs = [['EREF', s.eref, 'End-to-End-Referenz (oft die Rechnungsnummer)'], ['KREF', s.kref, 'Kundenreferenz'], ['MREF', s.mref, 'Lastschrift-Mandat'], ['CRED', s.cred, 'Gläubiger-ID'], ['PURP', s.purp, s.purp ? `${s.purp} — ${PURP[s.purp] || 'ISO-20022-Code'}` : '']].filter(([, v]) => v);
  const z = deriveZ(row);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer",
    role: "dialog",
    "aria-label": "Transaktions-Detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-head__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: `dr-head__amt num${row.amount < 0 ? ' neg' : ''}`
  }, fmtEUR(row.amount), " ", row.currency), /*#__PURE__*/React.createElement("div", {
    className: "dr-head__sub"
  }, row.svwz)), /*#__PURE__*/React.createElement("button", {
    className: "dr-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(KI.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dr-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-grp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-grp__t"
  }, "Zahlung"), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Betrag"), /*#__PURE__*/React.createElement("dd", {
    className: `num${row.amount < 0 ? '' : ''}`
  }, fmtEUR(row.amount), " ", row.currency)), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Buchungsdatum"), /*#__PURE__*/React.createElement("dd", {
    className: "num"
  }, row.date, "2026")), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Valuta"), /*#__PURE__*/React.createElement("dd", {
    className: "num"
  }, row.valuta))), /*#__PURE__*/React.createElement("div", {
    className: "dr-grp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-grp__t"
  }, "Verwendungszweck"), /*#__PURE__*/React.createElement("div", {
    className: "dr-full"
  }, row.svwz), refs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "refchips"
  }, refs.map(([k, v, hint]) => /*#__PURE__*/React.createElement("span", {
    className: "refchip tt",
    key: k,
    "data-tt": hint
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, v)))), /*#__PURE__*/React.createElement("details", {
    className: "disclosure"
  }, /*#__PURE__*/React.createElement("summary", null, "Roh-Block anzeigen"), /*#__PURE__*/React.createElement("pre", null, row.raw))), /*#__PURE__*/React.createElement("div", {
    className: "dr-grp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-grp__t"
  }, "Gegenpartei"), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Name"), /*#__PURE__*/React.createElement("dd", null, row.party.creditorId ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(`Kreditor ${row.party.name}`);
    }
  }, row.party.name) : row.party.name)), row.party.iban && /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "IBAN"), /*#__PURE__*/React.createElement("dd", {
    className: "mono"
  }, row.party.iban)), row.party.bic && /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "BIC"), /*#__PURE__*/React.createElement("dd", {
    className: "mono"
  }, row.party.bic))), /*#__PURE__*/React.createElement("div", {
    className: "dr-grp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-grp__t"
  }, "Zuordnung"), z === 'Z0' && /*#__PURE__*/React.createElement("div", {
    className: "dr-full",
    style: {
      color: 'var(--color-text-muted)'
    }
  }, "Noch keinem Sachverhalt zugeordnet."), row.events.map((e, i) => {
    const meta = BOOKING[e.booking];
    return /*#__PURE__*/React.createElement("div", {
      className: "dr-assign",
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: "dr-assign__top"
    }, /*#__PURE__*/React.createElement("a", {
      className: "caselink",
      href: "#",
      onClick: ev => {
        ev.preventDefault();
        onNav(e.caseNo);
      }
    }, e.caseNo), /*#__PURE__*/React.createElement("span", {
      className: "dr-assign__t"
    }, e.title), /*#__PURE__*/React.createElement("span", {
      className: `dr-assign__amt num${e.amount < 0 ? ' neg' : ''}`
    }, fmtEUR(e.amount))), /*#__PURE__*/React.createElement("div", {
      className: "statuscell"
    }, meta ? /*#__PURE__*/React.createElement(Badge, {
      tone: meta.tone
    }, meta.label) : /*#__PURE__*/React.createElement("span", {
      className: "nostatus"
    }, "ohne Buchung"), e.clar > 0 && /*#__PURE__*/React.createElement(Bubble, {
      n: e.clar,
      onClick: () => onNav(`Klärung zu ${e.caseNo}`)
    })), e.clarText && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--color-warning)',
        marginTop: 6
      }
    }, e.clarText));
  }), restOf(row) !== 0 && z === 'Z3' && /*#__PURE__*/React.createElement("div", {
    className: "dr-full",
    style: {
      color: 'var(--color-warning)',
      borderColor: 'var(--color-warning)'
    }
  }, "Rest offen: ", fmtEUR(restOf(row)), " \u2014 bleibt in der Worklist \u201Eoffen\"."), /*#__PURE__*/React.createElement("div", {
    className: "dr-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "dr-abtn",
    disabled: worstBooking(row.events) === 'B3' || z === 'Z0',
    onClick: () => onToast('Zuordnung gelöst')
  }, /*#__PURE__*/React.createElement(KI.unlink, {
    size: 14
  }), " Zuordnung l\xF6sen"), /*#__PURE__*/React.createElement("button", {
    className: "dr-abtn",
    onClick: () => onToast('Buchungsvorschlag angestoßen')
  }, /*#__PURE__*/React.createElement(KI.wand, {
    size: 14
  }), " Vorschlag ansto\xDFen"))), /*#__PURE__*/React.createElement("div", {
    className: "dr-grp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr-grp__t"
  }, "Import"), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Quelle"), /*#__PURE__*/React.createElement("dd", {
    style: {
      textTransform: 'uppercase',
      fontSize: 12
    }
  }, row.source)), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Import-Batch"), /*#__PURE__*/React.createElement("dd", {
    className: "mono"
  }, row.batch)), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Import-Zeitpunkt"), /*#__PURE__*/React.createElement("dd", {
    className: "num"
  }, row.importedAt)), /*#__PURE__*/React.createElement("dl", {
    className: "dr-kv"
  }, /*#__PURE__*/React.createElement("dt", null, "Externe ID"), /*#__PURE__*/React.createElement("dd", {
    className: "mono"
  }, row.extId))))));
}

// ---------- Prototyp-Steuerung (§9) ---------------------------------------
function PSeg({
  label,
  value,
  set,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "proto__grp"
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("div", {
    className: "pseg"
  }, options.map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: value === v ? 'on' : '',
    onClick: () => set(v)
  }, l))));
}

// ---------- App ------------------------------------------------------------
const SEARCH_PRESETS = {
  leer: '',
  treffer: 'net',
  kein: 'xyz-kein-treffer'
};
function App() {
  const [modus, setModus] = useState('worklist');
  const [dense, setDense] = useState('normal');
  const [filter, setFilter] = useState('alle');
  const [searchP, setSearchP] = useState('leer');
  const [query, setQuery] = useState('');
  const [krLink, setKrLink] = useState('auto');
  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [kontoOpen, setKontoOpen] = useState(false);
  const [konto, setKonto] = useState('vb-giro');
  const [drawerId, setDrawerId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastT = useRef(null);
  const showToast = m => {
    setToast(m);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2600);
  };
  const onNav = what => showToast(`Navigation → ${what}`);

  // Prototyp-Schalter „Suche" setzt das echte Feld
  const setSearchPreset = p => {
    setSearchP(p);
    setQuery(SEARCH_PRESETS[p]);
  };
  const onQuery = v => {
    setQuery(v);
    setSearchP('leer');
  };

  // Prototyp-Schalter „Split" / „Drawer" / „Konto-Menü"
  const setSplitState = v => {
    if (v === 'auf') setExpanded(new Set(ROWS.filter(r => {
      const z = deriveZ(r);
      return z === 'Z2' || z === 'Z3';
    }).map(r => r.id)));else setExpanded(new Set());
  };
  const splitState = expanded.size > 0 ? 'auf' : 'zu';
  const setDrawerState = v => setDrawerId(v === 'auf' ? 't-4468' : null);
  const forceUnlinked = krLink === 'aus';

  // Filter-Zähler
  const kontoRows = ROWS.filter(r => r.account === konto);
  const passFilter = (row, f) => {
    const z = deriveZ(row);
    if (f === 'alle') return true;
    if (f === 'offen') return z === 'Z0' || z === 'Z3';
    if (f === 'teilweise') return z === 'Z3';
    if (f === 'rueckfrage') return (row.events || []).some(e => e.clar > 0);
    if (f === 'ungebucht') return z === 'Z0' || worstBooking(row.events) !== 'B3';
    return true;
  };
  const passSearch = (row, q) => {
    if (!q) return true;
    const hay = [row.svwz, row.party.name, row.party.iban || '', fmtEUR(row.amount).replace('\u2212', ''), ...(row.events || []).map(e => e.caseNo + ' ' + e.title), row.sepa.eref || '', row.sepa.kref || ''].join(' ').toLowerCase();
    return hay.includes(q.toLowerCase());
  };
  const counts = useMemo(() => {
    const c = {};
    ['alle', 'offen', 'teilweise', 'rueckfrage', 'ungebucht'].forEach(f => {
      c[f] = kontoRows.filter(r => passFilter(r, f)).length;
    });
    return c;
  }, [konto]);
  const rows = kontoRows.filter(r => passFilter(r, filter) && passSearch(r, query));
  const openRows = rows.filter(r => {
    const z = deriveZ(r);
    return z === 'Z0' || z === 'Z3';
  });
  const allOpenSel = openRows.length > 0 && openRows.every(r => selected.has(r.id));
  const toggleSel = id => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const toggleAllOpen = () => setSelected(allOpenSel ? new Set() : new Set(openRows.map(r => r.id)));
  const toggleExp = id => {
    const n = new Set(expanded);
    n.has(id) ? n.delete(id) : n.add(id);
    setExpanded(n);
  };
  const worklist = modus === 'worklist';
  const drawerRow = ROWS.find(r => r.id === drawerId);
  const FILTERS = [['alle', 'Alle'], ['offen', 'Offen'], ['teilweise', 'Teilweise'], ['rueckfrage', 'Mit Rückfrage'], ['ungebucht', 'Ungebucht']];
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "proto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "proto__in"
  }, /*#__PURE__*/React.createElement("span", {
    className: "proto__lbl"
  }, /*#__PURE__*/React.createElement(KI.sliders, {
    size: 13
  }), " Prototyp"), /*#__PURE__*/React.createElement(PSeg, {
    label: "Modus",
    value: modus,
    set: setModus,
    options: [['lesen', 'Lesen'], ['worklist', 'Worklist']]
  }), /*#__PURE__*/React.createElement(PSeg, {
    label: "Dichte",
    value: dense,
    set: setDense,
    options: [['normal', 'Normal'], ['kompakt', 'Kompakt']]
  }), /*#__PURE__*/React.createElement(PSeg, {
    label: "Split",
    value: splitState,
    set: setSplitState,
    options: [['zu', 'Zu'], ['auf', 'Aufgeklappt']]
  }), /*#__PURE__*/React.createElement(PSeg, {
    label: "Drawer",
    value: drawerId ? 'auf' : 'zu',
    set: setDrawerState,
    options: [['zu', 'Zu'], ['auf', 'Offen']]
  }), /*#__PURE__*/React.createElement(PSeg, {
    label: "Konto-Men\xFC",
    value: kontoOpen ? 'auf' : 'zu',
    set: v => setKontoOpen(v === 'auf'),
    options: [['zu', 'Zu'], ['auf', 'Offen']]
  }), /*#__PURE__*/React.createElement(PSeg, {
    label: "Suche",
    value: searchP,
    set: setSearchPreset,
    options: [['leer', 'Leer'], ['treffer', 'Treffer'], ['kein', 'Kein Treffer']]
  }), /*#__PURE__*/React.createElement(PSeg, {
    label: "Kreditor-Link",
    value: krLink,
    set: setKrLink,
    options: [['auto', 'Auto'], ['aus', 'Aus']]
  }))), /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tb-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/ludwig-mark.svg",
    alt: ""
  }), "Ludwig"), /*#__PURE__*/React.createElement("span", {
    className: "tb-crumb"
  }, "Mandant Certina GmbH ", /*#__PURE__*/React.createElement("span", {
    className: "tb-sep"
  }, "\xB7"), " Buchhaltung 2026 ", /*#__PURE__*/React.createElement("span", {
    className: "tb-sep"
  }, "\xB7"), " Kontoauszug"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "tb-user"
  }, "MB")), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h1row"
  }, /*#__PURE__*/React.createElement("h1", null, "Kontoauszug"), /*#__PURE__*/React.createElement("span", {
    className: "sub"
  }, "Bank- und Kassenbewegungen zuordnen, pr\xFCfen und buchen")), /*#__PURE__*/React.createElement("div", {
    className: "head"
  }, /*#__PURE__*/React.createElement(KontoDrop, {
    open: kontoOpen,
    setOpen: setKontoOpen,
    konto: konto,
    setKonto: id => {
      setKonto(id);
      setSelected(new Set());
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "search"
  }, /*#__PURE__*/React.createElement(KI.search, {
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => onQuery(e.target.value),
    placeholder: "Zweck, Gegenpartei, Betrag, Sachverhalt, EREF/KREF \u2026"
  }), query && /*#__PURE__*/React.createElement("button", {
    className: "iconbtn",
    onClick: () => onQuery('')
  }, /*#__PURE__*/React.createElement(KI.x, {
    size: 14
  }))), /*#__PURE__*/React.createElement("button", {
    className: "zbtn"
  }, /*#__PURE__*/React.createElement(KI.calendar, {
    size: 15
  }), " 01.07.\u201331.07.2026 ", /*#__PURE__*/React.createElement(KI.chevDown, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "head",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fseg"
  }, FILTERS.map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: filter === v ? 'on' : '',
    onClick: () => setFilter(v)
  }, l, /*#__PURE__*/React.createElement("span", {
    className: "n num"
  }, counts[v]))))), worklist && selected.size > 0 && /*#__PURE__*/React.createElement("div", {
    className: "selbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "selbar__n"
  }, /*#__PURE__*/React.createElement("b", null, selected.size), " ", selected.size === 1 ? 'Zeile' : 'Zeilen', " gew\xE4hlt"), /*#__PURE__*/React.createElement("button", {
    className: "act act--primary",
    onClick: () => {
      showToast(`${selected.size} zugeordnet · Vorschläge erzeugt`);
      setSelected(new Set());
    }
  }, /*#__PURE__*/React.createElement(KI.link, {
    size: 15
  }), " Sachverhalt zuordnen"), /*#__PURE__*/React.createElement("button", {
    className: "act",
    onClick: () => {
      showToast('Neuer Sachverhalt angelegt');
      setSelected(new Set());
    }
  }, /*#__PURE__*/React.createElement(KI.plus, {
    size: 15
  }), " Sachverhalt anlegen"), /*#__PURE__*/React.createElement("button", {
    className: "act",
    onClick: () => showToast('Teilbetrag zugeordnet · Rest bleibt offen')
  }, /*#__PURE__*/React.createElement(KI.split, {
    size: 15
  }), " Teilen"), /*#__PURE__*/React.createElement("button", {
    className: "act",
    onClick: () => {
      showToast('Einzeln klassifiziert');
      setSelected(new Set());
    }
  }, /*#__PURE__*/React.createElement(KI.wand, {
    size: 15
  }), " Klassifizieren"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "act act--ghost",
    onClick: () => setSelected(new Set())
  }, "Auswahl aufheben")), /*#__PURE__*/React.createElement("div", {
    className: `tblwrap${dense === 'kompakt' ? ' dense' : ''}`
  }, rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__ic"
  }, /*#__PURE__*/React.createElement(KI.search, {
    size: 44,
    sw: 1.25
  })), /*#__PURE__*/React.createElement("h3", null, "Keine Transaktionen gefunden"), /*#__PURE__*/React.createElement("p", null, "F\xFCr \u201E", query, "\" gibt es in diesem Zeitraum keine Treffer. Suche anpassen oder Zeitraum erweitern.")) : /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, worklist && /*#__PURE__*/React.createElement("th", {
    className: "col-chk c"
  }, /*#__PURE__*/React.createElement("span", {
    className: `chk${allOpenSel ? ' on' : ''} tt`,
    "data-tt": "Alle offenen Zeilen w\xE4hlen",
    onClick: toggleAllOpen
  }, /*#__PURE__*/React.createElement(KI.check, {
    size: 11,
    sw: 2.5
  }))), /*#__PURE__*/React.createElement("th", {
    className: "col-date"
  }, "Datum"), /*#__PURE__*/React.createElement("th", {
    className: "col-party"
  }, "Gegenpartei"), /*#__PURE__*/React.createElement("th", null, "Verwendungszweck"), /*#__PURE__*/React.createElement("th", {
    className: "col-amt r"
  }, "Betrag"), /*#__PURE__*/React.createElement("th", {
    className: "col-case"
  }, "Sachverhalt"), /*#__PURE__*/React.createElement("th", {
    className: "col-status"
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    className: "col-info c"
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement(Row, {
    key: r.id,
    row: r,
    modus: modus,
    selected: selected.has(r.id),
    onSelect: toggleSel,
    expanded: expanded,
    onToggle: toggleExp,
    forceUnlinked: forceUnlinked,
    onInfo: setDrawerId,
    onNav: onNav,
    onToast: showToast
  }))))), rows.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "pager"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, counts.alle), " Transaktionen", filter !== 'alle' || query ? ` · ${rows.length} gefiltert` : ''), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("div", {
    className: "pgroup"
  }, /*#__PURE__*/React.createElement("button", {
    className: "pg",
    disabled: true
  }, /*#__PURE__*/React.createElement(KI.chevLeft, {
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    className: "pg on"
  }, "1"), /*#__PURE__*/React.createElement("button", {
    className: "pg",
    disabled: true
  }, "\u203A")), /*#__PURE__*/React.createElement("span", {
    className: "psize"
  }, "Pro Seite ", /*#__PURE__*/React.createElement("select", {
    defaultValue: "50"
  }, /*#__PURE__*/React.createElement("option", null, "25"), /*#__PURE__*/React.createElement("option", null, "50"), /*#__PURE__*/React.createElement("option", null, "100"))))), drawerRow && /*#__PURE__*/React.createElement(Drawer, {
    row: drawerRow,
    onClose: () => setDrawerId(null),
    onNav: onNav,
    onToast: showToast
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement(KI.check, {
    size: 16
  }), toast));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "kontoauszug/ka-app.jsx", error: String((e && e.message) || e) }); }

// kontoauszug/ka-data.jsx
try { (() => {
// ==========================================================================
// Kontoauszug — Datenmodell. ~10 gemischte Zeilen, die alle §3-Kombinationen
// zeigen (Z0 / Z0+hints / Z1+B0 / Z1+B1 / Z1+B1+K1 / Z1+B2 / Z1+B3 /
// Z2-gemischt / Z3-rest). Zustände sind reine Sichtbarmachung vorhandener
// Daten — kein neuer Status erfunden.
// ==========================================================================

// --- Status-Registry (zentral, nie hart codiert in der View) --------------
const BOOKING = {
  B0: null,
  B1: {
    key: 'proposal',
    label: 'Vorschlag offen',
    tone: 'info'
  },
  B2: {
    key: 'accepted',
    label: 'Akzeptiert',
    tone: 'success'
  },
  B3: {
    key: 'posted',
    label: 'Gebucht',
    tone: 'success'
  }
};
// Rangordnung Arbeitsvorrat: offen < Vorschlag < akzeptiert < gebucht
const BOOKING_RANK = {
  none: 0,
  B1: 1,
  B2: 2,
  B3: 3
};

// PURP ISO-20022 Klartext
const PURP = {
  RINP: 'wiederkehrende Rate',
  SALA: 'Gehalt',
  TAXS: 'Steuer',
  RENT: 'Miete',
  SUPP: 'Lieferantenzahlung',
  OTHR: 'Sonstiges'
};

// --- Zahlungskonten (Konto-Dropdown, §7c) ---------------------------------
const ACCOUNTS = [{
  id: 'vb-giro',
  name: 'Volksbank Giro',
  iban: 'DE12 7009 0000 0012 3456 78',
  kind: 'Bank',
  open: 12
}, {
  id: 'spk-giro',
  name: 'Sparkasse Geschäftskonto',
  iban: 'DE44 7015 0000 0098 7654 32',
  kind: 'Bank',
  open: 5
}, {
  id: 'qonto',
  name: 'Qonto Firmenkonto',
  iban: 'DE31 1001 0123 4567 8901 23',
  kind: 'Bank',
  open: 3
}, {
  id: 'kasse',
  name: 'Barkasse',
  iban: null,
  kind: 'Kasse',
  open: 1
}];

// Helper: höchster Buchungs-Status (Arbeitsvorrat = schlechtester Teil)
function worstBooking(events) {
  let worst = 'B3';
  let worstRank = 99;
  let anyOpen = false;
  for (const e of events) {
    const r = e.booking ? BOOKING_RANK[e.booking] : 0;
    if (!e.booking) anyOpen = true;
    if (r < worstRank) {
      worstRank = r;
      worst = e.booking || 'none';
    }
  }
  return anyOpen ? 'none' : worst;
}

// --- Zeilen ----------------------------------------------------------------
// z: abgeleiteter Zuordnungs-Zustand. events[]: je Sachverhalt Case + Betrag +
// booking (B0..B3) + clar (offene Rückfragen). hints nur bei Z0.
const ROWS = [
// A — Z2-gemischt: Sammellastschrift, zwei Sachverhalte, gemischte Buchung
{
  id: 't-4471',
  account: 'vb-giro',
  date: '11.07.',
  valuta: '11.07.2026',
  amount: -468.49,
  currency: 'EUR',
  svwz: 'SEPA-Sammellastschrift Telekom Festnetz + M-net DSL Juli',
  raw: 'EREF+NOTPROVIDED KREF+2007000002 MREF+DE38ZZZ00000123456 CRED+DE38ZZZ00000123456 SVWZ+SEPA-SAMMELLASTSCHRIFT TELEKOM FESTNETZ + M-NET DSL JULI',
  sepa: {
    eref: 'NOTPROVIDED',
    kref: '2007000002',
    mref: 'DE38ZZZ00000123456',
    cred: 'DE38ZZZ00000123456',
    purp: 'RINP'
  },
  party: {
    name: 'Deutsche Telekom AG',
    iban: 'DE89 3705 0198 0000 0000 11',
    bic: 'COLSDE33XXX',
    creditorId: 'kr-telekom'
  },
  source: 'csv',
  batch: 'IMP-2026-07-12-A',
  importedAt: '12.07.2026 06:14',
  extId: 'VB-88213-4471',
  events: [{
    caseNo: 'S-2026-038',
    title: 'Telefon Festnetz (Dauer)',
    kind: 'Dauersachverhalt',
    amount: -289.00,
    booking: 'B3',
    clar: 0
  }, {
    caseNo: 'S-2026-041',
    title: 'Internet DSL (Dauer)',
    kind: 'Dauersachverhalt',
    amount: -179.49,
    booking: 'B1',
    clar: 1
  }]
},
// B — Z1+B1: der SEPA-Referenz-Beispielsatz für den Drawer (§7a)
{
  id: 't-4468',
  account: 'vb-giro',
  date: '10.07.',
  valuta: '10.07.2026',
  amount: -379.49,
  currency: 'EUR',
  svwz: 'Dienstleistungsvertrag v. 01.05.21 DR 20260013',
  raw: 'EREF+NOTPROVIDEDKREF+2007000002PURP+RINPSVWZ+DIENSTLEISTUNGSVERTRAG V. 01.05.21 DR 20260013',
  sepa: {
    eref: 'NOTPROVIDED',
    kref: '2007000002',
    purp: 'RINP',
    oamt: null
  },
  party: {
    name: 'M-net Telekommunikations GmbH',
    iban: 'DE21 7002 0270 0012 3456 78',
    bic: 'HYVEDEMMXXX',
    creditorId: 'kr-mnet'
  },
  source: 'qonto',
  batch: 'IMP-2026-07-11-Q',
  importedAt: '11.07.2026 05:52',
  extId: 'QNT-7741-0021',
  events: [{
    caseNo: 'S-2026-052',
    title: 'Wartungsvertrag Serverraum',
    kind: 'Eingangsrechnung',
    amount: -379.49,
    booking: 'B1',
    clar: 0
  }]
},
// C — Z0+hints: eingehende Zahlung, Autoconnect + Beleg wartet
{
  id: 't-4465',
  account: 'vb-giro',
  date: '09.07.',
  valuta: '09.07.2026',
  amount: 1200.00,
  currency: 'EUR',
  svwz: 'Zahlung RE-118 Certina Projektschlussrechnung',
  raw: 'EREF+RE-118 SVWZ+ZAHLUNG RE-118 CERTINA PROJEKTSCHLUSSRECHNUNG',
  sepa: {
    eref: 'RE-118'
  },
  party: {
    name: 'Certina Handels GmbH',
    iban: 'DE55 6008 0000 0970 3456 00',
    bic: 'DRESDEFF600',
    creditorId: null
  },
  source: 'csv',
  batch: 'IMP-2026-07-10-A',
  importedAt: '10.07.2026 06:11',
  extId: 'VB-88210-4465',
  events: [],
  hints: {
    autoconnect: {
      caseNo: 'S-2026-047',
      label: 'passt zu S-2026-047 (Beleg wartet)',
      note: 'Offener Beleg, gleicher Debitor, Betrag exakt (100 %)'
    },
    creditor: null
  }
},
// D — Z0 ohne Hints: Kartenzahlung, nicht auflösbar
{
  id: 't-4463',
  account: 'vb-giro',
  date: '09.07.',
  valuta: '09.07.2026',
  amount: -84.20,
  currency: 'EUR',
  svwz: 'Kartenzahlung SHELL Station München Land',
  raw: 'SVWZ+KARTENZAHLUNG SHELL 1234 MUENCHEN LAND 08.07 12:44',
  sepa: {},
  party: {
    name: 'SHELL 1234 MUENCHEN',
    iban: null,
    bic: null,
    creditorId: null
  },
  source: 'csv',
  batch: 'IMP-2026-07-10-A',
  importedAt: '10.07.2026 06:11',
  extId: 'VB-88210-4463',
  events: [],
  hints: {
    autoconnect: null,
    creditor: {
      name: 'Shell Deutschland',
      via: 'Name'
    }
  }
},
// E — Z1+B3: Miete, Dauersachverhalt, gebucht
{
  id: 't-4460',
  account: 'vb-giro',
  date: '08.07.',
  valuta: '08.07.2026',
  amount: -2380.00,
  currency: 'EUR',
  svwz: 'Miete Büro Bahnhofstr. 12 Juli 2026',
  raw: 'EREF+MIETE-2026-07 KREF+BAHNHOFSTR12 PURP+RENT SVWZ+MIETE BUERO BAHNHOFSTR. 12 JULI 2026',
  sepa: {
    eref: 'MIETE-2026-07',
    kref: 'BAHNHOFSTR12',
    purp: 'RENT'
  },
  party: {
    name: 'Immobilien Sailer KG',
    iban: 'DE07 7002 0270 0055 4433 22',
    bic: 'HYVEDEMMXXX',
    creditorId: 'kr-sailer'
  },
  source: 'csv',
  batch: 'IMP-2026-07-09-A',
  importedAt: '09.07.2026 06:08',
  extId: 'VB-88209-4460',
  events: [{
    caseNo: 'S-2025-002',
    title: 'Büromiete (Dauer)',
    kind: 'Dauersachverhalt',
    amount: -2380.00,
    booking: 'B3',
    clar: 0
  }]
},
// F — Z1+B2: SaaS, akzeptiert (noch nicht festgeschrieben)
{
  id: 't-4457',
  account: 'qonto',
  date: '08.07.',
  valuta: '08.07.2026',
  amount: -149.00,
  currency: 'EUR',
  svwz: 'Adobe Creative Cloud Abo Kanzlei',
  raw: 'EREF+ADBE-99213 PURP+RINP SVWZ+ADOBE CREATIVE CLOUD ABO KANZLEI',
  sepa: {
    eref: 'ADBE-99213',
    purp: 'RINP'
  },
  party: {
    name: 'Adobe Systems Software Ireland',
    iban: 'IE64 CITI 9900 5100 1234 56',
    bic: 'CITIIE2XXXX',
    creditorId: 'kr-adobe'
  },
  source: 'qonto',
  batch: 'IMP-2026-07-09-Q',
  importedAt: '09.07.2026 05:50',
  extId: 'QNT-7738-0014',
  events: [{
    caseNo: 'S-2026-050',
    title: 'Software-Abo Adobe',
    kind: 'Eingangsrechnung',
    amount: -149.00,
    booking: 'B2',
    clar: 0
  }]
},
// G — Z1+B1+K1: Beratungsrechnung, Vorschlag + 1 Rückfrage
{
  id: 't-4454',
  account: 'vb-giro',
  date: '07.07.',
  valuta: '07.07.2026',
  amount: -1190.00,
  currency: 'EUR',
  svwz: 'Rechnung R-2026-882 Unternehmensberatung',
  raw: 'EREF+R-2026-882 KREF+PROJ-CONSULT SVWZ+RECHNUNG R-2026-882 UNTERNEHMENSBERATUNG',
  sepa: {
    eref: 'R-2026-882',
    kref: 'PROJ-CONSULT'
  },
  party: {
    name: 'Muster Consulting GmbH',
    iban: 'DE33 7001 0080 0033 2211 00',
    bic: 'PBNKDEFFXXX',
    creditorId: 'kr-muster'
  },
  source: 'csv',
  batch: 'IMP-2026-07-08-A',
  importedAt: '08.07.2026 06:05',
  extId: 'VB-88208-4454',
  events: [{
    caseNo: 'S-2026-049',
    title: 'Beratung Projekt Nord',
    kind: 'Eingangsrechnung',
    amount: -1190.00,
    booking: 'B1',
    clar: 1,
    clarText: 'Vorsteuersatz unklar — 19 % oder 7 %?'
  }]
},
// H — Z1+B0: Erstattung, zugeordnet aber noch keine Buchung
{
  id: 't-4451',
  account: 'vb-giro',
  date: '07.07.',
  valuta: '07.07.2026',
  amount: 540.00,
  currency: 'EUR',
  svwz: 'Erstattung USt-Voranmeldung Mai 2026',
  raw: 'EREF+FA-UST-05-2026 PURP+TAXS SVWZ+ERSTATTUNG UST-VORANMELDUNG MAI 2026',
  sepa: {
    eref: 'FA-UST-05-2026',
    purp: 'TAXS'
  },
  party: {
    name: 'Finanzamt München III',
    iban: 'DE88 7005 0000 0000 1122 33',
    bic: 'BYLADEMMXXX',
    creditorId: null
  },
  source: 'csv',
  batch: 'IMP-2026-07-08-A',
  importedAt: '08.07.2026 06:05',
  extId: 'VB-88208-4451',
  events: [{
    caseNo: 'S-2026-046',
    title: 'USt-Erstattung Mai',
    kind: 'Steuer',
    amount: 540.00,
    booking: null,
    clar: 0
  }]
},
// I — Z3-rest: Sammelüberweisung teilweise erklärt, Rest offen
{
  id: 't-4448',
  account: 'vb-giro',
  date: '05.07.',
  valuta: '05.07.2026',
  amount: -5000.00,
  currency: 'EUR',
  svwz: 'Sammelüberweisung Lieferanten KW27',
  raw: 'KREF+SAMMEL-KW27 PURP+SUPP SVWZ+SAMMELUEBERWEISUNG LIEFERANTEN KW27',
  sepa: {
    kref: 'SAMMEL-KW27',
    purp: 'SUPP'
  },
  party: {
    name: 'diverse Lieferanten',
    iban: null,
    bic: null,
    creditorId: null
  },
  source: 'csv',
  batch: 'IMP-2026-07-06-A',
  importedAt: '06.07.2026 06:02',
  extId: 'VB-88206-4448',
  events: [{
    caseNo: 'S-2026-030',
    title: 'Wareneinkauf Bürobedarf',
    kind: 'Eingangsrechnung',
    amount: -3200.00,
    booking: 'B1',
    clar: 0
  }, {
    caseNo: 'S-2026-031',
    title: 'Verpackungsmaterial',
    kind: 'Eingangsrechnung',
    amount: -1100.00,
    booking: 'B2',
    clar: 0
  }]
},
// J — Z1+B3: Mobilfunk, Dauersachverhalt, gebucht
{
  id: 't-4445',
  account: 'vb-giro',
  date: '04.07.',
  valuta: '04.07.2026',
  amount: -59.99,
  currency: 'EUR',
  svwz: 'Mobilfunk Vertrag 0170-1234567 Juli',
  raw: 'EREF+VF-0170 KREF+MOBIL PURP+RINP SVWZ+MOBILFUNK VERTRAG 0170-1234567 JULI',
  sepa: {
    eref: 'VF-0170',
    kref: 'MOBIL',
    purp: 'RINP'
  },
  party: {
    name: 'Vodafone GmbH',
    iban: 'DE02 3702 0000 0001 2345 67',
    bic: 'BFSWDE33XXX',
    creditorId: 'kr-vodafone'
  },
  source: 'csv',
  batch: 'IMP-2026-07-05-A',
  importedAt: '05.07.2026 06:00',
  extId: 'VB-88205-4445',
  events: [{
    caseNo: 'S-2025-011',
    title: 'Mobilfunk (Dauer)',
    kind: 'Dauersachverhalt',
    amount: -59.99,
    booking: 'B3',
    clar: 0
  }]
}];

// Zuordnungs-Zustand (Achse 1) ableiten
function deriveZ(row) {
  const ev = row.events || [];
  if (ev.length === 0) return 'Z0';
  const sum = ev.reduce((a, e) => a + e.amount, 0);
  const explained = Math.abs(Math.abs(sum) - Math.abs(row.amount)) < 0.005;
  if (explained) return ev.length === 1 ? 'Z1' : 'Z2';
  return 'Z3'; // teilweise erklärt
}
function restOf(row) {
  const sum = (row.events || []).reduce((a, e) => a + e.amount, 0);
  return row.amount - sum; // gleiches Vorzeichen wie amount
}

// EUR-Format, deutsch, tabellarisch. Negatives mit echtem Minus (−).
function fmtEUR(n) {
  const s = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(n));
  return (n < 0 ? '\u2212' : '') + s;
}
window.KA = {
  BOOKING,
  BOOKING_RANK,
  PURP,
  ACCOUNTS,
  ROWS,
  worstBooking,
  deriveZ,
  restOf,
  fmtEUR
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "kontoauszug/ka-data.jsx", error: String((e && e.message) || e) }); }

// kontoauszug/ka-icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-style icons, 1.5 stroke — Ludwig house style.
const KaIcon = ({
  d,
  size = 16,
  sw = 1.5,
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style,
  "aria-hidden": "true"
}, d);
const KI = {
  search: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    }))
  })),
  chevDown: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    })
  })),
  chevRight: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "9 6 15 12 9 18"
    })
  })),
  chevLeft: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "15 6 9 12 15 18"
    })
  })),
  split: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "3",
      x2: "6",
      y2: "15"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "6",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "18",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18 9a9 9 0 0 1-9 9"
    }))
  })),
  info: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12.01",
      y2: "8"
    }))
  })),
  ext: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "15 3 21 3 21 9"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "10",
      y1: "14",
      x2: "21",
      y2: "3"
    }))
  })),
  calendar: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    }))
  })),
  check: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })
  })),
  x: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    }))
  })),
  alert: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  })),
  msg: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("path", {
      d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    })
  })),
  link: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
    }))
  })),
  unlink: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m5.17 11.75-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "2",
      y1: "8",
      x2: "5",
      y2: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "19",
      x2: "16",
      y2: "22"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "16",
      x2: "22",
      y2: "16"
    }))
  })),
  subrow: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "9 10 4 15 9 20"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 4v7a4 4 0 0 1-4 4H4"
    }))
  })),
  building: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "4",
      y: "2",
      width: "16",
      height: "20",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 22v-4h6v4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "6",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "6",
      x2: "12",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "6",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "10",
      x2: "8",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "10",
      x2: "12",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "10",
      x2: "16",
      y2: "10"
    }))
  })),
  plus: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }))
  })),
  wand: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M15 4V2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M15 16v-2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 9h2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 9h2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M17.8 11.8 19 13"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M15 9h.01"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M17.8 6.2 19 5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m3 21 9-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12.2 6.2 11 5"
    }))
  })),
  arrowRight: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    }))
  })),
  filter: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polygon", {
      points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
    })
  })),
  sliders: p => /*#__PURE__*/React.createElement(KaIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "4",
      y1: "21",
      x2: "4",
      y2: "14"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4",
      y1: "10",
      x2: "4",
      y2: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "21",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "20",
      y1: "21",
      x2: "20",
      y2: "16"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "20",
      y1: "12",
      x2: "20",
      y2: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "1",
      y1: "14",
      x2: "7",
      y2: "14"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "8",
      x2: "15",
      y2: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "17",
      y1: "16",
      x2: "23",
      y2: "16"
    }))
  }))
};
window.KI = KI;
})(); } catch (e) { __ds_ns.__errors.push({ path: "kontoauszug/ka-icons.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-app.jsx
try { (() => {
// ============================================================================
// Buchung bearbeiten — Positions-Ansicht. Drawer-Shell + Verdrahtung.
// Depends on mb-icons, mb-money, mb-data, mb-position, mb-datev.
// ============================================================================
const {
  useState: useStateA,
  useEffect: useEffectA,
  useRef: useRefA
} = React;

// ---- Kontext-Hintergrund (Buchungsjournal, gedimmt) ------------------------
const JOURNAL = [{
  d: "16.07.",
  beleg: "202605034299",
  txt: "M-net Telekommunikations GmbH",
  betr: "379,49",
  st: "prüfen",
  active: true
}, {
  d: "16.07.",
  beleg: "4471",
  txt: "Metro Deutschland GmbH",
  betr: "345,00",
  st: "prüfen"
}, {
  d: "15.07.",
  beleg: "RE-88021",
  txt: "Deutsche Bahn AG",
  betr: "128,40",
  st: "gebucht"
}, {
  d: "15.07.",
  beleg: "2026-1180",
  txt: "Adobe Systems Software",
  betr: "71,39",
  st: "gebucht"
}, {
  d: "14.07.",
  beleg: "ENG-0090",
  txt: "Northbound Studios Ltd.",
  betr: "2.500,00",
  st: "prüfen"
}, {
  d: "14.07.",
  beleg: "R-4402",
  txt: "Bürocentrum Haas e.K.",
  betr: "149,00",
  st: "gebucht"
}, {
  d: "12.07.",
  beleg: "ST-9910",
  txt: "Stadtwerke München",
  betr: "212,66",
  st: "gebucht"
}];
function Backdrop() {
  return /*#__PURE__*/React.createElement("div", {
    className: "backdrop",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bd-top"
  }, /*#__PURE__*/React.createElement("img", {
    className: "bd-mark",
    src: "assets/ludwig-mark.svg",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "bd-crumb"
  }, "Mandant Muster GmbH", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Buchungen", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Juli 2026"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bd-search"
  }, MB.search({
    size: 15
  }), " Buchung suchen")), /*#__PURE__*/React.createElement("div", {
    className: "bd-body"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "bd-h"
  }, "Buchungsjournal"), /*#__PURE__*/React.createElement("table", {
    className: "bd-tab"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Belegfeld"), /*#__PURE__*/React.createElement("th", null, "Buchungstext"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Betrag"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, JOURNAL.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: r.active ? "is-active" : ""
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.d), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.beleg), /*#__PURE__*/React.createElement("td", null, r.txt), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, r.betr, " \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "jst jst--" + r.st
  }, r.st === "gebucht" ? "gebucht" : "zu prüfen"))))))));
}

// ---- App -------------------------------------------------------------------
const STATE_ORDER = ["ki", "split", "neu", "gesperrt", "s13b"];
function App() {
  const [stateKey, setStateKey] = useStateA(() => localStorage.getItem("ludwig.mb.state") || "ki");
  const set = k => {
    setStateKey(k);
    localStorage.setItem("ludwig.mb.state", k);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "demobar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "demobar__lbl"
  }, "Zustand (Demo)"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, STATE_ORDER.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: stateKey === k ? "active" : "",
    onClick: () => set(k)
  }, BOOKINGS[k].label)))), /*#__PURE__*/React.createElement("div", {
    className: "scene"
  }, /*#__PURE__*/React.createElement(Backdrop, null), /*#__PURE__*/React.createElement("div", {
    className: "scrim"
  }), /*#__PURE__*/React.createElement(BookingEditor, {
    key: stateKey,
    makeBooking: BOOKINGS[stateKey].make,
    onClose: () => {}
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-app.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-app4.jsx
try { (() => {
// ============================================================================
// v4 — App: Demo-Kontrollleiste (§12) + Matrix-Orchestrierung. Eine Komponente,
// vier Projektionen. dichte=liste -> nur Projektion A, mehrere Sätze; dichte=
// fokus -> Panel mit Tabs (Einfach ↔ DATEV) + Modus-Wechsel (Anzeige ↔ Bearbeiten).
// Depends on: mb-icons, mb-money, mb-data, mb-data4, mb-position, mb-datev,
//   mb-datev-edit, mb-proj4, mb-editorC.
// ============================================================================
const {
  useState: useStateApp,
  useEffect: useEffectApp
} = React;
const LS = "ludwig.mb4.";
const useParam = (key, def) => {
  const [v, setV] = useStateApp(() => localStorage.getItem(LS + key) || def);
  const set = nv => {
    setV(nv);
    localStorage.setItem(LS + key, nv);
  };
  return [v, set];
};

// ---- Projektion D — Bearbeiten Vollständig (Roheditor) ---------------------
function ProjectionD({
  b,
  onCancel
}) {
  const [lines, setLines] = useStateApp(() => buildDatevLines(b));
  const {
    diff
  } = linesSaldo(lines);
  const [flash, setFlash] = useStateApp(false);
  const canSubmit = diff === 0;
  const doSubmit = () => {
    if (!canSubmit) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "projd"
  }, b.fallback && /*#__PURE__*/React.createElement("div", {
    className: "cfallback",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cfallback__ic"
  }, MB.info({
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cfallback__t"
  }, "DATEV-Zeilenansicht \u2014 Experten-Tab"), /*#__PURE__*/React.createElement("div", {
    className: "cfallback__s"
  }, b.einfachReason))), /*#__PURE__*/React.createElement(EditableDatevTable, {
    lines: lines,
    onChange: setLines,
    locked: false
  }), /*#__PURE__*/React.createElement("div", {
    className: "editbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "panel__hint"
  }, "Rohzeilen \xB7 jede Zeile, jedes Feld \xB7 Speichern erst bei ausgeglichenem Saldo (Generalumkehr, \xA713b, fx hier m\xF6glich)"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: onCancel
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm" + (flash ? " is-flash" : ""),
    disabled: !canSubmit,
    onClick: doSubmit
  }, flash ? /*#__PURE__*/React.createElement(React.Fragment, null, MB.check({
    size: 16
  }), " \xDCbernommen") : "Übernehmen")));
}

// ---- Fokus-Panel -----------------------------------------------------------
function FocusPanel({
  scId,
  modus,
  setModus,
  tab,
  setTab,
  varianteA,
  details,
  setDetails
}) {
  const b = React.useMemo(() => CATALOG4_BY[scId].make(), [scId]);
  const einfachAvail = modus === "bearbeiten" ? b.cAvail : b.aAvail;
  const effTab = tab === "einfach" && einfachAvail ? "einfach" : "datev";
  const cell = modus === "bearbeiten" ? effTab === "einfach" ? "C" : "D" : effTab === "einfach" ? "A" : "B";
  const cellName = {
    A: "Anzeige · Einfach",
    B: "Anzeige · Alle Zeilen",
    C: "Bearbeiten · Einfach",
    D: "Bearbeiten · Alle Zeilen"
  }[cell];
  const goEdit = () => {
    if (b.editAvail) setModus("bearbeiten");
  };
  const goView = () => setModus("anzeige");
  return /*#__PURE__*/React.createElement("div", {
    className: "v4-focus"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel__titlerow"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "panel__title"
  }, "Buchungssatz"), /*#__PURE__*/React.createElement("span", {
    className: "v4-matrixtag",
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement("b", null, cell), " ", cellName)), /*#__PURE__*/React.createElement("div", {
    className: "panel__doc"
  }, b.docLabel, " \xB7 ", b.partner), /*#__PURE__*/React.createElement("div", {
    className: "panel__meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "panel__date"
  }, b.date), b.origin === "ai" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--ai"
  }, MB.info({
    size: 12
  }), " KI-Vorschlag"), b.gu && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--gu"
  }, "GU \xB7 Storno"), b.aBadge === "Skonto" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--skonto"
  }, "Skonto"), b.status === "prüfen" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--pruefen"
  }, "zu pr\xFCfen"), b.status === "gebucht" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--gebucht"
  }, MB.lock({
    size: 11
  }), " gebucht"), b.status === "storniert" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--storno"
  }, "storniert"), b.belegfeld && /*#__PURE__*/React.createElement("span", {
    className: "bchip is-locked"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bchip__k"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("span", {
    className: "bchip__v mono"
  }, b.belegfeld), MB.lock({
    size: 12
  }))), b.contextNote && !b.splitContext && /*#__PURE__*/React.createElement("div", {
    className: "ctxline--v4"
  }, MB.link({
    size: 14
  }), " ", b.contextNote), b.splitContext && /*#__PURE__*/React.createElement("div", {
    className: "splitctx"
  }, /*#__PURE__*/React.createElement("span", {
    className: "splitctx__ic"
  }, "\u2442"), " ", b.splitContext.label), /*#__PURE__*/React.createElement("div", {
    className: "pbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pbar__tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ptab" + (effTab === "einfach" ? " is-active" : ""),
    disabled: !einfachAvail,
    title: !einfachAvail ? b.einfachReason : "",
    onClick: () => einfachAvail && setTab("einfach")
  }, "Einfach", !einfachAvail && /*#__PURE__*/React.createElement("span", {
    className: "ptab__lock"
  }, MB.lock({
    size: 12
  }))), /*#__PURE__*/React.createElement("button", {
    className: "ptab" + (effTab === "datev" ? " is-active" : ""),
    onClick: () => setTab("datev")
  }, "Alle Zeilen (DATEV)")), /*#__PURE__*/React.createElement("span", {
    className: "pbar__spacer"
  }), !b.editAvail ? /*#__PURE__*/React.createElement("span", {
    className: "modebtn is-locked"
  }, MB.lock({
    size: 15
  }), " Schreibgesch\xFCtzt") : modus === "bearbeiten" ? /*#__PURE__*/React.createElement("button", {
    className: "modebtn",
    onClick: goView
  }, MB.check({
    size: 15
  }), " Fertig") : /*#__PURE__*/React.createElement("button", {
    className: "modebtn is-edit",
    onClick: goEdit
  }, "Bearbeiten")), modus === "anzeige" && !b.aAvail && /*#__PURE__*/React.createElement("div", {
    className: "pnote"
  }, MB.info({
    size: 14
  }), " ", b.einfachReason), modus === "bearbeiten" && b.editAvail && !b.cAvail && /*#__PURE__*/React.createElement("div", {
    className: "pnote"
  }, MB.info({
    size: 14
  }), " ", b.einfachReason), b.origin === "ai" && modus === "bearbeiten" && b.editAvail && /*#__PURE__*/React.createElement("div", {
    className: "obanner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obanner__ic"
  }, MB.info({
    size: 15
  })), "KI-Vorschlag wird bearbeitet \u2014 die Buchung wird als ", /*#__PURE__*/React.createElement("b", null, "\u201EKI bearbeitet\u201C"), " markiert."), !b.editAvail && /*#__PURE__*/React.createElement("div", {
    className: "obanner obanner--lock"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obanner__ic"
  }, MB.lock({
    size: 15
  })), b.gu ? /*#__PURE__*/React.createElement(React.Fragment, null, "Storno-Satz (Generalumkehr) zu Buchung ", b.stornoRef, " \u2014 schreibgesch\xFCtzt.") : /*#__PURE__*/React.createElement(React.Fragment, null, "Bereits gebucht und am ", b.exportedAt, " exportiert \u2014 schreibgesch\xFCtzt. Korrektur nur per ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Storno (Generalumkehr)"), "."))), /*#__PURE__*/React.createElement("div", {
    className: "panel__body"
  }, cell === "A" && /*#__PURE__*/React.createElement("div", {
    className: "satz",
    style: {
      border: "none"
    }
  }, /*#__PURE__*/React.createElement(ProjectionA, {
    b: b,
    variant: varianteA
  })), cell === "B" && /*#__PURE__*/React.createElement(ProjectionB, {
    b: b
  }), cell === "C" && /*#__PURE__*/React.createElement(ProjectionC, {
    key: scId + "c",
    b: b,
    onCancel: goView
  }), cell === "D" && /*#__PURE__*/React.createElement(ProjectionD, {
    key: scId + "d",
    b: b,
    onCancel: goView
  })), (cell === "A" || cell === "B") && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 22px 18px"
    }
  }, /*#__PURE__*/React.createElement(SatzDetails, {
    b: b,
    open: details === "offen",
    onToggle: () => setDetails(details === "offen" ? "zu" : "offen")
  }))));
}

// ---- Listen-Modus (nur Projektion A) ---------------------------------------
function ListMode({
  varianteA,
  details,
  setDetails,
  onFocus
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "v4-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v4-list__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "v4-list__h"
  }, "Sachverhalt 2026-0051 \u2014 Buchungen"), /*#__PURE__*/React.createElement("span", {
    className: "v4-list__sub"
  }, "Projektion A inline \xB7 ", varianteA.toUpperCase(), " \xB7 Klick \xF6ffnet den Satz im Fokus")), /*#__PURE__*/React.createElement("div", {
    className: "v4-list__stack"
  }, LIST_ORDER4.map(id => {
    const b = CATALOG4_BY[id].make();
    return /*#__PURE__*/React.createElement("div", {
      className: "satz",
      key: id
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => onFocus(id),
      style: {
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(SatzHead, {
      b: b
    }), b.aAvail ? /*#__PURE__*/React.createElement(ProjectionA, {
      b: b,
      variant: varianteA
    }) : /*#__PURE__*/React.createElement("div", {
      className: "asatz"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pnote",
      style: {
        margin: "6px 0 4px"
      }
    }, MB.info({
      size: 14
    }), " Nicht kompakt darstellbar (", b.scLabel, ") \u2014 im Fokus als volle DATEV-Tabelle."))), /*#__PURE__*/React.createElement(SatzDetails, {
      b: b,
      open: details === "offen",
      onToggle: () => setDetails(details === "offen" ? "zu" : "offen")
    }));
  })));
}

// ---- App -------------------------------------------------------------------
function Seg({
  lbl,
  value,
  set,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "v4-ctl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "v4-ctl__lbl"
  }, lbl), /*#__PURE__*/React.createElement("div", {
    className: "v4-seg"
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.v,
    className: value === o.v ? "active" : "",
    disabled: o.disabled,
    title: o.title || "",
    onClick: () => !o.disabled && set(o.v)
  }, o.label))));
}
function App4() {
  const [szenario, setSz] = useParam("sc", "s1");
  const [modus, setModus] = useParam("modus", "anzeige");
  const [tab, setTab] = useParam("tab", "einfach");
  const [varianteA, setVA] = useParam("va", "a1");
  const [dichte, setDichte] = useParam("dichte", "fokus");
  const [details, setDetails] = useParam("details", "zu");
  const b = CATALOG4_BY[szenario].make();
  // editAvail respektieren: gesperrte Sätze fallen auf Anzeige zurück
  useEffectApp(() => {
    if (!b.editAvail && modus === "bearbeiten") setModus("anzeige");
  }, [szenario]);
  const onFocus = id => {
    setSz(id);
    setDichte("fokus");
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "v4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v4-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v4-barrow"
  }, /*#__PURE__*/React.createElement(Seg, {
    lbl: "Szenario",
    value: szenario,
    set: setSz,
    options: CATALOG4.map(c => ({
      v: c.id,
      label: c.label.split(" · ")[0],
      title: c.label
    }))
  }), /*#__PURE__*/React.createElement("span", {
    className: "v4-bar__note"
  }, "\xA712 \u2014 Szenario \xD7 Modus \xD7 Tab live durchschaltbar")), /*#__PURE__*/React.createElement("div", {
    className: "v4-barrow"
  }, /*#__PURE__*/React.createElement(Seg, {
    lbl: "Dichte",
    value: dichte,
    set: setDichte,
    options: [{
      v: "fokus",
      label: "Fokus"
    }, {
      v: "liste",
      label: "Liste"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    className: "v4-bar__sep"
  }), /*#__PURE__*/React.createElement(Seg, {
    lbl: "Modus",
    value: modus,
    set: setModus,
    options: [{
      v: "anzeige",
      label: "Anzeige"
    }, {
      v: "bearbeiten",
      label: "Bearbeiten",
      disabled: !b.editAvail,
      title: b.editAvail ? "" : b.einfachReason
    }]
  }), /*#__PURE__*/React.createElement(Seg, {
    lbl: "Tab",
    value: tab,
    set: setTab,
    options: [{
      v: "einfach",
      label: "Einfach"
    }, {
      v: "datev",
      label: "Alle Zeilen (DATEV)"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    className: "v4-bar__sep"
  }), /*#__PURE__*/React.createElement(Seg, {
    lbl: "Variante A",
    value: varianteA,
    set: setVA,
    options: [{
      v: "a1",
      label: "A1 Zweizeiler"
    }, {
      v: "a2",
      label: "A2 Einzeiler"
    }, {
      v: "a3",
      label: "A3 Chips"
    }]
  }), /*#__PURE__*/React.createElement(Seg, {
    lbl: "Details",
    value: details,
    set: setDetails,
    options: [{
      v: "zu",
      label: "Zu"
    }, {
      v: "offen",
      label: "Offen"
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    className: "v4-stage"
  }, dichte === "liste" ? /*#__PURE__*/React.createElement(ListMode, {
    varianteA: varianteA,
    details: details,
    setDetails: setDetails,
    onFocus: onFocus
  }) : /*#__PURE__*/React.createElement(FocusPanel, {
    scId: szenario,
    modus: modus,
    setModus: setModus,
    tab: tab,
    setTab: setTab,
    varianteA: varianteA,
    details: details,
    setDetails: setDetails
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App4, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-app4.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-data.jsx
try { (() => {
// ============================================================================
// Datenmodell — Buchungssätze, Kontenrahmen (SKR03-nah), USt-Sätze.
// Eine Buchung ist eine Liste von Positionen (Sachzeilen, brutto + USt-Satz)
// plus eine Gegenseite (Personenkonto). Steuerzeilen sind NICHT gespeichert —
// sie werden aus Position + USt-Satz abgeleitet und beim Speichern expandiert.
// ============================================================================

// ---- USt-Sätze (Eingangs-/Vorsteuerseite) ---------------------------------
// key = DATEV-BU-Schlüssel, taxAccount = Steuerkonto (SKR03)
const VAT_RATES = {
  vst19: {
    label: "19 % Vorsteuer (BU 9)",
    short: "19 % VSt",
    rate: 19,
    bu: "9",
    taxAccount: "1576",
    taxName: "Abziehbare Vorsteuer 19 %",
    side: "in"
  },
  vst7: {
    label: "7 % Vorsteuer (BU 8)",
    short: "7 % VSt",
    rate: 7,
    bu: "8",
    taxAccount: "1571",
    taxName: "Abziehbare Vorsteuer 7 %",
    side: "in"
  },
  none: {
    label: "ohne USt",
    short: "ohne USt",
    rate: 0,
    bu: "",
    taxAccount: null,
    taxName: null,
    side: "in"
  }
};
const VAT_ORDER = ["vst19", "vst7", "none"];

// ---- Kontenrahmen (Auszug) -------------------------------------------------
// automatic + impliedRate: Automatikkonto versteuert selbst -> USt-Select fix.
const ACCOUNTS = [{
  no: "4920",
  name: "Telefon",
  kind: "aufwand"
}, {
  no: "4925",
  name: "Internetkosten",
  kind: "aufwand"
}, {
  no: "3400",
  name: "Wareneingang 19 % Vorsteuer",
  kind: "aufwand"
}, {
  no: "3300",
  name: "Wareneingang 7 % Vorsteuer",
  kind: "aufwand"
}, {
  no: "4930",
  name: "Bürobedarf",
  kind: "aufwand"
}, {
  no: "4210",
  name: "Miete unbewegliche Wirtschaftsgüter",
  kind: "aufwand"
}, {
  no: "4200",
  name: "Raumkosten / Stellplatz",
  kind: "aufwand"
}, {
  no: "4230",
  name: "Heizung",
  kind: "aufwand"
}, {
  no: "4400",
  name: "Erlöse 19 % USt",
  kind: "erloes",
  automatic: true,
  impliedRate: 19
}, {
  no: "8400",
  name: "Erlöse 19 % USt (Automatik)",
  kind: "erloes",
  automatic: true,
  impliedRate: 19
}, {
  no: "8300",
  name: "Erlöse 7 % USt (Automatik)",
  kind: "erloes",
  automatic: true,
  impliedRate: 7
}];
const CREDITORS = [{
  no: "70050",
  name: "Immobilien Vogt KG"
}, {
  no: "82050",
  name: "M-net Telekommunikations GmbH"
}, {
  no: "82040",
  name: "Telekom Deutschland GmbH"
}, {
  no: "1210",
  name: "Volksbank Giro"
}, {
  no: "70012",
  name: "Metro Deutschland GmbH"
}, {
  no: "70330",
  name: "Bürocentrum Haas e.K."
}, {
  no: "1200",
  name: "Bank (Geschäftskonto)"
}, {
  no: "1000",
  name: "Kasse"
}];
function accountLabel(no) {
  const a = ACCOUNTS.find(x => x.no === no) || CREDITORS.find(x => x.no === no);
  return a ? a.no + " — " + a.name : no;
}
function findAccount(no) {
  return ACCOUNTS.find(x => x.no === no);
}
let __pid = 0;
const pid = () => "p" + ++__pid;

// ---- Buchungssätze (Zustände) ----------------------------------------------
// Position: { id, account, grossInput ("Brutto" als DE-String), vat (key),
//             text, kost1, kost2, confidence ("high"|"review"), locked? }
function bookingKI() {
  return {
    id: "202605034299",
    docLabel: "Rechnung 202605034299",
    partner: "M-net Telekommunikations GmbH",
    date: "11.07.2026",
    belegfeld: "202605034299",
    belegfeldLocked: true,
    origin: "ai",
    // KI-Vorschlag -> wird zu „KI bearbeitet"
    side: "in",
    // Eingangsrechnung
    text: "M-net Telekommunikation Juni 2026",
    positions: [{
      id: pid(),
      account: "4920",
      grossInput: "379,49",
      vat: "vst19",
      text: "M-net Telekommunikation Juni 2026",
      kost1: "",
      kost2: "",
      confidence: "high"
    }],
    counter: {
      account: "82050",
      note: null
    }
  };
}
function bookingSplit() {
  return {
    id: "RE-2026-4471",
    docLabel: "Rechnung 4471",
    partner: "Metro Deutschland GmbH",
    date: "09.07.2026",
    belegfeld: "4471",
    belegfeldLocked: true,
    origin: "ai",
    side: "in",
    text: "Metro Einkauf Kanzleibedarf + Bewirtung",
    positions: [{
      id: pid(),
      account: "3400",
      grossInput: "238,00",
      vat: "vst19",
      text: "Wareneingang 19 %",
      kost1: "",
      kost2: "",
      confidence: "high"
    }, {
      id: pid(),
      account: "3300",
      grossInput: "107,00",
      vat: "vst7",
      text: "Wareneingang 7 %",
      kost1: "",
      kost2: "",
      confidence: "review"
    }],
    counter: {
      account: "70012",
      note: "unklar → Review"
    }
  };
}
function bookingNew() {
  return {
    id: null,
    docLabel: "Neue Buchung",
    partner: "Bürocentrum Haas e.K.",
    date: "16.07.2026",
    belegfeld: "",
    belegfeldLocked: false,
    origin: "manual",
    side: "in",
    text: "",
    positions: [{
      id: pid(),
      account: "",
      grossInput: "149,00",
      vat: "vst19",
      text: "",
      kost1: "",
      kost2: "",
      confidence: null
    }],
    counter: {
      account: "70330",
      note: null
    }
  };
}
function bookingLocked() {
  const b = bookingKI();
  b.locked = true;
  b.exportedAt = "12.07.2026, 08:14";
  b.docLabel = "Rechnung 202605034299";
  return b;
}

// §13b — nicht faltbar: Steuerzeile auf der Gegenseite. Fällt in DATEV-Modus.
function bookingReverseCharge() {
  return {
    id: "ENG-2026-0090",
    docLabel: "Rechnung ENG-0090",
    partner: "Northbound Studios Ltd. (UK)",
    date: "07.07.2026",
    belegfeld: "ENG0090",
    belegfeldLocked: true,
    origin: "ai",
    side: "in",
    fallback: "reverse_charge",
    fallbackReason: "Dieser Satz enthält §13b-Steuerzeilen (Reverse-Charge) — er wird in der DATEV-Zeilenansicht bearbeitet.",
    text: "Design-Leistung §13b UStG",
    // Rohzeilen direkt (nicht faltbar): netto Aufwand, USt + VSt §13b, Gegenseite
    rawLines: [{
      account: "4909",
      name: "Fremdleistungen §13b",
      soll: "2500,00",
      haben: "",
      bu: "94",
      text: "Design-Leistung §13b",
      kost1: ""
    }, {
      account: "1577",
      name: "Abziehbare Vorsteuer §13b 19 %",
      soll: "475,00",
      haben: "",
      bu: "",
      text: "§13b Vorsteuer",
      kost1: ""
    }, {
      account: "1787",
      name: "Umsatzsteuer §13b 19 %",
      soll: "",
      haben: "475,00",
      bu: "",
      text: "§13b Umsatzsteuer",
      kost1: ""
    }, {
      account: "70090",
      name: "Northbound Studios Ltd.",
      soll: "",
      haben: "2500,00",
      bu: "",
      text: "Design-Leistung §13b",
      kost1: ""
    }],
    counter: {
      account: "70090"
    }
  };
}
const BOOKINGS = {
  ki: {
    label: "KI-Vorschlag",
    make: bookingKI
  },
  split: {
    label: "Aufteilung",
    make: bookingSplit
  },
  neu: {
    label: "Neuanlage",
    make: bookingNew
  },
  gesperrt: {
    label: "Gesperrt",
    make: bookingLocked
  },
  s13b: {
    label: "§13b (DATEV)",
    make: bookingReverseCharge
  }
};
window.VAT_RATES = VAT_RATES;
window.VAT_ORDER = VAT_ORDER;
window.ACCOUNTS = ACCOUNTS;
window.CREDITORS = CREDITORS;
window.accountLabel = accountLabel;
window.findAccount = findAccount;
window.pid = pid;
window.BOOKINGS = BOOKINGS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-data.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-data2.jsx
try { (() => {
// ============================================================================
// v2 — Buchungssätze im Kontext des Sachverhalts „Mietverhältnis Büro
// Lindenstraße" (2026-0051). Der Drawer wird aus dem Sachverhalt heraus
// geöffnet, um eine Buchung zu prüfen/korrigieren. Nutzt Kontenrahmen,
// USt-Sätze und Helfer aus mb-data.jsx.
// ============================================================================
const CTX = "Sachverhalt 2026-0051 · Mietverhältnis Büro Lindenstraße";

// Haupt-Flow: KI-Buchungsvorschlag „Mietaufwand Februar" prüfen.
function v2KI() {
  return {
    id: "MV-2026-02",
    docLabel: "Buchungsvorschlag Mietaufwand Februar",
    partner: "Immobilien Vogt KG",
    date: "28.02.2026",
    belegfeld: "MV-2026-02",
    belegfeldLocked: true,
    origin: "ai",
    side: "in",
    contextNote: CTX,
    text: "Miete Büro Lindenstraße Februar 2026",
    positions: [{
      id: pid(),
      account: "4210",
      grossInput: "2.142,00",
      vat: "vst19",
      text: "Grundmiete Februar 2026",
      kost1: "",
      kost2: "",
      confidence: "high"
    }],
    counter: {
      account: "70050",
      note: null
    }
  };
}

// Aufteilung: Grundmiete + Stellplatz — Gegenseite zählt live hoch.
function v2Split() {
  return {
    id: "MV-2026-03",
    docLabel: "Buchungsvorschlag Miete + Stellplatz März",
    partner: "Immobilien Vogt KG",
    date: "31.03.2026",
    belegfeld: "MV-2026-03",
    belegfeldLocked: true,
    origin: "ai",
    side: "in",
    contextNote: CTX,
    text: "Miete Büro Lindenstraße März 2026",
    positions: [{
      id: pid(),
      account: "4210",
      grossInput: "2.142,00",
      vat: "vst19",
      text: "Grundmiete März 2026",
      kost1: "",
      kost2: "",
      confidence: "high"
    }, {
      id: pid(),
      account: "4200",
      grossInput: "178,50",
      vat: "vst19",
      text: "Tiefgaragen-Stellplatz Nr. 14",
      kost1: "",
      kost2: "",
      confidence: "review"
    }],
    counter: {
      account: "70050",
      note: "unklar → Review"
    }
  };
}

// Neuanlage: leere Position, Gegenseite + Brutto aus dem Sachverhalt-Kontext.
function v2New() {
  return {
    id: null,
    docLabel: "Neue Buchung im Sachverhalt",
    partner: "Immobilien Vogt KG",
    date: "30.04.2026",
    belegfeld: "",
    belegfeldLocked: false,
    origin: "manual",
    side: "in",
    contextNote: CTX,
    text: "",
    positions: [{
      id: pid(),
      account: "",
      grossInput: "2.142,00",
      vat: "vst19",
      text: "",
      kost1: "",
      kost2: "",
      confidence: null
    }],
    counter: {
      account: "70050",
      note: null
    }
  };
}

// Gesperrt: Januar-Miete bereits gebucht + exportiert.
function v2Locked() {
  const b = v2KI();
  b.locked = true;
  b.exportedAt = "05.02.2026, 09:20";
  b.docLabel = "Mietaufwand Januar";
  b.belegfeld = "MV-2026-01";
  b.date = "31.01.2026";
  b.text = "Miete Büro Lindenstraße Januar 2026";
  b.positions[0].text = "Grundmiete Januar 2026";
  b.origin = "posted";
  return b;
}

// §13b — nicht faltbar (Reverse-Charge einer Auslandsleistung im Vorgang).
function v2ReverseCharge() {
  return {
    id: "ENG-2026-0090",
    docLabel: "Rechnung ENG-0090",
    partner: "Northbound Studios Ltd. (UK)",
    date: "07.03.2026",
    belegfeld: "ENG0090",
    belegfeldLocked: true,
    origin: "ai",
    side: "in",
    contextNote: CTX,
    fallback: "reverse_charge",
    fallbackReason: "Dieser Satz enthält §13b-Steuerzeilen (Reverse-Charge) — er wird in der DATEV-Zeilenansicht bearbeitet.",
    text: "Planungsleistung Umbau §13b UStG",
    rawLines: [{
      account: "4909",
      name: "Fremdleistungen §13b",
      soll: "2500,00",
      haben: "",
      bu: "94",
      text: "Planungsleistung §13b",
      kost1: ""
    }, {
      account: "1577",
      name: "Abziehbare Vorsteuer §13b 19 %",
      soll: "475,00",
      haben: "",
      bu: "",
      text: "§13b Vorsteuer",
      kost1: ""
    }, {
      account: "1787",
      name: "Umsatzsteuer §13b 19 %",
      soll: "",
      haben: "475,00",
      bu: "",
      text: "§13b Umsatzsteuer",
      kost1: ""
    }, {
      account: "70090",
      name: "Northbound Studios Ltd.",
      soll: "",
      haben: "2500,00",
      bu: "",
      text: "Planungsleistung §13b",
      kost1: ""
    }],
    counter: {
      account: "70090"
    }
  };
}
const BOOKINGS2 = {
  ki: {
    label: "KI-Vorschlag",
    make: v2KI
  },
  split: {
    label: "Aufteilung",
    make: v2Split
  },
  neu: {
    label: "Neuanlage",
    make: v2New
  },
  gesperrt: {
    label: "Gesperrt",
    make: v2Locked
  },
  s13b: {
    label: "§13b (DATEV)",
    make: v2ReverseCharge
  }
};
window.BOOKINGS2 = BOOKINGS2;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-data2.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-data3.jsx
try { (() => {
// ============================================================================
// v3 — Szenario-Katalog. Verallgemeinertes Rollenmodell: n Detailzeilen +
// 1 Sammelseite. kind "rechnung" (Positionen + USt) | "zahlung" (Posten:
// Personenkonto + Betrag + Belegfeld je Rechnung, Ziel-Abgleich gegen die
// Bank-Transaktion). fallback (§13b/FX) -> nur DATEV-Tab.
// Nutzt Kontenrahmen/USt/Helfer aus mb-data.jsx.
// ============================================================================
const CTX3 = "Sachverhalt 2026-0051 · Mietverhältnis Büro Lindenstraße";

// S1 — Eingangsrechnung, eine Position
function s1() {
  return {
    kind: "rechnung",
    scenario: "S1",
    scLabel: "Rechnung",
    docLabel: "Rechnung 202605034299",
    partner: "M-net Telekommunikations GmbH",
    refKind: "Beleg",
    date: "11.07.2026",
    belegfeld: "202605034299",
    belegfeldLocked: true,
    origin: "ai",
    contextNote: CTX3,
    text: "M-net Telekommunikation Juni 2026",
    positions: [{
      id: pid(),
      account: "4920",
      grossInput: "379,49",
      vat: "vst19",
      text: "M-net Telekommunikation Juni 2026",
      kost1: "",
      kost2: "",
      confidence: "high"
    }],
    counter: {
      account: "82050",
      note: null
    }
  };
}
// S2 — Aufteilung
function s2() {
  return {
    kind: "rechnung",
    scenario: "S2",
    scLabel: "Aufteilung",
    docLabel: "Rechnung 4471",
    partner: "Metro Deutschland GmbH",
    refKind: "Beleg",
    date: "09.07.2026",
    belegfeld: "4471",
    belegfeldLocked: true,
    origin: "ai",
    contextNote: CTX3,
    text: "Metro Einkauf Kanzleibedarf + Bewirtung",
    positions: [{
      id: pid(),
      account: "3400",
      grossInput: "238,00",
      vat: "vst19",
      text: "Wareneingang 19 %",
      kost1: "",
      kost2: "",
      confidence: "high"
    }, {
      id: pid(),
      account: "3300",
      grossInput: "107,00",
      vat: "vst7",
      text: "Wareneingang 7 %",
      kost1: "",
      kost2: "",
      confidence: "review"
    }],
    counter: {
      account: "70012",
      note: null
    }
  };
}
// S3 — Multizahlung (eine Zahlung an mehrere Kreditoren)
function s3() {
  return {
    kind: "zahlung",
    scenario: "S3",
    scLabel: "Multizahlung",
    docLabel: "Sammellastschrift",
    partner: "Volksbank",
    refKind: "Transaktion",
    date: "11.07.2026",
    origin: "ai",
    contextNote: CTX3,
    text: "Sammelzahlung Kreditoren KW 28",
    targetInput: "468,49",
    // Soll aus der Bank-Transaktion
    posten: [{
      id: pid(),
      account: "82050",
      amountInput: "379,49",
      belegfeld: "202605034299",
      confidence: "high"
    }, {
      id: pid(),
      account: "82040",
      amountInput: "89,00",
      belegfeld: "RG-2026-0815",
      confidence: "review"
    }],
    counter: {
      account: "1210",
      note: null
    }
  };
}
// S4 — Zahlung mit Skonto (Ausbaustufe -> Hinweis, DATEV-Tab)
function s4() {
  return {
    kind: "zahlung",
    scenario: "S4",
    scLabel: "Skonto",
    skonto: true,
    docLabel: "Zahlung mit Skonto",
    partner: "Volksbank",
    refKind: "Transaktion",
    date: "11.07.2026",
    origin: "ai",
    contextNote: CTX3,
    text: "Zahlung M-net abzüglich 2 % Skonto",
    targetInput: "371,90",
    posten: [{
      id: pid(),
      account: "82050",
      amountInput: "379,49",
      belegfeld: "202605034299",
      confidence: "high"
    }],
    counter: {
      account: "1210",
      note: null
    }
  };
}
// S5 — Reverse Charge / §13b -> nur DATEV
function s5() {
  return {
    kind: "rechnung",
    scenario: "S5",
    scLabel: "§13b",
    fallback: "reverse_charge",
    fallbackReason: "Zwei Steuerzeilen (§13b) — dieser Satz ist nur in der Zeilenansicht darstellbar.",
    docLabel: "Rechnung ENG-0090",
    partner: "Northbound Studios Ltd. (UK)",
    refKind: "Beleg",
    date: "07.07.2026",
    belegfeld: "ENG0090",
    belegfeldLocked: true,
    origin: "ai",
    contextNote: CTX3,
    text: "Planungsleistung §13b UStG",
    rawLines: [{
      account: "4909",
      name: "Fremdleistungen §13b",
      soll: "2500,00",
      haben: "",
      bu: "94",
      text: "Planungsleistung §13b",
      kost1: ""
    }, {
      account: "1577",
      name: "Abziehbare Vorsteuer §13b 19 %",
      soll: "475,00",
      haben: "",
      bu: "",
      text: "§13b Vorsteuer",
      kost1: ""
    }, {
      account: "1787",
      name: "Umsatzsteuer §13b 19 %",
      soll: "",
      haben: "475,00",
      bu: "",
      text: "§13b Umsatzsteuer",
      kost1: ""
    }, {
      account: "70090",
      name: "Northbound Studios Ltd.",
      soll: "",
      haben: "2500,00",
      bu: "",
      text: "Planungsleistung §13b",
      kost1: ""
    }],
    counter: {
      account: "70090"
    }
  };
}
// S6 — Fremdwährung -> nur DATEV
function s6() {
  return {
    kind: "rechnung",
    scenario: "S6",
    scLabel: "Fremdwährung",
    fallback: "fx",
    fallbackReason: "Fremdwährung (USD) — dieser Satz ist nur in der Zeilenansicht darstellbar.",
    docLabel: "Invoice 2026-US-114",
    partner: "Cloudpeak Inc. (US)",
    refKind: "Beleg",
    date: "05.07.2026",
    belegfeld: "US114",
    belegfeldLocked: true,
    origin: "ai",
    contextNote: CTX3,
    text: "SaaS-Abonnement Q3 (USD)",
    rawLines: [{
      account: "4920",
      name: "Fremdleistungen / SaaS",
      soll: "1.842,50",
      haben: "",
      bu: "",
      text: "SaaS Q3 · 2.000,00 USD @ 0,92125",
      kost1: ""
    }, {
      account: "70114",
      name: "Cloudpeak Inc.",
      soll: "",
      haben: "1.842,50",
      bu: "",
      text: "SaaS Q3 · 2.000,00 USD",
      kost1: ""
    }],
    counter: {
      account: "70114"
    }
  };
}
// S7 — Gesperrt (Storno-Verweis)
function s7() {
  const b = s1();
  b.scenario = "S7";
  b.scLabel = "Gesperrt";
  b.locked = true;
  b.exportedAt = "12.07.2026, 08:14";
  b.origin = "posted";
  b.docLabel = "Rechnung 202605034299 (gebucht)";
  return b;
}
const BOOKINGS3 = {
  s1: {
    label: "S1 · Rechnung",
    make: s1
  },
  s2: {
    label: "S2 · Aufteilung",
    make: s2
  },
  s3: {
    label: "S3 · Multizahlung",
    make: s3
  },
  s4: {
    label: "S4 · Skonto",
    make: s4
  },
  s5: {
    label: "S5 · §13b",
    make: s5
  },
  s6: {
    label: "S6 · Fremdwährung",
    make: s6
  },
  s7: {
    label: "S7 · Gesperrt",
    make: s7
  }
};
window.BOOKINGS3 = BOOKINGS3;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-data3.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-data4.jsx
try { (() => {
// ============================================================================
// v4 — Szenario-Katalog (§4) als Design-Parameter. Ein Buchungssatz-Modell,
// vier Projektionen (A/B/C/D). Verfügbarkeit je Zelle explizit (aAvail/cAvail/
// editAvail) — die Matrix-Logik in mb-app4 leitet daraus Tabs + Modus ab.
// Nutzt Kontenrahmen/USt/Helfer aus mb-data.jsx, Mathematik aus mb-money.jsx.
// ============================================================================

// Kontenrahmen-Ergänzungen für die v4-Szenarien (mutiert die globalen Listen).
[{
  no: "4650",
  name: "Bewirtungskosten",
  kind: "aufwand"
}, {
  no: "4654",
  name: "Nicht abziehbare Bewirtungskosten",
  kind: "aufwand"
}, {
  no: "4909",
  name: "Fremdleistungen §13b",
  kind: "aufwand"
}, {
  no: "1200",
  name: "Bank (Geschäftskonto)",
  kind: "geld"
}].forEach(a => {
  if (!ACCOUNTS.find(x => x.no === a.no)) ACCOUNTS.push(a);
});
[{
  no: "10001",
  name: "Kanzlei Berger & Partner mbB"
}, {
  no: "70090",
  name: "Northbound Studios Ltd. (UK)"
}, {
  no: "70114",
  name: "Cloudpeak Inc. (US)"
}, {
  no: "70420",
  name: "Gebr. Sander GbR"
}].forEach(c => {
  if (!CREDITORS.find(x => x.no === c.no)) CREDITORS.push(c);
});
const CTX4 = "Sachverhalt 2026-0051 · Mietverhältnis Büro Lindenstraße";

// worst-of Ampel über alle Positionen/Posten
function satzAmpel(lines) {
  if (!lines || !lines.length) return null;
  if (lines.some(l => l.confidence === "review")) return "review";
  if (lines.some(l => !l.confidence)) return "review";
  return "high";
}

// ---- Szenarien -------------------------------------------------------------
// S1 — Eingangsrechnung, 1 Position
function s1() {
  return {
    scenario: "S1",
    scLabel: "Eingangsrechnung",
    kind: "rechnung",
    side: "in",
    docLabel: "Rechnung 202605034299",
    partner: "M-net Telekommunikations GmbH",
    refKind: "Beleg",
    date: "11.07.2026",
    belegfeld: "202605034299",
    belegfeldLocked: true,
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "M-net Telekommunikation Juni 2026",
    positions: [{
      id: pid(),
      account: "4920",
      sh: "S",
      grossInput: "379,49",
      vat: "vst19",
      text: "Telefon Juni 2026",
      kost1: "",
      kost2: "",
      confidence: "high"
    }],
    counter: {
      account: "82050"
    },
    aAvail: true,
    cAvail: true,
    editAvail: true,
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "DATEV-Beleg-Import · Regel „Telekom-Rechnung“",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S2 — Aufteilung, n Positionen, 1 Kreditor (Bewirtung 19/7-Mix, KOST befüllt)
function s2() {
  return {
    scenario: "S2",
    scLabel: "Aufteilung",
    kind: "rechnung",
    side: "in",
    docLabel: "Rechnung 4471",
    partner: "Ratskeller Gastronomie GmbH",
    refKind: "Beleg",
    date: "09.07.2026",
    belegfeld: "4471",
    belegfeldLocked: true,
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "Geschäftsessen Mandantentermin Berger",
    positions: [{
      id: pid(),
      account: "4650",
      sh: "S",
      grossInput: "238,00",
      vat: "vst19",
      text: "Bewirtung abziehbar",
      kost1: "120",
      kost2: "",
      confidence: "high"
    }, {
      id: pid(),
      account: "4654",
      sh: "S",
      grossInput: "107,00",
      vat: "vst7",
      text: "Trinkgeld / nicht abziehbar",
      kost1: "120",
      kost2: "",
      confidence: "review"
    }],
    counter: {
      account: "70012"
    },
    aAvail: true,
    cAvail: true,
    editAvail: true,
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "DATEV-Beleg-Import · Bewirtungs-Regel",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S3 — Multizahlung, n Personenkonten an 1 Bank
function s3() {
  return {
    scenario: "S3",
    scLabel: "Multizahlung",
    kind: "zahlung",
    side: "in",
    docLabel: "Sammellastschrift KW 28",
    partner: "Volksbank Giro",
    refKind: "Transaktion",
    date: "11.07.2026",
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "Sammelzahlung Kreditoren KW 28",
    targetInput: "468,49",
    posten: [{
      id: pid(),
      account: "82050",
      amountInput: "379,49",
      belegfeld: "202605034299",
      confidence: "high"
    }, {
      id: pid(),
      account: "82040",
      amountInput: "89,00",
      belegfeld: "RG-2026-0815",
      confidence: "review"
    }],
    counter: {
      account: "1210"
    },
    aAvail: true,
    cAvail: true,
    editAvail: true,
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "Bank-Transaktion · Betrags-/Kreditor-Match",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S3b — Zahlungssplit-Anteil (Teilbetrag einer Bank-Tx)
function s3b() {
  return {
    scenario: "S3b",
    scLabel: "Zahlungssplit",
    kind: "zahlung",
    side: "in",
    docLabel: "Anteil an Sammelzahlung",
    partner: "Volksbank Giro",
    refKind: "Transaktion",
    date: "11.07.2026",
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "Zahlung Telekom aus Sammellastschrift",
    targetInput: "89,00",
    splitContext: {
      total: "468,49",
      label: "Anteil einer Sammelzahlung von 468,49 € (Volksbank, 11.07.2026)"
    },
    posten: [{
      id: pid(),
      account: "82040",
      amountInput: "89,00",
      belegfeld: "RG-2026-0815",
      confidence: "high"
    }],
    counter: {
      account: "1210"
    },
    aAvail: true,
    cAvail: true,
    editAvail: true,
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "Bank-Transaktion · Zahlungssplit",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S4 — Zahlung mit Skonto (A mit Badge, kein C -> D)
function s4() {
  return {
    scenario: "S4",
    scLabel: "Skonto",
    kind: "zahlung",
    side: "in",
    docLabel: "Zahlung M-net (Skonto)",
    partner: "Volksbank Giro",
    refKind: "Transaktion",
    date: "11.07.2026",
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "Zahlung M-net abzüglich 2 % Skonto",
    targetInput: "371,90",
    skonto: true,
    skontoBase: "379,49",
    posten: [{
      id: pid(),
      account: "82050",
      amountInput: "379,49",
      belegfeld: "202605034299",
      confidence: "high"
    }],
    counter: {
      account: "1210"
    },
    aAvail: true,
    cAvail: false,
    editAvail: true,
    aBadge: "Skonto",
    einfachReason: "Skontoabzug erzeugt eine Aufwands- und eine Steuerkorrekturzeile — bitte in der Zeilenansicht (DATEV) erfassen.",
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "Bank-Transaktion · Skonto-Erkennung 2 %",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S5 — §13b / Reverse Charge (nur B/D)
function s5() {
  return {
    scenario: "S5",
    scLabel: "§13b",
    kind: "rechnung",
    side: "in",
    fallback: "reverse_charge",
    docLabel: "Rechnung ENG-0090",
    partner: "Northbound Studios Ltd. (UK)",
    refKind: "Beleg",
    date: "07.07.2026",
    belegfeld: "ENG0090",
    belegfeldLocked: true,
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "Planungsleistung §13b UStG",
    counter: {
      account: "70090"
    },
    aAvail: false,
    cAvail: false,
    editAvail: true,
    einfachReason: "Reverse-Charge (§13b) erzeugt zwei Steuerzeilen — dieser Satz ist nur in der Zeilenansicht (DATEV) darstellbar.",
    rawLines: [{
      account: "4909",
      name: "Fremdleistungen §13b",
      soll: "2.500,00",
      haben: "",
      bu: "94",
      text: "Planungsleistung §13b",
      belegfeld: "ENG0090",
      kost1: "",
      confidence: "high"
    }, {
      account: "1577",
      name: "Abziehbare Vorsteuer §13b 19 %",
      soll: "475,00",
      haben: "",
      bu: "",
      text: "§13b Vorsteuer",
      belegfeld: "ENG0090",
      kost1: "",
      derived: true
    }, {
      account: "1787",
      name: "Umsatzsteuer §13b 19 %",
      soll: "",
      haben: "475,00",
      bu: "",
      text: "§13b Umsatzsteuer",
      belegfeld: "ENG0090",
      kost1: "",
      derived: true
    }, {
      account: "70090",
      name: "Northbound Studios Ltd.",
      soll: "",
      haben: "2.500,00",
      bu: "",
      text: "Planungsleistung §13b",
      belegfeld: "ENG0090",
      kost1: "",
      counter: true
    }],
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "DATEV-Beleg-Import · §13b-Erkennung",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S6 — Fremdwährung (nur B/D)
function s6() {
  return {
    scenario: "S6",
    scLabel: "Fremdwährung",
    kind: "rechnung",
    side: "in",
    fallback: "fx",
    docLabel: "Invoice 2026-US-114",
    partner: "Cloudpeak Inc. (US)",
    refKind: "Beleg",
    date: "05.07.2026",
    belegfeld: "US114",
    belegfeldLocked: true,
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "SaaS-Abonnement Q3 (USD)",
    counter: {
      account: "70114"
    },
    aAvail: false,
    cAvail: false,
    editAvail: true,
    einfachReason: "Fremdwährung (USD, fx_amount je Zeile) — dieser Satz ist nur in der Zeilenansicht (DATEV) darstellbar.",
    rawLines: [{
      account: "4920",
      name: "Fremdleistungen / SaaS",
      soll: "1.842,50",
      haben: "",
      bu: "",
      text: "SaaS Q3 · 2.000,00 USD @ 0,92125",
      belegfeld: "US114",
      kost1: "",
      confidence: "review"
    }, {
      account: "70114",
      name: "Cloudpeak Inc.",
      soll: "",
      haben: "1.842,50",
      bu: "",
      text: "SaaS Q3 · 2.000,00 USD",
      belegfeld: "US114",
      kost1: "",
      counter: true
    }],
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "DATEV-Beleg-Import · FX-Umrechnung EZB",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S7 — Storno / Generalumkehr (nur A, read-only, GU-Badge)
function s7() {
  const b = s1();
  return {
    ...b,
    scenario: "S7",
    scLabel: "Generalumkehr",
    origin: "posted",
    status: "storniert",
    docLabel: "Storno Rechnung 202605034299",
    gu: true,
    stornoRef: "202605034299",
    text: "Generalumkehr — M-net Telekommunikation Juni 2026",
    positions: b.positions.map(p => ({
      ...p,
      gu: true
    })),
    aAvail: true,
    cAvail: false,
    editAvail: false,
    einfachReason: "Storno-Satz (Generalumkehr) — schreibgeschützt, Bearbeiten nicht möglich.",
    details: {
      erfasser: "Stefan Hofmann",
      provenance: "Generalumkehr zu Buchung 202605034299 · gebucht 12.07.2026",
      beleg2: "",
      exportStatus: "exportiert 12.07.2026, 08:14"
    }
  };
}
// S8 — Erlös auf Automatikkonto (BU disabled)
function s8() {
  return {
    scenario: "S8",
    scLabel: "Automatikkonto",
    kind: "rechnung",
    side: "out",
    docLabel: "Ausgangsrechnung 2026-118",
    partner: "Gebr. Sander GbR",
    refKind: "Beleg",
    date: "10.07.2026",
    belegfeld: "2026-118",
    belegfeldLocked: true,
    origin: "ai",
    status: "prüfen",
    contextNote: CTX4,
    text: "Beratungsleistung Juni 2026",
    positions: [{
      id: pid(),
      account: "8400",
      sh: "H",
      grossInput: "1.190,00",
      vat: "vst19",
      text: "Beratungsleistung Juni",
      kost1: "",
      kost2: "",
      confidence: "high"
    }],
    counter: {
      account: "70420"
    },
    aAvail: true,
    cAvail: true,
    editAvail: true,
    details: {
      erfasser: "Ludwig (Agent)",
      provenance: "DATEV-Beleg-Import · Ausgangsrechnung",
      beleg2: "",
      exportStatus: "noch nicht exportiert"
    }
  };
}
// S9 — Gesperrt (posted / exportiert)
function s9() {
  const b = s1();
  return {
    ...b,
    scenario: "S9",
    scLabel: "Gesperrt",
    origin: "posted",
    status: "gebucht",
    locked: true,
    exportedAt: "12.07.2026, 08:14",
    aAvail: true,
    cAvail: false,
    editAvail: false,
    einfachReason: "Bereits gebucht und exportiert — schreibgeschützt. Korrektur nur per Storno (Generalumkehr).",
    details: {
      erfasser: "Stefan Hofmann",
      provenance: "DATEV-Beleg-Import · gebucht 12.07.2026",
      beleg2: "",
      exportStatus: "exportiert 12.07.2026, 08:14"
    }
  };
}
const CATALOG4 = [{
  id: "s1",
  label: "S1 · Eingangsrechnung",
  make: s1
}, {
  id: "s2",
  label: "S2 · Aufteilung",
  make: s2
}, {
  id: "s3",
  label: "S3 · Multizahlung",
  make: s3
}, {
  id: "s3b",
  label: "S3b · Zahlungssplit",
  make: s3b
}, {
  id: "s4",
  label: "S4 · Skonto",
  make: s4
}, {
  id: "s5",
  label: "S5 · §13b",
  make: s5
}, {
  id: "s6",
  label: "S6 · Fremdwährung",
  make: s6
}, {
  id: "s7",
  label: "S7 · Storno",
  make: s7
}, {
  id: "s8",
  label: "S8 · Automatikkonto",
  make: s8
}, {
  id: "s9",
  label: "S9 · Gesperrt",
  make: s9
}];
const CATALOG4_BY = {};
CATALOG4.forEach(c => {
  CATALOG4_BY[c.id] = c;
});

// Für den Listen-Modus (§12): sechs gemischte Sätze zum Scan-Vergleich.
const LIST_ORDER4 = ["s1", "s2", "s3", "s4", "s7", "s9"];
window.CTX4 = CTX4;
window.satzAmpel = satzAmpel;
window.CATALOG4 = CATALOG4;
window.CATALOG4_BY = CATALOG4_BY;
window.LIST_ORDER4 = LIST_ORDER4;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-data4.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-datev-edit.jsx
try { (() => {
// ============================================================================
// v3 — Editierbare DATEV-Zeilentabelle (Tab „Alle Zeilen"), Zeilen-Builder
// aus dem strukturierten Modell und Faltbarkeits-Prüfung für den Tab-Zustand.
// Depends on mb-icons, mb-money, mb-data, mb-datev (expandToRawLines).
// ============================================================================
const {
  useState: useStateDE
} = React;

// Strukturierte Buchung -> editierbare Zeilen (soll/haben als DE-Strings).
function buildDatevLines(b) {
  if (b.fallback) {
    return b.rawLines.map(l => ({
      account: l.account,
      name: l.name,
      soll: l.soll || "",
      haben: l.haben || "",
      bu: l.bu || "",
      text: l.text || "",
      belegfeld: b.belegfeld || "",
      kost1: l.kost1 || ""
    }));
  }
  if (b.kind === "zahlung") {
    const lines = [];
    let sum = 0;
    b.posten.forEach(p => {
      const c = parseEuroToCents(p.amountInput);
      sum += c;
      lines.push({
        account: p.account,
        name: accountLabel(p.account).replace(/^\S+ — /, ""),
        soll: formatCents(c),
        haben: "",
        bu: "",
        text: b.text,
        belegfeld: p.belegfeld || "",
        kost1: ""
      });
    });
    lines.push({
      account: b.counter.account,
      name: accountLabel(b.counter.account).replace(/^\S+ — /, ""),
      soll: "",
      haben: formatCents(sum),
      bu: "",
      text: b.text,
      belegfeld: "",
      kost1: ""
    });
    return lines;
  }
  // rechnung
  return expandToRawLines(b).map(l => ({
    account: l.account,
    name: l.name,
    soll: l.soll != null ? formatCents(l.soll) : "",
    haben: l.haben != null ? formatCents(l.haben) : "",
    bu: l.bu || "",
    text: l.text || "",
    belegfeld: l.belegfeld || "",
    kost1: l.kost1 || ""
  }));
}
function linesSaldo(lines) {
  let s = 0,
    h = 0;
  lines.forEach(l => {
    s += parseEuroToCents(l.soll);
    h += parseEuroToCents(l.haben);
  });
  return {
    soll: s,
    haben: h,
    diff: s - h
  };
}

// ---- Editierbare Tabelle ---------------------------------------------------
function EditableDatevTable({
  lines,
  onChange,
  locked
}) {
  const set = (i, key, val) => onChange(lines.map((l, j) => j === i ? {
    ...l,
    [key]: val
  } : l));
  const del = i => onChange(lines.filter((_, j) => j !== i));
  const add = () => onChange([...lines, {
    account: "",
    name: "",
    soll: "",
    haben: "",
    bu: "",
    text: "",
    belegfeld: "",
    kost1: ""
  }]);
  const {
    soll,
    haben,
    diff
  } = linesSaldo(lines);
  return /*#__PURE__*/React.createElement("div", {
    className: "edatev"
  }, /*#__PURE__*/React.createElement("div", {
    className: "edatev__scroll"
  }, /*#__PURE__*/React.createElement("table", {
    className: "etab"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Konto"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Soll"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Haben"), /*#__PURE__*/React.createElement("th", {
    className: "c"
  }, "BU"), /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Zeilentext"), /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("th", {
    className: "c"
  }, "KOST"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, lines.map((l, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "l"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ei ei--acc mono",
    value: l.account,
    disabled: locked,
    onChange: e => set(i, "account", e.target.value),
    placeholder: "Konto"
  })), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ei ei--amt num",
    value: l.soll,
    disabled: locked,
    onChange: e => set(i, "soll", e.target.value),
    placeholder: "\u2014"
  })), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ei ei--amt num",
    value: l.haben,
    disabled: locked,
    onChange: e => set(i, "haben", e.target.value),
    placeholder: "\u2014"
  })), /*#__PURE__*/React.createElement("td", {
    className: "c"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ei ei--bu mono",
    value: l.bu,
    disabled: locked,
    onChange: e => set(i, "bu", e.target.value)
  })), /*#__PURE__*/React.createElement("td", {
    className: "l"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ei",
    value: l.text,
    disabled: locked,
    onChange: e => set(i, "text", e.target.value)
  })), /*#__PURE__*/React.createElement("td", {
    className: "l"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ei ei--bel mono",
    value: l.belegfeld,
    disabled: locked,
    onChange: e => set(i, "belegfeld", e.target.value)
  })), /*#__PURE__*/React.createElement("td", {
    className: "c"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ei ei--kost num",
    value: l.kost1,
    disabled: locked,
    onChange: e => set(i, "kost1", e.target.value)
  })), /*#__PURE__*/React.createElement("td", {
    className: "c"
  }, !locked && lines.length > 2 && /*#__PURE__*/React.createElement("button", {
    className: "erow-del",
    title: "Zeile l\xF6schen",
    onClick: () => del(i)
  }, MB.trash({
    size: 14
  })))))))), !locked && /*#__PURE__*/React.createElement("button", {
    className: "erow-add",
    onClick: add
  }, MB.plus({
    size: 15
  }), " Zeile hinzuf\xFCgen"), /*#__PURE__*/React.createElement("div", {
    className: "esaldo" + (diff === 0 ? " is-ok" : " is-off")
  }, /*#__PURE__*/React.createElement("span", {
    className: "esaldo__nums"
  }, "Soll ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, formatCents(soll)), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Haben ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, formatCents(haben))), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), diff === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "esaldo__msg"
  }, MB.check({
    size: 14
  }), " Saldo ausgeglichen") : /*#__PURE__*/React.createElement("span", {
    className: "esaldo__msg"
  }, MB.alert({
    size: 14
  }), " Differenz ", formatCents(Math.abs(diff)), " \u20AC")));
}
window.buildDatevLines = buildDatevLines;
window.linesSaldo = linesSaldo;
window.EditableDatevTable = EditableDatevTable;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-datev-edit.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-datev.jsx
try { (() => {
// ============================================================================
// DATEV-Experten-Modus. Zwei Rollen:
//  1. Read-only Spiegel („Alle Zeilen (DATEV)" — Disclosure, default zu):
//     zeigt live, in welche Rohzeilen die Positions-Ansicht expandiert.
//  2. Editier-Modus („Im DATEV-Modus bearbeiten"): heutiger Zeilen-Editor mit
//     Saldo-Indikator — auch automatischer Fallback bei nicht-faltbaren Sätzen.
// Depends on mb-icons.jsx, mb-money.jsx, mb-data.jsx.
// ============================================================================
const {
  useState: useStateD
} = React;

// Positions-Ansicht -> explizite DATEV-Zeilen (dieselbe Mathematik wie Server).
function expandToRawLines(booking) {
  const lines = [];
  let sum = 0;
  booking.positions.forEach(p => {
    const acc = findAccount(p.account);
    const auto = acc && acc.automatic;
    const vk = auto ? acc.impliedRate === 7 ? "vst7" : "vst19" : p.vat;
    const v = VAT_RATES[vk];
    const gross = parseEuroToCents(p.grossInput);
    sum += gross;
    const {
      netto,
      steuer
    } = vatSplit(gross, v.rate);
    lines.push({
      account: p.account || "—",
      name: acc ? acc.name : "",
      soll: netto,
      haben: null,
      bu: v.rate ? v.bu : "",
      text: p.text || booking.text,
      kost1: p.kost1,
      belegfeld: booking.belegfeld
    });
    if (v.rate > 0 && !auto) {
      lines.push({
        account: v.taxAccount,
        name: v.taxName,
        soll: steuer,
        haben: null,
        bu: "",
        text: v.short,
        kost1: "",
        belegfeld: booking.belegfeld,
        derived: true
      });
    }
  });
  lines.push({
    account: booking.counter.account,
    name: accountLabel(booking.counter.account).replace(/^\S+ — /, ""),
    soll: null,
    haben: sum,
    bu: "",
    text: booking.text,
    kost1: "",
    belegfeld: booking.belegfeld,
    counter: true
  });
  return lines;
}
function cell(v) {
  return v == null ? "" : formatCents(v);
}

// ---- Rohzeilen-Tabelle ------------------------------------------------------
function RawLineTable({
  lines,
  editable
}) {
  let soll = 0,
    haben = 0;
  lines.forEach(l => {
    soll += l.soll || 0;
    haben += l.haben || 0;
  });
  const diff = soll - haben;
  return /*#__PURE__*/React.createElement("div", {
    className: "datev"
  }, /*#__PURE__*/React.createElement("div", {
    className: "datev__scroll"
  }, /*#__PURE__*/React.createElement("table", {
    className: "dtab"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Konto"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Soll"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Haben"), /*#__PURE__*/React.createElement("th", {
    className: "c"
  }, "BU"), /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Zeilentext"), /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "KOST"))), /*#__PURE__*/React.createElement("tbody", null, lines.map((l, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: (l.derived ? "is-derived " : "") + (l.counter ? "is-counter" : "")
  }, /*#__PURE__*/React.createElement("td", {
    className: "l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, l.account), " ", /*#__PURE__*/React.createElement("span", {
    className: "dtab__nm"
  }, l.name)), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, cell(l.soll)), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, cell(l.haben)), /*#__PURE__*/React.createElement("td", {
    className: "c mono"
  }, l.bu), /*#__PURE__*/React.createElement("td", {
    className: "l dtab__txt"
  }, l.text), /*#__PURE__*/React.createElement("td", {
    className: "l mono"
  }, l.belegfeld), /*#__PURE__*/React.createElement("td", {
    className: "l mono"
  }, l.kost1)))), /*#__PURE__*/React.createElement("tfoot", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "l"
  }, "Summe"), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, formatCents(soll)), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, formatCents(haben)), /*#__PURE__*/React.createElement("td", {
    colSpan: "4"
  }))))), editable && /*#__PURE__*/React.createElement("div", {
    className: "saldo" + (diff === 0 ? " is-ok" : " is-off")
  }, diff === 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, MB.check({
    size: 14
  }), " Saldo ausgeglichen") : /*#__PURE__*/React.createElement(React.Fragment, null, MB.alert({
    size: 14
  }), " Differenz ", formatCents(Math.abs(diff)), " \u20AC \u2014 Soll und Haben stimmen nicht \xFCberein")));
}

// ---- Disclosure „Alle Zeilen (DATEV)" (read-only Spiegel) ------------------
function DatevDisclosure({
  booking,
  datevMode,
  onDatevMode,
  locked
}) {
  const [open, setOpen] = useStateD(false);
  const lines = expandToRawLines(booking);
  return /*#__PURE__*/React.createElement("div", {
    className: "disc" + (open ? " is-open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "disc__bar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "disc__toggle",
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "disc__chev"
  }, MB.chevRight({
    size: 16
  })), MB.table({
    size: 15
  }), " Alle Zeilen (DATEV)", /*#__PURE__*/React.createElement("span", {
    className: "disc__count"
  }, lines.length, " Zeilen")), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), !locked && /*#__PURE__*/React.createElement("label", {
    className: "disc__switch"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: datevMode,
    onChange: e => onDatevMode(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "disc__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "disc__knob"
  })), /*#__PURE__*/React.createElement("span", {
    className: "disc__swlbl"
  }, "Im DATEV-Modus bearbeiten"))), open && /*#__PURE__*/React.createElement(RawLineTable, {
    lines: lines,
    editable: false
  }));
}

// ---- Fallback-Banner (nicht faltbar) ---------------------------------------
function FallbackBanner({
  reason
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fbbanner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fbbanner__ic"
  }, MB.info({
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fbbanner__t"
  }, "DATEV-Zeilenansicht"), /*#__PURE__*/React.createElement("div", {
    className: "fbbanner__s"
  }, reason)));
}
window.expandToRawLines = expandToRawLines;
window.RawLineTable = RawLineTable;
window.DatevDisclosure = DatevDisclosure;
window.FallbackBanner = FallbackBanner;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-datev.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-editor.jsx
try { (() => {
// ============================================================================
// Geteilter Editor-Kern — von v1 (Journal-Backdrop) und v2 (Sachverhalt-
// Backdrop) genutzt. Header, Positionen, Gegenseite, DATEV-Disclosure,
// Fußzeile, Undo-Toast. Die Buchung kommt als Factory (makeBooking) herein.
// Depends on mb-icons, mb-money, mb-data, mb-position, mb-datev.
// ============================================================================
const {
  useState: useStateE,
  useEffect: useEffectE,
  useRef: useRefE
} = React;

// ---- Gegenseite (Fußzeile) -------------------------------------------------
function CounterRow({
  booking,
  sumCents,
  locked
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "counter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "counter__lead"
  }, "an"), /*#__PURE__*/React.createElement("div", {
    className: "counter__acc"
  }, /*#__PURE__*/React.createElement(KontoCombobox, {
    value: booking.counter.account,
    options: CREDITORS,
    onChange: no => booking.setCounter(no),
    placeholder: "Personenkonto",
    disabled: locked
  }), /*#__PURE__*/React.createElement("div", {
    className: "counter__hint"
  }, "Summe der Positionen \u2014 immer ausgeglichen")), /*#__PURE__*/React.createElement("div", {
    className: "counter__amt"
  }, booking.counter.note && /*#__PURE__*/React.createElement("span", {
    className: "review-badge"
  }, MB.alert({
    size: 12
  }), " ", booking.counter.note), /*#__PURE__*/React.createElement("span", {
    className: "counter__sum num"
  }, formatCents(sumCents), " \u20AC")));
}

// ---- Belegfeld-Chip --------------------------------------------------------
function BelegfeldChip({
  value,
  locked,
  onChange
}) {
  if (locked) {
    return /*#__PURE__*/React.createElement("span", {
      className: "bchip is-locked",
      title: "Belegfeld 1 wird bei Beleg-Buchungen automatisch aus der Rechnungsnummer gesetzt \u2014 f\xFCr alle Zeilen identisch (OPOS-Raffung)."
    }, /*#__PURE__*/React.createElement("span", {
      className: "bchip__k"
    }, "Belegfeld 1"), /*#__PURE__*/React.createElement("span", {
      className: "bchip__v mono"
    }, value || "—"), MB.lock({
      size: 12
    }));
  }
  return /*#__PURE__*/React.createElement("span", {
    className: "bchip is-edit"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bchip__k"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("input", {
    className: "bchip__inp mono",
    value: value,
    placeholder: "\u2014",
    onChange: e => onChange(e.target.value)
  }));
}

// ---- Editor ----------------------------------------------------------------
function BookingEditor({
  makeBooking,
  onClose
}) {
  const [b, setB] = useStateE(() => makeBooking());
  const [datevMode, setDatevMode] = useStateE(!!b.fallback);
  const [toast, setToast] = useStateE(null);
  const [flash, setFlash] = useStateE(false);
  const toastTimer = useRefE(null);
  const locked = !!b.locked;
  const foldable = !b.fallback;
  const sumCents = foldable ? b.positions.reduce((s, p) => s + parseEuroToCents(p.grossInput), 0) : 0;
  b.setCounter = no => setB(prev => ({
    ...prev,
    counter: {
      ...prev.counter,
      account: no
    }
  }));
  const setPos = (id, patch) => setB(prev => ({
    ...prev,
    positions: prev.positions.map(p => p.id === id ? {
      ...p,
      ...patch
    } : p)
  }));
  const addPos = () => setB(prev => ({
    ...prev,
    positions: [...prev.positions, {
      id: pid(),
      account: "",
      grossInput: "",
      vat: "vst19",
      text: "",
      kost1: "",
      kost2: "",
      confidence: null
    }]
  }));
  const delPos = id => {
    setB(prev => {
      const idx = prev.positions.findIndex(p => p.id === id);
      const removed = prev.positions[idx];
      clearTimeout(toastTimer.current);
      setToast({
        removed,
        idx
      });
      toastTimer.current = setTimeout(() => setToast(null), 6000);
      return {
        ...prev,
        positions: prev.positions.filter(p => p.id !== id)
      };
    });
  };
  const undoDel = () => {
    if (!toast) return;
    setB(prev => {
      const arr = [...prev.positions];
      arr.splice(toast.idx, 0, toast.removed);
      return {
        ...prev,
        positions: arr
      };
    });
    clearTimeout(toastTimer.current);
    setToast(null);
  };
  const canSubmit = foldable && b.positions.length > 0 && b.positions.every(p => p.account && parseEuroToCents(p.grossInput) > 0);
  const doSubmit = () => {
    if (!canSubmit) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 1000);
  };
  useEffectE(() => {
    const onSubmit = () => doSubmit();
    window.addEventListener("mb-submit", onSubmit);
    return () => window.removeEventListener("mb-submit", onSubmit);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "drawer",
    role: "dialog",
    "aria-label": "Buchung bearbeiten"
  }, /*#__PURE__*/React.createElement("header", {
    className: "dh"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dh__row"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "dh__title"
  }, "Buchung bearbeiten"), /*#__PURE__*/React.createElement("button", {
    className: "dh__close",
    onClick: onClose,
    title: "Schlie\xDFen"
  }, MB.x({
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dh__sub"
  }, b.docLabel, /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), b.partner), /*#__PURE__*/React.createElement("div", {
    className: "dh__meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dh__date"
  }, b.date), /*#__PURE__*/React.createElement(BelegfeldChip, {
    value: b.belegfeld,
    locked: b.belegfeldLocked,
    onChange: v => setB(prev => ({
      ...prev,
      belegfeld: v
    }))
  })), b.contextNote && /*#__PURE__*/React.createElement("div", {
    className: "ctxline"
  }, MB.link({
    size: 14
  }), " ", b.contextNote), b.origin === "ai" && !locked && /*#__PURE__*/React.createElement("div", {
    className: "origin"
  }, /*#__PURE__*/React.createElement("span", {
    className: "origin__ic"
  }, MB.info({
    size: 15
  })), "KI-Vorschlag wird bearbeitet \u2014 die Buchung wird als ", /*#__PURE__*/React.createElement("b", null, "\u201EKI bearbeitet\""), " markiert."), locked && /*#__PURE__*/React.createElement("div", {
    className: "origin origin--lock"
  }, /*#__PURE__*/React.createElement("span", {
    className: "origin__ic"
  }, MB.lock({
    size: 15
  })), "Bereits gebucht und am ", b.exportedAt, " exportiert \u2014 schreibgesch\xFCtzt. Korrektur nur per ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Storno (Generalumkehr)"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "db"
  }, !foldable ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FallbackBanner, {
    reason: b.fallbackReason
  }), /*#__PURE__*/React.createElement(RawLineTable, {
    lines: b.rawLines.map(l => ({
      account: l.account,
      name: l.name,
      soll: parseEuroToCents(l.soll),
      haben: parseEuroToCents(l.haben) || null,
      bu: l.bu,
      text: l.text,
      belegfeld: b.belegfeld,
      kost1: l.kost1
    })),
    editable: true
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", {
    className: "pfield db__text"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Buchungstext (alle Positionen)"), /*#__PURE__*/React.createElement("input", {
    className: "tinput",
    value: b.text,
    disabled: locked,
    placeholder: "Sammel-Buchungstext",
    onChange: e => setB(prev => ({
      ...prev,
      text: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-lbl"
  }, "Positionen"), /*#__PURE__*/React.createElement("div", {
    className: "plist"
  }, b.positions.map((p, i) => /*#__PURE__*/React.createElement(PositionCard, {
    key: p.id,
    pos: p,
    index: i,
    canDelete: b.positions.length > 1,
    locked: locked,
    onChange: setPos,
    onDelete: delPos
  }))), !locked && /*#__PURE__*/React.createElement("button", {
    className: "addpos",
    onClick: addPos
  }, MB.plus({
    size: 16
  }), " Position hinzuf\xFCgen"), /*#__PURE__*/React.createElement("div", {
    className: "sec-lbl"
  }, "Gegenseite"), /*#__PURE__*/React.createElement(CounterRow, {
    booking: b,
    sumCents: sumCents,
    locked: locked
  }), /*#__PURE__*/React.createElement(DatevDisclosure, {
    booking: b,
    datevMode: datevMode,
    onDatevMode: setDatevMode,
    locked: locked
  }))), /*#__PURE__*/React.createElement("footer", {
    className: "df"
  }, toast ? /*#__PURE__*/React.createElement("div", {
    className: "mbtoast"
  }, /*#__PURE__*/React.createElement("span", null, "Position entfernt"), /*#__PURE__*/React.createElement("button", {
    onClick: undoDel
  }, MB.undo({
    size: 14
  }), " R\xFCckg\xE4ngig")) : /*#__PURE__*/React.createElement("span", {
    className: "df__hint"
  }, locked ? "Schreibgeschützt" : foldable ? "Netto, Steuer und Gegenseite werden automatisch abgeleitet · Enter im Brutto-Feld übernimmt" : "Bearbeitung in der DATEV-Zeilenansicht"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: onClose
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm" + (flash ? " is-flash" : ""),
    disabled: locked || foldable && !canSubmit,
    onClick: doSubmit,
    title: canSubmit || !foldable ? "" : "Konto und Brutto je Position erforderlich"
  }, flash ? /*#__PURE__*/React.createElement(React.Fragment, null, MB.check({
    size: 16
  }), " \xDCbernommen") : "Übernehmen")));
}
window.CounterRow = CounterRow;
window.BelegfeldChip = BelegfeldChip;
window.BookingEditor = BookingEditor;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-editor.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-editor3.jsx
try { (() => {
// ============================================================================
// v3 — Editor mit zwei gleichberechtigten Tabs (Einfach / Alle Zeilen) +
// Szenario-Katalog. Einfach-Tab rendert je kind: „rechnung" (Positionen,
// v2-Layout) oder „zahlung" (Posten: Personenkonto + Betrag + Belegfeld je
// Rechnung, Ziel-Abgleich gegen die Bank-Transaktion).
// Depends on mb-icons, mb-money, mb-data, mb-position, mb-datev,
//   mb-datev-edit, mb-editor (CounterRow/BelegfeldChip/PositionCard).
// ============================================================================
const {
  useState: useState3,
  useEffect: useEffect3
} = React;

// ---- Posten (Zahlung: je beglichene Rechnung) ------------------------------
function PostenCard({
  p,
  canDelete,
  locked,
  onChange,
  onDelete
}) {
  const set = patch => onChange(p.id, patch);
  const amtInvalid = parseEuroToCents(p.amountInput) <= 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "pcard" + (locked ? " is-locked" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard__rail"
  }, /*#__PURE__*/React.createElement(ConfidenceDot, {
    level: p.confidence
  })), /*#__PURE__*/React.createElement("div", {
    className: "pcard__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard__top"
  }, /*#__PURE__*/React.createElement("label", {
    className: "pfield pfield--konto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Personenkonto"), /*#__PURE__*/React.createElement(KontoCombobox, {
    value: p.account,
    options: CREDITORS,
    onChange: no => set({
      account: no
    }),
    placeholder: "Kreditor w\xE4hlen",
    disabled: locked,
    invalid: !p.account
  })), /*#__PURE__*/React.createElement("label", {
    className: "pfield pfield--brutto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Betrag"), /*#__PURE__*/React.createElement("div", {
    className: "binput" + (amtInvalid ? " is-invalid" : "")
  }, /*#__PURE__*/React.createElement("input", {
    className: "num",
    inputMode: "decimal",
    value: p.amountInput,
    disabled: locked,
    onChange: e => set({
      amountInput: e.target.value
    }),
    placeholder: "0,00"
  }), /*#__PURE__*/React.createElement("span", {
    className: "binput__cur"
  }, "\u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "pcard__foot"
  }, /*#__PURE__*/React.createElement("label", {
    className: "pfield",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Belegfeld 1 ", /*#__PURE__*/React.createElement("span", {
    className: "pfield__note"
  }, "\xB7 Rechnungsnr. (OPOS-Ausgleich)")), /*#__PURE__*/React.createElement("input", {
    className: "tinput mono",
    value: p.belegfeld,
    disabled: locked,
    placeholder: "Rechnungsnummer",
    onChange: e => set({
      belegfeld: e.target.value
    })
  })), canDelete && !locked && /*#__PURE__*/React.createElement("button", {
    className: "pdel",
    title: "Posten entfernen",
    onClick: () => onDelete(p.id),
    style: {
      alignSelf: "flex-end"
    }
  }, MB.trash({
    size: 16
  })))));
}

// ---- Ziel-Gegenseite (Zahlung: Bank, Soll-Betrag vorgegeben) ---------------
function TargetCounter({
  booking,
  sumCents,
  locked
}) {
  const target = parseEuroToCents(booking.targetInput);
  const rest = target - sumCents;
  return /*#__PURE__*/React.createElement("div", {
    className: "counter counter--target"
  }, /*#__PURE__*/React.createElement("div", {
    className: "counter__lead"
  }, "an"), /*#__PURE__*/React.createElement("div", {
    className: "counter__acc"
  }, /*#__PURE__*/React.createElement(KontoCombobox, {
    value: booking.counter.account,
    options: CREDITORS,
    onChange: no => booking.setCounter(no),
    placeholder: "Bank / Kasse",
    disabled: locked
  }), /*#__PURE__*/React.createElement("div", {
    className: "counter__hint"
  }, "Summe der Posten \u2014 muss dem Zahlbetrag entsprechen")), /*#__PURE__*/React.createElement("div", {
    className: "counter__amt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tgt-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tgt-lbl"
  }, "Zahlbetrag"), /*#__PURE__*/React.createElement("span", {
    className: "tgt-val num"
  }, formatCents(target), " \u20AC")), /*#__PURE__*/React.createElement("div", {
    className: "tgt-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tgt-lbl"
  }, "Summe Posten"), /*#__PURE__*/React.createElement("span", {
    className: "counter__sum num"
  }, formatCents(sumCents), " \u20AC")), rest !== 0 && /*#__PURE__*/React.createElement("div", {
    className: "restbadge" + (booking.skonto && rest < 0 ? " is-skonto" : " is-open")
  }, booking.skonto && rest < 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, MB.info({
    size: 12
  }), " Differenz ", formatCents(-rest), " \u20AC \u2014 m\xF6gliches Skonto") : /*#__PURE__*/React.createElement(React.Fragment, null, MB.alert({
    size: 12
  }), " ", rest > 0 ? "Rest " + formatCents(rest) + " € offen" : formatCents(-rest) + " € zu viel")), rest === 0 && /*#__PURE__*/React.createElement("div", {
    className: "restbadge is-ok"
  }, MB.check({
    size: 12
  }), " ausgeglichen")));
}

// ---- Tab-Leiste ------------------------------------------------------------
function TabBar({
  tab,
  setTab,
  einfachDisabled,
  disabledReason
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "tabbar",
    role: "tablist"
  }, /*#__PURE__*/React.createElement("button", {
    role: "tab",
    "aria-selected": tab === "einfach",
    disabled: einfachDisabled,
    className: "tabbtn" + (tab === "einfach" ? " is-active" : ""),
    title: einfachDisabled ? disabledReason : "",
    onClick: () => !einfachDisabled && setTab("einfach")
  }, "Einfach", einfachDisabled && /*#__PURE__*/React.createElement("span", {
    className: "tabbtn__lock"
  }, MB.lock({
    size: 12
  }))), /*#__PURE__*/React.createElement("button", {
    role: "tab",
    "aria-selected": tab === "datev",
    className: "tabbtn" + (tab === "datev" ? " is-active" : ""),
    onClick: () => setTab("datev")
  }, "Alle Zeilen (DATEV)"));
}

// ---- Editor ----------------------------------------------------------------
function BookingEditor3({
  makeBooking,
  onClose
}) {
  const [b, setB] = useState3(() => makeBooking());
  const [datevLines, setDatevLines] = useState3(() => b.fallback ? buildDatevLines(b) : null);
  const [tab, setTab] = useState3(() => b.fallback ? "datev" : "einfach");
  const [flash, setFlash] = useState3(false);
  const locked = !!b.locked;
  const isZahlung = b.kind === "zahlung";
  b.setCounter = no => setB(prev => ({
    ...prev,
    counter: {
      ...prev.counter,
      account: no
    }
  }));

  // Faltbarkeit / Einfach-Tab-Verfügbarkeit
  const datevBalanced = datevLines ? linesSaldo(datevLines).diff === 0 : true;
  const einfachDisabled = !!b.fallback || tab === "datev" && !datevBalanced;
  const disabledReason = b.fallback ? b.fallbackReason : "Soll und Haben stimmen nicht überein — dieser Stand ist nur in der Zeilenansicht bearbeitbar.";
  const goTab = t => {
    if (t === "datev" && !datevLines) setDatevLines(buildDatevLines(b));
    setTab(t);
  };

  // Summen
  const sumCents = isZahlung ? b.posten.reduce((s, p) => s + parseEuroToCents(p.amountInput), 0) : b.positions ? b.positions.reduce((s, p) => s + parseEuroToCents(p.grossInput), 0) : 0;
  const target = isZahlung ? parseEuroToCents(b.targetInput) : 0;

  // Detailzeilen-Handler
  const setPos = (id, patch) => setB(prev => ({
    ...prev,
    positions: prev.positions.map(p => p.id === id ? {
      ...p,
      ...patch
    } : p)
  }));
  const addPos = () => setB(prev => ({
    ...prev,
    positions: [...prev.positions, {
      id: pid(),
      account: "",
      grossInput: "",
      vat: "vst19",
      text: "",
      kost1: "",
      kost2: "",
      confidence: null
    }]
  }));
  const delPos = id => setB(prev => ({
    ...prev,
    positions: prev.positions.filter(p => p.id !== id)
  }));
  const setPst = (id, patch) => setB(prev => ({
    ...prev,
    posten: prev.posten.map(p => p.id === id ? {
      ...p,
      ...patch
    } : p)
  }));
  const addPst = () => setB(prev => ({
    ...prev,
    posten: [...prev.posten, {
      id: pid(),
      account: "",
      amountInput: "",
      belegfeld: "",
      confidence: null
    }]
  }));
  const delPst = id => setB(prev => ({
    ...prev,
    posten: prev.posten.filter(p => p.id !== id)
  }));

  // Übernehmen
  let canSubmit;
  if (locked) canSubmit = false;else if (tab === "datev") canSubmit = datevBalanced;else if (isZahlung) canSubmit = !b.skonto && target - sumCents === 0 && b.posten.length > 0 && b.posten.every(p => p.account && parseEuroToCents(p.amountInput) > 0 && p.belegfeld);else canSubmit = b.positions.length > 0 && b.positions.every(p => p.account && parseEuroToCents(p.grossInput) > 0);
  const doSubmit = () => {
    if (!canSubmit) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 1000);
  };
  useEffect3(() => {
    const onSub = () => doSubmit();
    window.addEventListener("mb-submit", onSub);
    return () => window.removeEventListener("mb-submit", onSub);
  });
  const submitHint = locked ? "Schreibgeschützt" : tab === "datev" ? "Rohzeilen · Speichern erst bei ausgeglichenem Saldo" : isZahlung ? b.skonto ? "Skonto-Buchung im DATEV-Tab erfassen" : "Posten müssen dem Zahlbetrag entsprechen" : "Netto, Steuer und Gegenseite werden automatisch abgeleitet · Enter im Brutto-Feld übernimmt";
  return /*#__PURE__*/React.createElement("div", {
    className: "drawer",
    role: "dialog",
    "aria-label": "Buchung bearbeiten"
  }, /*#__PURE__*/React.createElement("header", {
    className: "dh"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dh__row"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "dh__title"
  }, "Buchung bearbeiten"), /*#__PURE__*/React.createElement("button", {
    className: "dh__close",
    onClick: onClose,
    title: "Schlie\xDFen"
  }, MB.x({
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dh__sub"
  }, b.docLabel, /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), b.partner), /*#__PURE__*/React.createElement("div", {
    className: "dh__meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dh__date"
  }, b.date), /*#__PURE__*/React.createElement("span", {
    className: "scbadge"
  }, b.refKind, /*#__PURE__*/React.createElement("span", {
    className: "scbadge__sc"
  }, b.scenario, " \xB7 ", b.scLabel)), !isZahlung && /*#__PURE__*/React.createElement(BelegfeldChip, {
    value: b.belegfeld,
    locked: b.belegfeldLocked,
    onChange: v => setB(prev => ({
      ...prev,
      belegfeld: v
    }))
  })), b.contextNote && /*#__PURE__*/React.createElement("div", {
    className: "ctxline"
  }, MB.link({
    size: 14
  }), " ", b.contextNote), b.origin === "ai" && !locked && /*#__PURE__*/React.createElement("div", {
    className: "origin"
  }, /*#__PURE__*/React.createElement("span", {
    className: "origin__ic"
  }, MB.info({
    size: 15
  })), "KI-Vorschlag wird bearbeitet \u2014 die Buchung wird als ", /*#__PURE__*/React.createElement("b", null, "\u201EKI bearbeitet\""), " markiert."), locked && /*#__PURE__*/React.createElement("div", {
    className: "origin origin--lock"
  }, /*#__PURE__*/React.createElement("span", {
    className: "origin__ic"
  }, MB.lock({
    size: 15
  })), "Bereits gebucht und am ", b.exportedAt, " exportiert \u2014 schreibgesch\xFCtzt. Korrektur nur per ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Storno (Generalumkehr)"), "."), /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    setTab: goTab,
    einfachDisabled: einfachDisabled,
    disabledReason: disabledReason
  }), b.fallback && tab === "datev" && /*#__PURE__*/React.createElement("div", {
    className: "tabnote"
  }, MB.info({
    size: 13
  }), " ", b.fallbackReason)), /*#__PURE__*/React.createElement("div", {
    className: "db"
  }, tab === "datev" ? /*#__PURE__*/React.createElement(EditableDatevTable, {
    lines: datevLines || buildDatevLines(b),
    onChange: setDatevLines,
    locked: locked
  }) : isZahlung ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-lbl"
  }, "Posten (je Rechnung)"), /*#__PURE__*/React.createElement("div", {
    className: "plist"
  }, b.posten.map(p => /*#__PURE__*/React.createElement(PostenCard, {
    key: p.id,
    p: p,
    canDelete: b.posten.length > 1,
    locked: locked,
    onChange: setPst,
    onDelete: delPst
  }))), !locked && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "addpos",
    onClick: addPst
  }, MB.plus({
    size: 16
  }), " Posten hinzuf\xFCgen"), /*#__PURE__*/React.createElement("div", {
    className: "candidates"
  }, MB.search({
    size: 13
  }), " Offene Posten des Mandanten vorschlagen (Betrag/Kreditor-Match aus der Bank-Transaktion)")), /*#__PURE__*/React.createElement("div", {
    className: "sec-lbl"
  }, "Gegenseite"), /*#__PURE__*/React.createElement(TargetCounter, {
    booking: b,
    sumCents: sumCents,
    locked: locked
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", {
    className: "pfield db__text"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Buchungstext (alle Positionen)"), /*#__PURE__*/React.createElement("input", {
    className: "tinput",
    value: b.text,
    disabled: locked,
    placeholder: "Sammel-Buchungstext",
    onChange: e => setB(prev => ({
      ...prev,
      text: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-lbl"
  }, "Positionen"), /*#__PURE__*/React.createElement("div", {
    className: "plist"
  }, b.positions.map((p, i) => /*#__PURE__*/React.createElement(PositionCard, {
    key: p.id,
    pos: p,
    index: i,
    canDelete: b.positions.length > 1,
    locked: locked,
    onChange: setPos,
    onDelete: delPos
  }))), !locked && /*#__PURE__*/React.createElement("button", {
    className: "addpos",
    onClick: addPos
  }, MB.plus({
    size: 16
  }), " Position hinzuf\xFCgen"), /*#__PURE__*/React.createElement("div", {
    className: "sec-lbl"
  }, "Gegenseite"), /*#__PURE__*/React.createElement(CounterRow, {
    booking: b,
    sumCents: sumCents,
    locked: locked
  }))), /*#__PURE__*/React.createElement("footer", {
    className: "df"
  }, /*#__PURE__*/React.createElement("span", {
    className: "df__hint"
  }, submitHint), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: onClose
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm" + (flash ? " is-flash" : ""),
    disabled: !canSubmit,
    onClick: doSubmit
  }, flash ? /*#__PURE__*/React.createElement(React.Fragment, null, MB.check({
    size: 16
  }), " \xDCbernommen") : "Übernehmen")));
}
window.PostenCard = PostenCard;
window.TargetCounter = TargetCounter;
window.BookingEditor3 = BookingEditor3;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-editor3.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-editorC.jsx
try { (() => {
// ============================================================================
// v4 — Projektion C: Bearbeiten Einfach. Dichte Zeilen-Erfassung: je Zeile
// Konto + S/H-Toggle + BU + Brutto gegen EIN Gegenkonto (Betrag = Σ, immer
// ausgeglichen). Zahlungs-Szenario: Belegfeld-1-Spalte statt BU, Ziel-Abgleich.
// KOST/Zeilentext-Spalten erscheinen einmal für alle Zeilen (§8).
// Depends on mb-icons, mb-money, mb-data, mb-proj4 (nameOf), mb-position (KontoCombobox, ConfidenceDot).
// ============================================================================
const {
  useState: useStateC,
  useEffect: useEffectC,
  useRef: useRefC
} = React;
function BuSelect({
  value,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "cbu"
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    disabled: disabled,
    onChange: e => onChange(e.target.value)
  }, VAT_ORDER.map(k => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, VAT_RATES[k].label.replace("Vorsteuer", "VSt")))), /*#__PURE__*/React.createElement("span", {
    className: "cbu__chev"
  }, MB.chevDown({
    size: 14
  })));
}
function ProjectionC({
  b,
  onCancel
}) {
  const isZahlung = b.kind === "zahlung";
  const [positions, setPositions] = useStateC(() => (b.positions || []).map(p => ({
    ...p
  })));
  const [posten, setPosten] = useStateC(() => (b.posten || []).map(p => ({
    ...p
  })));
  const [counterAcc, setCounterAcc] = useStateC(b.counter.account);
  const [text, setText] = useStateC(b.text || "");
  const [openKost, setOpenKost] = useStateC(false);
  const [menuRow, setMenuRow] = useStateC(null);
  const [more, setMore] = useStateC(false);
  const [flash, setFlash] = useStateC(false);
  const [toast, setToast] = useStateC(null);
  const toastTimer = useRefC(null);

  // ---- Rechnung: Positionen -------------------------------------------------
  const setPos = (id, patch) => setPositions(ps => ps.map(p => p.id === id ? {
    ...p,
    ...patch
  } : p));
  const addPos = () => setPositions(ps => [...ps, {
    id: pid(),
    account: "",
    sh: "S",
    grossInput: "",
    vat: "vst19",
    text: "",
    kost1: "",
    kost2: "",
    confidence: null
  }]);
  const delRow = (arrSet, id) => {
    arrSet(ps => {
      const idx = ps.findIndex(p => p.id === id);
      const removed = ps[idx];
      clearTimeout(toastTimer.current);
      setToast({
        removed,
        idx,
        isZahlung
      });
      toastTimer.current = setTimeout(() => setToast(null), 6000);
      return ps.filter(p => p.id !== id);
    });
    setMenuRow(null);
  };
  const undo = () => {
    if (!toast) return;
    (toast.isZahlung ? setPosten : setPositions)(ps => {
      const a = [...ps];
      a.splice(toast.idx, 0, toast.removed);
      return a;
    });
    clearTimeout(toastTimer.current);
    setToast(null);
  };
  const setPst = (id, patch) => setPosten(ps => ps.map(p => p.id === id ? {
    ...p,
    ...patch
  } : p));
  const addPst = () => setPosten(ps => [...ps, {
    id: pid(),
    account: "",
    amountInput: "",
    belegfeld: "",
    confidence: null
  }]);
  const sumCents = isZahlung ? posten.reduce((s, p) => s + parseEuroToCents(p.amountInput), 0) : positions.reduce((s, p) => s + parseEuroToCents(p.grossInput), 0);
  const target = isZahlung ? parseEuroToCents(b.targetInput) : 0;
  const rest = target - sumCents;
  const anyKost = positions.some(p => p.kost1 || p.kost2 || p.text);
  const showKost = openKost || anyKost;
  let canSubmit;
  if (isZahlung) canSubmit = rest === 0 && posten.length > 0 && posten.every(p => p.account && parseEuroToCents(p.amountInput) > 0 && p.belegfeld);else canSubmit = positions.length > 0 && positions.every(p => p.account && parseEuroToCents(p.grossInput) > 0) && !!counterAcc;
  const doSubmit = () => {
    if (!canSubmit) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  };
  useEffectC(() => {
    const h = () => doSubmit();
    window.addEventListener("mb-submit-c", h);
    return () => window.removeEventListener("mb-submit-c", h);
  });
  const onBruttoKey = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      window.dispatchEvent(new CustomEvent("mb-submit-c"));
    }
  };
  const hint = isZahlung ? "Belegfeld 1 je Zeile (OPOS) · Summe muss dem Zahlbetrag entsprechen · Enter übernimmt" : "Netto, Steuer und Gegenseite werden automatisch abgeleitet · Enter im Brutto-Feld übernimmt";
  return /*#__PURE__*/React.createElement("div", {
    className: "projc",
    onClick: () => menuRow && setMenuRow(null)
  }, toast && /*#__PURE__*/React.createElement("div", {
    className: "mbtoast",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", null, isZahlung ? "Posten" : "Zeile", " entfernt"), /*#__PURE__*/React.createElement("button", {
    onClick: undo
  }, MB.undo({
    size: 14
  }), " R\xFCckg\xE4ngig")), !isZahlung && /*#__PURE__*/React.createElement("div", {
    className: "c-textfield"
  }, /*#__PURE__*/React.createElement("label", {
    className: "c-lbl"
  }, "Buchungstext"), /*#__PURE__*/React.createElement("input", {
    className: "crow-input",
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "Sammel-Buchungstext (alle Zeilen)"
  })), isZahlung ? /*#__PURE__*/React.createElement("div", {
    className: "crows is-zahlung"
  }, /*#__PURE__*/React.createElement("div", {
    className: "crow-head"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, "#"), /*#__PURE__*/React.createElement("span", null, "Personenkonto"), /*#__PURE__*/React.createElement("span", null, "Belegfeld 1"), /*#__PURE__*/React.createElement("span", {
    className: "r"
  }, "Betrag"), /*#__PURE__*/React.createElement("span", null)), posten.map((p, i) => {
    const inv = parseEuroToCents(p.amountInput) <= 0;
    return /*#__PURE__*/React.createElement("div", {
      className: "crow crow-sep",
      key: p.id
    }, /*#__PURE__*/React.createElement("span", {
      className: "adot-wrap"
    }, /*#__PURE__*/React.createElement(ConfidenceDot, {
      level: p.confidence
    })), /*#__PURE__*/React.createElement("span", {
      className: "crow__num"
    }, i + 1), /*#__PURE__*/React.createElement(KontoCombobox, {
      value: p.account,
      options: CREDITORS,
      onChange: no => setPst(p.id, {
        account: no
      }),
      placeholder: "Kreditor w\xE4hlen",
      invalid: !p.account
    }), /*#__PURE__*/React.createElement("input", {
      className: "crow-input mono",
      value: p.belegfeld,
      onChange: e => setPst(p.id, {
        belegfeld: e.target.value
      }),
      placeholder: "Rechnungsnr."
    }), /*#__PURE__*/React.createElement("div", {
      className: "cbrutto" + (inv ? " is-invalid" : "")
    }, /*#__PURE__*/React.createElement("input", {
      className: "num",
      inputMode: "decimal",
      value: p.amountInput,
      onChange: e => setPst(p.id, {
        amountInput: e.target.value
      }),
      onKeyDown: onBruttoKey,
      placeholder: "0,00"
    }), /*#__PURE__*/React.createElement("span", {
      className: "cbrutto__cur"
    }, "\u20AC")), /*#__PURE__*/React.createElement("button", {
      className: "crow-menu",
      title: "Posten entfernen",
      disabled: posten.length <= 1,
      onClick: () => delRow(setPosten, p.id)
    }, MB.trash({
      size: 15
    })));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "crows" + (showKost ? " has-kost" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "crow-head"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, "#"), /*#__PURE__*/React.createElement("span", null, "Konto"), /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, "S/H"), /*#__PURE__*/React.createElement("span", null, "BU-Schl\xFCssel"), /*#__PURE__*/React.createElement("span", {
    className: "r"
  }, "Brutto"), showKost && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, "KOST 1"), /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, "KOST 2")), /*#__PURE__*/React.createElement("span", null)), positions.map((p, i) => {
    const acc = findAccount(p.account);
    const auto = acc && acc.automatic;
    const effVat = auto ? acc.impliedRate === 7 ? "vst7" : "vst19" : p.vat;
    const gross = parseEuroToCents(p.grossInput);
    const v = VAT_RATES[effVat];
    const {
      netto,
      steuer
    } = vatSplit(gross, v.rate);
    const inv = gross <= 0;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: p.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "crow"
    }, /*#__PURE__*/React.createElement("span", {
      className: "adot-wrap"
    }, /*#__PURE__*/React.createElement(ConfidenceDot, {
      level: p.confidence
    })), /*#__PURE__*/React.createElement("span", {
      className: "crow__num"
    }, i + 1), /*#__PURE__*/React.createElement(KontoCombobox, {
      value: p.account,
      options: ACCOUNTS,
      onChange: no => setPos(p.id, {
        account: no
      }),
      placeholder: "Sachkonto",
      invalid: !p.account
    }), /*#__PURE__*/React.createElement("div", {
      className: "shtog" + (p.sh === "H" ? " is-h" : "")
    }, /*#__PURE__*/React.createElement("button", {
      className: p.sh === "S" ? "on" : "",
      onClick: () => setPos(p.id, {
        sh: "S"
      })
    }, "S"), /*#__PURE__*/React.createElement("button", {
      className: p.sh === "H" ? "on" : "",
      onClick: () => setPos(p.id, {
        sh: "H"
      })
    }, "H")), /*#__PURE__*/React.createElement(BuSelect, {
      value: effVat,
      onChange: k => setPos(p.id, {
        vat: k
      }),
      disabled: auto
    }), /*#__PURE__*/React.createElement("div", {
      className: "cbrutto" + (inv ? " is-invalid" : "")
    }, /*#__PURE__*/React.createElement("input", {
      className: "num",
      inputMode: "decimal",
      value: p.grossInput,
      onChange: e => setPos(p.id, {
        grossInput: e.target.value
      }),
      onKeyDown: onBruttoKey,
      placeholder: "0,00"
    }), /*#__PURE__*/React.createElement("span", {
      className: "cbrutto__cur"
    }, "\u20AC")), showKost && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
      className: "crow-input num",
      style: {
        textAlign: "center"
      },
      value: p.kost1,
      onChange: e => setPos(p.id, {
        kost1: e.target.value
      })
    }), /*#__PURE__*/React.createElement("input", {
      className: "crow-input num",
      style: {
        textAlign: "center"
      },
      value: p.kost2,
      onChange: e => setPos(p.id, {
        kost2: e.target.value
      })
    })), /*#__PURE__*/React.createElement("button", {
      className: "crow-menu",
      title: "Zeile entfernen",
      disabled: positions.length <= 1,
      onClick: () => delRow(setPositions, p.id)
    }, MB.trash({
      size: 15
    }))), auto ? /*#__PURE__*/React.createElement("div", {
      className: "c-autohint"
    }, MB.info({
      size: 13
    }), " Automatikkonto \u2014 versteuert selbst (fester Satz ", acc.impliedRate, " %), BU gesperrt") : v.rate > 0 && gross > 0 ? /*#__PURE__*/React.createElement("div", {
      className: "crow-derived"
    }, MB.cornerDown({
      size: 13
    }), " darin ", /*#__PURE__*/React.createElement("b", {
      className: "num"
    }, formatCents(steuer), " \u20AC"), " ", v.short.replace("VSt", "Vorsteuer"), /*#__PURE__*/React.createElement("span", {
      className: "arr"
    }, MB.arrowRight({
      size: 11
    })), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, v.taxAccount), "\xB7 netto ", /*#__PURE__*/React.createElement("b", {
      className: "num"
    }, formatCents(netto), " \u20AC")) : /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6
      }
    }));
  })), /*#__PURE__*/React.createElement("button", {
    className: "c-add",
    onClick: isZahlung ? addPst : addPos
  }, MB.plus({
    size: 15
  }), " ", isZahlung ? "Posten" : "Zeile", " hinzuf\xFCgen"), !isZahlung && !showKost && /*#__PURE__*/React.createElement("button", {
    className: "morefields__bar",
    style: {
      marginLeft: 14
    },
    onClick: () => setOpenKost(true)
  }, MB.plus({
    size: 13
  }), " KOST / Zeilentexte einblenden"), /*#__PURE__*/React.createElement("div", {
    className: "cgegen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cgegen__lead"
  }, "an"), /*#__PURE__*/React.createElement("div", {
    className: "cgegen__acc"
  }, /*#__PURE__*/React.createElement(KontoCombobox, {
    value: counterAcc,
    options: CREDITORS,
    onChange: setCounterAcc,
    placeholder: isZahlung ? "Bank / Kasse" : "Gegenkonto"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cgegen__hint"
  }, isZahlung ? "Zahlbetrag der Bank-Transaktion — Rest läuft gegen 0" : "Betrag = Summe der Zeilen — immer ausgeglichen")), /*#__PURE__*/React.createElement("div", {
    className: "cgegen__amt"
  }, isZahlung ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "tgt-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tgt-lbl"
  }, "Zahlbetrag"), /*#__PURE__*/React.createElement("span", {
    className: "tgt-val num"
  }, formatCents(target), " \u20AC")), /*#__PURE__*/React.createElement("div", {
    className: "tgt-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tgt-lbl"
  }, "Summe Posten"), /*#__PURE__*/React.createElement("span", {
    className: "cgegen__sum",
    style: {
      fontSize: 15
    }
  }, formatCents(sumCents), " \u20AC")), rest === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "restpill is-ok"
  }, MB.check({
    size: 12
  }), " ausgeglichen") : /*#__PURE__*/React.createElement("span", {
    className: "restpill is-open"
  }, MB.alert({
    size: 12
  }), " ", rest > 0 ? "Rest " + formatCents(rest) + " € offen" : formatCents(-rest) + " € zu viel")) : /*#__PURE__*/React.createElement("span", {
    className: "cgegen__sum"
  }, formatCents(sumCents), " \u20AC"))), /*#__PURE__*/React.createElement("div", {
    className: "morefields" + (more ? " is-open" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "morefields__bar",
    onClick: () => setMore(m => !m)
  }, /*#__PURE__*/React.createElement("span", {
    className: "morefields__chev"
  }, MB.chevRight({
    size: 14
  })), "Weitere Felder (Belegfeld 2, KOST-Zusammenfassung, Datum-Detail)"), more && /*#__PURE__*/React.createElement("div", {
    className: "morefields__body"
  }, "Belegfeld 2: \u2014 \xB7 KOST-Zusammenfassung: ", b.details && b.details.provenance ? "je Zeile erfassbar" : "—", " \xB7 Buchungsdatum ", b.date, " \xB7 Quelle: ", b.details ? b.details.provenance : "—")), /*#__PURE__*/React.createElement("div", {
    className: "editbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "panel__hint"
  }, hint), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: onCancel
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm" + (flash ? " is-flash" : ""),
    disabled: !canSubmit,
    onClick: doSubmit
  }, flash ? /*#__PURE__*/React.createElement(React.Fragment, null, MB.check({
    size: 16
  }), " \xDCbernommen") : "Übernehmen")));
}
window.BuSelect = BuSelect;
window.ProjectionC = ProjectionC;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-editorC.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-style Icons, 1.5 stroke — Ludwig house style. Self-contained subset.
const MbIcon = ({
  d,
  size = 18,
  sw = 1.5,
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style,
  "aria-hidden": "true"
}, d);
const MB = {
  x: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    }))
  })),
  check: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })
  })),
  plus: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }))
  })),
  trash: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "3 6 5 6 21 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
    }))
  })),
  lock: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "11",
      width: "18",
      height: "11",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11V7a5 5 0 0 1 10 0v4"
    }))
  })),
  info: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12.01",
      y2: "8"
    }))
  })),
  alert: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  })),
  chevDown: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    })
  })),
  chevRight: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })
  })),
  cornerDown: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "9 10 4 15 9 20"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 4v7a4 4 0 0 1-4 4H4"
    }))
  })),
  arrowRight: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    }))
  })),
  undo: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 7v6h6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"
    }))
  })),
  scale: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3v18M5 7h14M8 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"
    }))
  })),
  table: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "9",
      x2: "21",
      y2: "9"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "15",
      x2: "21",
      y2: "15"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "3",
      x2: "12",
      y2: "21"
    }))
  })),
  receipt: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 8h-8M16 12h-8M13 16h-5"
    }))
  })),
  search: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    }))
  })),
  link: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
    }))
  })),
  repeat: p => /*#__PURE__*/React.createElement(MbIcon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "17 1 21 5 17 9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 11V9a4 4 0 0 1 4-4h14"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 23 3 19 7 15"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 13v2a4 4 0 0 1-4 4H3"
    }))
  }))
};
window.MbIcon = MbIcon;
window.MB = MB;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-icons.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-money.jsx
try { (() => {
// ============================================================================
// Geld-Mathematik — deutsches Format, in Cent gerechnet (keine Float-Fehler).
// Brutto ist die Eingabe; netto/steuer werden abgeleitet — identisch zum
// Server (expandGrossToExplicit): netto = round(brutto / (1 + satz/100)),
// steuer = brutto − netto. Die Rundungsdifferenz sitzt auf der Steuerzeile.
// ============================================================================

// "1.800,00" | "1800,5" | "1800" -> Cent (Integer). Leere/kaputte Eingabe -> 0.
function parseEuroToCents(s) {
  if (typeof s === "number") return Math.round(s * 100);
  if (!s) return 0;
  const cleaned = String(s).trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return 0;
  // deutsches Format: Punkt = Tausender, Komma = Dezimal
  const norm = cleaned.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(norm);
  return isNaN(n) ? 0 : Math.round(n * 100);
}

// Cent -> "1.800,00" (immer zwei Nachkommastellen, deutsche Tausenderpunkte)
function formatCents(cents) {
  const neg = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const euros = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  const grouped = String(euros).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-" : "") + grouped + "," + rest;
}

// Brutto (Cent) + Satz (%) -> { netto, steuer } (Cent)
function vatSplit(bruttoCents, ratePct) {
  if (!ratePct) return {
    netto: bruttoCents,
    steuer: 0
  };
  const netto = Math.round(bruttoCents / (1 + ratePct / 100));
  return {
    netto,
    steuer: bruttoCents - netto
  };
}
window.parseEuroToCents = parseEuroToCents;
window.formatCents = formatCents;
window.vatSplit = vatSplit;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-money.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-position.jsx
try { (() => {
// ============================================================================
// Position-Karte — eine Karte je Kostenart. Konto · Brutto · USt-Satz ·
// abgeleitete Steuer-Unterzeile · Zeilentext · KOST · Ampel.
// Brutto ist das einzige Betragsfeld; netto/steuer laufen live abgeleitet.
// Depends on mb-icons.jsx, mb-money.jsx, mb-data.jsx.
// ============================================================================
const {
  useState: useStateP,
  useRef: useRefP,
  useEffect: useEffectP
} = React;

// ---- Ampel (ConfidenceDot) --------------------------------------------------
function ConfidenceDot({
  level
}) {
  if (!level) return /*#__PURE__*/React.createElement("span", {
    className: "cdot cdot--none",
    title: "Neue Position"
  });
  if (level === "review") return /*#__PURE__*/React.createElement("span", {
    className: "cdot cdot--review",
    title: "Ludwig unsicher \u2014 bitte pr\xFCfen"
  });
  return /*#__PURE__*/React.createElement("span", {
    className: "cdot cdot--high",
    title: "Ludwig sicher"
  });
}

// ---- Konto-Combobox ---------------------------------------------------------
function KontoCombobox({
  value,
  options,
  onChange,
  placeholder,
  disabled,
  invalid,
  size
}) {
  const [open, setOpen] = useStateP(false);
  const [q, setQ] = useStateP("");
  const wrapRef = useRefP(null);
  const inpRef = useRefP(null);
  useEffectP(() => {
    if (!open) return;
    const onDoc = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  useEffectP(() => {
    if (open && inpRef.current) inpRef.current.focus();
  }, [open]);
  const sel = options.find(o => o.no === value);
  const ql = q.trim().toLowerCase();
  const list = ql ? options.filter(o => (o.no + " " + o.name).toLowerCase().includes(ql)) : options;
  const pick = no => {
    onChange(no);
    setOpen(false);
    setQ("");
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "kcb" + (size === "sm" ? " kcb--sm" : "") + (invalid ? " is-invalid" : ""),
    ref: wrapRef
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "kcb__btn",
    disabled: disabled,
    onClick: () => !disabled && setOpen(o => !o)
  }, sel ? /*#__PURE__*/React.createElement("span", {
    className: "kcb__val"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kcb__no"
  }, sel.no), /*#__PURE__*/React.createElement("span", {
    className: "kcb__nm"
  }, sel.name)) : /*#__PURE__*/React.createElement("span", {
    className: "kcb__ph"
  }, placeholder || "Konto wählen"), !disabled && /*#__PURE__*/React.createElement("span", {
    className: "kcb__chev"
  }, MB.chevDown({
    size: 15
  }))), open && /*#__PURE__*/React.createElement("div", {
    className: "kcb__pop"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kcb__search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, MB.search({
    size: 14
  })), /*#__PURE__*/React.createElement("input", {
    ref: inpRef,
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Konto oder Bezeichnung"
  })), /*#__PURE__*/React.createElement("div", {
    className: "kcb__list"
  }, list.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "kcb__empty"
  }, "Kein Treffer"), list.map(o => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: o.no,
    className: "kcb__opt" + (o.no === value ? " is-sel" : ""),
    onClick: () => pick(o.no)
  }, /*#__PURE__*/React.createElement("span", {
    className: "kcb__no"
  }, o.no), /*#__PURE__*/React.createElement("span", {
    className: "kcb__nm"
  }, o.name), o.automatic && /*#__PURE__*/React.createElement("span", {
    className: "kcb__auto"
  }, "Automatik"))))));
}

// ---- USt-Select -------------------------------------------------------------
function UstSelect({
  value,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ust" + (disabled ? " is-disabled" : "")
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    disabled: disabled,
    onChange: e => onChange(e.target.value)
  }, VAT_ORDER.map(k => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, VAT_RATES[k].label))), !disabled && /*#__PURE__*/React.createElement("span", {
    className: "ust__chev"
  }, MB.chevDown({
    size: 15
  })));
}

// ---- Abgeleitete Steuer-Unterzeile -----------------------------------------
function DerivedTaxLine({
  grossCents,
  vatKey
}) {
  const v = VAT_RATES[vatKey];
  if (!v || v.rate === 0 || !grossCents) return null; // „ohne USt" -> keine Unterzeile
  const {
    netto,
    steuer
  } = vatSplit(grossCents, v.rate);
  return /*#__PURE__*/React.createElement("div", {
    className: "derived",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("span", {
    className: "derived__ic"
  }, MB.cornerDown({
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    className: "derived__txt"
  }, "darin ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, formatCents(steuer), " \u20AC"), " ", v.short.replace("VSt", "Vorsteuer"), /*#__PURE__*/React.createElement("span", {
    className: "derived__arrow"
  }, MB.arrowRight({
    size: 12
  })), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, v.taxAccount), /*#__PURE__*/React.createElement("span", {
    className: "derived__sep"
  }, "\xB7"), "netto ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, formatCents(netto), " \u20AC")));
}

// ---- Position-Karte ---------------------------------------------------------
function PositionCard({
  pos,
  index,
  canDelete,
  locked,
  onChange,
  onDelete
}) {
  const acc = findAccount(pos.account);
  const auto = acc && acc.automatic;
  // Automatikkonto erzwingt seinen festen Satz
  const effVat = auto ? acc.impliedRate === 7 ? "vst7" : "vst19" : pos.vat;
  const grossCents = parseEuroToCents(pos.grossInput);
  const grossInvalid = grossCents <= 0;
  const set = patch => onChange(pos.id, patch);
  const onGrossKey = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      window.dispatchEvent(new CustomEvent("mb-submit"));
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "pcard" + (locked ? " is-locked" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard__rail"
  }, /*#__PURE__*/React.createElement(ConfidenceDot, {
    level: pos.confidence
  })), /*#__PURE__*/React.createElement("div", {
    className: "pcard__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard__top"
  }, /*#__PURE__*/React.createElement("label", {
    className: "pfield pfield--konto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Konto"), /*#__PURE__*/React.createElement(KontoCombobox, {
    value: pos.account,
    options: ACCOUNTS,
    onChange: no => set({
      account: no
    }),
    placeholder: "Sachkonto w\xE4hlen",
    disabled: locked,
    invalid: !pos.account
  })), /*#__PURE__*/React.createElement("label", {
    className: "pfield pfield--brutto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Brutto"), /*#__PURE__*/React.createElement("div", {
    className: "binput" + (grossInvalid ? " is-invalid" : "")
  }, /*#__PURE__*/React.createElement("input", {
    className: "num",
    inputMode: "decimal",
    value: pos.grossInput,
    disabled: locked,
    onChange: e => set({
      grossInput: e.target.value
    }),
    onKeyDown: onGrossKey,
    placeholder: "0,00"
  }), /*#__PURE__*/React.createElement("span", {
    className: "binput__cur"
  }, "\u20AC")))), /*#__PURE__*/React.createElement("label", {
    className: "pfield pfield--ust"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "USt-Satz"), /*#__PURE__*/React.createElement(UstSelect, {
    value: effVat,
    onChange: k => set({
      vat: k
    }),
    disabled: locked || auto
  })), auto && /*#__PURE__*/React.createElement("div", {
    className: "autohint"
  }, MB.info({
    size: 13
  }), " Automatikkonto \u2014 versteuert selbst (fester Satz ", acc.impliedRate, " %)"), /*#__PURE__*/React.createElement(DerivedTaxLine, {
    grossCents: grossCents,
    vatKey: effVat
  }), /*#__PURE__*/React.createElement("label", {
    className: "pfield"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "Zeilentext"), /*#__PURE__*/React.createElement("input", {
    className: "tinput",
    value: pos.text,
    disabled: locked,
    placeholder: "Buchungstext dieser Position",
    onChange: e => set({
      text: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "pcard__foot"
  }, /*#__PURE__*/React.createElement("label", {
    className: "pfield pfield--kost"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "KOST 1"), /*#__PURE__*/React.createElement("input", {
    className: "kinput num",
    value: pos.kost1,
    disabled: locked,
    onChange: e => set({
      kost1: e.target.value
    })
  })), /*#__PURE__*/React.createElement("label", {
    className: "pfield pfield--kost"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pfield__lbl"
  }, "KOST 2"), /*#__PURE__*/React.createElement("input", {
    className: "kinput num",
    value: pos.kost2,
    disabled: locked,
    onChange: e => set({
      kost2: e.target.value
    })
  })), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), grossInvalid && !locked && /*#__PURE__*/React.createElement("span", {
    className: "perr"
  }, "Brutto muss > 0 sein"), !pos.account && !locked && /*#__PURE__*/React.createElement("span", {
    className: "perr"
  }, "Konto fehlt"), canDelete && !locked && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pdel",
    title: "Position entfernen",
    onClick: () => onDelete(pos.id)
  }, MB.trash({
    size: 16
  })))));
}
window.ConfidenceDot = ConfidenceDot;
window.KontoCombobox = KontoCombobox;
window.UstSelect = UstSelect;
window.PositionCard = PositionCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-position.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb-proj4.jsx
try { (() => {
// ============================================================================
// v4 — Anzeige-Projektionen. A (Kompakt-Satz, Varianten A1/A2/A3) und
// B (volle Soll/Haben-Tabelle, read-only). Plus SatzHead + SatzDetails (§8).
// Depends on mb-icons, mb-money, mb-data, mb-data4, mb-position (ConfidenceDot),
//   mb-datev (expandToRawLines).
// ============================================================================
const {
  useState: useStatePr
} = React;
function nameOf(no) {
  return accountLabel(no).replace(/^\S+\s+—\s+/, "");
}
function shortDoc(v) {
  return v && v.length > 8 ? "…" + v.slice(-4) : v;
}

// Normalisiert eine Buchung auf { rows, counter, vst, netto } für Projektion A.
function aData(b) {
  if (b.kind === "zahlung") {
    const rows = b.posten.map(p => ({
      dot: p.confidence,
      no: p.account,
      nm: nameOf(p.account),
      belegfeld: p.belegfeld,
      amt: parseEuroToCents(p.amountInput)
    }));
    const sum = rows.reduce((s, r) => s + r.amt, 0);
    return {
      rows,
      counter: {
        no: b.counter.account,
        nm: nameOf(b.counter.account),
        amt: sum
      },
      vst: 0,
      netto: null,
      isZahlung: true
    };
  }
  let sum = 0,
    vst = 0;
  const rows = b.positions.map(p => {
    const acc = findAccount(p.account);
    const auto = acc && acc.automatic;
    const vk = auto ? acc.impliedRate === 7 ? "vst7" : "vst19" : p.vat;
    const v = VAT_RATES[vk];
    const gross = parseEuroToCents(p.grossInput);
    sum += gross;
    const {
      steuer
    } = vatSplit(gross, v.rate);
    vst += steuer;
    return {
      dot: p.confidence,
      no: p.account,
      nm: nameOf(p.account),
      auto,
      buLabel: v.rate ? "BU " + v.bu + " (" + v.rate + " %)" : "ohne USt",
      vShort: v.short,
      taxAccount: v.taxAccount,
      amt: gross,
      kost: p.kost1
    };
  });
  return {
    rows,
    counter: {
      no: b.counter.account,
      nm: nameOf(b.counter.account),
      amt: sum
    },
    vst,
    netto: sum - vst,
    isZahlung: false
  };
}

// ---- Satz-Kopf (Datum · Beleg · Partner + Badges) --------------------------
function SatzHead({
  b
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "satz__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "satz__date"
  }, b.date), /*#__PURE__*/React.createElement("span", {
    className: "satz__doc"
  }, b.docLabel), /*#__PURE__*/React.createElement("span", {
    className: "satz__partner"
  }, "\xB7 ", b.partner), /*#__PURE__*/React.createElement("span", {
    className: "satz__badges"
  }, b.origin === "ai" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--ai"
  }, MB.info({
    size: 12
  }), " KI-Vorschlag"), b.gu && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--gu"
  }, "GU \xB7 Storno"), b.aBadge === "Skonto" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--skonto"
  }, "Skonto"), b.status === "prüfen" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--pruefen"
  }, "zu pr\xFCfen"), b.status === "gebucht" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--gebucht"
  }, MB.lock({
    size: 11
  }), " gebucht"), b.status === "storniert" && /*#__PURE__*/React.createElement("span", {
    className: "mbadge mbadge--storno"
  }, "storniert")));
}

// ---- Satz-Details (§8, Disclosure Satz-Ebene) ------------------------------
function SatzDetails({
  b,
  open,
  onToggle
}) {
  const d = b.details || {};
  const items = [d.provenance && {
    k: "Quelle / Provenance",
    v: d.provenance
  }, d.erfasser && {
    k: "Erfasser",
    v: d.erfasser
  }, d.exportStatus && {
    k: "Export-Status",
    v: d.exportStatus
  }, {
    k: "Belegfeld 2",
    v: d.beleg2 || "—"
  }, b.gu && {
    k: "Ursprungssatz",
    v: "Buchung " + b.stornoRef
  }].filter(Boolean);
  const count = items.filter(i => i.v && i.v !== "—").length;
  return /*#__PURE__*/React.createElement("div", {
    className: "details" + (open ? " is-open" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "details__bar",
    onClick: onToggle
  }, /*#__PURE__*/React.createElement("span", {
    className: "details__chev"
  }, MB.chevRight({
    size: 15
  })), "Details", /*#__PURE__*/React.createElement("span", {
    className: "details__count"
  }, count)), open && /*#__PURE__*/React.createElement("div", {
    className: "details__body"
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "details__item",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "details__k"
  }, it.k), /*#__PURE__*/React.createElement("div", {
    className: "details__v"
  }, it.v)))));
}

// ---- Projektion A ----------------------------------------------------------
function ProjectionA({
  b,
  variant
}) {
  const [open, setOpen] = useStatePr(false);
  const d = aData(b);
  const single = !d.isZahlung && d.rows.length === 1;
  const ampel = satzAmpel(b.kind === "zahlung" ? b.posten : b.positions);
  const isA2 = variant === "a2";
  const KontoSpan = ({
    r
  }) => /*#__PURE__*/React.createElement("span", {
    className: "akonto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "akonto__no"
  }, r.no), /*#__PURE__*/React.createElement("span", {
    className: "akonto__nm"
  }, r.nm));

  // Zeile-2-Inhalt (A1 Fließtext)
  const metaProse = /*#__PURE__*/React.createElement("div", {
    className: "ameta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ameta__doc"
  }, b.text), !d.isZahlung && d.vst > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\xB7"), "darin ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, "\xA0", formatCents(d.vst), " \u20AC"), "\xA0VSt"), !d.isZahlung && b.belegfeld && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\xB7"), "Beleg ", /*#__PURE__*/React.createElement("b", null, b.belegfeld)));
  // A3 Chips (nur mit Wert)
  const firstRow = d.rows[0] || {};
  const chips = /*#__PURE__*/React.createElement("div", {
    className: "achips"
  }, !d.isZahlung && firstRow.buLabel && firstRow.buLabel !== "ohne USt" && /*#__PURE__*/React.createElement("span", {
    className: "achip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "achip__k"
  }, "BU"), " ", /*#__PURE__*/React.createElement("b", null, firstRow.buLabel.replace("BU ", ""))), !d.isZahlung && d.vst > 0 && /*#__PURE__*/React.createElement("span", {
    className: "achip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "achip__k"
  }, "VSt"), " ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, formatCents(d.vst), " \u20AC")), b.belegfeld && /*#__PURE__*/React.createElement("span", {
    className: "achip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "achip__k"
  }, "Beleg"), " ", /*#__PURE__*/React.createElement("b", null, b.belegfeld)), !d.isZahlung && firstRow.kost && /*#__PURE__*/React.createElement("span", {
    className: "achip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "achip__k"
  }, "KOST"), " ", /*#__PURE__*/React.createElement("b", null, firstRow.kost)));
  return /*#__PURE__*/React.createElement("div", {
    className: "asatz" + (isA2 ? " is-a2" : "") + (open ? " is-open" : "")
  }, single ? /*#__PURE__*/React.createElement("div", {
    className: "arow"
  }, isA2 ? /*#__PURE__*/React.createElement("button", {
    className: "achev",
    onClick: () => setOpen(o => !o)
  }, MB.chevRight({
    size: 16
  })) : /*#__PURE__*/React.createElement("span", {
    className: "adot-wrap"
  }, /*#__PURE__*/React.createElement(ConfidenceDot, {
    level: ampel
  })), /*#__PURE__*/React.createElement("span", {
    className: "arow__lead"
  }, /*#__PURE__*/React.createElement(KontoSpan, {
    r: firstRow
  }), firstRow.buLabel && /*#__PURE__*/React.createElement("span", {
    className: "abu" + (firstRow.auto ? " abu--auto" : "")
  }, firstRow.auto ? "Automatik" : firstRow.buLabel), /*#__PURE__*/React.createElement("span", {
    className: "aan"
  }, "an"), /*#__PURE__*/React.createElement("span", {
    className: "akonto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "akonto__no"
  }, d.counter.no), /*#__PURE__*/React.createElement("span", {
    className: "akonto__nm"
  }, d.counter.nm))), /*#__PURE__*/React.createElement("span", {
    className: "aamt"
  }, formatCents(d.counter.amt), " \u20AC")) : /*#__PURE__*/React.createElement(React.Fragment, null, d.rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "arow" + (i > 0 ? " aindent" : ""),
    key: i
  }, i === 0 && !isA2 && /*#__PURE__*/React.createElement("span", {
    className: "adot-wrap"
  }, /*#__PURE__*/React.createElement(ConfidenceDot, {
    level: ampel
  })), i === 0 && isA2 && /*#__PURE__*/React.createElement("button", {
    className: "achev",
    onClick: () => setOpen(o => !o)
  }, MB.chevRight({
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "arow__lead"
  }, /*#__PURE__*/React.createElement(KontoSpan, {
    r: r
  }), r.buLabel && /*#__PURE__*/React.createElement("span", {
    className: "abu" + (r.auto ? " abu--auto" : "")
  }, r.auto ? "Automatik" : r.buLabel), d.isZahlung && r.belegfeld && /*#__PURE__*/React.createElement("span", {
    className: "abu"
  }, "Beleg ", r.belegfeld)), /*#__PURE__*/React.createElement("span", {
    className: "aamt aamt--sub"
  }, formatCents(r.amt), " \u20AC"))), /*#__PURE__*/React.createElement("div", {
    className: "arow arow--counter aindent"
  }, /*#__PURE__*/React.createElement("span", {
    className: "arow__lead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "aan"
  }, "an"), /*#__PURE__*/React.createElement("span", {
    className: "akonto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "akonto__no"
  }, d.counter.no), /*#__PURE__*/React.createElement("span", {
    className: "akonto__nm"
  }, d.counter.nm))), /*#__PURE__*/React.createElement("span", {
    className: "aamt"
  }, formatCents(d.counter.amt), " \u20AC"))), variant === "a1" && metaProse, variant === "a3" && chips, isA2 && open && /*#__PURE__*/React.createElement("div", {
    className: "adisc"
  }, metaProse, chips));
}

// ---- Projektion B — volle Soll/Haben-Tabelle -------------------------------
function bLines(b) {
  if (b.fallback) {
    return b.rawLines.map(l => ({
      account: l.account,
      name: l.name,
      soll: l.soll ? parseEuroToCents(l.soll) : null,
      haben: l.haben ? parseEuroToCents(l.haben) : null,
      bu: l.bu,
      text: l.text,
      belegfeld: l.belegfeld,
      kost1: l.kost1,
      derived: l.derived,
      counter: l.counter
    }));
  }
  if (b.kind === "zahlung") {
    const lines = [];
    let sum = 0;
    b.posten.forEach(p => {
      const c = parseEuroToCents(p.amountInput);
      sum += c;
      lines.push({
        account: p.account,
        name: nameOf(p.account),
        soll: c,
        haben: null,
        bu: "",
        text: b.text,
        belegfeld: p.belegfeld,
        kost1: ""
      });
    });
    lines.push({
      account: b.counter.account,
      name: nameOf(b.counter.account),
      soll: null,
      haben: sum,
      bu: "",
      text: b.text,
      belegfeld: "",
      kost1: "",
      counter: true
    });
    return lines;
  }
  return expandToRawLines(b);
}
function ProjectionB({
  b
}) {
  const lines = bLines(b);
  let soll = 0,
    haben = 0;
  lines.forEach(l => {
    soll += l.soll || 0;
    haben += l.haben || 0;
  });
  const showText = lines.some(l => l.text);
  const showBeleg = lines.some(l => l.belegfeld);
  const showKost = lines.some(l => l.kost1);
  const cell = v => v == null ? "" : formatCents(v);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "btab-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "btab"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Konto"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Soll"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Haben"), /*#__PURE__*/React.createElement("th", {
    className: "c"
  }, "BU"), showText && /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Zeilentext"), showBeleg && /*#__PURE__*/React.createElement("th", {
    className: "l"
  }, "Belegfeld 1"), showKost && /*#__PURE__*/React.createElement("th", {
    className: "c"
  }, "KOST"))), /*#__PURE__*/React.createElement("tbody", null, lines.map((l, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: (l.derived ? "is-derived " : "") + (l.counter ? "is-counter" : "")
  }, /*#__PURE__*/React.createElement("td", {
    className: "l btab__acc"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, l.account), " ", /*#__PURE__*/React.createElement("span", {
    className: "btab__nm"
  }, l.name)), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, cell(l.soll)), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, cell(l.haben)), /*#__PURE__*/React.createElement("td", {
    className: "c mono"
  }, l.bu), showText && /*#__PURE__*/React.createElement("td", {
    className: "l btab__nm"
  }, l.text), showBeleg && /*#__PURE__*/React.createElement("td", {
    className: "l mono"
  }, l.belegfeld), showKost && /*#__PURE__*/React.createElement("td", {
    className: "c mono"
  }, l.kost1)))))), /*#__PURE__*/React.createElement("div", {
    className: "bfoot"
  }, MB.check({
    size: 14
  }), " \u03A3 Soll = \u03A3 Haben", /*#__PURE__*/React.createElement("span", {
    className: "bfoot__nums"
  }, "\u2014 Soll ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, formatCents(soll), " \u20AC"), " \xB7 Haben ", /*#__PURE__*/React.createElement("b", {
    className: "num"
  }, formatCents(haben), " \u20AC"))));
}
window.nameOf = nameOf;
window.aData = aData;
window.SatzHead = SatzHead;
window.SatzDetails = SatzDetails;
window.ProjectionA = ProjectionA;
window.bLines = bLines;
window.ProjectionB = ProjectionB;
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb-proj4.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb2-app.jsx
try { (() => {
// ============================================================================
// v2 — Drawer „Buchung bearbeiten" ÜBER dem Sachverhalt geöffnet.
// Der Hintergrund zeigt die Sachverhalt-Detailseite (Mietverhältnis Büro
// Lindenstraße), aus der heraus eine Buchung geprüft/korrigiert wird.
// Depends on mb-icons, mb-money, mb-data, mb-data2, mb-position, mb-datev, mb-editor.
// ============================================================================
const {
  useState: useState2
} = React;

// ---- Sachverhalt-Buchungen (im „Saldo & Konten"-Tab) -----------------------
const SV_ROWS = [{
  d: "31.03.2026",
  txt: "Miete + Stellplatz März 2026",
  soll: "4210 · 4200",
  betr: "2.320,50",
  st: "prüfen"
}, {
  d: "28.02.2026",
  txt: "Mietaufwand Februar 2026",
  soll: "4210",
  betr: "2.142,00",
  st: "prüfen",
  active: true
}, {
  d: "31.01.2026",
  txt: "Mietaufwand Januar 2026",
  soll: "4210",
  betr: "2.142,00",
  st: "gebucht"
}, {
  d: "01.01.2026",
  txt: "Kaution Büro Lindenstraße",
  soll: "1500",
  betr: "3.600,00",
  st: "gebucht"
}];
const NAV = [{
  label: "Übersicht"
}, {
  label: "Posteingang",
  badge: "47"
}, {
  label: "Mandanten",
  badge: "24"
}, {
  label: "Klärungen",
  badge: "8"
}, {
  label: "DATEV-Export"
}, {
  label: "Berichte"
}];
const TABS = ["Übersicht", "Saldo & Konten", "Rückfragen", "Belege", "Wiederkehrende Buchung"];
function SachverhaltBackdrop() {
  return /*#__PURE__*/React.createElement("div", {
    className: "sv",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "sv-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/ludwig-mark.svg",
    alt: ""
  }), " ", /*#__PURE__*/React.createElement("span", null, "Ludwig")), /*#__PURE__*/React.createElement("div", {
    className: "sv-navlbl"
  }, "Arbeit"), /*#__PURE__*/React.createElement("nav", {
    className: "sv-nav"
  }, NAV.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: n.label,
    className: "sv-navi" + (i === 1 ? " is-active" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), n.label, n.badge && /*#__PURE__*/React.createElement("span", {
    className: "sv-badge"
  }, n.badge)))), /*#__PURE__*/React.createElement("div", {
    className: "sv-navlbl"
  }, "Kanzlei"), /*#__PURE__*/React.createElement("div", {
    className: "sv-navi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Einstellungen"), /*#__PURE__*/React.createElement("div", {
    className: "sv-user"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-ava"
  }, "SH"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "Stefan Hofmann"), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, "Steuerberater")))), /*#__PURE__*/React.createElement("main", {
    className: "sv-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-ten"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-ten__ava"
  }, "BV"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Berger GmbH"))), /*#__PURE__*/React.createElement("span", {
    className: "sv-crumb"
  }, "Posteingang", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Sachverhalt 2026-0051"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sv-search"
  }, MB.search({
    size: 15
  }), " Suchen\u2026")), /*#__PURE__*/React.createElement("div", {
    className: "sv-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-head__ic"
  }, MB.repeat({
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    className: "sv-head__main"
  }, /*#__PURE__*/React.createElement("h1", null, "Mietverh\xE4ltnis: B\xFCro Lindenstra\xDFe"), /*#__PURE__*/React.createElement("div", {
    className: "sv-head__sub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "2026-0051"), /*#__PURE__*/React.createElement("span", {
    className: "sv-open"
  }, "Offen"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Immobilien Vogt KG", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Wiederkehrend", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Miete")), /*#__PURE__*/React.createElement("div", {
    className: "sv-head__amt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "a num"
  }, "1.800,00 \u20AC"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "monatlich \xB7 netto"))), /*#__PURE__*/React.createElement("div", {
    className: "sv-tabs"
  }, TABS.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "sv-tab" + (i === 1 ? " is-active" : "")
  }, t, t === "Belege" && /*#__PURE__*/React.createElement("span", {
    className: "sv-tabnum"
  }, "4")))), /*#__PURE__*/React.createElement("div", {
    className: "sv-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-panel__h"
  }, "Saldo & Konten \u2014 Buchungen im Sachverhalt"), /*#__PURE__*/React.createElement("table", {
    className: "sv-tab-t"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Buchungstext"), /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Betrag brutto"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, SV_ROWS.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: r.active ? "is-active" : ""
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.d), /*#__PURE__*/React.createElement("td", null, r.txt, r.active && /*#__PURE__*/React.createElement("span", {
    className: "sv-editing"
  }, "wird bearbeitet")), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.soll), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, r.betr, " \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "jst jst--" + r.st
  }, r.st === "gebucht" ? "gebucht" : "zu prüfen"))))))))));
}

// ---- App -------------------------------------------------------------------
const STATE_ORDER2 = ["ki", "split", "neu", "gesperrt", "s13b"];
function App2() {
  const [stateKey, setStateKey] = useState2(() => localStorage.getItem("ludwig.mb2.state") || "ki");
  const set = k => {
    setStateKey(k);
    localStorage.setItem("ludwig.mb2.state", k);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "demobar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "demobar__lbl"
  }, "Zustand (Demo)"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, STATE_ORDER2.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: stateKey === k ? "active" : "",
    onClick: () => set(k)
  }, BOOKINGS2[k].label))), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "demobar__ctx"
  }, "Drawer \xFCber dem Sachverhalt")), /*#__PURE__*/React.createElement("div", {
    className: "scene"
  }, /*#__PURE__*/React.createElement(SachverhaltBackdrop, null), /*#__PURE__*/React.createElement("div", {
    className: "scrim"
  }), /*#__PURE__*/React.createElement(BookingEditor, {
    key: stateKey,
    makeBooking: BOOKINGS2[stateKey].make,
    onClose: () => {}
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App2, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb2-app.jsx", error: String((e && e.message) || e) }); }

// manual-booking/mb3-app.jsx
try { (() => {
// ============================================================================
// v3 — Drawer „Buchung bearbeiten" (zwei Tabs) über der Sachverhalt-Seite.
// Depends on mb-icons, mb-money, mb-data, mb-data3, mb-position, mb-datev,
//   mb-datev-edit, mb-editor (CounterRow/BelegfeldChip), mb-editor3.
// Nutzt die sv-* Backdrop-Styles aus mb2.css.
// ============================================================================
const {
  useState: useStateA3
} = React;
const SV_ROWS3 = [{
  d: "11.07.2026",
  txt: "M-net Telekommunikation Juni 2026",
  soll: "4920",
  betr: "379,49",
  st: "prüfen",
  active: true
}, {
  d: "11.07.2026",
  txt: "Sammelzahlung Kreditoren KW 28",
  soll: "1210",
  betr: "468,49",
  st: "prüfen"
}, {
  d: "28.02.2026",
  txt: "Miete Büro Lindenstraße Februar",
  soll: "4210",
  betr: "2.142,00",
  st: "gebucht"
}, {
  d: "07.07.2026",
  txt: "Planungsleistung §13b UStG",
  soll: "4909",
  betr: "2.500,00",
  st: "prüfen"
}];
const NAV3 = [{
  label: "Übersicht"
}, {
  label: "Posteingang",
  badge: "47"
}, {
  label: "Mandanten",
  badge: "24"
}, {
  label: "Klärungen",
  badge: "8"
}, {
  label: "DATEV-Export"
}, {
  label: "Berichte"
}];
const TABS3 = ["Übersicht", "Saldo & Konten", "Rückfragen", "Belege", "Wiederkehrende Buchung"];
function SachverhaltBackdrop3() {
  return /*#__PURE__*/React.createElement("div", {
    className: "sv",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "sv-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/ludwig-mark.svg",
    alt: ""
  }), " ", /*#__PURE__*/React.createElement("span", null, "Ludwig")), /*#__PURE__*/React.createElement("div", {
    className: "sv-navlbl"
  }, "Arbeit"), /*#__PURE__*/React.createElement("nav", {
    className: "sv-nav"
  }, NAV3.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: n.label,
    className: "sv-navi" + (i === 1 ? " is-active" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), n.label, n.badge && /*#__PURE__*/React.createElement("span", {
    className: "sv-badge"
  }, n.badge)))), /*#__PURE__*/React.createElement("div", {
    className: "sv-navlbl"
  }, "Kanzlei"), /*#__PURE__*/React.createElement("div", {
    className: "sv-navi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Einstellungen"), /*#__PURE__*/React.createElement("div", {
    className: "sv-user"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-ava"
  }, "SH"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "Stefan Hofmann"), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, "Steuerberater")))), /*#__PURE__*/React.createElement("main", {
    className: "sv-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-ten"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-ten__ava"
  }, "BV"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Berger GmbH"))), /*#__PURE__*/React.createElement("span", {
    className: "sv-crumb"
  }, "Posteingang", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Sachverhalt 2026-0051"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sv-search"
  }, MB.search({
    size: 15
  }), " Suchen\u2026")), /*#__PURE__*/React.createElement("div", {
    className: "sv-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-head__ic"
  }, MB.repeat({
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    className: "sv-head__main"
  }, /*#__PURE__*/React.createElement("h1", null, "Mietverh\xE4ltnis: B\xFCro Lindenstra\xDFe"), /*#__PURE__*/React.createElement("div", {
    className: "sv-head__sub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "2026-0051"), /*#__PURE__*/React.createElement("span", {
    className: "sv-open"
  }, "Offen"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Immobilien Vogt KG", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Wiederkehrend", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), "Miete"))), /*#__PURE__*/React.createElement("div", {
    className: "sv-tabs"
  }, TABS3.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "sv-tab" + (i === 1 ? " is-active" : "")
  }, t, t === "Belege" && /*#__PURE__*/React.createElement("span", {
    className: "sv-tabnum"
  }, "4")))), /*#__PURE__*/React.createElement("div", {
    className: "sv-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-panel__h"
  }, "Saldo & Konten \u2014 Buchungen im Sachverhalt"), /*#__PURE__*/React.createElement("table", {
    className: "sv-tab-t"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Buchungstext"), /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Betrag brutto"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, SV_ROWS3.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: r.active ? "is-active" : ""
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.d), /*#__PURE__*/React.createElement("td", null, r.txt, r.active && /*#__PURE__*/React.createElement("span", {
    className: "sv-editing"
  }, "wird bearbeitet")), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.soll), /*#__PURE__*/React.createElement("td", {
    className: "r num"
  }, r.betr, " \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "jst jst--" + r.st
  }, r.st === "gebucht" ? "gebucht" : "zu prüfen"))))))))));
}
const ORDER3 = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];
function App3() {
  const [key, setKeyRaw] = useStateA3(() => localStorage.getItem("ludwig.mb3.sc") || "s1");
  const setKey = k => {
    setKeyRaw(k);
    localStorage.setItem("ludwig.mb3.sc", k);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "demobar demobar--wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "demobar__lbl"
  }, "Szenario (Demo)"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, ORDER3.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: key === k ? "active" : "",
    onClick: () => setKey(k)
  }, BOOKINGS3[k].label))), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "demobar__ctx"
  }, "Zwei Tabs \xB7 Szenario-Katalog")), /*#__PURE__*/React.createElement("div", {
    className: "scene"
  }, /*#__PURE__*/React.createElement(SachverhaltBackdrop3, null), /*#__PURE__*/React.createElement("div", {
    className: "scrim"
  }), /*#__PURE__*/React.createElement(BookingEditor3, {
    key: key,
    makeBooking: BOOKINGS3[key].make,
    onClose: () => {}
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App3, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "manual-booking/mb3-app.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/app.jsx
try { (() => {
// ============================================================================
// Shell — Ludwig app chrome + design-review switcher (Vorschlag / Szenario).
// ============================================================================
const {
  useEffect
} = React;
const NAV = [{
  id: "dashboard",
  label: "Übersicht",
  icon: I.layers
}, {
  id: "posteingang",
  label: "Posteingang",
  icon: I.receipt,
  count: 47,
  active: true
}, {
  id: "mandanten",
  label: "Mandanten",
  icon: I.bank,
  count: 24
}, {
  id: "klaerungen",
  label: "Klärungen",
  icon: I.help,
  count: 8
}, {
  id: "export",
  label: "DATEV-Export",
  icon: I.download
}, {
  id: "berichte",
  label: "Berichte",
  icon: I.scale
}];
function SideNav() {
  return /*#__PURE__*/React.createElement("aside", {
    className: "app__sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb__logo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/ludwig-logo-light.svg",
    height: "28",
    alt: "Ludwig"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "sb__nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb__navlabel"
  }, "Arbeit"), NAV.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    className: cx("sb__navitem", it.active && "active")
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, it.icon({
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, it.label), it.count != null && /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, it.count))), /*#__PURE__*/React.createElement("div", {
    className: "sb__navlabel",
    style: {
      marginTop: 16
    }
  }, "Kanzlei"), /*#__PURE__*/React.createElement("button", {
    className: "sb__navitem"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, I.edit({
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "Einstellungen"))), /*#__PURE__*/React.createElement("div", {
    className: "sb__user"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, "SH"), /*#__PURE__*/React.createElement("div", {
    className: "sb__user-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, "Stefan Hofmann"), /*#__PURE__*/React.createElement("div", {
    className: "role"
  }, "Steuerberater"))));
}
function TopBar({
  crumb
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "app__topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tb__left"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tenant__btn",
    title: "Mandant wechseln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tenant__avatar",
    style: {
      background: "#1A3A5C"
    }
  }, "BG"), /*#__PURE__*/React.createElement("div", {
    className: "tenant__text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "10024"), /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, "Berger GmbH")), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, I.chevDown({
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "tb__crumb"
  }, crumb)), /*#__PURE__*/React.createElement("div", {
    className: "tb__right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tb__search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, I.search({
    size: 14
  })), /*#__PURE__*/React.createElement("input", {
    placeholder: "Suchen\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "tb__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tb__icon-btn",
    title: "Hilfe"
  }, I.help({
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "tb__icon-btn",
    title: "Benachrichtigungen"
  }, I.bell({
    size: 18
  })))));
}
function ReviewStrip({
  scenKey,
  setScenKey
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rv"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rv__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Ludwig \xB7 Sachverhalt-Detailseite"), /*#__PURE__*/React.createElement("div", {
    className: "rv__group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rv__label"
  }, "Szenario"), /*#__PURE__*/React.createElement("div", {
    className: "rv__seg"
  }, SCEN_ORDER.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: cx(scenKey === k && "active"),
    onClick: () => setScenKey(k)
  }, k, " \xB7 ", SCENARIOS[k].scenarioLabel)))), /*#__PURE__*/React.createElement("div", {
    className: "rv__spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rv__hint"
  }, SCENARIOS[scenKey].scenarioSub));
}
function App() {
  const [scenKey, setScenKey] = useState(() => localStorage.getItem("sv_scen") || "A");
  const scen = SCENARIOS[scenKey];
  const [sel, setSel] = useState(scen.default_event);
  const [acct, setAcct] = useState(null);
  const [tab, setTab] = useState("uebersicht");
  useEffect(() => {
    localStorage.setItem("sv_scen", scenKey);
    setSel(SCENARIOS[scenKey].default_event);
    setAcct(null);
    setTab("uebersicht");
  }, [scenKey]);
  const crumb = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Posteingang"), " \xB7 ", /*#__PURE__*/React.createElement("strong", null, "Sachverhalt ", scen.caseNumber));
  return /*#__PURE__*/React.createElement("div", {
    className: "rv-wrap"
  }, /*#__PURE__*/React.createElement(ReviewStrip, {
    scenKey: scenKey,
    setScenKey: setScenKey
  }), /*#__PURE__*/React.createElement("div", {
    className: "app",
    "data-screen-label": "Sachverhalt " + scen.caseNumber + " · Szenario " + scenKey
  }, /*#__PURE__*/React.createElement(SideNav, null), /*#__PURE__*/React.createElement(TopBar, {
    crumb: crumb
  }), /*#__PURE__*/React.createElement("main", {
    className: "app__main"
  }, /*#__PURE__*/React.createElement(PageMasterDetail, {
    key: scenKey,
    scen: scen,
    sel: sel,
    setSel: setSel,
    acct: acct,
    setAcct: setAcct,
    tab: tab,
    setTab: setTab
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/app.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/belegansicht.jsx
try { (() => {
// ============================================================================
// Full Belegansicht — opened on its own page from "Beleg öffnen" links.
// Reads ?scen=<key>&ev=<id>. Reuses InvoiceDoc/ContractDoc/DocFacts (shared).
// This is where Belegdaten are actually checked: positions, USt rates,
// account assignment and line-splitting.
// ============================================================================
const {
  useState: useStateB
} = React;
function guessKonto(text) {
  if (/versicher/i.test(text)) return "4520 — Kfz-Versicherung";
  if (/leasing/i.test(text)) return "4570 — Leasing Kfz";
  if (/mobilfunk|telefon/i.test(text)) return "6815 — Telefon";
  if (/miete|raum/i.test(text)) return "4210 — Raumkosten / Miete";
  return "— Konto wählen —";
}
function guessUst(item) {
  if (item.ust) return item.ust;
  return /versicher/i.test(item.text) ? "steuerfrei" : "19 %";
}
function BelegPositionsEditor({
  doc
}) {
  const [split, setSplit] = useStateB(true);
  const multi = doc.items && doc.items.length > 1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, multi && /*#__PURE__*/React.createElement("div", {
    className: "bv__toggle"
  }, /*#__PURE__*/React.createElement("button", {
    className: cx("bvseg", !split && "active"),
    onClick: () => setSplit(false)
  }, "Auf ein Konto"), /*#__PURE__*/React.createElement("button", {
    className: cx("bvseg", split && "active"),
    onClick: () => setSplit(true)
  }, "Positionen trennen")), multi && split && /*#__PURE__*/React.createElement("div", {
    className: "bv__splitnote"
  }, I.layers({
    size: 12,
    style: {
      verticalAlign: "-2px",
      marginRight: 5
    }
  }), "Line-Splitting: jede Position wird mit eigenem Konto und Steuerschl\xFCssel gebucht."), split || !multi ? doc.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "bv__pos",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv__pos-text"
  }, it.text), /*#__PURE__*/React.createElement("div", {
    className: "bv__pos-grid three"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv__field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Netto"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, it.net)), /*#__PURE__*/React.createElement("div", {
    className: "bv__field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "USt-Satz"), /*#__PURE__*/React.createElement("select", {
    className: "bv__sel",
    defaultValue: guessUst(it)
  }, /*#__PURE__*/React.createElement("option", null, "19 %"), /*#__PURE__*/React.createElement("option", null, "7 %"), /*#__PURE__*/React.createElement("option", null, "steuerfrei"))), /*#__PURE__*/React.createElement("div", {
    className: "bv__field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Konto"), /*#__PURE__*/React.createElement("input", {
    className: "bv__inp",
    defaultValue: it.konto || guessKonto(it.text)
  }))))) : /*#__PURE__*/React.createElement("div", {
    className: "bv__pos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv__pos-text"
  }, "Gesamtbetrag auf ein Konto"), /*#__PURE__*/React.createElement("div", {
    className: "bv__pos-grid three"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv__field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Brutto"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, doc.gross)), /*#__PURE__*/React.createElement("div", {
    className: "bv__field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "USt-Satz"), /*#__PURE__*/React.createElement("select", {
    className: "bv__sel"
  }, /*#__PURE__*/React.createElement("option", null, "19 %"), /*#__PURE__*/React.createElement("option", null, "7 %"), /*#__PURE__*/React.createElement("option", null, "gemischt"))), /*#__PURE__*/React.createElement("div", {
    className: "bv__field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Konto"), /*#__PURE__*/React.createElement("input", {
    className: "bv__inp",
    defaultValue: guessKonto(doc.items[0].text)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "bv__hint"
  }, I.help({
    size: 13
  }), " Hier werden Belegdaten gepr\xFCft: USt-S\xE4tze je Position, Konto-Zuordnung und ob Positionen getrennt (Line-Splitting) gebucht werden."), /*#__PURE__*/React.createElement("div", {
    className: "flex gap8",
    style: {
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary"
  }, I.check({
    size: 16
  }), " Kontierung \xFCbernehmen"), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-secondary",
    href: "Sachverhalt.html"
  }, "Zur\xFCck zum Sachverhalt")));
}
function BelegFullView({
  scen,
  ev
}) {
  const doc = ev.doc;
  const isContract = doc.type === "contract";
  return /*#__PURE__*/React.createElement("div", {
    className: "bfull"
  }, /*#__PURE__*/React.createElement("header", {
    className: "bfull__top"
  }, /*#__PURE__*/React.createElement("a", {
    className: "bfull__back",
    href: "Sachverhalt.html"
  }, I.chevLeft({
    size: 16
  }), " Zur\xFCck zum Sachverhalt"), /*#__PURE__*/React.createElement("div", {
    className: "bfull__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, doc.invoice_number || "Vertrag"), /*#__PURE__*/React.createElement("h1", null, isContract ? "Vertrag" : "Beleg", " \u2014 ", ev.title), /*#__PURE__*/React.createElement("span", {
    className: "ctx"
  }, scen.title, " \xB7 Sachverhalt ", scen.caseNumber, " \xB7 ", scen.counterparty_name)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, I.download({
    size: 14
  }), " PDF herunterladen")), /*#__PURE__*/React.createElement("div", {
    className: "bfull__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bfull__doc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "docview"
  }, isContract ? /*#__PURE__*/React.createElement(ContractDoc, {
    doc: doc
  }) : /*#__PURE__*/React.createElement(InvoiceDoc, {
    doc: doc
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bfull__side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.layers({
    size: 14
  }), " Extrahierte ", isContract ? "Vertrags" : "Beleg", "daten"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "KI-Extraktion")), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement(DocFacts, {
    doc: doc
  }))), !isContract && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.receipt({
    size: 14
  }), " Positionen & Kontierung")), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement(BelegPositionsEditor, {
    doc: doc
  }))), isContract && doc.clauses && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.contract({
    size: 14
  }), " Vertragsklauseln")), /*#__PURE__*/React.createElement("div", {
    className: "card__b",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, doc.clauses.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 12.5,
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "var(--color-primary)",
      marginBottom: 2
    }
  }, c.n), /*#__PURE__*/React.createElement("div", {
    className: "muted"
  }, c.t))))))));
}
function App() {
  const p = new URLSearchParams(location.search);
  const scen = SCENARIOS[p.get("scen")] || SCENARIOS.A;
  const ev = scen.events.find(e => e.id === p.get("ev") && e.doc) || scen.events.find(e => e.doc);
  if (!ev || !ev.doc) {
    return /*#__PURE__*/React.createElement("div", {
      className: "bfull"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bfull__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "card__b"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-empty"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, I.doc({
      size: 22
    })), /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, "Kein Beleg gefunden"), /*#__PURE__*/React.createElement("div", {
      className: "s"
    }, /*#__PURE__*/React.createElement("a", {
      href: "Sachverhalt.html"
    }, "Zur\xFCck zum Sachverhalt")))))));
  }
  return /*#__PURE__*/React.createElement(BelegFullView, {
    scen: scen,
    ev: ev
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/belegansicht.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/clarifications.jsx
try { (() => {
// ============================================================================
// Rückfragen tab — clarification workflow.
//   list (left, compact) → detail (right):
//     • Sachverhalt-Frage: answered HERE (AI recommendation + option buttons / text)
//     • Beleg-Frage: NOT answered here — redirects to the Belegview
//   When all are resolved → "Neuverbuchen".
// Depends on shared.jsx + detail.jsx + icons.jsx.
// ============================================================================
const {
  useState: useStateRf
} = React;
function ClarListItem({
  c,
  active,
  answered,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: cx("rf-item", active && "is-active"),
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "rf-item__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: cx("ctype", c.type === "sachverhalt" ? "ctype--sach" : "ctype--beleg")
  }, c.type === "sachverhalt" ? "Sachverhalt" : "Beleg"), /*#__PURE__*/React.createElement("span", {
    className: "muted",
    style: {
      fontSize: 11,
      fontFamily: "var(--font-mono)"
    }
  }, c.raised_at)), /*#__PURE__*/React.createElement("div", {
    className: "rf-item__q"
  }, c.short), /*#__PURE__*/React.createElement("div", {
    className: "rf-item__foot"
  }, answered ? /*#__PURE__*/React.createElement("span", {
    className: "rf-status done"
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: "#3F7A5A"
    }
  }), c.type === "beleg" ? "Im Beleg erledigt" : "Beantwortet") : /*#__PURE__*/React.createElement("span", {
    className: "rf-status open"
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: "#C8870F"
    }
  }), "Offen")));
}
function SachverhaltClar({
  c,
  answer,
  onAnswer
}) {
  const [text, setText] = useStateRf("");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "rf-q"
  }, c.question), /*#__PURE__*/React.createElement("div", {
    className: "rf-detailtxt"
  }, c.detail), /*#__PURE__*/React.createElement("div", {
    className: "rf-affects"
  }, I.layers({
    size: 13,
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--color-text)"
    }
  }, "Betrifft die Buchung:"), " ", c.affects)), /*#__PURE__*/React.createElement("div", {
    className: "rec-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rec-box__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kibox__mark"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, "Empfehlung von Ludwig"), c.rec_confidence != null && /*#__PURE__*/React.createElement(Conf, {
    value: c.rec_confidence
  })), /*#__PURE__*/React.createElement("div", {
    className: "rec-box__b"
  }, c.ai_recommendation)), /*#__PURE__*/React.createElement("div", {
    className: "opt-label"
  }, "Antwort w\xE4hlen"), /*#__PURE__*/React.createElement("div", {
    className: "opt-row"
  }, c.options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    className: cx("opt-btn", answer === o.id && "selected"),
    onClick: () => onAnswer(o.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "chk"
  }, I.check({
    size: 16
  })), /*#__PURE__*/React.createElement("span", null, o.label), o.recommended && /*#__PURE__*/React.createElement("span", {
    className: "rec-tag"
  }, I.check({
    size: 11
  }), " empfohlen")))), c.allow_text && /*#__PURE__*/React.createElement("textarea", {
    className: "rf-text",
    placeholder: "Optional: Begr\xFCndung oder abweichende Anweisung f\xFCr die Buchungs-KI\u2026",
    value: text,
    onChange: e => setText(e.target.value)
  }), answer && /*#__PURE__*/React.createElement("div", {
    className: "rf-answered"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.checkSmall({
    size: 13
  })), /*#__PURE__*/React.createElement("div", null, "Antwort gespeichert: ", /*#__PURE__*/React.createElement("b", null, c.options.find(o => o.id === answer)?.label), ". Ludwig nutzt diese Angabe bei der Neuverbuchung.")));
}
function BelegClar({
  c,
  answer,
  belegEv,
  scenKey,
  onPreview,
  onMarkDone
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "rf-q"
  }, c.question), /*#__PURE__*/React.createElement("div", {
    className: "rf-detailtxt"
  }, c.detail), /*#__PURE__*/React.createElement("div", {
    className: "rf-redirect"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rf-redirect__h"
  }, I.receipt({
    size: 16
  }), " Wird im Beleg gekl\xE4rt"), /*#__PURE__*/React.createElement("div", {
    className: "rf-redirect__b"
  }, "Das ist eine Belegdaten-Frage (Positionen, USt-S\xE4tze, Konto-Splitting). Sie wird nicht hier am Sachverhalt, sondern direkt im Beleg bearbeitet. \xD6ffnen Sie den Beleg, pr\xFCfen Sie das Positions-Splitting und \xFCbernehmen Sie die Kontierung."), /*#__PURE__*/React.createElement("div", {
    className: "flex gap8 items-center",
    style: {
      marginTop: 14,
      flexWrap: "wrap"
    }
  }, belegEv && /*#__PURE__*/React.createElement(BelegActions, {
    scenKey: scenKey,
    ev: belegEv,
    onPreview: onPreview,
    label: "Im Beleg pr\xFCfen",
    primary: true
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onMarkDone
  }, "Im Beleg erledigt markieren"))), answer && /*#__PURE__*/React.createElement("div", {
    className: "rf-answered"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.checkSmall({
    size: 13
  })), /*#__PURE__*/React.createElement("div", null, "Als ", /*#__PURE__*/React.createElement("b", null, "im Beleg erledigt"), " markiert. Die Positionen wurden im Beleg getrennt kontiert.")));
}
function EmptyRueck() {
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-empty",
    style: {
      minHeight: 280
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, I.check({
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Keine offenen R\xFCckfragen"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "F\xFCr diesen Sachverhalt sind aktuell keine R\xFCckfragen offen. Die Buchung kann ohne weitere Kl\xE4rung erfolgen."))));
}
function RueckfragenTab({
  scen,
  onOpenBeleg
}) {
  const cl = scen.clarifications || [];
  const [answers, setAnswers] = useStateRf({}); // id -> optionId | true
  const [sel, setSel] = useStateRf(cl[0] ? cl[0].id : null);
  const [reposted, setReposted] = useStateRf(false);
  if (!cl.length) return /*#__PURE__*/React.createElement(EmptyRueck, null);
  const cur = cl.find(c => c.id === sel) || cl[0];
  const answeredCount = cl.filter(c => answers[c.id]).length;
  const allAnswered = cl.every(c => answers[c.id]);
  const setAns = (id, v) => {
    setAnswers(a => ({
      ...a,
      [id]: v
    }));
    setReposted(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "rf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rf__list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rf-progress"
  }, /*#__PURE__*/React.createElement("span", null, answeredCount, " / ", cl.length, " gekl\xE4rt"), /*#__PURE__*/React.createElement("span", {
    className: "bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: answeredCount / cl.length * 100 + "%"
    }
  }))), cl.map(c => /*#__PURE__*/React.createElement(ClarListItem, {
    key: c.id,
    c: c,
    active: cur.id === c.id,
    answered: !!answers[c.id],
    onClick: () => setSel(c.id)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rf__detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, /*#__PURE__*/React.createElement("span", {
    className: cx("ctype", cur.type === "sachverhalt" ? "ctype--sach" : "ctype--beleg")
  }, cur.type === "sachverhalt" ? "Sachverhalt" : "Beleg"), "R\xFCckfrage ", cl.indexOf(cur) + 1, " von ", cl.length), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "aufgeworfen ", cur.raised_at)), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, cur.type === "sachverhalt" ? /*#__PURE__*/React.createElement(SachverhaltClar, {
    c: cur,
    answer: answers[cur.id],
    onAnswer: id => setAns(cur.id, id)
  }) : /*#__PURE__*/React.createElement(BelegClar, {
    c: cur,
    answer: answers[cur.id],
    scenKey: scen.key,
    belegEv: scen.events.find(e => e.id === cur.beleg_event),
    onPreview: onOpenBeleg,
    onMarkDone: () => setAns(cur.id, true)
  }), /*#__PURE__*/React.createElement("div", {
    className: "rf__foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    disabled: !allAnswered,
    onClick: () => setReposted(true),
    style: !allAnswered ? {
      opacity: 0.5,
      cursor: "not-allowed"
    } : null
  }, I.repeat({
    size: 16
  }), " Neuverbuchen"), /*#__PURE__*/React.createElement("span", {
    className: "hint"
  }, allAnswered ? "Alle Rückfragen geklärt — Ludwig kann den Sachverhalt jetzt neu verbuchen." : cl.length - answeredCount + " Rückfrage" + (cl.length - answeredCount > 1 ? "n" : "") + " noch offen, bevor neu verbucht werden kann.")), reposted && /*#__PURE__*/React.createElement("div", {
    className: "repost-result"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, I.check({
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Neu verbucht \u2014 keine weiteren R\xFCckfragen"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "Ludwig hat den Sachverhalt mit Ihren Antworten neu kontiert. Der Buchungssatz ist jetzt im Tab \u201ESaldo & Konten\u201C freigabebereit.")))))));
}
Object.assign(window, {
  RueckfragenTab,
  ClarListItem,
  SachverhaltClar,
  BelegClar,
  EmptyRueck
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/clarifications.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/data.jsx
try { (() => {
// ============================================================================
// Sachverhalt scenarios — real DB field shapes, de-DE formatted money.
// Each scenario: case header, events (timeline), per-event journal entries
// (Soll/Haben lines), aggregated Saldo accounts, clarifications, recurring
// rule + accrual data for the secondary tabs.
// ============================================================================

const KIND_LABEL = {
  incoming_invoice: "Eingangsrechnung",
  outgoing_invoice: "Ausgangsrechnung",
  recurring_charge: "Wiederkehrend",
  internal_transfer: "Umbuchung",
  expense_report: "Auslagen",
  adjustment_only: "Korrektur"
};
const LIFECYCLE = {
  open: {
    label: "Offen",
    kind: "info"
  },
  needs_clarification: {
    label: "Benötigt Antwort",
    kind: "info"
  },
  pending_review: {
    label: "Prüfung ausstehend",
    kind: "info"
  },
  accepted: {
    label: "Freigegeben",
    kind: "success"
  },
  rejected: {
    label: "Abgelehnt",
    kind: "neutral"
  },
  closed_accepted: {
    label: "Abgeschlossen",
    kind: "success"
  },
  closed_rejected: {
    label: "Abgeschlossen (abgel.)",
    kind: "neutral"
  },
  archived: {
    label: "Archiviert",
    kind: "neutral"
  }
};

// booking-state per timeline event (the "was ist hier zu tun?" signal)
const STATE = {
  posted: {
    label: "Gebucht",
    cls: "posted",
    dot: "#3F7A5A"
  },
  proposed: {
    label: "Vorschlag liegt vor",
    cls: "proposed",
    dot: "#2E78A8"
  },
  open: {
    label: "Offen",
    cls: "open",
    dot: "#8A8A8A"
  },
  blocked: {
    label: "Benötigt Antwort",
    cls: "blocked",
    dot: "#2E78A8"
  },
  informational: {
    label: "Keine Buchung nötig",
    cls: "informational",
    dot: "#8A8A8A"
  },
  planned: {
    label: "Geplant",
    cls: "planned",
    dot: "#8A8A8A"
  }
};

// ---------------------------------------------------------------------------
// SZENARIO A — Eingangsrechnung Telekom + Zahlung (gesund, abgeschlossen)
// ---------------------------------------------------------------------------
const A = {
  key: "A",
  scenarioLabel: "Regelfall",
  scenarioSub: "Eingangsrechnung + Zahlung · abgeschlossen",
  caseNumber: "2026-0042",
  title: "Eingangsrechnung: Telekom",
  summary: "Mobilfunkrechnung der Telekom für April 2026, vollständig beglichen und gebucht.",
  kind: "incoming_invoice",
  lifecycle_status: "closed_accepted",
  counterparty_name: "Telekom Deutschland GmbH",
  total_amount: "89,90 €",
  fiscal_year: "2026",
  opened_at: "02.05.2026",
  closed_at: "14.05.2026",
  service_period: null,
  balanced: true,
  next_action: null,
  clarifications: [],
  default_event: "a1",
  accounts: [{
    num: "6815",
    name: "Telefon",
    type: "stay",
    soll: "75,55 €",
    haben: "—",
    bal: "75,55 €",
    side: "S",
    rel: ["a1"]
  }, {
    num: "1576",
    name: "Abziehbare Vorsteuer 19 %",
    type: "stay",
    soll: "14,35 €",
    haben: "—",
    bal: "14,35 €",
    side: "S",
    rel: ["a1"]
  }, {
    num: "70000",
    name: "Verbindlichkeiten Telekom",
    type: "gate",
    soll: "89,90 €",
    haben: "89,90 €",
    bal: "0,00 €",
    gate: "ok",
    rel: ["a1", "a2"]
  }, {
    num: "1800",
    name: "Bank",
    type: "stay",
    soll: "—",
    haben: "89,90 €",
    bal: "89,90 €",
    side: "H",
    rel: ["a2"]
  }],
  events: [{
    id: "a1",
    kind: "document_received",
    date: "02.05.2026",
    title: "Rechnung Telekom — Mobilfunk April",
    amount: "89,90 €",
    state: "posted",
    source: "doc",
    doc: {
      type: "invoice",
      vendor: "Telekom Deutschland GmbH",
      vendor_ust: "DE 123 456 789",
      address: "Landgrabenweg 151 · 53227 Bonn",
      invoice_number: "2026-0004001",
      invoice_date: "23.04.2026",
      due_date: "07.05.2026",
      net: "75,55 €",
      tax: "14,35 €",
      gross: "89,90 €",
      service_period: "April 2026",
      items: [{
        pos: "1",
        text: "Mobilfunk-Tarif Business April 2026",
        net: "75,55 €"
      }]
    },
    journal: {
      status: "posted",
      origin: "ai_proposed",
      acceptance: "ai_unmodified",
      confidence: 96,
      booking_date: "23.04.2026",
      posting_date: "23.04.2026",
      description: "Mobilfunk April 2026",
      rationale: "Rechnung der Telekom Deutschland GmbH über Mobilfunkleistungen. Betrag und USt-Ausweis (19 %) sind eindeutig. Aufwand auf 6815 Telefon, Vorsteuer auf 1576, Gegenkonto Verbindlichkeit 70000 (Kreditor Telekom).",
      sum_soll: "89,90 €",
      sum_haben: "89,90 €",
      lines: [{
        side: "debit",
        num: "6815",
        name: "Telefon",
        amount: "75,55 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "1576",
        name: "Abziehbare Vorsteuer 19 %",
        amount: "14,35 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "credit",
        num: "70000",
        name: "Verbindlichkeiten Telekom",
        amount: "89,90 €"
      }]
    }
  }, {
    id: "a2",
    kind: "payment_out",
    date: "14.05.2026",
    title: "Überweisung an Telekom",
    amount: "89,90 €",
    state: "posted",
    source: "bank",
    bank: {
      amount: "−89,90 €",
      date: "14.05.2026",
      account: "1800 — Geschäftskonto",
      counterparty: "Telekom Deutschland GmbH",
      iban: "DE89 3705 0299 0001 2345 67",
      purpose: "RG 2026-0004001 Mobilfunk April 2026"
    },
    journal: {
      status: "posted",
      origin: "ai_proposed",
      acceptance: "ai_unmodified",
      confidence: 99,
      booking_date: "14.05.2026",
      posting_date: "14.05.2026",
      description: "Zahlung Rechnung Telekom",
      rationale: "Bankbewegung mit Verwendungszweck »RG 2026-0004001« eindeutig der Eingangsrechnung zugeordnet. Ausgleich der Verbindlichkeit 70000 gegen Bank 1800. Damit ist die Kette Aufwand → Verbindlichkeit → Bank vollständig durchgebucht.",
      sum_soll: "89,90 €",
      sum_haben: "89,90 €",
      lines: [{
        side: "debit",
        num: "70000",
        name: "Verbindlichkeiten Telekom",
        amount: "89,90 €"
      }, {
        side: "credit",
        num: "1800",
        name: "Bank",
        amount: "89,90 €"
      }]
    }
  }],
  // secondary tabs
  belege: [{
    ev: "a1",
    name: "Rechnung_Telekom_April.pdf",
    vendor: "Telekom Deutschland GmbH",
    inv: "2026-0004001",
    date: "23.04.2026",
    amount: "89,90 €",
    proc: "processed"
  }],
  recurring: null,
  accrual: null
};

// ---------------------------------------------------------------------------
// SZENARIO B — Mietverhältnis (lang, laufend, Kaution + recurring + Abgrenzung)
// ---------------------------------------------------------------------------
const B = {
  key: "B",
  scenarioLabel: "Mietverhältnis",
  scenarioSub: "Lang & laufend · Kaution, recurring, Abgrenzung",
  caseNumber: "2026-0051",
  title: "Mietverhältnis: Büro Lindenstraße",
  summary: "Gewerbemietverhältnis Büro Lindenstraße 14. Kaution, monatliche Miete (Regel), Leistungszeitraum 01.01.2026–31.12.2028.",
  kind: "recurring_charge",
  lifecycle_status: "open",
  counterparty_name: "Immobilien Vogt KG",
  total_amount: "1.200,00 €",
  total_sub: "monatlich · Kaution 3.000,00 €",
  fiscal_year: "2026",
  opened_at: "01.01.2026",
  closed_at: null,
  service_period: {
    start: "01.01.2026",
    end: "31.12.2028"
  },
  balanced: false,
  next_action: "Buchungsvorschlag »Mietaufwand Februar« (28.02.) prüfen und freigeben.",
  next_action_event: "b5",
  clarifications: [],
  default_event: "b5",
  accounts: [{
    num: "1525",
    name: "Mietkautionen",
    type: "gate",
    soll: "3.000,00 €",
    haben: "—",
    bal: "3.000,00 €",
    side: "S",
    gate: "open",
    note: "Rückzahlung bei Vertragsende offen",
    rel: ["b2", "bf"]
  }, {
    num: "70010",
    name: "Verbindlichkeiten Immobilien Vogt",
    type: "gate",
    soll: "1.200,00 €",
    haben: "1.200,00 €",
    bal: "0,00 €",
    gate: "ok",
    note: "Januar ausgeglichen",
    rel: ["b3", "b4"]
  }, {
    num: "4210",
    name: "Raumkosten / Miete",
    type: "stay",
    soll: "1.008,40 €",
    haben: "—",
    bal: "1.008,40 €",
    side: "S",
    rel: ["b3"]
  }, {
    num: "1576",
    name: "Abziehbare Vorsteuer 19 %",
    type: "stay",
    soll: "191,60 €",
    haben: "—",
    bal: "191,60 €",
    side: "S",
    rel: ["b3"]
  }, {
    num: "1800",
    name: "Bank",
    type: "stay",
    soll: "—",
    haben: "4.200,00 €",
    bal: "4.200,00 €",
    side: "H",
    rel: ["b2", "b4"]
  }],
  saldo_note: "Vorschlag »Mietaufwand Februar« ist noch nicht gebucht und hier nicht berücksichtigt.",
  events: [{
    id: "b1",
    kind: "document_received",
    date: "01.01.2026",
    title: "Mietvertrag hochgeladen",
    amount: null,
    state: "informational",
    source: "doc",
    doc_label: "Gewerbemietvertrag",
    info_note: "Rein informatives Ereignis — dokumentiert den Vertrag und setzt den Leistungszeitraum (ab 01.01.2026). Es ist keine Buchung erforderlich.",
    doc: {
      type: "contract",
      vendor: "Immobilien Vogt KG",
      subject: "Gewerbemietvertrag · Büro Lindenstraße 14, 80331 München",
      term: "01.01.2026 – 31.12.2028",
      rent: "1.200,00 € brutto / Monat (inkl. 19 % USt)",
      deposit: "3.000,00 €",
      notice: "3 Monate zum Quartalsende",
      clauses: [{
        n: "§ 2 Mietzeit",
        t: "Das Mietverhältnis beginnt am 01.01.2026 und ist befristet bis zum 31.12.2028."
      }, {
        n: "§ 4 Miete",
        t: "Die monatliche Bruttomiete beträgt 1.200,00 € inkl. gesetzlicher USt (Option zur Steuerpflicht gem. § 9 UStG), fällig zum 3. Werktag."
      }, {
        n: "§ 5 Kaution",
        t: "Der Mieter leistet eine Barkaution in Höhe von 3.000,00 € vor Mietbeginn."
      }]
    },
    journal: null
  }, {
    id: "b2",
    kind: "payment_out",
    date: "05.01.2026",
    title: "Kautionszahlung",
    amount: "3.000,00 €",
    state: "posted",
    source: "bank",
    bank: {
      amount: "−3.000,00 €",
      date: "05.01.2026",
      account: "1800 — Geschäftskonto",
      counterparty: "Immobilien Vogt KG",
      iban: "DE21 5005 0201 0000 1234 56",
      purpose: "Mietkaution Büro Lindenstr. 14"
    },
    journal: {
      status: "posted",
      origin: "ai_proposed",
      acceptance: "ai_unmodified",
      confidence: 94,
      booking_date: "05.01.2026",
      description: "Mietkaution Lindenstraße",
      rationale: "Kaution gemäß Mietvertrag § 5. Aktivierung als Forderung auf 1525 Mietkautionen (Bestandskonto, ohne USt). Ausgleich gegen Bank 1800. Der Saldo auf 1525 bleibt bis zur Rückzahlung bei Vertragsende bestehen.",
      sum_soll: "3.000,00 €",
      sum_haben: "3.000,00 €",
      lines: [{
        side: "debit",
        num: "1525",
        name: "Mietkautionen",
        amount: "3.000,00 €"
      }, {
        side: "credit",
        num: "1800",
        name: "Bank",
        amount: "3.000,00 €"
      }]
    }
  }, {
    id: "b3",
    kind: "accrual",
    date: "31.01.2026",
    auto: true,
    title: "Mietaufwand Januar",
    amount: "1.200,00 €",
    state: "posted",
    source: null,
    journal: {
      status: "posted",
      origin: "rule",
      acceptance: "ai_unmodified",
      confidence: 91,
      booking_date: "31.01.2026",
      description: "Mietaufwand Januar 2026",
      rationale: "Automatisch erzeugt durch die wiederkehrende Regel »Miete Lindenstr.«. Periodengerechte Erfassung des Mietaufwands Januar, USt 19 % gemäß Option zur Steuerpflicht. Gegenkonto Verbindlichkeit Vermieter 70010.",
      sum_soll: "1.200,00 €",
      sum_haben: "1.200,00 €",
      lines: [{
        side: "debit",
        num: "4210",
        name: "Raumkosten / Miete",
        amount: "1.008,40 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "1576",
        name: "Abziehbare Vorsteuer 19 %",
        amount: "191,60 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "credit",
        num: "70010",
        name: "Verbindlichkeiten Immobilien Vogt",
        amount: "1.200,00 €"
      }]
    }
  }, {
    id: "b4",
    kind: "payment_out",
    date: "03.02.2026",
    title: "Mietzahlung Januar",
    amount: "1.200,00 €",
    state: "posted",
    source: "bank",
    bank: {
      amount: "−1.200,00 €",
      date: "03.02.2026",
      account: "1800 — Geschäftskonto",
      counterparty: "Immobilien Vogt KG",
      iban: "DE21 5005 0201 0000 1234 56",
      purpose: "Miete Januar Lindenstr. 14"
    },
    journal: {
      status: "posted",
      origin: "ai_proposed",
      acceptance: "ai_unmodified",
      confidence: 97,
      booking_date: "03.02.2026",
      description: "Mietzahlung Januar",
      rationale: "Banküberweisung Miete Januar; Verwendungszweck trifft das Regel-Muster. Ausgleich der Verbindlichkeit 70010 gegen Bank 1800.",
      sum_soll: "1.200,00 €",
      sum_haben: "1.200,00 €",
      lines: [{
        side: "debit",
        num: "70010",
        name: "Verbindlichkeiten Immobilien Vogt",
        amount: "1.200,00 €"
      }, {
        side: "credit",
        num: "1800",
        name: "Bank",
        amount: "1.200,00 €"
      }]
    }
  }, {
    id: "b5",
    kind: "accrual",
    date: "28.02.2026",
    auto: true,
    title: "Mietaufwand Februar",
    amount: "1.200,00 €",
    state: "proposed",
    source: null,
    journal: {
      status: "proposed",
      origin: "rule",
      acceptance: null,
      confidence: 91,
      booking_date: "28.02.2026",
      description: "Mietaufwand Februar 2026",
      rationale: "Automatisch vorgeschlagen durch die Regel »Miete Lindenstr.«. Identische Kontierung wie Januar. Bitte prüfen und freigeben — danach wird die Verbindlichkeit gegenüber Immobilien Vogt KG für Februar aufgebaut.",
      sum_soll: "1.200,00 €",
      sum_haben: "1.200,00 €",
      lines: [{
        side: "debit",
        num: "4210",
        name: "Raumkosten / Miete",
        amount: "1.008,40 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "1576",
        name: "Abziehbare Vorsteuer 19 %",
        amount: "191,60 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "credit",
        num: "70010",
        name: "Verbindlichkeiten Immobilien Vogt",
        amount: "1.200,00 €"
      }]
    }
  }, {
    id: "b6",
    kind: "payment_out",
    date: "03.03.2026",
    title: "Mietzahlung Februar",
    amount: "1.200,00 €",
    state: "open",
    source: "bank",
    open_note: "Bankbewegung erkannt, aber noch keine Buchung erzeugt. Sie kann nach Freigabe des Februar-Aufwands zugeordnet werden.",
    bank: {
      amount: "−1.200,00 €",
      date: "03.03.2026",
      account: "1800 — Geschäftskonto",
      counterparty: "Immobilien Vogt KG",
      iban: "DE21 5005 0201 0000 1234 56",
      purpose: "Miete Februar Lindenstr. 14"
    },
    journal: null
  }, {
    id: "ghost",
    ghost: true,
    title: "Miete März – Dezember 2026",
    sub: "20 weitere geplante Buchungen (Aufwand + Zahlung) aus der Regel"
  }, {
    id: "bf",
    kind: "payment_in",
    date: "31.12.2028",
    state: "planned",
    title: "Kautionsrückzahlung (geplant)",
    amount: "3.000,00 €",
    source: null,
    plan_note: "Bei Vertragsende. Löst das Kautionskonto 1525 auf (Soll 1800 Bank / Haben 1525). Erst danach ist der Sachverhalt ausgeglichen.",
    journal: null
  }],
  belege: [{
    ev: "b1",
    name: "Mietvertrag_Lindenstr.pdf",
    vendor: "Immobilien Vogt KG",
    inv: "—",
    date: "01.01.2026",
    amount: "—",
    proc: "processed"
  }, {
    ev: "b2",
    name: "Kontoauszug_Jan_Kaution.pdf",
    vendor: "Geschäftskonto",
    inv: "—",
    date: "05.01.2026",
    amount: "3.000,00 €",
    proc: "processed"
  }, {
    ev: "b4",
    name: "Kontoauszug_Feb_Miete.pdf",
    vendor: "Geschäftskonto",
    inv: "—",
    date: "03.02.2026",
    amount: "1.200,00 €",
    proc: "processed"
  }, {
    ev: "b6",
    name: "Kontoauszug_Mär_Miete.pdf",
    vendor: "Geschäftskonto",
    inv: "—",
    date: "03.03.2026",
    amount: "1.200,00 €",
    proc: "in_progress"
  }],
  recurring: {
    counterparty: "Immobilien Vogt KG",
    iban: "DE21 5005 0201 0000 1234 56",
    amount: "1.200,00 €",
    tolerance: "± 2 %",
    start_date: "01.01.2026",
    end_date: "31.12.2028",
    turnus: "monatlich · zum Monatsende",
    purpose_regex: "Miete.*Lindenstr",
    gegenkonto: "4210 — Raumkosten / Miete",
    tax_key: "VST19 · 19,00 %",
    buchungstext: "Mietaufwand {Monat} {Jahr}",
    next_run: "31.03.2026",
    active: true,
    future: [{
      month: "März 2026",
      date: "31.03.2026",
      amount: "1.200,00 €"
    }, {
      month: "April 2026",
      date: "30.04.2026",
      amount: "1.200,00 €"
    }, {
      month: "Mai 2026",
      date: "31.05.2026",
      amount: "1.200,00 €"
    }, {
      month: "Juni 2026",
      date: "30.06.2026",
      amount: "1.200,00 €"
    }]
  },
  accrual: {
    period: "01.01.2026 – 31.12.2028",
    source: "Mietvertrag § 2 (Mietbeginn)",
    note: "Der Leistungszeitraum erstreckt sich über 36 Monate. Mietaufwand wird periodengerecht je Monat erfasst — keine Vorauszahlung über Periodengrenze, daher monatliche aktive Abgrenzung nicht erforderlich. Dargestellt ist die periodengerechte Verteilung der Mietaufwände 2026.",
    monthly: "1.008,40 € netto / Monat",
    months: [{
      m: "Jan",
      state: "done"
    }, {
      m: "Feb",
      state: "now"
    }, {
      m: "Mär",
      state: "future"
    }, {
      m: "Apr",
      state: "future"
    }, {
      m: "Mai",
      state: "future"
    }, {
      m: "Jun",
      state: "future"
    }, {
      m: "Jul",
      state: "future"
    }, {
      m: "Aug",
      state: "future"
    }, {
      m: "Sep",
      state: "future"
    }, {
      m: "Okt",
      state: "future"
    }, {
      m: "Nov",
      state: "future"
    }, {
      m: "Dez",
      state: "future"
    }]
  }
};

// ---------------------------------------------------------------------------
// SZENARIO C — Geschäftswagen-Leasing mit zwei Rückfragen (Handlung nötig)
// Demonstriert beide Rückfrage-Typen: Sachverhalt (1 % vs. Fahrtenbuch,
// hier beantwortbar) + Beleg (Versicherungs-Splitting, verweist auf Beleg).
// ---------------------------------------------------------------------------
const C = {
  key: "C",
  scenarioLabel: "Rückfragen",
  scenarioSub: "Geschäftswagen-Leasing · 2 Rückfragen warten auf Antwort",
  caseNumber: "2026-0061",
  title: "Geschäftswagen: Firmenwagen-Leasing",
  summary: "Leasing eines Firmenwagens. Zwei Rückfragen sind vor der Buchung der ersten Leasingrate zu beantworten.",
  kind: "incoming_invoice",
  lifecycle_status: "needs_clarification",
  counterparty_name: "Auto-Leasing Süd GmbH",
  total_amount: "649,00 €",
  total_sub: "monatlich · 36 Monate",
  fiscal_year: "2026",
  opened_at: "01.04.2026",
  closed_at: null,
  service_period: {
    start: "01.04.2026",
    end: "31.03.2029"
  },
  balanced: false,
  saldo_blocked: true,
  next_action: "2 Rückfragen beantworten — die Leasingrate kann erst danach gebucht werden.",
  next_action_tab: "rueckfragen",
  clarifications: [{
    id: "cl1",
    type: "sachverhalt",
    short: "Private Nutzung: 1 %-Regelung oder Fahrtenbuch?",
    question: "Wie wird die private Nutzung des Firmenwagens versteuert?",
    detail: "Der Firmenwagen darf laut Vertrag privat genutzt werden. Für den geldwerten Vorteil ist zu entscheiden, ob pauschal nach der 1 %-Regelung oder anhand eines Fahrtenbuchs bewertet wird. Die Antwort bestimmt die monatliche Buchung des geldwerten Vorteils und die Vorsteueraufteilung.",
    ai_recommendation: "1 %-Regelung. Es liegt kein Fahrtenbuch vor; bei einem Bruttolistenpreis von 44.900 € ergibt sich ein geldwerter Vorteil von 449,00 € pro Monat.",
    rec_confidence: 78,
    options: [{
      id: "o1",
      label: "1 %-Regelung",
      recommended: true
    }, {
      id: "o2",
      label: "Fahrtenbuch"
    }, {
      id: "o3",
      label: "Keine Privatnutzung"
    }],
    allow_text: true,
    affects: "Buchung des geldwerten Vorteils (ab April, monatlich) und Vorsteueraufteilung.",
    blocks_event: "c2",
    raised_at: "01.04.2026"
  }, {
    id: "cl2",
    type: "beleg",
    short: "Versicherungsanteil (79,00 €) getrennt buchen?",
    question: "Die Leasingrate enthält einen Versicherungsanteil — Positions-Splitting im Beleg nötig.",
    detail: "Die Rate von 649,00 € enthält laut Beleg eine Kfz-Versicherung über 79,00 € (umsatzsteuerfrei). Versicherung und Leasingaufwand gehören auf getrennte Konten mit unterschiedlichen Steuerschlüsseln. Das ist eine Belegdaten-Frage und wird direkt im Beleg geklärt (Line-Splitting) — nicht hier.",
    beleg_event: "c2",
    blocks_event: "c2",
    raised_at: "01.04.2026"
  }],
  default_event: "c2",
  accounts: [],
  events: [{
    id: "c1",
    kind: "contract_received",
    date: "28.03.2026",
    title: "Leasingvertrag hochgeladen",
    amount: null,
    state: "informational",
    source: "doc",
    doc_label: "Leasingvertrag",
    info_note: "Rein informatives Ereignis — dokumentiert den Leasingvertrag und setzt den Leistungszeitraum (01.04.2026 – 31.03.2029). Es ist keine Buchung erforderlich.",
    doc: {
      type: "contract",
      vendor: "Auto-Leasing Süd GmbH",
      subject: "Leasingvertrag · Firmenwagen (Mittelklasse-Diesel)",
      term: "01.04.2026 – 31.03.2029 (36 Monate)",
      rent: "649,00 € brutto / Monat (inkl. Versicherung 79,00 €)",
      deposit: "Sonderzahlung: keine",
      notice: "Endet automatisch nach 36 Monaten",
      clauses: [{
        n: "§ 1 Fahrzeug",
        t: "Mittelklasse-Limousine, Diesel. Bruttolistenpreis 44.900,00 €."
      }, {
        n: "§ 3 Rate",
        t: "Monatliche Leasingrate 570,00 € zzgl. USt sowie Versicherungspauschale 79,00 € (umsatzsteuerfrei)."
      }, {
        n: "§ 6 Nutzung",
        t: "Eine private Mitbenutzung durch den Geschäftsführer ist gestattet."
      }]
    },
    journal: null
  }, {
    id: "c2",
    kind: "document_received",
    date: "01.04.2026",
    title: "Leasingrate April",
    amount: "649,00 €",
    state: "blocked",
    source: "doc",
    blocked_by: ["cl1", "cl2"],
    doc: {
      type: "invoice",
      vendor: "Auto-Leasing Süd GmbH",
      vendor_ust: "DE 198 443 220",
      address: "Verdistraße 12 · 81247 München",
      invoice_number: "AL-2026-04-7781",
      invoice_date: "01.04.2026",
      due_date: "15.04.2026",
      net: "478,99 € + 79,00 € (stfr.)",
      tax: "91,01 €",
      gross: "649,00 €",
      service_period: "April 2026",
      items: [{
        pos: "1",
        text: "Leasingrate Firmenwagen April 2026",
        net: "478,99 €",
        konto: "4570 — Leasing Kfz",
        ust: "19 %"
      }, {
        pos: "2",
        text: "Kfz-Versicherung (umsatzsteuerfrei)",
        net: "79,00 €",
        konto: "4520 — Kfz-Versicherung",
        ust: "steuerfrei"
      }]
    },
    journal: {
      status: "proposed",
      blocked: true,
      origin: "ai_proposed",
      acceptance: null,
      confidence: 52,
      booking_date: "—",
      description: "Leasingrate Firmenwagen April",
      rationale: "Leasingrate eines Firmenwagens. Offen sind zwei Punkte: (1) die Bewertung der Privatnutzung (1 %-Regelung vs. Fahrtenbuch) für den geldwerten Vorteil und (2) die Trennung von Leasingaufwand und Versicherungsanteil im Beleg. Bis beide Rückfragen beantwortet sind, wird kein endgültiger Buchungssatz festgeschrieben.",
      sum_soll: "649,00 €",
      sum_haben: "649,00 €",
      lines: [{
        side: "debit",
        num: "4570",
        name: "Leasing Kfz",
        amount: "478,99 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "4520",
        name: "Kfz-Versicherung",
        amount: "79,00 €",
        tax: "—",
        rate: "steuerfrei",
        uncertain: true
      }, {
        side: "debit",
        num: "1576",
        name: "Abziehbare Vorsteuer 19 %",
        amount: "91,01 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "credit",
        num: "70020",
        name: "Verbindlichkeiten Auto-Leasing",
        amount: "649,00 €"
      }]
    }
  }],
  belege: [{
    ev: "c1",
    name: "Leasingvertrag_Firmenwagen.pdf",
    vendor: "Auto-Leasing Süd GmbH",
    inv: "—",
    date: "28.03.2026",
    amount: "—",
    proc: "processed"
  }, {
    ev: "c2",
    name: "Leasingrate_April.pdf",
    vendor: "Auto-Leasing Süd GmbH",
    inv: "AL-2026-04-7781",
    date: "01.04.2026",
    amount: "649,00 €",
    proc: "processed"
  }],
  recurring: null,
  accrual: null
};
const SCENARIOS = {
  A,
  B,
  C
};
const SCEN_ORDER = ["A", "B", "C"];

// ---------------------------------------------------------------------------
// Reference data for the manual booking editor (server-provided in production)
// ---------------------------------------------------------------------------
// Steuerschlüssel (BU) — Vorsteuer-Seite, Startkatalog
const TAX_KEYS = [{
  key: "9",
  label: "19 % Vorsteuer",
  rate: "19,00 %"
}, {
  key: "8",
  label: "7 % Vorsteuer",
  rate: "7,00 %"
}, {
  key: "0",
  label: "ohne USt / steuerfrei",
  rate: "0,00 %"
}, {
  key: "94",
  label: "§ 13b Reverse Charge",
  rate: "—"
}, {
  key: "19",
  label: "19 % i.g. Erwerb",
  rate: "19,00 %"
}, {
  key: "18",
  label: "7 % i.g. Erwerb",
  rate: "7,00 %"
}, {
  key: "",
  label: "unklar → Review",
  rate: "—"
}];

// Kontenrahmen (SKR03-nah) — account_number, account_name, role, usage count
const ROLE_LABEL = {
  general_ledger: "Sachkonto",
  creditor: "Kreditor",
  debtor: "Debitor",
  revenue: "Erlös",
  other: "sonstiges"
};
const KONTEN = [{
  num: "4210",
  name: "Raumkosten / Miete",
  role: "general_ledger",
  uses: 142
}, {
  num: "4570",
  name: "Leasing Kfz",
  role: "general_ledger",
  uses: 88
}, {
  num: "4520",
  name: "Kfz-Versicherung",
  role: "general_ledger",
  uses: 64
}, {
  num: "6815",
  name: "Telefon",
  role: "general_ledger",
  uses: 96
}, {
  num: "4980",
  name: "Werbedrucke / Aufwand",
  role: "general_ledger",
  uses: 22
}, {
  num: "4930",
  name: "Bürobedarf",
  role: "general_ledger",
  uses: 51
}, {
  num: "4806",
  name: "Wartung / Software",
  role: "general_ledger",
  uses: 37
}, {
  num: "1576",
  name: "Abziehbare Vorsteuer 19 %",
  role: "other",
  uses: 320
}, {
  num: "1571",
  name: "Abziehbare Vorsteuer 7 %",
  role: "other",
  uses: 71
}, {
  num: "1525",
  name: "Mietkautionen",
  role: "other",
  uses: 12
}, {
  num: "1800",
  name: "Bank",
  role: "general_ledger",
  uses: 540
}, {
  num: "1600",
  name: "Kasse",
  role: "general_ledger",
  uses: 33
}, {
  num: "70000",
  name: "Verbindlichkeiten Telekom",
  role: "creditor",
  uses: 24
}, {
  num: "70010",
  name: "Verbindlichkeiten Immobilien Vogt",
  role: "creditor",
  uses: 14
}, {
  num: "70020",
  name: "Verbindlichkeiten Auto-Leasing",
  role: "creditor",
  uses: 6
}, {
  num: "8400",
  name: "Erlöse 19 % USt",
  role: "revenue",
  uses: 210
}];

// Gespeicherte Vorlagen
const TEMPLATES = [{
  id: "t1",
  name: "Miete",
  debit: "4210",
  credit: "70010",
  tax: "9",
  text: "Mietaufwand {Monat} {Jahr}"
}, {
  id: "t2",
  name: "Telekom Mobilfunk",
  debit: "6815",
  credit: "70000",
  tax: "9",
  text: "Mobilfunk {Monat}"
}, {
  id: "t3",
  name: "Bürobedarf",
  debit: "4930",
  credit: "1800",
  tax: "9",
  text: "Bürobedarf"
}];

// Letzte Buchungen je Lieferant (Kreditor-Historie)
const CREDITOR_HISTORY = {
  "Telekom Deutschland GmbH": [{
    debit: "6815",
    tax: "9",
    date: "23.03.2026",
    gross: "89,90 €"
  }, {
    debit: "6815",
    tax: "9",
    date: "23.02.2026",
    gross: "89,90 €"
  }, {
    debit: "6815",
    tax: "9",
    date: "23.01.2026",
    gross: "91,40 €"
  }],
  "Immobilien Vogt KG": [{
    debit: "4210",
    tax: "9",
    date: "31.01.2026",
    gross: "1.200,00 €"
  }],
  "Auto-Leasing Süd GmbH": []
};
Object.assign(window, {
  SCENARIOS,
  SCEN_ORDER,
  KIND_LABEL,
  LIFECYCLE,
  STATE,
  TAX_KEYS,
  ROLE_LABEL,
  KONTEN,
  TEMPLATES,
  CREDITOR_HISTORY
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/data.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/detail.jsx
try { (() => {
// ============================================================================
// Event detail (type-dependent sub-tabs), Saldo & Konten tab (bookings + KI
// reasoning), Belegview, and the secondary tabs.
// Depends on shared.jsx + icons.jsx + data.jsx.
// ============================================================================
const {
  useState,
  useEffect
} = React;
function relSet(scen, activeAccount) {
  if (!activeAccount) return null;
  const a = scen.accounts.find(x => x.num === activeAccount);
  return a ? new Set(a.rel || []) : null;
}
function blockedIds(ev) {
  return Array.isArray(ev.blocked_by) ? ev.blocked_by : ev.blocked_by ? [ev.blocked_by] : [];
}

// ---- Detail header strip ---------------------------------------------------
function DetailHead({
  ev
}) {
  const IconC = EVENT_ICON[ev.kind] || I.doc;
  return /*#__PURE__*/React.createElement("div", {
    className: "flex between items-center",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap12"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bankcard__ico",
    style: {
      width: 34,
      height: 34
    }
  }, /*#__PURE__*/React.createElement(IconC, {
    size: 17
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15.5,
      fontWeight: 600,
      color: "var(--color-text)"
    }
  }, ev.title), /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 12
    }
  }, ev.date, ev.amount ? " · " + (ev.kind === "payment_out" ? "−" : "") + ev.amount : ""))), /*#__PURE__*/React.createElement(StateBadge, {
    state: ev.state
  }));
}

// ---- Detail panes ----------------------------------------------------------
function BelegPane({
  ev,
  scenKey,
  onOpenBeleg
}) {
  const doc = ev.doc;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "openbeleg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bankcard__ico"
  }, /*#__PURE__*/React.createElement(I.doc, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, doc.invoice_number ? "Rechnung " + doc.invoice_number : "Beleg"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, doc.vendor, " \xB7 ", doc.gross)), /*#__PURE__*/React.createElement(BelegActions, {
    scenKey: scenKey,
    ev: ev,
    onPreview: onOpenBeleg,
    primary: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "minihead"
  }, "Extrahierte Belegdaten"), /*#__PURE__*/React.createElement(DocFacts, {
    doc: doc
  })), /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 11.5,
      lineHeight: 1.5
    }
  }, I.layers({
    size: 12,
    style: {
      verticalAlign: "-2px",
      marginRight: 5
    }
  }), "Belegdaten wie USt-S\xE4tze, Positionen und Konto-Splitting werden in der vollst\xE4ndigen Belegansicht gepr\xFCft \u2014 \xF6ffnen Sie den Beleg."));
}
function VertragPane({
  ev,
  scenKey,
  onOpenBeleg
}) {
  const doc = ev.doc;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, ev.state === "informational" && /*#__PURE__*/React.createElement("div", {
    className: "info-detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, I.check({
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Keine Buchung erforderlich"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, ev.info_note))), /*#__PURE__*/React.createElement("div", {
    className: "openbeleg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bankcard__ico"
  }, /*#__PURE__*/React.createElement(I.contract, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, doc.subject), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, doc.vendor, " \xB7 ", doc.term)), /*#__PURE__*/React.createElement(BelegActions, {
    scenKey: scenKey,
    ev: ev,
    onPreview: onOpenBeleg
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "minihead"
  }, "Vertragsdaten"), /*#__PURE__*/React.createElement(DocFacts, {
    doc: doc
  })));
}
function BankPane({
  ev
}) {
  return /*#__PURE__*/React.createElement(BankCard, {
    bank: ev.bank
  });
}
function BuchungPane({
  ev,
  scen,
  goRueck,
  onOpenBeleg,
  onManuell
}) {
  const je = ev.journal;
  if (!je && ev.state === "open") {
    return /*#__PURE__*/React.createElement("div", {
      className: "info-detail",
      style: {
        background: "#FBFCFD"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, I.clock({
      size: 16
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, "Noch keine Buchung"), /*#__PURE__*/React.createElement("div", {
      className: "s"
    }, ev.open_note), /*#__PURE__*/React.createElement("div", {
      className: "flex gap8 mt12"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => onManuell && onManuell(ev)
    }, I.layers({
      size: 14
    }), " Buchungsvorschlag erzeugen"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary btn-sm",
      onClick: () => onManuell && onManuell(ev)
    }, I.edit({
      size: 14
    }), " Manuell buchen"))));
  }
  if (je && je.blocked) {
    const cls = blockedIds(ev).map(id => scen.clarifications.find(c => c.id === id)).filter(Boolean);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "block-notice"
    }, /*#__PURE__*/React.createElement("div", {
      className: "block-notice__h"
    }, I.help({
      size: 16
    }), " Buchung ben\xF6tigt ", cls.length, " Antwort", cls.length > 1 ? "en" : ""), cls.map(c => /*#__PURE__*/React.createElement("div", {
      className: "block-row",
      key: c.id
    }, /*#__PURE__*/React.createElement("span", {
      className: cx("ctype", c.type === "sachverhalt" ? "ctype--sach" : "ctype--beleg")
    }, c.type === "sachverhalt" ? "Sachverhalt" : "Beleg"), /*#__PURE__*/React.createElement("span", {
      className: "block-row__q"
    }, c.short), c.type === "sachverhalt" ? /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary btn-sm",
      onClick: goRueck
    }, "Zu den R\xFCckfragen ", I.arrowRight({
      size: 14
    })) : /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary btn-sm",
      onClick: () => onOpenBeleg(ev)
    }, "Im Beleg pr\xFCfen ", I.arrowRight({
      size: 14
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        opacity: 0.65
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "minihead"
    }, "Vorl\xE4ufiger Buchungsvorschlag (nicht festgeschrieben)"), /*#__PURE__*/React.createElement(Buchungssatz, {
      je: je
    })), /*#__PURE__*/React.createElement(Rationale, {
      je: je,
      defaultOpen: true
    }));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Buchungssatz, {
    je: je
  }), /*#__PURE__*/React.createElement(Rationale, {
    je: je,
    defaultOpen: je.status !== "posted"
  }), /*#__PURE__*/React.createElement(ApproveBar, {
    je: je,
    blocked: false,
    onEdit: () => onManuell && onManuell(ev)
  }));
}
function PlannedInfo({
  ev
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "info-detail",
    style: {
      background: "#FBFCFD"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, I.clock({
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, ev.state === "planned" ? "Geplante Buchung" : "Information"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, ev.plan_note || ev.info_note)));
}

// ---- EventDetail (with type-dependent sub-tabs) ----------------------------
function EventDetail({
  ev,
  scen,
  onOpenBeleg,
  goRueck,
  onManuell
}) {
  if (!ev || ev.ghost) return /*#__PURE__*/React.createElement(DetailEmpty, {
    ghost: ev && ev.ghost
  });
  const tabs = [];
  if (ev.doc && ev.doc.type === "invoice") tabs.push({
    id: "beleg",
    label: "Beleg",
    icon: I.doc
  });
  if (ev.doc && ev.doc.type === "contract") tabs.push({
    id: "vertrag",
    label: "Vertrag",
    icon: I.contract
  });
  if (ev.source === "bank") tabs.push({
    id: "bank",
    label: "Bankbewegung",
    icon: I.bank
  });
  if (ev.journal || ev.state === "open") tabs.push({
    id: "buchung",
    label: "Buchung",
    icon: I.layers,
    warn: ev.journal && ev.journal.blocked
  });
  const needsAction = ["proposed", "open", "blocked"].includes(ev.state);
  const def = ev.journal && needsAction || ev.state === "open" ? "buchung" : tabs[0] && tabs[0].id;
  const [tab, setTab] = useState(def);
  useEffect(() => {
    setTab(def); /* reset when event changes */
  }, [ev.id]);
  if (!tabs.length) return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DetailHead, {
    ev: ev
  }), /*#__PURE__*/React.createElement(PlannedInfo, {
    ev: ev
  }));
  const cur = tabs.find(t => t.id === tab) ? tab : def;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DetailHead, {
    ev: ev
  }), tabs.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "dtabs"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: cx("dtab", cur === t.id && "active"),
    onClick: () => setTab(t.id)
  }, t.icon({
    size: 15
  }), t.label, t.warn && /*#__PURE__*/React.createElement("span", {
    className: "wd",
    title: "Aktion erforderlich"
  })))), cur === "beleg" && /*#__PURE__*/React.createElement(BelegPane, {
    ev: ev,
    scenKey: scen.key,
    onOpenBeleg: onOpenBeleg
  }), cur === "vertrag" && /*#__PURE__*/React.createElement(VertragPane, {
    ev: ev,
    scenKey: scen.key,
    onOpenBeleg: onOpenBeleg
  }), cur === "bank" && /*#__PURE__*/React.createElement(BankPane, {
    ev: ev
  }), cur === "buchung" && /*#__PURE__*/React.createElement(BuchungPane, {
    ev: ev,
    scen: scen,
    goRueck: goRueck,
    onOpenBeleg: onOpenBeleg,
    onManuell: onManuell
  }));
}
function DetailEmpty({
  ghost
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "detail-empty"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement(I.eye, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, ghost ? "Vorschau geplanter Buchungen" : "Ereignis wählen"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, ghost ? "Diese Buchungen werden künftig automatisch aus der Regel erzeugt. Im Tab „Wiederkehrende Buchung“ sehen Sie die Vorschau." : "Wählen Sie links ein Ereignis aus der Timeline, um Beleg und Buchungssatz zu prüfen."));
}

// ---- Saldo block (table) ---------------------------------------------------
function SaldoBlock({
  scen,
  activeAccount,
  onAccount
}) {
  if (scen.saldo_blocked) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "saldo__head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "minihead",
      style: {
        margin: 0
      }
    }, "Saldo & Konten")), /*#__PURE__*/React.createElement("div", {
      className: "info-detail",
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement(I.alert, {
      size: 16
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, "Noch keine Konten gebucht"), /*#__PURE__*/React.createElement("div", {
      className: "s"
    }, "Die Buchung ist durch offene R\xFCckfragen blockiert. Sobald gekl\xE4rt und freigegeben, erscheinen die bebuchten Konten hier."))));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "saldo__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minihead",
    style: {
      margin: 0
    }
  }, "Konten in diesem Sachverhalt"), /*#__PURE__*/React.createElement(BalChip, {
    scen: scen
  })), /*#__PURE__*/React.createElement("table", {
    className: "saldo-tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", null, "Soll"), /*#__PURE__*/React.createElement("th", null, "Haben"), /*#__PURE__*/React.createElement("th", null, "Saldo"))), /*#__PURE__*/React.createElement("tbody", null, scen.accounts.map(a => /*#__PURE__*/React.createElement("tr", {
    key: a.num,
    className: cx("acct-row", activeAccount === a.num && "is-active"),
    onClick: () => onAccount && onAccount(activeAccount === a.num ? null : a.num),
    title: "Zugeh\xF6rige Buchungen hervorheben"
  }, /*#__PURE__*/React.createElement("td", {
    className: "ac"
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, a.num), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, a.name, /*#__PURE__*/React.createElement("span", {
    className: cx("kind-tag", a.type === "gate" ? "gate" : "stay")
  }, a.type === "gate" ? "muss 0" : "bleibt"))), /*#__PURE__*/React.createElement("td", null, a.soll), /*#__PURE__*/React.createElement("td", null, a.haben), /*#__PURE__*/React.createElement("td", {
    className: cx("bal", a.gate === "ok" && "gate-ok", a.gate === "open" && "gate-open")
  }, a.bal, a.side ? " " + a.side : "", a.gate === "ok" ? " ✓" : ""))))), scen.saldo_note && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 11.5,
      marginTop: 10,
      lineHeight: 1.5
    }
  }, I.alert({
    size: 12,
    style: {
      verticalAlign: "-2px",
      marginRight: 4
    }
  }), scen.saldo_note), activeAccount && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 11.5,
      marginTop: 8
    }
  }, I.link({
    size: 12,
    style: {
      verticalAlign: "-2px",
      marginRight: 4
    }
  }), "Zugeh\xF6rige Buchungen unten hervorgehoben \u2014 erneut klicken zum Aufheben."));
}

// ---- KI reasoning infobox --------------------------------------------------
function KIBox({
  je
}) {
  if (!je || !je.rationale) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "kibox"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kibox__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kibox__mark"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, "Ludwig \u2014 Begr\xFCndung der Buchung"), je.confidence != null && /*#__PURE__*/React.createElement(Conf, {
    value: je.confidence
  })), /*#__PURE__*/React.createElement("div", {
    className: "kibox__b"
  }, je.rationale));
}
function BookingAccordionItem({
  ev,
  dim,
  onManuell
}) {
  const je = ev.journal;
  const IconC = EVENT_ICON[ev.kind] || I.doc;
  const [open, setOpen] = useState(false);
  const proposed = je.status === "proposed";
  return /*#__PURE__*/React.createElement("div", {
    className: cx("bk-acc", open && "open", proposed && "is-proposed", dim && "is-dim")
  }, /*#__PURE__*/React.createElement("button", {
    className: "bk-acc__row",
    onClick: () => setOpen(o => !o),
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", {
    className: cx("st", proposed ? "st--proposed" : "st--posted")
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: proposed ? "#2E78A8" : "#3F7A5A"
    }
  }), proposed ? "Vorschlag" : "Gebucht"), /*#__PURE__*/React.createElement("span", {
    className: "bk-acc__ico"
  }, /*#__PURE__*/React.createElement(IconC, {
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    className: "bk-acc__title"
  }, ev.title), proposed && /*#__PURE__*/React.createElement(Conf, {
    value: je.confidence
  }), /*#__PURE__*/React.createElement("span", {
    className: "bk-acc__date"
  }, ev.date), /*#__PURE__*/React.createElement("span", {
    className: cx("bk-acc__amt", ev.kind === "payment_out" && "muted")
  }, ev.amount ? (ev.kind === "payment_out" ? "−" : "") + ev.amount : "—"), /*#__PURE__*/React.createElement("span", {
    className: "bk-acc__chev"
  }, I.chevRight({
    size: 16
  }))), open && /*#__PURE__*/React.createElement("div", {
    className: "bk-acc__body"
  }, /*#__PURE__*/React.createElement(Buchungssatz, {
    je: je
  }), /*#__PURE__*/React.createElement(KIBox, {
    je: je
  }), /*#__PURE__*/React.createElement(ApproveBar, {
    je: je,
    blocked: false,
    onEdit: () => onManuell && onManuell(ev)
  })));
}
function SaldoKontenTab({
  scen,
  acct,
  setAcct,
  onManuell
}) {
  const rel = relSet(scen, acct);
  const bookings = scen.events.filter(e => !e.ghost && e.journal && (e.journal.status === "posted" || e.journal.status === "proposed"));
  const proposedCount = bookings.filter(e => e.journal.status === "proposed").length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement(SaldoBlock, {
    scen: scen,
    activeAccount: acct,
    onAccount: setAcct
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex between items-center",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "minihead",
    style: {
      margin: 0
    }
  }, "Buchungss\xE4tze", bookings.length ? " (" + bookings.length + ")" : ""), proposedCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "muted",
    style: {
      fontSize: 11.5
    }
  }, proposedCount, " Vorschlag", proposedCount > 1 ? "äge" : "", " zu pr\xFCfen \xB7 zum \xD6ffnen tippen")), bookings.length ? bookings.map(ev => /*#__PURE__*/React.createElement(BookingAccordionItem, {
    key: ev.id,
    ev: ev,
    dim: rel && !rel.has(ev.id),
    onManuell: onManuell
  })) : /*#__PURE__*/React.createElement("div", {
    className: "info-detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, I.layers({
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Noch keine Buchungen"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "Sobald Buchungss\xE4tze gebucht oder vorgeschlagen sind, erscheinen sie hier \u2014 jeweils mit Status und KI-Begr\xFCndung.")))));
}

// ---- Belegview preview (drawer body) ---------------------------------------
// Quick preview only — details (positions, USt rates, line-splitting) are
// handled in the full Belegansicht, which this links out to.
function BelegviewBody({
  ev,
  onOpenFull
}) {
  if (!ev || !ev.doc) return null;
  const doc = ev.doc;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "docview"
  }, doc.type === "contract" ? /*#__PURE__*/React.createElement(ContractDoc, {
    doc: doc
  }) : /*#__PURE__*/React.createElement(InvoiceDoc, {
    doc: doc
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "minihead"
  }, doc.type === "contract" ? "Vertragsdaten" : "Extrahierte Belegdaten"), /*#__PURE__*/React.createElement(DocFacts, {
    doc: doc
  })), /*#__PURE__*/React.createElement("div", {
    className: "bv__hint"
  }, I.help({
    size: 13
  }), " Schnellvorschau. Belegdaten \u2014 Positionen, USt-S\xE4tze und Konto-Splitting \u2014 werden in der vollst\xE4ndigen Belegansicht gepr\xFCft und bearbeitet."));
}

// ---- Secondary tab: Belege -------------------------------------------------
const PROC = {
  processed: {
    label: "Verarbeitet",
    kind: "success"
  },
  in_progress: {
    label: "In Verarbeitung",
    kind: "info"
  },
  pending: {
    label: "Wartet",
    kind: "neutral"
  },
  failed: {
    label: "Fehler",
    kind: "warning"
  }
};
function BelegeTab({
  scen,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.receipt({
    size: 14
  }), " Verkn\xFCpfte Belege"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, scen.belege.length, " Belege")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Beleg"), /*#__PURE__*/React.createElement("th", null, "Lieferant"), /*#__PURE__*/React.createElement("th", null, "Rechnungsnr."), /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Betrag"), /*#__PURE__*/React.createElement("th", null, "Verarbeitung"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, scen.belege.map((b, i) => {
    const p = PROC[b.proc] || PROC.pending;
    const dot = {
      info: "#3B8FC4",
      success: "#3F7A5A",
      warning: "#B07B2C",
      neutral: "#8A8A8A"
    }[p.kind];
    const ev = b.ev && scen.events.find(e => e.id === b.ev && e.doc);
    return /*#__PURE__*/React.createElement("tr", {
      key: i
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "doc"
    }, /*#__PURE__*/React.createElement("span", {
      className: "doc-thumb"
    }, I.doc({
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      className: "doc-name"
    }, b.name))), /*#__PURE__*/React.createElement("td", null, b.vendor), /*#__PURE__*/React.createElement("td", {
      className: "acct"
    }, b.inv), /*#__PURE__*/React.createElement("td", {
      className: "acct"
    }, b.date), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, b.amount), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "bdg bdg-" + p.kind
    }, /*#__PURE__*/React.createElement("span", {
      className: "dot",
      style: {
        background: dot
      }
    }), p.label)), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: "right"
      }
    }, ev && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-tertiary btn-sm",
      onClick: () => onOpen(ev)
    }, I.eye({
      size: 14
    }), " \xD6ffnen")));
  }))));
}

// ---- Secondary tab: Wiederkehrende Buchung ---------------------------------
function RecurringTab({
  scen,
  onEditRule
}) {
  const r = scen.recurring;
  if (!r) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.repeat({
    size: 14
  }), " Regel \xB7 Miete Lindenstr."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap8"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bdg bdg-success"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "#3F7A5A"
    }
  }), "Aktiv"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: onEditRule
  }, I.edit({
    size: 14
  }), " Bearbeiten"))), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rule-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Gegenpartei"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, r.counterparty)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "IBAN"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.iban)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Betrag"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, r.amount, " ", /*#__PURE__*/React.createElement("span", {
    className: "muted",
    style: {
      fontWeight: 400
    }
  }, "(", r.tolerance, ")"))), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Turnus"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, r.turnus)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Startdatum"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.start_date)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Enddatum"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.end_date)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Verwendungszweck-Muster"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.purpose_regex)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "N\xE4chste Ausf\xFChrung"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.next_run)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Gegenkonto"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.gegenkonto)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Steuerschl\xFCssel"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.tax_key)), /*#__PURE__*/React.createElement("div", {
    className: "f",
    style: {
      gridColumn: "1 / -1"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Buchungstext-Vorlage"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, r.buchungstext))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.calendar({
    size: 14
  }), " Geplante Buchungen"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "Geister-Vorschau")), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 12.5,
      marginBottom: 12
    }
  }, "Aus der Regel automatisch erzeugte, noch nicht eingetretene Buchungen:"), /*#__PURE__*/React.createElement("ul", {
    className: "tl__list"
  }, r.future.map((f, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    className: "tl-item s-planned",
    style: {
      gridTemplateColumns: "1fr",
      cursor: "default"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-item__body",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-item__row1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tl-item__date"
  }, f.date), /*#__PURE__*/React.createElement("span", {
    className: "tl-item__amt muted"
  }, f.amount)), /*#__PURE__*/React.createElement("div", {
    className: "tl-item__title"
  }, "Mietaufwand ", f.month), /*#__PURE__*/React.createElement("div", {
    className: "tl-item__foot"
  }, /*#__PURE__*/React.createElement(StateBadge, {
    state: "planned"
  }), /*#__PURE__*/React.createElement("span", {
    className: "muted",
    style: {
      fontSize: 11.5
    }
  }, "wird automatisch erzeugt")))))))));
}

// ---- Secondary tab: Rechnungsabgrenzung ------------------------------------
function AbgrenzungTab({
  scen
}) {
  const a = scen.accrual;
  if (!a) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.scale({
    size: 14
  }), " Rechnungsabgrenzung"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "Leistungszeitraum ", a.period)), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-detail",
    style: {
      marginBottom: 18,
      background: "#F4F9FC",
      borderColor: "#C7DFEC"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, I.help({
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Konzeptionell \u2014 noch nicht implementiert"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "Die periodengerechte Rechnungsabgrenzung ist hier nur als Konzept skizziert und noch nicht funktional umgesetzt."))), /*#__PURE__*/React.createElement("div", {
    className: "rule-grid",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Leistungszeitraum (Sachverhalt)"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, a.period)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Quelle"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, a.source)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Monatlicher Aufwand"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, a.monthly)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Verteilung"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "periodengerecht \xB7 12 Monate (2026)"))), /*#__PURE__*/React.createElement("div", {
    className: "minihead"
  }, "Verteilung der Mietaufw\xE4nde 2026"), /*#__PURE__*/React.createElement("div", {
    className: "accrual-bar"
  }, a.months.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "seg " + m.state,
    title: m.m
  }, m.state === "done" ? "✓" : m.state === "now" ? "•" : ""))), /*#__PURE__*/React.createElement("div", {
    className: "accrual-months"
  }, a.months.map((m, i) => /*#__PURE__*/React.createElement("div", {
    className: "m",
    key: i
  }, m.m))), /*#__PURE__*/React.createElement("div", {
    className: "lw-note",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mark"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Ludwig"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5
    }
  }, a.note)))));
}
Object.assign(window, {
  relSet,
  blockedIds,
  DetailHead,
  EventDetail,
  DetailEmpty,
  BelegPane,
  VertragPane,
  BankPane,
  BuchungPane,
  PlannedInfo,
  SaldoBlock,
  KIBox,
  BookingAccordionItem,
  SaldoKontenTab,
  BelegviewBody,
  BelegeTab,
  RecurringTab,
  AbgrenzungTab
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/detail.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/editors.jsx
try { (() => {
// ============================================================================
// ManualBookingDrawer (Extended) + RegelEditorDrawer.
// Implements the manual-booking brief: multi-line Soll/Haben splits, account
// combobox, server-style Steuerschlüssel select, assist area (templates /
// creditor history / on-demand AI), extra fields, live balance, and all
// states (new, edit AI, edit manual, posted/locked, validation, clarifications).
// Self-contained drawer markup (reuses .drawer + .ed-* styles).
// Depends on icons.jsx + shared.jsx (cx, Conf) + data.jsx.
// ============================================================================
const {
  useState: useStateE
} = React;
function parseEuro(s) {
  if (!s) return 0;
  const m = ("" + s).replace(/[^0-9.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(m);
  return isNaN(n) ? 0 : n;
}
function fmtEuro(n) {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
}
function taxToKey(t) {
  if (!t || t === "—") return "0";
  if (/VST19|(^|[^0-9])19/.test(t)) return "9";
  if (/VST7|(^|[^0-9])7/.test(t)) return "8";
  return "";
}
function creditorKonto(counterparty) {
  if (!counterparty) return null;
  return KONTEN.find(k => k.role === "creditor" && counterparty.indexOf(k.name.replace("Verbindlichkeiten ", "")) >= 0) || null;
}
function kontoName(num) {
  const k = KONTEN.find(x => x.num === num);
  return k ? k.name : "";
}
let _lid = 0;
const newLine = (side, num, name, amount, tax) => ({
  id: ++_lid,
  side,
  num: num || "",
  name: name || "",
  amount: amount || "",
  tax: tax == null ? "9" : tax,
  text: ""
});

// ---- Konto combobox (searchable, usage-ranked) -----------------------------
function KontoCombobox({
  value,
  onChange
}) {
  const [open, setOpen] = useStateE(false);
  const [q, setQ] = useStateE("");
  const matches = KONTEN.filter(k => {
    const s = (k.num + " " + k.name).toLowerCase();
    return !q || s.indexOf(q.toLowerCase()) >= 0;
  }).sort((a, b) => b.uses - a.uses).slice(0, 7);
  const display = value && value.num ? value.num + " — " + value.name : "";
  return /*#__PURE__*/React.createElement("div", {
    className: "cmb"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ed-inp cmb__input",
    value: open ? q : display,
    placeholder: "Konto suchen\u2026",
    onFocus: () => {
      setOpen(true);
      setQ("");
    },
    onBlur: () => setTimeout(() => setOpen(false), 150),
    onChange: e => setQ(e.target.value)
  }), value && value.num && !open && /*#__PURE__*/React.createElement("span", {
    className: "cmb__num-badge"
  }, value.num), open && /*#__PURE__*/React.createElement("div", {
    className: "cmb__list"
  }, matches.length ? matches.map(k => /*#__PURE__*/React.createElement("button", {
    key: k.num,
    className: "cmb__opt",
    onMouseDown: e => {
      e.preventDefault();
      onChange({
        num: k.num,
        name: k.name
      });
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cmb__num"
  }, k.num), /*#__PURE__*/React.createElement("span", {
    className: "cmb__name"
  }, k.name), /*#__PURE__*/React.createElement("span", {
    className: cx("cmb__role", "role-" + k.role)
  }, ROLE_LABEL[k.role]))) : /*#__PURE__*/React.createElement("div", {
    className: "cmb__empty"
  }, "Kein Konto gefunden")));
}
function TaxKeySelect({
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("select", {
    className: "ed-inp ed-sel mono",
    value: value,
    onChange: e => onChange(e.target.value),
    title: "Steuerschl\xFCssel (BU)"
  }, TAX_KEYS.map(t => /*#__PURE__*/React.createElement("option", {
    key: t.key || "none",
    value: t.key
  }, t.key ? t.key + " · " + t.label : t.label)));
}
function ConfBand({
  value
}) {
  const lvl = value >= 85 ? "sehr hoch" : value >= 70 ? "hoch" : value >= 55 ? "mittel" : value >= 40 ? "niedrig" : "sehr niedrig";
  const cls = value >= 70 ? "hi" : value >= 40 ? "mid" : "lo";
  return /*#__PURE__*/React.createElement("div", {
    className: cx("confband", "cb-" + cls)
  }, /*#__PURE__*/React.createElement("span", {
    className: "confband__bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: value + "%"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "confband__lbl"
  }, value, " % \xB7 ", lvl, value < 55 ? " · Review" : ""));
}

// ---- Assist area: templates / creditor history / on-demand AI --------------
function AssistArea({
  scen,
  ev,
  onApplyTemplate,
  onApplyHistory,
  onAiFill,
  ai
}) {
  const [openA, setOpenA] = useStateE(false);
  const hist = CREDITOR_HISTORY[scen.counterparty_name] || [];
  // top account share (recurring-lock)
  const counts = {};
  hist.forEach(h => {
    counts[h.debit] = (counts[h.debit] || 0) + 1;
  });
  const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const topShare = hist.length ? Math.round(counts[top] / hist.length * 100) : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: cx("assist", openA && "open")
  }, /*#__PURE__*/React.createElement("button", {
    className: "assist__head",
    onClick: () => setOpenA(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "kibox__mark"
  }), /*#__PURE__*/React.createElement("span", {
    className: "assist__ttl"
  }, "KI & Vorlagen"), /*#__PURE__*/React.createElement("span", {
    className: "assist__chev"
  }, I.chevDown({
    size: 15
  }))), openA && /*#__PURE__*/React.createElement("div", {
    className: "assist__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "assist__block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "assist__lbl"
  }, "KI-Buchungsvorschlag"), ai.state === "idle" && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: onAiFill
  }, I.layers({
    size: 14
  }), " KI-Vorschlag holen"), ai.state === "pending" && /*#__PURE__*/React.createElement("div", {
    className: "assist__pending"
  }, I.clock({
    size: 14
  }), " Ludwig analysiert den Beleg\u2026"), ai.state === "done" && /*#__PURE__*/React.createElement("div", {
    className: "assist__ai"
  }, /*#__PURE__*/React.createElement(ConfBand, {
    value: ai.confidence
  }), /*#__PURE__*/React.createElement("div", {
    className: "assist__reason"
  }, ai.rationale), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    onClick: onAiFill
  }, "Erneut vorschlagen"))), /*#__PURE__*/React.createElement("div", {
    className: "assist__block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "assist__lbl"
  }, "Vorlagen"), /*#__PURE__*/React.createElement("div", {
    className: "assist__chips"
  }, TEMPLATES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "chip",
    onClick: () => onApplyTemplate(t)
  }, t.name)), /*#__PURE__*/React.createElement("button", {
    className: "chip chip--ghost"
  }, I.download({
    size: 12
  }), " als Vorlage speichern"))), /*#__PURE__*/React.createElement("div", {
    className: "assist__block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "assist__lbl"
  }, "Letzte Buchungen \xB7 ", scen.counterparty_name), hist.length ? /*#__PURE__*/React.createElement("div", {
    className: "hist"
  }, hist.map((h, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: cx("hist__row", h.debit === top && topShare >= 75 && "is-top"),
    onClick: () => onApplyHistory(h)
  }, /*#__PURE__*/React.createElement("span", {
    className: "hist__acct mono"
  }, h.debit, " \u2014 ", kontoName(h.debit)), /*#__PURE__*/React.createElement("span", {
    className: "hist__tax mono"
  }, "BU ", h.tax), /*#__PURE__*/React.createElement("span", {
    className: "hist__date mono"
  }, h.date), /*#__PURE__*/React.createElement("span", {
    className: "hist__gross"
  }, h.gross), h.debit === top && topShare >= 75 && i === 0 && /*#__PURE__*/React.createElement("span", {
    className: "hist__lock",
    title: topShare + " % der letzten Buchungen"
  }, "h\xE4ufig")))) : /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 12
    }
  }, "Keine fr\xFCheren Buchungen f\xFCr diesen Lieferanten."))));
}

// ---- Manual booking drawer (Extended) --------------------------------------
function BuchungEditorDrawer({
  ev,
  scen,
  onClose
}) {
  const je = ev && ev.journal;
  const posted = !!je && je.status === "posted";
  const isEdit = !!je && !je.blocked;
  const isAiEdit = isEdit && je.origin === "ai_proposed";

  // blocking clarifications (Sachverhalt + Beleg) for this event
  const clarIds = ev && (Array.isArray(ev.blocked_by) ? ev.blocked_by : ev.blocked_by ? [ev.blocked_by] : []);
  const clars = (clarIds || []).map(id => (scen.clarifications || []).find(c => c.id === id)).filter(Boolean);
  const [clarDone, setClarDone] = useStateE({});
  const openRequired = clars.filter(c => !clarDone[c.id]).length;

  // initial lines
  const gross = ev && ev.amount ? ev.amount.replace(" €", "") : "";
  function initLines() {
    if (je && !je.blocked) return je.lines.map(l => newLine(l.side, l.num, l.name, (l.amount || "").replace(" €", ""), taxToKey(l.tax)));
    const cred = creditorKonto(scen.counterparty_name);
    return [newLine("debit", "", "", gross, "9"), newLine("credit", cred ? cred.num : "", cred ? cred.name : "", gross, "0")];
  }
  const [lines, setLines] = useStateE(initLines);
  const [text, setText] = useStateE(je ? je.description : ev ? ev.title : "");
  const [showExtra, setShowExtra] = useStateE(false);
  const [bdate, setBdate] = useStateE(je ? je.booking_date && je.booking_date !== "—" ? je.booking_date : ev.date : ev ? ev.date : "");
  const [bf1, setBf1] = useStateE(ev && ev.doc ? ev.doc.invoice_number || "" : "");
  const [ai, setAi] = useStateE({
    state: "idle"
  });
  const upd = (id, patch) => setLines(ls => ls.map(l => l.id === id ? {
    ...l,
    ...patch
  } : l));
  const setKonto = (id, k) => upd(id, {
    num: k.num,
    name: k.name
  });
  const addLine = side => setLines(ls => [...ls, newLine(side, "", "", "", "9")]);
  const rm = id => setLines(ls => ls.length > 1 ? ls.filter(l => l.id !== id) : ls);
  const soll = lines.filter(l => l.side === "debit").reduce((s, l) => s + parseEuro(l.amount), 0);
  const haben = lines.filter(l => l.side === "credit").reduce((s, l) => s + parseEuro(l.amount), 0);
  const balanced = Math.abs(soll - haben) < 0.005 && soll > 0;
  const canBook = balanced && openRequired === 0 && !posted;
  function applyTemplate(t) {
    setLines([newLine("debit", t.debit, kontoName(t.debit), gross || "", t.tax), newLine("credit", t.credit, kontoName(t.credit), gross || "", "0")]);
    if (t.text) setText(t.text);
  }
  function applyHistory(h) {
    setLines(ls => ls.map((l, i) => i === 0 ? {
      ...l,
      side: "debit",
      num: h.debit,
      name: kontoName(h.debit),
      tax: h.tax
    } : l));
  }
  function aiFill() {
    setAi({
      state: "pending"
    });
    setTimeout(() => {
      if (je) {
        setLines(je.lines.map(l => newLine(l.side, l.num, l.name, (l.amount || "").replace(" €", ""), taxToKey(l.tax))));
        setAi({
          state: "done",
          confidence: je.confidence || 70,
          rationale: je.rationale
        });
      } else {
        const cred = creditorKonto(scen.counterparty_name);
        setLines([newLine("debit", "4930", "Bürobedarf", gross || "", "9"), newLine("credit", cred ? cred.num : "1800", cred ? cred.name : "Bank", gross || "", "0")]);
        setAi({
          state: "done",
          confidence: 68,
          rationale: "Vorschlag auf Basis von Lieferant und Belegtext. Bitte Soll-Konto und Steuerschlüssel prüfen."
        });
      }
    }, 850);
  }
  const title = posted ? "Buchung ansehen" : isEdit ? "Buchung bearbeiten" : "Manuell buchen";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-scrim open",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer open",
    style: {
      width: "min(740px, 92%)"
    },
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titl"
  }, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, ev.title, " \xB7 ", ev.date, ev.amount ? " · " + ev.amount : "")), /*#__PURE__*/React.createElement("button", {
    className: "drawer__close",
    onClick: onClose,
    "aria-label": "Schlie\xDFen"
  }, I.x({
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "drawer__b"
  }, posted && /*#__PURE__*/React.createElement("div", {
    className: "ed-locked"
  }, I.check({
    size: 15
  }), " ", /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Gebucht & gesperrt (GoBD)"), /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 12
    }
  }, "Festgeschriebene Buchungen k\xF6nnen nicht ge\xE4ndert werden \u2014 nur stornieren."))), isAiEdit && !posted && /*#__PURE__*/React.createElement("div", {
    className: "ed-note"
  }, I.layers({
    size: 14
  }), " KI-Vorschlag wird bearbeitet. Ihre \xC4nderungen schreiben in denselben Eintrag zur\xFCck (markiert als \u201EKI bearbeitet\")."), !posted && clars.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "ed-clars"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ed-clars__h"
  }, I.help({
    size: 15
  }), " Vor dem Buchen beantworten"), clars.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: cx("ed-clar", clarDone[c.id] && "done")
  }, /*#__PURE__*/React.createElement("span", {
    className: cx("ctype", c.type === "sachverhalt" ? "ctype--sach" : "ctype--beleg")
  }, c.type === "sachverhalt" ? "Sachverhalt" : "Beleg"), /*#__PURE__*/React.createElement("span", {
    className: "ed-clar__q"
  }, c.short), clarDone[c.id] ? /*#__PURE__*/React.createElement("span", {
    className: "rf-status done"
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: "#3F7A5A"
    }
  }), "beantwortet") : c.type === "sachverhalt" ? /*#__PURE__*/React.createElement("div", {
    className: "flex gap8"
  }, c.options.slice(0, 2).map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    className: "btn btn-tertiary btn-sm",
    onClick: () => setClarDone(d => ({
      ...d,
      [c.id]: o.label
    }))
  }, o.label))) : /*#__PURE__*/React.createElement("a", {
    className: "btn btn-tertiary btn-sm",
    href: belegHref(scen.key, c.beleg_event),
    target: "_blank",
    rel: "noopener",
    onClick: () => setClarDone(d => ({
      ...d,
      [c.id]: true
    }))
  }, "Im Beleg pr\xFCfen")))), !posted && /*#__PURE__*/React.createElement(AssistArea, {
    scen: scen,
    ev: ev,
    onApplyTemplate: applyTemplate,
    onApplyHistory: applyHistory,
    onAiFill: aiFill,
    ai: ai
  }), /*#__PURE__*/React.createElement("div", {
    className: "ed-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Buchungstext"), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp",
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "z. B. Mietaufwand M\xE4rz 2026",
    disabled: posted
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-lines"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-lines__h"
  }, /*#__PURE__*/React.createElement("span", null, "Konto"), /*#__PURE__*/React.createElement("span", null, "Soll"), /*#__PURE__*/React.createElement("span", null, "Haben"), /*#__PURE__*/React.createElement("span", null, "BU"), /*#__PURE__*/React.createElement("span", null)), lines.map(l => /*#__PURE__*/React.createElement("div", {
    className: "ml-line",
    key: l.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-line__top"
  }, /*#__PURE__*/React.createElement(KontoCombobox, {
    value: {
      num: l.num,
      name: l.name
    },
    onChange: k => setKonto(l.id, k)
  }), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp num",
    value: l.side === "debit" ? l.amount : "",
    placeholder: "0,00",
    disabled: posted,
    onChange: e => upd(l.id, {
      side: "debit",
      amount: e.target.value
    })
  }), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp num",
    value: l.side === "credit" ? l.amount : "",
    placeholder: "0,00",
    disabled: posted,
    onChange: e => upd(l.id, {
      side: "credit",
      amount: e.target.value
    })
  }), /*#__PURE__*/React.createElement(TaxKeySelect, {
    value: l.tax,
    onChange: v => upd(l.id, {
      tax: v
    })
  }), !posted && /*#__PURE__*/React.createElement("button", {
    className: "ed-rm",
    onClick: () => rm(l.id),
    title: "Zeile entfernen"
  }, I.x({
    size: 14
  }))), !posted && /*#__PURE__*/React.createElement("input", {
    className: "ed-inp ml-line__text",
    value: l.text,
    onChange: e => upd(l.id, {
      text: e.target.value
    }),
    placeholder: "Zeilentext (optional)"
  }))), !posted && /*#__PURE__*/React.createElement("div", {
    className: "flex gap8",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    onClick: () => addLine("debit")
  }, "+ Soll-Zeile"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    onClick: () => addLine("credit")
  }, "+ Haben-Zeile"))), !posted && /*#__PURE__*/React.createElement("div", {
    className: cx("ml-collapse", showExtra && "open")
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-collapse__head",
    onClick: () => setShowExtra(s => !s)
  }, /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, I.chevRight({
    size: 14
  })), " Weitere Felder \xB7 Datum, Belegfeld, Kostenstellen, W\xE4hrung"), showExtra && /*#__PURE__*/React.createElement("div", {
    className: "ml-collapse__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ed-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ed-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Buchungsdatum"), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp mono",
    value: bdate,
    onChange: e => setBdate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "ed-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp mono",
    value: bf1,
    onChange: e => setBf1(e.target.value),
    placeholder: "Rechnungsnr."
  })), /*#__PURE__*/React.createElement("div", {
    className: "ed-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Kostenstelle 1 (KOST1)"), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp mono",
    placeholder: "optional"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ed-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Kostenstelle 2 (KOST2)"), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp mono",
    placeholder: "optional"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ed-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "W\xE4hrung"), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp mono",
    defaultValue: "EUR"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ed-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Belegfeld 2"), /*#__PURE__*/React.createElement("input", {
    className: "ed-inp mono",
    placeholder: "optional"
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "drawer__foot ml-foot"
  }, posted ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "ed-balance ok",
    style: {
      margin: 0,
      flex: 1
    }
  }, I.check({
    size: 14
  }), " Festgeschrieben \xB7 ", fmtEuro(soll)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onClose
  }, "Schlie\xDFen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      background: "#A8403C"
    }
  }, I.x({
    size: 16
  }), " Stornieren")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: cx("ml-balance", balanced ? "ok" : "warn")
  }, balanced ? /*#__PURE__*/React.createElement(React.Fragment, null, I.check({
    size: 14
  }), " Soll = Haben \xB7 ", fmtEuro(soll)) : /*#__PURE__*/React.createElement(React.Fragment, null, I.alert({
    size: 14
  }), " Differenz ", fmtEuro(Math.abs(soll - haben)))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onClose
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    disabled: !canBook,
    style: !canBook ? {
      opacity: 0.5,
      cursor: "not-allowed"
    } : null,
    onClick: onClose,
    title: openRequired ? "Erst Rückfragen beantworten" : ""
  }, I.check({
    size: 16
  }), " ", isEdit ? "Übernehmen" : "Buchen")))));
}

// ---- Recurring-rule editor -------------------------------------------------
function EdField({
  label,
  value,
  mono,
  full
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ed-field",
    style: full ? {
      gridColumn: "1 / -1"
    } : null
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, label), /*#__PURE__*/React.createElement("input", {
    className: cx("ed-inp", mono && "mono"),
    defaultValue: value
  }));
}
function RegelEditorDrawer({
  rule,
  onClose
}) {
  const [active, setActive] = useStateE(rule.active !== false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-scrim open",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer open",
    style: {
      width: "min(600px, 86%)"
    },
    role: "dialog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titl"
  }, /*#__PURE__*/React.createElement("h3", null, "Regel bearbeiten"), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "Wiederkehrende Buchung \xB7 Miete Lindenstr.")), /*#__PURE__*/React.createElement("button", {
    className: "drawer__close",
    onClick: onClose,
    "aria-label": "Schlie\xDFen"
  }, I.x({
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "drawer__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ed-grid"
  }, /*#__PURE__*/React.createElement(EdField, {
    label: "Gegenpartei",
    value: rule.counterparty,
    full: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "IBAN",
    value: rule.iban,
    mono: true,
    full: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Betrag",
    value: rule.amount
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Toleranz",
    value: rule.tolerance
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Startdatum",
    value: rule.start_date,
    mono: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Enddatum",
    value: rule.end_date,
    mono: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Turnus",
    value: rule.turnus,
    full: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Verwendungszweck-Muster",
    value: rule.purpose_regex,
    mono: true,
    full: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Gegenkonto",
    value: rule.gegenkonto,
    mono: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Steuerschl\xFCssel",
    value: rule.tax_key,
    mono: true
  }), /*#__PURE__*/React.createElement(EdField, {
    label: "Buchungstext-Vorlage",
    value: rule.buchungstext,
    mono: true,
    full: true
  })), /*#__PURE__*/React.createElement("button", {
    className: cx("ed-toggle", active && "on"),
    onClick: () => setActive(a => !a)
  }, /*#__PURE__*/React.createElement("span", {
    className: "knob"
  }), /*#__PURE__*/React.createElement("span", null, "Regel aktiv \u2014 erzeugt automatisch Buchungsvorschl\xE4ge"))), /*#__PURE__*/React.createElement("div", {
    className: "drawer__foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    style: {
      marginRight: "auto",
      color: "#A8403C"
    }
  }, "Regel l\xF6schen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onClose
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: onClose
  }, I.check({
    size: 16
  }), " Speichern"))));
}
Object.assign(window, {
  BuchungEditorDrawer,
  RegelEditorDrawer,
  KontoCombobox,
  TaxKeySelect,
  AssistArea,
  ConfBand,
  EdField,
  parseEuro,
  fmtEuro
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/editors.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-style icons, 1.5 stroke — Ludwig house style
const Icon = ({
  d,
  size = 18,
  sw = 1.5,
  fill = "none",
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style,
  "aria-hidden": "true"
}, d);
const I = {
  // event types
  doc: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "13",
      x2: "15",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "17",
      x2: "13",
      y2: "17"
    }))
  })),
  payOut: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "19",
      x2: "12",
      y2: "5"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "5 12 12 5 19 12"
    }))
  })),
  payIn: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "19 12 12 19 5 12"
    }))
  })),
  accrual: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7v5l3 2"
    }))
  })),
  adjust: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 6h18M7 12h10M10 18h4"
    }))
  })),
  contract: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 15l2 2 4-4"
    }))
  })),
  repeat: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "17 1 21 5 17 9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 11V9a4 4 0 0 1 4-4h14"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 23 3 19 7 15"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 13v2a4 4 0 0 1-4 4H3"
    }))
  })),
  // status / ui
  check: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })
  })),
  checkSmall: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    sw: 2.5,
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })
  })),
  x: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    }))
  })),
  alert: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  })),
  help: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  })),
  clock: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    }))
  })),
  chevRight: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })
  })),
  chevLeft: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "15 18 9 12 15 6"
    })
  })),
  chevDown: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    })
  })),
  arrowRight: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    }))
  })),
  edit: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
    }))
  })),
  eye: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }))
  })),
  bank: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "22",
      x2: "21",
      y2: "22"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "18",
      x2: "6",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "10",
      y1: "18",
      x2: "10",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "14",
      y1: "18",
      x2: "14",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "18",
      x2: "18",
      y2: "11"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 20 7 4 7"
    }))
  })),
  scale: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3v18M3 7h18M7 7l-3 6a3 3 0 0 0 6 0zM17 7l-3 6a3 3 0 0 0 6 0z"
    }))
  })),
  layers: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 2 7 12 12 22 7 12 2"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "2 17 12 22 22 17"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "2 12 12 17 22 12"
    }))
  })),
  receipt: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 8h-8M16 12h-8M13 16h-5"
    }))
  })),
  calendar: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    }))
  })),
  download: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    }))
  })),
  more: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "19",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5",
      cy: "12",
      r: "1"
    }))
  })),
  expand: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "15 3 21 3 21 9"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "9 21 3 21 3 15"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "3",
      x2: "14",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "21",
      x2: "10",
      y2: "14"
    }))
  })),
  link: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
    }))
  })),
  search: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    }))
  })),
  bell: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 0 1-3.46 0"
    }))
  }))
};

// event-kind -> icon component
const EVENT_ICON = {
  document_received: I.doc,
  contract_received: I.contract,
  payment_in: I.payIn,
  payment_out: I.payOut,
  accrual: I.accrual,
  adjustment: I.adjust,
  recurring: I.repeat
};
window.Icon = Icon;
window.I = I;
window.EVENT_ICON = EVENT_ICON;
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/icons.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/layouts.jsx
try { (() => {
// ============================================================================
// The canonical Master-Detail page + drawers (Beleg preview, booking editor,
// rule editor). Depends on shared.jsx, detail.jsx, clarifications.jsx,
// editors.jsx, icons.jsx, data.jsx.
// ============================================================================
const {
  useState: useStateL
} = React;

// ---- Drawer (generic slide-over) -------------------------------------------
function Drawer({
  open,
  onClose,
  title,
  meta,
  children,
  footer,
  wide
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: cx("drawer-scrim", open && "open"),
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: cx("drawer", open && "open"),
    style: wide ? {
      width: "min(720px, 86%)"
    } : null,
    role: "dialog",
    "aria-hidden": !open
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "titl"
  }, /*#__PURE__*/React.createElement("h3", null, title), meta && /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, meta)), /*#__PURE__*/React.createElement("button", {
    className: "drawer__close",
    onClick: onClose,
    "aria-label": "Schlie\xDFen"
  }, I.x({
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "drawer__b"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "drawer__foot"
  }, footer)));
}

// newest first; future/planned projections kept at the bottom
function orderedEvents(scen) {
  const future = scen.events.filter(e => e.ghost || e.state === "planned");
  const past = scen.events.filter(e => !(e.ghost || e.state === "planned"));
  return [...past].reverse().concat(future);
}

// ---- Übersicht (Timeline links · Detail rechts) ----------------------------
function UebersichtPane({
  scen,
  sel,
  setSel,
  onOpenBeleg,
  goRueck,
  onManuell
}) {
  const selEv = scen.events.find(e => e.id === sel);
  const count = scen.events.filter(e => !e.ghost).length;
  const evs = orderedEvents(scen);
  return /*#__PURE__*/React.createElement("div", {
    className: "l1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l1__timeline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.clock({
    size: 14
  }), " Timeline")), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "tl__list"
  }, evs.map(ev => ev.ghost ? /*#__PURE__*/React.createElement(TimelineItem, {
    key: ev.id,
    ev: ev
  }) : /*#__PURE__*/React.createElement(TimelineItem, {
    key: ev.id,
    ev: ev,
    active: sel === ev.id,
    onClick: () => setSel(ev.id)
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "l1__detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ttl"
  }, I.layers({
    size: 14
  }), " Detail"), selEv && !selEv.ghost && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => onManuell(selEv)
  }, I.edit({
    size: 14
  }), " Manuell buchen")), /*#__PURE__*/React.createElement("div", {
    className: "card__b"
  }, /*#__PURE__*/React.createElement(EventDetail, {
    ev: selEv,
    scen: scen,
    onOpenBeleg: onOpenBeleg,
    goRueck: goRueck,
    onManuell: onManuell
  })))));
}

// ---- Page ------------------------------------------------------------------
function PageMasterDetail({
  scen,
  sel,
  setSel,
  acct,
  setAcct,
  tab,
  setTab
}) {
  const [belegEv, setBelegEv] = useStateL(null); // beleg preview drawer
  const [editEv, setEditEv] = useStateL(null); // booking editor drawer
  const [editRule, setEditRule] = useStateL(false); // rule editor drawer

  const openBeleg = ev => setBelegEv(ev);
  const onManuell = ev => setEditEv(ev);
  const isContract = belegEv && belegEv.doc && belegEv.doc.type === "contract";
  return /*#__PURE__*/React.createElement("div", {
    className: "sv"
  }, /*#__PURE__*/React.createElement(Hero, {
    scen: scen
  }), /*#__PURE__*/React.createElement(NextAction, {
    scen: scen,
    onGoEvent: id => {
      setTab("uebersicht");
      setSel(id);
    },
    onGoTab: setTab
  }), /*#__PURE__*/React.createElement(Tabs, {
    active: tab,
    onChange: setTab,
    scen: scen
  }), tab === "uebersicht" && /*#__PURE__*/React.createElement(UebersichtPane, {
    scen: scen,
    sel: sel,
    setSel: setSel,
    onOpenBeleg: openBeleg,
    goRueck: () => setTab("rueckfragen"),
    onManuell: onManuell
  }), tab === "saldo" && /*#__PURE__*/React.createElement(SaldoKontenTab, {
    scen: scen,
    acct: acct,
    setAcct: setAcct,
    onManuell: onManuell
  }), tab === "rueckfragen" && /*#__PURE__*/React.createElement(RueckfragenTab, {
    scen: scen,
    onOpenBeleg: openBeleg
  }), tab === "belege" && /*#__PURE__*/React.createElement(BelegeTab, {
    scen: scen,
    onOpen: openBeleg
  }), tab === "recurring" && /*#__PURE__*/React.createElement(RecurringTab, {
    scen: scen,
    onEditRule: () => setEditRule(true)
  }), tab === "abgrenzung" && /*#__PURE__*/React.createElement(AbgrenzungTab, {
    scen: scen
  }), /*#__PURE__*/React.createElement(Drawer, {
    open: !!belegEv,
    onClose: () => setBelegEv(null),
    title: belegEv ? (isContract ? "Vertrag — " : "Beleg — ") + belegEv.title : "",
    meta: belegEv && belegEv.doc ? belegEv.doc.invoice_number || belegEv.doc.subject : "",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-tertiary btn-sm",
      style: {
        marginRight: "auto"
      }
    }, I.download({
      size: 14
    }), " PDF"), belegEv && /*#__PURE__*/React.createElement("a", {
      className: "btn btn-primary",
      href: belegHref(scen.key, belegEv.id),
      target: "_blank",
      rel: "noopener",
      title: "\xD6ffnet die vollst\xE4ndige Belegansicht auf einer neuen Seite"
    }, I.expand({
      size: 16
    }), " Vollst\xE4ndige Belegansicht \xF6ffnen"))
  }, belegEv && /*#__PURE__*/React.createElement(BelegviewBody, {
    ev: belegEv
  })), editEv && /*#__PURE__*/React.createElement(BuchungEditorDrawer, {
    ev: editEv,
    scen: scen,
    onClose: () => setEditEv(null)
  }), editRule && /*#__PURE__*/React.createElement(RegelEditorDrawer, {
    rule: scen.recurring,
    onClose: () => setEditRule(false)
  }));
}
Object.assign(window, {
  Drawer,
  UebersichtPane,
  PageMasterDetail,
  orderedEvents
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/layouts.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/shared.jsx
try { (() => {
// ============================================================================
// Shared Sachverhalt components. Depends on icons.jsx + data.jsx.
// ============================================================================
const {
  useState
} = React;

// ---- small helpers ---------------------------------------------------------
function cx(...a) {
  return a.filter(Boolean).join(" ");
}
function EntityBadge({
  status
}) {
  const m = LIFECYCLE[status] || {
    label: status,
    kind: "neutral"
  };
  const dot = {
    info: "#3B8FC4",
    success: "#3F7A5A",
    warning: "#B07B2C",
    neutral: "#8A8A8A"
  }[m.kind];
  return /*#__PURE__*/React.createElement("span", {
    className: "bdg bdg-" + m.kind
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: dot
    }
  }), m.label);
}
function StateBadge({
  state
}) {
  const m = STATE[state] || STATE.open;
  return /*#__PURE__*/React.createElement("span", {
    className: "st st--" + m.cls
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: m.dot
    }
  }), m.label);
}
function Conf({
  value
}) {
  const lvl = value >= 85 ? "high" : value >= 60 ? "med" : "low";
  return /*#__PURE__*/React.createElement("span", {
    className: "conf conf--" + lvl,
    title: "KI-Konfidenz " + value + " %"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bars"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), value, " %");
}
function KindLine({
  scen
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "muted"
  }, KIND_LABEL[scen.kind], scen.kind === "recurring_charge" ? " · Miete" : "");
}

// ---- Balance chip with breakdown popover -----------------------------------
function BalChip({
  scen
}) {
  const [open, setOpen] = useState(false);
  const blocked = scen.saldo_blocked;
  const ok = scen.balanced && !blocked;
  const gates = scen.accounts.filter(a => a.type === "gate");
  const label = blocked ? "Wartet auf Antwort" : ok ? "Sachverhalt ausgeglichen" : "Noch nicht ausgeglichen";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: cx("balchip", blocked ? "balchip--wait" : ok ? "balchip--ok" : "balchip--open"),
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "tick"
  }, ok ? /*#__PURE__*/React.createElement(I.checkSmall, {
    size: 11
  }) : /*#__PURE__*/React.createElement(I.clock, {
    size: 11
  })), label, /*#__PURE__*/React.createElement(I.chevDown, {
    size: 14,
    style: {
      opacity: 0.6
    }
  })), open && blocked && /*#__PURE__*/React.createElement("div", {
    className: "balchip__pop",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h5", null, "Noch nicht buchbar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      lineHeight: 1.55,
      color: "var(--color-text)"
    }
  }, "Die Buchung wartet noch auf offene R\xFCckfragen. Sobald diese gekl\xE4rt und der Buchungssatz freigegeben ist, erscheinen die bebuchten Konten hier.")), open && !blocked && /*#__PURE__*/React.createElement("div", {
    className: "balchip__pop",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h5", null, "Bestands-/Durchlaufkonten m\xFCssen 0 sein"), gates.map(a => /*#__PURE__*/React.createElement("div", {
    className: "r",
    key: a.num
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, a.num, " \u2014 ", a.name), /*#__PURE__*/React.createElement("span", {
    className: cx("v", a.gate === "ok" ? "ok" : "stay"),
    style: a.gate === "open" ? {
      color: "#B07B2C"
    } : null
  }, a.bal, " ", a.gate === "ok" ? "✓" : "offen"))), /*#__PURE__*/React.createElement("h5", {
    style: {
      marginTop: 12
    }
  }, "Erfolgskonten bleiben stehen"), scen.accounts.filter(a => a.type === "stay").slice(0, 3).map(a => /*#__PURE__*/React.createElement("div", {
    className: "r",
    key: a.num
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, a.num, " \u2014 ", a.name), /*#__PURE__*/React.createElement("span", {
    className: "v stay"
  }, a.bal, " ", a.side))), /*#__PURE__*/React.createElement("div", {
    className: "ovr"
  }, I.edit({
    size: 13
  }), " Manuell als ausgeglichen markieren (mit Begr\xFCndung)")));
}

// ---- Hero / header ---------------------------------------------------------
function Hero({
  scen,
  balanceRight
}) {
  const sp = scen.service_period;
  const [title, setTitle] = useState(scen.title);
  const [editing, setEditing] = useState(false);
  return /*#__PURE__*/React.createElement("header", {
    className: "sv-hero",
    "data-screen-label": "Sachverhalt " + scen.caseNumber
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__icon"
  }, scen.kind === "recurring_charge" ? /*#__PURE__*/React.createElement(I.repeat, {
    size: 22
  }) : /*#__PURE__*/React.createElement(I.receipt, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__line"
  }, editing ? /*#__PURE__*/React.createElement("input", {
    className: "hero-title-input",
    value: title,
    autoFocus: true,
    onChange: e => setTitle(e.target.value),
    onBlur: () => setEditing(false),
    onKeyDown: e => {
      if (e.key === "Enter") setEditing(false);
      if (e.key === "Escape") {
        setTitle(scen.title);
        setEditing(false);
      }
    }
  }) : /*#__PURE__*/React.createElement("h1", {
    className: "hero-title",
    onClick: () => setEditing(true),
    title: "Titel bearbeiten"
  }, title, /*#__PURE__*/React.createElement("span", {
    className: "hero-title__pen"
  }, I.edit({
    size: 15
  })))), /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__sub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-hero__num"
  }, scen.caseNumber), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement(EntityBadge, {
    status: scen.lifecycle_status
  }), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, scen.counterparty_name), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement(KindLine, {
    scen: scen
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__total"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Gesamtbetrag"), /*#__PURE__*/React.createElement("div", {
    className: "amt"
  }, scen.total_amount), scen.total_sub && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 11.5,
      marginTop: 2
    }
  }, scen.total_sub)))), /*#__PURE__*/React.createElement("div", {
    className: "sv-hero__facts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-fact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Er\xF6ffnet"), /*#__PURE__*/React.createElement("div", {
    className: "val mono"
  }, scen.opened_at)), /*#__PURE__*/React.createElement("div", {
    className: "sv-fact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, scen.closed_at ? "Abgeschlossen" : "Status"), /*#__PURE__*/React.createElement("div", {
    className: "val mono"
  }, scen.closed_at || "laufend")), sp && /*#__PURE__*/React.createElement("div", {
    className: "sv-fact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Leistungszeitraum"), /*#__PURE__*/React.createElement("div", {
    className: "val mono"
  }, sp.start, " \u2013 ", sp.end)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(BalChip, {
    scen: scen
  }))));
}
function ClarBanner({
  scen,
  onGo
}) {
  const cl = scen.clarifications || [];
  if (!cl.length) return null;
  const beleg = cl.filter(c => c.type === "beleg").length;
  return /*#__PURE__*/React.createElement("div", {
    className: "clar-banner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement(I.help, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "clar-banner__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, cl.length, " R\xFCckfrage", cl.length > 1 ? "n" : "", " offen \u2014 wartet auf Ihre Antwort"), /*#__PURE__*/React.createElement("div", {
    className: "q"
  }, "Diese R\xFCckfragen werden nicht hier, sondern im Tab ", /*#__PURE__*/React.createElement("b", null, "R\xFCckfragen"), " bearbeitet", beleg ? " (eine Frage verweist auf den Beleg)." : ".")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => onGo && onGo("rueckfragen")
  }, "R\xFCckfragen bearbeiten ", I.arrowRight({
    size: 14
  })));
}
function NextAction({
  scen,
  onGoEvent,
  onGoTab
}) {
  if (!scen.next_action) return null;
  const handle = () => {
    if (scen.next_action_tab) onGoTab && onGoTab(scen.next_action_tab);else if (scen.next_action_event) onGoEvent && onGoEvent(scen.next_action_event);
  };
  const hasTarget = scen.next_action_tab || scen.next_action_event;
  return /*#__PURE__*/React.createElement("div", {
    className: "nextact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mark"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nextact__txt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "N\xE4chste Aktion"), /*#__PURE__*/React.createElement("span", null, scen.next_action)), hasTarget && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: handle
  }, scen.next_action_tab ? "Bearbeiten" : "Ansehen", " ", I.arrowRight({
    size: 14
  })));
}

// ---- Tabs ------------------------------------------------------------------
function Tabs({
  active,
  onChange,
  scen
}) {
  const openClar = (scen.clarifications || []).length;
  const unbalanced = !scen.balanced || scen.saldo_blocked;
  const tabs = [{
    id: "uebersicht",
    label: "Übersicht"
  }, {
    id: "saldo",
    label: "Saldo & Konten",
    warn: unbalanced
  }, {
    id: "rueckfragen",
    label: "Rückfragen",
    count: openClar,
    infoCount: openClar > 0
  }, {
    id: "belege",
    label: "Belege",
    count: scen.belege ? scen.belege.length : 0
  }, {
    id: "recurring",
    label: "Wiederkehrende Buchung",
    hide: !scen.recurring
  }, {
    id: "abgrenzung",
    label: "Rechnungsabgrenzung",
    hide: !scen.accrual
  }].filter(t => !t.hide);
  return /*#__PURE__*/React.createElement("nav", {
    className: "sv-tabs"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: cx("sv-tab", active === t.id && "active"),
    onClick: () => onChange(t.id)
  }, t.label, t.count != null && t.count > 0 && /*#__PURE__*/React.createElement("span", {
    className: cx("count", t.warnCount && "count--warn", t.infoCount && "count--info")
  }, t.count), t.warn && /*#__PURE__*/React.createElement("span", {
    className: "warn-dot",
    title: "Aktion erforderlich"
  }))));
}

// ---- Timeline scan (counts) ------------------------------------------------
function TimelineScan({
  events
}) {
  const counts = {};
  events.forEach(e => {
    if (e.state) counts[e.state] = (counts[e.state] || 0) + 1;
  });
  const order = ["posted", "proposed", "open", "blocked", "informational", "planned"];
  return /*#__PURE__*/React.createElement("div", {
    className: "tl-scan"
  }, order.filter(s => counts[s]).map(s => /*#__PURE__*/React.createElement("span", {
    className: "s",
    key: s
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: STATE[s].dot
    }
  }), counts[s], " ", STATE[s].label)));
}

// ---- Timeline item ---------------------------------------------------------
function TimelineItem({
  ev,
  active,
  dim,
  onClick
}) {
  if (ev.ghost) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tl-ghost"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement(I.repeat, {
      size: 16
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, ev.title), " \xB7 ", ev.sub));
  }
  const IconC = EVENT_ICON[ev.kind] || I.doc;
  const neg = ev.kind === "payment_out";
  const needsAction = ["proposed", "open", "blocked"].includes(ev.state);
  return /*#__PURE__*/React.createElement("li", {
    className: cx("tl-item", "s-" + (STATE[ev.state] || {}).cls, needsAction && "needs-action", active && "is-active", dim && "is-dim"),
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-item__rail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tl-item__node"
  }, /*#__PURE__*/React.createElement(IconC, {
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "tl-item__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-item__row1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tl-item__date"
  }, ev.date), ev.amount ? /*#__PURE__*/React.createElement("span", {
    className: cx("tl-item__amt", neg && "neg")
  }, neg ? "−" : "", ev.amount) : /*#__PURE__*/React.createElement("span", {
    className: "tl-item__amt muted"
  }, "ohne Betrag")), /*#__PURE__*/React.createElement("div", {
    className: "tl-item__title"
  }, ev.title), ev.doc_label && /*#__PURE__*/React.createElement("div", {
    className: "tl-item__meta"
  }, ev.doc_label, " \xB7 PDF"), ev.auto && /*#__PURE__*/React.createElement("div", {
    className: "tl-item__meta"
  }, "Automatisch erzeugt (Regel)"), /*#__PURE__*/React.createElement("div", {
    className: "tl-item__foot"
  }, /*#__PURE__*/React.createElement(StateBadge, {
    state: ev.state
  }))));
}

// ---- Journal entry (Buchungssatz) ------------------------------------------
function Buchungssatz({
  je,
  title = "Buchungssatz"
}) {
  if (!je) return null;
  const debit = je.lines.filter(l => l.side === "debit");
  const credit = je.lines.filter(l => l.side === "credit");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "minihead",
    style: {
      marginBottom: 8
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "je"
  }, /*#__PURE__*/React.createElement("div", {
    className: "je__h"
  }, /*#__PURE__*/React.createElement("div", null, "Konto"), /*#__PURE__*/React.createElement("div", {
    className: "soll"
  }, "Soll"), /*#__PURE__*/React.createElement("div", {
    className: "haben"
  }, "Haben")), [...debit, ...credit].map((l, i) => /*#__PURE__*/React.createElement("div", {
    className: "je__row",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "je__acct"
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, l.num), " ", /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, "\u2014 ", l.name), l.tax && /*#__PURE__*/React.createElement("div", {
    className: "tax"
  }, l.tax, " \xB7 ", l.rate, l.uncertain ? "  (unsicher)" : "")), /*#__PURE__*/React.createElement("div", {
    className: cx("je__amt", "soll", l.side !== "debit" && "empty")
  }, l.side === "debit" ? l.amount : "—"), /*#__PURE__*/React.createElement("div", {
    className: cx("je__amt", "haben", l.side !== "credit" && "empty")
  }, l.side === "credit" ? l.amount : "—"))), /*#__PURE__*/React.createElement("div", {
    className: "je__sum"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Summe"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, je.sum_soll), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, je.sum_haben)), !je.blocked && /*#__PURE__*/React.createElement("div", {
    className: "je__balance"
  }, I.check({
    size: 13
  }), " Soll = Haben \xB7 Buchungssatz geht auf")), je.alt_note && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 11.5,
      marginTop: 8
    }
  }, je.alt_note));
}

// ---- Rationale (collapsible) -----------------------------------------------
function Rationale({
  je,
  defaultOpen
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  if (!je || !je.rationale) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: cx("rationale", open && "open")
  }, /*#__PURE__*/React.createElement("button", {
    className: "rationale__btn",
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, I.chevRight({
    size: 14
  })), "KI-Begr\xFCndung ", open ? "ausblenden" : "anzeigen", je.confidence != null && /*#__PURE__*/React.createElement(Conf, {
    value: je.confidence
  })), open && /*#__PURE__*/React.createElement("div", {
    className: "rationale__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, I.layers({
    size: 13
  }), " Warum dieser Buchungssatz"), je.rationale));
}

// ---- Approval action bar ---------------------------------------------------
function ApproveBar({
  je,
  blocked,
  onEdit
}) {
  if (blocked) {
    return /*#__PURE__*/React.createElement("div", {
      className: "approve-bar"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary"
    }, I.help({
      size: 16
    }), " Kl\xE4rungsfrage beantworten"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary",
      onClick: onEdit
    }, I.edit({
      size: 14
    }), " Manuell buchen"));
  }
  if (je && je.status === "posted") {
    return /*#__PURE__*/React.createElement("div", {
      className: "approve-bar"
    }, /*#__PURE__*/React.createElement("span", {
      className: "st st--posted"
    }, /*#__PURE__*/React.createElement("span", {
      className: "d",
      style: {
        background: "#3F7A5A"
      }
    }), "Freigegeben & gebucht", je.acceptance === "ai_unmodified" ? " · KI unverändert" : ""), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary btn-sm",
      onClick: onEdit
    }, I.edit({
      size: 14
    }), " Korrigieren"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-tertiary btn-sm"
    }, "Stornieren"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "approve-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary"
  }, I.check({
    size: 16
  }), " Freigeben"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onEdit
  }, I.edit({
    size: 14
  }), " Bearbeiten"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm"
  }, I.x({
    size: 16
  }), " Ablehnen"));
}

// ---- Document views --------------------------------------------------------
function InvoiceDoc({
  doc
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "doc-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dp-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dp-vendor"
  }, doc.vendor), /*#__PURE__*/React.createElement("div", {
    className: "dp-small"
  }, doc.address), /*#__PURE__*/React.createElement("div", {
    className: "dp-small"
  }, "USt-IdNr. ", doc.vendor_ust)), /*#__PURE__*/React.createElement("div", {
    className: "dp-small",
    style: {
      textAlign: "right"
    }
  }, "Rechnung Nr.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", null, doc.invoice_number), /*#__PURE__*/React.createElement("br", null), "Datum ", doc.invoice_date, /*#__PURE__*/React.createElement("br", null), "F\xE4llig ", doc.due_date)), /*#__PURE__*/React.createElement("div", {
    className: "dp-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "dp-h"
  }, "Rechnung"), /*#__PURE__*/React.createElement("div", {
    className: "dp-small"
  }, "Leistungszeitraum: ", doc.service_period), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Pos"), /*#__PURE__*/React.createElement("th", null, "Beschreibung"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Betrag"))), /*#__PURE__*/React.createElement("tbody", null, doc.items.map(it => /*#__PURE__*/React.createElement("tr", {
    key: it.pos
  }, /*#__PURE__*/React.createElement("td", null, it.pos), /*#__PURE__*/React.createElement("td", null, it.text), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, it.net))))), /*#__PURE__*/React.createElement("div", {
    className: "dp-tot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", null, "Netto"), /*#__PURE__*/React.createElement("span", null, doc.net)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", null, "USt"), /*#__PURE__*/React.createElement("span", null, doc.tax)), /*#__PURE__*/React.createElement("div", {
    className: "row grand"
  }, /*#__PURE__*/React.createElement("span", null, "Brutto"), /*#__PURE__*/React.createElement("span", null, doc.gross))));
}
function ContractDoc({
  doc
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "doc-page doc-page--contract"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dp-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dp-vendor"
  }, doc.vendor), /*#__PURE__*/React.createElement("div", {
    className: "dp-small"
  }, "Vermieterin")), /*#__PURE__*/React.createElement("div", {
    className: "dp-small",
    style: {
      textAlign: "right"
    }
  }, "Vertrag")), /*#__PURE__*/React.createElement("div", {
    className: "dp-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "dp-h"
  }, doc.subject), /*#__PURE__*/React.createElement("div", {
    className: "dp-small"
  }, "Laufzeit ", doc.term), doc.clauses.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "dp-clause",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, c.n, ". "), c.t)));
}
function DocView({
  doc,
  onExpand
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "docview"
  }, doc.type === "contract" ? /*#__PURE__*/React.createElement(ContractDoc, {
    doc: doc
  }) : /*#__PURE__*/React.createElement(InvoiceDoc, {
    doc: doc
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap8 mt8"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, I.download({
    size: 14
  }), " PDF \xF6ffnen"), onExpand && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    onClick: onExpand
  }, I.expand({
    size: 14
  }), " Vergr\xF6\xDFern")));
}
function DocFacts({
  doc
}) {
  if (doc.type === "contract") {
    return /*#__PURE__*/React.createElement("div", {
      className: "docfacts"
    }, /*#__PURE__*/React.createElement("div", {
      className: "f"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Vermieterin"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, doc.vendor)), /*#__PURE__*/React.createElement("div", {
      className: "f"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Laufzeit"), /*#__PURE__*/React.createElement("div", {
      className: "v mono"
    }, doc.term)), /*#__PURE__*/React.createElement("div", {
      className: "f"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Monatsmiete"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, doc.rent)), /*#__PURE__*/React.createElement("div", {
      className: "f"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Kaution"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, doc.deposit)), /*#__PURE__*/React.createElement("div", {
      className: "f full"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "K\xFCndigungsfrist"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, doc.notice)));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "docfacts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Lieferant"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, doc.vendor)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Rechnungsnr."), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, doc.invoice_number)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Rechnungsdatum"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, doc.invoice_date)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "F\xE4llig"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, doc.due_date)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Netto"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, doc.net)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "USt"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, doc.tax)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Brutto"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, doc.gross)), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Leistungszeitraum"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, doc.service_period)));
}
function BankCard({
  bank
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bankcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bankcard__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bankcard__ico"
  }, /*#__PURE__*/React.createElement(I.bank, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "minihead",
    style: {
      margin: 0
    }
  }, "Bankbewegung"), /*#__PURE__*/React.createElement("div", {
    className: "bankcard__amt"
  }, bank.amount))), /*#__PURE__*/React.createElement("div", {
    className: "bankcard__rows"
  }, /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Wertstellung"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, bank.date)), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Gegenkonto"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, bank.counterparty)), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "IBAN"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, bank.iban)), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Verwendungszweck"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, bank.purpose)), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Bankkonto"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, bank.account))));
}

// ---- Beleg actions: eye-preview (drawer) + open on a new page ---------------
function belegHref(scenKey, evId) {
  return "Belegansicht.html?scen=" + encodeURIComponent(scenKey) + "&ev=" + encodeURIComponent(evId);
}
function BelegActions({
  scenKey,
  ev,
  onPreview,
  label,
  primary
}) {
  const isContract = ev.doc && ev.doc.type === "contract";
  const lbl = label || (isContract ? "Vertrag öffnen" : "Beleg öffnen");
  return /*#__PURE__*/React.createElement("div", {
    className: "flex gap8 items-center"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    title: "Belegvorschau",
    "aria-label": "Belegvorschau",
    onClick: () => onPreview && onPreview(ev)
  }, I.eye({
    size: 15
  })), /*#__PURE__*/React.createElement("a", {
    className: cx("btn btn-sm", primary ? "btn-primary" : "btn-secondary"),
    href: belegHref(scenKey, ev.id),
    target: "_blank",
    rel: "noopener"
  }, lbl, " ", I.expand({
    size: 13
  })));
}
Object.assign(window, {
  cx,
  EntityBadge,
  StateBadge,
  Conf,
  BalChip,
  Hero,
  ClarBanner,
  NextAction,
  Tabs,
  TimelineScan,
  TimelineItem,
  Buchungssatz,
  Rationale,
  ApproveBar,
  InvoiceDoc,
  ContractDoc,
  DocView,
  DocFacts,
  BankCard,
  belegHref,
  BelegActions
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/shared.jsx", error: String((e && e.message) || e) }); }

// sachverhalt-screen/vergleich.jsx
try { (() => {
// ============================================================================
// Buchungssatz-Vergleich: Kompakt-Zeile ↔ vollständige Tabelle.
// Read-only Anzeige in der Gesamtansicht. Reuses shared.jsx (Buchungssatz,
// Conf, StateBadge, cx), icons.jsx (I), data.jsx (STATE globals).
// ============================================================================
const {
  useState,
  useEffect
} = React;

// --- toggle glyphs ----------------------------------------------------------
const LineIco = ({
  size = 13
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round"
}, /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "9",
  x2: "20",
  y2: "9"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "15",
  x2: "14",
  y2: "15"
}));
const TableIco = ({
  size = 13
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5"
}, /*#__PURE__*/React.createElement("rect", {
  x: "3.5",
  y: "4.5",
  width: "17",
  height: "15",
  rx: "1.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "3.5",
  y1: "9.5",
  x2: "20.5",
  y2: "9.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "3.5",
  y1: "14.5",
  x2: "20.5",
  y2: "14.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "13",
  y1: "4.5",
  x2: "13",
  y2: "19.5"
}));
const LockIco = ({
  size = 13
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round"
}, /*#__PURE__*/React.createElement("rect", {
  x: "5",
  y: "11",
  width: "14",
  height: "9",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 11V8a4 4 0 0 1 8 0v3"
}));
function ConfDot({
  value
}) {
  const c = value >= 85 ? "#3F7A5A" : value >= 60 ? "#2E78A8" : "#B07B2C";
  return /*#__PURE__*/React.createElement("span", {
    className: "confdot",
    style: {
      background: c
    },
    title: "KI-Konfidenz " + value + " %"
  });
}
function UstBadge({
  bu,
  rate
}) {
  if (!bu) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: "ust-badge"
  }, "BU ", bu, " (", rate, ")");
}
function SegToggle({
  value,
  onChange,
  small,
  labels
}) {
  const L = labels || {
    kompakt: "Kompakt",
    voll: "Vollständig"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: cx("segtog", small && "segtog--sm"),
    role: "tablist"
  }, /*#__PURE__*/React.createElement("button", {
    className: cx("segtog__b", value === "kompakt" && "is-on"),
    onClick: () => onChange("kompakt"),
    "aria-selected": value === "kompakt"
  }, /*#__PURE__*/React.createElement(LineIco, {
    size: small ? 12 : 14
  }), L.kompakt), /*#__PURE__*/React.createElement("button", {
    className: cx("segtog__b", value === "voll" && "is-on"),
    onClick: () => onChange("voll"),
    "aria-selected": value === "voll"
  }, /*#__PURE__*/React.createElement(TableIco, {
    size: small ? 12 : 14
  }), L.voll));
}

// --- Kompakt-Zeile ----------------------------------------------------------
function MetaLine({
  s
}) {
  const parts = [];
  if (s.text) parts.push(/*#__PURE__*/React.createElement("span", {
    key: "t"
  }, s.text));
  if (s.vst_note) parts.push(/*#__PURE__*/React.createElement("span", {
    key: "v",
    className: "vst"
  }, s.vst_note));
  if (s.beleg) parts.push(/*#__PURE__*/React.createElement("span", {
    key: "b"
  }, "Beleg ", s.beleg));
  if (!parts.length) return null;
  const woven = [];
  parts.forEach((p, i) => {
    if (i) woven.push(/*#__PURE__*/React.createElement("span", {
      key: "s" + i,
      className: "sep"
    }, "\xB7"));
    woven.push(p);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "cl__meta"
  }, woven);
}
function CompactSatz({
  s
}) {
  const single = s.positions.length === 1;
  if (single) {
    const p = s.positions[0];
    return /*#__PURE__*/React.createElement("div", {
      className: "cl"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cl__line"
    }, /*#__PURE__*/React.createElement(ConfDot, {
      value: s.confidence
    }), /*#__PURE__*/React.createElement("div", {
      className: "cl__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "cl__acct"
    }, /*#__PURE__*/React.createElement("b", null, p.num), p.name), /*#__PURE__*/React.createElement(UstBadge, {
      bu: p.bu,
      rate: p.rate
    }), /*#__PURE__*/React.createElement("span", {
      className: "cl__an"
    }, "an"), /*#__PURE__*/React.createElement("span", {
      className: "cl__acct"
    }, /*#__PURE__*/React.createElement("b", null, s.gegen.num), s.gegen.name)), /*#__PURE__*/React.createElement("span", {
      className: "cl__amt"
    }, s.gross), /*#__PURE__*/React.createElement(MetaLine, {
      s: s
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "cl"
  }, s.positions.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "cl__line",
    key: i
  }, /*#__PURE__*/React.createElement(ConfDot, {
    value: s.confidence
  }), /*#__PURE__*/React.createElement("div", {
    className: "cl__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cl__acct"
  }, /*#__PURE__*/React.createElement("b", null, p.num), p.name), /*#__PURE__*/React.createElement(UstBadge, {
    bu: p.bu,
    rate: p.rate
  })), /*#__PURE__*/React.createElement("span", {
    className: "cl__amt"
  }, p.gross))), /*#__PURE__*/React.createElement("div", {
    className: "cl__line cl__line--gegen"
  }, /*#__PURE__*/React.createElement("span", {
    className: "confdot-spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cl__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cl__an"
  }, "an"), /*#__PURE__*/React.createElement("span", {
    className: "cl__acct"
  }, /*#__PURE__*/React.createElement("b", null, s.gegen.num), s.gegen.name)), /*#__PURE__*/React.createElement("span", {
    className: "cl__amt cl__amt--sum"
  }, s.gross), /*#__PURE__*/React.createElement(MetaLine, {
    s: s
  })));
}

// --- Satz card (Kopf bleibt, Körper schaltet um) ----------------------------
function SatzCard({
  s,
  mode,
  onToggle,
  onEdit
}) {
  const foldable = s.foldable !== false;
  const eff = foldable ? mode : "voll";
  return /*#__PURE__*/React.createElement("div", {
    className: cx("satz", s.state === "proposed" && "is-proposed")
  }, /*#__PURE__*/React.createElement("div", {
    className: "satz__head"
  }, /*#__PURE__*/React.createElement(StateBadge, {
    state: s.state
  }), /*#__PURE__*/React.createElement("span", {
    className: "satz__title"
  }, s.title), s.confidence != null && /*#__PURE__*/React.createElement(Conf, {
    value: s.confidence
  }), /*#__PURE__*/React.createElement("span", {
    className: "satz__spacer"
  }), foldable ? /*#__PURE__*/React.createElement(SegToggle, {
    value: eff,
    onChange: onToggle,
    small: true
  }) : /*#__PURE__*/React.createElement("span", {
    className: "satz__lock"
  }, /*#__PURE__*/React.createElement(LockIco, null), "Nur vollst\xE4ndige Tabelle"), /*#__PURE__*/React.createElement("button", {
    className: "satz__edit",
    onClick: () => onEdit(s)
  }, I.edit({
    size: 13
  }), " Bearbeiten")), /*#__PURE__*/React.createElement("div", {
    className: cx("satz__body", eff === "voll" && "is-full"),
    key: eff
  }, eff === "kompakt" ? /*#__PURE__*/React.createElement(CompactSatz, {
    s: s
  }) : /*#__PURE__*/React.createElement(Buchungssatz, {
    je: s.je,
    title: "Vollst\xE4ndiger Buchungssatz \u2014 DATEV-Form"
  })), !foldable && /*#__PURE__*/React.createElement("div", {
    className: "satz__why"
  }, I.help({
    size: 13
  }), s.reason), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 18px 14px"
    }
  }, /*#__PURE__*/React.createElement(Rationale, {
    je: s.je
  })));
}

// ============================================================================
// BEARBEITEN-DRAWER — Anzeige und Bearbeitung getrennt. Zwei Editier-Modi,
// dieselbe Kompakt ↔ Vollständig-Logik wie in der Leseansicht:
//   Kompakt  → Positionszeilen-Editor (Position / Gegenseite, Steuer abgeleitet)
//   Vollständig → editierbare DATEV-Tabelle (alle Soll/Haben-Zeilen)
// ============================================================================
const EVAT = {
  none: {
    label: "Ohne USt",
    rate: 0,
    bu: null
  },
  r7: {
    label: "USt 7 %",
    rate: 7,
    bu: "8"
  },
  r19: {
    label: "USt 19 %",
    rate: 19,
    bu: "9"
  }
};
const EVAT_ORDER = ["none", "r7", "r19"];
function parseEuro(s) {
  const n = String(s == null ? "" : s).replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const f = parseFloat(n);
  return isNaN(f) ? 0 : f;
}
function fmtEuro(n) {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
}
function vatKeyFrom(p) {
  if (p.bu === "9") return "r19";
  if (p.bu === "8") return "r7";
  const r = p.rate || "";
  if (r.indexOf("19") >= 0) return "r19";
  if (r.indexOf("7") >= 0) return "r7";
  return "none";
}
function initEdit(s) {
  const positions = (s.positions || []).map((p, i) => ({
    id: "p" + i,
    num: p.num,
    name: p.name,
    gross: (p.gross || s.gross || "").replace(" €", ""),
    vat: vatKeyFrom(p),
    text: s.text || ""
  }));
  const full = (s.je.lines || []).map((l, i) => ({
    id: "l" + i,
    side: l.side,
    num: l.num,
    name: l.name,
    amount: (l.amount || "").replace(" €", "")
  }));
  return {
    positions,
    gegen: {
      num: (s.gegen || {}).num || "",
      name: (s.gegen || {}).name || ""
    },
    meta: {
      text: s.text || "",
      beleg: s.beleg || ""
    },
    full
  };
}
function PosEdit({
  p,
  canDelete,
  onChange,
  onDelete
}) {
  const v = EVAT[p.vat] || EVAT.none;
  const gross = parseEuro(p.gross);
  const net = v.rate ? gross / (1 + v.rate / 100) : gross;
  const tax = gross - net;
  return /*#__PURE__*/React.createElement("div", {
    className: "pe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pe__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Sachkonto"), /*#__PURE__*/React.createElement("div", {
    className: "kt"
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp inp--konto kt__no",
    value: p.num,
    onChange: e => onChange({
      num: e.target.value
    }),
    placeholder: "Nr."
  }), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    value: p.name,
    onChange: e => onChange({
      name: e.target.value
    }),
    placeholder: "Bezeichnung"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Brutto"), /*#__PURE__*/React.createElement("div", {
    className: "binp"
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp inp--num",
    inputMode: "decimal",
    value: p.gross,
    onChange: e => onChange({
      gross: e.target.value
    }),
    placeholder: "0,00"
  }), /*#__PURE__*/React.createElement("span", {
    className: "binp__c"
  }, "\u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "pe__row2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "USt-Satz"), /*#__PURE__*/React.createElement("select", {
    className: "inp",
    value: p.vat,
    onChange: e => onChange({
      vat: e.target.value
    })
  }, EVAT_ORDER.map(k => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, EVAT[k].label)))), /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Zeilentext"), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    value: p.text,
    onChange: e => onChange({
      text: e.target.value
    }),
    placeholder: "Buchungstext dieser Position"
  }))), v.rate > 0 && gross > 0 && /*#__PURE__*/React.createElement("div", {
    className: "pe__derived"
  }, I.arrowRight({
    size: 13
  }), " darin ", /*#__PURE__*/React.createElement("b", null, fmtEuro(tax)), " VSt (", v.rate, " %) \xB7 netto ", /*#__PURE__*/React.createElement("b", null, fmtEuro(net))), canDelete && /*#__PURE__*/React.createElement("button", {
    className: "pe__del",
    onClick: onDelete
  }, I.x({
    size: 13
  }), " Position entfernen"));
}
function EditDrawer({
  satz,
  onClose
}) {
  const foldable = satz.foldable !== false;
  const [mode, setMode] = useState(foldable ? "kompakt" : "voll");
  const [m, setM] = useState(() => initEdit(satz));
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);
  const upPos = (id, patch) => setM(x => ({
    ...x,
    positions: x.positions.map(p => p.id === id ? {
      ...p,
      ...patch
    } : p)
  }));
  const delPos = id => setM(x => ({
    ...x,
    positions: x.positions.filter(p => p.id !== id)
  }));
  const addPos = () => setM(x => ({
    ...x,
    positions: [...x.positions, {
      id: "p" + Date.now(),
      num: "",
      name: "",
      gross: "",
      vat: "r19",
      text: x.meta.text
    }]
  }));
  const upFull = (id, patch) => setM(x => ({
    ...x,
    full: x.full.map(l => l.id === id ? {
      ...l,
      ...patch
    } : l)
  }));
  const upGegen = patch => setM(x => ({
    ...x,
    gegen: {
      ...x.gegen,
      ...patch
    }
  }));
  const upMeta = patch => setM(x => ({
    ...x,
    meta: {
      ...x.meta,
      ...patch
    }
  }));
  const gross = m.positions.reduce((a, p) => a + parseEuro(p.gross), 0);
  const soll = m.full.filter(l => l.side === "debit").reduce((a, l) => a + parseEuro(l.amount), 0);
  const haben = m.full.filter(l => l.side === "credit").reduce((a, l) => a + parseEuro(l.amount), 0);
  const balanced = Math.abs(soll - haben) < 0.005;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dw-scrim",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "dw",
    role: "dialog",
    "aria-label": "Buchung bearbeiten"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dw__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dw__head__top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dw__eyebrow"
  }, "Buchungssatz bearbeiten"), /*#__PURE__*/React.createElement("div", {
    className: "dw__title"
  }, satz.title), /*#__PURE__*/React.createElement("div", {
    className: "dw__sub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, VG.case), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, VG.vendor))), /*#__PURE__*/React.createElement("button", {
    className: "dw__close",
    onClick: onClose,
    "aria-label": "Schlie\xDFen"
  }, I.x({
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dw__modes"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Ansicht"), foldable ? /*#__PURE__*/React.createElement(SegToggle, {
    value: mode,
    onChange: setMode,
    small: true
  }) : /*#__PURE__*/React.createElement("span", {
    className: "dw__lockmode"
  }, /*#__PURE__*/React.createElement(LockIco, null), "Nur vollst\xE4ndige Tabelle (\xA7 13b)"))), /*#__PURE__*/React.createElement("div", {
    className: "dw__body"
  }, mode === "kompakt" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dw__sectlbl"
  }, "Positionen (Soll)"), m.positions.map(p => /*#__PURE__*/React.createElement(PosEdit, {
    key: p.id,
    p: p,
    canDelete: m.positions.length > 1,
    onChange: patch => upPos(p.id, patch),
    onDelete: () => delPos(p.id)
  })), /*#__PURE__*/React.createElement("button", {
    className: "dw__add",
    onClick: addPos
  }, I.layers({
    size: 14
  }), " Position hinzuf\xFCgen"), /*#__PURE__*/React.createElement("div", {
    className: "dw__sectlbl"
  }, "Gegenseite (Haben)"), /*#__PURE__*/React.createElement("div", {
    className: "pe pe--gegen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pe__tag"
  }, "an \u2014 Gegenkonto"), /*#__PURE__*/React.createElement("div", {
    className: "pe__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Konto"), /*#__PURE__*/React.createElement("div", {
    className: "kt"
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp inp--konto kt__no",
    value: m.gegen.num,
    onChange: e => upGegen({
      num: e.target.value
    }),
    placeholder: "Nr."
  }), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    value: m.gegen.name,
    onChange: e => upGegen({
      name: e.target.value
    }),
    placeholder: "Bezeichnung"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Betrag"), /*#__PURE__*/React.createElement("div", {
    className: "binp"
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp inp--num",
    value: fmtEuro(gross).replace(" €", ""),
    disabled: true
  }), /*#__PURE__*/React.createElement("span", {
    className: "binp__c"
  }, "\u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "pe__auto"
  }, I.check({
    size: 12,
    style: {
      verticalAlign: "-2px",
      marginRight: 4
    }
  }), "Summe der Positionen \u2014 l\xE4uft automatisch mit: ", /*#__PURE__*/React.createElement("b", null, fmtEuro(gross)))), /*#__PURE__*/React.createElement("div", {
    className: "dw__sectlbl"
  }, "Buchungstext & Beleg"), /*#__PURE__*/React.createElement("div", {
    className: "dw__meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Buchungstext"), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    value: m.meta.text,
    onChange: e => upMeta({
      text: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("input", {
    className: "inp inp--konto",
    value: m.meta.beleg,
    onChange: e => upMeta({
      beleg: e.target.value
    })
  })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dw__sectlbl"
  }, "Alle Zeilen \u2014 DATEV-Form"), /*#__PURE__*/React.createElement("div", {
    className: "fe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fe__h"
  }, /*#__PURE__*/React.createElement("div", null, "Konto"), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, "Soll"), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, "Haben"), /*#__PURE__*/React.createElement("div", null)), m.full.map(l => /*#__PURE__*/React.createElement("div", {
    className: "fe__row",
    key: l.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "fe__kt"
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp inp--konto",
    value: l.num,
    onChange: e => upFull(l.id, {
      num: e.target.value
    })
  }), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    value: l.name,
    onChange: e => upFull(l.id, {
      name: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fe__amt"
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp inp--num",
    value: l.side === "debit" ? l.amount : "",
    disabled: l.side !== "debit",
    onChange: e => upFull(l.id, {
      amount: e.target.value
    }),
    placeholder: l.side === "debit" ? "0,00" : "—"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fe__amt"
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp inp--num",
    value: l.side === "credit" ? l.amount : "",
    disabled: l.side !== "credit",
    onChange: e => upFull(l.id, {
      amount: e.target.value
    }),
    placeholder: l.side === "credit" ? "0,00" : "—"
  })), /*#__PURE__*/React.createElement("button", {
    className: "fe__del",
    title: "Zeile entfernen",
    onClick: () => setM(x => ({
      ...x,
      full: x.full.filter(z => z.id !== l.id)
    }))
  }, I.x({
    size: 15
  })))), /*#__PURE__*/React.createElement("div", {
    className: "fe__sum"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Summe"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, fmtEuro(soll)), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, fmtEuro(haben)), /*#__PURE__*/React.createElement("div", null))), /*#__PURE__*/React.createElement("div", {
    className: "dw__meta",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Buchungstext"), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    value: m.meta.text,
    onChange: e => upMeta({
      text: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fld"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld__lbl"
  }, "Belegfeld 1"), /*#__PURE__*/React.createElement("input", {
    className: "inp inp--konto",
    value: m.meta.beleg,
    onChange: e => upMeta({
      beleg: e.target.value
    })
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "dw__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: cx("dw__foot__bal", balanced ? "ok" : "off")
  }, balanced ? I.check({
    size: 14
  }) : I.alert({
    size: 14
  }), balanced ? "Soll = Haben · geht auf" : "Soll ≠ Haben"), /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-tertiary btn-sm",
    onClick: onClose
  }, "Abbrechen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: onClose
  }, I.check({
    size: 15
  }), " Speichern"))));
}

// ============================================================================
// Demo data — ein Sachverhalt „M-net Telekommunikation“, mehrere Sätze.
// Jeder Satz trägt beide Repräsentationen: Kompakt (positions/gegen/gross)
// und die unveränderte Tabelle (je.lines).
// ============================================================================
const VG = {
  case: "SV-2026-0731",
  title: "M-net Telekommunikations GmbH — Juni 2026",
  vendor: "M-net Telekommunikations GmbH",
  total: "1.351,99 €",
  saetze: [{
    id: "s1",
    title: "Rechnung Juni — Telefon + Internet (Aufteilung)",
    state: "proposed",
    confidence: 88,
    positions: [{
      num: "4920",
      name: "Telefon",
      bu: "9",
      rate: "19 %",
      gross: "119,00 €"
    }, {
      num: "4925",
      name: "Internet",
      bu: "9",
      rate: "19 %",
      gross: "178,50 €"
    }],
    gegen: {
      num: "82050",
      name: "M-net Telekommunikations GmbH"
    },
    gross: "297,50 €",
    text: "M-net Juni 2026",
    vst_note: "darin 47,50 € VSt",
    beleg: "202605034299",
    je: {
      confidence: 88,
      status: "proposed",
      rationale: "Eine Rechnung, zwei Aufwandspositionen (Telefon 4920, Internet 4925) mit identischem Steuersatz 19 %. Vorsteuer auf 1576 zusammengefasst, Gegenkonto Kreditor 82050. Aufteilung ist eindeutig — die Kompakt-Form zeigt je Position eine Zeile, die Gegenseite einmal.",
      sum_soll: "297,50 €",
      sum_haben: "297,50 €",
      lines: [{
        side: "debit",
        num: "4920",
        name: "Telefon",
        amount: "100,00 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "4925",
        name: "Internet",
        amount: "150,00 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "1576",
        name: "Abziehbare Vorsteuer 19 %",
        amount: "47,50 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "credit",
        num: "82050",
        name: "Verbindlichkeiten M-net",
        amount: "297,50 €"
      }]
    }
  }, {
    id: "s2",
    title: "Rechnung Mai — Telefon (einfacher Satz)",
    state: "posted",
    confidence: 96,
    positions: [{
      num: "4920",
      name: "Telefon",
      bu: "9",
      rate: "19 %"
    }],
    gegen: {
      num: "82050",
      name: "M-net Telekommunikations GmbH"
    },
    gross: "379,49 €",
    text: "M-net Telekommunikation Mai 2026",
    vst_note: "darin 60,59 € VSt",
    beleg: "202605034288",
    je: {
      confidence: 96,
      status: "posted",
      acceptance: "ai_unmodified",
      rationale: "Standard-Eingangsrechnung mit einem Aufwand und eindeutigem USt-Ausweis (19 %). Aufwand 4920 Telefon, Vorsteuer 1576, Gegenkonto Kreditor 82050 — die Kompakt-Zeile ist die Primanota-Zeile in lesbar.",
      sum_soll: "379,49 €",
      sum_haben: "379,49 €",
      lines: [{
        side: "debit",
        num: "4920",
        name: "Telefon",
        amount: "318,90 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "1576",
        name: "Abziehbare Vorsteuer 19 %",
        amount: "60,59 €",
        tax: "VST19",
        rate: "19,00 %"
      }, {
        side: "credit",
        num: "82050",
        name: "Verbindlichkeiten M-net",
        amount: "379,49 €"
      }]
    }
  }, {
    id: "s3",
    title: "Zahlung Mai-Rechnung (ohne USt)",
    state: "posted",
    confidence: 99,
    positions: [{
      num: "82050",
      name: "Verbindlichkeiten M-net"
    }],
    gegen: {
      num: "1200",
      name: "Bank"
    },
    gross: "379,49 €",
    text: "Ausgleich RG Mai 2026",
    beleg: "Kontoauszug 12/2026",
    je: {
      confidence: 99,
      status: "posted",
      acceptance: "ai_unmodified",
      rationale: "Reine Zahlung — kein Steuerausweis. Ausgleich der Verbindlichkeit 82050 gegen Bank 1200. Ohne USt entfallen Steuer-Badge und „darin …“ in der Kompakt-Zeile.",
      sum_soll: "379,49 €",
      sum_haben: "379,49 €",
      lines: [{
        side: "debit",
        num: "82050",
        name: "Verbindlichkeiten M-net",
        amount: "379,49 €"
      }, {
        side: "credit",
        num: "1200",
        name: "Bank",
        amount: "379,49 €"
      }]
    }
  }, {
    id: "s4",
    title: "Cloud-Telefonie EU — Reverse-Charge (§ 13b)",
    state: "proposed",
    confidence: 74,
    foldable: false,
    reason: "§ 13b Reverse-Charge: Umsatzsteuer und Vorsteuer stehen auf beiden Seiten. Eine „Konto an Gegenkonto“-Zeile würde die Steuermechanik verschlucken — daher immer die vollständige Tabelle.",
    je: {
      confidence: 74,
      status: "proposed",
      rationale: "Sonstige Leistung eines EU-Unternehmers (§ 13b UStG). Steuerschuldnerschaft des Leistungsempfängers: 19 % Umsatzsteuer (3837) und zugleich abziehbare Vorsteuer (1577). Steuerzeilen auf Soll und Haben — nicht als Kompakt-Zeile faltbar.",
      sum_soll: "595,00 €",
      sum_haben: "595,00 €",
      lines: [{
        side: "debit",
        num: "4980",
        name: "Cloud-Telefonie / SaaS",
        amount: "500,00 €",
        tax: "§13b",
        rate: "19,00 %"
      }, {
        side: "debit",
        num: "1577",
        name: "Abziehb. Vorsteuer § 13b",
        amount: "95,00 €",
        tax: "§13b",
        rate: "19,00 %"
      }, {
        side: "credit",
        num: "82060",
        name: "Verbindlichkeiten Cloud EU",
        amount: "500,00 €"
      }, {
        side: "credit",
        num: "3837",
        name: "Umsatzsteuer § 13b",
        amount: "95,00 €",
        tax: "§13b",
        rate: "19,00 %"
      }]
    }
  }]
};

// ============================================================================
function VergleichApp() {
  const [glob, setGlob] = useState("kompakt");
  const [ov, setOv] = useState({});
  const [edit, setEdit] = useState(null);
  const modeFor = s => ov[s.id] || glob;
  const setSatz = (id, m) => setOv(o => ({
    ...o,
    [id]: m
  }));
  const setAll = m => {
    setGlob(m);
    setOv({});
  };
  const foldableCount = VG.saetze.filter(s => s.foldable !== false).length;
  const heroSatz = VG.saetze[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "vg-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vg-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "vg-head__eyebrow"
  }, "Gesamtansicht \xB7 Buchungss\xE4tze"), /*#__PURE__*/React.createElement("h1", null, VG.title), /*#__PURE__*/React.createElement("div", {
    className: "vg-head__sub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, VG.case), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, VG.vendor), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, VG.saetze.length, " Buchungss\xE4tze"))), /*#__PURE__*/React.createElement("div", {
    className: "vg-total"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Gesamtbetrag"), /*#__PURE__*/React.createElement("div", {
    className: "amt"
  }, VG.total))), /*#__PURE__*/React.createElement("div", {
    className: "vg-compare"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vg-compare__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vg-compare__tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, "A"), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Kompakt-Zeile"), /*#__PURE__*/React.createElement("span", {
    className: "s"
  }, "\u201EKonto an Gegenkonto\u201C")), /*#__PURE__*/React.createElement(CompactSatz, {
    s: heroSatz
  }), /*#__PURE__*/React.createElement("div", {
    className: "vg-compare__note"
  }, "Eine Zeile je Position, die Gegenseite einmal. Betrag rechtsb\xFCndig, ", /*#__PURE__*/React.createElement("b", null, "tabular-nums"), " \u2014 scanbar wie ein Kontoauszug. Zeile 2: Buchungstext \xB7 darin-VSt \xB7 Belegfeld 1.")), /*#__PURE__*/React.createElement("div", {
    className: "vg-compare__col vg-compare__col--voll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vg-compare__tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, "A"), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Vollst\xE4ndige Tabelle"), /*#__PURE__*/React.createElement("span", {
    className: "s"
  }, "heutige DATEV-Form")), /*#__PURE__*/React.createElement(Buchungssatz, {
    je: heroSatz.je,
    title: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "vg-compare__note"
  }, "Identische Daten in Soll/Haben-Aufstellung \u2014 ", /*#__PURE__*/React.createElement("b", null, "unver\xE4ndert"), ". Umschalten ist reine Anzeige, keine Ladevorg\xE4nge."))), /*#__PURE__*/React.createElement("div", {
    className: "vg-listhead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vg-listhead__l"
  }, /*#__PURE__*/React.createElement("h2", null, "Buchungss\xE4tze"), /*#__PURE__*/React.createElement("span", {
    className: "vg-listhead__count"
  }, VG.saetze.length, " S\xE4tze \xB7 ", foldableCount, " kompakt darstellbar")), /*#__PURE__*/React.createElement("div", {
    className: "vg-listhead__r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Alle"), /*#__PURE__*/React.createElement(SegToggle, {
    value: glob,
    onChange: setAll,
    labels: {
      kompakt: "Alle kompakt",
      voll: "Alle vollständig"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "vg-list"
  }, VG.saetze.map(s => /*#__PURE__*/React.createElement(SatzCard, {
    key: s.id,
    s: s,
    mode: modeFor(s),
    onToggle: m => setSatz(s.id, m),
    onEdit: setEdit
  }))), /*#__PURE__*/React.createElement("div", {
    className: "vg-legend"
  }, /*#__PURE__*/React.createElement("h3", null, "Wann die Kompakt-Zeile nicht angeboten wird"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, I.help({
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Steuerzeile mehrdeutig"), " \u2014 kein ", /*#__PURE__*/React.createElement("code", null, "tax_for_line_no"), ", Heuristik uneindeutig.")), /*#__PURE__*/React.createElement("li", null, I.help({
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "\xA7 13b / igE"), " \u2014 Steuerzeilen auf beiden Seiten.")), /*#__PURE__*/React.createElement("li", null, I.help({
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "n:m-Muster"), " \u2014 mehrere Gegenseiten (Multizahlung).")), /*#__PURE__*/React.createElement("li", null, I.help({
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Fremdw\xE4hrung."))))), edit && /*#__PURE__*/React.createElement(EditDrawer, {
    satz: edit,
    onClose: () => setEdit(null)
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(VergleichApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "sachverhalt-screen/vergleich.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/BelegInterpretation.jsx
try { (() => {
// Positionen-Tabelle + Interpretation-Panel — geteilt zwischen allen Varianten

const SOURCE_LABEL = {
  extracted: "extrahiert",
  virtual_fallback: "virtual_fallback",
  virtual_aggregate: "virtual_aggregate"
};
function BD_PositionsTable({
  beleg
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-card__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "small",
    style: {
      flex: "none"
    }
  }, "Positionen"), /*#__PURE__*/React.createElement("h3", {
    style: {
      flex: 1
    }
  }, beleg.positions.length, " Posten"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--color-text-muted)"
    }
  }, "Summe Brutto ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--color-primary)",
      fontVariantNumeric: "tabular-nums"
    }
  }, beleg.total_value, " \u20AC"))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-card__body--flush",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "bdv-tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Pos"), /*#__PURE__*/React.createElement("th", null, "Beschreibung"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Menge"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Einzelpreis"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "USt"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Gesamt"), /*#__PURE__*/React.createElement("th", null, "Quelle"))), /*#__PURE__*/React.createElement("tbody", null, beleg.positions.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.pos
  }, /*#__PURE__*/React.createElement("td", {
    className: "pos"
  }, p.pos), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "desc"
  }, p.beschreibung)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, p.quantity), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, p.unit_price, " \u20AC"), /*#__PURE__*/React.createElement("td", {
    className: "tax num"
  }, p.tax_rate_percent, " %"), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, /*#__PURE__*/React.createElement("strong", null, p.total_price, " \u20AC")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "bdv-src src-" + p.source
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), SOURCE_LABEL[p.source]))))))));
}
function BD_InterpretationPanel({
  beleg,
  compact = false
}) {
  const [reasoningOpen, setReasoningOpen] = React.useState(false);
  const i = beleg.interpretation;
  const pct = Math.round(i.confidence * 100);
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv-interp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-interp__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-interp__mark"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bdv-interp__title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "small"
  }, "Ludwig schl\xE4gt vor"), /*#__PURE__*/React.createElement("h3", null, "Buchungsvorschlag")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--color-text-muted)",
      fontFamily: "var(--font-mono)"
    }
  }, "v2.4 \xB7 09:14")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__lbl"
  }, "Konfidenz (gesamt)"), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__pct"
  }, pct, " %"), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__fill",
    style: {
      width: pct + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__hint"
  }, "Ludwig ist sich bei diesem Beleg \xFCberwiegend sicher. Bitte pr\xFCfen Sie die Kl\xE4rungsfrage unten.")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Soll-Konto"), /*#__PURE__*/React.createElement("span", {
    className: "konto"
  }, i.soll.konto), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, i.soll.bezeichnung)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Haben-Konto"), /*#__PURE__*/React.createElement("span", {
    className: "konto"
  }, i.haben.konto), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, i.haben.bezeichnung)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__cat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Service-Kategorie"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, i.kategorie))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-buchungstext"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Vorgeschlagener Buchungstext"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, i.buchungstext)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-list bdv-list--klaerung"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-list__lbl"
  }, "Kl\xE4rungsfragen ", /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, i.klaerung.length)), /*#__PURE__*/React.createElement("ul", null, i.klaerung.map((q, idx) => /*#__PURE__*/React.createElement("li", {
    key: idx
  }, q)))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-list bdv-list--review"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-list__lbl"
  }, "Review-Items ", /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, i.review.length)), /*#__PURE__*/React.createElement("ul", null, i.review.map((r, idx) => /*#__PURE__*/React.createElement("li", {
    key: idx
  }, r)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: reasoningOpen ? "1px solid var(--color-border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--color-text-subtle)",
      fontWeight: 600
    }
  }, "Ludwig-Begr\xFCndung"), /*#__PURE__*/React.createElement(BD_Toggle, {
    open: reasoningOpen,
    onClick: () => setReasoningOpen(!reasoningOpen)
  }, reasoningOpen ? "Einklappen" : "Ausklappen")), reasoningOpen && /*#__PURE__*/React.createElement("div", {
    className: "bdv-reasoning"
  }, i.reasoning, /*#__PURE__*/React.createElement("div", {
    className: "src"
  }, "Modell: ludwig-buchung-v2.4 \xB7 gest\xFCtzt auf 12 Vorbuchungen dieses Kreditors")));
}
function BD_Actions({
  onApprove,
  onReject
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, "Bearbeiten"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    onClick: onReject
  }, "Ablehnen"), /*#__PURE__*/React.createElement("span", {
    className: "spacer"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, "Kl\xE4rung an Mandanten senden"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: onApprove
  }, "Akzeptieren"));
}
window.BD_PositionsTable = BD_PositionsTable;
window.BD_InterpretationPanel = BD_InterpretationPanel;
window.BD_Actions = BD_Actions;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/BelegInterpretation.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/BelegSample.jsx
try { (() => {
// Beispiel-Beleg für Beleg-Detail (alle drei Layout-Varianten teilen sich diesen)
const BELEG_SAMPLE = {
  id: "BL-2026-04-118",
  kreditor: {
    name: "Telekom Deutschland GmbH",
    id: "K-10042",
    anschrift: "Landgrabenweg 151 · 53227 Bonn"
  },
  belegnummer: "RE-2026-04-118-7732",
  invoice_date: "23.04.2026",
  due_date: "07.05.2026",
  booking_date: "30.04.2026",
  reverse_charge: false,
  currency: "EUR",
  subtotal_value: "67,14",
  tax_total_value: "12,76",
  total_value: "79,90",
  ocr_markdown: ["**Telekom Deutschland GmbH**", "Landgrabenweg 151, 53227 Bonn", "", "Rechnung Nr. RE-2026-04-118-7732", "Rechnungsdatum: 23.04.2026", "", "| Pos | Leistung               | Zeitraum     | Betrag |", "|-----|------------------------|--------------|--------|", "| 1   | Mobilfunk Business L   | 04/2026      | 39,90 € |", "| 2   | Datenoption 20 GB      | 04/2026      | 19,90 € |", "| 3   | Auslandsoption EU      | 04/2026      |  7,34 € |", "", "Nettobetrag:    67,14 €", "USt 19 %:       12,76 €", "Gesamt:         79,90 €", "", "Zahlbar bis 07.05.2026."].join("\n"),
  positions: [{
    pos: 1,
    beschreibung: "Mobilfunk Business L",
    quantity: "1",
    unit_price: "39,90",
    tax_rate_percent: "19",
    total_price: "39,90",
    source: "extracted"
  }, {
    pos: 2,
    beschreibung: "Datenoption 20 GB",
    quantity: "1",
    unit_price: "19,90",
    tax_rate_percent: "19",
    total_price: "19,90",
    source: "extracted"
  }, {
    pos: 3,
    beschreibung: "Auslandsoption EU",
    quantity: "1",
    unit_price: "7,34",
    tax_rate_percent: "19",
    total_price: "7,34",
    source: "extracted"
  }, {
    pos: 4,
    beschreibung: "Rundungsdifferenz",
    quantity: "1",
    unit_price: "0,00",
    tax_rate_percent: "19",
    total_price: "0,00",
    source: "virtual_fallback"
  }],
  interpretation: {
    confidence: 0.92,
    soll: {
      konto: "4925",
      bezeichnung: "Telefon"
    },
    haben: {
      konto: "1200",
      bezeichnung: "Bank"
    },
    kategorie: "Telekommunikation · Mobilfunk",
    buchungstext: "Telekom · Mobilfunk 04/2026",
    klaerung: ["Auslandsoption EU als regulärer Telefonaufwand verbucht. Bitte bestätigen, ob ein eigenes Konto (4926) gewünscht ist."],
    review: ["Fälligkeitsdatum 07.05.2026 liegt nach dem Buchungsdatum 30.04.2026 — bitte ggf. Periodenabgrenzung prüfen.", "Beleg ohne Bestellnummer — Zuordnung über Lieferant erfolgt."],
    reasoning: ["Lieferant »Telekom Deutschland GmbH« ist als wiederkehrender Kreditor (K-10042) erfasst; in den letzten 12 Buchungen wurde Konto 4925 verwendet.", "Buchungstext folgt dem etablierten Muster »<Lieferant> · <Leistung> <Periode>«.", "Steuersatz 19 % stimmt mit dem extrahierten Wert überein. Reverse-Charge nicht einschlägig (deutscher Inlandsumsatz).", "Konfidenz 92 % — leichte Unsicherheit aufgrund der Auslandsoption (mögliches Sonderkonto)."].join(" ")
  }
};
window.BELEG_SAMPLE = BELEG_SAMPLE;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/BelegSample.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/BelegShared.jsx
try { (() => {
// Geteilte Bausteine für alle drei Beleg-Detail-Varianten.
// Werden als window.BD_* exportiert.

const Chev = ({
  open
}) => /*#__PURE__*/React.createElement("svg", {
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "6 9 12 15 18 9"
}));
function Toggle({
  open,
  onClick,
  children
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "bdv-toggle " + (open ? "is-open" : ""),
    onClick: onClick
  }, /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(Chev, null)), children);
}

/* PDF-Renderer (Original-Beleg) */
function BD_PdfViewer({
  beleg
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv-pdf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-pdf__page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-pdf__toolbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bdv-pdf__tool"
  }, "Original"), /*#__PURE__*/React.createElement("button", {
    className: "bdv-pdf__tool"
  }, "OCR-Layer"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "bdv-pdf__tool mono"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      padding: "0 4px"
    }
  }, "100 %"), /*#__PURE__*/React.createElement("button", {
    className: "bdv-pdf__tool mono"
  }, "+"), /*#__PURE__*/React.createElement("button", {
    className: "bdv-pdf__tool"
  }, "Seite 1 / 1")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, beleg.kreditor.name), /*#__PURE__*/React.createElement("small", null, beleg.kreditor.anschrift)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontSize: 9.5,
      color: "#5C5C5C"
    }
  }, /*#__PURE__*/React.createElement("div", null, "Rechnung Nr. ", beleg.belegnummer), /*#__PURE__*/React.createElement("div", null, "Rechnungsdatum: ", beleg.invoice_date), /*#__PURE__*/React.createElement("div", null, "F\xE4llig: ", beleg.due_date))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      color: "#5C5C5C",
      fontSize: 9.5
    }
  }, "An:", /*#__PURE__*/React.createElement("br", null), "Steuerkanzlei Hofmann \xB7 Maximilianstr. 8 \xB7 80539 M\xFCnchen"), /*#__PURE__*/React.createElement("table", {
    className: "invoice"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Pos"), /*#__PURE__*/React.createElement("th", null, "Leistung"), /*#__PURE__*/React.createElement("th", null, "Zeitraum"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Betrag"))), /*#__PURE__*/React.createElement("tbody", null, beleg.positions.filter(p => p.source !== "virtual_fallback" && p.source !== "virtual_aggregate").map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.pos
  }, /*#__PURE__*/React.createElement("td", null, p.pos), /*#__PURE__*/React.createElement("td", null, p.beschreibung), /*#__PURE__*/React.createElement("td", null, "04 / 2026"), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, p.total_price, " \u20AC"))))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-pdf__totals"
  }, /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement("dt", null, "Nettobetrag"), /*#__PURE__*/React.createElement("dt", {
    style: {
      marginTop: 4
    }
  }, "USt 19 %")), /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement("dd", null, beleg.subtotal_value, " \u20AC"), /*#__PURE__*/React.createElement("dd", {
    style: {
      marginTop: 4
    }
  }, beleg.tax_total_value, " \u20AC"))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-pdf__totals",
    style: {
      marginTop: -1
    }
  }, /*#__PURE__*/React.createElement("dl", {
    className: "is-grand"
  }, /*#__PURE__*/React.createElement("dt", null, "Gesamtbetrag")), /*#__PURE__*/React.createElement("dl", {
    className: "is-grand"
  }, /*#__PURE__*/React.createElement("dd", null, beleg.total_value, " \u20AC"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 9.5,
      color: "#5C5C5C"
    }
  }, "Zahlbar bis ", beleg.due_date, ". Bei R\xFCckfragen wenden Sie sich an unsere Gesch\xE4ftskunden-Hotline.")));
}

/* Header-Block (Kreditor + Belegfakten + Beträge) */
function BD_HeaderBlock({
  beleg,
  withOcr = true
}) {
  const [ocrOpen, setOcrOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-card__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "small",
    style: {
      flex: "none"
    }
  }, "Belegdaten"), /*#__PURE__*/React.createElement("h3", {
    style: {
      flex: 1
    }
  }, beleg.kreditor.name), /*#__PURE__*/React.createElement("span", {
    className: "bdv-flag " + (beleg.reverse_charge ? "is-on" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), beleg.reverse_charge ? "Reverse-Charge" : "Kein Reverse-Charge")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-facts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Kreditor"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, beleg.kreditor.name), " ", /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--color-text-muted)",
      marginLeft: 4
    }
  }, "\xB7 ", beleg.kreditor.id))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Belegnummer"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.belegnummer)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Belegdatum"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.invoice_date)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "F\xE4lligkeitsdatum"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.due_date)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Buchungsdatum"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.booking_date)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "W\xE4hrung"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.currency))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-totals"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Netto"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, beleg.subtotal_value, " \u20AC")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Steuer"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, beleg.tax_total_value, " \u20AC")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Brutto"), /*#__PURE__*/React.createElement("div", {
    className: "val is-grand"
  }, beleg.total_value, " \u20AC"))), withOcr && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 18px",
      borderTop: "1px solid var(--color-border-subtle)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl",
    style: {
      fontSize: 10.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--color-text-subtle)",
      fontWeight: 600
    }
  }, "OCR-Markdown"), /*#__PURE__*/React.createElement(Toggle, {
    open: ocrOpen,
    onClick: () => setOcrOpen(!ocrOpen)
  }, ocrOpen ? "Einklappen" : "Ausklappen")), ocrOpen && /*#__PURE__*/React.createElement("pre", {
    className: "bdv-ocr"
  }, beleg.ocr_markdown)));
}
window.BD_Toggle = Toggle;
window.BD_PdfViewer = BD_PdfViewer;
window.BD_HeaderBlock = BD_HeaderBlock;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/BelegShared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/BelegVariants.jsx
try { (() => {
// Sticky-Header (oben über den ganzen Beleg-Detail-Screen) + die 3 Layout-Varianten

function BD_Header({
  beleg,
  variant,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv-head"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bdv-head__back",
    onClick: onBack,
    "aria-label": "Zur\xFCck"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "15 18 9 12 15 6"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-head__title"
  }, /*#__PURE__*/React.createElement("h1", null, beleg.kreditor.name, " \xB7 ", beleg.belegnummer), /*#__PURE__*/React.createElement("div", {
    className: "bdv-head__meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, beleg.id), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Eingangsrechnung"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Belegdatum ", beleg.invoice_date), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Brutto ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--color-primary)",
      fontVariantNumeric: "tabular-nums"
    }
  }, beleg.total_value, " \u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-head__actions"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bdv-flag is-on",
    title: "Variante"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Layout ", variant), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, "PDF herunterladen")));
}

/* === Variante A — Klassisch gestapelt =================================== */
function BelegDetail_A({
  beleg,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv bdv-a"
  }, /*#__PURE__*/React.createElement(BD_Header, {
    beleg: beleg,
    variant: "A",
    onBack: onBack
  }), /*#__PURE__*/React.createElement(BD_PdfViewer, {
    beleg: beleg
  }), /*#__PURE__*/React.createElement("div", {
    className: "bdv-side"
  }, /*#__PURE__*/React.createElement(BD_HeaderBlock, {
    beleg: beleg
  }), /*#__PURE__*/React.createElement(BD_PositionsTable, {
    beleg: beleg
  }), /*#__PURE__*/React.createElement(BD_InterpretationPanel, {
    beleg: beleg
  })), /*#__PURE__*/React.createElement(BD_Actions, {
    onApprove: onBack,
    onReject: onBack
  }));
}

/* === Variante B — Tabs ================================================== */
function BelegDetail_B({
  beleg,
  onBack
}) {
  const [tab, setTab] = React.useState("uebersicht");
  const tabs = [{
    id: "uebersicht",
    label: "Übersicht"
  }, {
    id: "positionen",
    label: "Positionen",
    pill: beleg.positions.length
  }, {
    id: "analyse",
    label: "Ludwig-Analyse",
    pill: Math.round(beleg.interpretation.confidence * 100) + "%"
  }, {
    id: "ocr",
    label: "OCR-Text"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv bdv-b"
  }, /*#__PURE__*/React.createElement(BD_Header, {
    beleg: beleg,
    variant: "B",
    onBack: onBack
  }), /*#__PURE__*/React.createElement(BD_PdfViewer, {
    beleg: beleg
  }), /*#__PURE__*/React.createElement("div", {
    className: "bdv-tabwrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-b__tabs"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "bdv-b__tab " + (tab === t.id ? "is-active" : ""),
    onClick: () => setTab(t.id)
  }, t.label, t.pill !== undefined && /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, t.pill)))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-b__panel"
  }, tab === "uebersicht" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BD_HeaderBlock, {
    beleg: beleg,
    withOcr: false
  }), /*#__PURE__*/React.createElement("div", {
    className: "bdv-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-card__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "small",
    style: {
      flex: "none"
    }
  }, "Kurzfassung"), /*#__PURE__*/React.createElement("h3", {
    style: {
      flex: 1
    }
  }, "Ludwig-Vorschlag"), /*#__PURE__*/React.createElement("span", {
    className: "bdv-flag is-on"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Konfidenz ", Math.round(beleg.interpretation.confidence * 100), " %")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Soll"), /*#__PURE__*/React.createElement("span", {
    className: "konto"
  }, beleg.interpretation.soll.konto), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, beleg.interpretation.soll.bezeichnung)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Haben"), /*#__PURE__*/React.createElement("span", {
    className: "konto"
  }, beleg.interpretation.haben.konto), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, beleg.interpretation.haben.bezeichnung))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-buchungstext"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Buchungstext"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, beleg.interpretation.buchungstext)))), tab === "positionen" && /*#__PURE__*/React.createElement(BD_PositionsTable, {
    beleg: beleg
  }), tab === "analyse" && /*#__PURE__*/React.createElement(BD_InterpretationPanel, {
    beleg: beleg
  }), tab === "ocr" && /*#__PURE__*/React.createElement("div", {
    className: "bdv-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-card__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "small",
    style: {
      flex: "none"
    }
  }, "OCR"), /*#__PURE__*/React.createElement("h3", {
    style: {
      flex: 1
    }
  }, "Extrahierter Text (Markdown)")), /*#__PURE__*/React.createElement("pre", {
    className: "bdv-ocr",
    style: {
      maxHeight: "none",
      border: "none"
    }
  }, beleg.ocr_markdown)))), /*#__PURE__*/React.createElement(BD_Actions, {
    onApprove: onBack,
    onReject: onBack
  }));
}

/* === Variante C — Drei Spalten ========================================= */
function BelegDetail_C({
  beleg,
  onBack
}) {
  const i = beleg.interpretation;
  const pct = Math.round(i.confidence * 100);
  return /*#__PURE__*/React.createElement("div", {
    className: "bdv bdv-c"
  }, /*#__PURE__*/React.createElement(BD_Header, {
    beleg: beleg,
    variant: "C",
    onBack: onBack
  }), /*#__PURE__*/React.createElement(BD_PdfViewer, {
    beleg: beleg
  }), /*#__PURE__*/React.createElement("div", {
    className: "bdv-col-mid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "small"
  }, "Belegdaten")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-facts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Kreditor"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, beleg.kreditor.name)), /*#__PURE__*/React.createElement("span", {
    className: "val mono",
    style: {
      color: "var(--color-text-muted)",
      fontWeight: 400
    }
  }, beleg.kreditor.id)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Belegnummer"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.belegnummer)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Belegdatum"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.invoice_date)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "F\xE4llig"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.due_date)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Buchungsdatum"), /*#__PURE__*/React.createElement("span", {
    className: "val mono"
  }, beleg.booking_date)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Reverse-Charge"), /*#__PURE__*/React.createElement("span", {
    className: "bdv-flag " + (beleg.reverse_charge ? "is-on" : ""),
    style: {
      alignSelf: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), beleg.reverse_charge ? "ja" : "nein"))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-totals"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Netto"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, beleg.subtotal_value, " \u20AC")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Steuer"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, beleg.tax_total_value, " \u20AC")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Brutto"), /*#__PURE__*/React.createElement("div", {
    className: "val is-grand"
  }, beleg.total_value, " \u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "small"
  }, "Positionen \xB7 ", beleg.positions.length)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-body"
  }, /*#__PURE__*/React.createElement("table", {
    className: "bdv-tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Pos"), /*#__PURE__*/React.createElement("th", null, "Beschreibung"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Menge"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "EP"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "USt"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Gesamt"))), /*#__PURE__*/React.createElement("tbody", null, beleg.positions.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.pos
  }, /*#__PURE__*/React.createElement("td", {
    className: "pos"
  }, p.pos), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "desc"
  }, p.beschreibung), /*#__PURE__*/React.createElement("span", {
    className: "bdv-src src-" + p.source,
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), SOURCE_LABEL[p.source])), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, p.quantity), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, p.unit_price, " \u20AC"), /*#__PURE__*/React.createElement("td", {
    className: "tax num"
  }, p.tax_rate_percent, " %"), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, /*#__PURE__*/React.createElement("strong", null, p.total_price, " \u20AC")))))))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "small"
  }, "OCR-Markdown")), /*#__PURE__*/React.createElement("pre", {
    className: "bdv-ocr",
    style: {
      borderTop: "none"
    }
  }, beleg.ocr_markdown))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-col-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "small"
  }, "Ludwig-Analyse")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__lbl"
  }, "Konfidenz (gesamt)"), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__pct"
  }, pct, " %"), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__fill",
    style: {
      width: pct + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "bdv-conf__hint"
  }, "\xDCberwiegend sicher. Eine Kl\xE4rungsfrage offen.")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Soll"), /*#__PURE__*/React.createElement("span", {
    className: "konto"
  }, i.soll.konto), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, i.soll.bezeichnung)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Haben"), /*#__PURE__*/React.createElement("span", {
    className: "konto"
  }, i.haben.konto), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, i.haben.bezeichnung)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-account__cat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Kategorie"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, i.kategorie))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-buchungstext"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Buchungstext"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, i.buchungstext))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "small"
  }, "Kl\xE4rungsfragen \xB7 ", i.klaerung.length)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-list bdv-list--klaerung",
    style: {
      borderBottom: "none",
      padding: "12px 18px"
    }
  }, /*#__PURE__*/React.createElement("ul", null, i.klaerung.map((q, idx) => /*#__PURE__*/React.createElement("li", {
    key: idx
  }, q))))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "small"
  }, "Review-Items \xB7 ", i.review.length)), /*#__PURE__*/React.createElement("div", {
    className: "bdv-list bdv-list--review",
    style: {
      borderBottom: "none",
      padding: "12px 18px"
    }
  }, /*#__PURE__*/React.createElement("ul", null, i.review.map((r, idx) => /*#__PURE__*/React.createElement("li", {
    key: idx
  }, r))))), /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bdv-c__sec-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "small"
  }, "Ludwig-Begr\xFCndung")), /*#__PURE__*/React.createElement("div", {
    className: "bdv-reasoning"
  }, i.reasoning, /*#__PURE__*/React.createElement("div", {
    className: "src"
  }, "Modell: ludwig-buchung-v2.4 \xB7 12 Vorbuchungen dieses Kreditors")))), /*#__PURE__*/React.createElement(BD_Actions, {
    onApprove: onBack,
    onReject: onBack
  }));
}
window.BelegDetail_A = BelegDetail_A;
window.BelegDetail_B = BelegDetail_B;
window.BelegDetail_C = BelegDetail_C;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/BelegVariants.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Components.jsx
try { (() => {
// Wiederverwendbare Komponenten-Bausteine für die Ludwig-App
// Ergänzt Primitives.jsx um Empty/Toast/Banner/Wizard/AuditTrail/Pagination/Drawer/Skeleton

function EmptyState({
  icon,
  title,
  sub,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, icon && /*#__PURE__*/React.createElement("div", {
    className: "empty__ico"
  }, icon), /*#__PURE__*/React.createElement("h3", {
    className: "empty__title"
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "empty__sub"
  }, sub), actions && /*#__PURE__*/React.createElement("div", {
    className: "empty__actions"
  }, actions));
}
function Banner({
  kind = "info",
  title,
  children,
  action,
  onAction
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "banner banner--" + kind
  }, /*#__PURE__*/React.createElement("div", {
    className: "banner__body"
  }, title && /*#__PURE__*/React.createElement("span", {
    className: "banner__title"
  }, title, " "), children), action && /*#__PURE__*/React.createElement("button", {
    className: "banner__action",
    onClick: onAction
  }, action));
}
function Toast({
  kind = "success",
  title,
  sub,
  action,
  onAction
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast__ico toast__ico--" + kind
  }, kind === "success" ? Icons.Check : Icons.X), /*#__PURE__*/React.createElement("div", {
    className: "toast__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast__title"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "toast__sub"
  }, sub)), action && /*#__PURE__*/React.createElement("button", {
    className: "toast__action",
    onClick: onAction
  }, action));
}
function Pagination({
  page = 1,
  total = 1,
  perPage = 20,
  onChange
}) {
  const last = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);
  const pages = [];
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || Math.abs(i - page) <= 1) pages.push(i);else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "pag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "info"
  }, start, "\u2013", end, " von ", total), /*#__PURE__*/React.createElement("button", {
    className: "page",
    disabled: page === 1,
    onClick: () => onChange && onChange(page - 1)
  }, Icons.ChevLeft), pages.map((p, i) => p === "…" ? /*#__PURE__*/React.createElement("span", {
    key: "e" + i,
    className: "ellipsis"
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    key: p,
    className: "page" + (p === page ? " active" : ""),
    onClick: () => onChange && onChange(p)
  }, p)), /*#__PURE__*/React.createElement("button", {
    className: "page",
    disabled: page === last,
    onClick: () => onChange && onChange(page + 1)
  }, Icons.ChevRight));
}
function Skeleton({
  width = "60%",
  height = 10
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      width,
      height
    }
  });
}
function Wizard({
  steps,
  current,
  children,
  onPrev,
  onNext,
  onCancel,
  nextLabel = "Weiter"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "wz"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wz__steps",
    style: {
      gridTemplateColumns: `repeat(${steps.length}, 1fr)`
    }
  }, steps.map((s, i) => {
    const state = i < current ? "done" : i === current ? "active" : "";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "wz__step " + state
    }, /*#__PURE__*/React.createElement("span", {
      className: "wz__num"
    }, state === "done" ? Icons.Check : i + 1), /*#__PURE__*/React.createElement("div", {
      className: "wz__lbl"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, "Schritt ", i + 1), /*#__PURE__*/React.createElement("span", {
      className: "name"
    }, s)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "wz__body"
  }, children), /*#__PURE__*/React.createElement("div", {
    className: "wz__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "wz__progress"
  }, "Schritt ", current + 1, " von ", steps.length), current > 0 && /*#__PURE__*/React.createElement(Button, {
    kind: "tertiary",
    onClick: onPrev
  }, "\u2190 Zur\xFCck"), onCancel && /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    onClick: onCancel
  }, "Speichern und schlie\xDFen"), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    onClick: onNext
  }, nextLabel, " \u2192")));
}
function AuditTrail({
  entries
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "at__list"
  }, entries.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "at__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "at__dot at__dot--" + (e.actor || "system")
  }), /*#__PURE__*/React.createElement("div", {
    className: "at__row"
  }, e.text), /*#__PURE__*/React.createElement("div", {
    className: "at__meta"
  }, e.time))));
}
function UploadZone({
  active,
  onPick,
  onDrop,
  hint = "PDF · max. 20 MB pro Datei"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "uz" + (active ? " uz--active" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "uz__ico"
  }, Icons.Export), /*#__PURE__*/React.createElement("h3", {
    className: "uz__title"
  }, active ? "Loslassen zum Hochladen" : "Belege hierhin ziehen"), /*#__PURE__*/React.createElement("p", {
    className: "uz__sub"
  }, !active && /*#__PURE__*/React.createElement(React.Fragment, null, "oder ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: "#2E78A8",
      textDecoration: "underline",
      cursor: "pointer"
    },
    onClick: onPick
  }, "Dateien ausw\xE4hlen"))), /*#__PURE__*/React.createElement("div", {
    className: "uz__hint"
  }, hint));
}
function Drawer({
  open,
  onClose,
  eyebrow,
  title,
  children,
  actions
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-scrim",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "small"
  }, eyebrow), /*#__PURE__*/React.createElement("h2", null, title)), /*#__PURE__*/React.createElement("button", {
    className: "dr__close",
    onClick: onClose,
    "aria-label": "Schlie\xDFen"
  }, Icons.X)), /*#__PURE__*/React.createElement("div", {
    className: "dr__body"
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    className: "dr__foot"
  }, actions)));
}
Object.assign(window, {
  EmptyState,
  Banner,
  Toast,
  Pagination,
  Skeleton,
  Wizard,
  AuditTrail,
  UploadZone,
  Drawer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Dashboard.jsx
try { (() => {
// Ludwig — Dashboard view (Kanzlei-Übersicht)
// Rich first-screen: KPI tiles, today's queue, USt-Deadlines, recent activity,
// mini revenue chart, top mandants, todo for Steuerberater.

function MiniBars({
  data
}) {
  const max = Math.max(...data);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 4,
      height: 56
    }
  }, data.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: `${v / max * 100}%`,
      background: i === data.length - 1 ? "#1A3A5C" : "#C7DFEC",
      borderRadius: "2px 2px 0 0",
      minHeight: 4
    }
  })));
}
function Sparkline({
  data,
  color = "#3B8FC4"
}) {
  const w = 120,
    h = 32,
    pad = 2;
  const max = Math.max(...data),
    min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + i / (data.length - 1) * (w - pad * 2);
    const y = h - pad - (v - min) / range * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    viewBox: `0 0 ${w} ${h}`,
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("polyline", {
    points: pts,
    fill: "none",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }));
}
function Dashboard({
  onNavigate
}) {
  const heute = new Date(2026, 3, 24).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-h",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lw-overline",
    style: {
      color: "#5C5C5C",
      marginBottom: 4
    }
  }, "Kanzlei Hofmann \xB7 ", heute), /*#__PURE__*/React.createElement("h1", null, "Guten Morgen, Herr Hofmann."), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Ludwig hat \xFCber Nacht ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "#1A3A5C",
      fontWeight: 600
    }
  }, "47 Belege"), " f\xFCr 6 Mandanten vorkontiert.")), /*#__PURE__*/React.createElement("div", {
    className: "actions"
  }, /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    icon: Icons.Plus
  }, "Beleg hochladen"), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    icon: Icons.Export
  }, "Gepr\xFCfte exportieren"))), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Posteingang heute"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "47"), /*#__PURE__*/React.createElement(Sparkline, {
    data: [18, 22, 19, 28, 24, 31, 47]
  })), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, "+12 gegen\xFCber Vortag")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Durchsatz April"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "1.284"), /*#__PURE__*/React.createElement(Sparkline, {
    data: [820, 940, 1010, 1120, 1180, 1240, 1284],
    color: "#3F7A5A"
  })), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, "Belege seit Periodenbeginn")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "R\xFCckfragen offen"), /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "3"), /*#__PURE__*/React.createElement("div", {
    className: "delta",
    style: {
      color: "#B07B2C"
    }
  }, "1 Mandant wartet seit 2 Tagen")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Bereit zum Export"), /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "156"), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, "Periode 04 / 2026 \xB7 ausgeglichen"))), /*#__PURE__*/React.createElement("div", {
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Heute zu pr\xFCfen"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate && onNavigate("posteingang");
    },
    style: {
      color: "#2E78A8",
      textDecoration: "none",
      fontWeight: 500
    }
  }, "Posteingang \xF6ffnen \u2192"))), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Mandant"), /*#__PURE__*/React.createElement("th", null, "Beleg"), /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Betrag"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mand-avatar",
    style: {
      background: "#1A3A5C"
    }
  }, "BG"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, "Berger GmbH"), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub"
  }, "10024")))), /*#__PURE__*/React.createElement("td", null, "Telekom 04/2026"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, "4925"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 Telefon")), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, "79,90 \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "In Pr\xFCfung"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mand-avatar",
    style: {
      background: "#2E78A8"
    }
  }, "AL"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, "Architekturb\xFCro Lindner"), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub"
  }, "10031")))), /*#__PURE__*/React.createElement("td", null, "Honorarrechnung 04/02"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, "8400"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 Erl\xF6se 19 %")), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, "8.450,00 \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "In Pr\xFCfung"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mand-avatar",
    style: {
      background: "#3F7A5A"
    }
  }, "HS"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, "Hofmeier & S\xF6hne KG"), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub"
  }, "10047")))), /*#__PURE__*/React.createElement("td", null, "Office Mayer 04/118"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, "4980"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 B\xFCrobedarf")), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, "348,90 \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "R\xFCckfrage"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mand-avatar",
    style: {
      background: "#B07B2C"
    }
  }, "PK"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, "Praxis Dr. K\xF6hler"), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub"
  }, "10052")))), /*#__PURE__*/React.createElement("td", null, "Stadtwerke M\xFCnchen"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, "4240"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 Strom")), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, "1.247,50 \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Gepr\xFCft"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mand-avatar",
    style: {
      background: "#5BA4D1"
    }
  }, "SW"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, "Schreinerei Wei\xDF"), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub"
  }, "10068")))), /*#__PURE__*/React.createElement("td", null, "DHL Sammelrechnung"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, "4730"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 Verpackung")), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, "127,45 \u20AC"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "In Pr\xFCfung")))))), /*#__PURE__*/React.createElement("div", {
    className: "dash-twocol"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Belege je Werktag \xB7 April"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "\xD8 64 / Tag")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 6,
      height: 120
    }
  }, [42, 58, 71, 53, 68, 74, 61, 49, 55, 82, 71, 65, 58, 77, 92, 68, 71, 84, 79, 66, 58, 73].map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: `${v / 95 * 100}%`,
      background: i === 21 ? "#1A3A5C" : "#C7DFEC",
      borderRadius: "2px 2px 0 0"
    },
    title: `${v} Belege`
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 8,
      fontSize: 11,
      color: "#8A8A8A",
      fontFamily: "var(--font-mono)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "01.04."), /*#__PURE__*/React.createElement("span", null, "10.04."), /*#__PURE__*/React.createElement("span", null, "20.04."), /*#__PURE__*/React.createElement("span", null, "heute")))), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Top Mandanten"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "nach Volumen")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 0"
    }
  }, [{
    name: "Berger GmbH",
    num: "10024",
    count: 312,
    avatar: "#1A3A5C"
  }, {
    name: "Hofmeier & Söhne KG",
    num: "10047",
    count: 287,
    avatar: "#3F7A5A"
  }, {
    name: "Architekturbüro Lindner",
    num: "10031",
    count: 184,
    avatar: "#2E78A8"
  }, {
    name: "Café Mariposa GbR",
    num: "10074",
    count: 156,
    avatar: "#B07B2C"
  }].map(m => /*#__PURE__*/React.createElement("div", {
    key: m.num,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 20px",
      borderBottom: "1px solid #ECEFF3"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mand-avatar",
    style: {
      background: m.avatar
    }
  }, m.name.split(" ").map(w => w[0]).slice(0, 2).join("")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 500,
      color: "#2D2D2D",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "#8A8A8A",
      fontFamily: "var(--font-mono)"
    }
  }, m.num)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: "#1A3A5C",
      fontVariantNumeric: "tabular-nums"
    }
  }, m.count), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A8A8A"
    }
  }, "Belege")))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section deadline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "USt-Voranmeldung"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "10. Mai 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 36,
      fontWeight: 500,
      color: "#1A3A5C",
      lineHeight: 1,
      fontVariantNumeric: "tabular-nums"
    }
  }, "16 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      color: "#5C5C5C",
      fontWeight: 400
    }
  }, "Tage")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#5C5C5C",
      marginTop: 8,
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "#2D2D2D",
      fontWeight: 600
    }
  }, "21 von 24 Mandanten"), " bereit zum Export."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      height: 6,
      background: "#ECEFF3",
      borderRadius: 999,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "87.5%",
      height: "100%",
      background: "#3F7A5A"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    size: "sm",
    icon: Icons.Export
  }, "USt vorbereiten")))), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Ihre Aufgaben"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "3 offen")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 0"
    }
  }, [{
    t: "Rückfrage Hofmeier prüfen",
    s: "Beleg Office Mayer 04/118 — fehlende USt-ID",
    urgent: true
  }, {
    t: "Mandant Café Mariposa freigeben",
    s: "Onboarding abgeschlossen, wartet auf Aktivierung"
  }, {
    t: "Quartalsbesprechung Berger",
    s: "Termin 28.04. · Unterlagen vorbereiten"
  }].map((task, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 10,
      padding: "10px 20px",
      borderBottom: "1px solid #ECEFF3",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      border: "1.5px solid #C4CCD5",
      borderRadius: 3,
      flexShrink: 0,
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 500,
      color: "#2D2D2D"
    }
  }, task.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5C5C",
      marginTop: 2,
      lineHeight: 1.45
    }
  }, task.s)), task.urgent && /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "Dringend"))))), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Ludwig \u2014 Verlauf"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "letzte 24 h")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 16px"
    }
  }, [{
    t: "08:42",
    a: "Ludwig",
    b: "47 Belege vorkontiert",
    c: "Berger GmbH, Lindner u.a."
  }, {
    t: "07:18",
    a: "Ludwig",
    b: "USt-Voranmeldung vorbereitet",
    c: "Praxis Dr. Köhler"
  }, {
    t: "Gestern",
    a: "S. Hofmann",
    b: "Export DATEV freigegeben",
    c: "Berger GmbH · 03/2026"
  }, {
    t: "Gestern",
    a: "Ludwig",
    b: "Rückfrage gestellt",
    c: "Hofmeier & Söhne · USt-ID"
  }].map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 12,
      padding: "8px 0",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "#8A8A8A",
      minWidth: 56,
      paddingTop: 2
    }
  }, e.t), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: e.a === "Ludwig" ? "#3B8FC4" : "#8A8A8A",
      marginTop: 7,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#2D2D2D"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600
    }
  }, e.a), " ", e.b), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8A8A8A",
      marginTop: 1
    }
  }, e.c)))))))));
}
window.Dashboard = Dashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Feedback.jsx
try { (() => {
// Ludwig — Feedback components
// EmptyState · Banner · Toast · ToastStack

const Icons = {
  inbox: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 13l2-7h14l2 7M3 13v6a1 1 0 001 1h16a1 1 0 001-1v-6M3 13h5l1 2h6l1-2h5"
  })),
  search: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 20l-4-4"
  })),
  info: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 11v5M12 8v.01"
  })),
  warn: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 4l9 16H3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 11v4M12 18v.01"
  })),
  check: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12l4 4 10-10"
  })),
  close: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))
};
function EmptyState({
  icon,
  title,
  sub,
  actions,
  inline
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "empty" + (inline ? " empty--inline" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__ico"
  }, icon || Icons.inbox), /*#__PURE__*/React.createElement("h3", {
    className: "empty__title"
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "empty__sub"
  }, sub), actions && /*#__PURE__*/React.createElement("div", {
    className: "empty__actions"
  }, actions));
}
function Banner({
  kind = "info",
  title,
  children,
  action
}) {
  const ico = kind === "danger" || kind === "warning" ? Icons.warn : kind === "success" ? Icons.check : Icons.info;
  return /*#__PURE__*/React.createElement("div", {
    className: "banner banner--" + kind
  }, /*#__PURE__*/React.createElement("span", {
    className: "banner__ico"
  }, ico), /*#__PURE__*/React.createElement("div", {
    className: "banner__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "banner__title"
  }, title), /*#__PURE__*/React.createElement("div", null, children)), action && /*#__PURE__*/React.createElement("button", {
    className: "banner__action",
    onClick: action.onClick
  }, action.label));
}
function Toast({
  kind = "success",
  title,
  sub,
  action,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("span", {
    className: "toast__ico toast__ico--" + kind
  }, kind === "success" ? Icons.check : Icons.warn), /*#__PURE__*/React.createElement("div", {
    className: "toast__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast__title"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "toast__sub"
  }, sub)), action && /*#__PURE__*/React.createElement("button", {
    className: "toast__action",
    onClick: action.onClick
  }, action.label), onClose && /*#__PURE__*/React.createElement("button", {
    className: "toast__action",
    onClick: onClose,
    "aria-label": "Schlie\xDFen",
    style: {
      color: "#8A8A8A"
    }
  }, Icons.close));
}
function ToastStack({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "toast-stack"
  }, children);
}
Object.assign(window, {
  EmptyState,
  Banner,
  Toast,
  ToastStack,
  FeedbackIcons: Icons
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Feedback.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Flow.jsx
try { (() => {
// Ludwig — Wizard, Drawer, Pagination, Skeleton

function Wizard({
  steps,
  current,
  children,
  onPrev,
  onNext,
  prevLabel = "Zurück",
  nextLabel = "Weiter"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "wz"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wz__steps",
    style: {
      gridTemplateColumns: "repeat(" + steps.length + ",1fr)"
    }
  }, steps.map((s, i) => {
    const cls = i < current ? "done" : i === current ? "active" : "";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "wz__step " + cls
    }, /*#__PURE__*/React.createElement("span", {
      className: "wz__num"
    }, i < current ? /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.6"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 12l4 4 10-10"
    })) : i + 1), /*#__PURE__*/React.createElement("div", {
      className: "wz__lbl"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, "Schritt ", i + 1), /*#__PURE__*/React.createElement("span", {
      className: "name"
    }, s)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "wz__body"
  }, children), /*#__PURE__*/React.createElement("div", {
    className: "wz__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "wz__progress"
  }, "Schritt ", current + 1, " von ", steps.length), /*#__PURE__*/React.createElement(Button, {
    kind: "ghost",
    onClick: onPrev,
    disabled: current === 0
  }, prevLabel), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    onClick: onNext
  }, current === steps.length - 1 ? "Abschließen" : nextLabel)));
}
function Drawer({
  title,
  sub,
  onClose,
  footer,
  children,
  width = 460
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-scrim",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "drawer",
    style: {
      width
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dr__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, sub && /*#__PURE__*/React.createElement("div", {
    className: "small"
  }, sub), /*#__PURE__*/React.createElement("h2", null, title)), /*#__PURE__*/React.createElement("button", {
    className: "dr__close",
    onClick: onClose,
    "aria-label": "Schlie\xDFen"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "dr__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "dr__foot"
  }, footer)));
}
function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPage
}) {
  // Build compact page list: 1 … current-1 current current+1 … last
  const pages = [];
  const add = p => pages.push(p);
  if (pageCount <= 7) {
    for (let p = 1; p <= pageCount; p++) add(p);
  } else {
    add(1);
    if (page > 3) add("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p++) add(p);
    if (page < pageCount - 2) add("…");
    add(pageCount);
  }
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return /*#__PURE__*/React.createElement("div", {
    className: "pag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "info"
  }, from.toLocaleString("de-DE"), "\u2013", to.toLocaleString("de-DE"), " von ", total.toLocaleString("de-DE")), /*#__PURE__*/React.createElement("button", {
    className: "page",
    onClick: () => onPage && onPage(page - 1),
    disabled: page === 1
  }, "\u2039"), pages.map((p, i) => p === "…" ? /*#__PURE__*/React.createElement("span", {
    key: "e" + i,
    className: "ellipsis"
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    key: p,
    className: "page" + (p === page ? " active" : ""),
    onClick: () => onPage && onPage(p)
  }, p)), /*#__PURE__*/React.createElement("button", {
    className: "page",
    onClick: () => onPage && onPage(page + 1),
    disabled: page === pageCount
  }, "\u203A"));
}
function Skeleton({
  width = "100%",
  height = 10,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      width,
      height,
      ...style
    }
  });
}
Object.assign(window, {
  Wizard,
  Drawer,
  Pagination,
  Skeleton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Flow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Icons.jsx
try { (() => {
// Shared icons (Lucide-style, 1.5 stroke)
const Icon = ({
  d,
  size = 18,
  strokeWidth = 1.5,
  fill = "none",
  style
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: style
}, d);
const Icons = {
  Inbox: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M22 12h-6l-2 3h-4l-2-3H2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
    }))
  }),
  Receipt: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 8h-8M16 12h-8M13 16h-5"
    }))
  }),
  Users: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "7",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    }))
  }),
  Export: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "17 8 12 3 7 8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "3",
      x2: "12",
      y2: "15"
    }))
  }),
  Chart: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "20",
      x2: "18",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "20",
      x2: "12",
      y2: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "20",
      x2: "6",
      y2: "14"
    }))
  }),
  Home: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"
    }))
  }),
  Settings: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    }))
  }),
  Search: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    })),
    size: 14
  }),
  Bell: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 0 1-3.46 0"
    }))
  }),
  Help: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    }))
  }),
  ChevDown: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    }),
    size: 16
  }),
  ChevLeft: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "15 18 9 12 15 6"
    }),
    size: 16
  }),
  ChevRight: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    }),
    size: 16
  }),
  Check: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })
  }),
  X: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    }))
  }),
  ArrowRight: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    })),
    size: 16
  }),
  ArrowLeft: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "12",
      x2: "5",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 19 5 12 12 5"
    })),
    size: 16
  }),
  Paper: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    })),
    size: 16
  }),
  Plus: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    })),
    size: 16
  }),
  Filter: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement("polygon", {
      points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
    }),
    size: 14
  }),
  Clock: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    }))
  }),
  Alert: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12.01",
      y2: "16"
    }))
  }),
  Book: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
    }))
  }),
  Building: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "4",
      y: "2",
      width: "16",
      height: "20",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"
    }))
  }),
  Tag: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "7",
      y1: "7",
      x2: "7.01",
      y2: "7"
    }))
  }),
  Folder: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement("path", {
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
    })
  }),
  MessageCircle: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement("path", {
      d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    })
  }),
  Sparkle: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3l1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5L12 3z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 17l.9 2.5L22 20l-2.1.5L19 23l-.9-2.5L16 20l2.1-.5L19 17z",
      strokeWidth: "1"
    }))
  }),
  Edit: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
    })),
    size: 14
  }),
  More: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "19",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5",
      cy: "12",
      r: "1"
    }))
  }),
  Eye: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    })),
    size: 14
  }),
  Download: /*#__PURE__*/React.createElement(Icon, {
    d: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    })),
    size: 14
  })
};
window.Icon = Icon;
window.Icons = Icons;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/MandantenDetail.jsx
try { (() => {
// Mandanten-Detail — Stammdaten-Header + Tabs. Drill-down from MandantenList.

function mdStatusBadge(s) {
  if (s === "active") return /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Aktiv");
  if (s === "attention") return /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "Achtung");
  if (s === "onboarding") return /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "Onboarding");
  if (s === "inactive") return /*#__PURE__*/React.createElement(Badge, {
    kind: "neutral"
  }, "Inaktiv");
  return /*#__PURE__*/React.createElement(Badge, null, "?");
}
function mdStammdaten(m) {
  const hrbBase = 100000 + parseInt(m.id, 10) % 99999;
  const fa = {
    "10024": "München III",
    "10031": "München I",
    "10047": "Rosenheim",
    "10052": "München IV",
    "10068": "Erding",
    "10074": "München I",
    "10089": "München II",
    "10095": "Miesbach",
    "10102": "Starnberg",
    "10108": "Freising"
  }[m.id] || "München I";
  const ust = "DE" + (220000000 + parseInt(m.id, 10) * 137).toString().slice(0, 9);
  const skr = m.branche === "Bau" ? "SKR04" : "SKR03";
  const hrb = m.rechtsform === "GmbH" || m.rechtsform === "UG" ? `HRB ${hrbBase}` : m.rechtsform === "KG" ? `HRA ${hrbBase}` : "—";
  return {
    hrb,
    fa,
    ust,
    skr
  };
}
function MandantenDetail({
  mandant,
  onBack
}) {
  const [tab, setTab] = React.useState("uebersicht");
  const m = mandant;
  const sd = mdStammdaten(m);
  const TABS = [["uebersicht", "Übersicht", null], ["belege", "Belege", m.offen], ["buchungen", "Buchungen", null], ["kontakte", "Kreditoren / Debitoren", null], ["konten", "Kontenrahmen", null], ["service", "Service-Kategorien", null], ["klaerungen", "Klärungen", m.klaer], ["stammdaten", "Stammdaten", null]];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      font: "13px var(--font-sans)",
      color: "var(--color-accent-700)",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 0"
    }
  }, Icons.ArrowLeft, " Zur\xFCck zur Mandanten-Liste")), /*#__PURE__*/React.createElement("div", {
    className: "md-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md-hero__avatar",
    style: {
      background: m.color
    }
  }, m.initials), /*#__PURE__*/React.createElement("div", {
    className: "md-hero__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md-hero__top"
  }, /*#__PURE__*/React.createElement("h1", null, m.name), /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, "Mandanten-Nr. ", m.num), mdStatusBadge(m.status)), /*#__PURE__*/React.createElement("div", {
    className: "md-hero__sub"
  }, m.branche, " \xB7 ", m.rechtsform, " \xB7 ", sd.skr), /*#__PURE__*/React.createElement("div", {
    className: "md-hero__facts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md-hero__fact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Handelsregister"), /*#__PURE__*/React.createElement("div", {
    className: "val mono"
  }, sd.hrb)), /*#__PURE__*/React.createElement("div", {
    className: "md-hero__fact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Finanzamt"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, sd.fa)), /*#__PURE__*/React.createElement("div", {
    className: "md-hero__fact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "USt-IdNr."), /*#__PURE__*/React.createElement("div", {
    className: "val mono"
  }, sd.ust)), /*#__PURE__*/React.createElement("div", {
    className: "md-hero__fact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Letzte Aktivit\xE4t"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, m.last)))), /*#__PURE__*/React.createElement("div", {
    className: "md-hero__actions"
  }, /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    size: "sm",
    icon: Icons.Edit
  }, "Bearbeiten"), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    size: "sm",
    icon: Icons.ArrowRight
  }, "In DATEV \xF6ffnen"))), /*#__PURE__*/React.createElement("div", {
    className: "md-tabs"
  }, TABS.map(([k, l, c]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "md-tab" + (tab === k ? " active" : ""),
    onClick: () => setTab(k)
  }, l, c != null && c > 0 && /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, c)))), tab === "uebersicht" && /*#__PURE__*/React.createElement(MdUebersicht, {
    m: m
  }), tab === "belege" && /*#__PURE__*/React.createElement(MdBelege, {
    m: m
  }), tab === "buchungen" && /*#__PURE__*/React.createElement(MdBuchungen, {
    m: m
  }), tab === "kontakte" && /*#__PURE__*/React.createElement(MdKontakte, {
    m: m
  }), tab === "konten" && /*#__PURE__*/React.createElement(MdKonten, {
    m: m,
    sd: sd
  }), tab === "service" && /*#__PURE__*/React.createElement(MdService, {
    m: m
  }), tab === "klaerungen" && /*#__PURE__*/React.createElement(MdKlaerungen, {
    m: m
  }), tab === "stammdaten" && /*#__PURE__*/React.createElement(MdStammdaten, {
    m: m,
    sd: sd
  }));
}
window.MandantenDetail = MandantenDetail;
window.mdStatusBadge = mdStatusBadge;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/MandantenDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/MandantenDetailTabs.jsx
try { (() => {
// Mandanten-Detail — Tab-Inhalte

const MD_LAST_BUCHUNGEN = [{
  date: "23.04.2026",
  konto: "4925",
  bez: "Telefon",
  text: "Telekom Deutschland — Mobilfunk April",
  soll: "79,90",
  haben: ""
}, {
  date: "22.04.2026",
  konto: "8400",
  bez: "Erlöse 19 %",
  text: "Ausgangsrechnung 2026/118",
  soll: "",
  haben: "12.480,00"
}, {
  date: "20.04.2026",
  konto: "4980",
  bez: "Bürobedarf",
  text: "Office Mayer — Bestellung 04/118",
  soll: "348,90",
  haben: ""
}, {
  date: "18.04.2026",
  konto: "4240",
  bez: "Gas, Strom, Wasser",
  text: "Stadtwerke München — Strom Q1/2026",
  soll: "1.247,50",
  haben: ""
}, {
  date: "16.04.2026",
  konto: "4950",
  bez: "Beratungskosten",
  text: "Anwaltskanzlei Schmidt — Vertragsprüfung",
  soll: "890,00",
  haben: ""
}];
function euro(v) {
  return v ? v + " €" : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#C5CCD3"
    }
  }, "\u2014");
}

// ======================= Übersicht =======================
function MdUebersicht({
  m
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Belege offen",
    num: String(m.offen || 0),
    delta: m.offen ? "Ludwig hat vorkontiert" : "alle bearbeitet"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "In Review",
    num: String(m.review || 0),
    delta: "warten auf Freigabe"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Kl\xE4rungen",
    num: String(m.klaer || 0),
    delta: m.klaer ? "Mandant antwortet" : "keine offen"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "USt-VA 04/2026",
    num: m.ust === "overdue" ? "Überfällig" : "Bereit",
    delta: "Abgabe bis 10.05.2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Letzte Buchungen"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "5 von 482 \xB7 04/2026")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", null, "Buchungstext"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Soll"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Haben"))), /*#__PURE__*/React.createElement("tbody", null, MD_LAST_BUCHUNGEN.map((b, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "lw-numeric",
    style: {
      fontSize: 12.5,
      color: "#5C5C5C"
    }
  }, b.date), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, b.konto), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 ", b.bez)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 13
    }
  }, b.text), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, euro(b.soll)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, euro(b.haben)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "USt-Voranmeldung 04/2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C"
    }
  }, "Steuerbarer Umsatz"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: "tabular-nums",
      fontWeight: 500
    }
  }, "48.420,15 \u20AC")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C"
    }
  }, "Vorsteuer"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: "tabular-nums",
      fontWeight: 500
    }
  }, "\u22122.184,30 \u20AC")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 14,
      fontWeight: 600,
      color: "#1A3A5C",
      borderTop: "1px solid var(--color-border)",
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, "Zahllast"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: "tabular-nums"
    }
  }, "7.015,53 \u20AC")), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    size: "sm",
    icon: Icons.Export
  }, "An ELSTER \xFCbermitteln"))), /*#__PURE__*/React.createElement(LudwigNote, {
    label: "Ludwig-Aktivit\xE4t \xB7 7 Tage"
  }, /*#__PURE__*/React.createElement("strong", null, m.offen || 0, " Belege"), " vorkontiert (\xD8 1,8 s/Beleg), ", /*#__PURE__*/React.createElement("strong", null, m.review || 0, " Buchungen"), " zur Freigabe vorgelegt", m.klaer ? /*#__PURE__*/React.createElement(React.Fragment, null, ", ", /*#__PURE__*/React.createElement("strong", null, m.klaer, " R\xFCckfrage", m.klaer === 1 ? "" : "n"), " an den Mandant gesendet") : "", ". Trefferquote 94 %."))));
}

// ======================= Belege =======================
function MdBelege({
  m
}) {
  const belege = [{
    name: "Telekom Deutschland GmbH",
    sub: "Mobilfunk April 2026",
    date: "23.04.2026",
    konto: "4925",
    betrag: "79,90",
    status: "review"
  }, {
    name: "Office Mayer e.K.",
    sub: "Bürobedarf 04/118",
    date: "20.04.2026",
    konto: "4980",
    betrag: "348,90",
    status: "question"
  }, {
    name: "Stadtwerke München",
    sub: "Strom Q1/2026",
    date: "18.04.2026",
    konto: "4240",
    betrag: "1.247,50",
    status: "approved"
  }, {
    name: "DHL Paket",
    sub: "Versandkosten Sammelrechnung",
    date: "15.04.2026",
    konto: "4730",
    betrag: "127,45",
    status: "review"
  }];
  const sb = s => s === "review" ? /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "In Pr\xFCfung") : s === "question" ? /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "R\xFCckfrage") : /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Gepr\xFCft");
  return /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Belege \xB7 04/2026"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, m.offen || 0, " offen")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Beleg"), /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Betrag"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, belege.map((b, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "doc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "doc-thumb"
  }, Icons.Paper), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, b.name), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub"
  }, b.sub)))), /*#__PURE__*/React.createElement("td", {
    className: "lw-numeric"
  }, b.date), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, b.konto)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, b.betrag, " \u20AC"), /*#__PURE__*/React.createElement("td", null, sb(b.status)))))));
}

// ======================= Buchungen =======================
function MdBuchungen({
  m
}) {
  const rows = [...MD_LAST_BUCHUNGEN, {
    date: "15.04.2026",
    konto: "4730",
    bez: "Verpackungsmaterial",
    text: "DHL — Versandkosten Sammel",
    soll: "127,45",
    haben: ""
  }, {
    date: "12.04.2026",
    konto: "1200",
    bez: "Bank",
    text: "Zahlungseingang Maier & Co.",
    soll: "",
    haben: "5.840,00"
  }, {
    date: "08.04.2026",
    konto: "4830",
    bez: "Werkzeuge",
    text: "Würth — Werkzeugbestellung",
    soll: "612,30",
    haben: ""
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Buchungsjournal \xB7 04/2026"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "482 Buchungen")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", null, "Gegenkonto"), /*#__PURE__*/React.createElement("th", null, "Buchungstext"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Soll"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Haben"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((b, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "lw-numeric",
    style: {
      fontSize: 12.5,
      color: "#5C5C5C"
    }
  }, b.date), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, b.konto), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 ", b.bez)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, b.soll ? "1200" : "8400")), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 13
    }
  }, b.text), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, euro(b.soll)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, euro(b.haben)))))));
}
window.MdUebersicht = MdUebersicht;
window.MdBelege = MdBelege;
window.MdBuchungen = MdBuchungen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/MandantenDetailTabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/MandantenDetailTabs2.jsx
try { (() => {
// Mandanten-Detail — weitere Tabs (Kontakte, Konten, Service, Klärungen, Stammdaten)

// ======================= Kreditoren / Debitoren =======================
function MdKontakte({
  m
}) {
  const kred = [["70010", "Telekom Deutschland GmbH", "1", "79,90 €"], ["70011", "Stadtwerke München", "0", "0,00 €"], ["70024", "Office Mayer e.K.", "0", "0,00 €"], ["70032", "DHL Paket Service", "2", "287,55 €"], ["70041", "Würth GmbH & Co. KG", "1", "612,30 €"]];
  const deb = [["10001", "Maier & Co. GmbH", "1", "12.480,00 €"], ["10008", "Schreinerei Brandl", "1", "5.840,00 €"], ["10014", "Bauherr Vogel", "2", "3.200,00 €"], ["10022", "Privatkunde Müller", "0", "0,00 €"]];
  const Tbl = ({
    title,
    kontoLbl,
    rows
  }) => /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, rows.length, " Konten")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Offene Posten"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Saldo"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, r[0])), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, r[1]), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, r[2] === "0" ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#C5CCD3"
    }
  }, "\u2014") : r[2]), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, r[3]))))));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Tbl, {
    title: "Kreditoren",
    rows: kred
  }), /*#__PURE__*/React.createElement(Tbl, {
    title: "Debitoren",
    rows: deb
  }));
}

// ======================= Kontenrahmen =======================
function MdKonten({
  m,
  sd
}) {
  const konten = {
    "Handel": [["3400", "Wareneingang 19 % VSt", "aktiv"], ["8400", "Erlöse 19 % USt", "aktiv"], ["1200", "Bank", "aktiv"], ["1600", "Kasse", "aktiv"], ["4980", "Bürobedarf", "aktiv"]],
    "Dienstleistung": [["8400", "Erlöse aus Dienstleistungen", "aktiv"], ["4925", "Telefon", "aktiv"], ["4910", "Sonstige Aufwendungen", "aktiv"], ["1200", "Bank", "aktiv"]],
    "Bau": [["3300", "Bauleistungen 19 %", "aktiv"], ["8337", "Erlöse §13b UStG", "aktiv"], ["3400", "Wareneingang 19 %", "aktiv"], ["4830", "Werkzeuge", "aktiv"], ["1200", "Bank", "aktiv"]],
    "Heilberuf": [["8300", "Erlöse §4 Nr.14 UStG", "aktiv"], ["4980", "Praxisbedarf", "aktiv"], ["4925", "Telefon", "aktiv"], ["1200", "Bank", "aktiv"]],
    "Gastronomie": [["8400", "Erlöse 19 %", "aktiv"], ["8300", "Erlöse 7 % (Speisen)", "aktiv"], ["3400", "Wareneingang", "aktiv"], ["1600", "Kasse", "aktiv"]]
  }[m.branche] || [["8400", "Erlöse 19 % USt", "aktiv"], ["4925", "Telefon", "aktiv"], ["1200", "Bank", "aktiv"]];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px",
      display: "flex",
      gap: 32,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "#8A8A8A",
      fontWeight: 600
    }
  }, "Kontenrahmen"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: "#1A3A5C",
      fontFamily: "var(--font-mono)"
    }
  }, sd.skr)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "#8A8A8A",
      fontWeight: 600
    }
  }, "Branche"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: "#1A3A5C"
    }
  }, m.branche)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "#8A8A8A",
      fontWeight: 600
    }
  }, "Aktive Konten"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: "#1A3A5C"
    }
  }, konten.length)))), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Branchentypische Konten")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", null, "Bezeichnung"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, konten.map((k, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, k[0])), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, k[1]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Aktiv"))))))));
}

// ======================= Service-Kategorien =======================
function MdService({
  m
}) {
  const services = [["Finanzbuchhaltung", "Laufende Buchführung, Belegerfassung, OP-Verwaltung", true], ["Umsatzsteuer-Voranmeldung", "Monatliche USt-VA, ELSTER-Übermittlung", true], ["Lohnabrechnung", "Gehaltsabrechnung, Meldungen an Sozialversicherung", m.branche !== "Heilberuf"], ["Jahresabschluss", "Bilanz, GuV, E-Bilanz", m.rechtsform === "GmbH" || m.rechtsform === "UG" || m.rechtsform === "KG"], ["Einnahmenüberschussrechnung", "EÜR nach §4 Abs. 3 EStG", m.rechtsform === "GbR" || m.rechtsform === "e.K." || m.rechtsform === "Einzelunternehmen"], ["Betriebswirtschaftliche Auswertung", "Monatliche BWA, Soll-Ist-Vergleich", false]];
  return /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Service-Kategorien"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, services.filter(s => s[2]).length, " aktiv")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Leistung"), /*#__PURE__*/React.createElement("th", null, "Umfang"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Status"))), /*#__PURE__*/React.createElement("tbody", null, services.map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, s[0]), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 13,
      color: "#5C5C5C"
    }
  }, s[1]), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    }
  }, s[2] ? /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Beauftragt") : /*#__PURE__*/React.createElement(Badge, {
    kind: "neutral"
  }, "Nicht beauftragt")))))));
}

// ======================= Klärungen =======================
function MdKlaerungen({
  m
}) {
  const all = [{
    date: "22.04.2026",
    betreff: "Bewirtungsbeleg ohne Anlass-Vermerk",
    detail: "Beleg #04-118 — bitte Bewirtungsanlass und Teilnehmer nachreichen.",
    status: "offen"
  }, {
    date: "19.04.2026",
    betreff: "Rechnung mit Vorjahresdatum",
    detail: "Zuordnung zu Wirtschaftsjahr 2025 oder 2026?",
    status: "antwort"
  }, {
    date: "12.04.2026",
    betreff: "USt-Schlüssel bei §13b UStG unklar",
    detail: "Reverse-Charge bestätigt, Buchung angepasst.",
    status: "geschlossen"
  }].slice(0, Math.max(m.klaer || 0, 1));
  const sb = s => s === "offen" ? /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "Offen") : s === "antwort" ? /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "Antwort erhalten") : /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Geschlossen");
  return /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Kl\xE4rungen"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, m.klaer || 0, " offen")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Betreff"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, all.map((k, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "lw-numeric",
    style: {
      fontSize: 12.5,
      color: "#5C5C5C",
      verticalAlign: "top"
    }
  }, k.date), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, k.betreff), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#5C5C5C",
      marginTop: 2
    }
  }, k.detail)), /*#__PURE__*/React.createElement("td", {
    style: {
      verticalAlign: "top"
    }
  }, sb(k.status)))))));
}

// ======================= Stammdaten =======================
function MdStammdaten({
  m,
  sd
}) {
  const Row = ({
    k,
    v,
    mono
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid var(--color-border-subtle)",
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontFamily: mono ? "var(--font-mono)" : "inherit",
      fontSize: mono ? 12.5 : 13.5
    }
  }, v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Firmendaten")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 20px 12px"
    }
  }, /*#__PURE__*/React.createElement(Row, {
    k: "Firmenname",
    v: m.name
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Mandanten-Nr.",
    v: m.num,
    mono: true
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Rechtsform",
    v: m.rechtsform
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Branche",
    v: m.branche
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Handelsregister",
    v: sd.hrb,
    mono: true
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Anschrift",
    v: "Musterstra\xDFe 12, 80331 M\xFCnchen"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Steuerliche Daten")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 20px 12px"
    }
  }, /*#__PURE__*/React.createElement(Row, {
    k: "Finanzamt",
    v: sd.fa
  }), /*#__PURE__*/React.createElement(Row, {
    k: "USt-IdNr.",
    v: sd.ust,
    mono: true
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Steuernummer",
    v: "143/" + m.id.slice(1) + "/00021",
    mono: true
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Kontenrahmen",
    v: sd.skr,
    mono: true
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Besteuerung",
    v: m.rechtsform === "GmbH" ? "Soll-Versteuerung" : "Ist-Versteuerung"
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Voranmeldung",
    v: "monatlich"
  }))));
}
window.MdKontakte = MdKontakte;
window.MdKonten = MdKonten;
window.MdService = MdService;
window.MdKlaerungen = MdKlaerungen;
window.MdStammdaten = MdStammdaten;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/MandantenDetailTabs2.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/MandantenList.jsx
try { (() => {
// Mandanten-Liste — gemäß Brief
// Spalten: Mandant, Mandanten-Nr, Branche, Letzte Aktivität, Offene Vorgänge, Status

const MANDANTEN_DATA = [{
  id: "10024",
  num: "10024",
  name: "Berger GmbH",
  initials: "BG",
  color: "#1A3A5C",
  branche: "Handel",
  rechtsform: "GmbH",
  offen: 23,
  review: 5,
  klaer: 1,
  last: "heute, 09:14",
  status: "active",
  ust: "ready"
}, {
  id: "10031",
  num: "10031",
  name: "Architekturbüro Lindner",
  initials: "AL",
  color: "#2E78A8",
  branche: "Dienstleistung",
  rechtsform: "PartG",
  offen: 8,
  review: 2,
  klaer: 0,
  last: "heute, 08:42",
  status: "active",
  ust: "ready"
}, {
  id: "10047",
  num: "10047",
  name: "Hofmeier & Söhne KG",
  initials: "HS",
  color: "#3F7A5A",
  branche: "Bau",
  rechtsform: "KG",
  offen: 47,
  review: 12,
  klaer: 3,
  last: "gestern, 17:30",
  status: "attention",
  ust: "overdue"
}, {
  id: "10052",
  num: "10052",
  name: "Praxis Dr. Köhler",
  initials: "PK",
  color: "#B07B2C",
  branche: "Heilberuf",
  rechtsform: "Einzelunternehmen",
  offen: 4,
  review: 1,
  klaer: 0,
  last: "heute, 11:08",
  status: "active",
  ust: "ready"
}, {
  id: "10068",
  num: "10068",
  name: "Schreinerei Weiß",
  initials: "SW",
  color: "#5BA4D1",
  branche: "Handwerk",
  rechtsform: "e.K.",
  offen: 19,
  review: 6,
  klaer: 2,
  last: "heute, 07:55",
  status: "active",
  ust: "ready"
}, {
  id: "10074",
  num: "10074",
  name: "Café Mariposa GbR",
  initials: "CM",
  color: "#A8403C",
  branche: "Gastronomie",
  rechtsform: "GbR",
  offen: 31,
  review: 8,
  klaer: 1,
  last: "heute, 06:12",
  status: "active",
  ust: "ready"
}, {
  id: "10089",
  num: "10089",
  name: "Yildiz Logistik UG",
  initials: "YL",
  color: "#2E78A8",
  branche: "Logistik",
  rechtsform: "UG",
  offen: 12,
  review: 3,
  klaer: 0,
  last: "21.04.2026",
  status: "active",
  ust: "ready"
}, {
  id: "10095",
  num: "10095",
  name: "Pension Sonnental",
  initials: "PS",
  color: "#3F7A5A",
  branche: "Beherbergung",
  rechtsform: "GmbH",
  offen: 0,
  review: 0,
  klaer: 0,
  last: "18.04.2026",
  status: "onboarding",
  ust: "n/a"
}, {
  id: "10102",
  num: "10102",
  name: "Köhler Consulting",
  initials: "KC",
  color: "#1A3A5C",
  branche: "Beratung",
  rechtsform: "GmbH",
  offen: 6,
  review: 0,
  klaer: 0,
  last: "17.04.2026",
  status: "active",
  ust: "ready"
}, {
  id: "10108",
  num: "10108",
  name: "Bäckerei Reiser",
  initials: "BR",
  color: "#B07B2C",
  branche: "Lebensmittel",
  rechtsform: "e.K.",
  offen: 0,
  review: 0,
  klaer: 0,
  last: "10.03.2026",
  status: "inactive",
  ust: "n/a"
}];
function mandantStatusBadge(s) {
  if (s === "active") return /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Aktiv");
  if (s === "attention") return /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "Achtung");
  if (s === "onboarding") return /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "Onboarding");
  if (s === "inactive") return /*#__PURE__*/React.createElement(Badge, {
    kind: "neutral"
  }, "Inaktiv");
  return /*#__PURE__*/React.createElement(Badge, null, "?");
}
function ustBadge(s) {
  if (s === "ready") return /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Bereit");
  if (s === "overdue") return /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "\xDCberf\xE4llig");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#8A8A8A"
    }
  }, "\u2014");
}
function MandantenList({
  onSelect
}) {
  const [tab, setTab] = React.useState("alle");
  const [q, setQ] = React.useState("");
  const filtered = MANDANTEN_DATA.filter(m => {
    if (tab === "alle" && true) {}
    if (tab === "active" && m.status !== "active") return false;
    if (tab === "attention" && m.status !== "attention") return false;
    if (tab === "onboarding" && m.status !== "onboarding") return false;
    if (tab === "inactive" && m.status !== "inactive") return false;
    if (q && !(m.name.toLowerCase().includes(q.toLowerCase()) || m.num.includes(q))) return false;
    return true;
  });
  const counts = {
    alle: MANDANTEN_DATA.length,
    active: MANDANTEN_DATA.filter(m => m.status === "active").length,
    attention: MANDANTEN_DATA.filter(m => m.status === "attention").length,
    onboarding: MANDANTEN_DATA.filter(m => m.status === "onboarding").length,
    inactive: MANDANTEN_DATA.filter(m => m.status === "inactive").length
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Mandanten",
    sub: `${counts.alle} Mandanten · ${counts.active} aktiv · ${counts.attention} mit offenen Klärungen · ${counts.onboarding} im Onboarding`,
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      icon: Icons.Download
    }, "Liste exportieren"), /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      icon: Icons.Plus
    }, "Mandant hinzuf\xFCgen"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__filters"
  }, [["alle", "Alle", counts.alle], ["active", "Aktiv", counts.active], ["attention", "Achtung", counts.attention], ["onboarding", "Onboarding", counts.onboarding], ["inactive", "Inaktiv", counts.inactive]].map(([k, l, c]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    className: "tab" + (tab === k ? " active" : ""),
    onClick: () => setTab(k)
  }, l, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#8A8A8A",
      marginLeft: 4,
      fontVariantNumeric: "tabular-nums"
    }
  }, c))), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "filter-search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, Icons.Search), /*#__PURE__*/React.createElement("input", {
    placeholder: "Name oder Mandanten-Nr.",
    value: q,
    onChange: e => setQ(e.target.value)
  }))), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Mandant"), /*#__PURE__*/React.createElement("th", null, "Branche \xB7 Rechtsform"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Offen"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Review"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Kl\xE4rung"), /*#__PURE__*/React.createElement("th", null, "Letzte Aktivit\xE4t"), /*#__PURE__*/React.createElement("th", null, "USt-VA"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.id,
    onClick: () => onSelect && onSelect(m)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "doc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mand-avatar",
    style: {
      background: m.color,
      width: 32,
      height: 32,
      borderRadius: 4
    }
  }, m.initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, m.name), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub",
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, m.num)))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13
    }
  }, m.branche), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "#8A8A8A"
    }
  }, m.rechtsform)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, m.offen || "—"), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, m.review ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: m.review > 5 ? "#B07B2C" : undefined
    }
  }, m.review) : "—"), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, m.klaer ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#B07B2C"
    }
  }, m.klaer) : "—"), /*#__PURE__*/React.createElement("td", {
    className: "lw-numeric",
    style: {
      fontSize: 12.5,
      color: "#5C5C5C"
    }
  }, m.last), /*#__PURE__*/React.createElement("td", null, ustBadge(m.ust)), /*#__PURE__*/React.createElement("td", null, mandantStatusBadge(m.status)))), filtered.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "8",
    style: {
      textAlign: "center",
      padding: 32,
      color: "#8A8A8A",
      fontSize: 13
    }
  }, "Keine Mandanten gefunden."))))));
}
window.MandantenList = MandantenList;
window.MANDANTEN_DATA = MANDANTEN_DATA;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/MandantenList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Primitives.jsx
try { (() => {
function Badge({
  kind = "neutral",
  children,
  dot
}) {
  const dotColor = {
    info: "#3B8FC4",
    success: "#3F7A5A",
    warning: "#B07B2C",
    neutral: "#8A8A8A"
  }[kind];
  return /*#__PURE__*/React.createElement("span", {
    className: "bdg bdg-" + kind
  }, dot !== false && /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: dotColor
    }
  }), children);
}
function Button({
  kind = "primary",
  size,
  icon,
  children,
  onClick,
  disabled
}) {
  const cls = ["btn", "btn-" + kind, size === "sm" ? "btn-sm" : ""].join(" ").trim();
  return /*#__PURE__*/React.createElement("button", {
    className: cls,
    onClick: onClick,
    disabled: disabled
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, icon), children);
}
function PageHeader({
  title,
  sub,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "page-h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, sub)), actions && /*#__PURE__*/React.createElement("div", {
    className: "actions"
  }, actions));
}
function Stat({
  label,
  num,
  delta
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, num), delta && /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, delta));
}
function LudwigNote({
  label = "Ludwig schlägt vor",
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "lw-note"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mark"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, label), /*#__PURE__*/React.createElement("div", null, children)));
}
window.Badge = Badge;
window.Button = Button;
window.PageHeader = PageHeader;
window.Stat = Stat;
window.LudwigNote = LudwigNote;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Review.jsx
try { (() => {
// Ludwig — Review & Audit components
// ReviewItemCard · AuditTrail · ConfidenceIndicator (re-usable)

function ConfidencePill({
  level
}) {
  const cls = level >= 0.85 ? "ri__pill--high" : level >= 0.6 ? "ri__pill--med" : "ri__pill--low";
  const label = level >= 0.85 ? "Hoch" : level >= 0.6 ? "Mittel" : "Niedrig";
  return /*#__PURE__*/React.createElement("span", {
    className: "ri__pill " + cls
  }, label, " \xB7 ", Math.round(level * 100), " %");
}
function ReviewItemCard({
  num,
  title,
  confidence,
  before,
  ludwig,
  fieldLabel,
  children,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ri"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ri__head"
  }, num && /*#__PURE__*/React.createElement("span", {
    className: "ri__num"
  }, num), /*#__PURE__*/React.createElement("span", {
    className: "ri__title"
  }, title), confidence != null && /*#__PURE__*/React.createElement(ConfidencePill, {
    level: confidence
  })), /*#__PURE__*/React.createElement("div", {
    className: "ri__body"
  }, children, (before || ludwig) && /*#__PURE__*/React.createElement("div", {
    className: "ri__compare"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ri__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, fieldLabel || "Bisher"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, before)), /*#__PURE__*/React.createElement("div", {
    className: "ri__col ri__col--ludwig"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Ludwig schl\xE4gt vor"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, ludwig)))), actions && /*#__PURE__*/React.createElement("div", {
    className: "ri__actions"
  }, actions));
}
function AuditTrail({
  heading = "Verlauf",
  items
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "at"
  }, /*#__PURE__*/React.createElement("div", {
    className: "at__h"
  }, heading), /*#__PURE__*/React.createElement("div", {
    className: "at__list"
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "at__item",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "at__dot at__dot--" + (it.actor || "system")
  }), /*#__PURE__*/React.createElement("div", {
    className: "at__row"
  }, /*#__PURE__*/React.createElement("strong", null, it.who), " ", it.what, it.field && /*#__PURE__*/React.createElement(React.Fragment, null, " ", /*#__PURE__*/React.createElement("span", {
    className: "field"
  }, it.field)), it.from != null && /*#__PURE__*/React.createElement(React.Fragment, null, " von ", /*#__PURE__*/React.createElement("span", {
    className: "field"
  }, it.from), " auf ", /*#__PURE__*/React.createElement("span", {
    className: "field"
  }, it.to))), /*#__PURE__*/React.createElement("div", {
    className: "at__meta"
  }, it.when)))));
}
Object.assign(window, {
  ReviewItemCard,
  AuditTrail,
  ConfidencePill
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Review.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Screens.jsx
try { (() => {
const SAMPLE_BELEGE = [{
  id: 1,
  name: "Telekom Deutschland GmbH",
  sub: "Mobilfunk April 2026",
  date: "23.04.2026",
  konto: "4925",
  kontoBez: "Telefon",
  betrag: "79,90",
  ust: "19 %",
  status: "review",
  kind: "Eingangsrechnung"
}, {
  id: 2,
  name: "Berger GmbH",
  sub: "Ausgangsrechnung 2026/118",
  date: "22.04.2026",
  konto: "8400",
  kontoBez: "Erlöse 19 %",
  betrag: "12.480,00",
  ust: "19 %",
  status: "review",
  kind: "Ausgangsrechnung"
}, {
  id: 3,
  name: "Office Mayer e.K.",
  sub: "Bürobedarf Bestellung 04/118",
  date: "20.04.2026",
  konto: "4980",
  kontoBez: "Bürobedarf",
  betrag: "348,90",
  ust: "19 %",
  status: "question",
  kind: "Eingangsrechnung"
}, {
  id: 4,
  name: "Stadtwerke München",
  sub: "Strom Q1/2026",
  date: "18.04.2026",
  konto: "4240",
  kontoBez: "Gas, Strom, Wasser",
  betrag: "1.247,50",
  ust: "19 %",
  status: "approved",
  kind: "Eingangsrechnung"
}, {
  id: 5,
  name: "Anwaltskanzlei Schmidt",
  sub: "Beratung Vertragsprüfung",
  date: "16.04.2026",
  konto: "4950",
  kontoBez: "Rechts- und Beratungskosten",
  betrag: "890,00",
  ust: "19 %",
  status: "approved",
  kind: "Eingangsrechnung"
}, {
  id: 6,
  name: "DHL Paket",
  sub: "Versandkosten Sammelrechnung",
  date: "15.04.2026",
  konto: "4730",
  kontoBez: "Verpackungsmaterial",
  betrag: "127,45",
  ust: "19 %",
  status: "review",
  kind: "Eingangsrechnung"
}];
function statusBadge(s) {
  if (s === "review") return /*#__PURE__*/React.createElement(Badge, {
    kind: "info"
  }, "In Pr\xFCfung");
  if (s === "question") return /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "R\xFCckfrage");
  if (s === "approved") return /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Gepr\xFCft");
  return /*#__PURE__*/React.createElement(Badge, null, "Entwurf");
}
function Posteingang({
  onSelectBeleg
}) {
  const [tab, setTab] = React.useState("alle");
  const filtered = tab === "alle" ? SAMPLE_BELEGE : tab === "review" ? SAMPLE_BELEGE.filter(b => b.status === "review") : tab === "question" ? SAMPLE_BELEGE.filter(b => b.status === "question") : SAMPLE_BELEGE.filter(b => b.status === "approved");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Posteingang",
    sub: "Ludwig hat 47 neue Belege vorkontiert. Bitte pr\xFCfen und freigeben.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      icon: Icons.Plus
    }, "Beleg hochladen"), /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      icon: Icons.Export
    }, "Gepr\xFCfte exportieren"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Heute eingegangen",
    num: "47",
    delta: "+12 gegen\xFCber Vortag"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "In Pr\xFCfung",
    num: "34",
    delta: "durchschnittlich 2 Min/Beleg"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "R\xFCckfragen",
    num: "3",
    delta: "warten auf Mandant"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Bereit zum Export",
    num: "156",
    delta: "Periode April 2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Belege \xB7 April 2026"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, filtered.length, " von ", SAMPLE_BELEGE.length)), /*#__PURE__*/React.createElement("div", {
    className: "section__filters"
  }, [["alle", "Alle"], ["review", "In Prüfung"], ["question", "Rückfragen"], ["approved", "Geprüft"]].map(([k, l]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    className: "tab" + (tab === k ? " active" : ""),
    onClick: () => setTab(k)
  }, l)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "tab"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 6,
      alignItems: "center"
    }
  }, Icons.Filter, " Filter"))), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Beleg"), /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Art"), /*#__PURE__*/React.createElement("th", null, "Konto"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Betrag"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(b => /*#__PURE__*/React.createElement("tr", {
    key: b.id,
    onClick: () => onSelectBeleg(b)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "doc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "doc-thumb"
  }, Icons.Paper), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, b.name), /*#__PURE__*/React.createElement("div", {
    className: "doc-sub"
  }, b.sub)))), /*#__PURE__*/React.createElement("td", {
    className: "lw-numeric"
  }, b.date), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    kind: "neutral",
    dot: false
  }, b.kind)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "acct"
  }, b.konto), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5C5C",
      fontSize: 12
    }
  }, "\xB7 ", b.kontoBez)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, b.betrag, " \u20AC"), /*#__PURE__*/React.createElement("td", null, statusBadge(b.status))))))));
}
function BelegDetail({
  beleg,
  onBack,
  onApprove
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    title: beleg.name,
    sub: `${beleg.kind} · Eingegangen ${beleg.date} · 1,2 MB · PDF`,
    actions: /*#__PURE__*/React.createElement(Button, {
      kind: "tertiary",
      onClick: onBack
    }, "\u2190 Zur\xFCck zum Posteingang")
  }), /*#__PURE__*/React.createElement("div", {
    className: "split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "viewer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "doc-page"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "1px solid #DDE2E8",
      paddingBottom: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      color: "#1A3A5C"
    }
  }, beleg.name), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#5C5C5C"
    }
  }, "Musterstra\xDFe 12 \xB7 80331 M\xFCnchen")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontSize: 10,
      color: "#5C5C5C"
    }
  }, /*#__PURE__*/React.createElement("div", null, "Rechnung Nr. 2026-04-", beleg.id.toString().padStart(4, "0")), /*#__PURE__*/React.createElement("div", null, "Datum: ", beleg.date))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      color: "#5C5C5C"
    }
  }, "An:", /*#__PURE__*/React.createElement("br", null), "Steuerkanzlei Hofmann \xB7 Maximilianstr. 8 \xB7 80539 M\xFCnchen"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 10,
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "1px solid #DDE2E8"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "left",
      padding: 4
    }
  }, "Pos"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "left",
      padding: 4
    }
  }, "Beschreibung"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right",
      padding: 4
    }
  }, "Betrag"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 4
    }
  }, "1"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 4
    }
  }, beleg.sub), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 4,
      textAlign: "right"
    }
  }, beleg.betrag, " \u20AC")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      paddingTop: 12,
      borderTop: "1px solid #DDE2E8",
      display: "flex",
      justifyContent: "flex-end",
      gap: 24,
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#5C5C5C"
    }
  }, "Netto"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#5C5C5C",
      marginTop: 2
    }
  }, "USt ", beleg.ust), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontWeight: 600
    }
  }, "Gesamt")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontVariantNumeric: "tabular-nums"
    }
  }, /*#__PURE__*/React.createElement("div", null, beleg.betrag, " \u20AC"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontWeight: 600
    }
  }, beleg.betrag, " \u20AC"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "small"
  }, "Vorkontierung"), /*#__PURE__*/React.createElement("h2", null, "Vorgeschlagene Buchung")), /*#__PURE__*/React.createElement("div", {
    className: "detail-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Konto"), /*#__PURE__*/React.createElement("span", {
    className: "v lw-mono",
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, beleg.konto, " \xB7 ", beleg.kontoBez)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Gegenkonto"), /*#__PURE__*/React.createElement("span", {
    className: "v lw-mono",
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, "1200 \xB7 Bank")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "USt-Schl\xFCssel"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "9 \xB7 ", beleg.ust, " Vorsteuer")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Buchungstext"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, beleg.sub)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Betrag"), /*#__PURE__*/React.createElement("span", {
    className: "v lw-numeric",
    style: {
      fontVariantNumeric: "tabular-nums"
    }
  }, beleg.betrag, " \u20AC")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Belegdatum"), /*#__PURE__*/React.createElement("span", {
    className: "v lw-numeric"
  }, beleg.date)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Periode"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "04 / 2026"))), /*#__PURE__*/React.createElement("div", {
    className: "detail-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    size: "sm"
  }, "Bearbeiten"), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    size: "sm",
    icon: Icons.Check,
    onClick: onApprove
  }, "Freigeben"))), /*#__PURE__*/React.createElement(LudwigNote, null, "Konto ", /*#__PURE__*/React.createElement("strong", null, beleg.konto, " \xB7 ", beleg.kontoBez), " aufgrund Lieferant und Buchungstext gew\xE4hlt. Bei den letzten 8 Buchungen dieses Lieferanten wurde dasselbe Konto verwendet."), /*#__PURE__*/React.createElement("div", {
    className: "detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "small"
  }, "Verlauf")), /*#__PURE__*/React.createElement("div", {
    className: "detail-body",
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      padding: "6px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "#3B8FC4",
      marginTop: 8,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Ludwig"), " hat den Beleg vorkontiert.", /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#8A8A8A",
      fontSize: 12
    }
  }, beleg.date, " \xB7 09:14"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      padding: "6px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "#8A8A8A",
      marginTop: 8,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, "Beleg per E-Mail eingegangen.", /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#8A8A8A",
      fontSize: 12
    }
  }, beleg.date, " \xB7 09:12"))))))));
}
function Mandanten() {
  const list = [{
    num: "10024",
    name: "Berger GmbH",
    offen: 23,
    last: "31.03.2026",
    status: "ok"
  }, {
    num: "10031",
    name: "Architekturbüro Lindner",
    offen: 8,
    last: "31.03.2026",
    status: "ok"
  }, {
    num: "10047",
    name: "Hofmeier & Söhne KG",
    offen: 47,
    last: "28.02.2026",
    status: "warn"
  }, {
    num: "10052",
    name: "Praxis Dr. Köhler",
    offen: 4,
    last: "31.03.2026",
    status: "ok"
  }, {
    num: "10068",
    name: "Schreinerei Weiß",
    offen: 19,
    last: "31.03.2026",
    status: "ok"
  }, {
    num: "10074",
    name: "Café Mariposa GbR",
    offen: 31,
    last: "31.03.2026",
    status: "ok"
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Mandanten",
    sub: "24 aktive Mandanten in Ihrer Kanzlei",
    actions: /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      icon: Icons.Plus
    }, "Mandant hinzuf\xFCgen")
  }), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Alle Mandanten"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, "24 Mandanten")), /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Mandant"), /*#__PURE__*/React.createElement("th", null, "Nummer"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Offene Vorg\xE4nge"), /*#__PURE__*/React.createElement("th", null, "Letzter Export"), /*#__PURE__*/React.createElement("th", null, "USt-Voranmeldung"))), /*#__PURE__*/React.createElement("tbody", null, list.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.num
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "doc"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 4,
      background: "#1A3A5C",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      fontWeight: 600
    }
  }, m.name.split(" ").map(w => w[0]).slice(0, 2).join("")), /*#__PURE__*/React.createElement("div", {
    className: "doc-name"
  }, m.name))), /*#__PURE__*/React.createElement("td", {
    className: "acct"
  }, m.num), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, m.offen), /*#__PURE__*/React.createElement("td", {
    className: "lw-numeric"
  }, m.last), /*#__PURE__*/React.createElement("td", null, m.status === "ok" ? /*#__PURE__*/React.createElement(Badge, {
    kind: "success"
  }, "Bereit") : /*#__PURE__*/React.createElement(Badge, {
    kind: "warning"
  }, "\xDCberf\xE4llig"))))))));
}
function Export_() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "DATEV-Export",
    sub: "Periode April 2026 \xB7 Mandant Berger GmbH (10024)"
  }), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Gepr\xFCft",
    num: "156",
    delta: "bereit zum Export"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Offen",
    num: "34",
    delta: "noch in Pr\xFCfung"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Summe Soll",
    num: "48.420,15 \u20AC"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Summe Haben",
    num: "48.420,15 \u20AC",
    delta: "ausgeglichen"
  })), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Export-Pakete")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: "flex",
      gap: 16,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 72,
      background: "#F4F6F8",
      border: "1px solid #DDE2E8",
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#5C5C5C",
      fontFamily: "var(--font-mono)",
      fontSize: 11
    }
  }, "CSV"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "#1A3A5C"
    }
  }, "Berger_GmbH_2026-04_DATEV.csv"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#5C5C5C",
      marginTop: 2
    }
  }, "156 Buchungen \xB7 DATEV-Format SKR03 \xB7 24 KB")), /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    size: "sm"
  }, "Vorschau"), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    icon: Icons.Export
  }, "Export herunterladen"))));
}
window.Posteingang = Posteingang;
window.BelegDetail = BelegDetail;
window.Mandanten = Mandanten;
window.ExportView = Export_;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Sidebar.jsx
try { (() => {
function Sidebar({
  activeRoute,
  setRoute,
  mandant,
  collapsed,
  onToggle
}) {
  const items = [{
    id: "dashboard",
    label: "Übersicht",
    icon: Icons.Home || Icons.Chart
  }, {
    id: "posteingang",
    label: "Posteingang",
    icon: Icons.Inbox,
    count: 47
  }, {
    id: "mandanten",
    label: "Mandanten",
    icon: Icons.Users,
    count: 24
  }, {
    id: "klaerungen",
    label: "Klärungen",
    icon: Icons.MessageCircle || Icons.Help,
    count: 8
  }, {
    id: "export",
    label: "DATEV-Export",
    icon: Icons.Export
  }, {
    id: "berichte",
    label: "Berichte",
    icon: Icons.Chart
  }];
  return /*#__PURE__*/React.createElement("aside", {
    className: "app__sidebar" + (collapsed ? " is-collapsed" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb__logo"
  }, collapsed ? /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ludwig-mark.svg",
    width: "28",
    height: "28",
    alt: "Ludwig"
  }) : /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ludwig-logo-light.svg",
    height: "28",
    alt: "Ludwig"
  }), /*#__PURE__*/React.createElement("button", {
    className: "sb__toggle",
    onClick: onToggle,
    title: collapsed ? "Ausklappen" : "Einklappen",
    "aria-label": collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"
  }, collapsed ? Icons.ChevRight : Icons.ChevLeft)), /*#__PURE__*/React.createElement("nav", {
    className: "sb__nav"
  }, !collapsed && /*#__PURE__*/React.createElement("div", {
    className: "sb__navlabel"
  }, "Arbeit"), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    className: "sb__navitem" + (activeRoute === it.id ? " active" : ""),
    onClick: () => setRoute(it.id),
    title: collapsed ? it.label : undefined
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, it.icon), !collapsed && /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, it.label), !collapsed && it.count != null && /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, it.count), collapsed && it.count != null && /*#__PURE__*/React.createElement("span", {
    className: "dot-badge",
    "aria-hidden": "true"
  }))), !collapsed && /*#__PURE__*/React.createElement("div", {
    className: "sb__navlabel",
    style: {
      marginTop: 16
    }
  }, "Kanzlei"), /*#__PURE__*/React.createElement("button", {
    className: "sb__navitem",
    onClick: () => setRoute("einstellungen"),
    title: collapsed ? "Einstellungen" : undefined
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, Icons.Settings), !collapsed && /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "Einstellungen"))), /*#__PURE__*/React.createElement("div", {
    className: "sb__user"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, "SH"), !collapsed && /*#__PURE__*/React.createElement("div", {
    className: "sb__user-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, "Stefan Hofmann"), /*#__PURE__*/React.createElement("div", {
    className: "role"
  }, "Steuerberater"))));
}
window.Sidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Tenants.jsx
try { (() => {
// Tenant data — used by both TopBar switcher and screens
const TENANTS = [{
  id: "10024",
  num: "10024",
  name: "Berger GmbH",
  initials: "BG",
  color: "#1A3A5C",
  open: 23,
  branche: "Großhandel · Bau",
  form: "GmbH",
  hrb: "HRB 184725",
  finanzamt: "München III",
  ust: "DE 287 411 902",
  letztaktiv: "24.04.2026",
  status: "active"
}, {
  id: "10031",
  num: "10031",
  name: "Architekturbüro Lindner",
  initials: "AL",
  color: "#2E78A8",
  open: 8,
  branche: "Architektur",
  form: "GbR",
  hrb: "—",
  finanzamt: "München I",
  ust: "DE 254 819 471",
  letztaktiv: "24.04.2026",
  status: "active"
}, {
  id: "10047",
  num: "10047",
  name: "Hofmeier & Söhne KG",
  initials: "HS",
  color: "#3F7A5A",
  open: 47,
  branche: "Schreinerei",
  form: "KG",
  hrb: "HRA 92 184",
  finanzamt: "Rosenheim",
  ust: "DE 311 028 466",
  letztaktiv: "23.04.2026",
  status: "warn"
}, {
  id: "10052",
  num: "10052",
  name: "Praxis Dr. Köhler",
  initials: "PK",
  color: "#B07B2C",
  open: 4,
  branche: "Heilberuf",
  form: "Einzel",
  hrb: "—",
  finanzamt: "München I",
  ust: "DE 192 776 035",
  letztaktiv: "24.04.2026",
  status: "active"
}, {
  id: "10068",
  num: "10068",
  name: "Schreinerei Weiß",
  initials: "SW",
  color: "#5BA4D1",
  open: 19,
  branche: "Handwerk",
  form: "GmbH",
  hrb: "HRB 201 477",
  finanzamt: "München II",
  ust: "DE 339 814 220",
  letztaktiv: "23.04.2026",
  status: "active"
}, {
  id: "10074",
  num: "10074",
  name: "Café Mariposa GbR",
  initials: "CM",
  color: "#A8403C",
  open: 31,
  branche: "Gastronomie",
  form: "GbR",
  hrb: "—",
  finanzamt: "München I",
  ust: "DE 405 192 884",
  letztaktiv: "24.04.2026",
  status: "active"
}, {
  id: "10089",
  num: "10089",
  name: "MetaBau Süd GmbH",
  initials: "MB",
  color: "#6B5B95",
  open: 12,
  branche: "Hochbau",
  form: "GmbH",
  hrb: "HRB 215 902",
  finanzamt: "Augsburg",
  ust: "DE 442 671 008",
  letztaktiv: "22.04.2026",
  status: "active"
}, {
  id: "10092",
  num: "10092",
  name: "Frische Stube e.K.",
  initials: "FS",
  color: "#3B7A6F",
  open: 2,
  branche: "Einzelhandel",
  form: "e.K.",
  hrb: "HRA 105 488",
  finanzamt: "München III",
  ust: "DE 366 720 514",
  letztaktiv: "21.04.2026",
  status: "inactive"
}];
window.TENANTS = TENANTS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Tenants.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TopBar.jsx
try { (() => {
// TopBar with Role-Badge + Tenant-Switcher
// Role-Badge color-coded: Stb = primary navy, Mandant = accent blue, Admin = warning amber

function RoleBadge({
  role = "stb"
}) {
  const config = {
    stb: {
      label: "Steuerberater",
      short: "Stb",
      bg: "#E3EAF1",
      color: "#1A3A5C",
      border: "#C7D3E0"
    },
    mandant: {
      label: "Mandant",
      short: "Mand.",
      bg: "#E3F0F8",
      color: "#2E78A8",
      border: "#C7DFEC"
    },
    admin: {
      label: "Plattform-Admin",
      short: "Admin",
      bg: "#F5EEE0",
      color: "#B07B2C",
      border: "#E8DCBE"
    }
  }[role] || {
    label: role,
    short: role,
    bg: "#ECEFF3",
    color: "#5C5C5C",
    border: "#DDE2E8"
  };
  return /*#__PURE__*/React.createElement("span", {
    className: "role-badge",
    style: {
      background: config.bg,
      color: config.color,
      borderColor: config.border
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: config.color
    }
  }), config.label);
}
function TenantSwitcher({
  tenants,
  active,
  onChange
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const current = tenants.find(t => t.id === active) || tenants[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "tenant",
    ref: ref
  }, /*#__PURE__*/React.createElement("button", {
    className: "tenant__btn",
    onClick: () => setOpen(o => !o),
    title: "Mandant wechseln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tenant__avatar",
    style: {
      background: current.color
    }
  }, current.initials), /*#__PURE__*/React.createElement("div", {
    className: "tenant__text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, current.num), /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, current.name)), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, Icons.ChevDown)), open && /*#__PURE__*/React.createElement("div", {
    className: "tenant__menu",
    role: "menu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tenant__menu-search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, Icons.Search), /*#__PURE__*/React.createElement("input", {
    placeholder: "Mandant suchen\u2026",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "tenant__menu-list"
  }, tenants.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "tenant__menu-item" + (t.id === active ? " is-active" : ""),
    onClick: () => {
      onChange && onChange(t.id);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tenant__avatar",
    style: {
      background: t.color
    }
  }, t.initials), /*#__PURE__*/React.createElement("div", {
    className: "tenant__text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, t.num), /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, t.name)), t.open != null && /*#__PURE__*/React.createElement("span", {
    className: "tenant__pill"
  }, t.open, " offen"), t.id === active && /*#__PURE__*/React.createElement("span", {
    className: "tenant__check"
  }, Icons.Check)))), /*#__PURE__*/React.createElement("div", {
    className: "tenant__menu-foot"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 6,
      alignItems: "center",
      color: "#2E78A8",
      fontSize: 13
    }
  }, Icons.Plus, " Mandant hinzuf\xFCgen"))));
}
function TopBar({
  crumb,
  role = "stb",
  tenants,
  activeTenant,
  onTenantChange
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "app__topbar"
  }, tenants && /*#__PURE__*/React.createElement(TenantSwitcher, {
    tenants: tenants,
    active: activeTenant,
    onChange: onTenantChange
  }), /*#__PURE__*/React.createElement("div", {
    className: "tb__crumb"
  }, crumb), /*#__PURE__*/React.createElement("div", {
    className: "tb__search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, Icons.Search), /*#__PURE__*/React.createElement("input", {
    placeholder: "Belege, Mandanten, Konten suchen\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "tb__actions"
  }, /*#__PURE__*/React.createElement(RoleBadge, {
    role: role
  }), /*#__PURE__*/React.createElement("button", {
    className: "tb__icon-btn",
    title: "Hilfe"
  }, Icons.Help), /*#__PURE__*/React.createElement("button", {
    className: "tb__icon-btn",
    title: "Benachrichtigungen"
  }, Icons.Bell)));
}
window.RoleBadge = RoleBadge;
window.TenantSwitcher = TenantSwitcher;
window.TopBar = TopBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Upload.jsx
try { (() => {
// Ludwig — Upload Zone (idle / dragover / files+pipeline)

function UploadZone({
  active,
  onPick,
  hint = "PDF, JPG, PNG, EML — bis 25 MB"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "uz" + (active ? " uz--active" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "uz__ico"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 16V4M12 4l-4 4M12 4l4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
  }))), /*#__PURE__*/React.createElement("h3", {
    className: "uz__title"
  }, active ? "Hier loslassen" : "Belege hierher ziehen"), /*#__PURE__*/React.createElement("p", {
    className: "uz__sub"
  }, "oder ", /*#__PURE__*/React.createElement("a", {
    onClick: onPick
  }, "aus Dateien w\xE4hlen")), /*#__PURE__*/React.createElement("div", {
    className: "uz__hint"
  }, hint));
}
function UploadFile({
  name,
  size,
  status
}) {
  // status: { hash, ocr, extract, interpret } each: 'pending' | 'run' | 'ok' | 'err'
  const steps = [{
    key: "hash",
    label: "Hash"
  }, {
    key: "ocr",
    label: "OCR"
  }, {
    key: "extract",
    label: "Extraktion"
  }, {
    key: "interpret",
    label: "Interpretation"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "uz-file"
  }, /*#__PURE__*/React.createElement("span", {
    className: "uz-file__ico"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 3v6h6"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "uz-file__name"
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "uz-file__size"
  }, size)), /*#__PURE__*/React.createElement("div", {
    className: "uz-pipe"
  }, steps.map(st => {
    const s = status[st.key] || "pending";
    return /*#__PURE__*/React.createElement("span", {
      key: st.key,
      className: "uz-step " + (s === "pending" ? "" : s)
    }, /*#__PURE__*/React.createElement("span", {
      className: "dot"
    }), st.label);
  })));
}
function UploadFileList({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "uz-files"
  }, children);
}
Object.assign(window, {
  UploadZone,
  UploadFile,
  UploadFileList
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Upload.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auth/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auth/design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auth/login-canvas.jsx
try { (() => {
// Ludwig Auth — Login states canvas
// Shows all states in one place: Initial, Validation, Submitting, Success,
// Delivery-Error, Callback-Error (banner on Initial), Pending-Account,
// Auth-Callback loading.

const LudwigLogo = ({
  height = 28
}) => /*#__PURE__*/React.createElement("img", {
  src: "../../assets/ludwig-logo.svg",
  height: height,
  alt: "Ludwig",
  style: {
    display: "block"
  }
});

// Re-usable form chrome
function AuthShell({
  children,
  banner
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "auth"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__bg"
  }), /*#__PURE__*/React.createElement("main", {
    className: "auth__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__brand"
  }, /*#__PURE__*/React.createElement(LudwigLogo, {
    height: 28
  })), banner, /*#__PURE__*/React.createElement("div", {
    className: "auth__card"
  }, children), /*#__PURE__*/React.createElement("footer", {
    className: "auth__footer"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Impressum"), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Datenschutz"), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:support@ludwig.de"
  }, "support@ludwig.de"))));
}

// Inline icons local to auth
const I = {
  mail: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 7l9 6 9-6"
  })),
  warn: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "8",
    x2: "12",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "16",
    x2: "12",
    y2: "16.01"
  })),
  check: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })),
  arrow: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "13 5 20 12 13 19"
  })),
  spin: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-6.2-8.55",
    className: "auth-spin"
  })),
  again: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "23 4 23 10 17 10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
  })),
  logout: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "16 17 21 12 16 7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "12",
    x2: "9",
    y2: "12"
  }))
};

// ─── State 1: Initial ─────────────────────────────────────────
function Initial() {
  return /*#__PURE__*/React.createElement(AuthShell, null, /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1"
  }, "Anmelden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub"
  }, "Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail."), /*#__PURE__*/React.createElement("label", {
    className: "auth__label",
    htmlFor: "email-i"
  }, "E-Mail-Adresse"), /*#__PURE__*/React.createElement("div", {
    className: "auth__input-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__input-ico"
  }, I.mail), /*#__PURE__*/React.createElement("input", {
    id: "email-i",
    className: "auth__input",
    type: "email",
    autoComplete: "email",
    placeholder: "name@kanzlei.de"
  })), /*#__PURE__*/React.createElement("button", {
    className: "auth__btn auth__btn--primary"
  }, "Magic Link senden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__hint"
  }, "Wir nutzen passwortloses Login per Magic Link."));
}

// ─── State 2: Validation Error ────────────────────────────────
function ValidationError() {
  return /*#__PURE__*/React.createElement(AuthShell, null, /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1"
  }, "Anmelden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub"
  }, "Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail."), /*#__PURE__*/React.createElement("label", {
    className: "auth__label",
    htmlFor: "email-v"
  }, "E-Mail-Adresse"), /*#__PURE__*/React.createElement("div", {
    className: "auth__input-wrap auth__input-wrap--error"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__input-ico"
  }, I.mail), /*#__PURE__*/React.createElement("input", {
    id: "email-v",
    className: "auth__input",
    type: "email",
    defaultValue: "hofmann@kanzlei"
  })), /*#__PURE__*/React.createElement("p", {
    className: "auth__error"
  }, "Bitte geben Sie eine g\xFCltige E-Mail-Adresse ein."), /*#__PURE__*/React.createElement("button", {
    className: "auth__btn auth__btn--primary"
  }, "Magic Link senden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__hint"
  }, "Wir nutzen passwortloses Login per Magic Link."));
}

// ─── State 3: Submitting ──────────────────────────────────────
function Submitting() {
  return /*#__PURE__*/React.createElement(AuthShell, null, /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1"
  }, "Anmelden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub"
  }, "Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail."), /*#__PURE__*/React.createElement("label", {
    className: "auth__label",
    htmlFor: "email-s"
  }, "E-Mail-Adresse"), /*#__PURE__*/React.createElement("div", {
    className: "auth__input-wrap auth__input-wrap--readonly"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__input-ico"
  }, I.mail), /*#__PURE__*/React.createElement("input", {
    id: "email-s",
    className: "auth__input",
    type: "email",
    defaultValue: "stefan.hofmann@kanzlei-hofmann.de",
    readOnly: true
  })), /*#__PURE__*/React.createElement("button", {
    className: "auth__btn auth__btn--primary auth__btn--loading",
    disabled: true
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__btn-spinner"
  }, I.spin), "Sende\u2026"), /*#__PURE__*/React.createElement("p", {
    className: "auth__hint"
  }, "Wir nutzen passwortloses Login per Magic Link."));
}

// ─── State 4: Success ─────────────────────────────────────────
function Success() {
  return /*#__PURE__*/React.createElement(AuthShell, null, /*#__PURE__*/React.createElement("div", {
    className: "auth__success-icon"
  }, I.check), /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1"
  }, "Postfach pr\xFCfen"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub"
  }, "Magic Link an ", /*#__PURE__*/React.createElement("strong", null, "stefan.hofmann@kanzlei-hofmann.de"), " gesendet. Klicken Sie den Link in der E-Mail, um sich anzumelden."), /*#__PURE__*/React.createElement("div", {
    className: "auth__success-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__meta-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-label"
  }, "G\xFCltig f\xFCr"), /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-value"
  }, "15 Minuten")), /*#__PURE__*/React.createElement("div", {
    className: "auth__meta-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-label"
  }, "Einmalig verwendbar"), /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-value"
  }, "ja"))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "auth__btn auth__btn--ghost"
  }, "Andere Adresse verwenden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__hint"
  }, "Keine E-Mail erhalten? Pr\xFCfen Sie den Spam-Ordner oder warten Sie 60 Sekunden."));
}

// ─── State 5: Delivery Error ──────────────────────────────────
function DeliveryError() {
  return /*#__PURE__*/React.createElement(AuthShell, {
    banner: /*#__PURE__*/React.createElement("div", {
      className: "auth__banner auth__banner--error"
    }, /*#__PURE__*/React.createElement("span", {
      className: "auth__banner-ico"
    }, I.warn), /*#__PURE__*/React.createElement("span", null, "Versand fehlgeschlagen. Bitte sp\xE4ter erneut versuchen."))
  }, /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1"
  }, "Anmelden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub"
  }, "Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail."), /*#__PURE__*/React.createElement("label", {
    className: "auth__label",
    htmlFor: "email-d"
  }, "E-Mail-Adresse"), /*#__PURE__*/React.createElement("div", {
    className: "auth__input-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__input-ico"
  }, I.mail), /*#__PURE__*/React.createElement("input", {
    id: "email-d",
    className: "auth__input",
    type: "email",
    defaultValue: "stefan.hofmann@kanzlei-hofmann.de"
  })), /*#__PURE__*/React.createElement("button", {
    className: "auth__btn auth__btn--primary"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__btn-spinner"
  }, I.again), "Erneut versuchen"), /*#__PURE__*/React.createElement("p", {
    className: "auth__hint"
  }, "Anhaltende Probleme? ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:support@ludwig.de"
  }, "support@ludwig.de")));
}

// ─── State 6: Callback Error (banner on /login) ───────────────
function CallbackError() {
  return /*#__PURE__*/React.createElement(AuthShell, {
    banner: /*#__PURE__*/React.createElement("div", {
      className: "auth__banner auth__banner--error"
    }, /*#__PURE__*/React.createElement("span", {
      className: "auth__banner-ico"
    }, I.warn), /*#__PURE__*/React.createElement("span", null, "Link ung\xFCltig oder abgelaufen \u2014 bitte neuen anfordern."))
  }, /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1"
  }, "Anmelden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub"
  }, "Wir senden Ihnen einen einmaligen Anmelde-Link per E-Mail."), /*#__PURE__*/React.createElement("label", {
    className: "auth__label",
    htmlFor: "email-c"
  }, "E-Mail-Adresse"), /*#__PURE__*/React.createElement("div", {
    className: "auth__input-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__input-ico"
  }, I.mail), /*#__PURE__*/React.createElement("input", {
    id: "email-c",
    className: "auth__input",
    type: "email",
    autoComplete: "email",
    placeholder: "name@kanzlei.de"
  })), /*#__PURE__*/React.createElement("button", {
    className: "auth__btn auth__btn--primary"
  }, "Magic Link senden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__hint"
  }, "Wir nutzen passwortloses Login per Magic Link."));
}

// ─── Auth-Callback / Loading ──────────────────────────────────
function AuthCallback() {
  return /*#__PURE__*/React.createElement("div", {
    className: "auth"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__bg"
  }), /*#__PURE__*/React.createElement("main", {
    className: "auth__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__brand"
  }, /*#__PURE__*/React.createElement(LudwigLogo, {
    height: 28
  })), /*#__PURE__*/React.createElement("div", {
    className: "auth__card auth__card--centered"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__loader"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__loader-ring"
  })), /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1",
    style: {
      fontSize: 22
    }
  }, "Anmeldung wird abgeschlossen"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub",
    style: {
      marginBottom: 0
    }
  }, "Einen Moment, wir richten Ihre Sitzung ein."))));
}

// ─── Pending Account ──────────────────────────────────────────
function PendingAccount() {
  return /*#__PURE__*/React.createElement(AuthShell, null, /*#__PURE__*/React.createElement("div", {
    className: "auth__success-icon auth__success-icon--warn"
  }, I.warn), /*#__PURE__*/React.createElement("h1", {
    className: "auth__h1"
  }, "Konto noch nicht freigeschaltet"), /*#__PURE__*/React.createElement("p", {
    className: "auth__sub"
  }, "Ihre Anmeldung war erfolgreich, aber Ihr Account ist noch nicht aktiv. Bitte wenden Sie sich an einen Administrator Ihrer Kanzlei."), /*#__PURE__*/React.createElement("div", {
    className: "auth__success-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__meta-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-label"
  }, "Angemeldet als"), /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-value mono"
  }, "stefan.hofmann@kanzlei-hofmann.de")), /*#__PURE__*/React.createElement("div", {
    className: "auth__meta-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-label"
  }, "Status"), /*#__PURE__*/React.createElement("span", {
    className: "auth__meta-value"
  }, "Wartet auf Freischaltung"))), /*#__PURE__*/React.createElement("button", {
    className: "auth__btn auth__btn--secondary"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__btn-spinner"
  }, I.logout), "Abmelden"), /*#__PURE__*/React.createElement("p", {
    className: "auth__hint"
  }, "Fragen? ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:support@ludwig.de"
  }, "support@ludwig.de")));
}

// ─── Canvas wiring ────────────────────────────────────────────
const ARTBOARD_W = 520;
const ARTBOARD_H = 720;
function App() {
  return /*#__PURE__*/React.createElement(DesignCanvas, {
    title: "Ludwig \u2014 Login & Auth"
  }, /*#__PURE__*/React.createElement(DCSection, {
    id: "primary",
    title: "Prim\xE4rfl\xFCsse",
    subtitle: "E-Mail \u2192 Magic Link \u2192 Session"
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "initial",
    label: "01 \xB7 Initial / leer",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(Initial, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "validation",
    label: "02 \xB7 Validation-Error",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(ValidationError, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "submitting",
    label: "03 \xB7 Submitting",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(Submitting, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "success",
    label: "04 \xB7 Success",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(Success, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "callback-loading",
    label: "05 \xB7 Auth-Callback (Loading)",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(AuthCallback, null))), /*#__PURE__*/React.createElement(DCSection, {
    id: "errors",
    title: "Fehler & Sonderzust\xE4nde",
    subtitle: "Banner-States zur\xFCck auf /login + Pending-Account"
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "delivery-error",
    label: "06 \xB7 Versand fehlgeschlagen",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(DeliveryError, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "callback-error",
    label: "07 \xB7 Link ung\xFCltig / abgelaufen",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(CallbackError, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "pending",
    label: "08 \xB7 Pending-Account",
    width: ARTBOARD_W,
    height: ARTBOARD_H
  }, /*#__PURE__*/React.createElement(PendingAccount, null))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auth/login-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Sections.jsx
try { (() => {
function MarketingHeader() {
  return /*#__PURE__*/React.createElement("header", {
    className: "m-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-header__inner"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ludwig-logo.svg",
    height: "32",
    alt: "Ludwig"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "m-header__nav"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#how"
  }, "Wie Ludwig arbeitet"), /*#__PURE__*/React.createElement("a", {
    href: "#vergleich"
  }, "Vergleich"), /*#__PURE__*/React.createElement("a", {
    href: "#sicherheit"
  }, "Sicherheit"), /*#__PURE__*/React.createElement("a", {
    href: "#preis"
  }, "Preis")), /*#__PURE__*/React.createElement("div", {
    className: "m-header__cta"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "m-link-signin"
  }, "Anmelden"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "btn btn-primary",
    style: {
      background: "#1A3A5C",
      color: "#fff",
      padding: "9px 16px",
      borderRadius: 4,
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 500
    }
  }, "Demo vereinbaren"))));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__eyebrow"
  }, "KI-Buchhaltungsassistent \xB7 f\xFCr Steuerkanzleien"), /*#__PURE__*/React.createElement("h1", null, "Mehr Zeit f\xFCr Mandanten. Ludwig bucht den Rest."), /*#__PURE__*/React.createElement("p", null, "Ludwig ist ein digitaler Mitarbeiter, der Belege auf dem Niveau eines ausgebildeten Buchhalters verarbeitet. Er sortiert, kontiert und bereitet den DATEV-Export vor. Sie pr\xFCfen und beraten."), /*#__PURE__*/React.createElement("div", {
    className: "cta-row"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "btn-primary-light"
  }, "Demo vereinbaren \u2192"), /*#__PURE__*/React.createElement("a", {
    href: "#how",
    className: "btn-ghost-light"
  }, "Wie Ludwig arbeitet")), /*#__PURE__*/React.createElement("div", {
    className: "hero__meta"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "DSGVO-konform"), "Server in Frankfurt"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "DATEV-zertifiziert"), "SKR03 / SKR04"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Made in Germany"), "Support aus M\xFCnchen"))));
}
function HowItWorks() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section-pad",
    id: "how"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-eyebrow"
  }, "Wie Ludwig arbeitet"), /*#__PURE__*/React.createElement("h2", null, "Ein erfahrener Kollege, der nicht m\xFCde wird."), /*#__PURE__*/React.createElement("p", null, "Belege landen bei Ludwig \u2014 per E-Mail, Upload oder \xFCber Schnittstellen Ihrer Mandanten. Ludwig erledigt die Vorarbeit. Sie pr\xFCfen und entscheiden.")), /*#__PURE__*/React.createElement("div", {
    className: "steps"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__visual"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ludwig-mark.svg",
    width: "40",
    height: "40",
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "step__num"
  }, "SCHRITT 01"), /*#__PURE__*/React.createElement("h3", {
    className: "step__title"
  }, "Belege gehen ein"), /*#__PURE__*/React.createElement("p", {
    className: "step__body"
  }, "Mandanten leiten Belege per E-Mail oder Portal an Ludwig weiter. Eingangs- und Ausgangsrechnungen, Kontoausz\xFCge, Quittungen.")), /*#__PURE__*/React.createElement("div", {
    className: "step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__visual"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ludwig-mark.svg",
    width: "40",
    height: "40",
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "step__num"
  }, "SCHRITT 02"), /*#__PURE__*/React.createElement("h3", {
    className: "step__title"
  }, "Ludwig kontiert"), /*#__PURE__*/React.createElement("p", {
    className: "step__body"
  }, "Lieferant erkannt, Konto gew\xE4hlt, USt-Schl\xFCssel gesetzt, Buchungstext formuliert. Mit Begr\xFCndung pro Beleg, nachvollziehbar.")), /*#__PURE__*/React.createElement("div", {
    className: "step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__visual"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ludwig-mark.svg",
    width: "40",
    height: "40",
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "step__num"
  }, "SCHRITT 03"), /*#__PURE__*/React.createElement("h3", {
    className: "step__title"
  }, "Sie pr\xFCfen und exportieren"), /*#__PURE__*/React.createElement("p", {
    className: "step__body"
  }, "Sie sehen alle Vorkontierungen auf einen Blick, pr\xFCfen, geben frei. Ludwig erzeugt den DATEV-Export.")))));
}
const Check = props => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: props.color || "#3F7A5A",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
const Minus = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#A8403C",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("line", {
  x1: "5",
  y1: "12",
  x2: "19",
  y2: "12"
}));
function Compare() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section-pad compare",
    id: "vergleich"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-eyebrow"
  }, "Vergleich"), /*#__PURE__*/React.createElement("h2", null, "Manuelle Buchhaltung \u2014 und mit Ludwig."), /*#__PURE__*/React.createElement("p", null, "Was sich konkret in Ihrer Kanzlei \xE4ndert.")), /*#__PURE__*/React.createElement("div", {
    className: "compare__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "compare__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "compare__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Manuell"), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, "Status quo")), /*#__PURE__*/React.createElement("ul", {
    className: "compare__list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Minus, null), /*#__PURE__*/React.createElement("span", null, "Belege werden h\xE4ndisch erfasst und kontiert.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Minus, null), /*#__PURE__*/React.createElement("span", null, "Mitarbeiter verbringen 60\u201370 % ihrer Zeit mit Vorarbeit.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Minus, null), /*#__PURE__*/React.createElement("span", null, "USt-Voranmeldung bindet jeden Monat zwei Tage.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Minus, null), /*#__PURE__*/React.createElement("span", null, "Mandanten warten \u2014 Beratung kommt zu kurz.")))), /*#__PURE__*/React.createElement("div", {
    className: "compare__col",
    style: {
      background: "#F1F7FB"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "compare__h"
  }, /*#__PURE__*/React.createElement("h3", null, "Mit Ludwig"), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, "Digital + gepr\xFCft")), /*#__PURE__*/React.createElement("ul", {
    className: "compare__list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "Ludwig kontiert \xFCber Nacht. Sie sehen morgens den Posteingang.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "Mitarbeiter konzentrieren sich auf Pr\xFCfung, Beratung und Strategie.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "USt-Voranmeldung in Stunden, nicht Tagen.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "Mehr Mandanten ohne mehr Personal \u2014 bei gleichbleibender Qualit\xE4t.")))))));
}
function Trust() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section-pad trust",
    id: "sicherheit"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-eyebrow",
    style: {
      color: "#5BA4D1"
    }
  }, "Sicherheit & Datenschutz"), /*#__PURE__*/React.createElement("h2", null, "Mandantendaten bleiben in Deutschland."), /*#__PURE__*/React.createElement("p", null, "Wir wissen: Vertrauen ist die Grundlage Ihres Berufs. Ludwig ist nach diesem Ma\xDFstab gebaut.")), /*#__PURE__*/React.createElement("div", {
    className: "trust__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "trust__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "DSGVO"), /*#__PURE__*/React.createElement("div", {
    className: "h"
  }, "Auftragsverarbeitung"), /*#__PURE__*/React.createElement("p", {
    className: "b"
  }, "Vollst\xE4ndige Auftragsverarbeitungs\xADvereinbarung. TOM nach Stand der Technik.")), /*#__PURE__*/React.createElement("div", {
    className: "trust__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "HOSTING"), /*#__PURE__*/React.createElement("div", {
    className: "h"
  }, "Server in Frankfurt"), /*#__PURE__*/React.createElement("p", {
    className: "b"
  }, "Daten verlassen niemals Deutschland. ISO-27001-zertifizierte Rechenzentren.")), /*#__PURE__*/React.createElement("div", {
    className: "trust__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "SCHNITTSTELLEN"), /*#__PURE__*/React.createElement("div", {
    className: "h"
  }, "DATEV-zertifiziert"), /*#__PURE__*/React.createElement("p", {
    className: "b"
  }, "SKR03, SKR04, individueller Kontenrahmen. Kompatibel mit Unternehmen Online.")), /*#__PURE__*/React.createElement("div", {
    className: "trust__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "VERSCHL\xDCSSELUNG"), /*#__PURE__*/React.createElement("div", {
    className: "h"
  }, "Ende-zu-Ende"), /*#__PURE__*/React.createElement("p", {
    className: "b"
  }, "Alle Belege werden verschl\xFCsselt \xFCbertragen und gespeichert. Zugriff nur mit 2FA.")))));
}
function Pricing() {
  return /*#__PURE__*/React.createElement("section", {
    className: "pricing",
    id: "preis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-h",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-eyebrow"
  }, "Preis"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 auto 16px"
    }
  }, "Ein Tarif. Transparent."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 auto"
    }
  }, "Keine versteckten Kosten. Keine Staffeln nach Mitarbeiterzahl. Keine Vertragslaufzeit \xFCber zw\xF6lf Monate.")), /*#__PURE__*/React.createElement("div", {
    className: "pricing__card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pricing__top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, "LUDWIG \xB7 KANZLEI"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#5C5C5C",
      marginTop: 4
    }
  }, "Pro Mandant, pro Monat")), /*#__PURE__*/React.createElement("div", {
    className: "price"
  }, "29 \u20AC", /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, " / Mandant"))), /*#__PURE__*/React.createElement("ul", {
    className: "pricing__features"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "Unbegrenzte Belegverarbeitung pro Mandant")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "DATEV-Export (SKR03, SKR04, individuell)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "Alle Mitarbeiter Ihrer Kanzlei inklusive")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "Deutschsprachiger Support per Telefon und E-Mail")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Check, null), /*#__PURE__*/React.createElement("span", null, "Auftragsverarbeitungs\xADvereinbarung inklusive"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      background: "#1A3A5C",
      color: "#fff",
      padding: "13px 22px",
      borderRadius: 4,
      textDecoration: "none",
      fontSize: 15,
      fontWeight: 500,
      flex: 1,
      textAlign: "center"
    }
  }, "Demo vereinbaren"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      background: "#fff",
      color: "#1A3A5C",
      padding: "13px 22px",
      borderRadius: 4,
      textDecoration: "none",
      fontSize: 15,
      fontWeight: 500,
      border: "1px solid #C4CCD5",
      flex: 1,
      textAlign: "center"
    }
  }, "Mit Vertrieb sprechen")))));
}
function MarketingFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "m-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-footer__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-footer__cols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-footer__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ludwig-logo-light.svg",
    height: "32",
    alt: "Ludwig"
  }), /*#__PURE__*/React.createElement("p", null, "Der digitale Mitarbeiter f\xFCr kleine Steuerkanzleien. Made in Germany.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Produkt"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Wie es funktioniert")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "DATEV-Integration")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Preis")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Demo vereinbaren")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Kanzlei"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Onboarding")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Schulungen")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Hilfe-Center")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Status")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Unternehmen"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "\xDCber uns")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Datenschutz")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "AGB")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Impressum"))))), /*#__PURE__*/React.createElement("div", {
    className: "m-footer__bottom"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Ludwig GmbH \xB7 M\xFCnchen"), /*#__PURE__*/React.createElement("span", null, "kontakt@ludwig.de \xB7 089 123 456 78"))));
}
window.MarketingHeader = MarketingHeader;
window.Hero = Hero;
window.HowItWorks = HowItWorks;
window.Compare = Compare;
window.Trust = Trust;
window.Pricing = Pricing;
window.MarketingFooter = MarketingFooter;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.ConfidenceDot = __ds_scope.ConfidenceDot;

})();
