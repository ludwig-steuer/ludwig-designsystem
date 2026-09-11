# Erhebung: Erwartungen am Sachverhalt (`client_accounting_case_expectation`)

| | |
|---|---|
| Datum | 2026-09-11 |
| Staging-Stand | Pooler 6543, Abfrage 2026-09-11 08:00 UTC, **135 Zeilen** an 132 Sachverhalten, 6 Mandanten, angelegt 2026-08-01 … 2026-09-09 |
| Code-Stand | `staging` @ `46d976cb` |
| Domain | `apps/web/src/modules/accounting-cases/domain/expectation.ts` (Typen, `ExpectationRow`), `domain/case.ts` (`EXPECTATION_KINDS`, `EXPECTATION_MATURITY`, `expectationMaturity()`) |
| Kern | `application/expectation-core.ts` (1 393 Z.), `application/expectation-actions.ts` (63 Z.), `application/match-expected-invoices.ts` |
| Registry | `ui/status/status-registry.ts` — Achsen `erwartung` (Reife) und `erwartung_art` |
| DS | `packages/designsystem/src/ui/v3/entities/expectation/Expectation.tsx` (Chip + Zeile, 0025); **kein Entitätsprofil** unter `docs/entitaeten/` |
| Art | nur `SELECT`, nur Aggregate, keine Kundendaten |

## Kurzfassung

135 Erwartungen, davon **92 Zahlungen** (aus Buchungen, `origin_journal_entry_id`) und **43 Belege** (vom Agenten per `expect_document`). 119 offen, 16 erledigt. **94 der 119 offenen sind überfällig** (p50 39 Tage, max 99), aber nur **1** ist eskaliert — die Eskalation läuft nur im Vorbereitungslauf. 72 offene Zahlungserwartungen hängen an bereits **abgeschlossenen** Sachverhalten (`closed_accepted`). Erledigt wird fast nur maschinell (`matched` 14, davon 12 ohne Ereignis-Verweis); von Hand 2 — beide vom Agenten, kein einziger Klick einer Nutzerin im Audit. `matched` schreibt in den Sweep-Pfaden **kein** Audit. `matching`-Notiz (`note`) nur bei Belegen (23/43), nie bei Zahlungen.

---

## (a) Füllgrad je Spalte (135 Zeilen)

| Spalte | gesetzt / 135 | Verteilung / Kennzahl | Bemerkung |
|---|---|---|---|
| `kind` | 135 (NOT NULL) | `payment` 92 · `document` 43 | Registry-Achse `erwartung_art` |
| `direction` | 135 (NOT NULL) | `outgoing` 82 · `incoming` 53 | Beleg-Erwartungen sind per Kern immer `incoming` |
| `expected_document_kind` | 43 | `invoice` 28 · `receipt` 8 · `contract` 3 · `statement` 3 · `other` 1 · NULL 92 (alle Zahlungen) | Labels `EXPECTED_DOC_KIND_LABEL` (Kern) **und** `KIND_LABEL` (FehltPanel) — zwei Maps |
| `expected_counterparty_name` (Adressat/Gegenpartei) | 115 | Länge p50 16 · max 49; Beleg 39/43, Zahlung 76/92 | |
| `expected_counterparty_partner_id` | 76 | Beleg **0**/43, Zahlung 76/92 | `expect_document` reicht keine Partner-Id durch |
| `expected_amount` (Betrag) | 133 | Beleg 41/43, Zahlung 92/92; p50 168 € (Beleg) / 197 € (Zahlung), p90 ≈ 1 800 / 1 990 €, max 20 057 / 20 000 € | Pflicht für jeden Treffer im Matcher |
| `expected_date` | 121 | Beleg 29/43, Zahlung 92/92 | Identifikationsmerkmal, nicht die Frist |
| `expected_reference` | 109 | Länge p50 9 · max 41; Beleg 27, Zahlung 82 | Rechnungsnummer |
| `due_date` (Frist) | 135 (NOT NULL) | Frist **vor** Anlagedatum: Beleg 19/43, Zahlung **75/92**; Vorlauf p50 −14 Tage, min −68, max +128 | Zahlungserwartungen entstehen beim Buchen oft für längst fällige Rechnungen |
| `due_source` (Fristquelle) | 135 (NOT NULL) | `client_default` 66 (alle 43 Belege + 23 Zahlungen) · `invoice_due_date` 50 · `payment_term` 19 | Beleg-Erwartungen haben nie eine Belegfrist — der Kern rechnet `heute + Mandanten-Zahlungsziel` |
| `audience` (Adressat der Beschaffung) | 135 (NOT NULL) | `accounting` 121 · `client` 14 (13 an offenen Belegen, 1 an einer erledigten Zahlung) | Nur für `document` gedacht; eine Zahlungserwartung trägt trotzdem `client` |
| `escalation_level` (Eskalationsstufe) | 135 (NOT NULL) | `0` 134 · `1` 1 · (`2`, `3` kommen nicht vor) | CHECK 0..3 |
| `escalated_at` (Eskalationsdatum) | 1 | | |
| `resolved_at` | 16 | Erledigungsdauer p50 0 Tage, max 1; 14 am selben Tag | |
| `resolution` (Grund) | 16 | `matched` 14 · `manual` 2 · `obsolete` **0** · NULL 119 | CHECK-Paar mit `resolved_at` |
| `resolved_by_event_id` (erfüllende Zahlung/Beleg) | **2** von 16 erledigten | `matched`: 2 mit Ereignis (1 `payment_in`, 1 `document_received`), 12 ohne; `manual`: 0 | 86 % der Auflösungen nennen kein erfüllendes Ereignis |
| `origin_journal_entry_id` | 89 | Zahlung 89/92, Beleg 0/43 | 3 Zahlungserwartungen ohne erzeugende Buchung |
| `clarification_id` | **0** | | Unique-Index existiert, Verknüpfung wird nie geschrieben |
| `note` (Freitext) | 23 | Länge p50 80 · max 307; nur Belege (23/43) | |
| `agent_run_id` | 27 | alle an Belegen (27/43); Zahlungen 0 | |

