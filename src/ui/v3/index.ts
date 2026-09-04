/**
 * `@/ui/v3` — das Komponenten-Set des neuen Design-Systems.
 *
 * Nebenläufig zu `@/ui/components`: der **Import-Pfad** trägt die Version,
 * kein Datei-Suffix. Ein Grep auf `@/ui/components` zeigt jederzeit den
 * Rest-Bestand der Migration — jedes Arbeitspaket senkt die Zahl, keines
 * erhöht sie.
 *
 * Was hier liegt, kennt **kein Fachmodul**: Daten kommen als Props, Loader
 * als Prop, keine Server Actions, keine Modul-Importe.
 *
 * Drei Stufen, drei Ordner (F128, `web-ui-regeln.md` R21): `primitives/` (kein
 * Fachwort), `patterns/` (Arbeitsflächen-Muster, kennt Prozessbegriffe),
 * `entities/<entität>/` (Darstellungsfamilie genau einer Entität). Importiert
 * wird nur abwärts — Primitives kennen keine Patterns, Patterns keine
 * Entitäten. Fachliche Zusammensetzungen wohnen im Modul, nicht hier.
 *
 * Die Gruppen-Kommentare unten (Aktion, Navigation, …) sind zugleich die
 * Storybook-Ordner: `v3/<Stufe>/<Gruppe>/<Name>`. Eine Datei je Familie,
 * jeder Export trägt `@when`/`@instead` — siehe README „Ordnung im Set".
 *
 * Tokens: `src/styles/tokens.css` ist die 1:1-Übernahme des Design-Systems,
 * Klassen und Maße stehen in `src/styles/v2.css`. Kein Hex-Wert, kein
 * Pixelmaß in einer Komponente (UX-Guidelines A5).
 *
 * Abweichung von der App: dort liegt `StatusBadge` außerhalb des Sets
 * (`@/ui/status`). Hier ist er ein Pattern — R1 macht ihn zur einen
 * erlaubten Status-Darstellung, und was der Barrel nicht führt, existiert
 * für einen Konsumenten des Design-Systems nicht; er baut sonst die lokalen
 * Label-Maps, die R1 gerade verbietet. Er setzt auf `Badge` auf: dort der
 * Ton, hier die Registry.
 *
 * Weiter draußen bleiben `Drawer`/`UrlDrawer` (Wächter-Test) und
 * `StatusHeader`/`Tooltip` (R2) — die hängen an App-Kontext.
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
  type ConfirmSpec,
} from "./primitives/ActionButton";
export {
  OverflowMenu,
  MenuItem,
  type MenuItemTone,
} from "./primitives/OverflowMenu";
export { ActionBar, RowActions } from "./primitives/ActionBar";
export { Kbd } from "./primitives/Kbd";

/* Rahmen — die Shell, außerhalb der Stufen (Soll-Katalog §11.7) */
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

/* Werte — ein Betrag, ein Zeitpunkt, eine Regel (P24) */
export { Amount, type AmountProps, type AmountSize } from "./primitives/Amount";
export { Time, Duration, type TimeSize } from "./primitives/Time";
export { LongText } from "./primitives/LongText";
export {
  formatAmount,
  formatTime,
  formatTimeFull,
  formatDuration,
  type TimeFormat,
  type TimeLength,
} from "./format";

/* Daten — Reihen und Verläufe (0041, 0045) */
export { BarChart, type Bar } from "./primitives/BarChart";
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
  type BulkAction,
  type SelectionApi,
} from "./primitives/Selection";

/* ── Patterns ── Arbeitsfläche */
export {
  DataTable,
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
export { useHotkeys, HotkeyLegend, type HotkeyBinding } from "./patterns/Hotkeys";
export {
  CommandPalette,
  type CommandGroup,
  type CommandItem,
} from "./patterns/CommandPalette";

/* Prüfen */
export {
  StateIcon,
  Checklist,
  CheckItems,
  Messages,
  type ChecklistRow,
  type Message,
  type CheckItem,
  type StateKind,
} from "./patterns/Review";
export { ComparisonTable, type ComparisonRow } from "./patterns/ComparisonTable";
export { Timeline, type TimelineItem } from "./patterns/Timeline";
export {
  ChoicePrompt,
  type ChoiceOption,
  type ChoiceAnswer,
} from "./patterns/ChoicePrompt";

/* Prozess */
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

/* Beleg — die Nachschlag-Form neben der Arbeit (0052) */
export {
  DocumentDrawer,
  type DocumentQuickView,
} from "./entities/document/DocumentDrawer";
export {
  DocumentFacts,
  type DocumentFactsVM,
} from "./entities/document/DocumentFacts";

/* Sachverhalt — der Verlauf über Ereignisse, Klärungen, Erwartungen (0040) */
export {
  CaseTimeline,
  type CaseTimelineEntry,
  type CaseTimelineEvent,
  type CaseTimelineClarification,
  type CaseTimelineExpectation,
} from "./entities/accounting-case/CaseTimeline";

/* Klärung — die lesende Familie: Vorschau, Zeile, Liste (0059) */
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

/* Buchungssatz — die eine Buchungs-Oberfläche */
export {
  JournalEntryEditor,
  type JournalEntryEditorProps,
  type EditorMessage,
  type EditorMode,
  type EditorRow,
  type EditorStatus,
  type Side,
} from "./entities/journal-entry/JournalEntryEditor";
export {
  JournalEntryCell,
  JournalEntryCard,
  type JournalLine,
} from "./entities/journal-entry/JournalEntryCompact";
export {
  AiBookingNotes,
  type JudgeVerdict,
  type AiSource,
  type ConfidenceLevel,
  type SourceKind,
} from "./entities/journal-entry/AiBookingNotes";

/* Status — die eine erlaubte Status-Darstellung (R1). */
export { StatusBadge, type StatusBadgeProps } from "./patterns/StatusBadge";
export { StatusInfoButton } from "./patterns/StatusInfoButton";
export { StatusInfoDialog } from "./patterns/StatusInfoDialog";
