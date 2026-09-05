# 0037 · Typografie-Story — was es an Schrift schon gibt

| | |
|---|---|
| Status | fertig |
| Stufe | keine Komponente — eine Story zu `src/styles/tokens.css`, neue Storybook-Gruppe `v3/Grundlagen` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Schriftstufen sind fachfrei |
| Quelle | `docs/backlog/0034-shadcn-abgleich.md` §A4 (shadcn-Abgleich, Registry-Eintrag `typography`) |
| Ersetzt | nichts — die Klassen stehen, nur ohne Nachweis |
| Blockiert | jede Seitenmigration, die „welche Stufe nehme ich?" beantworten muss; später Farbe und Raum in derselben Gruppe (§11.7 Stufe 0) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Abgleich mit shadcn (0034) fand für „Typography" alles vor: `h1`–`h4` mit
`.lw-h1`–`.lw-h4`, `.lw-body`, `.lw-body-sm`, `.lw-caption`, `.lw-overline`,
`.lw-mono`, dazu `ProseCard` und `Markdown`. Was fehlt, ist der Nachweis:
Storybook ist die Antwort auf „wovon gibt es v3?", und **was keine Story hat,
gilt nicht als vorhanden**. Wer heute eine Seite baut, sieht die Stufen
nirgends nebeneinander und greift zur nächstbesten — oder schreibt eine
Größe in TSX (V13).

## Einordnung

- **Wiederverwenden:** die Klassen selbst; kein Code wird angefasst, kein CSS
  ergänzt. §3 Regel 1 in Reinform — ein `@when` (hier: die Klasse) deckt den
  Fall, die Aufgabe ist damit keine Komponenten-Spec, sondern der fehlende
  Nachweis.
- **Neu, weil:** nichts wird neu. Neu ist allein die Storybook-Gruppe
  `v3/Grundlagen`, die später Farbe und Raum aufnimmt.
- **Zuschnitt:** eine Datei `src/ui/v3/Typography.stories.tsx` — auf der
  Ebene des Barrels, weil sie zu keiner Stufe gehört.
- **Setzt auf:** `tokens.css`. Für den Einsatz-Fall zusätzlich `ProseCard`.

## Schnittstelle

Keine — die Aufgabe liefert keine Komponente und damit keine Props. Der
Abschnitt entfällt aus diesem Grund.

## Verhalten

Keins: reine Anzeige. Die Story ist eine Server-Component ohne Zustand.

Inhalt, festgelegt:

- **Die Stufen einmal je Klasse mit echtem Text**, nicht mit „Lorem": eine
  Überschrift eines Sachverhalts, ein Absatz aus einem Bericht, eine
  Kontonummer in `.lw-mono`, eine Overline „Zusatzweg" — die Daten sehen aus
  wie Ludwig-Daten (§6).
- **Die zwei Register** (A1) nebeneinander: produktiv 13,5–14 px, lesend
  16 px, jeweils mit dem Ort, an dem sie gelten (`/clients/**` gegen
  `/hilfe/**`).
- Kein neues CSS, kein neues Token, keine Größe in TSX außer den beiden
  Register-Beispielen, die genau das zeigen sollen.

## Stories

Titel `v3/Grundlagen/Typografie`. Abgeleitet nach §6: eine Anzeige ohne Props
hat keine Zustände und keine Enums; es bleiben 1 Übersicht + 1 „im Einsatz"
+ 1 Rand = 3, dazu die Leiter des produktiven Registers = 4.

| Story | Beweist |
|---|---|
| `Scale` | jede Klasse einmal, mit Name, Klasse und echtem Text |
| `Interface` | die Leiter des produktiven Registers (`--fs-ui-*`) mit ihren Einsatzorten |
| `Registers` | produktiv gegen lesend am selben Absatz (A1) |
| `InUse` | ein Ausschnitt einer Seite: Overline, `h3`, Absatz, `.lw-caption`, Mono-Kontonummer in einer `ProseCard` |

Nicht anwendbar: `Empty`, `EmptyAfterFilter`, `Loading`, `Error` — eine
Schriftprobe hat keine Daten und lädt nicht.

## Abnahme

