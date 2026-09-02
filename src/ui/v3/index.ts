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
 * Drei Stufen, drei Ordner (F128, `web-ui.md` R21): `primitives/` (kein
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
export { ActionBar, RowActions } from "./primitives/ActionBar";

/* Navigation */
export {
  Tabs,
  Segmented,
  FilterChips,
  SearchInput,
  type ChipOption,
  type SegmentOption,
  type TabItem,
} from "./primitives/Nav";

/* Formular */
export { Field, Input, Textarea, Select, Checkbox } from "./primitives/Form";

/* Dialog */
export { Dialog } from "./primitives/Dialog";
export { ReasonDialog } from "./primitives/ReasonDialog";

/* Fläche */
export { KpiTile, KpiGrid } from "./primitives/KpiTile";
export { FieldList } from "./primitives/FieldList";
export { ProseCard } from "./primitives/ProseCard";
export { StatusCallout } from "./primitives/StatusCallout";
export { Badge, type BadgeTone, type BadgeProps } from "./primitives/Badge";
export { EmptyState, type EmptyStateProps } from "./primitives/EmptyState";
export { Callout } from "./primitives/Callout";

/* Tabelle */
export { Card, CardHead, CardFoot, Table, HeadRow, Row, GroupRow, EmptyRow } from "./primitives/Table";
export {
  AmountCell,
  ProgressCell,
  DotStatus,
  Timestamp,
  DeviationCell,
  TableLoading,
  ErrorRow,
  type CellTone,
} from "./primitives/Cells";
export { ClickRow, ExpandableRow } from "./primitives/ExpandableRow";
export { SelectionBar, SelectCell } from "./primitives/Selection";

/* ── Patterns ── Arbeitsfläche */
export {
  MasterDetail,
  ListPane,
  DetailPane,
  type ListGroup,
  type ListItem,
} from "./patterns/MasterDetail";
export {
  TodoListe,
  istOffen,
  naechsterOffener,
  type TodoGroup,
  type TodoItem,
} from "./patterns/TodoListe";

/* Rahmen */
export {
  SchrittRail,
  SchrittKopf,
  FortschrittLeiste,
  type RailItem,
  type RailTone,
} from "./patterns/Rahmen";
export { useHotkeys, HotkeyLegend, type HotkeyBinding } from "./patterns/Hotkeys";

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

/* Prozess */
export {
  ProzessMini,
  ProzessStepper,
  Staffelstab,
  StaffelLeiste,
  type ProzessLoops,
  type ProzessPhase,
  type ProzessPhaseStatus,
  type StaffelAbschnitt,
  type StaffelstabKey,
  type StaffelstabMeta,
} from "./patterns/Prozessbild";

/* ── Entitäten ── Konto */
export {
  KontoFeld,
  KONTO_GRUPPEN_LABEL,
  type KontoGruppe,
  type KontoKandidat,
} from "./entities/konto/KontoFeld";

/* Buchungssatz — die eine Buchungs-Oberfläche */
export {
  BuchungssatzEditor,
  type BuchungssatzEditorProps,
  type EditorMeldung,
  type EditorMode,
  type EditorRow,
  type EditorStatus,
  type Seite,
} from "./entities/buchungssatz/BuchungssatzEditor";
export {
  KIBuchungshinweise,
  type JudgeVerdict,
  type KIQuelle,
  type KonfidenzStufe,
  type QuellenArt,
} from "./entities/buchungssatz/KIBuchungshinweise";

/**
 * Legacy (`src/ui/legacy/`): CSS-identisch mit dem Design, deshalb nicht neu
 * gebaut und noch nicht in die Dreiteilung eingeordnet. Der Import läuft trotzdem über `@/ui/v3`, damit der Grep
 * auf `@/ui/components` irgendwann leer wird.
 */
/* Status — die eine erlaubte Status-Darstellung (R1). */
export { StatusBadge, type StatusBadgeProps } from "./patterns/StatusBadge";
export { StatusInfoButton } from "../legacy/status/StatusInfoButton";
export { StatusInfoDialog } from "../legacy/status/StatusInfoDialog";

export { Banner } from "../legacy/components/primitives/Banner";
export { LongText } from "../legacy/components/primitives/LongText";
export { Pagination } from "../legacy/components/Pagination";
