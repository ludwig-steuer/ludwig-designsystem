# UX-Briefing — Ludwig Web-App

**Produkt:** Ludwig — KI-Buchhaltungsassistenz für Steuerkanzleien (DE-Sprache)
**Tech-Stack:** Next.js 16 App Router, React 19, Tailwind, shadcn-fähig
**Tonalität:** professionell, ruhig, sachlich. Zielgruppe sind Steuerberater (formell) und kleine Unternehmer (pragmatisch). Kein „SaaS-fluffy", kein Marketing-Sprech.

> Naming-Pflicht: alle UI-Labels DE und identisch zu `GLOSSARY.md` im Repo (Tenant=Kanzlei, Client=Mandant, Creditor=Kreditor, etc.). Keine Synonyme.

---

## 1. Drei Nutzergruppen / drei Sicht-Modi

Jede Rolle bekommt eine andere Navigation und teils andere Screens. Die Trennung ist hart — ein User kann nicht gleichzeitig in zwei Rollen sein.

| Rolle | Wer | Sicht |
|---|---|---|
| **Stb-User** (Steuerberater) | Mitarbeiter einer Kanzlei | sieht alle Mandanten der eigenen Kanzlei |
| **Mandanten-User** (Endkunde) | Inhaber einer / mehrerer Firmen | sieht nur eigene Firma(n) |
| **Plattform-Admin** (intern) | wir | sieht alle Kanzleien + alle User systemweit |

Stb-Track: professioneller Look, Standesrecht-konform, später Kanzlei-Branding-fähig.
Mandanten-Track: Endkunden-Pragmatik, evtl. mobile Foto-Upload.
Admin-Track: rein Desktop, dichter, datennäher.

---

## 2. Priorität — Login-Screen (vor allem anderen)

Der Login ist der erste Berührungspunkt mit Ludwig. Ohne fertigen Login keine Inbetriebnahme. Bitte zuerst.

### Layout
- Vollflächige, zentrierte Karte / Panel auf neutralem Hintergrund.
- Kein Marketing-Inhalt, kein Hero. Der Screen sagt „Anmelden", nichts sonst.
- Ludwig-Wortmarke oben (klein-mittel).
- Footer: Impressum, Datenschutz, Support-Adresse — dezent.

### Form-Inhalt (Initial-State)
- Überschrift: „Anmelden"
- Sub-Text: „Wir senden dir einen einmaligen Anmelde-Link per E-Mail."
- Eingabefeld:
  - Label: „E-Mail-Adresse"
  - Type: email
  - Required, autocomplete=`email`
- Primary-Button: „Magic Link senden"
- Hinweis-Text klein darunter: „Wir nutzen passwortloses Login per Magic Link."

### States, die der Designer alle abdecken muss

| State | Was sichtbar ist |
|---|---|
| **Initial / leer** | Form wie oben |
| **Validation-Error** | Inline-Fehler unter dem Input: „Bitte gib eine gültige E-Mail-Adresse ein." Button bleibt aktiv, Input rot umrandet. |
| **Submitting** | Button disabled, Beschriftung wechselt zu „Sende…", optional Spinner. Input read-only. |
| **Success** | Form wird durch Bestätigungs-Block ersetzt: „Magic Link an `<email>` gesendet. Schau ins Postfach." + sekundärer Link „andere Adresse verwenden" (zurück zu Initial). |
| **Delivery-Error** | Fehlerblock: „Versand fehlgeschlagen. Bitte später erneut versuchen." mit Retry-Button. |
| **Callback-Error** | Wenn der Magic-Link-Klick fehlschlägt (Token abgelaufen / ungültig), Redirect zurück zu /login mit roter Banner: „Link ungültig oder abgelaufen — bitte neuen anfordern." |
| **Pending-Account** (eigener Screen, nicht Login selbst) | Nach erfolgreichem Login, aber User hat keinen `platform_users`-Eintrag → Hinweis: „Dein Account ist authentifiziert, aber noch nicht freigeschaltet. Bitte einen Admin kontaktieren." Nur Logout-Button. |

