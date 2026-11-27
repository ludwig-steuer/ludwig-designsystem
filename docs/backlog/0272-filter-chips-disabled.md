# 0272 · Zählzeile eines Durchgangs — `FilterChips` mit leerer, gesperrter Option

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (M1 erfüllt durch gemeinsamen Commit mit dem Showcase; H1/H2/H5/H7 erledigt) |
| Stufe | `primitives/` — Erweiterung von `FilterChips` (`primitives/Nav.tsx`), dazu eine Seitenaufgabe |
| Klassen-Test | ja: Eine Liste von Policen nach Zustand („Offen 4 · In Prüfung 0 · Abgelehnt 2“) braucht dieselbe Zeile |
| Quelle | Owner 2026-11-27 (Simon über plugin-mananger, Feedback zu den Entwürfen 17e044a): „Oben eine Übersicht mit Zahlen … die Mandanten mit Problemen oben“; Seitenprofil `docs/seiten/duo-connect.md`, Nachtrag 2, Zeile A8/A13; Entwurf `src/showcase/duo-connect/drafts.tsx` `CountLine` (Kennzeichen „ohne Spec“) |
| Ersetzt | im Set nichts; in den Entwürfen den Stellvertreter `CountLine` |
| Blockiert | Plugin: A8 (Durchgang läuft), A13 (Ergebnis Durchgang) |
| Spec von / am | Claude (designsystem), 2026-11-27 |

## Ziel

Im Durchgang über 140 Mandanten will die Mitarbeiterin auf einen Blick
sehen, wie viele Mandanten in welchem Zustand sind, und mit einem Klick nur
die mit Problemen sehen. Die Zeile zählt je Zustand der Achse `duo_sync`
und filtert die Liste darunter. Sie springt nie: Ein Zustand mit 0 bleibt an
seinem Platz, grau und nicht klickbar.

## Einordnung

- **§3 Regel 2 greift.** `FilterChips` (`@when` „Narrowing down by
  dimension, above the card“) trägt Wort, Zahl, aktive Option und den Klick
  schon. Es fehlt genau eins: eine Option, die da ist, aber nicht wählbar,
  weil sie nichts übrig ließe. Das ist eine Designentscheidung, die
  wiederkommt (jede Zustandszeile mit Nullen) und sich im `@when` in einem
  Halbsatz sagen lässt. Deshalb **eine** Prop an der Option, kein neuer
  Baustein.
- Verworfen: Nullen ausblenden. Dann rückt die Zeile bei jedem Wechsel, und
  „Abgebrochen 0“ ist selbst eine Auskunft („nichts abgebrochen“).
- Verworfen: `Segmented` (gleiche Daten, andere Ordnung) und `Tabs`
  (Sichten mit eigener Form) — die Zustände sind überschneidungsfreie
  Teilmengen derselben Liste, also ein Filter (R9).
- Die Wörter kommen aus der Registry (`STATUS_REGISTRY.duo_sync`, gespiegelt
  seit 93e2791), keine lokale Liste. Die Reihenfolge ist Sache der Seite
  (Aufmerksamkeit zuerst), nicht der Registry.

## Schnittstelle

Neu an `ChipOption`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `disabled` | `boolean` | nein | Option steht an ihrem Platz, ist aber nicht wählbar: grau, ohne Hover, `disabled` am Knopf bzw. ohne `href` beim Link; eine aktive Option wird nie gesperrt | `FilterChipsDisabled` |

Alles andere an `FilterChips` bleibt (`label`, `options`, `active`,
`onPick`, `count`, `icon`, `href`).

**Seitenaufgabe Zählzeile** (Plugin, A8/A13; Story `StateCountLine`):

| Teil | Belegung |
|---|---|
| `label` | „Stand“ |
| erste Option | `all` „Alle“ mit der Gesamtzahl |
| weitere Optionen, feste Reihenfolge | `succeeded_with_issues` · `cancelled` · `running` · `queued` · `succeeded` · `skipped`; `label` aus `STATUS_REGISTRY.duo_sync[key].label`; `count` gezählt aus der Liste selbst (I12); `disabled: count === 0 && active !== key` |
| `icon` | das Zeichen der Stufe, wie es der `StatusBadge` derselben Zeile zeigt — nie ohne Wort |
| Liste darunter | Gruppe „Mit Problemen“ (`succeeded_with_issues`, `cancelled`) zuerst, dann „Alle übrigen“ in fester Reihenfolge; die Gruppenköpfe nennen ihre Zahl |

## Verhalten

