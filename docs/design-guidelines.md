# Ludwig UX-Guidelines — Designsprache und UX (SSOT)

> **Dieses Repo führt die Designsprache.** Das Dokument ist hierher gezogen und
> wird hier gepflegt — nicht mehr in `ludwig/app/docs/`. Die Fassung, die dort
> noch liegt, ist die alte; sie wird beim Einbinden als Submodule durch einen
> Zeiger hierher ersetzt. Bis dahin gilt: **Änderungen nur hier.**
>
> **Pfade im Text zeigen auf die App.** Übersetzung in dieses Repo:
> `apps/web/src/ui/v2` → `src/ui/v3`, `src/styles/v2.css` → `src/styles/v3.css`,
> `src/styles/tokens.css` → `src/styles/tokens.css`. Der Werkbank-Port ist hier
> 6107 statt 6106.

**Gilt für** jede Oberfläche unter `apps/web` im produktiven Register (= v2, §1).
**Leser** sind Agenten, die Screens bauen, migrieren oder abnehmen — deshalb
Tabellen statt Prosa, jede Regel mit erkennbarem Verstoß.
**Vorrang bei Widerspruch:** Code (`tokens.css`, `v2.css`, `status-registry.ts`)
> dieses Dokument > `design/Ludwig Design System v2/README.md` (Marken-Brief)
> Design-Artboards (`~/dev/ludwig/design-ergebnis/`, nicht im Repo).
**Nicht hier:** Hex-Werte, Pixelmaße, Kontrastzahlen (A5) — nur in `tokens.css`
(Farbe + Kontrastwert als Kommentar am Token) und `v2.css` (Maße). Code-Regeln
der Web-App (Module, Drawer-Katalog, Tests): `docs/topics/web-ui.md` R1–R17,
`apps/web/AGENTS.md`.
**Stand 2026-08-30:** A1–A7 entschieden (A7 noch nicht umgesetzt, §11.5) ·
V1–V14, L1–L7, T1–T9, Z1–Z6, I1–I10 zur Abnahme (§13). Ersetzt `F122-v2-designsprache.md`,
`F122-v2-token-werte.md`, `F122-v2-inventar.md` (konsolidiert, gelöscht).

Kürzel: **V** Prinzip · **L** Layout · **T** Text · **Z** Zustand · **I**
Interaktion · **A** Owner-Entscheid · **R/S/P** Regeln/Probleme aus `docs/topics`.

---

## 0 Zielgruppe und Maß

- Steuerfachangestellte und Steuerberater kleiner Kanzleien. Sie öffnen Ludwig
  **alle zwei bis vier Wochen**, wenn ein Stapel ansteht (Owner 2026-08-30).
- **In der Sitzung** Vielnutzerin: 300 Zeilen, Beträge über 20 Zeilen
  vergleichen, 40× dieselbe Handlung, scannt statt liest → V1, V6, V11.
- **Zwischen den Sitzungen** vergisst sie Ludwig → V14.
- **Maß:** Aufgaben/Stunde und Fehlerquote in der Sitzung **und** Zeit bis zur
  ersten richtigen Handlung nach vier Wochen Pause. Was das zweite
  verschlechtert, darf das erste nicht verbessern.
- v2 = Enterprise-Software: kompakt, Bedienbarkeit und Lesbarkeit vor
  Gestaltung, hoher Kontrast, Farbe bedeckt außer als Hinweis. Ruhe entsteht
  durch Gleichförmigkeit und Farbdisziplin, nicht durch Luft.

## 1 Zwei Register, ein Token-Satz (A1)

| Register | Wo | Basis | Weißraum |
|---|---|---|---|
| **produktiv** (= v2) | `/clients/**`, `/admin/**`, `/dashboard` | 13.5–14 px | knapp **in** der Zeile, großzügig **zwischen** Blöcken |
| **lesend** | `(auth)/login`, `/hilfe/**`, Onboarding-Erklärtexte, Marketing; `/portal/**` prüfen (F111 B6) | 16 px | großzügig |

Alles Folgende gilt dem produktiven Register, wenn nicht anders gesagt.

## 2 Visuelle Basis (beide Register)

| Bereich | Regel |
|---|---|
| Palette | Fünf Farben: `primary` · `accent` · `text` · `bg-soft` · `bg`; Semantik `success`/`warning`/`danger`, entsättigt. Verboten: Gold, Warmtöne, Lila, Pink, Neon, Verläufe quer durchs Spektrum. Rollen §3. |
| Schrift | `--font-sans` (Inter) UI + Text · `--font-serif` nur editorial (Hero, Zitat) · `--font-mono` Kontonummern, BU-Schlüssel, DATEV-Codes. Beträge immer `--font-feat-tabular`. |
| Raster | 4-px-Grundraster, 8-px-Rhythmus, Abstände nur aus `--space-*`. |
| Rand | 1 px, nie dicker (Ausnahme aktiver Tab 2 px). `--color-border` Standard, `-strong` Tabellenblock, `-subtle` Zeile, `-control` Eingabeelement (3:1). |
| Karte | Weiß; 1 px `--color-border` **oder** `--shadow-sm`, nie beides. Radius `--radius-md`, hervorgehoben `--radius-lg`. Kopf mit Trennlinie auf `--color-surface-head` (A3). Padding ≥ `--space-5`, Inhaltskarten `--space-6`. |
| Tabelle | Trennlinien `--color-border-subtle`, keine Zebra-Streifen, keine Gitter (V4). Maße `v2.css`. |
| Radius | sm Inputs/Tags · md Buttons/Karten · lg große Karten/Dialoge · xl nur Hero · pill nur Status-Badge. Nichts „cuddly". |
| Schatten | `--shadow-xs…lg`, sparsam: Menü, Popover, Dialog. Karten bevorzugen Rand. |
| Icon | Lucide, Stroke 1.5 px, `currentColor`, 16/20/24 px, **nur funktional, nie ohne Wort**. Keine Emoji, keine Unicode-Icons (✓ ✗ ⚠ ●), keine farbigen/gefüllten/animierten Icons (Ausnahme Füllung im Status-Badge). |
| Bewegung | Fade, Translate-Y 4–8 px, Höhe beim Ausklappen; `--duration-fast/base/slow`, `--ease-standard`. Kein Skalieren, Federn, Parallax, Glanz (V12). |
| Hover | **Jedes klickbare Element hat einen Hover-Zustand** — Zeile, Karte, Tab, Chip, Icon-Knopf, Link. Hintergrund eine Tonstufe (Link: Unterstreichung); nichts wächst, nichts springt. Ohne Hover-Antwort ist ein Element nicht klickbar; umgekehrt bekommt nichts Hover, was nicht klickt. |
| Fokus | `:focus-visible` mit `--color-focus`, 2 px + Offset, nie abgeschaltet (V10). |
| Ebenen | Backdrop-Blur nur Dialog-Overlay; kein Glassmorphism, keine Texturen, keine Illustrationen. |

