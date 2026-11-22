# 0253 · Kanzlei-Bereich auf Handy und Tablet (F783 M0)

| | |
|---|---|
| Status | fertig (Nachprüfung und Schlussprüfung 2026-11-22, siehe „Abnahme“) |
| Stufe | quer: `primitives/` (AppShell, TopBar, Table, Drawer), `patterns/` (DataTable, StepRail), `entities/journal-entry/` (JournalEntryReviewList), `entities/clarification/` (nur CSS), Tokens, `app-chrome.css`, `v3.css` |
| Klassen-Test | Rasterpunkte, Rahmen, Zeilenkarte, Reiter, Drawer: ja (Versicherungs-App genauso). Prioritäten der Buchungsliste: nein (Entität) |
| Quelle | App `docs/backlog/F783-workspace-mobile.md` (Commit 1c584a62c auf staging), Abschnitte „Grundsätze“, „Bildschirm für Bildschirm“, „M0“. Auftrag ll-dev96 2026-11-22, Owner-Entscheid 2026-11-22 über ll-ceo |
| Ersetzt | Sperre `.app__toonarrow` (AppShell) und `.review__toosmall` (v3.css); App: Inline-Stile in `ClientBand.tsx:52-64` (M1) |
| Blockiert | F783 M1–M3 (App) |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

Eine Steuerfachangestellte soll unterwegs auf dem Handy eine Rückfrage beantworten, einen Stapel abnehmen oder einen Beleg ansehen können. Auf dem Tablet soll sie den Kanzlei-Bereich ganz bedienen können. Heute sperrt das Set alles unter 1280 px (L1). Die App zeigt die Sperre zwar nicht, aber ihre Tabellen scrollen dann seitlich, die Seitenleiste nimmt 240 px weg und zwei Spalten quetschen sich nebeneinander. Am Desktop ändert sich **kein Pixel**: Jede neue Regel steht in `@media (max-width: 1279.98px)` oder enger.

## Einordnung

- **Wiederverwenden:** `AppShell`/`TopBar` (0030), `Table`/`DataTable`, `.v2tabs`, `KpiGrid`, `Columns`, `.v3docreview`, `.v2clc--side`, `StepRail layout="bar"` (0221), `.v2wiz__foot`, `.s3bar`, `.v2selbar`, `Drawer`, `OverflowMenu`. Kein `@when` deckt „auf schmaler Breite“, denn das gab es bis heute nicht.
- **Erweitert, nicht neu** (§3 Regel 2): Jede Komponente bekommt ihre schmale Form in derselben Datei und mit denselben Klassen. Neu sind drei Props, ein Prop-Feld und eine Story je Komponente. Eine neue Komponente gibt es nicht.
- **Zuschnitt:** eine Spec für das ganze M0, weil die App den Zeiger erst nach **einer** Freigabe hebt. Die Teile hängen über die Rasterpunkte zusammen. Die Stories liegen je Komponente, deshalb gilt die Obergrenze von 10 Stories je Datei und nicht für die Spec.
- **Mechanik:** Rasterpunkte als Tokens (`--bp-phone: 640px`, `--bp-tablet: 1024px`, `--bp-desktop: 1280px`). Ein Custom Property gilt nicht in einer `@media`-Bedingung. Die Medienabfragen schreiben den Wert deshalb als Zahl (`max-width: 639.98px`, `1023.98px`, `1279.98px`), und der Token ist die eine benannte Quelle daneben, mit Kommentar. Die Breite des Bildschirms entscheidet über den Rahmen. Die Tabelle schaltet nach **ihrer eigenen** Breite um (Container-Abfrage), aber nur, wenn das Fenster schmaler als 1280 px ist. Eine Tabelle in einem schmalen Drawer am Desktop bleibt deshalb, wie sie ist.

## Leitlinie L1 neu (`docs/design-guidelines.md` §5)

> **L1 Desktop zuerst, Handy und Tablet bedienbar** (Owner 2026-11-22, F783). Desktop ab 1280 px Innenbreite bleibt der Hauptfall, und für ihn wird gestaltet. Tablet (640–1279 px) und Handy (unter 640 px) werden unterstützt: Es gibt eine Spalte, die Hauptsache steht zuerst, Tabellen werden Zeilenkarten, die Leiste mit Weiter und Zurück sitzt unten. Es gibt keine Sperre mehr. Nichts fällt weg: Jede Handlung ist auch schmal erreichbar, notfalls über ⋯. Jede Taste hat eine sichtbare Schaltfläche. Am Desktop ändert eine Regel für schmale Breiten nichts.

Dazu die Zeile „Sperre unter 1280 px“ in §11 (Bestand) neu fassen. CLAUDE.md §2 („kein Mobile-Ziel, darunter Sperre“) ist die Datei des Owners. Sie wird hier nicht geändert, sondern dem Owner gemeldet.

## Schnittstelle

### Rahmen — `AppShell`, `TopBar` (primitives, `AppShell.tsx`), `app-chrome.css`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `AppShell.navOpen` | `boolean` | nein | Schublade auf dem Handy offen. Den Zustand führt der Aufrufer | `Phone` |
| `AppShell.onNavOpenChange` | `(open: boolean) => void` | nein | Ohne ihn gibt es keine Schublade. Mit ihm rendert AppShell den Schleier `button.app__scrim` „Menü schließen“. `Esc` schließt die Schublade. Wird das Fenster ≥ 640 px breit, meldet AppShell `false`. Solange sie offen ist, ist `.app__main` `inert` | `Phone` |
| `TopBar.onOpenNav` | `() => void` | nein | Schaltfläche `.tb__menu` mit Zeichen und Wort „Menü“, `aria-expanded` aus `navOpen` und `aria-controls="app-nav"`, nur unter 640 px sichtbar | `Phone` |
| `TopBar.navOpen` | `boolean` | nein | für `aria-expanded` | `Phone` |
| `TopBar.onOpenSearch` | `() => void` | nein | Schaltfläche `.tb__searchbtn` mit Zeichen und Wort „Suchen“, nur unter 640 px sichtbar. Darüber bleibt das Suchfeld des Aufrufers | `Phone` |

AppShell gibt der Seitenleiste `id="app-nav"`. Die Sperre `.app__toonarrow` entfällt aus Markup und CSS.

**Klassen für die App** (der eigene `AppShell`/`Sidebar`/`TopBar`/`ClientBand` der App, M1):

| Klasse | Wo | Wirkung |
|---|---|---|
| `.app--nav-open` | an `.app` | unter 640 px: Seitenleiste als Schublade von links (min(300px, 85vw)), Schleier darüber |
| `button.app__scrim` | Geschwister von `.app__sidebar` | Schleier, Klick schließt; ≥ 640 px unsichtbar |
| `.tb__menu`, `.tb__searchbtn` | in `.app__topbar` | nur unter 640 px sichtbar |
| `.sb__phone` | in `.app__sidebar` | nur in der Schublade sichtbar (Rollenabzeichen, Bereichswechsel, Rechtsform, DATEV-Nummer, Technik-Link) |
| `.ludwig-client-band` + `__avatar`, `__text`, `__name`, `__num`, `__legal`, `__tech`, `__year` | das Mandantenband | ersetzt die Inline-Stile, am Desktop pixelgleich; Tablet Rand 24 px; Handy eine Zeile Name · Jahr, nicht sticky |

Rahmen unter 1280 px: `100dvh`, kein `min-height: 720px`, Rand von `main` 24 px (Tablet) bzw. 16 px (Handy). Von 640 bis 1279 px steht die Seitenleiste immer eingeklappt (64 px) und **ohne** Klappknopf, auch ohne `.is-collapsed`. Die Wörter der Einträge, des Mandanten und des Nutzers bleiben für Vorlesehilfen im Baum (abgeschnitten, nicht `display: none`). Sichtbar sind nur Symbole, eine benannte Ausnahme zu V14 in L1. Das Suchfeld ist höchstens 320 px breit. Unter 640 px ist die Seitenleiste immer ausgeklappt, auch mit `.is-collapsed`. Die Rollenleiste oben (`.tb__actions`) und das Suchfeld weichen dort der Schublade bzw. der Lupe.