- Gesperrte Option: `disabled` am `button` (nicht fokussierbar, keine
  Tastaturfalle), Text in `--color-text-subtle` (Kontrast der Zahl bleibt
  ≥ 4,5:1 gegen den Grund, gemessen), kein Hover. Als Link: `span` statt
  `a`, damit nichts klickbar aussieht, was nicht klickt.
- Fällt die Zahl einer aktiven Option auf 0 (der letzte abgebrochene
  Mandant wurde erneut abgeglichen), bleibt sie aktiv und wählbar, die Liste
  zeigt „leer nach Filter“ mit dem Weg zurück — sonst säße die Nutzerin in
  einem Filter fest, den sie nicht lösen kann.
- Die Zahlen ändern sich während des Durchgangs; die Zeile wird **nicht**
  angesagt (die Seite sagt den Wechsel des Mandanten an, 0265).
- Schmal (L1): Die Chips brechen um, die Reihenfolge bleibt.

## Stories

| Story | Beweist |
|---|---|
| `FilterChipsDisabled` | eine Zeile mit gesperrten Optionen neben wählbaren und einer aktiven mit 0 |
| `StateCountLine` | die Zählzeile der Seitenaufgabe über einer Liste mit 12 Mandanten, Klick filtert, Gruppen „Mit Problemen“/„Alle übrigen“ (in `Nav.stories.tsx`, Daten aus dem Showcase) |

Ausgeschlossen: leer (eine Zeile ohne Optionen gibt es nicht), lädt und
Fehler (die Zeile zählt, was die Liste hat; lädt die Liste, gibt es keine
Zahlen — Sache der Liste).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Grund für eine gesperrte Option als Tooltip | `disabledReason?: string` an `ChipOption` | eine Option ist aus einem anderen Grund als „0“ gesperrt |

## Offene Fragen

1. Erste Option „Alle“ mit Gesamtzahl — oder ohne „Alle“ und Abwählen durch
   zweiten Klick (wie im Entwurf)? **Ohne Antwort:** mit „Alle“, wie jede
   `FilterChips`-Zeile im Set; ein zweiter Klick als einziger Weg zurück
   wäre nicht lernbar.

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

- [ ] `disabled` an einer Option: `button[disabled]`, nicht per Tab erreichbar, kein Hover-Wechsel, Kontrast der Zahl ≥ 4,5:1 gemessen (`FilterChipsDisabled`)
- [ ] Eine aktive Option mit 0 bleibt wählbar (`FilterChipsDisabled`)
- [ ] Bestehende Aufrufer von `FilterChips` (10 Stellen im Set) unverändert: Bildvergleich ihrer Stories ≤ 0,5 %
- [ ] `StateCountLine`: Wörter aus `STATUS_REGISTRY.duo_sync`, keine lokale Liste; Reihenfolge wie in der Seitenaufgabe; Klick filtert, „Alle“ hebt auf, „x von y“ steht über der Liste
- [ ] Der Entwurf `CountLine` in `src/showcase/duo-connect/` ist durch `FilterChips` ersetzt, Kennzeichen „ohne Spec“ entfällt

## Nachtrag 2026-11-27 — `Tabs`: der fokussierte Reiter rollt in den Streifen (0263, H12)

Befund aus der Nachprüfung von 0263: Bei 320 px Breite scrollt der Streifen
von `Tabs` waagerecht (L1), aber die Tab-Taste rollt den dritten Reiter nicht
hinein — „Einstellungen“ endete bei x 323, der Streifen bei 304, `scrollLeft`
blieb 0: Wort und Fokusring 19 px abgeschnitten. Gleiche Datei (`Nav.tsx`),
deshalb hier.

- Jeder Reiter (Knopf wie Link) bringt sich beim Fokus in den sichtbaren
  Streifen: nur der Streifen rollt (`scrollLeft`), nie die Seite, und
  **sofort** — es gibt keine Bewegung, die `prefers-reduced-motion`
  abschalten müsste. Der Fokusring zählt mit (gemessen am Reiter:
  `outline-width` + `outline-offset`, beim Reiter innen, also 0).
- Passt der Streifen ganz, geschieht nichts (`scrollWidth <= clientWidth`).
- Keine neue Prop.

Zusätzliches Kriterium:

- [ ] `ExtensionShell` `InUse` bei 320 px: Tab auf „Einstellungen“ → der Reiter liegt im Streifen (rechte Kante ≤ Streifenkante + 0,5 px), `scrollLeft` > 0; Umschalt+Tab zurück auf „Abgleich“ → `scrollLeft` 0; Dokument und `main` scrollen dabei nicht (beide 0); dasselbe mit `reducedMotion: reduce`; bei 390 px bleibt `scrollLeft` 0

