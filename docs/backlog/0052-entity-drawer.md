# 0052 · Entity-Drawer — die Nachschlag-Form der Entitäts-Familie

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/<entität>/` je Drawer; der Rahmen steht als `primitives/Drawer` (0042) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → das **Zonen-Schema** ja (fachfrei, deshalb Regel, nicht Komponente); der **einzelne Drawer** nein, er zeigt eine Ludwig-Entität → `entities/` |
| Quelle | Design-Brief `F143-entitaets-drawer-design-brief.md` aus `ludwig/app/docs/backlog/` (Owner 2026-09-03), hier von v2-Gestaltungsauftrag auf v3-Entwicklungsaufgabe umgeschrieben · `docs/v3-backlog.md` (Drawer-Familie, 29 Importstellen) |
| Ersetzt | die sechs Drawer in `app/apps/web/src/ui/drawers/`: Beleg · Kontenblatt · Kontoauszugsposition · Ludwig-Buchungssatz · DATEV-Buchungssatz · technische Rohzeile |
| Blockiert | die Drawer-Umzüge der Welle 1 · jeden Verweis, der heute kein Ziel hat (0013 Kontenblatt-Icon, 0014 OPOS-Browser) |
| Setzt voraus | 0042 `Drawer` (Abnahme) · je Entität deren `View` und die kleineren Formen — für den ersten Drawer 0050 `CaseDetailView` |
| Spec von / am | Claude, 2026-09-03 |
| Nachtrag 2026-09-04 | Die beiden Exporte heißen seit dem Beleg-Familien-Schnitt **`SourceDocumentDrawer`** und **`SourceDocumentFacts`**, der Ordner `entities/source-document/` (Owner: „Document ist ein Name, der oft in use ist"). Das Abnahmeprotokoll unten nennt weiter die Namen und Zeilennummern, die zur Abnahme galten — es ist ein Protokoll, kein Verweis |
| Gebaut von / am | Claude, 2026-09-04 · nachgebessert 2026-09-04 (drei Punkte der ersten Abnahme) |

## Was sich gegenüber F143 ändert

Der Brief richtet sich an einen Gestalter und beschreibt v2-Artboards. Hier
ist derselbe Gegenstand eine Entwicklungsaufgabe im v3-Set.

| Im Brief | Hier |
|---|---|
| Adressat „claude design", Abgabe: Artboards auf einer Canvas, Ablage in `~/dev/ludwig/design-ergebnis` | Adressat Entwicklungsagent (`v3-komponente`), Abgabe: Komponenten + Stories unter `src/ui/v3/entities/`, sichtbar in Storybook |
| „v2-Optik", Regeln aus `ludwig-UX-guidelines-v2.md` | v3-Set, Regeln aus `docs/design-guidelines.md` und `docs/ton-und-sprache.md`. „v2" lebt im Set nur noch als CSS-Präfix `.v2*` weiter — die Optik heißt v3 |
| **A — der Rahmen ist zu gestalten** (Scrim, Kopf, Körper, Fuß, drei Breiten, Bewegung) | **entfällt, ist gebaut**: 0042 `Drawer` + `DrawerFooter`, `.v2drawer*` in `v3.css`, Breiten `--drawer-sm/md/lg`, Escape/Scrim/Kreuz, Fokus-Rückgabe. Offen bleibt aus A nur, wie die **vier Zustände** in dieser Hülle aussehen — das trägt der Inhalt, also dieser Auftrag |
| Größen S (`Cell`) · M (`Row`/`Card`) · XL (`View`), Drawer als „Hülle um XL-Inhalt" | v3-Leiter XS `Cell` · S `Row` · M `Card` · L `View`/**`Drawer`** · XL `Editor` (`entitaet-analysieren` §7). Der Drawer sitzt auf **L**, neben dem View: derselbe Rang-Umfang, andere Hülle und ein anderes Ziel |
| Name deutsch: `<Entität>Drawer`, z. B. `BelegDrawer`, `DatevBuchungssatzDrawer`, `RawRowDrawer` | **Code ist englisch** (CLAUDE.md): `DocumentDrawer`, `CaseDrawer`, `AccountLedgerDrawer`, `BankTransactionDrawer`, `JournalEntryDrawer`, `DatevJournalEntryDrawer`, `RawRecordDrawer`. Deutsch steht im Titel, den der Aufrufer setzt. Namen aus `docs/ludwig/GLOSSARY.md`, Präfix wie die übrigen Formen der Familie |
| „Es entsteht keine Komponente in `apps/web`" | gilt unverändert. Hier entsteht der Baustein, die App setzt später zusammen |
| Bestand (`ui/drawers/`, F113) als Beleg für den Bedarf und Inhalts-Vorlage | unverändert. Beim Übernehmen gilt Skill `aus-app-holen`: Verhalten mitnehmen, Optik nicht |

## Ziel

Die Buchhalterin prüft einen Sachverhalt und stolpert über einen Verweis auf
etwas anderes: „wie sah der Beleg dazu aus?", „was liegt sonst noch auf
6815?", „was steckt hinter dieser Auszugszeile?". Die Antwort ist ein Blick,
keine Reise — die Liste, in der sie steht, darf nicht verloren gehen.

Der Rahmen dafür steht seit 0042. Was fehlt, ist **der Inhalt und seine
Ordnung**: Heute weiß niemand, was in einem Entitäts-Drawer steht, in welcher
Reihenfolge und wo er aufhört. Die sechs Drawer der App haben das je einzeln
entschieden. Diese Aufgabe schreibt die Ordnung einmal fest und beweist sie an
zwei Entitäten — einer mit Original (Beleg) und einer ohne (Sachverhalt).

## Einordnung

- **Wiederverwenden:** `Drawer` (0042) ist die Hülle und bleibt es —
  `@when Looking at something existing next to a list … without leaving the
  list.` Der Inhalt kommt aus den Bausteinen, die die Familie ohnehin hat:
  `FieldList` (Kern-Fakten), `StatusBadge` + `status-registry`, `Amount`,
  `Time`, `Table`, `Skeleton`, `EmptyState`, `Callout`, `Button`.
- **Neu, weil:** Es gibt keinen Ort, an dem steht, welche Zonen ein
  Entitäts-Drawer hat. Ohne diese Regel baut jeder Drawer seine eigene.
- **Kein neues Pattern (bewusst):** `EntityDrawer` als `patterns/`-Baustein
  wird **nicht** gebaut, solange nur ein Entitäts-Drawer existiert —
  `spec-schreiben` §3 verlangt zwei Verwendungen. Nach dem zweiten Drawer wird
  geprüft, ob sich dieselben Zeilen wiederholen; erst dann eine eigene
  Aufgabe. Bis dahin ist das Zonen-Schema eine **Regel**, kein Code.
- **Zuschnitt:** je Entität eine Datei im Ordner der Familie
  (`entities/<slug>/<Entity>Drawer.tsx`), Story daneben. Kein Sammel-Modul.
- **Setzt auf:** `Drawer`, `DrawerFooter`, die Formen derselben Familie.

## Die Form im Raster — wann ein Drawer sinnvoll ist

`entitaet-analysieren` §7 kennt `<Entity>Drawer` in der L-Zeile, aber keine
Regel, die ihn empfiehlt. Sie kommt als **Regel 5** dazu:

> 5. Die Entität wird **mitten in der Arbeit an einer anderen** nachgeschlagen
>    — sie ist FK-Ziel (Regel 3) **und** eine fremde Ansicht verweist auf sie,
>    ohne sie zeigen zu können → Drawer. Das Profil nennt die verweisende
>    Stelle. Kein Verweis, keine Frage, kein Drawer: Eine Entität, die man nur
>    über ihre eigene Liste erreicht, braucht nur den View.

Damit bekommt die Formen-Tabelle jedes Entitätsprofils eine Zeile
`<Entity>Drawer` (Größe L, Empfehlung ja/nein, Grund) — neben Cell, Row, Card,
View, Editor. `docs/entitaeten/TEMPLATE.md` führt sie in der Vorlage mit.

Der Unterschied zum View in einem Satz: **Der View beantwortet alle Fragen zur
Entität, der Drawer beantwortet die eine, die woanders aufkam** — und bietet
für alles Weitere den Weg in den View an.

## Zonen-Schema

Das eigentliche Ergebnis. Es gilt für jeden `<Entity>Drawer`; eine Zone wird
weggelassen, nicht umsortiert.

| # | Zone | Was hineingehört | Baustein | Pflicht |
|---|---|---|---|---|
| 1 | Kopf | wie die Entität heißt, darunter die Kennung (Belegnummer, Kontonummer, Datum + Betrag) und der Zustand | `title` / `meta` des `Drawer`, `StatusBadge` | ja |
| 2 | Original | das Ding selbst, zuerst und groß: PDF-Seite, Auszugszeile im Wortlaut, Rohsatz. Hat die Entität keins, entfällt die Zone ersatzlos — **kein Platzhalter** | entitätseigen (Beleg: Vorschau; Rohzeile: `RawRecord`, 0051) | nein |
| 3 | Kern-Fakten | die Ränge bis L aus dem Entitätsprofil, in **derselben Reihenfolge wie im View** und aus **derselben Komponente** — keine zweite Feldliste | `FieldList`, `Amount`, `Time` | ja |
| 4 | Grenze | ein Satz, was der Schnellblick *nicht* beantwortet („Positionen, USt-Sätze und Konto-Splitting werden in der vollständigen Belegansicht geprüft.") | kleiner Text unter Zone 3, Ton nach `ton-und-sprache.md` | ja |
| 5 | Fuß | **genau eine** Aktion: der Weg in die Vollansicht. Kein zweiter Knopf, keine schreibende Aktion | `footer` des `Drawer` + `Button` | ja |

Vier Zustände, alle im Drawer selbst, in dieser Vorrangfolge:

| Zustand | Was steht da |
|---|---|
| lädt | ruhige Fläche in der Form des Inhalts (`Skeleton`), Kopf steht schon |
| Fehler | der Grund **mit der Kennung im Text**, nicht „Fehler beim Laden" |
| nicht gefunden | ein Satz mit Bezug (`EmptyState`), linksbündig, kein Ausrufezeichen |
| Inhalt | Zonen 1–5 |

## Schnittstelle (je `<Entity>Drawer`)

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` | `boolean` | ja | durchgereicht an `Drawer` | `Geoeffnet` |
| `onClose` | `() => void` | ja | Escape, Scrim, Kreuz | `Geoeffnet` |
| `reference` | `string` | ja | die Kennung, nach der gesucht wurde — steht im Kopf **und** in Fehler- und Leertext | `Fehler`, `NichtGefunden` |
| `record` | `<Entity> \| null` | ja | die Daten; `null` heißt **nicht gefunden**, nicht „lädt" | `Geoeffnet`, `NichtGefunden` |
| `loading` | `boolean` | nein | hat Vorrang vor `record` | `Laedt` |
| `error` | `ReactNode` | nein | hat Vorrang vor `loading` | `Fehler` |
| `onOpenFull` | `() => void` | ja | der eine Ausgang im Fuß | `Geoeffnet` |

