# UI-Repräsentationen der Kern-Entitäten — Inventar, Bewertung, Zielstruktur

> **Dieses Repo führt das Inventar.** Es lag bis 2026-09-03 als
> `docs/reference/datenmodell/ui-repraesentationen.md` in `ludwig/app` und ist
> dort entfallen — diese Fassung ist die maßgebliche und wird hier gepflegt.
> Deshalb liegt es **nicht** unter `docs/ludwig/` (das ist der Spiegel dessen,
> was drüben SSOT bleibt, und wird bei `pnpm sync:ludwig` neu geschrieben).
>
> **Pfade im Text zeigen auf die App.** Übersetzung:
> `apps/web/src/ui/v2` → `src/ui/v3`, `src/styles/v2.css` → `src/styles/v3.css`.

**Erzeugt:** 2026-08-29 · **Auftrag:** `docs/backlog/F111-entitaeten-ui-repraesentationen.md` ·
**Grundlage der Entitätenliste:** `docs/reference/datenmodell/datenmodell-review-2026-08-27.md` §7 ·
**Werkbank:** `pnpm --filter @ludwig/web storybook` (Port 6106)

Die Frage hinter diesem Dokument: **Sieht dieselbe Entität überall gleich aus —
und wo baut ein Screen zum zweiten Mal, was es schon gibt?**

---

## 0. Kennzahlen

| | |
|---|---|
| Entitäten im Scope (§7: hoch + mittel) | 28 |
| davon mit **eigener** UI-Komponente | 24 |
| davon **ohne** jede eigene Komponente | **4** (§3.1) |
| Komponentendateien (`src/**/*.tsx` ohne Pages/Tests/Stories) | 219 |
| exportierte Komponenten | 247 |
| Pages/Layouts | 87 mit **16.053** Zeilen — 24 davon über 200 Zeilen (§2.3) |
| Zeilen in Komponenten | 37.483 |
| davon im **v2**-Set (`@/ui/v2`, F118 §2) | **12** in 2 Dateien |

**Reinheitsgrad** — die Einteilung, die über Storybook-Tauglichkeit entscheidet:

| Grad | Zahl | Bedeutung |
|---|---:|---|
| `pure` | 79 | Props rein, JSX raus. Kein State, kein Laden. |
| `pure+i` | 43 | interaktiv (State/Router), lädt aber nichts. |
| `RSC` | 22 | Server Component — liest im Rendern. |
| `lädt` | 75 | ruft Server Action oder server-only Reader auf. |

122 der 219 Dateien (56 %) sind damit storybook-tauglich. **64 haben eine
Story** (207 Stories, §5); die übrigen 58 sind in §5.2 mit Begründung gelistet.

> **v1 und v2.** Alles in diesem Dokument beschreibt den **v1**-Bestand.
> Das neue Set liegt unter `@/ui/v2` und ist heute auf der Stapel-Subsite
> eingelöst; welche Bausteine, Entitäten und Seiten v2 sind oder werden,
> steht in `docs/design-guidelines.md §11`, die Abnahmekriterien in
> `docs/design-guidelines.md`. In Storybook trägt jede
> v2-Komponente den Titel-Präfix `v2/` — dort ist die Frage „wovon haben
> wir eine v2?" ohne gepflegte Liste zu beantworten.

**Methode.** Alle `.tsx` unter `apps/web/src` maschinell gescannt (Exporte,
JSDoc, Imports, Hooks), der Reinheitsgrad über die tatsächlich aufgerufenen
Server Actions bestimmt (127 Action-Exporte im Repo als Referenzmenge), die
Zuordnung Entität × Komponente von Hand gesetzt und maschinell auf
Vollständigkeit geprüft: keine Komponentendatei fehlt, keine erfasste Datei
existiert nicht.

---

## 1. Inventar: Entität × Komponente (T111.1)

Legende — **Form**: Zeile · Karte · Detail · Badge · Auswahl · Kopf · Liste ·
Inline · Vorschau · Drawer · Editor. **Reinheit**: siehe oben.
**Story**: 🎭 = in Storybook sichtbar.

Entitäten in der Reihenfolge des Datenmodells (Quelle → Ereignis → Sachverhalt
→ Buchung, danach Stammdaten und Betrieb).

#### Mandant

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `ExperimentBadge` | `ui/components/layout` | Badge | pure | 🎭 |
| `OnboardingStateBadge` | `modules/admin/ui` | Badge | RSC |  |
| `OnboardingSection` | `modules/clients/ui/configuration` | Detail | lädt |  |
| `ClientCreateForm` | `modules/admin/ui` | Editor | lädt |  |
| `ClientMasterDataForm` | `modules/admin/ui` | Editor | lädt |  |
| `ClientActiveToggle` | `modules/admin/ui` | Editor | lädt |  |
| `DeleteClientButton` | `modules/admin/ui` | Editor | lädt |  |
| `OnboardingWizard` | `modules/admin/ui` | Editor | lädt |  |
| `BookingIntervalSelect` | `modules/clients/ui/configuration` | Editor | lädt |  |
| `BookingStyleSelect` | `modules/clients/ui/configuration` | Editor | lädt |  |
| `DiverseStrategySelect` | `modules/clients/ui/configuration` | Editor | lädt |  |
| `PostingTextConventionEditor` | `modules/clients/ui/configuration` | Editor | lädt |  |
| `TradeNamesEditor` | `modules/clients/ui/configuration` | Editor | lädt |  |
| `DatevExportMethodSelect` | `modules/datev-export/ui` | Editor | lädt |  |
| `ChecklistRow`, `ContextHint`, `KeyValueGrid` | `modules/clients/ui/configuration` | Inline | pure |  |
| `MandantSwitcher` | `ui/components/layout` | Kopf | pure | 🎭 |
| `MandantBand` | `ui/components/layout` | Kopf | RSC |  |
| `ExperimentMandantBanner` | `ui/components/layout` | Kopf | pure | 🎭 |
| `ReadinessBanner` | `modules/clients/ui` | Kopf | RSC |  |
| `EmbeddingCoverageBanner` | `modules/clients/ui` | Kopf | pure |  |

