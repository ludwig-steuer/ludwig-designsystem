/**
 * # Zentrale Status-Registry
 *
 * EINE Quelle für die Darstellung jedes Status in der App: Label, Badge-Farbe
 * (`kind`) und Erklärtext. Wer irgendwo einen Status anzeigt, holt ihn hier —
 * keine lokalen `STATUS_LABEL`/`STATUS_KIND`-Maps, keine Hex-Farben in
 * Feature-Komponenten. Das garantiert, dass derselbe Zustand überall gleich
 * heißt und gleich aussieht.
 *
 * ## Was hier hingehört
 * Achsen, die als **farbiger Status** in der UI auftauchen. Reines Vokabular
 * ohne Statuscharakter (Belegarten, Intervalle, Case-Kinds) bleibt in den
 * Domain-Modulen — das hier ist keine Sammelstelle für alle Label-Maps.
 *
 * ## Wertebereich vs. Darstellung
 * Die Registry ist NICHT die Wertebereich-Quelle. Der Wertebereich lebt im
 * DB-CHECK und (wo vorhanden) im Domain-Enum; hier kommt nur die Darstellung
 * dazu. `__tests__/status-registry.test.ts` prüft, dass beide Seiten
 * deckungsgleich sind — ein neuer Enum-Wert ohne Eintrag hier lässt den Test
 * rot werden.
 *
 * ## Warum nach Achse getrennt und nicht ein flacher Status-Topf
 * Dieselben Strings bedeuten je nach Achse etwas völlig anderes:
 *   `failed`    → Pipeline-Abbruch (beleg) vs. Job endgültig aufgegeben (job)
 *                 vs. HTTP-Trigger kam nicht durch (dispatch)
 *   `queued`    → durable Job wartet (job) vs. Browser-Upload wartet (upload)
 *   `proposed`  → Buchungsvorschlag (buchung) vs. Pipeline-Stufe (beleg_stage)
 *                 vs. Geschäftspartner-Vorschlag (partner)
 *   `classified`→ Inbox-Klassifikation durch (beleg_inbox) vs. Pipeline-Stufe
 *   `pending`   → Beleg wartet (beleg) — NICHT `pending_classification`
 * Ein flacher Lookup würde diese Werte stillschweigend vermischen.
 *
 * ## Sprache
 * **Technischer Name englisch, Anzeige deutsch** (AGENTS.md → Naming). Die
 * Status-*Werte* und die Auslöser der Übergänge halten sich daran; die
 * *Achsen-Keys* noch nicht: 54 von 72 sind deutsch, weil diese Datei sich
 * einmal auf „bewusst und dokumentiert" berufen hat. Genau das ist die
 * Ausnahme, die es nicht mehr gibt — F150 T150.2 benennt sie um. Bis dahin
 * hier keine neuen deutschen Keys anlegen.
 *
 * ## Neue Achse hinzufügen
 * 1. Map mit Block-Kommentar anlegen: DB-Spalte (oder „ephemer"), wer den Wert
 *    schreibt, Übergänge, Fallstricke. Der Kommentar ist der Zweck dieser
 *    Datei — jemand, der den Status in sechs Monaten sieht, muss hier
 *    nachlesen können, was er bedeutet.
 * 2. In `STATUS_REGISTRY` eintragen.
 * 3. Optional Icon in `entity-icons.ts`.
 * 4. Test in `__tests__/status-registry.test.ts` ergänzen, wenn ein
 *    Domain-Enum existiert.
 */
/**
 * Status-Achsen der App. Namensschema: Entität, bei mehreren Achsen an
 * derselben Entität mit Suffix (`beleg` / `beleg_stage` / `beleg_inbox`).
 */
export type StatusAxis =
  // — Beleg & Pipeline —
  | "beleg"
  | "beleg_stage"
  | "beleg_charakter"
  | "beleg_erledigung"
  | "beleg_haenger"
  | "beleg_inbox"
  | "beleg_kategorie"
  | "dokumentgruppe"
  | "beleg_richtung"
  | "job"
  | "upload"
  | "dispatch"
  // — Sachverhalt —
  | "sachverhalt"
  | "ereignis_art"
  | "belegnummern_modus"
  | "ereignis"
  | "disposition"
  | "klaerung"
  | "klaerung_status"
  | "klaerung_typ"
  | "erwartung"
  | "erwartung_art"
  | "triage"
  // — Buchung & Export —
  | "buchung"
  | "zyklus_stapel"
  | "buchung_datev"
  | "buchung_origin"
  | "konfidenz"
  | "judge"
  | "export_case"
  | "export_bucket"
  // — Buchungslauf —
  | "lauf"
  | "lauf_gate"
  // — Stammdaten —
  | "partner"
  | "konto"
  | "konto_datev_sync"
  | "konto_typ"
  | "verrechnungskonto"
  | "benutzer"
  | "benutzer_art"
  | "rolle"
  | "zyklus"
  | "zahlungsweg"
  | "mandant_betrieb"
  | "dauersachverhalt_uebernahme"
  | "token"
  | "regel_modus"
  | "integration"
  | "mandant_onboarding"
  | "mandant_onboarding_verdict"
  // — Wissen —
  | "konvention"
  | "konvention_herkunft"
  | "produktbefund"
  | "produktbefund_prio"
  // — DATEV-Abgleich —
  | "kontoauszug_erwartung"
  | "opos_ausgleich"
  | "opos_zeilenart"
  | "datev_verknuepfung"
  | "plausibilitaet"
  | "belegnummer_quelle"
  | "bank_match_stage"
  | "mirror_match"
  | "abgleich_lauf"
  | "stapel_commit"
  | "datev_pruefung"
  // — Betrieb —
  | "actor_kind"
  | "bridge_datev"
  | "vst_fakt"
  | "vst_regel"
  | "log_level"
  | "health"
  | "readiness";

/**
 * Die drei Haupt-Entitäten der Datenmodell-Kette (Beleg → Sachverhalt →
 * Buchung). Nur sie haben ein Icon und ein Flow-Modal. Bleibt als eigener
 * Typ erhalten, weil `EntityStatusBadgeButton` genau diese drei bedient.
 */
export type EntityType = "beleg" | "sachverhalt" | "buchung";

/**
 * Die fünf Farbrollen, die ein Status tragen kann. Hier definiert und nicht
 * importiert: die Registry muss importfrei bleiben, damit das Design-System
 * sie spiegeln kann (`sync-ludwig.sh`, Spec 0080). `Badge` zieht den Typ von
 * hier und führt `BadgeKind` nur noch als Alias weiter.
 *
 * Die Skala kodiert **Kritikalität**, nie Wert oder Vorzeichen (V6):
 * `danger` ist ein Fehler, `warning` eine Warnung, `info` ein Hinweis,
 * `success` ein erreichter Sollzustand, `neutral` eine Feststellung ohne
 * Bewertung.
 */
export type StatusKind = "info" | "success" | "warning" | "danger" | "neutral";

export interface StatusDescriptor {
  /** Anzeigetext. Deutsch, knapp, ohne Satzzeichen. */
  label: string;
  /** Badge-Farbe. Einziger Weg zu Farbe — nie Hex in Komponenten. */
  kind: StatusKind;
  /**
   * Erklärung für den Nutzer (Tooltip / `title`). Beantwortet „was heißt
   * das und was folgt daraus", nicht „wie heißt die Spalte".
   */
  description?: string;
}

// ══════════════════════════════════════════════════════════════════════
// BELEG & PIPELINE
// ══════════════════════════════════════════════════════════════════════

/**
 * `client_source_docs_invoices.processing_status` — rein TECHNISCHE
 * Pipeline-Position. NULL erlaubt (Legacy-Zeilen ohne Status).
 *
 * Abgrenzung: der **fachliche** Abschluss eines Belegs steht nicht hier,
 * sondern in der Spalte „Erledigt" der Belegliste. Ein `processed` heißt nur
 * „die Pipeline ist durch", nicht „der Beleg ist fertig bearbeitet" — die
 * beiden Spalten stehen deshalb nebeneinander und widersprechen sich
 * regelmäßig, ohne dass eine falsch wäre.
 *
 * Wertebereich: DB-CHECK `client_invoices_processing_status_check`
 * (Migration `20260720090000_processing_status_review_needed.sql`; der
 * Constraint trägt noch den alten Tabellennamen). Es gibt KEIN TS-Enum —
 * diese Map ist der einzige TS-seitige Wertebereich.
 *
 * Schreiber (alle Python, `invoice_ingest_workflow.py`):
 *   `pending`       ← FastAPI-Ingest legt den Stub an, bevor die Pipeline läuft
 *   `in_progress`   ← Workflow beim Aufgreifen
 *   `processed` /
 *   `review_needed` ← Endprojektion, je nachdem ob offene Findings bleiben;
 *                     zusätzlich `invoice_revalidation_service` (flippt in
 *                     BEIDE Richtungen)
 *   `failed`        ← `_mark_pipeline_failed` (Crash, Timeout, FX-Fehler)
 *
 * Übergänge:
 *   NULL/pending → in_progress → processed | review_needed | failed
 *   review_needed ⇄ processed  (Revalidierung, synchron)
 *   failed → in_progress       (Retry / force-Reprocess)
 *
 * Fallstricke:
 *  - **`review_needed` ist KEIN Abbruch.** Die Pipeline lief komplett durch,
 *    es bleiben nur reparierbare Findings (z.B. fehlendes Pflichtfeld). Ein
 *    Retry ist der FALSCHE Fix — richtig ist `update_invoice_extraction`,
 *    das synchron re-validiert und den Status selbst zurückflippt.
 *  - `archived` existiert hier nicht mehr (seit Migration `20260519120000`
 *    in die Lifecycle-Achse gewandert). Ein Insert damit bricht am CHECK.
 *  - Diese Achse ist bewusst getrennt von `lifecycle_status` (Reviewer-Sicht).
 *    Die Pipeline fasst den Lifecycle nie an und umgekehrt.
 *  - Die dritte, orthogonale Achse ist `client_source_docs.completed_at`
 *    (NULL = offen) — fachlich erledigt, bewusst kein weiterer Statuswert.
 *    Sie folgt der BUCHUNG, nicht der Pipeline und nicht dem Case-Close:
 *    erledigt, solange am Beleg-Ereignis eine lebende Buchung hängt
 *    (Trigger aus `20260820170000`).
 */
const BELEG_PROCESSING: Record<string, StatusDescriptor> = {
  pending: { label: "Wartet", kind: "neutral", description: "Beleg liegt vor, die Verarbeitung hat noch nicht begonnen." },
  in_progress: { label: "In Bearbeitung", kind: "info", description: "Die Pipeline verarbeitet den Beleg gerade." },
  processed: { label: "Prozessiert", kind: "success", description: "Pipeline vollständig durchlaufen — klassifiziert, interpretiert, bereit für den Sachverhalt." },
  review_needed: { label: "Prüfung nötig", kind: "warning", description: "Verarbeitet, aber es fehlt noch etwas Reparierbares (z.B. ein Pflichtfeld). Wert nachtragen — das System prüft dann automatisch nach. Kein Neustart nötig." },
  failed: { label: "Fehlgeschlagen", kind: "danger", description: "Die Pipeline ist abgebrochen (Crash, Timeout oder kritischer Befund). Erst ein Neustart bringt den Beleg weiter." },
};

/**
 * `client_source_docs_invoices.processing_stage` — erreichte Pipeline-Stufe,
 * Detail zum Processing-Status. Wertebereich: DB-CHECK aus Migration
 * `20260511100000_creditor_observed_vendor_names.sql`.
 *
 * Schreiber: ausschließlich `invoice_ingest_workflow.py`, jeweils nach der
 * entsprechenden Stufe.
 *
 * Fallstricke:
 *  - **`stage` ist Resume-Anker, nicht nur Anzeige.** Die Resumability-Matrix
 *    des Workflows entscheidet daran, ob ein erneuter Lauf fortsetzt oder als
 *    `skipped_duplicate` abbricht. Ein von Hand gesetzter Wert kann Belege
 *    dauerhaft überspringen lassen.
 *  - Bei Fehlern wird `stage` NICHT zurückgesetzt — ein `failed`-Beleg trägt
 *    die zuletzt erreichte Stufe weiter.
 *  - `proposed` hat seit dem Ausbau des Booking-Steps (2026-07-06) keinen
 *    Schreiber mehr; Buchungsvorschläge entstehen on-demand am Sachverhalt.
 *    Wert bleibt gelistet, damit Altdaten korrekt anzeigen.
 */
const BELEG_STAGE: Record<string, StatusDescriptor> = {
  classified: { label: "Klassifiziert", kind: "neutral", description: "Belegart erkannt (Cheap-Classifier)." },
  // Zwischenstufe des BEDI-Sampling-Light-Passes (Classifier + Preprocessor
  // ohne Interpreter) — Cutoff beim Onboarding. Fehlte hier bis 2026-07-20,
  // wodurch Fortschrittsbalken null erreichte Stufen anzeigten.
  extracted: { label: "Extrahiert", kind: "neutral", description: "Grunddaten ausgelesen (Onboarding-Schnelldurchlauf, ohne Interpretation)." },
  preprocessed: { label: "Vorverarbeitet", kind: "neutral", description: "OCR und Strukturierung durch." },
  interpreted: { label: "Interpretiert", kind: "neutral", description: "Fachliche Bedeutung ermittelt (Rolle, Positionen, Lieferant)." },
  proposed: { label: "Buchungsvorschlag", kind: "neutral", description: "Historische Stufe — Vorschläge entstehen heute am Sachverhalt." },
};

/**
 * `client_source_docs.status` — Klassifizierungs-Status jedes eingehenden
 * Dokuments (früher `client_document_inbox`). NOT NULL, Default
 * `pending_classification`. Wertebereich: `INBOX_STATUS`
 * (`modules/document-inbox/domain/inbox.ts`) + Python-Enum
 * `domain/document_inbox.py`, Spiegel des DB-CHECK.
 *
 * Schreiber: Web-Upload setzt `pending_classification`, der Python-Classifier
 * setzt `classified` bzw. `classification_failed`, Reprocess setzt zurück auf
 * `pending_classification`, Soft-Delete setzt `deleted`. Der Web-Upload setzt
 * zusätzlich `awaiting_input` für erkannte Kontoauszüge (F170); hinaus führt
 * `importStatementForInboxEntry` — es setzt `classified` +
 * `completed_via='import'`.
 *
 * Fallstricke:
 *  - **`classified` heißt NICHT „Belegform erkannt".** `class_document_form`
 *    darf legitim NULL sein (gescanntes PDF ohne OCR-Fallback). Wer auf die
 *    Belegart angewiesen ist, muss beides prüfen (`qualifiesForInvoiceFlow`).
 *  - **Kein Retry, kein Timeout.** Bewusste Entscheidung: ein Beleg bleibt in
 *    `classification_failed` bzw. bei totem Classifier-Prozess unbegrenzt in
 *    `pending_classification` liegen, bis jemand aktiv neu anstößt.
 *  - `deleted` ist reiner Soft-Delete (Datei + Zeile bleiben, sonst bräche die
 *    verknüpfte Historie). JEDE Listen-Query muss `status <> 'deleted'`
 *    filtern — das wird nicht zentral erzwungen.
 */
const BELEG_INBOX: Record<string, StatusDescriptor> = {
  pending_classification: { label: "Wird eingeordnet", kind: "neutral", description: "Dokument ist hochgeladen und wartet auf die Klassifizierung." },
  classified: { label: "Eingeordnet", kind: "success", description: "Dokumentart erkannt — der Beleg kann weiterverarbeitet werden." },
  classification_failed: { label: "Einordnung fehlgeschlagen", kind: "danger", description: "Die Dokumentart konnte nicht bestimmt werden. Es gibt keinen automatischen Wiederholungslauf — bitte manuell neu anstoßen." },
  awaiting_input: { label: "Angabe nötig", kind: "warning", description: "Die Datei ist erkannt, aber eine Angabe fehlt — zum Beispiel das Bankkonto eines Kontoauszugs. Ohne sie wird nichts verarbeitet." },
  deleted: { label: "Gelöscht", kind: "neutral", description: "Aus der Liste entfernt. Datei und Historie bleiben erhalten." },
};

/**
 * `client_source_docs.doc_category` — die Belegkategorie (F87). Vierte,
 * orthogonale Achse neben `document_form` / `document_kind` / `doc_direction`.
 * Wertebereich: DB-CHECK `client_source_docs_doc_category_check`, gespiegelt
 * in `DOC_CATEGORIES` (`modules/source-docs/domain/document-form-mapping.ts`)
 * und `buchassi_shared.document_category.DocCategory`.
 *
 * Schreiber: ausschließlich `processSourceDoc` — abgeleitet aus
 * `class_document_form` über die EINE Mapping-Tabelle. Nie vom LLM, nie
 * händisch. Ein Override der Belegform zieht die Kategorie automatisch nach.
 *
 * Sie sagt, was mit dem Beleg als Nächstes passiert:
 *   performance → Rechnungs-Pipeline (sofern die Form ein Rechnungsdokument ist)
 *   payment     → Agent-Bucket (Zahlungsabgleich)
 *   foundation  → Kontext-Zweig (Verträge werden extrahiert)
 *   internal    → Agent-Bucket
 *   report      → sofort erledigt, gar kein Beleg
 *
 * Fallstricke:
 *  - **NULL ist kein Wert dieser Achse, sondern ihr Fehlen**: Auffang
 *    (`other`/`unknown`), Container (`document_collection`) oder noch nicht
 *    klassifiziert. Nie „stilles Raten" — der Beleg geht an den Agenten.
 *  - **`performance` heißt nicht „hat eine Rechnungszeile".** Lieferschein und
 *    Mahnung sind Leistungsbelege ohne Invoice-Subtyp. Wer die Rechnungs-
 *    daten braucht, prüft den Subtyp, nicht die Kategorie.
 *  - `report`-Belege sind bei der Anzeige bereits `completed_at` — die
 *    „Erledigt"-Spalte schlägt den Pipeline-Status.
 */
/**
 * `client_source_docs.collection_kind` — der Typ einer **Dokumentgruppe**
 * (F104), gesetzt am Sammeldokument, NULL bei allem anderen.
 *
 * Er ist keine Beschriftung: aus ihm folgt, WIE die Gruppe gebucht wird — ein
 * Sachverhalt am Sammeldokument, je Einzelbeleg eine eigene Buchung, geklammert
 * durch ein Verrechnungskonto (`collectionFamily`). Nur `not_connected` hat
 * kein Verfahren.
 *
 * Schreiber: der `document-simple-classifier` beim Klassifizieren; korrigiert
 * wird über `override_classification`. **Nie vom Agenten gesetzt.**
 *
 * Fallstricke:
 *  - **NULL heißt „kein Sammeldokument"**, nicht „Typ unbekannt". Ein Kind
 *    trägt nie einen Gruppentyp.
 *  - Drei Werte stehen im CHECK, damit der Classifier sie benennen kann, ihr
 *    Sonderverfahren fehlt aber noch (Kassenbericht, Gateway-Auszahlung,
 *    Sammelrechnung). Sie verhalten sich wie `not_connected` — mit sichtbarem
 *    Hinweis, nicht stillschweigend (`COLLECTION_KINDS_WITHOUT_PROCEDURE`).
 *  - `other` gibt es nicht mehr: der Wert heißt `not_connected` (gleiche
 *    Bedeutung, klarerer Name) und wurde beim Anlegen der Spalte migriert.
 *  - Reisekosten sind kein eigener Typ — sie laufen als `expense_report`. Der
 *    Unterschied (Pauschalen, Bewirtung) wirkt am Einzelbeleg, nicht an der
 *    Gruppe.
 */
const DOKUMENTGRUPPE: Record<string, StatusDescriptor> = {
  expense_report: {
    label: "Auslagenabrechnung",
    kind: "info",
    description:
      "Ein Mitarbeiter hat privat verauslagt und rechnet ab. Deckblatt plus die Belege dahinter; gebucht wird jeder Beleg einzeln gegen sein Verrechnungskonto, die Erstattung läuft über dasselbe Konto.",
  },
  credit_card_statement: {
    label: "Kreditkartenabrechnung",
    kind: "info",
    description:
      "Kartenabrechnung plus die Einzelbelege dazu. Gebucht wird jeder Beleg gegen das Kartenkonto; die Lastschrift der Bank gleicht es wieder aus.",
  },
  cash_register_report: {
    label: "Kassenbericht",
    kind: "neutral",
    description:
      "Kassenbericht mit den Bons dazu. Der Gruppentyp ist erkennbar, das eigene Buchungsverfahren dafür noch nicht gebaut — die Belege werden vorerst einzeln behandelt.",
  },
  payment_gateway_payout: {
    label: "Auszahlung Zahlungsdienstleister",
    kind: "neutral",
    description:
      "Eine PayPal-/Stripe-Auszahlung sammelt viele Einzelumsätze. Der Gruppentyp ist erkennbar, das eigene Buchungsverfahren dafür noch nicht gebaut.",
  },
  vendor_collective_invoice: {
    label: "Sammelrechnung",
    kind: "neutral",
    description:
      "Ein Lieferant rechnet mehrere Vorgänge in einem Dokument ab. Klammer ist sein Kreditorenkonto; das eigene Verfahren dafür ist noch nicht gebaut.",
  },
  document_with_annexes: {
    label: "Beleg mit Anlagen",
    kind: "info",
    description:
      "Ein Hauptbeleg plus Nachweise (Lieferschein, Stundenzettel, AGB). Nur der Hauptbeleg wird gebucht, die Anlagen sind Nachweis.",
  },
  not_connected: {
    label: "Unabhängige Belege",
    kind: "neutral",
    description:
      "Ein Stapelscan ohne inneren Zusammenhang. Jeder Beleg bekommt seinen eigenen Sachverhalt, als wäre er einzeln hochgeladen — der einzige Gruppentyp ohne besonderes Verfahren.",
  },
};

const BELEG_KATEGORIE: Record<string, StatusDescriptor> = {
  performance: { label: "Leistungsbeleg", kind: "info", description: "Belegt eine Leistung oder Lieferung samt Zahlungsaufforderung oder Gutschrift — Rechnungen, Bons, Lieferscheine, Mahnungen. Grundlage für Aufwand, Ertrag, Forderung, Verbindlichkeit." },
  payment: { label: "Zahlungsbeleg", kind: "info", description: "Belegt den tatsächlichen Geldfluss auf einem Geldkonto — Kontoauszug, Kreditkartenabrechnung, eigener Kassenabschluss. Wird gegen die Einzelbelege abgeglichen, nicht selbst als Rechnung gebucht." },
  foundation: { label: "Nachweisbeleg", kind: "info", description: "Rechts- & Basisbeleg: rechtliche Nachweis- oder Berechnungsgrundlage ohne eigene Rechnungsstellung — Verträge, Bescheide, Versicherungsscheine. Dient oft als Dauerbeleg für wiederkehrende Abbuchungen." },
  internal: { label: "Interner Beleg", kind: "info", description: "Vom Mandanten selbst erstellt, weil es keinen externen Beleg gibt (GoBD-Eigenbelegprinzip) — Eigenbelege, Reisekostenabrechnungen, Lohn-Sammelbelege, Umbuchungen." },
  report: { label: "Auswertung", kind: "neutral", description: "Kein Beleg, sondern ein Bericht über bereits gebuchte Vorgänge (USt-Werteblatt, SuSa, BWA, Kontennachweis). Wird automatisch erledigt — der Inhalt liegt strukturiert im DATEV-Spiegel." },
};

