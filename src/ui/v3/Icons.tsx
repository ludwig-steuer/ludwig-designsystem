import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  BookOpenText,
  Bot,
  Briefcase,
  Building2,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Cog,
  Copy,
  Database,
  Download,
  Ellipsis,
  ExternalLink,
  FileClock,
  FileSignature,
  HelpCircle,
  History,
  Hourglass,
  Info,
  Landmark,
  Layers,
  Layers2,
  List,
  ListTree,
  MessageCircleQuestionMark,
  PanelRight,
  Paperclip,
  PencilLine,
  Plug,
  Plus,
  Receipt,
  RefreshCw,
  Repeat,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Stamp,
  Trash2,
  Undo2,
  Upload,
  UserCircle,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

/**
 * # The icon registry
 *
 * ONE source for what a sign means — the sister of the status registry.
 * Whoever needs an icon in the set takes it from here; a sign the registry
 * does not carry does not exist for a component (R1, by analogy).
 *
 * Two tables, because they answer two questions:
 *  - `ENTITY_ICON` — **what is this thing?** The key is the English GLOSSARY
 *    name in kebab-case, so the same accounting case carries the same sign in
 *    the sidebar, in a cell and in a header.
 *  - `ACTION_ICON` — **what happens when I click?** The key is the meaning,
 *    not the appearance: `remove` and `close` share the `X` and stay two
 *    names, because they are two things.
 *
 * States do **not** live here. A review result is `StateIcon` (`Review.tsx`),
 * a status is `StatusBadge` with its colour from the status registry. A second
 * vocabulary for the same thing is exactly the drift this file ends.
 *
 * Three more tables stay where they are, for the same reason `StateIcon`
 * stays: each describes one **domain enumeration** whose values come from the
 * data model, not a sign for a meaning. Moving them here would mean moving
 * the enumeration too.
 *  - `CaseTimeline.tsx` — the event kind (`client_accounting_event.kind`)
 *  - `AiBookingNotes.tsx` — the kind of source backing a statement
 *  - `Process.tsx` — whose turn it is (agent, firm, client, system); it
 *    contradicts this registry today and moves over with task 0088
 *
 * The guard script knows all three by name; every other file has to come here.
 *
 * Every entry carries the German word (`label`) — it stands next to the sign,
 * never instead of it (T8) — and one sentence saying when it applies. Those
 * two are user-facing text and therefore German, unlike the comments here.
 *
 * ## Adding a sign
 * 1. Add an entry with `label` and `meaning`; where it can be confused with a
 *    neighbour, set `instead`.
 * 2. The story `v3/Grundlagen/Icons` renders it by itself — it reads these
 *    tables, it keeps no list of its own.
 * 3. `pnpm check:icons` says whether a file still imports past the registry.
 */
export interface IconEntry {
  icon: LucideIcon;
  /** The German word that stands next to the sign (T8). */
  label: string;
  /** One sentence: when does this sign apply? */
  meaning: string;
  /** Where else — when a neighbouring entry is easily confused with it. */
  instead?: string;
}

/**
 * One sign per entity. The app's sidebar is the default wherever it has one;
 * the rest comes from the vocabulary of story 0055.
 */