#### Wirtschaftsjahr

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `YearSwitcher` | `ui/components/layout` | Auswahl | pure+i | 🎭 |
| `CycleCreateForm` | `modules/cycles/ui` | Editor | lädt |  |
| `RememberClientYear`, `YEAR_MEMORY_COOKIE`, `YEAR_MEMORY_STORAGE` | `ui/components/layout` | Inline | pure+i |  |
| `CycleTimeline` | `modules/cycles/ui` | Liste | RSC |  |

#### Sachkonto / Personenkonto

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `AccountFilterForm` | `modules/accounts/ui` | Auswahl | pure+i |  |
| `KontoCombobox` | `ui/booking` | Auswahl | pure+i | 🎭 |
| `AccountClassBadge` | `modules/accounts/ui` | Badge | pure | 🎭 |
| `AccountLedgerDrawerProvider` | `ui/drawers` | Drawer | lädt |  |
| `AccountRef` | `ui/booking` | Inline | pure | 🎭 |
| `AccountsStats` | `modules/accounts/ui` | Kopf | RSC |  |
| `AccountsGroupedTable` | `modules/accounts/ui` | Liste | pure |  |
| `AccountsTab` | `modules/business-partners/ui/tabs` | Liste | pure |  |
| `AccountsTable`, `AccountsTableHeader`, `AccountsTableRow` | `modules/accounts/ui` | Zeile | pure |  |

#### Geschäftspartner

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `CreditorCombobox` | `modules/business-partners/ui` | Auswahl | pure+i |  |
| `MasterDataTab` | `modules/business-partners/ui/tabs` | Detail | pure |  |
| `TechnicalTab` | `modules/business-partners/ui/tabs` | Detail | pure |  |
| `AcceptCreditorForm` | `modules/business-partners/ui` | Editor | lädt |  |
| `PartnerTabsBar` | `modules/business-partners/ui` | Kopf | pure |  |
| `CreditorProposalsReview` | `modules/business-partners/ui` | Liste | lädt |  |
| `CasesTab` | `modules/business-partners/ui/tabs` | Liste | pure |  |
| `InvoicesTab` | `modules/business-partners/ui/tabs` | Liste | pure |  |

#### Zahlungskonto

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `PaymentAccountForm` | `modules/clients/ui` | Editor | lädt |  |
| `PaymentAccountIbanForm` | `modules/clients/ui` | Editor | lädt |  |
| `PaymentAccountIntegrationLink` | `modules/clients/ui` | Editor | lädt |  |
| `PaymentChannelActivitySection` | `modules/clients/ui/configuration` | Liste | lädt |  |

#### Beleg (Quelldokument)

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `SourceDocPipelineTab` | `modules/source-docs/ui` | Detail | RSC |  |
| `BelegDrawer` | `ui/drawers` | Drawer | lädt |  |
| `DocCompletionControl` | `modules/source-docs/ui` | Editor | lädt |  |
| `SourceDocActions` | `modules/source-docs/ui` | Editor | lädt |  |
| `SourceDocDateEditor` | `modules/source-docs/ui` | Editor | lädt |  |
| `DatevMetaImportPanel` | `modules/source-docs/ui` | Editor | lädt |  |
| `ClassificationEditor` | `modules/document-inbox/ui` | Editor | lädt |  |
| `InvoiceUploader` | `modules/files/ui` | Editor | lädt |  |
| `CaseDocumentUploaderModal` | `modules/accounting-cases/ui` | Editor | lädt |  |
| `CaseAttachDocumentButton` | `modules/accounting-cases/ui` | Editor | pure+i |  |
| `ChildDocsCard`, `ParentDocNotice` | `modules/source-docs/ui` | Inline | RSC |  |
| `SourceDocAutoRefresh` | `modules/source-docs/ui` | Inline | pure+i |  |
| `BelegSummary` | `ui/beleg` | Karte | pure | 🎭 |
| `SourceDocFactsCard` | `modules/source-docs/ui` | Karte | RSC |  |
| `DocTabsBar` | `modules/source-docs/ui` | Kopf | pure | 🎭 |
| `DocActionsMenu` | `modules/source-docs/ui` | Kopf | pure |  |
| `SourceDocVerlaufTab` | `modules/source-docs/ui` | Liste | RSC |  |
| `StuckDocumentsTable` | `modules/source-docs/ui` | Liste | RSC |  |
| `DocumentInbox` | `modules/document-inbox/ui` | Liste | lädt |  |
| `InboxInvoiceSubmissionList` | `modules/document-inbox/ui` | Liste | lädt |  |
| `BelegeTab` | `modules/accounting-cases/ui/tabs` | Liste | RSC |  |
| `BelegPreview` | `ui/beleg` | Vorschau | pure | 🎭 |

#### Rechnung (Subtyp)

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `InvoiceFilterForm` | `modules/invoices/ui` | Auswahl | pure |  |
| `InvoiceSidebar` | `modules/invoices/ui` | Detail | RSC |  |
| `PipelineTab` | `modules/invoices/ui/tabs` | Detail | RSC |  |
| `RohdatenTab` | `modules/invoices/ui/tabs` | Detail | RSC |  |
| `VorsteuerTab` | `modules/invoices/ui/tabs` | Detail | RSC |  |
| `ExtractionCorrectionCard` | `modules/invoices/ui` | Editor | lädt |  |
| `ConfirmReviewButton` | `modules/invoices/ui` | Editor | lädt |  |
| `ReprocessButton` | `modules/invoices/ui` | Editor | lädt |  |
| `ResetButton` | `modules/invoices/ui` | Editor | lädt |  |
| `PipelineStepper` | `modules/invoices/ui` | Inline | pure | 🎭 |
| `ProcessingProgress` | `modules/invoices/ui` | Inline | pure+i | 🎭 |
| `InvoiceShortcuts` | `modules/invoices/ui` | Inline | pure+i |  |
| `Confidence`, `ConfidenceBandLabel`, `Row` | `modules/invoices/ui` | Inline | pure | 🎭 |
| `GlanceCard` | `modules/invoices/ui` | Karte | pure+i |  |
| `InvoiceListNav` | `modules/invoices/ui` | Kopf | pure | 🎭 |
| `InvoiceListTabsBar` | `modules/invoices/ui` | Kopf | pure |  |
| `FindingsList` | `modules/invoices/ui` | Liste | pure+i | 🎭 |
| `VerlaufTab` | `modules/invoices/ui/tabs` | Liste | pure |  |
| `InvoiceLogsPanel` | `modules/invoices/ui/logs` | Liste | pure+i |  |
| `InvoiceTracesTable` | `modules/invoices/ui/logs` | Liste | pure | 🎭 |
| `ExtractionLogsTable` | `modules/invoices/ui/logs` | Liste | pure |  |

