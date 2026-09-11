/**
 * `@/ui/v3` — the component set of the design system.
 *
 * Nothing here knows a domain module: data and loaders come in as props, no
 * server actions. Three tiers, imports only downward (R21): `primitives/` (no
 * domain word), `patterns/` (workspace patterns, know process terms),
 * `entities/<entity>/` (the forms of exactly one entity).
 *
 * The group comments below are also the Storybook folders
 * (`v3/<tier>/<group>/<Name>`). One file per family; every export carries
 * `@when`/`@instead`. Tokens live in `src/styles/tokens.css`, classes in
 * `src/styles/v3.css` — no hex value, no pixel size in a component (A5).
 *
 * `StatusBadge` and `StatusHeader` are patterns here (R1, Z4): what the barrel
 * does not export does not exist for a consumer.
 */

/* ── Primitives ── Aktion */
export {
  Button,
  KeyButton,
  type ButtonProps,
  type ButtonLinkProps,
  type ButtonSize,
  type ButtonVariant,
} from "./primitives/Button";
export {
  TextButton,
  type TextButtonProps,
  type TextButtonLinkProps,
  type TextButtonTone,
} from "./primitives/TextButton";
export {
  IconButton,
  type IconButtonProps,
  type IconButtonLinkProps,
  type IconButtonSize,
  type IconButtonTone,
} from "./primitives/IconButton";
export {
  ActionButton,
  type ActionResult,
  type AskSpec,
  type ConfirmSpec,
} from "./primitives/ActionButton";
export { CopyTextButton } from "./primitives/CopyTextButton";
export { Sparkline } from "./primitives/Sparkline";
export {
  OverflowMenu,
  MenuItem,
  type MenuItemTone,
} from "./primitives/OverflowMenu";
export { ActionBar, RowActions } from "./primitives/ActionBar";
export { Kbd } from "./primitives/Kbd";

/* Rahmen — the shell, outside the tiers (target catalogue §11.7) */
export { AppShell, TopBar } from "./primitives/AppShell";

/* Navigation */
export {
  Tabs,
  Segmented,
  FilterChips,
  SearchInput,
  PageSizeSelect,
  type ChipOption,
  type SegmentOption,
  type TabItem,
} from "./primitives/Nav";
export { FilterBar } from "./primitives/FilterBar";
export {
  NavList,
  activeHref,
  type NavItem,
  type NavSection,
} from "./primitives/NavList";

export { Pagination } from "./primitives/Pagination";
export { RecordPager } from "./primitives/RecordPager";

/* Formular */
export { Field, Input, InputGroup, Textarea, Select, Checkbox } from "./primitives/Form";
export { RadioGroup, type RadioOption } from "./primitives/RadioGroup";
export { AmountInput, parseAmount, type ParsedAmount } from "./primitives/AmountInput";
export { InlineEdit, type InlineEditInputProps } from "./primitives/InlineEdit";
export { Combobox, type ComboboxOption } from "./primitives/Combobox";
export { DateField, DateRangeField, type DatePreset } from "./primitives/DateField";
export { FileDrop, type DroppedFile } from "./primitives/FileDrop";

/* Dialog */
export { Dialog } from "./primitives/Dialog";
export { Drawer, DrawerFooter, type DrawerProps, type DrawerSize } from "./primitives/Drawer";
export { Popover, Tooltip, HoverCard } from "./primitives/Popover";
export { ReasonDialog } from "./primitives/ReasonDialog";

/* Fläche */
export { KpiTile, KpiGrid } from "./primitives/KpiTile";
export { FieldList } from "./primitives/FieldList";
export { ProseCard } from "./primitives/ProseCard";
export { StatusCallout } from "./primitives/StatusCallout";
export { Badge, type BadgeTone, type BadgeProps } from "./primitives/Badge";
export { EmptyState, type EmptyStateProps } from "./primitives/EmptyState";
export { Callout } from "./primitives/Callout";
export { Banner, type BannerTone } from "./primitives/Banner";
export { Disclosure, type DisclosureTone } from "./primitives/Disclosure";
export { PageHeader } from "./primitives/PageHeader";
export { ToastHost, useToast, type Toast, type ToastTone } from "./primitives/Toast";
export { Skeleton, type SkeletonVariant } from "./primitives/Skeleton";
export { Markdown, parseInline, parseMarkdown } from "./primitives/Markdown";

