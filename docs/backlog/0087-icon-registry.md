# 0087 · IconRegistry — welches Zeichen was bedeutet

| | |
|---|---|
| Status | fertig |
| Stufe | **Grundlagen-Ebene** `src/ui/v3/Icons.tsx`, neben `format.ts`. Die Spec schrieb `patterns/` — warum das nicht trägt, steht unter „Entscheide des Bauenden" |
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
- **B3** — **`Building2` ist doppelt vergeben.** Die Sidebar
  (`mandant-nav.ts`) führt es als **Geschäftspartner**, die Story 0055 in der
  Gruppe „Wer ist dran" als **Kanzlei**. Die Registry folgt der Sidebar — sie
  ist das Produkt — und gibt der Kanzlei `Scale`. Wer die Sidebar auf
  `ENTITY_ICON` umstellt (B1), stellt damit auch das gerade.

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

## Mängel des ersten Durchgangs — behoben

Die Abnahme vom 2026-09-05 hat sechs Mängel gefunden; alle sechs sind behoben,
die Aufgabe geht zurück in die Abnahme.

| # | Mangel | Behoben durch |
|---|---|---|
| M1 | Die Story `InUse` fehlte — `className` hatte keinen Nachweis, und „vier Aufrufer, eine Quelle" war nirgends zu sehen | `InUse` in `Icons.stories.tsx`: `RowActions` mit `open` · `peek` · `more`, `EntityHeader` mit `EntityIcon`, zwei `StatusBadge` und ein `IconButton close` |
| M2 | `ExpandableRow` zeichnete seinen Pfeil weiter als CSS-Form `.v2chev`; der Wächter kann das nicht melden, weil kein Import da ist, und T9 lässt einen Pfeil als Bedeutungsträger nur als Lucide-Zeichen zu | `.v2chev--icon` nimmt die gezeichneten Kanten zurück und dreht stattdessen ein `ActionIcon collapse`. Die gezeichnete Fassung bleibt, bis `JournalEntryEditor` nachzieht — die Datei gehört einer anderen Sitzung und steht ohnehin in `PENDING` |
| M3 | Die Hand-Liste `GROUPS` stand samt `GROUPED`, `UNGROUPED` und `Glyph` als toter Code in der Story | gelöscht; dabei sind 33 ungenutzte Lucide-Importe der Story mitgefallen, es bleiben neun |
| M4 | `design-guidelines.md` A8 nannte `patterns/Icons.tsx` — den Pfad, den der Bauende selbst verworfen hat | A8 nennt jetzt `src/ui/v3/Icons.tsx` samt Grund |
| M5 | Kommentare und JSDoc in `Icons.tsx` und im Wächter waren deutsch, obwohl CLAUDE.md „Code englisch" verlangt | beide übersetzt. `label`, `meaning` und `instead` bleiben deutsch — das ist der Text, den die Story anzeigt, und der Kopfkommentar sagt das jetzt ausdrücklich |
| M6 | `Process.tsx` widersprach der Registry: Kanzlei `Building2` (dort der Geschäftspartner), Mandant `UserRound` (dort der Benutzer) | Zwei Schritte. **Erstens** war der Einwand gegen `Scale` berechtigt: die Waage steht in `AiBookingNotes` schon für die Quellenart Gesetz. Die Kanzlei trägt jetzt `Stamp` — kein zweites Haus neben dem Partner und keine zweite Waage. **Zweitens** bleibt `Process` ausgenommen, aber nicht folgenlos: der Umzug ändert seinen Vertrag, weil `Process` seine Zeichen färbt und eine freie `size` nimmt — beides gibt die Registry bewusst nicht her. Das ist eine eigene Aufgabe, **0088**, angelegt und mit dem Widerspruch als Auftrag. Die Ausnahme im Wächter nennt sie beim Namen |

Zwei Beobachtungen der Abnahme sind keine Mängel und bleiben stehen: der
Wächter ist über einen Tief-Import umgehbar (kommt nirgends vor; zwei Zeilen
Regex, wenn es je vorkommt), und die Zeile „Umzug im Set" nennt `Link`,
`AccountCell`, `FilterBar` und `SearchInput`, die in **diesem** Repo gar kein
Zeichen tragen — sie beschreibt den Stand in `ludwig/app`.