#### Rechnungsposition

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `PositionenTab` | `modules/invoices/ui/tabs` | Liste | pure+i |  |

#### Kontoauszugsposition

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `CaseIndicatorBadges` | `modules/bank-transactions/ui` | Badge | pure | 🎭 |
| `KontoauszugView` | `modules/bank-transactions/ui` | Detail | pure+i |  |
| `BankTransactionDetail` | `modules/bank-transactions/ui` | Detail | pure |  |
| `BankTransactionDrawer` | `ui/drawers` | Drawer | lädt |  |
| `PurposeDisplay` | `modules/bank-transactions/ui` | Inline | lädt |  |
| `ClarBubble`, `DATEV_MATCHED_STAGES`, `DatevMatchTick` | `modules/bank-transactions/ui` | Inline | pure | 🎭 |
| `BankTransactionAssignmentTable` | `modules/bank-transactions/ui` | Zeile | lädt |  |

#### Bank-Import

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `CsvImportWizard` | `modules/bank-transactions/ui` | Editor | lädt |  |
| `IntegrationSyncPanel` | `modules/bank-transactions/ui` | Editor | lädt |  |
| `ImportResultSummary` | `modules/bank-transactions/ui` | Karte | pure | 🎭 |

#### Sachverhalt

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `CaseListFilters` | `modules/accounting-cases/ui` | Auswahl | pure+i |  |
| `CaseOverviewBox` | `modules/accounting-cases/ui` | Detail | RSC |  |
| `CasePlausibilityTab` | `modules/accounting-cases/ui` | Detail | pure |  |
| `SachverhaltScreen` | `modules/accounting-cases/ui/sachverhalt` | Detail | lädt |  |
| `RohdatenTab` | `modules/accounting-cases/ui/tabs` | Detail | RSC |  |
| `CaseSummaryEditor` | `modules/accounting-cases/ui` | Editor | lädt |  |
| `CaseKindEditor` | `modules/accounting-cases/ui` | Editor | lädt |  |
| `CaseSummaryTooltip` | `modules/accounting-cases/ui` | Inline | pure+i | 🎭 |
| `ActionNotice`, `EventIcon`, `Hero` | `modules/accounting-cases/ui/sachverhalt` | Inline | pure+i |  |
| `CaseListTabsBar` | `modules/accounting-cases/ui` | Kopf | pure |  |
| `CaseTabsBar` | `modules/accounting-cases/ui` | Kopf | pure |  |
| `CloseCasesPanel` | `modules/accounting-cases/ui` | Liste | lädt |  |
| `HistorieTab` | `modules/accounting-cases/ui/tabs` | Liste | pure |  |
| `ZuordnungTab` | `modules/accounting-cases/ui/tabs` | Liste | pure |  |
| `PortalCaseList` | `modules/client-portal/ui` | Liste | lädt |  |
| `CaseCell` | `ui/case` | Zeile | pure | 🎭 |
| `CaseRow` | `modules/accounting-cases/ui` | Zeile | pure+i | 🎭 |

#### Ereignis

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `EventStack` | `modules/accounting-cases/ui` | Liste | RSC |  |

#### Buchungssatz

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `BookingStatusBadge` | `ui/booking` | Badge | pure | 🎭 |
| `JournalEntryView` | `ui/booking` | Detail | pure+i | 🎭 |
| `BookingProposalView`, `KIBox` | `ui/booking` | Detail | pure | 🎭 |
| `JournalEntryDetail` | `modules/accounting-cases/ui` | Detail | RSC |  |
| `DatevEntryDrawer`, `LudwigEntryDrawer`, `RawRowDrawer` | `ui/drawers` | Drawer | lädt |  |
| `ManualBookingDrawer` | `ui/booking` | Editor | pure+i | 🎭 |
| `BookingRationale` | `ui/booking` | Inline | pure+i | 🎭 |
| `RationaleSources` | `ui/booking` | Inline | pure | 🎭 |
| `ConfidenceBand`, `ConfidenceMeter` | `ui/booking` | Inline | pure | 🎭 |
| `ConfidenceDot` | `ui/booking` | Inline | pure | 🎭 |
| `BookingProposalCompact` | `ui/booking` | Karte | pure+i | 🎭 |
| `CreditorRecentBookingsCard` | `modules/invoices/ui` | Karte | pure | 🎭 |
| `BookingApproveBar` | `ui/booking` | Kopf | pure | 🎭 |

#### Buchungszeile

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `TaxKeySelect` | `ui/booking` | Auswahl | pure | 🎭 |
| `BookingLineRow` | `ui/booking` | Zeile | pure | 🎭 |

#### Klärung

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `RaiseClarificationForm` | `modules/accounting-cases/ui/sachverhalt` | Editor | lädt |  |
| `CaseCommentForm` | `modules/accounting-cases/ui` | Editor | lädt |  |
| `DocumentRequestMailPanel` | `modules/accounting-cases/ui` | Editor | lädt |  |
| `ClarificationsBanner` | `modules/accounting-cases/ui` | Liste | pure+i |  |

