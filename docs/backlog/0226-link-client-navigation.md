# 0226 · Link: Navigation in der App über `next/link`

| | |
|---|---|
| Status | fertig 2026-10-27 (M1 Spec-Text behoben, H1/H3/H5 aufgenommen, s. „Nachbesserung") · vorher: in Arbeit — nicht abgenommen 2026-10-27 (fremde Abnahme, Stand `49ed3b6`; Mangel M1, nur Spec-Text) · vorher: Abnahme |
| Stufe | `primitives/` (`Link.tsx`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, ein Link ohne Fachwort. |
| Quelle | llcto 2026-10-27, Staging-Analyse vom 26.10.: Jeder Klick in der StepRail-Leiste und in Listen lud die ganze Seite neu, samt aller Layouts und Login-Prüfung, auf Staging jedes Mal Sekunden. Die App liefert dazu `loading.tsx` für die Abnahme (F564) |
| Ersetzt | das reine `<a>` in `Link.tsx` und 12 rohe `<a>` in Set und Showcase, die an `Link` vorbeiführten |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Ein Klick auf einen Schritt der Abnahme oder auf eine Zeile soll die Seite
wechseln, ohne sie neu zu laden. Next lädt dann nur das, was sich ändert, und
zeigt bis dahin das Skelett aus `loading.tsx`.

## Einordnung

- **Wiederverwenden:** `Link` ist der eine Weg zu einer URL im Set (`Button`,
  `TextButton`, `DataTable`, `StepRail`, `NavList` und `RecordPager` rendern über
  ihn). Der Kommentar dort sah die Umstellung vor: „when the app needs client-side
  navigation, only this file switches to `next/link`".
- **Erweitert, weil:** §3 Regel 2. Eine Prop (`prefetch`) und ein Verhalten.
- **Zuschnitt:** eine Datei. Dazu stellt der Schritt die rohen `<a>` mit
  Navigationsziel auf `Link` um (Klärung: Zelle, Zeile, „zurückgestellt von";
  Beleg: Zelle, „Zum Buchungsstapel", Sachverhalt, Mutterbeleg in Fakten und
  Vorschau, Geschäftspartner; `PeriodJump`;
  zwei Showcase-Seiten). Ohne das bliebe der Klick in Beleg- und Klärungslisten
  ein Neuladen.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `href` | `string` | ja | wie bisher | `Kinds` |
| `prefetch` | `LinkProps["prefetch"]` (`boolean \| "auto" \| null`), Vorgabe `false` | nein | Vorladen durch Next, nur in Produktion. `false`: nie, weder beim Sichtbarwerden noch beim Zeigen. `"auto"`: dynamische Seiten bis zum nächsten `loading.tsx` | `StepRail` setzt `"auto"` |
| übrige | `AnchorHTMLAttributes<HTMLAnchorElement>`, `ref` | nein | wie bisher | `Kinds` |

**Welches Ziel wie geht:**

- `next/link`: ein Pfad in der App (`/…`, nicht `//…`) und eine Abfrage auf
  derselben Seite (`?…`).
- reines `<a>`: alles andere, nämlich eine andere Herkunft (auch `//…`),
  `mailto:`/`tel:`, `download`, ein `target` außer `_self` (auch `""`), ein
  reiner Anker `#…` und ein **relativer Pfad ohne Schrägstrich** (`cases/1`,
  `./x`, `../x`). Letzterer lädt die Seite voll neu: Aufrufer geben Pfade der
  App absolut an (H1). Den Anker
  springt der Browser selbst an, und die Seiten-Stories halten ihren Zustand im
  Hash.

**Vorladen:** Standardmäßig aus. Eine Liste mit 300 Zeilen würde sonst jede
sichtbare Zeile vorladen. Nur die festen, wenigen Wege laden vor: die Schritte
und die Schrittknöpfe der `StepRail` (`"auto"`, also bis zum `loading.tsx` der
App). Vorladen beim Zeigen gibt es nicht, weil es je Link Client-Zustand
bräuchte (siehe Ausbau).

**Kann bewusst nicht:** `Markdown` öffnet fremde Links in einem neuen Tab und
bleibt deshalb `<a>`. Downloads in `SourceDocumentPreview` bleiben `<a>`.

## Verhalten

Für Nutzer ändert sich nichts außer der Geschwindigkeit. Die Seite wechselt
ohne Neuladen, Zurück und Vor im Browser gehen wie bisher, Mittelklick und
Strg-Klick öffnen einen neuen Tab (das leistet `next/link`). `Link` bleibt eine
Server-Komponente: `next/link` lässt sich aus Server-Komponenten rendern. Im
Storybook ist der Router nachgebildet (`@storybook/nextjs-vite`), ein App-Pfad
navigiert dort nicht.

Zustände: keine eigenen; ein Link lädt nicht und hat keinen Leer- oder
Fehlerzustand.

## Stories

| Story | Beweist |
|---|---|
| `Kinds` | jede Art von Ziel und was sie rendert |

Weitere Stories sind nicht nötig: `prefetch` wirkt nur im Produktionsbau der
App, im Storybook ist es nicht sichtbar. Belegt wird es am Code (`StepRail.tsx`)
und in der App.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Vorladen beim Zeigen für lange Listen | `prefetch="hover"` (Client-Zustand je Link, Muster aus der Next-Doku) | eine Liste öffnet ihre Zeile spürbar langsam, obwohl `loading.tsx` steht |
| `typedRoutes` in der App | `href: Route` statt `string` (oder ein Cast an genau einer Stelle in `Link.tsx`) | die App schaltet `typedRoutes` wieder ein (heute auskommentiert, `apps/web/next.config.ts`); dann bricht `Link.tsx` den Typcheck (H5) |
| Seitengröße und Datumsformular ohne Neuladen | `PageSizeSelect` als Links je Größe, `PeriodJump`-Formular über `next/form` | Wunsch der App; beide laden heute voll neu, sind aber kein `<a>` (H2, an llcto) |

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

- [ ] Ein App-Pfad und eine Abfrage gehen über `next/link`, alles andere bleibt `<a>` (`Kinds`, Code)
- [ ] Ein Klick auf einen App-Pfad lädt das Dokument nicht neu (`RecordPager/Filled`, `NavList/Filled`)
- [ ] Ein Anker ändert weiter den Hash und bleibt im Dokument (`Seiten/Mandantenjahr`)
- [ ] `prefetch` ist ohne Angabe `false`, die `StepRail` setzt `"auto"` (Code)
- [ ] Im Set führt kein rohes `<a>` mit Navigationsziel mehr an `Link` vorbei, außer Markdown und Downloads (`grep`)
- [ ] Keine Konsolenfehler in den Stories mit Links (StepRail, Belegliste, Klärung, DataTable, NavList, RecordPager, CaseList, AgentRun)

## Abnahme

Gebaut und selbst gemessen, 2026-10-27 (fremde Abnahme steht aus):
- 12 Stories mit Links rendern ohne Konsolenfehler.
- Klick auf `/cases` in `RecordPager/Filled`: dasselbe Dokument (Marke am `window` erhalten).
- Klick auf `#master-data` in `Seiten/Mandantenjahr`: Der Hash wechselt, dasselbe Dokument.
- Rohe `<a>` im Set gibt es nur noch in `Markdown` (neuer Tab) und an den zwei Downloads in `SourceDocumentPreview`.

### Fremde Abnahme 2026-10-27

Schlanke Abnahme (Schnittstelle), dazu das Verhalten im Browser. Stand
`49ed3b6`, Arbeitsbaum zu Beginn sauber. Gelesen: `CLAUDE.md`, Skill
`v3-komponente` (Abnahme), §9 der Guideline, diese Spec, `git show 49ed3b6`,
`node_modules/next/dist/client/link.d.ts` und `app-dir/link.js` (Next 16.3.4)
sowie der Link-Nachbau von `@storybook/nextjs-vite` (`dist/export-mocks/link`).
Gemessen auf zwei Wegen:

- **Weiche:** `Link.tsx` mit esbuild übersetzt und in Node mit 28
  Prop-Kombinationen aufgerufen; gelesen wird der Typ des zurückgegebenen
  Elements (`next/link` oder `"a"`) und seine Props.
- **Browser:** `scripts/cdp.mjs` (chrome-headless-shell) am Dev-Server 6107, ein
  Browser für alle Messungen, 33 Stories, echte Mausklicks und Enter. Ob das
  Dokument neu lädt, zeigt eine Marke am `window`. Gegenprobe: Ein eingefügtes
  rohes `<a>` auf dieselbe iframe-Seite löscht die Marke, die Probe erkennt
  ein Neuladen also.

Befehle selbst gelaufen, außer `pnpm build` (Auftrag: im Arbeitsbaum wird
gemessen, nicht gebaut).

| Kriterium | Nachweis (Story-ID · Befehl · Datei:Zeile) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` nicht selbst gelaufen, vom Auftraggeber grün gemeldet. Dazu `check:when` Exit 0, `check:language` Exit 0 („0 German comment lines"), `check:classes` Exit 1 mit genau den vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`, keine neue | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `primitives/Link.tsx` und `primitives/Link.stories.tsx`; Titel `v3/Primitives/Navigation/Link`, in derselben Gruppe wie `NavList`, `RecordPager`, `PeriodJump` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `Link.tsx:4–22` englisch mit `@when`/`@instead`; Kommentar `StepRail.tsx:108–109` englisch; Story-Export `Kinds`, Felder `href`/`text`/`how`; Deutsch nur in sichtbaren Strings; `check:when` und `check:language` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Diff ohne Hex und px; Story-Rahmen mit `var(--space-4)` und `var(--space-2)`; kein Status im Baustein | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `v3-primitives-navigation-link--kinds` vorhanden. „Keine eigenen" Zustände und `prefetch` (wirkt nur im Produktionsbau) begründet. Deckung: `href` und übrige in `Kinds`, `prefetch` am Code (zu den Rändern der Story s. H3) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `primitives/`, Importe nur `next/link` und `react`, kein Fachmodul; kein Hex, kein px. Beide Zweige rendern ein `<a>` mit denselben Attributen, also bleiben Hover, Fokus und Trefferfläche wie bisher (Messung vertagt nach 0119, schlanke Abnahme). Texte der Story nach T1–T5 | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | 33 Stories geladen, jede mit Inhalt (Liste in der Zeile „Keine Konsolenfehler") | ✓ |
| Ein App-Pfad und eine Abfrage gehen über `next/link`, alles andere bleibt `<a>` | `…link--kinds`: Laut React-Fiber kommen `/…` und `?tab=open` aus `NextLink`, `#…`, `https://…`, `mailto:…`, `download` und `target="_blank"` aus `Link` als `<a>`. Ein Klick-Lauscher am `document` sieht `defaultPrevented` nur bei den ersten beiden. Node-Lauf über `Link.tsx`: `next/link` bei `/`, `/x?y=1#z`, `?x`, `download={false}`, `target="_self"`; `<a>` bei `//cdn…`, `#x`, `""`, `MAILTO:…`, `mailto:`, `tel:`, `https:`, `download` (true, `""`, Dateiname), `target` `_blank`/`_top`/`""`, `cases/1`, `./cases`, `../cases`, `" /x"`. `prefetch` kommt nie am `<a>` an, `ref` in beiden Zweigen | ✓ |
| Ein Klick auf einen App-Pfad lädt das Dokument nicht neu | `…recordpager--filled`: Mausklick auf `/cases`, Marke erhalten, URL gleich; Enter auf dem fokussierten Link ebenso. `…navlist--filled`: Klick auf den ersten App-Pfad, Marke erhalten. Gegenprobe mit rohem `<a>`: Marke weg | ✓ |
| Ein Anker ändert weiter den Hash und bleibt im Dokument | `seiten-mandantenjahr--normal`: Klick auf `#master-data` (als `<a>` gerendert), URL endet auf `#master-data`, Marke erhalten | ✓ |
| `prefetch` ist ohne Angabe `false`, die `StepRail` setzt `"auto"` | `Link.tsx:26` `prefetch = false`; im Node-Lauf ohne Angabe `prefetch: false` am `next/link`. `StepRail.tsx:111` (`RailRow`), `:151` (`BarStep`) und `:268` (`StepNav`, Schrittknöpfe) setzen `"auto"`; sonst nirgends `prefetch` im Set (`grep`). Typen gegen Next 16.3.4: `prefetch?: boolean \| 'auto' \| null` (`link.d.ts:59`), `ref` als `RefAttributes<HTMLAnchorElement>` (`:116`) | ✓ |
| Im Set führt kein rohes `<a>` mit Navigationsziel mehr an `Link` vorbei, außer Markdown und Downloads | `grep -rnE '<a[ >]' src/ui/v3 src/showcase` ohne Stories: nur `Markdown.tsx:213` (neuer Tab), `SourceDocumentPreview.tsx:132` und `:221` (`download`), dazu `Link.tsx:35` selbst. Wege ohne `<a>` s. H2 | ✓ |
| Keine Konsolenfehler in den Stories mit Links | 33 Stories, gezählt je Story `Runtime.exceptionThrown`, `console.error`/`console.warn` und `Log.entryAdded` (error, warning): 0. Darunter alle Gruppen der Spec: StepRail (`--bar`, `--with-tones-and-counters`, `--screen-header`), Belegliste `sourcedocumentlist--filled`, Klärung (`clarificationrow--filled`, `--in-batch-review-drawer`, `clarificationcard--deferred`, `--step-deferred-with-history`), `datatable--filled`, NavList (`--filled`, `--in-shell`), RecordPager (`--filled`, `--in-use`), `caselist--filled`, AgentRun (`--in-use`, `--cell`). Dazu `link--kinds`, PeriodJump (`--filled`, `--with-date-form`), Beleg (`sourcedocument--cell`, `--filled`, `--in-use`, `sourcedocumentfacts--filled`, `--group`, `sourcedocumentpreview--excerpt`, `--filled`), Saldenabgleich (`--s-1-fits`, `--s-13-mixed`), `mandantenjahr--normal`, `commandpalette--filled`, `stapelabnahme-schritt-0--done` | ✓ |
| Zusatz: `Link` bleibt in Server-Komponenten nutzbar | `Link.tsx` ohne `"use client"` und ohne Hook. `next/link` ist selbst Client-Komponente (`app-dir/link.js:1` `'use client'`, dazu `link.react-server.js`). Im Node-Lauf lässt sich `Link` als reine Funktion aufrufen | ✓ |
| Zusatz: umgestellte Stellen ohne Verhaltensänderung | Diff: an allen 12 Stellen nur `a` → `Link`; `key`, `title`, `aria-current` und `className` unverändert. Im Browser erhalten: `v3jump__hit` mit `title`, `cy-hist__row`, `v2doc__cell v2link`, `v2link`. `aria-describedby`, das `Tooltip` per `cloneElement` setzt, kommt über `Link` am Anker an (`seiten-saldenabgleich--s-13-mixed`, `.v3bbr__val`). Die umgestellten Stellen tragen in den Stories `#`-Ziele und rendern daher `<a>`; der `next/link`-Zweig gibt dieselben Attribute weiter (`navlist--filled`: `class="sb__navitem active"`, `aria-current="page"`) | ✓ |
| Zusatz: Spec stimmt mit dem Code überein | Die Zahl stimmt: 12 umgestellte Anker (Klärung 3, Beleg 6, `PeriodJump` 1, Showcase 2). Die Aufzählung im Zuschnitt stimmt nicht, s. M1 | ✗ |

**Mängel**

- **M1 — Zuschnitt nennt eine Stelle, die es nicht gibt, und lässt eine aus.**
  Die Zeile „Beleg: Zelle, Name, Sachverhalt, Mutterbeleg, Geschäftspartner"
  zählt fünf Stellen auf, umgestellt sind sechs. „Name" ist nicht umgestellt
  worden: Der Name in `SourceDocumentRow` (`v2rowlink`, `SourceDocument.tsx:428`)
  ging schon vor `49ed3b6` über `Link`. Umgestellt, aber nicht genannt, ist
  „Zum Buchungsstapel" in `SourceDocumentCompletion` (`SourceDocument.tsx:258`).
  Der Mutterbeleg steht zweimal im Diff (`SourceDocumentFacts.tsx:400`,
  `SourceDocumentPreview.tsx:258`), die Aufzählung nennt ihn einmal. Mit der
  Liste kommt man auf 11, mit „Ersetzt" auf 12. Behebung: ein Satz in der
  Spec, kein Code.

**Hinweise**

- **H1 — Relative Pfade laden neu.** `cases/1`, `./cases`, `../cases` und
  `target=""` gehen als `<a>` und laden das Dokument voll. Heute übergibt kein
  Aufrufer so ein Ziel (`grep` über `src`; `jumpHref` wird in `step0-view.ts:97`
  vor `reviewBase` gesetzt). Die Spec nennt den Fall unter „alles andere" aber
  nicht, ein späterer Aufrufer merkt es nicht.
- **H2 — Zwei Wege laden weiter voll neu, ohne ein `<a>` zu sein:**
  `PageSizeSelect` (`Nav.tsx:299`, `window.location.assign`) und das
  Datumsformular in `PeriodJump` (`PeriodJump.tsx:154`, `<form method="get">`).
  Kriterium 5 fasst sie nicht, die Staging-Klage trifft sie genauso.
- **H3 — `Kinds` zeigt die Ränder der Regel nicht:** `//…`, `target="_self"`,
  `download={false}` und `tel:` fehlen in der Story. Belegt sind sie nur im
  Node-Lauf oben.
- **H4 — Im Storybook nicht prüfbar:** Strg-, Cmd- und Mittelklick auf einen
  App-Pfad öffnen dort keinen neuen Tab. Der Nachbau von `next/link` ruft bei
  jedem Klick `preventDefault` auf (gemessen: `defaultPrevented` auch mit
  `ctrlKey` und `metaKey`). In der App lässt Next solche Klicks durch
  (`app-dir/link.js:45–58`, `isModifiedEvent`). Wer den Satz unter „Verhalten"
  prüft, prüft ihn in der App.
- **H5 — `typedRoutes`:** In der App ist es auskommentiert
  (`apps/web/next.config.ts:90`). Wird es wieder eingeschaltet, nimmt
  `next/link` kein freies `string` als `href` mehr an, und `Link.tsx:36` bricht
  dort den Typcheck.

Abgenommen von / am: Abnahme-Agent (fremde Sitzung, nicht der Bauende), 2026-10-27 · Offene Punkte: M1 (Spec-Text); H1–H5 ohne Auflage

### Nachbesserung 2026-10-27

| Punkt | Behoben | Wo |
|---|---|---|
| M1 Zuschnitt zählte falsch | Beleg: Zelle, „Zum Buchungsstapel", Sachverhalt, Mutterbeleg in Fakten und Vorschau, Geschäftspartner (6) — mit Klärung 3, `PeriodJump` 1 und Showcase 2 sind es 12 | Einordnung |
| H1 relative Pfade | unter „Welches Ziel wie geht" genannt: relativer Pfad ohne Schrägstrich bleibt `<a>`, Aufrufer geben Pfade absolut an | Schnittstelle |
| H3 Ränder fehlen in `Kinds` | `//…`, `tel:`, `target="_self"` und `download={false}` als Zeilen der Story | `Link.stories.tsx` |
| H5 `typedRoutes` | als Ausbau mit Auslöser | Ausbau |
| H2 Seitengröße, Datumsformular | als Ausbau, Vorschlag an llcto | Ausbau |
| H4 Strg-/Mittelklick | nur in der App prüfbar, an ll-abnahme mit dem Zeigerhub gegeben | — |