---

## (b) Erwartungen je Fall

| Kennzahl | Wert |
|---|---|
| Sachverhalte gesamt / mit Erwartung / mit offener | 1 222 / 132 (10,8 %) / 118 |
| Erwartungen je Fall (alle) | p50 **1** · p90 1 · max **2** |
| gleichzeitig offene je Fall | p50 **1** · max **2** |
| Art des Elternfalls | `incoming_invoice` 108 · `outgoing_invoice` 11 · `recurring_charge` 11 · `expense_report` 3 · `internal_transfer` 2 |
| Verteilung auf Mandanten (Rang → n) | 78 · 25 · 17 · 7 · 5 · 3 |
| Entstehung nach Woche | Belege ab KW 2026-07-27 (5, 7, 4, 10, 17); Zahlungen praktisch erst seit KW 2026-08-31 (18) und **KW 2026-09-07 (73)** — der Zahlungs-Erzeuger ist neu |

Ein Fall trägt fast nie mehr als eine Erwartung; die Idempotenz in `createExpectation` (Fall + Art + Richtung + Betrag) verhindert Dubletten.

---

## (c) Lebenszyklus mit Zahlen

Reife nach `expectationMaturity()` (`domain/case.ts`): `resolved` wenn `resolved_at` · sonst `escalated` wenn `escalation_level > 0` · sonst `due` wenn `due_date < heute` · sonst `pending`. Berechnet, nie gespeichert.

| Art | pending („Läuft") | due („Fällig") | escalated („Eskaliert") | resolved („Erledigt") | überfällig p50 / max (Tage) |
|---|---|---|---|---|---|
| `document` | 17 | 22 | **1** (12 Tage) | 3 | 41 / 99 |
| `payment` | 8 | 71 | 0 | 13 | 39 / 70 |
| **gesamt** | **25** | **93** | **1** | **16** | 39 / 99 |

Offen 119 · erledigt 16 · aufgehoben (`obsolete`) **0** · überfällig 94 (79 % der offenen).

**Elternfall der offenen Erwartungen:** `document` → `waiting_for_documents` 27 · `closed_accepted` 10 · `needs_clarification` 2 · `open` 1. `payment` → **`closed_accepted` 72** · `open` 7. Ein Rechnungs-Sachverhalt schließt beim Buchen (S18), seine Zahlungserwartung bleibt offen — so gewollt; 59 der 79 offenen Zahlungserwartungen hängen an einer freigegebenen Buchung.

**Wer erledigt (aus `resolution`, `resolved_by_event_id`, `platform_audit_events`):**