Typen aus `src/ludwig/…`, Begriffe aus dem GLOSSARY: englisch im Code,
deutsch im Label.

**Was ein Entitäts-Drawer bewusst nicht kann:**

- **Schreiben.** Er ist lesend. Wer ändern will, geht in die Vollansicht.
  (Schreibende Slide-over gibt es — `JournalEntryEditor` und Verwandte —, die
  sind screen-lokal und nicht Gegenstand dieser Aufgabe.)
- **Laden.** Wie 0042: er bekommt `record`, `loading`, `error` fertig.
- **Sich selbst öffnen** oder das Routing kennen. `UrlDrawer` bleibt in der App.
- **Stapeln.** Einer zur Zeit. Ein Verweis im Drawer tauscht dessen Inhalt oder
  führt in die Vollansicht — keine zweite Ebene.

## Verhalten

Alles Rahmenverhalten kommt aus 0042 (Escape · Scrim · Kreuz · Fokus im
Drawer, beim Schließen zurück auf den Auslöser · Body scrollt, Kopf und Fuß
stehen · 300 ms Ausblenden). Dazu:

- `size` je Entität fest, nicht als Prop nach außen: `sm` reine Fakten ·
  `md` Detail · `lg` Dokument oder Tabelle.
- Client-Component, weil der Rahmen es ist.
- Kein Hex, kein px, keine lokale Label-Map; Status nur über
  `patterns/status-registry.ts`; Icons Lucide, nie ohne Wort; Beträge mit
  `tnum`, Zeiten Europe/Berlin.

