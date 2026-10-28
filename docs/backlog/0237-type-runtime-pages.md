# 0237 · Laufzeit-Wächter auch für Seiten-Stories ohne `AppShell`; vier Fundstellen

| | |
|---|---|
| Status | fertig |
| Stufe | Wächter (`scripts/check-type-runtime.mjs`), Showcase (`Todo.tsx`, `CaseTabs`, `DocumentOtherKinds`, `AccountPageStates`, `CasePageStates`, `DocumentPageStates`) |
| Klassen-Test | entfällt, kein Baustein |
| Quelle | Abnahme von 0235, Hinweis H5: 10 von 177 Seiten-Stories ohne `AppShell` zeigen Größen außerhalb der Skala. llcto 2026-10-27: „Die nächste Runde … bitte ja, aber mit niedriger Priorität nach 0236.“ |
| Ersetzt | nichts |
| Blockiert | nichts |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Der Wächter aus 0235 misst nur Stories mit Arbeitsfläche. Viele Seiten-Stories
zeigen aber nur einen Reiter oder einen Schritt einer Seite, ohne `AppShell`. In
zehn davon lagen Größen außerhalb der Skala. Künftig misst der Wächter sie auf
Wunsch mit, und die Fundstellen sind behoben.

## Einordnung

- **`--pages`:** Mit diesem Schalter misst der Wächter zusätzlich jede Story mit
  dem Titel `Seiten/…`, die kein `AppShell` hat. Er misst dort über
  `#storybook-root` und prüft R1 und R2. R3 (genau ein `h1`) prüft er dort
  nicht, weil viele dieser Stories nur einen Teil einer Seite zeigen. Ohne den
  Schalter bleibt der Lauf wie in 0235, bei rund 2 Minuten. Mit dem Schalter
  dauert er etwa 5 Minuten.
- **Mono folgt seinem Satz:** `code`, `kbd`, `samp` und `.lw-mono` stehen in
  `tokens.css` auf `0.92em`. Das ist der optische Ausgleich der Monospace-Schrift
  in der Rolle „Zahl, Mono: erbt“ und keine eigene Stufe. Der Wächter übergeht
  solchen Text.
- **Die Fundstellen:**
  - Die Platzhalter-Box `Todo` im Showcase (`AcceptanceFlow`, Stapelabnahme)
    setzte `--fs-caption` (13 px) und `--fs-overline` (12 px), Größen des lesenden
    Registers. Jetzt stehen dort `--fs-ui-sm` und `--fs-ui-xs`.
  - Die Reiter-Stories von `CaseTabs` setzten über ihren Leerzustand die Klasse
    `lw-overline` (12/600, lesendes Register). Jetzt steht dort
    `lw-ui-overline`.
  - In der Vorsteuer-Prüfung kommt 10,58/400 von `code` in „Technisch: …“
    (0,92 × 11,5). Das ist Mono nach Rolle und kein Fund mehr (siehe oben).
  - Beim ersten Lauf mit `--pages` fand der Wächter einen vierten Fund (R2), den
    H5 nicht zählte, weil er nur Größen außerhalb der Skala suchte:
    `Seiten/Beleg/Andere Belegarten` (`StatementWronglyAssigned`). Dort steht ein
    `p.v2muted` ohne Rolle unter einem Feld, das 16/400 erbte. Jetzt ist es
    `lw-ui-hint`, die Rolle „Hinweis“.

## Schnittstelle

`pnpm check:type:runtime` verhält sich wie bisher. `pnpm check:type:runtime --
--pages` nimmt die Seiten-Stories dazu. `--test` prüft auch: Ein Seitenteil ohne
`h1` ist kein Fund, eine Größe außerhalb der Skala dort schon.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Komponenten-Stories (`v3/…`) und Text in Drawern, Dialogen und Toasts | weitere Auswahl | ein Fund in der App, den keine Seiten-Story zeigt |

## Abnahmekriterien