Abgenommen am 2026-09-05 von einem zweiten Agenten (nicht dem bauenden).
Geprüfter Stand: `e3c38e7`; `src/ui/v3/Typography.stories.tsx` ist im
Arbeitsbaum unverändert. Gebaut in `f760c12` („Welle A des shadcn-Abgleichs"),
nachgezogen in `49aa023` („Eine Typo-Leiter für das produktive Register").
Nachweise vom laufenden Storybook auf Port 6107, gemessen in einer eigenen
Chromium-Instanz (1280 × 900) über `getComputedStyle`.

### Story-Deckung

Keine Props — die Aufgabe liefert keine Komponente. `index.json` listet genau
die vier abgeleiteten Stories unter `v3/Grundlagen/Typografie`: `--scale`,
`--interface`, `--registers`, `--in-use`. `Empty`/`EmptyAfterFilter`/
`Loading`/`Error` sind oben begründet ausgeschlossen (eine Schriftprobe hat
keine Daten und lädt nicht).

**Die Story liest die Stufen, sie schreibt sie nicht ab.** `Scale` setzt nur
Klassen (`.lw-h1` … `.lw-mono`) und keine Größe; `Interface` setzt jede Zeile
über `var(--fs-ui-*)` und `var(--lh-ui-*)`. Gemessen stimmen Rendering und
Token auf den Zehntelpunkt überein: 20 / 16 / 14 / 13.5 / 12.5 / 11.5 / 11 px
gegen `tokens.css:109–115` — dieselben sieben Werte. Eine einzige Zahl steht
hart in der Datei, und die ist kein Maß: `gridTemplateColumns: "180px …"`
(`:22`), die Beschriftungsspalte des Rasters.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, Exit 0, zu Beginn und am Ende. `pnpm build` bewusst **nicht** gelaufen (parallele Abnahmen schreiben nach `storybook-static`); der Lauf für diesen Stand war grün — „Storybook build completed successfully". | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/Typography.stories.tsx` liegt auf Barrel-Ebene, wie der Zuschnitt es sagt (die Probe gehört zu keiner Stufe); `:12` setzt `title: "v3/Grundlagen/Typografie"`. | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Entfällt laut Spec — die Datei enthält nur Stories. Geprüft: kein `export function` außer den Story-Objekten; die Hilfskomponente `Row` (`:17`) ist lokal, ihre Props englisch, der Dateikopf-Kommentar (`:5–11`) englisch. Story-Doks deutsch (Nutzertext). | ✓ (entfällt) |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b" src/ui/v3/Typography.stories.tsx` → keine Treffer. Farben über `var(--color-*)`, Abstände über `var(--space-*)`, Schriftgrößen über `var(--fs-ui-*)`. Einziges px: die Rasterspalte `180px` (`:22`). Kein Status, keine Label-Map. | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Vier von vier in `index.json`; Ausschlüsse in dieser Spec begründet. | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Punkt für Punkt unter dieser Tabelle. | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle vier Stories geöffnet, gemessen und als Screenshot gesehen; Konsole in allen vieren leer. Der Befund von 2026-09-03 hält: `--scale` rendert `h1` mit **40 px** (nicht 14), `h2` 30, `h3` 22, `h4` 18 — Preflight schlägt nicht mehr durch. | ✓ |
| `h1`–`h4`, `.lw-body`, `.lw-body-sm`, `.lw-caption`, `.lw-overline`, `.lw-mono` je einmal sichtbar | Story `--scale`, alle neun im DOM gefunden und gemessen: `.lw-h1` 40 px · `.lw-h2` 30 · `.lw-h3` 22 · `.lw-h4` 18 · `.lw-body` 16 · `.lw-body-sm` 14 · `.lw-caption` 13 · `.lw-overline` 12 (600, uppercase) · `.lw-mono` JetBrains Mono. Dazu die drei, die die offene Frage 1 mit „ja" beantwortet: `.lw-numeric` (tabular-nums), `.lw-lede` und `.lw-display` (beide Source Serif 4), beide als „nur lesendes Register" beschriftet. Jede Zeile trägt Name, Klasse und echten Kanzlei-Text — kein „Lorem". | ✓ |
| `grep -c "lw-" src/ui/v3/Typography.stories.tsx` ≥ 8 | Befehlsausgabe: **39**. | ✓ |
| Kein neues CSS: keine Änderung an `tokens.css` | **Mit Abweichung, die diese Spec selbst protokolliert.** Die Story fügt kein CSS und kein Token hinzu — sie belegt nur Vorhandenes. `tokens.css` wurde aber sehr wohl geändert, in `49aa023` (33 Zeilen): die Element-Selektoren `h1, .lw-h1` … wurden auf reine Klassen zurückgeführt und die Leiter `--fs-ui-*`/`--lh-ui-*` kam dazu. Genau das steht als „Befund beim Bauen — und seine Behebung" oben in dieser Spec: ohne die Änderung rendert `h1` 14 px, die Story wäre also der Nachweis eines Defekts gewesen. Der Wortlaut des Kriteriums ist damit überholt, sein Zweck („die Probe erfindet keine Schrift") erfüllt. Als ✓ gewertet — ein ✗ hieße, eine richtige Reparatur zurückzunehmen. | ✓ |
| Beide Register stehen mit ihrem Geltungsbereich da | Story `--registers`, gemessen: links `.lw-overline` „Produktiv · 13,5–14 px" + `.lw-caption` „/clients/** · /admin/** · /dashboard" über einem Absatz in `.lw-body-sm` = **14 px**; rechts „Lesend · 16 px" + „(auth)/login · /hilfe/** · Onboarding" über demselben Absatz in einem klassenlosen `<p>` = **16 px**. Derselbe Satz, zwei Register — und der klassenlose Absatz zeigt nebenbei die Regel aus dem Befund: ohne Klasse erbt ein Element die Größe seiner Fläche. | ✓ |
| Die Story steht unter `v3/Grundlagen/…`, nicht unter `Primitives` | `index.json`: `v3-grundlagen-typografie--scale` u. a., Titel `v3/Grundlagen/Typografie`. Die Gruppe hat inzwischen drei Nachbarn (`Marke`, `Farbe`, `Icons`, `Raum und Fläche`) — die Absicht der Spec, eine Ebene für Grundlagen zu eröffnen, ist aufgegangen. | ✓ |

### Prüfliste §9, Punkt für Punkt

- **Stufe und Importe** — ✓ Barrel-Ebene, kein Fachmodul; einziger Import aus
  dem Set ist `ProseCard` für `InUse` (`:3`).
- **Ersetzt ihr v1-Gegenstück** — nicht anwendbar: keine Komponente.
- **Kein Hex, kein px, keine Label-Map** — ✓ siehe Tabelle.
- **Text links, Zahlen rechts mit `tnum`, nichts zentriert** — ✓ alles
  linksbündig; `.lw-numeric` in `--scale` steht rechtsbündig auf `12ch` und
  trägt gemessen `lining-nums tabular-nums`.
- **Zeilenhöhe** — nicht anwendbar.
- **Farbe nur als Kritikalitätsstufe** — ✓ keine semantische Farbe in der
  Probe; Überschriften in `--color-primary`, Beischriften in
  `--color-text-subtle`.
- **Farbiger Zustand mit Wort** — nicht anwendbar: kein Zustand.
- **Fünf Zustände** — begründet ausgeschlossen.
- **Kontrast** — ✓ die Probe benutzt nur Text-Token mit hinterlegtem
  Kontrastwert (`--color-text` · `-muted` · `-subtle`, `--color-primary`).
- **Tastatur / Hover** — nicht anwendbar: nichts ist klickbar.
- **Icons** — keine; keine Emoji, keine Unicode-Zeichen.
- **Versalien (A2)** — ✓ mit Begründung: Versalien treten zweimal auf,
  `.lw-overline` und das Feld-Label in `--interface`. A2 verbietet Versalien
  am **Spaltenkopf**; Overline und Feld-Label sind eigene, in `tokens.css`
  geführte Stufen. Kein Verstoß.
- **Karte** — ✓ `InUse` steht in einer `ProseCard`.
- **Texte T1–T5** — ✓ echte Kanzlei-Sätze („Offene Posten 2026", „Sachverhalt
  RE-4471 · Bürobedarf Meier GmbH", Konto 6815 / 70000 / BU 9), Begriffe aus
  dem GLOSSARY, keine Anrede nötig, kein Ausrufezeichen.
- **Story im richtigen Pfad** — ✓ `v3/Grundlagen/Typografie`.
- **In §11 auf v2 gesetzt** — ✓ `docs/design-guidelines.md:417` führt die
  Grundlagen-Zeile als „v2 (0037, 0055)".

### Anmerkungen des Abnehmenden

1. **Das Kriterium „keine Änderung an `tokens.css`" ist überholt** und
   widerspricht dem eigenen Abschnitt „Befund beim Bauen". Wer die Spec später
   liest, stolpert darüber. Beim nächsten Anfassen den Wortlaut nachziehen:
   gemeint war „die Story fügt kein CSS hinzu".
2. **`.lw-mono` erbt seine Größe.** Gemessen 14,72 px in `--scale` (relativ zur
   Fläche), während `.lw-caption` daneben fest auf 13 px steht. Das ist so
   gewollt (Mono soll sich einfügen), fällt in der Probe aber auf, weil die
   Mono-Zeile größer wirkt als die Beischrift daneben. Kein Mangel — notiert,
   falls jemand dieselbe Beobachtung macht.
3. **Die Leiter ist erst zur Hälfte eingezogen.** Der Befund oben sagt es
   schon: nachgezogen sind `Markdown` und `Button`, der Rest von `v3.css` hält
   seine Zahlen weiter selbst (`.v2amount--sm: 12.5px`, `.v2time--md: 13.5px`
   usw. — Werte, die es als `--fs-ui-sm`/`--fs-ui` bereits gibt). Das ist der
   offene Rest, den `Interface` erst nützlich macht; gehört als eigene Aufgabe
   ans Set, nicht in diese.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine
(die drei Anmerkungen sind Befunde, keine Mängel dieser Aufgabe)