### Tabelle — `Table` (primitives), `DataTable` (patterns), `JournalEntryReviewList` (entities)

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `Table.priority` | `readonly ColumnPriority[]` | nein | je Spalte (in der Reihenfolge der Zellen einer Zeile) `primary` · `meta` · `hidden`; fehlt ein Eintrag, gilt `primary` | `Table/PhoneCards` |
| `ColumnDef.priority` | `ColumnPriority` | nein | dasselbe je Spalte. DataTable ergänzt die eigenen Spalten: Auswahl und Aufklapper sind `primary`, Aktionen `meta` | `DataTable/PhoneCards` |

`type ColumnPriority = "primary" | "meta" | "hidden"`, exportiert aus `Table.tsx` und dem Barrel.

Unter 640 px **Breite der Tabelle** (nur bei Fenster < 1280 px) wird jede Zeile eine Zeilenkarte:

- In Zeile 1 stehen die `primary`-Zellen. Der erste Betrag (`.v2num`) steht rechtsbündig.
- In Zeile 2 stehen die `meta`-Zellen, klein (`--fs-ui-sm`) und gedämpft.
- `hidden` fällt weg. Der Inhalt ist über die Zeile (Link, Aufklapper, Drawer) erreichbar.
- Der erste Betrag steht oben rechts in der Karte. Die Zeile hält ihm 8em frei, damit ein langer Name daneben umbricht und die Beträge untereinander stehen.
- Es gibt weder eine Mindestbreite noch einen seitlichen Scroller.
- Der Spaltenkopf folgt derselben Ordnung und bleibt sichtbar, als Legende der Karte. Sortierlinks und „alle auswählen“ bleiben erreichbar.
- Gruppen-, Leer-, Fehler- und Aufklappzeilen bleiben, wie sie sind.
- **Die Zelle mit dem Zeilenlink fällt nie weg** (`.v2tbl__lead` bzw. `.v2rowlink`, bei DataTable die erste Spalte), auch nicht mit `hidden`: Sie ist der Weg in die Zeile.

Höchstens 20 Spalten tragen eine Priorität, das reicht für die längste Tabelle des Sets (Buchungsliste 16).

Über 640 px Tabellenbreite bleibt die Tabelle eine Tabelle. Ist ihre Mindestbreite größer als der Platz, scrollt sie in ihrer Karte seitlich wie heute am Desktop. Ein Beispiel ist die Buchungsliste bei 820 px (F783 M0 Punkt 4: Zeilenkarte erst unter 640 px Containerbreite). Die Seite selbst scrollt nicht seitlich.

`JournalEntryReviewList` setzt die Prioritäten selbst (F783 „Buchungen“):

| Priorität | Spalten |
|---|---|
| `primary` | Datum · Sachverhalt · Betrag |
| `meta` | Konten, Soll, Kontoname Soll, Haben, Kontoname Haben, BU, Prüfung durch Ludwig (der Stand als Abzeichen), Prüfgrund |
| `hidden` | Nr., Beleg, So gebucht, Satzart |

### Reiter, Kennzahlen, zwei Spalten (nur CSS)

- `.v2tabs` unter 1280 px: Die Reiter brechen nicht um, die Leiste scrollt seitlich, der Unterstrich bleibt.
- `.v2kpigrid` unter 640 px: `repeat(auto-fit, minmax(max(140px, calc(50% - var(--space-4))), 1fr))`, also höchstens zwei Kacheln je Zeile.
- `Columns split` (`.v3cols--split`), `.v3docreview`, `.v2clc--side`, `.review` unter 1024 px: einspaltig, die Nebenspalte steht unter der Hauptspalte.
- Rückfrage (`ClarificationCard variant="step"`) unter 640 px: Antwortzeilen über die ganze Breite, mindestens 44 px hoch. Die empfohlene Antwort bleibt in ihrer Zeile markiert. Die Karte „Kontext“ folgt unter der Antwort. Ihre Gruppen sind schon aufklappbar (`Disclosure`), deshalb bekommt sie keinen zweiten Klappschalter.

### Schrittleiste — `StepRail layout="bar"` (patterns)

Unter 640 px steht statt der Leiste eine Zeile „Schritt n von m · ‹Name›“ mit Pfeil (`<details>`, native, Server-Komponente). Antippen öffnet die Liste aller Schritte mit Ampel und Zähler, und jeder Eintrag ist der Link wie heute. Ohne aktuellen Schritt heißt die Zeile „Schritte · m“. Keine neue Prop.

### Untere Leiste (nur CSS)

- `.v2wiz__foot` und `.s3bar` unter 640 px: `position: sticky; bottom: 0`, Innenabstand unten `+ env(safe-area-inset-bottom)`, Schaltflächen darin mindestens 44 px hoch. Eine sticky Leiste verdeckt keinen Inhalt, deshalb braucht `main` keinen Ausgleich.
- `.v2selbar--sticky` (Auswahlleiste der DataTable) unter 640 px: `position: fixed` am unteren Rand mit Safe-Area, zweizeilig (oben Zahl und „Auswahl aufheben“, unten die Handlungen). `.app__main` bekommt dann unten 120 px Platz. Ohne `.app__main` als Scroll-Box (Story ohne Rahmen) gibt es diesen Platz nicht.
- `.v2wiz__foot`: Der Fortschritt steht unter 640 px in einer eigenen Zeile über den Schaltflächen.
- `OverflowMenu` öffnet nach oben, wenn unter dem Auslöser kein Platz ist, zum Beispiel in der unteren Leiste. Das ist JavaScript in `place()` und gilt an jeder Breite. Am Desktop ändert es nur ein Menü, das bisher aus dem Fenster hing.
- Zweitaktionen: Die Klasse `.is-secondary` an einer Schaltfläche in diesen Leisten blendet sie unter 640 px aus. `.v2bar__more` (Hülle um ein `OverflowMenu` mit denselben Handlungen) erscheint nur unter 640 px. Die App setzt beides (F783 „Nichts fällt weg“).

### Drawer (primitives)

Unter 640 px ist jede Größe 100 % breit, und der Schließen-Knopf ist 44 × 44 px groß. Keine neue Prop.

### Zeichen

`ACTION_ICON.menu` (Lucide `Menu`, Wort „Menü“, Bedeutung: die Seitenleiste auf dem Handy öffnen). `search` gibt es schon.

**Was das Set bewusst nicht tut:**

- Es misst keine Breite in JavaScript. Ausnahme ist das Schließen der Schublade beim Verbreitern, damit `main` nicht `inert` bleibt.
- Es merkt sich keinen Zustand.
- Es baut kein Beleg-PDF für das Handy, das ist App M2.
- Es setzt kein `viewport-fit=cover`. Das ist das Viewport-Meta der App, ohne das `env(safe-area-inset-bottom)` 0 bleibt.

## Verhalten

- **Tastatur:**
  - „Menü“ öffnet die Schublade.
  - `Esc` und „Menü schließen“ (Schleier) schließen sie.
  - Die Tab-Reihenfolge läuft Leiste oben → Schublade → Schleier.
  - `main` ist `inert`, solange die Schublade offen ist.
  - Die kompakte Schrittleiste ist ein `summary`, Enter und Leertaste öffnen sie.
- **Hover:** Die neuen Schaltflächen nutzen `IconButton`-/`v2btn`-Hover. Die Zeilenkarte behält die Hover-Fläche der Zeile.
- **Zustände:** Die Zeilenkarte gilt für gefüllt. Leer, leer nach Filter, lädt und Fehler sind Zeilen mit `colspan` und bleiben ganz breit. `TableLoading` behält seine Spaltenzahl und bricht um.
- **Desktop:** Am Desktop ändert sich kein Pixel. Jede neue Regel steht in einer Medienabfrage bis 1279.98 px. Neue Elemente (`.tb__menu`, `.tb__searchbtn`, `.app__scrim`, kompakte Schrittleiste, `.v2bar__more`, `.sb__phone`) sind darüber `display: none`. `container-type` wird erst unter 1280 px gesetzt.

## Stories

Neue oder geänderte Stories, Darstellung bei 390 px Fensterbreite. Storybook misst die Medienabfrage am iframe. Gemessen wird deshalb `iframe.html` bei 390 × 844 und 820 × 1180.