/* Werte — an amount, a point in time, a rule (P24) */
export { Amount, type AmountProps, type AmountSize } from "./primitives/Amount";
export { Time, Duration, type TimeSize } from "./primitives/Time";
export { LongText } from "./primitives/LongText";
export {
  formatAmount,
  formatTime,
  formatTimeFull,
  formatDuration,
  formatBytes,
  formatCount,
  daysBetween,
  calendarDay,
  type TimeFormat,
  type TimeLength,
} from "./format";

/* Daten — series and trends (0041, 0045) */
export { BarChart, type Bar, type BarLayout } from "./primitives/BarChart";
export { Progress } from "./primitives/Progress";

/* Tabelle */
export {
  Card,
  CardHead,
  CardFoot,
  Table,
  HeadRow,
  Row,
  GroupRow,
  EmptyRow,
  type TableDensity,
} from "./primitives/Table";
export {
  AmountCell,
  DotStatus,
  Timestamp,
  DeviationCell,
  TableLoading,
  ErrorRow,
  MonoCell,
  type CellTone,
} from "./primitives/Cells";
export { RawRecord, RawValue, type RawFormat } from "./primitives/RawRecord";
export { ClickRow, ExpandableRow } from "./primitives/ExpandableRow";
export {
  SelectionBar,
  SelectCell,
  SelectionScope,
  SelectAllCell,
  SelectRowCell,
  SelectionScopeBar,
  useSelection,
  bulkAction,
  type AnyBulkAction,
  type BulkAction,
  type SelectionApi,
} from "./primitives/Selection";

/* ── Patterns ── Arbeitsfläche */
export {
  DataTable,
  columnsMinWidth,
  rowAction,
  type AnyRowAction,
  type ColumnDef,
  type DataTableProps,
  type ListPatch,
  type RowAction,
} from "./patterns/DataTable";
export {
  MasterDetail,
  ListPane,
  DetailPane,
  type ListGroup,
  type ListItem,
} from "./patterns/MasterDetail";
export { DetailView } from "./patterns/DetailView";
export { OpenPoints, type OpenPoint } from "./patterns/OpenPoints";
export { NoteFeed, type Note } from "./patterns/NoteFeed";
export {
  Columns,
  type ColumnPattern,
  type ColumnWidth,
} from "./patterns/Columns";
export {
  TodoList,
  isOpen,
  nextOpen,
  type TodoGroup,
  type TodoItem,
} from "./patterns/TodoList";

/* Rahmen */
export { EntityHeader } from "./patterns/EntityHeader";
export {
  StepRail,
  StepHeader,
  ProgressBar,
  type RailItem,
  type RailTone,
} from "./patterns/StepRail";
export {
  Wizard,
  type WizardProps,
  type WizardStep,
  type WizardStepState,
} from "./patterns/Wizard";
export { useHotkeys, HotkeyLegend, type HotkeyBinding } from "./patterns/Hotkeys";
export {
  CommandPalette,
  type CommandGroup,
  type CommandItem,
} from "./patterns/CommandPalette";

/* Grundlagen — the vocabulary every building block shares (0087) */
export {
  EntityIcon,
  ActionIcon,
  ENTITY_ICON,
  ACTION_ICON,
  type EntityKey,
  type ActionKey,
  type IconEntry,
  type IconSize,
} from "./Icons";

/* Prüfen */
export {
  StateIcon,
  stateLabel,
  Checklist,
  CheckItems,
  Messages,
  type ChecklistRow,
  type Message,
  type CheckItem,
  type StateKind,
} from "./patterns/Review";
export { ComparisonTable, type ComparisonRow } from "./patterns/ComparisonTable";
export {
  ReconciliationTable,
  type PairKind,
  type ReconciliationPair,
} from "./patterns/ReconciliationTable";
export { PeriodGrid, type PeriodCell, type PeriodColumn, type PeriodRow } from "./patterns/PeriodGrid";
export {
  ProvenanceMark,
  ProvenanceNote,
  type Provenance,
  type ProvenanceSource,
} from "./patterns/Provenance";
export { Timeline, type TimelineItem } from "./patterns/Timeline";
export {
  ChoicePrompt,
  type ChoiceOption,
  type ChoiceAnswer,
} from "./patterns/ChoicePrompt";