export const ENTITY_ICON = {
  "source-document": {
    icon: Receipt,
    label: "Beleg",
    meaning: "Jedes eingegangene Quell-Dokument — Rechnung, Vertrag, Kontoauszug.",
    instead: "Die eine Rechnung darin ist kein eigenes Zeichen; der Beleg ist der Oberbegriff.",
  },
  "accounting-case": {
    icon: Layers,
    label: "Sachverhalt",
    meaning: "Die fachliche Klammer um einen Geschäftsvorfall — die Ebenen sind seine Ereignisse.",
  },
  "journal-entry": {
    icon: BookOpen,
    label: "Buchungssatz",
    meaning: "Ein Satz im Journal, vorgeschlagen oder gebucht.",
  },
  batch: {
    icon: Layers2,
    label: "Buchungsstapel",
    meaning: "Der Stapel, mit dem Sätze nach DATEV gehen.",
    instead: "Der einzelne Vorgang darin ist der Sachverhalt.",
  },
  "bank-account": {
    icon: Landmark,
    label: "Bankkonto",
    meaning: "Ein Zahlungskonto des Mandanten.",
    instead: "Das Sachkonto im Kontenplan ist `ledger-account`.",
  },
  "bank-transaction": {
    icon: ArrowLeftRight,
    label: "Kontoauszugsposition",
    meaning: "Eine Zahlungsbewegung auf einem Zahlungskonto — hin oder her.",
  },
  partner: {
    icon: Building2,
    label: "Geschäftspartner",
    meaning: "Die Firma auf der anderen Seite: Kreditor oder Debitor.",
    instead: "Der eigene Mandant ist `client`, die eigene Kanzlei `tenant`.",
  },
  "ledger-account": {
    icon: ListTree,
    label: "Konto",
    meaning: "Ein Konto des Kontenplans — Sachkonto, Personenkonto, Verrechnungskonto.",
  },
  "datev-mirror": {
    icon: Database,
    label: "DATEV-Wahrheit",
    meaning: "Der Spiegel dessen, was in DATEV steht.",
  },
  "open-item": {
    icon: FileClock,
    label: "Offener Posten",
    meaning: "Eine Forderung oder Verbindlichkeit, die noch nicht ausgeglichen ist.",
  },
  clarification: {
    icon: MessageCircleQuestionMark,
    label: "Rückfrage",
    meaning: "Eine Frage am Sachverhalt, die jemand beantworten muss.",
    instead: "Hilfe zur Seite ist `help`, eine Erklärung zu einem Wert ist `info`.",
  },
  expectation: {
    icon: Hourglass,
    label: "Erwartung",
    meaning: "Etwas fehlt noch und wird erwartet — ein Beleg, eine Zahlung.",
  },
  client: {
    icon: Briefcase,
    label: "Mandant",
    meaning: "Das Unternehmen, dessen Buchhaltung geführt wird.",
    instead: "Die fremde Firma im Vorgang ist `partner`.",
  },
  tenant: {
    icon: Stamp,
    label: "Kanzlei",
    meaning: "Die steuerberatende Instanz, die mehrere Mandanten führt.",
    instead:
      "Nicht `Building2` — das trägt in der Sidebar der Geschäftspartner, und zwei Häuser nebeneinander unterscheidet niemand. Auch nicht `Scale`: die Waage steht in `AiBookingNotes` für die Quellenart „Gesetz\u201c.",
  },
  user: {
    icon: UserRound,
    label: "Benutzer",
    meaning: "Ein Mensch mit Zugang.",
  },
  job: {
    icon: Cog,
    label: "Auftrag",
    meaning: "Ein Hintergrundprozess, den das System abarbeitet.",
    instead: "Der Agent, der etwas entschieden hat, ist `agent`.",
  },
  "fiscal-year": {
    icon: CalendarRange,
    label: "Wirtschaftsjahr",
    meaning: "Der Zeitraum, an dem fast alles in Ludwig hängt.",
  },
  integration: {
    icon: Plug,
    label: "Bank-Anbindung",
    meaning: "Eine angebundene Quelle, die Umsätze liefert.",
  },
  "recurring-rule": {
    icon: Repeat,
    label: "Wiederkehr-Regel",
    meaning: "Die Vorlage eines Dauersachverhalts — Miete, Abo, Sollstellung.",
  },
  contract: {
    icon: FileSignature,
    label: "Vertrag",
    meaning: "Die Belegart, die eine laufende Vereinbarung trägt.",
  },
  "invoice-line": {
    icon: List,
    label: "Rechnungsposition",
    meaning: "Eine Zeile einer Rechnung.",
  },
} satisfies Record<string, IconEntry>;

/**
 * One sign per meaning. The key says what happens, not what it looks like:
 * `remove` and `close` share the `X` and stay two names.
 */
