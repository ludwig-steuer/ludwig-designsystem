# 0231 · Grundschrift der Arbeitsfläche: 13,5 statt 16 px

| | |
|---|---|
| Status | fertig |
| Stufe | Stil (`src/styles/app-chrome.css`, `components.css`, `booking.css`), Wächter `scripts/check-type.mjs` |
| Klassen-Test | entfällt, kein Baustein |
| Quelle | llcto 2026-10-27, Owner: „Die Schriftgrößen sind nicht sehr unterschiedlich … festhalten, was die Policies für Schriftgrößen sind, und dann prüfen, ob die Policies angewandt sind“; Analyse der Designer-Sitzung vom selben Tag, Punkt 3 a |
| Ersetzt | in der App nichts direkt: Die App rendert `<main className="app__main">` mit diesem `app-chrome.css` (`apps/web/src/ui/components/layout/AppShell.tsx:56`), die Zeile wirkt dort mit |
| Blockiert | die Vorher-nachher-Messung von ll-abnahme auf allen Abnahme-Seiten; den Laufzeit-Wächter (danach) |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Text ohne Rolle sieht in der Arbeitsfläche heute aus wie ein Titel. `html, body`
stehen auf `--fs-body` (16 px, das lesende Register), und `.app__main` setzt
keine eigene Größe. Jeder `p` oder `span` ohne Klasse erbt deshalb 16/400, eine
Gestalt, die die Rollentabelle (0220/A14) nicht kennt. Auf den Abnahme-Seiten
sah dadurch alles gleich groß aus. Künftig erbt Text in der Arbeitsfläche die
Standardgröße 13,5 px. 16 px gibt es dann nur noch dort, wo eine Rolle sie
setzt (Flächen- und Abschnittstitel, halbfett).

Dazu kommen zwei Lücken, die die Messung gefunden hat:
- Acht Regeln im DS schreiben die Größe in der Kurzform `font: … px`. Eine
  davon setzt 12 px, eine Größe außerhalb der Skala.
- `check:type` prüft nur `font-size:` und übersieht diese Kurzform.

## Einordnung

- **Ursache statt Symptom:** Eine Zeile an der Arbeitsfläche ersetzt hunderte
  Klassen an Stellen ohne Rolle. Das lesende Register (`lw-body`, `lw-h1` …)
  setzt seine Größen selbst und bleibt unberührt.
- **Nicht `body`:** Login, Hilfe und Onboarding sind lesendes Register und sollen
  16 px behalten. Die Arbeitsfläche ist `.app__main`.
- **Kurzformen:** Jede bekommt die Größe ihrer Rolle als Token, die Schrift
  `var(--font-sans)` bleibt.

  | Regel | heute | Rolle | neu |
  |---|---|---|---|
  | `.tenant__menu-search input` (app-chrome) | `13px` | Feld | `var(--fs-ui)` |
  | `.filter-search input` (app-chrome) | `13px` | Feld | `var(--fs-ui)` |
  | `.md-tab` (app-chrome) | `500 13px` | Reiter, wie `.v2tabs` | `500 var(--fs-ui)` |
  | `.ed-inp` (booking) | `400 13px` | Feld | `400 var(--fs-ui)` |
  | `.ed-toggle` (booking) | `500 13px` | Zeile als Schalter | `500 var(--fs-ui)` |
  | `.chip` (booking) | `500 12.5px` | Chip | `500 var(--fs-ui-sm)` |
  | `.ml-collapse__head` (booking) | `500 12.5px` | Aufklapper, wie `.v2disc__sum` | `500 var(--fs-ui)` (Abnahme H4) |
  | `.pag .page` (components) | `500 12px` | Zahl im Blätterer, wie `.v2pager__count` | `500 var(--fs-ui-sm)` |

- **Wächter:** `check:type` prüft auch `font:`. Eine Größe darin ist nur als
  `var(--fs-…)` oder `inherit` erlaubt. Bestand, der danach noch übrig ist, geht
  wie bisher in die Sperrklinke (`type-baseline.json`).

## Verhalten

Es ändern sich zwei Dinge, und nur diese:

1. **Text, der seine Größe erbt und in `.app__main` steht:**
   - Text ohne Rolle (`p`, `span`, `td` ohne Klasse): 16 → 13,5.
   - Zeilentitel `.v2main` ohne eigenen Behälter: 16/600 → 13,5/600, die Rolle
     „Zeilentitel“; ebenso Textknöpfe ohne eigene Größe.
   - Die Datentabelle des Diagramms in `LedgerAccountView` (`caption`, `th`,
     `td`): 16 → 13,5. Sie ist `v2vh`, also nur vorgelesen, und ändert nichts
     Sichtbares.
2. **Die acht Kurzformen**, in und außerhalb von `.app__main`, wie in der Tabelle
   oben: fünf Regeln gehen von 13 auf 13,5, `.chip` bleibt bei 12,5, der
   Aufklapper `.ml-collapse__head` geht von 12,5 auf 13,5, der Blätterer
   `.pag .page` von 12 auf 12,5. Sieben davon rendert keine Story des Sets; die
   Änderung sieht man in der App.

Was eine eigene Rolle hat, bleibt gleich. Die Vorher-Messung zeigt 19 × 20/600
(Seitentitel), 2 × 16/600 mit eigener Klasse (`.v2callout__title`), 20 × 14/600
(Kartenkopf), dazu die 13,5er und 12,5er. Die übrigen 9 × 16/600 sind geerbt
(Punkt 1).

`font: inherit` an Knöpfen und Links übernimmt die Größe ihres Behälters. Der
setzt in den gemessenen Stories eine eigene Größe; was sich dabei trotzdem
verschiebt, zeigt der Vorher-nachher-Vergleich.

## Stories

Keine neue Story. Der Nachweis ist die Vorher-nachher-Messung über alle Stories,
die `.app__main` rendern (73 Stories in 13 Dateien, 16 davon mit einer
Arbeitsfläche). Die Vorher-Messung liegt im Scratchpad der Sitzung
(`main-type-before.json`).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Laufzeit-Wächter: jedes Paar aus Größe und Gewicht in `main` aus der Rollentabelle, kein 16/400, genau ein `h1` 20/600 | Skript über `scripts/cdp.mjs` | direkt nach 0231 (llcto 2026-10-27); App-Seite als Playwright-Check bei ll-abnahme |

## Abnahmekriterien

Fest, soweit anwendbar:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Kein Hex, kein px als Schriftgröße; nur Tokens der Skala
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `.app__main` setzt `font-size: var(--fs-ui)` und `line-height: var(--lh-ui)`; `html, body` bleiben bei `--fs-body`
- [ ] Vorher-nachher über alle Stories mit `.app__main` bei 1440 px: kein Text mit 16/400 mehr in `main`; jede Änderung ist ein Text, der seine Größe erbte, oder eine der acht Kurzformen (die Liste der Änderungen steht in der Abnahme)
- [ ] Unverändert: jede Rolle mit eigener Größe (20/600, 16/600 mit Klasse, 14/600, 13,5, 12,5, 11,5, 11), also kein Seitentitel, Kartenkopf oder Spaltenkopf verschiebt sich; ausgenommen die acht Kurzformen der Tabelle, darunter `.ml-collapse__head` 12,5 → 13,5
- [ ] Die acht Kurzformen tragen Tokens wie in der Tabelle; keine Kurzform mit `px`-Größe mehr in `src/styles` außer `tokens.css`
- [ ] `check:type` meldet eine Kurzform mit `px`-Größe (Selbstprüfung `--test` mit einem Fall `font: 500 13px …`) und endet auf dem Stand nach 0231 mit Exit 0
- [ ] Das lesende Register außerhalb `.app__main` (Story `v3/Grundlagen/Typografie`) ist unverändert

### Messung des Bauenden (keine Abnahme)

Gemessen mit `scripts/cdp.mjs` bei 1440 px über alle 73 Stories der 13 Dateien,
die `AppShell` oder `.app__main` nutzen. 16 davon rendern eine Arbeitsfläche. Je
Textknoten in `.app__main` wurde die berechnete Größe und das Gewicht mit Element
und Text notiert, vorher (`main-type-before.json`) und nachher
(`main-type-after.json`, beide im Scratchpad der Sitzung).