/* Prozess */
export {
  StateMachine,
  type StateTransition,
} from "./patterns/StateMachine";
export { LogList, type LogEntry, type LogLevel } from "./patterns/Log";
export { LogBrowser, type LogFilterState } from "./patterns/LogBrowser";
export {
  ProcessMini,
  ProcessStepper,
  Baton,
  BatonBar,
  type ProcessLoops,
  type ProcessPhase,
  type ProcessPhaseStatus,
  type BatonSegment,
  type BatonKey,
  type BatonMeta,
} from "./patterns/Process";

/* ── Entitäten ── Konto */
export {
  AccountField,
  ACCOUNT_GROUP_LABEL,
  type AccountGroup,
  type AccountCandidate,
} from "./entities/account/AccountField";
export { AccountCell, AccountFacts, type AccountFactsVM } from "./entities/account/Account";
export {
  AccountEntryList,
  accountEntryColumns,
  type AccountEntry,
  type AccountEntryOrigin,
  type AccountEntryColumnOptions,
} from "./entities/account/AccountEntries";
export { AccountDrawer } from "./entities/account/AccountDrawer";

/* Beleg — the reading family, preview, facts per kind, lookup (0052, 0074–0076) */
export {
  FileName,
  SourceDocumentCell,
  SourceDocumentClass,
  SourceDocumentRow,
  SourceDocumentCompletion,
  sourceDocumentIdentifier,
  type SourceDocumentVM,
  type SourceDocCompletionVia,
} from "./entities/source-document/SourceDocument";

export { SourceDocumentList, type SourceDocumentEmptyKind } from "./entities/source-document/SourceDocumentList";
export {
  sourceDocumentColumns,
  sourceDocumentTracks,
  sourceDocumentMinWidth,
  DOCUMENT_LIST_COLUMNS,
  INBOX_COLUMNS,
  SUBMIT_COLUMNS,
  STUCK_COLUMNS,
  type SourceDocumentColumn,
  type SourceDocumentColumnOptions,
  type StuckVariant,
} from "./entities/source-document/source-document-columns";
export { SourceDocumentPreview } from "./entities/source-document/SourceDocumentPreview";
export {
  SourceDocumentCard,
  type SourceDocumentCardProps,
} from "./entities/source-document/SourceDocumentCard";
export {
  SourceDocumentDefects,
  SourceDocumentHistory,
  SourceDocumentVat,
  type SourceDocumentDefectsProps,
  type SourceDocumentHistoryProps,
  type SourceDocumentVatProps,
} from "./entities/source-document/SourceDocumentAside";
export { SourceDocumentView } from "./entities/source-document/SourceDocumentView";
export {
  SOURCE_DOCUMENT_DETAILS,
  resolveSourceDocumentDetail,
  type SourceDocumentDetail,
  type SourceDocumentDetailEntry,
  type SourceDocIdentifier,
  type SourceDocMeasure,
  type FactRow,
} from "./entities/source-document/source-document-detail";
export {
  SourceDocumentDrawer,
  type SourceDocumentQuickView,
} from "./entities/source-document/SourceDocumentDrawer";
export {
  SourceDocumentFacts,
  type SourceDocumentGap,
  type SourceDocumentGroup,
} from "./entities/source-document/SourceDocumentFacts";

/* Rechnungsposition — the line, its facts, a document's list (0072, 0114, 0115) */
export {
  InvoiceLineRow,
  invoiceLineTracks,
  invoiceLineTracksExpandable,
  invoiceLineMinWidth,
} from "./entities/invoice-line/InvoiceLineRow";
export { InvoiceLineFacts } from "./entities/invoice-line/InvoiceLineFacts";
export { InvoiceLineList } from "./entities/invoice-line/InvoiceLineList";
export {
  lineLabel,
  lineTitle,
  linesNetTotal,
  type InvoiceLineLabels,
} from "./entities/invoice-line/invoice-line";

/* Sachverhalt — the history across events, clarifications, expectations (0040) */
export {
  CaseTimeline,
  type CaseTimelineEntry,
  type CaseTimelineEvent,
  type CaseTimelineClarification,
  type CaseTimelineExpectation,
} from "./entities/accounting-case/CaseTimeline";

