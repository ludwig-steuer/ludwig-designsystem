# 0220 · Typografie-Rollen und Überschriften-Ordnung

| | |
|---|---|
| Status | in Arbeit — gebaut am 2026-10-01 (aae9d49), fremde Abnahme 2026-10-01 (schlanke Abnahme, Schnittstelle): nicht abgenommen, offen M1–M7 (siehe „Abnahme") |
| Stufe | keine Komponente: Regel (`design-guidelines.md`, neuer Entscheid A14), sechs Rollenklassen in `tokens.css`, Erweiterung `scripts/check-type.mjs`, Typografie-Story; Anwendungsfall `Wizard` (Nachtrag 0079) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Schriftrollen und Überschriften-Ordnung sind fachfrei |
| Quelle | Owner-Befund 2026-10-01 über lldev1 („das System soll die Schnitte genauer definieren, sub ist kein Fließtext"; „Typo und Typo-Verwendung festlegen, wo Überschriften verwendet werden, wie viele Ebenen, welche Ordnung, was sind Box-Header") |
| Ersetzt | App (`apps/web/src`, lldev1 gemessen): 34 `h1`–`h4`, davon 32 roh ohne Klasse; 28 `lw-overline`, meist als Abschnittstitel; `<p className="sub">` als Absatz (OnboardingWizard.tsx:139, :236, OnboardingReviewSteps.tsx:58); `wz__progress` (OnboardingWizard.tsx:128, OnboardingReviewSteps.tsx:42). Set: siehe „Abweichungen" |
| Blockiert | App-Migration der Überschriften (lldev1), Wizard-Schrittkopf, Abbau `.wz*` in `components.css` |
| Spec von / am | Claude (DS), 2026-10-01 |

## Ziel

Wer heute eine Überschrift oder einen Absatz in die Oberfläche setzt, hat drei
Kandidaten für Fließtext (`.lw-body` 16, `.lw-body-sm` 14, `--fs-ui` 13,5),
keine Klasse für einen Abschnittstitel und keine Regel, welche `h`-Ebene gilt.
Ergebnis in der App: rohe `h2`, die durch Tailwinds Preflight die
Umgebungsgröße erben, Overlines als Abschnittstitel, `.sub` als Absatz. Ein
Titel ist dann nicht abgesetzt, eine Einleitung liest sich wie eine
Überschrift. Wer nach vier Wochen zurückkommt, braucht aber eine Seite, die
sie in einer Sekunde gliedert: Seite, Abschnitt, Karte, Gruppe. Dafür braucht
jede Rolle **eine** Gestalt, und das Element folgt der Lage, nicht der Optik.

## Einordnung

- **Wiederverwenden:** Die Leiter `--fs-ui-*` (tokens.css:111–117) bleibt
  unverändert, ebenso alle Bausteine mit eigenem Titel (PageHeader, CardHead,
  Drawer, Dialog, DetailPane, FieldList, Field, HeadRow, Markdown).
  Bestand gesammelt am 2026-10-01: Die meisten Bausteine liegen schon auf
  einer Stufe, nur nicht auf derselben (siehe „Abweichungen").
- **Neu, weil:** Für Text, den Aufrufer **frei** in `children` setzen, gibt
  es im produktiven Register keine Klasse. Die `lw-*`-Klassen sind die
  Leiter des lesenden Registers (16 px). Deshalb kommen sechs Rollenklassen
  dazu, nur für Freitext: Abschnitt, Gruppe, Overline, Fließtext,
  Einleitung, Hinweis. Alles, was ein Baustein trägt, bleibt im Baustein.
- **Name:** `lw-ui-*` in `tokens.css`. Die Datei behält ihr Präfix (A13), und
  `ui` spiegelt die Token `--fs-ui-*`. Damit gilt: `lw-ui-*` = produktives
  Register, `lw-*` ohne `ui` = lesendes Register. Geprüft: `lw-ui` kommt
  weder im Set noch in der App vor.
- **Setzt auf:** tokens.css, v3.css, check-type.mjs mit Baseline.

## 1 Rollentabelle (produktives Register)

Stufen aus `--fs-ui-*`, Zeilenhöhe jeweils `--lh-ui-*` derselben Stufe.
Farben: `text` 13,77:1 · `muted` 6,69:1 · `subtle` 4,88:1 (4,51 auf
`bg-soft`, 4,71 auf `surface-head`).

| # | Rolle | Klasse / Baustein | Stufe | Gew. | Farbe | Element | Wo | Nie | Beispiel |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Seitentitel** | `PageHeader`, `EntityHeader`, `StepHeader` | ui-xl 20 | 600 | text | `h1`, genau eins je Seite | Kopf der Seite | in Karte, Drawer, Dialog | „Stapel 2026-08 · Bürobedarf" |
| 2 | **Abschnittstitel** | `.lw-ui-section` | ui-lg 16 | 600 | text | `h2` | über ≥ 2 Karten, die zusammengehören | über einer einzigen Karte; als Overline gesetzt | „Weitere Zahlungswege" |
| 3 | **Flächentitel** | `Drawer`, `Dialog`, `DetailPane`, `StatusCallout`, Wizard-Schritt | ui-lg 16 | 600 | text | `h2` (Wurzel der Fläche) | erster Titel einer Fläche ohne Kopfleiste | zweimal in einer Fläche | „Beleg RE-4471" |
| 4 | **Kartenkopf** | `CardHead` | ui-md 14 | 600 | text | `h2` unter der Seite, `h3` unter Abschnitt oder Fläche | Kopfleiste jeder Karte (D14) | im Karteninhalt als zweiter Titel | „Offene Belege · 38" |
| 5 | **Gruppenkopf** (Unterabschnitt, Feldgruppe) | `.lw-ui-group`, `FieldList`, `GroupRow`, `ProseCard` | ui-sm 12,5 | 700 | muted | eine Ebene unter seiner Fläche (`h3`/`h4`); `th` in Tabellen | ≥ 2 Gruppen in einer Fläche | für eine einzige Gruppe | „Zahlung", „Prüfpunkte" |
| 6 | **Overline** (Einordnung) | `.lw-ui-overline`; PageHeader `overline`, Dialog `kicker`, Callout `kicker` | ui-xs 11,5 | 600 | subtle (im Callout der Ton) | `div`, **nie** `h` | über einem Titel; Gruppenwort in Menü und Listbox | allein als Abschnitts- oder Gruppentitel | „Mandant · Musterfirma GmbH" |
| 7 | **Zeilentitel** | `.v2main`, Titel der Listenzeilen | Zeilenmaß (ui, kompakt ui-sm) | 600 | text | `span`/`div` | erste Zeile eines Eintrags | als Überschrift einer Fläche | „Bürobedarf Meier GmbH" |
| 8 | **Unterzeile** | `CardHead sub`, `Drawer meta`, `DetailPane sub`, Listenzeile `sub` | ui-sm 12,5 | 400 | muted | `div`, eine Zeile | unter einem Kopf oder Listeneintrag | Absatz; Tabellenzelle | „RE-4471 · 26.08.2026" |
| 9 | **Beischrift** | `.v2sub` | ui-xs 11,5 | 400 | subtle | `span`, eine Zeile | zweite Zeile in Tabellenzelle; Zähler; Taste | `p`, Absatz, mehr als eine Zeile | „DE12 5001 0517 …" |
| 10 | **Fließtext** | `.lw-ui-text` | ui 13,5 | 400 | text | `p`, höchstens 68ch | Sätze in einer Fläche: Erklärung, Dialogtext, Ergebnis | in einer Tabellenzelle; als Titelersatz | „Zwei Sätze tragen einen Befund. Die Freigabe bleibt gesperrt." |
| 11 | **Einleitung** | `.lw-ui-lead`; PageHeader `description`, EntityHeader `summary`, Wizard `intro` | ui 13,5 | 400 | muted | `p`, höchstens 68ch | **direkt** unter Seiten-, Abschnitts- oder Flächentitel, höchstens zwei Sätze | unter Kartenkopf (dort Unterzeile); zweimal je Titel | „Anzeigename und Kontenrahmen — Buchungsdaten folgen im nächsten Schritt." |
| 12 | **Hinweis** | `.lw-ui-hint`; `Field hint`, Options-Hinweis | ui-sm 12,5 | 400 | subtle | `p`/`div` | unter Feld, Option oder Block, ein bis zwei Sätze | als Einleitung; als Fehler (dort `Field error`) | „Aus der ersten Zeile geraten." |
| 13 | **Lesetext** | `Markdown`, `ProseCard` | ui 13,5 | 400 | text | `p`; Überschriften `h3`/`h4` | Begründung, Notiz, Agententext | eigene Größen im Text | „Der Kreditor wurde 14-mal auf 6815 gebucht …" |
| 14 | **Feldlabel** | `Field`, `legend` in `RadioGroup` | ui-sm 12,5 | 600 | muted | `label`/`legend` | über jedem Feld (0089) | als Gruppenkopf | „Steuerschlüssel" |
| 15 | **Tabellenkopf** | `HeadRow`, `DataTable` | ui-sm 12,5 | 600 | subtle | `th scope=col` | Spaltenkopf | außerhalb der Tabelle | „Betrag" |
| 16 | **Zahl, Mono** | `.lw-numeric`, `.lw-mono`, Wertzellen | erbt | erbt | erbt | – | Beträge (`tnum`); Konto, BU, DATEV-Code | Beträge ohne `tnum` | „1.249,90 €" · „6815" |
| 17 | **Zustandstitel** | `EmptyState` | ui-md 14 | 600 | text | `p`, keine Überschrift | Leerzustand in Karte oder Fläche | als Abschnittstitel | „Noch keine Belege für 2026" |

**Fließtext ist eine Rolle:** `.lw-ui-text` (13,5 px). `.lw-body` und
`.lw-body-sm` sind Fließtext des **lesenden** Registers (Login, Hilfe,
Marketing, Onboarding-Erklärseiten). Die Typografie-Story nennt
`.lw-body-sm` heute „produktiv, 14 px", das wird korrigiert. `sub`/`.v2sub`
ist Beischrift: eine Zeile, nie ein Absatz, nie `p`.

**Lesendes Register** (unverändert, nur abgegrenzt): `lw-display`,
`lw-h1`–`lw-h4`, `lw-lede`, `lw-body`, `lw-body-sm`, `lw-caption`,
`lw-overline` — ausschließlich auf lesenden Flächen. In `src/ui/v3` stehen
sie nicht (heute 4 × `lw-overline`, siehe Abweichungen).

## 2 Überschriften-Ordnung

1. **Höchstens vier Ebenen**, `h1`–`h4`: Seite → Abschnitt → Karte → Gruppe.
   `h5`/`h6` gibt es nicht.
2. **Genau ein `h1` je Seite**, und es ist der Seitentitel aus `PageHeader`,
   `EntityHeader` oder `StepHeader`. Kein Baustein im Inhalt setzt `h1`.
3. **Keine Sprünge nach unten**: unter `h2` kommt `h3`, nicht `h4`. Fehlt die
   Abschnittsebene, rückt alles eine Ebene hoch (Karte `h2`, Gruppe `h3`).
4. **Das Element folgt der Lage, die Gestalt folgt der Rolle.** Ein
   Kartenkopf sieht als `h2` und als `h3` gleich aus. Bausteine mit Titel
   haben die Ebene ihres häufigsten Orts als Vorgabe und `headingLevel` für
   den anderen (CardHead 2|3, FieldList 3|4). EntityHeader steht fest auf `h1`
   (siehe Nachtrag Bau).
5. **Drawer und Dialog sind eigene Wurzeln:** Titel `h2` (wie Radix
   `Dialog.Title`), darin Gruppen `h3`. Sie hängen nicht an der Ebene der
   Seite darunter. `DetailPane` und der Wizard-Schritt gehören zur Seite:
   Titel `h2`.
6. **Keine Überschrift aus Optik:** Overline, Unterzeile, Beischrift,
   Feldlabel, Einleitung und Zustandstitel sind nie ein `h`-Element; ein
   `h`-Element trägt immer eine der Rollen 1–5 oder Lesetext-Überschriften.
7. **Markdown** (Agententext) liegt immer unter der Ebene seiner Fläche:
   `#`/`##` → `h3`, `###` und tiefer → `h4`, in ui-md bzw. ui, 600, `text`.

Sichtbar sind damit höchstens vier Titelstufen auf einer Seite (20 · 16 · 14
· 12,5) und höchstens drei in einer Karte (Kopf · Zeile · Unterzeile, §9).

## 3 Box-Kopf

- **Der Kartenkopf ist `CardHead`**: Titel (Pflicht, Rolle 4), optional eine
  Unterzeile (Rolle 8, eine Zeile), Meta und Aktionen rechts. Er sitzt auf
  `--color-surface-head` mit Trennlinie (A3). Ein anderer Baustein trägt
  keinen Kartenkopf.
- **Jede Karte hat einen Kopf** (D14). Er wiederholt nicht den Seitentitel:
  Bei einer einzigen Karte nennt er die Menge, die sie zeigt („Offene Belege
  · 38"), nicht die Seite noch einmal.
- **Keine doppelte Überschrift:** Unter dem Kartenkopf steht kein zweiter
  Titel für denselben Inhalt (Kopf „Belege", darunter „Belege" über der
  einzigen Tabelle). Ein Abschnitt mit nur einer Karte hat keinen
  Abschnittstitel; der Kartenkopf trägt.
- **Overline statt Titel: nie.** Eine Overline ordnet einen Titel ein, sie
  ersetzt ihn nicht. Die 28 Overlines der App, die Abschnitte benennen,
  werden Abschnitts- oder Gruppenköpfe. Einzige Ausnahme ohne Titel: das
  Gruppenwort in Menü und Listbox (Combobox, MultiSelectFilter,
  Befehlspalette). Dort ist ein `h`-Element nach ARIA nicht erlaubt.

## 4 Wann überhaupt eine Überschrift

Ein Titel steht nur, wenn er eins von beiden tut:

- **Er ist die Wurzel einer Fläche:** Seite, Drawer, Dialog, Karte,
  DetailPane, Wizard-Schritt. Die haben immer einen.
- **Er grenzt Geschwister voneinander ab:** Es gibt mindestens zwei Abschnitte
  bzw. zwei Gruppen derselben Ebene. Eine einzelne Gruppe bekommt keinen
  Kopf, sie heißt wie ihre Fläche.

Kein Titel über einem einzelnen Satz, über einem einzelnen Feld (dort
Feldlabel) oder als „Bezeichnung: Wert" (dort FactList bzw. Feldlabel).

## 5 Durchsetzung — `pnpm check:type` erweitert

Neue Regeln, Ratsche wie bisher über `type-baseline.json`:

| Regel | Wo | Befund |
|---|---|---|
| T-H1 | `src/**/*.tsx` | `<h1>`–`<h6>` ohne `className` |
| T-H2 | `src/**/*.tsx` | `<h5>`, `<h6>` überhaupt |
| T-SUB | `src/**/*.tsx` | `className="sub"`; `<p` mit `v2sub` |
| T-REG | `src/ui/v3/**/*.tsx` ohne Stories | `lw-h1`…`lw-h4`, `lw-body`, `lw-body-sm`, `lw-caption`, `lw-overline`, `lw-lede`, `lw-display` (lesendes Register im produktiven Code) |

Was statisch nicht geht, misst die Seitenprüfung (§10) im Browser:
Ebenen-Folge ohne Sprung und genau ein `h1` (axe `heading-order`,
`page-has-heading-one`). Das Skript läuft nur im Set. Ob die App es
übernimmt, entscheidet lldev1. Es ist ohne Pfad-Annahmen geschrieben.

## 6 Abweichungen im Set, die der Bau angleicht

| Wo | Heute | Nach der Rolle |
|---|---|---|
| `design-guidelines.md` §9, §12 | Kartentitel ui-lg; Werte-Protokoll (Spaltenkopf 11,5, Unterzeile 12, Leerzustand 13) | Kartenkopf ui-md (wie gebaut); Protokoll auf heutige Werte |
| PageHeader `overline` (v3.css:2207) | ui-2xs | ui-xs (Rolle 6) |
| CardHead `sub` (v3.css:34) | subtle | muted (Rolle 8) |
| CardHead, DetailPane, Dialog, EntityHeader | Titel als `div`, Dialog nur `aria-label` | `h2`/`h3`/`h1` nach Lage; Dialog `aria-labelledby` |
| Drawer (Drawer.tsx:174) | `h3` | `h2` (eigene Wurzel) |
| EmptyState (v3.css:2055, 2061) | Titel `h3` body-lg 18 (lesend); Text body-sm 14 | Zustandstitel ui-md 14 als `p`; Text Einleitung ui 13,5 muted |
| StatusCallout-Titel, Markdown `--1`/`--2` | `primary` bzw. `primary-700`, Markdown ui-lg | `text`; Markdown nach §2.7 |
| Markdown (Markdown.tsx:314–316) | `####` → `h5` | `h4` |
| ProseCard-Text (v3.css:958) | lh 1,6 | `--lh-ui` (Lesetext wie Fließtext) |
| Gruppenköpfe | Clarification-Gruppe 600; ProcessDialog `h3` 600 ohne Farbe; Classification `h3` ui-xs subtle; TaskList-Gruppe ohne Farbe; ListPane-Gruppe subtle | ui-sm · 700 · muted (Rolle 5) |
| Menügruppen | Combobox, MultiSelectFilter ui-2xs; Befehlspalette ui-sm muted | Overline-Stufe ui-xs · 600 · subtle |
| Timeline-Tag (v3.css:2379) | ui-2xs | Overline-Stufe ui-xs |
| `lw-overline` im produktiven Code | Hotkeys.tsx:85, BookingReview.tsx:110 und :151, BankAccountsCard.tsx:500 | Gruppenkopf (Hotkeys, „Prüfpunkte") bzw. Overline (`Satz i von n`) |
| FieldList-Kopf von Hand | BankTransactionFacts.tsx:96, BankTransactionDrawer.tsx:179, RecurringRuleFacts.tsx:377 | `FieldList` oder `.lw-ui-group` |
| `.v2sub` als Absatz | ProcessPicture.tsx:321, Classification.tsx:220/:287, PaymentAccountEditor.tsx:209, AccountDrawer.tsx:180, Log.tsx:198, payment-account-columns.tsx:150 | Hinweis (`.lw-ui-hint`) |
| `.s3zone__text` (nur App) | body-sm 14 | Fließtext ui |
| `ton-und-sprache.md` :52–57, :93 | Leiter ohne Register; PageHeader `sub` | als lesend markiert; `description` |
| Typografie-Story | `.lw-body-sm` „produktiv, 14 px"; Interface-Story mit Inline-Stilen | korrigiert; Rollenklassen |

## 7 Anwendungsfall: Wizard-Schrittkopf (Nachtrag 0079)

| Prop | Typ | Pflicht | Bedeutung | Nachweis |
|---|---|---|---|---|
| `WizardStep.title` | `string` | nein | Schritttitel, Rolle 3 (`h2`, ui-lg 600 text). Nennt die Handlung („Stammdaten erfassen"), das Label in der Leiste bleibt das Substantiv | `Filled` |
| `WizardStep.intro` | `ReactNode` | nein | Einleitung, Rolle 11, höchstens zwei Sätze | `Filled` |
| `progress` | `ReactNode` | nein | Fortschrittszeile im Fuß, Rolle 8 (ui-sm muted, `tnum`), `aria-live="polite"`; Text vom Aufrufer („Schritt 2 von 4", „Onboarding abgeschlossen.") | `WithFooter`, `InUse` |

- Der Kopf steht oben in `.v2wiz__body`: Titel → Einleitung `--space-1`,
  Kopf → Inhalt `--space-5`. Ohne `title` gibt es keinen Kopf im DOM
  (`States`, `ManySteps` bleiben so und beweisen das).
- Kopfdaten stehen am Schritt, nicht am Wizard: Die App führt Titel und
  Hinweis schon je Schritt (OnboardingReviewSteps `s.title`, `s.hint`).
- Fuß: Fortschritt links (`flex: 1`), `footer` rechts — wie im Dialog
  stehen Zurück und Weiter beieinander, die Hauptaktion außen rechts
  (entschieden 2026-10-01).
- Danach räumt der Bau `.wz*` (components.css:133–149) ab, sobald lldev1 die
  App umgestellt hat.

## Stories

- **Typografie** (`v3/Grundlagen/Typografie`): `Scale` (lesend, Notiz
  korrigiert) · `Interface` (Leiter) · **`Roles`** neu: die Tabelle aus §1 mit
  echtem Text je Rolle, Klasse oder Baustein daneben · **`Headings`** neu:
  Seite → Abschnitt → Karte → Gruppe mit sichtbarer `h`-Ebene, daneben
  Drawer als eigene Wurzel · `Registers` · `InUse` auf Rollenklassen. Das sind
  6 Stories: Grundlagen ohne Props, also Übersicht + Ordnung + Einsatz.
- **Wizard**: `Filled` mit Titel und Einleitung · `WithFooter` und `InUse`
  mit `progress` · `States` und `ManySteps` ohne Kopf. Bleibt bei 5.
- Geänderte Bausteine (Abweichungen): bestehende Stories zeigen die neue
  Gestalt; keine neuen Stories außer, wo `headingLevel` dazukommt (je eine
  Zeile in der vorhandenen `InUse`).

## Ausbau

| Was fehlt | Was es trägt | Auslöser |
|---|---|---|
| Ebene automatisch aus dem Kontext (`HeadingLevel`-Context statt Prop) | Provider in `Section`/`Drawer` | sobald `headingLevel` an mehr als drei Bausteinen von Hand gesetzt wird |
| Abschnitt mit Aktionen rechts | `SectionHead` (Titel, Aktionen) | zwei Seiten brauchen eine Aktion am Abschnittstitel |
| `Wizard` in einem Dialog (Ebene 3) | `headingLevel` am Wizard | erste Verwendung im Dialog |

## Entschieden (Owner 2026-10-01)

1. **Leerzustand kleiner:** Titel 18 → 14 px (ui-md 600 `text`), Text
   14 → 13,5 px (Einleitung, `muted`), der Titel ist keine Überschrift mehr.
2. **Titel in `text`:** StatusCallout-Titel und Markdown-Überschriften
   verlassen `primary`; `primary` bleibt Marke und lesendem Register.
3. **Wizard-Fuß:** Fortschritt links, Zurück und Weiter zusammen rechts,
   Weiter außen — wie im Dialog.

## Nachtrag Bau (2026-10-01)

Gebaut wie oben, mit diesen Abweichungen vom Entwurf:

- **EntityHeader ohne `headingLevel`:** Im Set steht er nur als Seitenkopf
  (fünf Showcase-Seiten, keine Seite hat daneben einen PageHeader). Eine Prop
  für eine Ebene, die niemand braucht, ist eine tote Prop (A12). Der Titel
  ist jetzt `h1.v2ehead__name`, der Status steht daneben, nicht darin.
- **StatusCallout-Titel und ProseCard-Kopf bleiben `div`.** Der Callout ist
  eine Meldung, kein Abschnitt. Die Ebene des ProseCard-Kopfs hängt von der
  Lage ab, die der Baustein nicht kennt. Beide haben die Gestalt ihrer Rolle
  (Flächentitel bzw. Gruppenkopf), nur kein `h`.
- **Wizard-Titel in `lw-ui-section`:** Der Flächentitel hat dieselbe Stufe wie
  der Abschnittstitel. Er bekommt keine eigene Klasse mit denselben Werten,
  sonst gäbe es eine zweite Quelle.
- **`check:type` überspringt Template-Strings:** Zwei Stories tragen das HTML
  einer Rechnung als Daten (`<h1>ACME GmbH</h1>`). Das ist fremdes Markup,
  kein JSX. Der Scanner leert die literalen Teile und lässt `${…}`
  (auch verschachtelt) Code bleiben. Selbsttest deckt beides.
- **Gefundene `p.v2sub` außerhalb der Liste in §6** (Showcase, Stories, 15
  Dateien) wurden mitgezogen, meist zu `lw-ui-hint`. Die Baseline bleibt
  leer.
- **Nicht angefasst:** `payment-account-columns.tsx:150` („von Hand" als
  `div.v2sub` unter einem Wert) ist eine richtige Beischrift. `.s3case__title`
  (v3.css, nur App) steht auf `--fs-h3` (22 px, lesend). Das ist ein
  Seitentitel im produktiven Register. Die Klasse wird mit der App-Migration
  (lldev1) auf `ui-xl` gezogen oder durch `PageHeader` ersetzt.

**Gemessen** (Storybook, 1280 px, Playwright, `getComputedStyle` und
`getBoundingClientRect`): Story `Roles` liefert je Rolle Stufe, Gewicht und
Farbe wie §1, z. B. Kartenkopf `h2` 14/600 `rgb(45,45,45)`, Gruppe `h3`
12,5/700 `rgb(92,92,92)`, Beischrift 11,5/400 `rgb(113,113,113)`,
Zustandstitel `p` 14/600. `Headings` hat ein `h1` und keinen Sprung (h1 →
h2 → h3 → h4 → h3 → h2 → h3). Wizard `Filled`: Titel `h2` 16/600, Titel →
Einleitung 4 px, Kopf → Inhalt 20 px. `States` hat keinen Kopf im DOM.
`WithFooter`: Fortschritt links (41–1045 px, `aria-live="polite"`), Zurück
und Weiter rechts (1053–1239). `InUse`: Einleitung 579 px = 67,9 ch, nach
„Weiter" „Schritt 2 von 3". Dialog `h2` über `aria-labelledby`, Drawer-Titel
`h2`, CaseDrawer-Karte `h3`, Höhe des Kartenkopfs unverändert. 47 berührte
Stories ohne Konsolenfehler.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün
- [ ] Code englisch; `@when`/`@instead` an jedem neuen Export
- [ ] Kein Hex, kein px in TSX, keine lokale Label-Map
- [ ] Alle Stories oben vorhanden
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Sechs Klassen `lw-ui-section/-group/-overline/-text/-lead/-hint` in `tokens.css`, Werte wie §1, je mit Kontrastkommentar
- [ ] `design-guidelines.md`: §1-Tabelle, §2-Ordnung, §3 Box-Kopf, §4 Wann, als A14 in §13 mit Datum; §9/§12 nachgezogen
- [ ] `check:type` meldet T-H1, T-H2, T-SUB, T-REG mit Selbsttest (`--test`); Baseline nur für das, was der Bau nicht in derselben Lieferung behebt
- [ ] Story `Roles` zeigt alle 17 Rollen mit gemessener Größe, Gewicht und Farbe (im Browser per `getComputedStyle` geprüft)
- [ ] Story `Headings`: axe `heading-order` und `page-has-heading-one` ohne Befund
- [ ] Jede Zeile in §6 angeglichen oder mit Grund in die Baseline
- [ ] Wizard: `title`/`intro` rendern `h2` + `p.lw-ui-lead` mit `--space-5` zum Inhalt (Story `Filled`, gemessen); ohne `title` kein Kopf im DOM (`States`); `progress` steht links, ist `aria-live` (Story `WithFooter`)
- [ ] Bei 1280 px: Einleitung bricht bei höchstens 68ch um

## Abnahme

Stand `aae9d49`. Gemessen mit Playwright im laufenden Storybook (Port 6107),
Fenster 1280 px, `getComputedStyle` und `getBoundingClientRect`; axe-core
4.11.4 in die Seite geladen. Storybook-Build nicht im Arbeitsbaum, sondern
mit `pnpm exec storybook build -o <Scratch>`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `pnpm typecheck` Exit 0 · `pnpm exec storybook build -o <Scratch>` Exit 0 („Storybook build completed successfully") · `pnpm check:type` Exit 0 („0 older findings left in 0 files") | ✓ |
| Code englisch; `@when`/`@instead` an jedem neuen Export | `pnpm check:language` Exit 0 (Selbsttest 14 Fälle), `pnpm check:when` Exit 0 (Selbsttest 11 Fälle). Kein neuer Export: neu sind nur Props (`WizardStep.title`/`intro`, `Wizard.progress`, `CardHead.headingLevel`, `FieldList.headingLevel`), JSDoc englisch; Story-Namen `Roles`, `Headings` englisch | ✓ |
| Kein Hex, kein px in TSX, keine lokale Label-Map | Hinzugefügte TSX-Zeilen von `aae9d49` durchsucht: kein Hex, kein `fontSize`/`fontWeight`; px nur in `Table cols` der Story `Roles` (Spaltenbreiten, so in 57 Stories üblich). Keine Label-Map | ✓ |
| Alle Stories oben vorhanden | Index: Typografie `--scale`, `--interface`, `--registers`, `--in-use`, `--roles`, `--headings` (6); Wizard `--filled`, `--states`, `--with-footer`, `--many-steps`, `--in-use` (5). **Aber** `Headings` zeigt nur Seite → Abschnitt → Karte → Gruppe; der verlangte „Drawer als eigene Wurzel daneben" fehlt (M2) | ✗ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Schlank: `@when`/`@instead` ✓, Schrift aus der Skala ✓ (`check:type`), Story-Deckung ✓. Neue Zeile „Überschriften nach §2a" an drei Stellen verletzt: Karten in Drawern bleiben `h2` (M3), zwei `h1` in `v3-patterns-rahmen-entityheader--in-use` (M4), Karte `h2` direkt unter dem Schritttitel `h2` in `v3-patterns-rahmen-wizard--in-use` (M5). Maße, Hover, Fokus, Kontrast gemessen: vertagt nach 0119 | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | 216 Stories der berührten Bausteine bei 1280 px abgefahren (Typografie, Wizard, Dialog, Drawer, EmptyState, FieldList, Markdown, Table, PageHeader, EntityHeader, MasterDetail, StatusCallout, ProseCard, Combobox, MultiSelectFilter, CommandPalette, Timeline, TodoList, HotkeyLegend, ProcessPicture, StatusInfoDialog, ReasonDialog und die Entitäts-Drawer): 215 zeigen Inhalt, `v3-primitives-dialog-dialog--closed` absichtlich leer; keine Konsolenfehler oder -warnungen (nur `favicon.ico` 404 des Dev-Servers); kein `h` ohne Klasse, kein `h5`/`h6`; jeder `Dialog` zeigt per `aria-labelledby` auf sein `h2` | ✓ |
| Sechs Klassen `lw-ui-section/-group/-overline/-text/-lead/-hint` in `tokens.css`, Werte wie §1, je mit Kontrastkommentar | Klassen da (`tokens.css:336–395`), Werte wie §1 (siehe Zeile `Roles`). Kontrast steht nur einmal als Blockkommentar je Farbe (`:331–332`), nicht an der Klasse und nicht in der Form, die `check:contrast` nachrechnet; die Zeile `:331` („WCAG 1.4.3 AA, 4.5:1") ist für den Wächter eine unauflösbare Angabe: `pnpm check:contrast` **Exit 1** („1 in tokens.css lassen sich nicht auflösen"), auf `aae9d49^` Exit 0 (M1) | ✗ |
| `design-guidelines.md`: §1-Tabelle, §2-Ordnung, §3 Box-Kopf, §4 Wann, als A14 in §13 mit Datum; §9/§12 nachgezogen | §2a (`design-guidelines.md:79–141`): 17 Rollen, Ordnung 1–7, Box-Kopf, Wann, Durchsetzung; A14 in §13 (`:692–694`, „Owner 2026-10-01"); §9 Kartenkopf `--fs-ui-md` und neue Zeile Überschriften (`:285–286`); §10 Gliederung (`:313`); §12 Werte-Protokoll Stand 2026-10-01 (`:641–646`) | ✓ |
| `check:type` meldet T-H1, T-H2, T-SUB, T-REG mit Selbsttest (`--test`); Baseline nur für das, was der Bau nicht behebt | `node scripts/check-type.mjs --test` Exit 0 — 13 Rollenfälle (rohes `h2`, Klasse über Zeilen, `h5`, `p.sub`, `p.v2sub`, Unterzeile außerhalb `p`, `lw-overline` in v3, produktive Klasse, Stories frei, Template-String als Daten samt Zeilennummer und Verschachtelung, Klasse aus Template). `scripts/type-baseline.json` = `{}`. T-REG prüft `src/ui/v3` und `src/showcase` (weiter als die Spec, strenger) | ✓ |
| Story `Roles` zeigt alle 17 Rollen mit gemessener Größe, Gewicht und Farbe | `v3-grundlagen-typografie--roles`, 16 Zeilen (7 und 9 in einer): 1 `h1` 20/600 `rgb(45,45,45)` · 2 `h2` 16/600 text · 3 `h2` 16/600 text · 4 `h2` 14/600 text · 5 `h3` 12,5/700 `rgb(92,92,92)` · 6 `div` 11,5/600 `rgb(113,113,113)` · 7 `span` 13,5/600 text · 8 `div` 12,5/400 muted · 9 `span` 11,5/400 subtle · 10 `p` 13,5/400 text, max 579 px · 11 `p` 13,5/400 muted · 12 `p` 12,5/400 subtle · 13 `p` 13,5/400 text, Überschrift `h3` 14/600 text · 14 `label` 12,5/600 muted · 15 `th scope=col` 12,5/600 subtle · 16 `tnum` bzw. JetBrains Mono · 17 `p` 14/600 text, Text 13,5 muted. Alle wie §1 | ✓ |
| Story `Headings`: axe `heading-order` und `page-has-heading-one` ohne Befund | `v3-grundlagen-typografie--headings`, axe `heading-order`, `page-has-heading-one`, `empty-heading`: 0 Verstöße, alle bestanden. Gliederung h1 Zahlungswege → h2 Bankkonten → h3 Girokonto → h4 Zahlung, h4 Abgleich → h3 Tagesgeld → h2 Weitere Zahlungswege → h3 Kasse, h3 Kreditkarte | ✓ |
| Jede Zeile in §6 angeglichen oder mit Grund in die Baseline | 16 von 19 Zeilen angeglichen (Guidelines §9/§12, PageHeader-Overline, CardHead-`sub`, DetailPane/Dialog/EntityHeader/Drawer als `h`, EmptyState, Callout- und Markdown-Titel, Markdown `h4`, ProseCard-Zeilenhöhe, Gruppenköpfe, Menügruppen, Timeline-Tag, `lw-overline`, `.v2sub` als Absatz, `.s3zone__text`, `ton-und-sprache.md`); `payment-account-columns.tsx:150` mit Grund im Nachtrag. Offen: „CardHead … nach Lage" nur teilweise (M3), „FieldList-Kopf von Hand" nur `div` → `h3`, weiter von Hand (M7), „Typografie-Story" nur in `Scale` korrigiert (M6) | ✗ |
| Wizard: `title`/`intro` rendern `h2` + `p.lw-ui-lead` mit `--space-5` zum Inhalt (`Filled`); ohne `title` kein Kopf (`States`); `progress` links, `aria-live` (`WithFooter`) | `v3-patterns-rahmen-wizard--filled`: `h2.lw-ui-section` 16/600 `rgb(45,45,45)`, `p.lw-ui-lead` 13,5 `rgb(92,92,92)`, Titel → Einleitung 4 px, Kopf → Inhalt 20 px. `--states` und `--many-steps`: kein `.v2wiz__head`, kein `h` im DOM. `--with-footer`: Fortschritt `span` `aria-live="polite"` 41–1045 px, 12,5 muted `tabular-nums`; Zurück 1053–1130, Weiter 1138–1239. `--in-use`: nach „Weiter" „Schritt 2 von 3", dann „Schritt 3 von 3" | ✓ |
| Bei 1280 px: Einleitung bricht bei höchstens 68ch um | `p.lw-ui-lead` in `--filled`, `--with-footer`, `--in-use`: 579,1 px = 68,0ch (gegen die Breite der „0" derselben Schrift gemessen), zwei Zeilen | ✓ |
| Schlank: Props gegen die Schnittstelle (§7, Nachtrag 0079, §2.4) | `Wizard.tsx`: `title?: string`, `intro?: ReactNode`, `progress?: ReactNode`; Fuß nur bei `footer` oder `progress`. `Table.tsx` `CardHead.headingLevel?: 2 \| 3` = 2; `FieldList.tsx` `headingLevel?: 3 \| 4` = 3; EntityHeader ohne Prop, fest `h1` (Nachtrag Bau). Story-Deckung: `title`/`intro` in `Filled`, `InUse`; `progress` in `WithFooter`, `InUse`; `headingLevel` beider Bausteine in `Typografie/Headings` (Table- und FieldList-Stories haben kein `InUse`, in das die Zeile hätte gehen können) | ✓ |
| Schlank: Wächter über den Exit-Code | `check:type`, `check:language`, `check:when`, `check:icons` Exit 0; Selbsttests `check:type`, `check:language`, `check:when`, `check:classes` Exit 0. `check:contrast` **Exit 1** durch diese Lieferung (M1). `check:classes` Exit 1 durch fremde Commits (`v3clt`, `v3clt__step` aus 8b62f80, `v2tbl__foot` aus 9f88f45, `cy-page` aus d59790c), nicht durch `aae9d49` | ✗ |

Abgenommen von / am: Claude (fremde Abnahme, nicht der Bauende), 2026-10-01, Stand `aae9d49` — **schlanke Abnahme (Schnittstelle)** plus die gemessenen Kriterien der Spec (Roles, Headings, Wizard); Maße, Kontraste, Hover und Fokus an vier Breiten vertagt nach 0119 · **Nicht abgenommen.** Offene Punkte:

- **M1** `src/styles/tokens.css:331–332` — Der Kontrast der sechs Klassen steht als Blockkommentar je Farbe, nicht an der Klasse, und „4.5:1" in `:331` ist für `check:contrast` eine unauflösbare Angabe: der Wächter fällt von Exit 0 auf Exit 1. Vorschlag: je Klasse ein Kommentar in nachrechenbarer Form (z. B. ``/* `--color-text-muted`, 6.69:1, 6.17:1 on bg-soft, 6.45:1 on surface-head */``), die AA-Schwelle ohne „:1" schreiben (z. B. „AA ab 4,5").
- **M2** `src/ui/v3/Typography.stories.tsx:351–389` — Story `Headings` zeigt keinen Drawer als eigene Wurzel daneben, wie „Stories" verlangt. Vorschlag: rechts daneben eine offene Drawer-Fläche (`Drawer` mit Titel `h2`, darin `CardHead headingLevel={3}` oder `FieldList`), Gliederung getrennt auslesen.
- **M3** `src/ui/v3/entities/payment-account/PaymentAccountDrawer.tsx:102` und `src/ui/v3/entities/source-document/SourceDocumentDrawer.tsx:216` — Karten im Drawer bleiben `h2` (gemessen: „Letzte Zahlungen" bzw. „Rechnung" `h2` unter dem Drawer-Titel `h2`), gegen §2.5; im SourceDocumentDrawer springt die Ebene sogar zwischen Laden (`:193`, `h3`) und gefüllt (`h2`). Vorschlag: `headingLevel` durch `BankTransactionExcerpt` und `SourceDocumentCard` reichen. Damit wird `headingLevel` an mehr als drei Bausteinen von Hand gesetzt, also der Auslöser für den `HeadingLevel`-Context aus „Ausbau" — das vorher entscheiden.
- **M4** `src/ui/v3/patterns/EntityHeader.stories.tsx:225` — `InUse` setzt `PageHeader` über `EntityHeader`, gemessen zwei `h1` auf einer Seite (gegen §2.2). Das widerspricht auch der Begründung im Nachtrag Bau („keine Seite hat daneben einen PageHeader"). Vorschlag: `InUse` wie 0050 zusammensetzen (`RecordPager` über dem `EntityHeader`, ohne `PageHeader`) oder `EntityHeader` doch `headingLevel` 1/2 geben.
- **M5** `src/ui/v3/patterns/Wizard.stories.tsx:165` — In `InUse` Schritt 2 steht `CardHead` „Vorschau" als `h2` direkt unter dem Schritttitel `h2` „Vorschau prüfen". Nach Rolle 4 und §2.5 ist eine Karte unter einem Flächentitel `h3`, und „Stories" verlangt die `headingLevel`-Zeile im vorhandenen `InUse`. Vorschlag: `headingLevel={3}`.
- **M6** `src/ui/v3/Typography.stories.tsx:175–200` und `:121–168` — Die §6-Zeile „Typografie-Story" ist nur in `Scale` erledigt. `Registers` zeigt den produktiven Absatz weiter in `lw-body-sm` und die Köpfe in `lw-overline`, also genau die Zuordnung, die A14 aufhebt. `Interface` hat weiter Inline-Stile und Notizen gegen §1: `:129` Flächentitel „Karte, Detail, Markdown-Überschrift", obwohl Kartenkopf und Markdown-`h3` ui-md sind; `:144` Unterzeile „Hinweis, zweite Zeile einer Zelle", obwohl die zweite Zeile Beischrift ui-xs ist und der Hinweis subtle. Vorschlag: `Registers` auf `lw-ui-text`/`lw-ui-overline`, `Interface`-Notizen nach §1, Rollenklassen, wo es sie gibt.
- **M7** `src/ui/v3/entities/bank-transaction/BankTransactionFacts.tsx:96`, `BankTransactionDrawer.tsx:179`, `src/ui/v3/entities/recurring-rule/RecurringRuleFacts.tsx:377` — Der „FieldList-Kopf von Hand" wurde nur von `div` zu `h3`, die innere Klasse `.v2fields__h` bleibt von Hand gesetzt. §6 verlangt `FieldList` oder `.lw-ui-group`, und der Nachtrag Bau nennt keine Ausnahme. Vorschlag: `.lw-ui-group` (die Trennlinie über eine Layout-Klasse) oder die Ausnahme mit Grund in den Nachtrag Bau.

Hinweise ohne Mangel: Zeilenhöhe nicht überall die `--lh-ui-*` der Stufe, wie die Einleitung zu §1 sagt — Dialog-Titel 24,8 px (1,55), Kartenkopf 21,7 px (geerbt 1,55), Markdown-Überschrift 18,2 px (1,3) gegen 21,6 px bei `lw-ui-section`. Kein Kriterium, gehört zur gemessenen Prüfung (0119). `src/showcase/deck/DeckScreens.stories.tsx:90` setzt den Seitentitel des Decks als `h1.lw-h2` (lesend, 30 px) statt Rolle 1 (ui-xl 20). T-REG nimmt Stories aus, Wert unverändert gegenüber vorher.
