# 0030 · AppShell — das Gerüst der Anwendung

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Seitenleiste plus Kopfzeile plus Inhalt ist fachfrei |
| Quelle | Soll-Katalog §11.7 „Rahmen (Shell)" · Anfrage vom 2026-09-03 („Sidebar/TopBar fehlt mir") |
| Ersetzt | `ui/components/layout/AppShell.tsx` (57 Z.) und `TopBar.tsx` (49 Z.) in `ludwig/app` |
| Blockiert | jede Seitenmigration, die den Rahmen mitnimmt; die Sperre unter 1280 px app-weit (L1) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Rahmen ist das Einzige, was die Sachbearbeiterin auf jeder Seite sieht:
240 px Seitenleiste, 56 px Kopfzeile, dazwischen die Arbeitsfläche. Er steht
heute nur in der App und ist dort mit Mandanten-Liste, Rolle und Router
verwoben — im Design-System gibt es ihn nicht, und deshalb lässt sich keine
Seite außerhalb der App ansehen.

## Einordnung

- **Wiederverwenden:** nichts. `MasterDetail` teilt eine Arbeitsfläche, nicht
  die Anwendung; `PageHeader` sitzt **in** der Fläche, nicht um sie herum.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort im Gerüst selbst,
  und das Raster (Spaltenbreite, Kopfhöhe, Einklapp-Übergang) ist eine
  Designentscheidung, die genau einmal getroffen gehört.
- **Zuschnitt:** Familie in einer Datei — `AppShell` (das Raster) und
  `TopBar` (die Kopfzeile). Sie ergeben nur miteinander Sinn: die Kopfzeile
  sitzt im Raster der Shell.
- **Setzt auf:** die vorhandene `app-chrome.css` (727 Zeilen, liegt bereits
  im Repo und wird von `index.css` importiert).

## Der Schnitt: was hier hereinkommt und was draußen bleibt

