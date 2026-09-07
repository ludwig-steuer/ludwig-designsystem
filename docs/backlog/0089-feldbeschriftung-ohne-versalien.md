# 0089 · Versalien aus dem Set nehmen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `src/styles/v3.css` — eine Regel, aber jedes Formular im Set |
| Quelle | Vier unabhängige Abnahmen am 2026-09-05: 0017 (RadioGroup), 0079 (Wizard), Paket 0019/0020/0021/0028 und Paket 0016/0017/0031/0034/0038 — die letzte hat den Umfang nachgezählt |
| Auftrag | `.v2field__label` (`src/styles/v3.css`, Z. 842–845) setzt `text-transform: uppercase`. Damit steht **jede** Feldbeschriftung des Sets in Versalien: „BRUTTOBETRAG", „BELEGE HOCHLADEN", „TRENNZEICHEN", `<legend>ANTWORT</legend>`. T3 verbietet Versalien ausdrücklich und nennt `text-transform: uppercase` als Gegenbeispiel; A2 sagt dasselbe für den Spaltenkopf. |
| Warum eine eigene Aufgabe | Es ist eine Zeile CSS und trotzdem kein Handgriff: die Beschriftung ist heute Overline-Typografie (11 px, `letter-spacing: 0.04em`, `font-weight: 600`) — nimmt man die Versalien weg, muss die Stufe neu sitzen, sonst liest sich das Label wie ein Wert. Das ändert das Aussehen **jedes** Formulars im Set und gehört einmal entschieden, nicht nebenbei in einer Radiogruppe. |
| Zu entscheiden | Welche Schriftstufe trägt eine Feldbeschriftung, wenn sie keine Versalien mehr hat? Kandidaten: `--fs-ui-sm` in `--color-text-muted` mit `font-weight: 600` (wie `.v2fields__row` links), oder die Overline-Stufe ohne `text-transform`. Dazu: gilt dasselbe für `.lw-overline`, oder ist die Overline als **Kategorie-Zeile** eine benannte Ausnahme? |
| Umfang | **Nicht nur die Feldbeschriftung.** Nachgezählt am 2026-09-05: **18** `text-transform: uppercase` in `src/styles/v3.css` und **9** in `src/styles/app-chrome.css` — darunter Spaltenköpfe, `.sb__navlabel` in der Seitenleiste, `.v2kf__grp` und der `FieldList`-Titel („6815 · BÜROBEDARF" in der HoverCard-Story). A2 und T3 kennen keine Ausnahme, und die A5-Ausnahme für `app-chrome.css` deckt nur rohe Hex- und `rgba()`-Werte, keine Versalien. Wer nur `.v2field__label` anfasst, trifft dieselbe Entscheidung später noch zweimal |
| Betroffen | `Field`, `RadioGroup` (`<legend>`), `AmountInput`, `InlineEdit`, `FileDrop`, `ChoicePrompt`, `DateField`, `Combobox`, `FieldList`, `NavList`, jeder Spaltenkopf mit `.lw-overline` |
| Angelegt von / am | Claude, 2026-09-05 (aus drei Abnahmen) |

## Entschieden (2026-09-06): drei Rollen, drei Stufen, keine Ausnahme

Die Frage der Aufgabe war nicht, **ob** die Versalien weggehen — T3 nennt
`text-transform: uppercase` als Gegenbeispiel und kennt keine Ausnahme —,
sondern **welche Stufe** eine Beschriftung dann trägt, damit sie sich nicht
wie ein Wert liest.

Die 27 Stellen sind nicht dasselbe Ding. Sie sind drei:

| Rolle | Was sie tut | Stufe |
|---|---|---|
| **Beschriftung eines Wertes** | steht **neben oder über** einem Wert: Feld, Kennzahl, Chip-Reihe, linke Spalte einer Feldliste | `--fs-ui-sm` (12,5 px), 600 |
| **Überzeile** | steht **über einem Titel** und ordnet ihn ein: Kicker in Callout und Dialog, die Art im KI-Kasten, die Phase im Stepper | `--fs-ui-xs` (11,5 px), 600 |
| **Gruppen- und Abschnittskopf** | steht **über einer Gruppe von Zeilen**: Tabellen-Zwischenzeile, Gruppenkopf in Liste und Kontenauswahl, Titel einer Feldliste, „Belegdaten" | `--fs-ui-sm` (12,5 px), 700 |

Die **Farbe bleibt je Regel, wie sie war** — Kontrast ist Sache von 0090, und
zwei Dinge auf einmal zu ändern macht die Messung dort unlesbar.

Die **Sperrung fällt überall weg.** Sie war dafür da, Großbuchstaben lesbar
zu halten; unter Gemischtschreibung zieht sie die Wörter nur auseinander.

Warum die Beschriftung auf 12,5 px geht und nicht auf 11 px bleibt: das ist
die Stufe der **linken Spalte einer `FieldList`**. Damit liest sich ein Wort
gleich, ob das Feld beschreibbar ist oder nicht — und genau das war der
Grund, aus dem die Beschriftung überhaupt eine eigene Typografie hatte.

**Die Überzeile ist keine benannte Ausnahme.** Eine Regel, die Versalien
verbietet und dann eine ganze typografische Klasse davon ausnimmt, ist keine
Regel. `.lw-overline` bleibt, was sie ist — die kleinste Stufe über dem
Fließtext —, aber sie sagt es über Größe, Gewicht und Farbe.

## Umfang, wie er sich beim Anfassen zeigte

| Datei | Stellen | Erledigt |
|---|---|---|
| `src/styles/v3.css` | 17 | alle |
| `src/styles/app-chrome.css` | 9 | alle |
| `src/styles/tokens.css` | 1 (`.lw-overline`) | ja |
| `src/ui/v3/Typography.stories.tsx` | 1 (Inline-Stil, der die alte Stufe vorführte) | ja |
| `src/styles/components.css` · `booking.css` | **17** | **nein**, siehe unten |

Die Aufgabe zählte 18 in `v3.css`; es sind 17 — die achtzehnte Zeile war ein
zweites `text-transform` in derselben Regel.

**Nicht angefasst: `components.css` und `booking.css` (17 Stellen).** Beide
tragen die **v1-Schicht**, die v3 ablöst: keine einzige ihrer Klassen wird von
einer v3-Komponente benutzt (geprüft, sechzehn Klassennamen gegen
`src/ui/v3/**.tsx`), sie stehen nur in den Showcase-Stories. Dazu kommt, dass
`booking.css` die Familie stylt, die eine parallele Sitzung gerade umbaut.
Der Entscheid oben gilt für sie unverändert; er wird beim Ablösen angewandt,
nicht in einem Durchgang, der ihn nicht messen kann.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (ein Kriterium je Befundzeile der Aufgabe):

- [ ] **Keine sichtbaren Versalien mehr im Set** — über alle Stories gemessen, nicht über den Quelltext
- [ ] `.v2field__label` steht in 12,5 px, 600, ohne Sperrung und ohne `text-transform` (`Field --filled`)
- [ ] Die `<legend>` einer `RadioGroup` trägt dieselbe Stufe wie ein Feld-Label (`RadioGroup --filled`)
- [ ] Der Spaltenkopf einer Tabelle steht ohne Versalien (A2) und bleibt vom Inhalt unterscheidbar
- [ ] `.lw-overline` hat keine Versalien und keine Sperrung mehr — und ist als Klasse erhalten
- [ ] Kein `text-transform: uppercase` mehr in `v3.css`, `app-chrome.css`, `tokens.css` und in keinem Inline-Stil unter `src/ui/v3` (`grep`)
- [ ] Die Beschriftung liest sich nicht wie ihr Wert — im Browser angesehen, an Feld, Kennzahl und Feldliste

## Abnahme

Fremde Abnahme, 2026-09-06 (Claude, Abnahme-Agent — nicht der Bauende).
Geprüft wurde der **Bestand**, nicht die Commits: Storybook auf Port 6107,
Chromium headless bei 1440×900 und zusätzlich in Rahmen von 900 und 640 px.
Wo unten „vorher" steht, ist die alte Typografie zur Laufzeit im Blatt wieder
eingesetzt worden (ein `<style>`-Tag im Browser) — keine Datei wurde dafür
angefasst.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0. Der erste Lauf meldete vier Fehler in `src/ui/v3/primitives/InlineEdit.tsx` — die stammen aus der unfertigen Arbeit einer parallelen Sitzung an 0104 (`useId`/`fieldId`, im Arbeitsbaum, nicht in HEAD: `git show HEAD:src/ui/v3/primitives/InlineEdit.tsx \| grep -c fieldId` = 0); der Lauf danach war grün. `pnpm build` bewusst **nicht** gestartet: er schreibt nach `storybook-static`, und im Arbeitsbaum liegt gerade fremde, unfertige Arbeit — ein Lauf hier würde nicht den Stand von 0089 messen | ✓ (build nicht gemessen) |
| Im Browser angesehen (Storybook), nicht nur gebaut | 523 Stories in zwei Durchläufen geöffnet und vermessen, dazu Einzelbilder von `Field --filled`, `FieldList --filled`, `EntityHeader --editable`, `KpiTile --six-columns`, `NavList --in-shell`, `AccountField --with-candidates` (geöffnete Liste), `Wizard --filled`, `SourceDocumentDrawer --geoeffnet`, `JournalEntryEditor --s-19-judge-with-note`, `FilterChips --by-dimension` | ✓ |

**Variabel**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Keine sichtbaren Versalien mehr im Set** — über alle Stories gemessen | Zwei unabhängige Sweeps über dieselben 523 Stories aus `index.json`. (1) Das Werkzeug des Bauenden unverändert: `{"storiesGeprueft": 523, "versalien": []}`. (2) Ein eigener, breiterer Sweep (unten „Was der Sweep nicht sieht"): `textTransform` 0, `pseudoElemente` 0, `smallCaps` 0 | ✓ |
| `.v2field__label` steht in 12,5 px, 600, ohne Sperrung und ohne `text-transform` | `v3-primitives-formular-field--filled`: `.v2field__label` „Beleg 1" → `12.5px / 600 / letter-spacing: normal / text-transform: none / rgb(92, 92, 92)`. Regel `src/styles/v3.css:869–872` (`--fs-ui-sm`, 600) | ✓ |
| Die `<legend>` einer `RadioGroup` trägt dieselbe Stufe wie ein Feld-Label | `v3-primitives-formular-radiogroup--filled`: `LEGEND.v2field__label` „Umfang des Exports" → `12.5px / 600 / ls normal / tt none / rgb(92, 92, 92)` — Zeichen für Zeichen dieselbe Messung wie das Feld-Label; die Antwortzeilen daneben `13.5px / 400 / rgb(45, 45, 45)` | ✓ |
| Der Spaltenkopf einer Tabelle steht ohne Versalien (A2) und bleibt vom Inhalt unterscheidbar | `v3-primitives-tabelle-table--filled`: `.v2tbl__head` → `11.5px / 600 / ls 0.115px / tt none / rgb(113, 113, 113)` gegen `.v2tbl__row` `13.5px / 400 / rgb(45, 45, 45)` — zwei Stufen kleiner, gedämpft, fetter. Die Zwischenzeile `.v2tbl__group` „Überfällig" steht auf `12.5px / 700`. Im Anwendungsrahmen `.tbl thead th` (`app-chrome.css:409`) `12.5px / 600` | ✓ |
| `.lw-overline` hat keine Versalien und keine Sperrung mehr — und ist als Klasse erhalten | `v3-grundlagen-typografie--scale`: `.lw-overline` „Zusatzweg" → `12px / 600 / ls normal / tt none / font-variant-caps: normal / rgb(92, 92, 92)`. Die Klasse steht unverändert in `src/styles/tokens.css:318–324`, benutzt von 19 Stellen unter `src/ui/v3` (u. a. `Hotkeys.tsx:85`, `AiBookingNotes.tsx:111`) | ✓ |
| Kein `text-transform: uppercase` mehr in `v3.css`, `app-chrome.css`, `tokens.css` und in keinem Inline-Stil unter `src/ui/v3` | `grep -rn "text-transform" src/styles/` → in den drei Dateien nur `v3.css:852` (Fließtext eines Kommentars, der die Regel zitiert), `v3.css:970` und `app-chrome.css:764` (beide `text-transform: none`). `grep -rn "text-transform\|textTransform" src/ui/` → keine Zeile. `grep -rn "uppercase" src/ui/` → keine Zeile; auch keine Tailwind-Klasse `uppercase`, kein `small-caps`, kein `font-variant-caps` irgendwo unter `src/` | ✓ |
| Die Beschriftung liest sich nicht wie ihr Wert | An elf Stellen im Bild geprüft. Formular (`Field --filled`, `Wizard --filled`): Beschriftung `12.5/600` gedämpft über einem gerahmten Feld mit `13.5/400` — der Rahmen trägt den Unterschied, die Stufe bestätigt ihn. Kennzahl (`KpiTile --six-columns`): `12.5/600 rgb(113,113,113)` über `19px / 600` in `--color-primary`; ebenso `EntityHeader --editable` mit `.v2ehead__metric__label 12.5/600` über `20px`. Feldliste (`FieldList --filled`): links `13.5/400` gedämpft, rechts `13.5/500` in `--color-text`, dazu links/rechts-Stellung — die schwächste Paarung im Satz, aber von 0089 nicht angefasst und lesbar. Feldliste zweispaltig (`EntityHeader --editable`): `12.5/600` über `13.5/500`. Chip-Reihe (`FilterChips --by-dimension`): „Stand" `12.5/600` neben Pillen mit Rand. Gruppenköpfe (`MasterDetail --filled` `12.5/700` über Zeilen mit `16px`; `AccountField --with-candidates` geöffnet, vier Köpfe `12.5/700` auf getönter Bank über Optionen mit `13px`; `SourceDocumentDrawer --geoeffnet` „Belegdaten" `12.5/700`). Überzeilen (`StatusCallout --open` `11.5/600` über `17px`; `ReasonDialog --open` `11.5/600` über `15px`). Nirgends liest sich eine Beschriftung wie ihr Wert | ✓ |
| Kein Rückschritt im Layout (nicht als Kriterium genannt, gemessen als Gegenprobe) | `scratchpad/abnahme-0089-umbruch.mjs`: je Story alle 26 betroffenen Klassen vermessen, dann die alte Typografie im Blatt wieder eingesetzt und erneut gemessen. 1440 px: 509 Stories, 164 mit Beschriftungen, **0** mit mehr Zeilen, 0 mit neuem Überlauf, 0 mit neuem Querscrollen. 900 px: 209 / 99 / **0**. 640 px: 211 / 101 / **0**. (Vier Stories brachen mit einem Navigations-Rennen ab und wurden einzeln nachgeholt, ebenfalls ohne Befund.) Gegenprobe am engsten Fall: `KpiTile --six-columns` bei 760 px braucht „Summe Soll" **heute eine** Zeile statt zwei — Versalien plus 0,04 em Sperrung waren breiter als 12,5 px Gemischtschreibung | ✓ |
| Die Begründung für die 17 nicht angefassten Stellen stimmt | 16 Klassennamen aus `components.css` und `booking.css` gegen das ganze `src/` geprüft: keine wird von einem v3-Baustein benutzt — und, anders als die Spec vermutet, auch von keiner Story. Die zwei scheinbaren Treffer sind keine: `ctype` fand `<!doctype html>` in drei `SourceDocument`-Stories, `dr__h` einen JSDoc-Satz in `src/ui/v3/primitives/Dialog.tsx:9`. Außerhalb `src/` stehen sie nur unter `reference/`. Die Begründung trägt | ✓ |

**Was der Sweep nicht sieht — selbst nachgeprüft**

Das Werkzeug des Bauenden sucht nur Elemente **ohne Kinder** mit
`text-transform: uppercase`. Vier Lücken sind mit einem eigenen Sweep über
dieselben 523 Stories nachgeholt (`scratchpad/abnahme-0089-sweep-plus.mjs`):

- **Elemente mit Kindern**, gemessen über ihre eigenen Textknoten, dazu
  `text-transform: capitalize` — 0 Treffer.
- **`::before` / `::after`**: `content` plus deren eigenes `text-transform` —
  0 Treffer.
- **`font-variant-caps`** (`small-caps`, `petite-caps`, `unicase`) — 0 Treffer,
  im Quelltext ebenfalls nirgends.
- **Text, der schon in Großbuchstaben geschrieben ist**: 123 Fundstellen, alle
  legitim — Eigennamen und Kürzel (DATEV, ACME GmbH, WCAG, OPOS, KOST),
  Dateiformate (TIFF, JSON), Hex-Werte in `Grundlagen/Farbe`, Bezeichner in
  `Grundlagen/Icons` (`ENTITY_ICON`) und die Prüfpunkt-Codes des
  Buchungssatz-Editors (`P-KONTO`, `E-KONTO`, `P-UST`) in `.v2pp__code`.
  Keine einzige Beschriftung.

**Eine Lücke bleibt, bewusst:** beide Sweeps sehen nur das Blatt, nicht den
Inhalt von `<iframe>`. Die zwölf `Referenz/…`-Stories betten die gelieferten
Artboards aus `reference/` ein, und die tragen weiter Versalien (fünf Regeln
allein in ihrem eigenen `components.css`). Das ist kein Mangel: die Artboards
laufen „wie geliefert, nie nachgebaut" (`src/reference/Artboards.stories.tsx`,
Kopfkommentar) und sind die Quelle, gegen die dieses Set gebaut wird, nicht
Teil davon.

