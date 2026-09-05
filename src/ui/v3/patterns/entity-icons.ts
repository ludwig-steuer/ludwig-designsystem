/**
 * Achse → Icon/Label.
 *
 * Icons gibt es NUR für die drei Haupt-Entitäten der Datenmodell-Kette; sie
 * spiegeln die Main-Navigation (`ui/components/layout/Sidebar.tsx`). So
 * erkennt der Nutzer am Badge sofort, auf welche Entität sich ein Status
 * bezieht.
 *
 * Welches Zeichen eine Entität trägt, steht nicht hier, sondern in der
 * Icon-Registry (`Icons.tsx`). Diese Datei sagt nur, welche Achse welche
 * Entität meint (`AXIS_ENTITY`); das Zeichen fällt daraus ab.
 *
 * Alle übrigen Achsen (Auftrag, Konto, Zugang, …) haben bewusst kein Icon —
 * sie stehen ohnehin in einem Kontext, der die Entität nennt (Spaltenkopf,
 * Abschnitt), und ein zweites Symbol stiftete nur Unruhe. `StatusBadge`
 * rendert deshalb einfach keins, wenn hier nichts steht.
 */
import type { EntityKey } from "../Icons";
import type { EntityType, StatusAxis } from "@/ludwig/ui/status/status-registry";

/** Welche Achse benennt welche Entität — der Schlüssel in die Icon-Registry. */
export const AXIS_ENTITY: Partial<Record<StatusAxis, EntityKey>> = {
  beleg: "source-document",
  sachverhalt: "accounting-case",
  buchung: "journal-entry",
};



/**
 * Klartext-Name der Achse. Führt den Tooltip an („Sachverhalt · Klärung
 * offen · …"), damit ein Status nie ohne seinen Bezug dasteht — dieselbe
 * Farbe bedeutet je nach Achse etwas anderes.
 */
export const AXIS_LABEL: Record<StatusAxis, string> = {
  beleg: "Beleg",
  beleg_stage: "Verarbeitungsstufe",
  beleg_inbox: "Dokument",
  beleg_kategorie: "Belegkategorie",
  dokumentgruppe: "Art der Dokumentgruppe",
  beleg_richtung: "Belegrichtung",
  beleg_erledigung: "Erledigung",
  job: "Auftrag",
  upload: "Upload",
  dispatch: "Stapellauf",
  sachverhalt: "Sachverhalt",
  belegnummern_modus: "Belegnummern-Modus",
  ereignis: "Buchung (Ereignis)",
  disposition: "Zuständig",
  klaerung: "Rückfrage",
  klaerung_status: "Stand",
  klaerung_typ: "Art",
  erwartung: "Reife",
  erwartung_art: "Erwartet",
  triage: "Prüfempfehlung",
  buchung: "Buchung",
  buchung_datev: "Weg nach DATEV",
  buchung_origin: "Herkunft",
  konfidenz: "Sicherheit",
  judge: "Judge",
  export_case: "DATEV-Export",
  export_bucket: "DATEV-Export",
  lauf: "Buchungslauf",
  lauf_gate: "Gate",
  partner: "Geschäftspartner",
  konto: "Konto",
  konto_datev_sync: "DATEV-Sync",
  konto_typ: "Kontoart",
  verrechnungskonto: "Verrechnungskonto",
  benutzer: "Zugang",
  benutzer_art: "Benutzerart",
  rolle: "Rolle",
  zyklus: "Buchungsjahr",
  regel_modus: "Buchungsweise",
  integration: "Bank-Anbindung",
  konvention: "Konvention",
  konvention_herkunft: "Herkunft",
  produktbefund: "Produktbefund",
  produktbefund_prio: "Dringlichkeit",
  mandant_onboarding: "Onboarding",
  mandant_onboarding_verdict: "Onboarding-Urteil",
  mirror_match: "DATEV-Abgleich",
  abgleich_lauf: "Abgleich-Lauf",
  zyklus_stapel: "Buchungszyklus",
  stapel_commit: "Festschreibung",
  datev_pruefung: "DATEV-Prüfung",
  log_level: "Level",
  actor_kind: "Akteur",
  health: "Systemcheck",
  readiness: "Konfiguration",
  zahlungsweg: "Zahlungsweg-Zustand",
  mandant_betrieb: "Betriebszustand",
  dauersachverhalt_uebernahme: "Übernahme",
  token: "Token",
  bridge_datev: "Bridge",
  vst_fakt: "Vorsteuer-Fakt",
  vst_regel: "Vorsteuer-Regel",
};

/** Nur die drei Haupt-Entitäten — für Flow-Modal und Icon-Beschriftung. */
export const ENTITY_LABEL: Record<EntityType, string> = {
  beleg: "Beleg",
  sachverhalt: "Sachverhalt",
  buchung: "Buchung",
};

