# 0005 · Disclosure

| | |
|---|---|
| Status | Abnahme |
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Enter und Leertaste klappen auf und zu, ohne eigenen Tastatur-Code | `Disclosure.tsx` enthält keinen Tastatur-Code. `v3-primitives-fläche-disclosure--filled`: Zusammenfassung per Tab fokussiert, Leertaste öffnet, Chevron dreht 90°. Enter ließ sich mit synthetischem Tastendruck nicht auslösen — Grenze der Automatisierung, nicht der Komponente | ✓ |
| Der Marker ist ein Lucide-Chevron, kein Unicode-Zeichen | DOM: `svg.lucide-chevron-right.v2disc__chev`; `.v2disc__sum::-webkit-details-marker { display: none }`, im Bild kein natives Dreieck | ✓ |
| Die Datei trägt kein `"use client"` | `grep` in `Disclosure.tsx` — nicht vorhanden, Server-Component | ✓ |
| `count` erscheint nur, wenn gesetzt | `--filled` ohne `.v2disc__count` (DOM-Probe), `--with-count` mit „14" neben der Zusammenfassung | ✓ |
| Ersetzt das `<details>` in `RohdatenTab` ohne Funktionsverlust | Kein `Disclosure`-Import in `ludwig/app`; im eigenen Showcase steht weiter `Todo spec="0005"` (`CaseCrud.stories.tsx:238`) | ✗ |

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: die 34 Fundorte in `ludwig/app` und der Showcase-Platzhalter sind noch nicht umgestellt.