#### Entschiedene Belegnummer

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `CaseDocumentNumberModeEditor` | `modules/accounting-cases/ui` | Editor | lädt |  |
| `DecideDocumentNumberButton` | `modules/accounting-cases/ui` | Editor | lädt |  |

#### Wiederkehr-Regel

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `RegelwerkTab` | `modules/accounting-cases/ui/tabs` | Detail | pure |  |
| `RuleEditorForm` | `modules/recurring-rules/ui` | Editor | lädt |  |
| `MatchingNoteForm` | `modules/recurring-rules/ui` | Editor | lädt |  |

#### Vertrag (Subtyp)

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `ContractDetail` | `modules/contracts/ui` | Detail | lädt |  |
| `ContractFinalizeButton` | `modules/contracts/ui` | Editor | lädt |  |

#### DATEV-Spiegelbuchung

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `DatevEntryDetail` | `modules/datev-truth/ui` | Detail | RSC |  |
| `CaseDatevTruthTab` | `modules/datev-truth/ui` | Detail | RSC |  |
| `CopyTextButton` | `modules/datev-truth/ui` | Inline | pure+i |  |
| `ReplayVergleich`, `StapelVergleich` | `modules/datev-truth/ui` | Liste | RSC |  |

#### DATEV-Export-Stapel

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `DatevExportSection` | `modules/datev-export/ui` | Detail | lädt |  |
| `ExportBatchDetailSection` | `modules/datev-export/ui` | Detail | lädt |  |
| `DatevExportWizard` | `modules/datev-export/ui` | Editor | lädt |  |
| `ExportBatchDownloadButton` | `modules/datev-export/ui` | Inline | lädt |  |
| `DatevExportTabs` | `modules/datev-export/ui` | Kopf | pure+i |  |
| `OpenExportOverview` | `modules/datev-export/ui` | Liste | pure+i |  |
| `ExportBatchRowActions` | `modules/datev-export/ui` | Zeile | lädt |  |

#### Buchungslauf

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `ProcessingPanel` | `modules/closing/ui` | Detail | lädt |  |
| `StepNav` | `modules/closing/ui` | Kopf | pure |  |

#### Konvention

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `ClientAgentNotesPanel` | `modules/accounting-cases/ui` | Liste | lädt |  |

#### Kanzlei

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `TenantCreateForm` | `modules/admin/ui` | Editor | lädt |  |
| `IntegrationCreateForm` | `modules/external-integrations/ui` | Editor | lädt |  |
| `IntegrationEditForm` | `modules/external-integrations/ui` | Editor | lädt |  |
| `IntegrationDeleteButton` | `modules/external-integrations/ui` | Editor | lädt |  |
| `NotificationSubscriptionsPanel` | `modules/clients/ui` | Editor | lädt |  |
| `BridgeHealthStatus` | `modules/bridge/ui` | Zeile | pure | 🎭 |

#### Nutzer / Mitgliedschaft

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `RoleBadge` | `ui/components/layout` | Badge | pure | 🎭 |
| `InviteUserForm` | `modules/admin/ui` | Editor | lädt |  |
| `UserEditForm` | `modules/admin/ui` | Editor | lädt |  |
| `SignInForm` | `modules/auth/ui` | Editor | lädt |  |
| `DevQuickLogin` | `modules/auth/ui` | Editor | pure |  |
| `WelcomeCard` | `modules/auth/ui` | Karte | lädt |  |
| `UserMenu` | `ui/components/layout` | Kopf | lädt |  |
| `AgentTokenManager` | `modules/admin/ui` | Liste | lädt |  |

#### Audit-Ereignis

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `AuditLogTable` | `modules/audit-log/ui` | Zeile | pure+i | 🎭 |
| `FeedbackRowActions` | `app/(app)/admin/product-feedback` | Zeile | lädt |  |

#### Job

| Komponente | Ort | Form | Reinheit | Story |
|---|---|---|---|---|
| `TaskDetail` | `ui/components` | Drawer | pure+i | 🎭 |
| `JobStatusMonitor` | `modules/document-inbox/ui` | Inline | pure+i |  |
| `ResetRunButton` | `app/(app)/clients/[clientSlug]/[year]/agent-runs` | Inline | lädt |  |



---

## 2. Bewertung: Zweck, Redundanz, Vereinheitlichung (T111.3)

Bewertet wird nach einem Kriterium: **gleiche Entität, gleiche
Darstellungsform, unterschiedliche Komponente ohne fachlichen Grund.**
Verschiedene Zielgruppen (Kanzlei vs. Mandantenportal) oder verschiedene
Fachbegriffe (SKR-Klasse vs. Kontotyp) sind ein Grund und bleiben getrennt.

### B1 — Die geteilte Schicht hängt am Server-Graphen (Schwere: hoch)

`@/ui/*` soll frei wiederverwendbar sein. Drei Komponenten darin rufen aber
Server Actions auf und ziehen damit über die Barrels ganze Feature-Module in
jeden Konsumenten:

| Komponente | zieht | über |
|---|---|---|
| `ui/status/FlowModal` | `@/modules/invoices` | `@/ui/status` (Barrel) |
| `ui/components/layout/AppShell` | `@/modules/auth` | `@/ui/components` (Barrel) |
| `ui/components/layout/UserMenu` | `@/modules/auth` | `@/ui/components` (Barrel) |

Praktische Folge: `ui/booking/format.ts` importiert `resolveStatus` aus
`@/ui/status` — und erbt damit Drizzle und `postgres`. **28 von 41** Story-
Dateien liefen zu Beginn über diesen Pfad und scheiterten im Browser an
`Buffer is not defined`. In Next.js fällt das nicht auf, weil der Compiler
`"use server"`-Module im Client-Bundle durch RPC-Stubs ersetzt; jeder andere
Bundler zieht den Rumpf mit.