/**
 * Technische Herkunft der Achse — DB-Spalte oder „abgeleitet/ephemer".
 *
 * Steht im Status-Dialog unter dem Achsen-Namen, damit man von der Anzeige
 * zurück auf die Datenquelle kommt, ohne im Code zu suchen. Der Wert ist
 * bewusst der DB-Bezeichner, nicht die Übersetzung.
 */
export const AXIS_SOURCE: Record<StatusAxis, string> = {
  beleg: "client_source_docs_invoices.processing_status",
  beleg_stage: "client_source_docs_invoices.processing_stage",
  beleg_inbox: "client_source_docs.status",
  beleg_kategorie: "client_source_docs.doc_category",
  dokumentgruppe: "client_source_docs.collection_kind",
  beleg_richtung: "client_source_docs_invoices.doc_direction",
  beleg_erledigung: "client_source_docs.completed_via (+ completed_at)",
  job: "ops_jobs.status",
  upload: "ephemer — React-State im Browser, keine DB-Spalte",
  dispatch: "ephemer — React-State im Verarbeitungs-Panel",
  sachverhalt: "client_accounting_case.lifecycle_status",
  belegnummern_modus: "client_accounting_case.document_number_mode",
  ereignis: "abgeleitet aus den Buchungen am Ereignis (keine Spalte)",
  disposition: "client_accounting_case.disposition",
  klaerung: "client_accounting_case_clarification.severity",
  klaerung_status: "berechnet aus client_accounting_case_clarification.answered_at / deferred_until",
  klaerung_typ: "client_accounting_case_clarification.type",
  erwartung: "berechnet aus client_accounting_case_expectation.due_date / escalation_level / resolved_at",
  erwartung_art: "client_accounting_case_expectation.kind",
  triage: "abgeleitet — domain/acceptance-triage.ts (keine Spalte)",
  buchung: "client_journal_entry.status",
  buchung_datev: "abgeleitet — status + exported_at + datev_mirror_entry_id (keine Spalte)",
  buchung_origin: "client_journal_entry.origin",
  konfidenz: "abgeleitet — client_journal_entry.proposal_confidence gebandet (entryConfLevel); Zeilen-Spalte seit 2026-08-29 tot",
  judge: "client_journal_entry.proposal_rationale (JSON, keine Spalte)",
  export_case: "abgeleitet — deriveCaseExportStatus (keine Spalte)",
  export_bucket: "abgeleitet — bucketOf in export-status-core.ts",
  lauf: "abgeleitet — runOutcome in agent-runs-view.ts (keine Spalte)",
  lauf_gate: "client_agent_run_steps.gate_result (NULL = Schritt noch offen)",
  partner: "client_business_partners.onboarding_state",
  konto: "client_ledger_accounts.status",
  konto_datev_sync: "client_ledger_accounts.datev_sync_state",
  konto_typ: "client_ledger_accounts.accounting_role",
  verrechnungskonto: "client_ledger_accounts.clearing_account_type",
  benutzer: "platform_tenant_users.status",
  benutzer_art: "platform_users.kind",
  rolle: "berechnet — modules/auth/domain/role.ts (keine Spalte)",
  zyklus: "client_fiscal_years.status",
  regel_modus: "client_accounting_case_rule.booking_mode",
  integration: "client_external_integrations.status",
  konvention: "client_agent_notes.status",
  konvention_herkunft: "client_agent_notes.origin",
  produktbefund: "platform_product_feedback.status",
  produktbefund_prio: "platform_product_feedback.priority (NULL = ungesichtet)",
  mandant_onboarding: "platform_clients.onboarding_state",
  mandant_onboarding_verdict: "abgeleitet — get-onboarding-status-core.ts (keine Spalte)",
  mirror_match: "client_datev_mirror_entries.match_state (NULL = nicht abgeglichen)",
  abgleich_lauf: "ops_datev_sync_runs.status + client_fiscal_years.datev_resync_requested_at",
  zyklus_stapel: "client_datev_export_batches.state",
  stapel_commit: "client_datev_sequences.is_committed (boolean)",
  datev_pruefung: "client_datev_sequences.inspection_status",
  log_level: "client_invoice_traces.level",
  actor_kind: "platform_audit_events.actor_kind",
  health: "berechnet — modules/health/aggregate.ts (ephemer)",
  readiness: "berechnet — Onboarding-Aggregat (ephemer)",
  zahlungsweg: "berechnet — client_payment_accounts.valid_until",
  mandant_betrieb: "berechnet — platform_clients.is_active + replay_cutoff_date",
  dauersachverhalt_uebernahme: "berechnet — RecurringCandidateClass aus der DATEV-Buchungshistorie (F91)",
  token: "berechnet — platform_agent_tokens.revoked_at + expires_at",
  bridge_datev: "berechnet — DatevApiStatus, von der on-prem Bridge gemeldet (ephemer)",
  vst_fakt: "berechnet — VatFact.value aus den Belegdaten (ephemer)",
  vst_regel: "berechnet — Katalog-Regel über den Vorsteuer-Fakten (ephemer)",
};