- [ ] `--test` endet mit Exit 0, mit den neuen Fällen für Seitenteile
- [ ] `pnpm check:type:runtime -- --pages` gegen den Dev-Server endet mit Exit 0; die zehn Stories aus H5 von 0235 sind dabei und ohne Fund
- [ ] Ohne `--pages` ist der Lauf wie in 0235: dieselbe Zahl gemessener Stories, Exit 0
- [ ] Gegenprobe: ein 12-px-Text in einer Seiten-Story ohne `AppShell` ergibt mit `--pages` einen R1-Fund; ein `code` mit 0,92em ergibt keinen (Laufzeit-Probe)
- [ ] `Todo`, der Leerzustand in `CaseTabs` und der Hinweis in `Andere Belegarten` sehen bis auf die Größe aus wie vorher (Stapelabnahme `Bookings`, Sachverhalt-Reiter, `StatementWronglyAssigned`)
- [ ] `check:type`, `check:language`, `typecheck` grün

### Messung des Bauenden (keine Abnahme)

Erster Lauf `--pages` vor dem vierten Fix: 193 Stories gemessen (16 mit
Arbeitsfläche, 177 Seitenteile), ein Fund, R2 in
`seiten-beleg-andere-belegarten--statement-wrongly-assigned`. Die zehn Stories
aus H5 von 0235 sind ohne Fund.

## Abnahme

Gemessen gegen HEAD `da254bf` und den uncommitteten Diff an
`scripts/check-type-runtime.mjs`, `src/showcase/Todo.tsx`,
`src/showcase/case/CaseTabs.stories.tsx` und
`src/showcase/document/DocumentOtherKinds.stories.tsx`. Gemessen wurde am
Dev-Server 6107, der dafür weder gestoppt noch neu gebaut wurde. Messbrowser war
der Headless Shell 1247 über `CHROME_BIN` und `scripts/cdp.mjs`, bei 1440 px.
Die Proben laufen im Scratchpad der Sitzung und ändern keine Datei im Repo:

- `sel.mjs` zählt die Auswahl aus `index.json` nach, mit dem Filter des Wächters.
- `diag.mjs` liest alle 73 Stories der 13 Dateien mit `AppShell` und die 177
  Seitenteile in einem Browser aus. Dazu gehört jeder Text, den die Mono-Ausnahme
  übergeht, mit der Größe seines Satzes.
- `probe-guard.mjs` ist eine Kopie des Wächters, die nur die Stories aus
  `PROBE_IDS` misst und vor dem Lesen `PROBE_JS` in die Seite schreibt.
- `shots.mjs` misst und fotografiert die Fundstellen nachher und vorher. Für
  „vorher“ setzt es den alten Wert per DOM zurück.
