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
  Scale,
  Search,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Upload,
  UserCircle,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

/**
 * # Die Icon-Registry
 *
 * EINE Quelle dafür, welches Zeichen was bedeutet — die Schwester der
 * Status-Registry. Wer im Set ein Icon braucht, holt es hier; ein Zeichen, das
 * die Registry nicht führt, gibt es für einen Baustein nicht (R1, sinngemäß).
 *
 * Zwei Tabellen, weil es zwei Fragen sind:
 *  - `ENTITY_ICON` — **was ist das Ding?** Schlüssel ist der englische
 *    GLOSSARY-Name in kebab-case, damit derselbe Sachverhalt in Sidebar,
 *    Zelle und Kopf dasselbe Zeichen trägt.
 *  - `ACTION_ICON` — **was passiert, wenn ich klicke?** Schlüssel ist die
 *    Bedeutung, nicht das Aussehen: `remove` und `close` teilen sich `X` und
 *    bleiben trotzdem zwei Namen, weil sie zwei Dinge sind.
 *
 * Zustände stehen **nicht** hier. Ein Prüfergebnis ist `StateIcon`
 * (`Review.tsx`), ein Status ist `StatusBadge` mit der Farbe aus der
 * Status-Registry. Ein zweites Vokabular für dieselbe Sache wäre genau die
 * Drift, die diese Datei beendet.
 *
 * Drei weitere Tabellen bleiben aus demselben Grund, aus dem `StateIcon`
 * bleibt: sie beschreiben je **eine fachliche Aufzählung**, nicht ein
 * Zeichen für eine Bedeutung, und ihre Werte kommen aus dem Datenmodell.
 * Wer sie hierher zöge, müsste die Aufzählung mitziehen.
 *  - `CaseTimeline.tsx` — die Ereignisart (`client_accounting_event.kind`)
 *  - `AiBookingNotes.tsx` — die Quellenart eines Belegs für eine Aussage
 *  - `Process.tsx` — wer an der Reihe ist (Agent, Kanzlei, Mandant, System)
 * Das Wächter-Skript kennt sie namentlich; jede weitere Datei muss hierher.
 *
 * Jeder Eintrag trägt das deutsche Wort (`label`) — es steht neben dem
 * Zeichen, nie statt seiner (T8) — und einen Satz, wann es gilt.
 *
 * ## Ein Zeichen ergänzen
 * 1. Eintrag mit `label` und `meaning` anlegen; wo es sich mit einem
 *    vorhandenen beißt, `instead` setzen.
 * 2. Story `v3/Grundlagen/Icons` rendert ihn von allein — sie liest diese
 *    Tabellen, sie pflegt keine eigene Liste.
 * 3. `pnpm check:icons` sagt, ob noch eine Datei an der Registry vorbei
 *    importiert.
 */
export interface IconEntry {
  icon: LucideIcon;
  /** Das deutsche Wort, das neben dem Zeichen steht (T8). */
  label: string;
  /** Ein Satz: wann gilt dieses Zeichen? */
  meaning: string;
  /** Wohin sonst — wenn ein Nachbareintrag leicht verwechselt wird. */
  instead?: string;
}

/**
 * Ein Zeichen je Entität. Die Sidebar der App ist die Vorgabe, wo sie eine
 * hat; der Rest kommt aus dem Vokabular der Story 0055.
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
    icon: Scale,
    label: "Kanzlei",
    meaning: "Die steuerberatende Instanz, die mehrere Mandanten führt.",
    instead:
      "Nicht `Building2` — das trägt in der Sidebar der Geschäftspartner, und zwei Häuser nebeneinander unterscheidet niemand.",
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
 * Ein Zeichen je Bedeutung. Der Schlüssel sagt, was passiert — nicht, wie es
 * aussieht: `remove` und `close` teilen `X` und bleiben zwei Namen.
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
 * Die Leiter A8: produktiv 12/14/16, lesend 16/20/24. Andere Maße gibt es
 * nicht — ein Icon, das aus der Reihe fällt, verrät nur, dass jemand die
 * Zeilenhöhe nachgebessert hat.
 */
export type IconSize = 12 | 14 | 16 | 20 | 24;

/**
 * Das Zeichen einer Entität.
 *
 * Es ist Beschriftung, kein Inhalt: `aria-hidden`, Farbe über den umgebenden
 * Text, und das Wort steht daneben (T8). Deshalb gibt es bewusst **kein**
 * `label`-Prop — eine Komponente, die das Wort mitzeichnet, verlagert T8 an
 * die falsche Stelle — und **kein** `icon`-Prop: eine Hintertür für ein
 * beliebiges Lucide-Zeichen macht die Registry zur Dekoration.
 *
 * @when    Ein Ding aus dem Datenmodell benennen — in der Sidebar, vor einem
 *          Namen, im Kopf einer Akte.
 * @instead Eine Handlung oder ein Hinweis → ActionIcon. Ein Prüfergebnis →
 *          StateIcon (Review.tsx). Ein Zustand mit Farbe → StatusBadge.
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
 * Das Zeichen einer Handlung oder eines Hinweises.
 *
 * Wie `EntityIcon`: `aria-hidden`, kein `label`, kein `icon`. Der `IconButton`
 * darum herum trägt sein `aria-label` selbst.
 *
 * @when    Sagen, was ein Klick tut, bevor jemand klickt.
 * @instead Ein Ding benennen → EntityIcon. Ein Prüfergebnis → StateIcon.
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