Der Repo-Wächter `check:boundaries` prüft die andere Richtung (server-only in
Client-Barrels), nicht diese. In `ui/components/log/LogEntry.tsx` steht die
Regel bereits als Kommentar — sie ist nur nicht durchgesetzt.

*Vorläufig gelöst* über `.storybook/server-actions-stub.ts`: ein Vite-Plugin,
das dieselbe Grenze zieht wie Next (Export-Namen bleiben, der Aufruf wirft).
Das ist ein Pflaster für die Werkbank, kein Fix der Struktur — siehe §4.2.

### B2 — Drei Komponenten-Galerien nebeneinander (Schwere: mittel)

| Ort | Umfang | Zugang |
|---|---|---|
| `app/dev/gallery/page.tsx` | Primitives, Status, Buchung, Beleg, Sachverhalt, Drawer | dev-only |
| `app/(app)/settings/components/page.tsx` | 519 Zeilen, dieselben Primitives + Quell-Snippets | **in der App**, für jeden Nutzer |
| Storybook (neu) | 207 Stories über 64 Dateien | `pnpm storybook` |

`/settings/components` und `/dev/gallery` zeigen überlappend dieselben
Bausteine, gepflegt an zwei Stellen von Hand. Empfehlung in §4.3.

### B3 — Tab-Leisten: eine Regel, acht Umsetzungen (Schwere: mittel)

`web-ui.md` R9 schreibt die `TabBar`-Primitive vor. Gehalten wird sie von
**einer** der acht Leisten:

| Komponente | Zeilen | nutzt `TabBar` |
|---|---:|---|
| `business-partners/ui/PartnerTabsBar` | 35 | **ja** |
| `accounting-cases/ui/CaseTabsBar` | 59 | nein |
| `datev-export/ui/DatevExportTabs` | 60 | nein |
| `app/(app)/clients/[clientSlug]/configuration/TabBar` | 53 | nein |
| `accounting-cases/ui/CaseListTabsBar` | 82 | nein |
| `invoices/ui/InvoiceListTabsBar` | 82 | nein |
| `closing/ui/StepNav` | 84 | nein |
| `source-docs/ui/DocTabsBar` | 93 | nein |

Zusammen ~413 Zeilen für dieselbe Sache. `SvTabsBar` in
`sachverhalt/parts.tsx` ist die neunte. Die Wrapper haben jeweils **einen**
echten Grund (Query-Parameter mitschleppen, Zähler, Step-Zustand) — das gehört
als Prop in die Primitive, nicht in acht Kopien.

### B4 — Rechnung trägt fast so viel UI wie „Beleg" (Schwere: mittel)

| Entität | Komponenten |
|---|---:|
| Beleg (Supertyp) | 22 |
| Rechnung (Subtyp) | 21 |
| alle anderen Belegarten zusammen | 2 (`ContractDetail`, `ContractFinalizeButton`) |