/**
 * `client_source_docs_invoices.doc_direction` — Belegrichtung aus
 * Mandantensicht. Hieß bis F87 `accounting_role`; umbenannt, weil
 * `client_ledger_accounts.accounting_role` (Kontenrolle) etwas völlig anderes
 * bedeutet und die Homonymie regelmäßig für Verwechslungen sorgte (P11/O8).
 *
 * Schreiber: **eine Stelle** — die deterministische Kaskade
 * `InterpretationContextLoader.resolve_doc_direction` im Workflow. Nicht der
 * Classifier (entfernt 2026-05-18, der LLM-Direction-Hint war unzuverlässig).
 *
 * Beweislast liegt allein auf `outbound`: die einzige Frage ist, ob der
 * Mandant den Beleg selbst ausgestellt hat. Lautet die Antwort nicht
 * nachweislich ja, ist es ein Eingangsbeleg.
 *
 * Fallstricke:
 *  - **NULL heißt „nicht anwendbar", nie „unbekannt".** Belege, die keine
 *    Umsatzbelege sind, haben seit F87 gar keine Invoice-Zeile mehr — die
 *    Frage stellt sich dort nicht. `renderDocDirectionLine` gibt dann keine
 *    Zeile aus (lieber nichts als geraten).
 *  - **Konfidenz mitlesen.** `inbound` mit Signal `default_incoming` (0.5) ist
 *    angenommen, nicht belegt — für den Judge ist genau das der Unterschied.
 *  - `internal` steht im CHECK, hat aber heute **keinen Schreiber**: interne
 *    Belege bekommen keinen Invoice-Subtyp. Bewusste Lücke, siehe
 *    `docs/topics/belege.md` R10.
 */
const BELEG_RICHTUNG: Record<string, StatusDescriptor> = {
  inbound: { label: "Eingangsrechnung", kind: "info", description: "Der Mandant ist Leistungsempfänger — ein Lieferant stellt ihm etwas in Rechnung. Bucht Aufwand und zieht Vorsteuer." },
  outbound: { label: "Ausgangsrechnung", kind: "info", description: "Der Mandant hat den Beleg selbst ausgestellt — nachgewiesen über eigene USt-IdNr. oder Firmierung. Bucht Erlös und schuldet Umsatzsteuer." },
  internal: { label: "Interner Vorgang", kind: "neutral", description: "Weder Ein- noch Ausgang — ein rein interner Vorgang. Der Werteraum kennt den Wert, vergeben wird er heute noch nicht." },
};

/**
 * `ops_jobs.status` — durable Job-Queue (Postgres als Bus). NOT NULL,
 * Default `queued`. Wertebereich: DB-CHECK aus `20260603120000_ops_jobs.sql`,
 * TS-Typ `JobStatus` in `modules/document-inbox/ui/JobStatusMonitor.tsx`.
 *
 * Schreiber: **Das Web schreibt ausschließlich den Insert (`queued`).** Alle
 * Übergänge macht der Python-Worker (`worker.py`); die RLS-Policy ist bewusst
 * nur `for select`. Ohne laufenden Worker (`make run-worker`) bleibt alles auf
 * `queued` und kein Beleg wird verarbeitet.
 *
 * Übergänge:
 *   queued → running → succeeded                    (terminal)
 *                    → queued    (Retry, +60s)
 *                    → failed    (Versuche erschöpft, terminal)
 *   running → queued|failed      (Reaper, wenn `locked_at` zu alt)
 *   queued  → failed             (unbekannter job_type — SOFORT, ohne Retry)
 *
 * Fallstricke:
 *  - **Job-Erfolg ≠ Beleg-Erfolg.** Der Ingest-Handler wirft nicht; der Job
 *    wird `succeeded`, auch wenn der Beleg intern auf `failed` landete. Diese
 *    Achse und `beleg` sind entkoppelt.
 *  - `attempts` zählt beim Claim hoch, nicht beim Fehler — `max_attempts=3`
 *    bedeutet 3 Läufe, nicht 4.
 *  - Der Reaper schreibt beim Requeue eine `error`-Message. Ein Job in
 *    `queued` kann also einen Fehlertext tragen, ohne gescheitert zu sein.
 *  - `failed` ist terminal, blockiert aber nichts: der Dedup-Index greift nur
 *    für `queued|running`, ein erneutes Enqueue funktioniert.
 */
const JOB_STATUS: Record<string, StatusDescriptor> = {
  queued: { label: "Eingereiht", kind: "neutral", description: "Auftrag wartet auf einen freien Verarbeiter." },
  running: { label: "Läuft", kind: "info", description: "Auftrag wird gerade abgearbeitet." },
  succeeded: { label: "Fertig", kind: "success", description: "Auftrag durchgelaufen. Ob der Beleg selbst fehlerfrei ist, zeigt der Beleg-Status." },
  failed: { label: "Fehlgeschlagen", kind: "danger", description: "Auftrag endgültig aufgegeben — alle Wiederholungen sind aufgebraucht." },
};

/**
 * Upload-Phase im Browser. **Ephemer** — reiner React-State
 * (`DocumentInbox.tsx`), überlebt keinen Reload. Keine DB-Spalte.
 *
 * Übergänge: queued → uploading → finalizing → done; aus jedem Schritt
 * heraus → error. Kein Retry, kein Weg aus einem Endzustand heraus.
 *
 * Fallstricke:
 *  - **`done` heißt nur „Datei ist angekommen".** Ob Klassifizierung und
 *    Ingest gestartet sind, steht in einem separaten Warnfeld am Job. Deshalb
 *    hier bewusst „Hochgeladen" statt „Fertig" — sonst liest sich der Zustand
 *    wie „ist verarbeitet".
 *  - Ein Duplikat ist `done`, kein Fehler (SHA-256-Dedupe gegen bestehende
 *    Dateien).
 */
const UPLOAD_PHASE: Record<string, StatusDescriptor> = {
  queued: { label: "Wartet", kind: "neutral", description: "Datei ist eingereiht und wartet auf den Upload." },
  uploading: { label: "Wird übertragen", kind: "info", description: "Datei wird gerade hochgeladen." },
  finalizing: { label: "Wird abgeschlossen", kind: "info", description: "Upload fertig, Eintrag wird angelegt." },
  done: { label: "Hochgeladen", kind: "success", description: "Datei ist angekommen. Die Verarbeitung läuft separat — siehe Beleg-Status." },
  error: { label: "Fehlgeschlagen", kind: "danger", description: "Der Upload ist fehlgeschlagen. Die Datei ist nicht angekommen." },
};

/**
 * Dispatch-Status eines Stapellaufs im Verarbeitungs-Panel. **Ephemer** —
 * React-State (`closing/ui/ProcessingPanel.tsx`), pro Beleg-ID, reload-flüchtig.
 *
 * Der Browser stößt die Verarbeitung an und pollt danach den echten
 * Beleg-Status. Übergänge: queued → starting → running → done | stuck;
 * starting → failed.
 *
 * Fallstricke:
 *  - **`failed` heißt hier „Start misslungen", nicht „Beleg gescheitert".**
 *    Der Beleg steht danach unverändert auf `pending`. Nicht mit
 *    `beleg.failed` verwechseln.
 *  - **`stuck` ist Browser-Ungeduld, kein Abbruch.** Nach 5 Minuten hört der
 *    Browser auf zu warten; serverseitig läuft die Verarbeitung weiter.
 *  - `done` bedeutet nur „nicht mehr pending/in_progress" — das schließt
 *    `failed` und `review_needed` mit ein. Deshalb hier `neutral` statt
 *    `success`: ein gescheiterter Beleg darf nicht grün erscheinen.
 */
const DISPATCH_STATE: Record<string, StatusDescriptor> = {
  queued: { label: "Eingereiht", kind: "neutral", description: "Beleg gehört zum Stapel und wartet auf den Start." },
  starting: { label: "Wird gestartet", kind: "info", description: "Verarbeitung wird angestoßen." },
  running: { label: "Läuft", kind: "info", description: "Verarbeitung läuft — der Browser wartet auf das Ergebnis." },
  done: { label: "Durchgelaufen", kind: "neutral", description: "Verarbeitung beendet. Ob erfolgreich, zeigt der Beleg-Status — auch Fehler landen hier." },
  stuck: { label: "Dauert an", kind: "warning", description: "Nach 5 Minuten ohne Ergebnis hat der Browser aufgehört zu warten. Die Verarbeitung läuft im Hintergrund weiter." },
  failed: { label: "Start-Fehler", kind: "danger", description: "Die Verarbeitung ließ sich nicht anstoßen. Der Beleg ist unverändert und kann neu gestartet werden." },
};

/**
 * `client_source_docs.class_document_kind` — der **Charakter** eines Belegs:
 * ob er eine Leistung berechnet oder eine frühere Rechnung zurücknimmt.
 * Wertebereich `DOCUMENT_KINDS`
 * (`modules/source-docs/domain/document-form-labels.ts`), gleiche Quelle wie
 * das Python-Enum.
 *
 * Vierte und letzte Einordnungs-Achse des Belegs neben `beleg_kategorie`
 * (was als Nächstes passiert), `beleg_richtung` (ein- oder ausgehend) und
 * `dokumentgruppe` (einzeln oder Sammel-PDF). Sie stand als Einzige nicht in
 * der Registry — die Belegliste zeigte den Wert als Abzeichen ohne Achse
 * (L-37).
 *
 * Fallstricke:
 *  - **`credit_note` und `self_billing` sind nicht dasselbe.** Das eine nimmt
 *    zurück, das andere rechnet ab: bei der Gutschrift nach §14 UStG stellt
 *    der Leistungsempfänger die Rechnung. Vorzeichen und Steuerbehandlung
 *    unterscheiden sich.
 *  - `original` ist mit 83 % der Normalfall und wird in Listen bewusst nicht
 *    gezeigt — der Normalfall ist keine Nachricht.
 */
const BELEG_CHARAKTER: Record<string, StatusDescriptor> = {
  original: { label: "Normal-Beleg", kind: "neutral", description: "Berechnet eine Leistung — der Normalfall." },
  credit_note: { label: "Stornogutschrift", kind: "info", description: "Nimmt eine frühere Rechnung ganz oder teilweise zurück." },
  self_billing: { label: "§14-UStG-Gutschrift", kind: "info", description: "Der Leistungsempfänger rechnet ab — keine Rücknahme, sondern eine Rechnung aus der anderen Richtung." },
  refund: { label: "Erstattung", kind: "info", description: "Rückzahlung ohne eigene Leistung." },
  unknown: { label: "Unbekannt", kind: "neutral", description: "Der Klassifikator hat den Charakter nicht bestimmt." },
};

/**
 * Erledigung eines Belegs — `client_source_docs.completed_via`, plus zwei
 * Werte, die keine Spaltenwerte sind.
 *
 * Sie ist der Zustand, den **jede** Belegart trägt: die Achse `beleg`
 * (Verarbeitung) lebt am Rechnungs-Subtyp und hat für 16 % der Belege nie
 * einen Wert, `beleg_inbox` steht im Bestand bei 383 von 384 Belegen auf
 * demselben Wert. „Ist der Beleg durch?" beantwortet nur diese Achse.
 *
 * Wertebereich: DB-CHECK `client_source_docs_completed_via_check`
 * (`20260829140000`, um `no_booking_required` erweitert in `20260903120000`).
 * Ein TS-Enum gibt es nicht — die Spalte steht ungetypt als `completedVia` im
 * generierten Schema; der Registry-Test spiegelt den CHECK.
 *
 * Zwei Schlüssel stehen **nicht** in der Spalte, sondern sagen etwas über
 * `completed_at`:
 *   `open`      ← `completed_at IS NULL` — der Beleg steht noch in der
 *                 Todo-Liste (41 von 384)
 *   `completed` ← `completed_at` gesetzt, `completed_via` NULL: erledigt,
 *                 Grund unbekannt (61 von 384). **Nicht** „offen".
 *
 * Schreiber: `DocCompletionControl` (Hand), der Buchungslauf (`booking`), der
 * Sachverhalts-Abschluss (`case_closed`), der DATEV-Import (`import`), die
 * Ersetzung eines Belegs (`superseded`).
 *
 * Fallstricke:
 *  - **Orthogonal zum Pipeline-Status** (GLOSSARY): „Pipeline durchgelaufen"
 *    heißt nicht „fertig", und ein erledigter Beleg kann eine abgebrochene
 *    Pipeline haben.
 *  - Der Freitext `completed_reason` ist der Tooltip daneben, kein eigener
 *    Zustand — er trägt bei `manual` die Begründung des Menschen.
 *  - Bestand (2026-09-04): booking 171 · manual 77 · no_booking_required 26 ·
 *    superseded 7 · case_closed 1 · import 0.
 */
const BELEG_ERLEDIGUNG: Record<string, StatusDescriptor> = {
  open: {
    label: "Offen",
    kind: "info",
    description:
      "An diesem Beleg ist noch etwas zu tun — er steht in der Todo-Liste der Periode. Unabhängig davon, wie weit die Verarbeitung ist.",
  },
  completed: {
    label: "Erledigt",
    kind: "success",
    description:
      "Der Beleg ist durch; woran er erledigt wurde, ist nicht festgehalten. Altbestand — seit F87 schreibt jeder Weg seinen Grund mit.",
  },
  booking: {
    label: "Gebucht",
    kind: "success",
    description: "Der Beleg ist gebucht — die Buchung hat ihn beim Abschluss mit erledigt.",
  },
  case_closed: {
    label: "Sachverhalt geschlossen",
    kind: "success",
    description:
      "Der Sachverhalt, an dem der Beleg hängt, wurde geschlossen. Der Beleg selbst wurde nicht einzeln abgehakt.",
  },
  import: {
    label: "Über Import erledigt",
    kind: "success",
    description:
      "Der Beleg kam aus DATEV und war dort bereits gebucht — er ist mit dem Import erledigt, ohne eigenen Buchungslauf.",
  },
  superseded: {
    label: "Ersetzt",
    kind: "neutral",
    description:
      "Ein neuer Beleg hat diesen abgelöst (Korrektur, zweiter Scan). Ersetzt heißt nicht gelöscht: Datei und Historie bleiben, gebucht wird der Nachfolger.",
  },
  manual: {
    label: "Von Hand erledigt",
    kind: "success",
    description:
      "Jemand aus der Kanzlei hat den Beleg abgehakt. Der Grund steht als Freitext daneben.",
  },
  no_booking_required: {
    label: "Keine Buchung nötig",
    kind: "success",
    description:
      "Der Beleg wird nicht gebucht — Auswertung, Doppel oder ein Dokument ohne Geldfluss. Er ist damit fertig, nicht übersprungen.",
  },
};

/**
 * Warum ein Beleg in der Hänger-Liste steht — **berechnet, ephemer** aus
 * zwei Angaben: ob es eine Invoice-Zeile gibt (`hasInvoiceRow`) und ob die
 * Liste die noch laufenden oder die steckengebliebenen zeigt.
 *
 * Die Achse trägt beide Sichten, weil es dieselbe Frage ist: wie weit ist der
 * Beleg gekommen. Der Unterschied ist nur, ob man ihn noch erwartet.
 *
 * Fallstrick: `datum_fehlt` heißt, die Extraktion lief — sie hat nur kein
 * Belegdatum gefunden. Das ist ein fachlicher Mangel, kein technischer
 * Abbruch, und deshalb `warning` und nicht `danger`.
 */
const BELEG_HAENGER: Record<string, StatusDescriptor> = {
  wird_klassifiziert: { label: "wird klassifiziert", kind: "info", description: "Der Beleg wird gerade klassifiziert — es gibt noch keine Invoice-Zeile." },
  wird_extrahiert: { label: "wird extrahiert", kind: "info", description: "Die Grunddaten werden gerade extrahiert." },
  nicht_extrahiert: { label: "nicht extrahiert", kind: "danger", description: "Keine Extraktion vorhanden — es gibt keine Invoice-Zeile." },
  datum_fehlt: { label: "Datum fehlt", kind: "warning", description: "Extrahiert, aber ohne Belegdatum. Fachlicher Mangel, kein technischer Abbruch." },
};

// ══════════════════════════════════════════════════════════════════════
// SACHVERHALT
// ══════════════════════════════════════════════════════════════════════

/**
 * `client_accounting_case.lifecycle_status` — fachliche Reviewer-Achse.
 * Nullable (NULL = Case noch in Pipeline-Bearbeitung; alle Filter müssen das
 * behandeln). Wertebereich: `CASE_LIFECYCLE`
 * (`modules/accounting-cases/domain/case.ts`), DB-CHECK zuletzt in
 * `20260721130000_case_waiting_for_documents.sql`.
 *
 * Schreiber: Reviewer-Klick (`booking-actions.ts`, `close-actions.ts`),
 * MCP-Agent (`raise_clarification`, `expect_document`, `merge_cases`) und die
 * eine Neuberechnung `recomputeCaseLifecycle` (`expectation-core.ts`) nach
 * jeder Änderung an Klärungen oder Erwartungen.
 *
 * Fallstricke:
 *  - **`needs_clarification` sticht `waiting_for_documents`.** Wer eine echte
 *    Rückfrage offen hat, zeigt das — auch wenn zusätzlich Unterlagen fehlen.
 *  - `waiting_for_documents` wird seit F125 aus der **Erwartung** abgeleitet
 *    (`client_accounting_case_expectation`, kind=document), nicht mehr aus
 *    einer Klärung: fehlender Beleg ist keine Frage.
 *  - Der Übergang in ein `closed_*` löst einen Trigger aus, der die
 *    zugehörigen Quelldokumente auf „erledigt" stempelt. **Ein Wieder-Öffnen
 *    nimmt das nicht zurück** (bewusster Verzicht).
 *  - `closed_at` wird nicht von allen Schreibern mitgesetzt — für „wann
 *    geschlossen" ist die Spalte nicht verlässlich.
 *  - Legacy-Werte (`pending_review`/`accepted`/`rejected`/`archived`) sind
 *    seit `20260705113000` weg. Alter Code, der darauf filtert, matcht still
 *    nichts.
 */
const SACHVERHALT_LIFECYCLE: Record<string, StatusDescriptor> = {
  // Pseudowert, KEIN DB-Wert: der Sachverhalt existiert noch nicht, weil der
  // Beleg noch in der Pipeline steckt (`lifecycle_status IS NULL`). Kommt aus
  // dem Dashboard-KPI `countInPipeline` (`dashboard-queries.ts`) und wird dort
  // in derselben Zeile wie die echten Lifecycle-Werte gerendert. Nicht in
  // `CASE_LIFECYCLE` aufnehmen — die Achse bleibt der DB-Wertebereich.
  in_pipeline: { label: "In Bearbeitung", kind: "neutral", description: "Der Beleg steckt noch in der Verarbeitung — es gibt noch nichts zu prüfen." },
  open: { label: "Zur Prüfung", kind: "info", description: "Sachverhalt liegt vor und wartet auf eine Entscheidung." },
  needs_clarification: { label: "Klärung offen", kind: "warning", description: "Eine Rückfrage muss beantwortet werden, bevor gebucht werden kann." },
  waiting_for_documents: { label: "Wartet auf Unterlagen", kind: "neutral", description: "Es fehlt eine Unterlage. Welche, bis wann und wer sie besorgt, steht an der Beleg-Erwartung des Sachverhalts." },
  closed_accepted: { label: "Verbucht", kind: "success", description: "Vorschlag angenommen und abgeschlossen." },
  closed_rejected: { label: "Abgelehnt", kind: "neutral", description: "Vorschlag abgelehnt, Sachverhalt abgeschlossen." },
  closed_superseded: { label: "Veraltet", kind: "neutral", description: "Durch einen anderen Sachverhalt ersetzt (z.B. beim Zusammenführen)." },
};

/**
 * `client_accounting_case.document_number_mode` (F100) — wie viele
 * Belegnummern erwartet dieser Vorgang?
 *
 * Wertebereich: `CASE_DOCUMENT_NUMBER_MODES`
 * (`modules/accounting-cases/domain/case.ts`), DB-CHECK in
 * `20260823110000_case_document_number_mode.sql`.
 *
 * Schreiber: die elf TS-Anlagepfade über `accountingCaseInsert` (Pflichtfeld,
 * kein Default) und die Umstufung (`setCaseDocumentNumberMode`, MCP
 * `update_case` bzw. die Sachverhaltsansicht).
 *
 * Warum hier und nicht bei `CASE_KIND_LABEL`: die Achse hat Übergänge
 * (single → multiple, begründungspflichtig) und braucht einen
 * Legenden-Dialog — genau wofür die Registry da ist. Der
 * Deckungsgleichheits-Test gegen den DB-CHECK kommt damit gratis mit.
 *
 * Fallstricke:
 *  - `single` heißt EINE Nummer über den ganzen Vorgang, nicht „ein Beleg":
 *    Anlagen und Korrekturbelege mit derselben Nummer sind erlaubt.
 *  - Zwei SCHREIBWEISEN derselben Nummer sind auch bei `single` normal
 *    (`2024/07` vs. `2024-07`) — welche gilt, entscheidet
 *    `update_case(decidedDocumentNumber)`, nicht der Modus.
 *  - Bestandsfälle wurden auf `single`/`multiple` zurückgesetzt;
 *    `per_period` entsteht nur vorwärts.
 */
const BELEGNUMMERN_MODUS: Record<string, StatusDescriptor> = {
  single: { label: "Eine Belegnummer", kind: "info", description: "Genau EINE Nummer über den ganzen Vorgang — Einzelrechnung oder Dauersachverhalt mit Dauerrechnung. Ein zweiter Beleg mit abweichender Nummer wird abgelehnt." },
  per_period: { label: "Je Periode eine", kind: "info", description: "Dauersachverhalt ohne Dauerrechnung: jede Periode bringt eine eigene Rechnung mit eigener Nummer. Jede Zahlung braucht die entschiedene Nummer ihrer Periode." },
  multiple: { label: "Mehrere Belegnummern", kind: "warning", description: "Sammelzahlung, OPOS-Pool oder Mandantenstapel — mehrere Nummern nebeneinander. Ziel ist der Split in Einzelsachverhalte; ohne ausgeglichene Klammer schließt der Fall nicht." },
  none: { label: "Ohne Beleg", kind: "neutral", description: "Umbuchung oder reine Korrektur — kein Beleg, keine Nummer. Ludwig vergibt beim Buchen ein synthetisches Belegfeld; das ist hier richtig, nicht auffällig." },
};

