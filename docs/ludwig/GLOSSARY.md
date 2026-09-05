# GLOSSARY.md

This file is the canonical glossary for Ludwig technical and business concepts.

Its purpose is to prevent naming drift and data model pollution.

## Rules

- Before adding a new concept, check whether the meaning already exists here.
- A concept should be added only if it is materially distinct.
- If the meaning is the same, reuse the existing concept and naming.
- Every glossary concept should have:
  - English name
  - German name
  - short definition
  - data type (entity / enum value / text column / concept / schema)
  - example (concrete instance, enum value, or reference)
  - notes on boundaries or common confusion
- If a term changes, update docs, contracts, schema names, and UI labels consistently.
- **Tabellennamen-Konvention für NEUE Tabellen: Singular** (wie das Accounting-Modell: `client_accounting_case`, `client_journal_entry_line`). Bestehende Plural-Tabellen werden NICHT umbenannt (Datenmodell-Review 2026-07-29 §2.4.15 — Massen-Rename lohnt nicht).
- **Abkürzungs-Konvention (Owner 2026-08-21): Ludwig-interne Abkürzungen starten mit „L"** (LSV = Ludwig-Sachverhalt, LDSV = Ludwig-Dauersachverhalt). DATEV-Begriffe behalten ihr Original-Kürzel ohne Präfix (WK = wiederkehrende Buchungen, BU-Schlüssel, KOST) — so kollidieren Ludwig-Kürzel nie mit DATEV-Kürzeln (z. B. DATEV `SV` = Stapelverarbeitung).
- **Jahresbindung (F76 R6, Owner 2026-08-14):** Eine Tabelle mischt nicht: trägt sie `fiscal_year_id`, sind alle ihre Spalten jahresgebunden; trägt sie es nicht, ist keine jahresgebunden. Jahresfreie Semantik an einer jahresgebundenen Tabelle wird ausgezogen (Präzedenz: `client_account_enrichment`). Jahresfreie Sichten auf jahresgebundene Tabellen heißen `<tabelle>_current`.
- **Jahresgebundene Verweise tragen `fy_` (F76 R8, Owner 2026-08-21):** Jede FK-Spalte, die auf eine jahresgebundene Tabelle zeigt, heißt `fy_<name>` (`fy_personal_account_id`, `fy_ledger_account_id`) — beim Lesen einer Query ist damit ohne Schema-Blick erkennbar, ob WJ-Kontext nötig ist. Die jahresgebundene Entität heißt ausgeschrieben `fiscal_year` (dt. Wirtschaftsjahr); das Entitäts-Rename (`client_fiscal_years` → `client_fiscal_years`) ist eine eigene Welle (F93). Abgrenzung zum System-Präfix: `fy_` beschreibt die Jahresbindung des VERWEISES, `datev_*` die HERKUNFT des Werts — sie werden nicht kombiniert. Tabellennamen bekommen kein Präfix; dort ist `fiscal_year_id` der Marker (R6).

### Rand-Regel (DATEV-Wording, Datenmodell-Review 2026-07-29)