| Weg | Anzahl | Spur |
|---|---|---|
| Abgleich durch Ereignis mit Verweis (`matched` + Event) | 2 | 1 `payment_in`, 1 `document_received`; **kein Audit-Eintrag** (`recordExpectationResolved` hat 0 Zeilen, `actor_kind='system'` kommt nicht vor) |
| Abgleich ohne Ereignis-Verweis (`matched`, Event NULL) | 12 | Sweep-Pfade `settleCaseExpectations` / `sweepSettledExpectations` / `resolveSettledPaymentExpectations` (Saldo auf Belegnummer, F207) — sie schreiben weder `resolved_by_event_id` (außer beim Annahme-Pfad) noch Audit |
| Von Hand (`manual`) | 2 | Audit `case.expectation_resolved`, **beide `actor_kind='agent'`** (Tool `resolve_expectation`) |
| Nutzerin (Buttons „Erledigt"/„Aufheben") | **0** | kein Audit mit `actor_kind='user'` |
| gegenstandslos (`obsolete`) | 0 | |
| Eskalation | 1 Zeile, Stufe 1 | `escalateOverdueExpectations` im Vorbereitungslauf (`prepare-accounting-month-core.ts:276`), idempotent je Lauf-Tag, kein Cron |

Audit gesamt: `case.expectation_opened` 41 (alle `agent`; Payload `expectationId, kind, audience, counterpartyName, amount, documentDate, reference, note, rationale, skipped`), `case.expectation_resolved` 2 (`expectationId, resolution, rationale`). Zahlungserwartungen (`ensurePaymentExpectationForBooking`) hinterlassen **keinen** Audit-Eintrag.

---

## (d) Wörter und Aktionen der App

### Registry-Achsen (`ui/status/status-registry.ts`)