## Stories — das Drawer-Preview der Familie

Titel `v3/Entitäten/<Entität>/<Entity>Drawer` (deutsch wie alle Storybook-Titel,
CLAUDE.md; 2026-09-04 hier korrigiert), damit die Form in der
Storybook-Gruppe der Entität **neben** Cell, Row, Card, View und Editor steht.
Genau das ist das „Drawer-Preview" neben den Größen-Previews.

| Story | Beweist |
|---|---|
| `Geoeffnet` | Zonen 1–5 mit echten Daten; Rundlauf über `onClose` und `onOpenFull` |
| `Laedt` | `loading` schlägt `record`; Kopf steht, Körper ist Fläche |
| `Fehler` | Grund **mit `reference` im Text** |
| `NichtGefunden` | `record={null}`, ein Satz mit Bezug |
| `ImKontext` | hinter dem Drawer eine Liste — der Kontext bleibt sichtbar, das ist der ganze Sinn |

## Umfang der ersten Runde

1. **Regel eintragen:** `entitaet-analysieren` §7 um Regel 5 ergänzen,
   `docs/entitaeten/TEMPLATE.md` um die Zeile `<Entity>Drawer`.
2. **Zonen-Schema** steht mit dieser Datei fest.
3. **`CaseDrawer`** (Sachverhalt) nach 0050 — der Prüfstein: eine Entität
   **ohne** Original. Trägt das Schema hier, trägt es überall.
4. **`DocumentDrawer`** (Beleg) — die Referenz aus F143 mit Zone 2, heute
   `apps/web/src/ui/drawers/BelegDrawer.tsx`.
5. **Danach je Entität eine eigene Aufgabe**, aus dem Profil abgeleitet, in
   der Reihenfolge der Wellen: Konto (Kontenblatt, `lg`),
   Kontoauszugsposition (`sm`), Buchungssatz (Ludwig und DATEV als zweite
   Wahrheit), Rohzeile (auf `RawRecord`, 0051).

Nach Schritt 4 wird geprüft, ob ein `EntityDrawer`-Pattern die Wiederholung
lohnt. Vorher nicht.

## Nicht im Auftrag

Implementierung in `apps/web` · Umbenennung der Bestands-Drawer dort
(`web-ui-offen.md` P26) · schreibende Slide-over · `UrlDrawer` und Routing ·
gestapelte Drawer · neue Entitäten oder Status-Achsen · Mobile.

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

