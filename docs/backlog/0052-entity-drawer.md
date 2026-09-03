# 0052 · Entity-Drawer — die Nachschlag-Form der Entitäts-Familie

| | |
|---|---|
| Status | Abnahme — erste Runde: Schritte 1, 2 und 4 gebaut, Schritt 3 ausgelassen |
| Stufe | `entities/<entität>/` je Drawer; der Rahmen steht als `primitives/Drawer` (0042) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → das **Zonen-Schema** ja (fachfrei, deshalb Regel, nicht Komponente); der **einzelne Drawer** nein, er zeigt eine Ludwig-Entität → `entities/` |
| Quelle | Design-Brief `F143-entitaets-drawer-design-brief.md` aus `ludwig/app/docs/backlog/` (Owner 2026-09-03), hier von v2-Gestaltungsauftrag auf v3-Entwicklungsaufgabe umgeschrieben · `docs/v3-backlog.md` (Drawer-Familie, 29 Importstellen) |
| Ersetzt | die sechs Drawer in `app/apps/web/src/ui/drawers/`: Beleg · Kontenblatt · Kontoauszugsposition · Ludwig-Buchungssatz · DATEV-Buchungssatz · technische Rohzeile |
| Blockiert | die Drawer-Umzüge der Welle 1 · jeden Verweis, der heute kein Ziel hat (0013 Kontenblatt-Icon, 0014 OPOS-Browser) |
| Setzt voraus | 0042 `Drawer` (Abnahme) · je Entität deren `View` und die kleineren Formen — für den ersten Drawer 0050 `CaseDetailView` |
| Spec von / am | Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-04 |

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

Titel `v3/Entities/<Entität>/<Entity>Drawer`, damit die Form in der
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

**Befund für `ludwig/app` und das GLOSSARY.** Die Spec legt `DocumentDrawer`
fest, das `GLOSSARY.md` führt den Beleg aber als **`source doc`**
(`client_source_docs`, „Quelle (Dokument)"); `document` ist dort kein
Eintrag. Gebaut ist nach Spec — wer die Familie später ausbaut, sollte
`Document…` gegen `SourceDoc…` entscheiden, bevor sechs Dateien den Namen
tragen. Keine Entscheidung dieses Auftrags.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