### Datenfelder
- Input: E-Mail-Adresse (string, validiert per Zod als `z.string().email()`)
- Anzeige im Success: die soeben eingegebene E-Mail-Adresse (zur Bestätigung dass sie korrekt war)

### Accessibility
- Label korrekt mit `<label htmlFor>` an den Input gebunden
- Fehler via `aria-describedby`
- Tab-Reihenfolge: Logo → E-Mail → Submit → Footer
- Submit per Enter

### Mobile
- Card volle Breite mit Padding, vertikal mittig
- Input groß genug für Daumen
- Buttons mindestens 44 px Höhe

### Branding
- Ludwig-Wortmarke: dezent, nicht „buntes SaaS-Logo". Ernsthaft.
- Farbpalette ist noch offen — der Designer schlägt vor. Keine Tailwind-Defaults erforderlich.

---

## 3. Übergreifende Components

| Component | Zweck |
|---|---|
| **AppShell / Layout** | Sidebar (rollenabhängige Navigation) + Topbar (Kanzlei/Mandant-Switcher, User-Menü) + Content-Area |
| **Role-Badge** | kleine Pill mit „Stb" / „Mandant" / „Admin" — sichtbar oben rechts, damit klar ist in welchem Modus man arbeitet |
| **TenantSwitcher / ClientSwitcher** | Dropdown oben links, wechselt aktiven Mandanten (für Stb mit mehreren); für Mandanten-User mit N>1 Firmen analog |
| **DataTable** | sortier-/filterbar, mit Pagination, Row-Actions, Empty-State, Loading-Skeleton — Hauptelement für Belege, Buchungen, Kreditoren etc. |
| **DetailPanel / Drawer** | Slide-over oder Split-View für Beleg-/Buchungs-Details — Tabelle links, Detail rechts |
| **InvoicePreview** | Zwei-Spalten-Komponente: PDF-Renderer links, extrahierte/strukturierte Daten rechts (Header, Positionen, Summen) |
| **InterpretationPanel** | zeigt LLM-Ergebnisse: Konfidenz, Klärungsfragen, Review-Items, Buchungsvorschlag — Ambiguität ist *first-class*, nicht versteckt |
| **StatusBadge** | farbcodiert: `draft / ready_to_book / booked / archived`, plus Pipeline-Status `processing / succeeded / failed` |
| **ConfidenceIndicator** | Balken oder Score (0–100) mit Farbcode für LLM-Outputs |
| **ReviewItemCard** | „Prüfpunkt" — eine Sache, die ein Mensch entscheiden muss; mit Akzeptieren/Ablehnen/Nachfragen-Aktionen |
| **ClarificationDialog** | freie Rückfrage an den Mandanten, asynchrone Antwort |
| **UploadZone** | Drag-&-Drop für PDF-Belege, mit Multi-File + Live-Status pro Datei (Hash-Dedup, OCR, Extraktion, Interpretation) |
| **FormPrimitives** | Input, Select, Datepicker (DE-Format `dd.MM.yyyy`), MoneyInput (Decimal + Currency, nicht float), TextArea |
| **EmptyState** | für leere Listen — was fehlt, was tun |
| **Toast / Banner** | Erfolgs- / Fehlermeldungen, idealerweise mit Action-Link |
| **AuditTrail** | kompakte Timeline für „wer hat wann was gemacht" auf einer Buchung |

---

## 4. Subseiten / Screens — pro Screen mit Datenfeldern

> Quellen-Hinweis: Felder spiegeln die Tabellen in `ludwig.*`. Englische Spaltennamen aus dem Schema bleiben — Labels im UI sind die deutschen Begriffe aus `GLOSSARY.md`.

### 4.1 Auth (alle Rollen)

