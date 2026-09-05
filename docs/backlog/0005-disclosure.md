# 0005 · Disclosure

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Details ausklappen ist fachfrei |
| Quelle | `docs/v3-backlog.md` — „Danach" (34 Stellen in 20 Dateien) |
| Ersetzt | natives `<details>/<summary>` in `RohdatenTab`, `StapelVergleich`, `PurposeDisplay`, `RegelwerkTab` u. a. |
| Blockiert | die Detail- und Drawer-Umzüge der Welle 1 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Vieles in Ludwig ist nur manchmal interessant: die Rohdaten hinter einer
Rechnung, das Regelwerk hinter einem Vorschlag, der technische Verlauf. Heute
klappt das 34-mal ein natives `<details>` auf — jedes mit eigenem Dreieck,
eigener Beschriftung, eigenem Abstand. Mal steht die Zahl der Einträge in der
Zusammenfassung, mal nicht.

## Einordnung

- **Wiederverwenden:** `ExpandableRow` („A small extra detail for a row that
  is read and collapsed again") deckt genau die Tabellenzeile ab — das
  Ausklappen bleibt im Zeilenraster. Freistehend, in einer Karte oder einem
  Drawer, passt es nicht: dort gibt es keine Zeile, in die eingerückt wird.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, 34 belegte
  Stellen. In ~15 Zeilen an der Aufrufstelle wäre es zwar baubar, aber genau
  das ist 34-mal passiert und auseinandergelaufen.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** natives `<details>/<summary>` — das trägt Tastatur,
  Screenreader und den Aufklapp-Zustand ohne eine Zeile JavaScript.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `summary` | `ReactNode` | ja | Was drinsteht, in einem Halbsatz — nie „Details" | `Filled` |
| `count` | `number` | nein | Wie viele Einträge drin sind; steht neben der Zusammenfassung | `WithCount` |
| `children` | `ReactNode` | ja | Der Inhalt | `Filled` |
| `defaultOpen` | `boolean` | nein | Offen beim ersten Rendern | `DefaultOpen` |
| `tone` | `"default" \| "quiet"` | nein | `quiet` für technische Beigaben (Rohdaten, Verlauf) | `Variants` |
| `group` | `string` | nein | Aufklapper mit demselben `group` schließen einander — natives `name` auf `<details>` (Erweiterung A3) | `Accordion` |

**Kann bewusst nicht:** von außen gesteuert werden (kein `open`/`onToggle`) —
wer den Zustand braucht, hat einen anderen Fall und nimmt `MasterDetail` oder
`Dialog`. Ebenfalls nicht: einen offenen Abschnitt erzwingen — `group` schließt
die Nachbarn, hält aber keinen offen; alle drei zugeklappt ist ein gültiger
Zustand des nativen `name`.

## Erweiterung A3 · „nur einer offen"

Aus `docs/backlog/0034-shadcn-abgleich.md` §A3 (shadcn-Abgleich, Zeile
„Accordion"): shadcns Accordion ist Radix mit Zustand; der Browser kann es
seit Baseline 2024 selbst — `<details name="x">` schließt die Geschwister mit
demselben `name`. Regel §3.2: **eine** Prop, die eine wiederkehrende
Designentscheidung trägt („diese Abschnitte gehören zusammen"), in einem
Halbsatz in der `@when`-Zeile zu sagen.

- Keine Zeile JavaScript, kein Zustand — die Komponente bleibt
  Server-Component.
- Das `@when` nennt den Gruppenfall in einem Halbsatz.
- Eine Story `Accordion`: drei Aufklapper, ein `group`, der zweite
  `defaultOpen`.

**Kriterium (A3):** Öffnen des dritten schließt den zweiten, ohne Klick auf
ihn (Story `Accordion`, im Browser beobachtet).

## Verhalten

Server-Component — `<details>` braucht kein JavaScript.

- **Tastatur:** Enter und Leertaste klappen auf und zu; das kann das native
  Element und wird nicht nachgebaut.
- **Hover:** die Zusammenfassungszeile bekommt eine Tonstufe Hintergrund (§2).
- **Marker:** ein Lucide-Chevron, der sich beim Öffnen dreht; der native
  Dreiecks-Marker wird abgeschaltet. Kein Unicode-Pfeil (T9).
- **Zustände:** kein Lade- oder Fehlerzustand. Ist der Inhalt leer, gehört
  der Aufklapper gar nicht erst hin — das entscheidet der Aufrufer.

## Stories

Titel `v3/Primitives/Fläche/Disclosure`. Abgeleitet nach §6: 1 Zustand
+ 1 Enum (`tone`) + 1 Layout-Boolean (`defaultOpen`) + 0 Callbacks
+ 1 „im Einsatz" + 1 Rand (langer Inhalt) = 5, mit der Erweiterung A3
(`group`) = 6.

| Story | Beweist |
|---|---|
| `Filled` | zu, mit sprechender Zusammenfassung |
| `WithCount` | Zahl der Einträge neben der Zusammenfassung |
| `DefaultOpen` | offen beim ersten Rendern |
| `Variants` | `default` und `quiet` nebeneinander |
| `InUse` | zwei Aufklapper in einer `Card`, darunter Rohdaten in `<pre>` |
| `Accordion` | drei Aufklapper, ein `group`: der offene schließt beim Öffnen des nächsten (A3) |

Nicht anwendbar: `Leer` (ohne Inhalt wird der Aufklapper nicht gerendert),
`Laedt`, `Fehler` (der Inhalt bringt seinen eigenen Zustand mit).

## Abnahmekriterien

> Wiederhergestellt am 2026-09-05. Commit `64fbe27` („Abnahme B und C") hatte
> diesen Abschnitt und die „Offenen Fragen" beim Eintragen der Abnahme-Tabelle
> mitgelöscht; ohne sie ist die Aufgabe nicht abnehmbar. Text unverändert aus
> `git show 703a0ab:docs/backlog/0005-disclosure.md`.

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Enter und Leertaste klappen auf und zu, ohne eigenen Tastatur-Code (Story `Filled`)
- [ ] Der Marker ist ein Lucide-Chevron, kein Unicode-Zeichen (Regel T9)
- [ ] Die Datei trägt kein `"use client"`
- [ ] `count` erscheint nur, wenn gesetzt (Story `Filled` vs. `WithCount`)
- [ ] Ersetzt das `<details>` in `RohdatenTab` ohne Funktionsverlust

## Offene Fragen

1. Soll `summary` bei `quiet` kleiner gesetzt sein? *Ohne Antwort: ja, eine
   Stufe kleiner und in `--color-text-muted` — technische Beigaben sollen
   nicht mit dem Inhalt konkurrieren.*

## Abnahme

Zweite Abnahme (fremder Prüfer, 2026-09-05), Tabelle neu geschrieben.
Storybook Port 6107, Chromium 1440×900.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0, zu Beginn und am Ende. `pnpm build` bewusst nicht gestartet (schreibt nach `storybook-static`, parallele Abnahmen); zitiert wird der grüne Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Disclosure.tsx` neben `Disclosure.stories.tsx`; `Disclosure.stories.tsx:7` = `v3/Primitives/Fläche/Disclosure` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Exporte: `DisclosureTone` (Typ) und `Disclosure` (`Disclosure.tsx:21`) mit `@when`/`@instead` in `Disclosure.tsx:15–20`; die `@when`-Zeile nennt den Gruppenfall in einem Halbsatz („with `group` a set of sections of which only one stays open") wie A3 verlangt. Bezeichner, Kommentare und JSDoc englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize" src/ui/v3/primitives/Disclosure.tsx` → keine Zeile; kein Status im Baustein | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--with-count`, `--default-open`, `--variants`, `--in-use`, `--accordion` — alle sechs der Ableitung. `Leer`/`Laedt`/`Fehler` im Abschnitt „Stories" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Hover auf der Zusammenfassung: `background` wechselt von `rgba(0,0,0,0)` auf `rgb(244,246,248)` (`--color-bg-soft`), eine Tonstufe, nichts wächst. Fokus: `.v2disc__sum` ist per Tab erreichbar. Text links, nichts zentriert; keine Farbe als alleiniges Signal — `quiet` unterscheidet sich zusätzlich am Wort. Icon: `width 14`, `stroke-width 1.5`, `aria-hidden="true"`. Kein Emoji, kein Unicode-Zeichen (`/[✓✗⚠●▶▸→←]/` über `body.innerText` → `false`) | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories geöffnet und bedient: auf- und zugeklappt per Maus und per Tastatur, `Accordion` mit drei Klicks durchgespielt | ✓ |

**Variabel**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Enter und Leertaste klappen auf und zu, ohne eigenen Tastatur-Code | `Disclosure.tsx` enthält keinen `onKeyDown`/`onKeyUp` — das Aufklappen kommt vom nativen `<details>`. `--filled` mit echter Tastatur: Tab fokussiert `.v2disc__sum`; Leertaste → `details.open` `false → true → false`; Enter → `true → false`. Beide Tasten sind damit belegt (2026-09-03 war Enter „Grenze der Automatisierung" geblieben) | ✓ |
| Der Marker ist ein Lucide-Chevron, kein Unicode-Zeichen | DOM: `svg.lucide.lucide-chevron-right.v2disc__chev`, `width 14`, `stroke-width 1.5`, `aria-hidden="true"`. `.v2disc__sum` hat `list-style: none` (`v3.css:1832`-Muster) — im Bild kein natives Dreieck. Beim Öffnen `transform: matrix(0,1,-1,0,0,0)` = 90° | ✓ |
| Die Datei trägt kein `"use client"` | `grep -n "use client" src/ui/v3/primitives/Disclosure.tsx` → keine Zeile; Server-Component | ✓ |
| `count` erscheint nur, wenn gesetzt | `--filled`: `.v2disc__count` nicht im DOM. `--with-count`: `.v2disc__count` = „14", steht **in** der `summary` neben dem Text, nicht darin verbaut | ✓ |
| Ersetzt das `<details>` in `RohdatenTab` ohne Funktionsverlust | Der Umbau der 34 Fundorte findet in `ludwig/app` statt, hier nicht ausführbar. Im eigenen Repo ist der 2026-09-03 gemeldete Platzhalter weg: `grep -rn 'spec="0005"' src/` → kein Treffer | offen (App) |

**Erweiterung A3**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Öffnen des dritten schließt den zweiten, ohne Klick auf ihn (Story `Accordion`) | `--accordion`, alle drei mit `name="begruendung"`. Start: `[zu, offen, zu]` (der zweite ist `defaultOpen`). Klick auf die dritte Zusammenfassung → `[zu, zu, offen]` — der zweite ist zu, ohne ihn angefasst zu haben. Klick auf die erste → `[offen, zu, zu]`. Kein Zustand in der Komponente, kein `useState` | ✓ |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte:

1. Der Umbau der 34 `<details>`-Fundorte in `ludwig/app` — hier nicht
   erfüllbar, hält die Aufgabe nicht auf.
2. Kein Mangel, aber notiert: die **Offene Frage 1** ist nur halb umgesetzt.
   `quiet` steht in `--color-text-muted` (gemessen `rgb(92,92,92)` gegen
   `rgb(45,45,45)`), aber **nicht** eine Stufe kleiner — beide
   Zusammenfassungen sind 13.5 px. Entweder die Größe nachziehen oder die
   Antwort in der Spec korrigieren.
3. `.v2disc__chev` trägt `transition: transform` (`v3.css:1700`) ohne
   `@media (prefers-reduced-motion: reduce)`. Das ist kein Sonderfall dieser
   Aufgabe — `.v2chev`, `.v2drawer` und `.v2drawer__scrim` stehen genauso da;
   in `v3.css` sind nur `.v2skel`, `.v2spin` und `.v2toast` abgesichert.
   Gehört als eigene Aufgabe ans Set, nicht in diese Spec.

**Beiläufig geprüft (0087).** Der Marker kommt jetzt über
`ActionIcon action="collapse"`; im DOM steht weiter `lucide-chevron-right`,
`width 14`, `stroke-width 1.5` — dasselbe Zeichen an derselben Stelle wie vor
`f58caa2`. Nichts verschwunden, nichts gesprungen.