### Mängel

1. **Der Entscheid kennt drei Stufen, `app-chrome.css` wendet zwei an.**
   `.sb__navlabel` (`src/styles/app-chrome.css:88–92`) steht auf
   `12,5 px / **600**` — der Beschriftungs-Stufe. Es ist aber ein Kopf über
   einer Gruppe von Zeilen, also nach der Tabelle des Entscheids die
   Gruppenkopf-Stufe `12,5 px / **700**`; dieselbe Rolle in `v3.css` steht
   überall auf 700 (gemessen: `.v2lp__grp` 12.5/700, `.v2kf__grp` 12.5/700,
   `.v2fields__h` 12.5/700, `.v2tbl__group` 12.5/700). Der Kopfkommentar der
   Datei sagt die Abweichung selbst: „Neun Stellen sind auf dieselben **zwei**
   Stufen gegangen" (`app-chrome.css:3–4`) — der Entscheid nennt drei und
   sagt ausdrücklich „keine Ausnahme". Sichtbar in
   `v3-primitives-navigation-navlist--in-shell`: die Abschnittsköpfe der
   Seitenleiste stehen auf `12.5px / 600 / rgb(111, 132, 153)` über ihren
   eigenen Zeilen mit `14px / 400 / rgb(197, 210, 223)` — der Kopf ist damit
   das leiseste Wort in der Leiste, und in der ersten Gruppe heißt er wie die
   Zeile darunter („Übersicht" über „Übersicht"). Es bleibt unterscheidbar
   (Größe, Helligkeit, kein Icon), deshalb ist das Urteil zur Beschriftung
   oben grün — aber die Stufe ist die falsche.
   Dieselbe Verwechslung, nur heute unsichtbar, in drei weiteren Regeln
   derselben Datei: `.hero__summary > .lbl` (Z. 529) ist ein Abschnittskopf
   und steht auf `11,5/600` statt `12,5/700`; `.hero__total .lbl` (Z. 521) und
   `.hero-fact .lbl` (Z. 525) beschriften einen Wert — dieselbe Rolle wie
   `.v2ehead__metric__label`, das auf `12,5/600` steht — und stehen auf
   `11,5/600`. Von den neun angefassten Regeln in `app-chrome.css` benutzt nur
   `.sb__navlabel` überhaupt ein v3-Baustein (`src/ui/v3/primitives/NavList.tsx:73`);
   die übrigen acht sind dieselbe tote v1-Schicht, für die 17 andere Stellen
   liegen bleiben durften. Der Fehler kostet trotzdem nichts zu beheben und
   trägt sonst den Entscheid falsch weiter.

