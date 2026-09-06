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