/**
 * Buchungs-Zustand eines **Ereignisses** (`client_accounting_event`) —
 * **rein abgeleitet**, es gibt bewusst keine Status-Spalte am Event.
 *
 * Ableitungsregel (in dieser Reihenfolge, `deriveEventBookingState`):
 * `superseded_by_event_id` gesetzt → `superseded`; `no_booking_required_reason`
 * gesetzt → `no_booking_required`; jüngster journal_entry in
 * (proposed|accepted|posted) → dessen Status; sonst → `open`.
 *
 * ## Warum eine eigene Achse neben `sachverhalt` und `buchung`
 * Ein Sachverhalt kann mehrere Ereignisse tragen (Beleg UND Zahlung), und
 * kreditorisch gebucht braucht **jedes** seinen eigenen Satz. Der
 * Sachverhalts-Status sagt deshalb nichts darüber, ob eine bestimmte Zahlung
 * gebucht ist — steht derselbe Sachverhalt zweimal im Kontoauszug, ist unter
 * Umständen nur eine der beiden Zahlungen verbucht. Wo eine Zeile ein
 * Ereignis IST (Kontoauszug, Timeline), gehört diese Achse hin, nicht
 * `sachverhalt`.
 *
 * Von `buchung` unterscheidet sie sich am unteren Ende: dort gibt es kein
 * „es existiert noch gar kein Satz", genau der Zustand ist hier der wichtige.
 *
 * Fallstrick: **`open` heißt fehlende Arbeit, nicht „in Ordnung".** Wer
 * absichtlich nicht bucht (Vertrag, Steuerbescheid), setzt
 * `no_booking_required_reason` — sonst zählt das Ereignis dauerhaft als
 * unvollständig (Gate 3f, `unbooked_events` im Lauf-Abschluss).
 */
const EREIGNIS_BUCHUNG: Record<string, StatusDescriptor> = {
  open: {
    label: "Buchung fehlt",
    kind: "warning",
    description:
      "Für dieses Ereignis liegt Evidenz vor (Beleg oder Bank-Transaktion), aber es gibt noch keinen Buchungssatz.",
  },
  proposed: {
    label: "Vorschlag",
    kind: "info",
    description: "Buchung vorgeschlagen — wartet auf Freigabe, geht so noch nicht nach DATEV.",
  },
  accepted: {
    label: "Freigegeben",
    kind: "success",
    description: "Freigegeben und bereit für den DATEV-Export.",
  },
  posted: {
    label: "Gebucht",
    kind: "success",
    description: "In DATEV festgeschrieben — nur noch stornierbar.",
  },
  no_booking_required: {
    label: "Keine Buchung nötig",
    kind: "neutral",
    description:
      "Für dieses Ereignis entsteht absichtlich keine Buchung. Die hinterlegte Begründung steht am Ereignis.",
  },
  superseded: {
    label: "Ersetzt",
    kind: "neutral",
    description: "Durch ein neueres Ereignis abgelöst (Korrekturbeleg/Doublette).",
  },
  blocked: {
    label: "Benötigt Antwort",
    kind: "warning",
    description: "Eine Rückfrage muss beantwortet werden, bevor hier gebucht werden kann.",
  },
  planned: {
    label: "Geplant",
    kind: "neutral",
    description: "Aus einer Wiederkehr-Regel vorausgeplant — die Evidenz steht noch aus.",
  },
};

/**
 * `client_accounting_case.disposition` — Zuständigkeits-Achse des agentic
 * booking loop: wer ist am Zug? Nullable. Orthogonal zum Lifecycle:
 * ein Sachverhalt kann gleichzeitig `open` und beim Mandanten liegen.
 * Wertebereich: `CASE_DISPOSITION` (`domain/case.ts`), DB-CHECK inline in
 * `20260701120000_agentic_booking_loop.sql`.
 *
 * NULL heißt „in Pipeline-Bearbeitung ODER abgeschlossen" — also nicht
 * „niemand zuständig", sondern „keine Warteschlange".
 *
 * Schreiber: MCP-Agent (Rückfrage → Zielgruppe), Mensch über die
 * Routing-Aktion, Neuberechnung nach beantworteter Klärung. Geschrieben werden
 * seit F128 nur noch `agent` und `accounting` (`CASE_DISPOSITION_WRITABLE`):
 * `client` bleibt als Spaltenwert zulässig, entsteht aber nicht mehr — auch
 * eine Beleg-Erwartung gibt den Sachverhalt nicht mehr ab.
 *
 * Fallstrick: **Nur der Accept-Pfad räumt `disposition` beim Schließen auf.**
 * Der Bulk-Abschluss tut es nicht — geschlossene Sachverhalte können mit
 * gesetzter Zuständigkeit zurückbleiben. Queue-Queries müssen deshalb IMMER
 * zusätzlich auf „nicht abgeschlossen" filtern, sonst tauchen Karteileichen
 * in der Arbeitsliste auf.
 */
const DISPOSITION: Record<string, StatusDescriptor> = {
  agent: { label: "Agent", kind: "info", description: "Der Agent ist am Zug und arbeitet den Sachverhalt auf." },
  accounting: { label: "Kanzlei", kind: "warning", description: "Die Kanzlei ist am Zug — hier wartet Arbeit." },
  client: { label: "Mandant", kind: "neutral", description: "Der Mandant ist am Zug (Rückfrage oder fehlende Unterlage) — derzeit stillgelegt: kein Portal-Betrieb; Fälle liegen bei Agent oder Kanzlei." },
};

/**
 * `client_accounting_case_clarification.severity` — blockiert die Rückfrage
 * die Buchung? NOT NULL. Wertebereich: DB-CHECK in
 * `20260527140000_accounting_data_model.sql`; TS existiert nur als inline
 * `z.enum` an zwei Stellen (kein Domain-Enum).
 *
 * „Beantwortet" ist KEIN eigener Status: offen = `answered_at IS NULL`.
 * Ein zweites Beantworten wirft (Idempotenz-Guard).
 */
/**
 * Zustand einer Klärungsfrage (F105) — **berechnet** aus `answered_at` und
 * `deferred_until` (`clarificationState` in `domain/case.ts`).
 *
 * Nicht zu verwechseln mit der Achse `klaerung`: die sagt, ob eine Frage die
 * Buchung blockiert (required/optional), diese sagt, wo die Frage steht.
 *
 * Fallstricke:
 *  - `deferred` ist KEIN sanftes „erledigt". Die Frage kommt am
 *    Wiedervorlage-Tag von selbst zurück, und beim Schließen eines
 *    Sachverhalts zählt sie wie offen (R-C) — sonst liefe die Wiedervorlage
 *    hinter einem geschlossenen Fall ins Leere.
 *  - Sie endet auch vorzeitig: wartet die Frage auf eine Gegenfrage
 *    (`deferred_by_clarification_id`), macht deren Antwort sie sofort wieder
 *    offen. Der Termin ist dann nur Sicherheitsnetz.
 *  - Ab der dritten Verschiebung darf nur noch ein Mensch verschieben.
 */
const KLAERUNG_STATUS: Record<string, StatusDescriptor> = {
  open: { label: "Offen", kind: "warning", description: "Wartet auf eine Antwort und steht auf der Arbeitsliste." },
  deferred: { label: "Zurückgestellt", kind: "neutral", description: "Bewusst nicht jetzt dran — kommt am Wiedervorlage-Tag von selbst zurück. Nicht erledigt." },
  answered: { label: "Beantwortet", kind: "success", description: "Beantwortet oder als gegenstandslos aufgelöst." },
};

/**
 * `client_accounting_case_clarification.type` — welche Sorte Eintrag in der
 * Historie des Sachverhalts steht. NOT NULL, Default `question`. Wertebereich:
 * DB-CHECK `client_accounting_case_clarification_type_check`, Domain-Enum
 * `CLARIFICATION_TYPES`.
 *
 * Fallstrick: „offen" heißt seitdem `answered_at is null` UND
 * `type='question'`. Die Bedingung wohnt an genau einer Stelle
 * (`core/db/clarification-open.ts`) — wer sie in einer Query selbst schreibt,
 * zählt Kommentare als offene Fragen.
 */
const KLAERUNG_TYP: Record<string, StatusDescriptor> = {
  question: { label: "Frage", kind: "info", description: "Erwartet eine Reaktion. Steht auf der Arbeitsliste, solange sie unbeantwortet und nicht zurückgestellt ist." },
  comment: { label: "Kommentar", kind: "neutral", description: "Kontext ohne Aktion — Merkposten, Begründung, Zwischenstand. Blockiert nichts und wird nie beantwortet." },
};

const KLAERUNG_SEVERITY: Record<string, StatusDescriptor> = {
  required: { label: "Blockierend", kind: "warning", description: "Muss beantwortet werden, bevor gebucht werden kann." },
  optional: { label: "Optional", kind: "neutral", description: "Hilfreich, aber die Buchung kann auch ohne Antwort erfolgen." },
};

/**
 * Reife einer Erwartung (`client_accounting_case_expectation`, W2a) — wie
 * lange wird schon gewartet? **Berechnet, nicht gespeichert**: `due_date`
 * gegen heute, dazu `escalation_level` und `resolved_at`
 * (`expectationMaturity` in `domain/case.ts`).
 *
 * Genau diese Achse fehlte vor W2a, und ihr Fehlen war der Befund: eine
 * Beleg-Nachforderung war am ersten Tag so dringend wie im dritten Monat
 * (`sachverhalt-offen.md` P4).
 *
 * Fallstricke:
 *  - `escalated` ist LUDWIGS Reife, nicht die DATEV-Mahnstufe. Das Mahnwesen
 *    führt DATEV (205 Mahnstufen, alle auf Debitoren); hier wird nur gelesen.
 *    Eine zweite Wahrheit wäre ab Tag eins widersprüchlich.
 *  - Hochgestuft wird im Vorbereitungslauf, nicht per Cron — die Frist wird
 *    faktisch in LÄUFEN gemessen. Ein Mandant ohne Lauf im Monat bekommt
 *    keine Eskalation (bewusstes Restrisiko, im Code vermerkt).
 *  - `pending` entlastet das Buch-Gate, `due` und `escalated` nicht mehr.
 */
const ERWARTUNG_REIFE: Record<string, StatusDescriptor> = {
  pending: { label: "Läuft", kind: "neutral", description: "Die Frist läuft noch — normaler Lauf der Dinge, keine Arbeit." },
  due: { label: "Fällig", kind: "warning", description: "Die Frist ist verstrichen. Der Sachverhalt zählt wieder als offene Arbeit." },
  escalated: { label: "Eskaliert", kind: "danger", description: "Mehrfach überfällig — ein Vorbereitungslauf hat sie hochgestuft." },
  resolved: { label: "Erledigt", kind: "success", description: "Durch ein Ereignis aufgelöst: der Beleg kam an bzw. die Zahlung ging ein." },
};

/**
 * `client_accounting_case_expectation.kind` — worauf gewartet wird. NOT NULL.
 * Wertebereich: DB-CHECK `client_accounting_case_expectation_kind_check`,
 * Domain-Enum `EXPECTATION_KINDS`.
 *
 * Beide Richtungen wohnen bewusst in derselben Tabelle: erwarteter Beleg und
 * erwartete Zahlung sind dieselbe Liste, nur andersherum — und genau diese
 * Liste braucht der Kontoauszugs-Abgleich zum Matching.
 */
const ERWARTUNG_ART: Record<string, StatusDescriptor> = {
  document: { label: "Beleg fehlt", kind: "warning", description: "Zu diesem Sachverhalt fehlt noch ein Beleg." },
  payment: { label: "Zahlung offen", kind: "info", description: "Die Buchung steht, die Zahlung ist noch nicht eingegangen bzw. geleistet." },
};

/**
 * Triage-Bucket für den Abschluss-Screen — **rein abgeleitet**, keine
 * DB-Spalte, kein LLM (`domain/acceptance-triage.ts`). Fasst Judge-Verdikt
 * und Zeilen-Ampeln zu einer Empfehlung zusammen, wie genau ein Vorschlag
 * angesehen werden sollte.
 *
 * Regel (in dieser Reihenfolge): kein Verdikt oder `flag` → prüfen; schlechteste
 * Ampel rot → prüfen; `adjust` → kurz ansehen; `confirm` mit gelb/orange →
 * kurz ansehen; sonst durchwinken. Auf Sachverhalts-Ebene gilt der
 * schlechteste Bucket seiner Vorschläge.
 *
 * Fallstrick: **Ungeprüft ist nicht grün.** Ein Vorschlag ohne Judge-Verdikt
 * landet bewusst in „prüfen", nicht in „durchwinken" — ebenso ein Sachverhalt
 * ganz ohne Vorschlag. **Ausnahme** (F69): ein importierter Mandantenstapel
 * (`origin='client_import'`) hat nie ein Verdikt und ist trotzdem nicht
 * ungeprüft — der Mandant hat gebucht. Er bekommt den eigenen Bucket
 * „übernehmen".
 */
const TRIAGE: Record<string, StatusDescriptor> = {
  pruefen: { label: "Prüfen", kind: "warning", description: "Genau ansehen — ungeprüft, beanstandet oder mit roter Ampel." },
  kurz_ansehen: { label: "Kurz ansehen", kind: "info", description: "Vom Judge angepasst oder mit gelber Ampel — ein Blick genügt meist." },
  durchwinker: { label: "Durchwinker", kind: "success", description: "Bestätigt und unauffällig — kann ohne Detailprüfung freigegeben werden." },
  uebernehmen: { label: "Übernehmen", kind: "info", description: "Vom Mandanten selbst gebucht (Stapel-Import) — nicht vom Agenten vorgeschlagen, kein Judge-Verdikt." },
};

/**
 * `client_accounting_event.kind` — was an einem Sachverhalt passiert ist.
 * NOT NULL, DB-CHECK `client_accounting_event_kind_check`; Wertebereich
 * `EVENT_KINDS` (`modules/accounting-cases/domain/case.ts`).
 *
 * Keine Schwere und keine Reihenfolge: die Art sagt, **was** passiert ist,
 * nicht wie gut oder wie weit. Deshalb tragen alle Werte `neutral` (V6). Die
 * zeitliche Ordnung steckt im Datum, nicht in der Art.
 *
 * Fallstricke:
 *  - `internal_transfer` ist eine Bewegung zwischen zwei eigenen Konten, kein
 *    Zahlungsein- oder -ausgang — sie taucht auf beiden Kontoauszügen auf und
 *    darf nur einmal gebucht werden.
 *  - `open_item_carryover` ist kein Vorgang des Jahres, sondern ein
 *    übernommener offener Posten aus DATEV. Er trägt kein eigenes Dokument.
 */
const EREIGNIS_ART: Record<string, StatusDescriptor> = {
  document_received: { label: "Beleg eingegangen", kind: "neutral", description: "Ein Dokument ist dem Sachverhalt zugeordnet worden." },
  payment_in: { label: "Zahlungseingang", kind: "neutral", description: "Geld ist auf einem Konto des Mandanten eingegangen." },
  payment_out: { label: "Zahlungsausgang", kind: "neutral", description: "Geld hat ein Konto des Mandanten verlassen." },
  internal_transfer: { label: "Umbuchung", kind: "neutral", description: "Bewegung zwischen zwei eigenen Konten — steht auf beiden Auszügen, wird einmal gebucht." },
  adjustment: { label: "Korrektur", kind: "neutral", description: "Nachträgliche Richtigstellung am Sachverhalt." },
  accrual: { label: "Abgrenzung", kind: "neutral", description: "Periodengerechte Zuordnung über den Zeitraum hinweg." },
  open_item_carryover: { label: "Offener Posten (Vortrag)", kind: "neutral", description: "Aus DATEV übernommener offener Posten — kein Vorgang dieses Jahres, ohne eigenes Dokument." },
};

// ══════════════════════════════════════════════════════════════════════
// BUCHUNG & EXPORT
// ══════════════════════════════════════════════════════════════════════

/**
 * `client_journal_entry.status` — Audit-Achse der Buchung. NOT NULL.
 * Wertebereich: `ENTRY_STATUS` (`modules/entries/domain/entry.ts`), DB-CHECK
 * in `20260527140000_accounting_data_model.sql`.
 *
 * Die zwei nicht-offensichtlichen Punkte:
 *  - **Exportiert wird ausschließlich `accepted`**, NICHT `posted` (siehe
 *    GLOSSARY.md „Buchungsstapel"). Daher das Label „Freigegeben": der
 *    Reviewer gibt für DATEV frei, er schreibt nicht fest.
 *  - **`posted` ist reserviert** für eine künftige EIGENE Festschreibung
 *    (Owner-Entscheidung 2026-07-04). Heute entsteht der Wert im Normalbetrieb
 *    nur über den DATEV-Import und heißt dort „ist in DATEV bereits Ist".
 *    Wer `posted` als „vom Nutzer gebucht" liest, liegt falsch.
 *
 * Immutabilität: Ist `exported_at` gesetzt oder `is_locked` wahr, ist die
 * Buchung nur noch stornierbar — kein Edit, kein Reject, kein Delete. Sonst
 * driftet Ludwig gegen DATEV (Variante A). **Diese Guards leben im
 * Application-Layer, nicht in der DB** — direkter SQL-Zugriff umgeht sie.
 *
 * Nicht verwechseln mit `acceptance_quality` (wie wurde angenommen) und
 * `origin` (woher kam die Zeile) — eigene Achsen an derselben Tabelle.
 */
const BUCHUNG_STATUS: Record<string, StatusDescriptor> = {
  proposed: { label: "Vorschlag", kind: "info", description: "Buchungsvorschlag des Agenten — wartet auf Freigabe, geht so noch nicht nach DATEV." },
  accepted: { label: "Freigegeben", kind: "success", description: "Vom Reviewer freigegeben und bereit für den DATEV-Export." },
  posted: { label: "Gebucht", kind: "success", description: "In DATEV festgeschrieben — nur noch stornierbar, nicht mehr änderbar." },
  reversed: { label: "Storniert", kind: "neutral", description: "Durch eine Storno-Buchung aufgehoben." },
};

/**
 * Abgeleitete Achse „Weg nach DATEV" (2026-08-14) — **keine Spalte**, sondern
 * `deriveEntryDatevStage` (`modules/entries/domain/entry.ts`) aus `status` +
 * `exported_at` + `datev_mirror_entry_id`. Linearisiert den eindeutigen Weg
 * Vorschlag → Freigegeben → Exportiert → In DATEV bestätigt fürs UI.
 * Seit F158 liefert `get_case` die Stufe je Satz als `datevStage`.
 *
 * Fallstricke:
 *  - **Exportiert ≠ angekommen** (Live-Learning: DATEV-Push antwortet 204,
 *    ohne dass der Stapel ankommt). Erst der Spiegel-Match
 *    (`datev_mirror_entry_id`) ist der Beweis — deshalb zwei Stufen.
 *  - `posted` (Status-Achse) zählt als `in_datev`: der Wert entsteht heute
 *    nur über den DATEV-Import und heißt „ist in DATEV bereits Ist".
 */
const BUCHUNG_DATEV_STAGE: Record<string, StatusDescriptor> = {
  proposed: { label: "Vorschlag", kind: "info", description: "Buchungsvorschlag — wartet auf Freigabe durch die Kanzlei." },
  accepted: { label: "Freigegeben", kind: "success", description: "Von der Kanzlei freigegeben — steht für den nächsten DATEV-Export bereit." },
  exported: { label: "Exportiert", kind: "info", description: "An DATEV übergeben, aber dort noch nicht wiedergefunden. Export ist eine Behauptung — bestätigt ist die Buchung erst mit dem Abgleich." },
  in_datev: { label: "In DATEV bestätigt", kind: "success", description: "Im DATEV-Bestand wiedergefunden (Rückspiegelung) — der finale Zustand." },
  reversed: { label: "Storniert", kind: "neutral", description: "Durch eine Storno-Buchung aufgehoben." },
};

/**
 * `client_journal_entry.origin` — woher die Buchung stammt. NOT NULL.
 * Wertebereich: `ENTRY_ORIGIN` (`modules/entries/domain/entry.ts`), DB-CHECK
 * zuletzt in `20260716170000_journal_entry_origin_recurring_rule_created_by.sql`.
 *
 * Fallstricke:
 *  - **`origin` ist nicht stabil.** Korrigiert ein Mensch einen Agent- oder
 *    Regelwerk-Vorschlag, flippt der Wert auf `manual`. Wer Agent-Metriken
 *    baut, darf nicht auf `origin` allein zählen — die Historie steckt danach
 *    in `acceptance_quality` (`ai_edited`).
 *  - `recurring_rule`-Sätze werden vom DATEV-Export ausgeschlossen und bleiben
 *    unmarkiert.
 *  - `system_reversal` ist vorgesehen, der Flow existiert noch nicht.
 */
const BUCHUNG_ORIGIN: Record<string, StatusDescriptor> = {
  ai_proposed: { label: "KI-Vorschlag", kind: "info", description: "Vom Agenten vorgeschlagen und unverändert übernommen." },
  manual: { label: "Manuell", kind: "neutral", description: "Von Hand erfasst — oder ein Vorschlag, den jemand korrigiert hat." },
  recurring_rule: { label: "Regelwerk", kind: "info", description: "Vom Regelwerk wiederkehrender Buchungen erzeugt. Wird nicht nach DATEV exportiert." },
  system_reversal: { label: "Storno", kind: "neutral", description: "Automatische Gegenbuchung zu einer stornierten Buchung." },
  client_import: { label: "Mandantenstapel", kind: "info", description: "Aus dem Buchungsstapel des Mandanten importiert (F69) — er hat in seiner eigenen Software gebucht, die Kanzlei nimmt ab. Kein Agent-Vorschlag, kein Judge-Verdikt." },
};

/**
 * Ampel je **Buchungssatz** — **keine Spalte**, sondern gebandet aus
 * `client_journal_entry.proposal_confidence` (`entryConfLevel` in
 * `ui/booking/format.ts`: ≥85 grün, ≥70 gelb, ≥50 orange, <50 rot; manuell
 * gebucht = grün). Dieselbe Ableitung speist Abnahme-UI und Triage.
 *
 * Owner-Entscheid 2026-08-29: Bewertung nur auf Satzebene, der Mensch liest
 * den Satz ohnehin ganz. Die frühere Zeilen-Ampel
 * `client_journal_entry_line.confidence` (DB-CHECK in
 * `20260705130000_journal_line_confidence.sql`) ist **tot** — wird weder vom
 * Agenten noch vom Judge geschrieben und von niemandem gelesen; Altwerte
 * bleiben stehen.
 */
const KONFIDENZ: Record<string, StatusDescriptor> = {
  green: { label: "Sicher", kind: "success", description: "Eindeutig belegt (Historie oder Vertrag)." },
  yellow: { label: "Plausibel", kind: "info", description: "Gut gestützt, aber nicht durch Historie oder Vertrag bestätigt." },
  orange: { label: "Unsicher", kind: "warning", description: "Bitte Konto und Steuerschlüssel prüfen." },
  red: { label: "Geraten", kind: "danger", description: "Belastbare Grundlage fehlt. Nicht ungeprüft freigeben." },
};