#### Login
Siehe ausführlich in Abschnitt 2 (Priorität).

#### Auth-Callback / Loading
**Anzeige:** kurzer Übergangs-Spinner während Token-Tausch. Bei Erfolg → `/dashboard`. Bei Fehler → `/login?error=callback`.

#### Pending-Account
**Anzeige:**
- E-Mail des eingeloggten Users
- Hinweistext + Kontakt-Info Admin
- Logout-Button

---

### 4.2 Stb-Track

#### Kanzlei-Dashboard
**Anzeige:**
- Kanzlei-Name
- Anzahl aktiver Mandanten
- Anzahl offener Belege (lifecycle_status `draft` / `ready_to_book`)
- Anzahl offener Klärungen
- Anzahl Review-Items
- Letzte 5 Aktivitäten (Mandant + Aktion + Zeit)

#### Mandanten-Liste
**Tabellenspalten:**
- Display-Name (`platform_clients.display_name`)
- Mandantennummer (`datev_client_number`)
- SKR-Variante (`skr04` / `skr03`)
- Versteuerung (`soll` / `ist`)
- Anzahl offener Belege
- Anzahl offener Klärungen
- Letzte Beleg-Aktivität (Datum)

**Aktionen:** Klick → Detail; Suche/Filter

#### Mandanten-Detail
**Header:**
- Display-Name, Mandantennummer, SKR-Variante, Versteuerung, Adresse (falls vorhanden)
- Aktiver Buchungszyklus (Fiscal Year + Origin `imported|created`)

**Tabs/Sektionen:** Belege, Buchungen, Kreditoren, Debitoren, Kontenrahmen, Service-Kategorien, Klärungen, Stammdaten

**Schnellaktionen:** Beleg hochladen, neue Klärung

#### Belegliste pro Mandant
**Tabellenspalten:**
- Beleg-Datum (`invoice_date`)
- Kreditor (`creditor` → `legal_name`)
- Belegnummer (`invoice_number`)
- Bruttosumme (`total_value` + `currency`)
- Lifecycle-Status (Badge: `draft` / `ready_to_book` / `booked` / `archived`)
- Pipeline-Status (kleines Icon: `processing` / `succeeded` / `failed`)
- Konfidenz (Score)
- Anzahl Klärungen / Review-Items

**Filter:** Status, Datum-Range, Kreditor, „nur mit Klärungen"

#### Beleg-Detail
**Linke Hälfte:**
- PDF-Renderer (Original-Beleg)

**Rechte Hälfte — Header-Block:**
- Kreditor (Name + Link zu Kreditor-Profil)
- Belegnummer
- Belegdatum (`invoice_date`)
- Fälligkeitsdatum (`due_date`)
- Buchungsdatum (`booking_date`)
- Reverse-Charge-Flag
- Währung
- Netto / Steuer / Brutto (`subtotal_value`, `tax_total_value`, `total_value`)
- Markdown-Snippet (extrahierter OCR-Text, einklappbar)

**Positionen-Tabelle (`client_invoice_line_items`):**
- Position
- Beschreibung
- Menge (`quantity`)
- Einzelpreis (`unit_price`)
- USt-Satz (`tax_rate_percent`)
- Gesamt (`total_price`)
- Source-Badge (`extracted` / `virtual_fallback` / `virtual_aggregate`)

**Interpretation-Panel:**
- Konfidenz (gesamt)
- Vorgeschlagenes Buchungskonto (Soll/Haben-Konto, Service-Kategorie)
- Vorgeschlagener Buchungstext
- Klärungsfragen (Liste)
- Review-Items (Liste)
- LLM-Reasoning (deutsch, einklappbar)

**Aktionen:** Akzeptieren, Bearbeiten, Ablehnen, Klärung an Mandanten senden

