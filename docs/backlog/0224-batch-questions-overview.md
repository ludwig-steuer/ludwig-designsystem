# 0224 · „n Fragen bei Ludwig" — alle Fragen des Stapels im Blick

| | |
|---|---|
| Status | fertig 2026-10-27 (Nachprüfung fremd: abgenommen mit Auflage M4; M4 und Hinweis 1 behoben, s. „Nachbesserung 3") · vorher: Abnahme (M3 Text + Umbenennung `resolutionReason`) · vorher: in Arbeit — nicht abgenommen 2026-10-26 (Nachprüfung, Stand `7afec27`: M1 und M2 behoben, neuer Mangel 3 — Spec und Code sagen bei `resolution` Verschiedenes, nur Spec-Text; s. „Nachprüfung 2026-10-26") · vorher: Abnahme (Nachprüfung M1, M2) · nicht abgenommen 2026-10-26 (fremde Abnahme, Stand `8280d42`; Mängel 1–2, s. „Abnahme 2026-10-26") · gebaut 2026-10-26 (s. „Gebaut") |
| Stufe | erweitert `entities/clarification/Clarification.tsx` (`ClarificationList`, `ClarificationRow`, `ClarificationVM`) · `primitives/RecordPager.tsx` (ein Platz für Nebenwege) |
| Klassen-Test | Liste: nein (Rückfrage, ihre Stände). Pager-Platz: ja („Datensatz 3 von 12" und daneben ein Weg zur ganzen Menge gibt es in jeder App mit einer Warteschlange) |
| Quelle | Owner-Wunsch 2026-10-26 über llcto (Rückfragen-Schritt der Abnahme, `batches/[id]/close`); Props-Vorschlag des DS an llcto vom selben Tag, vom Owner bestätigt: `RecordPager.actions`, `ClarificationList groupBy="state"`, `onOpen`, `activeId`, `ClarificationVM.answer`; Gruppe „Beantwortet" (Registry), Knopf „n Fragen bei Ludwig", bei n = 0 kein Knopf |
| Ersetzt | nichts — heute sieht man beantwortete Fragen im neuen Ablauf nirgends mehr (Owner) |
| Blockiert | Einbau-Spec der App (llcto), Einbau ll-abnahme |
| Spec von / am | designsystem (Claude), 2026-10-26 |

## Ziel

Im Rückfragen-Schritt beantwortet die Buchhalterin eine Frage nach der
anderen (0222, „Frage 1 von 12"). Was sie beantwortet hat, liegt danach bei
Ludwig — und ist aus dem Ablauf verschwunden. Wer nach der fünften Frage
wissen will, was sie bei der zweiten geantwortet hat, oder welche Fragen noch
kommen, hat heute keinen Weg. Neben dem Pager steht deshalb ein Knopf
„3 Fragen bei Ludwig"; er öffnet die Fragen des Stapels als Liste: zuerst die
offenen (ein Klick springt im Ablauf dorthin), dann die beantworteten mit der
gegebenen Antwort, nur zum Lesen.

## Einordnung

- **Wiederverwenden:** `ClarificationList` (`@when` „The clarifications of a
  case, a batch, a run or a portal user — few rows, optionally grouped by who
  is asked") trägt den Fall zu vier Fünfteln: Zeilen, Gruppen mit Zähler,
  Aufklappen zur vollen Karte über `renderDetail`, Markierung `active` an der
  Zeile. `Drawer` (`@when` „Looking at something existing next to a list …
  without leaving the list") trägt den Rahmen: der Schritt bleibt stehen, `Esc`
  schließt (R15: ansehen im Drawer). `RecordPager` steht schon über der Karte.
- **Nicht `TodoList` + `toTodoItem`:** das ist die Arbeitsliste eines Schritts
  (jeder Eintrag wählbar, Sprung zum nächsten offenen, Tasten J/K). Hier ist
  es eine Übersicht zum Nachschlagen: offene Fragen führen **aus** dem Drawer
  in den Ablauf, beantwortete liest man an Ort und Stelle. Zwei Jobs, zwei
  Bausteine.
- **Erweitert, weil (Regel 2):** vier Dinge fehlen, jedes eine
  Designentscheidung, die wiederkommt — Gruppierung nach Stand (auch am
  Sachverhalt und im Portal denkbar), ein Sprungweg je offener Zeile, die
  Markierung der Frage, die gerade im Ablauf steht, und die Antwort in der
  Zeile. Am `RecordPager` fehlt ein Platz für einen Nebenweg; die
  Belegprüfung (0223) hat denselben Bedarf („Alle Belege als Liste").
- **Zuschnitt:** keine neue Datei, kein neuer Export. Der Drawer mit der Liste
  ist Markup an der Aufrufstelle (Regel 4: ohne eigenen Zustand keine
  Komponente) und wird als Story vorgemacht.
- **Setzt auf:** `ClarificationRow`, `Disclosure`, `StatusBadge`, `Time`,
  `Drawer`, `TextButton`, `ClarificationCard mode="read"`.

## Schnittstelle

### `RecordPager` — neu

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `actions` | `ReactNode` | nein | Nebenwege rechts in der Pager-Zeile, nach dem Pfeil „Nächster" (ein, höchstens zwei `TextButton`); auch ohne Warteschlange neben dem Weg zurück | `RecordPager/WithActions` |

### `ClarificationVM` — neu

| Feld | Typ | Bedeutung | Nachweis |
|---|---|---|---|
| `answer` | `string \| null` (optional) | die gegebene Antwort als Text — der gewählte Optionstext oder der Freitext. Die App leitet ihn aus `answer_payload` ab (L-367) | `ClarificationRow/ByState` |
| `resolutionReason` | `string \| null` (optional) | der Grund, wenn die Frage **anderweitig geklärt** wurde, ohne Antwort; geht `answer` vor. Nicht die Spalte `resolution` — die trägt die Art (`answered`/`obsolete`), dies ist der Grund als Text (Nachbesserung 2, M2/M3) | `ClarificationRow/ByState` |

### `ClarificationList` — neu

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `groupBy` | `"audience" \| "none" \| "state"` | nein, Standard `"none"` | `state`: Gruppen in der Reihenfolge Offen · Zurückgestellt · Beantwortet, Wort aus der Registry (Achse `clarification`), Zähler im Kopf; Notizen (`type: "comment"`) zuletzt unter dem Registry-Wort „Notiz" (Achse `clarification_type`). Leere Gruppen fehlen. Innerhalb der Gruppe die Reihenfolge des Aufrufers | `ClarificationRow/ByState` |
| `onOpen` | `(c: ClarificationVM) => void` | nein | Zeilen offener und zurückgestellter **Fragen** sind ein Weg: ein Klick auf die Zeile ruft `onOpen` (die App schließt den Drawer und springt im Ablauf zur Frage). Beantwortete Fragen und Notizen bekommen keinen Sprung | `ClarificationRow/ByState` |
| `activeId` | `string \| null` | nein | die Frage, die gerade im Ablauf steht, ist markiert (`active` an ihrer Zeile, `aria-current`) | `ClarificationRow/ByState` |

### `ClarificationRow` — neu

| Prop | Typ | Pflicht | Bedeutung | Nachweis |
|---|---|---|---|---|
| `onOpen` | `() => void` | nein | wie oben, für die einzelne Zeile; die Liste reicht ihn nur bei offenen und zurückgestellten Fragen durch | `ClarificationRow/ByState` |
| `hideBadges` | `boolean` | nein | ohne Badges (`groupBy="state"` setzt es): den Stand sagt die Gruppe, „Blockierend" trägt nichts, weil fast jede Frage blockiert (Owner 2026-10-26, Nachtrag); eine offene oder zurückgestellte **optionale** Frage trägt in der Meta-Zeile das Registry-Wort „optional" | `ClarificationRow/ByState` |

**Die Zeile mit Antwort:** Ist `resolutionReason` gesetzt, steht unter dem
Titel „Anderweitig geklärt: {resolutionReason}" — dasselbe Wort wie im
Verlauf der Karte (`RESOLVED_WORD`). Sonst, ist `answer` gesetzt, „Antwort:
{answer}". Einzeilig gekürzt, ganz im `title`-Hover und im Aufklapper; das
Wort vor dem Doppelpunkt grau. Ohne beide keine Zeile.

**Der Knopf** (App, kein neuer Baustein): `TextButton` in `RecordPager.actions`,
Wort „{n} Fragen bei Ludwig" bzw. „1 Frage bei Ludwig"; n = Fragen dieses
Stapels mit Stand `answered`. Bei n = 0 kein Knopf (Owner 2026-10-26).

**Der Drawer** (App, Story `InBatchReviewDrawer` macht ihn vor): Titel
„Fragen dieses Stapels", `meta` die Zählung mit den Registry-Wörtern
(„9 offen · 3 beantwortet"), Inhalt `ClarificationList groupBy="state"
showCase onOpen activeId renderDetail`, wobei `renderDetail` nur für
beantwortete Fragen die volle Karte `mode="read"` liefert.

Typen aus `src/ludwig/modules/accounting-cases/domain/case.ts`
(`ClarificationState`, `clarificationState()`), Achsen `clarification` und
`clarification_type` aus der Registry. GLOSSARY: clarification = Rückfrage,
batch = Stapel.

Was der Baustein **nicht** kann (bewusst): er zählt nicht „bei Ludwig" (die
App kennt, wer geantwortet hat; die Liste zeigt, was sie bekommt), er schließt
den Drawer nicht (die App hält den Zustand, der Drawer ist ihr Markup), er
sortiert nicht (der Aufrufer bestimmt die Ordnung, wie bisher), er lässt eine
Antwort nicht ändern (eine Frage hat genau eine Antwort, `answerClarification`
verweigert die zweite — Entitätsprofil „Eine Antwort, nicht mehrere").

## Verhalten

- **Client oder Server:** die Liste bleibt ohne `"use client"`; mit `onOpen`
  braucht der Aufrufer ohnehin einen Client-Baum.
- **Zeile mit `onOpen`:** der Titel ist ein Knopf mit Überzug über die ganze
  Zeile (`v2rowlink`, wie in Tabellenzeilen), Hover färbt die Zeile
  `--color-bg-soft`, der Titel in Linkfarbe. Andere Klickziele in der Zeile
  (Sachverhaltsnummer mit `href`) liegen über dem Überzug.
- **Beantwortete Zeile:** mit `renderDetail` klappt sie auf (natives
  `<details>`), ohne bleibt sie flach. Kein Sprung, kein Hover, der etwas
  anderes verspricht.
- **Tastatur:** `Tab` durch die Zeilen; `Enter`/Leertaste auf einer offenen
  Zeile ruft `onOpen`; auf einer beantworteten klappt sie auf und zu; `Esc`
  schließt den Drawer (Drawer). Nach dem Sprung gibt der Drawer den Fokus an
  den Knopf zurück, der ihn geöffnet hat — er steht in der Pager-Zeile direkt
  über der Frage, der nächste `Tab` führt in sie hinein. Kein eigener
  Fokuszug nötig (gemessen).
- **Zustände:** gefüllt; leer (`ClarificationList` zeigt seinen Leertext — im
  Ablauf kommt es nicht vor, ohne beantwortete Frage gibt es keinen Knopf);
  leer nach Filter: die Liste filtert nicht; lädt und Fehler: die Liste lädt
  nicht, die Fragen kommen mit dem Schritt.
- **Live-Region:** nicht nötig — nichts ändert sich, während der Drawer offen
  ist.

## Stories

| Story | Beweist |
|---|---|
| `ClarificationRow/ByState` | `groupBy="state"`: Offen (zwei, eine davon `activeId`), Zurückgestellt (eine), Beantwortet (drei, eine mit langer Antwort gekürzt, eine „anderweitig geklärt"), Notiz (eine) — in dieser Reihenfolge, Zähler je Kopf, kein Stand-Badge in den Zeilen; `onOpen`-Rundlauf („springt zu: …") nur bei offenen und zurückgestellten |
| `ClarificationRow/InBatchReviewDrawer` | im Einsatz: `RecordPager` „Frage 1 von 3" (gezählt werden die offenen und zurückgestellten Fragen, die der Ablauf durchgeht) mit `actions` „3 Fragen bei Ludwig" über der Step-Karte (0222); Klick öffnet den Drawer; offene Zeile springt und schließt; beantwortete klappt zur Karte `mode="read"` auf |
| `RecordPager/WithActions` | `actions` rechts nach dem Pfeil, einmal mit Warteschlange, einmal nur mit dem Weg zurück |

Ableitung (§6): Zustand gefüllt → `ByState`; leer → vorhandene Story `Empty`;
Enum `groupBy` neuer Wert → `ByState` (die Werte `audience`/`none` zeigen
`InStack`/`Filled`); Callback `onOpen` → Rundlauf in `ByState`; im Einsatz →
`InBatchReviewDrawer`; Rand (lange Antwort) → in `ByState`; Layout-Prop
`actions` → `WithActions`. Ausgeschlossen mit Grund: leer nach Filter, lädt,
Fehler (s. Verhalten).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Wer geantwortet hat, in der Zeile | `ClarificationVM.answeredBy` (Name) | mehrere Personen beantworten Fragen eines Stapels |
| Antwort zurücknehmen, solange Ludwig sie nicht verarbeitet hat | `onReopen?: (c) => Promise<void>` an der Liste | die App kann eine Antwort zurücknehmen (heute verweigert sie die zweite) |

## Befunde an die App

- **L-367** `ClarificationVM.answer` — die App leitet den Text aus
  `answer_payload` ab: gewählte Option (Optionstext, Regel S13) oder Freitext.
  Bei einer Auflösung ohne Antwort **nicht** dort, sondern der Grund als
  `ClarificationVM.resolutionReason` (Entitätsprofil: „`resolution` …
  benennen, statt ihn wie eine Antwort zu zeigen") — die Zeile sagt dann
  „Anderweitig geklärt: …".

## Offene Fragen

1. ~~Bleibt „Blockierend" in den Zeilen der Liste?~~ Entschieden (Owner
   2026-10-26 über llcto): nein, s. Nachtrag.
2. Kommen Notizen in den Drawer? *Ohne Antwort:* ja, als letzte Gruppe — die
   App gibt mit, was sie hat; „Fragen dieses Stapels" ohne Notizen hieße, die
   App filtert sie selbst heraus.

## Abnahmekriterien

Fest (gilt immer):

- [x] `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün
- [x] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [x] Code englisch; `@when`/`@instead` an jedem Export
- [x] Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry
- [x] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [x] Prüfliste `design-guidelines.md` §9 durchgegangen
- [x] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [x] `groupBy="state"`: Gruppen Offen · Zurückgestellt · Beantwortet · Notiz in dieser Reihenfolge, Wörter aus der Registry, leere Gruppen fehlen, Zähler im Kopf, **kein Badge** in den Zeilen, optionale offene/zurückgestellte Frage mit „optional" in der Meta-Zeile (Story `ByState`; Nachtrag 2026-10-26)
- [x] `onOpen` nur an offenen und zurückgestellten Fragen; ganze Zeile klickbar mit Hover, `Enter` löst aus; beantwortete und Notizen ohne Sprung (Story `ByState`, Tastatur gemessen)
- [x] `activeId` markiert genau eine Zeile mit `aria-current` (Story `ByState`)
- [x] `answer`: Zeile „Antwort: …" einzeilig gekürzt, ganz im Hover; ohne `answer` keine Zeile (Story `ByState`, Rand)
- [x] `RecordPager.actions` rechts nach dem Pfeil, mit und ohne Warteschlange; Trefferfläche ≥ 24 × 24 px (Story `WithActions`, gemessen)
- [x] Im Einsatz: Knopf öffnet den Drawer, offene Zeile springt und schließt ihn, beantwortete klappt lesend auf, `Esc` schließt (Story `InBatchReviewDrawer`)
- [x] Vorhandene Stories von `ClarificationList`/`ClarificationRow`/`RecordPager` ohne die neuen Props unverändert
- [ ] offen (App): Knopf und Drawer im Rückfragen-Schritt, n aus den beantworteten Fragen des Stapels, `answer` aus `answer_payload` (L-367)

## Gebaut 2026-10-26

`Clarification.tsx`: `ClarificationVM.answer`; `ClarificationRow` mit
`onOpen` (Titel als `button.v2link.v2rowlink`, Überzug über die Zeile; mit
`onOpen` klappt die Zeile nicht), `hideState` (nur noch „Blockierend";
im Nachtrag ersetzt durch `hideBadges`), Zeile „Antwort: …"; `ClarificationList` mit
`groupBy="state"` (Gruppen aus `resolveStatus("clarification", …)` und
`resolveStatus("clarification_type", "comment")`, eine Gruppenschleife für
`audience` und `state`), `onOpen` nur an offenen und zurückgestellten Fragen,
`activeId`. `RecordPager.tsx`: `actions` nach dem Pfeil „Nächster", auch ohne
Warteschlange. `v3.css`: `.v2cl__item:has(.v2rowlink)` (Hover, Zeiger),
`.v2cl__open`, `.v2cl__answer`, `.v2cl__answerlabel`, `.v2pager__actions`.
Stories `ClarificationRow/ByState`, `ClarificationRow/InBatchReviewDrawer`,
`RecordPager/WithActions`.

Gemessen (eigener Messbrowser `scripts/cdp.mjs`, Fenster 1042 × 1000):
`ByState` Karte 521 px (= Drawer `md`), `scrollWidth` 1042; Gruppen
„Offen 2 · Zurückgestellt 1 · Beantwortet 3 · Notiz 1"; in den Zeilen kein
Stand-Badge, „Blockierend" an den zwei offenen; nur die lange Antwort gekürzt
(`scrollWidth > clientWidth`), alle mit `title`; Hover über der Zeilenfläche
einer offenen Frage `rgb(244, 246, 248)`, Zeiger, Titel unterstrichen;
beantwortete Zeile ohne Hover; Klick auf die Zeilenfläche und `Enter` auf dem
Titel rufen `onOpen`; Fokusring 2 px. `WithActions`: Knopf 122 × 24 px, 24 px
nach dem Pfeil, 32 px nach dem Rückweg (dessen eigener Abstand kommt dazu). `InBatchReviewDrawer`: Knopf öffnet den
Drawer, aktuelle Frage markiert, beantwortete klappt zur Karte `mode="read"`
mit Verlauf auf, Klick auf eine offene Frage → „Frage 2 von 3", Drawer zu,
Fokus auf „3 Fragen bei Ludwig"; `Esc` schließt.
Beim Messen gefunden: ein Grid als Story-Rahmen zog die Spalte auf die Breite
der ungebrochenen Antwortzeile (1230 px) — Fehler der Fixture, nicht des
Bausteins; der Rahmen ist jetzt ein Block wie der Drawer-Körper.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Nachtrag 2026-10-26 — keine Badges in der Fragenliste (Owner über llcto)

Owner-Linie vom selben Tag, nach dem Bau: „Blockierend" trägt auch in der
Fragenliste nichts — fast jede Frage blockiert. In `groupBy="state"` fällt
deshalb **jedes** Badge aus der Zeile; eine optionale Frage bekommt höchstens
den kurzen Registry-Hinweis, kein Tag.

| Was | Entscheid |
|---|---|
| Prop | `ClarificationRow.hideState` wird `hideBadges` (noch kein Aufrufer außer der Liste selbst; die App nutzt `groupBy`) |
| Zeile | ohne `.v2cl__state`; der Titel nimmt die ganze Breite |
| Optional | in der Meta-Zeile „· optional" — das Registry-Wort (`clarification_severity.optional.label`) klein im laufenden Text wie „zurückgestellt bis …"; nur bei offenen und zurückgestellten Fragen. Der lange Registry-Satz der Karte („Hilfreich, aber …") passt in keine einzeilige Meta-Zeile |
| Andere Gruppierungen | unverändert: `audience`/`none` zeigen Stand und „Blockierend" wie bisher |

### Abnahme 2026-10-26

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung, nicht der Bauende). Stand
`8280d42` (Bau `2b54bb6`, Nachtrag `3fdf788`; danach hat `137fc01` die
Zählung des Pagers zur Live-Region gemacht, Regel I13), Arbeitsbaum zu
Beginn sauber. Gelesen: `CLAUDE.md`, Skill `v3-komponente` (Abnahme), §9 der
Guideline, diese Spec ganz samt Nachtrag, `git diff d3e91ff 3fdf788` für
`Clarification.tsx`, `Clarification.stories.tsx`, `RecordPager.tsx`,
`RecordPager.stories.tsx` und `v3.css` (`.v2cl__item:has(.v2rowlink)`,
`.v2cl__open`, `.v2cl__answer*`, `.v2pager__actions`), dazu
`primitives/Drawer.tsx` und `primitives/focus.ts` (Fokusführung des
Drawers), die Achsen `clarification`, `clarification_type` und
`clarification_severity` im Spiegel, `docs/entitaeten/clarification.md`
(Auflösung ohne Antwort) und L-367. Gemessen mit `scripts/cdp.mjs`
(chrome-headless-shell 155) am Dev-Server 6107, ein Browser für alle
Messungen, Fenster 1042 × 1000 (= 1280 px mit Seitenleiste), Querlauf auch bei
1480 und 1920; Maße mit `getBoundingClientRect`, Farben aus
`getComputedStyle`, Kontrast nach WCAG gerechnet, Tastatur mit echten
Tastendrücken (Tab, Umschalt+Tab, Enter, Leertaste, Esc), Klicks und Hover
mit echten Mausereignissen. Gegenprobe „unverändert": `d3e91ff` in einem
Worktree im Scratchpad und `8280d42` je statisch gebaut, jede Story beider
Stände in derselben Sitzung geladen, `innerHTML` (nach Angleichung der
`useId`-Kennungen) und die Geometrie jedes Elements verglichen. Befehle selbst
gelaufen. Bildschirmfotos `.playwright-mcp/0224-abnahme-by-state-1042.png`,
`…-drawer-open.png`, `…-drawer-answered-open.png`, `…-drawer-focus-row.png`,
`…-drawer-after-jump.png`, `…-recordpager-with-actions.png`.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert · Datei:Zeile) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `typecheck` Exit 0; `check:type` Exit 0, `--test` Exit 0; `pnpm build -o` ins Scratchpad Exit 0 (nur die bekannte Chunk-Warnung), Index führt `clarificationrow--by-state`, `--in-batch-review-drawer`, `recordpager--with-actions`. `check:language`, `check:when`, `check:icons`, `check:contrast` Exit 0, je `--test` Exit 0; `check:classes` Exit 1 nur mit den vier Altfällen (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), `--test` Exit 0 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Erweiterung in `entities/clarification/Clarification.tsx` und `primitives/RecordPager.tsx`, kein neuer Export; Stories in `Clarification.stories.tsx` (`v3/Entitäten/Klärung/ClarificationRow`) und `RecordPager.stories.tsx` (`v3/Primitives/Navigation/RecordPager`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when` von `ClarificationRow` und `ClarificationList` um `onOpen` bzw. „by state" ergänzt; JSDoc der neuen Props englisch; Klassen `v2cl__open`, `v2cl__answer`, `v2cl__answerlabel`, `v2pager__actions`; Deutsch nur in Nutzer-Strings | ✓ |
| Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry | Gruppenwörter aus `resolveStatus("clarification", …)` und `resolveStatus("clarification_type", "comment")` (`Clarification.tsx:360`, `:365`), „optional" aus `clarification_severity.optional.label` (`:252`); kein Hex, kein px im Baustein (`maxWidth: 521` nur im Story-Rahmen) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `ByState`, `InBatchReviewDrawer`, `WithActions` im Index und im Browser, Konsole ohne Meldung (nur Vite- und DevTools-Info); leer = vorhandene `Empty`; leer nach Filter, lädt, Fehler begründet (Verhalten). Die Story-Tabelle nennt für `InBatchReviewDrawer` „Frage 4 von 9", die Story zeigt „Frage 1 von 3" (Hinweis 3) | ✓ (mit Hinweis) |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Importe abwärts (Entität → Primitives, Patterns, Registry; `RecordPager` nimmt nur `ReactNode`); Text links (`.v2cl__open { text-align: left }`), nichts zentriert; Farbe nur Link und Auswahl (Fläche nur für die aktive Zeile); Kontrast und Fokus s. u.; Hover an jedem Weg, an keiner Lesezeile; Trefferflächen ≥ 24 px; Schrift 13,5/12,5 px, 600/700 aus der Skala; Drawer `h2` → Gruppen `h3`. Offen: Tastaturweg zu den beantworteten Zeilen (M1), Auflösung als Antwort benannt (M2) | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | die drei neuen Stories bei 1042, 1480, 1920 px, `scrollWidth` = Fensterbreite | ✓ |
| `groupBy="state"`: Gruppen, Reihenfolge, Registry, leere fehlen, Zähler, kein Badge, „optional" (Story `ByState`) | Köpfe `h3` „Offen 2 · Zurückgestellt 1 · Beantwortet 3 · Notiz 1" in dieser Reihenfolge, Wörter = Registry; in allen sieben Zeilen 0 Badges, kein `.v2cl__state`; zurückgestellte optionale Frage: Meta „Kanzlei · Gefragt vor 17 Tagen · zurückgestellt bis 05.11.2026 · optional", die beantwortete optionale ohne „optional"; leere Gruppen fallen weg (`Clarification.tsx:373`) | ✓ |
| `onOpen` nur an offenen und zurückgestellten Fragen; ganze Zeile klickbar mit Hover, `Enter`; beantwortete und Notizen ohne Sprung (Story `ByState`) | Titel der drei offenen/zurückgestellten Fragen ist `button.v2link.v2rowlink`, die übrigen vier ein `span`. Maus über der Meta-Zeile einer offenen Frage (Ziel = Überzug des Knopfs): Zeile `rgb(244, 246, 248)`, Zeiger, Titel unterstrichen; aktive Zeile bleibt `rgb(241, 247, 251)`, Titel unterstrichen; beantwortete Zeile ohne Hover, Zeiger `auto`, ein Klick tut nichts. Klick auf die Meta-Zeile → „Springt zu: Welche Gegenpartei …"; Enter auf dem Titel ebenso, Leertaste auf der zurückgestellten → „Springt zu: Zu welchem Projekt …". Tab läuft nur über die drei Wege. Fokusring 2 px `#3B8FC4`, 3,55:1 auf Weiß, 3,29:1 auf der aktiven Zeile, im Drawer ganz innerhalb von `.v2drawer__b`. Linkfarbe 5,45:1 (Weiß), 5,03:1 (Hover), 5,04:1 (aktiv) | ✓ |
| `activeId` markiert genau eine Zeile mit `aria-current` (Story `ByState`) | genau ein `[aria-current="true"]` mit `is-active`, Fläche `accent-50` und Balken 3 px innen links (Form, nicht nur Farbe); im Drawer nach dem Sprung auf die dritte Frage steht die Markierung dort | ✓ |
| `answer`: „Antwort: …" einzeilig gekürzt, ganz im Hover; ohne `answer` keine Zeile (Story `ByState`) | nur die drei beantworteten Fragen tragen die Zeile, je 20,9 px hoch (eine Zeile), 13,5 px in Textfarbe (13,77:1), „Antwort:" `#5C5C5C` 6,69:1; nur die lange Antwort ist gekürzt (`scrollWidth > clientWidth`), `title` trägt den ganzen Text; ohne `answer` keine Zeile. Zur dritten Antwort s. M2 | ✓ |
| `RecordPager.actions` rechts nach dem Pfeil, mit und ohne Warteschlange; Trefferfläche ≥ 24 × 24 px (Story `WithActions`) | mit Warteschlange „Frage 1 von 3" und Pfeile, danach der Knopf 24 px nach dem Pfeil (x 169,7 → 193,7); nur mit Rückweg: der Knopf 32 px nach „Sachverhalte" (Hinweis 4). Knopf 121,9 × 24 px, 12,5 px, Linkfarbe 5,03:1 auf dem Seitengrund, Hover unterstrichen, Fokusring 3,28:1; Tab: Pfeil → Knopf → Rückweg → Knopf | ✓ |
| Im Einsatz: Knopf öffnet den Drawer, offene Zeile springt und schließt ihn, beantwortete klappt lesend auf, `Esc` schließt (Story `InBatchReviewDrawer`) | Klick und Enter auf „3 Fragen bei Ludwig" öffnen den Drawer (`md`, 521 px, `h2` „Fragen dieses Stapels", Meta „2 offen · 1 zurückgestellt · 3 beantwortet"), Fokus auf dem Panel. Klick auf eine offene Zeile → „Frage 2 von 3", Drawer zu, Fokus auf „3 Fragen bei Ludwig", der nächste Tab ins Antwortfeld; Enter auf der dritten offenen Zeile → „Frage 3 von 3", ebenso. Klick auf eine beantwortete klappt zur Karte `mode="read"` mit Verlauf auf, Enter und Leertaste auf dem fokussierten Kopf schalten. Esc schließt, Fokus zurück auf den Knopf. **Aber** die Tastatur erreicht die beantworteten Zeilen nicht: Tab und Umschalt+Tab kreisen „Schließen → drei offene Zeilen → Schließen"; und von einer per Klick fokussierten beantworteten Zeile führt Tab aus dem Drawer auf `body` und dann auf den Pfeil hinter dem Schleier (M1) | ✗ |
| Vorhandene Stories von `ClarificationList`/`ClarificationRow`/`RecordPager` ohne die neuen Props unverändert | `d3e91ff` gegen `8280d42`: die neun Stories `clarificationrow--filled`, `--states`, `--comment`, `--in-stack`, `--with-card`, `--preview`, `--in-frame`, `--long-question`, `--empty` in HTML und Geometrie gleich. `RecordPager`: `--back-only` gleich; die sechs mit Zählung unterscheiden sich nur um `aria-live="polite" aria-atomic="true"` an `.v2pager__count` (aus `137fc01`, I13, nicht aus 0224), Geometrie gleich | ✓ |
| offen (App): Knopf und Drawer im Rückfragen-Schritt, n, `answer` aus `answer_payload` (L-367) | `befunde-app.md` L-367 | offen (App) |
| Zusatz: Auflösung ohne Antwort benannt (Befunde an die App, Entitätsprofil) | s. M2 | ✗ |
| Zusatz: Schnittstelle Zeichen für Zeichen | `actions?: ReactNode` in `Common` (beide Pager-Formen); `answer?: string \| null`; `groupBy?: "audience" \| "none" \| "state"` Vorgabe `"none"`; `onOpen?: (c: ClarificationVM) => void`; `activeId?: string \| null` Vorgabe `null`; `ClarificationRow.onOpen?: () => void`, `hideBadges?: boolean` Vorgabe `false`; mit `onOpen` klappt die Zeile nicht (`:259`), die Liste reicht `onOpen` nur an Fragen außer beantworteten (`:335`) — alle wie die Tabellen | ✓ |
| Zusatz: keine echten Daten | Datenprobe über die Diffs (`d3e91ff..3fdf788`, `9901556..HEAD`): leer | ✓ |

#### Mängel

1. **Beantwortete Zeilen im Drawer per Tastatur nicht erreichbar; der Fokus
   verlässt den Drawer.** `primitives/focus.ts:18–19`: `TABBABLE` kennt
   `summary` nicht. `trapTab` (`:32–48`) nimmt deshalb die dritte offene
   Zeile als letzten Halt und springt von dort auf „Schließen" zurück — die
   drei Köpfe der beantworteten Fragen liegen dahinter und werden in beiden
   Richtungen übersprungen. Steht der Fokus (nach einem Klick) auf einem
   dieser Köpfe, läuft Tab nativ weiter und vom letzten aus dem Panel hinaus
   (`body`, dann der Pfeil des Pagers hinter dem Schleier). Gemessen in
   `InBatchReviewDrawer`. Dazu: der Filter `el.offsetParent !== null`
   (`:34–36`) hält in Chrome 155 Elemente in einem zugeklappten `<details>`
   für sichtbar (Knopf in der zugeklappten Tabelle von
   `SourceDocumentReview/Overview`: `offsetParent` gesetzt,
   `checkVisibility()` false). Die Ursache liegt im Primitive (seit 0092);
   sichtbar wird sie hier, mit der ersten Drawer-Liste, deren Aufklapper
   hinter dem letzten Knopf stehen. Verletzt „Tab durch die Zeilen … auf einer
   beantworteten klappt sie auf und zu" (Verhalten) und „keine
   Tastaturfalle". Vorschlag: `summary` in `TABBABLE` aufnehmen und mit
   `el.checkVisibility()` statt `offsetParent` filtern — mit dieser Abfrage
   gemessen ergeben sich im Drawer die Halte „Schließen · drei offene Zeilen ·
   drei beantwortete" in Lesefolge. Gilt für Drawer und Dialog; nachmessen in
   `InBatchReviewDrawer` und an einem Dialog mit Aufklapper.
2. **„Anderweitig geklärt" steht als Antwort da.** `Clarification.tsx:207–211`
   setzt vor jedes `answer` das Wort „Antwort:". Die App soll laut L-367 bei
   einer Auflösung ohne Antwort „Anderweitig geklärt: {Grund}" liefern, die
   Story tut es (`Clarification.stories.tsx:327`), gerendert steht da
   „Antwort: Anderweitig geklärt: telefonisch mit dem Mandanten geklärt" —
   zwei Etiketten, das erste falsch. Die Spec sagt selbst „die Zeile sagt dann
   „Anderweitig geklärt: …"" (Befunde an die App), das Entitätsprofil „die
   Karte muss den Fall benennen, statt ihn wie eine Antwort zu zeigen"
   (`docs/entitaeten/clarification.md:50–57`). Linsen Sprache und Logik.
   Vorschlag: das Etikett nicht aus dem Text erraten, sondern im VM tragen —
   etwa `ClarificationVM.resolution?: string | null` (Grund einer Auflösung
   ohne Antwort) neben `answer`; die Zeile sagt dann „Anderweitig geklärt:
   {resolution}" mit dem Wort in Grau wie „Antwort:", L-367 wird geteilt, die
   Story-Frage `b6` trägt den Grund ohne Vorsatz.

#### Hinweise (nicht blockierend)

1. **Zwei Fluchten in einer Liste.** Im Drawer beginnen Zeilen mit Aufklapper
   (beantwortet) ihren Text 14 px weiter rechts als Zeilen ohne
   (Sachverhaltsnummer x 571 gegen 557, `…-drawer-answered-open.png`): der
   Chevron von `Disclosure` nimmt eine Spalte, die die übrigen Zeilen nicht
   haben. Vorschlag: in einer Liste mit `renderDetail` hält jede Zeile die
   Spalte frei.
2. **Die Lesekarte wiederholt die Zeile.** Im Aufklapper stehen die Frage noch
   einmal als Überschrift, das Badge „Beantwortet" und „Gefragt ist: Kanzlei
   …" — Markup der App (`renderDetail`), aber die Story macht es vor. Ansehen,
   ob dort Verlauf und Antwort genügen.
3. **Story-Tabelle und Story zählen verschieden.** `:134` sagt „Frage 4 von
   9", die Story zeigt „Frage 1 von 3". Angleichen und festhalten, was der
   Pager zählt: die Story zählt die verbliebenen Fragen (beantwortete sind aus
   dem Ablauf verschwunden, s. Ziel), der Knopf die beantworteten — die App
   braucht das beim Einbau.
4. **Abstand nach dem Rückweg.** „Gebaut" sagt „24 px nach dem Pfeil bzw.
   nach dem Rückweg"; nach dem Rückweg sind es 32 px (`.v2pager__back`
   `margin-right` 8 + `gap` 8 + `margin-left` 16, `v3.css:2819–2831`). Satz
   oder Maß angleichen.
5. **Zählung als Literal.** Die Meta des Drawers und die Unterzeile in
   `ByState` stehen als Text in der Story („2 offen · …"); die Spec verlangt
   die Registry-Wörter — beim Einbau aus `resolveStatus("clarification",
   …).label`, klein gesetzt wie „optional".
6. **Nicht messbar:** „Sachverhaltsnummer mit `href` liegt über dem Überzug"
   — keine Story hat `href` und `onOpen` zugleich; nur der Code sagt es
   (`v3.css:3105`).
7. **Vier-Wochen-Test des Knopfs.** „3 Fragen bei Ludwig" lässt sich in einem
   Schritt, in dem jede Frage von Ludwig kommt, auch als „Ludwig hat 3
   Fragen" lesen. Owner-Wort (bestätigt 2026-10-26) — beim ersten Einsatz
   beobachten; ein anderes Wort entscheidet der Owner.

Vier Linsen: **Sprache** — Gruppenwörter aus der Registry, „optional" klein
wie „zurückgestellt bis", „Fragen dieses Stapels", Knopf mit Zahl und
Singular; aber „Antwort: Anderweitig geklärt: …" nennt eine Auflösung eine
Antwort (M2) ✗. **Bedienung** — die ganze Zeile ist Ziel mit Hover, Enter
und Leertaste auf dem Titel, Fokusring ≥ 3,29:1 und nicht beschnitten, Esc
schließt, der Fokus kommt auf den Knopf zurück und der nächste Tab führt in
die Frage, Knopf 24 px hoch; die beantworteten Zeilen erreicht die Tastatur
nicht, und von dort läuft der Fokus hinter den Schleier (M1) ✗. **Logik** —
die Gruppe folgt aus `state` und `type`, gesprungen wird nur, wo es einen
Ort im Ablauf gibt, gelesen, wo nichts mehr zu tun ist, die Liste sortiert
nicht; die Auflösung ohne Antwort hat im VM keinen eigenen Ort (M2) ✗.
**Darstellung** — keine Badges, der Stand im Gruppenkopf, die aktive Zeile
mit Fläche und Balken, Linkfarbe nur am Titel, der ein Weg ist, die Antwort
eine Zeile; zwei Fluchten im Drawer (Hinweis 1) ✓.

Vier-Wochen-Test: die Liste besteht ihn — Gruppen in Worten, der Weg ist
der blaue Titel, die Antwort steht ausgeschrieben; offen ist das Wort des
Knopfs (Hinweis 7).

Abgenommen von / am: Claude (fremde Abnahme, nicht der Bauende), 2026-10-26,
Stand `8280d42` · **Nicht abgenommen.** Offen: Mängel 1–2, Hinweise 1–7;
Knopf und Drawer im Rückfragen-Schritt sowie L-367 offen (App).

## Nachbesserung 2026-10-26 (nach der fremden Abnahme)

| Punkt | Behoben |
|---|---|
| M1 Beantwortete Zeilen im Drawer per Tastatur nicht erreichbar; Tab lief aus dem Drawer | Ursache im Primitive: `TABBABLE` (`primitives/focus.ts`) kannte kein `summary`, und der Sichtbarkeitsfilter über `offsetParent` hielt Inhalte eines zugeklappten `<details>` für erreichbar. Jetzt `summary` in der Liste und `el.checkVisibility()` (Rückfall `offsetParent`). Gilt für Drawer **und** Dialog. Gemessen: Tab kreist im Drawer über die drei offenen Zeilen, die drei Aufklapper und „Schließen", nie hinaus |
| M2 Eine Auflösung stand als Antwort da | neues Feld `ClarificationVM.resolution?: string \| null`; die Zeile sagt dann „Ohne Antwort aufgelöst: {Grund}" — das Wort, das die aufgeklappte Karte im Verlauf zeigt, jetzt einmal als `RESOLVED_WORD` in `Clarification.tsx` für beide. `answer` trägt nur noch Option oder Freitext. L-367 entsprechend geteilt |
| Hinweis: zwei Fluchten im Drawer | in einer Liste mit aufklappbaren **und** flachen Zeilen beginnt der Text der flachen hinter dem Chevron (gemessen: alle Zeilen bei 571 px, Gruppenköpfe bei 557) |
| Hinweis: Zählung im Drawer-Kopf als Literal | Story baut sie aus den Registry-Wörtern |
| Hinweis: Story-Tabelle „Frage 4 von 9" | korrigiert; was der Pager zählt, steht in der Zeile der Story |
| Hinweis: 32 statt 24 px nach dem Rückweg | Text oben korrigiert (der Rückweg bringt seinen Abstand mit) |
| Hinweis: Lesekarte im Aufklapper wiederholt Titel und Badge | offen gelassen: das ist die volle Karte `mode="read"`, wie in jeder `renderDetail`-Liste (`WithCard`); eine schlankere Lesekarte wäre eine eigene Form |
| Hinweis: `href` über dem Überzug ohne Story | offen gelassen: dieselbe Regel wie in Tabellenzeilen (I11), dort gemessen |

Schnittstelle neu: `ClarificationVM.resolution` (Tabelle oben gilt sinngemäß
wie `answer`). Status: zurück auf Abnahme.

### Nachprüfung 2026-10-26

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung — hat weder gebaut noch
nachgebessert noch die erste Abnahme geschrieben). Stand `7afec27`
(Nachbesserung auf `f0992f9`), Arbeitsbaum zu Beginn sauber. Gelesen:
`CLAUDE.md`, Skill `v3-komponente` (Abnahme), §9 der Guideline, diese Spec
ganz samt Abnahme und Nachbesserung, `git diff f0992f9 7afec27 -- src/`
(`focus.ts`, `Clarification.tsx`, `ClarificationCard.tsx`,
`Clarification.stories.tsx`, `v3.css`), dazu `Drawer.tsx`, `Dialog.tsx`,
`ClarificationThread.tsx`, L-367 (`befunde-app.md:182`),
`docs/entitaeten/clarification.md:50–57` und die Achse `clarification` im
Spiegel.

Gemessen mit `scripts/cdp.mjs` (chrome-headless-shell aus Playwright 1247),
die Messläufe nacheinander mit je einem Browser, Fenster 1042 × 1000,
Querlauf bei 1280 und 1480; Tastatur mit echten Tastendrücken
(`Input.dispatchKeyEvent`: Tab, Umschalt+Tab, Enter mit Wagenrücklauf,
Leertaste, Esc), Klicks mit echten Mausereignissen. Gegenprobe: `9901556` in
einem Worktree im Scratchpad und `7afec27` je statisch gebaut
(`pnpm build -o`), beide lokal ausgeliefert, dieselben Abläufe gegen beide
und gegen den Dev-Server 6107; Worktree danach entfernt. Befehle selbst
gelaufen. Bildschirmfotos `.playwright-mcp/0224-nachpruefung-drawer-tab-summary.png`,
`…-drawer-resolved-open.png`, `…-by-state.png`,
`…-statusinfodialog-technisch.png`.

| Punkt | Nachweis (Story-ID · Befehl · Messwert · Datei:Zeile) | Ergebnis |
|---|---|---|
| M1 · Tab und Umschalt+Tab im Drawer | `clarificationrow--in-batch-review-drawer`, Drawer per Enter auf „3 Fragen bei Ludwig", Fokus auf dem Panel. 9 × Tab: Schließen → drei offene Zeilen (Knopf) → drei beantwortete (`summary` 2026-0176, -0157, -0122) → Schließen → …; 9 × Umschalt+Tab vom Panel: -0122 → -0157 → -0176 → drei offene → Schließen → -0122 …. Jeder Halt im Panel, nie `body`. Fokusring am Kopf 2 px `rgb(59, 143, 196)`, Versatz −2 px, `:focus-visible`, Kasten 481 × 134 ganz in `.v2drawer__b` (oben 514, der Drawer-Kopf endet bei 77) — nicht verdeckt (`…-drawer-tab-summary.png`). In `9901556` derselbe Ablauf: Tab kreist „Schließen → drei offene Zeilen", die Köpfe fehlen | ✓ |
| M1 · Aufklapper per Taste und per Klick | Enter auf dem Kopf -0176 klappt auf, Leertaste auf und zu; Tab läuft danach weiter über -0157, -0122, Schließen. Klick auf -0122 (letzter Halt): klappt auf, Fokus auf dem Kopf, 9 × Tab Schließen → … → -0122 → Schließen. Zweiter Klick klappt zu, Fokus bleibt, Tab → Schließen. Klick auf -0157, 12 × Umschalt+Tab: -0176 → drei offene → Schließen → -0122 → -0157 …. Nichts läuft hinaus; Esc schließt, Fokus auf „3 Fragen bei Ludwig" | ✓ |
| M1 · Gegenprobe am Primitive: die Falle wie vorher | 21 Abläufe in `9901556` und `7afec27` (Auslöser fokussiert und per Enter geöffnet bzw. offen geladen; erster Fokus; nach frischem Öffnen je Halte + 3 × Tab und × Umschalt+Tab). **Zeichengleich in 19:** `dialog--confirmation`, `--with-reason`, `--large`, `--enter-confirms`, `--auto-focus-child` (erster Fokus im Suchfeld), `--keyboard-trap` (Schließen → Textfeld → Abbrechen → Weiter → Schließen, rückwärts gespiegelt), `drawer--open`, `--with-footer`, `--full-view`, `--footer-from-body`, `--long-content`, `--in-use`, `reasondialog--open`, `clarificationcard--step` mit dem Zurückstellen-Dialog (erster Fokus Begründung; Halte Schließen · Datum · drei Chips · Begründung · Abbrechen — der gesperrte Bestätigen-Knopf fehlt wie vorher) und mit „Anderweitig geklärt", `clarificationcard--deferred-with-undo` („Anderweitig geklärt"), `accountdrawer--opened`, `casedrawer--filled`, `sourcedocumentdrawer--opened`: erster Halt, Folge und Wendepunkte gleich, nie `body`, nie hinter dem Schleier; Dev-Server und statischer Bau gleich. **Anders in 2, beide gewollt:** die M1-Story und `statusinfodialog--entry` — dort war der Aufklapper „Technisch" (letzter Halt) in `9901556` unerreichbar (Tab von „Zurückgezogen" sprang auf Schließen), jetzt Halt 8; per Enter aufgeklappt kreist Tab weiter im Dialog (`…-statusinfodialog-technisch.png`). Sonst unterscheidet sich der neue Filter (`focus.ts:31–33`, `:48`) vom alten nur bei `position: fixed` (früher ohne `offsetParent`, jetzt gezählt) — in keinem Overlay vorhanden | ✓ |
| M2 · Zeile | `clarificationrow--by-state`: „Antwort: Ohne Umsatzsteuer …", „Antwort: Betrieblich: …" (gekürzt, `scrollWidth > clientWidth`) und „Ohne Antwort aufgelöst: telefonisch mit dem Mandanten geklärt" (`title` = Grund, Wort `rgb(92, 92, 92)` wie „Antwort:"), je 20,9 px, eine Zeile; vor der Auflösung kein „Antwort:". `resolution` geht vor `answer` (`Clarification.tsx:220–227`); Frage `b6` trägt den Grund ohne Vorsatz (`Clarification.stories.tsx:328`) (`…-by-state.png`) | ✓ |
| M2 · Karte im Drawer | Klick auf -0122: Zeile „Ohne Antwort aufgelöst: telefonisch …"; Verlauf „Gefragt von Ludwig · 09.10.2026, 18:40" und „Ohne Antwort aufgelöst von S. Vogt · 26.10.2026, 10:03 — telefonisch mit dem Mandanten geklärt"; „Antwort:" kommt im Aufklapper nicht vor (`…-drawer-resolved-open.png`) | ✓ |
| M2 · eine Quelle | `RESOLVED_WORD` (`Clarification.tsx:93`) ist in `src/ui/v3` der einzige Ort des Worts; die Zeile (`:222`) und `EVENT_LABEL.resolved` der Karte (`ClarificationCard.tsx:65`) lesen ihn. Für Zeile und Karte erfüllt; die dritte Darstellung der Familie sagt es anders (Hinweis 1) | ✓ (mit Hinweis) |
| Textflucht im Drawer | alle sieben Zeilen (drei offene, drei aufklappbare, Notiz) beginnen bei x 571, die Titel ebenso; Text der Gruppenköpfe bei 557 — wie angegeben. Die Regel greift nur in Listen mit Aufklapper **und** flachen Zeilen (`v3.css:3110`). Gegenprobe: 177 Stories der Dateien, die `ClarificationList`/`ClarificationRow` zeigen, in `9901556` und `7afec27` — 21 mit Liste beim Laden, Lage und Maß jeder Zeile gleich, keine gemischte Liste außer der im Drawer; `ByState` (ohne Aufklapper) unverändert bei x 33 | ✓ |
| Registry-Wörter der Zählung | Drawer-Meta aus `resolveStatus("clarification", st).label`, klein (`Clarification.stories.tsx:418–421`), gemessen „2 offen · 1 zurückgestellt · 3 beantwortet" (Registry „Offen", „Zurückgestellt", „Beantwortet"). Die Unterzeile von `ByState` steht weiter als Literal (`:359`) — Hinweis 5 der Abnahme zur Hälfte (Hinweis 2) | ✓ (Drawer) · teilweise |
| Story-Text „Frage 4 von 9" | Story-Tabelle (`:134`) sagt „Frage 1 von 3 (gezählt werden die offenen und zurückgestellten Fragen, die der Ablauf durchgeht)", die Story zeigt „Frage 1 von 3" | ✓ |
| 32 statt 24 px nach dem Rückweg | „Gebaut" (`:213`) sagt jetzt „24 px nach dem Pfeil, 32 px nach dem Rückweg"; `RecordPager.tsx`, `RecordPager.stories.tsx` und die Pager-Regeln in `v3.css` seit `8280d42` unverändert (`git diff 8280d42 7afec27`), das Maß der Abnahme gilt | ✓ |
| Lesekarte wiederholt Titel und Badge; `href` über dem Überzug ohne Story — beide offen gelassen | Begründungen tragen: dieselbe volle Karte wie in `WithCard`, eine schlankere wäre eine neue Form; die `href`-Regel ist die der Tabellenzeilen (I11, `v3.css:3105`), weiter ohne Story nicht messbar | ✓ (offen, begründet) |
| Kriterium „Im Einsatz" (`InBatchReviewDrawer`) | Enter auf dem Knopf öffnet (`md`, 521 px, Fokus auf dem Panel, aktuelle Frage markiert); Enter auf der zweiten offenen Zeile → „Frage 2 von 3", Drawer zu, Fokus auf „3 Fragen bei Ludwig", nächster Tab ins Antwortfeld; Klick auf die Meta-Zeile der zurückgestellten → „Frage 3 von 3", Drawer zu; beantwortete klappen lesend auf; Esc schließt. Die Tastatur erreicht jetzt jede Zeile (M1) | ✓ |
| Kriterium „Prüfliste §9" | was M1/M2 offen ließen, ist zu (Tastaturweg zu jeder Zeile, keine Falle; Auflösung benannt); die Nachbesserung bricht keinen Punkt: Maß der Flucht in `v3.css` (kein px in TSX), Fokusring ≥ 3:1 wie gemessen, Hover nur an Klickzielen (`summary`), Text links, Schrift aus der Skala (`check:type`) | ✓ |
| Kriterium „`answer`" | nur Antworten tragen „Antwort:", die lange gekürzt mit ganzem Text im `title`, ohne `answer` und ohne `resolution` keine Zeile (Notiz, offene Fragen) | ✓ |
| Kriterium „Vorhandene Stories unverändert" | Geometrie der 21 Listen gleich (s. Textflucht), Fokusfolge der 19 Overlays gleich (s. Gegenprobe) | ✓ |
| Zusatz: Auflösung ohne Antwort benannt | s. M2 · Zeile, Karte, eine Quelle | ✓ |
| Zusatz: Schnittstelle Zeichen für Zeichen | s. M3 | ✗ |
| Befehle | `typecheck` Exit 0; `check:type`, `check:language`, `check:when`, `check:icons`, `check:contrast` Exit 0, je `--test` Exit 0; `check:classes` Exit 1 nur mit den vier Altfällen (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), `--test` Exit 0; `pnpm build -o` ins Scratchpad Exit 0 (nur die Chunk-Warnung), Index mit `--by-state` und `--in-batch-review-drawer`. Konsole von `ByState`, `InBatchReviewDrawer`, `WithActions`, `statusinfodialog--entry`, `dialog--keyboard-trap`, `drawer--open` ohne Meldung (nur Vite- und DevTools-Info) | ✓ |
| Zusatz: keine echten Daten | Datenprobe über die Diffs (`9901556..HEAD`): leer | ✓ |

#### Mängel

3. **Spec und Code sagen bei der Auflösung Verschiedenes.** Der Code trägt
   den Grund in `resolution` und in `answer` nur Option oder Freitext
   (`Clarification.tsx:74–86`). Die Spec sagt es noch anders: die Tabelle
   `ClarificationVM` (`:62`) lässt `answer` „bei „anderweitig geklärt" der
   Grund" tragen und hat keine Zeile `resolution`; „Die Zeile mit Antwort"
   (`:79–81`) kennt nur „Antwort: {answer}"; „Befunde an die App"
   (`:153–157`) sagt „die Zeile sagt dann „Anderweitig geklärt: …"". Die
   Nachbesserung verweist nur mit einem Satz darauf (`:398`); L-367
   (`befunde-app.md:182`) ist richtig. Folge: wer nach der Spec einbaut
   (llcto), legt den Grund in `answer` und hat M2 in der App zurück.
   Verletzt „Die Spec stimmt mit dem Code überein — Prop-Tabelle Zeichen für
   Zeichen, und die Sätze daneben" (`CLAUDE.md` §4). Vorschlag, nur Text:
   in die Tabelle die Zeile `resolution` · `string | null` (optional) ·
   „der Grund einer Auflösung ohne Antwort; gesetzt, sagt die Zeile „Ohne
   Antwort aufgelöst: {resolution}" statt „Antwort: …"" · `ClarificationRow/ByState`;
   aus `answer` den Halbsatz zur Auflösung streichen; „Die Zeile mit Antwort"
   um den Vorrang von `resolution` ergänzen; in „Befunde an die App" Wort und
   Feld wie in L-367.

#### Hinweise (nicht blockierend)

1. **Ein drittes Wort in der Familie.** `ClarificationThread.tsx:38–42`
   benennt dasselbe Ereignis `resolved` in einer eigenen Wortliste
   „Anderweitig geklärt" (und `answered` „Antwort", wo die Karte
   „Beantwortet" sagt). Das stammt aus 0214, nicht aus 0224 — „die eine
   Quelle" gilt damit für Zeile und Karte, nicht für die Familie Klärung.
   Vorschlag: `STEP.resolved` liest `RESOLVED_WORD`; soll stattdessen
   „Anderweitig geklärt" gelten, entscheidet das der Owner. Der Knopf
   „Anderweitig geklärt" im Schritt ist die Handlung, nicht ihr Ergebnis,
   und bleibt davon unberührt.
2. **Zählung in `ByState` weiter Literal** (`Clarification.stories.tsx:359`);
   die Drawer-Meta (`:418–421`) zeigt, wie es aus der Registry geht.
3. **Feldname `resolution`.** In der Tabelle heißt `resolution` die Art der
   Auflösung (`answered` | `obsolete`, `docs/entitaeten/clarification.md:50–57`),
   am VM ist es der Grund als Text. Beim Einbau leicht verwechselt. Solange
   es keinen Aufrufer gibt: L-367 sagt, woher der Text kommt (Begründung der
   Auflösung; bei `obsolete` der Marker in `answer_payload`), oder das Feld
   heißt `resolutionReason`.
4. **„Beantwortet" über „Ohne Antwort aufgelöst".** Gruppe und Badge der
   Lesekarte sagen „Beantwortet", die Zeile darunter „Ohne Antwort
   aufgelöst". Die Registry deckt es („Beantwortet oder als gegenstandslos
   aufgelöst"); ein eigenes Gruppenwort wäre ein neues Label (Owner). Beim
   ersten Einsatz beobachten wie Hinweis 7 der Abnahme.
5. **Maß der Flucht doppelt.** `calc(2 * var(--space-2) + 14px)`
   (`v3.css:3110`) wiederholt die Chevron-Größe aus `Disclosure.tsx:54`
   (`size={14}`) und Polster und Abstand des Kopfs; ändert sich eins, laufen
   die Zeilen wieder auseinander. Ein Maß am `.v2disc` für beide hielte sie
   zusammen.
6. **Meta-Zeile bricht bei 1042.** Im Drawer (521 px) bricht die Meta-Zeile
   der zurückgestellten optionalen Frage: „optional" steht allein in der
   zweiten Zeile, der Trennpunkt am Ende der ersten (Breite 435 px; in
   `9901556` 449 px mit demselben Umbruch — nicht aus der Nachbesserung). Bei
   1280 und 1480 eine Zeile (Drawer 640 bzw. 740 px).
7. **Dieselbe Fehlerklasse wie M1.** `TABBABLE` (`focus.ts:23–24`) kennt
   kein `iframe`, kein `audio[controls]`/`video[controls]`, kein
   `[contenteditable]`. In `sourcedocumentdrawer--opened` ist die Vorschau
   (`iframe`) ein nativer Halt zwischen Schließen und „Vollansicht öffnen"
   und deshalb harmlos; stünde sie zuletzt, liefe Tab aus dem Drawer.
   Unverändert gegen `9901556`.

Aus der Abnahme bleiben offen: Hinweise 2 und 6 (begründet offen gelassen)
und 7 (Owner).

Vier Linsen: **Sprache** — die Auflösung heißt in Zeile und Verlauf „Ohne
Antwort aufgelöst", aus einer Konstante; „Antwort:" steht nur noch vor
Antworten; die Zählung im Drawer kommt aus der Registry. Aber die Spec sagt
noch „Anderweitig geklärt" und legt den Grund in `answer` (M3) ✗; der Thread
spricht ein drittes Wort (Hinweis 1). **Bedienung** — Tab und Umschalt+Tab
erreichen jede Zeile in Lesefolge, Enter und Leertaste klappen, vom
geklickten Kopf läuft nichts hinaus, Esc schließt und gibt den Fokus zurück,
der Fokusring ist nicht verdeckt; die Gegenprobe an 19 Overlays zeigt die
Falle unverändert, ein zweiter Fund derselben Ursache („Technisch") ist
mitbehoben ✓. **Logik** — Antwort und Auflösung haben je ein Feld,
`resolution` geht vor; die Gruppe folgt weiter dem Stand ✓ (Namensnähe zur
Tabellenspalte, Hinweis 3). **Darstellung** — eine Flucht für flache und
aufklappbare Zeilen, das Wort der Auflösung grau wie „Antwort:", eine Zeile;
keine Verschiebung in den übrigen 21 Listen ✓.

Vier-Wochen-Test: weiter bestanden; eine aufgelöste Frage liest man jetzt
richtig, ohne die Karte zu öffnen.

Abgenommen von / am: Claude (Nachprüfung, fremde Sitzung), 2026-10-26, Stand
`7afec27` · **Nicht abgenommen.** M1 und M2 behoben; offen: Mangel 3 (nur
Spec-Text, kein Code), Hinweise 1–7 dieser Nachprüfung, aus der Abnahme
Hinweise 2, 6 und 7; Knopf und Drawer im Rückfragen-Schritt sowie L-367 offen
(App).

## Nachbesserung 2 2026-10-26 (nach der Nachprüfung)

| Punkt | Behoben |
|---|---|
| M3 Spec widersprach dem Code beim Grund einer Auflösung | Schnittstellentabelle `ClarificationVM` mit eigener Zeile, Absatz „Die Zeile mit Antwort" und „Befunde an die App" (L-367) nachgezogen |
| Hinweis 3: `resolution` verwechselbar mit der Spalte (Art der Auflösung) | Feld heißt jetzt **`resolutionReason`** — noch kein Aufrufer, nichts gepusht |
| Hinweis 2: Zählung in `ByState` als Literal | aus den Registry-Wörtern gebaut, wie im Drawer |
| Hinweis 1: `ClarificationThread` sagt „Anderweitig geklärt" | Wortfrage an llcto/Owner (drei Wortlaute für dieselbe Auflösung: Knopf „Anderweitig geklärt", Verlauf „Ohne Antwort aufgelöst", Faden „Anderweitig geklärt") — bis zur Antwort unverändert |
| Hinweis 5: `14px` der Textflucht wiederholt die Chevron-Größe | bleibt mit Kommentar; die Chevron-Größe ist eine TSX-Prop von `Disclosure`, kein Token. Ändert sie sich, wandert diese Regel mit (Kommentar in `v3.css` nennt den Bezug) |
| Hinweise 4, 6, 7 | 4 Owner-Wort (Gruppe „Beantwortet" folgt der Registry); 6 vorbestehend, bei 1280 px eine Zeile; 7 `iframe`/`contenteditable` in `TABBABLE`: bewusst nicht — in ein `iframe` hinein lässt sich Tab nicht fangen, der Fokus käme nicht zurück; heute kein Fall |

Status: Abnahme — Nachprüfung nur noch für M3 (Text) und die Umbenennung.

## Nachtrag 2026-10-26 — ein Wort für die Auflösung (llcto, Owner-Linie)

Entschieden (llcto, „ein Wort für eine Sache"): das Ereignis heißt überall
**„Anderweitig geklärt"** — Knopf, Kartenverlauf, Listenzeile, Faden.
„Ohne Antwort aufgelöst" entfällt. `RESOLVED_WORD` (`Clarification.tsx`)
trägt jetzt dieses Wort und ist die eine Quelle für den Knopf der Karte, den
Verlauf der Karte, die Zeile der Liste und den Faden (`ClarificationThread`).
Die Zeile lautet „Anderweitig geklärt: {Grund}". Auch der Dialog folgt
(llcto: „auflösen" las sich wie ein anderer Vorgang): Titel „Anderweitig
geklärt" (`RESOLVED_WORD`), Einordnung „Die Frage zählt danach als
beantwortet" (die Folge, in der Form des Zurückstellen-Dialogs, mit dem
Registry-Wort), Feld „Wie wurde das geklärt?" (Pflicht wie bisher), Knopf
„Als geklärt vermerken" — nicht „… schließen", das läge am „Schließen" des
Dialogs.

### Nachprüfung 2026-10-27 (fremd)

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung — hat weder gebaut noch
nachgebessert noch eine frühere Abnahme geschrieben). Stand `6c01caf`
(Nachbesserung 2 `c464f6c`, Nachträge `7225f13` und `6c01caf`); im
Arbeitsbaum liegt fremde, nicht gestagte Arbeit an 0225, an den geprüften
Dateien nichts. Gelesen: `git show` der drei Commits, diese Spec ganz,
`Clarification.tsx`, `ClarificationCard.tsx` (Wege, `EVENT_LABEL`, beide
`ReasonDialog`), `ClarificationThread.tsx`, `ReasonDialog.tsx`, L-367.
Gemessen mit `scripts/cdp.mjs` (chrome-headless-shell aus Playwright 1247) am
Dev-Server 6107, Fenster 1042 × 1000, echte Klicks und Tasten; dazu eine
Textsuche im gerenderten Text von 216 Stories (Klärung, Sachverhalt, Stapel,
`ChoicePrompt`). Bildschirmfotos `.playwright-mcp/0224-nachpruefung2-dialog.png`,
`…-drawer-resolved.png`.

| Punkt | Nachweis (Story-ID · Befehl · Messwert · Datei:Zeile) | Ergebnis |
|---|---|---|
| 1 · M3: Spec-Text und Prop-Tabellen gegen den Code | `actions?: ReactNode` (`RecordPager.tsx:41`); `answer?: string \| null` (`Clarification.tsx:79`), `resolutionReason?: string \| null` (`:88`); `groupBy?: "audience" \| "none" \| "state"` Vorgabe `"none"` (`:310`), `onOpen?: (c: ClarificationVM) => void` (`:340`), `activeId?: string \| null` (`:316`); `ClarificationRow.onOpen?: () => void` (`:176`), `hideBadges?: boolean` (`:161`) — Zeichen für Zeichen wie die Tabellen. Die Sätze: `answer` ohne den Halbsatz zur Auflösung; „Die Zeile mit Antwort" nennt Vorrang und Wort wie der Code (`:223–231`); „Befunde an die App" und L-367 (`befunde-app.md:182`) nennen dasselbe Feld und dasselbe Wort | ✓ (Hinweis 1) |
| 2 · Umbenennung `resolution` → `resolutionReason` | `grep -rnw resolution src/ docs/` ohne Spiegel: am VM, in der Zeile und in den Stories nur noch `resolutionReason` (`Clarification.tsx:88`, `:223–225`; `Clarification.stories.tsx:328`, `:448`). `resolution` steht noch als englisches Wort bzw. Spaltenname in Kommentaren (`Clarification.tsx:82`, `:85`; `ClarificationThread.tsx:44`, `:78`), an `Expectation` (andere Entität) und in den datierten Abschnitten dieser Spec (Abnahme M2, Nachbesserung, Nachprüfung 2026-10-26) — Protokoll, bleibt. L-367: Feld `resolutionReason`, Abgrenzung zur Spalte, Wort „Anderweitig geklärt"; im Arbeitsbaum gleich `HEAD` | ✓ |
| 3 · Ein Wort, eine Quelle | `RESOLVED_WORD` (`Clarification.tsx:96`) lesen Knopf (`ClarificationCard.tsx:909`), Kartenverlauf (`:65`), Dialogtitel (`:1293`), Zeile (`Clarification.tsx:225`) und Faden (`ClarificationThread.tsx:40`). Gemessen: `clarificationrow--by-state` „Anderweitig geklärt: telefonisch mit dem Mandanten geklärt", Wort `rgb(92, 92, 92)` wie „Antwort:", 20,9 px, `title` = Grund; Unterzeile jetzt aus der Registry („2 offen · 1 zurückgestellt · 3 beantwortet"). `…--in-batch-review-drawer`, Aufklapper -0122: dieselbe Zeile, im Verlauf „Anderweitig geklärt von {Person} · 26.10.2026, 10:03" (`…-drawer-resolved.png`). Knopf im Schritt 119 × 24 px; Dialogkopf `h2` „Anderweitig geklärt" = `aria-labelledby`. Das Badge trägt den Stand „Beantwortet", nicht das Ereignis — dazu passt die Einordnung des Dialogs. Textsuche nach „aufgelöst · auflös · Ohne Antwort": in den Texten der Bausteine kein Treffer (nur „ohne Antwort" im Sinn von „optional", aus der Registry); übrig in drei Story-Texten (M4). `onResolve`, `resolving`, `resolveButton` bleiben als Bezeichner | ✓ Bausteine · ✗ Stories (M4) |
| 4 · Dialog nach den Hausregeln | `clarificationcard--step`, Klick auf „Anderweitig geklärt": Einordnung „Die Frage zählt danach als beantwortet" über dem Titel, Feld „Wie wurde das geklärt?" mit drei Chips, „Abbrechen" (sekundär) und „Als geklärt vermerken" (primär, 167,9 × 30,2 px) (`…-dialog.png`). Der Primärknopf nennt die Folge, kein „OK", kein Ausrufezeichen, keine Anrede, nichts in Versalien; dieselbe Form wie der Geschwister-Dialog „Zurückstellen" (Titel = Wort des Wegs, Einordnung = Folge). Erster Fokus im Textfeld; Primärknopf gesperrt, bis ein Grund steht; der Chip „telefonisch geklärt" füllt und entsperrt; Esc schließt ohne zu speichern, Fokus zurück auf „Anderweitig geklärt"; Bestätigen meldet den Grund (`clarificationcard--answering`) | ✓ |
| 5 · Befehle | `pnpm typecheck` Exit 0; `pnpm check:language` Exit 0 („0 German comment lines left in 0 files"), beide über den Arbeitsbaum samt der fremden 0225-Arbeit | ✓ |

#### Mängel

4. **Das alte Verb in Story-Texten der Karte.** `ClarificationCard.stories.tsx:167`
   und `:243` melden den Rundlauf als „Aufgelöst: {Grund}" (gemessen nach
   „Als geklärt vermerken": „· Aufgelöst: telefonisch geklärt"); `:355`
   gibt der Story `History` die Unterzeile „gestellt · beantwortet ·
   aufgelöst, je mit Person und Datum" — direkt über einem Verlauf, der
   „Gefragt" und „Anderweitig geklärt" sagt. Der Nachtrag sagt „überall",
   und die Stories sind das Vorbild für den Einbau. Nur Story-Text, kein
   Baustein-Code. Vorschlag: im Rundlauf `${RESOLVED_WORD}: ${reason}`; die
   Unterzeile „gefragt · beantwortet · anderweitig geklärt, je mit Person und
   Datum".

#### Hinweise (nicht blockierend)

1. **Die Tabelle beschreibt mit dem alten Wort.** Die Zeile `resolutionReason`
   (`:63`) hebt „**ohne Antwort aufgelöst**" fett hervor — genau den
   Wortlaut, der entfallen ist. Als Beschreibung nicht falsch; ruhiger wäre
   „der Grund, wenn die Frage anderweitig geklärt wurde, ohne Antwort der
   Gefragten".
2. **Die Registry sagt noch „aufgelöst".** `clarification.answered` hat die
   Beschreibung „Beantwortet oder als gegenstandslos aufgelöst."
   (`src/ludwig/ui/status/status-registry.ts:947`, Spiegel). In den Flächen
   von 0224 unsichtbar (alle Badges `info={false}`), überall, wo das (i) der
   Achse steht, aber sichtbar. Wortlaut der App-Registry: Befund an die App,
   falls gewünscht.
3. **Eine Abschrift des Worts.** `ChoicePrompt.stories.tsx:208` schreibt
   „Anderweitig geklärt" als Literal — eine Pattern-Story darf die Entität
   nicht importieren, folgt einer künftigen Änderung aber nicht.
4. **Faden nicht messbar.** Keine Story von `ClarificationThread` hat ein
   Ereignis `resolved`; dass der Faden „Anderweitig geklärt" sagt, steht nur
   im Code (`ClarificationThread.tsx:40`).
5. **„geklärt" zweimal.** Die Chips heißen „telefonisch geklärt" und „per
   Mail geklärt"; eine so begründete Zeile liest sich „Anderweitig geklärt:
   telefonisch geklärt". Wortfrage, beim ersten Einsatz beobachten.

Vier Linsen: **Sprache** — ein Wort für das Ereignis in Knopf, Dialog,
Verlauf, Zeile und Faden, aus einer Konstante; der Dialog nennt die Folge im
Knopf; drei Story-Texte sprechen noch das alte Verb (M4) ✗. **Bedienung** —
Dialog: Fokus ins Feld, Sperre bis zum Grund, Esc ohne Speichern mit Fokus
zurück, Ziele ≥ 24 px ✓. **Logik** — Grund und Antwort haben je ein Feld,
der Name trennt den Grund von der Spalte, der Grund geht vor; die
Einordnung erklärt, warum die Frage danach unter „Beantwortet" steht ✓.
**Darstellung** — unverändert gegen die Nachprüfung 2026-10-26, das Wort
grau wie „Antwort:", eine Zeile ✓.

Vier-Wochen-Test: bestanden; wer den Weg „Anderweitig geklärt" nimmt,
findet dasselbe Wort im Dialog, in der Zeile und im Verlauf wieder.

Abgenommen von / am: Claude (Nachprüfung, fremde Sitzung), 2026-10-27, Stand
`6c01caf` · **Abgenommen mit Auflage M4** (drei Story-Texte, kein
Baustein-Code). M3 und die Umbenennung erledigt. Offen: Hinweise 1–5 dieser
Nachprüfung; aus den früheren Prüfungen die begründet offen gelassenen und
die Owner-Hinweise; Knopf und Drawer im Rückfragen-Schritt sowie L-367 (App).

### Nachbesserung 3 (2026-10-27)

| Punkt | Behoben | Wo |
|---|---|---|
| M4 Das alte Verb in Story-Texten | Rundlauf meldet `${RESOLVED_WORD}: ${reason}`, Unterzeile von `History` „gefragt · beantwortet · anderweitig geklärt, je mit Person und Datum" | `ClarificationCard.stories.tsx` |
| Hinweis 1 Tabelle mit dem alten Wort | Zeile `resolutionReason`: „der Grund, wenn die Frage **anderweitig geklärt** wurde, ohne Antwort" | diese Spec, Schnittstelle |
| Hinweise 2–5 | bleiben offen wie begründet: 2 ist Wortlaut der App-Registry (an llcto), 3 darf die Entität nicht importieren, 4 und 5 beim ersten Einsatz beobachten | — |

Damit ist die Auflage erfüllt; Status `fertig`. Offen bleiben die App-Punkte (Knopf und Drawer im Rückfragen-Schritt, L-367).
