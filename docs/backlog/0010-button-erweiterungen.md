# 0010 · Button erweitern: iconEnd, loading, fullWidth, xs

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` — Erweiterung eines vorhandenen Exports |
| Klassen-Test | entfällt — keine neue Komponente |
| Quelle | Knopf-Erhebung `ludwig/app` vom 2026-09-03 (441 `.tsx`, 11 Stylesheets) |
| Ersetzt | 81 Textwechsel-Konstrukte, 21 Inline-`padding`-Overrides, 10 handgebaute Icon-rechts-Knöpfe, 3 `width:100%`-Hacks |
| Blockiert | jede Seitenmigration, die einen schreibenden Knopf enthält |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

`Button` deckt Variante, Größe, Icon links, Hotkey und `href` ab. Vier
Fähigkeiten fehlen, die die App heute mit Inline-Styles und Textwechseln
nachbaut — zusammen **115 belegte Stellen**. Solange sie fehlen, bleibt in
jeder migrierten Seite ein `style={{}}` oder ein `{pending ? … : …}` stehen.

## Einordnung

- **Wiederverwenden:** `Button` ist die richtige Komponente; keine der vier
  Fähigkeiten rechtfertigt eine eigene.
- **Erweitert, weil:** Regel 2 — das `@when` („Every action with a word")
  deckt den Fall, es fehlen Designentscheidungen, die wiederkommen. Jede der
  vier ist in einem Halbsatz erklärbar und hat zweistellige Belege.
- **Zuschnitt:** keine neue Datei. `Button.tsx` bleibt.

**`loading` bleibt hier bewusst schmal:** Es stellt nur *dar*, dass etwas
läuft. Wer die Handlung selbst ausführen, Fehler zeigen und bestätigen will,
nimmt `ActionButton` (0004) — der setzt `loading` intern. So bleibt `Button`
Server-Component; `loading` ist ein Wert, den der Aufrufer übergibt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `iconEnd` | `ReactNode` | nein | Icon **rechts** vom Text — Pfeil „weiter", Chevron am Aufklapp-Auslöser | `IconEnd` |
| `loading` | `boolean` | nein | Handlung läuft: gesperrt, `aria-busy`, Spinner vor dem Text | `Loading` |
| `loadingLabel` | `string` | nein | Ersetzt die Beschriftung, solange `loading` — „Speichere …" | `Loading` |
| `fullWidth` | `boolean` | nein | Volle Breite, Inhalt zentriert — Login, Formularabschluss | `FullWidth` |
| `size` | `"xs" \| "sm" \| "md"` | nein | `xs` ≈ 26 px für dichte Zellen und Editoren; in der Tabellenzeile nur `xs`/`sm` | `SizesInRow` |

`icon` (links) bleibt unverändert. `icon` und `iconEnd` dürfen zusammen
gesetzt sein — die App hat einen solchen Fall (`.balchip`: Haken links,
Chevron rechts).

**Kann bewusst nicht:** die Handlung ausführen, Fehler zeigen, bestätigen
(alles `ActionButton`, 0004). Kein `size="lg"` — die Erhebung fand **null**
Belege; der Login-Knopf ist nicht größer, sondern `fullWidth`.

## Verhalten

Bleibt Server-Component.

- **`loading`:** setzt `disabled` und `aria-busy="true"`. Vor dem Text steht
  ein Spinner; daneben **immer ein Wort** — `loadingLabel`, sonst die
  unveränderte Beschriftung. Nie ein Spinner allein (V7).
- **Spinner:** das Design-System hat heute **keinen**. Diese Aufgabe bringt
  ihn mit: eine `@keyframes`-Drehung in `v3.css` plus eine Klasse, die auch
  außerhalb des Knopfs taugt (`Loading` 0016 wird darauf aufsetzen). Bewegung
  gleichmäßig, ohne Springen (§2).
- **`iconEnd`:** ändert nur die Reihenfolge im Knopf. Der Hotkey steht
  weiterhin ganz rechts — er ist die Taste, nicht Teil der Beschriftung.
- **`fullWidth`:** `width: 100%`, Inhalt zentriert. In einer `ActionBar`
  wirkungslos, weil die ihre Knöpfe selbst anordnet.
- **`xs`:** ≈ 26 px, Schrift eine Stufe kleiner. Für Zellen und Editoren, nicht
  für Seitenaktionen. In die Tabellenzeile gehören nur `xs` und `sm` — `md`
  drückt sie auf, was V1 verbietet („der Chip wird kleiner, nicht die Zeile
  größer"). Die Story `SizesInRow` zeigt beides nebeneinander.

## Stories

Titel `v3/Primitives/Aktion/Button` — die fünf vorhandenen bleiben, vier
kommen dazu.

| Story | Beweist |
|---|---|
| `IconEnd` | Pfeil rechts („Weiter zu Schritt 5"), Chevron rechts, und einmal beides |
| `Loading` | mit und ohne `loadingLabel`, neben einem Ruhezustand zum Vergleich |
| `FullWidth` | Login-Fall, Inhalt zentriert |
| `SizesInRow` | `xs`/`sm` fügen sich in die Zeile, `md` drückt sie auf — der Nachweis, welche Größe wohin gehört |

Nicht anwendbar: keine neuen Zustände; `Leer` und `LeerNachFilter` gelten für
einen Knopf nie.

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

- [ ] `loading` sperrt den Knopf, setzt `aria-busy` und zeigt **immer ein Wort** neben dem Spinner (Story `Loading`, Regel V7)
- [ ] Der Spinner dreht gleichmäßig und lässt den Knopf nicht springen (Story `Loading`, im Browser geprüft)
- [ ] `iconEnd` steht rechts vom Text, der Hotkey bleibt ganz rechts (Story `IconEnd`)
- [ ] `icon` und `iconEnd` zusammen funktionieren (Story `IconEnd`)
- [ ] `xs` und `sm` lassen die Zeilenhöhe unverändert; `md` drückt sie sichtbar auf und ist damit als Zeilen-Größe ausgeschlossen (Story `SizesInRow`, Regel V1)
- [ ] `fullWidth` zentriert den Inhalt (Story `FullWidth`)
- [ ] Die Datei trägt weiterhin kein `"use client"`
- [ ] Ersetzt den Textwechsel in `ConfirmReviewButton.tsx` und das Inline-`padding` in `CaseSummaryEditor.tsx:68` ohne Funktionsverlust

## Offene Fragen

1. Wie groß ist `xs` genau? *Ohne Antwort: 26 px (pad 4/10, 12 px Schrift) —
   das liegt zwischen den beiden vorhandenen App-Klassen `.vconfirm` (11 px)
   und `.rcard__edit` (12 px).*
2. Soll `loading` ohne `loadingLabel` die Beschriftung behalten oder auf „…"
   wechseln? *Ohne Antwort: behalten — 12 App-Stellen zeigen heute nur „…",
   und das sagt der Nutzerin nichts.*

## Nachtrag 2026-09-03 · Optik an den App-Rahmen nachgezogen

Owner-Befund: die Knöpfe im Storybook wirken neben denen der App „nicht
kompakt und modern", der Glanz sei „altbacken" und in Ludwig längst
herausgenommen. Verglichen mit `src/styles/app-chrome.css` §BUTTONS
(dort steht die Fassung der App) stimmte das — `.v2btn` trug einen Schatten
**im Ruhezustand** und war drei Pixel höher. Geändert in `v3.css`, ohne eine
Prop anzufassen:

| | vorher | jetzt |
|---|---|---|
| Schatten | `--shadow-xs` im Ruhezustand (primär, danger) | keiner; `--shadow-md` erst beim Hover, `--shadow-sm` beim Drücken |
| Drücken | nichts | `translateY(0.5px)`, dunklere Fläche (`--color-primary-800`) |
| Gewicht | 600 | 500 (wie `.btn` der App) |
| Zeilenhöhe | fix 20 px | Faktor 1.2 |
| Innenabstand `md` | 9 / 16 px → 40 px hoch | 8 / 14 px → **35 px** hoch |
| Innenabstand `sm` · `xs` | 6 / 13 px · 4 / 10 px | 6 / 12 px · 4 / 9 px, Radius `--radius-md` |
| Schriftgrößen | 14 / 13 / 12 px roh | `--fs-ui-md` / `--fs-ui` / `--fs-ui-sm` |
| Sekundär | Text `--color-text` | Text `--color-primary`, Hover-Rand `--color-primary` |

Nachweis: `v3-primitives-aktion-button--variants` und `--sizes` im Browser;
gemessen 35 / 30 / 25 px Höhe, `box-shadow: none` im Ruhezustand, Gewicht 500.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