Das spiegelt Befund K1 des Datenmodell-Reviews auf der UI-Seite: eine
Tankquittung, ein Kassenbon oder ein Bewirtungsbeleg hat **keine** eigene
Kompakt- oder Detailansicht — sie laufen durch `SourceDocFactsCard`, während
alles Ausgearbeitete (`GlanceCard`, `InvoiceSidebar`, `PositionenTab`,
`VorsteuerTab`, `FindingsList`) rechnungsspezifisch ist. Die im Code angelegte
Renderer-Registry (`source-doc-type.ts`, „Keim einer Renderer-Registry") ist
weiterhin leer.

### B5 — Log-Ansichten: die Regel greift zur Hälfte (Schwere: niedrig)

`web-ui.md` R7 verlangt eine geteilte Log-Darstellung. `LogTable`/`LogView`
existieren und werden benutzt — aber `AuditLogTable` (122 Zeilen, eigener
Expand-State), `InvoiceTracesTable` und `ExtractionLogsTable` bringen jeweils
eigene Spaltendefinitionen mit. Zwei davon (`InvoiceTracesTable`,
`ExtractionLogsTable`) nutzen immerhin `LogColumn`/`LogTable` — `AuditLogTable`
nicht. Kein dringender Fall, aber der einzige verbliebene Sonderweg.

### B6 — Was **nicht** zusammengelegt werden sollte

- `PortalCaseList` (Mandantensicht) vs. `CloseCasesPanel`/Case-Liste
  (Kanzleisicht): verschiedene Zielgruppen, verschiedene Sprache, verschiedene
  Aktionen. Ein erzwungenes gemeinsames `CaseSummary` wäre DRY-zu-früh.
- `AccountClassBadge` (SKR-Klasse) vs. `StatusBadge axis="konto_typ"`
  (Buchungsrolle): zwei Achsen, kein Duplikat. Bereits 2026 geprüft, gilt weiter.
- `DatevEntryDetail` vs. `JournalEntryDetail`: „was DATEV kennt" und „was
  Ludwig gebucht hat" sind zwei Aussagen (web-ui.md R8). Bleibt getrennt.
- `BelegSummary` vs. `GlanceCard`: der generische Teil ist bereits
  herausgezogen; der Rest ist echt rechnungsspezifisch (FX, USt-IdNr.,
  DATEV-Konto).

---

## 3. Design-Bedarf (T111.4)

### 3.1 Vier Entitäten ohne jede eigene Darstellung

Diese vier stehen in §7 als **mittel** eingestuft, haben aber im ganzen Repo
keine Komponente — sie werden, wo überhaupt, direkt in einer Page gerendert:

| Entität | Tabelle | Ist-Zustand | gebraucht in |
|---|---|---|---|
| **Erwartung** | `client_accounting_case_expectation` | Abnahme-Schritt 1 (fehlende Belege, eingebettetes `DocumentRequestMailPanel`) und Schritt 2 (Rückfragen) | erledigt mit F118 |
| **Ausgleichs-Zuordnung** | `client_open_item_links` | inline in `cases/[caseId]/page.tsx` und `opos/page.tsx`; Abnahme-Schritt 4 zeigt die offenen Gegenstände | teilweise erledigt (F118) |
| **DATEV-Offene-Posten** | `client_datev_open_items` | `opos/page.tsx` und Abnahme-Schritt 5 (gruppiert nach Fälligkeit) | erledigt mit F118 |
| **DATEV-Snapshot** | `client_datev_snapshots` | inline in `datev/page.tsx` und `reporting/page.tsx` | Mengengerüst nach Stückzahlen offen (`web-ui-offen.md` P21) |

Das ist kein Zufall: es sind genau die Entitäten, die der Buchungsreview
(F109) braucht und die es vor dem Review nicht gab. Die Briefs setzen für
OPOS eine dichte Tabelle mit Alters-Gruppierung und Dubletten-Banner voraus,
für die Vollständigkeit einen Monatsvergleich gegen die DATEV-Historie — beides
existiert heute als Page-Code, nicht als Komponente.

### 3.2 Priorisierte Lücken

Reihenfolge nach „wo wird es zuerst gebraucht":

1. **OPOS-Posten-Zeile + Alters-Gruppierung** — Abnahme-Schritt 5 ist ein eigener
   Review-Schritt; die Page-Variante trägt die Darstellung heute allein.
2. **Erwartung als Chip/Zeile mit Frist** — ohne sie hat „etwas fehlt" keine
   sichtbare Form; die Statusachse `erwartung` existiert in der Registry
   bereits, die Darstellung fehlt.
3. **Ausgleichs-Zuordnung (Rechnung ↔ Zahlung)** — Abnahme-Schritt 4; heute nur als
   abgeleiteter Text im Sachverhalt.
4. **Belegart-Renderer** (B4) — Tankquittung, Bewirtung, Kassenbon brauchen
   je eine Kompaktansicht, sonst bleibt jede neue Belegart ein UI-Sonderpfad.
5. **Snapshot-Kopf** (Datum, WJ, Umfang, Reconciliation-Ergebnis) — als Karte
   wiederverwendbar in Abnahme-Schritt 1 und auf der DATEV-Seite.

Nicht als Design-Bedarf gezählt: Formulare (Editor-Variante). Sie sind gebaut
und funktionieren; ihre Gestaltung ist eine Frage für den jeweiligen Screen,
nicht für die Entitäts-Familie.

---

## 4. Zielstruktur (T111.5)

### 4.1 Ort: geteilt unter `src/ui/<entität>/`, nicht im Modul

Der Bestand hat die Frage schon beantwortet. `ui/status`, `ui/booking`,
`ui/beleg`, `ui/case` und (seit F113) `ui/drawers` existieren und werden
modulübergreifend benutzt; die Alternative — Darstellung im besitzenden Modul
— erzeugt genau die Cross-Modul-Importe, die `architektur-offen.md` P9 als
Zyklen-Risiko führt. Beispiel aus dem Bestand: `CaseCell` musste aus den
Primitives nach `ui/case` wandern, weil Belege, Bank und Sachverhalt sie alle
brauchen.

**Regel:** Zeigt eine Komponente eine Entität und wird sie von mehr als einem
Modul gebraucht, gehört sie in die geteilte Schicht. Modul-`ui/` behält
Screen-Kompositionen (Tabs, Filter, Formulare, Wizards).

**Ort für die Dauer der v2-Migration (F128, `web-ui.md` R21):**
`src/ui/v2/entities/<entität>/` — dort steht die Stufe im Pfad und der
Wächter-Test hält die Import-Richtung. `src/ui/<entität>/` (Bestand: `ui/case`,
`ui/beleg`, `ui/booking`) bleibt der v1-Ort und stirbt mit der Migration; ist
v1 leer, wird `ui/v2` in einem mechanischen Commit zu `ui`.

### 4.2 Die Hülle lädt, der Kern ist rein

Das ist die Antwort auf B1 und zugleich die Auflösung des scheinbaren
Widerspruchs zwischen F111 („rein visuell") und F113 („Drawer holen selbst"):

```
<BelegDrawer sourceDocId="…" />      ← Hülle: lädt, fängt Fehler, öffnet den Rahmen
   └── <BelegSummary facts={…} />    ← Kern: Props rein, JSX raus, hat eine Story
```

Für die drei Verletzer aus B1 heißt das konkret:

| Komponente | Vorschlag | Aufwand |
|---|---|---|
| `ui/status/FlowModal` | Snapshot per Prop/Loader-Callback statt direktem Action-Import; `EntityStatusBadgeButton` reicht ihn durch | **S** |
| `ui/components/layout/UserMenu` | `signOut` als Prop vom Layout (das kennt die Session ohnehin) | **S** |
| `ui/components/layout/AppShell` | dito, oder `UserMenu` als Slot statt als Import | **S** |

Danach ist `@/ui` frei von Feature-Modulen, das Storybook-Pflaster
(`server-actions-stub.ts`) wird zum reinen Sicherheitsnetz, und ein
Wächter-Test kann die Kante verbieten — analog zum bestehenden
`check:boundaries`.

### 4.3 Eine Werkbank, eine Schaufensterseite

Nach B2 stehen drei Galerien nebeneinander. Vorschlag:

- **Storybook** wird die Werkbank für alles Reine — Zustände, Varianten,
  Controls. Dort gehört jede `pure`/`pure+i`-Komponente hin.
- **`/dev/gallery`** behält, was Storybook nicht kann: die **ladenden** Hüllen
  (`ui/drawers`) mit echtem Server-Roundtrip. Der Rest (Primitives, Chips)
  kann entfallen, sobald die Storys stehen.
- **`/settings/components`** (519 Zeilen, in der App für jeden Nutzer
  erreichbar) hat nach dieser Aufteilung keine eigene Aufgabe mehr →
  **Rückbau vorschlagen**, nicht selbst ausführen (Owner-Entscheid).

### 4.4 Familie je Entität

Nicht jede Entität braucht den vollen Satz. Der Standardsatz und wer ihn
tatsächlich braucht:

Die Familie hat **zwei Achsen**: wie viel gezeigt wird (Größe) und wo es
erscheint (Präsentation). Die Größen sind S · M · XL; die Präsentation ist
normalerweise „im Fluss der Seite" und als zweite Möglichkeit der **Drawer**.

| Variante | Größe | Zweck | braucht |
|---|---|---|---|
| `<Entity>Cell` | S | Zelle in fremder Liste | Sachverhalt, Konto, Beleg, Partner |
| `<Entity>Row` | M | eigene Listenzeile | alle Listen-Entitäten |
| `<Entity>Card` | M | Kompakt, im Kontext einer anderen Entität | Beleg, Buchung, OPOS-Posten |
| `<Entity>View` | XL | volle read-only Darstellung | Buchungssatz, Sachverhalt, Beleg, Vertrag |
| `<Entity>Drawer` | — | **Präsentation**, keine Größe: der Schnellblick im Slide-over, holt sich seine Daten selbst | jede Entität, nach der man mitten in einer anderen Arbeit fragt |
| `<Entity>Picker` | — | Auswahl | Konto, Kreditor, Steuerschlüssel |
| Status-Chip | — | Zustand | **immer** über `StatusBadge` + Registry, nie lokal |

**Wann ein Drawer sinnvoll ist:** wenn die Frage nach einer Entität mitten in
der Arbeit an einer anderen auftaucht („wie sah der Beleg noch mal aus?") und
die Antwort ohne Seitenwechsel passt — der Kontext dahinter bleibt sichtbar.
Er ist keine vierte Größe, sondern eine **Hülle um XL-Inhalt**: er lädt, fängt
Fehler, öffnet den Rahmen und zeigt darin die Kern-Fakten aus derselben
Komponente wie die Vollansicht — plus genau einen Ausgang dorthin. Name,
Aufbau und die vier Zustände: `web-ui.md` R15 (Muster `BelegDrawer`, F113).

### 4.5 Vorschlag für neue R-Regeln in `docs/topics/web-ui.md`

Zur Abnahme vorgelegt, **nicht** selbst eingetragen (F111 Nicht-Scope):

- **R15 — `@/ui` importiert kein Feature-Modul.** Die geteilte
  Repräsentationsschicht kennt Domain-**Typen**, aber keine Server Actions und
  keine Modul-Barrels. Wer laden muss, bekommt einen Loader als Prop.
  Durchsetzung: Test analog `check:boundaries`. (Begründung: B1)
- **R16 — Tab-Leisten ausschließlich über die `TabBar`-Primitive.** Bedarf
  eines Wrappers (Query-Parameter, Zähler, Step-Zustand) wird zum Prop der
  Primitive, nicht zu einer neunten Kopie. Verschärft R9, das faktisch
  siebenmal gebrochen ist. (Begründung: B3)
- **R17 — Eine Komponente pro (Entität × Darstellungsform),** benannt nach
  §4.4 und abgelegt nach §4.1. Zwei Komponenten derselben Form für dieselbe
  Entität brauchen einen dokumentierten fachlichen Grund (Zielgruppe, Achse) —
  siehe die legitimen Fälle in B6.

---

## 5. Storybook (T111.2)

### 5.1 Aufbau

- **`@storybook/nextjs-vite` 10.5** (Vite-Builder) — deckt Next 16 + React 19
  ab. Start: `pnpm --filter @ludwig/web storybook` (Port 6106),
  `storybook:build` für den statischen Bau.
- **`.storybook/preview.ts`** lädt `src/app/globals.css` — dieselbe Kette wie
  das Root-Layout (Tokens → App-Chrome → Komponenten → Domänen-Styles →
  Tailwind). Ohne sie sähe hier nichts aus wie in der App.
- **`.storybook/preview-head.html`** zieht Inter, Source Serif 4 und JetBrains
  Mono (in der App via `next/font/google`).
- **`.storybook/server-actions-stub.ts`** zieht die Server-Action-Grenze, die
  Next im Client-Bundle zieht — siehe B1. Ohne sie startet über die Hälfte der
  Stories nicht.
- Telemetrie ist aus (`core.disableTelemetry`), `storybook-static/` ist
  gitignoriert. Storybook läuft **nicht** im CI (Owner: Werkzeug, kein Gate).

**Stand:** 64 Story-Dateien, **207 Stories**, 61 Komponenten-Einträge in
11 Gruppen (Primitives 68 · Buchung 53 · Beleg 22 · Layout 17 · Status 13 ·
Kontoauszug 10 · Log 8 · Sachverhalt 7 · Kanzlei 5 · Konto 2 · Audit 2).

**Zustände aus der Quelle, nicht aus dem Kopf.** `StatusBadge/AlleAchsen`
iteriert über `STATUS_REGISTRY` und zeigt damit **jede** Achse mit **jeder**
Ausprägung; `AccountClassBadge/AlleKlassen` liest `ACCOUNT_CLASSES`. Eine neue
Achse oder Klasse steht beim nächsten Öffnen von selbst drin — eine
handgepflegte Liste wäre am Tag ihrer Erstellung veraltet.

**Geprüft:** `typecheck` und `storybook:build` grün; im Browser stichprobenartig
`JournalEntryView/Vorschlag`, `StatusBadge/Kernachsen`,
`ManualBookingDrawer/MitSteuerassistenz` und `Button/Primary` — alle rendern im
Ludwig-Theme, ohne Konsolenfehler.

### 5.2 Was (noch) keine Story hat

pure/pure+i gesamt: 122 · mit Story: 64 · ohne: 58

**Offen (34)** — echte Darstellungen, die eine Story verdienen:

- `app/(app)/clients/[clientSlug]/configuration/TabBar.tsx` · pure, 54 Z.
- `modules/accounting-cases/ui/CaseListFilters.tsx` · pure interaktiv, 172 Z.
- `modules/accounting-cases/ui/CaseListTabsBar.tsx` · pure, 83 Z.
- `modules/accounting-cases/ui/CasePlausibilityTab.tsx` · pure, 200 Z.
- `modules/accounting-cases/ui/CaseTabsBar.tsx` · pure, 60 Z.
- `modules/accounting-cases/ui/ClarificationsBanner.tsx` · pure interaktiv, 250 Z.
- `modules/accounting-cases/ui/sachverhalt/parts.tsx` · pure interaktiv, 444 Z.
- `modules/accounting-cases/ui/tabs/HistorieTab.tsx` · pure, 116 Z.
- `modules/accounting-cases/ui/tabs/RegelwerkTab.tsx` · pure, 365 Z.
- `modules/accounting-cases/ui/tabs/ZuordnungTab.tsx` · pure, 194 Z.
- `modules/accounts/ui/AccountFilterForm.tsx` · pure interaktiv, 333 Z.
- `modules/accounts/ui/AccountsGroupedTable.tsx` · pure, 124 Z.
- `modules/accounts/ui/AccountsTable.tsx` · pure, 204 Z.
- `modules/bank-transactions/ui/BankTransactionDetail.tsx` · pure, 151 Z.
- `modules/bank-transactions/ui/KontoauszugView.tsx` · pure interaktiv, 632 Z.
- `modules/business-partners/ui/CreditorCombobox.tsx` · pure interaktiv, 93 Z.
- `modules/business-partners/ui/PartnerTabsBar.tsx` · pure, 36 Z.
- `modules/business-partners/ui/tabs/AccountsTab.tsx` · pure, 92 Z.
- `modules/business-partners/ui/tabs/CasesTab.tsx` · pure, 99 Z.
- `modules/business-partners/ui/tabs/InvoicesTab.tsx` · pure, 108 Z.
- `modules/business-partners/ui/tabs/MasterDataTab.tsx` · pure, 113 Z.
- `modules/business-partners/ui/tabs/TechnicalTab.tsx` · pure, 124 Z.
- `modules/clients/ui/EmbeddingCoverageBanner.tsx` · pure, 101 Z.
- `modules/closing/ui/StepNav.tsx` · pure, 85 Z.
- `modules/datev-export/ui/DatevExportTabs.tsx` · pure interaktiv, 61 Z.
- `modules/datev-export/ui/OpenExportOverview.tsx` · pure interaktiv, 115 Z.
- `modules/invoices/ui/GlanceCard.tsx` · pure interaktiv, 275 Z.
- `modules/invoices/ui/InvoiceFilterForm.tsx` · pure, 115 Z.
- `modules/invoices/ui/InvoiceListTabsBar.tsx` · pure, 83 Z.
- `modules/invoices/ui/logs/ExtractionLogsTable.tsx` · pure, 126 Z.
- `modules/invoices/ui/logs/InvoiceLogsPanel.tsx` · pure interaktiv, 222 Z.
- `modules/invoices/ui/tabs/PositionenTab.tsx` · pure interaktiv, 770 Z.
- `modules/invoices/ui/tabs/VerlaufTab.tsx` · pure, 176 Z.
- `modules/source-docs/ui/DocActionsMenu.tsx` · pure, 54 Z.

**Bewusst ohne Story (24)** — Context-Provider, Auto-Refresh-Helfer,
Fehlerseiten, App-Chrome, Demo-Komponenten: sie zeigen keine Entität,
eine Story wäre Pflege ohne Erkenntnis.

- `app/(app)/admin/AdminNav.tsx`
- `app/(app)/clients/[clientSlug]/not-found.tsx`
- `app/dev/gallery/BookingDemo.tsx`
- `app/dev/gallery/DrawerDemo.tsx`
- `app/error.tsx`
- `app/forbidden.tsx`
- `app/global-error.tsx`
- `app/not-found.tsx`
- `modules/accounting-cases/ui/CaseAttachDocumentButton.tsx`
- `modules/admin/ui/SubmitButton.tsx`
- `modules/auth/ui/DevQuickLogin.tsx`
- `modules/clients/ui/configuration/helpers.tsx`
- `modules/datev-truth/ui/CopyTextButton.tsx`
- `modules/document-inbox/ui/JobStatusMonitor.tsx`
- `modules/invoices/ui/InvoiceShortcuts.tsx`
- `modules/source-docs/ui/SourceDocAutoRefresh.tsx`
- `ui/booking/account-drawer-context.tsx`
- `ui/components/ClientScope.tsx`
- `ui/components/layout/AppShell.tsx`
- `ui/components/layout/RememberClientYear.tsx`
- `ui/components/layout/Sidebar.tsx`
- `ui/components/log/LogPayloadCell.tsx`
- `ui/components/primitives/UrlDrawer.tsx`
- `ui/status/EntityStatusBadgeButton.tsx`

Die 22 `RSC`- und 75 `lädt`-Komponenten bekommen **grundsätzlich** keine Story
(F111 Vorgabe 1). Für sie ist `/dev/gallery` zuständig — dort laufen sie mit
echtem Server-Roundtrip. Was von ihnen herausgezogen werden müsste, um
gestaltbar zu werden, steht in §4.2.

---

## 6. Was dieses Dokument **nicht** getan hat

Nach F111 Vorgabe 3 wurde bewertet, nicht umgebaut. Nicht ausgeführt und
bewusst offen:

- Der Rückbau der drei `@/ui`→Modul-Kanten (B1, §4.2) — der Storybook-Stub
  ist ein Pflaster, kein Fix.
- Die Vereinheitlichung der acht Tab-Leisten (B3).
- Der Rückbau von `/settings/components` (B2) — Owner-Entscheid.
- Die neuen R-Regeln in `web-ui.md` (§4.5) — zur Abnahme vorgelegt.
- Design-Briefs für die fünf Lücken aus §3.2 — eigenständige `.md`, Userflow
  vor Brief.

_Bei Änderungen an der geteilten Schicht dieses Inventar mitziehen; die
Story-Abdeckung zählt `find src -name "*.stories.tsx"`, die Reinheitsgrade
lassen sich mit dem Scan aus §0 reproduzieren._