- `gap-verify.mjs` liest 19 Stories mit 2,5 s Wartezeit nach (M1).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `--test` endet mit Exit 0, mit den neuen Fällen für Seitenteile | `node scripts/check-type-runtime.mjs --test` → „self-test ok.“, Exit 0, ohne Browser. Es gibt neun Fälle, zwei davon neu. `h1: null` ohne Text gibt keinen Fund, ein Seitenteil wird also nicht nach dem `h1` gefragt. `h1: null` mit 12/600 gibt R1, die Skala gilt dort also weiter. Die Mono-Ausnahme steht nicht in `judge`, sondern im Lesecode, und hat deshalb keinen Fall (M2) | ✓ |
| `pnpm check:type:runtime -- --pages` endet mit Exit 0; die zehn Stories aus H5 von 0235 sind dabei und ohne Fund | „ok. 193 stories …“, Exit 0, 412 s. `sel.mjs` zählt dieselbe Auswahl: 16 Stories mit Arbeitsfläche und 177 Seitenteile, keine doppelt. Unter den 177 stehen alle zehn aus H5: `seiten-stapelabnahme--bookings`, sechs `seiten-sachverhalt-reiter--*` und `seiten-beleg-reiter-vorsteuer--needs-facts`, `--allowed`, `--forbidden`. In `diag.mjs` ist jede davon ohne Fund. Zur Zahl in der Schlusszeile siehe H1, zur Laufzeit H2 | ✓ |
| Ohne `--pages` ist der Lauf wie in 0235: dieselbe Zahl gemessener Stories, Exit 0 | `node scripts/check-type-runtime.mjs` → „ok. 16 stories with a working surface, every text on the scale, one h1 each.“, Exit 0, 124 s (0235: 121 s und 120 s). Die Mono-Ausnahme ändert dort nichts. In den 16 Stories übergeht sie nur ein `kbd.v2kbd` mit 11,5 px, und das ist eine Stufe der Skala | ✓ |
| Gegenprobe: 12 px im Seitenteil ergibt R1; ein `code` mit 0,92em ergibt keinen Fund (Laufzeit-Probe) | `probe-guard.mjs --pages` an `seiten-sachverhalt-reiter--events`. Ohne Probe: Exit 0. Mit `span` 12 px in `#storybook-root`: Exit 1, „R1 12px/400 off the scale: span „Probe zwoelf““. Mit `p.lw-ui-text` und `code` darin (0,92 × 13,5 = 12,42 px): Exit 0. Dazu ein `h1` 16/600 im Seitenteil: Exit 0, R3 wird dort wie spezifiziert nicht gefragt. Ohne `--pages` misst dieselbe Kopie den Seitenteil nicht („0 stories“). In `.app__main` (`seiten-geschäftspartner-liste--in-use`, ohne Schalter) gibt 12 px R1, und ein `code` gibt keinen Fund | ✓ |
| `Todo`, der Leerzustand in `CaseTabs` und der Hinweis in `Andere Belegarten` sehen bis auf die Größe aus wie vorher | `shots.mjs`, Vergleich von 22 berechneten Eigenschaften und der Box. **Todo** (`seiten-stapelabnahme--bookings`): Nur die Größe ändert sich, 13 → 12,5 px, und damit die Zeilenhöhe 20,15 → 19,375 px (Faktor 1,55 geerbt). Die Box wird 108,6 → 105,5 px hoch. Rahmen, Grund, Farbe, `strong` 700 und Abstände bleiben. **Leerzustand** (alle sechs `seiten-sachverhalt-reiter--*`): 12 → 11,5 px, Gewicht 600 bleibt, aber die Farbe wechselt von `#5C5C5C` zu `#717171` (`muted` → `subtle`). Auf dem Grund der Seite `rgb(244, 246, 248)` sinkt der Kontrast damit von 6,17 auf 4,51:1. **Hinweis** (`seiten-beleg-andere-belegarten--statement-wrongly-assigned`): 16 → 12,5 px, `margin` 0 bleibt, die Farbe wechselt ebenso von `#5C5C5C` zu `#717171`, auf Weiß 6,69 → 4,88:1. Beide Farben gehören zur Rolle (§2a: Overline und Hinweis „subtle“) und sind richtig. Sie sind aber eine zweite Änderung neben der Größe, und die Spec nennt sie nicht. Bilder: `before-…png`, `after-…png` je Story (Scratchpad) | ✗ M3 |
| `check:type`, `check:language`, `typecheck` grün | `pnpm typecheck` Exit 0 · `pnpm check:type` → „ok. 0 older findings left in 0 files (baseline).“, Exit 0 · `pnpm check:language` → „ok. 0 German comment lines left in 0 files.“, Exit 0 | ✓ |
| Dazu: Auswahl `--pages` gegen die Einordnung („jede Story mit dem Titel `Seiten/…`, die kein `AppShell` hat“) | Gewählt wird nach Datei, nicht nach Story. 25 Stories mit `Seiten/` stehen in den 13 Dateien mit `AppShell`, nur 6 davon rendern `.app__main`. Die übrigen **19** misst weder der Lauf ohne Schalter (er übergeht sie, weil `.app__main` fehlt) noch `--pages` (er schließt die Datei aus). `gap-verify.mjs` bestätigt bei 2,5 s Wartezeit: kein `.app`, kein `.app__main`, keine Fehleranzeige. Fünf davon zeigen Funde, die der Wächter melden würde, siehe M1 | ✗ M1 |
| Dazu: Mono-Ausnahme gegen `tokens.css` und Rollentabelle | Die Begründung stimmt. `tokens.css:397` setzt `.lw-mono, code, kbd, samp { font-size: 0.92em }`, §2a nennt „Zahl, Mono · erbt“, und `check-type.mjs:45` liest `0.92em` genauso („keeps code in step with its sentence“). Heute übergeht die Ausnahme 159 Textknoten in 20 Stories: `code` 10,58 px in `span.v2pp__origin` 11,5 px (= 0,92 ×, drei Vorsteuer-Stories), `code.v2case__no` 11,5 px (14 Stories) und `kbd.v2kbd` 11,5 px (drei Stories). Die beiden letzten setzen eine eigene Stufe und erben nicht. Keiner der Knoten liegt außerhalb der Skala oder von 0,92 × Satz, die Ausnahme verdeckt **heute** also keinen Fund. Gebaut ist sie aber breiter als begründet. Die Proben mit `probe-guard.mjs --pages` enden alle mit Exit 0: ein `code` mit fest 12 px, ein `kbd.v2kbd` mit 13 px (die Taste aus `Kbd`/`KeyButton`), ein `code` allein in einem 13-px-`span` (der Satz hat keinen eigenen Text, also bleibt auch seine Größe ungesehen) und ein `.lw-mono`-Container mit gewöhnlichem 13-px-Text | ✗ M2 |
| Dazu: Code englisch | Kommentare und Bezeichner sind englisch. Die Rollennamen „Zahl, Mono“ und „Hinweis“ stehen als Zitat in „…“, wie die UI-Wörter sonst im Set | ✓ |

