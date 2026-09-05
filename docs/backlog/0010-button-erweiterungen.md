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

Abgenommen gegen Spec und Code (zweiter Agent), 2026-09-05. Stories im
Browser auf `localhost:6107` geöffnet und vermessen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Story-Deckung** — jede Prop der Schnittstelle hat ihre Story | `iconEnd` → `--icon-end`; `loading`/`loadingLabel` → `--loading`; `fullWidth` → `--full-width`; `size` → `--sizes-in-row` und `--sizes`. Alle neun Stories stehen in `localhost:6107/index.json`. `Leer`/`LeerNachFilter` sind in der Spec begründet ausgeschlossen | ✓ |
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0 — zu Beginn und am Ende der Abnahme. `pnpm build` nicht erneut gelaufen: er schreibt nach `storybook-static`, und parallel laufen weitere Abnahmen; der Lauf für diesen Stand meldete „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Button.tsx` + `Button.stories.tsx`; Titel `v3/Primitives/Aktion/Button` (`Button.stories.tsx:6`), Gruppe „Aktion" wie im Barrel (`src/ui/v3/index.ts:42`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Der neue Code (Props, `classes`, `inner`) ist englisch, `Button` trägt beide Zeilen (`Button.tsx:87–94`). Nicht erfüllt: der Dateikopf `Button.tsx:5–14` und die `hotkey`-JSDoc `Button.tsx:35–39` sind weiter deutsch, obwohl 0010 die Datei angefasst hat (CLAUDE.md); `KeyButton` (`Button.tsx:150–156`) trägt nur `@when`, kein `@instead` | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,6}\b\|[0-9]+px' src/ui/v3/primitives/Button.tsx` → kein Treffer; die Maße stehen in `v3.css` (`.v2btn--xs` 1612, `.v2btn--full` 1615, `.v2spin` 1622); kein Status, keine Label-Map im Knopf | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `v3-primitives-aktion-button--icon-end`, `--loading`, `--full-width`, `--sizes-in-row` in `index.json`; die fünf alten unverändert vorhanden | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Durchgegangen; die zwei App-Punkte übersprungen (Skill `v3-komponente`, Abschnitt „Abnahme"). Gerissen ist **V1** („Chip/Button/Icon drückt die Zeile auf") — siehe die Zeile zu `SizesInRow`. Der Rest trägt: kein zentrierter Text, Farbe nur als Kritikalitätsstufe, Fokusring sichtbar, Lucide 1.5 px, kein Icon ohne Wort | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | `--loading`, `--icon-end`, `--full-width`, `--sizes-in-row`, `--with-key` in Chromium auf `localhost:6107` geöffnet, Screenshot + DOM-Probe je Story; alle rendern gestylt | ✓ |
| `loading` sperrt den Knopf, setzt `aria-busy` und zeigt immer ein Wort neben dem Spinner (V7) | `--loading`, DOM-Probe: beide laufenden Knöpfe `disabled=true`, `aria-busy="true"`, `.v2spin` mit `aria-hidden="true"`, Beschriftung „Speichere …" bzw. unverändert „Stapel prüfen" — nie ein Spinner allein | ✓ |
| Der Spinner dreht gleichmäßig und lässt den Knopf nicht springen | `--loading`: `animation: v2spin 0.7s linear infinite`, 14 × 14 px; alle drei Knöpfe der Story sind 34.8 px hoch — laufend wie ruhend, kein Sprung. `v3.css:1635–1637` verlängert die Dauer bei `prefers-reduced-motion` auf 2.4 s | ✓ |
| `iconEnd` steht rechts vom Text, der Hotkey bleibt ganz rechts | `--icon-end`, Kindfolge des vierten Knopfs im DOM: `span[Volles Konto öffnen]` · `svg.lucide-arrow-right` · `kbd.v2kbd[W]` | ✓ |
| `icon` und `iconEnd` zusammen | `--icon-end`, dritter Knopf: `svg.lucide-check` · `span[Saldo stimmt]` · `svg.lucide-chevron-down` | ✓ |
| `xs` und `sm` lassen die Zeilenhöhe unverändert; `md` drückt sie sichtbar auf (V1) | `--sizes-in-row`, gemessene Höhen der `.v2tbl__row`: Referenzzeile ohne Knopf **47.3 px**, mit `xs` **52 px**, mit `sm` **57.2 px**, mit `md` **60.8 px**. Auch `xs` drückt die Zeile um 4.7 px auf (+10 %), `sm` um 9.9 px (+21 %); im Screenshot ist die Referenzzeile sichtbar niedriger. Der Knopf ist 25 / 30.2 / 34.8 px hoch, die Zeile hat rechnerisch 20.25 px Zeilenhöhe Platz | ✗ |
| `fullWidth` zentriert den Inhalt | `--full-width`: beide Knöpfe 320 px breit = Breite des Elternelements, `justify-content: center`, Klasse `v2btn--full` | ✓ |
| Die Datei trägt weiterhin kein `"use client"` | `grep -l '"use client"' src/ui/v3/primitives/Button.tsx` → kein Treffer | ✓ |
| Ersetzt den Textwechsel in `ConfirmReviewButton.tsx` und das Inline-`padding` in `CaseSummaryEditor.tsx:68` | Beide Dateien liegen in `ludwig/app` (`apps/web/src/modules/invoices/ui/` bzw. `…/accounting-cases/ui/`); in diesem Repo nicht erfüllbar | offen (App) |