/**
 * Judge-Verdikt zu einem Buchungsvorschlag. **Keine Spalte** — der Judge
 * hängt sein Ergebnis als JSON-Element an
 * `client_journal_entry.proposal_rationale->'judge'[]` an.
 *
 * Fallstricke:
 *  - Das Array wird **angehängt, nie ersetzt** — mehrere Verdikte pro Satz
 *    sind der Normalfall.
 *  - Die bestehenden Lese-Queries filtern auf `verdict = 'flag'`; der so
 *    gelesene Wert ist also nur `flag` oder NULL, NICHT das letzte Verdikt.
 *    Wer „letztes Verdikt" braucht, muss anders lesen.
 */
const JUDGE_VERDICT: Record<string, StatusDescriptor> = {
  confirm: { label: "Bestätigt", kind: "success", description: "Der Judge hält den Vorschlag für richtig." },
  confirm_with_note: { label: "Bestätigt mit Hinweis", kind: "info", description: "Richtig gebucht, aber die Abnahme soll einen Punkt prüfen — keine Reparaturpflicht." },
  adjust: { label: "Angepasst", kind: "info", description: "Der Judge hat Buchungstext, Belegfeld oder Kostenstelle korrigiert — fachlich ist der Satz in Ordnung." },
  flag: { label: "Beanstandet", kind: "warning", description: "Der Judge hat Zweifel — bitte selbst prüfen." },
};

/**
 * Export-Stand je Sachverhalt — **abgeleitet**, keine Spalte
 * (`deriveCaseExportStatus` in `domain/case.ts`) aus der Zahl freigegebener
 * gegenüber exportierter Buchungen. `null` (nichts freigegeben) hat bewusst
 * keinen Eintrag: dann wird gar kein Chip gezeigt.
 */
const EXPORT_CASE: Record<string, StatusDescriptor> = {
  exportiert: { label: "Exportiert", kind: "success", description: "Alle freigegebenen Buchungen sind in einem DATEV-Stapel." },
  teilweise: { label: "Teilweise", kind: "warning", description: "Ein Teil der freigegebenen Buchungen wartet noch auf den Export." },
  offen: { label: "Nicht exportiert", kind: "info", description: "Freigegeben, aber noch in keinem DATEV-Stapel." },
};

/**
 * Bucket je Buchungssatz im DATEV-Export-Panel — **abgeleitet**
 * (`bucketOf` in `datev-export/application/export-status-core.ts`).
 * Präzedenz strikt: storniert → exportiert → exportierbar → offen → importiert.
 *
 * Basis sind `exported_at`/`export_batch_id`; der Export-Lauf stempelt nur
 * Sätze mit `status='accepted' AND exported_at IS NULL`.
 *
 * Fallstricke:
 *  - **Kein Un-Export.** Ein Fehl-Export wird storniert und neu gestapelt.
 *  - Ein `posted`-Satz ohne DATEV-Herkunft fällt aus allen Buckets und
 *    verschwindet aus dem Panel.
 *  - Export ist bewusst kein Agenten-Werkzeug — er bleibt menschlich.
 */
const EXPORT_BUCKET: Record<string, StatusDescriptor> = {
  exported: { label: "Exportiert", kind: "success", description: "In einem DATEV-Stapel übergeben — nur noch stornierbar." },
  exportable: { label: "Exportierbar", kind: "info", description: "Freigegeben und wartet auf den nächsten Export-Lauf." },
  pending: { label: "Offen", kind: "warning", description: "Noch ein Vorschlag — muss erst freigegeben werden." },
  reversed: { label: "Storniert", kind: "neutral", description: "Storno oder stornierter Satz." },
  imported: { label: "Aus DATEV", kind: "neutral", description: "Bestand aus DATEV — nur zur Information, wird nicht erneut exportiert." },
};

// ══════════════════════════════════════════════════════════════════════
// BUCHUNGSLAUF
// ══════════════════════════════════════════════════════════════════════

/**
 * Ausgang eines Buchungslaufs — **rein abgeleitet, keine Spalte**
 * (`runOutcome` in `accounting-cases/application/agent-runs-view.ts`).
 * Gespeichert werden nur `started_at`, `finished_at`, `current_step_code`
 * und das Step-Log; der Ausgang wird daraus pro Anzeige frisch gerechnet.
 *
 * Ableitung (in dieser Reihenfolge): `finished_at` + Abschluss-Spuren
 * (Handover-Stats bzw. 4a grün) → `completed`, mit offenen Teilschritten →
 * `incomplete`; `finished_at` ohne Abschluss-Spuren → `superseded`
 * (Zwangsschluss beim Start des Folgelaufs); letzte Log-Zeile `blocked` →
 * `blocked`; sonst offen: < 30 min Step-Aktivität → `running`, darüber →
 * `abandoned`.
 *
 * Fallstricke:
 *  - **`abandoned` ist reine Anzeige, kein Timeout-Schreiber.** Ein still
 *    gewordener Lauf darf jederzeit am selben Schritt weitermachen (Gates
 *    sind zustandsbasiert); erst der Start des Folgelaufs schließt ihn
 *    dauerhaft (→ `superseded`, mit Audit-Event).
 *  - Die Aktivitätsmessung schaut nur aufs Step-Log — Subagenten, die
 *    Ereignisse/Buchungen schreiben, zählen (noch) nicht als Aktivität. Ein
 *    „abgebrochener" Lauf kann also gerade arbeiten.
 *  - `blocked` heißt „der letzte Übergangsversuch wurde abgelehnt", nicht
 *    „für immer fest": wird das Gate grün, geht es genau dort weiter.
 */
const LAUF_OUTCOME: Record<string, StatusDescriptor> = {
  completed: { label: "Durchgelaufen", kind: "success", description: "Alle Teilschritte bis 4a grün — der Lauf hat mit finish_agent_run abgeschlossen und einen Übergabebericht hinterlassen." },
  incomplete: { label: "Unvollständig abgeschlossen", kind: "warning", description: "Abgeschlossen, aber mindestens ein Teilschritt trägt kein grünes Ergebnis — Arbeit für den nächsten Lauf oder einen Menschen." },
  superseded: { label: "Abgebrochen (Folgelauf)", kind: "warning", description: "Nie abgeschlossen; der Start des nächsten Laufs hat den Lauf automatisch geschlossen. Kein Bericht, keine Kennzahlen." },
  blocked: { label: "Steckengeblieben", kind: "danger", description: "Der letzte Übergangsversuch scheiterte an einem roten Gate. Sobald die offenen Posten aufgelöst sind, geht es genau dort weiter." },
  running: { label: "Läuft", kind: "info", description: "Offen und vor Kurzem noch aktiv." },
  abandoned: { label: "Abgebrochen", kind: "warning", description: "Offen und seit über 30 Minuten ohne Schritt-Aktivität — die Agent-Session ist vermutlich weg. Ein neuer Lauf steigt am letzten Schritt wieder ein." },
};

/**
 * `client_agent_run_steps.gate_result` — wie eine Step-Log-Zeile ausging.
 * NULL = Schritt betreten und noch offen (genau eine Zeile pro Lauf darf so
 * stehen). Wertebereich: die Schreiber in `agent-run-steps-core.ts` /
 * `agent-run-core.ts` (kein DB-CHECK, kein Domain-Enum).
 *
 * Schreiber: `enter_step` schreibt `blocked` (abgelehnter Übergang) und
 * `overridden` (begründete Ausnahme) sofort komplett; beim Verlassen wird die
 * offene Zeile auf `passed` gestempelt; `finish_agent_run` stempelt nie
 * betretene grüne Schritte `auto_passed` und beim Abschluss noch rote
 * `unresolved` (lückenloses Step-Log, 2026-08-15).
 *
 * Fallstricke:
 *  - **`blocked` ist kein Endzustand des Laufs**, sondern ein Protokolleintrag:
 *    derselbe Schritt kann später `passed` sein (Gates sind zustandsbasiert).
 *  - `running` ist ein Pseudowert der UI für die offene Zeile — kein DB-Wert.
 */
const LAUF_GATE: Record<string, StatusDescriptor> = {
  passed: { label: "Bestanden", kind: "success", description: "Der Agent hat im Schritt gearbeitet und ihn grün verlassen." },
  auto_passed: { label: "Automatisch grün", kind: "success", description: "Nichts zu tun: der Server hat das Gate aus den Daten heraus als erfüllt gerechnet. Erledigt, nicht übersprungen." },
  blocked: { label: "Blockiert", kind: "danger", description: "Übergang abgelehnt — das Gate war zu diesem Zeitpunkt rot. Zweimal dasselbe Gate = Eskalation an den Menschen. Kein Endzustand: wird das Gate grün, geht es weiter." },
  overridden: { label: "Ausnahme", kind: "warning", description: "Mit begründeter Ausnahme passiert; jeder offene Fall musste exakt benannt werden." },
  unresolved: { label: "Beim Abschluss rot", kind: "danger", description: "Beim Lauf-Abschluss war das Gate noch rot — der Lauf ist ein unvollständiger Abschluss, kein Durchlauf." },
  running: { label: "Läuft", kind: "info", description: "Schritt betreten und noch offen (DB-Wert: NULL)." },
};

// ══════════════════════════════════════════════════════════════════════
// STAMMDATEN
// ══════════════════════════════════════════════════════════════════════

/**
 * `client_business_partners.onboarding_state` — Reifegrad eines Geschäftspartners. NOT NULL,
 * Default `draft`. Wertebereich: `ONBOARDING_STATE`
 * (`modules/business-partners/domain/business-partner.ts`), DB-CHECK aus
 * `20260424100000_creditor_profiling.sql`.
 *
 * Schreiber (2026-08-14): der DATEV-Onboarding-Import schreibt direkt
 * `confirmed` (Stammsatz ist vom Mandanten bestätigt; das LLM-Enrichment
 * ändert NUR Profil-Felder, nicht den Status). Agent-Neuanlage
 * (`accept-proposal-core`) und manuelle Neuanlage schreiben `proposed`;
 * der Bestätigen-Klick hebt `proposed` → `confirmed`.
 *
 * Fallstricke:
 *  - **`draft` hat keinen Schreiber mehr** — nur DB-Default; Bestände aus
 *    Importen vor 2026-08-14 können noch draft/proposed tragen.
 *  - `proposed → confirmed` ist der einzige implementierte Übergang, und er
 *    ist einbahnig.
 */
const PARTNER_STATE: Record<string, StatusDescriptor> = {
  draft: { label: "Entwurf", kind: "neutral", description: "Angelegt, aber noch nicht ausgearbeitet." },
  proposed: { label: "Vorgeschlagen", kind: "warning", description: "Automatisch erkannt oder neu angelegt — wartet auf Bestätigung durch die Kanzlei." },
  confirmed: { label: "Bestätigt", kind: "success", description: "Geprüft und bebuchbar." },
};

/**
 * `client_ledger_accounts.status` — NOT NULL, Default `inactive`.
 * Wertebereich: `ACCOUNT_STATUSES` (`modules/accounts/domain/account.ts`),
 * DB-CHECK aus `20260508120001_ledger_accounts_status_inactive.sql`.
 *
 * Fallstricke:
 *  - **`active` heißt real „importiert ODER bebucht".** Der DATEV-Import
 *    setzt pauschal `active`, die Aggregation setzt `active` ab der ersten
 *    Buchung. Der Spalten-Default ist trotzdem `inactive`.
 *  - Die Aggregation stuft nie zurück: einmal `active`, immer `active` —
 *    auch wenn alle Buchungen storniert werden.
 *  - `archived` gibt es seit dem Rename NICHT mehr. Code, der es schreibt,
 *    läuft in eine Constraint-Verletzung; Filter darauf sind No-ops.
 */
const KONTO_STATUS: Record<string, StatusDescriptor> = {
  active: { label: "Aktiv", kind: "success", description: "Importiert oder bereits bebucht — steht für Buchungen bereit." },
  inactive: { label: "Inaktiv", kind: "neutral", description: "Angelegt, aber noch nie bebucht." },
};

/**
 * `client_ledger_accounts.datev_sync_state` — Sync-Zustandsmaschine des
 * Kontos gegenüber DATEV (F76; ersetzt `needs_datev_creation` + den
 * impliziten 89xxxx-Platzhalter-Test). NOT NULL, Default `synced`.
 * DB-CHECK aus `20260821150000_business_partner_merge.sql`.
 *
 * Fallstricke:
 *  - Orthogonal zu `status` (aktiv/inaktiv): das ist eine fachliche
 *    Aussage, keine Sync-Aussage.
 *  - `local_only` heißt bei `source='system_allocated'` zusätzlich:
 *    die Nummer ist ein Ludwig-Platzhalter (89xxxx) — DATEV vergibt beim
 *    Anlegen eine echte.
 *  - Der Bridge-Writeback (`setPersonalAccountDatev`) stellt auf `synced`.
 */
const KONTO_DATEV_SYNC: Record<string, StatusDescriptor> = {
  local_only: { label: "Nur in Ludwig", kind: "warning", description: "Ludwig kennt das Konto, DATEV noch nicht — der nächste Export legt es an (ggf. 89xxxx-Platzhalter)." },
  creation_pending: { label: "Anlage läuft", kind: "info", description: "Anlage an die DATEV-Bridge übergeben, Antwort steht aus." },
  synced: { label: "In DATEV", kind: "success", description: "Nummer (und ggf. DATEV-GUID) stehen — Writeback erledigt." },
  disappeared: { label: "Verschwunden", kind: "danger", description: "Ein DATEV-Re-Import kennt dieses Konto nicht mehr." },
};

/**
 * `client_ledger_accounts.accounting_role` — fachliche Rolle des Kontos.
 * Wertebereich: `ACCOUNT_TYPES` (`domain/account.ts`), DB-CHECK aus
 * `20260509130000_rename_account_role_skr_class.sql`. Kein Status im engeren
 * Sinn, wird aber überall als farbiger Chip neben dem Status gezeigt.
 */
const KONTO_TYP: Record<string, StatusDescriptor> = {
  general_ledger: { label: "Sachkonto", kind: "neutral", description: "Normales Sachkonto des Kontenrahmens." },
  creditor: { label: "Kreditor", kind: "info", description: "Personenkonto eines Lieferanten." },
  debtor: { label: "Debitor", kind: "info", description: "Personenkonto eines Kunden." },
  revenue: { label: "Erlöskonto", kind: "success", description: "Konto für Erlöse." },
  other: { label: "Sonstiges", kind: "neutral", description: "Keiner der übrigen Rollen zugeordnet." },
};

/**
 * `client_ledger_accounts.clearing_account_type` — Verrechnungskonto-Kategorie
 * (F103). NULL = kein Verrechnungskonto und deshalb hier ohne Eintrag; die
 * Spalte trägt also KEINEN Wert „normal". Wertebereich: `CLEARING_ACCOUNT_TYPES`
 * (`modules/accounts/domain/clearing-account.ts`), DB-CHECK
 * `client_ledger_accounts_clearing_account_type_check`.
 *
 * Geschrieben wird ausschließlich von `confirmClearingAccounts` — Onboarding-
 * Review und Mandanteneinstellungen sind Caller, der Agent schreibt nie.
 *
 * Zwei Achsen hängen an der Kategorie und stehen in den Erklärtexten, weil sie
 * das Verhalten steuern: **Zielsaldo null** (geht in die Verprobung des
 * Buchungslaufs) und **zahlungsfähig** (darf ein Zahlungskonto werden).
 * `shareholder` und `payroll_liability` tragen zulässig einen Saldo — sie
 * bewusst nicht als „Fehler" färben.
 */
const VERRECHNUNGSKONTO: Record<string, StatusDescriptor> = {
  credit_card: {
    label: "Kreditkarte",
    kind: "info",
    description:
      "Firmenkarte: Umsätze im Haben, Sammellastschrift im Soll. Zielsaldo null je Abrechnung. Zahlungsfähig — bekommt ein Zahlungskonto.",
  },
  employee_expense: {
    label: "Spesen",
    kind: "info",
    description:
      "Mitarbeiterauslagen: privat verauslagt, per Überweisung erstattet. Zielsaldo null je Abrechnung. Zahlungsfähig — bekommt ein Zahlungskonto.",
  },
  payment_gateway: {
    label: "Zahlungsdienstleister",
    kind: "info",
    description:
      "PayPal, Stripe, Klarna: eine Auszahlung sammelt viele Einzelumsätze. Zielsaldo null je Auszahlung. Zahlungsfähig — bekommt ein Zahlungskonto.",
  },
  payroll: {
    label: "Lohnverrechnung",
    kind: "warning",
    description:
      "Lohnjournal gegen Netto/SV/LSt. Muss dauerhaft auf null stehen — ein Saldo heißt, der Lohnlauf ist unvollständig gebucht. Kein Zahlungskonto.",
  },
  payroll_liability: {
    label: "Lohnverbindlichkeiten",
    kind: "neutral",
    description:
      "Offene Netto-Löhne, Lohnsteuer, SV bis zur Zahlung. Trägt zwischen Lohnlauf und Zahltag zu Recht einen Saldo — keine Verprobung. Kein Zahlungskonto.",
  },
  shareholder: {
    label: "Gesellschafter",
    kind: "neutral",
    description:
      "Verrechnung mit Gesellschafter/Geschäftsführer. Saldo erlaubt, keine Verprobung. Kein Zahlungskonto. Wird nicht automatisch erkannt — nur manuell zuweisbar.",
  },
  suspense: {
    label: "Klärung",
    kind: "warning",
    description:
      "Durchlaufende Posten: Unklares, bis der Sachverhalt geklärt ist. Muss vor dem Abschluss leer sein. Kein Zahlungskonto.",
  },
  money_transit: {
    label: "Geldtransit",
    kind: "warning",
    description:
      "Umbuchung zwischen zwei eigenen Geldkonten. Muss auf null stehen. Trotz DATEV-Kontenfunktion 10 KEIN Zahlungskonto — niemand zahlt „per Geldtransit\".",
  },  central_settlement: {
    label: "Zentralregulierung",
    kind: "warning",
    description:
      "Zentralregulierer (DZB, ZEG …): die Lieferantenrechnungen laufen einzeln auf die Kreditoren, die Sammellastschrift geht gegen dieses Konto, die Abrechnung löst es je Position auf. Muss je Abrechnung auf null stehen. Kein Zahlungskonto.",
  },
};

/**
 * Mitgliedschafts-/Account-Status. Gilt gleichlautend für
 * `platform_tenant_users.status`, `platform_client_users.status` und
 * `platform_users.status`. Wertebereich: `MEMBERSHIP_STATUS`
 * (`modules/auth/domain/role.ts`), DB-CHECKs je Tabelle.
 *
 * Fallstrick: **Es gibt zwei unabhängige Status-Spalten pro Person** — den
 * Account (`platform_users`) und die Mitgliedschaft (`platform_tenant_users`).
 * Sie werden NIE synchronisiert. Die Einladung setzt bewusst asymmetrisch:
 * Account `invited`, Mitgliedschaft schon `active` — sonst greift die
 * RLS-Prüfung nach dem Annehmen der Einladung nicht. Die Autorisierung liest
 * die Mitgliedschaft; wer den Account-Status prüft, prüft das Falsche.
 */
const BENUTZER_STATUS: Record<string, StatusDescriptor> = {
  active: { label: "Aktiv", kind: "success", description: "Zugang eingerichtet und nutzbar." },
  invited: { label: "Eingeladen", kind: "warning", description: "Einladung verschickt, aber noch nicht angenommen." },
  disabled: { label: "Deaktiviert", kind: "neutral", description: "Zugang gesperrt." },
};

/**
 * `platform_users.kind` — Art des Benutzerkontos. Wertebereich: `USER_KINDS`
 * (`modules/auth/domain/role.ts`), DB-CHECK `platform_users_kind_check`.
 */
const BENUTZER_ART: Record<string, StatusDescriptor> = {
  tenant_user: { label: "Steuerberater", kind: "info", description: "Mitarbeiter der Kanzlei." },
  client_user: { label: "Mandant", kind: "neutral", description: "Zugang auf Mandantenseite — sieht nur das Mandantenportal." },
  platform_admin: { label: "Plattform-Admin", kind: "warning", description: "Vollzugriff über alle Kanzleien hinweg." },
};

/**
 * `DisplayRole` — **berechnet, keine Spalte** (`modules/auth/domain/role.ts`).
 * Die Rolle, die im UI-Chrome angezeigt wird.
 *
 * Fallstrick: `pending` heißt „angemeldet, aber weder Benutzer-Zeile noch
 * Mitgliedschaft vorhanden" — ein unfertiger Zustand, kein Wartezustand mit
 * Selbstheilung. Fehlt in manchen älteren Label-Maps, weshalb dort still
 * „unbekannt" erschien.
 */
const ROLLE: Record<string, StatusDescriptor> = {
  platform_admin: { label: "Plattform-Admin", kind: "warning", description: "Vollzugriff über alle Kanzleien hinweg." },
  tenant_user: { label: "Steuerberater", kind: "info", description: "Mitarbeiter der Kanzlei." },
  client_user: { label: "Mandant", kind: "neutral", description: "Zugang auf Mandantenseite." },
  pending: { label: "Ohne Zuordnung", kind: "danger", description: "Angemeldet, aber keiner Kanzlei und keinem Mandanten zugeordnet — der Zugang ist unvollständig." },
};

/**
 * `client_fiscal_years.status` — Buchungsjahr offen oder geschlossen.
 * NOT NULL, Default `open`. Wertebereich: `CYCLE_STATUS`
 * (`modules/cycles/domain/cycle.ts`), DB-CHECK aus
 * `20260422140000_buchassi_onboarding_schema.sql`.
 *
 * Fallstricke:
 *  - **Es gibt keinen Schließen-Pfad in der App.** `closed` entsteht
 *    ausschließlich beim Import historischer Jahre.
 *  - `closed` blockiert Buchungen; das Onboarding umgeht das bewusst über
 *    einen expliziten Schalter.
 *  - Lesende Pfade filtern hart auf `open` und liefern ohne offenen Zyklus
 *    LEER statt zu fehlern — eine häufige Ursache für „alles weg".
 */
const ZYKLUS: Record<string, StatusDescriptor> = {
  open: { label: "Offen", kind: "success", description: "Buchungsjahr ist offen — es kann gebucht werden." },
  closed: { label: "Geschlossen", kind: "neutral", description: "Abgeschlossenes Jahr, in der Regel importierter Bestand. Buchungen sind gesperrt." },
};