/* Sachverhalt — the cell, its name and its number (0095) */
export { CaseCell } from "./entities/accounting-case/CaseCell";
export { CaseFacts, type CaseFactsVM } from "./entities/accounting-case/CaseFacts";
export { CaseDetailView } from "./entities/accounting-case/CaseDetailView";
export { CaseDrawer, type CaseQuickView } from "./entities/accounting-case/CaseDrawer";
export { CaseRow } from "./entities/accounting-case/CaseRow";
export { CaseList, type CaseListTab } from "./entities/accounting-case/CaseList";
/* `Ausgleichs-Klammer` — the row that holds an invoice and its payment together (0026) */
export {
  OpenItemLinkRow,
  openItemLinkTracks,
  type OpenItemSide,
} from "./entities/open-item-link/OpenItemLinkRow";

export { CaseCard, type CaseCardData } from "./entities/accounting-case/CaseCard";
export { CasePicker } from "./entities/accounting-case/CasePicker";
export {
  CaseDispositionEdit,
  CaseDocumentNumberModeEdit,
  CaseKindEdit,
} from "./entities/accounting-case/CaseEditor";
export {
  caseColumns,
  caseTracks,
  type CaseColumn,
  type CaseColumnOptions,
} from "./entities/accounting-case/case-columns";

/* Kontoauszugsposition */
export {
  type BankTransactionCellData,
  type BankTransactionRowData,
  type BankTransactionDetailData,
  type CaseAssignment,
} from "./entities/bank-transaction/bank-transaction";
export { BankTransactionPurpose } from "./entities/bank-transaction/BankTransactionPurpose";
export { BankTransactionCell } from "./entities/bank-transaction/BankTransactionCell";
export { BankTransactionRow } from "./entities/bank-transaction/BankTransactionRow";
export {
  BankTransactionFacts,
  type BankTransactionFactBlock,
} from "./entities/bank-transaction/BankTransactionFacts";
export {
  BankTransactionDrawer,
  type BankTransactionExit,
} from "./entities/bank-transaction/BankTransactionDrawer";
export { BankTransactionList } from "./entities/bank-transaction/BankTransactionList";
export { BankTransactionWorklist } from "./entities/bank-transaction/BankTransactionWorklist";

/* Wiederkehr-Regel — Spaltensatz, Zeile, Listen, Fakten, Editor (0131–0135) */
export {
  recurringRuleColumns,
  recurringRuleColumnOrder,
  recurringRuleTracks,
  RECURRING_RULE_COLUMN_LABEL,
  RECURRING_RULE_ROW_COLUMNS,
  RECURRING_RULE_OVERDUE_COLUMNS,
  RECURRING_RULE_BOOK_COLUMNS,
  type RecurringRuleColumn,
  type RecurringRuleColumnOptions,
  type RecurringRuleRowData,
  type RecurringRuleListRow,
} from "./entities/recurring-rule/recurring-rule-columns";
export {
  RecurringRuleRow,
  type RecurringRuleRowProps,
} from "./entities/recurring-rule/RecurringRuleRow";
export {
  RecurringRuleList,
} from "./entities/recurring-rule/RecurringRuleList";
export { RecurringRuleOverview } from "./entities/recurring-rule/RecurringRuleOverview";
export {
  RecurringRuleFacts,
  type RecurringRulePreview,
} from "./entities/recurring-rule/RecurringRuleFacts";
export {
  RecurringRuleEditor,
  type RecurringRuleAccounts,
} from "./entities/recurring-rule/RecurringRuleEditor";

/* Geschäftspartner — Zelle (0139), Spaltensatz (0140), Auswahl (0141),
   Fakten (0142), Drawer (0143) */
export { BusinessPartnerCell } from "./entities/business-partner/BusinessPartner";
export {
  businessPartnerColumns,
  businessPartnerColumnOrder,
  businessPartnerTracks,
  PARTNER_LIST_COLUMNS,
  PARTNER_COLUMN_LABEL,
  type BusinessPartnerColumn,
  type BusinessPartnerColumnOptions,
  type BusinessPartnerRowData,
} from "./entities/business-partner/business-partner-columns";
export {
  BusinessPartnerPicker,
  filterBusinessPartners,
  DIVERSE,
  type BusinessPartnerPickerItem,
} from "./entities/business-partner/BusinessPartnerPicker";
export { BusinessPartnerFacts } from "./entities/business-partner/BusinessPartnerFacts";
export {
  BusinessPartnerDrawer,
  type PartnerTab,
} from "./entities/business-partner/BusinessPartnerDrawer";