## Abnahme

Zweiter Agent, 2026-09-05, gegen Spec und Code — nicht gegen den Chat.
Storybook lief auf 6107; `pnpm build` wurde **nicht** erneut gestartet (es
schreibt `storybook-static`, und daneben laufen andere Abnahmen).

**Zweiter Durchgang** (2026-09-05, nach `2420952`): die sechs Mängel sind
nachgeprüft — fünf sind zu, einer hat einen Rest von vier Zeilen. Die
Nachweise unten stehen auf dem Stand nach der Nachbesserung.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` selbst gelaufen, ohne Ausgabe. `pnpm build` zitiert: der Lauf des Bauenden für diesen Stand meldete „Storybook build completed successfully". Zusätzlich `pnpm check:icons`: „in Ordnung. 52 Zeichen in der Registry, 2 Datei(en) noch offen." | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/Icons.tsx` + `Icons.stories.tsx` daneben; `title: "v3/Grundlagen/Icons"` (`Icons.stories.tsx:68`); Barrel-Gruppe „Grundlagen — das Vokabular, das jeder Baustein teilt" (`index.ts:229`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` an `EntityIcon` und `ActionIcon`; die zwei Tabellen tragen keins — dieselbe Form wie `STATUS_REGISTRY` (`status-registry.ts:1768`), Präzedenz trägt. Kopfkommentar, Feld-Doks und Komponenten-Prosa sind englisch, ebenso `scripts/check-icons.mjs`; der Kopf sagt auch, warum `label`/`meaning`/`instead` deutsch bleiben (angezeigter Text). Die vier `@when`/`@instead`-Zeilen selbst sind im dritten Durchgang nachgezogen — `grep -n "@when\|@instead" src/ui/v3/Icons.tsx` zeigt `:431`, `:433`, `:455`, `:456` englisch. Im Set bleiben sechs deutsche solcher Zeilen, alle in `StatusBadge.tsx`, `Badge.tsx`, `EmptyState.tsx` — Altdateien ohne Spec und ohne Abnahme, die CLAUDE.md ausdrücklich ausnimmt | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | keine Farbliterale und keine CSS-Maße in `Icons.tsx`; `size` sind ausschließlich die Leiterwerte (`IconSize`, `Icons.tsx:419`); `StatusBadge` holt sein Zeichen über `AXIS_ENTITY` (`entity-icons.ts:22`) aus der Registry, keine eigene Tabelle mehr | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `v3-grundlagen-icons--in-use` ist da und im Browser angesehen: `RowActions` mit `open` · `peek` · `more` (jedes mit Wort, T8), `EntityHeader` mit `EntityIcon accounting-case` 20 px als Kachel, zwei `StatusBadge` (Beleg, Sachverhalt) und ein `IconButton close`. Damit sind alle vier Stories der Spec vorhanden; `className` hat seinen Nachweis. Ausgeschlossene Zustände (leer, lädt, Fehler) sind unter „Verhalten" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen. Die CSS-Chevron ist weg (siehe „Umzug im Set"); einziger Treffer ist noch die Sprache der vier `@when`/`@instead`-Zeilen. Maße neben der Leiter stehen nur in ausgenommenen bzw. PENDING-Dateien (`Review.tsx:69` 15 px, `Process.tsx:117` Stroke 1,75, `AiBookingNotes.tsx:130` 13 px, `JournalEntryEditor.tsx:621` 13 px) — Story `Sizes` zeigt sie als „daneben", 0088 holt die von `Process` | ✓ |
| Im Browser angesehen (Storybook) | 6107 durchgesehen: `Entities` (21 Zeilen mit Zeichen, Schlüssel, Wort, Bedeutung), `Actions` (33 Bedeutungen, Abschnitt „Ein Zeichen, zwei Namen", „Nur in Stories" mit 12 Namen), `Sizes`, `WithWord`. Stichproben der umgezogenen Bausteine, im DOM ausgezählt: Dialog `Confirmation` und Drawer `Open` je `lucide-x` 16/1.5; Pagination `MiddlePage` `chevron-left`/`chevron-right` 16/1.5; Disclosure `Filled` `chevron-right` 14/1.5; DataTable `Filled` `arrow-down` 12/1.5 im sortierten Kopf + 50× `layers` 12/1.5; StatusBadge `CoreAxes` Receipt/Layers/BookOpen je 12/1.5; Wizard `States` `check` + `circle-alert` 14/1.5; StatusHeader `Filled` `info` 12/1.5; OverflowMenu `Filled` `chevron-down` 14/1.5 hinter dem Wort. Jedes Zeichen da, überall `stroke-width=1.5` und `aria-hidden=true`, nichts springt. Zweiter Durchgang: `InUse` und `ExpandableRow/Expandable` dazu, beide im sichtbaren Fenster geklickt (ein Messversuch im ausgeblendeten iframe log falsch — dort friert Chrome die Transition ein; die Prüfung gilt nur sichtbar) | ✓ |
| `ENTITY_ICON` führt jede Entität mit UI-Form; Wahlen ohne Vorgabe mit Grund in der Spec | Story `Entities`: 21 Einträge. Jede Familie unter `src/ui/v3/entities/` hat ihren Schlüssel (`source-document`, `accounting-case`, `journal-entry`, `clarification`, `account` → `ledger-account`), dazu `bank-transaction` (Profil in `docs/entitaeten/`). Der Rechnungs-Subtyp der Schichten-Tabelle ist mit Grund kein eigenes Zeichen (`Icons.tsx:117`). Ohne Zeichen und ohne UI-Form bleiben `client_accounting_event` und `client_journal_entry_line` — beide haben im Set keine Form; auffällig nur, dass `invoice-line` eins bekommt und die Buchungszeile nicht. Alle acht selbst gewählten Zeichen stehen mit Grund in „Entscheide des Bauenden"; `tenant` trägt seit dem zweiten Durchgang `Stamp` statt `Scale` — `Stamp` ist im ganzen Set sonst nicht vergeben (geprüft), die Waage bleibt `AiBookingNotes` | ✓ |
| `ACTION_ICON` führt alle Schlüssel mit `label`/`meaning`; `remove`/`close` zwei Namen | Story `Actions`: 33 Bedeutungen, jede mit Wort und Satz; alle Schlüssel der Spec-Tabelle vorhanden, dazu `ledger` und `alert` mit Grund. Abschnitt „Ein Zeichen, zwei Namen" stellt `remove` und `close` nebeneinander | ✓ |
| `size` nur 12/14/16/20/24; `strokeWidth` 1.5 und kein Prop; `aria-hidden` | `IconSize` (`Icons.tsx:419`); `strokeWidth={1.5}` fest verdrahtet in beiden Komponenten, kein Prop; `aria-hidden="true"` gesetzt. Nachweis der Leiter am Baustein steht im Abschnitt „Die Leiter" der Story `Actions` (12/14/16/20/24 über `EntityIcon`) — `Sizes` blieb die 0055-Leiter mit rohen Zeichen und misst zusätzlich, was der Code tut | ✓ |
| Kein `icon`-Prop, kein `label`-Prop — Ausschlüsse im Kopfkommentar | `Icons.tsx:424–429`, im Kopf von `EntityIcon` (nicht im Datei-Kopf, aber dort, wo die Props stünden); `ActionIcon` verweist darauf zurück | ✓ |
| Wächter wird rot bei einem Import an der Registry vorbei | selbst geprüft, beide Zweige, beide Änderungen zurückgenommen: (1) `import { Rocket } from "lucide-react"` in `primitives/Dialog.tsx` → „✗ primitives/Dialog.tsx importiert an der Registry vorbei: Rocket", Exit 1. (2) Eine tote `PENDING`-Zeile → „✗ primitives/Dialog.tsx steht in PENDING, importiert aber nichts mehr — Zeile streichen.", Exit 1. Der Wächter ist **strenger** als die Spec: er meldet jeden direkten Lucide-Import, nicht nur unbekannte Namen. Umgehbar bleibt nur ein Tief-Import (`lucide-react/dist/…`) oder `import * as` — beides kommt im Repo nicht vor | ✓ |
| Umzug im Set; `grep` nennt danach nur Registry, `Review.tsx`, Grundlagen-Stories | 18 Dateien beziehen ihr Zeichen über `EntityIcon`/`ActionIcon`. Direkt aus `lucide-react` importieren außerhalb von Stories nur noch `Icons.tsx`, `Review.tsx`, die drei Vokabular-Dateien und die zwei PENDING-Dateien. `ExpandableRow` zieht seinen Pfeil jetzt aus der Registry (`ExpandableRow.tsx:92–93`: `ActionIcon collapse` 12 px in `.v2chev--icon`); im Browser gemessen, ein voller Zyklus auf/zu: zu `rotate(0°)` mit `chevron-right`, auf `rotate(90°)`, wieder zu `rotate(0°)` — die Drehung ist umkehrbar, und der optische Mittelpunkt bleibt bei beiden Zuständen auf derselben Stelle, der Pfeil springt also nicht. Die gezeichnete `.v2chev` steht nur noch für `JournalEntryEditor` (PENDING). (`Link`, `AccountCell`, `FilterBar`, `SearchInput` aus derselben Liste tragen in diesem Repo gar kein Zeichen; `Link` hat nie eins importiert. Da war nichts umzuziehen.) | ✓ |
| `entity-icons.ts` ohne eigenes `ENTITY_ICON`; `StatusBadge` zeigt dasselbe Zeichen | `entity-icons.ts` trägt nur noch `AXIS_ENTITY`, `AXIS_LABEL`, `ENTITY_LABEL`, `AXIS_SOURCE`; Story `StatusBadge/CoreAxes` unverändert, im DOM Receipt/Layers/BookOpen je 12 px statt vorher 12,5 — die Angleichung an A8 steht mit Grund in „Entscheide des Bauenden" | ✓ |
| `Icons.stories.tsx` rendert aus den Tabellen; keine Hand-Liste `GROUPS` | `grep GROUPS\|GROUPED\|UNGROUPED\|function Glyph` in `Icons.stories.tsx` findet nichts mehr; gerendert wird aus `Object.entries(ENTITY_ICON)` bzw. `ACTION_ICON`. Von den Lucide-Importen der Story bleiben neun (`AlertTriangle`, `Check`, `ChevronLeft`, `ChevronRight`, `Circle`, `FileText`, `Trash2`, `X` und der Typ) — sie tragen `Sizes` und `WithWord`. Kleinigkeit: `type LucideIcon` hat nach dem Aufräumen keinen Verwender mehr | ✓ |
| `design-guidelines.md` A8/T8 verweisen auf die Registry | T8 (`design-guidelines.md:167`) verweist auf `label` „in der Registry … (0087)"; A8 (`:606`) nennt jetzt `src/ui/v3/Icons.tsx` und sagt dazu, warum sie auf der Grundlagen-Ebene liegt und nicht in `patterns/` | ✓ |
| `mandant-nav.ts` bezieht die Entitäts-Icons aus `ENTITY_ICON` | — | offen (App) |

### Die fünf Abweichungen von der Spec

| Abweichung | Urteil |
|---|---|
| Registry in `src/ui/v3/Icons.tsx` statt `patterns/` | **gedeckt.** Die Begründung hält nachprüfbar: acht Primitives beziehen ihr Zeichen aus der Registry (`Dialog`, `Drawer`, `Pagination`, `RecordPager`, `PageHeader`, `Combobox`, `Disclosure`, `OverflowMenu`), und nach dem Umzug importiert kein Primitive aus `patterns/` außer den zwei `useHotkeys`-Fällen (`RecordPager.tsx:5`, `Selection.tsx:5`) — die es vorher schon gab. Ein Vokabular auf der Ebene von `format.ts` passt zur Story-Gruppe „Grundlagen". Einziger Nachzug: A8 nennt noch den alten Pfad (M4) |
| Wächter als `scripts/check-icons.mjs` statt `icons.test.ts` | **gedeckt und wirksam.** Kein Test-Runner im Repo nachgeprüft: `package.json` hat kein `test`-Script, kein `vitest`/`jest` in den Abhängigkeiten, und es gibt keine einzige `*.test.ts` außerhalb von `node_modules` — auch `stufen.test.ts`, auf das die Spec verweist, existiert nicht. Wirksamkeit selbst getestet, beide Zweige rot (siehe Tabelle); der Kommentar im Skript sagt, dass die Prüfung bei einem Runner umzieht |
| Stories vom Wächter ausgenommen | **gedeckt.** Die Begründung ist im Produkt messbar: die Story `Actions` listet 12 Zeichen, die ausschließlich Stories importieren (`LayoutDashboard`, `PackageCheck`, `Inbox`, `Settings`, …) — Registry-Einträge dafür wären Einträge ohne Aufrufer. Dass das Abnahmekriterium („grep nennt nur …") damit auf Komponenten gemünzt zu lesen ist, steht in der Spec; die Story „Nur in Stories" ist die Gegenkontrolle, die verhindert, dass die Ausnahme unbemerkt wächst |
| Drei Vokabular-Dateien ausgenommen | **teilweise.** `CaseTimeline` (`client_accounting_event.kind`) und `AiBookingNotes` (Quellenart) tragen: das sind Aufzählungen aus dem Datenmodell, kein Zeichen je Bedeutung. `Process.tsx` trägt **nicht**: von seinen acht Staffelstäben sind vier Dinge, die die Registry bereits benennt, und zwei widersprechen ihr — `kanzlei: Building2` (`Process.tsx:73`), obwohl die Registry für `tenant` ausdrücklich sagt „nicht `Building2`, das trägt der Geschäftspartner" (Befund B3), und `mandant: UserRound`, obwohl `UserRound` in der Registry der `user` ist und der Mandant `Briefcase` trägt. Damit steht die Drift, die 0087 beenden soll, weiter im Set. Dazu: `Scale` war doppelt vergeben — `tenant` in der Registry und „Gesetz" in `AiBookingNotes.tsx:42`, und ausgerechnet diese Stelle diente als Begründung für `tenant`. **Nach dem zweiten Durchgang:** die Doppelvergabe ist weg (`tenant` = `Stamp`), und der Widerspruch von `Process` ist als **0088** mit Auftrag und Begründung angelegt — der Umzug ändert dessen Vertrag (`Process` färbt seine Zeichen und nimmt eine freie `size`, beides gibt die Registry bewusst nicht her), das ist zu Recht eine eigene Aufgabe. Die Wächter-Ausnahme nennt 0088 beim Namen (`check-icons.mjs:35`), ist damit datiert statt dauerhaft. Bleibt für 0088: solange sie offen ist, zeigt das Set Kanzlei und Mandant an zwei Stellen verschieden |
| `OverflowMenu` bekommt `expand` statt `more` | **der Bauende hat recht.** Im Browser nachgesehen: der Trigger ist ein `<summary>` mit sichtbarem Wort („Mehr") und dahinter `chevron-down` 14/1.5. T8 schließt Kebab-Menüs von der Icon-only-Ausnahme ausdrücklich aus und schickt sie an `OverflowMenu` „mit sichtbarem Wort" — ein Chevron hinter einem beschrifteten Knopf sagt „klappt auf". `more` bleibt für die Zeile, die wirklich nur drei Punkte trägt; ein Registry-Eintrag ohne heutigen Aufrufer ist hier kein Fehler, die Spec-Tabelle nennt mehrere davon |

**Die sechs Mängel des ersten Durchgangs, nachgeprüft:**

| # | Stand nach `2420952` | Nachweis |
|---|---|---|
| M1 | behoben | `v3-grundlagen-icons--in-use` im Storybook-Index und im Browser gesehen — vier Aufrufer, jeder mit Wort |
| M2 | behoben | `ExpandableRow.tsx:92–93` nimmt `ActionIcon collapse`; im sichtbaren Fenster einen Zyklus geklickt: 0° → 90° → 0°, umkehrbar, Mittelpunkt bleibt stehen |
| M3 | behoben | `GROUPS`, `GROUPED`, `UNGROUPED`, `Glyph` sind aus `Icons.stories.tsx` verschwunden; neun Lucide-Importe bleiben |
| M4 | behoben | `design-guidelines.md:606` nennt `src/ui/v3/Icons.tsx` mit Grund |
| M5 | behoben (zwei Durchgänge) | Datei-Kopf, Feld-Doks, Komponenten-Prosa und der Wächter im zweiten; die vier `@when`/`@instead`-Zeilen im dritten — `grep -n "@when\|@instead" src/ui/v3/Icons.tsx` zeigt vier englische Zeilen |
| M6 | behoben | `tenant` = `Stamp` (im Set sonst unvergeben), damit ist die `Scale`-Doppelvergabe weg; der Widerspruch von `Process` steht als Aufgabe **0088** mit Auftrag, und die Wächter-Ausnahme nennt sie (`check-icons.mjs:35`) |

**Der Rest des zweiten Durchgangs, nachgeprüft:** die vier `@when`/`@instead`-Zeilen
an `EntityIcon` und `ActionIcon` sind englisch (`Icons.tsx:431`, `:433`, `:455`,
`:456`); `type LucideIcon` ist aus `Icons.stories.tsx` verschwunden; die
Kopfzeile „Stufe" dieser Spec nennt die Grundlagen-Ebene statt `patterns/`.
Damit sind alle sechzehn Kriterien ✓.

**Was mit der Aufgabe nicht mitgeht:**

- **offen (App)** — `mandant-nav.ts` bezieht seine Entitäts-Icons weiter aus
  einer eigenen Tabelle; das ist die E-Zeile im Register der App (Befund B1).
- **Aufgabe 0088** — solange sie offen ist, zeigt das Set Kanzlei und Mandant
  an zwei Stellen verschieden: die Registry `Stamp` und `Briefcase`, der
  Staffelstab in `Process.tsx` `Building2` und `UserRound`. Der Wächter nennt
  die Aufgabe in seiner Ausnahme, die Ausnahme fällt mit ihr.
- **Zwei PENDING-Dateien** — `SourceDocumentDrawer.tsx` und
  `JournalEntryEditor.tsx` importieren noch direkt; die Liste schrumpft und
  wächst nie, und eine tot gewordene Zeile meldet der Wächter als Fehler
  (selbst ausprobiert).

Abgenommen von / am: **Claude, Abnahme-Agent, 2026-09-05** (dritter Durchgang;
gebaut hat ein anderer Agent). Nachweise in der Tabelle oben: eigene Läufe von
`pnpm typecheck` und `pnpm check:icons`, der zitierte grüne `pnpm build`, der
selbst rot gemachte Wächter in beiden Zweigen, und Storybook auf 6107 —
`Entities`, `Actions`, `Sizes`, `WithWord`, `InUse` sowie zehn umgezogene
Bausteine im Browser gemessen. · Offene Punkte: keine im Set; „offen (App)"
`mandant-nav.ts` und die Nachfolge-Aufgabe 0088.

## Offene Fragen

Alle drei am 2026-09-05 mit ihrem Default entschieden.

1. `open` als `ArrowUpRight` und `external` als `ExternalLink` — oder beides
   `ExternalLink`, wie `Link` es heute nutzt? *Ohne Antwort: getrennt; der
   schräge Pfeil bleibt in Ludwig, der Kasten mit Pfeil verlässt es.*
   **Entschieden (Default):** getrennt. Beide tragen ihr `instead` und
   verweisen aufeinander — der Unterschied ist genau der, den ein Mensch vor
   dem Klick wissen will.
2. `peek` als `PanelRight` — oder `Eye`? *Ohne Antwort: `PanelRight`.*
   **Entschieden (Default):** `PanelRight`. Es zeigt, **was passiert** (ein
   Panel rechts), nicht was man tut; `Eye` verspricht Sehen und sagt nichts
   darüber, wo.
3. Welches Zeichen trägt der **Mandant**? *Ohne Antwort: `Briefcase`.*
   **Entschieden (Default):** `client` = `Briefcase`, `partner` bleibt
   `Building2`.

## Entscheide des Bauenden

**Die acht Entitäten ohne Vorgabe.** Die Spec überlässt sie dem Bauenden;
hier stehen sie mit Grund:

| `EntityKey` | Zeichen | Grund |
|---|---|---|
| `tenant` (Kanzlei) | `Stamp` | Die Sidebar hat kein Zeichen für die Kanzlei, und die Story 0055 führt für sie `Building2` — das ist in der Sidebar der Geschäftspartner (Befund B3). Zwei Häuser nebeneinander unterscheidet niemand. **Korrigiert nach der ersten Abnahme:** die erste Wahl `Scale` war ebenfalls doppelt vergeben, die Waage steht in `AiBookingNotes` für die Quellenart Gesetz. Der Stempel ist das, was eine Kanzlei tut und sonst niemand |
| `user` | `UserRound` | Story 0055, Gruppe „Wer ist dran" — dort steht es für den Menschen |
| `job` | `Cog` | Ein Hintergrundprozess, kein Mensch und kein Agent; `Bot` ist in `ACTION_ICON` schon der Agent |
| `fiscal-year` | `CalendarRange` | Ein **Zeitraum**, keine Datum. `Calendar` allein läse sich als Tag |
| `integration` | `Plug` | Eine angebundene Quelle; das Kabel ist die Metapher, die die Sidebar-Sprache („Bank-Anbindung") ohnehin nutzt |
| `recurring-rule` | `Repeat` | Story 0055, Gruppe „Fachwelt" |
| `contract` | `FileSignature` | Ein Beleg mit Unterschrift — unterscheidet ihn vom `Receipt` des Belegs, ohne eine zweite Belegfamilie aufzumachen |
| `invoice-line` | `List` | Eine Zeile in einer Aufstellung; bewusst schlicht, sie steht nie allein |

**Zwei Einträge mehr in `ACTION_ICON`, als die Spec-Tabelle nennt** — beide
kamen aus dem Bestand, nicht aus dem Wunsch:

- `ledger` (`BookOpenText`, „Kontenblatt") — `AccountField` öffnet damit die
  Bewegungen eines Kontos. Ohne den Eintrag hätte die Datei weiter direkt
  importiert.
- `alert` (`CircleAlert`, „Achtung") — `Wizard` (0079) zeigt damit den
  gescheiterten Schritt. Die Spec verweist dafür auf 0079; der Name gehört
  trotzdem ins Vokabular, sonst steht er nirgends.

**Der Wächter ist ein Skript, kein Test.** Die Spec nennt `icons.test.ts`
„wie `stufen.test.ts`" — beides gibt es nicht: dieses Repo hat **keinen
Test-Runner** (kein `vitest`, kein `test`-Script, keine einzige `*.test.ts`).
Ein Runner als Abhängigkeit für dreißig Zeilen Prüfung wäre die falsche
Richtung. Der Wächter ist `scripts/check-icons.mjs`, Aufruf `pnpm
check:icons`, Exit 1 mit Datei und Zeichen. Er liest die erlaubten Namen aus
der Import-Liste von `Icons.tsx` selbst — es gibt keine zweite Liste. Bekommt
das Repo je einen Runner, zieht die Prüfung als `icons.test.ts` um; der
Kommentar im Skript sagt das.

**Stories sind vom Wächter ausgenommen.** Eine Story *zeigt* ein Zeichen, sie
liefert es nicht aus: `NavList.stories` deutet eine Sidebar an,
`EmptyState.stories` einen Leerzustand. Den Wächter auf sie auszudehnen
erzwänge Registry-Einträge wie `LayoutDashboard` und `PackageCheck`, die kein
Baustein je benutzt — die Registry würde von ihrer eigenen Vorführung
aufgebläht. Ausgeliefert wird die Komponente daneben, und die prüft das
Skript. Das Abnahmekriterium „`grep` nennt danach nur `Icons.tsx`,
`Review.tsx` und die Grundlagen-Stories" ist damit auf **Komponenten**
gemünzt zu lesen; die Story-Datei bleibt frei.

**Drei Vokabular-Dateien bleiben, wo sie sind** — aus demselben Grund, aus
dem `StateIcon` bleibt: sie beschreiben je eine **fachliche Aufzählung**,
deren Werte aus dem Datenmodell kommen, nicht ein Zeichen für eine Bedeutung.
Wer sie herzöge, müsste die Aufzählung mitziehen.

| Datei | Aufzählung |
|---|---|
| `patterns/Process.tsx` | wer an der Reihe ist: Agent, Kanzlei, Mandant, System |
| `entities/accounting-case/CaseTimeline.tsx` | die Ereignisart (`client_accounting_event.kind`) |
| `entities/journal-entry/AiBookingNotes.tsx` | die Quellenart einer Aussage: Bank, Beleg, Regel, Gesetz, Web |

Sie stehen namentlich im Wächter und im Kopfkommentar der Registry. Jede
weitere Datei muss in die Registry.

**Die Registry liegt nicht in `patterns/`, sondern eine Ebene höher:**
`src/ui/v3/Icons.tsx`, neben `format.ts`. Die Spec sagt `patterns/` — das
hält nicht: acht **Primitives** brauchen ein Zeichen (`Dialog`, `Drawer`,
`Pagination`, `RecordPager`, `PageHeader`, `Combobox`, `Disclosure`,
`OverflowMenu`), und „Primitives kennen keine Patterns" ist eine der drei
Regeln der Dreiteilung. Acht systematische Ausnahmen sind keine Ausnahme
mehr, sondern eine falsche Einordnung. Ein Vokabular, das alle drei Stufen
teilen, ist eine **Grundlage** — dieselbe Ebene, auf der `format.ts` schon
liegt, und dieselbe, auf der die Story `v3/Grundlagen/Icons` steht. Nach dem
Umzug importiert kein Primitive mehr aus `patterns/`, außer den zwei
`useHotkeys`-Fällen, die es vorher schon gab.

**`OverflowMenu` bekommt `expand`, nicht `more`.** Die Spec-Tabelle nennt
`more`; das wäre `Ellipsis`. Der Trigger des `OverflowMenu` trägt aber ein
**sichtbares Wort** und dahinter ein Chevron — genau das verlangt T8, und die
Ausnahme für Icon-only-Knöpfe schließt Kebab-Menüs ausdrücklich aus. Ein
Chevron an einem beschrifteten Knopf heißt „klappt auf", nicht „hier ist mehr
verborgen". `more` bleibt in der Registry für den Fall, dass eine Zeile
einmal wirklich nur drei Punkte trägt.

**`StatusBadge` zieht sein Entitäts-Zeichen auf die Leiter.** Es stand auf
`size 12.5` und `strokeWidth 1.75` und lief über die abgeleitete Tabelle in
`entity-icons.ts` an der Registry vorbei. Jetzt `EntityIcon` mit `size 12`
über `AXIS_ENTITY` — A8 sagt, Abweichler kommen beim nächsten Anfassen auf
die Leiter, und dies war das nächste Anfassen. Damit hat die abgeleitete
Tabelle `ENTITY_ICON` in `entity-icons.ts` keinen Aufrufer mehr und ist
gelöscht; `AXIS_ENTITY` bleibt als die eine Abbildung Achse → Entität.
`AccountEntries` zeichnet sein Zeichen ebenfalls über `EntityIcon`.

**Noch nicht umgezogen** (`PENDING` im Wächter, je mit Grund und Datum):
`SourceDocumentDrawer.tsx` (0075/0076 in Arbeit in einer anderen Sitzung) und
`JournalEntryEditor.tsx` (uncommittete Änderungen einer anderen Sitzung). Die
Liste schrumpft und wächst nie; wer eine Datei umzieht, streicht ihre Zeile.
Der Wächter meldet eine Zeile, die nichts mehr importiert, als Fehler — eine
tote Ausnahme fällt damit auf.

**Status-Nachtrag 2026-09-05.** Der Zusatz im Statusfeld steht jetzt hier:
abgenommen am 2026-09-05 im dritten Durchgang; offen bleibt allein die
App-Zeile `mandant-nav.ts`, und die gehört nach `docs/befunde-app.md`, nicht in
den Status.