- [ ] Regel 5 steht in `entitaet-analysieren` §7, die Drawer-Zeile in `docs/entitaeten/TEMPLATE.md`
- [ ] Jeder gebaute Drawer hat die Zonen 1, 3, 4, 5 in dieser Reihenfolge; Zone 2 nur, wenn es ein Original gibt (`Geoeffnet`)
- [ ] Zone 3 verwendet **dieselbe** Komponente wie der View der Entität — kein zweiter Satz Feldzeilen (Nachweis: Import im Drawer zeigt auf die Komponente des Views)
- [ ] Der Fuß trägt **genau eine** Aktion, und die führt in die Vollansicht (`Geoeffnet`)
- [ ] Kein Schreibpfad: keine Prop, die Daten ändert; keine Formularfelder (`Geoeffnet`)
- [ ] Alle vier Zustände in der Vorrangfolge `error` → `loading` → `record === null` → Inhalt (`Laedt`, `Fehler`, `NichtGefunden`)
- [ ] Der Fehlertext enthält `reference` wörtlich (`Fehler`)
- [ ] Der Drawer baut auf 0042 auf und definiert weder Scrim noch Kopf noch Fußleiste selbst
- [ ] Hinter dem offenen Drawer bleibt der Kontext sichtbar (`ImKontext`)
- [ ] `@instead` schickt weiter: alle Fragen zur Entität → `<Entity>View`, Entscheidung → `Dialog`, ein Satz → `Popover`
- [ ] Ersetzt `BelegDrawer` bzw. das Sachverhalts-Gegenstück in `apps/web/src/ui/drawers/` ohne Funktionsverlust — **offen (App)**, siehe `docs/backlog/README.md`

## Offene Fragen

1. **Reihenfolge der ersten beiden.** Sachverhalt zuerst (Entität ohne
   Original, härterer Prüfstein, hängt aber an 0050) oder Beleg zuerst (die
   fertige Referenz aus F143, sofort baubar)?
   *Ohne Antwort: Beleg zuerst* — er ist unblockiert, und §7 des Briefs nennt
   ihn als Muster. Der Sachverhalt folgt direkt nach 0050 und darf das Schema
   noch ändern.
2. **Breite bei `lg`.** F143 §7 lässt den Wert offen: „so breit, dass eine
   A4-Seite bei 100 % lesbar ist, aber links noch Kontext bleibt."
   *Ohne Antwort: `--drawer-lg` bleibt, wie 0042 es gesetzt hat* — geändert
   wird erst, wenn der `DocumentDrawer` am echten PDF zeigt, dass es klemmt.
3. **Zone 4 als eigener Baustein?** Der Grenz-Satz wiederholt sich in jedem
   Drawer. *Ohne Antwort: nein, erstmal Text* — nach dem zweiten Drawer
   zusammen mit der `EntityDrawer`-Frage entscheiden.

## Stand der ersten Runde (2026-09-04)

Gebaut wurden die Schritte **1, 2 und 4**; die drei offenen Fragen gelten
nach ihrem Default: Beleg zuerst · `--drawer-lg` bleibt · Zone 4 als Text.