Abgenommen von / am: — (nicht abgenommen) · Geprüft von: Claude (Abnahme-Agent), 2026-09-05

**Offene Punkte:**

1. **`xs` und `sm` drücken die Tabellenzeile auf.** Die Story `SizesInRow`
   behauptet in ihrem Kommentar „die Zeile bleibt so hoch wie die ohne Knopf";
   gemessen sind 52 px (`xs`) und 57.2 px (`sm`) gegen 47.3 px ohne Knopf.
   Entweder muss der Knopf in der Zeile flacher werden (V1: „der Chip wird
   kleiner, nicht die Zeile größer") oder das Kriterium wird auf ein Maß
   umgeschrieben, das der Baustein halten kann.
2. **Deutsche Kommentare in einer angefassten Datei.** `Button.tsx:5–14`
   (Dateikopf) und `:35–39` (`hotkey`) sind deutsch. Der Kopf ist zusätzlich
   veraltet: er nennt „zwei Größen" und „`md` (40 px) … `sm` (32 px)", während
   die Datei jetzt drei Größen kennt und der Nachtrag dieser Spec 35 / 30 /
   25 px festhält (gemessen 34.8 / 30.2 / 25 px). Auch die Story-Doku
   `Button.stories.tsx:26–27` nennt noch 40 / 32 / 26 px.
3. **`KeyButton` hat kein `@instead`** (`Button.tsx:150–156`).

## Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — `xs` und `sm` drückten die Tabellenzeile auf.** Gemessen 52 px (`xs`)
und 57,2 px (`sm`) gegen 47,3 px ohne Knopf, während der Story-Kommentar das
Gegenteil behauptete. V1 sagt: der Chip wird kleiner, nicht die Zeile größer —
also wurde der Knopf kleiner.

Eine Regel in `v3.css`: im Zeilenkontext nimmt ein `xs`- oder `sm`-Knopf die
Zeilenhöhe des Textes neben ihm an (`--v2-row-fs` × 1,5), ohne senkrechten
Innenabstand und oben im Zeilenkasten ausgerichtet. Das ist **keine vierte
Größe**: außerhalb der Tabelle bleiben 35 / 30 / 25 px unverändert. Dieselbe
Regel behebt M1 von 0008.

Nachgemessen (Chromium headless, 1440 × 900, Story `SizesInRow`): alle drei
Zeilen — `xs`, `sm` und die ohne Knopf — stehen bei **47,25 px**; der Knopf
misst 20,25 px. Die vierte Zeile mit `md` steht weiter bei 60,8 px und belegt
damit, was das Kriterium verlangt: `md` gehört nicht in die Liste.

**M2 — deutsche Kommentare in einer angefassten Datei.** Dateikopf und die
`hotkey`-Prop stehen auf Englisch; der Kopf nennt jetzt drei Größen mit den
gemessenen Maßen und den Sonderfall Zeile. `Button.stories.tsx` nannte
40 / 32 / 26 px — korrigiert auf 35 / 30 / 25 px.

**M3 — `KeyButton` hatte kein `@instead`.** Steht: eine Handlung, deren Taste
optional ist → `Button`; eine, die läuft und scheitern kann → `ActionButton`.

## Abnahmekriterien (Nachtrag)

- [ ] Eine Zeile mit `xs`- oder `sm`-Knopf ist so hoch wie eine ohne (Story `SizesInRow`, gemessen)
- [ ] `md` drückt die Zeile weiterhin sichtbar auf (dieselbe Story)
- [ ] Außerhalb der Tabelle messen die drei Größen unverändert 35 / 30 / 25 px (Story `Sizes`)
- [ ] Kein deutscher Kommentar mehr in `Button.tsx` und `Button.stories.tsx` (`grep`)
- [ ] `KeyButton` trägt `@when` und `@instead`


## Abnahme der Nachbesserung, 2026-09-05

Fremder Prüfer, weder Erbauer noch Vorprüfer. Geprüft gegen die festen
Kriterien und gegen den Nachtrag. Gemessen in einem eigenen headless Chromium
(1440 × 900) auf `localhost:6107`; die fehlende Trennlinie der letzten Zeile
ist herausgerechnet, nicht als Unterschied gezählt.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` nicht gestartet: er schreibt nach `storybook-static`, und parallel arbeiten weitere Sitzungen | ✓ (Build zitiert) |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Button.tsx` + `Button.stories.tsx`; Titel `v3/Primitives/Aktion/Button` (`Button.stories.tsx:6`), Gruppe „Aktion" wie im Barrel (`src/ui/v3/index.ts:44–50`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `Button.tsx` ist durchgängig englisch — Dateikopf (`:5–17`), `hotkey` (`:38–42`), `inner` (`:65–71`). `Button` trägt beide Zeilen (`:90–97`), `KeyButton` ebenso (`:153–161`). **`Button.stories.tsx` ist es nicht** — siehe die Nachtrag-Zeile darunter | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}\b|[0-9]+px|fontSize' src/ui/v3/primitives/Button.tsx` → 0. Die Maße stehen in `v3.css`; kein Status, keine Label-Map im Knopf | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--variants`, `--sizes`, `--with-key`, `--disabled`, `--as-link`, `--icon-end`, `--loading`, `--full-width`, `--sizes-in-row` — neun. `Leer`/`LeerNachFilter` in der Spec begründet ausgeschlossen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Der Punkt, der gerissen war — **V1** — hält jetzt (Zeile darunter). Der Rest unverändert: kein zentrierter Text, Farbe nur als Kritikalitätsstufe, Fokusring sichtbar, Lucide 1,5 px, kein Icon ohne Wort, keine Versalien. Die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | `--sizes`, `--sizes-in-row`, `--loading`, `--icon-end`, `--full-width` geöffnet und vermessen; alle rendern gestylt | ✓ |

**Variabel (aus der Spec)** — die Punkte, die schon in der Vorrunde ✓ waren,
sind nachgeprüft und unverändert:

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `loading` sperrt, setzt `aria-busy`, zeigt immer ein Wort (V7) | `--loading`: beide laufenden Knöpfe `disabled`, `aria-busy="true"`, `.v2spin` mit `aria-hidden`, Beschriftung „Speichere …" bzw. „Stapel prüfen" | ✓ |
| Der Spinner dreht gleichmäßig, der Knopf springt nicht | `--loading`: alle drei Knöpfe 34,8 px, laufend wie ruhend | ✓ |
| `iconEnd` rechts, Hotkey ganz rechts · `icon` und `iconEnd` zusammen | `--icon-end`: `span` · `svg.lucide-arrow-right` · `kbd.v2kbd`; dritter Knopf `svg.lucide-check` · `span` · `svg.lucide-chevron-down` | ✓ |
| `fullWidth` zentriert den Inhalt | `--full-width`: beide Knöpfe auf Elternbreite, Inhalt zentriert | ✓ |
| Die Datei trägt weiterhin kein `"use client"` | `grep -l '"use client"' src/ui/v3/primitives/Button.tsx` → kein Treffer | ✓ |
| Ersetzt `ConfirmReviewButton.tsx` und das Inline-`padding` in `CaseSummaryEditor.tsx` | Beide liegen in `ludwig/app`, hier nicht erfüllbar | offen (App) |

**Nachtrag**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Eine Zeile mit `xs`- oder `sm`-Knopf ist so hoch wie eine ohne (Story `SizesInRow`, gemessen) | `--sizes-in-row`, alle drei Zeilen tragen ihre Trennlinie: `xs` **47,25 px**, `sm` **47,25 px**, ohne Knopf **47,25 px**. Zellenhöhen in jeder Zeile 22,25 px; die Knöpfe messen 20,25 px bei `min-height: 20.25px`, `padding-block: 0`, `vertical-align: top` und sind nicht abgeschnitten (`scrollHeight == clientHeight == 18`). Der Vorwurf der Vorrunde (52 / 57,2 gegen 47,3 px) ist erledigt | ✓ |
| `md` drückt die Zeile weiterhin sichtbar auf (dieselbe Story) | Vierte Zeile: **60,80 px** ohne Trennlinie, weil sie die letzte ist — mit ihr 61,80 px, also 14,55 px über den anderen. Der Knopf ist 34,80 px hoch, `min-height: 0px`, die Aktionszelle 36,80 px. `md` bleibt damit als Zeilen-Größe ausgeschlossen | ✓ |
| Außerhalb der Tabelle messen die drei Größen unverändert 35 / 30 / 25 px (Story `Sizes`) | `--sizes`, gemessen: `md` **34,80 px**, `sm` **30,19 px**, `xs` **25,00 px**, jeweils `min-height: auto`, Innenabstand 8 / 6 / 4 px. Deckt sich mit dem Nachtrag „Optik an den App-Rahmen nachgezogen" | ✓ |
| Kein deutscher Kommentar mehr in `Button.tsx` und `Button.stories.tsx` (`grep`) | **Reißt.** `Button.tsx` ist sauber. `Button.stories.tsx` trägt sieben deutsche JSDoc-Zeilen: `:14` „Vier Rollen. `danger` nur, wo etwas verloren geht …", `:41` „Die Taste steht am Knopf …", `:52` „Gesperrt heißt gesperrt …", `:64` „Als Link gerendert …", `:74` „Icon rechts: der Weg nach vorn …", `:95` „Läuft gerade: gesperrt, Spinner …", `:108` „Vollbreit statt größer …". Die drei letzten stehen an Stories, die **diese Aufgabe** angelegt hat (`IconEnd`, `Loading`, `FullWidth`) — es ist also kein Altbestand. Auf Englisch stehen nur `Sizes` (`:26–28`) und `SizesInRow` (`:120–125`), die beiden, die der letzte Durchgang angefasst hat | ✗ |
| `KeyButton` trägt `@when` und `@instead` | `Button.tsx:153–161`: „@when Action bars where every action has a key." / „@instead A single action whose key is optional → Button. An action that runs, can fail and may need a confirmation → ActionButton." | ✓ |

**Die neue Regel schadet anderswo nicht.** Die Regel steht in `v3.css` am Ende
(„Knopf in der Tabellenzeile", `.v2tbl__row .v2btn--xs, .v2tbl__row
.v2btn--sm`). Nachgesehen:

- **Aufklappbereich** (`.v2tbl__detail`) liegt neben der Zeile, nicht darin
  (`ExpandableRow.tsx:96–100`); drei Knöpfe zur Probe hineingesetzt und
  gemessen: 30,19 / 25,00 / 34,80 px bei `min-height: 0px` — normale Maße.
- **Dichte:** eigens gebaute Tabellen mit `compact` / `default` / `wide`.
  `compact` 35,75 px für `xs`, `sm` und die Zeile ohne Knopf (Knopf 18,75 px =
  `--v2-row-fs` 12,5 × 1,5); `default` 47,25 px; `wide` 59,25 px — je alle
  drei gleich. `md` treibt in jeder Dichte auf (50,8 / 60,8 / 72,8 px).
- **Set-weit:** **alle 521 Stories** aus `index.json` abgefahren, jedes
  `.v2btn` unter einer `.v2tbl__row` vermessen. Sechs Stories betroffen
  (`--sizes-in-row`, `overflowmenu--in-row`, `datatable--row-actions`,
  `sourcedocumentdrawer--im-kontext`, `sourcedocumentpreview--in-use`,
  `sachverhalt-crud--full-cycle`); jeder Knopf 20,25 px, keiner abgeschnitten,
  jede Zeile auf der Höhe ihrer Nachbarn. Kein einziges `.v2btn` in einem
  `.v2tbl__detail` im ganzen Set. `ExpandableRow` erzeugt den Aufklappbereich
  als Schwester der Zeile; `Review.tsx` und `ComparisonTable.tsx` enthalten
  weder `Button` noch `v2btn`.

**Zurück auf `in Arbeit`.** Ein Mangel:

1. **Deutsche Story-Kommentare in `Button.stories.tsx`.** Das
   Nachtrag-Kriterium nennt die Datei ausdrücklich; sieben JSDoc-Blöcke sind
   noch deutsch (`:14`, `:41`, `:52`, `:64`, `:74`, `:95`, `:108`), drei davon
   an Stories, die diese Aufgabe selbst angelegt hat. Übersetzen — der Rest
   der Datei steht bereits auf Englisch.

**Befund** (kein Mangel dieser Aufgabe): deutsche Story-JSDoc gibt es
set-weit, auch in `OverflowMenu.stories.tsx`, `FileDrop.stories.tsx`,
`Markdown.stories.tsx` und `ChoicePrompt.stories.tsx`. Nur hier steht die
Datei namentlich in einem Kriterium; für die übrigen gehört das in eine eigene
Aufgabe.

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-05

## Der Mangel der Abnahme vom 2026-09-05 (zweite Runde) — behoben

Sieben deutsche JSDoc-Blöcke in `Button.stories.tsx` (`Variants`, `WithKey`,
`Disabled`, `AsLink`, `IconEnd`, `Loading`, `FullWidth`) stehen auf Englisch.
Drei davon gehören zu Stories, die diese Aufgabe selbst angelegt hat; das
Nachtrag-Kriterium nennt die Datei ausdrücklich. Deutsch bleibt, was im Bild
steht: die Beschriftungen der Knöpfe.