export const ACTION_ICON = {
  open: {
    icon: ArrowUpRight,
    label: "Öffnen",
    meaning: "Zum Objekt navigieren — die Seite wechselt.",
    instead: "Neben der Arbeit nachschlagen → `peek`. Ludwig verlassen → `external`.",
  },
  peek: {
    icon: PanelRight,
    label: "Nachschlagen",
    meaning: "Das Objekt im Drawer neben der Arbeit öffnen — die Seite bleibt stehen.",
    instead: "Die Seite wechseln → `open`.",
  },
  external: {
    icon: ExternalLink,
    label: "Extern öffnen",
    meaning: "Verlässt Ludwig — DATEV, Bank, ein fremder Link.",
    instead: "Ein Ziel innerhalb von Ludwig → `open`.",
  },
  info: {
    icon: Info,
    label: "Erklären",
    meaning: "Erklärt, was direkt daneben steht — ein Zustand, ein Wert.",
    instead: "Hilfe zur ganzen Seite oder zum Ablauf → `help`.",
  },
  help: {
    icon: HelpCircle,
    label: "Hilfe",
    meaning: "Hilfe zur Seite oder zum Ablauf, nicht zu einem einzelnen Wert.",
  },
  edit: {
    icon: PencilLine,
    label: "Bearbeiten",
    meaning: "Einen Wert ändern — `InlineEdit`, Editoren.",
  },
  add: {
    icon: Plus,
    label: "Anlegen",
    meaning: "Etwas Neues anlegen.",
  },
  delete: {
    icon: Trash2,
    label: "Löschen",
    meaning: "Endgültig löschen — nur mit Rückfrage (`ActionButton confirm`).",
    instead: "Nur aus einer Liste nehmen → `remove`.",
  },
  remove: {
    icon: X,
    label: "Entfernen",
    meaning: "Aus einer Liste oder Auswahl nehmen; nichts wird gelöscht.",
    instead: "Ein Fenster zumachen → `close`.",
  },
  close: {
    icon: X,
    label: "Schließen",
    meaning: "Dialog oder Drawer zumachen.",
    instead: "Einen Eintrag aus einer Liste nehmen → `remove`.",
  },
  copy: {
    icon: Copy,
    label: "Kopieren",
    meaning: "Den Wert in die Zwischenablage legen.",
  },
  download: {
    icon: Download,
    label: "Herunterladen",
    meaning: "Eine Datei aus Ludwig holen.",
  },
  upload: {
    icon: Upload,
    label: "Hochladen",
    meaning: "Eine Datei nach Ludwig geben.",
  },
  retry: {
    icon: RotateCcw,
    label: "Erneut",
    meaning: "Einen Lauf oder Schritt wiederholen.",
    instead: "Nur die Anzeige neu laden → `refresh`.",
  },
  undo: {
    icon: Undo2,
    label: "Zurücknehmen",
    meaning: "Eine Entscheidung rückgängig machen.",
  },
  refresh: {
    icon: RefreshCw,
    label: "Aktualisieren",
    meaning: "Die Anzeige neu laden; am Gegenstand ändert sich nichts.",
  },
  confirm: {
    icon: Check,
    label: "Bestätigen",
    meaning: "Gewählt, erledigt, angenommen.",
  },
  back: {
    icon: ChevronLeft,
    label: "Zurück",
    meaning: "Eine Seite oder einen Datensatz zurück.",
  },
  forward: {
    icon: ChevronRight,
    label: "Weiter",
    meaning: "Eine Seite oder einen Datensatz vor.",
  },
  expand: {
    icon: ChevronDown,
    label: "Aufklappen",
    meaning: "Mehr zeigen, an Ort und Stelle.",
  },
  collapse: {
    icon: ChevronRight,
    label: "Zuklappen",
    meaning: "Wieder einklappen — dasselbe Zeichen wie `forward`, gedreht durch den Zustand.",
  },
  more: {
    icon: Ellipsis,
    label: "Mehr",
    meaning: "Die selteneren Wege im Überlaufmenü.",
  },
  filter: {
    icon: SlidersHorizontal,
    label: "Filtern",
    meaning: "Die Liste einschränken.",
    instead: "Volltext über die Liste → `search`.",
  },
  search: {
    icon: Search,
    label: "Suchen",
    meaning: "Volltext über eine Liste oder das ganze Produkt.",
  },
  "sort-asc": {
    icon: ArrowUp,
    label: "Aufsteigend",
    meaning: "Spaltenkopf, aufsteigend sortiert.",
  },
  "sort-desc": {
    icon: ArrowDown,
    label: "Absteigend",
    meaning: "Spaltenkopf, absteigend sortiert.",
  },
  history: {
    icon: History,
    label: "Verlauf",
    meaning: "Was bisher passiert ist — Timeline und der gleichnamige Reiter.",
  },
  time: {
    icon: Clock,
    label: "Zeitpunkt",
    meaning: "Ein Zeitpunkt oder eine Dauer.",
  },
  ledger: {
    icon: BookOpenText,
    label: "Kontenblatt",
    meaning: "Die Bewegungen eines Kontos aufschlagen.",
    instead: "Das Konto selbst benennen → EntityIcon `ledger-account`.",
  },
  alert: {
    icon: CircleAlert,
    label: "Achtung",
    meaning: "Etwas ist schiefgegangen und steht im Weg — an einem Schritt, einer Zeile.",
    instead: "Ein Prüfergebnis mit Stufe → StateIcon (Review.tsx).",
  },
  attachment: {
    icon: Paperclip,
    label: "Anhang",
    meaning: "Ein Beleg, der an etwas hängt.",
  },
  agent: {
    icon: Bot,
    label: "Agent",
    meaning: "Kommt vom Agenten — nicht von einem Menschen.",
  },
  person: {
    icon: UserCircle,
    label: "Person",
    meaning: "Kommt von einem Menschen.",
  },
} satisfies Record<string, IconEntry>;