#### Klärungs-Postfach
**Tabellenspalten:**
- Mandant
- Beleg (Belegnummer + Kreditor)
- Frage (Snippet)
- Erstellt am
- Letzte Antwort am
- Status (`offen` / `beantwortet` / `geschlossen`)

**Drawer:** Vollständiger Klärungs-Thread mit Antwort-Eingabe

#### Kreditoren (pro Mandant)
**Tabellenspalten:**
- Legal Name
- Kreditorkonto-Nummer (`creditor_account_id` → `account_number`)
- VAT-Profile (Badge: `domestic_standard`, `domestic_reverse_charge`, `eu_acquisition_or_service`, `non_eu_reverse_charge`, `small_business_exemption`, `tax_exempt`, `margin_scheme`, `mixed`, `unknown`)
- Typical Nature (`goods` / `expense` / `mixed` / `unknown`)
- USt-IDs (`ust_ids` Array)
- Steuernummern (`tax_ids` Array)
- Onboarding-State (`draft` / `proposed` / `confirmed`)
- Source (`auto_profiled` / `imported` / `manual`)
- Anzahl Buchungen (`usage_booking_count`)
- Letzte Buchung (`last_booking_date`)

**Detail-Panel:**
- Adresse, IBAN, Webseite (falls vorhanden)
- Typische Zahlart (`typical_payment_type`)
- Typische Zahlungsfrist (`typical_payment_term_days`)
- Typische Währung (`typical_currency`)
- Business-Description (Freitext)
- VAT-Notes (Freitext, Escape-Hatch)
- Service-Kategorien-Zuordnungen

#### Kontenrahmen
**Tabellenspalten:**
- Kontonummer (`account_number`)
- Kontoname (`account_name`)
- Beschreibung (`description`)
- Konto-Typ (`general_ledger` / `creditor` / `debtor` / `revenue` / `other`)
- Konto-Klasse (`fixed_assets`, `current_assets`, `equity`, `liabilities`, `revenue`, `material_expense`, `operating_expense`, `neutral_financial`, `not_used`, `carryforward`)
- Source (`client_override` / `skr_base`)
- Anzahl Buchungen
- Letzte Buchung

#### Buchungsjournal
**Tabellenspalten:**
- Buchungsdatum
- Belegnummer (`belegfeld1`)
- Belegfeld 2 (`belegfeld2`)
- Buchungstext (`buchungstext`)
- Soll-Konto (`debit_account_id` → Nr. + Name)
- Haben-Konto (`credit_account_id` → Nr. + Name)
- Betrag + Währung
- USt-Schlüssel (`vat_key`)
- USt-Satz (`vat_rate_percent`)
- Kost1 / Kost2
- Origin (`imported` / `ai_proposed` / `manual`)
- Status (`proposed` / `accepted` / `posted` / `reversed`)

**Aktionen:** DATEV-Export, Filter

#### Mandant onboarden (Wizard)
**Schritt 1 — Stammdaten:**
- Display-Name, Mandantennummer, SKR-Variante (Select), Versteuerung (Select), Onboarding-Folder-Pfad

**Schritt 2 — DATEV-Import (Live-Status):**
- Anzahl importierter Konten / Kreditoren / Debitoren / Buchungen / Zyklen

**Schritt 3 — Belege ingest (Live-Status):**
- Anzahl PDFs gefunden / verarbeitet / fehlgeschlagen, Fortschrittsbalken, Beleg-für-Beleg-Status

**Schritt 4 — Backfill + Enrichment (Live-Status):**
- Anzahl Kreditoren mit USt-IDs ergänzt, Konten/Kategorien mit LLM angereichert

#### Profil
**Anzeige:**
- E-Mail
- Anzeigename (`platform_users.display_name`)
- Kanzlei (Name)
- Rolle innerhalb Kanzlei
- Account-Status

**Aktionen:** Abmelden

---

### 4.3 Mandanten-Track

#### Mandanten-Dashboard
**Anzeige:**
- Firmenname
- Anzahl Belege gesamt / in Bearbeitung / mit Klärungen
- Letzte 5 hochgeladene Belege

