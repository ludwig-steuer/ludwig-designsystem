# 0011 · TextButton

| | |
|---|---|
| Status | fertig |
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

Abgenommen gegen Spec und Code (zweiter Agent), 2026-09-05. Alle sechs Stories
im Browser auf `localhost:6107` geöffnet, DOM und berechnete Stile vermessen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Story-Deckung** — jede Prop der Schnittstelle hat ihre Story | `children` → `--filled`; `tone` und `disabled` → `--tones`; `icon` → `--with-icon`; `href` → `--as-link`; `onClick` → `--interactive`; Rand → `--in-row`. Sechs Stories, genau die Ableitung der Spec; alle in `localhost:6107/index.json`. `Leer`, `Laedt`, `Fehler` sind in der Spec begründet ausgeschlossen | ✓ |
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0 — zu Beginn und am Ende der Abnahme. `pnpm build` nicht erneut gelaufen (schreibt nach `storybook-static`, parallele Abnahmen); der Lauf für diesen Stand meldete „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/TextButton.tsx` + `TextButton.stories.tsx`; Titel `v3/Primitives/Aktion/TextButton` (`TextButton.stories.tsx:9`), Gruppe „Aktion" wie im Barrel (`src/ui/v3/index.ts:52`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `TextButton.tsx` ist durchgehend englisch (Kopf, Prop-JSDoc, Bezeichner); der einzige Export trägt beide Zeilen (`TextButton.tsx:46–52`) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,6}\b\|[0-9]+px' src/ui/v3/primitives/TextButton.tsx` → kein Treffer; Geometrie, Farbe und Hover stehen in `v3.css:187–203`; kein Status im Baustein | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `v3-primitives-aktion-textbutton--filled`, `--tones`, `--with-icon`, `--as-link`, `--interactive`, `--in-row` in `index.json` | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Durchgegangen; die zwei App-Punkte übersprungen (Skill `v3-komponente`). Text links, nichts zentriert; keine Farbe als Kategorie; Fokusring `2px solid var(--color-focus)`, Offset 2 px, per Tab geprüft; Icon nur mit Wort (`--with-icon`); kein Emoji, keine Versalien; Hover antwortet. Kontrast auf der Karte (Story `--in-row`, weiße Fläche): `rgb(46,120,168)` = 4.84:1, `quiet` `rgb(92,92,92)` = 6.49:1 | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories in Chromium auf `localhost:6107` geöffnet, Screenshot je Story; alle rendern gestylt | ✓ |
| In einer Tabellenzeile bleibt die Zeilenhöhe unverändert (V1) | `--in-row`, gemessene `.v2tbl__row`-Höhen: Zeile mit zwei `TextButton` **47.3 px**, Referenzzeile ohne Knopf **47.3 px**, Zeile mit einem Knopf **46.3 px**. Der Knopf selbst ist 15 px hoch — er fügt sich ein, statt die Zeile aufzudrücken | ✓ |
| Hover unterstreicht, färbt keine Fläche (§2) | `--filled`, vor dem Hover `text-decoration-line: none`, `background-color: rgba(0,0,0,0)`; nach `hover` auf denselben Knopf: `underline`, Hintergrund unverändert `rgba(0,0,0,0)`, Breite unverändert 81.9 px | ✓ |
| Mit `href` entsteht ein `<a>`, ohne ein `<button>` | `--as-link`, DOM: beide Elemente `A` mit `href="#"`, Klasse `v2link` bzw. `v2link v2link--quiet v2link--icon`. `--tones` ohne `href`: alle vier Elemente `BUTTON` mit `type="button"` | ✓ |
| `quiet` ist ohne Farbe am Schriftschnitt unterscheidbar (V7) | `--tones`, berechnete Stile: `default` `font-weight: 600`, `quiet` `font-weight: 400` — beide 12.5 px, der Unterschied trägt ohne Farbe | ✓ |
| Die `@when`-Zeile grenzt gegen `Button variant="tertiary"` ab | `TextButton.tsx:49–51`: „An action with a surface, a size, a spinner → Button (`tertiary` is borderless but still has button geometry)" — die Abgrenzung steht im `@instead` des `@when`-Blocks und nennt `tertiary` beim Namen | ✓ |
| Ersetzt `className="v2link"` in `StapelZeilenmenue.tsx` ohne Funktionsverlust | Die Datei liegt in `ludwig/app` (`apps/web/src/modules/datev-export/ui/StapelZeilenmenue.tsx`); in diesem Repo nicht erfüllbar | offen (App) |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Gebaut: Claude, 2026-09-03

**Offene Punkte** (kein Kriterium dieser Spec, gehören in eigene Aufgaben):

1. Die Schriftgröße kommt **nicht** aus dem Umfeld, wie die Schnittstelle es
   beschreibt: `.v2link` steht fest auf `12.5px` (`v3.css:190`), im Fließtext
   der Story `--filled` (13 px) also eine halbe Stufe kleiner. Der Bauende hat
   das gemeldet; 86 Bestandsstellen hängen daran, `font-size: inherit` ist eine
   eigene Aufgabe.
2. Auf `--color-bg-soft` (der Storybook-Fläche, `#f4f6f8`) misst der
   `default`-Ton 4.47:1 — knapp unter 4.5. Auf der Karte, wo er im Produkt
   steht, sind es 4.84:1. Betrifft `--color-accent-700`, nicht diesen Baustein.
3. In `JournalEntryEditor.tsx` und fünf Story-Dateien stehen weiterhin rohe
   `className="v2link"` statt `TextButton` — Aufräumarbeit im Set, kein Mangel
   des Bausteins.