| Achse | Wert | Label | Kind | Description |
|---|---|---|---|---|
| `erwartung` (Titel „Reife") | `pending` | Läuft | neutral | Die Frist läuft noch — normaler Lauf der Dinge, keine Arbeit. |
| | `due` | Fällig | warning | Die Frist ist verstrichen. Der Sachverhalt zählt wieder als offene Arbeit. |
| | `escalated` | Eskaliert | danger | Mehrfach überfällig — ein Vorbereitungslauf hat sie hochgestuft. |
| | `resolved` | Erledigt | success | Durch ein Ereignis aufgelöst: der Beleg kam an bzw. die Zahlung ging ein. |
| `erwartung_art` (Titel „Erwartet") | `document` | Beleg fehlt | warning | Zu diesem Sachverhalt fehlt noch ein Beleg. |
| | `payment` | Zahlung offen | info | Die Buchung steht, die Zahlung ist noch nicht eingegangen bzw. geleistet. |

Registry-Kommentar-Fallstricke: `escalated` ist Ludwigs Reife, nicht die DATEV-Mahnstufe; hochgestuft wird in Läufen, nicht in Kalendertagen; `pending` entlastet das Buch-Gate, `due`/`escalated` nicht.

**Ohne Achse (freie Wörter im Code):** `due_source` (`invoice_due_date`/`payment_term`/`client_default` — im Stapelabnahme-Modell roh als `fristQuelle`), `audience` (FehltPanel: „besorgt der Mandant / die Kanzlei"; DS: „Nachforderung" vs. „Erwartung"), `resolution` (`matched`/`manual`/`obsolete` — nur in Button-Tooltips), `escalation_level` (Zahl), `direction`. `FehltPanel` hält eine eigene `MATURITY_LABEL`-Map („Frist läuft / überfällig / mehrfach überfällig / erledigt"), die von der Achse abweicht („Läuft / Fällig / Eskaliert / Erledigt").

### Aktionen

| Aktion | Wer | Datei · Funktion | Was passiert |
|---|---|---|---|
| **Beleg nachfordern** (anlegen) | Agent (MCP) | `agent-tool-registry.ts` Tool `expect_document` → `expectation-core.ts` `openDocumentExpectation(input, actor)` | Pflicht: ≥ 1 Identifikationsmerkmal; Frist vom Server (`deriveDueDate`: Belegfrist → Zahlungsziel-Text → Mandanten-Default); `audience` Default `accounting`; setzt `lifecycle_status = waiting_for_documents` (außer `needs_clarification`); Audit `case.expectation_opened`. **Kein UI-Weg zum Anlegen** — die Sachbearbeiterin kann keine Erwartung eröffnen |
| **Zahlung erwarten** (anlegen) | Server bei jeder Buchung mit Personenkonto | `expectation-core.ts` `ensurePaymentExpectationForBooking({caseId, journalEntryId})`, Aufrufer `agent-booking-core.ts:2191`, `booking-actions.ts:311` | Vorzeichen auf Debitor/Kreditor entscheidet Richtung; fail-safe (wirft nie); kein Audit |
| **Erledigen** (`manual`) / **Aufheben** (`obsolete`) | Kanzlei | `ui/sachverhalt/FehltPanel.tsx` Buttons „Erledigt" / „Aufheben" → `expectation-actions.ts` `resolveExpectationAction({expectationId, resolution, reason?})` → `resolveExpectationByHuman` | Standard-Rationale „Von der Kanzlei als erledigt markiert." / „… als gegenstandslos aufgehoben."; `recomputeCaseLifecycle`; Audit `case.expectation_resolved`; kein Begründungsfeld im UI (Schema erlaubt `reason`, Panel sendet keins) |
| dito | Agent | Tool `resolve_expectation` → `resolveExpectationByHuman(…, AGENT_ACTOR)` | |
| **Hochladen** (der Weg, der auflöst) | Kanzlei | `FehltPanel` → `CaseAttachDocumentButton` („<Belegart> hochladen") → Ingest → `agent-ingest-core.ts:1699/2213` `settleDocumentExpectation({caseId, sourceDocId, expectationId?})` | genau eine offene Beleg-Erwartung → `matched` mit `document_received`-Event; mehrere → nichts geschrieben, Kandidaten zurück („Heuristik vorlegen, nicht stempeln") |
| **Abgleich Beleg ↔ Erwartung** | Server | `matchExpectations` / `matchAgainstExpectations` (Betrag Pflicht + ≥ 1 aus Geschäftspartner/Gegenpartei/Referenz ≥ 5 Zeichen/Datumsfenster; genau ein Treffer schreibt), Ingest (`agent-ingest-core.ts:2429`) und Nachlauf `matchOpenExpectations` (`prepare-accounting-month-core.ts:231`) | Audit via `recordExpectationResolved` (`via: ingest/prepare/bank_import`) — im Bestand 0 Zeilen |
| **Abgleich Zahlung ↔ Erwartung** | Server | `settleCaseExpectations` (Bankzeile zugeordnet, `agent-ingest-core.ts:533/922`), `sweepSettledExpectations` (Vorbereitungslauf), `resolveSettledPaymentExpectations` (F207, Saldo auf Belegnummer = 0 über Ludwig + DATEV-Spiegel; bei Annahme `booking-actions.ts:320`, `close-actions.ts:119`, und `"all"` im Lauf) | `matched`, meist ohne `resolved_by_event_id`, ohne Audit |
| **Eskalieren** | Server (Lauf) | `escalateOverdueExpectations(clientId)` in `prepare-accounting-month-core.ts:276` | `escalation_level + 1` (max 3), `escalated_at = now()`, einmal je Tag |
| **Nachfordern beim Mandanten** (Mail) | Kanzlei | `ui/DocumentRequestMailPanel.tsx` ← `document-request-report-core.ts` (`listDocumentExpectations` + `payment_out`-Events ohne Beleg) → Mail-Textblock | kein „angefordert"-Zustand an der Erwartung; Versand nur als Audit am Mandanten |
| **Lesen** | Agent | Tool `list_document_expectations` → `agent-reads-core.ts` `listDocumentExpectations(clientId, year?)` (mit `overdue`, `overdueDays`, `escalationLevel`, `audience`) | nur Belege |
| **Lesen** | Kanzlei | Fall-Detail: `page.tsx:189` `listCaseExpectations(caseId)`, **gefiltert auf `kind === "document"`** (`page.tsx:195`) → `SachverhaltScreen` → `FehltPanel`; Zahlungserwartungen sind auf der Fallseite **nicht** sichtbar · Stapelabnahme Schritt 5 `offene-posten.ts` (`listOpenExpectations(kind:'payment')` → „Wer schuldet wem?", Spalten Gegenpartei, Betrag, fällig, Fristquelle, überfällig/Tage, Stufe, Richtung, Wiedervorlage) · Rail-Zähler `rail-status.ts:80` (`onlyOverdue` Zahlungen) | |

### UI heute (`FehltPanel.tsx`, 184 Z., handgeschrieben, kein DS-Baustein)

Karte „Fehlt (n)" mit Meta „wird durch den Beleg-Eingang erledigt, nicht durch eine Antwort"; je Erwartung: „<Belegart> fehlt", Fakten `Gegenpartei · Betrag · Datum · Nr.`, `note`, Zeile „erbeten bis <Frist> · <Reife-Wort> · besorgt der Mandant / die Kanzlei", Buttons „<Belegart> hochladen", „Erledigt", „Aufheben". Kein `StatusBadge` (die Achse `erwartung` wird im Panel nicht benutzt), keine Eskalationsstufe als Zahl, keine Fristquelle, kein `resolved`-Fall (Panel zeigt nur offene). Der DS-Baustein `Expectation` (Chip + Zeile, 0025) hat in `apps/web` **keinen Aufrufer**.

---

## Befunde (Vorschlag)

1. **Nutzerinnen erledigen nie** — 0 Audit-Zeilen mit `actor_kind='user'`; die 2 `manual` sind Agent-Klicks. Entweder ist der Weg unsichtbar (Zahlungserwartungen fehlen auf der Fallseite ganz) oder unnötig.
2. **Eskalation greift nicht**: 94 überfällig, 1 eskaliert — die Stufe hängt am Vorbereitungslauf. Die Achse `erwartung` zeigt damit fast nur „Fällig".
3. **Auflösung ohne Spur**: 12 von 14 `matched` ohne `resolved_by_event_id`, 14 von 14 ohne Audit; `recordExpectationResolved` ist im Bestand nie gelaufen.
4. **Zwei Reife-Wortlisten** (`MATURITY_LABEL` im Panel vs. Registry-Achse) und **zwei Belegart-Maps** (`EXPECTED_DOC_KIND_LABEL`, `KIND_LABEL`).
5. `due_source`, `audience`, `resolution`, `escalation_level` haben keine Achse und keine gemeinsame Wortliste; `fristQuelle` steht roh im Stapelabnahme-Modell.
6. 72 offene Zahlungserwartungen an `closed_accepted`-Fällen — fachlich gewollt (S18), aber die Fallseite zeigt sie nicht; sichtbar nur in Schritt 5 der Abnahme.
7. `clarification_id` (0/135) und `obsolete` (0) sind ungenutzt; `expect_document` reicht keine `counterpartyPartnerId` durch (0/43 Belege mit Partner).
8. Frist der Beleg-Erwartung ist immer `client_default` ab Anlagetag — bei 19/43 liegt sie trotzdem vor dem Anlagedatum (`expected_date` als Bezug), also entstehen Erwartungen bereits überfällig.

---

## Anhang: benutzte Queries (alle `SELECT`, Schema `ludwig`, Pooler 6543)

```sql
set search_path = ludwig;

-- Bestand
select now(), count(*), count(distinct case_id), count(distinct client_id), min(created_at)::date, max(created_at)::date
from client_accounting_case_expectation;

-- Enum-Verteilungen
select 'kind', kind, count(*) from client_accounting_case_expectation group by 2
union all select 'direction', direction, count(*) from client_accounting_case_expectation group by 2
union all select 'expected_document_kind', coalesce(expected_document_kind,'NULL'), count(*) from client_accounting_case_expectation group by 2
union all select 'due_source', due_source, count(*) from client_accounting_case_expectation group by 2
union all select 'audience', audience, count(*) from client_accounting_case_expectation group by 2
union all select 'escalation_level', escalation_level::text, count(*) from client_accounting_case_expectation group by 2
union all select 'resolution', coalesce(resolution,'NULL (offen)'), count(*) from client_accounting_case_expectation group by 2;

-- Füllgrade + Freitext-Längen
select count(*),
  count(expected_counterparty_name), percentile_cont(0.5) within group (order by length(expected_counterparty_name)), max(length(expected_counterparty_name)),
  count(expected_counterparty_partner_id),
  count(expected_amount), percentile_cont(0.5) within group (order by expected_amount), max(expected_amount),
  count(expected_date), count(expected_reference), percentile_cont(0.5) within group (order by length(expected_reference)), max(length(expected_reference)),
  count(due_date), count(escalated_at), count(*) filter (where escalation_level > 0),
  count(resolved_at), count(resolved_by_event_id), count(origin_journal_entry_id), count(clarification_id),
  count(note), percentile_cont(0.5) within group (order by length(note)), max(length(note)),
  count(agent_run_id)
from client_accounting_case_expectation;

select kind, percentile_cont(0.5) within group (order by expected_amount), percentile_cont(0.9) within group (order by expected_amount),
       max(expected_amount), count(expected_amount), count(*) from client_accounting_case_expectation group by 1;
select kind, count(expected_counterparty_name), count(expected_counterparty_partner_id), count(expected_date),
       count(expected_reference), count(note), count(*) from client_accounting_case_expectation group by 1;
select kind, resolution, count(*) filter (where origin_journal_entry_id is not null), count(*) filter (where agent_run_id is not null),
       count(*) filter (where clarification_id is not null), count(*) filter (where note is not null)
from client_accounting_case_expectation group by 1,2;
select due_source, kind, count(*) from client_accounting_case_expectation group by 1,2;
select kind, count(*) filter (where due_date < created_at::date), count(*) filter (where due_date >= created_at::date)
from client_accounting_case_expectation group by 1;
select percentile_cont(0.5) within group (order by (due_date - created_at::date)), min(due_date - created_at::date), max(due_date - created_at::date)
from client_accounting_case_expectation;

-- Auflösung
select resolution, count(*) filter (where resolved_by_event_id is not null), count(*) filter (where resolved_by_event_id is null)
from client_accounting_case_expectation where resolved_at is not null group by 1;
select e.kind, ev.kind, count(*) from client_accounting_case_expectation e
join client_accounting_event ev on ev.id = e.resolved_by_event_id group by 1,2;
select percentile_cont(0.5) within group (order by (resolved_at::date - created_at::date)), max(resolved_at::date - created_at::date),
       count(*) filter (where resolved_at::date - created_at::date <= 0)
from client_accounting_case_expectation where resolved_at is not null;

-- Je Fall
select percentile_cont(0.5) within group (order by n), percentile_cont(0.9) within group (order by n), max(n), count(*)
from (select case_id, count(*) n from client_accounting_case_expectation group by 1) t;
select percentile_cont(0.5) within group (order by n), max(n)
from (select case_id, count(*) n from client_accounting_case_expectation where resolved_at is null group by 1) t;
select (select count(*) from client_accounting_case),
       (select count(*) from client_accounting_case c where exists (select 1 from client_accounting_case_expectation e where e.case_id = c.id)),
       (select count(*) from client_accounting_case c where exists (select 1 from client_accounting_case_expectation e where e.case_id = c.id and e.resolved_at is null));
select c.kind, count(*) from client_accounting_case_expectation e join client_accounting_case c on c.id = e.case_id group by 1;
select dense_rank() over (order by count(*) desc), count(*) from client_accounting_case_expectation group by client_id;
select date_trunc('week', created_at)::date, kind, count(*) from client_accounting_case_expectation group by 1,2 order by 1,2;

-- Lebenszyklus / Reife
select count(*) filter (where resolved_at is null), count(*) filter (where resolved_at is null and due_date < current_date),
       count(*) filter (where resolved_at is null and due_date >= current_date),
       percentile_cont(0.5) within group (order by (current_date - due_date)) filter (where resolved_at is null and due_date < current_date),
       max(current_date - due_date) filter (where resolved_at is null and due_date < current_date)
from client_accounting_case_expectation;
select kind,
       case when resolved_at is not null then 'resolved' when escalation_level > 0 then 'escalated'
            when due_date < current_date then 'due' else 'pending' end,
       count(*),
       percentile_cont(0.5) within group (order by (current_date - due_date)) filter (where resolved_at is null and due_date < current_date),
       max(current_date - due_date) filter (where resolved_at is null and due_date < current_date)
from client_accounting_case_expectation group by 1,2;
select e.kind, c.lifecycle_status, count(*) from client_accounting_case_expectation e
join client_accounting_case c on c.id = e.case_id where e.resolved_at is null group by 1,2;
select count(*) from client_accounting_case_expectation e
where kind = 'payment' and resolved_at is null
  and exists (select 1 from client_journal_entry je where je.id = e.origin_journal_entry_id and je.status in ('accepted','posted'));

-- Audit
select action, actor_kind, count(*) from platform_audit_events where action ilike '%expect%' group by 1,2;
select action, string_agg(distinct k, ',') from platform_audit_events a, jsonb_object_keys(a.payload) k
where action ilike '%expect%' group by 1;
```

Schema-Einsicht: `\d ludwig.client_accounting_case_expectation`; `information_schema.columns` für `platform_audit_events`.
