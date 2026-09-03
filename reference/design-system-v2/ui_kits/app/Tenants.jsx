// Tenant data — used by both TopBar switcher and screens
const TENANTS = [
  { id: "10024", num: "10024", name: "Berger GmbH",            initials: "BG", color: "#1A3A5C", open: 23, branche: "Großhandel · Bau",   form: "GmbH",  hrb: "HRB 184725", finanzamt: "München III",  ust: "DE 287 411 902", letztaktiv: "24.04.2026", status: "active" },
  { id: "10031", num: "10031", name: "Architekturbüro Lindner", initials: "AL", color: "#2E78A8", open:  8, branche: "Architektur",          form: "GbR",   hrb: "—",          finanzamt: "München I",     ust: "DE 254 819 471", letztaktiv: "24.04.2026", status: "active" },
  { id: "10047", num: "10047", name: "Hofmeier & Söhne KG",    initials: "HS", color: "#3F7A5A", open: 47, branche: "Schreinerei",          form: "KG",    hrb: "HRA 92 184", finanzamt: "Rosenheim",     ust: "DE 311 028 466", letztaktiv: "23.04.2026", status: "warn" },
  { id: "10052", num: "10052", name: "Praxis Dr. Köhler",       initials: "PK", color: "#B07B2C", open:  4, branche: "Heilberuf",            form: "Einzel",hrb: "—",          finanzamt: "München I",     ust: "DE 192 776 035", letztaktiv: "24.04.2026", status: "active" },
  { id: "10068", num: "10068", name: "Schreinerei Weiß",        initials: "SW", color: "#5BA4D1", open: 19, branche: "Handwerk",             form: "GmbH",  hrb: "HRB 201 477",finanzamt: "München II",    ust: "DE 339 814 220", letztaktiv: "23.04.2026", status: "active" },
  { id: "10074", num: "10074", name: "Café Mariposa GbR",       initials: "CM", color: "#A8403C", open: 31, branche: "Gastronomie",          form: "GbR",   hrb: "—",          finanzamt: "München I",     ust: "DE 405 192 884", letztaktiv: "24.04.2026", status: "active" },
  { id: "10089", num: "10089", name: "MetaBau Süd GmbH",        initials: "MB", color: "#6B5B95", open: 12, branche: "Hochbau",              form: "GmbH",  hrb: "HRB 215 902",finanzamt: "Augsburg",      ust: "DE 442 671 008", letztaktiv: "22.04.2026", status: "active" },
  { id: "10092", num: "10092", name: "Frische Stube e.K.",      initials: "FS", color: "#3B7A6F", open:  2, branche: "Einzelhandel",         form: "e.K.",  hrb: "HRA 105 488",finanzamt: "München III",   ust: "DE 366 720 514", letztaktiv: "21.04.2026", status: "inactive" },
];

window.TENANTS = TENANTS;