Abgenommen von / am: fremde Abnahme, 2026-10-27 · Offene Punkte: M1, M2, M3; H1–H4 nicht blockierend

### Mängel

- **M1 · `--pages` lässt 19 Seiten-Stories ohne `AppShell` aus, und fünf davon
  haben Funde.** Die Einordnung verspricht „jede Story mit dem Titel `Seiten/…`,
  die kein `AppShell` hat“. Der Code nimmt aber nur Stories aus Dateien, in denen
  `AppShell` nicht vorkommt. Eine Story ohne Arbeitsfläche in einer Datei mit
  `AppShell` fällt so aus beiden Listen. Mit R1/R2 über `#storybook-root`
  ergeben sich diese Funde:
  - `seiten-konto-seite--loading-error-not-found` und `--search-and-filter`:
    R1 12/600, `lw-overline` aus `Labelled` (`AccountPageStates.stories.tsx:46`)
  - `seiten-konto-seite--all-tabs`: R1 12/600, `lw-overline` „Leerzustand“
    (Z. 141, 148). Das ist derselbe Fund, den 0237 in `CaseTabs` behebt.
  - `seiten-sachverhalt-seite--loading-error-not-found`: R2 16/400, `div.v2muted`
    „lädt“, „Fehler“, „nicht gefunden“ (`CasePageStates.stories.tsx:71, 83, 91`)
  - `seiten-beleg-seite--loading-error-not-found`: dasselbe
    (`DocumentPageStates.stories.tsx:115, 126, 134`)

  Die übrigen 14 Stories sind ohne Fund. Nächster Schritt: je Story wählen, nicht
  je Datei. Eine Story aus einer Datei mit `AppShell`, die kein `.app__main`
  rendert und `Seiten/…` heißt, misst `--pages` als Seitenteil. Danach die fünf
  Stories beheben. Gleiches sieht gleich aus: Das Zustandswort über einem Beispiel
  ist in allen drei Dateien dieselbe Rolle, so wie „Leerzustand“ in `CaseTabs`
  jetzt `lw-ui-overline` ist. Die Messung des Bauenden und H5 von 0235 zählten
  177, weil sie denselben Dateifilter nutzten.