## 3 Kritikalität und Farbrollen

**Farbe kodiert Kritikalität, nie einen Wert** (A7). Eine Skala, vier Stufen,
je genau eine Farbkategorie — technisch (Log-Level, Job, Pipeline) und fachlich
(Sachverhalt, Stapel, Abweichung) dieselbe:

| Stufe | Token | Registry-`kind` | Bedeutung |
|---|---|---|---|
| **Fehler** | `--color-danger` / `-bg` | `danger` | jemand muss handeln, bevor es weitergeht: gescheitert, überfällig, L7 > ±100 % |
| **Warnung** | `--color-warning` / `-bg` | `warning` | quittierbar, weiter möglich: Klärung offen, Prüfung nötig, L7 ±50–100 % |
| **Hinweis** | `--color-info` / `-bg` | `info` | neutral informierend, keine Handlung: läuft, zur Prüfung, L7 ±15–50 % |
| **Debug** | `--color-text-subtle` / `--color-bg-soft` | `neutral` | ohne Kritikalität; Technik-Sicht, Ruhezustände, L7 ≤ ±15 % |

`--color-success` (`kind: success`) ist keine Kritikalitätsstufe, sondern der
**Ausgang „erledigt"** (V6, dritte Frage). Ein Vorzeichen, ein Haben-Betrag,
eine Kategorie trägt keine Stufe und damit keine Farbe. Eine zweite Farbe für
dieselbe Stufe („warning-strong") ist ein Verstoß.

**Farbrollen**

| Rolle | Token | Text | Fläche | Rand/Icon | Anmerkung |
|---|---|:--:|:--:|:--:|---|
| Marke, Titel, Primär-Button | `--color-primary` (+`-600` Hover, `-800` Press) | ja | ja | ja | App-Chrome, H1–H2 |
| Aktion, Link, aktiv | `--color-accent-700` | ja | — | ja | die **einzige** Akzentstufe für Text |
| | `--color-accent` (`-600`), `-500`, `-100`, `-50` | **nein** | ja | ja | Fläche, Fokusring, aktive Zeile |
| Text | `--color-text` · `-muted` · `-subtle` | ja | — | — | subtle = kleinste Textstufe (Unterzeile, Spaltenkopf) |
| Text auf Dunkel | `--color-text-on-dark` (+`-muted`) | ja | — | — | Sidebar, Hero |
| Grund | `--color-bg` · `-soft` · `-sunken` | — | ja | — | Seite · Arbeitsfläche · eingelassen |
| Karte | `--color-surface` · `-head` | — | ja | — | Körper · Kopf/Fuß |
| Trennlinie | `--color-border-subtle` · `-border` · `-strong` | — | — | ja | dekorativ, kein Kontrastanspruch |
| Kontroll-Rand | `--color-border-control` | — | — | ja | identifizierend, 3:1 |
| Erledigt (Ausgang) | `--color-success` / `-bg` | ja | ja | ja | Haken, bestanden, freigegeben |
| Warnung | `--color-warning` / `-bg` | ja | ja | ja | Stufe 2 der Skala |
| Fehler | `--color-danger` / `-bg` | ja | ja | ja | Stufe 1 der Skala |
| Hinweis | `--color-info` / `-bg` | ja | ja | ja | Stufe 3; Alias auf Akzent |
| Fokus | `--color-focus` / `-ring` | — | — | ja | |

Was hier nicht steht, ist grau: Kategorien, Belegarten, Mandanten, Avatare,
Vorzeichen.
`--grad-*` nur lesendes Register.

## 4 Prinzipien V1–V14

| | Regel | Verstoß |
|---|---|---|
| **V1 Dichte ist Entscheidung** | Standardzeile kompakt (`.v2tbl__row`); zweizeilig = dieselbe Padding-Regel. | Chip/Button/Icon drückt die Zeile auf — der Chip wird kleiner, nicht die Zeile größer. |
| **V2 Lesbarkeit schlägt Gestaltung** | Bei Konflikt gewinnt „liest sich schneller". | Ausrichtung/Abstand/Farbe geändert, ohne dass eine Frage schneller beantwortet wird. |
| **V3 Text links, Zahlen rechts, nichts zentriert** | Beträge/Mengen rechts mit `tnum` (`.v2num`), Spaltenkopf folgt der Spalte, Datum links. Gilt für Formulare, Leerzustände, Dialoge, Seitenköpfe. | `text-align: center` in v2 — kein legitimer Fall. |
| **V4 Linien, keine Streifen** | Eine Trennlinie `--color-border-subtle`; keine Zebra, keine Gitter, kein Zellrahmen. Hintergrundfarbe ist reserviert für Zeilenmarkierung (aktiv/ausgewählt/alarmiert). | Zebra-Streifen; > 9 Spalten (Antwort: eine Spalte weniger, V8). |
| **V5 Jede Tabelle in einer Karte** | Kartenkopf nennt Inhalt + trägt Aktionen; Spaltenkopf steht immer, auch leer. Auch bei drei Zeilen. | Frei schwebende Zeilen; Leerzustand ohne Spaltenkopf. |
| **V6 Farbe ist Signal** | Farbe nur für: *Wo klicke ich?* (Akzent) · *Erledigt/schiefgelaufen?* (semantisch) · *Wer ist am Zug?* (Staffelstab). Farbe = Kritikalitätsstufe (§3), **Rot** nur Stufe Fehler. | Bunter Chip ohne Zustand (Belegart, Kategorie); Rot für „wichtig", Löschen im Ruhezustand oder ein negatives Vorzeichen (A7). |
| **V7 Farbe niemals allein** | Jeder Zustand zusätzlich Wort oder Form (Label, Icon, Position). | Farbpunkt ohne Wort; farbige Zeile ohne Spalte, die dasselbe sagt. |
| **V8 Eine Zeile, eine Frage** | Spalten folgen der Frage der Seite; Zusatz in `.v2sub` oder Detail. | Spalte, die auf 90 % der Zeilen leer ist; neunte Spalte. |
| **V9 Zustände gehören zur Komponente** | Fünf Fälle: gefüllt · leer (nie befüllt) · leer nach Filter (mit Weg zurück) · lädt · Fehler. Drei verschiedene Leertexte (T6). | Ein Leertext für alle Fälle; Ladebalken pro Seite. |
| **V10 Kontrast wird gemessen** | Text ≥ 4.5:1, ab 18.7 px / 14 px fett ≥ 3:1, Rahmen/Häkchen/Fokus/Icons/Diagramm ≥ 3:1 (WCAG 2.2 AA 1.4.3/1.4.11). Fokusring immer sichtbar. | Neuer Token ohne Kontrast-Kommentar; `outline: none`. |
| **V11 Wiederholarbeit braucht Menge und Tastatur** | Listen mit derselben Handlung an vielen Zeilen: Mehrfachauswahl + Sammelaktion; Hauptweg auch per Tastatur, Taste sichtbar (V14). Tastatur ist Zusatzweg, nie einziger. | Freigabe-Liste ohne Auswahl; Hotkey nur im Hilfe-Overlay. Gilt nicht für jede Tabelle. |
| **V12 Bewegung ist funktional** | §2 Bewegung/Hover. | Scale, Spring, Glanz-Sweep. |
| **V13 Keine zweite Quelle** | Farben nur `tokens.css`; Zustände nur Registry (Z2); Zeiten Europe/Berlin (T7); Abstände `--space-*`/geteilte Klassen (R4); Labels aus dem Domain-Modul (R6); Formatter aus `@/ui/booking/format` bzw. `shared/money.ts`. | Hex-Literal, lokale Label-Map, lokaler `fmtDate`, px in TSX. |
| **V14 Wiedererkennen statt Erinnern** | Nichts, was man sich zwischen Sitzungen merken muss: Taste sichtbar an der Handlung (`KeyButton`), jedes Icon mit Wort, Legende am Ort (`StatusHeader`), nächster Schritt benannt („Weiter zu Bank · 3 offen"), Begriffe der Kanzlei/DATEV (`GLOSSARY.md`). | Handlung nur per Hotkey; „siehe ?"; still vorgewählter Filter ohne Hinweis. |

## 5 Layout L1–L7 und Rahmen

| | Regel |
|---|---|
| **L1 Desktop ab 1280 px** Innenbreite | Kein Mobile-, kein Tablet-Ziel. Darunter Sperre mit einem Satz (`.abn__toosmall`), kein zusammengeschobener Screen. Ludwig-Rahmen (Header, Sidebar) außerhalb der Rechnung (R16). |
| **L2 Master-Detail statt Modal** | Bis drei Spalten: Schritt-Rail (sticky, Zähler + Ampel je Schritt) · Liste · Detail. Auswahl in URL `?sel=` (R8). Dialog nur für Bestätigung mit irreversibler Folge (I2). Formulare, Rückfragen, Begründungen leben im Detail. |
| **L3 Bestehendes öffnet als Drawer** | Beleg, Sachverhalt, Kontenblatt, Partner: über der Arbeit per Search-Param, `Esc` schließt, Listenposition bleibt. Nie Seitenwechsel. |
| **L4 Linksbündig, immer** | Auch Leerzustand und Dialog. Zentrierte Illustration = lesendes Register. |
| **L5 DATEV-Ordnung** | Konten/Salden: `Konto \| Beschreibung \| Betrag S \| Betrag H \| Saldo`. Buchungssatz: `Datum · Umsatz · S/H · BU · Konto · Gegenkonto · Beleg · Text`. Kontonummer/BU in `--font-mono`. Keine eigene Ordnung, wo DATEV eine hat. |
| **L6 Leerzustand sagt, was geprüft wurde** | Prüfschritt ohne offene Punkte: Haken `--color-success` + **ein Satz mit Zahl** („Alle 47 Bankumsätze sind zugeordnet."). Spaltenkopf bleibt. |
| **L7 Abweichungsskala, Prüfpunkte im Akkordeon** | \|%\| auf der Skala §3: Debug ≤ 15 · Hinweis ≤ 50 · Warnung ≤ 100 · Fehler > 100; Schwellen in **einer** Domain-Funktion, nicht im CSS. Bestandene Prüfpunkte in einer Zeile („12 Prüfungen bestanden"), offene aufgeklappt. |

**Rahmen (fest):** Sidebar links 240 px fixiert (`--color-bg-soft`: Logo,
Mandanten-Block = Anzeige + Link auf `/clients`, R13; Hauptnavigation) ·
Top-Bar 56 px mit Border-Bottom · Content-Padding `--space-8`, max
`--container-app` (lesend `--container-wide`) · Marketing-Header 72 px.

## 6 Text und Stimme T1–T9

| | Regel | Verstoß |
|---|---|---|
| **T1 Stimme** | Fachlich, ruhig, präzise — ein erfahrener Kollege, der nichts beweisen muss. Subjekt ist Ludwig oder die Kanzlei; Ludwig spricht in der dritten Person („Ludwig hat 47 Belege vorkontiert."). | Superlative, Versprechen, Ausrufezeichen, Emoji, Entschuldigungen. |
| **T2 Anrede** | Immer **Sie**, auch in Fehlern, Tooltips, Onboarding. Kein Vorname: „Guten Tag, Frau Berger". | „Du", „Hallo Anna", „Hey". |
| **T3 Schreibweise** | Deutsche Rechtschreibung, kein Title-Case, keine Versalien (A2). Überschriften ohne Punkt, Sätze mit Punkt. Buttons im Imperativ mit Objekt („Beleg prüfen", „Stapel anlegen"); der Primärbutton eines Dialogs nennt die Folge („Stapel stornieren"), nie „OK"/„Ja". | „Belege Hochladen", `text-transform: uppercase`, Button „Bestätigen". |
| **T4 Wortwahl** | Begriffe aus `GLOSSARY.md` und DATEV: Beleg, Mandant, Kanzlei, Sachverhalt, Stapel, Konto, Gegenkonto, BU, S/H, prüfen, freigeben, vorkontieren, zuordnen, buchen, exportieren. Ludwig-interne Namen (`source_doc`, `case`, „Pipeline", Tabellennamen) nur in Technik-Sichten (Admin, Log-Sicht „Technik", `RawRowDrawer`). | „KI/AI", „smart", „magisch", „Game-Changer"; Anglizismen außer Fachsprache (DATEV, USt., BWA); „Rechnung", wo „Beleg" gemeint ist (P7). |
| **T5 Fehlertext** | Drei Teile: **Was** (fett, ein Satz) · Ursache · nächster Schritt als Handlung. Am Ort des Fehlers (Feld, Zeile, Banner in der Karte), nicht als Toast. Muster: „**Beleg unvollständig.** Es fehlt das Rechnungsdatum. Bitte ergänzen Sie das Datum oder laden Sie den Beleg erneut hoch." | „Hoppla", „Sorry", „Ups", „Etwas ist schiefgelaufen", Fehlercode als einziger Inhalt. |
| **T6 Leertexte** | Drei verschiedene: **nie befüllt** (was hier stünde + Handlung: „Noch keine Belege für 2026. Belege hochladen") · **leer nach Filter** (nennt den Filter + „Filter zurücksetzen") · **leer, weil erledigt** (L6, mit Zahl). | „Keine Einträge", „Nichts gefunden". |
| **T7 Zahlen und Zeit** | `de-DE`: `1.234,56 €`, immer zwei Dezimalstellen, `tnum`, Vorzeichen ohne Farbe (A7), Soll/Haben als S/H; nur `fmtMoney` (`@/ui/booking/format`) / `formatMoney` (`shared/money.ts`). Datum `TT.MM.JJJJ`, Zeit `HH:MM`, immer `timeZone: "Europe/Berlin"` (R3); relative Zeit („vor 3 Tagen") nur **neben** der absoluten, nie allein (F123 §2.4). Zähler: Zahl vor Wort — „3 offen", „12 von 47". | Lokaler `fmtDate`, `toLocaleString` ohne timeZone, `TimeAgo` als einzige Zeitangabe. |
| **T8 Beschriftung** | Jedes Icon hat ein Wort (V7); jede Taste steht an ihrer Handlung (`KeyButton`, V14); Tooltip erklärt, ersetzt kein Label; Placeholder ist kein Label; Legende am Ort (`StatusHeader`). | Icon-Only-Button ohne sichtbares Wort; Legende in `/hilfe`. |
| **T9 Typografische Zeichen** | Erlaubt als Text: · – — … „" %. Häkchen, Kreuze, Pfeile, Warnzeichen, Punkte als Träger von Bedeutung nur als Lucide-Icon. | ✓ ✗ ⚠ ● → in Buttons, Badges, Leerzuständen, Tabellenzellen. |

## 7 Zustände und State-Machines Z1–Z6

| | Regel | Verstoß |
|---|---|---|
| **Z1 Eine State-Machine, ein Ort** | Jede Zustandsachse steht als Tabelle `State \| Dran ist \| Hinein durch \| Hinaus durch` in `docs/topics/<thema>.md` (Muster `datev.md` R19); Wertebereich im DB-CHECK bzw. Domain-Enum. Ein State mehr statt Flags/Datumsfelder daneben — „wer ist dran" ist ein Zustand (F117). Geschnittene, ungebaute States nur als Einzeiler mit Backlog-Verweis. | `postponed_until`, `handover_mode`; Zustand nur in Prosa. |
| **Z2 Eine Darstellung** | `ui/status/status-registry.ts` hält je Achse Label, `kind`, Erklärtext und einen Block-Kommentar (Spalte oder „abgeleitet", Schreiber, Übergänge, Fallstricke). Überall `StatusBadge`. Deckungstest `__tests__/status-registry.test.ts` gegen Enum/CHECK in beiden Richtungen; Pseudowerte in `EXTRA_BY_AXIS`. Achsen-Keys deutsch, Werte englisch (DB). `kind` ist die Kritikalitätsstufe aus §3 (`success` = Ausgang). | Lokale `{label, kind}`-Map; `<Badge kind=…>` für eine Status-Achse; Status-Text im Screen. |
| **Z3 Klickbar, in drei Stufen** | Label → Hover (`title`: Achse, Zustand, Bedeutung, ohne JS) → **(i)** öffnet `StatusInfoDialog` mit **allen** Ausprägungen der Achse, DB-Wert und Herkunft. Entitäts-Status (Beleg/Sachverhalt/Buchung) zusätzlich `EntityStatusBadgeButton` → `FlowModal` (Kette Beleg → Sachverhalt → Buchungen). | Badge ohne (i); eigener Erklär-Dialog. |
| **Z4 Spaltenkopf** | Nie „Status"/„Zustand": spezifisches Label („Abgleich", „Verarbeitung") + (i) über `StatusHeader` mit `axisLegend(achse)` (R2). | `<th>Status</th>`, handgeschriebene Legende. |
| **Z5 Prozess ist Ableitung** | Prozessbild (Phasen) und Staffelstab (wer ist dran, Icon **und** Wort) werden aus dem Zustand berechnet (`domain/<x>-process.ts`, Deckungstest gegen die Achse), nie gespeichert. `ProzessMini`/`ProzessStepper`/`Staffelstab`/`StaffelLeiste` (`@/ui/v2`) kennen kein Fachmodul — Phasen und Besitzer kommen als Props. | Zweites Feld „phase"; Prozessbild importiert ein Modul. |
| **Z6 Log = ein Strom, drei Sichten** | Verlauf (Sachbearbeiterin) · Protokoll (jeder Zustandswechsel) · Technik (auch Agent-Schritte), plus Fehlerfilter; Dauer zwischen Wechseln als `StaffelLeiste`, eingefärbt nach Besitzer, berechnet, nicht gespeichert. Darstellung über `LogTable`/`LogView` (R7). | Gespeicherte Dauer; ein eigenes Log-Modell je Screen. |

**Neue Achse, in dieser Reihenfolge:** (1) State-Tabelle in `topics/<thema>.md`
· (2) Enum/DB-CHECK · (3) Registry-Map + Block-Kommentar · (4) `AXIS_LABEL`/
`AXIS_SOURCE` in `entity-icons.ts` · (5) Deckungstest · (6) `StatusHeader` an
jeder Spalte, `StatusBadge` in jeder Zelle. Tone-/Label-Änderungen sind ein
Registry-Entscheid im Handoff, nicht still im Screen (F123 §2.4).

## 8 Interaktionsmuster I1–I10

| | Regel |
|---|---|
| **I1 Auswahl in der URL** | Master-Detail: `?sel=`; Drawer: eigener Search-Param (R8); Orte als Pfad-Segment (Deeplink, Zurück-Taste, R16). Search-Params bleiben für Overlays frei. |
| **I2 Drawer oder Dialog** | Drawer = etwas **ansehen**, Kontext bleibt sichtbar. Klasse A (`@/ui/drawers`, Katalog `apps/web/AGENTS.md` §7, nur Kennung + Öffnungsart) oder Klasse B (im Modul, Rahmen `Drawer`/`UrlDrawer`; R15). Dialog (`@/ui/components`) nur für: Bestätigung mit irreversibler Folge (Storno, Löschen), Wizard-Schritt, Status-Erklärung. `window.confirm()`/`alert()` sind verboten. Enter bestätigt, `Esc` schließt ohne zu speichern. |
| **I3 Tabs** | `TabBar` (R9) mit Zähler/Alarm; ein Tab filtert eine Quelle, wechselt nie die Optik (R17); Inline-`borderBottom`-Kopien sind Verstoß (P8). |
| **I4 Filter** | Eine `FilterLeiste` (zu bauen, §11.2) statt Varianten pro Seite. Filterstand in der URL, sichtbar in der Liste („gefiltert: …") mit „Zurücksetzen"; keine still vorgewählten Filter (V14, V9). |
| **I5 Mehrfachauswahl** | Wiederhol-Listen: Checkbox-Spalte + Sammelaktionsleiste („3 ausgewählt · Freigeben"); Hauptweg per Tastatur mit sichtbarer Taste (V11, V14). |
| **I6 Klärung** | Wer fragt, legt Antworten als **Handlungen** vor (`answer_kind`, `answer_options_json`); Freitext immer zusätzlich (S13). Antwort im Detail, nicht im Modal (L2). Zwei Wortlaute je Adressat (buchung.md R21). |
| **I7 Laden und Fehler** | `TableLoading`/`ErrorRow` (zu bauen) in der Karte, Spaltenkopf bleibt, kein Layout-Sprung; Fehlerzeile trägt eine Retry-Handlung; Fehlertext nach T5. |
| **I8 Formulare** | Label sichtbar über/neben dem Feld, nie nur Placeholder; Feldrand `--color-border-control`; Fehler am Feld als Text (nicht nur rot, V7); Pflichtfeld markiert; Speichern-Button nennt das Objekt. Formulare leben im Detail, nicht im Dialog (L2). |
| **I9 Schreibrecht** | Jede Server Action prüft selbst; ein gedimmter Knopf ist keine Zugriffskontrolle (R16). Der Rail ist Vorschlag, kein Zwang. Vorschau derselben Funktion, die danach schreibt (R17) — keine nachgerechnete zweite Wahrheit. |
| **I10 Nächster Schritt** | Am Ende jeder Liste/jedes Schritts steht die nächste Handlung mit Zahl („Weiter zu Bank · 3 offen"); was leer ist, sagt warum und was fehlen würde (R16 „leer statt geraten"). |
| **I11 Die Zeile ist das Ziel** | Hat eine Listenzeile ein Detail, führt die **ganze** Zeile dorthin, nicht nur ein Wort: `Row href=…` (`@/ui/v2`). Trägt die Zeile daneben eigene Links oder ein Zeilenmenü, deckt stattdessen der Link auf das Detail die Zeile ab — Klasse `v2rowlink`, kein `<a>` in `<a>`; die übrigen Links/Knöpfe liegen darüber und behalten ihr eigenes Ziel. So bleibt genau **ein** Fokus-Stopp für das Ziel, mit eigenem Text statt `aria-label`. Hover färbt die ganze Zeile (§2). Eine Zeile ohne Detail bleibt stumm — kein Cursor, kein Hover. |

## 9 Prüfliste je Komponente (v2-fertig)

- [ ] Liegt unter `apps/web/src/ui/v2/{primitives|patterns|entities/<entität>}/` — eine Stufe, Importe nur abwärts (`web-ui.md` R21); Export über `@/ui/v2`, kennt kein Fachmodul
- [ ] **Ersetzt** ihr v1-Gegenstück (`@deprecated`), steht nicht daneben (A6, F123 §2.2)
- [ ] Kein Hex, kein px außerhalb `v2.css`, keine lokale Label-Map, kein eigener Status-Text (V13, A5)
- [ ] Text links, Zahlen rechts mit `tnum`, nichts zentriert (V3)
- [ ] Zeilenhöhe ≤ `.v2tbl__row` (V1)
- [ ] Farbe nur als Kritikalitätsstufe, Rot nur Fehler, Vorzeichen ohne Farbe (V6, L7, A7)
- [ ] Jeder farbige Zustand hat Wort oder Icon (V7); Status nur über Registry (Z2–Z4)
- [ ] Fünf Zustände: gefüllt · leer · leer nach Filter · lädt · Fehler, drei Leertexte (V9, T6)
- [ ] Kontrast: Text ≥ 4.5:1, Rahmen/Icons/Fokus ≥ 3:1; Fokusring sichtbar (V10)
- [ ] Hauptweg per Tastatur, Taste sichtbar; kein Icon ohne Wort (V11, V14, T8)
- [ ] Jedes klickbare Element antwortet auf Hover; Listenzeile mit Detail ist ganz klickbar (§2, I11)
- [ ] Icons Lucide 1.5 px; keine Emoji/Unicode-Icons, keine Versalien (§2, T9, A2)
- [ ] Karte: Rand **oder** Schatten; linksbündig; kein Modal, wo Detail oder Drawer geht (L2–L4)
- [ ] Texte nach T1–T5 (Sie, Imperativ, GLOSSARY-Begriffe)
- [ ] **Story** unter `v2/Primitives|Patterns|Entitäten/<Entität>/<Name>` mit allen fünf Zuständen (Storybook ist die Antwort auf „wovon gibt es v2?")
- [ ] In §11 auf v2 gesetzt

## 10 Prüfliste je Seite

Vor der Migration und bei der Abnahme jeder Route aus §11.4:

- [ ] Register bestimmt (§1); produktiv → Sperre unter 1280 px (L1)
- [ ] Die **Frage der Seite** in einem Satz; jede Spalte beantwortet sie; Spalten, die > 50 % leer sind, fliegen in `.v2sub` oder Detail (V8)
- [ ] Spaltenordnung DATEV, wo DATEV eine hat; Kontonummern/BU mono (L5)
- [ ] Jede Tabelle in einer Karte mit Kopf + Spaltenkopf (V5); Zeilen ≤ `.v2tbl__row` (V1)
- [ ] Jede Status-Spalte `StatusHeader` + `StatusBadge`, jede Achse in der Registry mit State-Tabelle im Topic (Z1–Z4)
- [ ] Fünf Zustände je Liste, drei Leertexte, Erledigt-Leerzustand mit Zahl (V9, T6, L6)
- [ ] Filterstand in URL, sichtbar, zurücksetzbar (I4)
- [ ] Detail/Drawer statt Seitenwechsel; Auswahl in URL; Drawer aus dem Katalog (L2, L3, I1, I2)
- [ ] Wiederholarbeit → Mehrfachauswahl + Sammelaktion + sichtbare Tasten (V11, I5)
- [ ] Kein `confirm()`/`alert()`; Dialog nur für Irreversibles (I2)
- [ ] Farbe nur mit Bedeutung; Kategorien/Belegarten als Text (V6)
- [ ] Texte: Sie, Imperativ-Buttons, GLOSSARY/DATEV-Begriffe, kein interner Name, Fehler = Was · Ursache · Schritt (T1–T5)
- [ ] Beträge über `fmtMoney`, Zeiten absolut in Europe/Berlin (T7)
- [ ] Kein Hex, kein px/`fontSize` in TSX, kein `text-align: center`, kein Emoji/Unicode-Icon, keine Versalien (V3, V13, T9, A2)
- [ ] Nächster Schritt benannt; Leeres sagt, was fehlt (I10)
- [ ] Nach vier Wochen Pause bedienbar: nichts nur per Hotkey, Farbe oder Icon (V14)
- [ ] Alt-Komponenten `@deprecated`; `grep "@/ui/components"` sinkt; Stories `v2/…`; §11.4 Häkchen; `ui-repraesentationen.md` nachgezogen
- [ ] `pnpm --filter @ludwig/web test` + `typecheck` grün

## 11 Inventar (Stand 2026-08-30)

Legende: **v2** fertig · **teils** v2-Bausteine benutzt, nicht durchgezogen ·
**v1** · **—** kein Bedarf. Zahlen: 12 v2-Bausteine, **0** v2-Stories, 14
Dateien importieren `@/ui/v2`, 83 Routen, 4 in v2, 1 von 28 Entitäten in v2.

### 11.1 Set vorhanden (`apps/web/src/ui/v2/`, seit F128 in drei Stufen-Ordnern)

| Baustein | Datei | Zustände (V9) | Story |
|---|---|---|---|
| `Card`/`CardHead`/`CardFoot` | `Table.tsx` | — | fehlt |
| `Table`/`HeadRow`/`Row`/`GroupRow` | `Table.tsx` | gefüllt | fehlt |
| `EmptyRow` | `Table.tsx` | leer | fehlt |
| `ProzessMini`/`ProzessStepper` | `Prozessbild.tsx` | 4 Phasen | fehlt |
| `Staffelstab`/`StaffelLeiste` | `Prozessbild.tsx` | 8 Besitzer, Alarm | fehlt |

Klassen ohne React-Gesicht (`v2.css`, gewollt): `v2num` · `v2sub` · `v2main` ·
`v2muted` · `v2link` · `v2link--quiet` · `v2actions` · `v2in` · `v2card*` ·
`v2tbl*` · `abn__*` (Abnahme-Rahmen) · `chk__*` (Checkliste) · `pz-*`.

### 11.2 Stand des v2-Sets

**Gebaut (F123 T123.1/T123.2/T123.3, alle mit Story `v2/…`).** Verortung seit
F128 (`web-ui.md` R21): Aktion · Navigation · Fläche · Formular · Tabelle und die
Zellen liegen unter `primitives/`; Arbeitsfläche · Prüfen · Rahmen · Prozessbild
· `VergleichsTabelle` unter `patterns/`; `KontoFeld` unter `entities/konto/`,
`BuchungssatzEditor` + `KIBuchungshinweise` unter `entities/buchungssatz/`.

| Gruppe | Komponenten |
|---|---|
| Aktion | `Button` (primary/secondary/tertiary/danger × sm/md, `href`, `hotkey`) · `KeyButton` · `ActionBar` · `RowActions` |
| Navigation | `Tabs` (Zähler, `alarm`) · `Segmented` · `FilterChips` · `SearchInput` |
| Fläche | `KpiTile`/`KpiGrid` · `FieldList` (surface/soft) · `ProseCard` · `StatusCallout` · `Callout` · `Dialog` · `GrundDialog` |
| Formular | `Field` · `Input` · `Textarea` · `Select` · `Checkbox` · `KontoFeld` (Kandidaten nach Herkunft) |
| Tabelle | `SelectionBar` + `SelectCell` · `ExpandableRow` · `ClickRow` · `AmountCell` · `ProgressCell` · `DotStatus` · `TableLoading` · `ErrorRow` |
| Arbeitsfläche | `MasterDetail` · `ListPane` · `DetailPane` · `TodoListe` |
| Prüfen | `StateIcon` (9 Zustände) · `Checkliste` · `Pruefpunkte` · `Meldungen` |
| Zahl/Zeit | `AbweichungsZelle` (4 Stufen aus `deviationTone`) · `Timestamp` (absolut, Europe/Berlin) · `VergleichsTabelle` |
| Rahmen | `SchrittRail` · `SchrittKopf` · `FortschrittLeiste` · `useHotkeys` · `HotkeyLegende` |
| Buchung | `BuchungssatzEditor` (Anzeige **und** Bearbeiten) · `KIBuchungshinweise` |

**Noch zu bauen** (Stufe nach R21 vor dem ersten Commit festlegen):

- [ ] `FilterLeiste` — I4; heute acht v1-Varianten (`AccountFilterForm`, `InvoiceFilterForm`, `CaseListFilters` …). `FilterChips` deckt den Chip-Teil ab, nicht die Formularzeile.
- [ ] `Kopfzeile` (PageHeader v2, kompakter) · `Werteliste` (Key-Value außerhalb einer Karte; `FieldList` deckt die Karte ab)

**Bleibt Alt-Mechanik, bekommt v2-Optik** (nicht verhandelbar, F123 §2.4):
`StatusBadge` + Registry · `StatusHeader`/`Tooltip` · `Drawer`/`UrlDrawer`-Rahmen
(`.lwdrawer`, Wächter-Test) · `LogTable`/`LogView`.

### 11.3 Entitäten (F111 §1)

| Entität | v2 | Zuerst gebraucht auf |
|---|---|---|
| DATEV-Export-Stapel | v2 | — |
| Buchungssatz | teils (`BuchungenTabelle` ja, `JournalEntryView`/`BookingProposalView` nein) | Sachverhalt-Detail, `/entries` |
| Buchungszeile | teils (Zeile ja, `BookingLineRow`-Editor nein) | Satz-Editor |
| Sachverhalt · Beleg · Rechnung · Kontoauszugsposition · Sach-/Personenkonto | v1 | Welle 1 (Zeile, Zelle, Karte, Detail) |
| Geschäftspartner · DATEV-OPOS (Alters-Gruppierung) · Erwartung (Frist-Chip) · Ausgleichs-Zuordnung · DATEV-Snapshot · DATEV-Spiegelbuchung · Klärung (Antwortoptionen) · Wiederkehr-Regel · Mandant · Zahlungskonto · Wirtschaftsjahr (Zeitachse) · Ereignis (Stapel) · Vertrag · Bank-Import · Rechnungsposition · Buchungslauf | v1 | Welle 2 / Seite |
| Konvention · Kanzlei · Nutzer · Audit-Ereignis (R7) · Job | v1 | Welle 3 |
| Entschiedene Belegnummer | — | inline |

Reihenfolge: Sachverhalt → Beleg → Buchungssatz → Kontoauszugsposition →
Konto; Bausteine entstehen an der Seite und wandern nach `src/ui/<entität>/`
(F111 §4.1), nicht ins Modul.

### 11.4 Seiten (Häkchen = Prüfliste §10 bestanden)

**Fertig (v2):** `[year]/stapel` · `stapel/[batchId]` · `…/abnahme` ·
`…/abnahme/[schritt]` — mit F123 (2026-08-30) auf das Design gezogen.

**Welle 1 — Arbeitsfläche**
- [ ] `[year]/cases` · [ ] `[year]/cases/[caseId]`
- [ ] `[year]/documents` · [ ] `[clientSlug]/documents/[sourceDocId]` · [ ] `[clientSlug]/document-inbox`
- [ ] `[year]/banks` · [ ] `[year]/banks/[accountId]` (+ `KontoauszugView`) · [ ] `[year]/banks/offen`
- [ ] `[year]/opos` · [ ] `[year]/entries`

**Welle 2 — Kontext, Stammdaten, Auswertung**
- [ ] `[year]` (Jahresübersicht) · [ ] `[year]/accounts` · [ ] `[year]/accounts/[accountNumber]` (846 Z.)
- [ ] `[year]/partners` · [ ] `[year]/partners/[partnerId]`
- [ ] `[year]/datev` (1205 Z. — vorher teilen) · [ ] `[year]/datev/stapel/[...seq]` · [ ] `[year]/documents/datev-import`
- [ ] `[year]/recurring` · [ ] `[year]/reporting` · [ ] `[year]/document-requests` · [ ] `[year]/cycles` · [ ] `[year]/client-batches`
- [ ] `/dashboard` · [ ] `/clients` (P14) · [ ] `/clients/new` · [ ] `/clients/[clientSlug]`

**Welle 3 — Konfiguration und Betrieb** (Listen/Karten v2, Editoren bleiben)
- [ ] `configuration/*` (18: Index, uebersicht, stammdaten, bankkonten + new/edit/import/transactions, kontenplan, verrechnungskonten, lieferanten, integrationen + new/[id], logs, benachrichtigungen, profil, onboarding/creditors)
- [ ] `admin/*` (11: Übersicht, tenants + [tenantId] + clients/[clientId], users + [userId], jobs, audit-log, agent-connections, product-feedback, acceptance-quality)

**Welle 4 — Ränder**
- [ ] `/portal/[clientSlug]` — Register prüfen (Mandant, dreimal im Jahr)
- [ ] `[year]/agent-runs/[runId]` (695 Z.)
- `/hilfe`, `/hilfe/glossar`, `(auth)/login` — lesend, kein v2

**Rückbau statt Migration (erst rückbauen, dann migrieren):** `[year]/review`
+ 5 Unterseiten (P17) · `[year]/agent-runs` (Redirect) · `[year]/export`,
`export/[batchId]` (Archiv F118) · `/settings`, `/settings/components` (F111 B2)
· `/dev/gallery` behält nur ladende Drawer-Hüllen · `/health` keine Oberfläche.

### 11.5 Sofort-Aufgaben — Befunde aus `apps/web/src` (2026-08-30)

Erledigt: K1–K3, A2, A3, A1, 17 `#B07B2C`-Literale auf den Token.

| Befund | Umfang | Regel |
|---|---|---|
| Hex-Literale außerhalb `tokens.css` | **808** — `booking.css` 82, `app-chrome.css` 78, `sachverhalt.css` 71, `beleg-detail.css` 53, `components.css` 42; TSX: `EventStack` 30, `DocumentInbox` 24, `CaseDocumentUploaderModal` 17, `ClarificationsBanner` 16 … | V13 — Literal-Prüfung für `success`/`danger`/`info`/`*-bg` steht aus |
| `.v2tbl__empty` ist zentriert (`v2.css`) | 1 im v2-Set, 27 app-weit | V3/L4 — **im v2-Set sofort** |
| Unicode-Icons ✓ ✗ ⚠ in TSX | 12 Dateien, u. a. `Schritt8`, `DatevExportWizard`, `ReadinessBanner`, `CreditorProposalsReview`, `AccountLedgerDrawer` | T9 |
| Lokale `{label, kind}`-Maps neben der Registry | 12 Dateien: `integrationen/page`, `reporting/page`, `documents/page`, `opos/page`, `admin/tenants/*`, `StapelVergleich`, `VorsteuerTab`, `BridgeHealthStatus`, `DatevExportSection`, `batch-state-meta.ts` … | Z2 — prüfen, ob Status-Achse → Registry |
| `<th>Status</th>` | 7 (`admin/jobs`, `[year]/page`, `integrationen/[id]`, `UserEditForm`, `CasePlausibilityTab`, `settings/components`, eine Story) | Z4 |
| `toLocale*String` ohne `timeZone` | 82 Stellen | T7/R3/P3 — ein Formatter |
| `window.confirm()`/`alert()` | 31 Stellen in 9 Dateien | I2 |
| Inline-Tab-Leisten | 6 (`configuration/TabBar`, `InvoiceListTabsBar`, `DocTabsBar`, `CaseTabsBar`, `CaseListTabsBar`, `closing/StepNav`) | I3/R9/P8 |
| Listenzeile ohne Zeilen-Link | 120 `<Row>`-Stellen, davon 6 mit Ziel (`href` bzw. `v2rowlink`, seit 2026-08-31 die Stapel-Liste) — nicht jede Row ist eine Liste mit Detail (Schlüssel-Wert-Zeilen zählen nicht), je Liste prüfen | I11 |
| `text-transform: uppercase` | 54 in CSS (v1) | A2 — beim Nachziehen der Seite |
| „Du"-Ansprache | `clients/[clientSlug]/not-found.tsx` | T2 |
| „Hoppla"/„Sorry"/„Ups" | 6 Dateien, u. a. `CloseCasesPanel`, `StapelDetailScreen`, `Schritt2`, `AccountsGroupedTable` | T5 |
| Inline `fontSize:` in TSX | 1081 in 303 Dateien mit `style={{` | A5/V13 — mit der Seite |
| `<Badge kind=…>` direkt in Modulen | 126 — nicht jede ein Status; prüfen gegen Z2 | Z2 |
| Stories mit Präfix `v2/` | 0 von 64 Story-Dateien | §9 |
| `--color-border-control` an Feldern anwenden | nur definiert | I8 |
| `--color-success` auf `success-bg` 4.46:1 | am `success-bg` korrigieren | V10 |
| `warning-strong` auf die Skala zurückführen | **Erledigt (F123):** `--color-warning-strong: #9C5021` in `tokens.css` (5.85:1 auf `bg`, 5.40:1 auf `bg-soft`), `.v2num--warning-strong` in `v2.css`, Stufen in `deviationTone()` (`stapelabnahme/domain/vergleich.ts`) — die einzige Stelle, an der 15/50/100 % stehen | A7/§3 |

### 11.6 Reihenfolge

1. §11.5 im v2-Set (`.v2tbl__empty`, Stories `v2/…`, Literal-Prüfung).
2. `FilterLeiste` — der Rest des F123-Sets steht (§11.2).
3. Rückbau P17, B2.
4. Welle 1 Seite für Seite (Prüfliste §10), dann Welle 2 (vorher `[year]/datev` teilen), 3, 4.

## 12 Werte-Protokoll (Quelle der Wahrheit: `tokens.css`, `v2.css`)

**Maße produktiv (`v2.css`):** Zeilentext 13.5 px · Zeilenpadding 12/18 px (~38 px
Zeile; Enterprise-Referenz kompakt 40–44, comfortable 48–56) · Spaltenkopf
11.5 px normal, `letter-spacing 0.01em` · `.v2sub` 11.5 px · Kartenkopf 14/600,
Unterzeile 12 · Kartenfuß 12.5 · Leerzustand 13 px, 30 px Padding ·
Kartenradius `--radius-lg` · Kopffläche `--color-surface-head`.

**Kontrast (gegen Weiß, WCAG 2.x; `bg-soft` in Klammern):**

| Token | Kontrast | Rolle |
|---|---:|---|
| `--color-text` | 13.77 | Text |
| `--color-text-muted` | 6.69 | Text |
| `--color-text-subtle` (K1: dunkler gesetzt) | 4.88 (4.51) | Text, kleinste Stufe |
| `--color-accent-700` | 4.81 | Text |
| `--color-accent` | 3.55 | nur Fläche/Rand |
| `--color-primary` | 11.64 | Text |
| `--color-success` | 5.07 (4.68); auf `success-bg` 4.46 | Text — offen |
| `--color-warning` (K2: dunkler gesetzt; war 18× als Literal) | 5.52; auf `warning-bg` 4.78 | Text |
| `--color-danger` | 6.06 | Text |
| `--color-border` / `-strong` | 1.30 / 1.62 | Trennlinie, kein Anspruch |
| `--color-border-control` (K3: neu) | 3.45 (3.19) | Kontroll-Rand |

Lehre aus K2: ein Token ist nur dann eine Quelle, wenn kein Literal daneben
steht — `grep -rn '#[0-9A-Fa-f]\{6\}' apps/web/src --include=*.css --include=*.tsx`
außerhalb `tokens.css` ist der Test (§11.5).

## 13 Entscheidungen

| | Owner 2026-08-30 |
|---|---|
| **A1** | Zwei Register, ein Token-Satz; im Design-README ergänzt. |
| **A2** | Spaltenkopf in normaler Schreibweise, keine Versalien. |
| **A3** | Eigener Token `--color-surface-head`. |
| **A4** | K1–K3 app-weit; jeder geänderte Token trägt seinen Kontrastwert als Kommentar. |
| **A5** | Sprache und Ausprägung getrennt: Regeln nennen Rollen/Token-Namen, Zahlen nur im Code. Ein Hex-Wert in einer Regel ist ein Verstoß. |
| **A6** | Kein Bestandsschutz: Token-, Klassen-, Primitiven-Änderungen wirken app-weit sofort; v1 wird nachgezogen, bevor ein Endnutzer es sieht. Kein Shim, keine v1-Variante. |
| **A7** | Farbe kodiert **Kritikalität, nie einen Wert**. Eine Skala Fehler · Warnung · Hinweis · Debug, je genau eine Farbkategorie, technisch und fachlich dieselbe (§3). Folgen: negative Beträge nur Vorzeichen + `tnum` (`AmountCell.tone` Default ohne Farbe); L7 auf die vier Stufen; `--color-warning-strong` entfällt (§11.5). |

## 14 Quellen

Q1 Pencil & Paper — Enterprise Data Tables (Dichte, Zeilenhöhe, Zustände) ·
Q2 Eleken Table UX, NN/g Big Tables (Ausrichtung) · Q3 WCAG 2.2 AA 1.4.3/1.4.11
(Deque, makethingsaccessible) · Q4 Imperavi Semantic Colors, aufaitux Color
Tokens · Q5 IBM Carbon Type Sets (productive/expressive) · Q6 Progressive
Disclosure (uxuiprinciples) · Q7 Enterprise UI 2026 (hashbyt, fuselab) · Q8
`design/Ludwig Design System v2/README.md` (Marken-Brief, ohne Codebase
erstellt) · F109/F114 Design-Briefs, F111 UI-Inventar, F118 §2, F123.

## 15 Pflege

- Regel geändert → hier **umschreiben**, nicht anhängen (git ist die Historie).
- Neue Achse, neuer Baustein, migrierte Seite → §7-Reihenfolge, §11 Häkchen,
  Story `v2/…`, `docs/reference/datenmodell/ui-repraesentationen.md`.
- Wird ein Prinzip abgelehnt, wird es hier gelöscht; Code-Regeln, die daraus
  folgen, stehen in `docs/topics/web-ui.md` (R-Format) und verweisen hierher.
- `make docs-audit` prüft Verweise.