### Beobachtungen außerhalb der Kriterien

- **Ein Spaltenkopf, zwei Typografien.** `.bse__head` (`v3.css:1390`) ist der
  Spaltenkopf des Buchungssatz-Editors und steht jetzt auf `12,5 px / 700` —
  vorher `10,5 px` mit geerbtem Gewicht 400. Der Spaltenkopf der `Table`
  (`.v2tbl__head`) steht auf `11,5 px / 600`. Dieselbe Sache, zwei Stufen;
  gemessen in `journalentryeditor--s-19-judge-with-note` gegen
  `table--filled`. Der Entscheid ordnet Spaltenköpfe keiner der drei Rollen
  zu — das ist die Lücke, die das erlaubt hat, und sie gehört bei
  Gelegenheit geschlossen.
- **Zwei tote Token.** `--fs-ui-2xs` (`tokens.css:115`) wird von nichts mehr
  benutzt und trägt den Kommentar „Versalien-Label" — der Satz ist seit 0089
  falsch und steht ausgerechnet in der Quelle der Schriftleiter. `--tr-overline`
  (`tokens.css:104`) hat mit `.lw-overline` seinen einzigen Abnehmer verloren.
- **Zwei Kommentare zeigen ins Leere.** `v3.css:966` erklärt `.v2bar__label`
  damit, dass es sich „auch in einem Versalienkopf (`v2lp__grp`)" behauptet —
  den gibt es nicht mehr; die Regel selbst (`text-transform: none`,
  `letter-spacing: normal`) ist seit 0089 wirkungslos.
- **Sperrung, die 0089 nicht erwischt hat.** Vier Regeln in `v3.css` tragen
  weiter `letter-spacing: 0.04em` bei 11 px: `.v2cmd__grp [cmdk-group-heading]`
  (Z. 1193), `.v2phead__over` (Z. 1761), `.v2cmb__grp` (Z. 1870), `.v2tl__day`
  (Z. 1927). Sie standen nie in Versalien und lagen deshalb nicht im Umfang —
  aber `.v2phead__over` ist eine Überzeile wie `.v2ehead__over`, das jetzt auf
  `11,5 px` ohne Sperrung steht, und `.v2cmb__grp` ist ein Gruppenkopf wie
  `.v2kf__grp`. Vier Stellen, an denen die drei Stufen noch nicht sitzen.
