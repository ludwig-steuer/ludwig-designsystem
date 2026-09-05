# 0087 · IconRegistry — welches Zeichen was bedeutet

| | |
|---|---|
| Status | spec |
| Stufe | `patterns/` — neben `status-registry.ts` und `entity-icons.ts`; wie die Status-Registry ein Vokabular, kein Baustein. Die Entitäts-Zeilen sind Ludwig, die Handlungs-Zeilen sind fachfrei |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede App muss einmal festlegen, was „zum Objekt", „im Drawer nachschlagen" und „erklären" als Zeichen heißt; nur die Tabelle der Entitäten wäre dort eine andere |
| Quelle | Anfrage Owner vom 2026-09-05 („Symbole sollen eine Bedeutung haben, die wir einmal festschreiben und später verwenden: welches Icon steht für welche Entität, welches heißt mehr Infos, welches navigiere zum Objekt, welches mehr Infos im Drawer") · `Icons.stories.tsx` (0055) hält das Vokabular heute nur als Story · Regeln A8, T8, T9 |
| Ersetzt | `ENTITY_ICON` in `patterns/entity-icons.ts` (drei Einträge, über die Status-Achse geschlüsselt) · die handgepflegten `GROUPS` in `Icons.stories.tsx` · die Einzel-Importe von Bedeutungs-Icons aus `lucide-react` in den Bausteinen des Sets (35 verschiedene Icons, u. a. `Info` in `StatusInfoButton`, `ExternalLink` in `Link`/`AccountCell`, `ChevronLeft/Right` in `Pagination`/`RecordPager`, `X` in `Dialog`/`Drawer`) · in der App: die Icon-Spalte von `mandant-nav.ts` (Befund) |
| Blockiert | jede Entitäts-Form, die ein Symbol vor den Namen setzt (`CaseCell`, `SourceDocumentRow`, `BankTransactionRow`, `EntityHeader`); `IconButton`/`RowActions`/`OverflowMenu` („welches Zeichen für öffnen, nachschlagen, mehr"); `NavList` (die App speist die Sidebar-Icons aus derselben Tabelle) |
| Spec von / am | Claude, 2026-09-05 |

## Ziel

Die Sachbearbeiterin sieht ein Zeichen und weiß, was passiert, bevor sie
klickt: der Pfeil nach schräg oben wechselt die Seite zum Objekt, das
Seitenpanel öffnet es zum Nachschlagen neben der Arbeit, das (i) erklärt,
das Blatt ist ein Beleg, die Ebenen sind ein Sachverhalt. Heute ist das
Vokabular in einer Story beschrieben (0055, acht Gruppen), aber kein Baustein
liest es: jede Komponente importiert ihr Icon selbst aus `lucide-react`, die
App hat ihre eigene Tabelle in der Sidebar, und die Story listet unten, was
„von v3 benutzt, aber in keiner Bedeutungsgruppe" ist — die Drift ist
eingebaut. Die Registry macht aus der Beschreibung eine Quelle: ein Name je
Bedeutung, ein Zeichen je Name, und ein Test, der jeden Import daran vorbei
meldet. Wie bei der Status-Registry gilt: was die Registry nicht führt, gibt
es für einen Baustein nicht.

## Einordnung

- **Wiederverwenden:** `entity-icons.ts` hat `ENTITY_ICON` für drei
  Entitäten, aber über die **Status-Achse** geschlüsselt — eine Zelle ohne
  Status kann es nicht fragen. `StateIcon` (`Review.tsx`, neun Prüfzustände)
  ist der Zustands-Teil des Vokabulars und bleibt, wie er ist; die Registry
  verweist auf ihn statt ihn zu doppeln. `Icons.stories.tsx` (0055) hat die
  Gruppen Navigieren · Öffnen und schließen · Bestätigen · Verwerfen und
  zurücknehmen · Informieren · Wer ist dran · Entität · Fachwelt — das ist
  die Vorlage der Namen, nur als Text statt als Code.
- **Neu, weil:** `spec-schreiben` §3 Regel 3 — kein `@when` deckt „gib mir
  das Zeichen für diese Bedeutung"; zwei Verwendungen heute (`NavList` in der
  App über `mandant-nav.ts`, `StatusBadge` über `ENTITY_ICON`) und jede
  kommende Entitäts-Form; und es lässt sich nicht an der Aufrufstelle
  komponieren, weil die Aufrufstelle genau das Problem ist. Präzedenz: die
  Status-Registry (R1) — dieselbe Form für dieselbe Aufgabe.
- **Zuschnitt:** eine Datei `patterns/Icons.tsx` als Familie: die zwei
  Tabellen (`ENTITY_ICON`, `ACTION_ICON`), die zwei Typen und zwei winzige
  Komponenten (`EntityIcon`, `ActionIcon`), die Größe und Strich aus der
  Leiter setzen. `entity-icons.ts` behält `AXIS_LABEL`/`AXIS_SOURCE` (das ist
  Status, nicht Icon) und bezieht sein `ENTITY_ICON` über eine Abbildung
  Achse → Entität aus der neuen Tabelle. Die Story `v3/Grundlagen/Icons`
  rendert künftig **aus der Registry**, nicht aus einer Hand-Liste.
- **Setzt auf:** `lucide-react` (einziger Ort im Set, der Bedeutungs-Icons
  importiert), Tokens für die Leiter (A8).

## Schnittstelle

**Tabellen** (die Registry):

| Export | Typ | Bedeutung |
|---|---|---|
| `ENTITY_ICON` | `Record<EntityKey, IconEntry>` | Ein Zeichen je Entität aus der Schichten-Tabelle des GLOSSARY, Schlüssel = englischer GLOSSARY-Name in kebab-case |
| `ACTION_ICON` | `Record<ActionKey, IconEntry>` | Ein Zeichen je Handlung oder Hinweis, Schlüssel englisch |
| `IconEntry` | `{ icon: LucideIcon; label: string; meaning: string; instead?: string }` | `label` ist das deutsche Wort, das neben dem Zeichen steht (T8); `meaning` ein Satz, wann es gilt; `instead` wohin sonst |
| `EntityKey`, `ActionKey` | String-Unions | aus den Tabellen abgeleitet, nicht doppelt gepflegt |

`ENTITY_ICON` — Startbelegung, Sidebar der App als Vorgabe, Rest aus dem
Vokabular der Story 0055; wo beides fehlt, entscheidet der Bauende und
trägt es in die Spec ein:

| `EntityKey` | Zeichen | Woher |
|---|---|---|
| `source-document` | `Receipt` | Sidebar, `ENTITY_ICON` heute |
| `accounting-case` | `Layers` | Sidebar, `ENTITY_ICON` heute |
| `journal-entry` | `BookOpen` | `ENTITY_ICON` heute |
| `batch` | `Layers2` | Sidebar („Buchungsstapel") |
| `bank-account` | `Landmark` | Sidebar („Banken") |
| `bank-transaction` | `ArrowLeftRight` | Story 0055 „Fachwelt" — prüfen |
| `partner` | `Building2` | Sidebar („Geschäftspartner") |
| `ledger-account` | `ListTree` | Sidebar („Konten") |
| `datev-mirror` | `Database` | Sidebar („DATEV-Wahrheit") |
| `open-item` | `FileClock` | Sidebar („OPOS") |
| `clarification` | `MessageCircleQuestionMark` | Story 0055 „Wer ist dran"/„Informieren" — prüfen |
| `expectation` | `Hourglass` | Story 0055 — prüfen |
| `client` (Mandant) | offen — siehe Frage 3 | — |
| `tenant` (Kanzlei), `user`, `job`, `fiscal-year`, `integration`, `recurring-rule`, `contract`, `invoice-line` | Bauender entscheidet aus dem Vokabular der Story; jede Wahl mit Grund in die Spec | — |

`ACTION_ICON` — die Bedeutungen, die der Owner festgeschrieben haben will,
plus das, was das Set heute schon benutzt:

| `ActionKey` | Zeichen (Default) | `label` | Bedeutung |
|---|---|---|---|
| `open` | `ArrowUpRight` | „Öffnen" | zum Objekt navigieren, die Seite wechselt (I11) |
| `peek` | `PanelRight` | „Nachschlagen" | das Objekt im Drawer neben der Arbeit öffnen, die Seite bleibt (L3) |
| `external` | `ExternalLink` | „Extern öffnen" | verlässt Ludwig (DATEV, Bank, Hilfe-Link) |
| `info` | `Info` | „Erklären" | eine Erklärung zu dem, was daneben steht (`StatusInfoButton`, `StatusHeader`) |
| `help` | `HelpCircle` | „Hilfe" | Hilfe zur Seite oder zum Ablauf, nicht zu einem Wert |
| `edit` | `PencilLine` | „Bearbeiten" | `InlineEdit`, Editoren |
| `add` | `Plus` | „Anlegen" | |
| `delete` | `Trash2` | „Löschen" | endgültig; mit `ActionButton confirm` |
| `remove` | `X` | „Entfernen" | aus einer Liste nehmen, nichts wird gelöscht |
| `close` | `X` | „Schließen" | Dialog, Drawer — dasselbe Zeichen wie `remove`, andere Bedeutung, deshalb zwei Namen |
| `copy` | `Copy` | „Kopieren" | |
| `download` | `Download` | „Herunterladen" | |
| `upload` | `Upload` | „Hochladen" | |
| `retry` | `RotateCcw` | „Erneut" | einen Lauf wiederholen |
| `undo` | `Undo2` | „Zurücknehmen" | eine Entscheidung rückgängig |
| `refresh` | `RefreshCw` | „Aktualisieren" | Anzeige neu laden |
| `confirm` | `Check` | „Bestätigen" | |
| `back` / `forward` | `ChevronLeft` / `ChevronRight` | „Zurück" / „Weiter" | blättern (`Pagination`, `RecordPager`, `Wizard`-Fuß) |
| `expand` / `collapse` | `ChevronDown` / `ChevronRight` | „Aufklappen" / „Zuklappen" | `Disclosure`, `ExpandableRow` — mit 0055 abgleichen |
| `more` | `Ellipsis` | „Mehr" | `OverflowMenu` |
| `filter` | `SlidersHorizontal` | „Filtern" | `FilterBar` |
| `search` | `Search` | „Suchen" | `SearchInput` |
| `sort-asc` / `sort-desc` | `ArrowUp` / `ArrowDown` | „Aufsteigend" / „Absteigend" | `DataTable`-Spaltenkopf |
| `history` | `History` | „Verlauf" | `Timeline`, Tabs „Verlauf" |
| `time` | `Clock` | „Zeitpunkt" | |
| `attachment` | `Paperclip` | „Anhang" | Belege am Sachverhalt |
| `agent` | `Bot` | „Agent" | die Herkunft „vom Agenten" — Story 0055 „Wer ist dran" |
| `person` | `UserCircle` | „Person" | die Herkunft „von einem Menschen" |

Zustände (`done`, `error`, `warning`, `open` …) kommen **nicht** hier hinein:
das ist `StateIcon` (`Review.tsx`), und `StatusBadge` trägt seine Farbe aus
der Status-Registry. Die Story verweist darauf.

**Komponenten:**

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `EntityIcon entity` | `EntityKey` | ja | Das Zeichen der Entität | `Entities` |
| `ActionIcon action` | `ActionKey` | ja | Das Zeichen der Handlung | `Actions` |
| `size` (beide) | `12 \| 14 \| 16 \| 20 \| 24` | nein, Default `14` | Nur Werte der Leiter (A8): produktiv 12/14/16, lesend 16/20/24; Strich immer 1.5 | `Sizes` |
| `className` (beide) | `string` | nein | Farbe über den umgebenden Text (`currentColor`), nie eigene | `InUse` |

Beide rendern `aria-hidden="true"` — das Wort steht daneben (T8), der
`IconButton` trägt sein `aria-label` selbst. Es gibt bewusst **keine**
`label`-Prop: eine Komponente, die das Wort zeichnet, würde T8 an die
falsche Stelle verlagern.

Typen aus `src/ludwig/`: keine — die Schlüssel sind GLOSSARY-Namen, keine
Datenmodell-Typen. Ein `EntityKey`, für den das GLOSSARY keinen englischen
Namen hat, ist ein Befund.

**Kann bewusst nicht:** ein beliebiges Lucide-Icon rendern (kein `icon`-Prop
als Hintertür — sonst ist die Registry Dekoration); färben; ein Wort
schreiben; einen Zustand zeigen (`StateIcon`).

## Verhalten

Server-Components, kein Zustand, kein Hover, kein Fokus — ein Zeichen ist
Beschriftung. Größe und Strich kommen aus der Komponente, nicht vom
Aufrufer: `size` ist auf die Leiter beschränkt, `strokeWidth` ist 1.5 und
kein Prop. Zustände gefüllt · leer · lädt · Fehler gibt es nicht; ein
unbekannter Schlüssel ist ein Typfehler.

**Wächter-Test** (`icons.test.ts`, wie `stufen.test.ts`): jedes Icon, das
eine Datei unter `src/ui/v3` aus `lucide-react` importiert, steht in
`ENTITY_ICON` oder `ACTION_ICON`, oder die Datei ist `Icons.tsx` oder
`Review.tsx` (`StateIcon`). Der Test benennt Datei und Icon. Er ist das,
was „einmal festschreiben, später verwenden" hält.

**Umzug im Set** (Teil dieses Pakets): `StatusInfoButton` → `info`;
`Link`/`AccountCell` → `open` bzw. `external` (je nachdem, ob das Ziel in
Ludwig liegt); `Pagination`/`RecordPager` → `back`/`forward`;
`Dialog`/`Drawer` → `close`; `OverflowMenu` → `more`; `Disclosure`/
`ExpandableRow` → `expand`/`collapse`; `FilterBar` → `filter`;
`SearchInput` → `search`; `DataTable` → `sort-asc`/`sort-desc`; `Wizard`
→ `confirm` (erledigt) und der Fehlerfall bleibt `StateIcon` oder
`CircleAlert` laut 0079. `entity-icons.ts` bezieht `ENTITY_ICON` über
`AXIS_ENTITY: Partial<Record<StatusAxis, EntityKey>>` (`beleg` →
`source-document`, `sachverhalt` → `accounting-case`, `buchung` →
`journal-entry`) aus der Registry. Was der Wächter danach noch meldet, wird
eingeordnet oder bekommt einen Namen — nicht ausgenommen.

## Stories

Titel `v3/Grundlagen/Icons` — die bestehende Story (0055) wird umgebaut,
nicht verdoppelt. Ihre Abschnitte „richtig / Ausnahme / falsch" und
„Typografische Zeichen" bleiben.

| Story | Beweist |
|---|---|
| `Entities` | Tabelle aus `ENTITY_ICON`: Zeichen, Schlüssel, Wort, wo es steht (Sidebar, Zelle, Kopf) — aus der Registry gerendert, keine Hand-Liste |
| `Actions` | Tabelle aus `ACTION_ICON`: Zeichen, Schlüssel, Wort, Bedeutung, „stattdessen"; `remove` und `close` nebeneinander mit dem Satz, warum ein Zeichen zwei Namen hat |
| `Sizes` | Ein Zeichen in 12/14/16 (produktiv) und 16/20/24 (lesend) neben Text der jeweiligen Stufe — die Leiter A8 |
| `InUse` | `RowActions` mit `open` · `peek` · `more`; `EntityHeader` mit `EntityIcon`; `StatusBadge` mit dem Entitäts-Zeichen; ein `IconButton close` — vier Aufrufer, eine Quelle |

Nicht anwendbare Zustände: leer, lädt, Fehler (Begründung im Verhalten).
Der Abschnitt „Von v3 benutzt, aber in keiner Bedeutungsgruppe" entfällt —
der Wächter-Test übernimmt ihn.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die App speist `mandant-nav.ts` aus `ENTITY_ICON` | keine Prop — ein Import drüben | E1-Paket der App, Register §E |
| Eine Entität bekommt eine Zweitform (z. B. Rechnung neben Beleg) | ein weiterer `EntityKey` | die Entitäts-Familie fragt danach |
| Lesendes Register (`/portal`) mit 16/20/24 | `size` kennt die Werte schon | die erste lesende Seite wird gebaut (W4) |

## Befunde für `ludwig/app`

- **B1** — `ui/components/layout/mandant-nav.ts` hält die Entitäts-Icons
  als eigene Tabelle (Receipt, Layers, Layers2, Landmark, Building2,
  ListTree, Database, FileClock, Inbox, HelpCircle, Settings). Nach 0087
  kommen sie aus `ENTITY_ICON`; Nicht-Entitäten (Übersicht, Konfiguration,
  Hilfe) aus `ACTION_ICON` oder bleiben App. Register: E-Zeile.
- **B2** — Welches Zeichen der **Mandant** trägt, ist nirgends festgelegt
  (`Building2` ist in der Sidebar der Geschäftspartner). Frage 3.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `ENTITY_ICON` führt jede Entität der GLOSSARY-Schichten-Tabelle, die eine UI-Form hat; jede Wahl, die nicht aus Sidebar oder Story 0055 stammt, steht mit Grund in dieser Spec (Story `Entities`)
- [ ] `ACTION_ICON` führt alle Schlüssel der Tabelle oben mit `label` und `meaning`; `remove` und `close` teilen das Zeichen und stehen als zwei Namen (Story `Actions`)
- [ ] `size` nimmt nur 12/14/16/20/24; `strokeWidth` ist 1.5 und kein Prop; `aria-hidden` gesetzt (Story `Sizes`)
- [ ] Kein `icon`-Prop, kein `label`-Prop — die zwei Ausschlüsse stehen im Kopfkommentar
- [ ] `icons.test.ts` schlägt fehl, wenn eine Datei unter `src/ui/v3` ein Lucide-Icon importiert, das nicht in der Registry steht (Ausnahmen: `Icons.tsx`, `Review.tsx`); Nachweis: ein absichtlich falscher Import lässt ihn rot werden
- [ ] Die Bausteine aus „Umzug im Set" importieren ihr Zeichen aus der Registry; `grep -rl "from \"lucide-react\"" src/ui/v3` nennt danach nur `Icons.tsx`, `Review.tsx` und die Stories der Grundlagen
- [ ] `entity-icons.ts` hat kein eigenes `ENTITY_ICON` mehr; `StatusBadge` zeigt dasselbe Zeichen wie vorher (Story `StatusBadge` unverändert)
- [ ] `Icons.stories.tsx` rendert `Entities` und `Actions` aus den Tabellen; keine Hand-Liste `GROUPS` mehr
- [ ] `design-guidelines.md` A8/T8 verweisen auf die Registry als Quelle („welches Zeichen: `ACTION_ICON`, `ENTITY_ICON`")
- [ ] offen (App): `mandant-nav.ts` bezieht die Entitäts-Icons aus `ENTITY_ICON`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. `open` als `ArrowUpRight` und `external` als `ExternalLink` — oder beides
   `ExternalLink`, wie `Link` es heute nutzt? *Ohne Antwort: getrennt; der
   schräge Pfeil bleibt in Ludwig, der Kasten mit Pfeil verlässt es.*
2. `peek` als `PanelRight` — oder `Eye`? *Ohne Antwort: `PanelRight`; es
   zeigt, was passiert (ein Panel rechts), nicht was man tut.*
3. Welches Zeichen trägt der **Mandant**, wenn `Building2` der
   Geschäftspartner ist? *Ohne Antwort: `Briefcase` für den Mandanten,
   `Building2` bleibt beim Partner — die Sidebar hat es so eingeführt.*