## Nachtrag 2026-11-27 — aus der Abnahme (H1, H5, H7)

- Die Stories stehen in `FilterChips.stories.tsx` (eine Story-Datei je Komponente der Familie), nicht in `Nav.stories.tsx`.
- Die Zeile `icon` der Seitenaufgabe entfällt: Die Achse `duo_sync` hat kein Zeichen, `StatusBadge` zeigt dort keins — es gibt nichts zu wiederholen.
- Die Daten der Story `StateCountLine` sind aus dem Showcase übernommen, nicht importiert (eine Primitive-Story hängt nicht am Showcase).
- Lage der Zählzeile: **über der Karte**, wie `FilterChips` es vorgibt („above the card, never in its head“) — im Showcase A8/A13 so umgestellt. Die Zahl im Gruppenkopf schreibt sich „Mit Problemen · 1“ (wie in der Zählzeile), nicht „(1)“.

## Abnahme

Abnahme 2026-11-27, fremder Prüfer (Claude, nicht der Bauer), **gemessene
Abnahme**. Gegenstand nur 0272: `primitives/Nav.tsx`, der 0272-Block in
`v3.css` (`.v2chip.is-disabled`), `FilterChips.stories.tsx`. Isoliert geprüft
in einem Scratch-Klon (`git clone --shared`, HEAD 1b9a847) mit genau diesen
drei Änderungen; die Dateien der parallelen Sitzungen (PhaseProgress, Switch,
ProblemCard, StatusCallout …) sind nicht Gegenstand. Browser: Playwright gegen
Storybook 6107 bzw. die beiden statischen Builds.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` exit 0 im Arbeitsbaum **und** im Klon HEAD + nur 0272; `storybook build -o <scratchpad>/sb-0272` (Klon) und `pnpm build -o <scratchpad>/sb-tree` (Arbeitsbaum): beide „Storybook build completed successfully“ | ✓ |
| Datei nach der Familie, Story daneben, Titel in der richtigen Gruppe | `FilterChips` bleibt in `primitives/Nav.tsx`; Stories in `primitives/FilterChips.stories.tsx`, Titel `v3/Primitives/Navigation/FilterChips` = Gruppe „Navigation“ im Barrel. Spec sagt „in `Nav.stories.tsx`“ — die Datei gibt es nicht, die Familie hat je Baustein eine Story-Datei (`Tabs.stories.tsx`, `Segmented.stories.tsx`); Abweichung begründet (H1) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `node scripts/check-language.mjs` (Klon): „0 German comment lines“; `pnpm check:when`: „in Ordnung“ (Baum und Klon); `@when` von `FilterChips` um den Halbsatz zu `disabled` ergänzt; `revealInStrip` ist nicht exportiert; Story-Exporte `FilterChipsDisabled`, `StateCountLine` englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | grep in `Nav.tsx`, 0272-CSS-Block und Story: kein Hex, kein px (Story nur `var(--space-…)`, `var(--container-narrow)`). `StateCountLine`: Wörter über `resolveStatus("duo_sync", …)`, Zeilen über `StatusBadge axis="duo_sync"`. `FilterChipsDisabled` schreibt Zustandswörter als Literale (H2) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `v3-primitives-navigation-filterchips--filter-chips-disabled` und `--state-count-line` in `sb-0272/index.json` und auf 6107; leer, lädt, Fehler unter „Stories“ begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 | Stufe primitives, Importe abwärts (`Nav.tsx` → `Form`, `Link`); grau statt Farbe; Chip-Höhe 29,4 px gemessen (≥ 24); `pnpm check:type` ok; Hover: wählbarer Chip bg → rgb(244, 246, 248), gesperrter unverändert; gesperrter Chip nicht fokussierbar, also kein Ring nötig; Linktext „Alle Mandanten zeigen“ im Imperativ; Karte mit Kopf. Befund außerhalb von 0272: die Zahl im **wählbaren** Chip misst 3,70:1 (H3) | ✓ |
| Im Browser angesehen (Storybook) | Screenshots `scratchpad/0272/filter-chips-disabled-1280.png`, `state-count-line-1280.png`, `-390.png`, `-320.png`; Konsole ohne Fehler und Warnungen in beiden Stories und in `ExtensionShell` `InUse` | ✓ |
| `disabled`: `button[disabled]`, nicht per Tab, kein Hover, Kontrast der Zahl ≥ 4,5:1 | `--filter-chips-disabled`, 1280: Zeile „Stand“, „Abgebrochen 0“ = `BUTTON` mit `disabled`, Klasse `is-disabled`. Tab-Folge über die ganze Story (13 Halte) überspringt „Abgebrochen“ in Zeile 1 und 3; `focus()` per Skript wirkungslos; Klick ändert `aria-pressed` nicht. Hover (Maus auf Mitte, 250 ms): bg rgb(255, 255, 255), Text rgb(113, 113, 113), Rand rgb(221, 226, 232), cursor `default` — vorher und nachher gleich. Kontrast aus berechneten Stilen samt Opacity-Kette: Zahl „0“ und Wort je **4,88:1** auf dem weißen Chip (Knopf und Span) | ✓ |
| Eine aktive Option mit 0 bleibt wählbar | Zeile „Aktiv mit 0“: „Abgebrochen 0“ `is-active`, `disabled` false, `aria-pressed="true"`, 7. Halt der Tab-Folge, Klick fokussiert. Dort ist `onPick` ein Leerlauf (H4) | ✓ |
| Link-Fall als `span` | Zeile „Als Links“: gesperrte Option `SPAN` ohne `href`, `tabIndex` −1, Hover ohne Wirkung; die übrigen vier `A` mit `href` | ✓ |
| Bestehende Aufrufer unverändert: Bildvergleich ≤ 0,5 % | Klon HEAD → `sb-head`, derselbe Klon + nur 0272 → `sb-0272`, beide statisch serviert. Auswahl: Importschluss über alle Module, die `<FilterChips` oder `<Tabs` rendern (45 Module, 32 Story-Dateien, **293 Stories**: LogBrowser, DataTable, FilterBar, MultiSelectFilter, DocumentListFilters, Tabs, ExtensionShell, alle Seiten mit Reitern). 1280 × 800, ganze Seite, reduce-motion, Animationen aus. 269 Stories pixelgleich (0,0000 %). 24 weichen ab, alle im PDF-Original (`iframe.v2doc__orig`) oder im Ladezeitpunkt: HEAD gegen HEAD streut dort bis 12,7 %, das DOM von `#storybook-root` ist in allen 24 zwischen HEAD und 0272 zeichengleich, mit maskiertem PDF-Rahmen höchstens **0,018 %** (`seiten-beleg-rechnung--done`). `seiten-duo-connect-abgleich--board` (20 999 px hoch, über der Grenze der Aufnahme) nur im Sichtfenster | ✓ |
| `StateCountLine`: Wörter aus der Registry, Reihenfolge, Klick filtert, „Alle“ hebt auf, „x von y“ über der Liste | `--state-count-line`, 1280: „Alle 12 · Fertig mit Problemen 1 · Abgebrochen 0 (gesperrt) · Läuft 1 · Wartet 7 · Fertig 1 · Übersprungen 2“ — Reihenfolge wie in der Seitenaufgabe, Wörter gleich `STATUS_REGISTRY.duo_sync` (Code: `resolveStatus`, keine Liste). „Wartet“ → 7 Zeilen, „7 von 12“; „Fertig mit Problemen“ → Gruppe „Mit Problemen · 1“, „1 von 12“; „Übersprungen“ → „2 von 12“; „Alle“ → „12 von 12“, „Mit Problemen · 1“ vor „Alle übrigen · 11“. „x von y“ im Kartenkopf (Unterkante 149,8 px) über der ersten Gruppe (203,2 px). Bei 390 und 320 px brechen die Chips um, Reihenfolge gleich, kein Querlauf. Ohne `icon`: `StatusBadge` zeigt für `duo_sync` kein Zeichen (`AXIS_ENTITY` kennt die Achse nicht), also gibt es keins zu wiederholen (H5) | ✓ |
| Entwurf `CountLine` im Showcase durch `FilterChips` ersetzt, „ohne Spec“ entfällt | Zu Beginn der Prüfung stand `CountLine` noch (`drafts.tsx:451`, `<Draft spec="ohne Spec">`). Während der Prüfung (Stand 22:09) hat eine parallele Sitzung umgestellt, **nicht committet**: `drafts.tsx` gelöscht, kein Verweis mehr (`grep CountLine`, `grep drafts`); `Sync.stories.tsx` `BatchTable` nutzt `FilterChips label="Stand"` mit `COUNT_ORDER`, Wörtern über `resolveStatus` und `disabled: count === 0 && filter !== s`. Gemessen bei 390 px: `seiten-duo-connect-abgleich--a-08-running-batch` „Alle 12 · Fertig mit Problemen 1 · Abgebrochen 0 (gesperrt) · Läuft 1 · Wartet 7 · Fertig 1 · Übersprungen 2“; `--a-13-result-batch` „… Abgebrochen 0, Läuft 0, Wartet 0 (gesperrt) · Fertig 9 · Übersprungen 2“, „12 von 12“; kein „ohne Spec“ auf der Seite, kein Querlauf, Konsole leer; `pnpm typecheck` exit 0. Gilt nur zusammen mit diesem Showcase-Stand im selben Commit (M1, H7) | ✓ (M1) |
| Nachtrag H12: `ExtensionShell` `InUse` bei 320 px; reduce; 390 px | `v3-primitives-rahmen-extensionshell--in-use`, 320 × 700: Tab #3 „Einstellungen“ → `scrollLeft` 0 → 19, rechte Kante 304,16 ≤ Streifenkante 304 + 0,5; Ring außen 0 (outline 2 + offset −2). Umschalt+Tab „Verlauf“ (19, sichtbar ab x 102,9) → „Abgleich“ → `scrollLeft` 0. Dokument [0, 0] und `.v3ext__main` [0, 0] in jedem Schritt. Mit `reducedMotion: reduce` dieselben Zahlen. Sofort: `focus()` und `scrollLeft` im selben Task = 19, `scroll-behavior: auto`. 390 px: scrollWidth 358 = clientWidth 358, `scrollLeft` bleibt bei allen drei Reitern 0. Zusatz Link-Reiter (`seiten-beleg-seite--in-use`, 320, `focus({ preventScroll: true })`): jeder der sechs `A`-Reiter liegt danach im Streifen (rechter Rest ≥ 0,11 px), Dokument 0 | ✓ |
| Wächter | `pnpm check:type` ok, `pnpm check:when` ok, `check:language` ok. `pnpm check:classes` rot: im Klon HEAD + 0272 dieselben vier Altfunde wie auf HEAD (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), im Baum dazu `v3phase__run` (PhaseProgress, fremd); 0272 bringt keinen. `check:css` rot, `dist/ludwig.css` veraltet, auch durch den 0272-Block (H6) | ✓ |