| vorher → nachher | Anzahl | wo |
|---|---|---|
| 16/400 → 13,5/400 | 15 | `LedgerAccountView/InUse`: `caption`, `td` der Diagrammtabelle; sie ist `v2vh` (nur vorgelesen) |
| 16/700 → 13,5/700 | 15 | dieselbe Tabelle, `th` |
| 16/600 → 13,5/600 | 9 | 6 × `span.v2main` in `Seiten/Deck` (Zeilentitel ohne eigenen Behälter); 3 Textknöpfe ohne eigene Größe: „Zum Kontenplan →“ in `LedgerAccountView/InUse`, „Zum Sachverhalt →“ in `SourceDocumentView/InUse`, „Zur Klärung“ in `CaseDetailView/InUse` |
| 12/500 → 12,5/500 | 6 | `.pag .page` im Blätterer (`CaseList`, Geschäftspartner-Liste, Konto-Seite) |
| 12/600 → 12,5/600 | 3 | dieselben, aktuelle Seite |

Sonst hat sich nichts geändert. Kein Textknoten fehlt nachher, und keine Rolle
mit eigener Größe hat sich verschoben: 19 × 20/600, 20 × 14/600 und alle 13,5er
und 12,5er sind gleich geblieben. Nachher gibt es in `main` kein 16/400 mehr. 16
steht nur noch zweimal als 16/600 mit eigener Klasse (`.v2callout__title`).
`pnpm check:type --test` und `pnpm check:type` enden mit Exit 0. Vor den Tokens
meldete der erweiterte Wächter genau die acht Kurzformen der Tabelle oben.

## Abnahme