- **M2 · Die Mono-Ausnahme beurteilt Mono nicht, sie überspringt es.** Der Kopf
  des Skripts sagt „Mono text … is judged by its sentence“, und die Spec sagt
  „Mono folgt seinem Satz“. Der Code (`el.closest(".v2vh, svg, code, kbd, samp,
  .lw-mono")`) übergeht aber jeden Text darin, gleich welche Größe er hat, auch
  Nicht-Mono-Text unter einem `.lw-mono`-Container. Heute verdeckt das nichts
  (gemessen, siehe oben). Eine feste Größe an `code`, an der Taste `.v2kbd` oder an
  einem Satz, der nur aus `code` besteht, käme aber durch. Genau solche
  Handgrößen soll der Wächter seit 0235 fangen. Nächster Schritt: Mono beurteilen
  statt überspringen. Erlaubt ist eine Stufe der Skala, oder 0,92 × die Größe des
  nächsten Vorfahren ohne Mono, wenn dieser auf der Skala liegt. Die Regel gehört
  in `judge`, damit `--test` je einen Fall bekommt, der sie hält, und einen, der
  sie verletzt. Mit dieser Regel bestehen alle 159 Knoten von heute.
- **M3 · Kriterium 5 hält nicht wörtlich: Mit der Rolle ändert sich auch die
  Farbe.** Overline und Hinweis wechseln von `--color-text-muted` (`#5C5C5C`) zu
  `--color-text-subtle` (`#717171`). Der Kontrast sinkt von 6,17 auf 4,51:1 auf dem
  Grund der Seite und von 6,69 auf 4,88:1 auf Weiß. Beides liegt über AA und
  entspricht §2a, steht aber nicht in der Spec. Die Einordnung nennt nur die neue
  Klasse, und das Kriterium sagt „bis auf die Größe“. Eine Farbänderung in einem
  Screen soll nicht still geschehen (CLAUDE.md §3). Nächster Schritt: In der Einordnung je Fundstelle
  einen Satz ergänzen, dass Farbe und Kontrast der Rolle folgen (Werte oben). Der
  Code bleibt.

### Hinweise

- **H1 · Die Schlusszeile von `--pages` sagt zu viel.** „ok. 193 stories with a
  working surface, every text on the scale, one h1 each.“ 177 davon haben keine
  Arbeitsfläche, und ihr `h1` wird nicht geprüft. Vorschlag: „16 stories with a
  working surface, 177 page parts …“.
- **H2 · Laufzeit.** `--pages` brauchte 412 s, also knapp 7 min. Spec und Kopf des
  Skripts nennen „etwa 5 Minuten“. Mit M1 kämen 19 Stories dazu, etwa 30 s.
- **H3 · Das Feld in `StatementWronglyAssigned` hat kein Feldlabel.** §2a
  verlangt das Feldlabel „über jedem Feld (0089)“, und die Rollentabelle nennt
  für den Hinweis unter einem Feld zuerst `Field hint`. Mit `Field` (Label und
  `hint`) trüge der Baustein beides selbst. Das war vor 0237 schon so und gehört
  nicht zu dieser Spec. Ein neues Label geht an den Owner.
- **H4 · „Leerzustand“ steht als Overline allein.** In `CaseTabs` (und in
  `AccountPageStates`) steht die Overline ohne Titel darunter, als
  Abschnittswort der Story. §2a: „nie allein als Titel“. Das gehört zum Gerüst der
  Story und nicht zur Seite. Wer M1 behebt, entscheidet es für alle drei Dateien
  gleich.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | `--pages` entscheidet je Story statt je Datei: Jede Story mit Titel `Seiten/…` wird gemessen, mit allen drei Regeln, wenn sie `.app__main` hat, sonst als Seitenteil mit R1 und R2. Damit sind die 19 Seiten-Stories ohne `AppShell` in `AppShell`-Dateien dabei. Ihre fünf Funde sind behoben: Story-Beschriftungen („lädt“, „Fehler“, „nicht gefunden“, „Leerzustand“) in `AccountPageStates`, `CasePageStates` und `DocumentPageStates` waren `lw-overline` (12/600, lesendes Register) bzw. ein `div.v2muted` ohne Rolle (16/400). Sie tragen jetzt die Rolle „Gruppenkopf“ (`lw-ui-group`, 12,5/700) |