| Story | Beweist |
|---|---|
| `v3/Primitives/Rahmen/AppShell` · `Phone` (neu) | `navOpen`, `onNavOpenChange`, `onOpenNav`, `onOpenSearch`: Schublade auf/zu, „Menü“, „Suchen“, Mandantenband eine Zeile, `.sb__phone` in der Schublade |
| `v3/Primitives/Rahmen/AppShell` · `Narrow` (geändert) | zeigt Tablet (820, `InUse`) und Handy (390, `Phone`) nebeneinander statt der Sperre |
| `v3/Primitives/Tabelle/Table` · `PhoneCards` (neu) | `priority` aller drei Werte, Zeile 1/Zeile 2/weg, Betrag rechts, langer Name bricht neben dem Betrag um |
| `v3/Patterns/Arbeitsfläche/DataTable` · `PhoneCards` (neu, Vollbild in `.app__main`) | `ColumnDef.priority`, Auswahl als Kästchen, Auswahlleiste unten fest, Zeilenlink bleibt |
| `v3/Patterns/Rahmen/Wizard` · `SecondaryActions` (neu) | `is-secondary` und `.v2bar__more`, Fuß klebt unten |
| `v3/Entitäten/Buchungssatz/JournalEntryReviewList` · bestehende Stories bei 390 px | Prioritäten der Buchungsliste |
| `v3/Patterns/Frame/StepRail` · `Bar` bei 390 px | kompakte Zeile, Liste aufgeklappt. Keine neue Story: Die Form steht in jeder `bar`-Story, und die Datei hat schon 10 |
| `v3/Primitives/Dialog/Drawer` · `Open` bei 390 px | 100 % breit, Knopf 44 px |

Reiter, Kennzahlen, zwei Spalten und Rückfrage: bestehende Stories bei 390 und 820 px, weil nur CSS hinzukommt und es keine Prop gibt, die eine eigene Story verlangte.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Kontext der Rückfrage als ein Klappschalter | `ClarificationCard.contextCollapsed?` | wenn auf dem Handy die Gruppen zu lang werden (Messung M2) |
| Zweitaktionen automatisch ins ⋯ | `ActionBar.secondary?: ReactNode` | wenn die App in M2 dieselbe Doppelung an drei Stellen schreibt |
| Rasterpunkte als `@custom-media` | Build-Schritt PostCSS | sobald das Set PostCSS bekommt |
| Titel neben dem Auswahlkästchen statt darunter | Wachstum der Hauptzelle in der Zeilenkarte | wenn die Kartenhöhe in M3 stört |
| Zeilenkarte auch über 640 px, wenn die Mindestbreite nicht passt | `Table.cardBelow?` | wenn die Buchungsliste auf dem Tablet seitlich scrollt und das stört (M2) |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün, `pnpm check:type`, `check:icons`, `check:when`, `check:language` grün (Exit-Code; `check:classes` ohne neue Befunde gegenüber den vier bekannten)
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec), gemessen auf `iframe.html` bei 390 × 844 (Handy), 820 × 1180 (Tablet), 1440 × 900 (Desktop):

1. **Desktop unverändert:**
   - Die 37 Vergleichsbilder in `.playwright-mcp/f783-base/` (vor dem Bau, `main` db23fd6, 1440 × 900, ganze Seite, Dateiname = Story-ID) werden nach dem Bau mit derselben Liste neu aufgenommen, Maus auf (0, 0).
   - `node scripts/png-diff.mjs .playwright-mcp/f783-base <neu> 0.5` endet mit Exit 0, jede Datei ≤ 0,5 %.
   - Das Rauschen ohne Änderung lag bei ≤ 0,001 %. Ein Mauszeiger über einer Zeile ergab 0,009 %.
2. **Jede neue Regel unter 1280 px:** Jede neue CSS-Regel im Diff von `v3.css`/`app-chrome.css` steht in `@media (max-width: 1279.98px)`, `1023.98px`, `639.98px` oder in `@container v2tbl` darunter. Ausnahmen (Diff lesen):
   - `display: none` neuer Elemente,
   - die gelöschten Sperren,
   - die Klassen `.ludwig-client-band*`, die die Inline-Stile der App eins zu eins nachbauen (in der App am Desktop pixelgleich zu prüfen, M1),
   - `OverflowMenu` öffnet nach oben, wenn unten kein Platz ist.
3. **Kein seitlicher Scroll:**
   - Für jede neue Story und die genannten bestehenden gilt bei 390 und 820 px `document.documentElement.scrollWidth <= innerWidth`.
   - Bei 390 gilt für jedes `.v2tbl__scroll` zusätzlich `scrollWidth <= clientWidth`.
   - Bei 820 darf eine Tabelle ≥ 640 px in ihrer Karte scrollen, wie heute am Desktop.
4. **Sperre weg:** `grep -rn "toonarrow\|toosmall" src` ist leer, und L1 ist neu gefasst (Wortlaut oben).
5. **Tokens:** `--bp-phone`, `--bp-tablet`, `--bp-desktop` stehen in `tokens.css` mit Kommentar. Jede Medienabfrage des Diffs nutzt einen der drei Werte.
6. **Rahmen Handy (`AppShell/Phone`, 390):**
   - Die Seitenleiste ist zu (außerhalb des Bilds).
   - „Menü“ und „Suchen“ sind sichtbar, je ≥ 24 × 24 px.
   - Klick auf „Menü“ öffnet die Schublade (Breite ≤ 300 px, voller Inhalt mit Text der Einträge und `.sb__phone`).
   - `aria-expanded="true"`, `main` hat `inert`.
   - `Esc` schließt, Klick auf den Schleier schließt.
   - Das Mandantenband ist eine Zeile mit Name und Jahr, ohne Avatar, DATEV-Nummer, Rechtsform und Technik-Link.
   - `main` hat 16 px Rand.
7. **Rahmen Tablet (820):**
   - Die Seitenleiste ist 64 px breit, ohne Text der Einträge, ohne Klappknopf, auch wenn `collapsed` fehlt.
   - Das Suchfeld ist ≤ 320 px breit.
   - `main` hat 24 px Rand.
   - „Menü“ und „Suchen“ sind unsichtbar.
8. **Zeilenkarte (`Table/PhoneCards`, `DataTable/PhoneCards`, 390):**
   - `primary`-Zellen stehen auf einer Linie (gleiches `top` ± 2 px), `meta`-Zellen darunter (`top` größer), `hidden` hat `display: none`.
   - Der Betrag steht oben rechts (± 2 px zum rechten Innenrand, `top` wie die erste Zelle) und überlappt keinen Text (Rechtecke schneiden sich nicht).
   - Der Kopf folgt derselben Ordnung als Legende und ist sichtbar.
   - In `DataTable/PhoneCards` hat jede Zeile ihren sichtbaren Zeilenlink (`.v2rowlink` mit Breite > 0).
   - Bei 820 px in einer Karte ≥ 640 px stehen dieselben Stories als Tabelle.
9. **Buchungsliste (`JournalEntryReviewList` Grouped, 390):** Datum · Sachverhalt · Betrag in Zeile 1, Konten/BU/Prüfung in Zeile 2, Nr./Beleg/So gebucht/Satzart unsichtbar, kein seitlicher Scroll.
10. **Auswahlleiste (`DataTable/PhoneCards` mit Auswahl, 390):** Mit einer gewählten Zeile sitzt `.v2selbar--sticky` am unteren Fensterrand (`bottom` = `innerHeight` ± 1) und ist nicht breiter als das Fenster. Ihre Schaltflächen sind ≥ 44 px hoch. Nach dem Scrollen von `.app__main` ans Ende liegt die letzte Zeile über der Leiste (`bottom` ≤ `top` der Leiste).
11. **Reiter (`Tabs/WithCounters`, 390):** alle Reiter auf einer Linie, `.v2tabs` scrollt (`scrollWidth > clientWidth`), keine senkrechte Scrollleiste an `.v2tabs`.
12. **Kennzahlen (`KpiTile/SixColumns`, 390):** höchstens zwei Kacheln je Zeile; bei 820 unverändert sechs Spalten.
13. **Zwei Spalten (`Columns/Split`, `ClarificationCard/Step`, 820):**
    - Die Spalten stehen untereinander, die Hauptspalte zuerst (`top` kleiner).
    - Auch die Rückfrage ist bei 390 einspaltig.
    - Ihre Antwortzeilen sind ≥ 44 px hoch und so breit wie die Karte.
    - Die empfohlene Antwort ist markiert.