/**
 * `client_external_integrations.status` — Zustand einer Bank-Anbindung.
 * NOT NULL, Default `active`. Wertebereich: DB-CHECK aus
 * `20260512100400_client_external_integrations.sql`.
 *
 * Selbstheilend: jeder erfolgreiche Sync setzt zurück auf `active`, jeder
 * fehlgeschlagene auf `error`. Kein Endzustand.
 *
 * Fallstricke:
 *  - **`disabled` hat keinen Schreiber** — der Wert existiert nur im Typ.
 *  - NULL an der projizierten Spalte heißt „Zahlungskonto ohne Anbindung",
 *    NICHT „Status unbekannt".
 */
const INTEGRATION: Record<string, StatusDescriptor> = {
  active: { label: "Aktiv", kind: "success", description: "Anbindung funktioniert — der letzte Abruf war erfolgreich." },
  error: { label: "Fehler", kind: "danger", description: "Der letzte Abruf ist fehlgeschlagen. Repariert sich beim nächsten erfolgreichen Abruf von selbst." },
  disabled: { label: "Deaktiviert", kind: "neutral", description: "Anbindung ist abgeschaltet." },
};

/**
 * `client_accounting_case_rule.booking_mode` — was beim Zahlungs-Treffer
 * passieren soll. NOT NULL, Default `book_on_payment`. Wertebereich:
 * `RuleBookingMode` (`modules/recurring-rules/domain/rule.ts`), DB-CHECK
 * zuletzt in `20260713180000_rule_booking_mode_match_only.sql`.
 *
 * Streng genommen Konfiguration, keine Zustandsmaschine — steht hier, weil
 * der Modus überall als farbiger Chip erscheint und die beiden früheren
 * lokalen Kopien bereits unterschiedliche Labels trugen.
 *
 * Fallstrick: `match_only` ist jünger als die anderen beiden. Code, der
 * `booking_mode` als binär behandelt („bucht bei Zahlung, sonst Sollstellung"),
 * ist ein stiller Bug — bei `match_only` entsteht GAR KEIN Vorschlag.
 */
const REGEL_MODUS: Record<string, StatusDescriptor> = {
  book_on_payment: { label: "Bei Zahlung", kind: "success", description: "Gebucht wird erst, wenn die Zahlung eintrifft — Aufwand/Erlös direkt gegen die Bank." },
  accrue_then_settle: { label: "Sollstellung", kind: "info", description: "Zur Fälligkeit wird sollgestellt; die Zahlung gleicht später das Personenkonto aus." },
  match_only: { label: "Nur zuordnen", kind: "neutral", description: "Die Zahlung wird nur dem Sachverhalt zugeordnet — es entsteht KEIN Buchungsvorschlag." },
};

/**
 * `client_agent_notes.status` — Lebenszyklus einer Konvention. NOT NULL,
 * Default `active`. Wertebereich: DB-CHECK `client_agent_notes_status_check`,
 * Domain-Enum `CONVENTION_STATUSES`.
 *
 * Die Freigabe hängt an der Ebene (F106 §3): eine Mandantenregel gilt sofort,
 * eine Kanzleiregel wirkt auf ALLE Mandanten der Kanzlei und wartet deshalb auf
 * einen Menschen. `pending_approval` kann es deshalb nur bei `scope='tenant'`
 * geben — der DB-CHECK erzwingt das.
 *
 * Fallstricke:
 *  - **Archiviert ist nicht gelöscht.** `archived` ist der Endzustand, den es
 *    vorher nicht gab; ohne ihn hat der Agent inhaltliche Notizen als
 *    superseded markiert und leere Platzhalter als gültig gesetzt (drei
 *    Grabsteine im Bestand). Gelöscht wird über `deleted_at`, und nur von
 *    einem Menschen.
 *  - **Abgelöst ist kein Status.** Kondensierung läuft über `superseded_by`:
 *    eine neue Konvention zum selben Thema ersetzt die alte, beide bleiben
 *    `active`, aber nur die neue ist die gültige.
 */
const KONVENTION_STATUS: Record<string, StatusDescriptor> = {
  pending_approval: { label: "Wartet auf Freigabe", kind: "warning", description: "Kanzlei-Konvention: gilt für alle Mandanten der Kanzlei und wirkt erst, wenn ein Mensch sie freigibt. Der Agent sieht sie, wendet sie aber nicht an." },
  active: { label: "Gilt", kind: "success", description: "Wird beim Buchen angewendet — es sei denn, eine Mandantenregel zum selben Thema sticht sie." },
  archived: { label: "Archiviert", kind: "neutral", description: "Erledigt: auffindbar, aber außerhalb dessen, was der Agent beim Buchen liest." },
};

/**
 * `client_agent_notes.origin` — woher eine Konvention kommt und wie belastbar
 * sie ist. NOT NULL, Default `agent_observed`. Wertebereich: DB-CHECK
 * `client_agent_notes_origin_check`, Domain-Enum `CONVENTION_ORIGINS`.
 *
 * Die Achse trägt zugleich „bestätigt": alles außer `agent_observed` ist
 * belastbar, weil ein Mensch geantwortet hat oder eine Menge dahinter steht.
 * Es gibt bewusst KEINE zweite `confirmed`-Spalte — wer bestätigt, setzt die
 * Herkunft auf `tenant_confirmed`, sonst liefen zwei Felder auseinander.
 *
 * Fallstrick: `derived_from_bookings` ohne N ist wertlos; der DB-CHECK
 * verlangt `derived_from_count` genau dort.
 */
const KONVENTION_HERKUNFT: Record<string, StatusDescriptor> = {
  onboarding: { label: "Im Onboarding erfasst", kind: "success", description: "Ein Mensch hat die Frage im Onboarding beantwortet — der primäre Erfassungsort." },
  tenant_confirmed: { label: "Von der Kanzlei bestätigt", kind: "success", description: "Aus einer beantworteten Klärung destilliert oder ausdrücklich freigegeben." },
  derived_from_bookings: { label: "Aus Buchungen abgeleitet", kind: "info", description: "Aus einer Menge gleichartiger Buchungen erschlossen; die Anzahl steht daneben." },
  agent_observed: { label: "Vom Agenten beobachtet", kind: "warning", description: "Vermutung, bis ein Mensch sie bestätigt. Gilt trotzdem — der Status ist eine Qualitätsangabe, kein Gate." },
};

/**
 * `platform_product_feedback.status` — was aus einem Produktbefund des Agenten
 * geworden ist. NOT NULL, Default `open`. Wertebereich: DB-CHECK
 * `platform_product_feedback_status_check`, Domain-Enum
 * `PRODUCT_FEEDBACK_STATUSES`.
 *
 * Der Agent erfährt das Ergebnis NICHT (F106 §6, kein Rückkanal) — er bekommt
 * es irgendwann als neues Tool oder geänderten Ablauf. `prepared` = Spec `F<n>`
 * oder `P<n>` geschrieben; `accepted` = umgesetzt, gesetzt von dem, der umsetzt.
 */
const PRODUKTBEFUND: Record<string, StatusDescriptor> = {
  open: { label: "Liegt vor", kind: "info", description: "Eingereicht, noch nicht gesichtet." },
  backlog: { label: "Im Backlog", kind: "warning", description: "Gesichtet und angenommen, aber noch nicht umgesetzt. Wann er drankommt, sagt die Dringlichkeit — nicht der Status." },
  prepared: { label: "Vorbereitet", kind: "info", description: "Spec (F<n>) oder P-Eintrag geschrieben, Entscheidungen getroffen — wartet auf die Umsetzung. Übernommen setzt, wer sie umsetzt." },
  accepted: { label: "Übernommen", kind: "success", description: "Umgesetzt und committet, oder direkt behoben." },
  rejected: { label: "Kein Befund", kind: "neutral", description: "Angesehen und verworfen — kein Produktmangel." },
};

/**
 * `platform_product_feedback.priority` — wie dringend der Befund ist. NULL, bis
 * ein Mensch draufgeschaut hat; der meldende Agent setzt sie nie (F106 §6).
 *
 * Zusammen mit `status = backlog` ist sie die Arbeitsreihenfolge: `critical` und
 * `high` sind das, was als nächstes drankommt, `low` das Zurückgestellte. Genau
 * deshalb gibt es keine Status „up next" / „postponed" — das wäre dieselbe
 * Achse ein zweites Mal, nur widersprüchlich pflegbar.
 *
 * Farbe kodiert die Kritikalität, nicht die Reihenfolge — dieselbe Skala wie
 * überall sonst (Fehler → Warnung → Hinweis → beiläufig).
 */
const PRODUKTBEFUND_PRIO: Record<string, StatusDescriptor> = {
  critical: { label: "Sehr hoch", kind: "danger", description: "Blockiert den Buchungslauf oder erzeugt falsche Buchungen — vor allem anderen." },
  high: { label: "Hoch", kind: "warning", description: "Kostet in jedem Lauf Zeit oder Genauigkeit — kommt als nächstes dran." },
  medium: { label: "Mittel", kind: "info", description: "Echter Mangel, aber mit Umweg lebbar." },
  low: { label: "Niedrig", kind: "neutral", description: "Zurückgestellt — irgendwann, nicht bald." },
};

/**
 * `platform_clients.onboarding_state` — wie weit ein Mandant im Onboarding
 * ist. NOT NULL, Default `created`. Wertebereich: DB-CHECK
 * `platform_clients_onboarding_state_check`, zuletzt
 * `20260806120000_onboarding_review_and_datev_bank_accounts.sql` (`review`).
 * Kein TS-Enum — der Test spiegelt den CHECK.
 *
 * Schreiber: `create_client` legt `created` an, der Bridge-Poll setzt
 * `importing`, die Onboarding-Pipeline `processing` → `review`, der
 * Review-Abschluss `ready`, jeder Abbruch `failed`.
 *
 * Fallstricke:
 *  - **Nicht mit dem Verdict verwechseln** (`mandant_onboarding_verdict`):
 *    der ist die abgeleitete Agenten-Sicht inkl. Readiness, das hier der rohe
 *    Fortschritt.
 *  - **Kein Auto-Retry.** Weder `failed` noch ein in `processing` hängen
 *    gebliebener Lauf laufen von selbst weiter — deshalb bietet die Admin-UI
 *    für BEIDE Zustände „Erneut versuchen" an.
 *  - `review` blockiert das Buchen (`assertCtxOnboardingReady` lässt nur
 *    `ready` durch), sieht aber wie ein Erfolg aus. Deshalb `warning`.
 *  - `ready` ⇄ `review`: ein Re-Onboarding wirft den Mandanten zurück in den
 *    Review, der Zustand ist also nicht terminal.
 */
const MANDANT_ONBOARDING: Record<string, StatusDescriptor> = {
  created: { label: "Angelegt", kind: "neutral", description: "Mandant existiert in Ludwig, das Onboarding hat noch nicht begonnen — wartet auf den nächsten Bridge-Poll." },
  importing: { label: "Daten werden geholt", kind: "info", description: "Die Bridge lädt Stammdaten, Konten und Buchungshistorie aus DATEV." },
  processing: { label: "Wird aufbereitet", kind: "info", description: "Die Onboarding-Pipeline verarbeitet die geladenen Daten. Bleibt sie hängen, hilft nur ein manueller Neustart — von selbst läuft nichts weiter." },
  review: { label: "Freigabe nötig", kind: "warning", description: "Aufbereitung durch, die Kanzlei muss den Review abschließen (Bankverbindungen, Buchungsbeginn). Bis dahin ist der Mandant NICHT buchbar." },
  ready: { label: "Onboardet", kind: "success", description: "Onboarding abgeschlossen — der Mandant ist buchbar." },
  failed: { label: "Fehlgeschlagen", kind: "danger", description: "Der Onboarding-Lauf ist abgebrochen. Kein automatischer Wiederholungslauf — jemand muss ihn bewusst neu anstoßen." },
};

/**
 * Verdict aus `get_onboarding_status` — **abgeleitet, keine Spalte**
 * (`onboarding/application/get-onboarding-status-core.ts`). Die pollbare
 * Agenten-Sicht: „darf ich mit dem Mandanten arbeiten, und wenn nein, woran
 * liegt es?" Wertebereich: `OnboardingStatusVerdict`.
 *
 * Ableitung (in dieser Reihenfolge): `onboarding_completed_at` gesetzt →
 * `onboarded`; `onboarding_state` `importing`/`processing` → `running`; offene
 * Bridge-Störung oder abgebrochener Pipeline-Job → `failed`; Readiness
 * `blocked` → `blocked`; sonst → `needs_human`.
 *
 * Fallstricke:
 *  - **`needs_human` fasst zwei Fälle zusammen**: ausstehende Review-Freigabe
 *    und Readiness-Warnungen. Welcher es ist, sagt nur `onboarding_state`.
 *  - `failed` sticht `blocked`: fehlende Stammdaten sind nach einem Abbruch
 *    die Folge, nicht die Ursache.
 *  - `running` sticht beides: während des eigenen Imports ist ein leerer
 *    Kontenplan kein Befund, sondern der Zwischenstand. Blocker und Warnungen
 *    reisen trotzdem mit — sie sind nur noch kein Endergebnis.
 */
const MANDANT_ONBOARDING_VERDICT: Record<string, StatusDescriptor> = {
  onboarded: { label: "Onboardet", kind: "success", description: "Onboarding abgeschlossen — der Mandant ist buchbar." },
  running: { label: "Läuft gerade", kind: "info", description: "Der Onboarding-Lauf ist unterwegs (Import oder Verarbeitung). Blocker und Warnungen sind ein Zwischenstand, kein Ergebnis — später nochmal fragen." },
  needs_human: { label: "Mensch nötig", kind: "warning", description: "Kein Fehler, aber jemand muss draufschauen: entweder steht die Review-Freigabe aus oder die Konfiguration hat Hinweise." },
  blocked: { label: "Blockiert", kind: "danger", description: "Eine Pflichtangabe fehlt — siehe Blocker-Liste. Vorher geht es nicht weiter." },
  failed: { label: "Fehlgeschlagen", kind: "danger", description: "Der Onboarding-Lauf ist abgebrochen (Bridge-Störung oder Pipeline-Fehler). Die Ursache steht in der letzten Störungsmeldung." },
  not_found: { label: "Nicht gefunden", kind: "neutral", description: "Zu dieser Mandanten-ID gibt es keinen Datensatz." },
};

/**
 * Zustand eines Zahlungswegs (Bank-/Kassenkonto) im Buchungslauf — **berechnet**
 * aus `client_payment_accounts.valid_until`: gesetzt heißt abgeschaltet.
 *
 * Fallstrick: „abgeschaltet" löscht nichts und ändert keine Vergangenheit —
 * es beendet nur die Kontoauszugs-Anforderung ab dem Stichtag. Alte Auszüge
 * und Buchungen des Kontos bleiben vollständig zählbar.
 */
const ZAHLUNGSWEG: Record<string, StatusDescriptor> = {
  aktiv: { label: "aktiv", kind: "success", description: "Konto zählt für die Bankdeckung, Auszüge werden angefordert." },
  abgeschaltet: { label: "abgeschaltet", kind: "neutral", description: "`valid_until` abgelaufen — keine Kontoauszugs-Anforderung mehr." },
};

/**
 * Betriebszustand eines Mandanten — **berechnet** aus
 * `platform_clients.is_active` und `replay_cutoff_date`.
 *
 * Nur aktive Mandanten sind für den Buchungsagenten sichtbar und werden von
 * der DATEV-Bridge synchronisiert. Pro DATEV-Nummer/-GUID darf genau einer
 * aktiv sein — ein Replay-Stand ist deshalb immer der stillgelegte Zwilling.
 *
 * Fallstrick: `replay` ist kein Unterfall von `stillgelegt`, sondern die
 * Antwort auf „warum ist der hier zweimal": derselbe DATEV-Mandant mit
 * Stichtag, Export gesperrt.
 */
const MANDANT_BETRIEB: Record<string, StatusDescriptor> = {
  aktiv: { label: "aktiv", kind: "success", description: "Agent und Bridge-Sync laufen normal." },
  stillgelegt: { label: "stillgelegt", kind: "neutral", description: "Daten bleiben erhalten, aber kein Agentenzugriff und kein Sync." },
  replay: { label: "Replay", kind: "info", description: "Experiment-Stand desselben DATEV-Mandanten mit Stichtag — Export gesperrt." },
};

/**
 * Klassifikation eines Dauersachverhalt-Kandidaten beim Onboarding (F91) —
 * **berechnet**, `RecurringCandidateClass`
 * (`modules/recurring-rules/domain/derive-recurring-candidates.ts`), abgeleitet
 * aus der DATEV-Buchungshistorie. Keine Spalte.
 *
 * Fallstricke:
 *  - `bereits_angelegt` ist ein Pseudowert der Oberfläche: er kommt nicht aus
 *    `klass`, sondern aus dem separaten Flag `alreadyExists` (Re-Onboarding).
 *    Er überstimmt die Klasse in der Anzeige, weil „wird übersprungen" die
 *    Information ist, die zählt.
 *  - `nicht_uebernehmbar` heißt nicht „kommt nie" — der Fall kann später über
 *    den Beleg-Weg als Dauerrechnung entstehen.
 */
const DAUERSACHVERHALT_UEBERNAHME: Record<string, StatusDescriptor> = {
  uebernehmen: { label: "übernehmen", kind: "success", description: "Vorselektiert — die Freigabe legt Dauersachverhalt und Regel an." },
  bereits_angelegt: { label: "bereits angelegt", kind: "info", description: "Eine Regel mit dieser Belegnummer existiert schon (Re-Onboarding) — wird übersprungen." },
  beendet_erkannt: { label: "beendet erkannt", kind: "neutral", description: "Lücke von drei Intervallen oder mehr zum jüngsten festgeschriebenen Monat — wird nicht angelegt." },
  nicht_uebernehmbar: { label: "nicht übernehmbar", kind: "warning", description: "Unbrauchbare Belegnummer oder kein Template ableitbar — kommt gegebenenfalls später über den Beleg-Weg." },
};

/**
 * Gültigkeit eines Agenten-Zugangstokens — **berechnet** aus
 * `platform_agent_tokens.revoked_at` und `expires_at`, pro Render geprüft.
 *
 * Rangfolge: widerrufen schlägt abgelaufen. Ein Token ohne `expires_at` läuft
 * nie ab und bleibt aktiv, bis es jemand widerruft.
 */
const TOKEN: Record<string, StatusDescriptor> = {
  aktiv: { label: "aktiv", kind: "success", description: "Nicht widerrufen und, falls ein Ablauf gesetzt ist, noch nicht abgelaufen." },
  abgelaufen: { label: "abgelaufen", kind: "warning", description: "Das Ablaufdatum ist überschritten." },
  widerrufen: { label: "widerrufen", kind: "danger", description: "Manuell widerrufen — gilt sofort, unabhängig vom Ablauf." },
};

/**
 * Auszugserwartung eines Zahlungskontos — **berechnet** aus zwei Quellen:
 * dem DATEV-Abgleich (bebucht + IBAN in den Stammdaten) und der Hand-Setzung
 * im Stammdaten-Formular (`client_payment_accounts.statement_expected`).
 *
 * Die Herkunft steht deshalb im Wert und nicht daneben: nur die
 * Hand-Entscheidung überlebt den nächsten DATEV-Abgleich, die abgeleitete
 * wird überschrieben. Wer „Keine (Hand)" sieht, weiß, dass das so bleibt.
 *
 * Fallstrick: an dieser Achse hängt Gate 1a des Buchungslaufs. Fehlt ein
 * Auszug im Zeitraum, ist das bei `erwartet*` ein Fehler und bei `keine*`
 * nur ein Hinweis — dieselbe Lücke, zwei Bedeutungen.
 */
const KONTOAUSZUG_ERWARTUNG: Record<string, StatusDescriptor> = {
  erwartet: { label: "Erwartet", kind: "success", description: "Abgeleitet: das Konto ist bebucht und seine IBAN steht als Bankverbindung in den DATEV-Stammdaten. Fehlt der Auszug im Zeitraum, ist Gate 1a rot." },
  erwartet_hand: { label: "Erwartet (Hand)", kind: "success", description: "Ein Mensch hat die Erwartung im Stammdaten-Formular gesetzt — der nächste DATEV-Abgleich lässt sie stehen." },
  keine: { label: "Keine", kind: "neutral", description: "Abgeleitet: keine IBAN in den DATEV-Bankverbindungen oder nie bebucht. Ein fehlender Auszug ist hier nur ein Hinweis." },
  keine_hand: { label: "Keine (Hand)", kind: "neutral", description: "Ein Mensch hat die Erwartung abgewählt — typisch für Verrechnungs- und Geldtransit-Konten, zu denen es keinen Auszug gibt." },
};

/**
 * Ausgleichs-Stand eines offenen Postens **zum gewählten Stichtag** —
 * berechnet, ephemer.
 *
 * Fallstrick: die Achse ist stichtagsbezogen, nicht absolut. „Nach Stichtag
 * ausgeglichen" heißt, dass der Posten am Stichtag offen war und es heute
 * nicht mehr ist — beim Blättern auf einen anderen Stichtag wechselt
 * derselbe Posten die Stufe, ohne dass sich etwas geändert hat.
 */
const OPOS_AUSGLEICH: Record<string, StatusDescriptor> = {
  offen: { label: "offen", kind: "warning", description: "Bis heute nicht ausgeglichen." },
  spaeter_ausgeglichen: { label: "nach Stichtag ausgeglichen", kind: "neutral", description: "Zum Stichtag offen, inzwischen ausgeglichen." },
};

/**
 * Rolle einer Zeile in der Ausgleichs-Klammer eines offenen Postens (F77) —
 * berechnet aus der Klammer, ephemer.
 *
 * Getilgt wird älteste Sollstellung zuerst; `sollstellung_offen` ist deshalb
 * kein eigener Zustand der Buchung, sondern das Ergebnis dieser Reihenfolge.
 * Dieselbe Rechnung ist in einer anderen Klammer gedeckt.
 */
const OPOS_ZEILENART: Record<string, StatusDescriptor> = {
  sollstellung: { label: "Sollstellung", kind: "neutral", description: "Rechnung oder Rate — erhöht den offenen Rest; bereits getilgt." },
  sollstellung_offen: { label: "Sollstellung offen", kind: "warning", description: "Rechnung oder Rate, die durch die bisherigen Zahlungen der Klammer noch nicht gedeckt ist (älteste zuerst getilgt)." },
  zahlung: { label: "Zahlung", kind: "success", description: "Ausgleich oder Zahlung der Kanzlei — mindert den offenen Rest." },
};

/**
 * Warum eine DATEV-Buchung an einem Sachverhalt hängt — berechnet, ephemer
 * (`VIA_LABEL` in `modules/datev-truth`).
 *
 * Keine Rangfolge und keine Schwere: die Achse sagt, über welchen Weg die
 * Verbindung entstand, nicht wie sicher sie ist. Deshalb tragen alle Werte
 * `neutral` (V6).
 *
 * Fallstrick: `matched` ist der Abgleich (Ludwig hat gebucht, DATEV
 * bestätigt), `ludwig_ref` dagegen nur DATEVs Zusatzinfo mit der
 * Sachverhalts-Nummer — die kann auch an einer Buchung stehen, die Ludwig nie
 * geschrieben hat.
 */
