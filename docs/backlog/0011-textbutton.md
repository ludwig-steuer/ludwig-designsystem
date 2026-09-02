# 0011 · TextButton

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, eine Handlung im Fließtext ist fachfrei |
| Quelle | Knopf-Erhebung `ludwig/app` vom 2026-09-03 — `.v2link` 70 Stellen, `.v2link--quiet` 16 |
| Ersetzt | 86 handgeschriebene `className="v2link"` / `"v2link v2link--quiet"` |
| Blockiert | jede Seitenmigration mit Aktionen in Zeilen und Fließtext |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die zweithäufigste Knopfform der App ist kein Knopf: `.v2link` sieht aus wie
ein Link, verhält sich wie eine Handlung, hat keinen Innenabstand und kein
Rechteck. Sie steht in Tabellenzeilen, neben Beträgen, in Aufklapp-Köpfen —
**86-mal**, jedes Mal als roher `className`-String. Im Design-System existiert
sie nicht.

## Einordnung

- **Wiederverwenden:** `Button variant="tertiary"` ist rahmenlos, hat aber
  Knopf-Geometrie: Innenabstand, Höhe, Fläche beim Hover. `.v2link` hat
  `padding: 0`, Textgröße und unterstreicht beim Hover. Wer `tertiary` in eine
  Tabellenzelle setzt, drückt die Zeile auf — genau das verbietet V1.
  `Link` ist ein Sprung, keine Handlung.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, **86** belegte
  Verwendungen. Es ist keine Ausprägung von `tertiary`, sondern eine eigene
  Form: andere Geometrie, anderes Hover.
- **Zuschnitt:** eine Datei, ein Export mit zwei Lautstärken über `tone`.
  Kein Familien-Fall.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `ReactNode` | ja | Die Handlung, Imperativ mit Objekt (T3) | `Filled` |
| `tone` | `"default" \| "quiet"` | nein | `default` in Akzentfarbe, halbfett; `quiet` in `--color-text-muted`, normal | `Tones` |
| `icon` | `ReactNode` | nein | Lucide-Icon links, nie allein (T8) | `WithIcon` |
| `href` | `string` | nein | Sprung statt Handlung; rendert einen `Link` in derselben Optik | `AsLink` |
| `disabled` | `boolean` | nein | Nicht auslösbar | `Tones` |
| `onClick` | `() => void` | nein | Handlung; braucht einen Client-Aufrufer | `Interactive` |

**Kann bewusst nicht:** laden (`loading` gehört an einen Knopf mit Fläche, wo
ein Spinner Platz hat — `Button`, 0010), Varianten außer den zwei Lautstärken,
Größen (die Schriftgröße kommt aus dem Umfeld).

## Verhalten

Server-Component ohne `onClick`; mit `onClick` braucht der Aufrufer einen
Client-Wrapper — wie bei `Button`.

- **Geometrie:** `padding: 0`, keine eigene Höhe, keine Fläche. Er fügt sich
  in die Zeile ein, statt sie aufzudrücken (V1).
- **Hover:** Unterstreichung, keine Fläche (§2 nennt genau diese Ausnahme:
  „Hintergrund eine Tonstufe (Link: Unterstreichung)").
- **Fokus:** sichtbarer Fokusring wie bei jedem Knopf.
- **Abgrenzung im Markup:** mit `href` ein `<a>`, sonst ein `<button>` — nie
  ein `<a>` ohne Ziel und nie ein `<div>` mit `onClick`.
- **In der Zeile:** trägt eine Listenzeile bereits einen Zeilen-Link, liegt
  der `TextButton` darüber und behält sein eigenes Ziel (I11).

## Stories

Titel `v3/Primitives/Aktion/TextButton`. Abgeleitet nach §6: 1 Zustand
+ 1 Enum (`tone`) + 0 Layout-Booleans + 1 Callback + 1 „im Einsatz"
+ 1 Rand (in der Tabellenzelle) + 1 als Link = 6.

| Story | Beweist |
|---|---|
| `Filled` | eine Handlung im Fließtext |
| `Tones` | `default` und `quiet` nebeneinander, dazu `disabled` |
| `WithIcon` | Icon links, mit Wort |
| `AsLink` | mit `href` — gleiche Optik, anderes Markup |
| `Interactive` | Rundlauf über `onClick` |
| `InRow` | in einer Tabellenzelle neben einem Betrag — die Zeilenhöhe bleibt |

Nicht anwendbar: `Leer`, `Laedt` (siehe „Kann bewusst nicht"), `Fehler`.

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

- [ ] In einer Tabellenzeile bleibt die Zeilenhöhe unverändert — im Storybook neben einer Zeile ohne Knopf sichtbar (Story `InRow`, Regel V1)
- [ ] Hover unterstreicht, färbt keine Fläche (Story `Filled`, Regel §2)
- [ ] Mit `href` entsteht ein `<a>`, ohne ein `<button>` (Story `AsLink`, Blick ins DOM)
- [ ] `quiet` ist ohne Farbe am Schriftschnitt unterscheidbar (Story `Tones`, Regel V7)
- [ ] Die `@when`-Zeile grenzt gegen `Button variant="tertiary"` ab
- [ ] Ersetzt `className="v2link"` in `StapelZeilenmenue.tsx` ohne Funktionsverlust

## Offene Fragen

1. Heißt er `TextButton` oder `LinkButton`? *Ohne Antwort: `TextButton` —
   „Link" führt in die Irre, weil er meist nichts verlinkt.*
2. Soll `tone="quiet"` auch kleiner sein? *Ohne Antwort: nein, nur leiser
   (Schriftschnitt und Farbe) — die App nutzt beide in derselben Größe.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Gebaut: Claude, 2026-09-03 ·
Offene Punkte für den Abnehmenden:

1. `.v2link` steht fest auf `12.5px` (Bestand, 86 Stellen hängen dran) — die
   Spec sagt „die Schriftgröße kommt aus dem Umfeld". Im Fließtext (Story
   `Filled`) ist er dadurch eine halbe Stufe kleiner als der Satz. Auf
   `font-size: inherit` umstellen wäre eine Änderung an allen Bestandsstellen
   und gehört in eine eigene Aufgabe.
2. Das Kriterium „ersetzt `className="v2link"` in `StapelZeilenmenue.tsx`"
   zielt auf `ludwig/app` und wird dort fällig — wie die beiden App-Punkte der
   Prüfliste §9. Hier ersetzt ist `SelectionBar`; 25 weitere rohe `v2link`
   stehen noch in `JournalEntryEditor.tsx` und in fünf Story-Dateien.
