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
 * Tokens: `src/styles/tokens.css` ist die 1:1-Übernahme des Design-Systems,
 * Klassen und Maße stehen in `src/styles/v2.css`. Kein Hex-Wert, kein
 * Pixelmaß in einer Komponente (UX-Guidelines A5).
 *
 * Abweichung von der App: dort liegt `StatusBadge` bewusst außerhalb des
 * Sets (`@/ui/status`). Hier wird es **mit exportiert** — R1 macht es zur
 * einen erlaubten Status-Darstellung, und was der Barrel nicht führt,
 * existiert für einen Konsumenten des Design-Systems nicht; er baut sonst
 * die lokalen Label-Maps, die R1 gerade verbietet.
 *
 * Weiter draußen bleiben `Drawer`/`UrlDrawer` (Wächter-Test) und
 * `StatusHeader`/`Tooltip` (R2) — die hängen an App-Kontext.
 */

/* Karte und Tabelle */
export { Card, CardHead, CardFoot, Table, HeadRow, Row, GroupRow, EmptyRow } from "./primitives/Table";

/* Aktion */
export {
  Button,
  KeyButton,
  ActionBar,
  RowActions,
  type ButtonProps,
  type ButtonLinkProps,
  type ButtonSize,
  type ButtonVariant,
} from "./primitives/Button";

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

/* Fläche */
export { KpiTile, KpiGrid, FieldList, ProseCard, StatusCallout, Callout } from "./primitives/Surface";
export { Dialog } from "./primitives/Dialog";
export { GrundDialog } from "./primitives/GrundDialog";

/* Formular */
export { Field, Input, Textarea, Select, Checkbox } from "./primitives/Form";
export {
  KontoFeld,
  KONTO_GRUPPEN_LABEL,
  type KontoGruppe,
  type KontoKandidat,
} from "./entities/konto/KontoFeld";

/* Zellen */
export {
  AmountCell,
  ProgressCell,
  DotStatus,
  Timestamp,
  AbweichungsZelle,
  TableLoading,
  ErrorRow,
  type CellTone,
} from "./primitives/Cells";

/* Interaktive Zeilen und Arbeitsfläche */
export { ClickRow, ExpandableRow, SelectionBar, SelectCell } from "./primitives/Interactive";
export {
  MasterDetail,
  ListPane,
  DetailPane,
  type ListGroup,
  type ListItem,
} from "./patterns/MasterDetail";

/* Rahmen einer mehrschrittigen Prüfung */
export {
  SchrittRail,
  SchrittKopf,
  FortschrittLeiste,
  type RailItem,
  type RailTone,
} from "./patterns/Rahmen";
export { useHotkeys, HotkeyLegende, type HotkeyBinding } from "./patterns/Hotkeys";
export {
  TodoListe,
  istOffen,
  naechsterOffener,
  type TodoGroup,
  type TodoItem,
} from "./patterns/TodoListe";

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

/* Vergleichen */
export { VergleichsTabelle, type VergleichsZeile } from "./patterns/VergleichsTabelle";

/* Prüfen */
export {
  StateIcon,
  Checkliste,
  Pruefpunkte,
  Meldungen,
  type ChecklistRow,
  type Meldung,
  type Pruefpunkt,
  type ZustandsIcon,
} from "./patterns/Pruefen";

/* Prozessbild */
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

/**
 * Re-Export dessen, was CSS-identisch mit dem Design ist und deshalb nicht
 * neu gebaut wird. Der Import läuft trotzdem über `@/ui/v3`, damit der Grep
 * auf `@/ui/components` irgendwann leer wird.
 */
/* Status — die eine erlaubte Status-Darstellung (R1). */
export { StatusBadge } from "@/ui/status/StatusBadge";
export { StatusInfoButton } from "@/ui/status/StatusInfoButton";
export { StatusInfoDialog } from "@/ui/status/StatusInfoDialog";

export { Banner } from "@/ui/components/primitives/Banner";
export { LongText } from "@/ui/components/primitives/LongText";
export { Pagination } from "@/ui/components/Pagination";
