# 0031 · NavList — die Hauptnavigation der Seitenleiste

| | |
|---|---|
| Status | fertig |
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

Zweite Abnahme am 2026-09-05 (fremder Agent, gegen Spec und Code). Sie prüft
denselben Katalog wie die erste vom 2026-09-03 und zusätzlich, ob deren drei
offene Punkte behoben sind. Sie ging in zwei Durchgängen: der erste fand einen
Mangel am eingeklappten Zähler, der zweite am selben Tag nahm die Nachbesserung
ab. Die Zeile dazu trägt beide Stände.

**Story-Deckung.** Vier Stories in der Spec, vier Exporte in
`NavList.stories.tsx` (`Filled`, `Collapsed`, `Edges`, `InShell`), vier IDs in
`index.json` — die Ableitung „1 Zustand + 1 Layout-Boolean + 1 im Einsatz
+ 1 Rand = 4" geht jetzt auf; `InShell` war beim ersten Mal nicht da und ist
nachgezogen. Jede Prop hat ihre Story: `sections` und `activePath` in
`Filled`, `collapsed` in `Collapsed`, `ariaLabel` per Default („Hauptnavigation")
in allen. `Leer`, `Laedt`, `Fehler` sind begründet ausgeschlossen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme). `pnpm build` nicht neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`; der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `NavList.tsx`, `NavList.stories.tsx` daneben; Titel `v3/Primitives/Navigation/NavList`, deckt sich mit der Barrel-Gruppe „Navigation" (`src/ui/v3/index.ts:80` … `:93`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `NavList.tsx:46–51` trägt beides; `NavItem`/`NavSection` englisch benannt, Kommentare englisch. `activeHref` (`:30–35`) ist eine Hilfsfunktion mit erklärender JSDoc ohne `@when`/`@instead` — wie `isOpen`/`nextOpen` in `TodoList`; kein Baustein, keine Beanstandung (Ruling der ersten Abnahme übernommen) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map | **Behoben.** `grep -nE '#[0-9a-fA-F]{3,6}' NavList.stories.tsx` = 0; der `Rail`-Rahmen trägt jetzt `className="app__sidebar"` und damit den echten Verlauf des Sets — im Browser gemessen `linear-gradient(rgb(31,70,112), rgb(20,48,75) 50%, rgb(15,36,56))`, nicht den erfundenen vierten Ton `#14273D`. `NavList.tsx` ohne Hex, ohne px, ohne Map | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | **Behoben.** `InShell` ist da (`v3-primitives-navigation-navlist--in-shell`): `AppShell` mit `sb__logo`, `TopBar`-Krume und `PageHeader` im Inhalt — `NavList` ist jetzt unter dem eigenen Titel im Rahmen zu sehen, nicht nur unter dem von 0030. Zählung 4 = 4. Nebenbei erledigt: `Filled` zeigt jetzt **fünf** Abschnitte („Übersicht", „Buchung", „Stammdaten", „Reporting", „Kommunikation"), wie die Story-Tabelle es verspricht — beim ersten Mal waren es vier | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | siehe die Zeilen dieser Tabelle; die zwei App-Punkte nach `backlog/README.md` übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle vier IDs am 2026-09-05 auf `localhost:6107` geöffnet, DOM und `getComputedStyle` gemessen, Hover echt ausgelöst | ✓ |
| Kein Import aus `next/*` | `NavList.tsx:1–2` importiert genau zwei Dinge: `type ReactNode` aus `react` und `./Link`; `Link` ist ein schlichtes `<a>`. Kein `usePathname`, kein `useRouter`, kein `next/link` — der Pfad kommt als Prop | ✓ |
| Auf einer Unterseite leuchtet der Präfix-Eintrag | `--filled` mit `activePath="/clients/musterbau/2026/cases/2026-0142"`: aktiv ist genau ein Eintrag, „Sachverhalte" (`/clients/musterbau/2026/cases`). „Übersicht" (`/clients/musterbau/2026`) ist ebenfalls Präfix und leuchtet **nicht** — der längste gewinnt, auch über Abschnitte hinweg (offene Frage 1) | ✓ |
| Der aktive Eintrag trägt `aria-current="page"` und eine Fläche | `--filled`: `aria-current="page"` genau 1×; Hintergrund `rgba(255,255,255,0.10)` gegen `rgba(0,0,0,0)` der übrigen, Schrift `rgb(255,255,255)` gegen `rgb(197,210,223)`, dazu ein 2 px breiter Balken `rgb(91,164,209)` als `::before`. Fläche und Marke, nicht Farbe allein (V7) | ✓ |
| Eingeklappt steht die Beschriftung im `title`, nichts verschwindet spurlos | **Behoben, zweiter Durchgang.** `--collapsed`, DOM-Probe nach der Nachbesserung (`NavList.tsx:98–104`, Commit `92934c0`): alle **zwölf** Einträge tragen einen `title`, und die drei mit Zähler tragen die Zahl mit — „Posteingang — 12 offen", „Sachverhalte — 3 offen", „Klärfälle — 2 offen"; der `future`-Eintrag „Finanz-Statistik — bald verfügbar". Dass `.is-collapsed .sb__navitem .count { display: none }` (`app-chrome.css:119–120`) die Zahl selbst verbirgt, ist damit folgenlos: ihr Wort hängt jetzt am Eintrag, nicht am verborgenen Element. **Gegenprobe aufgeklappt:** in `--filled` trägt **kein einziger** der elf `<a>` überhaupt ein `title`-Attribut (`hasAttribute('title')` = false, nicht bloß leer) — dort steht der Zähler sichtbar daneben (`display: block`, eigenes `title` „12 offen" / „3 offen" / „2 offen"), ein zweiter Tooltip wäre doppelt. Gleiches Bild in `--edges`. Der `future`-Eintrag sagt aufgeklappt nur „bald verfügbar". *Erster Durchgang, zum Vergleich:* der `title` war nur `item.label`, „3 offen" war eingeklappt auf keinem Weg erreichbar — ✗ | ✓ |
| `future` ist kein Link und sagt warum | `--filled` und `--edges`: `<span class="sb__navitem is-future" aria-disabled="true" title="bald verfügbar">`, kein `href`, `tabIndex` −1, `opacity 0.45`, `cursor: not-allowed`, kein Hover. Im DOM von `--filled` elf `<a>` und ein `<span>` | ✓ |
| Ein `alarm`-Zähler trägt zusätzlich ein Wort (V7) | `--filled`, „Sachverhalte": `<span class="count is-alarm" title="3 offen">3</span>` — Tonstufe `rgba(193,92,76,0.28)` **und** das Wort. Die ruhigen Zähler „12" und „2" tragen dasselbe `title`-Muster auf `rgba(255,255,255,0.08)`; die Zahl ruft nicht durch Farbe allein. (Gilt für den ausgeklappten Zustand — eingeklappt siehe die Zeile darüber) | ✓ |
| Leere Abschnitte werden nicht gerendert | `NavList.tsx:71` gibt bei `items.length === 0` `null` zurück, die Abschnitts-Beschriftung fällt mit. Keine Story zeigt den Fall — im Code nachvollziehbar, unbelegt | ✓ |
| Ohne `icon` bleibt eingeklappt der erste Buchstabe | `--edges`, „Ohne Icon": an der Stelle des Icons `<span class="sb__navinitial">O</span>`, 18 × 18 px, die Zeile bleibt bei 37 px wie die übrigen | ✓ |
| Hover auf jedem Eintrag (§2), Fokusring sichtbar (V10) | `--in-shell`, echter Mauszeiger auf „Belege": `background rgba(255,255,255,0.06)`, Schrift `rgb(255,255,255)` (`app-chrome.css:97`). Fokus über `:focus-visible` in `tokens.css` — 2 px `--color-focus`, gegen die Leiste ≥ 3:1. `is-future` bekommt keinen Hover und ist nicht fokussierbar — richtig, es klickt nicht | ✓ |
| Rand: lange Beschriftung, zweistelliger Zähler | `--edges`: „Wiederkehrende Buchungen und Regelwerk" bricht auf drei Zeilen (79 px hoch), der dreistellige Zähler 128 bleibt daneben; `scrollWidth == clientWidth` (240 == 240) — nichts läuft über, nichts wird abgeschnitten | ✓ |
| Ersetzt das Navigations-Rendering in `Sidebar.tsx` (238 Z.) | Die Ablösung liegt in `ludwig/app`; §11.7 steht auf „v2 (0031); die Gliederung bleibt in der App" | offen (App) |

**Beide Durchgänge zusammengefasst.** Alle drei offenen Punkte vom 2026-09-03
sind erledigt: der rohe Hex-Wert `#14273D` in der Story (jetzt
`className="app__sidebar"` mit dem echten Verlauf), die fehlende Story
`InShell`, und — nach der Nachbesserung vom 2026-09-05 — der eingeklappte
Zähler. `pnpm typecheck` nach der Nachbesserung erneut grün (Exit 0).

Zwei Beobachtungen ohne eigenen Punkt, für den nächsten, der die Datei anfasst:

- Ein `future`-Eintrag **mit** Zähler ergäbe eingeklappt „… — 3 offen — bald
  verfügbar" (`NavList.tsx:125`, dieselbe `waiting`-Größe). Der Fall ist im
  Code richtig gelöst, aber von keiner Story gedeckt — in `SECTIONS` trägt der
  `future`-Eintrag keinen `count`. Kein Mangel: die Spec verlangt die
  Kombination nicht.
- Die Abschnitts-Beschriftungen der Leiste stehen in Versalien
  (`.sb__navlabel`, `app-chrome.css:83`) — im Screenshot „ÜBERSICHT",
  „BUCHUNG". Verstoß gegen T3/A2, aber nicht Sache dieser Aufgabe: die
  Klasse ist Bestand, den die Spec ausdrücklich übernimmt („Setzt auf: die
  vorhandenen `.sb__nav*`-Klassen"). Läuft als Befund unter 0089, das seit
  dem 2026-09-05 den vollen Umfang trägt (18 Stellen in `v3.css`, 9 in
  `app-chrome.css`).

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: nur „offen (App)" — die Ablösung des Navigations-Renderings in `Sidebar.tsx` gehört nach `ludwig/app`.