- **Der Abschnittskopf ist kleiner als das, was er überschreibt.** In
  `FieldList --filled` steht der Titel auf `12,5 px / 700`, die Zeilen darunter
  auf `13,5 px / 400`. Das trägt hier — Gewicht und die Trennlinie machen den
  Kopf — ist aber die Konstruktion, die als Erste kippt, wenn ein Kopf einmal
  ohne Trennlinie steht.

## Der Mangel der Abnahme vom 2026-09-06 — behoben, und die Lücke im Entscheid geschlossen

**Der Mangel:** `.sb__navlabel` stand auf 600 statt 700. Es ist ein
Gruppenkopf über Zeilen — dieselbe Rolle wie `.v2lp__grp`, `.v2kf__grp`,
`.v2tbl__group` —, und der Kopfkommentar der Datei gab die Abweichung selbst
zu Protokoll („dieselben **zwei** Stufen"), wo der Entscheid drei nennt. Jetzt
700, und der Kommentar nennt alle drei Rollen.

Dieselbe Verwechslung, vom Prüfer im selben Zug gefunden: `.hero__summary >
.lbl` ist ein Kopf (700), `.hero__total .lbl` und `.hero-fact .lbl` sind
Beschriftungen eines Wertes (12,5 px / 600) — sie standen auf der
Überzeilen-Stufe.

**Die Lücke im Entscheid: der Spaltenkopf hatte keine Rolle.** Deshalb
standen `.v2tbl__head` (11,5 / 600) und `.bse__head` (12,5 / 700)
verschieden da, obwohl beide dasselbe tun. Ein Spaltenkopf **beschriftet die
Werte unter sich** — das ist die Rolle „Beschriftung eines Wertes", also
12,5 px / 600. Beide stehen jetzt so.

Nachgemessen über alle **523 Stories**: **513 Kopfzellen**, keine einzige
mehrzeilig. Die Köpfe sind einen Punkt größer und brechen trotzdem nirgends um
— was der Prüfer schon für die Beschriftungen gezeigt hatte, gilt auch hier:
Versalien plus Sperrung waren breiter als Gemischtschreibung.

**Die drei Nebenbefunde, alle mitgenommen:**

- Vier Regeln trugen weiter `letter-spacing` bei 11 px, obwohl sie nie
  Versalien hatten (`.v2phead__over`, `.v2cmb__grp`, `.v2tl__day`,
  `.v2cmd__grp`) — die Sperrung ist weg, denn sie war für Großbuchstaben da,
  und ohne sie ist sie nur ein Auseinanderziehen.
- `--tr-overline` ist tot und gelöscht; der Kommentar an `--fs-ui-2xs` hieß
  „Versalien-Label" — ausgerechnet in der Schriftleiter — und heißt jetzt
  „Kleinstmaß: Taste, Zähler".
- Der Kommentar an `.v2bar__label` erklärte einen „Versalienkopf", den es
  nicht mehr gibt.

**Nicht geändert, mit Grund:** die zwölf `Referenz/…`-Stories betten die
gelieferten Artboards als `<iframe>` ein; die tragen weiter Versalien. Das ist
die Vorlage, nicht das Set — und der Sweep sieht sie zu Recht nicht.

## Abnahmekriterien (Nachtrag)

- [ ] `.sb__navlabel` und `.hero__summary > .lbl` stehen auf 700, die Wert-Beschriftungen auf 600
- [ ] Der Kopfkommentar von `app-chrome.css` nennt alle drei Rollen
- [ ] Spaltenköpfe sind Beschriftungen: `.v2tbl__head` und `.bse__head` beide 12,5 px / 600
- [ ] Kein Spaltenkopf bricht um — über alle Stories gemessen
- [ ] Keine `letter-spacing` mehr an Beischriften, die keine Versalien tragen (`grep`)
- [ ] `--tr-overline` existiert nicht mehr; kein Kommentar spricht mehr von Versalien-Stufen

## Abnahme (zweite Runde, fremd, 2026-09-06)

Zweiter Durchgang durch **alle** Kriterien — die des Nachtrags und die der
ersten Runde, denn die Behebung darf nichts umgeworfen haben. Abgenommen
gegen die Spec, nicht gegen den Chat; nicht vom Bauenden. Storybook auf Port
6107, Chromium headless bei 1440×900.

**Zum Stand des Arbeitsbaums:** während der Abnahme lag fremde Arbeit einer
parallelen Sitzung im Baum (`src/styles/v3.css`, ein angehängter Block
`.v2fsm*` für 0069). Der Block ist nachgesehen: er enthält kein
`text-transform`, keine `letter-spacing` und keine der Regeln dieser Aufgabe —
die Messung unten misst 0089. Dieselbe Sitzung hat mitten im Durchgang **sechs
Stories** ergänzt (`StateMachine --*`); der Bestand wuchs dabei von 523 auf
529. Die sechs sind einzeln nachgemessen, damit keine Lücke bleibt.

**Nachtrag**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `.sb__navlabel` und `.hero__summary > .lbl` stehen auf 700, die Wert-Beschriftungen auf 600 | `.sb__navlabel` im Blatt gemessen, `v3-primitives-navigation-navlist--in-shell`: alle fünf Abschnittsköpfe („Übersicht", „Buchung", „Stammdaten", „Reporting", „Kommunikation") → `12.5px / **700** / ls normal / tt none / rgb(111, 132, 153)` gegen `.sb__navitem` `14px / 400 / rgb(197, 210, 223)`. Im Bild ist der Kopf jetzt fett und die Zeile mager — die Verwechslung der ersten Runde ist weg. Die drei `hero`-Regeln haben **keine Story** (`grep -rn "hero__\|hero-fact" src/ui/ src/reference/` → keine Zeile; sie liegen allein in der toten v1-Schicht), deshalb am Quelltext geprüft: `app-chrome.css:536` `.hero__summary > .lbl` `font-weight: 700`, `:528` `.hero__total .lbl` und `:532` `.hero-fact .lbl` je `font-size: 12.5px; font-weight: 600` | ✓ |
| Der Kopfkommentar von `app-chrome.css` nennt alle drei Rollen | `app-chrome.css:7–10`: „Die Rollen sind dieselben drei wie dort: Beschriftung eines Wertes 12,5 px / 600, Überzeile 11,5 px / 600, Gruppen- und Abschnittskopf 12,5 px / 700." Der Satz „dieselben **zwei** Stufen", den die erste Runde als Selbstauskunft der Abweichung zitiert hat, steht noch in Z. 3 — er beschreibt dort aber die neun angefassten Stellen, nicht die Rollen, und wird von Z. 7–10 richtiggestellt | ✓ |
| Spaltenköpfe sind Beschriftungen: `.v2tbl__head` und `.bse__head` beide 12,5 px / 600 | Über **alle 529** Stories gemessen (`scratchpad/ab2-sweep.mjs`, ein Durchgang, je Kopf der berechnete Stil): **eine einzige** Ausprägung je Klasse — `.v2tbl__head` `12.5px/600/ls normal/tt none` (102 Vorkommen) und `.bse__head` `12.5px/600/ls normal/tt none` (14 Vorkommen). Keine Story weicht ab. Einzelmessung `table--filled`: Kopf `12.5/600/rgb(113,113,113)`; `journalentryeditor--s-2-split-full`: Kopf `12.5/600/rgb(113,113,113)`. Die beiden stehen jetzt gleich | ✓ |
| — und der Kopf bleibt vom Inhalt unterscheidbar (Nachprüfung des Entscheids, im Bild) | Angesehen, nicht nur gerechnet: `table--filled` und `table--density` (alle drei Dichten) als Bild. Der Kopf trägt **drei** Unterschiede zum Inhalt, von denen die Größe der schwächste ist: Farbe `rgb(113,113,113)` gegen `rgb(45,45,45)`, Gewicht 600 gegen 400, dazu die Trennlinie unter der Kopfzeile. Ein Punkt Größenunterschied (12,5 gegen 13,5) trägt für sich nichts, muss es aber auch nicht — im Bild liest sich „Gegenpartei / Betrag / Stand / Fällig" als das leiseste Wort der Tabelle, und der Inhalt darunter steht dunkel und halbfett. Der Entscheid trägt. Was auffällt: der Kopf ist jetzt **leiser als die Zwischenzeile** (`.v2tbl__group` „Überfällig", `12.5/700/rgb(92,92,92)` auf getönter Bank) — das ist die Ordnung, die der Entscheid will (Gruppenkopf 700 über Beschriftung 600), sieht aber ungewohnt aus, weil die Gruppe damit lauter ruft als die Spalte, die sie gliedert | ✓ |
| Kein Spaltenkopf bricht um — über alle Stories gemessen | `scratchpad/ab2-sweep.mjs` über alle 529 Stories, beide Klassen, je Zelle die gemessene Höhe gegen ihre eigene `line-height` (Schwelle 1,55 Zeilen): **624 Kopfzellen** (509 `.v2tbl__head`, 115 `.bse__head`), **null** mehrzeilig. Die Nachmessung des Bauenden (513 Zellen) hat die `.bse__head` nicht mitgezählt — das Werkzeug `head-wrap.mjs` fragt nur `.v2tbl__head` ab; mit beiden Klassen bleibt der Befund derselbe | ✓ |
| Keine `letter-spacing` mehr an Beischriften, die keine Versalien tragen | `grep -n "letter-spacing" src/styles/v3.css src/styles/app-chrome.css src/styles/tokens.css`: in `v3.css` **keine einzige** Zeile mehr — die vier Regeln der ersten Runde (`.v2cmd__grp`, `.v2phead__over`, `.v2cmb__grp`, `.v2tl__day`) sind weg. In `tokens.css` nur die fünf Überschriften-Token (`--tr-display`…`--tr-h4`, alle negativ, Display-Tracking). In `app-chrome.css` drei: zwei negative an `h1` (Z. 362, 520) und zwei positive an `.role-badge` (Z. 211, 0,005 em) und `.conf` (Z. 653, 10,5 px / 0,02 em) — beides Pillen der toten v1-Schicht, von keinem Baustein und keiner Story benutzt (geprüft gegen `src/ui/` und `src/reference/`), keine Beischriften. Siehe Beobachtung 2 | ✓ |
| `--tr-overline` existiert nicht mehr | `grep -rn "tr-overline" src/` → keine Zeile. `.lw-overline` (`tokens.css:317–324`) steht ohne `letter-spacing`, ohne `text-transform`, mit Gewicht 600 — die Klasse ist erhalten | ✓ |
| — kein Kommentar spricht mehr von Versalien-Stufen | `grep -rn "Versalien" src/styles/ src/ui/`: in den Stylesheets beschreibt jede Fundstelle die **Abschaffung** (`v3.css:854–871`, `:970`, `:2069`, `:2693`, `tokens.css:313–316`, `app-chrome.css:1–10`) — richtig. Unter `src/ui/` stehen aber **drei** Kommentare, die eine Versalien-Stufe als heutige Gestalt behaupten, die es nicht mehr gibt | ✗ (M1) |

**Erste Runde — nachgeprüft, ob die Behebung etwas umgeworfen hat**

| Kriterium der ersten Runde | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0 — mit der fremden Arbeit im Baum. `pnpm build` in dieser Abnahme untersagt, deshalb wie beim ersten Mal nicht gemessen | ✓ (build offen) |
| Keine sichtbaren Versalien mehr im Set | Eigener, breiter Sweep über **alle 529** Stories (`ab2-sweep.mjs`): je Element `text-transform` **über die eigenen Textknoten** (also auch an Elementen mit Kindern), dazu `capitalize`, dazu `::before`/`::after` mit eigenem `text-transform`, dazu `font-variant-caps`. **Null** Treffer, die sechs neuen `StateMachine`-Stories eingeschlossen. Gegenprobe im Quelltext: `grep -rn "text-transform" src/styles/{v3,app-chrome,tokens}.css` → nur `app-chrome.css:771` (`none`) und `v3.css:855` (ein Kommentar, der die Regel zitiert); `grep -rn "uppercase\|textTransform" src/ui/` → keine Zeile | ✓ |
| `.v2field__label` 12,5 px / 600, ohne Sperrung, ohne `text-transform` | `field--filled`: `LABEL «Beleg 1»` → `12.5px / 600 / ls normal / tt none / rgb(92, 92, 92)`, daneben `.v2in` `13.5px / 400 / rgb(45, 45, 45)`. Unverändert gegenüber der ersten Runde | ✓ |
| Die `<legend>` einer `RadioGroup` trägt dieselbe Stufe | `radiogroup--filled`: `LEGEND «Umfang des Exports»` → `12.5px / 600 / ls normal / tt none / rgb(92, 92, 92)` — Zeichen für Zeichen dasselbe wie das Feld-Label | ✓ |
| `.lw-overline` ohne Versalien und ohne Sperrung, als Klasse erhalten | `tokens.css:317–324` unverändert: Gewicht 600, `--fs-overline`, `--color-text-muted`, kein `text-transform`, keine `letter-spacing`. Der Kopfkommentar (Z. 312–316) begründet weiter, warum die Überzeile keine benannte Ausnahme ist | ✓ |
| Die Beschriftung liest sich nicht wie ihr Wert | Im Bild nachgesehen an `field--filled`, `table--filled`, `table--density`, `navlist--in-shell`, `journalentryeditor--s-2-split-full`. Der neue Fall ist die Seitenleiste: der Abschnittskopf steht jetzt auf 700 und ist damit **fetter** als seine Zeilen (400), obwohl er kleiner und leiser ist — die Stelle, die in der ersten Runde als „das leiseste Wort in der Leiste" bemängelt wurde, trägt jetzt. In der ersten Gruppe heißt der Kopf weiter wie die Zeile darunter („Übersicht" über „Übersicht"), ist aber durch Gewicht, Größe, Farbe und das fehlende Icon klar getrennt | ✓ |
| Keine doppelte Wirkung auf das Layout (Gegenprobe) | `scratchpad/ab2-overflow.mjs` über alle 529 Stories: je Kopfzelle `scrollWidth − clientWidth`, einmal im Bestand und einmal mit der Typografie **vor** 0089 im Blatt wieder eingesetzt (`.v2tbl__head` 11 px/600/0,04 em, `.bse__head` 10,5 px/400). **Eine** Zelle im ganzen Set läuft über ihre Spalte hinaus, und zwar in beiden Zuständen — siehe Beobachtung 1 | ✓ (kein Rückschritt) |

### Mängel

1. **Drei Kommentare beschreiben eine Versalien-Stufe, die es seit 0089 nicht
   mehr gibt.** Das Kriterium des Nachtrags verlangt ausdrücklich „kein
   Kommentar spricht mehr von Versalien-Stufen"; die erste Runde hat dieselbe
   Krankheit an `--fs-ui-2xs` („Versalien-Label") und `.v2bar__label`
   („Versalienkopf") gefunden, und beide sind behoben. Unter `src/ui/` sind
   drei stehen geblieben:
   - `src/ui/v3/primitives/ProseCard.tsx:4` — „Fließtext in einer Karte:
     **Versalien-Kopf**, 13,5 px Text." Das ist der JSDoc-Block der
     Komponente selbst, derselbe, der `@when`/`@instead` trägt. Gemessen ist
     `.v2prose__h` (`v3.css:693–696`) `--fs-ui-sm` / 700 / `--color-text-muted`
     — ein Gruppenkopf nach dem Entscheid, ohne jede Versalie.
   - `src/ui/v3/primitives/ProseCard.stories.tsx:8` — „Fließtext-Karte für
     längere Erklärungen — **Versalien-Header**, 13,5 px Text."
   - `src/ui/v3/primitives/FieldList.stories.tsx:17` — „Standardton —
     Label/Wert-Paare in einer Karte mit **Versalien-Header**."

   Die beiden Story-Kommentare sind nicht nur Kommentare: Storybook rendert
   sie als Beschreibung der Story. Ein Leser bekommt dort also die Auskunft,
   die Karte trage einen Versalien-Header — während direkt darunter das
   Gegenteil zu sehen ist. Damit dokumentiert das Set einen Regelbruch als
   seine Gestalt, ausgerechnet in der Aufgabe, die ihn abgeschafft hat.
   `grep -rn "Versalien" src/ui/` findet alle drei.

### Beobachtungen außerhalb der Kriterien

1. **Ein Spaltenkopf im Buchungssatz-Editor druckt über seinen Nachbarn.**
   `journalentryeditor--s-2-split-full`: die Spalte „Text" steht im Raster auf
   `minmax(0,1fr)` (`JournalEntryEditor.tsx:244`) und fällt bei der Breite
   der Story auf **0 px** zusammen; der Kopf `<span>Text</span>`
   (`JournalEntryEditor.tsx:289`) wird trotzdem gerendert, läuft mit
   `overflow: visible` **26 px** aus seiner Nullspalte heraus und legt sich
   auf „KOST". Im Bild steht dort „TKOST". Das ist **kein Rückschritt durch
   0089**: mit der Typografie von vorher (10,5 px / 400) waren es 21 px, also
   derselbe Überdruck, nur fünf Pixel schmaler — gemessen im selben Lauf
   (`ab2-overflow.mjs`, Spalte „vorher"). Der größere Kopf macht einen
   vorhandenen Fehler sichtbarer, er verursacht ihn nicht. Es ist die einzige
   solche Stelle im ganzen Set. Gehört zur Buchungssatz-Familie, nicht zu
   0089: entweder fällt der Kopf mit seiner Spalte weg, oder die Spalte
   bekommt ein Mindestmaß.
2. **Zwei Pillen tragen weiter Sperrung.** `.role-badge`
   (`app-chrome.css:205–212`, 11,5 px / 0,005 em) und `.conf` (`:651–656`,
   10,5 px / 600 / 0,02 em). Beide standen nie in Versalien und lagen deshalb
   nie im Umfang; `.conf` hat aber genau die Gestalt der vier Regeln, die in
   dieser Runde in `v3.css` bereinigt wurden — kleine Schrift, halbfett,
   positive Sperrung. Beide gehören zur toten v1-Schicht (kein Baustein, keine
   Story benutzt sie), fallen also mit den 17 Stellen aus `components.css` und
   `booking.css`, die 0089 bewusst liegen gelassen hat.
3. **Der Spaltenkopf ist jetzt die leiseste Zeile der Tabelle.** Nach dem
   Entscheid richtig (Beschriftung 600, Gruppenkopf 700), im Bild aber
   ungewohnt: die Zwischenzeile `.v2tbl__group` ruft lauter als der Kopf, den
   sie gliedert. Trägt hier, weil die Kopfzeile ihre Trennlinie hat — es ist
   dieselbe Konstruktion, die die erste Runde schon an der `FieldList`
   angemerkt hat und die als Erste kippt, wenn ein Kopf einmal ohne
   Trennlinie steht.
4. **Der Bestand ist während der Abnahme gewachsen.** Eine parallele Sitzung
   hat sechs `StateMachine`-Stories und einen `.v2fsm*`-Block in `v3.css`
   ergänzt (0069). Beide sind mitgemessen: keine Versalien, keine
   `letter-spacing`, kein `text-transform`. Der neue Block hält die drei
   Stufen ein (`.v2fsm__label` `--fs-ui-sm`/600, `.v2fsm__value` und
   `.v2fsm__now` `--fs-ui-xs`).

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-06
· Status zurück auf `in Arbeit`, ein Mangel: drei Kommentare unter `src/ui/`
behaupten weiter eine Versalien-Stufe, zwei davon sichtbar in der
Storybook-Beschreibung (M1). Alles andere trägt: die drei Rollen sitzen jetzt
auch in `app-chrome.css`, der Spaltenkopf hat seine Rolle bekommen und steht
in beiden Familien gleich (12,5 / 600), keine der 624 Kopfzellen bricht um,
und über 529 Stories ist keine sichtbare Versalie mehr zu finden.

## Der Mangel der zweiten Abnahme — behoben

Drei Kommentare unter `src/ui/` behaupteten weiter eine Versalien-Stufe, die
es nicht mehr gibt: `ProseCard.tsx` („Versalien-Kopf" im JSDoc der
Komponente), `ProseCard.stories.tsx` und `FieldList.stories.tsx`
(„Versalien-Header"). Die beiden Story-Kommentare rendert Storybook als
Beschreibung — dort stand die Auskunft direkt über dem Gegenbeweis. Alle drei
heißen jetzt „Abschnittskopf".

Dieselbe Krankheit wie in der ersten Runde an `--fs-ui-2xs` und
`.v2bar__label`; übersehen, weil ich im **Stylesheet** gesucht hatte und nicht
im Code.

## Die drei Befunde der Abnahme — festgehalten, nicht hier behoben

1. **Ein Spaltenkopf druckt über seinen Nachbarn** (`JournalEntryEditor
   --s-2-split-full`): die Spalte „Text" steht auf `minmax(0,1fr)`, fällt auf
   0 px zusammen, und der Kopf läuft 26 px in „Kost" hinein. **Kein
   Rückschritt dieser Aufgabe** — mit der alten Typografie waren es 21 px,
   derselbe Überdruck fünf Pixel schmaler. Er gehört zur Buchungssatz-Familie
   und ist als Befund in 0044 notiert.
2. Zwei Pillen der v1-Schicht tragen weiter Sperrung (`.conf`,
   `.role-badge`) — dieselbe Gestalt wie die vier Regeln, die diese Runde in
   `v3.css` bereinigt hat. Sie fallen unter dieselbe Begründung wie die 17
   übrigen Stellen dieser Schicht: keine v3-Komponente benutzt sie.
3. **Der Spaltenkopf ist jetzt die leiseste Zeile der Tabelle** — die
   Zwischenzeile (`.v2tbl__group`, 700) ruft lauter als die Spalte, die sie
   gliedert. Nach dem Entscheid richtig (ein Gruppenkopf gliedert, eine
   Spaltenbeschriftung benennt), im Bild ungewohnt. Wer es umdreht, dreht die
   Rollen um; das wäre eine neue Entscheidung, keine Korrektur.

## Abnahmekriterien (Nachtrag der zweiten Runde)

- [ ] Kein Kommentar unter `src/` spricht mehr von einer Versalien-Stufe (`grep`, **auch** in `.tsx`)

## Abnahme (dritte Runde, fremd, 2026-09-07)

Die zweite Runde hat **nicht abgenommen** — ein Mangel: drei Kommentare unter
`src/ui/` behaupteten eine Versalien-Stufe. Diese Runde prüft **den Mangel und
alle Kriterien noch einmal**, denn seit dem 2026-09-06 ist viel bewegt worden:
der Bestand ist von 529 auf **717 Stories** gewachsen. Storybook auf Port 6107
(Dev-Server, Katalog aus `/index.json`), Chromium headless bei 1440×900. Nicht
vom Bauenden, gegen die Spec, nicht gegen den Chat.

**Urteil: bestätigt.** Der Mangel M1 ist behoben, das Kriterium des Nachtrags
ist erfüllt, und keines der Kriterien der ersten beiden Runden ist umgeworfen.
**Ein Befund** gehört weitergereicht, blockiert diese Aufgabe aber nicht: eine
spätere Aufgabe (0106) hat der Tabellen-Zwischenzeile ihr Gewicht genommen —
siehe unten.

**Zum Stand des Arbeitsbaums:** während der Prüfung arbeiteten mehrere fremde
Sitzungen im selben Baum (Sachverhalts-Familie, `src/ludwig/`). Ihre Arbeit
berührt keine der Regeln dieser Aufgabe; `pnpm typecheck` war im ersten Anlauf
rot durch eine halbfertige Datei einer solchen Sitzung und nach deren Commit
grün (Exit 0). Der Katalog kam durchgehend vom Dev-Server, nicht aus
`storybook-static/` — das Verzeichnis wird von parallelen Bauten geleert
(„Build-Flacker", 0117).

**Der Mangel der zweiten Runde**

| Kriterium (Nachtrag der zweiten Runde) | Nachweis | Ergebnis |
|---|---|---|
| Kein Kommentar unter `src/` spricht mehr von einer Versalien-Stufe (`grep`, **auch** in `.tsx`) | `grep -rn "Versalien" src/` → 13 Fundstellen, **jede** beschreibt die Abschaffung: `ProseCard.tsx:4`, `ProseCard.stories.tsx:8` und `FieldList.stories.tsx:17` heißen jetzt „**Abschnittskopf**", die übrigen stehen in `v3.css`, `app-chrome.css`, `tokens.css` und `Typography.stories.tsx` („Über dem Feld, ohne Versalien (0089)"). Keine behauptet eine Versalien-Stufe als heutige Gestalt | ✓ |

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `tsc --noEmit`, **Exit 0** | ✓ |
| `pnpm build` grün | einmal gelaufen, **Exit 0** — am Exit-Code geprüft, nicht an der letzten Zeile. Danach vom Owner untersagt (parallele Prüfer im selben Baum). Damit ist der Punkt, den die ersten beiden Runden offenlassen mussten, **geschlossen** | ✓ |
| `pnpm check:icons` / `pnpm check:contrast` | beide **Exit 0** | ✓ |
| Im Browser angesehen | **alle 717 Stories** in zwei vollständigen Durchläufen geöffnet und vermessen (0 Fehler, 0 leer gerenderte), dazu Einzelbilder von `field--filled`, `radiogroup--filled`, `table--filled`, `journalentryeditor--s-2-split-full`, `navlist--in-shell`, `kpitile--six-columns`, `fieldlist--filled`, `typografie--scale` | ✓ |

**Variabel (erste Runde)**

| Kriterium | Nachweis (Story-ID · Messwert) | Ergebnis |
|---|---|---|
| **Keine sichtbaren Versalien mehr im Set** — über alle Stories gemessen, nicht über den Quelltext | Eigener Sweep über **alle 717** Stories: je Element der berechnete `text-transform` über die **eigenen Textknoten** (also auch an Elementen mit Kindern), dazu `capitalize`, dazu `::before`/`::after` mit eigenem `text-transform`, dazu `font-variant-caps`. **`text-transform` 0 · Pseudoelemente 0 · `font-variant-caps` 0.** Die Messung ist gegengeprobt: mit `.v2field__label{text-transform:uppercase}` zur Laufzeit meldet derselbe Sweep **4** Treffer, nach dem Entfernen wieder 0 | ✓ |
| — und was schon groß **geschrieben** ist, ist es zu Recht | 75 verschiedene Zeichenketten in reinen Großbuchstaben, alle legitim: SEPA-Schlüssel im Verwendungszweck (`EREF`, `MREF`, `PURP`, `CRED`, `KREF`, `OAMT`, `ABWA`, `NONREF`), Währungen und Einheiten (`EUR`, `CHF`, `STK`), Kürzel (`DATEV`, `IBAN`, `BIC`, `API`, `CLI`, `OPOS`, `KOST`), Hex-Werte in `Grundlagen/Farbe`, Bezeichner in `Grundlagen/Icons` (`ENTITY_ICON`), Beleg- und Vertragsnummern, die Prüfpunkt-Codes des Buchungssatz-Editors (`P-KONTO`, `E-KONTO`, `P-UST` …). **Keine einzige Beschriftung** | ✓ |
| `.v2field__label` steht in 12,5 px, 600, ohne Sperrung und ohne `text-transform` | Über alle 717 Stories: **202 Vorkommen, eine einzige Ausprägung** — `12.5px / 600 / ls normal / tt none`. Einzelmessung `field--filled`: „Beleg 1" `rgb(92,92,92)` neben `.v2in` `13.5px / 400 / rgb(45,45,45)`. Gegenprobe: die alte Typografie zur Laufzeit wieder eingesetzt → `11px / 600 / ls 0.44px / tt uppercase`, danach wieder der Ausgangswert | ✓ |
| Die `<legend>` einer `RadioGroup` trägt dieselbe Stufe wie ein Feld-Label | `radiogroup--filled`: `LEGEND.v2field__label` „Umfang des Exports" → `12.5px / 600 / ls normal / tt none / rgb(92,92,92)` — Zeichen für Zeichen dieselbe Messung wie das Feld-Label | ✓ |
| Der Spaltenkopf einer Tabelle steht ohne Versalien (A2) und bleibt vom Inhalt unterscheidbar | `table--filled`: Kopf `12.5/600/rgb(113,113,113)` gegen Zellen `13.5/400/rgb(45,45,45)` — drei Unterschiede (Farbe, Gewicht, Trennlinie), die Größe ist der schwächste davon und muss es nicht tragen | ✓ |
| `.lw-overline` hat keine Versalien und keine Sperrung mehr — und ist als Klasse erhalten | Über alle Stories: **24 Vorkommen, eine Ausprägung** — `12px / 600 / ls normal / tt none`. Die Klasse steht unverändert in `tokens.css:328–334`, der Kopfkommentar (Z. 322–327) begründet weiter, warum die Überzeile keine benannte Ausnahme ist | ✓ |
| Kein `text-transform: uppercase` mehr in `v3.css`, `app-chrome.css`, `tokens.css` und in keinem Inline-Stil unter `src/ui/v3` | `grep -n "text-transform" src/styles/{v3,app-chrome,tokens}.css` → zwei Zeilen: `app-chrome.css:777` (`none`) und `v3.css:924` (ein Kommentar, der die Regel zitiert). `grep -rn "text-transform\|textTransform\|uppercase\|small-caps\|font-variant-caps" src/ui/` → **keine Zeile** | ✓ |
| Die Beschriftung liest sich nicht wie ihr Wert | Über alle 717 Stories je Klasse **eine einzige** Ausprägung: `.v2field__label` 202 × `12,5/600`, `.v2kpi__label` 35 × `12,5/600`, `.v2ehead__metric__label` 13 × `12,5/600` — jeweils über Werten in `13,5/400` bis `19–20 px`. Im Bild nachgesehen an `field--filled`, `kpitile--six-columns`, `fieldlist--filled`, `navlist--in-shell` | ✓ |

**Variabel (Nachtrag der zweiten Runde)**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `.sb__navlabel` und `.hero__summary > .lbl` stehen auf 700, die Wert-Beschriftungen auf 600 | `.sb__navlabel` über alle Stories: **34 Vorkommen, eine Ausprägung** `12.5px / **700** / ls normal / tt none` (`navlist--in-shell`: `rgb(111,132,153)` über Zeilen `14px / 400`). Die drei `hero`-Regeln haben weiterhin keine Story und sind am Quelltext geprüft: `app-chrome.css:542` `.hero__summary > .lbl` `700`; `:534` `.hero__total .lbl` und `:538` `.hero-fact .lbl` je `12.5px / 600` | ✓ |
| Der Kopfkommentar von `app-chrome.css` nennt alle drei Rollen | `app-chrome.css:7–10`: „Die Rollen sind dieselben drei wie dort: Beschriftung eines Wertes 12,5 px / 600, Überzeile 11,5 px / 600, Gruppen- und Abschnittskopf 12,5 px / 700." | ✓ |
| Spaltenköpfe sind Beschriftungen: `.v2tbl__head` und `.bse__head` beide 12,5 px / 600 | Über **alle 717** Stories, je Kopfzelle der berechnete Stil: `.v2tbl__head` **1188 Zellen**, `.bse__head` **146 Zellen** (in 26 Buchungssatz-Stories einzeln nachgemessen) — zusammen **1334 Kopfzellen** und **genau eine** Ausprägung: `12.5px / 600 / ls normal / tt none`. Keine Story weicht ab | ✓ |
| Kein Spaltenkopf bricht um — über alle Stories gemessen | Dieselben 1334 Kopfzellen, je Zelle die gemessene Höhe minus Innenabstand gegen ihre eigene `line-height` (Schwelle 1,55 Zeilen): **null** mehrzeilig | ✓ |
| Keine `letter-spacing` mehr an Beischriften, die keine Versalien tragen | `grep -n "letter-spacing" src/styles/{v3,app-chrome,tokens}.css`: in `v3.css` **keine einzige** Zeile; in `tokens.css` nur die fünf negativen Überschriften-Token; in `app-chrome.css` vier — zwei negative an `h1` (Z. 362, 526) und zwei positive an `.role-badge` (Z. 211) und `.conf` (Z. 659), beides Pillen der toten v1-Schicht, von keinem Baustein und keiner Story benutzt. Über alle 717 Stories gemessen trägt keine der fünf Beischriften-Klassen eine Sperrung (`ls normal`, ausnahmslos) | ✓ |
| `--tr-overline` existiert nicht mehr; kein Kommentar spricht mehr von Versalien-Stufen | `grep -rn "tr-overline" src/` → keine Zeile. `--fs-ui-2xs` trägt den Kommentar „Kleinstmaß: Taste, Zähler". Kommentare: siehe die Zeile zum Mangel oben | ✓ |

### Befund, weitergereicht — kein Mangel dieser Aufgabe

1. **Die Tabellen-Zwischenzeile hat ihr Gewicht verloren — durch 0106, nicht
   durch 0089.** Der Entscheid dieser Aufgabe kennt drei Rollen; die dritte
   („Gruppen- und Abschnittskopf, 12,5 px / **700**") sitzt heute überall außer
   an einer Stelle. Über alle 717 Stories gemessen: `.v2fields__h` 133 × `12,5/700`,
   `.v2lp__grp` 11 × `12,5/700`, `.v2prose__h` 4 × `12,5/700` — und
   **`.v2tbl__group` 14 × `12,5/400`**. Beide früheren Runden hatten hier 700
   gemessen.
   Die Regel selbst ist unverändert (`v3.css:191–199`, `font-weight: 700`); sie
   **verliert** seit dem Umbau der Tabelle auf ein echtes `<table>` (0106,
   Commit `6ecae07`) gegen `.v2tbl th, .v2tbl td { … font-weight: inherit … }`
   (`v3.css:52`) — Spezifität 0-1-1 gegen 0-1-0. Gemessen und gegengeprobt in
   `table--filled`: Bestand `TD` `400`; mit `.v2tbl td.v2tbl__group{font-weight:700}`
   zur Laufzeit `700`; nach dem Entfernen wieder `400`. Dieselbe Falle hatte
   0106 fürs `padding` schon erkannt und mit `.v2tbl td.v2tbl__group` (Z. 108)
   entschärft — beim Gewicht nicht.
   Im Bild trägt die Zeile noch: getönte Bank, zwei Trennlinien, `12,5` gegen
   `13,5` und `rgb(92,92,92)` gegen `rgb(45,45,45)`. Es ist also kein
   Lesbarkeitsfehler, sondern ein stillschweigend gekippter Entscheid.
   **Blockiert 0089 nicht**: die Zeile, die 0089 geschrieben hat, steht
   unverändert da; der Griff gehört in die Tabellen-Familie (0106), wo die
   Regel liegt, die sie schlägt.

### Beobachtungen außerhalb der Kriterien

1. **Vier Regeln sitzen weiter neben den drei Stufen.** Die zweite Runde hatte
   sie als Beobachtung notiert; die Behebung hat ihnen die Sperrung genommen,
   aber nicht die Stufe gegeben: `.v2cmd__grp [cmdk-group-heading]`
   (`v3.css:1322`) steht auf `12,5/**600**`, obwohl es ein Gruppenkopf ist;
   `.v2cmb__grp` (Z. 2000) auf `**11 px**/600`, ebenfalls ein Gruppenkopf;
   `.v2phead__over` (Z. 1891) auf `**11 px**/600`, obwohl `.v2ehead__over`
   (Z. 2317) als dieselbe Überzeile auf `--fs-ui-xs` (11,5) steht; `.v2tl__day`
   (Z. 2057) auf `11 px`/600. Keine von ihnen kam im Sweep vor (Kommandopalette
   und Combobox zeigen ihre Köpfe erst geöffnet), deshalb am Quelltext geprüft.
2. **Ein Gruppenkopf ruft weiter lauter als der Spaltenkopf, den er gliedert** —
   solange `.v2tbl__group` bei 400 steht, sogar leiser. Wer den Befund oben
   behebt, bekommt die Ordnung der zweiten Runde zurück (Gruppenkopf 700 über
   Beschriftung 600); wer sie umdreht, dreht die Rollen um und braucht dafür
   einen neuen Entscheid.
3. **Die zwölf `Referenz/…`-Stories** betten die gelieferten Artboards als
   `<iframe>` ein und tragen weiter Versalien. Unverändert richtig: das ist die
   Vorlage, nicht das Set — und beide Sweeps sehen sie zu Recht nicht.

Abgenommen von / am: **abgenommen**, Claude (Prüf-Agent, nicht der Bauende),
2026-09-07 · Der Mangel M1 der zweiten Runde ist behoben, `pnpm build` ist
nachgeholt (Exit 0), und über 717 Stories ist keine sichtbare Versalie, keine
Sperrung an einer Beischrift und kein umbrechender Spaltenkopf zu finden. Ein
Befund geht an die Tabellen-Familie (0106).
