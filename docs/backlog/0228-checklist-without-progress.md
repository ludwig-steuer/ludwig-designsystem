# 0228 · Checklist: Spalte „Fortschritt“ weglassen, Kopf der Sprung-Spalte

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` (`Review.tsx`, Familie Prüfen) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, sobald es dort eine Prüfliste vor einer Freigabe gibt |
| Quelle | Anfrage ll-abnahme 2026-10-27, für llctos UX-Review der Übergeben-Seite (Owner 27.10.) |
| Ersetzt | nichts, die Übergeben-Seite der App nutzt heute `Checklist` mit einer Spalte „Fortschritt“, die auf jeder Zeile leer ist |
| Blockiert | den nächsten Zeigerhub der App (ll-abnahme) |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Vor der Übergabe prüft die Sachbearbeiterin, ob noch etwas offen ist, und springt
zur Stelle, an der es offen ist. Auf dieser Seite hat keine Prüfung einen Anteil:
Die Spalte „Fortschritt“ steht auf jeder Zeile leer und nimmt der Spalte
„Prüfung“ 110 px (100 px Spur und 10 px Fuge). Der Kopf „Sprung“ ist ein Wort aus der Expertensicht; wer
Ludwig vier Wochen nicht gesehen hat, liest „Weiter zu“ schneller als Weg.

## Einordnung

- **Wiederverwenden:** `Checklist` (`@when` Checklist of a gate) trägt den Fall,
  bis auf die leere Spalte und den Kopf.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2, der Fall ist zu vier Fünfteln
  gedeckt. Die Regel erlaubt eine Prop und verlangt eine Entscheidung, die
  wiederkommt; beides trifft hier nicht ganz zu. Es sind zwei Props, und ihre
  neuen Werte haben heute eine Verwendung, die Übergeben-Seite (`CloseHandover`
  in der App, die einzige Aufrufstelle von `Checklist`). Der andere Weg der
  Regel, an der Aufrufstelle komponieren, ist zu: Spuren, Kopf und Ladefläche
  liegen innen in `Checklist`, und die App müsste die Liste nachbauen, eine
  zweite Quelle. **Ausnahme von §3 Regel 2:** zwei Props für eine Verwendung,
  Owner-Auftrag aus llctos UX-Review der Übergeben-Seite, 2026-10-27 (Anfrage
  ll-abnahme). Die zwei Props sind getrennt, weil sie getrennt gelten: Eine
  Expertensicht ohne Anteile lässt die Spalte weg und behält „Sprung“.
- **Zuschnitt:** zwei Props an `Checklist`, keine neue Komponente.
- **`without` statt Automatik:** Die App hätte die Spalte auch weglassen können,
  sobald keine Zeile `progress` trägt. Das ginge an zwei Stellen schief:
  `NotCounted` (noch nicht gerechnet, `progress: null` auf jeder Zeile) behält
  die Spalte, weil sie verspricht, was kommt (0109), und im Ladezustand hätte
  die Tabelle fünf Spalten, beim Laden der Zeilen dann vier: Das Layout
  springt. Deshalb nennt der Aufrufer die Spalte, wie bei
  `JournalEntryReviewList` (`without`).
- **Setzt auf:** `Table`, `HeadRow`, `TableLoading`, `Progress`, wie bisher.

## Schnittstelle

Neu an `Checklist`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `without` | `readonly "progress"[]` | nein, Vorgabe `[]` | Spalten, die in diesem Rahmen nichts sagen; `progress` lässt Kopf, Zelle und Ladefläche der Spalte „Fortschritt“ weg, die Spalte „Prüfung“ bekommt den Platz | `WithoutProgress`, `WithoutProgressLoading` |
| `jumpHeader` | `string` | nein, Vorgabe `"Sprung"` | Kopf der letzten Spalte | `WithoutProgress` |

Alles andere bleibt unverändert, die Expertensichten ohne die zwei Props
sehen aus wie vorher. Was die Komponente **nicht** kann (bewusst): eine andere
Spalte weglassen. „Stand“ und „Sprung“ tragen die Antwort der Liste, das Icon
den Zustand; `without` nimmt deshalb nur `"progress"`, und eine weitere Spalte
kommt erst mit ihrem Fall.

## Verhalten

- Server-tauglich wie bisher; keine neue Interaktion, kein neuer Tastaturweg.
- Ohne „Fortschritt“ hat jede Zeile vier Zellen; der Ladezustand hat auch vier
  Spalten, mit derselben Breite wie die geladene Liste.
- Spaltenbreiten: `20px minmax(0, 1fr) 96px 150px`; „Prüfung“ wächst um die
  100 px der weggelassenen Spur und ihre 10 px Fuge (`.v2tbl__row { gap: 10px }`),
  zusammen 110 px.

## Stories

Zwei Stories in `v3/Patterns/Prüfen/Checklist`, abgeleitet nach §6: ein
Layout-Schalter (`without`) plus sein Ladezustand, weil der Schalter dort eine
eigene Spaltenzahl hat. `jumpHeader` ist Text, kein Zustand, und steht in
derselben Story wie auf der Seite.

| Story | Beweist |
|---|---|
| `WithoutProgress` | vier Spalten, Kopf „Weiter zu“, Zeilen ohne Anteil wie auf der Übergeben-Seite |
| `WithoutProgressLoading` | Ladezustand mit vier Spalten, dieselben Breiten wie geladen |

Leer, leer nach Filter und Fehler sind wie bisher ausgeschlossen. Die Liste der
Prüfungen ist fest, eine leere Prüfliste gibt es nicht, und `AllPassed` ist der
erledigte Fall; einen Filter hat die Liste nicht; ein Fehler steht in der
Prüfung selbst (`state: "error"`).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| eine weitere weglassbare Spalte | `without` um den Namen erweitern | eine Seite zeigt eine Spalte, die auf jeder Zeile leer ist |

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

- [ ] `without={["progress"]}`: Kopf, jede Zeile und der Ladezustand haben vier Spalten, die Spalte „Prüfung“ ist 110 px breiter als ohne die Prop (100 px Spur, 10 px Fuge) (Stories `WithoutProgress`, `WithoutProgressLoading` gegen `NotCounted`, `Loading`)
- [ ] Kopf und Ladefläche: dieselben Spaltenbreiten geladen und im Ladezustand, bei 1280 und 1440 px (`WithoutProgress` gegen `WithoutProgressLoading`)
- [ ] `jumpHeader`: der Kopf der letzten Spalte zeigt den Text; ohne die Prop steht „Sprung“ (`WithoutProgress` gegen `Filled`)
- [ ] Ohne die zwei Props unverändert: `Filled`, `AllPassed`, `NotCounted`, `Loading`, `LoadingEmpty` mit fünf Spalten in den Breiten 20 · 1fr · 96 · 100 · 150
- [ ] Die Spec-Tabelle stimmt mit der Signatur in `Review.tsx` überein, Zeichen für Zeichen

## Abnahme

Schlanke Abnahme (Schnittstelle) gegen HEAD `1702c7e` plus den uncommitteten Diff an
`patterns/Review.tsx` und `patterns/Review.stories.tsx`, dazu die Spaltenmessung der
variablen Kriterien. Gemessen mit `scripts/cdp.mjs` (ein Messbrowser) gegen Storybook
6107, per `getBoundingClientRect` jeder Kopf- und Zeilenzelle, bei 1100, 1280, 1440 und
1920 px. Story-IDs mit dem Präfix `v3-patterns-prüfen-checklist--`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` ist `storybook build` (`package.json`), deshalb in den Scratchpad gebaut (`node_modules/.bin/storybook build -o …/sb-check`): „Storybook build completed successfully“, Exit 0. Das `index.json` des Builds führt beide neuen Stories | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `patterns/Review.tsx` trägt die Familie Prüfen (`StateIcon`, `Checklist`, `CheckItems`, `Messages`), `Review.stories.tsx` liegt daneben. Titel `v3/Patterns/Prüfen/Checklist` (stories:8), Gruppe „Prüfen“ im Barrel (`index.ts:271`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 („0 German comment lines“), `pnpm check:when` Exit 0, beide `--test` Exit 0. Neues JSDoc englisch (Review.tsx:136–143). Die Story-Beschreibungen sind deutsch nach Hausentscheid 0098 M10. Kein neuer Export, `Checklist` trägt `@when`/`@instead` (Review.tsx:116–117) | ✓ (H1) |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Der Diff enthält kein Hex. Er bringt auch keinen neuen px-Wert: `cols` (Review.tsx:147) ist der alte Wortlaut `20px minmax(0, 1fr) 96px 100px 150px`, nur steht die Spur `100px` jetzt unter Bedingung. Spurbreiten sind die `cols`-Schnittstelle von `Table`, wie bei jedem Aufrufer. Eine Label-Map gibt es nicht, der Kopf „Sprung“ kommt jetzt als Prop mit Vorgabe. Der Zustand läuft weiter über `StateIcon` (unverändert) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Dev-Server und Build führen `without-progress` und `without-progress-loading`. Deckung: `without` in beiden, `jumpHeader` in `without-progress`, die Vorgabe „Sprung“ in `filled`. Ableitung nach §6: +1 Layout-Schalter, +1 sein Ladezustand, begründet mit der eigenen Spaltenzahl (Z. 63–66). `Checklist` hat damit 7 Stories (≤ 10). Leer, leer nach Filter und Fehler sind begründet ausgeschlossen (Z. 73–76) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | **Stufe und Importe** ✓: keine neuen Importe. **Hex, px, Label-Map** ✓: siehe oben. **Text links, Zahlen rechts** ✓: „Stand“ bleibt `v2num`. **Zeilenhöhe** ✓: dieselbe `.v2tbl__row`. **Farbe, Wort zur Farbe** ✓: unverändert, `StateIcon` mit Namen. **Fünf Zustände** ✓: begründet. **Kontrast, Fokus, Hover, Trefferfläche, Tastatur**: keine neue Gestaltung und keine neue Interaktion; nach der schlanken Abnahme auf 0119 vertagt. **Schrift** ✓: `pnpm check:type` Exit 0, „Weiter zu“ steht im selben `th` wie vorher „Sprung“. **Karte** ✓: `v2card`. **min-width** ✓: `minmax(0, 1fr)`, kein Querlauf bei 1100–1920. **Texte T1–T5** ✓: „Weiter zu“ ist die Wendung aus CLAUDE.md („Weiter zu Bank · 3 offen“). v1-Gegenstück und §11 gelten der App und sind übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 16 Stories der Datei im Messbrowser: jede rendert Inhalt in `#storybook-root`. In der Konsole steht keine `warning`, kein `error` und keine Ausnahme. Es erscheinen nur `[vite] connecting…`/`connected.` (debug) und der React-DevTools-Hinweis (info), in allen 16 Stories gleich. Das kommt vom Dev-Server, nicht von den Stories. Kein Label gekürzt (`scrollWidth` = `clientWidth` an `.v2chk__label`, `.v2chk__jumptext`) | ✓ |
| `without={["progress"]}`: vier Spalten in Kopf, Zeilen und Ladezustand; „Prüfung“ 100 px breiter (`WithoutProgress`, `WithoutProgressLoading` gegen `NotCounted`, `Loading`) | Bei allen vier Breiten hat der Kopf in `without-progress` und `without-progress-loading` 4 Zellen. Die 6 Zeilen bzw. 6 Ladezeilen haben ebenfalls je 4 Zellen (24 Flächen gegen 30 in `loading`). „Prüfung“ in `not-counted` → `without-progress`: 624 → 734, 804 → 914, 964 → 1074, 1444 → 1554; `loading` → `without-progress-loading` genauso. Das sind **+110 px, nicht 100**: Mit der Spalte fällt auch ihre Fuge weg (`.v2tbl__row { gap: 10px }`, v3.css:134). Der Code tut, was der Spurstring der Spec sagt (Z. 58), falsch ist die Zahl im Kriterium | ✗ (Spec, M1) |
| Kopf und Ladefläche: dieselben Spaltenbreiten geladen und im Ladezustand, bei 1280 und 1440 px (`WithoutProgress` gegen `WithoutProgressLoading`) | `without-progress` = `without-progress-loading`: 20 · 914 · 96 · 150 (1280), 20 · 1074 · 96 · 150 (1440), dazu 20 · 734 · 96 · 150 (1100) und 20 · 1554 · 96 · 150 (1920). Kopf und jede Zeile sind gleich. Das folgt aus einem `cols` für beide und `TableLoading cols={4}` (Review.tsx:165) | ✓ |
| `jumpHeader`: Kopf der letzten Spalte zeigt den Text; ohne die Prop „Sprung“ (`WithoutProgress` gegen `Filled`) | Köpfe in `without-progress`: (leer), „Prüfung“, „Stand“, „Weiter zu“. In `filled`: (leer), „Prüfung“, „Stand“, „Fortschritt“, „Sprung“ | ✓ |
| Ohne die zwei Props unverändert: `Filled`, `AllPassed`, `NotCounted`, `Loading`, `LoadingEmpty` mit fünf Spalten 20 · 1fr · 96 · 100 · 150 | Alle fünf Stories haben 5 Zellen in Kopf und Zeilen, 20 · 1fr · 96 · 100 · 150 bei allen vier Breiten. In `filled` (im `MasterDetail`) misst 1fr 184/364/524/1004, in den anderen 624/804/964/1444. Dazu ein SSR-Vergleich: `Checklist` aus HEAD `1702c7e` gegen den Arbeitsbaum, mit den Props dieser fünf Stories. Das Markup ist Zeichen für Zeichen gleich (6469/4511/5078/2414/1770 Zeichen) | ✓ |
| Spec-Tabelle stimmt mit der Signatur in `Review.tsx`, Zeichen für Zeichen | `without` · `readonly "progress"[]` · optional, `= []` (Review.tsx:124, 141). `jumpHeader` · `string` · optional, `= "Sprung"` (Review.tsx:125, 143). Die Spalte „Bedeutung“ deckt sich mit dem JSDoc (Review.tsx:136–142). Was die Komponente nicht kann (Z. 47–51), hält der Typ fest: er lässt nur `"progress"` zu | ✓ |
| *(Auftrag)* Einordnung stimmt mit Code und Stories | Diese Punkte stimmen. `@when` „Checklist of a gate“ (Review.tsx:116). `NotCounted` setzt `progress: null` auf jeder Zeile (stories:83) und behält gemessen 5 Spalten. `JournalEntryReviewList` hat `without?: readonly ProposalColumn[]` mit Vorgabe `[]` (JournalEntryReviewList.tsx:127, 210). `Table`, `HeadRow`, `TableLoading`, `Progress` sind die Importe (Review.tsx:11–14). Die Übergeben-Seite der App baut ihre Zeilen ohne `progress` (`CloseHandover.tsx` in `ludwig/app`). Nicht gedeckt ist die Regel: §3 Regel 2 erlaubt **eine** Prop, die Spec fügt zwei hinzu → M2 | ✗ (M2) |
| *(Skill, schlanke Abnahme)* Wächter über den Exit-Code, mit `--test` | `typecheck`, `check:when`, `check:language` und `check:type` Exit 0. `check:classes` Exit 1 mit 4 Klassen ohne Regel (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`). Alle liegen außerhalb des Diffs, ein HEAD-Abzug (`git archive HEAD`) meldet dieselben vier, und der Diff fügt keine Klasse hinzu. Alle `--test` Exit 0 | ✓ (für 0228; H2) |

Abgenommen von / am: fremde Abnahme (schlanke Abnahme, Schnittstelle, plus Spaltenmessung), 2026-10-27 · Offene Punkte: M1, M2, H1–H3 · Nachprüfung 1 (fremde Nachprüfung, 2026-10-27): M1 und M2 erfüllt, die Nachbesserung zu H1 und H3 stimmt. H2 liegt außerhalb von 0228 und bleibt auf der Liste des Designers. Keine neuen Mängel

### Messung des Bauenden (keine Abnahme)

`scripts/cdp.mjs`, Storybook :6107, Spaltenbreiten aus `getBoundingClientRect`
von Kopf und erster Zeile:

| Story | 1280 px | 1440 px |
|---|---|---|
| `Filled` | 20 · 364 · 96 · 100 · 150 | 20 · 524 · 96 · 100 · 150 |
| `NotCounted` | 20 · 804 · 96 · 100 · 150 | 20 · 964 · 96 · 100 · 150 |
| `Loading` | 20 · 804 · 96 · 100 · 150 | 20 · 964 · 96 · 100 · 150 |
| `WithoutProgress` | 20 · 914 · 96 · 150, Kopf „Weiter zu“ | 20 · 1074 · 96 · 150 |
| `WithoutProgressLoading` | 20 · 914 · 96 · 150 | 20 · 1074 · 96 · 150 |

Kein Label gekürzt, kein Querscroll im Dokument.

### Messung der Abnahme

Breite der Spalten in px, Kopf und jede Zeile gleich (Werte gerundet auf 0,1 px):

| Story | 1100 px | 1280 px | 1440 px | 1920 px |
|---|---|---|---|---|
| `filled` | 20 · 184 · 96 · 100 · 150 | 20 · 364 · 96 · 100 · 150 | 20 · 524 · 96 · 100 · 150 | 20 · 1004 · 96 · 100 · 150 |
| `all-passed`, `not-counted`, `loading`, `loading-empty` | 20 · 624 · 96 · 100 · 150 | 20 · 804 · 96 · 100 · 150 | 20 · 964 · 96 · 100 · 150 | 20 · 1444 · 96 · 100 · 150 |
| `without-progress`, `without-progress-loading` | 20 · 734 · 96 · 150 | 20 · 914 · 96 · 150 | 20 · 1074 · 96 · 150 | 20 · 1554 · 96 · 150 |

Die Messung des Bauenden stimmt bei 1280 und 1440 px mit diesen Werten überein.
Kein Querlauf im Dokument bei allen vier Breiten.

## Mängel

- **M1 · Spec-Mangel: „100 px breiter“ stimmt nicht, gemessen sind 110 px.** Das
  Kriterium (Z. 98), das Verhalten (Z. 58–59) und das Ziel (Z. 18) sagen 100 px.
  Mit der Spur „Fortschritt“ fällt aber auch eine Fuge der Zeile weg
  (`.v2tbl__row { gap: 10px }`, v3.css:134). „Prüfung“ wächst deshalb um 110 px:
  804 → 914 bei 1280 und 964 → 1074 bei 1440 px. Die Messung des Bauenden zeigt
  dieselben Zahlen. Der Code ist richtig. Zu tun: Der Spec-Autor setzt Ziel,
  Verhalten und Kriterium auf „100 px Spur plus 10 px Fuge = 110 px“. Danach
  braucht es eine Nachprüfung nur dieser Zeile.
- **M2 · Einordnung: zwei Props unter einer Regel, die eine erlaubt.**
  `spec-schreiben` §3 Regel 2 sagt „um **eine** Prop erweitern“. Die Bedingung
  dafür ist eine Entscheidung, die wiederkommt (zwei geplante Verwendungen oder
  eine Design-Vorlage). Die Spec fügt `without` und `jumpHeader` hinzu und
  begründet beide in einem Satz (Z. 25–27, „Experten- und Übergabesicht“). Die
  Expertensicht nutzt aber die Vorgaben. Damit ist die Übergeben-Seite die
  einzige genannte Verwendung der neuen Werte. In der App ist sie heute auch die
  einzige gefundene Aufrufstelle von `Checklist` (`CloseHandover.tsx`). Zu tun:
  Für jede Prop die Bedingung von Regel 2 belegen, zum Beispiel dass Spalte und
  Kopf innen liegen und an der Aufrufstelle nicht zu komponieren sind. Oder die
  Ausnahme mit Owner und Datum benennen (CLAUDE.md §3). Am Code ist dafür nichts
  zu ändern.

**Hinweise**

- **H1 · Veralteter Kommentar.** Review.tsx:150–152 sagt „each row has the same
  five columns“, mit `without` sind es vier. Beim Nachziehen von M1 auf „the same
  columns“ ändern. Kein Kriterium hängt daran.
- **H2 · `pnpm check:classes` ist schon auf HEAD rot.** Vier Klassen ohne Regel
  (`v3clt`, `v3clt__step` in `ClarificationThread.tsx`, `v2tbl__foot` in
  `Table.tsx`, `cy-page` in `ClientYearPage.tsx`). Keine davon kommt aus 0228.
  Den Befund an die Besitzer dieser Dateien geben.
- **H3 · `WithoutProgress` zeigt die Zeilen nicht klickbar.** Auf der
  Übergeben-Seite tragen die Zeilen `onPick` und `activeKey`, in der Story fehlen
  beide. Für die Spaltenkriterien spielt das keine Rolle, denn die Breiten hängen
  nicht daran. Für 0119 vormerken, falls dort die aktive Zeile ohne Fortschritt
  gemessen werden soll.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Ziel, Verhalten und Kriterium sagen 110 px (100 px Spur, 10 px Fuge). Die Zahl im Kriterium ist ein Spec-Mangel, keine Kürzung: gemessen war schon 110 |
| M2 | Die Einordnung belegt, warum Regel 2 nicht ganz greift und Komponieren an der Aufrufstelle zu ist, und benennt die Ausnahme mit Owner und Datum |
| H1 | Kommentar in `Review.tsx` sagt „the same columns“ statt „five columns“ |
| H2 | bleibt: die vier Klassen ohne Regel stammen aus 0207, 0211, 0214, nicht aus 0228; eigener Punkt auf der Liste des Designers |
| H3 | `WithoutProgress` hat `activeKey` und `onPick` wie auf der Übergeben-Seite (Zeile „Bank geht auf“ aktiv) |


## Nachprüfung 1 (2026-10-27)

Fremde Nachprüfung nur von M1 und M2, dazu der Abgleich der Nachbesserung zu H1 und H3.
Gegen HEAD `1702c7e` plus den uncommitteten Diff an `patterns/Review.tsx` und
`patterns/Review.stories.tsx`. Gemessen mit `scripts/cdp.mjs` (ein Messbrowser) gegen
Storybook 6107, per `getBoundingClientRect` jeder Kopf- und Zeilenzelle, bei 1280 und
1440 px. Story-IDs mit dem Präfix `v3-patterns-prüfen-checklist--`.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 · „110 px“ in Ziel, Verhalten und Kriterium | Im Text sagen alle drei Stellen 110 px: das Ziel (Z. 17–18, „110 px (100 px Spur und 10 px Fuge)“), das Verhalten (Z. 66–68, „zusammen 110 px“) und das Kriterium (Z. 107, „110 px breiter … (100 px Spur, 10 px Fuge)“). Nachgemessen: „Prüfung“ wird von `not-counted` zu `without-progress` breiter, von 804 auf 914 (1280 px) und von 964 auf 1074 (1440 px), also je um +110. Von `loading` zu `without-progress-loading` ist es dasselbe. Die Fuge zwischen den Kopfzellen misst in allen vier Stories 10 px (`.v2tbl__head, .v2tbl__row { gap: 10px }`, v3.css:134). Mit der Prop haben Kopf und alle 6 Zeilen 4 Zellen, 20 · 914 · 96 · 150 (1280) und 20 · 1074 · 96 · 150 (1440). Ohne die Prop sind es 5 Zellen, 20 · 804/964 · 96 · 100 · 150. Kein Querlauf im Dokument | ✓ |
| M2 · Einordnung gegen `spec-schreiben` §3 und CLAUDE.md §3 | Geprüft ist die Einordnung, Z. 25–35. (a) Die Spec behauptet Regel 2 nicht als erfüllt. Sie sagt selbst, dass „eine Prop“ und „eine Entscheidung, die wiederkommt“ nicht ganz zutreffen. (b) Der Ausweg der Regel ist belegt zu: An der Aufrufstelle lässt sich nicht komponieren. `Checklist` nimmt sonst nur `rows`, `activeKey`, `onPick` und `loading`. Spurstring, `HeadRow` und `TableLoading` liegen innen (Review.tsx:147–165). Die App müsste die Liste also nachbauen, und das wäre eine zweite Quelle. Die einzige Aufrufstelle ist bestätigt (`CloseHandover.tsx:73`). (c) Die Ausnahme ist benannt, mit Owner-Auftrag und Datum 2026-10-27 (Z. 32–34). Damit gilt CLAUDE.md §3 („benennt die Ausnahme mit Owner und Datum“). Zum Ort: Regel 2 regelt die Einordnung einer Spec („Die Spec schreibt hin, welche Regel griff“, `spec-schreiben` Z. 62) und steht nicht in `design-guidelines.md`. Eine Ausnahme in der Spec hat Vorlauf in 0202 („Benannte Ausnahmen (Owner, 2026-09-25)“, Z. 101). Anzumerken bleibt Z. 34–35: Die Trennung in zwei Props wird mit einer Expertensicht ohne Anteile begründet, und die gibt es heute nicht. Die Ausnahme nennt aber ausdrücklich „zwei Props“ und deckt das | ✓ |
| H1 · Kommentar in `Review.tsx` | Review.tsx:150–152 sagt „each row has the same columns“. In der Datei steht kein „five“ mehr (`grep -n five`) | ✓ stimmt |
| H3 · `WithoutProgress` klickbar, mit aktiver Zeile | Die Story setzt `useState("4")`, `activeKey` und `onPick` (Review.stories.tsx:107–121). Gemessen bei 1280 px: Alle 6 Zeilen sind `is-clickable` und haben `button.v2rowbtn` mit Cursor `pointer`. Beim Laden ist nur „Bank geht auf“ aktiv (`is-active`, Fläche `rgb(241, 247, 251)`). Ein Klick in die Mitte der ersten Zeile macht nur „Bank ist vollständig eingelesen“ aktiv. Fokus auf den Knopf der zweiten Zeile und Enter machen nur „Alle Belege des Zeitraums zugeordnet“ aktiv. Die Übergeben-Seite gibt `activeKey` und `onPick` genauso (`CloseHandover.tsx:73`). Dort schaltet ein zweiter Klick die Zeile wieder ab, in der Story nicht. Das entscheidet der Aufrufer, nicht die Komponente | ✓ stimmt |
| `pnpm typecheck` | Exit 0 | ✓ |
| Neue Mängel im Diff | Beide Dateien des Diffs gelesen, keiner gefunden | — |

Ergebnis: M1 und M2 sind erfüllt, Status `fertig`. H2 liegt außerhalb von 0228 und
bleibt auf der Liste des Designers.
