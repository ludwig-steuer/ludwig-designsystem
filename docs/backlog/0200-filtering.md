# 0200 · Filtern — eine Regel, sofort wirksam, „x von y", Zurücksetzen immer da

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-24, fremde Abnahme steht aus |
| Stufe | `primitives/` — `FilterBar.tsx` (erweitert), `MultiSelectFilter`, `PeriodField` (Auto-Submit-Signal); Regel in `design-guidelines.md` I4; Vorlage in `DataTable.stories.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede Liste, die man eingrenzt |
| Quelle | Owner 2026-09-24: „nicht einheitlich … Dropdown, manche als Chip, manche funktionieren sofort nach Klick, manche erst nach ‚Filtern'. … Funktion, die sofort filtert nach Klick, und ein Zurücksetzen, das immer sichtbar ist, wichtig … gefiltert x von y … Chips super bei wenigen Optionen oder einem State … beide als Stories mit allen Parametern … DataTable in Boxen mit Box-Überschrift als Story-Vorlage" |
| Ersetzt | `FilterBar.submitLabel` als Normalfall (bleibt als Ausnahme); die unterschiedlichen Filterzeilen der App (12 Varianten laut `v3-backlog.md`, 7 Aufrufer von `FilterBar`) |
| Blockiert | nichts |
| Spec von / am | Claude, 2026-09-24 |

## Recherche (2026-09-24)

Die Quellen sind sich in fünf Punkten einig:

1. **Sofort filtern ist der Normalfall.** Man filtert „live", solange eine
   Abfrage billig ist. Einen „Anwenden"-Knopf gibt es nur bei teuren Abfragen
   oder wenn man mehrere Kriterien stapeln will, bevor irgendetwas lädt
   (NN/g „batch vs. interactive"; Pencil & Paper; UXPin). Ludwigs Listen
   laden seitenweise über die URL. Das ist billig, also gilt hier: sofort.
2. **Der Filterstand steht sichtbar am Filter**: fetter Wert oder Zähler am
   Filter (Pencil & Paper), gesetzte Filter als Tags (Helios). Bei uns trägt
   jeder Auslöser den Wert schon selbst („Belegart: 3 gewählt").
3. **„Alle zurücksetzen" ist Pflicht**, global und je Filter (Carbon,
   Helios, Pencil & Paper).
4. **Ergebniszahl nach dem Filtern** und die **Zahl je Option vor der Wahl**,
   damit man nicht in eine leere Liste läuft (Pencil & Paper; NN/g).
5. **Die Form hängt an der Zahl der Optionen.** Chips und Segmente passen für
   wenige, sich ausschließende Werte. Ein Dropdown passt für viele Werte oder
   eine Mehrfachauswahl (Helios, Pencil & Paper). Unter etwa zehn Zeilen
   filtert man gar nicht.

Quellen: nngroup.com/articles/applying-filters · pencilandpaper.io (Enterprise
Filtering) · helios.hashicorp.design/patterns/filter-patterns ·
carbondesignsystem.com/patterns/filtering · uxpin.com (Filter UI).

## Die Regel (neu in `design-guidelines.md` I4)

| # | Regel |
|---|---|
| F1 | **Sofort.** Jeder Filter wirkt mit dem Klick bzw. nach einer kurzen Tipp-Pause bei Text. Einen Knopf „Filtern" gibt es nur, wo eine Abfrage spürbar teuer ist; die Seite begründet ihn im Code. |
| F2 | **Zurücksetzen steht immer da.** Ist nichts gesetzt, ist es gesperrt statt weg. So springt die Leiste nicht, und man lernt, wo der Weg zurück ist. |
| F3 | **„x von y".** Rechts in der Leiste steht, wie viele Zeilen der Filter übrig lässt: „Gefiltert: 12 von 47". Ungefiltert steht die Menge mit Wort: „47 Belege". Gezählt wird mit demselben Filter wie die Liste (I12). |
| F4 | **Form nach Optionen.** Bis etwa 5 sich ausschließende Werte oder ein Status → `FilterChips`, jede Option mit Zahl. Mehr Werte oder eine Mehrfachauswahl → `MultiSelectFilter`. Zeitraum → `PeriodField` bzw. `DateRangeField`. Freitext → `SearchInput`. |
| F5 | **Der Stand steht am Filter.** Die Chips markieren die gewählte Option, der Auslöser nennt den Wert. Es gibt keine zweite Zeile „Aktive Filter". |
| F6 | **Leer nach Filter** nennt den Filter und bietet „Filter zurücksetzen" an (T6, `DataTable.filtered`). |
| F7 | **Der Stand steht in der URL** (I4, bleibt). |

## Einordnung

- **Wiederverwenden:** `FilterBar` (0003), `FilterChips`, `SearchInput`,
  `MultiSelectFilter` (0195), `PeriodField` (0196), `DataTable.filtered`.
- **Erweitert (Regel 2)**, `FilterBar` um drei Props:
  - `result` für F3.
  - `autoSubmit` für F1 im Server-Formular: Eine Seite ohne Client-Zustand
    filtert trotzdem sofort.
  - Das Zurücksetzen bleibt sichtbar (F2). Das ist eine Verhaltensänderung
    ohne neue Prop.
- `submitLabel` bleibt für die begründete Ausnahme.
- `MultiSelectFilter` und `PeriodField` melden eine Änderung ihrer versteckten
  Felder als `change`-Ereignis. Nur so bekommt `autoSubmit` sie mit.
- **Kein neuer Baustein.** Die zweite Filterform gibt es schon (Chips und
  Dropdown). Neu ist die Regel, wann welche.
- **Tabelle in der Box:** `DataTable` trägt ihre Überschrift über `head`. Die
  Vorlage (Story) zeigt Filterleiste plus Box plus Überschrift so, wie eine
  Seite es zusammensetzt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `FilterBar.result` | `{ shown: number; total: number; unit?: [one, other] }` | nein | gefiltert „Gefiltert: 12 von 47" (ohne Wort: „von 47 Belegen" bräuchte den Dativ), ungefiltert „47 Belege"; ob gefiltert ist, sagt `activeCount > 0`. Mit `result` entfällt „n Filter gesetzt" | `Live` |
| `FilterBar.autoSubmit` | `boolean` | nein | im `<form method="get">`: jede Änderung schickt das Formular ab; Text nach 400 ms Pause, Enter sofort | `AutoSubmit` |
| `FilterBar` Zurücksetzen | — | — | immer sichtbar; ohne gesetzten Filter gesperrt (`aria-disabled`) | `Live`, `Filled` |
| `FilterBar.submitLabel` | `string` | nein | unverändert; im JSDoc als Ausnahme für teure Abfragen gekennzeichnet (F1) | `ServerForm` |

**Kann nicht (bewusst):**
- Die URL lesen oder schreiben. Das bleibt bei der Seite, wie in 0003.
- Selbst zählen. `result` kommt vom Aufrufer, mit demselben Filter wie die
  Liste (I12).
- Eine Zeile mit gesetzten Filtern zeigen (F5).

## Verhalten

- `autoSubmit` ist eine kleine Client-Insel in der sonst Server-tauglichen
  Leiste:
  - Sie sucht das umgebende `<form>` und hört auf `change` und, für
    Text/Suche, auf `input` mit 400 ms Pause.
  - Sie schickt über `requestSubmit()` ab.
  - Ohne umgebendes Formular tut sie nichts.
- `MultiSelectFilter` und `PeriodField` mit `name` lösen nach der Änderung
  ein `change` auf ihrem versteckten Feld aus. Beim ersten Rendern lösen sie
  keines aus.
- **Zustände:** gefüllt · nichts gesetzt (Zurücksetzen gesperrt) · gesetzt
  (Zahl der Filter, „x von y", Zurücksetzen aktiv) · leer nach Filter (in der
  Liste, F6). **Lädt** und **Fehler** trägt die Liste, nicht die Leiste.

## Stories

`v3/Primitives/Navigation/FilterBar`:

| Story | Beweist |
|---|---|
| `Live` | Chips (Status, mit Zahl) + `MultiSelectFilter` + `PeriodField` + `SearchInput` über einer Liste im Client-Zustand; „x von y" zählt mit; Zurücksetzen gesperrt/aktiv |
| `AutoSubmit` | dieselbe Leiste als GET-Formular ohne Knopf; der abgeschickte Query-String wird angezeigt |
| `ChipsOrDropdown` | F4 nebeneinander, mit allen Parametern: `FilterChips` (label, options mit count, active, onPick; und die `href`-Fassung) und `MultiSelectFilter` (label, options mit count/badge/group/hint, selected, onChange, name, searchPlaceholder, disabled) |

`v3/Patterns/Arbeitsfläche/DataTable`:

| Story | Beweist |
|---|---|
| `FilteredListTemplate` | die Vorlage „Tabelle in der Box": `FilterBar` über der Karte, `DataTable` mit `head` (Titel, Unterzeile, Aktion), live gefiltert, „x von y", leer nach Filter mit Zurücksetzen |

Die bestehenden Stories `Filled`, `Active`, `ServerForm`, `ManyFields` und
`InUse` bleiben. `Filled` zeigt jetzt das gesperrte Zurücksetzen.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Filter im Spaltenkopf | `ColumnDef.filter?` | eine Liste mit > 8 Filtern, die nach Spalte gedacht werden |
| gespeicherte Filter („Meine Ansichten") | eigene Aufgabe | ein Nutzer baut denselben Filter täglich neu |
| Zahl je Option, die mitläuft (Facetten) | `options[].count` vom Aufrufer, neu gezählt | Nutzer laufen in leere Ergebnisse |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] Zurücksetzen steht ohne gesetzten Filter gesperrt da, mit Filter aktiv (Stories `Filled`, `Live`)
- [ ] `result`: „47 Belege" ungefiltert, „Gefiltert: 12 von 47" gefiltert, Singular bei 1 (Story `Live`)
- [ ] `autoSubmit`: Chip-Klick, Häkchen im Dropdown, Monat im `PeriodField` und Text nach Pause schicken ab, ohne Knopf (Story `AutoSubmit`)
- [ ] Beide Filterformen mit allen Parametern (Story `ChipsOrDropdown`)
- [ ] Vorlage Tabelle in der Box mit leer nach Filter (Story `FilteredListTemplate`)
- [ ] I4 in `design-guidelines.md` trägt F1–F7

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Bau (2026-09-24)

- `FilterBar`: `result`, `autoSubmit` (Client-Insel `FilterAutoSubmit.tsx`,
  nicht im Barrel), Zurücksetzen immer sichtbar (gesperrt ohne gesetzten
  Filter, sobald `onReset` oder `resetHref` da ist). Mit `result` entfällt
  „n Filter gesetzt".
- `MultiSelectFilter` und `PeriodField` mit `name` melden jede Änderung als
  bubbelndes `change` an ihren versteckten Feldern (nicht beim ersten Rendern).
- In der Leiste haben die Dropdown-Auslöser die Höhe des Suchfelds (33 px statt 35).
- Regel I4 in `design-guidelines.md` trägt F1–F7.
- Stories: `FilterBar` → `Live`, `AutoSubmit`, `ChipsOrDropdown`; `DataTable` →
  `FilteredListTemplate`. `Filled` zeigt das gesperrte Zurücksetzen.

Selbst angesehen (nicht die Abnahme), bei 1300 px, keine Konsolenfehler:
`Live` „7 Belege" + Zurücksetzen gesperrt → Chip „Problematisch" → „Gefiltert:
2 von 7" + aktiv → Zurücksetzen → „7 Belege" + gesperrt. `AutoSubmit` schickt
ohne Knopf ab: Status → `?…status=open…`, Häkchen „Quittung" → `type=invoice&type=receipt`,
Text „Meier" nach der Pause → `q=Meier`.
