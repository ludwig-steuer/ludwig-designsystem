# 0031 · NavList — die Hauptnavigation der Seitenleiste

| | |
|---|---|
| Status | in Arbeit |
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