Gemessen gegen HEAD `d0e6afd` plus den uncommitteten Diff an `app-chrome.css`,
`booking.css`, `components.css` und `check-type.mjs`. Vorher: HEAD per `git archive`
in den Scratchpad, dort `storybook build`, statisch auf Port 6231. Nachher: der
Dev-Server 6107. Ein Messskript mit `scripts/cdp.mjs` (ein Messbrowser) fährt beide
Seiten nacheinander ab. Es nimmt alle 73 Stories der 13 Dateien, die `AppShell`
rendern (per `rg "AppShell|app__main" src` ermittelt, IDs aus `index.json`), dazu
die sechs Typografie-Stories, `Pagination`, `CaseCrud` und `account-columns` (18),
alle bei 1440 px. Sechs davon misst es auch bei 1280 px. Erfasst sind jeder
Textknoten des Dokuments und jedes Formularfeld, sichtbar oder nicht, mit
`getComputedStyle` (Größe, Gewicht, Zeilenhöhe, Familie) und der Angabe, ob sie in
`.app__main` liegen. Vorher und nachher sind Knoten für Knoten gepaart: 97 Läufe,
gleiche Knotenzahl, kein Text verrutscht. Ein zweiter Lauf setzt die acht Kurzformen
als Proben in `.app__main` (sieben davon rendert keine Story) und macht die
Screenshots. Skripte und Rohdaten liegen als `abn0231-*` im Scratchpad der Sitzung.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` ist `storybook build` (`package.json`). Gebaut wurde deshalb im Scratchpad: ein HEAD-Abzug plus `git diff` per `git apply`, die vier Dateien byte-gleich mit dem Arbeitsbaum geprüft. Ergebnis „Storybook build completed successfully“, Exit 0. Das gebaute CSS trägt `.app__main{font-size:var(--fs-ui);line-height:var(--lh-ui);…}` | ✓ |
| Kein Hex, kein px als Schriftgröße; nur Tokens der Skala | Der Diff bringt kein Hex und keine Größe in px. Die neun geänderten CSS-Zeilen setzen `var(--fs-ui)` oder `var(--fs-ui-sm)`. `pnpm check:type` Exit 0 („0 older findings left in 0 files“). Das `#fff` in der Zeile `.chip` stand dort schon | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 97 Läufe rendern und lassen sich auslesen. Screenshots `abn0231-deck-questions-{head,wt}-1440.png` und `abn0231-ledgeraccountview-in-use-{head,wt}-1440.png`: Die Zeilentitel der Rückfragen-Liste stehen nachher so groß wie der Titel der Detailkarte daneben, „Zum Kontenplan →“ steht in Zeilengröße | ✓ |
| `.app__main` setzt `font-size: var(--fs-ui)` und `line-height: var(--lh-ui)`; `html, body` bleiben bei `--fs-body` | Code: `app-chrome.css:165`; `html, body` in `tokens.css:414–420` unverändert auf `--fs-body`/`--lh-body`. Gemessen in allen 16 Stories mit Arbeitsfläche (1440 px) und in 4 bei 1280 px: `.app__main` vorher 16px/24.8px, nachher 13.5px/20.925px (13,5 × 1,55). `html` und `body` stehen vorher und nachher auf 16px | ✓ |
| Vorher-nachher über alle Stories mit `.app__main` bei 1440 px: kein 16/400 mehr in `main`; jede Änderung geerbt (Liste) | 16/400 in `main`: vorher 51, nachher 0, unsichtbare Knoten mitgezählt. **Alle Änderungen in `main` bei 1440 px:** **16/400 → 13,5/400 · 51**, davon in `LedgerAccountView/InUse` 24 `td` und 1 `caption` der Diagrammtabelle (`v2vh`, nur vorgelesen) und 24 SVG-`title` der Balken (Tooltip, nicht gerendert), in `Seiten/Deck` Questions und Protocol je ein `span hidden`. **16/700 → 13,5/700 · 15**: dieselbe Tabelle, `th` (`v2vh`). **16/600 → 13,5/600 · 9**: `Seiten/Deck/Questions` 6 × `span.v2main` (Zeilentitel), dazu der `TextButton` im `EntityHeader`: „Zum Kontenplan →“ (`LedgerAccountView/InUse`), „Zum Sachverhalt →“ (`SourceDocumentView/InUse`), „Zur Klärung“ (`CaseDetailView/InUse`). **12/500 → 12,5/500 · 6 und 12/600 → 12,5/600 · 3**: `.pag .page` in `Seiten/Konto-Seite/InUse`, `Geschäftspartner-Liste/InUse` und `CaseList/InUse`. Diese Größe ist **nicht geerbt**, sie kommt aus der Kurzform. Sichtbar stand vor 0231 in `main` kein einziges 16/400. Sichtbar ändern sich nur die 9 × 16/600 und der Blätterer. Außerhalb `main` ändert sich nur `.pag .page` (42 Knoten in 14 Läufen ohne Arbeitsfläche, `Pagination` u. a.). Bei 1280 px sind es dieselben Arten | ✓ 16/400; ✗ „jede Änderung geerbt“ (Spec, M2) |
| Unverändert: jede Rolle mit eigener Größe (20/600, 16/600 mit Klasse, 14/600, 13,5, 12,5, 11,5, 11) | Gezählt je Gestalt in `main` bei 1440 px, vorher → nachher: 20/600 19 → 19, 16/600 mit eigener Klasse (`.v2callout__title`) 2 → 2, 14/600 20 → 20, 14/500 3 → 3, 13,5/500 84 → 84, 12,5/400 305 → 305, 12,5/700 5 → 5, 11,5/400 · 500 · 600 17 · 77 · 19 unverändert, 11/400 · 600 36 · 1 unverändert. Jeder Knoten, der seine Gestalt ändert, steht in der Liste darüber. Keiner davon hatte vorher eine Größe aus einer Rolle: Alle trugen die 16 von `body` oder waren `.pag .page`. Kein Knoten mit gleicher Größe hat eine andere Zeilenhöhe | ✓ |
| Die acht Kurzformen tragen Tokens wie in der Tabelle; keine Kurzform mit `px`-Größe mehr in `src/styles` außer `tokens.css` | Der Code entspricht der Tabelle Zeichen für Zeichen: `app-chrome.css:270, 499, 556`, `booking.css:167, 177, 206, 257`, `components.css:149`. `rg 'font\s*:' src` findet sonst nur `inherit` und `500 var(--fs-ui-xs)/1.4 var(--font-mono)` (`v3.css:3922`). `tokens.css` hat keine Kurzform. Als Proben in `.app__main` gemessen: die Suche im Mandantenmenü, `.filter-search input`, `.md-tab`, `.ed-inp` und `.ed-toggle` gehen von 13 auf 13,5. `.chip` und `.ml-collapse__head` bleiben bei 12,5. `.pag .page` geht von 12 auf 12,5 (aktiv 600). Die Familie bleibt Inter, `tabular-nums` am Blätterer bleibt, die `var()` in der Kurzform lösen auf | ✓ (H3, H4) |
| `check:type` meldet eine Kurzform mit `px`-Größe (`--test` mit `font: 500 13px …`) und endet nach 0231 mit Exit 0 | `pnpm check:type --test` Exit 0 („self-test ok“). Der Fall `font: 500 13px var(--font-sans)` steht in `check-type.mjs:176`, dazu `rem`, Token und `inherit` sowie TSX. `pnpm check:type` Exit 0. Gegenprobe: Der neue Wächter über die CSS von HEAD meldet genau die acht Kurzformen (3 + 4 + 1), Exit 1. Eine Sonde mit 35 Fällen (`abn0231-guard-probe.mjs`) bestätigt: `13px/1.4`, `500 13px/1.4`, `1rem/1.4`, `.8rem`, `10pt`, `!important`, ohne Einzug und direkt nach `{` werden gemeldet. `font-variant-numeric`, `font-feature-settings` und `--font-mono:` werden nicht gemeldet. Lücken und falsche Treffer: M1, H1, H2 | ✓ (M1) |
| Das lesende Register außerhalb `.app__main` (Story `v3/Grundlagen/Typografie`) ist unverändert | `v3-grundlagen-typografie--scale`, `--interface`, `--registers`, `--in-use`, `--roles`, `--headings` bei 1440 px, `--interface` und `--registers` auch bei 1280 px: 478 + 118 Knoten. Größe, Gewicht, Zeilenhöhe, Familie und Text sind vorher wie nachher gleich. Keine dieser Stories hat `.app__main`. Stichwerte nachher: `lw-body` 16/400/24.8px, `lw-body-sm` 14/400/21px, `lw-h1` 40/600, `lw-lede` 18/400, `lw-caption` 13/400 | ✓ |
| *(Auftrag)* Einordnung: Ursache an `.app__main`, nicht an `body` | In der App steht nur die Arbeitsfläche in `.app__main` (`apps/web/src/ui/components/layout/AppShell.tsx:56`, `app/globals.css:6` importiert `app-chrome.css`). Der Login liegt in `app/(auth)` ohne `AppShell`. Unter `app/(app)` gibt es keine Hilfe- oder Onboarding-Seite und kein `lw-body`. Seitenleiste, Kopfleiste und `.app__toonarrow` liegen außerhalb und ändern sich nicht (gemessen) | ✓ (H5) |
| *(Auftrag)* Rollen der acht Kurzformen | Feld auf `--fs-ui` wie `.v2in` (`v3.css:697–705`) und „Feld“ in `tokens.css:114`. Reiter `500 --fs-ui` wie `.v2tab` (`v3.css:830`). Chip `--fs-ui-sm` wie `.v2chip` (`v3.css:880`, dort mit 600). Blätterer `--fs-ui-sm` wie `.v2pager__count` (`v3.css:2886`) und `.pag .info`. `.ed-toggle` als Zeile auf `--fs-ui`. Eine Abweichung beim Aufklapper: H4 | ✓ (H4) |
| *(Auftrag)* Die Wächter-Erweiterung greift richtig | Die Kurzformen mit px, rem oder pt greift sie, auch mit Zeilenhöhe. Die Erlaubnisliste der Einordnung setzt sie nicht um: M1. Falsche Treffer: H1. Zeilenweise Lücken: H2 | ✗ (M1) |
| *(Auftrag)* Befund L-372: Stimmen die App-Stellen? | Geprüft am Stand vor App-`081964abe` (2026-10-27): `CloseFrame.tsx:133` `style={{ fontSize: 13 }}` an der Ortszeile, `CloseStep.tsx:188` `fontSize: 13` am Satz „… noch offen“, `HandoverActions.tsx` 4 × `fontSize: 13` (Z. 74, 121, 124, 149), `AcceptBatchEntriesButton.tsx:63–64`, `Step5List.tsx:183`, `Step6List.tsx:473`. Vor `f86d59d6b` stand `YearSwitcher.tsx:83` auf `font: "13px var(--font-sans)"`, mit `fontSize: 11` (Z. 89, 142) und `12.5` (Z. 62). `reports/demo-check-2026-10-27/round5/type-measure.json` zeigt auf allen sechs Seiten 13/400 (Ortszeile, „Noch 1 offen.“), 13/500 („2026“) und 13/600 („Buchungsstapel“). Alle genannten Stellen stimmen. Die Zahl „190“: H6 | ✓ (H6) |
| *(Auftrag)* Wächter über den Exit-Code | `pnpm typecheck` 0, `pnpm check:type` 0, `pnpm check:type --test` 0, `pnpm check:contrast` 0 („76 Angaben nachgerechnet“, 4 ohne Token ungeprüft, keine davon aus dem Diff). `pnpm check:classes` 1 mit den vier bekannten Klassen ohne Regel (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`). Der HEAD-Abzug meldet dieselben vier, der Diff fügt keine Klasse hinzu | ✓ (für 0231) |

Abgenommen von / am: fremde Abnahme (Messung der Kriterien), 2026-10-27 · Offene Punkte: M1, M2, H1–H7

## Mängel

- **M1 · Wächter und Einordnung sagen Verschiedenes.** Die Einordnung (Z. 49–50)
  sagt: „Eine Größe darin ist nur als `var(--fs-…)` oder `inherit` erlaubt.“ Das
  ist eine Erlaubnisliste wie `SIZE_OK` für `font-size:`. Der Code
  (`check-type.mjs:49`, `HARD_SIZE`) ist eine Verbotsliste: Er meldet nur eine Zahl
  mit `px`, `rem` oder `pt` nach Leerraum. Deshalb gehen `font: 500 calc(13px) …`,
  `500 85% …`, `500 small …`, `500 1vw …` und `500 var(--x-size) …` durch, obwohl
  der Wächter genau diese Werte unter `font-size:` meldet. Zu tun: Entweder liest
  der Wächter die Größe aus der Kurzform (das Glied vor `/` bzw. vor der Familie)
  und prüft sie gegen `SIZE_OK`, mit je einem `--test`-Fall für `calc()` und `%`.
  Oder die Einordnung wird auf „keine Größe in px, rem, pt“ eingeengt, und die
  Lücke wird als Ausnahme mit Owner und Datum benannt. Heute steht in `src` keine
  Kurzform mit einer solchen Größe.
- **M2 · Spec: „Verhalten“ und Kriterium 2 lassen die Änderungen weg, die die
  Kurzformen verlangen.** Z. 55 sagt: „Was sich ändert, ist **nur** Text, der seine
  Größe erbt und in `.app__main` steht“. Kriterium 2 (Z. 94) sagt: „jede Änderung
  ist ein Text, der seine Größe erbte“. Gemessen ändert sich aber auch
  `.pag .page` von 12 auf 12,5, in `main` (3 Stories) und außerhalb (14 Läufe,
  darunter `Pagination`). In der App gehen dazu fünf Kurzformen von 13 auf 13,5:
  `.filter-search input` auf der Geschäftspartner-Seite, `.md-tab` in
  `DatevExportTabs` und `.ed-inp` in `AccountCombobox`, `TaxKeySelect`,
  `ManualBookingDrawer` und `DocumentRequestMailPanel`. Auch Z. 62–63 stimmt
  nicht: Von den „11 × 16/600 (Titel)“ ändern sich 9 (6 Zeilentitel, 3
  `TextButton`). Nur die 2 × `.v2callout__title` bleiben. Der Code tut, was die
  Tabelle der Kurzformen sagt. Zu tun: Der Spec-Autor nimmt die Kurzformen in
  „Verhalten“ und Kriterium 2 auf und berichtigt Z. 62–63. Danach genügt eine
  Nachprüfung dieser Zeilen.

**Hinweise**

- **H1 · Falsche Treffer des Wächters.** Kommentare wie `/* … font: 13px … */`
  (CSS) und `// font: "13px …"` (TSX) werden gemeldet. Ebenso
  `font: 500 var(--fs-ui) / 18px …`, also eine Zeilenhöhe in px hinter einem `/`
  mit Leerzeichen. Die Kommentar-Schwäche hat die `font-size:`-Regel genauso. Im
  Bestand ist heute kein solcher Fall.
- **H2 · Lücken, weil der Wächter zeilenweise liest**, wie bei seinen anderen
  Regeln: ein Wert in der nächsten Zeile (`font:` ↵ `500 13px …`), eine
  TSX-Vorlage (`` font: `500 ${n}px …` ``) und eine Kurzform in einer eigenen
  Variable (`--row-font: 500 13px …; font: var(--row-font)`). Im Bestand ist
  heute kein solcher Fall.
- **H3 · Sieben der acht Kurzformen rendert keine Story.** Sie sind nur als Probe
  gemessen. `.tenant__menu-search` und `.ed-toggle` werden weder im Set noch in
  `apps/web/src` verwendet und sind Kandidaten zum Streichen. Die Änderung von 13
  auf 13,5 an `.filter-search input`, `.md-tab` und `.ed-inp` zeigt sich nur in der
  App. Die Nachher-Messung bei ll-abnahme sollte diese Orte mitnehmen.
- **H4 · Aufklapper.** `.ml-collapse__head` bekommt `--fs-ui-sm`. Der Aufklapper
  des Sets, `.v2disc__sum`, steht aber auf `--fs-ui`/500 (`v3.css:2280–2286`). Die
  Zeile behält den alten Wert und nennt keinen Nachbarn, die Zeilen für Reiter und
  Blätterer tun das. Entweder den Nachbarn nennen (in der Gestalt eher ein
  `TextButton` mit Chevron) oder auf `--fs-ui` setzen.
- **H5 · Stories ohne `AppShell` zeigen geerbten Text weiter in 16.** Gemessen
  zum Beispiel in `LedgerAccountView/Filled`: „Zum Kontenplan →“ 16/600 und die
  Diagrammtabelle 16/400. In der App steht dort 13,5. Wer einen Baustein in den
  Einzel-Stories ansieht, sieht die alte Grundschrift. Für den Laufzeit-Wächter
  (Ausbau) zählt die Messung in „InUse“.
- **H6 · L-372 ist in der App inzwischen umgesetzt.** Das zeigen `081964abe` und
  `f86d59d6b` („DS-Befund L-372“), beide vom 2026-10-27. Heute steht
  `CloseFrame.tsx:133` auf `lw-ui-hint` und `YearSwitcher.tsx:83` auf
  `var(--fs-ui)`. Die Zeile kann das vermerken. „190 Stellen“ lässt sich nicht
  genau nachzählen: Vor `081964abe` waren es 201 Vorkommen (169 × `fontSize: 13`,
  32 × `13px`), heute sind es 183.
- **H7 · Die „Messung des Bauenden“ ist bei „wo“ unvollständig.** Es fehlen
  „Zum Sachverhalt →“, „Zur Klärung“, die 24 SVG-`title`, die 2 `span hidden` und
  `.pag .page` außerhalb von `main`. Die Liste in der Abnahme (Zeile zum Kriterium
  in Z. 94) ersetzt sie.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Der Wächter prüft die Größe in `font:` jetzt wie `font-size:` gegen `SIZE_OK`. Gesucht wird das erste Wort nach den Schlüsselwörtern für Stil, Variante, Gewicht und Breite; eine Zeilenhöhe nach `/` bleibt außen vor. Ein einzelnes Wort (`inherit`, `caption`) gilt als erlaubt. Selbstprüfung ergänzt: `calc(13px)`, `85%`, `small`, `1vw`, `var(--fremd)` und `13px/1.4` werden gemeldet; `italic 600 var(--fs-ui-sm)/1.5 …` und `caption` gehen durch |
| M2 | „Verhalten“ nennt jetzt beide Arten der Änderung: geerbter Text in `main` und die acht Kurzformen, in und außerhalb von `main`. Die Zahl der 16/600 mit eigener Klasse heißt 2, die übrigen 9 sind geerbt. Das Kriterium hat der Spec-Autor im Wortlaut angepasst („… oder eine der acht Kurzformen“), nicht in dem, was es misst |
| H1 | Kommentare zählen nicht mehr: Zeilen, die mit `*`, `/*` oder `//` beginnen, und `/* … */` bzw. `// …` am Zeilenende. Selbstprüfung ergänzt |
| H2 | bleibt: Der Wächter liest zeilenweise, wie bisher für `font-size:`. Ein Wert in der nächsten Zeile oder in einer Variable ist ein Fall für den Laufzeit-Wächter (Ausbau) |
| H3 | bleibt als Grenze: sieben Kurzformen ohne Story, `.tenant__menu-search` und `.ed-toggle` ohne Verwendung im Set. Die Messung in der App macht ll-abnahme nach dem Hash |
| H4 | `.ml-collapse__head` auf `--fs-ui`, wie der Aufklapper des Sets `.v2disc__sum` |
| H5 | bleibt: Stories ohne AppShell rendern weiter im lesenden Register, so wie Login und Hilfe. Das ist kein Ort der Arbeitsfläche |
| H6 | L-372 in `befunde-app.md` trägt jetzt den Stand: in der App umgesetzt (`081964abe`, `f86d59d6b`); die Zahl 190 war eine Zählung vom 2026-10-27 |
| H7 | Die Spalte „wo“ der Messung nennt jetzt auch die drei Textknöpfe |

## Nachprüfung 1 (2026-10-27)

Eng geprüft: Behebt Nachbesserung 1 die Mängel M1 und M2, und stimmen die Angaben
zu H1, H4, H6 und H7? Stand: HEAD `d0e6afd` plus der uncommittete Diff. Seit der
ersten Abnahme hat sich am CSS nur `.ml-collapse__head` geändert (die beiden
Patches verglichen). Die Story-Messung der ersten Abnahme gilt deshalb weiter, und
nachgemessen wurde nur stichprobenhaft: am Dev-Server 6107 mit `scripts/cdp.mjs`
(ein Messbrowser) bei 1440 px. Sonden, Logs und Rohdaten liegen als `np0231-*` im
Scratchpad der Sitzung.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 · Größe in der Kurzform gegen `SIZE_OK` | `shorthandSizeOk` (`check-type.mjs:55–70`) zerlegt den Wert an Leerzeichen außerhalb von Klammern, überspringt `FONT_KEYWORD` und prüft das erste übrige Wort ohne `/…` gegen `SIZE_OK`, also wie `font-size:`. `pnpm check:type --test` Exit 0. Die Selbstprüfung enthält `calc(13px)`, `85%`, `small`, `1vw`, `var(--fremd)` und `13px/1.4`, dazu `italic 600 var(--fs-ui-sm)/1.5 …` und `caption` als erlaubt. Eine eigene Sonde mit 55 Fällen (`np0231-guard-probe.mjs`) importiert `findings`. Gemeldet werden `500 13px/1.4`, `12.5px`, `500 12.5px`, `font:13px` ohne Leerzeichen und nach `;`, `normal normal 500 normal 13px`, `13px … !important`, `13PX`, `x-small`, `larger`, `clamp(12px, 1vw, 14px)`, `14pt`, `13px` vor einer Familie in Anführungszeichen, zwei Kurzformen in einer Zeile und TSX mit beiden Anführungszeichen. Nicht gemeldet werden `font-variant`, `font-variant-numeric`, `font-feature-settings`, `font-size:`, `font: inherit` (auch mit `!important`), `font: var(--x)` als einzelnes Wort, Familien mit Leerzeichen in `"…"` und `'…'`, ein Token mit `!important`, `var(--fs-ui-sm)/var(--lh-ui)`, der Selektor `.icon-font:hover` und ein Objekt `font: { size: 12 }`. `bold 1em` und `500 1.2em` gehen durch, wie unter `font-size:`, weil `SIZE_OK` `em` erlaubt. Gegenprobe: Der heutige Wächter über die CSS von HEAD meldet genau die acht Kurzformen (3 + 4 + 1). `pnpm check:type` Exit 0. Über den heutigen Bestand (396 Dateien) liefern der Wächter von HEAD, der der ersten Abnahme und der heutige dieselben 0 Funde. Es kommt also keine Meldung hinzu (`np0231-guard-inventory.mjs`) | ✓ (N1–N3) |
| M2 · „Verhalten“ und Kriterium 2 | „Verhalten“ (Z. 55–77) nennt beide Arten der Änderung: geerbten Text in `main` (Text ohne Rolle, `.v2main`, Textknöpfe, die Diagrammtabelle) und die acht Kurzformen in und außerhalb von `main`. Geprüft gegen die Rohdaten der ersten Abnahme (`abn0231-analyse.json`, `changeList`), 1440 px: In `main` ändern sich 84 Knoten. 75 davon tragen keine Kurzform: 16/400 → 13,5 · 51 (24 `td` und 1 `caption` in `v2vh`, 24 SVG-`title`, 2 `span hidden`), 16/700 → 13,5 · 15 (`th`), 16/600 → 13,5 · 9 (6 × `span.v2main` in `Seiten/Deck/Questions`, 3 × `TextButton`). Die übrigen 9 kommen aus `.pag .page`. Außerhalb von `main` ändert sich nur `.pag .page` (42 Knoten), bei 1280 px kommen dieselben Arten vor. Die Zahlen in Z. 70–73 stimmen (`abn0231-measure.json`, `main`, 1440 px): 16/600 vorher 11, nachher 2 (`.v2callout__title`), 20/600 19 → 19, 14/600 20 → 20. Die Proben (`abn0231-probe.json`, heute nachgemessen in `np0231-measure.json`) zeigen fünf Kurzformen von 13 auf 13,5, `.chip` bei 12,5, `.pag .page` von 12 auf 12,5 und `.ml-collapse__head` heute bei 13,5 (H4). Stichprobe heute: `seiten-deck--questions`, `v3-entitäten-konto-ledgeraccountview--in-use` und `seiten-konto-seite--in-use` haben `.app__main` 13.5px/20.925px und `body` 16px. In `main` steht kein sichtbares 16, Zeilentitel und „Zum Kontenplan →“ stehen auf 13,5/600, der Blätterer auf 12,5. In `v3-primitives-navigation-pagination--middle-page` (ohne `main`) steht der Blätterer auf 12,5. Kriterium 2 misst im neuen Wortlaut dasselbe wie vorher, nur um die acht Kurzformen ergänzt, so wie M2 es verlangte | ✓ (N4) |
| H1 · Kommentare zählen nicht | `stripComments` (`check-type.mjs:74–78`) tut, was die Zeile sagt. Zeilen, die mit `*`, `/*` oder `//` beginnen, werden geleert. In CSS fällt `/* … */` weg, in TSX `/* … */` und `// …`. Die Selbstprüfung hat die Fälle „comment is no value“, „trailing comment is no value“ und „TSX comment is no value“. Nicht gemeldet werden in der Sonde `/* font: 500 13px … */`, ` * font: 13px …`, `.a { color: red; } /* font: 13px */`, `// font: "13px …"` und `{/* font: "13px …" */}`. Auch der zweite Fall von H1, `500 var(--fs-ui) / 18px …`, geht durch. Das gilt nur für `font:`. `/* font-size: 12px */`, ` * font-weight: 650` und `/* font-family: monospace */` meldet der Wächter weiter, wie H1 es für `font-size:` schon festhielt | ✓ (N1) |
| H4 · Aufklapper auf `--fs-ui` | `booking.css:257` setzt `font: 500 var(--fs-ui) var(--font-sans)`, die Zeile der Einordnung (Z. 46) lautet gleich. `.v2disc__sum` steht auf `font-size: var(--fs-ui); font-weight: 500` (`v3.css:2280–2283`). Probe in `v3-primitives-rahmen-appshell--in-use` bei 1440 px, in `.app__main` und außerhalb: `.ml-collapse__head` hat 13.5px/500, `.v2disc__sum` auch. Derselbe Text „Weitere Felder anzeigen“ ist in beiden 155,80 px breit (`getBoundingClientRect`) | ✓ |
| H6 · L-372 und der App-Stand | Die App wurde nur gelesen (`git log`, `git show`, `git grep` im Repo `ludwig/app`). `081964abe` (2026-10-27, „13-px-Inline-Größen auf Rollenklassen (0220)“) ändert `CloseFrame.tsx` (Ortszeile auf `lw-ui-hint`), `CloseStep.tsx`, `HandoverActions.tsx`, `AcceptBatchEntriesButton.tsx`, `Step5List.tsx` und `Step6List.tsx`. `f86d59d6b` (2026-10-27, „DS-Befund L-372“) setzt `YearSwitcher.tsx:83` auf `var(--fs-ui) var(--font-sans)`, `11` auf `--fs-ui-xs` und `12.5` auf `--fs-ui-sm`. Am App-HEAD steht an keiner der genannten Stellen mehr 13 px. Der Vermerk „in der App umgesetzt (`081964abe`, `f86d59d6b`)“ stimmt also für diese Stellen. **Nicht stimmig** ist ein Satz: Die Zeile sagt weiter im Präsens „In `apps/web/src` stehen insgesamt 190 Stellen `fontSize: 13`/`13px`“. Gezählt mit `git grep -P 'fontSize:\s*13(?![\d.])\|(?<![\d.])13px'` sind es 201 vor `081964abe`, 186 danach, 184 nach `f86d59d6b` und 183 am App-HEAD, zeilenweise 199, 184, 182 und 181. Keine dieser Zählungen ergibt 190. Dass 190 eine Zählung vom 2026-10-27 war, steht nur in der Nachbesserung, nicht in L-372. Neben „umgesetzt“ liest sich der Satz, als seien die 190 Stellen erledigt. Es stehen aber noch 183 | ✗ (offen) |
| H7 · Spalte „wo“ der Messung | Z. 121 lautet: „`Seiten/Deck`: 6 × `span.v2main` …; 3 Textknöpfe ohne eigene Größe, darunter „Zum Kontenplan →“ in `LedgerAccountView`“. Die Zahl 3 und ein Knopf stehen jetzt da. Nicht genannt sind „Zum Sachverhalt →“ (`SourceDocumentView/InUse`) und „Zur Klärung“ (`CaseDetailView/InUse`). Hinter „`Seiten/Deck`:“ liest sich die Zeile außerdem, als lägen die Knöpfe dort. Die 24 SVG-`title`, die 2 `span hidden` und `.pag .page` außerhalb `main` fehlen weiter, das behauptet die Nachbesserung aber auch nicht. H7 ließ die Liste der Abnahme an ihre Stelle treten, und die trägt alle Knoten | ✓ (mit Einschränkung) |
| *(fest)* Wächter über den Exit-Code | `pnpm typecheck` 0, `pnpm check:type` 0, `pnpm check:type --test` 0 (`np0231-*.log`) | ✓ |

**Neue Hinweise (aus dem Diff, keiner davon im Bestand)**

- **N1 · `stripComments` leert zu viel.** Eine Zeile, die mit `/*` beginnt, fällt
  ganz weg, auch wenn danach Code steht: `/* 0231 */ .pag .page { font: 500 12px … }`
  wird nicht gemeldet. Ebenso eine Zeile, die mit `*` beginnt, also der
  Universalselektor: `* { font: 500 13px … }` und `*, *::before { font: 12px … }`
  werden nicht gemeldet. In TSX schneidet ein `//` in einem String den Rest der
  Zeile ab: `href="https://…" style={{ font: "500 13px …" }}` wird nicht gemeldet.
  Die Fassung der ersten Abnahme fand alle drei Fälle. Ein falscher Treffer bleibt:
  eine Fortsetzungszeile eines Kommentars ohne führendes `*`
  (`   font: 500 13px …, see 0231 */`). Im Bestand wird nur `v3.css:4114`
  (`*::after {`, ohne `font:`) übersprungen. Ein Weg: nur `/* … */` und `//`
  außerhalb von Strings streichen und eine Zeile nur dann leeren, wenn sie ganz im
  Kommentar liegt.
- **N2 · `FONT_KEYWORD` ist unvollständig.** `ultra-condensed`, `extra-condensed`,
  `ultra-expanded`, `extra-expanded`, `oblique 10deg` und Schlüsselwörter in
  Großbuchstaben (`BOLD`) hält der Wächter für die Größe. Steht danach ein Token,
  ist das ein falscher Treffer. Ein Gewicht abseits der Hunderter (`550`) wird als
  Größe gemeldet.
- **N3 · Zwei Sätze beschreiben den Wächter anders, als er prüft.** Der Kopfkommentar
  `check-type.mjs:15–17` beschreibt noch die erste Fassung („no size in px, rem or
  pt“). Geprüft wird heute gegen `SIZE_OK`, also Token, `inherit`, `em` und `100%`.
  Die Einordnung (Z. 49–50, „nur als `var(--fs-…)` oder `inherit`“) ist enger als
  `SIZE_OK`. Für `font-size:` gilt das genauso, es ist also harmlos, stimmt aber
  nicht im Wortlaut. Gewicht und Familie prüft der Wächter in der Kurzform nicht:
  `font: 300 var(--fs-ui) monospace` geht durch, `font-weight: 300` und
  `font-family: monospace` werden gemeldet. Die Einordnung verlangt nur die Größe.
- **N4 · Kriterium 3 und H4.** Kriterium 3 (Z. 104) zählt 12,5 zu den Rollen, die
  sich nicht ändern. Seit H4 geht `.ml-collapse__head`, eine Regel mit eigener
  Größe 12,5, gewollt auf 13,5 (Verhalten Z. 66). In den Stories bleibt das
  Kriterium erfüllt, weil keine Story die Klasse rendert. In der App verschiebt
  sich der Aufklapper aber. Das Kriterium kann nur der Spec-Autor ergänzen, so wie
  Kriterium 2 („… außer den acht Kurzformen“).

Abgenommen von / am: fremde Nachprüfung 1 (M1, M2, H1, H4, H6, H7), 2026-10-27 · M1, M2, H1, H4 erfüllt, H7 mit Einschränkung · Offener Punkt: H6 (der Satz „190 Stellen“ in L-372 an den App-Stand anpassen oder datieren) · Hinweise N1–N4

## Nachbesserung 2 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| H6 | L-372 nennt die Zählung mit Stand: 201 Stellen vor `081964abe`, 183 am App-Stand vom 2026-10-27 abends. Die 190 ist gestrichen |
| H7 | Die Zeile „16/600 → 13,5/600“ trennt die Orte: 6 Zeilentitel in `Seiten/Deck`, 3 Textknöpfe in `LedgerAccountView/InUse` |
| N1 | Kommentare werden jetzt über den ganzen Text geblankt und nicht mehr zeilenweise geraten (`blankComments`). Die Zeilennummern bleiben erhalten, Strings werden überlesen und nicht geblankt. Damit zählt Code nach `/* … */`, eine Regel auf `*` zählt, und ein `//` in einer URL ist kein Kommentar. Das gilt für alle Regeln des Wächters, auch für `font-size:` (ein `/* font-size: 12px */` meldet nichts mehr). Selbstprüfung ergänzt |
| N2 | `FONT_KEYWORD` kennt `ultra-`/`extra-`/`semi-condensed|expanded` und `oblique 10deg`, und die Schreibung spielt keine Rolle (`BOLD`). Selbstprüfung ergänzt |
| N3 | Der Kopfkommentar des Wächters sagt, was er prüft: In der Kurzform die Größe wie bei `font-size:` und ein Zahlengewicht wie bei `font-weight:`; die Familie dort prüft er nicht |
| N4 | Das Kriterium „Unverändert“ nennt die acht Kurzformen als Ausnahme, darunter `.ml-collapse__head` 12,5 → 13,5. Der Spec-Autor hat nur den Wortlaut ergänzt, gemessen wird dasselbe |

## Nachprüfung 2 (2026-10-27)

Eng geprüft: Behebt Nachbesserung 2 die Punkte H6, H7 und N1–N4 aus Nachprüfung 1,
und bringt `scripts/check-type.mjs` neue Fehler? Stand: HEAD `d0e6afd` plus der
uncommittete Diff. Am CSS hat sich seit Nachprüfung 1 nichts geändert, gemessen
wurde deshalb nicht neu. Die App wurde nur gelesen. Sonden und Logs liegen als
`np2-0231-*` im Scratchpad der Sitzung, der Wächter von HEAD als
`head-check-type.mjs` (per `git show HEAD:scripts/check-type.mjs`).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| H6 · L-372 und der App-Stand | `befunde-app.md:187` sagt jetzt: „In `apps/web/src` standen vor `081964abe` 201 Stellen `fontSize: 13`/`13px`, am App-Stand vom 2026-10-27 abends 183“. Die Zahl 190 steht nicht mehr in der Zeile. Nachgezählt im Repo `ludwig/app` mit `git grep -o -P 'fontSize:\s*13(?![\d.])\|(?<![\d.])13px' <rev> -- apps/web/src`: `081964abe^` 201, App-HEAD `bf5d9f8c3` (2026-10-27 19:15) 183, Arbeitsbaum 183. Am App-HEAD steht `CloseFrame.tsx:133` auf `lw-ui-hint` und `YearSwitcher.tsx:83` auf `var(--fs-ui) var(--font-sans)`. Der Vermerk „umgesetzt“ und die Zählung passen jetzt zusammen | ✓ |
| H7 · Spalte „wo“ der Messung | Z. 121 lautet jetzt: „6 × `span.v2main` in `Seiten/Deck` (…); 3 Textknöpfe ohne eigene Größe in `LedgerAccountView/InUse`, darunter „Zum Kontenplan →““. Die Rohdaten der ersten Abnahme (`abn0231-analyse.json`, `changeList`, 16/600 in `main` bei 1440 px) zeigen die drei Knöpfe in drei Stories: „Zum Kontenplan →“ in `v3-entitäten-konto-ledgeraccountview--in-use` (`button.v2link`), „Zum Sachverhalt →“ in `v3-entitäten-beleg-sourcedocumentview--in-use` (`button.v2link`) und „Zur Klärung“ in `v3-entitäten-sachverhalt-casedetailview--in-use` (`a.v2link`). Die Zeile trennt Deck und Knöpfe jetzt richtig. Sie legt aber alle drei Knöpfe nach `LedgerAccountView/InUse`, und das stimmt nur für einen | ✗ (zwei Orte falsch) |
| N1 · Kommentare über den ganzen Text | `blankComments` (`check-type.mjs:85–108`) liest Strings als Ganzes, in TSX auch Vorlagen. Es blankt `/* … */` bis `*/` oder bis zum Dateiende, und in TSX `//` bis zum Zeilenende. Die Zeilen bleiben dabei erhalten. `pnpm check:type --test` Exit 0. Eine Sonde mit 89 Fällen (`np2-0231-guard-probe.mjs`) importiert `findings`. Die drei Fälle aus N1 werden jetzt gemeldet: `/* 0231 */ .pag .page { font: 500 12px … }`, `* { font: 500 13px … }` und `*, *::before { font: 12px … }`, dazu `href="https://…" style={{ font: "500 13px …" }}`. Nicht mehr gemeldet werden die Fortsetzungszeile ohne `*`, ein Kommentar im Wert und `font-size:`, `font-weight:` oder `font-family:` in einem Kommentar. Nach einem Kommentar über mehrere Zeilen stimmt die Zeilennummer. `"/*"` in einem CSS-String, `url(https://…)` in CSS und `'https://…'` in TSX gelten nicht als Kommentar. Ein unbeendeter Kommentar blankt bis zum Dateiende, wie im Browser. Die Rollenregeln lesen weiter den rohen Text (`findings` gibt `roleFindings` den Text vor dem Blanken). T-H1 nach einem Kommentar und nach einem Apostroph, T-SUB nach einem Regex mit `\/*` und T-REG nach einem unbeendeten Kommentar greifen weiter. Über den Bestand (395 Dateien) liefern der Wächter von HEAD und der neue je 0 Funde, die Zahl ändert sich nicht (`np2-0231-guard-inventory.mjs`). Das Blanken selbst hat aber eine neue Lücke: N5 | ✓ für die Fälle aus N1; ✗ wegen N5 |
| N2 · `FONT_KEYWORD` | Mit Token gehen durch: `ultra-`, `extra-` und `semi-condensed`/`-expanded`, `condensed`, `expanded`, `oblique 10deg`, `-14deg`, `10.5DEG`, `BOLD`, `Italic Small-Caps` und `NORMAL NORMAL 500 NORMAL`, in CSS wie in TSX. Weiter gemeldet werden `BOLD 13PX`, `ultra-condensed 13px` und `oblique 10deg 13px`. Ein Gewicht abseits der Skala (`550`, `1000`) wird ebenfalls gemeldet. Es bleibt eine Lücke: Ein Winkel in `turn`, `rad` oder `grad` nach `oblique` gilt als Größe (`oblique 0.1turn var(--fs-ui) …` wird gemeldet). Im Bestand kommt das nicht vor | ✓ |
| N3 · Kopfkommentar | `check-type.mjs:15–20` sagt: Größe wie bei `font-size:`, ein Zahlengewicht wie bei `font-weight:`, die Familie wird nicht geprüft, Kommentare werden geblankt. Der Code tut das: Ein Hunderter außerhalb von `WEIGHT_OK` ergibt `false` (Z. 75). Andere Zahlen wie `550` landen als Größe in `SIZE_OK` und fallen dort durch. Sonde: `300`, `550`, `1000` und `900` in TSX werden gemeldet, `700`, `bold`, `bolder` und `monospace` nicht. Dass `bold` in der Kurzform durchgeht, `font-weight: bold` aber gemeldet wird, deckt das Wort „Zahlengewicht“. Die Einordnung (Z. 49–50) ist unverändert enger als `SIZE_OK`. N3 nannte das harmlos, und Nachbesserung 2 behauptet dazu nichts | ✓ |
| N4 · Kriterium „Unverändert“ | Z. 104 endet jetzt mit „ausgenommen die acht Kurzformen der Tabelle, darunter `.ml-collapse__head` 12,5 → 13,5“. „Verhalten“ (Z. 64–67) sagt dasselbe. Von den acht Kurzformen hatte nur `.ml-collapse__head` eine Rollengröße aus der Liste (12,5). Fünf kommen von 13, `.pag .page` kommt von 12, `.chip` bleibt. Gemessen wird also dasselbe wie vorher, und die Zeile der Abnahme zu diesem Kriterium (Z. 156) gilt weiter | ✓ |
| *(fest)* Wächter über den Exit-Code | `pnpm check:type --test` 0 („self-test ok“), `pnpm check:type` 0 („0 older findings left in 0 files“), `pnpm typecheck` 0 (`np2-0231-*.log`) | ✓ |

**Neue Punkte (aus dem Diff)**

- **N5 · Mangel: `blankComments` kennt in TSX weder JSX-Text noch Regex-Literale.**
  Das ist ein Rückschritt gegenüber HEAD. Ein einzelnes ASCII-`"` oder `'` in
  JSX-Text öffnet für den Wächter einen String. Im Set ist das meist das
  schließende `"` nach „, etwa `„Ohne Rolle"`, `„erledigt"` oder
  `„Neu verarbeiten"`. Ebenso wirken Backticks in einem Regex-Literal
  (`Markdown.tsx:40`). Ab da gelten Strings als Code und Code als String, bis ein
  weiteres Zeichen das zurückdreht. Ein `/*` oder `//` in JSX-Text (der Pfad
  `src/styles/*.css`, `/clients/**`, eine URL) oder in einem Regex-Literal
  (`/\/\//`, `/a\/*b/`) gilt dann als Kommentar. Zum Vergleich diente ein Orakel aus
  dem TypeScript-Parser und dem postcss-Tokenizer, über alle 395 Dateien
  (`np2-0231-blank-oracle.mjs`). Die 5 CSS-Dateien stimmen, 13 TSX-Dateien
  weichen ab. In `Color.stories.tsx:330–384` und `Typography.stories.tsx:172–191`
  wird Code geblankt (75 Zeilen), und die Wertregeln lesen diese Zeilen nicht
  mehr. Gegenprobe im Speicher (`np2-0231-guard-inventory.mjs`): `fontSize: "13px"`
  in `Color.stories.tsx:333` und `fontSize: 13` in `Typography.stories.tsx:184`
  meldet der Wächter von HEAD, der neue nicht. In den übrigen 11 Dateien bleiben
  114 Kommentarzeilen stehen. Dort bleibt es beim Stand von HEAD, denn HEAD
  blankte gar nicht. Konstruiert fällt noch eine verschachtelte Vorlage mit `//`
  auf (`` `a ${`b // c`} d` ``): Sie blendet den Rest der Zeile aus. Heute steht in
  den blinden Zeilen kein Fund. Ein Weg: In TSX die Kommentarbereiche aus
  `typescript` nehmen (schon in den devDependencies). Dafür `createSourceFile` und
  `getLeadingCommentRanges`/`getTrailingCommentRanges` je Token nutzen, JSX-Text
  ausgenommen, so wie es das Orakel tut. Dazu ein `--test`-Fall mit `„…"` in
  JSX-Text vor einem `fontSize`.
- **N6 · Hinweis: „für alle Regeln“.** Nachbesserung 2 sagt zu N1: „Das gilt für
  alle Regeln des Wächters“. Die Rollenregeln lesen aber den rohen Text, ein `<h5>`
  in einem JSX-Kommentar zählt weiter als T-H2. Das ist der Stand von HEAD und
  kein Fehler im Code. Der Satz stimmt aber nur für die Wertregeln.

Abgenommen von / am: fremde Nachprüfung 2 (H6, H7, N1–N4), 2026-10-27 · H6, N2, N3, N4 erfüllt, N1 für seine Fälle · Offene Punkte: H7 (Orte der Textknöpfe in Z. 121), N5 (`blankComments` in TSX) · Hinweis N6

## Nachbesserung 3 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| N5 | Kommentare werden nur noch in CSS geblankt. In TSX liest der Wächter die Zeilen wieder so, wie sie stehen, wie vor 0231: Der Handscanner hat JSX-Text und Regex-Literale falsch gelesen und lebenden Code verdeckt. Der Preis ist der Hinweis H1 der Abnahme, nur für TSX: Ein `fontSize: 13` in einem Kommentar meldet sich dort wieder, wie in HEAD. Selbstprüfung ergänzt, mit „…" im JSX-Text vor einem `fontSize` und einem Regex mit Backtick vor einem `fontSize`. Mit der Inventur der Nachprüfung 2 (`np2-0231-guard-inventory.mjs`) gegengeprüft: 395 Dateien, HEAD 0 und neu 0 Funde. Die Gegenproben in `Color.stories.tsx:333` und `Typography.stories.tsx:184` meldet der neue Wächter wieder wie HEAD |
| N6 | Das Blanken gilt für die Wertregeln in CSS. Die Rollenregeln (T-H1, T-H2, T-SUB, T-REG) lesen den rohen Text wie bisher. Die Zeile N1 der Nachbesserung 2 ist damit eingeschränkt |
| H7 | Die Zeile „16/600 → 13,5/600“ nennt jeden Textknopf mit seiner Story |

## Nachprüfung 3 (2026-10-27)

Eng geprüft: Behebt Nachbesserung 3 die Punkte N5, N6 und H7 aus Nachprüfung 2,
und bringt `scripts/check-type.mjs` neue Fehler? Stand: HEAD `d0e6afd` plus der
uncommittete Diff. Am CSS hat sich seit Nachprüfung 1 nichts geändert, gemessen
wurde deshalb nicht neu. Sonden und Logs liegen als `np3-0231-*` im Scratchpad der
Sitzung. Zum Vergleich dienen der Wächter von HEAD (`head-check-type.mjs`) und der
Wächter von Nachprüfung 2, neu gebaut aus HEAD und `np2-0231-wt.patch`
(`np3-0231-np2-check-type.mjs`).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| N5 · TSX wieder roh, CSS weiter geblankt | Code: `findings` (`check-type.mjs:181–213`) blankt nur bei `.css` (Z. 186). TSX geht als `text.split("\n")` in die Wertregeln. `blankComments` (Z. 83–102) kennt nur noch `"`, `'` und `/* … */`. Das ist der CSS-Zweig von Nachprüfung 2, ohne Vorlagen und ohne `//`. `node scripts/check-type.mjs --test` endet mit Exit 0. Eigene Sonde (`np3-0231-guard-probe.mjs`), TSX, 21 Fälle: `fontSize` wird gemeldet nach „…" in JSX-Text (auch zweimal, auch mit URL danach), nach `src/styles/*.css` und `/clients/**` in JSX-Text, nach Regex-Literalen mit Backtick, `\/\/`, `\/*` und `'` und nach Vorlagen mit `//`, verschachtelt oder über Zeilen mit `/*`. Jeder Fall liefert dasselbe wie der Wächter von HEAD, nur die neue Kurzform-Regel kommt hinzu. Wie in HEAD zählt ein `fontSize` in `//`, `/* */` und `{/* */}` (H1, nur TSX). Die Rollenregeln liefern in vier Fällen dasselbe wie HEAD. Differenz über alle 390 TSX-Dateien: An jede der 91.973 Zeilen wurde ein `fontSize: 13` gehängt. HEAD und neu liefern dieselben Funde, und jede Zeile wird gemeldet. Mit `font: "500 13px x"` wird ebenfalls jede Zeile gemeldet. CSS, 22 Fälle: ein Kommentar über mehrere Zeilen (die Zeilennummer stimmt), eine Fortsetzung ohne `*` und Code nach `*/` in derselben Zeile. Dazu `* {…}`, `*{font:…}`, `*, *::before`, `.a > *`, `/**/`, `/***/` und `/*/`, `"/*"` und `"*/"` in Strings, `url(https://…)` und ein unbeendeter Kommentar. Alle Fälle verhalten sich wie erwartet. `blankComments` gleicht auf allen 5 CSS-Dateien dem postcss-Tokenizer. Danach bekam jede CSS-Zeile ein `font-size: 12px` angehängt. Gemeldet wird genau dort, wo postcss Code sieht: 5.688 Stellen in Code, 831 in Kommentaren. Inventur (`np2-0231-guard-inventory.mjs`, Log `np3-0231-guard-inventory.log`): 395 Dateien, HEAD 0 und neu 0 Funde. Die Gegenproben in `Color.stories.tsx:333` und `Typography.stories.tsx:184` melden beide Wächter, ebenso den Kommentar in `Step0Result.tsx:86` | ✓ (Hinweis N7) |
| N6 · „für alle Regeln“ | Zeile N6 der Nachbesserung 3: Das Blanken gilt für die Wertregeln in CSS, die Rollenregeln lesen den rohen Text. Der Code tut das. `roleFindings` bekommt den Text vor dem Blanken (Z. 182) und blankt nur Vorlagen (Z. 165). CSS hat keine Rollenregeln. Der Kopfkommentar (Z. 19–20) und der Kommentar in `findings` (Z. 183–185) sagen dasselbe. Sonde: `{/* <h5 className="x">T</h5> */}` zählt als T-H2, wie in HEAD. Die Aufzählung „(T-H1, T-SUB, T-REG)“ lässt T-H2 aus, ausgerechnet die Regel aus dem Beispiel von N6. Der Satz spricht aber von „den Rollenregeln“, und der Kopfkommentar zählt alle vier auf | ✓ |
| H7 · Orte der Textknöpfe | Z. 121 nennt 6 × `span.v2main` in `Seiten/Deck` und die Knöpfe einzeln: „Zum Kontenplan →“ in `LedgerAccountView/InUse`, „Zum Sachverhalt →“ in `SourceDocumentView/InUse`, „Zur Klärung“ in `CaseDetailView/InUse`. Die Rohdaten der ersten Abnahme (`abn0231-analyse.json`, `changeList`, 16/600 in `main` bei 1440 px) zeigen 9 Knoten. 6 davon sind `span.v2main.v2cl__clamp` in `seiten-deck--questions`. Dazu kommen „Zum Kontenplan →“ in `v3-entitäten-konto-ledgeraccountview--in-use`, „Zum Sachverhalt →“ in `v3-entitäten-beleg-sourcedocumentview--in-use` und „Zur Klärung“ in `v3-entitäten-sachverhalt-casedetailview--in-use`. Die Namen passen zu den Stories (`v3/Entitäten/Konto/LedgerAccountView`, `…/Beleg/SourceDocumentView`, `…/Sachverhalt/CaseDetailView` je mit `InUse`, dazu `Seiten/Deck` mit `Questions`). Zahl und Orte stimmen | ✓ |
| *(fest)* Wächter über den Exit-Code | `pnpm check:type --test` 0 („self-test ok“), `pnpm check:type` 0 („0 older findings left in 0 files“), `pnpm typecheck` 0 (`np3-0231-*.log`) | ✓ |

**Neue Punkte (aus dem Diff)**

- **N7 · Hinweis: Die zwei neuen Selbstprüfungen halten N5 nicht fest.** Die
  Fälle in `check-type.mjs:248–249` bestehen auch mit dem Wächter von
  Nachprüfung 2. Dort blendet ein `"` oder ein Backtick allein nichts aus. Erst
  ein `/*` oder `//` im falsch gelesenen Bereich verdeckt Code. Gegenprobe: Das
  Blanken von Nachprüfung 2 wurde in den heutigen Wächter zurückgesetzt
  (`np3-0231-regress-check-type.mjs`). `--test` endet damit trotzdem mit Exit 0.
  Unterscheiden würde etwa `<p>src/styles/*.css</p>` oder `/a\/*b/` vor einem
  `fontSize`. Der alte Wächter meldet dann nichts, der neue `fontSize: 13`. Der
  Code ist richtig, das zeigt die Differenz über alle Zeilen. Nur die
  Selbstprüfung sichert das nicht. Der Fall in Z. 247 („a // in a string is no
  comment (N1)“) prüft in TSX nichts mehr, seit dort nicht geblankt wird.
- **N8 · Hinweis: ein deutsches Wort im neuen Testfall.** Z. 248 nutzt `„Satz"`
  als Literal. CLAUDE.md §5 schließt Deutsch auch in Literal-Werten aus. Der Fall
  braucht das „…", das Wort braucht er nicht. Die Rollenfälle von HEAD
  (Z. 255–259, `Titel`, `Satz.`) folgen demselben Muster.

Abgenommen von / am: fremde Nachprüfung 3 (N5, N6, H7), 2026-10-27 · N5, N6, H7 erfüllt · keine offenen Punkte · Hinweise N7, N8

## Nachtrag des Autors nach Nachprüfung 3 (2026-10-27)

- **N7:** Die zwei Selbstprüfungen zu N5 halten den Fehler jetzt fest. Vor dem
  `fontSize` steht ein `/*` im JSX-Text bzw. im Regex. Gegenprobe mit dem
  Wächter von Nachprüfung 2 (`np3-0231-regress-check-type.mjs`): Dort schlägt
  `--test` fehl, mit dem neuen endet er mit Exit 0.
- **N8:** Die neuen Fälle tragen englische Literale. Die Rollenfälle aus HEAD
  bleiben, wie sie sind; sie prüfen deutsche Überschriften und gehören dem
  Bestand.
- **N6:** T-H2 steht in der Aufzählung.