/* Konto — the page (0063) and the chart of accounts as a column set (0062) */
export { LedgerAccountView } from "./entities/account/LedgerAccountView";
export {
  PaymentAccountField,
  type PaymentAccountOption,
} from "./entities/account/PaymentAccountField";
export {
  accountColumns,
  accountTracks,
  ACCOUNT_LIST_COLUMNS,
  ACCOUNT_CATALOG_COLUMNS,
  type AccountColumn,
  type AccountColumnOptions,
} from "./entities/account/account-columns";

/* Offene Posten */
export { OpenItemRow, OpenItemAgeGroup } from "./entities/open-item/OpenItemRow";
export {
  OPEN_ITEM_AGE_LABEL,
  type OpenItem,
  type OpenItemAgeBucket,
  type OpenItemAgeGroupVM,
} from "./entities/open-item/open-item";

/* Belegnummer */
export {
  DocumentNumberField,
  DATEV_MAX_BELEGFELD1,
} from "./entities/document-number/DocumentNumberField";
export { DocumentNumberRegister } from "./entities/document-number/DocumentNumberRegister";

/* DATEV-Snapshot */
export { SnapshotCard } from "./entities/datev-snapshot/SnapshotCard";
export {
  SNAPSHOT_COUNT_LABEL,
  RECONCILE_AXIS,
  type DatevSnapshot,
} from "./entities/datev-snapshot/datev-snapshot";
export type {
  DocumentNumberSourceLabels,
  DocumentNumberStateLabels,
} from "./entities/document-number/document-number-labels";
export {
  bankTransactionColumns,
  bankTransactionTracks,
  type BankTransactionColumn,
  type BankTransactionColumnOptions,
} from "./entities/bank-transaction/bank-transaction-columns";
export {
  caseTitle,
  caseIdentifier,
  type CaseLink,
} from "./entities/accounting-case/case-title";

/* Erwartung — what is still missing, as chip and row (0025) */
export {
  ExpectationChip,
  ExpectationRow,
  type ExpectationVM,
} from "./entities/expectation/Expectation";

/* Klärung — the reading family: preview, row, list (0059) */
export {
  ClarificationCell,
  ClarificationRow,
  ClarificationList,
  toTodoItem,
  type ClarificationVM,
  type ClarificationAudience,
} from "./entities/clarification/Clarification";

export {
  ClarificationCard,
  type ClarificationDetailVM,
  type ClarificationEvent,
  type ClarificationEventKind,
  type ClarificationSource,
} from "./entities/clarification/ClarificationCard";

export {
  ClarificationEditor,
  type ClarificationDraft,
} from "./entities/clarification/ClarificationEditor";

/* Buchungssatz — the one booking surface */
export {
  JournalEntryEditor,
  type JournalEntryEditorProps,
  type EditorMessage,
  type EditorMode,
  type EditorRow,
  type EditorStatus,
  type Side,
} from "./entities/journal-entry/JournalEntryEditor";
export { TaxKeyField } from "./entities/journal-entry/TaxKeyField";
export { JournalEntryGrid, type JournalEntryGridProps, type JournalGridMessage } from "./entities/journal-entry/JournalEntryGrid";
export {
  journalLines,
  journalTotals,
  journalBalanceText,
  journalGridTracks,
  documentSideTotal,
  rowAmount,
  type JournalRow,
  type JournalBatchLine,
  type JournalMode,
  type JournalStatus,
  type ContraAccount,
} from "./entities/journal-entry/journal-entry";
export {
  JournalEntryCell,
  JournalEntryCard,
  type JournalLine,
} from "./entities/journal-entry/JournalEntryCompact";
export {
  AiBookingNotes,
  AiBookingNotesBody,
  AiBookingNotesCell,
  SOURCE_OPENABLE as QUELLE_AUFSCHLAGBAR,
  type JudgeVerdict,
  type AiSource,
  type SourceKind,
} from "./entities/journal-entry/AiBookingNotes";

/* Status — the one allowed status display (R1). */
export {
  Confidence,
  type ConfidenceLevel,
  type ConfidenceProps,
} from "./patterns/Confidence";
export { StatusBadge, type StatusBadgeProps } from "./patterns/StatusBadge";
export { StatusHeader, type StatusHeaderProps } from "./patterns/StatusHeader";
export { StatusInfoButton } from "./patterns/StatusInfoButton";
export { StatusInfoDialog } from "./patterns/StatusInfoDialog";