**Gesamt: abgenommen, mit einer Bedingung (M1).** Alle Kriterien sind im
heutigen Arbeitsbaum erfüllt. Das Showcase-Kriterium hängt aber an fremden,
nicht committeten Änderungen.

- **M1** (Commit-Bedingung) Das Showcase-Kriterium gilt nur, wenn `src/showcase/duo-connect/` (`drafts.tsx` gelöscht, `Sync.stories.tsx` und die übrigen Showcase-Dateien) im selben Zug wie `Nav.tsx`, der 0272-Block in `v3.css` und `FilterChips.stories.tsx` eingecheckt wird. Ein Teilcommit nur der 0272-Dateien lässt den Entwurf mit „ohne Spec“ stehen, und das Kriterium ist dann ✗.
- **H7** Showcase `BatchTable`: Die Zählzeile steht in der Karte (`CardSection` unter `CardHead`). `FilterChips` sagt „above the card, never in its head“; in der Karte, aber unter dem Kopf, regelt keine der beiden Formeln. Das gehört geklärt. Die Gruppenköpfe heißen „Mit Problemen (1)“, in der Story „Mit Problemen · 1“ wie in `account-columns` — eine Schreibweise wählen.
- **H1** Spec, Zeile `StateCountLine` unter „Stories“: „in `Nav.stories.tsx`“ per datiertem Nachtrag auf `FilterChips.stories.tsx` stellen.
- **H2** `FilterChipsDisabled` nennt die Wörter der Achse `duo_sync` als Literale. Das passt zum Muster der Datei, ist aber eine zweite Quelle für dieselben Wörter. Besser neutrale Wörter oder `resolveStatus`.
- **H3** (außerhalb von 0272, Befund für 0119): `.v2chip .n` (`--color-text-muted`, opacity 0,75) misst im wählbaren Chip 3,70:1 < 4,5:1. Seit 0272 ist die gesperrte „0“ (4,88:1) dunkler als die wählbaren Zahlen; die Rangfolge kippt.
- **H4** In `FilterChipsDisabled` ist `onPick` der Zeile „Aktiv mit 0“ ein Leerlauf, und in `StateCountLine` ist die `EmptyRow` („Kein Mandant mit diesem Stand“, „Alle Mandanten zeigen“) nicht erreichbar. Den Weg zurück aus „leer nach Filter“ zeigt deshalb keine Story.
- **H5** Spec, Seitenaufgabe: Nachtrag für zwei Punkte. Zeile `icon`: die Achse hat kein Zeichen, also entfällt es. „Daten aus dem Showcase“: die Daten sind übernommen, nicht importiert; eine Primitive-Story importiert nicht aus dem Showcase.
- **H6** Vor dem Commit `pnpm build:css`, damit `dist/ludwig.css` den Block `.v2chip.is-disabled` trägt.
