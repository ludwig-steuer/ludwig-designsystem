# 0226 · Link: Navigation in der App über `next/link`

| | |
|---|---|
| Status | Abnahme |
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
  Beleg: Zelle, Name, Sachverhalt, Mutterbeleg, Geschäftspartner; `PeriodJump`;
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
- reines `<a>`: alles andere, nämlich eine andere Herkunft, `mailto:`/`tel:`,
  `download`, ein `target` außer `_self` und ein reiner Anker `#…`. Den Anker
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: … · Offene Punkte: …