#### Belege hochladen
**UploadZone:**
- Drag-&-Drop-Bereich
- Liste der laufenden Uploads: Dateiname, Größe, Status (`uploading` / `dedup-check` / `ocr` / `extraction` / `interpretation` / `done` / `error`)
- Bei `done`: Link zum Beleg-Detail

#### Meine Belege
Wie Stb-Belegliste, aber **ohne** Kanzlei-Aktionen (kein Akzeptieren/Buchen — read-only + Klärungen-Antworten)

#### Beleg-Detail (Mandant-Sicht)
- PDF-Vorschau
- Stammdaten (Datum, Kreditor, Belegnummer, Brutto)
- Status (`draft` / `ready_to_book` / `booked` / `archived`)
- Offene Klärungen vom Stb (mit Antwort-Feld)

#### Klärungen
**Liste:**
- Beleg, Frage (Snippet), Stb-Anfrager, Datum, Status

#### Profil
**Anzeige:**
- E-Mail, Anzeigename, Liste der Mandanten in denen User Mitglied ist (Name, Rolle), Logout

---

### 4.4 Admin-Track

#### Admin-Übersicht
**Anzeige:**
- Anzahl Kanzleien, Mandanten, User insgesamt
- User-Verteilung nach `kind`
- System-Health (Workflows-API erreichbar? Supabase erreichbar?)

#### Kanzleien-Liste
**Tabellenspalten:**
- Name (`platform_tenants.name`)
- Slug
- Anzahl Mitarbeiter (`memberCount`)
- Anzahl Mandanten (`clientCount`)
- Angelegt am (`created_at`)

**Form: Neue Kanzlei**
- Slug (lowercase a-z, 0-9, hyphen, 2-64 Zeichen)
- Name (1-120 Zeichen)

#### Kanzlei-Detail
**Header:** Name, Slug, Mitglieder-Count, Mandanten-Count, Angelegt am

**Sektion „Mitarbeiter":** User-Tabelle (User-ID, Anzeigename, Status, Rolle)

**Sektion „Mandanten":** Mandanten-Tabelle (Name, Mandantennummer, SKR, # User)

#### User-Liste (Cross-Tenant)
**Tabellenspalten:**
- User-ID (verkürzt)
- Typ (`kind`: tenant_user / client_user / platform_admin)
- Anzeigename
- Status (`active` / `invited` / `disabled`)
- Kanzlei (Name, falls Stb)
- Anzahl Mandanten (falls Mandanten-User)

**Aktionen:** Bearbeiten

#### User-Detail
**Profil-Sektion:**
- User-ID
- Typ (Select: tenant_user / client_user / platform_admin)
- Status (Select: active / invited / disabled)
- Anzeigename (Text)