| H4 | Dieselbe Rolle hat jetzt auch „Leerzustand“ in `CaseTabs`. Eine Overline steht nie allein (0220), und die Beschriftung benennt eine Gruppe in der Story. So ist es in allen vier Dateien gleich |
| M2 | Mono-Text wird beurteilt, nicht übersprungen: Eine Größe in `code`, `kbd`, `samp` oder `.lw-mono` ist erlaubt, wenn sie selbst eine Stufe ist oder 0,92 × die Größe des umgebenden Satzes, und der liegt auf der Skala. Selbstprüfung ergänzt: 12,42 in 13,5 ist erlaubt, 12,5 ist erlaubt, ein festes 12 px wird gemeldet, ebenso 11,96 in einem 13-px-Satz |
| M3 | Der Farbwechsel ist gewollt und gehört zur Rolle: Overline und Hinweis gingen von `--color-text-muted` (#5C5C5C) auf `--color-text-subtle` (#717171), 4,88:1 auf Weiß und 4,51:1 auf `bg-soft`, beides AA. Seit H4 tragen die Beschriftungen `lw-ui-group` (`--color-text-muted`, 6,69:1). Der Hinweis in `StatementWronglyAssigned` ist `lw-ui-hint` (`--color-text-subtle`, 4,88:1). Das Kriterium „bis auf die Größe“ meint also: bis auf Größe und die Farbe der Rolle |
| H1 | Die Schlusszeile trennt bei `--pages` die Stories mit Arbeitsfläche von den Seitenteilen und nennt die Regeln je Art |
| H2 | Die Laufzeit im Kopf des Skripts heißt „etwa 7 Minuten“ |
| H3 | bleibt als Hinweis: Das Feld in `StatementWronglyAssigned` ohne Label war schon vor 0237 so |

## Nachprüfung 1 (2026-10-27)

Geprüft wurde der Arbeitsbaum nach der Nachbesserung 1 gegen HEAD `da254bf`, am
Dev-Server 6107 (weder gestoppt noch gebaut), mit dem Headless Shell 1247 über
`CHROME_BIN` und `scripts/cdp.mjs` bei 1440 px. Die Proben laufen im Scratchpad
der Sitzung und ändern keine Datei im Repo. `probe-guard.mjs` ist neu aus dem
heutigen Wächter gebaut, `shots2.mjs` misst die Story-Beschriftungen, und
`mut-*.mjs` sind drei Kopien des Wächters mit absichtlich falscher Mono-Regel.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 · Auswahl je Story | `node scripts/check-type-runtime.mjs --pages` → „ok. 212 stories: 16 with a working surface (every text on the scale, one h1 each), 196 page parts (every text on the scale).“, Exit 0. Die Zählung geht auf: 193 + 19 = 212, und 177 + 19 = 196 Seitenteile. Proben an `seiten-konto-seite--all-tabs`, einer der 19 vorher ungemessenen Stories: Ohne Probe gibt es Exit 0, und sie zählt als Seitenteil. Mit einem 12-px-`span` gibt es Exit 1, „R1 12px/400 off the scale“. Ohne `--pages` wird sie nicht gemessen („0 stories“). Eine Story mit `.app__main` behält unter `--pages` R3, denn ein zweites `h1` in `seiten-geschäftspartner-liste--in-use` gibt „R3 2 h1 instead of one“ | ✓ |
| M1 · die fünf Funde | Im vollen Lauf ist keine Story mehr mit Fund. `shots2.mjs` misst jede Beschriftung: `seiten-konto-seite--all-tabs` (2), `--loading-error-not-found` (3), `--search-and-filter` (3), `seiten-sachverhalt-seite--loading-error-not-found` (3) und `seiten-beleg-seite--loading-error-not-found` (3). Alle stehen auf 12,5/700, vorher 12/600 bzw. 16/400 | ✓ |
| M2 · vier Mono-Proben | `probe-guard.mjs --pages` an `seiten-sachverhalt-reiter--events`. Jede Probe gibt Exit 1 und R1. Ein `code` mit fest 12 px gibt „R1 12px/400 … code“. `kbd.v2kbd` mit 13 px gibt „R1 13px/500 … kbd.v2kbd“. Ein `code` allein in einem 13-px-`span` gibt „R1 11.96px/400 … code“. Ein `.lw-mono`-Container mit 13-px-Text gibt „R1 13px/400 … span“. Diese Proben gehen durch: `code` in `p.lw-ui-text` (12,42 = 0,92 × 13,5) gibt Exit 0, ebenso `span.lw-mono` darin und ein `code` in `.app__main`. `kbd.v2kbd` in seiner Größe (11,5) im Knopf bleibt ohne Fund. Der Probeknopf selbst erbte im Seitenteil 16/500 und meldet R2, das gehört zur Probe. Die drei Vorsteuer-Stories (10,58 in 11,5) bestehen im vollen Lauf | ✓ |
| M2 · `--test` | `node scripts/check-type-runtime.mjs --test` → „self-test ok.“, Exit 0, mit 13 Fällen. Neu für Mono: 12,42 in 13,5 hält, 12,5 hält, ein festes 12 meldet R1, 11,96 in 13 meldet R1. Die Fälle greifen wirklich. Drei Mutationen der Regel scheitern je an ihrem Fall: Ohne Mono-Regel scheitert „mono at 0.92 ×“. Wird Mono übersprungen, scheitert „fixed 12 px“. Ohne die Prüfung des Satzes scheitert „sentence off the scale“. Die Regel steht jetzt in `judge` | ✓ |
| M3 · Farbe in der Spec | Die Nachbesserung nennt den Wechsel von `muted` zu `subtle` mit den Kontrasten. Am Bild gemessen hat der Hinweis in `StatementWronglyAssigned` weiter `#717171` auf Weiß, 4,88:1. Die Story-Beschriftungen haben jetzt dieselbe Farbe wie auf HEAD, `#5C5C5C`. Damit bleibt der Farbwechsel nur beim Hinweis | ✓ |
| H4 · `lw-ui-group` in vier Dateien | Bild und Kontrast stimmen. Gemessen sind 16 Beschriftungen in 7 Stories, davon `CaseTabs` stellvertretend mit `--events` und `--technical`. Alle haben 12,5 px, 700, `#5C5C5C` und Inter, und `.lw-ui-group` sieht vor: ui-sm · 700 · muted. Sie stehen auf dem Grund der Seite `rgb(244, 246, 248)` (`bg-soft`), dort mit 6,17:1, nicht mit den 6,69:1 der Nachbesserung, die für Weiß gelten. Die Beschriftung wird 2 px höher als vorher, mit 16/400 ist sie 6 px niedriger. Bilder: `np1-before-…png` und `np1-after-…png` je Story (Scratchpad). Zum Element siehe N2 | ✓ |
| H1 · Schlusszeile | Mit `--pages` lautet sie „212 stories: 16 with a working surface (… one h1 each), 196 page parts (every text on the scale)“. Ohne Schalter lautet sie wie in 0235 | ✓ |
| H2 · Laufzeit | Der Kopf des Skripts nennt „about 7 min“. Gemessen: 430 s mit `--pages` und 121 s ohne, ebenfalls Exit 0 mit 16 Stories wie in 0235. Ein erster Versuch mit `--pages` endete nach 133 s mit Exit 13, siehe N4 | ✓ |
| `typecheck` · `check:type` · `check:language` | Exit 0 · „ok. 0 older findings left in 0 files (baseline).“, Exit 0 · „ok. 0 German comment lines left in 0 files.“, Exit 0 | ✓ |

Abgenommen von / am: fremde Abnahme, 2026-10-27 (Nachprüfung 1; die Läufe endeten
am 2026-10-28) · Offene Punkte: keine blockierenden. H3 und N1–N4 sind Hinweise

### Hinweise der Nachprüfung

- **N1 · Die Einordnung ist an vier Stellen überholt.** Sie sagt noch:
  - „jede Story …, die kein `AppShell` hat“
  - „Der Wächter übergeht solchen Text“
  - „etwa 5 Minuten“
  - für `CaseTabs` „Jetzt steht dort `lw-ui-overline`“

  Was gilt, steht in der Nachbesserung 1. Wer die Spec später liest, liest die
  Einordnung zuerst. 0235 hat es ebenso gehalten, deshalb blockiert es nicht.
- **N2 · Die Story-Beschriftungen tragen die Gestalt des Gruppenkopfs auf einem
  `div`.** §2a nennt für den Gruppenkopf `h3`/`h4`. Das Vorbild im Set,
  `MasterDetail.stories.tsx`, beschriftet seine Story-Abschnitte mit
  `h3.lw-ui-group`. Für Seitenteile ist das `div` vertretbar: Ein `h3` vor der
  Seite, in `LoadingErrorNotFound` ganz ohne `h1`/`h2`, verbiegt die Gliederung
  der Seite. Das ist eine Abweichung von §2a und gehört als ein Satz in die Spec
  oder die Guideline. „Leerzustand“ beschriftet außerdem nur eine der zwei Gruppen.
- **N3 · Restlücke der Mono-Regel.** Ein `p` ohne Rolle, das nur `code` enthält,
  erbt im Seitenteil 16/400. Der `code` steht dann auf 14,72 = 0,92 × 16, und der
  Satz 16 liegt auf der Skala. Die Probe endet mit Exit 0, obwohl 16/400 keine
  Rolle ist (R2). Das kommt heute nicht vor und ist eng. Vorschlag: R2 auch auf
  den Satz eines Mono-Texts anwenden.
- **N4 · Ein abgerissener Messbrowser gibt Exit 13 ohne Satz.** Der erste
  Versuch mit `--pages` endete nach 133 s mit Node-Warnung „unsettled top-level
  await“ und Exit 13. Danach lief kein Messbrowser mehr, und Storybook antwortete.
  Die Wiederholung lief ohne Fehler durch. Die Ursache liegt nicht im Diff. Wie
  in 0235 H4 wäre Exit 2 mit einem Satz klarer als Exit 13. Das betrifft
  `cdp.mjs` mehr als den Wächter.

## Nachtrag des Autors nach Nachprüfung 1 (2026-10-27)

- **N1:** Die Einordnung oben beschreibt den ersten Stand. Was gilt, steht in
  der Nachbesserung 1: Auswahl je Story, Mono wird beurteilt statt
  übergangen, Laufzeit etwa 7 Minuten, „Leerzustand“ in `CaseTabs` als
  `lw-ui-group`.
- **M3, Zahl berichtigt:** Die Beschriftungen mit `lw-ui-group` stehen auf
  `bg-soft` bei 6,17:1; 6,69:1 gilt auf Weiß.
- **N2:** Die Story-Beschriftungen tragen die Gestalt des Gruppenkopfs auf
  einem `div`, nicht auf einem `h3`. Sie benennen Abschnitte einer Story,
  keine Gruppen einer Seite, und sollen die Gliederung der gezeigten Seite
  nicht verändern. Das ist eine bewusste Abweichung für Story-Rahmen.
- **N3, N4:** gehen als Ausbau in den Wächter: ein `p` ohne Rolle, das nur
  `code` enthält, und ein abgerissener Messbrowser, der mit Exit 2 statt 13
  enden soll.