14. **Schrittleiste (`StepRail/Bar`, 390):**
    - Eine Zeile „Schritt n von m · Name“.
    - Antippen öffnet die Liste aller Schritte mit Punkt und Zähler, jeder Eintrag ist ein Link, Enter öffnet.
    - Bei 820 steht die Leiste wie heute.
15. **Untere Leiste (`Wizard/SecondaryActions`, 390):**
    - `.v2wiz__foot` klebt am unteren Rand, während der Inhalt scrollt.
    - Die Schaltflächen sind ≥ 44 px hoch.
    - `.is-secondary` ist unsichtbar, `.v2bar__more` sichtbar. Das Menü „Mehr“ öffnet nach oben und liegt ganz im Fenster.
16. **Drawer (`Drawer/Open` nach Klick, 390):** Der Drawer ist 390 px breit, der Schließen-Knopf ≥ 44 × 44 px.
17. **Fokus:** Bei 390 ist in der Schublade und in der unteren Leiste jeder Fokusring sichtbar und nicht von der Leiste verdeckt (2.4.11).
18. **Konsole:** Keine Story schreibt bei 390/820/1440 einen Fehler in die Konsole.

## Offene Fragen (höchstens drei, mit Default) — beantwortet

ll-ceo hat am 2026-11-22 über ll-dev96 entschieden: Alle drei Defaults gelten. Auch Zeile 1 der Buchungskarte „Datum · Sachverhalt · Betrag“ ist bestätigt. Die neuen Wörter „Menü“, „Menü schließen“ und „Schritt n von m“ gehen zur Kenntnis an den Owner.

1. **Ein Balken oder zwei auf dem Handy?** Die Skizze in F783 zeigt eine Leiste „☰ Mandant · Jahr ▾ ⌕“. Die Jahreswahl hat ihre Daten aber im Mandantenband, nicht in der Leiste oben. *Default:* Die Leiste oben zeigt „Menü“ · Ort (`crumb`) · „Suchen“. Darunter steht das Band in einer Zeile mit Name · Jahr ▾. Es scrollt mit der Seite weg, damit nur 48 px fest stehen. (ll-dev96)
2. **Neue Wörter „Menü“, „Menü schließen“, „Schritt n von m“:** Die Wörter neben ☰ und ⌕ gibt es, weil ein Icon nie ohne Wort steht (V14). „Schritt n von m“ steht in F783. *Default:* so bauen und dem Owner melden. (Owner)
3. **Kontext der Rückfrage:** F783 will einen aufklappbaren Abschnitt. Die Gruppen darin klappen aber schon. *Default:* kein zweiter Schalter, siehe Ausbau. (ll-dev96)

## Nachtrag 2026-11-22 (nach der ersten Abnahme, vom Spec-Autor)

Die erste Abnahme fand sechs Mängel (7, 8, 9, 3, 17, F6). Behoben ist Folgendes, und für 8, 9 und 17 gelten diese Fassungen:

- **Zu 7:** „Menü“ und „Suchen“ sind `.v2btn`, und `v3.css` lädt nach `app-chrome.css`. Die Regel lautet jetzt `.app__topbar .tb__menu` bzw. `.app__topbar .tb__searchbtn`. Gemessen wird zusätzlich eine Shell **mit** `onOpenNav`/`onOpenSearch` bei 820 und 1440 (Story `Phone` bei diesen Breiten): Dort sind beide unsichtbar.
- **Zu 17, Schublade:**
  - Beim Öffnen geht der Fokus auf das erste fokussierbare Element der Schublade. Beim Schließen (`Esc`, Schleier, Eintrag) kehrt er auf den Auslöser zurück, sonst auf „Menü“, nie auf `body`.
  - Solange die Schublade offen ist, sind **Leiste oben und `main`** `inert`. Die Leiste hängt dafür in `div.app__topwrap` (`display: contents`). Der Name ist seit Nachtrag 2 so, vorher hieß er `.app__top`.
  - Der Schleier zeichnet seinen Fokusring nach innen (`outline-offset: -4px`).
  - Vertrag für die App: `inert` auch an der eigenen `.app__topbar`, solange offen.
- **Zu 17, Auswahlleiste:** `.app__main` mit fester Auswahlleiste hat `scroll-padding-bottom` gleich dem freien Raum (120 px + Safe-Area).
- **Zu 8 und 9, neue Fassung (ersetzt „`primary`-Zellen stehen auf einer Linie“):**
  - Die Karte hat eine **feste** Ordnung, unabhängig von der Länge des Inhalts.
  - Zeile 1: Griffe (Kästchen, Aufklapper), die **erste** Textzelle, die den Rest der Zeile füllt und darin umbricht, und der Betrag oben rechts.
  - Jede **weitere** `primary`-Textzelle steht in einer eigenen vollen Zeile darunter.
  - Danach kommen die `meta`-Zellen.
  - Ein kurzer und ein langer Name stehen damit an derselben Stelle. Das ist der Mangel „bricht 21 px tiefer um“: Er hing von der Länge ab.
  - **Buchungsliste:** Zeile 1 = Kästchen · Aufklapper · Datum · Betrag, Zeile 2 = Sachverhalt in voller Breite, dann Konten/BU/Prüfung.
  - Das weicht vom Wortlaut „Zeile 1: Datum · Sachverhalt · Betrag“ (F783) ab. Grund: Bei 390 px bleiben neben Kästchen, Aufklapper, Datum und Betrag etwa 80 px für den Namen. 60 Zeichen (R27) stünden dann in sieben Zeilen. Die Abweichung wird ll-dev96 gemeldet.
  - Gemessen wird: In jeder Karte einer Story liegt die erste Textzelle auf der Höhe des Kästchens bzw. der ersten Zelle (± 2 px). Jede weitere `primary`-Textzelle beginnt am linken Innenrand der Zeile. Die Lage ist in allen Zeilen gleich.
- **Zu 3:** Die Story `JournalEntryReviewList/Compact` hat statt `width: 680` jetzt `maxWidth: 680`. Am Desktop ist das dieselbe Breite.
- **Hinweise:**
  - H3: `Phone` jetzt im Vollbild.
  - H4: Der Story-Text nennt nur noch, was die Fixture zeigt.
  - H5: Der Verlauf des Avatars ist als Teil der benannten Ausnahme von `app-chrome.css` kommentiert. Er ist derselbe wie bei `.sb__client-avatar`.
  - H6: Das Menü nach oben endet 4 px über dem Auslöser.
  - H7: siehe Fokus oben.
  - H9: `docs/v3-backlog.md` nachgezogen.
  - H1, H2 und H8 bleiben Hinweise: H1 gab es schon vorher, die Stories von H2 nennt die Spec nicht, und H8 betrifft nur die Ausgabe des Skripts.

## Nachtrag 2 · 2026-11-22 (nach der Nachprüfung, vom Spec-Autor)

Die Hinweise der Nachprüfung sind umgesetzt. Kein Kriterium ändert sich.

- **H11:** Der Wrapper heißt `.app__topwrap`, nicht `.app__top`. Die Druckregel in `v3.css` nennt `.app__top` und hat bisher nichts getroffen. Mit dem alten Namen hätte sie beim Drucken still die Leiste oben ausgeblendet. Der Druck bleibt so, wie er vor 0253 war (gemessen: `.app__topbar` im Druck `display: flex`).
- **H12:** „Menü“ und „Suchen“ sind 36 px hoch statt 44 px. Der Fokusring liegt dann 1,5 px im Fenster. Kriterium 6 verlangt ≥ 24 × 24 px.
- **H13:** Den Platz für den Betrag hält nur noch die erste Textzelle frei (`margin-right: 8em + --space-2`). Zeile 2 und alles darunter nutzen die volle Breite; der Sachverhalt der Buchungsliste hat jetzt 320 statt 204 px. Gemessen: kein Text überlappt den Betrag in `Table/PhoneCards`, `DataTable/PhoneCards`, `JournalEntryReviewList` `Grouped`/`Flat` und `AppShell/Phone`. Grenze: Ist die erste Textspalte einer Tabelle `meta`, kann der Text in Zeile 1 unter den Betrag laufen. Das steht als Kommentar im CSS, und die Fixture in `AppShell/Phone` hat deshalb keine `priority` mehr.
- **H10:** Der Build ist nach diesen Änderungen neu gelaufen (Exit 0). Die Wächter sind grün; `check:classes` meldet nur die vier Altfunde. `png-diff` über alle 37 endet mit Exit 0, 36 × 0,000 % und 1 × 0,001 %.
- **H5 (Owner):** Die Ausnahme A5 in der Guideline nennt wörtlich nur die dunkle Seitenleiste. Der Verlauf des Avatars im Mandantenband (wie `.sb__client-avatar`) liegt in der Arbeitsfläche. Diese Frage geht an den Owner. Bis zur Antwort bleibt der Verlauf, weil die App ihn heute schon inline so zeigt.