export type EntityKey = keyof typeof ENTITY_ICON;
export type ActionKey = keyof typeof ACTION_ICON;

/**
 * The ladder from A8: 12/14/16 in the working register, 16/20/24 in the
 * reading one. There are no other sizes — an icon that steps out of line only
 * shows that somebody was patching a row height.
 */
export type IconSize = 12 | 14 | 16 | 20 | 24;

/**
 * The sign of an entity.
 *
 * It is labelling, not content: `aria-hidden`, colour from the surrounding
 * text, and the word stands next to it (T8). That is why there is deliberately
 * **no** `label` prop — a component that draws the word moves T8 to the wrong
 * place — and **no** `icon` prop: a back door for any Lucide sign would turn
 * the registry into decoration.
 *
 * @when    Naming a thing from the data model — in the sidebar, in front of
 *          a name, in the head of a record.
 * @instead An action or a hint → ActionIcon. A review result → StateIcon
 *          (Review.tsx). A state carrying colour → StatusBadge.
 */
export function EntityIcon({
  entity,
  size = 14,
  className,
}: {
  entity: EntityKey;
  size?: IconSize;
  className?: string;
}) {
  const Icon = ENTITY_ICON[entity].icon;
  return <Icon size={size} strokeWidth={1.5} className={className} aria-hidden="true" />;
}

/**
 * The sign of an action or a hint.
 *
 * Like `EntityIcon`: `aria-hidden`, no `label`, no `icon`. The `IconButton`
 * around it carries its own `aria-label`.
 *
 * @when    Saying what a click does, before anyone clicks.
 * @instead Naming a thing → EntityIcon. A review result → StateIcon.
 */
export function ActionIcon({
  action,
  size = 14,
  className,
}: {
  action: ActionKey;
  size?: IconSize;
  className?: string;
}) {
  const Icon = ACTION_ICON[action].icon;
  return <Icon size={size} strokeWidth={1.5} className={className} aria-hidden="true" />;
}