| Schritt | Stand |
|---|---|
| 1. Regel eintragen | ✓ `entitaet-analysieren` §7 hat Regel 5, dazu ein Satz zur Bau-Reihenfolge („der Drawer folgt dem View"); `docs/entitaeten/TEMPLATE.md` führt die Zeile `<Entity>Drawer` in der Formen-Tabelle |
| 2. Zonen-Schema | ✓ steht mit dieser Datei; der gebaute Drawer hält die Reihenfolge 1 · 2 · 3 · 4 · 5 |
| 3. `CaseDrawer` | **ausgelassen** — 0050 `CaseDetailView` steht auf `spec — blockiert` (das Entitätsprofil `docs/entitaeten/accounting-case.md` fehlt). Ohne den View gäbe es die Zone-3-Komponente der Familie nicht, und genau die soll der Drawer teilen. Kommt nach 0050 |
| 4. `DocumentDrawer` | ✓ `src/ui/v3/entities/document/DocumentDrawer.tsx` mit fünf Stories |

**Eine Komponente mehr als bestellt: `DocumentFacts`.** Das Kriterium „Zone 3
verwendet **dieselbe** Komponente wie der View der Entität" ist ohne sie nicht
erfüllbar — einen `DocumentView` gibt es im Set noch nicht, und der Drawer
hätte die vier Feldzeilen sonst selbst geschrieben, also genau den zweiten
Satz angelegt, den das Kriterium verbietet. `DocumentFacts` ist deshalb die
Fakten-Komponente der Familie (Vorlage `ui/beleg/BelegSummary.tsx`, Verhalten
übernommen, Optik nicht); der spätere `DocumentView` importiert sie, statt sie
zu wiederholen. Drei eigene Stories.

**~~Befund zum GLOSSARY~~ — zurückgezogen.** Beim Bauen notiert, das
`GLOSSARY.md` kenne nur `source doc` und nicht `document`; die Abnahme hat
das widerlegt: `### Receipt / document` führt „English: `document`,
`receipt`" (Zeile 787). `DocumentDrawer` und `DocumentFacts` tragen also
Hausbegriffe, die Umbenennungsfrage stellt sich nicht.

## Nachbesserung (2026-09-04)

Die erste Abnahme fand drei Mängel; alle drei sind behoben:

1. **Zusammenfassung stand rechtsbündig** (V3): `.v2fields__row > span:last-child`
   richtet rechts aus und setzt `tnum` — richtig für Werte, falsch für einen
   Satz. Der Text steht jetzt in `.v2doc__prose` (links, ohne Ziffernstellung),
   die Zeile bleibt. Nachzusehen in `DocumentFacts` → `Filled`.
2. **Ladezustand hatte nicht die Form des Inhalts**: statt eines 96-px-Kastens
   steht dort jetzt die Originalfläche in ihrer echten Höhe
   (`.v2doc__origskel`, dieselbe `clamp`-Höhe wie `.v2doc__orig`) plus fünf
   Faktenzeilen. Nachzusehen in `Laedt`.
3. **Zone 2 ohne Vorschau hatte keine Story**: neu `OhneVorschau` — ein
   TIFF-Scan, der Grund steht als Satz, kein Platzhalter an der Stelle des
   Belegs. Damit sind es sechs Drawer-Stories statt fünf.

## Abnahme

Geprüft gegen Spec und Code, ohne Chatverlauf. Stand `61d21ee` (HEAD).
Browser: Storybook auf `:6107`, alle acht Stories aufgerufen, Zonen und
Zustände im DOM gemessen statt am Quelltext geraten.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe; `pnpm build` Exit 0, „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/document/DocumentDrawer.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Beleg/DocumentDrawer` — dieselbe Form wie Konto, Sachverhalt, Buchungssatz | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `DocumentDrawer.tsx:45–51`, `DocumentFacts.tsx:38–43`; TSX-Kommentare englisch, CSS-Kommentare deutsch wie der gesamte Bestand in `v3.css` | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | in beiden `.tsx` kein Hex und kein px; die Treffer der Story liegen im Data-URI, der den PDF-Inhalt simuliert. Zustand über `StatusBadge axis="beleg"` → `BELEG_PROCESSING.processed` (`status-registry.ts:182`) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | erste Runde: fünf Drawer-Stories `Geoeffnet`, `Laedt`, `Fehler`, `NichtGefunden`, `ImKontext`. Nach der Nachbesserung sechs — `OhneVorschau` deckt den einzigen ungezeigten Zonen-2-Zweig ab (**M3**). Zweite Abnahme selbst geprüft: die Story lädt, im Körper stehen `.v2sub`-Satz (18 px, ohne Rahmen, ohne Fläche) · Fakten-Block · Grenzsatz; `.v2doc__orig` fehlt, `iframe/img/embed/object` = 0 | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | erste Runde ✗ wegen V3 (**M1**). Zweite Abnahme nachgemessen in `DocumentFacts` → `Filled`: der Satz steht in `<p class="v2doc__prose">` mit `text-align: left` und `font-variant-numeric: normal`, beide Zeilen beginnen bündig bei x = 154 und enden bei 505 bzw. 346 (flatterrechts); die vier Werte darüber behalten `right` + `lining-nums tabular-nums`. Damit steht Text links und Zahlen rechts. Versalien und Kontraste wie in der ersten Runde | ✓ |
| Im Browser angesehen, nicht nur gebaut | acht Stories, Rundlauf `onOpenFull` → Text erscheint, Escape und Kreuz schließen, Fokus kehrt auf „Ansehen" zurück | ✓ |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Regel 5 in `entitaet-analysieren` §7, Drawer-Zeile in `TEMPLATE.md` | SKILL.md §7 Nr. 5 (Z. 246–253) — wortgleich zur Spec, dazu der Satz „View beantwortet alle Fragen, Drawer die eine" und die Bau-Reihenfolge „der Drawer folgt dem View" (Z. 260–265). `docs/entitaeten/TEMPLATE.md`, Formen-Tabelle: Zeile `<Entity>Drawer`, Größe L, Grund „5 — nachgeschlagen aus `<verweisende Ansicht>` heraus" | ✓ |
| Zonen 1, 2, 3, 4, 5 in dieser Reihenfolge (`Geoeffnet`) | DOM-Messung: `v2drawer__h` y=0 · `v2doc__orig` y=101 · `v2doc__h` y=783 · `v2fields--bare` y=808 · `v2doc__limit` y=978 · `v2drawer__foot` y=1017 | ✓ |
| Zone 3 verwendet dieselbe Komponente wie der View | `DocumentDrawer.tsx:12` importiert `DocumentFacts`; im Drawer steht keine zweite Feldliste. Die zweite Hälfte des Kriteriums („der View importiert dieselbe") ist heute nicht beweisbar — einen `DocumentView` gibt es nicht. Geprüft, soweit prüfbar | ✓ |
| Der Fuß trägt genau eine Aktion, und die führt in die Vollansicht | im Fuß genau ein `<button>`: „Vollständige Belegansicht öffnen"; Klick setzt den `onOpenFull`-Text der Story | ✓ |
| Kein Schreibpfad | keine Prop ändert Daten (`open`, `onClose`, `reference`, `record`, `loading`, `error`, `onOpenFull`); im offenen Drawer `input,textarea,select,[contenteditable]` = 0; auch `DocumentFacts` ist rein lesend | ✓ |
| Vier Zustände in der Vorrangfolge `error` → `loading` → `record === null` → Inhalt | `DrawerBody` prüft in dieser Reihenfolge (`DocumentDrawer.tsx:117–137`). `Laedt` setzt `record` **und** `loading` und zeigt die Fläche — `loading` schlägt `record`; `Fehler` setzt `record={null}` und zeigt den Fehler, nicht den Leertext. Zweite Abnahme, Form des Ladezustands (**M2**) bei 1600 × 1013 px nachgemessen: `.v2doc__origskel` 628 px hoch an y = 101, darunter fünf Skelettzeilen (87 px) — das Original in `Geoeffnet` steht an derselben Stelle (y = 101) und ist 602 px hoch; dieselbe Regel `clamp(320px, 62vh, 900px)`, die 26 px Unterschied sind genau der Überlauf, um den das `iframe` als Flex-Kind schrumpft (20 + 628 + 16 + 180 + 16 + 19 + 20 = 899 gegen 873 px Körper). Kopf und Fuß stehen in beiden Zuständen gleich | ✓ |
| Der Fehlertext enthält `reference` wörtlich | „Beleg **RE-4471** konnte nicht geladen werden: Die Ablage antwortet nicht (Zeitüberschreitung nach 30 Sekunden)." | ✓ |
| Baut auf 0042 auf, definiert weder Scrim noch Kopf noch Fußleiste selbst | die Komponente rendert nur `<Drawer title meta size footer>`; `.v2doc*` fasst Original, Zonen-Überschrift und Grenzsatz an, nichts vom Rahmen. Leerer Fuß verschwindet über `.v2drawer__foot:empty` aus 0042 | ✓ |
| Hinter dem offenen Drawer bleibt der Kontext sichtbar (`ImKontext`) | gemessen bei 1219 px Fenster: Drawer x=119, Breite 1100 (`--drawer-lg` = `min(1100px, 94vw)`). Belegnummern-Spalte und Kartenkopf „Sachverhalt 118 · Belege" stehen hinter dem Scrim; nach dem Schließen steht der Fokus wieder auf „Ansehen" | ✓ |
| `@instead` schickt weiter | „Every question about the document … → DocumentView. A decision that has to be made now → Dialog. One sentence about it → Popover." — alle drei Ziele, dazu `DocumentFacts` | ✓ |
| Ersetzt `BelegDrawer` in `apps/web/src/ui/drawers/` ohne Funktionsverlust | dieses Repo ist das ausgelagerte Set; die Ablösung ist ein eigener Schritt (`docs/backlog/README.md`) | offen (App) |

**Die beiden Urteile zum „Stand der ersten Runde"**

| Frage | Nachweis | Ergebnis |
|---|---|---|
| Ist das Auslassen von Schritt 3 (`CaseDrawer`) stichhaltig? | selbst geprüft: `docs/backlog/0050-case-detail-view.md` steht auf `Status: spec — blockiert`, Blocker „erst das Entitätsprofil, dann bauen" (Owner 2026-09-03); `docs/entitaeten/` enthält nur `TEMPLATE.md`; `entities/accounting-case/` enthält nur `CaseTimeline`. Ohne Profil steht die Rang-Reihenfolge bis L nicht fest, und genau die ist Zone 3. Offene Frage 1 der Spec setzt „Beleg zuerst" als Default und den Sachverhalt ausdrücklich hinter 0050. **Die geschriebene Begründung trägt allerdings nicht allein:** „ohne View keine Zone-3-Komponente" galt für den Beleg genauso — dort wurde sie trotzdem gebaut. Tragend ist das fehlende Entitätsprofil, nicht der fehlende View | ✓ |
| Ist `DocumentFacts` gerechtfertigt oder Scope-Ausweitung? | gerechtfertigt, keine Ausweitung. Das Kriterium „Zone 3 verwendet **dieselbe** Komponente wie der View" verlangt genau dieses geteilte Stück; der Alternativweg — vier `FieldList`-Zeilen im Drawer — ist der zweite Satz Feldzeilen, den das Kriterium verbietet, und einen `DocumentView` zu bauen wäre die größere Ausweitung. Sie liegt in `entities/`, nicht in `primitives/` (die Zwei-Verwendungen-Regel aus `spec-schreiben` §3 greift nicht), hat eine Vorlage in der App (`ui/beleg/BelegSummary.tsx`), `@when`/`@instead`, drei Stories und keinen Schreibpfad. **Nachzutragen:** sie ist ohne eigene Spec entstanden — ihre Schnittstelle `DocumentFactsVM` ist außer hier nirgends abgenommen | ✓ |
| Sind die drei zusätzlichen `DocumentFacts`-Stories angemessen? | ja. `Filled` (alle Punkte), `Unvollstaendig` (Geviertstrich, die Zeile bleibt stehen), `InUse` (in der Karte, wie sie im Drawer und später im View sitzt) — das ist die Story-Formel für die eine Prop `facts` in ihren drei Lagen, nicht mehr | ✓ |

**Mängel (nachbesserbar)**

| # | Mangel | Nachbesserung | Stand (zweite Abnahme, `37d1cf9`) |
|---|---|---|---|
| M1 | Die Zusammenfassung steht rechtsbündig. `DocumentFacts.tsx:55` hängt den Fließtext als `FieldList`-Zeile an; `.v2fields__row > span:last-child` setzt `text-align: right` und `tabular-nums`. In `DocumentFacts--filled` (520 px) bricht der Satz um und steht flatterlinks — Verstoß gegen §9 „Text links, Zahlen rechts, nichts zentriert" (V3). Der Kommentar in Z. 54 („A summary is a paragraph, not a value") sieht das Problem und baut es trotzdem | den Satz als eigenen Absatz **unter** die Feldzeilen setzen, nicht in die Wertspalte | **behoben** — anders gelöst als vorgeschlagen (die Zeile bleibt, der Text bekommt `.v2doc__prose`), das Kriterium ist damit erfüllt: nachgemessen links und ohne `tnum` |
| M2 | Die Ladefläche hat nicht die Form des Inhalts. `DocumentDrawer.tsx:126` rendert ein einzelnes `Skeleton variant="card"` — `.v2skel--card` ist 96 px hoch — in einen Körper, dessen Inhalt rund 666 px Original plus fünf Feldzeilen ist. Story `Laedt`: ein kleiner Balken über gut 800 px Weiß. Die Zustandstabelle der Spec verlangt „ruhige Fläche **in der Form des Inhalts**" | zwei Flächen: eine hohe für Zone 2, `Skeleton lines={4}` für Zone 3 | **behoben** — 628 px Fläche + fünf Zeilen; nachgemessen gegen 602 px Original |
| M3 | Der Fall „Beleg ohne Vorschau" hat keine Story. `previewUrl: null` und `previewUnavailableReason` (`DocumentDrawer.tsx:35–38`, Zweig Z. 144–148) sind der einzige Zonen-2-Zweig, den keine der acht Stories zeigt — und Zone 2 ist der Punkt, an dem gerade dieser Drawer sich beweisen soll. Die Hausregel „je Prop die Story, die sie beweist" ist für zwei Felder unerfüllt | eine sechste Drawer-Story `OhneVorschau` mit `previewUrl: null` und gesetztem Grund | **behoben** — Story vorhanden, Grund als Satz, kein Platzhalter im DOM |

**Befunde (kein Mangel, gehören woanders hin)**

- **Der GLOSSARY-Befund der Bauphase stimmt nicht.** `docs/ludwig/GLOSSARY.md` führt sehr wohl `### Receipt / document` — „English: `document`, `receipt` · German: `Beleg`, `Dokument`". `Document…` ist damit ein Hausbegriff und braucht keine Entscheidung gegen `SourceDoc…`; wer sie doch aufmacht, führt sie gegen `### Source document supertype`, nicht gegen ein Loch im GLOSSARY.
- **Die Spec schreibt den Storybook-Titel falsch.** Oben steht `v3/Entities/<Entität>/…`; richtig und gebaut ist `v3/Entitäten/…` (CLAUDE.md: Storybook-Titel deutsch, und alle vier anderen Familien machen es so). Die Spec-Zeile gehört korrigiert, nicht der Code.
- `.v2doc__h` wiederholt `.v2fields__h` bis auf die Trennlinie. Beim zweiten Drawer zusammen mit der `EntityDrawer`-Frage (offene Frage 3) einsammeln.
- **Offene Frage 2 ist noch nicht wirklich beantwortet.** `--drawer-lg` = `min(1100px, 94vw)`: bei 1219 px Fenster bleiben 119 px Kontext, bei den 1280 px aus L1 wären es 180. Der Default lautet „bleibt, bis das echte PDF klemmt" — die Story zeigt eine synthetische HTML-Seite, ein echtes PDF hat den Wert noch nicht geprüft.
- `.v2drawer` bewegt sich über eine `transform`-Transition ohne `prefers-reduced-motion`-Ausnahme (`v3.css:750–759`). Das gehört zu 0042 (Status `Abnahme`), nicht hierher.
- Commit `61d21ee` hat `.claude/skills/entitaet-analysieren/SKILL.md` und `docs/entitaeten/TEMPLATE.md` **vollständig** neu aufgenommen — beide lagen ungetrackt vor. Inhaltlich richtig, aber rund 400 Zeilen fremder Text hängen jetzt an dieser Aufgabe.

## Zweite Abnahme (2026-09-04)

Stand `37d1cf9`, frischer Agent ohne Chatverlauf. Nachgemessen wurden nur die
drei Mängel und die beiden Spec-Korrekturen; die übrigen Kriterien stehen aus
der ersten Runde. Fenster 1600 × 1013 px, Storybook auf `:6107`, alle Werte aus
dem DOM (`getBoundingClientRect`, `getComputedStyle`, Zeilenkästen über
`Range.getClientRects`).

| Punkt | Eigener Nachweis | Ergebnis |
|---|---|---|
| M1 — läuft die Zusammenfassung links, ohne Ziffernstellung? | `DocumentFacts` → `Filled`: die vier Werte stehen mit `text-align: right` und `font-variant-numeric: lining-nums tabular-nums`; die fünfte Zeile trägt `<p class="v2doc__prose">` mit `left` / `normal`. Die beiden Zeilenkästen des Satzes beginnen beide bei x = 154 und enden bei 505 und 346 — links bündig, rechts flatternd. Im Bild bestätigt | ✓ behoben |
| M2 — hat die Ladefläche die Höhe des Originals? | `Laedt`: `.v2doc__origskel` an y = 101, 628 px hoch, darunter `.v2skelgroup` mit fünf Zeilen (87 px). `Geoeffnet`: das `iframe.v2doc__orig` an derselben Stelle, 602 px. Beide hängen an derselben Regel `clamp(320px, 62vh, 900px)` = 628 px; das Original schrumpft um 26 px, weil der gefüllte Körper (899 px Wunsch) den Platz (873 px) um genau diese 26 px überläuft. Kopf (81 px) und Fuß (60 px) sind in beiden Zuständen identisch | ✓ behoben |
| M3 — Grund als Satz, kein Platzhalter? | `OhneVorschau`: der Körper hat drei Kinder — `.v2sub` mit „Das Format TIFF lässt sich nicht im Browser anzeigen. Die Datei liegt unverändert in der Ablage." (18 px hoch, `background: rgba(0,0,0,0)`, `border: 0`), dann der Fakten-Block, dann der Grenzsatz. `.v2doc__orig` = 0 Treffer, `.v2skel` = 0 Treffer, `iframe/img/embed/object` im Drawer = 0. Zone 2 entfällt also ersatzlos bis auf den erklärenden Satz | ✓ behoben |
| GLOSSARY-Befund zu Recht zurückgezogen? | selbst nachgesehen: `docs/ludwig/GLOSSARY.md:787` führt `### Receipt / document` mit „English: `document`, `receipt` · German: `Beleg`, `Dokument`". Der Rückzug stimmt | ✓ |
| Storybook-Titel richtig korrigiert? | Spec sagt jetzt `v3/Entitäten/<Entität>/<Entity>Drawer`; gebaut ist `title: "v3/Entitäten/Beleg/DocumentDrawer"` und `…/DocumentFacts`. Deckungsgleich | ✓ |
| Nichts gebrochen | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe. `Geoeffnet`: Zonen weiter in der Reihenfolge Kopf y = 0 · Original y = 101 · Zonen-Überschrift y = 719 · Fakten y = 744 · Grenzsatz y = 914 · Fuß y = 953. `Fehler`: nur `.v2note--danger` mit „Beleg RE-4471 konnte nicht geladen werden: …", Fuß leer. `NichtGefunden`: `.v2empty--inline`, `text-align: start`. `ImKontext`: Klick auf „Ansehen" öffnet den Drawer, die Belegtabelle bleibt dahinter sichtbar. `DocumentFacts` → `Unvollstaendig` (drei Geviertstriche) und `InUse` unverändert | ✓ |

**Befunde der zweiten Abnahme (kein Mangel)**

- **Die Prosa sitzt weiter in der Wertspalte.** Die Zeile ist `display: flex`
  mit `justify-content: space-between`, der Absatz schrumpft auf seinen Inhalt.
  Passt der Satz in eine Zeile — im `lg`-Drawer bei 1060 px Zeilenbreite tut er
  das —, klebt sein Kasten am rechten Rand (gemessen in `Geoeffnet`: x = 1032
  bis 1580, eine Zeile) und liest sich wie ein Wert. Erst beim Umbruch zeigt
  sich der Gewinn. Die vorgeschlagene Nachbesserung („eigener Absatz unter den
  Feldzeilen") hätte auch diesen Fall erschlagen. Kein Verstoß gegen V3 — eine
  einzelne Zeile hat keine flatternde linke Kante —, aber der Punkt kommt
  wieder, wenn `DocumentView` dieselbe Komponente breiter zeigt.
- **Der Ladekörper ist flacher als der Inhalt.** 5 Skelettzeilen = 87 px gegen
  180 px Fakten-Block, und Zone 4 (Grenzsatz) hat kein Gegenstück; der
  Ladezustand endet bei y = 832, der gefüllte bei y = 933. Die Form stimmt in
  der Art, nicht auf den Pixel — für „ruhige Fläche in der Form des Inhalts"
  reicht das.
- **`DocumentDrawer` fasst die Klasse eines Primitivs an.** Die hohe Fläche ist
  ein `<span class="v2skel v2doc__origskel">` von Hand, nicht die Komponente
  `Skeleton` — deren drei Varianten (`lines`, `card`, `field`) haben keine, die
  eine Dokumenthöhe füllt. Funktioniert (der Puls hängt an `.v2skel`, und
  `Skeleton` selbst nennt die geteilte Klasse als Absicht), aber wenn der zweite
  Drawer dieselbe Fläche braucht, gehört sie als Variante in `Skeleton` (0016)
  statt ein zweites Mal in eine Entität.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-04 · Offene Punkte: **nicht
abgenommen** — M1 (Zusammenfassung rechtsbündig, V3), M2 (Ladefläche nicht in der
Form des Inhalts), M3 (keine Story für „Beleg ohne Vorschau"). Danach ist die
erste Runde fertig. Unabhängig davon bleiben: Schritt 3 `CaseDrawer` (wartet auf
das Entitätsprofil `accounting-case` und 0050) und die Ablösung von
`BelegDrawer` in `ludwig/app` — **offen (App)**.

Zweite Abnahme von / am: Claude (zweite Abnahme), 2026-09-04 · **abgenommen** —
alle drei Mängel selbst nachgemessen und behoben, `pnpm typecheck` grün, die
übrigen Stories unbeschädigt. Bilanz der ersten Runde damit 22 ✓ · 0 ✗ · 1
offen. Es bleiben nur die Punkte, die nie zu dieser Runde gehörten: Schritt 3
`CaseDrawer` (wartet auf das Entitätsprofil `accounting-case` und 0050) und die
Ablösung von `BelegDrawer` in `ludwig/app` — **offen (App)**. Drei Befunde oben
sind notiert, keiner blockiert.

**Status-Nachtrag 2026-09-05.** Der Zusatz im Statusfeld steht jetzt hier, damit
der Status ein Status bleibt: abgenommen ist die erste Runde; der `CaseDrawer`
aus Schritt 3 hat mit 0098 seine eigene Spec und ist dort zu bauen.