Tabellen, die DATEV-Daten spiegeln oder transportieren (`client_datev_*`,
`ops_datev_ingest_staging`), verwenden die DATEV-API-Feldnamen bzw. hier
dokumentierte Übersetzungen 1:1 (`accounting_sequence_id`, `is_committed`,
`inspection_status`, `main_function_number`, `document_link_*`). Der
Ludwig-Kern (`client_accounting_*`, `client_journal_entry*`) spricht die
eigene englische Sprache — DATEV-Begriffe dort nur als bewusste
„DATEV-exception" (Belegfeld, BU-Schlüssel, KOST, Buchungsstapel,
soll/ist). Die Brücke sind die Glossar-Einträge plus die Mapping-Tabelle
in `docs/topics/datev.md`. Grund: DATEV-Begriffe tragen eine
flachere Semantik (ein DATEV-„Buchungssatz" ist eine Zeile) — gleiches
Wort über verschiedenen Modellen erzeugt genau die Verwirrung, die dieses
Glossar verhindern soll.

## Naming review checklist

Before introducing a new model, type, table, route, DTO, or UI label:

1. Is this really a separate concept?
2. Is there already a near-synonym in this glossary?
3. Is the distinction business-real, or only implementation-local?
4. What is the canonical English term?
5. What is the canonical German term?
6. Where is this concept allowed to live:
   - `workflows` service
   - stateless processing modules
   - database schemas

## Business concepts

### Datenmodell-Schichten (Refactor 2026-05-27, umgesetzt)

Das Datenmodell trennt vier Schichten: **Quelle → Ereignis → Sachverhalt
→ Buchung**. Diese Tabelle ist die autoritative Namensreferenz.

Seit dem Datenmodell-Review 2026-07-11 gilt zusätzlich:

- **Ein ID-Raum:** `client_accounting_event.source_doc_id` trägt IMMER die
  Basis-Id (`client_source_docs.id`) mit echtem FK (RESTRICT). Der frühere
  Zwei-ID-Raum (Subtyp-Id für UI-/Workflow-Ingest) und die OR-Joins der
  Query-Schicht sind abgebaut (F11-T11.6-Zielbild).
- **`tenant_id` überall:** jede `client_*`-Tabelle trägt `tenant_id`
  (NOT NULL, FK); BEFORE-INSERT-Trigger leiten es aus `client_id` bzw. dem
  Parent ab, Writer müssen es nicht mitliefern.
- **Bewusste Denormalisierung am Buchungs-Header:**
  `client_journal_entry.business_partner_id` (F76: ein Feld statt
  `creditor_id`/`debtor_id`) doppelt den Personenbezug der Lines
  (Personenkonten) für OPOS-Queries. Wahrheit sind die Lines — bei Konflikt
  gewinnt die Line, der Header ist Beschleuniger.
- **Periode:** `client_fiscal_years` ist die Wirtschaftsjahres-Klammer
  (siehe „Fiscal year (Entität)") — gedacht für den Jahresabschluss nach
  DATEV-Muster: EB-Werte/Saldovortrag zum Jahresstart, Festschreibung am
  Jahresende. Events, Buchungen und Rechnungs-Subtypen hängen daran.

| Schicht | Code (EN) | DE | Status | Was es ist |
|---|---|---|---|---|
| Quelle (Dokument) | `client_source_docs` | Beleg / Quell-Dokument | Rename ex `client_document_inbox` | Rohes Dokument mit `source_doc_type` (was IST das Dokument). Generisch für alle Dokumenttypen. |
| Quelle (Subtyp Rechnung) | `client_source_docs_invoices` | Rechnungs-Detail | Rename ex `client_invoices` | 1:1-Subtyp zu `client_source_docs`. Trägt `doc_direction` (`inbound` / `outbound`; ex `accounting_role`, F87). |
| Quelle (Bank) | `client_bank_transactions` | Kontoauszugsposition | bleibt | Eine Zeile aus CSV / Qonto-API. |
| Ereignis | `client_accounting_event` | Geschäftsereignis | neu | Punkt-in-Zeit-Ereignis: Belegeingang, Bankbewegung, manuelle Erfassung. Hängt 1:N am Sachverhalt, 1:0..1 an genau einer Quelle. |
| Klammer | `client_accounting_case` | Sachverhalt / Geschäftsvorfall | Rename ex `btx` | Fachliche Klammer um zusammengehörige Ereignisse. Bleibt bei `kind=recurring_charge` offen über mehrere Realisierungen. |
| Buchung (Header) | `client_journal_entry` | Buchungssatz | Rename + Refactor ex `client_bookkeeping_entries` | Pro Ereignis genau eine Buchung. `status` ∈ {proposed, accepted, posted, reversed}. |
| Buchung (Lines) | `client_journal_entry_line` | Buchungszeile | neu (heute am Header) | Side-Pattern (`side ∈ {debit, credit}`, `amount > 0`). Sum-Constraint pro Header. |
| Klärung | `client_accounting_case_clarification` | Klärungsfrage | Rename ex `btx_clarifications` | Hängt am Sachverhalt. `severity='required'` blockiert die Buchung bis zur Antwort (die früheren `blocks_*`-Spalten sind seit Migration 20260705113000 entfernt — nie befüllt, F11-T11.5). |

**Naming-Trennung am Source-Doc:**

- `source_doc_type` (neu) sagt was das Dokument IST: `invoice` /
  `contract` / `bank_statement_pdf` / `travel_expense_report` /
  `declaration` / `other`.
- `doc_direction` (ex `accounting_role`) lebt nur noch am Invoice-Subtyp und sagt nur noch
  `inbound` / `outbound` / `internal` (Werte-Migration F87: `incoming → inbound`, `outgoing → outbound`).

**Status-Trennung auf drei Achsen, jede an eigener Entity:**

| Achse | Wohnort | Werte |
|---|---|---|
| Fachlich (Reviewer) | `client_accounting_case.lifecycle_status` | `open` / `needs_clarification` / `closed_accepted` / `closed_rejected` / `closed_superseded` |
| Technisch (Pipeline) | `client_source_docs.status` + `client_source_docs_invoices.processing_status` | `received` / `classifying` / `extracting` / `interpreting` / `proposing` / `ready` / `failed` / `superseded` |
| Buchung (Audit) | `client_journal_entry.status` | `proposed` / `accepted` / `posted` / `reversed` |
| Abschluss (Beleg) | `client_source_docs.completed_at` + `completed_reason` | Timestamp + Freitext; `NULL` = noch offen |

**Bewusst NICHT in Phase 1:**

- `client_contract` (Vertrag) — Recurring bleibt als `kind=recurring_charge` am Case.
- `client_open_item` (Offene Posten) — wird über offene Cases ausgedrückt. Seit F77 (2026-08-15) gibt es die **Zuordnung** Rechnung↔Zahlung als eigene Tabelle `client_open_item_links` (siehe „Ausgleichs-Zuordnung“); der offene Posten selbst bleibt abgeleitet.
- `client_journal_entry_audit_log` — Trail-Spalten am Header reichen erstmal.

### Tenant

- English: `tenant`
- German: `Kanzlei`
- Definition: The tax advisory, law, or accounting firm that owns access boundaries and manages clients.
- Data type: entity (`ludwig.platform_tenants` row, uuid PK)
- Example: `{ id: …, slug: "prototype", name: "Ludwig Prototype Tenant" }`
- Notes: Top-level access and ownership boundary. Lives in the `platform` schema because it is SaaS-infrastructure, not bookkeeping domain. Avoid synonyms like “organization” unless the scope changes materially.

### Platform user

- English: `platform user`
- German: `Plattform-User`
- Definition: An authenticated identity inside Ludwig with an explicit `kind` classification (Tenant-User / Client-User / Platform-Admin). The classifier drives UI, lifecycle (signup, invite, mailings) and which membership tables the user is allowed to appear in.
- Data type: entity (`ludwig.platform_users` row, FK 1:1 to `auth.users`).
- Example: `{ user_id: …, kind: "tenant_user", display_name: "Lara Becker", status: "active" }`
- Notes: Every authenticated user must have exactly one row in `platform_users`. Tenant-Users and Client-Users are mutually exclusive — a Steuerberater who also owns a Mandant must register a separate account with a separate email (see decision log 2026-04-29 "User-Typen sind exklusiv"). `auth.users` remains the authentication identity layer — `platform_users` is the application-level role classifier.

### Tenant user

- English: `tenant user`, `Stb-User`
- German: `Kanzlei-Mitarbeiter`, `Steuerberater-User`
- Definition: A platform user with `kind = 'tenant_user'`. Belongs to **exactly one** Kanzlei and sees all Mandanten of that Kanzlei.
- Data type: entity (`ludwig.platform_tenant_users` row, FK to `ludwig.platform_tenants` and `ludwig.platform_users`); `unique(user_id)` enforces the 1:1 cardinality between Stb-User and Kanzlei.
- Example: `{ tenant_id: …, user_id: …, role: "owner", status: "active" }`
- Notes: Was previously called just „User" / „Mitarbeiter". The classifier on `platform_users.kind` makes the type explicit; the trigger `enforce_tenant_user_kind` blocks Client-Users from being inserted here.

### Client user

- English: `client user`, `Mandanten-User`
- German: `Mandanten-Mitarbeiter`
- Definition: A platform user with `kind = 'client_user'`. Belongs to **one or many** Mandanten — N:M against `platform_clients`. End-customers in their own bookkeeping context; never an employee of a Kanzlei.
- Data type: entity (`ludwig.platform_client_users` row, FK to `ludwig.platform_clients` and `ludwig.platform_users`); `unique(client_id, user_id)` per row, no `unique(user_id)` (the same user may appear in multiple Mandanten).
- Example: `{ client_id: <Müller GmbH>, user_id: <Simon>, role: "owner", status: "active" }` and a second row `{ client_id: <Schmidt UG>, user_id: <Simon>, role: "member", status: "active" }`.
- Notes: Cleanly distinct from Tenant-User. The trigger `enforce_client_user_kind` blocks Tenant-Users from being inserted here.

### Client portal

- English: `client portal`
- German: `Mandanten-Portal`
- Definition: The web view for `Client user`s (route `/(app)/portal/[clientSlug]`, module `apps/web/src/modules/client-portal/`): lists their accounting cases with `disposition = 'client'`, lets them answer open clarification questions with `audience = 'client'`, and upload documents onto a case. Shows exclusively `client_text` — `professional_text` never reaches the portal.
- Data type: web module / route (no own tables; reads `client_accounting_case` + `client_accounting_case_clarification`, writes via the `answerClarification` core and the document-inbox upload flow).
- Notes: The Mandant participates in the loop as a **human with a real Supabase login** — deliberately no client-side agent (owner decision 2026-07-04). A portal answer to an agent question auto-routes the case back to `disposition = 'agent'` (F01-T1.4). Access is enforced app-side via `canAccessClientPortal` (client membership / same-tenant Kanzlei / platform admin) — see `docs/topics/architektur-offen.md` → "Mandanten-Portal" for what is *not* enforced yet.

### Platform admin

- English: `platform admin`
- German: `Plattform-Admin`
- Definition: A platform user with `kind = 'platform_admin'`. Internal role — operators of Ludwig itself, not customers. May appear in `platform_tenant_users` and `platform_client_users` simultaneously (for testing, supporting, debugging) without violating the exclusivity rule.
- Data type: a `platform_users` row with `kind = 'platform_admin'`.
- Notes: Detection is via the SQL helper `ludwig.is_platform_admin()`. RLS helpers (`is_member_of_tenant`, `is_member_of_client_tenant`) short-circuit on platform-admin to grant read access across the system. Do not extend this kind to customer-facing flows.

### Agent-Verbindung (agent connection)

- English: `agent connection`
- German: `Agent-Verbindung`
- Definition: Eine Art, wie sich ein nicht-menschlicher Client an Ludwig anmeldet. Eine Verbindungsart = ein Wert in `ludwig.platform_agent_tokens.scope` = **eine** Route mit eigenem Werkzeugkasten; die Route lehnt jeden anderen Scope mit 401 ab. Heute drei: `agent` (Buchungsagent, eine Kanzlei, `/api/mcp`), `bridge` (DATEV-Bridge, eine Kanzlei, `/api/bridge/v1`), `technical` (Entwicklungsagent, Plattform ohne Tenant/Mandant, `/api/technical/mcp`).
- Data type: column (`ludwig.platform_agent_tokens.scope`), Katalog `AGENT_CONNECTION_KINDS` in `apps/web/src/core/agent/agent-connection.ts`.
- Notes: Scope ist die **Rolle**, `tenant_id`/`client_id` die **Reichweite** — per CHECK erzwungen (`platform_agent_tokens_reach_check`). Kein Tool-Level-Rechtesystem: wer mehr Feinheit braucht, bekommt eine vierte Verbindungsart. Regel: `docs/topics/architektur.md` R29.

### Client

- English: `client`
- German: `Mandant`
- Definition: A company or business entity managed by a tenant.
- Data type: entity (`ludwig.platform_clients` row, uuid PK)
- Example: `{ display_name: "Müller GmbH", account_framework_code: "skr04", taxation_type: "soll" }`
- Notes: Durable business entity. A client belongs to exactly one tenant. Do not mix with `creditor` / `debtor` concepts from accounting documents. Stays in `ludwig` (bookkeeping domain), not `platform`.

### Replay client (Replay-Mandant)

- English: `replay client`
- German: `Replay-Mandant`
- Definition: Ein zweiter Ludwig-Mandant für **denselben realen Mandanten**, onboardet auf einen alten Stichtag, um die Folgeperiode noch einmal komplett durch die Pipeline laufen zu lassen und Ludwigs Buchungen gegen die tatsächlich in DATEV gebuchten Stapel zu vergleichen (Bewertung des Buchungsalgorithmus). Staging-Werkzeug, nie Produktion.
- Data type: column (`ludwig.platform_clients.replay_cutoff_date date` — gesetzt ⇔ Replay-Mandant; nach Anlage unveränderlich)
- Notes: Original und Replay-Stand teilen sich DATEV-GUID/-Nummer; die partiellen Unique-Indizes erlauben das, solange nur **einer aktiv** ist (`is_active`). Der Stichtag setzt `booking_closed_until`, schneidet die Importe (OPOS) und sperrt den DATEV-Export. Konzept: `docs/topics/onboarding.md`; Bewertung: Replay-Tab der DATEV-Wahrheit.

### Visibility cutoff (Sichtbarkeits-Cutoff)

- English: `visibility cutoff`
- German: `Sichtbarkeits-Cutoff`
- Definition: Beim Replay-Mandanten wird der DATEV-Spiegel **voll** importiert (er ist die Vergleichswahrheit), in den Agenten- und Pipeline-Lesepfaden aber am `replay_cutoff_date` abgeschnitten. Umgesetzt im `mirror`-Zweig der View `client_effective_journal_lines`; die Zweige `journal`/`proposed`/`client_import` bleiben ungefiltert, damit der Agent seine eigenen Buchungen der Replay-Periode weiter sieht.
- Notes: Die Garantie ruht auf der Chokepoint-Regel (Agenten-/Pipeline-Code liest Historie nur über die View), nicht auf fehlenden Daten — abgesichert durch `replay-mirror-chokepoint.test.ts` und den Leakage-Canary `scripts/smoke-replay-cutoff-leak.ts`. Siehe `docs/topics/architektur-offen.md` §12 und `docs/topics/architektur-offen.md`.

### Client number

- English: `client number`
- German: `Mandantennummer`
- Definition: The stable client reference used to identify a client within a tenant context.
- Notes: Prefer `client number` or `client reference` in code and file paths. Do not use the German term directly in code.

### Booking style (Buchungsstil)

- English: `booking style`
- German: `Buchungsstil`
- Definition: Per-client convention for how a purchase/sale is booked. `kreditorisch` (creditor-side, Default): two journal entries per case — the document event books expense/VAT **an Kreditor**, the payment event books **Kreditor an Bank** (OPOS stays visible, period-accurate, handles Skonto/partial payment). `direkt` (direct): one entry at the payment event (Bank an Aufwand, "paid = booked") — opt-in for small EÜR/cash-basis clients.
- Data type: column (`ludwig.platform_clients.booking_style text not null default 'kreditorisch'`, CHECK ∈ {`kreditorisch`, `direkt`})
- Notes: Owner-Entscheid 2026-07-05 (decision-log „Buchungskonventionen"). Der MCP-Agent liest ihn über `get_client_profile` und schlägt ein oder zwei Buchungssätze je Sachverhalt vor. Onboarding erhebt eine Auto-Empfehlung (Anteil Zahlungen gegen Kreditoren-Personenkonto), überschreibt den Wert aber nicht — die Kanzlei bestätigt. Kein automatisches Umbuchen bestehender Sätze beim Umschalten.

### Booking interval (Buchungsintervall)

- English: `booking interval`
- German: `Buchungsintervall`
- Definition: Per-client cadence at which bookkeeping runs are performed (`weekly` | `monthly` | `quarterly` | `yearly`). Together with **booking closed until** it derives the period of the next agent booking run: from = closed-until + 1 day, to = from + one interval (inclusive).
- Data type: column (`ludwig.platform_clients.booking_interval text not null default 'monthly'`, CHECK ∈ {`weekly`, `monthly`, `quarterly`, `yearly`})
- Notes: Bestätigt im Onboarding-Review (Admin-Wizard). Perioden-Arithmetik: `nextBookingPeriod` (`apps/web/src/modules/clients/application/booking-period.ts`).

### Booking closed until (Buchhaltung abgeschlossen bis)

- English: `booking closed until`
- German: `Buchhaltung abgeschlossen bis`
- Definition: Date (inclusive) up to which the client's bookkeeping is considered closed. Stored as a **date**, not a period, so a later interval change does not distort the state. Initially filled in onboarding from the end of the last imported DATEV posting batch (max `posting_date` in the mirror); advanced by the DATEV export when the user checks "Intervall abschließen".
- Data type: column (`ludwig.platform_clients.booking_closed_until date`)
- Notes: `start_agent_run` derives the run period from it (persisted as `client_agent_runs.period_from/period_to`) and `list_open_transactions(from)` hides bank transactions before the period — closed intervals are no longer agent work. No upper bound: newer transactions (beyond `period_to`) stay bookable; `period_to` is only the close target for the export.

### Posting text (Buchungstext)

- English: `posting text`
- German: `Buchungstext`
- Definition: Der Freitext einer Buchung (`client_journal_entry.description`), der im DATEV-EXTF-Export in der Spalte „Buchungstext" landet. Konvention (F14-T14.5): kurz, deutsch, Nominalstil, **max. 60 Zeichen** (EXTF-Feldgrenze), Muster `<Kreditor-Kurzname> <Leistung> <Zeitraum>`; keine Konto-/Steuerinfos, keine Rechnungsnummer (die gehört in `external_document_number`/Belegfeld 1).
- Data type: column `ludwig.client_journal_entry.description text` (Schema-Grenze 300, Konvention 60); Mandanten-Override `ludwig.platform_clients.posting_text_convention text` (Freitext, NULL = globaler Standard).
- Notes: Der Standard ist eine **Playbook-Anweisung** (`get_guideline(name='playbook')` Phase 4), kein Schema-Constraint — keine harte Submit-Validierung. Der MCP-Agent liest `posting_text_convention` über `get_client_profile`; ist es gesetzt, überschreibt es den globalen Standard. Pflege über die Mandanten-Konfigurationsseite (Web).

### Journal entry line (Teilbuchung)

- English: `journal entry line`
- German: `Teilbuchung` (auch: `Buchungszeile`)
- Definition: Eine Zeile des Buchungssatzes (`client_journal_entry_line`,
  Side-Pattern). Begriffsklärung StB-Rückspräche 2026-07-13: das Ganze ist
  der **Buchungssatz** (`client_journal_entry`), die Zeilen sind
  **Teilbuchungen**.
- **Alle DATEV-Felder hängen an der Teilbuchung** (StB-Rückspräche
  2026-07-14): `line_description` (Buchungstext, max. 60),
  `external_document_number` / `_2` (Belegfeld 1 / 2, max. 36 / 12) und
  `kost1` / `kost2` (Kostenstelle / Kostenträger). DATEV kennt **keine**
  Satz-Kopf-Ebene: ein EXTF-Buchungssatz *ist* eine Zeile (Konto gegen
  Gegenkonto) und trägt diese Felder als eigene Spalten. Es gibt daher weder
  Kopfwerte noch einen Fallback — was nicht an der Zeile steht, bleibt in der
  DATEV-Datei leer.
- Data type: table `ludwig.client_journal_entry_line`.
- Notes: Beim Export wird je Split-Zeile eine EXTF-Zeile erzeugt; die führende
  Zeile liefert alle Felder, die Gegenzeile nur ihre Kontonummer (Gegenkonto).
  Damit kann ein Aufwandssplit je Zeile eine eigene Kostenstelle tragen (60 %
  Vertrieb / 40 % Verwaltung) und eine Multizahlung je Rechnung ein eigenes
  Belegfeld 1 (F33). Der Buchungs-Judge darf genau diese Felder direkt
  korrigieren (Kriterium B8) — Konto, Betrag und Steuerschlüssel bleiben ihm
  verwehrt.

### Accounting case (Sachverhalt)

- English: `accounting case`
- German: `Sachverhalt` / `Geschäftsvorfall`
- Table: `ludwig.client_accounting_case` (Refactor 2026-05-27; vorher `ludwig.btx`)
- Definition: Aggregat-Root für einen fachlichen Buchhaltungs-Vorgang. Verklammert 0..N **Ereignisse** (`client_accounting_event`) zu **einem** Vorgang. Recurring (Miete, Versicherung, Abo) bleibt bei `kind=recurring_charge` offen über mehrere Realisierungen.
- Data type: entity / table (`ludwig.client_accounting_case`)
- Notes:
  - Phase-1-Pipeline: 1 Belegeingang → 1 Case (über ein `document_received`-Event). Recurring-Auto-Merging ist Phase-2-Backlog.
  - Reviewer-Status (`lifecycle_status` ∈ {open, needs_clarification, closed_accepted, closed_rejected, closed_superseded}) lebt am Case.
  - Buchungs-Vorschlag ist **kein JSON-Blob mehr** am Case, sondern ein eigenständiger `client_journal_entry` mit `status='proposed'` (siehe „Journal entry").
  - Klärungsfragen (`client_accounting_case_clarification`) hängen am Case; Blocking läuft über `severity='required'` (+ `audience`/`disposition`), nicht mehr über die 20260705113000 gedroppten `blocks_*`-Spalten.
  - Vorgänger-Modell `btx`/`btx_belege`/`btx_bank_transactions` (Migration 20260519160000) ist mit Migration 20260527140000 ersetzt.
  - **Case merge (Sachverhalts-Zusammenführung)**: Dubletten löst der Agent via `find_case_merge_candidates` (offene Cases derselben Gegenpartei) + `merge_cases` auf — Events + Klärungen wandern zum target, source wird `closed_superseded` (Audit: `case.merged_by_agent` / `case.superseded_by_merge`).
  - **Ein Sachverhalt, ein Personenkonto** (`fy_personal_account_id`, F75-T75.3, 2026-08-13): Ein Sachverhalt setzt sich mit **höchstens einer** Geschäftsbeziehung auseinander — Kreditor, Debitor oder Diverse-Konto. **NULL heißt „hat bewusst keins"** (Sammel-Sachverhalt, interne Umbuchung, reine Sachbuchung), nicht „unbekannt". Den Wert leitet **der Server** ab (Klammer-Konto beim Sachverhalts-Zuschnitt; beim Beleg-Sachverhalt die Kreditoren-/Debitorenzuordnung), der Agent setzt ihn nie; `get_case` liefert ihn als Vorgabe (`personal_account_number`), der Guard `casePersonalAccountLocked` (`B7_CASE_PERSONAL_ACCOUNT_MISMATCH`, block) lehnt eine Belegbuchung gegen ein abweichendes Personenkonto ab. Abweichen heißt: erst das Feld am Sachverhalt ändern lassen, dann buchen — kein Freitext-Override im Buchungsaufruf. Verhindert F65-S2 (Rechnung und Zahlung auf zwei Konten, keine Seite gleicht die andere aus) am Ursprung. Name folgt `client_accounting_case_rule.fy_personal_account_id`; angezeigt am Sachverhalts-Kopf und in der Abnahme-Karte.
  - **Gegenpartei-Seite** (`counterparty_side`, F92, 2026-08-21): Welche Personenkonto-Hälfte gesucht wird — `'creditor'` | `'debtor'`, **NULL = bewusst keine** (interne Umbuchung, reine Sachbuchung, Sammel-Sachverhalt), nicht „unbekannt". Sie ist früher bekannt als die Identität und filtert, **bevor** ein Konto feststeht, dessen `accounting_role` die Rolle tragen würde. Abgeleitet beim Anlegen des Sachverhalts nach fester Präzedenz: festgelegtes Personenkonto → DATEV-OPOS → Beleg-Richtung (`doc_direction`) → Wiederkehr-Regel (`expected_direction`) → Rolle des eindeutig aufgelösten Partners → Vorzeichen der Zahlung. Das Vorzeichen steht bewusst unten: eine Lieferanten-Gutschrift bringt Geld herein und ist trotzdem kreditorisch. Drei Felder, drei Fragen — `counterparty_side` (welche Seite), `counterparty_partner_id` (wer), `fy_personal_account_id` (wogegen); zusammenlegen geht nicht, weil Diverse-Konten viele Identitäten teilen und eine Identität auch ganz ohne Konto existieren darf (F76 R3).

### Ausgleichs-Zuordnung (Klammer)

- English: `open item link`
- German: `Ausgleichs-Zuordnung` / `Klammer`
- Table: `ludwig.client_open_item_links` (F77, Migration 20260815120000)
- Definition: Die persistierte Zuordnung **Rechnung ↔ Zahlung** eines Vorgangs — die „Klammer". Einmal zugeordnet, danach nie wieder gematcht: Belegfeld, Betrag und Datum sind nur Kandidaten-Hinweise zur Zuordnungszeit (Owner-Entscheid 2026-08-15). Belegfeld 1 ist ab da die **Projektion** dieser Kante nach DATEV, nicht mehr ihre Quelle.
- Data type: entity / table (`ludwig.client_open_item_links`)
- Notes:
  - **Beide Seiten polymorph**: je Seite `journal_entry_id` XOR `mirror_entry_id` (CHECK). Deckt „beide in Ludwig", „Aufwand im Spiegel + Zahlung in Ludwig" (F59/BSC-Fall) und die Gegenrichtung. „Beide im Spiegel" wird nicht gebaut — das gleicht DATEV selbst aus.
  - **Nicht der Sachverhalt.** An einem Case hängen mehrere Vorgänge mit eigenen Belegnummern (Replay-Beweis Case 2026-0059: drei DATEV-Belegnummern). Der Case ist die **Such-Grenze** (`case_id`), die Klammer ist Rechnung + zugehörige Zahlung(en) **eines** Vorgangs.
  - **Zwei Schreibpunkte:** beim Buchen der Zahlung (`submit_booking_proposal` — der ohnehin gefundene OP-Kandidat wird persistiert statt verworfen) und beim Mirror-Import (Gegenrichtung: die Kanzlei hat die Zahlung gebucht). Beide nur bei Eindeutigkeit; mehrdeutig → kein Link, kein Raten.
  - `matched_by` ∈ {`server`, `agent`, `human`} + `rationale` sagen, wer zugeordnet hat. `amount_allocated` macht das Modell für die Mehrfach-Allokation einer Sammelzahlung (`problems.md` P2 / F43) anschlussfähig, ohne sie zu bauen.
  - **Cross-Client strukturell unmöglich**: beide Seiten referenzieren `(client_id, id)` (Composite-FK-Muster aus F56).
  - `orphaned_at` = die verlinkte Mirror-Zeile ist verschwunden (Kanzlei-Edit → `content_hash`-Drift → Tombstone, F47-T47.10) und hatte keinen eindeutigen Nachfolger. Arbeitsvorrat, nicht Wahrheit.
  - Belegfeld-Regeln und die Vergabe-Leiter: `docs/topics/datev.md`.

### OPOS-Vortrag (open item carryover)

- English: `open item carryover`
- German: `OPOS-Vortrag`
- Event kind: `client_accounting_event.kind = 'open_item_carryover'` (F85, Migration 20260819140000)
- Definition: Die Sollstellung eines **offenen Postens aus der DATEV-Wahrheit** — die Kanzlei (oder die Vorgeschichte) hat die Rechnung gebucht, Ludwig kennt sie nur aus dem Spiegel. `foundOposCases` (F85-T85.3) gründet je offenem Posten zum Stichtag einen Sachverhalt (Anker `batch_opos_reference = 'mirror-opos:<op_key>'`) mit diesem Ereignis; die spätere Zahlung wird deterministisch zugeordnet (`matchPaymentsToOposCases`, T85.4) und beim Buchen entsteht die F77-Klammer samt Belegfeld-1-Projektion aus dem Aufwand.
- Data type: enum value + Ableitungs-Schritt
- Notes:
  - Quelle des Ereignisses ist die Spiegel-Buchung (`client_accounting_event.datev_mirror_entry_id`, dritte XOR-Quelle neben Beleg und Bank-Transaktion). EB-Vortrags-OPs ohne Spiegel-Buchung im abrufbaren WJ bleiben quellenlos.
  - Nicht `document_received` (kein Beleg bei uns) und nicht `accrual` (das ist die Dauerbuchungs-Sollstellung).
  - Stichtag: Replay-Cutoff des Experiment-Mandanten, sonst `as_of` des jüngsten OPOS-Snapshots. Läuft nach jedem Spiegel-Import (Onboarding- und Abgleich-Zweig), idempotent.
  - Beim LDSV mit WK ist der Vortrag ein **Ereignis am Dauersachverhalt**: Personenkonto + Belegnummer sind EINE Identität, der Anker steht am selben Sachverhalt wie die Wiederkehr-Regel — beide Richtungen (F142), egal welcher Importer zuerst läuft.

### Belegnummern-Register (document number register)

- English: `document number register`
- German: `Belegnummern-Register`
- Code: `accounting-cases/infrastructure/document-number-register.ts`, `accounting-cases/domain/document-number.ts` (F85-T85.11)
- Definition: Alle bekannten Belegfeld-1-Werte eines Mandanten als EINE abfragbare Sicht — je Eintrag Nummer (verbatim), **Quelle**, Personenkonto, Sachverhalt und **Zustand**. Union aus dem, was verstreut liegt: Case-Anker (`mirror-opos:`), F77-Kanten, eigene Journal-Zeilen, Spiegel-Rückverweise und die abgeleiteten Betreff-Kandidaten.
- Data type: Query + reine Rangordnung (keine eigene Tabelle).
- Notes:
  - **Dominanz-Rangfolge:** `datev_correction` > `opos_anchor` > `mirror_ref` > **`case_decision`** > `link` > `journal_line` > `bank_purpose`. Die drei DATEV-Quellen sind `immutable` — ihre Schreibweise gewinnt immer (Regel 1). Ein `fixed_on_export`-Wert schlägt jede errechnete Quelle. `case_decision` (F100) ist die **entschiedene** Nummer: stärker als jede errechnete Quelle, schwächer als jede DATEV-Quelle.
  - **Drei Konsumenten, eine Wahrheit:** das Agent-Lookup `find_cases_by_document_number` („erst suchen, dann gründen"), `get_case.knownDocumentNumbers`/`openItemBrackets` und der Plausibilitäts-Tab (P1).
  - **Cutoff-sicher:** Buchungshistorie kommt ausschließlich aus `client_effective_journal_lines` — das Register ist agentenerreichbar und darf einem Replay-Mandanten seine Zukunft nicht zeigen. Der Plausibilitäts-Tab (reine Menschen-Sicht) ergänzt die Nummern der verknüpften DATEV-Buchungen separat.

### Belegnummern-Modus (document number mode)

- English: `document number mode`
- German: `Belegnummern-Modus`
- Column: `ludwig.client_accounting_case.document_number_mode` (F100, Migration 20260823110000)
- Definition: Wie viele Belegnummern erwartet dieser Vorgang? **`single`** — genau EINE über den ganzen Vorgang (Einzelrechnung; Dauersachverhalt MIT Dauerrechnung). **`per_period`** — je Periode eine eigene Nummer (Dauersachverhalt OHNE Dauerrechnung: der Vermieter schickt jeden Monat eine neue Rechnung). **`multiple`** — mehrere nebeneinander, Ziel ist der Split in Einzelsachverhalte (Sammelzahlung, OPOS-Pool, Mandantenstapel). **`none`** — kein Beleg, keine Nummer; ein synthetisches Belegfeld ist zulässig (Umbuchung, reine Korrektur).
- Data type: text, `not null`, CHECK, **ohne Default**.
- Notes:
  - **Gesetzt, nicht abgeleitet.** Jeder der zwölf Anlagepfade kennt den Wert im Moment des Schreibens; die frühere Ableitung aus Anker-Präfix + `kind` (`classifyCase`) konnte `per_period` strukturell nicht ausdrücken und warf beide Dauerfälle in denselben Topf. Kein Default: ein Pfad ohne bewusste Angabe soll fehlschlagen. Die elf TS-Pfade gehen durch `accountingCaseInsert` (Chokepoint-Test), die DB trägt die Regel über beide Stacks.
  - **Orthogonal zu `kind`.** „Dauersachverhalt" ist eine Aussage über die Wiederkehr, der Modus eine über die Anzahl der Belegnummern.
  - **Umstufung ist begründungspflichtig** (`setCaseDocumentNumberMode`, min. 10 Zeichen, Audit `case.document_number_mode_changed`); die Herabstufung auf `single` verlangt zusätzlich die Wahl der künftig gültigen Nummer. Ohne Pflichttext wäre die Umstufung der bequeme Ausweg aus jedem Guard.

### Belegnummern-Strategie (document number strategy)

- English: `document number strategy`
- German: `Belegnummern-Strategie`
- Column: `ludwig.client_accounting_case_rule.document_number_strategy` (F108, Migration 20260827160000)
- Definition: **Woher** Belegfeld 1 EINER Periode eines Dauersachverhalts kommt. **`period_key`** — die Periodenkennung in der Schreibweise der Kanzlei (`092026`); der Dauervorgang ohne eigenen Beleg (Miete, Heizung) und die eigene Dauerrechnung. **`from_document`** — die Rechnungsnummer des Belegs, der die Periode trägt (Telefon, Strom: jede Periode bringt ihre eigene Nummer mit). **`fixed`** — die `datev_document_number` der Regel, unverändert auf jeder Periode.
- Data type: text, `not null`, CHECK, Default `fixed`.
- Notes:
  - **Nicht zu verwechseln mit dem [Belegnummern-Modus](#belegnummern-modus-document-number-mode).** Der sagt, WIE VIELE Nummern ein Vorgang hat; die Strategie sagt, WOHER die Nummer einer Periode kommt. `fixed` gehört zu `single`, die beiden anderen zu `per_period`.
  - **`fixed` wird nie abgeleitet.** Er ist das Bestandsverhalten (dieselbe Nummer auf jede Periode) und bricht ab der zweiten Periode den OPOS-Ausgleich, weil DATEV zweimal dasselbe Belegfeld für zwei Forderungen sieht. Er bleibt nur für Kanzleien, die es ausdrücklich so wollen.
  - **Was gebucht ist, ist entschieden.** Trägt eine Periode bereits eine gebuchte `external_document_number`, gewinnt sie gegen jede Rechnung — deshalb ist ein Strategiewechsel rückwirkungsfrei.
  - Herkunft in `profile_source` (`derived` · `agent` · `human` · `onboarding`): der Server leitet das Profil aus `contract_type`, Richtung und Belegseite ab, der Agent widerspricht begründet. Ohne die Herkunft wäre eine falsche Ableitung später nicht auffindbar.
  - Regeln: `docs/topics/buchung.md` R23b/R23c.

### Entschiedene Belegnummer (decided document number)

- English: `decided document number`
- German: `entschiedene Belegnummer`
- Table: `ludwig.client_case_document_numbers` (F100, Migration 20260823120000); Registerquelle `case_decision`
- Definition: Welche der bekannten Belegnummern eines Sachverhalts **gilt** — mit Pflicht-Begründung, Urheber (`agent`/`human`) und optionaler Periode. Der typische Anlass sind zwei **Schreibweisen** desselben Belegs (`2024/07` aus der OCR, `2024-07` aus der Überweisung): beide gehören zum Sachverhalt, keine ist falsch zugeordnet, aber nur eine darf ins Belegfeld.
- Data type: eigene Tabelle (keine Spalte am Sachverhalt — bei `per_period` bräuchte es ein Array, bei `multiple` eine zweite Struktur, und damit wieder zwei Quellen für eine Aussage).
- Notes:
  - **Nur zwischen Kandidaten.** Der Wert muss aus dem Register stammen oder akzeptanz-gleich zu einem Kandidaten sein; ein erfundener Wert ist keine Entscheidung, sondern eine neue Behauptung.
  - **Nie gegen DATEV.** Führt der Spiegel denselben Vorgang in anderer Schreibweise, gewinnt seine — DATEV ziffert zeichengleich aus (Realfall BSC, F59).
  - **Zulässige Anzahl je Modus:** `single` genau eine · `per_period` eine je `period_key` · `multiple` mehrere · `none` keine.
  - Werkzeuge: MCP `decide_case_document_number`, UI-Aktion „diese gilt" im Plausibilitäts-Tab — ein Kern (`decideCaseDocumentNumber`).

### Akzeptanzregel (acceptance rule)

- English: `acceptance rule` / `acceptance-equal`
- German: `Akzeptanzregel` / `akzeptanz-gleich`
- Code: `core/datev/belegfeld.ts` → `acceptanceEqual` (F85-T85.9a)
- Definition: Wann meinen zwei Belegnummern **denselben Beleg**, ohne dass jemand es begründen muss? Nach Normalisierung (Großschreibung, Leer- und Trennzeichen `.,-_/` entfernt) entweder exakt gleich, ODER gleiches **Ziffern-Skelett** (≥ 5 Ziffern) bei gleichem **Alpha-Kern** (Buchstabenläufe ohne die Whitelist `RE, RG, RECH, RECHNUNG, RNR, INV, INVOICE, NR, NO, BELEG, AR, ER`).
- Data type: pure Funktion.
- Notes:
  - Beispiele: `RE 2026-003` ≡ `Rechnung2026-003` ≡ `re. 2026-003`; `4711A` ≠ `4711B` (Kern-Zeichen); `RNR 20260023-7` ≠ `20260023` (anderes Skelett).
  - Verhältnis zum Bestand: `refersToSameDocument` (Containment + exakter Betrag) bleibt die **Kandidaten-Suche**; die Akzeptanzregel ist der strengere Maßstab fürs **begründungsfreie Überschreiben**. Ein Ort, gemeinsam genutzt von Submit, Matching und Export-Gate.
  - Warum überhaupt: DATEV ziffert offene Posten über **Zeichengleichheit** aus. Eine nur anders geschriebene Nummer lässt den Posten trotz richtiger Buchung offen (Realfall BSC, F59).

### Dominanz-Lebenszyklus der Belegnummer (document number dominance)

- English: `document number dominance` / `belegfeld state`
- German: `Dominanz-Lebenszyklus`
- Column: `ludwig.client_open_item_links.belegfeld_state` (F85-T85.9d, Migration 20260820140000)
- Definition: Die dominante Belegnummer eines Vorgangs durchläuft drei Zustände: **`computed`** (errechnet über die Belegfeld-Leiter, darf sich noch ändern) → **`fixed_on_export`** (mit dem DATEV-Export am Vorgang festgehalten, kein Rechenlauf ändert sie mehr) → **`datev_corrected`** (einzige Ausnahme vom Freeze: die Kanzlei hat in DATEV nachkorrigiert, der Reimport hat es erkannt — DATEV gewinnt immer).
- Data type: text-Spalte mit CHECK.
- Notes:
  - Vorgänge **ohne** F77-Kante brauchen keine eigene Zeile: dort ist `client_journal_entry.exported_at` der Freeze-Marker.
  - **Export-Gate** (letzte Verteidigung): trägt ein Satz einer DATEV-dominanten Klammer ein abweichendes Belegfeld, ersetzt der Export den Wert (+ Audit); zwei widersprüchliche Klammern desselben Kontos blocken.
  - **Begründungspflicht** (Regel 2): Zuordnung gegen eine bekannte DATEV-Nummer eines ANDEREN Sachverhalts braucht `documentNumberMismatchRationale`. Die Begründung erlaubt die **Zuordnung**, nicht das abweichende Belegfeld.

### Konsistenz-Wächter (OPOS consistency watchdog)

- English: `OPOS consistency watchdog`
- German: `Konsistenz-Wächter`
- Code: `datev-mirror/application/opos-watchdog.ts`, `accounting-cases/application/opos-watchdog-answer.ts` (F85-T85.7f, Migration 20260820150000)
- Definition: Der wiederkehrende OPOS-Abzug als **Gegenprobe** unserer Buchungen gegen DATEV. Er ist **Evidenz-Lieferant, kein Prozess-Akteur** (Owner-Entscheid 2026-08-20): er schließt nichts, storniert nichts und erzwingt kein Nach-Matching, sondern hängt je Befund EINE Klärung `audience='agent'` mit eingefrorener Tilgungs-Evidenz an den Sachverhalt.
- Data type: Klärungs-Typen `opos_settled_by_ludwig` | `opos_settled_extern` | `opos_clearing_mismatch`.
- Notes:
  - **Drei Fälle:** getilgt + Ludwig hat gebucht (Kreis zu) · getilgt ohne Ludwig-Buchung (Kanzlei hat selbst ausgeglichen) · offen über ≥ 2 Abzüge, obwohl wir gebucht haben (Auszifferung greift nicht — meist Belegfeld-Drift).
  - **Evidenz einfrieren:** nach der Tilgung verschwindet die Klammer aus dem OPOS-Bestand; die Tilgungsbuchung im Journal-Spiegel bleibt und ist die stabile Referenz. 0 oder > 3 Treffer → `settlement_not_identified` statt Rateschluss.
  - **Der Server exekutiert die Konsequenz** beim Beantworten: `confirm_close` schließt mit Audit-Grund (Freeze-Guards), eine mitgegebene `bankTransactionId` landet per `manual`-Match auf dem Bank-Leg der Spiegel-Tilgung (fällt via `is_datev_booked` aus Gate 1f), `escalate_accounting` reicht an die Kanzlei weiter.
  - Idempotent über einen partiellen Unique-Index je (Sachverhalt, Befund-Typ); löst ein späterer Abzug den Befund auf, wird die Klärung automatisch beantwortet.

### Sammelsachverhalt und OPOS-Pool (collective case / open item pool)

- English: `collective case` / `open item pool`
- German: `Sammelsachverhalt` / `OPOS-Pool`
- Anker: `payment-collect:<konto>/<tx>` (Zahlungs-Sammelfall), `mirror-opos-pool:<konto>` (T85.7h)
- Definition: Die Auffang-Klasse der Belegnummern-Klassenregel — ein Sachverhalt, dessen Belegnummer **unbekannt oder mehrfach** ist. Ziel ist immer der Split in Einzelsachverhalte, sobald die Teilbeträge bekannt sind.
- Data type: Anker-Präfix am `batch_opos_reference` (keine eigene Spalte).
- Notes:
  - **Zahlungs-Sammelfall:** eine Zahlung, die die Kaskade nicht eindeutig auflöst (mehrdeutige Beträge, kein Treffer), wird EIN Sachverhalt mit Avis-Klärung an die Kanzlei — bewusst kein Leer-Case je Nummer (nicht buchbar, unterläuft den Schließ-Deckel).
  - **OPOS-Pool:** offene Posten **ohne Belegfeld 1** kommen je Personenkonto zusammen. Belegfeld-los heißt nicht identitätslos — DATEVs `open_item_number` klammert auch ohne Belegfeld. Ehrliche Grenze: ohne Belegfeld ziffert DATEV nicht automatisch aus, die Zahlung darauf braucht immer einen Abnahme-Schritt.
  - **Klassenregel** (Owner-Bestätigung 2026-08-20): Einzel- und Dauersachverhalt tragen genau EINE dominante Nummer (beim Dauersachverhalt je Periode/Vorgang), nur der Sammelsachverhalt darf mehrere oder keine tragen. Als Norm + Plausibilitäts-Check (P1), bewusst NICHT als DB-Constraint — die Realität verletzt die Norm gelegentlich, und genau das soll sichtbar werden.

### Zahlungs-Allokation (payment allocation)

- English: `payment allocation`
- German: `Zahlungs-Allokation`
- Code: `apps/web/src/modules/accounting-cases/application/allocation-core.ts` (`loadCaseOpenPayments`, `proposeAllocations`, `classifyConfidence`), Prepare-Step `allocate_payments`, MCP-Read-Tool `propose_payment_allocation`
- Definition: Die deterministische Zuordnung Zahlung → Sachverhalte (Sammelzahlungen): der Server rechnet je offener Bank-Transaktion Kombinationen über die offenen Zahlungserwartungen aller Sachverhalte vor; eindeutige Treffer ordnet er selbst zu (`auto`), Residuen entscheidet der Agent (`proposal`).
- Data type: kein eigenes Schema — `client_accounting_event.amount`/`allocated_amount` + bestehende Anker/Register.
- Notes:
  - Pool-Quelle je Sachverhalt: OPOS-Vortrag = Klammer-Saldo aus dem effektiven Journal; Rechnungs-Sachverhalt = Σ `document_received` − Σ payment-Events. Voll gedeckte Fälle fallen raus.
  - `bank_purpose` wird nie auf Beträge geparst — nur Belegnummern-Containment (`mentionedInPurpose`).
  - Auto nur bei genau EINEM Stufe-1-Kandidaten: Gegenpartei via F63-Alias auflösbar aufs Kombinations-Konto ODER alle Belegnummern im Betreff. Siehe `docs/topics/buchung.md` R27.

### Allokations-Leiter (allocation ladder)

- English: `allocation ladder`
- German: `Allokations-Leiter`
- Code: `proposeAllocations` in `allocation-core.ts`, Kombinatorik `findAmountSubsets` in `open-items.ts`
- Definition: Die vier Stufen der Zahlungs-Allokation — erste nicht-leere Stufe gewinnt: 1. gleicher Lieferant exakt · 2. lieferanten-übergreifend exakt · 3. Skonto pauschal 2 %/3 % (geflaggt, nie auto) · 4. leer (Agent-Regel: eine Zeile, kein Belegfeld, Ampel gelb).
- Notes: Deckel (max. 6 Posten je Kombination, max. 20 Lösungen, Knoten-Budget) werden nie stillschweigend angewandt — `truncated: true` in der Antwort.

### Rest-Sachverhalt (remainder case)

- English: `remainder case`
- German: `Rest-Sachverhalt`
- Code: `split_transaction`-Allokation mit `newCase` statt `caseId` (`splitTransactionToCases` → `createCaseFromBankTransactions`-Kern mit `allocatedAmount`)
- Definition: Der Sachverhalt für den Teil einer Sammelzahlung, dessen Rechnung noch fehlt — nur das payment-Event über den Teilbetrag, kein Beleg, disposition `agent`. Kommt der Beleg später: `attach_source_doc_to_case`; deckt der Rest mehrere Rechnungen: `dissolve_case` → Betrag wird wieder unallokierter Teil-Rest der Transaktion → neu splitten.
- Notes: `dissolve_case` ist der Rückwärtsgang des Zuschnitts (Close-Grund `dissolved` im Audit); verweigert bei accepted/posted-Sätzen, Exportstapel-Claim und beantworteten Klärungen.

### Dokumentgruppe (document group)

- English: `document group` / `collection kind`
- German: `Dokumentgruppe` / `Gruppentyp`
- Table: `ludwig.client_source_docs.collection_kind` (F104, Migration 20260828130000); Vokabular in `apps/web/src/core/documents/collection-kind.ts`, Python-Spiegel `CollectionKind` im `document-simple-classifier`
- Definition: Ein Sammeldokument (Parent) und die daraus geschnittenen Einzeldokumente, die zusammen **einen** fachlichen Vorgang bilden. Keine eigene Tabelle — die Gruppe *ist* `parent_source_doc_id`; neu ist ihr **Typ** am Parent. Sieben Werte: `expense_report` · `credit_card_statement` · `cash_register_report` · `payment_gateway_payout` · `vendor_collective_invoice` · `document_with_annexes` · `not_connected`. NULL = kein Sammeldokument.
- Data type: Enum-Spalte (CHECK), NULL erlaubt. Status-Registry-Achse `dokumentgruppe`.
- Notes:
  - **Der Typ ist keine Beschriftung, sondern das Verfahren.** Aus ihm leitet der Code die **Klammer-Familie** ab (`clearing` · `partner` · `annex` · `none`) — nicht separat gepflegt. Nur `not_connected` hat kein Verfahren: dort ist jedes Kind ein eigener Vorgang.
  - **Eigene Spalte, keine JSONB-Ableitung**: der Wert wird korrigiert (`override_classification`), überlebt eine Neuklassifikation und ist Filterachse. Der Split-Plan behält sein `collectionKind` als Plan-Metadatum, ist aber nicht mehr die Quelle für Buchungslogik.
  - **Der Parent bleibt Anker**, solange die Gruppe eine Klammer hat — superseded wird nur bei `not_connected` (`belege.md` R13/R25).
  - **Reisekosten sind kein eigener Typ** — sie laufen als `expense_report`; der Unterschied wirkt am Einzelbeleg, nicht an der Gruppe.
  - Gesetzt vom `document-simple-classifier`, **nie vom Agenten**.

### Abrechner (expense settler)

- English: `expense settler`
- German: `Abrechner`
- Tables: `ludwig.client_ledger_accounts.business_partner_id` (F76) + `clearing_account_type` (F103); MCP-Tool `link_expense_partner` (F104)
- Definition: Eine Person, die für den Mandanten auslegt oder eine Firmenkarte führt und über ein **Verrechnungskonto** abrechnet. Sie ist Geschäftspartner **ohne eigene Kontonummer**: ihr Kreditor *ist* das Auslagenkonto.
- Notes:
  - **Kein Partner-Typ „Mitarbeiter"**: die Eigenschaft steckt in `clearing_account_type` des verknüpften Kontos — eine Achse, ein Ort.
  - **Kein zweites Konto.** `create_creditor` lehnt einen Abrechner ab; zwei Nummern für dieselbe Person gleichen sich nie aus (`konten.md` R20/R23).
  - Die Klammer ist **n:1**: eine Person trägt im Regelfall mehrere Ausgleichskonten (Karte + Spesen, zwei Karten). Welches für einen Vorgang gilt, filtert der Gruppentyp; bleibt mehr als eines übrig, wählt der Agent anhand der Kennung.
  - Zwei Wege, ein Zielzustand: Onboarding-Vorschlag aus dem Kontonamen (`onboarding.md` R23) und `link_expense_partner` zur Laufzeit — derselbe Schreibkern.
  - **Personendaten:** nur Name, Schreibvarianten, Kontobezug. Keine Adresse, keine Bankverbindung aus der Lohnbuchhaltung.

### Verrechnungskonto (clearing account)

- English: `clearing account` / `clearing account type`
- German: `Verrechnungskonto` / `Verrechnungskonto-Kategorie`
- Table: `ludwig.client_ledger_accounts.clearing_account_type` (F103, Migration 20260826100000); Vokabular in `apps/web/src/core/accounting/clearing-account.ts`
- Definition: Ein Sachkonto, das nicht Aufwand, Erlös, Anlage oder Zahlungsmittel ist, sondern eine Bewegung **zwischenparkt**, bis eine Gegenbewegung sie auflöst. Kennzeichen: wiederkehrender Ausgleich, Zielsaldo null. Acht Kategorien: `credit_card` · `employee_expense` · `shareholder` · `payroll` · `payroll_liability` · `payment_gateway` · `suspense` · `money_transit`. NULL = kein Verrechnungskonto.
- Data type: Enum-Spalte am jahresgebundenen Sachkonto (CHECK), NULL erlaubt.
- Notes:
  - **Zwei abgeleitete Achsen, nicht je Konto gepflegt**: *Zielsaldo null* (`payroll`, `suspense`, `money_transit` dauerhaft, `credit_card`/`employee_expense`/`payment_gateway` je Abrechnung) steuert die Verprobung im Buchungslauf; `shareholder` und `payroll_liability` tragen bis zur Zahlung zu Recht einen Saldo und bleiben draußen. *Zahlungsfähig* (`credit_card`, `employee_expense`, `payment_gateway`) entscheidet, ob ein `client_payment_accounts`-Eintrag entstehen darf.
  - **Die Kategorie schlägt die DATEV-Kontenfunktion in beide Richtungen**: `1360 Geldtransit` wird trotz Kontenfunktion 10 kein Zahlungskonto, `1617 Corporate Card` wird trotz Kontenfunktion 13 eines.
  - **Vorgeschlagen, vom Menschen bestätigt, nie vom Agenten gesetzt.** Einziger Schreibpfad: `confirmClearingAccounts`; Einstiege sind das Onboarding-Review und der Tab „Verrechnungskonten" in den Mandanteneinstellungen. Der Agent liest sie über `list_clearing_accounts`.
  - **Jahresgebunden** wie der Kontenplan (F64): beim Anlegen eines neuen WJ übernimmt der Konten-Upsert die Kategorie aus dem Vorjahr, wo das Zieljahr noch keine trägt — eine Übernahme, keine Bestätigung.
  - **Buchbar wird das Konto über `client_payment_accounts`** (F102), nicht über die Kategorie: `credit_card` → `kind='credit_card'`, `employee_expense` → `kind='employee_clearing'`. Der `kind` wird beim Promoten aus der Kategorie abgeleitet, nie zusätzlich gepflegt (`konten.md` R22). Ein Aufwand gegen ein `employee_clearing`-Konto zählt im Buchungsstapel als Eingangsrechnung, nicht als Bankbuchung.
  - **Kennung** (das Analogon zur IBAN) steht in `external_account_id`, der Aussteller in `bank_name`. Sie hat keine feste Länge; der Vergleich prüft, ob die gespeicherte Kennung das Ende der auf der Abrechnung genannten Nummer ist. Eine vollständige Kartennummer wird nie gespeichert.

### Lohn-Zahlungskreis (payroll settlement)

- English: `payroll settlement` / `payroll role`
- German: `Lohn-Zahlungskreis` / `Kontenrolle im Lohnkreis`
- Tables: `ludwig.reference_account_framework_entries.payroll_role`, `ludwig.reference_social_insurance_carriers`, `ludwig.platform_clients.payroll_via_clearing_account` (F83, Migration 20260815140000)
- Definition: Der deterministisch gebuchte Kreis aus Netto-Lohn, Sozialversicherung und Lohnsteuer. Bei bestätigter Kanzlei-Konvention („Lohn läuft über Lohnjournal/Verrechnungskonto") tilgt der Bankabgang nur die **Verbindlichkeit** (`wage_liability` / `wage_tax_liability` / `social_security_liability`); der Aufwand kommt aus dem Lohnjournal gegen `payroll_clearing`.
- Data type: Enum-Spalte (`payroll_role`) + Referenztabelle + Boolean am Mandanten.
- Notes:
  - **Kontenrolle statt Nummernliste**: `payroll_role` hängt am Referenz-Katalog (SKR03 1740/1741/1742/1755, SKR04 3720/3730/3740/3790); Mandanten-Konten erben sie über `client_ledger_accounts.account_framework_entry_id`.
  - **Zahlungsart** (`wage_net` | `social_insurance` | `wage_tax` | null) leitet `classifyPayrollPayment` aus Empfänger + Verwendungszweck eines Bank-**Abgangs** ab. Kein Treffer = Residuum für den Agenten; geraten wird nicht. Bewusst **keine Mitarbeiter-Stammliste** (fluktuiert, wäre am ersten Arbeitstag falsch).
  - **Gebucht wird serverseitig** im `prepare_accounting_month`-Step `book_payroll_payments` — über denselben Kern wie `submit_booking_proposal` (gleiche Guards), Belegfeld 1 = Monatsnummer `YYYYMM`, kein Steuerschlüssel.

### Billing mode (Rechnungsmodus / Dauerrechnung-Flag)

- English: `billing mode`
- German: `Rechnungsmodus` / `Dauerrechnung-Flag`
- Table: `ludwig.client_source_docs_invoices.billing_mode` (Migration 20260821090000)
- Definition: Azure-CU-Klassifikation des Analyzers `ludwig_invoiceunderstanding_v1` am Rechnungsbeleg: `recurring` = **Dauerrechnung** — einmal ausgestellt, gilt für viele künftige Perioden (Miete, Leasing, Wartungsvertrag); `regular` = normale Einzelrechnung (auch monatlich wiederkehrende Einzelrechnungen wie Telekom/Abo); `unknown` = am Text nicht bestimmbar; NULL = nicht extrahiert (Altdaten/älterer Analyzer).
- Notes:
  - Buchungsfolge: `recurring` eröffnet einen **Dauersachverhalt** ([[Recurring rule]], `create_recurring_case`) mit `valid_from`/`valid_until` aus der Beleg-Laufzeit (`service_period`), auf den die Monatszahlungen gebucht werden — keine Einzelbuchung je Periode. Playbook-Regel im `buchungsvorschlag`-Agenten.
  - Die Analyzer-ID ist versionierte Code-Config (`apps/invoice-preprocessor/.../settings.py`), nicht ENV — Feld-Schema und Code wechseln im selben Commit.

### Recurring rule (Wiederkehr-Regel)

- English: `recurring rule`
- German: `Wiederkehr-Regel` / `Dauersachverhalt-Regel`
- Table: `ludwig.client_accounting_case_rule` (ex `client_recurring_charge_rule`, Rename 2026-06-16)
- Definition: Deterministische Regel an einem Dauersachverhalt (`kind='recurring_charge'`): Match-Kriterien gegen Bank-Transaktionen (Richtung, Name, IBAN, Betrag ± Toleranz, Zweck-Regex) + Buchungs-Vorlage. Treffer beim Rescan → `payment_in/out`-Event + `client_journal_entry`-Vorschlag.
- Notes:
  - **Split-Vorlage** (`template_lines`, jsonb, 2026-07-10): N Gegenkonto-Zeilen mit festen Beträgen + 1 Bank-Zeile (z. B. Miete/NK/Heizung/Garage gegen einen Kreditor). Gesetzt → `fy_template_counter_account_id` wird ignoriert; Vorschlag entsteht nur, wenn die Zeilensumme den Zahlbetrag deckt. DATEV kann Splits nur als parallele Buchungssätze mit gemeinsamem Beleglink ausdrücken; Korrekturen macht Agent/UI am Vorschlag.
  - `expected_interval`/`expected_day_of_month`: Fälligkeits-Erwartung für `list_overdue_recurring` und Fälligkeits-Anker der Sollstellung.
  - **Booking mode / Sollstellung** (`booking_mode`, 2026-07-10): `book_on_payment` (Default) bucht erst bei Zahlung gegen die Vorlage; `accrue_then_settle` stellt zur Fälligkeit soll — `prepare_accounting_month` (MCP) ruft `realizeDueRecurringCharges` auf: `accrual`-Event + Vorschlag „Aufwand an Personenkonto“ / „Personenkonto an Erlös“ (`personal_account_id` an der Regel); die Zahlung bucht der Rescan dann Personenkonto ⇄ Bank. Idempotent per DB-Unique auf `client_accounting_event (recurring_rule_id, accrual_period)` — eine Sollstellung je Regel und Monat, Lauf beliebig oft triggerbar (Agent, UI, später Cron).
  - `valid_from`/`valid_until` (2026-07-10): Laufzeit der Dauerbuchung, rein informativ; abgelaufene Vorlagen importiert der DATEV-Import mit `is_active=false`.
  - **DATEV recurring booking import** (F91, 2026-08-21 — ersetzt die frühere ASCII-Import-Lane komplett): das Onboarding leitet LDSV-Kandidaten deterministisch aus der DATEV-Buchungshistorie ab (`derive-recurring-candidates`, pure function über `account-postings` + festgeschriebene `accounting-sequences` des jüngsten WJ; on-read aus `ops_datev_ingest_staging`, keine Kandidaten-Persistenz). Bestätigte Kandidaten legt das Review über den `create_recurring_case`-Kern an — Case + Regel in einem Schritt, `booking_mode='accrue_then_settle'`, idempotent über `import_reference = 'datev-wk:<Belegnummer>'` (unique je Mandant; Re-Run → `alreadyExists`). Die Belegnummer steht als `datev_document_number` an der Regel und geht bei Sollstellungs-/Settle-Vorschlägen als `external_document_number` in Belegfeld 1 (OPOS-Ausgleich); die DMS-GUID (`datev_document_link_*`) ist reine Beleg-Referenz. Personenkonto-Seite (Debitor → `payment_in`, Kreditor → `payment_out`) bestimmt Richtung und Gegenpartei.

### Dauersachverhalt mit wiederkehrenden Buchungen (LDSV mit WK)

- English: `recurring case with recurring postings`
- German: `Dauersachverhalt mit wiederkehrenden Buchungen` (intern: **LDSV mit WK**)
- Abkürzungen (Owner 2026-08-21, L-Präfix-Konvention siehe Rules): **LSV** = Ludwig-Sachverhalt ([[Accounting case]]) · **LDSV** = Ludwig-Dauersachverhalt (`client_accounting_case` mit `kind='recurring_charge'`) · **WK** = wiederkehrende Buchungen (bewusst ohne L-Präfix — gleicher Begriff wie in DATEV: Stapel „Wiederkehrende Buchungen", Buchungen mit `mark_of_origin='WK'`). „LDSV mit WK" ergibt sich aus beidem.
- Definition: Ein LDSV, dessen Aufwands-/Erlösbuchungen **ohne neuen Beleg** entstehen — Grundlage ist eine Dauerrechnung ([[Billing mode]] `recurring`), in DATEV typischerweise als monatlicher WK-Stapel unter derselben Belegnummer gebucht. Beim Onboarding werden LDSV mit WK deterministisch aus der DATEV-Buchungshistorie abgeleitet (F91); die Erkennung ist herkunfts-agnostisch (auch handgebuchte regelmäßige Sollstellungen zählen, der WK-Marker ist nur Konfidenz-Signal). Im laufenden Betrieb legt der Agent neue LDSV mit WK bei Eingang einer Dauerrechnung an.
- Notes:
  - Das DATEV-Herkunfts-Kennzeichen `SV` in `mark_of_origin` bedeutet „Stapelverarbeitung" — genau wegen solcher Kollisionen tragen Ludwig-Kürzel das L-Präfix. Beobachtete Herkunfts-Werte: `RE` (manuell), `WK` (wiederkehrend), `SV` (Stapel/Import — auch der „Ludwig-Export"-Stapel), `JA` (Jahresabschluss), `AN` (Anlagen), `KS` (KSt).
  - **Die Belegnummer ist die Identität — aber nur beim LDSV MIT WK** (F94-T94.6, Präzisierung 2026-08-21): dort gibt es eine Dauerrechnung mit konstanter Nummer. Bei einem LDSV mit **Monatsbelegen** (Leasing, Miete mit Einzelrechnung) ist die Rechnungsnummer die Identität des **Ereignisses**, nicht des Sachverhalts — sie wechselt ja monatlich. Die Identität des Sachverhalts ist dort der **Vertrag** (`client_accounting_case_rule.match_contract_number`) bzw. die Gegenpartei. Was die Monatsrechnung an den bestehenden LDSV bindet, ist das **Regelwerk** (F94: `matchSourceDoc`, ausgeführt im deterministischen Übergang 1→2), nicht die Nummer.
  - Ändert sich die Belegnummer eines LDSV MIT WK (z. B. neue Dauerrechnungs-Nummern zum Jahreswechsel), entsteht über den Beleg-Pfad ein neuer Sachverhalt — es gibt bewusst keine automatische Verkettung von Sachverhalten (`successor`): eine Kette bricht bei jeder Lücke (ausgelassener Monat, Storno, Nachberechnung), und „alle Vorgänge dieses Leasings" wäre ein Traversal statt einer Query. Der Stern über das dauerhafte Objekt (LDSV + Regel) ist robuster.

### Fiscal year (Entität)

- English: `fiscal year`
- German: `Wirtschaftsjahr`
- Definition: The per-fiscal-year container for one client's bookkeeping artefacts. Every invoice and every `BookkeepingEntry` belongs to exactly one fiscal year. One row is exactly one fiscal year; they do not overlap.
- Data type: `ludwig.client_fiscal_years`.
- **Drei Ausdrücke, die auseinandergehalten werden (F93):**
  - `fiscal_year` als **integer** — die Jahreszahl, z. B. 2026 (an `client_accounting_case`, `client_accounting_event`). Kein Verweis, keine Entität.
  - `fiscal_year_id` als **uuid** — Verweis auf den Jahrgang-Datensatz in `client_fiscal_years`.
  - `fy_<name>` als **Präfix** — FK auf eine Zeile, die *innerhalb* eines Jahrgangs lebt, praktisch immer ein Konto (`fy_personal_account_id`, `fy_ledger_account_id`, `fy_template_counter_account_id`). Beim Lesen einer Query ist damit ohne Schema-Blick erkennbar, dass WJ-Kontext nötig ist. Siehe AGENTS.md R8.
  - **Dokumentierte Ausnahme (F93 §3):** `client_journal_entry_line.account_id` trägt kein `fy_`. Dass eine Buchungszeile auf ein Konto ihres Buchungsjahres zeigt, ist an der Stelle selbstverständlich; das Präfix trüge dort keine Information. Die Regel gilt dort, wo sie überrascht.
  - `fy_` und Fremdsystem-Präfixe (R7) werden nicht kombiniert: `datev_fiscal_year_id` ist DATEVs Jahres-ID (Herkunft eines Werts), nicht Ludwigs Jahrgang-FK.
- **Autoritätsregel Jahres-Config (2026-07-29, F47 WP8 + Datenmodell-Review §3.3.1):** Der Jahrgang trägt die per-Jahr-Wahrheit der DATEV-Config (`account_framework_code`, `account_number_length`, `base_currency`, `taxation_type`, `vat_period`, `datev_fiscal_year_id`, `status`) — geseedet DATEV-autoritativ aus den DATEV-fiscal-years. Die gleichnamigen Spalten auf `platform_clients` sind nur der **abgeleitete Default** (jüngstes WJ) für neue Jahrgänge und Alt-Leser. Neuer Code mit Jahres-Kontext liest vom Jahrgang; der Abbau der verbliebenen Client-Config-Leser ist F47-TD1.
- Notes: Hieß bis F93 `bookkeeping cycle` / `client_bookkeeping_cycles`, davor `Buchhaltungsjahr` / `bookkeeping year`. Der Name folgt jetzt DATEVs Begriff, den das Schema mit `datev_fiscal_year_id` ohnehin schon trug. Der Container hat ein `origin`-Feld (`imported` = aus einem historischen DATEV-Export übernommen; `created` = frisch für das laufende Jahr eröffnet). Geschlossene Jahrgänge sind immutable. Nicht verwechseln: `FiscalYear.origin` (wie der Container entstand) vs. `BookkeepingEntry.origin` (woher eine einzelne Buchung kommt). **Zielbild (Owner, 2026-07-11):** der Jahrgang ist die Jahresperioden-Klammer für den Jahresabschluss nach DATEV-Muster — EB-Werte/Saldovortrag beim Jahresstart, Abschluss/Festschreibung am Jahresende. Die Abschluss-Mechanik (EB-Buchungen, Sperren) ist noch nicht gebaut; die Entität ist dafür reserviert.

### Bookkeeping run

- English: `bookkeeping run`
- German: `Buchhaltungslauf`
- Definition: One execution of analysis or proposal generation for a bookkeeping context.
- Notes: During the prototype, orchestrated and persisted by `workflows`. A future UI layer is expected to take over user-facing run orchestration.

### onboarding_run (Job-Typ)

- English: `onboarding_run`
- German: `Onboarding-Lauf (Job)`
- Definition: `ops_jobs`-Job-Typ (F48-T48.1) für den durablen, asynchronen Onboarding-Lauf eines Mandanten (import → cycles → payment-tagging → rollen → embeddings → enrichment → readiness-gate). Ersetzt die frühere Inline-Ausführung in Vercel-Functions (`maxDuration`-Riss). Vom **TS-Worker** (`apps/web/src/worker`) geclaimt — NICHT vom Python-Worker (der claimt nur seine Typen wie `invoice_ingest`).
- Payload (snake_case Wire-Contract): `{ client_id, tenant_id, source: 'bridge'|'mcp', fiscal_year?, as_of?, bundle_prefix? }`. `source=bridge` → Datasets aus `ops_datev_ingest_staging`; `source=mcp` → aus dem S3-Bundle (`archiveOnboardingBundle`). Dedup: `onboarding_run:<client_id>` (höchstens ein offener Lauf/Mandant).
- Notes: Status kommt aus `platform_clients.onboarding_state` + `getClientReadiness` (kein `result`-Feld im Job). Der Agent pollt `get_onboarding_status`. Siehe decision-log 2026-07-31.

### Bank import batch

- English: `bank import batch`
- German: `Bank-Import-Lauf`
- Definition: Protokoll-Zeile eines Bank-Transaktions-Imports (CSV/Qonto): Konto, Quelle, Datei/Label, Anzahl eingefügter Zeilen, Auslöser. Transaktionen referenzieren ihren Batch.
- Data type: `ludwig.client_bank_import_batches`; FK `client_bank_transactions.import_batch_id`.
- Notes: Muster-Zwilling von `client_datev_export_batches` (Export-Seite). Ersetzt seit 2026-07-11 den früheren FK `import_audit_event_id` auf `platform_audit_events` — das Audit-Log ist Seitenkanal, kein Datenanker, und bleibt dadurch archivierbar/purgebar. Der Import schreibt weiterhin zusätzlich ein Audit-Event (ohne FK).

### Agent work queue

- English: `agent work queue`
- German: `Arbeitsvorrat des Agenten`
- Definition: Zustandsbasierte Antwort auf „Gibt es Arbeit?": die **Buchungszyklen, bei denen der Agent dran ist** (`batches`, Reihenfolge Nachlese → Nachtrag → regulär), dazu Belege ohne Sachverhalt, Bank-Transaktionen ohne Event, frisch beantwortete Klärungen (Case wieder beim Agenten), failed-Belege ohne Case — plus Kontextzahlen (offene Beleg-Nachforderungen, wartende Vorschläge). Ist `batches` leer, ist `hasWork` false, egal wie voll der Rest ist: der Zyklus liegt dann bei der Kanzlei oder ist unterwegs nach DATEV. Umgekehrt (F117): trägt ein Zyklus `returned: true` — sein jüngstes Zustands-Ereignis ist `export_batch.returned_to_agent` —, ist `hasWork` wahr **ohne** jeden Vorrat; `returnNote` trägt die Notiz der Kanzlei. Ein neuer Durchgang überschreibt das Ereignis.
- Data type: MCP-Tool `get_agent_work_queue` (`agent-run-core.ts`), reine Query, kein LLM.
- Notes: Kosten-Gate für getriggerte Läufe (F26/F29): erst dieses Tool, teure Agent-Session nur bei `hasWork=true`. Zustandsbasiert statt since-Deltas — idempotent abfragbar.

### Agent run / Durchgang

- English: `agent run`, `pass`
- German: `Agent-Durchgang` (kurz: **Durchgang**)
- Definition: EINE protokollierte Session des Buchungs-Agenten **innerhalb eines Buchungszyklus** — von `start_agent_run` bis `finish_agent_run`. Ein Zyklus (*Buchungszyklus / Stapel*) hat n Durchgänge: jeder Rücklauf aus der Kanzlei-Prüfung startet einen neuen im selben Stapel. Der Abschluss rechnet die Handover-Statistik serverseitig, vergleicht sie mit dem Vorgänger (`handover_changed`) und **stellt den Zyklus bereit** (Stapel → `prepared`, F117): bis die Kanzlei die Prüfung übernimmt, holt ihn ein nachgereichter Beleg oder eine beantwortete Klärung zurück zum Agenten.
- Data type: `ludwig.client_agent_runs` (trigger manual/cron/routine, stats jsonb, handover_changed, summary, `export_batch_id` = der Zyklus); Audit-Event `agent_run.completed`.
- Notes: Der Durchgang wählt seinen Zeitraum nicht — er nimmt den ersten Stapel aus der Queue (`get_agent_work_queue`) und übernimmt dessen. Statistik kommt NIE vom LLM (deterministische Queries). `handover_changed=false` ⇒ keine Benachrichtigung (kein Event-Spam bei Leerläufen). **Nicht** „Buchungslauf" sagen, wenn der Zyklus gemeint ist: der Lauf ist die Session, der Zyklus die Klammer. Gegenstück auf der Kanzlei-Seite ist die *Abnahme-Runde* — der Agent fährt Durchgänge, die Kanzlei Runden.

### Notification subscription

- English: `notification subscription`
- German: `Benachrichtigungs-Abo`
- Definition: Checkbox je User × Mandant × Ereignis: wer bekommt die Abschluss-Mail eines Agent-Buchungslaufs. Inhalt rollengetrennt — Kanzlei-User: Vorschläge zur Abnahme + Kanzlei-Klärungen; Mandanten-User: NUR fehlende Belege + Fragen an ihn (nie professional-Texte/Abnahme-Zahlen).
- Data type: `ludwig.client_notification_subscriptions` (`unique(client_id, user_id, event_type)`); UI: Mandanten-Konfiguration → Tab „Benachrichtigungen"; Versand via `getMailer()` (`LUDWIG_EMAIL_TRANSPORT`).
- Notes: Ausgelöst nur bei `handover_changed` (F27). Belegwege bleiben Portal-/Kanzlei-Upload + DATEV-Import — Ludwig liest keine E-Mails (BelegBox ist ein separates Projekt).

### Review item (Prüfpunkt)

- English: `review item`
- German: `Prüfpunkt`
- Definition: Eine Frage, die ein Buchungssatz an die Prüferin stellt — „Stimmt der Steuerschlüssel zum Beleg?", „Trägt das Personenkonto ein Belegfeld?". Serverseitig abgeleitet aus dem, was ohnehin geladen ist; kein eigener Read je Satz.
- Data type: fester Katalog **P-SUMME … P-JUDGE** (23 Codes) in `apps/web/src/modules/stapelabnahme/domain/pruefpunkte.ts`. Quittungen: `ludwig.client_review_checks` mit `check_kind='proposal_checkpoint'`.
- Notes: **Vier Zustände**, und der vierte ist der wichtige: `green` geprüft und in Ordnung · `yellow` auffällig, freigeben nach Quittung · `red` so nicht richtig · **`open` nicht geprüft, weil die Angabe fehlt**. Ein Prüfpunkt, der mangels Belegdaten grün wird, ist eine Lüge. Bestandene Punkte stehen zusammengefasst in **einer** Zeile; eine eigene Zeile bekommt nur, was noch eine Entscheidung braucht. Zu unterscheiden von der *Klärung* — die geht an einen Menschen, der Prüfpunkt an die Prüferin selbst.

### Convention (Konvention)

- English: `convention`
- German: `Konvention`
- Definition: Wissen über einen Mandanten oder eine Kanzlei, das **über den Einzelfall hinaus gilt** und **nicht aus den Daten ableitbar** ist — „Kartenumsätze laufen über 1617", „private Belege des Ehepartners gehören zu den außergewöhnlichen Belastungen". Eine Konvention ist eine **Regel, kein Inventar**: Listen von Konten, Personen oder Partnern sind Stammdaten; was einen Betrag, ein Datum oder eine Belegnummer enthält, ist ein Merkposten und gehört an den Sachverhalt.
- Data type: table `ludwig.client_agent_notes` (der frühere „Firmen-Notiz"-Speicher). `scope` (`client` | `tenant`) trägt die Ebene, `status` (`pending_approval` | `active` | `archived`) den Lebenszyklus, `origin` die Herkunft samt „bestätigt", `note` die Regel und `rationale` das Warum. Kondensierung über `superseded_by`.
- Notes: Zwei Sorten mit unterschiedlichem Schicksal (F106 §3). **Übersetzbar** = hart definiert, kontextfrei; ihr Weg hinaus führt über den [[Product finding]] ins Feature, danach wird sie gelöscht. **Nicht übersetzbar** = verlangt Buchungskontext und Urteil; sie bleibt dauerhaft Text — das ist der Daseinszweck des Speichers. Mandantenregel gilt sofort und sticht die Kanzleiregel zum selben Thema; eine Kanzleiregel gilt erst nach Freigabe durch einen Menschen. Regeln: `docs/topics/buchung.md` R15a–R15e.

### Product finding (Produktbefund)

- English: `product finding`
- German: `Produktbefund`
- Definition: Eine Meldung des Agenten an die Entwicklung: was er tun wollte, was ihn aufgehalten hat, welches Tool oder welcher Schritt betroffen ist. Fehlende Funktionen, Umwege, die ein Tool erzwingt, falsche Automatik, und Informationen, die eigentlich an eine Entität gehören.
- Data type: table `ludwig.platform_product_feedback` (ohne Mandantenbezug — der Beleg steht als Klartext in `evidence`). Status `open` | `accepted` | `rejected`. `feedback_number` ist die laufende Nummer (im UI `#12`), unter der über den Befund geredet wird; `agent_response` der jederzeit überschreibbare Freitext des Entwicklungsagenten, was aus ihm geworden ist (anders als `resolution`, die am Abhaken hängt).
- Notes: Eine Richtung, **kein Rückkanal zum Buchungsagenten**: er erfährt das Ergebnis irgendwann als neues Tool oder geänderten Ablauf, nicht als Ticket-Antwort — die Antwort des Entwicklungsagenten steht nur im Admin-UI. Keine Priorisierung durch den Agenten. Gelesen unter `/admin/product-feedback`; der Zielort einer übernommenen Meldung ist ein `P<n>` im passenden Themen-Dossier. Verdichtung (derselbe Befund aus vielen Läufen, dieselbe Konvention bei mehreren Kanzleien) ist bewusst noch nicht gebaut. Regel: `docs/topics/buchung.md` R15f.

### Clarification question

- English: `clarification question`
- German: `Klärungsfrage`
- Definition: A structured question a stateless processing module emits when it cannot decide on its own and needs a tax advisor or client to answer something. Defined as a Pydantic DTO in `buchassi_shared.processing`.
- Data type: entity (Pydantic `ClarificationQuestion`, table `ludwig.client_accounting_case_clarification` — *vormals `client_invoice_clarifications`*)
- Example: `{ question_type: "bicycle_resale_or_expense", severity: "required", answer_kind: "single_choice", answer_options: [{code: "resale", label: "Wird weiterverkauft"}, {code: "expense", label: "Eigene Nutzung"}], source_module: "booking-module" }`
- Notes: Carries two phrasings — `professional_text` for tax advisors (fachsprachlich) and `client_text` for clients (laienverständlich). `severity == "required"` blocks booking until answered. Catalog of allowed `question_type` values lives in `docs/topics/buchung.md`. Distinct from `Review item` (machine-flagged check) and `Bookkeeping context` (durable accounting metadata).

### Deferral

- English: `deferral`
- German: `Wiedervorlage`
- Definition: A clarification question taken out of every work list until a given date. It is neither answered nor resolved — it is deliberately **not now**. From that date on it is open again as if nothing had happened.
- Data type: columns on `ludwig.client_accounting_case_clarification` (`deferred_until`, `deferred_reason`, `deferred_by_kind`, `deferred_by_clarification_id`, `deferred_count`)
- Example: `{ deferred_until: "2026-09-10", deferred_reason: "Mandant ist bis Monatsende im Urlaub", deferred_by_kind: "agent", deferred_count: 1 }`
- Notes: The counterweight to the hard gate on agent-directed questions (`docs/topics/sachverhalt.md` S10–S12) — a gate you cannot clear gets worked around, so gate and deferral ship together. At most 30 days ahead (one monthly run), reason required, and from the third deferral onwards only a human may defer. Ends early when its cause does: if it hangs on a counter-question (`deferred_by_clarification_id`), answering that one reopens it immediately. A case whose only remaining questions are deferred does **not** close. Distinct from `Expectation`, which is resolved by an *event* rather than by an answer.

### Expectation

- English: `expectation`
- German: `Erwartung`
- Definition: A structured, dated statement that something is still missing at an accounting case — either an incoming document (`kind='document'`) or a payment (`kind='payment'`). Unlike a `Clarification question` it is not *answered* but **resolved by an event**: the document arrives, the payment clears.
- Data type: entity (table `ludwig.client_accounting_case_expectation`)
- Example: `{ kind: "document", direction: "incoming", expected_counterparty_name: "The Growth Group AG", expected_amount: 464.10, due_date: "2026-07-31", due_source: "client_default", escalation_level: 1, audience: "client" }`
- Notes: Both directions share one table on purpose — the expected document and the expected payment are the same list read from opposite ends, and that list is what the bank-statement reconciliation matches against. **The document expectation is the ONLY representation of a missing document (F125)** — there is no clarification for it any more; `audience` says who fetches it (`client` = the client uploads it in the portal, `accounting` = the firm gets it itself), and `note` is one sentence of context (amount, reference and date have columns and never belong in that text). **Created by the booking, never by a due date**: posting to a personal account opens the payment expectation; the DATEV open-item mirror (`client_datev_open_items`) stays a mirror and creates none. Carries **no open balance** — that is computed from the events by `loadCaseOpenPayments`; `expected_amount` is the matching key, not the running total. Maturity (`pending`/`due`/`escalated`/`resolved`) is derived, not stored. `escalation_level` is Ludwig's own maturity axis and must never be exported as a DATEV dunning level. Rules: `docs/topics/sachverhalt.md` S7–S9, `docs/topics/belege.md` R24. See also [[Beleg-Nachforderung (document request)]].

### Beleg-Nachforderung (document request)

- English: `document request`
- German: `Beleg-Nachforderung`
- Definition: The **user-facing word** for the list of open document expectations a client still owes — what the firm "requests" by mail (F39), what the portal card shows, what the cycle badge counts. It is not a data type of its own: technically these are the rows in `ludwig.client_accounting_case_expectation` with `kind='document'`, `resolved_at is null` and (for the client-facing list) `audience='client'`.
- Data type: derived view over [[Expectation]] — no table, no column, no status
- Example: „3 Nachforderungen, fällig 12.07." am Buchungszyklus; „Rechnung von o2 über 23,80 € benötigt" als Portal-Karte
- Notes: Kept as vocabulary because the firm and the client genuinely say „nachfordern". In code and schema the word is `expectation`; only labels, mail text and reports say Nachforderung. Since F125 there is no `document_missing` clarification and no `document_upload` answer kind behind it — a request is not answered, it is resolved by the arriving document. MCP: `expect_document` opens one, `list_document_expectations` lists them, `resolve_expectation` cancels one.

### Invoice log entry (Finding)

- English: `invoice log entry` / `finding`
- German: `Beleg-Log-Eintrag` / `Befund`
- Definition: A structured record emitted by a stateless processing module when it applied a special bookkeeping rule to a document — e.g. defaulted a VAT rate, virtually merged split-batch invoices, deterministically corrected the LLM's classification (`Classification override`).
- Data type: entity (Pydantic `InvoiceLogEntry` in `buchassi_shared.processing`). **Seit F49 WP10 persistiert als `step_kind='finding'`-Zeile in `client_invoice_traces`** (`payload_json.rule_code` trägt den Katalog-Code); die eigene Tabelle `client_invoice_log_entries` ist weg.
- Example: `{ rule_code: "classifier_override_accounting_role", description: "accounting_role: korrigiert von incoming_invoice auf receipt …", source_module: "document-simple-classifier" }`
- Notes: Used for audit trails, not control flow. Persisted per invoice by workflows. Catalog of allowed `rule_code` values is the emitting code itself (grep `rule_code`) — see `docs/topics/belege.md` (R20).

**Abgrenzung zu [Invoice trace](#invoice-trace) — ADR-Umkehr (F49 WP10,
2026-07-29):** Das ursprüngliche „Kein Merge" (F25-T25.1, 2026-07-14) ist
**bewusst revidiert**. Findings und Trace-Steps sind fachlich weiter zwei
Dinge, teilen aber jetzt **eine Tabelle** (`client_invoice_traces`) — das
Zielbild der Log-Konsolidierung (F49: 11 → wenige Log-Mechaniken). Die
begriffliche Trennung bleibt:

| | Finding (`step_kind='finding'`) | übriger Trace-Step |
|---|---|---|
| **Antwortet auf** | „Welche fachliche **Regel** hat gegriffen?" | „Welcher **Schritt** lief, mit welchem Ergebnis?" |
| **Schlüssel** | `payload_json.rule_code` (Katalog!) | `step_kind` (frei) |
| **Beispiel** | `preprocessor_drop_zero_amount_line` | `extraction_completed` |
| **Kontext-Felder** | `summary` (= description), `module` (= source_module), `level` | `payload_json`, `confidence`, `journal_entry_id`, `booking_line_index`, `vat_block_index` |
| **Konsument** | Mensch (Beleg-Log-UI, Findings-Cards) | Debug/Provenance (invoice-debug-Skill) |

Faustregel: **Hat die Pipeline etwas am Beleg *verändert* oder *angenommen*,
das ein Mensch wissen muss → Finding (`step_kind='finding'`, mit Regel-Code
im Payload).** Willst du nur nachvollziehen, *was wann wo* passierte → ein
gewöhnlicher Trace-Step. Warum der Merge trotz der 2026-07-14-Notiz: die
Konsolidierung auf eine Beleg-Detail-Log wiegt schwerer als die Trennung, und
`step_kind`/`payload_json` bilden den Regel-Befund verlustfrei ab.

### Invoice trace

- English: `invoice trace`
- German: `Beleg-Spur`
- Definition: Ein Eintrag der durchgehenden **Prozess-Spur** eines Belegs über
  alle Pipeline-Module hinweg (ADR 2026-05-03): welcher Schritt lief in welchem
  Modul, mit welchem Ergebnis. Append-only, durable.
- Data type: table `ludwig.client_invoice_traces`
- Example: `{ module: "preprocessor", step_kind: "extraction_completed", summary: "…", payload_json: {…}, confidence: 0.91 }`
- Notes: Trägt reichen Kontext, den ein Log-Entry nicht hat — `payload_json`,
  `confidence` und die Buchungs-Anker (`journal_entry_id`,
  `booking_line_index`, `vat_block_index`). Hauptkonsument ist die
  Fehlersuche (invoice-debug-Skill), die den Beleg Layer für Layer
  zurückverfolgt. Seit F49 WP10 lebt auch der
  [Invoice log entry / Finding](#invoice-log-entry-finding) hier — als
  `step_kind='finding'`-Zeile. Kurz: Trace-Step = Ablauf, Finding = Befund,
  **eine Tabelle**.

### Rule code

- English: `rule code`
- German: `Regelkürzel`
- Definition: The `snake_case` identifier on an `Invoice log entry` that names the special rule that was applied (e.g. `assumed_vat_19`, `merge_split_invoices`, `classifier_override_accounting_role`).
- Data type: text column (free-form string, validated at review time against the emitting code — see `docs/topics/belege.md` (R20))
- Example: `classifier_override_accounting_role`
- Notes: Intentionally a string, not an enum: a module should be able to introduce a new rule with one PR plus a catalog entry without forcing every other module to upgrade. Stable across releases — once published, the code is the audit key.

### VAT rule code

- English: `VAT rule code`
- German: `Vorsteuer-Regelcode`
- Definition: Stable identifier (`VST-<GROUP>-<n>`, e.g. `VST-DOC-3`) for one check a bookkeeper must perform to assess input-tax-deduction eligibility. Defined in the knowledge space `docs/reference/input-tax-deduction/rule-catalog.md`; referenced by the input-tax playbook, judge criteria (B3.x), guards and the planned VAT-Rules-Service (`docs/topics/buchung.md`).
- Data type: string constant (catalog-validated, like `rule code` — new rules ship as one catalog entry, no enum migration)
- Example: `VST-DOC-3` (Kleinbetragsrechnung ≤ 250 €, §§ 33/35 UStDV)
- Notes: Groups: `CL` client-level, `USE` business use, `DOC` invoice form, `DUE` tax legally owed, `XB` cross-border, `BAN` deduction bans, `TIME` timing, `ADJ` adjustments (§ 17/§ 15a). Law changes are edited in the catalog first, then propagated to the enforcing artifacts (see `enforcement-map.md`).

### Answer option

- English: `answer option`
- German: `Antwortoption`
- Definition: One pre-defined answer choice on a `Clarification question`.
- Data type: entity (Pydantic `AnswerOption` in `buchassi_shared.processing`)
- Example: `{ code: "resale", label: "Wird weiterverkauft" }`
- Notes: `code` is the stable, machine-readable identifier (persisted when the user picks the option); `label` is the German UI label and may be re-translated freely without breaking history.

### Answer kind

- English: `answer kind`
- German: `Antwortform`
- Definition: The shape of the answer expected for a `Clarification question`. Drives UI rendering. Values: `yes_no`, `single_choice`, `multi_choice`, `free_text`.
- Data type: enum value (`Literal` in `buchassi_shared.processing.AnswerKind`)
- Example: `single_choice` for "Wird das Fahrrad weiterverkauft oder als Aufwand erfasst?"
- Notes: For `*_choice` / `yes_no`, `answer_options` is non-empty. For `free_text`, `answer_options` is empty. `allow_free_text` may additionally enable a "Sonstiges …" field alongside the choices.

### Question severity

- English: `question severity`
- German: `Frageschwere`
- Definition: Whether a `Clarification question` blocks booking. Values: `required` (workflow must pause until answered), `optional` (recorded for review, non-blocking).
- Data type: enum value (`Literal` in `buchassi_shared.processing.QuestionSeverity`)
- Example: `required` for "Soll dieses Fahrrad als Anlagegut bilanziert oder als Aufwand erfasst werden?"
- Notes: Choose `required` only when the booking would otherwise be objectively wrong without the answer. `optional` is for soft data-quality follow-ups.

### Source module

- English: `source module`
- German: `Quellmodul`
- Definition: Who produced an `Invoice log entry` or `Clarification question` — the five stateless pipeline modules plus two non-pipeline origins: `agent` (MCP agent) and `web` (a firm employee asking a question by hand through the UI).
- Data type: enum value (`Literal` in `buchassi_shared.processing.SourceModule`); the DB CHECK on `client_accounting_case_clarification.source_module` carries the two extra origins.
- Example: `document-simple-classifier`
- Notes: A typed Literal so adding a module is a deliberate PR (extend the Literal + glossary entry + import in the new module). On clarification questions the value is load-bearing, not descriptive: `replace_clarifications` only wipes questions whose origin is a pipeline module, and `answerClarification` routes the case back to whoever asked (`agent` → agent queue, `web` → the firm). Workflows also uses it to attribute audit entries to the responsible module.

### Shared contracts package

- English: `shared contracts package`
- German: `gemeinsames Datentyp-Paket`
- Definition: The single repo location (`apps/shared`, Python package `buchassi_shared`) for cross-cutting Pydantic DTOs and `Literal` aliases used by more than one stateless processing module.
- Data type: schema (Python package)
- Example: `buchassi_shared.llm.LLMCallRecord`, `buchassi_shared.processing.InvoiceLogEntry`.
- Notes: Strict scope — pure data types, no DB code, no settings, no SDK dependencies, no business logic. See `apps/shared/MODULE_CONTEXT.md`. Dependency direction is one-way: every other `apps/*` package may import `buchassi_shared`; `buchassi_shared` imports nothing from `apps/*`. This is the *only* shared library in the repo; the previous TS-Contracts approach was deliberately removed and is **not** to be reintroduced (see `docs/topics/architektur.md`).

### Proposed posting

- English: `proposed posting`
- German: `Buchungsvorschlag`
- Definition: A suggested accounting posting produced by the processing service.
- Notes: This is not accepted bookkeeping truth until it is explicitly reviewed and marked as accepted.

### Acceptance quality

- English: `acceptance quality`
- German: `Abnahme-Qualität`
- Definition: How a journal entry was finally accepted relative to the agent's proposal — the success signal of the agent loop. Values on `client_journal_entry.acceptance_quality`: `ai_unmodified` (proposal accepted untouched), `ai_edited` (proposal edited before accept), `manual_only` (booked without a proposal), `imported` (DATEV history).
- Notes: Set by the accept paths (`booking-actions.ts`, `close-actions.ts`) and the editor path (`saveEventBooking`). Aggregated per client + booking month (shares, proposal count, median `proposal_confidence` accepted vs. rejected) in `acceptance-quality-queries.ts`; admin view `/admin/acceptance-quality`. See F05-T5.5.

### Rationale source

- English: `rationale source`
- German: `Begründungs-Quelle`
- Definition: A machine-readable reference that backs an agent/human decision (booking proposal, clarification, case update). Lives as a jsonb convention in `client_journal_entry.proposal_rationale.sources[]` and in audit payloads — not a separate table.
- Data type: schema / jsonb convention. Kinds: `source_doc`, `contract` (id = the contract's `source_doc_id`), `bank_transaction`, `clarification` (an answered question), `vendor_history` (id = creditor), `rule`, `law` (citation + optional url), `web` (url + optional quote).
- Example: `{ "kind": "source_doc", "id": "…uuid…", "quote": "Rechnung Zeile 3" }`
- Notes: Canonical Zod schema: `apps/web/src/modules/accounting-cases/domain/rationale-source.ts` (`RationaleSourceSchema`). The `*_id` kinds MUST reference an entity of the same client — writers validate this (`assertSourcesBelongToClient`) so `sources[]` cannot become a hallucination vector. See `docs/topics/buchung.md` §5 F3.

### Chart of accounts

- English: `chart of accounts`
- German: `Kontenrahmen`
- Definition: The account structure used by the client for bookkeeping.
- Notes: Durable bookkeeping artifact. During the prototype it will be held by `workflows`; ownership may move when a separate system of record is reintroduced.

### Receipt / document

- English: `document`, `receipt`
- German: `Beleg`, `Dokument`
- Definition: A source document such as a PDF invoice or receipt used for bookkeeping.
- Notes: File blobs live in storage, technical metadata lives on the stored-file record. During the prototype both are coordinated by `workflows`.

### Receipt date (Eingangsdatum)

- English: `received date`
- German: `Eingangsdatum`
- Table/column: `ludwig.client_source_docs.received_date` (date, NOT NULL, default `current_date`)
- Definition: Tag, an dem der Beleg **beim Mandanten eingegangen** ist — die Perioden-Achse der Belegliste und der Dashboard-Kennzahlen. Default ist der Upload-Tag; der DATEV-Metadaten-Import (`Belege_Meta_*.csv`, Spalte „Eingangsdatum") überschreibt ihn mit dem Wert aus DATEV Unternehmen Online.
- **Abgrenzung zu den beiden anderen Datums-Achsen am Beleg:**
  - **Belegdatum** (`client_source_docs.document_date`, bei Rechnungen `client_source_docs_invoices.invoice_date`) — das Datum, das **auf dem Beleg steht**. Nullable: unbekannt bleibt unbekannt, es wird **nicht** ersatzweise mit dem Upload-Tag gefüllt.
  - **Upload-Zeitpunkt** (`uploaded_at`, timestamptz) — rein technisch, wann die Datei in Ludwig landete.
- Notes: Bis 2026-07-20 filterte die Belegliste über `invoice_date` und die UI zeigte `coalesce(document_date, uploaded_at)` als „Belegdatum" an — ein Upload-Tag, der als Belegdatum gelesen wurde. Beide Fallbacks sind entfernt; die Perioden-Zuordnung hängt jetzt am Eingangsdatum.

### Source document supertype & specializations (Beleg-Supertyp)

- English: `source document` (supertype) / `invoice`, `contract`, … (specializations)
- German: `Beleg` (Oberbegriff) / `Rechnung`, `Vertrag`, … (Spezialisierungen)
- Definition: **`Beleg` ist der generische Oberbegriff für jedes eingehende Quell-Dokument; `Rechnung` ist nur EINE fachliche Ausprägung davon.** `client_source_docs` ist die Supertyp-Tabelle (trägt die gemeinsamen Felder: `stored_file_id`, `status`, der Diskriminator `source_doc_type`, sowie die Klassifikations-Ergebnisse `class_case_summary` / `class_counterparty_name` / `class_summary` …). Jede fachliche Ausprägung wird als 1:1-Subtyp-Tabelle modelliert — `client_source_docs_invoices` heute, `client_source_docs_contracts` o. Ä. künftig **gleichartig**. Das ist Class-Table-Inheritance, kein Sonderfall pro Typ.
- Data type: Supertyp-Tabelle (`ludwig.client_source_docs`) + N Subtyp-Tabellen; Diskriminator `source_doc_type ∈ {invoice, contract, bank_statement_pdf, travel_expense_report, declaration, other}`.
- Example: Eine Rechnung = **eine** `client_source_docs`-Zeile (`source_doc_type='invoice'`) **plus** eine `client_source_docs_invoices`-Subtyp-Zeile mit den Rechnungs-Details (vendor, invoice_number, Brutto/Netto/USt, Leistungszeitraum …).
- **Entscheidungsgrundlage (gilt für künftige Modell-/UI-Entscheidungen):**
  1. **Gemeinsame Felder gehören an den Supertyp** (Gegenpartei, Summary, Datum, Status, Datei) und müssen dort verlässlich befüllt sein — nicht nur am Subtyp. (Heute verletzt: CLI-Ingest legt nur die Invoice-Subtyp-Row an, die Base-Row bleibt leer → Cases ohne Summary; Quickfix liest ersatzweise vom Subtyp. Siehe Memory `project_source_docs_base_row_missing`.)
  2. **Neue Belegart = neuer Subtyp + neuer Diskriminator-Wert + neuer Renderer-Registry-Eintrag**, NICHT Sonderpfade im bestehenden Code. Erweiterbar wie die `EntityStatusBadge`-Registry.
  3. **Reads & UI zeigen IMMER alle Belege über die Supertyp-Ebene** (Listen, Timeline, Sachverhalt). Subtypen liefern nur zusätzliche Detail-Felder zur Anreicherung. Niemals auf `invoices` filtern, wo „Belege" gemeint sind — sonst verschwinden Verträge / Bankauszüge aus der Ansicht.
  4. **Nicht jede Belegart bekommt einen Subtyp.** Container-Belegarten — Kontoauszug (`bank_statement_pdf`), Kreditkartenabrechnung (`credit_card_statement`), Reisekostenabrechnung (`travel_expense_report`) — tragen keine eigenen Fachfelder, sondern klammern andere: ihre Struktur liegt am Import-Batch (`client_bank_import_batches`: Zeitraum, Anfangs-/Endsaldo, Auszugsnummer, Zeilenzahl) bzw. an den Kind-Belegen der Dokumentgruppe (`parent_source_doc_id` + `collection_kind`, `belege.md` R25). Für sie ist eine Subtyp-Tabelle ausdrücklich nicht vorgesehen. Der Renderer-Registry-Eintrag „Container/Deckblatt" hängt an der Gruppen-Relation, nicht an der Belegart — die Registry je Belegart führt nur Rechnung und Vertrag. (Owner-Rückfrage Design-System B2, 2026-09-04.)
- Notes: Konkretisiert die „Datenmodell-Schichten"-Tabelle oben (Zeile „Quelle (Dokument)" / „Quelle (Subtyp Rechnung)"). Owner-Entscheidung 2026-06-03: Beleg ↔ Rechnung sprachlich/UI-seitig sauber als Oberbegriff ↔ Ausprägung führen.

### Document completion (Beleg-Erledigung)

- English: `document completion`
- German: `Beleg-Erledigung` / `erledigt`
- Table/column: `ludwig.client_source_docs.completed_at` (+ `completed_reason`)
- Definition: Der Beleg ist **fachlich durch** — es ist nichts mehr an ihm zu tun. Vier Anlässe: (1) die Buchung ist erfolgt, (2) aus dem Sachverhalt entsteht keine Buchung, (3) das PDF wurde durch andere ersetzt (Dokumententeilung), (4) der Beleg ist gar nicht buchungsrelevant (Bescheid, Ankündigung einer Abbuchung). `completed_at IS NULL` = der Beleg steht noch in der Todo-Liste. Bewusst am **Supertyp**, nicht am Invoice-Subtyp: Fall (4) betrifft typischerweise Belege ganz ohne Invoice-Zeile.
- Data type: `timestamptz` (nullable) + `text` (nullable), Migration 20260720130000
- Notes:
  - Grenzt sich scharf von `processing_status='processed'` ab: das heißt nur „Pipeline durchgelaufen", nicht „fertig". Der 2026-05-19-Refactor (20260519120000) hat fachliche Werte aus der technischen Achse entfernt — deshalb hier eine eigene Spalte statt eines neuen `processing_status`-Werts.
  - Die Fälle (1)–(3) setzen **DB-Trigger** automatisch (`ludwig_private.complete_source_docs_on_case_close` am Sachverhalt, `…_on_supersede` am Beleg). Nicht an den Callsites: Cases werden heute an sieben Stellen geschlossen, teils aus Python/CLI an Next.js vorbei.
  - Fall (4) ist per Definition nicht ableitbar (kein Case, nichts ersetzt) — dafür die Server Action `completeSourceDoc` mit Pflicht-Begründung, auditiert als `document.completed_manually`.
  - UI: „Erledigt"-Badge mit der Begründung als Tooltip in der Belegliste (schlägt den Pipeline-Status), Erledigen/Wieder-öffnen auf der Beleg-Detailansicht, Filter „Nur unerledigte" (`?open=1`).

### Review disposition (Beleg-Review-Zuständigkeit)

- English: `review disposition`
- German: `Review-Disposition` / `Korrektur-Zuständigkeit`
- Table/column: `ludwig.client_source_docs_invoices.review_disposition` (+ `review_disposition_reason`, `review_disposition_changed_at`)
- Definition: Wer bearbeitet die Nacharbeit eines fehlgeschlagenen oder review-pflichtigen Belegs (Pipeline-Crash oder Extraktions-Befund wie `line_totals_mismatch`): `agent` (lokaler MCP-Agent) oder `accounting` (Kanzlei). **Konvention „Agent zuerst": NULL wird von allen Queries als `agent` behandelt** — die Pipeline muss nichts setzen; erst die Eskalation des Agenten (`escalate_doc_review`) schreibt `accounting`, ein Mensch kann zurück auf `agent` stellen. Jede Korrektur/Umdisposition wird in `platform_audit_events` protokolliert (`actor_kind='agent'` bzw. `user`).
- Data type: text CHECK (`agent` | `accounting`), NULLable (Migration 20260706120000)
- Notes: Beleg-Achse — orthogonal zur `disposition` am Sachverhalt (wer buchst) und zum `lifecycle_status` (Reviewer-Status). Hier geht es um Extraktions-/Pipeline-Qualität der Quelle, nicht um die Buchung. Agent-Tools: `list_docs(bucket='for_review')`, `get_invoice_extraction`, `update_invoice_extraction`, `escalate_doc_review`, `override_classification`.

### Open finding (Offener Befund)

- English: `open finding`
- German: `Offener Befund`
- Table/column: `ludwig.client_source_docs_invoices.open_findings` (jsonb, `[{code, field?, severity, message, source_module, detail}]`)
- Definition: Reparierbarer Interpreter-Befund (F18: `missing_required_field`, `summary_line_mismatch`), der den Ingest NICHT mehr auf `failed` blockiert — der Beleg läuft durch und trägt den expliziten Status `processing_status='review_needed'` (Stage `interpreted`); das Offene steht strukturiert am Beleg. Agent/Mensch trägt gezielt nach (`update_invoice_extraction`, inkl. `currency`); die Korrektur wird SYNCHRON OCR-/LLM-frei re-validiert (`POST …/invoices/{id}/revalidate` → `InvoiceRevalidationService`, nur `check_integrity`) — aufgelöste Befunde verschwinden sofort, bei leerer Liste flippt der Status auf `processed`. Leer = nichts nachzutragen.
- Notes: Severity bleibt `error` (Audit-Wahrheit); recoverable-Marker in `detail.recoverable`. Nicht-reparierbare Criticals (`no_open_cycle_for_date`, `totals_mismatch`, `validity_*`) failen weiterhin hart. `list_docs(bucket='for_review')` und die Agent-Inbox filtern auf `processing_status in ('failed','review_needed')`; `attach_source_doc_to_case` verlangt Datum/Brutto/Währung auch bei `review_needed`. CLI: `revalidate-invoice <id>`. Siehe decision-log 2026-07-17 + 2026-07-20.

### Pipeline supervision (Pipeline-Supervision)

- English: `pipeline supervision`
- German: `Pipeline-Supervision`
- Definition: Der MCP-Agent überwacht die Beleg-Pipeline und sorgt dafür, dass kein Beleg still liegen bleibt: `list_docs(bucket='in_pipeline')` liefert die Verarbeitungs-Übersicht mit Buckets `in_flight` (arbeitet), `stuck` (keine Bewegung seit >30 min — Zombie-Verdacht), `failed`, `classification_failed`; `retry_doc_processing` stößt gezielt einen Neu-Lauf an (ohne Invoice-Zeile → Klassifizierung, mit → `run-flow?force`). Bleibt der Beleg kaputt, schließt der Agent ihn selbst ab: PDF via `get_download_url` lesen, Extraktion korrigieren, Case anlegen/anhängen — der Case-Attach setzt einen failed-Beleg als **Seiteneffekt** auf `processing_status='processed'` (Audit `doc.completed_manually_by_agent`). Kein freies `set_status`-Tool.
- Notes: Der Retry-Counter ist das Audit-Event `doc.pipeline_retried_by_agent` (max. 3 ohne `force`). Ablauf: Playbook „Pipeline-Supervision" (`agent-playbooks.md`); Entscheidung: decision-log 2026-07-06. Orthogonal zur `Review disposition` (wer korrigiert Extraktionswerte) — hier geht es um Pipeline-Durchsatz, nicht um Werte-Qualität.

### Document axes guard (REQ-004 #3)

- English: `document axes guard`
- German: `Beleg-Achsen-Regel`
- Definition: **Vier orthogonale Achsen** klassifizieren einen Beleg — sie dürfen NICHT in ein einzelnes Enum gemischt werden:
  - `document_form` — visuelle / Verarbeitungs-Form (Tankbeleg vs. Rechnung vs. Bankauszug …). Treibt die Pipeline-Verzweigung im `invoice-preprocessor`. **Erweiterbar** (typed PR + Migration).
  - `document_kind` — buchhalterische Natur (`original` / `credit_note` / `self_billing` / `refund`). Treibt Vorzeichen + Buchungs-Pfad. Geschlossen.
  - `doc_direction` — Belegrichtung aus Mandantensicht (`inbound` / `outbound` / `internal`). Vom Workflow deterministisch aus Stammdaten aufgelöst, nicht vom Classifier. Geschlossen. *(Hieß bis F87 `accounting_role`.)*
  - `doc_category` — Belegkategorie: welcher **Folgeprozess** gilt (`performance` / `payment` / `foundation` / `internal` / `report`). Deterministisch aus `document_form` abgeleitet, nie vom LLM. Geschlossen. *(Neu mit F87.)*

  Die Achsen-Wertemengen und das Form→Kategorie-Mapping: eine Quelle im Code (`document-form-mapping.ts` ↔ Python ↔ DB-CHECK) — siehe `docs/topics/belege.md`.
- Rule: Beim Anlegen neuer Pydantic-Enums / DB-Spalten / API-Felder, die Belege beschreiben: **keine** Werte mischen, die zu unterschiedlichen Achsen gehören (z.B. `incoming_invoice` ⊕ `credit_note` ⊕ `expense_report` in *einem* Enum — siehe der entfernte `DocumentType`-Klassifikator aus REQ-003 AP-2 als Negativ-Anker). Stattdessen drei separate Felder, ggf. mit dokumentierter Kombinations-Tabelle (siehe `Document kind`).
- Hintergrund: Memory `project_document_form_vs_accounting_role` (Owner-Feedback 2026-05-14). REQ-003 AP-2 hat den letzten gemischten Enum-Code entfernt; dieser Guard verhindert das Wieder-Einführen.

### Document classification

- English: `document classification`
- German: `Belegklassifikation`
- Definition: The structured verdict produced by `document-simple-classifier` for one PDF. Two fixed axes (`document_form`, `document_kind`), each with a confidence score, plus a German summary and a list of mentioned companies. Direction (Eingangs- vs. Ausgangsrechnung) ist bewusst NICHT Teil dieser Klassifikation — siehe `Accounting role`.
- Data type: entity (Pydantic `DocumentClassification`, planned table `ops_document_classifications`)
- Example: `{ document_form: fuel_receipt (0.95), document_kind: original (0.90) }`
- Notes: Each axis is persisted as its own column so `workflows` can branch on values directly. The taxonomy is hard-coded in Python enums, not config-loaded — extending it is a typed PR plus migration. Bis 2026-05-18 trug die Klassifikation eine dritte Achse `accounting_role`; sie wurde entfernt, weil der LLM-Direction-Hint strukturell unzuverlässig war (decision-log 2026-05-18).

### Doc direction (Belegrichtung)

- English: `doc direction`
- German: `Belegrichtung`
- **Rename:** hieß bis F87 (2026-08-20) `accounting_role`. Umbenannt, weil `client_ledger_accounts.accounting_role` die **Kontenrolle** meint (`general_ledger|creditor|debtor|revenue|other`) — zwei völlig verschiedene Achsen unter einem Namen (P11/O8). Die Kontenrolle behält ihren Namen; umbenannt wurde nur die Belegseite. Werte-Migration: `incoming → inbound`, `outgoing → outbound`.
- Definition: Direction des Belegs aus Mandantensicht — *wer zahlt wen*. Werte: `inbound`, `outbound`, `internal`, NULL. NULL heißt seit 2026-08-20 **nicht anwendbar**, nicht mehr unbekannt: Belegformen, die gar keine Umsatzbelege sind (Steuerbescheid, Vertrag, USt-Zusammenfassung), bekommen keine Richtung — dort ist die Frage gegenstandslos. Ebenfalls NULL: Belege, die die Pipeline nie durchlaufen haben (Alt-Daten, manuell angelegte Quellen). Seit W2 (Datenmodell-Review 2026-07-29, Migration 20260729280000) sind die Legacy-Langformen `incoming_invoice`/`outgoing_invoice` sowie die historischen Klassifikator-Werte (`receipt`, `bank_statement`, …) aus Daten und CHECK entfernt. Wird seit 2026-05-18 NICHT mehr vom Classifier vergeben, sondern deterministisch vom Workflow aufgelöst.
- Data type: text auf `ludwig.client_source_docs_invoices.doc_direction` mit zugehöriger `doc_direction_confidence`. CHECK: `inbound | outbound | internal`, NULLable.
- Example: `inbound` für eine Eingangsrechnung an den Mandanten — entschieden über `customer_ust_id == mandant.vat_id`.
- **`internal` hat heute bewusst keinen Schreiber:** die Spalte lebt am Invoice-Subtyp, und das Subtyp-Gate (F87-T87.4) lässt nur `doc_category='performance'` dorthin — interne Belege bekommen gar keine Zeile. Siehe `docs/topics/belege.md` R10.
- Notes: Auflösungs-Kaskade in `InterpretationContextLoader.resolve_doc_direction`. **Die Beweislast liegt allein auf `outbound`** — die einzige Frage ist, ob der Mandant die Rechnung selbst ausgestellt hat; lautet die Antwort nicht nachweislich ja, ist der Beleg eine Eingangsrechnung (das ist bei jedem Mandanten die große Mehrheit). Stufen: (0) Belegkategorie der Form != `performance` → keine Richtung (`form_not_invoice`) — seit F87 aus der einen Mapping-Quelle statt aus einer handgepflegten Formen-Liste; (1) UStID unserer Seite == `platform_clients.vat_id` → outbound (1.0); (2) Name unserer Seite trifft `legal_name` oder einen `trade_names`-Eintrag → outbound (0.9 exakt/enthalten, 0.85 fuzzy via `token_sort_ratio` ≥ 92); (3) der Beleg trägt eine UStID, die nachweislich nicht unsere ist → inbound mit `foreign_ust_id` (0.9) — der Beweis des Gegenteils, kein fehlender Beweis; sonst (4) inbound mit `default_incoming` (0.5). Der Unterschied zwischen (3) und (4) ist für den Judge der Punkt: belegt gegen angenommen — im Staging-Bestand trennt das 103 von 116 inbound-Belegen. „Unsere Seite" ist der Aussteller (`vendor`); bei `document_kind=self_billing` (§14-UStG-Gutschrift) rechnet der Leistungsempfänger ab, dort wird die Customer-Seite geprüft. Der signal-String der gewinnenden Stufe landet im Trace `doc_direction_resolved`, bei Fuzzy-Treffern zusätzlich der Score. Buchhalterische Natur (Storno/Self-Billing/Refund) ist orthogonal in `Document kind`; Verarbeitungs-Pipeline in `Document form`. Widerspricht ein Classifier-Rollen-Tag (`mentioned_companies`) der aufgelösten Richtung, hängt der Workflow ein `direction_conflict`-Finding an den Beleg und flaggt ihn fürs Review (Owner 2026-08-14); dasselbe Netz trägt seit F87 den O7-Wächter `classification_self_on_both_sides` (Mandant auf Aussteller- UND Empfängerseite = Klassifikations-/Extraktionsfehler, nie ein Routing) — seit dem Default-Umbau ist das die tragende Zweitmeinung für still angenommene Eingangsrechnungen. Zur Kalibrierung des Fuzzy-Schwellwerts und warum `token_sort_ratio` statt `token_set_ratio`: siehe decision-log 2026-08-20.

### Doc direction line (Richtungszeile)

- English: `doc direction line`
- German: `Richtungszeile`
- Definition: Deterministisch gerenderte Kopfzeile über der Beleg-Zusammenfassung, abgeleitet ausschließlich aus verifizierten strukturierten Feldern (`doc_direction` + Gegenpartei + Betrag), z.B. `Eingangsrechnung von Telekom · 119,00 EUR` / `Ausgangsrechnung an Certina Management · 20.000,00 EUR`. Fehlt `doc_direction`, gibt es KEINE Zeile — lieber nichts als geraten (Owner 2026-08-14).
- Data type: pure Funktion `renderDocDirectionLine` / `prefixSummaryWithDirectionLine` in `apps/web/src/modules/source-docs/domain/doc-direction-line.ts`.
- Example: `get_case`-Events und `list_docs(open)` liefern die Summary mit vorangestellter Richtungszeile; die Invoice-Detailansicht (GlanceCard) zeigt sie fett über der `document_summary`.
- Notes: Hintergrund: Die Classifier-`summary` ist Orientierungs-Info und trifft seit dem Prompt-Update 2026-08-14 bewusst keine Richtungsaussagen mehr (Vorfall: Summaries dreier SCV-Ausgangsrechnungen behaupteten die falsche Richtung, das strukturierte Feld war korrekt). Richtung kommt ausschließlich aus dem verifizierten Rollen-Feld.

### Document form

- English: `document form`
- German: `Belegform`
- Definition: One axis of `Document classification`. Describes the formal shape of the document, which drives the downstream pipeline choice. Values: `commercial_invoice`, `fuel_receipt`, `hospitality_receipt`, `cash_receipt`, `bank_statement`, `credit_card_statement`, `cash_register_closing`, `payment_reminder`, `payroll_slip`, `expense_report`, `delivery_note`, `contract`, `tax_assessment`, `tax_filing_summary`, `accounting_report`, `document_collection`, `other`, `unknown`. **Erweiterbare** Achse — ein neuer Wert braucht einen typed PR, eine Migration UND eine Zeile in der Mapping-Quelle (`docs/topics/belege.md` § 5); der Deckungsgleichheits-Test erzwingt das.
- Data type: enum value (Python `DocumentForm`)
- Example: `fuel_receipt` for a Tankquittung.
- Notes: Each form maps to a distinct downstream handler:
  - `commercial_invoice` → schwere `invoice-preprocessor`-Pipeline mit Line-Item-Splitting (umfasst auch wiederkehrende Abo-Rechnungen — der Recurring-Aspekt ist fachlich, nicht Form-Aspekt; `subscription_invoice` 2026-05-22 entfernt, weil keine eigene Verarbeitungs-Verzweigung existierte).
  - `fuel_receipt`, `hospitality_receipt`, `cash_receipt` → keine Line-Items, deutsche Steuerlogik ist per-Beleg.
  - `bank_statement` → Saldenabgleichs-Workflow, nicht Rechnungspipeline.
  - `credit_card_statement` → Kreditkartenabrechnung; eigener Folgeprozess (Abrechnungspositionen ↔ zugehörige Einzelbelege), NICHT der Bank-Kontoauszug-Pfad. Aus `bank_statement` herausgetrennt mit F71 (decision-log 2026-08-12): der Prozess hängt am Belegtyp, nicht daran, ob Belege angehängt waren. Erkennungsmerkmal gegen `bank_statement`: maskierte Kartennummer + Kartenaussteller statt IBAN.
  - `payment_reminder` → keine neue Forderung buchen, Referenz auf bestehende Rechnung.
  - `payroll_slip` → eigener Lohnbuchungs-Workflow (DATEV LODAS o. Ä.).
  - `expense_report` → Spesen-Workflow mit Pauschalen und Kilometergeld.
  - `delivery_note` → kein Buchungsvorgang, oft als Beilage zur Rechnung; nicht doppelt buchen.
  - `cash_register_closing` → **eigener** Kassenabschluss des Mandanten (Z-Bon / TSE-Export): Tagesumsatz nach Steuersätzen, kein Lieferant. Zahlungsbeleg, nicht Kleinbetragsrechnung — Abgrenzung zu `cash_receipt` (fremder Bon mit Vorsteuer). Neu mit F87/O6.
  - `tax_assessment` → Steuerbescheid einer Behörde. Nachweisbeleg, **kein** Umsatzbeleg: kein Invoice-Subtyp, keine Richtung. Neu mit F87 (war ein P8-Phantom: der Interpreter kannte den Wert, der Classifier konnte ihn nicht vergeben, also liefen Bescheide als Rechnung durch).
  - `tax_filing_summary` → eigene Steuererklärung / Voranmeldung (USt-VA, ZM, ELSTER-Protokoll). Wie `tax_assessment`. Zweites P8-Phantom.
  - `accounting_report` → DATEV-Eigenauswertung (USt-Werteblatt, SuSa, BWA, Kontennachweis). **Kein Beleg** — wird automatisch erledigt. Bewusst EINE Sammel-Form: kein Folgeprozess unterscheidet die Auswertungsarten. Neu mit F87/O7.

  **`document_form` ist bewusst nicht in `document_type` umbenannt** (entschieden 2026-05-14). „Form" beschreibt die **visuelle/Verarbeitungs-Form** des Belegs — die Achse, an der der `invoice-preprocessor` formspezifische Vereinfachungen aufhängt (Tankbeleg-Layout vs. Bewirtungsbeleg-Layout vs. Rechnungs-Layout). Den **fachlichen Belegtyp** (Eingangs- vs. Ausgangsrechnung) trägt orthogonal `doc_direction`, den **Folgeprozess** `doc_category`. Die Felder bleiben getrennt: ein und derselbe `fuel_receipt` (Form) kann je nach UStID-Lage `inbound` ODER `outbound` sein — die Kategorie ist in beiden Fällen `performance`.

### Document category (Belegkategorie)

- English: `document category`
- German: `Belegkategorie`
- Table/column: `ludwig.client_source_docs.doc_category` (text, nullable, CHECK)
- Definition: **Vierte, orthogonale Achse am Beleg-Supertyp** (F87, Owner-Entscheid 2026-08-20). Sie sagt nicht, *was* das Dokument ist (das sagt `document_form`), sondern **welcher Folgeprozess gilt**. Vier Säulen plus ein „kein Beleg"-Ausgang:

  | Wert | Deutsch | Bedeutung | Folgeprozess |
  |---|---|---|---|
  | `performance` | Leistungsbeleg | belegt Leistung/Lieferung samt Zahlungsaufforderung oder Gutschrift | Invoice-Subtyp + `invoice_run_flow` — aber nur bei Rechnungsdokumenten |
  | `payment` | Zahlungsbeleg | tatsächlicher Geldfluss auf einem Geldkonto | kein Subtyp, Agent-Bucket |
  | `foundation` | Nachweisbeleg | rechtliche Nachweis-/Berechnungsgrundlage ohne eigene Rechnungsstellung | Kontext-Zweig; Contract-Extract nur bei Form `contract` |
  | `internal` | Interner Beleg | selbst erstellt (GoBD-Eigenbelegprinzip) | Agent-Bucket |
  | `report` | Auswertung | **kein Beleg** — Bericht über bereits gebuchte Vorgänge | auto-`completed_at` mit festem `completed_reason` |
  | NULL | Unklassifiziert | Auffang (`other`/`unknown`), Container (`document_collection`) oder noch nicht klassifiziert | Agent-Bucket — nie stilles Raten |

- Data type: text, CHECK `client_source_docs_doc_category_check` (Migration `20260820160000`)
- Example: `tax_assessment` → `foundation` (kein Invoice-Subtyp, keine Richtungszeile); `accounting_report` → `report` (sofort erledigt).
- **Wer sie schreibt:** ausschließlich der Classify-Writer bzw. `processSourceDoc`, **deterministisch aus `document_form`** über genau eine Mapping-Quelle — `apps/web/src/modules/source-docs/domain/document-form-mapping.ts` und ihr Python-Spiegel `buchassi_shared.document_category`. Nie das LLM, nie händisch. Ein Override der Belegform zieht die Kategorie automatisch nach.
- **Verhältnis zu `source_doc_type` (C5):** die Kategorie liegt **über** dem Diskriminator, ersetzt ihn nicht. Beide kommen aus derselben Mapping-Zeile und können deshalb nicht auseinanderlaufen. n:1 von Typ zu Kategorie, nie 1:n. Listen filtern auf die Kategorie (fachlich stabil), Renderer auf den Typ.
- **Subtyp-Gate:** `client_source_docs_invoices` entsteht nur noch bei `doc_category='performance'`. Umgekehrt gilt das nicht — Lieferschein und Mahnung sind Leistungsbelege ohne Invoice-Zeile.
- Notes: Ersetzt vier historisch getrennt gepflegte Formen-Listen, die nachweislich auseinandergelaufen waren (P8/B21) — eine davon enthielt Werte, die der Classifier gar nicht vergeben konnte. Darstellung über die Status-Registry-Achse `beleg_kategorie`. Vollständige Achsen-Tabelle, MECE-Nachweis und Owner-Entscheide: `docs/topics/belege.md`; Herleitung des Modells: git-Historie von `docs/concepts/belegkategorien-vier-saeulen.md`.

### Document collection

- English: `document collection`
- German: `Sammel-PDF` / `Sammelbeleg-PDF`
- Definition: `Document form`-Wert (`document_collection`) für ein PDF, das **mehrere eigenständige Teildokumente** enthält (z. B. Kreditkartenabrechnung + dahinter die Einzelbelege). Abgrenzung: eine mehrseitige Einzelrechnung (eine Rechnungsnummer, fortlaufende Seiten) ist KEIN `document_collection`.
- Data type: enum value (Python `DocumentForm`; eingeführt mit F16)
- Example: 24-Seiten-PDF: Seiten 1–4 American-Express-Abrechnung, Seiten 5–24 Einzelbelege.
- Notes: Qualifiziert nie für den Invoice-Flow; mappt auf `source_doc_type='other'`. Seit F71 (decision-log 2026-08-12) zerlegt der **Server** das PDF: der Classifier liefert den Split-Plan maschinenlesbar als `Page segments`, ein `source_doc_split`-Job schneidet und speist jeden Teil regulär ein. Nur wenn das Gate nicht greift (Konfidenz < 0.8, kein/verworfener Plan), landet das Original in `list_docs(bucket='unprocessable')` beim lokalen Agenten (Playbook „Sammel-PDF zerlegen"). Die Kette Original → Teilbelege trägt `parent_source_doc_id` + `split_page_range`; das zerlegte Original wird per `supersede_source_doc` abgehakt (superseded, nicht deleted — Spur bleibt).

### Page segments

- English: `page segments`
- German: `Split-Plan` / `Seitenbereiche`
- Definition: Maschinenlesbarer Zerlegungs-Plan eines `Document collection`: welcher Seitenbereich welches Teildokument ist. Shape: `{collectionKind, segments: [{fromPage, toPage, label, kind}]}`, Seitennummern 1-basiert und inklusiv. `collectionKind` ∈ `credit_card_statement` | `expense_report` | `other` sagt, ob ein Deckteil vorliegt.
- Data type: jsonb (`client_source_docs.class_page_segments`), Python `PageSegments`
- Example: `{collectionKind: "credit_card_statement", segments: [{fromPage: 1, toPage: 4, label: "Amex-Abrechnung 03/2026", kind: "credit_card_statement"}, {fromPage: 5, toPage: 5, label: "Tankquittung Aral", kind: "fuel_receipt"}]}`
- Notes: Nur gesetzt, wenn der Plan die Validierung bestanden hat — lückenlos, überlappungsfrei, exakt `1..page_count`. NULL heißt „kein Auto-Split", nie „noch nicht geprüft". `kind` ist eine **Hypothese**: der herausgeschnittene Teilbeleg wird regulär neu klassifiziert, geerbt wird nichts. Ersetzt die Prosa-Seitenstruktur in `class_summary` (die bleibt für die Anzeige).

### Document kind

- English: `document kind`
- German: `Beleg-Charakter` (buchhalterische Natur des Belegs)
- Definition: One axis of `Document classification`. Beschreibt die **buchhalterische Natur** des Belegs — wie er gebucht werden muss. Orthogonal zu `doc_direction` (wer zahlt wen), `document_form` (Verarbeitungs-Pipeline) und `doc_category` (Folgeprozess). Werte: `original`, `credit_note`, `self_billing`, `refund`, `unknown`. Vorgängername: `delivery_lifecycle` (umbenannt 2026-05-14, siehe Decision Log).
- Data type: enum value (Python `DocumentKind`)
- Example: `self_billing` für eine JobRad-Provisionsabrechnung an einen Fahrradhändler.
- Notes: Unabhängig von `doc_direction`. Ein und derselbe `document_kind` kann mit `inbound` ODER `outbound` kombiniert werden — die Felder beantworten unterschiedliche Fragen. **Buchhalterische Tabelle** (Spalten: `document_kind` × `doc_direction`):

  | `document_kind` | bei `inbound` (Beleg eingehend) | bei `outbound` (Beleg ausgehend) | Vorzeichen-Flip? |
  | --- | --- | --- | --- |
  | `original` | Aufwandskonto gegen Kreditor; Standard-Eingangsrechnung | Erlöskonto gegen Debitor; Standard-Ausgangsrechnung | nein |
  | `credit_note` | dasselbe Aufwandskonto wie die Vor-Rechnung, **Vorzeichen gedreht** | dasselbe Erlöskonto wie die Vor-Rechnung, **Vorzeichen gedreht** | **ja** |
  | `self_billing` | Erlöskonto gegen Forderung (Mandant erbringt Leistung, Aussteller bezahlt) | ungewöhnlich; strukturell wie `original` outbound | nein |
  | `refund` | Aufwandsminderung auf Ursprungskonto (Aussteller erstattet Mandanten) | Erlösminderung auf Ursprungskonto (Mandant erstattet Kunden) | **ja** |

  Das deutsche Wort „Gutschrift" ist mehrdeutig: Storno-Gutschrift = `credit_note`, §14-UStG-Selbstabrechnung = `self_billing`, Rückzahlung ohne Storno-Bezug = `refund`. Der Classifier-Prompt entscheidet anhand Vorzeichen + Wortlaut + Aussteller-Rolle + periodisches Abrechnungs-Schema. `reimbursement` (Auslagenersatz / Reisekosten) wird hier NICHT modelliert — Signal lebt in `DocumentForm.expense_report`. Stand 2026-05-14 sind im Booking-Modul nur `original` und `self_billing` als Buchungs-Pfad implementiert; `credit_note` und `refund` parken auf Review, bis der Vorzeichen-Flip-Pfad steht.

### Company mention

- English: `company mention`
- German: `Firmenerwähnung`
- Definition: A company, association, or firm name found on a document, with a coarse role tag (`vendor`, `customer`, `payment_processor`, `other`, `unknown`) from the document's perspective.
- Data type: entity (Pydantic `CompanyMention`)
- Example: `{ name: "ALLGUTH GmbH", role: vendor }` on a Tankquittung.
- Notes: Used downstream for vendor matching and document retrieval. Roles are perspective-from-the-document, not perspective-from-the-Mandant. There is no central vendor master data during the prototype — duplicate or similar names are reconciled later by a vendor-resolution step.

### Classification override (historisch — entfernt 2026-05-18)

- Status: removed
- Definition (zur Referenz): War eine deterministische Post-LLM-Korrektur, die `accounting_role` an `document_form` koppelte (z.B. `fuel_receipt` → erzwang `receipt`). Mit dem kompletten Wegfall der `accounting_role`-Klassifikation im Klassifikator (decision-log 2026-05-18) entfällt der Override-Pfad — Direction wird stattdessen vom Workflow-Resolver aufgelöst, der den `document_form`-Hint als reguläre Heuristik-Stufe nutzt statt als nachgelagerten Override.
- Migrationshinweis: Bestehende `client_invoice_log_entries` mit `rule_code='classifier_override_accounting_role'` bleiben als historischer Audit-Trail erhalten; neue werden nicht mehr emittiert.

### Expected bookkeeping year

- English: `expected bookkeeping year`
- German: `erwartetes Buchungsjahr`
- Definition: Optional input to `document-simple-classifier`. The active fiscal year of the receiving `FiscalYear`, used as a cheap consistency check on the LLM-produced summary.
- Data type: int (request field `expectedYear`)
- Example: `2025` when classifying a document for the 2025 cycle.
- Notes: When set, the gateway runs ONE verification re-call if the summary mentions a year other than `expected_year` or `expected_year - 1` (covers late-arriving prior-year invoices). The re-call is preserved in the `llm_calls` audit trail. Caller-provided, not inferred from the document.

### Invoice extraction

- English: `invoice extraction`
- German: `Rechnungsextraktion`
- Definition: The structured extraction of invoice header fields, totals, and line items from a source invoice document.
- Notes: This is a processing-service output, not durable business truth. It should keep uncertainty and source evidence explicit.

### Business partner (Geschäftspartner)

- English: `business partner`
- German: `Geschäftspartner`
- Definition: Die ZEITLOSE Identität einer Firma/Person, mit der ein Mandant Geschäfte macht — Name, Adresse, USt-IDs, Bank, Verhalten (`vat_profile`, `typical_*`). Kept per-client. Ein Partner kann Lieferant UND Kunde zugleich sein: die Rolle steht nicht am Partner, sondern an seinen Personenkonten (`client_ledger_accounts.accounting_role`, FK-Richtung Konto → Partner via `business_partner_id`). Ein Partner ohne Personenkonto ist ein erlaubter Normalfall (F76 R3).
- Data type: entity (`ludwig.client_business_partners` row, uuid PK). Ersetzt seit F76 (2026-08-21) `client_creditors` + `client_debtors` (Big-Bang-Merge).
- Example: `{ legal_name: "Deutsche Telekom AG", vat_profile: "domestic_standard" }` mit Kreditorkonto 70032 (WJ 2025) und 70032 (WJ 2026) via `client_ledger_accounts.business_partner_id`.
- Notes: Keine Historisierung (R4, last-write-wins wie DATEV-Addressees; „wie hieß der 2024" beantworten die Snapshots an der Buchungszeile). Keine DATEV-GUID am Partner — `datev_addressee_id` ist Sync-Attribut am Personenkonto (R5); n GUIDs pro Partner sind der gewollte Normalfall. Auflösung beim Schreiben über die Resolver-Kaskade `resolveBusinessPartner` (`modules/business-partners/domain/`): addressee-GUID → DATEV-Kontonummer → USt-ID → IBAN → Name+PLZ (nur Vorschlag) → neuer Partner. Nachträgliches Zusammenführen über den Grabstein `merged_into_partner_id` (Leser folgen dem Zeiger; kein Merge-Journal). Zwei Partner mit Buchungen werden NIE automatisch zusammengeführt.

### Creditor

- English: `creditor`
- German: `Kreditor` *(DATEV term; `Lieferant` is the everyday synonym)*
- Definition: **Rolle eines Personenkontos** (F76): das Konto, über das ein Geschäftspartner als Lieferant bebucht wird (`accounting_role = 'creditor'`). Umgangssprachlich auch der Partner in dieser Rolle. Die frühere eigenständige Stammsatz-Tabelle `client_creditors` ist mit F76 im Geschäftspartner aufgegangen.
- Data type: enum value `ludwig.client_ledger_accounts.accounting_role = 'creditor'` (Personenkonto-Zeile mit `business_partner_id`).
- Example: Partner „Deutsche Telekom AG" mit Kreditorkonto `account_number='70032'` im WJ 2026.
- Notes: `Kreditor` (DATEV-aligned) is the preferred German term over `Lieferant`. *Previously:* `Supplier` / `ludwig.suppliers` → `ludwig.client_creditors` → Rolle am Konto (F76).
- **vendor vs. creditor convention (REQ-003 AP-4, 2026-05-22):** `vendor` is the **raw-OCR term** — what appears on the document before stammdaten-resolution (e.g. `client_invoices.vendor_name`, `InvoiceExtraction.vendor_ust_id`). `creditor` is the **master-data term** — the resolved business partner in creditor role. Booking-module operates on master data and therefore speaks `creditor` (`CreditorInput`, `creditor_account_number`); only raw extraction structures keep `vendor`. Same convention for `customer` (raw) vs. `debtor` (master) on the outgoing side.

### Creditor VAT profile

- English: `vat profile`
- German: `Umsatzsteuer-Profil`
- Definition: A per-creditor classification that summarises how this creditor's invoices are usually handled for VAT purposes.
- Data type: `ludwig.client_business_partners.vat_profile` — text enum (`'domestic_standard' | 'domestic_reverse_charge' | 'eu_acquisition_or_service' | 'non_eu_reverse_charge' | 'small_business_exemption' | 'tax_exempt' | 'margin_scheme' | 'mixed' | 'unknown'`)
- Example: `vat_profile = 'small_business_exemption'` for a §19 UStG Kleinunternehmer.
- Notes: A hint for proposals and verification, never a rule. Actual tax treatment of any specific invoice lives on `BookkeepingEntry.vat_key` + `vat_rate_percent`. The `vat_notes` freetext column is the escape hatch for anything the enum cannot capture (e.g. "§13b nur bei Montagerechnungen"). See `docs/topics/konten.md` for the mapping to DATEV BU-Schlüssel. *Renamed enum values (2026-04-22):* `kleinunternehmer` → `small_business_exemption`, `steuerfrei` → `tax_exempt`, `differenzbesteuerung` → `margin_scheme`.

### Diverse creditor strategy (Diverse-Strategie)

- English: `diverse creditor strategy`
- German: `Diverse-Strategie`
- Definition: Per-client rule for which collective creditor account (`Sammelpersonenkonto`) a document **without a resolved creditor** is booked against. `first_account` (default) always uses the configured `diverse_creditor_account_number` (e.g. 70000). `first_letter` ("Standard DATEV") routes to the `Diverse X` account whose letter bucket contains the first letter of the raw OCR `vendor_name` (e.g. `Müller` → `Diverse M`), falling back to the configured account when no bucket matches (Q/X/Y/Z, no `vendor_name`, or a client without letter accounts).
- Data type: `ludwig.platform_clients.diverse_strategy` — text enum (`'first_account' | 'first_letter'`, default `'first_account'`)
- Example: client with `diverse_strategy='first_letter'`; invoice `vendor_name='Saturn'` with `creditor_id IS NULL` → booked against `Diverse ST` (account 71700).
- Notes: The `Diverse X` accounts (`Diverse A`, `Diverse I/J`, `Diverse ST`, `Diverse UVW`, …) come from the DATEV onboarding import as collective-account partners (`client_business_partners.datev_is_various_account = true`; DATEV-API-Entsprechung: `accounting_information.is_various_account`). `is_collective_account` ist die **einzige** Wahrheit — die frühere Denormalisierung `client_ledger_accounts.account_role='collective_creditor'` ist mit Migration 20260729270000 entfernt (W1, Datenmodell-Review 2026-07-29). Resolution lives in `DiverseCreditorPoolResolver.resolve()` / `match_diverse_account()`. Uses the raw `vendor` term (not `creditor`) because it acts pre-resolution — see the vendor vs. creditor convention under **Creditor**. **Known limitation:** the downstream collective-pool services (`CreditorBulkProposalService`, `CreditorInvoiceRebookService`) still key off the single configured account and do not yet scan letter-bucketed bookings — see `docs/topics/konten.md` (Diverse-Strategie).

### Debtor

- English: `debtor`
- German: `Debitor`
- Definition: **Rolle eines Personenkontos** (F76): das Konto, über das ein Geschäftspartner als Kunde bebucht wird (`accounting_role = 'debtor'`). Umgangssprachlich auch der Partner in dieser Rolle. Die frühere eigenständige Stammsatz-Tabelle `client_debtors` ist mit F76 im Geschäftspartner aufgegangen.
- Data type: enum value `ludwig.client_ledger_accounts.accounting_role = 'debtor'` (Personenkonto-Zeile mit `business_partner_id`).
- Example: Partner „Sparkasse Berchtesgadener Land" mit Debitorkonto `account_number='500191'`.
- Notes: Counterpart to `Creditor`. DATEV convention: debtor account numbers are typically 10000–69999 in SKR04 (Kreditoren 70000–99999). Für Ausgangsrechnungen löst der Picker den Empfänger gegen die Geschäftspartner auf (Match-Schlüssel: `ust_ids`, `tax_ids`, `normalized_name + postal_code`). *Previously:* `ludwig.debitors` → `ludwig.client_debtors` → Rolle am Konto (F76).

### DATEV Addressee

- English: `DATEV addressee`
- German: `DATEV-Adressat`
- Definition: DATEVs zentraler Stammdaten-Datensatz einer (natürlichen oder juristischen) Person. Kreditoren/Debitoren-Personenkonten verweisen per `addressee_id` (GUID) darauf; die GUID ist — anders als die je Wirtschaftsjahr serialisierte Kontonummer — **jahresübergreifend stabil** und damit der Schlüssel fürs Mapping über Wirtschaftsjahre und Re-Imports.
- Data type: `ludwig.client_ledger_accounts.datev_addressee_id` (uuid, Index `(client_id, datev_addressee_id)`, KEIN Unique — dieselbe GUID erscheint legitim je WJ und je Rolle). F76: Sync-Attribut am PERSONENKONTO, nicht Identitätsschlüssel des Partners (R5).
- Example: `datev_addressee_id = '1a95b9fc-43d3-48bd-8a05-7958e46bce93'` (Strato AG bei Mandant 61015 — dieselbe GUID in jedem fiscal-year).
- Notes: Quelle: `creditors?expand=all` / `debitors?expand=all` Feld `addressee_id`; die master-data-API (`/master-data/v1/addressees/{id}`) liefert dazu die vollen Stammdaten inkl. Bankverbindungen (siehe `docs/reference/datev-api/api-verhalten.md` L8). Auch Karteileichen (Personenkonten ohne Namensfelder) tragen eine `addressee_id`. Persistiert seit 2026-08-14; F76-T76.7: Stufe 1 der Jahrgangs-Vererbung (`business_partner_id` erbt über die GUID, auch bei Nummernwechsel). NICHT der Merge-Schlüssel der Migration (unzuverlässig befüllt, Owner 2026-08-21).

### Outgoing invoice (Ausgangsrechnung)

- English: `outgoing invoice`
- German: `Ausgangsrechnung`
- Definition: Eine Rechnung, bei der der Mandant der Aussteller (Issuer) ist und ein Kunde der Empfänger. Bucht „Forderung an Erlös" — Soll = Debitor-Personenkonto des Geschäftspartners, Haben = vom Picker gewähltes Erlöskonto.
- Data type: `ludwig.client_source_docs_invoices` row mit `doc_direction = 'outbound'` und gesetztem `business_partner_id`.
- Notes: Pendant zu `Incoming invoice` (Eingangsrechnung). Klassifikation kommt deterministisch aus `InterpretationContextLoader.resolve_doc_direction` (Workflow): Kaskade Kategorie-Gate → UStID-Match → Name-Match gegen Legal-Name ∪ Trade-Names → Fremd-UStID → Default `inbound`. Alleinige Schreib-Stelle für `doc_direction`; der Interpreter führt keinen zweiten Direction-Check mehr durch (entfernt 2026-05-21). Booking-Modul dispatched über `BookingModuleRequest.customer` auf den Outgoing-Pfad (`_propose_outgoing`).

### Bookkeeping entry (Buchung)

- English: `bookkeeping entry`
- German: `Buchung`
- Definition: One double-entry posting — the durable output of every bookkeeping workflow, whether imported from a historical DATEV journal, AI-proposed, or entered manually. Belongs to exactly one `FiscalYear`.
- Data type: `ludwig.client_journal_entry` (Header) + `ludwig.client_journal_entry_line` (Side-Pattern). *(Vormals `client_bookkeeping_entries` — Refactor 2026-05-27.)*
- Notes: Carries an explicit `origin` (`ai_proposed` | `manual` | `system_reversal` | `recurring_rule` | `client_import`) that audits where the row came from — `recurring_rule` = vom Regelwerk wiederkehrender Buchungen erzeugt, `client_import` = aus dem **Buchungsstapel des Mandanten** importiert (F69, seit 2026-08-11: der Mandant hat in seiner eigenen Software gebucht, Ludwig ist der Weg nach DATEV — eigener Zweig in `client_effective_journal_lines`, kein Judge-Pass, Löschschutz gegen `submit_booking_proposal`, Herkunfts-Label „Mandantenstapel"). Der frühere Wert `datev_import` ist mit K11 (2026-08-05) **entfallen**: `client_journal_entry` ist per Definition „bei uns", DATEV-Fremdbuchungen leben im Spiegel (`client_datev_mirror_entries`). Eine manuelle Korrektur eines Agent-/Regel-Vorschlags flippt auf `manual` und schreibt `created_by_user_id` (Ersteller/Korrigierer; NULL bei Agent/Regelwerk/Import). Plus a separate `status` lifecycle (`proposed` | `accepted` | `posted` | `reversed`). `business_partner_id` am Header (F76: ein Feld statt `creditor_id`/`debtor_id`) ist bewusste Denormalisierung für OPOS-Queries (Wahrheit: die Lines). See `docs/topics/konten.md`.

### Bookkeeping invoice

- English: `bookkeeping invoice`
- German: `Buchungs-Rechnung`
- Definition: The durable record of an invoice as it relates to bookkeeping — vendor, customer, number, dates, totals, line items, and the `FiscalYear` it belongs to.
- Notes: Lives in `ludwig.client_source_docs_invoices` (+ `ludwig.client_source_docs_invoice_lines`) — 1:1-Subtyp zum Beleg-Supertyp `client_source_docs` über `source_doc_id` (*vormals `client_invoices` bzw. Spalte `document_inbox_entry_id`*). The preprocessing artefacts (raw payloads, logs) stay in the `ops_*` bucket (`ops_extraction_logs`, `ops_llm_call_logs`) because they are extraction-layer concerns with short retention, not bookkeeping truth.

### Ledger account (Konto)

- English: `ledger account`
- German: `Konto`
- Definition: One entry in a client's chart of accounts (DATEV-flavored), with a number, name, and account type.
- Data type: entity (`ludwig.client_ledger_accounts` row, uuid PK). `accounting_role` is a text enum.
- Example: `{ account_number: "70032", account_name: "Deutsche Telekom AG", accounting_role: "creditor", status: "active" }`
- Notes: Use `ledger account` in code and docs to avoid collision with user-identity "account". A ledger account of `accounting_role='creditor'` is the creditor account for a `Creditor` row. The chart-of-accounts container itself is `Kontenrahmen`.
- **Ein Kontenplan existiert nicht ohne Wirtschaftsjahr (F64, 2026-08-07).** Jede
  Zeile trägt `fiscal_year_id`; der Unique-Key ist
  `(client_id, fiscal_year_id, account_number)`. Das ist DATEVs eigenes
  Modell — die API kennt keinen jahresfreien `general-ledger-accounts`-Endpunkt,
  der Plan liegt dort als Vollkopie je fiscal-year. **Quelle ist DATEV**, der
  Referenzkatalog nur Ergänzung; Ludwig legt keine Sachkonten an, die DATEV nicht
  kennt (Ausnahme: der 89xxxx-Platzhalter-Range, F57). Wer ein Konto schreibt oder
  fachlich jahresabhängig liest (Picker, Kontovalidierung, Export, Jahresansicht),
  löst das WJ über `core/datev/fiscal-year.ts` auf. Leser **ohne**
  WJ-Kontext (Namensauflösung, Typeahead, Kreditor-Sichten) lesen die View
  `ludwig.client_ledger_accounts_current` — genau eine Zeile je
  `(client_id, account_number)`, die des jüngsten offenen WJ.

### Account enrichment (Konten-Anreicherung)

- English: `account enrichment`
- German: `Konten-Anreicherung`
- Definition: Die mandantenspezifische, **wirtschaftsjahrfreie** Semantik einer
  Kontonummer — Buchungsbeschreibung („was wird auf diesem Konto gebucht") und
  das pgvector-Embedding, Input fürs Vorschlagssystem.
- Data type: entity (`ludwig.client_account_enrichment`, unique
  `(client_id, account_number)`).
- Example: `{ account_number: "4400", description: "Erlöse aus Reparaturaufträgen …", embedding: <1536-dim> }`
- Notes: F64-T64.2. Bewusst **nicht** an `client_ledger_accounts` gehängt: der
  Kontenplan liegt je WJ als Vollkopie vor, die Semantik gilt jahresübergreifend
  und würde sonst beim Jahreswechsel kopiert und driftet. Sie wandert dadurch
  automatisch ins neue Jahr mit; verschwindet ein Konto im neuen WJ, bleibt sein
  Enrichment als harmlose Waise stehen. Ein Description-Edit entwertet das
  Embedding (Trigger), der nächste `embedClientAccounts`-Lauf erzeugt es neu.

### Ledger account types

- English: `general_ledger`, `creditor`, `debtor`, `revenue`, `other`
- German: `Sachkonto`, `Kreditor`, `Debitor`, `Erlöskonto`, `sonstige`
- Definition: Enum values stored in `ludwig.client_ledger_accounts.accounting_role`. Distinguishes a generic balance-sheet/P&L account (`general_ledger` / Sachkonto) from personal accounts (`creditor`, `debtor`) and revenue accounts (`revenue` / Erlöskonto).
- Data type: `ludwig.client_ledger_accounts.accounting_role` — text enum (`'general_ledger' | 'creditor' | 'debtor' | 'revenue' | 'other'`)
- Example: Konto `4400` in SKR04 is `accounting_role = 'revenue'` (Erlöse 19% USt).
- Notes: *Renamed (2026-04-22):* `sachkonto` → `general_ledger`, `kreditor` → `creditor`, `debitor` → `debtor`, `erloes` → `revenue`.

### Kontenfunktion (DATEV account function)

- English: `DATEV account function`
- German: `Kontenfunktion`
- Definition: DATEVs eigene Aussage darüber, was ein Sachkonto ist und wie DATEV
  Buchungen darauf verarbeitet — Geldkonto, Buchungssperre, Steuerautomatik,
  Sammelkonto, Skontokonto. Kommt am Sachkonto aus der API und ist damit
  **Fremdsystem-Wahrheit**: Ludwig übernimmt die Kennziffer roh und deutet sie
  an genau einer Stelle.
- Data type: zwei Spalten an `ludwig.client_ledger_accounts`, beide integer und
  nullable: `datev_main_function_number` (die Funktionsnummer, aus
  `general-ledger-accounts.main_function_number`) und `datev_main_function` (die
  Verarbeitungsgruppe, aus `main_function`). Deutung:
  `apps/web/src/core/datev/main-function.ts` (`DATEV_MAIN_FUNCTION_NUMBER`).
- Example: `10` = Geldkonto (Kasse *und* Bank — DATEV trennt das nicht),
  `12` = Buchungssperre, `30` = Vorsteuer, `90/91` = Sammelkonto Debitor/Kreditor.
- Notes:
  - **Begriffe sind DATEVs, nicht unsere** — sie stehen so in DATEVs OpenAPI-Spec
    (`Accounting-1.7.4.1.json`, `schema_general-ledger-account`):
    *Hauptfunktionsnummer* (`main_function_number`), *Hauptfunktionstyp*
    (`main_function`), *Funktionsergänzung* (`function_extension`),
    *Funktionsbezeichnung* (`function_description`), *Kontobeschriftung*
    (`caption`), *Steuerrechnungstyp/Zusatzfunktion* (`additional_function`).
    „Kontenart" ist ein Ludwig-Eigengewächs und wird nicht weiterverwendet.
  - **Zwei Achsen, nicht eine.** Der Hauptfunktionstyp sagt, *welche
    Steuerrechnung* das Konto trägt (1 automatische Vorsteuer, 2 automatische
    USt, 3 allgemeine Funktion, 4 Sammelfunktion, 6/7 Sammelfunktion mit
    automatischer Vorsteuer/USt), die Hauptfunktionsnummer, *was für ein Konto*
    es ist. Beide
    werden seit 2026-08-25 persistiert. Die Gruppe hat bewusst **keinen
    Consumer** — als Automatik-Heuristik erzeugte `main_function != 0` 454
    Fehlalarme (F60); die Automatik-Frage beantwortet `datev_tax_rate`. Sie wird
    mitgeführt, damit die Achse überhaupt auswertbar ist. NULL heißt „Kontenplan
    seit der Einführung nicht neu importiert", 0 heißt „DATEV sagt: keine Funktion".
  - **20/21/25 sind keine Personenkonten** — auch wenn die englische Spec dort
    „supplier account / customer account" schreibt. Der deutsche Klartext
    derselben API sagt *Lieferantenskonto* / *Kundenskonto*: Lieferanten-**Skonto**
    (`3730 Erhaltene Skonti`, `8730 Gewährte Skonti`), Hauptfunktionstyp 6/7 =
    Steuerautomatik. Die
    Rollen-Ableitung daraus ist am 2026-08-25 entfallen (sie hatte auf Staging 76
    Sachkonten falsch klassifiziert); Personenkonten kommen aus
    `accounts-receivable`/`accounts-payable`.
  - Vollständige Nummern-Referenz mit dem DATEV-Klartext je Funktion:
    `docs/reference/datev-api/kontenfunktionen.md`. Regeln dazu:
    `docs/topics/konten.md` R10 (roh übernehmen) und R18 (Buchungssperre blockt).
  - Nicht zu verwechseln mit `accounting_role` (siehe *Ledger account types*) —
    das ist Ludwigs fachliche Rolle des Kontos, keine DATEV-Kennziffer.

### Creditor account

- English: `creditor account`
- German: `Kreditorkonto`
- Definition: The personal ledger account a business partner is booked against in supplier role. F76: FK-Richtung Konto → Partner — je Wirtschaftsjahr und Rolle höchstens ein Konto pro Partner (Unique `(business_partner_id, fiscal_year_id, accounting_role)`).
- Data type: `ludwig.client_ledger_accounts` row mit `accounting_role='creditor'`, `account_kind='personal'`, FK `business_partner_id` → `ludwig.client_business_partners.id`.
- Example: `ledger_accounts(account_number='70032', accounting_role='creditor', business_partner_id → Telekom-Partner)`.
- Notes: Imported/manual numbers follow DATEV convention (typically 5-digit, 70000–99999 in SKR03). System-allocated numbers live in a reserved 6-digit prefix block (default 890000–899999) so the source is visible at a glance. Sync-Attribute (`datev_addressee_id`, `datev_account_id`, `datev_synced_at`, `datev_sync_state`) leben an dieser Zeile. *Previously:* `kreditorkonto_id` on `ludwig.suppliers`, dann `client_creditors.creditor_account_id` (FK-Richtung bis F76 umgekehrt).

### Debtor account

- English: `debtor account`
- German: `Debitorenkonto`
- Definition: The personal ledger account a business partner is booked against in customer role (F76: FK-Richtung Konto → Partner, analog Creditor account).
- Data type: `ludwig.client_ledger_accounts` row mit `accounting_role='debtor'`, `account_kind='personal'`, FK `business_partner_id` → `ludwig.client_business_partners.id`.
- Example: `ledger_accounts(account_number='10042', accounting_role='debtor', business_partner_id → Partner)`.
- Notes: DATEV convention: 5-digit debtor numbers typically 10000–69999 in SKR03. *Previously:* `client_debtors.debtor_account_id`.

### DATEV sync state (`datev_sync_state`)

- English: `DATEV sync state`
- German: `DATEV-Sync-Zustand`
- Definition: Zustandsmaschine eines Kontos gegenüber DATEV (F76; ersetzt `needs_datev_creation` + den impliziten 89xxxx-Platzhalter-Test): `local_only` (Ludwig kennt es, DATEV nicht — ggf. 89xxxx-Platzhalter) → `creation_pending` (Anlage an die Bridge übergeben) → `synced` (Nummer + ggf. `datev_account_id` stehen, Writeback erledigt); `disappeared` = ein Re-Import kennt das Konto nicht mehr.
- Data type: `ludwig.client_ledger_accounts.datev_sync_state` — text enum, NOT NULL, default `'synced'`.
- Example: `create_creditor` legt das 89xxxx-Konto mit `datev_sync_state='local_only'` an; der Bridge-Writeback (`setPersonalAccountDatev`) stellt auf `'synced'`.
- Notes: Orthogonal zu `status` (aktiv/inaktiv — fachliche Aussage, keine Sync-Aussage). Die Zustandsmaschine gehört ans KONTO, nicht an den Partner: Neuanlage ist ein Konto-Vorgang; der Partner behält nur `onboarding_state`. Status-Registry-Achse `konto_datev_sync`.

### Mandanten-Profil

- English: `client profile`
- German: `Mandanten-Profil`
- Definition: Strukturierte Profil-Felder auf `ludwig.platform_clients`, die als System-Prompt-Block in jeden LLM-Buchungsvorschlag (Picker + Judge) und in den Invoice-Interpreter eingespeist werden. Verzerrt Vorschläge auf den konkreten Mandanten.
- Data type: Spalten auf `ludwig.platform_clients`: `business_model` (services/trade/production/mixed/other), `industry`, `vat_specialties`, `expense_profile`, `business_description`.
- Example: `business_model='trade', industry='Fahrradhandel', expense_profile=['Eigenes Lager']`.
- Notes: Zusammen mit `bookkeeping_guidelines` (Freitext) der einzige Hebel, um Standard-Vorschläge mandantenspezifisch zu verzerren. *Vormals* abgelöste Mechanik: Service Categories (siehe decision-log 2026-05-08).

### Buchungsleitlinien

- English: `bookkeeping guidelines`
- German: `Buchungsleitlinien`
- Definition: Freitext-Heuristiken des Steuerberaters für einen konkreten Mandanten (z.B. „Bewirtungen immer auf 4650"), die wörtlich an Picker + Judge übergeben werden.
- Data type: Spalte `ludwig.platform_clients.bookkeeping_guidelines` (text, mehrzeilig).
- Example: `"- Bewirtungen immer auf 4650 nicht 4655\n- Software-Abos < 800 € sofort als Aufwand"`.
- Notes: Phase 1 wird via `mandant.yaml` gepflegt; Phase 2 über die Web-Konfigurations-Subpage editierbar.

### Payment account

- English: `payment account`
- German: `Zahlungs-/Bankkonto des Mandanten`
- Definition: Eigenes Bank-, Kassen-, Kreditkarten- oder PayPal-Konto des Mandanten mit IBAN/BIC. Über `auto_assign_payment_method` kann das Konto als Auto-Routing-Ziel für genau eine Zahlungsart markiert werden — dann bucht der Picker bezahlte Belege dieser Zahlungsart direkt gegen dieses Konto (`via_payment_account`). Ohne Markierung läuft die Buchung über das Kreditor-Personenkonto (`via_creditor`).
- Data type: entity (`ludwig.client_payment_accounts` row, uuid PK). Optional FK auf `client_ledger_accounts`. Spalte `auto_assign_payment_method` (TEXT NULL) ist UNIQUE pro `(client_id, auto_assign_payment_method) WHERE auto_assign_payment_method IS NOT NULL`.
- Example: `{ kind: 'bank', display_name: 'Sparkasse München Hauptkonto', iban: 'DE...', ledger_account_number: '1800', auto_assign_payment_method: null }` (klassische Hauptbank, kein Auto-Routing — Überweisungen laufen über Kreditor). `{ kind: 'paypal', display_name: 'PayPal', ledger_account_number: '1820', auto_assign_payment_method: 'paypal' }` (Direktbuchung für PayPal-Belege).
- Notes: `kind` ist nur UI-Kategorisierung (IBAN-Feld, Icon), nicht Routing-Trigger. Pflege via `mandant.yaml` Block `payment_accounts` oder Web-UI. Frühere Kombi `kind + is_default` ist seit 2026-05-22 obsolet, ersetzt durch die explizite `auto_assign_payment_method`-Markierung.

### Mirror classification (Spiegel-Klassifikation)

- English: `mirror classification`
- German: `Spiegel-Klassifikation`
- Definition: Was ein Eintrag der DATEV-Buchungshistorie für Ludwig **bedeutet** — abgeleitet aus dem Bestand, nie gespeichert. Sechs Werte in dieser Vorrang-Reihenfolge: `ludwig` (Ludwig hat den Vorgang gebucht) · `technisch` (ein Leg auf einem Vortrags-/Statistikkonto 9xxx — Saldenvortrag, EB-Wert, Umbuchung) · `opos_vortrag` (trifft einen offenen Posten auf demselben Personenkonto, hat seinen Weg über `foundOposCases`) · `zugeordnet` (in DATEV mit einem Beleg verknüpft, `document_link_guid`) · `historisch` (vor dem ersten von Ludwig bearbeiteten Zeitraum) · `fremd_offen` (der Rest: eine Buchung der Kanzlei im Arbeitszeitraum, die niemand gesichtet hat).
- Data type: abgeleitet in `datev-mirror/infrastructure/reporting-queries.ts` (`MIRROR_CLASSIFICATIONS`, `getMirrorClassificationCounts`, `listMirrorEntriesByClassification`); keine Spalte, kein Backfill.
- Example: Staging 2026 über beide Mandanten — 16.085 `opos_vortrag`, 3.977 `zugeordnet`, 3.586 `historisch`, 1.838 `technisch`, 214 `ludwig` und **638 `fremd_offen`**; letztere sind der eigentliche Sichtungs-Vorrat, den die rohe Zahl 25.806 verdeckte.
- Notes: Abgrenzung zum `match_state` (`matched_ludwig`, `new_unprocessed`, `unclear`, `disappeared*`): der ist die **Achse des Abgleichs** und wird persistiert; die Klassifikation ist die **Lesart** darüber und wird jedes Mal neu gerechnet. Der Agent sichtet mit `list_datev_foreign_bookings`; nachgebucht wird nichts — was in DATEV steht, ist gebucht (`datev.md` R6a/R7). Introduced 2026-08-29 (W8/P4).

### Statement expectation (Auszugserwartung)

- English: `statement expectation`
- German: `Auszugserwartung`
- Definition: Die Antwort auf „welches Konto muss Kontoauszüge liefern?" — abgeleitet, aber vom Menschen überschreibbar. Abgeleitet wahr genau dann, wenn eine **Bankverbindung des Mandanten aus den DATEV-Stammdaten** (`addressees` → `platform_clients.datev_bank_accounts`) über die IBAN ein Zahlungskonto trifft, **dessen Sachkonto in der Buchungshistorie bebucht ist**. Beides ist nötig: `kind='bank'` allein sagt nichts, weil die DATEV-Kontenfunktion 10 Kasse, PSP und Verrechnungskonten mitzählt und `tagPaymentAccounts` deshalb den ganzen SKR-Bankblock promotet (Staging: 80 Konten `kind='bank'`, davon 5 mit IBAN; 61015 hat 61 promotete und faktisch eine Bank).
- Data type: `client_payment_accounts.expects_statements` (boolean) + `statement_activity_from` / `statement_activity_to` (date), geschrieben von `syncStatementExpectations` (`clients/application/payment-account-activity-core.ts`) nach jedem DATEV-Abgleich **und nach jeder Änderung am Zahlungskonto**, idempotent und non-fatal. Daneben `expects_statements_manual` (boolean, nullable): NULL = Ableitung gilt, true/false = ein Mensch hat im Stammdaten-Form entschieden und die Ableitung fasst das Konto nicht mehr an.
- Example: 61015 — `1211 Commerzbank` (IBAN in den Stammdaten, 3757 Spiegel-Legs) erwartet Auszüge; die 60 weiteren promoteten Bankkonten (Kasse, Paypal, Ebay, Geldtransit) nicht.
- Notes: Die Zuordnung Bankverbindung ↔ Fibu-Konto liefert DATEVconnect **nicht** (geprüft 2026-08-25 gegen die Kanzlei-Installation und beide OpenAPI-Specs — sie lebt im Zahlungsverkehr-Teil, den das Desktop-PlugIn nicht exponiert); die IBAN ist deshalb die einzige Kante. Das Aktivitätsfenster ist der Rahmen jeder Lückenprüfung — außerhalb ist ein fehlender Auszug keine Lücke. Abgrenzung zur [[Payment account retirement]]: die Abschaltung ist eine Entscheidung über die **Zukunft** eines Kontos, die Auszugserwartung eine Aussage über den **Nachweis**, den es im Zeitraum schuldet. Das Feld bindet Gate 1a des Buchungslaufs: mit Erwartung ist ein fehlender Auszug ein Blocker, ohne nur eine Warnung. Introduced 2026-08-29 (W8/P10, `bank.md` R15a); Hand-Override, Sichtbarkeit und Gate-Bindung 2026-08-30 (`bank.md` R15b) — die reine Ableitung hatte CLIENT-61015 auf 24 von 24 Konten „keine Erwartung" gestellt, weil die IBAN erst nach dem Onboarding von Hand nachgetragen wird.

### Payment account retirement

- English: `payment account retirement`
- German: `Zahlungsweg-Abschaltung`
- Definition: Ein Zahlungskonto per `client_payment_accounts.valid_until` befristen, damit der Buchungslauf dafür keine Kontoauszugs-Deckung mehr anfordert (typisch: Alt-Kassen/Nebenkassen ohne jede Bewegung und ohne IBAN). Der Server leitet deterministisch die **letzte Bewegung** je Konto ab (max aus letztem Buchungsdatum des verknüpften Sachkontos in `client_effective_journal_lines` — Chokepoint-View, respektiert den Replay-Cutoff — und letztem `posting_date` in `client_bank_transactions`) und schlägt Abschaltung vor, wenn das Konto nie bebucht ist oder die letzte Bewegung länger als 12 Monate (`RETIREMENT_INACTIVITY_MONTHS`) vor dem Beginn des offenen Buchungszyklus liegt. Abgeschaltet wird ausschließlich nach menschlicher Bestätigung (Checkbox im Review-Block „Zahlungswege" auf der Bankkonten-Konfigurationsseite bzw. im Onboarding-Review) — nie automatisch.
- Data type: Spalte `ludwig.client_payment_accounts.valid_until` (date, inklusiv); Ableitung + Schreibpfad in `apps/web/src/modules/clients/application/payment-account-activity-core.ts`.
- Example: Nebenkasse 1601, letzte Buchung 10.05.2023, offener Zyklus ab 01.01.2026 → Vorschlag `valid_until = 2023-05-10` mit Begründung „letzte Buchung 10.05.2023 auf Konto 1601"; nie bebuchte Kasse → `valid_until = Zyklusbeginn − 1 Tag`, „keine einzige Buchung in der Historie".
- Notes: Abgelehnter Vorschlag (Haken raus) = Konto bleibt unbefristet aktiv, es wird nichts geschrieben. Audit-Action `payment_account.retirements_confirmed`.

### Payment channel resolution

- English: `via_creditor` / `via_payment_account`
- German: `Buchung über Kreditor-Personenkonto` / `Direktbuchung gegen Mandanten-Zahlungskonto`
- Definition: Zwei mögliche Pfade, gegen welches Haben-Konto ein Aufwandsbeleg gebucht wird. `via_creditor` = klassisches Offene-Posten-Verfahren (Aufwand an 70000-Lieferant, Zahlungsausgleich erst beim Bank-/Zahlungs-Auszug-Import). `via_payment_account` = einzeilige Direktbuchung (Aufwand an 1820 PayPal / 1600 Kasse / 1361 EC-Karte), kein offener Posten.
- Data type: Status-String im Booking-Picker-Trace (`payment_channel_resolution.status`).
- Example: Adobe-Rechnung 119 € PayPal: wenn ein PayPal-Konto mit `auto_assign_payment_method='paypal'` existiert → `via_payment_account` (6837 an 1820). Sonst → `via_creditor` (6837 an 70000-Adobe, Ausgleich später).
- Notes: Hieß früher Weg A / Weg B; siehe Decision-Log 2026-05-22. Tank-/Bewirtungs-Quittungen ohne erkannte `payment_method` blocken auf Klärungsfrage (`via_payment_account_form_without_method`) — eine Quittung hat keinen Kreditor-Pfad.

### Bank transaction

- English: `bank transaction`
- German: `Banktransaktion`
- Definition: Eine einzelne Zahlungsbewegung (Eingang oder Ausgang) auf einem `payment_account`. Wird per CSV-Import (DATEV-Buchungsstapel) oder Qonto-API-Sync gespeichert. Phase 1: Speicherung + Zeitraumserkennung; Booking-Vorschläge sind Phase 2.
- Data type: entity (`ludwig.client_bank_transactions` row, uuid PK; FK `payment_account_id` → `client_payment_accounts`).
- Example: `{ posting_date: '2026-04-15', amount: '-89.90', currency: 'EUR', purpose: 'Telekom Festnetz', source: 'qonto', external_transaction_id: 'tx_abc123' }`.
- Notes: Originalwährung wird gespeichert, EUR-Wert in `amount_eur` (Phase 1: nur EUR). Sichere Duplikate via partial unique index `(payment_account_id, external_transaction_id)`. Vergangene Zeiträume sind immutable — Re-Imports werden auf max(`posting_date`) cutoff-gefiltert.

### Import run

- English: `import run`
- German: `Import-Lauf`
- Definition: Ein logischer Bank-Transaktions-Import-Vorgang (CSV-Upload oder Qonto-Sync). Wird nicht als eigene Tabelle modelliert, sondern repräsentiert durch eine Audit-Event-Zeile mit `action='bank_import.csv'` oder `'bank_import.qonto'` und einem Payload, der Counts, Zeitraum, Cutoff und Fehler dokumentiert.
- Data type: konzept (manifestiert sich als `ludwig.platform_audit_events`-Zeile; FK `import_audit_event_id` auf `client_bank_transactions` verweist auf den Lauf, der eine Zeile importiert hat).
- Example: `audit_events.payload = { source: 'csv', imported_count: 47, ignored_count: 2, previous_max_date: '2026-03-31', period_from: '2026-04-01', period_to: '2026-04-30' }`.
- Notes: Phase 1 hat keine eigene Run-Tabelle (Spec: „bereits importiert" reicht der DB-Aggregate `max(posting_date)`). Wenn Phase 2 eine Run-Übersicht-UI braucht, kann das aus `platform_audit_events` abgeleitet werden.

### Audit event

- English: `audit event`
- German: `Audit-Ereignis`
- Definition: Generischer Eintrag für eine nachvollziehbare Aktion im System: wer (Actor) hat wann was (Action) mit welchem Ergebnis (Outcome) auf welcher Ressource (optional) ausgeführt. Phase-1-Konsument ist der Bank-Transaktions-Import; künftige Konsumenten (Nutzer-Korrekturen, automatisierte Prozesse) nutzen denselben Mechanismus.
- Data type: entity (`ludwig.platform_audit_events` row, uuid PK). Immutable (kein `updated_at`).
- Example: `{ actor_kind: 'user', actor_label: 'simon@fakir-it.de', action: 'bank_import.csv', outcome: 'success', resource_kind: 'payment_account', resource_id: '…', payload: { imported_count: 47, … } }`.
- Notes: Bewusst NICHT identisch zu den vorhandenen Pipeline-Telemetrie-Tabellen (`ops_extraction_logs` ist retention-bounded; `client_invoice_traces` ist invoice-spezifisch). `platform_*`-Bucket weil cross-tenant und durable.

### Creditor match

- English: `creditor match`
- German: `Kreditorzuordnung`, `Lieferantenzuordnung`
- Definition: The step of the invoice-ingest workflow that links an extracted invoice to a known creditor using (in order) UstID, Steuernummer, then normalized-name + postal-code similarity.
- Data type: workflow step (no DB table). Produces one of three outcomes: `confirmed` (single `creditor_id`), `candidates` (ranked candidate list for disambiguation), or `creditor_profiling` (no match → auto-profile step runs; see below).
- Example: Invoice with `vendor_ust_id='DE123456789'` matches `creditors.ust_ids @> ARRAY['DE123456789']` → confirmed match.
- Notes: *Previously:* `Supplier match`. The `creditor_profiling` outcome replaced the older `onboarding_required` label (2026-04-24) — "onboarding" was reserved for client onboarding.

### Creditor profiling

- English: `creditor profiling`
- German: `Kreditor-Profilierung`
- Definition: The step the interpreter runs when `creditor match` finds no existing creditor. It infers a profile for the unknown vendor from the invoice content alone (and, later, from an optional web enrichment) — `typical_nature`, `business_description`, `vat_profile`, `typical_payment_term_days`, ust_ids — and produces a `CreditorProfileSuggestion`.
- Data type: workflow step (no DB table). Output is a `CreditorProfileSuggestion` carried on the `InterpretedInvoice`. The workflow layer then persists a shadow `client_business_partners` row with `onboarding_state='proposed'` and `source='auto_profiled'`.
- Example: Invoice from a never-seen-before "linexo by WERTGARANTIE" → the interpreter guesses `typical_nature=expense`, `business_description="Online-Versicherungsvermittler für Elektronik"`, `vat_profile=domestic_standard`; the workflow persists a shadow creditor for human review.
- Notes: Introduced 2026-04-24, replacing the older `onboarding_required` outcome. Human confirmation via the UI flips `onboarding_state` from `proposed` to `confirmed`.

### Creditor onboarding

- English: `creditor onboarding`
- German: `Kreditoranlage`, `Lieferantenanlage`
- Definition: The human-review step that promotes a profiled shadow creditor (`onboarding_state='proposed'`) to a confirmed, bookable creditor (`onboarding_state='confirmed'`) — typically by reviewing the auto-inferred `business_description`, `vat_profile`, and assigning a `creditor_account_id`.
- Data type: workflow (no single table). Transitions `ludwig.client_business_partners.onboarding_state` from `draft` or `proposed` to `confirmed`.
- Example: After reviewing a shadow creditor surfaced by `creditor profiling`, operator confirms — row's `onboarding_state` flips to `confirmed`, a `creditor_account_id` is allocated from the system prefix range.
- Notes: Triggered by invoice ingest (via `creditor profiling`), operator action, or client-onboarding import. *Previously:* `Supplier onboarding`. Distinct from **client onboarding** (Mandanten-Onboarding), which sets up a whole tax-advisory client.

### Client onboarding

- English: `client onboarding`
- German: `Mandantenanlage`, `Mandanten-Onboarding`
- Definition: The one-time bulk setup of a new Mandant: import chart of accounts, derive creditor directory from historical DATEV bookings, extract typical service categories from past line-item/account pairs.
- Data type: workflow (no single table). Writes to `ludwig.platform_clients`, `ludwig.client_ledger_accounts`, `ludwig.client_business_partners`, `ludwig.client_fiscal_years` (Buchungshistorie kommt seit F47 als DATEV-Spiegel, nicht mehr als `client_journal_entry`-Import).
- Example: `make db-reset` (TS-Seeder `apps/web/scripts/seed-onboarding.ts`) bzw. ein agent-getriggerter `onboarding_run` befüllt all das.
- Notes: Voller Ablauf + Regeln: `docs/topics/onboarding.md`.

### Onboarding review

- English: `onboarding review`
- German: `Onboarding-Review`, `Onboarding-Freigabe`
- Definition: Manual confirmation step after the automated onboarding pipeline. `platform_clients.onboarding_state='review'` (between `processing` and `ready`): the pipeline finished with green readiness, but the Mandant stays non-bookable until a human confirms in the admin wizard (Mandanten-Technikansicht, tab "Onboarding"). v1 scope: assign DATEV bank connections (`platform_clients.datev_bank_accounts`, from the DATEVconnect master-data API — no `fibu_account` there, learnings.md L8) to the ledger-derived bank payment accounts; confirming writes `client_payment_accounts.iban` and opens the gate (`ready` + `onboarding_completed_at`).
- Data type: state (`platform_clients.onboarding_state`) + workflow (`completeOnboardingReview`).
- Example: After the bridge onboards DATEV client 10160, the admin confirms `DE30…5539 → Konto 1200` and releases the Mandant.
- Notes: The dev seeder (`apps/web/scripts/seed-onboarding.ts`) skips the review (self-confirms). Proposal logic is deterministic and refuses to guess (`proposeBankAccountLinks`); history-based calibration is F63.

### Onboarding backfill (Stammdaten-Lerning aus Belegen)

- English: `onboarding backfill`
- German: `Onboarding-Backfill`, `Stammdaten-Lerning`
- Definition: One-time learning pass during onboarding. Picks a small BEDI-sample of historical PDFs (`testdata/clients/<datev>/belege/*.pdf`), runs them through OCR + structuring (no booking proposal), then merges the extracted `vendor_ust_id` / `vendor_tax_id` into `client_business_partners.ust_ids` / `tax_ids`. Goal: close the gap that DATEV master-data exports usually leave the EU-UStID column empty for most creditors, which would otherwise break every UStID-based creditor match on real production belege.
- Data type: workflow phase. The OCR step is the onboarding `--phase extract`; the merge step is `--phase backfill` (`creditor_backfill_service.run`).
- Example: der Onboarding-Lauf in TS (`apps/web/scripts/seed-onboarding.ts` bzw. der `onboarding_run`-Job); das Python-Onboarding-CLI existiert nicht mehr.
- Notes: **Not an Ingest** — does not produce booking proposals, does not write to `client_journal_entry`. The result is enriched `client_business_partners` rows only. Filters out the Mandant's own UStID (Empfänger-Verwechslung in OCR). When changing phase order: backfill must run AFTER extract, otherwise the merge has nothing to read.

### Ingest (produktive Beleg-Verarbeitung)

- English: `ingest`
- German: `Ingest`, `Beleg-Verarbeitung`
- Definition: The end-to-end production pipeline for a single Beleg: OCR → structuring → interpretation → creditor/debtor match → booking proposal. Triggered per Beleg via CLI (`ingest-invoice`) or HTTP, not as part of onboarding.
- Data type: workflow (`InvoiceIngestWorkflow.ingest`). Writes to `ops_stored_files`, `client_invoices`, `client_invoice_line_items`, `client_invoice_traces`, and ultimately a `booking_proposal_payload_json` on the invoice row.
- Example: `python3 -m buchassi_workflows.cli ingest-invoice <pdf> --client-id <uuid> --cycle-id <uuid> --year 2025`.
- Notes: **Distinct from onboarding backfill** — Ingest produces booking proposals; backfill only enriches stem data. Both touch OCR but for very different purposes. Naming aligned 2026-05-14.

### Creditor number prefix range

- English: `creditor number prefix range`
- German: `Kreditorennummern-Präfixbereich`
- Definition: The numeric block reserved for creditor accounts that Ludwig allocates automatically, distinct from DATEV-standard imported / manually-entered accounts.
- Data type: `ludwig.platform_clients.creditor_number_system_prefix_start` — integer (default `890000`).
- Example: `creditor_number_system_prefix_start = 890000` reserves the block `890000–899999` for system-allocated creditor accounts.
- Notes: Configurable per client. Makes it trivial to tell at a glance whether a creditor account was assigned by Ludwig or came from the client's historical Kontenrahmen. *Previously:* `supplier_number_system_prefix_start`.

### Journal entry

- English: `journal entry`
- German: `Buchung`
- Definition: A single bookkeeping posting or accounting entry in structured bookkeeping data.
- Notes: Use `journal entry` or `journal entries` in code and data file naming. Avoid raw German naming in code-facing structures.

### Imported dataset

- English: `imported dataset`
- German: `importierter Datensatz`
- Definition: Imported structured bookkeeping data such as journal CSVs or chart-of-accounts files.
- Notes: Distinct from raw documents. Keep file metadata separate from interpretation results.

### Bookkeeping context

- English: `bookkeeping context`
- German: `Buchhaltungskontext`
- Definition: Additional contextual information that influences accounting interpretation.
- Notes: The structure is intentionally flexible for now. Do not split into narrower concepts unless the distinction is stable.

## Technical concepts

### Contract

- English: `contract`
- German: `Vertrag der Systemschnittstelle` or `Schnittstellenvertrag`
- Definition: The explicit request/response boundary for the `workflows` HTTP API.
- Notes: During the prototype, the Pydantic models in `apps/workflows/src/buchassi_workflows/api/` are the single source of truth. A TypeScript contract package existed earlier and was removed to avoid dual-maintenance drift. **Disambiguation:** the *legal* contract document is a separate concept — see „Contract document" below.

### Contract document

- English: `contract document`, `contract`
- German: `Vertrag`
- Definition: A source-document specialization (`source_doc_type = 'contract'`) for legal agreements — Miet-, Leasing-, Darlehens-, Dienstleistungsverträge etc. Subtype table `client_source_docs_contracts` holds the LLM-extracted, canonically normalised fields (start date + duration), a summary, booking-relevant key/value facts, and per-field provenance.
- Notes: Distinct from „Contract" (the API boundary above). Classified by the document-simple-classifier (`DocumentForm.contract`), extracted by the contract-extractor, anchored by a Sachverhalt (`client_accounting_case.kind = 'contract'`).

### Contract type

- English: `contract type`, `contract_type`
- German: `Vertragstyp (buchhalterisch)`
- Definition: The bookkeeping type of a contract that drives account selection. Enum (`buchassi_shared.ContractType`, mirrored by the DB CHECK on `client_source_docs_contracts.contract_type`): `loan` (Darlehen), `rent` (Miete), `lease` (Leasing), `recurring_invoice` (Dauerrechnung), `service` (Dienstleistung), `other`.
- Notes: Enumerated in code like `DocumentForm`; extending it is a typed PR + migration. Deliberately separate from the free-text contract subject.

### Contract subject

- English: `contract subject`, `contract_subject`
- German: `Vertragsgegenstand`
- Definition: Free-text description of the purchased/leased service on a contract (e.g. „Autoleasing", „Büromiete Burgauerstraße 12"). The *what*, not the bookkeeping type.
- Notes: Never modelled as an enum — it is open-ended. Distinct from `contract_type`.

### Contract extractor

- English: `contract extractor`
- German: `Vertragsextraktion`
- Definition: The stateless module (`apps/contract-extractor`) that extracts structured contract data (type, subject, term, summary, primary amount, booking facts, clarifications) from a contract PDF and normalises the term to canonical (start date + duration).
- Notes: Sibling of invoice-preprocessor/interpreter and document-simple-classifier. Only `workflows` imports it; v1 uses the PDF text layer only (no OCR fallback).

### Processing service

- English: `processing service`
- German: `Verarbeitungsdienst`
- Definition: The Python side of Ludwig that performs orchestration and processing work outside the web app.
- Notes: The old single service has been split into dedicated Python projects. Prefer the more precise module names below.

### Workflows service

- English: `workflows service`, `workflows`
- German: `Workflow-Dienst`
- Definition: The only stateful Python project that owns orchestration, runtime persistence, storage coordination, and module composition.
- Notes: This is the only Python module allowed to depend on the other processing packages.

### Invoice preprocessor

- English: `invoice preprocessor`
- German: `Rechnungsvorverarbeitung`
- Definition: The stateless module that turns an invoice PDF into structured invoice extraction data.
- Notes: Owns OCR, cleanup, GPT structuring, and validation. Must not use hidden persistent state as processing input. Diagnostic persistence is allowed only when it does not influence processing results.

### Invoice interpreter

- English: `invoice interpreter`
- German: `Rechnungsinterpretation`
- Definition: The stateless module that enriches extracted invoice data with semantic interpretation.
- Notes: Conceptual only for now. All context must be passed in explicitly.

### Booking module

- English: `booking module`
- German: `Buchungsmodul`
- Definition: The stateless module that derives a booking proposal from enriched invoice data and explicit accounting context. Decides DATEV tax key, picks the debit account per line, merges into split postings, and emits an `overall_confidence` plus structured review reasons.
- Notes: Lives in `apps/booking-module`. Must not access durable state directly — all context flows in via `BookingModuleRequest`. Persistence and candidate retrieval are owned by `workflows` (`booking_proposal_workflow.py`). See [`docs/topics/buchung.md`](./docs/topics/buchung.md) for data flow and decision logic.

### Document simple classifier

- English: `document simple classifier`
- German: `einfacher Belegklassifikator`
- Definition: The stateless module that runs a cheap first pass on every incoming PDF. Extracts plain text (PDF text layer or local Tesseract OCR), produces a German-language summary, classifies the document on two fixed axes (`document_form`, `document_kind`), and lists every company name found on the document. Direction (Eingangs- vs. Ausgangsrechnung) ist bewusst NICHT mehr Teil der Klassifikation — sie wird im Workflow deterministisch via UStID-Match aufgelöst (siehe `Accounting role`).
- Data type: schema (Python package `apps/document-simple-classifier/`)
- Example: input `Tankquittung.pdf` → `document_form=fuel_receipt, document_kind=original`, plus summary and `[ALLGUTH GmbH]` as `vendor`. Direction (inbound/outbound) entscheidet danach der Workflow-Resolver via UStID-Match, mit `fuel_receipt` als Heuristik-Stufe falls keine UStID matched.
- Notes: Sits BEFORE `invoice-preprocessor` in the pipeline so `workflows` can route documents based on the cheap classification (e.g. fuel and hospitality receipts skip line-item splitting). Stateless: must not access durable state. Cost-controlled: one structured-output LLM call per document, optionally a second one for `expected bookkeeping year` re-verification.

### Main app (suspended during prototype)

- English: `main app`
- German: `Hauptanwendung`
- Definition: The future user-facing application that will own authentication, user-visible workflows, and review orchestration.
- Notes: No main app exists during the prototype. `workflows` currently holds data that will eventually belong to a main app.

### System of record

- English: `system of record`
- German: `führendes System`
- Definition: The authoritative system for durable business truth.
- Notes: During the prototype, `workflows` plays this role out of convenience. The long-term intent is to move system-of-record responsibility out of `workflows` once a separate user-facing layer exists.

### Tenant membership

- English: `tenant membership`
- German: `Kanzleimitgliedschaft`
- Definition: The relationship between a user and a tenant, including role and status.
- Notes: Security-critical concept. Keep naming exact across DB, RLS, and app code.

### Database schema

- English: `database schema`
- German: `Datenbankschema`
- Definition: A namespace inside one Postgres database used to group tables, enums, functions, and other database objects.
- Data type: Postgres schema object (created via `create schema <name>`).
- Example: `ludwig` (all domain tables), `ludwig_private` (trigger helpers).
- Notes: All domain tables live in the single `ludwig` schema, grouped by **prefix bucket** (`platform_*`, `client_*`, `reference_*`, `ops_*`) — not by schema. See 2026-04-23 decision-log entry "Consolidate into single buchassi schema with prefix buckets".

### Platform prefix (`platform_*`)

- English: `platform prefix`
- German: `Plattform-Präfix`
- Definition: The naming bucket for SaaS-infrastructure tables — multi-tenancy, users, and the client registry. Answers "who uses the system, and which mandants exist".
- Data type: Table-name prefix within `ludwig`. Contains `platform_tenants`, `platform_tenant_users`, `platform_clients`.
- Example: `select * from ludwig.platform_tenant_users where user_id = auth.uid();`
- Notes: `platform_clients` is the Mandanten registry (who exists, which tenant owns them). The per-mandant bookkeeping content itself lives under the `client_*` prefix.

### Client prefix (`client_*`)

- English: `client prefix`
- German: `Mandanten-Präfix`
- Definition: The naming bucket for per-mandant bookkeeping data — everything scoped to a concrete `client_id`. This is the durable, archivwürdige business truth.
- Data type: Table-name prefix within `ludwig`. Contains e.g. `client_fiscal_years`, `client_journal_entry(_line)`, `client_ledger_accounts`, `client_business_partners`, `client_payment_accounts`, `client_source_docs(_invoices/_invoice_lines/_contracts)`, `client_accounting_case/_event`, `client_datev_*`.
- Notes: Every `client_*` table carries a `client_id` FK to `ludwig.platform_clients`. RLS uses the helper `ludwig.is_member_of_client_tenant(client_id)`.

### Reference prefix (`reference_*`)

- English: `reference prefix`
- German: `Referenz-Präfix`
- Definition: The naming bucket for cross-client domain catalogs and standards — reference data shared across all mandants, not owned by any single client.
- Data type: Table-name prefix within `ludwig`. Contains `reference_account_framework_entries` (SKR03/04 template catalog). Future: VAT rates, country codes, etc.
- Notes: Read-mostly; seeded once per catalog and amended by curated imports. No RLS — data is client-independent.

### Ops prefix (`ops_*`)

- English: `ops prefix`
- German: `Ops-Präfix`
- Definition: The naming bucket for pipeline, storage, and telemetry tables — technical machinery, not business truth.
- Data type: Table-name prefix within `ludwig`. Contains `ops_stored_files`, `ops_extraction_logs`, `ops_llm_call_logs`.
- Notes: Transient by policy (~7 day retention). Durable invoice business fields live under `client_*` (`client_invoices` + `client_invoice_line_items`); `ops_*` rows point at them by UUID but the reverse direction (`client_invoices.preprocessing_invoice_id`) carries no FK, because the bookkeeping side must survive retention of the pipeline side.

### External system prefix (`<system>_*`)

- English: `external system prefix`
- German: `Fremdsystem-Spalten-Präfix`
- Definition: Spalten-Namenskonvention (Owner-Entscheid 2026-08-05, verallgemeinert 2026-08-14 als F76 R7): Eine Spalte, deren **Wert ein anderes System vergibt oder definiert**, heißt `<system>_<feldname>` mit dem Originalnamen der Quelle — für DATEV also `datev_<datev-feldname>`, für ein Kassensystem `<kasse>_…`; nie `external_id`. So ist an jeder Spalte ablesbar, ob der Wert Fremdsystem-Wahrheit ist (dann darf Ludwig ihn nie selbst wählen, siehe „Kontonummern vergibt DATEV") oder Ludwig-eigen. DATEV ist der bisher einzige, aber nicht mehr der einzig mögliche Fall (Kassen-/Vorsysteme).
- Data type: Column-name prefix in any `ludwig` table.
- Example: `client_ledger_accounts.datev_main_function_number` / `datev_main_function` (aus `main_function_number` / `main_function`), `datev_tax_rate` (aus `tax_rates`), `platform_clients.datev_client_number`, `client_source_docs.datev_ref_system/_id`, `client_ledger_accounts.datev_account_id/_synced_at/_addressee_id`.
- Notes:
  - **Nicht** betroffen sind fachlich-universelle Werte, die zufällig über DATEV hereinkommen: Name, Adresse, IBAN, USt-ID, Währung, Rechtsform, Soll-/Ist-Versteuerung, UStVA-Rhythmus. Die wären aus jeder Quelle dieselben — Prefix nur, wo der Wert ohne DATEV-Kontext gar nicht definiert ist (Kontenfunktion, Automatik-Steuersatz, GUIDs, Sync-Zeitpunkte, DATEV-Modell-Flags, Nummernkreis-Settings).
  - Tabellen, die als Ganzes DATEV-Spiegel sind (`client_datev_*`), brauchen den Prefix an den Spalten nicht — die Entity sagt es schon.
  - Gemischte Entities brauchen ihn dagegen zwingend: `client_business_partners` trägt DATEV-Import **und** Ludwig-Profiling (`typical_nature`, `vat_profile`) nebeneinander.
  - Abgrenzung zu R8: `fy_` beschreibt die Jahresbindung des VERWEISES, das System-Präfix die HERKUNFT des Werts — sie werden nicht kombiniert (`datev_account_id` an einer jahresgebundenen Tabelle bleibt `datev_account_id`).
  - **Bewusste Ausnahmen** (Erhebung 2026-08-05, Umsetzung im selben Zug):
    `platform_clients.account_framework_code` (SKR03/04 ist Branchenstandard und in
    `reference_account_frameworks` eigene Entity), `client_ledger_accounts.account_number`
    (die Entity *ist* der Kontenrahmen — Präfix gewönne keine Information),
    `platform_clients.diverse_creditor_account_number` (Kanzlei-Konvention, **keine**
    DATEV-Tatsache: DATEV führt bei 61015 kein Diverse-Konto) und
    `reference_account_framework_entries.account_number_length` (die Kontenlängen-VARIANTE
    des SKR-Katalogs, eine Ludwig-Modellierung — trotz gleichen Namens etwas anderes als
    `platform_clients.datev_account_length`).
  - Die Regel gilt für **DB-Spalten**. Funktionsparameter und DTO-Felder, die den Wert
    fachlich beschreiben (`accountNumberLength` als Rechengröße, `CreditorSnapshot.
    is_collective_account`), bleiben unberührt.

### Invoice status fields (`*_status`)

- English: `invoice status field`
- German: `Beleg-Status-Feld`
- Definition: A `*_status`-suffixed column on `ludwig.client_invoices` that names a state machine — *where* the invoice currently is. **Drei orthogonale Achsen** (Stand DB-Migrationen `20260502190000`, `20260511100000`, `20260519120000`, `20260519130000`):
  - **`processing_stage`** ∈ `classified | extracted | preprocessed | interpreted | proposed` (oder NULL) — **Pipeline-Fortschritt**: welche Pipeline-Stufen sind durchgelaufen. `classified` = nach Cheap-Classifier; `extracted` = nach BEDI-Sampling-Light-Pass (Classifier+Preprocessor ohne Interpreter, Cutoff für Onboarding); `preprocessed` = nach Azure-OCR + OpenAI-Strukturierung; `interpreted` = nach Interpreter; `proposed` = Booking-Modul hat einen `BookingProposal` erzeugt.
  - **`processing_status`** ∈ `pending | in_progress | processed | failed` (oder NULL) — **technisch / Pipeline-Run-Status**. `pending` = Upload akzeptiert, Pipeline noch nicht gestartet; `in_progress` = aktiv in Bearbeitung; `processed` = Pipeline durchgelaufen (Reviewer ist jetzt am Zug, fachliche Wertung läuft über `lifecycle_status`); `failed` = harter Pipeline-Fehler, Eingriff erforderlich.
  - **`lifecycle_status`** ∈ `pending_review | needs_clarification | accepted | rejected | superseded | archived` (oder NULL) — **fachlich / Reviewer-Sicht**. NULL solange die Pipeline noch nicht durch ist; sobald `processing_status='processed'` erreicht ist, hat der Reviewer eine Aufgabe (`pending_review` oder `needs_clarification`). Terminale Reviewer-Entscheidungen: `accepted` / `rejected` / `archived`. `superseded` markiert ein älteres Proposal, das durch einen neuen Lauf ersetzt wurde.
- Data type: text columns on `ludwig.client_invoices` with `check` constraints (siehe oben genannte Migrationen).
- Notes: Reserve the `_status` suffix for state machines. Step outcomes use the `_result` suffix instead — see *Invoice step result fields*. **Status-Refactor 2026-05-19:** Die früheren Werte `review_needed`/`booked`/`archived` von `processing_status` sind in die `lifecycle_status`-Achse gewandert (`pending_review` / `accepted` / `archived`); die alte Spalte `booking_proposal_status` ist weg — Vorschlag-Existenz lebt jetzt im `booking_proposal_payload_json`-Snapshot. The Technik-Tab in `apps/web/src/modules/invoices/ui/tabs/TechnicalTab.tsx` renders the axes as separate tables. See `docs/topics/architektur.md` 2026-05-02 "Status vs. step result on client_invoices" und Migration `20260519120000`.

### Invoice step result fields (`*_result`)

- English: `invoice step result field`
- German: `Schritt-Ergebnis-Feld`
- Definition: A `*_result`-suffixed column on `ludwig.client_invoices` that records the outcome of a single pipeline step. Codomain: `succeeded | partially_succeeded | failed`.
  - `class_result` (classifier).
  - `interp_result` (interpreter); `partially_succeeded` typically means clarification questions or VAT mismatches are open.
  - `booking_result` — does not exist yet. Booking module is currently a scaffold; add this column when it goes live.
  - `preproc_result` — not projected onto `client_invoices`. The preprocessor's outcome lives on `ops_invoice_extractions.pipeline_status` and stays there; project to `client_invoices` only when the UI needs it per-invoice.
- Data type: text columns on `ludwig.client_invoices` with `check` constraints (codomain pinned to the three values above).
- Example: invoice finished classification + interpretation but has an open clarification → `processing_stage = 'interpreted'`, `processing_status = 'processed'`, `class_result = 'succeeded'`, `interp_result = 'partially_succeeded'`, `lifecycle_status = 'needs_clarification'`.
- Notes: *Previously:* `class_status`, `interp_status` (renamed 2026-05-02 — the `_status` suffix incorrectly suggested state machines). The `_status` vs. `_result` split is a naming convention to apply to any future per-step outcome on `client_invoices`. See `docs/topics/architektur.md` 2026-05-02.

### Stored file

- English: `stored file`
- German: `gespeicherte Datei`
- Definition: A raw file blob plus technical metadata such as storage backend, storage key, mime type, size, and checksum.
- Notes: Distinct from business concepts like documents or imported datasets. The file record tracks technical storage and retrieval, not accounting interpretation.

### Invoice workflow record

- English: `invoice workflow record`
- German: `Rechnungs-Workflow-Datensatz`
- Definition: The stateful processing-service record that tracks one ingested invoice file, its duplicate hash, extracted invoice fields, and workflow status.
- Notes: This is workflow-local runtime state, not durable business truth in the main app. Reuse this term instead of creating synonyms like `processed invoice entity` or `invoice job record`.

### Preprocessing identifier

- English: `preprocessing identifier`, `preprocessing id`
- German: `Vorverarbeitungskennung`
- Definition: The explicit identifier for one invoice preprocessing execution and its attached diagnostics.
- Notes: Prefer a workflow-provided UUID when available. It is used to fetch logs and evidence artifacts, not to encode business meaning.

### Preprocessing diagnostics

- English: `preprocessing diagnostics`
- German: `Vorverarbeitungsdiagnostik`
- Definition: Flexible technical output for one preprocessing execution, such as raw provider responses, OCR evidence, debug traces, and intermediate payloads.
- Notes: This is intentionally softer and more provider-specific than the main extraction result. It must not become hidden input for later processing.

### LLM provider

- English: `LLM provider`
- German: `LLM-Anbieter`
- Definition: The external model platform used by the processing service to access language models.
- Notes: Keep the internal processing interface provider-agnostic. Provider choice belongs in infrastructure configuration, not domain logic.

## DATEV exceptions (kept in German deliberately)

The project rule is English names for all code, schemas, and columns (see decision log 2026-04-15 and 2026-04-22). These entries document the deliberate exceptions — DATEV-specific terms where the German name is the de-facto industry standard and an English translation would lose meaning.

### Taxation type — `soll` / `ist`

- English: *(kept in German — DATEV term)*
- German: `Soll-Versteuerung`, `Ist-Versteuerung`
- Definition: Whether VAT is owed on invoice issue (`soll` = Soll-Versteuerung, accrual basis) or on payment receipt (`ist` = Ist-Versteuerung, cash basis). Set per client.
- Data type: `ludwig.platform_clients.taxation_type` — text enum (`'soll' | 'ist'`).
- Example: `taxation_type = 'ist'` for a Kleinunternehmer on cash-basis VAT.
- Notes: DATEV-exception. English translations (`accrual`/`cash`) drop the VAT-specific meaning that German users rely on; these are short, unambiguous DATEV terms.

### Belegfeld 1 / Belegfeld 2

- English: *(kept in German — DATEV column names)*
- German: `Belegfeld 1`, `Belegfeld 2`
- Definition: Two free-text fields on every DATEV posting. Convention: `Belegfeld 1` usually holds the invoice/document number; `Belegfeld 2` is a secondary reference (often open-item number, due date, or discount info — not strictly specified).
- Data type: `ludwig.client_journal_entry_line.external_document_number` (max. 36) und `external_document_number_2` (max. 12) — `text`, nullable. **Zeilen-Ebene**, siehe [Journal entry line](#journal-entry-line-teilbuchung).
- Example: `external_document_number = "RE-2026-0042"`.
- Notes: DATEV-exception. The semantics are loose by design; a generic English name (`reference_1`, `document_number`) would either mislead or require an enforced interpretation DATEV does not give. Belegfeld 1 hängt an der **Teilbuchung**, nicht am Satz — eine Multizahlung trägt je Rechnung eine eigene Nummer (F33).

### Buchungstext

- English: *(kept in German — DATEV column name)*
- German: `Buchungstext`
- Definition: Free-text description of a bookkeeping entry (≤ 60 chars in DATEV export format).
- Data type: `ludwig.client_journal_entry_line.line_description` — `text`, nullable. **Zeilen-Ebene**, siehe [Journal entry line](#journal-entry-line-teilbuchung).
- Example: `line_description = "Telefon Januar 2026"`.
- Notes: DATEV-exception. `posting_text` / `narrative` would be valid English, but the DATEV term is so universally used in the Kanzlei domain that Anglicizing just adds translation overhead. Der Text hängt an der **Teilbuchung**; ein Satz-Kopffeld gibt es nicht. Der Agent muss ihn am Stil der Konto-Historie ausrichten (`search_past_bookings(accountNumber=…)`), der Judge prüft und korrigiert das (B8). Mandanteneigene Konvention: `posting_text_convention` am Client-Profil.

### Kost 1 / Kost 2

- English: *(kept in German — DATEV column names)*
- German: `KOST1`, `KOST2`
- Definition: Two cost-center reference fields on every DATEV posting. `KOST1` is the primary cost center, `KOST2` the optional secondary.
- Data type: `ludwig.client_journal_entry_line.kost1`, `kost2` — `text`, nullable. **Zeilen-Ebene**, siehe [Journal entry line](#journal-entry-line-teilbuchung).
- Example: `kost1 = "1000"` (Vertrieb), `kost2 = "NRW"`.
- Notes: DATEV-exception. DATEV export files name the columns `KOST1 - Kostenstelle` / `KOST2 - Kostenstelle` — keeping the short form avoids translation drift between our schema and DATEV's CSV convention. Seit 2026-07-14 auf der **Teilbuchung**: ein Aufwandssplit kann je Zeile eine andere Kostenstelle tragen (60 % Vertrieb / 40 % Verwaltung) — am Satz-Kopf war das nicht abbildbar, obwohl DATEV es kann.

### BU-Schlüssel (DATEV tax key)

- English: *(kept in German — DATEV term)*
- German: `BU-Schlüssel`, `Buchungsschlüssel`
- Definition: One- or two-digit DATEV code on a posting that signals the VAT treatment to the booking system. Determines whether VSt is deducted, the rate, and special cases like Reverse Charge or innergemeinschaftlicher Erwerb.
- Data type: `ludwig.client_journal_entry_line.tax_key` — `text`, nullable (*vormals `client_bookkeeping_entries.vat_key`*).
- Example: `vat_key = '9'` (Vorsteuer 19% Inland), `'8'` (Vorsteuer 7%), `'0'` (steuerfrei / Kleinunternehmer), `'94'` (§13b Reverse Charge), `'19'` / `'18'` (innergemeinschaftlicher Erwerb 19% / 7%).
- Notes: DATEV-exception. The booking module emits these from `apps/booking-module/src/buchassi_booking_module/domain/tax_classification.py`. The codes shown are SKR04 convention; SKR03 uses largely the same set. The full mapping treatment → key lives next to the decision tree in `tax_classification.py:52–61`.

### BEDI hash

- English: *(kept as DATEV identifier)*
- German: `BEDI-Hash`, `Beleg-Identifikation`
- Definition: Hex hash that DATEV writes into the Beleglink field of an exported EXTF booking CSV to identify the originating document. In the accompanying `Belege/` export folder, every PDF's filename equals its BEDI hash.
- Data type: `ludwig.client_journal_entry.source_beleg_bedi_hash` — `text`, nullable. Also surfaces as `ops_stored_files.original_file_name` for onboarding-imported PDFs.
- Example: `source_beleg_bedi_hash = "B8E3A9F1C2D4..."`, with the matching PDF named `B8E3A9F1C2D4....pdf`.
- Notes: DATEV-exception. The hash is the only soft link between a DATEV-imported posting (`origin='imported'`) and its source PDF. **Geltungsbereich**: only onboarding-imported documents — newly uploaded PDFs (post-onboarding, live ingest) carry an arbitrary user-chosen filename and have no BEDI hash. Regex for parsing the EXTF field lives in `scripts/onboard_datev_parse.py:47`. **Nicht verwechseln** mit der *DATEV document reference* (nächster Eintrag): das ist die umgekehrte Richtung — eine Referenz beim Export, nicht der Import-Beleglink.

### DATEV document reference (external)

- English: *(kept as DATEV identifier)*
- German: `DATEV-Ablage-Referenz`, `BEDI-/DDMS-Verweis`
- Definition: Optional pointer, set at upload/ingest, saying a Beleg already lives in a DATEV filing system — **BEDI** (Belege digital) or **DDMS** (DATEV DMS). There is always exactly **one** id plus the folder it belongs to. Only relevant at export time: id present → reference the existing DATEV document; id absent → attach the file itself. May be unknown at upload and supplied later.
- Data type: `ludwig.client_source_docs.datev_ref_system` (`text`, `∈ {bedi, ddms}`), `.datev_ref_folder` (`text`), `.datev_ref_id` (`text`) — all nullable. DB-CHECK `client_source_docs_datev_ref_complete`: either all three NULL, or `system` + `id` set together (folder optional).
- Example: `datev_ref_system = 'ddms'`, `datev_ref_folder = 'Eingangsrechnungen 2026'`, `datev_ref_id = '4711'`.
- Notes: **External reference, not a DB foreign key** — DATEV is an external system. Distinct from the *BEDI hash* (import Beleglink, DATEV → us); this is the reverse direction (export, us → DATEV). Ingest carriers: Web `finalizeDocumentUpload` (`datevRef`) → `insertInboxEntry`, CLI `upload-document --datev-ref-{system,folder,id}`, und MCP `ingest_uploaded_file` (`datevRef` direkt am Upload, seit 2026-07-22). **Nachtragen an bestehenden Belegen**: MCP-Tool `update_source_doc` (`updateSourceDoc` in `agent-ingest-core.ts`; `datevRef=null` entfernt die Referenz) — ein Tool für alle Beleg-Metadaten statt eines pro Feld, siehe *Beleg-Metadaten (Agent)*. **Anzeige**: generischer `SourceDocView` (Belegdaten, „DATEV-Ablage") und Rechnungs-`PipelineTab` (Sektion „DATEV-Ablage", via `getInvoice`-Join auf den Supertyp). **Export-Pfad** (F24-T24.1): `loadExportableJournalEntries` löst die Referenz über den Sachverhalt auf (journal_entry → accounting_event.case_id → source_docs mit `datev_ref_id`) und der EXTF-Writer schreibt sie als Feld 20 „Beleglink" (`BEDI "<id>"`/`DDMS "<id>"`); genau ein referenzierter Beleg füllt das Feld, keiner bleibt still leer, mehrere → leer + Warnung (siehe *Buchungsstapel (EXTF)*). Introduced 2026-07-10.

### Beleg-Metadaten (Agent)

- English: `source doc metadata`
- German: `Beleg-Metadaten`
- Definition: Die drei Felder, die der Agent am Beleg selbst setzen darf, weil sie nicht aus der Datei hervorgehen: *DATEV-Ablage-Referenz*, *Eingangsdatum* und der *Agent-Kommentar* (Freitext-Kontext für die spätere Buchung — was der Mandant mündlich gesagt hat, Abgrenzung zu einem anderen Beleg). Alles andere am Beleg (Belegform, Rolle, Betragsdaten) bestimmt der Server aus dem Dokument.
- Data type: `ludwig.client_source_docs.datev_ref_*`, `.received_date` (`date`, NOT NULL, Default `current_date`), `.agent_comment` (`text`, nullable). Schema: `SourceDocMetadataSchema` in `agent-ingest-core.ts`.
- Example: `{ datevRef: { system: "bedi", refId: "A1B2…", folder: "Rechnungseingang" }, receivedDate: "2026-07-09", agentComment: "Mandant: privat mitveranlasst, 50 % Kürzung" }`
- Notes: **Ein Schreibpfad, zwei Türen** — direkt am Upload (`ingest_uploaded_file`, spart den zweiten Call) oder nachträglich (`update_source_doc`). Dreiwertige Semantik: Feld weglassen = unverändert, `null` = löschen; sonst würde ein Referenz-Nachtrag den Kommentar leerräumen. `received_date` ist NOT NULL und lässt sich nur überschreiben, nicht leeren. Am Kontoauszug sind die Felder ein Fehler (kein source_doc) und werden abgewiesen, nicht still verworfen. Der Kommentar erscheint für den Agenten in `get_case` (Event-Join auf den Supertyp) und `list_docs`. Abgegrenzt von `rationale` (Audit-Begründung einer einzelnen Aktion, landet im Audit-Log, nicht am Beleg). Deckt dieselben Felder ab wie der CSV-Pfad *DATEV-Metadaten-Import* (`Belege_Meta_*.csv`), der für Bulk-Nachträge bestehen bleibt. Introduced 2026-07-22.

### Buchungsstapel (EXTF)

- English: *(kept in German — DATEV format name)*
- German: `Buchungsstapel`, `EXTF-Datei`
- Definition: DATEV's CSV batch format for postings (CP1252, `;`-separated, `EXTF` magic header line + official 125-column layout in format 700/12). Ludwig both **imports** it (onboarding journals via `datev_import_service.py`, bank statements via `bank-transactions/infrastructure/datev-buchungsstapel-parser.ts`) and **exports** it (accepted bookings back to DATEV, Variante A).
- Data type: file format; writer lives in `apps/web/src/modules/datev-export/` (`buildBuchungsstapelCsv`, pure) and `server.ts` → `buildBuchungsstapelCsvForClient(clientId, {from, to})`.
- Example: `"EXTF";700;21;"Buchungsstapel";12;…` followed by `Umsatz (ohne Soll/Haben-Kz);Soll/Haben-Kennzeichen;…` and one row per Konto/Gegenkonto pairing.
- Notes: DATEV-exception. Export contains only `status='accepted'` journal entries that were not yet exported (`exported_at is null`, see *Export marking*); Splitbuchungen become one DATEV row per line on the multi side, n:m splits are rejected. See the module comment in `application/build-buchungsstapel-csv.ts` for the full reverse-derived mapping rules.

### Mandantenstapel (client batch)

- English: `client batch`
- German: `Mandantenstapel`
- Definition: Ein **vom Mandanten selbst gebuchter** EXTF-Buchungsstapel (Rechnungssoftware, Kasse, Warenwirtschaft), den Ludwig entgegennimmt und als Entwurf importiert (`client_journal_entry.origin='client_import'`), statt dieselben Umsätze nachzubuchen. Nicht zu verwechseln mit dem **DATEV-Import** (was in DATEV *ist* → `client_datev_mirror_entries`) und nicht mit dem **Export** (was Ludwig *nach* DATEV schickt): der Mandantenstapel ist das, was noch nach DATEV *soll*. Liefert Teilschritt **1e** des Buchungslaufs — nach dem DATEV-Import 1d, vor dem Sachverhalte-Bilden 1f.
- Data type: `ludwig.client_batch_imports` (ein Lauf je Datei: Datei-Hash als Idempotenz-Anker, `rejections` als Ablehnungsprotokoll) + `client_journal_entry.batch_import_id`/`import_reference`. Modul `apps/web/src/modules/client-batches/` (Parser `domain/extf-batch.ts` pure, Import `application/import-client-batch-core.ts`).
- Example: Ein Mandant fakturiert in Lexoffice und liefert monatlich `EXTF_Buchungsstapel_Juli.csv`; Ludwig legt je offener Forderung einen Sachverhalt an, die Zahlungseingänge des Kontoauszugs laufen dagegen.
- Notes: Der Import legt **keine** fachlichen Sachverhalte an — alles geht in einen Sammel-Sachverhalt, den der *Sachverhalts-Zuschnitt* (nächster Eintrag) nachgelagert über den Bestand formt. Nur bei Mandanten mit `platform_clients.expects_client_batches` (Ausnahme, nicht Regelfall) — ohne das Setting wird ein EXTF-Upload wie bisher als Kontoauszug geroutet. Parsen ist **deterministisch, nie LLM** (Beträge/Kontonummern/BU dürfen nicht durch Transkription laufen). Die Sätze durchlaufen die normale Kanzlei-Abnahme, aber **keinen Judge-Pass**: der Mandant hat gebucht, die Kanzlei nimmt ab. Sie sind vor der Abnahme als OPOS/Präzedenz sichtbar (eigener Zweig in `client_effective_journal_lines`) und werden von `submit_booking_proposal` nie gelöscht. Ein Satz, dessen Konten nicht sauber auflösbar sind, wird **abgelehnt und protokolliert** statt geraten. Introduced 2026-08-11 (F69).

### Zahlungs-Klammer-Auflösung (payment bracket resolution)

- English: `payment bracket resolution`
- German: `Zahlungs-Klammer-Auflösung`
- Definition: Das Vervollständigen einer **halben** Buchung aus einem Mandantenstapel. Grundregel am **Gegenkonto der Zahlungszeile**: läuft die Kasse gegen ein **Sachkonto** (Fall a, „Aufwand an Kasse"), ist die Mandantenbuchung fachlich komplett; läuft sie gegen ein **Personenkonto** (Fall b, Diverse-Konto/Kreditor/Debitor), ist nur die **Zahlungshälfte** gebucht — die Belegseite muss Ludwig nachliefern. 12,98 € Kassenzahlung + zwei Bons über 3,19 € und 9,79 € sind **ein** Vorgang mit 1 Zahlung + 2 Belegen.
- Data type: Kein Server-Schritt mehr — der deterministische Summen-Matcher ist mit dem EXTF-OPOS-Rückbau entfallen (W8/P14, `datev.md` R31). Der Agent hängt die Belege per `attach_source_doc_to_case` an und bucht sie Weg A gegen dasselbe Personenkonto; das Belegfeld liefert `bracketBelegfeld1` (`accounting-cases/application/immediate-payment.ts`).
- Example: Kassenstapel `Diverse-E-Konto an Kasse 12,98 €` + EDEKA-Bons 3,19 € / 9,79 € → ein Sachverhalt; beide Bons gehen Weg A gegen dasselbe Personenkonto mit der Belegnummer der Zahlung.
- Notes:
  - **Die Mandantenzahlung wird nie angefasst** — nicht aufgeteilt, nicht umbenannt, nicht storniert. Ludwig bucht ausschließlich die Belegseite.
  - **Belegfeld 1 kommt aus der Klammer** (F75-T75.4): Normalfall die Belegnummer der Mandantenzahlung auf allen Zeilen (nur so ziffert DATEV aus). Trägt die Zahlung keine, bekommen alle Belege der Gruppe die OCR-Nummer des **ältesten** Belegs plus den Marker **`-L-SV<Sachverhaltsnummer>`** (z. B. `4711-L-SV2026-0082`), und ohne jede OCR-Nummer den Marker allein (`L-SV2026-0082`). Der Marker sagt: diese Nummernvergabe war Ludwigs Entscheidung. **Ehrliche Grenze:** in diesen beiden Fällen gibt es in DATEV **keine** automatische Auszifferung — der Wert dient dem Wiederfinden, den Ausgleich macht die Kanzlei manuell. Nie zurück nach `invoice_number` (Buchungs-Artefakt ≠ Beleg-Wahrheit).

### Beleggruppe (Stapel-Sortierung)

- English: `document group` (batch sort order)
- German: `Beleggruppe`
- Definition: Die klassische Belegablage-Reihenfolge, in der der Buchungsstapel sortiert wird (BL-120): **1. Ausgangsrechnungen → 2. Eingangsrechnungen → 3. Kasse → 4. Bank → 5. Sachbuchungen** (reine Sachkonten-Umbuchungen, bewusst ans Ende). Zuordnung je Buchungssatz **kontobasiert**, nicht über `case.kind`: ein beteiligtes Zahlungskonto (`client_payment_accounts.kind`) gewinnt immer (`cash` → Kasse, sonst Bank; Kasse↔Bank-Umbuchung → Kasse), sonst entscheidet die `accounting_role` des Personenkontos (`debtor` → AR, `creditor` → ER), sonst Sachbuchung. Innerhalb der Gruppe gilt Buchungsdatum, dann id.
- Data type: pure Domain-Helper `apps/web/src/modules/datev-export/domain/beleggruppen.ts` (`classifyBeleggruppe`, `sortEntriesByBeleggruppe`, `BELEGGRUPPE_RANK/LABEL`).
- Example: Zahlungsbuchung Kreditor ⇄ Bank → Gruppe Bank (Zahlungskonto sticht Personenkonto); Abschreibung 6220 ⇄ 0470 → Sachbuchungen.
- Notes: Gilt identisch für **beide** Exportwege (EXTF-Datei und JSON-Sequence des API-Exports — beide Builder nutzen `sortEntriesByBeleggruppe`, Divergenz wäre ein Bug) sowie für Wizard-Vorschau, „Offene Monate" und die Abnahmeliste (innerhalb der Triage-Buckets). Funktioniert kontobasiert auch für Altbestand-Sätze ohne `case_id`. Seit F66-T66.8 (2026-08-12) wird die Gruppe **beim Buchen persistiert** (`client_journal_entry.beleggruppe`, `stampJournalEntryBeleggruppe` in allen Schreibern — dieselbe TS-Funktion, keine zweite Implementierung; der frühere SQL-Rank-Spiegel in „Offene Monate" liest jetzt die Spalte). Daneben existiert eine **Arbeitsvorrats-Heuristik** für die Buchungs-Teilschritte 2b–2e des Agent-Laufs (`classifyEventWorkGroup`, F66): Bank-/Kassen-Tx → `client_payment_accounts.kind`, Rechnungs-Beleg → `accounting_role` des Belegs (out→2b, in/receipt→2c), Rest → 2f. Das ist **Planungs-Zuordnung, nicht Wahrheit** — sie darf von der persistierten Gruppe abweichen, ohne dass ein Gate bricht (die Vollständigkeits-Gates prüfen Ereignisse, nicht Gruppen). Introduced 2026-08-07 (BL-120).

### Export marking / export batch

- English: `export marking`, `export batch`
- German: `Export-Markierung`, `Export-Stapel(-Protokoll)`
- Definition: After a Buchungsstapel (EXTF) export run, the exported journal entries are stamped with `exported_at` + `export_batch_id`, and the run itself is recorded as one row in `client_datev_export_batches` (period, `entry_count`, `file_name`, `created_by`). A marked entry can only be reversed (Storno), never edited/rejected/deleted — otherwise Ludwig would diverge from DATEV (which stays leading, Variante A). Deliberately **not** `status='posted'`: that status stays reserved for a future own Festschreibung (owner decision 2026-07-04).
- Data type: `ludwig.client_journal_entry.exported_at timestamptz` / `.export_batch_id uuid` + table `ludwig.client_datev_export_batches`; writer `markBatchExported(entryIds, batchMeta)` in `apps/web/src/modules/datev-export/server.ts`.
- Example: repeat export of April only contains bookings with `exported_at is null`; a mis-export is fixed by Storno + new batch (no un-export).
- Notes: Guards live in `booking-actions.ts` (`saveEventBooking`, `rejectEventBookings`) and `agent-booking-core.ts` (proposed-replace); `reverseEventBookings` stays allowed.

### Buchungszyklus / Stapel

- English: `booking cycle`, `export batch`
- German: **Buchungszyklus**, `(Buchungs-)Stapel`; veraltet: `Exportvorgang`
- Definition: **Zyklus, Stapel und Exportvorgang sind dieselbe Zeile** in `client_datev_export_batches` — seit F114 aber gedacht als Klammer um die *Bearbeitung eines Zeitraums*, nicht als Hülle um einen Export. Der Zyklus entsteht, BEVOR jemand darin arbeitet (Server: Kette nach der DATEV-Quittung + Onboarding-Review; Kanzlei: „Stapel anlegen"; **nie** der Agent), trägt n *Agent-Durchgänge* und die Arbeit der Kanzlei, wird freigegeben und endet, wenn er im DATEV-Spiegel wiedergefunden ist. `stapelnummer` (`YYYY-NNNN`, je Mandant) und Bezeichnung (`description`, z. B. `08-2026-Ludwig`) fallen bei der **Eröffnung**.
  - **Wer dran ist, IST der Zustand**: `agent` (Agent arbeitet) → `prepared` (Durchgang fertig, niemand hat übernommen) → `review` (Kanzlei prüft) → `ready` (freigegeben, geschnitten) → `exporting` → `inspection` → `confirmed` (DATEV quittiert) → `mirrored` (im Spiegel wiedergefunden, Nachlese offen) → `closed`. Daneben `failed` (human-hold) und `cancelled` (nur Bestand ohne Zyklus).
  - **Je Mandant genau ein offener regulärer Zyklus**, je Zeitraum genau ein offener. Ein zweiter Zyklus für einen schon freigegebenen Zeitraum ist ein **Nachtrag** (`supplements_batch_id`): steht in der Agent-Queue vor dem regulären und schreibt `booking_closed_until` nicht fort.
  - **CSV** (`runDatevExport` → `markBatchExported`) bleibt der Altweg: EXTF-Datei-Download, `state='confirmed'`, `exported_at` sofort gesetzt — kein Zyklus, nur Transport.
  - **Bridge** (`createExportvorgang`): die Freigabe claimt die `accepted`-Sätze des Zyklus und **schneidet** den Rest (verliert den Stempel, fällt dem nächsten Zyklus zu), setzt `ready`; die on-prem Bridge pusht per Polling und stempelt `exported_at` erst nach der DATEV-Quittung (`applyDatevResult`, `confirmed`).
- Data type: table `ludwig.client_datev_export_batches` (`stapelnummer`, `description`, `state ∈ agent|prepared|review|ready|exporting|inspection|confirmed|mirrored|closed|failed|cancelled`, `period_from/to`, `entry_count`, `supplements_batch_id`, `datev_sequence_id`); Stapelnummer-Vergabe geteilt via `nextStapelnummer(tx, clientId, year)`. Status-Achse `zyklus_stapel` in der Registry.
- Example: Der Zyklus `2026-0007` / `08-2026-Ludwig` steht auf `review`; die Kanzlei gibt ihn zurück an den Agenten, der einen zweiten Durchgang darin fährt.
- **Nachzügler / carry-over entries**: Buchungen, die **vor** dem gewählten Stapel-Zeitraum liegen und noch keinem Stapel zugeordnet sind — typisch die Rechnung, die erst nach dem Monatsexport hereinkam und nachgebucht wurde. Sie gehen standardmäßig mit (`includeEarlierUnbatched`, Wizard-Schritt 1, default an, mit Zähler + separater Auflistung in der Vorschau), weil sie sonst bis zum nächsten Export desselben Alt-Zeitraums liegen bleiben — für die Umsatzsteuer-Meldung müssen sie raus. Der Stapel-**Beginn** wird dafür auf das älteste Nachzügler-Datum vorgezogen (Dateiname, `period_from`, EXTF-Header, DATEV-`date_from` ziehen mit); der gewählte Zeitraum bleibt im Audit als `requestedFrom` + `carryOverCount`. Grenze: nur dasselbe Wirtschaftsjahr (`carryOverRange`) — ein EXTF-Stapel umfasst genau eines.
- Notes: Der **Stempel** `export_batch_id` auf Buchung, Sachverhalt, Ereignis, Klärung, Notiz und Regel ist **Herkunft, keine Zugehörigkeit** — nur `client_journal_entry` gehört ab `ready` genau einem Zyklus. Belege tragen keinen (ihre Erledigung ist abgeleitet, `completed_via`). Die Sperre hängt am Zustand, nicht am Stempel: ein Satz in `agent`/`review` bleibt editierbar. Der **Reset** gilt dem Zyklus (`resetBatchAction`, nur `agent|review`) und nimmt Agenten- wie Kanzlei-Arbeit mit. UI (F118/F119): `Mandant → Jahr → Buchungsstapel` — Liste mit *Prozessbild* und *Staffelstab* je Zeile und der DATEV-Seite daneben, Stapel-Detail mit sechs Tabs (Übersicht · Durchgänge · Buchungen · Artefakte · DATEV · Log), und von dort die *Stapelabnahme*. Angelegt wird im Dialog „Stapel anlegen" mit Server-Vorschau (`planManualBatch`); „nur manuell buchen" startet den Zyklus per Übergang direkt in `review`. Einen eigenen Ort „DATEV-Export" gibt es nicht mehr; freigegeben wird in der Abnahme (Schritt 8/9), `/export` bleibt Archiv.

### Stapelabnahme

- English: `batch review`
- German: **Stapelabnahme**; die Schritte: *Prüfschritt*, die Runden: *Abnahme-Runde*
- Definition: Der elfstufige Prüfprozess (Schritte 0–10), mit dem die Kanzlei einen *Buchungszyklus / Stapel* abnimmt: Ergebnis · Vollständigkeit · Rückfragen · Buchungsvorschläge · Bank · offene Posten · Plausibilität · Konventionen · Prüfprotokoll · Übergabe an DATEV · Nachlese. Sie beginnt mit „Prüfung übernehmen" (`prepared → review`) und endet mit „Freigeben" (`→ ready`) oder „Zurück an den Agenten" (`→ agent`).
  - Der **Rail ist ein Vorschlag, kein Zwang**: jeder Schritt ist jederzeit erreichbar; Schritt 8 sagt am Ende, was offen blieb.
  - **Geschrieben wird nur in `review`.** Vorher hat niemand übernommen, nachher sind die Sätze geclaimt. Jede Server Action prüft das selbst.
- Data type: Routen `clients/[slug]/[year]/stapel/[batchId]/abnahme/[schritt]`; Modul `apps/web/src/modules/stapelabnahme` (`domain/steps.ts`, `domain/gating.ts`).
- Example: „Stapel 2026-0009 wartet auf deine Abnahme → Schritt 0."
- Notes: Sie baut **keinen zweiten Kern** nach — die Schritte rufen dieselben Kerne wie Agent und Stammdatenpflege. Eigene Oberflächen hat sie sehr wohl (F123): das Grundmuster jedes Schritts ist *Todo-Liste* links, Detail rechts, Sprung zum nächsten offenen Punkt nach jeder Entscheidung; der Rail trägt je Schritt Ampel und Zähler. Nicht zu verwechseln mit der *Abnahme* eines einzelnen Buchungsvorschlags (Freigeben/Ablehnen am Satz), die ein Teil davon ist.

### Abnahme-Runde

- English: `review round`
- German: **Abnahme-Runde** (veraltet: „Review")
- Definition: Ein Durchlauf der *Stapelabnahme* durch die Kanzlei. Ein Stapel kann mehrere haben: nach „Zurück an den Agenten" fährt der Agent einen weiteren *Durchgang*, und die nächste Runde öffnet im Diff-Modus gegen den Stand beim Rücklauf.
- Data type: abgeleitet — Zahl der `export_batch.returned_to_agent`-Ereignisse in `platform_audit_events` + 1 (`BookingCycleDetail.round`). Es gibt **kein** Zählerfeld.
- Example: „Runde 2 nach Rücklauf vom 20.08."
- Notes: Gegenstück zum *Agent-Durchgang* — der Agent fährt Durchgänge, die Kanzlei Runden; beide hängen am selben Stapel. Bewusst abgeleitet: ein Zähler und die Audit-Spur würden auseinanderlaufen.

### Prozessbild / Staffelstab / Staffel-Leiste

- English: `process strip`, `baton`, `relay bar`
- German: **Prozessbild** (die vier Phasen), **Staffelstab** (wer dran ist), **Staffel-Leiste** (wo die Zeit hinging)
- Definition: Die drei Darstellungen, mit denen eine Zustands-Achse ohne Klick lesbar wird. Das **Prozessbild** fasst die Zustände zu vier Phasen zusammen (beim Stapel: buchen · prüfen · übertragen · angekommen) und zeigt sie als Strip (Liste), Stepper (Detail-Kopf) oder Mini. Der **Staffelstab** sagt, wer gerade dran ist — Icon **und** Wort, nie nur Farbe. Die **Staffel-Leiste** legt die Zeit zwischen den Zustandswechseln als Zeitachse aus, je Abschnitt eingefärbt nach Besitzer.
  - **Alles drei ist abgeleitet**, kein gespeichertes Feld: Phasen und Besitzer aus dem Zustand (`domain/batch-process.ts`), die Abschnitte aus den Zustands-Ereignissen im Audit (`domain/staffel.ts`). Ein zweiter Speicher würde von der Zustands-Achse abweichen, und dann gälte welcher?
  - Die Komponenten (`@/ui/v2`) kennen **kein Fachmodul**: sie bekommen Phasen, Besitzer und Abschnitte als Props. Sonst wäre das Prozessbild an den Stapel gefesselt und der nächste Prozess bekäme ein eigenes.
- Data type: `ui/v2/Prozessbild.tsx` (`ProzessMini`, `ProzessStepper`, `Staffelstab`, `StaffelLeiste`); Ableitungen in `modules/datev-export/domain/{batch-process,staffel}.ts`, Deckungstest gegen die Status-Achse `zyklus_stapel`.
- Example: „Zwei Tage Agent, neun Tage Warten auf den Mandanten, ein Tag Kanzlei" — die Staffel-Leiste zum August-Stapel.
- Notes: Erstmals an der Stapel-Seite (F119); gedacht für jede Achse mit Staffelstab-Charakter. Die Phasen-Zuordnung muss die Achse **vollständig** abdecken — ein Zustand ohne Phase fällt sonst still aus dem Bild.

### Prüf-Quittung (review check)

- English: `review check`
- German: **Prüf-Quittung**, „quittieren"
- Definition: Die festgehaltene Entscheidung „gesehen, passt" zu einem auffälligen, aber nicht falschen Befund der *Stapelabnahme*. Sie gilt für **den Prüfgegenstand in einem Monat**, nicht für einen Durchlauf — sonst wäre sie nach jedem Rücklauf weg und dieselbe Entscheidung müsste in jeder Runde neu getroffen werden.
  - **Nur Gelbes ist quittierbar.** Was der Server hart weiß (die MCP-Gates, der Freigabe-Guard), lässt sich nicht wegquittieren: was der Agent nicht passieren dürfte, darf die Kanzlei nicht durchwinken.
  - `value_hash` bindet die Quittung an den geprüften Wert. Ändert er sich, steht die Zeile wieder da — eine alte Quittung soll nichts stillschweigend durchwinken.
- Data type: table `ludwig.client_review_checks`, Schlüssel `(client_id, check_kind, subject_key, period)`; Kern `recordReviewCheck` / `withdrawReviewCheck` (`modules/stapelabnahme/application/review-checks.ts`); Katalog `domain/check-kinds.ts`, deckungsgleich mit dem CHECK der Migration.
- Example: „Kontenvergleich 6815 · 08/2026 quittiert von M. Vogt: Jahresrechnung Versicherung."
- Notes: `export_batch_id` und `agent_run_id` sind **Herkunft, kein Schlüssel** — sie sagen, in welchem Stapel und gegen welchen Stand quittiert wurde.

### Export status report (Export-Statusbericht)

- English: `export status report`
- German: `Export-Statusbericht`
- Definition: Macht die *Export marking* für einen Zeitraum sichtbar — welche Buchungen sind in DATEV, welche warten, was blockiert. Bucketet `client_journal_entry` (nach `booking_date`) in `exported` (`exported_at` gesetzt) · `exportable` (`accepted`, nie exportiert) · `pending` (`proposed`) · `reversed` (Storno bzw. `reverses_entry_id`) · `imported` (`posted`+`datev_import`, DATEV-Ist, informativ) mit Counts + Soll/Haben-Summen, plus die Batch-Historie (*export batch*).
- Data type: request-freier Kern `getDatevExportStatus(clientId, {from, to})` + `bucketExportStatus` (pur) + `listDatevExportBatches` in `apps/web/src/modules/datev-export/application/export-status-core.ts`; Adapter: Web-Panel (Review „5 · Abschluss") + CLI `scripts/datev-export.ts --status | --list-batches [--json]`. Kein MCP-Tool (Export bleibt menschlich).
- Notes: **Divergenz-Warnung** — ein Storno, dessen stornierte Buchung exportiert ist, der selbst aber noch nicht exportiert wurde, muss mit exportiert werden, sonst weicht Ludwig von DATEV ab. **Blockiert-Hinweis** — schlägt der Probe-Build (`previewDatevExport`) hart fehl (n:m-Split, WJ-Grenze), meldet der Bericht „blockiert" statt zu crashen.

### SKR variants — `skr03` / `skr04`

- English: *(kept as DATEV standard codes)*
- German: `SKR03`, `SKR04`
- Definition: DATEV standard chart-of-accounts variants (Standardkontenrahmen). SKR03 and SKR04 are the two common variants for German businesses; `custom` covers anything else.
- Data type: `ludwig.platform_clients.account_framework_code`, `ludwig.client_fiscal_years.account_framework_code` — text enum (`'skr03' | 'skr04' | 'custom'`).
- Example: `account_framework_code = 'skr04'` is typical for freelancers and small GmbHs.
- Notes: Proper nouns from DATEV — not to be translated. **Jahresgenerationen
  (F64-T64.5, 2026-08-07):** DATEV veröffentlicht pro Wirtschaftsjahr eine neue
  Fassung; `reference_account_framework_entries.valid_from_year` hält sie
  auseinander (im Unique-Key). Der Jahres-Seed ist ein **Append**, kein
  Overwrite. Leser holen sich die passende Fassung über
  `ludwig.reference_accounts_for_year(<code>, <wj-jahr>)` — je Konto die jüngste
  Generation mit `valid_from_year <= Jahr`, und falls es keine gibt (Buchung vor
  dem ersten Seed) die älteste vorhandene.

### VAT nature — `goods` / `expense`

- English: `goods`, `service`, `expense`, `mixed`, `unknown`
- German: `Ware`, `Dienstleistung`, `Aufwand`, `gemischt`, `unbekannt`
- Definition: Summary of what a creditor typically delivers — Subset von `Fund usage nature`. Used as a proposal hint during invoice ingest.
- Data type: `ludwig.client_business_partners.typical_nature` — text enum (Codomain ist die kanonische `FundUsageNature`, siehe `Fund usage nature`; der Creditor-Profiler emittiert in der Praxis nur `goods/service/expense/mixed/unknown`).
- Example: `typical_nature = 'expense'` for a telecom provider; `'goods'` for a parts supplier; `'service'` for a SaaS-Anbieter.
- Notes: *Renamed (2026-04-22):* `ware` → `goods`, `aufwand` → `expense`. *REQ-004 #8 (2026-05-22):* Codomain auf die kanonische `FundUsageNature` vereinheitlicht (Migration `20260522150000_unify_fund_usage_nature.sql`). Derived during client onboarding from historical bookings; re-derived when new bookings significantly shift the distribution.

## Candidate concepts not yet stabilized

These are real areas, but they are not stable enough to over-model yet.

### Ingestion lifecycle

- English: `ingestion lifecycle`
- German: `Ingestionslebenszyklus`
- Definition: The end-to-end flow from uploaded file to classified, extracted, and usable bookkeeping input.
- Notes: Do not fragment this into too many states until the operational flow is clearer.

### Accepted bookkeeping outcome

- English: `accepted bookkeeping outcome`
- German: `freigegebenes Buchhaltungsergebnis`
- Definition: A reviewed and accepted result derived from proposals and human decisions.
- Notes: This will likely become more formal later. Avoid introducing multiple competing names now.

### Review workflow state

- English: `review workflow state`
- German: `Prüfworkflow-Status`
- Definition: The lifecycle status of a reviewable item or run.
- Notes: Needs consistency across app workflows, contracts, and possible future audit tables.

### Transaction currency

- English: `transaction currency`
- German: `Transaktionswährung` / `Belegwährung`
- Definition: The currency in which the source document was issued. Stored on `client_source_docs_invoices.fx_currency`, `client_source_docs_invoice_lines.transaction_*_value`, and `client_journal_entry.fx_currency`. NULL means the document was already in EUR; the EUR fields then equal what the preprocessor extracted.
- Notes: Distinct from the `currency` column on the same rows, which always holds `EUR` after the FX-normalisation step. See "Local currency" and the FX-normalisation step in `apps/workflows/.../invoice_ingest_workflow.py`.

### Local currency

- English: `local currency`
- German: `Funktionalwährung` / `Hauswährung`
- Definition: The bookkeeping currency we keep ledgers in — fixed to `EUR` for now. Every `client_journal_entry_line.amount` and every `client_source_docs_invoices.invoice_total_value` is in local currency after the FX-normalisation step.
- Notes: Hard-coded today; the migration that introduces another local currency would touch `reference_fx_rates.target_currency` (currently always `'EUR'`).

### Devisenkassakurs / EZB-Referenzkurs

- English: `ECB reference rate`
- German: `EZB-Referenzkurs` / `Devisenkassakurs`
- Definition: The European Central Bank's daily mid-rate against EUR, published once per business day at ~16:00 CET via `eurofxref-daily.xml` (today) and `eurofxref-hist.xml` (historical archive). Persisted into `reference_fx_rates` by `FxRateService.refresh_ecb_rates()` and used by the FX-normalisation step to convert FW invoice amounts to EUR at the document's `invoice_date` (with a small weekend walk-back).
- Notes: HGB requires the Devisenkassakurs am Belegdatum für die Erstbuchung. Kursdifferenzen bei Zahlung und Bewertung am Bilanzstichtag sind separat (Backlog).

## Enum value catalog

Spalten mit DB-`CHECK`-Constraints, die kein eigenständiges Geschäftskonzept rechtfertigen, aber dokumentiert sein müssen, damit niemand sie aus dem Code raten muss. Die DB ist die Wahrheit — bei Drift hier nachziehen.

### Membership role

- English: `membership role`
- German: `Mitgliedschaftsrolle`
- Definition: Rolle eines Platform-Users innerhalb einer konkreten Mitgliedschaft (Tenant oder Client). Steuert UI-Berechtigungen, nicht Daten-RLS.
- Data type: text enum.
  - `ludwig.platform_tenant_users.role` ∈ `owner | admin | member`
  - `ludwig.platform_client_users.role` ∈ `owner | member`
- Example: `role = 'owner'` für den Kanzleigründer; `role = 'member'` für den Mitarbeiter, der nur seinen Mandantenstamm bearbeitet.
- Notes: Tenant-Mitgliedschaften kennen zusätzlich `admin` als Mittelstufe; Client-Mitgliedschaften nicht, weil ein Mandant in der Regel nur Owner und einfache Mitarbeiter unterscheidet.

### Membership status

- English: `membership status`
- German: `Mitgliedschaftsstatus`
- Definition: Lebenszyklusstatus einer User-Mitgliedschaft. Identische Wertemenge auf `platform_users.status`, `platform_tenant_users.status`, `platform_client_users.status`.
- Data type: text enum (`'active' | 'invited' | 'disabled'`).
- Example: Frisch eingeladener Stb-Mitarbeiter → `status = 'invited'`; nach Erstlogin → `'active'`; nach Austritt → `'disabled'`.
- Notes: `disabled` wird gegenüber Hard-Delete bevorzugt, damit historische Buchungen / Audit-Spuren ihren Bezug behalten.

### VAT period

- English: `vat period`
- German: `Umsatzsteuer-Voranmeldungszeitraum`
- Definition: Turnus der USt-Voranmeldung für einen Mandanten (laut §18 UStG). Treibt zukünftige Erinnerungs- und Aggregations-Workflows.
- Data type: `ludwig.platform_clients.vat_period` — text enum (`'monthly' | 'quarterly' | 'yearly'`), nullable.
- Example: Junge GmbH mit hohem USt-Aufkommen → `vat_period = 'monthly'`; etablierter Kleinbetrieb → `'quarterly'`; Kleinunternehmer §19 → `'yearly'` (oder `NULL`, falls nicht erhoben).

### Account number length

- English: `account number length`
- German: `Kontonummern-Stelligkeit`
- Definition: Mandantenspezifische Stelligkeit der Sachkonten (DATEV-Konvention). Beeinflusst Anzeige, Import-Validierung und die Allokation von System-Kreditorkonten.
- Data type: `ludwig.platform_clients.account_number_length` — int, Bereich `4..8`, nullable.
- Example: SKR04-Standard `account_number_length = 4` (Sachkonten 4-stellig, Personenkonten 5-stellig); großer Betrieb mit feiner Gliederung `= 6`.

### Fiscal year status

- English: `fiscal year status`
- German: `Wirtschaftsjahr-Status`
- Definition: Sperrstatus eines `FiscalYear`. `closed` → der Jahrgang ist immutable; keine neuen Buchungen, keine Änderungen, keine Beleg-Zuordnungen.
- Data type: `ludwig.client_fiscal_years.status` — text enum (`'open' | 'closed'`).
- Example: Laufendes Geschäftsjahr 2026 → `status = 'open'`; abgeschlossenes 2024 nach Jahresabschluss → `'closed'`.
- Notes: Das Schließen eines Jahrgangs ist eine bewusste Operator-Aktion. Nicht mit `FiscalYear.origin` verwechseln (Herkunft des Containers, nicht Sperrstatus).

### Ledger account source

- English: `ledger account source`
- German: `Kontoherkunft`
- Definition: Woher ein Sachkonto-Eintrag im Mandantenkontenrahmen stammt. `reference` ist seit F52-T52.3 der EINE Wert für „aus dem SKR-Referenz-Katalog aktiviert/materialisiert" (beide Pfade: `activate_ledger_account` im MCP-Agenten und der Legacy-Python-Materialisierer); `manual` meint echte Hand-Anlage.
- Data type: `ludwig.client_ledger_accounts.source` — text enum (`'imported' | 'system_allocated' | 'reference' | 'manual'`).
- Example: Aus historischem DATEV-Export migriert → `'imported'`; vom System neu angelegtes Kreditorkonto im Bereich 890000–899999 → `'system_allocated'`; vom Agenten aus dem SKR-Katalog aktiviert → `'reference'`; vom Operator angelegt → `'manual'`.

### Account number canon (Kontonummern-Kanon)

- English: `account number`
- German: `Kontonummer`
- Definition: In Ludwig-Tabellen steht überall die **logische DATEV-Nummer** als String (Owner-Entscheid 2026-08-01, F52-T52.9): Sachkonten mit Sachkontenlänge (SKL, `account_number_length`) Stellen, Personenkonten mit SKL+1. Die 9-stellige rechts-genullte Vollform der DATEVconnect-Stammdaten-/OPOS-Endpunkte (z.B. `721500000`) ist reine Draht-Serialisierung und existiert in Ludwig-Tabellen nicht. Speichern = Anzeigen = logische Nummer — es gibt keine separate Anzeigeform. Konvertierung ausschließlich über `apps/web/src/core/datev/account-number.ts` (fail-fast, nie still kürzen); die SKL kommt aus der SSOT `client_fiscal_years.account_number_length` (per WJ) mit Fallback `platform_clients.account_number_length` (`account-number-length.ts`), nie aus einem Literal.
- Data type: text/String überall (`account_number`, `account_number_snapshot`, `datev_account_number`, `personal_account`, `contra_account`, …) — SKR03-Konten wie `0420` tragen führende Nullen, nie numerisch casten.
- Example: DATEVconnect serialisiert `721500000`; gespeichert und angezeigt wird `72150` (SKL 4 → Personenkonto 5-stellig).

### Ledger account status

- English: `ledger account status`
- German: `Kontostatus`
- Definition: Aktiv/inaktiv-Status eines Sachkontos. `archived` blendet Konten in der Buchungsmaske aus, ohne historische Bezüge zu kappen.
- Data type: `ludwig.client_ledger_accounts.status` — text enum (`'active' | 'archived'`).
- Example: Konto „Bewirtungskosten 100 % abzugsfähig" wird durch eine Gesetzesänderung obsolet → `'archived'`; bestehende Buchungen referenzieren es weiter.

### Creditor source

- English: `creditor source`
- German: `Kreditorquelle`
- Definition: Woher ein `client_business_partners`-Eintrag entstand. Zusammen mit `onboarding_state` bildet das die Vertrauenskette für einen Geschäftspartner.
- Data type: `ludwig.client_business_partners.source` — text enum (`'invoice_match' | 'onboarding_import' | 'manual' | 'auto_profiled' | 'diverse_pool' | 'client_batch_import'`).
- Example: Beim Belegingest neu angelegt nach Profiling → `'auto_profiled'`; aus Onboarding-DATEV-Buchungen abgeleitet → `'onboarding_import'`; durch Operator manuell erfasst → `'manual'`; durch direkten Match auf vorhandenen Datensatz → `'invoice_match'`.

### Invoice line item source

- English: `invoice line item source`
- German: `Belegpositions-Herkunft`
- Definition: Woher eine Position einer Rechnung stammt. Trennt extrahierte Daten von Workflow-generierten Ersatzpositionen.
- Data type: `ludwig.client_invoice_line_items.source` — text enum (`'extracted' | 'virtual_fallback' | 'virtual_aggregate'`).
- Example: Aus dem PDF gelesene Position → `'extracted'`; eine virtuelle Einzelposition für Belege ohne erkennbare Items (z. B. Tankquittung) → `'virtual_fallback'`; eine zusammengefasste Aggregat-Position für gemischte Split-Belege → `'virtual_aggregate'`.
- Notes: Geschäftslogik im Booking-Modul soll für `virtual_*`-Positionen weniger streng auf Plausibilitätsprüfungen pochen.

### Fund usage nature

- English: `fund usage nature`
- German: `Mittelverwendungsart`
- Definition: Vom Interpreter geschätzte Natur einer Aufwandsposition. Kanonische Wertemenge (REQ-004 #8, 2026-05-22): `goods | service | expense | investment | mixed | unknown` (Pydantic-Typ `buchassi_shared.FundUsageNature`). `investment` bleibt **separat** von `goods`, weil Anlagengüter aktivierungspflichtig sind und auf eigene Konten (0xxx) gehen; `service` und `expense` differenzieren zwischen Dienstleistungs- und sonstigen Aufwendungen.
- Data type: `ludwig.client_invoice_line_items.fund_usage_nature` — text enum (`'goods' | 'service' | 'expense' | 'investment' | 'mixed' | 'unknown'`), nullable. Same codomain auf `client_business_partners.typical_nature` (Subset-Nutzung: der Creditor-Profiler emittiert in der Praxis nur `goods/service/expense/mixed/unknown` — `investment` ist eine Beleg-Achse, keine Lieferanten-Eigenschaft).
- Example: „MacBook Pro M4" → `fund_usage_nature = 'investment'` (Aktivierung als AfA-Gut, da > 800 € netto); „SaaS-Abo" → `'service'`; „Bürokaffee" → `'expense'`; „Verkaufsware Schrauben" → `'goods'`.
- Notes: Vor der Vereinheitlichung existierten drei parallele Definitionen — `interpreter FundUsageNature`, `interpreter CreditorTypicalNature`, `booking ServiceNature`. Sie sind 2026-05-22 alle Aliase auf `buchassi_shared.FundUsageNature` geworden (siehe Migration `20260522150000_unify_fund_usage_nature.sql`).

### Accounting subject

- English: `accounting subject`
- German: `Buchungsgegenstand`
- Definition: Vom Interpreter formulierter, fachlicher 1–2-Sätze-Text, der den Inhalt einer Rechnungsposition beschreibt — bei Ware das Produkt, bei Leistung die Verwendung, jeweils so geschrieben, dass das spätere Embedding das richtige SKR-Sachkonto trifft. Einzige primäre Quelle für den Embedding-Query gegen den Kontenrahmen; Fallback ist die rohe Zeilen-`description`.
- Data type: `ludwig.client_invoice_line_items.accounting_subject` — text, nullable (NULL bevor der Interpreter gelaufen ist).
- Example: Airport-Transfer-Beleg → `accounting_subject = 'Flughafentransfer per Auto, Bodentransport zum/vom Flughafen, Reisekosten Fahrtkosten'`. „MacBook Pro M4" → `'Notebook für Mitarbeiterausstattung — Anlagengut IT-Hardware'`.
- Notes: Ersetzt seit Migration `20260505120000` die Vorgänger-Felder `fund_usage_product_category` und `fund_usage_expense_purpose`. Der Mix dieser drei Konzepte (UI-Label, Mapping-Hint, Embedding-Quelle) in zwei Feldern führte zu Bugs wie „Airport Transfer → Versandkosten", weil bei `line_special_type='transport_cost'` das UI-Label „Versandkosten" als Embedding-Query gewählt wurde.

### Confidence band

- English: `confidence band`
- German: `Konfidenz-Band`
- Definition: 5-stufige Wortbezeichnung für eine Konfidenz in `[0, 1]`, parallel zum Float gehalten. LLMs sind in nackten Prozentwerten kalibrationsschwach — „mittel" liest sich für den Reviewer realistischer als „37 %". Schwellen: `sehr_niedrig <0.30`, `niedrig 0.30–0.50`, `mittel 0.50–0.70`, `hoch 0.70–0.85`, `sehr_hoch >0.85`.
- Data type: `buchassi_shared.ConfidenceBand` — Literal-Union; Helper `confidence_to_band(value: float) -> ConfidenceBand` ist der Single-Source-of-Truth für das Mapping.
- Example: `JudgeVerdict.confidence_band = 'mittel'` mit `confidence = 0.61`. `BookingProposal.overall_confidence_band` ist ein abgeleitetes `@computed_field` aus `overall_confidence` — bleibt nach `_apply_judge_response`-Mutation automatisch konsistent.
- Notes: Der Float bleibt parallel für Sortierung, Threshold-Logik (`AUTO_ACCEPT_CONFIDENCE_THRESHOLD`, `JUDGE_REVIEW_CONFIDENCE_CAP`) und gewichtete Aggregation. Das Band ist UI-nahes Etikett, der Float ist die Rechen-Größe.

### VAT profile source

- English: `vat profile source`
- German: `USt-Profil-Quelle`
- Definition: Herkunft des verwendeten `vat_profile`-Werts auf einer interpretierten Rechnung. Unterscheidet, ob das Profil aus dem Beleg selbst, dem Kreditorenstamm oder einem System-Default kommt.
- Data type: `ludwig.client_invoices.vat_profile_source` — text enum (`'extracted' | 'creditor' | 'default'`), nullable.
- Example: Beleg nennt explizit Reverse Charge → `'extracted'`; Beleg ohne USt-Hinweis, aber Kreditor ist `domestic_reverse_charge`-Profil → `'creditor'`; weder noch → `'default'` (Annahme `domestic_standard`).

### Payment status

- English: `payment status`
- German: `Zahlungsstatus`
- Definition: Vom Interpreter ermittelter Bezahlstatus einer Rechnung. Persistiert auf `client_invoices.payment_status` (vollständig denormalisiert).
- Data type: text enum (`'paid' | 'unpaid' | 'partially_paid' | 'unknown'`).
- Example: Beleg trägt „bereits per Lastschrift bezahlt" → `'paid'`; klassische Eingangsrechnung mit Zahlungsfrist → `'unpaid'`; Rechnung mit Anzahlungsabzug → `'partially_paid'`.
- Notes: Kein Ersatz für die tatsächliche Bank-Saldenabstimmung — das ist ein heuristisches Signal aus dem Beleg.

### Creditor match outcome

- English: `creditor match outcome`
- German: `Kreditormatch-Ergebnis`
- Definition: Ergebniskategorie des `creditor match`-Schritts (siehe entsprechenden Glossareintrag). Persistiert auf der interpretierten Rechnung.
- Data type: `ludwig.client_invoices.creditor_match_outcome` — text enum (`'confirmed' | 'candidates' | 'creditor_profiling'`), nullable.
- Example: USt-IdNr. matcht eindeutig auf bestehenden Kreditor → `'confirmed'`; Name/PLZ-Ähnlichkeit liefert mehrere → `'candidates'`; nichts gefunden, Profiling-Schritt läuft → `'creditor_profiling'`.

### Pipeline status

- English: `pipeline status`
- German: `Pipeline-Status`
- Definition: Laufzeitstatus *eines einzelnen Preprocessing-Laufs* auf `ops_invoice_extractions`. **Nicht** zu verwechseln mit dem belegseitigen `processing_status` auf `client_invoices` (Pipeline-Run-Achse für den Beleg als Ganzes — siehe *Invoice status fields*). Beide Spalten existieren parallel: `ops_invoice_extractions.pipeline_status` beschreibt den letzten OCR-Lauf, `client_invoices.processing_status` den Pipeline-Run für den Beleg insgesamt.
- Data type: `ludwig.ops_invoice_extractions.pipeline_status` — text enum (`'processing' | 'succeeded' | 'failed'`).
- Example: Azure Content Understanding läuft noch → `'processing'`; OCR + Strukturierung fertig → `'succeeded'`; OpenAI-Call timed out → `'failed'`.

### Upload state

- English: `upload state`
- German: `Upload-Status`
- Definition: Status eines `ops_stored_files`-Eintrags im zweistufigen Upload-Protokoll (Presigned-URL → Bestätigung).
- Data type: `ludwig.ops_stored_files.upload_state` — text enum (`'pending' | 'confirmed' | 'rejected' | 'expired'`).
- Example: Presigned-URL ausgegeben, Client lädt noch hoch → `'pending'`; Client meldet Erfolg → `'confirmed'`; Virenscan/Validierung schlägt fehl → `'rejected'`; Frist verstrichen ohne Confirm → `'expired'`.
- Notes: Nur `confirmed` ist gültiger Input für den Pipeline-Start.

### Validation finding severity

- English: `validation finding severity`
- German: `Prüfbefund-Schwere`
- Definition: Schweregrad eines automatischen Buchhaltungs-Prüfbefunds (z. B. „Bilanz unausgeglichen", „Konto existiert nicht im SKR").
- Data type: konzeptuell `'info' | 'warn' | 'block'`. **Die Trägertabelle `client_bookkeeping_validation_findings` wurde mit F49 WP11 gedroppt** (nie ein App-Writer, tote Tabelle); der Begriff bleibt als Schweregrad-Vokabular, hat aber aktuell keine eigene Persistenz.
- Example: USt-Differenz < 0,02 € → `'info'`; ungewöhnliches Konto, aber nicht falsch → `'warn'`; Soll/Haben-Summe stimmt nicht → `'block'` (verhindert Buchung).

### Bookkeeping entry status

- English: `bookkeeping entry status`
- German: `Buchungsstatus`
- Definition: Lebenszyklusstatus einer einzelnen Buchung, getrennt von `origin` (Herkunft).
- Data type: `ludwig.client_journal_entry.status` — text enum (`'proposed' | 'accepted' | 'posted' | 'reversed'`).
- Example: Vom Booking-Modul vorgeschlagen → `'proposed'`; vom Stb freigegeben → `'accepted'`; in DATEV exportiert/gebucht → `'posted'`; storniert → `'reversed'`.

### Bookkeeping entry origin

- English: `bookkeeping entry origin`
- German: `Buchungsherkunft`
- Definition: Audit-Feld, das festhält, wie eine Buchung entstanden ist.
- Data type: `ludwig.client_journal_entry.origin` — text enum (`'imported' | 'ai_proposed' | 'manual'`).
- Example: Aus DATEV-Export beim Onboarding eingeladen → `'imported'`; vom Booking-Modul generiert → `'ai_proposed'`; vom Operator selbst erfasst → `'manual'`.
- Notes: Nicht mit `FiscalYear.origin` (`imported | created`) verwechseln — andere Achse, anderes Objekt.

### Extraction log module

- English: `extraction log module`
- German: `Extraktions-Log-Modul`
- Definition: Welches stateless Modul einen Eintrag im Pipeline-Log erzeugt hat. Engere Liste als `Source module` (kein Bindestrich, ohne `-module`-Suffix), weil das Log früher entstand.
- Data type: `ludwig.ops_extraction_logs.module` — text enum (`'classifier' | 'preprocessor' | 'interpreter' | 'booking'`).
- Notes: Verwandt mit `Source module`, aber für Logs statt für `InvoiceLogEntry`/`ClarificationQuestion`. Nicht zusammenführen, ohne die jeweiligen Schreibpfade zu prüfen.

### DATEV mirror (DATEV-Spiegel)

- English: `DATEV mirror`
- German: `DATEV-Spiegel`
- Definition: Versionierter, **read-only** Abzug des DATEV-Stands neben Ludwigs Arbeits-Journal (`client_journal_entry`). Grundlage für den Abgleich vor jedem Buchungslauf (Phase 0.5). Klar getrennt von Ludwigs eigenen Buchungen.
- Data type: schema — Tabellen `ludwig.client_datev_snapshots`, `client_datev_mirror_entries`, `client_datev_open_items` (F21-T21.1).
- Notes: Der Journal-Satz im Spiegel ist die **Nebenbuch-Sicht** (Sammelkonto-Legs gedroppt), balanciert je Erfassungssatz — siehe `docs/reference/datev-api/journal-import.md`. Nie direkt vom Agenten beschrieben; der Import füllt ihn deterministisch.

### Snapshot (DATEV-Snapshot)

- English: `snapshot`
- German: `Snapshot` / `Abzug`
- Definition: Ein DATEV-Import-Lauf zu einem Stichtag (`as_of`) — trägt Datei-Manifest (SHA-256, inhaltsbasiert), Zähler, den Reconciliation-Report und das `baseline_level`. Idempotent: gleiches Datei-Set ⇒ vorhandene Snapshot-ID.
- Data type: entity (`ludwig.client_datev_snapshots` row).
- Notes: OPOS-Restbeträge sind stichtagsbezogen und hängen daher am Snapshot; Mirror-Sätze werden über `first_seen`/`last_seen`-Snapshot verfolgt (Delta + verschwundene Sätze).

### Reconciliation (Abgleich)

- English: `reconciliation`
- German: `Abgleich`
- Definition: Der deterministische Vergleich DATEV-Spiegel ↔ Ludwig direkt im Import-Lauf (Python, kein LLM): Match-Kaskade je Mirror-Satz (primär `LudwigAI-Sachverhalt`) + OPOS-Abgleich. Ergebnis: `match_state` am Satz + Case-Hints im Report.
- Data type: workflow step (F21-T21.3) + `client_datev_mirror_entries.match_state` (`matched_ludwig | matched_split | matched_corrected | new_unprocessed | unclear | disappeared | disappeared_committed`) + `client_datev_snapshots.reconciliation_report`.
- Notes: `list_reconciliation_items` ist eine Query auf `match_state`, keine eigene Tabelle. Baseline für den Monatslauf: Snapshot frisch + `unclear` leer/adressiert + Case-Hints abgearbeitet.

### Mengengerüst

- English: `volume comparison`
- German: **Mengengerüst**
- Definition: Elf Zeilen in *Schritt 1* der *Stapelabnahme*, die den laufenden Monat gegen den Schnitt der drei Vormonate stellen — **Beträge und Stückzahlen**: Eingangsbelege, Ausgangsrechnungen, Kassenbelege, Bank-Umsätze je Konto, Buchungssätze, Σ Aufwand · Erlöse · Vorsteuer · Umsatzsteuer, bebuchte Sachkonten, Gegenparteien mit Bewegung.
- Data type: Aggregation in `modules/stapelabnahme/application/mengengeruest.ts`; Bewertung über `domain/vergleich.ts`, Quittung `check_kind='volume_row'`.
- Notes: Beides, weil eine halbierte Belegzahl bei gleicher Summe ein anderer Befund ist als umgekehrt. Vor dem Ludwig-Start gibt es keine Historie — solche Zeilen sagen „zu jung", nicht „unauffällig". Gegenstück je Konto ist der *Kontenvergleich* in Schritt 6.

### Abgleichliste

- English: `coverage list`
- German: **Abgleichliste**
- Definition: Die Vollliste eines Bestands mit zwei Häkchen je Zeile — *zugeordnet* und *gebucht*. In *Schritt 1* für Belege und Bankzeilen: nicht nur was fehlt, sondern alles, damit sichtbar ist, wovon die Ausnahmen Ausnahmen sind.
- Notes: Ausnahmen stehen oben, Erledigtes darunter. Nicht zu verwechseln mit dem *Abgleich* (DATEV-Spiegel ↔ Ludwig), der einem anderen Zweck dient.

### Zone

- English: `zone`
- German: **Zone**
- Definition: Ein Kontext-Block am Sachverhalt in *Schritt 3* der *Stapelabnahme*. Sieben Stück: Sachverhalt · Gegenpartei · Beleg & USt · Zahlung · Regel & Periode · Notizen · Danach.
- Notes: Jede Zone beantwortet „warum steht dieser Vorschlag hier?" aus einer anderen Richtung. Ohne sie muss die Prüferin für jede Entscheidung die Seite wechseln — und genau das kostet die Zeit, die das Review sparen soll. „Danach" ist reine Ableitung: was bleibt offen, wenn ich jetzt übernehme?

## How to extend this file

When adding a new concept, use this template:

```md
### Concept name

- English: `canonical english term`
- German: `kanonischer deutscher Begriff`
- Definition: Short explanation.
- Data type: entity (`schema.table` row) / enum value / text column / concept / schema / workflow step.
- Example: Concrete instance, enum value, or short JSON-like illustration.
- Notes: Boundaries, ownership, confusion with similar concepts, and naming cautions. Include *Previously: …* when renaming.
```