Die Erhebung (`v3-backlog.md`, „Nicht `primitives`") und der Soll-Katalog
widersprachen sich — der Katalog führt die ganze Shell als „heben", die
Erhebung schließt sie aus. Aufgelöst wird das nicht durch ein Ja oder Nein,
sondern durch einen Schnitt:

| Kommt ins Set (fachfrei) | Bleibt in der App (Fachbegriffe) |
|---|---|
| Raster 240/56, Einklappen, Sperre unter 1280 px | `MandantSwitcher` — Mandant ist ein GLOSSARY-Begriff |
| Kopfzeile: Krümel · Suche · Aktionen als Slots | `YearSwitcher` — Wirtschaftsjahr |
| Navigationsliste → eigene Aufgabe 0031 | `UserMenu`, `RoleBadge` — Rollen |
| | `MANDANT_NAV_SECTIONS` — die konkrete Struktur |

**Entschieden am 2026-09-03 (Owner): die dunkle Seitenleiste behält ihre
rohen Hex-Werte.** `app-chrome.css` ist die Alt-Optik mit Verlauf und
`rgba(255,255,255,…)`; sie wird **nicht** auf Tokens gezogen. A5 bekommt dafür
eine benannte Ausnahme in `design-guidelines.md` — ohne die widerspräche der
Baustein dem SSOT, so wie es bei T8 und `IconButton` (0012) der Fall war.

## Schnittstelle

`AppShell`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `sidebar` | `ReactNode` | ja | Der Inhalt der Seitenleiste — Logo, Umschalter, Navigation | `Filled` |
| `topbar` | `ReactNode` | nein | Die Kopfzeile; ohne sie bleibt die Zeile leer, das Raster steht | `Filled` |
| `children` | `ReactNode` | ja | Die Arbeitsfläche | `Filled` |
| `collapsed` | `boolean` | nein | Seitenleiste auf 64 px; der Aufrufer hält den Zustand | `Collapsed` |

`TopBar`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `crumb` | `ReactNode` | nein | Wo man ist, links | `Filled` |
| `search` | `ReactNode` | nein | Das Suchfeld in der Mitte | `Filled` |
| `actions` | `ReactNode` | nein | Rechts: Rollen-Marke, Einstellungen, Hilfe | `Filled` |

Keine Typen aus `src/ludwig/` — das Gerüst kennt weder Sitzung noch Mandant.

**Kann bewusst nicht:** den Einklapp-Zustand merken (`localStorage` gehört dem
Aufrufer, damit das Set keinen Browser-Speicher anfasst), den Pfad lesen,
navigieren, die Navigation kennen (das ist 0031), oder eine Rolle auswerten.

## Verhalten

- **Raster:** `grid-template-columns: 240px 1fr`, `grid-template-rows: 56px 1fr`;
  eingeklappt 64 px. Der Übergang ist eine Breitenänderung, kein Aufblenden (V12).
- **Sperre unter 1280 px (L1):** darunter erscheint statt der Arbeitsfläche
  ein Satz, der sagt, was fehlt — Rail, Liste und Detail lägen übereinander,
  und dann wird nicht mehr geprüft, sondern geraten. Reines CSS
  (`@media`), kein JavaScript, keine Prop.
- **Server-Component**, solange `collapsed` von außen kommt. Erst der
  Umschalt-Knopf in der Seitenleiste braucht einen Client-Wrapper — und der
  gehört zu 0031, nicht hierher.
- Die Kopfzeile ist ein `<header>`, die Fläche ein `<main>`; die Seitenleiste
  bringt ihr eigenes `<nav>` mit (0031).

## Stories

Titel `v3/Primitives/Rahmen/AppShell` — **neue Gruppe „Rahmen"** im Barrel,
wie im Katalog („Rahmen (Shell), außerhalb der Stufen"). Abgeleitet nach §6:
1 Zustand + 0 Enums + 1 Layout-Boolean (`collapsed`) + 1 Rundlauf (der
Aufrufer hält den Zustand — genau das ist zu zeigen) + 1 „im Einsatz"
+ 1 Rand (schmales Fenster) = 5.

| Story | Beweist |
|---|---|
| `Filled` | Raster mit Seitenleisten-Attrappe, Kopfzeile und Inhalt |
| `Collapsed` | 64-px-Leiste, der Inhalt wächst |
| `Interactive` | der Aufrufer schaltet um; die Shell merkt sich nichts |
| `Narrow` | die Sperre unter 1280 px, in einem 900 px breiten Rahmen |
| `InUse` | vollständig: Navigation (0031), `PageHeader` und eine `Card` darin |

Nicht anwendbar: `Leer` (eine Shell ohne Inhalt ist kein Zustand, sondern ein
leerer Screen), `Laedt`, `Fehler` — beides bringt die Fläche mit, nicht der Rahmen.

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

- [ ] Kein Import aus `next/*` — weder Router noch `next/image` (Blick in den Code)
- [ ] Kein Zugriff auf `localStorage` (Blick in den Code)
- [ ] `collapsed` schaltet die Spalte auf 64 px, ohne dass der Inhalt springt (Story `Collapsed`, Regel V12)
- [ ] Unter 1280 px erscheint die Sperre mit einem Satz, der den Grund nennt (Story `Narrow`, Regel L1/T6)
- [ ] Die Kopfzeile trägt nur Slots, keine Rolle und keinen Link (Blick in den Code)
- [ ] Die A5-Ausnahme für `app-chrome.css` steht in `design-guidelines.md`

## Offene Fragen

1. Bleibt die Kopfhöhe bei 56 px, wenn die Suche wächst? *Ohne Antwort: ja —
   die Suche passt sich an, nicht das Raster.*
2. Soll die Shell den Fokus beim Seitenwechsel setzen? *Ohne Antwort: nein,
   das ist Sache des Routers in der App.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