const DATEV_VERKNUEPFUNG: Record<string, StatusDescriptor> = {
  opos_source: { label: "Quelle OPOS-Vortrag", kind: "neutral", description: "Diese Spiegel-Buchung ist die Sollstellung des offenen Postens." },
  link_invoice: { label: "Klammer: Rechnung", kind: "neutral", description: "Rechnungsseite der Ausgleichs-Zuordnung (F77)." },
  link_payment: { label: "Klammer: Zahlung", kind: "neutral", description: "Zahlungsseite der Ausgleichs-Zuordnung (F77)." },
  ludwig_ref: { label: "DATEV-Rückverweis", kind: "neutral", description: "DATEV führt die Buchung mit dieser Sachverhalts-Nummer (LudwigAI-Zusatzinfo)." },
  matched: { label: "Abgleich-Match", kind: "neutral", description: "Der DATEV-Abgleich hat die Buchung einer Ludwig-Buchung dieses Falls zugeordnet." },
  rule_document: { label: "DATEV-Historie", kind: "neutral", description: "Wiederkehrende Buchung derselben DATEV-Belegnummer auf dem Personenkonto des Dauersachverhalts — die Historie, aus der er entstand (F91)." },
};

/**
 * Ergebnis eines Plausibilitäts-Checks am Sachverhalt — berechnet, ephemer.
 *
 * Fallstrick: der DB-nahe Wert heißt `info`, angezeigt wird „nicht
 * anwendbar". Das ist kein Hinweis im Sinne der Skala, sondern die Aussage
 * „für diesen Sachverhalt fehlt die Grundlage" — deshalb `neutral` und nicht
 * `info`. Kein Check ist ein Blocker; auch `warn` hält nichts auf.
 */
const PLAUSIBILITAET: Record<string, StatusDescriptor> = {
  ok: { label: "in Ordnung", kind: "success", description: "Der Check greift und findet nichts zu beanstanden." },
  warn: { label: "prüfen", kind: "warning", description: "Befund — kein Blocker, aber jemand sollte hinschauen." },
  info: { label: "nicht anwendbar", kind: "neutral", description: "Für diesen Sachverhalt fehlt die Grundlage, etwa ein Personenkonto oder ein OPOS-Anker." },
};

/**
 * Woher die Belegnummer eines Sachverhalts stammt — berechnet, ephemer.
 *
 * Die Reihenfolge der Werte **ist** die Dominanz-Rangfolge: was weiter oben
 * steht, gewinnt. `datev_correction` schlägt alles, weil eine Korrektur in
 * DATEV die letzte menschliche Aussage ist; `bank_purpose` steht unten, weil
 * eine im Betreff erkannte Nummer die schwächste Grundlage hat.
 *
 * Alle Werte tragen `neutral`: die Quelle sagt, woher die Nummer kommt, nicht
 * ob sie richtig ist (V6).
 */
const BELEGNUMMER_QUELLE: Record<string, StatusDescriptor> = {
  datev_correction: { label: "in DATEV korrigiert", kind: "neutral", description: "Jemand hat die Nummer in DATEV richtiggestellt — die stärkste Quelle." },
  opos_anchor: { label: "OPOS-Anker (DATEV)", kind: "neutral", description: "Aus dem offenen Posten in DATEV übernommen." },
  mirror_ref: { label: "DATEV-Spiegel", kind: "neutral", description: "Aus einer gespiegelten DATEV-Buchung." },
  case_decision: { label: "entschieden", kind: "neutral", description: "Am Sachverhalt festgelegt." },
  link: { label: "Ausgleichs-Klammer", kind: "neutral", description: "Über die Ausgleichs-Zuordnung geerbt (F77)." },
  invoice_number: { label: "Rechnungsnummer des Belegs", kind: "neutral", description: "Aus dem Beleg selbst gelesen." },
  journal_line: { label: "eigene Buchung", kind: "neutral", description: "Aus einer Ludwig-Buchung des Sachverhalts." },
  bank_purpose: { label: "im Betreff erkannt", kind: "neutral", description: "Im Verwendungszweck einer Kontoauszugszeile gefunden — die schwächste Grundlage." },
};

// ══════════════════════════════════════════════════════════════════════
// BETRIEB
// ══════════════════════════════════════════════════════════════════════

/**
 * Klassifizierter DATEV-Zustand der on-prem Bridge — **berechnet, ephemer**;
 * `DatevApiStatus` (`modules/bridge/contract.ts`), von der Bridge gemeldet und
 * pro Health-Abruf frisch.
 *
 * Fallstricke:
 *  - `no_clients` ist der teuerste Fehlschluss der Skala: die Bridge ist
 *    erreichbar und meldet Erfolg, sieht aber null Mandanten — meist ein
 *    Rechteproblem des DATEV-Benutzers, kein Netzproblem. Am 31.07.2026 stand
 *    genau dieser Fall stundenlang als „läuft" im Dashboard.
 *  - `unreachable` und `server_error` trennen Netz von Gegenstelle: das eine
 *    ist VPN/URL/Port, das andere ein Fehler in DATEVconnect selbst.
 *  - `flow_error` ist der einzige Wert, der **nicht** aus `DatevApiStatus`
 *    kommt: `faultReportRequest.status` ist `datevApiStatus | "flow_error"`.
 *    Er sagt, dass die Bridge selbst gestolpert ist, nicht DATEV — und er
 *    kann gemeldet werden, bevor überhaupt ein Lauf angefangen hat.
 */
const BRIDGE_DATEV: Record<string, StatusDescriptor> = {
  ok: { label: "DATEV in Ordnung", kind: "success", description: "Die Bridge erreicht DATEV und sieht Mandanten." },
  no_clients: { label: "Keine Mandanten sichtbar", kind: "warning", description: "Erreichbar, aber null Mandanten — meist ein Rechteproblem." },
  unreachable: { label: "DATEV nicht erreichbar", kind: "warning", description: "Der Host antwortet nicht — Netz, VPN, URL und Port prüfen." },
  server_error: { label: "DATEV-Serverfehler", kind: "danger", description: "DATEVconnect meldet einen Serverfehler." },
  unauthorized: { label: "Zugangsdaten abgelehnt", kind: "danger", description: "Benutzer oder Passwort abgelehnt, oder das Windows-Konto ist gesperrt." },
  flow_error: { label: "Ablauf gescheitert", kind: "danger", description: "Die Bridge hat den Vorgang begonnen und ihn nicht zu Ende gebracht — kein DATEV-Problem, sondern eines im Ablauf selbst." },
};

/**
 * Einzelfakt der Vorsteuer-Beurteilung — **berechnet, ephemer**
 * (`VatFact.value`, `getInvoiceVatAssessment` in
 * `modules/accounting-cases/application/agent-reads-core.ts`), aus den
 * persistierten Belegdaten je Abruf neu abgeleitet.
 *
 * Fallstrick: `unknown` und `not_applicable` sehen beide harmlos aus, meinen
 * aber Gegenteiliges — „noch nicht ermittelt" ist eine offene Aufgabe,
 * „für diesen Beleg ohne Bedeutung" ist erledigt. Nur `unknown` blockiert
 * eine Regel, die den Fakt braucht.
 */
const VST_FAKT: Record<string, StatusDescriptor> = {
  yes: { label: "Ja", kind: "success", description: "Der Fakt liegt vor." },
  no: { label: "Nein", kind: "danger", description: "Der Fakt liegt nicht vor." },
  uncertain: { label: "Unsicher", kind: "warning", description: "Widersprüchliche Signale — ein Mensch klärt." },
  unknown: { label: "Unbekannt", kind: "neutral", description: "Noch nicht ermittelt." },
  not_applicable: { label: "Nicht relevant", kind: "info", description: "Für diesen Beleg ohne Bedeutung." },
};

/**
 * Ergebnis einer Katalog-Regel der Vorsteuer-Beurteilung — **berechnet,
 * ephemer**, maschinelle Auswertung über den Einzelfakten (`VST_FAKT`).
 *
 * Fallstrick: `unknown` heißt hier „nicht ermittelbar", nicht „egal" — ein
 * Pflicht-Fakt fehlt, und die Regel ist vor dem Vorsteuerabzug zu klären.
 * Nur `fail` sperrt den Steuerschlüssel und blockt den Submit.
 */
const VST_REGEL: Record<string, StatusDescriptor> = {
  pass: { label: "Bestanden", kind: "success", description: "Regel erfüllt — kein Hindernis." },
  fail: { label: "Verletzt", kind: "danger", description: "Vorsteuer-Schlüssel gesperrt, der Submit blockt." },
  unknown: { label: "Nicht ermittelbar", kind: "warning", description: "Ein Pflicht-Fakt fehlt — vor dem Vorsteuerabzug klären." },
};

/**
 * `platform_audit_events.actor_kind` — wer ein Ereignis ausgelöst hat.
 * NOT NULL, DB-CHECK `user · system · api · cli · agent`; Wertebereich
 * `ActorKind` (`modules/audit-log/domain/types.ts`).
 *
 * Keine Schwere und keine Rangfolge: der Akteur sagt, **wer** gehandelt hat,
 * nicht wie schlimm es war. Deshalb tragen alle fünf Werte `neutral` — Farbe
 * bleibt der Kritikalität vorbehalten (V6).
 *
 * Fallstrick: `user` heißt „ein Mensch war es", nicht „ein angemeldeter
 * Benutzer der Kanzlei" — ein CLI-Aufruf mit Dienstkonto schreibt `cli`.
 */
const ACTOR_KIND: Record<string, StatusDescriptor> = {
  user: { label: "Nutzer", kind: "neutral", description: "Ein Mensch hat es ausgelöst — über die Oberfläche angemeldet." },
  system: { label: "System", kind: "neutral", description: "Ein Hintergrundprozess ohne Auftraggeber: Zeitplan, Trigger, Aufräumlauf." },
  api: { label: "API", kind: "neutral", description: "Ein Aufruf von außen über die Schnittstelle." },
  cli: { label: "CLI", kind: "neutral", description: "Ein Kommandozeilen-Aufruf, meist mit Dienstkonto." },
  agent: { label: "Agent", kind: "neutral", description: "Der Buchungsagent hat gehandelt — kein Mensch hat es entschieden." },
};

/**
 * `client_invoice_traces.level` — Trace-Level der Beleg-Verarbeitung.
 * NOT NULL, Default `info`. Geordnet: debug < verbose < info < warning < error.
 * Wertebereich: `InvoiceTraceLevel` (`modules/invoices/domain/invoice.ts`),
 * DB-CHECK aus `20260509140000_client_invoice_traces_level.sql`.
 *
 * Fallstrick: **`debug` und `verbose` stehen im Normalbetrieb gar nicht in der
 * DB.** Der Schreib-Schwellwert liegt bei `info`; darunterliegende Zeilen
 * werden nicht geschrieben, nicht bloß ausgeblendet. Wer sie sucht, muss den
 * Lauf mit gesenktem Schwellwert wiederholen (`--full-trace`) — nachträgliches
 * Filtern in der UI holt nichts nach.
 *
 * Nicht verwechseln mit `ops_extraction_logs.level` (andere Tabelle,
 * ungetypt, eigener Wertebereich).
 */
const LOG_LEVEL: Record<string, StatusDescriptor> = {
  debug: { label: "Debug", kind: "neutral", description: "Feinste Detailstufe. Nur vorhanden, wenn der Lauf gezielt mit gesenktem Schwellwert lief." },
  verbose: { label: "Ausführlich", kind: "neutral", description: "Zusatzdetails. Nur bei gesenktem Schwellwert vorhanden." },
  info: { label: "Info", kind: "info", description: "Normaler Verarbeitungsschritt." },
  warning: { label: "Warnung", kind: "warning", description: "Auffälligkeit, die die Verarbeitung nicht gestoppt hat." },
  error: { label: "Fehler", kind: "danger", description: "Fehler in der Verarbeitung." },
};

/**
 * Health-Check-Status — **berechnet, ephemer** (`modules/health/aggregate.ts`),
 * pro Aufruf frisch geprüft.
 *
 * Fallstricke:
 *  - **Das ist keine Schweregrad-Skala.** `degraded` heißt „Funktion bewusst
 *    nicht konfiguriert", `error` heißt „soll da sein, antwortet aber nicht".
 *  - Fällt der Workflows-Dienst auf `error`, brechen die nachgelagerten
 *    Prüfungen ab und FEHLEN in der Liste. Ein fehlender Check ist kein
 *    bestandener Check.
 */
const HEALTH: Record<string, StatusDescriptor> = {
  ok: { label: "OK", kind: "success", description: "Prüfung bestanden." },
  degraded: { label: "Eingeschränkt", kind: "warning", description: "Funktion ist nicht konfiguriert und damit inaktiv — kein Defekt." },
  error: { label: "Fehler", kind: "danger", description: "Der Dienst sollte erreichbar sein, antwortet aber nicht." },
};

/**
 * Readiness-Status der Mandanten-Konfiguration — **berechnet, ephemer**
 * (`modules/clients/ui/configuration`), pro Render aus dem Onboarding-Aggregat.
 *
 * Fallstricke:
 *  - Die Checklisten-Ableitungen der Konfigurationsseite enden nur in
 *    `ok`/`warn`. `missing` entsteht ausschließlich im `ReadinessBanner`, der
 *    den Aggregat-Wert `ClientReadiness.status='blocked'` hierher abbildet —
 *    ein eigener Wertebereich (`ready`/`ready_with_warnings`/`blocked`), der
 *    bewusst nicht als weitere Achse geführt wird.
 *  - Der Status ist **entkoppelt** vom „Onboarding abgeschlossen"-Häkchen:
 *    man kann abschließen, während Prüfungen auf `warn` stehen. Kein Gate.
 *  - Nicht verwechseln mit der zweiten, unabhängigen Readiness auf
 *    Python-Seite (`client_readiness_service.py`) — andere Werte, anderer
 *    Konsument.
 */
const READINESS: Record<string, StatusDescriptor> = {
  ok: { label: "Vollständig", kind: "success", description: "Nichts zu tun." },
  warn: { label: "Hinweis", kind: "warning", description: "Nutzbar, aber es fehlt etwas, das später Arbeit macht." },
  missing: { label: "Fehlt", kind: "danger", description: "Pflichtangabe fehlt." },
};

// ══════════════════════════════════════════════════════════════════════

/**
 * `client_bank_transactions.match_stage` — wie eine Auszugszeile gegen die
 * DATEV-Buchungshistorie eingeordnet wurde (F63). NULL erlaubt (noch nicht
 * gelaufen). DB-CHECK `client_bank_transactions_match_stage_check`, zwölf
 * Werte; die Kaskade schreibt sie (`modules/bank-match/application/cascade.ts`).
 *
 * Acht Stufen heißen „in DATEV wiedergefunden", vier heißen „offen" — und
 * die vier waren bis 2026-09-06 unsichtbar: die Oberfläche zeigte nur ein
 * grünes Häkchen für die acht und schwieg über den Rest, obwohl allein
 * `beyond_bookings` 328 von 1281 Zeilen trägt (L-57).
 *
 * Die acht Treffer-Stufen sind nach fallender Sicherheit geordnet: `beleg`
 * ist ein Treffer über die Belegnummer, `residual` ein Rest, der nach Abzug
 * aller anderen übrig blieb. Sie tragen trotzdem alle `success` — getroffen
 * ist getroffen; wie schwierig es war, sagt das Label.
 *
 * Nicht zu verwechseln mit `mirror_match`: das ist
 * `client_datev_mirror_entries.match_state` und beschreibt eine gespiegelte
 * DATEV-Buchung, nicht eine Auszugszeile.
 */
const BANK_MATCH_STAGE: Record<string, StatusDescriptor> = {
  beleg: { label: "über Belegnummer", kind: "success", description: "Die Belegnummer der Zeile steht so in der DATEV-Historie — der sicherste Treffer." },
  exact: { label: "exakt", kind: "success", description: "Betrag, Datum und Gegenpart stimmen genau überein." },
  pair: { label: "als Paar", kind: "success", description: "Zwei Zeilen bilden zusammen eine DATEV-Buchung, etwa Zahlung und Rücklastschrift." },
  near: { label: "nah", kind: "success", description: "Übereinstimmung mit kleiner Abweichung in Betrag oder Datum." },
  alias: { label: "über Namensvariante", kind: "success", description: "Der Gegenpart trägt in DATEV einen anderen Namen, der als Variante hinterlegt ist." },
  split: { label: "aufgeteilt", kind: "success", description: "Eine Zeile deckt mehrere DATEV-Buchungen ab." },
  residual: { label: "als Rest", kind: "success", description: "Blieb nach Abzug aller anderen Zuordnungen übrig — der schwächste der Treffer." },
  manual: { label: "von Hand", kind: "success", description: "Ein Mensch hat die Verknüpfung gesetzt. Überlebt jeden Neulauf der Kaskade." },
  unclear_multi: { label: "mehrdeutig", kind: "warning", description: "Mehrere DATEV-Buchungen kommen infrage — die Kaskade entscheidet nicht selbst." },
  unclear_none: { label: "kein Kandidat", kind: "warning", description: "Keine DATEV-Buchung passt zu dieser Zeile." },
  beyond_bookings: { label: "außerhalb des Bestands", kind: "info", description: "Die Zeile liegt außerhalb des Zeitraums, den die DATEV-Historie abdeckt — kein Befund, nur keine Vergleichsgrundlage." },
  no_account: { label: "ohne Konto", kind: "warning", description: "Das Zahlungskonto der Zeile ist in den Stammdaten nicht zugeordnet." },
  // L-218: „nicht gelaufen" ist etwas anderes als „nichts gefunden". Vorher
  // stand hier NULL, und jede Anzeige erfand ihr eigenes Wort dafür — die
  // Detailsicht des Auszugs schrieb „kein Treffer" und behauptete damit ein
  // Ergebnis, wo noch nicht gesucht worden war.
  not_run: { label: "nicht geprüft", kind: "neutral", description: "Für diese Zeile ist der Abgleich mit der DATEV-Historie nie gelaufen — es liegt kein Ergebnis vor, weder ein Treffer noch ein Fehlschlag." },
};

// ══════════════════════════════════════════════════════════════════════
// DATEV-ABGLEICH
// ══════════════════════════════════════════════════════════════════════

/**
 * `client_datev_mirror_entries.match_state` — wie eine gespiegelte
 * DATEV-Buchung zu Ludwig steht. Geschrieben vom Reconcile-Schritt nach jedem
 * Snapshot-Import (`datev-mirror/application/reconcile`).
 * Wertebereich: DB-CHECK aus `20260729...` (NULL erlaubt → `unreconciled`).
 *
 * Fallstricke:
 *  - `unreconciled` ist KEIN DB-Wert, sondern die UI-Lesart von NULL.
 *  - `disappeared*` heißt „im letzten Snapshot nicht mehr enthalten" — das
 *    passiert auch, wenn sich der `content_hash` durch eine Parser-Änderung
 *    verschiebt (BL-109: Kontonummern-Kanonisierung). Dann ist die Buchung
 *    nicht weg, sondern steht korrigiert daneben.
 *  - `disappeared_committed` ist die Anomalie: festgeschriebene Stapel können
 *    in DATEV eigentlich nicht verschwinden.
 */
const MIRROR_MATCH: Record<string, StatusDescriptor> = {
  matched_ludwig: {
    label: "mit Ludwig gematcht",
    kind: "success",
    description: "DATEV-Buchung eindeutig einer Ludwig-Buchung zugeordnet.",
  },
  matched_split: {
    label: "aufgeteilt (Kanzlei)",
    kind: "success",
    description:
      "Die Kanzlei hat eine Ludwig-Buchung in DATEV in mehrere Buchungen aufgeteilt — die Summe der Teile entspricht dem Ludwig-Betrag.",
  },
  matched_corrected: {
    label: "von der Kanzlei geändert",
    kind: "info",
    description:
      "DATEV-Satz gehört zu einer Ludwig-Buchung (Export-Referenz), die Kanzlei hat Betrag oder Steuerschlüssel in DATEV verändert — DATEV gilt.",
  },
  new_unprocessed: {
    label: "DATEV-Fremdbuchung",
    kind: "info",
    description: "In DATEV gebucht, (noch) nicht in Ludwig — z.B. von der Kanzlei direkt erfasst.",
  },
  unclear: {
    label: "unklar",
    kind: "warning",
    description: "Zuordnung nicht eindeutig (mehrere Kandidaten oder Betragsabweichung) — Klärung nötig.",
  },
  disappeared: {
    label: "in DATEV verschwunden",
    kind: "neutral",
    description:
      "War im Spiegel, im letzten Snapshot nicht mehr enthalten. Bei offenen Stapeln normal; nach einer Parser-Änderung steht die Buchung korrigiert daneben.",
  },
  disappeared_committed: {
    label: "festgeschrieben & weg",
    kind: "danger",
    description:
      "Festgeschriebene Buchung fehlt im neuen Snapshot — sollte nicht vorkommen. Ausnahme: der Spiegel wurde nach einer Parser-Änderung neu aufgebaut.",
  },
  unreconciled: {
    label: "nicht abgeglichen",
    kind: "neutral",
    description: "Noch kein Abgleich über diesen Eintrag gelaufen (DB-Wert: NULL).",
  },
};

/**
 * Zustand eines Abgleich-Laufs (`ops_datev_sync_runs.status` + das
 * Anforderungs-Flag `client_fiscal_years.datev_resync_requested_at`).
 * `requested` ist abgeleitet: Flag gesetzt, aber noch kein Lauf gestartet.
 */
const ABGLEICH_LAUF: Record<string, StatusDescriptor> = {
  requested: {
    label: "angefordert",
    kind: "info",
    description: "Wartet auf die Bridge — der nächste Poll (~30 s) zieht den Abgleich.",
  },
  running: {
    label: "läuft",
    kind: "warning",
    description: "Die Bridge hat den Start gemeldet und zieht gerade die DATEV-Daten.",
  },
  succeeded: {
    label: "abgeschlossen",
    kind: "success",
    description: "DATEV-Snapshot importiert und abgeglichen.",
  },
  failed: {
    label: "gescheitert",
    kind: "danger",
    description: "Lauf mit Fehler beendet — nach 3 Versuchen pausiert die Worklist, ein Admin löst.",
  },
};

/**
 * Lebenslauf eines Buchungszyklus (`client_datev_export_batches.state`, F114).
 *
 * Der Stapel ist nicht die Hülle um einen Export, sondern die Klammer um die
 * Bearbeitung eines Zeitraums: er entsteht beim Eröffnen, trägt die Durchgänge
 * des Agenten und die Arbeit der Kanzlei, wird freigegeben und endet, wenn er
 * in DATEV wiedergefunden ist. Wer gerade dran ist, IST der Zustand.
 *
 * Der Übergang zum Agenten ist eine **menschliche Freigabe** (F177): „Belege
 * vollständig" übergibt den Zyklus, kein Lauf greift ihn von selbst auf.
 */