**Kanzlei-Sektion:**
- Kanzlei (Select: alle Kanzleien oder „—keine—")
- Rolle innerhalb Kanzlei (Text)

**Mandanten-Sektion:**
- Liste aktueller Memberships: Mandantenname, Rolle, Status, Entfernen-Button
- Add-Form: Mandant-Select (alle Mandanten cross-Tenant) + Hinzufügen-Button

#### Audit-Log (später)
**Tabellenspalten:**
- Zeitstempel
- Akteur (User)
- Aktion (Typ)
- Ziel (Tabelle + Row-ID)
- Diff (kompakt)

---

## 5. Notification-E-Mails (Templates, Phase 7)

### Magic-Link
- Anrede mit `display_name` (falls vorhanden) oder „Hallo"
- Link-Button + Fallback-URL
- Hinweis: Link zeitlich begrenzt gültig, einmalig
- Footer: Ludwig-Name, Impressum-Link

### Einladung Stb / Mandanten-User
- Anrede
- Wer hat eingeladen (Name + Kanzlei/Mandant)
- Welche Rolle (Stb / Mandant)
- Aktivierungs-Button

### „Beleg verarbeitet"
- Mandant
- Anzahl neuer Belege bereit zur Prüfung
- Direktlink zur Belegliste

### „Klärung wartet"
- Beleg-Stamm (Kreditor + Datum + Brutto)
- Frage (Snippet)
- Direktlink zum Beleg

---

## 6. Design-Constraints (überall gültig)

- **Sprache:** Alles DE. Fachbegriffe DATEV-konform (`Buchungstext`, `Belegfeld 1/2`, `Kost1/Kost2`, `SKR03/SKR04`, `Kreditor`, `Debitor`, `Soll/Ist-Versteuerung` — bleiben deutsch).
- **Rollen-Trennung sichtbar:** Stb-Track und Mandanten-Track dürfen visuell ähnlich sein, müssen aber durch Header/Badge sofort erkennbar sein.
- **Ambiguität first-class:** Konfidenzwerte, Klärungsfragen, Review-Items sind echte UI-Elemente, nicht Tooltips.
- **Money + Datum:** alle Beträge mit Währung (`1.234,56 €`), alle Daten DE-formatiert (`dd.MM.yyyy`).
- **Belegvorschau ist zentral:** PDF + strukturierte Daten Side-by-Side ist *die* Hauptarbeitsoberfläche.
- **Empty States ausgearbeitet:** „Noch keine Belege" erklärt *wie* welche reinkommen (Upload / Mail-Inbox / Drag-Drop).
- **Mobile:** Stb arbeitet desktop-first. Mandant evtl. auch mobile (Beleg-Foto-Upload). Admin reines Desktop.
- **Keine Marketing-Seite, keine Landing.** Login ist die Tür.
- **Kein Dark-Mode initial.**

---

## 7. Was der Designer **nicht** designen muss (Phase-Scope)

- Marketing- / Public-Pages
- Passwort-Login (nur Magic Link)
- Self-Service-Signup (User werden vom Admin/Stb eingeladen oder klassifiziert)
- Mehrsprachigkeit (nur DE)
- Dark-Mode

---

## 8. Was der Designer mit dem Datenmodell tun soll

1. Pro Screen die Felder zunächst **alle einplanen** — Reduktion machen wir gemeinsam, wenn Wireframes da sind.
2. Bei Tabellen: welche Spalten Default-sichtbar, welche per Spalten-Picker.
3. Bei Detail-Screens: was Hauptfokus, was in einklappbaren Sektionen.
4. Bei Forms: welches Feld Required, welche Validierung sichtbar (z. B. Slug-Pattern).
5. Empty-States pro Tabelle / Liste mitdenken.

Wenn Felder fehlen oder doppelt erscheinen → fragen. Schema kann sich ändern, aber Naming muss zum Glossar passen.

---

## 9. Naming-Quellen für den Designer

- `GLOSSARY.md` im Repo — kanonische Begriffe DE / EN für jeden Datentyp.
- `docs/architecture.md` — wie die Schichten zusammenspielen (für Kontext, nicht zum Implementieren).
- `docs/database-write-ownership.md` — welche Daten kommen aus welchem System (Web direkt vs. Workflows-API). Relevant für State-/Loading-Anzeigen.

---

## 10. Lieferreihenfolge (Vorschlag)

1. **Login + Auth-Flows** (höchste Priorität — siehe Abschnitt 2)
2. **AppShell** (Sidebar / Topbar / Role-Badge / Switcher) für alle drei Tracks
3. **Stb-Track**: Mandanten-Liste, Mandanten-Detail, Belegliste, Beleg-Detail (das ist die Kernarbeitsoberfläche)
4. **Mandanten-Track**: Dashboard, Upload, Belegliste, Klärungen
5. **Admin-Track**: Übersicht, Kanzleien, User-Liste, User-Detail
6. **E-Mail-Templates** zuletzt