## Abnahme

Gemessen mit Playwright-MCP gegen `localhost:6118/iframe.html`, bei 390 × 844, 820 × 1180 und 1440 × 900. Die Bilder liegen in `.playwright-mcp/f783-review/` und `.playwright-mcp/f783-review-desktop/`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| F1 Wächter und Build | Exit-Codes: `pnpm typecheck` 0, `check:type` 0, `check:icons` 0, `check:when` 0, `check:language` 0, dazu `check:contrast`, `check:mirror` und `check:domain-paths` je 0. `check:classes` endet mit 1, und zwar genau mit den vier bekannten Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`). Es gibt keinen neuen. `pnpm build` habe ich nicht selbst gestartet (Vorgabe). `storybook-static/index.json` ist von 08:15:40, also jünger als jede geänderte Quelldatei, und enthält die vier neuen Stories | ✓ |
| F2 Datei, Story, Titel | Keine neue Datei. Die neuen Stories stehen in den Familiendateien `AppShell.stories.tsx`, `Table.stories.tsx`, `DataTable.stories.tsx` und `Wizard.stories.tsx`, die Titel in ihren Gruppen | ✓ |
| F3 Code englisch, `@when`/`@instead` | Diff gelesen: Bezeichner und Kommentare sind englisch, Deutsch steht nur in sichtbaren Strings und Story-Texten. `check:when` 0. `ACTION_ICON.menu` hat `meaning` und `instead` | ✓ |
| F4 Kein Hex, kein px in TSX, keine Label-Map | TSX-Diff: kein Hexwert, Stile über Tokens. Zahlen gibt es nur in `cols` (Rasterwert der API) und in den iframe-Maßen von `Narrow` (wie vorher). Status über `DotStatus`/`Badge`, keine Label-Map | ✓ |
| F5 Alle Stories vorhanden | `index.json`: `v3-primitives-rahmen-appshell--phone`, `--narrow`, `v3-primitives-tabelle-table--phone-cards`, `v3-patterns-arbeitsfläche-datatable--phone-cards`, `v3-patterns-rahmen-wizard--secondary-actions`, dazu die bestehenden Stories von JournalEntryReviewList, StepRail `bar` und Drawer `Open`. Jede neue Prop hat ihre Story. Die ausgeschlossenen Zustände sind begründet (leer, lädt und Fehler sind `colspan`-Zeilen) | ✓ |
| F6 Prüfliste §9 | Durchgegangen. Erfüllt sind Trefferflächen („Menü“ 87 × 44, „Suchen“ 99 × 44, Schrittzeile 340 × 44, Schließen 44 × 44), `prefers-reduced-motion`, Schrift aus der Skala und der absolute Betrag in der `position: relative`-Zeile. **Verletzt** sind „Fokusring sichtbar“ (Kriterium 17) und „neue Elemente über 640 px unsichtbar“ (Kriterium 7) | ✗ |
| F7 Im Browser angesehen | 120 Stories der betroffenen Familien bei 390, 820 und 1440 geladen, die Interaktionen unten von Hand ausgeführt | ✓ |
| 1 Desktop unverändert | Die 37 Stories habe ich neu aufgenommen, bei 1440 × 900, `fullPage`, `animations: "disabled"`, `mouse.move(0, 0)` und 600 ms nach `networkidle`, nach `.playwright-mcp/f783-review-desktop/`. `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-review-desktop 0.5` endet mit **Exit 0**: 36 Dateien 0,000 %, `v3-entitäten-klärung-clarificationcard--step` 0,001 %. Das Skript selbst geprüft: 1000 geänderte Pixel in einem Bild von 1440 × 900 ergeben 0,077 % (1000 / 1 296 000). Eine fehlende Datei und eine andere Bildgröße enden mit Exit 1. Keine der 37 Stories setzt `onOpenNav` oder `onOpenSearch`, siehe 7 | ✓ |
| 2 Jede neue Regel unter 1280 | CSS-Diff Regel für Regel gelesen. Außerhalb einer Abfrage stehen nur `display: none` für `.tb__menu`, `.tb__searchbtn`, `.app__scrim`, `.sb__phone`, `.v3stepbar__compact` und `.v2bar__more`, die Klassen `.ludwig-client-band*` und das Löschen der beiden Sperren. Alles andere steht in `max-width: 1279.98px`, `(min-width: 640px) and (max-width: 1279.98px)`, `1023.98px`, `639.98px` oder `@container v2tbl (max-width: 639.98px)`. `container` wird nur unter 1280 gesetzt. `OverflowMenu.place()` ist die benannte JS-Ausnahme | ✓ |
| 3 Kein seitlicher Scroll | Schleife über 120 Stories bei 390 × 844 und 820 × 1180. Ohne Querlauf sind die neuen Stories, der Rahmen, die Reiter, die Kennzahlen, die Spalten, die Rückfrage `Step`, StepRail und Drawer. Bei 390 gilt für jedes `.v2tbl__scroll` `scrollWidth ≤ clientWidth`. **Verletzt:** `v3-entitäten-buchungssatz-journalentryreviewlist--compact` hat bei 390 `scrollWidth` 696 > 390. Die Ursache ist die Story-Hülle mit fester Breite (`style={{ width: 680 }}`) | ✗ |
| 4 Sperre weg | `grep -rn "toonarrow\|toosmall" src` ist leer (Exit 1). L1 in `design-guidelines.md` §5 ist neu gefasst: inhaltlich gleich dem Wortlaut der Spec, ergänzt um die V14-Ausnahme und die Rasterpunkte. §10 und §11 sind nachgezogen | ✓ |
| 5 Tokens | `tokens.css` hat `--bp-phone: 640px`, `--bp-tablet: 1024px` und `--bp-desktop: 1280px` mit Kommentar. Die Medienabfragen des Diffs nutzen nur 639.98, 640, 1023.98 und 1279.98, das JS nutzt `(min-width: 640px)` | ✓ |
| 6 Rahmen Handy | `v3-primitives-rahmen-appshell--phone` bei 390: Die Seitenleiste ist zu (`left` −300, `right` 0, `visibility: hidden`). „Menü“ misst 87 × 44, „Suchen“ 99 × 44. Klick auf „Menü“: Die Schublade ist 300 px breit, die Einträge stehen mit Text (192–232 px), `.sb__phone` ist sichtbar (300 × 63), `aria-expanded="true"`, `aria-controls="app-nav"`, `main[inert]`. `Esc` schließt, Klick auf den Schleier bei (360, 500) schließt, danach ist `inert` weg. Das Band zeigt Name und „2026“ in einer Zeile. Avatar, DATEV-Nummer, Rechtsform und Technik-Link messen 0 × 0, das Band ist `position: static`. `main` hat 16 px Rand (`main` bei x 16, Karte bei x 32). Verbreitern auf 820 meldet `false` und hebt `inert`. Bilder: `f783-review/appshell-phone-open-390.png`, `appshell-phone-closed-390.png` | ✓ |
| 7 Rahmen Tablet | `appshell--in-use`, `--filled`, `--collapsed` und `--interactive` bei 820: Die Seitenleiste ist 64 px breit, die Wörter sind abgeschnitten (im Baum). Der Klappknopf ist unsichtbar (bei `--interactive` im DOM, 0 px). Das Suchfeld ist 320 px breit, `main` hat 24 px Rand. Bild: `appshell-inuse-820.png`. **Verletzt:** `v3-primitives-rahmen-appshell--phone` zeigt bei 820 „Menü“ (87 × 30) und „Suchen“ (99 × 30), bei 1440 ebenso (Bild `appshell-phone-story-1440.png`). Ursache: `.v2btn { display: inline-flex }` in `v3.css` kommt in der Kaskade nach `.tb__menu, .tb__searchbtn { display: none }` in `app-chrome.css` und hat dieselbe Spezifität. Jede Shell mit `onOpenNav` oder `onOpenSearch` ändert damit auch den Desktop. Die 37 Vergleichsbilder enthalten keine solche Story | ✗ |
| 8 Zeilenkarte | `v3-primitives-tabelle-table--phone-cards` bei 390: Die `primary`-Zellen stehen auf einer Linie (Δ 0), `meta` darunter, `hidden` hat `display: none`. Der Betrag hat 18 px Abstand zum rechten Rand der Zeile (Innenrand 18 px), `top` wie die erste Zelle, und schneidet keinen Text. Der Kopf steht als Legende in derselben Ordnung. Bei 820 ist es eine Tabelle. `v3-patterns-arbeitsfläche-datatable--phone-cards` bei 390: `meta`, `hidden`, Betrag und Kopf erfüllt, `.v2rowlink` in allen 12 Zeilen sichtbar (118–199 px). **Verletzt:** Die `primary`-Zellen stehen nicht auf einer Linie. In 11 von 12 Zeilen hat das Auswahlkästchen `top` 180 und der Sachverhalt 201 (Δ 21 px), der Titel bricht unter das Kästchen. „Ausbau“ nennt das als bekannt, das Kriterium verlangt aber ± 2 px. Bei 820 steht die Tabelle als Tabelle, aber die Spalte Sachverhalt ist 0 px breit, und ihr Text liegt über dem Betrag (H1). Bilder: `datatable-phone-cards-390.png`, `datatable-phone-cards-820.png`, `table-phone-cards-390.png` | ✗ |
| 9 Buchungsliste | `v3-entitäten-buchungssatz-journalentryreviewlist--grouped` bei 390: Konten, Kontonamen, BU und Prüfgrund stehen in Zeile 2. „So gebucht“ hat `display: none` (bei `--flat` auch Satzart). Kein seitlicher Scroll (356 = 356). Prüfung, Nr. und Beleg kommen in keiner Story vor. Im Code gelesen: `PHONE_PRIORITY` setzt `verdict` auf `meta`, `number` und `document` auf `hidden`. **Verletzt:** Der Sachverhalt steht nicht in Zeile 1. Datum und Betrag haben `top` 215, der Sachverhalt 236, und so in allen 40 Zeilen. Bild: `journalentryreviewlist-grouped-390.png` | ✗ |
| 10 Auswahlleiste | `datatable--phone-cards` bei 390, erstes Kästchen angeklickt: `.v2selbar--sticky` ist `fixed`, `top` 731, `bottom` 844 = `innerHeight`, 390 px breit. „Freigeben“, „Zurückstellen“ und „Auswahl aufheben“ sind je 44 px hoch, auf zwei Zeilen (740 und 792). Mit `.app__main` am Ende liegt die letzte Zeile bei `bottom` 723, also über der Leiste (731). Bild: `datatable-phone-cards-selection-390.png` | ✓ |
| 11 Reiter | `v3-primitives-navigation-tabs--with-counters` bei 390: vier Reiter auf einer Linie (Δ 0). `.v2tabs` hat `scrollWidth` 433 > `clientWidth` 358, `scrollHeight` = `clientHeight` 43 und `overflow-y: hidden`. Der Unterstrich ist sichtbar. Bild: `tabs-with-counters-390.png` | ✓ |
| 12 Kennzahlen | `v3-primitives-fläche-kpitile--six-columns`: bei 390 drei Zeilen zu je zwei Kacheln, bei 820 eine Zeile mit sechs Spalten | ✓ |
| 13 Zwei Spalten | `v3-patterns-rahmen-columns--split` bei 820 und 390: Hauptspalte `top` 16, Nebenspalte `top` 271, beide volle Breite. Bei 1440 stehen sie nebeneinander. `v3-entitäten-klärung-clarificationcard--step` bei 820 und 390: `.v2clc--side` ist einspaltig, die Hauptkarte steht zuerst. Bei 390 sind die Antwortzeilen 83, 62 und 62 px hoch und 308 px breit, also so breit wie der Inhalt der Antwortkarte (41–349). Die empfohlene Zeile trägt das Abzeichen „empfohlen“. Bilder: `clarificationcard-step-390.png`, `clarificationcard-step-820.png` | ✓ |
| 14 Schrittleiste | `v3-patterns-frame-steprail--bar` bei 390: eine Zeile „Schritt 2 von 6 · Rückfragen“ (340 × 44). Antippen öffnet die Liste mit sechs Einträgen, je mit Nummernkreis und Zähler, jeder ein `a[href]`. Enter auf `summary` öffnet, Leertaste schließt, der Fokusring ist 2 px. `--bar-states`: „Schritt 3 von 6 · Belege“, der gesperrte Schritt bleibt `span` wie am Desktop. Bei 820 misst die kompakte Zeile 0 px, und sechs Schritte stehen in einer Reihe. Bilder: `steprail-bar-390-closed.png`, `steprail-bar-390-tap-open.png` | ✓ |
| 15 Untere Leiste | `v3-patterns-rahmen-wizard--secondary-actions` bei 390: Der Fuß klebt bei `scrollY` 0 und 400 an `bottom` 844. Die Schaltflächen sind 44 px hoch, der Fortschritt steht in einer eigenen Zeile darüber. `.is-secondary` hat `display: none`, `.v2bar__more` ist sichtbar (82 px). „Mehr“ geklickt: Das Menü liegt bei 753–796 über dem Auslöser (792–836) und ganz im Fenster (`left` 8, `right` 216). Bild: `wizard-secondary-actions-390-more-open.png` | ✓ |
| 16 Drawer | `v3-primitives-dialog-drawer--open` nach Klick auf „Kontenblatt ansehen“ bei 390: `v2drawer--md`, `left` 0, 390 px breit, „Schließen“ 44 × 44. `--sizes` (sm) und `--in-use` (lg) sind ebenfalls 390 px breit. Bild: `drawer-open-390.png` | ✓ |
| 17 Fokus | Schublade (`appshell--phone`, „Menü“ per Enter geöffnet, dann Tab): Die Ringe der Einträge sind sichtbar (2 px, im Bild, nicht verdeckt). Auch die Ringe in der Fußleiste des Wizards sind sichtbar (Unterkante 840 ≤ 844). **Verletzt:** (a) Der Fokus bleibt nach dem Öffnen auf „Menü“. „Menü“ (x 24–111) liegt ganz unter der Schublade (x 0–300) und ist unsichtbar, nach dem Öffnen und bei jedem Tab-Umlauf (Bild `appshell-phone-open-focus-on-menu-390.png`). (b) Der Ring des Schleiers „Menü schließen“ liegt mit `outline-offset: 2px` außerhalb des Fensters (Bild `appshell-phone-scrim-focus-390.png`). (c) Die Reihenfolge ist „Menü“ → „Suchen“ → verlässt das Dokument → Schublade → Schleier, nicht Leiste → Schublade → Schleier. (d) Auswahlleiste (`datatable--phone-cards`, eine Zeile gewählt, Tab durch die Karten): Vier von 40 Fokushalten liegen ganz hinter der Leiste, nämlich das Kästchen „Sachverhalt 2026-0421 auswählen“, der Zeilenlink „Dauersachverhalt: Telekom …“ und zweimal „Zurückstellen“ (`top` 734–739, die Leiste beginnt bei 731). Ursache: `scroll-padding-bottom: 72px` an `.app__main`, aber die Leiste ist 113 px hoch. Bild: `datatable-phone-cards-focus-under-selbar-390.png` | ✗ |
| 18 Konsole | 120 Stories bei 390, 820 und 1440, dazu die 37 Bilder und alle Interaktionen oben: kein `console.error` und kein `pageerror`. Im Protokoll steht nur der React-DevTools-Hinweis (info) | ✓ |

Abgenommen von / am: fremder Abnehmer (Subagent), 2026-11-22 · Offene Punkte:

1. **Kriterium 7, auch Desktop:** `.tb__menu` und `.tb__searchbtn` sind über 640 px sichtbar, weil `.v2btn` sie in der Kaskade überstimmt. Am Desktop zeigt jede Shell mit `onOpenNav` oder `onOpenSearch` „Menü“ und „Suchen“.
2. **Kriterium 17, Schublade:** Der Fokus bleibt unsichtbar unter der Schublade auf „Menü“. Der Ring des Schleiers liegt außerhalb des Fensters. Die Tab-Reihenfolge verlässt zwischen Leiste und Schublade die Seite.
3. **Kriterium 17, Auswahlleiste:** `scroll-padding-bottom` 72 px ist kleiner als die Leiste (113 px), deshalb verschwinden vier Fokushalte ganz hinter ihr.
4. **Kriterien 8 und 9:** Die zweite `primary`-Zelle bricht unter die erste (DataTable: Titel unter dem Kästchen, Buchungsliste: Sachverhalt unter dem Datum, je Δ 21 px). Entweder kommt der Ausbau „Titel neben dem Auswahlkästchen“ jetzt, oder die Spec-Autorin ändert die Kriterien mit einem datierten Nachtrag. Der Abnehmer ändert sie nicht.
5. **Kriterium 3:** `JournalEntryReviewList` `Compact` läuft bei 390 seitlich über, weil die Story-Hülle 680 px fest breit ist.
6. **F6** folgt aus 1 bis 3.

Hinweise (nicht blockierend):

- **H1** Bei 820 reserviert die automatische Mindestbreite der DataTable der Spalte `minmax(0, 1fr)` keinen Platz. In `datatable--phone-cards` ist der Sachverhalt 0 px breit, in `--selection` 88 px, und der Text liegt über dem Betrag. Das gab es schon vorher (`--auto-min-width` bei 1440, im Vergleichsbild), mit Tablet als Ziel betrifft es jetzt aber jede breite Liste (vgl. Ausbau `Table.cardBelow?`).
- **H2** Diese Stories sind nicht genannt, laufen bei 390 aber seitlich über: `clarificationcard--in-batch-review` (442 px, `.v2ask` und `.v3clt__item` 427 px breit), `datatable--in-use` (396 px, FilterBar mindestens 380 px), `--auto-min-width` (960 px, auch bei 820) und `--handles-in-floor` (816 px), die letzten beiden wegen fester Breiten in der Story.
- **H3** `AppShell/Phone` hat kein `layout: "fullscreen"`. Der Rahmen steht 16 px eingerückt, und weil `.app` 100dvh hoch ist und das Polster dazukommt, scrollt die Seite 32 px senkrecht (`main` endet bei 860, das Fenster bei 844).
- **H4** Der Text der Story `Phone` sagt, `.sb__phone` trage Rolle, DATEV-Nummer, Rechtsform und Technik. Die Fixture zeigt nur eine Zeile „Musterbau GmbH & Co. KG · DATEV 10234“.
- **H5** `.ludwig-client-band__avatar` bringt einen Verlauf und Hexwerte mit, eine Eins-zu-eins-Kopie aus der App, die die Spec als Ausnahme nennt. Verläufe sind nach CLAUDE.md §2 verboten: Das braucht eine benannte Ausnahme mit Owner und Datum, oder es fällt in M1 weg. Die Klasse `__line` fehlt in der Klassentabelle der Spec.
- **H6** Das Menü „Mehr“ überdeckt seinen Auslöser um 4 px (Menü-Unterkante 796, Auslöser-Oberkante 792), also auch den oberen Rand des Fokusrings.
- **H7** Nach dem Schließen per Klick auf den Schleier fällt der Fokus auf `body` und nicht zurück auf „Menü“.
- **H8** `scripts/png-diff.mjs` zählt richtig. Es gibt aber nur drei Nachkommastellen aus, übersieht Dateien, die nur im zweiten Ordner liegen, und vergleicht keinen Alphakanal.
- **H9** `docs/v3-backlog.md:123` nennt noch die „Vollbild-Sperre unter 1280 px“. `DataTable.stories.tsx` hat jetzt 25 Stories, über der Grenze von 10 lag die Datei schon vorher.

### Nachprüfung 2026-11-22

Geprüft wurde gegen den „Nachtrag 2026-11-22“ und dessen neue Fassungen von 8, 9 und 17. Die Kriterienliste selbst ist unverändert. Bilder mit dem Präfix `n2-` liegen in `.playwright-mcp/f783-review/`, die Desktopbilder in `.playwright-mcp/f783-review2-desktop/`.

| Punkt | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| F1 Wächter | Exit-Codes: `pnpm typecheck` 0, `check:type` 0, `check:icons` 0, `check:when` 0, `check:language` 0 („0 German comment lines left“), `check:contrast` 0, `check:mirror` 0, `check:domain-paths` 0. `check:classes` endet mit 1, und zwar nur mit den vier Altfunden | ✓ |
| 1 Desktop unverändert | Die 37 Stories neu aufgenommen, bei 1440 × 900, `fullPage`, `animations: "disabled"`, `mouse.move(0, 0)` und 600 ms, nach `.playwright-mcp/f783-review2-desktop/`. `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-review2-desktop 0.5` endet mit **Exit 0**: 35 Bilder 0,000 %, `journalentryreviewlist--grouped` und `clarificationcard--step` je 0,001 % (Rauschen) | ✓ |
| 2 Jede neue Regel unter 1280 | Die neuen Regeln gelesen. `.app__topbar .tb__menu, .app__topbar .tb__searchbtn` ist das `display: none` neuer Elemente. `.app__top { display: contents }` steht außerhalb einer Abfrage, ist aber der neutrale Wert eines neuen Wrappers, im Nachtrag genannt und am Desktop pixelgleich (Zeile 1). Fokusring des Schleiers, `transition-property` in der Schublade und `scroll-padding` stehen in `639.98px`, die Kartenordnung in `@container v2tbl`. `OverflowMenu` öffnet bei 1440 mit Platz darunter weiter nach unten (`overflowmenu--filled`: Menü-Oberkante 50, Auslöser-Unterkante 46) | ✓ |
| 3 Kein seitlicher Scroll | Schleife über 120 Stories bei 390 und 820: `journalentryreviewlist--compact` hat jetzt `scrollWidth` 390 = 390, `maxWidth: 680` statt `width`. Über die Seite laufen nur noch die Stories aus H2, die die Spec nicht nennt | ✓ |
| 7 Rahmen Tablet | `v3-primitives-rahmen-appshell--phone` bei 820 und 1440: `.tb__menu`, `.tb__searchbtn` und `.app__scrim` haben `display: none` und messen 0 × 0, ebenso `.sb__phone`. Bei 390 sind „Menü“ (87 × 44) und „Suchen“ (99 × 44) sichtbar. Bei 820 steht die Leiste trotz `div.app__top` richtig im Raster (x 64, 756 × 56). Bilder: `n2-appshell-phone-820.png`, `n2-appshell-phone-1440.png` | ✓ |
| 8 Zeilenkarte (neue Fassung) | Bei 390 liegt die erste Textzelle in jeder Karte auf der Höhe der ersten Zelle (Δ 0) und überall an derselben Stelle (12 px unter der Kartenoberkante). Das gilt für `table--phone-cards` (Gegenpartei, 3 Zeilen) und `datatable--phone-cards` (Sachverhalt neben dem Kästchen, 12 Zeilen). Der Betrag liegt oben rechts (Δ 0, 18 px Innenrand) und schneidet keinen Text. `meta` steht darunter, `hidden` ist unsichtbar. Der Kopf steht als Legende in derselben Ordnung. `.v2rowlink` ist in 12 von 12 Zeilen sichtbar (ab 127 px). Bei 820 ist es eine Tabelle (`display: grid`). Bild: `n2-phone-cards-dt-390.png` | ✓ |
| 9 Buchungsliste (neue Fassung) | `journalentryreviewlist--grouped` (40 Zeilen), `--flat` (12) und `--compact` (6) bei 390. In Zeile 1 stehen Kästchen, Aufklapper, Datum (Δ 0) und Betrag (Δ 0). Der Sachverhalt beginnt am linken Innenrand (Δ 0), in eigener Zeile, so breit wie die Textspalte der Karte (204 bzw. 212 px), in jeder Karte an derselben Stelle (33 bzw. 26 px unter der Oberkante). Danach kommen Konten, BU und Prüfgrund. „So gebucht“ und Satzart sind unsichtbar, kein seitlicher Scroll. Bei 820 ist es eine Tabelle. Bild: `n2-grouped-jerl-390.png` | ✓ |
| 17 Fokus (neue Fassung) | `appshell--phone` bei 390. „Menü“ per Tab und Enter: Der Fokus springt auf „Übersicht“ in der Schublade, der Ring liegt im Bild (Bild `n2-drawer-open-focus-390.png`). Offen tragen `.app__top` und `main` `inert`. Tab-Folge: die Einträge der Schublade, dann „Menü schließen“, dann aus dem Dokument hinaus und wieder in die Schublade. Leiste und `main` werden nicht erreicht. Der Ring des Schleiers liegt mit `outline-offset: -4px` bei 2 bis 388 × 2 bis 842 im Fenster und ist rechts neben der Schublade sichtbar (Bild `n2-scrim-focus-390.png`). Nach `Esc`, nach einem Klick auf den Schleier, nach Enter auf dem Schleier und nach Klick auf einen Eintrag ist die Schublade zu, `inert` weg und der Fokus auf „Menü“. Auswahlleiste (`datatable--phone-cards`, eine Zeile gewählt): `scroll-padding-bottom` ist 120 px bei 113 px Leiste. Von 56 Fokushalten liegt keiner hinter der Leiste, die tiefste Unterkante ist 724, die Leiste beginnt bei 731 | ✓ |
| F6 Prüfliste §9 | Die beiden Verstöße aus 7 und 17 sind behoben. Die übrigen Punkte sind unverändert erfüllt | ✓ |
| 18 Konsole | 120 Stories bei 390, 820 und 1440 sowie alle Interaktionen oben: kein `console.error` und kein `pageerror` | ✓ |
| H3 | `Phone` hat `layout: "fullscreen"`, `scrollHeight` 844 = `innerHeight` | erledigt |
| H4 | Der Story-Text nennt „hier Rechtsform und DATEV-Nummer“, die Fixture zeigt genau das | erledigt |
| H5 | Der Kommentar nennt den Verlauf als Teil der Ausnahme von `app-chrome.css`. Der Verlauf ist wertgleich mit `.sb__client-avatar` (in HEAD vorhanden). Die Ausnahme in `design-guidelines.md` spricht wörtlich von der Seitenleiste, das Band liegt in der Arbeitsfläche. Ob das so gemeint ist, entscheidet der Owner | erledigt |
| H6 | `wizard--secondary-actions` bei 390: Das Menü „Mehr“ liegt bei 745–788 und endet 4 px über dem Auslöser (792), ganz im Fenster. Bild: `n2-wizard-more-open-390.png` | erledigt |
| H7 | siehe 17: Der Fokus geht nach jedem Schließen auf „Menü“, nie auf `body`. Beim Verbreitern auf 820 bleibt er auf dem Eintrag der Seitenleiste | erledigt |
| H9 | `docs/v3-backlog.md:123` sagt jetzt: „Seit 2026-11-22 gibt es sie nicht mehr (0253, L1)“ | erledigt |

Nachgeprüft von / am: fremder Abnehmer (Subagent), 2026-11-22 · Offene Punkte: keine. Status `fertig`.

Hinweise zur Nachprüfung (nicht blockierend):

- **H10** `pnpm build` habe ich nach dem Nachtrag nicht neu gestartet (Vorgabe des ersten Laufs). `storybook-static` ist von 08:15:40 und damit älter als die Korrekturen (08:41–08:47). Vor dem Commit muss der Build einmal laufen.
- **H11** Die Klasse `.app__top` gab es schon: `v3.css` blendet sie in `@media print` mit `display: none !important` aus. Mit dem neuen Wrapper fehlt beim Drucken jetzt auch die Leiste oben. Das passt zur Absicht der Druckregel („ohne Rahmen“), ist aber eine Doppelbelegung ohne vorheriges Greppen.
- **H12** Der Fokusring von „Menü“ wird bei 390 oben um 2 px abgeschnitten (Ring ab y −2). Er bleibt zum größten Teil sichtbar, das ist kein Verstoß gegen 2.4.11.
- **H13** Der Sachverhalt in Zeile 2 ist so breit wie die Textspalte, nicht wie die ganze Karte. Die 8em für den Betrag bleiben auf allen Zeilen frei (204 von 320 px). Lange Sachverhalte brechen deshalb früher um als nötig.
- H1, H2 und H8 bleiben bestehen, wie im Nachtrag begründet.

### Schlussprüfung 2026-11-22

Geprüft gegen „Nachtrag 2 · 2026-11-22“. Bilder mit dem Präfix `n3-` liegen in `.playwright-mcp/f783-review/`, die Desktopbilder in `.playwright-mcp/f783-review3-desktop/`.

| Punkt | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| 1 Desktop unverändert | Die 37 Stories neu aufgenommen, bei 1440 × 900, `fullPage`, `animations: "disabled"`, `mouse.move(0, 0)` und 600 ms. `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-review3-desktop 0.5` endet mit **Exit 0**: 36 Bilder 0,000 %, `clarificationcard--step` 0,001 % | ✓ |
| 17 Fokus | `appshell--phone` bei 390: Enter auf „Menü“ schickt den Fokus auf „Übersicht“ (Ring im Fenster). Offen sind `.app__topwrap` und `main` `inert`. Ein Element `.app__top` gibt es nicht mehr. Tab-Folge: Einträge der Schublade, „Menü schließen“, Dokument verlassen, wieder Schublade. Der Ring des Schleiers liegt bei 2 bis 388 × 2 bis 842. Nach `Esc`, Schleier-Klick und Eintrag-Klick ist die Schublade zu, `inert` weg und der Fokus auf „Menü“ | ✓ |
| H10 Build | `storybook-static/index.json` ist von 09:01:58 und damit jünger als die letzte Änderung (`app-chrome.css` 09:00:45) | erledigt |
| H11 Druck | `emulateMedia({ media: "print" })` bei 1440, `appshell--in-use` und `appshell--phone`: `.app__topbar` hat `display: flex` (56 px hoch), `.app__topwrap` hat `display: contents`. Die Seitenleiste ist wie vor 0253 `none`. Die Druckregel für `.app__top` trifft nichts mehr | erledigt |
| H12 Fokusring „Menü“ | `appshell--phone` bei 390: „Menü“ misst 87 × 36, „Suchen“ 99 × 36, beides ≥ 24 × 24. Der Ring von „Menü“ (Tab, `:focus-visible`) liegt bei y 1,5 bis 45,5 im Fenster. Bild: `n3-menu-focus-390.png` | erledigt |
| H13 · 8 · 9 Betrag und Ordnung | Bei 390 schneidet in `table--phone-cards` (3), `datatable--phone-cards` (12), `journalentryreviewlist--grouped` (40), `--flat` (12), `--compact` (6) und `appshell--phone` (2) kein Textrechteck den Betrag. Das gilt auch für die Kopfzeilen. Die erste Textzelle endet 35 bis 103 px vor dem Betrag. Die Ordnung ist unverändert: Die erste Textzelle steht auf Höhe der ersten Zelle (Δ 0, überall an derselben Stelle), der Betrag oben rechts (Δ 0, 18 px), `meta` darunter, `hidden` unsichtbar. Der Sachverhalt bzw. die Gegenpartei in Zeile 2 beginnt am linken Innenrand und ist jetzt 320 von 320 px breit. Kein seitlicher Scroll. Bilder: `n3-grouped-buchungssatz-390.png`, `n3-phone-cards-arbeitsfläche-390.png` | ✓ |

Schlussgeprüft von / am: fremder Abnehmer (Subagent), 2026-11-22 · Offene Punkte: keine. Status `fertig`. Die Owner-Frage zu H5 aus dem Nachtrag 2 hängt nicht an dieser Abnahme.