const ZYKLUS_STAPEL: Record<string, StatusDescriptor> = {
  agent: {
    label: "Beim Agenten",
    kind: "info",
    description:
      "Freigegeben — der Agent ist dran. Ob gerade ein Durchgang läuft, sagt der offene Lauf, " +
      "nicht dieser Zustand.",
  },
  prepared: {
    label: "Vorbereitet",
    kind: "info",
    description:
      "Eröffnet, aber noch nicht freigegeben: Belege dürfen weiter kommen, der Agent sieht den " +
      "Zyklus nicht. „Belege vollständig\" auf der Eingangsseite (oder die Intake-API) übergibt " +
      "ihn an den Agenten; die Kanzlei kann stattdessen die Prüfung übernehmen. Mit offenen " +
      "Nachforderungen heißt das „wartet auf Mandant\".",
  },
  review: {
    label: "Kanzlei prüft",
    kind: "warning",
    description:
      "Der Durchgang ist abgeschlossen, die Kanzlei nimmt ab. Sie gibt frei oder gibt zurück an den Agenten.",
  },
  ready: {
    label: "freigegeben (Bridge)",
    kind: "info",
    description:
      "Abgenommen und geschnitten: die Sätze sind geclaimt und gesperrt, die Bridge holt den Stapel beim nächsten Poll.",
  },
  exporting: {
    label: "wird übertragen",
    kind: "info",
    description: "Die Bridge überträgt den Stapel gerade nach DATEV.",
  },
  inspection: {
    label: "DATEV-Prüfung",
    kind: "warning",
    description: "DATEV prüft den Stapel — noch keine Quittung, aber auch keine Ablehnung.",
  },
  confirmed: {
    label: "exportiert",
    kind: "success",
    description:
      "DATEV hat quittiert. Der Folge-Zyklus ist eröffnet; wiedergefunden im Spiegel ist dieser aber noch nicht.",
  },
  mirrored: {
    label: "in DATEV angekommen",
    kind: "success",
    description:
      "Im DATEV-Spiegel wiedergefunden (ID-Kante). Es gibt Abweichungen — die Nachlese steht aus.",
  },
  closed: {
    label: "abgeschlossen",
    kind: "neutral",
    description: "Wiedergefunden und abgeglichen — der Zyklus ist zu Ende, es gibt nichts mehr zu tun.",
  },
  failed: {
    label: "fehlgeschlagen",
    kind: "danger",
    description:
      "DATEV hat den Stapel abgelehnt. Der Claim bleibt (human-hold): erneut freigeben oder Freigabe zurücknehmen.",
  },
  cancelled: {
    label: "abgebrochen",
    kind: "neutral",
    description:
      "Terminal abgebrochen; die Buchungen sind wieder frei. Nur für Bestand ohne Zyklus — ein lebender Zyklus geht zurück in die Prüfung.",
  },
};

/**
 * Festschreibungs-Zustand eines DATEV-Buchungsstapels.
 * `client_datev_sequences.is_committed` ist ein **Boolean** — die Keys sind
 * deshalb `true`/`false`, damit die technische Anzeige am Chip dem DB-Wert
 * entspricht. Aufrufer übergeben `String(isCommitted)`.
 */
const STAPEL_COMMIT: Record<string, StatusDescriptor> = {
  false: {
    label: "offen",
    kind: "info",
    description: "Stapel noch nicht festgeschrieben — Buchungen sind in DATEV änderbar.",
  },
  true: {
    label: "festgeschrieben",
    kind: "success",
    description: "In DATEV festgeschrieben — unveränderlich.",
  },
};

/**
 * DATEV-`inspection_status` je Stapel (Prüfungsergebnis aus
 * `accounting-sequences`). `not_specified`/NULL = keine Angabe.
 */
const DATEV_PRUEFUNG: Record<string, StatusDescriptor> = {
  not_specified: {
    label: "keine Angabe",
    kind: "neutral",
    description:
      "DATEV liefert kein Prüfungsergebnis. Der Normalfall — auf 61015 tragen 241 von 242 Stapeln diesen Wert.",
  },
  record_with_error: {
    label: "Satzfehler",
    kind: "danger",
    description: "Mindestens ein Satz im Stapel ist fehlerhaft.",
  },
  checked: {
    label: "geprüft",
    kind: "success",
    description: "Stapel von DATEV geprüft, keine Fehler gemeldet.",
  },
  checked_and_error_free: {
    label: "geprüft, fehlerfrei",
    kind: "success",
    description: "Stapel geprüft und ausdrücklich als fehlerfrei markiert.",
  },
  checked_with_error: {
    label: "geprüft, mit Fehler",
    kind: "warning",
    description: "Stapel geprüft, DATEV meldet Fehler.",
  },
};

export const STATUS_REGISTRY: Record<StatusAxis, Record<string, StatusDescriptor>> = {
  beleg: BELEG_PROCESSING,
  beleg_stage: BELEG_STAGE,
  beleg_charakter: BELEG_CHARAKTER,
  beleg_erledigung: BELEG_ERLEDIGUNG,
  beleg_haenger: BELEG_HAENGER,
  beleg_inbox: BELEG_INBOX,
  beleg_kategorie: BELEG_KATEGORIE,
  dokumentgruppe: DOKUMENTGRUPPE,
  beleg_richtung: BELEG_RICHTUNG,
  job: JOB_STATUS,
  upload: UPLOAD_PHASE,
  dispatch: DISPATCH_STATE,
  sachverhalt: SACHVERHALT_LIFECYCLE,
  ereignis_art: EREIGNIS_ART,
  belegnummern_modus: BELEGNUMMERN_MODUS,
  ereignis: EREIGNIS_BUCHUNG,
  disposition: DISPOSITION,
  klaerung: KLAERUNG_SEVERITY,
  klaerung_status: KLAERUNG_STATUS,
  klaerung_typ: KLAERUNG_TYP,
  erwartung: ERWARTUNG_REIFE,
  erwartung_art: ERWARTUNG_ART,
  triage: TRIAGE,
  buchung: BUCHUNG_STATUS,
  buchung_datev: BUCHUNG_DATEV_STAGE,
  buchung_origin: BUCHUNG_ORIGIN,
  konfidenz: KONFIDENZ,
  judge: JUDGE_VERDICT,
  export_case: EXPORT_CASE,
  export_bucket: EXPORT_BUCKET,
  zyklus_stapel: ZYKLUS_STAPEL,
  lauf: LAUF_OUTCOME,
  lauf_gate: LAUF_GATE,
  partner: PARTNER_STATE,
  konto: KONTO_STATUS,
  konto_datev_sync: KONTO_DATEV_SYNC,
  konto_typ: KONTO_TYP,
  verrechnungskonto: VERRECHNUNGSKONTO,
  benutzer: BENUTZER_STATUS,
  benutzer_art: BENUTZER_ART,
  rolle: ROLLE,
  zyklus: ZYKLUS,
  regel_modus: REGEL_MODUS,
  integration: INTEGRATION,
  konvention: KONVENTION_STATUS,
  konvention_herkunft: KONVENTION_HERKUNFT,
  produktbefund: PRODUKTBEFUND,
  produktbefund_prio: PRODUKTBEFUND_PRIO,
  mandant_onboarding: MANDANT_ONBOARDING,
  mandant_onboarding_verdict: MANDANT_ONBOARDING_VERDICT,
  bank_match_stage: BANK_MATCH_STAGE,
  mirror_match: MIRROR_MATCH,
  abgleich_lauf: ABGLEICH_LAUF,
  stapel_commit: STAPEL_COMMIT,
  datev_pruefung: DATEV_PRUEFUNG,
  kontoauszug_erwartung: KONTOAUSZUG_ERWARTUNG,
  opos_ausgleich: OPOS_AUSGLEICH,
  opos_zeilenart: OPOS_ZEILENART,
  datev_verknuepfung: DATEV_VERKNUEPFUNG,
  plausibilitaet: PLAUSIBILITAET,
  belegnummer_quelle: BELEGNUMMER_QUELLE,
  zahlungsweg: ZAHLUNGSWEG,
  mandant_betrieb: MANDANT_BETRIEB,
  dauersachverhalt_uebernahme: DAUERSACHVERHALT_UEBERNAHME,
  token: TOKEN,
  actor_kind: ACTOR_KIND,
  bridge_datev: BRIDGE_DATEV,
  vst_fakt: VST_FAKT,
  vst_regel: VST_REGEL,
  log_level: LOG_LEVEL,
  health: HEALTH,
  readiness: READINESS,
};

const UNKNOWN: StatusDescriptor = { label: "—", kind: "neutral" };

/**
 * Status-Wert einer Achse in Label + Badge-Farbe auflösen.
 *
 * Leerer Wert → neutraler Platzhalter. Unbekannter Wert → der Rohwert als
 * Label, damit ein neu eingeführter DB-Wert sichtbar auffällt statt still zu
 * verschwinden. Der Registry-Test fängt genau diesen Fall vorher ab.
 */
export function resolveStatus(
  axis: StatusAxis,
  value: string | null | undefined,
): StatusDescriptor {
  if (!value) return UNKNOWN;
  return STATUS_REGISTRY[axis][value] ?? { label: value, kind: "neutral" };
}

/**
 * Legende einer Achse für `StatusHeader`: alle möglichen Zustände als
 * {label, kind, meaning}, gespeist aus der Registry (SSOT). So bleiben die
 * Erklärungen in den Spaltenköpfen synchron mit Labels/Farben. `only`
 * schränkt auf eine Reihenfolge/Teilmenge ein (unbekannte Keys werden still
 * übersprungen).
 */
export function axisLegend(
  axis: StatusAxis,
  only?: readonly string[],
): Array<{ value: string; label: string; kind: StatusKind; meaning: string }> {
  const map = STATUS_REGISTRY[axis];
  const keys = only ?? Object.keys(map);
  return keys
    .map((k) => [k, map[k]] as const)
    .filter((e): e is readonly [string, StatusDescriptor] => Boolean(e[1]))
    .map(([value, d]) => ({ value, label: d.label, kind: d.kind, meaning: d.description ?? "" }));
}

/** Erreichte Pipeline-Stufe (`processing_stage`) auflösen — nur Beleg. */
export function resolveStage(stage: string | null | undefined): StatusDescriptor | null {
  if (!stage) return null;
  return resolveStatus("beleg_stage", stage);
}

/**
 * Die Stufen, die ein Fortschrittsbalken als Knoten zeigt. Bewusst NICHT alle
 * Werte von `beleg_stage`: `extracted` ist eine Onboarding-Zwischenstufe des
 * Light-Passes und `proposed` eine historische Endstufe — beide bekommen
 * keinen eigenen Knoten, sonst zeigt der normale Beleg-Flow Phasen, die er
 * nie durchläuft.
 */
export const BELEG_STAGE_FLOW = ["classified", "preprocessed", "interpreted"] as const;

/**
 * Index der erreichten Stufe in `BELEG_STAGE_FLOW`; -1 = noch keine.
 *
 * Existiert, weil `indexOf` auf der rohen Stufe für jeden Wert außerhalb des
 * Flows -1 liefert — ein Beleg auf `extracted` sah dadurch in allen drei
 * Fortschrittsanzeigen aus, als hätte er NICHTS erreicht. Die Zuordnung der
 * Sonderfälle steht deshalb hier und nicht dreimal in der UI:
 *  - `extracted` → wie `classified`. Bewusst konservativ: der Light-Pass
 *    (Classifier + Preprocessor ohne Interpreter) garantiert die volle
 *    Vorverarbeitung nicht, und zu viel Grün wäre die teurere Falschaussage.
 *  - `proposed`  → letzte Stufe; Altdaten aus der Zeit, als das Booking-Modul
 *    noch Teil der Pipeline war.
 */
export function reachedStageIndex(stage: string | null | undefined): number {
  if (!stage) return -1;
  if (stage === "extracted") return 0;
  if (stage === "proposed") return BELEG_STAGE_FLOW.length - 1;
  return (BELEG_STAGE_FLOW as readonly string[]).indexOf(stage);
}

/**
 * Ein Beleg trägt ZWEI Status gleichzeitig: die technische Pipeline-Position
 * (`processing_status`) und — sobald ein Sachverhalt existiert — die fachliche
 * Reviewer-Achse (`lifecycle_status`). Wer nur EINEN Chip zeigen kann (Banner,
 * Listenzeile), braucht eine Vorrangregel. Die steht hier, damit nicht jede
 * Ansicht ihre eigene erfindet:
 *
 *   1. `failed` schlägt alles — ein Pipeline-Abbruch ist die relevanteste
 *      Information, auch wenn fachlich schon ein Sachverhalt offen ist.
 *   2. sonst der Lifecycle, sobald gesetzt — der Reviewer interessiert sich
 *      für „was ist zu tun", nicht für „welche Pipeline-Stufe".
 *   3. sonst der Processing-Status — der Beleg ist noch in der Pipeline.
 *
 * `value` kommt mit zurück, weil Aufrufer daran Detailtexte verzweigen (z.B.
 * Fehlermeldung nur bei `failed`). Achtung: `value` stammt je nach Zweig aus
 * einem ANDEREN Wertebereich — nicht gegen nur ein Enum prüfen.
 */
export function resolveEffectiveBelegStatus(
  processingStatus: string | null | undefined,
  lifecycleStatus: string | null | undefined,
): (StatusDescriptor & { value: string }) | null {
  if (processingStatus === "failed") {
    return { value: "failed", ...resolveStatus("beleg", "failed") };
  }
  if (lifecycleStatus) {
    return { value: lifecycleStatus, ...resolveStatus("sachverhalt", lifecycleStatus) };
  }
  if (processingStatus) {
    return { value: processingStatus, ...resolveStatus("beleg", processingStatus) };
  }
  return null;
}

/** Eingangsgrößen der Ereignis-Ableitung — alles, was am Event persistiert ist. */
export interface EventBookingStateInput {
  /** Status des jüngsten journal_entry an DIESEM Event, null = kein Satz. */
  proposalStatus?: string | null;
  /** `client_accounting_event.no_booking_required_reason` */
  noBookingRequiredReason?: string | null;
  /** `client_accounting_event.superseded_by_event_id != null` */
  superseded?: boolean;
  /** Eine blockierende Rückfrage hängt an diesem Ereignis. */
  blocked?: boolean;
  /** Vorausgeplantes Ereignis aus einer Wiederkehr-Regel, Evidenz fehlt noch. */
  planned?: boolean;
}

/**
 * Buchungs-Zustand eines Ereignisses ableiten — die EINE Regel, damit
 * Kontoauszug und Sachverhalts-Timeline denselben Zustand gleich benennen.
 * Vorher hieß derselbe Fall im Auszug „ohne Buchung" und in der Timeline
 * „Offen", was wie zwei verschiedene Zustände aussah.
 *
 * `value` kommt mit zurück, weil Aufrufer daran verzweigen (z.B. den
 * Begründungstext statt der generischen Beschreibung in den Tooltip legen).
 */
export function resolveEventBookingState(
  input: EventBookingStateInput,
): StatusDescriptor & { value: string } {
  const value = input.superseded
    ? "superseded"
    : input.noBookingRequiredReason
      ? "no_booking_required"
      : input.blocked
        ? "blocked"
        : input.proposalStatus
          ? input.proposalStatus
          : input.planned
            ? "planned"
            : "open";
  const desc = resolveStatus("ereignis", value);
  // Die hinterlegte Begründung schlägt den generischen Erklärtext — sie ist
  // die eigentliche Antwort auf „warum wird hier nicht gebucht?".
  return value === "no_booking_required" && input.noBookingRequiredReason
    ? { ...desc, value, description: input.noBookingRequiredReason }
    : { ...desc, value };
}

/* ══════════════════════════════════════════════════════════════════════
   ÜBERGÄNGE
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Ein Übergang zwischen zwei Zuständen.
 *
 * `from: null` ist der Eintritt — wie ein Ding in die Achse hineinkommt.
 * `to: null` gibt es nicht: wer die Achse verlässt, tut das über einen
 * Endzustand, und der steht in der Descriptor-Map.
 *
 * **`trigger` ist technisch und englisch, `label` ist die Anzeige.** Bis
 * 2026-09-07 trug `trigger` beides in einem deutschen Satz — damit gab es
 * keinen stabilen Schlüssel, den ein State-Machine-Log speichern könnte, und
 * eine umformulierte Beschriftung hätte still die Log-Historie zerschnitten
 * (F150 T150.1).
 */
export interface StateTransition {
  /**
   * Nur setzen, wenn der Übergang **nicht** auf der Standardachse der Maschine
   * liegt. Ein Prozess darf mehrere Achsen schreiben (siehe
   * `document_processing`), ohne dass die Achsen ihren eigenen Wertebereich
   * und ihren Deckungstest verlieren.
   */
  axis?: StatusAxis;
  /** Ausgangszustand, oder `null` für den Eintritt in die Achse. */
  from: string | null;
  to: string;
  /**
   * Technischer Name des Übergangs — englisch, `snake_case`. Das ist der
   * Wert, den das spätere State-Machine-Log schreibt. Er darf sich innerhalb
   * einer Maschine wiederholen: derselbe Auslöser kann aus mehreren
   * Zuständen feuern.
   */
  trigger: string;
  /** Deutsche Beschriftung — was ein Mensch liest. */
  label: string;
  /** Wer ihn auslöst: ein Wert der Achse `actor_kind`, oder „system". */
  by?: string;
}

/**
 * Ein Prozess und die Übergänge, die er schreibt.
 *
 * Der Schlüssel in `STATE_MACHINES` ist der **Prozess**, nicht die Spalte —
 * englisch, weil ihn Maschinen lesen. Meist deckt sich beides, dann steht in
 * `axis` genau eine Achse und kein Übergang setzt seine eigene.
 */
export interface StateMachine {
  /** Achse, auf die sich Übergänge ohne eigenes `axis` beziehen. */
  axis: StatusAxis;
  description: string;
  transitions: StateTransition[];
}

/**
 * Die Zustandsmaschinen, soweit sie aufgeschrieben sind.
 *
 * Bis 2026-09-07 standen Übergänge als **Prosa im Kommentar** — vier Achsen
 * hatten einen „Übergänge:"-Block, ein Dutzend weitere Pfeile im Fließtext.
 * Zwei Tabellen lagen in der Doku, eine dritte Form im Code
 * (`CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS`, vollvermascht und anders
 * geschnitten). Nichts davon war abfragbar, nichts prüfbar (L-74).
 *
 * Hier stehen sie als Daten. Der Registry-Test prüft, dass jedes `from` und
 * `to` ein Schlüssel seiner Achse ist — ein umbenannter Zustand macht die
 * Maschine rot, statt sie still falsch werden zu lassen.
 *
 * ## Was hier NICHT steht
 * Die 45 Achsen, die keinen Prozess abbilden. Sie sagen, *was* etwas ist
 * (`beleg_kategorie`, `actor_kind`) oder werden bei jedem Aufruf neu gerechnet
 * (`konfidenz`, `mahnstufe`) — beides hat keine Übergänge, weil sich nichts
 * bewegt. Sie werden Klassen und ziehen in eine eigene Datei um (F151).
 * Eine fehlende Maschine ist deshalb **keine** automatische Lücke; offen sind
 * heute nur die dreizehn kurzen Achsen aus Rang 3 (Owner 2026-09-07:
 * zurückgestellt, „fast nur zwei Zustände").
 */
