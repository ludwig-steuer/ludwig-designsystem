# Ludwig — Build-Fortschritt

Stand: laufende Auftragsarbeit gemäß Brief. Pro Tranche werden mehrere Screens
gebaut, dazwischen Review.

---

## ✅ Foundation (abgenommen)

- Design System v2 — `colors_and_type.css`, Logos, Mark, Iconography (16/20/24 px)
- `README.md`, `SKILL.md`, Preview-Cards, Asset-Review-Pane
- Brand Voice: Sie-Form, kein Emoji, keine Hi-👋-Anbiederung

## ✅ UI Kit — Marketing-Site (`ui_kits/marketing/`)

Hero · Features · Pricing · Testimonials · FAQ · Footer

## ✅ UI Kit — App-Shell + Erste Screens (`ui_kits/app/`)

- App-Shell: dunkle Sidebar + Topbar
- Übersicht (Dashboard) — KPI-Sparklines, Heute-zu-prüfen-Tabelle, Tagesvolumen-Bars,
  Top-Mandanten, USt-Deadline-Karte, Aufgaben, Ludwig-Verlauf
- Posteingang (Belegliste cross-Mandant)
- Beleg-Detail (Basis-Version: PDF + Vorkontierung + Ludwig-Note)
- Mandanten-Liste (Basis)
- DATEV-Export

## ✅ Auth Canvas (`ui_kits/auth/`)

8 Artboards: Initial · Validation-Error · Submitting · Success · Auth-Callback (Loading)
· Delivery-Error · Callback-Error · Pending-Account. Verifier ✓.

---

## 🔧 Tranche 1 — Stb-Track Kerngeschäft (in Arbeit)

### Ziele
- AppShell um **RoleBadge** (farbcodiert) + **TenantSwitcher** (Dropdown) erweitern
- Mandanten-Liste an Brief-Spalten anpassen
- **Mandanten-Detail** mit Tabs: Belege · Buchungen · Kreditoren · Debitoren ·
  Kontenrahmen · Service-Kategorien · Klärungen · Stammdaten
- **Beleg-Detail** umbauen: sticky Header oben + scrollbarer Body, mit
  **InterpretationPanel** (Ludwig-Analyse mit Confidence) + Positionen-Tabelle

### Chunks
- **1a — Topbar live (jetzt):** CSS für RoleBadge + TenantSwitcher, `index.html`
  an neue TopBar-Props anschließen, Tenant-Daten anlegen, verifizieren.
- **1b — Mandanten-Liste:** Brief-Spalten (Name, Nr, letzte Aktivität, offene
  Vorgänge, Status), Filter, Empty-State.
- **1c — Mandanten-Detail mit Tabs:** Header (Stammdaten-Karte oben) + Tab-Bar
  + Tab-Inhalte (Belege wiederverwendet, Buchungsjournal-Stub, Kreditoren-Stub,
  Kontenrahmen-Stub, …).
- **1d — Beleg-Detail-Refactor:** sticky Header rechts, scrollbarer Body mit
  InterpretationPanel (Confidence-Indicator pro Feld) + Positionen-Tabelle +
  Vorkontierung + Verlauf.

---

## 🗓️ Tranche 2 — Stb-Track Rest + Mandanten-Track

- Belegliste-pro-Mandant (= Tab in Detail; ggf. eigene Page)
- Buchungsjournal · Kontenrahmen · Kreditoren (Detail-Listen)
- Klärungs-Postfach (cross-Mandant, eigene Top-Level-Seite)
- Mandanten-Onboarding-Wizard (4-Schritt)
- Mandanten-Track: Dashboard · UploadZone · Meine Belege · Mandant-Beleg-Detail
- E-Mail-Templates (Magic-Link, Einladung)

## ✅ System-Components (preview-cards, abnahme-bereit)

11 fehlende Komponenten als dokumentierte Preview-Cards angelegt
(Design-System-Tab → Components):

- DataTable States (Loading · Empty · Pagination)
- Empty State (Liste + Filter)
- Toast & Banner (info/success/warning/danger)
- Review Item Card (Prüfpunkt mit Akzeptieren/Ablehnen/Rückfrage)
- Clarification Dialog (Rückfrage-Modal)
- Audit Trail (Timeline)
- Upload Zone (Idle · Drop · Multi-File-Pipeline)
- Form Primitives (Datepicker DE · Money · Textarea · Select)
- Wizard (4-Schritt-Stepper)
- Charts (Bar · Line · Donut)
- Drawer (Slide-over)
- Confidence Indicator (Pill-Stufen · Inline pro Feld · Detail-Gauge)

## 🗓️ Tranche 3 — Plattform-Admin

- Admin-Track (alle Kanzleien systemweit, KPIs, Auslastung)

---

## Bereits geklärte Designentscheidungen

- **Posteingang bleibt** als cross-Mandant-Inbox-Seite.
- **Beleg-Detail-Layout:** PDF links, rechts sticky Header + scrollbarer Body.
- **Dashboard-Daten:** rich behalten, Brief-KPIs müssen alle drin sein
  (aktive Mandanten, offene Belege, offene Klärungen, Review-Items, letzte 5
  Aktivitäten — größtenteils schon abgedeckt).
- **Role-Badge:** in der Topbar, farbcodiert (Stb = navy, Mandant = accent
  blau, Admin = warning amber).
- **Primary-Buttons:** flat im Ruhezustand, Drop-Shadow im Hover.
- **Sidebar:** Posteingang behalten, Klärungen hinzu, Belege-Topnav entfernt
  (Belege leben pro Mandant im Mandanten-Detail).
