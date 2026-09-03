# 0031 · NavList — die Hauptnavigation der Seitenleiste

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, eine gegliederte Navigationsliste ist fachfrei |
| Quelle | Soll-Katalog §11.7 „Sidebar mit Hauptnavigation (Punkt mit Zähler)" · Anfrage vom 2026-09-03 |
| Ersetzt | das Navigations-Rendering in `ui/components/layout/Sidebar.tsx` (238 Z.) |
| Blockiert | 0030 (AppShell füllt seine Seitenleiste damit), jede Seitenmigration mit Rahmen |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Seitenleiste gliedert 20 Ziele in fünf Abschnitte, hebt das aktuelle
hervor und zeigt an manchen einen Zähler („3 offen"). Eingeklappt bleiben
nur die Icons. Das ist heute in einer 238-Zeilen-Datei mit Mandanten-Wechsler,
Jahres-Wahl und Benutzermenü verwoben — die Liste selbst lässt sich nicht
herauslösen, ohne dass Fachbegriffe mitkommen.

## Einordnung

- **Wiederverwenden:** `Tabs` wechselt eine Sicht innerhalb einer Seite,
  nicht die Seite; es kennt weder Abschnitte noch Icons. `TodoList` trägt
  Arbeit, keine Ziele.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort (die Ziele kommen
  als Daten), und der aktive Zustand samt Einklapp-Verhalten ist eine
  Designentscheidung, die einmal getroffen gehört.
- **Zuschnitt:** eine Datei, ein Export. Abschnitte und Einträge sind Daten,
  keine Kinder-Komponenten — sonst zieht jeder Aufrufer die Beschriftung neu
  auf.
- **Setzt auf:** die vorhandenen `.sb__nav*`-Klassen in `app-chrome.css`;
  die Farben bleiben, wie sie sind (Entscheidung in 0030).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `sections` | `NavSection[]` | ja | Die Gliederung; leere Abschnitte werden nicht gerendert | `Filled` |
| `activePath` | `string` | ja | Der aktuelle Pfad — **als Prop**, nicht aus dem Router | `Filled` |
| `collapsed` | `boolean` | nein | Nur Icons, Beschriftung im `title` | `Collapsed` |
| `ariaLabel` | `string` | nein | Beschriftung des `<nav>`, Default „Hauptnavigation" | `Filled` |

```ts
interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  /** Zahl am rechten Rand — „3 offen". Fehlt sie, steht dort nichts. */
  count?: number;
  /** Der Zähler ruft: eine Tonstufe, zusätzlich zum Wort im `title` (V7). */
  alarm?: boolean;
  /** Sichtbar, aber nicht klickbar — die Roadmap bleibt erkennbar. */
  future?: boolean;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}
```

Keine Typen aus `src/ludwig/` — die Ziele bringt der Aufrufer mit. `count`
ist eine Zahl, kein Status: was ein Status ist, gehört an die Zeile im
Inhalt, nicht in die Navigation (R1).

**Kann bewusst nicht:** den Pfad selbst lesen (`usePathname` bleibt in der
App — sonst zöge das Set den Next-Router herein, genau das, was `Link` hier
vermeidet), navigieren, Zähler laden, Abschnitte einklappen, verschachteln.

## Verhalten

- **Aktiv** ist der Eintrag, dessen `href` gleich `activePath` ist, oder der
  längste Präfix davon — sonst leuchtet auf einer Unterseite kein Eintrag.
  Er trägt `aria-current="page"` und eine Fläche, nicht nur Farbe (V7).
- **Eingeklappt** bleibt das Icon; die Beschriftung wandert in `title`, damit
  sie nicht verschwindet. Ohne `icon` bleibt eingeklappt der erste Buchstabe —
  ein leerer Knopf wäre ein Rätsel.
- **`future`** rendert ein `<span aria-disabled="true">` statt eines Links,
  mit „bald verfügbar" im `title`.
- **Zähler** stehen rechts, tabellarisch; mit `alarm` eine Tonstufe **plus**
  das Wort im `title` („3 offen"), nie Farbe allein.
- **Server-Component:** kein Zustand. Das Einklappen steuert die Shell.
- Hover auf jedem Eintrag (§2), Fokusring sichtbar (V10).

## Stories

Titel `v3/Primitives/Navigation/NavList`. Abgeleitet nach §6: 1 Zustand
+ 0 Enums + 1 Layout-Boolean (`collapsed`) + 0 Callbacks + 1 „im Einsatz"
+ 1 Rand (lange Beschriftungen, zweistellige Zähler) = 4.

| Story | Beweist |
|---|---|
| `Filled` | fünf Abschnitte, ein aktiver Eintrag, zwei Zähler, ein `future` |
| `Collapsed` | nur Icons, Beschriftung im `title` |
| `Edges` | lange Beschriftung, Zähler 128, Eintrag ohne Icon |
| `InShell` | in der `AppShell` (0030), wie in der App |

Nicht anwendbar: `Leer` (eine Navigation ohne Ziele wird nicht gerendert),
`Laedt`, `Fehler` — die Navigation lädt nicht.

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

- [ ] Kein Import aus `next/*` (Blick in den Code)
- [ ] Auf einer Unterseite leuchtet der Präfix-Eintrag (Story `Filled`, `activePath` mit Unterpfad)
- [ ] Der aktive Eintrag trägt `aria-current="page"` und eine Fläche (Story `Filled`, Blick ins DOM)
- [ ] Eingeklappt steht die Beschriftung im `title`, nichts verschwindet spurlos (Story `Collapsed`)
- [ ] `future` ist kein Link und sagt warum (Story `Filled`, Blick ins DOM)
- [ ] Ein `alarm`-Zähler trägt zusätzlich ein Wort (Story `Filled`, Regel V7)

## Offene Fragen

1. Soll die Präfix-Regel auch über Abschnitte hinweg greifen? *Ohne Antwort:
   ja — es leuchtet genau ein Eintrag, der mit dem längsten passenden Präfix.*
2. Gehört das Logo in die Liste? *Ohne Antwort: nein, das ist Sache des
   Aufrufers oberhalb der Navigation.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe; „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `NavList.tsx` mit einem Export, `NavList.stories.tsx` daneben; Titel `v3/Primitives/Navigation/NavList`, deckt sich mit der Barrel-Gruppe „Navigation" (`src/ui/v3/index.ts:74`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `NavList` trägt beides, die Typen `NavItem`/`NavSection` sind englisch benannt und deutsch nur in den Beispielen der JSDoc. `activeHref` wird ebenfalls aus dem Barrel exportiert und trägt nur eine erklärende JSDoc ohne `@when`/`@instead` — wie `isOpen`/`nextOpen` in `TodoList`, anders als `parseAmount`. Hilfsfunktion, kein Baustein: keine Beanstandung | ✓ |
| Kein Hex, kein px, keine lokale Label-Map | `NavList.tsx`: kein Hex, kein px, keine Map. **Aber** `NavList.stories.tsx:58,67,76` setzt dreimal `background: "#14273D"`. Die A5-Ausnahme gilt ausdrücklich **nur** für `app-chrome.css`; `NavList.stories.tsx` ist damit die einzige Datei in ganz `src/ui/v3` mit einem rohen Hex-Wert (`grep -rlE '#[0-9a-fA-F]{6}' src/ui/v3`). Der Wert steht dazu nirgends im Set — die Leiste ist ein Verlauf `#1F4670 → #14304B → #0F2438`, `#14273D` ist ein vierter, erfundener Ton. `className="app__sidebar"` am Rahmen-`div` gäbe dieselbe Fläche mit dem echten Verlauf und ohne Hex | ✗ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `Filled`, `Collapsed`, `Edges` = 3. Die Spec leitet 4 ab und führt `InShell` in der Story-Tabelle („in der `AppShell` (0030), wie in der App") — die Story fehlt, und die Ableitung „= 4" stimmt damit nicht mehr. Die Sache selbst ist zu sehen, aber nur unter dem Titel der anderen Aufgabe (`v3-primitives-rahmen-appshell--in-use`): wer `NavList` in Storybook öffnet, sieht sie nie im Rahmen. `Leer`, `Laedt`, `Fehler` sind begründet ausgeschlossen | ✗ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | siehe die Zeilen dieser Tabelle; die zwei App-Punkte nach `backlog/README.md` übersprungen, §11.7 steht im Katalog auf „v2 (0031)" | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Storybook auf 6107, alle drei Story-IDs geöffnet, DOM und `getComputedStyle` gemessen; die Werte stehen in den Zeilen unten | ✓ |
| Kein Import aus `next/*` | `NavList.tsx` importiert genau zwei Dinge: `type ReactNode` aus `react` und `./Link`. `Link` ist ein schlichtes `<a>` (`grep -rn "next/" src/ui/v3` findet nur Kommentare dort). Kein `usePathname`, kein `useRouter`, kein `next/link` — der Pfad kommt als Prop | ✓ |
| Auf einer Unterseite leuchtet der Präfix-Eintrag | `--filled` mit `activePath="/clients/musterbau/2026/cases/2026-0142"`: aktiv ist `/clients/musterbau/2026/cases` („Sachverhalte"). `/clients/musterbau/2026` („Übersicht") ist ebenfalls Präfix und leuchtet **nicht** — der längste gewinnt, es leuchtet genau ein Eintrag, auch über Abschnitte hinweg (offene Frage 1) | ✓ |
| Der aktive Eintrag trägt `aria-current="page"` und eine Fläche | `--filled`: `aria-current="page"` genau einmal; Hintergrund `rgba(255,255,255,0.10)` gegen `rgba(0,0,0,0)` der übrigen, Schrift `rgb(255,255,255)` gegen `rgb(197,210,223)`, dazu ein 2 px breiter Balken `rgb(91,164,209)` als `::before`. Fläche und Marke, nicht Farbe allein (V7) | ✓ |
| Eingeklappt steht die Beschriftung im `title`, nichts verschwindet spurlos | `--collapsed`: alle zehn `<a>` tragen ihren `title` (= Beschriftung), `.label` und `.sb__navlabel` sind `display:none`, das Icon bleibt. **Nicht** der `future`-Eintrag: sein `title` ist fest „bald verfügbar" (`NavList.tsx:120` setzt ihn ohne Rücksicht auf `collapsed`), die Beschriftung „Finanz-Statistik" ist eingeklappt spurlos weg — nur ein graues Icon steht da. Dasselbe trifft den Zähler: `.is-collapsed .sb__navitem .count { display:none }` verbirgt ihn samt seinem `title`, „3 offen" ist eingeklappt nicht mehr zu erreichen | ✗ |
| `future` ist kein Link und sagt warum | `--filled` und `--edges`: `<span class="sb__navitem is-future" aria-disabled="true" title="bald verfügbar">`, kein `href`, `tabIndex` −1, `opacity 0.45`, `cursor: not-allowed`, kein Hover. Im DOM von `--filled` zehn `<a>` und ein `<span>` | ✓ |
| Ein `alarm`-Zähler trägt zusätzlich ein Wort (V7) | `--filled`, „Sachverhalte": `<span class="count is-alarm" title="3 offen">3</span>` — die Tonstufe `rgba(193,92,76,0.28)` **und** das Wort. Der ruhige Zähler „12" trägt dasselbe `title` („12 offen") auf `rgba(255,255,255,0.08)`; die Zahl ruft also nicht durch Farbe allein | ✓ |
| Leere Abschnitte werden nicht gerendert | `NavList.tsx:71` gibt bei `items.length === 0` `null` zurück, auch die Abschnitts-Beschriftung fällt mit. Keine Story zeigt den Fall — er ist im DOM nachvollziehbar, aber unbelegt | ✓ |
| Ohne `icon` bleibt eingeklappt der erste Buchstabe | `--edges`, „Ohne Icon": an der Stelle des Icons steht `<span class="sb__navinitial">O</span>`, 18 × 18, die Zeile bleibt auf 37 px wie die anderen | ✓ |
| Hover auf jedem Eintrag (§2), Fokusring sichtbar (V10) | `.sb__navitem:hover` hebt eine Tonstufe (`rgba(255,255,255,0.06)`, Schrift `#fff`) und schlägt die globale Regel `a:hover` durch höhere Spezifität. Fokus über `:focus-visible` in `tokens.css:330` — 2 px `--color-focus` `#3B8FC4`, gegen die Leiste (`#14304B`) 3.80:1, also ≥ 3:1. `is-future` bekommt keinen Hover und ist nicht fokussierbar — richtig, es klickt nicht | ✓ |
| Rand: lange Beschriftung, zweistelliger Zähler | `--edges`: „Wiederkehrende Buchungen und Regelwerk" bricht auf drei Zeilen (79 px hoch), der dreistellige Zähler 128 bleibt daneben stehen, `scrollWidth == clientWidth` — nichts läuft über, nichts wird abgeschnitten | ✓ |
| Ersetzt das Navigations-Rendering in `Sidebar.tsx` (238 Z.) | Die Ablösung in der App ist ein eigener Schritt (`backlog/README.md`); §11.7 steht auf „v2 (0031); die Gliederung bleibt in der App" | offen (App) |

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:
(1) Der rohe Hex-Wert `#14273D` in `NavList.stories.tsx` — die A5-Ausnahme deckt
nur `app-chrome.css`; `className="app__sidebar"` am Rahmen-`div` löst es und
zeigt zugleich die echte Fläche. (2) Die Story `InShell` aus der Spec fehlt;
solange sie fehlt, sieht man `NavList` im Rahmen nur unter dem Titel von 0030.
(3) Eingeklappt verliert der `future`-Eintrag seine Beschriftung, weil sein
`title` fest „bald verfügbar" ist — beides zusammen („Finanz-Statistik · bald
verfügbar") hielte die Regel ein. Eine kleinere Beobachtung ohne eigenen Punkt:
`Filled` zeigt vier Abschnitte, die Story-Tabelle der Spec verspricht fünf.