export const STATE_MACHINES: Record<string, StateMachine> = {
  /* ── Beleg ──────────────────────────────────────────────────────────── */

  document_processing: {
    axis: "beleg",
    description:
      "Der Weg eines Belegs durch die Verarbeitung — EIN Prozess über drei Spalten. " +
      "`beleg_inbox` (Supertyp, jede Belegart) läuft zuerst, `beleg` (Rechnungs-Subtyp) danach, " +
      "und `beleg_stage` ist die Position *innerhalb* von `in_progress`, kein eigener Weg. " +
      "Dass die Aufteilung künstlich ist, zeigt `resolveEffectiveBelegStatus`: die Funktion " +
      "existiert nur, um zwei Achsen für einen einzigen Chip wieder zusammenzurechnen (F151).",
    transitions: [
      // — Eingang, Supertyp `client_source_docs.status` —
      { axis: "beleg_inbox", from: null, to: "pending_classification", trigger: "document_uploaded", label: "Datei hochgeladen", by: "user" },
      { axis: "beleg_inbox", from: "pending_classification", to: "classified", trigger: "classification_succeeded", label: "Klassifikator hat die Dokumentart erkannt", by: "system" },
      { axis: "beleg_inbox", from: "pending_classification", to: "classification_failed", trigger: "classification_failed", label: "Dokumentart nicht bestimmbar — es gibt keinen automatischen Wiederholungslauf", by: "system" },
      { axis: "beleg_inbox", from: "classification_failed", to: "pending_classification", trigger: "classification_restarted", label: "von Hand neu angestoßen", by: "user" },
      { axis: "beleg_inbox", from: "classified", to: "pending_classification", trigger: "document_reprocessed", label: "Neuverarbeitung angestoßen", by: "user" },
      { axis: "beleg_inbox", from: "classified", to: "deleted", trigger: "document_soft_deleted", label: "aus der Liste entfernt — Datei und Historie bleiben", by: "user" },
      // F170: ein erkannter Kontoauszug nimmt den Eingang, aber nicht die
      // Klassifikation — er wartet auf das Bankkonto und geht danach als
      // erledigt heraus (`completed_via='import'`).
      { axis: "beleg_inbox", from: null, to: "awaiting_input", trigger: "statement_detected", label: "Kontoauszug erkannt — das Bankkonto steht nicht in der Datei", by: "system" },
      { axis: "beleg_inbox", from: "awaiting_input", to: "classified", trigger: "statement_imported", label: "Bankkonto gewählt, Auszug importiert", by: "user" },
      { axis: "beleg_inbox", from: "awaiting_input", to: "deleted", trigger: "document_soft_deleted", label: "aus der Liste entfernt, ohne importiert zu werden", by: "user" },

      // — Pipeline, Subtyp `client_source_docs_invoices.processing_status` —
      { from: null, to: "pending", trigger: "invoice_row_created", label: "Rechnungs-Stub angelegt, bevor die Pipeline läuft", by: "api" },
      { from: "pending", to: "in_progress", trigger: "pipeline_started", label: "Workflow greift den Beleg auf", by: "system" },
      { from: "in_progress", to: "processed", trigger: "pipeline_completed", label: "ohne offene Findings fertig", by: "system" },
      { from: "in_progress", to: "review_needed", trigger: "pipeline_completed_with_findings", label: "reparierbare Findings bleiben — kein Abbruch", by: "system" },
      { from: "in_progress", to: "failed", trigger: "pipeline_aborted", label: "Crash, Timeout oder kritischer Befund", by: "system" },
      { from: "review_needed", to: "processed", trigger: "extraction_corrected", label: "Extraktion korrigiert, synchron neu geprüft", by: "user" },
      { from: "processed", to: "review_needed", trigger: "revalidation_found_findings", label: "Revalidierung findet doch etwas", by: "system" },
      { from: "failed", to: "in_progress", trigger: "pipeline_restarted", label: "Neuverarbeitung angestoßen", by: "user" },

      // — Stufen innerhalb von `in_progress`, `…invoices.processing_stage`.
      //   Resume-Anker des Workflows, nicht nur Anzeige: ein von Hand
      //   gesetzter Wert kann Belege dauerhaft überspringen lassen. —
      { axis: "beleg_stage", from: null, to: "classified", trigger: "stage_classified", label: "Belegart erkannt (Cheap-Classifier)", by: "system" },
      { axis: "beleg_stage", from: "classified", to: "extracted", trigger: "stage_extracted", label: "Grunddaten ausgelesen — Schnelldurchlauf des Onboardings, hier endet er", by: "system" },
      { axis: "beleg_stage", from: "classified", to: "preprocessed", trigger: "stage_preprocessed", label: "OCR und Strukturierung durch", by: "system" },
      { axis: "beleg_stage", from: "preprocessed", to: "interpreted", trigger: "stage_interpreted", label: "fachliche Bedeutung ermittelt (Rolle, Positionen, Lieferant)", by: "system" },
      { axis: "beleg_stage", from: "interpreted", to: "proposed", trigger: "stage_proposed", label: "historisch — seit 2026-07-06 entstehen Vorschläge am Sachverhalt", by: "system" },
    ],
  },

  document_completion: {
    axis: "beleg_erledigung",
    description:
      "Ob der Beleg fachlich durch ist — die zweite, parallele Achse des Belegs. Sie folgt der " +
      "BUCHUNG, nicht der Pipeline: „Pipeline durchgelaufen\" heißt nicht „fertig\", und ein " +
      "erledigter Beleg kann eine abgebrochene Pipeline haben. Deshalb eine eigene Maschine und " +
      "nicht in `document_processing` gefaltet — beide Zustände dürfen gleichzeitig gelten.",
    transitions: [
      { from: null, to: "open", trigger: "document_created", label: "Beleg angelegt, `completed_at` ist NULL", by: "system" },
      { from: "open", to: "booking", trigger: "completed_by_booking", label: "die Buchung hat ihn beim Abschluss miterledigt", by: "system" },
      { from: "open", to: "manual", trigger: "completed_by_hand", label: "von Hand abgehakt, mit Begründung", by: "user" },
      { from: "open", to: "no_booking_required", trigger: "marked_no_booking_required", label: "kein Buchungsbedarf — der Beleg bleibt liegen, ohne offen zu sein", by: "user" },
      { from: "open", to: "case_closed", trigger: "completed_by_case_close", label: "der Sachverhalt wurde geschlossen, der Beleg nicht einzeln abgehakt", by: "user" },
      { from: "open", to: "import", trigger: "completed_by_datev_import", label: "kam aus DATEV und war dort bereits gebucht", by: "system" },
      { from: "open", to: "superseded", trigger: "superseded_by_document", label: "ein neuer Beleg hat diesen abgelöst (Korrektur, zweiter Scan)", by: "user" },
      { from: "open", to: "completed", trigger: "completed_without_reason", label: "Altbestand — erledigt, Grund nicht festgehalten; seit F87 schreibt jeder Weg seinen Grund mit", by: "system" },
      { from: "booking", to: "open", trigger: "reopened_by_reversal", label: "die Buchung wurde storniert — der Trigger nimmt den Stempel zurück", by: "system" },
    ],
  },

  /* ── Sachverhalt und Buchung ────────────────────────────────────────── */

  accounting_case: {
    axis: "sachverhalt",
    description:
      "Der fachliche Weg eines Sachverhalts durch den Review. `needs_clarification` sticht " +
      "`waiting_for_documents`: wer eine echte Rückfrage offen hat, zeigt das, auch wenn " +
      "zusätzlich Unterlagen fehlen.",
    transitions: [
      { from: null, to: "in_pipeline", trigger: "case_created", label: "Sachverhalt entsteht am Beleg-Ereignis", by: "system" },
      { from: "in_pipeline", to: "open", trigger: "pipeline_completed", label: "Verarbeitung durch — der Sachverhalt liegt zur Bearbeitung", by: "system" },
      { from: "open", to: "needs_clarification", trigger: "clarification_raised", label: "eine Rückfrage wurde gestellt", by: "agent" },
      { from: "waiting_for_documents", to: "needs_clarification", trigger: "clarification_raised", label: "eine Rückfrage kommt dazu und sticht die fehlende Unterlage", by: "agent" },
      { from: "needs_clarification", to: "open", trigger: "clarification_answered", label: "die Rückfrage ist beantwortet", by: "user" },
      { from: "open", to: "waiting_for_documents", trigger: "document_expected", label: "eine Unterlage wird erwartet — fehlender Beleg ist keine Frage", by: "agent" },
      { from: "waiting_for_documents", to: "open", trigger: "expected_document_arrived", label: "die erwartete Unterlage ist da", by: "system" },
      { from: "open", to: "closed_accepted", trigger: "case_accepted", label: "abgenommen — der Trigger stempelt die Quelldokumente auf „erledigt\"", by: "user" },
      { from: "open", to: "closed_rejected", trigger: "case_rejected", label: "verworfen", by: "user" },
      { from: "open", to: "closed_superseded", trigger: "case_merged", label: "durch einen anderen Sachverhalt abgelöst (Zusammenführung)", by: "agent" },
      { from: "closed_accepted", to: "open", trigger: "case_reopened", label: "wieder geöffnet — die Erledigt-Stempel an den Belegen bleiben bewusst stehen", by: "user" },
    ],
  },

  journal_entry: {
    axis: "buchung",
    description:
      "Die Audit-Achse der Buchung. Exportiert wird ausschließlich `accepted`, nicht `posted` — " +
      "der Reviewer gibt für DATEV frei, er schreibt nicht fest. `posted` ist für eine künftige " +
      "eigene Festschreibung reserviert und entsteht heute nur über den DATEV-Import.",
    transitions: [
      { from: null, to: "proposed", trigger: "booking_proposed", label: "Vorschlag am Sachverhalt entstanden", by: "agent" },
      { from: "proposed", to: "accepted", trigger: "booking_released", label: "für DATEV freigegeben", by: "user" },
      { from: "accepted", to: "proposed", trigger: "release_withdrawn", label: "Freigabe zurückgenommen — nur solange nicht exportiert", by: "user" },
      { from: "accepted", to: "posted", trigger: "found_posted_in_datev", label: "der DATEV-Import meldet den Satz als dort bereits Ist", by: "system" },
      { from: "accepted", to: "reversed", trigger: "booking_reversed", label: "storniert — nach dem Export der einzige verbliebene Weg", by: "user" },
      { from: "posted", to: "reversed", trigger: "booking_reversed", label: "storniert", by: "user" },
    ],
  },

  export_batch: {
    axis: "zyklus_stapel",
    description:
      "Der Buchungszyklus: die Klammer um die Bearbeitung eines Zeitraums, vom Eröffnen bis " +
      "zum Wiederfinden in DATEV. Wer gerade dran ist, IST der Zustand. Die längste Kette im " +
      "System — elf Zustände über Agent, Kanzlei, Bridge und DATEV.",
    transitions: [
      { from: null, to: "prepared", trigger: "cycle_opened", label: "Zyklus eröffnet", by: "user" },
      { from: "prepared", to: "agent", trigger: "released_to_agent", label: "Belege vollständig — der Zyklus ist an den Agenten übergeben", by: "user" },
      { from: "agent", to: "prepared", trigger: "agent_run_finished", label: "Durchgang beendet — der Zyklus liegt wieder bereit", by: "agent" },
      { from: "prepared", to: "review", trigger: "review_started", label: "die Kanzlei übernimmt die Abnahme statt des nächsten Durchgangs", by: "user" },
      { from: "review", to: "prepared", trigger: "returned_to_agent", label: "die Kanzlei gibt an den Agenten zurück", by: "user" },
      { from: "review", to: "ready", trigger: "batch_released", label: "abgenommen und geschnitten — die Sätze sind geclaimt und gesperrt", by: "user" },
      { from: "ready", to: "exporting", trigger: "bridge_picked_up", label: "die Bridge holt den Stapel beim nächsten Poll", by: "system" },
      { from: "exporting", to: "inspection", trigger: "datev_received", label: "übertragen — DATEV prüft, noch keine Quittung", by: "system" },
      { from: "inspection", to: "confirmed", trigger: "datev_acknowledged", label: "DATEV hat quittiert; der Folge-Zyklus ist eröffnet", by: "system" },
      { from: "inspection", to: "failed", trigger: "datev_rejected", label: "DATEV hat den Stapel abgelehnt — der Claim bleibt (human-hold)", by: "system" },
      { from: "failed", to: "ready", trigger: "released_again", label: "erneut freigegeben", by: "user" },
      { from: "failed", to: "review", trigger: "release_withdrawn", label: "Freigabe zurückgenommen", by: "user" },
      { from: "confirmed", to: "mirrored", trigger: "found_in_mirror", label: "im DATEV-Spiegel wiedergefunden (ID-Kante) — die Nachlese steht aus", by: "system" },
      { from: "mirrored", to: "closed", trigger: "reconciled", label: "abgeglichen — es gibt nichts mehr zu tun", by: "system" },
      { from: "prepared", to: "cancelled", trigger: "cycle_cancelled", label: "Altbestand: terminal abgebrochen, die Buchungen sind wieder frei — ein lebender Zyklus geht stattdessen zurück in die Prüfung", by: "user" },
    ],
  },

  /* ── Wer am Zug ist, Mandant, Partner, Lauf ─────────────────────────── */

  disposition: {
    axis: "disposition",
    description:
      "Wer am Zug ist. Kurze Kette, hohe Sichtbarkeit — sie beantwortet „warum liegt der Fall\". " +
      "`client` ist derzeit stillgelegt: ohne Portal-Betrieb liegen Fälle bei Agent oder Kanzlei.",
    transitions: [
      { from: null, to: "agent", trigger: "case_created", label: "ein neuer Sachverhalt landet beim Agenten", by: "system" },
      { from: "agent", to: "accounting", trigger: "handed_to_accounting", label: "der Agent kommt nicht weiter — die Kanzlei ist am Zug", by: "agent" },
      { from: "accounting", to: "agent", trigger: "handed_back_to_agent", label: "die Kanzlei gibt zurück an den Agenten", by: "user" },
      { from: "agent", to: "client", trigger: "question_to_client", label: "Rückfrage an den Mandanten", by: "agent" },
      { from: "client", to: "accounting", trigger: "client_answered", label: "der Mandant hat geantwortet", by: "user" },
    ],
  },

  client_onboarding: {
    axis: "mandant_onboarding",
    description:
      "Der Weg eines Mandanten bis zur Buchbarkeit. Wird selten durchlaufen, dann aber von " +
      "jemandem, der nicht weiß, was noch fehlt. Nichts läuft von selbst weiter: weder " +
      "`processing` noch `failed` haben einen automatischen Wiederholungslauf.",
    transitions: [
      { from: null, to: "created", trigger: "client_created", label: "Mandant in Ludwig angelegt", by: "user" },
      { from: "created", to: "importing", trigger: "bridge_poll_started", label: "die Bridge lädt Stammdaten, Konten und Buchungshistorie aus DATEV", by: "system" },
      { from: "importing", to: "processing", trigger: "import_finished", label: "Daten geladen — die Pipeline bereitet sie auf", by: "system" },
      { from: "processing", to: "review", trigger: "preparation_finished", label: "Aufbereitung durch — bis zur Freigabe ist der Mandant NICHT buchbar", by: "system" },
      { from: "review", to: "ready", trigger: "review_completed", label: "Bankverbindungen und Buchungsbeginn bestätigt — der Mandant ist buchbar", by: "user" },
      { from: "importing", to: "failed", trigger: "onboarding_aborted", label: "der Import ist abgebrochen", by: "system" },
      { from: "processing", to: "failed", trigger: "onboarding_aborted", label: "die Aufbereitung ist abgebrochen", by: "system" },
      { from: "failed", to: "importing", trigger: "onboarding_restarted", label: "bewusst neu angestoßen", by: "user" },
    ],
  },

  business_partner: {
    axis: "partner",
    description:
      "Vom erkannten Namen zum bebuchbaren Geschäftspartner. Der Weg ist kurz, die Frage " +
      "„warum hängt der noch\" häufig — sie beantwortet sich mit `proposed`.",
    transitions: [
      { from: null, to: "proposed", trigger: "partner_detected", label: "aus einem Beleg automatisch erkannt", by: "system" },
      { from: null, to: "draft", trigger: "partner_drafted", label: "angelegt, aber noch nicht ausgearbeitet", by: "user" },
      { from: "draft", to: "proposed", trigger: "partner_submitted", label: "zur Bestätigung vorgelegt", by: "user" },
      { from: "proposed", to: "confirmed", trigger: "partner_confirmed", label: "die Kanzlei bestätigt — ab jetzt bebuchbar", by: "user" },
      { from: "confirmed", to: "proposed", trigger: "partner_reopened", label: "Bestätigung zurückgenommen", by: "user" },
    ],
  },

  run_gate: {
    axis: "lauf_gate",
    description:
      "Die Tore eines Agentenlaufs. `running` ist der DB-Wert NULL — der Schritt ist betreten " +
      "und noch offen. `blocked` ist kein Endzustand: wird das Gate grün, geht es weiter; " +
      "zweimal dasselbe Gate eskaliert an den Menschen.",
    transitions: [
      { from: null, to: "running", trigger: "step_entered", label: "Schritt betreten, Gate noch offen", by: "agent" },
      { from: "running", to: "passed", trigger: "gate_passed", label: "der Agent hat im Schritt gearbeitet und ihn grün verlassen", by: "agent" },
      { from: "running", to: "auto_passed", trigger: "gate_auto_passed", label: "der Server hat das Gate aus den Daten heraus als erfüllt gerechnet — erledigt, nicht übersprungen", by: "system" },
      { from: "running", to: "blocked", trigger: "gate_blocked", label: "Übergang abgelehnt, das Gate war rot", by: "system" },
      { from: "blocked", to: "running", trigger: "gate_retried", label: "erneuter Anlauf, nachdem sich etwas geändert hat", by: "agent" },
      { from: "blocked", to: "overridden", trigger: "gate_overridden", label: "mit begründeter Ausnahme passiert — jeder offene Fall musste benannt werden", by: "user" },
      { from: "blocked", to: "unresolved", trigger: "run_closed_while_red", label: "beim Lauf-Abschluss war das Gate noch rot — unvollständiger Abschluss, kein Durchlauf", by: "system" },
    ],
  },

  /* ── Technische Läufe ───────────────────────────────────────────────── */

  ops_job: {
    axis: "job",
    description:
      "Der durable Job in `ops_jobs`. Job-Erfolg ist nicht Beleg-Erfolg: der Ingest-Handler wirft nicht, der Job wird auch dann `succeeded`, wenn der Beleg intern scheiterte.",
    transitions: [
      { from: null, to: "queued", trigger: "job_enqueued", label: "eingereiht", by: "system" },
      { from: "queued", to: "running", trigger: "job_claimed", label: "Worker greift ihn (zählt `attempts` hoch)", by: "system" },
      { from: "running", to: "succeeded", trigger: "job_succeeded", label: "durchgelaufen", by: "system" },
      { from: "running", to: "queued", trigger: "job_retried", label: "Fehler — Wiederholung nach 60 s; der Reaper requeued zusätzlich, wenn `locked_at` zu alt ist", by: "system" },
      { from: "running", to: "failed", trigger: "job_attempts_exhausted", label: "Versuche erschöpft", by: "system" },
      { from: "queued", to: "failed", trigger: "job_type_unknown", label: "unbekannter `job_type` — sofort, ohne Wiederholung", by: "system" },
    ],
  },

  browser_upload: {
    axis: "upload",
    description:
      "Der Browser-Upload einer Datei. Reiner Client-Zustand, überlebt keinen Reload. `done` heißt nur „Datei ist angekommen\" — ob Klassifizierung und Ingest starteten, steht daneben.",
    transitions: [
      { from: null, to: "queued", trigger: "file_selected", label: "Datei ausgewählt oder abgelegt", by: "user" },
      { from: "queued", to: "uploading", trigger: "transfer_started", label: "Übertragung beginnt", by: "system" },
      { from: "uploading", to: "finalizing", trigger: "transfer_finished", label: "Datei liegt im Speicher, Eintrag wird angelegt", by: "system" },
      { from: "finalizing", to: "done", trigger: "entry_created", label: "Eintrag steht", by: "system" },
      { from: "queued", to: "error", trigger: "upload_aborted", label: "Abbruch vor der Übertragung", by: "system" },
      { from: "uploading", to: "error", trigger: "upload_aborted", label: "Abbruch während der Übertragung", by: "system" },
      { from: "finalizing", to: "error", trigger: "upload_aborted", label: "Abbruch beim Anlegen des Eintrags", by: "system" },
    ],
  },

  processing_dispatch: {
    axis: "dispatch",
    description:
      "Der Anstoß der Verarbeitung aus dem Browser. `failed` heißt „Start misslungen\", nicht „Beleg gescheitert\" — der Beleg steht danach unverändert auf `pending`.",
    transitions: [
      { from: null, to: "queued", trigger: "dispatch_requested", label: "Verarbeitung angestoßen", by: "user" },
      { from: "queued", to: "starting", trigger: "dispatch_sent", label: "Aufruf abgesetzt", by: "system" },
      { from: "starting", to: "running", trigger: "dispatch_acknowledged", label: "Workflow bestätigt den Start", by: "system" },
      { from: "running", to: "done", trigger: "processing_finished", label: "der Beleg-Status meldet das Ende", by: "system" },
      { from: "running", to: "stuck", trigger: "dispatch_wait_timeout", label: "nach 5 Minuten hört der Browser auf zu warten — serverseitig läuft es weiter", by: "system" },
      { from: "starting", to: "failed", trigger: "dispatch_failed", label: "der Aufruf kam nicht durch", by: "system" },
    ],
  },
};

/**
 * Klartext-Name der Achse. Führt den Tooltip an („Sachverhalt · Klärung
 * offen · …"), damit ein Status nie ohne seinen Bezug dasteht — dieselbe
 * Farbe bedeutet je nach Achse etwas anderes.
 */
export const AXIS_LABEL: Record<StatusAxis, string> = {
  beleg: "Beleg",
  beleg_stage: "Verarbeitungsstufe",
  beleg_charakter: "Beleg-Charakter",
  beleg_erledigung: "Erledigung",
  beleg_haenger: "Beleg-Zustand",
  beleg_inbox: "Dokument",
  beleg_kategorie: "Belegkategorie",
  dokumentgruppe: "Art der Dokumentgruppe",
  beleg_richtung: "Belegrichtung",
  job: "Auftrag",
  upload: "Upload",
  dispatch: "Stapellauf",
  sachverhalt: "Sachverhalt",
  ereignis_art: "Ereignisart",
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
  bank_match_stage: "DATEV-Historie",
  mirror_match: "DATEV-Abgleich",
  abgleich_lauf: "Abgleich-Lauf",
  zyklus_stapel: "Buchungszyklus",
  stapel_commit: "Festschreibung",
  datev_pruefung: "DATEV-Prüfung",
  kontoauszug_erwartung: "Kontoauszug",
  opos_ausgleich: "Ausgleich",
  opos_zeilenart: "Zeilenart",
  datev_verknuepfung: "Verknüpfung",
  plausibilitaet: "Ergebnis",
  belegnummer_quelle: "Quelle",
  zahlungsweg: "Zahlungsweg-Zustand",
  mandant_betrieb: "Betriebszustand",
  dauersachverhalt_uebernahme: "Übernahme",
  token: "Token",
  actor_kind: "Akteur",
  bridge_datev: "Bridge",
  vst_fakt: "Vorsteuer-Fakt",
  vst_regel: "Vorsteuer-Regel",
  log_level: "Level",
  health: "Systemcheck",
  readiness: "Konfiguration",
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
  beleg_charakter: "client_source_docs.class_document_kind",
  beleg_erledigung: "client_source_docs.completed_via (+ completed_at)",
  beleg_haenger: "berechnet — hasInvoiceRow + Listen-Variante (ephemer)",
  beleg_inbox: "client_source_docs.status",
  beleg_kategorie: "client_source_docs.doc_category",
  dokumentgruppe: "client_source_docs.collection_kind",
  beleg_richtung: "client_source_docs_invoices.doc_direction",
  job: "ops_jobs.status",
  upload: "ephemer — React-State im Browser, keine DB-Spalte",
  dispatch: "ephemer — React-State im Verarbeitungs-Panel",
  sachverhalt: "client_accounting_case.lifecycle_status",
  ereignis_art: "client_accounting_event.kind",
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
  bank_match_stage: "client_bank_transactions.match_stage (NULL = Kaskade nicht gelaufen)",
  mirror_match: "client_datev_mirror_entries.match_state (NULL = nicht abgeglichen)",
  abgleich_lauf: "ops_datev_sync_runs.status + client_fiscal_years.datev_resync_requested_at",
  zyklus_stapel: "client_datev_export_batches.state",
  stapel_commit: "client_datev_sequences.is_committed (boolean)",
  datev_pruefung: "client_datev_sequences.inspection_status",
  kontoauszug_erwartung: "berechnet — DATEV-Bankverbindungen + client_payment_accounts.statement_expected",
  opos_ausgleich: "berechnet — OPOS-Bestand zum Stichtag (ephemer)",
  opos_zeilenart: "berechnet — Ausgleichs-Klammer F77 (ephemer)",
  datev_verknuepfung: "berechnet — VIA_LABEL in modules/datev-truth (ephemer)",
  plausibilitaet: "berechnet — PlausibilityCheck.verdict (ephemer)",
  belegnummer_quelle: "berechnet — Dominanz-Rangfolge der Belegnummern-Quellen (ephemer)",
  zahlungsweg: "berechnet — client_payment_accounts.valid_until",
  mandant_betrieb: "berechnet — platform_clients.is_active + replay_cutoff_date",
  dauersachverhalt_uebernahme: "berechnet — RecurringCandidateClass aus der DATEV-Buchungshistorie (F91)",
  token: "berechnet — platform_agent_tokens.revoked_at + expires_at",
  actor_kind: "platform_audit_events.actor_kind",
  bridge_datev: "berechnet — DatevApiStatus, von der on-prem Bridge gemeldet (ephemer)",
  vst_fakt: "berechnet — VatFact.value aus den Belegdaten (ephemer)",
  vst_regel: "berechnet — Katalog-Regel über den Vorsteuer-Fakten (ephemer)",
  log_level: "client_invoice_traces.level",
  health: "berechnet — modules/health/aggregate.ts (ephemer)",
  readiness: "berechnet — Onboarding-Aggregat (ephemer)",
};
